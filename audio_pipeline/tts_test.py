import numpy as np, wave, glob, os
from piper import PiperVoice, SynthesisConfig
txt = "Anyone copy? This is Marsh. We got split up when the floor gave out. We noclipped. All of us."
for p in sorted(glob.glob('voices/*.onnx')):
    v = PiperVoice.load(p); name = os.path.basename(p)[:-5]
    a = np.concatenate([c.audio_float_array for c in v.synthesize(txt, syn_config=SynthesisConfig(length_scale=1.05, noise_scale=0.7, noise_w_scale=0.9))])
    sr = v.config.sample_rate
    # rough f0 via autocorrelation on voiced frames
    f0s = []
    fl = int(sr * 0.04)
    for i in range(0, len(a) - fl, fl):
        fr = a[i:i + fl]; 
        if np.sqrt(np.mean(fr**2)) < 0.05: continue
        ac = np.correlate(fr, fr, 'full')[fl - 1:]
        lo, hi = int(sr / 400), int(sr / 70)
        k = lo + np.argmax(ac[lo:hi]); 
        if ac[k] > 0.4 * ac[0]: f0s.append(sr / k)
    with wave.open(f'test/{name}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    print(name, sr, f'{len(a)/sr:.2f}s', 'f0 med %.0f' % np.median(f0s), 'peak %.2f' % np.abs(a).max())
