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

## Estado em 30 de Agosto de 2026, depois da ronda em navegador

95 cidades no site. Começámos, na primeira ronda, com 17 na tabela e
nenhuma com data de conferência.

| | Cidades | |
|---|---:|---|
| Com tarifas **confirmadas** | **53** | Amesterdão, Atenas, Barcelona, Berlim, Boston, Bruxelas, Budapeste, Copenhaga, Deli, Dubai, Dublin, Edimburgo, Estocolmo, Florença, Genebra, Hamburgo, Helsínquia, Hong Kong, Istambul, Kuala Lumpur, Lisboa, Londres, Los Angeles, Lyon, Málaga, Manchester, Melbourne, Miami, Milão, Montreal, Nova Iorque, Orlando, Palma de Maiorca, Paris, Porto, Praga, Rio de Janeiro, Roma, Salvador, São Francisco, São Paulo, Singapura, Sydney, Tóquio, Toronto, Valência, Varsóvia, Veneza, Viena, Zurique (e Lisboa, Porto e Barcelona da ronda anterior) |
| Com tarifas **por reconferir** | 1 | Madrid |
| **Só operador**, sem valores | 24 | Sevilha, Frankfurt, Nápoles, Oslo, Munique, Funchal, Faro, Tenerife, Nice, Marselha, Cracóvia, Zagreb, Reiquiavique, Bogotá, Santiago, Cidade do Cabo, Auckland, Osaka, Banguecoque, Buenos Aires, Dubrovnik, Recife, Casablanca, Hanói |
| **Sem operador** | 20 | Ponta Delgada, Ibiza, Santorini, Marraquexe, Cairo, Doha, Fortaleza, Cidade do México, Cancún, Lima, Pequim, Xangai, Seul, Phuket, Bali, Bombaim, Luanda, Maputo, Sal, Praia |

Das 21 cidades que esta ronda foi buscar, **18 ficaram com preços**: doze
que já cá estavam e seis que nem sequer apareciam na tabela. Uma passou a
ter operador e ligação (Frankfurt) e duas ficaram como estavam, pelas
razões que estão mais abaixo (Sevilha e Cidade do México). Milão e
Singapura, que tinham ficado de fora do âmbito dessa ronda, foram
conferidas a seguir, a 30 de Agosto: ver a razão de cada correcção no
histórico.

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
- **Sítio inalcançável daqui**: Cidade do México. Todo o domínio
  `cdmx.gob.mx` dá `ERR_CONNECTION_TIMED_OUT`: `metro.`, `semovi.`,
  `metrobus.` e o `www.`. Como não se conseguiu confirmar que endereço
  algum responde, a cidade fica **sem operador**: guardar uma ligação que
  não se abriu seria inventar um endereço.
- **Preço só no planeador de viagem**: RMV de Frankfurt. As páginas do
  simples e do diário dizem, à letra, «you can find the price of your ticket
  in our timetable information»: o RMV não publica tabela nenhuma, só
  calcula o percurso. Fica com operador e ligação, sem valores.
- **Tarifas por distância, sem valor único**: MTR de Hong Kong, Rapid KL,
  Delhi Metro, Tokyo Metro, SBS Transit de Singapura. Aqui não há bloqueio
  nenhum: há uma tabela estação a estação ou por escalão de distância, e
  pôr «a viagem custa X» seria inventar uma média. Entram os títulos de
  preço fixo (passes, aeroporto) ou alguns escalões representativos, e a
  faixa de distância fica dita na nota.
- **Certificados que não validam** (não se desliga a verificação): Seoul
  Metro, Metro do Cairo.
- **Cidades sem rede urbana formal** ou sem operador com sítio próprio:
  Ibiza, Phuket, Bali, Cancún, Sal, Praia, Luanda, Maputo.
- **Página de procura filtrada, sem tabela**: CRTM de Madrid. O tarifário
  não é uma tabela, é um formulário que só devolve mínimos agregados por
  categoria: «Sencillos y 10 viajes» dá «desde 1,50 €» a juntar o bilhete
  simples e o carnet de 10 viagens num único número, e «Billete turístico»
  dá «desde 5 €» a juntar as durações de 1 a 7 dias. Não há como separar o
  valor de cada bilhete sem simular os filtros um a um, e um mínimo
  agregado não é o preço de nenhum bilhete em concreto. Fica **por
  reconferir**, sem se carimbar uma data de hoje sobre números que não se
  confirmaram um a um.

O `--url` do `ferramentas/transportes.js` dá a lista das que faltam,
pronta a colar num navegador.
