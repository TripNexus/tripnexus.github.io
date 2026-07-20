/* ═══════════════════════════════════════════════════════════════
   TripNexus: backend de preços em tempo real (Cloudflare Worker)
   Intermediário seguro entre o site e a API Travelpayouts/Aviasales
   (voos): guarda o token no servidor, faz cache das respostas e
   devolve JSON simples que o site consome (assets/js/live.js).
   Hotéis via Makcorps (comparação de tarifas de vários sites, plano
   gratuito com chave); se indisponível, o site cai nas estimativas locais.
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
    makcorps_token_definido: ((env.MAKCORPS_TOKEN || '').trim().length > 0)
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
  /* remove separadores de milhar; mantém o último ponto/vírgula como decimal */
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

/* /hoteis: preços reais de hotéis via Makcorps (comparação de tarifas de
   vários sites, plano gratuito com chave). Fluxo: /mapping resolve a cidade
   num cityid, /city devolve os hotéis com os preços de cada fornecedor.
   Falha sempre de forma graciosa (ofertas vazias) para o site cair nas
   estimativas locais, sem erro visível para o utilizador. */
async function hoteis(url, env){
  const q = url.searchParams;
  const cidade = q.get('cidade'), checkin = q.get('checkin'), checkout = q.get('checkout');
  const adultos = String(q.get('adultos') || 2);
  if(!cidade || !checkin || !checkout)
    return resposta({erro:'parâmetros necessários: cidade (nome), checkin, checkout (AAAA-MM-DD)'}, 400);
  const chave = (env.MAKCORPS_TOKEN || '').trim();
  if(!chave) return resposta({ofertas:[], fonte:'makcorps', nota:'MAKCORPS_TOKEN não definido no Worker (ver /estado)'}, 200, true);
  const M = 'https://api.makcorps.com';
  const lista = x => Array.isArray(x) ? x : (x && (x.details || x.result || x.data || x.hotels)) || [];
  try{
    /* 1) cidade -> cityid (Mapping API) */
    const mp = await fetch(M + '/mapping?api_key=' + encodeURIComponent(chave) + '&name=' + encodeURIComponent(cidade), {headers:{'Accept':'application/json'}});
    if(!mp.ok) return resposta({ofertas:[], fonte:'makcorps', nota:'mapping indisponível (' + mp.status + ')'}, 200, true);
    const itens = lista(await mp.json());
    let cityid = null;
    for(const it of itens){                       /* preferir entradas de tipo cidade/GEO */
      const tipo = String(it.type || it.category || '').toUpperCase();
      if(tipo.includes('GEO') || tipo.includes('CITY')){ cityid = it.document_id || it.cityid || it.id; break; }
    }
    if(!cityid && itens.length){ const f = itens[0]; cityid = f.document_id || f.cityid || f.id; }
    if(!cityid) return resposta({ofertas:[], fonte:'makcorps', nota:'cidade não encontrada', _amostra: itens[0] || null}, 200, true);
    /* 2) hotéis + preços dos fornecedores (City API) */
    const ps = new URLSearchParams({cityid: String(cityid), pagination:'0', cur:'EUR', rooms:'1', adults: adultos, checkin, checkout, api_key: chave});
    const r = await fetch(M + '/city?' + ps, {headers:{'Accept':'application/json'}});
    if(!r.ok) return resposta({ofertas:[], fonte:'makcorps', cityid, nota:'preços indisponíveis (' + r.status + ')'}, 200, true);
    const hoteis = lista(await r.json());
    const ofertas = [];
    for(const h of hoteis){
      if(!h || typeof h !== 'object') continue;
      const nome = h.name || h.hotelName || h.hotel_name;
      if(!nome) continue;                          /* ignora o rodapé de metadados da página */
      let melhor = Infinity, vendedor = '';
      for(const k of Object.keys(h)){              /* pares vendorN / priceN */
        if(/^price\d+$/i.test(k)){
          const p = precoNumero(h[k]);
          if(p > 0 && p < melhor){ melhor = p; vendedor = h['vendor' + k.replace(/\D/g, '')] || ''; }
        }
      }
      if(melhor === Infinity){                      /* variantes: campo único de preço */
        const p = precoNumero(h.price || h.min_price || h.priceFrom);
        if(p > 0) melhor = p;
      }
      if(melhor === Infinity) continue;
      const rev = h.reviews || h.review_summary || {};
      ofertas.push({
        nome,
        preco: Math.round(melhor),
        estrelas: Math.round(parseFloat(rev.rating || h.rating || h.stars || 0) || 0),
        vendedor: String(vendedor || '')
      });
    }
    ofertas.sort((a, b) => a.preco - b.preco);
    const extra = ofertas.length ? {} : {_amostra: hoteis[0] || null, _total: hoteis.length};
    return resposta(Object.assign({ofertas: ofertas.slice(0, 8), fonte:'makcorps', cityid}, extra));
  }catch(e){
    return resposta({ofertas:[], fonte:'makcorps', erro:String(e.message || e)}, 200, true);
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
