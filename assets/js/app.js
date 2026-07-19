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
function iconeParceiro(chave){
  const p = PARCEIROS[chave];
  return `<span class="icone-parceiro" title="${p.nome}">
    <img src="https://www.google.com/s2/favicons?sz=64&domain=${p.dom}" alt="${p.nome}" loading="lazy"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <span class="letra">${p.nome[0]}</span></span>`;
}
function etiquetaCupao(cupao){
  if(!cupao) return '';
  return `<span class="cupao" title="${cupao.nota || ''}">🎟 ${cupao.codigo} ${cupao.texto}</span>`;
}
function linhaOferta(q, opts){
  const p = PARCEIROS[q.parceiro];
  const o = opts || {};
  return `<div class="linha-oferta ${o.melhor ? 'melhor' : ''}">
    ${iconeParceiro(q.parceiro)}
    <div class="oferta-info">
      <div class="oferta-nome">${p.nome}${o.tag ? ` <span class="alt-tag">${o.tag}</span>` : ''}${o.melhor ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
      ${o.detalhe ? `<div class="oferta-detalhe">${o.detalhe}</div>` : ''}
      ${etiquetaCupao(q.cupao)}
    </div>
    <div class="oferta-preco">
      ${q.cupao ? `<div class="preco-antes">${euros(q.preco)}</div>` : ''}
      <div class="preco-actual">${euros(q.precoFinal)}</div>
    </div>
    <a class="btn-ver" href="${o.url || '#'}" target="_blank" rel="noopener">Ver oferta</a>
  </div>`;
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
      <div class="bloco-titulo">🗺 Destinos no mapa (preço por passageiro)</div>
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
const FILTROS = {ordenar:'preco', escalas:'todas', partida:'qualquer', companhia:'todas'};
function reporFiltros(){
  Object.assign(FILTROS, {ordenar:'preco', escalas:'todas', partida:'qualquer', companhia:'todas'});
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
    (FILTROS.partida === 'qualquer' || faixaPartida(q.partida) === FILTROS.partida) &&
    (FILTROS.companhia === 'todas' || q.companhia === FILTROS.companhia));
  if(FILTROS.ordenar === 'duracao') v.sort((a, b) => minutosDuracao(a.duracao) - minutosDuracao(b.duracao));
  else if(FILTROS.ordenar === 'partida') v.sort((a, b) => String(a.partida).localeCompare(String(b.partida)));
  else v.sort((a, b) => a.precoFinal - b.precoFinal);
  return v;
}
function barraFiltros(companhias){
  /* mantém a companhia escolhida visível mesmo que não exista nesta vista */
  if(FILTROS.companhia !== 'todas' && !companhias.includes(FILTROS.companhia))
    companhias = [FILTROS.companhia, ...companhias];
  const op = (v, txt, actual) => `<option value="${v}"${v === actual ? ' selected' : ''}>${txt}</option>`;
  return `<div class="filtros-voos">
    <label>Ordenar <select data-filtro="ordenar">${op('preco','Mais barato',FILTROS.ordenar)}${op('duracao','Mais rápido',FILTROS.ordenar)}${op('partida','Partida mais cedo',FILTROS.ordenar)}</select></label>
    <label>Escalas <select data-filtro="escalas">${op('todas','Todas',FILTROS.escalas)}${op('directos','Só directos',FILTROS.escalas)}${op('ate1','Até 1 escala',FILTROS.escalas)}</select></label>
    <label>Partida <select data-filtro="partida">${op('qualquer','Qualquer hora',FILTROS.partida)}${op('manha','Manhã (06h a 12h)',FILTROS.partida)}${op('tarde','Tarde (12h a 18h)',FILTROS.partida)}${op('noite','Noite (18h a 24h)',FILTROS.partida)}${op('madrugada','Madrugada (00h a 06h)',FILTROS.partida)}</select></label>
    <label>Companhia <select data-filtro="companhia">${op('todas','Todas',FILTROS.companhia)}${companhias.map(c => op(c, c, FILTROS.companhia)).join('')}</select></label>
  </div>`;
}
function ligarFiltrosVoos(raiz, aoMudar){
  raiz.querySelectorAll('.filtros-voos select').forEach(s =>
    s.onchange = () => { FILTROS[s.dataset.filtro] = s.value; aoMudar(); });
  const repor = raiz.querySelector('#repor-filtros');
  if(repor) repor.onclick = () => { reporFiltros(); aoMudar(); };
}

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
        <div class="bloco" id="bloco-evolucao">
          <div class="bloco-titulo">📈 Evolução do preço do voo</div>
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
  return `<div class="bloco">
    <div class="bloco-titulo">🌡 Sobre ${d.n}</div>
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
  const alojamentos = ESTADO.alojamento.length ? cotacoesAlojamento(d, ida, fimEstadia, ESTADO.pax, tiposAlojamento()) : [];
  const melhorAloj = alojamentos[0] || null;
  const carros = ESTADO.transportes.includes('carro') ? cotacoesCarro(d, ida, fimEstadia) : null;
  const melhorCarro = carros ? carros[0] : null;
  const tp = ESTADO.transportes.includes('metro') ? estimativaTransportesPublicos(d, noites + 1, ESTADO.pax) : null;
  const actividades = cotacoesActividades(d, ESTADO.pax);

  /* total e pacotes */
  const extras = ESTADO.extras.length ? custoExtras(ESTADO.extras, ESTADO.pax, !!volta, noites) : [];
  let total = melhorVoo.precoFinal;
  if(melhorAloj) total += melhorAloj.precoFinal;
  if(melhorCarro) total += melhorCarro.precoFinal;
  if(tp) total += tp.total;
  for(const x of extras) total += x.total;
  const somaPacote = melhorVoo.precoFinal + (melhorAloj ? melhorAloj.precoFinal : 0) + (melhorCarro ? melhorCarro.precoFinal : 0);
  const pacotes = (volta && melhorAloj) ? cotacoesPacote(o, d, ida, volta, ESTADO.classe, ESTADO.pax, somaPacote, !!melhorCarro) : [];
  const melhorPacote = pacotes[0] || null;

  const nCupoes = [...todosVoos, ...alojamentos, ...(carros || []), ...(terrestre && terrestre.viavel ? terrestre.linhas : []), ...pacotes]
    .filter(x => x.cupao).length;

  const tiposAloj = {hotel:'Hotel', casa:'Casa / apartamento', hostel:'Hostel'};
  const n = totalPax();

  let html = `
    <div class="res-cabecalho">
      <h2>${o.f} ${o.n} ✈ ${d.f} ${d.n}</h2>
      <span class="res-detalhe">${formatarDataCurta(ida)}${volta ? ' - ' + formatarDataCurta(volta) : ' (só ida)'} ·
        ${n} ${n === 1 ? 'passageiro' : 'passageiros'} · ${NOME_CLASSE[ESTADO.classe]}
        ${nCupoes ? ` · <strong>🎟 ${nCupoes} ${nCupoes === 1 ? 'cupão encontrado' : 'cupões encontrados'}</strong>` : ''}</span>
    </div>
    <div class="res-grelha">
      <div class="res-coluna">

        <div class="bloco" id="bloco-voos">
          <div class="bloco-titulo">✈ Voos · ${todosVoos.length} sites comparados</div>
          ${barraFiltros(companhias)}
          ${voos.length ? voos.slice(0, 10).map(q => linhaOferta(q, {
            melhor: q === melhorVoo,
            detalhe: `${q.companhia} · ${q.escalas === 0 ? 'directo' : q.escalas + (q.escalas === 1 ? ' escala' : ' escalas')} · ${q.duracao} · partida ${q.partida}`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'voo'})
          })).join('') : '<p class="bloco-sub">Nenhum voo cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros">Repor filtros</button></p>'}
        </div>

        ${terrestre ? `
        <div class="bloco">
          <div class="bloco-titulo">🚆 Alternativa terrestre (comboio / autocarro)</div>
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

        ${alojamentos.length ? `
        <div class="bloco" id="bloco-alojamento">
          <div class="bloco-titulo">🏨 Alojamento em ${d.n} · ${noites} ${noites === 1 ? 'noite' : 'noites'}</div>
          ${alojamentos.slice(0,6).map((q, idx) => linhaOferta(q, {
            melhor: idx === 0, tag: tiposAloj[q.tipo],
            detalhe: `${q.descricao} · ${euros(q.porNoite)}/noite × ${q.noites} ${q.noites === 1 ? 'noite' : 'noites'}${q.tipo === 'hostel' ? ' × ' + q.quartos + ' camas' : (q.quartos > 1 ? ' × ' + q.quartos + ' quartos' : '')}`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'hotel'})
          })).join('')}
        </div>` : ''}

        ${carros ? `
        <div class="bloco">
          <div class="bloco-titulo">🚗 Carro privado alugado · ${carros[0].dias} ${carros[0].dias === 1 ? 'dia' : 'dias'}</div>
          ${carros.slice(0, 6).map((q, idx) => linhaOferta(q, {
            melhor: idx === 0,
            detalhe: `${q.descricao} · ${euros(q.porDia)}/dia`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'carro'})
          })).join('')}
        </div>` : ''}

        <div class="bloco">
          <div class="bloco-titulo">🎟 Actividades em ${d.n}</div>
          <p class="bloco-sub">Sugestões opcionais, não incluídas no total. Preços para ${actividades[0].pessoas} ${actividades[0].pessoas === 1 ? 'pessoa' : 'pessoas'}.</p>
          ${actividades.map((q, idx) => linhaOferta(q, {
            melhor: idx === 0, detalhe: q.descricao,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'actividade'})
          })).join('')}
        </div>
      </div>

      <div class="res-coluna">
        <div class="bloco resumo">
          <div class="bloco-titulo">🧾 Total estimado da viagem</div>
          <div class="resumo-linha"><span>✈ Voo (${PARCEIROS[melhorVoo.parceiro].nome})</span><strong>${euros(melhorVoo.precoFinal)}</strong></div>
          ${melhorAloj ? `<div class="resumo-linha"><span>🏨 ${tiposAloj[melhorAloj.tipo]} (${PARCEIROS[melhorAloj.parceiro].nome})</span><strong>${euros(melhorAloj.precoFinal)}</strong></div>` : ''}
          ${melhorCarro ? `<div class="resumo-linha"><span>🚗 Carro (${PARCEIROS[melhorCarro.parceiro].nome})</span><strong>${euros(melhorCarro.precoFinal)}</strong></div>` : ''}
          ${tp ? `<div class="resumo-linha"><span>🚇 Transportes públicos (${tp.dias} dias × ${tp.pessoas} ${tp.pessoas === 1 ? 'pessoa' : 'pessoas'})</span><strong>${euros(tp.total)}</strong></div>` : ''}
          ${extras.map(x => `<div class="resumo-linha"><span>${x.nome} (${x.detalhe})</span><strong>${euros(x.total)}</strong></div>`).join('')}
          <div class="resumo-total"><span>Total (${n} ${n === 1 ? 'passageiro' : 'passageiros'})</span><span class="valor-total">${euros(total)}</span></div>
          <p class="resumo-nota">Combinação mais barata encontrada, com cupões já descontados. Valores estimados, confirmados no site de cada parceiro.</p>
          <div class="accoes-resumo" id="accoes-resumo"></div>
        </div>

        ${blocoEvolucao(o, d, ida, melhorVoo.precoFinal)}

        ${pacotes.length ? `
        <div class="bloco">
          <div class="bloco-titulo">📦 Pacotes (voo + alojamento${melhorCarro ? ' + carro' : ''})</div>
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

        <div class="bloco">
          <div class="bloco-titulo">🗺 Mapa da viagem</div>
          <div id="mapa-resultados" class="mapa"></div>
        </div>
        ${blocoDestino(d)}
      </div>
    </div>`;

  const sec = document.getElementById('resultados');
  sec.innerHTML = html;
  sec.hidden = false;
  desenharMapaResultados([o, d]);
  ligarFiltrosVoos(sec, desenharResultados);
  if(typeof montarAccoesResumo === 'function') montarAccoesResumo(sec, ctx, melhorVoo);
  if(typeof actualizarVoosReais === 'function') actualizarVoosReais(ctx);
  if(typeof actualizarAlojamentoReal === 'function') actualizarAlojamentoReal(ctx);
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
          <div class="bloco-titulo">✈ Voos (todos os trocos) · ${voos.length} sites comparados</div>
          ${voos.map((q, idx) => linhaOferta(q, {melhor: idx === 0, detalhe: q.detalhe, url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'voo'})})).join('')}
        </div>
        ${ESTADO.alojamento.length ? `
        <div class="bloco">
          <div class="bloco-titulo">🏨 Alojamento por cidade</div>
          ${estadias.map(e => e.melhor ? linhaOferta(e.melhor, {
            tag: e.cidade.n,
            detalhe: `${e.melhor.descricao} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'} desde ${formatarDataCurta(e.inicio)}`,
            url: ligacaoParceiro(e.melhor.parceiro, {destino:e.cidade, ida:e.inicio, volta:e.fim, adultos:ESTADO.pax.adultos, criancas:ESTADO.pax.criancas, classe:ESTADO.classe, seccao:'hotel'})
          }) : '').join('')}
        </div>` : ''}
      </div>
      <div class="res-coluna">
        <div class="bloco resumo">
          <div class="bloco-titulo">🧾 Total estimado da viagem</div>
          <div class="resumo-linha"><span>✈ Voos · ${trocos.length} trocos (${PARCEIROS[melhorVoo.parceiro].nome})</span><strong>${euros(melhorVoo.precoFinal)}</strong></div>
          ${estadias.filter(e => e.melhor).map(e => `<div class="resumo-linha"><span>🏨 ${e.cidade.n} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'} (${PARCEIROS[e.melhor.parceiro].nome})</span><strong>${euros(e.melhor.precoFinal)}</strong></div>`).join('')}
          <div class="resumo-total"><span>Total (${n} ${n === 1 ? 'passageiro' : 'passageiros'})</span><span class="valor-total">${euros(total)}</span></div>
          <p class="resumo-nota">Os pacotes e o aluguer de carro estão disponíveis nas pesquisas de ida e volta. Valores estimados.</p>
          <div class="accoes-resumo" id="accoes-resumo"></div>
        </div>
        <div class="bloco">
          <div class="bloco-titulo">🗺 Mapa da viagem</div>
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
function desenharParceiros(){
  const nomesCat = {voo:'Voos', hotel:'Hotéis', casa:'Casas e apartamentos', hostel:'Hostels',
                    carro:'Aluguer de carros', comboio:'Comboios', autocarro:'Autocarros',
                    actividade:'Actividades', pacote:'Pacotes', planeador:'Planeador de rotas', ferry:'Ferries e barcos', organizador:'Organizador de viagem', corporativo:'Viagens de empresa'};
  document.getElementById('grelha-parceiros').innerHTML = Object.keys(PARCEIROS).map(chave => {
    const p = PARCEIROS[chave];
    return `<div class="parceiro-item">
      ${iconeParceiro(chave)}
      <div>
        <div class="parceiro-nome">${p.nome}</div>
        <div class="parceiro-desc">${p.cat.map(c => nomesCat[c]).join(' · ')}: ${p.desc}</div>
      </div>
    </div>`;
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
