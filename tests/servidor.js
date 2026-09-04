/* Servidor estático mínimo, só para os testes: serve a raiz do repositório
   sem depender de nada fora do Node. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

function iniciar(raiz, porta){
  const servidor = http.createServer((req, res) => {
    const pedido = decodeURIComponent(req.url.split('?')[0]);
    const alvo = path.join(raiz, pedido === '/' ? '/index.html' : pedido);
    if(!alvo.startsWith(raiz)){ res.writeHead(403); res.end(); return; }
    fs.readFile(alvo, (erro, dados) => {
      if(erro){ res.writeHead(404); res.end('não encontrado'); return; }
      res.writeHead(200, {'Content-Type': TIPOS[path.extname(alvo)] || 'application/octet-stream'});
      res.end(dados);
    });
  });
  return new Promise((resolve, reject) => {
    servidor.on('error', reject);
    servidor.listen(porta, '127.0.0.1', () => resolve(servidor));
  });
}

module.exports = {iniciar};
