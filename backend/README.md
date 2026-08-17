# Backend TripNexus: preços em tempo real

O GitHub Pages só serve ficheiros estáticos, por isso os preços reais vêm de um
pequeno serviço à parte (um Cloudflare Worker, plano gratuito) que faz de
intermediário seguro entre o site e as APIs de dados de viagens. O token fica
guardado no Worker, nunca no site.

> **Porquê Travelpayouts e não Amadeus?** A Amadeus descontinuou o portal
> Self-Service (gratuito) a 17 de Julho de 2026; o que resta é o portal
> Enterprise, destinado a empresas com contrato comercial. A alternativa certa
> para um comparador é a **Travelpayouts** (rede de afiliados da Aviasales):
> registo gratuito e imediato, dados de preços reais de voos e, como bónus,
> **comissões de afiliado** por cada reserva encaminhada. Os hotéis usam uma
> fonte à parte (SerpApi), documentada abaixo.

## Passo 1: criar a conta Travelpayouts (gratuita)

1. Registe-se em https://www.travelpayouts.com (conta de afiliado, gratuita).
2. No painel, junte-se ao programa **Aviasales** (voos).
3. Em «Profile → API token» copie o **token**; aponte também o seu **marker**
   (identificador de afiliado, útil mais tarde para as ligações com comissão).

Sobre os dados: a API devolve tarifas reais registadas em pesquisas de
utilizadores nas últimas horas (até 48 h), em classe económica. É o mesmo tipo
de dados que alimenta os calendários de preços da Aviasales. Para cotações ao
segundo e reserva dentro do próprio site, o passo seguinte natural é a
**Duffel** (https://duffel.com): tem modo de teste gratuito, mas a passagem a
produção exige verificação da empresa; fica documentado como evolução futura.

## Passo 2: instalar o Worker (gratuito)

1. Crie uma conta em https://dash.cloudflare.com e instale a ferramenta:
   `npm install -g wrangler`
2. **Todos os comandos correm dentro da pasta `backend/`**, que é onde está o
   `wrangler.toml`. Corridos na raiz do repositório, o wrangler queixa-se de
   `Required Worker name missing` — e o `wrangler deploy` chega a propor
   publicar o site inteiro como um Worker novo, o que não é o que se quer.

   ```
   cd backend
   wrangler login
   wrangler secret put TP_TOKEN      (nome do segredo, não o valor)
   wrangler secret put SERPAPI_KEY
   wrangler deploy
   ```

   > O `secret put` recebe o **nome** do segredo. O valor é pedido a seguir,
   > no prompt `Enter a secret value:`, e não fica escrito no ecrã nem no
   > histórico da linha de comandos. Escrever a chave no próprio comando
   > (`wrangler secret put a1b2c3…`) cria um segredo com o nome errado **e**
   > deixa a chave no histórico: nesse caso, revogue-a e gere outra.

   Um `wrangler deploy` bem sucedido diz `Uploaded tripnexus-api`. Se disser
   outro nome, está na pasta errada.

3. No fim, o `wrangler deploy` mostra o endereço do serviço, por exemplo
   `https://tripnexus-api.o-seu-subdominio.workers.dev`.

### Chave da SerpApi (hotéis, gratuita)

Os preços reais de hotéis vêm da **SerpApi** (motor `google_hotels`, os
mesmos preços que aparecem no Google Hotels). O plano gratuito tem um limite
mensal de pesquisas (250, no plano actual) — o número exacto que resta vem em
`/estado`, no campo `serpapi_pesquisas_restantes`. Esgotado o limite, o
alojamento volta às estimativas locais, sem erro para o utilizador.

> **Nota:** já foram tentadas, por esta ordem, a Amadeus (self-service
> descontinuado), a API de dados do Hotellook (removida), a Xotelo (endpoints
> gratuitos trancados) e a Makcorps (é um trial de 30 dias/15 pesquisas, não
> um plano gratuito), e confirmou-se que a conta Travelpayouts também não tem
> nenhum widget de hotéis disponível. A SerpApi é a via que resta com
> pesquisa por cidade e preços reais genuinamente gratuitos.

1. Registe-se em https://serpapi.com (conta gratuita).
2. No painel, copie a **API key** (a "Private API Key" do dashboard).
3. Guarde-a no Worker, **dentro da pasta `backend/`**: `wrangler secret put SERPAPI_KEY`,
   e cole a chave no prompt `Enter a secret value:` (não no próprio comando).

Confirme o estado da chave em `/estado` (campo `serpapi_key_definida`).

O **alojamento local** (casas e apartamentos) usa o mesmo motor e a mesma
chave: a rota `/casas` acrescenta `vacation_rentals=true`. Não é preciso
configurar nada além da `SERPAPI_KEY`. Note que cada pesquisa passa a gastar
**duas** consultas do plano (hotéis + casas).

### Chave para aluguer de viaturas e actividades

O aluguer e as actividades vêm da **Booking.com**, que aceita coordenadas
(viaturas) e o nome da cidade (atracções) — ao contrário dos widgets do
Localrent e do Klook, que fixam a cidade num identificador interno e por isso
só serviam uma lista fechada de cidades. E, ao contrário dos widgets, a API
devolve o valor, o que permite somá-lo no total da viagem.

```
cd backend
wrangler secret put RAPIDAPI_KEY
```

Confirme em `/estado` (campo `rapidapi_key_definida`). Sem a chave, os dois
blocos ficam com as ligações aos parceiros e sem preço — nunca com valores
inventados.

> **Quotas — o ponto crítico.** A camada gratuita do RapidAPI dá **50 pedidos
> por mês**. Uma pesquisa do site gastava quatro (dois no aluguer, dois nas
> actividades), o que dava **doze pesquisas por mês**: inutilizável.
>
> O aluguer passou a gastar **um** pedido no caso comum — pesquisa-se
> directamente nas coordenadas que já temos, e só se elas não derem viaturas é
> que se gasta um segundo a perguntar ao fornecedor onde fica o local.
>
> **O 429 tem duas causas, e confundi-las custa caro.** O plano gratuito
> limita os pedidos **por mês** e também **por segundo**, e devolve o mesmo
> código HTTP para as duas coisas. Distinguem-se pelo corpo: o da quota fala em
> *«MONTHLY quota»* e nomeia o plano; o do ritmo diz apenas *«Too many
> requests»*. O site pede carros e actividades ao mesmo tempo, o que basta para
> accionar o segundo com a quota do mês quase intacta — foi exactamente o que
> nos aconteceu, com 47 dos 50 pedidos por gastar.
>
> O `rapid()` trata-os de maneira diferente: no 429 de ritmo repete até duas
> vezes, com 1,2 s e 2,5 s de espera; no da quota desiste de imediato, porque
> esperar não devolve pedidos. Os cabeçalhos
> `x-ratelimit-requests-remaining` são lidos e devolvidos no campo `quota`, e o
> `/estado` mostra qual dos dois casos é.
>
> **O número de quota no `/estado` vem da cache.** A sondagem que o lê está
> guardada 6 h, para que recarregar a página de diagnóstico não gaste pedidos —
> mas isso quer dizer que o número não desce à medida que o site consome, e
> pode estar até seis horas atrasado. Para ver o valor de agora, `/estado?fresco=1`,
> que gasta um pedido para o ir buscar.
>
> Isto serve para validar a integração, não para um site aberto ao público. O destino natural é a **Booking.com Demand API**
> (<https://developers.booking.com/demand>), que não cobra pela utilização —
> o modelo é por comissão — e cobre os mesmos produtos. Exige aprovação como
> parceiro afiliado. As rotas `/carros` e `/actividades` foram escritas com os
> nomes dos campos procurados por padrão (ver `colher()`), pelo que a troca de
> fornecedor é uma alteração contida ao `rapid()` e aos dois caminhos.

Ambas as rotas aceitam `debug=1`, que devolve a resposta em bruto do
fornecedor, **o pedido exacto e o estado HTTP**: sem isso, uma resposta 200
com `status:false` é indistinguível de um parâmetro mal escrito.

> **Cuidado com a versão do grupo de endpoints.** O fornecedor mantém um
> grupo «Car Rental» marcado como *deprecated* em `/api/v1/cars/`, que
> responde HTTP 200 com `status:false` e uma mensagem genérica. O grupo bom é
> o **«Car Rental - V2»**, em **`/api/v2/cars/`**, e exige **dois passos**:
> `searchDestination` traduz o local, e só depois `searchCarRentals` aceita a
> pesquisa. O primeiro recebe **`term`** (não `query`) e `countryOfResidence`.
> Os caminhos estão em constantes no topo do `worker.js`.
>
> O `searchCarRentals` recebe **as coordenadas devolvidas pelo
> `searchDestination`** (`coordinates.latitude` / `longitude`), não um
> identificador, e exige as quatro datas e horas. O `title` do local vai como
> `pick_up_location_name`, que a documentação diz melhorar a correspondência.
>
> **Este endpoint não aceita moeda.** O preço vem na que o fornecedor
> escolher, e a rota devolve-a em `moeda`: se não for EUR, o site mostra o
> código em vez de fingir euros, e o valor não entra no total da viagem.
>
> **O idioma leva região.** Nas actividades, o `languagecode` tem de ser
> `pt-pt` ou `en-us`; um `pt` solto não é reconhecido e o `searchLocation`
> devolve zero destinos — o que no site aparecia como «a Booking não
> reconheceu «Paris»», uma mensagem que culpava a cidade quando o culpado era
> o parâmetro ao lado. Está numa constante `LOCALE` no `worker.js`.
>
> Duas lições de método: a mensagem de erro deste fornecedor é sempre a mesma
> independentemente da causa, por isso o `debug=1` que mostra o pedido enviado
> vale mais do que ler a resposta; e o painel do RapidAPI dá o URL de exemplo e
> a lista de parâmetros sem gastar quota nenhuma — vale sempre a pena olhar
> antes de tentar.

Para afinar a integração sem publicar o Worker a cada tentativa, `/carros`
aceita ainda:

| Parâmetro | Efeito |
|---|---|
| `caminho1` | endpoint do passo 1 (tem de começar por `/api/`) |
| `caminho2` | endpoint do passo 2 |
| `extra` | `chave:valor,chave:valor` — acrescenta ou substitui parâmetros do passo 2 |

Exemplo: `/carros?lat=38.7&lon=-9.1&ida=2026-09-20&volta=2026-09-24&debug=1&caminho1=/api/v2/cars/searchDestination&caminho2=/api/v2/cars/searchCarRentals`

Cada tentativa gasta um pedido da quota, por isso convém confirmar primeiro os
nomes na documentação do fornecedor e só depois experimentar.

### Assistente de viagens (Workers AI, gratuito e sem chave)

O bot de viagens do site usa os modelos da própria Cloudflare (**Workers AI**),
que têm uma quota diária gratuita. **Não é preciso conta nova nem chave**: basta
o binding já declarado no `wrangler.toml`

```toml
[ai]
binding = "AI"
```

e voltar a correr `wrangler deploy`. Confirme em `/estado` (campo
`workers_ai_ligado`). Se o binding faltar, o `/assistente` devolve 503 e o
botão do assistente simplesmente não responde, sem afectar o resto do site.

> **Importante:** faça `git pull` antes do `wrangler deploy`. O `wrangler`
> envia o ficheiro que está no seu disco, não o que está no GitHub: se o
> `worker.js` local estiver desactualizado, volta a pôr em produção a versão
> antiga.

**Sobre os modelos:** a Cloudflare acrescenta e retira modelos com frequência
e sem aviso (o `llama-3.1-8b-instruct`, por exemplo, foi descontinuado a
30/05/2026). Por isso o Worker não fixa um modelo: percorre uma lista de
candidatos por ordem de preferência, usa o primeiro que responder e memoriza-o.

A lista actual (confirmada pela rota `/modelos` em Agosto de 2026) é:

| Modelo | Nota |
|---|---|
| `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | preferido: o maior, e o que melhor segue o português de Portugal |
| `@cf/meta/llama-4-scout-17b-16e-instruct` | alternativa rápida |
| `@cf/mistralai/mistral-small-3.1-24b-instruct` | último recurso: tende a escorregar para formas brasileiras |

Se o assistente deixar de responder, abra **`/modelos`**: experimenta cada
candidato e devolve a lista `funcionam` e, para os restantes, o erro exacto
(descontinuado, sem acesso na conta, nome inexistente). Copie então os nomes
actuais do catálogo da Cloudflare para a constante `MODELOS_IA` em `worker.js`.

## Passo 3: ligar o site ao backend

No `index.html`, preencha a linha:

```html
window.TRIPNEXUS_API = 'https://tripnexus-api.o-seu-subdominio.workers.dev';
```

A partir daí, cada pesquisa de voos mostra tarifas reais (bloco «Voos ·
tarifas em tempo real»); se o backend estiver em baixo ou sem dados para a
rota, o site volta automaticamente às estimativas locais, sem erro para o
utilizador.

## Rotas disponíveis

| Rota | Parâmetros | Devolve |
|---|---|---|
| `/voos` | `origem`, `destino` (IATA), `ida`, `volta` (AAAA-MM-DD), `adultos`, `criancas`, `marker` | `{ofertas:[{preco, companhia, escalas, duracao, partida, url}], classe, fonte}` |
| `/calendario` | `origem`, `destino` (IATA), `mes` (AAAA-MM), e depois `dias` (duração da viagem) **ou** `ida` (AAAA-MM-DD, para agrupar por dia de regresso) **ou** `soIda=1` | `{precos:{"2026-09-09":171, …}, mes, dias, fonte}`: o preço real mais baixo por dia. É o que alimenta a grelha de datas — que antes mostrava valores inventados por um gerador com semente |
| `/hoteis` | `cidade` (nome), `checkin`, `checkout` (AAAA-MM-DD), `adultos` | `{ofertas:[{nome, preco, estrelas}], fonte:"serpapi"}` (preços do Google Hotels, via SerpApi) |
| `/casas` | os mesmos de `/hoteis` | alojamento local: mesmo motor e **mesma chave**, com `vacation_rentals=true` |
| `/carros` | `lat`, `lon`, `ida`, `volta` (AAAA-MM-DD), `debug` | `{ofertas:[{nome, preco, fornecedor, detalhe}], fonte:"booking"}` |
| `/actividades` | `cidade`, `debug` | `{ofertas:[{nome, preco, url}], fonte:"booking"}`; sem `RAPIDAPI_KEY`, devolve lista vazia |
| `/assistente` | POST `{pergunta, contexto?, historico?}` | `{resposta, fonte:"workers-ai", modelo}`: assistente de viagens (Cloudflare Workers AI) |
| `/modelos` | nenhum | diagnóstico: quais dos modelos candidatos a conta aceita neste momento |
| `/estado` | nenhum | diagnóstico: token da Travelpayouts, **pesquisas que restam na SerpApi**, chave do RapidAPI e se o Workers AI está ligado |

As respostas são guardadas em cache 10 minutos no navegador. Os pedidos à
SerpApi ficam 6 h na cache da Cloudflare e os da Travelpayouts 30 minutos: sem
isto, repetir a mesma pesquisa gastava duas das pesquisas mensais gratuitas
de cada vez, e a quota esgotava-se em poucas dezenas de pesquisas.

### De onde vêm as tarifas de voo

A rota `/voos` usa o **`aviasales/v3/prices_for_dates`** da Travelpayouts, que
devolve uma lista de tarifas para as datas pedidas, cada uma com companhia,
escalas, duração e **ligação directa à reserva** (com o nosso marker). Se essa
lista vier vazia, tenta-se o antigo `v1/prices/cheap`, que só dá a mais barata
por número de escalas — no máximo três linhas, e vazio em muitas rotas.

## Porque é que o site mostra «estimativa»

As estimativas são o último recurso: só aparecem quando a fonte real não
devolve nada. Para saber qual falhou e porquê, abra o site com `?diag=1` no
endereço (por exemplo `https://tripnexus.github.io/?diag=1`), faça uma
pesquisa e leia o quadro «Diagnóstico das fontes de preço» no fim da página. O
mesmo aparece na consola do navegador e em `window.TRIPNEXUS_DIAG`.

Motivos mais frequentes:

| O que aparece no diagnóstico | O que fazer |
|---|---|
| `Your account has run out of searches` | quota mensal da SerpApi esgotada; confirme em `/estado` o campo `serpapi_pesquisas_restantes` |
| `backend devolveu 404` em `casas` | o Worker está desactualizado: faça `git pull` e `wrangler deploy` na pasta `backend/` |
| `SERPAPI_KEY não definido` | corra `wrangler secret put SERPAPI_KEY` |
| `sem tarifas registadas para esta rota` | a Travelpayouts só tem tarifas de pesquisas reais recentes; é normal em rotas pouco procuradas |
| `sem ligação ao backend` | o Worker não respondeu: confirme o endereço em `window.TRIPNEXUS_API` |

### O Worker publicado é o do repositório?

O `/estado` devolve um campo **`versao`**. Compare-o com a constante
`VERSAO_WORKER` no topo de `backend/worker.js`: se forem diferentes, o que está
publicado é código antigo e falta correr `git pull && wrangler deploy` na pasta
`backend/`. Um `/estado` sem esse campo é, ele próprio, sinal de que o Worker
publicado é anterior a esta versão.

## Próximos passos naturais

- Usar o **marker** de afiliado nas ligações «Reservar» (comissões por reserva);
- Guardar histórico de preços num KV do Cloudflare para alertas e gráficos;
- Avaliar a **Duffel** para cotações ao segundo e reserva dentro do site.
