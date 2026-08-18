/* ═════════════════════════════════════════════════════════════
   TripNexus · arranque

   O que corre quando a pagina abre, e so isso: valores iniciais, aviso de
   cookies, tema claro/escuro e moeda. Tem de ser o ultimo script do
   index.html, porque le coisas que os outros declaram.
   Vai em ultimo porque le coisas que os outros declaram: o inputOrigem do
   form.js, o aplicarURL() do search.js, o desenharParceiros() do offers.js.
   A ordem completa esta no cabecalho do ui.js.
   ═════════════════════════════════════════════════════════════ */

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
