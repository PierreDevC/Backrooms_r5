// ---------- Level 9 · doors, story props (terminals, map kiosk, gate, lockers, lab), pickups ----------
function mkMerged(mat, fn, name = 'm9') {
  const t = tnode(null), ps = [];
  fn((k, o, c, e, pos, rot, scl) => { const m = part(k, o, t, mat, c, e || 0, pos, rot, scl); ps.push(m); return m; });
  ps.forEach(p => p.computeWorldMatrix(true));
  const m = ps.length > 1 ? BABYLON.Mesh.MergeMeshes(ps, true, true) : ps[0];
  m.parent = null; t.dispose(); m.material = mat; m.isPickable = false; m.hasVertexAlpha = false; m.name = name; return m;
}
function attach(m, parent, x = 0, y = 0, z = 0, ry = 0) { m.parent = parent; m.position.set(x, y, z); m.rotation.y = ry; return m; }
function takeSlot(room, o = {}) {
  const s = roomSlots(room).find(s => slotFree(s) && (!o.noWin || !s.win) && (!o.deep || s.deepOk)); if (!s) return null; useSlot(s); return s;
}
const P9 = p => ({ x: p.x, y: p.y ?? 1.2, z: p.z, pl: { x: PL.x, z: PL.z } });

// ================= doors =================
const DOORC = { room: [0.84, 0.82, 0.76], back: [0.66, 0.64, 0.58], base: [0.36, 0.4, 0.42], stairs: [0.6, 0.48, 0.14],
  front: [[0.42, 0.1, 0.08], [0.12, 0.22, 0.16], [0.12, 0.16, 0.28], [0.82, 0.8, 0.74], [0.46, 0.32, 0.2]] };
function doorLeaf(col, metal) {
  const L = DOORW - 0.06, H = DOORH - 0.04, dk = col.map(v => v * 0.8);
  return mkMerged(W9.propMat, P => {
    P('Box', { width: L, height: H, depth: 0.045 }, col, 0, [L / 2, H / 2 + 0.01, 0]);
    if (metal) {
      for (const s of [-1, 1]) P('Box', { width: 0.72, height: 0.05, depth: 0.05 }, [0.26, 0.27, 0.27], 0, [L / 2 + 0.1, 1.0, s * 0.045]);
      P('Box', { width: 0.3, height: 0.36, depth: 0.05 }, [0.04, 0.05, 0.06], 0, [L / 2, 1.62, 0]);
      P('Box', { width: 0.5, height: 0.08, depth: 0.05 }, [0.8, 0.62, 0.1], 0, [L / 2, 0.3, 0]);
    } else for (const s of [-1, 1]) for (const [px, py, ph] of [[0.27, 0.52, 0.66], [0.73, 0.52, 0.66], [0.27, 1.48, 0.98], [0.73, 1.48, 0.98]])
      P('Box', { width: 0.38, height: ph, depth: 0.012 }, dk, 0, [px * L, py, s * 0.026]);
    for (const s of [-1, 1]) { P('Sphere', { diameter: 0.065, segments: 6 }, [0.72, 0.6, 0.3], 0, [L - 0.09, 0.98, s * 0.062]); P('Box', { width: 0.05, height: 0.14, depth: 0.012 }, [0.6, 0.5, 0.26], 0, [L - 0.09, 0.98, s * 0.028]); }
    for (const y of [0.3, 1.8]) P('Box', { width: 0.03, height: 0.1, depth: 0.056 }, [0.3, 0.3, 0.28], 0, [0.012, y, 0]);
  }, 'door');
}
function buildDoors9() {
  W9.doorAnim = new Set();
  for (const e of LV.ek.values()) {
    if (e.kind !== 'way' || !e.door || e.dk === 'cell') continue;
    const horiz = e.d === 1 || e.d === 3, [mx, mz] = edgeMid(e.x, e.y, e.d);
    const s = e.dk === 'room' ? (RNG() < 0.5 ? 1 : -1) : (e.d === 0 || e.d === 1) ? -1 : 1;
    const h = e.house !== undefined ? LV.houses[e.house] : null;
    const col = e.dk === 'front' ? (h.doorCol || (h.doorCol = pick(DOORC.front))) : DOORC[e.dk] || DOORC.room, metal = e.dk === 'base' || e.dk === 'stairs';
    const hinge = tnode(null, horiz ? mx - DOORW / 2 + 0.03 : mx, 0, horiz ? mz : mz - DOORW / 2 + 0.03);
    const mesh = doorLeaf(col, metal); mesh.parent = hinge;
    const c0 = horiz ? 0 : -Math.PI / 2, c1 = c0 + (horiz ? -s : s) * 1.62;
    const bx = horiz ? [mx - DOORW / 2, mz - WT / 2, mx + DOORW / 2, mz + WT / 2] : [mx - WT / 2, mz - DOORW / 2, mx + WT / 2, mz + DOORW / 2];
    const startOpen = e.dk === 'room' ? RNG() < 0.5 : false;
    const dr = { e, key: eKey(e.x, e.y, e.d), horiz, s, hinge, mesh, c0, c1, bx, mx, mz, house: h ? h.id : -1, dk: e.dk, metal,
      open: startOpen ? 1 : 0, target: startOpen ? 1 : 0, latched: false, solid: addSolid(bx[0], bx[1], bx[2], bx[3], 'door'), shake: 0, cull: e.dk === 'front' ? 44 : 26, bangs: 0 };
    LV.solids[dr.solid].off = startOpen; if (!startOpen) markDyn(bx[0], bx[1], bx[2], bx[3], 1);
    hinge.rotation.y = startOpen ? c1 : c0;
    W9.doors.push(dr); W9.doorAt.set(dr.key, dr);
    W.interact.push({ x: mx, z: mz, y: 1.1, r: 1.75, door: dr, label: () => dr.target ? 'CLOSE DOOR' : dr.latched ? 'UNLATCH & OPEN' : 'OPEN DOOR',
      ok: () => true, act: () => useDoor(dr), altLabel: () => dr.target ? null : dr.latched ? 'UNLATCH' : 'LATCH', alt: () => latchDoor(dr) });
  }
}
function doorClosed(x, y, d) { const dr = W9.doorAt.get(eKey(x, y, d)); return !!dr && dr.target === 0; }
function doorOn(x, y, d) { return W9.doorAt.get(eKey(x, y, d)) || null; }
function setDoor(dr, open) {
  const v = open ? 1 : 0; if (dr.target === v) return;
  dr.target = v; LV.navVer++;
  LV.solids[dr.solid].off = open; markDyn(dr.bx[0], dr.bx[1], dr.bx[2], dr.bx[3], open ? 0 : 1);
  if (open) { dr.latched = false; SFX9.creak(P9({ x: dr.mx, z: dr.mz }), dr.metal); }
  W9.doorAnim.add(dr);
}
function useDoor(dr) {
  if (dr.target) { setDoor(dr, false); makeNoise(0.3); }
  else { if (dr.latched) SFX9.latch(P9({ x: dr.mx, z: dr.mz }), false); setDoor(dr, true); makeNoise(0.18); }
}
function latchDoor(dr) {
  if (dr.target) return;
  dr.latched = !dr.latched; LV.navVer++; SFX9.latch(P9({ x: dr.mx, z: dr.mz }), dr.latched); makeNoise(0.08);
  toast(dr.latched ? 'DOOR LATCHED' : 'DOOR UNLATCHED', 1.3);
  if (dr.latched && !G9.latchTip) { G9.latchTip = true; }
}
function bangDoor(dr, hard = 1) { dr.shake = 0.45 * hard; dr.bangs++; W9.doorAnim.add(dr); SFX9.bang(P9({ x: dr.mx, z: dr.mz }), hard); FX.glitch = Math.max(FX.glitch, 0.4 * hard); }
function updateDoors9(dt) {
  for (const dr of W9.doorAnim) {
    const prev = dr.open, sp = dr.target ? 1.9 : 3.4;
    dr.open = dr.target ? Math.min(1, dr.open + dt * sp) : Math.max(0, dr.open - dt * sp);
    let a = lerp(dr.c0, dr.c1, smooth(0, 1, dr.open));
    if (dr.shake > 0) { dr.shake -= dt; a += Math.sin(FX.t * 70) * 0.03 * Math.max(0, dr.shake) * (dr.horiz ? 1 : -1); }
    dr.hinge.rotation.y = a;
    if (!dr.target && prev > 0 && dr.open === 0) SFX9.shut(P9({ x: dr.mx, z: dr.mz }), dr.metal);
    if (dr.open === dr.target && dr.shake <= 0) { dr.hinge.rotation.y = dr.target ? dr.c1 : dr.c0; W9.doorAnim.delete(dr); }
  }
}

// ================= terminals & map =================
function buildTerminal(h, idx) {
  let s = null;
  for (const r of [h.termRoom, ...h.rooms.filter(r => r !== h.termRoom && r !== h.entryRoom), h.entryRoom]) { s = takeSlot(r); if (s) { h.termRoom = r; break; } }
  if (!s) return;
  const B = W9.B, [px, pz, ry] = wallPt(s.x, s.y, s.d, 0.01, 0), r = propRoot(px, pz, ry), WD = COL9.wood, BEI = [0.72, 0.7, 0.62];
  B.add(r, 'Box', { width: 1.3, height: 0.04, depth: 0.66 }, WD, 0, [0, 0.74, 0.33]);
  for (const sx of [-1, 1]) B.add(r, 'Box', { width: 0.04, height: 0.72, depth: 0.62 }, WD, 0, [sx * 0.62, 0.36, 0.33]);
  B.add(r, 'Box', { width: 0.44, height: 0.38, depth: 0.4 }, BEI, 0, [-0.1, 0.95, 0.27]); B.add(r, 'Box', { width: 0.34, height: 0.28, depth: 0.14 }, BEI.map(v => v * 0.9), 0, [-0.1, 0.94, 0.03]);
  B.add(r, 'Box', { width: 0.46, height: 0.03, depth: 0.16 }, BEI, 0, [-0.1, 0.775, 0.58]);
  B.add(r, 'Box', { width: 0.2, height: 0.42, depth: 0.45 }, BEI, 0, [0.45, 0.21, 0.3]); B.add(r, 'Box', { width: 0.02, height: 0.02, depth: 0.005 }, [0.3, 1, 0.3], 1, [0.45, 0.36, 0.526]);
  B.add(r, 'Box', { width: 0.3, height: 0.07, depth: 0.2 }, [0.12, 0.12, 0.12], 0, [0.36, 0.795, 0.3]);
  for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.018, height: 0.012, depth: 0.004 }, i % 2 ? [1, 0.2, 0.1] : [0.2, 1, 0.3], 1, [0.26 + i * 0.05, 0.8, 0.401]);
  B.add(r, 'Box', { width: 0.16, height: 0.05, depth: 0.004 }, COL9.meg, 0.15, [0.03, 1.1, 0.472]);
  for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.21, height: 0.004, depth: 0.29 }, [0.88, 0.86, 0.78], 0, [rnd(-0.55, -0.35) + i * 0.02, 0.763 + i * 0.004, rnd(0.25, 0.5)], [0, rnd(-0.5, 0.5), 0]);
  B.add(r, 'Box', { width: 0.42, height: 0.04, depth: 0.42 }, COL9.dark, 0, [-0.55, 0.46, 1.1], [0, 0.5, 0.08]); B.add(r, 'Box', { width: 0.42, height: 0.44, depth: 0.05 }, COL9.dark, 0, [-0.62, 0.7, 1.28], [0, 0.5, 0]);
  solidLocal(r, -0.66, 0, 0.66, 0.68);
  const dyn = propRoot(px, pz, ry), sc = dynTexPlane('term' + idx, 0.35, 0.26, 256, 192, dyn, [-0.1, 0.955, 0.472], 1.2);
  const pos = localPt(r, -0.1, 0.96, 0.6);
  const T = { h, i: idx, x: pos.x, z: pos.z, pos, scr: localPt(r, -0.1, 0.955, 0.472), sc, done: false, prog: 0, active: false, away: 0, drawK: '', need: 12, woke: 0 };
  W9.terms.push(T); h.term = T;
  W.interact.push({ x: pos.x, z: pos.z, y: 0.96, r: 2.1, label: () => 'DOWNLOAD M.E.G. DATA', ok: () => !T.done && !T.active, act: () => startDownload(T) });
  drawTerm(T);
}
function drawTerm(T) {
  const c = T.sc.ctx, w = 256, h = 192, blink = Math.floor(FX.t * 2) % 2, st = T.done ? 'done' : T.active ? (T.away > 0.25 ? 'lost' : 'dl') : 'idle';
  const pc = Math.floor(clamp(T.prog / T.need, 0, 1) * 100), key = st + pc + blink;
  if (key === T.drawK) return; T.drawK = key;
  c.fillStyle = '#021208'; c.fillRect(0, 0, w, h);
  const G1 = '#3dff7e'; c.fillStyle = G1; c.font = 'bold 15px monospace'; c.fillText('M.E.G. FIELD NODE 9-' + (T.i + 1), 12, 24); c.fillRect(12, 31, 232, 2);
  c.font = '13px monospace';
  if (st === 'idle') { c.fillText('ARCHIVE : WRETCH STUDY', 12, 56); c.fillText('LINK    : OUTPOST 9 GATE', 12, 74); c.fillText('STATUS  : SEALED', 12, 92); if (blink) c.fillText('> PRESS [E] TO DOWNLOAD_', 12, 138); }
  else if (st === 'done') { c.fillText('TRANSFER COMPLETE', 12, 60); c.fillText('GATE KEY ' + G9.data + '/3 ACCEPTED', 12, 80); c.fillText('NODE WIPED.', 12, 100); if (blink) c.fillText('> _', 12, 138); }
  else {
    c.fillText(st === 'lost' ? 'LINK INTERRUPTED' : 'DOWNLOADING…', 12, 58); c.fillText(pc + '%', 200, 58);
    c.strokeStyle = G1; c.lineWidth = 2; c.strokeRect(12, 70, 232, 22); c.fillRect(15, 73, 226 * pc / 100, 16);
    c.fillText(st === 'lost' ? (blink ? '! RETURN TO TERMINAL !' : '') : 'STAY WITHIN RANGE', 12, 116);
    for (let i = 0; i < 3; i++) c.fillText([...Array(20)].map(() => '01'[Math.random() * 2 | 0]).join(''), 12, 140 + i * 15);
  }
  c.fillStyle = 'rgba(0,0,0,0.28)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
  T.sc.dt.update();
}
function buildKiosk() {
  const x = 21.25 * CELL, z = 27 * CELL + 0.62, r = propRoot(x, z, 0), B = W9.B, K = [0.26, 0.28, 0.26];
  B.add(r, 'Box', { width: 0.14, height: 1.1, depth: 0.14 }, K, 0, [0, 0.55, 0]);
  B.add(r, 'Box', { width: 1.22, height: 0.92, depth: 0.22 }, [0.2, 0.22, 0.2], 0, [0, 1.45, 0]);
  B.add(r, 'Box', { width: 1.32, height: 0.06, depth: 0.42 }, K, 0, [0, 1.95, 0.08], [-0.12, 0, 0]);
  B.add(r, 'Box', { width: 1.22, height: 0.06, depth: 0.23 }, COL9.meg, 0.1, [0, 0.98, 0]);
  B.add(r, 'Box', { width: 0.5, height: 0.35, depth: 0.12 }, [0.18, 0.18, 0.17], 0, [0, 0.35, 0.02]);
  for (let i = 0; i < 3; i++) B.add(r, 'Cylinder', { diameter: 0.04, height: 1.2, tessellation: 5 }, COL9.dark, 0, [0.2 + i * 0.08, 0.6, -0.14], [0.3, 0, 0.1 * i]);
  const dyn = propRoot(x, z, 0), sc = dynTexPlane('map9', 1.04, 0.76, 512, 374, dyn, [0, 1.45, 0.113], 1.05);
  addSolid(x - 0.62, z - 0.14, x + 0.62, z + 0.14, 'prop');
  W9.kiosk = { x, z, pos: localPt(r, 0, 1.45, 0.3), sc, drawK: '' };
  W.interact.push({ x, z: z + 0.12, y: 1.45, r: 2.3, label: () => 'STUDY THE MAP', ok: () => true, act: () => studyMap9() });
  drawMap9(sc.ctx, 512, 374, { kiosk: true, flash: true }); sc.dt.update();
}
// top-down neighbourhood map (kiosk screen & the camcorder snapshot overlay). North (+z) is up.
function drawMap9(c, w, h, o = {}) {
  const n = L9_NB, sc = Math.min(w / (n + 2), h / (n + 2)), ox = (w - n * sc) / 2, oy = (h - n * sc) / 2;
  const X = x => ox + x * sc, Y = z => oy + (n - z) * sc;
  c.fillStyle = '#03100a'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const z = LV.zone[cIdx(x, y)];
    c.fillStyle = z === ZN.STREET ? '#1d4a30' : z === ZN.DRIVE ? '#12301f' : z === ZN.YARD ? '#15382a' : '#081a10';
    c.fillRect(X(x), Y(y + 1), sc + 0.5, sc + 0.5);
  }
  const blink = o.flash !== false && Math.floor(FX.t * 2.5) % 2 === 0;
  for (const hs of LV.houses) {
    const x0 = X(hs.hx) + 1, y0 = Y(hs.hz + HS) + 1, s = HS * sc - 2;
    let fill = hs.enter ? '#2e6a45' : '#1a3a26';
    if (hs.red) { const done = hs.term && hs.term.done; fill = done ? '#39ff7a' : blink ? '#ff2a1a' : '#6a1208'; }
    c.fillStyle = fill; c.fillRect(x0, y0, s, s);
    if (hs.red && !(hs.term && hs.term.done)) { c.strokeStyle = '#ff5a40'; c.lineWidth = 2; c.strokeRect(x0 - 2, y0 - 2, s + 4, s + 4); }
    if (hs.cans && G9.crowbar) { c.fillStyle = '#ffd23a'; c.font = `bold ${Math.round(sc * 1.4)}px monospace`; c.fillText('C', x0 + s / 2 - sc * 0.45, y0 + s / 2 + sc * 0.5); }
  }
  // compound
  c.strokeStyle = '#7dffae'; c.lineWidth = 2; c.strokeRect(X(18), Y(27), 9 * sc, 9 * sc);
  c.fillStyle = G9.gateOpen ? '#39ff7a' : '#ff5a40'; c.fillRect(X(22), Y(27) - 2, sc, 5);
  c.fillStyle = '#2b5a3d'; c.fillRect(X(19), Y(25), 7 * sc, 6 * sc);
  c.fillStyle = '#b8ffd0'; c.font = `bold ${Math.round(sc * 1.25)}px monospace`; c.fillText('M.E.G.', X(19.6), Y(22.6)); c.font = `${Math.round(sc * 0.95)}px monospace`; c.fillText('OUTPOST 9', X(19.5), Y(21.2));
  if (G9.crowbar && W9.van) { c.fillStyle = '#ffd23a'; c.fillRect(X(W9.van.x / CELL) - sc * 0.6, Y(W9.van.z / CELL) - sc * 0.6, sc * 1.2, sc * 1.2); }
  drawStory9(c, X, Y, sc);
  // you-are-here / camcorder position
  const pp = phys9(PL.x, PL.z), px = o.kiosk ? W9.kiosk.x / CELL : pp[0] / CELL, pz = o.kiosk ? W9.kiosk.z / CELL + 0.3 : pp[1] / CELL;
  if (o.kiosk || (px < n && pz < n)) {
    c.save(); c.translate(X(px), Y(pz)); if (!o.kiosk) c.rotate(PL.yaw); c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(0, -sc * 1.1); c.lineTo(sc * 0.7, sc * 0.7); c.lineTo(-sc * 0.7, sc * 0.7); c.closePath(); c.fill(); c.restore();
    c.fillStyle = '#ffffff'; c.font = `bold ${Math.round(sc * 0.9)}px monospace`; c.fillText(o.kiosk ? 'YOU ARE HERE' : 'YOU', X(px) + sc, Y(pz) + sc * 2);
  }
  c.fillStyle = '#7dffae'; c.font = `bold ${Math.round(sc * 1.1)}px monospace`; c.fillText('N ▲', w - sc * 4, sc * 1.8);
  c.font = `${Math.round(sc * 0.9)}px monospace`; c.fillText(G9.data >= 3 ? 'DATA 3/3 · GATE OPEN' : `SIGNAL NODES · DATA ${G9.data || 0}/3`, sc * 1.2, sc * 1.6);
  c.fillStyle = 'rgba(0,0,0,0.22)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
}

// ================= compound: gate, base exterior =================
function buildGate() {
  const x0 = 22 * CELL, z = 27 * CELL - 0.07, root = tnode(null, x0, 0, z), B = W9.B, ST = COL9.metal;
  const g = new Geo(true); g.face(0.06, 0.08, 0, [1, 0, 0], [0, 1, 0], CELL - 0.12, 2.2, [0, 0, 1], 1, false, [1, 1, 1, 1]);
  const chain = g.mesh('gateChain', SCN); chain.material = W9.chainMat; chain.parent = root; chain._sortD = 350;
  const frame = mkMerged(W9.propMat, P => {
    for (const x of [0.04, CELL - 0.04]) P('Box', { width: 0.06, height: 2.36, depth: 0.06 }, ST, 0, [x, 1.2, 0]);
    for (const y of [0.06, 1.2, 2.34]) P('Box', { width: CELL, height: 0.05, depth: 0.05 }, ST, 0, [CELL / 2, y, 0]);
    P('Box', { width: 0.8, height: 0.42, depth: 0.02 }, [0.85, 0.7, 0.12], 0.05, [CELL / 2, 1.5, 0.045]);
    for (let i = 0; i < 4; i++) P('Box', { width: 0.07, height: 0.42, depth: 0.022 }, [0.08, 0.08, 0.08], 0, [CELL / 2 - 0.3 + i * 0.2, 1.5, 0.047], [0, 0, 0.6]);
    for (const x of [0.3, CELL - 0.3]) P('Cylinder', { diameter: 0.12, height: 0.05, tessellation: 10 }, COL9.dark, 0, [x, 0.06, 0], [Math.PI / 2, 0, 0]);
  }, 'gate'); frame.parent = root;
  const ledMat = actMat('gateLed', { emis: 1 }); setEmi(ledMat, 3, 0.15, 0.1);
  const led = mkMerged(ledMat, P => P('Box', { width: 0.1, height: 0.1, depth: 0.06 }, [1, 1, 1], 1, [0, 0, 0]), 'gateLed'); led.position.set(23 * CELL + 0.14, 2.1, 27 * CELL + 0.06);
  B.add(propRoot(23 * CELL + 0.14, 27 * CELL, 0), 'Box', { width: 0.12, height: 2.5, depth: 0.12 }, ST, 0, [0, 1.25, 0]);
  B.add(propRoot(23 * CELL + 0.14, 27 * CELL, 0), 'Box', { width: 0.2, height: 0.3, depth: 0.12 }, [0.22, 0.23, 0.22], 0, [0, 1.3, 0.1]);
  const sol = addSolid(x0, z - 0.06, x0 + CELL, z + 0.06, 'gate');
  W9.gate = { root, x0, open: 0, opening: false, solid: sol, ledMat, x: x0 + CELL / 2, z: z + 0.1 };
  W.interact.push({ x: x0 + CELL / 2, z: 27 * CELL + 0.1, y: 1.3, r: 2.0, label: () => `GATE LOCKED · DATA ${G9.data}/3`, ok: () => !G9.gateOpen, act: () => { SFX.beep(240, 0.25); later(0.3, () => SFX.beep(200, 0.3)); toast(`GATE SEALED — DOWNLOAD M.E.G. DATA FROM THE 3 MARKED HOUSES (${G9.data}/3)`, 3.2); if (!G9.mapSeen) later(1, () => toast('THE MAP BY THE GATE SHOWS WHERE', 2.6)); } });
}
function openGate() {
  const g = W9.gate; if (g.opening) return;
  g.opening = true; LV.solids[g.solid].off = true; setEdge(22, 26, 1, 0); LV.navVer++; PL.cell = -1;
  setEmi(g.ledMat, 0.2, 3, 0.4); SFX9.gate(P9({ x: g.x, z: g.z }));
}
function buildBaseExterior() {
  const B = W9.B, zf = 25 * CELL + WT / 2;
  // painted sign over the door
  const dyn = propRoot(22.5 * CELL, zf, 0), s = dynTexPlane('megSign', 2.6, 0.5, 512, 100, dyn, [0, 2.5, 0.012], 0.38), c = s.ctx;
  c.fillStyle = '#d8d2bf'; c.fillRect(0, 0, 512, 100); c.fillStyle = '#c56b12'; c.fillRect(0, 0, 512, 14); c.fillRect(0, 86, 512, 14);
  c.fillStyle = '#1b1b1b'; c.font = 'bold 40px sans-serif'; c.fillText('M.E.G.  OUTPOST 9', 60, 64); c.font = 'bold 13px sans-serif'; c.fillText('MAJOR EXPLORER GROUP · AUTHORIZED PERSONNEL ONLY', 72, 82); s.dt.update();
  // flood lamp on a pole by the gate
  const fx = 22.5 * CELL, fz = 26.3 * CELL, px = 23 * CELL + 0.45, pz = 27 * CELL - 0.35, pr = propRoot(px, pz, Math.atan2(fx - px, fz - pz)), arm = Math.hypot(fx - px, fz - pz);
  B.add(pr, 'Cylinder', { diameter: 0.12, height: 4.7, tessellation: 8 }, COL9.steel, 0, [0, 2.35, 0]);
  B.add(pr, 'Box', { width: 0.06, height: 0.06, depth: arm }, COL9.steel, 0, [0, 4.6, arm / 2]);
  B.add(pr, 'Box', { width: 0.5, height: 0.22, depth: 0.36 }, [0.2, 0.2, 0.2], 0, [0, 4.45, arm], [0.5, 0, 0]);
  W9.BFl.add(pr, 'Box', { width: 0.42, height: 0.03, depth: 0.3 }, [1, 0.9, 0.7], 1, [0, 4.32, arm + 0.06], [0.5, 0, 0]);
  addSolid(px - 0.1, pz - 0.1, px + 0.1, pz + 0.1, 'prop');
  // antenna mast with a blinking beacon
  const ax = 19.6 * CELL, az = 19.6 * CELL, ar = propRoot(ax, az, 0.4);
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; B.add(ar, 'Cylinder', { diameter: 0.04, height: 7.2, tessellation: 5 }, COL9.metal, 0, [Math.sin(a) * 0.22, 3.2 + 3.6, Math.cos(a) * 0.22]); }
  for (let y = 3.6; y < 10.2; y += 0.6) B.add(ar, 'Cylinder', { diameter: 0.5, height: 0.025, tessellation: 3 }, COL9.metal, 0, [0, y, 0]);
  B.add(ar, 'Box', { width: 1.4, height: 0.05, depth: 0.05 }, COL9.metal, 0, [0, 9.4, 0]); B.add(ar, 'Box', { width: 0.05, height: 0.05, depth: 1.1 }, COL9.metal, 0, [0, 8.6, 0]);
  const bm = actMat('mastLamp', { emis: 1 }); W9.mastMat = bm;
  const bl = mkMerged(bm, P => P('Sphere', { diameter: 0.2, segments: 6 }, [1, 0.12, 0.06], 1, [0, 0, 0])); bl.position.set(ax, 10.45, az);
  W9.mast = { x: ax, y: 10.45, z: az };
  // yard clutter: crates, sandbags, generator (kept off the gate->door path)
  const crate = (x, z, ry, s = 1) => { const r = propRoot(x, z, ry); B.add(r, 'Box', { width: 1.1 * s, height: 0.8 * s, depth: 0.8 * s }, [0.3, 0.33, 0.24], 0, [0, 0.4 * s, 0]); B.add(r, 'Box', { width: 1.12 * s, height: 0.1, depth: 0.82 * s }, COL9.meg, 0.03, [0, 0.62 * s, 0]); solidLocal(r, -0.55 * s, -0.4 * s, 0.55 * s, 0.4 * s); };
  crate(20.2 * CELL, 25.6 * CELL, 0.2); crate(20.35 * CELL, 25.62 * CELL + 0.1, 0.1, 0.7); crate(24.6 * CELL, 26.2 * CELL, -0.4);
  const gr = propRoot(25.4 * CELL, 25.5 * CELL, 0.1);
  B.add(gr, 'Box', { width: 1.6, height: 0.9, depth: 0.9 }, [0.3, 0.36, 0.26], 0, [0, 0.55, 0]); B.add(gr, 'Box', { width: 1.7, height: 0.12, depth: 1.0 }, COL9.dark, 0, [0, 0.06, 0]);
  B.add(gr, 'Cylinder', { diameter: 0.1, height: 0.8, tessellation: 6 }, COL9.dark, 0, [0.6, 1.3, 0.2]); solidLocal(gr, -0.85, -0.5, 0.85, 0.5);
  W9.gen = { x: 25.4 * CELL, z: 25.5 * CELL };
  for (let i = 0; i < 6; i++) { const r = propRoot(18.3 * CELL + i * 0.62, 26.75 * CELL, 0); B.add(r, 'Sphere', { diameter: 0.62, segments: 5 }, [0.42, 0.38, 0.26], 0, [0, 0.2, 0], null, [1, 0.5, 0.7]); }
  addSolid(18.3 * CELL - 0.3, 26.75 * CELL - 0.22, 18.3 * CELL + 3.4, 26.75 * CELL + 0.22, 'prop');
}
// painted "LAB" guidance: floor arrows + glow-paint wall stencils
function floorArrow(x, z, ang) {
  const r = propRoot(x, z, ang), col = [0.92, 0.68, 0.1], B = W9.B;
  B.add(r, 'Box', { width: 0.14, height: 0.006, depth: 0.7 }, col, 0.22, [0, 0.004, -0.2]);
  for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.12, height: 0.006, depth: 0.5 }, col, 0.22, [s * 0.15, 0.005, 0.28], [0, -s * 0.62, 0]);
}
function labSigns() {
  const A = Math.atan2, E = A(1, 0), Wd = A(-1, 0), Nn = A(0, -1), S = 0;
  const path = [[22, 24, Wd], [21, 24, A(0, -1)], [21, 23, Wd], [20, 23, Nn], [20, 22, Nn], [20, 21, Nn], [20, 20, Nn], [20, 19, E], [21, 19, E], [22, 19, E], [23, 19, E], [24, 19, E], [25, 19, S]];
  for (const [x, y, a] of path) floorArrow(cellCenter(x), cellCenter(y), a);
  const mk = (txt) => { const dt = new BABYLON.DynamicTexture('sgn', { width: 256, height: 96 }, SCN, false), c = dt.getContext(); c.clearRect(0, 0, 256, 96);
    c.fillStyle = '#e8b21a'; c.font = 'bold 44px sans-serif'; c.fillText(txt, 14, 64); dt.hasAlpha = true; dt.update();
    return dtexMat('sgnM', dt, 0.9, true); };
  const mR = mk('LAB B1 ▶'), mL = mk('◀ LAB B1');
  const sign = (m, x, y, d, along = 0) => { const [px, pz, ry] = wallPt(x, y, d, 0.012, along), p = BABYLON.MeshBuilder.CreatePlane('sgnP', { width: 0.9, height: 0.34 }, SCN); p.material = m; p.position.set(px, 1.55, pz); p.rotation.y = ry + Math.PI; p.isPickable = false; };
  sign(mR, 22, 23, 3); sign(mR, 20, 21, 0); sign(mL, 20, 19, 3); sign(mL, 25, 19, 0);
}

// ================= lockers & canisters =================
function mkCanister(mat) {
  return mkMerged(mat, P => {
    P('Cylinder', { diameter: 0.15, height: 0.32, tessellation: 12 }, [0.42, 1, 0.5], 0.95, [0, 0.22, 0]);
    for (const y of [0.04, 0.4]) P('Cylinder', { diameter: 0.18, height: 0.07, tessellation: 12 }, [0.55, 0.56, 0.56], 0, [0, y, 0]);
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; P('Box', { width: 0.016, height: 0.34, depth: 0.016 }, [0.5, 0.5, 0.5], 0, [Math.sin(a) * 0.085, 0.22, Math.cos(a) * 0.085]); }
    P('Cylinder', { diameter: 0.05, height: 0.06, tessellation: 8 }, [0.7, 0.1, 0.08], 0, [0, 0.47, 0]);
    P('Box', { width: 0.1, height: 0.05, depth: 0.004 }, [0.95, 0.8, 0.15], 0.1, [0, 0.3, 0.078]);
  }, 'can');
}
function buildLocker(x, z, ry, kind, where) {
  const B = W9.B, r = propRoot(x, z, ry), ST = [0.3, 0.36, 0.33], IN = [0.08, 0.09, 0.09], lock = [0.75, 0.62, 0.3];
  const dyn = propRoot(x, z, ry); let hinge, door, cy;
  if (kind === 'crate') {
    B.add(r, 'Box', { width: 1.0, height: 0.5, depth: 0.04 }, ST, 0, [0, 0.27, 0.02]); B.add(r, 'Box', { width: 1.0, height: 0.5, depth: 0.04 }, ST, 0, [0, 0.27, 0.6]);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.04, height: 0.5, depth: 0.6 }, ST, 0, [s * 0.48, 0.27, 0.31]);
    B.add(r, 'Box', { width: 1.0, height: 0.04, depth: 0.62 }, IN, 0, [0, 0.03, 0.31]); B.add(r, 'Box', { width: 0.3, height: 0.06, depth: 0.02 }, COL9.meg, 0.05, [0, 0.4, 0.625]);
    hinge = tnode(dyn, 0, 0.53, 0.0);
    door = mkMerged(W9.propMat, P => { P('Box', { width: 1.02, height: 0.05, depth: 0.63 }, ST, 0, [0, 0.025, 0.315]); P('Box', { width: 0.07, height: 0.12, depth: 0.03 }, lock, 0, [0, -0.04, 0.64]); P('Box', { width: 0.05, height: 0.05, depth: 0.03 }, [0.3, 0.3, 0.3], 0, [0, -0.1, 0.66]); }, 'lid');
    attach(door, hinge); cy = 0.06;
    solidLocal(r, -0.52, 0, 0.52, 0.64);
  } else {
    B.add(r, 'Box', { width: 0.64, height: 1.92, depth: 0.03 }, ST, 0, [0, 0.96, 0.015]);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.03, height: 1.92, depth: 0.5 }, ST, 0, [s * 0.305, 0.96, 0.25]);
    for (const y of [0.02, 1.9]) B.add(r, 'Box', { width: 0.64, height: 0.04, depth: 0.5 }, ST, 0, [0, y, 0.25]);
    B.add(r, 'Box', { width: 0.58, height: 1.86, depth: 0.01 }, IN, 0, [0, 0.96, 0.035]); B.add(r, 'Box', { width: 0.58, height: 0.03, depth: 0.44 }, [0.2, 0.22, 0.22], 0, [0, 0.9, 0.25]);
    B.add(r, 'Box', { width: 0.5, height: 0.1, depth: 0.004 }, COL9.meg, 0.04, [0, 1.75, 0.502]);
    hinge = tnode(dyn, -0.3, 0, 0.5);
    door = mkMerged(W9.propMat, P => {
      P('Box', { width: 0.6, height: 1.86, depth: 0.03 }, ST, 0, [0.3, 0.96, 0.015]);
      for (let i = 0; i < 5; i++) P('Box', { width: 0.3, height: 0.012, depth: 0.01 }, IN, 0, [0.3, 1.55 + i * 0.05, 0.033]);
      P('Box', { width: 0.04, height: 0.18, depth: 0.04 }, [0.2, 0.2, 0.2], 0, [0.52, 1.05, 0.04]);
      P('Box', { width: 0.07, height: 0.09, depth: 0.03 }, lock, 0, [0.52, 0.92, 0.06]); P('Torus', { diameter: 0.05, thickness: 0.012, tessellation: 10 }, [0.6, 0.6, 0.6], 0, [0.52, 0.98, 0.06], [Math.PI / 2, 0, 0]);
    }, 'lockerDoor');
    attach(door, hinge); cy = 0.92;
    solidLocal(r, -0.33, 0, 0.33, 0.52);
  }
  const can = mkCanister(W9.canMat); attach(can, dyn, 0, cy, kind === 'crate' ? 0.31 : 0.26);
  const f = localPt(r, 0, 0, kind === 'crate' ? 0.9 : 0.8);
  const L = { where, kind, x: f.x, z: f.z, dyn, hinge, door, can, st: 'locked', ang: 0, pryT: 0 };
  W9.lockers.push(L);
  W.interact.push({ x: f.x, z: f.z, y: kind === 'crate' ? 0.4 : 1.0, r: 1.9, label: () => L.st === 'locked' ? (G9.crowbar ? 'PRY OPEN THE PADLOCK' : 'PADLOCKED LOCKER') : 'TAKE FLUID CANISTER',
    ok: () => L.st === 'locked' || L.st === 'open', act: () => useLocker(L) });
  return L;
}

// ================= the lab =================
function buildLab() {
  const B = W9.B, R = LV.lab.R, X = x => x * CELL, ST = COL9.steel;
  for (const c of [cIdx(LAB_X, 2), cIdx(LAB_X + 4, 2), cIdx(LAB_X, 7), cIdx(LAB_X + 4, 7), cIdx(LAB_X + 3, 9), cIdx(LAB_X + 2, 1), cIdx(LAB_X + 2, 2), cIdx(LAB_X + 2, 3), cIdx(LAB_X + 2, 4), cIdx(LAB_X + 2, 9), cIdx(LAB_X, 1), cIdx(LAB_X + 4, 1), cIdx(LAB_X, 9), cIdx(LAB_X + 4, 9)]) W9.busy.add(c);
  // --- canister rack (west wall of the decon room) ---
  { const [px, pz, ry] = wallPt(LAB_X, 2, 2, 0.01, 0), r = propRoot(px, pz, ry), dyn = propRoot(px, pz, ry);
    B.add(r, 'Box', { width: 1.9, height: 1.9, depth: 0.08 }, [0.42, 0.44, 0.44], 0, [0, 0.95, 0.04]);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.06, height: 1.9, depth: 0.5 }, ST, 0, [s * 0.92, 0.95, 0.25]);
    B.add(r, 'Box', { width: 1.9, height: 0.05, depth: 0.5 }, ST, 0, [0, 0.72, 0.25]); B.add(r, 'Box', { width: 1.9, height: 0.05, depth: 0.5 }, ST, 0, [0, 1.85, 0.25]);
    B.add(r, 'Box', { width: 1.2, height: 0.16, depth: 0.01 }, [0.9, 0.86, 0.72], 0.05, [0, 1.62, 0.085]);
    const sockets = [];
    for (let i = 0; i < 4; i++) {
      const sx = -0.63 + i * 0.42;
      B.add(r, 'Cylinder', { diameter: 0.24, height: 0.05, tessellation: 12 }, COL9.dark, 0, [sx, 0.77, 0.25]);
      B.add(r, 'Torus', { diameter: 0.22, thickness: 0.02, tessellation: 12 }, ST, 0, [sx, 1.12, 0.25]);
      B.add(r, 'Cylinder', { diameter: 0.05, height: 0.62, tessellation: 6 }, [0.5, 0.5, 0.48], 0, [sx, 1.55, 0.2]);
      B.add(r, 'Cylinder', { diameter: 0.08, height: 0.04, tessellation: 8 }, [0.7, 0.1, 0.08], 0, [sx + 0.1, 1.45, 0.3], [Math.PI / 2, 0, 0]);
      const can = mkCanister(W9.canMat); attach(can, dyn, sx, 0.8, 0.25); can.setEnabled(false);
      sockets.push({ can, filled: false, pos: localPt(r, sx, 1.0, 0.3) });
    }
    solidLocal(r, -0.97, 0, 0.97, 0.5);
    const f = localPt(r, 0, 0, 0.95);
    W9.rack = { sockets, x: f.x, z: f.z, n: 0 };
    W.interact.push({ x: f.x, z: f.z, y: 1.0, r: 2.1, label: () => G9.carry > 0 ? `INSTALL CANISTER${G9.carry > 1 ? 'S' : ''} (${G9.carry})` : `LURE RACK · ${W9.rack.n}/4 INSTALLED`, ok: () => W9.rack.n < 4, act: () => installCans() });
    // pipe run to the shower heads over the cage
    const pr = propRoot(0, 0, 0), y = 2.62, x0 = px + 0.25, x1 = X(LAB_X + 2.5), z0 = pz, z1 = X(3.5);
    B.add(pr, 'Cylinder', { diameter: 0.08, height: y - 1.9, tessellation: 8 }, [0.5, 0.52, 0.5], 0, [x0, 1.9 + (y - 1.9) / 2, z0]);
    B.add(pr, 'Cylinder', { diameter: 0.08, height: x1 - x0, tessellation: 8 }, [0.5, 0.52, 0.5], 0, [(x0 + x1) / 2, y, z0], [0, 0, Math.PI / 2]);
    B.add(pr, 'Cylinder', { diameter: 0.07, height: z1 - z0, tessellation: 8 }, [0.5, 0.52, 0.5], 0, [x1, y, (z0 + z1) / 2], [Math.PI / 2, 0, 0]);
    for (const zz of [X(2.5), X(3.5)]) { B.add(pr, 'Cylinder', { diameterTop: 0.1, diameterBottom: 0.34, height: 0.1, tessellation: 14 }, [0.62, 0.64, 0.62], 0, [x1, 2.52, zz]); B.add(pr, 'Cylinder', { diameter: 0.3, height: 0.012, tessellation: 14 }, [0.2, 0.22, 0.2], 0, [x1, 2.465, zz]); }
    for (const zz of [X(2.5), X(3.5)]) { B.add(pr, 'Cylinder', { diameter: 0.5, height: 0.01, tessellation: 12 }, [0.15, 0.16, 0.15], 0, [x1, 0.006, zz]); }
    // hazard stripes framing the cage
    for (const zz of [X(2) + 0.12, X(4) - 0.12]) for (let i = 0; i < 9; i++) B.add(pr, 'Box', { width: 0.36, height: 0.005, depth: 0.2 }, i % 2 ? [0.08, 0.08, 0.07] : [0.85, 0.66, 0.1], 0.02, [X(LAB_X + 2) + 0.2 + i * 0.4, 0.004, zz]);
    // vapor columns (their own additive material so they can fade in)
    const vm = coneMat('vapor', [0.35, 1, 0.5, 0]), vb = new PropBatch(vm);
    for (const zz of [X(2.5), X(3.5)]) vb.add(propRoot(x1, zz, 0), 'Cylinder', { diameterTop: 0.3, diameterBottom: 2.9, height: 2.45, tessellation: 18, cap: BABYLON.Mesh.NO_CAP }, [0, 2.46, 1], 1, [0, 2.46 - 1.225, 0]);
    const vmesh = vb.finish('vapor'); (vmesh || []).forEach(m => m._sortD = 2001);
    W9.vapor = { mat: vm, a: 0, want: 0, col: new BABYLON.Vector4(0.35, 1, 0.5, 0), x: x1, z: X(3) };
  }
  // --- cage drop-gates (hidden in the ceiling until the lever is pulled) ---
  W9.cage = { gates: [], down: 0, want: 0, trapped: false, x: X(LAB_X + 2.5), z: X(3) };
  for (const [ey, kind] of [[2, 'rear'], [4, 'front']]) {
    const z = X(ey), m = mkMerged(W9.propMat, P => { for (let t = 0.12; t < CELL - 0.05; t += 0.18) P('Cylinder', { diameter: 0.04, height: CEIL - 0.04, tessellation: 6 }, [0.52, 0.54, 0.5], 0, [t, (CEIL - 0.04) / 2, 0]); for (const yy of [0.1, 1.2, CEIL - 0.12]) P('Box', { width: CELL, height: 0.07, depth: 0.07 }, [0.45, 0.46, 0.44], 0, [CELL / 2, yy, 0]); }, 'cageGate');
    const root = tnode(null, X(LAB_X + 2), CEIL + 0.02, z); m.parent = root;
    const sol = addSolid(X(LAB_X + 2), z - 0.05, X(LAB_X + 3), z + 0.05, 'cage'); LV.solids[sol].off = true;
    W9.cage.gates.push({ root, sol, ey: ey - 1, kind });
  }
  // --- control panel (east wall of the decon room, facing the cage) ---
  { const [px, pz, ry] = wallPt(LAB_X + 4, 2, 0, 0.01, 0), r = propRoot(px, pz, ry), dyn = propRoot(px, pz, ry);
    B.add(r, 'Box', { width: 1.1, height: 1.25, depth: 0.3 }, [0.34, 0.38, 0.36], 0, [0, 1.0, 0.15]); B.add(r, 'Box', { width: 1.15, height: 0.08, depth: 0.45 }, [0.28, 0.3, 0.3], 0, [0, 0.95, 0.35], [0.3, 0, 0]);
    B.add(r, 'Box', { width: 0.24, height: 0.3, depth: 0.03 }, [0.2, 0.2, 0.2], 0, [-0.28, 1.25, 0.31]); B.add(r, 'Box', { width: 0.26, height: 0.26, depth: 0.03 }, [0.85, 0.66, 0.1], 0, [0.28, 1.25, 0.31]);
    for (let i = 0; i < 3; i++) B.add(r, 'Box', { width: 0.2, height: 0.05, depth: 0.004 }, [0.86, 0.84, 0.78], 0.05, [-0.33 + i * 0.33, 1.52, 0.302]);
    const lever = tnode(dyn, -0.28, 1.25, 0.33), lm = mkMerged(W9.propMat, P => { P('Box', { width: 0.04, height: 0.34, depth: 0.04 }, [0.6, 0.6, 0.6], 0, [0, 0.17, 0]); P('Cylinder', { diameter: 0.07, height: 0.16, tessellation: 8 }, [0.1, 0.1, 0.1], 0, [0, 0.36, 0], [0, 0, Math.PI / 2]); P('Box', { width: 0.1, height: 0.06, depth: 0.08 }, [0.3, 0.3, 0.3], 0, [0, 0, 0]); }, 'lever');
    attach(lm, lever); lever.rotation.x = -0.6;
    const bmat = actMat('cureBtn', { emis: 1 }); setEmi(bmat, 0.1);
    const btn = mkMerged(bmat, P => { P('Cylinder', { diameter: 0.14, height: 0.06, tessellation: 14 }, [0.2, 1, 0.3], 1, [0, 0, 0], [Math.PI / 2, 0, 0]); }, 'cureBtn'); attach(btn, dyn, 0.28, 1.25, 0.35);
    const lamps = ['LURE', 'GATES', 'CURE'].map((k, i) => { const m = actMat('lamp' + k, { emis: 1 }); setEmi(m, 0.15, 0.02, 0.02); const me = mkMerged(m, P => P('Sphere', { diameter: 0.06, segments: 6 }, [1, 1, 1], 1, [0, 0, 0])); attach(me, dyn, -0.33 + i * 0.33, 1.44, 0.31); return m; });
    const f = localPt(r, 0, 0, 0.95);
    W9.panel = { lever, btn, bmat, lamps, x: f.x, z: f.z, pull: 0, pulled: false, cd: 0 };
    W.interact.push({ x: localPt(r, -0.28, 0, 0.4).x, z: localPt(r, -0.28, 0, 0.4).z, y: 1.3, r: 1.9, label: () => W9.cage.want ? 'CAGE SEALED' : 'PULL THE CAGE LEVER', ok: () => !W9.cage.want && W9.panel.cd <= 0 && G9.phase !== 'hale' && G9.phase !== 'done', act: () => pullLever() });
    W.interact.push({ x: localPt(r, 0.28, 0, 0.4).x, z: localPt(r, 0.28, 0, 0.4).z, y: 1.25, r: 1.9, label: () => W9.cage.trapped ? 'RELEASE THE CURE' : 'CURE · CAGE NOT SEALED', ok: () => G9.phase === 'trap' || G9.phase === 'trapped' || G9.phase === 'release', act: () => releaseCure() });
    solidLocal(r, -0.56, 0, 0.56, 0.45);
  }
  // --- workbench + crowbar (hall, west wall) ---
  { const [px, pz, ry] = wallPt(LAB_X, 7, 2, 0.01, 0), r = propRoot(px, pz, ry);
    B.add(r, 'Box', { width: 2.0, height: 0.06, depth: 0.8 }, [0.45, 0.33, 0.2], 0, [0, 0.9, 0.4]); legs4(B, r, 2.0, 0.8, 0.88, ST);
    B.add(r, 'Box', { width: 1.9, height: 0.03, depth: 0.7 }, ST, 0, [0, 0.25, 0.4]); B.add(r, 'Box', { width: 2.0, height: 1.0, depth: 0.03 }, [0.35, 0.3, 0.22], 0, [0, 1.5, 0.02]);
    for (let i = 0; i < 7; i++) B.add(r, 'Box', { width: 0.03, height: rnd(0.15, 0.3), depth: 0.02 }, pick([[0.6, 0.1, 0.08], COL9.metal, [0.1, 0.2, 0.5]]), 0, [-0.8 + i * 0.26, 1.5, 0.05]);
    B.add(r, 'Box', { width: 0.2, height: 0.14, depth: 0.16 }, [0.18, 0.28, 0.4], 0, [0.75, 0.99, 0.35]); B.add(r, 'Box', { width: 0.35, height: 0.1, depth: 0.25 }, COL9.meg, 0, [-0.7, 0.98, 0.4]);
    solidLocal(r, -1.0, 0, 1.0, 0.82);
    const cb = mkMerged(W.itemMat, P => { P('Box', { width: 0.03, height: 0.03, depth: 0.72 }, [0.62, 0.08, 0.06], 0.3, [0, 0, 0]); P('Box', { width: 0.03, height: 0.03, depth: 0.14 }, [0.62, 0.08, 0.06], 0.3, [0, 0.04, 0.39], [-0.9, 0, 0]); P('Box', { width: 0.04, height: 0.012, depth: 0.08 }, [0.5, 0.5, 0.5], 0.3, [0, -0.005, -0.38]); }, 'crowbar');
    const p = localPt(r, 0.1, 0.945, 0.42); cb.position.copyFrom(p); cb.rotation.set(0, ry + 1.2, Math.PI / 2 - 0.05);
    W9.crowbar = { mesh: cb, x: p.x, z: p.z, taken: false };
    W.interact.push({ x: p.x, z: p.z, y: 0.95, r: 2.0, label: () => 'TAKE CROWBAR', ok: () => !W9.crowbar.taken, act: () => takeCrowbar() });
  }
  // --- holding cell: sliding door + release panel ---
  { const z = X(10) - WT / 2 - 0.05, root = tnode(null, X(LAB_X + 2.5), 0, z);
    const dm = mkMerged(W9.propMat, P => { P('Box', { width: 1.3, height: 2.2, depth: 0.08 }, [0.4, 0.42, 0.42], 0, [0, 1.1, 0]); P('Box', { width: 0.36, height: 0.22, depth: 0.09 }, [0.03, 0.03, 0.03], 0, [0, 1.62, 0]); for (let i = 0; i < 3; i++) P('Box', { width: 0.02, height: 0.22, depth: 0.1 }, ST, 0, [-0.1 + i * 0.1, 1.62, 0]);
      P('Box', { width: 1.3, height: 0.1, depth: 0.1 }, [0.85, 0.66, 0.1], 0, [0, 0.25, 0]); P('Box', { width: 0.1, height: 0.5, depth: 0.14 }, [0.2, 0.2, 0.2], 0, [-0.52, 1.05, 0]); }, 'cellDoor');
    dm.parent = root; B.add(propRoot(X(LAB_X + 2.5) + 0.6, z - 0.07, 0), 'Box', { width: 2.8, height: 0.08, depth: 0.08 }, ST, 0, [0, 2.26, 0]);
    const sol = addSolid(X(LAB_X + 2), X(10) - WT / 2, X(LAB_X + 3), X(10) + WT / 2, 'cell');
    const cm = actMat('cellLamp', { emis: 1 }); setEmi(cm, 0.3, 0.02, 0.01); const lamp = mkMerged(cm, P => P('Cylinder', { diameter: 0.14, height: 0.12, tessellation: 10 }, [1, 0.2, 0.05], 1, [0, 0, 0])); lamp.position.set(X(LAB_X + 2.5), 2.45, X(10) - WT / 2 - 0.08);
    W9.cell = { root, dm, sol, open: 0, want: 0, x0: X(LAB_X + 2.5), lampMat: cm, x: X(LAB_X + 2.5), z: X(10) };
    markDyn(X(LAB_X + 2), X(10) - WT / 2, X(LAB_X + 3), X(10) + WT / 2, 1);
    const [px, pz, ry] = wallPt(LAB_X + 3, 9, 1, 0.01, 0), r = propRoot(px, pz, ry);
    B.add(r, 'Box', { width: 0.5, height: 0.7, depth: 0.18 }, [0.34, 0.36, 0.34], 0, [0, 1.25, 0.09]); B.add(r, 'Box', { width: 0.36, height: 0.1, depth: 0.12 }, [0.85, 0.66, 0.1], 0, [0, 1.2, 0.2]);
    B.add(r, 'Box', { width: 0.3, height: 0.1, depth: 0.004 }, [0.8, 0.1, 0.08], 0.2, [0, 1.48, 0.182]);
    const f = localPt(r, 0, 0, 0.6);
    W9.release = { x: f.x, z: f.z };
    W.interact.push({ x: f.x, z: f.z, y: 1.25, r: 1.9, label: () => W9.rack.n < 4 ? 'CELL RELEASE · LURE NOT PRIMED' : 'RELEASE THE SUBJECT', ok: () => G9.phase === 'cans' || G9.phase === 'prime', act: () => releaseSubject() });
  }
  // --- service elevator (east wall of the hall) ---
  { const x = X(LAB_X + 5), zc = X(7.5), car0 = x + WT / 2, car1 = x + 2.1, pr = propRoot(0, 0, 0), IN = [0.55, 0.56, 0.55];
    B.add(pr, 'Box', { width: 2.1, height: 0.05, depth: 2.2 }, [0.3, 0.3, 0.28], 0, [x + 1.05, 0.0, zc]);
    B.add(pr, 'Box', { width: 0.05, height: 2.5, depth: 2.2 }, IN, 0, [car1, 1.25, zc]);
    for (const s of [-1, 1]) B.add(pr, 'Box', { width: 2.1, height: 2.5, depth: 0.05 }, IN, 0, [x + 1.05, 1.25, zc + s * 1.1]);
    B.add(pr, 'Box', { width: 2.1, height: 0.05, depth: 2.2 }, IN, 0, [x + 1.05, 2.5, zc]);
    B.add(pr, 'Cylinder', { diameter: 0.04, height: 1.8, tessellation: 6 }, COL9.metal, 0, [car1 - 0.08, 0.95, zc], [Math.PI / 2, 0, 0]);
    B.add(pr, 'Box', { width: 0.03, height: 0.4, depth: 0.2 }, [0.2, 0.2, 0.2], 0, [car0 + 0.1, 1.3, zc + 0.95]);
    W9.BOn.add(pr, 'Box', { width: 1.2, height: 0.02, depth: 0.5 }, [1, 0.95, 0.85], 1, [x + 1.05, 2.47, zc]);
    const doors = [-1, 1].map(s => { const m = mkMerged(W9.propMat, P => { P('Box', { width: 0.05, height: 2.14, depth: 0.6 }, [0.6, 0.62, 0.62], 0, [0, 1.07, 0]); P('Box', { width: 0.052, height: 2.14, depth: 0.02 }, [0.3, 0.3, 0.3], 0, [0, 1.07, -s * 0.29]); }, 'elevDoor'); m.position.set(x - WT / 2 - 0.035, 0, zc + s * 0.3); return m; });
    B.add(pr, 'Box', { width: 0.05, height: 0.2, depth: 0.5 }, [0.15, 0.15, 0.15], 0, [x - WT / 2 - 0.03, 2.55, zc]);
    const im = actMat('elevInd', { emis: 1 }); setEmi(im, 1.2, 0.5, 0.1); const ind = mkMerged(im, P => P('Box', { width: 0.02, height: 0.07, depth: 0.2 }, [1, 0.6, 0.15], 1, [0, 0, 0])); ind.position.set(x - WT / 2 - 0.06, 2.55, zc);
    const rm = actMat('reader', { emis: 1 }); setEmi(rm, 2.5, 0.15, 0.08);
    const [rx, rz, rry] = wallPt(LAB_X + 4, 7, 0, 0.01, 1.05), rr = propRoot(rx, rz, rry);
    B.add(rr, 'Box', { width: 0.14, height: 0.22, depth: 0.05 }, [0.15, 0.15, 0.16], 0, [0, 1.3, 0.025]); B.add(rr, 'Box', { width: 0.1, height: 0.012, depth: 0.02 }, COL9.dark, 0, [0, 1.36, 0.055]);
    const led = mkMerged(rm, P => P('Box', { width: 0.04, height: 0.02, depth: 0.01 }, [1, 1, 1], 1, [0, 0, 0])); led.position.copyFrom(localPt(rr, 0, 1.24, 0.055)); led.rotation.y = rry;
    const sol = addSolid(x - WT / 2 - 0.07, zc - 0.62, x + 0.02, zc + 0.62, 'elev');
    const f = localPt(rr, 0, 0, 0.6);
    W9.elev = { doors, open: 0, want: 0, sol, rm, x: x - 0.3, z: zc, rx: f.x, rz: f.z, zc, light: { x: x + 1.0, y: 2.2, z: zc } };
    W.interact.push({ x: f.x, z: f.z, y: 1.3, r: 1.9, label: () => G9.keycard ? 'SWIPE KEYCARD' : 'ELEVATOR · ADMINISTRATOR KEYCARD REQUIRED', ok: () => !W9.elev.want, act: () => useElevator() });
  }
  // --- dressing: tanks, desks, gurney, specimen jars, shelving ---
  const tank = (x, z) => { const r = propRoot(x, z, 0); B.add(r, 'Cylinder', { diameter: 0.9, height: 0.2, tessellation: 16 }, ST, 0, [0, 0.1, 0]); B.add(r, 'Cylinder', { diameter: 0.9, height: 0.2, tessellation: 16 }, ST, 0, [0, 2.1, 0]);
    W9.canBatch.add(r, 'Cylinder', { diameter: 0.78, height: 1.8, tessellation: 16 }, [0.25, 0.7, 0.35], 0.35, [0, 1.1, 0]); for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + 0.4; B.add(r, 'Box', { width: 0.04, height: 1.8, depth: 0.04 }, ST, 0, [Math.sin(a) * 0.43, 1.1, Math.cos(a) * 0.43]); } addSolid(x - 0.46, z - 0.46, x + 0.46, z + 0.46, 'prop'); };
  tank(X(LAB_X) + 0.75, X(1) + 0.75); tank(X(LAB_X + 4) + 2.8, X(1) + 0.75); tank(X(LAB_X + 1) - 0.1, X(9) + 2.6); tank(X(LAB_X + 5) - 0.75, X(9) + 2.6);
  const gr = propRoot(X(LAB_X + 3.5), X(8.4), 0.3); B.add(gr, 'Box', { width: 0.7, height: 0.06, depth: 1.9 }, [0.7, 0.7, 0.68], 0, [0, 0.8, 0]); legs4(B, gr, 0.7, 1.9, 0.78, COL9.metal, -0.95); B.add(gr, 'Box', { width: 0.62, height: 0.08, depth: 1.7 }, [0.56, 0.6, 0.58], 0, [0, 0.86, 0]);
  B.add(gr, 'Box', { width: 0.06, height: 0.02, depth: 0.5 }, [0.35, 0.2, 0.12], 0, [0.3, 0.9, 0.3]); solidLocal(gr, -0.36, -0.96, 0.36, 0.96);
  placeFurn(B, R.H, ['desk', 'filing', 'mshelf', 'filing', 'desk']); placeFurn(B, R.D, ['mshelf', 'filing', 'mshelf']); placeFurn(B, R.X, ['bench']);
  for (let i = 0; i < 8; i++) { const r = propRoot(X(rnd(LAB_X + 0.3, LAB_X + 4.7)), X(rnd(5.2, 9.8)), rnd(0, TAU)); B.add(r, 'Box', { width: 0.21, height: 0.004, depth: 0.29 }, [0.86, 0.84, 0.76], 0, [0, 0.003, 0]); }
  // restraint chair in the holding cell
  { const r = propRoot(X(LAB_X + 2.5), X(11.4), Math.PI); B.add(r, 'Box', { width: 0.6, height: 0.06, depth: 0.6 }, ST, 0, [0, 0.5, 0]); B.add(r, 'Box', { width: 0.6, height: 0.9, depth: 0.06 }, ST, 0, [0, 0.95, -0.28]); legs4(B, r, 0.6, 0.6, 0.48, ST, -0.3);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.08, height: 0.04, depth: 0.4 }, [0.3, 0.2, 0.12], 0, [s * 0.3, 0.72, 0]); solidLocal(r, -0.32, -0.32, 0.32, 0.32); }
}

// ================= spawn portal =================
function buildPortal() {
  const x = 2 * CELL, z = 6.3 * CELL - 0.95, r = propRoot(x, z, 0), B = W9.B, FR = [0.74, 0.66, 0.42];
  for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.12, height: 2.25, depth: 0.2 }, FR, 0, [s * 0.66, 1.125, 0]);
  B.add(r, 'Box', { width: 1.44, height: 0.12, depth: 0.2 }, FR, 0, [0, 2.29, 0]); B.add(r, 'Box', { width: 1.3, height: 0.02, depth: 0.22 }, [0.3, 0.28, 0.2], 0, [0, 0.11, 0]);
  const pm = actMat('portal9', { emis: 1 }); setEmi(pm, 5, 4.8, 3.6);
  const pl = mkMerged(pm, P => { P('Box', { width: 1.2, height: 2.2, depth: 0.02 }, [1, 0.95, 0.75], 1, [0, 1.12, 0]); }, 'portal'); pl.position.set(x, 0, z);
  addSolid(x - 0.75, z - 0.12, x + 0.75, z + 0.12, 'prop');
  W9.portal = { x, z, mesh: pl, mat: pm, k: 1 };
}

// ================= pickups =================
function itemModel(type, root, mat) {
  if (type === 'battery') {
    part('Box', { width: 0.12, height: 0.036, depth: 0.07 }, root, mat, [0.14, 0.14, 0.15], 0, [0, 0.018, 0]);
    part('Box', { width: 0.121, height: 0.012, depth: 0.071 }, root, mat, [0.85, 0.62, 0.1], 0, [0, 0.02, 0]);
    part('Sphere', { diameter: 0.012, segments: 4 }, root, mat, [1, 0.95, 0.8], 1, [0.04, 0.04, 0.02]);
  } else {
    part('Cylinder', { diameter: 0.068, height: 0.2, tessellation: 14 }, root, mat, [0.86, 0.84, 0.74], 0, [0, 0.1, 0]);
    part('Cylinder', { diameter: 0.071, height: 0.018, tessellation: 14 }, root, mat, [0.25, 0.45, 0.2], 0, [0, 0.1, 0]);
    part('Cylinder', { diameterTop: 0.028, diameterBottom: 0.066, height: 0.04, tessellation: 12 }, root, mat, [0.86, 0.84, 0.74], 0, [0, 0.22, 0]);
    part('Cylinder', { diameter: 0.03, height: 0.022, tessellation: 10 }, root, mat, [0.95, 0.95, 0.95], 0, [0, 0.25, 0]);
    part('Sphere', { diameter: 0.012, segments: 4 }, root, mat, [1, 1, 1], 1, [0.02, 0.18, 0.03]);
  }
}
function buildItems9(diff) {
  const mat = W.itemMat, cells = [];
  for (const h of LV.houses) if (h.enter) for (const r of h.rooms) cells.push(...r.cells);
  for (const r of LV.rooms) if (r.bld === 100 && r.t !== 'stair') cells.push(...r.cells);
  shuffle(cells); const used = new Set();
  const place = type => {
    for (const c of cells) {
      if (used.has(c)) continue; used.add(c);
      const p = { x: cellCenter(c % N) + rnd(-1.1, 1.1), z: cellCenter((c / N) | 0) + rnd(-1.1, 1.1) }; collide(p, 0.3);
      if (cellOf(p.x) !== c % N || cellOf(p.z) !== ((c / N) | 0)) continue;
      const root = tnode(null, p.x, 0, p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, mat);
      const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
      return;
    }
  };
  for (let i = 0; i < [14, 11, 9][diff]; i++) place('battery');
  for (let i = 0; i < [15, 10, 6][diff]; i++) place('water');   // r4.4: more almond water the easier it is
}

// ================= assemble =================
function buildStory9() {
  const B = W9.B;
  for (const h of LV.houses) if (h.stair) for (const c of h.stair.cells) W9.busy.add(c);   // keep the stairs and their landings clear
  for (const h of LV.houses) if (h.stair) for (const r of [h.stair.gSolid, h.stair.uSolid]) addSolid(r.x0, r.z0, r.x1, r.z1, 'stair');
  W9.canMat = actMat('can9', { spec: 0.9, shin: 60, emis: 1, wrap: 0.3 }); W9.canBatch = new PropBatch(W9.canMat);
  W.itemMat = actMat('items', { spec: 0.8, shin: 50, emis: 1, wrap: 0.3 });
  // red porch beacons (one material each so a finished house can turn green)
  for (const r of W9.red) { const m = actMat('beacon', { emis: 1 }); setEmi(m, 0.2, 0.02, 0.02); const me = mkMerged(m, P => { P('Sphere', { diameter: 0.16, segments: 8 }, [1, 1, 1], 1, [0, 0, 0]); }, 'beacon'); me.position.copyFrom(r.pos); r.mat = m; r.mesh = me; r.h.beacon = r; }
  LV.houses.filter(h => h.red).forEach((h, i) => buildTerminal(h, i));
  // canister lockers: two houses, the compound storeroom, the crashed van
  for (const h of LV.houses.filter(h => h.cans)) {
    for (const r of shuffle(h.rooms.filter(r => r !== h.entryRoom)).concat([h.entryRoom])) { const s = takeSlot(r, { noWin: true }); if (!s) continue; const [px, pz, ry] = wallPt(s.x, s.y, s.d, 0.01, 0); h.locker = buildLocker(px, pz, ry, 'locker', 'house'); break; }
  }
  { const s = takeSlot(LV.base.R.S, { noWin: true }); if (s) { const [px, pz, ry] = wallPt(s.x, s.y, s.d, 0.01, 0); buildLocker(px, pz, ry, 'locker', 'base'); } }
  if (W9.van) { const p = localPt(W9.van.root, 0, 0, -3.35); buildLocker(p.x, p.z, W9.van.ry + Math.PI + 0.25, 'crate', 'van'); }
  buildPlaces9();   // r6: story houses claim their wall slots before the furniture does
  // furniture
  for (const h of LV.houses) if (h.enter) for (const r of h.rooms) {
    const cf = ROOMC[r.t]; if (cf) placeCentre(B, r, r.t === 'kitchen' ? (r.cells.length >= 4 ? 'island' : 'ktable') : cf[0]);
    placeFurn(B, r, ROOMF[r.t] || [], { static: h.lit && (r.t === 'living' || r.t === 'family') && r.fl === 0 });
  }
  for (const r of Object.values(LV.base.R)) if (ROOMF[r.t]) placeFurn(B, r, ROOMF[r.t]);
  buildKiosk(); buildGate(); buildBaseExterior(); labSigns(); buildLab(); buildPortal();
  W9.finishProps();
}
