#!/usr/bin/env python3
"""Character textures (Quaternius Universal Base Characters, CC0) -> compact WebP for the game's skin shader.
a: albedo RGB (light skin variant) + roughness in alpha · n: normal map (DirectX / image-row convention) · e: eye."""
import json, pathlib
from PIL import Image
SRC = pathlib.Path('/data/assets_src/itch/ubc/Universal Base Characters[Standard]/Base Characters/Textures')
OUT = pathlib.Path(__file__).resolve().parent.parent.parent / 'assets' / 'chr'
S = 1024
alb = Image.open(SRC / 'T_Superhero_Male_Ligh.png').convert('RGB').resize((S, S), Image.LANCZOS)
rgh = Image.open(SRC / 'T_Superhero_Male_Roughness.png').convert('L').resize((S, S), Image.LANCZOS)
a = alb.copy(); a.putalpha(rgh); a.save(OUT / 'human_a.webp', 'WEBP', quality=80, alpha_quality=25, method=6)
Image.open(SRC / 'T_Superhero_Male_Normal.png').convert('RGB').resize((S, S), Image.LANCZOS).save(OUT / 'human_n.webp', 'WEBP', quality=84, method=6)
Image.open(SRC / 'T_Eye_Brown.png').convert('RGB').resize((128, 128), Image.LANCZOS).save(OUT / 'human_e.webp', 'WEBP', quality=88, method=6)
idx = {'human': {'meta': 'human.json', 'bin': 'human.bin', 'a': 'human_a.webp', 'n': 'human_n.webp', 'e': 'human_e.webp',
                 'src': 'Quaternius · Universal Base Characters + Universal Animation Library 1 & 2 (CC0)'}}
(OUT / 'index.json').write_text(json.dumps(idx, indent=1))
for f in sorted(OUT.iterdir()): print(f.name, f.stat().st_size)
