/* ═════════════════════════════════════════════════════════════
   TripNexus · da pesquisa aos resultados

   O que transforma o cartao numa pesquisa: o endereco partilhavel, a
   validacao dos campos, o ecra de carregamento, e o modo «explorar», que e
   a pesquisa com o destino em branco.

   Carrega antes do form.js: e o form.js que precisa deste ao carregar, e
   nao o contrario. O que este chama la dentro (resolverCidades) so corre
   quando o utilizador carrega em «Pesquisar».
   ═════════════════════════════════════════════════════════════ */

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
    <p class="nota-estimativa" style="margin:1.2rem 0 .3rem"><span aria-hidden="true">≈</span><span><strong>Valores estimados</strong> para ordenar os destinos por preço. Escolha um para ver as tarifas reais dessa rota.</span></p>
    <div class="grelha-ofertas" id="grelha-explorar">
      ${top.map(x => `
        <div class="cartao-oferta">
          <div class="oferta-topo" style="background:${x.gradiente}">
            <span class="oferta-bandeira">${x.cidade.f}</span>
            <span class="oferta-cidade">${x.cidade.n}</span>
          </div>
          <div class="oferta-corpo">
            <span class="oferta-datas">✈ ${o.n} → ${x.cidade.n} · ${x.cidade.p}</span>
            <div class="oferta-precos"><span class="oferta-agora">≈ ${euros(x.preco)}</span><span class="oferta-tipico" style="text-decoration:none">${idaVolta ? 'ida e volta' : 'só ida'}</span></div>
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
    m.bindTooltip(`≈ ${euros(x.preco)}`, {permanent:true, direction:'top', offset:[-15,-8], className:'tooltip-preco'});
    m.bindPopup(`<strong>${x.cidade.f} ${x.cidade.n}</strong><br>≈ ${euros(x.preco)} ${idaVolta ? 'ida e volta' : 'só ida'} · estimativa<br><em>carregue para ver a viagem</em>`);
    m.on('click', () => escolherDestinoExplorado(x.cidade));
  });
  mapaExplorar.fitBounds(L.latLngBounds(pontos).pad(0.15));
  setTimeout(() => mapaExplorar.invalidateSize(), 150);
}
