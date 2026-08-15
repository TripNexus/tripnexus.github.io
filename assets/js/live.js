/* ═══════════════════════════════════════════════════════════════
   TripNexus: preços em tempo real (opcional)
   Quando window.TRIPNEXUS_API aponta para o backend (ver
   backend/README.md), o bloco de voos passa a mostrar tarifas
   reais obtidas na hora; sem backend configurado, o site mantém
   as estimativas do motor local. Os filtros e a ordenação do
   bloco de voos aplicam-se também às tarifas reais.
   ═══════════════════════════════════════════════════════════════ */

/* Alojamento com preços reais: hotéis e alojamento local vêm do mesmo motor
   (Google Hotels, via SerpApi) em dois pedidos paralelos, e são apresentados
   na mesma lista, ordenados por preço e com o tipo assinalado. */
async function actualizarAlojamentoReal(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-alojamento');
  if(!base || !bloco || !ctx.destino || !ctx.ida || !ctx.fim) return;
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  /* nome mais reconhecível para a pesquisa (Google Hotels é anglófono) */
  const nomePesquisa = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
  const ps = new URLSearchParams({cidade: nomePesquisa, checkin: f(ctx.ida), checkout: f(ctx.fim), adultos: ctx.adultos || 2});

  /* respeita os tipos de alojamento escolhidos na pesquisa */
  const tipos = (typeof tiposAlojamento === 'function') ? tiposAlojamento() : ['hotel','casa'];
  const buscar = async rota => {
    try{
      const r = await fetch(base + rota + '?' + ps);
      if(!r.ok) return [];
      const d = await r.json();
      return (d && Array.isArray(d.ofertas)) ? d.ofertas : [];
    }catch(e){ return []; }
  };
  const [hoteis, casas] = await Promise.all([
    tipos.includes('hotel') ? buscar('/hoteis') : Promise.resolve([]),
    tipos.includes('casa')  ? buscar('/casas')  : Promise.resolve([])
  ]);
  const lista = [
    ...hoteis.map(h => ({...h, cat:'hotel'})),
    ...casas.map(h => ({...h, cat:'casa'}))
  ].sort((a, b) => a.preco - b.preco);
  if(!lista.length) return;   /* sem dados reais, ficam as estimativas */

  const rotulo = {hotel:'Hotel', casa:'Casa / apartamento'};
  const temCasas = casas.length > 0;
  bloco.innerHTML = `
    <h3 class="bloco-titulo">🏨 Alojamento em ${ctx.destino.n} · preços reais</h3>
    <p class="bloco-sub tempo-real">⚡ Preços reais (Google Hotels) para as suas datas${temCasas ? ', incluindo alojamento local' : ''}.</p>
    ${lista.slice(0, 8).map((h, i) => {
      const liga = ligacaoParceiro(h.cat === 'casa' ? 'airbnb' : 'booking', {...ctx, seccao:'hotel'});
      const detalhe = [
        h.estrelas ? '★'.repeat(Math.min(5, Math.round(h.estrelas))) : '',
        h.quartos ? h.quartos + (h.quartos === 1 ? ' quarto' : ' quartos') : '',
        'melhor tarifa encontrada'
      ].filter(Boolean).join(' · ');
      return `
        <div class="linha-oferta ${i === 0 ? 'melhor' : ''}">
          <span class="icone-parceiro"><span class="letra" style="display:flex">${escaparHtml((h.nome || 'A')[0])}</span></span>
          <div class="oferta-info">
            <div class="oferta-nome">${escaparHtml(h.nome || 'Alojamento')} <span class="alt-tag">${rotulo[h.cat]}</span>${i === 0 ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${escaparHtml(detalhe)}</div>
          </div>
          <div class="oferta-preco"><div class="preco-actual">${euros(h.preco)}</div></div>
          <a class="btn-ver" href="${liga}" target="_blank" rel="noopener">Reservar</a>
        </div>`;
    }).join('')}
    <p class="bloco-sub">Tarifas do Google Hotels; a reserva é concluída no site do parceiro.</p>`;
}

/* Actividades com preços reais (GetYourGuide). Sem chave configurada, o
   bloco mantém-se como está, em vez de mostrar preços inventados. */
async function actualizarActividadesReais(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-actividades');
  if(!base || !bloco || !ctx.destino) return;
  const nomePesquisa = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
  try{
    const r = await fetch(base + '/actividades?' + new URLSearchParams({cidade: nomePesquisa}));
    if(!r.ok) return;
    const d = await r.json();
    if(!d || !Array.isArray(d.ofertas) || !d.ofertas.length) return;
    bloco.innerHTML = `
      <h3 class="bloco-titulo">🎟 Actividades em ${ctx.destino.n} · preços reais</h3>
      <p class="bloco-sub tempo-real">⚡ Preços reais por pessoa (GetYourGuide). Não incluídas no total da viagem.</p>
      ${d.ofertas.slice(0, 6).map((a, i) => `
        <div class="linha-oferta ${i === 0 ? 'melhor' : ''}">
          <span class="icone-parceiro"><span class="letra" style="display:flex">🎟</span></span>
          <div class="oferta-info"><div class="oferta-nome">${escaparHtml(a.nome)}</div>
          <div class="oferta-detalhe">por pessoa</div></div>
          <div class="oferta-preco"><div class="preco-actual">${euros(a.preco)}</div></div>
          <a class="btn-ver" href="${escaparHtml(a.url || ligacaoParceiro('getyourguide', {...ctx, seccao:'actividade'}))}" target="_blank" rel="noopener">Reservar</a>
        </div>`).join('')}
      <p class="bloco-sub">A reserva é concluída no site do parceiro.</p>`;
  }catch(e){ /* fica o bloco anterior */ }
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
      <h3 class="bloco-titulo">✈ Voos · tarifas reais</h3>
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

/* Carros com preços reais: embebe o widget do parceiro, quando configurado
   em window.TRIPNEXUS_CARRO_WIDGET_SRC. Não havendo widget, o bloco fica
   como está — nunca se inventa um preço aqui. */
function actualizarCarrosReais(ctx){
  const bloco = document.getElementById('bloco-carro');
  const src = (window.TRIPNEXUS_CARRO_WIDGET_SRC || '').trim();
  if(!bloco || !src || !ctx.destino || !ctx.ida || !ctx.fim) return;
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  const local = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
  const extra = new URLSearchParams({location: local, pickup: f(ctx.ida), dropoff: f(ctx.fim), currency: 'eur', locale: 'pt'});
  bloco.innerHTML = `
    <h3 class="bloco-titulo">🚗 Aluguer de viatura em ${ctx.destino.n} · preços reais</h3>
    <p class="bloco-sub tempo-real">⚡ Preços reais de aluguer para as suas datas.</p>
    <div class="widget-carro" id="widget-carro"></div>`;
  const alvo = bloco.querySelector('#widget-carro');
  const s = document.createElement('script');
  s.async = true; s.charset = 'utf-8';
  s.src = src + (src.includes('?') ? '&' : '?') + extra.toString();
  alvo.appendChild(s);
  /* se o widget não renderizar, repõe o bloco anterior em vez de deixar um vazio */
  const antes = bloco.dataset.anterior;
  setTimeout(() => {
    const temConteudo = [...alvo.children].some(el => el.tagName !== 'SCRIPT');
    if(!temConteudo && antes) bloco.innerHTML = antes;
  }, 3000);
}
