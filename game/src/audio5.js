// ---------- Level 5 sound design (synthesized): moths, valves, the front-desk bell, keys, clocks, the band that never stops ----------
const SFX5 = {
  chitter(pos) { shot((d, t) => { for (let i = 0; i < 10; i++) nz(d, t + i * 0.042 + Math.random() * 0.02, 0.028, 'bandpass', 3000 + Math.random() * 2600, 9, 0.32, 0.001); tone(d, t, 0.45, 'sawtooth', 1900, 1300, 0.025, 0.01); return 0.6; }, pos, 1); },
  burst(pos) { shot((d, t) => { for (let i = 0; i < 16; i++) nz(d, t + i * 0.05, 0.05, 'lowpass', 380 + Math.random() * 200, 0.8, 0.4 * (1 - i / 18), 0.004); nz(d, t, 0.8, 'bandpass', 1800, 0.8, 0.12, 0.05); return 1; }, pos, 1); },
  screech(pos) { shot((d, t) => {
    const out = distortNode(d, 0.5); tone(out, t, 0.7, 'sawtooth', 2600, 900, 0.16, 0.01); tone(out, t + 0.02, 0.6, 'square', 1700, 700, 0.06, 0.01);
    nz(d, t, 0.8, 'bandpass', 2800, 3, 0.5, 0.01); for (let i = 0; i < 10; i++) nz(d, t + i * 0.04, 0.04, 'lowpass', 420, 1, 0.5, 0.003); return 0.9; }, pos, 1.25); },
  squeal(pos, dur = 2.2) { shot((d, t) => {
    const o = tone(d, t, dur, 'sawtooth', 330, 560, 0.05, 0.25); o.detune.setValueAtTime(0, t); o.detune.linearRampToValueAtTime(-60, t + dur);
    nz(d, t, dur, 'bandpass', 1300, 16, 0.3, 0.2); for (let i = 0; i < 9; i++) nz(d, t + i * dur / 9 + Math.random() * 0.05, 0.05, 'bandpass', 900 + Math.random() * 700, 4, 0.35, 0.002);
    nz(d, t + dur, 0.12, 'lowpass', 500, 1, 0.7, 0.002); tone(d, t + dur, 0.35, 'triangle', 260, 240, 0.08, 0.002); return dur + 0.5; }, pos, 1); },
  bell(pos, soft) { shot((d, t) => { const f = 2093 * (soft ? 0.94 : 1); [[1, 0.2, 2.2], [2.76, 0.09, 1.4], [5.4, 0.05, 0.8], [8.93, 0.025, 0.5]].forEach(([m, v, L]) => tone(d, t, L, 'sine', f * m, f * m * 0.998, v * (soft ? 0.5 : 1), 0.001)); nz(d, t, 0.03, 'highpass', 5000, 1, 0.2, 0.001); return 2.4; }, pos, 1); },
  jingle(pos) { shot((d, t) => { for (let i = 0; i < 12; i++) { const s = t + Math.random() * 0.45, f = 3200 + Math.random() * 3200; nz(d, s, 0.03, 'bandpass', f, 12, 0.3, 0.001); tone(d, s, 0.2, 'triangle', f * 0.9, f * 0.9, 0.018, 0.001); } return 0.8; }, pos, 1); },
  tick(pos, tock) { shot((d, t) => { nz(d, t, 0.025, 'bandpass', tock ? 1700 : 2500, 7, 0.3, 0.001); tone(d, t, 0.04, 'sine', tock ? 900 : 1300, tock ? 880 : 1280, 0.04, 0.001); return 0.1; }, pos, 0.8); },
  knock(pos, n = 3) { shot((d, t) => { for (let i = 0; i < n; i++) { const s = t + i * 0.28 + Math.random() * 0.04; nz(d, s, 0.09, 'lowpass', 320, 1, 0.8, 0.002); tone(d, s, 0.12, 'sine', 120, 70, 0.45, 0.002); nz(d, s, 0.02, 'bandpass', 1500, 2, 0.15, 0.001); } return n * 0.3 + 0.3; }, pos, 1); },
  unlock(pos) { shot((d, t) => { for (let i = 0; i < 3; i++) { const s = t + i * 0.42; nz(d, s, 0.05, 'bandpass', 2600, 5, 0.4, 0.001); nz(d, s + 0.1, 0.1, 'lowpass', 520, 1, 0.8, 0.002); tone(d, s + 0.1, 0.14, 'triangle', 190, 130, 0.12, 0.002); } return 1.6; }, pos, 1); },
  click(pos) { shot((d, t) => { nz(d, t, 0.02, 'bandpass', 3000, 3, 0.4, 0.001); tone(d, t, 0.03, 'square', 1400, 1400, 0.03, 0.001); return 0.1; }, pos, 1); },
  pipes(pos) { shot((d, t) => { for (let i = 0; i < 5; i++) { const s = t + i * rnd(0.15, 0.4), f = rnd(180, 320); nz(d, s, 0.06, 'lowpass', 600, 1, 0.6, 0.002); [[1, 0.1], [2.7, 0.05], [5.1, 0.025]].forEach(([m, v]) => tone(d, s, 0.9 / m, 'sine', f * m, f * m * 0.99, v, 0.002)); } return 2.4; }, pos, 1.1); },
  eyes() { shot((d, t) => { const f = nz(d, t, 1.6, 'bandpass', 900, 5, 0.12, 0.4); f.frequency.linearRampToValueAtTime(420, t + 1.6); tone(d, t, 1.8, 'sine', 55, 45, 0.3, 0.3); nz(d, t + 0.2, 1.2, 'highpass', 5000, 1, 0.05, 0.4); return 2; }, null, 0.8); },
};
// wingbeats: a soft band of noise chopped by a fast LFO
function mkFlutter5() {
  const C = AU.ctx, v = mkVoice(1.8, 1.25), s = loopSrc(AU.noise), b = C.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 240; b.Q.value = 0.8;
  const am = C.createGain(); am.gain.value = 0.5; const lfo = C.createOscillator(); lfo.frequency.value = 10; const lg = C.createGain(); lg.gain.value = 0.5; lfo.connect(lg).connect(am.gain); lfo.start();
  s.connect(b).connect(am).connect(v.in);
  const s2 = loopSrc(AU.noise), h = C.createBiquadFilter(); h.type = 'bandpass'; h.frequency.value = 2400; h.Q.value = 1.2; const hg = C.createGain(); hg.gain.value = 0.08; s2.connect(h).connect(hg).connect(am);
  v.lfo = lfo; return v;
}
// the boiler room: a deep throb you feel more than hear
function mkRumble5() {
  const C = AU.ctx, g = C.createGain(); g.gain.value = 0; g.connect(AU.duckB);
  const s = loopSrc(AU.brown), l = C.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 120; s.connect(l).connect(g);
  const o = C.createOscillator(); o.frequency.value = 47; const og = C.createGain(); og.gain.value = 0.35; const lf = C.createOscillator(); lf.frequency.value = 0.6; const lfg = C.createGain(); lfg.gain.value = 0.25; lf.connect(lfg).connect(og.gain); lf.start(); o.connect(og).connect(g); o.start();
  return { g };
}
// ----- the Beverly Room's band: a swing tune in F, rendered once offline, played back through a gramophone -----
async function prepJazz5() {
  if (AU.jazz5 || AU.jazz5p) return AU.jazz5p;
  const OAC = window.OfflineAudioContext || window.webkitOfflineAudioContext; if (!OAC) return;
  const SR = 22050, BEAT = 0.6, BAR = BEAT * 4, BARS = 16, LEN = BAR * BARS, C = new OAC(2, Math.ceil(SR * (LEN + 0.05)), SR);
  const R = mulberry32(5150), rr = (a, b) => a + R() * (b - a), mf = m => 440 * Math.pow(2, (m - 69) / 12);
  const bus = C.createGain(); bus.gain.value = 0.9;
  const hp = C.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 260; const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3400; lp.Q.value = 0.9;
  const pk = C.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1200; pk.gain.value = 5; pk.Q.value = 0.7;
  const ws = C.createWaveShaper(), cv = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 256 - 1; cv[i] = Math.tanh(x * 1.8) / Math.tanh(1.8); } ws.curve = cv;
  const out = C.createGain(); out.gain.value = 0.8; bus.connect(hp).connect(pk).connect(lp).connect(ws).connect(out).connect(C.destination);
  const note = (t, dur, type, f, vol, atk, rel, dest = bus, det = 0) => { const o = C.createOscillator(), g = C.createGain(); o.type = type; o.frequency.value = f; o.detune.value = det; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + atk); g.gain.setTargetAtTime(0, t + dur, rel); o.connect(g).connect(dest); o.start(t); o.stop(t + dur + rel * 6); return o; };
  const nb = C.createBuffer(1, SR, SR), nd = nb.getChannelData(0); for (let i = 0; i < SR; i++) nd[i] = Math.random() * 2 - 1;
  const hit = (t, dur, type, f, Q, vol) => { const s = C.createBufferSource(); s.buffer = nb; const fl = C.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = Q; const g = C.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0005, t + dur); s.connect(fl).connect(g).connect(bus); s.start(t, rr(0, 0.5)); s.stop(t + dur + 0.02); };
  const CH = [[53, [0, 4, 7, 11]], [50, [0, 4, 7, 10]], [55, [0, 3, 7, 10]], [48, [0, 4, 7, 10]], [57, [0, 3, 7, 10]], [50, [0, 4, 7, 10]], [55, [0, 3, 7, 10]], [48, [0, 4, 7, 10]],
    [53, [0, 4, 7, 11]], [53, [0, 4, 7, 10]], [58, [0, 4, 7, 11]], [58, [0, 3, 7, 9]], [57, [0, 3, 7, 10]], [50, [0, 4, 7, 10]], [55, [0, 3, 7, 10]], [48, [0, 4, 7, 10]]];
  const sw = (bar, beat, off) => bar * BAR + beat * BEAT + (off ? BEAT * 0.66 : 0);
  const pianoBus = C.createBiquadFilter(); pianoBus.type = 'lowpass'; pianoBus.frequency.value = 2400; pianoBus.connect(bus);
  const hornBus = C.createBiquadFilter(); hornBus.type = 'bandpass'; hornBus.frequency.value = 1300; hornBus.Q.value = 1.3; const hg = C.createGain(); hg.gain.value = 1.4; hornBus.connect(hg).connect(bus);
  const vib = C.createOscillator(); vib.frequency.value = 5.2; const vg = C.createGain(); vg.gain.value = 9; vib.connect(vg); vib.start(0);
  const scale = [0, 2, 4, 5, 7, 9, 10, 11];
  let last = 69;
  for (let b = 0; b < BARS; b++) {
    const [root, iv] = CH[b], nx = CH[(b + 1) % BARS][0];
    // walking bass
    const bn = [root - 12, root - 12 + iv[R() < 0.5 ? 1 : 2], root - 12 + iv[2], nx - 12 + (R() < 0.5 ? -1 : 1)];
    bn.forEach((m, i) => { const t = sw(b, i, false); note(t, BEAT * 0.8, 'triangle', mf(m), 0.34, 0.01, 0.08); note(t, BEAT * 0.5, 'sine', mf(m - 12), 0.18, 0.01, 0.1); });
    // piano comping: the Charleston - beat 1 and the and-of-2
    for (const [bt, off, v] of [[0, false, 0.05], [1, true, 0.045], ...(R() < 0.4 ? [[3, false, 0.035]] : [])]) {
      const t = sw(b, bt, off); for (const k of [1, 3, 2]) { const m = root + 12 + iv[k] + (k === 2 && R() < 0.5 ? 2 : 0); note(t, BEAT * 0.55, 'triangle', mf(m), v, 0.005, 0.25, pianoBus); note(t, 0.08, 'sine', mf(m + 12), v * 0.4, 0.002, 0.1, pianoBus); }
    }
    // muted horn melody: short phrases, rests every fourth bar
    if (b % 4 !== 3) {
      const slots = [[0, false], [0, true], [1, true], [2, false], [2, true], [3, false]].filter(() => R() < 0.62);
      for (const [bt, off] of slots) {
        const tones = iv.map(q => root + 12 + q).concat(scale.map(q => 65 + q)).filter(m => m >= 64 && m <= 79);
        let m = tones.reduce((a, c) => Math.abs(c - last - rr(-4, 4)) < Math.abs(a - last) ? c : a, tones[0]); last = m;
        const t = sw(b, bt, off), dur = BEAT * rr(0.35, 0.75), o = note(t, dur, 'sawtooth', mf(m), 0.06, 0.03, 0.06, hornBus); vg.connect(o.detune);
      }
    } else note(sw(b, 0, false), BAR * 0.9, 'sawtooth', mf(root + 24 + iv[3]), 0.045, 0.2, 0.3, hornBus);
    // brushes + ride
    for (let i = 0; i < 4; i++) {
      hit(sw(b, i, false), 0.28, 'highpass', 6500, 0.7, 0.05);
      if (i % 2) { hit(sw(b, i, true), 0.14, 'highpass', 6500, 0.7, 0.03); hit(sw(b, i, false), 0.2, 'bandpass', 2600, 0.6, 0.07); }
      note(sw(b, i, false), 0.06, 'sine', 62, 0.14, 0.002, 0.04);
    }
  }
  // the record itself: crackle, pops and hiss for the whole side
  const cb = C.createBuffer(1, Math.ceil(SR * LEN), SR), cd = cb.getChannelData(0);
  for (let i = 0; i < cd.length; i++) { cd[i] = (Math.random() * 2 - 1) * 0.012; if (Math.random() < 0.0012) cd[i] += (Math.random() < 0.5 ? -1 : 1) * rr(0.08, 0.35); }
  const cs = C.createBufferSource(); cs.buffer = cb; cs.connect(out); cs.start(0);
  AU.jazz5p = C.startRendering().then(buf => { AU.jazz5 = buf; return buf; }).catch(() => null);
  return AU.jazz5p;
}
// gramophone voice at the bandstand + a muffled bed that seeps through the whole hotel
function mkJazz5() {
  if (!AU.ctx || !AU.jazz5 || !W5.gramo) return null;
  const C = AU.ctx, src = C.createBufferSource(); src.buffer = AU.jazz5; src.loop = true;
  const v = mkVoice(4.5, 1.0), g = C.createGain(); g.gain.value = 1; src.connect(g).connect(v.in);
  const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; const bed = C.createGain(); bed.gain.value = 0; src.connect(lp).connect(bed).connect(AU.duckB);
  src.start(0, Math.random() * AU.jazz5.duration);
  v.set(W5.gramo.x, W5.gramo.y, W5.gramo.z, PL.x, PL.z);
  return { v, bed, src };
}
