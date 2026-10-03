"""Level 7 (Thalassophobia) voice pipeline: same synthesis, treatment and ASR check as gen_vo37.py, different speakers and extraction.

  VO37_VOICES=/path/to/voices  VO37_ESPEAK=/path/to/espeak-ng-data  python3 gen_vo7.py [--list] [--no-asr] [--only substring]

Voices (CC0 / public domain): Kell mike-medium, Wren cori-high, Fen joe-medium, M.E.G. Outpost 9 bryce-medium, Dr. Hale john-medium, PA ljspeech-high (PA filter), whispers ljspeech-high.
"""
import os, re, sys, json, base64
import gen_vo37 as V
from gen_vo37 import read, balanced, strings
V.OUT_JS = os.path.join(V.SRC, 'voicebank7.js')
V.VOICES.update({'KELL': 'en_US-mike-medium', 'WREN': 'en_GB-cori-high', 'FEN': 'en_US-joe-medium'})
V.LS.update({'KELL': 0.98, 'WREN': 1.1, 'FEN': 0.96})
PREFIX = 'v7_'

def body_of(src, name):
    i = src.index('function ' + name); j = src.index('{', i); d = 0
    for k in range(j, len(src)):
        if src[k] == '{': d += 1
        elif src[k] == '}':
            d -= 1
            if d == 0: return src[j:k + 1]
    return ''
def extract():
    lines = []
    def add(sp, texts):
        for t in texts:
            if t and len(t.split()) >= 2 and (sp, t) not in lines: lines.append((sp, t))
    s2, m2 = read('story7.js'), read('main7.js')
    def calls(src, pat, sp, skip_args=0):
        for m in re.finditer(pat, src):
            i = src.index('(', m.start()); j = balanced(src, i); body = src[i + 1:j - 1]
            if skip_args:
                k = 0; d = 0
                for n, c in enumerate(body):
                    if c in '([{': d += 1
                    elif c in ')]}': d -= 1
                    elif c == ',' and d == 0: k = n + 1; break
                body = body[k:]
            body = re.split(r",\s*(?:\d+(?:\.\d+)?|\{[^{}]*\}|Object\.assign\(.*\))\s*$", body)[0]
            add(sp, strings(body))
    for fn, sp in (('talkKell7', 'KELL'), ('talkWren7', 'WREN'), ('talkFen7', 'FEN')): calls(body_of(s2, fn), r"(?<![A-Za-z0-9_])A\(", sp)
    calls(s2, r"\bsayK7\((?!t,)", 'KELL'); calls(s2, r"\bsayW7\((?!t,)", 'WREN'); calls(s2, r"\bsayF7\((?!t,)", 'FEN')
    add('KELL', strings(body_of(s2, 'hint7'))); add('OUTPOST9', ['Nine. ' + t for t in strings(body_of(s2, 'hint7'))])
    calls(s2, r"say\(OUT7,", 'OUTPOST9', 1); calls(s2, r"say\(HALE_R,", 'HALE', 1); calls(s2, r"say\('PA',", 'PA', 1); calls(s2, r"say\('',", 'WHISPER', 1); calls(m2, r"say\('',", 'WHISPER', 1)
    m = re.search(r"const W7_WHISPER = \[(.*?)\];", m2, re.S); add('WHISPER', strings(m.group(1)) if m else [])
    return lines

def main():
    V.extract = extract; V.pell_lines = lambda: []
    V.key = lambda sp, t: PREFIX + __import__('hashlib').sha1((sp + '|' + t).encode()).hexdigest()[:8]
    # reuse gen_vo37.main, minus Pell's tape, writing VOX2 instead of VOX37
    src = open(V.__file__).read()
    args = sys.argv[1:]
    items = [(V.key(sp, t), sp, t, V.spoken(t, sp)) for sp, t in extract()]
    if '--list' in args:
        for k, sp, t, sx in items: print(f'{k} {sp:9} {t!r}\n{"":23}-> {sx!r}')
        return
    only = args[args.index('--only') + 1] if '--only' in args else None
    from faster_whisper import WhisperModel
    asr = None if '--no-asr' in args else WhisperModel('base.en', device='cpu', compute_type='int8')
    import numpy as np
    from scipy.signal import resample_poly
    def wer(ref, hyp):
        n = lambda s: re.sub(r"[^a-z0-9' ]", ' ', s.lower()).split(); r, h = n(ref), n(hyp)
        d = np.zeros((len(r) + 1, len(h) + 1), int); d[:, 0] = range(len(r) + 1); d[0, :] = range(len(h) + 1)
        for i in range(1, len(r) + 1):
            for j in range(1, len(h) + 1): d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
        return d[-1, -1] / max(1, len(r))
    def heard(a):
        w = resample_poly(a, 16000, V.SR).astype(np.float32); segs, _ = asr.transcribe(w, beam_size=3, language='en'); return ' '.join(s.text.strip() for s in segs)
    bank = {}
    if only and os.path.exists(V.OUT_JS):
        mm = re.search(r'Object\.assign\(ABANK, (\{.*?\})\);\nconst VOX7', open(V.OUT_JS, encoding='utf-8').read(), re.S)
        if mm: bank = {k: v for k, v in json.loads(mm.group(1)).items() if k in {i[0] for i in items}}
    bad = []
    for i, (k, sp, t, sx) in enumerate(items):
        if only and only not in t and only not in k: continue
        best = None
        for j, (dls, ns) in enumerate([(0, 0.667), (0.05, 0.6), (-0.04, 0.667), (0.08, 0.5), (0, 0.8)]):
            a = V.make(sp, sx, 9000 + i * 31 + j, (V.LS[sp] + dls), ns)
            w = wer(sx, heard(a)) if asr and sp != 'WHISPER' else 0.0
            if best is None or w < best[0]: best = (w, a)
            if w <= 0.06: break
        w, a = best; bank[k] = base64.b64encode(V.encode(a)).decode(); print(k, sp, round(len(a) / V.SR, 2), 'wer', round(w, 2), flush=True)
        if w > 0.15: bad.append((k, round(w, 2), sx))
    keyed = {t: k for k, sp, t, sx in items if k in bank}
    js = '// ---------- r10 · Level 7 voice bank (generated by audio_pipeline/gen_vo7.py: Piper TTS, CC0 / public-domain models; see docs/CREDITS.md) ----------\n'
    js += 'Object.assign(ABANK, ' + json.dumps(bank, separators=(',', ':')) + ');\n'
    js += 'const VOX7 = ' + json.dumps(keyed, ensure_ascii=False, separators=(',', ':')) + ';\n'
    js += 'const VOXSP7 = ' + json.dumps({k: sp for k, sp, t, sx in items if k in bank}, separators=(',', ':')) + ';\n'
    open(V.OUT_JS, 'w', encoding='utf-8').write(js)
    print('clips', len(bank), 'js bytes', len(js), 'above 0.15 WER:', bad)
if __name__ == '__main__': main()
