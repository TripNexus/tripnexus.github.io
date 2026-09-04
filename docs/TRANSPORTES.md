# Tarifas de transportes: como se mantêm

Os passes e bilhetes de transporte no destino são o único preço do site que
não vem de uma API. Vêm daqui, de uma tabela em `assets/js/data.js`
(`TRANSPORTES_DESTINO`), e por isso alguém tem de os ir confirmar.

Este documento diz quem, quando e como.

## Porque é que isto é uma tabela e não uma consulta

Não há API de tarifas urbanas. Cada cidade tem o seu operador, e nenhum deles
publica os preços num formato que se possa consultar. O que existe é a página
de tarifário de cada um, em HTML, feita para pessoas.

Isso não é mau: ao contrário de um voo, uma tarifa urbana **muda uma ou duas
vezes por ano**, quase sempre a 1 de Janeiro, e com aviso. Uma tabela
conferida com regularidade é uma representação honesta desta realidade. O que
não é honesto é uma tabela conferida uma vez e esquecida, que foi o que
tínhamos: em Agosto de 2026 ainda mostrávamos um passe de 72 h de Viena que
tinha sido **extinto a 1 de Janeiro** desse ano.

## Os três estados de uma cidade

| Estado | O que o site mostra | Como fica na tabela |
|---|---|---|
| Com tarifas | preços, perfis de utilização e o total da viagem | `bilhetes: [...]` com valores |
| Só operador | quem opera, tarifário oficial, onde comprar, **sem preços** | `bilhetes: []` |
| Sem operador | uma procura, e mais nada | a cidade não está na tabela |

O estado do meio é deliberado, e é a diferença entre este sistema e o
anterior. Uma cidade cujo valor não conseguimos confirmar não desaparece: dá
na mesma ao utilizador o operador e a ligação para comprar. Só não lhe dá um
número que não fomos ver.

## Campos de proveniência

```js
'Viena': {
  operador: 'Wiener Linien',
  url:      'https://…',        // tarifário oficial
  comprar:  'https://…',        // onde se compra em linha (facultativo)
  actualizado: '2026-08-24',    // o DIA em que alguém foi lá ver
  fonte:    'https://…',        // a página onde o valor foi lido
  moeda:    'EUR',              // ausente = EUR
  bilhetes: [ … ]
}
```

`actualizado` **não é o ano da tarifa**, é o dia da conferência. É a
diferença entre «esta é a tarifa de 2026» e «fui ver isto a 24 de Agosto».
Só a segunda permite saber se a informação envelheceu.

Cada bilhete pode ainda levar `url`, para quando o título se compra numa
página própria; sem ele, o botão «Comprar» usa o `comprar` da cidade.

## A ronda mensal

`TRANSPORTES_REVISAO_DIAS` está em **30 dias**. Passado esse prazo o site
deixa de dizer «✅ Confirmado a …» e passa a dizer «⚠️ … pode ter mudado
desde então», a amarelo, com a ligação ao operador. O utilizador vê o aviso;
não fica a pensar que o número é de hoje.

```
node ferramentas/transportes.js          # o que está por rever
node ferramentas/transportes.js --url    # só os endereços, para a ronda
node ferramentas/transportes.js --csv    # tudo, para uma folha de cálculo
```

Para cada cidade da lista 1:

1. abrir o `url` (é o tarifário oficial, não uma procura);
2. conferir cada bilhete que está na tabela, **incluindo se ainda existe**;
3. corrigir o que mudou, apagar o que foi extinto;
4. pôr `actualizado` na data de hoje e `fonte` na página que leu;
5. correr `node ferramentas/transportes.js` outra vez para confirmar que a
   cidade saiu da lista.

Uma cidade que não mudou nada leva na mesma data nova: o que se está a
registar é a conferência, não a alteração.

## O tarifário da CP (rotas, não cidades)

O `TARIFAS_CP` (assets/js/data.js) é parecido, mas é outra coisa: não são
transportes locais dentro de uma cidade, são bilhetes de comboio entre um
par de cidades, lidos dos PDFs de preços que a CP publica por linha. Não
tem estado «só operador»: ou a rota está na tabela com preço real, ou não
está, e o bloco «Ir por terra» di-lo.

```
node ferramentas/tarifas-cp.js   # compara o hash de cada PDF ao que está guardado
```

Corre-se na mesma ronda mensal. Um PDF cujo hash mudou não diz o que
mudou, só que a CP publicou algo novo: reabra-se com `ferramentas/ler.py`
ou pymupdf (ver secção seguinte), reconfira-se o valor da rota, e
actualize-se `TARIFAS_CP` (o preço e o `actualizado`) e `HASHES_CP` (o
hash novo) em conjunto. Um hash desactualizado sem o preço reconferido não
serve de nada.

## Regras que não se quebram

**Não se inventa um número.** Se a página do operador não for clara, ou se as
fontes se contradisserem, a cidade fica em «só operador». Um valor errado é
pior do que valor nenhum, porque o utilizador conta com ele.

**Não se inventa um endereço.** O `url` é o que o operador publica. Foi um
caminho inventado que pôs a Discover Cars numa «Página não encontrada», e o
mesmo erro numa tarifa manda o utilizador a lado nenhum quando ele mais
precisa. Na dúvida, a raiz do domínio do operador.

**200 não quer dizer página certa.** Sondar o código HTTP apanha as ligações
mortas e mais nada. O Porto esteve com `metrodoporto.pt/pages/357`, que
responde 200 alegremente e é a página do capital social da empresa: uma
ligação viva a apontar ao sítio errado, que nenhuma sondagem automática
apanha. O tarifário é o `pages/287`. Antes de guardar um `url`, confirme que
a página tem lá preços: o `sondar.py` conta-os na coluna `precos=`, e um
`precos=0` numa página que devia ser um tarifário é sinal de que ou é a
página errada, ou monta os valores em JavaScript.

**Fontes secundárias não chegam.** Sites de turismo e guias de cidade copiam
uns dos outros e ficam desactualizados. Servem para *encontrar* a página do
operador; não servem como fonte do valor. Nesta revisão apanhámos, só nas
primeiras cidades, Estocolmo a ser dada como 42 e 43 SEK, Oslo como 155, 137
e «pouco mais de 130» NOK, e Munique como 9,70 e 9,90 €: todas de guias, e
todas irreconciliáveis sem abrir o tarifário. A de Estocolmo ficou resolvida
na ronda de 30 de Agosto, na página da SL: são 43.

**Moeda que não seja o euro não entra no total.** O bloco mostra os valores,
mas o `custoTransportesReais()` ignora-os: somar coroas a euros dava um
número sem sentido. O bloco di-lo na linha do operador.

## Como se lê um tarifário desta caixa

O ambiente passou a ter **Network access: Full**, mas nem tudo atravessa:

| Via | Funciona | Nota |
|---|---|---|
| `curl` | **sim** | é por aqui que se lê |
| WebFetch | não | tem lista de saída própria, que o ambiente não muda |
| Chromium / Playwright | não | bloqueado no sandbox, não na política de rede: falha igual com e sem proxy, com e sem `--no-sandbox`, e com o DNS encaminhado para o proxy |

Numa máquina normal (por exemplo, o `claude` a correr no computador de
casa) o Chromium funciona e este limite desaparece. As páginas em JavaScript
resolvem-se aí.

Como o Chromium não passa, páginas que montem a tabela de preços em
JavaScript saem sem números. Isso vê-se (o `ler.py` diz «o padrão não casou»)
e trata-se procurando a página que serve os preços em HTML, uma versão para
imprimir, ou o PDF do tarifário. **Não se adivinha.**

```
python3 ferramentas/ler.py <url> "<padrão>"
python3 ferramentas/ler.py <url> --linhas 418-448
```

Despeja o texto legível da página, filtrado por uma expressão regular, com
duas linhas de contexto de cada lado. O `--linhas` despeja um intervalo pelo
número que a própria ferramenta imprime, que é o que se usa quando o padrão
acha a secção certa mas os preços estão nas linhas a seguir. É assim que os valores abaixo foram
lidos: na página do operador, não num guia de viagens.

Há operadores que respondem **403** ao `curl` (TfL, MTA, Île-de-France
Mobilités, Tokyo Metro, TUSSAM): bloqueiam agentes automáticos. Esses ficam
para uma ronda feita à mão, num navegador normal.

### A ronda em navegador, feita a 30 de Agosto de 2026

Essa ronda fez-se. Num computador comum, com o Chromium do Playwright a
abrir cada página como um visitante qualquer, as 21 cidades que a caixa não
conseguia ler foram todas visitadas. O que se aprendeu, para a próxima vez:

- **O Chromium de origem não chega para tudo.** O MTA respondeu `403 Access
  Denied` até ao Chromium do Playwright; só passou com o Chrome instalado na
  máquina (`chromium.launch({channel:'chrome'})`). Quem repetir isto deve
  começar já pelo canal `chrome`.
- **Nem tudo o que está em JavaScript está na página certa.** O
  istanbulkart.istanbul desenha o corpo vazio mesmo num navegador real, e a
  página de tarifário da İETT tem os títulos das secções e nenhum número.
  Quem publica os preços de Istambul em HTML é o Metro İstanbul. A resposta
  a um `bilhetes:[]` teimoso costuma ser outra página, não mais espera.
- **Formulários e acordeons contam como JavaScript.** Estocolmo, Melbourne e
  Palma só deram os números depois de se abrir um acordeão ou de se seguir
  uma sub-página; a HSL e a TfL escondem-nos atrás de selectores.
- **O PDF do operador é fonte de primeira.** Foi assim que saíram os tectos
  de Londres (`adult-fares.pdf`) e a grelha de Lyon
  (`Guide_Tarifaire_TCL_Mai_2026.pdf`), depois de as páginas em HTML se
  recusarem a mostrar valores. Um PDF publicado pelo operador vale tanto
  como a página dele.
- **Um navegador real não vence uma verificação de bot.** O TUSSAM de Sevilha
  responde com o desafio da Cloudflare e não o larga, com ou sem interface.

### A ronda por `curl`, feita a 31 de Agosto de 2026

Voltou-se às 24 cidades «só operador», desta vez sem navegador, só com o
que o ambiente desta caixa dá: `curl`, `ferramentas/achar.py` e o
`WebSearch` para achar operadores novos. O que se aprendeu:

- **Um `url` guardado pode ter deixado de existir.** A raiz do
  `buenosaires.gob.ar/subte` passou a redireccionar para
  `gcaba_historico`, o arquivo da Cidade: as tarifas lá eram antigas por
  definição. A fonte certa passou a ser a Secretaria de Transporte
  (`argentina.gob.ar`), que publica a tabela de todo o transporte da AMBA.
  O mesmo aconteceu ao `url` da ANM de Nápoles, que dá 404 e reencaminha
  para uma página de início de sessão.
- **Uma nota antiga pode estar incompleta, não errada.** O RMV de
  Frankfurt tinha ficado registado como «só dá o preço no planeador», por
  dizer isso mesmo na página do bilhete simples. A mesma página, mais
  abaixo, tinha uma excepção: a tarifa própria da cidade (zona 5000), fixa.
  A lição: quando uma página diz que não há tabela, vale a pena ler até ao
  fim antes de aceitar isso.
- **Uma tabela de preços pode estar espalhada por várias páginas
  paginadas.** O tarifário da RTM de Marselha tem 160 produtos em 5
  páginas (`?page=1` a `?page=5`), sem um único URL com tudo. O bilhete
  avulso (1,70 €) estava na página 2; o CityPass turístico, só a versão de
  criança apareceu, nunca a de adulto, apesar de as 5 páginas darem os 160
  produtos completos, e por isso ficou de fora.
- **Nem todo o PDF tem texto.** O PDF de tarifário da RTM de Marselha
  (`rtm_grille_tarifaire.pdf`) é um cartaz com a grelha de preços desenhada
  como imagem: a extracção de texto devolveu duas linhas soltas (14,00 € e
  6,70 €, tarifas de navete) e mais nada. A regra «PDF é fonte de
  primeira» só vale quando o PDF tem texto a sério, não uma imagem dentro
  de um PDF.
- **Um operador achado por pesquisa não é o mesmo que uma tarifa achada
  por pesquisa.** A ronda achou operadores novos, nunca antes na tabela,
  por `WebSearch`: a AzoresBus de Ponta Delgada (a operar desde Setembro
  de 2025), a ETUFOR de Fortaleza e a ALSA de Marraquexe. O nome do
  operador é fácil de confirmar por várias fontes independentes a dizerem
  o mesmo; um valor em euros não é: por isso entrou o operador, mas não o
  preço, nestas três.
- **`.gob.mx` está bloqueado ao nível do ambiente, não só a Cidade do
  México.** Uma segunda tentativa, desta vez ao `imoveqroo.gob.mx`
  (Cancún), devolveu `connect_rejected`, com a mensagem do proxy a dizer
  «organization policy»: não é um problema do sítio, é uma política desta
  caixa a barrar o domínio `.gob.mx` inteiro. Não vale a pena voltar a
  tentar nenhum sítio deste domínio a partir daqui.
- **Autoridades de turismo confirmam tectos de gasto, não tarifas por
  bilhete.** O Visit Qatar (o organismo oficial de turismo do Catar, não o
  operador do metro) confirma um tecto de 6 QAR por dia, mas nunca o preço
  de uma viagem avulsa: o próprio Qatar Rail recusou o `curl`. Fica o
  tecto, no mesmo espírito do fare cap de Auckland, sem inventar o preço
  do bilhete.

## Estado em 03 de Setembro de 2026

268 cidades no site. Começámos, na primeira ronda, com 17 na tabela e
nenhuma com data de conferência.

A partir daqui, a lista de cidades já não é uma lista fechada: está a
crescer por um projecto à parte (capitais do mundo, ver a secção
seguinte), por isso a coluna «Sem operador» passa a mostrar só a
contagem, não os nomes todos: a lista completa está sempre em
`assets/js/data.js` (`CIDADES`).

| | Cidades | |
|---|---:|---|
| Com tarifas **confirmadas** | 193 | ver `node ferramentas/transportes.js` para a lista completa; cresce lote a lote na fase 2 (ver secção abaixo), deixou de caber aqui |
| Com tarifas **por reconferir** | 0 | nenhuma |
| **Só operador**, sem valores | 39 | ver `node ferramentas/transportes.js`; cresce lote a lote, deixou de caber aqui |
| **Sem operador** | 36 | ver `CIDADES` em `assets/js/data.js` |

### As 14 cidades acrescentadas a 03 de Setembro: aeroportos que faltavam

Um utilizador reportou que faltavam vários aeroportos. A lista de cidades
nunca pretendeu ser exaustiva, mas cruzá-la com a rede real de destinos da
TAP (a companhia de bandeira, o sinal mais objectivo de que uma cidade
devia estar aqui) mostrou lacunas genuínas: Bissau e São Tomé (destinos
lusófonos com voo TAP directo, que fazia todo o sentido incluir num site
deste género), Chicago e Washington D.C. (faltavam dos EUA), Bilbau e
Santiago de Compostela (Espanha), Brasília e Belo Horizonte (Brasil),
Dakar, Acra e Argel (África, rede da TAP), Luxemburgo, Bolonha e Mindelo
(São Vicente, Cabo Verde).

Todos os códigos IATA e coordenadas foram verificados um a um contra
fontes de aviação (Wikipédia, sites de aeroportos). Os nomes em português
seguem o exónimo corrente onde a TAP/Wikipédia só lista o nome inglês:
Bilbau, Acra, Argel, Bolonha (o mesmo critério já usado para Londres ou
Genebra); `WIKI_EN` (data.js) ganhou as formas inglesas correspondentes,
para as pesquisas de alojamento (anglófonas) continuarem a encontrar a
cidade certa.

Não é a lista completa da TAP: ficam de fora dezenas de rotas menores
(sobretudo no Brasil e na rede regional espanhola/francesa/alemã), que
podem entrar numa próxima ronda. Estas 14 entram só em `CIDADES`, sem
transportes locais confirmados (ficam em «sem operador», como qualquer
cidade nova): é matéria para uma ronda de transportes à parte, não desta.

### O projecto das capitais do mundo, a partir de 03 de Setembro

Depois das 14 da TAP, pediu-se para não ficar por aí: acrescentar todas
as capitais de países soberanos que ainda faltam, por lotes, cada um
testado e enviado como o seu próprio PR antes do seguinte. O critério é
a lista de estados-membros da ONU (193) mais os dois observadores
(Vaticano, Palestina), cerca de 195 países, dos quais o site cobria
antes só 56. Cada capital entra com a cidade que serve na prática o
tráfego aéreo internacional do país, não necessariamente o nome
constitucional da capital, quando os dois divergem (por exemplo: a Costa
do Marfim tem Yamoussoukro como capital de jure mas Abidjan como sede de
facto do governo e o aeroporto internacional real; a Bolívia tem Sucre
como capital constitucional mas La Paz como sede do governo e do
aeroporto principal). Além disso, sete países já tinham uma cidade no
site, mas não a capital (por exemplo, a Suíça só tinha Zurique e
Genebra, não Berna): essas capitais entram também, como cidades
adicionais, no Lote 6, mais abaixo.

Capitais sem nenhum aeroporto comercial (Andorra, Listenstaine, São
Marinho, Vaticano) não entram: inventar uma ligação a um aeroporto
vizinho, fora do próprio país, seria o erro inverso ao que se corrigiu
para Bragança/Vila Real/Viseu no início desta série. Fica anotado caso a
caso em `data.js`, não escondido.

**Lote 1, 03 de Setembro: capitais da Europa (20 cidades).** Países
europeus que ainda não tinham nenhuma cidade no site: Tirana (Albânia),
Minsk (Bielorrússia), Sarajevo (Bósnia e Herzegovina), Sófia (Bulgária),
Nicósia (Chipre), Bratislava (Eslováquia), Liubliana (Eslovénia), Taline
(Estónia), Tbilisi (Geórgia), Riga (Letónia), Vilnius (Lituânia),
Escópia (Macedónia do Norte), Valeta (Malta), Chisinau (Moldova),
Mónaco, Podgorica (Montenegro), Bucareste (Roménia), Moscovo (Rússia),
Belgrado (Sérvia), Kiev (Ucrânia). Nota sobre Kiev: o espaço aéreo
ucraniano está fechado a voos civis desde 2022; como os preços de voo
vêm de uma fonte real (Travelpayouts/Aviasales), a pesquisa aqui
simplesmente não vai devolver nada em vez de inventar um preço, por isso
a entrada fica sem tratamento especial.

**Lote 2, 03 de Setembro: capitais das Américas (27 cidades).** Caraíbas
e América Central: Saint John's (Antígua e Barbuda), Nassau (Baamas),
Bridgetown (Barbados), Cidade de Belize (Belize), San José (Costa Rica),
Havana (Cuba), Roseau (Dominica), Santo Domingo (República Dominicana),
San Salvador (El Salvador), Saint George's (Granada), Cidade da
Guatemala (Guatemala), Porto Príncipe (Haiti), Tegucigalpa (Honduras),
Kingston (Jamaica), Manágua (Nicarágua), Cidade do Panamá (Panamá),
Basseterre (São Cristóvão e Neves), Castries (Santa Lúcia), Kingstown
(São Vicente e Granadinas), Porto de Espanha (Trindade e Tobago). Resto
da América do Sul: La Paz (Bolívia; capital constitucional é Sucre, mas
La Paz é a sede do governo e tem o aeroporto principal), Quito
(Equador), Georgetown (Guiana), Assunção (Paraguai), Paramaribo
(Suriname), Montevideu (Uruguai), Caracas (Venezuela).

Nomes em português: onde o nome inglês/espanhol/francês diverge
bastante, usa-se o que já é corrente em português (Manágua, Montevideu,
Assunção, Porto Príncipe, Cidade do Panamá, Cidade da Guatemala, Cidade
de Belize, Porto de Espanha); `WIKI_EN` ganhou as formas correspondentes
para as pesquisas de alojamento continuarem a encontrar a cidade certa.
Um dos códigos de aeroporto apareceu, numa primeira pesquisa, com o
hemisfério trocado (o aeroporto de Quito, dado como a norte do equador
em vez de a sul); confirmado contra uma segunda fonte antes de entrar.

**Lote 3a, 03 de Setembro: capitais de África, primeira metade (23
cidades).** Cotonou (Benim), Gaborone (Botsuana), Ouagadougou (Burquina
Faso), Bujumbura (Burundi), Yaoundé (Camarões), Bangui (República
Centro-Africana), N'Djamena (Chade), Moroni (Comores), Brazzaville
(Congo), Kinshasa (República Democrática do Congo), Jibuti, Malabo
(Guiné Equatorial), Asmara (Eritreia), Manzini (Essuatíni), Adis Abeba
(Etiópia), Libreville (Gabão), Banjul (Gâmbia), Conacri (Guiné), Abidjan
(Costa do Marfim), Nairóbi (Quénia), Maseru (Lesoto), Monróvia
(Libéria), Trípoli (Líbia).

Dois casos onde a capital constitucional não tem o aeroporto
internacional real do país, e por isso não é a cidade que entra: a
**Guiné Equatorial** mudou a capital oficial para Ciudad de la Paz em
Janeiro de 2026, mas o aeroporto de lá só liga a Malabo (voo doméstico),
sem ligação internacional directa: Malabo continua a ser a porta de
entrada real, por isso fica ela; o **Essuatíni** tem Mbabane como
capital administrativa, mas o aeroporto internacional (Matsapha) fica
junto a Manzini, por isso a cidade é Manzini, para não sugerir uma
ligação que o aeroporto não tem.

**Lote 3b, 03 de Setembro: capitais de África, segunda metade (21
cidades).** Antananarivo (Madagáscar), Lilongwe (Malawi), Bamako (Mali),
Nouakchott (Mauritânia), Port Louis (Maurícia), Rabat (Marrocos),
Windhoek (Namíbia), Niamey (Níger), Abuja (Nigéria), Kigali (Ruanda),
Victoria (Seicheles), Freetown (Serra Leoa), Mogadíscio (Somália), Juba
(Sudão do Sul), Cartum (Sudão), Dar es Salaam (Tanzânia), Lomé (Togo),
Tunes (Tunísia), Entebbe (Uganda), Lusaka (Zâmbia), Harare (Zimbabué).

Rabat entra separada de Casablanca e Marraquexe, que já estavam no site
mas não eram a capital de Marrocos. Mais dois casos de aeroporto fora da
capital administrativa: o **Uganda** tem Kampala como capital, mas o
aeroporto internacional é o de Entebbe, cidade distinta; a **Tanzânia**
tem Dodoma como capital oficial, mas quem tem o aeroporto internacional
real é Dar es Salaam, que continua a ser a porta de entrada do país.
Com África completa, fecham-se estes dois lotes com todas as 44
capitais africanas que faltavam.

**Lote 4a, 03 de Setembro: capitais do Médio Oriente e Ásia Central (19
cidades).** Cabul (Afeganistão), Yerevan (Arménia), Baku (Azerbaijão),
Manama (Barém), Teerão (Irão), Bagdade (Iraque), Telavive (Israel), Amã
(Jordânia), Astana (Cazaquistão), Cidade do Kuwait, Bisqueque
(Quirguistão), Beirute (Líbano), Mascate (Omã), Riade (Arábia Saudita),
Damasco (Síria), Dushanbe (Tajiquistão), Asgabate (Turquemenistão),
Tasquente (Usbequistão), Sanaa (Iémen).

Damasco, Cartum (lote 3b) e Kiev (lote 1) partilham a mesma nota: o
preço de voo vem de uma fonte real (Travelpayouts/Aviasales), por isso
uma pesquisa a um destino sem voos correntes (guerra, sanções,
instabilidade) simplesmente não devolve nada em vez de inventar um
preço, honesto por omissão, sem tratamento especial na entrada.

**Lote 4b, 03 de Setembro: capitais do Sul e Sudeste Asiático (14
cidades).** Daca (Bangladesh), Paro (Butão), Bandar Seri Begawan
(Brunei), Phnom Penh (Camboja), Vienciana (Laos), Malé (Maldivas), Ulã
Bator (Mongólia), Rangum (Myanmar), Catmandu (Nepal), Pyongyang (Coreia
do Norte), Islamabad (Paquistão), Manila (Filipinas), Colombo (Sri
Lanka), Dili (Timor-Leste). Com este lote e o 4a, fecha-se a Ásia: não
falta nenhuma capital do continente.

Um caso de capital administrativa sem o aeroporto internacional real: o
**Myanmar** tem Naypyidaw como capital desde 2005, mas quem tem o
aeroporto internacional é Rangum (Yangon), mesma lógica já aplicada a
Uganda e Tanzânia. A **Coreia do Norte** partilha a nota de
Damasco/Cartum/Kiev: tem muito poucas ligações internacionais (a
companhia estatal Air Koryo não está nos sistemas de reserva
habituais), por isso uma pesquisa a Pyongyang simplesmente não devolve
resultados, sem tratamento especial.

Nomes em português: Daca, Vienciana, Ulã Bator e Catmandu são os
exónimos correntes (confirmados na Wikipédia e na Infopédia em
português), diferentes do nome inglês Dhaka/Vientiane/Ulaanbaatar/
Kathmandu; Rangum é o nome histórico ainda em uso em português para
Yangon, incluindo depois da mudança de nome pela junta militar em 1989.
`WIKI_EN` ganhou as formas inglesas correspondentes. Nota à parte sobre
a Mongólia: o código IATA antigo (ULN) ficou preso ao aeroporto antigo,
hoje sem voos comerciais; o aeroporto novo, Chinggis Khaan (2021), usa
o código UBN, confirmado contra várias fontes por haver confusão
generalizada online entre os dois.

**Lote 5, 03 de Setembro: capitais da Oceânia (12 cidades).** Nadi
(Fiji), Tarawa (Quiribáti), Majuro (Ilhas Marshall), Pohnpei
(Micronésia), Yaren (Nauru), Koror (Palau), Port Moresby (Papua-Nova
Guiné), Apia (Samoa), Honiara (Ilhas Salomão), Nuku'alofa (Tonga),
Funafuti (Tuvalu), Port Vila (Vanuatu). Fecha-se aqui o projecto: já não
falta nenhuma capital de nenhum continente.

Três casos onde a capital oficial não tem o aeroporto internacional
real, mesma lógica já usada em África e na Ásia: **Fiji** tem Suva como
capital, mas 97% do tráfego internacional passa por Nadi, não pelo
aeroporto de Suva; **Palau** tem Ngerulmud (em Melekeok) como capital
desde 2006, mas o aeroporto fica em Koror, a antiga capital, ainda o
destino a que todas as fontes de viagem associam o código ROR; a
**Micronésia** tem Palikir como capital, sem aeroporto próprio, servida
pelo aeroporto de Pohnpei a 10 km, junto a Kolonia.

**Nauru** é um caso à parte: é a única república do mundo sem capital
oficial. Yaren, onde ficam o governo e o aeroporto, funciona como
capital de facto, por isso é a que entra aqui.

**Lote 6, 03 de Setembro: as sete capitais em falta de países que já
tinham outra cidade no site (7 cidades).** Berna (Suíça, que só tinha
Zurique e Genebra), Ancara (Turquia, só tinha Istambul), Abu Dhabi
(Emiratos Árabes Unidos, só tinha Dubai), Ottawa (Canadá, só tinha
Toronto e Montreal), Jacarta (Indonésia, só tinha Bali), Camberra
(Austrália, só tinha Sydney e Melbourne), Wellington (Nova Zelândia, só
tinha Auckland). Ficou anotado desde o Lote 1 que estas sete entravam
numa próxima ronda; entram aqui, a fechar o projecto por completo: já
não falta nenhuma capital soberana em falta em lado nenhum.

### A ronda das cidades sem aeroporto, feita a 31 de Agosto de 2026

Esta ronda não veio da revisão mensal: veio de uma funcionalidade nova, as
viagens nacionais para cidades portuguesas sem aeroporto comercial (ver o
`semAeroporto:true` em `data.js` e o histórico de features do site). Passar
Coimbra, Aveiro, Guarda e Covilhã a poderem ser pesquisadas como destino
tornava-as candidatas naturais a esta tabela, e a pesquisa ficou por
descobrir mais oito cidades no mesmo caso (os distritos-capital do
continente sem aeroporto: Braga, Castelo Branco, Évora, Leiria, Portalegre,
Santarém, Setúbal, Viana do Castelo) mais Beja, que tem aeródromo mas sem
voos comerciais regulares.

- **Uma cidade pode ter várias empresas com o mesmo tarifário.** Leiria e
  Santarém são operadas por marcas diferentes (Mobilis/Rodoviária do Lis;
  Scalabus/RodoLeziria) do mesmo grupo (Rodoviária do Tejo), cada uma com o
  seu PDF «Aumento tarifário 2026» publicado a 29/12/2025. Achá-los exigiu
  descobrir primeiro o grupo por trás da marca visível na cidade: o
  operador que aparece nos autocarros nem sempre é quem publica o
  tarifário.
- **Um `http://` pode estar bloqueado onde o `https://` do mesmo domínio não
  está.** O `www.rodotejo.pt` recusou os PDFs por `http://` com
  `403 Host not in allowlist`; o mesmo caminho por `https://` respondeu
  200. Vale a pena tentar as duas variantes antes de desistir de um
  endereço.
- **Um PDF de tarifário pode vir com as colunas fora de ordem no texto
  simples.** O `smtuc.pt` e o `covilhamobilidade.pt` (via Transdev) davam
  nomes de título e depois todos os preços em bloco, sem correspondência
  óbvia entre uns e outros no texto corrido. Resolveu-se lendo o PDF com
  `pymupdf` em modo `blocks`, que devolve a posição (x, y) de cada bloco de
  texto: ordenar por posição reconstrói a tabela como está desenhada na
  página, não como o extractor de texto a devolveu.
  ```
  page.get_text('blocks')  # cada bloco vem com (x0, y0, x1, y1, texto)
  ```
- **A data escrita no documento não é o mesmo que a data em que o preço
  está em vigor.** O tarifário urbano de Beja que se achou está datado de
  julho de 2025; todos os outros operadores portugueses subiram os preços
  a 1 de Janeiro de 2026 (taxa nacional de actualização de 2,28 %, fixada
  pela AMT). Sem uma versão 2026 confirmada para Beja, e sem forma de saber
  se o aumento nacional já lá está reflectido, a cidade ficou em «só
  operador»: mostrar os números de 2025 como actuais arriscava um valor
  errado. O mesmo aconteceu a Portalegre, cuja página diz no rodapé
  «Atualizado em 19/01/2023».
- **Um aumento de tarifa pode ser anunciado antes de a página do operador o
  reflectir.** O `backoffice.carrismetropolitana.pt` (Setúbal) ainda
  mostrava os valores de 2025 (1,25 € / 4,50 €); a confirmação do aumento
  para 2026 (1,30 € / 4,65 €) veio de uma notícia da Lisboa Para Pessoas,
  publicada a 30/12/2025, com fonte no regulador (AMT) e nas próprias
  operadoras. Uma notícia datada, com números específicos e a citar a
  fonte regulatória, é mais fiável aqui do que a página institucional que
  ainda não foi actualizada.
- **Das treze cidades desta ronda, onze ficaram com preço confirmado**: as
  quatro da Fase 1 (Coimbra, Aveiro, Guarda, Covilhã) mais sete dos oito
  distritos-capital novos (Braga, Castelo Branco, Évora, Leiria, Santarém,
  Setúbal, Viana do Castelo); só Beja e Portalegre, pelas razões acima,
  ficaram em «só operador».

Das 21 cidades que a ronda em navegador foi buscar, **18 ficaram com
preços**: doze que já cá estavam e seis que nem sequer apareciam na
tabela. Uma passou a ter operador e ligação (Frankfurt) e duas ficaram
como estavam (Sevilha e Cidade do México). Milão e Singapura, fora do
âmbito dessa ronda, foram confirmadas a seguir, a 30 de Agosto.

A 31 de Agosto, uma ronda inteira por `curl` (sem navegador) foi às 24
cidades que ainda estavam «só operador» e a algumas das 20 «sem
operador»: **17 ficaram com preços confirmados**, uma revelou-se afinal
com tarifa fixa numa excepção da mesma página que antes só parecia ter um
planeador de percurso (Frankfurt), e quatro entraram na tabela pela
primeira vez com operador achado por pesquisa (Fortaleza, Ponta Delgada,
Marraquexe e Doha, ainda sem preço confirmado nas três últimas). O
registo cidade a cidade fica no histórico.

### Sobre os bloqueios: mudam de um dia para o outro

O acesso a partir desta caixa não é estável. Entre a ronda de 24 e a de 30
de Agosto, sem nenhuma alteração de configuração, o MTA de Nova Iorque, o
DPP de Praga, o Istanbulkart e a EMT Palma deixaram de recusar o `curl`. Foi
assim que Porto, Berlim e Praga saíram da lista «por reconferir» nesta
ronda: não porque se tenha destrancado nada de propósito, mas porque um
operador que bloqueava ontem pode não bloquear hoje. Vale a pena voltar a
tentar as bloqueadas a cada ronda, em vez de as dar por perdidas de vez.

O que não mudou nesse intervalo foi o Chromium: continua com
`ERR_CONNECTION_RESET`, com e sem proxy, exactamente como antes. É esse
bloqueio, ao nível do sandbox e não da política de rede, que trava as
páginas que montam os preços em JavaScript, mesmo nos sítios (MTA,
Istanbulkart, EMT Palma) que já deixam o `curl` entrar.

O registo cidade a cidade de todas as correcções feitas, com as datas e as
razões, fica em [`TRANSPORTES-HISTORICO.md`](TRANSPORTES-HISTORICO.md).

### O que trava as que faltam

As duas primeiras listas da ronda anterior (páginas em JavaScript e
operadores que recusam o `curl`) resolveram-se todas no navegador, menos
duas. O que sobra é outra coisa, e não se resolve com melhor ferramenta:

- **Verificação de bot da Cloudflare**: TUSSAM de Sevilha. Não é o
  JavaScript que trava, é o desafio, e ele não cede a um navegador real.
  Fica em «só operador», com a nota a dizer ao utilizador que abra a página
  no navegador dele.
- **Domínio `.gob.mx` bloqueado pela política de rede deste ambiente**:
  Cidade do México (`cdmx.gob.mx`: `metro.`, `semovi.`, `metrobus.` e o
  `www.`, todos com `ERR_CONNECTION_TIMED_OUT`) e Cancún
  (`imoveqroo.gob.mx`, desta vez com `connect_rejected` e a mensagem do
  proxy a dizer «organization policy»). Não é um problema dos sítios: é
  esta caixa a barrar o domínio `.gob.mx` inteiro. Como não se consegue
  confirmar sequer que endereço responde, as cidades ficam **sem
  operador**: guardar uma ligação que não se abriu seria inventar um
  endereço.
- **Tarifas por distância, sem valor único**: MTR de Hong Kong, Rapid KL,
  Delhi Metro, Tokyo Metro, SBS Transit de Singapura. Aqui não há bloqueio
  nenhum: há uma tabela estação a estação ou por escalão de distância, e
  pôr «a viagem custa X» seria inventar uma média. Entram os títulos de
  preço fixo (passes, aeroporto) ou alguns escalões representativos, e a
  faixa de distância fica dita na nota.
- **Certificados que não validam** (não se desliga a verificação): Seoul
  Metro, Metro do Cairo.
- **Cidades sem rede urbana formal** ou sem operador com sítio próprio:
  Phuket, Bali, Sal, Praia, Luanda, Maputo. (Ibiza saiu desta lista: afinal
  tinha operador, a ALSA, só não tinha sido achado numa ronda anterior.)
- **Página de procura filtrada, sem tabela**: CRTM de Madrid. O tarifário
  não é uma tabela, é um formulário que só devolve mínimos agregados por
  categoria: «Sencillos y 10 viajes» dá «desde 1,50 €» a juntar o bilhete
  simples e o carnet de 10 viagens num único número, e «Billete turístico»
  dá «desde 5 €» a juntar as durações de 1 a 7 dias. Não há como separar o
  valor de cada bilhete sem simular os filtros um a um, e um mínimo
  agregado não é o preço de nenhum bilhete em concreto. Fica **por
  reconferir**, sem se carimbar uma data de hoje sobre números que não se
  confirmaram um a um.
- **Páginas em JavaScript, sem navegador nesta ronda**: a ronda de 31 de
  Agosto foi feita só por `curl`, sem a máquina com Chromium real que a
  ronda anterior usou. Ficaram por resolver a Vamus Algarve (Faro), a
  Lignes d'Azur (Nice), o portal da ANM (Nápoles, migrado para um Salesforce
  Experience Cloud desde a última ronda: o `url` antigo dá 404 e o novo
  monta tudo em JavaScript) e a UnicoCampania, a Ruter (Oslo), a Strætó
  (Reiquiavique), o BTS SkyTrain (Banguecoque), a Hanoi Metro e a AzoresBus
  (Ponta Delgada, nova nesta ronda). Ficam «só operador»; a próxima ronda em
  navegador deve começar por elas.
- **Tabela existe, mas é imagem ou widget**: Auckland Transport. A página
  diz «Bus and train ticket prices are based on how many fare zones you
  travel through» e tem uma tabela por zona, mas essa tabela não vem em
  texto simples nenhures do HTML: só o tecto de gasto (fare cap, 20 NZD por
  dia com contactless) apareceu como texto. Fica esse valor, sem inventar
  os das zonas.
- **Operador achado, preço só em fontes secundárias**: ETUFOR, em
  Fortaleza. Vários jornais e a própria Prefeitura anunciaram R$ 5,40 a
  partir de Janeiro de 2026, mas nenhuma página oficial legível ao `curl`
  tinha esse número em texto para citar como fonte. O operador entra, sem
  valor.

O `--url` do `ferramentas/transportes.js` dá a lista das que faltam,
pronta a colar num navegador.

## Fase 2, a partir de 03 de Setembro de 2026: tarifas locais para as capitais do projecto das capitais do mundo

Terminado o projecto de acrescentar todas as capitais em falta (ver a
secção acima), começa a segunda fase: dar tarifas locais reais às
cidades que entraram só como registo em `CIDADES`, sem operador nem
preços. São 167 cidades nesta fase (mais 10 já com operador, sem
tarifas), por isso avança por lotes mais pequenos do que a primeira
fase, dado o esforço de investigação por cidade ser bem maior do que
confirmar coordenadas e código IATA.

Nesta fase a investigação de várias cidades em paralelo é feita por
subagentes, cada um a cruzar fontes independentes antes de aceitar um
número; quem escreve as entradas em `data.js` (e confirma que não há
número nem URL inventados) continua a ser sempre a sessão principal.

**Lote 1, 03 de Setembro (4 cidades): Bilbau, Santiago de Compostela,
Bolonha, Luxemburgo.** Bilbau (Metro Bilbao/CTB): zona 1 com cartão
Barik a 0,95€, sem cartão a 1,60€, diário a 4,90€, confirmado por três
pesquisas cruzadas. Santiago de Compostela (Tussa): bilhete avulso a
1€ estável há anos; o bono com cartão desce para 0,36€ por viagem a
partir de Janeiro de 2026, com subsídio do governo espanhol. Bolonha
(TPER): tarifário em vigor desde Março de 2025, bilhete comprado antes
mais barato (2,30€) do que a bordo (2,50€). Luxemburgo: caso especial,
os transportes públicos são gratuitos em todo o país desde Março de
2020 (excepto a 1ª classe do comboio, sem preço confirmado); entra com
um bilhete a 0€, uma tarifa real, não a ausência de uma.

**Lote 2, 03 de Setembro (6 cidades): Tirana, Minsk, Sarajevo, Sófia,
Nicósia, Bratislava.** Tirana: tarifa geral da rede urbana (40 lekë),
subsidiada pela câmara; linhas suburbanas privadas distintas cobram
mais, não confundir. Minsk: talão do autocarro/trólei/eléctrico (1,10
BYN) e ficha do metro (1,15 BYN) são tarifas próximas mas distintas,
confirmadas por quatro fontes de imprensa independentes (os sites
oficiais não estavam acessíveis directamente). Sarajevo (GRAS): o
preço nominal subiu para 2,50 KM em Julho de 2025, mas um subsídio do
Cantão de Sarajevo mantém o valor pago pelo cidadão em 2,20 KM, que é
o que entra aqui. Sófia: tarifário unificado (metro, autocarro, tram,
trólei), passou de leva para euro a 1 de Janeiro de 2026. Nicósia
(CPT): subida de 2,40€ para 2,70€ a 3 de Agosto de 2026, sem passe
diário só a dinheiro (o único existente exige um cartão). Bratislava
(DPB): tarifário oficial sem contradição entre fontes.

**Lote 3, 03 de Setembro (14 cidades): Liubliana, Taline, Tbilisi,
Riga, Vilnius, Escópia, Valeta, Chisinau, Mónaco, Podgorica, Bucareste,
Moscovo, Belgrado, Kiev.** Fecha as capitais europeias do Lote 1 do
projecto das capitais do mundo. Casos com nota: Taline e Valeta são
gratuitas só para residentes registados, o preço que entra é sempre o
que um visitante paga. Belgrado é o inverso: os transportes urbanos e
suburbanos normais são gratuitos desde Janeiro de 2025 (medida
confirmada por várias fontes, incluindo o anúncio oficial), só as
linhas de minibus expresso (aeroporto, linhas E) continuam pagas.
Moscovo tem preço a variar com o meio de pagamento (mais barato por
biometria, mais caro por cartão bancário sem Troika); entra o valor do
cartão Troika, o mais comum. Kiev: o metro e os autocarros continuam
operacionais apesar da lei marcial, sem relação com a falta de voos
internacionais (essa já estava tratada à parte). **Bucareste** ficou só
com o operador: as fontes jornalísticas davam valores diferentes (7, 9,
12, 14 ou 18 lei, conforme a fonte e a data, com sucessivas subidas
anunciadas entre Setembro de 2025 e Maio de 2026) sem forma clara de
saber qual estava em vigor à data da verificação, por isso não se
escolheu nenhum.

**Lote 4, 03 de Setembro: Caraíbas e América Central (12 cidades com
tarifa, 3 só operador, 4 de fora).** Nassau, Bridgetown, Havana,
Roseau, Santo Domingo, San José (só operador), San Salvador (só
operador), Cidade da Guatemala, Tegucigalpa (só operador), Kingston,
Manágua, Cidade do Panamá. Muitas destas cidades não têm uma empresa
municipal única, mas sim redes de minibus/autocarros privados
regulados por um organismo do Estado (ARESEP na Costa Rica, VMT em El
Salvador, IHTT em Honduras, IRTRAMMA em Manágua): quando o organismo
regulador existe e é citável, entra como operador, mesmo sem tarifa
única (San José, San Salvador, Tegucigalpa: preço varia por rota/
empresa, sem valor citadino confirmável).

Quatro cidades ficaram de fora nesta ronda, sem entrada nenhuma: Saint
John's (Antígua e Barbuda), Cidade de Belize, Saint George's (Grenada)
e Porto Príncipe (Haiti). Nestas não há operador formal identificável
nem uma fonte oficial citável (só blogues de viagem ou tarifários
informais, com cumprimento variável no terreno); nenhuma entra ainda,
para não inventar um operador ou um preço que na prática ninguém
garante.

Casos com nota: Roseau e Nassau, apesar de terem tarifário
governamental, dependem de minibus privados individuais, com relatos de
cobrança inconsistente. Santo Domingo e Cidade da Guatemala têm dois
sistemas distintos em paralelo (Metro/Teleférico + OMSA; Transmetro +
TuBus), cada um com tarifa própria. Cidade do Panamá: PAB (balboa) tem
paridade fixa 1:1 com o dólar americano.

**Lote 5, 03 de Setembro: América do Sul, México e Peru (9 cidades com
tarifa, 2 só operador, 1 de fora).** La Paz, Quito, Assunção,
Montevideu, Caracas, Brasília, Belo Horizonte, Cidade do México, Lima
entram com tarifas confirmadas; Cancún (fontes contraditórias sobre o
valor actual) e Paramaribo (última tarifa concreta de Fevereiro de
2025, sem confirmação fiável de 2026) ficam só com o operador.
Georgetown (Guiana) fica de fora: sem operador formal identificável, a
última estrutura tarifária oficial por zonas é de 2018, e há um
conflito activo em 2026 entre motoristas e governo sobre o valor
legalmente aprovado.

Caso com nota especial: **Caracas** tem tarifa confirmada por cinco
fontes de imprensa independentes, mas a inflação da Venezuela é tão
elevada que o valor pode já ter mudado outra vez entre a verificação e
a leitura desta ficha; a tarifa subiu de 60 para 90 bolívares só entre
Março e Maio de 2026. Fica registada como a fonte mais recente
encontrada, sujeita à revisão mensal como qualquer outra.

**Lote 6, 04 de Setembro: primeira ronda de África (16 cidades com
tarifa, 3 só operador, 8 de fora).** Cairo, Dakar, Moroni, Brazzaville,
Kinshasa, Libreville, Yaoundé, Bangui, Abidjan, Gaborone, Ouagadougou,
Manzini, Adis Abeba entram com tarifas confirmadas; Acra, Nairóbi e
Maseru ficam só com o operador (sem tarifário publicado, ou fontes
contraditórias sobre o valor exacto). N'Djamena, Cotonou, Bujumbura,
Jibuti, Malabo, Asmara, Banjul e Conacri ficam de fora: sem operador
formal identificável nem fonte fiável e actual, só preços negociados
caso a caso ou dados desactualizados sem confirmação cruzada.

Em muitas destas cidades não existe autocarro municipal formal: o
transporte público de facto é o táxi colectivo partilhado, com tarifa
fixada por decreto ou despacho ministerial em vez de um tarifário de
empresa. Quando esse despacho é uma fonte oficial citável com um número
claro (Yaoundé, Bangui, Moroni), entra como qualquer outro operador;
quando só há preços negociados sem tabela nenhuma (N'Djamena, Cotonou,
Malabo), fica de fora. Dois casos de tecto regulado em vez de tarifa de
operador: Brazzaville (150 FCFA é o máximo legal, a prática ronda os
200-250 FCFA) e Manzini (10 SZL é o tecto nacional até 8 km, não uma
tarifa de bilhete de uma empresa).

**Lote 7, 04 de Setembro: segunda ronda de África (10 cidades com
tarifa, 4 só operador, 4 de fora).** Argel, Luanda, Lilongwe, Bamako,
Nouakchott, Port Louis, Rabat, Kigali, Freetown e Dar es Salaam entram
com tarifas confirmadas; Antananarivo, Windhoek, Abuja e Victoria ficam
só com o operador (tarifário fragmentado por cooperativa, ou fontes
contraditórias sobre o valor exacto). Niamey, Mogadíscio, Juba e Cartum
ficam de fora: sem operador formal identificável (Juba, Mogadíscio,
Niamey) ou sem preços fixos por causa da guerra (Cartum, onde as
fontes vão de poucos SDG a milhares, "variam imprevisivelmente" por
falta de regulação).

**Lote 8, 04 de Setembro: terceira e última ronda de África (6 cidades
com tarifa, 1 só operador, 4 de fora).** Lomé, Tunes, Harare, Maputo,
Mindelo e Praia entram com tarifas confirmadas; Lusaka fica só com o
operador (a RTSA só divulga ajustes relativos, nunca a tarifa absoluta
actual). Entebbe, Bissau, São Tomé e Sal ficam de fora: sem operador
formal identificável, só transporte informal negociado por percurso.

Casos com nota: Tunes tem tarifas confirmadas mas a última alteração
localizada é de 2021, pode estar desactualizada. Harare tem duas
realidades: a ZUPCO (estatal) cobra 1 USD de referência, mas a maioria
das viagens reais faz-se em kombis privados mais caros, que sobem com
frequência; entra o valor da ZUPCO. Mindelo e Praia partilham o mesmo
padrão, tarifa estável desde Setembro de 2024 e reconfirmada
inalterada pelo regulador ARME em Janeiro de 2026.

Fecha-se aqui África: entre os três lotes desta ronda (6, 7 e 8), todas
as capitais do continente foram investigadas; algumas ficaram de fora
por não terem operador formal nem dados fiáveis, não por falta de
tentativa.

**Lote 9, 04 de Setembro: Médio Oriente e Ásia Central (13 cidades com
tarifa, 2 só operador, 4 de fora).** Yerevan, Baku, Manama, Teerão,
Mascate, Riade, Amã, Astana, Cidade do Kuwait, Bisqueque, Beirute,
Tasquente e Dushanbe entram com tarifas confirmadas; Telavive e
Asgabate ficam só com o operador. Cabul, Bagdade, Damasco e Sanaa
ficam de fora: sem operador formal com tarifário publicado (Cabul,
Bagdade), ou sem dados fiáveis por causa da guerra (Damasco, Sanaa).

Casos com nota: Telavive teve duas reformas tarifárias em 2025 (Abril
e "Derekh Shava" em Agosto) que geraram valores contraditórios entre
fontes, sem confirmação segura de qual está em vigor. Asgabate: o único
valor encontrado é de 2017, sem confirmação oficial nem actual, dado o
isolamento do país. Cidade do Kuwait tem três empresas privadas com
rotas sobrepostas (KPTC, CityBus, KGL Mowasalat) em vez de uma
operadora única, mas com valores consistentes entre elas. Fecha-se aqui
o Médio Oriente e a Ásia Central.

**Lote 10, 04 de Setembro: Sul e Sudeste Asiático (6 cidades com
tarifa, 5 só operador, 3 de fora).** Daca, Bandar Seri Begawan, Phnom
Penh, Catmandu, Manila e Colombo entram com tarifas confirmadas;
Islamabad, Vienciana, Malé, Ulã Bator e Rangum ficam só com o
operador. Paro (vila pequena, percorrível a pé, sem serviço formal),
Pyongyang (isolamento do país impede verificação independente) e Dili
(microlets informais, sem operador nem tarifário oficial) ficam de
fora.

Caso comum a várias destas cidades: fontes contraditórias sobre se um
aumento de tarifa anunciado chegou mesmo a entrar em vigor (Rangum,
Islamabad) ou sobre o valor exacto por rota (Ulã Bator, Vienciana), sem
forma de saber qual está correcto à data da verificação.

**Lote 11, 04 de Setembro: as 7 capitais do Lote 6 (7 cidades, todas
com tarifa).** Berna, Ancara, Abu Dhabi, Ottawa, Jacarta, Camberra e
Wellington entram com tarifas confirmadas, todas com boa confiança
(países bem documentados, com sistemas de transporte formais e
noticiados). Jacarta tem três sistemas em paralelo (MRT, TransJakarta
BRT, KRL Commuterline), cada um com tarifa própria.

**Lote 12, 04 de Setembro: grandes cidades asiáticas por fazer (6
cidades, todas com tarifa).** Pequim, Xangai, Seul, Bombaim, Phuket e
Bali entram com tarifas confirmadas. Pequim e Xangai (metro por
distância), Seul (metro e autocarro com T-money) e Bombaim (BEST e
Metro) têm confirmação forte; a tarifa do comboio suburbano "local" de
Bombaim não entrou por falta de confirmação actual e fiável. Phuket:
só o Phuket Smart Bus tem tarifário oficial, os songthaews privados
não têm valores fiáveis. Bali: valores mais antigos e contraditórios
(2023, início de 2025) foram descartados a favor de fontes de 2026.

**Lote 13, 04 de Setembro: Oceânia (2 cidades com tarifa, 4 só
operador, 6 de fora).** Honiara e Port Vila entram com tarifas
confirmadas; Koror, Nadi, Port Moresby e Apia ficam só com o operador
(fontes contraditórias sobre o valor exacto, em vários casos por
haver uma revisão tarifária em curso). Pohnpei, Yaren, Nuku'alofa,
Funafuti, Tarawa e Majuro ficam de fora: sem operador formal
identificável, ilhas pequenas que dependem de táxis partilhados
informais sem tarifário regulado.

Caso com nota: em Honiara e Port Vila, apesar de haver tarifário legal
gazetado, há relatos de operadores a cobrar acima do valor oficial;
entra sempre o valor legal, com nota do que se sabe sobre a prática no
terreno.

**Lote 14, 04 de Setembro: as últimas cidades novas desta fase (2
cidades com tarifa, 4 só operador).** Chicago e Washington D.C. (EUA)
entram com tarifas confirmadas (CTA, WMATA). Basseterre, Castries,
Kingstown e Porto de Espanha, no resto das Caraíbas, ficam só com o
operador: em todas há uma rede de minibus privados regulada por um
organismo do Estado citável, mas sem tarifário actual confirmável (o
mais recente é de 2022 em Kingstown; nos outros, fontes contraditórias
ou reformas incompletas).

### Fecha-se aqui a investigação: todas as 268 cidades do site

Com este lote fecha-se a investigação de transportes locais a todas as
cidades do site: nenhuma ficou por tentar. Restam 36 sem operador,
todas por uma razão documentada, não por falta de pesquisa:

- **Conflito armado ou colapso do Estado**, sem preços fiáveis:
  Cabul, Bagdade, Damasco, Sanaa, Cartum, Juba, Mogadíscio.
- **Isolamento do país**, impossível verificar de forma independente:
  Pyongyang.
- **Rede informal sem operador identificável** (só táxis/minibus
  privados negociados, sem organismo regulador nem tarifário
  publicado): Saint John's, Cidade de Belize, Saint George's, Porto
  Príncipe, Georgetown, Cotonou, Bujumbura, N'Djamena, Jibuti, Malabo,
  Asmara, Banjul, Conacri, Monróvia, Trípoli, Niamey, Entebbe, Bissau,
  São Tomé, Sal, Dili, Tarawa, Majuro, Pohnpei, Yaren, Nuku'alofa,
  Funafuti.
- **Vila pequena e percorrível a pé**, sem serviço formal: Paro.

Qualquer uma destas pode voltar a entrar numa próxima revisão, se
surgir um operador formal e um tarifário citável que hoje não existe.
