// ---------- Level 9 · game flow, story beats, per-frame world effects ----------
const G9 = { from: null };
function resetG9() {
  const from = G9.from; for (const k of Object.keys(G9)) delete G9[k];
  Object.assign(G9, { from, phase: 'arrive', data: 0, mapSeen: false, mapOpen: false, gateOpen: false, crowbar: false, carry: 0, cans: 0, keycard: false,
    sniffs: 0, watchT: [90, 70, 50][G.diff], ambT: rnd(14, 26), hallT: 20, tpCd: 0, tp: null, labSeen: false, doorT: 0, drawT: 0, mapT: 0,
    haleStage: 0, endWon: false, night: null, portalT: 0, tipT: 22, cageEv: null, cellT: 0 });
}
resetG9();
const L9_DEATH = { watch: ['THE WATCH FOUND YOU', 'Its flashlight was the last thing on the tape.'], wretch: ["IT CAME THROUGH THE DOOR", 'You should have latched it.'] };
Object.assign(DEATH_TXT, L9_DEATH);

// ----- radio / dialogue -----
function radio9(key, delay = 0) {
  const txt = (VO_TXT.l9 || {})[key]; if (!txt) return;
  if (key.startsWith('hale')) { const h = AI9.hale; say('DR. HALE', txt, h ? { vo: 'm9_' + key, pos: h, delay } : { vo: 'm9_' + key, delay }); return; }
  say('M.E.G. OUTPOST 9', txt, { radio: true, vo: 'm9_' + key, delay });
}
function obj9() {
  if (spareRoute9()) return 'TAKE THE SERVICE ELEVATOR — OR CURE DR. HALE';   // r6: Hale's spare card
  switch (G9.phase) {
    case 'arrive': return 'FIND THE M.E.G. OUTPOST · NORTH-EAST';
    case 'data': return `DOWNLOAD M.E.G. DATA FROM THE RED HOUSES · ${G9.data}/3`;
    case 'gate': return 'ENTER THE OUTPOST · FOLLOW THE YELLOW ARROWS DOWN';
    case 'lab': return 'FIND THE CROWBAR IN THE LAB';
    case 'cans': return G9.cans < 4 ? `RECOVER THE FLUID CANISTERS · ${G9.cans}/4` : `INSTALL THE CANISTERS IN THE LURE RACK · ${W9.rack.n}/4`;
    case 'prime': return 'OPEN THE HOLDING CELL';
    case 'release': return 'GET CLEAR · PULL THE CAGE LEVER WHEN IT TAKES THE BAIT';
    case 'trapped': return 'RELEASE THE CURE';
    case 'cure': return 'STAND BACK';
    case 'hale': return 'TALK TO DR. HALE';
    case 'done': return 'TAKE THE SERVICE ELEVATOR';
  }
  return '';
}
function setPhase9(p) { if (p) G9.phase = p; objective(obj9()); tasks9(); }

// ----- map kiosk / camcorder snapshot -----
function studyMap9() {
  if (G9.mapOpen) { closeMap9(); return; }
  openMap9();
  if (!G9.mapSeen) {
    G9.mapSeen = true; SFX.beep(1320, 0.06); later(0.12, () => SFX.beep(1760, 0.06)); FX.glitch = Math.max(FX.glitch, 0.7);
    if (G9.phase === 'arrive') setPhase9('data');
    later(0.8, () => radio9('map')); later(1.2, () => toast(IS_TOUCH ? 'MAP SAVED — TAP MAP TO VIEW' : 'MAP SNAPSHOT SAVED — [TAB] TO VIEW', 3));
    cpSave('M.E.G. MAP');
  }
}
function openMap9() { G9.mapOpen = true; G9.mapT = 0; $('map9').classList.remove('hide'); drawMapOverlay9(); SFX.click(); }
function closeMap9() { G9.mapOpen = false; $('map9').classList.add('hide'); }
function toggleMap9() { if (!G9.mapSeen) { toast('NO MAP YET — FIND THE M.E.G. MAP BY THE GATE', 2.2); return; } G9.mapOpen ? closeMap9() : openMap9(); }
function drawMapOverlay9() { const c = $('map9c'); drawMap9(c.getContext('2d'), c.width, c.height, { flash: true }); }

// ----- terminals -----
function startDownload(T) {
  if (T.done || T.active) return;
  T.active = true; T.prog = 0; T.away = 0; T.need = [8, 10, 13][G.diff]; T.chirpT = 0.8; T.half = false; T.warned = false;
  SFX9.modem(P9({ x: T.x, z: T.z, y: 0.96 })); makeNoise(0.3); FX.glitch = Math.max(FX.glitch, 0.5);
  toast('DOWNLOADING — STAY CLOSE TO THE TERMINAL', 2.6);
  if (G9.phase === 'arrive') setPhase9('data');
  noiseAt9(T.x, T.z, 0.9, 0.55);   // the modem screech carries: a Wretch sleeping close by stirs (it only wakes if it then hears you)
  drawTerm(T);
}
function updateTerms9(dt) {
  termZoom9(dt);
  for (const T of W9.terms) {
    if (!T.active) continue;
    const near = dist2(T.x, T.z, PL.x, PL.z) < 3.4;
    if (near) { T.prog += dt; T.away = 0; T.warned = false; } else T.away += dt;
    T.chirpT -= dt;
    if (near && T.chirpT <= 0) { T.chirpT = rnd(0.5, 1.3); SFX9.chirp(P9({ x: T.x, z: T.z, y: 0.96 })); makeNoise(0.14); noiseAt9(T.x, T.z, 0.4, 0.1); }
    if (!T.half && T.prog > T.need * 0.5) { T.half = true; SFX9.modem(P9({ x: T.x, z: T.z, y: 0.96 })); noiseAt9(T.x, T.z, 0.9, 0.55); }
    if (T.away > 0.4 && !T.warned) { T.warned = true; toast('LINK INTERRUPTED — RETURN TO THE TERMINAL', 2.2); SFX.beep(420, 0.12); }
    if (T.prog >= T.need) finishDownload(T);
  }
}
// the camcorder pushes in on the screen as the transfer runs: only while you stand at it and look at it; danger or looking away lets go
function termZoom9(dt) {
  let want = 0, aim = null;
  for (const T of W9.terms) {
    if (!T.active || !T.scr || dist2(T.x, T.z, PL.x, PL.z) > 3.4) continue;
    const s = T.scr, cp = CAM.position, dx = s.x - cp.x, dy = s.y - cp.y, dz = s.z - cp.z, d = Math.hypot(dx, dy, dz) || 1;
    const yawTo = Math.atan2(dx, dz), pitchTo = -Math.atan2(dy, Math.hypot(dx, dz));
    const off = Math.hypot(angDiff(PL.yaw, yawTo), pitchTo - PL.pitch);
    if (off > 0.55) continue;
    const H = hearLimit9(); if (H.hunt || H.sus > 0.6 || G.chase > 0.3) continue;   // the modem's own screech stirs a sleeper a little; that alone doesn't break the shot
    want = (0.2 + 0.8 * clamp(T.prog / T.need, 0, 1)) * clamp(1 - (off - 0.3) / 0.25, 0, 1); aim = { yaw: yawTo, pitch: pitchTo };
  }
  PL.tz = want > (PL.tz || 0) ? damp(PL.tz || 0, want, 1.6, dt) : damp(PL.tz || 0, want, 7, dt);
  if (aim && PL.tz > 0.02) { const k = Math.min(1, dt * 2.2 * PL.tz); PL.yaw += angDiff(PL.yaw, aim.yaw) * k; PL.pitch += (aim.pitch - PL.pitch) * k; }   // a soft frame on the monitor; the mouse still wins
}
function finishDownload(T) {
  T.done = true; T.active = false; G9.data++; T.drawK = ''; drawTerm(T);
  if (T.h.beacon) setEmi(T.h.beacon.mat, 0.1, 3, 0.35);
  SFX9.dlDone(P9({ x: T.x, z: T.z, y: 0.96 })); FX.glitch = Math.max(FX.glitch, 1); PL.san = Math.min(100, PL.san + 8);
  toast(`M.E.G. DATA ${G9.data}/3 RECEIVED`, 2.6);
  if (G9.data === 1) radio9('term1', 0.8);
  else if (G9.data === 2) radio9('term2', 0.8);
  if (G9.data >= 3) { later(1.4, () => { openGate(); G9.gateOpen = true; }); radio9('gate', 1.8); setPhase9('gate'); }
  else setPhase9(G9.phase === 'arrive' ? 'data' : null);
  if (W9.kiosk) W9.kiosk.drawK = '';
  cpSave(`M.E.G. DATA ${G9.data}/3`, cpPorch9(T.h));   // you respawn outside on the porch, not next to the house's Wretch
}
// the street side of a house's front door (checkpoint spot after a download)
function cpPorch9(h) {
  const f = h && h.front; if (!f) return null;
  const [mx, mz] = edgeMid(f.x, f.y, f.d), p = { x: mx + DX[f.d] * 1.5, z: mz + DY[f.d] * 1.5 }; collide(p, 0.3);
  return { x: p.x, z: p.z, yaw: Math.atan2(DX[f.d], DY[f.d]) };
}

// ----- lab: crowbar, lockers, lure rack, cell, cage, cure -----
function takeCrowbar() {
  if (W9.crowbar.taken) return;
  W9.crowbar.taken = true; W9.crowbar.mesh.setEnabled(false); G9.crowbar = true; SFX.pickup(); FX.glitch = Math.max(FX.glitch, 0.5);
  toast('CROWBAR — PRY OPEN THE PADLOCKED LOCKERS', 3);
  setPhase9('cans'); radio9('crowbar', 0.9); if (W9.kiosk) W9.kiosk.drawK = '';
  cpSave('CROWBAR');
}
function useLocker(L) {
  const p = P9({ x: L.x, z: L.z, y: 1 });
  if (L.st === 'locked') {
    if (!G9.crowbar) { SFX9.rattle(p); toast('PADLOCKED — YOU NEED SOMETHING TO PRY IT OPEN', 2.6); return; }
    L.st = 'prying'; L.pryT = 0; SFX9.pry(p); makeNoise(0.55);
    later(1.35, () => { L.st = 'open'; FX.glitch = Math.max(FX.glitch, 0.3); toast('PADLOCK SNAPPED', 1.4); });
  } else if (L.st === 'open') {
    if (G9.cans >= 4) { toast('YOU ALREADY HAVE FOUR CANISTERS', 2); return; }   // r6: five lockers, four needed
    L.st = 'empty'; L.can.setEnabled(false); G9.carry++; G9.cans++; SFX.pickup();
    toast(`FLUID CANISTER ${G9.cans}/4`, 2.4);
    if (G9.cans >= 4) radio9('cans', 0.8);
    setPhase9(); cpSave(`CANISTER ${G9.cans}/4`);
  }
}
function installCans() {
  const R = W9.rack;
  if (G9.carry <= 0) { SFX.beep(300, 0.15); toast(G9.crowbar ? `LURE RACK EMPTY SLOTS: ${4 - R.n} — FIND THE CANISTERS` : 'THE RACK NEEDS 4 FLUID CANISTERS', 2.6); return; }
  let k = 0;
  while (G9.carry > 0 && R.n < 4) {
    const s = R.sockets.find(s => !s.filled); if (!s) break;
    s.filled = true; R.n++; G9.carry--;
    later(k * 0.45, () => { s.can.setEnabled(true); SFX9.canIn(P9(s.pos)); }); k++;
  }
  toast(`LURE RACK ${R.n}/4`, 2);
  if (R.n >= 4) {
    later(k * 0.45 + 0.3, () => { W9.vapor.want = 0.35; setEmi(W9.panel.lamps[0], 0.2, 3, 0.3); SFX9.hiss(P9({ x: W9.vapor.x, z: W9.vapor.z, y: 2.4 }), 2.5); });
    setPhase9('prime'); radio9('installed', k * 0.45 + 1); cpSave('LURE PRIMED');
  } else setPhase9();
}
function releaseSubject() {
  if (W9.rack.n < 4) { SFX.beep(240, 0.25); toast('PRIME THE LURE FIRST — INSTALL ALL 4 CANISTERS', 2.6); return; }
  if (G9.phase !== 'prime') return;
  setPhase9('release');
  const c = W9.cell; SFX.beep(900, 0.1);
  c.want = 1; LV.solids[c.sol].off = true; markDyn((LAB_X + 2) * CELL, 10 * CELL - WT / 2, (LAB_X + 3) * CELL, 10 * CELL + WT / 2, 0); LV.navVer++;
  SFX9.cellOpen(P9({ x: c.x, z: c.z })); later(0.4, () => SFX9.klaxon(P9({ x: c.x, z: c.z, y: 2.4 })));
  const s = AI9.subject;
  later(0.9, () => { s.st = 'burst'; s.stT = 0; playS(bpick('scrHi'), { pos: s.pos(1.3), vol: 1.2, rate: 1.1 }); FX.glitch = Math.max(FX.glitch, 1.2); });
  toast('GET CLEAR OF THE CAGE!', 2.2);
}
function cageEdges(v) {
  if (!G9.cageEv) G9.cageEv = [edgeVal(LAB_X + 2, 1, 1), edgeVal(LAB_X + 2, 3, 1)];
  setEdge(LAB_X + 2, 1, 1, v ? 1 : G9.cageEv[0]); setEdge(LAB_X + 2, 3, 1, v ? 1 : G9.cageEv[1]); LV.navVer++; PL.cell = -1;
}
function pullLever() {
  const P = W9.panel, C = W9.cage; if (C.want || P.cd > 0) return;
  P.pulled = true; P.cd = 99; SFX9.lever(P9({ x: P.x, z: P.z }));
  later(0.3, () => { C.want = 1; for (const g of C.gates) LV.solids[g.sol].off = false; cageEdges(true); SFX9.cageDrop(P9({ x: C.x, z: C.z, y: 2 })); setEmi(P.lamps[1], 3, 1.6, 0.1); });
  later(1.0, () => {
    const s = AI9.subject, plIn = cellOf(PL.x) === LAB_X + 2 && (cellOf(PL.z) === 2 || cellOf(PL.z) === 3);
    if (s && !plIn && s.inCage() && ['lured', 'sniff', 'hunt'].includes(s.st)) {
      C.trapped = true; s.st = 'trapped'; s.stT = 0; setEmi(P.lamps[1], 0.2, 3, 0.3); setPhase9('trapped'); radio9('mist', 0.4); FX.glitch = Math.max(FX.glitch, 0.8); P.cd = 0;
      cpSave('SUBJECT CAGED');
    } else {
      toast(G9.phase === 'release' ? 'THE CAGE CAME DOWN EMPTY — RESETTING' : 'CAGE TEST CYCLE — RESETTING', 2.6);
      later(3.5, () => { raiseCage(); P.cd = 2.5; });
    }
  });
}
function raiseCage() {
  const C = W9.cage, P = W9.panel; C.want = 0; for (const g of C.gates) LV.solids[g.sol].off = true; cageEdges(false);
  P.pulled = false; setEmi(P.lamps[1], 0.15, 0.02, 0.02); SFX9.cellOpen(P9({ x: C.x, z: C.z, y: 2 }));
}
function releaseCure() {
  const C = W9.cage, P = W9.panel;
  if (!C.trapped) { SFX.beep(240, 0.25); toast('SEAL THE SUBJECT IN THE CAGE FIRST', 2.4); return; }
  if (G9.phase !== 'trapped') return;
  setPhase9('cure'); setEmi(P.bmat, 3); setEmi(P.lamps[2], 0.2, 3, 0.3);
  SFX.beep(1200, 0.12); W9.vapor.want = 1; SFX9.hiss(P9({ x: C.x, z: C.z, y: 2.4 }), 7.5); G9.cureT = 0;
  const s = AI9.subject;
  later(0.6, () => { s.st = 'cure'; s.stT = 0; playS(bpick('scrHi'), { pos: s.pos(1.3), vol: 1.2, rate: 0.8 }); });
  later(4.2, () => playS(bpick('scrLo'), { pos: s.pos(1.2), vol: 0.9, rate: 0.7 }));
  later(8.0, () => {
    W9.vapor.want = 0; const h = new Hale(s.x, s.z, Math.atan2(PL.x - s.x, PL.z - s.z)); AI9.hale = h; AI.all.push(h);
    setPhase9('hale'); PL.san = Math.min(100, PL.san + 25);
    W.interact.push({ get x() { return h.x; }, get z() { return h.z; }, y: 1.2, r: 2.3, label: () => 'TAKE THE KEYCARD', ok: () => h.st === 'give', act: () => takeKeycard() });
  });
  later(11.5, () => { C.trapped = false; raiseCage(); P.cd = 1e9; });
}
function haleTalk() { G9.haleStage = 1; radio9('hale1'); radio9('hale2'); }
function takeKeycard() {
  const h = AI9.hale; if (!h || G9.keycard) return;
  G9.keycard = true; h.rig.card.isVisible = false; SFX.pickup(); FX.glitch = Math.max(FX.glitch, 0.4);
  toast('ADMINISTRATOR KEYCARD', 2.4); setPhase9('done'); cpSave('KEYCARD');
  h.st = 'walk'; h.stT = 0; h.goal = { x: (LAB_X + 4.5) * CELL - 0.4, z: 7.5 * CELL + 1.35 };
}
function useElevator() {
  const E = W9.elev, p = P9({ x: E.rx, z: E.rz, y: 1.3 });
  if (!G9.keycard) { SFX.beep(240, 0.25); later(0.3, () => SFX.beep(200, 0.3)); toast('ADMINISTRATOR KEYCARD REQUIRED', 2.4); return; }
  if (E.want) return;
  SFX.beep(1500, 0.15); setEmi(E.rm, 0.15, 3, 0.3); toast('ACCESS GRANTED', 1.8); elevator9Leave();
  SFX9.elevator(P9(E.light));
  later(2.2, () => { SFX9.ding(P9(E.light)); E.want = 1; LV.solids[E.sol].off = true; objective('STEP INTO THE ELEVATOR'); });
}
function win9() {
  if (G.state !== 'play') return;
  G.state = 'won'; DEATH.t = 0; DEATH.shown = false; closeMap9(); clearSlot(0); $('prompt').classList.remove('show');
  G9.wc = { x: CAM.position.x, z: CAM.position.z, yaw: CAM.rotation.y, pitch: CAM.rotation.x }; G9.haleIn = false;
  try { const b = +localStorage.getItem('br_best9'); if (!b || G.time < b) localStorage.setItem('br_best9', Math.floor(G.time)); } catch (e) {}
}
function wonCam9(dt) {
  DEATH.t += dt; const t = DEATH.t, E = W9.elev, cx = (LAB_X + 5) * CELL + 1.05, cz = E.zc, w = G9.wc;
  const k1 = smooth(0, 1.7, t), k2 = smooth(1.6, 3.2, t);
  CAM.position.set(lerp(w.x, cx, k1), 1.6 + noise1(FX.t * 1.1) * 0.01 + (t > 4.2 && t < 5.2 ? Math.sin(FX.t * 40) * 0.006 : 0), lerp(w.z, cz, k1));
  const y1 = w.yaw + angDiff(w.yaw, Math.PI / 2) * k1;
  CAM.rotation.set(lerp(w.pitch, 0.02, k1) + noise1(FX.t * 0.9) * 0.006, y1 + Math.PI * k2, noise1(FX.t * 0.5) * 0.01);
  CAM.fov = S.fov * Math.PI / 180;
  const h = AI9.hale;
  if (h && !G9.haleIn && t > 1.9) { G9.haleIn = true; h.place(cx + 0.45, cz + 0.62, -Math.PI / 2); h.st = 'wait'; h.update(0.016); }
  if (t > 3.3 && E.want) { E.want = 0; LV.solids[E.sol].off = false; SFX9.elevator(P9(E.light)); }
  FX.fadeW = smooth(5.4, 7.2, t); FX.glitch = Math.max(FX.glitch, t > 6 ? 0.6 : 0);
  if (t > 7.6 && !DEATH.shown) { DEATH.shown = true; G9.endWon = true; flags9(); goLevel5(carryFrom9()); }
}
function showEnd9(won) {
  if (document.pointerLockElement) document.exitPointerLock();
  $('osd').classList.add('hide'); $('touch').classList.add('hide'); closeMap9();
  G9.endWon = won;
  const [title, text] = won ? ['YOU ESCAPED LEVEL 9', `The elevator climbs for a long time. Dr. Hale never lets go of the rail. When the doors finally open, the footage ends in daylight.${G.lost ? ` ${G.lost} member${G.lost > 1 ? 's' : ''} of the expedition never made it out of Level 0.` : ''}`] : (DEATH_TXT[G.cause] || DEATH_TXT.watch);
  $('endKicker').textContent = won ? 'SURFACE REACHED · END OF RECORDING' : '■ SIGNAL LOST · LEVEL 9';
  $('endTitle').textContent = title; $('endText').textContent = text;
  const st = [['TIME ON TAPE', fmtTC(G.time)], ['DISTANCE', Math.round(PL.dist) + ' M'], ['M.E.G. DATA', G9.data + '/3'], ['CANISTERS', G9.cans + '/4'], ['LEVEL', '9 · DARKENED SUBURBS'], ['DIFFICULTY', DIFFS[G.diff]]];
  $('endStats').innerHTML = st.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  $('btnAgain').textContent = won ? '▶ PLAY AGAIN (LEVEL 0)' : '▶ RETRY LEVEL 9';
  show('end');
}

// ----- level transition -----
function carryFromL0() { return { hp: PL.hp, san: PL.san, batt: PL.batt, spare: PL.spare, water: PL.water, time: G.time, dist: PL.dist, lost: G.lost, tapes: G.tapes }; }
// positional audio across floors: move a source into the listener's frame using the physical house positions
function remap9(x, y, z) {
  const c = CAM.position, L = phys9(c.x, c.z), S = phys9(x, z);
  return [S[0] - (L[0] - c.x), y + S[2] - L[2], S[1] - (L[1] - c.z)];
}
function teardown9() {
  teardownWin9();
  if (G9.night) { try { G9.night.g.disconnect(); } catch (e) {} G9.night = null; }
  if (AI9.wz) { try { AI9.wz.g.disconnect(); if (AI9.wz.src) AI9.wz.src.stop(); } catch (e) {} AI9.wz = null; }
  AU.remap = null;
  closeMap9();
}
async function goLevel9(from) {
  const f = Object.assign({ hp: 100, san: 100, batt: [100, 90, 75][G.diff], spare: [2, 1, 0][G.diff], water: [3, 1, 0][G.diff], time: 0, dist: 0, lost: 0, tapes: 4 }, from || G9.from || {});
  G9.from = Object.assign({}, f);
  G.state = 'loading'; show('loading'); $('osd').classList.add('hide'); $('touch').classList.add('hide'); $('blue').classList.add('hide');
  $('loadOsd').textContent = '▶ LEVEL 9 · DARKENED SUBURBS'; $('loadFill').style.width = '0%';
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  teardownScene();
  LVL = 9; setDims(L9_N, L9_LMR); document.body.classList.add('lvl9'); AU.remap = remap9;
  resetG9(); resetP9(); tasksReset('LEVEL 9 · DARKENED SUBURBS');
  const prog = (p, m) => { $('loadFill').style.width = (p * 100).toFixed(0) + '%'; $('loadMsg').textContent = m; };
  RNG = mulberry32((Math.random() * 4294967296) >>> 0);
  await buildWorld9(prog);
  setupPost(+S.qual); applySettings();
  Object.assign(PL, { x: 2 * CELL, z: 6.3 * CELL, yaw: 0, pitch: 0, vx: 0, vz: 0, kx: 0, kz: 0, crouch: false, ck: 0, sta: 1, exh: false,
    hp: Math.max(f.hp, 75), san: Math.max(f.san, 75), batt: Math.max(f.batt, 60), spare: f.spare, water: f.water, flash: false, fk: 0, nv: false, zoomT: false, zk: 0,
    noise: 0, dist: f.dist, lastHurt: -99, shake: 0, cell: -1, fear: 0, lookAt: null, lookK: 0, focus: null, interf: 0, tz: 0 });
  updateField();
  Object.assign(G, { time: f.time, lost: f.lost, tapes: f.tapes, cause: '', blackout: 0, exitOn: false, chase: 0, hintT: 0, grace: 0 });
  HINT.stage = 0; HINT.site = null;
  initAI9();
  Object.assign(FX, { envA: [0.011, 0.013, 0.019, 1], envS: [0.03, 0.04, 0.066, 0], fadeW: 1, fadeB: 0 });
  CAM.position.set(PL.x, 1.6, PL.z); CAM.rotation.set(0, 0, 0); CAM.getViewMatrix(true); worldFX9(0.016); pushUniforms();
  await new Promise(r => SCN.executeWhenReady(() => r()));
  prog(1, 'READY'); await nextFrame();
  try { localStorage.setItem('br_l9', '1'); } catch (e) {}
  if (!brief9Seen()) { G.state = 'brief9'; openBrief('l9', 'l9'); return; }   // first arrival: the Level 9 field briefing, then the intro
  startIntro9();
}
function startIntro9() { if (LVL !== 9 || !['loading', 'brief9'].includes(G.state)) return; hideScreens(); G.state = 'intro'; INTRO.t = 0; SFX.tape(); }
function startLevel9Menu() {
  if (G.state !== 'title') return;
  audioInit(S.vol); if (AU.ctx.state === 'suspended') AU.ctx.resume();
  applySettings(); lockPointer(); G9.from = null; goLevel9(null);
}
function introCam9(dt) {
  INTRO.t += dt; const t = INTRO.t;
  if (t < 0.05) { FX.glitch = 2.2; SFX.staticBurst(0.35, 0.8); }
  const k = smooth(0.3, 3.4, t);
  FX.fadeB = 0; FX.fadeW = 1 - smooth(0.2, 2.4, t); FX.glitch = Math.max(FX.glitch, 1.3 * (1 - smooth(0, 3, t)));
  const pz = W9.portal ? W9.portal.z + 0.25 : PL.z - 0.8;
  CAM.position.set(PL.x + Math.sin(t * 1.7) * 0.05 * (1 - k), lerp(1.15, 1.62, k), lerp(pz, PL.z, k));
  CAM.rotation.set(lerp(0.3, 0, k) + noise1(FX.t * 1.3) * 0.02, PL.yaw + lerp(-0.35, 0, k), lerp(-0.3, 0, smooth(0.5, 3.4, t)));
  CAM.fov = S.fov * Math.PI / 180;
  if (t > 3.6) beginPlay9();
}
function beginPlay9() {
  G.state = 'play'; FX.fadeW = 0; FX.fadeB = 0; PL.pitch = 0;
  $('osd').classList.remove('hide'); if (IS_TOUCH) $('touch').classList.remove('hide');
  setPhase9('arrive'); cpSave('LEVEL START', { x: PL.x, z: PL.z, yaw: PL.yaw, quiet: true });
  later(1.4, () => arrive9());   // r6: rewritten arrival (text only; the old voiced clip is unused)
  later(26, () => toast(IS_TOUCH ? 'LATCH · MAP BUTTONS' : '[RIGHT-CLICK] LATCH DOORS   [TAB] MAP   [F] FLASHLIGHT', 3.6));
}

// ----- per-frame story events -----
function inLab9(x = PL.x, z = PL.z) { return zoneXZ(x, z) === ZN.LAB; }
function startTp9(lab) {
  G9.tp = lab ? { t: 0, x: (LAB_X + 2.5) * CELL, z: 2.65, yaw: 0, lab } : { t: 0, x: 25.5 * CELL, z: 19.45 * CELL, yaw: Math.PI, lab };
  for (let i = 0; i < 6; i++) later(i * 0.14, () => SFX.step(1, false));
}
// house stairs: walk into the foot of the flight (or the top of the well) to change floor
function houseOf9(c) { const b = c >= 0 ? LV.bld[c] : -1; return b >= 0 && b < LV.houses.length ? LV.houses[b] : null; }
function checkHouseStairs9() {
  const c = cIdx(cellOf(PL.x), cellOf(PL.z)), h = houseOf9(c); if (!h || !h.stair || G.state !== 'play') return;
  const s = h.stair, inR = r => PL.x > r.x0 && PL.x < r.x1 && PL.z > r.z0 && PL.z < r.z1, v = PL.vx * s.U[0] + PL.vz * s.U[1];
  const fl = floorOf(c);
  if (fl === 0 && inR(s.gTrig) && v > 0.45) startStairTp9(h, true);
  else if (fl === 1 && inR(s.uTrig) && v < -0.45) startStairTp9(h, false);
}
function startStairTp9(h, up) {
  const a = up ? h.stair.uArr : h.stair.gArr;
  G9.tp = { t: 0, x: a.x, z: a.z, yaw: a.yaw, stair: true, up, h };
  for (let i = 0; i < 6; i++) later(i * 0.13, () => SFX.step(1, false));
  makeNoise(0.18);
  if (!G9.stairTip) { G9.stairTip = true; later(1.1, () => toast(up ? 'UPSTAIRS — WALK BACK INTO THE STAIRWELL TO GO DOWN' : 'DOWNSTAIRS', 2.6)); }
}
function gameEvents9(dt) {
  peekTick9(dt); portalTick9(dt);   // r6: after playerCamera, before the frame renders
  updateTerms9(dt); places9Events(dt);
  // stairwell between the outpost and the lab (fade through black)
  if (G9.tp) {
    const T = G9.tp; T.t += dt; FX.fadeB = T.t < 0.3 ? T.t / 0.3 : Math.max(0, 1 - (T.t - 0.45) / 0.45);
    if (!T.moved && T.t >= 0.3) {
      T.moved = true; PL.x = T.x; PL.z = T.z; PL.yaw = T.yaw; PL.vx = PL.vz = 0; PL.cell = -1; updateField();
      if (T.lab && !G9.labSeen) { G9.labSeen = true; if (G9.phase === 'gate') setPhase9('lab'); radio9('lab', 1.0); cpSave('THE LAB'); }
    }
    if (T.t > 0.9) { G9.tp = null; FX.fadeB = 0; G9.tpCd = T.stair ? 0.6 : 1; }
  } else if ((G9.tpCd -= dt) <= 0) {
    const cx = cellOf(PL.x), cz = cellOf(PL.z);
    if (cx === LV.base.stair.x && cz === LV.base.stair.y && PL.z > LV.base.stair.y * CELL + 0.5) startTp9(true);
    else if (cx === LV.lab.arrive.x && cz === LV.lab.arrive.y && PL.z < 1.25) startTp9(false);
    else checkHouseStairs9();
  }
  // Dr. Hale finishes his first lines, then hands over the keycard
  if (G9.haleStage === 1 && !SUBS.cur && !SUBS.q.length && AI9.hale && AI9.hale.st === 'talk') {
    G9.haleStage = 2; AI9.hale.st = 'give'; AI9.hale.rig.card.isVisible = true; radio9('hale3'); objective("TAKE DR. HALE'S KEYCARD");
  }
  // the elevator
  const E = W9.elev;
  if (E && E.open > 0.75 && PL.x > (LAB_X + 5) * CELL - WT / 2 - 0.75 && Math.abs(PL.z - E.zc) < 0.8) win9();
  // the Watch
  G9.watchT -= dt;
  if (G9.watchT <= 0) {
    G9.watchT = rnd(70, 110);
    const maxW = Math.min([1, 1, 2][G.diff] + (G9.data >= 2 ? 1 : 0), 3);
    if (!inLab9() && AI9.watch.length < maxW) spawnWatch();
  }
  // distant neighbourhood noises
  G9.ambT -= dt;
  if (G9.ambT <= 0 && !inLab9()) {
    G9.ambT = rnd(20, 42); const a = RNG() * TAU, r = rnd(20, 34), p = { x: PL.x + Math.sin(a) * r, y: 1.2, z: PL.z + Math.cos(a) * r, pl: { x: PL.x, z: PL.z } }, k = RNG();
    if (k < 0.35) SFX9.bark(Object.assign(p, { ref: 6, roll: 0.8 }));
    else if (k < 0.65) { SFX9.bang(Object.assign(p, { ref: 5, roll: 0.9 }), 0.5); later(0.5, () => SFX9.bang(p, 0.45)); }
    else SFX.far(p);
  }
  // sanity
  G9.hallT -= dt;
  if (PL.san < 40 && G9.hallT <= 0) {
    G9.hallT = rnd(7, 18) * (PL.san / 40 + 0.35); const k = RNG();
    if (k < 0.3) SFX.whisper();
    else if (k < 0.55) { const b = { x: PL.x - Math.sin(PL.yaw) * 4, y: 0.1, z: PL.z - Math.cos(PL.yaw) * 4, pl: { x: PL.x, z: PL.z } }; SFX.heavyStep(b); later(0.55, () => SFX.heavyStep(b)); }
    else if (k < 0.78) { const w = Math.floor(RNG() * VO_TXT.whisper.length); say('', '…' + VO_TXT.whisper[w].toLowerCase().replace(/[.?]$/, '') + '…', { vo: 'wh' + w, mode: 'whisper' }); }
    else { FX.glitch = 1.6; SFX.staticBurst(0.3, 0.4); }
  }
}

// ----- per-frame world effects -----
const _t9 = new BABYLON.Vector4(1, 1, 1, 1);
function approach(v, want, up, down, dt) { return want > v ? Math.min(want, v + dt * up) : Math.max(want, v - dt * down); }
function worldFX9(dt) {
  const t = FX.t, live = G.state === 'play' || G.state === 'dead' || G.state === 'won', cp = CAM.position;
  const n = noise1(t * 5.3) + 0.5 * noise1(t * 23.1 + 4);
  FX.flicker = n > -0.15 ? 0.82 + 0.18 * hash1(Math.floor(t * 60)) : 0.06;
  buzzCd -= dt;
  const surge = live && AI.flick > 0.05 && hash1(Math.floor(t * 13)) < AI.flick * 0.4;
  stutter = surge ? 0.3 + 0.2 * hash1(Math.floor(t * 40)) : damp(stutter, 1, 20, dt);
  FX.lightScale = stutter;
  FX.hurt = Math.max(0, FX.hurt - dt * 0.9); FX.glitch = Math.max(0, FX.glitch - dt * 1.3);
  const zc = LV.zone[cIdx(cellOf(cp.x), cellOf(cp.z))], indoor = indoorZ(zc), L = clamp(lightAt(cp.x, cp.z) * 1.1, 0, 1);
  FX.fogDen = indoor ? 0.03 : 0.036;
  const ck = FX.envS[3]; FX.fog[0] = lerp(0.016, lerp(0.13, 0.1, ck), L); FX.fog[1] = lerp(0.02, lerp(0.1, 0.11, ck), L); FX.fog[2] = lerp(0.032, lerp(0.062, 0.12, ck), L);
  const cool = zc === ZN.LAB || zc === ZN.BASE ? 1 : 0; FX.envS[3] = dt > 0.1 ? cool : damp(FX.envS[3], cool, 2.5, dt);
  G9.expK = damp(G9.expK ?? 1.28, zc === ZN.LAB ? 0.82 : zc === ZN.BASE ? 0.95 : 1.28, 2, dt);
  if (G.state === 'play') FX.exposure = 0.85 * S.bright * G9.expK * lerp(1, clamp(0.3 / Math.max(PL.light, 0.01), 0.22, 1), FX.nv);
  if (W9.lensFl) setEmi(W9.lensFl, 4.2 * FX.flicker * FX.lightScale);
  // porch beacons on the marked houses, mast light, glowing canisters / pickups
  W9.red.forEach((r, i) => { if (r.mat && !(r.h.term && r.h.term.done)) { const on = Math.floor(t * 1.6 + i * 0.37) % 2 === 0; setEmi(r.mat, G9.mapSeen ? (on ? 4 : 0.15) : 1.2, 0.05, 0.03); } });
  if (W9.mastMat) setEmi(W9.mastMat, Math.floor(t * 0.8) % 2 ? 3.5 : 0.1, 0.1, 0.05);
  if (W9.canMat) setEmi(W9.canMat, 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2.2)));
  if (W.itemMat) setEmi(W.itemMat, 0.4 + 0.9 * Math.max(0, Math.sin(t * 2.6)) ** 6);
  if (W.scrMat) { _t9.w = 0.75 + 0.25 * hash1(Math.floor(t * 30)); W.scrMat.setVector4('aTint', _t9); }
  // doors: distance culling + swing animation
  G9.doorT -= dt;
  if (G9.doorT <= 0) { G9.doorT = 0.25; for (const dr of W9.doors) { const on = dist2(dr.mx, dr.mz, cp.x, cp.z) < dr.cull; if (dr.vis !== on) { dr.vis = on; dr.mesh.setEnabled(on); } } }
  updateDoors9(dt);
  // gate
  const g = W9.gate;
  if (g && g.opening && g.open < 1) { g.open = Math.min(1, g.open + dt * 0.36); g.root.position.x = g.x0 - (CELL - 0.1) * smooth(0, 1, g.open); }
  // holding cell door + its warning lamp
  const c = W9.cell;
  if (c) {
    c.open = approach(c.open, c.want, 0.8, 0.8, dt); c.root.position.x = c.x0 + 1.25 * smooth(0, 1, c.open);
    const rel = G9.phase === 'release' || G9.phase === 'trapped';
    setEmi(c.lampMat, rel ? (Math.floor(t * 3) % 2 ? 4 : 0.2) : 0.35 + 0.25 * Math.sin(t * 2), rel ? 0.3 : 0.02, 0.01);
  }
  // cage drop-gates
  const C = W9.cage;
  if (C) { C.down = approach(C.down, C.want, 3.2, 0.5, dt); const y = lerp(CEIL + 0.02, 0, C.want ? C.down * C.down : smooth(0, 1, C.down)); for (const q of C.gates) q.root.position.y = y; }
  // lever
  const P = W9.panel;
  if (P) { P.pull = approach(P.pull, P.pulled ? 1 : 0, 5, 1.5, dt); P.lever.rotation.x = lerp(-0.6, 0.6, smooth(0, 1, P.pull)); if (P.cd < 1e8) P.cd -= dt; }
  // elevator doors
  const E = W9.elev;
  if (E) { E.open = approach(E.open, E.want, 0.7, 0.7, dt); E.doors.forEach((m, i) => { const s = i ? 1 : -1; m.position.z = E.zc + s * (0.3 + 0.92 * smooth(0, 1, E.open)); }); }
  // lockers / crates
  for (const Lk of W9.lockers) {
    if (Lk.st === 'prying') { Lk.pryT += dt; if (Lk.kind === 'crate') Lk.hinge.rotation.x = Math.sin(t * 43) * 0.02; else Lk.hinge.rotation.y = Math.sin(t * 43) * 0.025; }
    else if ((Lk.st === 'open' || Lk.st === 'empty') && Lk.ang < 1) { Lk.ang = Math.min(1, Lk.ang + dt * 2.2); const a = smooth(0, 1, Lk.ang); if (Lk.kind === 'crate') Lk.hinge.rotation.x = -1.9 * a; else Lk.hinge.rotation.y = -1.85 * a; }
  }
  // lure / cure vapor
  const V = W9.vapor;
  if (V) { V.a = damp(V.a, V.want, V.want > V.a ? 1.6 : 0.7, dt); V.col.w = V.a * (0.85 + 0.15 * noise1(t * 3.1)); V.mat.setVector4('coneCol', V.col); }
  // the portal behind you fades once you're out
  const Po = W9.portal;
  if (Po && Po.k > 0) { if (G.state === 'play') Po.k = Math.max(0, Po.k - dt / 9); setEmi(Po.mat, 5 * Po.k, 4.8 * Po.k, 3.6 * Po.k); if (Po.k <= 0) Po.mesh.setEnabled(false); }
  // screens: map kiosk + terminals redraw while close
  G9.drawT -= dt;
  if (G9.drawT <= 0) {
    G9.drawT = 0.2;
    const K = W9.kiosk;
    if (K && dist2(K.x, K.z, cp.x, cp.z) < 12) { const key = (Math.floor(FX.t * 2.5) % 2) + '|' + G9.data + G9.crowbar + G9.gateOpen; if (key !== K.drawK) { K.drawK = key; drawMap9(K.sc.ctx, 512, 374, { kiosk: true, flash: true }); K.sc.dt.update(); } }
    for (const T of W9.terms) if (dist2(T.x, T.z, cp.x, cp.z) < 10) drawTerm(T);
  }
  if (G9.mapOpen) { G9.mapT -= dt; if (G9.mapT <= 0) { G9.mapT = 0.2; drawMapOverlay9(); } }
  // dynamic light slots: 3 terminal glow, 4 porch beacon, 5 lab events / TV
  let bt = null, bd = 12; for (const T of W9.terms) { const d = dist2(T.x, T.z, cp.x, cp.z); if (d < bd) { bd = d; bt = T; } }
  if (bt) setSlot(3, { x: bt.x, y: 1.0, z: bt.z }, (bt.active ? 0.55 + 0.2 * hash1(Math.floor(t * 12)) : 0.35), null, 0, [0.3, 1, 0.5], 3.2, false, 1.2); else clearSlot(3);
  let br = null, brd = 20; for (const r of W9.red) { const d = dist2(r.pos.x, r.pos.z, cp.x, cp.z); if (d < brd) { brd = d; br = r; } }
  if (br) { const done = br.h.term && br.h.term.done, on = done || !G9.mapSeen || Math.floor(t * 1.6 + W9.red.indexOf(br) * 0.37) % 2 === 0; setSlot(4, br.pos, on ? (done ? 0.9 : G9.mapSeen ? 1.3 : 0.5) : 0.05, null, 0, done ? [0.2, 1, 0.35] : [1, 0.08, 0.04], 6.5, true, 0.8); } else clearSlot(4);
  let tv = null, td = 1e9; for (const v of W.tvs) { const d = dist2(v.x, v.z, cp.x, cp.z); if (d < td) { td = d; tv = v; } }
  if (G9.phase === 'cure' && C) setSlot(5, { x: C.x, y: 2.3, z: C.z }, 2.2 * (0.8 + 0.2 * hash1(Math.floor(t * 20))), null, 0, [0.35, 1, 0.5], 8, false, 0.6);
  else if (E && (E.open > 0.01 || G.state === 'won')) setSlot(5, E.light, 1.4 * Math.max(E.open, G.state === 'won' ? 1 : 0), null, 0, [1, 0.94, 0.8], 5, true, 0.5);
  else if (c && G9.phase === 'release' && dist2(c.x, c.z, cp.x, cp.z) < 20) setSlot(5, { x: c.x, y: 2.4, z: c.z - 0.3 }, Math.floor(t * 3) % 2 ? 1.6 : 0.1, null, 0, [1, 0.12, 0.04], 9, true, 0.7);
  else if (V && V.a > 0.05 && dist2(V.x, V.z, cp.x, cp.z) < 16) setSlot(5, { x: V.x, y: 2.2, z: V.z }, V.a * 1.1, null, 0, [0.35, 1, 0.5], 6, false, 0.9);
  else if (tv && td < 14) setSlot(5, { x: tv.x, y: 0.85, z: tv.z }, 0.55 * (0.7 + 0.3 * hash1(Math.floor(t * 24) + tv.seed)), null, 0, [0.62, 0.72, 1], 4.5, false, 1.4);
  else clearSlot(5);
  // ambience: TV hiss, night bed outdoors, troffer hum in the outpost / lab
  if (!hiss && AU.ctx) hiss = mkHissLoop();
  if (hiss && tv) { hiss.set(tv.x, 0.85, tv.z, PL.x, PL.z); setGain(hiss, live && td < 12 ? 0.5 * (1 - td / 12) : 0, 0.3); }
  if (AU.ctx) {
    if (!G9.night) G9.night = mkNight9();
    const now = AU.ctx.currentTime, mute = AU.muted, out = zc === ZN.LAB ? 0 : zc === ZN.BASE ? 0.12 : zc === ZN.HOUSE ? 0.3 : 1;
    G9.night.g.gain.setTargetAtTime(mute ? 0 : 0.16 * out * (live || G.state === 'intro' ? 1 : 0.5), now, 0.8);
    G9.night.cr.gain.setTargetAtTime(mute || G.chase > 0.3 ? 0 : 0.05, now, 1.2);
    AU.humG.gain.setTargetAtTime(mute ? 0 : (zc === ZN.LAB || zc === ZN.BASE ? 0.045 * clamp(L * 1.6, 0.05, 1) : 0), now, 0.1);
    AU.tenG.gain.setTargetAtTime(mute ? 0 : clamp(G.chase * 0.55 + PL.fear * 0.18, 0, 0.7) * (live ? 1 : 0), now, 0.6);
    AU.tenF.frequency.setTargetAtTime(280 + G.chase * 1500 + PL.fear * 300, now, 0.5);
  }
  for (const m of LV.chunkMeshes) { const cc = m.__c || (m.__c = m.getBoundingInfo().boundingBox.centerWorld.clone()); m._sortD = Math.hypot(cc.x - cp.x, cc.z - cp.z); }
}

// ----- HUD helpers -----
// objective target routed across floors: {x, z, fl} where fl = +1 go up / -1 go down / 0 same floor
function target9() {
  const tg = target9raw(); if (!tg) return null;
  const pc = cIdx(cellOf(PL.x), cellOf(PL.z)), tc = cIdx(cellOf(tg.x), cellOf(tg.z)), pf = floorOf(pc), tf = floorOf(tc);
  if (pf === tf && (!pf || LV.bld[pc] === LV.bld[tc])) return { x: tg.x, z: tg.z, fl: 0 };
  if (pf) { const h = houseOf9(pc); return h ? { x: h.stair.uGoal.x, z: h.stair.uGoal.z, fl: -1 } : null; }
  const h = houseOf9(tc); if (!h) return { x: tg.x, z: tg.z, fl: 0 };
  if (LV.bld[pc] === h.id) return { x: h.stair.gGoal.x, z: h.stair.gGoal.z, fl: 1 };
  const p = phys9(tg.x, tg.z); return { x: p[0], z: p[1], fl: 1 };
}
function target9raw() {
  const lab = inLab9(), comp = !lab && PL.x > BX * CELL && PL.x < (BX + 9) * CELL && PL.z > BX * CELL && PL.z < (BX + 9) * CELL;
  const toLab = () => lab ? null : comp ? { x: 25.5 * CELL, z: 20.3 * CELL } : W9.gate;
  const up = { x: (LAB_X + 2.5) * CELL, z: 0.9 };
  const near = arr => { let b = null, bd = 1e9; for (const o of arr) { const d = dist2(o.x, o.z, PL.x, PL.z); if (d < bd) { bd = d; b = o; } } return b; };
  if (spareRoute9()) return lab ? (W9.elev ? { x: W9.elev.rx, z: W9.elev.rz } : null) : toLab();
  switch (G9.phase) {
    case 'arrive': return W9.kiosk;
    case 'data': return G9.mapSeen ? near(W9.terms.filter(T => !T.done)) : W9.kiosk;
    case 'gate': return toLab();
    case 'lab': return lab ? W9.crowbar : toLab();
    case 'cans': {
      const left = W9.lockers.filter(L => L.st !== 'empty');
      if (G9.carry > 0 && (lab || !left.length)) return lab ? W9.rack : toLab();
      if (!left.length) return lab ? W9.rack : toLab();
      return lab ? up : near(left);
    }
    case 'prime': return lab ? W9.release : toLab();
    case 'release': case 'trapped': return lab ? W9.panel : toLab();
    case 'hale': return AI9.hale;
    case 'done': return W9.elev ? { x: W9.elev.rx, z: W9.elev.rz } : null;
  }
  return null;
}
function hudObj9() {
  if (G9.keycard) return 'KEYCARD ✓';
  if (G9.crowbar) return `CANISTERS ${G9.cans}/4` + (G9.carry ? ` · CARRY ${G9.carry}` : '');
  return `DATA ${G9.data}/3`;
}
function hudItems9() { const a = []; if (P9S.rota) a.push(watchTimer9()); if (G9.crowbar) a.push('CROWBAR'); if (G9.keycard) a.push('KEYCARD'); if (G9.mapSeen) a.push('MAP'); return a.join(' · ') || 'LEVEL 9'; }

// ----- start (after every module has initialised) -----
if (/[?&]debug/.test(location.search)) window.__BR = { CP, cpRetry, cpSave, cpAvail, cpPorch9, ERRS, frameErr, inRun, hasAlt, startLevelPick, openLevels, G9, W9, AI9, hearLimit9, noiseAt9, hear9, physD9, cellPt, cIdx, cellOf, cellCenter, floorOf, updateHUD, BRIEF, openBrief, closeBrief, briefStep, startIntro9, brief9Seen, briefSlides, LV9: () => LV, goLevel9, worldFX9, restartGame, teardownScene, openGate, startDownload, finishDownload, takeCrowbar, useLocker, installCans, releaseSubject, pullLever, releaseCure, takeKeycard, useElevator, win9, spawnWatch, studyMap9, toggleMap9, setDoor, latchDoor, radio9, target9, raiseCage, Hale, HINT, G, PL, AI, FX, W, LV, CAM: () => CAM, SCN: () => SCN, ENG: () => ENG, startBlackout, takeTape, spawnHowler, lightAt, useExit, hurt, startGame, beginPlay, baseLight, S, DBG, los, pauseGame, die, win, showEnd, simStep, K, useExit, SFX, AU, SUBS, say, playVoice, playS, VO_TXT, ABANK_G };
