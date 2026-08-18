#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sonda as paginas de tarifario: quais e que o curl le com numeros dentro."""
import concurrent.futures as cf, re, sys
sys.path.insert(0, __import__('os').path.dirname(__file__) or '.')
from ler import buscar, texto

URLS = [l.strip() for l in open(sys.argv[1]) if l.strip()]

def sondar(u):
    corpo, estado = buscar(u)
    if corpo is None:
        return u, estado, 0, 0
    ls = texto(corpo)
    precos = sum(1 for l in ls if re.search(r'\d+[.,]\d{2}\b|\b\d{2,4}\s*(kr|Kč|Ft|HUF|SEK|NOK|CZK|TL|JPY|¥)', l))
    return u, estado.split()[0] if estado else '?', len(ls), precos

with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for u, est, n, p in ex.map(sondar, URLS):
        marca = 'BOM ' if p >= 3 else ('js? ' if n < 40 else 'fraco')
        print('%-5s %-4s linhas=%-5d precos=%-4d %s' % (marca, est, n, p, u))
