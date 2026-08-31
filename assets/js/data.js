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
  raileurope:     {nome:'Rail Europe',     dom:'raileurope.com',      cat:['comboio'],        fx:0.97, tp:true, desc:'Passes de comboio na Europa (Eurail / Interrail).'},

  /* ── agências e companhias portuguesas ────────────────────────
     Rede de balcões em Portugal e apoio em português, útil para
     viagens organizadas e para quem prefere atendimento local. */
  tap:            {nome:'TAP Air Portugal', dom:'flytap.com',         cat:['voo','pacote'],   fx:1.03, desc:'Companhia aérea de bandeira portuguesa; venda directa de voos e pacotes.'},
  abreu:          {nome:'Abreu Viagens',    dom:'abreu.pt',           cat:['pacote','voo','hotel'], fx:1.04, desc:'A agência de viagens mais antiga do mundo, fundada no Porto em 1840.'},
  topatlantico:   {nome:'Top Atlântico',    dom:'topatlantico.pt',    cat:['pacote','voo','hotel'], fx:1.03, desc:'Rede portuguesa com forte oferta de férias e viagens organizadas.'},
  geostar:        {nome:'GeoStar',          dom:'geostar.pt',         cat:['pacote','voo','hotel'], fx:1.02, desc:'Agência portuguesa com balcões por todo o país e apoio presencial.'},
  pintolopes:     {nome:'Pinto Lopes Viagens', dom:'pintolopesviagens.com', cat:['pacote','voo'], fx:1.01, desc:'Operador português especializado em circuitos e viagens em grupo.'},
  elcorteingles:  {nome:'Viagens El Corte Inglés', dom:'viagenselcorteingles.pt', cat:['pacote','voo','hotel'], fx:1.03, desc:'Agência do grupo El Corte Inglés, forte em pacotes e cruzeiros.'},
  besttravel:     {nome:'Best Travel',      dom:'besttravel.pt',      cat:['pacote','voo'],   fx:1.02, desc:'Operador português de viagens organizadas e circuitos guiados.'}
};

/* ── transportes no destino ───────────────────────────────────
   Bilhetes e passes de transporte público na cidade de destino: quanto
   custam, onde se compram e se vale a pena tratar disso antes de partir ou
   à chegada.

   NATUREZA DESTES DADOS, que é diferente de tudo o resto no site: não são
   preços de mercado obtidos numa API, são **tarifas publicadas** pelos
   operadores: mudam uma ou duas vezes por ano, com aviso, e estão no site
   oficial de cada um. Por isso podem viver aqui, numa tabela, sem serem
   invenção. Mas também não são consultados em tempo real: cada entrada leva
   a ligação oficial e o ano a que a tarifa se refere, e o bloco diz que o
   valor é para confirmar no operador.

   TRÊS ESTADOS, e não dois. Uma cidade pode estar aqui sem ter tarifas
   confirmadas: nesse caso leva o operador e as ligações oficiais, e a lista
   de bilhetes fica vazia. É melhor do que não estar de todo, porque o
   utilizador fica na mesma a saber quem manda nos transportes da cidade e
   onde comprar, e é pior do que ter tarifas, o que o bloco diz sem rodeios.

     bilhetes com valores   mostra preços, perfis e o total da viagem
     bilhetes: []           mostra o operador e as ligações, sem preço
     cidade ausente         mostra só uma procura, que é o pior caso

   CAMPOS DE PROVENIÊNCIA, que são o que torna isto sustentável:

     actualizado  data (AAAA-MM-DD) em que a tarifa foi confirmada. Não é o
                  ano da tarifa: é o dia em que alguém foi lá ver. O bloco
                  mostra-a, e avisa quando passa de TRANSPORTES_REVISAO_DIAS.
     fonte        endereço onde o valor foi confirmado. Sem isto a revisão
                  do mês seguinte tem de refazer a procura toda.
     url          tarifário oficial do operador.
     comprar      onde se compra em linha, quando é sítio diferente do
                  tarifário. Sem inventar caminhos: ou é o endereço que o
                  operador publica, ou não se põe.

   PARA ACRESCENTAR UMA CIDADE: uma entrada com o nome exacto da cidade tal
   como está em CIDADES, o operador, a ligação oficial, a data e a fonte, e
   os bilhetes que valem a pena comparar. `quando` diz 'antes' (compra-se
   antes de viajar, normalmente em linha) ou 'chegada' (compra-se no local).

   PARA REVER: ver docs/TRANSPORTES.md, e correr
   `node ferramentas/transportes.js` para saber o que está por rever. */

/* De quanto em quanto tempo as tarifas são para reconferir. Um mês: é a
   cadência a que os operadores costumam publicar alterações, e é curta o
   bastante para o site nunca estar muito longe da verdade. */
const TRANSPORTES_REVISAO_DIAS = 30;

/* Dias desde a última confirmação, ou null se a entrada não disser quando
   foi confirmada (caso em que se trata como estando por rever). */
function diasDesdeRevisao(t){
  if(!t || !t.actualizado) return null;
  const d = new Date(t.actualizado + 'T00:00:00Z');
  if(isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}
function tarifaPorRever(t){
  const dias = diasDesdeRevisao(t);
  return dias === null || dias > TRANSPORTES_REVISAO_DIAS;
}
/* Uma entrada só com operador e ligações, sem tarifas confirmadas. */
function tarifaSemValores(t){
  return !!t && !(t.bilhetes && t.bilhetes.length);
}

const TRANSPORTES_DESTINO = {
  /* Lido no tarifário do Metro a 24/08/2026. Estava tudo desactualizado:
     simples 1,85 (são 1,90), 24 h 6,90 (são 7,25), 24 h + CP 10,90 (são
     11,40). O preço do cartão navegante não vem nesta página, por isso sai
     da tabela e fica dito na nota, sem número. */
  'Lisboa': {operador:'Carris / Metro de Lisboa', url:'https://www.metrolisboa.pt/comprar/', actualizado:'2026-08-24', fonte:'https://www.metrolisboa.pt/comprar/',
    nota:'É preciso um cartão navegante ocasional para carregar qualquer título; compra-se na máquina, à parte. O aeroporto fica na linha vermelha e paga a tarifa normal do metro.',
    bilhetes:[
      {nome:'Bilhete Carris/Metro (60 min)', preco:1.90, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Viagem no metro com zapping', preco:1.72, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Viagem no metro com cartão bancário', preco:1.92, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Bilhete diário Carris/Metro', preco:7.25, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']},
      {nome:'Bilhete diário Carris/Metro/Transtejo (Cacilhas)', preco:10.35, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular','barco']},
      {nome:'Bilhete diário Carris/Metro/CP (urbanos)', preco:11.40, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular','comboio']}
    ]},
  /* O endereço que aqui estava (pages/357) responde 200 mas é a página
     institucional do Metro, não o tarifário: uma ligação viva a apontar ao
     sítio errado, que uma sondagem por código HTTP não apanha. O tarifário
     é o pages/287. Lido lá a 24/08/2026: o Andante 24 Z2 estava a 4,80 e
     são 5,35, e o Z4 do aeroporto estava a 2,25 e são 2,30. */
  'Porto': {operador:'Metro do Porto / STCP', url:'https://www.metrodoporto.pt/pages/287', actualizado:'2026-08-24', fonte:'https://www.metrodoporto.pt/pages/287',
    cartao:{nome:'Andante Azul', preco:0.60, nota:'recarregável; serve metro, autocarro e comboio urbano'},
    nota:'As zonas contam-se a partir de onde embarca. O aeroporto fica na Z4, e o Andante Tour cobre a rede toda sem se pensar em zonas.',
    bilhetes:[
      {nome:'Andante Azul Z2 (até 1 h)', preco:1.40, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','comboio']},
      {nome:'Andante Azul Z4, aeroporto (até 1h15)', preco:2.30, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','comboio','aeroporto']},
      {nome:'Andante 24 Z2', preco:5.35, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','comboio']},
      {nome:'Andante 24 Z4 (com aeroporto)', preco:8.55, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','comboio','aeroporto']},
      {nome:'Andante Tour 1 (toda a rede)', preco:7.75, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','comboio','aeroporto']},
      {nome:'Andante Tour 3 (toda a rede)', preco:16.55, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','comboio','aeroporto']}
    ]},
  'Madrid': {operador:'Metro de Madrid / CRTM', url:'https://www.crtm.es/billetes-y-tarifas/', actualizado:'2026-01-01',
    cartao:{nome:'Tarjeta Multi', preco:2.50, nota:'obrigatória para carregar bilhetes'},
    nota:'O suplemento de aeroporto é 3 € por viagem e não está incluído nos bilhetes simples.',
    bilhetes:[
      {nome:'Bilhete simples (zona A)', preco:1.50, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Bilhete de 10 viagens', preco:12.20, unidade:'10 viagens', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Abono turístico 1 dia (zona A)', preco:8.40, unidade:'dia', quando:'antes', modos:['metro','autocarro','comboio','aeroporto']},
      {nome:'Abono turístico 5 dias (zona A)', preco:26.80, unidade:'5 dias', quando:'antes', modos:['metro','autocarro','comboio','aeroporto']}
    ]},
  /* O endereço que aqui estava dava 404. Lido no tarifário da TMB a
     18/08/2026: simples 2,65 -> 2,90, T-casual 12,55 -> 13,00. Os Hola
     Barcelona de 48 h e 72 h saíram: a página anuncia-os «a partir de
     12,50 €» e não os separa por duração, e um passe inventado foi o que
     nos deixou Viena a vender um título extinto. */
  'Barcelona': {operador:'TMB', url:'https://www.tmb.cat/en/barcelona-fares-metro-bus', actualizado:'2026-08-24', fonte:'https://www.tmb.cat/en/barcelona-fares-metro-bus',
    nota:'O Hola Barcelona Travel Card cobre 2 a 5 dias e inclui a ida e volta ao aeroporto, a partir de 12,50 €. O preço muda com a duração: veja no tarifário antes de comprar.',
    bilhetes:[
      {nome:'Bilhete simples', preco:2.90, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','funicular']},
      {nome:'T-casual (10 viagens, 1 zona)', preco:13.00, unidade:'10 viagens', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Bilhete de aeroporto (metro L9, T1 e T2)', preco:5.90, unidade:'viagem', quando:'chegada', modos:['metro','aeroporto']}
    ]},
  /* Lido na Île-de-France Mobilités a 30/08/2026, em navegador. A nota que
     aqui estava («tarifa única de 2,50 €, incluindo de e para os
     aeroportos») já não é verdade em nenhuma das duas metades: há dois
     preços de viagem (2,55 € no metro e no RER, 2,05 € no autocarro) e o
     aeroporto tem título próprio, a 14 €. Era o erro mais caro da tabela. */
  'Paris': {operador:'RATP / Île-de-France Mobilités', url:'https://www.iledefrance-mobilites.fr/titres-et-tarifs', actualizado:'2026-08-30', fonte:'https://www.iledefrance-mobilites.fr/titres-et-tarifs',
    nota:'Já não há tarifa única: o metro, o comboio e o RER custam mais do que o autocarro e o eléctrico, e as viagens de e para Orly e CDG têm um título à parte, bem mais caro.',
    bilhetes:[
      {nome:'Ticket Métro-Train-RER', preco:2.55, unidade:'viagem', quando:'chegada', modos:['metro','comboio']},
      {nome:'Ticket Bus-Tram', preco:2.05, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Navigo Jour', preco:12.30, unidade:'dia', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Navigo Semaine (seg. a dom.)', preco:32.40, unidade:'semana', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Ticket Paris Région ↔ Aeroportos (Orly ou CDG)', preco:14.00, unidade:'viagem', quando:'chegada', modos:['metro','comboio','aeroporto']}
    ]},
  /* Tectos e Travelcards lidos na tabela oficial de 2026: o PDF «Adult
     rate prices 2026» que a própria TfL publica na página de tarifas do
     metro; os do autocarro, na página de tarifas de autocarro e eléctrico.
     O simples do metro na zona 1 e a Elizabeth line de Heathrow saíram: o
     «single fare finder» da TfL não chega a mostrar valores, nem com o
     formulário submetido, e o que não se leu não leva carimbo de conferido.
     Não faz grande falta: quem paga por aproximação nunca paga mais do que
     o tecto, que é o que aqui fica. */
  'Londres': {operador:'Transport for London', url:'https://tfl.gov.uk/fares/', actualizado:'2026-08-30', fonte:'https://tfl.gov.uk/cdn/static/cms/documents/adult-fares.pdf', moeda:'GBP',
    nota:'Não compre bilhetes avulso: pague por aproximação com o cartão bancário ou telemóvel, que aplica sozinho o tecto diário e semanal. O tecto do autocarro conta à parte do do metro.',
    bilhetes:[
      {nome:'Autocarro ou eléctrico (Hopper: 1 h de mudanças)', preco:1.75, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Tecto diário, autocarro e eléctrico', preco:5.25, unidade:'dia', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Tecto semanal, autocarro e eléctrico', preco:24.70, unidade:'semana', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Tecto diário, zonas 1–2', preco:8.90, unidade:'dia', quando:'chegada', modos:['metro','autocarro','comboio','barco']},
      {nome:'Tecto semanal (seg. a dom.), zonas 1–2', preco:44.70, unidade:'semana', quando:'chegada', modos:['metro','autocarro','comboio','barco']},
      {nome:'Day Anytime Travelcard, zonas 1–2', preco:16.60, unidade:'dia', quando:'chegada', modos:['metro','autocarro','comboio','barco']}
    ]},
  /* Lido na ATAC a 30/08/2026. O BIT não mexeu, mas os passes subiram
     todos: o 24H estava a 7,00 e são 8,50, o 72H estava a 18,00 e são
     22,00. Acrescentados o de 48 h e o semanal, que lá vêm. O Leonardo
     Express saiu: é da Trenitalia, não da ATAC, e não vem nesta página. */
  'Roma': {operador:'ATAC', url:'https://www.atac.roma.it/en/tickets-and-passes', actualizado:'2026-08-30', fonte:'https://www.atac.roma.it/en/tickets-and-passes',
    nota:'O bilhete BIT vale 100 minutos e permite mudar de autocarro, mas só uma entrada no metro. O comboio do aeroporto de Fiumicino é da Trenitalia e paga à parte.',
    bilhetes:[
      {nome:'BIT (100 minutos)', preco:1.50, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Roma 24H', preco:8.50, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Roma 48H', preco:15.00, unidade:'48 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Roma 72H', preco:22.00, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'CIS, bilhete semanal integrado', preco:29.00, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']}
    ]},
  /* O url que aqui estava (a raiz do sítio) respondia 200 mas não é o
     tarifário; a ligação certa, achada na própria raiz, tem
     «bypublictransport» no fim e faltava. Lida a 30/08/2026: o simples e o
     diário não mudaram, mas o passe de 3 dias estava a 13,00 e são 15,50, e
     faltava o carnet de 10 viagens. */
  'Milão': {operador:'ATM', url:'https://www.atm.it/en/ViaggiaConNoi/Biglietti/Pages/HowtogetaroundMilanbypublictransport.aspx', actualizado:'2026-08-30', fonte:'https://www.atm.it/en/ViaggiaConNoi/Biglietti/Pages/HowtogetaroundMilanbypublictransport.aspx',
    nota:'Quem tiver um passe carregado paga mais 1,70 € para o troço Malpensa/Rho Fiera. O bilhete serve metro, autocarro, eléctrico e as linhas S da Trenord dentro da cidade (zonas Mi1-Mi3).',
    bilhetes:[
      {nome:'Bilhete urbano (90 minutos)', preco:2.20, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Carnet de 10 viagens', preco:19.50, unidade:'10 viagens', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Passe 24 h', preco:7.60, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Passe 3 dias', preco:15.50, unidade:'3 dias', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']}
    ]},
  /* Lido na BVG a 24/08/2026. O simples AB estava a 3,80 e são 4,00; o
     diário estava a 10,60 e são 11,20. O passe de 7 dias e a tarifa do
     aeroporto saíram: não vêm nesta página, e o que não se leu não leva
     carimbo de conferido. A zona do aeroporto fica dita na nota. */
  'Berlim': {operador:'BVG', url:'https://www.bvg.de/en/subscriptions-and-tickets/all-tickets', actualizado:'2026-08-24', fonte:'https://www.bvg.de/en/subscriptions-and-tickets/all-tickets',
    nota:'O aeroporto BER fica na zona C: precisa de um título ABC, que custa mais do que os AB aqui listados. O Deutschlandticket cobre os transportes regionais de toda a Alemanha, mas é subscrição mensal.',
    bilhetes:[
      {nome:'Bilhete simples AB (2 h)', preco:4.00, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Percurso curto (3 paragens de metro, 6 de autocarro)', preco:2.80, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete de 4 viagens AB', preco:12.40, unidade:'4 viagens', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Passe 24 h AB', preco:11.20, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Passe 24 h de grupo, até 5 pessoas', preco:35.30, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']}
    ]},
  /* O passe de 24 h estava a 9,00 € e são 10,00 €. A linha do comboio de
     Schiphol saiu: é da NS, não do GVB, e as fontes não concordaram no
     preço. Fica dita na nota, sem número. */
  'Amesterdão': {operador:'GVB', url:'https://www.gvb.nl/en/travel-products/hour-and-day-tickets/gvb-day-ticket', comprar:'https://www.gvb.nl/en/travel-products', actualizado:'2026-08-24', fonte:'https://www.gvb.nl/en/travel-products/hour-and-day-tickets/gvb-day-ticket',
    nota:'Também se pode pagar por aproximação com o cartão bancário (OVpay), que costuma sair mais barato do que os passes se andar pouco. O comboio entre Schiphol e a Centraal é da NS e não está incluído em nenhum destes títulos.',
    bilhetes:[
      {nome:'Bilhete de 1 hora', preco:3.40, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Passe 24 h', preco:10.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Passe 48 h', preco:16.00, unidade:'48 h', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Passe 72 h', preco:21.50, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Passe 7 dias', preco:43.00, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro','eletrico','barco']}
    ]},
  /* Lido no DPP a 30/08/2026. Os quatro títulos estavam abaixo do real:
     30 min 30 -> 39, 90 min 40 -> 50, 24 h 120 -> 150, 72 h 330 -> 350. */
  'Praga': {operador:'DPP', url:'https://www.dpp.cz/en/fares/fare-pricelist', comprar:'https://www.dpp.cz/en/fares/fare-pricelist', actualizado:'2026-08-30', fonte:'https://www.dpp.cz/en/fares/fare-pricelist', moeda:'CZK',
    nota:'Um dos sistemas mais baratos da Europa. Valide o bilhete à entrada, nas máquinas amarelas.',
    bilhetes:[
      {nome:'Bilhete de 30 minutos', preco:39, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete de 90 minutos', preco:50, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']},
      {nome:'Passe 24 h', preco:150, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']},
      {nome:'Passe 72 h', preco:350, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']}
    ]},
  /* A Wiener Linien mudou a estrutura tarifária a 1 de Janeiro de 2026 e
     acabou com os passes de 48 h e de 72 h. A tabela ainda tinha o de 72 h
     a 17,10 €: um título que já não se vende. */
  'Viena': {operador:'Wiener Linien', url:'https://www.wienerlinien.at/web/wl-en/news/new-fare-structure-from-1-january-2026', comprar:'https://www.wienerlinien.at/web/wl-en/tickets', actualizado:'2026-08-24', fonte:'https://www.wienerlinien.at/web/wl-en/news/new-fare-structure-from-1-january-2026',
    nota:'Os passes de 48 h e de 72 h deixaram de existir em 2026. Para mais de um dia, o passe de 7 dias é o que resta. O comboio CAT para o aeroporto é de outro operador e tem tarifa própria.',
    bilhetes:[
      {nome:'Bilhete simples', preco:3.20, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Passe 24 h', preco:10.20, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Passe 7 dias', preco:28.90, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  /* Lido na BKK a 24/08/2026. Estava tudo abaixo do real: simples 450
     (são 500), 24 h 2500 (são 2750), 72 h 5500 (são 5750). */
  'Budapeste': {operador:'BKK', url:'https://bkk.hu/en/tickets-and-passes/prices/', actualizado:'2026-08-24', fonte:'https://bkk.hu/en/tickets-and-passes/prices/', moeda:'HUF',
    nota:'Comprado ao motorista, o bilhete simples custa 700 Ft em vez de 500. O autocarro do aeroporto tem bilhete próprio.',
    bilhetes:[
      {nome:'Bilhete simples', preco:500, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Bilhete de 30 minutos', preco:600, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete de 90 minutos', preco:850, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bloco de 10 bilhetes', preco:4500, unidade:'10 viagens', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Passe 24 h (Budapeste)', preco:2750, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Passe 72 h (Budapeste)', preco:5750, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','eletrico','barco']},
      {nome:'Autocarro do aeroporto (100E)', preco:2500, unidade:'viagem', quando:'chegada', modos:['autocarro','aeroporto']}
    ]},
  /* Lido na MTA a 30/08/2026. O endereço /fares redirige para /fares-tolls,
     e é esse que aqui fica. A tarifa estava a 2,90 e são 3,00; o tecto
     semanal estava a 34,80 e são 35,00. O MetroCard deixou de se vender a
     1 de Janeiro de 2026, por isso sai do nome do bilhete. O AirTrain saiu:
     é da Port Authority, não da MTA, e não vem nesta página. */
  'Nova Iorque': {operador:'MTA', url:'https://www.mta.info/fares-tolls', actualizado:'2026-08-30', fonte:'https://www.mta.info/fares-tolls/subway-bus', moeda:'USD',
    nota:'Pague por aproximação (OMNY): com o mesmo cartão ou telemóvel nunca paga mais do que o tecto semanal, e não precisa de comprar passe. O MetroCard deixou de se vender a 1 de Janeiro de 2026. O AirTrain do JFK é da Port Authority e paga à parte.',
    bilhetes:[
      {nome:'Metro ou autocarro local (OMNY)', preco:3.00, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Autocarro expresso', preco:7.25, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Tecto de 7 dias, metro e autocarro local', preco:35.00, unidade:'semana', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Tecto de 7 dias, com autocarro expresso', preco:67.00, unidade:'semana', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Lido no Tokyo Metro a 30/08/2026. O passe de 24 h estava a 600 e são
     700; a viagem curta não mexeu. O Narita Express saiu: é da JR East,
     não do Tokyo Metro, e não vem nestas páginas, por isso o operador
     também deixa de dizer JR East, que é o que aqui se foi conferir. */
  'Tóquio': {operador:'Tokyo Metro', url:'https://www.tokyometro.jp/en/ticket/', actualizado:'2026-08-30', fonte:'https://www.tokyometro.jp/en/ticket/regular/index.html', moeda:'JPY',
    cartao:{nome:'PASMO', preco:500, nota:'é uma caução, devolvida quando entregar o cartão; serve metro, comboio, autocarro e lojas de conveniência'},
    nota:'A tarifa do metro é por distância: 180 ¥ até 6 km, 210 até 11, 260 até 19, 300 até 27 e 330 acima disso. Os comboios do aeroporto são de outras empresas e pagam à parte.',
    bilhetes:[
      {nome:'Metro, até 6 km', preco:180, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metro, 12 a 19 km', preco:260, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Passe 24 h do Tokyo Metro', preco:700, unidade:'24 h', quando:'chegada', modos:['metro']},
      {nome:'Passe 1 dia, Tokyo Metro + Toei Subway', preco:1100, unidade:'dia', quando:'chegada', modos:['metro']}
    ]},
  /* Lido na SBS Transit a 30/08/2026: a tabela «with effect from 27
     December 2025», ainda em vigor. O «1,50 SGD, viagem típica» que aqui
     estava era uma média inventada; a tarifa é por distância, como em Hong
     Kong e Deli, e o bilhete de papel avulso deixou de se vender em 2022.
     O preço do Singapore Tourist Pass não veio confirmado em nenhuma fonte
     oficial (só em sítios de afiliados), por isso sai sem número. */
  'Singapura': {operador:'SMRT / SBS Transit', url:'https://www.sbstransit.com.sg/fares-and-concessions', actualizado:'2026-08-30', fonte:'https://www.sbstransit.com.sg/fares-and-concessions', moeda:'SGD',
    nota:'A tarifa é por distância, paga com EZ-Link, SimplyGo ou cartão bancário sem contacto: quanto mais anda, mais paga, dentro destes escalões. Não há bilhete de papel avulso desde 2022. O Singapore Tourist Pass existe e dá viagens ilimitadas, mas não confirmámos o preço em nenhuma fonte oficial: veja-o antes de comprar.',
    bilhetes:[
      {nome:'Metro/LRT, até 3,2 km (fora de hora de ponta)', preco:1.28, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metro/LRT, 5,3 a 6,2 km (fora de hora de ponta)', preco:1.59, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metro/LRT, 10,3 a 11,2 km (fora de hora de ponta)', preco:1.90, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* O istanbulkart.istanbul é uma aplicação de página única que daqui não
     desenha nada, nem em navegador real, e a página de tarifário da İETT
     tem os títulos das secções mas nenhum valor. Quem publica o preço em
     HTML é o Metro İstanbul, e é de lá que vem: 46,20 ₺ a viagem, igual em
     Anonim Kart e em İstanbulkart. Estava 27 ₺, de 2026-01-01 e nunca
     conferido. O preço do cartão e a tarifa do M11 do aeroporto não vinham
     em nenhuma das páginas: saem, e ficam ditos sem número. */
  'Istambul': {operador:'İETT / Metro İstanbul', url:'https://www.metro.istanbul/SeferDurumlari/BiletUcretleri', actualizado:'2026-08-30', fonte:'https://www.metro.istanbul/SeferDurumlari/BiletUcretleri', moeda:'TRY',
    nota:'É preciso um cartão para andar: o İstanbulkart ou o Anonim Kart, que se compram nas máquinas das estações e custam à parte da viagem. A linha M11 do aeroporto tem tarifa própria, que não vem nesta página.',
    bilhetes:[
      {nome:'Viagem com İstanbulkart ou Anonim Kart', preco:46.20, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','barco','funicular']}
    ]},

  'Atenas': {operador:'OASA', url:'https://www.oasa.gr/en/tickets/prices-of-products/', comprar:'https://www.oasa.gr/en/tickets/points-of-sale-reloading/points-of-supply-for-tickets-and-cards/', actualizado:'2026-08-24', fonte:'https://www.oasa.gr/en/tickets/prices-of-products/',
    nota:'Os bilhetes normais não servem para o aeroporto: essa viagem tem tarifa própria.',
    bilhetes:[
      {nome:'Bilhete de 90 minutos', preco:1.20, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete de 24 h', preco:4.10, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Aeroporto ↔ centro (metro, linha 3)', preco:9.00, unidade:'viagem', quando:'chegada', modos:['metro','aeroporto']},
      {nome:'Turístico 3 dias (inclui ida e volta ao aeroporto)', preco:20.00, unidade:'3 dias', quando:'chegada', modos:['metro','autocarro','eletrico','aeroporto']}
    ]},
  'Bruxelas': {operador:'STIB-MIVB', url:'https://www.stib-mivb.be/home/client-support/fares-and-tickets', actualizado:'2026-08-24', fonte:'https://www.stib-mivb.be/home/client-support/fares-and-tickets',
    nota:'Pagar por aproximação com o cartão bancário fica mais barato do que comprar o bilhete avulso.',
    bilhetes:[
      {nome:'Viagem avulsa', preco:2.60, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Viagem por aproximação (cartão bancário)', preco:2.40, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Passe de 24 h', preco:8.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  'Veneza': {operador:'ACTV / AVM', url:'https://actv.avmspa.it/en/content/integrated-fares-0', comprar:'https://www.veneziaunica.it/', actualizado:'2026-08-24', fonte:'https://actv.avmspa.it/en/content/integrated-fares-0',
    nota:'Em Veneza o «autocarro» é o vaporetto. A viagem avulsa é cara ao ponto de o passe de 24 h compensar a partir de três viagens.',
    bilhetes:[
      {nome:'Vaporetto, 75 minutos', preco:9.50, unidade:'viagem', quando:'chegada', modos:['barco']},
      {nome:'Passe de 24 h', preco:25.00, unidade:'24 h', quando:'chegada', modos:['barco','autocarro']},
      {nome:'Passe de 48 h', preco:35.00, unidade:'48 h', quando:'chegada', modos:['barco','autocarro']},
      {nome:'Passe de 72 h', preco:45.00, unidade:'72 h', quando:'chegada', modos:['barco','autocarro']},
      {nome:'Passe de 7 dias', preco:65.00, unidade:'7 dias', quando:'chegada', modos:['barco','autocarro']}
    ]},
  'Florença': {operador:'Autolinee Toscane', url:'https://www.at-bus.it/en/ticket', actualizado:'2026-08-24', fonte:'https://www.at-bus.it/en/ticket',
    nota:'Comprado a bordo, o mesmo bilhete custa 2,50 €. Compre antes de entrar.',
    bilhetes:[
      {nome:'Bilhete de 90 minutos (comprado antes)', preco:1.70, unidade:'viagem', quando:'antes', modos:['autocarro','eletrico']},
      {nome:'Bilhete de 90 minutos (comprado a bordo)', preco:2.50, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  'Copenhaga': {operador:'DOT (Movia / Metro / DSB)', url:'https://www.publictransport.dk/tickets/citypass', actualizado:'2026-08-24', fonte:'https://www.publictransport.dk/tickets/citypass', moeda:'DKK',
    bilhetes:[
      {nome:'Bilhete simples, 2 zonas', preco:30, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','comboio']},
      {nome:'City Pass 24 h (todas as zonas)', preco:100, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','comboio','barco','aeroporto']}
    ]},
  'Varsóvia': {operador:'ZTM Warszawa', url:'https://www.wtp.waw.pl/en/ticket-tariff/', actualizado:'2026-08-24', fonte:'https://www.wtp.waw.pl/en/ticket-tariff/', moeda:'PLN',
    bilhetes:[
      {nome:'Bilhete de 20 minutos (zona 1)', preco:3.40, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Bilhete de 24 h (zona 1)', preco:26.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']}
    ]},
  'Edimburgo': {operador:'Lothian Buses / Edinburgh Trams', url:'https://www.lothianbuses.com/tickets/', actualizado:'2026-08-24', fonte:'https://edinburghtrams.com/news/changes-tram-fares-2026', moeda:'GBP',
    nota:'A tarifa do eléctrico para o aeroporto é a única que não subiu este ano.',
    bilhetes:[
      {nome:'Autocarro, viagem simples', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'DAYticket (autocarro e eléctrico)', preco:6.00, unidade:'dia', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Eléctrico, viagem na cidade', preco:2.40, unidade:'viagem', quando:'chegada', modos:['eletrico']},
      {nome:'Eléctrico, aeroporto ↔ centro', preco:7.90, unidade:'viagem', quando:'chegada', modos:['eletrico','aeroporto']}
    ]},
  'Dublin': {operador:'Transport for Ireland (TFI)', url:'https://www.transportforireland.ie/fares/', comprar:'https://about.leapcard.ie/dublin', actualizado:'2026-08-24', fonte:'https://about.leapcard.ie/tfi-90-minute-fare',
    cartao:{nome:'TFI Leap Card', preco:0, nota:'sem ela paga-se mais caro em dinheiro; é o cartão que dá estes preços'},
    nota:'Não há passe diário: há um tecto. Depois de gasto o tecto, as viagens do dia não custam mais nada.',
    bilhetes:[
      {nome:'Tarifa de 90 minutos (Leap Card)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico','comboio']},
      {nome:'Tecto diário (Dublin Bus)', preco:6.00, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Tecto semanal (Dublin Bus)', preco:24.00, unidade:'semana', quando:'chegada', modos:['autocarro']}
    ]},
  /* Tentado outra vez a 30/08/2026, em navegador real: o tussam.es responde
     com o desafio de bot da Cloudflare e nunca chega a servir a página.
     Não é o JavaScript que trava, é a verificação. Fica sem valores. */
  'Sevilha': {operador:'TUSSAM', url:'https://www.tussam.es/en/node/1442', actualizado:'2026-08-30', fonte:'https://www.tussam.es/en/node/1442',
    nota:'A página de tarifário da TUSSAM está atrás de uma verificação de bot que não nos deixou lá chegar. Abra-a no seu navegador para ver os preços.',
    bilhetes:[]},
  /* Lida a tabela do Metrovalencia a 30/08/2026. É por zonas: a cidade é a
     zona A, e os títulos SUMA T valem na combinação AB. São os valores da
     rede de metro e eléctrico; a EMT (autocarros) tem tarifário próprio,
     que não vem nesta página. */
  'Valência': {operador:'Metrovalencia', url:'https://www.metrovalencia.es/es/nuestras-tarifas/', actualizado:'2026-08-30', fonte:'https://www.metrovalencia.es/es/nuestras-tarifas/',
    nota:'O preço depende da zona: a cidade é a zona A. O título não inclui o suporte: o cartão SUMA anónimo custa 2,20 € em plástico ou 1,10 € em cartão, à parte. Os autocarros da EMT têm tarifário próprio.',
    bilhetes:[
      {nome:'Sencillo, zona A ou B', preco:1.50, unidade:'viagem', quando:'chegada', modos:['metro','eletrico']},
      {nome:'Sencillo, zonas AB', preco:2.80, unidade:'viagem', quando:'chegada', modos:['metro','eletrico']},
      {nome:'SUMA T1, 24 h (zonas AB)', preco:4.50, unidade:'24 h', quando:'chegada', modos:['metro','eletrico']},
      {nome:'SUMA T2, 48 h (zonas AB)', preco:7.50, unidade:'48 h', quando:'chegada', modos:['metro','eletrico']},
      {nome:'SUMA T3, 72 h (zonas AB)', preco:11.00, unidade:'72 h', quando:'chegada', modos:['metro','eletrico']}
    ]},
  /* Málaga não estava na tabela: o utilizador via só uma procura. Lido na
     EMT Málaga a 30/08/2026. A própria página diz que são as tarifas de
     1 de Janeiro de 2025, prorrogadas durante 2026. */
  'Málaga': {operador:'EMT Málaga', url:'https://www.emtmalaga.es/es/tarifas', actualizado:'2026-08-30', fonte:'https://www.emtmalaga.es/es/tarifas',
    nota:'O bilhete simples não dá transbordo e não vale na linha A do aeroporto, que tem bilhete próprio. A recarga de 10 viagens dá transbordos gratuitos durante 1 h e sai a metade do preço à viagem, mas precisa de um cartão.',
    bilhetes:[
      {nome:'Bilhete ordinário', preco:1.40, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete do aeroporto (linha A)', preco:4.00, unidade:'viagem', quando:'chegada', modos:['autocarro','aeroporto']},
      {nome:'Recarga de 10 viagens', preco:5.00, unidade:'10 viagens', quando:'chegada', modos:['autocarro']}
    ]},
  /* O url antigo (task=view&id=1344) já não existe: o site da ANM mudou
     para um portal Salesforce («anm.it/s/…») que monta tudo em JavaScript,
     sem preços na página estática. As tarifas de Nápoles são geridas pelo
     consórcio regional UnicoCampania, cujo site também não mostrou preço
     nenhum ao `curl` (o achador só encontrou páginas de assinaturas
     anuais). Verificado a 31/08/2026. */
  'Nápoles': {operador:'ANM', url:'https://www.anm.it/s/biglietti-e-abbonamenti', actualizado:'2026-08-31', fonte:'https://www.anm.it/s/biglietti-e-abbonamenti',
    bilhetes:[]},
  /* Lido na SL a 30/08/2026, nas três sub-páginas de «Visitor tickets».
     Resolve a contradição que a ronda anterior apanhou nos guias, que davam
     a viagem simples ora a 42 ora a 43 SEK: são 43. */
  'Estocolmo': {operador:'SL', url:'https://sl.se/en/fares-and-tickets', actualizado:'2026-08-30', fonte:'https://sl.se/en/fares-and-tickets/visitor-tickets', moeda:'SEK',
    cartao:{nome:'Cartão SL', preco:50, nota:'só se precisa de um se não usar a aplicação nem o cartão bancário; é reutilizável numa próxima visita'},
    nota:'Os preços são os de adulto. Não se compram bilhetes a bordo. A ida a Arlanda leva uma sobretaxa de passagem nas cancelas do aeroporto, já incluída no valor abaixo; o Arlanda Express é outra empresa e não aceita títulos da SL.',
    bilhetes:[
      {nome:'Viagem simples (75 minutos)', preco:43, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Passe 24 h', preco:180, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Passe 72 h', preco:360, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Passe 7 dias', preco:470, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Aeroporto de Arlanda, viagem simples com passagem', preco:200, unidade:'viagem', quando:'chegada', modos:['comboio','aeroporto']}
    ]},
  'Oslo': {operador:'Ruter', url:'https://ruter.no/en/', actualizado:'2026-08-24', fonte:'https://ruter.no/en/', moeda:'NOK',
    bilhetes:[]},
  /* Helsínquia não estava na tabela. Lido na HSL a 30/08/2026: o simples
     em /single-tickets, os passes em /day-tickets. São os valores de
     adulto na zona AB, que é a cidade. */
  'Helsínquia': {operador:'HSL', url:'https://www.hsl.fi/en/tickets-and-fares', actualizado:'2026-08-30', fonte:'https://www.hsl.fi/en/tickets-and-fares/day-tickets',
    nota:'Os preços são os da zona AB, que cobre Helsínquia. Comprar na aplicação da HSL fica mais barato do que na máquina ou por aproximação. O aeroporto fica na zona C e obriga a um título ABC.',
    bilhetes:[
      {nome:'Bilhete simples na aplicação (80 minutos)', preco:3.30, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Bilhete simples em máquina ou por aproximação', preco:3.50, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Bilhete de 1 dia', preco:10.60, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Bilhete de 3 dias', preco:21.20, unidade:'3 dias', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']},
      {nome:'Bilhete de 7 dias', preco:42.40, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','barco']}
    ]},
  /* O endereço da MVV que aqui estava dava 404. O MVG é quem opera a
     rede dentro de Munique e o sítio responde. */
  /* Lida a 31/08/2026. Há também a Streifenkarte (10 tiras, 18,70 €, 1 a 2
     tiras por viagem consoante a distância), mas fica de fora por ser mais
     difícil de explicar sem inventar uma equivalência; os bilhetes e o
     diário «a partir de» já dão a ideia do custo para quem visita. */
  'Munique': {operador:'MVG', url:'https://www.mvg.de/abos-tickets/einzel-und-tageskarten.html', actualizado:'2026-08-31', fonte:'https://www.mvg.de/abos-tickets/einzel-und-tageskarten.html',
    nota:'O preço do bilhete e do diário depende das zonas atravessadas; o valor aqui é o «a partir de», para a zona central (M). Cobre metro, autocarro e eléctrico.',
    bilhetes:[
      {nome:'Einzelfahrkarte Kurzstrecke (até 4 paragens)', preco:2.10, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Einzelfahrkarte (a partir de)', preco:2.70, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Tageskarte (a partir de)', preco:7.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  /* Frankfurt não estava na tabela: passa a ter operador e ligação, ainda
     sem valores. O RMV não publica o preço do simples nem do diário em
     lado nenhum do sítio: as páginas dos dois títulos dizem, à letra,
     «you can find the price of your ticket in our timetable information», e
     mandam-no ao planeador de viagem. O único valor firme, lido a
     30/08/2026, é o do Deutschland-Ticket, que é subscrição mensal e não
     serve a quem passa lá três dias: fica dito na nota, sem entrar na
     conta da viagem. */
  /* A nota anterior dizia que o RMV só dava o preço através do planeador de
     percursos; lendo com mais cuidado, a 31/08/2026, a mesma página tinha
     mais abaixo uma excepção: a tarifa própria de Frankfurt (zona 5000),
     com preços fixos para quem não sai da cidade. Fora dessa zona continua
     a ser preciso o planeador, e a nota di-lo. */
  'Frankfurt': {operador:'RMV', url:'https://www.rmv.de/c/en/tickets', actualizado:'2026-08-31', fonte:'https://www.rmv.de/c/en/tickets/your-ticket/tickets-overview/single-tickets/single-ticket',
    nota:'Tarifa própria da cidade (zona 5000). Para viagens que saiam de Frankfurt, incluindo o aeroporto, o preço já não é fixo: introduza o percurso no planeador do operador. O Deutschland-Ticket, que cobre todos os transportes regionais da Alemanha, custa 63 € por mês e só se vende por subscrição.',
    bilhetes:[
      {nome:'Kurzstrecke (viagem curta)', preco:2.35, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Einzelfahrt (bilhete simples)', preco:3.80, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Tageskarte (diário)', preco:7.75, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'FrankfurtCard, 1 dia (com aeroporto e descontos turísticos)', preco:13.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']}
    ]},
  /* Lida a tabela oficial do ZVV a 24/08/2026, 2.ª classe, adulto. A
     cidade de Zurique é a zona 110, que conta como 2 zonas. */
  'Zurique': {operador:'ZVV', url:'https://www.zvv.ch/en/travelcards-and-tickets/tickets/single-tickets.html', comprar:'https://www.zvv.ch/en/travelcards-and-tickets/tickets/24h-tickets.html', actualizado:'2026-08-24', fonte:'https://www.zvv.ch/en/travelcards-and-tickets/tickets/24h-tickets.html', moeda:'CHF',
    nota:'A cidade conta como 2 zonas, por isso é a linha «1 a 2 zonas» que interessa a quem só anda em Zurique. O bilhete de rede local serve trajectos curtos.',
    bilhetes:[
      {nome:'Bilhete simples, rede local (30 min)', preco:2.80, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Bilhete simples, 1 a 2 zonas (1 h)', preco:4.70, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Passe 24 h, rede local', preco:5.60, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Passe 24 h, 1 a 2 zonas', preco:9.40, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'Passe 24 h, todas as zonas (inclui aeroporto)', preco:36.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','comboio','aeroporto']}
    ]},

  'Genebra': {operador:'TPG', url:'https://www.tpg.ch/fr/tarifs-titres-de-transport', actualizado:'2026-08-24', fonte:'https://www.tpg.ch/fr/tarifs-titres-de-transport', moeda:'CHF',
    nota:'O «saut de puce» só serve três paragens seguidas. Para andar pela cidade é o bilhete da zona 10.',
    bilhetes:[
      {nome:'Saut de puce (3 paragens)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Bilhete zona 10 (60 min)', preco:3.00, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico','comboio','barco']},
      {nome:'Cartão diário', preco:10.00, unidade:'dia', quando:'chegada', modos:['autocarro','eletrico','comboio','barco']},
      {nome:'Cartão diário a partir das 9 h', preco:8.00, unidade:'dia', quando:'chegada', modos:['autocarro','eletrico','comboio','barco']}
    ]},
  'Hamburgo': {operador:'HVV', url:'https://www.hvv.de/de/tickets/einzel-tagestickets', actualizado:'2026-08-24', fonte:'https://www.hvv.de/de/tickets/einzel-tagestickets',
    nota:'Os valores são da zona «Hamburgo AB», que cobre a cidade. Comprado na aplicação ou na loja em linha, o bilhete leva 7 % de desconto.',
    bilhetes:[
      {nome:'Bilhete simples (Hamburgo AB)', preco:4.10, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','comboio','barco']},
      {nome:'Bilhete diário (Hamburgo AB)', preco:8.20, unidade:'dia', quando:'chegada', modos:['metro','autocarro','comboio','barco']},
      {nome:'Bilhete diário de grupo (1 a 2 anéis)', preco:16.40, unidade:'dia', quando:'chegada', modos:['metro','autocarro','comboio','barco']}
    ]},
  'Toronto': {operador:'TTC', url:'https://www.ttc.ca/Fares-and-passes', actualizado:'2026-08-24', fonte:'https://www.ttc.ca/Fares-and-passes', moeda:'CAD',
    nota:'Quem paga em dinheiro não tem direito ao transbordo de duas horas.',
    bilhetes:[
      {nome:'Viagem com cartão PRESTO ou banco', preco:3.30, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Viagem em dinheiro', preco:3.35, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  'Montreal': {operador:'STM', url:'https://www.stm.info/fr/tarifs/titres-de-transport/1-passage-tous-modes', actualizado:'2026-08-24', fonte:'https://www.stm.info/fr/tarifs/titres-de-transport/1-passage-tous-modes', moeda:'CAD',
    nota:'Este título é da zona A. Para Laval ou Longueuil é preciso o título «Tous modes AB», que custa mais.',
    bilhetes:[
      {nome:'1 passagem, todos os modos (zona A)', preco:3.75, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  'Boston': {operador:'MBTA', url:'https://www.mbta.com/fares', actualizado:'2026-08-24', fonte:'https://www.mbta.com/fares', moeda:'USD',
    bilhetes:[
      {nome:'Metro, uma viagem', preco:2.40, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Autocarro local, uma viagem', preco:1.70, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'LinkPass mensal', preco:90.00, unidade:'mês', quando:'chegada', modos:['metro','autocarro']}
    ]},
  'São Francisco': {operador:'SFMTA (Muni)', url:'https://www.sfmta.com/getting-around/muni/fares', actualizado:'2026-08-24', fonte:'https://www.sfmta.com/getting-around/muni/fares', moeda:'USD',
    nota:'Pagar em dinheiro a bordo custa mais do que com o Clipper ou a aplicação MuniMobile.',
    bilhetes:[
      {nome:'Viagem com Clipper ou telemóvel (120 min)', preco:2.85, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico','funicular']},
      {nome:'Viagem em dinheiro', preco:3.00, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico','funicular']},
      {nome:'Passe diário', preco:5.70, unidade:'dia', quando:'chegada', modos:['autocarro','eletrico','funicular']}
    ]},
  'Los Angeles': {operador:'LA Metro', url:'https://www.metro.net/riding/fares/', actualizado:'2026-08-24', fonte:'https://www.metro.net/riding/fares/', moeda:'USD',
    nota:'Não há passe: há tectos. Pagas três viagens num dia, o resto do dia é grátis; os transbordos nas duas horas seguintes não contam.',
    bilhetes:[
      {nome:'Viagem simples', preco:1.75, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Tecto diário', preco:5.00, unidade:'dia', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Tecto de 7 dias', preco:18.00, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro']}
    ]},
  'Rio de Janeiro': {operador:'MetrôRio', url:'https://www.metrorio.com.br/como-pagar/meios-e-tarifas', actualizado:'2026-08-24', fonte:'https://www.metrorio.com.br/como-pagar/meios-e-tarifas', moeda:'BRL',
    nota:'As tarifas integradas já incluem a segunda viagem: sai mais barato do que pagar os dois bilhetes.',
    bilhetes:[
      {nome:'Metrô', preco:7.90, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metrô + autocarro (integração)', preco:8.80, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Metrô + BRT', preco:9.70, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  'São Paulo': {operador:'Metrô de São Paulo', url:'https://www.metro.sp.gov.br/sua-viagem/bilhetes-cartoes', actualizado:'2026-08-24', fonte:'https://www.metro.sp.gov.br/sua-viagem/bilhetes-cartoes', moeda:'BRL',
    nota:'O Bilhete Unitário em QR Code serve o Metrô e a CPTM e vende-se na aplicação, na bilheteira e nas máquinas.',
    bilhetes:[
      {nome:'Bilhete Unitário (QR Code)', preco:5.40, unidade:'viagem', quando:'chegada', modos:['metro','comboio']}
    ]},
  'Sydney': {operador:'Transport for NSW (Opal)', url:'https://transportnsw.info/tickets-fares/fares', actualizado:'2026-08-24', fonte:'https://transportnsw.info/tickets-fares/fares', moeda:'AUD',
    nota:'Não há passe de turista: paga-se por viagem e há um tecto. Ao fim-de-semana e nos feriados o tecto diário é metade.',
    bilhetes:[
      {nome:'Tecto diário (2.ª a 5.ª feira)', preco:19.30, unidade:'dia', quando:'chegada', modos:['metro','autocarro','comboio','barco']},
      {nome:'Tecto diário (6.ª, fim-de-semana e feriados)', preco:9.65, unidade:'dia', quando:'chegada', modos:['metro','autocarro','comboio','barco']},
      {nome:'Tecto semanal', preco:50.00, unidade:'semana', quando:'chegada', modos:['metro','autocarro','comboio','barco']}
    ]},
  /* Melbourne não estava na tabela. Lido no Departamento de Transportes de
     Victória a 30/08/2026, na tabela myki das zonas metropolitanas. São os
     valores da zona 1+2, que é a cidade e os subúrbios. */
  'Melbourne': {operador:'PTV (myki)', url:'https://transport.vic.gov.au/tickets-and-payments/fares', actualizado:'2026-08-30', fonte:'https://transport.vic.gov.au/tickets-and-payments/fares/metropolitan-train-tram-and-bus-fares', moeda:'AUD',
    nota:'O eléctrico é gratuito dentro da Free Tram Zone, no centro: para andar só por ali não precisa de título nenhum. Fora dela paga-se com myki, e a viagem de 2 h nunca custa mais do que o tecto do dia.',
    bilhetes:[
      {nome:'myki Money, 2 horas (zonas 1+2)', preco:2.85, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'myki Money, tecto diário (zonas 1+2)', preco:5.70, unidade:'dia', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'myki Money, tecto ao fim-de-semana e feriados', preco:4.00, unidade:'dia', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']},
      {nome:'myki Pass de 7 dias (zonas 1+2)', preco:28.50, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro','eletrico','comboio']}
    ]},
  /* A Horários do Funchal aponta para o tarifário comum a toda a Madeira, a
     TIIM (GIRO), que é onde os preços estão mesmo. Lida a 31/08/2026: os
     bilhetes normais têm dois valores (municipal | intermunicipal), mas o
     que serve quem visita é o Bilhete Regional Turístico, sem esse limite. O
     tiim.pt respondeu sem o certificado intermédio ao `curl` (a ligação
     completa-se na mesma, só falha a verificação estrita); num navegador
     normal costuma passar sem aviso. */
  'Funchal': {operador:'Horários do Funchal / TIIM', url:'https://tiim.pt/index.php/tarifarios/bilhetes', actualizado:'2026-08-31', fonte:'https://tiim.pt/index.php/tarifarios/bilhetes',
    nota:'O Bilhete de Bordo tem dois preços consoante o percurso ficar dentro do concelho (municipal) ou passar para outro (intermunicipal); o Regional Turístico não tem essa distinção e cobre toda a Madeira, aerobus incluído.',
    bilhetes:[
      {nome:'Bilhete de bordo (avulso, no veículo)', preco:2.05, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete Regional Turístico, 24 h', preco:13.75, unidade:'24 h', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete Regional Turístico, 3 dias', preco:23.00, unidade:'3 dias', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete Regional Turístico, 7 dias', preco:36.00, unidade:'7 dias', quando:'chegada', modos:['autocarro']}
    ]},
  'Faro': {operador:'Vamus Algarve', url:'https://www.vamusalgarve.pt/', actualizado:'2026-08-24', fonte:'https://www.vamusalgarve.pt/',
    bilhetes:[]},
  /* Não estava na tabela. A AzoresBus (Vale do Ave Açores) tomou conta de
     toda a rede de autocarros de São Miguel a 1 de Setembro de 2025,
     substituindo três operadores antigos; achada a 31/08/2026. A página de
     tarifários é montada em JavaScript, sem preços no HTML estático. */
  'Ponta Delgada': {operador:'AzoresBus', url:'https://azoresbus.pt/Tariff', actualizado:'2026-08-31', fonte:'https://azoresbus.pt/Tariff',
    bilhetes:[]},
  /* Lido a 31/08/2026: o bilhete avulso é calculado por uma calculadora de
     tarifas (linha, origem e destino), sem preço fixo nenhum, tal como o
     bilhete simples de Madrid; a nota di-lo. Os passes têm preço fixo. */
  'Tenerife': {operador:'TITSA', url:'https://www.titsa.com/index.php/en/your-buses/fares-and-discounts', actualizado:'2026-08-31', fonte:'https://www.titsa.com/index.php/en/your-buses/fares-and-discounts',
    nota:'O bilhete avulso depende da linha e do percurso, calculado numa ferramenta própria do operador; os passes cobrem autocarro e eléctrico em toda a ilha. É preciso um cartão Ten+ (2 €, à parte) para os carregar.',
    bilhetes:[
      {nome:'Day Travelcard (Ten+), 24 h', preco:10.00, unidade:'24 h', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'7 Days Travelcard (Ten+), 7 dias', preco:50.00, unidade:'7 dias', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  /* Lido na EMT Palma a 30/08/2026, em navegador: a página monta a tabela
     em JavaScript e por isso vinha vazia às rondas anteriores. São as
     tarifas ordinárias, pagas a bordo. A targeta ciutadana é para
     residentes e não entra. */
  'Palma de Maiorca': {operador:'EMT Palma', url:'https://www.emtpalma.cat/ca/tarifes/tarifes', actualizado:'2026-08-30', fonte:'https://www.emtpalma.cat/ca/tarifes/tarifes',
    nota:'Paga-se a bordo, em dinheiro (não aceitam notas acima de 5 €) ou com cartão bancário; nenhum destes bilhetes dá direito a transbordo. As linhas A1 e A2 só servem o aeroporto, sem paragens pelo meio.',
    bilhetes:[
      {nome:'Bilhete simples, urbano', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete simples, porto', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete do aeroporto (linhas A1 e A2)', preco:5.00, unidade:'viagem', quando:'chegada', modos:['autocarro','aeroporto']}
    ]},
  'Nice': {operador:"Lignes d'Azur", url:'https://www.lignesdazur.com/', actualizado:'2026-08-24', fonte:'https://www.lignesdazur.com/',
    bilhetes:[]},
  /* Lida a 31/08/2026: a página filtra por 160 produtos espalhados por 5
     páginas, sem URL fixo por título. Achados o bilhete avulso e o carnet de
     10; o CityPass turístico de 24/48/72 h existe (visto no catálogo), mas
     só apareceu com o preço de criança (6-12 anos): sem o preço de adulto
     confirmado, fica de fora. */
  'Marselha': {operador:'RTM', url:'https://www.rtm.fr/tarifs', actualizado:'2026-08-31', fonte:'https://www.rtm.fr/tarifs?page=2',
    nota:'Há também um CityPass turístico de 24, 48 e 72 horas, mas só se confirmou o preço da versão de criança (6-12 anos); por isso não entra aqui. Cobre autocarro, metro, eléctrico e o ferry do Vieux-Port.',
    bilhetes:[
      {nome:'Carte 1 voyage', preco:1.70, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Carte 10 voyages (carnet)', preco:15.00, unidade:'10 viagens', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  /* Lyon não estava na tabela. O sítio da TCL só mostra «a partir de»
     porque o preço varia com as zonas, mas o operador publica o guia
     tarifário completo em PDF, e é de lá que vem isto (páginas 18 e 19),
     na coluna «Zones 1 et 2», que é a cidade. Atenção: o próprio guia diz
     «à partir du 1er septembre 2026», e hoje é 30 de Agosto. São as
     tarifas que entram em vigor daqui a dois dias, e a nota di-lo. */
  'Lyon': {operador:'TCL', url:'https://www.tcl.fr/titres-et-tarifs/tous-les-titres-et-abonnements', actualizado:'2026-08-30', fonte:'https://www.tcl.fr/sites/default/files/2026-07/Guide_Tarifaire_TCL_Mai_2026.pdf',
    nota:'Valores das zonas 1 e 2, que cobrem a cidade, e que o guia da TCL dá como em vigor a partir de 1 de Setembro de 2026. Pagando com o cartão bancário não paga mais de 7,10 € por dia, o mesmo que o passe de 24 h. O título carrega-se num bilhete recarregável que custa 0,20 € à primeira compra.',
    bilhetes:[
      {nome:'1 voyage (1 h nas zonas 1 e 2)', preco:2.10, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']},
      {nome:'1 voyage comprado a bordo (com suporte)', preco:2.60, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Carnet de 10 voyages', preco:20.50, unidade:'10 viagens', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']},
      {nome:'Pass 24h', preco:7.10, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']},
      {nome:'Pass 48h', preco:13.20, unidade:'48 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']},
      {nome:'Pass 72h', preco:18.50, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','eletrico','funicular']}
    ]},
  /* Lido na TfGM a 30/08/2026: o bilhete de autocarro em
     tfgm.com/tickets-and-passes/bus-tickets e os tectos por aproximação em
     tfgm.com/ways-to-pay/contactless, que é o que fica como fonte. O
     eléctrico avulso é por zonas e não entra. */
  'Manchester': {operador:'Bee Network (TfGM)', url:'https://tfgm.com/tickets-and-passes', actualizado:'2026-08-30', fonte:'https://tfgm.com/ways-to-pay/contactless', moeda:'GBP',
    nota:'Pague por aproximação com o mesmo cartão ou telemóvel e nunca paga mais do que o tecto, que cobre autocarro e eléctrico juntos. No eléctrico tem de validar à entrada e à saída.',
    bilhetes:[
      {nome:'Bee Bus, bilhete simples (1 h de mudanças)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Tecto diário, autocarro e eléctrico', preco:9.50, unidade:'dia', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Tecto semanal, autocarro e eléctrico', preco:41.00, unidade:'semana', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  'Cracóvia': {operador:'MPK Kraków', url:'https://mpk.krakow.pl/en/kmk-tickets', actualizado:'2026-08-31', fonte:'https://mpk.krakow.pl/en/kmk-tickets', moeda:'PLN',
    nota:'A zona I cobre o centro; a I+II+III chega aos arredores. O bilhete de 24 h da zona I é mais barato do que o das três zonas juntas.',
    bilhetes:[
      {nome:'Bilhete de 30 minutos ou viagem única', preco:6.00, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete de 24 h, zona I', preco:20.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete de 72 h, zonas I+II+III', preco:55.00, unidade:'72 h', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  'Zagreb': {operador:'ZET', url:'https://www.zet.hr/cijene-prodaja-i-placanje/cijene-karata-grad-zagreb/400', actualizado:'2026-08-31', fonte:'https://www.zet.hr/cijene-prodaja-i-placanje/cijene-karata-grad-zagreb/400',
    nota:'Comprado ao condutor custa mais: o bilhete de 90 minutos, por exemplo, sobe de 1,33 € para 1,99 €. Os valores aqui são os de pré-compra (máquina, aplicação ou quiosque).',
    bilhetes:[
      {nome:'Bilhete de 90 minutos', preco:1.33, unidade:'viagem', quando:'antes', modos:['autocarro','eletrico']},
      {nome:'Bilhete diário', preco:3.98, unidade:'24 h', quando:'antes', modos:['autocarro','eletrico']},
      {nome:'Bilhete de 3 dias', preco:9.29, unidade:'3 dias', quando:'antes', modos:['autocarro','eletrico']}
    ]},
  'Reiquiavique': {operador:'Strætó', url:'https://straeto.is/', actualizado:'2026-08-24', fonte:'https://straeto.is/', moeda:'ISK',
    bilhetes:[]},
  'Bogotá': {operador:'TransMilenio', url:'https://www.transmilenio.gov.co/viaje-en-transmi/medios-de-pago/tarifas-del-sistema-transmilenio', actualizado:'2026-08-31', fonte:'https://www.transmilenio.gov.co/viaje-en-transmi/medios-de-pago/tarifas-del-sistema-transmilenio',
    moeda:'COP', nota:'Tarifa única, sem zonas, o dia inteiro. É preciso o cartão tullave (8.000 COP à parte) para viajar.',
    bilhetes:[
      {nome:'TransMilenio / TransMiZonal / TransMiCable', preco:3550, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  'Santiago': {operador:'Red Movilidad', url:'https://www.red.cl/tarifas-y-recargas/conoce-las-tarifas/', actualizado:'2026-08-31', fonte:'https://www.red.cl/tarifas-y-recargas/conoce-las-tarifas/', moeda:'CLP',
    nota:'O metro muda de preço consoante a hora: 735 CLP fora de horas (6h-7h e 20h45-23h), 815 CLP em horário valle (o resto do dia e fins-de-semana, valor usado aqui) e 895 CLP nas horas de ponta (7h-9h e 18h-20h). O autocarro é sempre 795 CLP. Precisa do cartão bip! para pagar.',
    bilhetes:[
      {nome:'Autocarro', preco:795, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Metro (horário valle)', preco:815, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Lido a 31/08/2026: a calculadora referida na nota anterior tinha, mais
     abaixo na mesma página, a tabela completa por escalão de distância.
     Entram três escalões, tarifa Mover fora de hora de ponta (a mais
     barata das quatro combinações possíveis). */
  'Cidade do Cabo': {operador:'MyCiTi', url:'https://www.myciti.org.za/en/myconnect-fares/pay-as-you-go/', actualizado:'2026-08-31', fonte:'https://www.myciti.org.za/en/myconnect-fares/pay-as-you-go/', moeda:'ZAR',
    nota:'Tarifa por distância, com cartão myconnect pré-carregado (Mover). Fora da hora de ponta (06:45-08:00 e 16:15-17:30 em dias úteis) é mais barato; aos fins-de-semana é sempre este preço mais baixo. Sem carregar um pacote Mover, paga-se a tarifa Standard, mais cara.',
    bilhetes:[
      {nome:'0 a 5 km', preco:15.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'10 a 20 km', preco:25.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Mais de 60 km', preco:46.00, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Lido a 31/08/2026: a tarifa é por zona atravessada, mas a tabela por
     zona está numa imagem/widget, não em texto. Achado real e sem número
     inventado: o tecto de gasto (fare cap), esse sim em texto simples. */
  'Auckland': {operador:'Auckland Transport', url:'https://at.govt.nz/bus-train-ferry/fares-and-discounts/bus-and-train-fares', actualizado:'2026-08-31', fonte:'https://at.govt.nz/bus-train-ferry/fares-and-discounts/bus-and-train-fares', moeda:'NZD',
    nota:'A tarifa é por zonas atravessadas (até 4), e a tabela por zona não veio em texto simples. O que se confirmou foi o tecto de gasto: no máximo 20 NZD por dia a pagar por contactless, ou 50 NZD por 7 dias com o cartão AT HOP.',
    bilhetes:[]},
  /* Lido no MTR a 30/08/2026. A tarifa normal do metro é por distância,
     estação a estação, e o operador não publica nenhum valor único que se
     possa pôr aqui: ficam os dois títulos de preço fixo, que são os que
     interessam a quem chega. O Tourist Day Pass veio de
     mtr.com.hk/en/customer/tickets/day_pass_tourist.html. */
  'Hong Kong': {operador:'MTR', url:'https://www.mtr.com.hk/en/customer/tickets/index.php', actualizado:'2026-08-30', fonte:'https://www.mtr.com.hk/en/customer/tickets/tf_index.html', moeda:'HKD',
    nota:'A tarifa normal do metro depende da distância entre as estações: consulte-a no calculador do MTR. O Tourist Day Pass não serve na Airport Express nem para Lo Wu e Lok Ma Chau.',
    bilhetes:[
      {nome:'Tourist Day Pass (1 dia de metro)', preco:75, unidade:'dia', quando:'chegada', modos:['metro']},
      {nome:'Airport Express, aeroporto ↔ Hong Kong (Octopus ou cartão bancário)', preco:120, unidade:'viagem', quando:'chegada', modos:['comboio','aeroporto']},
      {nome:'Airport Express, aeroporto ↔ Hong Kong, ida e volta', preco:215, unidade:'viagem', quando:'chegada', modos:['comboio','aeroporto']}
    ]},
  /* Lido a 31/08/2026: tarifa por distância, como Hong Kong, Deli e Tóquio.
     Entram três escalões representativos; a faixa completa (cinco
     escalões, de 190 a 390 ienes) fica dita na nota. */
  'Osaka': {operador:'Osaka Metro', url:'https://subway.osakametro.co.jp/guide/fare/fare/price.php', actualizado:'2026-08-31', fonte:'https://subway.osakametro.co.jp/guide/fare/fare/price.php', moeda:'JPY',
    nota:'A tarifa é por distância, com cartão IC (ICOCA): de 190 ienes até 3 km a 390 ienes acima de 19 km, em cinco escalões.',
    bilhetes:[
      {nome:'Até 3 km', preco:190, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'7 a 13 km', preco:290, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Acima de 19 km', preco:390, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Lido no Rapid KL a 30/08/2026. A tarifa avulsa é por distância e o
     operador só a publica em tabelas em imagem, estação a estação: não
     entra. O passe Rapid Kota (10 e 25 RM) também não, porque a página
     diz «exclusively for Malaysians only». Fica o Kembara, que é o que a
     página dá como aberto a todos e feito para turistas. */
  'Kuala Lumpur': {operador:'Rapid KL', url:'https://myrapid.com.my/bus-train/rapid-kl/integrated-fare-table/', actualizado:'2026-08-30', fonte:'https://myrapid.com.my/our-products/rapidkembarapass/', moeda:'MYR',
    nota:'O preço do passe não inclui o cartão Touch ’n Go, que se compra à parte e tem de ter saldo mínimo. A tarifa avulsa depende da distância: veja a tabela do operador. Há um passe mais barato, o Rapid Kota, mas é só para residentes com bilhete de identidade malaio; não entra aqui por não estar aberto a quem visita.',
    bilhetes:[
      {nome:'Rapid Kembara, 1 dia (comboio e autocarro)', preco:25, unidade:'dia', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Rapid Kembara, 3 dias (comboio e autocarro)', preco:55, unidade:'3 dias', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Lido no Delhi Metro a 30/08/2026, na tabela de tarifas por distância e
     na página do cartão turístico. A faixa de 5 a 12 km é a que apanha a
     maior parte dos trajectos dentro da cidade; a nota diz a tabela toda,
     para não dar a entender que há uma tarifa única. */
  'Deli': {operador:'Delhi Metro', url:'https://delhimetrorail.com/fare', actualizado:'2026-08-30', fonte:'https://delhimetrorail.com/fare', moeda:'INR',
    nota:'A tarifa é por distância, de seg. a sáb.: 11 ₹ até 2 km, 21 até 5, 32 até 12, 43 até 21, 54 até 32 e 64 acima disso. Ao domingo e nos feriados desce um escalão. O cartão turístico inclui 50 ₹ de caução, devolvidos, e não serve na linha do aeroporto.',
    bilhetes:[
      {nome:'Metro, 5 a 12 km (seg. a sáb.)', preco:32, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Cartão turístico, 1 dia (com caução)', preco:200, unidade:'dia', quando:'chegada', modos:['metro']},
      {nome:'Cartão turístico, 3 dias (com caução)', preco:500, unidade:'3 dias', quando:'chegada', modos:['metro']}
    ]},
  /* A página é um formulário de procura por estação (origem/destino), sem
     tabela nenhuma na página estática. Verificado a 31/08/2026. */
  'Banguecoque': {operador:'BTS SkyTrain', url:'https://www.bts.co.th/', actualizado:'2026-08-31', fonte:'https://www.bts.co.th/', moeda:'THB',
    bilhetes:[]},
  /* Dubai não estava na tabela. Lido na RTA a 30/08/2026. É por zonas (são
     sete), e o preço depende de quantas atravessa, por isso ficam as três
     linhas da tabela, e não um valor inventado à média. O nol Silver é o
     cartão normal; o Red Ticket é o bilhete de papel, mais caro à viagem. */
  'Dubai': {operador:'RTA', url:'https://www.rta.ae/wps/portal/rta/ae/public-transport/Nol-Fares?lang=en', actualizado:'2026-08-30', fonte:'https://www.rta.ae/wps/portal/rta/ae/public-transport/Nol-Fares?lang=en', moeda:'AED',
    nota:'A tarifa depende de quantas das sete zonas atravessa. O cartão nol Silver serve metro, eléctrico e autocarro e sai mais barato à viagem do que o nol Red Ticket de papel, que custa 4, 6 ou 8,50 AED conforme as zonas. As mudanças entre modos contam como uma só viagem se as fizer em 30 minutos.',
    bilhetes:[
      {nome:'nol Silver, dentro de 1 zona', preco:3.00, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'nol Silver, 2 zonas contíguas', preco:5.00, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'nol Silver, mais de 2 zonas', preco:7.50, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Passe de 7 dias, todas as zonas (nol Silver)', preco:110, unidade:'7 dias', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  'Miami': {operador:'Miami-Dade Transit', url:'https://www.miamidade.gov/global/transportation/transit-pass.page', actualizado:'2026-08-24', fonte:'https://www.miamidade.gov/global/transportation/transit-pass.page', moeda:'USD',
    nota:'O Metromover, no centro, é gratuito.',
    bilhetes:[
      {nome:'Metrorail, uma viagem', preco:2.25, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metrobus, uma viagem', preco:2.25, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Autocarro expresso entre condados', preco:2.65, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  'Orlando': {operador:'LYNX', url:'https://www.golynx.com/fares-passes', actualizado:'2026-08-24', fonte:'https://www.golynx.com/fares-passes', moeda:'USD',
    nota:'O passe diário tem de ser pedido ao motorista ANTES de pôr o dinheiro na máquina.',
    bilhetes:[
      {nome:'Viagem simples', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Passe diário', preco:4.50, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Passe de 7 dias', preco:16.00, unidade:'7 dias', quando:'chegada', modos:['autocarro']}
    ]},
  'Salvador': {operador:'CCR Metrô Bahia', url:'https://www.ccrmetrobahia.com.br/', actualizado:'2026-08-24', fonte:'https://www.ccrmetrobahia.com.br/', moeda:'BRL',
    bilhetes:[
      {nome:'Metrô, uma viagem', preco:4.10, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* O url antigo (buenosaires.gob.ar/subte) passou a reencaminhar para o
     arquivo histórico da Cidade («gcaba_historico»): deixou de ser a
     tarifa em vigor. A fonte actual é a Secretaria de Transporte
     (argentina.gob.ar), que publica a tabela de todo o transporte da AMBA.
     Lida a 31/08/2026. */
  'Buenos Aires': {operador:'SBASE (Subte)', url:'https://www.argentina.gob.ar/redsube/tarifas-de-transporte-publico-amba', actualizado:'2026-08-31', fonte:'https://www.argentina.gob.ar/redsube/tarifas-de-transporte-publico-amba', moeda:'ARS',
    nota:'Com cartão SUBE registada, o preço desce com o número de viagens no mês (de 1.684 até 1.010 ARS); sem registar, que é o caso de quem visita, é sempre 2.526 ARS.',
    bilhetes:[
      {nome:'Subte, SUBE sem registar', preco:2526.00, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  'Dubrovnik': {operador:'Libertas Dubrovnik', url:'https://www.libertasdubrovnik.hr/cjenik', actualizado:'2026-08-31', fonte:'https://www.libertasdubrovnik.hr/cjenik',
    nota:'O bilhete comprado no veículo custa mais do que o de 1 hora pré-comprado.',
    bilhetes:[
      {nome:'Bilhete de 1 hora (pré-comprado)', preco:1.73, unidade:'viagem', quando:'antes', modos:['autocarro']},
      {nome:'Bilhete comprado no autocarro', preco:2.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete diário', preco:5.31, unidade:'24 h', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete de 3 dias', preco:11.95, unidade:'3 dias', quando:'chegada', modos:['autocarro']}
    ]},
  'Recife': {operador:'Grande Recife Consórcio de Transporte', url:'https://www.granderecife.pe.gov.br/transporte/tarifas/', actualizado:'2026-08-31', fonte:'https://www.granderecife.pe.gov.br/transporte/tarifas/',
    moeda:'BRL',
    bilhetes:[
      {nome:'Bilhete único (autocarro urbano)', preco:4.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Tarifa do metro', preco:4.25, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. O operador é a ETUFOR (empresa municipal); vários
     jornais e a própria Prefeitura anunciaram R$ 5,40 a partir de Janeiro
     de 2026, mas não se achou uma página oficial só com o valor, em texto,
     para citar como fonte (a página do catálogo de serviços falhou a
     ligação, e a da Prefeitura monta o conteúdo em JavaScript). Sem uma
     fonte primária legível, fica só o operador. Verificado a 31/08/2026. */
  'Fortaleza': {operador:'ETUFOR', url:'https://mobilidade.fortaleza.ce.gov.br/transporte/etufor.html', actualizado:'2026-08-31', fonte:'https://mobilidade.fortaleza.ce.gov.br/transporte/etufor.html',
    moeda:'BRL', bilhetes:[]},
  'Casablanca': {operador:'Casa Tramway', url:'https://www.casatramway.ma/ticket-abonnement/nos-offres', actualizado:'2026-08-31', fonte:'https://www.casatramway.ma/ticket-abonnement/nos-offres',
    moeda:'MAD', nota:'O cartão recarregável baixa o preço por viagem para 6 dh, mas exige 15 dh à parte pelo cartão (válido 5 anos).',
    bilhetes:[
      {nome:'Ticket unitário, 1 viagem', preco:8, unidade:'viagem', quando:'chegada', modos:['eletrico']},
      {nome:'Ticket unitário, 2 viagens', preco:14, unidade:'2 viagens', quando:'chegada', modos:['eletrico']}
    ]},
  /* O url antigo redirecciona para metrohanoi.vn; a página das tarifas
     (afc-tickets/metro-fares-1/) monta os preços em JavaScript. Verificado
     a 31/08/2026. */
  'Hanói': {operador:'Hanoi Metro', url:'https://metrohanoi.vn/afc-tickets/metro-fares-1/', actualizado:'2026-08-31', fonte:'https://metrohanoi.vn/afc-tickets/metro-fares-1/', moeda:'VND',
    bilhetes:[]},
};

/* Modos de transporte, para se ver de relance o que cada título cobre. */
const MODOS_TRANSPORTE = {
  metro:     {nome:'Metro',      icone:'🚇'},
  autocarro: {nome:'Autocarro',  icone:'🚌'},
  eletrico:  {nome:'Eléctrico',  icone:'🚋'},
  comboio:   {nome:'Comboio',    icone:'🚆'},
  barco:     {nome:'Barco',      icone:'⛴'},
  funicular: {nome:'Elevadores', icone:'🚡'},
  aeroporto: {nome:'Aeroporto',  icone:'✈'}
};

/* dados de transporte para uma cidade, ou nulo se não os tivermos */
function transportesDe(cidade){
  return (cidade && TRANSPORTES_DESTINO[cidade.n]) || null;
}

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
    /* Estes dois tinham caminhos de pesquisa montados por nós («/pt/search?
       location=…» e «/pt/search-results?location=…»), que não existem nestes
       sítios e devolviam «Página não encontrada». Uma ligação profunda só vale
       se for a que o parceiro documenta; inventada, é pior do que nenhuma.
       Ficam as páginas de entrada até haver um formato confirmado. */
    case 'rentalcars':
      return 'https://www.rentalcars.com/pt/';
    case 'discovercars':
      return 'https://www.discovercars.com/pt';
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
    /* A Busbud, a CheckMyBus e a Rail Europe caem no «default», que usa o
       domínio declarado no PARCEIROS. Não lhes montamos caminho de rota nem
       de idioma: o que não está confirmado não se inventa (foi assim que a
       Discover Cars foi parar a uma «Página não encontrada»). */
    default:
      return PARCEIROS[chave] ? 'https://' + PARCEIROS[chave].dom : '#';
  }
}

/* Dos parceiros de comboio e de autocarro, estes dois são os únicos cujo
   endereço de rota («de A para B») está confirmado. Nos restantes a ligação
   é a página de entrada, e o site diz isso na linha em vez de prometer uma
   pesquisa já feita. */
const ROTA_DIRECTA = new Set(['rome2rio', 'omio']);

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
