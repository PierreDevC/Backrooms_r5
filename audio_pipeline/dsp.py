import numpy as np, wave
from scipy.signal import butter, sosfilt, fftconvolve, stft, istft, resample_poly
RNG = np.random.default_rng(417)
def rng(seed): return np.random.default_rng(seed)
def write_wav(path, a, sr):
    a = np.clip(np.asarray(a, np.float64), -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((a * 32767).astype(np.int16).tobytes())
def read_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    return a, sr
def filt(a, sr, kind, f, order=2):
    if kind == 'bp': sos = butter(order, [f[0] / (sr / 2), min(f[1] / (sr / 2), 0.99)], 'bandpass', output='sos')
    else: sos = butter(order, min(f / (sr / 2), 0.99), {'lp': 'lowpass', 'hp': 'highpass'}[kind], output='sos')
    return sosfilt(sos, a)
def peak_eq(a, sr, f0, gain_db, q=1.0):
    A = 10 ** (gain_db / 40); w0 = 2 * np.pi * f0 / sr; al = np.sin(w0) / (2 * q)
    b = np.array([1 + al * A, -2 * np.cos(w0), 1 - al * A]); aa = np.array([1 + al / A, -2 * np.cos(w0), 1 - al / A])
    from scipy.signal import lfilter
    return lfilter(b / aa[0], aa / aa[0], a)
def env_rms_db(a, sr, win=0.03):
    n = int(sr * win); k = len(a) // n
    if k == 0: return np.array([-120.0])
    fr = a[:k * n].reshape(k, n); return 10 * np.log10(np.mean(fr ** 2, 1) + 1e-12)
def trim(a, sr, thr=-42, pad=0.035):
    n = int(sr * 0.01); k = len(a) // n
    fr = 10 * np.log10(np.mean(a[:k * n].reshape(k, n) ** 2, 1) + 1e-12)
    idx = np.where(fr > thr)[0]
    if not len(idx): return a
    s = max(0, idx[0] * n - int(pad * sr)); e = min(len(a), (idx[-1] + 1) * n + int(pad * sr))
    b = a[s:e].copy(); f = int(0.006 * sr); b[:f] *= np.linspace(0, 1, f); b[-f:] *= np.linspace(1, 0, f); return b
def active_rms_db(a, sr):
    e = env_rms_db(a, sr); m = e.max(); act = e[e > m - 25]
    return 10 * np.log10(np.mean(10 ** (act / 10)))
def limit(a, ceil=0.89):
    # soft knee limiter
    x = a / ceil; y = np.where(np.abs(x) < 0.7, x, np.sign(x) * (0.7 + 0.3 * np.tanh((np.abs(x) - 0.7) / 0.3)))
    return y * ceil
def norm(a, sr, target_db=-19, ceil=0.89):
    g = 10 ** ((target_db - active_rms_db(a, sr)) / 20); return limit(a * g, ceil)
def fade(a, sr, fi=0.005, fo=0.02):
    a = a.copy(); i = max(1, int(fi * sr)); o = max(1, int(fo * sr)); a[:i] *= np.linspace(0, 1, i); a[-o:] *= np.linspace(1, 0, o); return a
def ir(sr, sec=1.6, decay=3.0, lp=5000, seed=1, early=True, stereo=False):
    r = rng(seed); n = int(sr * sec); t = np.arange(n) / sr
    x = r.standard_normal(n) * np.exp(-decay * t / sec * 2.3)
    x = filt(x, sr, 'lp', lp, 1)
    if early:
        for d, g in [(0.011, 0.6), (0.019, 0.45), (0.027, 0.35), (0.041, 0.3), (0.053, 0.22)]:
            k = int(d * sr * (0.9 + 0.2 * r.random())); x[k] += g * (1 if r.random() < 0.5 else -1) * 3
    x[:int(0.004 * sr)] *= np.linspace(0, 1, int(0.004 * sr))
    return x / np.sqrt(np.sum(x ** 2))
def reverb(a, sr, wet=0.3, sec=1.6, decay=3.0, lp=5000, seed=1, pre=0.012):
    h = ir(sr, sec, decay, lp, seed); w = fftconvolve(a, h)[:len(a) + len(h)]
    out = np.zeros(len(a) + len(h) + int(pre * sr)); out[:len(a)] += a * (1 - wet * 0.5)
    k = int(pre * sr); out[k:k + len(w)] += w * wet
    return out
def varispeed(a, rate):
    """time-varying resample; rate array (per output sample) or scalar. rate>1 = faster/higher"""
    if np.isscalar(rate):
        n = int(len(a) / rate); pos = np.arange(n) * rate
    else:
        pos = np.cumsum(rate); pos = pos[pos < len(a) - 1]
    return np.interp(pos, np.arange(len(a)), a)
def rate_curve(n_out, fn):
    t = np.arange(n_out); return fn(t)
def whisperize(a, sr, seed=3, smooth_hz=260, nper=1024):
    f, t, Z = stft(a, sr, nperseg=nper, noverlap=nper * 3 // 4)
    mag = np.abs(Z); k = max(3, int(smooth_hz / (sr / nper)))
    ker = np.hanning(k); ker /= ker.sum()
    sm = np.apply_along_axis(lambda c: np.convolve(c, ker, 'same'), 0, mag)
    r = rng(seed); ph = np.exp(1j * r.uniform(0, 2 * np.pi, Z.shape))
    tilt = (1 + (f / 2500)[:, None] ** 1.2)   # whisper is brighter
    _, y = istft(sm * ph * tilt, sr, nperseg=nper, noverlap=nper * 3 // 4)
    return y[:len(a)]
def noise(n, seed=0): return rng(seed).standard_normal(n)
def pink(n, seed=0):
    w = rng(seed).standard_normal(n); X = np.fft.rfft(w); f = np.arange(len(X)); f[0] = 1; X /= np.sqrt(f); y = np.fft.irfft(X, n); return y / np.std(y)
def brown(n, seed=0):
    y = np.cumsum(rng(seed).standard_normal(n)); y = filt(y, 44100, 'hp', 15, 1); return y / (np.std(y) + 1e-9)
def expenv(n, sr, atk, dec):
    t = np.arange(n) / sr; e = np.exp(-t / dec); a = int(atk * sr)
    if a > 0: e[:a] *= np.linspace(0, 1, a)
    return e
def place(buf, x, at):
    at = int(at); e = min(len(buf), at + len(x))
    if e > at: buf[at:e] += x[:e - at]
