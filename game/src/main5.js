// ---------- Level 5 · The Hotel: game flow, story beats, per-frame world effects ----------
const G5 = { from: null };
function resetG5() {
  const from = G5.from; for (const k of Object.keys(G5)) delete G5[k];
  Object.assign(G5, { from, phase: 'arrive', keys: 0, valves: 0, loops: 0, loopHint: false, tp: null, tpCd: 0, vest: null, vestS: 0, warps: 0,
    stareP: null, stareT: 0, eyeF: null, eyeW: 0, eyeT: 0, ambush: 0, ambushT: rnd(16, 28), eyeTip: false, eyeSnd: 0, hallT: 20, knockT: rnd(25, 45), ambT: rnd(18, 30),
    elevT: 0, doorT: 0, bells: 0, endWon: false, turning: null, mothSeen: false, jazz: null, rumble: null, clockT: 0, noteRead: false, boilSeen: false, staffTried: false, expK: 1.2, drawT: 0 });
}
resetG5();
DEATH_TXT.moth = ['THE MOTHS CAME FOR YOUR LIGHT', 'The last frames are nothing but wings and dust.'];
const L5_TXT = {   // r6: rewritten with the dialogue skill (text only, as before)
  arrive: 'Nine. That car doesn\'t go up. You\'re in the hotel.',
  arrive2: 'Way out is under the boilers. The staff door is in the ballroom. Three locks.',
  eyes: 'Nine. Eyes off the wallpaper. Last man who counted the roses lost an hour.',
  moth: 'Moths. Kill your light. Let them have the lamps.',
  loop: 'Your room numbers just repeated on my end. Turn around. Last door of the north wing says EAST WING. Try that one.',
  keys: 'That\'s three. Staff door, south wall of the ballroom, right of the arch.',
  master: 'Where did you get a master key? No. Don\'t tell me. Ballroom, staff door.',
  stairs: 'Service stairs. Down.',
  boil: 'Boilers. Pressure is holding the exit shut. Three halls, three valves.',
  valve: 'One down. Watch the dark.',
  exit: 'Exit\'s released. East end. Go.',
};
function radio5(key, delay = 0) { const [who, t] = radio5who(key); if (t) say(who, t, { radio: true, delay }); }
function obj5() {
  switch (G5.phase) {
    case 'arrive': case 'keys': return `FIND THE HOUSEKEEPING KEYS · ${G5.keys}/3` + (P5.pr === 'asked' && !P5.master && LV.pruitt ? ` · OR RYE FOR ${pruittNum5()}` : '');
    case 'staff': return 'UNLOCK THE STAFF DOOR · BEVERLY ROOM';
    case 'stairs': return 'TAKE THE SERVICE STAIRS DOWN';
    case 'valves': return `VENT THE BOILERS · VALVES ${G5.valves}/3`;
    case 'fire': return objState5();
    case 'exit': return 'REACH THE EMERGENCY EXIT';
  }
  return '';
}
function setPhase5(p) { if (p) G5.phase = p; objective(obj5()); tasks5(); }

// ----- story actions -----
function takeKey5(k) {
  if (k.taken) return;
  k.taken = true; k.mesh.setEnabled(false); G5.keys++; SFX5.jingle(P9(k)); SFX.pickup(); makeNoise(0.12);
  toast(`HOUSEKEEPING KEY · ${WING5[k.id]} · ${G5.keys}/3`, 2.4);
  if (G5.keys >= 3) { setPhase5('staff'); radio5('keys', 0.8); } else setPhase5('keys');
  cpSave(`KEY ${G5.keys}/3`);
}
function unlockStaff5(dr) {
  dr.locked = false; SFX5.unlock(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.2);
  later(1.3, () => { setDoor(dr, true); });
  toast('STAFF DOOR UNLOCKED', 2); setPhase5('stairs'); radio5('stairs', 1.6); cpSave('STAFF DOOR');
  if (LV.st5 && !ST5.reset) later(14, () => { if (LVL === 5 && G.state === 'play' && !ST5.reset) radioSt5('fire0'); });   // r7
}
function startValve5(v) {
  if (v.turned || G5.turning) return;
  G5.turning = { v, t: 0 }; SFX5.squeal(P9(v), 2.2); makeNoise(0.55);
}
function finishValve5(v) {
  v.turned = true; G5.turning = null; G5.valves++;
  SFX9.hiss(P9(v.steam), 5); later(0.4, () => SFX5.pipes(P9(v.steam))); FX.glitch = Math.max(FX.glitch, 0.5); PL.shake = Math.max(PL.shake, 0.5);
  W5.steam.push({ x: v.steam.x, z: v.steam.z, t: 0 });
  wakeBoiler5(v, G5.valves >= 2);
  if (G5.valves >= 3 && LV.st5 && !ST5.reset) { setPhase5('fire'); radioSt5('fire', 1.2); later(0.6, () => SFX9.rattle(P9(W5.exit))); toast('ALL VALVES VENTED · THE EXIT IS STILL LOCKED', 3); }   // r7: the fire lock
  else if (G5.valves >= 3) { setPhase5('exit'); drawExit5(true); radio5('exit', 1.2); later(0.6, () => SFX9.klaxon(P9(W5.exit))); toast('ALL VALVES VENTED · THE EXIT IS OPEN', 3); }
  else { setPhase5(); toast(`VALVE ${G5.valves}/3 · PRESSURE DROPPING`, 2.4); if (G5.valves === 1) radio5('valve', 1); }
  cpSave(`VALVE ${G5.valves}/3`);
}
function useExit5() {
  if (G5.phase !== 'exit') {
    SFX9.rattle(P9(W5.exit)); makeNoise(0.2);
    if (LV.st5 && !ST5.reset) { ST5.lockSeen = true; toast(G5.valves >= 3 ? 'FIRE LOCK ENGAGED · RESET AT SECURITY' : 'SEALED · BOILER PRESSURE AND A FIRE LOCK', 2.6); fireTasks5(); setPhase5(); return; }
    toast('SEALED · THE BOILER PRESSURE HOLDS IT SHUT', 2.4); return;
  }
  win5();
}
function ringBell5() {
  G5.bells++; SFX5.bell(P9(W5.bell)); makeNoise(0.25);
  if (G5.bells === 3) later(2.6, () => { const a = RNG() * TAU; SFX5.bell({ x: PL.x + Math.sin(a) * 22, y: 1.2, z: PL.z + Math.cos(a) * 22, pl: { x: PL.x, z: PL.z }, ref: 5, roll: 0.8 }, true); });   // somewhere, a bell answers
}
function readNote5() {
  SFX.click(); G5.noteRead = true;
  readDoc('note5', 'NOTE ON THE FRONT DESK', ['Night shift: I moved the spare housekeeping keys to the wing closets. West, North, East. Third time this month somebody walked off with the ring.', 'East closet: take the door marked EAST WING at the end of the north wing.', 'Do not walk the east corridor. You will be at it till breakfast.'], { kind: 'note' });   // r6
  if (G5.phase === 'arrive') setPhase5('keys');
}
function closeElev5() {
  const E = W5.elev; if (!E || !E.want) return;
  E.want = 0; E.gone = true; LV.solids[E.sol].off = false; markDyn(E.x - DOORW / 2, E.z - WT / 2, E.x + DOORW / 2, E.z + WT / 2, 1); LV.navVer++;
  SFX9.ding(P9(E.light)); later(1.4, () => SFX9.elevator(P9(E.light)));
}
function callElev5() {
  const c = W5.callBtn; c.press = 1; SFX5.click(P9(c));
  later(1.8, () => SFX9.ding({ x: c.x, y: -6, z: c.z, pl: { x: PL.x, z: PL.z } }));
  G5.calls = (G5.calls || 0) + 1; toast(G5.calls > 2 ? 'NOBODY IS COMING' : 'THE CAR IS NOT COMING BACK', 2);
}

// ----- level transition -----
function carryFrom9() { return { hp: PL.hp, san: PL.san, batt: PL.batt, spare: PL.spare, water: PL.water, time: G.time, dist: PL.dist, lost: G.lost, tapes: G.tapes }; }
// sounds from the other floor (hotel above, boilers below) come from above / below you
function remap5(x, y, z) {
  const c = CAM.position, lb = boilZ5(LV.zone[cIdx(cellOf(c.x), cellOf(c.z))]), sb = boilZ5(LV.zone[cIdx(cellOf(x), cellOf(z))]);
  return lb === sb ? [x, y, z] : [x, y + (lb ? 9 : -9), z];
}
function teardown5() {
  for (const k of ['jazz', 'rumble']) { const v = G5[k]; if (!v) continue; try { if (v.src) v.src.stop(); (v.v ? v.v.g : v.g).disconnect(); if (v.bed) v.bed.disconnect(); } catch (e) {} G5[k] = null; }
  if (AI5.fl) { try { AI5.fl.g.disconnect(); } catch (e) {} AI5.fl = null; }
  document.body.classList.remove('lvl5');
  teardownPortal5();   // r7
}
async function goLevel5(from) {
  const f = Object.assign({ hp: 100, san: 100, batt: [100, 90, 75][G.diff], spare: [2, 1, 1][G.diff], water: [3, 1, 1][G.diff], time: 0, dist: 0, lost: 0, tapes: 4 }, from || G5.from || {});
  G5.from = Object.assign({}, f);
  G.state = 'loading'; show('loading'); $('osd').classList.add('hide'); $('touch').classList.add('hide'); $('blue').classList.add('hide');
  $('loadOsd').textContent = '▶ LEVEL 5 · THE HOTEL'; $('loadFill').style.width = '0%';
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  teardownScene();
  LVL = 5; setDims(L5_N, L5_LMR); document.body.classList.remove('lvl9'); document.body.classList.add('lvl5'); AU.remap = remap5;
  resetG5(); resetP5(); resetST5(); tasksReset('LEVEL 5 · THE HOTEL');
  const prog = (p, m) => { $('loadFill').style.width = (p * 100).toFixed(0) + '%'; $('loadMsg').textContent = m; };
  RNG = mulberry32((Math.random() * 4294967296) >>> 0);
  await buildWorld5(prog);
  setupPost(+S.qual); applySettings();
  Object.assign(PL, { x: cellCenter(16), z: cellCenter(29) + 0.4, yaw: Math.PI, pitch: 0, vx: 0, vz: 0, kx: 0, kz: 0, crouch: false, ck: 0, sta: 1, exh: false,
    hp: Math.max(f.hp, 75), san: Math.max(f.san, 75), batt: Math.max(f.batt, 60), spare: f.spare, water: f.water, flash: false, fk: 0, nv: false, zoomT: false, zk: 0,
    noise: 0, dist: f.dist, lastHurt: -99, shake: 0, cell: -1, fear: 0, lookAt: null, lookK: 0, focus: null, interf: 0 });
  updateField();
  Object.assign(G, { time: f.time, lost: f.lost, tapes: f.tapes, cause: '', blackout: 0, exitOn: false, chase: 0, hintT: 0, grace: 0 });
  HINT.stage = 0; HINT.site = null;
  initAI5();
  Object.assign(FX, { envA: [0.02, 0.014, 0.009, 1], envS: [0.05, 0.035, 0.02, 0], fadeW: 0, fadeB: 1 });
  CAM.position.set(PL.x, 1.6, PL.z); CAM.rotation.set(0, PL.yaw, 0); CAM.getViewMatrix(true); worldFX5(0.016); pushUniforms();
  await new Promise(r => SCN.executeWhenReady(() => r()));
  prog(1, 'READY'); await nextFrame();
  try { localStorage.setItem('br_l5', '1'); } catch (e) {}
  hideScreens(); G.state = 'intro'; INTRO.t = 0; SFX.tape();
}
function startLevel5Menu() {
  if (G.state !== 'title') return;
  audioInit(S.vol); if (AU.ctx.state === 'suspended') AU.ctx.resume();
  applySettings(); lockPointer(); G5.from = null; goLevel5(null);
}
function introCam5(dt) {   // the car settles, the bell dings, the brass doors open on the lobby
  INTRO.t += dt; const t = INTRO.t, E = W5.elev;
  if (t < 0.05) { FX.glitch = 1.8; SFX.staticBurst(0.3, 0.6); }
  FX.fadeW = 0; FX.fadeB = 1 - smooth(0.1, 1.2, t);
  if (E && t > 1.3 && !E.want && !E.gone) { E.want = 1; SFX9.ding(P9(E.light)); }
  const k = smooth(1.2, 3.6, t);
  CAM.position.set(PL.x + noise1(FX.t * 0.8) * 0.01, lerp(1.58, 1.62, k) + (t < 1.2 ? Math.sin(t * 30) * 0.004 * (1.2 - t) : 0), PL.z);
  CAM.rotation.set(lerp(0.12, 0, k) + noise1(FX.t * 1.3) * 0.01, PL.yaw, noise1(FX.t * 0.5) * 0.01);
  CAM.fov = S.fov * Math.PI / 180;
  if (t > 3.8) beginPlay5();
}
function beginPlay5() {
  G.state = 'play'; FX.fadeW = 0; FX.fadeB = 0; PL.pitch = 0;
  $('osd').classList.remove('hide'); if (IS_TOUCH) $('touch').classList.remove('hide');
  setPhase5('arrive'); cpSave('LEVEL START', { x: PL.x, z: PL.z, yaw: PL.yaw, quiet: true });
  later(1.2, () => radio5('arrive')); later(9, () => radio5('arrive2')); arrive5extra();
  later(24, () => toast(IS_TOUCH ? 'THE LIGHT BUTTON TOGGLES YOUR FLASHLIGHT' : '[F] FLASHLIGHT — BUT LIGHT DRAWS THINGS IN', 3.6));
}
function win5() {
  if (G.state !== 'play') return;
  G.state = 'won'; DEATH.t = 0; DEATH.shown = false; clearSlot(0); $('prompt').classList.remove('show');
  G5.wc = { x: CAM.position.x, z: CAM.position.z, yaw: CAM.rotation.y, pitch: CAM.rotation.x };
  SFX9.creak(P9(W5.exit), true);
  try { const b = +localStorage.getItem('br_best5'); if (!b || G.time < b) localStorage.setItem('br_best5', Math.floor(G.time)); } catch (e) {}
}
function wonCam5(dt) {
  DEATH.t += dt; const t = DEATH.t, X = W5.exit, w = G5.wc, k1 = smooth(0, 1.6, t), tx = X.x - 0.2;
  X.open = Math.min(1, X.open + dt * 0.8); X.pv.rotation.y = -Math.PI / 2 + 1.45 * smooth(0, 1, X.open); setEmi(X.wm, 7 * smooth(0, 1, X.open));
  CAM.position.set(lerp(w.x, tx + smooth(2.2, 4.4, t) * 1.2, k1), 1.6 + noise1(FX.t * 1.1) * 0.01, lerp(w.z, X.z, k1));
  CAM.rotation.set(lerp(w.pitch, 0, k1), w.yaw + angDiff(w.yaw, Math.PI / 2) * k1, noise1(FX.t * 0.5) * 0.01);
  FX.fadeW = smooth(2.6, 4.8, t); FX.glitch = Math.max(FX.glitch, t > 4 ? 0.6 : 0);
  if (t > 5.4 && !DEATH.shown) { DEATH.shown = true; G5.endWon = true; flags5(); goLevel18(carryFrom5()); }
}
function showEnd5(won) {
  if (document.pointerLockElement) document.exitPointerLock();
  $('osd').classList.add('hide'); $('touch').classList.add('hide');
  G5.endWon = won;
  const [title, text] = won ? ['YOU ESCAPED THE HOTEL', `The emergency door opens on white. Behind you the band plays on to an empty room.${G.lost ? ` ${G.lost} member${G.lost > 1 ? 's' : ''} of the expedition never made it out of Level 0.` : ''}`] : (DEATH_TXT[G.cause] || DEATH_TXT.moth);
  $('endKicker').textContent = won ? 'CHECKED OUT · END OF RECORDING' : '■ SIGNAL LOST · LEVEL 5';
  $('endTitle').textContent = title; $('endText').textContent = text;
  const st = [['TIME ON TAPE', fmtTC(G.time)], ['DISTANCE', Math.round(PL.dist) + ' M'], ['KEYS', G5.keys + '/3'], ['VALVES', G5.valves + '/3'], ['LEVEL', '5 · THE HOTEL'], ['DIFFICULTY', DIFFS[G.diff]]];
  $('endStats').innerHTML = st.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  $('btnAgain').textContent = won ? '▶ PLAY AGAIN (LEVEL 0)' : '▶ RETRY LEVEL 5';
  show('end');
}

// ----- per-frame story events -----
function startTp5(down) {
  G5.tp = down ? { t: 0, x: cellCenter(LV.arrive5.x), z: LV.arrive5.y * CELL + 2.5, yaw: 0, down } : { t: 0, x: cellCenter(LV.svStair.x), z: LV.svStair.y * CELL - 0.8, yaw: Math.PI, down };
  for (let i = 0; i < 7; i++) later(i * 0.14, () => SFX.step(1, false));
  makeNoise(0.15);
}
// the wallpaper: find the spot on the wall you are looking at
function stareHit5() {
  const c = CAM.position, f = CAM.getDirection(BABYLON.Axis.Z), h = Math.hypot(f.x, f.z); if (h < 0.25) return null;
  const hz = z => hotelZ5(z) && z !== Z5.ELEV;
  if (!hz(LV.zone[cIdx(cellOf(c.x), cellOf(c.z))])) return null;
  const ux = f.x / h, uz = f.z / h, R = 6;
  if (los(c.x, c.z, c.x + ux * R, c.z + uz * R)) return null;
  let lo = 0, hi = R; for (let i = 0; i < 9; i++) { const m = (lo + hi) / 2; if (los(c.x, c.z, c.x + ux * m, c.z + uz * m)) lo = m; else hi = m; }
  const y = c.y + f.y / h * lo; if (y < 1.02 || y > 2.58) return null;
  const x = c.x + ux * lo, z = c.z + uz * lo;
  if (!hz(LV.zone[cIdx(cellOf(x - ux * 0.15), cellOf(z - uz * 0.15))]) && LV.zone[cIdx(cellOf(x - ux * 0.15), cellOf(z - uz * 0.15))] !== Z5.ROOM) return null;
  const i = Math.floor((x + ux * 0.2) / LMS), j = Math.floor((z + uz * 0.2) / LMS), k = j * LMR + i;
  if (k >= 0 && k < LMR * LMR && LV.dyn[k] === 1 && LV.solid[k] !== 1) return null;   // a closed door, not wallpaper
  return { x, y, z };
}
const d3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
function eyes5(dt) {
  G5.eyeT -= dt;
  if (G5.eyeT <= 0) {
    G5.eyeT = 0.1;
    const h = G.state === 'play' ? stareHit5() : null;
    if (h && G5.stareP && d3(h, G5.stareP) < 0.9) G5.stareT += 0.1; else { G5.stareP = h; G5.stareT = 0; }
  }
  if (G5.eyeW < 0.03 && G5.stareP && G5.ambush <= 0) G5.eyeF = G5.stareP;
  const onF = !!(G5.eyeF && G5.stareP && d3(G5.stareP, G5.eyeF) < 1.3), need = [3.4, 2.8, 2.2][G.diff];
  let want = onF && G5.stareT > need ? 1 : 0;
  if (G5.ambush > 0) { G5.ambush -= dt; want = Math.max(want, 0.85); }
  G5.eyeW = approach(G5.eyeW, want, want > G5.eyeW ? 0.8 : 1.5, dt);
  if (G5.eyeF) W5.eyeP.set(G5.eyeF.x, G5.eyeF.y, G5.eyeF.z, G5.eyeW); else W5.eyeP.w = 0;
  if (G.state !== 'play') return;
  if (G5.eyeW > 0.45 && onF) {
    PL.san = Math.max(0, PL.san - 3 * [0.7, 1, 1.3][G.diff] * dt); FX.glitch = Math.max(FX.glitch, 0.25); PL.fear = Math.max(PL.fear, 0.5);
    if (G5.eyeSnd <= 0) { G5.eyeSnd = 4; SFX5.eyes(); }
    if (!G5.eyeTip) { G5.eyeTip = true; toast("DON'T STARE AT THE WALLPAPER", 3); radio5('eyes', 1.5); }
  }
  G5.eyeSnd -= dt;
  // when your mind is going, they open on their own
  if (PL.san < 40) {
    G5.ambushT -= dt;
    if (G5.ambushT <= 0) { G5.ambushT = rnd(14, 26) * (0.5 + PL.san / 80); const h = stareHit5(); if (h) { G5.eyeF = h; G5.ambush = 2.4; SFX.whisper(); FX.glitch = Math.max(FX.glitch, 0.8); } }
  }
}
function gameEvents5(dt) {
  const pc = cIdx(cellOf(PL.x), cellOf(PL.z)), zc = LV.zone[pc];
  places5Events(dt);
  // service stairs <-> boiler room (fade through black)
  if (G5.tp) {
    const T = G5.tp; T.t += dt; FX.fadeB = T.t < 0.3 ? T.t / 0.3 : Math.max(0, 1 - (T.t - 0.45) / 0.45);
    if (!T.moved && T.t >= 0.3) {
      T.moved = true; PL.x = T.x; PL.z = T.z; PL.yaw = T.yaw; PL.vx = PL.vz = 0; PL.cell = -1; updateField();
      if (T.down && !G5.boilSeen) { G5.boilSeen = true; if (G5.phase === 'stairs' || G5.phase === 'staff') setPhase5('valves'); radio5('boil', 1.0); cpSave('BOILER ROOM'); }
    }
    if (T.t > 0.9) { G5.tp = null; FX.fadeB = 0; G5.tpCd = 0.8; }
  } else if ((G5.tpCd -= dt) <= 0 && G.state === 'play') {
    const s = LV.svStair, a = LV.arrive5, cx = cellOf(PL.x), cz = cellOf(PL.z);
    if (cx === s.x && cz === s.y && PL.z > s.y * CELL + 0.75 && PL.vz > 0.3) startTp5(true);
    else if (cx === a.x && cz === a.y && PL.z < a.y * CELL + 2.05 && PL.vz < -0.3) startTp5(false);
  }
  // the east wing: past room 569 you are quietly back at room 564
  if (cellOf(PL.z) === LOOP5.z && PL.x > LOOP5.trig * CELL + 1.0 && PL.x < (LOOP5.x1 + 1) * CELL) {
    PL.x -= LOOP5.back * CELL; PL.cell = -1; updateField(); G5.loops++;
    if (G5.loops === 2 && !G5.loopHint) { G5.loopHint = true; later(0.5, () => toast('THE ROOM NUMBERS ARE REPEATING', 2.6)); radio5('loop', 3); }
  }
  portalCross5();   // r7: the inner doors
  state5Events(dt);
  eyes5(dt);
  // the elevator leaves once you have stepped out
  const E = W5.elev;
  if (E && E.want && !E.gone) { const inCar = cellOf(PL.x) === 16 && cellOf(PL.z) === 29; if (!inCar && dist2(PL.x, PL.z, E.x, E.z) > 2.0) { G5.elevT += dt; if (G5.elevT > 2.5) closeElev5(); } else G5.elevT = 0; }
  // valve being turned
  if (G5.turning) {
    const T = G5.turning; T.t += dt; T.v.ang -= dt * 2.6; PL.shake = Math.max(PL.shake, 0.12);
    if (dist2(PL.x, PL.z, T.v.x, T.v.z) > 2.5) { G5.turning = null; toast('YOU LET GO OF THE VALVE', 1.6); }
    else if (T.t >= 2.2) finishValve5(T.v);
  }
  // the hotel wears on you (the endless corridor most of all)
  let dr = hotelZ5(zc) || zc === Z5.ROOM ? 0.06 : zc === Z5.BEV ? 0.03 : boilZ5(zc) ? 0.05 : 0.02;
  if (LV.reg[pc] === R5.E) dr += 0.3;
  PL.san = Math.max(0, PL.san - dr * [0.6, 1, 1.3][G.diff] * dt);
  // someone knocking from inside one of the rooms that aren't rooms
  G5.knockT -= dt;
  if (G5.knockT <= 0) {
    G5.knockT = rnd(28, 55) * (PL.san < 50 ? 0.55 : 1);
    let best = null, bd = 9; for (const e of LV.ek.values()) { if (e.kind !== 'deco' || e.bev) continue; const [mx, mz] = edgeMid(e.x, e.y, e.d), d = dist2(mx, mz, PL.x, PL.z); if (d > 3.5 && d < bd) { bd = d; best = [mx, mz]; } }
    if (best && hotelZ5(zc)) SFX5.knock({ x: best[0], y: 1.3, z: best[1], pl: { x: PL.x, z: PL.z } }, RNG() < 0.5 ? 3 : 2);
  }
  // distant hotel noises; the boilers groan
  G5.ambT -= dt;
  if (G5.ambT <= 0) {
    G5.ambT = rnd(18, 36); const a = RNG() * TAU, r = rnd(16, 28), p = { x: PL.x + Math.sin(a) * r, y: 1.2, z: PL.z + Math.cos(a) * r, pl: { x: PL.x, z: PL.z }, ref: 5, roll: 0.9 }, k = RNG();
    if (boilZ5(zc)) { if (k < 0.6) SFX5.pipes(p); else SFX9.hiss(p, 3); }
    else if (k < 0.3) SFX9.shut(p, false); else if (k < 0.5) SFX9.ding({ x: p.x, y: -4, z: p.z, pl: p.pl }); else if (k < 0.75) SFX.far(p); else SFX5.bell(p, true);
  }
  // clocks tick near you
  G5.clockT -= dt;
  if (G5.clockT <= 0) { G5.clockT = 1; let bc = null, bd = 8; for (const c of W5.clocks) { const d = dist2(c[0], c[2], PL.x, PL.z); if (d < bd) { bd = d; bc = c; } } if (bc) SFX5.tick({ x: bc[0], y: bc[1], z: bc[2], pl: { x: PL.x, z: PL.z } }, Math.floor(FX.t) % 2); }
  // low sanity: whispers, footsteps behind you, static
  G5.hallT -= dt;
  if (PL.san < 40 && G5.hallT <= 0) {
    G5.hallT = rnd(7, 18) * (PL.san / 40 + 0.35); const k = RNG();
    if (k < 0.3) SFX.whisper();
    else if (k < 0.55) { const b = { x: PL.x - Math.sin(PL.yaw) * 4, y: 0.1, z: PL.z - Math.cos(PL.yaw) * 4, pl: { x: PL.x, z: PL.z } }; SFX.heavyStep(b); later(0.55, () => SFX.heavyStep(b)); }
    else if (k < 0.78) { if (RNG() < 0.6) whisper5(); else { const w = Math.floor(RNG() * VO_TXT.whisper.length); say('', '…' + VO_TXT.whisper[w].toLowerCase().replace(/[.?]$/, '') + '…', { vo: 'wh' + w, mode: 'whisper' }); } }   // r6: the hotel's own whispers
    else { FX.glitch = 1.6; SFX.staticBurst(0.3, 0.4); }
  }
}

// ----- per-frame world effects -----
function worldFX5(dt) {
  const t = FX.t, live = G.state === 'play' || G.state === 'dead' || G.state === 'won', cp = CAM.position;
  const n = noise1(t * 4.1) + 0.5 * noise1(t * 19.3 + 4);
  FX.flicker = n > -0.2 ? 0.84 + 0.16 * hash1(Math.floor(t * 50)) : 0.08;
  const surge = live && AI.flick > 0.05 && hash1(Math.floor(t * 13)) < AI.flick * 0.4;
  stutter = surge ? 0.35 + 0.2 * hash1(Math.floor(t * 40)) : damp(stutter, 1, 20, dt);
  FX.lightScale = stutter;
  FX.hurt = Math.max(0, FX.hurt - dt * 0.9); FX.glitch = Math.max(0, FX.glitch - dt * 1.3);
  const cc = cIdx(cellOf(cp.x), cellOf(cp.z)), zc = LV.zone[cc], boil = boilZ5(zc), loop = LV.reg[cc] === R5.E, L = clamp(lightAt(cp.x, cp.z) * 1.1, 0, 1);
  FX.fogDen = loop ? 0.075 : boil ? 0.05 : zc === Z5.BEV || zc === Z5.EXEC || zc === Z5.REST ? 0.026 : 0.034;
  const wk = boil ? [0.07, 0.045, 0.025] : [0.1, 0.075, 0.045];
  FX.fog[0] = lerp(0.02, wk[0], L); FX.fog[1] = lerp(0.014, wk[1], L); FX.fog[2] = lerp(0.01, wk[2], L);
  G5.expK = damp(G5.expK ?? 1.2, zc === Z5.BEV || zc === Z5.EXEC ? 1.0 : boil ? 1.3 : 1.15, 2, dt);
  if (G.state === 'play') FX.exposure = 0.85 * S.bright * G5.expK * lerp(1, clamp(0.3 / Math.max(PL.light, 0.01), 0.22, 1), FX.nv);
  if (W5.lensFl) setEmi(W5.lensFl, 4.2 * FX.flicker * FX.lightScale);
  if (W5.fireMat) { const f = 0.75 + 0.25 * noise1(t * 7) + 0.1 * hash1(Math.floor(t * 20)); setEmi(W5.fireMat, 3.2 * f, 1.5 * f, 0.5 * f); }
  if (W.itemMat) setEmi(W.itemMat, 0.4 + 0.9 * Math.max(0, Math.sin(t * 2.6)) ** 6);
  if (W5.eyeMat) W5.eyeMat.setVector4('eyeP', W5.eyeP);
  // doors: distance culling + swing animation
  G5.doorT -= dt;
  if (G5.doorT <= 0) { G5.doorT = 0.25; for (const dr of W9.doors) { const on = dist2(dr.mx, dr.mz, cp.x, cp.z) < dr.cull; if (dr.vis !== on) { dr.vis = on; dr.mesh.setEnabled(on); } } }
  updateDoors9(dt);
  // elevator doors slide into the walls
  const E = W5.elev;
  if (E) {
    const prev = E.open; E.open = approach(E.open, E.want, 0.75, 0.75, dt);
    if (E.open !== prev) { const k = smooth(0, 1, E.open); E.leaves.forEach((m, i) => { const s = i ? 1 : -1; m.position.x = E.x + s * (DOORW / 4 + (DOORW / 2 - 0.02) * k); }); if (E.open > 0.6 && E.want) { LV.solids[E.sol].off = true; markDyn(E.x - DOORW / 2, E.z - WT / 2, E.x + DOORW / 2, E.z + WT / 2, 0); } }
  }
  if (W5.callBtn) { const c = W5.callBtn; c.press = Math.max(0, c.press - dt * 0.6); setEmi(c.mat, 0.4 + 3 * c.press, 0.25 + 1.8 * c.press, 0.1 + 0.6 * c.press); }
  // valves + gauges
  for (const v of W5.valves) { v.mesh.rotation.z = v.ang; if (v.needle) v.needle.rotation.z = damp(v.needle.rotation.z, v.turned ? 0.9 : -1.1 + 0.05 * Math.sin(t * 9 + v.i), 1.5, dt); }
  // dynamic slots: 3 nearest firebox, 4 exit sign glow, 5 elevator car / steam
  let bf = null, bd = 14; for (const f of W5.fires) { const d = dist2(f.x, f.z, cp.x, cp.z); if (d < bd) { bd = d; bf = f; } }
  if (bf) setSlot(3, { x: bf.x, y: 0.75, z: bf.z }, 1.3 * (0.8 + 0.25 * noise1(t * 6 + bf.seed * 9)), null, 0, [1, 0.45, 0.14], 6.5, true, 0.7); else clearSlot(3);
  const X = W5.exit;
  if (X && dist2(X.x, X.z, cp.x, cp.z) < 16) { const on = X.on, fl = on ? 1 : (Math.floor(t * 1.4) % 2 ? 1 : 0.25); setSlot(4, X.lamp, (G.state === 'won' ? 2.5 : 0.8) * fl, null, 0, on ? [0.25, 1, 0.4] : [1, 0.1, 0.05], 6, true, 0.8); } else clearSlot(4);
  if (E && (E.open > 0.01 || INTRO.t < 1.5)) setSlot(5, E.light, 1.1 * Math.max(E.open, G.state === 'intro' ? 1 : 0), null, 0, [1, 0.88, 0.66], 5, true, 0.6); else clearSlot(5);
  // audio: the band, the boilers, tension
  if (AU.ctx) {
    const now = AU.ctx.currentTime, mute = AU.muted;
    if (!G5.jazz && AU.jazz5 && W5.gramo) G5.jazz = mkJazz5();
    if (!G5.rumble) G5.rumble = mkRumble5();
    const J = G5.jazz;
    if (J) {
      J.v.set(W5.gramo.x, W5.gramo.y, W5.gramo.z, PL.x, PL.z);
      setGain(J.v, live || G.state === 'intro' ? (boil ? 0 : 0.55) : 0.2, 0.5);
      J.bed.gain.setTargetAtTime(mute ? 0 : (boil ? 0.0 : zc === Z5.BEV ? 0.0 : loop ? 0.09 : 0.05) * (live || G.state === 'intro' ? 1 : 0.4), now, 0.8);
      J.src.playbackRate.setTargetAtTime(1 - 0.05 * FX.san + 0.012 * FX.san * Math.sin(t * 0.9), now, 0.3);
    }
    G5.rumble.g.gain.setTargetAtTime(mute ? 0 : boil ? 0.16 : 0.012, now, 1.0);
    AU.humG.gain.setTargetAtTime(0, now, 0.2);
    AU.tenG.gain.setTargetAtTime(mute ? 0 : clamp(G.chase * 0.55 + PL.fear * 0.18, 0, 0.7) * (live ? 1 : 0), now, 0.6);
    AU.tenF.frequency.setTargetAtTime(280 + G.chase * 1500 + PL.fear * 300, now, 0.5);
  }
  for (const m of LV.chunkMeshes) { const c2 = m.__c || (m.__c = m.getBoundingInfo().boundingBox.centerWorld.clone()); m._sortD = Math.hypot(c2.x - cp.x, c2.z - cp.z); }
  portalTick5(dt);   // r7: after the camera is final
}

// ----- HUD helpers -----
function target5() {
  const pc = cIdx(cellOf(PL.x), cellOf(PL.z)), inBoil = boilZ5(LV.zone[pc]), reg = LV.reg[pc];
  const stairs = { x: cellCenter(LV.svStair.x), z: LV.svStair.y * CELL + 0.4 };
  const near = arr => { let b = null, bd = 1e9; for (const o of arr) { const d = dist2(o.x, o.z, PL.x, PL.z); if (d < bd) { bd = d; b = o; } } return b; };
  switch (G5.phase) {
    case 'arrive': case 'keys': {
      const left = W5.keys.filter(k => !k.taken); if (!left.length) return null;
      const e = left.find(k => k.id === 'E');
      if (e && (reg === R5.E2 || left.length === 1)) {   // the east key: through the wrong door, once you know the corridor loops
        if (reg === R5.E2) return e;
        const A = LV.warps[0].a; return G5.loopHint || G5.noteRead ? { x: A.cx + DX[A.vd] * CELL * 0.5, z: A.cz + DY[A.vd] * CELL * 0.5 } : { x: 30 * CELL, z: cellCenter(LOOP5.z) };
      }
      return near(left.filter(k => k.id !== 'E'));
    }
    case 'staff': { const d = W5.svDoor; return d ? { x: d.mx, z: d.mz } : null; }
    case 'stairs': return inBoil ? null : stairs;
    case 'valves': return inBoil ? near(W5.valves.filter(v => !v.turned)) : stairs;
    case 'fire': return targetState5();
    case 'exit': return inBoil ? W5.exit : stairs;
  }
  return null;
}
function hudObj5() { return G5.phase === 'fire' ? 'FIRE LOCK' : G5.phase === 'valves' || G5.phase === 'exit' ? `VALVES ${G5.valves}/3` : `KEYS ${G5.keys}/3`; }
function hudItems5() { const a = []; if (G5.keys) a.push('KEYS ×' + G5.keys); if (ST5.hasSpray) a.push('MOTHEX ×' + ST5.spray); if (ST5.fireKey && !ST5.reset) a.push('FIRE KEY'); if (G5.phase === 'exit') a.push('EXIT OPEN'); return a.join(' · ') || 'LEVEL 5'; }

// ----- start (after every module has initialised) -----
if (/[?&]debug/.test(location.search)) Object.assign(window.__BR || (window.__BR = {}), { G5, W5, AI5, LV5: () => LV, goLevel5, worldFX5, gameEvents5, target5, win5, takeKey5, unlockStaff5, startValve5, finishValve5, useExit5, closeElev5, stareHit5, radio5, Moth, spawnMoth5, wakeBoiler5, startTp5, snapDoor5, foes5, readNote5, ringBell5, callElev5, cellCenter, CELL5: () => CELL, Z5, R5, BEV5, LOOP5, setPhase5, updatePlayer, playerCamera });

