#!/usr/bin/env python3
"""Build game-ready PBR texture sets from ambientCG 1K-JPG downloads (CC0).
Outputs per key: <key>_a.webp (albedo, sRGB, alpha=opacity when present), <key>_n.webp (normal, game/DX convention),
<key>_r.webp (R=ambient occlusion, G=roughness, B=height). Writes assets/tex/index.json with sizes + source ids."""
import json, sys, pathlib
import numpy as np
from PIL import Image
RAW = pathlib.Path('/data/assets_src/acg/raw'); OUT = pathlib.Path('/data/backrooms/assets/tex'); OUT.mkdir(parents=True, exist_ok=True)
# key: (ambientCG id, output width) ; height follows the source aspect ratio (power of two)
SETS = {
  'l0paper': ('Wallpaper001A', 512), 'l0carpet': ('Carpet016', 1024), 'l0ceil': ('OfficeCeiling001', 1024),
  'asph': ('Asphalt015', 1024), 'grass': ('Grass004', 512), 'conc': ('Concrete034', 512), 'wood9': ('WoodFloor041', 512),
  'siding': ('WoodSiding009', 512), 'roof': ('RoofingTiles013A', 512), 'tile9': ('Tiles036', 512), 'paper9': ('Wallpaper002A', 512),
  'plaster': ('Plaster001', 512), 'chain': ('Fence006', 512), 'planks': ('Planks021', 512), 'labwall': ('PaintedPlaster017', 512),
  'block': ('Concrete033', 512), 'hpaper': ('Wallpaper001B', 512), 'hwood': ('WoodFloor064', 512), 'hcarpet': ('Carpet013', 512),
  'check': ('Tiles074', 512), 'bconc': ('Concrete033', 512), 'bfloor': ('Concrete012', 512), 'hceil': ('Plaster002', 512),
  'kcarpet': ('Carpet002', 512), 'ktile': ('Tiles107', 512), 'turf': ('Grass003', 512), 'gcarpet': ('Carpet007', 512),
  'rubber': ('Rubber004', 512), 'kwall': ('PaintedPlaster004', 512), 'fabric': ('Fabric028', 512), 'leather': ('Leather037', 512),
  'metal': ('Metal032', 512), 'rust': ('Rust007', 512), 'stone': ('Bricks075A', 512), 'terrazzo': ('Terrazzo013', 512),
}
NW = {'l0paper': 512, 'l0ceil': 512, 'check': 256, 'hwood': 256, 'terrazzo': 256, 'metal': 256, 'wood9': 512}
RW = {'l0ceil': 512, 'check': 512, 'tile9': 512, 'ktile': 512, 'chain': 512, 'l0carpet': 512}
def load(id_, suffix, mode):
    p = RAW / id_ / f'{id_}_1K-JPG_{suffix}.jpg'
    return Image.open(p).convert(mode) if p.exists() else None
def p2(n): return 1 << max(0, round(np.log2(max(1, n))))
index = {}
only = set(sys.argv[1:])
for key, (id_, W) in SETS.items():
    if only and key not in only: continue
    col = load(id_, 'Color', 'RGB'); nrm = load(id_, 'NormalDX', 'RGB')
    if col is None or nrm is None: print('MISSING', key, id_); continue
    w0, h0 = col.size; asp = h0 / w0
    aW = W; nW = NW.get(key, 512); rW = RW.get(key, 256)
    sz = (aW, p2(aW * asp)); szn = (nW, p2(nW * asp)); szr = (rW, p2(rW * asp)); H = sz[1]
    opa = load(id_, 'Opacity', 'L')
    a = col.resize(sz, Image.LANCZOS)
    if opa is not None: a = Image.merge('RGBA', (*a.split(), opa.resize(sz, Image.LANCZOS)))
    a.save(OUT / f'{key}_a.webp', quality=80, method=6)
    # renormalise the normal after filtering
    n = np.asarray(nrm.resize(szn, Image.LANCZOS), dtype=np.float32) / 127.5 - 1.0
    n /= np.maximum(np.linalg.norm(n, axis=2, keepdims=True), 1e-6)
    Image.fromarray(np.clip((n * 0.5 + 0.5) * 255 + 0.5, 0, 255).astype(np.uint8)).save(OUT / f'{key}_n.webp', quality=82, method=6)
    ao = load(id_, 'AmbientOcclusion', 'L'); ro = load(id_, 'Roughness', 'L'); di = load(id_, 'Displacement', 'L')
    ch = [(x.resize(szr, Image.LANCZOS) if x is not None else Image.new('L', szr, dflt)) for x, dflt in ((ao, 255), (ro, 180), (di, 128))]
    Image.merge('RGB', ch).save(OUT / f'{key}_r.webp', quality=78, method=6)
    fs = {s: (OUT / f'{key}_{s}.webp').stat().st_size for s in 'anr'}
    index[key] = {'src': id_, 'w': aW, 'h': H, 'nw': szn[0], 'nh': szn[1], 'rw': szr[0], 'rh': szr[1], 'alpha': opa is not None, 'ao': ao is not None, 'bytes': sum(fs.values())}
    print(key, id_, sz, fs)
old = json.loads((OUT / 'index.json').read_text()) if (OUT / 'index.json').exists() and only else {}
old.update(index); (OUT / 'index.json').write_text(json.dumps(old, indent=1))
print('total', sum(v['bytes'] for v in old.values()))
