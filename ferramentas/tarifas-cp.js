#!/usr/bin/env node
/* ═════════════════════════════════════════════════════════════
   TripNexus · a CP mudou algum PDF de tarifário?

   A CP publica o preço do Intercidades por PDF, um por linha, com texto a
   sério (ler.py e o pymupdf leem-no bem) e preço fixo por estação, o
   mesmo em qualquer dia. TARIFAS_CP (assets/js/data.js) guarda os valores
   lidos numa data; HASHES_CP guarda o hash de cada PDF nessa mesma data.

   Correr isto não lê o PDF todo: só descarrega os bytes outra vez e
   compara o hash. Só quando um hash mudar é que vale a pena reabrir o PDF
   e reconferir os números à mão, com ferramentas/ler.py ou pymupdf (ver
   TRANSPORTES.md, «Como se lê um tarifário desta caixa»). Um hash
   diferente não diz o que mudou, só que mudou.

     node ferramentas/tarifas-cp.js

   Sai 0 se nada mudou, 1 se algum PDF mudou (para se usar em CI ou num
   agendamento, se um dia isso existir).
   ═════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {execFileSync} = require('child_process');

const RAIZ = path.join(__dirname, '..');
const fonte = fs.readFileSync(path.join(RAIZ, 'assets/js/data.js'), 'utf8');

const contexto = {};
new Function('globalThis', fonte + `
  globalThis.HASHES_CP = HASHES_CP;
`)(contexto);
const {HASHES_CP} = contexto;

/* O `fetch` nativo do Node leva 403 do WAF da CP mesmo com os mesmos
   cabeçalhos que o curl usa; é impressão digital de TLS/HTTP2, não
   cabeçalhos a menos. O curl atravessa (é o mesmo que o ler.py já usa
   para isto), por isso vai-se por aqui. */
function hashDe(url){
  try{
    const bytes = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0', '--max-time', '30', url], {maxBuffer: 1024 * 1024 * 20});
    if(!bytes.length) return {ok:false, erro:'resposta vazia'};
    return {ok:true, hash: crypto.createHash('sha256').update(bytes).digest('hex')};
  }catch(e){
    return {ok:false, erro: e.message};
  }
}

(async () => {
  const urls = Object.keys(HASHES_CP);
  console.log('A verificar %d PDFs da CP…\n', urls.length);
  let mudou = 0, falhou = 0;
  for(const url of urls){
    const antes = HASHES_CP[url];
    const agora = await hashDe(url);
    if(!agora.ok){
      console.log('❓ FALHOU  ' + url + '  (' + agora.erro + ', tente outra vez mais tarde)');
      falhou++;
      continue;
    }
    if(agora.hash === antes){
      console.log('✅ igual   ' + url);
    }else{
      console.log('⚠️  MUDOU   ' + url);
      console.log('   era     ' + antes);
      console.log('   é agora ' + agora.hash);
      mudou++;
    }
  }
  console.log('\n%d mudaram, %d falharam ao descarregar, %d continuam iguais.',
    mudou, falhou, urls.length - mudou - falhou);
  if(mudou){
    console.log('\nPara cada um que mudou: reabrir o PDF (ferramentas/ler.py ou pymupdf),');
    console.log('reconferir os valores em TARIFAS_CP, actualizar HASHES_CP com o hash novo');
    console.log('e pôr `actualizado` na data de hoje.');
  }
  process.exit(mudou ? 1 : 0);
})();
