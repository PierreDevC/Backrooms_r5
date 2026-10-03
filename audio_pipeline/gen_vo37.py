"""Level 37 (Sublimity) voice pipeline.

Extracts every spoken line from game/src/story37.js, storywings37.js and main37.js, turns it into a spoken form (no ellipses, dashes, digits or
ALL CAPS), synthesises it with Piper (CC0 / public-domain voice models only), applies a per-speaker treatment, checks it with faster-whisper,
and writes game/src/voicebank37.js (mp3, base64) with the text -> clip lookup the game uses.

  VO37_VOICES=/path/to/voices  VO37_ESPEAK=/path/to/espeak-ng-data  python3 gen_vo37.py [--no-asr] [--only substring]

Voices (all CC0 or public domain, same policy as Level 0): Abara cori-high, Teague kristin-medium, Outpost 9 bryce-medium, Dr. Hale john-medium,
PA ljspeech-high (PA filter), Staff kathleen-low (whisper), the Scape ljspeech-high (whisper), Pell joe-medium (tape).
"""
import os, re, sys, json, hashlib, base64
import numpy as np
from scipy.signal import resample_poly
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from dsp import *
SRC = os.path.join(HERE, '..', 'game', 'src'); OUT_JS = os.path.join(SRC, 'voicebank37.js')
VDIR = os.environ.get('VO37_VOICES', '/tmp/voices37'); ESP = os.environ.get('VO37_ESPEAK')
SR = 22050; BANK_SR = 16000
VOICES = {'ABARA': 'en_GB-cori-high', 'TEAGUE': 'en_US-kristin-medium', 'OUTPOST9': 'en_US-bryce-medium', 'HALE': 'en_US-john-medium', 'PA': 'en_US-ljspeech-high',
          'STAFF': 'en_US-kathleen-low', 'WHISPER': 'en_US-ljspeech-high', 'PELL': 'en_US-joe-medium'}
LS = {'ABARA': 1.04, 'TEAGUE': 0.97, 'OUTPOST9': 1.0, 'HALE': 1.06, 'PA': 1.0, 'STAFF': 1.18, 'WHISPER': 1.2, 'PELL': 1.06}
NS = {'WHISPER': 0.667}

# ---------- 1. extract ----------
def read(n): return open(os.path.join(SRC, n), encoding='utf-8').read()
STR = re.compile(r"'((?:[^'\\\n]|\\.)*)'")
def unq(s): return re.sub(r"\\(.)", r"\1", s)
def balanced(src, i):
    """src[i] == '(' -> index after the matching ')', skipping string literals"""
    d = 0; j = i
    while j < len(src):
        c = src[j]
        if c in "'\"`":
            q = c; j += 1
            while j < len(src) and src[j] != q:
                j += 2 if src[j] == '\\' else 1
        elif c == '(': d += 1
        elif c == ')':
            d -= 1
            if d == 0: return j + 1
        j += 1
    return j
def strings(chunk): return [unq(m) for m in STR.findall(chunk) if re.search(r'[A-Za-z]', m)]
def extract():
    lines = []   # (speaker, text)
    def add(sp, texts):
        for t in texts:
            if t and (sp, t) not in lines: lines.append((sp, t))
    s37, sw37, m37 = read('story37.js'), read('storywings37.js'), read('main37.js')
    def calls(src, pat, sp, skip_args=0):
        for m in re.finditer(pat, src):
            i = src.index('(', m.start()); j = balanced(src, i); body = src[i + 1:j - 1]
            if skip_args:   # say(WHO, text, opts): the text is the second argument
                k = 0; d = 0
                for n, c in enumerate(body):
                    if c in '([{': d += 1
                    elif c in ')]}': d -= 1
                    elif c == ',' and d == 0: k = n + 1; break
                body = body[k:]
                # drop the options object at the end
                body = re.split(r",\s*\{[^{}]*\}\s*$", body)[0]
            else:
                body = re.split(r",\s*(?:\d+(?:\.\d+)?|\{[^{}]*\})\s*$", body)[0]
            add(sp, strings(body))
    calls(s37, r"\bsayAb37\(", 'ABARA'); calls(s37, r"(?<![A-Za-z0-9_])A\(", 'ABARA')
    calls(s37, r"say\(OUT9,", 'OUTPOST9', 1); calls(sw37, r"say\(OUT9,", 'OUTPOST9', 1); calls(m37, r"say\('M\.E\.G\. OUTPOST 9',", 'OUTPOST9', 1)
    calls(s37, r"say\(HALE_R,", 'HALE', 1); calls(s37, r"say\('PA',", 'PA', 1); calls(sw37, r"say\('PA',", 'PA', 1)
    calls(sw37, r"\bswS37\(", 'TEAGUE'); calls(sw37, r"say\('STAFF',", 'STAFF', 1); calls(sw37, r"\bsay_\(", 'STAFF')
    calls(sw37, r"say\('',", 'WHISPER', 1); calls(m37, r"say\('',", 'WHISPER', 1)
    m = re.search(r"const L = \{(.*?)\}\[s\.key\]", sw37, re.S)
    if m: add('STAFF', strings(m.group(1)))
    m = re.search(r"const W37_WHISPER = \[(.*?)\];", m37, re.S)
    if m: add('WHISPER', strings(m.group(1)))
    return lines
def pell_lines():
    m = re.search(r"const PELL37 = \[(.*?)\];", read('story37.js'), re.S); return strings(m.group(1))

# ---------- 2. spoken form ----------
NUM = {'204': 'two oh four', '233': 'two thirty three', '201': 'two oh one', '3': 'three', '0': 'zero', '4': 'four', '1': 'one', '2': 'two', '7': 'seven'}
def spoken(t, sp):
    x = t.replace('...', ',').replace('…', ',').replace('—', ',').replace(' - ', ', ').replace('·', ',').replace('◄', '')
    x = re.sub(r'\bM\.E\.G\.', 'M E G', x)
    x = re.sub(r'\d+', lambda m: NUM.get(m.group(0), m.group(0)), x)
    x = re.sub(r'\bAVI\b', 'A V I', x); x = re.sub(r'\b(?!PA\b|AVI\b)[A-Z]{3,}\b', lambda m: m.group(0).capitalize(), x); x = x.replace('Hi-8', 'Hi eight')
    x = re.sub(r'^[,\s]+', '', x); x = re.sub(r'\s+,', ',', x); x = re.sub(r',\s*,+', ',', x); x = re.sub(r',\s*([.!?])', r'\1', x)
    x = re.sub(r'\s+', ' ', x).strip()
    if sp == 'WHISPER': x = x.rstrip('.,')
    return x
def key(sp, t): return 'v37_' + hashlib.sha1((sp + '|' + t).encode()).hexdigest()[:8]

# ---------- 3. synthesis + styles ----------
_cache = {}
def voice(sp):
    from piper import PiperVoice
    if sp not in _cache:
        kw = {'espeak_data_dir': ESP} if ESP else {}
        _cache[sp] = PiperVoice.load(os.path.join(VDIR, VOICES[sp] + '.onnx'), **kw)
    return _cache[sp]
def tts(sp, text, ls, ns, seed):
    from piper import SynthesisConfig
    import random; np.random.seed(seed); random.seed(seed)
    v = voice(sp)
    a = np.concatenate([c.audio_float_array for c in v.synthesize(text, syn_config=SynthesisConfig(length_scale=ls, noise_scale=ns, noise_w_scale=0.85))]).astype(np.float64)
    if v.config.sample_rate != SR: a = resample_poly(a, SR, v.config.sample_rate)
    return a
def style_tape(a, seed):
    r = rng(seed); n = len(a); pre = int(0.45 * SR); post = int(0.5 * SR); x = np.concatenate([np.zeros(pre), a, np.zeros(post)]); t = np.arange(len(x)) / SR
    rate = 1 + 0.0035 * np.sin(2 * np.pi * 0.55 * t + r.random() * 6) + 0.0012 * np.sin(2 * np.pi * 7.3 * t) + 0.0006 * np.sin(2 * np.pi * 13.1 * t)
    x = varispeed(x, rate * 0.985); x = filt(filt(x, SR, 'hp', 150, 2), SR, 'lp', 6200, 2); x = peak_eq(x, SR, 1500, 3, 0.8)
    x = norm(x, SR, -17, 0.95); x = np.tanh(1.35 * x) / np.tanh(1.35); x = reverb(x, SR, 0.12, 0.6, 3.5, 3500, seed)
    m = len(x); tt = np.arange(m) / SR
    hiss = filt(noise(m, seed + 1), SR, 'hp', 2500, 1) * 0.013 + filt(pink(m, seed + 2), SR, 'lp', 900, 1) * 0.01
    hum = 0.006 * np.sin(2 * np.pi * 59.94 * tt) + 0.003 * np.sin(2 * np.pi * 119.88 * tt); g = np.ones(m)
    for _ in range(r.integers(2, 4)):
        c = int(r.uniform(0.2, 0.9) * m); w = int(r.uniform(0.04, 0.11) * SR); g[c:c + w] *= np.hanning(len(g[c:c + w])) * -0.8 + 1
    x = x * g + hiss + hum
    for at in (int(0.05 * SR), m - int(0.12 * SR)):
        k = filt(noise(int(0.02 * SR), seed + at) * expenv(int(0.02 * SR), SR, 0, 0.004), SR, 'lp', 3000, 1) * 0.5; place(x, k, at)
    return fade(x, SR, 0.02, 0.15)
def style_whisper(a, seed):
    x = whisperize(a, SR, seed); x = filt(x, SR, 'hp', 350, 2); x = norm(x, SR, -20)
    rv = reverb(x, SR, 1.0, 2.2, 2.2, 6000, seed)[::-1][-int(0.6 * SR):] * 0.25 * np.linspace(0, 1, int(0.6 * SR)) ** 2
    return fade(reverb(np.concatenate([rv, x]), SR, 0.35, 2.0, 2.6, 5000, seed + 9), SR, 0.01, 0.2)
def style_pa(a, seed):
    x = filt(filt(a, SR, 'hp', 380, 2), SR, 'lp', 4300, 2); x = peak_eq(x, SR, 1800, 4, 0.9); x = np.tanh(1.5 * norm(x, SR, -17)) / np.tanh(1.5)
    x = reverb(x, SR, 0.3, 2.2, 2.6, 3800, seed); return fade(x, SR, 0.03, 0.2)
def style_room(a, seed): return fade(reverb(a, SR, 0.06, 0.5, 4.0, 5000, seed), SR, 0.01, 0.05)
def make(sp, text, seed, ls=None, ns=None):
    a = tts(sp, text, ls or LS[sp], ns or NS.get(sp, 0.667), seed); a = trim(a, SR); a = filt(a, SR, 'hp', 75, 2); a = norm(a, SR, -19)
    if sp == 'PELL': a = style_tape(a, seed)
    elif sp in ('STAFF', 'WHISPER'): a = norm(style_whisper(a, seed), SR, -22)
    elif sp == 'PA': a = norm(style_pa(a, seed), SR, -19)
    else: a = norm(style_room(a, seed), SR, -19)
    return a

def encode(a):
    import lameenc
    y = resample_poly(a, 320, 441); y = np.clip(y, -1, 1); pcm = (y * 32767).astype(np.int16).tobytes()
    e = lameenc.Encoder(); e.set_bit_rate(24); e.set_in_sample_rate(BANK_SR); e.set_channels(1); e.set_quality(2)
    return bytes(e.encode(pcm)) + bytes(e.flush())

def main():
    args = sys.argv[1:]; only = args[args.index('--only') + 1] if '--only' in args else None; asr_on = '--no-asr' not in args
    L = [(sp, t) for sp, t in extract()]
    items = [(key(sp, t), sp, t, spoken(t, sp)) for sp, t in L]
    items.append(('v37_pell', 'PELL', '(Pell, tape seven)', ' ... '.join(spoken(t, 'PELL') for t in pell_lines())))
    if '--list' in args:
        for k, sp, t, sx in items: print(f'{k} {sp:9} {t!r}\n{"":23}-> {sx!r}')
        return
    asr = None
    if asr_on:
        from faster_whisper import WhisperModel
        asr = WhisperModel('base.en', device='cpu', compute_type='int8')
    def wer(ref, hyp):
        n = lambda s: re.sub(r"[^a-z0-9' ]", ' ', s.lower()).split(); r, h = n(ref), n(hyp)
        d = np.zeros((len(r) + 1, len(h) + 1), int); d[:, 0] = range(len(r) + 1); d[0, :] = range(len(h) + 1)
        for i in range(1, len(r) + 1):
            for j in range(1, len(h) + 1): d[i, j] = min(d[i - 1, j] + 1, d[i, j - 1] + 1, d[i - 1, j - 1] + (r[i - 1] != h[j - 1]))
        return d[-1, -1] / max(1, len(r))
    def heard(a):
        import tempfile; p = tempfile.mktemp(suffix='.wav'); write_wav(p, a, SR)
        from scipy.io import wavfile
        sr, w = wavfile.read(p); w = w.astype(np.float32) / 32768; w = resample_poly(w, 16000, sr).astype(np.float32); os.remove(p)
        segs, _ = asr.transcribe(w, beam_size=3, language='en'); return ' '.join(s.text.strip() for s in segs)
    bank, report = {}, []
    if only and os.path.exists(OUT_JS):   # a partial run keeps the clips already made
        old = open(OUT_JS, encoding='utf-8').read(); mm = re.search(r'Object\.assign\(ABANK, (\{.*?\})\);\nconst VOX37', old, re.S)
        if mm: bank = {k: v for k, v in json.loads(mm.group(1)).items() if k in {i[0] for i in items}}
    for i, (k, sp, t, sx) in enumerate(items):
        if only and only not in t and only not in k: continue
        best = None
        for j, (dls, ns) in enumerate([(0, 0.667), (0.05, 0.6), (-0.04, 0.667), (0.08, 0.5), (0, 0.8)]):
            a = make(sp, sx, 7000 + i * 31 + j, (LS[sp] + dls), ns)
            w = wer(sx, heard(a)) if asr and sp not in ('WHISPER', 'STAFF') else 0.0
            if best is None or w < best[0]: best = (w, a)
            if w <= 0.06: break
        w, a = best; bank[k] = base64.b64encode(encode(a)).decode(); report.append((k, sp, round(len(a) / SR, 2), round(w, 2), sx)); print(k, sp, round(len(a) / SR, 2), 'wer', round(w, 2), flush=True)
    keyed = {t: k for k, sp, t, sx in items if k in bank and k != 'v37_pell'}
    js = '// ---------- r8 · Level 37 voice bank (generated by audio_pipeline/gen_vo37.py: Piper TTS, CC0 / public-domain models; see docs/CREDITS.md) ----------\n'
    js += 'Object.assign(ABANK, ' + json.dumps(bank, separators=(',', ':')) + ');\n'
    js += 'const VOX37 = ' + json.dumps(keyed, ensure_ascii=False, separators=(',', ':')) + ';\n'
    js += 'const VOXSP37 = ' + json.dumps({k: sp for k, sp, t, sx in items if k in bank}, separators=(',', ':')) + ';\n'
    open(OUT_JS, 'w', encoding='utf-8').write(js)
    json.dump(report, open(os.path.join(HERE, 'vo37_report.json'), 'w'), indent=1)
    bad = [r for r in report if r[3] > 0.15]
    print('clips', len(bank), 'js bytes', len(js), 'above 0.15 WER:', [(r[0], r[3]) for r in bad])
if __name__ == '__main__': main()
