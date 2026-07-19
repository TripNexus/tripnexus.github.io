/* ═══════════════════════════════════════════════════════════════
   TripNexus: preços em tempo real (opcional)
   Quando window.TRIPNEXUS_API aponta para o backend (ver
   backend/README.md), o bloco de voos passa a mostrar tarifas
   reais obtidas na hora; sem backend configurado, o site mantém
   as estimativas do motor local.
   ═══════════════════════════════════════════════════════════════ */

async function actualizarVoosReais(ctx){
  const base = (window.TRIPNEXUS_API || '').replace(/\/$/, '');
  const bloco = document.getElementById('bloco-voos');
  if(!base || !bloco || !ctx.origem || !ctx.destino || !ctx.ida) return;
  const f = x => x.getFullYear() + '-' + String(x.getMonth()+1).padStart(2,'0') + '-' + String(x.getDate()).padStart(2,'0');
  try{
    const ps = new URLSearchParams({
      origem: ctx.origem.i, destino: ctx.destino.i, ida: f(ctx.ida),
      adultos: ctx.adultos || 1, criancas: ctx.criancas || 0, classe: ctx.classe || 'economica'
    });
    if(ctx.volta) ps.set('volta', f(ctx.volta));
    const r = await fetch(base + '/voos?' + ps);
    if(!r.ok) return;
    const dados = await r.json();
    if(!dados || !Array.isArray(dados.ofertas) || !dados.ofertas.length) return;
    const liga = ligacaoParceiro('skyscanner', {...ctx, seccao:'voo'});
    const notaClasse = (dados.classe === 'economica' && ctx.classe && ctx.classe !== 'economica')
      ? '<p class="bloco-sub">Nota: as tarifas reais disponíveis para esta rota são em classe económica.</p>' : '';
    bloco.innerHTML = `
      <div class="bloco-titulo">✈ Voos · tarifas reais</div>
      <p class="bloco-sub tempo-real">⚡ Tarifas reais registadas nas últimas horas (Aviasales/Travelpayouts). Total para todos os passageiros.</p>
      ${notaClasse}
      ${dados.ofertas.slice(0, 8).map((v, idx) => `
        <div class="linha-oferta ${idx === 0 ? 'melhor' : ''}">
          <span class="icone-parceiro"><span class="letra" style="display:flex">${(v.companhia || '?')[0]}</span></span>
          <div class="oferta-info">
            <div class="oferta-nome">${v.companhia || 'Companhia aérea'}${idx === 0 ? ' <span class="selo-melhor">Mais barato</span>' : ''}</div>
            <div class="oferta-detalhe">${v.escalas === 0 ? 'directo' : v.escalas + (v.escalas === 1 ? ' escala' : ' escalas')} · ${v.duracao || ''} · partida ${v.partida || ''}</div>
          </div>
          <div class="oferta-preco"><div class="preco-actual">${Math.round(v.preco)} €</div></div>
          <a class="btn-ver" href="${liga}" target="_blank" rel="noopener">Reservar</a>
        </div>`).join('')}
      <p class="bloco-sub">A reserva é concluída no site do parceiro, já com a rota e as datas preenchidas.</p>`;
  }catch(e){
    /* sem rede ou backend indisponível: ficam as estimativas locais */
  }
}
