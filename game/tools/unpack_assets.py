#!/usr/bin/env python3
"""Reverse of tools/build_assets.py: write the game-ready asset files embedded in src/assetpack.js back out to assets/
(tex/, mdl/, chr/ + index.json), so the pack can be edited and rebuilt without the raw downloads.
Round trip: python3 tools/unpack_assets.py && python3 tools/build_assets.py  ->  identical src/assetpack.js."""
import json, base64, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
A = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'assets'
js = (ROOT / 'src' / 'assetpack.js').read_text()
P = {}
for line in js.splitlines():
    for name in ('ASSET_TEX', 'ASSET_MDL', 'ASSET_CHR'):
        h = f'const {name} = '
        if line.startswith(h): P[name] = json.loads(line[len(h):].rstrip(';'))
def wr(d, f, b64): (A / d).mkdir(parents=True, exist_ok=True); (A / d / f).write_bytes(base64.b64decode(b64))
T = P.get('ASSET_TEX', {}); idx = {}
def res(v):
    while v.startswith('@'): k2, s2 = v[1:].split('.'); v = T[k2][s2]
    return v
for k, e in T.items():
    n = 0
    for s in 'anr':
        b = res(e[s]); wr('tex', f'{k}_{s}.webp', b); n += len(base64.b64decode(b))
    idx[k] = {'src': e['src'], 'w': e['w'], 'h': e['h'], 'alpha': bool(e.get('alpha')), 'bytes': n}
if T: (A / 'tex' / 'index.json').write_text(json.dumps(idx, indent=1))
M = P.get('ASSET_MDL', {})
for k, v in M.items():
    wr('mdl', f'{k}.bin', v['bin']); v['bin'] = f'{k}.bin'
    for s in ('a', 'n', 'r'):
        if v.get(s): wr('mdl', f'{k}_{s}.webp', v[s]); v[s] = f'{k}_{s}.webp'
if M: (A / 'mdl' / 'index.json').write_text(json.dumps(M, indent=1))
C = P.get('ASSET_CHR', {})
for k, v in C.items():
    if v.get('meta'): (A / 'chr').mkdir(parents=True, exist_ok=True); (A / 'chr' / f'{k}.json').write_text(json.dumps(v['meta'])); v['meta'] = f'{k}.json'
    for f, ext in (('bin', '.bin'), ('a', '_a.webp'), ('n', '_n.webp'), ('r', '_r.webp'), ('e', '_e.webp'), ('anim', '_anim.bin')):
        if v.get(f): wr('chr', k + ext, v[f]); v[f] = k + ext
if C: (A / 'chr' / 'index.json').write_text(json.dumps(C, indent=1))
print('unpacked', len(T), 'texture sets,', len(M), 'models,', len(C), 'character packs ->', A)
