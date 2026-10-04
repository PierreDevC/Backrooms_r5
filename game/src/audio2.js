// ---------- r9 · Level 2 sound design (synthesized): pipes, steam, knocks, phones, breakers, the lift, the Hound ----------
const SFX2 = {
  knock(pos, n = 1) { shot((d, t) => { for (let i = 0; i < n; i++) { const s = t + i * 0.42; nz(d, s, 0.12, 'lowpass', 380, 1.2, 0.9, 0.002); tone(d, s, 0.5, 'sine', 120, 62, 0.5, 0.002); nz(d, s + 0.01, 0.9, 'bandpass', 900, 8, 0.12, 0.01); tone(d, s, 1.2, 'triangle', 410, 405, 0.05, 0.004); } return n * 0.42 + 1.4; }, pos, 2.4); },
  tap(pos, n) { shot((d, t) => { for (let i = 0; i < n; i++) { const s = t + i * 0.3; nz(d, s, 0.05, 'bandpass', 2400, 4, 0.6, 0.001); tone(d, s, 0.6, 'triangle', 980, 970, 0.12, 0.002); tone(d, s, 0.9, 'sine', 1460, 1455, 0.05, 0.002); } return n * 0.3 + 1; }, pos, 1.6); },
  hiss(pos, k = 1, dur = 2) { shot((d, t) => { const f = nz(d, t, dur, 'highpass', 2200, 0.6, 0.32 * k, 0.12); nz(d, t, dur, 'bandpass', 5200, 1, 0.12 * k, 0.2); return dur + 0.3; }, pos, 1.2); },
  burst(pos) { shot((d, t) => { nz(d, t, 0.08, 'lowpass', 600, 1, 0.9, 0.002); const f = nz(d, t, 3.2, 'highpass', 1600, 0.5, 0.6, 0.02); f.frequency.linearRampToValueAtTime(3800, t + 3); return 3.4; }, pos, 2.2); },
  klaxon(pos) { shot((d, t) => { for (let i = 0; i < 4; i++) { const s = t + i * 1.0; tone(d, s, 0.8, 'sawtooth', 300, 300, 0.16, 0.02); tone(d, s, 0.8, 'square', 302, 302, 0.06, 0.02); } return 4.2; }, pos, 3); },
  ring(pos) { shot((d, t) => { for (let i = 0; i < 2; i++) { const s = t + i * 0.55; for (let k = 0; k < 18; k++) tone(d, s + k * 0.025, 0.03, 'square', 1250, 1250, 0.05, 0.001); } return 1.4; }, pos, 1.4); },
  pickup() { shot((d, t) => { nz(d, t, 0.06, 'bandpass', 1400, 3, 0.4, 0.002); tone(d, t + 0.05, 0.08, 'square', 600, 600, 0.04, 0.002); nz(d, t + 0.1, 0.6, 'bandpass', 1600, 1, 0.04, 0.1); return 0.8; }, null, 1); },
  hangup() { shot((d, t) => { nz(d, t, 0.08, 'lowpass', 900, 1, 0.5, 0.002); tone(d, t, 0.1, 'sine', 260, 180, 0.2, 0.002); return 0.3; }, null, 1); },
  lever(pos) { shot((d, t) => { nz(d, t, 0.3, 'bandpass', 700, 3, 0.4, 0.01); tone(d, t + 0.25, 0.3, 'sine', 160, 90, 0.6, 0.002); nz(d, t + 0.25, 0.2, 'lowpass', 500, 1, 0.8, 0.002); return 0.8; }, pos, 1.3); },
  hum(pos) { shot((d, t) => { const o = tone(d, t, 2.5, 'sawtooth', 50, 60, 0.12, 0.6); tone(d, t, 2.5, 'sine', 120, 120, 0.08, 0.6); return 2.6; }, pos, 1.6); },
  spark(pos) { shot((d, t) => { for (let i = 0; i < 9; i++) nz(d, t + i * 0.035 + Math.random() * 0.02, 0.04, 'highpass', 3000, 0.7, 0.5, 0.001); tone(d, t, 0.3, 'square', 90, 60, 0.15, 0.002); return 0.6; }, pos, 1.4); },
  valve(pos) { shot((d, t) => { for (let i = 0; i < 6; i++) { nz(d, t + i * 0.45, 0.35, 'bandpass', 500 + i * 30, 4, 0.18, 0.05); tone(d, t + i * 0.45, 0.4, 'sawtooth', 90 + i * 4, 80, 0.04, 0.05); } const f = nz(d, t + 1, 2.4, 'lowpass', 900, 1, 0.3, 0.3); f.frequency.linearRampToValueAtTime(200, t + 3.4); return 3.6; }, pos, 1.6); },
  pressureDrop(pos) { shot((d, t) => { const f = nz(d, t, 4, 'bandpass', 1400, 0.8, 0.25, 0.1); f.frequency.linearRampToValueAtTime(300, t + 4); tone(d, t + 0.5, 3, 'sine', 90, 45, 0.35, 0.4); return 4.4; }, pos, 2.6); },
  pry(pos) { shot((d, t) => { for (let i = 0; i < 4; i++) { tone(d, t + i * 0.3, 0.25, 'sawtooth', 220 - i * 20, 160, 0.06, 0.02); nz(d, t + i * 0.3, 0.2, 'bandpass', 1800, 4, 0.18, 0.01); } nz(d, t + 1.3, 0.3, 'lowpass', 400, 1, 0.9, 0.003); tone(d, t + 1.3, 0.6, 'sine', 90, 45, 0.6, 0.003); return 2; }, pos, 1.6); },
  liftMotor(pos) { shot((d, t) => { tone(d, t, 7, 'sawtooth', 42, 58, 0.12, 1.2); nz(d, t, 7, 'lowpass', 300, 1, 0.3, 1.5); for (let i = 0; i < 10; i++) nz(d, t + 0.5 + i * 0.6, 0.06, 'bandpass', 1500, 6, 0.1, 0.003); return 7.4; }, pos, 2); },
  clock(pos) { shot((d, t) => { nz(d, t, 0.05, 'bandpass', 2000, 3, 0.7, 0.001); tone(d, t + 0.05, 0.2, 'square', 700, 700, 0.04, 0.002); nz(d, t + 0.15, 0.12, 'lowpass', 600, 1, 0.6, 0.002); tone(d, t + 0.4, 0.5, 'sine', 1500, 1500, 0.05, 0.01); return 1; }, pos, 1.2); },
  houndGrowl(pos) { shot((d, t) => { const o = distortNode(d, 0.7); tone(o, t, 1.4, 'sawtooth', 70, 55, 0.18, 0.2); nz(d, t, 1.4, 'lowpass', 300, 2, 0.4, 0.2); for (let i = 0; i < 6; i++) nz(d, t + i * 0.18, 0.12, 'bandpass', 600, 3, 0.15, 0.01); return 1.6; }, pos, 2); },
  houndScrape(pos) { shot((d, t) => { for (let i = 0; i < 5; i++) nz(d, t + i * 0.16 + Math.random() * 0.04, 0.09, 'bandpass', 2200 + Math.random() * 900, 3, 0.25, 0.004); return 1; }, pos, 1.6); },
  houndCharge(pos) { shot((d, t) => { const o = distortNode(d, 0.9); tone(o, t, 0.9, 'sawtooth', 140, 380, 0.3, 0.02); nz(d, t, 0.9, 'bandpass', 1400, 1.4, 0.4, 0.02); return 1.2; }, pos, 2.6); },
  facelingStep(pos) { shot((d, t) => { nz(d, t, 0.06, 'lowpass', 500, 1, 0.25, 0.003); return 0.2; }, pos, 0.8); },
  far(pos) { shot((d, t) => { const k = Math.random(); if (k < 0.45) { for (let i = 0; i < 3; i++) { nz(d, t + i * 0.5, 0.1, 'lowpass', 350, 1, 0.5, 0.003); tone(d, t + i * 0.5, 0.9, 'triangle', 300 + Math.random() * 40, 290, 0.05, 0.004); } } else if (k < 0.75) { const f = nz(d, t, 2.5, 'bandpass', 300, 4, 0.25, 0.5); f.frequency.linearRampToValueAtTime(140, t + 2.5); } else { tone(d, t, 2.2, 'sawtooth', 90, 70, 0.05, 0.6); nz(d, t, 2, 'bandpass', 900, 6, 0.08, 0.4); } return 3; }, pos, 1.6); },
};
// the tunnels' bed: a low machine drone, a pipe resonance that beats against it, heat ticks
function audio2(dt, z) {
  const C = AU.ctx, now = C.currentTime, mute = AU.muted, live = G.state === 'play' || G.state === 'intro' || G.state === 'won';
  if (AU.uw) AU.uw.frequency.setTargetAtTime(22000, now, 0.05);
  if (!GP2.amb) { const s = loopSrc(AU.brown), l = C.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 300; const g = C.createGain(); g.gain.value = 0; s.connect(l).connect(g).connect(AU.duckB); GP2.amb = { g, l, src: s }; }
  if (!GP2.hum) { const g = C.createGain(); g.gain.value = 0; const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55; const o2 = C.createOscillator(); o2.frequency.value = 55.7; const o3 = C.createOscillator(); o3.type = 'sine'; o3.frequency.value = 164; const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 220; o.connect(f); o2.connect(f); const g3 = C.createGain(); g3.gain.value = 0.25; o3.connect(g3).connect(f); f.connect(g).connect(AU.duckB); o.start(); o2.start(); o3.start(); GP2.hum = { g, f, src: { stop() { try { o.stop(); o2.stop(); o3.stop(); } catch (e) {} } } }; }
  const v = live ? 1 : 0, big = z === ZP2.SWITCH || z === ZP2.HALL, quiet = z === ZP2.COLD || z === ZP2.OFFICE || z === ZP2.SHELTER;
  const surge = GP2.surge ? GP2.surge.k : 0;
  GP2.amb.g.gain.setTargetAtTime(mute ? 0 : (0.06 + surge * 0.2) * (quiet ? 0.5 : 1) * v, now, 0.4);
  GP2.amb.l.frequency.setTargetAtTime(300 + surge * 2400, now, 0.3);
  GP2.hum.g.gain.setTargetAtTime(mute ? 0 : (big ? 0.07 : quiet ? 0.015 : 0.035) * v * (GP2.regs ? 1 - GP2.regs * 0.2 : 1), now, 0.6);
  GP2.hum.f.frequency.setTargetAtTime(big ? 340 : 220, now, 0.5);
  AU.humG.gain.setTargetAtTime(0, now, 0.2);
  AU.tenG.gain.setTargetAtTime(mute ? 0 : clamp(G.chase * 0.55 + PL.fear * 0.16, 0, 0.65) * v, now, 0.5); AU.tenF.frequency.setTargetAtTime(260 + G.chase * 1500, now, 0.5);
}
// dynamic lights: the furnace glow in the hall, the lift lamp, the phone that is ringing
function wlights2(dt) {
  const t = FX.t, P = WP2.pos;
  const ring = WP2.phones.find(p => p.ring > 0 && dist2(PL.x, PL.z, p.x, p.z) < 18);
  if (ring) setSlot(3, { x: ring.x, y: 1.6, z: ring.z }, 0.5 * (Math.sin(t * 18) > 0 ? 1 : 0.2), null, 0, [1, 0.75, 0.3], 3, false, 1); else clearSlot(3);
  const fu = (P.furnace || []).slice().sort((a, b) => dist2(a.x, a.z, PL.x, PL.z) - dist2(b.x, b.z, PL.x, PL.z))[0];
  if (fu && LV.zone[cell2(PL.x, PL.z)] === ZP2.HALL) setSlot(4, { x: fu.x, y: fu.y, z: fu.z }, 0.45 * (0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 3.1)), null, 0, [1, 0.45, 0.15], 14, false, 0.5); else clearSlot(4);
  if (PP2.liftReady && P.liftPanel && dist2(PL.x, PL.z, P.liftPanel.x, P.liftPanel.z) < 16) setSlot(5, { x: P.liftPanel.x, y: 2.4, z: P.liftPanel.z }, 0.6, null, 0, [0.3, 1, 0.4], 6, false, 1); else clearSlot(5);
}
function loadVoice2() {
  if (AU.v2 || !AU.ctx || typeof ABANK === 'undefined') return; AU.v2 = true;
  const keys = Object.keys(ABANK).filter(k => /^v2_/.test(k) && ABANK[k]); let qi = 0;
  const one = () => {
    if (qi >= keys.length) return; const k = keys[qi++]; let fired = false;
    const done = b => { if (fired) return; fired = true; if (b) AU.buf[k] = b; ABANK[k] = null; one(); };
    try { const p = AU.ctx.decodeAudioData(b64buf(ABANK[k]), done, () => done(null)); if (p && p.catch) p.catch(() => done(null)); } catch (e) { done(null); }
  };
  for (let i = 0; i < 3; i++) one();
}
