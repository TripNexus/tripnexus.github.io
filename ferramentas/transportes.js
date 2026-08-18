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
