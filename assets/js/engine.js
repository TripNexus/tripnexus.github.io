/* ═══════════════════════════════════════════════════════════════
   TripNexus: motor de estimativas e comparação
   Os preços são calculados de forma determinística (a mesma rota
   nas mesmas datas dá sempre o mesmo valor) a partir da distância,
   época do ano, dia da semana e perfil de cada parceiro.
   ═══════════════════════════════════════════════════════════════ */

/* gerador pseudo-aleatório determinístico a partir de uma chave */
function semente(chave){
  let h = 2166136261;
  for(let i = 0; i < chave.length; i++){
    h ^= chave.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function(){
    h |= 0; h = (h + 0x6D2B79F5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function distanciaKm(a, b){
  const R = 6371, rad = Math.PI / 180;
  const dLa = (b.la - a.la) * rad, dLo = (b.lo - a.lo) * rad;
  const s = Math.sin(dLa/2)**2 + Math.cos(a.la*rad) * Math.cos(b.la*rad) * Math.sin(dLo/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const MULT_CLASSE = {economica:1, premium:1.55, executiva:2.6, primeira:3.8};
const NOME_CLASSE = {economica:'Económica', premium:'Económica premium', executiva:'Executiva', primeira:'Primeira classe'};

function factorEpoca(data){
  const m = data.getMonth();                 // 0 = Janeiro
  return [0.85,0.82,0.9,1.0,1.05,1.12,1.25,1.28,1.05,0.95,0.85,1.15][m];
}
function factorDiaSemana(data){
  const d = data.getDay();                   // 0 = Domingo
  return [1.12,0.98,0.92,0.92,1.0,1.12,1.05][d];
}
function chaveData(d){
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
}

/* preço base de um voo só de ida, por adulto, em económica */
function precoBaseVoo(origem, destino, data){
  const km = Math.max(120, distanciaKm(origem, destino));
  let base = 26 + km * 0.072;
  if(km > 3000) base = 26 + 3000*0.072 + (km - 3000) * 0.052;   // longo curso: €/km mais baixo
  base *= factorEpoca(data) * factorDiaSemana(data);
  const r = semente('dia|' + origem.i + destino.i + chaveData(data));
  base *= 0.86 + r() * 0.30;                 // variação diária ±15 %
  return Math.max(34, base);
}

/* multiplicador do grupo de passageiros (crianças 75 %, bebés 10 %) */
function multPax(pax){
  return pax.adultos + pax.criancas * 0.75 + pax.bebes * 0.10;
}

/* ── voos ─────────────────────────────────────────────────────── */
function cotacaoVoo(chaveParceiro, origem, destino, ida, volta, classe, pax){
  const p = PARCEIROS[chaveParceiro];
  const r = semente('voo|' + chaveParceiro + origem.i + destino.i + chaveData(ida) + (volta ? chaveData(volta) : ''));
  let preco = precoBaseVoo(origem, destino, ida);
  if(volta) preco += precoBaseVoo(destino, origem, volta) * 0.92;   // desconto de ida e volta
  preco *= MULT_CLASSE[classe] * p.fx * (0.95 + r() * 0.14);
  preco *= multPax(pax);

  const km = distanciaKm(origem, destino);
  const durMin = Math.round((km / 760) * 60 + 40 + r() * 50);
  const escalas = km > 2600 ? (r() > 0.45 ? 1 : 0) + (km > 7000 && r() > 0.5 ? 1 : 0) : (r() > 0.8 ? 1 : 0);
  const hPart = 6 + Math.floor(r() * 16);
  const mPart = [0,5,10,15,20,25,30,35,40,45,50,55][Math.floor(r()*12)];
  const companhia = COMPANHIAS[Math.floor(r() * (km > 4500 ? COMPANHIAS.length : 10))];

  const cupao = procurarCupao(chaveParceiro, 'voo' + origem.i + destino.i + chaveData(ida), preco);
  return {
    parceiro: chaveParceiro, preco: arred(preco), cupao,
    precoFinal: arred(cupao ? cupao.depois : preco),
    companhia, escalas,
    duracao: Math.floor(durMin/60) + 'h' + String(durMin%60).padStart(2,'0'),
    partida: String(hPart).padStart(2,'0') + ':' + String(mPart).padStart(2,'0')
  };
}

/* ── cupões ───────────────────────────────────────────────────── */
function procurarCupao(chaveParceiro, contexto, preco){
  const p = PARCEIROS[chaveParceiro];
  if(!p.cup || !p.cup.length) return null;
  const r = semente('cupao|' + chaveParceiro + contexto);
  if(r() > 0.55) return null;                      // o cupão nem sempre está activo
  const c = p.cup[Math.floor(r() * p.cup.length)];
  const desconto = c.tipo === 'pct' ? preco * c.valor / 100 : Math.min(c.valor, preco * 0.4);
  if(desconto < 2) return null;
  return {codigo:c.codigo, nota:c.nota, desconto:arred(desconto), depois:preco - desconto,
          texto: c.tipo === 'pct' ? '−' + c.valor + ' %' : '−' + c.valor + ' €'};
}

/* ── alojamento ───────────────────────────────────────────────── */
function precoNoiteBase(cidade, tipo){
  const r = semente('noite|' + tipo + cidade.i);
  if(tipo === 'hostel') return (16 + r() * 18) * cidade.c;
  if(tipo === 'casa')   return (52 + r() * 65) * cidade.c;       // Airbnb / Vrbo
  return (62 + r() * 85) * cidade.c;                             // hotel
}

const NOMES_ALOJ = {
  hotel:  ['Hotel central 4★','Hotel boutique 3★','Aparthotel com pequeno-almoço'],
  casa:   ['Apartamento T1 no centro','Casa completa c/ cozinha','Estúdio junto ao metro'],
  hostel: ['Quarto partilhado 6 camas','Quarto privado em hostel','Hostel premiado no centro']
};

function cotacoesAlojamento(cidade, ida, volta, pax, tipos){
  const noites = Math.max(1, Math.round((volta - ida) / 86400000));
  const quartos = Math.max(1, Math.ceil((pax.adultos + pax.criancas) / 2));
  const mapaTipo = {hotel:parceirosDe('hotel'), casa:parceirosDe('casa'), hostel:parceirosDe('hostel')};
  /* A pesquisa passou a ter categorias finas (apart-hotel, pensão, resort,
     turismo rural, campismo) que só os preços reais sabem distinguir. O motor
     local só conhece três famílias de parceiros, por isso as categorias novas
     entram aqui como hotel, em vez de darem um tipo desconhecido e partirem
     a estimativa. */
  const resultado = [];
  for(const tipo of [...new Set((tipos || []).map(t => mapaTipo[t] ? t : 'hotel'))]){
    for(const chave of mapaTipo[tipo]){
      const p = PARCEIROS[chave];
      const r = semente('aloj|' + chave + cidade.i + chaveData(ida));
      const factorEp = 0.75 + factorEpoca(ida) * 0.35;
      let noite = precoNoiteBase(cidade, tipo) * p.fx * (0.92 + r() * 0.2) * factorEp;
      const mult = tipo === 'hostel' ? (pax.adultos + pax.criancas) : quartos;
      let total = noite * noites * mult;
      const cupao = procurarCupao(chave, 'aloj' + cidade.i + chaveData(ida), total);
      resultado.push({
        parceiro: chave, tipo, noites, quartos: mult, preco: arred(total), cupao,
        precoFinal: arred(cupao ? cupao.depois : total),
        descricao: NOMES_ALOJ[tipo][Math.floor(r() * NOMES_ALOJ[tipo].length)],
        porNoite: arred(noite)
      });
    }
  }
  resultado.sort((a,b) => a.precoFinal - b.precoFinal);
  return resultado;
}

/* ── comboio / autocarro (ir por terra em vez de voar) ─────────
   ESTES PREÇOS ERAM INVENTADOS, e este era o último sítio do site onde
   ainda o eram. Saíam de uma fórmula por quilómetro (0,105 €/km no
   comboio, 0,055 €/km no autocarro) com ruído pseudo-aleatório por cima,
   e apareciam ao lado dos voos, que são reais. Não vinham de lado nenhum:
   nem de tarifários, nem de médias, nem de histórico. Um comparador que
   inventa o preço da alternativa está a decidir pelo utilizador.

   Não há hoje fonte gratuita de tarifas reais de comboio e autocarro que
   possamos consultar: a Travelpayouts dá voos (Aviasales) e hotéis, a
   Booking não vende comboios pela API que usamos, e a SerpApi não tem
   motor de comboios. A Omio, a Trainline, a FlixBus e a Busbud têm API de
   parceiro, mas exigem contrato aprovado (ver backend/README.md).

   Até haver essa fonte, o bloco mostra só o que sabemos mesmo: a
   distância, calculada das coordenadas reais das duas cidades, e quem
   vende o bilhete, com a ligação já apontada à rota certa. Preço nenhum.
   Quando houver fonte, entra aqui em «ofertas», como nos voos. */
function rotaTerrestre(origem, destino, meios){
  const km = Math.round(distanciaKm(origem, destino));
  /* um parceiro que venda comboio e autocarro aparece uma vez só, com os
     dois modos, em vez de duas linhas iguais com botões iguais */
  const porParceiro = new Map();
  const juntar = (cat, meio) => {
    for(const chave of parceirosDe(cat)){
      if(!porParceiro.has(chave)) porParceiro.set(chave, {parceiro:chave, meios:[]});
      porParceiro.get(chave).meios.push(meio);
    }
  };
  if(meios.includes('comboio')) juntar('comboio', 'Comboio');
  if(meios.includes('autocarro')) juntar('autocarro', 'Autocarro');
  /* à frente quem abre já na rota pedida: é o que poupa cliques a quem lê */
  const operadores = [...porParceiro.values()]
    .sort((a, b) => (ROTA_DIRECTA.has(b.parceiro) ? 1 : 0) - (ROTA_DIRECTA.has(a.parceiro) ? 1 : 0));
  return {viavel: km <= 1500, km, operadores};
}

/* ── transportes públicos no destino ──────────────────────────── */
/* Quantos dias cobre cada tipo de bilhete. Os bilhetes de viagem avulsa
   ficam de fora de propósito: não sabemos quantas viagens se fazem por dia,
   e chutar um número seria voltar a inventar. */
const DIAS_COBERTOS = {
  'dia':1, '24 h':1, '48 h':2, '72 h':3, '3 dias':3, '5 dias':5,
  '7 dias':7, 'semana':7
};

/* Custo REAL dos transportes na cidade, quando temos o tarifário publicado
   (ver TRANSPORTES_DESTINO). Escolhe a combinação mais barata de passes que
   cobre a estadia: em Paris, para 8 dias, um Navigo Semaine mais um dia
   avulso sai muito abaixo de oito passes diários, e é essa a conta que o
   viajante faria.

   Só serve cidades com tarifário em euros: misturar coroas ou ienes no total
   da viagem daria um número sem sentido. */
function custoTransportesReais(cidade, dias, pax){
  const t = (typeof transportesDe === 'function') ? transportesDe(cidade) : null;
  if(!t || (t.moeda && t.moeda !== 'EUR')) return null;
  const opcoes = t.bilhetes
    .map(b => ({b, cobre: DIAS_COBERTOS[String(b.unidade || '').toLowerCase()]}))
    .filter(o => o.cobre);
  if(!opcoes.length) return null;

  /* Combinação mais barata, e não N cópias do mesmo bilhete: em Paris, para
     oito dias, dois passes semanais custam 63,20 € e um semanal mais um
     diário custam 43,60 €. É a segunda conta que o viajante faz, por isso é
     a que temos de fazer também. Programação dinâmica sobre os dias. */
  const custo = [0];
  const veio = [null];
  for(let d = 1; d <= dias; d++){
    custo[d] = Infinity;
    for(const o of opcoes){
      const antes = Math.max(0, d - o.cobre);
      const c = custo[antes] + o.b.preco;
      if(c < custo[d]){ custo[d] = c; veio[d] = {antes, opcao: o}; }
    }
  }
  if(!isFinite(custo[dias])) return null;

  /* reconstrói a combinação para a poder nomear */
  const contagem = new Map();
  for(let d = dias; d > 0; ){
    const passo = veio[d];
    const nome = passo.opcao.b.nome;
    contagem.set(nome, (contagem.get(nome) || 0) + 1);
    d = passo.antes;
  }
  const pessoas = pax.adultos + pax.criancas;
  const partes = [...contagem.entries()].map(([nome, n]) => (n > 1 ? n + '× ' : '') + nome);
  return {
    total: Math.round(custo[dias] * pessoas * 100) / 100,
    porDia: custo[dias] / dias, pessoas, dias, real: true,
    nome: partes.join(' + ') + ' · ' + dias + (dias === 1 ? ' dia' : ' dias')
          + (pessoas > 1 ? ' × ' + pessoas + ' pessoas' : '')
  };
}

/* Recurso para as cidades sem tarifário na tabela: é uma estimativa, sai de
   um gerador com semente, e é mostrada com «≈» como todas as estimativas. */
function estimativaTransportesPublicos(cidade, dias, pax){
  const real = custoTransportesReais(cidade, dias, pax);
  if(real) return real;
  const r = semente('tp|' + cidade.i);
  const passeDia = (3.6 + r() * 4.5) * cidade.c;
  const pessoas = pax.adultos + pax.criancas;
  return {porDia:arred(passeDia), total:arred(passeDia * dias * pessoas), pessoas, dias, real:false};
}

/* ── perfis de transporte no destino ──────────────────────────
   Uma lista de bilhetes não é uma decisão. O que uma pessoa quer saber é
   «qual destes é o meu», e isso depende de quanto tenciona andar. Montam-se
   três respostas a partir das mesmas tarifas publicadas:

     económico: bilhetes avulso, para quem anda pouco. O total depende do
                número de viagens, que não sabemos, por isso é o único que
                leva um pressuposto declarado: duas viagens por dia.
     habitual:  o passe mais barato que cobre metro e autocarro durante a
                estadia. É o que a maioria dos visitantes usa.
     completo:  o mesmo, mas exigindo também comboio ou aeroporto, para
                quem quer as deslocações todas cobertas.

   Cada perfil traz a combinação exacta de títulos, e não uma média: em
   Paris, oito dias saem mais baratos com um passe semanal mais um diário do
   que com dois semanais. O mais barato dos três fica marcado. */
function combinacaoMaisBarata(bilhetes, dias){
  const opcoes = bilhetes
    .map(b => ({b, cobre: DIAS_COBERTOS[String(b.unidade || '').toLowerCase()]}))
    .filter(o => o.cobre);
  if(!opcoes.length) return null;
  const custo = [0], veio = [null];
  for(let d = 1; d <= dias; d++){
    custo[d] = Infinity;
    for(const o of opcoes){
      const antes = Math.max(0, d - o.cobre);
      const c = custo[antes] + o.b.preco;
      if(c < custo[d]){ custo[d] = c; veio[d] = {antes, opcao:o}; }
    }
  }
  if(!isFinite(custo[dias])) return null;
  const contagem = new Map();
  for(let d = dias; d > 0; ){
    const passo = veio[d];
    contagem.set(passo.opcao.b, (contagem.get(passo.opcao.b) || 0) + 1);
    d = passo.antes;
  }
  return {total: custo[dias], titulos: [...contagem.entries()].map(([b, n]) => ({bilhete:b, n}))};
}

/* união dos modos cobertos por uma combinação de títulos */
function modosDaCombinacao(c){
  const s = new Set();
  for(const t of c.titulos) for(const m of (t.bilhete.modos || [])) s.add(m);
  return [...s];
}

const VIAGENS_POR_DIA = 2;   /* pressuposto do perfil económico, declarado no ecrã */

function perfisTransporte(cidade, dias, pax){
  const t = (typeof transportesDe === 'function') ? transportesDe(cidade) : null;
  if(!t) return null;
  const pessoas = Math.max(1, pax.adultos + pax.criancas);
  const temModo = (b, ms) => ms.some(m => (b.modos || []).includes(m));
  const perfis = [];

  /* económico: bilhetes avulso de transporte urbano */
  const avulso = t.bilhetes.filter(b => String(b.unidade).includes('viagem')
    && temModo(b, ['metro','autocarro','eletrico']));
  if(avulso.length){
    const barato = avulso.reduce((m, b) => b.preco < m.preco ? b : m);
    perfis.push({
      chave:'economico', rotulo:'Económico',
      descricao:'Bilhetes avulso, para quem anda pouco.',
      total: barato.preco * VIAGENS_POR_DIA * dias * pessoas,
      titulos:[{bilhete:barato, n: VIAGENS_POR_DIA * dias}],
      modos: barato.modos || [],
      pressuposto: VIAGENS_POR_DIA + ' viagens por dia'
    });
  }

  /* habitual: passe que cubra metro e autocarro */
  const urbanos = t.bilhetes.filter(b => temModo(b, ['metro','autocarro','eletrico']));
  const cHabitual = combinacaoMaisBarata(urbanos, dias);
  if(cHabitual) perfis.push({
    chave:'habitual', rotulo:'Habitual',
    descricao:'Passe para os transportes que se usam dentro da cidade.',
    total: cHabitual.total * pessoas, titulos: cHabitual.titulos,
    modos: modosDaCombinacao(cHabitual)
  });

  /* completo: exige também comboio ou aeroporto */
  /* só comboio e aeroporto: o barco e os elevadores costumam já vir no passe
     urbano, e exigi-los fazia o perfil «completo» repetir o «habitual» */
  const completos = t.bilhetes.filter(b => temModo(b, ['comboio','aeroporto']));
  const cCompleto = combinacaoMaisBarata(completos, dias);
  if(cCompleto && (!cHabitual || cCompleto.total !== cHabitual.total ||
      modosDaCombinacao(cCompleto).length > modosDaCombinacao(cHabitual).length))
    perfis.push({
      chave:'completo', rotulo:'Completo',
      descricao:'Cobre também o comboio ou o aeroporto, conforme a cidade.',
      total: cCompleto.total * pessoas, titulos: cCompleto.titulos,
      modos: modosDaCombinacao(cCompleto)
    });

  if(!perfis.length) return null;
  for(const p of perfis) p.total = Math.round(p.total * 100) / 100;
  /* o mais barato fica assinalado, mas não é sempre o melhor: um passe que
     cobre o aeroporto pode compensar mesmo custando mais */
  const min = Math.min(...perfis.map(p => p.total));
  for(const p of perfis) p.maisBarato = p.total === min;
  return {perfis, moeda: t.moeda || 'EUR', operador: t.operador, url: t.url,
          ano: t.ano, nota: t.nota, cartao: t.cartao, dias, pessoas};
}

/* ── pacotes (voo + hotel, opcionalmente + carro) ─────────────── */
function cotacoesPacote(origem, destino, ida, volta, classe, pax, somaSeparado, incluiCarro){
  return parceirosDe('pacote').map(chave => {
    const r = semente('pacote|' + chave + origem.i + destino.i + chaveData(ida));
    const factor = 0.86 + r() * 0.20;                    // 0.86 a 1.06 do preço em separado
    const preco = somaSeparado * factor * PARCEIROS[chave].fx;
    const cupao = procurarCupao(chave, 'pacote' + origem.i + destino.i, preco);
    return {parceiro:chave, preco:arred(preco), cupao, precoFinal:arred(cupao ? cupao.depois : preco),
            inclui:'Voo ' + NOME_CLASSE[classe].toLowerCase() + ' + alojamento' + (incluiCarro ? ' + carro' : '')};
  }).sort((a,b) => a.precoFinal - b.precoFinal);
}

/* ── ofertas em conta ─────────────────────────────────────────
   Esta página mostrava descontos inventados: o preço «agora», o preço
   «típico» e a percentagem de queda saíam todos do gerador pseudo-aleatório.
   Era o último sítio do site com números que não existem.

   Passa a pedir ao backend, que devolve para cada destino o dia mais barato
   do mês e a mediana dos preços diários da mesma rota. O «típico» deixa de
   ser um número tirado do ar e passa a ser uma estatística das tarifas
   observadas. Um destino sem tarifas registadas não aparece: melhor menos
   cartões do que cartões inventados. */
async function calcularOfertas(origemNome){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const origem = cidadePorNome(origemNome) || CIDADES[0];
  if(!base) return {estado:'sem-backend', origem, lista:[]};
  const destinos = DESTINOS_OFERTAS.filter(n => n !== origem.n)
    .map(n => cidadePorNome(n)).filter(Boolean);
  const mes = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 7);
  try{
    const ps = new URLSearchParams({origem: origem.i,
      destinos: destinos.map(d => d.i).join(','), mes, dias: '7'});
    const r = await fetch(base + '/ofertas?' + ps);
    if(!r.ok) return {estado:'falhou', origem, lista:[]};
    const d = await r.json();
    const porCodigo = {};
    for(const c of destinos) porCodigo[c.i] = c;
    const lista = ((d && d.ofertas) || []).map((o, idx) => ({
      destino: porCodigo[o.destino],
      agora: o.agora, tipico: o.tipico, queda: o.queda,
      ida: o.ida ? new Date(o.ida + 'T12:00:00') : null,
      volta: o.volta ? new Date(o.volta + 'T12:00:00') : null,
      diasComTarifa: o.diasComTarifa,
      gradiente: GRADIENTES[idx % GRADIENTES.length]
    })).filter(o => o.destino && o.ida);
    return {estado: lista.length ? 'pronto' : 'sem-tarifas', origem, lista, base: d && d.base};
  }catch(e){ return {estado:'falhou', origem, lista:[]}; }
}

/* arredondamento a euros inteiros: mantém os totais coerentes com as parcelas */
/* ── evolução do preço (últimas 8 semanas) ────────────────────
   Série estimada de observações diárias do preço do voo, ancorada
   no preço actual para ser coerente com o que está no ecrã: os
   preços tendem a subir nos ~45 dias antes da partida, com ruído
   determinístico por rota e dia. */
function serieHistoricaVoo(origem, destino, ida, precoHoje){
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const dppHoje = Math.max(1, Math.round((ida - hoje) / 86400000));
  const tendencia = dpp => 1 + Math.max(0, 45 - dpp) * 0.005;
  const bruto = [];
  for(let i = 56; i >= 0; i--){
    const r = semente('hist|' + origem.i + destino.i + chaveData(ida) + '|' + i);
    bruto.push(tendencia(dppHoje + i) * (0.95 + r() * 0.10));
  }
  const escala = precoHoje / bruto[bruto.length - 1];
  const pontos = bruto.map(v => Math.round(v * escala));
  const ordenados = [...pontos].sort((a, b) => a - b);
  const tipico = ordenados[Math.floor(ordenados.length / 2)];
  const dif = Math.round((precoHoje / tipico - 1) * 100);
  const tipo = dif <= -8 ? 'bom' : (dif >= 8 ? 'alto' : 'neutro');
  return {pontos, tipico, dif, tipo};
}

/* ── extras: bagagem e seguro (somam ao total) ────────────────
   Valores de referência por passageiro (adultos + crianças). */
function custoExtras(extras, pax, temVolta, dias){
  const p = pax.adultos + pax.criancas;
  const legs = temVolta ? 2 : 1;
  const linhas = [];
  if(extras.includes('porao'))
    linhas.push({chave:'porao', nome:'🧳 Mala de porão (23 kg)', total: arred(42 * p * legs),
                 detalhe:`${p} ${p === 1 ? 'passageiro' : 'passageiros'} × ${legs} ${legs === 1 ? 'voo' : 'voos'}`});
  if(extras.includes('cabina'))
    linhas.push({chave:'cabina', nome:'🎒 Bagagem de cabina extra', total: arred(26 * p * legs),
                 detalhe:`${p} ${p === 1 ? 'passageiro' : 'passageiros'} × ${legs} ${legs === 1 ? 'voo' : 'voos'}`});
  if(extras.includes('seguro'))
    linhas.push({chave:'seguro', nome:'🛡 Seguro de viagem', total: arred((9 + 4.2 * dias) * p),
                 detalhe:`${p} ${p === 1 ? 'pessoa' : 'pessoas'} × ${dias} ${dias === 1 ? 'dia' : 'dias'}`});
  return linhas;
}

function arred(v){ return Math.round(v); }
function euros(v){
  const m = MOEDAS[MOEDA] || MOEDAS.EUR;
  const n = Math.round(v * (TAXAS[MOEDA] || 1)).toLocaleString('pt-PT', {maximumFractionDigits:0});
  return m.ap ? m.s + ' ' + n : n + ' ' + m.s;
}
/* O mesmo, mas com os cêntimos. Nos voos e no alojamento o euro inteiro
   chega; num bilhete de metro de 2,50 € arredondar para 3 € é mostrar outro
   preço, e é o preço exacto que está no tarifário do operador. */
function eurosExactos(v){
  const m = MOEDAS[MOEDA] || MOEDAS.EUR;
  const c = v * (TAXAS[MOEDA] || 1);
  const n = c.toLocaleString('pt-PT', {minimumFractionDigits: Number.isInteger(c) ? 0 : 2,
                                       maximumFractionDigits: 2});
  return m.ap ? m.s + ' ' + n : n + ' ' + m.s;
}
const MOEDAS = {EUR:{s:'€',ap:false}, USD:{s:'$',ap:true}, GBP:{s:'£',ap:true}, BRL:{s:'R$',ap:true}};
let MOEDA = 'EUR';
let TAXAS = {EUR:1, USD:1.08, GBP:0.85, BRL:6.2};   // recurso; substituído por taxas ao vivo

/* clima típico estimado (máximas médias por mês) a partir da latitude */
const MESES_INI = ['J','F','M','A','M','J','J','A','S','O','N','D'];
function climaEstimado(cidade){
  const absLat = Math.abs(cidade.la), sul = cidade.la < 0;
  const base = 27 - absLat * 0.42, amp = 3 + absLat * 0.32, t = [];
  for(let m = 0; m < 12; m++){
    const faseN = Math.cos((m - 6.5) / 12 * 2 * Math.PI);
    t.push(Math.round(base + amp * (sul ? -faseN : faseN)));
  }
  return t;
}
