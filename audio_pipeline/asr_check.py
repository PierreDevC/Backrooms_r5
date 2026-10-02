import re, json, sys
from asr import tr
from lines import LINES
REP = {'20': 'twenty', '50': 'fifty', '100': 'a hundred', 'metres': 'meters', 'north east': 'northeast', 'north west': 'northwest', 'south east': 'southeast', 'south west': 'southwest', 'no clipped': 'noclipped'}
def words(s):
    s = ' ' + re.sub(r"[^a-z0-9' ]", ' ', s.lower().replace('-', ' ')) + ' '
    s = ' '.join(s.split())
    for a, b in REP.items(): s = s.replace(a, b)
    return s.split()
def wer(a, b):
    a, b = words(a), words(b); d = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        p, d[0] = d[0], i
        for j in range(1, len(b) + 1):
            p, d[j] = d[j], min(d[j] + 1, d[j - 1] + 1, p + (a[i - 1] != b[j - 1]))
    return d[len(b)] / max(1, len(a))
if __name__ == '__main__':
  res = {}
  for L in LINES:
    if L['style'] == 'whisper': continue
    h = tr(f"/data/audio/out/vo/{L['key']}.wav"); w = wer(L['text'], h); res[L['key']] = (w, h)
    print(f"{w:.2f} {L['key']} | {h}", flush=True)
  json.dump(res, open('asr_res.json', 'w'))
