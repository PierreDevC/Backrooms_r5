// ---------- r8 · Level 37 sound design (synthesized): water, filters, a lobby that plays music to nobody, a park that makes announcements ----------
const SFX37 = {
  surface() { shot((d, t) => { const f = nz(d, t, 1.6, 'bandpass', 500, 1.2, 0.34, 0.06); f.frequency.linearRampToValueAtTime(2200, t + 1.2); for (let i = 0; i < 14; i++) tone(d, t + 0.1 + i * 0.07 + Math.random() * 0.05, 0.11, 'sine', 500 + Math.random() * 500, 1100 + Math.random() * 700, 0.05, 0.005); nz(d, t + 0.9, 0.8, 'highpass', 3000, 0.7, 0.12, 0.2); return 2; }, null, 1); },
  breathe() { shot((d, t) => { const f = nz(d, t, 0.5, 'bandpass', 900, 0.8, 0.28, 0.12); f.frequency.linearRampToValueAtTime(1500, t + 0.45); return 0.7; }, null, 1); },
  bubbles() { shot((d, t) => { for (let i = 0; i < 5; i++) tone(d, t + i * 0.09 + Math.random() * 0.04, 0.1, 'sine', 300 + i * 70 + Math.random() * 120, 700 + Math.random() * 400, 0.07, 0.004); return 0.8; }, null, 0.8); },
  splash(k = 1) { shot((d, t) => { nz(d, t, 0.9 * (0.6 + k * 0.5), 'lowpass', 900 + k * 600, 0.8, 0.7 * (0.5 + k * 0.5), 0.004); nz(d, t + 0.02, 0.5, 'bandpass', 2600, 1, 0.25 * k, 0.003); for (let i = 0; i < 8 * k + 3; i++) tone(d, t + 0.1 + Math.random() * 0.5, 0.1, 'sine', 600 + Math.random() * 900, 400 + Math.random() * 500, 0.04, 0.004); return 1.6; }, null, 1); },
  splashSoft() { shot((d, t) => { nz(d, t, 0.45, 'lowpass', 700, 0.8, 0.3, 0.01); nz(d, t + 0.05, 0.3, 'bandpass', 2200, 1.2, 0.08, 0.01); return 0.7; }, null, 0.7); },
  wade(depth) { shot((d, t) => { nz(d, t, 0.38, 'lowpass', 500 + depth * 220, 0.9, 0.34, 0.015); nz(d, t + 0.04, 0.22, 'bandpass', 1700 + Math.random() * 600, 1.3, 0.1, 0.01); return 0.6; }, null, 0.55 + depth * 0.3); },
  ladder() { shot((d, t) => { for (let i = 0; i < 7; i++) { const s = t + i * 0.2; nz(d, s, 0.05, 'bandpass', 1700 + i * 60, 5, 0.34, 0.001); tone(d, s, 0.12, 'triangle', 520 + i * 18, 480 + i * 18, 0.05, 0.001); } return 1.8; }, null, 1); },
  far(pos) { shot((d, t) => { const k = Math.random(); if (k < 0.5) { for (let i = 0; i < 2; i++) tone(d, t + i * 0.32, 0.12, 'sine', 900 - i * 160, 600 - i * 120, 0.18, 0.003); nz(d, t, 0.5, 'highpass', 4000, 0.8, 0.03, 0.01); } else if (k < 0.8) { nz(d, t, 1.4, 'lowpass', 220, 1, 0.5, 0.2); tone(d, t, 1.6, 'sine', 62, 58, 0.18, 0.3); } else { nz(d, t, 0.18, 'lowpass', 400, 1, 0.8, 0.005); nz(d, t + 0.3, 0.6, 'bandpass', 700, 3, 0.12, 0.01); } return 2; }, pos, 1.4); },
  chime() { shot((d, t) => { [523, 659, 784, 1047].forEach((f, i) => tone(d, t + i * 0.18, 1.8, 'sine', f, f, 0.1, 0.01)); return 3; }, null, 1); },
  drain(pos) { shot((d, t) => { const f = nz(d, t, 6, 'lowpass', 500, 1.5, 0.5, 0.6); f.frequency.linearRampToValueAtTime(140, t + 6); for (let i = 0; i < 18; i++) tone(d, t + 0.4 + i * 0.3, 0.2, 'sine', 160 + Math.random() * 90, 70, 0.09, 0.01); return 7; }, pos, 1.6); },
  fill(pos) { shot((d, t) => { const f = nz(d, t, 6, 'lowpass', 160, 1.4, 0.45, 0.6); f.frequency.linearRampToValueAtTime(700, t + 6); return 7; }, pos, 1.6); },
  pump(pos) { shot((d, t) => { for (let i = 0; i < 6; i++) { tone(d, t + i * 0.5, 0.45, 'sine', 70, 62, 0.28, 0.02); nz(d, t + i * 0.5, 0.3, 'lowpass', 220, 1, 0.3, 0.02); } return 3.5; }, pos, 1.2); },
  creak(pos) { shot((d, t) => { const o = tone(d, t, 1.1, 'sawtooth', 120, 70, 0.07, 0.15); nz(d, t, 1.1, 'bandpass', 400, 6, 0.05, 0.2); return 1.4; }, pos, 1); },
  pa(pos) { shot((d, t) => { [880, 660, 880, 1100].forEach((f, i) => tone(d, t + i * 0.34, 0.5, 'sine', f, f, 0.12, 0.01)); nz(d, t, 1.6, 'bandpass', 1800, 0.8, 0.02, 0.1); return 2.4; }, pos, 1.8); },
  stamp(pos) { shot((d, t) => { nz(d, t, 0.1, 'lowpass', 500, 1, 0.9, 0.002); tone(d, t, 0.18, 'sine', 140, 80, 0.5, 0.002); nz(d, t + 0.06, 0.12, 'bandpass', 1800, 3, 0.2, 0.002); return 0.4; }, pos, 1); },
  vcr(pos) { shot((d, t) => { nz(d, t, 1.4, 'bandpass', 3200, 1.5, 0.12, 0.2); for (let i = 0; i < 8; i++) tone(d, t + i * 0.12, 0.08, 'square', 1400 + i * 40, 1400 + i * 40, 0.03, 0.002); tone(d, t + 1.4, 0.25, 'sine', 2400, 2400, 0.08, 0.01); return 2; }, pos, 1); },
  alarm(pos) { shot((d, t) => { for (let i = 0; i < 6; i++) { tone(d, t + i * 0.6, 0.55, 'sawtooth', 520, 840, 0.14, 0.02); } return 4; }, pos, 2.4); },
  slam(pos) { shot((d, t) => { nz(d, t, 0.5, 'lowpass', 300, 1, 1, 0.003); tone(d, t, 0.8, 'sine', 70, 38, 0.8, 0.003); nz(d, t + 0.05, 0.9, 'bandpass', 600, 2, 0.15, 0.01); return 1.4; }, pos, 2); },
  fish(pos) { shot((d, t) => { const o = distortNode(d, 0.5); tone(o, t, 1.1, 'sawtooth', 160, 70, 0.22, 0.02); nz(d, t, 0.9, 'lowpass', 400, 1, 0.5, 0.05); for (let i = 0; i < 12; i++) nz(d, t + i * 0.06, 0.05, 'bandpass', 2500 + Math.random() * 1500, 4, 0.12, 0.002); return 1.6; }, pos, 1.6); },
  radioBlip() { shot((d, t) => { tone(d, t, 0.06, 'square', 1300, 1300, 0.04, 0.002); return 0.2; }, null, 1); },
};
// a lobby that plays soft music to nobody: slow chords (maj7 / m9) and a tune that never resolves
const MUZ37 = [[48, [0, 4, 7, 11]], [45, [0, 3, 7, 10]], [50, [0, 4, 7, 10]], [43, [0, 4, 7, 11]], [47, [0, 3, 7, 10]], [52, [0, 4, 7, 10]]];
function muzak37(dt, near, pos) {
  G37.mzT = (G37.mzT || 0) - dt; if (G37.mzT > 0 || !AU.ctx || AU.ctx.state !== 'running' || near < 0.02) return;
  G37.mzT = 0.62; const b = G37.mzB = ((G37.mzB ?? -1) + 1), ch = MUZ37[Math.floor(b / 8) % MUZ37.length], mf = m => 440 * Math.pow(2, (m - 69) / 12);
  shot((d, t) => { const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(d);
    if (b % 8 === 0) ch[1].forEach((iv, i) => tone(lp, t + i * 0.03, 3.4, 'sine', mf(ch[0] + 12 + iv), mf(ch[0] + 12 + iv), 0.05 * near, 0.04));
    if (b % 2 === 0) tone(lp, t, 0.9, 'triangle', mf(ch[0] - 12), mf(ch[0] - 12), 0.09 * near, 0.01);
    if (RNG() < 0.55) tone(lp, t + 0.3, 0.8, 'sine', mf(ch[0] + 24 + ch[1][Math.floor(RNG() * 4)] + (RNG() < 0.3 ? 2 : 0)), mf(ch[0] + 24), 0.04 * near, 0.01);
    return 4; }, pos, 1);
}
function audio37(dt, z, under) {
  const C = AU.ctx, now = C.currentTime, mute = AU.muted, live = G.state === 'play' || G.state === 'intro' || G.state === 'won';
  if (AU.uw) AU.uw.frequency.setTargetAtTime(under ? 420 : 22000, now, 0.05);
  if (!G37.amb) { const s = loopSrc(AU.brown), l = C.createBiquadFilter(); l.type = 'lowpass'; l.frequency.value = 520; const g = C.createGain(); g.gain.value = 0; const lfo = C.createOscillator(); lfo.frequency.value = 0.21; const lg = C.createGain(); lg.gain.value = 0.35; lfo.connect(lg).connect(g.gain); lfo.start(); s.connect(l).connect(g).connect(AU.duckB); G37.amb = { g, l, src: s }; }
  if (!G37.hum) { const g = C.createGain(); g.gain.value = 0; const o = C.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 50; const o2 = C.createOscillator(); o2.frequency.value = 100.4; const f = C.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 260; o.connect(f); o2.connect(f); f.connect(g).connect(AU.duckB); o.start(); o2.start(); G37.hum = { g, o, o2, src: { stop() { try { o.stop(); o2.stop(); } catch (e) {} } } }; }
  const pool = z === Z37.POOL, wet = under ? 1 : 0, v = live ? 1 : 0;
  G37.amb.g.gain.setTargetAtTime(mute ? 0 : (under ? 0.2 : pool ? 0.09 : z === Z37.TUNNEL || z === Z37.WWF || z === Z37.DOME ? 0.07 : 0.025) * v, now, 0.5);
  G37.amb.l.frequency.setTargetAtTime(under ? 260 : pool ? 620 : 420, now, 0.3);
  G37.hum.g.gain.setTargetAtTime(mute ? 0 : (z === Z37.PLANT || z === Z37.STAFF ? 0.07 : pool || z === Z37.HOSP ? 0.012 : 0.004) * v * (under ? 0.4 : 1), now, 0.6);
  AU.humG.gain.setTargetAtTime(0, now, 0.2);
  AU.tenG.gain.setTargetAtTime(mute ? 0 : clamp(G.chase * 0.5 + PL.fear * 0.14, 0, 0.6) * v, now, 0.5); AU.tenF.frequency.setTargetAtTime(280 + G.chase * 1500, now, 0.5);
  // the hotel lobby's music, heard from further away than you'd think
  const sp = W37.pos.speaker; if (sp && live) { const d = dist2(PL.x, PL.z, sp.x, sp.z), near = clamp(1 - d / 38, 0, 1) * (los(PL.x, PL.z, sp.x, sp.z) ? 1 : 0.5); muzak37(dt, near * 3, { x: sp.x, y: 2.6, z: sp.z, pl: { x: PL.x, z: PL.z }, ref: 4, roll: 0.7 }); }
}
// dynamic lights: a light over the flooding well, the vending machine's glow
function wlights37(dt) {
  const cp = CAM.position, t = FX.t;
  if (W37.pos.vend && dist2(PL.x, PL.z, W37.pos.vend.x, W37.pos.vend.z) < 12) setSlot(3, { x: W37.pos.vend.x, y: 1.3, z: W37.pos.vend.z }, 0.6, null, 0, [0.5, 0.78, 1], 4, false, 1.0); else clearSlot(3);
  if (G37.flood && W37.hatch) setSlot(4, { x: W37.hatch.x, y: W37.hatch.y - 0.4, z: W37.hatch.z }, 0.9 * (0.6 + 0.4 * Math.sin(t * 7)), null, 0, [1, 0.2, 0.1], 12, false, 0.4); else clearSlot(4);
  clearSlot(5);
}

// r8: Level 37 voice clips are decoded only when the level starts (they are skipped by loadBank)
function loadVoice37() {
  if (AU.v37 || !AU.ctx || typeof ABANK === 'undefined') return; AU.v37 = true;
  const keys = Object.keys(ABANK).filter(k => /^v37_/.test(k) && ABANK[k]); let qi = 0;
  const one = () => {
    if (qi >= keys.length) return; const k = keys[qi++]; let fired = false;
    const done = b => { if (fired) return; fired = true; if (b) AU.buf[k] = b; ABANK[k] = null; one(); };
    try { const p = AU.ctx.decodeAudioData(b64buf(ABANK[k]), done, () => done(null)); if (p && p.catch) p.catch(() => done(null)); } catch (e) { done(null); }
  };
  for (let i = 0; i < 3; i++) one();
}
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { audioInit, loadVoice37, playVoice }));
