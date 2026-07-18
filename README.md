# TripNexus

Comparador de viagens: site estático (GitHub Pages) que compara preços em mais de 24 sites
parceiros (Google Voos/Hotéis, Skyscanner, Kayak, Momondo, Trivago, Booking.com, Expedia,
Trip.com, eDreams, Logitravel, Agoda, Airbnb, Vrbo, Hostelworld, Rentalcars.com,
Discover Cars, Auto Europe, GetYourGuide, Civitatis, Viator, Rome2Rio, Omio, Trainline
e FlixBus) e apresenta ao utilizador as opções mais baratas, com cupões aplicados
automaticamente e recomendação de pacotes quando ficam a um valor igual ou com pouca
margem acima das reservas em separado.

## Funcionalidades

- **Barra de pesquisa** com quatro campos («De onde?», «Para onde?», «Partida» e «Regresso»),
  com sugestões automáticas (autocomplete) de cidades e aeroportos;
- **Calendário de preços** (estilo Google Voos): dois meses lado a lado, preço por dia,
  valor mais baixo sublinhado a verde e selector de duração («viagens de N dias»);
- **Opções de pesquisa**: número de passageiros (adultos, crianças e bebés), tipo de viagem
  (ida e volta, só ida, várias cidades), classe (económica, económica premium, executiva e
  primeira classe), transportes a incluir (carro privado alugado, comboio, autocarro, metro
  e transportes públicos) e tipos de alojamento (hotéis, Airbnb e semelhantes, hostels);
- **Cálculo do total da viagem**: voo + alojamento + carro + transportes públicos, com
  cupões descontados, e comparação com pacotes voo + hotel (+ carro);
- **Resultados sempre actualizados**: qualquer alteração às opções depois de uma pesquisa
  (passageiros, classe, transportes, alojamento, datas ou cidades) volta a calcular tudo;
- **Aba «Ofertas em conta»**: destinos cujo preço actual está bastante abaixo do valor
  típico registado em datas anteriores, com banner fotográfico de cada destino;
- **Mapas interactivos** (Leaflet + OpenStreetMap/CARTO) da rota pesquisada e das ofertas;
- **Ícones oficiais** de todos os parceiros e ligações directas para concluir a reserva.

Todo o conteúdo está em português de Portugal, segundo o antigo acordo ortográfico.

## Estrutura

```
index.html            página única (vistas: pesquisa, ofertas, parceiros)
assets/css/style.css  estilos
assets/js/data.js     cidades, parceiros, cupões e ligações de reserva
assets/js/engine.js   motor de estimativas (voos, alojamento, carros, pacotes, cupões)
assets/js/calendar.js calendário de preços
assets/js/app.js      interface e ligação de tudo
```

## Nota sobre os preços

Um site estático não pode consultar os sistemas de reservas em tempo real; os valores
apresentados são **estimativas determinísticas** calculadas a partir da distância, época
do ano, dia da semana e perfil de cada parceiro, e destinam-se a demonstração e
comparação. O preço final é sempre confirmado no site do parceiro para onde o
utilizador é encaminhado.
