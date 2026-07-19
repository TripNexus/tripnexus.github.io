/* ═══════════════════════════════════════════════════════════════
   TripNexus: backend de preços em tempo real (Cloudflare Worker)
   Intermediário seguro entre o site e a API Travelpayouts/Aviasales
   (voos) e Hotellook (hotéis): guarda o token no servidor, faz
   cache das respostas e devolve JSON simples que o site consome
   (assets/js/live.js).
   Nota: a Amadeus descontinuou o portal Self-Service a 17/07/2026,
   pelo que este Worker usa a Travelpayouts, de registo gratuito.
   Instruções de instalação: backend/README.md
   ═══════════════════════════════════════════════════════════════ */

const TP = 'https://api.travelpayouts.com';
const TRAVELPAYOUTS_MARKER = '552141';   // marker de afiliado (atribui comissão)

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
    token_tamanho: token.length
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

/* /hoteis: preços reais de hotéis via Hotellook.
   A Hotellook não reconhece bem a cidade por nome (devolve 404), por isso
   resolvemos primeiro o nome num locationId e só depois pedimos os preços.
   Falha sempre de forma graciosa (ofertas vazias) para o site cair nas
   estimativas em vez de mostrar um erro. */
async function hoteis(url, env){
  const q = url.searchParams;
  const cidade = q.get('cidade'), checkin = q.get('checkin'), checkout = q.get('checkout');
  if(!cidade || !checkin || !checkout)
    return resposta({erro:'parâmetros necessários: cidade (nome), checkin, checkout (AAAA-MM-DD)'}, 400);
  const token = obterToken(env);
  try{
    /* 1) resolver a cidade num locationId */
    let locationId = null;
    const lk = await fetch('https://engine.hotellook.com/api/v2/lookup.json?query=' +
      encodeURIComponent(cidade) + '&lang=pt&lookFor=city&limit=1' + (token ? '&token=' + token : ''));
    if(lk.ok){
      const lj = await lk.json();
      const loc = lj && lj.results && lj.results.locations && lj.results.locations[0];
      if(loc) locationId = loc.id;
    }
    /* 2) preços em cache (por locationId; recurso ao nome) */
    const ps = new URLSearchParams({checkIn: checkin, checkOut: checkout,
      adults: q.get('adultos') || '2', currency: 'eur', limit: '20'});
    if(locationId) ps.set('locationId', locationId); else ps.set('location', cidade);
    if(token) ps.set('token', token);
    if(TRAVELPAYOUTS_MARKER) ps.set('marker', TRAVELPAYOUTS_MARKER);
    const r = await fetch('https://engine.hotellook.com/api/v2/cache.json?' + ps);
    if(!r.ok) return resposta({ofertas:[], fonte:'hotellook', nota:'sem cache para estas datas (' + r.status + ')'}, 200, true);
    const j = await r.json();
    const ofertas = (Array.isArray(j) ? j : [])
      .filter(h => h.priceFrom > 0)
      .map(h => ({nome: h.hotelName, preco: Math.round(+h.priceFrom), estrelas: h.stars || 0}))
      .sort((a, b) => a.preco - b.preco);
    return resposta({ofertas, fonte:'hotellook', locationId, versao:'v2-lookup'});
  }catch(e){
    return resposta({ofertas:[], fonte:'hotellook', erro:String(e.message || e)}, 200, true);
  }
}

export default {
  async fetch(pedido, env){
    if(pedido.method === 'OPTIONS')
      return new Response(null, {headers:{
        'Access-Control-Allow-Origin':'*',
        'Access-Control-Allow-Methods':'GET, OPTIONS',
        'Access-Control-Allow-Headers':'*'
      }});
    const url = new URL(pedido.url);
    try{
      if(url.pathname === '/voos') return await voos(url, env);
      if(url.pathname === '/hoteis') return await hoteis(url, env);
      if(url.pathname === '/estado') return await estado(env);
      return resposta({erro:'rotas disponíveis: /voos, /hoteis, /estado'}, 404);
    }catch(e){
      return resposta({erro: String(e.message || e)}, 500);
    }
  }
};
