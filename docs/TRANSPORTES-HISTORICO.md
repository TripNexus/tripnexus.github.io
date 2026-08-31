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
