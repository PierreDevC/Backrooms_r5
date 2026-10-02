import subprocess, base64, json, glob, os, re, numpy as np
from dsp import read_wav, write_wav, active_rms_db
import lines as LN
VO = '/data/audio/out/vo'; SF = '/data/audio/out/sfx'; TMP = '/tmp/pack'; os.makedirs(TMP, exist_ok=True)
TARGET = {'step': -28, 'wstep': -27, 'hstep': -20, 'crack': -24, 'click': -27, 'door': -18, 'tape': -22, 'rin': -24, 'rout': -24,
          'fl_on': -26, 'fl_off': -26, 'batt': -24, 'drink': -24, 'pick': -25, 'search': -24, 'jump': -12, 'sting': -18, 'howl': -15,
          'scrLo': -15, 'scrHi': -15, 'scrM': -17, 'scrF': -17, 'gig': -20, 'growlLoop': -20, 'breathLoop': -24, 'farSlam': -20,
          'farGroan': -20, 'farKnock': -20, 'pdown': -18, 'whs': -22}
def grp(k): return re.sub(r'\d+$', '', k)
def enc(wav, br, sr):
    out = f'{TMP}/{os.path.basename(wav)[:-4]}.mp3'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ac', '1', '-ar', str(sr), '-codec:a', 'libmp3lame', '-b:a', br, out], check=True)
    return open(out, 'rb').read()
bank, gain, loops, raw = {}, {}, {}, 0
for w in sorted(glob.glob(f'{VO}/*.wav')):
    k = os.path.basename(w)[:-4]; b = enc(w, '24k', 16000); raw += len(b); bank[k] = base64.b64encode(b).decode()
for w in sorted(glob.glob(f'{SF}/*.wav')):
    k = os.path.basename(w)[:-4]; a, sr = read_wav(w)
    g = 10 ** ((TARGET[grp(k)] - active_rms_db(a, sr)) / 20); g = min(g, 1.25 / max(1e-6, np.max(np.abs(a))))
    gain[k] = round(float(g), 3)
    if k.endswith('Loop'):
        loops[k] = round(len(a) / sr, 4); p = f'{TMP}/{k}_x2.wav'; write_wav(p, np.concatenate([a, a]), sr); w = p
    b = enc(w, '48k', 32000); raw += len(b); bank[k] = base64.b64encode(b).decode()
TXT = dict(greet=LN.GREET, dirs=[d.upper() for d in LN.DIRS], dist=LN.DIST, tips=LN.TIPS, tipIds=[LN.tip_ids(i) for i in range(4)], flee=LN.FLEE,
           chat=LN.CHAT, story=LN.STORY, tapes=[t for _, t in LN.TAPES], mimic=LN.MIMIC, whisper=LN.WHISPER,
           intro=[l['text'] for l in LN.LINES if l['key'] in ('intro1', 'intro2')], l9=LN.L9)
js = '// ---------- embedded audio bank: Piper TTS voices (CC0 / public-domain models) + procedurally designed SFX ----------\n'
js += 'const ABANK = ' + json.dumps(bank, separators=(',', ':')) + ';\n'
js += 'const ABANK_G = ' + json.dumps(gain, separators=(',', ':')) + ';\n'
js += 'const ABANK_LOOP = ' + json.dumps(loops, separators=(',', ':')) + ';\n'
js += 'const VO_TXT = ' + json.dumps(TXT, ensure_ascii=False, indent=0) + ';\n'
open('/data/backrooms/src/audiobank.js', 'w').write(js)
print('clips', len(bank), 'mp3 bytes', raw, 'js bytes', len(js))
