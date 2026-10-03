// ---------- fully synthesized positional audio ----------
const AU = { ctx: null, muted: false, loops: [] };
function audioInit(vol) {
  if (AU.ctx) return;
  const C = new (window.AudioContext || window.webkitAudioContext)(); AU.ctx = C;
  AU.master = C.createGain(); AU.master.gain.value = vol;
  const comp = C.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.attack.value = 0.004; comp.release.value = 0.2;
  AU.uw = C.createBiquadFilter(); AU.uw.type = 'lowpass'; AU.uw.frequency.value = 22000; AU.uw.Q.value = 0.5;   // r8: Level 37 closes this when your head goes under
  AU.master.connect(AU.uw).connect(comp).connect(C.destination);
  AU.verb = C.createConvolver(); AU.verb.buffer = makeIR(C, 1.9);
  AU.verbIn = C.createGain(); AU.verbIn.gain.value = 0.32; AU.verbIn.connect(AU.verb).connect(AU.master);
  AU.bus = C.createGain(); AU.bus.connect(AU.master); AU.bus.connect(AU.verbIn);
  AU.dry = C.createGain(); AU.dry.connect(AU.master);
  AU.duckA = C.createGain(); AU.duckA.connect(AU.bus); AU.duckB = C.createGain(); AU.duckB.connect(AU.master);
  AU.radioCurve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; AU.radioCurve[i] = Math.tanh(x * 1.7) / Math.tanh(1.7); }
  const len = C.sampleRate * 3; AU.noise = C.createBuffer(1, len, C.sampleRate);
  const nd = AU.noise.getChannelData(0); for (let i = 0; i < len; i++) nd[i] = Math.random() * 2 - 1;
  AU.brown = C.createBuffer(1, len, C.sampleRate); const bd = AU.brown.getChannelData(0); let l = 0;
  for (let i = 0; i < len; i++) { l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02; bd[i] = l * 3.5; }
  AU.dist = C.createWaveShaper(); AU.curve = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 512 - 1; AU.curve[i] = Math.tanh(x * 4); }
  // fluorescent hum bed
  AU.humG = C.createGain(); AU.humG.gain.value = 0; AU.humG.connect(AU.duckA);
  const hp = C.createBiquadFilter(); hp.type = 'lowpass'; hp.frequency.value = 1500; hp.Q.value = 0.8; hp.connect(AU.humG);
  [[120, 'sawtooth', 0.05], [60, 'sine', 0.08], [180, 'square', 0.008], [240.6, 'sawtooth', 0.012]].forEach(([f, t, g]) => { const o = C.createOscillator(), gg = C.createGain(); o.type = t; o.frequency.value = f; gg.gain.value = g; o.connect(gg).connect(hp); o.start(); });
  // room tone + sub drone
  AU.roomG = C.createGain(); AU.roomG.gain.value = 0.05; const rs = loopSrc(AU.brown); const rl = C.createBiquadFilter(); rl.type = 'lowpass'; rl.frequency.value = 380; rs.connect(rl).connect(AU.roomG).connect(AU.duckB);
  AU.droneG = C.createGain(); AU.droneG.gain.value = 0.035; AU.droneG.connect(AU.duckB);
  [41.2, 41.9, 61.7].forEach(f => { const o = C.createOscillator(); o.frequency.value = f; o.connect(AU.droneG); o.start(); });
  // tension pad (rises during chases)
  AU.tenG = C.createGain(); AU.tenG.gain.value = 0; AU.tenF = C.createBiquadFilter(); AU.tenF.type = 'lowpass'; AU.tenF.frequency.value = 300; AU.tenF.connect(AU.tenG).connect(AU.bus);
  [73.4, 77.8, 110.2, 155.6].forEach(f => { const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = Math.random() * 14 - 7; const g = C.createGain(); g.gain.value = 0.05; o.connect(g).connect(AU.tenF); o.start(); });
  // breathing (driven by stamina)
  AU.breathG = C.createGain(); AU.breathG.gain.value = 0; const bs = loopSrc(AU.noise); const bf = C.createBiquadFilter(); bf.type = 'bandpass'; bf.frequency.value = 900; bf.Q.value = 0.9; bs.connect(bf).connect(AU.breathG).connect(AU.bus); AU.breathNoise = bf;
  loadBank();
}
function makeIR(C, sec) {
  const len = Math.floor(C.sampleRate * sec), b = C.createBuffer(2, len, C.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.2) * (i < 80 ? i / 80 : 1); } }
  return b;
}
function loopSrc(buf) { const s = AU.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.start(0, Math.random() * 2); return s; }
function setAPos(p, x, y, z) { if (AU.remap) { const r = AU.remap(x, y, z); x = r[0]; y = r[1]; z = r[2]; } if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = -z; } else p.setPosition(x, y, -z); }
function setListener(x, y, z, fx, fy, fz) {
  if (!AU.ctx) return; const L = AU.ctx.listener;
  if (L.positionX) { L.positionX.value = x; L.positionY.value = y; L.positionZ.value = -z; L.forwardX.value = fx; L.forwardY.value = fy; L.forwardZ.value = -fz; L.upX.value = 0; L.upY.value = 1; L.upZ.value = 0; }
  else { L.setPosition(x, y, -z); L.setOrientation(fx, fy, -fz, 0, 1, 0); }
}
function mkPanner(ref = 1.6, roll = 1.25) { const p = AU.ctx.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = roll; p.maxDistance = 80; p.connect(AU.bus); return p; }
// a persistent positional voice with occlusion filter
function mkVoice(ref, roll) {
  const C = AU.ctx, g = C.createGain(), f = C.createBiquadFilter(), p = mkPanner(ref, roll);
  f.type = 'lowpass'; f.frequency.value = 18000; g.gain.value = 0; g.connect(f).connect(p);
  const v = { in: g, g, f, p, occl: 0, set(x, y, z, playerX, playerZ) { setAPos(p, x, y, z); const o = los(x, z, playerX, playerZ) ? 0 : 1; v.occl = lerp(v.occl, o, 0.15); f.frequency.value = lerp(18000, 700, v.occl); } };
  return v;
}
function shot(build, pos, vol = 1) {
  if (!AU.ctx || AU.ctx.state !== 'running') return;
  const C = AU.ctx, g = C.createGain(); g.gain.value = vol;
  let tail = [g];
  if (pos) {
    const f = C.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.value = pos.pl && !los(pos.x, pos.z, pos.pl.x, pos.pl.z) ? 800 : 18000;
    const p = mkPanner(pos.ref || 1.6, pos.roll || 1.2); setAPos(p, pos.x, pos.y || 1.2, pos.z); g.connect(f).connect(p); tail.push(f, p);
  } else g.connect(AU.bus);
  const dur = build(g, C.currentTime + 0.01) || 1;
  setTimeout(() => tail.forEach(n => { try { n.disconnect(); } catch (e) { } }), (dur + 1.5) * 1000);
}
function nz(dest, t, dur, type, freq, Q, vol, atk = 0.005, buf) {
  const C = AU.ctx, s = C.createBufferSource(); s.buffer = buf || AU.noise; const f = C.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = Q;
  const g = C.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(dest); s.start(t, Math.random() * 2); s.stop(t + dur + 0.05); return f;
}
function tone(dest, t, dur, type, f0, f1, vol, atk = 0.005) {
  const C = AU.ctx, o = C.createOscillator(), g = C.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.05); return o;
}
function distortNode(dest, amount = 1) { const w = AU.ctx.createWaveShaper(); w.curve = AU.curve; const g = AU.ctx.createGain(); g.gain.value = amount; g.connect(w).connect(dest); return g; }

const SFX = {
  step(kind, wet) { shot((d, t) => { const v = kind === 2 ? 0.5 : kind === 1 ? 0.28 : 0.12; nz(d, t, 0.13, 'lowpass', 650 + Math.random() * 300, 0.8, v); tone(d, t, 0.07, 'sine', 90, 50, v * 0.5); if (wet) nz(d, t + 0.02, 0.16, 'bandpass', 1300 + Math.random() * 500, 3, v * 0.6); return 0.3; }); },
  heavyStep(pos) { shot((d, t) => { tone(d, t, 0.28, 'sine', 62, 28, 0.9); nz(d, t, 0.2, 'lowpass', 260, 1, 0.6); if (Math.random() < 0.3) nz(d, t + 0.05, 0.05, 'highpass', 3000, 1, 0.25); return 0.4; }, pos, 1); },
  howl(pos) { shot((d, t) => { const out = distortNode(d, 0.5); const o = AU.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(210, t); o.frequency.linearRampToValueAtTime(260, t + 0.6); o.frequency.exponentialRampToValueAtTime(95, t + 3.2);
    const vib = AU.ctx.createOscillator(), vg = AU.ctx.createGain(); vib.frequency.value = 6.5; vg.gain.value = 9; vib.connect(vg).connect(o.frequency); vib.start(t); vib.stop(t + 3.4);
    const g = AU.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.3);
    [[620, 6], [1150, 7], [2400, 9]].forEach(([f, q]) => { const b = AU.ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; o.connect(b).connect(g); });
    g.connect(out); o.start(t); o.stop(t + 3.4); nz(d, t, 3.0, 'bandpass', 500, 2, 0.25, 0.8); return 3.6; }, pos, 1.6); },
  screech(pos, hi) { shot((d, t) => { const out = distortNode(d, 1.2); tone(out, t, 0.9, 'sawtooth', hi ? 900 : 420, hi ? 2600 : 180, 0.5, 0.01); tone(out, t, 0.8, 'square', hi ? 1340 : 610, hi ? 3100 : 240, 0.25, 0.01); nz(d, t, 0.9, 'highpass', 2000, 1, 0.4); return 1; }, pos, 1.3); },
  clicks(pos) { shot((d, t) => { const n = 2 + Math.floor(Math.random() * 4); for (let i = 0; i < n; i++) nz(d, t + Math.random() * 0.25, 0.025, 'highpass', 2500 + Math.random() * 2500, 2, 0.6, 0.001); return 0.4; }, pos, 1.1); },
  crack(pos) { shot((d, t) => { nz(d, t, 0.06, 'bandpass', 1800, 4, 0.9, 0.001); nz(d, t + 0.07, 0.05, 'bandpass', 2600, 4, 0.7, 0.001); return 0.2; }, pos, 1); },
  giggle(pos) { shot((d, t) => { for (let i = 0; i < 5; i++) { nz(d, t + i * 0.11, 0.08, 'bandpass', 3800 + i * 200, 8, 0.35, 0.01); tone(d, t + i * 0.11, 0.08, 'sine', 1900 + i * 60, 1700, 0.05); } return 0.8; }, pos, 1); },
  scream(pos) { shot((d, t) => { const out = distortNode(d, 0.8); const o = AU.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(610, t + 0.3); o.frequency.exponentialRampToValueAtTime(260, t + 1.4);
    const g = AU.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
    [[850, 5], [1600, 6]].forEach(([f, q]) => { const b = AU.ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = f; b.Q.value = q; o.connect(b).connect(g); }); g.connect(out); o.start(t); o.stop(t + 1.6); return 1.7; }, pos, 1.3); },
  jumpscare() { shot((d, t) => { const out = distortNode(d, 2); nz(out, t, 0.9, 'lowpass', 5000, 0.5, 0.9, 0.002); tone(out, t, 1.2, 'sawtooth', 140, 30, 0.8, 0.002); tone(d, t, 0.7, 'square', 1500, 2800, 0.25, 0.01); return 1.3; }, null, 0.9); },
  heartbeat(v) { shot((d, t) => { tone(d, t, 0.14, 'sine', 70, 40, v); tone(d, t + 0.22, 0.16, 'sine', 64, 36, v * 0.75); return 0.5; }); },
  pickup() { shot((d, t) => { tone(d, t, 0.12, 'sine', 880, 880, 0.2); tone(d, t + 0.08, 0.2, 'sine', 1320, 1320, 0.18); return 0.4; }); },
  click() { shot((d, t) => { nz(d, t, 0.03, 'highpass', 2500, 1, 0.3, 0.001); tone(d, t, 0.03, 'square', 1800, 1200, 0.06, 0.001); return 0.1; }); },
  flash(on) { shot((d, t) => { nz(d, t, 0.025, 'bandpass', on ? 3200 : 2200, 3, 0.35, 0.001); return 0.1; }); },
  battery() { shot((d, t) => { for (let i = 0; i < 3; i++) nz(d, t + i * 0.18, 0.04, 'bandpass', 1600 + i * 400, 4, 0.4, 0.001); tone(d, t + 0.6, 0.1, 'sine', 1200, 1200, 0.1); return 0.8; }); },
  drink() { shot((d, t) => { for (let i = 0; i < 6; i++) nz(d, t + i * 0.16, 0.12, 'bandpass', 500 + Math.random() * 300, 6, 0.3, 0.02); return 1.1; }); },
  tape() { shot((d, t) => { nz(d, t, 0.08, 'lowpass', 500, 1, 0.8); nz(d, t + 0.25, 0.06, 'lowpass', 700, 1, 0.6); tone(d, t + 0.35, 1.2, 'sawtooth', 55, 62, 0.08, 0.2); nz(d, t + 0.35, 1.2, 'highpass', 4000, 1, 0.06, 0.2); return 1.6; }); },
  beep(f = 1000, dur = 0.09) { shot((d, t) => { tone(d, t, dur, 'square', f, f, 0.1, 0.002); return dur + 0.1; }); },
  keypad(i) { shot((d, t) => { tone(d, t, 0.12, 'sine', 900 + i * 120, 900 + i * 120, 0.25); tone(d, t, 0.12, 'sine', 1400 + i * 90, 1400 + i * 90, 0.15); return 0.2; }); },
  door() { shot((d, t) => { nz(d, t, 0.12, 'lowpass', 300, 1, 0.9); const o = tone(d, t + 0.1, 1.4, 'sawtooth', 90, 140, 0.12, 0.1); nz(d, t + 0.1, 1.4, 'bandpass', 700, 8, 0.2, 0.3); return 1.6; }); },
  thunk() { shot((d, t) => { nz(d, t, 0.3, 'lowpass', 180, 1, 1); tone(d, t, 0.4, 'sine', 55, 30, 0.8); return 0.5; }); },
  buzz(pos) { shot((d, t) => { const o = tone(d, t, 0.35 + Math.random() * 0.4, 'sawtooth', 120, 120, 0.25, 0.005); nz(d, t, 0.3, 'highpass', 3500, 1, 0.12, 0.001); return 0.9; }, pos, 0.8); },
  staticBurst(v = 0.25, dur = 0.35) { shot((d, t) => { nz(d, t, dur, 'bandpass', 1900, 0.7, v, 0.01); return dur; }); },
  radioVoice(dur, pos) {
    shot((d, t) => {
      const C = AU.ctx, hpf = C.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 380; const lpf = C.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 3000;
      const out = distortNode(hpf, 1.6); hpf.connect(lpf).connect(d);
      const o = C.createOscillator(); o.type = 'sawtooth'; const g = C.createGain(); g.gain.value = 0;
      const f1 = C.createBiquadFilter(), f2 = C.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.Q.value = 5; f2.Q.value = 7;
      o.connect(f1).connect(g); o.connect(f2).connect(g); g.connect(out);
      const base = 105 + Math.random() * 50; let tt = t;
      nz(d, t, 0.25, 'bandpass', 2000, 0.8, 0.3, 0.005);
      while (tt < t + dur) {
        const sy = 0.08 + Math.random() * 0.14;
        o.frequency.setValueAtTime(base * (0.9 + Math.random() * 0.3), tt);
        f1.frequency.setValueAtTime(350 + Math.random() * 500, tt); f2.frequency.setValueAtTime(1000 + Math.random() * 1300, tt);
        g.gain.setValueAtTime(0.0001, tt); g.gain.exponentialRampToValueAtTime(Math.random() < 0.15 ? 0.0001 : 0.5, tt + 0.02); g.gain.exponentialRampToValueAtTime(0.02, tt + sy);
        tt += sy + (Math.random() < 0.2 ? 0.12 : 0.01);
      }
      o.start(t); o.stop(tt + 0.1);
      nz(d, t, dur + 0.2, 'bandpass', 2400, 0.6, 0.05, 0.05);
      nz(d, tt, 0.3, 'bandpass', 1800, 0.7, 0.35, 0.005);
      return dur + 0.6;
    }, pos, pos ? 1.1 : 0.45);
  },
  alarm(pos) { shot((d, t) => { tone(d, t, 0.18, 'square', 1046, 1046, 0.12, 0.003); tone(d, t + 0.25, 0.18, 'square', 784, 784, 0.12, 0.003); return 0.5; }, pos, 1); },
  whisper() { shot((d, t) => { const f = nz(d, t, 1.8, 'bandpass', 3000, 3, 0.25, 0.5); f.frequency.linearRampToValueAtTime(5200, t + 1.8); return 2; }, null, 0.5); },
  sting() { shot((d, t) => { const out = distortNode(d, 0.8); [0, 1, 2].forEach(i => tone(out, t, 2.4, 'sawtooth', 110 * (1 + i * 0.06), 55, 0.18, 0.02)); nz(d, t, 1.5, 'lowpass', 800, 1, 0.35, 0.01); return 2.5; }, null, 0.7); },
};

// persistent positional loops for creatures / tapes
function mkGrowlLoop() {
  if (AU.buf.growlLoop) {
    const v = mkLoopVoice('growlLoop', 2, 1.1); v.ch = null;
    v.setChase = c => { if (v.ch === c) return; v.ch = c; v.src.playbackRate.setTargetAtTime(c ? 1.22 : 0.94, AU.ctx.currentTime, 0.35); };
    return v;
  }
  const v0 = mkGrowlSynth(); v0.synth = true; v0.setChase = c => { v0.lfo.frequency.value = c ? 11 : 6; }; return v0;
}
function mkGrowlSynth() {
  const C = AU.ctx, v = mkVoice(2, 1.1); const s = loopSrc(AU.noise); const b = C.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 170; b.Q.value = 2.2;
  const am = C.createGain(); am.gain.value = 0.6; const lfo = C.createOscillator(); lfo.frequency.value = 7; const lg = C.createGain(); lg.gain.value = 0.5; lfo.connect(lg).connect(am.gain); lfo.start();
  s.connect(b).connect(am).connect(v.in);
  const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 46; const ol = C.createBiquadFilter(); ol.type = 'lowpass'; ol.frequency.value = 220; const og = C.createGain(); og.gain.value = 0.4; o.connect(ol).connect(og).connect(v.in); o.start();
  v.lfo = lfo; return v;
}
function mkWhineLoop() {
  const C = AU.ctx, v = mkVoice(1.5, 1.3);
  [2210, 2223, 3310].forEach((f, i) => { const o = C.createOscillator(); o.frequency.value = f; const g = C.createGain(); g.gain.value = i === 2 ? 0.02 : 0.05; o.connect(g).connect(v.in); o.start(); });
  const s = loopSrc(AU.noise); const b = C.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 4800; b.Q.value = 4; const g = C.createGain(); g.gain.value = 0.5; s.connect(b).connect(g).connect(v.in);
  return v;
}
function mkHissLoop() {
  const C = AU.ctx, v = mkVoice(1.2, 1.6); const s = loopSrc(AU.noise); const b = C.createBiquadFilter(); b.type = 'highpass'; b.frequency.value = 3500; const g = C.createGain(); g.gain.value = 0.18; s.connect(b).connect(g).connect(v.in);
  const o = C.createOscillator(); o.frequency.value = 59.94; const og = C.createGain(); og.gain.value = 0.12; o.connect(og).connect(v.in); o.start();
  return v;
}
function mkBeaconLoop() {   // a lost rig still recording: motor whirr, tape hiss and a chirping tally beep
  const C = AU.ctx, v = mkVoice(2.2, 1.15);
  const o = C.createOscillator(); o.type = 'square'; o.frequency.value = 2350; const og = C.createGain(); og.gain.value = 0.022;
  const lfo = C.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 1.7; const lg = C.createGain(); lg.gain.value = 0.022; lfo.connect(lg).connect(og.gain); lfo.start(); o.connect(og).connect(v.in); o.start();
  const m = C.createOscillator(); m.type = 'sawtooth'; m.frequency.value = 118; const mb = C.createBiquadFilter(); mb.type = 'bandpass'; mb.frequency.value = 950; mb.Q.value = 3; const mg = C.createGain(); mg.gain.value = 0.07; m.connect(mb).connect(mg).connect(v.in); m.start();
  const s = loopSrc(AU.noise); const hb = C.createBiquadFilter(); hb.type = 'highpass'; hb.frequency.value = 4800; const hg = C.createGain(); hg.gain.value = 0.05; s.connect(hb).connect(hg).connect(v.in);
  return v;
}
function mkBreathLoop() {
  const C = AU.ctx, v = mkVoice(1.2, 1.4); const s = loopSrc(AU.noise); const b = C.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 700; b.Q.value = 1.4;
  const am = C.createGain(); am.gain.value = 0.4; const lfo = C.createOscillator(); lfo.frequency.value = 0.45; const lg = C.createGain(); lg.gain.value = 0.4; lfo.connect(lg).connect(am.gain); lfo.start();
  s.connect(b).connect(am).connect(v.in); return v;
}

// ---------- sampled bank: embedded MP3 voices (Piper TTS) + designed SFX, decoded at start ----------
AU.buf = {}; AU.grp = {}; AU.live = []; AU.last = {};
function b64buf(str) { const s = atob(str), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u.buffer; }
function loadBank() {
  if (typeof ABANK === 'undefined' || AU.bankN) return;
  const C = AU.ctx, pri = k => /^(intro|rin|rout|tape|step|fl_|pick|breath)/.test(k) ? 0 : /^e\d_|^mim|^wh/.test(k) ? 2 : 1;
  const keys = Object.keys(ABANK).filter(k => ABANK[k] && !/^v37_/.test(k)).sort((a, b) => pri(a) - pri(b));
  AU.bankN = keys.length; AU.bankDone = 0; let qi = 0;
  const one = () => {
    if (qi >= keys.length) return; const k = keys[qi++]; let fired = false;
    const done = b => {
      if (fired) return; fired = true; AU.bankDone++;
      if (b) { AU.buf[k] = b; const g = k.replace(/\d+$/, ''); (AU.grp[g] = AU.grp[g] || []).push(k); onBank(k, b); }
      ABANK[k] = null; one();
    };
    try { const p = C.decodeAudioData(b64buf(ABANK[k]), done, () => done(null)); if (p && p.catch) p.catch(() => done(null)); } catch (e) { done(null); }
  };
  for (let i = 0; i < 4; i++) one();
}
function onBank(k, b) {
  if (k === 'breathLoop' && !AU.breathSrc) {
    const s = mkLoopSrc(k), g = AU.ctx.createGain(); g.gain.value = (ABANK_G[k] || 1) * 3.2; s.connect(g).connect(AU.breathG); AU.breathSrc = s;
    try { AU.breathNoise.disconnect(); } catch (e) {}
  }
}
function mkLoopSrc(k) {
  const s = AU.ctx.createBufferSource(), L = ABANK_LOOP[k] || AU.buf[k].duration / 2; s.buffer = AU.buf[k]; s.loop = true;
  s.loopStart = L * 0.5; s.loopEnd = L * 1.5; s.start(0, L * (0.5 + Math.random() * 0.9)); return s;
}
function mkLoopVoice(k, ref, roll) {
  const v = mkVoice(ref, roll), s = mkLoopSrc(k), g = AU.ctx.createGain(); g.gain.value = ABANK_G[k] || 1; s.connect(g).connect(v.in); v.src = s; return v;
}
function bpick(g) {
  const a = AU.grp[g]; if (!a || !a.length) return null;
  let i = Math.floor(Math.random() * a.length); if (a.length > 1 && a[i] === AU.last[g]) i = (i + 1) % a.length;
  return (AU.last[g] = a[i]);
}
function revKey(k) {
  const rk = k + '_rev', b = AU.buf[k];
  if (!AU.buf[rk] && b) {
    const r = AU.ctx.createBuffer(b.numberOfChannels, b.length, b.sampleRate);
    for (let c = 0; c < b.numberOfChannels; c++) { const s = b.getChannelData(c), d = r.getChannelData(c); for (let i = 0, n = s.length; i < n; i++) d[i] = s[n - 1 - i]; }
    AU.buf[rk] = r; ABANK_G[rk] = ABANK_G[k];
  }
  return rk;
}
// play one sample. o: vol, rate, delay, dest, pan, pos {x,y,z,pl}, ref, roll, follow (object with x/z tracked while playing), chain(g, nodes) -> node
function playS(k, o = {}) {
  const C = AU.ctx, b = k && AU.buf[k]; if (!C || C.state !== 'running' || !b) return 0;
  const s = C.createBufferSource(), rate = o.rate || 1, nodes = [s]; s.buffer = b; s.playbackRate.value = rate;
  const g = C.createGain(); g.gain.value = (o.vol ?? 1) * (ABANK_G[k] || 1); s.connect(g); nodes.push(g);
  const out = o.chain ? o.chain(g, nodes) : g, t0 = C.currentTime + (o.delay || 0), dur = b.duration / rate;
  if (o.pos) {
    const f = C.createBiquadFilter(), pl = o.pos.pl || PL, oc = los(o.pos.x, o.pos.z, pl.x, pl.z) ? 0 : 1; f.type = 'lowpass'; f.frequency.value = oc ? (o.occF || 800) : 18000;
    const p = mkPanner(o.ref || 1.6, o.roll || 1.2); setAPos(p, o.pos.x, o.pos.y ?? 1.2, o.pos.z); out.connect(f).connect(p); nodes.push(f, p);
    if (o.follow) AU.live.push({ p, f, src: s, obj: o.follow, y: o.pos.y ?? 1.55, end: t0 + dur + 0.2, occl: oc, occF: o.occF || 700 });
  } else if (o.pan !== undefined && C.createStereoPanner) { const sp = C.createStereoPanner(); sp.pan.value = o.pan; out.connect(sp).connect(o.dest || AU.bus); nodes.push(sp); }
  else out.connect(o.dest || AU.bus);
  s.start(t0); s.onended = () => nodes.forEach(n => { try { n.disconnect(); } catch (e) {} });
  return dur;
}
function updateAudioLive() {
  if (!AU.ctx || !AU.live.length) return; const now = AU.ctx.currentTime;
  for (let i = AU.live.length - 1; i >= 0; i--) {
    const v = AU.live[i]; if (now > v.end) { AU.live.splice(i, 1); continue; }
    setAPos(v.p, v.obj.x, v.y, v.obj.z); v.occl = lerp(v.occl, los(v.obj.x, v.obj.z, PL.x, PL.z) ? 0 : 1, 0.15); v.f.frequency.value = lerp(18000, v.occF, v.occl);
  }
}
function stopAudioLive(owners) {
  for (let index = AU.live.length - 1; index >= 0; index--) {
    const voice = AU.live[index]; if (owners && !owners.includes(voice.obj)) continue;
    try { voice.src.stop(); } catch (error) {}
    voice.p.disconnect(); voice.f.disconnect(); AU.live.splice(index, 1);
  }
}
const VCHAIN = {
  radio(g, n) {
    const C = AU.ctx, h = C.createBiquadFilter(), m = C.createBiquadFilter(), l = C.createBiquadFilter(), w = C.createWaveShaper(), o = C.createGain();
    h.type = 'highpass'; h.frequency.value = 340; h.Q.value = 0.9; m.type = 'peaking'; m.frequency.value = 1900; m.gain.value = 4; m.Q.value = 0.9;
    l.type = 'lowpass'; l.frequency.value = 3500; l.Q.value = 0.8; w.curve = AU.radioCurve; o.gain.value = 0.7;
    g.connect(h).connect(m).connect(w).connect(l).connect(o); n.push(h, m, l, w, o); return o;
  },
  near(g, n) {   // voice through a hazmat respirator
    const C = AU.ctx, m = C.createBiquadFilter(), l = C.createBiquadFilter(); m.type = 'peaking'; m.frequency.value = 1150; m.gain.value = 4; m.Q.value = 1.1;
    l.type = 'lowpass'; l.frequency.value = 4300; g.connect(m).connect(l); n.push(m, l); return l;
  },
  mimic(g, n) { const l = AU.ctx.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 5200; g.connect(l); n.push(l); return l; },
};
function radioBed(t0, t1) {
  const C = AU.ctx, s = C.createBufferSource(), f = C.createBiquadFilter(), g = C.createGain(), a = C.currentTime + t0, b = C.currentTime + t1;
  s.buffer = AU.noise; s.loop = true; f.type = 'bandpass'; f.frequency.value = 2300; f.Q.value = 0.6;
  g.gain.setValueAtTime(0, a); g.gain.linearRampToValueAtTime(0.022, a + 0.05); g.gain.setValueAtTime(0.022, b); g.gain.linearRampToValueAtTime(0, b + 0.08);
  s.connect(f).connect(g).connect(AU.dry); s.start(a, Math.random() * 2); s.stop(b + 0.1); s.onended = () => { try { g.disconnect(); } catch (e) {} };
}
function duck(t0, t1) {
  const C = AU.ctx, a = C.currentTime + t0, b = C.currentTime + t1;
  for (const d of [AU.duckA, AU.duckB]) { d.gain.cancelScheduledValues(a); d.gain.setTargetAtTime(0.55, a, 0.08); d.gain.setTargetAtTime(1, b, 0.5); }
}
// speak one or more voice clips back-to-back; returns seconds (0 if the bank is not ready)
function playVoice(keys, o = {}) {
  const C = AU.ctx; if (!C || C.state !== 'running') return 0;
  keys = [].concat(keys); if (!keys.length || !keys.every(k => AU.buf[k])) return 0;
  const mode = o.mode || (o.radio ? 'radio' : o.pos ? 'near' : 'dry'), spatial = (mode === 'near' || mode === 'mimic') && o.pos;
  let t = o.delay || 0;
  if (mode === 'radio') { playS(bpick('rin'), { dest: AU.dry, delay: t }); t += 0.12; }
  const t0 = t, pan = mode === 'whisper' ? (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.45) : undefined;
  for (const k of keys) {
    t += playS(k, { delay: t, vol: o.vol ?? ({ whisper: 0.8, mimic: 2.4, tape: 0.72 }[mode] || 1), chain: VCHAIN[mode], dest: AU.dry, pan,
      pos: spatial ? { x: o.pos.x, y: 1.6, z: o.pos.z } : null, follow: spatial ? o.pos : null, ref: mode === 'mimic' ? 3 : 2.2, roll: 1.05 }) + 0.1;
  }
  t -= 0.1;
  if (mode === 'radio') { playS(bpick('rout'), { dest: AU.dry, delay: t }); radioBed(t0 - 0.05, t); t += 0.28; }
  duck(t0, t);
  return t;
}
// sampled versions of SFX; fall back to the synthesized ones while decoding / if unavailable
const rr = (a, b) => a + Math.random() * (b - a);
const SMP = {
  step(kind, wet) { return playS(bpick(wet ? 'wstep' : 'step'), { vol: [0.45, 0.8, 1.2][kind], rate: rr(0.93, 1.07) }); },
  heavyStep(pos) { return playS(bpick('hstep'), { pos, ref: 2.2, roll: 1.1, rate: rr(0.9, 1.05) }); },
  howl(pos) { return playS(bpick('howl'), { pos, ref: 3.5, roll: 0.9, rate: rr(0.93, 1.03) }); },
  // r7: the Howler's voice. The call carries across the level (gentle rolloff, 1.5x gain); the scream on sight is the loudest thing in the game.
  howlCall(pos, follow) { return playS(bpick('hcall'), { pos, follow, ref: 16, roll: 0.42, vol: 1.5, rate: rr(0.94, 1.04), occF: 1100 }); },
  howlSee(pos, follow) { return playS(bpick('hsee'), { pos, follow, ref: 10, roll: 0.5, vol: 1.8, rate: rr(0.96, 1.03), occF: 2600 }); },
  screech(pos, hi) { return playS(hi ? 'scrHi' : 'scrLo', { pos, ref: 2.5, roll: 1, rate: rr(0.95, 1.05) }); },
  clicks(pos) { return playS(bpick('click'), { pos, ref: 1.6, roll: 1.2, rate: rr(0.9, 1.15) }); },
  crack(pos) { return playS(bpick('crack'), { pos, ref: 1.8, roll: 1.1, rate: rr(0.9, 1.1) }); },
  giggle(pos) { return playS(bpick('gig'), { pos, ref: 2, roll: 1.1, rate: rr(0.95, 1.05) }); },
  scream(pos, fem) { return playS(bpick(fem ? 'scrF' : 'scrM'), { pos, ref: 3, roll: 1, rate: rr(0.97, 1.04) }); },
  jumpscare() { return playS('jump', { dest: AU.dry }); },
  pickup() { return playS('pick'); },
  search() { return playS('search'); },
  flash(on) { return playS(on ? 'fl_on' : 'fl_off', { dest: AU.dry }); },
  battery() { return playS('batt'); },
  drink() { return playS('drink'); },
  tape() { return playS('tape', { dest: AU.dry }); },
  door(pos) { return playS('door', pos ? { pos, ref: 4, roll: 0.8 } : {}); },
  thunk(up) { return AU.buf.pdown ? playS(up ? revKey('pdown') : 'pdown', { vol: up ? 0.7 : 1 }) : 0; },
  whisper() { return playS(bpick('whs'), { dest: AU.dry, pan: (Math.random() < 0.5 ? -1 : 1) * rr(0.4, 0.8), vol: 0.9 }); },
  sting() { return playS('sting', { dest: AU.dry }); },
  far(pos) { return playS(bpick(['farSlam', 'farGroan', 'farKnock'][Math.floor(Math.random() * 3)]), { pos, ref: 8, roll: 0.7 }); },
};
SFX.search = () => SFX.pickup(); SFX.far = () => 0;
SFX.howlCall = pos => SFX.howl(pos); SFX.howlSee = pos => SFX.howl(pos);
for (const k of Object.keys(SMP)) { const synth = SFX[k]; SFX[k] = (...a) => SMP[k](...a) || synth(...a); }
