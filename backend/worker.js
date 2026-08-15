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
const VERSAO_WORKER = 'v41';

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
    getyourguide_key_definida: ((env.GETYOURGUIDE_KEY || '').trim().length > 0),
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

/* /voos: tarifas reais registadas pela Aviasales para datas exactas.
   Usa-se «prices_for_dates» (v3), que devolve uma lista de tarifas com
   companhia, escalas, duração e ligação directa à reserva. O antigo
   «prices/cheap» só devolvia a mais barata por número de escalas (no
   máximo três linhas) e vinha vazio em muitas rotas, o que fazia o site
   cair nas estimativas sem se perceber porquê; fica como recurso, para
   nunca se perder o que ele ainda apanhe. */
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
  const ligacao = caminho => {
    if(!caminho) return '';
    const u = 'https://www.aviasales.com' + caminho;
    return marker ? u + (u.includes('?') ? '&' : '?') + 'marker=' + marker : u;
  };

  const tentativas = [];

  /* 1.ª escolha: lista completa de tarifas para as datas pedidas */
  const psV3 = new URLSearchParams({
    origin: q.get('origem'),
    destination: q.get('destino'),
    departure_at: q.get('ida'),
    currency: 'eur',
    sorting: 'price',
    unique: 'false',
    limit: '30',
    one_way: q.get('volta') ? 'false' : 'true',
    token
  });
  if(q.get('volta')) psV3.set('return_at', q.get('volta'));
  try{
    const r = await fetch(TP + '/aviasales/v3/prices_for_dates?' + psV3,
      {headers:{'X-Access-Token': token}, cf:{cacheTtl: 1800, cacheEverything: true}});
    if(!r.ok){
      tentativas.push('prices_for_dates: ' + r.status);
    }else{
      const j = await r.json();
      const dados = Array.isArray(j.data) ? j.data : [];
      const ofertas = dados.map(v => ({
        preco: Math.round(v.price * pax),
        companhia: nomes[v.airline] || v.airline || '',
        escalas: +v.transfers || 0,
        duracao: duracaoTexto(v.duration),
        partida: String(v.departure_at || '').slice(11, 16),
        url: ligacao(v.link)
      })).filter(o => o.preco > 0).sort((a, b) => a.preco - b.preco);
      if(ofertas.length)
        return resposta({ofertas, classe:'economica', fonte:'travelpayouts/prices_for_dates'});
      tentativas.push('prices_for_dates: sem tarifas');
    }
  }catch(e){ tentativas.push('prices_for_dates: ' + String(e.message || e)); }

  /* recurso: a tarifa mais barata por número de escalas */
  const ps = new URLSearchParams({
    origin: q.get('origem'),
    destination: q.get('destino'),
    depart_date: q.get('ida'),
    currency: 'eur',
    token
  });
  if(q.get('volta')) ps.set('return_date', q.get('volta'));
  const r = await fetch(TP + '/v1/prices/cheap?' + ps,
    {headers:{'X-Access-Token': token}, cf:{cacheTtl: 1800, cacheEverything: true}});
  if(!r.ok){
    tentativas.push('prices/cheap: ' + r.status);
    return resposta({ofertas:[], fonte:'travelpayouts', nota: tentativas.join(' · ')}, 200, true);
  }
  const j = await r.json();
  const porDestino = (j.data && j.data[q.get('destino')]) || {};
  const ofertas = Object.entries(porDestino).map(([escalas, v]) => ({
    preco: Math.round(v.price * pax),
    companhia: nomes[v.airline] || v.airline,
    escalas: +escalas,
    duracao: '',
    partida: (v.departure_at || '').slice(11, 16),
    url: ''
  })).sort((a, b) => a.preco - b.preco);
  /* a Travelpayouts só devolve tarifas de pesquisas reais recentes: em rotas
     ou datas sem procura, vem vazio. Convém dizê-lo, em vez de o site ficar
     silenciosamente nas estimativas sem se perceber porquê. */
  if(!ofertas.length) tentativas.push('prices/cheap: sem tarifas');
  const nota = ofertas.length ? undefined
    : tentativas.join(' · ') + ' — a Travelpayouts só tem tarifas de pesquisas reais recentes';
  return resposta({ofertas, classe:'economica', fonte:'travelpayouts/cheap', nota});
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

/* /actividades: preços reais de passeios e bilhetes via GetYourGuide
   Partner API. Sem chave definida, devolve lista vazia e o site mostra
   apenas a ligação ao parceiro, sem inventar preços. */
async function actividades(url, env){
  const q = url.searchParams;
  const cidade = q.get('cidade');
  if(!cidade) return resposta({erro:'parâmetro necessário: cidade'}, 400);
  const chave = (env.GETYOURGUIDE_KEY || '').trim();
  if(!chave) return resposta({ofertas:[], fonte:'getyourguide', nota:'GETYOURGUIDE_KEY não definido no Worker (ver /estado)'}, 200, true);
  try{
    const ps = new URLSearchParams({q: cidade, cnt: '8', currency: 'EUR', lang: 'pt'});
    const r = await fetch('https://api.getyourguide.com/1/tours?' + ps, {
      headers:{'Accept':'application/json', 'X-ACCESS-TOKEN': chave}
    });
    if(!r.ok) return resposta({ofertas:[], fonte:'getyourguide', nota:'indisponível (' + r.status + ')'}, 200, true);
    const j = await r.json();
    const itens = (j && (j.data && j.data.tours || j.tours)) || [];
    const ofertas = itens.map(t => ({
      nome: t.title || t.name || 'Actividade',
      preco: Math.round(precoNumero(t.price && (t.price.values && t.price.values.amount || t.price.amount)) || 0),
      url: t.url || t.deeplink || ''
    })).filter(o => o.preco > 0).slice(0, 6);
    const extra = ofertas.length ? {} : {_amostra: itens[0] || null, _total: itens.length};
    return resposta(Object.assign({ofertas, fonte:'getyourguide'}, extra));
  }catch(e){
    return resposta({ofertas:[], fonte:'getyourguide', erro:String(e.message || e)}, 200, true);
  }
}

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
      if(url.pathname === '/actividades') return await actividades(url, env);
      if(url.pathname === '/assistente') return await assistente(pedido, env);
      if(url.pathname === '/modelos') return await modelos(env);
      if(url.pathname === '/estado') return await estado(env);
      return resposta({erro:'rotas disponíveis: /voos, /hoteis, /casas, /actividades, /assistente, /modelos, /estado'}, 404);
    }catch(e){
      return resposta({erro: String(e.message || e)}, 500);
    }
  }
};
