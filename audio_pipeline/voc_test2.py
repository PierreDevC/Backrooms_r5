import numpy as np, wave
from piper import PiperVoice, SynthesisConfig
V = {k: PiperVoice.load(f'voices/{k}.onnx') for k in ['en_US-joe-medium', 'en_US-kristin-medium', 'en_US-ljspeech-high']}
tests = [('en_US-joe-medium', '[[ ˈɑːɑːɑːɑːɑːɑːɑːɑː ]]', 1.5, 'p_scr_m'), ('en_US-kristin-medium', '[[ ˈæːæːæːæːæːæːæː ]]', 1.5, 'p_scr_f'),
         ('en_US-joe-medium', '[[ hˈuːuːuːuːɑːɑːɑːɑːɑːɑː ]]', 2.0, 'p_howl'), ('en_US-ljspeech-high', '[[ hˈɛhɛhɛhɛhɛhɛ ]]', 1.1, 'p_gig'),
         ('en_US-kristin-medium', '[[ nˈoʊ nˈoʊ nˈoʊ ]]', 1.0, 'p_no')]
for vk, t, ls, n in tests:
    v = V[vk]; a = np.concatenate([c.audio_float_array for c in v.synthesize(t, syn_config=SynthesisConfig(length_scale=ls, noise_scale=0.8, noise_w_scale=0.9))])
    with wave.open(f'test/{n}.wav', 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    print(n, '%.2fs' % (len(a) / 22050))
