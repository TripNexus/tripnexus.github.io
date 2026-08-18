/* ═════════════════════════════════════════════════════════════
   TripNexus · blocos de resultado

   Cada funcao aqui devolve o HTML de um bloco da pagina de resultados, e
   nada mais: o resumo da viagem com o total, a evolucao do preco do voo,
   os transportes no destino e a ficha da cidade. Quem os junta e o
   results.js.
   ═════════════════════════════════════════════════════════════ */

/* ── resumo da viagem ─────────────────────────────────────────
   O total tem de acompanhar os preços reais: até aqui somava sempre as
   estimativas do motor local, mesmo com os blocos ao lado já a mostrar
   valores reais, o que dava dois números diferentes no mesmo ecrã.
   Guarda-se aqui o que a última pesquisa calculou; o live.js deposita os
   preços reais em PRECOS_REAIS e manda redesenhar. */
let RESUMO = null;
const PRECOS_REAIS = {voo: null, alojamento: null, carro: null};

function limparPrecosReais(){
  PRECOS_REAIS.voo = PRECOS_REAIS.alojamento = PRECOS_REAIS.carro = null;
}
/* chamada pelo live.js sempre que uma fonte real responde */
function registarPrecoReal(seccao, preco, nome){
  /* «widget» é o caso do carro: há preços reais, mas só dentro do quadro do
     parceiro, que não nos diz o valor */
  if(preco !== 'widget' && !(preco > 0)) return;
  PRECOS_REAIS[seccao] = preco === 'widget' ? 'widget' : {preco, nome: nome || ''};
  const cx = document.getElementById('bloco-resumo');
  if(cx) cx.innerHTML = blocoResumo();
  if(RESUMO && typeof montarAccoesResumo === 'function'){
    try{ montarAccoesResumo(document, RESUMO.ctx, RESUMO.melhorVoo); }catch(e){}
  }
}

function blocoResumo(){
  const R = RESUMO;
  if(!R) return '';
  /* cada parcela usa o preço real quando existe, e diz-se qual é qual */
  const linha = (icone, rotulo, estimado, real) => {
    if(estimado == null && !real) return {html:'', valor:0, real:false};
    const usaReal = !!real;
    const valor = usaReal ? real.preco : estimado.preco;
    const quem = usaReal ? (real.nome || 'preço real') : estimado.nome;
    return {
      valor, real: usaReal,
      html: `<div class="resumo-linha">
        <span>${icone} ${rotulo} <span class="resumo-fonte ${usaReal ? 'real' : ''}">${escaparHtml(quem)}</span></span>
        <strong>${usaReal ? '' : '≈ '}${euros(valor)}</strong></div>`
    };
  };
  /* o widget do parceiro mostra preços reais mas não no-los diz: pôr aqui a
     estimativa ao lado de um quadro com valores verdadeiros seria contradizer-se,
     por isso a linha fica sem valor e fora da soma */
  const carro = PRECOS_REAIS.carro === 'widget'
    ? {valor: 0, real: true, html: `<div class="resumo-linha">
        <span>🚗 Carro <span class="resumo-fonte real">preços reais no quadro do parceiro</span></span>
        <strong>ver quadro</strong></div>`}
    : linha('🚗', 'Carro', R.carro, PRECOS_REAIS.carro);
  const partes = [
    linha('✈', 'Voo', R.voo, PRECOS_REAIS.voo),
    /* com preço real o tipo pode não ser o que o motor local escolheu */
    linha('🏨', PRECOS_REAIS.alojamento ? 'Alojamento' : (R.alojRotulo || 'Alojamento'),
          R.aloj, PRECOS_REAIS.alojamento),
    carro,
    /* com tarifário publicado da cidade o valor é real e não leva «≈» */
    linha('🚇', 'Transportes públicos',
          R.tp && !R.tp.real ? R.tp : null,
          R.tp && R.tp.real ? R.tp : null)
  ].filter(p => p.html);
  const extras = R.extras.map(x => ({
    valor: x.total, real: false,
    html: `<div class="resumo-linha"><span>${x.nome} <span class="resumo-fonte">${x.detalhe}</span></span><strong>≈ ${euros(x.total)}</strong></div>`
  }));
  const todas = [...partes, ...extras];
  const total = todas.reduce((s, p) => s + p.valor, 0);
  const porEstimar = todas.filter(p => !p.real).length;
  const n = R.pax;
  return `
    <h3 class="bloco-titulo">🧾 Total da viagem</h3>
    ${todas.map(p => p.html).join('')}
    <div class="resumo-total"><span>Total (${n} ${n === 1 ? 'passageiro' : 'passageiros'})</span>
      <span class="valor-total">${porEstimar ? '≈ ' : ''}${euros(total)}</span></div>
    <p class="resumo-nota">${porEstimar
      ? 'Combinação mais barata encontrada. As parcelas marcadas com «≈» ainda são estimativas; as restantes são preços reais.'
      : '<strong>Todas as parcelas são preços reais.</strong> Combinação mais barata encontrada, com cupões já descontados.'}</p>
    <div class="accoes-resumo" id="accoes-resumo"></div>`;
}

/* ── gráfico de evolução do preço (SVG, sem bibliotecas) ─────── */
function graficoEvolucao(serie){
  const n = serie.pontos.length;
  const min = Math.min(...serie.pontos), max = Math.max(...serie.pontos);
  const amp = Math.max(1, max - min);
  const X = i => 8 + (i / (n - 1)) * 304;
  const Y = p => 12 + (1 - (p - min) / amp) * 86;
  const linha = serie.pontos.map((p, i) => `${X(i).toFixed(1)},${Y(p).toFixed(1)}`).join(' ');
  const yTipico = Y(serie.tipico).toFixed(1);
  const corPonto = serie.tipo === 'bom' ? '#0e9f6e' : (serie.tipo === 'alto' ? '#f59e0b' : '#4353ff');
  return `<svg class="grafico-preco" viewBox="0 0 320 132" role="img" aria-label="Evolução estimada do preço do voo">
    <polygon points="8,104 ${linha} 312,104" fill="rgba(67,83,255,.10)"/>
    <line x1="8" y1="${yTipico}" x2="312" y2="${yTipico}" stroke="#a9b0c8" stroke-dasharray="4 4" stroke-width="1"/>
    <text x="310" y="${(+yTipico - 4).toFixed(1)}" text-anchor="end" class="g-tipico">típico: ${euros(serie.tipico)}</text>
    <polyline points="${linha}" fill="none" stroke="#4353ff" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${X(n - 1).toFixed(1)}" cy="${Y(serie.pontos[n - 1]).toFixed(1)}" r="4.2" fill="${corPonto}"/>
    <text x="8" y="124" class="g-eixo">há 8 semanas</text>
    <text x="160" y="124" text-anchor="middle" class="g-eixo">há 4 semanas</text>
    <text x="312" y="124" text-anchor="end" class="g-eixo">hoje</text>
  </svg>`;
}
function blocoEvolucao(o, d, ida, precoHoje){
  const serie = serieHistoricaVoo(o, d, ida, precoHoje);
  const texto = serie.tipo === 'bom'
    ? `✅ Bom momento para comprar: o preço está ${-serie.dif} % abaixo do típico das últimas 8 semanas.`
    : serie.tipo === 'alto'
      ? `⚠️ Preço alto: está ${serie.dif} % acima do típico das últimas 8 semanas. Se puder, aguarde ou active um alerta de preço.`
      : `➖ Preço dentro do típico das últimas 8 semanas.`;
  return `
        <div class="bloco" id="bloco-evolucao" data-aba="viagem">
          <h3 class="bloco-titulo">📈 Evolução do preço do voo</h3>
          <div class="veredicto ${serie.tipo}">${texto}</div>
          ${graficoEvolucao(serie)}
          <p class="bloco-sub" style="margin:.5rem 0 0">Evolução estimada para esta rota e datas, ancorada no melhor preço actual (${euros(precoHoje)}).</p>
        </div>`;
}

/* ── transportes no destino ───────────────────────────────────
   Quanto custa andar na cidade, em que bilhete, e se se compra antes de
   partir ou à chegada. Ao contrário do resto do site, estes valores não vêm
   de uma API: são tarifas publicadas pelos operadores, que mudam uma ou duas
   vezes por ano. Por isso cada bloco leva a ligação oficial e o ano, e as
   cidades que não estão na tabela não mostram valor nenhum. */
function blocoTransportes(d, dias){
  const t = transportesDe(d);
  if(!t){
    const procura = 'https://www.google.com/search?q=' + encodeURIComponent(
      'transportes públicos ' + d.n + ' bilhetes e passes preços');
    return `<div class="bloco" data-aba="transportes">
      <h3 class="bloco-titulo">🚇 Transportes em ${escaparHtml(d.n)}</h3>
      <p class="bloco-sub">Ainda não temos as tarifas de ${escaparHtml(d.n)} verificadas, e não mostramos valores que não tenhamos confirmado. Consulte o operador local:</p>
      <a class="btn-ver btn-inline" href="${procura}" target="_blank" rel="noopener">Procurar bilhetes e passes ↗</a>
    </div>`;
  }
  const p = perfisTransporte(d, dias, ESTADO.pax);
  const moeda = t.moeda || 'EUR';
  const valor = v => moeda === 'EUR' ? eurosExactos(v)
    : (Number.isInteger(v) ? v : v.toFixed(2)) + ' ' + moeda;
  const selos = modos => (modos || []).map(m => {
    const x = MODOS_TRANSPORTE[m];
    return x ? `<span class="selo-modo">${x.icone} ${escaparHtml(x.nome)}</span>` : '';
  }).join('');
  const quandoTxt = {
    antes:   {rotulo:'Comprar antes de partir', classe:'antes'},
    chegada: {rotulo:'Comprar à chegada',       classe:'chegada'}
  };

  /* Os três perfis primeiro: é a decisão que o utilizador tem de tomar.
     A lista completa fica a seguir, para quem quiser conferir. */
  const cartoes = !p ? '' : `
    <div class="perfis-transporte">
      ${p.perfis.map(perf => `
        <div class="perfil-transporte${perf.maisBarato ? ' melhor' : ''}">
          <div class="perfil-cabeca">
            <span class="perfil-rotulo">${escaparHtml(perf.rotulo)}</span>
            ${perf.maisBarato ? '<span class="selo-melhor">Mais barato</span>' : ''}
          </div>
          <div class="perfil-preco">${valor(perf.total)}</div>
          <p class="perfil-descricao">${escaparHtml(perf.descricao)}</p>
          <ul class="perfil-titulos">
            ${perf.titulos.map(x => `<li>${x.n > 1 ? x.n + '× ' : ''}${escaparHtml(x.bilhete.nome)}</li>`).join('')}
          </ul>
          <div class="selos-modos">${selos(perf.modos)}</div>
          ${perf.pressuposto ? `<p class="perfil-nota">Contado a ${escaparHtml(perf.pressuposto)}. Se andar mais, um passe compensa.</p>` : ''}
        </div>`).join('')}
    </div>
    <p class="bloco-sub">Valores para ${p.dias} ${p.dias === 1 ? 'dia' : 'dias'}${p.pessoas > 1 ? ' e ' + p.pessoas + ' pessoas' : ''}. O «mais barato» não é sempre o melhor: um passe que cobre o aeroporto pode compensar mesmo custando mais.</p>`;

  return `<div class="bloco" data-aba="transportes">
    <h3 class="bloco-titulo">🚇 Transportes em ${escaparHtml(d.n)}</h3>
    <p class="bloco-sub">${escaparHtml(t.operador)} · tarifas publicadas em ${t.ano}${moeda !== 'EUR' ? ' · valores em ' + moeda : ''}.</p>
    ${t.cartao ? `<p class="dica-transportes">💳 <strong>${escaparHtml(t.cartao.nome)}</strong>: ${valor(t.cartao.preco)}, ${escaparHtml(t.cartao.nota)}. Não está incluído nos valores abaixo.</p>` : ''}
    ${t.nota ? `<p class="dica-transportes">💡 ${escaparHtml(t.nota)}</p>` : ''}
    ${cartoes}
    <h4 class="sub-titulo">Todos os títulos</h4>
    <div class="lista-transportes">
      ${t.bilhetes.map(b => {
        const q = quandoTxt[b.quando] || quandoTxt.chegada;
        /* só se assinala quando o título serve mesmo vários transportes: com
           dois modos as etiquetas já o dizem, e repeti-lo em todas as linhas
           tornava o aviso invisível de tão frequente */
        const varios = (b.modos || []).length >= 3;
        return `<div class="linha-transporte">
          <div class="transporte-topo">
            <span class="transporte-nome">${escaparHtml(b.nome)}</span>
            <span class="transporte-preco">${valor(b.preco)}<small>por ${escaparHtml(b.unidade)}</small></span>
          </div>
          <div class="selos-modos">${selos(b.modos)}</div>
          <div class="transporte-fundo">
            <span class="etiqueta-quando ${q.classe}">${q.rotulo}</span>
            ${varios ? `<span class="transporte-varios">Um título para ${(b.modos || []).length} transportes</span>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
    <p class="bloco-sub">Estas tarifas são publicadas pelo operador e mudam uma ou duas vezes por ano. Ao contrário dos voos e do alojamento, não são consultadas em tempo real. <a href="${escaparHtml(t.url)}" target="_blank" rel="noopener">Confirme em ${escaparHtml(t.operador)} ↗</a></p>
  </div>`;
}

/* ── bloco «Sobre o destino» (clima, melhor altura, links) ───── */

function blocoDestino(d){
  const t = climaEstimado(d);
  const bons = t.map((x, i) => ({x, i})).filter(o => o.x >= 16 && o.x <= 28).map(o => MESES[o.i]);
  const min = Math.min(...t), max = Math.max(...t), amp = Math.max(1, max - min);
  const barras = t.map((x, i) => {
    const h = 8 + ((x - min) / amp) * 34;
    const cor = x >= 28 ? '#f59e0b' : (x >= 16 ? '#0e9f6e' : '#4da3f5');
    return `<div class="clima-col"><div class="clima-barra" style="height:${h.toFixed(0)}px;background:${cor}" title="${x}°C"></div><span>${MESES_INI[i]}</span></div>`;
  }).join('');
  const linkVisto = 'https://www.google.com/search?q=' + encodeURIComponent('requisitos de entrada e vistos ' + d.p + ' para cidadãos portugueses');
  return `<div class="bloco" data-aba="viagem">
    <h3 class="bloco-titulo">🌡 Sobre ${d.n}</h3>
    <p class="bloco-sub">${d.p}. Clima típico estimado (máximas médias, °C):</p>
    <div class="clima">${barras}</div>
    ${bons.length ? `<p class="bloco-sub" style="margin-top:.6rem">🗓 Melhor altura para visitar: <strong>${bons.join(', ')}</strong>.</p>` : ''}
    <a class="btn-ver" style="display:inline-block;margin-top:.5rem" href="${linkVisto}" target="_blank" rel="noopener">Requisitos de entrada e vistos ↗</a>
    <a class="btn-ver" style="display:inline-block;margin:.5rem 0 0 .4rem;background:var(--verde)" href="${ligacaoParceiro('getyourguide', {destino:d})}" target="_blank" rel="noopener">Actividades e excursões ↗</a>
    <p class="bloco-sub" style="margin:.5rem 0 0">Vistos e documentos: consulte sempre fontes oficiais para a sua nacionalidade.</p>
  </div>`;
}
