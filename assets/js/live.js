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

/* ── widgets de parceiro (preços reais embebidos) ─────────────
   Alguns fornecedores não têm API aberta, mas oferecem um widget que
   mostra preços reais. Injecta-se o script do parceiro no bloco; se
   nada renderizar em 3 s, repõe-se o conteúdo anterior, para nunca
   ficar um espaço vazio no lugar do bloco. */
function embeberWidget(idBloco, src, titulo, subtitulo, extra){
  const bloco = document.getElementById(idBloco);
  src = (src || '').trim();
  if(!bloco || !src) return;
  const anterior = bloco.innerHTML;
  const url = src + (src.includes('?') ? '&' : '?') + new URLSearchParams(extra || {}).toString();
  bloco.innerHTML = `
    <h3 class="bloco-titulo">${titulo}</h3>
    <p class="bloco-sub tempo-real">⚡ ${subtitulo}</p>
    <div class="widget-parceiro"></div>`;
  const alvo = bloco.querySelector('.widget-parceiro');
  const s = document.createElement('script');
  s.async = true; s.charset = 'utf-8'; s.src = url;
  alvo.appendChild(s);
  setTimeout(() => {
    const rendeu = [...alvo.children].some(el => el.tagName !== 'SCRIPT');
    if(!rendeu) bloco.innerHTML = anterior;
  }, 3000);
}

const dataISO = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');

/* ── Carros: widget do Localrent, por cidade ──────────────────
   O widget gerado no painel traz o país e a cidade fixos nos
   parâmetros «country» e «city» (identificadores internos do
   Localrent). Comparando dois widgets gerados para cidades
   diferentes, confirmou-se que só esses dois valores mudam, pelo
   que basta trocá-los para o widget seguir o destino da pesquisa.

   PARA ACRESCENTAR UMA CIDADE: no painel Travelpayouts, gere o
   mesmo widget escolhendo esse país e cidade, e copie os números
   de «country» e «city» do endereço para a tabela abaixo. As
   cidades que não estiverem aqui mantêm o bloco de estimativa, em
   vez de mostrarem preços de outra cidade. */
const CARROS_LOCALRENT = {
  'Atenas':        {pais: 18, cidade: 61491},
  'Auckland':      {pais: 48, cidade: 69801},
  'Barcelona':     {pais: 35, cidade: 60691},
  'Budapeste':     {pais: 118, cidade: 62451},
  'Buenos Aires':  {pais: 40, cidade: 58911},
  'Cairo':         {pais: 61, cidade: 501},
  'Cancún':        {pais: 25, cidade: 66131},
  'Casablanca':    {pais: 99, cidade: 421},
  'Doha':          {pais: 190, cidade: 64591},
  'Dubai':         {pais: 14, cidade: 62821},
  'Dubrovnik':     {pais: 202, cidade: 107271},
  'Faro':          {pais: 17, cidade: 127541},
  'Funchal':       {pais: 17, cidade: 130521},
  'Hanói':         {pais: 11, cidade: 97211},
  'Ibiza':         {pais: 35, cidade: 143881},
  'Kuala Lumpur':  {pais: 2,  cidade: 64911},
  'Lisboa':        {pais: 17, cidade: 67671},
  'Lyon':          {pais: 12, cidade: 47831},
  'Madrid':        {pais: 35, cidade: 51891},
  'Miami':         {pais: 23, cidade: 23571},
  'Málaga':        {pais: 35, cidade: 75431},
  'Nice':          {pais: 12, cidade: 80631},
  'Paris':         {pais: 12, cidade: 53741},
  'Phuket':        {pais: 9,  cidade: 73501},
  'Ponta Delgada': {pais: 17, cidade: 130191},
  'Porto':         {pais: 17, cidade: 79671},
  'Praga':         {pais: 114, cidade: 61591},
  'Praia':         {pais: 79, cidade: 146741},
  'Roma':          {pais: 13, cidade: 54441},
  'Santorini':     {pais: 18, cidade: 549007},
  'Sydney':        {pais: 1,  cidade: 53151},
  'Tenerife':      {pais: 35, cidade: 395431},
  'Valência':      {pais: 35, cidade: 63391},
  'Zagreb':        {pais: 202, cidade: 78041}
};

function actualizarCarrosReais(ctx){
  const src = (window.TRIPNEXUS_CARRO_WIDGET_SRC || '').trim();
  if(!src || !ctx.destino) return;
  const local = CARROS_LOCALRENT[ctx.destino.n];
  if(!local) return;   /* cidade sem correspondência: fica a estimativa */
  let url;
  try{
    url = new URL(src.startsWith('//') ? location.protocol + src : src, location.href);
  }catch(e){ return; }
  url.searchParams.set('country', String(local.pais));
  url.searchParams.set('city', String(local.cidade));
  embeberWidget('bloco-carro', url.toString(),
    '🚗 Aluguer de viatura em ' + escaparHtml(ctx.destino.n) + ' · preços reais',
    'Preços reais de aluguer. Confirme as datas dentro do quadro.');
}

/* Actividades: widget do parceiro (Klook e afins), por cidade. */
function actualizarActividadesWidget(ctx){
  if(!ctx.destino) return;
  const local = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
  embeberWidget('bloco-actividades', window.TRIPNEXUS_ACTIVIDADES_WIDGET_SRC,
    '🎟 Actividades em ' + escaparHtml(ctx.destino.n) + ' · preços reais',
    'Preços reais por pessoa. Não incluídas no total da viagem.',
    {city: local, currency:'eur', locale:'pt'});
}
