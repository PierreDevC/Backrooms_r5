import numpy as np, sys, os, json
from piper import PiperVoice, SynthesisConfig
from dsp import *
from lines import LINES, VOICES
SR = 22050; OUT = '/data/audio/out/vo'
only = set(a for a in sys.argv[1:] if not a.startswith('--'))
cache = {}
def voice(v):
    if v not in cache: cache[v] = PiperVoice.load(f'/data/audio/voices/{VOICES[v]}.onnx')
    return cache[v]
def tts(v, text, ls, ns, seed):
    import random; np.random.seed(seed); random.seed(seed)
    vv = voice(v); a = np.concatenate([c.audio_float_array for c in vv.synthesize(text, syn_config=SynthesisConfig(length_scale=ls, noise_scale=ns, noise_w_scale=0.85))]).astype(np.float64)
    assert vv.config.sample_rate == SR, vv.config.sample_rate
    return a
def style_tape(a, seed):
    r = rng(seed); n = len(a)
    pre = int(0.45 * SR); post = int(0.5 * SR); x = np.concatenate([np.zeros(pre), a, np.zeros(post)])
    t = np.arange(len(x)) / SR
    rate = 1 + 0.0035 * np.sin(2 * np.pi * 0.55 * t + r.random() * 6) + 0.0012 * np.sin(2 * np.pi * 7.3 * t) + 0.0006 * np.sin(2 * np.pi * 13.1 * t)
    x = varispeed(x, rate * 0.985)
    x = filt(filt(x, SR, 'hp', 150, 2), SR, 'lp', 6200, 2); x = peak_eq(x, SR, 1500, 3, 0.8)
    x = norm(x, SR, -17, 0.95); x = np.tanh(1.35 * x) / np.tanh(1.35)
    x = reverb(x, SR, 0.12, 0.6, 3.5, 3500, seed)  # small room of the recording
    m = len(x); tt = np.arange(m) / SR
    hiss = filt(noise(m, seed + 1), SR, 'hp', 2500, 1) * 0.013 + filt(pink(m, seed + 2), SR, 'lp', 900, 1) * 0.01
    hum = 0.006 * np.sin(2 * np.pi * 59.94 * tt) + 0.003 * np.sin(2 * np.pi * 119.88 * tt)
    g = np.ones(m)
    for _ in range(r.integers(2, 4)):  # dropouts
        c = int(r.uniform(0.2, 0.9) * m); w = int(r.uniform(0.04, 0.11) * SR)
        g[c:c + w] *= np.hanning(len(g[c:c + w])) * -0.8 + 1
    x = x * g + hiss + hum
    # head-switching click at start / end
    for at in (int(0.05 * SR), m - int(0.12 * SR)):
        k = filt(noise(int(0.02 * SR), seed + at) * expenv(int(0.02 * SR), SR, 0, 0.004), SR, 'lp', 3000, 1) * 0.5
        place(x, k, at)
    return fade(x, SR, 0.02, 0.15)
def style_mimic(a, seed):
    r = rng(seed); n = len(a)
    # stutter: repeat a short chunk from the first word
    c = int(r.uniform(0.08, 0.2) * n); w = int(0.11 * SR)
    ch = a[c:c + w] * np.hanning(w) ** 0.3
    a = np.concatenate([a[:c + w], ch, a[c:]])
    n = len(a); t = np.arange(n) / SR; T = n / SR
    wob = 1 + 0.018 * np.sin(2 * np.pi * r.uniform(3, 5) * t) * (0.4 + 0.6 * (t / T))
    fall = 1 - 0.13 * np.clip((t / T - 0.68) / 0.32, 0, 1) ** 1.6
    x = varispeed(a, 0.97 * wob * fall)
    x = x + 0.12 * x * np.sin(2 * np.pi * 37 * np.arange(len(x)) / SR)   # faint ring-mod shimmer
    # reversed swell before the line
    rv = reverb(x, SR, 1.0, 1.2, 2.5, 4000, seed)[::-1]
    pre = rv[-int(0.5 * SR):] * 0.22 * np.linspace(0, 1, int(0.5 * SR)) ** 2
    y = np.concatenate([pre, x]); return fade(y, SR, 0.01, 0.05)
def style_whisper(a, seed):
    x = whisperize(a, SR, seed); x = filt(x, SR, 'hp', 350, 2)
    x = norm(x, SR, -20); rv = reverb(x, SR, 1.0, 2.2, 2.2, 6000, seed)[::-1][-int(0.6 * SR):] * 0.25 * np.linspace(0, 1, int(0.6 * SR)) ** 2
    y = reverb(np.concatenate([rv, x]), SR, 0.35, 2.0, 2.6, 5000, seed + 9); return fade(y, SR, 0.01, 0.2)
def make(L, seed, ls=None, ns=None):
    a = tts(L['v'], L['tts'], ls or L['ls'], ns or L['ns'], seed)
    a = trim(a, SR); a = filt(a, SR, 'hp', 75, 2)
    a = norm(a, SR, -19)
    st = L['style']
    if st == 'tape': a = style_tape(a, seed)
    elif st == 'mimic': a = norm(style_mimic(a, seed), SR, -19)
    elif st == 'whisper': a = norm(style_whisper(a, seed), SR, -22)
    return a
if __name__ == '__main__' and sys.argv[1:2] == ['--retry']:
    import json as J
    from asr_check import wer
    from asr import tr
    res = J.load(open('/data/audio/asr_res.json'))
    for i, L in enumerate(LINES):
        k = L['key']
        if k not in res or res[k][0] <= 0.12 or L['style'] in ('mimic', 'whisper'): continue
        best = (res[k][0], None)
        for j, (dls, ns) in enumerate([(0, 0.5), (0.05, 0.667), (-0.04, 0.6), (0.08, 0.45), (0, 0.8)]):
            a = make(L, 5000 + i * 31 + j, L['ls'] + dls, ns); write_wav('/tmp/try.wav', a, SR)
            w = wer(L['text'], tr('/tmp/try.wav'))
            if w < best[0] - 1e-6: best = (w, a)
            if w <= 0.05: break
        if best[1] is not None: write_wav(f'{OUT}/{k}.wav', best[1], SR); res[k] = (best[0], 'retry')
        print(k, 'best', round(best[0], 2), flush=True)
    J.dump(res, open('/data/audio/asr_res.json', 'w'))
    sys.exit(0)
if __name__ == '__main__':
  man = {}
  for i, L in enumerate(LINES):
      k = L['key']
      if only and k not in only: continue
      a = make(L, 1000 + i)
      write_wav(f'{OUT}/{k}.wav', a, SR); man[k] = round(len(a) / SR, 3)
      print(k, man[k], flush=True)
