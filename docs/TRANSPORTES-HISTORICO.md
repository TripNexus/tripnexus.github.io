# Tarifas de transportes: histórico de correcções

Registo, ronda a ronda, do que mudou na tabela `TRANSPORTES_DESTINO`
(`assets/js/data.js`) e porquê. A metodologia e o estado actual ficam em
[`TRANSPORTES.md`](TRANSPORTES.md); este ficheiro só cresce, para trás.

### Correcções em cidades que já cá estavam

Todas lidas na página do operador.

| Cidade | Estava | É | Nota |
|---|---|---|---|
| Lisboa | simples 1,85 € | **1,90 €** | |
| Lisboa | 24 h 6,90 € | **7,25 €** | |
| Lisboa | 24 h + CP 10,90 € | **11,40 €** | acrescentados o zapping, o cartão bancário e o diário com a Transtejo |
| Barcelona | simples 2,65 € | **2,90 €** | |
| Barcelona | T-casual 12,55 € | **13,00 €** | |
| Barcelona | Hola Barcelona 48 h e 72 h | **retirados** | a página anuncia «a partir de 12,50 €» e não os separa por duração |
| Budapeste | simples 450 Ft | **500 Ft** | |
| Budapeste | 24 h 2 500 Ft | **2 750 Ft** | |
| Budapeste | 72 h 5 500 Ft | **5 750 Ft** | |
| Viena | simples 2,60 € | **3,20 €** | nova estrutura tarifária a 1 de Janeiro de 2026 |
| Viena | 24 h 8,00 € | **10,20 €** | |
| Viena | 72 h 17,10 € | **extinto** | os passes de 48 h e 72 h deixaram de existir |
| Amesterdão | 24 h 9,00 € | **10,00 €** | |
| Amesterdão | 72 h 21,00 € | **21,50 €** | acrescentados os de 48 h e 7 dias |
| Amesterdão | Schiphol 5,90 € | **retirado** | é da NS, não do GVB |
| Porto | Andante 24 Z2 4,80 € | **5,35 €** | endereço trocado: o antigo era a página do capital social, não o tarifário |
| Porto | Z4 aeroporto 2,25 € | **2,30 €** | acrescentados o Andante 24 Z4 e os Andante Tour de 1 e 3 dias |
| Berlim | simples AB 3,80 € | **4,00 €** | |
| Berlim | diário AB 10,60 € | **11,20 €** | passe de 7 dias e tarifa do aeroporto retirados: não vêm nesta página |
| Praga | 30 min 30 CZK | **39 CZK** | |
| Praga | 90 min 40 CZK | **50 CZK** | |
| Praga | 24 h 120 CZK | **150 CZK** | |
| Praga | 72 h 330 CZK | **350 CZK** | |

### Correcções da ronda em navegador, a 30 de Agosto

Doze cidades que já tinham valores foram lidas pela primeira vez na página
do operador. Nenhuma delas tinha data de conferência: todas diziam
`2026-01-01`, que era o ano da tarifa e não o dia em que alguém foi ver.
Exactamente o hábito que este documento existe para acabar.

| Cidade | Estava | É | Nota |
|---|---|---|---|
| Paris | Ticket t+ 2,50 € | **2,55 €** | e passou a haver um segundo preço: 2,05 € no autocarro e eléctrico |
| Paris | Navigo Jour 12,00 € | **12,30 €** | |
| Paris | Navigo Semaine 31,60 € | **32,40 €** | |
| Paris | CDG 2,50 € | **14,00 €** | a nota dizia «tarifa única, incluindo de e para os aeroportos»; era o erro mais caro da tabela |
| Roma | Roma 24H 7,00 € | **8,50 €** | |
| Roma | Roma 72H 18,00 € | **22,00 €** | acrescentados o de 48 h (15,00 €) e o semanal CIS (29,00 €) |
| Roma | Leonardo Express 14,00 € | **retirado** | é da Trenitalia, não da ATAC |
| Nova Iorque | metro 2,90 USD | **3,00 USD** | |
| Nova Iorque | tecto semanal 34,80 USD | **35,00 USD** | acrescentado o do autocarro expresso (7,25 e tecto de 67) |
| Nova Iorque | «OMNY ou MetroCard» | **só OMNY** | o MetroCard deixou de se vender a 1 de Janeiro de 2026 |
| Nova Iorque | AirTrain JFK 11,15 USD | **retirado** | é da Port Authority, não da MTA |
| Londres | tecto diário zonas 1–2 8,90 £ | **8,90 £** | não mexeu; acrescentados o tecto semanal (44,70) e o Day Travelcard (16,60) |
| Londres | metro zona 1 2,90 £ | **retirado** | o «single fare finder» da TfL não chega a mostrar valores |
| Londres | Elizabeth line Heathrow 12,80 £ | **retirado** | pela mesma razão |
| Tóquio | passe 24 h 600 ¥ | **700 ¥** | |
| Tóquio | Narita Express 3 070 ¥ | **retirado** | é da JR East; o operador passa a dizer só Tokyo Metro, que é o que se conferiu |
| Istambul | viagem 27 ₺ | **46,20 ₺** | quase o dobro; lido no Metro İstanbul, que é quem os publica em HTML |
| Istambul | cartão 130 ₺ e M11 54 ₺ | **retirados** | não vinham em nenhuma página do operador; ficam ditos sem número |

E sete cidades que estavam em «só operador» passaram a ter preços, mais seis
que nem sequer estavam na tabela:

| Cidade | Estava | Agora |
|---|---|---|
| Valência | só operador | sencillo 1,50 € (zona A) e os passes SUMA T de 24, 48 e 72 h |
| Palma de Maiorca | só operador | 2,00 € urbano, 5,00 € o aeroporto |
| Estocolmo | só operador | simples 43 SEK, fecha a dúvida dos guias entre 42 e 43 |
| Manchester | só operador | 2,00 £ o autocarro, tectos de 9,50 e 41,00 £ |
| Hong Kong | só operador | Tourist Day Pass 75 HKD e a Airport Express a 120 |
| Kuala Lumpur | só operador | Rapid Kembara 25 e 55 MYR (o Kota, mais barato, é só para malaios) |
| Deli | só operador | tabela por distância e os cartões turísticos de 200 e 500 ₹ |
| Málaga | **sem operador** | EMT Málaga: 1,40 €, e 4,00 € o aeroporto |
| Lyon | **sem operador** | TCL: 2,10 € e os passes de 24, 48 e 72 h |
| Helsínquia | **sem operador** | HSL: 3,30 € na aplicação, 10,60 € o dia |
| Dubai | **sem operador** | RTA: nol Silver por zonas, 3,00 a 7,50 AED |
| Melbourne | **sem operador** | PTV: 2,85 AUD as 2 h, e o eléctrico grátis no centro |
| Frankfurt | **sem operador** | RMV: operador e ligação, ainda sem valores |

Duas coisas dignas de nota, porque não são «o preço subiu»:

**Lyon vem com data.** O guia tarifário que a TCL publica diz, na capa, «à
partir du 1er septembre 2026», dois dias depois desta ronda. São as tarifas
que vão entrar em vigor, e a nota da cidade di-lo por palavras, para que
ninguém as leia como as de hoje.

**Kuala Lumpur tem um passe que não serve.** O Rapid Kota custa 10 MYR ao
dia contra os 25 do Kembara, e era o que se poria aqui se não se lesse a
página até ao fim: diz «exclusively for Malaysians only». Um passe mais
barato que o utilizador não pode comprar é pior do que passe nenhum. A nota
visível ao utilizador, e não só um comentário no código, passou a dizê-lo.

### Correcções de Milão e Singapura, a 30 de Agosto

Estas duas tinham ficado de fora do âmbito da ronda em navegador, por já
terem valores na tabela; foram reconferidas a seguir, na própria página do
operador.

| Cidade | Estava | É | Nota |
|---|---|---|---|
| Milão | `url` truncado, `HowtogetaroundMilan.aspx` (404) | `HowtogetaroundMilanbypublictransport.aspx` | o endereço certo estava na própria raiz do sítio da ATM; só faltava o fim |
| Milão | passe de 3 dias 13,00 € | **15,50 €** | |
| Milão | nenhum | **carnet de 10 viagens, 19,50 €** | não vinha na tabela |
| Singapura | «viagem típica de metro» 1,50 SGD | **retirado** | era uma média inventada; a SBS Transit cobra por distância, como Hong Kong e Deli |
| Singapura | nenhum | **3 escalões por distância, de 1,28 a 1,90 SGD** | lidos na tabela oficial da SBS Transit, em vigor desde 27 de Dezembro de 2025 |
| Singapura | Singapore Tourist Pass 22,00 SGD | **retirado** | só encontrado em sítios de afiliados, nunca numa fonte oficial: fica sem número, por a regra «fontes secundárias não chegam» |

### Endereços partidos, que o utilizador via

Sete ligações «Ver tarifário oficial» davam **404**. Um tarifário certo atrás
de uma ligação morta não serve de nada, e nenhuma destas se via sem ir lá.

| Cidade | Dava 404 | Agora |
|---|---|---|
| Porto | `metrodoporto.pt/pages/389` | `metrodoporto.pt/pages/357` |
| Barcelona | `tmb.cat/pt/tarifas-metro-bus-barcelona` | `tmb.cat/en/barcelona-fares-metro-bus` |
| Milão | `atm.it/…/SceltaBiglietto.aspx` | `atm.it/en/Pages/default.aspx` |
| Berlim | `bvg.de/en/tickets-and-fares` | `bvg.de/en` |
| Singapura | `lta.gov.sg/content/…` | `lta.gov.sg/` |
| Munique | `mvv-muenchen.de/en/tickets-and-fares/` | `mvg.de` (é o MVG que opera a rede da cidade) |
| Bogotá e Auckland | caminhos apanhados na sondagem | raízes confirmadas |
| Porto | `metrodoporto.pt/pages/357` | `metrodoporto.pt/pages/287` (o antigo respondia 200 mas era a página do capital social, não o tarifário; ver a regra «200 não quer dizer página certa») |
| Milão | `atm.it/en/Pages/default.aspx` (200, não é o tarifário) | `HowtogetaroundMilanbypublictransport.aspx` (também descoberto na raiz; ver a correcção de 30 de Agosto acima) |

### Ronda por `curl`, a 31 de Agosto: 15 cidades confirmadas, 2 operadores novos

Sem navegador, só com `curl`, `achar.py` e pesquisa para achar operadores.
Todas as datas de confirmação ficaram em 2026-08-31.

| Cidade | Estava | Ficou |
|---|---|---|
| Funchal | operador, sem valores (`horariosdofunchal.pt`) | bilhete de bordo 2,05 €; Regional Turístico 13,75 a 36,00 € (24 h a 7 dias), na TIIM, o tarifário comum a toda a Madeira |
| Tenerife | operador, sem valores | Day Travelcard 10 €, 7 Days Travelcard 50 € (TITSA, Ten+); o avulso continua sem preço fixo, por depender de uma calculadora |
| Marselha | operador, sem valores | Carte 1 voyage 1,70 €, Carte 10 voyages (carnet) 15,00 € (RTM); o CityPass turístico ficou de fora, por só ter aparecido o preço de criança |
| Frankfurt | «só dá o preço no planeador» | Kurzstrecke 2,35 €, Einzelfahrt 3,80 €, Tageskarte 7,75 €, FrankfurtCard 1 dia 13,00 € (RMV, tarifa própria da cidade, zona 5000) |
| Munique | operador, sem valores | Einzelfahrkarte Kurzstrecke 2,10 €, Einzelfahrkarte «a partir de» 2,70 €, Tageskarte «a partir de» 7,00 € (MVG/MVV) |
| Cracóvia | operador, sem valores | bilhete de 30 min ou viagem única 6 PLN, diário zona I 20 PLN, 72 h zonas I+II+III 55 PLN (MPK Kraków) |
| Zagreb | operador, sem valores | 90 min 1,33 €, diário 3,98 €, 3 dias 9,29 € (ZET, pré-compra; ao condutor custa mais) |
| Dubrovnik | operador, sem valores | 1 hora pré-comprado 1,73 €, comprado no autocarro 2,50 €, diário 5,31 €, 3 dias 11,95 € (Libertas Dubrovnik) |
| Casablanca | operador, sem valores | Ticket Unitaire 8 dh (1 viagem) / 14 dh (2 viagens) (Casa Tramway) |
| Recife | operador, sem valores | Bilhete único (autocarro) 4,50 BRL, tarifa do metro 4,25 BRL (Grande Recife) |
| Bogotá | operador, sem valores | tarifa única, todo o dia, 3.550 COP (TransMilenio); o `url` também mudou, para a página certa do sistema de tarifas |
| Buenos Aires | operador, sem valores (`url` a redireccionar para o arquivo histórico da Cidade) | Subte, SUBE sem registar, 2.526 ARS (fonte trocada para a Secretaria de Transporte, `argentina.gob.ar`) |
| Santiago | operador, sem valores | autocarro 795 CLP, metro em horário valle 815 CLP (Red Movilidad); o metro muda de preço consoante a hora, dito na nota |
| Osaka | operador, sem valores | tarifa por distância, 190 a 390 ienes em 5 escalões, como Hong Kong e Deli (Osaka Metro) |
| Cidade do Cabo | operador, sem valores | tarifa por distância, tarifa Mover fora de hora de ponta, 15 a 46 ZAR consoante o escalão (MyCiTi) |
| Fortaleza | não estava na tabela | entrou como «só operador»: ETUFOR, achado por pesquisa. O valor (R$ 5,40 desde Janeiro de 2026) só apareceu em notícias e no anúncio da Prefeitura, nunca numa página oficial legível ao `curl`; sem fonte primária em texto, fica sem preço |
| Ponta Delgada | não estava na tabela | entrou como «só operador»: AzoresBus (Vale do Ave Açores), que tomou conta da rede de São Miguel a 1 de Setembro de 2025. A página de tarifários monta os preços em JavaScript |

Ficaram por resolver, ainda «só operador» ou pior: Sevilha (Cloudflare),
Nápoles (o `url` antigo dá 404; o novo, num portal Salesforce, monta tudo
em JavaScript), Oslo, Reiquiavique, Nice, Banguecoque e Hanói (todas
páginas em JavaScript, sem PDF alternativo achado) e Auckland (a tabela
por zona está numa imagem, só o tecto de gasto diário, 20 NZD, veio em
texto).

### Continuação da ronda por `curl`, ainda a 31 de Agosto: mais 4 cidades

Depois de fechar as 24 «só operador», a ronda foi a algumas das «sem
operador», atrás de operadores que ainda não tinham sido achados.

| Cidade | Estava | Ficou |
|---|---|---|
| Ibiza | não estava na tabela | entrou confirmada: ALSA, tarifa por escalão de distância, 1,70 a 2,60 € por cartão ou QR (2,40 a 3,60 € em dinheiro a bordo) |
| Santorini | não estava na tabela | entrou confirmada: KTEL Santorini, a maioria das linhas a partir de Fira a 2,20 €, incluindo a do aeroporto; ao porto de Athinios, 2,70 € |
| Marraquexe | não estava na tabela | entrou como «só operador»: ALSA (a mesma companhia de Ibiza e Casablanca), mas a página de tarifários para Marraquexe está partida no próprio sítio (`alsa.ma/en/marrakech/prices` dá «not-found»); o valor mais citado (4 DH) só veio de guias, nunca do operador |
| Doha | não estava na tabela | entrou como «só operador»: Qatar Rail / Doha Metro. O Visit Qatar (autoridade oficial de turismo) confirma um tecto de 6 QAR por dia; o preço da viagem avulsa (2 QAR, citado em vários guias) não veio confirmado numa página do operador, que recusou o `curl` |

Tentadas e sem resultado: Lima, Xangai e Pequim (sítios oficiais
inalcançáveis ou bloqueados ao `curl`, sem alternativa achada), Mumbai
(o operador BEST tem sítio, mas a página de tarifas de autocarro não se
achou nele) e Cidade do México e Cancún, ambas em domínios `.gob.mx`
bloqueados pela política de rede deste ambiente, não pelos próprios
sítios.

### Ronda das cidades sem aeroporto, a 31 de Agosto: 11 cidades confirmadas, 2 só operador

As viagens nacionais para cidades portuguesas sem aeroporto comercial
(`semAeroporto:true`, ver `data.js`) tornaram Coimbra, Aveiro, Guarda e
Covilhã pesquisáveis como destino, e a mesma ronda foi atrás de mais oito
cidades no mesmo caso: os distritos-capital do continente sem aeroporto
(Braga, Castelo Branco, Évora, Leiria, Portalegre, Santarém, Setúbal, Viana
do Castelo) e Beja, que tem aeródromo mas sem voos comerciais regulares.
Todas as datas de confirmação ficaram em 2026-08-31.

| Cidade | Estava | Ficou |
|---|---|---|
| Coimbra | não estava na tabela | entrou confirmada: bilhete de motorista 2,00 €; passe intermodal (SMTUC + Metro Mondego) de 1, 3 e 7 dias, 5,00 a 15,00 €, tarifário em vigor desde 30/04/2026 (SMTUC) |
| Aveiro | não estava na tabela | entrou confirmada: tarifa de motorista 2,00 €, ida e volta zona 1 2,05 €, bilhete turístico 1 e 2 dias 10,00 e 18,00 € (Aveiro Bus); preços de 2024, mantidos sem aumento em 2026 |
| Guarda | não estava na tabela | entrou confirmada: bilhete simples 1,30 €, pré-comprados (10 bilhetes) 10,00 € (ETUG); tarifário aprovado em 23/12/2025 |
| Covilhã | não estava na tabela | entrou confirmada: bilhete de bordo urbano 1,85 €, bilhete diário pré-comprado 4,35 € (Covilhã Mobilidade); a página oficial monta a tabela em JavaScript, os valores vieram do cartaz tarifário 2026 em PDF, da mesma empresa (Transdev) |
| Braga | não estava na tabela | entrou confirmada: bilhete de bordo (1 coroa) 1,55 €, pré-comprado digital 0,75 €, bilhete turístico 1 e 3 dias 3,35 e 8,05 € (TUB); tarifário em vigor desde 21/02/2026 |
| Viana do Castelo | não estava na tabela | entrou confirmada: bilhete a bordo 1,50 €, pré-comprado 1,00 €, bilhete de 1 e 3 dias 5,00 e 12,00 € (TUViana); serviço muito recente, cobrança física só arrancou a 13/04/2026, sem página de tarifário dedicada ainda achada, só o comunicado oficial da câmara |
| Leiria | não estava na tabela | entrou confirmada: tarifa de motorista 1,60 €, bilhete diário 3,65 €, pré-comprados (10 viagens) 9,50 € (Mobilis/Rodoviária do Lis); preços em vigor desde 1/01/2026 |
| Santarém | não estava na tabela | entrou confirmada: tarifa de motorista 1,70 €, pré-comprado 1,20 €, passe urbano mensal 10,25 € (Scalabus/RodoLeziria); preços em vigor desde 1/01/2026 |
| Setúbal | não estava na tabela | entrou confirmada: tarifa de bordo, Linha Próxima, 1,30 €, pré-pago 0,85 €, passe Navegante Municipal 30,00 € (Carris Metropolitana); a página oficial de tarifários ainda mostra os valores de 2025, o aumento de 2026 confirmado numa notícia da Lisboa Para Pessoas, com fonte na AMT |
| Castelo Branco | não estava na tabela | entrou confirmada: bilhete simples 1,10 €, bilhete diário 3,85 €, pré-comprado (10 viagens) 9,70 € (Mobicab) |
| Évora | não estava na tabela | entrou confirmada: bilhete de motorista 1,55 €, tarifa diária LinhAzul 1,20 €, pré-comprado (10 viagens) 6,10 €, passe urbano mensal 9,90 € (Trevo/E-BUS); valores da deliberação camarária de 17/12/2025, em vigor desde 1/01/2026 |
| Portalegre | não estava na tabela | entrou como «só operador»: SMAT. A página de tarifários diz «Atualizado em 19/01/2023»; sem confirmação de que os valores ainda são os actuais, fica sem preço |
| Beja | não estava na tabela | entrou como «só operador»: Rodoviária do Alentejo. O único tarifário urbano achado está datado de julho de 2025, um ano antes do aumento nacional de 2026 (2,28 %, AMT) que todos os outros operadores portugueses já reflectiam; sem versão 2026 confirmada, fica sem preço |

Bragança, Vila Real e Viseu, que passaram a cidades normais (com aeroporto
e código IATA real: BGC, VRL, VSE) nesta mesma ronda por terem serviço
aéreo comercial PSO da Sevenair, ficaram **sem operador**: ainda não se foi
à procura de quem opera os transportes públicos locais nestas três.

### Madrid reconferida, a 01 de Setembro: primeira cidade a sair do «por rever» desde sempre

Madrid tinha o `actualizado` posto a `2026-01-01`, o dia em que a tarifa
entrara em vigor, não o dia em que alguém a fora ver: o hábito exacto que
este sistema existe para acabar, por isso estava sempre marcada como «por
rever» desde o primeiro dia. A página institucional (`crtm.es/billetes-y-
tarifas`) só resume os preços como «Desde X €», sem discriminar por zona
ou duração; a fonte usada foi o Boletín Oficial da Comunidad de Madrid de
31/12/2025 (BOCM), com a tabela tarifária completa aprovada a 29/12/2025,
em vigor desde 1/01/2026.

| Cidade | Estava | É |
|---|---|---|
| Madrid | Bilhete simples (zona A) 1,50 € | **sem alteração** |
| Madrid | Bilhete de 10 viagens 12,20 € | **12,50 €** |
| Madrid | Abono turístico 1 dia (zona A) 8,40 € | **10,30 €** |
| Madrid | Abono turístico 5 dias (zona A) 26,80 € | **33,40 €** |
| Madrid | Suplemento de aeroporto (metro) 3,00 € | **sem alteração** |
| Madrid | Preço do cartão Tarjeta Multi 2,50 € | **sem alteração**, confirmado nas FAQ da mesma página |

Com isto, `node ferramentas/transportes.js` passa a mostrar «POR REVER:
nenhuma» pela primeira vez desde que este sistema existe.

### Bragança, Vila Real e Viseu, a 01 de Setembro: a última lacuna das cidades sem entrada

Estas três ficaram sem entrada em `TRANSPORTES_DESTINO` desde 31 de
Agosto, quando passaram de `semAeroporto:true` a cidades normais (por
terem voo comercial PSO real, da Sevenair). Eram as últimas três cidades
do site ainda por pesquisar.

| Cidade | Estava | Ficou |
|---|---|---|
| Viseu | não estava na tabela | entrou confirmada: bilhete de motorista (1 zona) 0,75 €, pré-comprado 10 viagens 6,65 €, bilhete turístico 1 e 3 dias 3,10 e 6,15 € (MUV); tarifário 2026 em vigor desde 1/01/2026 |
| Bragança | não estava na tabela | entrou como «só operador»: STUB. Página de tarifários em JavaScript, sem PDF alternativo achado |
| Vila Real | não estava na tabela | entrou como «só operador»: Urbanos de Vila Real (TUVR). Página de tarifários em JavaScript, sem PDF alternativo achado |

Viseu por pouco não ficou com um valor errado: o primeiro PDF achado
(`tarifas_muv.pdf`, ligado a partir da própria página da Câmara) dizia
«TARIFÁRIOS PARA 2021» no rodapé, cinco anos desactualizado; o segundo
(`web_tarifas_muv_2025.pdf`) dizia «TARIFÁRIOS 2025», já melhor mas ainda
não o corrente, sobretudo depois de o operador ter mudado em junho de
2025. Só o terceiro (`web_tarifario_muv_2026.pdf`, achado a listar os
ficheiros da página de tarifários e horários da Câmara, não por pesquisa)
tinha a data certa: «Em vigor a partir de 1 de janeiro de 2026». A lição:
um PDF ligado a partir de uma página institucional pode não ser o mais
recente que essa mesma instituição já publicou; vale a pena listar todos
os ficheiros da página, não só seguir a primeira ligação óbvia.

### Etapa 2, a 01 de Setembro: tarifário real da CP a partir do Porto

O `TARIFAS_CP` só tinha rotas com origem em Lisboa; Braga, Viana do
Castelo, Aveiro e Coimbra têm o Porto como aeroporto mais próximo
(`gatewayMaisProximo`), não Lisboa, por isso o troço terrestre da Fase 2
caía sempre na estimativa do autocarro em vez do preço real do comboio.
Faltava ler as tarifas com origem no Porto do mesmo PDF já usado
(`precos-intercidades-lisboa-porto-braga-guimaraes-valenca`), tentativa
que tinha ficado por fazer numa ronda anterior por o PDF listar todas as
estações da linha numa única tabela em cascata, sem repetir o nome da
origem em texto simples por cada bloco.

A tabela acabou por ceder a uma leitura por posição (pymupdf,
`get_text("dict")`, coordenadas x/y de cada palavra): o nome de cada
estação-destino e o preço da mesma linha alinham sempre à mesma coordenada
x, o que dá uma lista de linhas em ordem; e como esta é a matriz
triangular clássica de tarifário ferroviário (a origem N lista sempre as
estações a jusante da origem N-1, uma a menos de cada vez: 31, 30, 29...),
bastou partir essa lista em blocos de tamanho decrescente para saber a que
origem cada bloco pertence, sem precisar de ler as etiquetas verticais
(rodadas 90°) que o PDF usa para o nome da origem, que o extractor de
texto simples não conseguia posicionar com fiabilidade.

| Rota | Preço (2ª classe, bilhete simples ida) |
|---|---|
| Porto → Braga | 13,55 € |
| Porto → Viana do Castelo | 13,55 € |
| Porto → Aveiro | 13,55 € |
| Porto → Coimbra | 15,25 € |

O hash do PDF (`HASHES_CP`) não mudou desde a última leitura, por isso
manteve-se o mesmo.

### Lisboa → Porto, a 01 de Setembro: a rota que faltava no tarifário

Ao ler a tabela em cascata para as tarifas do Porto (secção anterior),
reparou-se que o mesmo PDF já continha a tarifa Lisboa-Porto, dentro do
bloco de origem Lisboa, e que nunca tinha sido levada para `TARIFAS_CP`.
É a rota doméstica mais pesquisada do país e ambas as cidades têm
aeroporto, por isso não passa pela Fase 2, mas o bloco «Ir por terra»
mostra-a sempre que o utilizador marcar comboio, aeroporto ou não.

| Rota | Preço (2ª classe, bilhete simples ida) |
|---|---|
| Lisboa → Porto | 28,05 € |

### Ronda das «só operador», a 01 de Setembro: 17 para 10

Sete cidades saíram de «só operador» para confirmadas, cada uma com uma
fonte diferente do problema original:

| Cidade | Estava | Ficou |
|---|---|---|
| Ponta Delgada | Página da AzoresBus em JavaScript, sem preços | Confirmada por outra rede: a Mini BUS da Câmara Municipal (só a cidade, linhas C e D), com página estática e datada; bilhete de bordo 0,50 €, pré-comprado 10 viagens 4,00 €. A AzoresBus (rede de toda a ilha de São Miguel) continua sem tarifário confirmado |
| Reiquiavique | Página inicial sem preços | Achada a página real de preços (`/en/store/pricing`, não ligada da página inicial); bilhete simples 690 ISK, passe de 30 dias 12.000 ISK |
| Fortaleza | Página institucional da ETUFOR sem tarifa nenhuma | Confirmada por cobertura jornalística especializada em transportes (sete órgãos noticiaram o mesmo reajuste): passagem inteira 5,40 R$ desde 1/01/2026 |
| Nice | Página inicial sem preços | Achado o Guide des tarifs em PDF, edição de Agosto de 2026, ligado a partir de «Titres et tarifs»; Solo 1 voyage 1,70 €, Pass 1 jour 7 € |
| Sevilha | Site da TUSSAM atrás de verificação anti-bot (continua bloqueado) | Confirmada por duas fontes jornalísticas independentes: uma subida de tarifário de Julho de 2025 que excluiu explicitamente o Billete Univiaje (ficou nos 1,40 €), e uma proposta de nova subida (1,50 €) que em Janeiro de 2026 ainda não estava aprovada |
| Oslo | Página da Ruter em JavaScript, sem preços | Só se confirmou parcialmente: o passe de 30 dias (805 kr, zona 1), pelo comunicado oficial da subida anual de preços. O bilhete avulso não se achou em nenhuma fonte estática |
| Bragança | Sem entrada (achada na ronda anterior, ainda sem valores) | O STUB é gratuito para toda a população desde a pandemia; confirmado indirectamente (não há declaração directa de 2026, mas uma reportagem de Junho de 2026 sobre o plano de mobilidade do concelho, já sob o executivo actual, descreve o serviço em detalhe sem mencionar tarifa nenhuma) |

Duas cidades ficaram bloqueadas pela política de rede deste ambiente, não
pelos dados: `rodalentejo.pt` (Beja) e `vamus.pt` (Faro) devolvem 403 do
proxy por não estarem na lista de hosts permitidos, não do site em si.
Vila Real e Portalegre continuam com tarifário só em JavaScript, sem PDF
alternativo achado, tal como já se tinha confirmado numa ronda anterior.
