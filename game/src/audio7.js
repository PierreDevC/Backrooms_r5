// ---------- r10 · Level 7 sound design (synthesized): wind, swell, foghorn, thunder, the rig, the lamp ----------
const SFX7 = {
  foghorn(pos) { shot((d, t) => { tone(d, t, 3.2, 'sawtooth', 62, 60, 0.18, 0.5); tone(d, t, 3.2, 'sine', 124, 121, 0.1, 0.5); nz(d, t, 3.2, 'lowpass', 220, 1, 0.12, 0.6); return 3.6; }, pos, 3); },
  thunder(pos) { shot((d, t) => { const f = nz(d, t, 3.6, 'lowpass', 400, 1, 0.9, 0.05); f.frequency.linearRampToValueAtTime(70, t + 3.4); for (let i = 0; i < 7; i++) nz(d, t + i * 0.3 + Math.random() * 0.2, 0.5, 'lowpass', 180, 1, 0.3, 0.02); tone(d, t, 3, 'sine', 48, 36, 0.4, 0.1); return 4; }, pos, 3); },
  far(pos) { shot((d, t) => { const k = Math.random(); if (k < 0.4) { for (let i = 0; i < 2; i++) { tone(d, t + i * 0.9, 1.2, 'triangle', 330 + i * 40, 320, 0.06, 0.004); nz(d, t + i * 0.9, 0.08, 'lowpass', 500, 1, 0.3, 0.003); } } else if (k < 0.75) { const f = nz(d, t, 3, 'bandpass', 260, 3, 0.2, 0.8); f.frequency.linearRampToValueAtTime(130, t + 3); } else { tone(d, t, 2.4, 'sawtooth', 70, 54, 0.05, 0.7); nz(d, t, 2.2, 'bandpass', 700, 5, 0.06, 0.5); } return 3.4; }, pos, 1.6); },
  flare(pos) { shot((d, t) => { nz(d, t, 0.25, 'bandpass', 2400, 1, 0.5, 0.003); nz(d, t + 0.1, 3.4, 'highpass', 2600, 0.6, 0.2, 0.1); tone(d, t + 0.05, 0.6, 'sawtooth', 300, 900, 0.1, 0.01); return 3.8; }, pos, 2); },
  creak(pos) { shot((d, t) => { tone(d, t, 1.4, 'sawtooth', 130, 74, 0.06, 0.2); nz(d, t, 1.3, 'bandpass', 380, 6, 0.06, 0.25); return 1.6; }, pos, 1.4); },
  clang(pos) { shot((d, t) => { tone(d, t, 1.4, 'triangle', 540, 530, 0.18, 0.002); tone(d, t, 1.8, 'sine', 810, 805, 0.08, 0.002); nz(d, t, 0.06, 'bandpass', 2200, 3, 0.4, 0.001); return 2; }, pos, 1.8); },
  genStart(pos) { shot((d, t) => { for (let i = 0; i < 5; i++) { tone(d, t + i * 0.55, 0.5, 'sawtooth', 50 + i * 4, 44 + i * 4, 0.16, 0.02); nz(d, t + i * 0.55, 0.4, 'lowpass', 300, 1, 0.3, 0.02); } tone(d, t + 2.8, 4, 'sawtooth', 56, 60, 0.2, 0.6); tone(d, t + 2.8, 4, 'sine', 112, 120, 0.12, 0.6); return 7; }, pos, 3); },
  genHum(pos) { shot((d, t) => { tone(d, t, 2.6, 'sawtooth', 60, 60, 0.1, 0.5); tone(d, t, 2.6, 'sine', 120, 120, 0.06, 0.5); return 2.7; }, pos, 2); },
  airOn(pos) { shot((d, t) => { const f = nz(d, t, 4, 'highpass', 1800, 0.6, 0.3, 0.2); f.frequency.linearRampToValueAtTime(3600, t + 3.6); for (let i = 0; i < 16; i++) tone(d, t + 0.4 + i * 0.22, 0.12, 'sine', 300 + Math.random() * 200, 700, 0.05, 0.004); return 5; }, pos, 2.4); },
  valve(pos) { shot((d, t) => { for (let i = 0; i < 6; i++) { nz(d, t + i * 0.45, 0.35, 'bandpass', 500 + i * 30, 4, 0.18, 0.05); tone(d, t + i * 0.45, 0.4, 'sawtooth', 90 + i * 4, 80, 0.04, 0.05); } return 3.2; }, pos, 1.6); },
  safe(pos) { shot((d, t) => { for (let i = 0; i < 3; i++) { nz(d, t + i * 0.18, 0.04, 'bandpass', 3000, 5, 0.3, 0.001); tone(d, t + i * 0.18, 0.1, 'square', 1800, 1800, 0.03, 0.001); } return 0.8; }, pos, 1.4); },
  safeOpen(pos) { shot((d, t) => { nz(d, t, 0.2, 'lowpass', 500, 1, 0.8, 0.003); tone(d, t, 0.9, 'sine', 80, 40, 0.6, 0.003); nz(d, t + 0.1, 1, 'bandpass', 700, 3, 0.2, 0.02); return 1.4; }, pos, 2); },
  lampOn(pos) { shot((d, t) => { tone(d, t, 1.6, 'sawtooth', 40, 90, 0.25, 0.8); for (let i = 0; i < 9; i++) nz(d, t + 0.3 + i * 0.13, 0.05, 'bandpass', 2400 + i * 100, 4, 0.2, 0.001); tone(d, t + 1.4, 5, 'sine', 120, 120, 0.15, 1.2); tone(d, t + 1.4, 5, 'sawtooth', 60, 60, 0.1, 1.2); return 7; }, pos, 3); },
  lensMotor(pos) { shot((d, t) => { tone(d, t, 8, 'sawtooth', 38, 52, 0.1, 1.5); nz(d, t, 8, 'lowpass', 260, 1, 0.25, 1.5); for (let i = 0; i < 12; i++) nz(d, t + 0.4 + i * 0.6, 0.06, 'bandpass', 1500, 6, 0.1, 0.003); return 8.4; }, pos, 2.4); },
  shadow(pos) { shot((d, t) => { const o = distortNode(d, 0.4); tone(o, t, 5, 'sine', 34, 28, 0.5, 1.2); tone(d, t, 5, 'sawtooth', 51, 42, 0.12, 1.2); nz(d, t, 4.5, 'lowpass', 120, 1.4, 0.4, 1.4); return 5.4; }, pos, 3.4); },
  shadowPass(pos) { shot((d, t) => { tone(d, t, 7, 'sine', 30, 24, 0.7, 2.2); nz(d, t, 6.5, 'lowpass', 90, 1.2, 0.5, 2.2); for (let i = 0; i < 6; i++) tone(d, t + 0.8 + i * 0.9, 1.4, 'sine', 62 - i * 3, 50, 0.14, 0.5); return 7.4; }, pos, 3.4); },
  radioBlip() { shot((d, t) => { tone(d, t, 0.06, 'square', 1300, 1300, 0.04, 0.002); return 0.2; }, null, 1); },
  buoy(pos) { shot((d, t) => { tone(d, t, 1.8, 'triangle', 420, 415, 0.1, 0.003); tone(d, t, 2.2, 'sine', 630, 625, 0.04, 0.003); return 2.4; }, pos, 1.8); },
  bell(pos) { shot((d, t) => { tone(d, t, 3.2, 'sine', 330, 328, 0.2, 0.002); tone(d, t, 3.2, 'sine', 640, 636, 0.1, 0.002); tone(d, t, 2.4, 'sine', 990, 980, 0.05, 0.002); return 3.6; }, pos, 2.4); },
};
// low background music: slow pads over a drifting minor progression, a sparse bell line; brighter at dawn, thinner and more uneasy in the storm
const MUZ7 = { night: [[45, [0, 3, 7, 10, 14]], [41, [0, 4, 7, 11]], [38, [0, 3, 7, 10]], [40, [0, 3, 7, 12]]], storm: [[45, [0, 3, 6, 10]], [41, [0, 3, 6, 9]], [43, [0, 1, 7, 10]], [40, [0, 3, 7, 10]]], dawn: [[48, [0, 4, 7, 11, 14]], [41, [0, 4, 7, 11]], [43, [0, 4, 7, 10]], [45, [0, 3, 7, 10]]] };
function music7(dt, st, dn, under, inside) {
  GS7.muT = (GS7.muT || 0) - dt; if (GS7.muT > 0 || !AU.ctx || AU.ctx.state !== 'running' || G.state !== 'play') return;
  GS7.muT = 2.6; const b = GS7.muB = ((GS7.muB ?? -1) + 1), set = MUZ7[dn > 0.5 ? 'dawn' : st > 0.4 ? 'storm' : 'night'], ch = set[Math.floor(b / 4) % set.length], mf = m => 440 * Math.pow(2, (m - 69) / 12), vol = 0.5 * (under ? 0.55 : inside ? 0.8 : 1);
  shot((d, t) => { const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100 + dn * 900; lp.connect(d);
    if (b % 4 === 0) ch[1].forEach((iv, i) => { tone(lp, t + i * 0.12, 10.4, 'sine', mf(ch[0] + 12 + iv), mf(ch[0] + 12 + iv), 0.034 * vol, 1.8); tone(lp, t + i * 0.12, 10.4, 'triangle', mf(ch[0] + iv) * 1.003, mf(ch[0] + iv) * 1.003, 0.014 * vol, 2.4); });
    if (b % 2 === 0) tone(lp, t, 5.0, 'sine', mf(ch[0] - 12), mf(ch[0] - 12), 0.05 * vol, 1.2);
    if (RNG() < 0.5) { const n = ch[0] + 24 + ch[1][Math.floor(RNG() * ch[1].length)]; tone(lp, t + rnd(0.3, 1.6), 2.6, 'sine', mf(n), mf(n), 0.03 * vol, 0.01); tone(lp, t + rnd(0.3, 1.6), 1.6, 'sine', mf(n + 12), mf(n + 12), 0.008 * vol, 0.01); }
    return 3; }, null, 1);
}
function audio7(dt, z, under) {
  under = under > 0.5;   // FX.under is a smoothed 0..1 and never quite reaches 0: treat it as a flag or the water-muffle never lifts
  const C = AU.ctx, now = C.currentTime, mute = AU.muted, live = G.state === 'play' || G.state === 'intro' || G.state === 'won';
  if (AU.uw) AU.uw.frequency.setTargetAtTime(under > 0.5 ? 380 : 22000, now, 0.05);
  if (!GS7.amb) { const s = loopSrc(AU.brown), l = C.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 400; const g = C.createGain(); g.gain.value = 0; const lfo = C.createOscillator(); lfo.frequency.value = 0.12; const lg = C.createGain(); lg.gain.value = 0.4; lfo.connect(lg).connect(g.gain); lfo.start(); s.connect(l).connect(g).connect(AU.duckB); GS7.amb = { g, l, src: s }; }
  if (!GS7.hum) { const g = C.createGain(); g.gain.value = 0; const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50; const o2 = C.createOscillator(); o2.frequency.value = 50.6; const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 200; o.connect(f); o2.connect(f); f.connect(g).connect(AU.duckB); o.start(); o2.start(); GS7.hum = { g, f, src: { stop() { try { o.stop(); o2.stop(); } catch (e) {} } } }; }
  const v = live ? 1 : 0, inside = LV.rooms[LV.room[cell7(PL.x, PL.z)]] && !LV.rooms[LV.room[cell7(PL.x, PL.z)]].open, st = GS7.storm * (1 - GS7.dawn * 0.9);
  GS7.amb.g.gain.setTargetAtTime(mute ? 0 : (under ? 0.1 : (0.03 + st * 0.16) * (inside ? 0.35 : 1)) * v, now, 0.5);
  if (!mute) music7(dt, st, GS7.dawn, under, inside);
  GS7.amb.l.frequency.setTargetAtTime(under ? 230 : 380 + st * 900, now, 0.3);
  const gen = PS7.gen ? 1 : 0, near = z === ZS7.GEN ? 1 : z === ZS7.RIG || z === ZS7.QUART ? 0.35 : z === ZS7.AIR ? 0.5 : 0.04;
  GS7.hum.g.gain.setTargetAtTime(mute ? 0 : gen * near * 0.07 * v * (under ? 0.2 : 1), now, 0.6);
  AU.humG.gain.setTargetAtTime(0, now, 0.2);
  AU.tenG.gain.setTargetAtTime(mute ? 0 : clamp(G.chase * 0.55 + PL.fear * 0.16, 0, 0.65) * v, now, 0.5); AU.tenF.frequency.setTargetAtTime(240 + G.chase * 1400, now, 0.5);
  if (PS7.lit && live && !GS7.beamHum) { GS7.beamHum = true; }
}
// the lighthouse beam (once the lamp is lit) and the dynamic lights
function beam7(dt) {
  if (!PS7.lit) { clearSlot(2); return; }
  GS7.beamA += dt * 0.5; const a = GS7.beamA, tx = cc7(31), tz = cc7(11), dir = { x: Math.sin(a) * 0.96, y: -0.1, z: Math.cos(a) * 0.96 };
  setSlot(2, { x: tx, y: 24, z: tz }, 3.4, dir, 0.93, [1, 0.92, 0.7], 120, false, 0.1);
}
function wlights7(dt) {
  const t = FX.t, P = WS7.pos, cp = CAM.position;
  const hab = P.fen; if (hab && PL.x > 28 * CELL && PL.x < 38 * CELL && PL.z > 42 * CELL && PL.z < 50 * CELL) setSlot(4, { x: hab.x, y: -2.8, z: hab.z }, 0.7, null, 0, [0.5, 1, 0.8], 7, false, 1); else clearSlot(4);
  if (GS7.flash > 0.01) setSlot(5, { x: cp.x, y: cp.y + 6, z: cp.z }, 2.4 * GS7.flash, null, 0, [0.7, 0.8, 1], 60, false, 0.2); else clearSlot(5);
  if (P.safe && dist2(PL.x, PL.z, P.safe.x, P.safe.z) < 12 && !PS7.safeOpen) setSlot(3, { x: P.safe.x, y: P.safe.y + 0.5, z: P.safe.z }, 0.5, null, 0, [0.4, 1, 0.6], 4, false, 1); else clearSlot(3);
}
function loadVoice7() {
  if (AU.v7 || !AU.ctx || typeof ABANK === 'undefined') return; AU.v7 = true;
  const keys = Object.keys(ABANK).filter(k => /^v7_/.test(k) && ABANK[k]); let qi = 0;
  const one = () => {
    if (qi >= keys.length) return; const k = keys[qi++]; let fired = false;
    const done = b => { if (fired) return; fired = true; if (b) AU.buf[k] = b; ABANK[k] = null; one(); };
    try { const p = AU.ctx.decodeAudioData(b64buf(ABANK[k]), done, () => done(null)); if (p && p.catch) p.catch(() => done(null)); } catch (e) { done(null); }
  };
  for (let i = 0; i < 3; i++) one();
}
