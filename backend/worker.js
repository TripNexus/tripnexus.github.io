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
const VERSAO_WORKER = 'v72';

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
async function estado(env, url){
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
    /* O mais barato que há para ler os cabeçalhos de quota. Por omissão vai
       buscá-lo à cache de 6 h, para que recarregar o /estado não gaste
       pedidos — mas então o número lido é o da altura em que a resposta foi
       guardada, e não desce à medida que o site consome. Com «fresco=1»
       gasta-se um pedido para ver o valor de agora. */
    const fresco = url.searchParams.get('fresco') === '1';
    const r = await rapid(CAMINHO_CARROS_DESTINO, {term:'Lisbon', countryOfResidence:'pt'}, env, fresco);
    info.rapidapi_quota = r._quota || (r._quotaEsgotada ? '0 (esgotada)' : 'desconhecida');
    info.rapidapi_quota_nota = fresco
      ? 'leitura de agora (gastou um pedido)'
      : 'leitura em cache, até 6 h de atraso: não desce à medida que o site consome. Use /estado?fresco=1 para o valor actual, ao preço de um pedido.';
    if(r._quotaEsgotada)
      info.sugestao_carros = 'A quota mensal do RapidAPI esgotou-se: o aluguer e as actividades ficam sem preço até ao mês que vem. Ver backend/README.md sobre a Booking.com Demand API, que não tem limite de pedidos.';
    else if(r._estado === 429)
      info.sugestao_carros = 'O RapidAPI travou o ritmo (429), mas a quota do mês não está em causa: são pedidos a mais ao mesmo tempo. O Worker já repete com espera.';
  }
  info.tp_marker_definido = ((env.TP_MARKER || '').trim().length > 0);
  if(token && info.tp_marker_definido){
    /* a pesquisa ao vivo é o que permite ter tarifas nas datas exactas
       quando ninguém as pesquisou antes; se estiver fechada, convém sabê-lo
       aqui e não só no debug de uma rota */
    const registos = [];
    await pesquisaAoVivo(new URLSearchParams({origem:'LIS', destino:'BCN',
      ida: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      adultos:'1', classe:'economica'}), env, token, registos);
    const r0 = registos[0] || {};
    info.pesquisa_ao_vivo = r0.propostas > 0 ? 'a funcionar ('+ r0.propostas + ' propostas)'
      : (r0.diagnostico || r0.erro || 'sem propostas');
  }else if(token && !info.tp_marker_definido){
    info.pesquisa_ao_vivo = 'sem TP_MARKER: só há tarifas nas datas que já estiverem em cache. Corra wrangler secret put TP_MARKER na pasta backend/.';
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

/* ── pesquisa ao vivo (Travelpayouts Flight Search) ───────────
   O «prices_for_dates» é um registo de tarifas vistas em pesquisas
   recentes: se ninguém pesquisou as datas que o utilizador escolheu, não há
   lá nada, e o bloco acabava a propor outras datas. Não é isso que um
   comparador faz — o que os outros sites fazem é procurar mesmo, na hora.

   É o que esta API faz: abre-se uma pesquisa, espera-se, e lêem-se os
   resultados. Exige `marker` e uma assinatura MD5 dos parâmetros, e é o
   único sítio do backend que precisa de MD5 — a Web Crypto dos Workers não
   o tem, daí a implementação abaixo.

   Entra sempre como acréscimo: se falhar, fica o que a cache tiver, e o
   `/voos?debug=1` mostra o que aconteceu. */
function md5(texto){
  const bytes = new TextEncoder().encode(texto);
  const S = [7,12,17,22,7,12,17,22,7,12,17,22,7,12,17,22,
             5,9,14,20,5,9,14,20,5,9,14,20,5,9,14,20,
             4,11,16,23,4,11,16,23,4,11,16,23,4,11,16,23,
             6,10,15,21,6,10,15,21,6,10,15,21,6,10,15,21];
  const K = new Uint32Array(64);
  for(let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  const n = ((bytes.length + 8) >> 6) + 1;
  const m = new Uint32Array(n * 16);
  for(let i = 0; i < bytes.length; i++) m[i >> 2] |= bytes[i] << ((i % 4) * 8);
  m[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
  m[n * 16 - 2] = bytes.length * 8;
  let [a, b, c, d] = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476];
  const rol = (x, s) => (x << s) | (x >>> (32 - s));
  for(let i = 0; i < n * 16; i += 16){
    const [aa, bb, cc, dd] = [a, b, c, d];
    for(let j = 0; j < 64; j++){
      let f, g;
      if(j < 16){ f = (b & c) | (~b & d); g = j; }
      else if(j < 32){ f = (d & b) | (~d & c); g = (5 * j + 1) % 16; }
      else if(j < 48){ f = b ^ c ^ d; g = (3 * j + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * j) % 16; }
      const tmp = d; d = c; c = b;
      b = (b + rol((a + f + K[j] + m[i + g]) >>> 0, S[j])) >>> 0;
      a = tmp;
    }
    a = (a + aa) >>> 0; b = (b + bb) >>> 0; c = (c + cc) >>> 0; d = (d + dd) >>> 0;
  }
  return [a, b, c, d].map(x =>
    [0, 8, 16, 24].map(s => ((x >>> s) & 255).toString(16).padStart(2, '0')).join('')
  ).join('');
}

/* A assinatura é o MD5 do token seguido dos valores de todos os parâmetros,
   pela ordem alfabética das chaves em cada nível, separados por dois pontos.
   É a parte que mais falha, por isso o corpo vai construído numa ordem só e
   a cadeia é derivada dele, e não escrita à mão em paralelo. */
function assinarPesquisa(token, corpo){
  const valores = [
    corpo.host, corpo.locale, corpo.marker,
    corpo.passengers.adults, corpo.passengers.children, corpo.passengers.infants,
    ...corpo.segments.flatMap(s => [s.date, s.destination, s.origin]),
    corpo.trip_class, corpo.user_ip
  ];
  return md5(token + ':' + valores.join(':'));
}

async function pesquisaAoVivo(q, env, token, registos){
  const marker = (env.TP_MARKER || '').trim();
  const anotar = o => { if(registos) registos.push(Object.assign({tentativa:'pesquisa ao vivo'}, o)); };
  if(!marker){ anotar({erro:'TP_MARKER não definido no Worker'}); return []; }

  const segmentos = [{origin: q.get('origem'), destination: q.get('destino'), date: q.get('ida')}];
  if(q.get('volta')) segmentos.push({origin: q.get('destino'), destination: q.get('origem'), date: q.get('volta')});
  const corpo = {
    marker, host: 'tripnexus.github.io', user_ip: '127.0.0.1', locale: 'en',
    trip_class: {economica:'Y', premium:'W', executiva:'C', primeira:'F'}[q.get('classe')] || 'Y',
    passengers: {adults: Math.max(1, +q.get('adultos') || 1),
                 children: Math.max(0, +q.get('criancas') || 0), infants: 0},
    segments: segmentos
  };
  corpo.signature = assinarPesquisa(token, corpo);

  let uuid = '';
  try{
    const r = await fetch(TP + '/v1/flight_search', {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'Accept-Encoding':'gzip,deflate'},
      body: JSON.stringify(corpo)
    });
    const bruto = await r.text();
    if(!r.ok){
      /* Um 403 com «Forbidden» em texto simples é a porta fechada, não a
         assinatura mal feita: uma assinatura errada devolve JSON a dizê-lo.
         O acesso à pesquisa ao vivo é dado à parte pela Travelpayouts, a
         pedido, e não vem com a conta de afiliado. */
      const porta = r.status === 403 && /forbidden/i.test(bruto);
      anotar({estado: r.status, resposta: bruto.slice(0, 300),
        diagnostico: porta
          ? 'a conta não tem acesso à API de pesquisa ao vivo: peça-o à Travelpayouts (Flights Search API). Não é a assinatura.'
          : 'pedido recusado; ver a resposta'});
      return [];
    }
    let j; try{ j = JSON.parse(bruto); }catch(e){ anotar({erro:'resposta ilegível', resposta: bruto.slice(0, 300)}); return []; }
    uuid = j && (j.search_id || j.uuid);
    if(!uuid){ anotar({erro:'sem search_id', resposta: bruto.slice(0, 300)}); return []; }
  }catch(e){ anotar({erro: String(e.message || e)}); return []; }

  /* A pesquisa é assíncrona: os resultados vão chegando. Lê-se algumas
     vezes, com espera, e desiste-se antes de o utilizador desistir. */
  const propostas = [];
  for(const espera of [1200, 1800, 2500, 3000]){
    await new Promise(f => setTimeout(f, espera));
    try{
      const r = await fetch(TP + '/v1/flight_search_results?uuid=' + encodeURIComponent(uuid),
        {headers:{'Accept-Encoding':'gzip,deflate'}});
      if(!r.ok){ anotar({estado_resultados: r.status}); continue; }
      const blocos = await r.json();
      if(!Array.isArray(blocos)) continue;
      for(const bloco of blocos)
        if(bloco && Array.isArray(bloco.proposals)) propostas.push(...bloco.proposals.map(p => ({p, bloco})));
      /* o último bloco vem sem propostas quando a pesquisa terminou */
      const acabou = blocos.length && blocos.every(b => !b || !b.proposals || !b.proposals.length);
      if(propostas.length && acabou) break;
    }catch(e){ anotar({erro_resultados: String(e.message || e)}); }
  }
  anotar({uuid, propostas: propostas.length});
  return propostas;
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
        /* o código IATA vai a par do nome: é com ele que o site vai buscar o
           logótipo da companhia ao pics.avs.io, o CDN da própria Travelpayouts */
        codigo: String(v.airline || '').toUpperCase(),
        escalas: +v.transfers || 0,
        /* O regresso tem escalas próprias, e podem não ser as da ida. */
        escalasVolta: v.return_transfers != null ? (+v.return_transfers || 0) : null,
        /* «duration» é o total das duas pernas mais a estadia entre elas: dava
           «directo · 33h50» num Lisboa–Paris, que é um disparate à vista de
           toda a gente. O que interessa em cada perna é «duration_to» e
           «duration_back». */
        duracao: duracaoTexto(v.duration_to || v.duration),
        duracaoVolta: v.duration_back ? duracaoTexto(v.duration_back) : '',
        /* O aeroporto de chegada nem sempre é o da cidade: um voo «para
           Paris» pode aterrar em Beauvais, a 85 km. Quem compara preços tem
           de saber isso antes de reservar. */
        aeroportoChegada: String(v.destination_airport || '').toUpperCase(),
        aeroportoPartida: String(v.origin_airport || '').toUpperCase(),
        partida: String(v.departure_at || '').slice(11, 16),
        data: String(v.departure_at || '').slice(0, 10),
        /* na pesquisa alargada o regresso também sai da data pedida, e sem
           isto o utilizador via a ida corrigida mas não a volta */
        regresso: String(v.return_at || '').slice(0, 10),
        url: ligacao(v.link)
      })).filter(o => o.preco > 0);
    }catch(e){ tentativas.push(etiqueta + ': ' + String(e.message || e)); return []; }
  };

  /* AS DATAS SÃO AS DO UTILIZADOR. Este bloco propunha outras quando não
     encontrava tarifas para as pedidas, e isso está errado: quem escolheu
     14 a 17 de Outubro não quer saber de 20 a 22. O calendário é que serve
     para explorar datas; aqui procura-se o que foi pedido, e se não houver
     diz-se que não há.

     Duas fontes para as mesmas datas, somadas:
       1. o «prices_for_dates», que é um registo de tarifas vistas em
          pesquisas recentes — instantâneo, mas com buracos;
       2. a pesquisa ao vivo, que vai mesmo procurar agora. É mais lenta e
          exige assinatura, mas é o que permite ter valores para datas que
          mais ninguém pesquisou. */
  let ofertas;
  const [daCache, aoVivo] = await Promise.all([
    porDatas(ida, volta, 'datas exactas'),
    pesquisaAoVivo(q, env, token, debug ? registos : null)
  ]);

  const doVivo = aoVivo.map(({p, bloco}) => {
    const termos = Object.values(p.terms || {})[0] || {};
    const seg = (p.segment || [])[0] || {};
    const voo = (seg.flight || [])[0] || {};
    const ultimo = (seg.flight || [])[(seg.flight || []).length - 1] || {};
    const regressoSeg = (p.segment || [])[1];
    const codigo = String(p.validating_carrier || voo.operating_carrier || '').toUpperCase();
    const minutos = (p.segment || []).reduce((t, sg) =>
      t + (sg.flight || []).reduce((x, f) => x + (+f.duration || 0), 0), 0);
    return {
      preco: Math.round(+termos.unified_price || +termos.price || 0),
      companhia: nomes[codigo] || codigo,
      codigo,
      escalas: Math.max(0, (seg.flight || []).length - 1),
      duracao: duracaoTexto(minutos),
      partida: String(voo.departure_time || '').slice(0, 5),
      data: String(voo.departure_date || ida).slice(0, 10),
      regresso: regressoSeg ? String(((regressoSeg.flight || [])[0] || {}).departure_date || volta || '').slice(0, 10) : (volta || ''),
      url: ''
    };
  }).filter(o => o.preco > 0);

  /* nada de datas vizinhas: só o que é mesmo das datas pedidas */
  const daData = o => o.data === ida && (!volta || !o.regresso || o.regresso === volta);
  const vistas = new Set();
  ofertas = [...daCache, ...doVivo].filter(o => {
    if(!daData(o)) return false;
    const c = [o.data, o.regresso, o.codigo, o.preco, o.partida].join('|');
    if(vistas.has(c)) return false;
    vistas.add(c);
    return true;
  }).sort((a, b) => a.preco - b.preco);

  if(ofertas.length && !debug)
    return resposta({ofertas: ofertas.slice(0, 20), classe:'economica',
      fonte: doVivo.length ? 'travelpayouts/pesquisa-ao-vivo' : 'travelpayouts/prices_for_dates',
      datas:'exactas', aoVivo: doVivo.length});

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
      codigo: String(v.airline || '').toUpperCase(),
      escalas: +escalas,
      duracao: '',
      partida: (v.departure_at || '').slice(11, 16),
      data: (v.departure_at || '').slice(0, 10),
      url: ''
    })).sort((a, b) => a.preco - b.preco);
    if(!cheap.length) tentativas.push('prices/cheap: sem tarifas');
  }

  if(debug) return resposta({registos, tentativas, aoVivo: doVivo.length,
                             daCache: daCache.length, exactas: ofertas.length,
                             /* as ofertas já interpretadas, e não só a
                                resposta em bruto: é a única forma de ver se
                                uma tarifa que existe na origem sobreviveu ao
                                caminho todo até ao ecrã */
                             maisBaratas: ofertas.slice(0, 5),
                             /* e as que foram postas de parte, com a razão */
                             rejeitadas: [...daCache, ...doVivo]
                               .filter(o => !(o.data === ida && (!volta || !o.regresso || o.regresso === volta)))
                               .slice(0, 5)
                               .map(o => ({preco:o.preco, companhia:o.companhia,
                                           data:o.data, regresso:o.regresso,
                                           razao: o.data !== ida ? 'ida noutro dia' : 'regresso noutro dia'}))
                            }, 200, true);
  /* o «prices/cheap» também só conta se for do dia pedido */
  const cheapExactas = cheap.filter(o => o.data === ida);
  if(cheapExactas.length)
    return resposta({ofertas: cheapExactas, classe:'economica', fonte:'travelpayouts/cheap', datas:'exactas'});
  /* Sem tarifas para estas datas, devolve-se lista vazia e o motivo. Não se
     propõem outras datas: o utilizador escolheu estas. */
  return resposta({ofertas:[], fonte:'travelpayouts', datas:'exactas',
                   nota: tentativas.join(' · ')}, 200, true);
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
/* A Booking usa códigos de idioma com região («pt-pt», «en-us»). Um «pt»
   solto não é reconhecido e a pesquisa devolve zero destinos, o que se lia
   no site como «a Booking não reconheceu «Paris»». */
const LOCALE = 'pt-pt';

/* Endereço da pesquisa de aluguer na Booking, já com o local e as datas.
   Os cartões da API não trazem ligação nenhuma para a viatura, e o botão de
   reserva estava a cair na página de entrada do site — que é onde tinha ido
   parar depois de um endereço inventado por nós ter dado «Página não
   encontrada». Estes parâmetros são os que a Booking documenta para o
   «cars.booking.com/search-results»: puDay/puMonth/puYear e os do regresso,
   locationIata, locationName, driversAge, prefcurrency e preflang. */
function ligacaoCarrosBooking(q){
  const parte = (iso, prefixo) => {
    const [a, m, d] = String(iso || '').split('-');
    if(!a || !m || !d) return {};
    return {[prefixo + 'Year']: a, [prefixo + 'Month']: String(+m), [prefixo + 'Day']: String(+d),
            [prefixo + 'Hour']: '10', [prefixo + 'Minute']: '0'};
  };
  const p = Object.assign({}, parte(q.get('ida'), 'pu'), parte(q.get('volta'), 'do'), {
    driversAge: '30', prefcurrency: 'EUR', preflang: 'pt'
  });
  /* Só o nome da cidade, e não o código IATA. Com «locationIata=PAR» a
     Booking abria em Paris (CDG) — o aeroporto — enquanto a nossa pesquisa é
     feita nas coordenadas do centro e devolve balcões como a Gare de Lyon.
     Duas localizações diferentes dão preços diferentes, e o utilizador via
     isso como uma discrepância nossa. Mais vale o botão procurar onde nós
     procurámos. */
  if(q.get('cidade')) p.locationName = q.get('cidade');
  return 'https://cars.booking.com/search-results?' + new URLSearchParams(p);
}

/* Os nomes dos campos de imagem mudam entre versões desta API, por isso não
   se fixa um: aceita-se a primeira chave plausível que traga um URL. */
const urlDe = (o, ...chaves) => {
  for(const k of chaves){
    const v = o && o[k];
    if(typeof v === 'string' && /^https?:\/\//.test(v)) return v;
  }
  return '';
};

/* O RapidAPI devolve 429 por duas razões muito diferentes, e o código HTTP
   sozinho não as distingue:

   - a quota do mês acabou — o corpo fala em «MONTHLY quota» e nomeia o plano;
     esperar não adianta nada, só volta a haver pedidos no mês seguinte;
   - pedidos a mais por segundo — o corpo diz apenas «Too many requests». O
     plano gratuito tolera muito pouca simultaneidade, e o site pede carros e
     actividades ao mesmo tempo, o que basta para o accionar. Aqui esperar
     resolve, e é o que se faz.

   Confundir os dois custou-nos um diagnóstico errado: demos por esgotada uma
   quota que estava em 47/50. */
function quotaDoMes(corpo){ return /monthly quota|exceeded the .*quota/i.test(corpo || ''); }

async function rapid(caminho, params, env, semCache){
  const chave = (env.RAPIDAPI_KEY || '').trim();
  if(!chave) return {_erro:'RAPIDAPI_KEY não definido no Worker (ver /estado)'};
  const endereco = 'https://' + RAPID_HOST + caminho + '?' + new URLSearchParams(params);
  const esperas = [0, 1200, 2500];
  let ultima = null;
  for(const espera of esperas){
    if(espera) await new Promise(f => setTimeout(f, espera));
    ultima = await uma(endereco, chave, semCache);
    /* só vale a pena repetir o 429 de ritmo; o da quota do mês é definitivo */
    if(ultima._estado !== 429 || ultima._quotaEsgotada) break;
  }
  return ultima;
}

async function uma(endereco, chave, semCache){
  try{
    const r = await fetch(endereco, {
      headers:{'x-rapidapi-key': chave, 'x-rapidapi-host': RAPID_HOST},
      cf: semCache ? {cacheTtl: 0} : {cacheTtl: 21600, cacheEverything: true}
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
    if(r.status === 429){
      const doMes = quotaDoMes(bruto);
      return Object.assign({
        _quotaEsgotada: doMes,
        _erro: doMes
          ? 'quota mensal do RapidAPI esgotada: só há mais pedidos no mês que vem'
          : 'o RapidAPI travou o ritmo (429, «too many requests»); a quota do mês não está em causa'
      }, meta);
    }
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
  /* «debug=precos» devolve só os blocos de preço dos primeiros cartões: a
     resposta inteira tem dezenas de milhares de caracteres e não se lê. */
  if(q.get('debug') === 'precos')
    return resposta({passo:'pricing', cartoes: cartoesDe(j).slice(0, 6).map(c => ({
      titulo: c.title, fornecedor: c.supplier && c.supplier.name, pricing: c.pricing
    })), quota: j._quota || ''}, 200, true);
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
    .replace(/\b(\d+)\s*kilometres? per rental\b/gi, '$1 km por aluguer')
    .replace(/\b(\d+)\s*miles? per rental\b/gi, '$1 milhas por aluguer')
    .replace(/\bPrice for (\d+) days?\b/gi, 'preço para $1 dias')
    .replace(/\bFree cancellation\b/gi, 'cancelamento gratuito')
    .replace(/\bAir conditioning\b/gi, 'ar condicionado')
    .replace(/\s*\|\s*/g, ' · ');

  /* O preço vem formatado («€ 18»), mas nem só: há campos numéricos ao lado,
     e são esses que valem. Ler apenas a cadeia formatada dava seis viaturas
     de fornecedores diferentes todas ao mesmo euro — sinal de que a cadeia
     lida não era a da viatura. Procura-se primeiro um número, e só se não
     houver nenhum é que se volta a interpretar o texto. */
  const numeroDe = (o, ...caminhos) => {
    for(const cam of caminhos){
      let v = o;
      for(const passo of cam.split('.')){ v = v && v[passo]; }
      const n = typeof v === 'number' ? v : (typeof v === 'string' ? precoNumero(v) : 0);
      if(n > 0) return n;
    }
    return 0;
  };
  const ofertas = cartoes.map(c => {
    const p = c.pricing || {};
    const antes = numeroDe(p, 'originalPrice.amount', 'originalPrice', 'originalPriceDisplay');
    const agora = numeroDe(p,
      'finalPrice.amount', 'finalPrice', 'price.amount', 'price',
      'totalPrice.amount', 'totalPrice', 'discountedPrice.amount',
      'finalPriceDisplay');
    const forn = c.supplier || {};
    return {
      /* o modelo sozinho; o «ou similar» é detalhe e alongaria o resumo */
      nome: c.title || 'Viatura',
      preco: Math.round(agora),
      precoAntes: antes > agora ? Math.round(antes) : 0,
      fornecedor: forn.name || '',
      /* o logótipo da empresa de aluguer, e a fotografia da viatura como
         alternativa: qualquer um deles diz mais do que um emoji de carro */
      logo: urlDe(forn, 'logoUrl', 'logo', 'imageUrl', 'image'),
      imagem: urlDe(c, 'imageUrl', 'image', 'vehicleImage', 'photoUrl')
              || urlDe(c.vehicle || {}, 'imageUrl', 'image'),
      nota: (c.supplier && c.supplier.rating && c.supplier.rating.score) || '',
      /* ligação para esta viatura, se a Booking a der: sem ela o botão cai
         numa página de entrada, e a pior hipótese é mandar o utilizador para
         um endereço inventado que não existe */
      url: urlDe(c, 'deeplink', 'deepLink', 'url', 'link', 'bookUrl')
           || urlDe(c.routeInfo || {}, 'deeplink', 'url'),
      detalhe: [
        traduzir(c.subtitle),
        traduzir(c.specs),
        traduzir((c.vehicleSpecs || []).map(v => v && v.text).filter(Boolean).join(' · ')),
        c.location && c.location.pickup && c.location.pickup.location   /* nome próprio */
      ].filter(Boolean).join(' · ')
    };
  }).filter(o => o.preco > 0).sort((a, b) => a.preco - b.preco);

  /* Oito linhas com o mesmo carro e o mesmo preço não são uma comparação.
     A resposta traz mais de mil viaturas e as mais baratas são quase todas o
     mesmo modelo em balcões diferentes: ordenar por preço e cortar às oito
     dava seis «Renault Clio · 165 €» seguidos. Fica o mais barato de cada
     modelo, que é o que deixa comparar carro com carro. */
  const vistos = new Set();
  const distintas = [];
  for(const o of ofertas){
    const chave = String(o.nome).toLowerCase().trim();
    if(vistos.has(chave)) continue;
    vistos.add(chave);
    distintas.push(o);
    if(distintas.length >= 8) break;
  }
  /* sem ofertas, devolve-se uma amostra do que veio, para se perceber porquê */
  const extra = distintas.length ? {} : {_amostra: cartoes[0] || null,
    _tipos: [...new Set(((j.data && j.data.content && j.data.content.items) || []).map(x => x && x.type))]};
  return resposta(Object.assign({ofertas: distintas, fonte:'booking', moeda,
                                 total: cartoes.length, modelos: vistos.size,
                                 /* endereço da pesquisa na Booking, para o botão
                                    de reserva abrir estas datas e este local */
                                 pesquisa: ligacaoCarrosBooking(q),
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
    {query: cidade, languagecode: LOCALE}, env);
  if(local._erro) return resposta({ofertas:[], fonte:'booking', nota: local._erro}, 200, true);
  const destinos = (local.data && (local.data.destinations || local.data.products)) || [];
  const id = destinos.length ? (destinos[0].id || destinos[0].productId) : null;
  if(!id){
    if(depurar) return resposta({passo:'searchLocation', resposta: local}, 200, true);
    return resposta({ofertas:[], fonte:'booking',
      nota:'a Booking não reconheceu «' + cidade + '»'
           + (local._quota ? ' (' + local._quota + ')' : '')}, 200, true);
  }
  const j = await rapid('/api/v1/attraction/searchAttractions',
    {id, currency_code:'EUR', languagecode: LOCALE, sortBy:'trending', page:'1'}, env);
  if(depurar) return resposta({passo:'searchAttractions', id, resposta: j}, 200, true);
  if(j._erro) return resposta({ofertas:[], fonte:'booking', nota: j._erro}, 200, true);
  const itens = (j.data && (j.data.products || j.data.results)) || [];
  const ofertas = itens.map(a => ({
    nome: colher(a, CHAVE_NOME, x => typeof x === 'string' && x.length < 120 ? x : null) || 'Actividade',
    preco: Math.round(colher(a, CHAVE_PRECO, x => precoNumero(x && x.amount != null ? x.amount : x)) || 0),
    /* a fotografia da atracção diz mais do que um bilhete desenhado */
    imagem: urlDe(a.primaryPhoto || {}, 'small', 'medium', 'large', 'url')
            || urlDe(a, 'imageUrl', 'image', 'photoUrl'),
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

/* /calendario: o preço mais baixo por dia, num mês, para uma dada duração
   de viagem. É o que alimenta a grelha de datas do site.

   Existe porque a grelha estava a mostrar valores inventados por um gerador
   pseudo-aleatório do motor local — e a mostrá-los sem ressalva nenhuma, ao
   lado de preços reais. O utilizador escolhia as datas por eles.

   Dois modos:
     mes=AAAA-MM&dias=7         → agrupa por data de partida, viagens de N dias
     mes=AAAA-MM&ida=AAAA-MM-DD → partida fixa, agrupa por data de regresso */
async function calendario(url, env){
  const q = url.searchParams;
  for(const p of ['origem','destino','mes'])
    if(!q.get(p)) return resposta({erro:'parâmetros necessários: origem, destino, mes (AAAA-MM)'}, 400);
  const token = obterToken(env);
  if(!token) return resposta({precos:{}, nota:'TP_TOKEN não definido no Worker (ver /estado)'}, 200, true);

  const mes = String(q.get('mes')).slice(0, 7);
  const idaFixa = q.get('ida') || '';
  const dias = Math.max(0, +q.get('dias') || 0);
  const soIda = q.get('soIda') === '1' || (!dias && !idaFixa);
  const depurar = q.get('debug') === '1';
  const diag = {consultas: [], duracoes: {}};

  /* Uma página só não chega: o «limit» tem tecto e a ordenação é por preço,
     por isso um único pedido devolve as tarifas mais baratas do mês inteiro
     e não uma amostra que cubra os dias todos. Pedem-se várias páginas. */
  const pedir = async (partida, regresso, pagina) => {
    const ps = new URLSearchParams({
      origin: q.get('origem'), destination: q.get('destino'),
      departure_at: partida, currency: 'eur', sorting: 'price',
      unique: 'false', limit: '1000', page: String(pagina || 1),
      one_way: soIda ? 'true' : 'false', token
    });
    if(regresso) ps.set('return_at', regresso);
    try{
      const r = await fetch(TP + '/aviasales/v3/prices_for_dates?' + ps,
        {headers:{'X-Access-Token': token}, cf:{cacheTtl: 3600, cacheEverything: true}});
      if(!r.ok){
        diag.consultas.push({tipo:'prices_for_dates', partida, regresso, pagina, estado: r.status});
        return [];
      }
      const j = await r.json();
      const d = Array.isArray(j && j.data) ? j.data : [];
      diag.consultas.push({tipo:'prices_for_dates', partida, regresso, pagina, linhas: d.length});
      return d;
    }catch(e){
      diag.consultas.push({tipo:'prices_for_dates', partida, regresso, pagina, erro: String(e.message || e)});
      return [];
    }
  };

  /* A Travelpayouts tem um endpoint feito de propósito para isto, que
     devolve o mais barato de cada dia em vez das mais baratas do mês. Não o
     posso confirmar contra a API a partir daqui, por isso entra como
     acréscimo: se responder, junta-se; se falhar, não se perde nada. O
     «debug=1» diz se contribuiu. */
  const pedirCalendario = async (comDuracao) => {
    if(idaFixa) return [];
    const ps = new URLSearchParams({
      origin: q.get('origem'), destination: q.get('destino'),
      depart_date: mes, calendar_type: 'departure_date', currency: 'eur', token
    });
    if(!soIda && dias && comDuracao) ps.set('trip_duration', String(dias));
    const marca = comDuracao ? dias + ' noites' : 'qualquer duração';
    try{
      const r = await fetch(TP + '/v1/prices/calendar?' + ps,
        {headers:{'X-Access-Token': token}, cf:{cacheTtl: 3600, cacheEverything: true}});
      if(!r.ok){ diag.consultas.push({tipo:'prices/calendar', filtro: marca, estado: r.status}); return []; }
      const j = await r.json();
      const dados = (j && j.data) || {};
      const linhas = Object.values(dados).filter(v => v && v.price > 0);
      diag.consultas.push({tipo:'prices/calendar', filtro: marca, linhas: linhas.length,
                           sucesso: j && j.success !== false});
      return linhas;
    }catch(e){
      diag.consultas.push({tipo:'prices/calendar', erro: String(e.message || e)});
      return [];
    }
  };

  /* o mês seguinte também entra: uma viagem que parte a 30 regressa já no
     mês a seguir, e ficaria de fora se só se pedisse o mês da partida */
  const seguinte = (() => {
    const [a, m] = mes.split('-').map(Number);
    return new Date(Date.UTC(a, m, 1)).toISOString().slice(0, 7);
  })();

  let linhas;
  if(idaFixa){
    linhas = (await Promise.all([pedir(idaFixa, mes, 1), pedir(idaFixa, mes, 2)])).flat();
  }else if(soIda){
    linhas = (await Promise.all([pedir(mes, '', 1), pedir(mes, '', 2), pedirCalendario(false)])).flat();
  }else{
    linhas = (await Promise.all([
      pedir(mes, mes, 1), pedir(mes, mes, 2),
      pedir(mes, seguinte, 1), pedir(mes, seguinte, 2),
      /* Duas passagens: uma com a duração pedida, outra sem filtro nenhum. A
         primeira dá o melhor preço para a viagem que se quer; a segunda enche
         os dias em que não existe viagem dessa duração mas existe alguma — e
         eram esses que ficavam em branco. Como a duração de cada tarifa vai no
         resultado e aparece ao lado do preço, nenhum desses dias se disfarça
         do que não é. */
      pedirCalendario(true), pedirCalendario(false)
    ])).flat();
  }
  diag.linhas_totais = linhas.length;

  /* Por dia guarda-se a tarifa cuja duração está mais perto da pedida, e
     entre iguais a mais barata. Antes exigia-se a duração exacta a menos de
     um dia e descartava-se o resto, o que deixava o mês quase vazio: numa
     fonte que é um registo de pesquisas recentes, e não um horário, exigir a
     duração ao dia é exigir de mais. O desvio vai no resultado para o site
     poder dizer, no dia, que aquela tarifa é de uma viagem de outro tamanho. */
  const melhor = {};
  let semRegresso = 0, foraDoMes = 0;
  for(const v of linhas){
    const partida = String(v.departure_at || '').slice(0, 10);
    const volta = String(v.return_at || '').slice(0, 10);
    const preco = Math.round(+v.price || 0);
    if(!partida || preco <= 0) continue;
    let chave, desvio = 0, n = 0;
    if(idaFixa){
      if(!volta || volta <= idaFixa){ semRegresso++; continue; }
      chave = volta;
    }else{
      if(!soIda){
        n = Math.round((Date.parse(volta) - Date.parse(partida)) / 86400000);
        if(!isFinite(n) || n < 1){ semRegresso++; continue; }
        desvio = Math.abs(n - dias);
        if(depurar) diag.duracoes[n] = (diag.duracoes[n] || 0) + 1;
        /* Não se descarta por duração. O diagnóstico mostrou que a maior
           parte das tarifas registadas são de estadias curtas — duas e três
           noites dominam — e cortá-las deixava o mês quase vazio. Guarda-se a
           mais próxima do pedido e diz-se de quantas noites é: um dia com
           «96 € 2n» informa, um dia em branco não. */
      }
      chave = partida;
    }
    if(chave.slice(0, 7) !== mes){ foraDoMes++; continue; }
    const actual = melhor[chave];
    if(!actual || desvio < actual.desvio || (desvio === actual.desvio && preco < actual.preco))
      melhor[chave] = {preco, desvio, noites: n};
  }

  /* as noites vão sempre, e não só quando diferem: é com elas que o site
     decide qual é o dia realmente mais barato para a viagem que se pediu */
  const precos = {}, noites = {};
  for(const [dia, v] of Object.entries(melhor)){
    precos[dia] = v.preco;
    if(v.noites) noites[dia] = v.noites;
  }
  const corpo = {precos, noites, mes, dias, moeda:'EUR', fonte:'travelpayouts',
                 total: Object.keys(precos).length};
  if(depurar) corpo._diag = Object.assign(diag, {semRegresso, foraDoMes});
  return resposta(corpo);
}

/* /ofertas: as ofertas em conta, com preços reais.

   Esta página mostrava descontos inventados — o preço «agora», o preço
   «típico» e a percentagem de queda saíam todos do gerador pseudo-aleatório
   do motor local. Era o último sítio do site com números que não existem.

   Agora: para cada destino pede-se o calendário do mês e fica-se com o dia
   mais barato. O «típico» deixa de ser inventado e passa a ser a **mediana
   dos preços diários** dessa mesma rota nesse mês — uma estatística das
   tarifas observadas, e não um número tirado do ar. A queda é a diferença
   entre os dois, e só se anuncia quando existe mesmo.

   Um destino sem tarifas registadas não entra: melhor menos cartões do que
   cartões com valores fabricados. */
async function ofertas(url, env){
  const q = url.searchParams;
  const origem = q.get('origem');
  if(!origem) return resposta({erro:'parâmetro necessário: origem (IATA)'}, 400);
  const token = obterToken(env);
  if(!token) return resposta({ofertas:[], nota:'TP_TOKEN não definido no Worker (ver /estado)'}, 200, true);
  const destinos = String(q.get('destinos') || '').split(',').map(s => s.trim().toUpperCase())
    .filter(Boolean).slice(0, 14);
  if(!destinos.length) return resposta({erro:'parâmetro necessário: destinos (códigos IATA separados por vírgula)'}, 400);
  const dias = Math.min(30, Math.max(1, +q.get('dias') || 7));
  const mes = (q.get('mes') || '').slice(0, 7) ||
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 7);

  /* um pedido por destino: o endpoint de calendário já devolve o mais barato
     de cada dia, que é exactamente o que aqui faz falta */
  const porDestino = async destino => {
    const ps = new URLSearchParams({
      origin: origem, destination: destino, depart_date: mes,
      calendar_type: 'departure_date', trip_duration: String(dias),
      currency: 'eur', token
    });
    try{
      const r = await fetch(TP + '/v1/prices/calendar?' + ps,
        {headers:{'X-Access-Token': token}, cf:{cacheTtl: 10800, cacheEverything: true}});
      if(!r.ok) return null;
      const j = await r.json();
      const linhas = Object.values((j && j.data) || {}).filter(v => v && +v.price > 0);
      if(linhas.length < 3) return null;   /* poucos dias: a mediana não diz nada */
      const precos = linhas.map(v => Math.round(+v.price)).sort((a, b) => a - b);
      const meio = Math.floor(precos.length / 2);
      const tipico = precos.length % 2 ? precos[meio] : Math.round((precos[meio - 1] + precos[meio]) / 2);
      const melhor = linhas.reduce((m, v) => (+v.price < +m.price ? v : m));
      const agora = Math.round(+melhor.price);
      return {
        destino, agora, tipico, dias,
        /* só se anuncia queda quando ela existe */
        queda: tipico > agora ? Math.round((1 - agora / tipico) * 100) : 0,
        ida: String(melhor.departure_at || '').slice(0, 10),
        volta: String(melhor.return_at || '').slice(0, 10),
        diasComTarifa: linhas.length
      };
    }catch(e){ return null; }
  };

  const lista = (await Promise.all(destinos.map(porDestino)))
    .filter(Boolean)
    .sort((a, b) => b.queda - a.queda);
  return resposta({ofertas: lista, mes, dias, moeda:'EUR', fonte:'travelpayouts',
                   base:'mediana dos preços diários da rota neste mês'});
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
    /* «debug=1» devolve os dois primeiros alojamentos como a SerpApi os
       manda. O campo «type» é grosso — diz «hotel» a tudo o que veio da
       pesquisa de hotéis, hostels incluídos — e é preciso ver o que mais
       existe antes de escolher outro. */
    if(q.get('debug') === '1')
      return resposta({passo:'google_hotels', total: props.length,
                       amostra: props.slice(0, 2)}, 200, true);
    const precoDe = p => {
      const rn = p.rate_per_night || {};
      return (+rn.extracted_lowest) || precoNumero(rn.lowest) || precoNumero(p.total_rate && p.total_rate.lowest) || 0;
    };
    /* a fotografia do próprio alojamento vale mais do que a inicial do nome
       num quadrado colorido: é a imagem que o utilizador vai reconhecer */
    const fotoDe = p => {
      const im = Array.isArray(p.images) ? p.images[0] : null;
      return (im && (im.thumbnail || im.original_image)) || p.thumbnail || '';
    };
    const ofertas = props.map(p => ({
      nome: p.name || (casas ? 'Alojamento' : 'Hotel'),
      preco: Math.round(precoDe(p)),
      imagem: fotoDe(p),
      estrelas: Math.round(+p.extracted_hotel_class || +p.hotel_class || 0),
      quartos: casas ? (+p.bedrooms || 0) : 0,
      /* A tipologia vale para os dois lados, não só para o alojamento local:
         a pesquisa de «hotéis» traz hostels, pousadas e apart-hotéis, e
         chamar-lhes «Hotel» a todos é dizer ao utilizador uma coisa que não
         é verdade. Vem no que a Google devolver; a tradução é no site. */
      tipo: String(p.type || p.property_type || ''),
      /* A descrição é o que distingue um hostel de um hotel nesta fonte: o
         «type» diz «hotel» a tudo o que veio da pesquisa de hotéis. Vai para
         o site, que é onde se decide o rótulo. */
      descricao: String(p.description || '').slice(0, 300)
    })).filter(o => o.preco > 0).sort((a, b) => a.preco - b.preco).slice(0, 12);
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
      if(url.pathname === '/calendario') return await calendario(url, env);
      if(url.pathname === '/ofertas') return await ofertas(url, env);
      if(url.pathname === '/hoteis') return await hoteis(url, env);
      if(url.pathname === '/casas') return await casas(url, env);
      if(url.pathname === '/carros') return await carros(url, env);
      if(url.pathname === '/actividades') return await actividades(url, env);
      if(url.pathname === '/assistente') return await assistente(pedido, env);
      if(url.pathname === '/modelos') return await modelos(env);
      if(url.pathname === '/estado') return await estado(env, url);
      return resposta({erro:'rotas disponíveis: /voos, /calendario, /ofertas, /hoteis, /casas, /carros, /actividades, /assistente, /modelos, /estado'}, 404);
    }catch(e){
      return resposta({erro: String(e.message || e)}, 500);
    }
  }
};
