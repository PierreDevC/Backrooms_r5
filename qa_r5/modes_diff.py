# compare the collision boxes saved by modes.js: default vs ?noskin / ?nomodels / ?noassets (same seed)
import json, sys, os
O = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
for L in (0, 9, 5, 18):
    try: base = json.load(open(f'{O}/fb2_solids_L{L}_default.json'))
    except FileNotFoundError: continue
    for m in ('noskin', 'nomodels', 'noassets'):
        try: b = json.load(open(f'{O}/fb2_solids_L{L}_{m}.json'))
        except FileNotFoundError: continue
        A = {tuple(s[:4]) for s in base}; B = {tuple(s[:4]) for s in b}
        onlyA, onlyB = A - B, B - A
        # index-aligned comparison (same order = same RNG stream)
        same_prefix = next((i for i, (x, y) in enumerate(zip(base, b)) if x != y), min(len(base), len(b)))
        print(f'L{L} {m}: n {len(base)}/{len(b)}  identical {len(A & B)}  only-default {len(onlyA)}  only-{m} {len(onlyB)}  first index diff {same_prefix}')
        if 0 < len(onlyA) <= 30:
            print('   default-only:', sorted(onlyA)[:12]); print('   ' + m + '-only:', sorted(onlyB)[:12])
