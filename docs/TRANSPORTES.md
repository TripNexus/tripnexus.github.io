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

216 cidades no site. Começámos, na primeira ronda, com 17 na tabela e
nenhuma com data de conferência.

A partir daqui, a lista de cidades já não é uma lista fechada: está a
crescer por um projecto à parte (capitais do mundo, ver a secção
seguinte), por isso a coluna «Sem operador» passa a mostrar só a
contagem, não os nomes todos: a lista completa está sempre em
`assets/js/data.js` (`CIDADES`).

| | Cidades | |
|---|---:|---|
| Com tarifas **confirmadas** | **87** | Amesterdão, Atenas, Aveiro, Barcelona, Berlim, Bogotá, Boston, Braga, Bragança, Bruxelas, Budapeste, Buenos Aires, Casablanca, Castelo Branco, Cidade do Cabo, Coimbra, Copenhaga, Covilhã, Cracóvia, Deli, Dubai, Dublin, Dubrovnik, Edimburgo, Estocolmo, Florença, Fortaleza, Frankfurt, Funchal, Genebra, Guarda, Hamburgo, Helsínquia, Hong Kong, Ibiza, Istambul, Kuala Lumpur, Leiria, Lisboa, Londres, Los Angeles, Lyon, Madrid, Manchester, Marselha, Melbourne, Miami, Milão, Montreal, Munique, Málaga, Nice, Nova Iorque, Orlando, Osaka, Oslo, Palma de Maiorca, Paris, Ponta Delgada, Porto, Praga, Recife, Reiquiavique, Rio de Janeiro, Roma, Salvador, Santarém, Santiago, Santorini, Setúbal, Sevilha, Singapura, Sydney, São Francisco, São Paulo, Tenerife, Toronto, Tóquio, Valência, Varsóvia, Veneza, Viana do Castelo, Viena, Viseu, Zagreb, Zurique, Évora |
| Com tarifas **por reconferir** | 0 | nenhuma |
| **Só operador**, sem valores | 10 | Faro, Vila Real, Portalegre, Beja, Nápoles, Marraquexe, Doha, Banguecoque, Hanói, Auckland |
| **Sem operador** | 119 | ver `CIDADES` em `assets/js/data.js` |

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
aeroporto principal). Além disso, oito países já tinham uma cidade no
site, mas não a capital (por exemplo, a Suíça só tinha Zurique e
Genebra, não Berna): essas capitais entram também, como cidades
adicionais, numa próxima ronda.

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
