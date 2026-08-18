#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Acha a pagina de tarifario a partir da raiz do sitio do operador.

Abre a raiz, colhe as ligacoes cujo texto ou endereco cheiram a precos (em
varias linguas), e diz quais delas respondem com numeros la dentro. Poupa a
adivinhacao de caminhos, que foi o que ja nos deixou cinco ligacoes a dar
404 no site.

  python3 ferramentas/achar.py <raiz> [<raiz> ...]

Sai uma linha por candidata:

  BOM   200  precos=17  https://…/tickets   (texto da ligacao)

«BOM» quer dizer que tem numeros com ar de preco. «js?» quer dizer que a
pagina veio quase vazia: monta os precos em JavaScript e nao se le por aqui.
"""
import concurrent.futures as cf
import os
import re
import sys
from urllib.parse import urljoin, urlparse

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ler import buscar, texto

# o que uma pagina de tarifario costuma dizer, nas linguas que nos calham
PISTAS = re.compile(
    r'tarif|fare|ticket|billet|bigliett|bilhet|precio|preise|preis|prezz|'
    r'pass\b|abbonament|abono|jegy|lystky|jizdne|priser|hinnat|hinta|'
    r'fahrschein|vervoerbewijz|kaartjes|taxa|fiyat|運賃|票价|요금',
    re.I)
# o que nao interessa, mesmo casando com as pistas
RUIDO = re.compile(r'cookie|privac|policy|legal|termos|terms|aviso|imprint|'
                   r'\.pdf$|mailto:|javascript:|^#', re.I)


def ligacoes(raiz):
    corpo, estado = buscar(raiz)
    if corpo is None:
        return estado, []
    achadas = {}
    for m in re.finditer(r'<a\b[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>',
                         corpo, re.I | re.S):
        href, rotulo = m.group(1), re.sub(r'<[^>]+>', ' ', m.group(2))
        rotulo = re.sub(r'\s+', ' ', rotulo).strip()[:60]
        if RUIDO.search(href):
            continue
        if not (PISTAS.search(href) or PISTAS.search(rotulo)):
            continue
        url = urljoin(raiz, href)
        if urlparse(url).netloc != urlparse(raiz).netloc:
            continue
        achadas.setdefault(url, rotulo)
    return estado, list(achadas.items())[:12]


def avaliar(par):
    url, rotulo = par
    corpo, estado = buscar(url)
    if corpo is None:
        return url, rotulo, '???', 0, 0
    ls = texto(corpo)
    precos = sum(1 for l in ls if re.search(
        r'\d+[.,]\d{2}\b|\b\d{2,5}\s*(kr|Kč|Ft|zł|SEK|NOK|DKK|CZK|HUF|PLN|TL|₺|¥|₩|฿|₫|R\$|\$|€|£)', l))
    return url, rotulo, estado.split()[0], len(ls), precos


def main():
    for raiz in sys.argv[1:]:
        estado, cands = ligacoes(raiz)
        print('\n=== %s   [%s]' % (raiz, estado))
        if not cands:
            print('   (nenhuma ligação com ar de tarifário; ver a raiz à mão)')
            continue
        with cf.ThreadPoolExecutor(max_workers=6) as ex:
            for url, rot, est, n, p in ex.map(avaliar, cands):
                marca = 'BOM ' if p >= 3 else ('js? ' if n < 40 else 'fraco')
                print('   %-5s %-4s precos=%-4d %-70s %s' % (marca, est, p, url[:70], rot))


if __name__ == '__main__':
    main()
