// r7: builds game/src/howlerbank.js from the CC0 clips in ./src by layering them offline in a headless Chromium (Web Audio).
// hcall0-2: the Howler's territorial call (deep, long, reverberant; plays from wherever it is, every few minutes).
// hsee0-2: the scream when it sees you (high, distorted, metallic; the clip a player is meant to flinch at).
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const SR = 32000, SRC = path.join(__dirname, 'src'), OUT = path.join(__dirname, '..', '..', 'src', 'howlerbank.js');
const SPEC = [
  { k: 'hcall0', len: 6.4, dist: 1.4, rev: [2.6, 0.42], lp: 3200, hp: 40, L: [['monster_roar.wav', 'loud', 4.2, 0.9, 0, 1], ['howl.ogg', 0, 0, 0.55, 0.35, 0.7], ['monster_04.ogg', 0, 0, 0.5, 1.6, 0.5]] },
  { k: 'hcall1', len: 6.0, dist: 1.8, rev: [3.0, 0.45], lp: 2800, hp: 40, L: [['troll-roars.ogg', 'loud', 3.6, 0.78, 0, 1], ['monster_07.ogg', 0, 0, 0.7, 0.5, 0.7], ['monster_06.ogg', 0, 0, 0.5, 1.5, 0.6]] },
  { k: 'hcall2', len: 5.6, dist: 1.2, rev: [3.2, 0.5], lp: 2400, hp: 40, L: [['monster_03.ogg', 0, 0, 0.5, 0.9, 1], ['troll_02.ogg', 0, 0, 0.62, 1.7, 0.8], ['alien_01.ogg', 0, 0, 0.4, 0.2, 0.45], ['monster_06.ogg', 0, 0, 0.45, 2.6, 0.6]] },
  { k: 'hsee0', len: 3.4, dist: 5, rev: [0.7, 0.25], lp: 9000, hp: 160, screech: [900, 2300, 0.32], L: [['scream_01.ogg', 0, 0, 0.85, 0, 1], ['scream_horror1.mp3', 'loud', 1.9, 0.9, 0.05, 0.8], ['roar_03.ogg', 0, 0, 0.6, 0.1, 0.9], ['alien_06.ogg', 0, 0, 0.55, 0.1, 0.5]] },
  { k: 'hsee1', len: 3.6, dist: 6, rev: [0.9, 0.3], lp: 8000, hp: 140, screech: [700, 2600, 0.3], L: [['scream_02.ogg', 0, 0, 0.75, 0, 1], ['monster_01.ogg', 0, 0, 0.8, 0.05, 0.8], ['scream_horror1.mp3', 'loud2', 1.8, 0.8, 0.3, 0.7], ['troll_03.ogg', 0, 0, 0.6, 0.2, 0.7]] },
  { k: 'hsee2', len: 3.2, dist: 6, rev: [0.6, 0.22], lp: 10000, hp: 180, screech: [1100, 2000, 0.36], L: [['alien_03.ogg', 0, 0, 0.7, 0, 0.9], ['scream_01.ogg', 0, 0, 0.65, 0.04, 1], ['monster_02.ogg', 0, 0, 0.6, 0.1, 0.7], ['roar_02.ogg', 0, 0, 0.7, 0.2, 0.8]] },
];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM }), p = await b.newPage(); await p.setContent('<html></html>');
  const files = {}; for (const s of SPEC) for (const l of s.L) files[l[0]] = fs.readFileSync(path.join(SRC, l[0])).toString('base64');
  const out = await p.evaluate(async ([files, SPEC, SR]) => {
    const dec = {}; const D = new OfflineAudioContext(1, 44100, 44100);
    for (const [n, b64] of Object.entries(files)) dec[n] = await D.decodeAudioData(Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer);
    const loud = (buf, w, skip) => { const d = buf.getChannelData(0), n = Math.floor(w * buf.sampleRate), step = Math.floor(buf.sampleRate / 10); let best = 0, bs = -1; const starts = [];
      for (let i = 0; i + n < d.length; i += step) { let e = 0; for (let j = 0; j < n; j += 8) e += d[i + j] * d[i + j]; starts.push([e, i]); }
      starts.sort((a, c) => c[1] - a[1]); const ranked = starts.slice().sort((a, c) => c[0] - a[0]); const first = ranked[0][1];
      if (!skip) return first / buf.sampleRate; for (const [e, i] of ranked) if (Math.abs(i - first) > n) return i / buf.sampleRate; return first / buf.sampleRate; };
    const res = {};
    for (const s of SPEC) {
      const C = new OfflineAudioContext(1, Math.ceil(s.len * SR), SR), mix = C.createGain(); mix.gain.value = 1;
      for (const [n, mode, w, rate, at, g] of s.L) {
        const buf = dec[n], src = C.createBufferSource(); src.buffer = buf; src.playbackRate.value = rate;
        const off = mode ? loud(buf, w, mode === 'loud2') : 0, dur = mode ? w : buf.duration;
        const gn = C.createGain(); gn.gain.value = g; const a = Math.min(0.03, dur / 4); gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(g, at + a);
        gn.gain.setValueAtTime(g, at + dur / rate - 0.12); gn.gain.linearRampToValueAtTime(0, at + dur / rate);
        src.connect(gn).connect(mix); src.start(at, off, dur);
      }
      if (s.screech) { const [f0, f1, v] = s.screech, o = C.createOscillator(), og = C.createGain(), lf = C.createOscillator(), lg = C.createGain(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, 0.05); o.frequency.exponentialRampToValueAtTime(f1, 0.9); o.frequency.exponentialRampToValueAtTime(f0 * 0.8, s.len * 0.8);
        lf.frequency.value = 38; lg.gain.value = 90; lf.connect(lg).connect(o.frequency); og.gain.setValueAtTime(0, 0); og.gain.linearRampToValueAtTime(v, 0.12); og.gain.setValueAtTime(v, s.len * 0.5); og.gain.linearRampToValueAtTime(0, s.len * 0.85); o.connect(og).connect(mix); o.start(0); lf.start(0); }
      const hp = C.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = s.hp; const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = s.lp;
      const ws = C.createWaveShaper(), cv = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; cv[i] = Math.tanh(x * s.dist) / Math.tanh(s.dist); } ws.curve = cv; ws.oversample = '2x';
      const [rt, rw] = s.rev, irn = Math.floor(rt * SR), ir = C.createBuffer(1, irn, SR), id = ir.getChannelData(0); let seed = 12345; for (let i = 0; i < irn; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; id[i] = ((seed / 4294967296) * 2 - 1) * Math.pow(1 - i / irn, 2.6); }
      const cvn = C.createConvolver(), dry = C.createGain(), wet = C.createGain(); cvn.buffer = ir; dry.gain.value = 1 - rw * 0.6; wet.gain.value = rw;
      const comp = C.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.2;
      mix.connect(hp).connect(ws).connect(lp); lp.connect(dry).connect(comp); lp.connect(cvn).connect(wet).connect(comp); comp.connect(C.destination);
      const r = await C.startRendering(), d = r.getChannelData(0), n = d.length; let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(d[i]));
      const k = 0.95 / (pk || 1), fade = Math.floor(0.25 * SR), pcm = new Int16Array(n); for (let i = 0; i < n; i++) { let v = d[i] * k; if (i > n - fade) v *= (n - i) / fade; pcm[i] = Math.max(-32767, Math.min(32767, Math.round(v * 32767))); }
      const hdr = new DataView(new ArrayBuffer(44)); const w4 = (o, t) => { for (let i = 0; i < 4; i++) hdr.setUint8(o + i, t.charCodeAt(i)); };
      w4(0, 'RIFF'); hdr.setUint32(4, 36 + n * 2, true); w4(8, 'WAVE'); w4(12, 'fmt '); hdr.setUint32(16, 16, true); hdr.setUint16(20, 1, true); hdr.setUint16(22, 1, true); hdr.setUint32(24, SR, true); hdr.setUint32(28, SR * 2, true); hdr.setUint16(32, 2, true); hdr.setUint16(34, 16, true); w4(36, 'data'); hdr.setUint32(40, n * 2, true);
      const bytes = new Uint8Array(44 + n * 2); bytes.set(new Uint8Array(hdr.buffer), 0); bytes.set(new Uint8Array(pcm.buffer), 44);
      let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      res[s.k] = { b64: btoa(bin), dur: n / SR, peakBefore: pk };
    }
    return res;
  }, [files, SPEC, SR]);
  let js = '// ---------- r7 · Howler voice bank (generated by game/tools/audio/build_howler_audio.js from CC0 clips; see docs/CREDITS.md) ----------\n';
  js += 'Object.assign(ABANK, {' + Object.entries(out).map(([k, v]) => `"${k}":"${v.b64}"`).join(',') + '});\nObject.assign(ABANK_G, {' + Object.keys(out).map(k => `"${k}":1`).join(',') + '});\n';
  fs.writeFileSync(OUT, js); console.log(Object.entries(out).map(([k, v]) => `${k} ${v.dur.toFixed(2)}s pre-norm peak ${v.peakBefore.toFixed(2)}`).join('\n'), '\n' + (js.length / 1e6).toFixed(2) + ' MB'); await b.close();
})();
