/* ═════════════════════════════════════════════════════════════
   TripNexus · pecas de interface partilhadas

   O estado da pesquisa e as pecas que todos os outros ficheiros usam para
   desenhar: escapar texto, logotipos com cadeia de recurso, e as duas
   linhas de oferta (com preco e sem preco).

   Vai em primeiro lugar: e o unico que ninguem pode nao ter carregado.
   Estes ficheiros sao scripts normais, nao modulos: partilham o mesmo
   ambito global, e a ordem no index.html conta. A regra e declaracoes
   primeiro, ligacoes depois:

     ui, blocks, filters, results, offers   so declaram
     search                                 declara e regista ouvintes
     form                                   liga os controlos e pinta o
                                            estado inicial, o que ja chama
                                            o reactualizarResultados() do
                                            search.js
     app                                    arranca a pagina

   Enquanto isto era um ficheiro so, a chamada do form.js ao search.js
   funcionava por acaso: as declaracoes de funcao sobem ao topo do script
   que as contem, e estavam ambas no mesmo. Separadas, a ordem passou a ser
   a unica coisa que as segura.
   ═════════════════════════════════════════════════════════════ */

const ESTADO = {
  tipo:'ida-volta',                       // ida-volta | so-ida | multi
  pax:{adultos:1, criancas:0, bebes:0},
  classe:'economica',
  transportes:['metro'],
  alojamento:['hotel','airbnb'],
  extras:[],                              // bagagem de porão, cabina, seguro
  origem:null, destino:null, ida:null, volta:null,
  trocos:[],                              // várias cidades
  explorar:false                          // modo «Para onde?» vazio
};

let mapaResultados = null, mapaOfertas = null, mapaExplorar = null, ofertasDesenhadas = false;

/* ── utilidades de interface ─────────────────────────────────── */
function normalizar(t){
  return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
/* ── logótipos ────────────────────────────────────────────────
   Um serviço de ícones sozinho não chega. O do Google está em várias listas
   de bloqueio de publicidade e seguimento, e basta ter um bloqueador activo
   para todos os logótipos do site caírem ao mesmo tempo na inicial da
   empresa, que era exactamente o que se via. A correcção não é escolher
   outro serviço, é não depender de nenhum: tenta-se uma cadeia de fontes
   independentes e só quando todas falharem aparece o monograma.

   As alternativas viajam num atributo, separadas por «|», que não ocorre
   dentro de um URL. */
function proximoLogotipo(img){
  const restantes = (img.dataset.fontes || '').split('|').filter(Boolean);
  if(restantes.length){
    img.dataset.fontes = restantes.slice(1).join('|');
    img.src = restantes[0];
    return;
  }
  /* esgotadas as fontes, o monograma que está por baixo fica à vista */
  img.remove();
}
/* cor estável a partir do nome: a mesma empresa fica sempre com a mesma, e
   duas empresas com a mesma inicial não ficam com o mesmo quadrado */
function corDoNome(nome){
  let h = 0;
  for(let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) % 360;
  return h;
}
/* Caixa de logótipo: o monograma está sempre lá, por baixo, e a imagem
   cobre-o quando carrega. Assim não há troca de «display» nem um instante
   em branco à espera da imagem. */
function caixaLogotipo(fontes, nome, opts){
  const o = opts || {};
  const lista = (fontes || []).filter(Boolean);
  const rotulo = escaparHtml(o.titulo || nome || '');
  const inicial = escaparHtml((nome || '?').trim()[0] || '?').toUpperCase();
  return `<span class="icone-parceiro" title="${rotulo}">
    <span class="mono" style="background:hsl(${corDoNome(nome || '?')} 52% 40%)">${inicial}</span>
    ${lista.length ? `<img class="${o.foto ? 'foto' : 'logo'}" src="${escaparHtml(lista[0])}" alt="${rotulo}" loading="lazy"
         data-fontes="${escaparHtml(lista.slice(1).join('|'))}" onerror="proximoLogotipo(this)">` : ''}
  </span>`;
}
/* Três serviços independentes mais o favicon servido pelo próprio parceiro:
   para os logótipos desaparecerem todos, teriam de falhar os quatro. */
function fontesDoDominio(dom){
  if(!dom) return [];
  return [
    'https://icons.duckduckgo.com/ip3/' + dom + '.ico',
    'https://www.google.com/s2/favicons?sz=64&domain=' + dom,
    'https://' + dom + '/favicon.ico'
  ];
}
function iconeParceiro(chave){
  const p = PARCEIROS[chave];
  return caixaLogotipo(fontesDoDominio(p.dom), p.nome);
}
/* Logótipo de companhia aérea pelo código IATA. O pics.avs.io é o CDN da
   própria Travelpayouts, de quem já recebemos as tarifas. */
function iconeCompanhia(codigo, nome){
  const c = String(codigo || '').toUpperCase();
  return caixaLogotipo(c ? ['https://pics.avs.io/80/80/' + c + '.png'] : [], nome || c || '?');
}
function etiquetaCupao(cupao){
  if(!cupao) return '';
  return `<span class="cupao" title="${cupao.nota || ''}">🎟 ${cupao.codigo} ${cupao.texto}</span>`;
}
/* Distingue claramente um preço estimado de um preço real: o valor leva o
   sinal «≈», um selo explicativo e o botão convida a ver o preço real no
   parceiro, em vez de sugerir que esta é a oferta definitiva. */
function linhaOferta(q, opts){
  const p = PARCEIROS[q.parceiro];
  const o = opts || {};
  const est = o.estimativa !== false;   /* por omissão, é estimativa */
  return `<div class="linha-oferta ${o.melhor ? 'melhor' : ''}">
    ${iconeParceiro(q.parceiro)}
    <div class="oferta-info">
      <div class="oferta-nome">${p.nome}${o.tag ? ` <span class="alt-tag">${o.tag}</span>` : ''}${o.melhor ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
      ${o.detalhe ? `<div class="oferta-detalhe">${o.detalhe}</div>` : ''}
      ${etiquetaCupao(q.cupao)}
    </div>
    <div class="oferta-preco">
      ${q.cupao ? `<div class="preco-antes">${euros(q.preco)}</div>` : ''}
      <div class="preco-actual${est ? ' preco-estimado' : ''}">${est ? '≈ ' : ''}${euros(q.precoFinal)}</div>
      ${est ? '<div class="selo-estimativa" title="Valor calculado para comparação. O preço real é confirmado no site do parceiro.">estimativa</div>' : ''}
    </div>
    <a class="btn-ver" href="${o.url || '#'}" target="_blank" rel="noopener">${est ? 'Ver preço real' : 'Ver oferta'}</a>
  </div>`;
}
/* Linha de parceiro sem preço nenhum. Serve para as secções em que não há
   fonte de preços reais: mostrar um valor inventado seria pior do que não
   mostrar valor, porque dá ao utilizador uma confiança que não é devida. */
function linhaSemPreco(chave, opts){
  const p = PARCEIROS[chave];
  const o = opts || {};
  return `<div class="linha-oferta">
    ${iconeParceiro(chave)}
    <div class="oferta-info">
      <div class="oferta-nome">${p.nome}</div>
      ${o.detalhe ? `<div class="oferta-detalhe">${o.detalhe}</div>` : ''}
    </div>
    <a class="btn-ver" href="${o.url || '#'}" target="_blank" rel="noopener">Ver preços</a>
  </div>`;
}

function totalPax(){ return ESTADO.pax.adultos + ESTADO.pax.criancas + ESTADO.pax.bebes; }
/* as caixas de selecção usam «airbnb»; o motor usa o tipo «casa» */
function tiposAlojamento(){ return ESTADO.alojamento.map(t => t === 'airbnb' ? 'casa' : t); }

/* nomes de companhias vêm de uma API externa: escapar antes de os inserir */
function escaparHtml(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
/* «partidas» e «companhias» são listas: vazias significam «sem restrição»,
   o que permite escolher vários períodos do dia e várias companhias. */
