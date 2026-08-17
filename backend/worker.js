/* ═══════════════════════════════════════════════════════════════
   TripNexus: backend de preços em tempo real (Cloudflare Worker)
   Intermediário seguro entre o site e a API Travelpayouts/Aviasales
   (voos): guarda o token no servidor, faz cache das respostas e
   devolve JSON simples que o site consome (assets/js/live.js).
   Hotéis via SerpApi (motor google_hotels), com chave gratuita e um limite
   mensal de pesquisas (ver /estado); esgotado o limite, ou sem chave, o site
   cai nas estimativas locais, sem erro visível.
   Nota: a Amadeus descontinuou o portal Self-Service a 17/07/2026,
   pelo que este Worker usa a Travelpayouts, de registo gratuito.
   Instruções de instalação: backend/README.md
   ═══════════════════════════════════════════════════════════════ */

const TP = 'https://api.travelpayouts.com';
/* Actualize sempre que mexer neste ficheiro: /estado devolve este valor e é
   assim que se percebe, de fora, se o Worker publicado é o do repositório. */
const VERSAO_WORKER = 'v53';

function resposta(corpo, estado, semCache){
  return new Response(JSON.stringify(corpo), {
    status: estado || 200,
    headers:{
      'Content-Type':'application/json; charset=utf-8',
      'Access-Control-Allow-Origin':'*',
      'Cache-Control': semCache ? 'no-store' : 'public, max-age=600'
    }
  });
}

/* token limpo de espaços e quebras de linha acidentais */
function obterToken(env){
  return (env.TP_TOKEN || '').trim();
}

/* /estado: diagnóstico rápido, sem expor o token */
async function estado(env){
  const token = obterToken(env);
  const chaveSerp = (env.SERPAPI_KEY || '').trim();
  const info = {
    /* muda a cada alteração do Worker: se este número não bater certo com o
       do repositório, o que está publicado está desactualizado */
    versao: VERSAO_WORKER,
    token_definido: token.length > 0,
    token_tamanho: token.length,
    serpapi_key_definida: chaveSerp.length > 0,
    rapidapi_key_definida: ((env.RAPIDAPI_KEY || '').trim().length > 0),
    workers_ai_ligado: !!env.AI
  };
  /* pesquisas que restam no plano gratuito da SerpApi: é a causa mais
     provável de o alojamento voltar às estimativas sem erro visível */
  if(chaveSerp){
    try{
      const c = await fetch('https://serpapi.com/account?api_key=' + encodeURIComponent(chaveSerp));
      if(c.ok){
        const j = await c.json();
        info.serpapi_pesquisas_restantes = j.total_searches_left ?? j.plan_searches_left ?? null;
        info.serpapi_usadas_este_mes = j.this_month_usage ?? null;
        if(info.serpapi_pesquisas_restantes === 0)
          info.sugestao_alojamento = 'A quota gratuita da SerpApi esgotou-se este mês: o alojamento volta às estimativas até renovar.';
      }else{
        info.serpapi_estado = c.status;
        info.sugestao_alojamento = 'A SerpApi não aceitou a chave (' + c.status + '): confirme SERPAPI_KEY com wrangler secret put SERPAPI_KEY.';
      }
    }catch(e){ info.serpapi_erro = String(e.message || e); }
  }else{
    info.sugestao_alojamento = 'Sem SERPAPI_KEY não há preços reais de alojamento: corra wrangler secret put SERPAPI_KEY na pasta backend/ e cole a chave de serpapi.com.';
  }
  if(!info.rapidapi_key_definida){
    info.sugestao_carros = 'Sem RAPIDAPI_KEY não há preços reais de aluguer nem de actividades: corra wrangler secret put RAPIDAPI_KEY na pasta backend/.';
  }else{
    /* o mais barato que há para ler os cabeçalhos de quota */
    const r = await rapid(CAMINHO_CARROS_DESTINO, {term:'Lisbon', countryOfResidence:'pt'}, env);
    info.rapidapi_quota = r._quota || (r._estado === 429 ? '0 (esgotada)' : 'desconhecida');
    if(r._estado === 429)
      info.sugestao_carros = 'A quota do RapidAPI esgotou-se: o aluguer e as actividades ficam sem preço até renovar. Ver backend/README.md sobre a Booking.com Demand API, que não tem limite de pedidos.';
  }
  if(token){
    const r = await fetch(TP + '/v1/prices/cheap?origin=LIS&destination=BCN&currency=eur&token=' + token,
      {headers:{'X-Access-Token': token}});
    info.travelpayouts_estado = r.status;
    info.travelpayouts_aceita_o_token = r.ok;
    if(!r.ok) info.sugestao = r.status === 401 || r.status === 403
      ? 'O token não foi aceite: confirme que copiou o API token completo do perfil Travelpayouts e volte a correr wrangler secret put TP_TOKEN.'
      : 'A Travelpayouts devolveu um erro temporário; tente outra vez daqui a um minuto.';
  }else{
    info.sugestao = 'Falta o token: corra wrangler secret put TP_TOKEN na pasta backend/ e cole o API token do perfil Travelpayouts.';
  }
  return resposta(info, 200, true);
}

/* nomes das companhias aéreas (ficheiro público da Travelpayouts, cache 24 h) */
const cacheCompanhias = {valor:null, expira:0};
async function nomesCompanhias(){
  if(cacheCompanhias.valor && Date.now() < cacheCompanhias.expira) return cacheCompanhias.valor;
  try{
    const r = await fetch(TP + '/data/en/airlines.json');
    if(r.ok){
      const mapa = {};
      for(const a of await r.json()) if(a.code && a.name) mapa[a.code] = a.name;
      cacheCompanhias.valor = mapa;
      cacheCompanhias.expira = Date.now() + 86400000;
    }
  }catch(e){ /* fica o mapa anterior, ou vazio */ }
  return cacheCompanhias.valor || {};
}

/* duração em minutos → «2h35» */
function duracaoTexto(min){
  const m = +min;
  if(!isFinite(m) || m <= 0) return '';
  return Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0');
}

/* /voos: tarifas reais registadas pela Aviasales.
   Três tentativas, da mais fiel à mais lata, porque as estimativas são o
   último recurso e não o primeiro:
     1. «prices_for_dates» nas datas exactas pedidas;
     2. o mesmo, mas com o mês inteiro: são tarifas igualmente reais, de
        dias vizinhos, e cada uma vai identificada com a sua data para o
        utilizador não ser induzido em erro;
     3. o antigo «prices/cheap», que só dá a mais barata por número de
        escalas mas ainda apanha rotas que os outros não têm.
   A rota aceita «debug=1», que devolve o que cada tentativa recebeu da
   Travelpayouts (sem o token) em vez das ofertas: sem isso, uma resposta
   de erro com HTTP 200 é indistinguível de «não há tarifas». */
async function voos(url, env){
  const q = url.searchParams;
  for(const p of ['origem','destino','ida'])
    if(!q.get(p)) return resposta({erro:'falta o parâmetro ' + p}, 400);
  const token = obterToken(env);
  if(!token) return resposta({erro:'TP_TOKEN não definido no Worker (ver /estado)'}, 500);
  const nomes = await nomesCompanhias();
  /* total para o grupo: adultos por inteiro, crianças a 75 % */
  const pax = Math.max(1, (+q.get('adultos') || 1) + (+q.get('criancas') || 0) * 0.75);
  const marker = (q.get('marker') || '').replace(/[^\w.]/g, '');
  const debug = q.get('debug') === '1';
  const ligacao = caminho => {
    if(!caminho) return '';
    const u = 'https://www.aviasales.com' + caminho;
    return marker ? u + (u.includes('?') ? '&' : '?') + 'marker=' + marker : u;
  };

  const ida = q.get('ida'), volta = q.get('volta');
  const tentativas = [];
  const registos = [];   /* só para debug=1 */

  /* uma passagem pelo prices_for_dates; «quando» é uma data (AAAA-MM-DD)
     ou um mês (AAAA-MM), que é o que alarga a pesquisa aos dias vizinhos */
  const porDatas = async (quandoIda, quandoVolta, etiqueta) => {
    const ps = new URLSearchParams({
      origin: q.get('origem'),
      destination: q.get('destino'),
      departure_at: quandoIda,
      currency: 'eur',
      sorting: 'price',
      unique: 'false',
      limit: '50',
      one_way: volta ? 'false' : 'true',
      token
    });
    if(quandoVolta) ps.set('return_at', quandoVolta);
    try{
      const r = await fetch(TP + '/aviasales/v3/prices_for_dates?' + ps,
        {headers:{'X-Access-Token': token}, cf:{cacheTtl: 1800, cacheEverything: true}});
      const bruto = await r.text();
      if(debug) registos.push({
        tentativa: etiqueta,
        pedido: TP + '/aviasales/v3/prices_for_dates?' + String(ps).replace(/token=[^&]*/, 'token=OCULTO'),
        estado: r.status,
        resposta: bruto.slice(0, 700)
      });
      if(!r.ok){ tentativas.push(etiqueta + ': HTTP ' + r.status); return []; }
      let j;
      try{ j = JSON.parse(bruto); }catch(e){ tentativas.push(etiqueta + ': resposta ilegível'); return []; }
      /* a API responde 200 com success:false e uma mensagem: sem isto, um
         erro de parâmetros passava por «não há tarifas» */
      if(j && j.success === false){
        tentativas.push(etiqueta + ': ' + String(j.error || 'recusado pela Travelpayouts'));
        return [];
      }
      const dados = Array.isArray(j && j.data) ? j.data : [];
      if(!dados.length){ tentativas.push(etiqueta + ': sem tarifas'); return []; }
      return dados.map(v => ({
        preco: Math.round(v.price * pax),
        companhia: nomes[v.airline] || v.airline || '',
        escalas: +v.transfers || 0,
        duracao: duracaoTexto(v.duration),
        partida: String(v.departure_at || '').slice(11, 16),
        data: String(v.departure_at || '').slice(0, 10),
        /* na pesquisa alargada o regresso também sai da data pedida, e sem
           isto o utilizador via a ida corrigida mas não a volta */
        regresso: String(v.return_at || '').slice(0, 10),
        url: ligacao(v.link)
      })).filter(o => o.preco > 0);
    }catch(e){ tentativas.push(etiqueta + ': ' + String(e.message || e)); return []; }
  };

  /* 1.ª tentativa: as datas exactas que o utilizador pediu */
  let ofertas = await porDatas(ida, volta, 'datas exactas');
  if(ofertas.length && !debug)
    return resposta({ofertas: ofertas.sort((a, b) => a.preco - b.preco).slice(0, 20),
      classe:'economica', fonte:'travelpayouts/prices_for_dates', datas:'exactas'});

  /* 2.ª tentativa: o mês inteiro, ficando com os dias mais próximos do
     pedido. São tarifas reais de outros dias, e vão identificadas como tal:
     mais vale um preço verdadeiro de dia 11 do que um inventado para dia 9. */
  if(!ofertas.length){
    const mes = t => String(t || '').slice(0, 7);
    const doMes = await porDatas(mes(ida), volta ? mes(volta) : '', 'mês inteiro');
    if(doMes.length){
      const alvo = Date.parse(ida);
      const perto = doMes
        .map(o => ({...o, afastamento: Math.abs(Date.parse(o.data) - alvo) / 86400000}))
        .filter(o => isFinite(o.afastamento) && o.afastamento <= 7)
        .sort((a, b) => a.preco - b.preco);
      const lista = (perto.length ? perto : doMes.sort((a, b) => a.preco - b.preco)).slice(0, 20);
      if(lista.length && !debug)
        return resposta({ofertas: lista, classe:'economica',
          fonte:'travelpayouts/prices_for_dates', datas:'proximas'});
      ofertas = lista;
    }
  }

  /* 3.ª tentativa: a tarifa mais barata por número de escalas */
  const ps = new URLSearchParams({
    origin: q.get('origem'),
    destination: q.get('destino'),
    depart_date: ida,
    currency: 'eur',
    token
  });
  if(volta) ps.set('return_date', volta);
  const r = await fetch(TP + '/v1/prices/cheap?' + ps,
    {headers:{'X-Access-Token': token}, cf:{cacheTtl: 1800, cacheEverything: true}});
  const bruto = await r.text();
  if(debug) registos.push({
    tentativa: 'prices/cheap',
    pedido: TP + '/v1/prices/cheap?' + String(ps).replace(/token=[^&]*/, 'token=OCULTO'),
    estado: r.status,
    resposta: bruto.slice(0, 700)
  });
  let cheap = [];
  if(!r.ok){
    tentativas.push('prices/cheap: HTTP ' + r.status);
  }else{
    let j = null;
    try{ j = JSON.parse(bruto); }catch(e){ tentativas.push('prices/cheap: resposta ilegível'); }
    const porDestino = (j && j.data && j.data[q.get('destino')]) || {};
    cheap = Object.entries(porDestino).map(([escalas, v]) => ({
      preco: Math.round(v.price * pax),
      companhia: nomes[v.airline] || v.airline,
      escalas: +escalas,
      duracao: '',
      partida: (v.departure_at || '').slice(11, 16),
      data: (v.departure_at || '').slice(0, 10),
      url: ''
    })).sort((a, b) => a.preco - b.preco);
    if(!cheap.length) tentativas.push('prices/cheap: sem tarifas');
  }

  if(debug) return resposta({registos, tentativas}, 200, true);
  if(cheap.length)
    return resposta({ofertas: cheap, classe:'economica', fonte:'travelpayouts/cheap', datas:'exactas'});
  if(ofertas.length)
    return resposta({ofertas, classe:'economica', fonte:'travelpayouts/prices_for_dates', datas:'proximas'});
  return resposta({ofertas:[], fonte:'travelpayouts', nota: tentativas.join(' · ')}, 200, true);
}

/* ── Aluguer de viaturas e atracções (Booking.com via RapidAPI) ─────
   Os widgets do Localrent e do Klook fixam a cidade num identificador
   interno deles, o que os prendia a uma lista de cidades e, pior, nunca
   nos dizia o preço — logo, nunca podiam entrar no total da viagem.
   Esta API aceita coordenadas (viaturas) e o nome da cidade (atracções),
   que temos para os 95 destinos, e devolve o valor.

   As respostas ficam 6 h na cache da Cloudflare: a camada gratuita é
   limitada e repetir a mesma pesquisa não deve gastar pedidos. */
const RAPID_HOST = 'booking-com15.p.rapidapi.com';
/* O grupo «Car Rental» antigo está marcado como deprecated no fornecedor e
   responde 200 com «status:false». O que vale é o «Car Rental - V2», que
   pede dois passos: primeiro traduzir o local num identificador, depois
   pesquisar. Os caminhos ficam aqui em cima porque são a única coisa que
   muda quando o fornecedor renomeia a versão. */
const CAMINHO_CARROS_DESTINO = '/api/v2/cars/searchDestination';
const CAMINHO_CARROS = '/api/v2/cars/searchCarRentals';

async function rapid(caminho, params, env){
  const chave = (env.RAPIDAPI_KEY || '').trim();
  if(!chave) return {_erro:'RAPIDAPI_KEY não definido no Worker (ver /estado)'};
  const endereco = 'https://' + RAPID_HOST + caminho + '?' + new URLSearchParams(params);
  try{
    const r = await fetch(endereco, {
      headers:{'x-rapidapi-key': chave, 'x-rapidapi-host': RAPID_HOST},
      cf:{cacheTtl: 21600, cacheEverything: true}
    });
    const bruto = await r.text();
    /* o pedido e o estado vão sempre no resultado: esta API responde 200 com
       «status:false» e uma mensagem genérica, e sem ver o pedido exacto não
       se distingue um parâmetro errado de uma falha do fornecedor */
    const meta = {_pedido: endereco, _estado: r.status};
    /* o RapidAPI diz nos cabeçalhos quantos pedidos restam: sem isto, o
       esgotamento da quota é indistinguível de uma avaria */
    const resta = r.headers.get('x-ratelimit-requests-remaining');
    const total = r.headers.get('x-ratelimit-requests-limit');
    if(resta != null) meta._quota = resta + (total ? '/' + total : '') + ' pedidos restantes';
    if(r.status === 429)
      return Object.assign({_erro:'quota do RapidAPI esgotada (429): não há mais pedidos disponíveis este mês'}, meta);
    if(!r.ok) return Object.assign({_erro:'Booking devolveu ' + r.status, _bruto: bruto.slice(0, 500)}, meta);
    try{ return Object.assign(JSON.parse(bruto), meta); }
    catch(e){ return Object.assign({_erro:'resposta ilegível', _bruto: bruto.slice(0, 500)}, meta); }
  }catch(e){ return {_erro: String(e.message || e), _pedido: endereco}; }
}

/* Os nomes dos campos desta API mudam entre versões, por isso não se fixa
   um caminho: procura-se, em cada oferta, a primeira chave com ar de preço
   e a primeira com ar de nome. Assim uma renomeação não parte o bloco. */
function colher(obj, padraoChave, transformar){
  let achado = null;
  const anda = (v, prof) => {
    if(achado !== null || !v || typeof v !== 'object' || prof > 4) return;
    for(const k of Object.keys(v)){
      let x; try{ x = v[k]; }catch(e){ continue; }
      if(padraoChave.test(k)){
        const t = transformar(x);
        if(t){ achado = t; return; }
      }
      if(x && typeof x === 'object') anda(x, prof + 1);
    }
  };
  anda(obj, 0);
  return achado;
}
const CHAVE_PRECO = /^(price|amount|total|chargeAmount|drive_away_price|base_price|value)$/i;
const CHAVE_NOME  = /^(name|title|v_name|vehicle_name|productName)$/i;

/* /carros: preços reais de aluguer, em qualquer destino.
   Dois passos, como o fornecedor exige:
     1. «searchDestination» (term + countryOfResidence) devolve locais, cada
        um com coordinates.latitude/longitude e um title;
     2. «searchCarRentals» recebe essas coordenadas — não um identificador —
        mais as datas e as horas, que são todas obrigatórias.
   O title vai como pick_up_location_name: a documentação diz que melhora a
   correspondência do local, sem ser obrigatório.
   Nota: este endpoint não aceita moeda, por isso o preço vem na moeda que o
   fornecedor escolher; ela é devolvida em «moeda» para o site não afirmar
   euros quando não são.
   «debug=1» devolve os dois passos em bruto; «caminho1» e «caminho2»
   permitem acertar a versão sem publicar o Worker outra vez. */
async function carros(url, env){
  const q = url.searchParams;
  for(const p of ['lat','lon','ida','volta'])
    if(!q.get(p)) return resposta({erro:'parâmetros necessários: lat, lon, ida, volta'}, 400);
  const depurar = q.get('debug') === '1';
  const seguro = (v, omissao) => (v && v.startsWith('/api/')) ? v : omissao;
  const c1 = seguro(q.get('caminho1'), CAMINHO_CARROS_DESTINO);
  const c2 = seguro(q.get('caminho2'), CAMINHO_CARROS);

  /* Um pedido em vez de dois, sempre que possível. O «searchDestination»
     serve para afinar o local, mas o «searchCarRentals» aceita coordenadas
     quaisquer: começa-se pelas nossas, que já temos, e só se elas não derem
     nada é que se gasta um pedido a afinar. Com quotas apertadas, metade dos
     pedidos é a diferença entre servir e não servir. */
  const pedir = async (lat, lon, nomeLocal) => {
    const params = {
      pick_up_latitude: String(lat),   pick_up_longitude: String(lon),
      drop_off_latitude: String(lat),  drop_off_longitude: String(lon),
      pick_up_date: q.get('ida'),      drop_off_date: q.get('volta'),
      pick_up_time: '10:00',           drop_off_time: '10:00',
      driver_age: '30', countryOfResidence: 'pt'
    };
    if(nomeLocal) params.pick_up_location_name = nomeLocal;
    for(const par of (q.get('extra') || '').split(',')){
      const k = par.indexOf(':');
      if(k > 0) params[par.slice(0, k).trim()] = par.slice(k + 1).trim();
    }
    return rapid(c2, params, env);
  };
  const cartoesDe = resp => ((resp.data && resp.data.content && resp.data.content.items) || [])
    .filter(x => x && x.type === 'CAR_CARD' && x.content).map(x => x.content);

  let j = await pedir(q.get('lat'), q.get('lon'), q.get('cidade') || '');
  let local = null;
  /* nada nas nossas coordenadas: vale a pena perguntar ao fornecedor onde é */
  if(!j._erro && !cartoesDe(j).length){
    const destino = await rapid(c1, {term: q.get('cidade') || (q.get('lat') + ',' + q.get('lon')),
                                     countryOfResidence: 'pt'}, env);
    const lista1 = (destino.data && (Array.isArray(destino.data) ? destino.data : destino.data.destinations)) || [];
    local = lista1[0] || null;
    const coord = local && (local.coordinates || local);
    if(coord && (coord.latitude ?? coord.lat) != null)
      j = await pedir(coord.latitude ?? coord.lat, coord.longitude ?? coord.lon, local.title || '');
    else if(depurar) return resposta({passo:'searchDestination', resposta: destino}, 200, true);
  }
  if(depurar) return resposta({passo:'searchCarRentals', local, resposta: j}, 200, true);
  if(j._erro) return resposta({ofertas:[], fonte:'booking', nota: j._erro}, 200, true);
  /* «search_results» vem sempre vazio: as viaturas estão em content.items,
     misturadas com bandeiras, contagens e outros cartões da interface, e
     distinguem-se pelo type. */
  const cartoes = cartoesDe(j);
  const moeda = (j.data && j.data.metadata && j.data.metadata.lowestVehiclePrice
                 && j.data.metadata.lowestVehiclePrice.currency) || 'EUR';
  /* as características vêm em inglês; o site é em português */
  const traduzir = t => String(t || '')
    .replace(/\b(\d+) seats?\b/gi, '$1 lugares')
    .replace(/\b(\d+) doors?\b/gi, '$1 portas')
    .replace(/\bUnlimited (km|mileage)\b/gi, 'quilómetros ilimitados')
    .replace(/\bLimited (km|mileage)\b/gi, 'quilómetros limitados')
    .replace(/\bAutomatic\b/gi, 'automático')
    .replace(/\bManual\b/gi, 'manual')
    .replace(/\bOnline check-in\b/gi, 'check-in em linha')
    .replace(/\bFully electric\b/gi, 'eléctrico')
    .replace(/\bHybrid\b/gi, 'híbrido')
    .replace(/\bor similar small car\b/gi, 'ou similar, citadino')
    .replace(/\bor similar medium car\b/gi, 'ou similar, médio')
    .replace(/\bor similar large car\b/gi, 'ou similar, grande')
    .replace(/\bor similar SUV\b/gi, 'ou similar, SUV')
    .replace(/\bor similar\b/gi, 'ou similar')
    .replace(/\s*\|\s*/g, ' · ');

  /* os preços vêm formatados («€ 18»), não como número */
  const ofertas = cartoes.map(c => {
    const p = c.pricing || {};
    const antes = precoNumero(p.originalPriceDisplay);
    const agora = precoNumero(p.finalPriceDisplay);
    return {
      /* o modelo sozinho; o «ou similar» é detalhe e alongaria o resumo */
      nome: c.title || 'Viatura',
      preco: Math.round(agora),
      precoAntes: antes > agora ? Math.round(antes) : 0,
      fornecedor: (c.supplier && c.supplier.name) || '',
      nota: (c.supplier && c.supplier.rating && c.supplier.rating.score) || '',
      detalhe: [
        traduzir(c.subtitle),
        traduzir(c.specs),
        traduzir((c.vehicleSpecs || []).map(v => v && v.text).filter(Boolean).join(' · ')),
        c.location && c.location.pickup && c.location.pickup.location   /* nome próprio */
      ].filter(Boolean).join(' · ')
    };
  }).filter(o => o.preco > 0).sort((a, b) => a.preco - b.preco).slice(0, 8);
  /* sem ofertas, devolve-se uma amostra do que veio, para se perceber porquê */
  const extra = ofertas.length ? {} : {_amostra: cartoes[0] || null,
    _tipos: [...new Set(((j.data && j.data.content && j.data.content.items) || []).map(x => x && x.type))]};
  return resposta(Object.assign({ofertas, fonte:'booking', moeda, total: cartoes.length,
                                 quota: j._quota || ''}, extra));
}

/* /actividades: atracções com preço real, pelo nome da cidade.
   São dois pedidos: o primeiro traduz a cidade no identificador interno
   da Booking, o segundo traz as atracções. */
async function actividades(url, env){
  const q = url.searchParams;
  const cidade = q.get('cidade');
  if(!cidade) return resposta({erro:'parâmetro necessário: cidade'}, 400);
  const depurar = q.get('debug') === '1';
  const local = await rapid('/api/v1/attraction/searchLocation',
    {query: cidade, languagecode: 'pt'}, env);
  if(local._erro) return resposta({ofertas:[], fonte:'booking', nota: local._erro}, 200, true);
  const destinos = (local.data && (local.data.destinations || local.data.products)) || [];
  const id = destinos.length ? (destinos[0].id || destinos[0].productId) : null;
  if(!id){
    if(depurar) return resposta({passo:'searchLocation', resposta: local}, 200, true);
    return resposta({ofertas:[], fonte:'booking', nota:'a Booking não reconheceu «' + cidade + '»'}, 200, true);
  }
  const j = await rapid('/api/v1/attraction/searchAttractions',
    {id, currency_code:'EUR', languagecode:'pt', sortBy:'trending', page:'1'}, env);
  if(depurar) return resposta({passo:'searchAttractions', id, resposta: j}, 200, true);
  if(j._erro) return resposta({ofertas:[], fonte:'booking', nota: j._erro}, 200, true);
  const itens = (j.data && (j.data.products || j.data.results)) || [];
  const ofertas = itens.map(a => ({
    nome: colher(a, CHAVE_NOME, x => typeof x === 'string' && x.length < 120 ? x : null) || 'Actividade',
    preco: Math.round(colher(a, CHAVE_PRECO, x => precoNumero(x && x.amount != null ? x.amount : x)) || 0),
    url: a.slug ? 'https://www.booking.com/attractions/' + a.slug + '.html' : ''
  })).filter(o => o.preco > 0).slice(0, 6);
  const extra = ofertas.length ? {} : {_amostra: itens[0] || null, _total: itens.length};
  return resposta(Object.assign({ofertas, fonte:'booking'}, extra));
}

/* extrai um número de um preço que pode vir como "€120", "$1,299.00",
   "1 299", etc. Devolve 0 se não houver número utilizável. */
function precoNumero(v){
  if(v == null) return 0;
  let s = String(v).replace(/[^\d.,]/g, '');
  if(!s) return 0;
  if(s.includes('.') && s.includes(',')){
    s = s.lastIndexOf('.') > s.lastIndexOf(',')
      ? s.replace(/,/g, '')
      : s.replace(/\./g, '').replace(',', '.');
  }else if((s.match(/,/g) || []).length === 1 && /,\d{1,2}$/.test(s)){
    s = s.replace(',', '.');
  }else{
    s = s.replace(/[.,]/g, '');
  }
  const n = parseFloat(s);
  return isFinite(n) && n > 0 ? n : 0;
}

/* /hoteis: preços reais de hotéis via SerpApi (motor google_hotels), com
   chave gratuita (o plano actual dá 250 pesquisas/mês; o número exacto
   que resta vem em /estado). Falha sempre de forma graciosa
   (ofertas vazias) para o site cair nas estimativas locais, sem erro
   visível para o utilizador. */
/* Consulta a SerpApi (motor Google Hotels) para hotéis ou para alojamento
   local. O «vacation_rentals» é o mesmo motor e a mesma chave: muda só o
   tipo de alojamento devolvido. */
async function alojamento(url, env, casas){
  const q = url.searchParams;
  const cidade = q.get('cidade'), checkin = q.get('checkin'), checkout = q.get('checkout');
  const adultos = String(q.get('adultos') || 2);
  if(!cidade || !checkin || !checkout)
    return resposta({erro:'parâmetros necessários: cidade (nome), checkin, checkout (AAAA-MM-DD)'}, 400);
  const chave = (env.SERPAPI_KEY || '').trim();
  if(!chave) return resposta({ofertas:[], fonte:'serpapi', nota:'SERPAPI_KEY não definido no Worker (ver /estado)'}, 200, true);
  const ps = new URLSearchParams({
    engine: 'google_hotels',
    q: cidade + (casas ? ' vacation rentals' : ' hotels'),
    check_in_date: checkin,
    check_out_date: checkout,
    adults: adultos,
    currency: 'EUR',
    hl: 'pt',
    gl: 'pt',
    api_key: chave
  });
  if(casas) ps.set('vacation_rentals', 'true');
  try{
    /* A conta gratuita tem um limite mensal de pesquisas e cada pesquisa do site gasta
       duas (hotéis + casas). Guardar a resposta na cache da Cloudflare durante
       6 h faz com que repetir a mesma cidade e as mesmas datas não gaste nada:
       sem isto, a quota esgota-se em dezenas de pesquisas e o alojamento cai
       nas estimativas. */
    const r = await fetch('https://serpapi.com/search.json?' + ps,
      {cf:{cacheTtl: 21600, cacheEverything: true}});
    if(!r.ok) return resposta({ofertas:[], fonte:'serpapi', nota:'preços indisponíveis (' + r.status + ')'}, 200, true);
    const j = await r.json();
    if(j.error) return resposta({ofertas:[], fonte:'serpapi', nota: String(j.error)}, 200, true);
    const props = Array.isArray(j.properties) ? j.properties : [];
    const precoDe = p => {
      const rn = p.rate_per_night || {};
      return (+rn.extracted_lowest) || precoNumero(rn.lowest) || precoNumero(p.total_rate && p.total_rate.lowest) || 0;
    };
    const ofertas = props.map(p => ({
      nome: p.name || (casas ? 'Alojamento' : 'Hotel'),
      preco: Math.round(precoDe(p)),
      estrelas: Math.round(+p.extracted_hotel_class || +p.hotel_class || 0),
      /* só o alojamento local tem tipologia e capacidade úteis para mostrar */
      quartos: casas ? (+p.bedrooms || 0) : 0,
      tipo: casas ? String(p.property_type || p.type || '') : ''
    })).filter(o => o.preco > 0).sort((a, b) => a.preco - b.preco).slice(0, 8);
    const extra = ofertas.length ? {} : {_amostra: props[0] || null, _total: props.length};
    return resposta(Object.assign({ofertas, fonte:'serpapi', categoria: casas ? 'casas' : 'hoteis'}, extra));
  }catch(e){
    return resposta({ofertas:[], fonte:'serpapi', erro:String(e.message || e)}, 200, true);
  }
}
const hoteis = (url, env) => alojamento(url, env, false);
const casas  = (url, env) => alojamento(url, env, true);

/* /assistente: bot de viagens do TripNexus, com Workers AI (quota diária
   gratuita da Cloudflare, sem chave nem conta adicional). Responde só sobre
   viagens e em português de Portugal, com a ortografia antiga do site. */
/* A Cloudflare acrescenta e retira modelos com frequência (e sem aviso), por
   isso não se fixa um: tenta-se uma lista por ordem de preferência, os
   multilingues primeiro (o site é em português). O primeiro que responder
   fica memorizado para os pedidos seguintes não repetirem as tentativas.
   A rota /modelos diz quais destes a conta aceita neste momento. */
const MODELOS_IA = [
  /* confirmados pela rota /modelos; ordenados pela qualidade do português
     de Portugal: o mistral tende a escorregar para formas brasileiras
     («você»), por isso fica em último */
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  '@cf/mistralai/mistral-small-3.1-24b-instruct'
];
let modeloBom = null;   /* modelo que respondeu da última vez */
const INSTRUCOES_IA = [
  'És o assistente do TripNexus, um comparador de viagens português.',
  'Respondes SEMPRE em português de Portugal, com a ortografia ANTIGA (anterior ao Acordo Ortográfico):',
  'escreve «actual», «óptimo», «directo», «selecção», «objectivo», «contacto», «facto».',
  'TRATAMENTO (regra absoluta, mantém-na igual do princípio ao fim da conversa):',
  'trata sempre o utilizador com a forma de cortesia da 3.ª pessoa, como no resto do site.',
  'Escreve «indique», «a sua viagem», «se preferir», «para si», «aconselho-o a».',
  'NUNCA uses «tu» nem as suas formas («tens», «queres», «a tua», «vais», «podes»),',
  'e NUNCA escrevas a palavra «você». Não mudes de tratamento a meio da conversa,',
  'nem sequer se a pergunta do utilizador vier escrita por «tu»: mantém sempre a 3.ª pessoa.',
  'NUNCA uses português do Brasil.',
  'Usa as palavras de Portugal: «autocarro» (não «ônibus»), «comboio» (não «trem»),',
  '«telemóvel» (não «celular»), «casa de banho» (não «banheiro»), «bilhete» (não «passagem»),',
  '«apanhar o avião» (não «pegar o avião»). Evita gerúndios à brasileira: escreve «estou a ver», não «estou vendo».',
  'Ajudas com destinos, roteiros, melhor altura para viajar, transportes, vistos, orçamentos e dicas práticas.',
  'Sê concreto e conciso: no máximo 3 parágrafos curtos ou uma lista de 5 pontos.',
  'Não inventes preços, horários nem disponibilidade: para isso remete o utilizador para a pesquisa do site.',
  'Se a pergunta não tiver nada a ver com viagens, diz educadamente que só ajudas com viagens.',
  'Nunca peças nem guardes dados pessoais. Não és vendedor: o TripNexus só compara e encaminha para os parceiros.'
].join(' ');

async function assistente(pedido, env){
  if(pedido.method !== 'POST')
    return resposta({erro:'use POST com {pergunta, contexto?, historico?}'}, 405, true);
  if(!env.AI)
    return resposta({erro:'Workers AI não está ligado neste Worker: acrescente o binding [ai] ao wrangler.toml e volte a fazer wrangler deploy.'}, 503, true);
  let corpo;
  try{ corpo = await pedido.json(); }catch(e){ return resposta({erro:'corpo inválido'}, 400, true); }
  const pergunta = String((corpo && corpo.pergunta) || '').trim().slice(0, 600);
  if(!pergunta) return resposta({erro:'falta a pergunta'}, 400, true);
  /* contexto da pesquisa actual (destino, datas), se o site o enviar */
  const contexto = String((corpo && corpo.contexto) || '').trim().slice(0, 300);
  const mensagens = [{role:'system', content: INSTRUCOES_IA + (contexto ? ' Contexto da pesquisa actual do utilizador: ' + contexto : '')}];
  /* últimas trocas, para o bot manter o fio à meada */
  const hist = Array.isArray(corpo && corpo.historico) ? corpo.historico.slice(-6) : [];
  for(const m of hist){
    const papel = m && m.papel === 'bot' ? 'assistant' : 'user';
    const texto = String((m && m.texto) || '').trim().slice(0, 600);
    if(texto) mensagens.push({role: papel, content: texto});
  }
  mensagens.push({role:'user', content: pergunta});
  /* o que funcionou da última vez vai à frente, para não repetir tentativas */
  const candidatos = modeloBom ? [modeloBom, ...MODELOS_IA.filter(m => m !== modeloBom)] : MODELOS_IA;
  const falhas = [];
  for(const modelo of candidatos){
    try{
      const r = await env.AI.run(modelo, {messages: mensagens, max_tokens: 420, temperature: 0.6});
      const texto = String((r && (r.response || r.result)) || '').trim();
      if(texto){
        modeloBom = modelo;
        return resposta({resposta: texto, fonte:'workers-ai', modelo}, 200, true);
      }
      falhas.push(modelo + ': resposta vazia');
    }catch(e){
      falhas.push(modelo + ': ' + String((e && e.message) || e));
    }
  }
  modeloBom = null;
  return resposta({erro:'nenhum modelo disponível para esta conta', tentativas: falhas}, 502, true);
}

/* /modelos: diagnóstico. Experimenta cada candidato com uma pergunta mínima
   e diz quais funcionam nesta conta, para afinar a lista sem adivinhar. */
async function modelos(env){
  if(!env.AI) return resposta({erro:'Workers AI não está ligado (falta o binding [ai] no wrangler.toml)'}, 503, true);
  const teste = [{role:'user', content:'Diz apenas: olá'}];
  const resultados = [];
  for(const modelo of MODELOS_IA){
    try{
      const r = await env.AI.run(modelo, {messages: teste, max_tokens: 16});
      const texto = String((r && (r.response || r.result)) || '').trim();
      resultados.push({modelo, funciona: !!texto, amostra: texto.slice(0, 60)});
    }catch(e){
      resultados.push({modelo, funciona: false, erro: String((e && e.message) || e).slice(0, 160)});
    }
  }
  return resposta({
    funcionam: resultados.filter(r => r.funciona).map(r => r.modelo),
    detalhe: resultados
  }, 200, true);
}

export default {
  async fetch(pedido, env){
    if(pedido.method === 'OPTIONS')
      return new Response(null, {headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers':'*'
      }});
    const url = new URL(pedido.url);
    try{
      if(url.pathname === '/voos') return await voos(url, env);
      if(url.pathname === '/hoteis') return await hoteis(url, env);
      if(url.pathname === '/casas') return await casas(url, env);
      if(url.pathname === '/carros') return await carros(url, env);
      if(url.pathname === '/actividades') return await actividades(url, env);
      if(url.pathname === '/assistente') return await assistente(pedido, env);
      if(url.pathname === '/modelos') return await modelos(env);
      if(url.pathname === '/estado') return await estado(env);
      return resposta({erro:'rotas disponíveis: /voos, /hoteis, /casas, /carros, /actividades, /assistente, /modelos, /estado'}, 404);
    }catch(e){
      return resposta({erro: String(e.message || e)}, 500);
    }
  }
};
