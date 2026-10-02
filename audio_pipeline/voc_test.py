import numpy as np, wave
from piper import PiperVoice, SynthesisConfig
V = {k: PiperVoice.load(f'voices/{k}.onnx') for k in ['en_US-joe-medium', 'en_US-kristin-medium', 'en_US-ljspeech-high']}
tests = [('en_US-joe-medium', 'Aaaaaaaaaaaaah!', 1.6, 'scr_m'), ('en_US-kristin-medium', 'Aaaaaaaaaaaaah!', 1.6, 'scr_f'),
         ('en_US-joe-medium', 'No! No! Aaaaaaaaaaah!', 1.2, 'scr_m2'), ('en_US-joe-medium', 'Hooooooooaaaaaaaaaaaa', 2.2, 'howl'),
         ('en_US-joe-medium', 'Rrraaaaaaaaaaaaaagh', 2.0, 'growl'), ('en_US-ljspeech-high', 'He he he he he he.', 1.3, 'giggle'),
         ('en_US-ljspeech-high', 'Ha ha ha ha ha.', 1.2, 'laugh')]
for vk, t, ls, n in tests:
    v = V[vk]; a = np.concatenate([c.audio_float_array for c in v.synthesize(t, syn_config=SynthesisConfig(length_scale=ls, noise_scale=0.8, noise_w_scale=0.9))])
    with wave.open(f'test/{n}.wav', 'wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(22050); w.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    print(n, '%.2fs' % (len(a) / 22050))
