/* ═══════════════════════════════════════════════════════════════
   TripNexus: dados: cidades, parceiros e cupões
   ═══════════════════════════════════════════════════════════════ */

/* Cidades disponíveis no autocomplete (nome, país, bandeira, IATA, lat, lng,
   índice de custo local de 0.6 a 1.6 usado nas estimativas de alojamento).

   14 cidades acrescentadas a 03/09/2026, depois de um utilizador reportar
   que faltavam aeroportos: cruzou-se a rede real de destinos da TAP (a
   companhia de bandeira, o sinal mais relevante para quem usa este site)
   com a lista aqui, e ficaram de fora Bissau, São Tomé, Mindelo, Chicago,
   Washington D.C., Bilbau, Santiago de Compostela, Brasília, Belo
   Horizonte, Dakar, Acra, Argel, Luxemburgo e Bolonha, todas com voo TAP
   real e activo. Não é uma lista exaustiva de todos os 84+ destinos da
   TAP: ficaram por acrescentar dezenas de rotas menores (a maioria no
   Brasil e na rede regional espanhola), que podem entrar numa próxima
   ronda se fizer sentido. Nomes em português: onde a TAP/Wikipédia lista
   a cidade só em inglês, usa-se o exónimo português corrente (Bilbau,
   Acra, Argel, Bolonha), tal como já se fazia para Londres ou Genebra;
   ver `WIKI_EN` para a forma inglesa usada nas pesquisas de alojamento. */
const CIDADES = [
  {n:'Lisboa',        p:'Portugal',        f:'🇵🇹', i:'LIS', la:38.716, lo:-9.139, c:1.00},
  {n:'Porto',         p:'Portugal',        f:'🇵🇹', i:'OPO', la:41.149, lo:-8.611, c:0.92},
  {n:'Faro',          p:'Portugal',        f:'🇵🇹', i:'FAO', la:37.019, lo:-7.930, c:0.95},
  {n:'Funchal',       p:'Portugal',        f:'🇵🇹', i:'FNC', la:32.650, lo:-16.908,c:0.95},
  {n:'Ponta Delgada', p:'Portugal',        f:'🇵🇹', i:'PDL', la:37.741, lo:-25.680,c:0.88},
  /* Bragança, Vila Real e Viseu têm aeródromo municipal com código IATA
     real (BGC, VRL, VSE) e uma ligação aérea PSO regular operada pela
     Sevenair (ex-AeroVIP), de segunda a sábado, ligando as três a Cascais
     e Portimão: por isso o «i» é o código a sério, não um inventado. Mas a
     Sevenair é uma companhia pequena de mais para as fontes de voos deste
     site (Travelpayouts e semelhantes): uma pesquisa aqui nunca vai
     encontrar essas tarifas. Em vez de mostrar sempre «nenhum voo
     encontrado» (verdade, mas inútil), levam `semAeroporto:true` na mesma,
     para forçar o modelo «Ir por terra»; o que muda é a mensagem, que diz
     a verdade (têm voo, só não o comparamos) em vez de negar o aeroporto,
     com uma ligação ao site da Sevenair para quem quiser essa via. Ver
     `vooLimitado` e a frase em `fraseSemVoo()`, results.js. */
  {n:'Bragança',      p:'Portugal',        f:'🇵🇹', i:'BGC', la:41.807, lo:-6.757, c:0.75, semAeroporto:true,
    vooLimitado:{operador:'Sevenair', url:'https://www.flysevenair.com/'}},
  {n:'Vila Real',     p:'Portugal',        f:'🇵🇹', i:'VRL', la:41.301, lo:-7.741, c:0.78, semAeroporto:true,
    vooLimitado:{operador:'Sevenair', url:'https://www.flysevenair.com/'}},
  {n:'Viseu',         p:'Portugal',        f:'🇵🇹', i:'VSE', la:40.657, lo:-7.912, c:0.78, semAeroporto:true,
    vooLimitado:{operador:'Sevenair', url:'https://www.flysevenair.com/'}},
  /* Cidades do interior/centro/norte português sem qualquer aeroporto
     comercial (Beja tem aeródromo, mas sem voos regulares: só aviação
     executiva, com plano para reabrir a comercial não antes de 2028).
     Entram só para quem procura alojamento, actividades ou como chegar lá
     por terra. O «i» não é um código IATA real (esses têm sempre três
     letras; estes têm quatro de propósito, para nunca colidir com um
     verdadeiro), serve só de identificador interno. `semAeroporto:true` é
     o que despoleta, em results.js, a troca do bloco de voos por uma
     explicação e a exibição forçada do bloco «Ir por terra», mesmo sem o
     utilizador marcar comboio/autocarro na pesquisa. */
  {n:'Coimbra',           p:'Portugal',    f:'🇵🇹', i:'COIM',la:40.203, lo:-8.410, c:0.85, semAeroporto:true},
  {n:'Aveiro',            p:'Portugal',    f:'🇵🇹', i:'AVEI',la:40.641, lo:-8.654, c:0.85, semAeroporto:true},
  {n:'Guarda',            p:'Portugal',    f:'🇵🇹', i:'GRDA',la:40.537, lo:-7.268, c:0.75, semAeroporto:true},
  {n:'Covilhã',           p:'Portugal',    f:'🇵🇹', i:'COVI',la:40.280, lo:-7.504, c:0.75, semAeroporto:true},
  {n:'Braga',             p:'Portugal',    f:'🇵🇹', i:'BRAG',la:41.545, lo:-8.427, c:0.85, semAeroporto:true},
  {n:'Viana do Castelo',  p:'Portugal',    f:'🇵🇹', i:'VDCT',la:41.693, lo:-8.834, c:0.85, semAeroporto:true},
  {n:'Leiria',            p:'Portugal',    f:'🇵🇹', i:'LEIR',la:39.749, lo:-8.807, c:0.82, semAeroporto:true},
  {n:'Santarém',          p:'Portugal',    f:'🇵🇹', i:'SNTR',la:39.236, lo:-8.686, c:0.78, semAeroporto:true},
  {n:'Setúbal',           p:'Portugal',    f:'🇵🇹', i:'STBL',la:38.524, lo:-8.893, c:0.90, semAeroporto:true},
  {n:'Castelo Branco',    p:'Portugal',    f:'🇵🇹', i:'CTBR',la:39.822, lo:-7.491, c:0.72, semAeroporto:true},
  {n:'Portalegre',        p:'Portugal',    f:'🇵🇹', i:'PTLG',la:39.294, lo:-7.430, c:0.70, semAeroporto:true},
  {n:'Évora',             p:'Portugal',    f:'🇵🇹', i:'EVRA',la:38.571, lo:-7.907, c:0.85, semAeroporto:true},
  {n:'Beja',              p:'Portugal',    f:'🇵🇹', i:'BEJA',la:38.015, lo:-7.863, c:0.72, semAeroporto:true},
  {n:'Madrid',        p:'Espanha',         f:'🇪🇸', i:'MAD', la:40.417, lo:-3.703, c:1.05},
  {n:'Barcelona',     p:'Espanha',         f:'🇪🇸', i:'BCN', la:41.385, lo: 2.173, c:1.10},
  {n:'Sevilha',       p:'Espanha',         f:'🇪🇸', i:'SVQ', la:37.389, lo:-5.984, c:0.95},
  {n:'Málaga',        p:'Espanha',         f:'🇪🇸', i:'AGP', la:36.721, lo:-4.421, c:0.98},
  {n:'Valência',      p:'Espanha',         f:'🇪🇸', i:'VLC', la:39.470, lo:-0.377, c:0.96},
  {n:'Palma de Maiorca',p:'Espanha',       f:'🇪🇸', i:'PMI', la:39.570, lo: 2.650, c:1.08},
  {n:'Ibiza',         p:'Espanha',         f:'🇪🇸', i:'IBZ', la:38.907, lo: 1.420, c:1.25},
  {n:'Tenerife',      p:'Espanha',         f:'🇪🇸', i:'TFS', la:28.044, lo:-16.572,c:1.00},
  {n:'Bilbau',        p:'Espanha',         f:'🇪🇸', i:'BIO', la:43.301, lo:-2.911, c:0.90},
  {n:'Santiago de Compostela',p:'Espanha', f:'🇪🇸', i:'SCQ', la:42.896, lo:-8.415, c:0.88},
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
  {n:'Bolonha',       p:'Itália',          f:'🇮🇹', i:'BLQ', la:44.535, lo:11.289, c:1.15},
  {n:'Berlim',        p:'Alemanha',        f:'🇩🇪', i:'BER', la:52.520, lo:13.405, c:1.15},
  {n:'Munique',       p:'Alemanha',        f:'🇩🇪', i:'MUC', la:48.135, lo:11.582, c:1.25},
  {n:'Frankfurt',     p:'Alemanha',        f:'🇩🇪', i:'FRA', la:50.110, lo: 8.682, c:1.18},
  {n:'Hamburgo',      p:'Alemanha',        f:'🇩🇪', i:'HAM', la:53.551, lo: 9.994, c:1.15},
  {n:'Amesterdão',    p:'Países Baixos',   f:'🇳🇱', i:'AMS', la:52.370, lo: 4.895, c:1.40},
  {n:'Bruxelas',      p:'Bélgica',         f:'🇧🇪', i:'BRU', la:50.850, lo: 4.352, c:1.15},
  {n:'Luxemburgo',    p:'Luxemburgo',      f:'🇱🇺', i:'LUX', la:49.623, lo: 6.204, c:1.35},
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
  /* Lote 1 (capitais da Europa), 03/09/2026: países europeus ainda sem
     nenhuma cidade na lista. Códigos IATA e coordenadas verificados um a
     um. Andorra, Listenstaine, São Marinho e o Vaticano ficaram de fora:
     nenhum tem aeroporto comercial próprio, e inventar uma ligação a um
     aeroporto vizinho (nenhum dentro do próprio país) seria o mesmo erro
     que se corrigiu para Bragança/Vila Real/Viseu, ao contrário. Kiev:
     o espaço aéreo ucraniano está fechado a voos civis desde 2022; como
     os preços de voo vêm de uma fonte real (Travelpayouts/Aviasales), a
     pesquisa simplesmente não devolve nada em vez de inventar um preço,
     por isso a entrada fica, honesta, sem tratamento especial. */
  {n:'Tirana',        p:'Albânia',         f:'🇦🇱', i:'TIA', la:41.415, lo:19.721, c:0.65},
  {n:'Minsk',         p:'Bielorrússia',    f:'🇧🇾', i:'MSQ', la:53.883, lo:28.033, c:0.60},
  {n:'Sarajevo',      p:'Bósnia e Herzegovina', f:'🇧🇦', i:'SJJ', la:43.825, lo:18.331,c:0.65},
  {n:'Sófia',         p:'Bulgária',        f:'🇧🇬', i:'SOF', la:42.695, lo:23.408, c:0.68},
  {n:'Nicósia',       p:'Chipre',          f:'🇨🇾', i:'LCA', la:34.879, lo:33.630, c:1.05},
  {n:'Bratislava',    p:'Eslováquia',      f:'🇸🇰', i:'BTS', la:48.170, lo:17.213, c:0.85},
  {n:'Liubliana',     p:'Eslovénia',       f:'🇸🇮', i:'LJU', la:46.224, lo:14.456, c:0.95},
  {n:'Taline',        p:'Estónia',         f:'🇪🇪', i:'TLL', la:59.413, lo:24.833, c:0.90},
  {n:'Tbilisi',       p:'Geórgia',         f:'🇬🇪', i:'TBS', la:41.669, lo:44.955, c:0.55},
  {n:'Riga',          p:'Letónia',         f:'🇱🇻', i:'RIX', la:56.924, lo:23.971, c:0.85},
  {n:'Vilnius',       p:'Lituânia',        f:'🇱🇹', i:'VNO', la:54.637, lo:25.288, c:0.80},
  {n:'Escópia',       p:'Macedónia do Norte', f:'🇲🇰', i:'SKP', la:41.961, lo:21.627,c:0.55},
  {n:'Valeta',        p:'Malta',           f:'🇲🇹', i:'MLA', la:35.858, lo:14.478, c:1.10},
  {n:'Chisinau',      p:'Moldova',         f:'🇲🇩', i:'RMO', la:46.928, lo:28.931, c:0.50},
  {n:'Mónaco',        p:'Mónaco',          f:'🇲🇨', i:'MCM', la:43.726, lo:7.421,  c:1.75},
  {n:'Podgorica',     p:'Montenegro',      f:'🇲🇪', i:'TGD', la:42.359, lo:19.252, c:0.75},
  {n:'Bucareste',     p:'Roménia',         f:'🇷🇴', i:'OTP', la:44.571, lo:26.085, c:0.62},
  {n:'Moscovo',       p:'Rússia',          f:'🇷🇺', i:'SVO', la:55.973, lo:37.415, c:0.75},
  {n:'Belgrado',      p:'Sérvia',          f:'🇷🇸', i:'BEG', la:44.819, lo:20.307, c:0.65},
  {n:'Kiev',          p:'Ucrânia',         f:'🇺🇦', i:'KBP', la:50.345, lo:30.893, c:0.55},
  {n:'Istambul',      p:'Turquia',         f:'🇹🇷', i:'IST', la:41.008, lo:28.978, c:0.70},
  /* Lote 4a (capitais do Médio Oriente e Ásia Central), 03/09/2026.
     Damasco, Cartum (lote 3b) e Kiev (lote 1) partilham a mesma nota: o
     preço de voo vem de uma fonte real, por isso uma pesquisa a um
     aeroporto sem voos correntes (guerra, sanções) simplesmente não
     devolve nada, honesto por omissão, sem tratamento especial aqui. */
  {n:'Cabul',         p:'Afeganistão',     f:'🇦🇫', i:'KBL', la:34.566, lo:69.213, c:0.50},
  {n:'Yerevan',       p:'Arménia',         f:'🇦🇲', i:'EVN', la:40.147, lo:44.396, c:0.55},
  {n:'Baku',          p:'Azerbaijão',      f:'🇦🇿', i:'GYD', la:40.468, lo:50.047, c:0.70},
  {n:'Manama',        p:'Barém',           f:'🇧🇭', i:'BAH', la:26.271, lo:50.634, c:0.85},
  {n:'Teerão',        p:'Irão',            f:'🇮🇷', i:'IKA', la:35.416, lo:51.152, c:0.55},
  {n:'Bagdade',       p:'Iraque',          f:'🇮🇶', i:'BGW', la:33.263, lo:44.234, c:0.50},
  {n:'Telavive',      p:'Israel',          f:'🇮🇱', i:'TLV', la:32.009, lo:34.883, c:1.10},
  {n:'Amã',           p:'Jordânia',        f:'🇯🇴', i:'AMM', la:31.723, lo:35.993, c:0.65},
  {n:'Astana',        p:'Cazaquistão',     f:'🇰🇿', i:'NQZ', la:51.022, lo:71.467, c:0.60},
  {n:'Cidade do Kuwait',p:'Kuwait',        f:'🇰🇼', i:'KWI', la:29.227, lo:47.980, c:1.00},
  {n:'Bisqueque',      p:'Quirguistão',    f:'🇰🇬', i:'FRU', la:43.061, lo:74.476, c:0.50},
  {n:'Beirute',       p:'Líbano',          f:'🇱🇧', i:'BEY', la:33.821, lo:35.488, c:0.65},
  {n:'Mascate',       p:'Omã',             f:'🇴🇲', i:'MCT', la:23.593, lo:58.284, c:0.90},
  {n:'Riade',         p:'Arábia Saudita',  f:'🇸🇦', i:'RUH', la:24.958, lo:46.699, c:0.80},
  {n:'Damasco',       p:'Síria',           f:'🇸🇾', i:'DAM', la:33.411, lo:36.516, c:0.45},
  {n:'Dushanbe',      p:'Tajiquistão',     f:'🇹🇯', i:'DYU', la:38.535, lo:68.818, c:0.45},
  {n:'Asgabate',      p:'Turquemenistão',  f:'🇹🇲', i:'ASB', la:37.987, lo:58.361, c:0.60},
  {n:'Tasquente',     p:'Usbequistão',     f:'🇺🇿', i:'TAS', la:41.258, lo:69.281, c:0.50},
  {n:'Sanaa',         p:'Iémen',           f:'🇾🇪', i:'SAH', la:15.476, lo:44.220, c:0.40},
  {n:'Marraquexe',    p:'Marrocos',        f:'🇲🇦', i:'RAK', la:31.630, lo:-7.981, c:0.60},
  {n:'Casablanca',    p:'Marrocos',        f:'🇲🇦', i:'CMN', la:33.573, lo:-7.590, c:0.62},
  {n:'Argel',         p:'Argélia',         f:'🇩🇿', i:'ALG', la:36.691, lo: 3.215, c:0.58},
  {n:'Cairo',         p:'Egipto',          f:'🇪🇬', i:'CAI', la:30.044, lo:31.236, c:0.55},
  {n:'Dakar',         p:'Senegal',         f:'🇸🇳', i:'DSS', la:14.671, lo:-17.067,c:0.62},
  {n:'Acra',          p:'Gana',            f:'🇬🇭', i:'ACC', la:5.605,  lo:-0.167, c:0.58},
  {n:'Dubai',         p:'Emiratos Árabes Unidos', f:'🇦🇪', i:'DXB', la:25.204, lo:55.271, c:1.30},
  {n:'Doha',          p:'Catar',           f:'🇶🇦', i:'DOH', la:25.285, lo:51.531, c:1.25},
  {n:'Nova Iorque',   p:'Estados Unidos',  f:'🇺🇸', i:'JFK', la:40.712, lo:-74.006,c:1.60},
  {n:'Miami',         p:'Estados Unidos',  f:'🇺🇸', i:'MIA', la:25.762, lo:-80.192,c:1.40},
  {n:'Los Angeles',   p:'Estados Unidos',  f:'🇺🇸', i:'LAX', la:34.052, lo:-118.244,c:1.50},
  {n:'São Francisco', p:'Estados Unidos',  f:'🇺🇸', i:'SFO', la:37.775, lo:-122.419,c:1.60},
  {n:'Orlando',       p:'Estados Unidos',  f:'🇺🇸', i:'MCO', la:28.538, lo:-81.379,c:1.25},
  {n:'Boston',        p:'Estados Unidos',  f:'🇺🇸', i:'BOS', la:42.360, lo:-71.059,c:1.45},
  {n:'Chicago',       p:'Estados Unidos',  f:'🇺🇸', i:'ORD', la:41.979, lo:-87.905,c:1.40},
  {n:'Washington D.C.',p:'Estados Unidos', f:'🇺🇸', i:'IAD', la:38.944, lo:-77.456,c:1.45},
  {n:'Toronto',       p:'Canadá',          f:'🇨🇦', i:'YYZ', la:43.653, lo:-79.383,c:1.30},
  {n:'Montreal',      p:'Canadá',          f:'🇨🇦', i:'YUL', la:45.502, lo:-73.567,c:1.20},
  /* Lote 2 (capitais das Américas), 03/09/2026: países do continente
     americano ainda sem nenhuma cidade no site. Códigos IATA e
     coordenadas verificados um a um: o aeroporto de Quito apareceu numa
     fonte com o hemisfério trocado (Norte em vez de Sul), corrigido
     contra uma segunda fonte antes de entrar aqui. */
  {n:'Saint John\'s', p:'Antígua e Barbuda', f:'🇦🇬', i:'ANU', la:17.137, lo:-61.793,c:1.10},
  {n:'Nassau',        p:'Baamas',          f:'🇧🇸', i:'NAS', la:25.039, lo:-77.466,c:1.15},
  {n:'Bridgetown',    p:'Barbados',        f:'🇧🇧', i:'BGI', la:13.075, lo:-59.493,c:1.10},
  {n:'Cidade de Belize',p:'Belize',        f:'🇧🇿', i:'BZE', la:17.539, lo:-88.308,c:0.85},
  {n:'San José',      p:'Costa Rica',      f:'🇨🇷', i:'SJO', la:9.994,  lo:-84.209,c:0.85},
  {n:'Havana',        p:'Cuba',            f:'🇨🇺', i:'HAV', la:22.989, lo:-82.409,c:0.65},
  {n:'Roseau',        p:'Dominica',        f:'🇩🇲', i:'DOM', la:15.547, lo:-61.300,c:0.90},
  {n:'Santo Domingo', p:'República Dominicana', f:'🇩🇴', i:'SDQ', la:18.429, lo:-69.669,c:0.85},
  {n:'San Salvador',  p:'El Salvador',     f:'🇸🇻', i:'SAL', la:13.441, lo:-89.056,c:0.65},
  {n:'Saint George\'s',p:'Granada',        f:'🇬🇩', i:'GND', la:12.004, lo:-61.786,c:1.05},
  {n:'Cidade da Guatemala',p:'Guatemala',  f:'🇬🇹', i:'GUA', la:14.582, lo:-90.527,c:0.65},
  {n:'Porto Príncipe',p:'Haiti',           f:'🇭🇹', i:'PAP', la:18.575, lo:-72.295,c:0.55},
  {n:'Tegucigalpa',   p:'Honduras',        f:'🇭🇳', i:'TGU', la:14.062, lo:-87.217,c:0.60},
  {n:'Kingston',      p:'Jamaica',         f:'🇯🇲', i:'KIN', la:17.936, lo:-76.788,c:0.90},
  {n:'Manágua',       p:'Nicarágua',       f:'🇳🇮', i:'MGA', la:12.141, lo:-86.168,c:0.55},
  {n:'Cidade do Panamá',p:'Panamá',        f:'🇵🇦', i:'PTY', la:9.071,  lo:-79.384,c:0.85},
  {n:'Basseterre',    p:'São Cristóvão e Neves', f:'🇰🇳', i:'SKB', la:17.311, lo:-62.719,c:1.05},
  {n:'Castries',      p:'Santa Lúcia',     f:'🇱🇨', i:'UVF', la:13.733, lo:-60.953,c:1.10},
  {n:'Kingstown',     p:'São Vicente e Granadinas', f:'🇻🇨', i:'SVD', la:13.156, lo:-61.150,c:1.00},
  {n:'Porto de Espanha',p:'Trindade e Tobago', f:'🇹🇹', i:'POS', la:10.595, lo:-61.337,c:0.85},
  {n:'La Paz',        p:'Bolívia',         f:'🇧🇴', i:'LPB', la:-16.513,lo:-68.192,c:0.55},
  {n:'Quito',         p:'Equador',         f:'🇪🇨', i:'UIO', la:-0.113, lo:-78.359,c:0.60},
  {n:'Georgetown',    p:'Guiana',          f:'🇬🇾', i:'GEO', la:6.498,  lo:-58.254,c:0.65},
  {n:'Assunção',      p:'Paraguai',        f:'🇵🇾', i:'ASU', la:-25.240,lo:-57.519,c:0.55},
  {n:'Paramaribo',    p:'Suriname',        f:'🇸🇷', i:'PBM', la:5.453,  lo:-55.188,c:0.65},
  {n:'Montevideu',    p:'Uruguai',         f:'🇺🇾', i:'MVD', la:-34.838,lo:-56.031,c:0.75},
  {n:'Caracas',       p:'Venezuela',       f:'🇻🇪', i:'CCS', la:10.603, lo:-66.991,c:0.60},
  {n:'São Paulo',     p:'Brasil',          f:'🇧🇷', i:'GRU', la:-23.551,lo:-46.633,c:0.80},
  {n:'Rio de Janeiro',p:'Brasil',          f:'🇧🇷', i:'GIG', la:-22.907,lo:-43.173,c:0.85},
  {n:'Brasília',      p:'Brasil',          f:'🇧🇷', i:'BSB', la:-15.871,lo:-47.919,c:0.78},
  {n:'Belo Horizonte',p:'Brasil',          f:'🇧🇷', i:'CNF', la:-19.624,lo:-43.972,c:0.72},
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
  /* Lote 3a (capitais de África, primeira metade), 03/09/2026. Guiné
     Equatorial: a capital oficial mudou para Ciudad de la Paz em Janeiro
     de 2026, mas o aeroporto de lá (Mengomeyén/GEM) só tem ligação
     doméstica a partir de Malabo, não voos internacionais directos;
     Malabo continua a ser a porta de entrada real no país, por isso é a
     que entra aqui, com nota do porquê. Essuatíni: o aeroporto fica perto
     de Manzini, não da capital administrativa Mbabane, por isso a cidade
     é Manzini, para não sugerir uma ligação que o aeroporto não tem. */
  {n:'Cotonou',       p:'Benim',           f:'🇧🇯', i:'COO', la:6.356,  lo:2.385,  c:0.55},
  {n:'Gaborone',      p:'Botsuana',        f:'🇧🇼', i:'GBE', la:-24.555,lo:25.918, c:0.85},
  {n:'Ouagadougou',   p:'Burquina Faso',   f:'🇧🇫', i:'OUA', la:12.353, lo:-1.512, c:0.50},
  {n:'Bujumbura',     p:'Burundi',         f:'🇧🇮', i:'BJM', la:-3.324, lo:29.319, c:0.45},
  {n:'Yaoundé',       p:'Camarões',        f:'🇨🇲', i:'NSI', la:3.723,  lo:11.553, c:0.55},
  {n:'Bangui',        p:'República Centro-Africana', f:'🇨🇫', i:'BGF', la:4.398, lo:18.519,c:0.45},
  {n:'N\'Djamena',    p:'Chade',           f:'🇹🇩', i:'NDJ', la:12.134, lo:15.034, c:0.55},
  {n:'Moroni',        p:'Comores',         f:'🇰🇲', i:'HAH', la:-11.537,lo:43.271, c:0.70},
  {n:'Brazzaville',   p:'Congo',           f:'🇨🇬', i:'BZV', la:-4.252, lo:15.253, c:0.60},
  {n:'Kinshasa',      p:'República Democrática do Congo', f:'🇨🇩', i:'FIH', la:-4.387, lo:15.442,c:0.55},
  {n:'Jibuti',        p:'Jibuti',          f:'🇩🇯', i:'JIB', la:11.546, lo:43.159, c:0.90},
  {n:'Malabo',        p:'Guiné Equatorial',f:'🇬🇶', i:'SSG', la:3.755,  lo:8.709,  c:0.95},
  {n:'Asmara',        p:'Eritreia',        f:'🇪🇷', i:'ASM', la:15.292, lo:38.911, c:0.45},
  {n:'Manzini',       p:'Essuatíni',       f:'🇸🇿', i:'MTS', la:-26.529,lo:31.308, c:0.65},
  {n:'Adis Abeba',    p:'Etiópia',         f:'🇪🇹', i:'ADD', la:8.978,  lo:38.799, c:0.50},
  {n:'Libreville',    p:'Gabão',           f:'🇬🇦', i:'LBV', la:0.459,  lo:9.412,  c:0.85},
  {n:'Banjul',        p:'Gâmbia',          f:'🇬🇲', i:'BJL', la:13.338, lo:-16.652,c:0.60},
  {n:'Conacri',       p:'Guiné',           f:'🇬🇳', i:'CKY', la:9.577,  lo:-13.612,c:0.50},
  {n:'Abidjan',       p:'Costa do Marfim', f:'🇨🇮', i:'ABJ', la:5.261,  lo:-3.926, c:0.60},
  {n:'Nairóbi',       p:'Quénia',          f:'🇰🇪', i:'NBO', la:-1.319, lo:36.926, c:0.60},
  {n:'Maseru',        p:'Lesoto',          f:'🇱🇸', i:'MSU', la:-29.462,lo:27.553, c:0.55},
  {n:'Monróvia',      p:'Libéria',         f:'🇱🇷', i:'ROB', la:6.234,  lo:-10.362,c:0.55},
  {n:'Trípoli',       p:'Líbia',           f:'🇱🇾', i:'MJI', la:32.900, lo:13.283, c:0.60},
  /* Lote 3b (capitais de África, segunda metade), 03/09/2026. Uganda: o
     aeroporto internacional é o de Entebbe, cidade distinta de Kampala
     (a capital), por isso a cidade é Entebbe, mesma lógica do Lote 3a
     para o Essuatíni. Tanzânia: a capital oficial é Dodoma, mas quem tem
     o aeroporto internacional real é Dar es Salaam, que continua a ser
     a porta de entrada do país. */
  {n:'Antananarivo',  p:'Madagáscar',      f:'🇲🇬', i:'TNR', la:-18.797,lo:47.479, c:0.60},
  {n:'Lilongwe',      p:'Malawi',          f:'🇲🇼', i:'LLW', la:-13.789,lo:33.781, c:0.55},
  {n:'Bamako',        p:'Mali',            f:'🇲🇱', i:'BKO', la:12.538, lo:-7.943, c:0.50},
  {n:'Nouakchott',    p:'Mauritânia',      f:'🇲🇷', i:'NKC', la:18.310, lo:-15.970,c:0.55},
  {n:'Port Louis',    p:'Maurícia',        f:'🇲🇺', i:'MRU', la:-20.430,lo:57.683, c:0.90},
  {n:'Rabat',         p:'Marrocos',        f:'🇲🇦', i:'RBA', la:34.051, lo:-6.751, c:0.65},
  {n:'Windhoek',      p:'Namíbia',         f:'🇳🇦', i:'WDH', la:-22.487,lo:17.463, c:0.70},
  {n:'Niamey',        p:'Níger',           f:'🇳🇪', i:'NIM', la:13.482, lo:2.170,  c:0.50},
  {n:'Abuja',         p:'Nigéria',         f:'🇳🇬', i:'ABV', la:9.007,  lo:7.263,  c:0.60},
  {n:'Kigali',        p:'Ruanda',          f:'🇷🇼', i:'KGL', la:-1.968, lo:30.138, c:0.55},
  {n:'Victoria',      p:'Seicheles',       f:'🇸🇨', i:'SEZ', la:-4.674, lo:55.522, c:1.15},
  {n:'Freetown',      p:'Serra Leoa',      f:'🇸🇱', i:'FNA', la:8.616,  lo:-13.195,c:0.50},
  {n:'Mogadíscio',    p:'Somália',         f:'🇸🇴', i:'MGQ', la:2.014,  lo:45.305, c:0.45},
  {n:'Juba',          p:'Sudão do Sul',    f:'🇸🇸', i:'JUB', la:4.872,  lo:31.601, c:0.50},
  {n:'Cartum',        p:'Sudão',           f:'🇸🇩', i:'KRT', la:15.589, lo:32.553, c:0.50},
  {n:'Dar es Salaam', p:'Tanzânia',        f:'🇹🇿', i:'DAR', la:-6.878, lo:39.203, c:0.55},
  {n:'Lomé',          p:'Togo',            f:'🇹🇬', i:'LFW', la:6.166,  lo:1.255,  c:0.50},
  {n:'Tunes',         p:'Tunísia',         f:'🇹🇳', i:'TUN', la:36.851, lo:10.227, c:0.65},
  {n:'Entebbe',       p:'Uganda',          f:'🇺🇬', i:'EBB', la:0.045,  lo:32.443, c:0.55},
  {n:'Lusaka',        p:'Zâmbia',          f:'🇿🇲', i:'LUN', la:-15.332,lo:28.434, c:0.55},
  {n:'Harare',        p:'Zimbabué',        f:'🇿🇼', i:'HRE', la:-17.932,lo:31.093, c:0.55},
  {n:'Bissau',        p:'Guiné-Bissau',    f:'🇬🇼', i:'OXB', la:11.895, lo:-15.654,c:0.55},
  {n:'Maputo',        p:'Moçambique',      f:'🇲🇿', i:'MPM', la:-25.966,lo:32.573, c:0.75},
  {n:'São Tomé',      p:'São Tomé e Príncipe', f:'🇸🇹', i:'TMS', la:0.378, lo:6.712, c:0.85},
  {n:'Sal',           p:'Cabo Verde',      f:'🇨🇻', i:'SID', la:16.741, lo:-22.949,c:0.80},
  {n:'Mindelo',       p:'Cabo Verde',      f:'🇨🇻', i:'VXE', la:16.833, lo:-25.057,c:0.78},
  {n:'Praia',         p:'Cabo Verde',      f:'🇨🇻', i:'RAI', la:14.933, lo:-23.513,c:0.75},
  /* Lote 4b (capitais do Sul e Sudeste Asiático), 03/09/2026. Myanmar:
     o aeroporto internacional real é o de Rangum (Yangon), não o da
     capital administrativa Naypyidaw, mesma lógica de Uganda/Tanzânia
     nos lotes de África. Coreia do Norte partilha a nota do Lote 4a
     sobre aeroportos sem voos numa fonte real (a Air Koryo não está
     nos sistemas de reserva habituais): sem tratamento especial, a
     pesquisa simplesmente não devolve resultados. Mongólia: o antigo
     código IATA ULN ficou com o aeroporto antigo (Buyant-Ukhaa, hoje
     fechado a voos comerciais); o aeroporto novo, Chinggis Khaan
     (2021), tem o código UBN, confirmado contra várias fontes por
     haver confusão generalizada entre os dois online. */
  {n:'Daca',               p:'Bangladesh',      f:'🇧🇩', i:'DAC', la:23.843, lo:90.401, c:0.45},
  {n:'Paro',               p:'Butão',           f:'🇧🇹', i:'PBH', la:27.409, lo:89.421, c:1.15},
  {n:'Bandar Seri Begawan',p:'Brunei',          f:'🇧🇳', i:'BWN', la:4.945,  lo:114.934,c:0.75},
  {n:'Phnom Penh',         p:'Camboja',         f:'🇰🇭', i:'PNH', la:11.546, lo:104.844,c:0.50},
  {n:'Vienciana',          p:'Laos',            f:'🇱🇦', i:'VTE', la:17.988, lo:102.563,c:0.50},
  {n:'Malé',               p:'Maldivas',        f:'🇲🇻', i:'MLE', la:4.192,  lo:73.529, c:1.30},
  {n:'Ulã Bator',          p:'Mongólia',        f:'🇲🇳', i:'UBN', la:47.651, lo:106.821,c:0.70},
  {n:'Rangum',             p:'Myanmar',         f:'🇲🇲', i:'RGN', la:16.907, lo:96.133, c:0.45},
  {n:'Catmandu',           p:'Nepal',           f:'🇳🇵', i:'KTM', la:27.696, lo:85.359, c:0.45},
  {n:'Pyongyang',          p:'Coreia do Norte', f:'🇰🇵', i:'FNJ', la:39.224, lo:125.670,c:0.40},
  {n:'Islamabad',          p:'Paquistão',       f:'🇵🇰', i:'ISB', la:33.549, lo:72.826, c:0.50},
  {n:'Manila',             p:'Filipinas',       f:'🇵🇭', i:'MNL', la:14.508, lo:121.020,c:0.65},
  {n:'Colombo',            p:'Sri Lanka',       f:'🇱🇰', i:'CMB', la:7.181,  lo:79.884, c:0.55},
  {n:'Dili',               p:'Timor-Leste',     f:'🇹🇱', i:'DIL', la:-8.546, lo:125.525,c:0.60},
  /* Lote 5 (capitais da Oceânia), 03/09/2026. Três casos onde a capital
     oficial/constitucional não tem o aeroporto internacional real, mesma
     lógica já usada em África e na Ásia: Fiji tem Suva como capital, mas
     97% do tráfego internacional passa por Nadi, não pelo aeroporto de
     Suva; Palau tem Ngerulmud (Melekeok) como capital desde 2006, mas o
     aeroporto fica em Koror, a antiga capital e ainda o destino a que
     todas as fontes de viagem associam o código ROR; a Micronésia tem
     Palikir como capital, sem aeroporto próprio, servida pelo aeroporto
     de Pohnpei a 10 km, junto a Kolonia. Nauru é um caso à parte: é a
     única república do mundo sem capital oficial; Yaren, onde ficam o
     governo e o aeroporto, funciona como capital de facto, por isso é a
     que entra aqui. */
  {n:'Nadi',          p:'Fiji',             f:'🇫🇯', i:'NAN', la:-17.755,lo:177.443,c:1.30},
  {n:'Tarawa',        p:'Quiribáti',        f:'🇰🇮', i:'TRW', la:1.382,  lo:173.147,c:1.00},
  {n:'Majuro',        p:'Ilhas Marshall',   f:'🇲🇭', i:'MAJ', la:7.065,  lo:171.272,c:1.05},
  {n:'Pohnpei',       p:'Micronésia',       f:'🇫🇲', i:'PNI', la:6.985,  lo:158.209,c:1.05},
  {n:'Yaren',         p:'Nauru',            f:'🇳🇷', i:'INU', la:-0.547, lo:166.919,c:1.10},
  {n:'Koror',         p:'Palau',            f:'🇵🇼', i:'ROR', la:7.367,  lo:134.544,c:1.15},
  {n:'Port Moresby',  p:'Papua-Nova Guiné', f:'🇵🇬', i:'POM', la:-9.443, lo:147.220,c:0.95},
  {n:'Apia',          p:'Samoa',            f:'🇼🇸', i:'APW', la:-13.830,lo:-172.008,c:1.10},
  {n:'Honiara',       p:'Ilhas Salomão',    f:'🇸🇧', i:'HIR', la:-9.428, lo:160.055,c:0.90},
  {n:'Nuku\'alofa',   p:'Tonga',            f:'🇹🇴', i:'TBU', la:-21.241,lo:-175.149,c:1.05},
  {n:'Funafuti',      p:'Tuvalu',           f:'🇹🇻', i:'FUN', la:-8.525, lo:179.196,c:1.15},
  {n:'Port Vila',     p:'Vanuatu',          f:'🇻🇺', i:'VLI', la:-17.699,lo:168.320,c:1.10},
  /* Lote 6, 03/09/2026: fecha a lista das capitais que faltavam, sete
     países que já tinham uma cidade no site mas não a capital, anotado
     desde a primeira ronda deste projecto (Lote 1). */
  {n:'Berna',         p:'Suíça',            f:'🇨🇭', i:'BRN', la:46.912, lo:7.499,  c:1.55},
  {n:'Ancara',        p:'Turquia',          f:'🇹🇷', i:'ESB', la:40.128, lo:32.995, c:0.65},
  {n:'Abu Dhabi',     p:'Emiratos Árabes Unidos', f:'🇦🇪', i:'AUH', la:24.433, lo:54.651, c:1.25},
  {n:'Ottawa',        p:'Canadá',           f:'🇨🇦', i:'YOW', la:45.323, lo:-75.667,c:1.15},
  {n:'Jacarta',       p:'Indonésia',        f:'🇮🇩', i:'CGK', la:-6.126, lo:106.656,c:0.55},
  {n:'Camberra',      p:'Austrália',        f:'🇦🇺', i:'CBR', la:-35.307,lo:149.195,c:1.35},
  {n:'Wellington',    p:'Nova Zelândia',    f:'🇳🇿', i:'WLG', la:-41.327,lo:174.805,c:1.20}
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
  /* Os únicos dois operadores directos (não agregadores) em Portugal: a
     CP tem o preço real em TARIFAS_CP (data.js), sem passar pelo `fx`
     desta tabela. A Rede Expressos bloqueia acesso automático (403), por
     isso nunca tem preço confirmado, só a estimativa de
     estimativaAutocarro() (engine.js). */
  cp:          {nome:'CP',            dom:'cp.pt',             cat:['comboio'],        fx:1.00, desc:'Comboios de Portugal: a operadora ferroviária nacional.'},
  redeexpressos:{nome:'Rede Expressos',dom:'rede-expressos.pt', cat:['autocarro'],      fx:1.00, desc:'A maior rede de autocarros expresso de Portugal.'},

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

/* ── tarifário real da CP, por rota ───────────────────────────────
   Ao contrário do TRANSPORTES_DESTINO (transportes locais dentro de uma
   cidade), isto é por par origem-destino: a CP publica um PDF com texto a
   sério por linha, com o preço fixo por estação (Intercidades, bilhete
   simples ida, 2ª classe, tarifa inteira), em vigor até à próxima
   actualização tarifária nacional (normalmente 1 de Janeiro). Lido a
   01/09/2026. Não é dinâmico como o Alfa Pendular pode ser em época alta:
   é o preço de balcão, o mesmo em qualquer dia.

   `fonte` é o PDF onde o valor foi lido; `ferramentas/tarifas-cp.js`
   compara o hash desse PDF a cada ronda e avisa se a CP o actualizou, para
   se reconferir os valores, tal como já se faz com o TRANSPORTES_DESTINO. */
const TARIFAS_CP = {
  'Lisboa': {
    'Porto':            {preco:28.05, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Coimbra':          {preco:22.20, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Aveiro':           {preco:23.45, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Braga':            {preco:29.70, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Viana do Castelo': {preco:31.95, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Évora':            {preco:13.90, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-evora-beja'},
    'Beja':             {preco:15.70, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-evora-beja'},
    'Castelo Branco':   {preco:17.05, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-covilha-guarda'},
    'Covilhã':          {preco:19.80, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-covilha-guarda'},
    'Guarda':           {preco:23.65, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-covilha-guarda'},
    'Santarém':         {preco:13.55, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-covilha-guarda'}
  },
  'Porto': {
    'Coimbra':          {preco:15.25, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Aveiro':           {preco:13.55, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Braga':            {preco:13.55, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'},
    'Viana do Castelo': {preco:13.55, servico:'Intercidades', actualizado:'2026-09-01', fonte:'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca'}
  }
};

/* Procura a tarifa nos dois sentidos: a CP cobra o mesmo preço de A para B
   e de B para A na mesma linha, mas só temos o par guardado numa ordem. */
function tarifaComboioReal(origem, destino){
  return (TARIFAS_CP[origem.n] && TARIFAS_CP[origem.n][destino.n])
      || (TARIFAS_CP[destino.n] && TARIFAS_CP[destino.n][origem.n])
      || null;
}

/* Hash (SHA-256) de cada PDF de origem, tirado a 01/09/2026, para
   `ferramentas/tarifas-cp.js` detectar quando a CP publica valores novos
   sem se precisar de ler o PDF todo outra vez de propósito: só quando o
   hash mudar é que vale a pena reconferir os números à mão. Uma chave por
   PDF, não por rota (vários destinos partilham o mesmo ficheiro). */
const HASHES_CP = {
  'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-porto-braga-guimaraes-valenca': '8ddcde6fbbe1f7d623c6ca1214924d964050097cff7c8ae98bfdc411e2df4539',
  'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-evora-beja':                    '9fe695bb81ef077ef78ef0520723e6852907dcd7ee6fd1c9fbba9455f25563a2',
  'https://www.cp.pt/info/documents/d/cp/precos-intercidades-lisboa-covilha-guarda':                '6f27bddfb5e6151eeddb327d2e615a722267045bcb7be0b7ce6c4618b51bc658'
};

/* Companhias aéreas plausíveis para atribuir às cotações. */
const COMPANHIAS = ['TAP Air Portugal','Ryanair','easyJet','Vueling','Iberia','Lufthansa','Air France','KLM','British Airways','SWISS','Emirates','Qatar Airways','LATAM','United','Delta'];

/* Títulos na Wikipédia inglesa (recurso quando a portuguesa não tem
   fotografia utilizável, por exemplo quando a imagem principal é a bandeira). */
const WIKI_EN = {
  'Praga':'Prague', 'Nova Iorque':'New York City', 'Londres':'London',
  'Roma':'Rome', 'Atenas':'Athens', 'Budapeste':'Budapest',
  'Marraquexe':'Marrakesh', 'Rio de Janeiro':'Rio de Janeiro',
  'Barcelona':'Barcelona', 'Paris':'Paris', 'Funchal':'Funchal',
  'Ponta Delgada':'Ponta Delgada',
  'Bilbau':'Bilbao', 'Acra':'Accra', 'Argel':'Algiers', 'Bolonha':'Bologna',
  'Luxemburgo':'Luxembourg',
  'Liubliana':'Ljubljana', 'Taline':'Tallinn', 'Escópia':'Skopje',
  'Valeta':'Valletta', 'Bucareste':'Bucharest', 'Moscovo':'Moscow',
  'Belgrado':'Belgrade', 'Kiev':'Kyiv', 'Sófia':'Sofia',
  'Manágua':'Managua', 'Montevideu':'Montevideo', 'Assunção':'Asunción',
  'Porto Príncipe':'Port-au-Prince', 'Cidade do Panamá':'Panama City',
  'Cidade da Guatemala':'Guatemala City', 'Cidade de Belize':'Belize City',
  'Porto de Espanha':'Port of Spain',
  'Jibuti':'Djibouti', 'Adis Abeba':'Addis Ababa', 'Conacri':'Conakry',
  'Nairóbi':'Nairobi', 'Monróvia':'Monrovia', 'Trípoli':'Tripoli',
  'Mogadíscio':'Mogadishu', 'Cartum':'Khartoum', 'Tunes':'Tunis',
  'Cabul':'Kabul', 'Teerão':'Tehran', 'Bagdade':'Baghdad',
  'Telavive':'Tel Aviv', 'Amã':'Amman', 'Cidade do Kuwait':'Kuwait City',
  'Bisqueque':'Bishkek', 'Beirute':'Beirut', 'Mascate':'Muscat',
  'Riade':'Riyadh', 'Damasco':'Damascus', 'Asgabate':'Ashgabat',
  'Tasquente':'Tashkent',
  'Daca':'Dhaka', 'Vienciana':'Vientiane', 'Ulã Bator':'Ulaanbaatar',
  'Rangum':'Yangon', 'Catmandu':'Kathmandu',
  'Berna':'Bern', 'Ancara':'Ankara', 'Jacarta':'Jakarta', 'Camberra':'Canberra'
};

/* Destinos considerados na aba «Ofertas em conta». Mistura os mercados
   europeus habituais com uma amostra dos destinos de fora da Europa
   acrescentados na expansão para 268 cidades, para que a aba também os
   mostre a quem nunca os procurou directamente. */
const DESTINOS_OFERTAS = ['Barcelona','Roma','Paris','Marraquexe','Praga','Ponta Delgada','Londres',
  'Budapeste','Atenas','Funchal','Nova Iorque','Rio de Janeiro',
  'Tóquio','Dubai','Sydney','Cairo','Banguecoque','Cancún'];

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
