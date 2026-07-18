/* ═══════════════════════════════════════════════════════════════
   TripNexus: backend de preços em tempo real (Cloudflare Worker)
   Intermediário seguro entre o site e a API Amadeus Self-Service:
   guarda as credenciais no servidor, faz cache das respostas e
   devolve JSON simples que o site consome (assets/js/live.js).
   Instruções de instalação: backend/README.md
   ═══════════════════════════════════════════════════════════════ */

const AMADEUS = 'https://test.api.amadeus.com';   // em produção: https://api.amadeus.com

let tokenCache = {valor:null, expira:0};

async function obterToken(env){
  if(tokenCache.valor && Date.now() < tokenCache.expira - 30000) return tokenCache.valor;
  const r = await fetch(AMADEUS + '/v1/security/oauth2/token', {
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type:'client_credentials',
      client_id: env.AMADEUS_ID,
      client_secret: env.AMADEUS_SECRET
    })
  });
  if(!r.ok) throw new Error('autenticação Amadeus falhou (' + r.status + ')');
  const j = await r.json();
  tokenCache = {valor: j.access_token, expira: Date.now() + (j.expires_in || 1799) * 1000};
  return tokenCache.valor;
}

const CLASSES = {economica:'ECONOMY', premium:'PREMIUM_ECONOMY', executiva:'BUSINESS', primeira:'FIRST'};

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

/* PT2H35M → 2h35 */
function duracaoLegivel(iso){
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso || '');
  return m ? (m[1] || 0) + 'h' + String(m[2] || 0).padStart(2, '0') : '';
}

async function voos(url, env){
  const q = url.searchParams;
  for(const p of ['origem','destino','ida'])
    if(!q.get(p)) return resposta({erro:'falta o parâmetro ' + p}, 400);
  const token = await obterToken(env);
  const ps = new URLSearchParams({
    originLocationCode: q.get('origem'),
    destinationLocationCode: q.get('destino'),
    departureDate: q.get('ida'),
    adults: q.get('adultos') || '1',
    travelClass: CLASSES[q.get('classe')] || 'ECONOMY',
    currencyCode: 'EUR',
    max: '20'
  });
  if(q.get('volta')) ps.set('returnDate', q.get('volta'));
  if(+q.get('criancas')) ps.set('children', q.get('criancas'));
  const r = await fetch(AMADEUS + '/v2/shopping/flight-offers?' + ps, {headers:{Authorization:'Bearer ' + token}});
  if(!r.ok) return resposta({erro:'Amadeus devolveu ' + r.status}, 502);
  const j = await r.json();
  const nomes = (j.dictionaries && j.dictionaries.carriers) || {};
  const ofertas = (j.data || []).map(of => {
    const it = of.itineraries[0], segs = it.segments;
    const codigo = (of.validatingAirlineCodes && of.validatingAirlineCodes[0]) || segs[0].carrierCode;
    return {
      preco: +of.price.grandTotal,
      companhia: nomes[codigo] || codigo,
      escalas: segs.length - 1,
      duracao: duracaoLegivel(it.duration),
      partida: (segs[0].departure.at || '').slice(11, 16)
    };
  }).sort((a, b) => a.preco - b.preco);
  return resposta({ofertas});
}

async function hoteis(url, env){
  const q = url.searchParams;
  if(!q.get('cidade') || !q.get('checkin') || !q.get('checkout'))
    return resposta({erro:'parâmetros necessários: cidade (código IATA), checkin, checkout'}, 400);
  const token = await obterToken(env);
  const l = await fetch(AMADEUS + '/v1/reference-data/locations/hotels/by-city?cityCode=' + q.get('cidade') + '&radius=15&radiusUnit=KM',
    {headers:{Authorization:'Bearer ' + token}});
  if(!l.ok) return resposta({erro:'Amadeus devolveu ' + l.status}, 502);
  const ids = ((await l.json()).data || []).slice(0, 25).map(h => h.hotelId);
  if(!ids.length) return resposta({ofertas:[]});
  const ps = new URLSearchParams({
    hotelIds: ids.join(','),
    checkInDate: q.get('checkin'),
    checkOutDate: q.get('checkout'),
    adults: q.get('adultos') || '2',
    currency: 'EUR',
    bestRateOnly: 'true'
  });
  const r = await fetch(AMADEUS + '/v3/shopping/hotel-offers?' + ps, {headers:{Authorization:'Bearer ' + token}});
  if(!r.ok) return resposta({erro:'Amadeus devolveu ' + r.status}, 502);
  const j = await r.json();
  const ofertas = (j.data || [])
    .filter(h => h.offers && h.offers.length)
    .map(h => ({nome: h.hotel.name, preco: +h.offers[0].price.total}))
    .sort((a, b) => a.preco - b.preco);
  return resposta({ofertas});
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
