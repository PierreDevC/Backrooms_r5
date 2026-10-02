#!/usr/bin/env python3
"""r5: download Poly Haven (CC0) models as 1k glTF into /data/assets_src/ph/<id>/ (API: https://api.polyhaven.com/files/<id>)"""
import json, os, sys, urllib.request
OUT = '/data/assets_src/ph'
def get(url, path=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'backrooms-r5-asset-fetch'})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if path:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'wb').write(data)
    return data
for mid in sys.argv[1:]:
    res = sys.argv[0] and '1k'
    d = json.loads(get(f'https://api.polyhaven.com/files/{mid}'))
    g = d['gltf'].get(res) or d['gltf']['2k']
    g = g['gltf']
    base = os.path.join(OUT, mid)
    gl = os.path.join(base, os.path.basename(g['url']))
    if not os.path.exists(gl): get(g['url'], gl)
    for rel, f in g['include'].items():
        p = os.path.join(base, rel)
        if not os.path.exists(p): get(f['url'], p)
    print(mid, 'ok', sum(f['size'] for f in g['include'].values()) // 1024, 'KB')
