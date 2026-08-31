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
    console.info('[TripNexus] ' + fonte + ': ' + estado + (detalhe ? ': ' + detalhe : ''));
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
  nota.innerHTML = '<strong>Valores estimados</strong>: não foi possível obter preços reais para esta pesquisa'
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
  /* Só há duas pesquisas na Google, «hotéis» e «alojamento local», e as
     categorias finas saem todas da primeira: um hostel, uma pensão ou um
     apart-hotel vêm na pesquisa de hotéis. Quem escolher só «Hostels» tem de
     a fazer na mesma, senão não vem nada. */
  const daPesquisaDeHoteis = ['hotel','hostel','aparthotel','pensao','resort','rural','campismo'];
  const [rh, rc] = await Promise.all([
    tipos.some(t => daPesquisaDeHoteis.includes(t)) ? buscar('/hoteis', 'hotéis') : vazio,
    tipos.includes('casa') ? buscar('/casas', 'casas') : vazio
  ]);
  const hoteis = rh.ofertas, casas = rc.ofertas;
  const notas = [rh.nota, rc.nota].filter(Boolean);
  const todos = [
    ...hoteis.map(h => ({...h, cat:'hotel'})),
    ...casas.map(h => ({...h, cat:'casa'}))
  ].sort((a, b) => a.preco - b.preco);
  /* respeita a escolha da pesquisa pelo tipo real de cada alojamento */
  const lista = todos.filter(h => tipos.includes(categoriaAlojamento(h)));
  const excluidos = todos.length - lista.length;
  if(!lista.length){   /* sem dados reais, ficam as estimativas */
    const porque = todos.length
      ? 'a Google só devolveu tipos que não escolheu (' + todos.length + ' resultados postos de parte)'
      : notas.join(' · ');
    registarFonte('Alojamento (SerpApi)', 'estimativas', porque);
    explicarEstimativa('bloco-alojamento', porque);
    return;
  }
  registarFonte('Alojamento (SerpApi)', 'reais',
    lista.length + ' de ' + todos.length + ' resultados'
    + (excluidos ? ' (' + excluidos + ' de tipos não escolhidos)' : '')
    + (notas.length ? ' · ' + notas.join(' · ') : ''));
  /* o alojamento vem por noite; o total da viagem conta a estadia inteira */
  if(typeof registarPrecoReal === 'function'){
    const noites = Math.max(1, Math.round((ctx.fim - ctx.ida) / 86400000));
    registarPrecoReal('alojamento', Math.round(lista[0].preco * noites),
      (lista[0].nome || 'alojamento') + ' · ' + noites + (noites === 1 ? ' noite' : ' noites'));
  }

  const temCasas = lista.some(h => categoriaAlojamento(h) === 'casa');
  bloco.innerHTML = `
    <h3 class="bloco-titulo">🏨 Alojamento em ${ctx.destino.n} · preços reais</h3>
    <p class="bloco-sub tempo-real">⚡ Preços reais (Google Hotels) para as suas datas${temCasas ? ', incluindo alojamento local' : ''}.</p>
    ${lista.slice(0, 8).map((h, i) => {
      const liga = ligacaoParceiro(categoriaAlojamento(h) === 'casa' ? 'airbnb' : 'booking', {...ctx, seccao:'hotel'});
      const detalhe = [
        h.estrelas ? '★'.repeat(Math.min(5, Math.round(h.estrelas))) : '',
        h.quartos ? h.quartos + (h.quartos === 1 ? ' quarto' : ' quartos') : '',
        'melhor tarifa encontrada'
      ].filter(Boolean).join(' · ');
      return `
        <div class="linha-oferta ${i === 0 ? 'melhor' : ''}">
          ${caixaLogotipo([h.imagem], h.nome || 'Alojamento', {foto:true})}
          <div class="oferta-info">
            <div class="oferta-nome">${escaparHtml(h.nome || 'Alojamento')} <span class="alt-tag">${escaparHtml(rotuloAlojamento(h))}</span>${i === 0 ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${escaparHtml(detalhe)}</div>
          </div>
          <div class="oferta-preco"><div class="preco-actual">${euros(h.preco)}</div></div>
          <a class="btn-ver" href="${liga}" target="_blank" rel="noopener">Reservar</a>
        </div>`;
    }).join('')}
    <p class="bloco-sub">Tarifas do Google Hotels; a reserva é concluída no site do parceiro.</p>`;
}

/* A pesquisa de «hotéis» na Google traz também hostels, pousadas e
   apart-hotéis. Chamar «Hotel» a todos é dizer ao utilizador uma coisa que
   não é verdade: o «St Christopher's Paris» é um hostel e aparecia como
   hotel. A tipologia vem da Google, que a devolve ora em inglês ora em
   português conforme o campo, e o que não estiver na tabela é mostrado tal
   como veio, em vez de ser arredondado para «Hotel». */
const TIPO_ALOJAMENTO = {
  'hotel':'Hotel', 'hostel':'Hostel', 'hostal':'Hostel', 'albergue':'Hostel',
  'albergue da juventude':'Hostel', 'youth hostel':'Hostel',
  'apartment':'Apartamento', 'apartamento':'Apartamento', 'condo':'Apartamento',
  'condominium':'Apartamento', 'serviced apartment':'Apartamento com serviços',
  'aparthotel':'Aparthotel', 'apart-hotel':'Aparthotel', 'apart hotel':'Aparthotel',
  'apartment hotel':'Aparthotel',
  'vacation rental':'Casa / apartamento', 'casa de férias':'Casa / apartamento',
  'holiday home':'Casa de férias', 'holiday park':'Parque de férias',
  'house':'Casa', 'casa':'Casa', 'townhouse':'Moradia geminada',
  'guest house':'Casa de hóspedes', 'guesthouse':'Casa de hóspedes',
  'casa de hóspedes':'Casa de hóspedes', 'pensão':'Pensão', 'pension':'Pensão',
  'bed and breakfast':'B&B', 'bed & breakfast':'B&B', 'b&b':'B&B',
  'motel':'Motel', 'resort':'Resort', 'villa':'Moradia', 'moradia':'Moradia',
  'cottage':'Casa de campo', 'cabin':'Cabana', 'chalet':'Chalé', 'chalé':'Chalé',
  'lodge':'Refúgio', 'farm stay':'Turismo rural', 'country house':'Casa de campo',
  'inn':'Estalagem', 'estalagem':'Estalagem', 'pousada':'Pousada',
  'camping':'Parque de campismo', 'campsite':'Parque de campismo',
  'campground':'Parque de campismo', 'glamping':'Glamping',
  'boat':'Barco', 'houseboat':'Casa-barco', 'ryokan':'Ryokan',
  'riad':'Riad', 'minbak':'Minbak', 'capsule hotel':'Hotel cápsula',
  'love hotel':'Love hotel', 'hotel de charme':'Hotel de charme',
  'boutique hotel':'Hotel boutique', 'spa hotel':'Hotel com spa',
  'homestay':'Quarto em casa de família', 'private vacation home':'Casa de férias',
  'all-inclusive':'Tudo incluído', 'hotel resort':'Resort'
};
/* rótulo visível de cada categoria escolhível */
const ROTULO_CATEGORIA = {
  hostel:'Hostel', aparthotel:'Aparthotel', pensao:'Pensão / B&B',
  resort:'Resort', rural:'Turismo rural', campismo:'Campismo',
  casa:'Casa / apartamento', hotel:'Hotel'
};
function rotuloAlojamento(h){
  /* o que os indícios dizem ganha ao «type» genérico da Google: chamar
     «Hotel» a um hostel é o erro que se quer evitar */
  const cat = categoriaAlojamento(h);
  if(cat !== 'hotel' && cat !== 'casa') return ROTULO_CATEGORIA[cat];
  const t = String((h && h.tipo) || '').trim();
  if(t && t.toLowerCase() !== 'hotel'){
    const conhecido = TIPO_ALOJAMENTO[t.toLowerCase()];
    /* o que não conhecemos vai como veio: menos exacto do que traduzir, mas
       muito melhor do que inventar uma categoria errada */
    return conhecido || (t.charAt(0).toUpperCase() + t.slice(1));
  }
  if(cat === 'casa') return 'Casa / apartamento';
  return t ? 'Hotel' : 'Alojamento';
}

/* A rota que trouxe o alojamento não é o que ele é: a pesquisa de «hotéis»
   na Google devolve hostels e apartamentos pelo meio, e quem escolheu só
   hotéis estava a vê-los na mesma. A escolha da pesquisa passa a ser
   respeitada pelo tipo real, não pela origem. */
/* As categorias que o utilizador pode escolher na pesquisa, por ordem de
   prioridade: a primeira que bater ganha. O «hostel» vem antes do «casa»
   porque um hostel com apartamentos continua a ser um hostel, e o «campismo»
   vem antes de tudo porque não se confunde com nada.

   PARA ACRESCENTAR UMA CATEGORIA: uma entrada aqui e uma caixa no
   index.html com o mesmo «value». Mais nada. */
const CATEGORIAS_ALOJAMENTO = [
  ['campismo',   /\b(campismo|camping|campsite|campground|glamping|caravan|parque de campismo)\b/i],
  ['hostel',     /\b(hostel|hostels|hostal|albergue|albergues|dormitóri|dormitor|bunk|backpack)\b/i],
  ['aparthotel', /\b(apart-?hotel|aparthotel|apartahotel|apartment hotel|residhome|residence hotel)\b/i],
  ['pensao',     /\b(pensão|pensao|pension|guest ?house|casa de hóspedes|bed and breakfast|bed & breakfast|b&b|estalagem|inn)\b/i],
  ['resort',     /\b(resort|all-inclusive|tudo incluído|spa resort)\b/i],
  ['rural',      /\b(turismo rural|quinta|farm ?stay|country house|casa de campo|cottage|cabana|cabin|chalé|chalet|lodge|refúgio)\b/i],
  ['casa',       /\b(apartamento|apartment|appartement|studio|estúdio|flat|moradia|villa|condo|minbak|riad|casa|house|home|zimmer|loft)\b/i]
];
function categoriaAlojamento(h){
  const t = String((h && h.tipo) || '').toLowerCase();
  /* O «type» da Google é grosso: diz «hotel» a tudo o que veio da pesquisa
     de hotéis, seja hostel, apart-hotel ou pensão. Só distingue mesmo o
     alojamento local, e nisso é de confiar. */
  const alojamentoLocal = /vacation rental|holiday|rental/.test(t);
  /* Para o resto é preciso olhar para o nome e para a descrição, e é uma
     leitura de indícios, não um campo de dados, e por isso só conta quando a
     palavra aparece inteira. */
  const texto = ((h && h.nome) || '') + ' ' + ((h && h.descricao) || '');
  for(const [chave, padrao] of CATEGORIAS_ALOJAMENTO)
    if(padrao.test(texto)) return chave;
  if(alojamentoLocal) return 'casa';
  if(t) return 'hotel';
  /* sem indício nenhum não se inventa: fica pela rota que o trouxe */
  return (h && h.cat) || 'hotel';
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
          ${caixaLogotipo([a.imagem], a.nome || 'Actividade', {foto:true})}
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
      /* Sem tarifas para as datas pedidas não se propõem outras datas: o
         utilizador escolheu-as, e trocá-las por baixo dele é o oposto do que
         um comparador faz. Fica dito que não há, com as ligações para
         procurar nessas mesmas datas e o calendário para quem quiser mudar. */
      registarFonte('Voos (Travelpayouts)', 'sem preços',
        (dados && (dados.nota || dados.erro)) || 'sem tarifas para estas datas');
      const liga = p => ligacaoParceiro(p, {...ctx, seccao:'voo'});
      bloco.innerHTML = `
        <h3 class="bloco-titulo">✈ Voos</h3>
        <p class="aviso-datas">📅 Não encontrámos tarifas para <strong>${escaparHtml(diaCurto(dataISO(ctx.ida)))}${ctx.volta ? ' – ' + escaparHtml(diaCurto(dataISO(ctx.volta))) : ''}</strong>. Não mostramos outras datas no lugar destas. Se quiser ver que dias têm tarifa, abra o calendário na caixa de pesquisa.</p>
        ${['skyscanner','kayak','google'].map(p => linhaSemPreco(p, {
          detalhe: 'Procurar ' + ctx.origem.n + ' → ' + ctx.destino.n + ' nestas datas',
          url: liga(p)
        })).join('')}
        <p class="bloco-sub">Estes sites fazem a pesquisa em directo e podem ter tarifas que a nossa fonte ainda não registou.</p>`;
      return;
    }
    /* tarifas de dias vizinhos: são reais, mas não são as datas pedidas.
       Tem de se dizer, e cada linha leva a sua data. */
    /* o backend já só devolve tarifas das datas pedidas */
    const soRegresso = false, outrasDatas = false;
    registarFonte('Voos (Travelpayouts)', 'reais',
      dados.ofertas.length + ' tarifas' + (outrasDatas ? ' (datas próximas, não as pedidas)' : '')
      + (outrasDatas && dados.nota ? ' · ' + dados.nota : ''));

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
      ${soRegresso
        ? '<p class="aviso-datas">📅 A <strong>data de ida é a que pediu</strong>. Não há tarifas registadas para o regresso a ' + escaparHtml(diaCurto(dataISO(ctx.volta))) + ', por isso o regresso destas é noutro dia: cada linha diz qual, e quantas noites fica.</p>'
        : outrasDatas ? '<p class="aviso-datas">📅 Não há tarifas registadas para as datas exactas que indicou. Estas são tarifas <strong>reais</strong> de dias próximos: as datas de ida e de regresso de cada uma estão indicadas na linha.</p>' : ''}
      ${notaClasse}
      ${typeof barraFiltros === 'function' ? barraFiltros(companhias) : ''}
      ${visiveis.length ? visiveis.slice(0, 8).map(v => `
        <div class="linha-oferta ${v === melhor ? 'melhor' : ''}">
          ${iconeCompanhia(v.codigo, v.companhia)}
          <div class="oferta-info">
            <div class="oferta-nome">${escaparHtml(v.companhia || 'Companhia aérea')}${v === melhor ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${escaparHtml([
              /* com datas vizinhas mostra-se também a duração: duas datas
                 soltas não deixam ver que a estadia não é a que se pediu */
              outrasDatas && v.data
                ? '📅 ' + diaCurto(v.data)
                  + (v.regresso ? ' – ' + diaCurto(v.regresso) + noitesEntre(v.data, v.regresso) : '')
                : '',
              /* ida e regresso mostram-se em separado quando não são iguais:
                 «directo» num voo cujo regresso tem duas escalas é meia
                 verdade, e a meia verdade é a que engana */
              'ida ' + textoEscalas(v.escalas) + (v.duracao ? ' · ' + v.duracao : ''),
              (v.escalasVolta != null && ctx.volta)
                ? 'regresso ' + textoEscalas(v.escalasVolta) + (v.duracaoVolta ? ' · ' + v.duracaoVolta : '')
                : '',
              v.partida ? 'partida ' + v.partida : ''
            ].filter(Boolean).join(' · '))}</div>
            ${notaAeroporto(v.aeroportoChegada) ? `<div class="aviso-aeroporto">${escaparHtml(notaAeroporto(v.aeroportoChegada))}</div>` : ''}
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

/* ── evolução do preço: preços reais por data, mesmo mês ───────
   O gráfico mostrava sempre uma curva sintética, ancorada no preço real de
   hoje mas inventada em todos os outros pontos: não há como reconstruir
   «como este preço mudou nas últimas 8 semanas» sem o termos andado a
   registar nós próprios, o que nunca aconteceu. O que já existe, ligado ao
   mesmo `/calendario` que alimenta a grelha de datas, é o preço real de
   OUTRAS datas de partida deste mês, para a mesma duração de viagem — uma
   pergunta diferente («compensa mudar de dia?», em vez de «subiu ou
   desceu?»), mas real, e mais útil para decidir.

   Só troca a curva sintética por esta quando há pontos reais que cheguem
   para dizer alguma coisa (5 ou mais dias com tarifa este mês); com menos,
   fica a estimativa, que por isso nunca deixa de existir — é o recurso de
   último caso, não uma coisa que se apaga. */
async function actualizarEvolucaoReal(ctx, precoHoje){
  const bloco = document.getElementById('bloco-evolucao');
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  if(!bloco || !(precoHoje > 0)) return;
  if(!base){ registarFonte('Evolução do preço (Travelpayouts)', 'estimativas', 'TRIPNEXUS_API não está configurado no index.html'); return; }
  if(!ctx.origem || !ctx.destino || !ctx.ida) return;
  const mes = ctx.ida.getFullYear() + '-' + String(ctx.ida.getMonth() + 1).padStart(2, '0');
  const ps = new URLSearchParams({origem: ctx.origem.i, destino: ctx.destino.i, mes});
  if(ctx.volta) ps.set('dias', String(Math.max(1, Math.round((ctx.volta - ctx.ida) / 86400000))));
  else ps.set('soIda', '1');
  registarFonte('Evolução do preço (Travelpayouts)', 'a consultar');
  let d;
  try{
    const r = await fetch(base + '/calendario?' + ps);
    if(!r.ok){ registarFonte('Evolução do preço (Travelpayouts)', 'estimativas', 'backend devolveu ' + r.status); return; }
    d = await r.json();
  }catch(e){ registarFonte('Evolução do preço (Travelpayouts)', 'estimativas', 'sem ligação ao backend'); return; }

  const precos = (d && d.precos) || {};
  /* /calendario devolve o preço de uma pessoa; o resto da página soma o
     grupo todo (`/voos` faz o mesmo cálculo), por isso escala-se aqui para
     os dois lados do gráfico falarem da mesma coisa */
  const pax = Math.max(1, (ctx.adultos || 1) + (ctx.criancas || 0) * 0.75);
  const chaveIda = dataISO(ctx.ida);
  const outrosDias = Object.keys(precos).filter(k => k !== chaveIda && precos[k] > 0).sort();
  if(outrosDias.length < 5){
    registarFonte('Evolução do preço (Travelpayouts)', 'estimativas',
      'poucos dias com tarifa registada este mês (' + outrosDias.length + ')');
    return;   /* fica a curva sintética, que já estava desenhada */
  }

  /* o dia escolhido usa o preço acabado de confirmar (real, se tiver vindo;
     a estimativa local, senão), nunca o do calendário: evita duas fontes
     diferentes a dizer números diferentes para a mesma data, na mesma página */
  const todosOsDias = [...outrosDias, chaveIda].sort();
  const pontos = todosOsDias.map(k => k === chaveIda ? Math.round(precoHoje) : Math.round(precos[k] * pax));
  const destaque = todosOsDias.indexOf(chaveIda);
  const ordenados = [...pontos].sort((a, b) => a - b);
  const tipico = ordenados[Math.floor(ordenados.length / 2)];
  const dif = Math.round((precoHoje / tipico - 1) * 100);
  const tipo = dif <= -8 ? 'bom' : (dif >= 8 ? 'alto' : 'neutro');
  registarFonte('Evolução do preço (Travelpayouts)', 'reais',
    todosOsDias.length + ' dias deste mês, mesma duração de viagem');

  const eixo = [diaCurto(todosOsDias[0]), diaCurto(todosOsDias[Math.floor(todosOsDias.length / 2)]), diaCurto(chaveIda)];
  const serie = {pontos, tipico, tipo, destaque, eixo, real: true};
  const texto = tipo === 'bom'
    ? `✅ Bom momento para comprar: o preço está ${-dif} % abaixo do típico deste mês, para esta duração de viagem.`
    : tipo === 'alto'
      ? `⚠️ Preço alto: está ${dif} % acima do típico deste mês, para esta duração de viagem. Veja outras datas no calendário.`
      : `➖ Preço dentro do típico deste mês, para esta duração de viagem.`;
  bloco.innerHTML = `
    <h3 class="bloco-titulo">📈 Preços por data · tarifas reais</h3>
    <p class="bloco-sub tempo-real">⚡ ${todosOsDias.length} dias deste mês, mesma duração de viagem (Travelpayouts).</p>
    <div class="veredicto ${tipo}">${texto}</div>
    ${typeof graficoEvolucao === 'function' ? graficoEvolucao(serie) : ''}
    <p class="bloco-sub" style="margin:.5rem 0 0">Comparado com outras datas de partida deste mês, não com o histórico desta. Para ver o mês inteiro, abra o calendário na caixa de pesquisa.</p>`;
}

/* ── viagem por várias cidades: tarifas reais, perna a perna ──
   A viagem multi-cidade nunca tinha ligação ao backend: todos os voos e
   todo o alojamento vinham sempre do motor local. Aqui o real entra perna
   a perna e estadia a estadia, e o que não vier real fica na estimativa já
   calculada por `desenharResultadosMulti` — nunca em bloco, para uma cidade
   sem tarifa registada não apagar as que têm. */
async function vooRealDeTroco(origem, destino, ida, adultos, criancas, classe){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  if(!base || !origem || !destino || !ida) return null;
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  const ps = new URLSearchParams({origem: origem.i, destino: destino.i, ida: f(ida),
    adultos: adultos || 1, criancas: criancas || 0, classe: classe || 'economica'});
  if(window.TRIPNEXUS_MARKER) ps.set('marker', window.TRIPNEXUS_MARKER);
  try{
    const r = await fetch(base + '/voos?' + ps);
    if(!r.ok) return null;
    const d = await r.json();
    if(!d || !Array.isArray(d.ofertas) || !d.ofertas.length) return null;
    return d.ofertas.reduce((m, v) => v.preco < m.preco ? v : m);
  }catch(e){ return null; }
}

/* Mesma fonte e o mesmo par de pedidos (hotéis + casas) que
   `actualizarAlojamentoReal`, mas para uma estadia isolada: a viagem
   multi-cidade pede uma vez por cidade, não uma vez só para o destino
   final. Devolve o mais barato que respeite os tipos escolhidos, ou null. */
async function alojamentoRealDeEstadia(cidade, ida, fim, adultos, tipos){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  if(!base || !cidade || !ida || !fim) return null;
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  const nomePesquisa = (typeof WIKI_EN !== 'undefined' && WIKI_EN[cidade.n]) || cidade.n;
  const ps = new URLSearchParams({cidade: nomePesquisa, checkin: f(ida), checkout: f(fim), adultos: adultos || 2});
  const buscar = async rota => {
    try{
      const r = await fetch(base + rota + '?' + ps);
      if(!r.ok) return [];
      const d = await r.json();
      return (d && Array.isArray(d.ofertas)) ? d.ofertas : [];
    }catch(e){ return []; }
  };
  const daPesquisaDeHoteis = ['hotel','hostel','aparthotel','pensao','resort','rural','campismo'];
  const [hoteis, casas] = await Promise.all([
    (tipos || []).some(t => daPesquisaDeHoteis.includes(t)) ? buscar('/hoteis') : Promise.resolve([]),
    (tipos || []).includes('casa') ? buscar('/casas') : Promise.resolve([])
  ]);
  const todos = [...hoteis.map(h => ({...h, cat:'hotel'})), ...casas.map(h => ({...h, cat:'casa'}))]
    .sort((a, b) => a.preco - b.preco);
  const lista = todos.filter(h => (tipos || []).includes(categoriaAlojamento(h)));
  return lista[0] || null;
}

/* Orquestra as duas fontes acima para todos os trocos e estadias de
   `RESUMO_MULTI` (montado por `desenharResultadosMulti`, em results.js) e
   manda redesenhar quando tiver o que há. */
async function actualizarMultiReais(){
  const R = RESUMO_MULTI;
  if(!R) return;
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  if(!base){ registarFonte('Viagem multi-cidade', 'estimativas', 'TRIPNEXUS_API não está configurado no index.html'); return; }
  registarFonte('Viagem multi-cidade', 'a consultar');

  await Promise.all(R.pernas.map(async p => {
    const v = await vooRealDeTroco(p.troco.origem, p.troco.destino, p.troco.data, R.ctx.adultos, R.ctx.criancas, R.ctx.classe);
    if(v && v.preco > 0) Object.assign(p, {
      real: true, precoFinal: Math.round(v.preco), companhia: v.companhia,
      codigo: v.codigo, escalas: v.escalas, duracao: v.duracao, url: v.url
    });
  }));

  if(R.tiposAloj && R.tiposAloj.length){
    await Promise.all(R.estadias.map(async e => {
      if(!e.melhor) return;   /* esta estadia não pediu alojamento */
      const h = await alojamentoRealDeEstadia(e.cidade, e.inicio, e.fim, R.ctx.adultos, R.tiposAloj);
      if(h && h.preco > 0) Object.assign(e, {
        real: true,
        melhor: {nome: h.nome, imagem: h.imagem, preco: h.preco, precoFinal: Math.round(h.preco * e.noites),
                 estrelas: h.estrelas, cat: categoriaAlojamento(h)}
      });
    }));
  }

  const algumaReal = R.pernas.some(p => p.real) || R.estadias.some(e => e.real);
  registarFonte('Viagem multi-cidade', algumaReal ? 'reais' : 'estimativas',
    algumaReal ? (R.pernas.filter(p => p.real).length + ' de ' + R.pernas.length + ' trocos'
      + (R.tiposAloj && R.tiposAloj.length ? ' · ' + R.estadias.filter(e => e.real).length + ' de ' + R.estadias.length + ' estadias' : ''))
      : 'sem tarifas reais para estes trocos ou estas datas');
  if(typeof renderizarMulti === 'function') renderizarMulti();
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

/* Aeroportos vendidos com o nome de uma cidade que fica longe. É a
   diferença entre uma tarifa barata e uma tarifa barata mais 20 € de
   autocarro e hora e meia de viagem, e um comparador que a esconde não está
   a comparar coisa nenhuma.

   PARA ACRESCENTAR: código IATA → [nome, distância aproximada em km]. */
const AEROPORTOS_AFASTADOS = {
  BVA:['Beauvais', 85], CRL:['Charleroi', 55], NRN:['Weeze', 80],
  HHN:['Frankfurt-Hahn', 120], SXF:['Berlim-Schönefeld', 20],
  STN:['Stansted', 60], LTN:['Luton', 55], SEN:['Southend', 65],
  TSF:['Treviso', 40], BGY:['Milão-Bérgamo', 50], MXP:['Milão-Malpensa', 50],
  PSA:['Pisa', 80], GRO:['Girona', 100], REU:['Reus', 100],
  TRF:['Oslo-Sandefjord', 110], NYO:['Estocolmo-Skavsta', 100],
  VST:['Estocolmo-Västerås', 100], MMX:['Malmö', 45],
  SFB:['Orlando-Sanford', 60], IPL:['Nova Iorque-Islip', 80]
};
function notaAeroporto(codigo){
  const a = AEROPORTOS_AFASTADOS[String(codigo || '').toUpperCase()];
  return a ? '⚠ ' + codigo + ' (' + a[0] + ', ~' + a[1] + ' km do centro)' : '';
}
/* «directo», «1 escala», «2 escalas», e o regresso à parte quando difere */
function textoEscalas(n){
  return n === 0 ? 'directo' : n + (n === 1 ? ' escala' : ' escalas');
}

/* « (7 noites)», para se ver de relance se a estadia é a que se pediu */
function noitesEntre(ida, volta){
  const n = Math.round((Date.parse(volta) - Date.parse(ida)) / 86400000);
  return isFinite(n) && n >= 1 ? ' (' + n + (n === 1 ? ' noite)' : ' noites)') : '';
}

/* «2026-09-11» → «Sex, 11 Set», para a data da tarifa se ler de relance */
function diaCurto(iso){
  const d = new Date(iso + 'T12:00:00');
  if(isNaN(d)) return iso;
  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  return dias[d.getDay()] + ', ' + d.getDate() + ' ' + meses[d.getMonth()];
}

/* Aluguer de viaturas com preços reais, por coordenadas: serve os 95
   destinos, ao contrário do widget, que ficava preso a uma lista de
   cidades e nunca nos dizia o valor.

   O widget do Localrent servia aqui de recurso e foi retirado: anunciava
   «preços reais» e mostrava zero viaturas com datas que não eram as da
   pesquisa, além de apagar, ao assumir o bloco, o motivo pelo qual a API
   tinha falhado. Um recurso que mente é pior do que recurso nenhum: sem
   API, fica o bloco com as ligações aos parceiros e sem preço. */
/* A Booking nem sempre traz o logótipo da empresa de aluguer, mas traz-lhe
   sempre o nome. Com o domínio, a cadeia de fontes de ícones faz o resto,
   e uma empresa que não esteja aqui cai no monograma, não num emoji igual
   para todas. */
const DOMINIO_ALUGUER = {
  'avis':'avis.com', 'hertz':'hertz.com', 'europcar':'europcar.com', 'sixt':'sixt.com',
  'enterprise':'enterprise.com', 'budget':'budget.com', 'alamo':'alamo.com',
  'national':'nationalcar.com', 'thrifty':'thrifty.com', 'dollar':'dollar.com',
  'goldcar':'goldcar.es', 'centauro':'centauro.net', 'firefly':'fireflycarrental.com',
  'keddy':'keddybyeuropcar.com', 'interrent':'interrent.com', 'surprice':'surpricecarrentals.com',
  'green motion':'greenmotion.com', 'record go':'recordgo.com', 'drivalia':'drivalia.com',
  'maggiore':'maggiore.it', 'locauto':'locautorent.com', 'guerin':'guerin.pt',
  'ok mobility':'okmobility.com', 'flizzr':'flizzr.com', 'rentalcars':'rentalcars.com',
  'sicily by car':'sicilybycar.it', 'autovia':'autovia.pt', 'wheego':'wheego.pt',
  'ace':'acerentacar.com', 'del paso':'delpaso.es', 'orlando':'orlandocarrental.com'
};
function dominioDoAluguer(nome){
  const n = (nome || '').toLowerCase().trim();
  if(!n) return '';
  /* do nome mais longo para o mais curto, para «green motion» ganhar a
     «motion» e «sicily by car» não ser apanhado por outra entrada */
  const chaves = Object.keys(DOMINIO_ALUGUER).sort((a, b) => b.length - a.length);
  for(const k of chaves){
    /* nomes curtos só valem como palavra inteira: «ace» não pode apanhar
       «Ace» dentro de «Interlace» nem de «Palace» */
    const bate = k.length <= 4
      ? new RegExp('\\b' + k + '\\b').test(n)
      : n.includes(k);
    if(bate) return DOMINIO_ALUGUER[k];
  }
  return '';
}

async function actualizarCarrosReais(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-carro');
  if(!bloco || !ctx.destino || !ctx.ida || !ctx.fim) return;   /* não pediu carro */
  registarFonte('Aluguer de viaturas', 'a consultar');
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  const dias = Math.max(1, Math.round((ctx.fim - ctx.ida) / 86400000));

  let ofertas = [], moeda = '', pesquisa = '';
  if(base && ctx.destino.la != null){
    try{
      /* o nome em inglês ajuda o fornecedor a reconhecer o local; as
         coordenadas ficam como alternativa */
      const nome = (typeof WIKI_EN !== 'undefined' && WIKI_EN[ctx.destino.n]) || ctx.destino.n;
      const ps = new URLSearchParams({cidade: nome, lat: ctx.destino.la, lon: ctx.destino.lo,
                                      ida: f(ctx.ida), volta: f(ctx.fim),
                                      /* código da cidade, para o botão de reserva
                                         abrir a pesquisa no local certo */
                                      iata: ctx.destino.i || ''});
      const r = await fetch(base + '/carros?' + ps);
      const d = r.ok ? await r.json() : null;
      ofertas = (d && Array.isArray(d.ofertas)) ? d.ofertas : [];
      /* este fornecedor não aceita moeda no pedido: se o preço não vier em
         euros, mostra-se o código em vez de fingir que é € */
      moeda = (d && d.moeda) || '';
      pesquisa = (d && d.pesquisa) || '';
      if(!ofertas.length) registarFonte('Aluguer de viaturas', 'sem preços',
        [(d && (d.nota || d.erro)) || (r.ok ? 'sem viaturas para estas datas' : 'backend devolveu ' + r.status),
         d && d.quota].filter(Boolean).join(' · '));
    }catch(e){ registarFonte('Aluguer de viaturas', 'sem preços', 'sem ligação ao backend'); }
  }

  if(ofertas.length){
    registarFonte('Aluguer de viaturas', 'reais', ofertas.length + ' viaturas');
    const emEuros = !moeda || moeda.toUpperCase() === 'EUR';
    const valor = v => emEuros ? euros(v) : (v + ' ' + moeda.toUpperCase());
    /* só entra no total se estiver na mesma moeda do resto */
    if(emEuros && typeof registarPrecoReal === 'function')
      registarPrecoReal('carro', ofertas[0].preco, (ofertas[0].nome || 'viatura') + ' · ' + dias + (dias === 1 ? ' dia' : ' dias'));
    /* Os cartões da API não trazem ligação para a viatura, por isso o botão
       abre a pesquisa da Booking já com o local e as datas, construída no
       backend a partir dos parâmetros que a Booking documenta. A página de
       entrada fica como último recurso, e o endereço inventado que dava
       «Página não encontrada» desapareceu. */
    const liga = pesquisa || 'https://www.booking.com/cars/index.html';
    bloco.innerHTML = `
      <h3 class="bloco-titulo">🚗 Aluguer de viatura em ${escaparHtml(ctx.destino.n)} · preços reais</h3>
      <p class="bloco-sub tempo-real">⚡ Preços reais para ${dias} ${dias === 1 ? 'dia' : 'dias'} (Booking.com). Total do aluguer.</p>
      <p class="bloco-sub">Levantamento em ${escaparHtml(ctx.destino.n)}, nos balcões indicados em cada linha. No aeroporto os preços costumam ser outros. A página do parceiro deixa trocar o local.</p>
      ${ofertas.slice(0, 6).map((v, i) => `
        <div class="linha-oferta ${i === 0 ? 'melhor' : ''}">
          ${caixaLogotipo([
            v.logo,
            ...fontesDoDominio(dominioDoAluguer(v.fornecedor)),
            v.imagem
          ], v.fornecedor || v.nome || 'Aluguer', {titulo: v.fornecedor || ''})}
          <div class="oferta-info">
            <div class="oferta-nome">${escaparHtml(v.nome || 'Viatura')}${i === 0 ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${escaparHtml([
              v.fornecedor + (v.nota ? ' (' + v.nota + '/10)' : ''),
              v.detalhe
            ].filter(Boolean).join(' · ') || 'aluguer completo')}</div>
          </div>
          <div class="oferta-preco">
            ${v.precoAntes ? `<div class="preco-antes">${valor(v.precoAntes)}</div>` : ''}
            <div class="preco-actual">${valor(v.preco)}</div>
          </div>
          <a class="btn-ver" href="${escaparHtml(v.url || liga)}" target="_blank" rel="noopener">Reservar</a>
        </div>`).join('')}
      <p class="bloco-sub">A reserva é concluída no site do parceiro.${emEuros ? '' : ' Preços em ' + escaparHtml(moeda.toUpperCase()) + ', por não estarem disponíveis em euros.'}</p>`;
    return;
  }

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
