/* ═══════════════════════════════════════════════════════════════
   TripNexus: preços em tempo real (opcional)
   Quando window.TRIPNEXUS_API aponta para o backend (ver
   backend/README.md), o bloco de voos passa a mostrar tarifas
   reais obtidas na hora; sem backend configurado, o site mantém
   as estimativas do motor local. Os filtros e a ordenação do
   bloco de voos aplicam-se também às tarifas reais.
   ═══════════════════════════════════════════════════════════════ */

/* Alojamento com preços reais: embebe o widget de hotéis do Hotellook
   (Travelpayouts), que mostra tarifas reais e monetiza via afiliação, sem
   custo e sem chave. O destino e as datas da pesquisa são passados ao
   widget. Fica sempre uma ligação garantida a preços reais, caso o script
   do widget demore ou não carregue. Sem widget configurado, o bloco mantém
   as estimativas locais. */
function actualizarAlojamentoReal(ctx){
  const bloco = document.getElementById('bloco-alojamento');
  const src = (window.TRIPNEXUS_HOTEL_WIDGET_SRC || '').trim();
  if(!bloco || !src || !ctx.destino || !ctx.ida || !ctx.fim) return;
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  /* nome anglófono, mais reconhecível para os motores de hotéis */
  const destino = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
  const extra = new URLSearchParams({destination: destino, checkIn: f(ctx.ida), checkOut: f(ctx.fim), adults: String(ctx.adultos || 2), currency: 'eur', locale: 'pt'});
  const url = src + (src.includes('?') ? '&' : '?') + extra.toString();
  const liga = ligacaoParceiro('booking', {...ctx, seccao:'hotel'});
  bloco.innerHTML = `
    <div class="bloco-titulo">🏨 Alojamento em ${ctx.destino.n} · preços reais</div>
    <p class="bloco-sub tempo-real">⚡ Preços reais de hotéis (Hotellook) para ${ctx.destino.n}, nas suas datas. A reserva é concluída no parceiro.</p>
    <div class="widget-hoteis" id="widget-hoteis" style="min-height:56px;margin:.5rem 0"></div>
    <div class="linha-oferta">
      <span class="icone-parceiro"><span class="letra" style="display:flex">🏨</span></span>
      <div class="oferta-info"><div class="oferta-nome">Ver todos os hotéis em ${ctx.destino.n}</div>
      <div class="oferta-detalhe">Comparação de tarifas reais em dezenas de sites</div></div>
      <a class="btn-ver" href="${liga}" target="_blank" rel="noopener">Ver preços</a>
    </div>
    <p class="bloco-sub">Casas e hostels continuam nas estimativas locais.</p>`;
  const alvo = bloco.querySelector('#widget-hoteis');
  if(alvo){
    const s = document.createElement('script');
    s.async = true; s.charset = 'utf-8'; s.src = url;
    alvo.appendChild(s);
  }
}

async function actualizarVoosReais(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-voos');
  if(!base || !bloco || !ctx.origem || !ctx.destino || !ctx.ida) return;
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  try{
    const ps = new URLSearchParams({
      origem: ctx.origem.i, destino: ctx.destino.i, ida: f(ctx.ida),
      adultos: ctx.adultos || 1, criancas: ctx.criancas || 0, classe: ctx.classe || 'economica'
    });
    if(ctx.volta) ps.set('volta', f(ctx.volta));
    const r = await fetch(base + '/voos?' + ps);
    if(!r.ok) return;
    const dados = await r.json();
    if(!dados || !Array.isArray(dados.ofertas) || !dados.ofertas.length) return;

    const lista = dados.ofertas.map(v => Object.assign({}, v, {precoFinal: v.preco}));
    const companhias = [...new Set(lista.map(v => v.companhia).filter(Boolean))].sort();
    const haFiltros = typeof aplicarFiltrosVoos === 'function';
    const visiveis = haFiltros ? aplicarFiltrosVoos(lista) : lista;
    const melhor = visiveis.length ? visiveis.reduce((m, v) => v.precoFinal < m.precoFinal ? v : m) : null;

    const liga = ligacaoParceiro('skyscanner', {...ctx, seccao:'voo'});
    const notaClasse = (dados.classe === 'economica' && ctx.classe && ctx.classe !== 'economica')
      ? '<p class="bloco-sub">Nota: as tarifas reais disponíveis para esta rota são em classe económica.</p>' : '';
    bloco.innerHTML = `
      <div class="bloco-titulo">✈ Voos · tarifas reais</div>
      <p class="bloco-sub tempo-real">⚡ Tarifas reais registadas nas últimas horas (Aviasales/Travelpayouts). Total para todos os passageiros.</p>
      ${notaClasse}
      ${typeof barraFiltros === 'function' ? barraFiltros(companhias) : ''}
      ${visiveis.length ? visiveis.slice(0, 8).map(v => `
        <div class="linha-oferta ${v === melhor ? 'melhor' : ''}">
          <span class="icone-parceiro"><span class="letra" style="display:flex">${(v.companhia || '?')[0]}</span></span>
          <div class="oferta-info">
            <div class="oferta-nome">${v.companhia || 'Companhia aérea'}${v === melhor ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${[
              v.escalas === 0 ? 'directo' : v.escalas + (v.escalas === 1 ? ' escala' : ' escalas'),
              v.duracao,
              v.partida ? 'partida ' + v.partida : ''
            ].filter(Boolean).join(' · ')}</div>
          </div>
          <div class="oferta-preco"><div class="preco-actual">${euros(v.precoFinal)}</div></div>
          <a class="btn-ver" href="${liga}" target="_blank" rel="noopener">Reservar</a>
        </div>`).join('') : '<p class="bloco-sub">Nenhum voo cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros">Repor filtros</button></p>'}
      <p class="bloco-sub">A reserva é concluída no site do parceiro, já com a rota e as datas preenchidas.</p>`;
    if(typeof ligarFiltrosVoos === 'function') ligarFiltrosVoos(bloco, desenharResultados);
  }catch(e){
    /* sem rede ou backend indisponível: ficam as estimativas locais */
  }
}
