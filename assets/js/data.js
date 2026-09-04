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
  /* Estava com `actualizado` no dia em que a tarifa entrou em vigor, não no
     dia em que alguém a foi ver: exactamente o hábito que este sistema
     existe para acabar. Reconferido a 01/09/2026 contra o BOCM de
     31/12/2025 (fonte), não contra a página institucional (que só resume
     «desde X €», sem discriminar por zona/duração): o bilhete de 10
     viagens estava em 12,20 e são 12,50; o turístico de 1 dia estava em
     8,40 e são 10,30; o de 5 dias estava em 26,80 e são 33,40. O simples e
     o suplemento de aeroporto não mudaram. */
  'Madrid': {operador:'Metro de Madrid / CRTM', url:'https://www.crtm.es/billetes-y-tarifas/', actualizado:'2026-09-01',
    fonte:'https://www.crtm.es/media/sjqj4ggj/bocm-20251231-tarifas_transporte.pdf',
    cartao:{nome:'Tarjeta Multi', preco:2.50, nota:'obrigatória para carregar bilhetes'},
    nota:'O suplemento de aeroporto é 3 € por viagem e não está incluído nos bilhetes simples.',
    bilhetes:[
      {nome:'Bilhete simples (zona A)', preco:1.50, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Bilhete de 10 viagens (zona A)', preco:12.50, unidade:'10 viagens', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Abono turístico 1 dia (zona A)', preco:10.30, unidade:'dia', quando:'antes', modos:['metro','autocarro','comboio','aeroporto']},
      {nome:'Abono turístico 5 dias (zona A)', preco:33.40, unidade:'5 dias', quando:'antes', modos:['metro','autocarro','comboio','aeroporto']}
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
  /* O site da TUSSAM continua atrás de uma verificação de bot que o curl
     não passa. Os valores confirmaram-se por duas fontes jornalísticas
     independentes: uma subida de tarifário de Julho de 2025 que excluiu
     explicitamente o Billete Univiaje (ficou nos 1,40 €), e uma proposta
     de nova subida (para 1,50 €) que, em Janeiro de 2026, ainda não tinha
     sido aprovada pela Câmara; sem confirmação de que entrou em vigor. */
  'Sevilha': {operador:'TUSSAM', url:'https://www.tussam.es/en/node/1442', actualizado:'2026-09-01', fonte:'https://www.elespanol.com/sevilla/20250627/nuevos-precios-autobuses-tussam-partir-julio-viaje-caro/1003743824338_0.html',
    bilhetes:[
      {nome:'Billete Univiaje', preco:1.40, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Tarjeta turística, 1 día', preco:5.00, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Tarjeta turística, 3 días', preco:10.00, unidade:'3 dias', quando:'chegada', modos:['autocarro']},
      {nome:'Tarjeta, 30 días', preco:21.20, unidade:'30 dias', quando:'antes', modos:['autocarro']}
    ]},
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
  /* O site da Ruter descreve os bilhetes mas não põe o preço no HTML
     estático (widget de preços em JavaScript); só se confirmou o valor do
     passe de 30 dias, publicado no comunicado oficial da subida anual de
     preços (em vigor desde 25/01/2026). O preço do bilhete avulso não se
     conseguiu confirmar por nenhuma fonte estática. */
  'Oslo': {operador:'Ruter', url:'https://ruter.no/en/om-vare-billetter/ticket-prices', actualizado:'2026-09-01', fonte:'https://www.mynewsdesk.com/no/ruter/pressreleases/nye-billettpriser-fra-25-januar-3423950', moeda:'NOK',
    nota:'Só se confirmou o preço do passe de 30 dias; o do bilhete avulso não está publicado em texto simples nem em nenhuma fonte que se tenha achado.',
    bilhetes:[{nome:'Passe de 30 dias, zona 1 (Oslo)', preco:805, unidade:'30 dias', quando:'antes', modos:['autocarro','eletrico','metro']}]},
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
  /* A AzoresBus (Vale do Ave Açores) tomou conta de toda a rede de
     autocarros de São Miguel a 1 de Setembro de 2025, mas a página de
     tarifários dela é montada em JavaScript, sem preços no HTML estático.
     A rede que se confirmou foi outra: a Mini BUS, da Câmara Municipal,
     que serve só a cidade (linhas C e D), com página oficial estática. */
  'Ponta Delgada': {operador:'Mini BUS (Câmara Municipal de Ponta Delgada)', url:'https://www.cm-pontadelgada.pt/p/pdlminibus', actualizado:'2026-08-19', fonte:'https://www.cm-pontadelgada.pt/p/pdlminibus',
    nota:'Serve só a cidade de Ponta Delgada (linhas C e D). Para o resto da ilha de São Miguel, a rede é a AzoresBus, cujo tarifário não está confirmado.',
    bilhetes:[
      {nome:'Bilhete de bordo (avulso)', preco:0.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete pré-comprado, 10 viagens', preco:4.00, unidade:'10 viagens', quando:'antes', modos:['autocarro']},
      {nome:'Passe semanal', preco:5.00, unidade:'semana', quando:'antes', modos:['autocarro']},
      {nome:'Passe geral, mensal', preco:16.00, unidade:'mês', quando:'antes', modos:['autocarro']}
    ]},
  /* Ronda das cidades sem aeroporto acrescentadas a este ficheiro (ver
     CIDADES): lidas todas a 31/08/2026. */
  'Coimbra': {operador:'SMTUC', url:'https://www.smtuc.pt/tabela-tarifaria/', actualizado:'2026-08-31', fonte:'https://www.smtuc.pt/wp-content/uploads/2026/04/TARIFARIO-2026-versao-30-abril-2026-.pdf',
    nota:'O passe intermodal de 1 dia cobre a rede SMTUC e o Metro Mondego; o preço «municipal» vale só dentro do concelho de Coimbra.',
    bilhetes:[
      {nome:'Bilhete de motorista (avulso)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Passe intermodal, 1 dia (municipal)', preco:5.00, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Passe intermodal, 3 dias (municipal)', preco:10.00, unidade:'3 dias', quando:'chegada', modos:['autocarro']},
      {nome:'Passe intermodal, 7 dias (municipal)', preco:15.00, unidade:'7 dias', quando:'chegada', modos:['autocarro']}
    ]},
  'Aveiro': {operador:'Aveiro Bus', url:'https://www.aveirobus.pt/gama-tarifaria', actualizado:'2026-08-31', fonte:'https://www.aveirobus.pt/gama-tarifaria',
    nota:'Preços em vigor desde agosto de 2024, mantidos sem aumento em 2026 por decisão da câmara. O Bilhete Turístico dá viagens ilimitadas no circuito urbano e fluvial.',
    bilhetes:[
      {nome:'Tarifa de motorista, circuito urbano (avulso)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete ida e volta, circuito urbano (zona 1)', preco:2.05, unidade:'ida e volta', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete turístico, 1 dia', preco:10.00, unidade:'dia', quando:'chegada', modos:['autocarro','barco']},
      {nome:'Bilhete turístico, 2 dias', preco:18.00, unidade:'2 dias', quando:'chegada', modos:['autocarro','barco']}
    ]},
  'Guarda': {operador:'ETUG (Empresa Transportes Urbanos da Guarda)', url:'https://transportes.mun-guarda.pt/Tarifario', actualizado:'2026-08-31', fonte:'https://transportes.mun-guarda.pt/Tarifario',
    nota:'Tarifário aprovado em reunião do executivo municipal de 23/12/2025, em vigor em 2026.',
    bilhetes:[
      {nome:'Bilhete simples (avulso)', preco:1.30, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Pré-comprados (10 bilhetes)', preco:10.00, unidade:'10 viagens', quando:'antes', modos:['autocarro']}
    ]},
  /* A página oficial (covilhamobilidade.pt) monta a tabela em JavaScript,
     sem preços no HTML estático; o cartaz tarifário 2026 em PDF, da mesma
     empresa (Transdev), tem os mesmos títulos com texto a sério. */
  'Covilhã': {operador:'Covilhã Mobilidade', url:'https://covilhamobilidade.pt/Tariff', actualizado:'2026-08-31', fonte:'https://www.transdev.pt/sites/default/files/downloads/covilhamobilidade-tarifariocartaz-a4-2026_001.pdf',
    bilhetes:[
      {nome:'Bilhete de bordo urbano (avulso)', preco:1.85, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete diário urbano pré-comprado', preco:4.35, unidade:'dia', quando:'antes', modos:['autocarro']}
    ]},
  'Braga': {operador:'TUB (Transportes Urbanos de Braga)', url:'https://tub.pt/templates/frontoffice/commerce/pdf/tarifario_2026.pdf', actualizado:'2026-08-31', fonte:'https://tub.pt/templates/frontoffice/commerce/pdf/tarifario_2026.pdf',
    nota:'Em vigor desde 21/02/2026. «Coroa» é a zona: 1 coroa cobre o essencial da cidade.',
    bilhetes:[
      {nome:'Bilhete de bordo (1 coroa)', preco:1.55, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete pré-comprado digital (1 coroa)', preco:0.75, unidade:'viagem', quando:'antes', modos:['autocarro']},
      {nome:'Bilhete turístico, 1 dia', preco:3.35, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete turístico, 3 dias', preco:8.05, unidade:'3 dias', quando:'chegada', modos:['autocarro']}
    ]},
  /* O TUViana é muito recente (cobrança física só arrancou a 13/04/2026):
     não achámos uma página de tarifário dedicada, só o comunicado oficial
     da câmara, com os valores no próprio texto. */
  'Viana do Castelo': {operador:'TUViana (Transportes Urbanos de Viana)', url:'https://www.cm-viana-castelo.pt/areas-de-atividade/comunicacao/noticias/noticia/tuviana-transportes-urbanos-de-viana-iniciam-cobranca-fisica-a-13-de-abril', actualizado:'2026-08-31', fonte:'https://www.cm-viana-castelo.pt/areas-de-atividade/comunicacao/noticias/noticia/tuviana-transportes-urbanos-de-viana-iniciam-cobranca-fisica-a-13-de-abril',
    bilhetes:[
      {nome:'Bilhete a bordo', preco:1.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete pré-comprado', preco:1.00, unidade:'viagem', quando:'antes', modos:['autocarro']},
      {nome:'Bilhete, 1 dia', preco:5.00, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete, 3 dias', preco:12.00, unidade:'3 dias', quando:'chegada', modos:['autocarro']}
    ]},
  'Leiria': {operador:'Mobilis (Rodoviária do Lis)', url:'https://www.rodoviariadolis.pt/precos-titulos/', actualizado:'2026-08-31', fonte:'https://www.rodoviariadolis.pt/wp-content/uploads/RDL_Informa_Aumento-tarifário-2026_Mobilis.pdf',
    nota:'Preços em vigor desde 1/01/2026, publicados a 29/12/2025.',
    bilhetes:[
      {nome:'Tarifa de motorista (avulso)', preco:1.60, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete diário', preco:3.65, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Pré-comprados (mín. 10 viagens)', preco:9.50, unidade:'10 viagens', quando:'antes', modos:['autocarro']}
    ]},
  'Santarém': {operador:'Scalabus (RodoLeziria)', url:'https://www.scalabus.pt/?opc=tarifa', actualizado:'2026-08-31', fonte:'https://www.rodotejo.pt/wp-content/uploads/RLZ_Informa_Aumento-tarifário-2026_scalabus-1.pdf',
    nota:'Preços em vigor desde 1/01/2026, publicados a 29/12/2025.',
    bilhetes:[
      {nome:'Tarifa de motorista (avulso)', preco:1.70, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Pré-comprado (mín. 10 viagens)', preco:1.20, unidade:'viagem', quando:'antes', modos:['autocarro']},
      {nome:'Passe urbano mensal', preco:10.25, unidade:'mês', quando:'antes', modos:['autocarro']}
    ]},
  /* Setúbal é servida pela Carris Metropolitana (zona «Linha Próxima»,
     tarifa 1). A própria página de tarifários ainda mostra os valores de
     2025 (1,25 € / 4,50 €); o aumento de 2026 está confirmado num artigo
     da Lisboa Para Pessoas, publicado a 30/12/2025, com fonte no regulador
     (AMT, taxa de actualização de 2,28 %) e nas operadoras. */
  'Setúbal': {operador:'Carris Metropolitana', url:'https://backoffice.carrismetropolitana.pt/tarifarios/', actualizado:'2026-08-31', fonte:'https://lisboaparapessoas.pt/2025/12/30/transportes-2026-lisboa/',
    nota:'A tarifa de bordo da zona «Linha Próxima» subiu de 1,25 € para 1,30 € em 2026; o pré-pago (zapping) não subiu. Os passes Navegante cobrem toda a Área Metropolitana de Lisboa, não só Setúbal.',
    bilhetes:[
      {nome:'Tarifa de bordo, Linha Próxima (avulso)', preco:1.30, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Navegante pré-pago, Linha Próxima', preco:0.85, unidade:'viagem', quando:'antes', modos:['autocarro']},
      {nome:'Passe Navegante Municipal', preco:30.00, unidade:'mês', quando:'antes', modos:['autocarro']}
    ]},
  'Castelo Branco': {operador:'Mobicab', url:'https://mobicab.pt/tarifarios/', actualizado:'2026-08-31', fonte:'https://mobicab.pt/tarifarios/',
    bilhetes:[
      {nome:'Bilhete simples (avulso)', preco:1.10, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete diário', preco:3.85, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Pré-comprado, 10 viagens', preco:9.70, unidade:'10 viagens', quando:'antes', modos:['autocarro']}
    ]},
  /* A página de tarifários da SMAT diz, no fundo, «Atualizado em
     19/01/2023»: um preço com quase quatro anos não passa no crivo deste
     site. Fica só o operador, à espera de alguém confirmar o actual. */
  'Portalegre': {operador:'SMAT (Serviços Municipalizados de Águas e Transportes de Portalegre)', url:'https://www.cm-portalegre.pt/municipes/servicos-municipalizados/transportes/tarifarios/', actualizado:'2026-08-31', fonte:'https://www.cm-portalegre.pt/municipes/servicos-municipalizados/transportes/tarifarios/',
    bilhetes:[]},
  'Évora': {operador:'Trevo (E-BUS)', url:'https://www.trevo.com.pt/', actualizado:'2026-08-31', fonte:'https://www.cm-evora.pt/wp-content/uploads/2025/12/5-Certidao-ponto-10.3-RPC-17-12-2025.pdf',
    nota:'Valores da deliberação camarária de 17/12/2025, em vigor desde 1/01/2026. A LinhAzul é a linha turística do centro histórico.',
    bilhetes:[
      {nome:'Bilhete de motorista (avulso)', preco:1.55, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Tarifa diária LinhAzul', preco:1.20, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Pré-comprado, 10 viagens', preco:6.10, unidade:'10 viagens', quando:'antes', modos:['autocarro']},
      {nome:'Passe urbano mensal', preco:9.90, unidade:'mês', quando:'antes', modos:['autocarro']}
    ]},
  /* O único tarifário urbano que achámos está datado de julho de 2025, e
     todos os outros operadores portugueses subiram os preços em Janeiro
     de 2026 (taxa nacional de actualização, 2,28 %). Sem uma versão 2026
     confirmada, mostrar aqueles números como actuais seria arriscar um
     valor errado: melhor vazio do que errado. */
  'Beja': {operador:'Rodoviária do Alentejo', url:'https://cm-beja.pt/pt/menu/521/transportes-urbanos-e-transportes-a-pedido--taxis-coletivos.aspx', actualizado:'2026-08-31', fonte:'https://cm-beja.pt/pt/menu/521/transportes-urbanos-e-transportes-a-pedido--taxis-coletivos.aspx',
    bilhetes:[]},
  /* Bragança, Vila Real e Viseu (agora cidades normais, com voo PSO da
     Sevenair: ver `vooLimitado` acima) ficaram sem entrada em 31/08/2026,
     quando passaram a poder ser pesquisadas. Reconferido a 01/09/2026. */
  /* Site em JavaScript, sem PDF de tarifário achado (site novo, app
     Bragança Bus): fica o operador, sem preço. */
  /* O STUB é gratuito para toda a população desde a pandemia, uma medida
     que a autarquia manteve (declaração do então presidente, 2023). Desde
     essa data houve duas mudanças de executivo (Março de 2024 e Outubro
     de 2025); não há uma declaração directa de 2026 a confirmar que a
     gratuitidade continua, mas uma reportagem de 08/06/2026 sobre o plano
     de mobilidade do concelho, já sob a presidente actual, descreve
     linhas, horários e autocarros novos sem mencionar tarifa nenhuma, o
     que seria de esperar se a tivessem reintroduzido. O site oficial não
     publica tarifário porque, precisamente, não há preço a cobrar. */
  'Bragança': {operador:'STUB (Serviço de Transportes Urbanos de Bragança)', url:'https://bus.cm-braganca.pt/', actualizado:'2026-09-01', fonte:'https://www.mdb.pt/noticia/plano-de-mobilidade-preve-novas-rotas-de-autocarros-e-mais-eletricos',
    bilhetes:[{nome:'Todas as linhas urbanas e rurais', preco:0, unidade:'viagem', quando:'chegada', modos:['autocarro']}]},
  /* Idem: página de tarifários em JavaScript, sem PDF alternativo achado. */
  'Vila Real': {operador:'Urbanos de Vila Real (TUVR)', url:'https://www.urbanosvilareal.pt/pt/tarifarios/', actualizado:'2026-09-01', fonte:'https://www.urbanosvilareal.pt/pt/tarifarios/',
    bilhetes:[]},
  /* O primeiro PDF achado dizia «TARIFÁRIOS PARA 2021»; o segundo,
     «TARIFÁRIOS 2025». Só o tarifário 2026 da própria Câmara de Viseu
     (publicado à parte dos horários, que mudaram a 1 de março de 2026)
     tinha a data certa: «Em vigor a partir de 1 de janeiro de 2026». */
  'Viseu': {operador:'MUV (Mobilidade Urbana de Viseu)', url:'https://www.cm-viseu.pt/pt/areas-servicos/mobilidade-urbana-estacionamento/tarifarios-e-horarios/', actualizado:'2026-09-01', fonte:'https://www.cm-viseu.pt/fotos/editor2/mobilidade/web_tarifario_muv_2026.pdf',
    nota:'Preços da zona 1 (a maior parte da cidade). Outras zonas custam mais, consoante a distância.',
    bilhetes:[
      {nome:'Bilhete de motorista (avulso, 1 zona)', preco:0.75, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Pré-comprado, 10 viagens (1 zona)', preco:6.65, unidade:'10 viagens', quando:'antes', modos:['autocarro']},
      {nome:'Bilhete turístico, 1 dia', preco:3.10, unidade:'dia', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete turístico, 3 dias', preco:6.15, unidade:'3 dias', quando:'chegada', modos:['autocarro']}
    ]},
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
  /* Não estava na tabela. Achado o operador (ALSA) por pesquisa; a página
     de tarifas tinha a tabela completa, por escalão de distância. Entram
     dois escalões representativos, pagos por cartão ou QR (mais barato do
     que em dinheiro a bordo). Lido a 31/08/2026. */
  'Ibiza': {operador:'ALSA', url:'https://www.alsaibiza.es/en/fares', actualizado:'2026-08-31', fonte:'https://www.alsaibiza.es/en/fares',
    nota:'Tarifa por escalão de distância. Pago em dinheiro a bordo custa mais (2,40 a 3,60 € consoante o escalão); os valores aqui são a pagar por cartão ou QR na aplicação Mobi4U.',
    bilhetes:[
      {nome:'0 a 9 km', preco:1.70, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Mais de 18 km', preco:2.60, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  'Nice': {operador:"Lignes d'Azur", url:'https://www.lignesdazur.com/fr/titres-et-tarifs', actualizado:'2026-09-01', fonte:'https://www.lignesdazur.com/uploads/Guide_des_tarifs_FR_Septembre_2026_1_0d72c9757b.pdf',
    bilhetes:[
      {nome:'Solo, 1 voyage', preco:1.70, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Pass 1 jour', preco:7.00, unidade:'dia', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Pass 7 jours', preco:20.00, unidade:'7 dias', quando:'antes', modos:['autocarro','eletrico']},
      {nome:'Pass 30 jours', preco:60.00, unidade:'30 dias', quando:'antes', modos:['autocarro','eletrico']}
    ]},
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
  'Reiquiavique': {operador:'Strætó', url:'https://straeto.is/en/store/pricing', actualizado:'2026-09-01', fonte:'https://straeto.is/en/store/pricing', moeda:'ISK',
    nota:'Zona da capital (Reiquiavique e concelhos vizinhos); o preço avulso paga-se por contactless, pela app ou com o cartão Klapp.',
    bilhetes:[
      {nome:'Bilhete simples (adulto)', preco:690, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Passe de 24 horas', preco:2750, unidade:'24 h', quando:'antes', modos:['autocarro']},
      {nome:'Passe de 72 horas', preco:6000, unidade:'72 h', quando:'antes', modos:['autocarro']},
      {nome:'Passe de 30 dias', preco:12000, unidade:'30 dias', quando:'antes', modos:['autocarro']}
    ]},
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
  /* Não estava na tabela. O Visit Qatar (autoridade oficial de turismo,
     não o operador em si) confirma o tecto de gasto diário; a viagem
     avulsa (2 QAR, citada em vários guias) não veio confirmada em nenhuma
     página do próprio Qatar Rail, que recusou o `curl`. Fica só o tecto,
     não um bilhete. Verificado a 31/08/2026. */
  'Doha': {operador:'Qatar Rail (Doha Metro)', url:'https://visitqatar.com/intl-en/plan-your-trip/getting-around/doha-metro', actualizado:'2026-08-31', fonte:'https://visitqatar.com/intl-en/plan-your-trip/getting-around/doha-metro',
    moeda:'QAR', nota:'O Visit Qatar (autoridade de turismo) confirma um tecto de 6 QAR por dia na classe Standard, sem limite de viagens; o valor de cada viagem avulsa não veio confirmado numa página do operador.',
    bilhetes:[]},
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
  /* Não estava na tabela. Achado o operador (KTEL Santorini) por pesquisa;
     a tabela completa de rotas estava numa página em grego, com preços em
     texto simples. A maioria das rotas a partir de Fira, o centro nodal da
     ilha, custa o mesmo. Lido a 31/08/2026. */
  'Santorini': {operador:'KTEL Santorini', url:'https://ktel-santorini.gr/pricetable/', actualizado:'2026-08-31', fonte:'https://ktel-santorini.gr/pricetable/',
    nota:'A maioria das linhas a partir de Fira, o centro da rede, custa o mesmo; as rotas mais longas (ao porto de Athinios, a Períssa) custam um pouco mais. Preço nocturno (00:30-05:00) tem um acréscimo de 25%.',
    bilhetes:[
      {nome:'Fira - Oia', preco:2.20, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Fira - Aeroporto', preco:2.20, unidade:'viagem', quando:'chegada', modos:['autocarro','aeroporto']},
      {nome:'Fira - Porto de Athinios', preco:2.70, unidade:'viagem', quando:'chegada', modos:['autocarro']}
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
  /* A página institucional da ETUFOR não publica o valor da tarifa; o
     reajuste para 2026 foi noticiado por vários órgãos de imprensa
     especializados em transportes, com a mesma fonte (a própria ETUFOR),
     por isso usa-se essa cobertura em vez do site oficial. */
  'Fortaleza': {operador:'ETUFOR', url:'https://mobilidade.fortaleza.ce.gov.br/transporte/etufor.html', actualizado:'2026-09-01', fonte:'https://diariodotransporte.com.br/2025/11/22/fortaleza-ce-tera-reajuste-na-tarifa-de-onibus-a-partir-de-1o-de-janeiro-de-2026-informa-etufor/',
    moeda:'BRL',
    bilhetes:[
      {nome:'Passagem inteira', preco:5.40, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Passagem estudantil', preco:1.50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  'Casablanca': {operador:'Casa Tramway', url:'https://www.casatramway.ma/ticket-abonnement/nos-offres', actualizado:'2026-08-31', fonte:'https://www.casatramway.ma/ticket-abonnement/nos-offres',
    moeda:'MAD', nota:'O cartão recarregável baixa o preço por viagem para 6 dh, mas exige 15 dh à parte pelo cartão (válido 5 anos).',
    bilhetes:[
      {nome:'Ticket unitário, 1 viagem', preco:8, unidade:'viagem', quando:'chegada', modos:['eletrico']},
      {nome:'Ticket unitário, 2 viagens', preco:14, unidade:'2 viagens', quando:'chegada', modos:['eletrico']}
    ]},
  /* Não estava na tabela. O operador dos autocarros urbanos é a ALSA
     (a mesma que já opera em Ibiza e noutras cidades), confirmado por
     várias fontes independentes; o valor mais citado é 4 DH em dinheiro ou
     3,50 DH com o cartão Ikhlas, mas nenhuma delas é a página oficial: a
     página de tarifários da ALSA para Marraquexe (alsa.ma/en/marrakech/
     prices) está partida no próprio sítio, a redireccionar para
     «not-found». Sem uma fonte primária legível, fica só o operador.
     Verificado a 31/08/2026. */
  'Marraquexe': {operador:'ALSA', url:'https://www.alsa.ma/en', actualizado:'2026-08-31', fonte:'https://www.alsa.ma/en',
    moeda:'MAD', bilhetes:[]},
  /* O url antigo redirecciona para metrohanoi.vn; a página das tarifas
     (afc-tickets/metro-fares-1/) monta os preços em JavaScript. Verificado
     a 31/08/2026. */
  'Hanói': {operador:'Hanoi Metro', url:'https://metrohanoi.vn/afc-tickets/metro-fares-1/', actualizado:'2026-08-31', fonte:'https://metrohanoi.vn/afc-tickets/metro-fares-1/', moeda:'VND',
    bilhetes:[]},
  /* Segunda fase do projecto das capitais do mundo: tarifas locais para as
     cidades que entraram por lotes geográficos. Bilbau não estava na
     tabela. Tarifário CTB confirmado por três pesquisas cruzadas a
     03/09/2026: zona 1 com cartão Barik (pré-carregado, mínimo 5€, numa
     máquina na estação) fica a 0,95€; sem cartão, o avulso em dinheiro
     fica a 1,60€; o diário fica a 4,90€. */
  'Bilbau': {operador:'Metro Bilbao / CTB', url:'https://www.ctb.eus/en/metro-service-fares', actualizado:'2026-09-03', fonte:'https://www.ctb.eus/en/metro-service-fares',
    moeda:'EUR', nota:'É preciso o cartão Barik (pré-carregado, mínimo 5€) para a tarifa mais barata; sem cartão paga-se mais no bilhete avulso.',
    bilhetes:[
      {nome:'Bilhete avulso, sem cartão (zona 1)', preco:1.60, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Bilhete com cartão Barik (zona 1)', preco:0.95, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Bilhete diário', preco:4.90, unidade:'24 h', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Bilhete avulso a dinheiro (1€) estável há vários
     anos, confirmado por duas fontes. O bono (cartão recarregável) desce
     de 0,60€ para 0,36€ por viagem a partir de Janeiro de 2026, com
     subsídio do governo espanhol. Verificado a 03/09/2026. */
  'Santiago de Compostela': {operador:'Tussa (Transportes Urbanos de Santiago)', url:'https://tussa.gal/es/estacion/tarifas', actualizado:'2026-09-03', fonte:'https://www.elespanol.com/quincemil/santiago/20250630/quedan-precios-autobus-urbano-santiago-compostela-partir-julio/1003743827097_0.html',
    moeda:'EUR', nota:'O bono (cartão recarregável) tem subsídio do governo espanhol e baixa o preço por viagem; sem cartão paga-se o bilhete avulso ao condutor.',
    bilhetes:[
      {nome:'Bilhete avulso (dinheiro, ao condutor)', preco:1.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bono ordinário, por viagem (com cartão, com subsídio)', preco:0.36, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Tarifário TPER em vigor desde 1 de Março de
     2025, confirmado por duas fontes jornalísticas independentes: o
     bilhete comprado antes (quiosque/tabacaria) é mais barato do que a
     bordo. Verificado a 03/09/2026. */
  'Bolonha': {operador:'TPER (Trasporto Passeggeri Emilia-Romagna)', url:'https://www.tper.it/content/tariffe', actualizado:'2026-09-03', fonte:'https://www.ilrestodelcarlino.it/bologna/economia/sch-aumento-biglietti-bus-cosa-cambia-oggi-dllsxnxw/i-dettagli-sui-nuovi-prezzi-tper-biglietti-e-abbonamenti',
    moeda:'EUR', nota:'O bilhete comprado antes de embarcar (quiosque, tabacaria, TPER Point) é mais barato do que a bordo, onde só se paga com dinheiro ou contactless.',
    bilhetes:[
      {nome:'Bilhete urbano, comprado antes', preco:2.30, unidade:'viagem', quando:'antes', modos:['autocarro']},
      {nome:'Bilhete urbano, comprado a bordo', preco:2.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Tecto diário com contactless', preco:9, unidade:'24 h', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Desde 1 de Março de 2020 os transportes
     públicos são gratuitos em todo o país (autocarro, comboio em 2ª
     classe, eléctrico), confirmado por fonte governamental e reafirmado
     num balanço de cinco anos (Fevereiro de 2025); só a 1ª classe do
     comboio continua paga, sem preço confirmado com confiança
     suficiente para entrar aqui. Verificado a 03/09/2026. */
  'Luxemburgo': {operador:'Mobiliteit.lu / Ville de Luxembourg (rede AVL/RGTR/CFL)', url:'https://www.mobiliteit.lu/en/tickets-page/fares/', actualizado:'2026-09-03', fonte:'https://gouvernement.lu/fr/actualites.gouvernement2024+fr+actualites+toutes_actualites+communiques+2025+02-fevrier+28-bilan-transport-gratuit.html',
    moeda:'EUR', nota:'Os transportes públicos são gratuitos em todo o país desde Março de 2020; a única excepção é a 1ª classe do comboio, que continua paga.',
    bilhetes:[
      {nome:'Bilhete (transporte público gratuito)', preco:0, unidade:'viagem', quando:'chegada', modos:['autocarro','metro','eletrico']}
    ]},
  /* Não estava na tabela. O autocarro urbano é gerido por várias empresas
     privadas em concessão, coordenadas pela Câmara Municipal de Tirana;
     tarifa geral subsidiada pela câmara, confirmada por várias fontes. Há
     linhas suburbanas privadas distintas (Kamëz/Paskuqan-Tiranë) que
     cobram mais (50 lekë desde Nov/2025): não é a tarifa que entra aqui,
     que é a geral da cidade. Verificado a 03/09/2026. */
  'Tirana': {operador:'Autocarros urbanos (concessionárias privadas, coordenadas pela Bashkia Tiranë)', url:'https://urbani.tirana.al/', actualizado:'2026-09-03', fonte:'https://opendata.tirana.al/',
    moeda:'ALL', nota:'Preço da rede geral da cidade, subsidiado pela câmara. Linhas suburbanas privadas distintas (Kamëz, Paskuqan) cobram mais e não são esta tarifa.',
    bilhetes:[
      {nome:'Bilhete simples (dinheiro, ao cobrador)', preco:40, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Passe mensal', preco:1600, unidade:'mês', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Autocarro/trólei/eléctrico (Minsktrans) e metro
     (Minsk Metro) são entidades separadas, com tarifas próximas. Preços
     em vigor desde o aumento de 27/03/2026 (Decisão nº1016 do Comité
     Executivo de Minsk); não foi possível aceder aos sites oficiais
     directamente, mas quatro fontes de imprensa independentes coincidem
     no valor. Verificado a 03/09/2026. */
  'Minsk': {operador:'Minsktrans (autocarro/trólei/eléctrico) / Minsk Metro', url:'https://minsktrans.by/oplata-proezda/tarify/', actualizado:'2026-09-03', fonte:'https://myfin.by/',
    moeda:'BYN', nota:'Talão do autocarro/trólei/eléctrico e ficha do metro têm preços próprios, ligeiramente diferentes.',
    bilhetes:[
      {nome:'Talão autocarro/trólei/eléctrico', preco:1.10, unidade:'viagem', quando:'antes', modos:['autocarro','eletrico']},
      {nome:'Ficha do metro', preco:1.15, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Passe mensal unificado (todos os transportes)', preco:65.84, unidade:'mês', quando:'chegada', modos:['autocarro','metro','eletrico']}
    ]},
  /* Não estava na tabela. GRAS é o operador municipal (eléctrico, trólei,
     autocarro). O preço nominal do bilhete subiu para 2,50 KM a
     01/07/2025, mas o Governo do Cantão de Sarajevo subsidia 0,30 KM,
     por isso o valor pago continua em 2,20 KM; confirmado pela tabela
     oficial do operador e pelo Ministério dos Transportes do cantão.
     Verificado a 03/09/2026. */
  'Sarajevo': {operador:'GRAS (Gradski saobraćaj Sarajevo)', url:'https://gras.ba/karte/', actualizado:'2026-09-03', fonte:'https://gras.ba/wp-content/uploads/2025/06/cjenovnik-tabela-1.7.25.pdf',
    moeda:'BAM', nota:'O preço nominal subiu para 2,50 KM em Julho de 2025, mas um subsídio do Cantão de Sarajevo mantém o valor pago em 2,20 KM.',
    bilhetes:[
      {nome:'Bilhete simples', preco:2.20, unidade:'viagem', quando:'chegada', modos:['eletrico','autocarro']},
      {nome:'Passe diário', preco:7.10, unidade:'24 h', quando:'chegada', modos:['eletrico','autocarro']},
      {nome:'Passe de 10 dias', preco:50, unidade:'10 dias', quando:'chegada', modos:['eletrico','autocarro']}
    ]},
  /* Não estava na tabela. O metro e a rede geral (autocarro/tram/trólei)
     têm tarifário unificado, fixado pelo Centro de Mobilidade Urbana
     (CGM). Os preços passaram de leva (BGN) para euro a 1 de Janeiro de
     2026 (1,60 BGN passou a 0,80€); confirmado pela página oficial do
     Metro de Sófia e por uma notícia do próprio CGM. Verificado a
     03/09/2026. */
  'Sófia': {operador:'Metropoliten EAD (Metro de Sófia) / Centro de Mobilidade Urbana (CGM)', url:'https://www.metrosofia.com/en/tickets', actualizado:'2026-09-03', fonte:'https://www.metrosofia.com/en/tickets',
    moeda:'EUR', nota:'Tarifário unificado para metro, autocarro, tram e trólei. Os preços passaram de leva para euro a 1 de Janeiro de 2026.',
    bilhetes:[
      {nome:'Bilhete "30+" (transbordo até 30 min)', preco:0.80, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Passe diário (toda a rede)', preco:2.00, unidade:'24 h', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  /* Não estava na tabela. A Cyprus Public Transport (CPT) é a operadora
     contratada pelo Ministério dos Transportes para as rotas urbanas de
     Nicósia. O bilhete simples subiu de 2,40€ para 2,70€ a 3 de Agosto de
     2026 (fórmula de reajuste bienal regulada); confirmado pela página
     oficial e por uma notícia local. Não há passe diário só a dinheiro
     (só existe um passe multi-cidade a 20€, exige o cartão Motion, por
     isso não entra aqui). Verificado a 03/09/2026. */
  'Nicósia': {operador:'Cyprus Public Transport (CPT)', url:'https://www.publictransport.com.cy/cms/page/cash-tickets', actualizado:'2026-09-03', fonte:'https://www.publictransport.com.cy/cms/page/cash-tickets',
    moeda:'EUR',
    bilhetes:[
      {nome:'Bilhete simples urbano (dinheiro)', preco:2.70, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete nocturno (21h-4h, dinheiro)', preco:4.70, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. A DPB (Dopravný podnik Bratislava) opera dentro
     do sistema integrado IDS BK. Valores do tarifário oficial (Cenník),
     confirmados contra uma segunda fonte independente sem contradição.
     Verificado a 03/09/2026. */
  'Bratislava': {operador:'Dopravný podnik Bratislava (DPB)', url:'https://dpb.sk/sk/cennik', actualizado:'2026-09-03', fonte:'https://dpb.sk/sk/cennik',
    moeda:'EUR', nota:'Tarifas da cidade (zonas 100+101); o sistema IDS BK integra também comboio e autocarro regional, com zonas próprias.',
    bilhetes:[
      {nome:'Bilhete simples, 30 min', preco:1.20, unidade:'viagem', quando:'chegada', modos:['eletrico','autocarro']},
      {nome:'Bilhete simples, 60 min', preco:1.80, unidade:'viagem', quando:'chegada', modos:['eletrico','autocarro']},
      {nome:'Passe diário 24h', preco:5.40, unidade:'24 h', quando:'chegada', modos:['eletrico','autocarro']}
    ]},
  /* Não estava na tabela. LPP é a operadora municipal. Duas fontes (o
     próprio operador e o turismo oficial de Liubliana) coincidem sem
     contradição. Verificado a 03/09/2026. */
  'Liubliana': {operador:'LPP (Ljubljanski potniški promet)', url:'https://www.lpp.si/en/payment-methods/', actualizado:'2026-09-03', fonte:'https://www.lpp.si/en/payment-methods/',
    moeda:'EUR', cartao:{nome:'Urbana', preco:2.00, nota:'recarregável, reembolsável; sem ela só se paga (sem transbordo grátis) com cartão bancário directo no validador'},
    bilhetes:[
      {nome:'Bilhete simples (90 min)', preco:1.50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Taline tem transportes gratuitos para
     residentes registados, mas não para visitantes: o preço aqui é o que
     um turista paga. O site oficial (tallinn.ee) bloqueou o acesso
     directo (anti-bot), confirmado em vez disso pelo espelho oficial de
     turismo e pelo operador do eléctrico, sem contradição entre os dois.
     Verificado a 03/09/2026. */
  'Taline': {operador:'TLT (Tallinna Linnatransport) / Câmara de Taline', url:'https://www.tallinn.ee/en/pilet/public-transport-tickets-tallinn', actualizado:'2026-09-03', fonte:'https://visittallinn.ee/eng/visitor/plan/transport/public-transport',
    moeda:'EUR', nota:'Os transportes são gratuitos para residentes registados de Taline; um visitante paga sempre o bilhete normal.',
    bilhetes:[
      {nome:'Bilhete 1 hora (contactless/QR)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Passe diário (24 h)', preco:5.50, unidade:'24 h', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  /* Não estava na tabela. TTC (Tbilisi Transport Company) opera
     metro/autocarro/minibus, sistema sem dinheiro (só MetroMoney ou
     cartão bancário). Valor em vigor desde Fevereiro de 2022, sem
     contradição nas fontes actuais. Verificado a 03/09/2026. */
  'Tbilisi': {operador:'Tbilisi Transport Company (TTC)', url:'https://ttc.com.ge/en/tariff/10', actualizado:'2026-09-03', fonte:'https://ttc.com.ge/en/tariff/10',
    moeda:'GEL', nota:'Sistema totalmente sem dinheiro: paga-se com o cartão MetroMoney ou cartão bancário.',
    bilhetes:[
      {nome:'Bilhete único (90 min ilimitados)', preco:1, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Passe diário', preco:3, unidade:'24 h', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Não estava na tabela. Rīgas satiksme é a autoridade municipal. Desde
     Dezembro de 2022 o bilhete de 90 minutos substituiu o bilhete simples
     tradicional para a generalidade dos passageiros; confirmado pelo
     operador e pela câmara de Riga, sem contradição. Verificado a
     03/09/2026. */
  'Riga': {operador:'Rīgas satiksme', url:'https://www.rigassatiksme.lv/en/tickets-and-e-ticket/types-and-prices-of-tickets-1/', actualizado:'2026-09-03', fonte:'https://www.rigassatiksme.lv/en/tickets-and-e-ticket/types-and-prices-of-tickets-1/',
    moeda:'EUR',
    bilhetes:[
      {nome:'Bilhete 90 minutos (e-talon)', preco:1.50, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Passe diário (24 h)', preco:5.00, unidade:'24 h', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  /* Não estava na tabela. VVT é a operadora municipal. Tarifas em vigor
     desde 1 de Julho de 2025 (aumento aprovado pela câmara); sem
     contradição entre fontes. Verificado a 03/09/2026. */
  'Vilnius': {operador:'Vilniaus viešasis transportas (VVT)', url:'https://www.vilniausviesasistransportas.lt/bilietu-kainos/', actualizado:'2026-09-03', fonte:'https://www.vilniausviesasistransportas.lt/bilietu-kainos/',
    moeda:'EUR',
    bilhetes:[
      {nome:'Bilhete 30 min', preco:1.00, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Bilhete 60 min', preco:1.25, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Passe diário', preco:7.50, unidade:'24 h', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  /* Não estava na tabela. JSP Skopje é a operadora municipal, sistema
     tornou-se cashless. Não se confirmou um preço em numerário ao
     motorista (um valor de 60 MKD encontrado numa página turística vinha
     de uma notícia de 2016, descartado por desactualizado). Verificado a
     03/09/2026. */
  'Escópia': {operador:'JSP Skopje', url:'https://skopjebus.mk/en/price-list/', actualizado:'2026-09-03', fonte:'https://skopjebus.mk/en/price-list/',
    moeda:'MKD', nota:'Sistema cashless: o bilhete paga-se com o cartão Skopska ou por telemóvel, não há tarifa em numerário confirmada.',
    bilhetes:[
      {nome:'Bilhete simples (cartão Skopska)', preco:35, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Passe diário', preco:120, unidade:'24 h', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Malta Public Transport (Tallinja) é gratuito só
     para residentes com cartão Tallinja pessoal; um visitante paga
     sempre. Tem duas épocas de preço: a de Verão (14 Jun-18 Out) é a que
     está em vigor a 03/09/2026, dia da verificação. */
  'Valeta': {operador:'Malta Public Transport (Tallinja)', url:'https://www.publictransport.com.mt/fares-and-tickets/', actualizado:'2026-09-03', fonte:'https://www.publictransport.com.mt/fares-and-tickets/',
    moeda:'EUR', nota:'Gratuito só para residentes com cartão Tallinja pessoal; um visitante paga sempre o bilhete. Preço sazonal: mais caro na época de Verão (14 Jun-18 Out) do que no Inverno.',
    bilhetes:[
      {nome:'Bilhete simples, época de Verão (2 h)', preco:2.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete simples, época de Inverno (2 h)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Explore Card, 7 dias', preco:25, unidade:'7 dias', quando:'antes', modos:['autocarro']}
    ]},
  /* Não estava na tabela. RTEC é a operadora municipal. Tarifa em vigor
     desde 1 de Maio de 2026 (subiu de 6 para 7 MDL), confirmada por
     várias notícias, sem contradição. Verificado a 03/09/2026. */
  'Chisinau': {operador:'Regia Transport Electric Chișinău (RTEC)', url:'https://rtec.md/tarife/', actualizado:'2026-09-03', fonte:'https://rtec.md/tarife/',
    moeda:'MDL',
    bilhetes:[
      {nome:'Bilhete simples (autocarro/troleibuz)', preco:7, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. CAM é a operadora do país. O acesso directo ao
     site oficial foi bloqueado pelo proxy da rede, mas o valor coincide
     em várias fontes secundárias independentes (turismo oficial,
     operador do cartão Monapass, guias locais). Verificado a 03/09/2026. */
  'Mónaco': {operador:'CAM (Compagnie des Autobus de Monaco)', url:'https://www.cam.mc/tarifs', actualizado:'2026-09-03', fonte:'https://www.cam.mc/tarifs',
    moeda:'EUR', nota:'O bilhete pago com o cartão/app Monapass é mais barato do que pago ao motorista.',
    bilhetes:[
      {nome:'Bilhete simples, ao motorista (30 min)', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete simples, com Monapass', preco:1.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Passe diário (Monapass)', preco:5.50, unidade:'24 h', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Putevi d.o.o. gere o "Gradski prevoz" de
     Podgorica. Bilhete simples confirmado por três fontes independentes;
     um passe diário apareceu só numa fonte, menos seguro, por isso não
     entra. Verificado a 03/09/2026. */
  'Podgorica': {operador:'Putevi d.o.o. (Gradski prevoz Podgorica)', url:'https://putevi.me/cjenovnik-gradski-prevoz-podgorica/', actualizado:'2026-09-03', fonte:'https://putevi.me/cjenovnik-gradski-prevoz-podgorica/',
    moeda:'EUR',
    bilhetes:[
      {nome:'Bilhete simples (90 min)', preco:0.90, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Operador dividido entre STB (autocarro/
     eléctrico/trólei) e Metrorex (metro). Fontes jornalísticas
     contraditórias sobre o valor actual (7, 9, 12, 14 ou 18 lei conforme
     a fonte e a data, com sucessivas subidas anunciadas entre Set/2025 e
     Mai/2026), sem forma clara de saber qual está em vigor a 03/09/2026.
     Fica só o operador, sem inventar qual dos números é o certo. */
  'Bucareste': {operador:'STB (Societatea de Transport București) / Metrorex', url:'https://www.stbsa.ro/', actualizado:'2026-09-03', fonte:'https://www.stbsa.ro/',
    moeda:'RON', bilhetes:[]},
  /* Não estava na tabela. Mosgortrans (autocarro/eléctrico/trólei) e
     Mosmetro (metro) partilham o cartão Troika. Preços em vigor desde 2
     de Janeiro de 2026, confirmados por três fontes de imprensa
     independentes. Verificado a 03/09/2026. */
  'Moscovo': {operador:'Mosgortrans / Mosmetro (cartão Troika)', url:'https://troika.transport.vtb.ru/tariffs', actualizado:'2026-09-03', fonte:'https://troika.transport.vtb.ru/tariffs',
    moeda:'RUB', nota:'O preço varia com o meio de pagamento: mais barato por biometria (71 RUB), mais caro por cartão bancário/telemóvel sem Troika (83 RUB).',
    bilhetes:[
      {nome:'Bilhete simples (cartão Troika)', preco:75, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete "90 minutos"', preco:112, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  /* Não estava na tabela. GSP Beograd é a operadora municipal. Os
     transportes urbanos e suburbanos são gratuitos desde 1 de Janeiro de
     2025 (medida invulgar mas bem confirmada por várias fontes,
     incluindo o anúncio oficial); a excepção são as linhas de minibus
     expresso (aeroporto e linhas E), que continuam pagas. Verificado a
     03/09/2026. */
  'Belgrado': {operador:'GSP Beograd', url:'https://www.gsp.rs', actualizado:'2026-09-03', fonte:'https://beinbelgrade.com/free-belgrade-public-transport/',
    moeda:'RSD', nota:'O transporte urbano e suburbano normal é gratuito desde Janeiro de 2025; só as linhas de minibus expresso (aeroporto, linhas E) continuam pagas.',
    bilhetes:[
      {nome:'Autocarro/eléctrico/trólei urbano (gratuito)', preco:0, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Minibus expresso do aeroporto (A1)', preco:400, unidade:'viagem', quando:'chegada', modos:['autocarro','aeroporto']}
    ]},
  /* Não estava na tabela. Kyivpastrans (autocarro/eléctrico/trólei) e o
     Metropolitano de Kiev partilham tarifa unificada, definida pela
     câmara (KMDA). Subida recente (15 de Julho de 2026, de 8 para 30
     UAH) confirmada pela fonte oficial da câmara e por três órgãos de
     imprensa. O metro continua operacional apesar da lei marcial;
     não há relação com a falta de voos internacionais, tratada à parte.
     Verificado a 03/09/2026. */
  'Kiev': {operador:'Kyivpastrans / Metropolitano de Kiev', url:'https://kyivcity.gov.ua/', actualizado:'2026-09-03', fonte:'https://kyivcity.gov.ua/news/iz_15_lipnya_vartist_razovogo_prozdu_v_komunalnomu_transporti_stanovitime_30_grn_dlya_postiynikh_pasazhiriv_diyatime_sistema_znizhok/',
    moeda:'UAH',
    bilhetes:[
      {nome:'Bilhete simples', preco:30, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']},
      {nome:'Bilhete com transbordo (90 min)', preco:60, unidade:'viagem', quando:'chegada', modos:['metro','autocarro','eletrico']}
    ]},
  /* Início da ronda das Caraíbas/América Central. Não estava na tabela.
     Não há operadora municipal única: são "jitneys", minibus privados
     licenciados, regulados pelo Road Traffic Department (site oficial
     bloqueado ao acesso), tarifa confirmada por dois jornais
     independentes. Verificado a 03/09/2026. */
  'Nassau': {operador:'"Jitneys" (minibus privados licenciados, regulados pelo Road Traffic Department)', url:'https://www.tribune242.com/', actualizado:'2026-09-03', fonte:'https://www.tribune242.com/',
    moeda:'BSD', nota:'Tarifa em vigor desde Maio de 2024; há relatos de cobrança inconsistente por alguns motoristas.',
    bilhetes:[
      {nome:'Bilhete simples, adulto', preco:1.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete simples, estudante uniformizado', preco:1.25, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Minibus privados e "route taxis" ZR cobram a
     mesma tarifa regulada pelo Transport Board, confirmada pela sua
     própria página oficial. Verificado a 03/09/2026. */
  'Bridgetown': {operador:'Barbados Transport Board', url:'https://www.transportboard.com/about-us/fare-policy/', actualizado:'2026-09-03', fonte:'https://www.transportboard.com/about-us/fare-policy/',
    moeda:'BBD', nota:'Grátis para maiores de 65 anos e crianças de uniforme; minibus e "ZR" route taxis privados cobram a mesma tarifa.',
    bilhetes:[
      {nome:'Bilhete simples, adulto', preco:3.50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Ómnibus Metropolitanos é a empresa estatal;
     sem página oficial de tarifário dedicada, mas o valor (subsidiado,
     sem alterações) está confirmado por três fontes de imprensa
     independentes. Verificado a 03/09/2026. */
  'Havana': {operador:'Ómnibus Metropolitanos', url:'https://oncubanews.com/cuba/precios-en-cuba-tarifas-de-omnibus-urbanos-y-trenes-locales-no-se-tocan-el-resto-sube-con-creces/', actualizado:'2026-09-03', fonte:'https://oncubanews.com/cuba/precios-en-cuba-tarifas-de-omnibus-urbanos-y-trenes-locales-no-se-tocan-el-resto-sube-con-creces/',
    moeda:'CUP',
    bilhetes:[
      {nome:'Bilhete simples', preco:2, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Minibus privados (matrícula "H"), com tarifas
     fixadas pelo Cabinet (governo) da Commonwealth of Dominica; fonte
     oficial (news.gov.dm) de Março de 2023, a mais recente encontrada,
     sem confirmação de actualização posterior. Verificado a 03/09/2026. */
  'Roseau': {operador:'Minibus privados (matrícula "H"), tarifário fixado pelo Cabinet da Commonwealth of Dominica', url:'https://www.news.gov.dm/news/news-items/cabinet-approves-the-implementation-of-new-bus-fares-and-taxi-rates-2', actualizado:'2026-09-03', fonte:'https://www.news.gov.dm/news/news-items/cabinet-approves-the-implementation-of-new-bus-fares-and-taxi-rates-2',
    moeda:'XCD', nota:'O preço depende da distância; o tarifário oficial mais recente encontrado é de Março de 2023.',
    bilhetes:[
      {nome:'Percurso curto, junto a Roseau', preco:2.00, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Percurso mais longo', preco:11.50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. OMSA opera os autocarros, OPRET o Metro de
     Santo Domingo. Nalguns corredores (como o 27 de Febrero) a tarifa
     OMSA isolada de RD$15 foi substituída pela tarifa integrada de
     RD$35; confirmado por três fontes dominicanas de 2025/2026.
     Verificado a 03/09/2026. */
  'Santo Domingo': {operador:'OMSA (autocarros) / OPRET (Metro de Santo Domingo)', url:'https://www.omsa.gob.do/categoria/servicios/transporte-de-pasajeros', actualizado:'2026-09-03', fonte:'https://www.elcaribe.com.do/panorama/pais/pasaje-metro-rd20-tarifa-integrada-rd35/',
    moeda:'DOP', nota:'Nalguns corredores (como o 27 de Febrero) a tarifa OMSA isolada de RD$15 foi substituída pela tarifa integrada.',
    bilhetes:[
      {nome:'Metro, isolado', preco:20, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Tarifa integrada (Metro+Teleférico+corredores OMSA, até 90 min)', preco:35, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Não estava na tabela. ARESEP regula dezenas de empresas privadas,
     cada uma com tarifa própria por rota (não há tarifa única citadina);
     um valor de uma rota específica apareceu só numa fonte, sem
     confirmação cruzada, por isso fica só o operador. Verificado a
     03/09/2026. */
  'San José': {operador:'Autocarros privados concessionados, regulados pela ARESEP', url:'https://aresep.go.cr/autobus/tarifas/', actualizado:'2026-09-03', fonte:'https://aresep.go.cr/autobus/tarifas/',
    moeda:'CRC', bilhetes:[]},
  /* Não estava na tabela. O Viceministerio de Transporte (VMT) regula
     autocarros e microbuses privados concessionados; a tarifa varia por
     rota ($0.20 a $1.86) e exige consulta por matrícula do veículo, sem
     valor único citadino. Verificado a 03/09/2026. */
  'San Salvador': {operador:'Autocarros/microbuses privados concessionados, regulados pelo Viceministerio de Transporte (VMT)', url:'https://www.vmt.gob.sv/servicios/consulta-de-tarifa-de-transporte/', actualizado:'2026-09-03', fonte:'https://www.vmt.gob.sv/servicios/consulta-de-tarifa-de-transporte/',
    moeda:'USD', bilhetes:[]},
  /* Não estava na tabela. Transmetro (BRT) e TuBus são sistemas
     municipais distintos com tarifas próprias; o Transmetro está fixo em
     Q1,50 desde 2007, o TuBus em Q5,00 desde 2023. Verificado a
     03/09/2026. */
  'Cidade da Guatemala': {operador:'Transmetro / TuBus (Municipalidad de Guatemala)', url:'https://www.muniguate.com/movilidadurbana/transmetro/', actualizado:'2026-09-03', fonte:'https://www.muniguate.com/movilidadurbana/transmetro/',
    moeda:'GTQ', nota:'Transmetro (BRT) e TuBus são sistemas municipais distintos, com tarifas próprias.',
    bilhetes:[
      {nome:'Transmetro (BRT)', preco:1.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'TuBus', preco:5, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. O IHTT regula empresas privadas de autocarro
     urbano ("rapiditos"); fontes de Maio de 2026 divergem entre 13 e 15
     lempiras conforme a rota/veículo, sem página oficial de tarifário
     única, por isso fica só o operador. Verificado a 03/09/2026. */
  'Tegucigalpa': {operador:'Autocarros urbanos privados ("rapiditos"), regulados pelo IHTT', url:'https://www.transporte.gob.hn/', actualizado:'2026-09-03', fonte:'https://www.transporte.gob.hn/',
    moeda:'HNL', bilhetes:[]},
  /* Não estava na tabela. JUTC é a operadora estatal. Há também uma
     tarifa reduzida com o cartão SmartFare, mas era uma medida temporária
     até Dezembro de 2025 sem confirmação de que continua em vigor, por
     isso fica só o bilhete a dinheiro. Verificado a 03/09/2026. */
  'Kingston': {operador:'Jamaica Urban Transit Company (JUTC)', url:'https://jutc.gov.jm/faq/', actualizado:'2026-09-03', fonte:'https://jutc.gov.jm/faq/',
    moeda:'JMD',
    bilhetes:[
      {nome:'Bilhete simples, adulto (dinheiro)', preco:100, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. TUC é regulado pelo IRTRAMMA, sob a Alcaldia
     de Managua; o site oficial do IRTRAMMA não resolveu, por isso a
     fonte é de imprensa, sem página oficial de tarifário confirmada.
     Verificado a 03/09/2026. */
  'Manágua': {operador:'Transporte Urbano Colectivo (TUC), regulado pelo IRTRAMMA', url:'https://www.managua.gob.ni/', actualizado:'2026-09-03', fonte:'https://www.vivanicaragua.com.ni/2026/02/20/sociales/pasaje-transporte-publico-centroamerica/',
    moeda:'NIO',
    bilhetes:[
      {nome:'Bilhete simples (subsidiado)', preco:2.50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Metro de Panamá (linhas 1 e 2) e MiBus
     (autocarros) têm tarifas próprias, confirmadas por várias fontes de
     2025/2026; a Linha 3 do metro ainda não tem tarifa própria
     confirmada. PAB (balboa) tem paridade 1:1 com o dólar americano.
     Verificado a 03/09/2026. */
  'Cidade do Panamá': {operador:'Metro de Panamá / MiBus', url:'https://elmetrodepanama.com/tarifa-del-metro/', actualizado:'2026-09-03', fonte:'https://elmetrodepanama.com/tarifa-del-metro/',
    moeda:'PAB', nota:'PAB (balboa) tem paridade fixa 1:1 com o dólar americano.',
    bilhetes:[
      {nome:'Metro, Linha 1', preco:0.35, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metro, Linha 2', preco:0.50, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'MiBus, troncal', preco:0.25, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'MiBus, corredor', preco:0.75, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Início da ronda da América do Sul e México/Peru. Não estava na
     tabela. Mi Teleférico é a empresa estatal do sistema de teleféricos;
     os autocarros municipais PumaKatari/ChikiTiti complementam a rede
     (micros/trufis privados existem mas sem tarifário centralizado).
     Confirmado pelo site oficial e por imprensa governamental/
     independente. Verificado a 03/09/2026. */
  'La Paz': {operador:'Mi Teleférico / PumaKatari', url:'https://www.miteleferico.bo/pcymt/horarios-y-tarifas', actualizado:'2026-09-03', fonte:'https://www.miteleferico.bo/pcymt/horarios-y-tarifas',
    moeda:'BOB', nota:'O teleférico cobra um valor extra por transbordo entre linhas.',
    bilhetes:[
      {nome:'Mi Teleférico, geral', preco:3, unidade:'viagem', quando:'chegada', modos:['funicular']},
      {nome:'PumaKatari, dinheiro', preco:3.50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Metro de Quito (EPM) e Trolebús/Ecovía (EPMTPQ)
     são sistemas municipais distintos. Uma tarifa integrada única de
     USD 0,60 chegou a ser anunciada para 2025, mas fontes de 2026
     confirmam que as tarifas separadas se mantiveram. Verificado a
     03/09/2026. */
  'Quito': {operador:'Metro de Quito (EPM) / Trolebús-Ecovía (EPMTPQ)', url:'https://metrodequito.gob.ec/etiqueta/tarifas/', actualizado:'2026-09-03', fonte:'https://metrodequito.gob.ec/etiqueta/tarifas/',
    moeda:'USD', nota:'Uma tarifa integrada única chegou a ser anunciada para 2025, mas não avançou: os dois sistemas continuam com tarifas separadas.',
    bilhetes:[
      {nome:'Metro', preco:0.45, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Trolebús/Ecovía', preco:0.35, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Rede fragmentada de empresas privadas
     licenciadas ("líneas permisionarias"), tarifa fixada pela
     Municipalidade de Assunção; subida aprovada pela Junta Municipal em
     Dezembro de 2025, confirmada por três fontes independentes.
     Verificado a 03/09/2026. */
  'Assunção': {operador:'Líneas permisionarias (Municipalidade de Assunción)', url:'https://www.asuncion.gov.py/transito/reajuste-del-costo-del-pasaje-para-lineas-permisionarias-de-asuncion', actualizado:'2026-09-03', fonte:'https://www.asuncion.gov.py/transito/reajuste-del-costo-del-pasaje-para-lineas-permisionarias-de-asuncion',
    moeda:'PYG',
    bilhetes:[
      {nome:'Bilhete avulso (autocarro interno)', preco:3400, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. STM é o sistema metropolitano, operado sobretudo
     pela CUTCSA; tarifa em vigor desde 5 de Janeiro de 2026, confirmada
     pelo site oficial da câmara e por várias notícias independentes.
     Verificado a 03/09/2026. */
  'Montevideu': {operador:'Sistema de Transporte Metropolitano (STM) / CUTCSA', url:'https://montevideo.gub.uy/areas-tematicas/sistema-de-transporte-metropolitano/tarifas-del-transporte-colectivo-urbano', actualizado:'2026-09-03', fonte:'https://montevideo.gub.uy/areas-tematicas/sistema-de-transporte-metropolitano/tarifas-del-transporte-colectivo-urbano',
    moeda:'UYU', nota:'O bilhete com cartão STM é mais barato do que pago em dinheiro.',
    bilhetes:[
      {nome:'Boleto comum, com cartão STM', preco:52, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Boleto comum, dinheiro', preco:64, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Metro de Caracas gere também o Metrobús. Sem
     página de tarifário oficial funcional (o domínio está "em
     construção"), mas o valor está confirmado por cinco fontes de
     imprensa independentes, todas de Maio de 2026. Nota importante: a
     Venezuela tem inflação muito elevada, e a tarifa pode já ter subido
     de novo depois da verificação; o preço do transporte urbano privado
     (fora do Metro) já tinha subido de novo em Setembro de 2026.
     Verificado a 03/09/2026. */
  'Caracas': {operador:'Metro de Caracas (C.A. Metro de Caracas)', url:'https://talcualdigital.com/metro-de-caracas-subio-el-pasaje-de-80-a-90-bolivares-sin-previo-aviso-a-los-usuarios/', actualizado:'2026-09-03', fonte:'https://talcualdigital.com/metro-de-caracas-subio-el-pasaje-de-80-a-90-bolivares-sin-previo-aviso-a-los-usuarios/',
    moeda:'VES', nota:'Inflação muito elevada na Venezuela: a tarifa subiu de 60 para 80 e depois para 90 bolívares só entre Março e Maio de 2026, e pode voltar a mudar a qualquer momento.',
    bilhetes:[
      {nome:'Bilhete geral', preco:90, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Bilhete estudante', preco:45, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Metrô-DF e DFTrans, sob a SEMOB-DF; tarifas
     congeladas até final de 2026, confirmadas por fontes oficiais e de
     imprensa sem contradições. Há também autocarro e metro gratuitos aos
     domingos e feriados desde Março de 2025 ("Vai de Graça"), não
     representado aqui por não ser o caso comum de um dia de semana.
     Verificado a 03/09/2026. */
  'Brasília': {operador:'Metrô-DF / DFTrans (SEMOB-DF)', url:'https://www.semob.df.gov.br/precos-das-passagens', actualizado:'2026-09-03', fonte:'https://www.semob.df.gov.br/precos-das-passagens',
    moeda:'BRL', nota:'Autocarro e metro são gratuitos aos domingos e feriados desde Março de 2025 ("Vai de Graça").',
    bilhetes:[
      {nome:'Metrô-DF', preco:5.50, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Autocarro, curta distância', preco:2.70, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. BHTrans gere os autocarros, o Metrô BH é uma
     concessão privada (Grupo Comporte) desde Março de 2023; valores bem
     cruzados por fontes institucionais e de imprensa. Verificado a
     03/09/2026. */
  'Belo Horizonte': {operador:'BHTrans (autocarros) / Metrô BH', url:'https://prefeitura.pbh.gov.br/sumob/onibus/tarifas-e-integracoes', actualizado:'2026-09-03', fonte:'https://prefeitura.pbh.gov.br/sumob/onibus/tarifas-e-integracoes',
    moeda:'BRL',
    bilhetes:[
      {nome:'Autocarro convencional', preco:6.25, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Metrô BH', preco:6.00, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Metro STC, Metrobús (BRT) e Trolebús (STE) são
     três sistemas geridos pelo Governo da CDMX, cada um com tarifa
     própria; confirmado por várias fontes institucionais e de imprensa,
     mantidas de 2025 para 2026. Verificado a 03/09/2026. */
  'Cidade do México': {operador:'Metro STC / Metrobús / Trolebús (Governo da CDMX)', url:'https://metro.cdmx.gob.mx/acerca-del-metro/mas-informacion/costo-del-boleto_boletos', actualizado:'2026-09-03', fonte:'https://metro.cdmx.gob.mx/acerca-del-metro/mas-informacion/costo-del-boleto_boletos',
    moeda:'MXN',
    bilhetes:[
      {nome:'Metro STC', preco:5, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metrobús', preco:6, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Trolebús', preco:4, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Rede de autocarros urbanos, regulada pelo
     IMOVEQROO; fontes contradizem-se sobre o valor actual (12, 13 ou
     15 MXN conforme a fonte e a zona), com um novo sistema "MOBI" ainda
     em implementação, sem forma clara de saber qual está em vigor.
     Verificado a 03/09/2026. */
  'Cancún': {operador:'Autocarros urbanos (rutas R1/R2...), regulados pelo IMOVEQROO', url:'https://imoveqroo.qroo.gob.mx/', actualizado:'2026-09-03', fonte:'https://imoveqroo.qroo.gob.mx/',
    moeda:'MXN', bilhetes:[]},
  /* Não estava na tabela. Metropolitano (BRT, gerido pela ATU) e Metro
     de Lima Linha 1 são sistemas distintos, ambos com tarifário oficial
     bem confirmado por várias fontes de 2025/2026. Verificado a
     03/09/2026. */
  'Lima': {operador:'Metropolitano (ATU) / Metro de Lima, Linha 1', url:'https://portal.atu.gob.pe/', actualizado:'2026-09-03', fonte:'https://portal.atu.gob.pe/',
    moeda:'PEN',
    bilhetes:[
      {nome:'Metropolitano, troncal', preco:3.20, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Metro, Linha 1', preco:1.50, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. NVB é a operadora estatal (existe também a
     rede privada PLO), mas não há tarifário oficial dedicado online, e
     as fontes de imprensa desactualizam-se depressa (inflação, SRD
     instável); o último valor concreto encontrado é de Fevereiro de
     2025, sem confirmação fiável de 2026. Verificado a 03/09/2026. */
  'Paramaribo': {operador:'NVB (Nationaal Vervoer Bedrijf)', url:'https://gov.sr/thema/nationaal-vervoer-bedrijf-nvb/', actualizado:'2026-09-03', fonte:'https://gov.sr/thema/nationaal-vervoer-bedrijf-nvb/',
    moeda:'SRD', bilhetes:[]},
  /* Início da ronda de África. Não estava na tabela. Metro do Cairo,
     gerido pela NAT; reajuste oficial em vigor desde 27/03/2026,
     confirmado por duas fontes noticiosas independentes. Verificado a
     04/09/2026. */
  'Cairo': {operador:'Metro do Cairo (National Authority for Tunnels)', url:'https://www.cairometro.gov.eg/en/bookings/3', actualizado:'2026-09-04', fonte:'https://www.dailynewsegypt.com/2026/03/26/egypt-raises-train-and-metro-fares-in-latest-pricing-adjustment/',
    moeda:'EGP', nota:'O preço depende do número de estações percorridas.',
    bilhetes:[
      {nome:'Até 9 estações', preco:10, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'10 a 16 estações', preco:12, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'17 a 23 estações', preco:15, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Mais de 23 estações', preco:20, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Sunu BRT é o novo sistema de autocarros rápidos;
     existiu uma promoção temporária a 300 FCFA (Outubro de 2025), já
     expirada, não confundir com a tarifa normal. Confirmado pelo site
     oficial e por imprensa local. Verificado a 04/09/2026. */
  'Dakar': {operador:'Sunu BRT / TER (Train Express Régional)', url:'https://www.sunubrt.sn/titres-et-tarifs/', actualizado:'2026-09-04', fonte:'https://www.sunubrt.sn/titres-et-tarifs/',
    moeda:'XOF',
    bilhetes:[
      {nome:'BRT, dentro da mesma zona', preco:400, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'BRT, entre zonas', preco:500, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. MMTL (autocarros estatais) e trotros privados
     (GPRTU); o BRT Aayalolo está inactivo desde 2018. Corte oficial de
     15% em Maio de 2025 seguido de subidas não autorizadas (até 50%)
     relatadas em 2026, sem tarifário publicado online, por isso fica só
     o operador. Verificado a 04/09/2026. */
  'Acra': {operador:'Metro Mass Transit Limited (MMTL) / trotros (GPRTU)', url:'https://mmt.gov.gh/', actualizado:'2026-09-04', fonte:'https://mmt.gov.gh/',
    moeda:'GHS', bilhetes:[]},
  /* Não estava na tabela. Rede de táxis colectivos partilhados
     ("taxi-ville"), tarifa fixada por negociação entre governo e
     sindicato de taxistas; não há autocarro nem metro formal. O valor
     mais recente encontrado é de Maio de 2022, reconfirmado por guias de
     viagem posteriores mas sem actualização mais recente localizada.
     Verificado a 04/09/2026. */
  'Moroni': {operador:'Táxis colectivos ("taxi-ville")', url:'https://lagazettedescomores.com/soci%C3%A9t%C3%A9/le-tarif-est-fix%C3%A9-%C3%A0-300-fc-pour-le-taxi-ville-.html', actualizado:'2026-09-04', fonte:'https://lagazettedescomores.com/soci%C3%A9t%C3%A9/le-tarif-est-fix%C3%A9-%C3%A0-300-fc-pour-le-taxi-ville-.html',
    moeda:'KMF', nota:'Preço fixado por negociação entre o governo e o sindicato de taxistas; o valor mais recente encontrado é de 2022.',
    bilhetes:[
      {nome:'Táxi colectivo, dentro da cidade', preco:300, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Mercado de minibus privados ("cent-cent"),
     regulado por decreto governamental, representado pela federação
     sindical Fésyptc. A tarifa oficial máxima (150 FCFA, confirmada
     Fevereiro de 2025) diverge do preço realmente praticado no terreno
     (200-250 FCFA); entra o valor oficial, com nota. Verificado a
     04/09/2026. */
  'Brazzaville': {operador:'Minibus privados ("cent-cent"), regulados por decreto governamental', url:'https://www.aci.cg/congo-societe-le-transport-en-commun-maintenu-a-150-fcfa-et-le-taxi-a-1000-fcfa/', actualizado:'2026-09-04', fonte:'https://www.aci.cg/congo-societe-le-transport-en-commun-maintenu-a-150-fcfa-et-le-taxi-a-1000-fcfa/',
    moeda:'XAF', nota:'150 FCFA é a tarifa máxima legal; na prática, é frequente pagar-se mais (200 a 250 FCFA).',
    bilhetes:[
      {nome:'Bilhete oficial (tarifa máxima legal)', preco:150, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Transco é a empresa pública de autocarros; a
     grelha tarifária do governo provincial (Janeiro de 2025) fixa preços
     por percurso, confirmados por cinco fontes de imprensa congolesa
     independentes. Há relatos de que motoristas nem sempre a respeitam.
     Verificado a 04/09/2026. */
  'Kinshasa': {operador:'Transco (Transports au Congo)', url:'https://transco-rdc.cd/', actualizado:'2026-09-04', fonte:'https://transco-rdc.cd/',
    moeda:'CDF', nota:'O preço depende muito da distância; motoristas nem sempre respeitam a grelha oficial.',
    bilhetes:[
      {nome:'Trajecto curto (mínimo)', preco:500, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Trajecto médio', preco:2000, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Trajecto longo', preco:8000, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. CNT, empresa pública criada em 2025 pela fusão
     da Sogatra com a Trans'Urb; valor confirmado por três fontes de
     imprensa gabonesa independentes, mas sem confirmação de que já está
     em vigor em todas as linhas. Verificado a 04/09/2026. */
  'Libreville': {operador:'Compagnie Nationale de Transport (CNT)', url:'https://transports.gouv.ga/la-compagnie-nationale-de-transport-la-renaissance-du-transport-public-gabonais/', actualizado:'2026-09-04', fonte:'https://transports.gouv.ga/la-compagnie-nationale-de-transport-la-renaissance-du-transport-public-gabonais/',
    moeda:'XAF',
    bilhetes:[
      {nome:'Bilhete simples urbano', preco:200, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete diário', preco:1000, unidade:'24 h', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Não há autocarro municipal formal activo; o
     transporte público de facto é o táxi colectivo ("ramassage"), com
     tarifa fixada por despacho do Ministério do Comércio de Fevereiro
     de 2024. Verificado a 04/09/2026. */
  'Yaoundé': {operador:'Táxis colectivos ("ramassage"), tarifas fixadas pelo Ministério do Comércio', url:'https://www.investiraucameroun.com/', actualizado:'2026-09-04', fonte:'https://www.investiraucameroun.com/',
    moeda:'XAF',
    bilhetes:[
      {nome:'Táxi colectivo, dia', preco:350, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Táxi colectivo, noite', preco:400, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Não há operador municipal formal; o transporte
     público de facto é o táxi colectivo, com tarifa fixada por despacho
     interministerial de Janeiro de 2023, o mais recente encontrado.
     Verificado a 04/09/2026. */
  'Bangui': {operador:'Táxis colectivos, tarifas fixadas por despacho interministerial', url:'https://www.radiondekeluka.org/39819-centrafrique-apres-le-carburant-le-transport-collectif-change-de-tarifs', actualizado:'2026-09-04', fonte:'https://www.radiondekeluka.org/39819-centrafrique-apres-le-carburant-le-transport-collectif-change-de-tarifs',
    moeda:'XAF',
    bilhetes:[
      {nome:'Táxi colectivo, dia', preco:225, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Táxi colectivo, a partir das 21h', preco:350, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. SOTRA é a empresa estatal de autocarros e
     bateaux-bus; valores confirmados por comunicado oficial do
     Ministério dos Transportes de Julho de 2024. Verificado a
     04/09/2026. */
  'Abidjan': {operador:'SOTRA (Société des Transports Abidjanais)', url:'http://www.sotra.ci/www/s/titres-et-tarifs/', actualizado:'2026-09-04', fonte:'http://www.sotra.ci/www/s/titres-et-tarifs/',
    moeda:'XOF',
    bilhetes:[
      {nome:'Linhas "Monbus"', preco:200, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Linhas Express/Navette', preco:500, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Os matatus (minibus privados) são geridos por
     mais de 600 SACCOs sem tarifário único; a NAMATA (autoridade
     metropolitana) tem um BRT em fase-piloto, ainda sem tarifa oficial
     fixa confirmada. Verificado a 04/09/2026. */
  'Nairóbi': {operador:'Matatus (SACCOs privadas), regulados pela NAMATA', url:'https://namata.go.ke/', actualizado:'2026-09-04', fonte:'https://namata.go.ke/',
    moeda:'KES', bilhetes:[]},
  /* Não estava na tabela. Táxis partilhados "4+1" e minibus privados,
     tarifas fixadas pelo Road Transport Board; duas fontes davam valores
     diferentes (M17 e M23) para a mesma tarifa na mesma data, sem forma
     clara de saber qual está correcta, por isso fica só o operador.
     Verificado a 04/09/2026. */
  'Maseru': {operador:'Táxis partilhados "4+1" / minibus, regulados pelo Road Transport Board', url:'https://www.gov.ls/transport/increase-in-transport-fares-officiated/', actualizado:'2026-09-04', fonte:'https://www.gov.ls/transport/increase-in-transport-fares-officiated/',
    moeda:'LSL', bilhetes:[]},
  /* Não estava na tabela. Rede de minibus/combi privados, regulados pelo
     Ministry of Transport and Infrastructure; valor mais recente
     (Government Notice 309 de 2026) confirmado por duas fontes
     independentes, substitui valores mais antigos e contraditórios de
     fontes turísticas. Verificado a 04/09/2026. */
  'Gaborone': {operador:'Minibus/combi privados, regulados pelo Ministry of Transport and Infrastructure', url:'https://www.mmegi.bw/news/taxi-fares-rise/news', actualizado:'2026-09-04', fonte:'https://www.mmegi.bw/news/taxi-fares-rise/news',
    moeda:'BWP',
    bilhetes:[
      {nome:'Minibus/combi, local', preco:9, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. SOTRACO é a empresa municipal de autocarros;
     tarifas revistas a 20 de Maio de 2026, confirmadas por duas fontes
     noticiosas independentes. Verificado a 04/09/2026. */
  'Ouagadougou': {operador:'SOTRACO (Société de Transport en Commun de Ouagadougou)', url:'https://sotraco.bf/', actualizado:'2026-09-04', fonte:'https://sotraco.bf/',
    moeda:'XOF',
    bilhetes:[
      {nome:'Bilhete simples, linha urbana', preco:200, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Não há operador municipal único: kombis e
     autocarros privados independentes, sujeitos a um tecto regulatório
     nacional (Maximum Bus and Taxi Fares Regulations); entra o tecto
     regulado, não uma tarifa fixa de operador. Verificado a 04/09/2026. */
  'Manzini': {operador:'Kombis/autocarros privados, sujeitos ao tecto nacional (Maximum Bus and Taxi Fares Regulations)', url:'https://times.co.sz/41670/news/public-transport-fares-could-increase-by-25', actualizado:'2026-09-04', fonte:'https://times.co.sz/41670/news/public-transport-fares-could-increase-by-25',
    moeda:'SZL', nota:'Não é uma tarifa fixa de bilhete: é o tecto máximo nacional regulado por lei, para percursos até 8 km.',
    bilhetes:[
      {nome:'Tecto regulado, até 8 km', preco:10, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. O Addis Ababa Light Rail (metro ligeiro) e os
     autocarros Anbessa/Sheger (AACBSE) são os dois sistemas formais.
     Valores repetidos de forma consistente em vários guias de viagem,
     mas sem data clara: uma revisão tarifária oficial de Outubro de 2024
     confirmada para minibus/midibus pode não se aplicar aqui, por isso
     os valores podem estar desactualizados. Verificado a 04/09/2026. */
  'Adis Abeba': {operador:'Addis Ababa Light Rail / Anbessa-Sheger (AACBSE)', url:'https://erc.gov.et/', actualizado:'2026-09-04', fonte:'https://erc.gov.et/',
    moeda:'ETB', nota:'Uma revisão tarifária oficial de Outubro de 2024 foi confirmada para minibus/midibus; não está confirmado se o metro ligeiro e os autocarros AACBSE tiveram a mesma revisão.',
    bilhetes:[
      {nome:'Metro ligeiro, até 8 estações', preco:2, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Segunda ronda de África. Não estava na tabela. Metro/tramway (EMA) e
     autocarros (ETUSA); valores-base fixados em 2011-2014, sem
     confirmação directa de reajuste posterior, mas consistentes com
     dados agregados de 2026. Confiança moderada. Verificado a
     04/09/2026. */
  'Argel': {operador:'Metro/Tramway de Argel (EMA) / ETUSA', url:'https://www.metroalger-dz.com/', actualizado:'2026-09-04', fonte:'https://www.metroalger-dz.com/',
    moeda:'DZD', nota:'Valores-base de 2011-2014, sem confirmação directa de reajuste mais recente.',
    bilhetes:[
      {nome:'Metro, bilhete simples', preco:50, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Tramway, bilhete único', preco:40, unidade:'viagem', quando:'chegada', modos:['eletrico']}
    ]},
  /* Não estava na tabela. TCUL (autocarros estatais) e táxis colectivos
     "candongueiros", tarifas fixadas pela ANTT; valor em vigor desde
     7/7/2025, confirmado por quatro fontes independentes. Verificado a
     04/09/2026. */
  'Luanda': {operador:'TCUL / táxis colectivos (candongueiros), tarifas fixadas pela ANTT', url:'https://expansao.co.ao/', actualizado:'2026-09-04', fonte:'https://expansao.co.ao/',
    moeda:'AOA',
    bilhetes:[
      {nome:'Autocarro urbano (TCUL)', preco:200, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Táxi colectivo (candongueiro)', preco:300, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Rede "taxi-be" fragmentada por cooperativa
     (UCTU, FMA...), sem tarifário único: o valor varia por cooperativa e
     linha (600 a 1500 Ariary conforme a fonte), por isso fica só o
     regulador municipal. Verificado a 04/09/2026. */
  'Antananarivo': {operador:'Taxi-be (minibus privados em cooperativas), licenciados pela Comuna Urbana de Antananarivo (CUA)', url:'https://www.cua.mg/', actualizado:'2026-09-04', fonte:'https://www.cua.mg/',
    moeda:'MGA', bilhetes:[]},
  /* Não estava na tabela. Rede de minibus privados coordenada
     informalmente pela MOAM (Minibus Owners Association of Malawi, não
     opera veículos); valores de uma única fonte de imprensa (Junho de
     2026), sem segunda fonte a citar os números exactos, mas o contexto
     (corte no preço do combustível) está corroborado por várias outras.
     Verificado a 04/09/2026. */
  'Lilongwe': {operador:'Minibus privados, coordenados pela MOAM (Minibus Owners Association of Malawi)', url:'https://mwnation.com/', actualizado:'2026-09-04', fonte:'https://mwnation.com/',
    moeda:'MWK', nota:'O preço depende muito da distância; valor de uma única fonte de imprensa, sem confirmação cruzada dos números exactos.',
    bilhetes:[
      {nome:'Area 24 ao Depósito de Minibus (curta)', preco:1500, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Sotrama são minibus privados geridos por
     sindicatos de transportadores, sem operador único nem site oficial;
     gama de preços confirmada por várias fontes independentes. Verificado
     a 04/09/2026. */
  'Bamako': {operador:'Sotrama (minibus privados, sindicatos de transportadores)', url:'https://www.bamada.net/', actualizado:'2026-09-04', fonte:'https://www.bamada.net/',
    moeda:'XOF', nota:'O preço depende da distância; sobe com o preço do combustível, sem tarifário fixo regulado.',
    bilhetes:[
      {nome:'Trajecto curto', preco:150, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Trajecto mais longo', preco:275, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. STP (empresa estatal) lançou autocarros BHNS
     em Maio de 2025; valor confirmado por múltiplas fontes de imprensa
     independentes em datas diferentes. Verificado a 04/09/2026. */
  'Nouakchott': {operador:'STP (Société de Transport Public)', url:'https://stp.mr/', actualizado:'2026-09-04', fonte:'https://stp.mr/',
    moeda:'MRU',
    bilhetes:[
      {nome:'Bilhete simples', preco:15, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Metro Express é o light rail que serve a área
     metropolitana; o preço depende do número de zonas percorridas (Rs 32
     a Rs 52), confirmado por duas fontes independentes; entra o valor
     mínimo. Verificado a 04/09/2026. */
  'Port Louis': {operador:'Metro Express', url:'https://mauritiusmetroexpress.mu/my-journey/?lang=en', actualizado:'2026-09-04', fonte:'https://mauritiusmetroexpress.mu/my-journey/?lang=en',
    moeda:'MUR', nota:'O preço depende do número de zonas percorridas; entra o valor mínimo (uma zona).',
    bilhetes:[
      {nome:'Bilhete simples, mínimo', preco:32, unidade:'viagem', quando:'chegada', modos:['eletrico']}
    ]},
  /* Não estava na tabela. Tramway de Rabat-Salé, explorado pela Transdev
     sob concessão da RRM; valor em vigor desde 1 de Julho de 2025,
     confirmado por quatro fontes de imprensa marroquina independentes.
     Verificado a 04/09/2026. */
  'Rabat': {operador:'Tramway de Rabat-Salé (Transdev / RRM)', url:'https://www.tram-way.ma/en/ticket-and-fines/', actualizado:'2026-09-04', fonte:'https://www.tram-way.ma/en/ticket-and-fines/',
    moeda:'MAD',
    bilhetes:[
      {nome:'Bilhete unitário', preco:7, unidade:'viagem', quando:'chegada', modos:['eletrico']}
    ]},
  /* Não estava na tabela. Serviço municipal de autocarros; a FAQ oficial
     (cartão N$8,50 / dinheiro N$9,50) parece desactualizada, já que o
     pagamento em dinheiro foi descontinuado em Agosto de 2025, e uma
     notícia mais recente cita N$9 fixo, sem forma clara de saber qual é
     o valor certo, por isso fica só o operador. Verificado a 04/09/2026. */
  'Windhoek': {operador:'City of Windhoek (Department of Urban and Transport Planning)', url:'https://www.windhoekcc.org.na/urban-and-transport-planning-faqs/', actualizado:'2026-09-04', fonte:'https://www.windhoekcc.org.na/urban-and-transport-planning-faqs/',
    moeda:'NAD', bilhetes:[]},
  /* Não estava na tabela. AUMTCO é a empresa pública de autocarros;
     também há o Abuja Light Rail, mas nenhum dos dois tem tarifário
     oficial confirmável (só blogues de viagem contraditórios), por isso
     fica só o operador. Verificado a 04/09/2026. */
  'Abuja': {operador:'AUMTCO (Abuja Urban Mass Transport Company) / Abuja Light Rail', url:'https://aumtco.abujainvestments.com/urban-public-transportation-services/', actualizado:'2026-09-04', fonte:'https://aumtco.abujainvestments.com/urban-public-transportation-services/',
    moeda:'NGN', bilhetes:[]},
  /* Não estava na tabela. Kigali Bus Services (KBS) e RFTC, regulados
     pela RURA, com tarifário oficial por distância/zona; faixa geral
     confirmada por duas fontes, sem acesso directo ao PDF oficial para
     valores exactos por rota. Verificado a 04/09/2026. */
  'Kigali': {operador:'Kigali Bus Services (KBS) / RFTC (regulados pela RURA)', url:'https://www.rura.rw/fileadmin/user_upload/RURA/Documents/Tariffs/City_of_Kigali_Public_Transport_tariff_April_2026.pdf', actualizado:'2026-09-04', fonte:'https://www.rura.rw/fileadmin/user_upload/RURA/Documents/Tariffs/City_of_Kigali_Public_Transport_tariff_April_2026.pdf',
    moeda:'RWF', nota:'O preço depende da distância/zona percorrida.',
    bilhetes:[
      {nome:'Bilhete simples, mínimo', preco:200, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Shuttle aeroporto (KBS-UTC)', preco:1000, unidade:'viagem', quando:'chegada', modos:['autocarro','aeroporto']}
    ]},
  /* Não estava na tabela. SPTC é a empresa estatal; fontes contraditórias
     sobre o valor exacto (Rs7/Rs10/Rs12), a última revisão datada é de
     2021, sem confirmação clara para 2025/2026, por isso fica só o
     operador. Verificado a 04/09/2026. */
  'Victoria': {operador:'SPTC (Seychelles Public Transport Corporation)', url:'https://sptc.sc/faq/', actualizado:'2026-09-04', fonte:'https://sptc.sc/faq/',
    moeda:'SCR', bilhetes:[]},
  /* Não estava na tabela. Waka Fine Bus (Metro Transport Company SL
     Ltd), projecto do governo com o Banco Mundial; tarifa confirmada por
     duas fontes jornalísticas independentes recentes. Verificado a
     04/09/2026. */
  'Freetown': {operador:'Waka Fine Bus (Metro Transport Company SL)', url:'https://thesierraleonetelegraph.com/', actualizado:'2026-09-04', fonte:'https://thesierraleonetelegraph.com/',
    moeda:'SLE',
    bilhetes:[
      {nome:'Bilhete simples', preco:12, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. DART/UDA-RT opera o BRT "Mwendokasi"; valor
     confirmado por duas notícias independentes, mas o serviço numa das
     rotas foi suspenso após protestos em Outubro de 2025, o que pode
     afectar a disponibilidade. Verificado a 04/09/2026. */
  'Dar es Salaam': {operador:'DART / UDA-RT (BRT "Mwendokasi")', url:'https://www.dart.go.tz/', actualizado:'2026-09-04', fonte:'https://www.dart.go.tz/',
    moeda:'TZS', nota:'O serviço numa das rotas foi suspenso após protestos em Outubro de 2025; a disponibilidade pode variar por rota.',
    bilhetes:[
      {nome:'Bilhete simples "Mwendokasi"', preco:750, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Terceira e última ronda de África. Não estava na tabela. SOTRAL é a
     empresa municipal de autocarros; redução tarifária em vigor desde 23
     de Dezembro de 2024 (na sequência da descida do preço do gasóleo),
     confirmada por duas fontes noticiosas independentes. Verificado a
     04/09/2026. */
  'Lomé': {operador:'SOTRAL (Société des Transports de Lomé)', url:'https://sotraltogo.com/transport_way', actualizado:'2026-09-04', fonte:'https://sotraltogo.com/transport_way',
    moeda:'XOF', nota:'O preço depende do percurso.',
    bilhetes:[
      {nome:'Percurso curto', preco:100, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Percurso mais longo', preco:300, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Transtu opera o metro ligeiro, o TGM e a rede
     de autocarros; valores confirmados por várias fontes, mas a última
     alteração tarifária localizada é de Junho de 2021, sem confirmação
     de revisão mais recente. Verificado a 04/09/2026. */
  'Tunes': {operador:'Transtu (Société des Transports de Tunis)', url:'https://www.transtu.tn/fr/tarifs', actualizado:'2026-09-04', fonte:'https://lapresse.tn/98672/transtu-ajustement-des-prix-des-tickets-du-bus-et-metro/',
    moeda:'TND', nota:'O preço depende do número de secções percorridas; a última alteração tarifária confirmada é de 2021, pode estar desactualizada.',
    bilhetes:[
      {nome:'Bilhete, 1ª a 3ª secção', preco:0.5, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Bilhete, 7ª a 10ª secção', preco:1.5, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Não estava na tabela. Rede de minibus privados, tarifas máximas
     reguladas pela RTSA (Road Transport and Safety Agency); a RTSA só
     divulga ajustes relativos ("redução de K1"), nunca a tarifa absoluta
     actual, e as fontes contradizem-se sobre o valor final, por isso
     fica só o operador. Verificado a 04/09/2026. */
  'Lusaka': {operador:'Minibus privados, tarifas máximas reguladas pela RTSA', url:'https://www.rtsa.org.zm/media-room/public-notices/', actualizado:'2026-09-04', fonte:'https://www.rtsa.org.zm/media-room/public-notices/',
    moeda:'ZMW', bilhetes:[]},
  /* Não estava na tabela. ZUPCO é a empresa estatal, mas a maioria das
     viagens reais faz-se em kombis privados que cobram mais e oscilam
     com o preço do combustível; entra a tarifa de referência da ZUPCO.
     Verificado a 04/09/2026. */
  'Harare': {operador:'ZUPCO (Zimbabwe United Passenger Company)', url:'http://www.zupco.co.zw/harare_urban.html', actualizado:'2026-09-04', fonte:'https://allafrica.com/stories/202501130598.html',
    moeda:'USD', nota:'Os kombis privados, que fazem a maioria das viagens reais, cobram mais do que a ZUPCO e sobem com frequência.',
    bilhetes:[
      {nome:'ZUPCO, tarifa de referência', preco:1, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. EMTPM é a empresa municipal de autocarros; os
     "chapas" (minibus privados) complementam a rede. Valor reafirmado
     pela EMTPM a partir de 1 de Junho de 2025, confirmado por várias
     fontes moçambicanas independentes. Verificado a 04/09/2026. */
  'Maputo': {operador:'EMTPM (Empresa Municipal de Transportes Públicos de Maputo) / chapas', url:'https://www.emtpm.co.mz/', actualizado:'2026-09-04', fonte:'https://www.emtpm.co.mz/',
    moeda:'MZN',
    bilhetes:[
      {nome:'Bilhete, curta distância', preco:15, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete, longa distância (mais de 10-20 km)', preco:18, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. TRANSCOR SV é a operadora municipal; valor
     fixado em Setembro de 2024 e reconfirmado inalterado numa notícia de
     Janeiro de 2026, cruzado entre o operador, o regulador ARME e a
     imprensa. Verificado a 04/09/2026. */
  'Mindelo': {operador:'TRANSCOR SV (Transportadora Coletiva de São Vicente)', url:'https://www.transcor.cv/noticia-atualizacao-de-tarifas', actualizado:'2026-09-04', fonte:'https://www.transcor.cv/noticia-atualizacao-de-tarifas',
    moeda:'CVE',
    bilhetes:[
      {nome:'Bilhete simples', preco:42, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Sol Atlântico é a operadora municipal; valor
     fixado em Setembro de 2024 e reconfirmado inalterado numa notícia de
     Janeiro de 2026, cruzado entre o operador, o regulador ARME e a
     imprensa. Verificado a 04/09/2026. */
  'Praia': {operador:'Sol Atlântico', url:'https://www.solatlantico.cv/', actualizado:'2026-09-04', fonte:'https://www.solatlantico.cv/',
    moeda:'CVE',
    bilhetes:[
      {nome:'Bilhete simples', preco:43, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Segunda ronda de transportes no Médio Oriente e Ásia Central (a
     primeira, no Lote 4a, foi só de cidades). Não estava na tabela.
     Reforma tarifária do sistema unificado em vigor desde 1/1/2025,
     confirmada por duas fontes independentes. Verificado a 04/09/2026. */
  'Yerevan': {operador:'Sistema unificado de transportes de Yerevan (metro/autocarro/trólei)', url:'https://transport.yerevan.am', actualizado:'2026-09-04', fonte:'https://arka.am/en/news/society/yerevan_s_unified_public_transport_ticketing_system_to_be_fully_operational_from_january_1_2025_vide/',
    moeda:'AMD',
    bilhetes:[
      {nome:'Bilhete simples (1 viagem)', preco:150, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Bilhete com transbordo (90-180 min, até 3 viagens)', preco:300, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Não estava na tabela. Metro de Baku (Bakı Metropoliteni), tarifa
     fixa desde 1/10/2025, confirmada com alta confiança (fonte oficial +
     agência de notícias). O BakuBus não tem tarifa fixa única (varia por
     rota), por isso não entra aqui. Verificado a 04/09/2026. */
  'Baku': {operador:'Baku Metro (Bakı Metropoliteni)', url:'https://metro.gov.az/en/page/muddealar/gedis-haqqinin-odenilmesi', actualizado:'2026-09-04', fonte:'https://en.apa.az/infrastructure/metro-fare-in-baku-set-at-060-azn-per-ride-as-expansion-and-fleet-renewal-continue-479111',
    moeda:'AZN',
    bilhetes:[
      {nome:'Bilhete simples', preco:0.60, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Bahrain Bus (BPTC), tarifa em vigor desde Maio
     de 2025, confirmada por três fontes independentes incluindo notícia
     local do aumento. Verificado a 04/09/2026. */
  'Manama': {operador:'Bahrain Public Transport Company (Bahrain Bus)', url:'https://www.bahrainbus.bh/faq-fares', actualizado:'2026-09-04', fonte:'https://www.bahrainbus.bh/faq-fares',
    moeda:'BHD', nota:'O bilhete com cartão GO Card é ligeiramente mais barato do que em dinheiro.',
    bilhetes:[
      {nome:'Bilhete simples, dinheiro', preco:0.300, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete simples, cartão GO Card', preco:0.275, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Tehran Metro, tarifas do ano persa 1404
     (2025-2026), confirmadas por três fontes noticiosas iranianas
     concordantes; fontes turísticas em inglês têm números antigos ou
     contraditórios, ignorados. Verificado a 04/09/2026. */
  'Teerão': {operador:'Tehran Metro', url:'https://metro.tehran.ir/en/Services/Tickets-Fares/Price-of-Tickets', actualizado:'2026-09-04', fonte:'https://metro.tehran.ir/en/Services/Tickets-Fares/Price-of-Tickets',
    moeda:'IRR', nota:'O preço é normalmente citado em tomans (1 toman = 10 rials); o bilhete em papel é mais caro do que com cartão bancário.',
    bilhetes:[
      {nome:'Bilhete em papel/dinheiro', preco:70000, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Mwasalat é a empresa nacional; não foi
     possível confirmar directamente na página oficial (bloqueio de
     rede), mas os valores são consistentes entre várias fontes
     secundárias de viagem. Confiança moderada. Verificado a 04/09/2026. */
  'Mascate': {operador:'Mwasalat', url:'https://mwasalat.om/en-us/Tariffs-and-Fares/Tariffs-and-Fares', actualizado:'2026-09-04', fonte:'https://mwasalat.om/en-us/Tariffs-and-Fares/Tariffs-and-Fares',
    moeda:'OMR', nota:'O preço depende do número de zonas percorridas.',
    bilhetes:[
      {nome:'Bilhete, 1 zona', preco:0.200, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete, 2 zonas', preco:0.300, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Riyadh Metro/Riyadh Bus, operados pelo
     consórcio RATP Dev/SAPTCO sob a RCRC; confirmado por três fontes
     independentes coincidentes. Verificado a 04/09/2026. */
  'Riade': {operador:'Riyadh Metro / Riyadh Bus (RCRC)', url:'https://riyadhmetro.org/en/tickets/', actualizado:'2026-09-04', fonte:'https://riyadhmetro.org/en/tickets/',
    moeda:'SAR',
    bilhetes:[
      {nome:'Classe regular, 2 horas', preco:4, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Primeira classe, 2 horas', preco:10, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Amman Bus e o BRT (Gürsel CMTC), sob a GAM,
     com transbordo grátis entre os dois; valor confirmado por três
     fontes independentes. Verificado a 04/09/2026. */
  'Amã': {operador:'Amman Bus / BRT (Greater Amman Municipality)', url:'http://www.ammanbrt.jo/?l=en', actualizado:'2026-09-04', fonte:'http://www.ammanbrt.jo/?l=en',
    moeda:'JOD',
    bilhetes:[
      {nome:'Bilhete simples, autocarro/BRT', preco:0.550, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Autocarros urbanos sob contrato da Akimat
     (câmara) de Astana, bilhética via app/plataforma Avtobys; entra só a
     tarifa de autocarro (confirmada por duas fontes), não a do LRT novo
     (Maio de 2026), cujo preço aparece contraditório entre fontes por
     ser um sistema muito recente. Verificado a 04/09/2026. */
  'Astana': {operador:'Autocarros urbanos (Akimat de Astana, plataforma Avtobys)', url:'https://avtobys.kz/', actualizado:'2026-09-04', fonte:'https://avtobys.kz/',
    moeda:'KZT',
    bilhetes:[
      {nome:'Bilhete normal (cartão/app)', preco:110, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Coexistem três empresas com rotas sobrepostas
     (KPTC, CityBus, KGL Mowasalat), com valores consistentes entre elas;
     confirmado por quatro fontes secundárias independentes, sem acesso
     directo aos sites oficiais (bloqueio de rede). Verificado a
     04/09/2026. */
  'Cidade do Kuwait': {operador:'KPTC / CityBus / KGL Mowasalat', url:'https://citygroupco.com/faq-english/', actualizado:'2026-09-04', fonte:'https://citygroupco.com/faq-english/',
    moeda:'KWD', nota:'Só se paga em dinheiro; o preço depende da distância.',
    bilhetes:[
      {nome:'Bilhete curto', preco:0.250, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete normal', preco:0.300, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Operador municipal de Bisqueque; pagamento em
     dinheiro nos autocarros municipais foi entretanto abolido, por isso
     entra a tarifa sem dinheiro; confirmado por três fontes
     independentes, incluindo a câmara municipal. Verificado a
     04/09/2026. */
  'Bisqueque': {operador:'Câmara Municipal de Bisqueque (autocarros/trólei/e-bus)', url:'https://www.bishkek.gov.kg/ru/tariffs/1', actualizado:'2026-09-04', fonte:'https://www.bishkek.gov.kg/ru/tariffs/1',
    moeda:'KGS', nota:'A tarifa em dinheiro (marshrutka/miniautocarro) é diferente da tarifa sem dinheiro dos autocarros municipais.',
    bilhetes:[
      {nome:'Autocarro/trólei/e-bus, sem dinheiro', preco:17, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  /* Não estava na tabela. OCFTC/ACTC relançaram o sistema de autocarros
     em 20 de Dezembro de 2024, depois da hiperinflação da lira libanesa;
     valor confirmado por três fontes independentes pós-relançamento, sem
     página oficial com tarifário ao vivo. Verificado a 04/09/2026. */
  'Beirute': {operador:'OCFTC / ACTC (autocarros públicos)', url:'https://www.beirut.com/en/749112/heres-exactly-how-to-use-the-public-buses-in-lebanon-cost-and-schedules/', actualizado:'2026-09-04', fonte:'https://www.beirut.com/en/749112/heres-exactly-how-to-use-the-public-buses-in-lebanon-cost-and-schedules/',
    moeda:'LBP',
    bilhetes:[
      {nome:'Bilhete simples (linhas B, dentro de Beirute)', preco:70000, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Reforma tarifária do sistema ATTO (metro +
     autocarros) em vigor desde 1/1/2025, confirmada por quatro fontes
     independentes, incluindo dois sites oficiais. Alta confiança.
     Verificado a 04/09/2026. */
  'Tasquente': {operador:'ATTO (Metro de Tashkent + autocarros)', url:'https://atto.uz/uz/tariff', actualizado:'2026-09-04', fonte:'https://atto.uz/uz/tariff',
    moeda:'UZS', nota:'A tarifa electrónica (cartão ATTO/NFC) é mais barata do que em dinheiro.',
    bilhetes:[
      {nome:'Bilhete em dinheiro/token QR', preco:3000, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']},
      {nome:'Bilhete com cartão ATTO/NFC', preco:1700, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Não estava na tabela. Entidade municipal de Dushanbe, sistema "City
     Card"; a tarifa em dinheiro está estável e citada de forma
     consistente desde 2021 até fontes de 2025/2026, a tarifa com cartão
     é contraditória entre fontes e não entra. Verificado a 04/09/2026. */
  'Dushanbe': {operador:'Entidade municipal de transportes de Dushanbe', url:'https://www.dushanbe.tj/ru/transport', actualizado:'2026-09-04', fonte:'https://www.dushanbe.tj/ru/transport',
    moeda:'TJS',
    bilhetes:[
      {nome:'Autocarro, dinheiro', preco:2.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Trólei, dinheiro', preco:2.00, unidade:'viagem', quando:'chegada', modos:['eletrico']}
    ]},
  /* Não estava na tabela. Dan (autocarros) e Metro Vermelho (light
     rail), bilhética comum Rav-Kav; duas reformas tarifárias em 2025
     (Abril e "Derekh Shava" em Agosto) geraram valores contraditórios,
     sem confirmação segura do valor único actual, por isso fica só o
     operador. Verificado a 04/09/2026. */
  'Telavive': {operador:'Dan / Metro Vermelho (Rav-Kav)', url:'https://pti.org.il/derekh-shava/eng/', actualizado:'2026-09-04', fonte:'https://pti.org.il/derekh-shava/eng/',
    moeda:'ILS', bilhetes:[]},
  /* Não estava na tabela. Ashgabat Passenger Motor Transport Enterprise,
     sob a agência estatal Türkmenawtoulaglary; o único valor encontrado
     é de 2017, só em fontes secundárias/turísticas, sem confirmação
     oficial nem actual, por isso fica só o operador. Verificado a
     04/09/2026. */
  'Asgabate': {operador:'Ashgabat Passenger Motor Transport Enterprise (Türkmenawtoulaglary)', url:'https://ayauk.gov.tm/', actualizado:'2026-09-04', fonte:'https://ayauk.gov.tm/',
    moeda:'TMT', bilhetes:[]},
  /* Segunda ronda de transportes na Ásia (a primeira, no Lote 4b, foi só
     de cidades). Não estava na tabela. DMTCL opera o Metro (MRT Line 6);
     os autocarros urbanos não têm operador único identificável.
     Confirmado por três fontes independentes. Verificado a 04/09/2026. */
  'Daca': {operador:'DMTCL (Dhaka Mass Transit Company), Metro MRT Line 6', url:'https://dmtcl.gov.bd/site/page/d8573d11-7f71-4834-b72e-96e060fb3a0b/Fare-Chart--Fare-Collection-Guidelines', actualizado:'2026-09-04', fonte:'https://bdnews24.com/bangladesh/nzlp4ngm6o',
    moeda:'BDT', nota:'O preço depende do número de estações percorridas.',
    bilhetes:[
      {nome:'Metro, mínimo', preco:20, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metro, máximo (Uttara Norte-Motijheel)', preco:100, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. O "Franchise Bus" é regulado pelo Land
     Transport Department (JPD); tarifa fixa confirmada em várias fontes
     de 2025, mas nenhuma é o site oficial (bloqueado ao acesso).
     Verificado a 04/09/2026. */
  'Bandar Seri Begawan': {operador:'Franchise Bus (Land Transport Department, JPD)', url:'https://www.jpd.gov.bn/SitePages/PUBLIC%20BUS%20ROUTE.aspx', actualizado:'2026-09-04', fonte:'https://www.jpd.gov.bn/SitePages/PUBLIC%20BUS%20ROUTE.aspx',
    moeda:'BND', nota:'Tarifa fixa, independente da distância.',
    bilhetes:[
      {nome:'Bilhete simples', preco:1.00, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Phnom Penh City Bus é a autoridade municipal;
     tarifa fixa confirmada por quatro fontes independentes. Verificado a
     04/09/2026. */
  'Phnom Penh': {operador:'Phnom Penh City Bus', url:'https://www.facebook.com/phnompenhcitybus.gov.kh/', actualizado:'2026-09-04', fonte:'https://en.wikipedia.org/wiki/Phnom_Penh_City_Bus',
    moeda:'KHR', nota:'Tarifa fixa, independente da distância.',
    bilhetes:[
      {nome:'Bilhete simples', preco:1500, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. As tarifas são reguladas pelo Governo da
     Província de Bagmati (não por um operador único), aplicadas a todos
     os veículos públicos do vale, incluindo a cooperativa semipública
     Sajha Yatayat; valor em vigor desde 12/04/2026, confirmado por duas
     fontes noticiosas independentes. Verificado a 04/09/2026. */
  'Catmandu': {operador:'Regulação provincial de Bagmati / Sajha Yatayat', url:'https://sajhayatayat.com.np/', actualizado:'2026-09-04', fonte:'https://kathmandupost.com/province-no-3/2026/04/12/bagmati-revises-public-transport-fares-after-fuel-price-hike',
    moeda:'NPR', nota:'O preço depende da distância percorrida.',
    bilhetes:[
      {nome:'Até 5 km', preco:24, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Mais de 20 km', preco:50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. LRT-1 (privado), LRT-2 e MRT-3 (públicos, sob
     a DOTr/LRTA); valores confirmados por várias fontes independentes e
     oficiais. Nota: o desconto de 50% em MRT-3/LRT-2 é "até novo aviso",
     não permanente. Verificado a 04/09/2026. */
  'Manila': {operador:'LRT-1 / LRT-2 / MRT-3', url:'https://lrta.gov.ph/tickets-and-fares', actualizado:'2026-09-04', fonte:'https://lrta.gov.ph/tickets-and-fares',
    moeda:'PHP', nota:'O preço depende da distância; o desconto de 50% em MRT-3/LRT-2 é uma medida temporária "até novo aviso", não se aplica ao LRT-1.',
    bilhetes:[
      {nome:'LRT-1, mínimo', preco:20, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'LRT-1, máximo', preco:55, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. As tarifas de todos os autocarros (SLTB e
     privados) são fixadas pela NTC; valor de autocarro muito recente e
     sólido (gazette oficial + duas notícias). A tarifa mínima de comboio
     consta na tabela oficial mas parece inalterada desde Julho de 2022,
     sem confirmação de revisão mais recente. Verificado a 04/09/2026. */
  'Colombo': {operador:'SLTB / operadores privados (tarifas fixadas pela NTC) / Sri Lanka Railways', url:'https://www.ntc.gov.lk/Bus_info/bus_fare.php', actualizado:'2026-09-04', fonte:'https://www.ntc.gov.lk/Bus_info/bus_fare.php',
    moeda:'LKR', nota:'A tarifa de comboio (3ª classe) consta na tabela oficial mas não parece ter mudado desde 2022, ao contrário da de autocarro, muito mais recente.',
    bilhetes:[
      {nome:'Autocarro, 1º estágio (mínimo)', preco:34, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Comboio, 3ª classe, mínimo', preco:20, unidade:'viagem', quando:'chegada', modos:['comboio']}
    ]},
  /* Não estava na tabela. Sistema fragmentado (CDA: Orange/Blue/Green;
     PMA: Red Line); fontes contraditórias no tempo (aumento para Rs 100
     em Junho de 2025 revertido dias depois para Rs 50; guias mais
     recentes ainda indicam Rs 30/Rs 40 noutras linhas), sem valor único
     confirmado actualmente, por isso fica só o operador. Verificado a
     04/09/2026. */
  'Islamabad': {operador:'CDA (Orange/Blue/Green) / PMA (Red Line)', url:'https://pma.punjab.gov.pk/', actualizado:'2026-09-04', fonte:'https://pma.punjab.gov.pk/',
    moeda:'PKR', bilhetes:[]},
  /* Não estava na tabela. Vientiane Capital State Bus Enterprise; fontes
     contradizem-se sobre o preço por rota específica, e uma tarifa
     promocional temporária já expirou, sem valor actual confirmado, por
     isso fica só o operador. Verificado a 04/09/2026. */
  'Vienciana': {operador:'Vientiane Capital State Bus Enterprise', url:'http://vientianebus.org.la/', actualizado:'2026-09-04', fonte:'http://vientianebus.org.la/',
    moeda:'LAK', bilhetes:[]},
  /* Não estava na tabela. MTCC opera o serviço urbano "Raajje Transport
     Link" (RTL); o único valor encontrado (7 MVR) data do lançamento em
     2022, sem confirmação de que se mantém em 2025/2026 apesar de
     pesquisa dedicada, por isso fica só o operador. Verificado a
     04/09/2026. */
  'Malé': {operador:'MTCC (Raajje Transport Link)', url:'https://mtcc.mv/transport-services/', actualizado:'2026-09-04', fonte:'https://mtcc.mv/transport-services/',
    moeda:'MVR', bilhetes:[]},
  /* Não estava na tabela. Rede de cerca de 21 empresas privadas de
     autocarros, sem operador único; fontes contradizem-se directamente
     sobre que valor corresponde a autocarro vs. trólei, sem tarifário
     oficial primário publicado, por isso fica só a referência ao
     departamento municipal. Verificado a 04/09/2026. */
  'Ulã Bator': {operador:'Departamento de Política de Transporte Público da cidade (rede de autocarros privados)', url:'https://en.ulaanbaatar-airport.mn/public-transportation-service', actualizado:'2026-09-04', fonte:'https://en.ulaanbaatar-airport.mn/public-transportation-service',
    moeda:'MNT', bilhetes:[]},
  /* Não estava na tabela. Yangon Bus Service (YBS), regulado pelo YRTC;
     um aumento de tarifa anunciado a 14/08/2026 terá sido retirado dois
     dias depois, sem confirmação de qual valor está mesmo em vigor, por
     isso fica só o operador. Verificado a 04/09/2026. */
  'Rangum': {operador:'Yangon Bus Service (YBS, regulado pelo YRTC)', url:'https://www.facebook.com/yrtc.yangon.myanmar/', actualizado:'2026-09-04', fonte:'https://www.facebook.com/yrtc.yangon.myanmar/',
    moeda:'MMK', bilhetes:[]},
  /* Transportes locais para as 7 capitais do Lote 6 (países já cobertos
     por outra cidade). Não estava na tabela. Bernmobil, rede tarifária
     Libero; o bilhete de zona mais larga apareceu com números
     contraditórios entre fontes (confusão com o passe diário), por isso
     só entra a tarifa de curta distância, bem confirmada. Sobe para
     3,00 CHF a partir de 13/12/2026. Verificado a 04/09/2026. */
  'Berna': {operador:'Bernmobil (rede tarifária Libero)', url:'https://www.bernmobil.ch/de/abos-tickets/libero-tarifverbund', actualizado:'2026-09-04', fonte:'https://www.bernerzeitung.ch/libero-kosten-in-bern-steigen-linke-will-gegensteuern-982465352380',
    moeda:'CHF', nota:'Sobe para 3,00 CHF a partir de 13 de Dezembro de 2026.',
    bilhetes:[
      {nome:'Kurzstrecke (curta distância, até 1,5 km)', preco:2.60, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  /* Não estava na tabela. EGO opera metro, Ankaray, Başkentray e
     autocarros; subida em vigor desde 23/08/2026, confirmada por três
     fontes noticiosas independentes. Verificado a 04/09/2026. */
  'Ancara': {operador:'EGO (Ankara Elektrik, Gaz ve Otobüs İşletmeleri)', url:'https://www.ego.gov.tr/tr/sayfa/2098/tasima-ucretleri', actualizado:'2026-09-04', fonte:'https://www.cnnturk.com/ekonomi/ankara-otobus-ucretleri-ve-toplu-tasima-tarifesi-2026-ego-tam-ogrenci-ve-ogretmen-bileti-kac-tl-basiyor-3454688',
    moeda:'TRY',
    bilhetes:[
      {nome:'Bilhete simples ("tam bilet")', preco:40, unidade:'viagem', quando:'chegada', modos:['metro','autocarro']}
    ]},
  /* Não estava na tabela. Abu Dhabi Mobility (ex-ITC) opera os
     autocarros públicos, pagos com o cartão Hafilat; estrutura tarifária
     unificada desde Fevereiro de 2024, confirmada por fonte oficial e
     vários órgãos de imprensa. Verificado a 04/09/2026. */
  'Abu Dhabi': {operador:'Abu Dhabi Mobility (autocarros públicos, cartão Hafilat)', url:'https://admobility.gov.ae/en/pb-bus-service/hafilat-passes-for-hc', actualizado:'2026-09-04', fonte:'https://www.admobility.gov.ae/en/news/standardizes-tariffs-for-public-bus-services',
    moeda:'AED', nota:'Tarifa base mais 0,05 AED por km, com tecto de 5 AED por viagem.',
    bilhetes:[
      {nome:'Viagem, tarifa mínima', preco:2, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Viagem, tecto máximo', preco:5, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. OC Transpo opera autocarros e o O-Train
     (Confederation Line); tarifas em vigor desde 1/1/2026, confirmadas
     por três fontes independentes. Verificado a 04/09/2026. */
  'Ottawa': {operador:'OC Transpo (autocarro + O-Train)', url:'https://www.octranspo.com/en/fares/', actualizado:'2026-09-04', fonte:'https://www.octranspo.com/en/news/article/fare-change-takes-effect-january-1-2026',
    moeda:'CAD', nota:'O bilhete pago com cartão Presto é ligeiramente mais barato do que em dinheiro.',
    bilhetes:[
      {nome:'Bilhete simples, adulto (Presto)', preco:4.10, unidade:'viagem', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Bilhete simples, adulto (dinheiro)', preco:4.15, unidade:'viagem', quando:'chegada', modos:['autocarro','metro']}
    ]},
  /* Não estava na tabela. Três sistemas distintos: MRT Jakarta,
     TransJakarta (BRT) e KRL Commuterline; tarifas confirmadas por
     várias fontes noticiosas indonésias. Uma subida do TransJakarta para
     Rp 5.000 estava em discussão mas não confirmada como aprovada, não
     entra. Verificado a 04/09/2026. */
  'Jacarta': {operador:'MRT Jakarta / TransJakarta / KRL Commuterline', url:'https://transjakarta.co.id/tarif', actualizado:'2026-09-04', fonte:'https://transjakarta.co.id/tarif',
    moeda:'IDR', nota:'TransJakarta tem tarifa mais baixa na hora de ponta (05h-07h) do que no resto do dia.',
    bilhetes:[
      {nome:'TransJakarta, hora de ponta', preco:2000, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'TransJakarta, restante horário', preco:3500, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'KRL Commuterline, até 25 km', preco:3000, unidade:'viagem', quando:'chegada', modos:['comboio']}
    ]},
  /* Não estava na tabela. Transport Canberra opera autocarro e light
     rail com bilhética unificada MyWay+; tarifas em vigor desde
     10/1/2026, confirmadas por duas fontes jornalísticas independentes.
     Verificado a 04/09/2026. */
  'Camberra': {operador:'Transport Canberra (MyWay+)', url:'https://www.transport.act.gov.au/tickets-and-myway/fares', actualizado:'2026-09-04', fonte:'https://www.transport.act.gov.au/tickets-and-myway/fares',
    moeda:'AUD', nota:'A tarifa na hora de ponta é mais cara do que fora dela.',
    bilhetes:[
      {nome:'Adulto, fora de ponta', preco:2.70, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']},
      {nome:'Adulto, hora de ponta', preco:3.41, unidade:'viagem', quando:'chegada', modos:['autocarro','eletrico']}
    ]},
  /* Não estava na tabela. Metlink (Greater Wellington Regional Council)
     opera autocarro, comboio e ferry; tarifas em vigor desde 15/5/2026,
     confirmadas pelo site oficial e por duas fontes jornalísticas
     independentes. Verificado a 04/09/2026. */
  'Wellington': {operador:'Metlink (Greater Wellington Regional Council)', url:'https://www.metlink.org.nz/getting-started/tickets-and-fares', actualizado:'2026-09-04', fonte:'https://www.metlink.org.nz/getting-started/tickets-and-fares',
    moeda:'NZD', nota:'O bilhete com cartão Snapper é mais barato do que em dinheiro; a tarifa em dinheiro é sempre 1 zona.',
    bilhetes:[
      {nome:'Adulto, 1 zona, Snapper, fora de ponta', preco:1.70, unidade:'viagem', quando:'chegada', modos:['autocarro','comboio']},
      {nome:'Adulto, 1 zona, dinheiro', preco:3.00, unidade:'viagem', quando:'chegada', modos:['autocarro','comboio']}
    ]},
  /* Grandes cidades asiáticas ainda por fazer. Não estava na tabela.
     Beijing Subway, tarifa por distância; confirmado pelo portal do
     governo municipal e pelo operador oficial, coincidentes. Verificado
     a 04/09/2026. */
  'Pequim': {operador:'Beijing Subway', url:'https://www.bjsubway.com/en/', actualizado:'2026-09-04', fonte:'https://english.beijing.gov.cn/specials/beijinglifeonthesubway/noticeforpassengers/202504/t20250423_4072294.html',
    moeda:'CNY', nota:'O preço depende da distância percorrida.',
    bilhetes:[
      {nome:'Metro, até 6 km', preco:3, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metro, 12 a 22 km', preco:5, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Shanghai Metro (Shanghai Shentong Metro
     Group), tarifa por distância; confirmado por duas fontes
     coincidentes. Verificado a 04/09/2026. */
  'Xangai': {operador:'Shanghai Metro (Shanghai Shentong Metro Group)', url:'https://www.shmetro.com/', actualizado:'2026-09-04', fonte:'http://service.shmetro.com/en/cczn/73.htm',
    moeda:'CNY', nota:'O preço depende da distância percorrida.',
    bilhetes:[
      {nome:'Metro, até 6 km', preco:3, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Metro, 6 a 16 km', preco:4, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Seoul Metro e a rede de autocarros, ambos
     bilhética T-money; valores em vigor desde Junho de 2025 (metro) e
     Agosto de 2023 (autocarro), confirmados por quatro fontes
     noticiosas coreanas independentes. Verificado a 04/09/2026. */
  'Seul': {operador:'Seoul Metro / autocarros urbanos (cartão T-money)', url:'http://www.seoulmetro.co.kr/en/page.do?menuIdx=348', actualizado:'2026-09-04', fonte:'http://www.seoulmetro.co.kr/en/page.do?menuIdx=348',
    moeda:'KRW', nota:'O bilhete pago com cartão T-money é mais barato do que em papel.',
    bilhetes:[
      {nome:'Metro, até 10 km, cartão T-money', preco:1550, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Autocarro tronco/ramal, cartão T-money', preco:1500, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. BEST opera os autocarros (tarifa revista em
     Maio de 2025), o Metro tem várias linhas/operadores; ambos com boa
     confirmação cruzada. A tarifa do comboio suburbano "local" não
     entrou por não ter confirmação actual e fiável. Verificado a
     04/09/2026. */
  'Bombaim': {operador:'BEST (autocarros) / Mumbai Metro', url:'https://www.bestundertaking.com/', actualizado:'2026-09-04', fonte:'https://www.bestundertaking.com/',
    moeda:'INR',
    bilhetes:[
      {nome:'Autocarro BEST, não-AC, até 5 km', preco:10, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Metro, bilhete simples mínimo', preco:10, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Phuket Smart Bus é o único serviço formal com
     tarifário público (os songthaews privados não têm tarifário
     fiável); valores confirmados por quatro fontes independentes,
     incluindo o site oficial. Verificado a 04/09/2026. */
  'Phuket': {operador:'Phuket Smart Bus', url:'https://phuketsmartbus.com/', actualizado:'2026-09-04', fonte:'https://phuketsmartbus.com/',
    moeda:'THB', nota:'Tarifa fixa por rota, independente da paragem de saída.',
    bilhetes:[
      {nome:'Rota 2 (Terminal 1-Kathu-Patong)', preco:50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Rota 1 (Aeroporto-Patong-Karon-Kata-Rawai)', preco:100, unidade:'viagem', quando:'chegada', modos:['autocarro','aeroporto']}
    ]},
  /* Não estava na tabela. Trans Metro Dewata (BRT) é do Governo da
     Província de Bali; valores mais antigos e contraditórios (2023,
     início de 2025) foram descartados a favor de fontes datadas de
     2026, que convergem. Verificado a 04/09/2026. */
  'Bali': {operador:'Trans Metro Dewata (Governo da Província de Bali)', url:'https://bali.trans.my.id/', actualizado:'2026-09-04', fonte:'https://bali.antaranews.com/berita/411567',
    moeda:'IDR',
    bilhetes:[
      {nome:'Bilhete geral', preco:4400, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Ronda de transportes na Oceânia. Não estava na tabela. Minibus
     privados regulados por ordenança do Honiara City Council (HCC);
     valor gazetado confirmado por duas fontes independentes de Abril de
     2026, apesar de alguns operadores cobrarem mais (SBD 5) do que o
     tarifário legal. Verificado a 04/09/2026. */
  'Honiara': {operador:'Minibus privados (regulados pelo Honiara City Council)', url:'https://www.sibconline.com.sb/hcc-says-no-bus-fare-increase-approved-despite-rising-fuel-prices/', actualizado:'2026-09-04', fonte:'https://www.sibconline.com.sb/hcc-says-no-bus-fare-increase-approved-despite-rising-fuel-prices/',
    moeda:'SBD', nota:'Alguns operadores cobram mais (5 SBD) do que o tarifário legal, segundo o próprio Honiara City Council.',
    bilhetes:[
      {nome:'Bilhete adulto', preco:3, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Minibus privados licenciados (matrícula "B"),
     tarifas por zona; subida confirmada por duas fontes noticiosas
     independentes (Janeiro de 2025), mas o site oficial de turismo ainda
     mostra o valor antigo, desactualizado. Verificado a 04/09/2026. */
  'Port Vila': {operador:'Minibus privados licenciados (matrícula "B")', url:'https://www.vanuatu.travel/en/plan/planning-tools/guides/how-to-catch-the-bus-in-vanuatu', actualizado:'2026-09-04', fonte:'https://dailypost.vu/',
    moeda:'VUV', nota:'O site oficial de turismo ainda mostra o valor antigo (150 VT); o valor aqui é o mais recente, confirmado por duas notícias independentes.',
    bilhetes:[
      {nome:'Bilhete adulto, zona urbana', preco:200, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Palau Eco-Friendly Public Transport (HRCTD,
     com apoio da JICA); fontes de 2025 e 2026 dão valores diferentes
     (1 USD vs 2 USD por viagem), sem consenso claro sobre o valor
     vigente, por isso fica só o operador. Verificado a 04/09/2026. */
  'Koror': {operador:'Palau Eco-Friendly Public Transport (HRCTD)', url:'https://www.palaugov.pw/executive-branch/ministries/hrctd/', actualizado:'2026-09-04', fonte:'https://www.palaugov.pw/executive-branch/ministries/hrctd/',
    moeda:'USD', bilhetes:[]},
  /* Não estava na tabela. Operadores privados licenciados regulados pela
     FCCC; o único valor confirmado é de Agosto de 2023, com indícios não
     verificáveis de subsídios e aumentos desde então, sem confirmação do
     valor actual, por isso fica só o operador. Verificado a 04/09/2026. */
  'Nadi': {operador:'Operadores privados de autocarro (regulados pela FCCC)', url:'https://fccc.gov.fj/transport/', actualizado:'2026-09-04', fonte:'https://fccc.gov.fj/transport/',
    moeda:'FJD', bilhetes:[]},
  /* Não estava na tabela. Rede de PMV (Public Motor Vehicles), regulada
     pela ICCC; fontes fortemente contraditórias sobre o valor actual (a
     ICCC tem uma revisão faseada 2026-2030 em curso), sem confirmação
     fiável, por isso fica só o operador. Verificado a 04/09/2026. */
  'Port Moresby': {operador:'PMV (Public Motor Vehicles), regulados pela ICCC', url:'https://iccc.gov.pg/pmv-taxi-fares/', actualizado:'2026-09-04', fonte:'https://iccc.gov.pg/pmv-taxi-fares/',
    moeda:'PGK', bilhetes:[]},
  /* Não estava na tabela. Rede de autocarros privados, regulada pela
     Land Transport Authority (LTA) de Samoa; fontes muito díspares entre
     si sobre o valor de um trajecto urbano simples, sem confirmação
     fiável, por isso fica só o operador. Verificado a 04/09/2026. */
  'Apia': {operador:'Autocarros privados (regulados pela Land Transport Authority)', url:'https://lta.gov.ws/fees/', actualizado:'2026-09-04', fonte:'https://lta.gov.ws/fees/',
    moeda:'WST', bilhetes:[]},
  /* Últimas cidades novas desta fase (EUA e resto das Caraíbas). Não
     estava na tabela. CTA (autocarro e "L"); aumento de 25 cêntimos em
     vigor desde 1/2/2026, o primeiro desde 2018, confirmado por três
     fontes noticiosas independentes. Verificado a 04/09/2026. */
  'Chicago': {operador:'CTA (Chicago Transit Authority)', url:'https://www.transitchicago.com/fares/', actualizado:'2026-09-04', fonte:'https://blockclubchicago.org/2025/10/14/cta-to-raise-fares-25-cents-per-ride-as-fiscal-cliff-looms/',
    moeda:'USD',
    bilhetes:[
      {nome:'Autocarro, bilhete simples', preco:2.50, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'"L" (metro/comboio urbano), bilhete simples', preco:2.75, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. WMATA (Metro/Metrobus); o orçamento do ano
     fiscal de 2026 confirma que não há aumento de tarifas. Verificado a
     04/09/2026. */
  'Washington D.C.': {operador:'WMATA (Metro/Metrobus)', url:'https://www.wmata.com/fares/basic.cfm', actualizado:'2026-09-04', fonte:'https://www.wmata.com/fares/basic.cfm',
    moeda:'USD', nota:'A tarifa do Metrorail depende da distância percorrida e da hora do dia.',
    bilhetes:[
      {nome:'Metrobus, tarifa única', preco:2.25, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Metrorail, mínimo', preco:2.25, unidade:'viagem', quando:'chegada', modos:['metro']}
    ]},
  /* Não estava na tabela. Minibus privados ("H buses"), regulados pela
     Traffic Safety and Public Service Drivers Board; reforma tarifária
     de Novembro de 2024 confirmada pelo governo, mas a tabela integral
     pós-reforma não foi encontrada, valores parciais e algo
     contraditórios entre operadores/imprensa, por isso fica só o
     operador. Verificado a 04/09/2026. */
  'Basseterre': {operador:'Minibus privados ("H buses"), regulados pela Traffic Safety and Public Service Drivers Board', url:'https://trafficboard.gov.kn/', actualizado:'2026-09-04', fonte:'https://trafficboard.gov.kn/',
    moeda:'XCD', bilhetes:[]},
  /* Não estava na tabela. St. Lucia Minibus Association (minibus
     privados); fontes contradizem-se sobre o valor exacto da rota mais
     comum, sem confirmação de quando o tarifário foi actualizado, por
     isso fica só o operador. Verificado a 04/09/2026. */
  'Castries': {operador:'St. Lucia Minibus Association (minibus privados)', url:'https://sites.google.com/micoud.edu.lc/st-lucia-minibus-association/fare-for-various-routes', actualizado:'2026-09-04', fonte:'https://sites.google.com/micoud.edu.lc/st-lucia-minibus-association/fare-for-various-routes',
    moeda:'XCD', bilhetes:[]},
  /* Não estava na tabela. Minibus privados, tarifas aprovadas pelo
     Cabinet via Ministry of Transport; o único valor encontrado é de
     Setembro de 2022, sem confirmação de revisão mais recente, por isso
     fica só o operador. Verificado a 04/09/2026. */
  'Kingstown': {operador:'Minibus privados (tarifas aprovadas pelo Ministry of Transport)', url:'https://transport.gov.vc/transport/index.php?option=com_content&view=article&id=198:approval-for-bus-and-taxi-fares-in-svg', actualizado:'2026-09-04', fonte:'https://transport.gov.vc/transport/index.php?option=com_content&view=article&id=198:approval-for-bus-and-taxi-fares-in-svg',
    moeda:'XCD', bilhetes:[]},
  /* Não estava na tabela. PTSC (autocarros estatais) e maxi-taxis
     privados por rota; a faixa de preços encontrada é genérica/
     intercidades, sem valor único urbano confirmado para a cidade, por
     isso fica só o operador. Verificado a 04/09/2026. */
  'Porto de Espanha': {operador:'PTSC (Public Transport Service Corporation) / maxi-taxis', url:'https://ptsc.co.tt/routes-and-schedules/', actualizado:'2026-09-04', fonte:'https://ptsc.co.tt/routes-and-schedules/',
    moeda:'TTD', bilhetes:[]},
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
