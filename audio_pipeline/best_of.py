import sys, numpy as np
sys.argv = [sys.argv[0]] + ['--noop']
import gen_vo as G
from dsp import write_wav
from asr import tr
from asr_check import wer
from lines import LINES
keys = ['intro2', 'tape1', 'tape2', 'tape3', 'tape4', 'e1_chat1']
for i, L in enumerate(LINES):
    if L['key'] not in keys: continue
    best = (9, None, None)
    for j in range(8):
        a = G.make(L, 7000 + i * 17 + j, L['ls'] + [0, 0.04, -0.03, 0.06][j % 4], [0.667, 0.5, 0.6, 0.75][j // 2 % 4])
        write_wav('/tmp/b.wav', a, G.SR); h = tr('/tmp/b.wav'); w = wer(L['text'], h)
        if w < best[0]: best = (w, a, h)
        if w <= 0.04: break
    write_wav(f"{G.OUT}/{L['key']}.wav", best[1], G.SR); print(L['key'], round(best[0], 2), best[2], flush=True)
