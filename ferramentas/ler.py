#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Abre uma pagina de tarifario e despeja o texto legivel.

O Chromium desta caixa nao atravessa o proxy (ERR_CONNECTION_RESET mesmo em
paginas que o curl busca bem), por isso vai-se pelo curl, que atravessa.
Paginas que montem a tabela de precos em JavaScript saem sem numeros: isso
ve-se e trata-se noutro sitio, nao se adivinha.

  python3 ler.py <url> [padrao]

`padrao` e uma expressao regular; saem so as linhas que casarem, com duas de
contexto de cada lado. Sem padrao saem as primeiras 200 linhas.
"""
import html
import re
import subprocess
import sys

UA = ('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/120.0.0.0 Safari/537.36')


def buscar(url):
    r = subprocess.run(
        ['curl', '-sSL', '--max-time', '45', '--compressed',
         '-A', UA,
         '-H', 'Accept: text/html,application/xhtml+xml',
         '-H', 'Accept-Language: en-GB,en;q=0.9,pt;q=0.8',
         '-w', '\n@@ESTADO@@%{http_code} %{url_effective}',
         url],
        capture_output=True, text=True)
    if r.returncode != 0:
        return None, 'curl falhou: ' + (r.stderr or '').strip()[:200]
    corpo, _, cauda = r.stdout.rpartition('\n@@ESTADO@@')
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
    padrao = re.compile(sys.argv[2], re.I) if len(sys.argv) > 2 else None

    corpo, estado = buscar(url)
    if corpo is None:
        print(estado)
        return 1
    print(estado)
    linhas = texto(corpo)
    print('linhas legiveis: %d' % len(linhas))
    print('-' * 70)

    if padrao:
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
