/* ═════════════════════════════════════════════════════════════
   TripNexus · pagina de resultados

   Junta os blocos numa pagina: a pesquisa simples, as abas que a dividem,
   a variante de varias cidades e os mapas. E o ficheiro que sabe a ordem
   por que as coisas aparecem.
   ═════════════════════════════════════════════════════════════ */

/* A frase para uma cidade só: diz que não há aeroporto nenhum, ou, para as
   três com PSO da Sevenair (Bragança, Vila Real, Viseu: ver `vooLimitado`
   em data.js), diz a verdade sem esconder o aeroporto que existe. Essas
   três continuam a forçar o modelo «Ir por terra», porque a Sevenair não
   está indexada nas fontes de voos deste site e uma pesquisa aqui nunca ia
   encontrar essas tarifas; mas a mensagem não pode dizer que não têm
   aeroporto, que seria falso. */
function fraseSemVoo(cidade){
  if(!cidade.vooLimitado) return `${cidade.n} não tem aeroporto comercial`;
  const {operador, url} = cidade.vooLimitado;
  return `${cidade.n} só tem um pequeno serviço aéreo regional, da <a href="${escaparHtml(url)}" target="_blank" rel="noopener">${escaparHtml(operador)}</a>, que este site não compara`;
}

/* A frase que explica porque não há voos daqui. A alternativa de juntar um
   troço terrestre até ao aeroporto mais próximo e voar de lá (Fase 2) é o
   bloco #bloco-troco-aereo, mais abaixo em desenharResultados(): só entra
   para destinos fora de Portugal, onde o «Ir por terra» sozinho não chega. */
function motivoSemVoo(o, d){
  if(o.semAeroporto && d.semAeroporto)
    return `${fraseSemVoo(o)}, e ${fraseSemVoo(d)}: esta viagem não tem voos para comparar aqui.`;
  if(o.semAeroporto)
    return `${fraseSemVoo(o)}: não há voos a partir daí para comparar nesta pesquisa.`;
  return `${fraseSemVoo(d)}: não há voos para lá para comparar nesta pesquisa.`;
}

/* ── resultados: pesquisa simples ────────────────────────────── */
function desenharResultados(){
  /* Sem isto, um preço real de uma pesquisa anterior (voo, alojamento ou
     carro) ficava em PRECOS_REAIS e vazava para esta pesquisa nova antes
     de as fontes reais responderem outra vez: o resumo inicial podia
     mostrar um voo real de outra rota, nem que essa rota agora nem tivesse
     voo nenhum para comparar. */
  if(typeof limparPrecosReais === 'function') limparPrecosReais();
  const o = ESTADO.origem, d = ESTADO.destino;
  const ida = ESTADO.ida, volta = ESTADO.tipo === 'so-ida' ? null : ESTADO.volta;
  const ctx = {origem:o, destino:d, ida, volta, adultos:ESTADO.pax.adultos, criancas:ESTADO.pax.criancas, classe:ESTADO.classe};
  const fimEstadia = volta || (() => { const x = new Date(ida); x.setDate(x.getDate() + 3); return x; })();
  const noites = Math.max(1, Math.round((fimEstadia - ida) / 86400000));
  ctx.fim = fimEstadia;

  /* Coimbra, Guarda e outras cidades do interior não têm aeroporto
     comercial: gerar uma estimativa de voo, ou pior, tentar uma tarifa
     real, para uma rota que não existe seria voltar a inventar. */
  const semVoo = !!(o.semAeroporto || d.semAeroporto);

  /* voos (com filtros e ordenação aplicados) */
  const todosVoos = semVoo ? [] : parceirosDe('voo')
    .map(c => cotacaoVoo(c, o, d, ida, volta, ESTADO.classe, ESTADO.pax))
    .sort((a,b) => a.precoFinal - b.precoFinal);
  const companhias = [...new Set(todosVoos.map(q => q.companhia))].sort();
  const voos = aplicarFiltrosVoos(todosVoos);
  const melhorVoo = voos.length ? voos.reduce((m, q) => q.precoFinal < m.precoFinal ? q : m) : (todosVoos[0] || null);

  /* ir por terra (comboio / autocarro): só a rota e quem vende o bilhete.
     Sem aeroporto de um dos lados, é a única forma de chegar, por isso
     mostra-se sempre, mesmo que a pesquisa não tenha marcado nem comboio
     nem autocarro: esconder a única alternativa atrás de uma caixa por
     marcar não fazia sentido nenhum. */
  const meiosTerrestres = semVoo
    ? ['comboio', 'autocarro']
    : ESTADO.transportes.filter(t => t === 'comboio' || t === 'autocarro');
  const terrestre = meiosTerrestres.length ? rotaTerrestre(o, d, meiosTerrestres) : null;
  /* a CP e a Rede Expressos só operam dentro de Portugal: mostrar um dos
     dois numa rota internacional (Lisboa-Paris, por exemplo) sugeriria
     uma ligação que não existe. */
  const rotaPT = o.p === 'Portugal' && d.p === 'Portugal';
  /* preço real do comboio (CP), quando a rota está no tarifário; senão
     null, e o bloco não afirma nada sobre o comboio. */
  const tarifaCP = (rotaPT && terrestre && meiosTerrestres.includes('comboio')) ? tarifaComboioReal(o, d) : null;
  /* estimativa do autocarro, só quando o utilizador o pediu: não faz
     sentido mostrar uma gama de preço para um meio que não escolheu */
  const estBus = (rotaPT && terrestre && terrestre.viavel && meiosTerrestres.includes('autocarro'))
    ? estimativaAutocarro(terrestre.km) : null;

  /* Fase 2: para quem parte de uma cidade sem voo comparável rumo a fora
     de Portugal, a alternativa é chegar por terra ao aeroporto mais perto
     (gatewayMaisProximo, engine.js) e voar de lá. Só faz sentido para
     destinos fora do país: dentro de Portugal, o «Ir por terra» sozinho já
     resolve. O troço aéreo é sempre só ida (vooRealDeTroco, tal como nas
     viagens de várias cidades, não tem tarifa de ida e volta), mesmo numa
     pesquisa de ida e volta: quem quiser o regresso confere-o à parte. */
  const gateway = (semVoo && d.p !== 'Portugal') ? gatewayMaisProximo(o) : null;
  const kmGateway = gateway ? Math.round(distanciaKm(o, gateway)) : 0;
  const terraGateway = gateway ? {
    cp: tarifaComboioReal(o, gateway),
    bus: estimativaAutocarro(kmGateway)
  } : null;
  const precoTerraGateway = gateway ? (terraGateway.cp ? terraGateway.cp.preco : terraGateway.bus.tipico) : 0;
  /* o preço do voo começa como a estimativa do motor local (a mesma lógica
     de qualquer voo antes de a tarifa real chegar; ver `melhorVoo` acima)
     e troca-se pelo real assim que actualizarTrocoAereoReal() responder,
     em live.js. `linhaPernaMulti` (definida mais abaixo) já sabe desenhar
     as duas formas, porque é a mesma função que a viagem por várias
     cidades usa perna a perna. */
  const pernaVooGateway = gateway ? Object.assign(
    {troco:{origem:gateway, destino:d, data:ida}, real:false},
    parceirosDe('voo').map(c => cotacaoVoo(c, gateway, d, ida, null, ESTADO.classe, ESTADO.pax))
      .reduce((m, q) => q.precoFinal < m.precoFinal ? q : m)
  ) : null;

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
  /* o pacote compara-se com voo + alojamento; o carro deixou de ter preço.
     Sem voo não há pacote nenhum para comparar. */
  const somaPacote = (melhorVoo ? melhorVoo.precoFinal : 0) + (melhorAloj ? melhorAloj.precoFinal : 0);
  const pacotes = (!semVoo && volta && melhorAloj) ? cotacoesPacote(o, d, ida, volta, ESTADO.classe, ESTADO.pax, somaPacote, false) : [];
  const melhorPacote = pacotes[0] || null;

  const nCupoes = [...todosVoos, ...todosAloj, ...(carros || []), ...pacotes]
    .filter(x => x.cupao).length;

  const tiposAloj = {hotel:'Hotel', casa:'Casa / apartamento', hostel:'Hostel'};
  const n = totalPax();

  /* o que o resumo precisa de saber; o live.js acrescenta-lhe os preços reais */
  RESUMO = {
    ctx, melhorVoo, pax: n, extras,
    voo:  melhorVoo ? {preco: melhorVoo.precoFinal, nome: PARCEIROS[melhorVoo.parceiro].nome} : null,
    aloj: melhorAloj ? {preco: melhorAloj.precoFinal, nome: PARCEIROS[melhorAloj.parceiro].nome} : null,
    alojRotulo: melhorAloj ? tiposAloj[melhorAloj.tipo] : 'Alojamento',
    carro: null,   /* sem fonte de preço: só entra se o widget o assumir */
    tp: tp ? {preco: tp.total, real: !!tp.real,
              nome: tp.nome || (tp.dias + ' dias × ' + tp.pessoas + (tp.pessoas === 1 ? ' pessoa' : ' pessoas'))} : null
  };

  let html = `
    <div class="res-cabecalho">
      <h2>${o.f} ${o.n} ${semVoo ? '→' : '✈'} ${d.f} ${d.n}</h2>
      <span class="res-detalhe">${formatarDataCurta(ida)}${volta ? ' - ' + formatarDataCurta(volta) : ' (só ida)'} ·
        ${n} ${n === 1 ? 'passageiro' : 'passageiros'} · ${NOME_CLASSE[ESTADO.classe]}
        ${nCupoes ? ` · <strong>🎟 ${nCupoes} ${nCupoes === 1 ? 'cupão encontrado' : 'cupões encontrados'}</strong>` : ''}</span>
    </div>
    <nav class="abas-resultados" id="abas-resultados" aria-label="Secções dos resultados"></nav>
    <div class="res-grelha">
      <div class="res-coluna">

        ${semVoo ? `
        <div class="bloco" id="bloco-voos" data-aba="voos">
          <h3 class="bloco-titulo">✈ Voos</h3>
          <p class="bloco-sub">${motivoSemVoo(o, d)} Veja abaixo como chegar por terra.</p>
        </div>` : `
        <div class="bloco" id="bloco-voos" data-aba="voos">
          <h3 class="bloco-titulo">✈ Voos · ${todosVoos.length} sites comparados</h3>
          ${barraFiltros(companhias)}
          ${voos.length ? voos.slice(0, 10).map(q => linhaOferta(q, {
            melhor: q === melhorVoo,
            detalhe: `${q.companhia} · ${q.escalas === 0 ? 'directo' : q.escalas + (q.escalas === 1 ? ' escala' : ' escalas')} · ${q.duracao} · partida ${q.partida}`,
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'voo'})
          })).join('') : '<p class="bloco-sub">Nenhum voo cumpre os filtros escolhidos. <button type="button" class="btn-suave" id="repor-filtros">Repor filtros</button></p>'}
        </div>`}

        ${terrestre ? `
        <div class="bloco" data-aba="voos">
          <h3 class="bloco-titulo">🚆 Ir por terra (comboio / autocarro)</h3>
          <p class="bloco-sub">${o.n} a ${d.n}: ${terrestre.km.toLocaleString('pt-PT')} km em linha recta${terrestre.viavel ? '' : ', distância a que a viagem por terra deixa de fazer sentido'}.</p>
          ${terrestre.viavel ? '' : '<p class="bloco-sub">A esta distância a ligação por terra, quando existe, é uma sucessão de troços de vários operadores. O Rome2Rio mostra-os todos, com a duração e o preço de cada um.</p>'}
          ${tarifaCP ? linhaOferta({parceiro:'cp', preco:tarifaCP.preco, precoFinal:tarifaCP.preco, cupao:null}, {
            estimativa:false,
            detalhe: `${escaparHtml(tarifaCP.servico)} · bilhete simples, 2ª classe · ${escaparHtml(o.n)} → ${escaparHtml(d.n)}`,
            url: ligacaoParceiro('cp', {...ctx, seccao:'terrestre', meio:'Comboio'})
          }) + procedenciaTransportes(tarifaCP) : ''}
          ${estBus ? linhaOferta({parceiro:'redeexpressos', preco:estBus.tipico, precoFinal:estBus.tipico, cupao:null}, {
            estimativa:true,
            detalhe: `Autocarro · ${escaparHtml(o.n)} → ${escaparHtml(d.n)} · entre ${euros(estBus.min)} e ${euros(estBus.max)}, consoante a antecedência`,
            url: ligacaoParceiro('redeexpressos', {...ctx, seccao:'terrestre', meio:'Autocarro'})
          }) : ''}
          ${terrestre.viavel && (!tarifaCP && meiosTerrestres.includes('comboio') || !estBus && meiosTerrestres.includes('autocarro')) ? `
          <p class="bloco-sub">${rotaPT
            ? (!tarifaCP && meiosTerrestres.includes('comboio') ? 'Não temos tarifário confirmado da CP para esta rota. ' : '') + (!estBus && meiosTerrestres.includes('autocarro') ? 'Não temos preço de autocarro para esta rota. ' : '')
            : 'A CP e a Rede Expressos só operam dentro de Portugal, por isso não têm preço aqui. '}<strong>Não mostramos números que não tenhamos</strong>: cada operador tem o dele, na página abaixo.</p>` : ''}
          <div class="linha-oferta">${iconeParceiro('rome2rio')}
            <div class="oferta-info"><div class="oferta-nome">Rome2Rio</div><div class="oferta-detalhe">Todas as formas de ir de ${escaparHtml(o.n)} a ${escaparHtml(d.n)}, com duração e preço</div></div>
            <a class="btn-ver" href="${ligacaoParceiro('rome2rio', ctx)}" target="_blank" rel="noopener">Ver rotas</a>
          </div>
          ${terrestre.viavel ? terrestre.operadores.filter(q => {
            /* a CP e a Rede Expressos só vendem rotas dentro de Portugal;
               fora disso nem a ligação de reserva à página inicial se mostra,
               que sugeriria uma venda que estes dois não fazem */
            if((q.parceiro === 'cp' || q.parceiro === 'redeexpressos') && !rotaPT) return false;
            if(q.parceiro === 'cp' && tarifaCP) return false;
            if(q.parceiro === 'redeexpressos' && estBus) return false;
            return true;
          }).slice(0, 6).map(q => linhaSemPreco(q.parceiro, {
            /* a rota mostra-se sempre, mesmo quando a ligação só abre a
               página inicial: chegar lá sem saber o que procurar não ajuda
               ninguém, e a rota é informação que já temos, não inventada */
            detalhe: q.meios.join(' e ') + ' · ' + escaparHtml(o.n) + ' → ' + escaparHtml(d.n) + (ROTA_DIRECTA.has(q.parceiro)
              ? ' (a página já abre nesta rota)'
              : ' (procure esta rota no site)'),
            url: ligacaoParceiro(q.parceiro, {...ctx, seccao:'terrestre', meio:q.meios[0]})
          })).join('') : ''}
        </div>` : ''}

        ${gateway ? `
        <div class="bloco" id="bloco-troco-aereo" data-aba="voos" data-preco-terra="${precoTerraGateway}">
          <h3 class="bloco-titulo">✈ Voo com troço terrestre até ${escaparHtml(gateway.n)}</h3>
          <p class="bloco-sub">${escaparHtml(o.n)} não tem voo comparável para ${escaparHtml(d.n)}: uma alternativa é chegar por terra a ${gateway.f} ${escaparHtml(gateway.n)} (${kmGateway.toLocaleString('pt-PT')} km) e voar de lá. São duas reservas separadas, em sítios diferentes: a ligação entre as duas é da sua conta. Preços só de ida.</p>
          ${terraGateway.cp ? linhaOferta({parceiro:'cp', preco:terraGateway.cp.preco, precoFinal:terraGateway.cp.preco, cupao:null}, {
            estimativa:false,
            detalhe: `1. Por terra · ${escaparHtml(terraGateway.cp.servico)} · ${escaparHtml(o.n)} → ${escaparHtml(gateway.n)}`,
            url: ligacaoParceiro('cp', {...ctx, seccao:'terrestre', meio:'Comboio'})
          }) + procedenciaTransportes(terraGateway.cp) : linhaOferta({parceiro:'redeexpressos', preco:terraGateway.bus.tipico, precoFinal:terraGateway.bus.tipico, cupao:null}, {
            estimativa:true,
            detalhe: `1. Por terra · Autocarro · ${escaparHtml(o.n)} → ${escaparHtml(gateway.n)} · entre ${euros(terraGateway.bus.min)} e ${euros(terraGateway.bus.max)}`,
            url: ligacaoParceiro('redeexpressos', {...ctx, seccao:'terrestre', meio:'Autocarro'})
          })}
          <div id="troco-aereo-voo">${linhaPernaMulti(pernaVooGateway, ctx)}</div>
          <p class="bloco-sub" id="troco-aereo-total"><strong>Total, só ida: ${euros(precoTerraGateway + pernaVooGateway.precoFinal)}</strong></p>
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

        ${semVoo ? '' : blocoEvolucao(o, d, ida, melhorVoo.precoFinal)}

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
  /* a evolução do preço só arranca depois dos voos reais, para usar o preço
     de hoje mais fresco que houver (o real, se tiver vindo; a estimativa
     local, senão) em vez do valor com que a página abriu. Sem voo nenhum
     para comparar, nem vale a pena perguntar. */
  const evolucaoComPrecoHoje = () => {
    if(typeof actualizarEvolucaoReal !== 'function') return;
    const real = typeof PRECOS_REAIS !== 'undefined' && PRECOS_REAIS.voo && PRECOS_REAIS.voo.preco;
    actualizarEvolucaoReal(ctx, real || melhorVoo.precoFinal);
  };
  if(!semVoo){
    if(typeof actualizarVoosReais === 'function') actualizarVoosReais(ctx).then(evolucaoComPrecoHoje);
    else evolucaoComPrecoHoje();
  }
  if(typeof actualizarAlojamentoReal === 'function') actualizarAlojamentoReal(ctx);
  if(typeof actualizarActividadesReais === 'function') actualizarActividadesReais(ctx);
  if(typeof actualizarCarrosReais === 'function') actualizarCarrosReais(ctx);
  if(typeof actualizarActividadesWidget === 'function') actualizarActividadesWidget(ctx);
  if(gateway && typeof actualizarTrocoAereoReal === 'function') actualizarTrocoAereoReal(ctx, gateway, precoTerraGateway);
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
/* Cotação mais barata do motor local para UM troço (não a soma da viagem
   inteira): é o que serve de recurso, perna a perna, enquanto o real não
   chega — ver `RESUMO_MULTI` e `actualizarMultiReais` em live.js. */
function cotacaoMaisBarataTroco(o, d, ida, classe, pax){
  let melhor = null;
  for(const c of parceirosDe('voo')){
    const q = cotacaoVoo(c, o, d, ida, null, classe, pax);
    if(!melhor || q.precoFinal < melhor.precoFinal) melhor = q;
  }
  return melhor;
}

/* Guarda o estado desta viagem para o live.js poder actualizar perna a
   perna, e para `renderizarMulti` o poder redesenhar depois de o real
   chegar, sem recalcular nada do motor local outra vez. */
let RESUMO_MULTI = null;

function linhaPernaMulti(p, ctx){
  const rota = p.troco.origem.n + ' → ' + p.troco.destino.n;
  if(p.real){
    return `<div class="linha-oferta">
      ${iconeCompanhia(p.codigo, p.companhia)}
      <div class="oferta-info">
        <div class="oferta-nome">${escaparHtml(p.companhia || 'Companhia aérea')}</div>
        <div class="oferta-detalhe">${escaparHtml(rota + ' · ' + textoEscalas(p.escalas) + (p.duracao ? ' · ' + p.duracao : ''))}</div>
      </div>
      <div class="oferta-preco"><div class="preco-actual">${euros(p.precoFinal)}</div></div>
      <a class="btn-ver" href="${escaparHtml(p.url || ligacaoParceiro('skyscanner', {...ctx, origem:p.troco.origem, destino:p.troco.destino, ida:p.troco.data, seccao:'voo'}))}" target="_blank" rel="noopener">Reservar</a>
    </div>`;
  }
  return linhaOferta(p, {
    detalhe: `${rota} · ${p.companhia} · ${textoEscalas(p.escalas)}`,
    url: ligacaoParceiro(p.parceiro, {...ctx, origem:p.troco.origem, destino:p.troco.destino, ida:p.troco.data, seccao:'voo'})
  });
}

function linhaEstadiaMulti(e, ctx){
  if(!e.melhor) return '';
  if(e.real){
    const h = e.melhor;
    const liga = ligacaoParceiro(h.cat === 'casa' ? 'airbnb' : 'booking',
      {destino:e.cidade, ida:e.inicio, volta:e.fim, adultos:ctx.adultos, criancas:ctx.criancas, classe:ctx.classe, seccao:'hotel'});
    const detalhe = [h.estrelas ? '★'.repeat(Math.min(5, Math.round(h.estrelas))) : '',
      e.noites + (e.noites === 1 ? ' noite' : ' noites') + ' desde ' + formatarDataCurta(e.inicio)].filter(Boolean).join(' · ');
    return `<div class="linha-oferta">
      ${caixaLogotipo([h.imagem], h.nome || 'Alojamento', {foto:true})}
      <div class="oferta-info">
        <div class="oferta-nome">${escaparHtml(h.nome || 'Alojamento')} <span class="alt-tag">${escaparHtml(e.cidade.n)}</span></div>
        <div class="oferta-detalhe">${escaparHtml(detalhe)}</div>
      </div>
      <div class="oferta-preco"><div class="preco-actual">${euros(h.precoFinal)}</div></div>
      <a class="btn-ver" href="${liga}" target="_blank" rel="noopener">Reservar</a>
    </div>`;
  }
  return linhaOferta(e.melhor, {
    tag: e.cidade.n,
    detalhe: `${e.melhor.descricao} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'} desde ${formatarDataCurta(e.inicio)}`,
    url: ligacaoParceiro(e.melhor.parceiro, {destino:e.cidade, ida:e.inicio, volta:e.fim, adultos:ctx.adultos, criancas:ctx.criancas, classe:ctx.classe, seccao:'hotel'})
  });
}

function desenharResultadosMulti(){
  const trocos = ESTADO.trocos;
  const n = totalPax();
  const ctx = {origem:trocos[0].origem, destino:trocos[trocos.length-1].destino, ida:trocos[0].data, volta:null, adultos:ESTADO.pax.adultos, criancas:ESTADO.pax.criancas, classe:ESTADO.classe};

  /* estimativa local, perna a perna: fica logo pronta a mostrar, e é o
     recurso que sobra onde o real (pedido a seguir, em live.js) não chegar */
  const pernas = trocos.map(t => ({
    troco: t, real: false,
    ...cotacaoMaisBarataTroco(t.origem, t.destino, t.data, ESTADO.classe, ESTADO.pax)
  }));

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
      estadias.push({cidade, noites, melhor: melhores[0], real:false, inicio, fim});
    } else estadias.push({cidade, noites, melhor:null, real:false, inicio, fim});
  }

  RESUMO_MULTI = {ctx, trocos, pernas, estadias, tiposAloj: ESTADO.alojamento.length ? tiposAlojamento() : []};

  document.getElementById('resultados').hidden = false;
  renderizarMulti();
  if(typeof actualizarMultiReais === 'function') actualizarMultiReais();
}

/* Redesenha os blocos de voos, alojamento e o resumo a partir do que
   `RESUMO_MULTI` tiver agora: chamada uma vez com tudo estimado, e outra
   vez por live.js quando o real (perna a perna) tiver chegado. */
function renderizarMulti(){
  const R = RESUMO_MULTI;
  if(!R) return;
  const {ctx, trocos, pernas, estadias} = R;
  const n = totalPax();
  const totalVoo = pernas.reduce((s, p) => s + p.precoFinal, 0);
  const totalAloj = estadias.reduce((s, e) => s + (e.melhor ? e.melhor.precoFinal : 0), 0);
  const total = totalVoo + totalAloj;
  const vooTodoReal = pernas.every(p => p.real);
  const alojTodoReal = estadias.every(e => !e.melhor || e.real);
  const totalTodoReal = vooTodoReal && alojTodoReal;

  const html = `
    <div class="res-cabecalho">
      <h2>🌍 Viagem por ${trocos.length + 1} cidades</h2>
      <span class="res-detalhe">${trocos.map(t => t.origem.n).join(' → ')} → ${trocos[trocos.length-1].destino.n} ·
        ${n} ${n === 1 ? 'passageiro' : 'passageiros'} · ${NOME_CLASSE[ESTADO.classe]}</span>
    </div>
    <div class="res-grelha">
      <div class="res-coluna">
        <div class="bloco">
          <h3 class="bloco-titulo">✈ Voos (todos os trocos)</h3>
          ${!vooTodoReal ? `<p class="nota-estimativa"><span aria-hidden="true">≈</span><span>Os trocos marcados com «≈» não têm tarifa real registada para estas datas: <strong>é uma estimativa</strong>.</span></p>` : ''}
          ${pernas.map(p => linhaPernaMulti(p, ctx)).join('')}
        </div>
        ${ESTADO.alojamento.length ? `
        <div class="bloco">
          <h3 class="bloco-titulo">🏨 Alojamento por cidade</h3>
          ${!alojTodoReal ? `<p class="nota-estimativa"><span aria-hidden="true">≈</span><span>As estadias marcadas com «≈» não têm tarifa real (Google Hotels) para estas datas: <strong>é uma estimativa</strong>.</span></p>` : ''}
          ${estadias.map(e => linhaEstadiaMulti(e, ctx)).join('')}
        </div>` : ''}
      </div>
      <div class="res-coluna">
        <div class="bloco resumo">
          <h3 class="bloco-titulo">🧾 Total ${totalTodoReal ? '' : 'estimado '}da viagem</h3>
          <div class="resumo-linha"><span>✈ Voos · ${trocos.length} trocos</span><strong>${vooTodoReal ? '' : '≈ '}${euros(totalVoo)}</strong></div>
          ${estadias.filter(e => e.melhor).map(e => `<div class="resumo-linha"><span>🏨 ${e.cidade.n} · ${e.noites} ${e.noites === 1 ? 'noite' : 'noites'}</span><strong>${e.real ? '' : '≈ '}${euros(e.melhor.precoFinal)}</strong></div>`).join('')}
          <div class="resumo-total"><span>Total (${n} ${n === 1 ? 'passageiro' : 'passageiros'})</span><span class="valor-total">${totalTodoReal ? '' : '≈ '}${euros(total)}</span></div>
          <p class="resumo-nota">${totalTodoReal
            ? '<strong>Todas as parcelas são preços reais.</strong>'
            : 'As parcelas marcadas com «≈» ainda são estimativas; as restantes são preços reais.'} Os pacotes e o aluguer de carro estão disponíveis nas pesquisas de ida e volta.</p>
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
