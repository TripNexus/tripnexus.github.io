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

/* melhor preço (por adulto) para uma combinação exacta de datas */
function melhorPrecoExacto(origem, destino, ida, volta, classe){
  const pax1 = {adultos:1, criancas:0, bebes:0};
  let melhor = Infinity;
  for(const c of ['skyscanner','momondo','edreams']){
    const q = cotacaoVoo(c, origem, destino, ida, volta, classe, pax1);
    if(q.precoFinal < melhor) melhor = q.precoFinal;
  }
  return Math.round(melhor);
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

  /* preços de todos os dias visíveis, para saber qual é o mais barato */
  const precos = {};
  let minimo = Infinity;
  if(temRota){
    for(const mes of [CAL.mesBase, mes2]){
      const nDiasMes = new Date(mes.getFullYear(), mes.getMonth()+1, 0).getDate();
      for(let d = 1; d <= nDiasMes; d++){
        const dia = new Date(mes.getFullYear(), mes.getMonth(), d);
        if(dia < hoje) continue;
        let preco;
        if(CAL.modo === 'volta' && CAL.ida){
          if(dia <= CAL.ida) continue;
          preco = melhorPrecoExacto(CAL.origem, CAL.destino, CAL.ida, dia, CAL.classe);
        }else{
          preco = precoCalendario(CAL.origem, CAL.destino, dia, CAL.nDias, CAL.classe, CAL.sohIda);
        }
        precos[chaveData(dia)] = preco;
        if(preco < minimo) minimo = preco;
      }
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
      html += `<button type="button" class="${classes.join(' ')}" data-dia="${chave}" ${passado ? 'disabled' : ''}>
        <span class="cal-dia-num">${d}</span>
        ${preco !== undefined ? `<span class="cal-dia-preco">${euros(preco)}</span>` : ''}
      </button>`;
    }
    html += '</div></div>';
  }

  const legenda = `<span class="cal-legenda"><span class="tracinho"></span> Os preços sublinhados indicam o valor mais baixo apresentado</span>`;
  let rodapeInfo;
  if(!temRota){
    rodapeInfo = 'Indique a origem e o destino para ver preços no calendário.';
  }else if(CAL.modo === 'volta' && CAL.ida){
    rodapeInfo = `A mostrar o preço total de ida e volta, em EUR por passageiro, para partida a ${formatarDataCurta(CAL.ida)}.`;
  }else if(CAL.sohIda){
    rodapeInfo = 'A mostrar preços em EUR, por passageiro, para viagens só de ida.';
  }else{
    rodapeInfo = `A mostrar preços em EUR para
      <span class="cal-duracao"><button type="button" id="cal-len-menos">‹</button>
      <strong>viagens de ${CAL.nDias} dias</strong>
      <button type="button" id="cal-len-mais">›</button></span>`;
  }

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
