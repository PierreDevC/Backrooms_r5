import numpy as np
from piper import PiperVoice, SynthesisConfig
from dsp import write_wav
from asr import tr
vs = {k: PiperVoice.load(f'voices/{k}.onnx') for k in ['en_US-kristin-medium', 'en_US-joe-medium', 'en_GB-cori-high']}
for vk, v in vs.items():
    for t in ['Reyes, I found claw marks.', 'Ray-ess, I found claw marks.', 'Rayes, I found claw marks.', 'Okafor split the code.', 'Oh-kah-for split the code.', 'Okafore split the code.']:
        a = np.concatenate([c.audio_float_array for c in v.synthesize(t, syn_config=SynthesisConfig(length_scale=1.0))])
        write_wav('/tmp/n.wav', a, 22050); print(vk[6:12], '|', t, '->', tr('/tmp/n.wav'))
