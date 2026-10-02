import sys, numpy as np, matplotlib; matplotlib.use('Agg'); import matplotlib.pyplot as plt
from dsp import read_wav
names = sys.argv[2:]; out = sys.argv[1]
fig, ax = plt.subplots(len(names), 1, figsize=(12, 1.9 * len(names)))
for a, n in zip(np.atleast_1d(ax), names):
    x, sr = read_wav(n); a.specgram(x, NFFT=1024, Fs=sr, noverlap=768, cmap='magma', vmin=-110); a.set_ylim(0, min(8000, sr / 2)); a.set_title(n.split('/')[-1], fontsize=9, loc='left'); a.tick_params(labelsize=7)
    a2 = a.twinx(); a2.plot(np.arange(len(x)) / sr, x, lw=0.3, color='cyan', alpha=0.5); a2.set_ylim(-1, 1); a2.set_yticks([])
plt.tight_layout(); plt.savefig(out, dpi=70)
