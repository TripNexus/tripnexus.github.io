/* ═══════════════════════════════════════════════════════════════
   TripNexus: calendário de datas com preços (estilo Google Voos)
   ═══════════════════════════════════════════════════════════════ */

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DIAS_SEMANA = ['D','S','T','Q','Q','S','S'];            // Domingo → Sábado
const DIAS_ABREV = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const CAL = {
  aberto:false, mesBase:null, nDias:7, modo:'ida',
  ida:null, volta:null, sohIda:false, origem:null, destino:null,
  classe:'economica', aoEscolher:null
};

function formatarDataCurta(d){
  if(!d) return '';
  return DIAS_ABREV[d.getDay()] + ', ' + d.getDate() + ' ' + MESES_ABREV[d.getMonth()];
}
function mesmoDia(a,b){ return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function hojeZero(){ const h = new Date(); h.setHours(0,0,0,0); return h; }

/* ── preços do calendário ─────────────────────────────────────
   Estes números eram inventados. Vinham do `cotacaoVoo()` do motor local,
   que os gera com um gerador pseudo-aleatório com semente — estáveis entre
   visitas, e por isso convincentes, mas sem qualquer relação com o que custa
   voar. Apareciam sem ressalva nenhuma, ao lado dos preços reais do resto do
   site, e o utilizador escolhia as datas por eles.

   Passam a vir do backend, da mesma fonte das tarifas (Travelpayouts). Um
   dia sem tarifa registada fica sem preço — que é a verdade — em vez de
   receber um número plausível. */
const CACHE_CAL = {};        /* chave → {estado, precos} */

function chaveCalendario(mes){
  return [CAL.origem && CAL.origem.i, CAL.destino && CAL.destino.i,
          mes.getFullYear() + '-' + String(mes.getMonth() + 1).padStart(2, '0'),
          CAL.modo === 'volta' && CAL.ida ? chaveData(CAL.ida) : '',
          CAL.sohIda ? 'ida' : CAL.nDias].join('|');
}

/* Pede ao backend os preços de um mês. Devolve depressa se já os tiver: a
   grelha é redesenhada a cada clique e não pode pedir de cada vez. */
function carregarPrecosCalendario(mes){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  if(!base || !CAL.origem || !CAL.destino) return;
  const chave = chaveCalendario(mes);
  if(CACHE_CAL[chave]) return;
  CACHE_CAL[chave] = {estado:'a carregar', precos:{}};
  const ps = new URLSearchParams({
    origem: CAL.origem.i, destino: CAL.destino.i,
    mes: mes.getFullYear() + '-' + String(mes.getMonth() + 1).padStart(2, '0')
  });
  if(CAL.sohIda) ps.set('soIda', '1');
  else if(CAL.modo === 'volta' && CAL.ida) ps.set('ida', chaveData(CAL.ida));
  else ps.set('dias', CAL.nDias);
  fetch(base + '/calendario?' + ps)
    .then(r => r.ok ? r.json() : null)
    .then(d => {
      CACHE_CAL[chave] = {estado:'pronto', precos:(d && d.precos) || {},
                          noites:(d && d.noites) || {}};
      if(CAL.aberto) desenharCalendario();
    })
    .catch(() => {
      CACHE_CAL[chave] = {estado:'falhou', precos:{}, noites:{}};
      if(CAL.aberto) desenharCalendario();
    });
}

function abrirCalendario(opcoes){
  Object.assign(CAL, {
    aberto:true, modo:opcoes.modo || 'ida',
    ida:opcoes.ida || null, volta:opcoes.volta || null,
    sohIda:!!opcoes.sohIda, origem:opcoes.origem || null, destino:opcoes.destino || null,
    classe:opcoes.classe || 'economica', aoEscolher:opcoes.aoEscolher || null
  });
  if(CAL.sohIda) CAL.modo = 'ida';
  const base = CAL.ida || hojeZero();
  CAL.mesBase = new Date(base.getFullYear(), base.getMonth(), 1);
  document.getElementById('cal-sombra').hidden = false;
  document.getElementById('calendario').hidden = false;
  desenharCalendario();
}

function fecharCalendario(aplicar){
  if(!CAL.aberto) return;
  CAL.aberto = false;
  document.getElementById('cal-sombra').hidden = true;
  document.getElementById('calendario').hidden = true;
  if(aplicar !== false && CAL.aoEscolher) CAL.aoEscolher(CAL.ida, CAL.volta);
}

function desenharCalendario(){
  const el = document.getElementById('calendario');
  const temRota = CAL.origem && CAL.destino;
  const hoje = hojeZero();
  const mes2 = new Date(CAL.mesBase.getFullYear(), CAL.mesBase.getMonth() + 1, 1);
  const limite = new Date(hoje.getFullYear(), hoje.getMonth() + 11, 1);

  /* preços de todos os dias visíveis, para saber qual é o mais barato.
     Vêm do backend; os dias sem tarifa registada ficam sem preço. */
  const precos = {}, noitesDe = {};
  let minimo = Infinity, aCarregar = false, semBackend = false;
  if(temRota){
    for(const mes of [CAL.mesBase, mes2]){
      carregarPrecosCalendario(mes);
      const registo = CACHE_CAL[chaveCalendario(mes)];
      if(!registo){ semBackend = true; continue; }
      if(registo.estado === 'a carregar'){ aCarregar = true; continue; }
      for(const [chave, preco] of Object.entries(registo.precos)){
        precos[chave] = preco;
        if(preco < minimo) minimo = preco;
      }
      /* dias em que a tarifa mais próxima não é da duração pedida */
      Object.assign(noitesDe, registo.noites || {});
    }
  }

  const tipoTxt = CAL.sohIda ? 'Só ida' : 'Ida e volta';
  let html = `
    <div class="cal-topo">
      <span class="cal-tipo">⇄ ${tipoTxt}</span>
      <div class="cal-caixas">
        <div class="cal-caixa ${CAL.modo==='ida'?'activa':''}" id="cal-cx-ida" role="button">🗓 ${CAL.ida ? '<strong>'+formatarDataCurta(CAL.ida)+'</strong>' : 'Partida'}</div>
        ${CAL.sohIda ? '' : `<div class="cal-caixa ${CAL.modo==='volta'?'activa':''}" id="cal-cx-volta" role="button">🗓 ${CAL.volta ? '<strong>'+formatarDataCurta(CAL.volta)+'</strong>' : 'Regresso'}</div>`}
      </div>
      <button type="button" class="cal-repor" id="cal-repor">Repor</button>
    </div>
    <div class="cal-corpo">
      <button type="button" class="cal-nav cal-nav-ant" id="cal-ant" ${CAL.mesBase <= new Date(hoje.getFullYear(), hoje.getMonth(), 1) ? 'disabled' : ''}>‹</button>
      <button type="button" class="cal-nav cal-nav-seg" id="cal-seg" ${mes2 >= limite ? 'disabled' : ''}>›</button>
      <div class="cal-meses">`;

  for(const mes of [CAL.mesBase, mes2]){
    const anoActual = mes.getFullYear() === hoje.getFullYear();
    html += `<div class="cal-mes"><div class="cal-mes-titulo">${MESES[mes.getMonth()]}${anoActual ? '' : ' ' + mes.getFullYear()}</div><div class="cal-grelha">`;
    html += DIAS_SEMANA.map(d => `<span class="cal-dw">${d}</span>`).join('');
    const primeiro = new Date(mes.getFullYear(), mes.getMonth(), 1);
    for(let v = 0; v < primeiro.getDay(); v++) html += '<button class="cal-dia vazio" disabled></button>';
    const nDiasMes = new Date(mes.getFullYear(), mes.getMonth()+1, 0).getDate();
    for(let d = 1; d <= nDiasMes; d++){
      const dia = new Date(mes.getFullYear(), mes.getMonth(), d);
      const chave = chaveData(dia);
      const passado = dia < hoje || (CAL.modo === 'volta' && CAL.ida && dia <= CAL.ida);
      const preco = precos[chave];
      const seleccionado = mesmoDia(dia, CAL.ida) || mesmoDia(dia, CAL.volta);
      const intervalo = CAL.ida && CAL.volta && dia > CAL.ida && dia < CAL.volta;
      const classes = ['cal-dia'];
      if(seleccionado) classes.push('seleccionado');
      if(intervalo) classes.push('intervalo');
      if(preco !== undefined && preco === minimo) classes.push('mais-barato');
      /* a tarifa mais próxima pode não ser da duração pedida: nesse caso
         diz-se de quantas noites é, em vez de a fazer passar pela pedida */
      const n = noitesDe[chave];
      if(n) classes.push('outra-duracao');
      const titulo = n ? ` title="Tarifa de uma viagem de ${n} ${n === 1 ? 'noite' : 'noites'}, não de ${CAL.nDias}"` : '';
      html += `<button type="button" class="${classes.join(' ')}" data-dia="${chave}"${titulo} ${passado ? 'disabled' : ''}>
        <span class="cal-dia-num">${d}</span>
        ${preco !== undefined ? `<span class="cal-dia-preco">${euros(preco)}${n ? '<em>' + n + 'n</em>' : ''}</span>` : ''}
      </button>`;
    }
    html += '</div></div>';
  }

  const legenda = `<span class="cal-legenda"><span class="tracinho"></span> Os preços sublinhados indicam o valor mais baixo apresentado</span>`;
  const duracao = `<span class="cal-duracao"><button type="button" id="cal-len-menos">‹</button>
      <strong>viagens de ${CAL.nDias} dias</strong>
      <button type="button" id="cal-len-mais">›</button></span>`;
  let rodapeInfo;
  if(!temRota){
    rodapeInfo = 'Indique a origem e o destino para ver preços no calendário.';
  }else if(semBackend){
    rodapeInfo = 'Sem ligação ao backend não há preços por dia. As datas continuam a poder ser escolhidas.';
  }else if(aCarregar){
    rodapeInfo = '⏳ A procurar tarifas reais…';
  }else if(CAL.modo === 'volta' && CAL.ida){
    rodapeInfo = `Tarifas <strong>reais</strong> de ida e volta, em EUR por passageiro, para partida a ${formatarDataCurta(CAL.ida)}.`;
  }else if(CAL.sohIda){
    rodapeInfo = 'Tarifas <strong>reais</strong> em EUR, por passageiro, para viagens só de ida.';
  }else{
    rodapeInfo = `Tarifas <strong>reais</strong> em EUR para ${duracao}`;
  }
  /* a duração é escolhida pelo utilizador e tem de continuar acessível
     enquanto os preços carregam, senão o botão desaparece a meio */
  if(temRota && !CAL.sohIda && !(CAL.modo === 'volta' && CAL.ida) && (aCarregar || semBackend))
    rodapeInfo += ' ' + duracao;
  const semPrecos = temRota && !aCarregar && !semBackend && !Object.keys(precos).length;
  if(semPrecos)
    rodapeInfo = `Não há tarifas registadas para esta rota em ${MESES[CAL.mesBase.getMonth()]}. ` +
      (CAL.sohIda || (CAL.modo === 'volta' && CAL.ida) ? '' : 'Experimente outra duração: ' + duracao);

  html += `</div></div>
    <div class="cal-rodape">
      <span class="cal-duracao">${rodapeInfo}</span>
      ${temRota ? legenda : ''}
      <button type="button" class="cal-concluir" id="cal-concluir">Concluído</button>
    </div>`;

  el.innerHTML = html;

  /* ligações de eventos */
  el.querySelector('#cal-ant').onclick = () => { CAL.mesBase = new Date(CAL.mesBase.getFullYear(), CAL.mesBase.getMonth()-1, 1); desenharCalendario(); };
  el.querySelector('#cal-seg').onclick = () => { CAL.mesBase = new Date(CAL.mesBase.getFullYear(), CAL.mesBase.getMonth()+1, 1); desenharCalendario(); };
  el.querySelector('#cal-repor').onclick = () => { CAL.ida = null; CAL.volta = null; CAL.modo = 'ida'; desenharCalendario(); };
  el.querySelector('#cal-cx-ida').onclick = () => { CAL.modo = 'ida'; desenharCalendario(); };
  const cxVolta = el.querySelector('#cal-cx-volta');
  if(cxVolta) cxVolta.onclick = () => { if(CAL.ida){ CAL.modo = 'volta'; desenharCalendario(); } };
  el.querySelector('#cal-concluir').onclick = () => fecharCalendario(true);
  const menos = el.querySelector('#cal-len-menos'), mais = el.querySelector('#cal-len-mais');
  /* mudar a duração muda a pergunta ao backend, não só a apresentação */
  if(menos) menos.onclick = () => { if(CAL.nDias > 2){ CAL.nDias--; desenharCalendario(); } };
  if(mais)  mais.onclick  = () => { if(CAL.nDias < 21){ CAL.nDias++; desenharCalendario(); } };

  el.querySelectorAll('.cal-dia[data-dia]:not(:disabled)').forEach(btn => {
    btn.onclick = () => {
      const [a,m,d] = btn.dataset.dia.split('-').map(Number);
      const dia = new Date(a, m-1, d);
      if(CAL.sohIda){
        CAL.ida = dia; CAL.volta = null;
        desenharCalendario();
        setTimeout(() => fecharCalendario(true), 180);
        return;
      }
      if(CAL.modo === 'ida' || (CAL.ida && dia < CAL.ida)){
        CAL.ida = dia;
        if(CAL.volta && CAL.volta <= dia) CAL.volta = null;
        CAL.modo = 'volta';
      }else{
        CAL.volta = dia;
        desenharCalendario();
        setTimeout(() => fecharCalendario(true), 180);
        return;
      }
      desenharCalendario();
    };
  });
}

document.addEventListener('keydown', e => { if(e.key === 'Escape') fecharCalendario(true); });
document.getElementById('cal-sombra').addEventListener('click', () => fecharCalendario(true));
