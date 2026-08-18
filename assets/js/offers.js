/* ═════════════════════════════════════════════════════════════
   TripNexus · ofertas em conta e parceiros

   As duas vistas que nao sao a pesquisa: os cartoes de destino com a queda
   de preco, e a grelha de todos os parceiros por categoria.
   ═════════════════════════════════════════════════════════════ */

/* ── ofertas em conta ────────────────────────────────────────── */

/* banner fotográfico do destino (imagem principal da Wikipédia);
   o gradiente colorido fica como recurso se a fotografia não carregar */
const cacheBanners = {};
function aplicarBanner(cidade, el){
  /* a API REST da Wikipédia exige o título com «_» em vez de espaços */
  const titulo = (cidade.w || cidade.n).replace(/ /g, '_');
  const aplicarFoto = url => {
    if(!url) return;
    const foto = new Image();
    foto.onload = () => {
      const gradiente = el.style.backgroundImage || 'none';
      el.style.backgroundImage = `linear-gradient(rgba(16,18,42,.28), rgba(16,18,42,.6)), url("${url}"), ${gradiente}`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
      el.classList.add('com-foto');
    };
    foto.src = url;
  };
  /* bandeiras, brasões e mapas não servem de banner */
  const imagemInutil = /flag|coat|bandeira|bras[aã]o|escudo|seal|locator|logo|_map/i;
  const procurar = (wiki, t) =>
    fetch('https://' + wiki + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(t))
      .then(r => r.ok ? r.json() : null)
      .then(j => (j && j.thumbnail) ? j.thumbnail.source : null)
      .then(u => (u && !imagemInutil.test(u)) ? u : null)
      .catch(() => null);
  if(titulo in cacheBanners){ aplicarFoto(cacheBanners[titulo]); return; }
  procurar('pt', titulo)
    .then(url => url || procurar('en', (WIKI_EN[cidade.n] || cidade.w || cidade.n).replace(/ /g, '_')))
    .then(url => url || ('https://loremflickr.com/640/360/' + encodeURIComponent(cidade.n) + ',cidade,landmark'))
    .then(url => {
      cacheBanners[titulo] = url || null;
      if(!url) return;
      /* tenta a versão maior; se esse tamanho não existir, usa a miniatura original */
      const grande = url.replace(/\/(\d+)px-/, '/640px-');
      if(grande !== url){
        const teste = new Image();
        teste.onload = () => aplicarFoto(grande);
        teste.onerror = () => aplicarFoto(url);
        teste.src = grande;
      } else {
        aplicarFoto(url);
      }
    });
}

function desenharOfertas(){
  const selector = document.getElementById('ofertas-origem');
  if(!selector.options.length){
    for(const nome of ['Lisboa','Porto','Faro','Funchal','Ponta Delgada']){
      const opt = document.createElement('option'); opt.value = nome; opt.textContent = nome;
      selector.appendChild(opt);
    }
    selector.addEventListener('change', () => { ofertasDesenhadas = false; desenharOfertas(); });
  }
  if(ofertasDesenhadas){
    if(mapaOfertas) setTimeout(() => mapaOfertas.invalidateSize(), 150);
    return;
  }
  ofertasDesenhadas = true;

  const origem = cidadePorNome(selector.value || 'Lisboa');
  const grelha = document.getElementById('grelha-ofertas');
  grelha.innerHTML = '<p class="bloco-sub">⏳ A procurar tarifas reais…</p>';
  /* os preços vêm agora do backend, por isso isto é assíncrono */
  calcularOfertas(origem.n).then(r => desenharCartoesOfertas(origem, r));
}

function desenharCartoesOfertas(origem, r){
  const grelha = document.getElementById('grelha-ofertas');
  const ofertas = r.lista;
  if(!ofertas.length){
    /* sem tarifas não se inventam ofertas: diz-se porquê */
    grelha.innerHTML = `<p class="bloco-sub">${
      r.estado === 'sem-backend' ? 'Sem ligação ao backend não há ofertas com preços reais.' :
      r.estado === 'falhou' ? 'Não foi possível obter as tarifas agora. Tente daqui a pouco.' :
      'Não há tarifas registadas para estas rotas no próximo mês.'}</p>`;
    return;
  }
  grelha.innerHTML = ofertas.map((of, i) => `
    <div class="cartao-oferta">
      <div class="oferta-topo" style="background:${of.gradiente}">
        ${of.queda > 0 ? `<span class="desconto">−${of.queda} %</span>` : ''}
        <span class="oferta-bandeira">${of.destino.f}</span>
        <span class="oferta-cidade">${of.destino.n}</span>
      </div>
      <div class="oferta-corpo">
        <span class="oferta-datas">✈ ${origem.n} → ${of.destino.n} · ${formatarDataCurta(of.ida)} - ${formatarDataCurta(of.volta)}</span>
        <div class="oferta-precos"><span class="oferta-agora">${euros(of.agora)}</span>${of.queda > 0 ? `<span class="oferta-tipico">${euros(of.tipico)}</span>` : ''}</div>
        <span class="oferta-poupanca">${of.queda > 0
          ? `Poupa ${euros(of.tipico - of.agora)} face à mediana desta rota neste mês (${of.diasComTarifa} dias com tarifa)`
          : `Tarifa mais barata do mês nesta rota (${of.diasComTarifa} dias com tarifa)`}</span>
        <button type="button" class="btn-oferta" data-i="${i}">Ver esta viagem</button>
      </div>
    </div>`).join('');

  document.querySelectorAll('.btn-oferta').forEach(btn =>
    btn.addEventListener('click', () => aplicarOferta(origem, ofertas[+btn.dataset.i])));

  document.querySelectorAll('#grelha-ofertas .oferta-topo').forEach((el, i) =>
    aplicarBanner(ofertas[i].destino, el));

  /* mapa das ofertas */
  if(mapaOfertas){ mapaOfertas.remove(); mapaOfertas = null; }
  mapaOfertas = criarMapa('mapa-ofertas');
  if(mapaOfertas){
    const pontos = [[origem.la, origem.lo]];
    L.marker([origem.la, origem.lo]).addTo(mapaOfertas).bindPopup(`<strong>${origem.f} ${origem.n}</strong><br>Origem`);
    ofertas.forEach(of => {
      pontos.push([of.destino.la, of.destino.lo]);
      const m = L.marker([of.destino.la, of.destino.lo]).addTo(mapaOfertas);
      m.bindTooltip(`${euros(of.agora)}`, {permanent:true, direction:'top', offset:[-15,-8], className:'tooltip-preco'});
      /* «antes» dava a entender um preço que se praticou e já não se pratica;
         o que temos é a mediana do mês, e é isso que se diz */
      m.bindPopup(`<strong>${of.destino.f} ${of.destino.n}</strong><br>${euros(of.agora)}${
        of.queda > 0 ? ` · mediana do mês ${euros(of.tipico)}` : ''}`);
      m.on('popupopen', () => {});
    });
    mapaOfertas.fitBounds(L.latLngBounds(pontos).pad(0.2));
    setTimeout(() => mapaOfertas.invalidateSize(), 200);
  }
}
function aplicarOferta(origem, of){
  mostrarVista('pesquisa');
  document.querySelector('input[name="tipo-viagem"][value="ida-volta"]').checked = true;
  ESTADO.tipo = 'ida-volta';
  document.getElementById('linha-campos').style.display = '';
  document.getElementById('zona-multi').hidden = true;
  inputOrigem.value = origem.n; ESTADO.origem = origem;
  inputDestino.value = of.destino.n; ESTADO.destino = of.destino;
  ESTADO.ida = of.ida; ESTADO.volta = of.volta;
  document.getElementById('input-partida').value = formatarDataCurta(of.ida);
  document.getElementById('input-regresso').value = formatarDataCurta(of.volta);
  actualizarRotulos();
  executarPesquisa();
}

/* ── grelha de parceiros ─────────────────────────────────────── */
const NOMES_CAT = {voo:'Voos', hotel:'Hotéis', casa:'Casas e apartamentos', hostel:'Hostels',
                   carro:'Aluguer de carros', comboio:'Comboios', autocarro:'Autocarros',
                   actividade:'Actividades', pacote:'Pacotes e viagens organizadas',
                   planeador:'Planeador de rotas', ferry:'Ferries e barcos',
                   organizador:'Organizador de viagem', corporativo:'Viagens de empresa'};
/* ordem por que as secções aparecem; o ícone dá identidade a cada uma */
const ORDEM_CAT = [['voo','✈'], ['hotel','🏨'], ['casa','🏠'], ['hostel','🛏'], ['pacote','🧳'],
                   ['carro','🚗'], ['comboio','🚆'], ['autocarro','🚌'], ['ferry','⛴'],
                   ['actividade','🎟'], ['planeador','🗺'], ['organizador','📋'], ['corporativo','💼']];

function desenharParceiros(){
  /* cada parceiro entra na secção da sua categoria principal (a primeira que
     declara), para não aparecer repetido; as restantes ficam listadas na
     descrição */
  const porCat = {};
  for(const chave of Object.keys(PARCEIROS)){
    const principal = PARCEIROS[chave].cat[0];
    (porCat[principal] = porCat[principal] || []).push(chave);
  }
  const seccoes = ORDEM_CAT.filter(([c]) => porCat[c] && porCat[c].length);
  document.getElementById('grelha-parceiros').innerHTML = seccoes.map(([cat, ico]) => {
    const lista = porCat[cat].sort((a, b) => PARCEIROS[a].nome.localeCompare(PARCEIROS[b].nome, 'pt'));
    return `<section class="parceiros-grupo">
      <h3 class="parceiros-cat">${ico} ${NOMES_CAT[cat]} <span class="parceiros-conta">${lista.length}</span></h3>
      <div class="parceiros-lista">
        ${lista.map(chave => {
          const p = PARCEIROS[chave];
          const outras = p.cat.slice(1).map(c => NOMES_CAT[c]).filter(Boolean);
          return `<div class="parceiro-item">
            ${iconeParceiro(chave)}
            <div>
              <div class="parceiro-nome">${escaparHtml(p.nome)}</div>
              <div class="parceiro-desc">${escaparHtml(p.desc)}</div>
              ${outras.length ? `<div class="parceiro-tags">${outras.map(t => `<span class="parceiro-tag">${escaparHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }).join('');
}
