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
2. Nesta pasta (`backend/`):

   ```
   wrangler login
   wrangler secret put TP_TOKEN      (colar o token da Travelpayouts, para voos)
   wrangler secret put SERPAPI_KEY   (colar a chave da SerpApi, para hotéis)
   wrangler deploy
   ```

3. No fim, o `wrangler deploy` mostra o endereço do serviço, por exemplo
   `https://tripnexus-api.o-seu-subdominio.workers.dev`.

### Chave da SerpApi (hotéis, gratuita)

Os preços reais de hotéis vêm da **SerpApi** (motor `google_hotels`, os
mesmos preços que aparecem no Google Hotels). O plano gratuito dá **100
pesquisas por mês**, suficiente para um site pessoal; acima disso, o
alojamento volta às estimativas locais, sem erro para o utilizador.

> **Nota:** já foram tentadas, por esta ordem, a Amadeus (self-service
> descontinuado), a API de dados do Hotellook (removida), a Xotelo (endpoints
> gratuitos trancados) e a Makcorps (é um trial de 30 dias/15 pesquisas, não
> um plano gratuito), e confirmou-se que a conta Travelpayouts também não tem
> nenhum widget de hotéis disponível. A SerpApi é a via que resta com
> pesquisa por cidade e preços reais genuinamente gratuitos.

1. Registe-se em https://serpapi.com (conta gratuita).
2. No painel, copie a **API key** (a "Private API Key" do dashboard).
3. Guarde-a no Worker: `wrangler secret put SERPAPI_KEY` (colar a chave).

Confirme o estado da chave em `/estado` (campo `serpapi_key_definida`).

O **alojamento local** (casas e apartamentos) usa o mesmo motor e a mesma
chave: a rota `/casas` acrescenta `vacation_rentals=true`. Não é preciso
configurar nada além da `SERPAPI_KEY`. Note que cada pesquisa passa a gastar
**duas** consultas do plano (hotéis + casas).

### Chave da GetYourGuide (actividades)

Os preços reais de passeios e bilhetes vêm da **GetYourGuide Partner API**.
Registo gratuito em <https://partner.getyourguide.com>; a aprovação costuma
demorar alguns dias e exige que o site já esteja publicado.

```
wrangler secret put GETYOURGUIDE_KEY
```

Sem a chave, o bloco de actividades mantém-se com as estimativas locais, que
estão assinaladas como tal. Confirme em `/estado` (`getyourguide_key_definida`).

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
| `/voos` | `origem`, `destino` (IATA), `ida`, `volta` (AAAA-MM-DD), `adultos`, `criancas` | `{ofertas:[{preco, companhia, escalas, partida}], classe, fonte}` |
| `/hoteis` | `cidade` (nome), `checkin`, `checkout` (AAAA-MM-DD), `adultos` | `{ofertas:[{nome, preco, estrelas}], fonte:"serpapi"}` (preços do Google Hotels, via SerpApi) |
| `/casas` | os mesmos de `/hoteis` | alojamento local: mesmo motor e **mesma chave**, com `vacation_rentals=true` |
| `/actividades` | `cidade` | `{ofertas:[{nome, preco, url}], fonte:"getyourguide"}`; sem `GETYOURGUIDE_KEY`, devolve lista vazia |
| `/assistente` | POST `{pergunta, contexto?, historico?}` | `{resposta, fonte:"workers-ai", modelo}`: assistente de viagens (Cloudflare Workers AI) |
| `/modelos` | nenhum | diagnóstico: quais dos modelos candidatos a conta aceita neste momento |
| `/estado` | nenhum | diagnóstico: token da Travelpayouts, **pesquisas que restam na SerpApi**, chave do GetYourGuide e se o Workers AI está ligado |

As respostas são guardadas em cache 10 minutos no navegador. Os pedidos à
SerpApi ficam 6 h na cache da Cloudflare e os da Travelpayouts 30 minutos: sem
isto, repetir a mesma pesquisa gastava duas das 100 pesquisas mensais gratuitas
de cada vez, e a quota esgotava-se em poucas dezenas de pesquisas.

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

## Próximos passos naturais

- Usar o **marker** de afiliado nas ligações «Reservar» (comissões por reserva);
- Guardar histórico de preços num KV do Cloudflare para alertas e gráficos;
- Avaliar a **Duffel** para cotações ao segundo e reserva dentro do site.
