/* ═══════════════════════════════════════════════════════════════
   TripNexus: transportes locais no destino
   ═══════════════════════════════════════════════════════════════ */

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
  /* O site novo da ANM («anm.it/s/…») e o do consórcio regional
     UnicoCampania são portais Salesforce/Angular que montam tudo em
     JavaScript, sem preços na página estática. Reconferido a 04/09/2026:
     achado o domínio legado mas ainda oficial e activo `www2.anm.it`, cuja
     página de bilhetes embute a tabela tarifária como imagem
     (tabella_tariffe_05_24.jpg, lida visualmente). Os preços «Aziendale
     ANM» valem só na rede urbana da ANM; «Integrato» é o título
     UnicoCampania, que também serve a Metropolitana Linha 1. */
  'Nápoles': {operador:'ANM', url:'https://www2.anm.it/index.php?Itemid=320&id=1344&option=com_content&task=view', actualizado:'2026-09-04', fonte:'https://www2.anm.it/images/stories/tabella_tariffe_05_24.jpg', moeda:'EUR',
    nota:'Corsa singola A cobre funiculares e autocarros urbanos (título só ANM). A Metropolitana Linhas 1 e 6 exige o título integrado UnicoCampania.',
    bilhetes:[
      {nome:'Corsa singola A (funiculares, autocarros urbanos)', preco:1.30, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Corsa singola B, integrado (Metropolitana 1 e 6, autocarros suburbanos)', preco:1.80, unidade:'90 minutos', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Giornaliero, integrado', preco:5.40, unidade:'dia', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Mensile, integrado', preco:42.00, unidade:'mês', quando:'antes', modos:['autocarro','metro']}
    ]},
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
  /* O PDF de tarifário (Tarifas_VAMUS_01-01-2023_v3.pdf) tem uma tabela
     por zonas quilométricas para toda a rede do Algarve, mas nenhuma
     zona corresponde claramente a «Faro cidade»: a tabela por distância
     começa em «3 e 4 km», sem uma linha «até 2 km» própria, e a extracção
     de texto embaralha as colunas dessa secção. Sem uma forma fiável de
     saber que preço é o do bilhete avulso na cidade, prefere-se não
     adivinhar.
     Confirmou-se, isso sim, o «Passe Algarve», por comunicado oficial da
     AMAL (autoridade de transportes do Algarve) de 21/08/2025, citação
     directa: «"Passe Algarve" tem um preço de 40€ e é válido para todas
     as carreiras de todas as linhas da rede VAMUS, à exceção do Serviço
     AeroBus». */
  'Faro': {operador:'Vamus Algarve', url:'https://vamus.pt/tarifario/', actualizado:'2026-09-04', fonte:'https://amal.pt/comunicacao/1110-passe-algarve-na-rede-vamus-avanca-ja-em-setembro', moeda:'EUR',
    nota:'Só se confirmou o passe mensal para toda a rede regional (excepto o AeroBus do aeroporto); o bilhete avulso na cidade não está confirmado, por a tabela de zonas do operador não distinguir claramente qual é a de Faro.',
    bilhetes:[
      {nome:'Passe Algarve (toda a rede Vamus, excepto AeroBus)', preco:40.00, unidade:'mês', quando:'antes', modos:['autocarro']}
    ]},
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
     site. Reconferido a 04/09/2026: a página continua com o mesmo
     carimbo, sem PDF nem versão mais recente encontrada. Fica só o
     operador, à espera de alguém confirmar o actual. */
  'Portalegre': {operador:'SMAT (Serviços Municipalizados de Águas e Transportes de Portalegre)', url:'https://www.cm-portalegre.pt/municipes/servicos-municipalizados/transportes/tarifarios/', actualizado:'2026-09-04', fonte:'https://www.cm-portalegre.pt/municipes/servicos-municipalizados/transportes/tarifarios/',
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
     valor errado: melhor vazio do que errado. Reconferido a 04/09/2026: a
     página só liga aos mesmos dois PDFs de Julho de 2025 (um terceiro
     ficheiro, «urbanas 2025.pdf», está morto, redirecciona para a página
     inicial); continua sem versão 2026. */
  'Beja': {operador:'Rodoviária do Alentejo', url:'https://cm-beja.pt/pt/menu/521/transportes-urbanos-e-transportes-a-pedido--taxis-coletivos.aspx', actualizado:'2026-09-04', fonte:'https://cm-beja.pt/pt/menu/521/transportes-urbanos-e-transportes-a-pedido--taxis-coletivos.aspx',
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
  /* As tabelas de preços da página não são geradas por JavaScript: estão
     embutidas como imagens. A própria página confirma «Ajustamento
     tarifário com efeitos a 1 de Janeiro de 2026», por isso é a tarifa
     actual. Não se inclui o «Multiviagens» (7,65 €) por a página não
     dizer quantas viagens dá: melhor omitir do que adivinhar. */
  'Vila Real': {operador:'Urbanos de Vila Real (TUVR)', url:'https://www.urbanosvilareal.pt/pt/tarifarios/', actualizado:'2026-09-04', fonte:'https://www.urbanosvilareal.pt/pt/tarifarios/', moeda:'EUR',
    nota:'Preços da zona 1 (a cidade). Em vigor desde 1/01/2026.',
    bilhetes:[
      {nome:'Bilhete de bordo', preco:1.25, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete de bordo, ida e volta', preco:2.30, unidade:'ida e volta', quando:'chegada', modos:['autocarro']},
      {nome:'Passe mensal', preco:29.00, unidade:'mês', quando:'antes', modos:['autocarro']}
    ]},
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
  /* Lido a 31/08/2026: a tarifa é por zona atravessada, mas pareceu estar
     numa imagem/widget, não em texto. Reconferido a 04/09/2026: a tabela
     está, sim, em texto simples, só que dentro de um atributo JSON de um
     componente da página (`table-data='[...]'`), que um `curl` normal não
     lê como tabela visível. Confirmados os preços com cartão AT HOP e a
     dinheiro (mais caro; só se compra em máquina/balcão, não a bordo). */
  'Auckland': {operador:'Auckland Transport', url:'https://at.govt.nz/bus-train-ferry/fares-and-discounts/bus-and-train-fares', actualizado:'2026-09-04', fonte:'https://at.govt.nz/bus-train-ferry/fares-and-discounts/bus-and-train-fares', moeda:'NZD',
    nota:'A tarifa é por zonas atravessadas (até 4). O tecto de gasto: no máximo 20 NZD por dia a pagar por contactless, ou 50 NZD por 7 dias com o cartão AT HOP.',
    bilhetes:[
      {nome:'Cartão AT HOP ou contactless, 1 zona', preco:3.00, unidade:'viagem', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Cartão AT HOP ou contactless, 4 ou mais zonas', preco:7.90, unidade:'viagem', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Dinheiro (só em máquina/balcão), 1 zona', preco:4.00, unidade:'viagem', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Dinheiro (só em máquina/balcão), 4 ou mais zonas', preco:10.00, unidade:'viagem', quando:'chegada', modos:['autocarro','metro']}
    ]},
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
     tabela nenhuma na página estática. Reconferido a 04/09/2026: o mapa
     tarifário continua interactivo (clicar estação a estação), sem tabela
     nem endpoint de dados achado; os valores que circulam por fontes
     secundárias (16-59 THB conforme distância) não vieram confirmados
     numa página oficial. */
  'Banguecoque': {operador:'BTS SkyTrain', url:'https://www.bts.co.th/', actualizado:'2026-09-04', fonte:'https://www.bts.co.th/', moeda:'THB',
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
     não um bilhete. Reconferido a 04/09/2026: `qr.com.qa` continua
     inacessível (falha de ligação repetida), mesmo resultado. */
  'Doha': {operador:'Qatar Rail (Doha Metro)', url:'https://visitqatar.com/intl-en/plan-your-trip/getting-around/doha-metro', actualizado:'2026-09-04', fonte:'https://visitqatar.com/intl-en/plan-your-trip/getting-around/doha-metro',
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
  /* Não estava na tabela. O operador dos autocarros urbanos era a ALSA
     (a mesma que já opera em Ibiza e noutras cidades), confirmado por
     várias fontes independentes; o valor mais citado era 4 DH em dinheiro
     ou 3,50 DH com o cartão Ikhlas, mas nenhuma delas era a página
     oficial: a página de tarifários da ALSA para Marraquexe estava
     partida no próprio sítio, a redireccionar para «not-found».
     Reconferido a 04/09/2026: a página continua morta porque a ALSA
     deixou mesmo de operar a rede, a 14/12/2025, ao fim de 26 anos: a
     Supratours (subsidiária da ONCF) tomou conta das 67 linhas urbanas.
     A Supratours não publica tarifário para a rede urbana (o site dela,
     supratoursbus.com, é só para autocarros interurbanos), mas a
     imprensa económica marroquina (LesEco.ma, 27/08/2026, uma semana
     antes desta verificação) confirma o bilhete: «Le ticket est maintenu
     à cinq dirhams»; só dinheiro a bordo, sem cartão de assinatura. */
  'Marraquexe': {operador:'Supratours (subsidiária da ONCF)', url:'https://leseco.ma/maroc/bus-a-marrakech-le-nouveau-gestionnaire-peine-a-convaincre.html', actualizado:'2026-09-04', fonte:'https://leseco.ma/maroc/bus-a-marrakech-le-nouveau-gestionnaire-peine-a-convaincre.html',
    moeda:'MAD',
    nota:'A ALSA geriu a rede urbana até Dezembro de 2025; a Supratours não tem página de tarifário próprio para autocarros urbanos, por isso a fonte é jornalística, não do operador.',
    bilhetes:[
      {nome:'Bilhete simples (só dinheiro, a bordo)', preco:5, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* O url antigo redirecciona para metrohanoi.vn; a página das tarifas
     (afc-tickets/metro-fares-1/) monta os preços em JavaScript, mas
     reconferido a 04/09/2026: embute dois avisos oficiais em imagem (um
     por linha, 2A Cát Linh-Hà Đông e 3.1 Nhổn-Ga Hà Nội), decisão do
     Comité Popular de Hanói n.º 3316/QĐ-UBND, em vigor desde 01/08/2025.
     Os títulos diário/semanal/mensal são os mesmos nas duas linhas; o
     bilhete avulso varia por distância percorrida (dinheiro, sem cartão). */
  'Hanói': {operador:'Hanoi Metro', url:'https://metrohanoi.vn/afc-tickets/metro-fares-1/', actualizado:'2026-09-04', fonte:'https://metrohanoi.vn/wp-content/uploads/2025/09/gia-ve-tuyen-2-1024x768.jpg', moeda:'VND',
    nota:'O bilhete avulso em dinheiro varia por distância (9.000 a 19.000 VND consoante o percurso). O passe mensal listado é o preço geral (não o reduzido, reservado a estudantes/trabalhadores locais).',
    bilhetes:[
      {nome:'Bilhete avulso (dinheiro, percurso mais curto)', preco:9000, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Bilhete avulso (dinheiro, percurso mais longo)', preco:19000, unidade:'viagem', quando:'chegada', modos:['metro']},
      {nome:'Vé ngày (passe diário)', preco:40000, unidade:'dia', quando:'chegada', modos:['metro']},
      {nome:'Vé 01 tháng (passe mensal, geral)', preco:280000, unidade:'mês', quando:'antes', modos:['metro']}
    ]},
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
     Reconferido a 04/09/2026: o `stbsa.ro` antigo redirecciona para o
     domínio actual `stb.ro`, cuja página de tarifário («Tarife») resolve
     a contradição com a tabela oficial, lida directamente da página (não
     de imprensa). O Metrorex continua sem site acessível nesta sessão,
     mas os títulos «integrado» abaixo já incluem o metro. */
  'Bucareste': {operador:'STB (Societatea de Transport București) / Metrorex', url:'https://www.stb.ro/tarife', actualizado:'2026-09-04', fonte:'https://www.stb.ro/tarife',
    moeda:'RON',
    nota:'A «Card călătorie turist» é o título integrado (superfície + metro + comboio Gara de Nord–Aeroporto Otopeni) pensado para visitantes.',
    bilhetes:[
      {nome:'1 viagem, só superfície, 90 min', preco:3, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'1 viagem, superfície + metro, 120 min', preco:7, unidade:'viagem', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Card călătorie turist, 24 horas', preco:20, unidade:'24 horas', quando:'chegada', modos:['autocarro','metro']},
      {nome:'Card călătorie turist, 72 horas', preco:40, unidade:'72 horas', quando:'chegada', modos:['autocarro','metro']}
    ]},
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
     confirmação cruzada, por isso fica só o operador. Reconferido a
     04/09/2026: a página tem mesmo uma tabela, mas é montada em
     JavaScript (widget Kendo UI, sem endpoint de dados visível no HTML).
     Uma notícia que supostamente citava valores por rota (San José-
     Alajuela, -Cartago, -Heredia) foi lida directamente e não continha
     esses números: fala de milhares de tarifas arredondadas ao múltiplo
     de 10 colones mais próximo (retirada das moedas de 5), sem os listar
     um a um. Continua sem valor fiável. */
  'San José': {operador:'Autocarros privados concessionados, regulados pela ARESEP', url:'https://aresep.go.cr/autobus/tarifas/', actualizado:'2026-09-04', fonte:'https://aresep.go.cr/autobus/tarifas/',
    moeda:'CRC', bilhetes:[]},
  /* Não estava na tabela. O Viceministerio de Transporte (VMT) regula
     autocarros e microbuses privados concessionados; a tarifa varia por
     rota ($0.20 a $1.86) e exige consulta por matrícula do veículo, sem
     valor único citadino. Reconferido a 04/09/2026: a ferramenta de
     consulta por rota (tarifariociudadano.vmt.gob.sv) liga a uma folha
     Excel oficial descarregável com as 1430 tarifas por rota. As
     unidades chamadas «AB» (autocarro) e «MB» (microbus) têm cada uma um
     valor claramente dominante, que se usa aqui como tarifa base:
     0,20 USD em 157 das 1095 rotas de autocarro (a mais comum, de
     longe), e 0,25 USD em 195 das 335 rotas de microbus (mais de
     metade). Fica o resto de fora: há tarifas por rota até 2,00 USD. */
  'San Salvador': {operador:'Autocarros/microbuses privados concessionados, regulados pelo Viceministerio de Transporte (VMT)', url:'https://tarifariociudadano.vmt.gob.sv/', actualizado:'2026-09-04', fonte:'https://tarifariociudadano.vmt.gob.sv/assets/docs/Tarifas%20Transporte%20Colectivo%20El%20Salvador.xlsx',
    moeda:'USD',
    nota:'A tarifa é fixada por rota (mais de 1400 no total); os valores abaixo são os mais comuns («tarifa base»), não um preço único citadino. Rotas específicas, sobretudo expresso ou longa distância, custam mais.',
    bilhetes:[
      {nome:'Autocarro (tarifa base, a maioria das rotas)', preco:0.20, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Microbus (tarifa base, a maioria das rotas)', preco:0.25, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
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
     única, por isso fica só o operador. Reconferido a 04/09/2026:
     transporte.gob.hn continua sem resposta (esgota o tempo limite). A
     única notícia com um número claro (13 lempiras) é de 13/08/2025,
     sobre uma extensão orçamental do subsídio só até finais de 2025, com
     mais de um ano de idade e sem confirmação de que ainda vale hoje;
     fica de fora por essa razão, não por o valor ser inverosímil. */
  'Tegucigalpa': {operador:'Autocarros urbanos privados ("rapiditos"), regulados pelo IHTT', url:'https://www.transporte.gob.hn/', actualizado:'2026-09-04', fonte:'https://www.transporte.gob.hn/',
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
     Reconferido a 04/09/2026: confusão ainda maior do que se pensava. O
     IMOVEQROO negou publicamente (24/11/2025) ter aprovado qualquer
     aumento na rede tradicional, mas o novo sistema MOBI (a substituir
     a rede rota a rota) já tem tarifa oficial anunciada: 15 MXN geral,
     10 MXN social (estudantes/idosos). O problema é que o MOBI ainda
     não cobre a cidade toda, por isso não se sabe que tarifa se aplica
     a uma rota qualquer hoje. Fica sem preço até a transição terminar. */
  'Cancún': {operador:'Autocarros urbanos (rutas R1/R2...), regulados pelo IMOVEQROO', url:'https://imoveqroo.qroo.gob.mx/', actualizado:'2026-09-04', fonte:'https://imoveqroo.qroo.gob.mx/',
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
     o operador. Reconferida esta conclusão outra vez, ainda a
     04/09/2026: nem a MMTL (`mmt.gov.gh`, `mmtgh.com`) nem a GPRTU
     publicam tarifário consolidado online; o GPRTU fixa só percentagens
     de ajuste, os valores em moeda ficam afixados fisicamente nas
     estações. Uma nova subida de 30% foi pedida ao Ministério dos
     Transportes a 3/09/2026, ainda por decidir. */
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
     o valor certo, por isso fica só o operador. Reconferido a 04/09/2026,
     lido directamente na própria página de perguntas frequentes (ainda
     viva, com a mesma pergunta «How much is your bus tickets?»): os dois
     métodos de pagamento continuam activos, ao contrário do que a
     notícia entretanto sugeria (essa página de notícia, aliás, já dá
     404). Citação exacta: «A single trip with a smartcard costs NAD8.50
     while payment by cash is NAD 9.50.» */
  'Windhoek': {operador:'City of Windhoek (Department of Urban and Transport Planning)', url:'https://www.windhoekcc.org.na/urban-and-transport-planning-faqs/', actualizado:'2026-09-04', fonte:'https://www.windhoekcc.org.na/urban-and-transport-planning-faqs/',
    moeda:'NAD',
    bilhetes:[
      {nome:'Bilhete simples, com smartcard (pré-pago)', preco:8.50, unidade:'viagem', quando:'antes', modos:['autocarro']},
      {nome:'Bilhete simples, a dinheiro', preco:9.50, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. AUMTCO é a empresa pública de autocarros;
     também há o Abuja Light Rail, mas nenhum dos dois tem tarifário
     oficial confirmável (só blogues de viagem contraditórios), por isso
     fica só o operador. Reconferido a 04/09/2026: a própria página da
     AUMTCO afinal tem, sim, uma tabela de tarifas por rota (32 rotas,
     preço para quem tem o cartão de autocarro e para quem não tem);
     usa-se aqui a tarifa mais baixa, comum a 12 das 32 rotas (as mais
     curtas, incluindo a circular do centro). O Abuja Light Rail continua
     sem tarifário actual confirmável: o único achado é de 2018, antes da
     suspensão pela pandemia, sem confirmação de que ainda vale. */
  'Abuja': {operador:'AUMTCO (Abuja Urban Mass Transport Company) / Abuja Light Rail', url:'https://aumtco.abujainvestments.com/urban-public-transportation-services/', actualizado:'2026-09-04', fonte:'https://aumtco.abujainvestments.com/urban-public-transportation-services/',
    moeda:'NGN',
    nota:'A tarifa é por rota (32 no total, até 400 NGN nas mais longas); o valor abaixo é o mais baixo, das rotas mais curtas (ex. a circular do centro). O Abuja Light Rail (comboio) não está incluído: não há tarifário actual confirmável.',
    bilhetes:[
      {nome:'Autocarro, com cartão (rota mais curta)', preco:75, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Autocarro, sem cartão (rota mais curta)', preco:100, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
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
     operador. Reconferido a 04/09/2026: `sptc.sc/faq/` foi redesenhado e
     já não existe, mas achou-se a página actual `sptc.sc/cards/`, com o
     «Visitor Travel Card», pensado mesmo para turistas: viagens
     ilimitadas por um número de dias, sem ter de saber o preço de cada
     percurso. A tarifa normal por viagem (~10 SCR, para quem mora cá)
     continua sem confirmação clara numa página viva, por isso fica de
     fora; o cartão de visitante chega e sobra para quem usa este site. */
  'Victoria': {operador:'SPTC (Seychelles Public Transport Corporation)', url:'https://sptc.sc/cards/', actualizado:'2026-09-04', fonte:'https://sptc.sc/cards/',
    moeda:'SCR',
    nota:'O Visitor Travel Card dá viagens ilimitadas em todos os autocarros normais da SPTC em Mahé e Praslin, pensado para quem visita as ilhas.',
    bilhetes:[
      {nome:'Visitor Travel Card, 1 dia', preco:100, unidade:'dia', quando:'antes', modos:['autocarro']},
      {nome:'Visitor Travel Card, 4 dias', preco:198, unidade:'4 dias', quando:'antes', modos:['autocarro']},
      {nome:'Visitor Travel Card, 8 dias', preco:363, unidade:'8 dias', quando:'antes', modos:['autocarro']}
    ]},
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
     oficial nem actual, por isso fica só o operador. Reconferido outra
     vez a 04/09/2026, com a mesma conclusão: um valor mais recente
     (0,50 manat) aparece em vários sites de turismo, mas nenhum é fonte
     oficial; um artigo do turkmenportal.com (media semi-oficial) fala
     de passes mensais mas sem repetir o preço da viagem simples. A
     secção de tarifário do site oficial (`ayauk.gov.tm`) continua
     inacessível. */
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
     confirmado actualmente para as linhas da CDA. Reconferido a
     04/09/2026, lido directamente na página inicial da PMA (Punjab Mass
     Transit Authority): a política de tarifas separa claramente o
     «Metrobus System» (o BRT que liga Rawalpindi a Islamabad, tarifa
     única por viagem) da linha ferroviária Orange Line de Lahore (essa
     sim por distância, Rs 25 a Rs 45), o que resolve a confusão anterior
     entre os vários valores. Fica só o Metrobus (as linhas CDA/Orange
     continuam sem valor fiável). */
  'Islamabad': {operador:'PMA (Punjab Mass Transit Authority), Metrobus Rawalpindi-Islamabad', url:'https://pma.punjab.gov.pk/', actualizado:'2026-09-04', fonte:'https://pma.punjab.gov.pk/',
    moeda:'PKR',
    nota:'É a tarifa do Metrobus (BRT) entre Rawalpindi e Islamabad. As restantes linhas da cidade (CDA: Orange/Blue/Green) continuam sem tarifa fiável confirmada.',
    bilhetes:[
      {nome:'Bilhete simples, Metrobus', preco:30, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Vientiane Capital State Bus Enterprise; fontes
     contradizem-se sobre o preço por rota específica, e uma tarifa
     promocional temporária já expirou, sem valor actual confirmado, por
     isso fica só o operador. Reconferido a 04/09/2026: vientianebus.org.la
     continua sem resolver DNS, de qualquer computador. A única fonte
     com número (agência noticiosa estatal do Laos, KPL) descrevia uma
     tarifa promocional de crise (10.000 LAK, só nalgumas linhas), válida
     de 23/03 a 30/05/2026 e já expirada há mais de três meses; a tarifa
     "normal" retomada depois disso não está confirmada em lado nenhum. */
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
  /* Reconferido a 04/09/2026: achado o regulador certo, o Departamento
     de Política de Transporte Público de Ulaanbaatar
     (transport.ub.gov.mn, site cujo certificado TLS não corresponde ao
     domínio, por isso não se conseguiu ler directamente). Duas notícias
     da agência estatal MONTSAME (montsame.mn, ambas de Janeiro de 2025,
     mais de ano e meio antes desta verificação) confirmam uma reforma
     tarifária para 1000 MNT por até 4 viagens/dia sem limite de tempo
     entre as 06h-23h. Mas uma pesquisa mais recente devolveu também um
     indício contraditório («47,4% dos passageiros pagam 500 MNT»), sem
     forma de saber qual descreve o sistema actual. Entre a idade da
     fonte e a contradição, fica só o operador. */
  'Ulã Bator': {operador:'Departamento de Política de Transporte Público da cidade (rede de autocarros privados)', url:'https://en.ulaanbaatar-airport.mn/public-transportation-service', actualizado:'2026-09-04', fonte:'https://en.ulaanbaatar-airport.mn/public-transportation-service',
    moeda:'MNT', bilhetes:[]},
  /* Não estava na tabela. Yangon Bus Service (YBS), regulado pelo YRTC;
     um aumento de tarifa anunciado a 14/08/2026 terá sido retirado dois
     dias depois, sem confirmação de qual valor está mesmo em vigor, por
     isso fica só o operador. Reconferido a 04/09/2026: episódio
     diferente, mais recente. O YRTC anunciou em conferência de imprensa
     um aumento geral em vigor desde 1/09/2026 (há só 3 dias): rotas do
     centro de 200 para 300 kyat, rotas periféricas de 400 para 600
     kyat. Os sites .gov.mm (Myanmar Digital News, Global New Light of
     Myanmar) recusaram o `curl`, mas duas fontes de imprensa
     independentes entre si (myanmarnews.net e news.myantrade.com, esta
     em coreano) confirmam os mesmos números, citando o YRTC pelo nome. */
  'Rangum': {operador:'Yangon Bus Service (YBS, regulado pelo YRTC)', url:'https://www.myanmarnews.net/news/279243648/myanmar-yangon-public-bus-fares', actualizado:'2026-09-04', fonte:'https://www.myanmarnews.net/news/279243648/myanmar-yangon-public-bus-fares',
    moeda:'MMK',
    nota:'Aumento em vigor desde 1/09/2026. Rotas do centro (downtown) custam menos que as periféricas/suburbanas.',
    bilhetes:[
      {nome:'Bilhete simples, rota central', preco:300, unidade:'viagem', quando:'chegada', modos:['autocarro']},
      {nome:'Bilhete simples, rota periférica/suburbana', preco:600, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
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
     vigente, por isso fica só o operador. Reconferido a 04/09/2026: o
     jornal Island Times (imprensa local, não blogue) confirma 1 USD por
     viagem em três artigos entre Abril/2024 e Julho/2025, mas o mais
     recente sobre o serviço (Abril/2026, sobre uma «Fase 2» com mais
     rotas) não repete o valor. Sem confirmação directa há mais de um
     ano, fica de fora. */
  'Koror': {operador:'Palau Eco-Friendly Public Transport (HRCTD)', url:'https://www.palaugov.pw/executive-branch/ministries/hrctd/', actualizado:'2026-09-04', fonte:'https://www.palaugov.pw/executive-branch/ministries/hrctd/',
    moeda:'USD', bilhetes:[]},
  /* Não estava na tabela. Operadores privados licenciados regulados pela
     FCCC; o único valor confirmado é de Agosto de 2023, com indícios não
     verificáveis de subsídios e aumentos desde então, sem confirmação do
     valor actual, por isso fica só o operador. Reconferido a 04/09/2026:
     achada a «Final Authorisation for Fares and Charges for Omnibus
     Services in Fiji», da FCCC, emitida a 31/08/2026 (quatro dias antes
     desta verificação). O «Stage 1» (tarifa mínima, sobe por zona) é a
     mesma para Viti Levu (a ilha de Nadi), Vanua Levu e Taveuni. */
  'Nadi': {operador:'Operadores privados de autocarro (regulados pela FCCC)', url:'https://fccc.gov.fj/transport/', actualizado:'2026-09-04', fonte:'https://fccc.gov.fj/wp-content/uploads/2026/08/Final-Authorisation-of-Fares-and-Charges-for-Omnibus-Services.pdf',
    moeda:'FJD',
    nota:'Tarifa por zona ("stage"), do Stage 1 (a mais barata) até ao Stage 46; o Stage 1 aplica-se a viagens curtas dentro da cidade.',
    bilhetes:[
      {nome:'Bilhete simples, Stage 1 (viagem curta)', preco:1.02, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Rede de PMV (Public Motor Vehicles), regulada
     pela ICCC; fontes fortemente contraditórias sobre o valor actual (a
     ICCC tem uma revisão faseada 2026-2030 em curso), sem confirmação
     fiável, por isso fica só o operador. Reconferido a 04/09/2026: achado
     o «Public Motor Vehicle and Taxi Services Prices Order 2026», Gazeta
     Nacional n.º G21 de 9/01/2026, publicado pela própria ICCC (PDF
     digitalizado, lido por imagem). É a tarifa máxima legal para a rede
     urbana do National Capital District (Port Moresby); a ICCC já
     reconheceu publicamente que alguns operadores cobram mais na
     prática, por isso fica dito que é o tecto, não uma garantia. */
  'Port Moresby': {operador:'PMV (Public Motor Vehicles), regulados pela ICCC', url:'https://iccc.gov.pg/pmv-taxi-fares/', actualizado:'2026-09-04', fonte:'https://iccc.gov.pg/wp-content/uploads/2026/01/National-Gazette-G21-Public-Motor-Vehicle-and-Taxi-Services-Prices-Order-2026.pdf',
    moeda:'PGK',
    nota:'É a tarifa máxima legal para a rede urbana do National Capital District (Port Moresby), em vigor desde 1/01/2026. A ICCC reconhece que, na prática, alguns operadores cobram mais nalgumas rotas.',
    bilhetes:[
      {nome:'Bilhete adulto, tarifa máxima', preco:1.60, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
  /* Não estava na tabela. Rede de autocarros privados, regulada pela
     Land Transport Authority (LTA) de Samoa; fontes muito díspares entre
     si sobre o valor de um trajecto urbano simples, sem confirmação
     fiável, por isso fica só o operador. Reconferido a 04/09/2026: achada
     a «Bus & Taxi Passenger Fare List» oficial da LTA, datada de
     31/07/2026 (pouco mais de um mês antes desta verificação), lida na
     íntegra (17 páginas, texto simples, não imagem). */
  'Apia': {operador:'Autocarros privados (regulados pela Land Transport Authority)', url:'https://lta.gov.ws/fees/', actualizado:'2026-09-04', fonte:'https://lta.gov.ws/wp-content/uploads/2026/08/Bus-Taxi-Fare-List.pdf',
    moeda:'WST',
    nota:'Tarifa por zona, a partir do terminal de Savalalo/Fugalei; o valor abaixo é o da zona central de Apia (as zonas mais afastadas custam mais).',
    bilhetes:[
      {nome:'Bilhete simples, zona de Apia', preco:1.30, unidade:'viagem', quando:'chegada', modos:['autocarro']}
    ]},
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

