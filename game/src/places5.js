// ---------- r6 · Level 5 places and story: the manager's office, the guest who never checked out, the rye ----------
// Second road through the staff door: the night manager's master key. The guest behind a locked door has it, and he wants a drink.
const P5 = {};
function resetP5() {
  for (const k of Object.keys(P5)) delete P5[k];
  Object.assign(P5, { pr: 'unmet', rye: false, ryeLeft: false, keyOut: false, master: false, opened: false, register: false, audit: false, board: false, seenOffice: false,
    knocks: 0, busy: 0, haleT: 0, haleSaid: false, ryeAsked: false });
}
resetP5();
const OFF5 = { x0: 17, y0: 29, x1: 18, y1: 30 };

// ----- layout (called from genLayout5 before the edges are resolved) -----
function planPlaces5(room, rect, way) {
  LV.office5 = null; LV.pruitt = null;
  let free = true; for (let y = OFF5.y0; y <= OFF5.y1; y++) for (let x = OFF5.x0; x <= OFF5.x1; x++) if (LV.zone[cIdx(x, y)] !== Z5.VOID) free = false;
  if (free) {
    LV.office5 = rect(room(Z5.ROOM, R5.S, 'office', { tint: [1, 0.92, 0.82] }), OFF5.x0, OFF5.y0, OFF5.x1, OFF5.y1);
    way(17, 28, 1, 'door', { dk: 'room', plaque: 'MANAGER', from: [17, 28], office: true });
  }
  // the guest who never checked out: a lit room off the north or west wing
  const pool = LV.guest.filter(g => !g.dark && (g.reg === R5.N || g.reg === R5.W)), alt = LV.guest.filter(g => !g.dark);
  const g = (pool.length ? pool : alt)[0] || null;
  if (g) { g.pruitt = true; LV.pruitt = g; }
}
function lightPlaces5() {
  lightState5();   // r7
  if (!LV.office5) return;
  const x = (OFF5.x0 + 1) * CELL, z = (OFF5.y0 + 1) * CELL;
  LV.fixtures.push({ x, z, state: 1, seed: RNG(), I: 0.3, rad: 6, sc: 1.8 }); LV.bulbs.push({ x, z, y: CEIL, kind: 'pend', state: 1 });
}
const pruittNum5 = () => LV.pruitt ? LV.pruitt.num : 0;
const pruittWho5 = () => 'ROOM ' + pruittNum5();

// ----- building (end of buildStory5: doors exist, the batch is still open) -----
function buildPlaces5() {
  const B = W5.B;
  W5.p5 = {};
  // the rye: gold label, on the Beverly bar
  { const r = atWall5({ x: BEV5.x0, y: 18, d: 2, c: cIdx(BEV5.x0, 18) }, 1.8, 0), p = localPt(r, 2.2, 1.11, 1.3);
    const m = mkMerged(W.itemMat, P => { P('Cylinder', { diameter: 0.08, height: 0.24, tessellation: 12 }, [0.42, 0.22, 0.06], 0.1, [0, 0.12, 0]); P('Cylinder', { diameterTop: 0.028, diameterBottom: 0.07, height: 0.07, tessellation: 10 }, [0.42, 0.22, 0.06], 0.1, [0, 0.275, 0]); P('Cylinder', { diameter: 0.03, height: 0.03, tessellation: 8 }, [0.12, 0.1, 0.08], 0, [0, 0.32, 0]); P('Cylinder', { diameter: 0.083, height: 0.08, tessellation: 12 }, [0.86, 0.68, 0.22], 0.35, [0, 0.12, 0]); }, 'rye5');
    m.position.set(p.x, 1.11, p.z); W5.p5.rye = m;
    W.interact.push({ x: p.x, z: p.z, y: 1.2, r: 1.9, label: () => 'TAKE THE RYE · GOLD LABEL', ok: () => !P5.rye && !P5.ryeLeft, act: () => takeRye5() }); }
  // the guest register on the front desk
  if (W5.deskR) { const p = localPt(W5.deskR, -0.5, 1.152, 1.55); W.interact.push({ x: p.x, z: p.z, y: 1.16, r: 1.8, label: () => 'READ THE GUEST REGISTER', ok: () => true, act: () => readRegister5() }); }
  if (LV.office5) buildOffice5(B);
  if (LV.pruitt) buildPruitt5(B);
  buildState5();   // r7: the State Floor's story objects
}
function buildOffice5(B) {
  const ws = wallSlots5(LV.office5.cells).filter(s => !s.door), pick5 = (pred) => { const i = ws.findIndex(pred); return i >= 0 ? ws.splice(i, 1)[0] : ws.shift(); };
  // the switchboard: a wall of jacks, one lamp lit
  const s1 = pick5(s => s.d === 2 || s.d === 0); if (s1) {
    const r = atWall5(s1, 0, 0); slotUse5(s1, 0, 1.4);
    B.add(r, 'Box', { width: 1.3, height: 1.1, depth: 0.32 }, COL5.mahog, 0, [0, 1.0, 0.16]); B.add(r, 'Box', { width: 1.2, height: 0.9, depth: 0.02 }, [0.12, 0.08, 0.05], 0, [0, 1.1, 0.33]);
    B.add(r, 'Box', { width: 1.3, height: 0.05, depth: 0.5 }, COL5.mahog2, 0, [0, 0.72, 0.4]);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) B.add(r, 'Cylinder', { diameter: 0.03, height: 0.02, tessellation: 8 }, COL5.brass, 0, [-0.49 + i * 0.14, 0.82 + j * 0.2, 0.345], [Math.PI / 2, 0, 0]);
    const lm = actMat('switch5', { emis: 1 }); setEmi(lm, 0.08, 0.05, 0.02);
    const lamp = mkMerged(lm, P => { P('Sphere', { diameter: 0.04, segments: 6 }, [1, 0.8, 0.4], 1, [0, 0, 0]); }, 'switchLamp'); const lp = localPt(r, 0.35, 1.48, 0.35); lamp.position.copyFrom(lp);
    plaqueOn(r, 0, 1.68, 'SWITCHBOARD', 0.4, 0.08, 0.34);
    solidLocal(r, -0.68, 0, 0.68, 0.66); W5.p5.lamp = lm;
    const p = localPt(r, 0, 1.0, 0.9);
    W.interact.push({ x: p.x, z: p.z, y: 1.0, r: 1.9, label: () => 'USE THE SWITCHBOARD', ok: () => true, act: () => useSwitch5() });
  }
  // the manager's desk with the night audit
  const s2 = pick5(() => true); if (s2) {
    placeF5(B, s2, 0, 'desk', { hw: 0.55 });
    const r = atWall5(s2, 0, 0), p = localPt(r, -0.15, 0.79, 0.45);
    B.add(propRoot(p.x, p.z, r.rotation.y + 0.2), 'Box', { width: 0.3, height: 0.04, depth: 0.22 }, [0.16, 0.2, 0.1], 0, [0, 0.8, 0]);
    W.interact.push({ x: p.x, z: p.z, y: 0.8, r: 1.8, label: () => 'READ THE NIGHT AUDIT', ok: () => true, act: () => readAudit5() });
  }
  const s3 = pick5(() => true); if (s3) placeF5(B, s3, 0, 'wardrobe', { hw: 0.55 });
  const s4 = pick5(() => true); if (s4) FURN5.painting(B, atWall5(s4, 0), { w: 0.9, h: 0.6, y: 1.7 });
}
function buildPruitt5(B) {
  const g = LV.pruitt, D = g.door, dr = W9.doorAt.get(eKey(D.x, D.y, D.d)); if (!dr) return;
  dr.pruitt = true; dr.locked = true; snapDoor5(dr, false); W5.p5.door = dr;
  // a card on the handle (corridor side) and, inside, a chair turned to the wall with an empty bottle
  const [mx, mz] = edgeMid(D.x, D.y, D.d), hx = mx - DX[D.d] * (WT / 2 + 0.02), hz = mz - DY[D.d] * (WT / 2 + 0.02);
  const card = propRoot(hx, hz, Math.atan2(-DX[D.d], -DY[D.d]));
  B.add(card, 'Box', { width: 0.12, height: 0.2, depth: 0.004 }, [0.86, 0.2, 0.12], 0.15, [DOORW / 2 - 0.2, 1.0, 0.03]);
  plaqueOn(card, DOORW / 2 + 0.34, 1.9, 'DO NOT DISTURB', 0.3, 0.07);
  const far = g.cells[g.cells.length - 1], cx = cellCenter(far % N), cz = cellCenter((far / N) | 0);
  const ch = propRoot(cx + DX[D.d] * 0.6, cz + DY[D.d] * 0.6, Math.atan2(DX[D.d], DY[D.d]));
  FURN5.armchair(B, ch, { col: [0.32, 0.12, 0.1] }); solidLocal(ch, -0.4, 0, 0.4, 0.83);
  const bt = propRoot(cx - DY[D.d] * 0.9, cz + DX[D.d] * 0.9, 0);
  B.add(bt, 'Cylinder', { diameter: 0.08, height: 0.24, tessellation: 10 }, [0.42, 0.22, 0.06], 0.05, [0, 0.12, 0], [0, 0, 1.45]);
  B.add(bt, 'Cylinder', { diameter: 0.083, height: 0.08, tessellation: 10 }, [0.86, 0.68, 0.22], 0.2, [0, 0.12, 0], [0, 0, 1.45]);
  W5.p5.inside = { x: cx, z: cz };
  // the master key, slid under the door once he has his drink (hidden until then)
  const km = mkMerged(W.itemMat, P => { P('Box', { width: 0.11, height: 0.006, depth: 0.025 }, [0.86, 0.7, 0.3], 0.5, [0, 0.003, 0]); P('Torus', { diameter: 0.05, thickness: 0.008, tessellation: 12 }, [0.86, 0.7, 0.3], 0.5, [-0.07, 0.004, 0]); P('Box', { width: 0.05, height: 0.003, depth: 0.04 }, [0.85, 0.82, 0.7], 0.2, [0.03, 0.006, 0.03]); }, 'master5');
  const kp = { x: mx - DX[D.d] * 0.55, z: mz - DY[D.d] * 0.55 }; km.position.set(kp.x, 0, kp.z); km.rotation.y = rnd(0, TAU); km.setEnabled(false);
  const rb = mkMerged(W.itemMat, P => { P('Cylinder', { diameter: 0.08, height: 0.24, tessellation: 12 }, [0.42, 0.22, 0.06], 0.1, [0, 0.12, 0]); P('Cylinder', { diameter: 0.083, height: 0.08, tessellation: 12 }, [0.86, 0.68, 0.22], 0.35, [0, 0.12, 0]); }, 'ryeLeft');
  rb.position.set(mx - DX[D.d] * 0.3 - DY[D.d] * 0.35, 0, mz - DY[D.d] * 0.3 + DX[D.d] * 0.35); rb.setEnabled(false);
  W5.p5.key = { mesh: km, x: kp.x, z: kp.z }; W5.p5.ryeLeft = rb;
  W.interact.push({ x: kp.x, z: kp.z, y: 0.05, r: 1.7, label: () => 'TAKE THE MASTER KEY', ok: () => P5.keyOut && !P5.master, act: () => takeMaster5() });
}

// ----- door hooks (doorLabel5 / useDoor5 call these first) -----
function doorLabel5p(dr) {
  const st = doorLabelSt5(dr); if (st) return st;   // r7: portal doors, security
  if (dr.pruitt) {
    if (P5.pr === 'given' && P5.keyOut) return P5.opened ? (dr.target ? 'CLOSE DOOR' : 'OPEN DOOR') : `OPEN ROOM ${pruittNum5()}`;
    return P5.rye && P5.pr === 'asked' ? `LEAVE THE RYE AT ${pruittNum5()}` : `KNOCK ON ${pruittNum5()}`;
  }
  if (dr.locked && dr.dk === 'service' && P5.master) return 'UNLOCK THE STAFF DOOR · MASTER KEY';
  return null;
}
function useDoor5p(dr) {   // true = handled
  if (useDoorSt5(dr)) return true;   // r7
  if (dr.pruitt) {
    if (P5.pr === 'given' && P5.keyOut) { if (!P5.opened) openPruitt5(dr); else useDoor(dr); return true; }
    knockPruitt5(dr); return true;
  }
  if (dr.locked && dr.dk === 'service' && P5.master) { unlockStaff5(dr); return true; }
  return false;
}

// ----- the guest -----
function sayPr5(text, delay) { const dr = W5.p5.door; say(pruittWho5(), text, { pos: { x: dr.mx, z: dr.mz }, delay }); }
function knockPruitt5(dr) {
  if (FX.t < P5.busy) return;
  P5.busy = FX.t + 4; P5.knocks++; SFX5.knock({ x: dr.mx, y: 1.3, z: dr.mz, pl: { x: PL.x, z: PL.z } }, 3); makeNoise(0.2);
  if (P5.pr === 'unmet') {
    P5.pr = 'asked'; P5.busy = FX.t + 12;
    later(1.2, () => sayPr5('Housekeeping came already. Twice.'));
    later(1.3, () => sayPr5('You are not housekeeping. You have a light. Nobody here carries a light.'));
    later(1.4, () => sayPr5('Do me a kindness. The Beverly bar, top shelf, gold label. Rye. They stopped sending it up.'));
    later(9, () => { prTask5(); if (!P5.rye) task('rye', 'THE RYE · GOLD LABEL · BEVERLY BAR', { opt: true }); });
  } else if (P5.pr === 'asked' && P5.rye) {
    P5.rye = false; P5.ryeLeft = true; P5.pr = 'given'; P5.busy = FX.t + 14; W5.p5.ryeLeft.setEnabled(true); SFX.click(); toast('YOU LEAVE THE BOTTLE BY THE DOOR', 2);
    taskDone('rye', 'THE RYE · LEFT AT HIS DOOR', true);
    later(1.4, () => sayPr5('Leave it by the door. Step back. Further.'));
    later(7, () => { W5.p5.ryeLeft.setEnabled(false); SFX9.shut({ x: dr.mx, y: 1, z: dr.mz, pl: { x: PL.x, z: PL.z } }, false); });
    later(9, () => { P5.keyOut = true; W5.p5.key.mesh.setEnabled(true); SFX5.jingle(P9(W5.p5.key)); sayPr5('There. The night manager\'s key. He won\'t miss it.'); });
    later(10, () => sayPr5('Staff door is in the ballroom, by the bandstand. Don\'t come in here. I mean that kindly.'));
  } else if (P5.pr === 'asked') sayPr5(pick(['No rye? Then I am not decent. Come back.', 'Gold label. Not the brown one. The brown one is for guests.', 'Still out there? The bar is through the ballroom.']), 1.0);
  else sayPr5('I said don\'t come in.', 1.0);
}
function takeRye5() { P5.rye = true; W5.p5.rye.setEnabled(false); SFX.pickup(); toast('RYE · GOLD LABEL', 2); task('rye', 'THE RYE · GOLD LABEL', { opt: true, quiet: true }); if (P5.pr === 'asked') task('rye', `BRING THE RYE TO ROOM ${pruittNum5()}`, { opt: true }); }
function takeMaster5() {
  P5.master = true; W5.p5.key.mesh.setEnabled(false); SFX5.jingle(P9(W5.p5.key)); SFX.pickup();
  toast('THE NIGHT MANAGER\'S MASTER KEY', 2.6); cpSave('MASTER KEY'); flag('pruitt5', 'key');
  taskDone('pruitt', `ROOM ${pruittNum5()} · THE MASTER KEY`, true);
  task('open5', `ROOM ${pruittNum5()} · HE SAID DON'T COME IN`, { opt: true, quiet: true });
  if (['arrive', 'keys'].includes(G5.phase)) setPhase5('staff'); else setPhase5();
  radio5('master', 1.6);
}
function openPruitt5(dr) {
  P5.opened = true; dr.locked = false; useDoor(dr); flag('pruitt5', 'opened');
  later(0.8, () => {
    PL.san = Math.max(0, PL.san - 15); FX.glitch = Math.max(FX.glitch, 1.4); SFX.whisper();
    say('', '…you came in…', { mode: 'whisper' });
    taskDone('open5', `ROOM ${pruittNum5()} WAS EMPTY`, true); toast(`ROOM ${pruittNum5()} IS EMPTY`, 2.6);
  });
}
function prTask5() { if (!LV.pruitt) return; task('pruitt', `THE GUEST IN ROOM ${pruittNum5()}`, { opt: true, sub: P5.pr === 'asked' ? 'HE WANTS RYE FROM THE BEVERLY BAR. HE HAS THE NIGHT MANAGER\'S KEY' : 'HE WON\'T OPEN THE DOOR' }); setPhase5(); }

// ----- documents -----
function readRegister5() {
  P5.register = true; const n = pruittNum5();
  readDoc('register5', 'GUEST REGISTER', [
    `PRUITT, E. · Room ${n} · arrived 12 Oct 1951 · departed: (blank)`,
    'OKAFOR, D. · Room 541 · arrived 30 Sep 1996',
    'Party of four, M.E.G. · Rooms 512 to 515 · paid in almond water · departed in a hurry',
    'Last line, in a different pen: guest, no name given · no room · arrived 29 Sep 1996 · brought own light'], { kind: 'note' });
  if (!taskOf('pruitt')) prTask5();
}
function readAudit5() {
  P5.audit = true; const n = pruittNum5();
  readDoc('audit5', 'NIGHT AUDIT', [
    'Bell rang at 3:10. Nobody at the desk. Bell rang at 3:10.',
    `${n} wants rye again. Told him the bar is closed. The bar has been closed since the war.`,
    'Keys hang in the housekeeping closets now so I stop losing them. The east one is past the door marked EAST WING. Never walk the east corridor.',
    'Master key with me at all times.',
    '(the last entry is crossed out until it is just ink)'], { kind: 'log' });
  if (!taskOf('pruitt')) prTask5();
  setPhase5();
}
function useSwitch5() {
  const n = pruittNum5(); SFX5.click(P9({ x: PL.x, y: 1, z: PL.z })); FX.glitch = Math.max(FX.glitch, 0.3);
  if (!P5.board) {
    P5.board = true; toast(`EVERY LINE IS DEAD BUT ONE · ROOM ${n}`, 2.8);
    if (P5.pr === 'unmet') { P5.pr = 'asked'; later(1.5, () => say(pruittWho5(), 'Front desk? About time. Send up the rye. Gold label. I will be right here.', { radio: true })); later(6, () => { prTask5(); if (!P5.rye) task('rye', 'THE RYE · GOLD LABEL · BEVERLY BAR', { opt: true }); }); }
    else later(1.5, () => say(pruittWho5(), P5.pr === 'given' ? 'You again. I have what I need.' : 'Front desk? Where is my rye?', { radio: true }));
  } else say(pruittWho5(), pick(['I can hear you breathing on the line.', 'Ring off. The bell is enough.']), { radio: true, delay: 1 });
}

// ----- radio: Outpost Nine, or Dr. Hale if he made it -----
const L5_HALE = { eyes: 'Hale. Eyes off the wallpaper. I stayed here a week once. I only remember the Tuesday.', moth: 'Hale. Moths. Kill your light, let them have the lamps.', boil: 'Hale. Boilers. Three halls, three valves. Pressure is what keeps that exit shut.' };
function radio5who(key) { return flag('hale9') === 'saved' && L5_HALE[key] ? ['DR. HALE', L5_HALE[key]] : ['M.E.G. OUTPOST 9', L5_TXT[key]]; }
function arrive5extra() {
  const h = flag('hale9');
  if (h === 'saved') later(0.6, () => say('DR. HALE', 'This is as far as the car takes me. Go on. I will find you on the radio.', { pos: W5.elev ? { x: W5.elev.x, z: W5.elev.z + 1.4 } : null }));
  else if (h === 'left') later(30, () => { if (LVL === 5 && G.state === 'play') say('M.E.G. OUTPOST 9', 'Nine. Nobody on this end is talking about Hale. Keep moving.', { radio: true }); });
}
const W5_WHISPER = ['Room service.', 'Your key, sir.', 'The band is on its break.', 'Checkout was at noon.', 'Are you a guest of the hotel?', 'Shoes outside the door, please.'];
function whisper5() { const t = pick(W5_WHISPER); SFX.whisper(); say('', '…' + t.toLowerCase().replace(/[.?]$/, '') + '…', { mode: 'whisper' }); }

// ----- objectives, beats -----
function tasks5() {
  const keysTxt = `HOUSEKEEPING KEYS · ${G5.keys}/3`, alt = P5.master ? ' — OR THE MASTER KEY YOU HAVE' : P5.pr !== 'unmet' || P5.audit || P5.register ? ' — OR THE NIGHT MANAGER\'S MASTER KEY' : '';
  task('staff', 'OPEN THE STAFF DOOR IN THE BEVERLY ROOM', { quiet: true, sub: 'THREE HOUSEKEEPING KEYS: WEST, NORTH AND EAST WING CLOSETS' + alt });
  task('keys', keysTxt, { quiet: true });
  if (G5.keys >= 3) taskDone('keys', 'HOUSEKEEPING KEYS · 3/3', true);
  const past = ['stairs', 'valves', 'fire', 'exit'].includes(G5.phase) || W5.svDoor && !W5.svDoor.locked;
  if (past) { taskDone('staff', 'STAFF DOOR OPEN', true); if (G5.keys < 3) taskDone('keys', 'HOUSEKEEPING KEYS · NOT NEEDED', true); }
  if (G5.boilSeen || G5.phase === 'valves' || G5.phase === 'fire' || G5.phase === 'exit') { task('boil', `VENT THE BOILERS · VALVES ${G5.valves}/3`, { quiet: true }); if (G5.valves >= 3) taskDone('boil', 'BOILERS VENTED', true); }
  if (G5.phase === 'exit') task('exit5', 'REACH THE EMERGENCY EXIT', { quiet: true });
  tasksState5();   // r7
}
function places5Events(dt) {
  const c = cIdx(cellOf(PL.x), cellOf(PL.z));
  if (LV.office5 && LV.room[c] === LV.office5.id && !P5.seenOffice) { P5.seenOffice = true; toast('NIGHT MANAGER\'S OFFICE', 2.6); SFX.beep(1100, 0.05); }
  if (W5.p5.lamp) { const on = !P5.master; setEmi(W5.p5.lamp, on ? (Math.floor(FX.t * 1.2) % 2 ? 2.2 : 0.4) : 0.05, on ? 1.4 : 0.03, on ? 0.4 : 0.01); }
  if (flag('hale9') === 'saved' && !P5.haleSaid && (P5.haleT += dt) > 75 && !SUBS.cur) { P5.haleSaid = true; say('M.E.G. OUTPOST 9', 'Nine. Hale is back on our band. Says the car took him home. Don\'t ask me how.', { radio: true }); }
  if (LV.pruitt && !P5.ryeAsked && P5.pr === 'unmet' && W5.p5.door && dist2(PL.x, PL.z, W5.p5.door.mx, W5.p5.door.mz) < 3.2 && FX.t > P5.busy) {
    P5.ryeAsked = true; P5.busy = FX.t + 6; later(0.5, () => sayPr5('Is that housekeeping? No. Somebody with a light.'));
  }
}
function flags5() { flag('lusk5', ST5.keys ? 'keys' : ST5.sec ? 'master' : ''); flag('fed5', (ST5.fedE ? 1 : 0) + (ST5.fedB ? 1 : 0)); flag('pruittN', pruittNum5()); flag('pruitt5', P5.opened ? 'opened' : P5.master ? 'key' : P5.pr); flag('staff5', P5.master && G5.keys < 3 ? 'master' : 'keys'); flag('register5', P5.register); }
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { P5, knockPruitt5, takeRye5, takeMaster5, openPruitt5, readRegister5, readAudit5, useSwitch5, tasks5, flags5, places5Events }));
