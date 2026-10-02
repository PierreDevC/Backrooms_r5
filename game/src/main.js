// ---------- boot, game flow, story events, main loop ----------
const TAPE_LOGS = VO_TXT.tapes.map(t => '“…' + t.charAt(0).toLowerCase() + t.slice(1) + '”');
function radioLine(key) {   // story beat spoken over the radio by whoever is still alive
  const a = AI.exps.filter(e => e.alive), e = a.length ? pick(a) : AI.exps[Math.floor(RNG() * AI.exps.length)];
  if (e) say(a.length ? e.name : 'RADIO', VO_TXT.story[key], { radio: true, vo: `e${e.i}_${key}` });
}
const DEATH_TXT = {
  howler: ['TAKEN BY THE HOWLER', 'It heard you long before you saw it.'],
  crawler: ['IT WAS RIGHT BEHIND YOU', 'It only moved when you looked away.'],
  smiler: ['IT SMILED IN THE DARK', 'You let the light go out.'],
  mimic: ["IT WASN'T ONE OF US", "The suit was empty. It had been for a long time."],
  sanity: ['YOUR MIND CAME APART', 'The hum finally said your name.']};
const INTRO = { t: 0 }, DEATH = { t: 0 }, TC = { x: 0, z: 0, yaw: 0, nx: 0, nz: 0, d: 0, cx: 0, cy: 0 };
let hiss = null, hadLock = false, buzzCd = 0, stutter = 1, lsBase = 1;

// ----- escalating tape hints: the longer you go without a tape, the louder the rigs call out -----
const HINT = { stage: 0, site: null, dir: 0, pathD: 0, beepT: 0, radT: 0, upd: 0, beacon: null };
const HINT_T = [[45, 90, 140], [60, 120, 180], [75, 150, 220]];
function hintSite() {   // nearest untaken tape by walking distance + the heading of the path toward it
  let best = null, bd = 1e9;
  for (const s of W.tapes) { if (s.taken) continue; if (!s.F) s.F = bfs(cellOf(s.x), cellOf(s.z)); const d = s.F[PL.cell]; if (d >= 0 && d < bd) { bd = d; best = s; } }
  if (!best) return null;
  HINT.pathD = bd;
  if (bd <= 1 && los(PL.x, PL.z, best.x, best.z)) return { s: best, a: Math.atan2(best.x - PL.x, best.z - PL.z) };
  let cx = PL.cell % N, cy = (PL.cell / N) | 0, tx = best.x, tz = best.z, ok = false;
  for (let k = 0; k < 4; k++) {   // follow the field while the next cell is still in view
    const cur = best.F[cIdx(cx, cy)]; if (cur <= 0) break;
    let nd = -1; for (let d = 0; d < 4; d++) { if (!passable(cx, cy, d)) continue; const v = best.F[cIdx(cx + DX[d], cy + DY[d])]; if (v >= 0 && v < cur) { nd = d; break; } }
    if (nd < 0) break;
    const nx = cx + DX[nd], ny = cy + DY[nd];
    if (k > 0 && !los(PL.x, PL.z, cellCenter(nx), cellCenter(ny))) break;
    cx = nx; cy = ny; ok = true;
    if (best.F[cIdx(cx, cy)] === 0) break;
  }
  if (ok && best.F[cIdx(cx, cy)] > 0) { tx = cellCenter(cx); tz = cellCenter(cy); }
  return { s: best, a: Math.atan2(tx - PL.x, tz - PL.z) };
}
function beaconOff() { if (HINT.beacon) setGain(HINT.beacon, 0, 0.4); }
function tapeHints(dt) {
  if (G.tapes >= 4) { HINT.stage = 0; beaconOff(); return; }
  G.hintT += dt;
  const th = HINT_T[G.diff], st = G.hintT > th[2] ? 3 : G.hintT > th[1] ? 2 : G.hintT > th[0] ? 1 : 0;
  if (st > HINT.stage) {
    if (st === 1) toast('TAPE SIGNAL LOCKED — FOLLOW THE ARROW', 3.2);
    if (st === 2) toast('SIGNAL STRONGER — LISTEN FOR THE CAMCORDER', 3.2);
    if (st === 3) HINT.radT = 1.5;
    SFX.beep(1320, 0.07); later(0.14, () => SFX.beep(1760, 0.07)); FX.glitch = Math.max(FX.glitch, 0.9); HINT.upd = 0;
  }
  HINT.stage = st;
  if (!st) { HINT.site = null; beaconOff(); return; }
  HINT.upd -= dt;
  if (HINT.upd <= 0) { HINT.upd = 0.25; const h = hintSite(); HINT.site = h ? h.s : null; if (h) HINT.dir = h.a; }
  const s = HINT.site; if (!s) { beaconOff(); return; }
  if (st >= 2) {
    // the camcorder picks up the lost rig: tally beeps + interference while you face the way to it
    HINT.beepT -= dt;
    if (Math.abs(angDiff(PL.yaw, HINT.dir)) < 0.42 && HINT.beepT <= 0) {
      HINT.beepT = clamp(0.3 + HINT.pathD * 0.07, 0.35, 1.8); SFX.beep(1900, 0.03);
      FX.glitch = Math.max(FX.glitch, st > 2 ? 0.55 : 0.35); if (RNG() < 0.5) SFX.staticBurst(0.05, 0.08);
    }
    if (!HINT.beacon && AU.ctx) HINT.beacon = mkBeaconLoop();
    if (HINT.beacon) { HINT.beacon.set(s.x, 0.4, s.z, PL.x, PL.z); setGain(HINT.beacon, st > 2 ? 0.95 : 0.6, 0.5); }
  } else beaconOff();
  if (st >= 3) {
    HINT.radT -= dt;
    if (HINT.radT <= 0 && !SUBS.cur) {
      HINT.radT = 55;
      const a = AI.exps.filter(e => e.alive), e = a.length ? pick(a) : AI.exps[0], dd = Math.round(dist2(s.x, s.z, PL.x, PL.z) / 5) * 5;
      const di = compassIdx(s.x - PL.x, s.z - PL.z), c = dd < 32 ? 0 : dd < 80 ? 1 : 2;
      if (e) say(a.length ? e.name : 'RADIO', `I saw one of our camera rigs to the ${VO_TXT.dirs[di]}. ${VO_TXT.dist[c]}`, { radio: true, vo: [`e${e.i}_rig${di}`, `e${e.i}_dist${c}`] });
    }
  }
}

// ----- title flyby: a slow random walk down the halls -----
function titleInit() {
  const c = LV.halls.length ? LV.halls[0] : { x0: LV.spawn.x, y0: LV.spawn.y };
  TC.cx = c.x0; TC.cy = c.y0; TC.x = cellCenter(TC.cx); TC.z = cellCenter(TC.cy);
  TC.d = [0, 1, 2, 3].find(d => passable(TC.cx, TC.cy, d)) ?? 0; TC.yaw = Math.atan2(DX[TC.d], DY[TC.d]); titleNext();
}
function titleNext() {
  const opts = [0, 1, 2, 3].filter(d => passable(TC.cx, TC.cy, d) && d !== (TC.d + 2) % 4);
  if (!opts.length) TC.d = (TC.d + 2) % 4; else if (!opts.includes(TC.d) || RNG() < 0.25) TC.d = pick(opts);
  TC.cx += DX[TC.d]; TC.cy += DY[TC.d]; TC.nx = cellCenter(TC.cx); TC.nz = cellCenter(TC.cy);
}
function titleCam(dt) {
  const dx = TC.nx - TC.x, dz = TC.nz - TC.z, d = Math.hypot(dx, dz), sp = 0.85 * dt;
  if (d < 0.05) titleNext(); else { TC.x += dx / d * Math.min(sp, d); TC.z += dz / d * Math.min(sp, d); }
  TC.yaw += angDiff(TC.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 0.9);
  const t = FX.t;
  CAM.position.set(TC.x, 1.5 + noise1(t * 0.4) * 0.03, TC.z);
  CAM.rotation.set(0.03 + noise1(t * 0.3 + 5) * 0.02, TC.yaw + noise1(t * 0.25 + 9) * 0.05, noise1(t * 0.2 + 3) * 0.012);
  CAM.fov = 1.08; FX.fadeB = damp(FX.fadeB, 0, 1.2, dt);
  clearSlot(0);
}

// ----- game start / intro -----
function startGame(force) {
  if (G.state !== 'title') return;
  if (!force && !briefSeen()) { openBrief('play'); return; }
  audioInit(S.vol); if (AU.ctx.state === 'suspended') AU.ctx.resume();
  applySettings(); lockPointer();
  hideScreens(); G.state = 'intro'; INTRO.t = -1.8;
  Object.assign(G, { code: [], tapes: 0, time: 0, lost: 0, cause: '', blackout: 0, exitOn: false, grace: [60, 45, 30][G.diff], radioT: 70, hallT: 20, chase: 0, hintT: 0 });
  HINT.stage = 0; HINT.site = null;
  runReset(); tasksReset('LEVEL 0 · THE LOBBY'); places0Start();
  G.digits = [rndi(0, 9), rndi(0, 9), rndi(0, 9), rndi(0, 9)];
  resetPlayer(); buildItems(G.diff); initAI();
  $('blue').classList.remove('hide'); SFX.tape(); FX.fadeB = 0;
}
function introCam(dt) {
  INTRO.t += dt; const t = INTRO.t;
  if (t < 0) { FX.fadeB = 0; return; }
  if (!$('blue').classList.contains('hide')) { $('blue').classList.add('hide'); FX.glitch = 2.5; SFX.staticBurst(0.35, 0.6); }
  const k = smooth(0.8, 4.2, t);
  const blink = t < 0.6 ? 1 : t < 1.3 ? 0.35 + 0.3 * Math.sin((t - 0.6) * 9) : t < 1.6 ? 0.9 : t < 2.4 ? lerp(0.9, 0, (t - 1.6) / 0.8) : 0;
  FX.fadeB = clamp(blink, 0, 1); FX.glitch = Math.max(FX.glitch, 1.2 * (1 - k));
  CAM.position.set(PL.x, lerp(0.32, 1.62, k), PL.z);
  CAM.rotation.set(lerp(-1.05, 0, smooth(0.6, 3.6, t)) + noise1(FX.t * 1.3) * 0.02, PL.yaw + lerp(0.5, 0, k), lerp(1.15, 0, smooth(1.2, 4, t)));
  CAM.fov = S.fov * Math.PI / 180;
  if (t > 4.3) beginPlay();
}
function beginPlay() {
  G.state = 'play'; FX.fadeB = 0; PL.pitch = 0;
  $('osd').classList.remove('hide'); if (IS_TOUCH) $('touch').classList.remove('hide');
  setObj0(); cpSave('LEVEL START', { x: PL.x, z: PL.z, yaw: PL.yaw, quiet: true });
  later(0.8, () => say('K. MARSH', VO_TXT.intro[0], { radio: true, vo: 'intro1' }));
  later(1.0, () => say('K. MARSH', VO_TXT.intro[1], { radio: true, vo: 'intro2' }));
  later(13, () => toast(IS_TOUCH ? 'LIGHT · USE · DRINK · BATT BUTTONS' : '[F] FLASHLIGHT   [E] INTERACT   [N] NIGHT SHOT', 3.5));
}

// ----- story beats -----
function takeTape(site) {
  site.taken = true; site.tape.setEnabled(false); G.tapes++; G.hintT = 0; HINT.stage = 0; HINT.site = null; beaconOff();
  const n = G.tapes, dig = G.digits[G.code.length]; G.code.push(dig);
  SFX.tape(); FX.glitch = Math.max(FX.glitch, 1.6); PL.san = Math.min(100, PL.san + 10);
  say('TAPE ' + n, TAPE_LOGS[n - 1], { vo: 'tape' + n, mode: 'tape', delay: 1.15 });
  later(0.6, () => toast(`CODE DIGIT ${n}: ${dig}`, 3));
  setObj0();
  cpSave(`TAPE ${n}/4`);
  if (n === 1) later(18, () => { AI.crawler.activate(); radioLine('crawl'); });
  if (n === 2) {
    if (G.diff >= 1 || AI.howlers.length < 1) later(6, () => { const h = spawnHowler(10); SFX.howl({ x: h.x, y: 2.2, z: h.z, pl: { x: PL.x, z: PL.z } }); radioLine('more'); });
    else later(6, () => radioLine('circ'));
  }
  if (n === 3) later(3.5, startBlackout);
  if (n === 4) later(2, () => { G.exitOn = true; SFX.alarm(W.exit ? { x: W.exit.x, y: 2.4, z: W.exit.z, pl: { x: PL.x, z: PL.z } } : null); radioLine('red'); });
}
function startBlackout() {
  G.blackout = [16, 24, 30][G.diff]; SFX.thunk(); SFX.buzz(null); FX.glitch = 2;
  toast('POWER FAILURE', 2.5);
  for (const s of AI.smilers) { s.gone = rnd(1.5, 4); s.present = false; }
  later(1.5, () => radioLine('lights'));
}
function searchBody() {
  SFX.search(); const r = RNG();
  if (r < 0.55) { PL.spare++; toast('FOUND: CAMCORDER BATTERY'); }
  else if (r < 0.9) { PL.water++; toast('FOUND: ALMOND WATER'); }
  else { PL.spare++; PL.water++; toast('FOUND: BATTERY + ALMOND WATER'); }
  PL.san = Math.max(0, PL.san - 6);
}
function useExit() {
  if (exitUse0()) return;   // r6: the keypad needs power first
  if (G.code.length < 4) { SFX.beep(260, 0.3); toast(`KEYPAD LOCKED — ${4 - G.code.length} DIGIT${G.code.length === 3 ? '' : 'S'} MISSING`); return; }
  const E = W.exit; E.opening = true;
  G.code.forEach((d, i) => later(0.28 * i, () => SFX.keypad(d)));
  later(1.3, () => { SFX.beep(1500, 0.25); setEmi(E.led, 0.1, 3, 0.2); SFX.door({ x: E.doorPos.x, y: 1.4, z: E.doorPos.z, pl: { x: PL.x, z: PL.z } }); toast('ACCESS GRANTED', 2); });
  later(2.0, () => { for (const h of AI.howlers) { h.blind = 0; h.lk = { x: PL.x, z: PL.z }; h.startChase(); } say('RADIO', "It heard the door. RUN!", { radio: true }); });
}
function die(src) {
  if (G.state !== 'play') return;
  G.state = 'dead'; G.cause = src; DEATH.t = 0; DEATH.y0 = CAM.position.y; DEATH.r0 = CAM.rotation.z; DEATH.p0 = CAM.rotation.x; DEATH.shown = false;
  clearSlot(0); $('prompt').classList.remove('show');
  later(1.9, () => SFX.staticBurst(0.55, 2.2));
}
function deathCam(dt) {
  DEATH.t += dt; const t = DEATH.t, k = smooth(0.35, 1.5, t);
  CAM.position.y = lerp(DEATH.y0, 0.28, k); CAM.rotation.z = lerp(DEATH.r0, 1.3, k); CAM.rotation.x = lerp(DEATH.p0, -0.25, k) + noise1(FX.t * 22) * 0.03 * (1 - k);
  FX.glitch = Math.max(FX.glitch, 1 + k * 1.5); FX.hurt = Math.max(FX.hurt, 0.8 * (1 - k)); FX.fadeB = smooth(1.9, 3.0, t);
  if (t > 3.3 && !DEATH.shown) { DEATH.shown = true; showEnd(false); }
}
function win() {
  if (G.state !== 'play') return;
  G.state = 'won'; DEATH.t = 0; SFX.sting();
  try { const b = +localStorage.getItem('br_best'); if (!b || G.time < b) localStorage.setItem('br_best', Math.floor(G.time)); } catch (e) {}
}
function wonCam(dt) {
  DEATH.t += dt; FX.fadeW = smooth(0, 1.6, DEATH.t);
  CAM.position.x = damp(CAM.position.x, W.exit.doorPos.x, 1.5, dt); CAM.position.z = damp(CAM.position.z, W.exit.doorPos.z, 1.5, dt);
  if (DEATH.t > 2.4 && !DEATH.shown) { DEATH.shown = true; flags0(); goLevel9(carryFromL0()); }
}
function showEnd(won) {
  if (LVL === 18) showEnd18(won); else if (LVL === 5) showEnd5(won); else if (LVL === 9) showEnd9(won); else showEnd0(won);
  cpEndUI(won);   // Easy / Normal: offer the last checkpoint
}
function showEnd0(won) {
  if (document.pointerLockElement) document.exitPointerLock();
  $('osd').classList.add('hide'); $('touch').classList.add('hide');
  const [title, text] = won ? ['YOU FOUND THE EXIT', `The footage ends in white. ${G.lost ? `${G.lost} member${G.lost > 1 ? 's' : ''} of the expedition never made it back.` : 'Somehow, the whole expedition made it back.'}`] : (DEATH_TXT[G.cause] || DEATH_TXT.howler);
  $('endKicker').textContent = won ? 'TAPE RECOVERED · END OF RECORDING' : '■ SIGNAL LOST';
  $('endTitle').textContent = title; $('endText').textContent = text;
  const st = [['TIME ON TAPE', fmtTC(G.time)], ['DISTANCE', Math.round(PL.dist) + ' M'], ['TAPES', G.tapes + '/4'], ['EXPLORERS LOST', G.lost + '/4'], ['DIFFICULTY', DIFFS[G.diff]], ['CODE', G.code.join(' ') || '—']];
  $('endStats').innerHTML = st.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  show('end');
}

// ----- pause / restart -----
function pauseGame() {
  if (G.state !== 'play') return;
  G.state = 'paused'; show('pause'); if (AU.ctx) AU.ctx.suspend();
  if (document.pointerLockElement) document.exitPointerLock();
}
function resumeGame() {
  if (G.state !== 'paused') return;
  hideScreens(); G.state = 'play'; if (AU.ctx) AU.ctx.resume(); lockPointer(); K.clear();
}
function teardownScene() {
  for (const a of AI.all) for (const v of [a.growl, a.whine]) if (v) { try { v.g.disconnect(); if (v.src) v.src.stop(); } catch (e) {} }
  if (hiss) { try { hiss.g.disconnect(); } catch (e) {} hiss = null; }
  if (HINT.beacon) { try { HINT.beacon.g.disconnect(); } catch (e) {} HINT.beacon = null; } HINT.stage = 0; HINT.site = null;
  teardown9(); teardown5(); teardown18();
  Object.assign(AI, { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null });
  for (const k of ['interact', 'items', 'tapes', 'tvs', 'dead', 'beams']) W[k] = [];
  W.exit = null; TIMERS.length = 0; SUBS.q.length = 0; SUBS.cur = null; $('subs').innerHTML = ''; $('toast').classList.remove('show');
  try { VHS && VHS.dispose(CAM); } catch (e) {} try { PEEP && PEEP.dispose(CAM); } catch (e) {} PEEP = null; PEEPH.dr = null; PEEPH.k = 0; try { PIPE && PIPE.dispose(); } catch (e) {}
  SCN.dispose(); MATS.list.length = 0;
  Object.assign(FX, { glitch: 0, hurt: 0, fadeB: 1, fadeW: 0, san: 0, nv: 0, lightScale: 1, ambBoost: 0 });
  SLOT.pos.fill(0); SHD.fill(0); cpReset(); tasksReset(); PL.load = false;
  $('noise9').classList.add('hide'); HUD.nzOn = false; HUD.nzMk = null;
}
async function restartGame(play) {
  if (LVL === 18 && play && !G18.endWon) { lockPointer(); return goLevel18(G18.from); }
  if (LVL === 5 && play && !G5.endWon) { lockPointer(); return goLevel5(G5.from); }
  if (LVL === 9 && play && !G9.endWon) { lockPointer(); return goLevel9(G9.from); }
  if (play) lockPointer();
  G.state = 'loading'; show('loading'); $('osd').classList.add('hide'); $('touch').classList.add('hide');
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  teardownScene();
  if (LVL !== 0) { LVL = 0; setDims(34, 512); document.body.classList.remove('lvl9', 'lvl5', 'lvl18'); }
  Object.assign(FX, { envA: [0.02, 0.018, 0.013, 0], envS: [0, 0, 0, 0] });
  $('loadOsd').textContent = '▶ LOADING TAPE'; $('btnAgain').textContent = '▶ PLAY AGAIN';
  await buildScene();
  G.state = 'title'; show('title'); titleL9();
  if (play) startGame();
}

function onKey(code) {
  if (code === 'KeyM') { AU.muted = !AU.muted; if (AU.master) AU.master.gain.value = AU.muted ? 0 : S.vol; toast(AU.muted ? 'MUTED' : 'SOUND ON', 1.2); return; }
  if (briefKey(code)) return;
  if (notesKey(code)) return;
  if (G.state === 'title' && code === 'Escape' && !$('levels').classList.contains('hide')) { show('title'); $('btnLevels').focus({ preventScroll: true }); return; }
  if (code === 'Escape' || code === 'KeyP') { if (G.state === 'play') pauseGame(); else if (G.state === 'paused' && code === 'KeyP') resumeGame(); return; }
  if (G.state === 'title' && (code === 'Enter' || code === 'Space') && !$('title').classList.contains('hide') && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) startGame();   // a focused menu button handles its own activation
}

// ----- per-frame world effects -----
const _tint = new BABYLON.Vector4(1, 1, 1, 1);
function worldFX(dt) {
  const t = FX.t, live = G.state === 'play' || G.state === 'dead' || G.state === 'won';
  // fluorescent flicker signal for faulty tubes
  const n = noise1(t * 5.3) + 0.5 * noise1(t * 23.1 + 4);
  FX.flicker = n > -0.15 ? 0.82 + 0.18 * hash1(Math.floor(t * 60)) : 0.06;
  // global power: blackout event + surges when a Howler is near
  if (G.blackout > 0 && live) { G.blackout -= dt; if (G.blackout <= 0) { SFX.thunk(true); later(0.2, () => SFX.buzz(null)); FX.glitch = 1.2; } }
  const target = G.blackout > 0 ? 0.015 : 1;
  lsBase = target < lsBase ? damp(lsBase, target, 14, dt) : lsBase + (target - lsBase) * Math.min(1, dt * (hash1(Math.floor(t * 9)) < 0.35 ? 6 : 0.4));
  buzzCd -= dt;
  const surge = live && AI.flick > 0.05 && hash1(Math.floor(t * 13)) < AI.flick * 0.4;
  stutter = surge ? 0.3 + 0.2 * hash1(Math.floor(t * 40)) : damp(stutter, 1, 20, dt);
  if (surge && buzzCd <= 0) { buzzCd = rnd(1.2, 3); SFX.buzz(null); }
  FX.lightScale = lsBase * stutter;
  FX.hurt = Math.max(0, FX.hurt - dt * 0.9); FX.glitch = Math.max(0, FX.glitch - dt * 1.3);
  FX.fogDen = 0.028;
  // fog takes the colour of the light around the camera
  const cp = CAM.position, L = clamp(lightAt(cp.x, cp.z) * 1.1, 0.03, 1);
  FX.fog[0] = 0.15 * L; FX.fog[1] = 0.125 * L; FX.fog[2] = 0.065 * L;
  // exit: red sign glow / white void light
  const E = W.exit;
  if (E) {
    if (E.opening) { E.open = Math.min(1, E.open + dt * 0.35); E.hinge.rotation.y = -smooth(0, 1, E.open) * 1.75; setEmi(E.white, 9 * smooth(0, 0.6, E.open));
      setSlot(4, E.doorPos, 5 * smooth(0, 1, E.open) + 0.6, null, 0, [1, 0.97, 0.9], 16, true, 0.12);
      if (G.state === 'play' && E.open > 0.6 && dist2(PL.x, PL.z, E.doorPos.x, E.doorPos.z) < 1.35) win(); }
    else setSlot(4, E.signPos, (G.exitOn ? 1.3 + 0.6 * Math.sin(t * 5) : 0.8), null, 0, [1, 0.1, 0.05], 6.5, true, 0.8);
    if (G.exitOn && !E.opening && live && Math.floor(t / 2.2) !== Math.floor((t - dt) / 2.2)) SFX.alarm({ x: E.signPos.x, y: 2.4, z: E.signPos.z, pl: { x: PL.x, z: PL.z } });
  }
  // nearest static TV: flickering blue spill light + tape hiss
  let tv = null, td = 1e9; for (const v of W.tvs) { const d = dist2(v.x, v.z, cp.x, cp.z); if (d < td) { td = d; tv = v; } }
  const hs = HINT.stage >= 2 && HINT.site && G.state === 'play' ? HINT.site : null;
  if (hs && dist2(hs.x, hs.z, cp.x, cp.z) < 30) setSlot(5, hs.led, Math.floor(t * 2.2) % 2 ? 1.1 + HINT.stage * 0.2 : 0.12, null, 0, [1, 0.12, 0.05], 6, true, 0.9);
  else if (tv && td < 14) setSlot(5, { x: tv.x, y: 0.85, z: tv.z }, 0.55 * (0.7 + 0.3 * hash1(Math.floor(t * 24) + tv.seed)), null, 0, [0.62, 0.72, 1], 4.5, false, 1.4);
  else clearSlot(5);
  if (!hiss && AU.ctx) hiss = mkHissLoop();
  if (hiss && tv) { hiss.set(tv.x, 0.85, tv.z, PL.x, PL.z); setGain(hiss, live && td < 12 ? 0.5 * (1 - td / 12) : 0, 0.3); }
  if (W.scrMat) { _tint.w = 0.75 + 0.25 * hash1(Math.floor(t * 30)); W.scrMat.setVector4('aTint', _tint); }
  if (W.itemMat) setEmi(W.itemMat, 0.4 + 0.9 * Math.max(0, Math.sin(t * 2.6)) ** 6);
  for (const s of W.tapes) if (!s.taken) setEmi(s.mat, s === hs ? (Math.floor(t * 2.2) % 2 ? 5 : 0.2) : Math.floor(t * 1.4 + s.i) % 2 ? 1.6 : 0.15);
  // ambience
  if (AU.ctx) {
    const now = AU.ctx.currentTime, mute = AU.muted;
    AU.humG.gain.setTargetAtTime(mute ? 0 : 0.06 * clamp(L * 1.6, 0.05, 1) * (FX.lightScale > 0.1 ? 1 : 0), now, 0.08);
    AU.tenG.gain.setTargetAtTime(mute ? 0 : clamp(G.chase * 0.55 + PL.fear * 0.18, 0, 0.7) * (live ? 1 : 0), now, 0.6);
    AU.tenF.frequency.setTargetAtTime(280 + G.chase * 1500 + PL.fear * 300, now, 0.5);
  }
  // front-to-back sort for the wall chunks
  for (const m of LV.chunkMeshes) { const c = m.__c || (m.__c = m.getBoundingInfo().boundingBox.centerWorld.clone()); m._sortD = Math.hypot(c.x - cp.x, c.z - cp.z); }
}
function gameEvents(dt) {
  tapeHints(dt); places0Events(dt);
  if (G.diff === 2 && G.time > 80 && AI.crawler && !AI.crawler.active) AI.crawler.activate();
  G.radioT -= dt;
  if (G.radioT <= 0) { G.radioT = rnd(55, 95); const a = AI.exps.filter(e => e.alive && e.d > 12); if (a.length) { const e = pick(a), k = Math.floor(RNG() * 2); say(e.name, VO_TXT.chat[e.i][k], { radio: true, vo: `e${e.i}_chat${k}` }); } }
  G.ambT = (G.ambT ?? rnd(18, 30)) - dt;   // distant building noises
  if (G.ambT <= 0) { G.ambT = rnd(22, 48); const a = RNG() * 6.283, r = rnd(18, 32); SFX.far({ x: PL.x + Math.sin(a) * r, y: 1.6, z: PL.z + Math.cos(a) * r }); }
  G.hallT -= dt;
  if (PL.san < 40 && G.hallT <= 0) {
    G.hallT = rnd(7, 18) * (PL.san / 40 + 0.35); const k = RNG();
    if (k < 0.3) SFX.whisper();
    else if (k < 0.55) { const b = { x: PL.x - Math.sin(PL.yaw) * 4, y: 0.1, z: PL.z - Math.cos(PL.yaw) * 4, pl: { x: PL.x, z: PL.z } }; SFX.heavyStep(b); later(0.55, () => SFX.heavyStep(b)); }
    else if (k < 0.78) { const w = Math.floor(RNG() * VO_TXT.whisper.length); say('', '…' + VO_TXT.whisper[w].toLowerCase().replace(/[.?]$/, '') + '…', { vo: 'wh' + w, mode: 'whisper' }); }
    else { FX.glitch = 1.6; SFX.staticBurst(0.3, 0.4); }
  }
}

// ----- main loop -----
const DBG = { ts: 1 };
function frame() {   // r4.4: errors are caught and logged so one bad frame can't stop Babylon's render loop (a frozen tape)
  const dt = Math.min(ENG.getDeltaTime() / 1000, 0.05) * DBG.ts;
  try { frameSim(dt); } catch (e) { frameErr('frame', e); }
  if (G.state !== 'loading') { try { sknTick(dt); pushUniforms(); SCN.render(); } catch (e) { frameErr('render', e); } }
}
function frameSim(dt) {
  FX.t += dt; runTimers();
  switch (G.state) {
    case 'title': titleCam(dt); break;
    case 'intro': LVL === 18 ? introCam18(dt) : LVL === 5 ? introCam5(dt) : LVL === 9 ? introCam9(dt) : introCam(dt); break;
    case 'play': G.time += dt; updatePlayer(dt); if (LVL === 18) { updateAI18(dt); playerCamera(dt); gameEvents18(dt); } else if (LVL === 5) { updateAI5(dt); playerCamera(dt); gameEvents5(dt); } else if (LVL === 9) { updateAI9(dt); playerCamera(dt); gameEvents9(dt); } else { updateAI(dt); playerCamera(dt); gameEvents(dt); } break;
    case 'dead': LVL === 18 ? updateAI18(dt) : LVL === 5 ? updateAI5(dt) : LVL === 9 ? updateAI9(dt) : updateAI(dt); deathCam(dt); break;
    case 'won': LVL === 18 ? wonCam18(dt) : LVL === 5 ? wonCam5(dt) : LVL === 9 ? wonCam9(dt) : wonCam(dt); break;
  }
  if (G.state !== 'loading') {
    try { LVL === 18 ? worldFX18(dt) : LVL === 5 ? worldFX5(dt) : LVL === 9 ? worldFX9(dt) : worldFX(dt); } catch (e) { frameErr('world', e); }   // kept apart so the HUD still updates
    cpTick(dt); holdTick(dt); docTick(dt);
    if (G.state === 'play' || G.state === 'dead') updateHUD(dt);
    updateSubs(dt);
  }
}
function simStep(dt) {
  FX.t += dt; runTimers();
  switch (G.state) {
    case 'intro': LVL === 18 ? introCam18(dt) : LVL === 5 ? introCam5(dt) : LVL === 9 ? introCam9(dt) : introCam(dt); break;
    case 'play': G.time += dt; updatePlayer(dt); if (LVL === 18) { updateAI18(dt); playerCamera(dt); gameEvents18(dt); } else if (LVL === 5) { updateAI5(dt); playerCamera(dt); gameEvents5(dt); } else if (LVL === 9) { updateAI9(dt); playerCamera(dt); gameEvents9(dt); } else { updateAI(dt); playerCamera(dt); gameEvents(dt); } break;
    case 'dead': LVL === 18 ? updateAI18(dt) : LVL === 5 ? updateAI5(dt) : LVL === 9 ? updateAI9(dt) : updateAI(dt); deathCam(dt); break;
    case 'won': LVL === 18 ? wonCam18(dt) : LVL === 5 ? wonCam5(dt) : LVL === 9 ? wonCam9(dt) : wonCam(dt); break;
  }
  LVL === 18 ? worldFX18(dt) : LVL === 5 ? worldFX5(dt) : LVL === 9 ? worldFX9(dt) : worldFX(dt); cpTick(dt); holdTick(dt); docTick(dt); updateSubs(dt);
}
async function buildScene() {
  const prog = (p, m) => { $('loadFill').style.width = (p * 100).toFixed(0) + '%'; $('loadMsg').textContent = m; };
  RNG = mulberry32((Math.random() * 4294967296) >>> 0);
  await buildWorld(prog, G.diff);
  setupPost(+S.qual); applySettings();
  resetPlayer(); titleInit(); titleCam(0.016);
  CAM.getViewMatrix(true);
  pushUniforms();
  await new Promise(r => SCN.executeWhenReady(() => r()));
  prog(1, 'READY'); await nextFrame();
}
async function boot() {
  try {
    if (!window.BABYLON) throw new Error('Babylon.js failed to load (check your connection).');
    ENG = new BABYLON.Engine($('c'), false, { stencil: false, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: false }, false);
    bindUI(); bindInput($('c'));
    addEventListener('resize', () => { ENG.resize(); applyQuality(+S.qual); });
    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) hadLock = true;
      else if (G.state === 'play' && hadLock) pauseGame();
    });
    await buildScene();
    ENG.runRenderLoop(frame);
    G.state = 'title'; show('title'); titleL9();
    if (/[?&]level=9/.test(location.search)) { G.state = 'title'; goLevel9(null); }
    else if (/[?&]level=18/.test(location.search)) { G.state = 'title'; goLevel18(null); }
    else if (/[?&]level=5/.test(location.search)) { G.state = 'title'; goLevel5(null); }
  } catch (e) {
    console.error(e); $('loadMsg').textContent = 'TRACKING ERROR: ' + (e && e.message || e);
  }
}
function titleL9() { let ok = false; try { ok = localStorage.getItem('br_l9') === '1'; } catch (e) {} $('btnL9').classList.toggle('hide', !ok); }
