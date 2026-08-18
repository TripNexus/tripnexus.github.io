/* ═════════════════════════════════════════════════════════════
   TripNexus · barras de filtros

   Os filtros dos voos (escalas, hora de partida, companhia, ordenacao) e
   os do alojamento (tipo, faixa de preco, cupao). Sao os dois a mesma
   ideia, com listas diferentes, e por isso partilham o «filtroMulti».
   ═════════════════════════════════════════════════════════════ */

/* ── filtros e ordenação dos voos ────────────────────────────── */

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
