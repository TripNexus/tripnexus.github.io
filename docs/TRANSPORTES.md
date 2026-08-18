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
  actualizado: '2026-08-18',    // o DIA em que alguém foi lá ver
  fonte:    'https://…',        // a página onde o valor foi lido
  moeda:    'EUR',              // ausente = EUR
  bilhetes: [ … ]
}
```

`actualizado` **não é o ano da tarifa**, é o dia da conferência. É a
diferença entre «esta é a tarifa de 2026» e «fui ver isto a 18 de Agosto».
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

**Fontes secundárias não chegam.** Sites de turismo e guias de cidade copiam
uns dos outros e ficam desactualizados. Servem para *encontrar* a página do
operador; não servem como fonte do valor. Nesta revisão apanhámos, só nas
primeiras cidades, Estocolmo a ser dada como 42 e 43 SEK, Oslo como 155, 137
e «pouco mais de 130» NOK, e Munique como 9,70 e 9,90 €: todas de guias, e
todas irreconciliáveis sem abrir o tarifário.

**Moeda que não seja o euro não entra no total.** O bloco mostra os valores,
mas o `custoTransportesReais()` ignora-os: somar coroas a euros dava um
número sem sentido. O bloco di-lo na linha do operador.

## Como se lê um tarifário desta caixa

O ambiente passou a ter **Network access: Full**, mas nem tudo atravessa:

| Via | Funciona | Nota |
|---|---|---|
| `curl` | **sim** | é por aqui que se lê |
| WebFetch | não | tem lista de saída própria, que o ambiente não muda |
| Chromium / Playwright | não | `ERR_CONNECTION_RESET` com e sem proxy |

Como o Chromium não passa, páginas que montem a tabela de preços em
JavaScript saem sem números. Isso vê-se (o `ler.py` diz «o padrão não casou»)
e trata-se procurando a página que serve os preços em HTML, uma versão para
imprimir, ou o PDF do tarifário. **Não se adivinha.**

```
python3 ferramentas/ler.py <url> "<padrão>"
```

Despeja o texto legível da página, filtrado por uma expressão regular, com
duas linhas de contexto de cada lado. É assim que os valores abaixo foram
lidos: na página do operador, não num guia de viagens.

Há operadores que respondem **403** ao `curl` (TfL, MTA, Île-de-France
Mobilités, Tokyo Metro, TUSSAM): bloqueiam agentes automáticos. Esses ficam
para uma ronda feita à mão, num navegador normal.

## Estado em 18 de Agosto de 2026

95 cidades no site.

- **26** com tarifas na tabela, das quais **14** confirmadas nesta data:
  Amesterdão, Atenas, Barcelona, Bruxelas, Budapeste, Copenhaga, Dublin,
  Edimburgo, Florença, Lisboa, Varsóvia, Veneza, Viena e Zurique.
- **12** com tarifas mas por reconferir, herdadas da revisão de Janeiro:
  Porto, Madrid, Paris, Londres, Roma, Milão, Berlim, Praga, Istambul,
  Nova Iorque, Tóquio e Singapura.
- **6** só com operador: Sevilha, Valência, Nápoles, Munique, Estocolmo e
  Oslo.
- **63** sem operador, à espera de levantamento.

### Correcções encontradas nesta revisão

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
| Zurique | sem valores | **tabela completa** | 2.ª classe, adulto; a cidade conta como 2 zonas |

### Endereços partidos, que o utilizador via

Cinco das ligações «Ver tarifário oficial» davam **404**. Corrigidas:

| Cidade | Dava 404 | Agora |
|---|---|---|
| Porto | `metrodoporto.pt/pages/389` | `metrodoporto.pt/pages/357` |
| Barcelona | `tmb.cat/pt/tarifas-metro-bus-barcelona` | `tmb.cat/en/barcelona-fares-metro-bus` |
| Milão | `atm.it/en/ViaggiaConNoi/Pages/SceltaBiglietto.aspx` | `atm.it/en/Pages/default.aspx` |
| Berlim | `bvg.de/en/tickets-and-fares` | `bvg.de/en` |
| Singapura | `lta.gov.sg/content/…/fares_and_ticketing.html` | `lta.gov.sg/` |

Vale a pena sondar os endereços de vez em quando, não só os preços: um
tarifário certo atrás de uma ligação morta não serve de nada.
