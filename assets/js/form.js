/* ═════════════════════════════════════════════════════════════
   TripNexus · cartao de pesquisa

   Tudo o que o utilizador toca antes de carregar em «Pesquisar»: a
   navegacao entre vistas, os dropdowns, os contadores de passageiros, o
   autocomplete das cidades, os campos de data e os trocos de varias
   cidades. Publica «inputOrigem» e «inputDestino», de que o app.js precisa
   no arranque.

   Carrega depois do search.js, e nao por gosto: os contadores de
   passageiros pintam-se ao carregar, e a funcao que os pinta acaba a
   chamar o reactualizarResultados(), que vive la. Trocar a ordem parte a
   pagina no arranque.
   ═════════════════════════════════════════════════════════════ */

/* ── navegação entre vistas ──────────────────────────────────── */
function mostrarVista(nome){
  for(const v of ['pesquisa','ofertas','parceiros']){
    document.getElementById('vista-' + v).hidden = (v !== nome);
  }
  document.querySelectorAll('.nav-btn[data-vista]').forEach(b =>
    b.classList.toggle('activo', b.dataset.vista === nome));
  window.scrollTo({top:0, behavior:'smooth'});
  if(nome === 'ofertas'){ desenharOfertas(); }
}
document.querySelectorAll('.nav-btn[data-vista]').forEach(b =>
  b.addEventListener('click', () => mostrarVista(b.dataset.vista)));
document.getElementById('logo-link').addEventListener('click', e => { e.preventDefault(); mostrarVista('pesquisa'); });

/* ── dropdowns da linha de opções ────────────────────────────── */
document.querySelectorAll('.dropdown').forEach(dd => {
  dd.querySelector('.dd-btn').addEventListener('click', e => {
    e.stopPropagation();
    const aberto = dd.classList.contains('aberto');
    document.querySelectorAll('.dropdown.aberto').forEach(x => x.classList.remove('aberto'));
    if(!aberto) dd.classList.add('aberto');
  });
  dd.querySelector('.painel').addEventListener('click', e => e.stopPropagation());
});
document.addEventListener('click', () =>
  document.querySelectorAll('.dropdown.aberto').forEach(x => x.classList.remove('aberto')));

function actualizarRotulos(){
  const nomesTipo = {'ida-volta':'Ida e volta','so-ida':'Só ida','multi':'Várias cidades'};
  document.querySelector('#dd-tipo .dd-rotulo').textContent = nomesTipo[ESTADO.tipo];
  const n = totalPax();
  document.querySelector('#dd-passageiros .dd-rotulo').textContent = n + (n === 1 ? ' passageiro' : ' passageiros');
  document.querySelector('#dd-classe .dd-rotulo').textContent = NOME_CLASSE[ESTADO.classe];
  const nt = ESTADO.transportes.length;
  document.querySelector('#dd-transportes .dd-rotulo').textContent = 'Transportes' + (nt ? ' (' + nt + ')' : '');
  const na = ESTADO.alojamento.length;
  document.querySelector('#dd-alojamento .dd-rotulo').textContent = 'Alojamento' + (na ? ' (' + na + ')' : '');
  const ne = ESTADO.extras.length;
  document.querySelector('#dd-extras .dd-rotulo').textContent = 'Extras' + (ne ? ' (' + ne + ')' : '');
}

/* tipo de viagem */
document.querySelectorAll('input[name="tipo-viagem"]').forEach(r =>
  r.addEventListener('change', () => {
    ESTADO.tipo = r.value;
    const multi = ESTADO.tipo === 'multi';
    document.getElementById('linha-campos').style.display = multi ? 'none' : '';
    document.getElementById('zona-multi').hidden = !multi;
    if(multi && !ESTADO.trocos.length) iniciarTrocos();
    if(multi) desenharTrocos();
    const regresso = document.getElementById('input-regresso');
    if(ESTADO.tipo === 'so-ida'){
      ESTADO.volta = null; regresso.value = ''; regresso.placeholder = '(só ida)';
      regresso.closest('.campo').style.opacity = .55;
    }else{
      regresso.placeholder = 'Regresso';
      regresso.closest('.campo').style.opacity = 1;
    }
    actualizarRotulos();
    reactualizarResultados();
  }));

/* passageiros */
document.querySelectorAll('#dd-passageiros .contador').forEach(c => {
  const tipo = c.dataset.tipo, valor = c.querySelector('.valor');
  const limites = {adultos:[1,9], criancas:[0,8], bebes:[0,4]};
  const actualizar = () => {
    valor.textContent = ESTADO.pax[tipo];
    c.querySelector('.menos').disabled = ESTADO.pax[tipo] <= limites[tipo][0];
    c.querySelector('.mais').disabled = ESTADO.pax[tipo] >= limites[tipo][1];
    actualizarRotulos();
    reactualizarResultados();
  };
  c.querySelector('.menos').addEventListener('click', () => { ESTADO.pax[tipo] = Math.max(limites[tipo][0], ESTADO.pax[tipo]-1); actualizar(); });
  c.querySelector('.mais').addEventListener('click', () => { ESTADO.pax[tipo] = Math.min(limites[tipo][1], ESTADO.pax[tipo]+1); actualizar(); });
  actualizar();
});
document.querySelector('#dd-passageiros .painel-ok').addEventListener('click', () =>
  document.getElementById('dd-passageiros').classList.remove('aberto'));

/* classe */
document.querySelectorAll('input[name="classe"]').forEach(r =>
  r.addEventListener('change', () => { ESTADO.classe = r.value; actualizarRotulos(); reactualizarResultados(); }));

/* transportes e alojamento (caixas de selecção) */
document.querySelectorAll('input[name="transporte"]').forEach(cb =>
  cb.addEventListener('change', () => {
    ESTADO.transportes = [...document.querySelectorAll('input[name="transporte"]:checked')].map(x => x.value);
    actualizarRotulos();
    reactualizarResultados();
  }));
document.querySelectorAll('input[name="alojamento"]').forEach(cb =>
  cb.addEventListener('change', () => {
    ESTADO.alojamento = [...document.querySelectorAll('input[name="alojamento"]:checked')].map(x => x.value);
    actualizarRotulos();
    reactualizarResultados();
  }));
document.querySelectorAll('input[name="extra"]').forEach(cb =>
  cb.addEventListener('change', () => {
    ESTADO.extras = [...document.querySelectorAll('input[name="extra"]:checked')].map(x => x.value);
    actualizarRotulos();
    reactualizarResultados();
  }));

/* ── autocomplete (sugestões de cidades) ─────────────────────── */
const elSugestoes = document.getElementById('sugestoes');
let sugActivas = [], sugIndice = -1, sugInput = null, sugAoEscolher = null;

function ligarAutocomplete(input, aoEscolher){
  input.addEventListener('input', () => {
    input.dataset.cidade = '';
    const t = normalizar(input.value.trim());
    if(t.length < 1){ esconderSugestoes(); return; }
    sugActivas = CIDADES.filter(c =>
      normalizar(c.n).startsWith(t) || normalizar(c.p).startsWith(t) || c.i.toLowerCase() === t
    ).concat(CIDADES.filter(c =>
      !normalizar(c.n).startsWith(t) && !normalizar(c.p).startsWith(t) && (normalizar(c.n).includes(t) || normalizar(c.p).includes(t))
    )).slice(0, 7);
    if(!sugActivas.length){ esconderSugestoes(); return; }
    sugInput = input; sugAoEscolher = aoEscolher; sugIndice = -1;
    elSugestoes.innerHTML = sugActivas.map((c, i) => `
      <div class="sugestao" data-i="${i}">
        <span class="sug-ico">${c.f}</span>
        <span><span class="sug-nome">${c.n}</span> <span class="sug-pais">${c.p}</span></span>
        <span class="sug-iata">${c.i}</span>
      </div>`).join('');
    const r = input.getBoundingClientRect();
    elSugestoes.style.left = (r.left + window.scrollX) + 'px';
    elSugestoes.style.top = (r.bottom + window.scrollY + 6) + 'px';
    elSugestoes.style.minWidth = Math.max(r.width, 260) + 'px';
    elSugestoes.hidden = false;
    elSugestoes.querySelectorAll('.sugestao').forEach(s =>
      s.addEventListener('mousedown', e => { e.preventDefault(); escolherSugestao(+s.dataset.i); }));
  });
  input.addEventListener('keydown', e => {
    if(elSugestoes.hidden || sugInput !== input) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); sugIndice = Math.min(sugIndice+1, sugActivas.length-1); marcarSugestao(); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); sugIndice = Math.max(sugIndice-1, 0); marcarSugestao(); }
    else if(e.key === 'Enter'){ e.preventDefault(); escolherSugestao(sugIndice >= 0 ? sugIndice : 0); }
    else if(e.key === 'Escape'){ esconderSugestoes(); }
  });
  input.addEventListener('blur', () => setTimeout(() => { if(sugInput === input) esconderSugestoes(); }, 150));
}
function marcarSugestao(){
  elSugestoes.querySelectorAll('.sugestao').forEach((s, i) => s.classList.toggle('activa', i === sugIndice));
}
function escolherSugestao(i){
  const cidade = sugActivas[i];
  if(!cidade || !sugInput) return;
  sugInput.value = cidade.n;
  sugInput.dataset.cidade = cidade.n;
  esconderSugestoes();
  if(sugAoEscolher) sugAoEscolher(cidade);
}
function esconderSugestoes(){ elSugestoes.hidden = true; sugIndice = -1; }

const inputOrigem = document.getElementById('input-origem');
const inputDestino = document.getElementById('input-destino');
ligarAutocomplete(inputOrigem, c => { ESTADO.origem = c; reactualizarResultados(); });
ligarAutocomplete(inputDestino, c => { ESTADO.destino = c; reactualizarResultados(); });

document.getElementById('btn-trocar').addEventListener('click', () => {
  [inputOrigem.value, inputDestino.value] = [inputDestino.value, inputOrigem.value];
  [inputOrigem.dataset.cidade, inputDestino.dataset.cidade] = [inputDestino.dataset.cidade || '', inputOrigem.dataset.cidade || ''];
  [ESTADO.origem, ESTADO.destino] = [ESTADO.destino, ESTADO.origem];
  reactualizarResultados();
});

/* ── campos de datas → calendário ────────────────────────────── */
function resolverCidades(){
  ESTADO.origem = cidadePorNome(inputOrigem.value);
  ESTADO.destino = cidadePorNome(inputDestino.value);
}
function abrirCalendarioPrincipal(modo){
  resolverCidades();
  abrirCalendario({
    modo, sohIda: ESTADO.tipo === 'so-ida',
    ida: ESTADO.ida, volta: ESTADO.volta,
    origem: ESTADO.origem, destino: ESTADO.destino, classe: ESTADO.classe,
    aoEscolher(ida, volta){
      ESTADO.ida = ida; ESTADO.volta = volta;
      document.getElementById('input-partida').value = formatarDataCurta(ida);
      document.getElementById('input-regresso').value = formatarDataCurta(volta);
      reactualizarResultados();
    }
  });
}
document.getElementById('campo-partida').addEventListener('click', () => abrirCalendarioPrincipal('ida'));
document.getElementById('campo-regresso').addEventListener('click', () => {
  if(ESTADO.tipo === 'so-ida') return;
  abrirCalendarioPrincipal(ESTADO.ida ? 'volta' : 'ida');
});

/* ── várias cidades ──────────────────────────────────────────── */
function iniciarTrocos(){
  resolverCidades();
  const amanha = new Date(); amanha.setHours(0,0,0,0); amanha.setDate(amanha.getDate() + 14);
  ESTADO.trocos = [
    {origem: ESTADO.origem, destino: ESTADO.destino, data: ESTADO.ida || amanha},
    {origem: ESTADO.destino, destino: null, data: null}
  ];
}
function desenharTrocos(){
  const zona = document.getElementById('lista-trocos');
  zona.innerHTML = ESTADO.trocos.map((t, i) => `
    <div class="troco" data-i="${i}">
      <span class="troco-num">${i+1}</span>
      <div class="campo campo-texto"><span class="campo-ico">◉</span>
        <input type="text" class="troco-origem" placeholder="De onde?" autocomplete="off" value="${t.origem ? t.origem.n : ''}"></div>
      <div class="campo campo-texto"><span class="campo-ico">📍</span>
        <input type="text" class="troco-destino" placeholder="Para onde?" autocomplete="off" value="${t.destino ? t.destino.n : ''}"></div>
      <div class="campo campo-data"><span class="campo-ico">🗓</span>
        <input type="text" class="troco-data" placeholder="Partida" readonly value="${t.data ? formatarDataCurta(t.data) : ''}"></div>
      <button type="button" class="btn-remover" title="Remover este destino" ${ESTADO.trocos.length <= 2 ? 'disabled' : ''}>✕</button>
    </div>`).join('');

  zona.querySelectorAll('.troco').forEach(linha => {
    const i = +linha.dataset.i;
    ligarAutocomplete(linha.querySelector('.troco-origem'), c => { ESTADO.trocos[i].origem = c; reactualizarResultados(); });
    ligarAutocomplete(linha.querySelector('.troco-destino'), c => {
      ESTADO.trocos[i].destino = c;
      if(ESTADO.trocos[i+1] && !ESTADO.trocos[i+1].origem){ ESTADO.trocos[i+1].origem = c; desenharTrocos(); }
      reactualizarResultados();
    });
    linha.querySelector('.troco-data').addEventListener('click', () => {
      const t = ESTADO.trocos[i];
      t.origem = cidadePorNome(linha.querySelector('.troco-origem').value) || t.origem;
      t.destino = cidadePorNome(linha.querySelector('.troco-destino').value) || t.destino;
      abrirCalendario({
        modo:'ida', sohIda:true, ida:t.data,
        origem:t.origem, destino:t.destino, classe:ESTADO.classe,
        aoEscolher(ida){ t.data = ida; desenharTrocos(); reactualizarResultados(); }
      });
    });
    linha.querySelector('.btn-remover').addEventListener('click', () => {
      ESTADO.trocos.splice(i, 1); desenharTrocos(); reactualizarResultados();
    });
  });
}
document.getElementById('btn-add-troco').addEventListener('click', () => {
  if(ESTADO.trocos.length >= 5) return;
  const ultimo = ESTADO.trocos[ESTADO.trocos.length-1];
  ESTADO.trocos.push({origem: ultimo ? ultimo.destino : null, destino:null, data:null});
  desenharTrocos();
});
