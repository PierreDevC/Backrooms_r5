import numpy as np, sys, json, os
from scipy.signal import lfilter, resample_poly
from dsp import *
SR = 32000; OUT = '/data/audio/out/sfx'
only = set(sys.argv[1:])
class A(np.ndarray):
    """1-D signal whose + pads to the longer operand"""
    def __add__(self, o):
        if isinstance(o, np.ndarray) and o.ndim == 1 and o.shape != self.shape:
            n = max(len(self), len(o)); r = np.zeros(n); r[:len(self)] += np.asarray(self); r[:len(o)] += np.asarray(o); return r.view(A)
        return np.ndarray.__add__(self, o)
    __radd__ = __add__
    def __iadd__(self, o): return self.__add__(o)
def AV(x): return np.asarray(x, np.float64).view(A)
def T(d, sr=SR): return np.arange(int(d * sr)) / sr
def N(d): return int(d * SR)
def sat(x, k): return np.tanh(k * x) / np.tanh(k)
def pk(x, p=0.89): m = np.max(np.abs(x)); return x * (p / m) if m > 0 else x
def lin(pts, n, sr=SR):
    t = np.arange(n) / sr; ts, vs = zip(*pts); return np.interp(t, ts, vs)
def sine_sweep(d, f0, f1, dec, ph=0, kind='exp'):
    t = T(d); f = f0 * (f1 / f0) ** (t / d) if kind == 'exp' else f0 + (f1 - f0) * t / d
    return AV(np.sin(2 * np.pi * np.cumsum(f) / SR + ph) * np.exp(-t / dec))
def burst(d, atk, dec, seed, lp=None, hp=None, bp=None, order=2):
    x = noise(N(d), seed) * expenv(N(d), SR, atk, dec)
    if lp: x = filt(x, SR, 'lp', lp, order)
    if hp: x = filt(x, SR, 'hp', hp, order)
    if bp: x = filt(x, SR, 'bp', bp, order)
    return AV(x)
def modal(d, modes, seed=0, exc=0.002):
    """modes: list of (freq, decay, amp)"""
    t = T(d); r = rng(seed); y = np.zeros(len(t))
    for f, dec, a in modes: y += a * np.sin(2 * np.pi * f * t + r.random() * 6) * np.exp(-t / dec)
    e = int(exc * SR); y[:e] *= np.linspace(0, 1, e); return AV(y)
def crackle(d, rate, seed, lo=2000, hi=8000, amp_var=1.0):
    r = rng(seed); n = N(d); x = np.zeros(n); k = r.poisson(rate * d)
    for p in r.integers(0, n, k): x[p] += r.standard_normal() * (1 + amp_var * r.random())
    return AV(filt(x, SR, 'bp', (lo, hi), 2))
# ---------------------------------------------------------------- vocal synth
V = {'a': ([730, 1090, 2440, 3400], [90, 110, 160, 250]), 'ae': ([660, 1720, 2410, 3400], [80, 100, 150, 250]),
     'i': ([270, 2290, 3010, 3500], [60, 100, 150, 250]), 'u': ([300, 870, 2240, 3300], [70, 90, 150, 250]),
     'o': ([570, 840, 2410, 3300], [80, 90, 150, 250]), 'e': ([530, 1840, 2480, 3500], [70, 100, 150, 250]),
     'uh': ([640, 1190, 2390, 3300], [80, 100, 150, 250])}
def glottal(f0, sr, tp, tn, r, jitter, shimmer):
    j = filt(r.standard_normal(len(f0)), sr, 'lp', 25, 1); j /= np.std(j) + 1e-9
    f = f0 * (1 + jitter * j); ph = np.cumsum(f / sr); p = ph % 1.0
    g = np.where(p < tp, 0.5 * (1 - np.cos(np.pi * p / tp)), np.where(p < tp + tn, np.cos(np.pi * (p - tp) / (2 * tn)), 0.0))
    cyc = np.floor(ph).astype(int); g = g * (1 + shimmer * r.standard_normal(cyc.max() + 2))[cyc]
    return np.diff(g, prepend=0), ph
def cascade(x, sr, tracks, block=48):
    y = x
    for F, B in tracks:
        out = np.zeros_like(y); zi = np.zeros(2)
        for s in range(0, len(y), block):
            e = min(len(y), s + block); f = min(F[s], sr * 0.45); b = B[s]
            rr = np.exp(-np.pi * b / sr); c = 2 * rr * np.cos(2 * np.pi * f / sr); A = 1 - c + rr * rr
            out[s:e], zi = lfilter([A], [1, -c, rr * rr], y[s:e], zi=zi)
        y = out
    return y
def voc(dur, f0pts, vowels, amp=None, scale=1.0, bwk=1.0, tp=0.42, tn=0.16, jitter=0.015, shimmer=0.05, sub=0.0, rough=0.0,
        rough_f=50, breath=0.08, tilt=3000, seed=0, vib=(5.5, 0.0)):
    sr2 = SR * 2; n2 = int(dur * sr2); t = np.arange(n2) / sr2; r = rng(seed)
    f0 = lin(f0pts, n2, sr2) * (1 + vib[1] * np.sin(2 * np.pi * vib[0] * t))
    src, ph = glottal(f0, sr2, tp, tn, r, jitter, shimmer); src /= np.std(src) + 1e-9
    if sub: cyc = np.floor(ph).astype(int); src = src * np.where(cyc % 2 == 0, 1 + sub, 1 - sub)
    if rough:
        rn = filt(r.standard_normal(n2), sr2, 'lp', 8, 1); rn /= np.std(rn) + 1e-9
        src = src * (1 + rough * np.sin(2 * np.pi * np.cumsum(rough_f * (1 + 0.3 * rn)) / sr2))
    br = filt(r.standard_normal(n2), sr2, 'hp', 500, 1) * (0.55 + 0.45 * np.cos(2 * np.pi * ph))
    x = src + breath * br * 3
    x = filt(x, sr2, 'lp', tilt, 1)
    times = [v[0] for v in vowels]
    tracks = [(np.interp(t, times, [V[v[1]][0][k] * scale for v in vowels]), np.interp(t, times, [V[v[1]][1][k] * bwk for v in vowels])) for k in range(4)]
    y = cascade(x, sr2, tracks)
    env = lin(amp, n2, sr2) if amp else np.minimum(1, np.minimum(t / 0.05, (dur - t) / 0.12))
    y = resample_poly(y * env, 1, 2); return y / (np.max(np.abs(y)) + 1e-9)
# ---------------------------------------------------------------- designs
S = {}
def carpet_step(seed, wet=False):
    r = rng(seed); x = np.zeros(N(0.5)); a0 = 0.008
    heel = burst(0.12, 0.0015, r.uniform(0.016, 0.026), seed, lp=r.uniform(650, 1000)) * 1.0
    heel += burst(0.03, 0.0005, 0.004, seed + 1, lp=2600) * 0.35
    thump = sine_sweep(0.12, r.uniform(85, 105), 48, 0.035) * 0.55
    place(x, heel + thump[:len(heel)] if len(thump) >= len(heel) else heel, N(a0))
    to = a0 + r.uniform(0.07, 0.11)
    toe = burst(0.14, 0.004, r.uniform(0.025, 0.04), seed + 2, lp=r.uniform(1100, 1600)) * r.uniform(0.45, 0.6)
    place(x, toe, N(to))
    scuff = burst(0.16, 0.02, 0.05, seed + 3, bp=(1800, 6500)) * 0.06
    place(x, scuff, N(to - 0.02))
    place(x, crackle(0.08, 900, seed + 4, 2500, 7000) * 0.012, N(a0))
    if wet:
        sq = burst(0.2, 0.01, 0.07, seed + 5, bp=(500, 1500)); sq *= 1 + 0.7 * np.sin(2 * np.pi * r.uniform(18, 30) * T(0.2)); place(x, sq * 0.35, N(to - 0.01))
        for k in range(r.integers(2, 5)):
            f0 = r.uniform(900, 1600); place(x, sine_sweep(0.03, f0, f0 * 1.8, 0.006, kind='lin') * 0.12, N(to + r.uniform(0, 0.12)))
    x = reverb(x, SR, 0.06, 0.35, 3.5, 3000, seed); return fade(x, SR, 0.001, 0.05)
for i in range(8): S[f'step{i}'] = carpet_step(100 + i)
for i in range(4): S[f'wstep{i}'] = carpet_step(200 + i, True)
def heavy_step(seed):
    r = rng(seed); x = np.zeros(N(0.7))
    place(x, sine_sweep(0.5, r.uniform(48, 58), 24, 0.11) * 1.0, 0)
    place(x, burst(0.3, 0.003, 0.06, seed, lp=260) * 0.9, 0)
    place(x, burst(0.08, 0.001, 0.018, seed + 1, bp=(160, 520)) * 0.7, 0)
    place(x, burst(0.2, 0.01, 0.06, seed + 2, lp=900) * 0.25, N(0.07))   # weight roll
    if r.random() < 0.6:  # claws dragging on carpet
        c = burst(0.22, 0.03, 0.08, seed + 3, bp=(2500, 7500)) * (1 + 0.8 * np.sin(2 * np.pi * r.uniform(25, 45) * T(0.22))); place(x, c * 0.18, N(0.05))
    x = reverb(x, SR, 0.12, 0.8, 3, 2500, seed); return fade(x, SR, 0.001, 0.1)
for i in range(4): S[f'hstep{i}'] = heavy_step(300 + i)
def bone_crack(seed, n=(3, 8), span=0.06, soft=False):
    r = rng(seed); x = np.zeros(N(0.3))
    for k in range(r.integers(*n)):
        at = r.uniform(0, span); f1 = r.uniform(1400, 3800)
        imp = burst(0.004, 0.0002, 0.0008, seed + k, hp=900) * r.uniform(0.5, 1)
        res = modal(0.05, [(f1, 0.006, 1), (f1 * r.uniform(1.4, 1.9), 0.004, 0.6), (r.uniform(250, 420), 0.012, 0.8)], seed + k, 0.0003)
        ev = np.convolve(imp, res[:N(0.04)])[:N(0.05)] * (0.4 if soft else 1)
        place(x, ev, N(0.01 + at))
    x = x + burst(0.3, 0.0005, 0.004, seed + 50, lp=700) * 0.2
    x = reverb(x, SR, 0.1, 0.5, 3, 5000, seed); return fade(x, SR, 0.0005, 0.05)
for i in range(4): S[f'crack{i}'] = bone_crack(400 + i)
for i in range(3): S[f'click{i}'] = bone_crack(450 + i, (2, 5), 0.18, True)
def steel_door(seed=500):
    r = rng(seed); x = np.zeros(N(3.4))
    latch = modal(0.5, [(612, 0.18, 1), (1347, 0.12, 0.7), (2231, 0.08, 0.5), (3633, 0.05, 0.35), (4801, 0.04, 0.2)], seed) * 0.5
    latch += sine_sweep(0.3, 110, 60, 0.05) * 0.9 + burst(0.05, 0.0005, 0.006, seed, hp=1500) * 0.6
    place(x, latch, N(0.02)); place(x, latch * 0.5, N(0.13))
    # hinge creak: stick-slip impulses exciting hinge resonances
    d = 1.7; n = N(d); t = T(d); rate = 22 + 38 * np.sin(np.pi * t / d) ** 0.7 + 6 * np.sin(2 * np.pi * 1.3 * t)
    ph = np.cumsum(rate * (1 + 0.25 * filt(noise(n, seed + 3), SR, 'lp', 20, 1) * 3) / SR)
    imp = np.zeros(n); idx = np.where(np.diff(np.floor(ph)) > 0)[0]; imp[idx] = 0.5 + 0.5 * rng(seed + 4).random(len(idx))
    hinge = np.zeros(n)
    for f, q in [(388, 0.03), (761, 0.025), (1152, 0.02), (1733, 0.015), (2611, 0.01)]:
        hinge += lfilter(*_res(f, q), imp)
    hinge = hinge * np.sin(np.pi * t / d) ** 0.5 * (0.7 + 0.3 * np.sin(2 * np.pi * 0.9 * t))
    body = filt(brown(n, seed + 5), SR, 'lp', 180, 2) * np.sin(np.pi * t / d) * 0.35
    place(x, pk(hinge, 0.5) + body, N(0.28))
    stop = sine_sweep(0.6, 70, 34, 0.14) * 1.0 + burst(0.3, 0.001, 0.05, seed + 6, lp=400) * 0.8 + modal(0.9, [(430, 0.3, 0.4), (1010, 0.2, 0.3), (1788, 0.15, 0.2), (2950, 0.1, 0.15)], seed + 7) * 0.4
    place(x, stop, N(2.0))
    x = reverb(x, SR, 0.3, 2.2, 2.6, 4000, seed); return fade(x, SR, 0.002, 0.3)
def _res(f, dec):
    rr = np.exp(-1 / (dec * SR)); c = 2 * rr * np.cos(2 * np.pi * f / SR); return [1 - rr], [1, -c, rr * rr]
S['door'] = steel_door()
def vhs_tape(seed=600):
    x = np.zeros(N(2.1)); r = rng(seed)
    clack = burst(0.03, 0.0003, 0.003, seed, bp=(1200, 5000)) + modal(0.08, [(930, 0.02, 0.6), (1870, 0.015, 0.4), (2950, 0.01, 0.3)], seed) * 0.5
    place(x, clack, N(0.02)); place(x, clack * 0.7, N(0.3))
    place(x, sine_sweep(0.2, 160, 80, 0.04) * 0.5 + burst(0.1, 0.001, 0.02, seed + 1, lp=600) * 0.6, N(0.32))
    d = 1.3; t = T(d); m = N(d)
    f = 118 + 12 * np.minimum(1, t / 0.25) + 2 * np.sin(2 * np.pi * 3.1 * t)
    motor = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 + np.sin(2 * np.pi * np.cumsum(f * 2) / SR) * 0.4
    motor = filt(motor, SR, 'lp', 1800, 2) * 0.35
    gears = filt(np.sign(np.sin(2 * np.pi * np.cumsum(f * 5.5) / SR)), SR, 'bp', (1500, 4500), 2) * 0.05
    env = np.minimum(1, t / 0.08) * np.minimum(1, (d - t) / 0.15)
    place(x, (motor + gears + burst(d, 0.05, 10, seed + 2, bp=(2000, 7000)) * 0.03) * env, N(0.45))
    place(x, modal(0.2, [(700, 0.04, 0.8), (1500, 0.03, 0.5)], seed + 3) * 0.6 + burst(0.05, 0.0005, 0.006, seed + 4, bp=(900, 3000)) * 0.6, N(1.62))
    return fade(reverb(x, SR, 0.05, 0.3, 3, 4000, seed), SR, 0.001, 0.1)
S['tape'] = vhs_tape()
def radio_sq(seed, out=False):
    r = rng(seed); x = np.zeros(N(0.45))
    key = burst(0.012, 0.0003, 0.002, seed, bp=(1500, 6000)) + modal(0.03, [(2100, 0.006, 0.5), (3900, 0.004, 0.3)], seed) * 0.4
    if not out:
        place(x, key * 0.8, 0); nb = burst(0.09, 0.002, 0.05, seed + 1, bp=(700, 3600)); place(x, nb * 0.5, N(0.015))
        place(x, np.sin(2 * np.pi * 1750 * T(0.04)) * 0.08 * np.hanning(N(0.04)), N(0.02))
    else:
        d = r.uniform(0.2, 0.28); ns = burst(d, 0.002, 1, seed + 1, bp=(500, 4200)) * np.minimum(1, (d - T(d)) / 0.05)
        ns *= 1 + 0.5 * np.sin(2 * np.pi * 43 * T(d)); place(x, ns * 0.55, 0); place(x, key * 0.7, N(d + 0.005))
    return fade(x[:N(0.05) + (N(0.13) if not out else N(0.33))], SR, 0.0005, 0.01)
for i in range(2): S[f'rin{i}'] = radio_sq(700 + i); S[f'rout{i}'] = radio_sq(710 + i, True)
def switch(seed, hi):
    x = np.zeros(N(0.12)); r = rng(seed)
    for k, at in enumerate([0.004, 0.004 + r.uniform(0.018, 0.03)]):
        c = burst(0.006, 0.0002, 0.0012, seed + k, bp=(2000, 9000)) * (1 if k == 0 else 0.55)
        c = c + modal(0.03, [(hi * (1 + 0.1 * k), 0.008, 0.25), (hi * 2.3, 0.004, 0.12), (480, 0.01, 0.2)], seed + k, 0.0003)
        place(x, c, N(at))
    return AV(fade(reverb(x, SR, 0.05, 0.2, 3, 6000, seed), SR, 0.0005, 0.02))
S['fl_on'] = switch(800, 1650); S['fl_off'] = switch(801, 1320)
def battery(seed=820):
    x = np.zeros(N(1.35)); r = rng(seed)
    sl = burst(0.18, 0.02, 1, seed, bp=(1500, 6000)) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 31 * T(0.18)))) * np.hanning(N(0.18)); place(x, sl * 0.25, N(0.01))
    place(x, switch(seed + 1, 1900) * 0.8, N(0.2))
    for k in range(3):   # batteries rattling out
        place(x, modal(0.12, [(r.uniform(2800, 3400), 0.03, 0.5), (r.uniform(5000, 6200), 0.02, 0.3), (r.uniform(1100, 1400), 0.04, 0.3)], seed + 10 + k) * 0.35, N(0.36 + k * r.uniform(0.05, 0.09)))
    for k, at in enumerate([0.78, 0.95]):
        place(x, burst(0.01, 0.0003, 0.002, seed + 20 + k, bp=(1500, 6000)) * 0.6 + modal(0.06, [(2400, 0.015, 0.3), (700, 0.02, 0.3)], seed + 20 + k) * 0.5, N(at))
    place(x, switch(seed + 3, 1500), N(1.18))
    return fade(reverb(x, SR, 0.06, 0.3, 3, 5000, seed), SR, 0.001, 0.05)
S['batt'] = battery()
def bubble(f0, d=0.05, seed=0):
    t = T(d); f = f0 * (1 + 2.2 * t / d); return AV(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d * 0.35)))
def drink(seed=840):
    r = rng(seed); x = np.zeros(N(2.4))
    place(x, crackle(0.28, 160, seed, 1500, 7000) * 0.5, N(0.02))   # cap
    place(x, switch(seed + 1, 1200) * 0.5, N(0.3))
    for k in range(4):
        at = 0.55 + k * r.uniform(0.3, 0.38)
        g = sine_sweep(0.09, r.uniform(150, 190), 90, 0.03) * 0.7 + burst(0.07, 0.004, 0.02, seed + 10 + k, lp=500) * 0.5
        for b in range(r.integers(2, 5)): place(g, bubble(r.uniform(300, 700), 0.04, seed + b) * 0.25, N(r.uniform(0.0, 0.05)))
        slosh = burst(0.22, 0.03, 0.08, seed + 20 + k, bp=(400, 1400)) * 0.18
        place(x, g, N(at)); place(x, slosh, N(at - 0.08))
    exh = burst(0.55, 0.05, 0.25, seed + 30, bp=(600, 2600)) * 0.22; place(x, exh, N(1.85))
    return fade(reverb(x, SR, 0.05, 0.3, 3, 4000, seed), SR, 0.001, 0.08)
S['drink'] = drink()
def rustle(d, seed, rate=500, amp=1.0):
    t = T(d); env = np.sin(np.pi * t / d) ** 0.6 * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 3.3 * t + 1)))
    x = crackle(d, rate, seed, 1800, 9000) * 0.5 + burst(d, 0.01, 10, seed + 1, bp=(900, 6000)) * 0.12
    return x * env * amp
def pickup(seed=860):
    x = np.zeros(N(0.8)); place(x, rustle(0.5, seed), N(0.01))
    place(x, modal(0.15, [(820, 0.03, 0.5), (1650, 0.02, 0.3)], seed) * 0.4 + burst(0.03, 0.0005, 0.005, seed + 2, lp=1800) * 0.6, N(0.42))
    return fade(reverb(x, SR, 0.05, 0.3, 3, 5000, seed), SR, 0.001, 0.05)
S['pick'] = pickup()
def search(seed=870):
    x = np.zeros(N(1.7)); place(x, rustle(0.7, seed, 700), N(0.02))
    d = 0.45; t = T(d); rate = 90 + 260 * t / d; ph = np.cumsum(rate / SR); imp = np.zeros(N(d)); imp[np.where(np.diff(np.floor(ph)) > 0)[0]] = 1
    z = filt(imp, SR, 'bp', (1800, 7000), 2) * 0.8 + filt(imp, SR, 'bp', (500, 1200), 2) * 0.3; place(x, z * np.hanning(N(d)) ** 0.3, N(0.75))
    place(x, rustle(0.4, seed + 5, 400, 0.7), N(1.2))
    return fade(reverb(x, SR, 0.05, 0.3, 3, 5000, seed), SR, 0.001, 0.05)
S['search'] = search()
def jumpscare(seed=880):
    r = rng(seed); x = np.zeros(N(1.8))
    place(x, sine_sweep(1.4, 70, 26, 0.45) * 1.0, 0)
    place(x, burst(0.4, 0.001, 0.12, seed, lp=5000) * 0.9, 0)
    t = T(1.3); scr = np.zeros(N(1.3))
    for k, f in enumerate([820, 1343, 2210, 3104, 4420]):
        fm = f * (1 + 0.012 * np.sin(2 * np.pi * (6 + k) * t) + 0.02 * filt(noise(N(1.3), seed + k), SR, 'lp', 12, 1))
        scr += np.sin(2 * np.pi * np.cumsum(fm) / SR) / (1 + k * 0.4)
    scr *= np.exp(-t / 0.5) * np.minimum(1, t / 0.01) * (1 + 0.6 * np.sin(2 * np.pi * 63 * t))
    place(x, scr * 0.45, N(0.005))
    cr = noise(N(0.3), seed + 9); cr = np.repeat(cr[::14], 14)[:N(0.3)]; cr = np.round(cr * 3) / 3; place(x, cr * np.exp(-T(0.3) / 0.1) * 0.3, 0)
    x = sat(x * 1.3, 2.5)
    return fade(reverb(x, SR, 0.2, 1.4, 3, 6000, seed), SR, 0.001, 0.3)
S['jump'] = jumpscare()
def sting(seed=890):
    d = 3.2; t = T(d); x = np.zeros(N(d)); r = rng(seed)
    env = np.minimum(1, (t / 0.7) ** 2) * np.exp(-np.maximum(0, t - 0.8) / 0.9)
    for k, st in enumerate([0, 1, 2, 6, 7, 11, 13]):
        f = 98 * 2 ** (st / 12) * (1 + 0.004 * np.sin(2 * np.pi * r.uniform(4.5, 6) * t + r.random() * 6))
        saw = 2 * ((np.cumsum(f) / SR) % 1) - 1; x += saw * r.uniform(0.6, 1)
    x = filt(x, SR, 'lp', 1400, 2) * env
    hi = sum(np.sin(2 * np.pi * f * t) for f in (1760, 1864.7, 2637)) * np.minimum(1, t / 0.4) * np.exp(-t / 1.2) * 0.12
    x = x / np.max(np.abs(x)) + hi
    place(x, sine_sweep(1.6, 55, 30, 0.6) * 0.6 * np.minimum(1, T(1.6) / 0.3), N(0.55))
    return fade(reverb(x, SR, 0.35, 2.8, 2.4, 5000, seed), SR, 0.01, 0.5)
S['sting'] = sting()
# ---- creature vocals
def howl(seed, var):
    r = rng(seed); d = [3.4, 3.0, 3.8][var]
    f0 = [[(0, 90), (0.6, 175), (1.6, 165), (2.6, 120), (d, 58)], [(0, 120), (0.35, 210), (1.2, 190), (2.2, 90), (d, 50)], [(0, 70), (0.9, 150), (2.0, 158), (3.0, 100), (d, 45)]][var]
    vw = [[(0, 'u'), (0.5, 'a'), (1.8, 'a'), (d, 'o')], [(0, 'uh'), (0.3, 'a'), (1.4, 'o'), (d, 'u')], [(0, 'u'), (1.0, 'a'), (2.4, 'o'), (d, 'u')]][var]
    amp = [(0, 0), (0.15, 0.7), (0.6, 1), (d - 1.2, 0.85), (d, 0)]
    a = voc(d, f0, vw, amp, scale=0.72, bwk=1.5, jitter=0.03, shimmer=0.12, sub=0.45, rough=0.45, rough_f=38, breath=0.25, tilt=2200, seed=seed, vib=(4.8, 0.025))
    hi = voc(d, [(p[0], p[1] * 2.03) for p in f0], vw, [(0, 0), (0.4, 0.2), (0.8, 0.7), (1.6, 0.4), (d, 0)], scale=0.95, bwk=1.2, jitter=0.04, rough=0.6, rough_f=71, breath=0.35, tilt=4000, seed=seed + 1)
    t = T(d); sub = filt(np.sign(np.sin(2 * np.pi * np.cumsum(lin([(0, 44), (d, 36)], N(d))) / SR)), SR, 'lp', 140, 2) * lin(amp, N(d)) * 0.5
    x = a[:N(d)] + hi[:N(d)] * 0.45 + sub
    x = sat(x * 1.2, 2.2); x = peak_eq(x, SR, 350, 4, 0.9)
    return fade(reverb(x, SR, 0.4, 2.8, 2.5, 4000, seed), SR, 0.01, 0.6)
for i in range(3): S[f'howl{i}'] = howl(900 + i, i)
def screech(seed, hi):
    d = 1.15 if hi else 1.3
    if hi: f0 = [(0, 900), (0.12, 1450), (0.5, 1350), (d, 700)]; vw = [(0, 'ae'), (0.6, 'ae'), (d, 'i')]; sc = 1.1
    else: f0 = [(0, 260), (0.1, 520), (0.6, 470), (d, 210)]; vw = [(0, 'a'), (0.5, 'ae'), (d, 'uh')]; sc = 0.85
    amp = [(0, 0), (0.03, 1), (d * 0.6, 0.85), (d, 0)]
    x = voc(d, f0, vw, amp, scale=sc, bwk=1.3, jitter=0.05, shimmer=0.15, sub=0.35, rough=0.75, rough_f=85 if hi else 55, breath=0.4, tilt=5200, seed=seed, vib=(7, 0.03))
    if not hi: x = x + 0.6 * voc(d, [(p[0], p[1] * 0.5) for p in f0], vw, amp, scale=0.7, jitter=0.06, sub=0.5, rough=0.6, rough_f=30, breath=0.3, tilt=2000, seed=seed + 1)
    x = sat(x * 1.3, 3)
    return fade(reverb(x, SR, 0.3, 1.8, 2.6, 6000, seed), SR, 0.003, 0.4)
S['scrLo'] = screech(950, False); S['scrHi'] = screech(951, True)
def scream(seed, fem, var):
    r = rng(seed); d = [1.7, 2.2][var]
    b = 700 if fem else 400
    f0 = [(0, b * 0.8), (0.12, b * 1.25), (0.8, b * 1.2), (d * 0.85, b * 0.95), (d, b * 0.6)] if var == 0 else [(0, b), (0.1, b * 1.35), (0.5, b * 1.3), (0.9, b * 1.1), (1.05, b * 0.8), (1.25, b * 1.3), (d, b * 0.7)]
    amp = [(0, 0), (0.06, 1), (d * 0.8, 0.8), (d, 0)] if var == 0 else [(0, 0), (0.05, 1), (0.95, 0.9), (1.05, 0.1), (1.2, 1), (d - 0.2, 0.7), (d, 0)]
    vw = [(0, 'a'), (d * 0.6, 'ae'), (d, 'a')]
    x = voc(d, f0, vw, amp, scale=1.17 if fem else 1.0, bwk=1.1, jitter=0.035, shimmer=0.1, sub=0.2, rough=0.4, rough_f=r.uniform(60, 80), breath=0.3, tilt=4500, seed=seed, vib=(6, 0.02))
    x = sat(x * 1.1, 1.8)
    return fade(reverb(x, SR, 0.3, 2.0, 2.6, 5000, seed), SR, 0.005, 0.5)
S['scrM0'] = scream(960, False, 0); S['scrM1'] = scream(961, False, 1); S['scrF0'] = scream(962, True, 0); S['scrF1'] = scream(963, True, 1)
def giggle(seed, n=6):
    r = rng(seed); d = n * 0.16 + 0.6; x = np.zeros(N(d))
    for k in range(n):
        f = 560 - k * 28 + r.uniform(-15, 15); sd = r.uniform(0.07, 0.1)
        h = burst(0.05, 0.005, 0.02, seed + k, bp=(1500, 5500)) * 0.25
        v = voc(sd, [(0, f * 1.05), (sd, f * 0.88)], [(0, 'e'), (sd, 'i')], [(0, 0), (0.012, 1), (sd * 0.5, 0.8), (sd, 0)], scale=1.3, jitter=0.03, breath=0.6, tilt=5000, seed=seed + 10 + k) * 0.8
        at = 0.05 + k * r.uniform(0.13, 0.17); place(x, h, N(at)); place(x, v, N(at + 0.035))
    x = varispeed(x, 0.92)
    return fade(reverb(x, SR, 0.45, 2.4, 2.2, 6000, seed), SR, 0.005, 0.5)
S['gig0'] = giggle(970); S['gig1'] = giggle(971, 8)
def growl_loop(seed=980, d=4.0):
    D = d + 1.0; r = rng(seed)
    pts = [(0, 55)] + [(tt, r.uniform(42, 66)) for tt in np.arange(0.4, D, 0.4)] + [(D, 55)]
    ampp = [(0, 0.7)] + [(tt, r.uniform(0.45, 1.0)) for tt in np.arange(0.3, D, 0.3)] + [(D, 0.7)]
    vw = [(0, 'o'), (1.2, 'uh'), (2.4, 'o'), (3.6, 'a'), (D, 'o')]
    a = voc(D, pts, vw, ampp, scale=0.66, bwk=1.6, tp=0.5, tn=0.3, jitter=0.06, shimmer=0.15, sub=0.3, rough=0.5, rough_f=22, breath=1.2, tilt=1100, seed=seed)
    n = N(D); ns = filt(noise(n, seed + 7), SR, 'bp', (110, 420), 2); am = filt(noise(n, seed + 8), SR, 'lp', 9, 1); am = np.clip(0.5 + am / (np.std(am) + 1e-9) * 0.4, 0, 1.2)
    x = a[:n] + pk(ns * am, 0.6) * lin(ampp, n)
    x = sat(x * 1.2, 1.8)
    x = filt(x, SR, 'hp', 35, 2)
    k = N(1.0); m = N(d); y = x[:m].copy(); w = np.linspace(0, 1, k)
    y[:k] = y[:k] * w + x[m:m + k] * (1 - w)   # seamless loop crossfade
    return pk(y, 0.8)
S['growlLoop'] = growl_loop()
def breath_loop(seed=990):
    r = rng(seed); x = np.zeros(N(4.4)); at = 0.0
    for c in range(2):
        di = r.uniform(0.8, 0.95); de = r.uniform(1.0, 1.15)
        inh = noise(N(di), seed + c) ; inh = filt(inh, SR, 'bp', (900, 4200), 2) + 0.4 * filt(inh, SR, 'bp', (2300, 2900), 2)
        ti = T(di); inh *= np.sin(np.pi * ti / di) ** 1.4 * 0.5
        exh = noise(N(de), seed + 10 + c); exh = filt(exh, SR, 'bp', (350, 2600), 2) + 0.3 * filt(exh, SR, 'bp', (900, 1300), 2)
        te = T(de); exh *= (np.minimum(1, te / 0.08) * np.exp(-te / (de * 0.55))) * 0.8
        vo = voc(de * 0.6, [(0, 120), (de * 0.6, 100)], [(0, 'uh'), (de * 0.6, 'uh')], [(0, 0), (0.05, 1), (de * 0.6, 0)], breath=0.9, tilt=1500, seed=seed + 20 + c) * 0.035
        place(x, inh, N(at)); place(x, exh, N(at + di + 0.05)); place(x, vo, N(at + di + 0.06))
        at += di + de + 0.15
    return pk(fade(x[:N(at)], SR, 0.05, 0.05), 0.7)
S['breathLoop'] = breath_loop()
def ambient_far(kind, seed):
    r = rng(seed)
    if kind == 'slam':
        x = np.zeros(N(1.0)); place(x, sine_sweep(0.6, 70, 35, 0.12) + burst(0.3, 0.001, 0.04, seed, lp=500) * 0.8 + modal(0.8, [(310, 0.25, 0.3), (740, 0.18, 0.2), (1320, 0.1, 0.1)], seed) * 0.5, 0)
    elif kind == 'groan':
        d = 2.6; t = T(d); rate = 9 + 7 * np.sin(np.pi * t / d); ph = np.cumsum(rate / SR); imp = np.zeros(N(d)); imp[np.where(np.diff(np.floor(ph)) > 0)[0]] = 1
        x = np.zeros(N(d))
        for f, dec in [(92, 0.08), (143, 0.06), (221, 0.05), (365, 0.03), (590, 0.02)]: x += lfilter(*_res(f, dec), imp)
        x = pk(x) * np.sin(np.pi * t / d) + filt(brown(N(d), seed), SR, 'lp', 120, 2) * 0.3 * np.sin(np.pi * t / d)
    else:
        x = np.zeros(N(1.4))
        for k in range(3): place(x, burst(0.12, 0.001, 0.02, seed + k, bp=(120, 900)) + sine_sweep(0.1, 140, 90, 0.02) * 0.6, N(0.02 + k * r.uniform(0.28, 0.36)))
    x = filt(x, SR, 'lp', 1100, 2)
    return fade(reverb(x, SR, 0.7, 3.0, 2.4, 1800, seed), SR, 0.01, 0.8)
S['farSlam'] = ambient_far('slam', 1000); S['farGroan'] = ambient_far('groan', 1001); S['farKnock'] = ambient_far('knock', 1002)
def powerdown(seed=1010):
    d = 2.4; t = T(d); x = np.zeros(N(d + 0.6))
    f = 60 * np.maximum(0.12, 1 - (t / 1.9) ** 0.8)
    hum = sum(np.sin(2 * np.pi * np.cumsum(f * h) / SR) / h for h in (1, 2, 3, 4, 6)) * np.exp(-t / 0.9) * 0.4
    place(x, hum, N(0.05))
    place(x, crackle(0.25, 400, seed, 2000, 9000) * 0.4, 0)
    place(x, sine_sweep(0.5, 90, 40, 0.1) + burst(0.2, 0.001, 0.03, seed, lp=600) * 0.8 + modal(0.3, [(1450, 0.05, 0.4), (2890, 0.03, 0.3)], seed) * 0.4, 0)
    return fade(reverb(x, SR, 0.25, 2.0, 2.6, 3000, seed), SR, 0.002, 0.5)
S['pdown'] = powerdown()
# whisper one-shots from the generated whisper lines, reversed
for i, k in enumerate(['wh0', 'wh2', 'wh4']):
    p = f'/data/audio/out/vo/{k}.wav'
    if os.path.exists(p):
        a, sr = read_wav(p); a = resample_poly(a, SR // 1000, sr // 50) if sr == 22050 else a
        a = a[::-1]; a = varispeed(a, 0.9)
        S[f'whs{i}'] = fade(reverb(a, SR, 0.3, 2.0, 2.4, 6000, i), SR, 0.05, 0.3)
man = {}
for k, x in S.items():
    if only and k not in only: continue
    x = pk(np.asarray(x, np.float64), 0.89 if not k.endswith('Loop') else 0.8)
    if not k.endswith('Loop'):
        e = env_rms_db(x, SR, 0.01); idx = np.where(e > -62)[0]
        if len(idx): x = fade(x[:min(len(x), (idx[-1] + 2) * N(0.01))], SR, 0.0005, 0.03)
    write_wav(f'{OUT}/{k}.wav', x, SR); man[k] = round(len(x) / SR, 3)
print(json.dumps(man))
