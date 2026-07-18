/* ═══════════════════════════════════════════════════════════════
   TripNexus — motor de estimativas e comparação
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

/* preço rápido para o calendário: melhor cotação (por adulto) */
function precoCalendario(origem, destino, ida, nDias, classe, sohIda){
  let volta = null;
  if(!sohIda){ volta = new Date(ida); volta.setDate(volta.getDate() + nDias); }
  const pax1 = {adultos:1, criancas:0, bebes:0};
  let melhor = Infinity;
  for(const c of ['skyscanner','momondo','edreams']){
    const q = cotacaoVoo(c, origem, destino, ida, volta, classe, pax1);
    if(q.precoFinal < melhor) melhor = q.precoFinal;
  }
  return Math.round(melhor);
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
  const mapaTipo = {hotel:['booking','trivago','agoda','expedia','googleHoteis','kayak','trip','logitravel'],
                    casa:['airbnb','vrbo'], hostel:['hostelworld']};
  const resultado = [];
  for(const tipo of tipos){
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

/* ── carro alugado ────────────────────────────────────────────── */
function cotacoesCarro(cidade, ida, volta){
  const dias = Math.max(1, Math.round((volta - ida) / 86400000));
  return ['discovercars','rentalcars','autoeurope'].map(chave => {
    const p = PARCEIROS[chave];
    const r = semente('carro|' + chave + cidade.i + chaveData(ida));
    const dia = (24 + r() * 34) * (cidade.c * 0.6 + 0.4) * p.fx * (0.8 + factorEpoca(ida) * 0.35);
    const total = dia * dias;
    const cupao = procurarCupao(chave, 'carro' + cidade.i + chaveData(ida), total);
    const carros = ['Fiat 500 ou similar','VW Polo ou similar','Renault Clio ou similar','Opel Corsa ou similar'];
    return {parceiro:chave, dias, preco:arred(total), cupao, precoFinal:arred(cupao ? cupao.depois : total),
            descricao: carros[Math.floor(r()*carros.length)] + ' · seguro básico', porDia:arred(dia)};
  }).sort((a,b) => a.precoFinal - b.precoFinal);
}

/* ── comboio / autocarro (alternativa terrestre) ──────────────── */
function cotacoesTerrestres(origem, destino, ida, pax, meios){
  const km = distanciaKm(origem, destino);
  if(km > 1500) return {viavel:false, km:Math.round(km)};
  const linhas = [];
  const mult = multPax(pax);
  if(meios.includes('comboio')){
    for(const chave of ['omio','trainline','trip']){
      const r = semente('comboio|' + chave + origem.i + destino.i + chaveData(ida));
      const preco = Math.max(9, km * 0.105 * PARCEIROS[chave].fx * (0.85 + r() * 0.3)) * mult;
      const cupao = procurarCupao(chave, 'comboio' + origem.i + destino.i, preco);
      linhas.push({parceiro:chave, meio:'Comboio', preco:arred(preco), cupao,
                   precoFinal:arred(cupao ? cupao.depois : preco),
                   duracao: Math.round(km/95*10)/10 + ' h'});
    }
  }
  if(meios.includes('autocarro')){
    for(const chave of ['flixbus','omio','trainline']){
      const r = semente('bus|' + chave + origem.i + destino.i + chaveData(ida));
      const preco = Math.max(5, km * 0.055 * PARCEIROS[chave].fx * (0.85 + r() * 0.3)) * mult;
      const cupao = procurarCupao(chave, 'bus' + origem.i + destino.i, preco);
      linhas.push({parceiro:chave, meio:'Autocarro', preco:arred(preco), cupao,
                   precoFinal:arred(cupao ? cupao.depois : preco),
                   duracao: Math.round(km/68*10)/10 + ' h'});
    }
  }
  linhas.sort((a,b) => a.precoFinal - b.precoFinal);
  return {viavel:true, km:Math.round(km), linhas};
}

/* ── transportes públicos no destino ──────────────────────────── */
function estimativaTransportesPublicos(cidade, dias, pax){
  const r = semente('tp|' + cidade.i);
  const passeDia = (3.6 + r() * 4.5) * cidade.c;
  const pessoas = pax.adultos + pax.criancas;
  return {porDia:arred(passeDia), total:arred(passeDia * dias * pessoas), pessoas, dias};
}

/* ── actividades ──────────────────────────────────────────────── */
const NOMES_ACT = [
  'Visita guiada ao centro histórico','Excursão de dia inteiro aos arredores',
  'Bilhete sem filas para a atracção principal','Passeio gastronómico com provas',
  'Cruzeiro panorâmico ao pôr-do-sol','Espectáculo tradicional com jantar'
];
function cotacoesActividades(cidade, pax){
  const pessoas = pax.adultos + pax.criancas;
  return ['civitatis','getyourguide','viator'].map((chave, idx) => {
    const r = semente('act|' + chave + cidade.i);
    const preco = (17 + r() * 46) * (cidade.c * 0.5 + 0.5) * PARCEIROS[chave].fx * pessoas;
    const cupao = procurarCupao(chave, 'act' + cidade.i, preco);
    return {parceiro:chave, preco:arred(preco), cupao, precoFinal:arred(cupao ? cupao.depois : preco),
            descricao: NOMES_ACT[Math.floor(r() * NOMES_ACT.length)], pessoas};
  }).sort((a,b) => a.precoFinal - b.precoFinal);
}

/* ── pacotes (voo + hotel, opcionalmente + carro) ─────────────── */
function cotacoesPacote(origem, destino, ida, volta, classe, pax, somaSeparado, incluiCarro){
  return ['edreams','expedia','logitravel'].map(chave => {
    const r = semente('pacote|' + chave + origem.i + destino.i + chaveData(ida));
    const factor = 0.86 + r() * 0.20;                    // 0.86 – 1.06 do preço em separado
    const preco = somaSeparado * factor * PARCEIROS[chave].fx;
    const cupao = procurarCupao(chave, 'pacote' + origem.i + destino.i, preco);
    return {parceiro:chave, preco:arred(preco), cupao, precoFinal:arred(cupao ? cupao.depois : preco),
            inclui:'Voo ' + NOME_CLASSE[classe].toLowerCase() + ' + alojamento' + (incluiCarro ? ' + carro' : '')};
  }).sort((a,b) => a.precoFinal - b.precoFinal);
}

/* ── ofertas em conta (comparação com datas anteriores) ───────── */
function calcularOfertas(origemNome){
  const origem = cidadePorNome(origemNome) || CIDADES[0];
  const hoje = new Date(); hoje.setHours(0,0,0,0);
  const pax1 = {adultos:1, criancas:0, bebes:0};
  return DESTINOS_OFERTAS
    .filter(n => n !== origem.n)
    .map((nome, idx) => {
      const destino = cidadePorNome(nome);
      const r = semente('oferta|' + origem.i + destino.i);
      const ida = new Date(hoje); ida.setDate(ida.getDate() + 20 + Math.floor(r() * 40));
      const volta = new Date(ida); volta.setDate(volta.getDate() + 5 + Math.floor(r() * 5));
      const agora = precoCalendario(origem, destino, ida, Math.round((volta - ida)/86400000), 'economica', false);
      const tipico = Math.round(agora * (1.28 + r() * 0.45));
      return {destino, ida, volta, agora, tipico,
              queda: Math.round((1 - agora / tipico) * 100),
              gradiente: GRADIENTES[idx % GRADIENTES.length]};
    })
    .sort((a,b) => b.queda - a.queda);
}

/* arredondamento a euros inteiros — mantém os totais coerentes com as parcelas */
function arred(v){ return Math.round(v); }
function euros(v){
  return v.toLocaleString('pt-PT', {minimumFractionDigits:0, maximumFractionDigits:0}) + ' €';
}
