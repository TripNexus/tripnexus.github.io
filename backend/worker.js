/* ═══════════════════════════════════════════════════════════════
   TripNexus: backend de preços em tempo real (Cloudflare Worker)
   Intermediário seguro entre o site e a API Travelpayouts/Aviasales
   (voos): guarda o token no servidor, faz cache das respostas e
   devolve JSON simples que o site consome (assets/js/live.js).
   Hotéis via SerpApi (motor google_hotels), com chave gratuita (100
   pesquisas/mês); acima disso, ou sem chave, o site cai nas estimativas
   locais, sem erro visível.
   Nota: a Amadeus descontinuou o portal Self-Service a 17/07/2026,
   pelo que este Worker usa a Travelpayouts, de registo gratuito.
   Instruções de instalação: backend/README.md
   ═══════════════════════════════════════════════════════════════ */

const TP = 'https://api.travelpayouts.com';

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
  const info = {
    token_definido: token.length > 0,
    token_tamanho: token.length,
    serpapi_key_definida: ((env.SERPAPI_KEY || '').trim().length > 0),
    workers_ai_ligado: !!env.AI
  };
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

/* /voos: tarifas reais registadas pela Aviasales para datas exactas.
   Os dados são de pesquisas reais recentes (até 48 h), em classe económica. */
async function voos(url, env){
  const q = url.searchParams;
  for(const p of ['origem','destino','ida'])
    if(!q.get(p)) return resposta({erro:'falta o parâmetro ' + p}, 400);
  const token = obterToken(env);
  if(!token) return resposta({erro:'TP_TOKEN não definido no Worker (ver /estado)'}, 500);
  const ps = new URLSearchParams({
    origin: q.get('origem'),
    destination: q.get('destino'),
    depart_date: q.get('ida'),
    currency: 'eur',
    token
  });
  if(q.get('volta')) ps.set('return_date', q.get('volta'));
  const r = await fetch(TP + '/v1/prices/cheap?' + ps, {headers:{'X-Access-Token': token}});
  if(!r.ok) return resposta({erro:'Travelpayouts devolveu ' + r.status}, 502);
  const j = await r.json();
  const nomes = await nomesCompanhias();
  const porDestino = (j.data && j.data[q.get('destino')]) || {};
  /* total para o grupo: adultos por inteiro, crianças a 75 % */
  const pax = Math.max(1, (+q.get('adultos') || 1) + (+q.get('criancas') || 0) * 0.75);
  const ofertas = Object.entries(porDestino).map(([escalas, v]) => ({
    preco: Math.round(v.price * pax),
    companhia: nomes[v.airline] || v.airline,
    escalas: +escalas,
    duracao: '',
    partida: (v.departure_at || '').slice(11, 16)
  })).sort((a, b) => a.preco - b.preco);
  return resposta({ofertas, classe:'economica', fonte:'travelpayouts'});
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
   chave gratuita (100 pesquisas/mês). Falha sempre de forma graciosa
   (ofertas vazias) para o site cair nas estimativas locais, sem erro
   visível para o utilizador. */
async function hoteis(url, env){
  const q = url.searchParams;
  const cidade = q.get('cidade'), checkin = q.get('checkin'), checkout = q.get('checkout');
  const adultos = String(q.get('adultos') || 2);
  if(!cidade || !checkin || !checkout)
    return resposta({erro:'parâmetros necessários: cidade (nome), checkin, checkout (AAAA-MM-DD)'}, 400);
  const chave = (env.SERPAPI_KEY || '').trim();
  if(!chave) return resposta({ofertas:[], fonte:'serpapi', nota:'SERPAPI_KEY não definido no Worker (ver /estado)'}, 200, true);
  const ps = new URLSearchParams({
    engine: 'google_hotels',
    q: cidade + ' hotels',
    check_in_date: checkin,
    check_out_date: checkout,
    adults: adultos,
    currency: 'EUR',
    hl: 'pt',
    gl: 'pt',
    api_key: chave
  });
  try{
    const r = await fetch('https://serpapi.com/search.json?' + ps);
    if(!r.ok) return resposta({ofertas:[], fonte:'serpapi', nota:'preços indisponíveis (' + r.status + ')'}, 200, true);
    const j = await r.json();
    if(j.error) return resposta({ofertas:[], fonte:'serpapi', nota: String(j.error)}, 200, true);
    const props = Array.isArray(j.properties) ? j.properties : [];
    const precoDe = p => {
      const rn = p.rate_per_night || {};
      return (+rn.extracted_lowest) || precoNumero(rn.lowest) || precoNumero(p.total_rate && p.total_rate.lowest) || 0;
    };
    const ofertas = props.map(p => ({
      nome: p.name || 'Hotel',
      preco: Math.round(precoDe(p)),
      estrelas: Math.round(+p.extracted_hotel_class || +p.hotel_class || 0)
    })).filter(o => o.preco > 0).sort((a, b) => a.preco - b.preco).slice(0, 8);
    const extra = ofertas.length ? {} : {_amostra: props[0] || null, _total: props.length};
    return resposta(Object.assign({ofertas, fonte:'serpapi'}, extra));
  }catch(e){
    return resposta({ofertas:[], fonte:'serpapi', erro:String(e.message || e)}, 200, true);
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
  '@cf/zai-org/glm-4.7-flash',
  '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  '@cf/meta/llama-4-scout-17b-16e-instruct',
  '@cf/mistralai/mistral-small-3.1-24b-instruct',
  '@cf/openai/gpt-oss-20b',
  '@cf/google/gemma-3-12b-it',
  '@cf/qwen/qwen2.5-14b-instruct',
  '@cf/meta/llama-3.1-8b-instruct'
];
let modeloBom = null;   /* modelo que respondeu da última vez */
const INSTRUCOES_IA = [
  'És o assistente do TripNexus, um comparador de viagens português.',
  'Respondes SEMPRE em português de Portugal, com a ortografia ANTIGA (anterior ao Acordo Ortográfico):',
  'escreve «actual», «óptimo», «directo», «selecção», «objectivo», «contacto», «facto».',
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
      if(url.pathname === '/assistente') return await assistente(pedido, env);
      if(url.pathname === '/modelos') return await modelos(env);
      if(url.pathname === '/estado') return await estado(env);
      return resposta({erro:'rotas disponíveis: /voos, /hoteis, /assistente, /modelos, /estado'}, 404);
    }catch(e){
      return resposta({erro: String(e.message || e)}, 500);
    }
  }
};
