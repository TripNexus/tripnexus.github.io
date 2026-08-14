/* ═══════════════════════════════════════════════════════════════
   TripNexus: roteiro sugerido e assistente de viagens
   O roteiro é montado com sítios reais obtidos por geo-pesquisa na
   Wikipédia (a partir das coordenadas da cidade), com fotografias
   reais e sem chave nem custo. Os lugares são distribuídos pelos
   dias da estadia. O assistente conversa através do backend
   (/assistente, Cloudflare Workers AI); sem backend, fica escondido.
   ═══════════════════════════════════════════════════════════════ */

/* páginas que a geo-pesquisa devolve mas não são sítios a visitar */
const ROTEIRO_EXCLUIR = /aeroporto|airport|estação|station|metro|metropolitano|linha |rua |avenida |street|hospital|universidade|university|escola|school|câmara municipal|freguesia|distrito|arrondissement|bairro|quarter|autoestrada|highway|ponte ferrovi|terminal|campus|instituto|embaixada|embassy|consulado|cemitério|cemetery|centro comercial|shopping/i;

const cacheRoteiro = {};

/* Geo-pesquisa na Wikipédia: devolve sítios próximos com fotografia.
   Tenta primeiro em português; se vier pouca coisa, completa em inglês. */
async function lugaresPerto(cidade){
  const chave = cidade.n;
  if(cacheRoteiro[chave]) return cacheRoteiro[chave];
  const buscar = async lang => {
    const ps = new URLSearchParams({
      action:'query', format:'json', origin:'*',
      generator:'geosearch',
      ggscoord: cidade.la + '|' + cidade.lo,
      ggsradius:'10000', ggslimit:'50',
      prop:'pageimages|extracts|coordinates',
      piprop:'thumbnail', pithumbsize:'420',
      exintro:'1', explaintext:'1', exsentences:'2'
    });
    const r = await fetch('https://' + lang + '.wikipedia.org/w/api.php?' + ps);
    if(!r.ok) return [];
    const j = await r.json();
    const paginas = (j.query && j.query.pages) ? Object.values(j.query.pages) : [];
    return paginas.map(p => ({
      nome: p.title,
      texto: (p.extract || '').trim(),
      foto: p.thumbnail && p.thumbnail.source,
      la: p.coordinates && p.coordinates[0] && p.coordinates[0].lat,
      lo: p.coordinates && p.coordinates[0] && p.coordinates[0].lon,
      lang
    }));
  };
  let lista = [];
  try{ lista = await buscar('pt'); }catch(e){ lista = []; }
  if(lista.filter(l => l.foto).length < 6){
    try{
      const en = await buscar('en');
      const vistos = new Set(lista.map(l => l.nome.toLowerCase()));
      for(const l of en) if(!vistos.has(l.nome.toLowerCase())) lista.push(l);
    }catch(e){ /* fica só o que houver */ }
  }
  /* só sítios com fotografia e descrição, e sem os que não se visitam */
  const bons = lista
    .filter(l => l.foto && l.texto && !ROTEIRO_EXCLUIR.test(l.nome))
    .sort((a, b) => b.texto.length - a.texto.length)
    .slice(0, 24);
  cacheRoteiro[chave] = bons;
  return bons;
}

/* distribui os lugares pelos dias (3 por dia, no máximo 5 dias mostrados) */
function distribuirPorDias(lugares, noites){
  const dias = Math.max(1, Math.min(5, noites || 1));
  const porDia = Math.min(3, Math.max(2, Math.ceil(lugares.length / dias)));
  const blocos = [];
  for(let d = 0; d < dias; d++){
    const fatia = lugares.slice(d * porDia, (d + 1) * porDia);
    if(fatia.length) blocos.push(fatia);
  }
  return blocos;
}

function cartaoLugar(l){
  const wiki = 'https://' + l.lang + '.wikipedia.org/wiki/' + encodeURIComponent(l.nome.replace(/ /g, '_'));
  const texto = l.texto.length > 145 ? l.texto.slice(0, 145).replace(/\s+\S*$/, '') + '…' : l.texto;
  return `<a class="lugar" href="${wiki}" target="_blank" rel="noopener">
    <img class="lugar-foto" src="${escaparHtml(l.foto)}" alt="${escaparHtml(l.nome)}" loading="lazy">
    <div class="lugar-info">
      <div class="lugar-nome">${escaparHtml(l.nome)}</div>
      <div class="lugar-texto">${escaparHtml(texto)}</div>
    </div>
  </a>`;
}

/* Preenche o bloco do roteiro na página de resultados. */
async function desenharRoteiro(destino, noites){
  const bloco = document.getElementById('bloco-roteiro');
  if(!bloco || !destino || destino.la == null) return;
  bloco.innerHTML = `<div class="bloco-titulo">🗺 Roteiro sugerido para ${escaparHtml(destino.n)}</div>
    <p class="bloco-sub">A preparar sugestões de sítios a visitar…</p>`;
  let lugares = [];
  try{ lugares = await lugaresPerto(destino); }catch(e){ lugares = []; }
  if(!lugares.length){ bloco.hidden = true; return; }
  const blocos = distribuirPorDias(lugares, noites);
  bloco.hidden = false;
  bloco.innerHTML = `
    <div class="bloco-titulo">🗺 Roteiro sugerido para ${escaparHtml(destino.n)}</div>
    <p class="bloco-sub">Sugestão de percurso para ${blocos.length} ${blocos.length === 1 ? 'dia' : 'dias'},
    com os sítios mais conhecidos perto do centro. Fotografias e descrições da Wikipédia.</p>
    ${blocos.map((dia, i) => `
      <div class="roteiro-dia">
        <div class="roteiro-dia-titulo">Dia ${i + 1}</div>
        <div class="roteiro-lugares">${dia.map(cartaoLugar).join('')}</div>
      </div>`).join('')}
    <p class="bloco-sub">Sugestão automática, para lhe dar um ponto de partida. Confirme horários e bilhetes nos
    sítios oficiais de cada local.</p>`;
}

/* ── assistente de viagens (Workers AI, através do backend) ───── */
const CHAT = {historico:[], aberto:false, ocupado:false};

function contextoPesquisa(){
  try{
    if(typeof ESTADO === 'undefined' || !ESTADO.destino) return '';
    const p = [];
    if(ESTADO.origem) p.push('origem ' + ESTADO.origem.n);
    p.push('destino ' + ESTADO.destino.n);
    if(ESTADO.ida) p.push('ida ' + formatarDataCurta(ESTADO.ida));
    if(ESTADO.volta && ESTADO.tipo !== 'so-ida') p.push('regresso ' + formatarDataCurta(ESTADO.volta));
    return p.join(', ');
  }catch(e){ return ''; }
}

function desenharChat(){
  const corpo = document.getElementById('chat-corpo');
  if(!corpo) return;
  corpo.innerHTML = CHAT.historico.map(m =>
    `<div class="chat-msg ${m.papel === 'bot' ? 'do-bot' : 'do-utilizador'}">${escaparHtml(m.texto)}</div>`
  ).join('') + (CHAT.ocupado ? '<div class="chat-msg do-bot chat-espera">a escrever…</div>' : '');
  corpo.scrollTop = corpo.scrollHeight;
}

async function perguntarAoAssistente(pergunta){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  if(!base) return;
  CHAT.historico.push({papel:'utilizador', texto: pergunta});
  CHAT.ocupado = true;
  desenharChat();
  try{
    const r = await fetch(base + '/assistente', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({pergunta, contexto: contextoPesquisa(), historico: CHAT.historico.slice(0, -1)})
    });
    const dados = await r.json().catch(() => null);
    CHAT.ocupado = false;
    if(dados && dados.resposta) CHAT.historico.push({papel:'bot', texto: dados.resposta});
    else CHAT.historico.push({papel:'bot', texto:'Não consegui responder agora. Tente outra vez daqui a pouco.'});
  }catch(e){
    CHAT.ocupado = false;
    CHAT.historico.push({papel:'bot', texto:'Não consegui contactar o assistente. Verifique a ligação à Internet.'});
  }
  desenharChat();
}

(function ligarChat(){
  const abrir = document.getElementById('btn-chat');
  const painel = document.getElementById('painel-chat');
  if(!abrir || !painel) return;
  /* sem backend configurado, o assistente não aparece */
  if(!(window.TRIPNEXUS_API || '').trim()){ abrir.hidden = true; return; }
  abrir.hidden = false;
  const alternar = mostrar => {
    CHAT.aberto = mostrar;
    painel.hidden = !mostrar;
    abrir.setAttribute('aria-expanded', mostrar ? 'true' : 'false');
    if(mostrar){
      if(!CHAT.historico.length){
        CHAT.historico.push({papel:'bot', texto:'Olá! Sou o assistente do TripNexus. Pergunte-me o que quiser sobre destinos, roteiros, melhor altura para viajar ou dicas práticas.'});
      }
      desenharChat();
      const campo = document.getElementById('chat-campo');
      if(campo) campo.focus();
    }
  };
  abrir.onclick = () => alternar(painel.hidden);
  const fechar = document.getElementById('chat-fechar');
  if(fechar) fechar.onclick = () => alternar(false);
  const form = document.getElementById('chat-form');
  if(form) form.onsubmit = e => {
    e.preventDefault();
    const campo = document.getElementById('chat-campo');
    const texto = (campo.value || '').trim();
    if(!texto || CHAT.ocupado) return;
    campo.value = '';
    perguntarAoAssistente(texto);
  };
})();
