/* ═══════════════════════════════════════════════════════════════
   TripNexus: preços em tempo real (opcional)
   Quando window.TRIPNEXUS_API aponta para o backend (ver
   backend/README.md), o bloco de voos passa a mostrar tarifas
   reais obtidas na hora; sem backend configurado, o site mantém
   as estimativas do motor local. Os filtros e a ordenação do
   bloco de voos aplicam-se também às tarifas reais.
   ═══════════════════════════════════════════════════════════════ */

/* ── diagnóstico das fontes de preço ──────────────────────────
   As estimativas são o último recurso: só aparecem quando a fonte real
   falha. Sem registo, essa falha é indistinguível de uma opção de
   desenho e fica sem explicação. Cada fonte regista aqui o que
   aconteceu; o resultado está sempre em window.TRIPNEXUS_DIAG e, com
   «?diag=1» no endereço, num painel no fim dos resultados. */
const DIAG = (window.TRIPNEXUS_DIAG = {});
/* lido uma única vez, no arranque: a pesquisa reescreve o endereço e o
   diagnóstico corre depois disso, quando o sinalizador já lá não estaria */
const MODO_DIAG = /[?&]diag=1/.test(location.search);
function registarFonte(fonte, estado, detalhe){
  DIAG[fonte] = {estado, detalhe: detalhe || '', hora: new Date().toTimeString().slice(0, 8)};
  if(estado !== 'a consultar')
    console.info('[TripNexus] ' + fonte + ': ' + estado + (detalhe ? ' — ' + detalhe : ''));
  desenharDiagnostico();
}
function desenharDiagnostico(){
  if(!MODO_DIAG) return;
  const res = document.getElementById('resultados');
  if(!res) return;
  let cx = document.getElementById('diagnostico-precos');
  if(!cx || !cx.isConnected){
    cx = document.createElement('div');
    cx.id = 'diagnostico-precos';
    cx.className = 'bloco';
    /* no topo dos resultados: se ficasse no fim, era preciso saber que existe */
    res.insertBefore(cx, res.firstChild);
  }
  const linhas = Object.keys(DIAG).sort().map(k => {
    const d = DIAG[k];
    const bom = d.estado === 'reais';
    const simbolo = bom ? '✅' : (d.estado === 'a consultar' ? '⏳' : '⚠');
    return `<div class="diag-linha${bom ? ' bom' : ''}">
      <span class="diag-fonte">${escaparHtml(k)}</span>
      <span class="diag-estado">${simbolo} ${escaparHtml(bom ? 'preços reais' : d.estado)}</span>
      ${d.detalhe ? `<span class="diag-motivo">${escaparHtml(d.detalhe)}</span>` : ''}
    </div>`;
  }).join('');
  cx.innerHTML = `<h3 class="bloco-titulo">🔎 Diagnóstico das fontes de preço</h3>
    <p class="bloco-sub">Visível apenas com <code>?diag=1</code> no endereço. Tudo o que não estiver a verde está a mostrar estimativas.</p>
    ${linhas || '<p class="bloco-sub">Nenhuma fonte se chegou a anunciar: o ficheiro live.js não correu.</p>'}
    <p class="diag-rodape">Backend: <code>${escaparHtml(window.TRIPNEXUS_API || '(não configurado)')}</code> · versão do site: <code>${escaparHtml(window.TRIPNEXUS_VERSAO || '?')}</code></p>`;
}

/* Substitui o aviso genérico de estimativa pelo motivo real da queda, para
   o utilizador perceber que é uma falha da fonte e não uma opção. */
function explicarEstimativa(idBloco, motivo){
  const nota = document.querySelector('#' + idBloco + ' .nota-estimativa span:last-child');
  if(!nota) return;
  nota.innerHTML = '<strong>Valores estimados</strong> — não foi possível obter preços reais para esta pesquisa'
    + (motivo ? ' (' + escaparHtml(motivo) + ')' : '') + '. O preço real é confirmado no site do parceiro.';
}

/* Alojamento com preços reais: hotéis e alojamento local vêm do mesmo motor
   (Google Hotels, via SerpApi) em dois pedidos paralelos, e são apresentados
   na mesma lista, ordenados por preço e com o tipo assinalado. */
async function actualizarAlojamentoReal(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-alojamento');
  if(!base){ registarFonte('Alojamento (SerpApi)', 'estimativas', 'TRIPNEXUS_API não está configurado no index.html'); return; }
  if(!bloco || !ctx.destino || !ctx.ida || !ctx.fim) return;
  registarFonte('Alojamento (SerpApi)', 'a consultar');
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  /* nome mais reconhecível para a pesquisa (Google Hotels é anglófono) */
  const nomePesquisa = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
  const ps = new URLSearchParams({cidade: nomePesquisa, checkin: f(ctx.ida), checkout: f(ctx.fim), adultos: ctx.adultos || 2});

  /* respeita os tipos de alojamento escolhidos na pesquisa */
  const tipos = (typeof tiposAlojamento === 'function') ? tiposAlojamento() : ['hotel','casa'];
  /* cada pedido devolve também o motivo de não ter trazido nada, para o
     diagnóstico não depender da ordem por que as duas promessas resolvem */
  const buscar = async (rota, nome) => {
    try{
      const r = await fetch(base + rota + '?' + ps);
      if(!r.ok) return {ofertas:[], nota: nome + ': backend devolveu ' + r.status};
      const d = await r.json();
      const ofertas = (d && Array.isArray(d.ofertas)) ? d.ofertas : [];
      return {ofertas, nota: ofertas.length ? '' : nome + ': ' + ((d && (d.nota || d.erro)) || 'sem resultados')};
    }catch(e){ return {ofertas:[], nota: nome + ': sem ligação ao backend'}; }
  };
  const vazio = Promise.resolve({ofertas:[], nota:''});
  const [rh, rc] = await Promise.all([
    tipos.includes('hotel') ? buscar('/hoteis', 'hotéis') : vazio,
    tipos.includes('casa')  ? buscar('/casas', 'casas')   : vazio
  ]);
  const hoteis = rh.ofertas, casas = rc.ofertas;
  const notas = [rh.nota, rc.nota].filter(Boolean);
  const lista = [
    ...hoteis.map(h => ({...h, cat:'hotel'})),
    ...casas.map(h => ({...h, cat:'casa'}))
  ].sort((a, b) => a.preco - b.preco);
  if(!lista.length){   /* sem dados reais, ficam as estimativas */
    registarFonte('Alojamento (SerpApi)', 'estimativas', notas.join(' · '));
    explicarEstimativa('bloco-alojamento', notas.join(' · '));
    return;
  }
  registarFonte('Alojamento (SerpApi)', 'reais',
    hoteis.length + ' hotéis · ' + casas.length + ' casas' + (notas.length ? ' · ' + notas.join(' · ') : ''));
  /* o alojamento vem por noite; o total da viagem conta a estadia inteira */
  if(typeof registarPrecoReal === 'function'){
    const noites = Math.max(1, Math.round((ctx.fim - ctx.ida) / 86400000));
    registarPrecoReal('alojamento', Math.round(lista[0].preco * noites),
      (lista[0].nome || 'alojamento') + ' · ' + noites + (noites === 1 ? ' noite' : ' noites'));
  }

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

/* Actividades com preços reais. Sem fonte configurada, o bloco fica com as
   ligações aos parceiros e sem preço, em vez de mostrar valores inventados. */
async function actualizarActividadesReais(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-actividades');
  if(!base){ registarFonte('Actividades', 'sem preços', 'TRIPNEXUS_API não está configurado no index.html'); return; }
  if(!bloco || !ctx.destino) return;
  registarFonte('Actividades', 'a consultar');
  /* o widget do Klook corre em paralelo e é síncrono, por isso chega aqui
     primeiro; se já tiver assumido o bloco com preços reais, esta falha não
     o pode despromover a «estimativas» */
  const widgetAssumiu = () => !!bloco.querySelector('.dobra-widget');
  /* sem fonte real, o bloco fica só com as ligações aos parceiros: não há
     estimativa nenhuma para despromover, apenas ausência de preço */
  const desistir = motivo => {
    if(widgetAssumiu()) return;
    registarFonte('Actividades', 'sem preços', motivo);
  };
  const nomePesquisa = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
  try{
    const r = await fetch(base + '/actividades?' + new URLSearchParams({cidade: nomePesquisa}));
    if(!r.ok){ desistir('backend devolveu ' + r.status); return; }
    const d = await r.json();
    if(!d || !Array.isArray(d.ofertas) || !d.ofertas.length){
      desistir((d && (d.nota || d.erro)) || 'sem resultados');
      return;
    }
    registarFonte('Actividades', 'reais', d.ofertas.length + ' actividades');
    bloco.innerHTML = `
      <h3 class="bloco-titulo">🎟 Actividades em ${ctx.destino.n} · preços reais</h3>
      <p class="bloco-sub tempo-real">⚡ Preços reais por pessoa. Não incluídas no total da viagem.</p>
      ${d.ofertas.slice(0, 6).map((a, i) => `
        <div class="linha-oferta ${i === 0 ? 'melhor' : ''}">
          <span class="icone-parceiro"><span class="letra" style="display:flex">🎟</span></span>
          <div class="oferta-info"><div class="oferta-nome">${escaparHtml(a.nome)}</div>
          <div class="oferta-detalhe">por pessoa</div></div>
          <div class="oferta-preco"><div class="preco-actual">${euros(a.preco)}</div></div>
          <a class="btn-ver" href="${escaparHtml(a.url || ligacaoParceiro('getyourguide', {...ctx, seccao:'actividade'}))}" target="_blank" rel="noopener">Reservar</a>
        </div>`).join('')}
      <p class="bloco-sub">A reserva é concluída no site do parceiro.</p>`;
  }catch(e){ desistir('sem ligação ao backend'); }
}

async function actualizarVoosReais(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-voos');
  if(!base){ registarFonte('Voos (Travelpayouts)', 'estimativas', 'TRIPNEXUS_API não está configurado no index.html'); return; }
  if(!bloco || !ctx.origem || !ctx.destino || !ctx.ida) return;
  registarFonte('Voos (Travelpayouts)', 'a consultar');
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  try{
    const ps = new URLSearchParams({
      origem: ctx.origem.i, destino: ctx.destino.i, ida: f(ctx.ida),
      adultos: ctx.adultos || 1, criancas: ctx.criancas || 0, classe: ctx.classe || 'economica'
    });
    /* o marker vai no pedido para o backend o colar na ligação de cada
       tarifa: assim a reserva abre já naquele voo, e com a nossa afiliação */
    if(window.TRIPNEXUS_MARKER) ps.set('marker', window.TRIPNEXUS_MARKER);
    if(ctx.volta) ps.set('volta', f(ctx.volta));
    const r = await fetch(base + '/voos?' + ps);
    if(!r.ok){ registarFonte('Voos (Travelpayouts)', 'estimativas', 'backend devolveu ' + r.status); return; }
    const dados = await r.json();
    if(!dados || !Array.isArray(dados.ofertas) || !dados.ofertas.length){
      registarFonte('Voos (Travelpayouts)', 'estimativas', (dados && (dados.nota || dados.erro)) || 'sem tarifas para esta rota');
      return;
    }
    /* tarifas de dias vizinhos: são reais, mas não são as datas pedidas.
       Tem de se dizer, e cada linha leva a sua data. */
    const outrasDatas = dados.datas === 'proximas';
    registarFonte('Voos (Travelpayouts)', 'reais',
      dados.ofertas.length + ' tarifas' + (outrasDatas ? ' (datas próximas, não as pedidas)' : ''));

    const lista = dados.ofertas.map(v => Object.assign({}, v, {precoFinal: v.preco}));
    /* o total da viagem passa a contar com este preço, em vez da estimativa */
    if(typeof registarPrecoReal === 'function' && lista.length){
      const maisBarato = lista.reduce((m, v) => v.precoFinal < m.precoFinal ? v : m);
      registarPrecoReal('voo', maisBarato.precoFinal, maisBarato.companhia || 'tarifa real');
    }
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
      ${outrasDatas ? '<p class="aviso-datas">📅 Não há tarifas registadas para as datas exactas que indicou. Estas são tarifas <strong>reais</strong> de dias próximos: as datas de ida e de regresso de cada uma estão indicadas na linha.</p>' : ''}
      ${notaClasse}
      ${typeof barraFiltros === 'function' ? barraFiltros(companhias) : ''}
      ${visiveis.length ? visiveis.slice(0, 8).map(v => `
        <div class="linha-oferta ${v === melhor ? 'melhor' : ''}">
          <span class="icone-parceiro"><span class="letra" style="display:flex">${escaparHtml((v.companhia || '?')[0])}</span></span>
          <div class="oferta-info">
            <div class="oferta-nome">${escaparHtml(v.companhia || 'Companhia aérea')}${v === melhor ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${escaparHtml([
              outrasDatas && v.data
                ? '📅 ' + diaCurto(v.data) + (v.regresso ? ' – ' + diaCurto(v.regresso) : '')
                : '',
              v.escalas === 0 ? 'directo' : v.escalas + (v.escalas === 1 ? ' escala' : ' escalas'),
              v.duracao,
              v.partida ? 'partida ' + v.partida : ''
            ].filter(Boolean).join(' · '))}</div>
          </div>
          <div class="oferta-preco"><div class="preco-actual">${euros(v.precoFinal)}</div></div>
          <a class="btn-ver" href="${escaparHtml(v.url || liga)}" target="_blank" rel="noopener">Reservar</a>
        </div>`).join('') : '<p class="bloco-sub">Nenhum voo cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros">Repor filtros</button></p>'}
      <p class="bloco-sub">A reserva é concluída no site do parceiro, já com a rota e ${outrasDatas ? 'a data desta tarifa' : 'as datas'} preenchidas.</p>`;
    if(typeof ligarFiltrosVoos === 'function') ligarFiltrosVoos(bloco, desenharResultados);
  }catch(e){
    /* sem rede ou backend indisponível: ficam as estimativas locais */
    registarFonte('Voos (Travelpayouts)', 'estimativas', 'sem ligação ao backend');
  }
}

/* ── widgets de parceiro (preços reais embebidos) ─────────────
   Alguns fornecedores não têm API aberta, mas oferecem um widget que
   mostra preços reais. Injecta-se o script do parceiro no bloco; se
   nada renderizar em 3 s, repõe-se o conteúdo anterior, para nunca
   ficar um espaço vazio no lugar do bloco. */
function embeberWidget(idBloco, src, titulo, subtitulo, extra, largo){
  const bloco = document.getElementById(idBloco);
  src = (src || '').trim();
  if(!bloco || !src) return;
  const anterior = bloco.innerHTML;
  const paiOriginal = bloco.parentNode;
  const irmaoOriginal = bloco.nextSibling;
  /* estes widgets são desenhados para ecrã inteiro: numa coluna estreita
     ficam com barras de deslocamento nos dois eixos. Passam para a zona de
     largura total antes de arrancar, para se medirem já com o espaço certo. */
  const zona = largo ? document.getElementById('zona-larga') : null;
  if(zona) zona.appendChild(bloco);
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
    if(rendeu) return;
    /* falhou: devolve o bloco ao sítio e ao conteúdo que tinha */
    if(zona && paiOriginal) paiOriginal.insertBefore(bloco, irmaoOriginal);
    bloco.innerHTML = anterior;
  }, 3000);
}

const dataISO = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');

/* «2026-09-11» → «Sex, 11 Set», para a data da tarifa se ler de relance */
function diaCurto(iso){
  const d = new Date(iso + 'T12:00:00');
  if(isNaN(d)) return iso;
  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return dias[d.getDay()] + ', ' + d.getDate() + ' ' + meses[d.getMonth()];
}

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
  'Atenas':           {pais: 18,  cidade: 61491},
  'Auckland':         {pais: 48,  cidade: 69801},
  'Banguecoque':      {pais: 9,   cidade: 62861},
  'Barcelona':        {pais: 35,  cidade: 60691},
  'Berlim':           {pais: 29,  cidade: 56121},
  'Budapeste':        {pais: 118, cidade: 62451},
  'Buenos Aires':     {pais: 40,  cidade: 58911},
  'Cairo':            {pais: 61,  cidade: 501},
  'Cancún':           {pais: 25,  cidade: 66131},
  'Casablanca':       {pais: 99,  cidade: 421},
  'Cidade do Cabo':   {pais: 60,  cidade: 41},
  'Cidade do México': {pais: 25,  cidade: 53451},
  'Cracóvia':         {pais: 110, cidade: 105511},
  'Doha':             {pais: 190, cidade: 64591},
  'Dubai':            {pais: 14,  cidade: 62821},
  'Dubrovnik':        {pais: 202, cidade: 107271},
  'Faro':             {pais: 17,  cidade: 127541},
  'Florença':         {pais: 13,  cidade: 120371},
  'Funchal':          {pais: 17,  cidade: 130521},
  'Hamburgo':         {pais: 29,  cidade: 63581},
  'Hanói':            {pais: 11,  cidade: 97211},
  'Helsínquia':       {pais: 139, cidade: 47471},
  'Ibiza':            {pais: 35,  cidade: 143881},
  'Istambul':         {pais: 109, cidade: 65991},
  'Kuala Lumpur':     {pais: 2,   cidade: 64911},
  'Lisboa':           {pais: 17,  cidade: 67671},
  'Lyon':             {pais: 12,  cidade: 47831},
  'Madrid':           {pais: 35,  cidade: 51891},
  'Miami':            {pais: 23,  cidade: 23571},
  'Milão':            {pais: 13,  cidade: 53061},
  'Málaga':           {pais: 35,  cidade: 75431},
  'Nice':             {pais: 12,  cidade: 80631},
  'Nápoles':          {pais: 13,  cidade: 77451},
  'Palma de Maiorca': {pais: 35,  cidade: 68561},
  'Paris':            {pais: 12,  cidade: 53741},
  'Phuket':           {pais: 9,   cidade: 73501},
  'Ponta Delgada':    {pais: 17,  cidade: 130191},
  'Porto':            {pais: 17,  cidade: 79671},
  'Praga':            {pais: 114, cidade: 61591},
  'Praia':            {pais: 79,  cidade: 146741},
  'Reiquiavique':     {pais: 116, cidade: 59441},
  'Roma':             {pais: 13,  cidade: 54441},
  'Santorini':        {pais: 18,  cidade: 549007},
  'Sevilha':          {pais: 35,  cidade: 167551},
  'Sydney':           {pais: 1,   cidade: 53151},
  'Tenerife':         {pais: 35,  cidade: 395431},
  'Valência':         {pais: 35,  cidade: 63391},
  'Varsóvia':         {pais: 110, cidade: 77681},
  'Veneza':           {pais: 13,  cidade: 106451},
  'Viena':            {pais: 127, cidade: 53231},
  'Zagreb':           {pais: 202, cidade: 78041}
};

/* Aluguer de viaturas com preços reais, por coordenadas — serve os 95
   destinos, ao contrário do widget, que ficava preso a uma lista de
   cidades e nunca nos dizia o valor. Se a API não responder, o widget do
   Localrent continua a servir de recurso nas cidades que cobre. */
async function actualizarCarrosReais(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-carro');
  if(!bloco || !ctx.destino || !ctx.ida || !ctx.fim) return;   /* não pediu carro */
  registarFonte('Aluguer de viaturas', 'a consultar');
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  const dias = Math.max(1, Math.round((ctx.fim - ctx.ida) / 86400000));

  let ofertas = [];
  if(base && ctx.destino.la != null){
    try{
      /* o nome em inglês ajuda o fornecedor a reconhecer o local; as
         coordenadas ficam como alternativa */
      const nome = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
      const ps = new URLSearchParams({cidade: nome, lat: ctx.destino.la, lon: ctx.destino.lo,
                                      ida: f(ctx.ida), volta: f(ctx.fim)});
      const r = await fetch(base + '/carros?' + ps);
      const d = r.ok ? await r.json() : null;
      ofertas = (d && Array.isArray(d.ofertas)) ? d.ofertas : [];
      if(!ofertas.length) registarFonte('Aluguer de viaturas', 'sem preços',
        (d && (d.nota || d.erro)) || (r.ok ? 'sem viaturas para estas datas' : 'backend devolveu ' + r.status));
    }catch(e){ registarFonte('Aluguer de viaturas', 'sem preços', 'sem ligação ao backend'); }
  }

  if(ofertas.length){
    registarFonte('Aluguer de viaturas', 'reais', ofertas.length + ' viaturas');
    if(typeof registarPrecoReal === 'function')
      registarPrecoReal('carro', ofertas[0].preco, (ofertas[0].nome || 'viatura') + ' · ' + dias + (dias === 1 ? ' dia' : ' dias'));
    const liga = ligacaoParceiro('discovercars', {...ctx, seccao:'carro'});
    bloco.innerHTML = `
      <h3 class="bloco-titulo">🚗 Aluguer de viatura em ${escaparHtml(ctx.destino.n)} · preços reais</h3>
      <p class="bloco-sub tempo-real">⚡ Preços reais para ${dias} ${dias === 1 ? 'dia' : 'dias'} (Booking.com). Total do aluguer.</p>
      ${ofertas.slice(0, 6).map((v, i) => `
        <div class="linha-oferta ${i === 0 ? 'melhor' : ''}">
          <span class="icone-parceiro"><span class="letra" style="display:flex">🚗</span></span>
          <div class="oferta-info">
            <div class="oferta-nome">${escaparHtml(v.nome || 'Viatura')}${i === 0 ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${escaparHtml([v.fornecedor, v.detalhe].filter(Boolean).join(' · ') || 'aluguer completo')}</div>
          </div>
          <div class="oferta-preco"><div class="preco-actual">${euros(v.preco)}</div></div>
          <a class="btn-ver" href="${escaparHtml(v.url || liga)}" target="_blank" rel="noopener">Reservar</a>
        </div>`).join('')}
      <p class="bloco-sub">A reserva é concluída no site do parceiro.</p>`;
    return;
  }

  /* recurso: o widget do Localrent, nas cidades que cobre */
  const src = (window.TRIPNEXUS_CARRO_WIDGET_SRC || '').trim();
  const local = CARROS_LOCALRENT[ctx.destino.n];
  if(!src || !local) return;   /* fica o bloco com as ligações, sem preço */
  let url;
  try{
    url = new URL(src.startsWith('//') ? location.protocol + src : src, location.href);
  }catch(e){ return; }
  registarFonte('Aluguer de viaturas', 'reais', 'widget Localrent (abre a pedido)');
  if(typeof registarPrecoReal === 'function') registarPrecoReal('carro', 'widget');
  url.searchParams.set('country', String(local.pais));
  url.searchParams.set('city', String(local.cidade));

  /* O quadro do parceiro é grande e cria ruído se estiver sempre aberto.
     Fica fechado por omissão, numa barra estreita, e só carrega quando o
     utilizador o abre: assim não se pede nada à rede sem ser preciso. */
  const zona = document.getElementById('zona-larga');
  if(zona) zona.appendChild(bloco);
  bloco.innerHTML = `
    <details class="dobra-widget">
      <summary>
        <span class="dobra-titulo">🚗 Aluguer de viatura em ${escaparHtml(ctx.destino.n)}</span>
        <span class="dobra-sub">preços reais · ver viaturas disponíveis</span>
        <span class="dobra-seta" aria-hidden="true">▾</span>
      </summary>
      <div class="widget-parceiro"></div>
    </details>`;
  const dobra = bloco.querySelector('details');
  const alvo = bloco.querySelector('.widget-parceiro');
  dobra.addEventListener('toggle', () => {
    if(!dobra.open || alvo.dataset.carregado) return;
    alvo.dataset.carregado = '1';
    const s = document.createElement('script');
    s.async = true; s.charset = 'utf-8'; s.src = url.toString();
    alvo.appendChild(s);
    setTimeout(() => {
      const rendeu = [...alvo.children].some(el => el.tagName !== 'SCRIPT');
      if(!rendeu) alvo.innerHTML = '<p class="bloco-sub">Não foi possível carregar as viaturas agora. Tente recarregar a página.</p>';
    }, 4000);
  });
}

/* ── Actividades: widget do Klook, por cidade ──────────────────
   Mesmo padrão do Localrent: o widget gerado no painel traz a cidade
   fixa no parâmetro «city_id» (identificador interno do Klook).
   Comparando dois widgets gerados para cidades diferentes (Lisboa e
   Atlanta), confirmou-se que só esse valor muda, pelo que basta
   trocá-lo para o widget seguir o destino da pesquisa.

   PARA ACRESCENTAR UMA CIDADE: no painel Travelpayouts, gere o
   «Specific City/Category Tours Widget» escolhendo essa cidade e copie
   o número de «city_id» do endereço para a tabela abaixo. As cidades
   que não estiverem aqui mantêm o bloco de estimativa, em vez de
   mostrarem actividades de outra cidade. */
const ACTIVIDADES_KLOOK = {
  'Lisboa': 705748
};

function actualizarActividadesWidget(ctx){
  const src = (window.TRIPNEXUS_ACTIVIDADES_WIDGET_SRC || '').trim();
  const bloco = document.getElementById('bloco-actividades');
  if(!bloco || !ctx.destino) return;
  /* se as actividades já vieram com preços reais da API, não se sobrepõe */
  if(DIAG['Actividades'] && DIAG['Actividades'].estado === 'reais') return;
  if(!src) return;
  const cidade = ACTIVIDADES_KLOOK[ctx.destino.n];
  if(!cidade){
    /* sem widget para esta cidade ficam as ligações aos parceiros, sem preço */
    registarFonte('Actividades', 'sem preços', ctx.destino.n + ' não está na tabela do Klook');
    return;
  }
  let url;
  try{
    url = new URL(src.startsWith('//') ? location.protocol + src : src, location.href);
  }catch(e){ return; }
  url.searchParams.set('city_id', String(cidade));
  registarFonte('Actividades', 'reais', 'widget Klook (abre a pedido)');

  const zona = document.getElementById('zona-larga');
  if(zona) zona.appendChild(bloco);
  bloco.innerHTML = `
    <details class="dobra-widget">
      <summary>
        <span class="dobra-titulo">🎟 Actividades e passeios em ${escaparHtml(ctx.destino.n)}</span>
        <span class="dobra-sub">preços reais · ver o que há para fazer</span>
        <span class="dobra-seta" aria-hidden="true">▾</span>
      </summary>
      <div class="widget-parceiro"></div>
    </details>`;
  const dobra = bloco.querySelector('details');
  const alvo = bloco.querySelector('.widget-parceiro');
  dobra.addEventListener('toggle', () => {
    if(!dobra.open || alvo.dataset.carregado) return;
    alvo.dataset.carregado = '1';
    const s = document.createElement('script');
    s.async = true; s.charset = 'utf-8'; s.src = url.toString();
    alvo.appendChild(s);
    setTimeout(() => {
      const rendeu = [...alvo.children].some(el => el.tagName !== 'SCRIPT');
      if(!rendeu) alvo.innerHTML = '<p class="bloco-sub">Não foi possível carregar as actividades agora. Tente recarregar a página.</p>';
    }, 4000);
  });
}
