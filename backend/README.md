# Backend TripNexus: preços em tempo real

O GitHub Pages só serve ficheiros estáticos, por isso os preços reais vêm de um
pequeno serviço à parte (um Cloudflare Worker, plano gratuito) que faz de
intermediário seguro entre o site e as APIs de dados de viagens. O token fica
guardado no Worker, nunca no site.

> **Porquê Travelpayouts e não Amadeus?** A Amadeus descontinuou o portal
> Self-Service (gratuito) a 17 de Julho de 2026; o que resta é o portal
> Enterprise, destinado a empresas com contrato comercial. A alternativa certa
> para um comparador é a **Travelpayouts** (rede de afiliados da Aviasales):
> registo gratuito e imediato, dados de preços reais de voos, hotéis via
> Hotellook e, como bónus, **comissões de afiliado** por cada reserva
> encaminhada.

## Passo 1: criar a conta Travelpayouts (gratuita)

1. Registe-se em https://www.travelpayouts.com (conta de afiliado, gratuita).
2. No painel, junte-se ao programa **Aviasales** (voos) e **Hotellook** (hotéis).
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
   wrangler secret put TP_TOKEN         (colar o token da Travelpayouts, para voos)
   wrangler secret put MAKCORPS_TOKEN   (colar a chave da Makcorps, para hotéis)
   wrangler deploy
   ```

3. No fim, o `wrangler deploy` mostra o endereço do serviço, por exemplo
   `https://tripnexus-api.o-seu-subdominio.workers.dev`.

### Chave da Makcorps (hotéis, gratuita)

Os preços reais de hotéis vêm da **Makcorps**, que compara tarifas de vários
sites de reserva. O plano gratuito chega bem para um comparador:

1. Registe-se em https://www.makcorps.com (conta gratuita).
2. No painel, copie a **API key**.
3. Guarde-a no Worker: `wrangler secret put MAKCORPS_TOKEN` (colar a chave).

Se a chave não estiver definida, o bloco de alojamento continua a mostrar as
estimativas locais, sem erro para o utilizador. Confirme o estado da chave em
`/estado` (campo `makcorps_token_definido`).

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
| `/hoteis` | `cidade` (nome), `checkin`, `checkout` (AAAA-MM-DD), `adultos` | `{ofertas:[{nome, preco, estrelas, vendedor}], fonte:"makcorps"}` (comparação de tarifas de vários sites, via Makcorps) |
| `/estado` | nenhum | diagnóstico: se os tokens (Travelpayouts e Makcorps) estão definidos e se a Travelpayouts aceita o seu |

As respostas são guardadas em cache 10 minutos.

## Próximos passos naturais

- Ligar `/hoteis` ao bloco de alojamento (como já se faz com `/voos`);
- Usar o **marker** de afiliado nas ligações «Reservar» (comissões por reserva);
- Guardar histórico de preços num KV do Cloudflare para alertas e gráficos;
- Avaliar a **Duffel** para cotações ao segundo e reserva dentro do site.
