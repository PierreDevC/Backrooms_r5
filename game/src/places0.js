// ---------- r6 · Level 0 places and story: BASE CAMP, SUBSTATION, FLOODED OFFICE ----------
// The exit keypad has no power: throw the three breakers in the substation (loud) or carry Brandt's battery from camp (slow).
// Optional leads: Okafor's logbook (3 pages, one per place), Reyes hurt in the flooded office, the camp radio to Outpost Nine.
const P0 = { rooms: [], camp: null, sub: null, off: null };
const PLACE0_NAME = { camp: 'M.E.G. BASE CAMP', sub: 'SUBSTATION 4B', off: 'FLOODED OFFICE' };
function resetP0() {
  Object.assign(P0, { power: 0, route: '', breakers: [false, false, false], carry: false, logs: [false, false, false], logDone: false,
    reyes: 'unmet', reyesCalls: 0, reyesCallT: rnd(60, 80), radioN: 0, radioCd: 0, crate: false, powerTold: false, seen: {},
    okSaid: false, brSaid: false, marshSaid: false, deadSaid: {}, powerT: rnd(30, 40), bossT: 0 });
}
resetP0();

// ----- planning: pick three rectangles (open halls preferred), wall them in, keep two doorways, keep every cell reachable -----
function planPlaces0() {
  LV.place = new Int8Array(N * N).fill(-1); LV.placeCells = []; P0.rooms = []; P0.camp = P0.sub = P0.off = null;
  const D = LV.spawnD, busy = new Set([LV.exit && cIdx(LV.exit.x, LV.exit.y), ...LV.tapeCells.map(c => cIdx(c.x, c.y))]);
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inGrid(LV.spawn.x + dx, LV.spawn.y + dy)) busy.add(cIdx(LV.spawn.x + dx, LV.spawn.y + dy));
  const cand = [];
  const add = (x0, y0, w, h, hall) => {
    if (x0 < 1 || y0 < 1 || x0 + w > N - 1 || y0 + h > N - 1) return;
    let sd = 0, dk = 0;
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const c = cIdx(x, y); if (busy.has(c) || D[c] < 0) return; sd += D[c]; dk += LV.dark[c]; }
    cand.push({ x0, y0, w, h, hall, d: sd / (w * h), dark: dk / (w * h) });
  };
  for (const h of LV.halls) for (const m of [3, 4]) { const w = Math.min(h.w, m), hh = Math.min(h.h, 3); add(h.x0 + ((h.w - w) >> 1), h.y0 + ((h.h - hh) >> 1), w, hh, true); }
  for (let i = 0; i < 90; i++) { const w = rndi(3, 4), h = 3; add(rndi(1, N - 1 - w), rndi(1, N - 1 - h), w, h, false); }
  const apart = (a, b) => a.x0 > b.x0 + b.w || b.x0 > a.x0 + a.w || a.y0 > b.y0 + b.h || b.y0 > a.y0 + a.h;
  const cdist = (a, b) => Math.hypot(a.x0 + a.w / 2 - b.x0 - b.w / 2, a.y0 + a.h / 2 - b.y0 - b.h / 2);
  const best = (score, ok) => { let bs = -1e9, bc = null; for (const c of cand) { if (!ok(c)) continue; const s = score(c); if (s > bs) { bs = s; bc = c; } } return bc; };
  const small = c => c.w * c.h <= 9;
  const camp = best(c => -Math.abs(c.d - 11) + (c.hall ? 2.5 : 0) - c.dark * 4 + RNG(), small);
  if (!camp) return;
  const sub = best(c => c.d * 0.35 + c.dark * 7 + cdist(c, camp) * 0.35 + (c.hall ? 1 : 0) + RNG(), c => small(c) && apart(c, camp) && cdist(c, camp) > 7);
  const off = sub && best(c => cdist(c, camp) * 0.3 + cdist(c, sub) * 0.3 + (c.hall ? 2 : 0) + c.d * 0.15 - c.dark * 3 + RNG(), c => apart(c, camp) && apart(c, sub) && cdist(c, camp) > 6 && cdist(c, sub) > 6);
  for (const [k, r] of [['camp', camp], ['sub', sub], ['off', off]]) if (r) carvePlace0(k, r);
  // repair: closing a room can cut off a pocket of the maze; open a doorway on the cut until everything reaches the spawn again
  for (let guard = 0; guard < 40; guard++) {
    const F = bfs(LV.spawn.x, LV.spawn.y); let fix = null;
    for (const R of P0.rooms) { for (const b of R.bnd) { const a = F[cIdx(b[0], b[1])] >= 0, o = F[cIdx(b[0] + DX[b[2]], b[1] + DY[b[2]])] >= 0; if (a !== o && edgeVal(b[0], b[1], b[2]) === 1) { fix = [R, b]; break; } } if (fix) break; }
    if (!fix) break;
    setEdge(fix[1][0], fix[1][1], fix[1][2], 2); fix[0].doors.push(fix[1]);
  }
  LV.spawnD = bfs(LV.spawn.x, LV.spawn.y);
}
function carvePlace0(k, r) {
  const R = Object.assign({ k, bnd: [], doors: [], cells: [] }, r), inR = (x, y) => x >= R.x0 && x < R.x0 + R.w && y >= R.y0 && y < R.y0 + R.h;
  for (let y = R.y0; y < R.y0 + R.h; y++) for (let x = R.x0; x < R.x0 + R.w; x++) {
    const c = cIdx(x, y); LV.place[c] = P0.rooms.length; R.cells.push(c); LV.placeCells.push(c);
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d], ny = y + DY[d]; if (!inGrid(nx, ny)) continue;
      if (inR(nx, ny)) setEdge(x, y, d, 0); else { R.bnd.push([x, y, d]); setEdge(x, y, d, 1); }
    }
    const f = LV.fixtures[c];
    if (k === 'camp') { LV.dark[c] = 0; f.state = 1; }
    else if (k === 'sub') { LV.dark[c] = 1; f.state = 0; }
    else { LV.dark[c] = 0; f.state = RNG() < 0.35 ? 2 : 1; }
  }
  // two doorways on different sides, never onto the outer rim
  const sides = shuffle([0, 1, 2, 3]).slice(0, k === 'sub' ? 1 : 2);
  for (const s of sides) {
    const opts = R.bnd.filter(b => b[2] === s); if (!opts.length) continue;
    const b = opts[(opts.length - 1) >> 1]; setEdge(b[0], b[1], b[2], 2); R.doors.push(b);
  }
  R.X0 = R.x0 * CELL; R.Z0 = R.y0 * CELL; R.X1 = (R.x0 + R.w) * CELL; R.Z1 = (R.y0 + R.h) * CELL; R.cx = (R.X0 + R.X1) / 2; R.cz = (R.Z0 + R.Z1) / 2;
  P0.rooms.push(R); P0[k] = R;
}
const inPlace0 = (R, x, z, m = 0) => !!R && x > R.X0 + m && x < R.X1 - m && z > R.Z0 + m && z < R.Z1 - m;
function placeAt0(x, z) { if (!LV.place) return null; const i = LV.place[cIdx(cellOf(x), cellOf(z))]; return i >= 0 ? P0.rooms[i] : null; }
// plain wall slots of a room (local +z faces into the room)
function wallSlots0(R) { return R.bnd.filter(b => edgeVal(b[0], b[1], b[2]) === 1).map(b => ({ x: b[0], y: b[1], d: b[2] })); }
function doorNear0(R, x, z, m) { return R.doors.some(b => { const [mx, mz] = edgeMid(b[0], b[1], b[2]); return Math.hypot(mx - x, mz - z) < m; }); }

// ----- building: props, signs, interactables -----
const C0 = { olive: [0.3, 0.33, 0.22], canvas: [0.36, 0.38, 0.26], steel: [0.4, 0.42, 0.43], dark: [0.1, 0.1, 0.11], orange: [0.95, 0.45, 0.08], yel: [0.95, 0.8, 0.1], paper: [0.92, 0.9, 0.82],
  grey: [0.5, 0.52, 0.55], blue: [0.3, 0.36, 0.48], red: [0.75, 0.12, 0.08], wood: [0.5, 0.38, 0.24] };
function buildPlaces0() {
  W.p0 = null;
  if (!P0.rooms.length) return;
  const mat = actMat('places0', { spec: 0.22, shin: 16, wrinkle: 0.2, emis: 1, wrap: 0.35, mottle: 0.3 }), B = new PropBatch(mat);
  W.p0 = { B, mat, pages: [], breakers: [], battery: null, exitBatt: null, crate: null };
  P0.pageMat = actMat('p0page', { spec: 0.1, shin: 8, emis: 1, wrap: 0.4 }); setEmi(P0.pageMat, 0.35);
  if (P0.camp) buildCamp0(B, P0.camp);
  if (P0.sub) buildSub0(B, P0.sub);
  if (P0.off) buildOffice0(B, P0.off);
  trail0(B, LV.spawn, P0.camp, C0.orange);
  if (P0.camp && P0.sub) trail0(B, { x: P0.camp.x0 + (P0.camp.w >> 1), y: P0.camp.y0 + (P0.camp.h >> 1) }, P0.sub, C0.yel);
  const m = B.finish('places0') || []; m.forEach(q => q._sortD = 300);
}
function sign0(text, R, s, y, o = {}) {   // stencilled sign on a wall slot
  const [x, z, ry] = wallPt(s.x, s.y, s.d, 0.012, o.along || 0), r = propRoot(x, z, ry);
  const S = dynTexPlane('sign0', o.w || 1.3, o.h || 0.32, 512, Math.round(512 * (o.h || 0.32) / (o.w || 1.3)), r, [0, y, 0.004], o.emis ?? 0.35), c = S.ctx, W_ = 512, H_ = S.dt.getSize().height;
  c.fillStyle = o.bg || '#d9cfa8'; c.fillRect(0, 0, W_, H_);
  c.fillStyle = o.fg || '#1d1a14'; c.font = `bold ${Math.round(H_ * 0.56)}px "Courier New", monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, W_ / 2, H_ / 2 + 2);
  if (o.stripe) { c.fillStyle = '#e8b00f'; for (let i = -2; i < 14; i++) { c.beginPath(); c.moveTo(i * 40, H_); c.lineTo(i * 40 + 18, H_); c.lineTo(i * 40 + 18 + 10, H_ - 10); c.lineTo(i * 40 + 10, H_ - 10); c.fill(); } }
  S.dt.update(); return S;
}
function page0(i, root, pos, rot) {   // a loose logbook page: its own small mesh so it reads as paper
  const p = part('Box', { width: 0.21, height: 0.004, depth: 0.29 }, root, P0.pageMat, C0.paper, 0, pos, rot);
  const w = BABYLON.Vector3.TransformCoordinates(V3(pos[0], pos[1], pos[2]), root.computeWorldMatrix(true));
  const it = { x: w.x, z: w.z, y: w.y, r: 1.8, label: () => P0.logs[i] ? 'READ OKAFOR\'S PAGE AGAIN' : 'READ THE LOGBOOK PAGE', ok: () => true, act: () => readLog0(i) };
  W.interact.push(it); W.p0.pages.push(p); return it;
}
function slotsAway0(R, n, avoid = 1.9) {   // wall slots spread around the room, away from the doors
  const S = shuffle(wallSlots0(R)).filter(s => { const [x, z] = wallPt(s.x, s.y, s.d); return !doorNear0(R, x, z, avoid); });
  return S.slice(0, n);
}
function buildCamp0(B, R) {
  const S = slotsAway0(R, 6), at = (s, along = 0, off = 0) => { const [x, z, ry] = wallPt(s.x, s.y, s.d, off, along); return propRoot(x, z, ry); };
  // centre: folding table with a hand-drawn map and a lantern
  const t = propRoot(R.cx + rnd(-0.4, 0.4), R.cz + rnd(-0.4, 0.4), rnd(-0.3, 0.3));
  B.add(t, 'Box', { width: 1.5, height: 0.04, depth: 0.8 }, [0.42, 0.4, 0.36], 0, [0, 0.74, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.add(t, 'Cylinder', { diameter: 0.03, height: 0.74, tessellation: 6 }, C0.steel, 0, [sx * 0.68, 0.37, sz * 0.34]);
  B.add(t, 'Box', { width: 0.12, height: 0.2, depth: 0.12 }, [0.2, 0.3, 0.18], 0, [0.55, 0.86, 0.2]);
  B.add(t, 'Cylinder', { diameter: 0.09, height: 0.12, tessellation: 10 }, [1, 0.85, 0.5], 1.4, [0.55, 0.9, 0.2]);   // lantern glass, lit
  const mp = dynTexPlane('campMap', 0.9, 0.6, 384, 256, twin(t), [-0.15, 0.765, 0], 0.25); mp.mesh.rotation.x = Math.PI / 2; mp.mesh.rotation.y = 0; mp.mat.backFaceCulling = false;
  drawCampMap0(mp.ctx, 384, 256); mp.dt.update();
  addSolid(t.position.x - 0.85, t.position.z - 0.85, t.position.x + 0.85, t.position.z + 0.85, 'prop');
  W.interact.push({ x: t.position.x, z: t.position.z, y: 0.78, r: 2.0, label: () => 'STUDY THE HAND-DRAWN MAP', ok: () => true, act: () => readDoc('campmap', 'MAP ON THE CAMP TABLE', campMapText0(), { kind: 'board' }) });
  // the battery Brandt left by the table
  const bp = { x: t.position.x + Math.cos(t.rotation.y) * 1.25, z: t.position.z - Math.sin(t.rotation.y) * 1.25 }; collide(bp, 0.3);
  W.p0.battery = batteryMesh0(bp.x, bp.z, rnd(0, TAU));
  W.interact.push({ x: bp.x, z: bp.z, y: 0.2, r: 1.8, label: () => 'TAKE BRANDT\'S BATTERY (HEAVY)', ok: () => !P0.carry && !P0.power && W.p0.battery.isEnabled(), act: () => takeBattery0() });
  // cots, the radio, the supply crate, the whiteboard
  if (S[0]) for (const a of [-0.9, 0.9]) { const r = at(S[0], a); cot0(B, r); solidLocal(r, -0.4, 0.05, 0.4, 2.05); }
  if (S[0]) { const r = at(S[0], 0.9); page0(0, twin(r), [0.05, 0.36, 1.2], [0, 0.4, 0]); }
  if (S[1]) {
    const r = at(S[1], 0);
    if (!B.mdl('crate', r, [0, 0, 0.35], null, 0.8)) { B.add(r, 'Box', { width: 0.7, height: 0.55, depth: 0.55 }, C0.wood, 0, [0, 0.275, 0.35]); }
    B.add(r, 'Box', { width: 0.42, height: 0.22, depth: 0.26 }, C0.olive, 0, [0, 0.66, 0.35]);
    B.add(r, 'Box', { width: 0.3, height: 0.08, depth: 0.01 }, C0.dark, 0, [0, 0.69, 0.485]);
    B.add(r, 'Cylinder', { diameter: 0.012, height: 0.9, tessellation: 5 }, C0.steel, 0, [0.16, 1.2, 0.3]);
    B.add(r, 'Sphere', { diameter: 0.025, segments: 5 }, [1, 0.3, 0.1], 1.5, [-0.12, 0.72, 0.49]);
    solidLocal(r, -0.4, 0.05, 0.4, 0.7);
    const p = localPt(r, 0, 0.7, 0.5);
    W.interact.push({ x: p.x, z: p.z, y: 0.7, r: 1.9, label: () => P0.radioCd > 0 ? 'FIELD RADIO · WARMING UP' : 'USE THE FIELD RADIO', ok: () => true, act: () => useRadio0() });
  }
  if (S[2]) {
    const r = at(S[2], 0);
    B.add(r, 'Box', { width: 0.9, height: 0.5, depth: 0.55 }, C0.olive, 0, [0, 0.25, 0.32]);
    B.add(r, 'Box', { width: 0.92, height: 0.03, depth: 0.57 }, [0.24, 0.27, 0.18], 0, [0, 0.51, 0.32]);
    B.add(r, 'Box', { width: 0.5, height: 0.06, depth: 0.12 }, [0.9, 0.9, 0.86], 0, [0, 0.45, 0.6]);   // stencil plate
    solidLocal(r, -0.5, 0.05, 0.5, 0.62);
    const p = localPt(r, 0, 0.5, 0.6);
    W.interact.push({ x: p.x, z: p.z, y: 0.5, r: 1.8, label: () => 'SEARCH THE SUPPLY CRATE', ok: () => !P0.crate, act: () => searchCrate0() });
  }
  if (S[3]) {
    const r = at(S[3], 0, 0.01);
    B.add(r, 'Box', { width: 1.5, height: 1.0, depth: 0.03 }, [0.75, 0.75, 0.72], 0, [0, 1.45, 0.015]);
    const wb = dynTexPlane('campBoard', 1.42, 0.92, 512, 332, twin(r), [0, 1.45, 0.034], 0.3); drawBoard0(wb.ctx, 512, 332); wb.dt.update();
    const p = localPt(r, 0, 1.45, 0.3);
    W.interact.push({ x: p.x, z: p.z, y: 1.45, r: 2.2, label: () => 'READ THE WHITEBOARD', ok: () => true, act: () => readDoc('board', 'CAMP WHITEBOARD', BOARD0, { kind: 'board' }) });
  }
  if (S[4]) { const r = at(S[4], 0); for (let i = 0; i < 3; i++) B.add(r, 'Box', { width: 0.34, height: 0.48, depth: 0.22 }, i === 1 ? [0.55, 0.2, 0.08] : C0.olive, 0, [-0.5 + i * 0.5, 0.24, 0.2], [0, rnd(-0.3, 0.3), rnd(-0.1, 0.1)]); solidLocal(r, -0.75, 0.05, 0.75, 0.4); }
  if (S[0]) sign0('M.E.G. CAMP · NOBODY SLEEPS ALONE', R, S[0], 1.75, { w: 1.6, h: 0.22 });
  for (const a of [-1, 1]) { const c = propRoot(t.position.x + a * 0.55 * Math.cos(t.rotation.y) + Math.sin(t.rotation.y) * 0.75, t.position.z - a * 0.55 * Math.sin(t.rotation.y) + Math.cos(t.rotation.y) * 0.75, t.rotation.y + Math.PI + rnd(-0.3, 0.3)); B.add(c, 'Box', { width: 0.42, height: 0.04, depth: 0.4 }, C0.olive, 0, [0, 0.44, 0]); B.add(c, 'Box', { width: 0.42, height: 0.4, depth: 0.03 }, C0.olive, 0, [0, 0.68, -0.19]); for (const sx of [-1, 1]) B.add(c, 'Box', { width: 0.025, height: 0.44, depth: 0.42 }, C0.steel, 0, [sx * 0.2, 0.22, 0], [sx * 0.15, 0, 0]); }
  { const g = propRoot(R.cx + rnd(-1, 1), R.cz + rnd(-1, 1), rnd(0, TAU)); if (!inPlace0(R, g.position.x, g.position.z, 0.6) || solidAt(g.position.x, g.position.z)) g.position.x = R.cx; B.add(g, 'Box', { width: 1.1, height: 0.02, depth: 0.8 }, [0.22, 0.3, 0.2], 0, [0, 0.01, 1.4]); B.add(g, 'Box', { width: 0.3, height: 0.2, depth: 0.2 }, C0.olive, 0, [0.2, 0.11, 1.4]); B.add(g, 'Cylinder', { diameter: 0.07, height: 0.2, tessellation: 8 }, [0.86, 0.84, 0.74], 0, [-0.25, 0.1, 1.3]); }
  clutter0(B, R, 3, ['box', 'crate', 'box']);
}
function clutter0(B, R, n, kinds) {   // boxes, drums and junk tucked into the room's inner corners, clear of the doors
  const C = shuffle([[R.X0 + 0.7, R.Z0 + 0.7], [R.X1 - 0.7, R.Z0 + 0.7], [R.X0 + 0.7, R.Z1 - 0.7], [R.X1 - 0.7, R.Z1 - 0.7]]);
  let k = 0;
  for (const [x, z] of C) {
    if (k >= n) break; if (doorNear0(R, x, z, 2.0) || solidAt(x, z)) continue; k++;
    const r = propRoot(x, z, rnd(0, TAU)), kind = pick(kinds);
    if (kind === 'drum') { if (!B.mdl('barrel', r, null, null, 0.9)) B.add(r, 'Cylinder', { diameter: 0.56, height: 0.86, tessellation: 14 }, [0.3, 0.36, 0.42], 0, [0, 0.43, 0]); }
    else if (kind === 'crate') { if (!B.mdl('crate', r, null, null, 0.9)) B.add(r, 'Box', { width: 0.7, height: 0.6, depth: 0.7 }, C0.wood, 0, [0, 0.3, 0]); }
    else { const s = mdlOk('cbox') ? 1 : 0; if (!B.mdl('cbox', r, null, null, 1.2)) B.add(r, 'Box', { width: 0.5, height: 0.4, depth: 0.45 }, [0.52, 0.4, 0.24], 0, [0, 0.2, 0]); if (!B.mdl('cbox', r, [0.05, s ? 0.41 : 0.4, 0], [0, 0.4, 0], 1.0)) B.add(r, 'Box', { width: 0.42, height: 0.34, depth: 0.4 }, [0.46, 0.35, 0.2], 0, [0.05, 0.57, 0], [0, 0.4, 0]); }
    addSolid(x - 0.45, z - 0.45, x + 0.45, z + 0.45, 'prop');
  }
}
function cot0(B, r) {
  for (const sx of [-1, 1]) for (const sz of [0.15, 1.95]) B.add(r, 'Box', { width: 0.04, height: 0.32, depth: 0.04 }, C0.steel, 0, [sx * 0.34, 0.16, sz]);
  for (const sx of [-1, 1]) B.add(r, 'Box', { width: 0.04, height: 0.04, depth: 1.86 }, C0.steel, 0, [sx * 0.34, 0.32, 1.05]);
  B.add(r, 'Box', { width: 0.66, height: 0.03, depth: 1.84 }, C0.canvas, 0, [0, 0.33, 1.05]);
  B.add(r, 'Box', { width: 0.6, height: 0.1, depth: 0.85 }, [0.24, 0.3, 0.42], 0, [0, 0.39, 1.35], [0, 0.05, 0]);   // sleeping bag
}
function batteryMesh0(x, z, ry, parent) {
  const r = tnode(parent || null, x, 0, z); r.rotation.y = ry;
  const m = W.p0.mat;
  part('Box', { width: 0.32, height: 0.22, depth: 0.18 }, r, m, [0.08, 0.08, 0.09], 0, [0, 0.11, 0]);
  part('Box', { width: 0.326, height: 0.03, depth: 0.186 }, r, m, [0.12, 0.12, 0.13], 0, [0, 0.235, 0]);
  part('Cylinder', { diameter: 0.035, height: 0.04, tessellation: 8 }, r, m, [0.8, 0.12, 0.08], 0, [0.1, 0.27, 0]);
  part('Cylinder', { diameter: 0.035, height: 0.04, tessellation: 8 }, r, m, [0.1, 0.1, 0.1], 0, [-0.1, 0.27, 0]);
  part('Box', { width: 0.1, height: 0.06, depth: 0.003 }, r, m, C0.yel, 0.3, [0, 0.14, 0.092]);
  part('Box', { width: 0.24, height: 0.02, depth: 0.03 }, r, m, [0.2, 0.2, 0.2], 0, [0, 0.29, 0]);
  return r;
}
function buildSub0(B, R) {
  const S = slotsAway0(R, 5);
  if (!S.length) return;
  // the panel: grey cabinet, three breaker handles with their own lamps
  const s = S[0], [x, z, ry] = wallPt(s.x, s.y, s.d, 0.01, 0), r = propRoot(x, z, ry);
  B.add(r, 'Box', { width: 1.25, height: 1.5, depth: 0.28 }, C0.grey, 0, [0, 1.15, 0.14]);
  B.add(r, 'Box', { width: 1.15, height: 1.38, depth: 0.02 }, [0.42, 0.44, 0.46], 0, [0, 1.15, 0.285]);
  B.add(r, 'Box', { width: 0.5, height: 0.08, depth: 0.01 }, C0.yel, 0.2, [0, 1.75, 0.296]);
  for (let i = 0; i < 6; i++) B.add(r, 'Cylinder', { diameter: 0.03, height: 0.9, tessellation: 6 }, C0.dark, 0, [-0.5 + i * 0.2, 2.35, 0.08]);   // conduit up into the ceiling
  solidLocal(r, -0.68, 0, 0.68, 0.45);
  const rk = twin(r);
  for (let i = 0; i < 3; i++) {
    const bx = -0.38 + i * 0.38, hm = actMat('brk' + i, { spec: 0.4, shin: 30, emis: 1, wrap: 0.3 });
    part('Box', { width: 0.16, height: 0.3, depth: 0.04 }, rk, hm, C0.dark, 0, [bx, 1.15, 0.3]);
    const h = tnode(rk, bx, 1.15, 0.33); part('Box', { width: 0.07, height: 0.2, depth: 0.05 }, h, hm, [0.75, 0.1, 0.05], 0, [0, 0.08, 0.02]);
    h.rotation.x = 0.55;
    const lamp = actMat('brkL' + i, { emis: 1 }); part('Sphere', { diameter: 0.04, segments: 6 }, rk, lamp, [1, 1, 1], 1, [bx, 1.42, 0.31]); setEmi(lamp, 1.6, 0.12, 0.05);
    const p = localPt(r, bx, 1.15, 0.6);
    const it = { x: p.x, z: p.z, y: 1.15, r: 1.9, i, h, lamp, label: () => holdBusy(it) ? `THROWING… ${holdPct(it)}%` : `THROW BREAKER ${i + 1}`, ok: () => !P0.breakers[i] && !P0.power, act: () => holdStart(it, 1.3, () => throwBreaker0(i), { tick: (dt, k) => { h.rotation.x = 0.55 - 0.3 * k; PL.shake = Math.max(PL.shake, 0.1); }, cancel: 'THE BREAKER SNAPS BACK' }) };
    W.interact.push(it); W.p0.breakers.push(it);
  }
  page0(1, rk, [0.78, 1.2, 0.2], [Math.PI / 2, 0, 0.15]);
  sign0('SUBSTATION 4B · DANGER', R, s, 2.12, { w: 1.2, h: 0.24, stripe: true });
  // transformer, cable runs, a ladder and Brandt's tool bag
  const tr = propRoot(R.cx + rnd(-0.6, 0.6), R.cz + rnd(-0.6, 0.6), rnd(0, TAU));
  B.add(tr, 'Box', { width: 1.2, height: 1.3, depth: 0.9 }, [0.34, 0.36, 0.36], 0, [0, 0.65, 0]);
  for (let i = 0; i < 7; i++) B.add(tr, 'Box', { width: 0.05, height: 1.1, depth: 0.92 }, [0.28, 0.3, 0.3], 0, [-0.55 + i * 0.18, 0.62, 0]);
  B.add(tr, 'Box', { width: 1.22, height: 0.12, depth: 0.92 }, C0.yel, 0.1, [0, 1.25, 0]);
  addSolid(tr.position.x - 0.85, tr.position.z - 0.85, tr.position.x + 0.85, tr.position.z + 0.85, 'prop');
  if (B.pipe) B.pipe([x, 0.04, z], [tr.position.x, 0.04, tr.position.z], 0.035, C0.dark);
  if (S[1]) { const [a, b, q] = wallPt(S[1].x, S[1].y, S[1].d, 0.02, 0), lr = propRoot(a, b, q); for (const sx of [-1, 1]) B.add(lr, 'Box', { width: 0.04, height: 2.2, depth: 0.05 }, [0.7, 0.6, 0.2], 0, [sx * 0.22, 1.08, 0.35], [-0.16, 0, 0]); for (let i = 0; i < 6; i++) B.add(lr, 'Box', { width: 0.44, height: 0.03, depth: 0.04 }, [0.7, 0.6, 0.2], 0, [0, 0.25 + i * 0.32, 0.38 - i * 0.05]); solidLocal(lr, -0.3, 0, 0.3, 0.55); }
  if (S[3]) { const [a, b, q] = wallPt(S[3].x, S[3].y, S[3].d, 0.01, 0), sh = propRoot(a, b, q); if (!B.mdl('sshelf', sh, null, null, 1)) { for (const y of [0.05, 0.6, 1.15, 1.7]) B.add(sh, 'Box', { width: 1.2, height: 0.03, depth: 0.45 }, C0.steel, 0, [0, y, 0.25]); for (const sx of [-1, 1]) for (const sz of [0.03, 0.47]) B.add(sh, 'Box', { width: 0.03, height: 1.8, depth: 0.03 }, C0.steel, 0, [sx * 0.58, 0.9, sz]); } for (let i = 0; i < 5; i++) B.add(sh, 'Cylinder', { diameter: 0.22, height: 0.12, tessellation: 12 }, i % 2 ? [0.2, 0.2, 0.2] : [0.55, 0.3, 0.1], 0, [-0.4 + i * 0.2, 0.68 + (i % 2) * 0.55, 0.25], [Math.PI / 2, 0, 0]); solidLocal(sh, -0.62, 0, 0.62, 0.5); }
  clutter0(B, R, 2, ['drum', 'crate']);
  if (S[2]) { const [a, b, q] = wallPt(S[2].x, S[2].y, S[2].d, 0, 0.6), br = propRoot(a, b, q); B.add(br, 'Box', { width: 0.5, height: 0.24, depth: 0.25 }, [0.55, 0.2, 0.08], 0, [0, 0.12, 0.3]); B.add(br, 'Box', { width: 0.3, height: 0.03, depth: 0.03 }, C0.steel, 0, [0, 0.27, 0.3]); B.add(br, 'Box', { width: 0.2, height: 0.03, depth: 0.05 }, C0.steel, 0, [0.3, 0.02, 0.6], [0, 0.6, 0]); }
}
function buildOffice0(B, R) {
  // cubicle blocks: a plus-shaped partition, four desks in its corners; aisles stay open along the walls
  const nb = R.w >= 4 && R.h < 4 ? 2 : R.h >= 4 && R.w < 4 ? 2 : 1, horiz = R.w >= R.h;
  const PT = [0.34, 0.38, 0.44], DESK = [0.55, 0.5, 0.42];
  const blocks = nb === 1 ? [[R.cx, R.cz]] : horiz ? [[R.cx - CELL * 0.75, R.cz], [R.cx + CELL * 0.75, R.cz]] : [[R.cx, R.cz - CELL * 0.75], [R.cx, R.cz + CELL * 0.75]];
  let deskN = 0; P0.offDesks = [];
  for (const [bx, bz] of blocks) {
    const r = propRoot(bx, bz, 0), L = 3.4;
    B.add(r, 'Box', { width: L, height: 1.3, depth: 0.07 }, PT, 0, [0, 0.65, 0]);
    B.add(r, 'Box', { width: 0.07, height: 1.3, depth: L }, PT, 0, [0, 0.65, 0]);
    B.add(r, 'Box', { width: L + 0.02, height: 0.04, depth: 0.09 }, [0.25, 0.25, 0.27], 0, [0, 1.31, 0]);
    B.add(r, 'Box', { width: 0.09, height: 0.04, depth: L + 0.02 }, [0.25, 0.25, 0.27], 0, [0, 1.31, 0]);
    addSolid(bx - L / 2, bz - 0.06, bx + L / 2, bz + 0.06, 'prop'); addSolid(bx - 0.06, bz - L / 2, bx + 0.06, bz + L / 2, 'prop');
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const dx = bx + sx * 0.9, dz = bz + sz * 0.45, d = propRoot(dx, dz, sz < 0 ? Math.PI : 0);
      B.add(d, 'Box', { width: 1.3, height: 0.04, depth: 0.62 }, DESK, 0, [0, 0.74, -0.3]);
      B.add(d, 'Box', { width: 0.04, height: 0.72, depth: 0.6 }, [0.3, 0.3, 0.3], 0, [-0.62, 0.36, -0.3]); B.add(d, 'Box', { width: 0.04, height: 0.72, depth: 0.6 }, [0.3, 0.3, 0.3], 0, [0.62, 0.36, -0.3]);
      if (deskN % 2 === 0 && !B.mdl('crt', d, [0.25, 0.76, -0.35], [0, Math.PI, 0], 0.8)) B.add(d, 'Box', { width: 0.4, height: 0.34, depth: 0.36 }, [0.62, 0.58, 0.5], 0, [0.25, 0.93, -0.35]);
      for (let i = 0; i < 3; i++) B.add(d, 'Box', { width: 0.21, height: 0.003, depth: 0.29 }, C0.paper, 0, [-0.3 + i * 0.05, 0.763 + i * 0.002, -0.25], [0, 0.3 * i - 0.3, 0]);
      solidLocal(d, -0.66, -0.62, 0.66, 0.02);
      P0.offDesks.push(d); deskN++;
    }
  }
  page0(2, twin(P0.offDesks[P0.offDesks.length - 1]), [-0.1, 0.775, -0.2], [0, -0.5, 0]);
  // standing water: dark wet patches on the carpet
  for (let i = 0; i < 9; i++) { const r = propRoot(rnd(R.X0 + 0.8, R.X1 - 0.8), rnd(R.Z0 + 0.8, R.Z1 - 0.8), rnd(0, TAU)); B.add(r, 'Cylinder', { diameter: rnd(0.9, 2.2), height: 0.004, tessellation: 14 }, [0.3, 0.25, 0.12], 0, [0, 0.003, 0], null, [1, 1, rnd(0.5, 1)]); }
  // a dead water cooler by the door
  const S = slotsAway0(R, 2);
  if (S[0]) { const [a, b, q] = wallPt(S[0].x, S[0].y, S[0].d, 0, 0), r = propRoot(a, b, q); B.add(r, 'Box', { width: 0.34, height: 0.95, depth: 0.34 }, [0.86, 0.85, 0.8], 0, [0, 0.475, 0.22]); B.add(r, 'Cylinder', { diameter: 0.3, height: 0.42, tessellation: 12 }, [0.55, 0.7, 0.85], 0.05, [0, 1.16, 0.22]); solidLocal(r, -0.2, 0.03, 0.2, 0.41); }
  if (S[1]) sign0('3RD FLOOR · ACCOUNTS', R, S[1], 1.8, { w: 1.0, h: 0.2, bg: '#c8c4b4' });
  clutter0(B, R, 2, ['box']);
}
function trail0(B, from, R, col) {   // M.E.G. spray chevrons on the walls along the route from a cell to a room
  if (!R) return;
  const F = bfs(R.x0 + (R.w >> 1), R.y0 + (R.h >> 1));
  let cx = from.x, cy = from.y, n = 0;
  for (let guard = 0; guard < 120 && F[cIdx(cx, cy)] > 0; guard++) {
    let nd = -1; for (let d = 0; d < 4; d++) { if (!passable(cx, cy, d)) continue; const v = F[cIdx(cx + DX[d], cy + DY[d])]; if (v >= 0 && v < F[cIdx(cx, cy)]) { nd = d; break; } }
    if (nd < 0) break;
    if (n++ % 3 === 1 && LV.place[cIdx(cx, cy)] < 0) for (const side of [(nd + 1) % 4, (nd + 3) % 4]) {
      if (edgeVal(cx, cy, side) !== 1) continue;
      const [x, z, ry] = wallPt(cx, cy, side, 0.004, 0), r = propRoot(x, z, ry), tx = Math.cos(ry), tz = -Math.sin(ry), sg = Math.sign(DX[nd] * tx + DY[nd] * tz) || 1;
      B.add(r, 'Box', { width: 0.3, height: 0.05, depth: 0.006 }, col, 0.25, [-0.02 * sg, 1.42, 0.003], [0, 0, -0.75 * sg]);
      B.add(r, 'Box', { width: 0.3, height: 0.05, depth: 0.006 }, col, 0.25, [-0.02 * sg, 1.24, 0.003], [0, 0, 0.75 * sg]);
      B.add(r, 'Box', { width: 0.06, height: 0.06, depth: 0.006 }, col, 0.25, [-0.26 * sg, 1.33, 0.003]);
      break;
    }
    cx += DX[nd]; cy += DY[nd];
  }
}
function drawCampMap0(c, w, h) {
  c.fillStyle = '#e6dfc6'; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#2b3a6b'; c.lineWidth = 3; c.beginPath();
  const pts = [[30, 210], [90, 210], [90, 140], [170, 140], [170, 60], [260, 60], [260, 120], [340, 120]];
  pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
  c.fillStyle = '#2b3a6b'; c.font = 'bold 18px "Courier New", monospace';
  c.fillText('CAMP', 22, 238); c.fillText('4B?', 330, 110); c.fillText('DOOR??', 160, 40);
  c.strokeStyle = '#a32'; c.beginPath(); c.arc(170, 60, 14, 0, TAU); c.stroke();
  c.strokeStyle = '#2b3a6b'; c.lineWidth = 2; c.strokeRect(6, 6, w - 12, h - 12);
  c.fillText('HUM LOUDER →', 210, 200);
}
function drawBoard0(c, w, h) {
  c.fillStyle = '#f2f1ec'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#1f2f7a'; c.font = '26px "Comic Sans MS", "Marker Felt", cursive';
  BOARD0.forEach((l, i) => c.fillText(l, 14, 34 + i * 40));
  c.strokeStyle = '#b22'; c.lineWidth = 3; c.beginPath(); c.moveTo(150, 74); c.lineTo(230, 62); c.stroke();
}
const BOARD0 = ['ROLL CALL: MARSH OKAFOR REYES BRANDT CAMERA', 'WATER 9 · 7 · 4', 'BATTERY IS FOR THE DOOR. NOT THE KETTLE. T.B.', 'BREAKERS: FOLLOW THE YELLOW', 'NOBODY SLEEPS ALONE', 'WHO MOVED MY COT'];
function campMapText0() {
  const lines = ['Pencil over pen over pencil. Somebody kept correcting it.', 'CAMP is circled. A yellow line leaves it toward a box marked 4B?.', 'DOOR?? has two question marks and a red ring.'];
  if (P0.off) lines.push(`In the corner, smaller: "office ${compassWord(P0.off.cx - P0.camp.cx, P0.off.cz - P0.camp.cz).toLowerCase()} of here. wet. don't."`);
  return lines;
}

// ----- the logbook -----
const LOG0 = [
  ['OKAFOR · LOG · PAGE 1', ['Day 1. Survey band 4.6. Nine\'s beacon is under the hum, faint, on repeat.', 'Marsh says it\'s an echo. Echo of what. Outpost Nine has been dark since their relief team went in.', 'Logging it anyway.']],
  ['OKAFOR · LOG · PAGE 2', ['Day 2. These breakers trip if you look at them wrong. Brandt reset them twice. The hum drops a tone when the power\'s on.', 'Something down the east halls did not like that.', 'Code is split across the tapes. If Marsh asks, it was his idea.']],
  ['OKAFOR · LOG · PAGE 3', ['Day 3, maybe. Reyes thinks the beacon is a recording. I think a recording doesn\'t answer back.', 'It answered.', 'Trying the door alone tonight. If that was a mistake, the code\'s on the tapes, and I\'m sorry.']]];
function readLog0(i) {
  const first = !P0.logs[i]; P0.logs[i] = true;
  readDoc('log' + i, LOG0[i][0], LOG0[i][1], { kind: 'log' });
  const n = P0.logs.filter(Boolean).length;
  task('log', `OKAFOR'S LOGBOOK · ${n}/3 PAGES`, { opt: true, sub: 'PAGES WERE LEFT AT THE CAMP, THE SUBSTATION AND THE OFFICE' });
  if (first && n === 3 && !P0.logDone) {
    P0.logDone = true; taskDone('log', 'OKAFOR\'S LOGBOOK · ALL THREE PAGES');
    later(2.5, () => { PL.spare++; SFX.pickup(); toast('TAPED BEHIND PAGE 3 · A SPARE BATTERY', 2.8); });
    flag('log0', true);
  }
}

// ----- the field radio: a line to Outpost Nine, and a fix on the nearest lost rig -----
function useRadio0() {
  if (P0.radioCd > 0) { SFX.staticBurst(0.2, 0.3); toast('THE RADIO IS STILL WARMING UP', 1.6); return; }
  P0.radioCd = 60; P0.radioN++; SFX.staticBurst(0.4, 0.6); FX.glitch = Math.max(FX.glitch, 0.6); makeNoise(0.35);
  if (P0.radioN === 1) {
    say('???', 'Outpost Nine, Outpost Nine. Who is on this band?', { radio: true, delay: 0.6 });
    say('OUTPOST 9', 'Say again, you broke up. Marsh\'s team?', { radio: true });
    say('OUTPOST 9', 'Okay. Leave your recorder running. We can hear where it points.', { radio: true });
    task('radio', 'CALL OUTPOST NINE ON THE CAMP RADIO', { opt: true, quiet: true }); taskDone('radio', 'OUTPOST NINE ANSWERED', true);
    flag('nine0', true);
  } else if (G.tapes < 4) say('OUTPOST 9', pick(['Nine. Still here. Pinging your rigs.', 'Nine. Copy. Hold still a second.', 'Nine. That hum is louder on your end.']), { radio: true, delay: 0.5 });
  else say('OUTPOST 9', 'Nine. You have the numbers. Get to the door. We\'ll talk on the other side.', { radio: true, delay: 0.5 });
  if (G.tapes < 4) later(3.2, () => { const th = HINT_T[G.diff]; G.hintT = Math.max(G.hintT, th[1] + 0.5); });
}
function searchCrate0() {
  P0.crate = true; SFX.search(); PL.water += G.diff === 0 ? 2 : 1; PL.spare++; makeNoise(0.15);
  toast(G.diff === 0 ? 'CRATE · 2 ALMOND WATER + BATTERY' : 'CRATE · ALMOND WATER + BATTERY', 2.4);
}

// ----- power for the exit -----
function powerKnown0(why) {
  if (P0.powerTold) return; P0.powerTold = true;
  task('power', 'POWER THE EXIT KEYPAD', { sub: P0.sub ? 'THROW THE THREE BREAKERS IN SUBSTATION 4B — OR CARRY BRANDT\'S BATTERY FROM CAMP' : 'CARRY BRANDT\'S BATTERY FROM CAMP', delay: why === 'door' ? 1.5 : 0.2 });
  setObj0();
}
function throwBreaker0(i) {
  P0.breakers[i] = true; const it = W.p0.breakers[i]; it.h.rotation.x = -0.5; setEmi(it.lamp, 0.12, 1.6, 0.25);
  SFX.thunk(); SFX.buzz(null); FX.glitch = Math.max(FX.glitch, 1.1); PL.shake = Math.max(PL.shake, 0.6); makeNoise(1);
  for (const h of AI.howlers) if (h.st !== 'chase' && h.st !== 'retreat') { h.lk = { x: PL.x + rnd(-2, 2), z: PL.z + rnd(-2, 2) }; h.st = 'investigate'; h.stT = 0; }
  powerKnown0();
  const n = P0.breakers.filter(Boolean).length;
  if (n === 1) later(2.2, () => sayExp(0, 'Marsh. Who is on the breakers? Everything down here heard that.') || sayExp(1, 'Okafor. Somebody is on the breakers. Quietly, please.'));
  if (n === 3) powerOn0('breakers'); else { toast(`BREAKER ${n}/3`, 1.8); setObj0(); }
}
function takeBattery0() {
  P0.carry = true; PL.load = true; W.p0.battery.setEnabled(false); SFX.pickup(); makeNoise(0.2);
  toast('BRANDT\'S BATTERY · HEAVY · NO SPRINTING', 2.8); powerKnown0(); setObj0(); cpSave('BATTERY');
  if (!P0.brSaid && aliveExp(3)) { P0.brSaid = true; later(3, () => sayExp(3, 'Brandt. Is that my battery moving? Keep it level. The acid eats boots.')); }
}
function connectBattery0() {
  P0.carry = false; PL.load = false;
  const E = W.exit, p = BABYLON.Vector3.TransformCoordinates(V3(0.62, 0, 0.3), E.root.getWorldMatrix());
  W.p0.exitBatt = batteryMesh0(p.x, p.z, E.root.rotation.y + 0.4);
  SFX.battery(); powerOn0('battery');
}
function powerOn0(route) {
  P0.power = 1; P0.route = route; flag('power0', route);
  if (W.exit) setEmi(W.exit.led, 3, 0.1, 0.05);
  SFX.beep(880, 0.08); later(0.12, () => SFX.beep(1320, 0.1)); FX.glitch = Math.max(FX.glitch, 0.8);
  toast('EXIT KEYPAD · POWER ON', 2.6); task('power'); taskDone('power', route === 'battery' ? 'EXIT KEYPAD POWERED · BRANDT\'S BATTERY' : 'EXIT KEYPAD POWERED · BREAKERS', true);
  cpSave('POWER ON'); setObj0();
  later(3.5, () => sayExp(3, route === 'battery' ? 'Brandt. Hear that beep? That\'s my battery earning its keep.' : 'Brandt. Panel\'s humming again. Don\'t touch anything else in there.'));
}
function exitLabel0() {
  if (!P0.power && P0.rooms.length) return P0.carry ? (holdBusy(W.exit) ? `CONNECTING… ${holdPct(W.exit)}%` : 'CONNECT BRANDT\'S BATTERY') : 'KEYPAD — NO POWER';
  return G.code.length < 4 ? 'KEYPAD — LOCKED' : 'ENTER CODE';
}
function exitUse0() {   // true = the power step handled the press
  if (P0.power || !P0.rooms.length) return false;
  if (P0.carry) { holdStart(W.exit, 1.6, connectBattery0, { r: 2.6, noise: 0.25, cancel: 'THE CLAMPS SLIP OFF' }); return true; }
  SFX.beep(200, 0.3); toast('KEYPAD DEAD · NO POWER', 2.2); powerKnown0('door'); return true;
}

// ----- Reyes, hurt in the flooded office -----
function placeReyes0() {
  const e = AI.exps[2], R = P0.off; if (!e || !R) return;
  const d = P0.offDesks && P0.offDesks[0], p = { x: R.cx + (R.X1 - R.cx) * 0.55, z: R.cz + (R.Z1 - R.cz) * 0.15 }; collide(p, 0.45);
  e.place(p.x, p.z, rnd(0, TAU)); e.hurt = true; e.st = 'hurt'; e.stT = 0;
  e.inter.label = () => P0.reyes === 'helped' ? 'TALK TO L. REYES' : PL.water > 0 && P0.reyes !== 'unmet' ? 'GIVE L. REYES ALMOND WATER' : 'TALK TO L. REYES';
}
function reyesTalk0(e) {
  if (P0.reyes === 'unmet' || (P0.reyes === 'asked' && PL.water <= 0)) {
    const first = P0.reyes === 'unmet'; P0.reyes = 'asked';
    task('reyes', 'HELP REYES · SHE NEEDS ALMOND WATER', { opt: true, sub: 'FLOODED OFFICE' }); task('reyes', null, { hidden: false });
    if (first) { say(e.name, 'Hey. Camera. Watch your step, the carpet is a lake.', { pos: e }); say(e.name, 'Ankle\'s done. My water went in the flood. Do you have any?', { pos: e }); }
    else say(e.name, pick(['Still no water? Fine. I\'ll drink the carpet.', 'Go do your job. I\'m not going anywhere.']), { pos: e });
    return true;
  }
  if (P0.reyes === 'asked' && PL.water > 0) {
    PL.water--; P0.reyes = 'helped'; SFX.drink(); flag('reyes0', 'helped');
    say(e.name, 'Oh. Thank you. Okay.', { pos: e });
    later(2.6, () => { if (!e.alive) return; PL.hp = Math.min(100, PL.hp + 50); PL.san = Math.min(100, PL.san + 15); SFX.pickup(); toast('REYES\'S MED KIT · HEALTH +50', 2.6); say(e.name, 'Take the kit. I can\'t carry it on one leg anyway.', { pos: e }); });
    later(7.5, () => { if (!e.alive) return; say(e.name, 'One more thing. If I call you from somewhere I can\'t be, it isn\'t me.', { pos: e }); });
    later(12, () => { if (!e.alive) return; e.hurt = false; e.st = 'idle'; e.stT = 0; e.dur = 3; if (e.rig.sk) rigWant(e.rig, null, { fade: 0.6 }); });
    later(25, () => sayExp(0, 'Marsh. Reyes is walking. Badly, but walking.'));
    taskDone('reyes', 'REYES IS ON HER FEET', true); toast('LEAD CLOSED · REYES IS ON HER FEET', 2.6);
    return true;
  }
  return false;
}
function hurtUpdate0(e, dt) {   // seated against the partition: look at the player, never wander, cannot flee
  e.spd = damp(e.spd, 0, 6, dt);
  if (e.d < 8 && los(e.x, e.z, PL.x, PL.z)) e.face(Math.atan2(PL.x - e.x, PL.z - e.z), 1.2, dt);
  if (e.rig.sk) rigWant(e.rig, 'kneel', { range: [1.0, 3.6], loop: false, fade: 0.5, t: 0.45 });
}

// ----- explorer conversations that know the story so far -----
function talk0(e) {
  if (e.i === 2 && e.hurt) return reyesTalk0(e);
  if (e.i === 1 && P0.logs[2] && !P0.okSaid) {
    P0.okSaid = true;
    say(e.name, 'You read my log. Fine.', { pos: e });
    say(e.name, 'I did try the door. It didn\'t open for me either. Don\'t tell Marsh.', { pos: e });
    return true;
  }
  if (e.i === 3 && P0.carry && !P0.brSaid) { P0.brSaid = true; say(e.name, 'That\'s my battery. Good. Keep it off the wet carpet.', { pos: e }); return true; }
  if (e.i === 0 && e.talks === 1 && !P0.marshSaid) { P0.marshSaid = true; later(5.5, () => { if (e.alive) say(e.name, `Copy. That's ${AI.exps.filter(x => x.alive).length} of us I can count. Stay on the door when we find it.`, { pos: e }); }); }
  return false;
}
function mimicLine0() {   // the Mimic borrows whoever the player trusts most right now
  if (P0.reyes === 'helped' && RNG() < 0.4) return { text: pick(['Hey. Camera. Over here.', 'Camera. My ankle is fine now. Come look.']), vo: null };
  return null;
}
const DEADSAY0 = { 0: [3, 'Brandt. Marsh? Marsh, copy.'], 1: [2, 'Reyes. Okafor stopped transmitting. Okay. Okay.'], 2: [0, 'Marsh. Reyes is off the band. Keep moving.'], 3: [1, 'Okafor. Brandt is down. His battery\'s still at camp, if anyone needs it.'] };
function expDied0(e) {
  if (e.i === 2 && P0.reyes !== 'helped') taskFail('reyes', 'REYES DID NOT MAKE IT');
  const [w, line] = DEADSAY0[e.i] || [];
  later(5, () => { if (!sayExp(w, line)) { const a = AI.exps.filter(x => x.alive); if (a.length) say(a[0].name, 'Copy. Keep moving.', { radio: true }); } });
}

// ----- per-frame story beats -----
function places0Events(dt) {
  if (!P0.rooms.length) return;
  P0.radioCd = Math.max(0, P0.radioCd - dt);
  const R = placeAt0(PL.x, PL.z);
  if (R && !P0.seen[R.k]) {
    P0.seen[R.k] = true; toast(PLACE0_NAME[R.k], 2.6); SFX.beep(1100, 0.05);
    if (R.k === 'camp') { task('radio', 'CALL OUTPOST NINE ON THE CAMP RADIO', { opt: true }); powerKnown0(); }
    if (R.k === 'sub') powerKnown0();
    if (R.k === 'off' && P0.reyes === 'unmet') task('reyes', 'SOMEONE IS IN THE FLOODED OFFICE', { opt: true });
  }
  if (!P0.powerTold && (P0.powerT -= dt) <= 0) {
    if (!sayExp(3, `Brandt. Door by the red light has a dead keypad. Breakers are ${P0.sub ? compassWord(P0.sub.cx - cellCenter(LV.spawn.x), P0.sub.cz - cellCenter(LV.spawn.y)).toLowerCase() : 'somewhere'} of where we landed. Or carry my battery from camp.`)) P0.powerT = 20;
    else powerKnown0();
  }
  const e = AI.exps[2];
  if (e && e.alive && e.hurt && P0.reyes !== 'helped' && P0.reyesCalls < 3 && (P0.reyesCallT -= dt) <= 0 && !SUBS.cur && e.d > 10) {
    P0.reyesCallT = rnd(95, 130);
    const lines = [`Reyes. I'm in the office with the cubicles, ${compassWord(P0.off.cx - cellCenter(LV.spawn.x), P0.off.cz - cellCenter(LV.spawn.y)).toLowerCase()} of where we landed. Ankle's gone.`, 'Reyes. Still here. Still wet.', 'Reyes. If anyone is passing the office, I would take a water. Or a joke.'];
    say(e.name, lines[P0.reyesCalls++], { radio: true });
    if (P0.reyes === 'unmet') task('reyes', 'REYES IS HURT · THE FLOODED OFFICE', { opt: true, sub: 'SHE CALLED FROM THE OFFICE WITH THE CUBICLES' });
  }
  if (P0.carry) { PL.load = true; if (PL.run) PL.run = false; }
}
function setObj0() {
  const t = G.tapes;
  let s;
  if (t < 4) s = `FIND THE LOST TAPES · ${t}/4` + (P0.powerTold && !P0.power ? ' · EXIT HAS NO POWER' : '');
  else if (!P0.power && P0.rooms.length) s = P0.carry ? 'CARRY THE BATTERY TO THE EXIT DOOR' : `POWER THE EXIT · BREAKERS ${P0.breakers.filter(Boolean).length}/3 OR BRANDT'S BATTERY`;
  else s = 'REACH THE EXIT — FOLLOW THE RED MARKER';
  objective(s);
  task('tapes', t < 4 ? `FIND THE 4 LOST TAPES · ${t}/4` : 'FOUR TAPES · FOUR DIGITS', { quiet: true }); if (t >= 4) taskDone('tapes', null, true);
  if (t >= 4 && (P0.power || !P0.rooms.length)) task('exit', 'ENTER THE CODE AT THE EXIT DOOR', { quiet: true });
}
function target0() {
  if (!G.exitOn && !(P0.carry && P0.power === 0)) return null;
  if (P0.carry || P0.power || !P0.rooms.length) return W.exit;
  const s = P0.sub && !P0.power ? { x: P0.sub.cx, z: P0.sub.cz } : null, c = P0.camp && W.p0 && W.p0.battery.isEnabled() ? { x: P0.camp.cx, z: P0.camp.cz } : null;
  if (s && c) return dist2(PL.x, PL.z, s.x, s.z) < dist2(PL.x, PL.z, c.x, c.z) ? s : c;
  return s || c || W.exit;
}
function places0Start() {   // a new attempt on the same layout: put every story prop back
  resetP0(); PL.load = false;
  if (W.exit && P0.rooms.length) setEmi(W.exit.led, 0);
  if (!W.p0) return;
  if (W.p0.battery) W.p0.battery.setEnabled(true);
  if (W.p0.exitBatt) { W.p0.exitBatt.dispose(); W.p0.exitBatt = null; }
  for (const b of W.p0.breakers) { b.h.rotation.x = 0.55; setEmi(b.lamp, 1.6, 0.12, 0.05); }
}
function flags0() { flag('lost0', G.lost); if (!flag('reyes0')) flag('reyes0', P0.reyes === 'helped' ? 'helped' : AI.exps[2] && !AI.exps[2].alive ? 'lost' : P0.reyes); }

if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { P0, RUN, TASKS, DOC, HOLD, readLog0, useRadio0, throwBreaker0, takeBattery0, connectBattery0, powerOn0, reyesTalk0, placeAt0, setObj0, target0, readDoc, openNotes, task, taskOf, flag }));
