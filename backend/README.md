# Backend TripNexus: preços em tempo real

O GitHub Pages só serve ficheiros estáticos, por isso os preços reais vêm de um
pequeno serviço à parte (um Cloudflare Worker, plano gratuito) que faz de
intermediário seguro entre o site e a API **Amadeus Self-Service**. As
credenciais ficam guardadas no Worker, nunca no site.

## Passo 1: criar a conta Amadeus (gratuita)

1. Registe-se em https://developers.amadeus.com (Self-Service).
2. Crie uma aplicação em «My Self-Service Workspace» e aponte a **API Key**
   (client id) e o **API Secret**.
3. O ambiente de teste é gratuito (algumas centenas de pedidos por mês) e
   devolve tarifas reais de GDS com ligeiro atraso. Quando quiser passar a
   produção, pede-se a passagem na própria consola e troca-se o endereço
   `test.api.amadeus.com` por `api.amadeus.com` no `worker.js`.

## Passo 2: instalar o Worker (gratuito)

1. Crie uma conta em https://dash.cloudflare.com e instale a ferramenta:
   `npm install -g wrangler`
2. Nesta pasta (`backend/`):

   ```
   wrangler login
   wrangler secret put AMADEUS_ID       (colar a API Key)
   wrangler secret put AMADEUS_SECRET   (colar o API Secret)
   wrangler deploy
   ```

3. No fim, o `wrangler deploy` mostra o endereço do serviço, por exemplo
   `https://tripnexus-api.o-seu-subdominio.workers.dev`.

## Passo 3: ligar o site ao backend

No `index.html`, preencha a linha:

```html
window.TRIPNEXUS_API = 'https://tripnexus-api.o-seu-subdominio.workers.dev';
```

A partir daí, cada pesquisa de voos mostra tarifas reais (bloco «Voos ·
tarifas em tempo real»); se o backend estiver em baixo ou sem quota, o site
volta automaticamente às estimativas locais, sem erro para o utilizador.

## Rotas disponíveis

| Rota | Parâmetros | Devolve |
|---|---|---|
| `/voos` | `origem`, `destino` (IATA), `ida`, `volta` (AAAA-MM-DD), `adultos`, `criancas`, `classe` | `{ofertas:[{preco, companhia, escalas, duracao, partida}]}` |
| `/hoteis` | `cidade` (IATA), `checkin`, `checkout`, `adultos` | `{ofertas:[{nome, preco}]}` |

As respostas são guardadas em cache 10 minutos para poupar quota.

## Próximos passos naturais

- Ligar `/hoteis` ao bloco de alojamento (como já se faz com `/voos`);
- Juntar mais fontes (Travelpayouts para afiliados, Kiwi Tequila para low-cost);
- Guardar histórico de preços num KV do Cloudflare para alertas e gráficos.
