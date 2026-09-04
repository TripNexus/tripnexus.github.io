#!/usr/bin/env node
/* ═════════════════════════════════════════════════════════════
   TripNexus · teste de fumo

   Corre `node tests/fumo.js` (ou `npm run test:fumo`, depois de
   `npm ci` e `npx playwright install --with-deps chromium`). Serve o
   site localmente, abre-o num Chromium sem cabeça e percorre os
   caminhos principais à procura de erros de JavaScript. Não confirma
   preços nem texto exacto: só que nada rebenta.

   A maior parte dos passos corre em ecrã largo (1280px); os últimos
   correm num segundo contexto em ecrã estreito (390px, abaixo dos
   720px do ponto de quebra do CSS), para apanhar o que só existe nessa
   vista: o botão de menu (hambúrguer), o painel do `nav-principal` e o
   fecho automático do menu ao escolher uma opção.

   Os pedidos de rede que não sejam para o próprio servidor local saem
   todos bloqueados (Wikipédia, câmbios ao vivo, o backend de preços
   reais, CDNs), para o resultado não depender de serviços externos
   nem da ligação à rede de quem corre o teste.

   Sai com código 0 se tudo passar, 1 caso contrário. É isto que a
   GitHub Action corre em cada PR (.github/workflows/fumo.yml).
   ═════════════════════════════════════════════════════════════ */
'use strict';
const path = require('path');
const {chromium} = require('playwright');
const {iniciar} = require('./servidor');

const RAIZ = path.join(__dirname, '..');
const PORTA = 8912;
const BASE = `http://127.0.0.1:${PORTA}`;

const f = d => d.toISOString().slice(0, 10);
const IDA = f(new Date(Date.UTC(2026, 9, 15)));
const VOLTA = f(new Date(Date.UTC(2026, 9, 22)));

const falhas = [];
function verificar(condicao, descricao){
  if(condicao){ console.log('  ok    ' + descricao); }
  else { console.log('  FALHA ' + descricao); falhas.push(descricao); }
}

(async () => {
  const servidor = await iniciar(RAIZ, PORTA);
  const navegador = await chromium.launch({executablePath: process.env.FUMO_CHROMIUM});
  const contexto = await navegador.newContext({viewport: {width: 1280, height: 1000}, serviceWorkers: 'block'});
  const pagina = await contexto.newPage();

  const erros = [];
  pagina.on('pageerror', e => erros.push('pageerror: ' + e.message));
  pagina.on('console', m => {
    if(m.type() !== 'error') return;
    const texto = m.text();
    /* ruído esperado dos pedidos externos bloqueados de propósito */
    if(/ERR_|net::|Failed to load resource/.test(texto)) return;
    erros.push('console: ' + texto);
  });
  await pagina.route('**/*', route => {
    const url = route.request().url();
    if(url.startsWith(BASE)) return route.continue();
    return route.abort();
  });

  console.log('1. pesquisa simples (Lisboa → Paris)');
  await pagina.goto(`${BASE}/index.html?de=Lisboa&para=Paris&ida=${IDA}&volta=${VOLTA}&tipo=ida-volta`,
    {waitUntil: 'domcontentloaded'});
  await pagina.waitForTimeout(2500);
  verificar(await pagina.isVisible('#resultados'), '#resultados fica visível');
  const abas = await pagina.$$eval('.abas-resultados .aba', els => els.map(e => e.dataset.ir));
  verificar(abas.includes('voos') && abas.includes('transportes'), 'abas de resultados incluem voos e transportes');

  console.log('2. cada aba de resultados');
  for(const id of abas){
    await pagina.click(`.aba[data-ir="${id}"]`);
    await pagina.waitForTimeout(300);
  }
  verificar(true, 'todas as abas clicam sem excepção');

  console.log('3. transportes locais no destino');
  await pagina.click('.aba[data-ir="transportes"]');
  await pagina.waitForTimeout(300);
  const temTransportes = await pagina.evaluate(() =>
    !!document.querySelector('[data-aba="transportes"] .bloco-sub'));
  verificar(temTransportes, 'bloco de transportes locais tem conteúdo');

  console.log('4. vista «ofertas em conta»');
  await pagina.click('.nav-btn[data-vista="ofertas"]');
  await pagina.waitForTimeout(2000);
  verificar(await pagina.isVisible('#vista-ofertas'), 'vista de ofertas fica visível');
  verificar(await pagina.isVisible('#grelha-ofertas'), 'grelha de ofertas existe (cartões ou aviso, consoante o backend)');

  console.log('5. vista «parceiros»');
  await pagina.click('.nav-btn[data-vista="parceiros"]');
  await pagina.waitForTimeout(500);
  const parceiros = await pagina.$$eval('#grelha-parceiros .parceiro-item', els => els.length);
  verificar(parceiros > 50, `grelha de parceiros tem ${parceiros} entradas (>50 esperadas)`);

  console.log('6. tema e moeda');
  await pagina.click('.nav-btn[data-vista="pesquisa"]');
  await pagina.waitForTimeout(200);
  const temaAntes = await pagina.evaluate(() => document.documentElement.getAttribute('data-tema'));
  await pagina.click('#btn-tema');
  await pagina.waitForTimeout(200);
  const temaDepois = await pagina.evaluate(() => document.documentElement.getAttribute('data-tema'));
  verificar(temaAntes !== temaDepois, 'alternar tema muda o atributo data-tema');
  await pagina.selectOption('#sel-moeda', 'GBP');
  await pagina.waitForTimeout(1000);
  verificar((await pagina.$eval('#sel-moeda', el => el.value)) === 'GBP', 'selector de moeda aceita GBP');

  console.log('7. várias cidades');
  await pagina.goto(`${BASE}/index.html?tipo=multi&trocos=Lisboa-Paris-${IDA},Paris-Roma-${VOLTA}`,
    {waitUntil: 'domcontentloaded'});
  await pagina.waitForTimeout(2500);
  verificar(await pagina.isVisible('#resultados'), 'pesquisa multi-cidade produz resultados');

  console.log('8. explorar destinos');
  await pagina.goto(`${BASE}/index.html?explorar=1&de=Lisboa&ida=${IDA}&volta=${VOLTA}&tipo=ida-volta`,
    {waitUntil: 'domcontentloaded'});
  await pagina.waitForTimeout(2500);
  verificar(await pagina.isVisible('#resultados'), 'explorar destinos produz resultados');

  console.log('9. hambúrguer do menu, em ecrã de telemóvel (<720px)');
  const contextoMovel = await navegador.newContext({
    viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true, serviceWorkers: 'block'
  });
  const paginaMovel = await contextoMovel.newPage();
  paginaMovel.on('pageerror', e => erros.push('pageerror (mobile): ' + e.message));
  paginaMovel.on('console', m => {
    if(m.type() !== 'error') return;
    const texto = m.text();
    if(/ERR_|net::|Failed to load resource/.test(texto)) return;
    erros.push('console (mobile): ' + texto);
  });
  await paginaMovel.route('**/*', route => {
    const url = route.request().url();
    if(url.startsWith(BASE)) return route.continue();
    return route.abort();
  });
  await paginaMovel.goto(`${BASE}/index.html?de=Lisboa&para=Paris&ida=${IDA}&volta=${VOLTA}&tipo=ida-volta`,
    {waitUntil: 'domcontentloaded'});
  await paginaMovel.waitForTimeout(2500);
  verificar(await paginaMovel.isVisible('#btn-menu-movel'), 'botão de menu (hambúrguer) fica visível em ecrã estreito');
  verificar(!(await paginaMovel.isVisible('#nav-principal.aberto')), 'painel do menu começa fechado');
  await paginaMovel.click('#btn-menu-movel');
  await paginaMovel.waitForTimeout(300);
  verificar(await paginaMovel.isVisible('#nav-principal.aberto'), 'clicar no hambúrguer abre o painel do menu');

  console.log('10. transportes locais e ofertas, em ecrã de telemóvel');
  const abasMovel = await paginaMovel.$$eval('.abas-resultados .aba', els => els.map(e => e.dataset.ir));
  verificar(abasMovel.includes('transportes'), 'abas de resultados também aparecem em ecrã estreito');
  await paginaMovel.click('.aba[data-ir="transportes"]');
  await paginaMovel.waitForTimeout(300);
  const temTransportesMovel = await paginaMovel.evaluate(() =>
    !!document.querySelector('[data-aba="transportes"] .bloco-sub'));
  verificar(temTransportesMovel, 'bloco de transportes locais tem conteúdo em ecrã estreito');

  await paginaMovel.click('#btn-menu-movel');
  await paginaMovel.waitForTimeout(300);
  await paginaMovel.click('.nav-btn[data-vista="ofertas"]');
  await paginaMovel.waitForTimeout(2000);
  verificar(await paginaMovel.isVisible('#vista-ofertas'), 'vista de ofertas fica visível em ecrã estreito');
  verificar(!(await paginaMovel.isVisible('#nav-principal.aberto')), 'o menu fecha sozinho depois de escolher uma vista');

  await contextoMovel.close();

  verificar(erros.length === 0, `zero erros de JavaScript (encontrados: ${erros.length})`);
  erros.forEach(e => console.log('    · ' + e));

  await navegador.close();
  servidor.close();

  console.log('');
  if(falhas.length){
    console.log(`FUMO: ${falhas.length} falha(s).`);
    process.exit(1);
  }
  console.log('FUMO: tudo bem.');
  process.exit(0);
})().catch(erro => {
  console.error('erro a correr o teste de fumo:', erro);
  process.exit(1);
});
