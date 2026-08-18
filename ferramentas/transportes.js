#!/usr/bin/env node
/* ═════════════════════════════════════════════════════════════
   TripNexus · o que falta rever nas tarifas de transportes

   Corra `node ferramentas/transportes.js` no início de cada mês. Diz três
   coisas, por esta ordem de urgência:

     1. cidades com tarifas confirmadas há mais de TRANSPORTES_REVISAO_DIAS
        (o site já as está a mostrar com aviso ao utilizador);
     2. cidades que estão na tabela só com o operador, à espera de valores;
     3. cidades do site que nem sequer têm operador.

   Com `--csv` despeja a lista toda em CSV, para levar para uma folha.
   Com `--url` imprime só os endereços por abrir, um por linha, que é o que
   se cola no navegador para fazer a ronda.
   Com `--folha` escreve uma folha de revisão em Markdown: por cidade, o
   endereço a abrir e os valores que lá temos, com espaço para escrever os
   que se encontrarem. É o que se leva para a ronda feita à mão.

   Não vai à rede: lê o data.js e faz as contas. Quem vai à rede é quem
   estiver a fazer a revisão.
   ═════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const fonte = fs.readFileSync(path.join(RAIZ, 'assets/js/data.js'), 'utf8');

/* O data.js é um script de navegador, não um módulo. Avalia-se num contexto
   vazio e colhem-se as três coisas de que precisamos. */
const contexto = {};
new Function('globalThis', fonte + `
  globalThis.CIDADES = CIDADES;
  globalThis.TRANSPORTES_DESTINO = TRANSPORTES_DESTINO;
  globalThis.TRANSPORTES_REVISAO_DIAS = TRANSPORTES_REVISAO_DIAS;
  globalThis.diasDesdeRevisao = diasDesdeRevisao;
  globalThis.tarifaPorRever = tarifaPorRever;
`)(contexto);

const {CIDADES, TRANSPORTES_DESTINO: T, TRANSPORTES_REVISAO_DIAS: PRAZO,
       diasDesdeRevisao, tarifaPorRever} = contexto;

const comTarifa = [], soOperador = [], semNada = [];
for(const c of CIDADES){
  const t = T[c.n];
  if(!t){ semNada.push(c); continue; }
  const linha = {
    cidade: c.n, pais: c.p, operador: t.operador,
    url: t.fonte || t.url, comprar: t.comprar || '',
    moeda: t.moeda || 'EUR',
    titulos: (t.bilhetes || []).length,
    actualizado: t.actualizado || '',
    dias: diasDesdeRevisao(t),
    rever: tarifaPorRever(t)
  };
  (linha.titulos ? comTarifa : soOperador).push(linha);
}

const args = process.argv.slice(2);

if(args.includes('--csv')){
  console.log('cidade,pais,operador,moeda,titulos,actualizado,dias,rever,url,comprar');
  for(const l of [...comTarifa, ...soOperador])
    console.log([l.cidade, l.pais, l.operador, l.moeda, l.titulos, l.actualizado,
                 l.dias === null ? '' : l.dias, l.rever ? 'sim' : 'nao', l.url, l.comprar]
                .map(x => `"${String(x).replace(/"/g, '""')}"`).join(','));
  for(const c of semNada)
    console.log([c.n, c.p, '', '', 0, '', '', 'sim', '', ''].map(x => `"${x}"`).join(','));
  process.exit(0);
}

if(args.includes('--url')){
  for(const l of [...comTarifa.filter(x => x.rever), ...soOperador]) console.log(l.url);
  process.exit(0);
}

if(args.includes('--folha')){
  /* Uma folha para levar para a ronda: por cidade, a ligação a abrir e o
     que temos hoje, para se conferir linha a linha. Quem a preencher não
     precisa de saber onde fica o data.js. */
  const linha = l => {
    const t = T[l.cidade];
    const tit = (t.bilhetes || []).map(b =>
      `| ${b.nome} | ${b.preco} ${l.moeda} | por ${b.unidade} | | |`).join('\n');
    return [
      `### ${l.cidade}  ·  ${l.operador}`, '',
      `Abrir: <${l.url}>`, '',
      l.titulos
        ? `| Título | Temos | Unidade | **É** | **Ainda existe?** |\n|---|---|---|---|---|\n${tit}`
        : `Não temos valores nenhuns. Escreva os títulos que a página tiver:\n\n| Título | Preço | Unidade |\n|---|---|---|\n| | | |`,
      ''
    ].join('\n');
  };
  const atrasadas = comTarifa.filter(l => l.rever).sort((a,b) => (b.dias||0) - (a.dias||0));
  console.log('# Folha de revisão das tarifas de transportes');
  console.log('');
  console.log('Preencha as colunas a **negrito** e devolva a folha. Regras:');
  console.log('');
  console.log('- o valor tem de vir da página do operador, não de um guia de viagens;');
  console.log('- se um título já não existir, escreva «extinto» na última coluna;');
  console.log('- se a página não for clara, deixe em branco: melhor vazio do que errado.');
  console.log('');
  console.log('## 1. Têm preços no site e estão por reconferir (' + atrasadas.length + ')');
  console.log('');
  console.log('Estas são as urgentes: o site está a mostrar estes números a quem o visita.');
  console.log('');
  atrasadas.forEach(l => console.log(linha(l)));
  console.log('## 2. Têm operador, faltam os valores (' + soOperador.length + ')');
  console.log('');
  soOperador.forEach(l => console.log(linha(l)));
  console.log('## 3. Sem operador (' + semNada.length + ')');
  console.log('');
  console.log('Falta descobrir quem opera os transportes e qual é a página de tarifário.');
  console.log('');
  semNada.forEach(c => console.log('- ' + c.n + ' (' + c.p + '): operador ______  ·  endereço ______'));
  process.exit(0);
}

const N = n => String(n).padStart(3);
const atrasadas = comTarifa.filter(l => l.rever).sort((a, b) => (b.dias || 0) - (a.dias || 0));
const emDia = comTarifa.filter(l => !l.rever);

console.log('');
console.log('TARIFAS DE TRANSPORTES · prazo de revisão: %d dias', PRAZO);
console.log(N(CIDADES.length) + ' cidades no site · ' + N(comTarifa.length) + ' com tarifas · '
  + N(soOperador.length) + ' só com operador · ' + N(semNada.length) + ' sem operador');

if(atrasadas.length){
  console.log('\n1. POR REVER (o site já avisa o utilizador destas)');
  for(const l of atrasadas)
    console.log('   ' + N(l.dias) + '  ' + l.cidade.padEnd(17) + l.operador.padEnd(35) + l.url);
}else{
  console.log('\n1. POR REVER: nenhuma. Todas dentro do prazo.');
}

if(soOperador.length){
  console.log('\n2. SEM VALORES (têm operador e ligação, faltam as tarifas)');
  for(const l of soOperador)
    console.log('       ' + l.cidade.padEnd(17) + l.operador.padEnd(35) + l.url);
}

if(semNada.length){
  console.log('\n3. SEM OPERADOR (%d cidades; estas mostram só uma procura)', semNada.length);
  const nomes = semNada.map(c => c.n);
  for(let i = 0; i < nomes.length; i += 4)
    console.log('       ' + nomes.slice(i, i + 4).map(n => n.padEnd(18)).join(''));
}

if(emDia.length){
  console.log('\nEM DIA (%d): %s', emDia.length, emDia.map(l => l.cidade).join(', '));
}
console.log('');
