#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Abre uma pagina de tarifario e despeja o texto legivel.

O Chromium desta caixa nao atravessa o proxy (ERR_CONNECTION_RESET mesmo em
paginas que o curl busca bem), por isso vai-se pelo curl, que atravessa.
Paginas que montem a tabela de precos em JavaScript saem sem numeros: isso
ve-se e trata-se noutro sitio, nao se adivinha.

  python3 ler.py <url> [padrao]
  python3 ler.py <url> --linhas 418-448

`padrao` e uma expressao regular; saem so as linhas que casarem, com duas de
contexto de cada lado. Sem padrao saem as primeiras 200 linhas.

`--linhas A-B` despeja um intervalo pelo numero que a propria ferramenta
imprime. Serve para quando o padrao acha a seccao certa mas os precos estao
nas linhas a seguir, que e o caso comum nas paginas que poem o nome do
titulo numa linha e o valor noutra.
"""
import html
import re
import subprocess
import sys

UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/120.0.0.0 Safari/537.36')

# A consola do Windows abre em cp1252, e um tarifario alemao ou checo tem
# sempre um caracter que ela nao sabe escrever: sem isto, imprimir a pagina
# rebenta com UnicodeEncodeError. Nao e cosmetica, e o que faz a ferramenta
# correr fora do Linux.
for _f in (sys.stdout, sys.stderr):
    try:
        _f.reconfigure(encoding='utf-8', errors='replace')
    except (AttributeError, ValueError):
        pass


def buscar(url):
    # `text=True` descodificaria com a codificacao da maquina (cp1252 no
    # Windows), o que estraga qualquer pagina em UTF-8: precos em euros
    # ficavam com «â‚¬» no meio e os padroes deixavam de casar. Le-se em
    # bytes e descodifica-se sempre como UTF-8.
    r = subprocess.run(
        ['curl', '-sSL', '--max-time', '45', '--compressed',
         '-A', UA,
         '-H', 'Accept: text/html,application/xhtml+xml',
         '-H', 'Accept-Language: en-GB,en;q=0.9,pt;q=0.8',
         '-w', '\n@@ESTADO@@%{http_code} %{url_effective}',
         url],
        capture_output=True)
    if r.returncode != 0:
        erro = (r.stderr or b'').decode('utf-8', 'replace').strip()
        return None, 'curl falhou: ' + erro[:200]
    saida = (r.stdout or b'').decode('utf-8', 'replace')
    corpo, _, cauda = saida.rpartition('\n@@ESTADO@@')
    return corpo, cauda.strip()


def texto(doc):
    doc = re.sub(r'(?is)<(script|style|noscript|svg|head)[^>]*>.*?</\1>', ' ', doc)
    doc = re.sub(r'(?i)<br\s*/?>', '\n', doc)
    doc = re.sub(r'(?i)</(p|div|li|tr|h[1-6]|section|article)>', '\n', doc)
    doc = re.sub(r'(?i)</t[dh]>', ' \t', doc)
    doc = re.sub(r'(?s)<[^>]+>', ' ', doc)
    doc = html.unescape(doc)
    linhas = []
    for l in doc.split('\n'):
        l = re.sub(r'[ \t\xa0]+', ' ', l).strip()
        if l:
            linhas.append(l)
    return linhas


def main():
    url = sys.argv[1]
    resto = sys.argv[2:]
    faixa = None
    if '--linhas' in resto:
        i = resto.index('--linhas')
        m = re.match(r'(\d+)-(\d+)$', resto[i + 1] if i + 1 < len(resto) else '')
        if not m:
            print('uso: --linhas A-B (por exemplo --linhas 418-448)')
            return 2
        faixa = (int(m.group(1)), int(m.group(2)))
        del resto[i:i + 2]
    padrao = re.compile(resto[0], re.I) if resto else None

    corpo, estado = buscar(url)
    if corpo is None:
        print(estado)
        return 1
    print(estado)
    linhas = texto(corpo)
    print('linhas legiveis: %d' % len(linhas))
    print('-' * 70)

    if faixa:
        a, b = faixa
        for i in range(max(0, a), min(len(linhas), b + 1)):
            print('%4d| %s' % (i, linhas[i][:300]))
    elif padrao:
        querer = set()
        for i, l in enumerate(linhas):
            if padrao.search(l):
                querer.update(range(max(0, i - 2), min(len(linhas), i + 3)))
        idx = sorted(querer)
        if not idx:
            print('(o padrao nao casou; a pagina pode montar os precos em JavaScript)')
        ultimo = -2
        for i in idx:
            if i != ultimo + 1:
                print('   ...')
            print('%4d| %s' % (i, linhas[i][:300]))
            ultimo = i
    else:
        for i, l in enumerate(linhas[:200]):
            print('%4d| %s' % (i, l[:300]))
    return 0


if __name__ == '__main__':
    sys.exit(main())
