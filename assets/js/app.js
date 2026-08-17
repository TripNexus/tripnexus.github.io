/* ═══════════════════════════════════════════════════════════════
   TripNexus: aplicação (interface e ligação de tudo)
   ═══════════════════════════════════════════════════════════════ */

const ESTADO = {
  tipo:'ida-volta',                       // ida-volta | so-ida | multi
  pax:{adultos:1, criancas:0, bebes:0},
  classe:'economica',
  transportes:['metro'],
  alojamento:['hotel','airbnb'],
  extras:[],                              // bagagem de porão, cabina, seguro
  origem:null, destino:null, ida:null, volta:null,
  trocos:[],                              // várias cidades
  explorar:false                          // modo «Para onde?» vazio
};

let mapaResultados = null, mapaOfertas = null, mapaExplorar = null, ofertasDesenhadas = false;

/* ── utilidades de interface ─────────────────────────────────── */
function normalizar(t){
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
/* ── logótipos ────────────────────────────────────────────────
   Um serviço de ícones sozinho não chega. O do Google está em várias listas
   de bloqueio de publicidade e seguimento, e basta ter um bloqueador activo
   para todos os logótipos do site caírem ao mesmo tempo na inicial da
   empresa — que era exactamente o que se via. A correcção não é escolher
   outro serviço, é não depender de nenhum: tenta-se uma cadeia de fontes
   independentes e só quando todas falharem aparece o monograma.

   As alternativas viajam num atributo, separadas por «|», que não ocorre
   dentro de um URL. */
function proximoLogotipo(img){
  const restantes = (img.dataset.fontes || '').split('|').filter(Boolean);
  if(restantes.length){
    img.dataset.fontes = restantes.slice(1).join('|');
    img.src = restantes[0];
    return;
  }
  /* esgotadas as fontes, o monograma que está por baixo fica à vista */
  img.remove();
}
/* cor estável a partir do nome: a mesma empresa fica sempre com a mesma, e
   duas empresas com a mesma inicial não ficam com o mesmo quadrado */
function corDoNome(nome){
  let h = 0;
  for(let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % 360;
  return h;
}
/* Caixa de logótipo: o monograma está sempre lá, por baixo, e a imagem
   cobre-o quando carrega. Assim não há troca de «display» nem um instante
   em branco à espera da imagem. */
function caixaLogotipo(fontes, nome, opts){
  const o = opts || {};
  const lista = (fontes || []).filter(Boolean);
  const rotulo = escaparHtml(o.titulo || nome || '');
  const inicial = escaparHtml((nome || '?').trim()[0] || '?').toUpperCase();
  return `<span class="icone-parceiro" title="${rotulo}">
    <span class="mono" style="background:hsl(${corDoNome(nome || '?')} 52% 40%)">${inicial}</span>
    ${lista.length ? `<img class="${o.foto ? 'foto' : 'logo'}" src="${escaparHtml(lista[0])}" alt="${rotulo}" loading="lazy"
         data-fontes="${escaparHtml(lista.slice(1).join('|'))}" onerror="proximoLogotipo(this)">` : ''}
  </span>`;
}
/* Três serviços independentes mais o favicon servido pelo próprio parceiro:
   para os logótipos desaparecerem todos, teriam de falhar os quatro. */
function fontesDoDominio(dom){
  if(!dom) return [];
  return [
    'https://icons.duckduckgo.com/ip3/' + dom + '.ico',
    'https://www.google.com/s2/favicons?sz=64&domain=' + dom,
    'https://' + dom + '/favicon.ico'
  ];
}
function iconeParceiro(chave){
  const p = PARCEIROS[chave];
  return caixaLogotipo(fontesDoDominio(p.dom), p.nome);
}
/* Logótipo de companhia aérea pelo código IATA. O pics.avs.io é o CDN da
   própria Travelpayouts, de quem já recebemos as tarifas. */
function iconeCompanhia(codigo, nome){
  const c = String(codigo || '').toUpperCase();
  return caixaLogotipo(c ? ['https://pics.avs.io/80/80/' + c + '.png'] : [], nome || c || '?');
}
function etiquetaCupao(cupao){
  if(!cupao) return '';
  return `<span class="cupao" title="${cupao.nota || ''}">🎟 ${cupao.codigo} ${cupao.texto}</span>`;
}
/* Distingue claramente um preço estimado de um preço real: o valor leva o
   sinal «≈», um selo explicativo e o botão convida a ver o preço real no
   parceiro, em vez de sugerir que esta é a oferta definitiva. */
function linhaOferta(q, opts){
  const p = PARCEIROS[q.parceiro];
  const o = opts || {};
  const est = o.estimativa !== false;   /* por omissão, é estimativa */
  return `<div class="linha-oferta ${o.melhor ? 'melhor' : ''}">
    ${iconeParceiro(q.parceiro)}
    <div class="oferta-info">
      <div class="oferta-nome">${p.nome}${o.tag ? ` <span class="alt-tag">${o.tag}</span>` : ''}${o.melhor ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
      ${o.detalhe ? `<div class="oferta-detalhe">${o.detalhe}</div>` : ''}
      ${etiquetaCupao(q.cupao)}
    </div>
    <div class="oferta-preco">
      ${q.cupao ? `<div class="preco-antes">${euros(q.preco)}</div>` : ''}
      <div class="preco-actual${est ? ' preco-estimado' : ''}">${est ? '≈ ' : ''}${euros(q.precoFinal)}</div>
      ${est ? '<div class="selo-estimativa" title="Valor calculado para comparação. O preço real é confirmado no site do parceiro.">estimativa</div>' : ''}
    </div>
    <a class="btn-ver" href="${o.url || '#'}" target="_blank" rel="noopener">${est ? 'Ver preço real' : 'Ver oferta'}</a>
  </div>`;
}
/* Linha de parceiro sem preço nenhum. Serve para as secções em que não há
   fonte de preços reais: mostrar um valor inventado seria pior do que não
   mostrar valor, porque dá ao utilizador uma confiança que não é devida. */
function linhaSemPreco(chave, opts){
  const p = PARCEIROS[chave];
  const o = opts || {};
  return `<div class="linha-oferta">
    ${iconeParceiro(chave)}
    <div class="oferta-info">
      <div class="oferta-nome">${p.nome}</div>
      ${o.detalhe ? `<div class="oferta-detalhe">${o.detalhe}</div>` : ''}
    </div>
    <a class="btn-ver" href="${o.url || '#'}" target="_blank" rel="noopener">Ver preços</a>
  </div>`;
}
/* ── resumo da viagem ─────────────────────────────────────────
   O total tem de acompanhar os preços reais: até aqui somava sempre as
   estimativas do motor local, mesmo com os blocos ao lado já a mostrar
   valores reais, o que dava dois números diferentes no mesmo ecrã.
   Guarda-se aqui o que a última pesquisa calculou; o live.js deposita os
   preços reais em PRECOS_REAIS e manda redesenhar. */
let RESUMO = null;
const PRECOS_REAIS = {voo: null, alojamento: null, carro: null};

function limparPrecosReais(){
  PRECOS_REAIS.voo = PRECOS_REAIS.alojamento = PRECOS_REAIS.carro = null;
}
/* chamada pelo live.js sempre que uma fonte real responde */
function registarPrecoReal(seccao, preco, nome){
  /* «widget» é o caso do carro: há preços reais, mas só dentro do quadro do
     parceiro, que não nos diz o valor */
  if(preco !== 'widget' && !(preco > 0)) return;
  PRECOS_REAIS[seccao] = preco === 'widget' ? 'widget' : {preco, nome: nome || ''};
  const cx = document.getElementById('bloco-resumo');
  if(cx) cx.innerHTML = blocoResumo();
  if(RESUMO && typeof montarAccoesResumo === 'function'){
    try{ montarAccoesResumo(document, RESUMO.ctx, RESUMO.melhorVoo); }catch(e){}
  }
}

function blocoResumo(){
  const R = RESUMO;
  if(!R) return '';
  /* cada parcela usa o preço real quando existe, e diz-se qual é qual */
  const linha = (icone, rotulo, estimado, real) => {
    if(estimado == null && !real) return {html:'', valor:0, real:false};
    const usaReal = !!real;
    const valor = usaReal ? real.preco : estimado.preco;
    const quem = usaReal ? (real.nome || 'preço real') : estimado.nome;
    return {
      valor, real: usaReal,
      html: `<div class="resumo-linha">
        <span>${icone} ${rotulo} <span class="resumo-fonte ${usaReal ? 'real' : ''}">${escaparHtml(quem)}</span></span>
        <strong>${usaReal ? '' : '≈ '}${euros(valor)}</strong></div>`
    };
  };
  /* o widget do parceiro mostra preços reais mas não no-los diz: pôr aqui a
     estimativa ao lado de um quadro com valores verdadeiros seria contradizer-se,
     por isso a linha fica sem valor e fora da soma */
  const carro = PRECOS_REAIS.carro === 'widget'
    ? {valor: 0, real: true, html: `<div class="resumo-linha">
        <span>🚗 Carro <span class="resumo-fonte real">preços reais no quadro do parceiro</span></span>
        <strong>—</strong></div>`}
    : linha('🚗', 'Carro', R.carro, PRECOS_REAIS.carro);
  const partes = [
    linha('✈', 'Voo', R.voo, PRECOS_REAIS.voo),
    /* com preço real o tipo pode não ser o que o motor local escolheu */
    linha('🏨', PRECOS_REAIS.alojamento ? 'Alojamento' : (R.alojRotulo || 'Alojamento'),
          R.aloj, PRECOS_REAIS.alojamento),
    carro,
    linha('🚇', 'Transportes públicos', R.tp, null)
  ].filter(p => p.html);
  const extras = R.extras.map(x => ({
    valor: x.total, real: false,
    html: `<div class="resumo-linha"><span>${x.nome} <span class="resumo-fonte">${x.detalhe}</span></span><strong>≈ ${euros(x.total)}</strong></div>`
  }));
  const todas = [...partes, ...extras];
  const total = todas.reduce((s, p) => s + p.valor, 0);
  const porEstimar = todas.filter(p => !p.real).length;
  const n = R.pax;
  return `
    <h3 class="bloco-titulo">🧾 Total da viagem</h3>
    ${todas.map(p => p.html).join('')}
    <div class="resumo-total"><span>Total (${n} ${n === 1 ? 'passageiro' : 'passageiros'})</span>
      <span class="valor-total">${porEstimar ? '≈ ' : ''}${euros(total)}</span></div>
    <p class="resumo-nota">${porEstimar
      ? 'Combinação mais barata encontrada. As parcelas marcadas com «≈» ainda são estimativas; as restantes são preços reais.'
      : '<strong>Todas as parcelas são preços reais.</strong> Combinação mais barata encontrada, com cupões já descontados.'}</p>
    <div class="accoes-resumo" id="accoes-resumo"></div>`;
}

function totalPax(){ return ESTADO.pax.adultos + ESTADO.pax.criancas + ESTADO.pax.bebes; }
/* as caixas de selecção usam «airbnb»; o motor usa o tipo «casa» */
function tiposAlojamento(){ return ESTADO.alojamento.map(t => t === 'airbnb' ? 'casa' : t); }

/* ── navegação entre vistas ──────────────────────────────────── */
function mostrarVista(nome){
  for(const v of ['pesquisa','ofertas','parceiros']){
    document.getElementById('vista-' + v).hidden = (v !== nome);
  }
  document.querySelectorAll('.nav-btn[data-vista]').forEach(b =>
    b.classList.toggle('activo', b.dataset.vista === nome));
  window.scrollTo({top:0, behavior:'smooth'});
  if(nome === 'ofertas'){ desenharOfertas(); }
}
document.querySelectorAll('.nav-btn[data-vista]').forEach(b =>
  b.addEventListener('click', () => mostrarVista(b.dataset.vista)));
document.getElementById('logo-link').addEventListener('click', e => { e.preventDefault(); mostrarVista('pesquisa'); });

/* ── dropdowns da linha de opções ────────────────────────────── */
document.querySelectorAll('.dropdown').forEach(dd => {
  dd.querySelector('.dd-btn').addEventListener('click', e => {
    e.stopPropagation();
    const aberto = dd.classList.contains('aberto');
    document.querySelectorAll('.dropdown.aberto').forEach(x => x.classList.remove('aberto'));
    if(!aberto) dd.classList.add('aberto');
  });
  dd.querySelector('.painel').addEventListener('click', e => e.stopPropagation());
});
document.addEventListener('click', () =>
  document.querySelectorAll('.dropdown.aberto').forEach(x => x.classList.remove('aberto')));

function actualizarRotulos(){
  const nomesTipo = {'ida-volta':'Ida e volta','so-ida':'Só ida','multi':'Várias cidades'};
  document.querySelector('#dd-tipo .dd-rotulo').textContent = nomesTipo[ESTADO.tipo];
  const n = totalPax();
  document.querySelector('#dd-passageiros .dd-rotulo').textContent = n + (n === 1 ? ' passageiro' : ' passageiros');
  document.querySelector('#dd-classe .dd-rotulo').textContent = NOME_CLASSE[ESTADO.classe];
  const nt = ESTADO.transportes.length;
  document.querySelector('#dd-transportes .dd-rotulo').textContent = 'Transportes' + (nt ? ' (' + nt + ')' : '');
  const na = ESTADO.alojamento.length;
  document.querySelector('#dd-alojamento .dd-rotulo').textContent = 'Alojamento' + (na ? ' (' + na + ')' : '');
  const ne = ESTADO.extras.length;
  document.querySelector('#dd-extras .dd-rotulo').textContent = 'Extras' + (ne ? ' (' + ne + ')' : '');
}

/* tipo de viagem */
document.querySelectorAll('input[name="tipo-viagem"]').forEach(r =>
  r.addEventListener('change', () => {
    ESTADO.tipo = r.value;
    const multi = ESTADO.tipo === 'multi';
    document.getElementById('linha-campos').style.display = multi ? 'none' : '';
    document.getElementById('zona-multi').hidden = !multi;
    if(multi && !ESTADO.trocos.length) iniciarTrocos();
    if(multi) desenharTrocos();
    const regresso = document.getElementById('input-regresso');
    if(ESTADO.tipo === 'so-ida'){
      ESTADO.volta = null; regresso.value = ''; regresso.placeholder = '(só ida)';
      regresso.closest('.campo').style.opacity = .55;
    }else{
      regresso.placeholder = 'Regresso';
      regresso.closest('.campo').style.opacity = 1;
    }
    actualizarRotulos();
    reactualizarResultados();
  }));

/* passageiros */
document.querySelectorAll('#dd-passageiros .contador').forEach(c => {
  const tipo = c.dataset.tipo, valor = c.querySelector('.valor');
  const limites = {adultos:[1,9], criancas:[0,8], bebes:[0,4]};
  const actualizar = () => {
    valor.textContent = ESTADO.pax[tipo];
    c.querySelector('.menos').disabled = ESTADO.pax[tipo] <= limites[tipo][0];
    c.querySelector('.mais').disabled = ESTADO.pax[tipo] >= limites[tipo][1];
    actualizarRotulos();
    reactualizarResultados();
  };
  c.querySelector('.menos').addEventListener('click', () => { ESTADO.pax[tipo] = Math.max(limites[tipo][0], ESTADO.pax[tipo]-1); actualizar(); });
  c.querySelector('.mais').addEventListener('click', () => { ESTADO.pax[tipo] = Math.min(limites[tipo][1], ESTADO.pax[tipo]+1); actualizar(); });
  actualizar();
});
document.querySelector('#dd-passageiros .painel-ok').addEventListener('click', () =>
  document.getElementById('dd-passageiros').classList.remove('aberto'));

/* classe */
document.querySelectorAll('input[name="classe"]').forEach(r =>
  r.addEventListener('change', () => { ESTADO.classe = r.value; actualizarRotulos(); reactualizarResultados(); }));

/* transportes e alojamento (caixas de selecção) */
document.querySelectorAll('input[name="transporte"]').forEach(cb =>
  cb.addEventListener('change', () => {
    ESTADO.transportes = [...document.querySelectorAll('input[name="transporte"]:checked')].map(x => x.value);
    actualizarRotulos();
    reactualizarResultados();
  }));
document.querySelectorAll('input[name="alojamento"]').forEach(cb =>
  cb.addEventListener('change', () => {
    ESTADO.alojamento = [...document.querySelectorAll('input[name="alojamento"]:checked')].map(x => x.value);
    actualizarRotulos();
    reactualizarResultados();
  }));
document.querySelectorAll('input[name="extra"]').forEach(cb =>
  cb.addEventListener('change', () => {
    ESTADO.extras = [...document.querySelectorAll('input[name="extra"]:checked')].map(x => x.value);
    actualizarRotulos();
    reactualizarResultados();
  }));

/* ── autocomplete (sugestões de cidades) ─────────────────────── */
const elSugestoes = document.getElementById('sugestoes');
let sugActivas = [], sugIndice = -1, sugInput = null, sugAoEscolher = null;

function ligarAutocomplete(input, aoEscolher){
  input.addEventListener('input', () => {
    input.dataset.cidade = '';
    const t = normalizar(input.value.trim());
    if(t.length < 1){ esconderSugestoes(); return; }
    sugActivas = CIDADES.filter(c =>
      normalizar(c.n).startsWith(t) || normalizar(c.p).startsWith(t) || c.i.toLowerCase() === t
    ).concat(CIDADES.filter(c =>
      !normalizar(c.n).startsWith(t) && !normalizar(c.p).startsWith(t) && (normalizar(c.n).includes(t) || normalizar(c.p).includes(t))
    )).slice(0, 7);
    if(!sugActivas.length){ esconderSugestoes(); return; }
    sugInput = input; sugAoEscolher = aoEscolher; sugIndice = -1;
    elSugestoes.innerHTML = sugActivas.map((c, i) => `
      <div class="sugestao" data-i="${i}">
        <span class="sug-ico">${c.f}</span>
        <span><span class="sug-nome">${c.n}</span> <span class="sug-pais">${c.p}</span></span>
        <span class="sug-iata">${c.i}</span>
      </div>`).join('');
    const r = input.getBoundingClientRect();
    elSugestoes.style.left = (r.left + window.scrollX) + 'px';
    elSugestoes.style.top = (r.bottom + window.scrollY + 6) + 'px';
    elSugestoes.style.minWidth = Math.max(r.width, 260) + 'px';
    elSugestoes.hidden = false;
    elSugestoes.querySelectorAll('.sugestao').forEach(s =>
      s.addEventListener('mousedown', e => { e.preventDefault(); escolherSugestao(+s.dataset.i); }));
  });
  input.addEventListener('keydown', e => {
    if(elSugestoes.hidden || sugInput !== input) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); sugIndice = Math.min(sugIndice+1, sugActivas.length-1); marcarSugestao(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); sugIndice = Math.max(sugIndice-1, 0); marcarSugestao(); }
    else if(e.key === 'Enter'){ e.preventDefault(); escolherSugestao(sugIndice >= 0 ? sugIndice : 0); }
    else if(e.key === 'Escape'){ esconderSugestoes(); }
  });
  input.addEventListener('blur', () => setTimeout(() => { if(sugInput === input) esconderSugestoes(); }, 150));
}
function marcarSugestao(){
  elSugestoes.querySelectorAll('.sugestao').forEach((s, i) => s.classList.toggle('activa', i === sugIndice));
}
function escolherSugestao(i){
  const cidade = sugActivas[i];
  if(!cidade || !sugInput) return;
  sugInput.value = cidade.n;
  sugInput.dataset.cidade = cidade.n;
  esconderSugestoes();
  if(sugAoEscolher) sugAoEscolher(cidade);
}
function esconderSugestoes(){ elSugestoes.hidden = true; sugIndice = -1; }

const inputOrigem = document.getElementById('input-origem');
const inputDestino = document.getElementById('input-destino');
ligarAutocomplete(inputOrigem, c => { ESTADO.origem = c; reactualizarResultados(); });
ligarAutocomplete(inputDestino, c => { ESTADO.destino = c; reactualizarResultados(); });

document.getElementById('btn-trocar').addEventListener('click', () => {
  [inputOrigem.value, inputDestino.value] = [inputDestino.value, inputOrigem.value];
  [inputOrigem.dataset.cidade, inputDestino.dataset.cidade] = [inputDestino.dataset.cidade || '', inputOrigem.dataset.cidade || ''];
  [ESTADO.origem, ESTADO.destino] = [ESTADO.destino, ESTADO.origem];
  reactualizarResultados();
});

/* ── campos de datas → calendário ────────────────────────────── */
function resolverCidades(){
  ESTADO.origem = cidadePorNome(inputOrigem.value);
  ESTADO.destino = cidadePorNome(inputDestino.value);
}
function abrirCalendarioPrincipal(modo){
  resolverCidades();
  abrirCalendario({
    modo, sohIda: ESTADO.tipo === 'so-ida',
    ida: ESTADO.ida, volta: ESTADO.volta,
    origem: ESTADO.origem, destino: ESTADO.destino, classe: ESTADO.classe,
    aoEscolher(ida, volta){
      ESTADO.ida = ida; ESTADO.volta = volta;
      document.getElementById('input-partida').value = formatarDataCurta(ida);
      document.getElementById('input-regresso').value = formatarDataCurta(volta);
      reactualizarResultados();
    }
  });
}
document.getElementById('campo-partida').addEventListener('click', () => abrirCalendarioPrincipal('ida'));
document.getElementById('campo-regresso').addEventListener('click', () => {
  if(ESTADO.tipo === 'so-ida') return;
  abrirCalendarioPrincipal(ESTADO.ida ? 'volta' : 'ida');
});

/* ── várias cidades ──────────────────────────────────────────── */
function iniciarTrocos(){
  resolverCidades();
  const amanha = new Date(); amanha.setHours(0,0,0,0); amanha.setDate(amanha.getDate() + 14);
  ESTADO.trocos = [
    {origem: ESTADO.origem, destino: ESTADO.destino, data: ESTADO.ida || amanha},
    {origem: ESTADO.destino, destino: null, data: null}
  ];
}
function desenharTrocos(){
  const zona = document.getElementById('lista-trocos');
  zona.innerHTML = ESTADO.trocos.map((t, i) => `
    <div class="troco" data-i="${i}">
      <span class="troco-num">${i+1}</span>
      <div class="campo campo-texto"><span class="campo-ico">◉</span>
        <input type="text" class="troco-origem" placeholder="De onde?" autocomplete="off" value="${t.origem ? t.origem.n : ''}"></div>
      <div class="campo campo-texto"><span class="campo-ico">📍</span>
        <input type="text" class="troco-destino" placeholder="Para onde?" autocomplete="off" value="${t.destino ? t.destino.n : ''}"></div>
      <div class="campo campo-data"><span class="campo-ico">🗓</span>
        <input type="text" class="troco-data" placeholder="Partida" readonly value="${t.data ? formatarDataCurta(t.data) : ''}"></div>
      <button type="button" class="btn-remover" title="Remover este destino" ${ESTADO.trocos.length <= 2 ? 'disabled' : ''}>✕</button>
    </div>`).join('');

  zona.querySelectorAll('.troco').forEach(linha => {
    const i = +linha.dataset.i;
    ligarAutocomplete(linha.querySelector('.troco-origem'), c => { ESTADO.trocos[i].origem = c; reactualizarResultados(); });
    ligarAutocomplete(linha.querySelector('.troco-destino'), c => {
      ESTADO.trocos[i].destino = c;
      if(ESTADO.trocos[i+1] && !ESTADO.trocos[i+1].origem){ ESTADO.trocos[i+1].origem = c; desenharTrocos(); }
      reactualizarResultados();
    });
    linha.querySelector('.troco-data').addEventListener('click', () => {
      const t = ESTADO.trocos[i];
      t.origem = cidadePorNome(linha.querySelector('.troco-origem').value) || t.origem;
      t.destino = cidadePorNome(linha.querySelector('.troco-destino').value) || t.destino;
      abrirCalendario({
        modo:'ida', sohIda:true, ida:t.data,
        origem:t.origem, destino:t.destino, classe:ESTADO.classe,
        aoEscolher(ida){ t.data = ida; desenharTrocos(); reactualizarResultados(); }
      });
    });
    linha.querySelector('.btn-remover').addEventListener('click', () => {
      ESTADO.trocos.splice(i, 1); desenharTrocos(); reactualizarResultados();
    });
  });
}
document.getElementById('btn-add-troco').addEventListener('click', () => {
  if(ESTADO.trocos.length >= 5) return;
  const ultimo = ESTADO.trocos[ESTADO.trocos.length-1];
  ESTADO.trocos.push({origem: ultimo ? ultimo.destino : null, destino:null, data:null});
  desenharTrocos();
});

/* ── pesquisa partilhável por URL ────────────────────────────── */
function fISO(d){
  return d ? d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0') : '';
}
function deISO(s){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  return m ? new Date(+m[1], +m[2]-1, +m[3]) : null;
}
function urlDaPesquisa(){
  const ps = new URLSearchParams();
  ps.set('tipo', ESTADO.tipo);
  ps.set('adultos', ESTADO.pax.adultos);
  if(ESTADO.pax.criancas) ps.set('criancas', ESTADO.pax.criancas);
  if(ESTADO.pax.bebes) ps.set('bebes', ESTADO.pax.bebes);
  ps.set('classe', ESTADO.classe);
  ps.set('transportes', ESTADO.transportes.join(','));
  ps.set('alojamento', ESTADO.alojamento.join(','));
  if(ESTADO.extras.length) ps.set('extras', ESTADO.extras.join(','));
  if(ESTADO.tipo === 'multi'){
    ps.set('trocos', ESTADO.trocos.map(t => t.origem.i + '-' + t.destino.i + '-' + fISO(t.data)).join(','));
  }else{
    ps.set('de', ESTADO.origem.i);
    ps.set('para', ESTADO.destino.i);
    ps.set('ida', fISO(ESTADO.ida));
    if(ESTADO.volta) ps.set('volta', fISO(ESTADO.volta));
  }
  /* o modo de diagnóstico tem de sobreviver à reescrita do endereço, senão
     apaga-se a si próprio mal se carrega em «Pesquisar» */
  if(/[?&]diag=1/.test(location.search)) ps.set('diag', '1');
  return '?' + ps.toString();
}
/* lê a pesquisa a partir do URL; devolve true se houver uma pesquisa completa */
function aplicarURL(){
  const ps = new URLSearchParams(location.search);
  if(!ps.get('de') && !ps.get('trocos')) return false;
  const tipo = ['ida-volta','so-ida','multi'].includes(ps.get('tipo'))
    ? ps.get('tipo')
    : (ps.get('trocos') ? 'multi' : (ps.get('volta') ? 'ida-volta' : 'so-ida'));

  ESTADO.pax.adultos = Math.min(9, Math.max(1, +ps.get('adultos') || 1));
  ESTADO.pax.criancas = Math.min(8, Math.max(0, +ps.get('criancas') || 0));
  ESTADO.pax.bebes = Math.min(4, Math.max(0, +ps.get('bebes') || 0));
  document.querySelectorAll('#dd-passageiros .contador').forEach(c =>
    c.querySelector('.valor').textContent = ESTADO.pax[c.dataset.tipo]);

  if(NOME_CLASSE[ps.get('classe')]) ESTADO.classe = ps.get('classe');
  const rClasse = document.querySelector(`input[name="classe"][value="${ESTADO.classe}"]`);
  if(rClasse) rClasse.checked = true;

  if(ps.has('transportes') || ps.has('alojamento')){
    ESTADO.transportes = (ps.get('transportes') || '').split(',').filter(x => ['carro','comboio','autocarro','metro'].includes(x));
    ESTADO.alojamento = (ps.get('alojamento') || '').split(',').filter(x => ['hotel','airbnb','hostel'].includes(x));
    document.querySelectorAll('input[name="transporte"]').forEach(cb => cb.checked = ESTADO.transportes.includes(cb.value));
    document.querySelectorAll('input[name="alojamento"]').forEach(cb => cb.checked = ESTADO.alojamento.includes(cb.value));
  }
  ESTADO.extras = (ps.get('extras') || '').split(',').filter(x => ['porao','cabina','seguro'].includes(x));
  document.querySelectorAll('input[name="extra"]').forEach(cb => cb.checked = ESTADO.extras.includes(cb.value));

  ESTADO.explorar = false;
  if(ps.get('explorar') && ps.get('de') && !ps.get('para')){
    const o = cidadePorNome(ps.get('de')); const ida = deISO(ps.get('ida'));
    if(!o || !ida) return false;
    ESTADO.origem = o; ESTADO.ida = ida;
    ESTADO.volta = tipo === 'so-ida' ? null : deISO(ps.get('volta'));
    ESTADO.destino = null; ESTADO.explorar = true;
    inputOrigem.value = o.n; inputOrigem.dataset.cidade = o.n;
    inputDestino.value = ''; inputDestino.dataset.cidade = '';
    document.getElementById('input-partida').value = formatarDataCurta(ida);
    document.getElementById('input-regresso').value = formatarDataCurta(ESTADO.volta);
    const rt = document.querySelector(`input[name="tipo-viagem"][value="${tipo}"]`);
    if(rt && !rt.checked){ rt.checked = true; rt.dispatchEvent(new Event('change')); }
    actualizarRotulos();
    return true;
  }

  if(tipo === 'multi'){
    const trocos = (ps.get('trocos') || '').split(',').map(x => {
      const partes = x.split('-');
      return {origem: cidadePorNome(partes[0]), destino: cidadePorNome(partes[1]), data: deISO(partes.slice(2).join('-'))};
    }).filter(tr => tr.origem && tr.destino && tr.data);
    if(trocos.length < 2) return false;
    ESTADO.trocos = trocos;
  }else{
    const o = cidadePorNome(ps.get('de')), d = cidadePorNome(ps.get('para'));
    const ida = deISO(ps.get('ida'));
    if(!o || !d || !ida) return false;
    ESTADO.origem = o; ESTADO.destino = d; ESTADO.ida = ida;
    ESTADO.volta = tipo === 'so-ida' ? null : deISO(ps.get('volta'));
    if(tipo === 'ida-volta' && !ESTADO.volta) return false;
    inputOrigem.value = o.n; inputOrigem.dataset.cidade = o.n;
    inputDestino.value = d.n; inputDestino.dataset.cidade = d.n;
    document.getElementById('input-partida').value = formatarDataCurta(ida);
    document.getElementById('input-regresso').value = formatarDataCurta(ESTADO.volta);
  }

  const rTipo = document.querySelector(`input[name="tipo-viagem"][value="${tipo}"]`);
  if(rTipo && !rTipo.checked){ rTipo.checked = true; rTipo.dispatchEvent(new Event('change')); }
  actualizarRotulos();
  return true;
}
window.addEventListener('popstate', () => {
  if(aplicarURL()){ if(ESTADO.explorar) executarExploracao(); else executarPesquisa(); }
  else document.getElementById('resultados').hidden = true;
});

/* ── pesquisa ────────────────────────────────────────────────── */
function marcarErro(el){ el.classList.add('erro'); setTimeout(() => el.classList.remove('erro'), 900); }

function validarPesquisaSimples(silencioso){
  resolverCidades();
  const erro = el => { if(!silencioso) marcarErro(el); };
  let ok = true;
  if(!ESTADO.origem){ erro(document.getElementById('campo-origem')); ok = false; }
  if(!ESTADO.destino || (ESTADO.origem && ESTADO.destino.i === ESTADO.origem.i)){ erro(document.getElementById('campo-destino')); ok = false; }
  if(!ESTADO.ida){ erro(document.getElementById('campo-partida')); ok = false; }
  if(ESTADO.tipo === 'ida-volta' && !ESTADO.volta){ erro(document.getElementById('campo-regresso')); ok = false; }
  return ok;
}
function validarPesquisaMulti(silencioso){
  const erro = el => { if(!silencioso) marcarErro(el); };
  let ok = true;
  document.querySelectorAll('#lista-trocos .troco').forEach(linha => {
    const i = +linha.dataset.i, t = ESTADO.trocos[i];
    t.origem = cidadePorNome(linha.querySelector('.troco-origem').value);
    t.destino = cidadePorNome(linha.querySelector('.troco-destino').value);
    if(!t.origem){ erro(linha.querySelector('.troco-origem').closest('.campo')); ok = false; }
    if(!t.destino){ erro(linha.querySelector('.troco-destino').closest('.campo')); ok = false; }
    if(!t.data){ erro(linha.querySelector('.troco-data').closest('.campo')); ok = false; }
  });
  for(let i = 1; i < ESTADO.trocos.length; i++){
    const a = ESTADO.trocos[i-1], b = ESTADO.trocos[i];
    if(a.data && b.data && b.data < a.data){
      erro(document.querySelectorAll('#lista-trocos .troco-data')[i].closest('.campo')); ok = false;
    }
  }
  return ok;
}

/* Mantém os resultados sempre actualizados: quando o utilizador altera
   qualquer opção (passageiros, classe, transportes, alojamento, datas,
   cidades ou tipo de viagem) depois de uma pesquisa, tudo é recalculado. */
function reactualizarResultados(){
  const sec = document.getElementById('resultados');
  if(!sec || sec.hidden) return;
  let ok = false;
  if(ESTADO.tipo === 'multi'){
    if(validarPesquisaMulti(true)){ desenharResultadosMulti(); ok = true; }
  }else if(validarPesquisaSimples(true)){
    desenharResultados(); ok = true;
  }
  if(ok){ try{ history.replaceState({}, '', urlDaPesquisa()); }catch(e){} }
}

document.getElementById('btn-pesquisar').addEventListener('click', () => {
  resolverCidades();
  if(!inputDestino.value.trim() && ESTADO.origem){
    if(!ESTADO.ida){ marcarErro(document.getElementById('campo-partida')); return; }
    ESTADO.destino = null;
    executarExploracao();
    return;
  }
  if(validarPesquisaSimples()) executarPesquisa();
});
document.getElementById('btn-pesquisar-multi').addEventListener('click', () => {
  if(validarPesquisaMulti()) executarPesquisa();
});

/* ecrã de carregamento com os ícones dos parceiros */
function mostrarCarregamento(aoTerminar, passos){
  const overlay = document.getElementById('carregando');
  const icones = ['google','skyscanner','kayak','momondo','booking','trivago','edreams','expedia','airbnb','omio','rentalcars','getyourguide'];
  document.getElementById('carregando-icones').innerHTML = icones.map(iconeParceiro).join('');
  overlay.hidden = false;
  const barra = document.getElementById('barra-progresso');
  const passo = document.getElementById('carregando-passo');
  passos = passos || ['A contactar mais de 60 parceiros…','A recolher tarifas e disponibilidade…','A procurar cupões activos…','A calcular totais e pacotes…'];
  let pct = 0, i = 0;
  barra.style.width = '0%';
  const intervalo = setInterval(() => {
    pct += 18 + Math.random() * 14;
    if(i < passos.length) passo.textContent = passos[i++];
    barra.style.width = Math.min(100, pct) + '%';
    if(pct >= 100){
      clearInterval(intervalo);
      setTimeout(() => {
        overlay.hidden = true;
        aoTerminar();
        document.getElementById('resultados').scrollIntoView({behavior:'smooth'});
      }, 250);
    }
  }, 320);
}
function executarPesquisa(){
  ESTADO.explorar = false;
  /* o URL reflecte sempre a pesquisa apresentada, para partilhar e guardar */
  try{ history.replaceState({}, '', urlDaPesquisa()); }catch(e){ /* file:// */ }
  if(typeof registarHistorico === 'function'){ try{ registarHistorico(); }catch(e){} }
  mostrarCarregamento(() => { if(ESTADO.tipo === 'multi') desenharResultadosMulti(); else desenharResultados(); });
}

/* ── explorar destinos («Para onde?» vazio) ──────────────────── */
function melhorPrecoVoo(o, d, ida, volta, classe, pax){
  let melhor = Infinity;
  for(const c of parceirosDe('voo')){
    const q = cotacaoVoo(c, o, d, ida, volta, classe, pax);
    if(q.precoFinal < melhor) melhor = q.precoFinal;
  }
  return melhor;
}
function urlDaExploracao(){
  const ps = new URLSearchParams();
  ps.set('tipo', ESTADO.tipo);
  ps.set('de', ESTADO.origem.i);
  ps.set('ida', fISO(ESTADO.ida));
  if(ESTADO.volta && ESTADO.tipo !== 'so-ida') ps.set('volta', fISO(ESTADO.volta));
  ps.set('adultos', ESTADO.pax.adultos);
  if(ESTADO.pax.criancas) ps.set('criancas', ESTADO.pax.criancas);
  ps.set('classe', ESTADO.classe);
  ps.set('explorar', '1');
  return '?' + ps.toString();
}
function executarExploracao(){
  ESTADO.explorar = true;
  try{ history.replaceState({}, '', urlDaExploracao()); }catch(e){}
  mostrarCarregamento(() => desenharExploracao(),
    ['A varrer destinos a partir da sua origem…','A recolher as tarifas mais baratas…','A ordenar os destinos por preço…']);
}
function escolherDestinoExplorado(d){
  if(!d) return;
  ESTADO.destino = d; ESTADO.explorar = false;
  inputDestino.value = d.n; inputDestino.dataset.cidade = d.n;
  actualizarRotulos();
  executarPesquisa();
}
function desenharExploracao(){
  const o = ESTADO.origem, ida = ESTADO.ida, volta = ESTADO.tipo === 'so-ida' ? null : ESTADO.volta;
  const n = totalPax();
  const idaVolta = !!volta;
  const destinos = CIDADES.filter(c => c.i !== o.i).map((c, idx) => ({
    cidade: c,
    preco: Math.round(melhorPrecoVoo(o, c, ida, volta, ESTADO.classe, ESTADO.pax)),
    gradiente: GRADIENTES[idx % GRADIENTES.length]
  })).sort((a, b) => a.preco - b.preco);
  const top = destinos.slice(0, 24);

  const html = `
    <div class="res-cabecalho">
      <h2>🌍 Para onde ir a partir de ${o.f} ${o.n}?</h2>
      <span class="res-detalhe">Voos ${idaVolta ? 'de ida e volta' : 'só de ida'} mais baratos · ${formatarDataCurta(ida)}${idaVolta ? ' - ' + formatarDataCurta(volta) : ''} · ${n} ${n === 1 ? 'passageiro' : 'passageiros'} · ${NOME_CLASSE[ESTADO.classe]}</span>
    </div>
    <div class="bloco" style="margin-top:1rem">
      <h3 class="bloco-titulo">🗺 Destinos no mapa (preço por passageiro)</h3>
      <div id="mapa-explorar" class="mapa mapa-alto"></div>
    </div>
    <p class="sub-seccao" style="margin:1.2rem 0 .3rem">Os 24 destinos mais baratos. Carregue num para ver a viagem completa.</p>
    <div class="grelha-ofertas" id="grelha-explorar">
      ${top.map(x => `
        <div class="cartao-oferta">
          <div class="oferta-topo" style="background:${x.gradiente}">
            <span class="oferta-bandeira">${x.cidade.f}</span>
            <span class="oferta-cidade">${x.cidade.n}</span>
          </div>
          <div class="oferta-corpo">
            <span class="oferta-datas">✈ ${o.n} → ${x.cidade.n} · ${x.cidade.p}</span>
            <div class="oferta-precos"><span class="oferta-agora">${euros(x.preco)}</span><span class="oferta-tipico" style="text-decoration:none">${idaVolta ? 'ida e volta' : 'só ida'}</span></div>
            <button type="button" class="btn-oferta" data-iata="${x.cidade.i}">Ver esta viagem</button>
          </div>
        </div>`).join('')}
    </div>`;

  const sec = document.getElementById('resultados');
  sec.innerHTML = html;
  sec.hidden = false;
  document.querySelectorAll('#grelha-explorar .oferta-topo').forEach((el, i) => aplicarBanner(top[i].cidade, el));
  document.querySelectorAll('#grelha-explorar .btn-oferta').forEach(b =>
    b.addEventListener('click', () => escolherDestinoExplorado(cidadePorNome(b.dataset.iata))));
  desenharMapaExplorar(o, top, idaVolta);
}
function desenharMapaExplorar(o, destinos, idaVolta){
  if(mapaExplorar){ mapaExplorar.remove(); mapaExplorar = null; }
  mapaExplorar = criarMapa('mapa-explorar');
  if(!mapaExplorar) return;
  const pontos = [[o.la, o.lo]];
  L.marker([o.la, o.lo]).addTo(mapaExplorar).bindPopup(`<strong>${o.f} ${o.n}</strong><br>Origem`);
  destinos.forEach(x => {
    pontos.push([x.cidade.la, x.cidade.lo]);
    const m = L.marker([x.cidade.la, x.cidade.lo]).addTo(mapaExplorar);
    m.bindTooltip(`${euros(x.preco)}`, {permanent:true, direction:'top', offset:[-15,-8], className:'tooltip-preco'});
    m.bindPopup(`<strong>${x.cidade.f} ${x.cidade.n}</strong><br>${euros(x.preco)} ${idaVolta ? 'ida e volta' : 'só ida'}<br><em>carregue para ver a viagem</em>`);
    m.on('click', () => escolherDestinoExplorado(x.cidade));
  });
  mapaExplorar.fitBounds(L.latLngBounds(pontos).pad(0.15));
  setTimeout(() => mapaExplorar.invalidateSize(), 150);
}

/* ── filtros e ordenação dos voos ────────────────────────────── */
/* nomes de companhias vêm de uma API externa: escapar antes de os inserir */
function escaparHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
/* «partidas» e «companhias» são listas: vazias significam «sem restrição»,
   o que permite escolher vários períodos do dia e várias companhias. */
const FILTROS = {ordenar:'preco', escalas:'todas', partidas:[], companhias:[]};
let FILTRO_ABERTO = null;   /* qual o painel aberto, para o reabrir após redesenhar */
function reporFiltros(){
  Object.assign(FILTROS, {ordenar:'preco', escalas:'todas', partidas:[], companhias:[]});
}
function minutosDuracao(d){
  const m = /(\d+)h(\d+)/.exec(d || '');
  return m ? (+m[1]) * 60 + (+m[2]) : 99999;
}
function faixaPartida(hhmm){
  const h = +String(hhmm || '').slice(0, 2);
  if(h >= 6 && h < 12) return 'manha';
  if(h >= 12 && h < 18) return 'tarde';
  if(h >= 18) return 'noite';
  return 'madrugada';
}
function aplicarFiltrosVoos(lista){
  const v = lista.filter(q =>
    (FILTROS.escalas === 'todas' || (FILTROS.escalas === 'directos' ? q.escalas === 0 : q.escalas <= 1)) &&
    (!FILTROS.partidas.length || FILTROS.partidas.includes(faixaPartida(q.partida))) &&
    (!FILTROS.companhias.length || FILTROS.companhias.includes(q.companhia)));
  if(FILTROS.ordenar === 'duracao') v.sort((a, b) => minutosDuracao(a.duracao) - minutosDuracao(b.duracao));
  else if(FILTROS.ordenar === 'partida') v.sort((a, b) => String(a.partida).localeCompare(String(b.partida)));
  else v.sort((a, b) => a.precoFinal - b.precoFinal);
  return v;
}
const FAIXAS_PARTIDA = [
  ['manha','Manhã (06h a 12h)'], ['tarde','Tarde (12h a 18h)'],
  ['noite','Noite (18h a 24h)'], ['madrugada','Madrugada (00h a 06h)']
];
/* rótulo do botão: nada escolhido, um só, ou uma contagem */
function resumoEscolha(escolhidas, opcoes, vazio, plural){
  if(!escolhidas.length) return vazio;
  if(escolhidas.length === 1){
    const o = opcoes.find(x => x[0] === escolhidas[0]);
    return o ? o[1] : escolhidas[0];
  }
  return escolhidas.length + ' ' + plural;
}
/* «grupo» distingue os filtros dos voos dos do alojamento, para que os
   painéis abertos e as ligações de um bloco não interfiram com o outro */
function filtroMulti(chave, titulo, opcoes, escolhidas, vazio, plural, grupo){
  grupo = grupo || 'voo';
  return `<div class="filtro-multi" data-multi="${chave}" data-grupo="${grupo}">
    <span class="fm-titulo">${titulo}</span>
    <button type="button" class="fm-btn" aria-expanded="false">${escaparHtml(resumoEscolha(escolhidas, opcoes, vazio, plural))}<span class="seta">▾</span></button>
    <div class="fm-painel" hidden>
      ${opcoes.map(([v, txt]) => `<label class="fm-opcao"><input type="checkbox" value="${escaparHtml(v)}"${escolhidas.includes(v) ? ' checked' : ''}><span>${escaparHtml(txt)}</span></label>`).join('')}
      ${escolhidas.length ? '<button type="button" class="fm-limpar">Limpar</button>' : ''}
    </div>
  </div>`;
}
/* liga um conjunto de painéis de escolha múltipla ao objecto de filtros */
function ligarMultis(caixas, alvo, aoMudar){
  caixas.forEach(caixa => {
    const chave = caixa.dataset.multi, id = caixa.dataset.grupo + ':' + chave;
    const btn = caixa.querySelector('.fm-btn'), painel = caixa.querySelector('.fm-painel');
    const abrir = ab => { painel.hidden = !ab; btn.setAttribute('aria-expanded', ab ? 'true' : 'false'); FILTRO_ABERTO = ab ? id : null; };
    btn.onclick = e => { e.stopPropagation(); abrir(painel.hidden); };
    /* reabre o painel que estava aberto antes de a lista ser redesenhada */
    if(FILTRO_ABERTO === id) abrir(true);
    painel.onclick = e => e.stopPropagation();
    painel.querySelectorAll('input[type=checkbox]').forEach(cx => {
      cx.onchange = () => {
        alvo[chave] = [...painel.querySelectorAll('input[type=checkbox]:checked')].map(x => x.value);
        aoMudar();
      };
    });
    const limpar = painel.querySelector('.fm-limpar');
    if(limpar) limpar.onclick = () => { alvo[chave] = []; aoMudar(); };
  });
}
function barraFiltros(companhias){
  /* mantém as companhias escolhidas visíveis mesmo que não existam nesta vista */
  const extra = FILTROS.companhias.filter(c => !companhias.includes(c));
  const listaComp = [...extra, ...companhias].map(c => [c, c]);
  const op = (v, txt, actual) => `<option value="${v}"${v === actual ? ' selected' : ''}>${txt}</option>`;
  return `<div class="filtros-voos">
    <label>Ordenar <select data-filtro="ordenar">${op('preco','Mais barato',FILTROS.ordenar)}${op('duracao','Mais rápido',FILTROS.ordenar)}${op('partida','Partida mais cedo',FILTROS.ordenar)}</select></label>
    <label>Escalas <select data-filtro="escalas">${op('todas','Todas',FILTROS.escalas)}${op('directos','Só directos',FILTROS.escalas)}${op('ate1','Até 1 escala',FILTROS.escalas)}</select></label>
    ${filtroMulti('partidas', 'Partida', FAIXAS_PARTIDA, FILTROS.partidas, 'Qualquer hora', 'períodos')}
    ${filtroMulti('companhias', 'Companhia', listaComp, FILTROS.companhias, 'Todas', 'companhias')}
  </div>`;
}
function ligarFiltrosVoos(raiz, aoMudar){
  raiz.querySelectorAll('.filtros-voos:not(.filtros-aloj) select[data-filtro]').forEach(s =>
    s.onchange = () => { FILTRO_ABERTO = null; FILTROS[s.dataset.filtro] = s.value; aoMudar(); });
  ligarMultis(raiz.querySelectorAll('.filtro-multi[data-grupo="voo"]'), FILTROS, aoMudar);
  const repor = raiz.querySelector('#repor-filtros');
  if(repor) repor.onclick = () => { FILTRO_ABERTO = null; reporFiltros(); aoMudar(); };
}
/* ── filtros do alojamento ───────────────────────────────────── */
/* mesma mecânica dos voos: listas vazias significam «sem restrição» */
const FILTROS_ALOJ = {ordenar:'preco', tipos:[], faixas:[], cupao:'todos'};
function reporFiltrosAloj(){
  Object.assign(FILTROS_ALOJ, {ordenar:'preco', tipos:[], faixas:[], cupao:'todos'});
}
const TIPOS_ALOJ_FILTRO = [['hotel','Hotel'], ['casa','Casa / apartamento'], ['hostel','Hostel']];
/* faixas de preço por noite, em euros base (antes da conversão de moeda) */
const FAIXAS_NOITE = [
  ['ate60',   'Até 60 € / noite',   q => q.porNoite < 60],
  ['60a100',  '60 € a 100 €',       q => q.porNoite >= 60 && q.porNoite < 100],
  ['100a180', '100 € a 180 €',      q => q.porNoite >= 100 && q.porNoite < 180],
  ['mais180', 'Mais de 180 €',      q => q.porNoite >= 180]
];
function aplicarFiltrosAloj(lista){
  const v = lista.filter(q =>
    (!FILTROS_ALOJ.tipos.length || FILTROS_ALOJ.tipos.includes(q.tipo)) &&
    (!FILTROS_ALOJ.faixas.length || FAIXAS_NOITE.some(f => FILTROS_ALOJ.faixas.includes(f[0]) && f[2](q))) &&
    (FILTROS_ALOJ.cupao !== 'com' || !!q.cupao));
  if(FILTROS_ALOJ.ordenar === 'noite') v.sort((a, b) => a.porNoite - b.porNoite);
  else v.sort((a, b) => a.precoFinal - b.precoFinal);
  return v;
}
function barraFiltrosAloj(lista){
  /* só faz sentido oferecer os tipos que a pesquisa devolveu: escolher um
     tipo que não foi pesquisado daria sempre zero resultados. Mantém-se à
     vista o que já estiver escolhido, para se poder desmarcar. */
  const presentes = new Set((lista || []).map(q => q.tipo));
  const tipos = TIPOS_ALOJ_FILTRO.filter(([v]) => presentes.has(v) || FILTROS_ALOJ.tipos.includes(v));
  const op = (val, txt, actual) => `<option value="${val}"${val === actual ? ' selected' : ''}>${txt}</option>`;
  return `<div class="filtros-voos filtros-aloj">
    <label>Ordenar <select data-filtro-aloj="ordenar">${op('preco','Total mais barato',FILTROS_ALOJ.ordenar)}${op('noite','Preço por noite',FILTROS_ALOJ.ordenar)}</select></label>
    ${tipos.length > 1 ? filtroMulti('tipos', 'Tipo', tipos, FILTROS_ALOJ.tipos, 'Todos', 'tipos', 'aloj') : ''}
    ${filtroMulti('faixas', 'Por noite', FAIXAS_NOITE.map(f => [f[0], f[1]]), FILTROS_ALOJ.faixas, 'Qualquer preço', 'faixas', 'aloj')}
    <label>Cupões <select data-filtro-aloj="cupao">${op('todos','Todos',FILTROS_ALOJ.cupao)}${op('com','Só com cupão',FILTROS_ALOJ.cupao)}</select></label>
  </div>`;
}
function ligarFiltrosAloj(raiz, aoMudar){
  raiz.querySelectorAll('.filtros-aloj select').forEach(s =>
    s.onchange = () => { FILTRO_ABERTO = null; FILTROS_ALOJ[s.dataset.filtroAloj] = s.value; aoMudar(); });
  ligarMultis(raiz.querySelectorAll('.filtro-multi[data-grupo="aloj"]'), FILTROS_ALOJ, aoMudar);
  const repor = raiz.querySelector('#repor-filtros-aloj');
  if(repor) repor.onclick = () => { FILTRO_ABERTO = null; reporFiltrosAloj(); aoMudar(); };
}

/* um clique fora fecha o painel de filtros aberto */
document.addEventListener('click', () => {
  if(!FILTRO_ABERTO) return;
  FILTRO_ABERTO = null;
  document.querySelectorAll('.filtro-multi .fm-painel').forEach(p => { p.hidden = true; });
  document.querySelectorAll('.filtro-multi .fm-btn').forEach(b => b.setAttribute('aria-expanded','false'));
});

/* ── gráfico de evolução do preço (SVG, sem bibliotecas) ─────── */
function graficoEvolucao(serie){
  const n = serie.pontos.length;
  const min = Math.min(...serie.pontos), max = Math.max(...serie.pontos);
  const amp = Math.max(1, max - min);
  const X = i => 8 + (i / (n - 1)) * 304;
  const Y = p => 12 + (1 - (p - min) / amp) * 86;
  const linha = serie.pontos.map((p, i) => `${X(i).toFixed(1)},${Y(p).toFixed(1)}`).join(' ');
  const yTipico = Y(serie.tipico).toFixed(1);
  const corPonto = serie.tipo === 'bom' ? '#0e9f6e' : (serie.tipo === 'alto' ? '#f59e0b' : '#4353ff');
  return `<svg class="grafico-preco" viewBox="0 0 320 132" role="img" aria-label="Evolução estimada do preço do voo">
    <polygon points="8,104 ${linha} 312,104" fill="rgba(67,83,255,.10)"/>
    <line x1="8" y1="${yTipico}" x2="312" y2="${yTipico}" stroke="#a9b0c8" stroke-dasharray="4 4" stroke-width="1"/>
    <text x="310" y="${(+yTipico - 4).toFixed(1)}" text-anchor="end" class="g-tipico">típico: ${euros(serie.tipico)}</text>
    <polyline points="${linha}" fill="none" stroke="#4353ff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(n - 1).toFixed(1)}" cy="${Y(serie.pontos[n - 1]).toFixed(1)}" r="4.2" fill="${corPonto}"/>
    <text x="8" y="124" class="g-eixo">há 8 semanas</text>
    <text x="160" y="124" text-anchor="middle" class="g-eixo">há 4 semanas</text>
    <text x="312" y="124" text-anchor="end" class="g-eixo">hoje</text>
  </svg>`;
}
function blocoEvolucao(o, d, ida, precoHoje){
  const serie = serieHistoricaVoo(o, d, ida, precoHoje);
  const texto = serie.tipo === 'bom'
    ? `✅ Bom momento para comprar: o preço está ${-serie.dif} % abaixo do típico das últimas 8 semanas.`
    : serie.tipo === 'alto'
      ? `⚠️ Preço alto: está ${serie.dif} % acima do típico das últimas 8 semanas. Se puder, aguarde ou active um alerta de preço.`
      : `➖ Preço dentro do típico das últimas 8 semanas.`;
  return `
        <div class="bloco" id="bloco-evolucao" data-aba="viagem">
          <h3 class="bloco-titulo">📈 Evolução do preço do voo</h3>
          <div class="veredicto ${serie.tipo}">${texto}</div>
          ${graficoEvolucao(serie)}
          <p class="bloco-sub" style="margin:.5rem 0 0">Evolução estimada para esta rota e datas, ancorada no melhor preço actual (${euros(precoHoje)}).</p>
        </div>`;
}

/* ── bloco «Sobre o destino» (clima, melhor altura, links) ───── */
function blocoDestino(d){
  const t = climaEstimado(d);
  const bons = t.map((x, i) => ({x, i})).filter(o => o.x >= 16 && o.x <= 28).map(o => MESES[o.i]);
  const min = Math.min(...t), max = Math.max(...t), amp = Math.max(1, max - min);
  const barras = t.map((x, i) => {
    const h = 8 + ((x - min) / amp) * 34;
    const cor = x >= 28 ? '#f59e0b' : (x >= 16 ? '#0e9f6e' : '#4da3f5');
    return `<div class="clima-col"><div class="clima-barra" style="height:${h.toFixed(0)}px;background:${cor}" title="${x}°C"></div><span>${MESES_INI[i]}</span></div>`;
  }).join('');
  const linkVisto = 'https://www.google.com/search?q=' + encodeURIComponent('requisitos de entrada e vistos ' + d.p + ' para cidadãos portugueses');
  return `<div class="bloco" data-aba="viagem">
    <h3 class="bloco-titulo">🌡 Sobre ${d.n}</h3>
    <p class="bloco-sub">${d.p}. Clima típico estimado (máximas médias, °C):</p>
    <div class="clima">${barras}</div>
    ${bons.length ? `<p class="bloco-sub" style="margin-top:.6rem">🗓 Melhor altura para visitar: <strong>${bons.join(', ')}</strong>.</p>` : ''}
    <a class="btn-ver" style="display:inline-block;margin-top:.5rem" href="${linkVisto}" target="_blank" rel="noopener">Requisitos de entrada e vistos ↗</a>
    <a class="btn-ver" style="display:inline-block;margin:.5rem 0 0 .4rem;background:var(--verde)" href="${ligacaoParceiro('getyourguide', {destino:d})}" target="_blank" rel="noopener">Actividades e excursões ↗</a>
    <p class="bloco-sub" style="margin:.5rem 0 0">Vistos e documentos: consulte sempre fontes oficiais para a sua nacionalidade.</p>
  </div>`;
}

/* ── resultados: pesquisa simples ────────────────────────────── */
function desenharResultados(){
  const o = ESTADO.origem, d = ESTADO.destino;
  const ida = ESTADO.ida, volta = ESTADO.tipo === 'so-ida' ? null : ESTADO.volta;
  const ctx = {origem:o, destino:d, ida, volta, adultos:ESTADO.pax.adultos, criancas:ESTADO.pax.criancas, classe:ESTADO.classe};
  const fimEstadia = volta || (() => { const x = new Date(ida); x.setDate(x.getDate() + 3); return x; })();
  const noites = Math.max(1, Math.round((fimEstadia - ida) / 86400000));
  ctx.fim = fimEstadia;

  /* voos (com filtros e ordenação aplicados) */
  const todosVoos = parceirosDe('voo')
    .map(c => cotacaoVoo(c, o, d, ida, volta, ESTADO.classe, ESTADO.pax))
    .sort((a,b) => a.precoFinal - b.precoFinal);
  const companhias = [...new Set(todosVoos.map(q => q.companhia))].sort();
  const voos = aplicarFiltrosVoos(todosVoos);
  const melhorVoo = voos.length ? voos.reduce((m, q) => q.precoFinal < m.precoFinal ? q : m) : todosVoos[0];

  /* alternativa terrestre (comboio / autocarro) */
  const meiosTerrestres = ESTADO.transportes.filter(t => t === 'comboio' || t === 'autocarro');
  const terrestre = meiosTerrestres.length ? cotacoesTerrestres(o, d, ida, ESTADO.pax, meiosTerrestres) : null;

  /* alojamento, carro, transportes públicos, actividades */
  const todosAloj = ESTADO.alojamento.length ? cotacoesAlojamento(d, ida, fimEstadia, ESTADO.pax, tiposAlojamento()) : [];
  const alojamentos = aplicarFiltrosAloj(todosAloj);
  const melhorAloj = alojamentos[0] || null;

  /* se uma escolha esvaziou a lista, fecha o painel: aberto, taparia a
     mensagem e o botão de repor, deixando o utilizador sem saída */
  if(FILTRO_ABERTO && FILTRO_ABERTO.startsWith('voo:') && !voos.length) FILTRO_ABERTO = null;
  if(FILTRO_ABERTO && FILTRO_ABERTO.startsWith('aloj:') && !alojamentos.length) FILTRO_ABERTO = null;
  /* aluguer: só a lista de quem aluga. Os preços vinham do mesmo gerador
     aleatório das actividades — e até o modelo do carro era sorteado. */
  const diasCarro = Math.max(1, Math.round((fimEstadia - ida) / 86400000));
  const carros = ESTADO.transportes.includes('carro')
    ? parceirosDe('carro').map(parceiro => ({parceiro})) : null;
  const tp = ESTADO.transportes.includes('metro') ? estimativaTransportesPublicos(d, noites + 1, ESTADO.pax) : null;
  /* actividades: só a lista de quem as vende. Os preços vinham de um gerador
     aleatório com semente, o que é indefensável num comparador. */
  const actividades = parceirosDe('actividade').map(parceiro => ({parceiro}));

  /* total e pacotes */
  const extras = ESTADO.extras.length ? custoExtras(ESTADO.extras, ESTADO.pax, !!volta, noites) : [];
  /* o pacote compara-se com voo + alojamento; o carro deixou de ter preço */
  const somaPacote = melhorVoo.precoFinal + (melhorAloj ? melhorAloj.precoFinal : 0);
  const pacotes = (volta && melhorAloj) ? cotacoesPacote(o, d, ida, volta, ESTADO.classe, ESTADO.pax, somaPacote, false) : [];
  const melhorPacote = pacotes[0] || null;

  const nCupoes = [...todosVoos, ...todosAloj, ...(carros || []), ...(terrestre && terrestre.viavel ? terrestre.linhas : []), ...pacotes]
    .filter(x => x.cupao).length;

  const tiposAloj = {hotel:'Hotel', casa:'Casa / apartamento', hostel:'Hostel'};
  const n = totalPax();

  /* o que o resumo precisa de saber; o live.js acrescenta-lhe os preços reais */
  RESUMO = {
    ctx, melhorVoo, pax: n, extras,
    voo:  {preco: melhorVoo.precoFinal, nome: PARCEIROS[melhorVoo.parceiro].nome},
    aloj: melhorAloj ? {preco: melhorAloj.precoFinal, nome: PARCEIROS[melhorAloj.parceiro].nome} : null,
    alojRotulo: melhorAloj ? tiposAloj[melhorAloj.tipo] : 'Alojamento',
    carro: null,   /* sem fonte de preço: só entra se o widget o assumir */
    tp: tp ? {preco: tp.total, nome: tp.dias + ' dias × ' + tp.pessoas + (tp.pessoas === 1 ? ' pessoa' : ' pessoas')} : null
  };

  let html = `
    <div class="res-cabecalho">
      <h2>${o.f} ${o.n} ✈ ${d.f} ${d.n}</h2>
      <span class="res-detalhe">${formatarDataCurta(ida)}${volta ? ' - ' + formatarDataCurta(volta) : ' (só ida)'} ·
        ${n} ${n === 1 ? 'passageiro' : 'passageiros'} · ${NOME_CLASSE[ESTADO.classe]}
        ${nCupoes ? ` · <strong>🎟 ${nCupoes} ${nCupoes === 1 ? 'cupão encontrado' : 'cupões encontrados'}</strong>` : ''}</span>
    </div>
    <nav class="abas-resultados" id="abas-resultados" aria-label="Secções dos resultados"></nav>
    <div class="res-grelha">
      <div class="res-coluna">

        <div class="bloco" id="bloco-voos" data-aba="voos">
          <h3 class="bloco-titulo">✈ Voos · ${todosVoos.length} sites comparados</h3>
          ${barraFiltros(companhias)}
          ${voos.length ? voos.slice(0, 10).map(q => linhaOferta(q, {
            melhor: q === melhorVoo,
            detalhe: `${q.companhia} · ${q.escalas === 0 ? 'directo' : q.escalas + (q.escalas === 1 ? ' escala' : ' escalas')} · ${q.duracao} · partida ${q.partida}`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'voo'})
          })).join('') : '<p class="bloco-sub">Nenhum voo cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros">Repor filtros</button></p>'}
        </div>

        ${terrestre ? `
        <div class="bloco" data-aba="voos">
          <h3 class="bloco-titulo">🚆 Alternativa terrestre (comboio / autocarro)</h3>
          ${terrestre.viavel ? `
            <p class="bloco-sub">Distância aproximada: ${terrestre.km} km. Preços totais para ${n} ${n === 1 ? 'passageiro' : 'passageiros'}.</p>
            ${terrestre.linhas.slice(0,4).map((q, idx) => linhaOferta(q, {
              melhor: idx === 0, tag: q.meio,
              detalhe: `Duração aprox. ${q.duracao}`,
              url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'terrestre', meio:q.meio})
            })).join('')}
            ${terrestre.linhas[0].precoFinal < melhorVoo.precoFinal ? `<p class="bloco-sub" style="margin-top:.6rem">💡 A opção terrestre mais barata fica <strong>${euros(melhorVoo.precoFinal - terrestre.linhas[0].precoFinal)}</strong> abaixo do melhor voo.</p>` : ''}
          ` : `
            <p class="bloco-sub">A distância desta rota (~${terrestre.km} km) torna a viagem terrestre pouco prática. Consulte todas as combinações possíveis no Rome2Rio:</p>
            <div class="linha-oferta">${iconeParceiro('rome2rio')}
              <div class="oferta-info"><div class="oferta-nome">Rome2Rio</div><div class="oferta-detalhe">Todas as formas de ir de ${o.n} a ${d.n}</div></div>
              <a class="btn-ver" href="${ligacaoParceiro('rome2rio', ctx)}" target="_blank" rel="noopener">Ver rotas</a>
            </div>`}
        </div>` : ''}

        ${todosAloj.length ? `
        <div class="bloco" id="bloco-alojamento" data-aba="alojamento">
          <h3 class="bloco-titulo">🏨 Alojamento em ${d.n} · ${noites} ${noites === 1 ? 'noite' : 'noites'}</h3>
          <p class="nota-estimativa"><span aria-hidden="true">≈</span><span><strong>Valores estimados</strong> para comparação, calculados a partir de dados históricos. O preço real é confirmado no site do parceiro.</span></p>
          ${barraFiltrosAloj(todosAloj)}
          ${alojamentos.length ? alojamentos.slice(0,6).map((q, idx) => linhaOferta(q, {
            melhor: idx === 0, tag: tiposAloj[q.tipo],
            detalhe: `${q.descricao} · ${euros(q.porNoite)}/noite × ${q.noites} ${q.noites === 1 ? 'noite' : 'noites'}${q.tipo === 'hostel' ? ' × ' + q.quartos + ' camas' : (q.quartos > 1 ? ' × ' + q.quartos + ' quartos' : '')}`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'hotel'})
          })).join('') : '<p class="bloco-sub">Nenhum alojamento cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros-aloj">Repor filtros</button></p>'}
        </div>` : ''}

        ${carros ? `
        <div class="bloco" id="bloco-carro" data-aba="carro">
          <h3 class="bloco-titulo">🚗 Aluguer de viatura · ${diasCarro} ${diasCarro === 1 ? 'dia' : 'dias'}</h3>
          <p class="bloco-sub">Ainda não temos preços reais de aluguer para ${d.n}, por isso não mostramos nenhum. Veja directamente em quem aluga.</p>
          ${carros.map(q => linhaSemPreco(q.parceiro, {
            detalhe: 'Viaturas em ' + d.n + ' para ' + diasCarro + (diasCarro === 1 ? ' dia' : ' dias'),
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'carro'})
          })).join('')}
        </div>` : ''}

        <div class="bloco" id="bloco-roteiro" data-aba="actividades" hidden></div>

        <div class="bloco" id="bloco-actividades" data-aba="actividades">
          <h3 class="bloco-titulo">🎟 Actividades em ${d.n}</h3>
          <p class="bloco-sub">Não há fonte de preços reais de actividades para este destino, por isso não mostramos nenhum: um valor inventado seria pior do que valor nenhum. Veja directamente em quem as vende.</p>
          ${actividades.map(q => linhaSemPreco(q.parceiro, {
            detalhe: 'Passeios, visitas guiadas e bilhetes em ' + d.n,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'actividade'})
          })).join('')}
        </div>
      </div>

      <div class="res-coluna">
        <div class="bloco resumo" id="bloco-resumo">${blocoResumo()}</div>

        ${blocoEvolucao(o, d, ida, melhorVoo.precoFinal)}

        ${pacotes.length ? `
        <div class="bloco" data-aba="viagem">
          <h3 class="bloco-titulo">📦 Pacotes (voo + alojamento)</h3>
          <p class="bloco-sub">Comparados com a reserva em separado: ${euros(somaPacote)}.</p>
          ${pacotes.map((q, idx) => {
            const dif = q.precoFinal - somaPacote;
            const recomendado = dif <= 0;
            const margemPequena = dif > 0 && dif <= somaPacote * 0.10;
            return `<div class="pacote ${recomendado ? 'recomendado' : ''}">
              ${recomendado ? '<span class="pacote-selo">Recomendado</span>' : (margemPequena ? '<span class="pacote-selo">Margem pequena</span>' : '')}
              <div class="pacote-cabeca">${iconeParceiro(q.parceiro)}
                <div><div class="pacote-nome">${PARCEIROS[q.parceiro].nome}</div><div class="pacote-inclui">${q.inclui}</div>${etiquetaCupao(q.cupao)}</div>
                <div class="pacote-preco">${q.cupao ? `<div class="preco-antes">${euros(q.preco)}</div>` : ''}<div class="preco-actual">${euros(q.precoFinal)}</div>
                  <a class="btn-ver" href="${ligacaoParceiro(q.parceiro, {...ctx, seccao:'pacote'})}" target="_blank" rel="noopener">Ver pacote</a></div>
              </div>
              <div class="pacote-compara">${
                recomendado
                  ? `<span class="poupa">Poupa ${euros(-dif)}</span> face às reservas em separado. É a melhor opção.`
                  : margemPequena
                    ? `Fica apenas <span class="acima">${euros(dif)} acima (${Math.round(dif / somaPacote * 100)} %)</span>. Pode compensar pela comodidade e protecção de pacote.`
                    : `Fica ${euros(dif)} acima das reservas em separado.`
              }</div>
            </div>`;
          }).join('')}
        </div>` : ''}

        <div class="bloco" data-aba="viagem">
          <h3 class="bloco-titulo">🗺 Mapa da viagem</h3>
          <div id="mapa-resultados" class="mapa"></div>
        </div>
        ${blocoDestino(d)}
      </div>
    </div>
    <div id="zona-larga"></div>`;

  const sec = document.getElementById('resultados');
  sec.innerHTML = html;
  sec.hidden = false;
  montarAbas(sec);
  desenharMapaResultados([o, d]);
  ligarFiltrosVoos(sec, desenharResultados);
  ligarFiltrosAloj(sec, desenharResultados);
  if(typeof montarAccoesResumo === 'function') montarAccoesResumo(sec, ctx, melhorVoo);
  if(typeof actualizarVoosReais === 'function') actualizarVoosReais(ctx);
  if(typeof actualizarAlojamentoReal === 'function') actualizarAlojamentoReal(ctx);
  if(typeof actualizarActividadesReais === 'function') actualizarActividadesReais(ctx);
  if(typeof actualizarCarrosReais === 'function') actualizarCarrosReais(ctx);
  if(typeof actualizarActividadesWidget === 'function') actualizarActividadesWidget(ctx);
  if(typeof desenharRoteiro === 'function') desenharRoteiro(d, noites);
}

/* ── abas dos resultados ──────────────────────────────────────
   EXPERIÊNCIA: a página de resultados era um único rolo muito comprido.
   As abas dividem-na sem mexer no conteúdo — cada bloco declara a que aba
   pertence num «data-aba», e a barra só mostra as abas que têm blocos.
   O resumo da viagem não tem «data-aba» de propósito: é o valor que se
   quer sempre à vista, seja qual for a aba.

   PARA REVERTER: apagar esta secção, a barra «abas-resultados» no HTML dos
   resultados, os atributos «data-aba» e a regra .fora-da-aba do CSS. Nada
   mais depende disto. */
const ABAS = [
  {id:'voos',        rotulo:'✈ Voos'},
  {id:'alojamento',  rotulo:'🏨 Alojamento'},
  {id:'carro',       rotulo:'🚗 Aluguer'},
  {id:'actividades', rotulo:'🎟 Actividades'},
  {id:'viagem',      rotulo:'🗺 Viagem'}
];
/* guardada fora da função: os filtros de voos e de alojamento voltam a
   desenhar os resultados, e sem isto a aba escolhida saltava para trás */
let ABA_ACTIVA = 'voos';

function montarAbas(sec){
  const barra = sec.querySelector('#abas-resultados');
  if(!barra) return;
  const presentes = ABAS.filter(a => sec.querySelector('[data-aba="' + a.id + '"]'));
  /* com uma secção só, abas não são navegação nenhuma — são um enfeite */
  if(presentes.length < 2){ barra.hidden = true; return; }
  barra.hidden = false;
  barra.innerHTML = presentes.map(a =>
    `<button type="button" class="aba" data-ir="${a.id}">${a.rotulo}</button>`).join('')
    + '<button type="button" class="aba" data-ir="tudo">Tudo</button>';

  const mostrar = id => {
    /* classe, e não o atributo «hidden»: o bloco do roteiro gere o seu
       próprio «hidden» e as duas coisas têm de poder coexistir */
    sec.querySelectorAll('[data-aba]').forEach(el =>
      el.classList.toggle('fora-da-aba', id !== 'tudo' && el.dataset.aba !== id));
    /* Uma coluna sem nada dentro não deve continuar a ocupar metade do ecrã:
       na aba «Viagem» todos os blocos estão à direita, e à esquerda ficava um
       vazio enorme que parecia avaria. */
    const colunas = [...sec.querySelectorAll('.res-coluna')];
    colunas.forEach(c => c.classList.toggle('fora-da-aba',
      ![...c.children].some(el => !el.classList.contains('fora-da-aba') && !el.hidden)));
    const grelha = sec.querySelector('.res-grelha');
    if(grelha) grelha.classList.toggle('coluna-unica',
      colunas.filter(c => !c.classList.contains('fora-da-aba')).length < 2);
    barra.querySelectorAll('.aba').forEach(b => {
      const activa = b.dataset.ir === id;
      b.classList.toggle('activa', activa);
      b.setAttribute('aria-current', activa ? 'true' : 'false');
    });
    ABA_ACTIVA = id;
    /* o mapa foi criado dentro de um bloco escondido e mediu-se a zero: só
       quando a aba abre é que pode saber o tamanho que tem */
    if(mapaResultados && typeof mapaResultados.invalidateSize === 'function')
      requestAnimationFrame(() => mapaResultados.invalidateSize());
  };
  barra.addEventListener('click', e => {
    const b = e.target.closest('.aba');
    if(b) mostrar(b.dataset.ir);
  });
  const valida = ABA_ACTIVA === 'tudo' || presentes.some(a => a.id === ABA_ACTIVA);
  mostrar(valida ? ABA_ACTIVA : presentes[0].id);
}

/* ── resultados: várias cidades ──────────────────────────────── */
function desenharResultadosMulti(){
  const trocos = ESTADO.trocos;
  const n = totalPax();
  const ctx = {origem:trocos[0].origem, destino:trocos[trocos.length-1].destino, ida:trocos[0].data, volta:null, adultos:ESTADO.pax.adultos, criancas:ESTADO.pax.criancas, classe:ESTADO.classe};

  /* por parceiro: soma das cotações de todos os trocos */
  const voos = parceirosDe('voo').map(c => {
    let total = 0, cupoes = 0, detalhes = [];
    for(const t of trocos){
      const q = cotacaoVoo(c, t.origem, t.destino, t.data, null, ESTADO.classe, ESTADO.pax);
      total += q.precoFinal;
      if(q.cupao) cupoes += q.cupao.desconto;
      detalhes.push(t.origem.i + '→' + t.destino.i);
    }
    return {parceiro:c, preco:arred(total + cupoes), precoFinal:arred(total),
            cupao: cupoes > 0 ? {codigo:'cupões', texto:'−' + Math.round(cupoes) + ' €', nota:'soma dos trocos', desconto:cupoes} : null,
            detalhe: detalhes.join(' · ')};
  }).sort((a,b) => a.precoFinal - b.precoFinal);
  const melhorVoo = voos[0];

  /* alojamento por cidade (noites entre trocos; 3 noites na última) */
  const estadias = [];
  for(let i = 0; i < trocos.length; i++){
    const cidade = trocos[i].destino;
    const inicio = trocos[i].data;
    let fim;
    if(i + 1 < trocos.length && trocos[i+1].data) fim = trocos[i+1].data;
    else { fim = new Date(inicio); fim.setDate(fim.getDate() + 3); }
    const noites = Math.max(1, Math.round((fim - inicio) / 86400000));
    if(ESTADO.alojamento.length){
      const melhores = cotacoesAlojamento(cidade, inicio, fim, ESTADO.pax, tiposAlojamento());
      estadias.push({cidade, noites, melhor: melhores[0], inicio, fim});
    } else estadias.push({cidade, noites, melhor:null, inicio, fim});
  }
  const totalAloj = estadias.reduce((s, e) => s + (e.melhor ? e.melhor.precoFinal : 0), 0);
  const total = melhorVoo.precoFinal + totalAloj;
  const tiposAloj = {hotel:'Hotel', casa:'Casa / apartamento', hostel:'Hostel'};

  let html = `
    <div class="res-cabecalho">
      <h2>🌍 Viagem por ${trocos.length + 1} cidades</h2>
      <span class="res-detalhe">${trocos.map(t => t.origem.n).join(' → ')} → ${trocos[trocos.length-1].destino.n} ·
        ${n} ${n === 1 ? 'passageiro' : 'passageiros'} · ${NOME_CLASSE[ESTADO.classe]}</span>
    </div>
    <div class="res-grelha">
      <div class="res-coluna">
        <div class="bloco">
          <h3 class="bloco-titulo">✈ Voos (todos os trocos) · ${voos.length} sites comparados</h3>
          ${voos.map((q, idx) => linhaOferta(q, {melhor: idx === 0, detalhe: q.detalhe, url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'voo'})})).join('')}
        </div>
        ${ESTADO.alojamento.length ? `
        <div class="bloco">
          <h3 class="bloco-titulo">🏨 Alojamento por cidade</h3>
          ${estadias.map(e => e.melhor ? linhaOferta(e.melhor, {
            tag: e.cidade.n,
            detalhe: `${e.melhor.descricao} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'} desde ${formatarDataCurta(e.inicio)}`,
            url: ligacaoParceiro(e.melhor.parceiro, {destino:e.cidade, ida:e.inicio, volta:e.fim, adultos:ESTADO.pax.adultos, criancas:ESTADO.pax.criancas, classe:ESTADO.classe, seccao:'hotel'})
          }) : '').join('')}
        </div>` : ''}
      </div>
      <div class="res-coluna">
        <div class="bloco resumo">
          <h3 class="bloco-titulo">🧾 Total estimado da viagem</h3>
          <div class="resumo-linha"><span>✈ Voos · ${trocos.length} trocos (${PARCEIROS[melhorVoo.parceiro].nome})</span><strong>${euros(melhorVoo.precoFinal)}</strong></div>
          ${estadias.filter(e => e.melhor).map(e => `<div class="resumo-linha"><span>🏨 ${e.cidade.n} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'} (${PARCEIROS[e.melhor.parceiro].nome})</span><strong>${euros(e.melhor.precoFinal)}</strong></div>`).join('')}
          <div class="resumo-total"><span>Total (${n} ${n === 1 ? 'passageiro' : 'passageiros'})</span><span class="valor-total">${euros(total)}</span></div>
          <p class="resumo-nota">Os pacotes e o aluguer de carro estão disponíveis nas pesquisas de ida e volta. Valores estimados.</p>
          <div class="accoes-resumo" id="accoes-resumo"></div>
        </div>
        <div class="bloco">
          <h3 class="bloco-titulo">🗺 Mapa da viagem</h3>
          <div id="mapa-resultados" class="mapa"></div>
        </div>
      </div>
    </div>`;

  const sec = document.getElementById('resultados');
  sec.innerHTML = html;
  sec.hidden = false;
  desenharMapaResultados([trocos[0].origem, ...trocos.map(t => t.destino)]);
  if(typeof montarAccoesResumo === 'function') montarAccoesResumo(sec, ctx, null);
}

/* ── mapas (Leaflet) ─────────────────────────────────────────── */
function criarMapa(idElemento){
  if(typeof L === 'undefined'){
    const el = document.getElementById(idElemento);
    if(el){ const bloco = el.closest('.bloco'); (bloco || el).style.display = 'none'; }
    return null;
  }
  const mapa = L.map(idElemento, {scrollWheelZoom:false});
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution:'© OpenStreetMap · © CARTO', maxZoom:18
  }).addTo(mapa);
  return mapa;
}
function desenharMapaResultados(cidades){
  if(mapaResultados){ mapaResultados.remove(); mapaResultados = null; }
  mapaResultados = criarMapa('mapa-resultados');
  if(!mapaResultados) return;
  const pontos = cidades.map(c => [c.la, c.lo]);
  cidades.forEach((c, i) => L.marker(pontos[i]).addTo(mapaResultados)
    .bindPopup(`<strong>${c.f} ${c.n}</strong><br>${c.p} · ${c.i}`));
  L.polyline(pontos, {color:'#4353ff', weight:3, dashArray:'8 8'}).addTo(mapaResultados);
  mapaResultados.fitBounds(L.latLngBounds(pontos).pad(0.25));
}

/* ── ofertas em conta ────────────────────────────────────────── */

/* banner fotográfico do destino (imagem principal da Wikipédia);
   o gradiente colorido fica como recurso se a fotografia não carregar */
const cacheBanners = {};
function aplicarBanner(cidade, el){
  /* a API REST da Wikipédia exige o título com «_» em vez de espaços */
  const titulo = (cidade.w || cidade.n).replace(/ /g, '_');
  const aplicarFoto = url => {
    if(!url) return;
    const foto = new Image();
    foto.onload = () => {
      const gradiente = el.style.backgroundImage || 'none';
      el.style.backgroundImage = `linear-gradient(rgba(16,18,42,.28), rgba(16,18,42,.6)), url("${url}"), ${gradiente}`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.classList.add('com-foto');
    };
    foto.src = url;
  };
  /* bandeiras, brasões e mapas não servem de banner */
  const imagemInutil = /flag|coat|bandeira|bras[aã]o|escudo|seal|locator|logo|_map/i;
  const procurar = (wiki, t) =>
    fetch('https://' + wiki + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(t))
      .then(r => r.ok ? r.json() : null)
      .then(j => (j && j.thumbnail) ? j.thumbnail.source : null)
      .then(u => (u && !imagemInutil.test(u)) ? u : null)
      .catch(() => null);
  if(titulo in cacheBanners){ aplicarFoto(cacheBanners[titulo]); return; }
  procurar('pt', titulo)
    .then(url => url || procurar('en', (WIKI_EN[cidade.n] || cidade.w || cidade.n).replace(/ /g, '_')))
    .then(url => url || ('https://loremflickr.com/640/360/' + encodeURIComponent(cidade.n) + ',cidade,landmark'))
    .then(url => {
      cacheBanners[titulo] = url || null;
      if(!url) return;
      /* tenta a versão maior; se esse tamanho não existir, usa a miniatura original */
      const grande = url.replace(/\/(\d+)px-/, '/640px-');
      if(grande !== url){
        const teste = new Image();
        teste.onload = () => aplicarFoto(grande);
        teste.onerror = () => aplicarFoto(url);
        teste.src = grande;
      } else {
        aplicarFoto(url);
      }
    });
}

function desenharOfertas(){
  const selector = document.getElementById('ofertas-origem');
  if(!selector.options.length){
    for(const nome of ['Lisboa','Porto','Faro','Funchal','Ponta Delgada']){
      const opt = document.createElement('option'); opt.value = nome; opt.textContent = nome;
      selector.appendChild(opt);
    }
    selector.addEventListener('change', () => { ofertasDesenhadas = false; desenharOfertas(); });
  }
  if(ofertasDesenhadas){
    if(mapaOfertas) setTimeout(() => mapaOfertas.invalidateSize(), 150);
    return;
  }
  ofertasDesenhadas = true;

  const origem = cidadePorNome(selector.value || 'Lisboa');
  const ofertas = calcularOfertas(origem.n);
  document.getElementById('grelha-ofertas').innerHTML = ofertas.map((of, i) => `
    <div class="cartao-oferta">
      <div class="oferta-topo" style="background:${of.gradiente}">
        <span class="desconto">−${of.queda} %</span>
        <span class="oferta-bandeira">${of.destino.f}</span>
        <span class="oferta-cidade">${of.destino.n}</span>
      </div>
      <div class="oferta-corpo">
        <span class="oferta-datas">✈ ${origem.n} → ${of.destino.n} · ${formatarDataCurta(of.ida)} - ${formatarDataCurta(of.volta)}</span>
        <div class="oferta-precos"><span class="oferta-agora">${euros(of.agora)}</span><span class="oferta-tipico">${euros(of.tipico)}</span></div>
        <span class="oferta-poupanca">Poupa ${euros(of.tipico - of.agora)} face ao valor típico em datas anteriores</span>
        <button type="button" class="btn-oferta" data-i="${i}">Ver esta viagem</button>
      </div>
    </div>`).join('');

  document.querySelectorAll('.btn-oferta').forEach(btn =>
    btn.addEventListener('click', () => aplicarOferta(origem, ofertas[+btn.dataset.i])));

  document.querySelectorAll('#grelha-ofertas .oferta-topo').forEach((el, i) =>
    aplicarBanner(ofertas[i].destino, el));

  /* mapa das ofertas */
  if(mapaOfertas){ mapaOfertas.remove(); mapaOfertas = null; }
  mapaOfertas = criarMapa('mapa-ofertas');
  if(mapaOfertas){
    const pontos = [[origem.la, origem.lo]];
    L.marker([origem.la, origem.lo]).addTo(mapaOfertas).bindPopup(`<strong>${origem.f} ${origem.n}</strong><br>Origem`);
    ofertas.forEach(of => {
      pontos.push([of.destino.la, of.destino.lo]);
      const m = L.marker([of.destino.la, of.destino.lo]).addTo(mapaOfertas);
      m.bindTooltip(`${euros(of.agora)}`, {permanent:true, direction:'top', offset:[-15,-8], className:'tooltip-preco'});
      m.bindPopup(`<strong>${of.destino.f} ${of.destino.n}</strong><br>${euros(of.agora)} (antes ${euros(of.tipico)})`);
      m.on('popupopen', () => {});
    });
    mapaOfertas.fitBounds(L.latLngBounds(pontos).pad(0.2));
    setTimeout(() => mapaOfertas.invalidateSize(), 200);
  }
}
function aplicarOferta(origem, of){
  mostrarVista('pesquisa');
  document.querySelector('input[name="tipo-viagem"][value="ida-volta"]').checked = true;
  ESTADO.tipo = 'ida-volta';
  document.getElementById('linha-campos').style.display = '';
  document.getElementById('zona-multi').hidden = true;
  inputOrigem.value = origem.n; ESTADO.origem = origem;
  inputDestino.value = of.destino.n; ESTADO.destino = of.destino;
  ESTADO.ida = of.ida; ESTADO.volta = of.volta;
  document.getElementById('input-partida').value = formatarDataCurta(of.ida);
  document.getElementById('input-regresso').value = formatarDataCurta(of.volta);
  actualizarRotulos();
  executarPesquisa();
}

/* ── grelha de parceiros ─────────────────────────────────────── */
const NOMES_CAT = {voo:'Voos', hotel:'Hotéis', casa:'Casas e apartamentos', hostel:'Hostels',
                   carro:'Aluguer de carros', comboio:'Comboios', autocarro:'Autocarros',
                   actividade:'Actividades', pacote:'Pacotes e viagens organizadas',
                   planeador:'Planeador de rotas', ferry:'Ferries e barcos',
                   organizador:'Organizador de viagem', corporativo:'Viagens de empresa'};
/* ordem por que as secções aparecem; o ícone dá identidade a cada uma */
const ORDEM_CAT = [['voo','✈'], ['hotel','🏨'], ['casa','🏠'], ['hostel','🛏'], ['pacote','🧳'],
                   ['carro','🚗'], ['comboio','🚆'], ['autocarro','🚌'], ['ferry','⛴'],
                   ['actividade','🎟'], ['planeador','🗺'], ['organizador','📋'], ['corporativo','💼']];

function desenharParceiros(){
  /* cada parceiro entra na secção da sua categoria principal (a primeira que
     declara), para não aparecer repetido; as restantes ficam listadas na
     descrição */
  const porCat = {};
  for(const chave of Object.keys(PARCEIROS)){
    const principal = PARCEIROS[chave].cat[0];
    (porCat[principal] = porCat[principal] || []).push(chave);
  }
  const seccoes = ORDEM_CAT.filter(([c]) => porCat[c] && porCat[c].length);
  document.getElementById('grelha-parceiros').innerHTML = seccoes.map(([cat, ico]) => {
    const lista = porCat[cat].sort((a, b) => PARCEIROS[a].nome.localeCompare(PARCEIROS[b].nome, 'pt'));
    return `<section class="parceiros-grupo">
      <h3 class="parceiros-cat">${ico} ${NOMES_CAT[cat]} <span class="parceiros-conta">${lista.length}</span></h3>
      <div class="parceiros-lista">
        ${lista.map(chave => {
          const p = PARCEIROS[chave];
          const outras = p.cat.slice(1).map(c => NOMES_CAT[c]).filter(Boolean);
          return `<div class="parceiro-item">
            ${iconeParceiro(chave)}
            <div>
              <div class="parceiro-nome">${escaparHtml(p.nome)}</div>
              <div class="parceiro-desc">${escaparHtml(p.desc)}</div>
              ${outras.length ? `<div class="parceiro-tags">${outras.map(t => `<span class="parceiro-tag">${escaparHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }).join('');
}

/* ── arranque ────────────────────────────────────────────────── */
document.getElementById('ano').textContent = new Date().getFullYear();
inputOrigem.value = 'Lisboa';
inputOrigem.dataset.cidade = 'Lisboa';
ESTADO.origem = cidadePorNome('Lisboa');
desenharParceiros();
actualizarRotulos();
if(aplicarURL()){ if(ESTADO.explorar) executarExploracao(); else executarPesquisa(); }

/* ── aviso de cookies (consentimento para a afiliação) ───────── */
(function(){
  const aviso = document.getElementById('aviso-cookies');
  if(!aviso) return;
  let escolha = null;
  try{ escolha = localStorage.getItem('tn_cookies'); }catch(e){}
  if(!escolha) aviso.hidden = false;
  const decidir = valor => {
    try{ localStorage.setItem('tn_cookies', valor); }catch(e){}
    aviso.hidden = true;
    if(valor === 'sim' && typeof window.carregarAfiliacao === 'function') window.carregarAfiliacao();
  };
  document.getElementById('cookies-sim').onclick = () => decidir('sim');
  document.getElementById('cookies-nao').onclick = () => decidir('nao');
})();

/* ── tema claro/escuro ───────────────────────────────────────── */
(function(){
  const btn = document.getElementById('btn-tema');
  if(!btn) return;
  const aplicar = tema => {
    document.documentElement.setAttribute('data-tema', tema);
    btn.textContent = tema === 'escuro' ? '☀️' : '🌙';
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content', tema === 'escuro' ? '#0e1020' : '#161938');
  };
  aplicar(document.documentElement.getAttribute('data-tema') || 'claro');
  btn.addEventListener('click', () => {
    const novo = document.documentElement.getAttribute('data-tema') === 'escuro' ? 'claro' : 'escuro';
    try{ localStorage.setItem('tn_tema', novo); }catch(e){}
    aplicar(novo);
  });
})();

/* ── moeda (taxas de câmbio ao vivo) ─────────────────────────── */
function reactualizarTudo(){
  const sec = document.getElementById('resultados');
  if(sec && !sec.hidden){
    if(ESTADO.explorar) desenharExploracao();
    else if(ESTADO.tipo === 'multi'){ if(validarPesquisaMulti(true)) desenharResultadosMulti(); }
    else if(validarPesquisaSimples(true)) desenharResultados();
  }
  const vo = document.getElementById('vista-ofertas');
  if(vo && !vo.hidden){ ofertasDesenhadas = false; desenharOfertas(); }
}
(function(){
  const sel = document.getElementById('sel-moeda');
  if(!sel) return;
  try{ const m = localStorage.getItem('tn_moeda'); if(m && MOEDAS[m]){ MOEDA = m; sel.value = m; } }catch(e){}
  sel.addEventListener('change', () => {
    MOEDA = sel.value;
    try{ localStorage.setItem('tn_moeda', MOEDA); }catch(e){}
    reactualizarTudo();
  });
  fetch('https://open.er-api.com/v6/latest/EUR').then(r => r.ok ? r.json() : null).then(j => {
    if(j && j.rates){ ['USD','GBP','BRL'].forEach(c => { if(j.rates[c]) TAXAS[c] = j.rates[c]; }); TAXAS.EUR = 1; if(MOEDA !== 'EUR') reactualizarTudo(); }
  }).catch(() => {});
})();


/* assinatura */
try{ console.log('%c✦ TripNexus%c  Feito por NightmareFTW','font-weight:800;color:#4da3f5','color:#2cc9b4'); }catch(e){}
