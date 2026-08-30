/* ═════════════════════════════════════════════════════════════
   TripNexus · pagina de resultados

   Junta os blocos numa pagina: a pesquisa simples, as abas que a dividem,
   a variante de varias cidades e os mapas. E o ficheiro que sabe a ordem
   por que as coisas aparecem.
   ═════════════════════════════════════════════════════════════ */

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

  /* ir por terra (comboio / autocarro): só a rota e quem vende o bilhete.
     Os preços saíam de uma fórmula por quilómetro com ruído aleatório. */
  const meiosTerrestres = ESTADO.transportes.filter(t => t === 'comboio' || t === 'autocarro');
  const terrestre = meiosTerrestres.length ? rotaTerrestre(o, d, meiosTerrestres) : null;

  /* alojamento, carro, transportes públicos, actividades */
  const todosAloj = ESTADO.alojamento.length ? cotacoesAlojamento(d, ida, fimEstadia, ESTADO.pax, tiposAlojamento()) : [];
  const alojamentos = aplicarFiltrosAloj(todosAloj);
  const melhorAloj = alojamentos[0] || null;

  /* se uma escolha esvaziou a lista, fecha o painel: aberto, taparia a
     mensagem e o botão de repor, deixando o utilizador sem saída */
  if(FILTRO_ABERTO && FILTRO_ABERTO.startsWith('voo:') && !voos.length) FILTRO_ABERTO = null;
  if(FILTRO_ABERTO && FILTRO_ABERTO.startsWith('aloj:') && !alojamentos.length) FILTRO_ABERTO = null;
  /* aluguer: só a lista de quem aluga. Os preços vinham do mesmo gerador
     aleatório das actividades, e até o modelo do carro era sorteado. */
  const diasCarro = Math.max(1, Math.round((fimEstadia - ida) / 86400000));
  const carros = ESTADO.transportes.includes('carro')
    ? parceirosDe('carro').map(parceiro => ({parceiro})) : null;
  const tp = ESTADO.transportes.includes('metro') ? estimativaTransportesPublicos(d, noites + 1, ESTADO.pax) : null;
  /* actividades: só a lista de quem as vende. Os preços vinham de um gerador
     aleatório com semente, o que é indefensável num comparador. */
  const actividades = parceirosDe('actividade').map(parceiro => ({parceiro}));

  /* total e pacotes */
  const extras = ESTADO.extras.length ? custoExtras(ESTADO.extras, ESTADO.pax, !!volta, noites) : [];
  /* o pacote compara-se com voo + alojamento; o carro deixou de ter preço */
  const somaPacote = melhorVoo.precoFinal + (melhorAloj ? melhorAloj.precoFinal : 0);
  const pacotes = (volta && melhorAloj) ? cotacoesPacote(o, d, ida, volta, ESTADO.classe, ESTADO.pax, somaPacote, false) : [];
  const melhorPacote = pacotes[0] || null;

  const nCupoes = [...todosVoos, ...todosAloj, ...(carros || []), ...pacotes]
    .filter(x => x.cupao).length;

  const tiposAloj = {hotel:'Hotel', casa:'Casa / apartamento', hostel:'Hostel'};
  const n = totalPax();

  /* o que o resumo precisa de saber; o live.js acrescenta-lhe os preços reais */
  RESUMO = {
    ctx, melhorVoo, pax: n, extras,
    voo:  {preco: melhorVoo.precoFinal, nome: PARCEIROS[melhorVoo.parceiro].nome},
    aloj: melhorAloj ? {preco: melhorAloj.precoFinal, nome: PARCEIROS[melhorAloj.parceiro].nome} : null,
    alojRotulo: melhorAloj ? tiposAloj[melhorAloj.tipo] : 'Alojamento',
    carro: null,   /* sem fonte de preço: só entra se o widget o assumir */
    tp: tp ? {preco: tp.total, real: !!tp.real,
              nome: tp.nome || (tp.dias + ' dias × ' + tp.pessoas + (tp.pessoas === 1 ? ' pessoa' : ' pessoas'))} : null
  };

  let html = `
    <div class="res-cabecalho">
      <h2>${o.f} ${o.n} ✈ ${d.f} ${d.n}</h2>
      <span class="res-detalhe">${formatarDataCurta(ida)}${volta ? ' - ' + formatarDataCurta(volta) : ' (só ida)'} ·
        ${n} ${n === 1 ? 'passageiro' : 'passageiros'} · ${NOME_CLASSE[ESTADO.classe]}
        ${nCupoes ? ` · <strong>🎟 ${nCupoes} ${nCupoes === 1 ? 'cupão encontrado' : 'cupões encontrados'}</strong>` : ''}</span>
    </div>
    <nav class="abas-resultados" id="abas-resultados" aria-label="Secções dos resultados"></nav>
    <div class="res-grelha">
      <div class="res-coluna">

        <div class="bloco" id="bloco-voos" data-aba="voos">
          <h3 class="bloco-titulo">✈ Voos · ${todosVoos.length} sites comparados</h3>
          ${barraFiltros(companhias)}
          ${voos.length ? voos.slice(0, 10).map(q => linhaOferta(q, {
            melhor: q === melhorVoo,
            detalhe: `${q.companhia} · ${q.escalas === 0 ? 'directo' : q.escalas + (q.escalas === 1 ? ' escala' : ' escalas')} · ${q.duracao} · partida ${q.partida}`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'voo'})
          })).join('') : '<p class="bloco-sub">Nenhum voo cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros">Repor filtros</button></p>'}
        </div>

        ${terrestre ? `
        <div class="bloco" data-aba="voos">
          <h3 class="bloco-titulo">🚆 Ir por terra (comboio / autocarro)</h3>
          <p class="bloco-sub">${o.n} a ${d.n}: ${terrestre.km.toLocaleString('pt-PT')} km em linha recta${terrestre.viavel ? '' : ', distância a que a viagem por terra deixa de fazer sentido'}.</p>
          <p class="bloco-sub">${terrestre.viavel
            ? 'Não temos fonte de tarifas reais de comboio e de autocarro, por isso <strong>não mostramos preço nenhum aqui</strong>: cada operador tem o dele, na página abaixo.'
            : 'A esta distância a ligação por terra, quando existe, é uma sucessão de troços de vários operadores. O Rome2Rio mostra-os todos, com a duração e o preço de cada um.'}</p>
          <div class="linha-oferta">${iconeParceiro('rome2rio')}
            <div class="oferta-info"><div class="oferta-nome">Rome2Rio</div><div class="oferta-detalhe">Todas as formas de ir de ${escaparHtml(o.n)} a ${escaparHtml(d.n)}, com duração e preço</div></div>
            <a class="btn-ver" href="${ligacaoParceiro('rome2rio', ctx)}" target="_blank" rel="noopener">Ver rotas</a>
          </div>
          ${terrestre.viavel ? terrestre.operadores.slice(0, 6).map(q => linhaSemPreco(q.parceiro, {
            /* só se diz «abre na rota» quando o endereço da rota é mesmo o
               que o parceiro documenta; nos outros abre a página de entrada */
            detalhe: q.meios.join(' e ') + (ROTA_DIRECTA.has(q.parceiro)
              ? ' · abre em ' + escaparHtml(o.n) + ' a ' + escaparHtml(d.n)
              : ' · procure a rota no site'),
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'terrestre', meio:q.meios[0]})
          })).join('') : ''}
        </div>` : ''}

        ${todosAloj.length ? `
        <div class="bloco" id="bloco-alojamento" data-aba="alojamento">
          <h3 class="bloco-titulo">🏨 Alojamento em ${d.n} · ${noites} ${noites === 1 ? 'noite' : 'noites'}</h3>
          <p class="nota-estimativa"><span aria-hidden="true">≈</span><span><strong>Valores estimados</strong> para comparação, calculados a partir de dados históricos. O preço real é confirmado no site do parceiro.</span></p>
          ${barraFiltrosAloj(todosAloj)}
          ${alojamentos.length ? alojamentos.slice(0,6).map((q, idx) => linhaOferta(q, {
            melhor: idx === 0, tag: tiposAloj[q.tipo],
            detalhe: `${q.descricao} · ${euros(q.porNoite)}/noite × ${q.noites} ${q.noites === 1 ? 'noite' : 'noites'}${q.tipo === 'hostel' ? ' × ' + q.quartos + ' camas' : (q.quartos > 1 ? ' × ' + q.quartos + ' quartos' : '')}`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'hotel'})
          })).join('') : '<p class="bloco-sub">Nenhum alojamento cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros-aloj">Repor filtros</button></p>'}
        </div>` : ''}

        ${carros ? `
        <div class="bloco" id="bloco-carro" data-aba="carro">
          <h3 class="bloco-titulo">🚗 Aluguer de viatura · ${diasCarro} ${diasCarro === 1 ? 'dia' : 'dias'}</h3>
          <p class="bloco-sub">Ainda não temos preços reais de aluguer para ${d.n}, por isso não mostramos nenhum. Veja directamente em quem aluga.</p>
          ${carros.map(q => linhaSemPreco(q.parceiro, {
            detalhe: 'Viaturas em ' + d.n + ' para ' + diasCarro + (diasCarro === 1 ? ' dia' : ' dias'),
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'carro'})
          })).join('')}
        </div>` : ''}

        <div class="bloco" id="bloco-roteiro" data-aba="actividades" hidden></div>

        <div class="bloco" id="bloco-actividades" data-aba="actividades">
          <h3 class="bloco-titulo">🎟 Actividades em ${d.n}</h3>
          <p class="bloco-sub">Não há fonte de preços reais de actividades para este destino, por isso não mostramos nenhum: um valor inventado seria pior do que valor nenhum. Veja directamente em quem as vende.</p>
          ${actividades.map(q => linhaSemPreco(q.parceiro, {
            detalhe: 'Passeios, visitas guiadas e bilhetes em ' + d.n,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'actividade'})
          })).join('')}
        </div>

        ${blocoTransportes(d, noites + 1)}
      </div>

      <div class="res-coluna">
        <div class="bloco resumo" id="bloco-resumo">${blocoResumo()}</div>

        ${blocoEvolucao(o, d, ida, melhorVoo.precoFinal)}

        ${pacotes.length ? `
        <div class="bloco" data-aba="viagem">
          <h3 class="bloco-titulo">📦 Pacotes (voo + alojamento)</h3>
          <p class="nota-estimativa"><span aria-hidden="true">≈</span><span><strong>Valores estimados</strong> para comparação com a reserva em separado (${euros(somaPacote)}). O preço exacto do pacote é confirmado no site do parceiro.</span></p>
          ${pacotes.map((q, idx) => {
            const dif = q.precoFinal - somaPacote;
            const recomendado = dif <= 0;
            const margemPequena = dif > 0 && dif <= somaPacote * 0.10;
            return `<div class="pacote ${recomendado ? 'recomendado' : ''}">
              ${recomendado ? '<span class="pacote-selo">Recomendado</span>' : (margemPequena ? '<span class="pacote-selo">Margem pequena</span>' : '')}
              <div class="pacote-cabeca">${iconeParceiro(q.parceiro)}
                <div><div class="pacote-nome">${PARCEIROS[q.parceiro].nome}</div><div class="pacote-inclui">${q.inclui}</div>${etiquetaCupao(q.cupao)}</div>
                <div class="pacote-preco">${q.cupao ? `<div class="preco-antes">≈ ${euros(q.preco)}</div>` : ''}<div class="preco-actual preco-estimado">≈ ${euros(q.precoFinal)}</div>
                  <a class="btn-ver" href="${ligacaoParceiro(q.parceiro, {...ctx, seccao:'pacote'})}" target="_blank" rel="noopener">Ver preço real</a></div>
              </div>
              <div class="pacote-compara">${
                recomendado
                  ? `<span class="poupa">Poupa ${euros(-dif)}</span> face às reservas em separado, nesta estimativa. Pode ser a melhor opção.`
                  : margemPequena
                    ? `Fica apenas <span class="acima">${euros(dif)} acima (${Math.round(dif / somaPacote * 100)} %)</span>, nesta estimativa. Pode compensar pela comodidade e protecção de pacote.`
                    : `Fica ${euros(dif)} acima das reservas em separado, nesta estimativa.`
              }</div>
            </div>`;
          }).join('')}
        </div>` : ''}

        <div class="bloco" data-aba="viagem">
          <h3 class="bloco-titulo">🗺 Mapa da viagem</h3>
          <div id="mapa-resultados" class="mapa"></div>
        </div>
        ${blocoDestino(d)}
      </div>
    </div>
    <div id="zona-larga"></div>`;

  const sec = document.getElementById('resultados');
  sec.innerHTML = html;
  sec.hidden = false;
  montarAbas(sec);
  desenharMapaResultados([o, d]);
  ligarFiltrosVoos(sec, desenharResultados);
  ligarFiltrosAloj(sec, desenharResultados);
  if(typeof montarAccoesResumo === 'function') montarAccoesResumo(sec, ctx, melhorVoo);
  if(typeof actualizarVoosReais === 'function') actualizarVoosReais(ctx);
  if(typeof actualizarAlojamentoReal === 'function') actualizarAlojamentoReal(ctx);
  if(typeof actualizarActividadesReais === 'function') actualizarActividadesReais(ctx);
  if(typeof actualizarCarrosReais === 'function') actualizarCarrosReais(ctx);
  if(typeof actualizarActividadesWidget === 'function') actualizarActividadesWidget(ctx);
  if(typeof desenharRoteiro === 'function') desenharRoteiro(d, noites);
}

/* ── abas dos resultados ──────────────────────────────────────
   EXPERIÊNCIA: a página de resultados era um único rolo muito comprido.
   As abas dividem-na sem mexer no conteúdo: cada bloco declara a que aba
   pertence num «data-aba», e a barra só mostra as abas que têm blocos.
   O resumo da viagem não tem «data-aba» de propósito: é o valor que se
   quer sempre à vista, seja qual for a aba.

   PARA REVERTER: apagar esta secção, a barra «abas-resultados» no HTML dos
   resultados, os atributos «data-aba» e a regra .fora-da-aba do CSS. Nada
   mais depende disto. */
const ABAS = [
  {id:'voos',        rotulo:'✈ Voos'},
  {id:'alojamento',  rotulo:'🏨 Alojamento'},
  {id:'carro',       rotulo:'🚗 Aluguer'},
  {id:'actividades', rotulo:'🎟 Actividades'},
  {id:'transportes',  rotulo:'🚇 Transportes'},
  {id:'viagem',      rotulo:'🗺 Viagem'}
];
/* guardada fora da função: os filtros de voos e de alojamento voltam a
   desenhar os resultados, e sem isto a aba escolhida saltava para trás */
let ABA_ACTIVA = 'voos';

function montarAbas(sec){
  const barra = sec.querySelector('#abas-resultados');
  if(!barra) return;
  const presentes = ABAS.filter(a => sec.querySelector('[data-aba="' + a.id + '"]'));
  /* com uma secção só, abas não são navegação nenhuma, são um enfeite */
  if(presentes.length < 2){ barra.hidden = true; return; }
  barra.hidden = false;
  barra.innerHTML = presentes.map(a =>
    `<button type="button" class="aba" data-ir="${a.id}">${a.rotulo}</button>`).join('')
    + '<button type="button" class="aba" data-ir="tudo">Tudo</button>';

  const mostrar = id => {
    /* classe, e não o atributo «hidden»: o bloco do roteiro gere o seu
       próprio «hidden» e as duas coisas têm de poder coexistir */
    sec.querySelectorAll('[data-aba]').forEach(el =>
      el.classList.toggle('fora-da-aba', id !== 'tudo' && el.dataset.aba !== id));
    /* Uma coluna sem nada dentro não deve continuar a ocupar metade do ecrã:
       na aba «Viagem» todos os blocos estão à direita, e à esquerda ficava um
       vazio enorme que parecia avaria. */
    const colunas = [...sec.querySelectorAll('.res-coluna')];
    colunas.forEach(c => c.classList.toggle('fora-da-aba',
      ![...c.children].some(el => !el.classList.contains('fora-da-aba') && !el.hidden)));
    const grelha = sec.querySelector('.res-grelha');
    if(grelha) grelha.classList.toggle('coluna-unica',
      colunas.filter(c => !c.classList.contains('fora-da-aba')).length < 2);
    barra.querySelectorAll('.aba').forEach(b => {
      const activa = b.dataset.ir === id;
      b.classList.toggle('activa', activa);
      b.setAttribute('aria-current', activa ? 'true' : 'false');
    });
    ABA_ACTIVA = id;
    /* o mapa foi criado dentro de um bloco escondido e mediu-se a zero: só
       quando a aba abre é que pode saber o tamanho que tem */
    if(mapaResultados && typeof mapaResultados.invalidateSize === 'function')
      requestAnimationFrame(() => mapaResultados.invalidateSize());
  };
  barra.addEventListener('click', e => {
    const b = e.target.closest('.aba');
    if(b) mostrar(b.dataset.ir);
  });
  const valida = ABA_ACTIVA === 'tudo' || presentes.some(a => a.id === ABA_ACTIVA);
  mostrar(valida ? ABA_ACTIVA : presentes[0].id);
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
          <h3 class="bloco-titulo">✈ Voos (todos os trocos) · ${voos.length} sites comparados</h3>
          ${voos.map((q, idx) => linhaOferta(q, {melhor: idx === 0, detalhe: q.detalhe, url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'voo'})})).join('')}
        </div>
        ${ESTADO.alojamento.length ? `
        <div class="bloco">
          <h3 class="bloco-titulo">🏨 Alojamento por cidade</h3>
          ${estadias.map(e => e.melhor ? linhaOferta(e.melhor, {
            tag: e.cidade.n,
            detalhe: `${e.melhor.descricao} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'} desde ${formatarDataCurta(e.inicio)}`,
            url: ligacaoParceiro(e.melhor.parceiro, {destino:e.cidade, ida:e.inicio, volta:e.fim, adultos:ESTADO.pax.adultos, criancas:ESTADO.pax.criancas, classe:ESTADO.classe, seccao:'hotel'})
          }) : '').join('')}
        </div>` : ''}
      </div>
      <div class="res-coluna">
        <div class="bloco resumo">
          <h3 class="bloco-titulo">🧾 Total estimado da viagem</h3>
          <div class="resumo-linha"><span>✈ Voos · ${trocos.length} trocos (${PARCEIROS[melhorVoo.parceiro].nome})</span><strong>${euros(melhorVoo.precoFinal)}</strong></div>
          ${estadias.filter(e => e.melhor).map(e => `<div class="resumo-linha"><span>🏨 ${e.cidade.n} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'} (${PARCEIROS[e.melhor.parceiro].nome})</span><strong>${euros(e.melhor.precoFinal)}</strong></div>`).join('')}
          <div class="resumo-total"><span>Total (${n} ${n === 1 ? 'passageiro' : 'passageiros'})</span><span class="valor-total">${euros(total)}</span></div>
          <p class="resumo-nota">Os pacotes e o aluguer de carro estão disponíveis nas pesquisas de ida e volta. Valores estimados.</p>
          <div class="accoes-resumo" id="accoes-resumo"></div>
        </div>
        <div class="bloco">
          <h3 class="bloco-titulo">🗺 Mapa da viagem</h3>
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
