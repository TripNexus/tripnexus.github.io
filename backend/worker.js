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

function resposta(corpo, estado){
  return new Response(JSON.stringify(corpo), {
    status: estado || 200,
    headers:{
      'Content-Type':'application/json; charset=utf-8',
      'Access-Control-Allow-Origin':'*',
      'Cache-Control':'public, max-age=600'
    }
  });
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
  const ps = new URLSearchParams({
    origin: q.get('origem'),
    destination: q.get('destino'),
    depart_date: q.get('ida'),
    currency: 'eur'
  });
  if(q.get('volta')) ps.set('return_date', q.get('volta'));
  const r = await fetch(TP + '/v1/prices/cheap?' + ps, {headers:{'X-Access-Token': env.TP_TOKEN}});
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

/* /hoteis: preços reais de hotéis via Hotellook (cidade por nome). */
async function hoteis(url, env){
  const q = url.searchParams;
  if(!q.get('cidade') || !q.get('checkin') || !q.get('checkout'))
    return resposta({erro:'parâmetros necessários: cidade (nome), checkin, checkout'}, 400);
  const ps = new URLSearchParams({
    location: q.get('cidade'),
    checkIn: q.get('checkin'),
    checkOut: q.get('checkout'),
    adults: q.get('adultos') || '2',
    currency: 'eur',
    limit: '15'
  });
  if(env.TP_TOKEN) ps.set('token', env.TP_TOKEN);
  const r = await fetch('https://engine.hotellook.com/api/v2/cache.json?' + ps);
  if(!r.ok) return resposta({erro:'Hotellook devolveu ' + r.status}, 502);
  const j = await r.json();
  const ofertas = (Array.isArray(j) ? j : [])
    .filter(h => h.priceFrom > 0)
    .map(h => ({nome: h.hotelName, preco: Math.round(+h.priceFrom), estrelas: h.stars || 0}))
    .sort((a, b) => a.preco - b.preco);
  return resposta({ofertas, fonte:'hotellook'});
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
      return resposta({erro:'rotas disponíveis: /voos, /hoteis'}, 404);
    }catch(e){
      return resposta({erro: String(e.message || e)}, 500);
    }
  }
};
