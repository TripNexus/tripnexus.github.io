# TripNexus

Comparador de viagens: site estático (GitHub Pages) que compara preços em mais de **60 sites**
parceiros — Google Voos/Hotéis, Skyscanner, Kayak, Momondo, Trivago, Booking.com, Expedia,
Trip.com, eDreams, Kiwi.com, Priceline, Hotels.com, Lastminute.com, Opodo, Hopper, Busbud,
Direct Ferries, Rail Europe e muitos mais (lista completa na aba **Parceiros** do site) —
e apresenta ao utilizador as opções mais baratas, com cupões aplicados automaticamente e
recomendação de pacotes quando ficam a um valor igual ou com pouca margem acima das
reservas em separado.

Os preços de **voos são obtidos em tempo real** (Aviasales/Travelpayouts, via o backend em
`backend/`). Os restantes — alojamento, carros, transportes e actividades — são estimativas
determinísticas, calculadas a partir da distância, época do ano, dia da semana e perfil de
cada parceiro.

## Funcionalidades

- **Barra de pesquisa** com quatro campos («De onde?», «Para onde?», «Partida» e «Regresso»),
  com sugestões automáticas (autocomplete) de cidades e aeroportos;
- **Calendário de preços** (estilo Google Voos): dois meses lado a lado, preço por dia,
  valor mais baixo sublinhado a verde e selector de duração («viagens de N dias»);
- **Opções de pesquisa**: número de passageiros, tipo de viagem (ida e volta, só ida, várias
  cidades), classe, transportes a incluir, tipos de alojamento e extras (bagagem, seguro);
- **Explorar destinos**: deixar «Para onde?» vazio mostra os destinos mais baratos a partir
  da origem, num mapa interactivo e numa grelha de cartões;
- **Cálculo do total da viagem**, com cupões descontados, e comparação com pacotes voo + hotel;
- **Resultados sempre actualizados** em directo ao alterar qualquer opção;
- **Filtros e ordenação** dos voos (escalas, hora de partida, companhia, mais barato/rápido);
- **Gráfico de evolução do preço**, com veredicto «bom momento para comprar»;
- **Alertas de preço**, favoritos e pesquisas recentes (guardados no browser);
- **Selector de moeda** (EUR/USD/GBP/BRL) com taxas de câmbio ao vivo;
- **Aba «Ofertas em conta»**: destinos com o preço actual bastante abaixo do valor típico;
- **Modo escuro**, instalável como aplicação (PWA) e com funcionamento offline;
- **Mapas interactivos** (Leaflet) e **ícones oficiais** de todos os parceiros, com ligações
  de afiliado (Travelpayouts) para concluir a reserva.

Todo o conteúdo está em português de Portugal, segundo o antigo acordo ortográfico.

## Estrutura

```
index.html             página única (vistas: pesquisa, ofertas, parceiros)
assets/css/style.css   estilos (incluindo tema escuro)
assets/js/data.js      cidades, parceiros, cupões e ligações de reserva
assets/js/engine.js    motor de estimativas (voos, alojamento, carros, pacotes, cupões)
assets/js/calendar.js  calendário de preços
assets/js/live.js      preços de voos em tempo real (backend opcional)
assets/js/alertas.js   alertas de preço, favoritos e pesquisas recentes
assets/js/app.js       interface e ligação de tudo
backend/                Cloudflare Worker para preços reais (ver backend/README.md)
manifest.webmanifest,
sw.js                  aplicação instalável e funcionamento offline (PWA)
```

## Adicionar um parceiro novo

Basta acrescentar uma entrada ao objecto `PARCEIROS` em `assets/js/data.js` — as secções de
resultados listam os parceiros por categoria automaticamente. Instruções detalhadas estão
comentadas nesse ficheiro.

## Nota sobre os preços

Os voos usam preços reais quando o backend está configurado (ver `backend/README.md`). Os
restantes valores são estimativas para comparação; o preço final é sempre confirmado no site
do parceiro para onde o utilizador é encaminhado.
