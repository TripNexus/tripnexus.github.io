/* ═══════════════════════════════════════════════════════════════
   TripNexus: dados: cidades, parceiros e cupões
   ═══════════════════════════════════════════════════════════════ */

/* Cidades disponíveis no autocomplete (nome, país, bandeira, IATA, lat, lng,
   índice de custo local de 0.6 a 1.6 usado nas estimativas de alojamento). */
const CIDADES = [
  {n:'Lisboa',        p:'Portugal',        f:'🇵🇹', i:'LIS', la:38.716, lo:-9.139, c:1.00},
  {n:'Porto',         p:'Portugal',        f:'🇵🇹', i:'OPO', la:41.149, lo:-8.611, c:0.92},
  {n:'Faro',          p:'Portugal',        f:'🇵🇹', i:'FAO', la:37.019, lo:-7.930, c:0.95},
  {n:'Funchal',       p:'Portugal',        f:'🇵🇹', i:'FNC', la:32.650, lo:-16.908,c:0.95},
  {n:'Ponta Delgada', p:'Portugal',        f:'🇵🇹', i:'PDL', la:37.741, lo:-25.680,c:0.88},
  {n:'Madrid',        p:'Espanha',         f:'🇪🇸', i:'MAD', la:40.417, lo:-3.703, c:1.05},
  {n:'Barcelona',     p:'Espanha',         f:'🇪🇸', i:'BCN', la:41.385, lo: 2.173, c:1.10},
  {n:'Sevilha',       p:'Espanha',         f:'🇪🇸', i:'SVQ', la:37.389, lo:-5.984, c:0.95},
  {n:'Málaga',        p:'Espanha',         f:'🇪🇸', i:'AGP', la:36.721, lo:-4.421, c:0.98},
  {n:'Valência',      p:'Espanha',         f:'🇪🇸', i:'VLC', la:39.470, lo:-0.377, c:0.96},
  {n:'Palma de Maiorca',p:'Espanha',       f:'🇪🇸', i:'PMI', la:39.570, lo: 2.650, c:1.08},
  {n:'Ibiza',         p:'Espanha',         f:'🇪🇸', i:'IBZ', la:38.907, lo: 1.420, c:1.25},
  {n:'Tenerife',      p:'Espanha',         f:'🇪🇸', i:'TFS', la:28.044, lo:-16.572,c:1.00},
  {n:'Paris',         p:'França',          f:'🇫🇷', i:'CDG', la:48.857, lo: 2.352, c:1.35},
  {n:'Nice',          p:'França',          f:'🇫🇷', i:'NCE', la:43.710, lo: 7.262, c:1.25},
  {n:'Lyon',          p:'França',          f:'🇫🇷', i:'LYS', la:45.764, lo: 4.836, c:1.10},
  {n:'Marselha',      p:'França',          f:'🇫🇷', i:'MRS', la:43.296, lo: 5.370, c:1.05},
  {n:'Londres',       p:'Reino Unido',     f:'🇬🇧', i:'LHR', la:51.507, lo:-0.128, c:1.45},
  {n:'Manchester',    p:'Reino Unido',     f:'🇬🇧', i:'MAN', la:53.481, lo:-2.242, c:1.10},
  {n:'Edimburgo',     p:'Reino Unido',     f:'🇬🇧', i:'EDI', la:55.953, lo:-3.188, c:1.15},
  {n:'Dublin',        p:'Irlanda',         f:'🇮🇪', i:'DUB', la:53.349, lo:-6.260, c:1.30},
  {n:'Roma',          p:'Itália',          f:'🇮🇹', i:'FCO', la:41.903, lo:12.496, c:1.15},
  {n:'Milão',         p:'Itália',          f:'🇮🇹', i:'MXP', la:45.464, lo: 9.190, c:1.20},
  {n:'Veneza',        p:'Itália',          f:'🇮🇹', i:'VCE', la:45.440, lo:12.316, c:1.30},
  {n:'Nápoles',       p:'Itália',          f:'🇮🇹', i:'NAP', la:40.852, lo:14.268, c:0.98},
  {n:'Florença',      p:'Itália',          f:'🇮🇹', i:'FLR', la:43.770, lo:11.258, c:1.20},
  {n:'Berlim',        p:'Alemanha',        f:'🇩🇪', i:'BER', la:52.520, lo:13.405, c:1.15},
  {n:'Munique',       p:'Alemanha',        f:'🇩🇪', i:'MUC', la:48.135, lo:11.582, c:1.25},
  {n:'Frankfurt',     p:'Alemanha',        f:'🇩🇪', i:'FRA', la:50.110, lo: 8.682, c:1.18},
  {n:'Hamburgo',      p:'Alemanha',        f:'🇩🇪', i:'HAM', la:53.551, lo: 9.994, c:1.15},
  {n:'Amesterdão',    p:'Países Baixos',   f:'🇳🇱', i:'AMS', la:52.370, lo: 4.895, c:1.40},
  {n:'Bruxelas',      p:'Bélgica',         f:'🇧🇪', i:'BRU', la:50.850, lo: 4.352, c:1.15},
  {n:'Zurique',       p:'Suíça',           f:'🇨🇭', i:'ZRH', la:47.377, lo: 8.541, c:1.60},
  {n:'Genebra',       p:'Suíça',           f:'🇨🇭', i:'GVA', la:46.204, lo: 6.143, c:1.55},
  {n:'Viena',         p:'Áustria',         f:'🇦🇹', i:'VIE', la:48.208, lo:16.374, c:1.15},
  {n:'Praga',         p:'Chéquia',         f:'🇨🇿', i:'PRG', la:50.075, lo:14.438, c:0.85},
  {n:'Budapeste',     p:'Hungria',         f:'🇭🇺', i:'BUD', la:47.498, lo:19.040, c:0.80},
  {n:'Varsóvia',      p:'Polónia',         f:'🇵🇱', i:'WAW', la:52.230, lo:21.012, c:0.78},
  {n:'Cracóvia',      p:'Polónia',         f:'🇵🇱', i:'KRK', la:50.065, lo:19.945, c:0.75},
  {n:'Atenas',        p:'Grécia',          f:'🇬🇷', i:'ATH', la:37.984, lo:23.728, c:0.92},
  {n:'Santorini',     p:'Grécia',          f:'🇬🇷', i:'JTR', la:36.399, lo:25.479, c:1.30},
  {n:'Zagreb',        p:'Croácia',         f:'🇭🇷', i:'ZAG', la:45.815, lo:15.982, c:0.85},
  {n:'Dubrovnik',     p:'Croácia',         f:'🇭🇷', i:'DBV', la:42.650, lo:18.094, c:1.15},
  {n:'Copenhaga',     p:'Dinamarca',       f:'🇩🇰', i:'CPH', la:55.676, lo:12.568, c:1.45},
  {n:'Estocolmo',     p:'Suécia',          f:'🇸🇪', i:'ARN', la:59.329, lo:18.069, c:1.35},
  {n:'Oslo',          p:'Noruega',         f:'🇳🇴', i:'OSL', la:59.913, lo:10.752, c:1.50},
  {n:'Helsínquia',    p:'Finlândia',       f:'🇫🇮', i:'HEL', la:60.170, lo:24.938, c:1.30},
  {n:'Reiquiavique',  p:'Islândia',        f:'🇮🇸', i:'KEF', la:64.147, lo:-21.943,c:1.55},
  {n:'Istambul',      p:'Turquia',         f:'🇹🇷', i:'IST', la:41.008, lo:28.978, c:0.70},
  {n:'Marraquexe',    p:'Marrocos',        f:'🇲🇦', i:'RAK', la:31.630, lo:-7.981, c:0.60},
  {n:'Casablanca',    p:'Marrocos',        f:'🇲🇦', i:'CMN', la:33.573, lo:-7.590, c:0.62},
  {n:'Cairo',         p:'Egipto',          f:'🇪🇬', i:'CAI', la:30.044, lo:31.236, c:0.55},
  {n:'Dubai',         p:'Emiratos Árabes Unidos', f:'🇦🇪', i:'DXB', la:25.204, lo:55.271, c:1.30},
  {n:'Doha',          p:'Catar',           f:'🇶🇦', i:'DOH', la:25.285, lo:51.531, c:1.25},
  {n:'Nova Iorque',   p:'Estados Unidos',  f:'🇺🇸', i:'JFK', la:40.712, lo:-74.006,c:1.60},
  {n:'Miami',         p:'Estados Unidos',  f:'🇺🇸', i:'MIA', la:25.762, lo:-80.192,c:1.40},
  {n:'Los Angeles',   p:'Estados Unidos',  f:'🇺🇸', i:'LAX', la:34.052, lo:-118.244,c:1.50},
  {n:'São Francisco', p:'Estados Unidos',  f:'🇺🇸', i:'SFO', la:37.775, lo:-122.419,c:1.60},
  {n:'Orlando',       p:'Estados Unidos',  f:'🇺🇸', i:'MCO', la:28.538, lo:-81.379,c:1.25},
  {n:'Boston',        p:'Estados Unidos',  f:'🇺🇸', i:'BOS', la:42.360, lo:-71.059,c:1.45},
  {n:'Toronto',       p:'Canadá',          f:'🇨🇦', i:'YYZ', la:43.653, lo:-79.383,c:1.30},
  {n:'Montreal',      p:'Canadá',          f:'🇨🇦', i:'YUL', la:45.502, lo:-73.567,c:1.20},
  {n:'São Paulo',     p:'Brasil',          f:'🇧🇷', i:'GRU', la:-23.551,lo:-46.633,c:0.80},
  {n:'Rio de Janeiro',p:'Brasil',          f:'🇧🇷', i:'GIG', la:-22.907,lo:-43.173,c:0.85},
  {n:'Salvador',      p:'Brasil',          f:'🇧🇷', i:'SSA', la:-12.977,lo:-38.502,c:0.70},
  {n:'Recife',        p:'Brasil',          f:'🇧🇷', i:'REC', la:-8.058, lo:-34.883,c:0.68},
  {n:'Fortaleza',     p:'Brasil',          f:'🇧🇷', i:'FOR', la:-3.732, lo:-38.527,c:0.66},
  {n:'Cidade do México',p:'México',        f:'🇲🇽', i:'MEX', la:19.433, lo:-99.133,c:0.75},
  {n:'Cancún',        p:'México',          f:'🇲🇽', i:'CUN', la:21.161, lo:-86.851,c:1.05},
  {n:'Bogotá',        p:'Colômbia',        f:'🇨🇴', i:'BOG', la:4.711,  lo:-74.072,c:0.65},
  {n:'Buenos Aires',  p:'Argentina',       f:'🇦🇷', i:'EZE', la:-34.604,lo:-58.382,c:0.70},
  {n:'Santiago',      p:'Chile',           f:'🇨🇱', i:'SCL', la:-33.449,lo:-70.669,c:0.80},
  {n:'Lima',          p:'Peru',            f:'🇵🇪', i:'LIM', la:-12.046,lo:-77.043,c:0.65},
  {n:'Tóquio',        p:'Japão',           f:'🇯🇵', i:'NRT', la:35.677, lo:139.650,c:1.25},
  {n:'Osaka',         p:'Japão',           f:'🇯🇵', i:'KIX', la:34.694, lo:135.502,c:1.15},
  {n:'Pequim',        p:'China',           f:'🇨🇳', i:'PEK', la:39.904, lo:116.407,c:0.85},
  {n:'Xangai',        p:'China',           f:'🇨🇳', i:'PVG', la:31.230, lo:121.474,c:0.95},
  {n:'Hong Kong',     p:'China',           f:'🇭🇰', i:'HKG', la:22.320, lo:114.174,c:1.35},
  {n:'Seul',          p:'Coreia do Sul',   f:'🇰🇷', i:'ICN', la:37.567, lo:126.978,c:1.10},
  {n:'Banguecoque',   p:'Tailândia',       f:'🇹🇭', i:'BKK', la:13.756, lo:100.502,c:0.55},
  {n:'Phuket',        p:'Tailândia',       f:'🇹🇭', i:'HKT', la:7.880,  lo: 98.392,c:0.65},
  {n:'Hanói',         p:'Vietname',        f:'🇻🇳', i:'HAN', la:21.028, lo:105.804,c:0.50},
  {n:'Singapura',     p:'Singapura',       f:'🇸🇬', i:'SIN', la:1.352,  lo:103.820,c:1.45},
  {n:'Kuala Lumpur',  p:'Malásia',         f:'🇲🇾', i:'KUL', la:3.139,  lo:101.687,c:0.60},
  {n:'Bali',          p:'Indonésia',       f:'🇮🇩', i:'DPS', la:-8.409, lo:115.189,c:0.60},
  {n:'Deli',          p:'Índia',           f:'🇮🇳', i:'DEL', la:28.614, lo:77.209, c:0.50},
  {n:'Bombaim',       p:'Índia',           f:'🇮🇳', i:'BOM', la:19.076, lo:72.878, c:0.55},
  {n:'Sydney',        p:'Austrália',       f:'🇦🇺', i:'SYD', la:-33.869,lo:151.209,c:1.40},
  {n:'Melbourne',     p:'Austrália',       f:'🇦🇺', i:'MEL', la:-37.814,lo:144.963,c:1.30},
  {n:'Auckland',      p:'Nova Zelândia',   f:'🇳🇿', i:'AKL', la:-36.849,lo:174.763,c:1.25},
  {n:'Cidade do Cabo',p:'África do Sul',   f:'🇿🇦', i:'CPT', la:-33.925,lo:18.424, c:0.75},
  {n:'Luanda',        p:'Angola',          f:'🇦🇴', i:'LAD', la:-8.839, lo:13.289, c:1.10},
  {n:'Maputo',        p:'Moçambique',      f:'🇲🇿', i:'MPM', la:-25.966,lo:32.573, c:0.75},
  {n:'Sal',           p:'Cabo Verde',      f:'🇨🇻', i:'SID', la:16.741, lo:-22.949,c:0.80},
  {n:'Praia',         p:'Cabo Verde',      f:'🇨🇻', i:'RAI', la:14.933, lo:-23.513,c:0.75}
];

/* Parceiros de comparação.
   dom  → domínio usado para obter o ícone oficial (favicon)
   cat  → categorias em que o parceiro é consultado
   fx   → factor típico de preço do parceiro (à volta de 1)
   cup  → cupões que o parceiro disponibiliza periodicamente
   url  → função que devolve a ligação de reserva */
const PARCEIROS = {
  google:      {nome:'Google Voos',   dom:'google.com',        cat:['voo'],            fx:0.97, desc:'O agregador mais rápido para comparar preços globais.'},
  googleHoteis:{nome:'Google Hotéis', dom:'google.com',        cat:['hotel'],          fx:0.98, desc:'Comparação global de hotéis do Google Travel.'},
  skyscanner:  {nome:'Skyscanner',    dom:'skyscanner.net',    cat:['voo','carro'],    fx:0.94, desc:'Comparação de voos, hotéis e aluguer de carros.'},
  kayak:       {nome:'Kayak',         dom:'kayak.com',         cat:['voo','hotel'],    fx:0.96, desc:'Compara centenas de sites de viagens em simultâneo.'},
  momondo:     {nome:'Momondo',       dom:'momondo.pt',        cat:['voo','hotel'],    fx:0.93, desc:'Excelente motor de busca visual para voos e hotéis.'},
  trivago:     {nome:'Trivago',       dom:'trivago.pt',        cat:['hotel'],          fx:0.95, desc:'Especialista na comparação de preços de hotéis.'},
  booking:     {nome:'Booking.com',   dom:'booking.com',       cat:['hotel'],          fx:1.00, desc:'A maior plataforma do mundo para reservas de alojamento.',
                cup:[{codigo:'GENIUS10',  tipo:'pct', valor:10, nota:'nível Genius'}]},
  expedia:     {nome:'Expedia',       dom:'expedia.pt',        cat:['voo','hotel','pacote','carro'], fx:1.02, desc:'Gigante americano dos pacotes voo + hotel + carro.',
                cup:[{codigo:'EXP8',      tipo:'pct', valor:8,  nota:'membros'}]},
  trip:        {nome:'Trip.com',      dom:'trip.com',          cat:['voo','hotel','comboio'], fx:0.95, desc:'Muito forte em rotas asiáticas e comboios internacionais.',
                cup:[{codigo:'TRIPVERAO', tipo:'pct', valor:7,  nota:'campanha de Verão'}]},
  edreams:     {nome:'eDreams',       dom:'edreams.pt',        cat:['voo','pacote'],   fx:0.92, desc:'Agência focada na venda de voos e pacotes de férias.',
                cup:[{codigo:'EDREAMS10', tipo:'pct', valor:10, nota:'clube Prime'}]},
  logitravel:  {nome:'Logitravel',    dom:'logitravel.com',    cat:['hotel','pacote'], fx:0.97, desc:'Especialista em pacotes turísticos, cruzeiros e hotéis de praia.',
                cup:[{codigo:'LOGI25',    tipo:'eur', valor:25, nota:'em reservas +250 €'}]},
  agoda:       {nome:'Agoda',         dom:'agoda.com',         cat:['hotel'],          fx:0.92, desc:'A melhor opção para encontrar alojamento na Ásia.',
                cup:[{codigo:'AGODAVIP',  tipo:'pct', valor:12, nota:'preços VIP'}]},
  airbnb:      {nome:'Airbnb',        dom:'airbnb.pt',         cat:['casa'],           fx:0.90, desc:'Líder no aluguer de casas, apartamentos e quartos.'},
  vrbo:        {nome:'Vrbo',          dom:'vrbo.com',          cat:['casa'],           fx:0.94, desc:'Casas de férias completas, ideal para famílias.'},
  hostelworld: {nome:'Hostelworld',   dom:'hostelworld.com',   cat:['hostel'],         fx:0.88, desc:'A principal base de dados de hostels económicos.'},
  rentalcars:  {nome:'Rentalcars.com',dom:'rentalcars.com',    cat:['carro'],          fx:0.96, desc:'O maior comparador global de aluguer de viaturas.'},
  discovercars:{nome:'Discover Cars', dom:'discovercars.com',  cat:['carro'],          fx:0.93, desc:'Óptimo para comparar preços e coberturas de seguros.',
                cup:[{codigo:'DISCOVER5', tipo:'pct', valor:5,  nota:'reserva antecipada'}]},
  autoeurope:  {nome:'Auto Europe',   dom:'autoeurope.eu',     cat:['carro'],          fx:0.95, desc:'Agregador com forte presença e suporte na Europa.'},
  getyourguide:{nome:'GetYourGuide',  dom:'getyourguide.pt',   cat:['actividade'],     fx:0.97, desc:'Excursões, visitas guiadas e bilhetes para atracções.',
                cup:[{codigo:'GYG10',     tipo:'pct', valor:10, nota:'primeira reserva'}]},
  civitatis:   {nome:'Civitatis',     dom:'civitatis.com',     cat:['actividade'],     fx:0.94, desc:'Líder em visitas guiadas e excursões em português.'},
  viator:      {nome:'Viator',        dom:'viator.com',        cat:['actividade'],     fx:0.98, desc:'Plataforma da Tripadvisor com milhares de actividades locais.'},
  rome2rio:    {nome:'Rome2Rio',      dom:'rome2rio.com',      cat:['planeador'],      fx:1.00, desc:'Mostra como ir de A a B com todos os transportes.'},
  omio:        {nome:'Omio',          dom:'omio.pt',           cat:['comboio','autocarro'], fx:0.96, desc:'Bilhetes de comboio, autocarro e voos na Europa.',
                cup:[{codigo:'OMIO10',    tipo:'pct', valor:10, nota:'nova conta'}]},
  trainline:   {nome:'Trainline',     dom:'thetrainline.com',  cat:['comboio','autocarro'], fx:0.97, desc:'A aplicação principal para comboios e autocarros na Europa.'},
  flixbus:     {nome:'FlixBus',       dom:'flixbus.pt',        cat:['autocarro'],      fx:0.85, desc:'O maior operador de autocarros low-cost de longo curso.'},

  // ── parceiros adicionais (adicionar novos aqui: ver nota abaixo) ──
  priceline:      {nome:'Priceline',       dom:'priceline.com',       cat:['voo','hotel','carro','pacote'], fx:0.96, tp:true, desc:'Descontos «Name Your Own Price» e pacotes de hotéis.'},
  hotelscom:      {nome:'Hotels.com',      dom:'hotels.com',          cat:['hotel'],          fx:1.00, tp:true, desc:'Programa de fidelização com noites grátis (grupo Expedia).'},
  travelocity:    {nome:'Travelocity',     dom:'travelocity.com',     cat:['voo','hotel','pacote'], fx:1.00, desc:'OTA pioneira, forte em pacotes voo + hotel.'},
  orbitz:         {nome:'Orbitz',          dom:'orbitz.com',          cat:['voo','hotel','pacote'], fx:1.00, desc:'Recompensas Orbucks para acumular saldo imediato.'},
  lastminute:     {nome:'Lastminute.com',  dom:'lastminute.com',      cat:['voo','hotel','pacote'], fx:0.97, tp:true, desc:'Líder europeu em escapadinhas e pacotes de última hora.'},
  opodo:          {nome:'Opodo',           dom:'opodo.pt',            cat:['voo','pacote'],   fx:0.95, tp:true, desc:'Resposta europeia às grandes OTAs, muito forte em voos.'},
  cheapoair:      {nome:'CheapOair',       dom:'cheapoair.com',       cat:['voo'],            fx:0.93, desc:'Bilhetes de avião com tarifas negociadas e descontos.'},
  rumbo:          {nome:'Rumbo',           dom:'rumbo.pt',            cat:['voo','pacote'],   fx:0.96, desc:'Agência ibérica do grupo Lastminute (Bravofly).'},
  kiwi:           {nome:'Kiwi.com',        dom:'kiwi.com',            cat:['voo'],            fx:0.92, tp:true, desc:'«Virtual Interlining»: combina companhias sem acordo entre si.'},
  flightconnections:{nome:'FlightConnections', dom:'flightconnections.com', cat:['planeador'], fx:1.00, desc:'Mapa de todas as rotas e voos directos do mundo.'},
  skiplagged:     {nome:'Skiplagged',      dom:'skiplagged.com',      cat:['voo'],            fx:0.90, desc:'Tarifas de «cidades ocultas» (sai na escala).'},
  googleHotels:   {nome:'Google Hotels',   dom:'google.com',          cat:['hotel'],          fx:0.98, desc:'Monitoriza preços directos de hotéis e alojamento local.'},
  tripit:         {nome:'TripIt',          dom:'tripit.com',          cat:['organizador'],    fx:1.00, desc:'Junta voos, hotéis e carros num único itinerário digital.'},
  wanderlog:      {nome:'Wanderlog',       dom:'wanderlog.com',       cat:['organizador'],    fx:1.00, desc:'Roteiros no mapa e orçamentos partilhados com amigos.'},
  travelperk:     {nome:'TravelPerk',      dom:'travelperk.com',      cat:['corporativo'],    fx:1.00, desc:'Gestão de viagens corporativas com controlo de custos.'},
  navan:          {nome:'Navan',           dom:'navan.com',           cat:['corporativo'],    fx:1.00, desc:'Viagens e despesas de empresa numa só plataforma.'},
  hopper:         {nome:'Hopper',          dom:'hopper.com',          cat:['voo','hotel'],    fx:0.95, desc:'Prevê se deve comprar já ou esperar que o preço mude.'},
  liligo:         {nome:'Liligo',          dom:'liligo.com',          cat:['voo','comboio','autocarro','carro'], fx:0.95, desc:'Compara voos, comboios, autocarros e carros em simultâneo.'},
  farecompare:    {nome:'FareCompare',     dom:'farecompare.com',     cat:['voo'],            fx:0.97, desc:'Tendências e histórico de tarifas aéreas.'},
  mekong:         {nome:'Mekong',          dom:'mekong.com',          cat:['voo','hotel'],    fx:0.95, desc:'Agregador emergente com forte cobertura na Ásia.'},
  jetcost:        {nome:'Jetcost',         dom:'jetcost.pt',          cat:['voo','hotel'],    fx:0.95, tp:true, desc:'Comparador de voos e hotéis muito popular em Portugal.'},
  checkfelix:     {nome:'checkfelix',      dom:'checkfelix.com',      cat:['voo','hotel'],    fx:0.96, desc:'Comparador focado na Europa Central.'},
  cheaptickets:   {nome:'CheapTickets',    dom:'cheaptickets.com',    cat:['voo','hotel','pacote'], fx:0.96, desc:'Descontos de última hora (grupo Expedia).'},
  vayama:         {nome:'Vayama',          dom:'vayama.com',          cat:['voo'],            fx:0.95, desc:'Voos internacionais de longo curso.'},
  budgetair:      {nome:'BudgetAir',       dom:'budgetair.com',       cat:['voo'],            fx:0.94, desc:'OTA europeia competitiva em transatlânticos.'},
  flightnetwork:  {nome:'FlightNetwork',   dom:'flightnetwork.com',   cat:['voo','pacote'],   fx:0.95, desc:'Grande agência canadiana, forte em pacotes.'},
  flyfar:         {nome:'FlyFar',          dom:'flyfar.ca',           cat:['voo'],            fx:0.94, desc:'Tarifas «bulk» exclusivas que não aparecem nos sites normais.'},
  govoyages:      {nome:'Govoyages',       dom:'govoyages.com',       cat:['voo','pacote'],   fx:0.95, desc:'Marca francesa do grupo eDreams ODIGEO.'},
  hotelscombined: {nome:'HotelsCombined',  dom:'hotelscombined.com',  cat:['hotel'],          fx:0.97, tp:true, desc:'Compara Booking, Hotels.com e Expedia numa página.'},
  zenhotels:      {nome:'ZenHotels',       dom:'zenhotels.com',       cat:['hotel'],          fx:0.93, tp:true, desc:'Tarifas de hotéis de consolidadores privados.'},
  amoma:          {nome:'Amoma',           dom:'amoma.com',           cat:['hotel'],          fx:0.94, desc:'Historicamente conhecida por quebrar preços de hotéis.'},
  ostrovok:       {nome:'Ostrovok',        dom:'ostrovok.com',        cat:['hotel'],          fx:0.94, tp:true, desc:'Gigante europeu com inventário independente na Europa de Leste.'},
  hostelscom:     {nome:'Hostels.com',     dom:'hostels.com',         cat:['hostel'],         fx:0.88, desc:'Alojamento jovem e de baixo custo.'},
  homestay:       {nome:'Homestay',        dom:'homestay.com',        cat:['casa'],           fx:0.85, desc:'Quartos em casas de famílias locais a preços reduzidos.'},
  zestcar:        {nome:'Zest Car Rental', dom:'zestcarrental.com',   cat:['carro'],          fx:0.94, desc:'Aluguer na Europa com seguro sem franquia incluído.'},
  economycars:    {nome:'Economy Car Rentals', dom:'economycarrentals.com', cat:['carro'],   fx:0.93, tp:true, desc:'Broker global com fornecedores locais.'},
  carflexi:       {nome:'CarFlexi',        dom:'carflexi.com',        cat:['carro'],          fx:0.94, desc:'Cancelamento flexível e frotas de aeroporto.'},
  holidayautos:   {nome:'Holiday Autos',   dom:'holidayautos.com',    cat:['carro'],          fx:0.95, tp:true, desc:'Um dos agregadores de aluguer mais antigos do mundo.'},
  wisecars:       {nome:'Wisecars',        dom:'wisecars.com',        cat:['carro'],          fx:0.93, tp:true, desc:'Encontra discrepâncias de preços entre agências.'},
  busbud:         {nome:'Busbud',          dom:'busbud.com',          cat:['autocarro'],      fx:0.90, tp:true, desc:'Maior agregador mundial de autocarros (+80 países).'},
  checkmybus:     {nome:'CheckMyBus',      dom:'checkmybus.com',      cat:['autocarro'],      fx:0.90, desc:'Compara a viagem de autocarro mais barata entre cidades.'},
  directferries:  {nome:'Direct Ferries',  dom:'directferries.com',   cat:['ferry'],          fx:0.97, tp:true, desc:'Rotas e preços de quase todas as companhias de ferry.'},
  ferryhopper:    {nome:'Ferryhopper',     dom:'ferryhopper.com',     cat:['ferry'],          fx:0.96, desc:'Viagens de barco entre ilhas no Mediterrâneo.'},
  raileurope:     {nome:'Rail Europe',     dom:'raileurope.com',      cat:['comboio'],        fx:0.97, tp:true, desc:'Passes de comboio na Europa (Eurail / Interrail).'}
};

/* Marker de afiliado Travelpayouts (o script Drive, instalado no index.html,
   localiza e monetiza automaticamente as ligações para os parceiros). */
const TRAVELPAYOUTS_MARKER = '552141';

/* Devolve as chaves de parceiros que cobrem uma dada categoria de preço.
   As secções de resultados (voos, hotéis, carros, etc.) usam esta função,
   por isso um parceiro novo aparece automaticamente na secção certa. */
function parceirosDe(cat){
  return Object.keys(PARCEIROS).filter(k => (PARCEIROS[k].cat || []).includes(cat));
}

/* ┌─────────────────────────────────────────────────────────────────────┐
   │ COMO ADICIONAR UM SITE NOVO                                          │
   │ 1. Acrescente uma entrada ao objecto PARCEIROS acima, no formato:    │
   │    chave: {nome, dom, cat:['voo'|'hotel'|'casa'|'hostel'|'carro'|    │
   │            'comboio'|'autocarro'|'actividade'|'pacote'|'ferry'|      │
   │            'planeador'|'organizador'|'corporativo'], fx, desc,       │
   │            tp:true (se for parceiro Travelpayouts)}                  │
   │    - dom: domínio (usado para o ícone oficial e a ligação por defeito)│
   │    - cat: categorias de preço fazem-no aparecer nessas secções;      │
   │      planeador/organizador/corporativo só aparecem na aba Parceiros. │
   │ 2. Nada mais é preciso: as secções lêem os parceiros por categoria.  │
   │ 3. (Opcional) para uma ligação profunda específica, acrescente um    │
   │    «case» à função ligacaoParceiro; senão liga ao domínio do site.   │
   └─────────────────────────────────────────────────────────────────────┘ */

/* Ligações de reserva (deep links) por parceiro.
   Sempre que o parceiro aceita parâmetros no URL, a ligação abre a pesquisa
   exacta (rota, datas, passageiros e classe) e não a página geral.
   ctx: {origem, destino, ida, volta, adultos, criancas, classe, seccao, meio} */
function ligacaoParceiro(chave, ctx){
  const c = ctx || {};
  const o = c.origem, d = c.destino, s = c.seccao || '';
  const pad = n => String(n).padStart(2, '0');
  const fData = x => x ? x.getFullYear() + '-' + pad(x.getMonth()+1) + '-' + pad(x.getDate()) : '';
  const fCurta = x => x ? fData(x).slice(2).replace(/-/g,'') : '';
  const fBarra = x => x ? pad(x.getDate()) + '/' + pad(x.getMonth()+1) + '/' + x.getFullYear() : '';
  const enc = encodeURIComponent;
  const slug = n => n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'-');
  const ad = c.adultos || 1, cr = c.criancas || 0;
  const quartos = Math.max(1, Math.ceil((ad + cr) / 2));
  const cab = {economica:'economy', premium:'premiumeconomy', executiva:'business', primeira:'first'}[c.classe] || 'economy';
  const cabKayak = {premium:'/premium', executiva:'/business', primeira:'/first'}[c.classe] || '';
  const temRota = o && d && c.ida;
  const temEstadia = d && c.ida && c.volta;

  switch(chave){
    case 'google':
      return d ? 'https://www.google.com/travel/flights?q=' + enc(
        `voos de ${o ? o.n : 'Lisboa'} para ${d.n}` +
        (c.ida ? ` a ${fData(c.ida)}` : '') +
        (c.volta ? ` regresso a ${fData(c.volta)}` : (c.ida ? ' só ida' : ''))
      ) : 'https://www.google.com/travel/flights';
    case 'googleHoteis':
      return d ? 'https://www.google.com/travel/hotels?q=' + enc(
        `hotéis em ${d.n}` + (temEstadia ? ` de ${fData(c.ida)} a ${fData(c.volta)}` : '')
      ) : 'https://www.google.com/travel/hotels';
    case 'skyscanner':
      return temRota
        ? `https://www.skyscanner.pt/transport/flights/${o.i.toLowerCase()}/${d.i.toLowerCase()}/${fCurta(c.ida)}/${c.volta ? fCurta(c.volta) + '/' : ''}?adultsv2=${ad}&children=${cr}&cabinclass=${cab}&rtn=${c.volta ? 1 : 0}`
        : 'https://www.skyscanner.pt';
    case 'kayak':
      if(s === 'hotel' && temEstadia)
        return `https://www.kayak.pt/hotels/${enc(d.n)}/${fData(c.ida)}/${fData(c.volta)}/${ad}adults?sort=price_a`;
      return temRota
        ? `https://www.kayak.pt/flights/${o.i}-${d.i}/${fData(c.ida)}${c.volta ? '/' + fData(c.volta) : ''}${cabKayak}/${ad}adults${cr ? '/' + cr + 'children' : ''}?sort=price_a`
        : 'https://www.kayak.pt';
    case 'momondo':
      if(s === 'hotel' && temEstadia)
        return `https://www.momondo.pt/hotel-search/${enc(d.n)}/${fData(c.ida)}/${fData(c.volta)}/${ad}adults?sort=price_a`;
      return temRota
        ? `https://www.momondo.pt/flight-search/${o.i}-${d.i}/${fData(c.ida)}${c.volta ? '/' + fData(c.volta) : ''}${cabKayak}/${ad}adults${cr ? '/' + cr + 'children' : ''}?sort=price_a`
        : 'https://www.momondo.pt';
    case 'trivago':
      return d ? 'https://www.trivago.pt/pt-PT/srl?search=' + enc(d.n) : 'https://www.trivago.pt';
    case 'booking':
      return d
        ? `https://www.booking.com/searchresults.pt-pt.html?ss=${enc(d.n)}${temEstadia ? `&checkin=${fData(c.ida)}&checkout=${fData(c.volta)}` : ''}&group_adults=${ad}&group_children=${cr}&no_rooms=${quartos}&selected_currency=EUR`
        : 'https://www.booking.com/index.pt-pt.html';
    case 'expedia':
      if(s === 'voo' && temRota)
        return `https://www.expedia.pt/Flights-Search?trip=${c.volta ? 'roundtrip' : 'oneway'}&leg1=${enc(`from:${o.i},to:${d.i},departure:${fBarra(c.ida)}TANYT`)}${c.volta ? '&leg2=' + enc(`from:${d.i},to:${o.i},departure:${fBarra(c.volta)}TANYT`) : ''}&passengers=${enc(`adults:${ad},children:${cr}`)}&mode=search`;
      if(s === 'hotel' && temEstadia)
        return `https://www.expedia.pt/Hotel-Search?destination=${enc(d.n)}&startDate=${fData(c.ida)}&endDate=${fData(c.volta)}&adults=${ad}`;
      if(s === 'carro') return 'https://www.expedia.pt/Cars';
      if(s === 'pacote') return 'https://www.expedia.pt/Vacation-Packages';
      return 'https://www.expedia.pt/';
    case 'trip':
      if((s === 'terrestre' || s === 'comboio')) return 'https://www.trip.com/trains/';
      if(s === 'hotel' && temEstadia)
        return `https://www.trip.com/hotels/list?cityName=${enc(d.n)}&checkin=${fData(c.ida)}&checkout=${fData(c.volta)}&adult=${ad}&children=${cr}`;
      return temRota
        ? `https://www.trip.com/flights/showfarefirst?dcity=${o.i.toLowerCase()}&acity=${d.i.toLowerCase()}&ddate=${fData(c.ida)}${c.volta ? '&rdate=' + fData(c.volta) + '&triptype=rt' : '&triptype=ow'}&class=${{economica:'y', premium:'s', executiva:'c', primeira:'f'}[c.classe] || 'y'}&quantity=${ad}`
        : 'https://www.trip.com/';
    case 'edreams':
      return (s === 'voo' && temRota)
        ? `https://www.edreams.pt/travel/#results/type=${c.volta ? 'R' : 'O'};dep=${fData(c.ida)}${c.volta ? ';ret=' + fData(c.volta) : ''};from=${o.i};to=${d.i};numAdults=${ad};numChildren=${cr};cabinClass=${cab.toUpperCase()}`
        : 'https://www.edreams.pt/';
    case 'logitravel':
      return s === 'hotel' ? 'https://www.logitravel.com/hoteis/' : 'https://www.logitravel.com/';
    case 'agoda':
      return d
        ? `https://www.agoda.com/pt-pt/search?textToSearch=${enc(d.n)}${temEstadia ? `&checkIn=${fData(c.ida)}&checkOut=${fData(c.volta)}` : ''}&adults=${ad}&children=${cr}&rooms=${quartos}`
        : 'https://www.agoda.com/pt-pt/';
    case 'airbnb':
      return d
        ? `https://www.airbnb.pt/s/${enc(d.n)}/homes?${temEstadia ? `checkin=${fData(c.ida)}&checkout=${fData(c.volta)}&` : ''}adults=${ad}&children=${cr}`
        : 'https://www.airbnb.pt';
    case 'vrbo':
      return d
        ? `https://www.vrbo.com/pt-pt/search?destination=${enc(d.n)}${temEstadia ? `&startDate=${fData(c.ida)}&endDate=${fData(c.volta)}` : ''}&adults=${ad}`
        : 'https://www.vrbo.com/pt-pt/';
    case 'hostelworld':
      return d
        ? `https://www.hostelworld.com/pt/pesquisa?search_keywords=${enc(d.n)}${temEstadia ? `&date_from=${fData(c.ida)}&date_to=${fData(c.volta)}` : ''}&number_of_guests=${ad + cr}`
        : 'https://www.hostelworld.com/pt/';
    case 'rentalcars':
      return d ? `https://www.rentalcars.com/pt/search-results?location=${enc(d.n)}` : 'https://www.rentalcars.com/pt/';
    case 'discovercars':
      return d ? `https://www.discovercars.com/pt/search?location=${enc(d.n)}` : 'https://www.discovercars.com/pt';
    case 'autoeurope':
      return 'https://www.autoeurope.pt/';
    case 'getyourguide':
      return d
        ? `https://www.getyourguide.pt/s/?q=${enc(d.n)}${temEstadia ? `&date_from=${fData(c.ida)}&date_to=${fData(c.volta)}` : ''}`
        : 'https://www.getyourguide.pt';
    case 'civitatis':
      return d ? 'https://www.civitatis.com/pt/pesquisa/?q=' + enc(d.n) : 'https://www.civitatis.com/pt/';
    case 'viator':
      return d ? 'https://www.viator.com/pt-PT/searchResults/all?text=' + enc(d.n) : 'https://www.viator.com/pt-PT/';
    case 'rome2rio':
      return o && d ? `https://www.rome2rio.com/pt/map/${enc(o.n)}/${enc(d.n)}` : 'https://www.rome2rio.com/pt/';
    case 'omio':
      return o && d
        ? `https://www.omio.pt/${c.meio === 'Autocarro' ? 'autocarros' : 'comboios'}/${slug(o.n)}/${slug(d.n)}`
        : 'https://www.omio.pt/';
    case 'trainline':
      return 'https://www.thetrainline.com/pt';
    case 'flixbus':
      return 'https://www.flixbus.pt/';
    default:
      return PARCEIROS[chave] ? 'https://' + PARCEIROS[chave].dom : '#';
  }
}

/* Companhias aéreas plausíveis para atribuir às cotações. */
const COMPANHIAS = ['TAP Air Portugal','Ryanair','easyJet','Vueling','Iberia','Lufthansa','Air France','KLM','British Airways','SWISS','Emirates','Qatar Airways','LATAM','United','Delta'];

/* Títulos na Wikipédia inglesa (recurso quando a portuguesa não tem
   fotografia utilizável, por exemplo quando a imagem principal é a bandeira). */
const WIKI_EN = {
  'Praga':'Prague', 'Nova Iorque':'New York City', 'Londres':'London',
  'Roma':'Rome', 'Atenas':'Athens', 'Budapeste':'Budapest',
  'Marraquexe':'Marrakesh', 'Rio de Janeiro':'Rio de Janeiro',
  'Barcelona':'Barcelona', 'Paris':'Paris', 'Funchal':'Funchal',
  'Ponta Delgada':'Ponta Delgada'
};

/* Destinos considerados na aba «Ofertas em conta». */
const DESTINOS_OFERTAS = ['Barcelona','Roma','Paris','Marraquexe','Praga','Ponta Delgada','Londres','Budapeste','Atenas','Funchal','Nova Iorque','Rio de Janeiro'];

/* Gradientes dos cartões de oferta (sem imagens externas). */
const GRADIENTES = [
  'linear-gradient(135deg,#f97316,#db2777)','linear-gradient(135deg,#0ea5e9,#4353ff)',
  'linear-gradient(135deg,#0e9f6e,#0891b2)','linear-gradient(135deg,#7c3aed,#db2777)',
  'linear-gradient(135deg,#e11d48,#7c3aed)','linear-gradient(135deg,#f59e0b,#dc2626)',
  'linear-gradient(135deg,#2563eb,#0e9f6e)','linear-gradient(135deg,#c026d3,#4353ff)'
];

function cidadePorNome(nome){
  if(!nome) return null;
  const chave = nome.trim().toLowerCase();
  return CIDADES.find(x => x.n.toLowerCase() === chave || x.i.toLowerCase() === chave) ||
         CIDADES.find(x => (x.n + ' ' + x.p).toLowerCase().includes(chave)) || null;
}
