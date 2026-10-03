// ---------- checkpoints (r4.4): on Easy / Normal, dying lets you retry from the last checkpoint of the current level ----------
// The world is kept exactly as it was (tapes, computers, keys, valves, drawings, opened doors stay done); the player is put back at the
// checkpoint and the level's monsters are sent back to sleep / far away. Nightmare keeps the old rule: death restarts the level.
const CP = { on: null, fadeT: 0, noteT: 0, n: 0, retries: 0 };
function cpEnabled() { return G.diff < 2; }
function cpSave(label, at) {
  if (!cpEnabled() || !['play', 'intro'].includes(G.state)) return;
  const p = at || PL;
  CP.on = { lvl: LVL, label, x: p.x, z: p.z, yaw: p.yaw ?? PL.yaw, t: G.time }; CP.n++;
  if (!(at && at.quiet)) cpNote(label);
}
function cpNote(label) { const el = $('cpNote'); if (!el) return; el.innerHTML = '<b>◆ CHECKPOINT</b><span></span>'; el.lastChild.textContent = label; el.classList.add('show'); CP.noteT = 3.6; }
function cpReset() { CP.on = null; CP.fadeT = 0; CP.noteT = 0; const n = $('cpNote'); if (n) n.classList.remove('show'); const b = $('btnCP'); if (b) b.classList.add('hide'); }
function cpAvail() { return !!(CP.on && CP.on.lvl === LVL && cpEnabled()); }
function cpTick(dt) {
  if (CP.noteT > 0 && (CP.noteT -= dt) <= 0) { const n = $('cpNote'); if (n) n.classList.remove('show'); }
  if (CP.fadeT > 0) {   // fade up from black after a retry (a stair / slide fade that starts meanwhile keeps its own darkness)
    CP.fadeT = Math.max(0, CP.fadeT - dt); const k = smooth(0, 1.2, CP.fadeT), busy = (LVL === 9 && G9.tp) || (LVL === 5 && G5.tp) || (LVL === 18 && G18.slide);
    if (G.state === 'play') FX.fadeB = busy ? Math.max(FX.fadeB, k) : k;
  }
}
// end screen: offer the checkpoint after a death on Easy / Normal
function cpEndUI(won) {
  const b = $('btnCP'), a = $('btnAgain'); if (!b) return;
  const ok = !won && G.state === 'dead' && cpAvail();
  b.classList.toggle('hide', !ok); a.classList.toggle('primary', !ok);
  if (ok) {
    b.innerHTML = '<b>▶ RETRY FROM CHECKPOINT</b><span>◆ ' + CP.on.label + '</span>';
    a.textContent = LVL === 0 ? '◀◀ START OVER' : '◀◀ RESTART LEVEL ' + LVL;
    setTimeout(() => { try { b.focus({ preventScroll: true }); } catch (e) {} }, 30);
  }
}
function cpRetry() {
  if (G.state !== 'dead' || !cpAvail()) return;
  const C = CP.on; CP.retries++;
  hideScreens(); $('btnCP').classList.add('hide'); $('btnAgain').classList.add('primary');
  lockPointer(); K.clear(); JUST.clear(); RMB = false; ALTCLICK = false; TOUCH.mx = TOUCH.mz = 0;
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  Object.assign(PL, { x: C.x, z: C.z, yaw: C.yaw, pitch: 0, vx: 0, vz: 0, kx: 0, kz: 0, crouch: false, ck: 0, sta: 1, exh: false,
    hp: [100, 80, 60][G.diff], san: Math.max(PL.san, [85, 70, 60][G.diff]), batt: Math.max(PL.batt, 35), noise: 0, lastHurt: -99, shake: 0,
    cell: -1, fear: 0, lookAt: null, lookK: 0, focus: null, interf: 0, zoomT: false, zk: 0, roll: 0, spd: 0, run: false, spdK: 1 });
  updateField();
  G.cause = ''; G.chase = 0;
  Object.assign(FX, { hurt: 0, fadeW: 0, fadeB: 1, glitch: 2 });
  DEATH.shown = false; DEATH.t = 0;
  try { if (LVL === 9) cpRespawn9(); else if (LVL === 5) cpRespawn5(); else if (LVL === 18) cpRespawn18(); else cpRespawn0(); } catch (e) { frameErr('cp', e); }
  CAM.position.set(PL.x, 1.62, PL.z); CAM.rotation.set(0, PL.yaw, 0);
  G.state = 'play'; CP.fadeT = 1.2;
  $('osd').classList.remove('hide'); if (IS_TOUCH) $('touch').classList.remove('hide');
  SFX.tape(); SFX.staticBurst(0.3, 0.5);
  toast('▶ BACK AT CHECKPOINT · ' + C.label, 2.6);
}
// ----- per-level respawn: put the hunters back where they can't jump you -----
function cpFarPt(minD) {   // a reachable cell far from the respawn point, out of sight
  const c = farCell(minD, 99); return c >= 0 ? cellPt(c) : null;
}
function cpRespawn0() {
  stopAudioLive(AI.howlers);
  for (const h of AI.howlers) {
    const p = cpFarPt(10); if (p) h.place(p.x, p.z, rnd(0, TAU));
    Object.assign(h, { st: 'wander', stT: 0, lost: 0, blind: 8, lk: null, wt: null, prey: null, pause: 0, seen: false, atkCd: 2, callT: rnd(120, 180), seeCd: 0 });
  }
  const cr = AI.crawler; if (cr && cr.active) { cr.dorm = 0; cr.respawn(); }
  for (const s of AI.smilers) { if (s.present) s.relocate(false); s.st = 'lurk'; }
  const m = AI.mimic; if (m && m.present && m.st !== 'pose') m.relocate();
}
function cpRespawn9() {
  G9.tp = null; closeMap9();
  for (const T of W9.terms) if (T.active) { T.active = false; T.prog = 0; T.away = 0; T.drawK = ''; drawTerm(T); }
  for (const w of AI9.wretches) {
    if (!w.present) continue;
    w.place(w.home.x, w.home.z, w.hyaw);
    Object.assign(w, { st: 'rest', restT: rnd(4, 8), stT: 0, sus: 0, hear: 0, stirred: false, lk: null, unheardT: 0, cl: null, yOff: 0, wp: null, doorT: 0, bangs: 0, atkCd: 1, fc: -1, dir: -1 });
    w.sync();
  }
  const S = streetCells9();
  for (const w of AI9.watch) {
    if (dist2(w.x, w.z, PL.x, PL.z) < 40 || w.st === 'chase' || w.st === 'notice' || w.st === 'bang' || w.st === 'lurk') {
      let best = -1, bd = -1;
      for (let k = 0; k < 60; k++) { const c = pick(S), x = cellCenter(c % N), z = cellCenter((c / N) | 0), d = dist2(x, z, PL.x, PL.z); if (d > 45 && !los(PL.x, PL.z, x, z)) { best = c; break; } if (d > bd) { bd = d; best = c; } }
      if (best >= 0) { const p = cellPt(best, 0.5, 0.4); w.place(p.x, p.z, rnd(0, TAU)); }
    }
    Object.assign(w, { st: 'patrol', stT: 0, sus: 0, lk: null, lost: 0, wp: null, door: null, leaveT: 6, atkCd: 2, seen: false });
  }
  const s = AI9.subject;
  if (s && ['burst', 'lured', 'sniff', 'hunt'].includes(s.st)) { s.place(s.home.x, s.home.z, s.hyaw); s.st = 'lured'; s.stT = 0; s.atkCd = 2; s.fc = -1; }
}
function cpRespawn5() {
  Object.assign(G5, { tp: null, turning: null, stareP: null, stareT: 0, eyeF: null, eyeW: 0, eyeT: 0, ambush: 0, ambushT: rnd(16, 28), vest: null, vestS: 0 });
  for (const m of AI5.moths) {
    if (!m.alive) continue;   // r7: sprayed moths stay dead
    if (m.fem) { m.reset(); continue; }
    Object.assign(m, { st: 'roost', stT: 0, lk: null, wp: null, lamp: null, away: null, atkCd: 2, seen: false, lit: false, y: CEIL - 0.42, unT5: 0, driftT: 0, fc: -1, dir: -1 });
    m.place(m.home.x, m.home.z, m.yaw);
    if (m.loyal && m.loyalLamp) { m.st = 'circle'; m.lamp = m.loyalLamp; m.y = 2.8; }
  }
  for (const a of FEM5.acid) a.mesh.dispose(); FEM5.acid.length = 0;
}
function cpRespawn18() {
  G18.slide = null; G18.digging = false; PL.spdK = 1;
  M18.seq.length = 0; M18.tile = -1;
  for (const f of AI18.fog) f.goAway(rnd(14, 22));
}
// ----- crash safety (r4.4): one bad frame must never stop the render loop -----
const ERRS = { n: 0, seen: new Set(), last: '' };
function frameErr(where, e) {
  ERRS.n++; const k = where + ': ' + (e && e.message || e); ERRS.last = k;
  if (!ERRS.seen.has(k) && ERRS.seen.size < 40) { ERRS.seen.add(k); console.error('[recovered ' + where + ']', e); }
}
// closing / reloading the tab mid-level asks first (Ctrl+W used to be one key away from the old Ctrl-crouch)
function inRun() { return !['title', 'loading'].includes(G.state); }
addEventListener('beforeunload', e => { if (inRun()) { e.preventDefault(); e.returnValue = ''; return ''; } });
