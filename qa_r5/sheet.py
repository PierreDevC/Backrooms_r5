import sys, glob
from PIL import Image
pat, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 2
fs = sorted(glob.glob(pat), key=lambda f: [int(t) if t.isdigit() else t for t in __import__('re').split(r'(\d+)', f)])
ims = [Image.open(f) for f in fs]
w, h = ims[0].size; w2, h2 = w * 2 // 3, h * 2 // 3
rows = (len(ims) + cols - 1) // cols
sh = Image.new('RGB', (w2 * cols, h2 * rows), 'black')
for i, im in enumerate(ims): sh.paste(im.resize((w2, h2)), ((i % cols) * w2, (i // cols) * h2))
sh.save(out, quality=82); print(out, sh.size, len(ims))
