// ---------- Level 9 sound design (synthesized): doors, latches, gate, terminals, lab machinery, night ambience ----------
const SFX9 = {
  creak(pos, metal) { shot((d, t) => {
    nz(d, t, 0.05, 'bandpass', metal ? 2600 : 1800, 3, 0.35, 0.001);
    if (metal) { tone(d, t + 0.04, 0.7, 'sawtooth', 520, 380, 0.05, 0.08); nz(d, t + 0.04, 0.7, 'bandpass', 1400, 12, 0.18, 0.1); }
    else { const f = 150 + Math.random() * 60; tone(d, t + 0.06, 0.9, 'sawtooth', f, f * 1.45, 0.045, 0.12); nz(d, t + 0.05, 0.95, 'bandpass', 700 + Math.random() * 300, 9, 0.22, 0.2); }
    return 1.1; }, pos, 0.9); },
  shut(pos, metal) { shot((d, t) => {
    nz(d, t, metal ? 0.35 : 0.22, 'lowpass', metal ? 420 : 260, 1, 0.9, 0.002); tone(d, t, 0.3, 'sine', metal ? 90 : 72, 40, 0.7, 0.002);
    nz(d, t + 0.03, 0.05, 'bandpass', metal ? 3200 : 2200, 4, 0.4, 0.001);
    if (metal) tone(d, t, 0.6, 'triangle', 310, 300, 0.06, 0.002);
    return 0.7; }, pos, 1); },
  latch(pos, on) { shot((d, t) => {
    nz(d, t, 0.04, 'bandpass', on ? 2400 : 3000, 5, 0.5, 0.001); nz(d, t + 0.09, 0.05, 'bandpass', on ? 3300 : 2100, 5, 0.45, 0.001);
    tone(d, t + 0.09, 0.08, 'triangle', on ? 1900 : 1500, on ? 1700 : 1300, 0.05, 0.001); return 0.3; }, pos, 1); },
  bang(pos, hard = 1) { shot((d, t) => {
    const out = distortNode(d, 0.4);
    nz(out, t, 0.28, 'lowpass', 240, 1, 0.95 * hard, 0.002); tone(d, t, 0.32, 'sine', 62, 34, 0.9 * hard, 0.002);
    for (let i = 0; i < 4; i++) nz(d, t + 0.03 + Math.random() * 0.18, 0.03, 'highpass', 2600 + Math.random() * 2000, 2, 0.25 * hard, 0.001);
    return 0.6; }, pos, 1.3); },
  rattle(pos) { shot((d, t) => { for (let i = 0; i < 5; i++) nz(d, t + i * 0.07 + Math.random() * 0.02, 0.035, 'bandpass', 2200 + Math.random() * 1400, 4, 0.35, 0.001); tone(d, t, 0.4, 'triangle', 880, 860, 0.03); return 0.5; }, pos, 1); },
  gate(pos) { shot((d, t) => {
    tone(d, t, 0.18, 'square', 1046, 1046, 0.08, 0.003); tone(d, t + 0.22, 0.25, 'square', 1568, 1568, 0.08, 0.003);
    nz(d, t + 0.3, 0.12, 'lowpass', 400, 1, 0.8, 0.002);
    const r = nz(d, t + 0.35, 2.6, 'bandpass', 520, 1.2, 0.35, 0.3); r.frequency.linearRampToValueAtTime(760, t + 2.9);
    tone(d, t + 0.35, 2.6, 'sawtooth', 70, 78, 0.07, 0.3);
    for (let i = 0; i < 9; i++) nz(d, t + 0.4 + i * 0.27 + Math.random() * 0.08, 0.05, 'bandpass', 1500 + Math.random() * 1500, 6, 0.3, 0.001);
    nz(d, t + 3.0, 0.3, 'lowpass', 300, 1, 0.9, 0.002); tone(d, t + 3.0, 0.5, 'triangle', 240, 230, 0.12, 0.002);
    return 3.6; }, pos, 1.1); },
  modem(pos) { shot((d, t) => {
    let k = 0; for (const [f, dur] of [[1650, 0.18], [1850, 0.14], [2100, 0.3], [1200, 0.12], [2400, 0.12], [1200, 0.12], [2400, 0.2]]) { tone(d, t + k, dur, 'sine', f, f, 0.05, 0.005); k += dur; }
    nz(d, t + k, 0.9, 'bandpass', 1800, 0.8, 0.12, 0.05); tone(d, t + k, 0.9, 'square', 980, 980, 0.012, 0.05);
    return k + 1; }, pos, 0.9); },
  chirp(pos) { shot((d, t) => { const f = 900 + Math.random() * 1400; tone(d, t, 0.06, 'square', f, f, 0.025, 0.002); nz(d, t, 0.08, 'bandpass', 2400, 1, 0.04, 0.005); return 0.2; }, pos, 0.8); },
  dlDone(pos) { shot((d, t) => { [880, 1175, 1568].forEach((f, i) => tone(d, t + i * 0.12, 0.2, 'square', f, f, 0.08, 0.004)); return 0.7; }, pos, 1); },
  clang(pos) { shot((d, t) => {
    const f = 330 + Math.random() * 80; nz(d, t, 0.05, 'bandpass', 2600, 2, 0.8, 0.001);
    [[1, 0.2], [2.76, 0.12], [5.4, 0.07], [8.9, 0.04]].forEach(([m, v]) => tone(d, t, 1.4 / Math.sqrt(m), 'sine', f * m, f * m * 0.995, v, 0.001));
    tone(d, t, 0.2, 'sine', 90, 50, 0.4, 0.002); return 1.5; }, pos, 1.2); },
  hiss(pos, dur = 6) { shot((d, t) => {
    nz(d, t, 0.25, 'lowpass', 400, 1, 0.6, 0.002);
    const n = nz(d, t + 0.05, dur, 'highpass', 2200, 0.7, 0.45, 0.35); n.frequency.linearRampToValueAtTime(3800, t + dur);
    nz(d, t + 0.05, dur, 'bandpass', 900, 0.8, 0.2, 0.5); return dur + 0.4; }, pos, 1); },
  pry(pos) { shot((d, t) => {
    tone(d, t, 1.25, 'sawtooth', 140, 95, 0.06, 0.15); nz(d, t, 1.25, 'bandpass', 1100, 10, 0.25, 0.2);
    for (let i = 0; i < 6; i++) nz(d, t + i * 0.2, 0.05, 'bandpass', 1800 + Math.random() * 900, 5, 0.22, 0.002);
    nz(d, t + 1.32, 0.07, 'bandpass', 2400, 3, 0.9, 0.001); tone(d, t + 1.32, 0.5, 'triangle', 1250, 1180, 0.07, 0.001);
    for (let i = 0; i < 3; i++) nz(d, t + 1.5 + i * 0.12, 0.04, 'bandpass', 3000, 4, 0.3, 0.001);
    return 2; }, pos, 1); },
  canIn(pos) { shot((d, t) => { nz(d, t, 0.05, 'bandpass', 2000, 4, 0.5, 0.001); tone(d, t, 0.25, 'triangle', 700, 690, 0.06); nz(d, t + 0.25, 0.5, 'highpass', 3500, 1, 0.12, 0.05); tone(d, t + 0.3, 0.15, 'sine', 1320, 1320, 0.06); return 0.9; }, pos, 1); },
  klaxon(pos) { shot((d, t) => { for (let i = 0; i < 3; i++) { tone(d, t + i * 0.7, 0.62, 'sawtooth', 420, 620, 0.1, 0.05); } return 2.2; }, pos, 1.2); },
  cellOpen(pos) { shot((d, t) => { nz(d, t, 0.1, 'lowpass', 300, 1, 0.8); tone(d, t + 0.05, 1.3, 'sawtooth', 60, 90, 0.06, 0.1); nz(d, t + 0.05, 1.3, 'bandpass', 900, 6, 0.2, 0.2); nz(d, t + 1.35, 0.2, 'lowpass', 350, 1, 0.8); return 1.8; }, pos, 1.1); },
  cageDrop(pos) { shot((d, t) => { nz(d, t, 0.45, 'bandpass', 1600, 1, 0.3, 0.02); nz(d, t + 0.45, 0.35, 'lowpass', 500, 1, 1.0, 0.001); tone(d, t + 0.45, 0.4, 'sine', 70, 35, 0.9); [1, 2.7, 5.3].forEach((m, i) => tone(d, t + 0.45, 1.6 / m, 'sine', 250 * m, 248 * m, 0.14 / (i + 1))); return 2.2; }, pos, 1.3); },
  lever(pos) { shot((d, t) => { nz(d, t, 0.1, 'bandpass', 1300, 3, 0.4, 0.002); nz(d, t + 0.22, 0.12, 'lowpass', 600, 1, 0.7, 0.001); tone(d, t + 0.22, 0.15, 'triangle', 380, 360, 0.08); return 0.5; }, pos, 1); },
  ding(pos) { shot((d, t) => { tone(d, t, 1.6, 'sine', 1318.5, 1318.5, 0.14, 0.004); tone(d, t + 0.45, 1.8, 'sine', 1046.5, 1046.5, 0.14, 0.004); return 2.4; }, pos, 1); },
  elevator(pos) { shot((d, t) => { const o = tone(d, t, 3.5, 'sawtooth', 55, 72, 0.08, 0.6); nz(d, t, 3.5, 'lowpass', 180, 1, 0.3, 0.6); nz(d, t + 0.1, 0.4, 'lowpass', 300, 1, 0.5, 0.01); return 3.8; }, pos, 1); },
  bark(pos) { shot((d, t) => { for (let i = 0; i < 2; i++) { const s = t + i * 0.32; nz(d, s, 0.16, 'bandpass', 700, 2.5, 0.6, 0.005); tone(d, s, 0.14, 'sawtooth', 420, 260, 0.12, 0.005); } return 0.8; }, pos, 0.9); },
};
// outdoor night bed: wind through the trees + crickets (gain = outdoorness)
function mkNight9() {
  const C = AU.ctx, g = C.createGain(); g.gain.value = 0; g.connect(AU.duckB);
  const ws = loopSrc(AU.brown), wb = C.createBiquadFilter(); wb.type = 'bandpass'; wb.frequency.value = 420; wb.Q.value = 0.6;
  const wg = C.createGain(); wg.gain.value = 0.35; const wl = C.createOscillator(); wl.frequency.value = 0.07; const wlg = C.createGain(); wlg.gain.value = 180; wl.connect(wlg).connect(wb.frequency); wl.start();
  const al = C.createOscillator(); al.frequency.value = 0.11; const alg = C.createGain(); alg.gain.value = 0.2; al.connect(alg).connect(wg.gain); al.start();
  ws.connect(wb).connect(wg).connect(g);
  const cr = C.createGain(); cr.gain.value = 0.0; cr.connect(g);
  [[4420, 27, 0.63, -0.5], [4780, 31, 0.41, 0.6]].forEach(([f, am, sl, pan]) => {
    const o = C.createOscillator(); o.frequency.value = f; const a = C.createGain(); a.gain.value = 0.5;
    const m = C.createOscillator(); m.type = 'square'; m.frequency.value = am; const mg = C.createGain(); mg.gain.value = 0.5; m.connect(mg).connect(a.gain); m.start();
    const b = C.createGain(); b.gain.value = 0.5; const s = C.createOscillator(); s.type = 'square'; s.frequency.value = sl; const sg = C.createGain(); sg.gain.value = 0.5; s.connect(sg).connect(b.gain); s.start();
    const p = C.createStereoPanner ? C.createStereoPanner() : null; o.connect(a).connect(b); if (p) { p.pan.value = pan; b.connect(p).connect(cr); } else b.connect(cr); o.start();
  });
  const n = { g, cr, wg }; return n;
}
