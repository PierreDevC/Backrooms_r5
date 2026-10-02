import sys, wave, numpy as np
from math import gcd
from scipy.signal import resample_poly
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8', download_root='/data/audio/whisper')
def load(p):
    with wave.open(p) as w:
        sr = w.getframerate(); ch = w.getnchannels(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if ch > 1: a = a.reshape(-1, ch).mean(1)
    g = gcd(16000, sr); return resample_poly(a, 16000 // g, sr // g).astype(np.float32)
def tr(p):
    segs, info = m.transcribe(load(p), beam_size=3, language='en')
    return ' '.join(s.text.strip() for s in segs)
if __name__ == '__main__':
    for p in sys.argv[1:]: print(p.split('/')[-1], '|', tr(p))
