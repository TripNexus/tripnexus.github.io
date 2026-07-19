/* ═══════════════════════════════════════════════════════════════
   TripNexus: alertas de preço, favoritos e pesquisas recentes
   Tudo guardado no browser (localStorage). Os alertas são
   verificados a cada visita: com o backend configurado usam
   tarifas reais; sem ele, as estimativas locais.
   ═══════════════════════════════════════════════════════════════ */

const LS_ALERTAS = 'tn_alertas', LS_HIST = 'tn_historico', LS_FAV = 'tn_favoritos';

function lerLS(chave){
  try{ return JSON.parse(localStorage.getItem(chave)) || []; }catch(e){ return []; }
}
function gravarLS(chave, valor){
  try{ localStorage.setItem(chave, JSON.stringify(valor)); }catch(e){}
}

/* ── rótulos ─────────────────────────────────────────────────── */
function rotuloPesquisaActual(){
  if(ESTADO.tipo === 'multi')
    return ESTADO.trocos.map(t => t.origem.n).join(' → ') + ' → ' + ESTADO.trocos[ESTADO.trocos.length - 1].destino.n;
  return `${ESTADO.origem.n} → ${ESTADO.destino.n} · ${formatarDataCurta(ESTADO.ida)}${ESTADO.volta ? ' - ' + formatarDataCurta(ESTADO.volta) : ''}`;
}
function rotuloAlerta(al){
  const o = cidadePorNome(al.origem), d = cidadePorNome(al.destino);
  return `${o ? o.n : al.origem} → ${d ? d.n : al.destino}`;
}

/* ── favoritos e pesquisas recentes ──────────────────────────── */
function registarHistorico(){
  const url = urlDaPesquisa();
  const hist = lerLS(LS_HIST).filter(h => h.url !== url);
  hist.unshift({url, rotulo: rotuloPesquisaActual(), quando: Date.now()});
  gravarLS(LS_HIST, hist.slice(0, 8));
  desenharGuardados();
}
function alternarFavorito(){
  const url = urlDaPesquisa();
  let favs = lerLS(LS_FAV);
  if(favs.some(f => f.url === url)) favs = favs.filter(f => f.url !== url);
  else favs.unshift({url, rotulo: rotuloPesquisaActual(), quando: Date.now()});
  gravarLS(LS_FAV, favs.slice(0, 12));
  desenharGuardados();
}
function ehFavorito(){
  try{ return lerLS(LS_FAV).some(f => f.url === urlDaPesquisa()); }catch(e){ return false; }
}
function abrirGuardado(url){
  try{ history.replaceState({}, '', url); }catch(e){}
  if(typeof mostrarVista === 'function') mostrarVista('pesquisa');
  if(aplicarURL()) executarPesquisa();
}
function desenharGuardados(){
  const zona = document.getElementById('zona-guardados');
  if(!zona) return;
  const favs = lerLS(LS_FAV), hist = lerLS(LS_HIST);
  if(!favs.length && !hist.length){ zona.hidden = true; return; }
  const chip = (x, fav) =>
    `<span class="chip-guardado${fav ? ' fav' : ''}" data-url="${x.url.replace(/"/g, '&quot;')}" role="button" tabindex="0">
      ${fav ? '★' : '🕘'} ${x.rotulo}
      <button type="button" class="chip-x" data-remover="${fav ? 'fav' : 'hist'}" title="Remover">✕</button>
    </span>`;
  zona.innerHTML =
    (favs.length ? `<p class="guardados-titulo">Favoritos</p><div class="chips">${favs.map(f => chip(f, true)).join('')}</div>` : '') +
    (hist.length ? `<p class="guardados-titulo">Pesquisas recentes</p><div class="chips">${hist.map(h => chip(h, false)).join('')}</div>` : '');
  zona.hidden = false;
  zona.querySelectorAll('.chip-guardado').forEach(c => {
    c.addEventListener('click', e => {
      const url = c.dataset.url;
      const remover = e.target.closest('.chip-x');
      if(remover){
        const chave = remover.dataset.remover === 'fav' ? LS_FAV : LS_HIST;
        gravarLS(chave, lerLS(chave).filter(x => x.url !== url));
        desenharGuardados();
        return;
      }
      abrirGuardado(url);
    });
  });
}

/* ── alertas de preço ────────────────────────────────────────── */

/* melhor preço actual do voo do alerta (tarifas reais quando há backend) */
function precoActualAlerta(al){
  const o = cidadePorNome(al.origem), d = cidadePorNome(al.destino);
  const ida = deISO(al.ida), volta = al.volta ? deISO(al.volta) : null;
  if(!o || !d || !ida) return Promise.resolve(null);
  const pax = {adultos: al.adultos || 1, criancas: al.criancas || 0, bebes: 0};
  const local = () => {
    let melhor = Infinity;
    for(const c of ['google','skyscanner','kayak','momondo','edreams','expedia','trip']){
      const q = cotacaoVoo(c, o, d, ida, volta, al.classe || 'economica', pax);
      if(q.precoFinal < melhor) melhor = q.precoFinal;
    }
    return melhor;
  };
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  if(!base) return Promise.resolve(local());
  const ps = new URLSearchParams({origem: o.i, destino: d.i, ida: al.ida,
    adultos: pax.adultos, criancas: pax.criancas, classe: al.classe || 'economica'});
  if(al.volta) ps.set('volta', al.volta);
  return fetch(base + '/voos?' + ps)
    .then(r => r.ok ? r.json() : null)
    .then(j => (j && j.ofertas && j.ofertas.length) ? j.ofertas[0].preco : local())
    .catch(local);
}

function criarAlerta(ctx, limite){
  const alertas = lerLS(LS_ALERTAS);
  alertas.unshift({
    id: Date.now(),
    origem: ctx.origem.i, destino: ctx.destino.i,
    ida: fISO(ctx.ida), volta: ctx.volta ? fISO(ctx.volta) : '',
    adultos: ctx.adultos || 1, criancas: ctx.criancas || 0, classe: ctx.classe || 'economica',
    limite: Math.round(limite), ultimoPreco: null, notificadoA: null, criado: Date.now()
  });
  gravarLS(LS_ALERTAS, alertas.slice(0, 20));
  if('Notification' in window && Notification.permission === 'default'){
    try{ Notification.requestPermission(); }catch(e){}
  }
  actualizarBadgeAlertas();
  verificarAlertas();
}

async function verificarAlertas(){
  const alertas = lerLS(LS_ALERTAS);
  if(!alertas.length){ actualizarBadgeAlertas(); return; }
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  for(const al of alertas){
    const ida = deISO(al.ida);
    al.expirado = !ida || ida < hoje;
    if(al.expirado) continue;
    const preco = await precoActualAlerta(al);
    if(preco == null || !isFinite(preco)) continue;
    al.ultimoPreco = Math.round(preco);
    al.ultimaVerificacao = Date.now();
    /* avisa quando desce abaixo do limite, e volta a avisar só se descer ainda mais */
    if(al.ultimoPreco <= al.limite && (al.notificadoA == null || al.ultimoPreco < al.notificadoA)){
      al.notificadoA = al.ultimoPreco;
      avisarAlerta(al);
    }
  }
  gravarLS(LS_ALERTAS, alertas);
  actualizarBadgeAlertas();
}

function urlDoAlerta(al){
  const ps = new URLSearchParams({tipo: al.volta ? 'ida-volta' : 'so-ida',
    de: al.origem, para: al.destino, ida: al.ida, adultos: al.adultos, classe: al.classe});
  if(al.volta) ps.set('volta', al.volta);
  if(al.criancas) ps.set('criancas', al.criancas);
  return '?' + ps.toString();
}

function avisarAlerta(al){
  const texto = `${rotuloAlerta(al)} está a ${al.ultimoPreco} €, abaixo do seu limite de ${al.limite} €`;
  const zona = document.getElementById('avisos');
  if(zona){
    const el = document.createElement('div');
    el.className = 'aviso';
    el.innerHTML = `🔔 ${texto}
      <button type="button" class="aviso-ver">Ver</button>
      <button type="button" class="aviso-fechar" title="Fechar">✕</button>`;
    zona.appendChild(el);
    el.querySelector('.aviso-ver').onclick = () => { el.remove(); abrirGuardado(urlDoAlerta(al)); };
    el.querySelector('.aviso-fechar').onclick = () => el.remove();
    setTimeout(() => el.remove(), 25000);
  }
  if('Notification' in window && Notification.permission === 'granted'){
    try{ new Notification('TripNexus: alerta de preço', {body: texto, icon: 'assets/img/favicon.svg'}); }catch(e){}
  }
}

function actualizarBadgeAlertas(){
  const badge = document.getElementById('alertas-badge');
  if(!badge) return;
  const alertas = lerLS(LS_ALERTAS);
  const abaixo = alertas.filter(a => !a.expirado && a.ultimoPreco != null && a.ultimoPreco <= a.limite).length;
  badge.textContent = abaixo || alertas.length || '';
  badge.hidden = !alertas.length;
  badge.classList.toggle('activo', abaixo > 0);
}

function desenharPainelAlertas(){
  const painel = document.getElementById('painel-alertas');
  const alertas = lerLS(LS_ALERTAS);
  painel.innerHTML = `<div class="painel-alertas-topo"><strong>🔔 Alertas de preço</strong>
      <button type="button" id="fechar-alertas" title="Fechar">✕</button></div>` +
    (alertas.length ? alertas.map(al => `
      <div class="alerta-item${al.expirado ? ' expirado' : ''}">
        <div>
          <div class="alerta-rota">${rotuloAlerta(al)}</div>
          <div class="alerta-detalhe">${al.ida}${al.volta ? ' a ' + al.volta : ' (só ida)'} · avisar abaixo de ${al.limite} €${
            al.expirado ? ' · <strong>expirado</strong>'
            : (al.ultimoPreco != null ? ` · agora: <strong class="${al.ultimoPreco <= al.limite ? 'abaixo' : ''}">${al.ultimoPreco} €</strong>` : '')
          }</div>
        </div>
        <button type="button" class="alerta-abrir" data-id="${al.id}" ${al.expirado ? 'disabled' : ''}>Ver</button>
        <button type="button" class="alerta-remover" data-id="${al.id}" title="Remover">✕</button>
      </div>`).join('')
    : '<p class="alerta-vazio">Ainda não tem alertas. Faça uma pesquisa e carregue em «Alerta de preço» no cartão do total da viagem.</p>');
  painel.querySelector('#fechar-alertas').onclick = () => { painel.hidden = true; };
  painel.querySelectorAll('.alerta-remover').forEach(b => b.onclick = () => {
    gravarLS(LS_ALERTAS, lerLS(LS_ALERTAS).filter(a => a.id !== +b.dataset.id));
    desenharPainelAlertas(); actualizarBadgeAlertas();
  });
  painel.querySelectorAll('.alerta-abrir').forEach(b => b.onclick = () => {
    const al = lerLS(LS_ALERTAS).find(a => a.id === +b.dataset.id);
    if(al){ painel.hidden = true; abrirGuardado(urlDoAlerta(al)); }
  });
}

/* botões «Guardar pesquisa» e «Alerta de preço» no resumo (chamado pelo app.js) */
function montarAccoesResumo(raiz, ctx, melhorVoo){
  const zona = raiz.querySelector('#accoes-resumo');
  if(!zona) return;
  const fav = ehFavorito();
  zona.innerHTML = `
    <button type="button" class="btn-resumo" id="btn-favorito">${fav ? '★ Guardado nos favoritos' : '☆ Guardar pesquisa'}</button>
    ${melhorVoo && ctx.origem && ctx.destino && ctx.ida ? '<button type="button" class="btn-resumo" id="btn-alerta">🔔 Alerta de preço</button>' : ''}
    <span id="forma-alerta" hidden></span>`;
  zona.querySelector('#btn-favorito').onclick = () => { alternarFavorito(); montarAccoesResumo(raiz, ctx, melhorVoo); };
  const btnAlerta = zona.querySelector('#btn-alerta');
  if(btnAlerta) btnAlerta.onclick = () => {
    const forma = zona.querySelector('#forma-alerta');
    const sugestao = Math.max(10, Math.round(melhorVoo.precoFinal * 0.9));
    forma.hidden = false;
    forma.innerHTML = `avisar quando o voo descer de
      <input type="number" id="alerta-limite" min="1" value="${sugestao}"> €
      <button type="button" class="btn-resumo" id="alerta-criar">Criar</button>`;
    zona.querySelector('#alerta-criar').onclick = () => {
      const limite = +zona.querySelector('#alerta-limite').value;
      if(!(limite > 0)) return;
      criarAlerta(ctx, limite);
      montarAccoesResumo(raiz, ctx, melhorVoo);
      const ok = document.createElement('span');
      ok.className = 'alerta-confirmado';
      ok.textContent = '🔔 Alerta criado: verificamos o preço a cada visita.';
      zona.appendChild(ok);
    };
  };
}

/* ── arranque (depois de todos os módulos carregados) ────────── */
(function(){
  const btn = document.getElementById('btn-alertas');
  const painel = document.getElementById('painel-alertas');
  if(btn && painel){
    btn.addEventListener('click', e => {
      e.stopPropagation();
      painel.hidden = !painel.hidden;
      if(!painel.hidden) desenharPainelAlertas();
    });
    painel.addEventListener('click', e => e.stopPropagation());
    document.addEventListener('click', () => { painel.hidden = true; });
  }
  window.addEventListener('load', () => {
    desenharGuardados();
    verificarAlertas();
  });
})();
