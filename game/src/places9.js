// ---------- r6 · Level 9 places and story: street names, the Hale house, the blue house, the Watch house ----------
// Second road to the elevator: Dr. Hale's spare administrator card is in his wall safe. Curing him is no longer the only way out.
const P9S = {};
const ST9_H = ['OAK DRIVE', 'MAPLE STREET', 'ASH COURT', 'PINE ROAD'], ST9_V = ['BIRCH LANE', 'CEDAR AVENUE', 'ELM STREET', 'LINDEN WAY'];
function resetP9() {
  for (const k of Object.keys(P9S)) delete P9S[k];
  Object.assign(P9S, { pages: [false, false, false], plate: false, photo: false, safeOpen: false, spare: false, rota: false, minutes: false, recorder: false,
    seen: {}, reliefSaid: false, mapleSaid: false, leaveSaid: false, safeSaid: false, haleRead: false, recT: 0 });
}
resetP9();

// ----- layout: which houses carry the story (called from genLayout9 once reds / canisters / lit houses are chosen) -----
function rolePlan9() {
  const pool = LV.houses.filter(h => h.enter && !h.red && !h.cans);
  const front = h => h.lv === 0 ? h.bj : h.bj + 1;   // index of the street a house faces
  const spawn = { hx: 1, hz: 5 }, far = (a, b) => Math.hypot(a.hx - b.hx, a.hz - b.hz);
  const watch = pool.find(h => h.lit) || pool[0];
  const rest = pool.filter(h => h !== watch);
  const hale = rest.slice().sort((a, b) => (far(b, spawn) + RNG() * 8) - (far(a, spawn) + RNG() * 8))[0] || null;
  const relief = rest.filter(h => h !== hale).sort((a, b) => (far(b, hale || spawn) + RNG() * 6) - (far(a, hale || spawn) + RNG() * 6))[0] || null;
  LV.st9 = { h: ST9_H.slice(), v: ST9_V.slice() };
  if (hale) { const i = front(hale), j = LV.st9.h.indexOf('MAPLE STREET'); [LV.st9.h[i], LV.st9.h[j]] = [LV.st9.h[j], LV.st9.h[i]]; }   // the Hales lived on Maple Street
  for (const h of LV.houses) { h.street = LV.st9.h[front(h)]; h.num = 1100 + h.hx * 2 + h.lv; }
  if (watch) { watch.role = 'watch'; watch.lit = true; }
  if (hale) hale.role = 'hale';
  if (relief) { relief.role = 'relief'; relief.tint = [0.56, 0.68, 0.86]; }
  LV.role9 = { watch, hale, relief };
}
const addr9 = h => h ? `${h.num} ${h.street}` : '';
const shortSt9 = s => s.split(' ')[0].charAt(0) + s.split(' ')[0].slice(1).toLowerCase();

// ----- shared text materials (one texture per string) -----
function txtMat9(text, o = {}) {
  const key = text + '|' + (o.bg || '') + '|' + (o.fg || '');
  W9.txt = W9.txt || new Map(); let m = W9.txt.get(key); if (m) return m;
  const w = o.px || 512, h = o.py || 96, dt = new BABYLON.DynamicTexture('t9_' + text, { width: w, height: h }, SCN, false), c = dt.getContext();
  c.fillStyle = o.bg || '#1f5a2c'; c.fillRect(0, 0, w, h);
  if (o.border !== false) { c.strokeStyle = o.fg || '#f2f2ea'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); }
  c.fillStyle = o.fg || '#f2f2ea'; c.font = `bold ${o.size || Math.round(h * 0.52)}px ${o.font || 'Arial, Helvetica, sans-serif'}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = text.split('\n'); lines.forEach((l, i) => c.fillText(l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * (o.lh || h * 0.42) + 2));
  dt.update(); m = dtexMat('t9m', dt, o.emis ?? 0.55); W9.txt.set(key, m); return m;
}
function txtPlane9(mat, w, h, parent, pos, ry = 0, both = false) {
  const mk = (r) => { const p = BABYLON.MeshBuilder.CreatePlane('t9p', { width: w, height: h }, SCN); p.material = mat; p.parent = parent; p.position.set(pos[0], pos[1], pos[2] + (r ? -0.004 : 0)); p.rotation.y = Math.PI + ry + (r ? Math.PI : 0); p.isPickable = false; return p; };
  mk(false); if (both) mk(true);
}

// ----- building -----
function buildPlaces9() {
  const B = W9.B, R = LV.role9 || {};
  W9.p9 = { pages: [], safe: null };
  W9.pageMat = actMat('p9page', { spec: 0.1, shin: 8, emis: 1, wrap: 0.4 }); setEmi(W9.pageMat, 0.35);
  streetSigns9(B);
  for (const h of LV.houses) if (h.red || h.role) numberPlate9(B, h);
  if (R.hale) buildHaleHouse9(B, R.hale);
  if (R.watch) buildWatchHouse9(B, R.watch);
  if (R.relief) buildReliefHouse9(B, R.relief);
  { const [px, pz, ry] = wallPt(LAB_X, 7, 2, 0.01, 0), r = propRoot(px, pz, ry); page9(1, r, [-0.5, 0.935, 0.42], [0, 0.4, 0]); }   // on the lab workbench, beside the crowbar
}
function page9(i, parent, pos, rot) {
  const p = part('Box', { width: 0.21, height: 0.004, depth: 0.29 }, parent, W9.pageMat, [0.92, 0.9, 0.82], 0, pos, rot);
  const w = parent ? localPt(parent, pos[0], pos[1], pos[2]) : V3(pos[0], pos[1], pos[2]);
  const it = { x: w.x, z: w.z, y: w.y, r: 1.8, label: () => P9S.pages[i] ? 'READ HALE\'S NOTES AGAIN' : 'READ THE HANDWRITTEN NOTES', ok: () => true, act: () => readHale9(i) };
  W.interact.push(it); W9.p9.pages[i] = it; return p;
}
function outside9(h, along, off = 0.012) {   // a point on the outside face of the front wall, beside the door, facing the lawn
  const f = h.front, nx = f.x + DX[f.d], ny = f.y + DY[f.d];
  const [x, z, ry] = wallPt(nx, ny, (f.d + 2) % 4, off, along); return propRoot(x, z, ry);
}
function numberPlate9(B, h) {
  const r = outside9(h, -1.0);
  B.add(r, 'Box', { width: 0.46, height: 0.2, depth: 0.025 }, [0.2, 0.17, 0.12], 0, [0, 1.7, 0.012]);
  txtPlane9(txtMat9(String(h.num) + (h.role === 'hale' ? ' · HALE' : ''), { bg: '#e8e0c8', fg: '#2a2014', px: 256, py: 96, size: 46, font: 'Georgia, serif', emis: 0.35 }), 0.42, 0.16, twin(r), [0, 1.7, 0.027]);
  if (h.role === 'hale') { const p = localPt(r, 0, 1.7, 0.4); W.interact.push({ x: p.x, z: p.z, y: 1.7, r: 2.2, label: () => 'READ THE NAMEPLATE', ok: () => true, act: () => { P9S.plate = true; readDoc('plate9', 'NAMEPLATE', [`${h.num} · HALE`, 'Brass, polished more recently than anything else on this street.'], { kind: 'note' }); safeTask9(); } }); }
}
function streetSigns9(B) {
  const post = [0.35, 0.36, 0.34];
  for (let bj = 0; bj < 3; bj++) for (let bi = 0; bi < 3; bi++) {
    if (bi === 1 && bj === 1) continue;
    const ox = L9_BLK[bi], oz = L9_BLK[bj], x = (ox + 1) * CELL + 0.35, z = oz * CELL + 0.35, r = propRoot(x, z, 0);
    B.add(r, 'Cylinder', { diameter: 0.07, height: 2.7, tessellation: 8 }, post, 0, [0, 1.35, 0]);
    const hName = LV.st9.h[bj], vName = LV.st9.v[bi];
    const r2 = twin(r), a = tnode(r2, 0, 2.62, 0); a.rotation.y = 0; txtPlane9(txtMat9(hName), 1.25, 0.24, a, [0.55, 0, 0], 0, true);
    const b = tnode(r2, 0, 2.36, 0); b.rotation.y = Math.PI / 2; txtPlane9(txtMat9(vName), 1.25, 0.24, b, [0.55, 0, 0], 0, true);
    addSolid(x - 0.08, z - 0.08, x + 0.08, z + 0.08, 'prop');
  }
}
function roomOf9(h, t, fl = 0) { return h.rooms.find(r => r.t === t && r.fl === fl) || null; }
function slotIn9(h, rooms, o = {}) {   // the first of the preferred rooms with a free wall, then any room of the house
  const order = rooms.filter(Boolean).concat(h.rooms.filter(r => r.fl === 0 && r.t !== 'stair'), h.rooms);
  for (const r of order) { const root = slotRoot9(r, o); if (root) return root; }
  return null;
}
function slotRoot9(room, o = {}) { const s = room && takeSlot(room, Object.assign({ noWin: true }, o)); if (!s) return null; const [x, z, ry] = wallPt(s.x, s.y, s.d, o.off ?? 0.01, o.along || 0); return propRoot(x, z, ry); }
function buildHaleHouse9(B, h) {
  // kitchen: a side table with the first page and a mug
  const kr = slotIn9(h, [roomOf9(h, 'kitchen'), roomOf9(h, 'dining'), h.entryRoom]);
  if (kr) { B.add(kr, 'Box', { width: 0.9, height: 0.04, depth: 0.5 }, COL9.wood2, 0, [0, 0.76, 0.27]); legs4(B, kr, 0.9, 0.5, 0.74, COL9.wood); B.add(kr, 'Cylinder', { diameter: 0.08, height: 0.1, tessellation: 10 }, [0.82, 0.8, 0.76], 0, [0.28, 0.83, 0.25]); solidLocal(kr, -0.48, 0, 0.48, 0.55); page9(0, twin(kr), [-0.1, 0.785, 0.27], [0, 0.35, 0]); }
  // entry: photographs on a sideboard
  const er = slotIn9(h, [h.entryRoom, roomOf9(h, 'living'), roomOf9(h, 'family')]);
  if (er) {
    B.add(er, 'Box', { width: 1.2, height: 0.8, depth: 0.4 }, COL9.wood, 0, [0, 0.4, 0.21]); solidLocal(er, -0.62, 0, 0.62, 0.44);
    for (let i = 0; i < 3; i++) { B.add(er, 'Box', { width: 0.2, height: 0.26, depth: 0.03 }, [0.16, 0.12, 0.08], 0, [-0.38 + i * 0.38, 0.94, 0.12], [-0.15, 0, 0]); B.add(er, 'Box', { width: 0.15, height: 0.2, depth: 0.004 }, [0.7, 0.62, 0.5], 0.2, [-0.38 + i * 0.38, 0.945, 0.137], [-0.15, 0, 0]); }
    const p = localPt(er, 0, 0.95, 0.5);
    W.interact.push({ x: p.x, z: p.z, y: 0.95, r: 1.9, label: () => 'LOOK AT THE PHOTOGRAPHS', ok: () => true, act: () => { P9S.photo = true; readDoc('photo9', 'PHOTOGRAPHS ON THE SIDEBOARD', ['A man in a M.E.G. jacket with a girl on his shoulders. On the back, in pencil: June, Ash Court, the summer the pool froze.', 'The same man, thinner, in front of this house. Nobody wrote on that one.', 'The third frame is empty. The glass is clean.'], { kind: 'note' }); } });
  }
  // the deepest room: the wall safe
  const sr = slotIn9(h, [h.termRoom !== h.entryRoom ? h.termRoom : null, roomOf9(h, 'study', 1), roomOf9(h, 'bed', 1)], { off: 0.02 });
  if (sr) {
    B.add(sr, 'Box', { width: 0.56, height: 0.56, depth: 0.06 }, [0.24, 0.25, 0.26], 0, [0, 1.25, 0.03]);
    const sk = twin(sr), sm = actMat('safe9', { spec: 0.7, shin: 40, emis: 1, wrap: 0.3 }), hinge = tnode(sk, -0.24, 1.25, 0.065);
    const door = mkMerged(sm, P => { P('Box', { width: 0.48, height: 0.48, depth: 0.05 }, [0.3, 0.31, 0.33], 0, [0.24, 0, 0.025]); P('Cylinder', { diameter: 0.12, height: 0.03, tessellation: 16 }, [0.7, 0.68, 0.6], 0, [0.24, 0, 0.06], [Math.PI / 2, 0, 0]); P('Box', { width: 0.03, height: 0.1, depth: 0.03 }, [0.7, 0.68, 0.6], 0, [0.4, 0, 0.06]); }, 'safeDoor');
    attach(door, hinge);
    const card = mkMerged(W.itemMat, P => { P('Box', { width: 0.085, height: 0.055, depth: 0.004 }, [0.2, 0.6, 0.7], 0.6, [0, 0, 0]); P('Box', { width: 0.03, height: 0.03, depth: 0.005 }, [0.9, 0.85, 0.5], 0.4, [-0.02, 0.005, 0.002]); }, 'spareCard');
    attach(card, sk, 0, 1.22, 0.05); card.rotation.x = -0.2;
    const p = localPt(sr, 0, 1.25, 0.6);
    const it = { x: p.x, z: p.z, y: 1.25, r: 1.9, label: () => P9S.safeOpen ? 'TAKE THE SPARE KEYCARD' : !safeKnown9() ? 'WALL SAFE · LOCKED' : holdBusy(it) ? `DIALING ${LV.role9.hale.num}… ${holdPct(it)}%` : `DIAL ${LV.role9.hale.num}`,
      ok: () => !P9S.spare, act: () => useSafe9(it) };
    W.interact.push(it); W9.p9.safe = { it, hinge, card, ang: 0, pos: localPt(sr, 0, 1.25, 0) };
  }
  const sp = localPt(outside9(h, 0), 0, 0, 2.5);
  W9.p9.halePt = { x: sp.x, z: sp.z };
}
function buildWatchHouse9(B, h) {
  const er = slotIn9(h, [h.entryRoom, roomOf9(h, 'living'), roomOf9(h, 'family')]);
  if (er) {
    B.add(er, 'Box', { width: 1.2, height: 0.9, depth: 0.04 }, [0.55, 0.4, 0.25], 0, [0, 1.45, 0.02]);
    for (let i = 0; i < 9; i++) B.add(er, 'Box', { width: 0.16, height: 0.21, depth: 0.004 }, i % 3 ? [0.92, 0.9, 0.82] : [0.95, 0.85, 0.4], 0.1, [-0.45 + (i % 3) * 0.42 + rnd(-0.04, 0.04), 1.2 + ((i / 3) | 0) * 0.27, 0.043], [0, 0, rnd(-0.2, 0.2)]);
    txtPlane9(txtMat9('PATROL ROTA', { bg: '#efe6c8', fg: '#7a1410', px: 256, py: 48, border: false, emis: 0.3 }), 0.5, 0.09, twin(er), [0, 1.84, 0.046]);
    const p = localPt(er, 0, 1.45, 0.6);
    W.interact.push({ x: p.x, z: p.z, y: 1.45, r: 2.0, label: () => 'READ THE PATROL ROTA', ok: () => true, act: () => readRota9() });
  }
  const tr = slotIn9(h, [h.rooms.find(r => r !== h.entryRoom && r.fl === 0 && r.t !== 'bath' && r.t !== 'hall'), h.entryRoom]);
  if (tr) {
    B.add(tr, 'Box', { width: 1.3, height: 0.04, depth: 0.6 }, COL9.wood, 0, [0, 0.74, 0.32]); legs4(B, tr, 1.3, 0.6, 0.72, COL9.dark); solidLocal(tr, -0.68, 0, 0.68, 0.64);
    for (let i = 0; i < 3; i++) { B.add(tr, 'Cylinder', { diameter: 0.05, height: 0.26, tessellation: 8 }, [0.15, 0.15, 0.16], 0, [-0.4 + i * 0.3, 0.79, 0.3], [0, 0, Math.PI / 2]); B.add(tr, 'Box', { width: 0.09, height: 0.004, depth: 0.32 }, [0.75, 0.62, 0.1], 0, [-0.4 + i * 0.3, 0.765, 0.45]); }
    B.add(tr, 'Box', { width: 0.24, height: 0.01, depth: 0.32 }, [0.92, 0.9, 0.82], 0, [0.45, 0.765, 0.3], [0, 0.2, 0]);
    const p = localPt(tr, 0.45, 0.77, 0.6);
    W.interact.push({ x: p.x, z: p.z, y: 0.77, r: 1.9, label: () => 'READ THE CLIPBOARD', ok: () => true, act: () => { P9S.minutes = true; readDoc('minutes9', 'WATCH MEETING · MINUTES', MINUTES9(), { kind: 'note' }); } });
  }
  // lawn sign
  const f = h.front, lx = f.x + DX[f.d] * 1, ly = f.y + DY[f.d] * 1, sx = cellCenter(lx) + DX[(f.d + 1) % 4] * 1.0, sz = cellCenter(ly) + DY[(f.d + 1) % 4] * 1.0;
  const lr = propRoot(sx, sz, Math.atan2(DX[f.d], DY[f.d]));
  for (const s of [-1, 1]) B.add(lr, 'Box', { width: 0.05, height: 1.2, depth: 0.05 }, [0.85, 0.85, 0.82], 0, [s * 0.4, 0.6, 0]);
  B.add(lr, 'Box', { width: 0.95, height: 0.55, depth: 0.03 }, [0.9, 0.9, 0.88], 0, [0, 1.0, 0]);
  txtPlane9(txtMat9('NEIGHBORHOOD\nWATCH', { bg: '#f4f2ea', fg: '#132a6b', px: 384, py: 220, size: 44, lh: 64, emis: 0.4 }), 0.9, 0.5, twin(lr), [0, 1.0, 0.017], 0, true);
  addSolid(sx - 0.5, sz - 0.5, sx + 0.5, sz + 0.5, 'prop');
}
function buildReliefHouse9(B, h) {
  // M.E.G. tape across the front door, a spray mark on the siding
  const tr = outside9(h, 0, 0.07);
  for (const s of [-1, 1]) B.add(tr, 'Box', { width: 1.5, height: 0.08, depth: 0.006 }, COL9.meg, 0.15, [0, 1.15, 0.003], [0, 0, s * 0.85]);
  const sr = outside9(h, 1.4, 0.014); txtPlane9(txtMat9('M.E.G. 4/4 X', { bg: 'rgba(0,0,0,0)', fg: '#e07a14', border: false, px: 256, py: 96, size: 54, font: '"Courier New", monospace', emis: 0.25 }), 0.8, 0.3, twin(sr), [0, 1.5, 0.003]);
  // inside: the relief team
  const R = h.entryRoom, c0 = R.cells[0], bx = cellCenter(c0 % N), bz = cellCenter((c0 / N) | 0);
  for (let i = 0; i < 2; i++) {
    const r = buildExplorer({ tint: i ? [0.8, 0.5, 0.14] : [0.86, 0.6, 0.18] }); mergeRig(r);
    const p = { x: bx + (i ? 0.9 : -0.6), z: bz + (i ? -0.5 : 0.7) }; collide(p, 0.45);
    r.root.position.set(p.x, 0, p.z); r.root.rotation.y = i * 2.1 + 0.4; if (r.sk) poseDeadSk(r, i ? 1 : -1, true); else poseDead(r, i ? 1 : -1);
    if (i === 0) { W9.p9.recPt = { x: p.x + 0.55, z: p.z + 0.2 }; page9(2, null, [p.x - 0.5, 0.006, p.z + 0.35], [0, 1.1, 0]); }
  }
  const rp = W9.p9.recPt; collide(rp, 0.2);
  const rec = mkMerged(W.itemMat, P => { P('Box', { width: 0.24, height: 0.07, depth: 0.15 }, [0.12, 0.12, 0.13], 0, [0, 0.035, 0]); P('Box', { width: 0.1, height: 0.004, depth: 0.065 }, [0.5, 0.5, 0.52], 0, [-0.04, 0.072, 0]); P('Sphere', { diameter: 0.014, segments: 4 }, [1, 0.15, 0.05], 1.4, [0.08, 0.075, 0.04]); }, 'recorder');
  rec.position.set(rp.x, 0, rp.z); rec.rotation.y = 0.6;
  W.interact.push({ x: rp.x, z: rp.z, y: 0.1, r: 1.8, label: () => P9S.recorder ? 'PLAY THE TAPE AGAIN' : 'PLAY THE TAPE RECORDER', ok: () => !P9S.recT || FX.t > P9S.recT, act: () => playAbara9() });
  // a fifth canister and the team's supplies
  for (const r of shuffle(h.rooms.filter(r => r !== R && r.fl === 0))) { const s = takeSlot(r, { noWin: true }); if (!s) continue; const [px, pz, ry] = wallPt(s.x, s.y, s.d, 0.01, 0); h.locker = buildLocker(px, pz, ry, 'locker', 'relief'); break; }
  for (const [type, dx, dz] of [['water', 0.4, -0.9], ['water', 0.6, -0.8], ['battery', -0.8, -0.7]]) {
    const p = { x: bx + dx, z: bz + dz }; collide(p, 0.3);
    const root = tnode(null, p.x, 0, p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, W.itemMat);
    const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
    W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
  }
}

// ----- documents and voices -----
function HALE9_PAGES() {
  const h = LV.role9 && LV.role9.hale, num = h ? h.num : '0000';
  return [
    ['M. HALE · NOTES · KITCHEN', ['Week 3. The cure holds in the vials. Not in the mice.', 'Spare admin card is in the study safe. The combination is the house number, like an idiot.', 'June would have laughed at that.']],
    ['M. HALE · NOTES · LAB BENCH', ['Week 6. No more mice. I am the only subject left who can describe it.', 'If it takes, I won\'t remember the weeks in between. Nine knows the order.', `Safe is ${String(num).split('').join(' ')}. Writing it down. Soon I won't hold it.`]],
    ['M. HALE · TORN PAGE', ['Week 7? My hands are wrong. I can still read.', 'Abara thinks the cure is the problem. It isn\'t. The cage is. Four canisters, the lure, the mist.', 'Tell June I tried the', '(the rest of the page is missing)']]];
}
function MINUTES9() { return ['Item 1. Lights after dark. Agreed.', `Item 2. The ${LV.role9 && LV.role9.hale ? LV.role9.hale.num : ''} house. Agreed.`, 'Item 3. The new family on the corner. Agreed.', 'Item 4. Agreed.', 'Item 5. Agreed.', 'Meeting closed. Nobody went home.']; }
function readHale9(i) {
  const first = !P9S.pages[i]; P9S.pages[i] = true; const T = HALE9_PAGES()[i];
  readDoc('hale9_' + i, T[0], T[1], { kind: 'log' });
  const n = P9S.pages.filter(Boolean).length;
  task('journal', `DR. HALE'S NOTES · ${n}/3`, { opt: true, sub: 'HIS HOUSE, THE LAB, AND WHEREVER HIS RELIEF TEAM ENDED UP' });
  if (n === 3) taskDone('journal', 'DR. HALE\'S NOTES · ALL THREE', true);
  if (first && (i === 0 || i === 1)) safeTask9();
  if (first && n === 1 && !P9S.mapleSaid && LV.role9.hale) { P9S.mapleSaid = true; }
}
function safeKnown9() { return P9S.pages[1] || (P9S.pages[0] && P9S.plate); }
function safeTask9() {
  if (P9S.spare) return;
  const h = LV.role9.hale; if (!h) return;
  if (safeKnown9()) task('safe', `OPEN HALE'S WALL SAFE · ${addr9(h)}`, { opt: true, sub: `THE COMBINATION IS ${h.num}. HIS SPARE CARD WORKS THE ELEVATOR` });
  else if (P9S.pages[0]) task('safe', 'HALE\'S SAFE · THE COMBINATION IS HIS HOUSE NUMBER', { opt: true, sub: 'READ THE NAMEPLATE BY HIS FRONT DOOR' });
  cardTask9();
}
function useSafe9(it) {
  const S = W9.p9.safe;
  if (P9S.safeOpen) { takeSpare9(); return; }
  if (!safeKnown9()) { SFX9.rattle(P9(it)); toast('WALL SAFE · A FOUR-DIGIT COMBINATION', 2.4); if (!taskOf('safe')) task('safe', 'A WALL SAFE IN THE HALE HOUSE', { opt: true, sub: 'FIND THE COMBINATION' }); return; }
  holdStart(it, 2.4, () => { P9S.safeOpen = true; S.want = 1; SFX9.unlock ? SFX9.unlock(P9(it)) : SFX.click(); SFX.beep(1400, 0.08); toast('THE SAFE SWINGS OPEN', 1.8); }, { r: 2.2, noise: 0.15, cancel: 'YOU LOSE THE NUMBERS', tick: (dt) => { if (Math.floor(FX.t * 6) !== Math.floor((FX.t - dt) * 6)) SFX.click(); } });
}
function takeSpare9() {
  if (P9S.spare) return;
  P9S.spare = true; G9.keycard = true; W9.p9.safe.card.setEnabled(false); SFX.pickup(); FX.glitch = Math.max(FX.glitch, 0.4);
  toast('SPARE ADMINISTRATOR KEYCARD', 2.6); taskDone('safe', 'HALE\'S SPARE KEYCARD', true); cpSave('SPARE KEYCARD');
  cardTask9(); setPhase9();
  if (!P9S.safeSaid) { P9S.safeSaid = true; say('M.E.G. OUTPOST 9', 'Nine. You opened his safe. That card works the elevator.', { radio: true, delay: 2 }); say('M.E.G. OUTPOST 9', 'He\'s still down in that cell. Your call.', { radio: true }); }
}
function readRota9() {
  const first = !P9S.rota; P9S.rota = true;
  readDoc('rota9', 'PATROL ROTA', [`${LV.st9.h.join(' · ')}`, 'Rounds start when the porch lights go out. Every street. Lights on.', 'Anyone out without a light is not a neighbor.', 'In the margin, in pencil: they walk it in the same order every time. Count.'], { kind: 'board' });
  if (first) { taskDone('watch', 'THE PATROL ROTA · YOU CAN TIME THE WATCH NOW', true); toast('THE CAMCORDER NOW SHOWS WHEN THE NEXT PATROL STARTS', 3); }
}
function playAbara9() {
  const first = !P9S.recorder; P9S.recorder = true; P9S.recT = FX.t + 18; SFX.tape(); FX.glitch = Math.max(FX.glitch, 0.8); makeNoise(0.25);
  const L = ['Day four. The blue house. Kowalczyk is gone. Lund won\'t come down off the stairs.', 'Hale isn\'t Hale anymore. He knows the doors. He knocks first, like he is being polite.', 'If Nine sends anybody else, don\'t open the cell. Please. I mean it.'];
  L.forEach((t, i) => say('S. ABARA · TAPE', t, { mode: 'tape', delay: i ? 0.4 : 1.1 }));
  if (first) {
    taskDone('relief', 'THE RELIEF TEAM · ABARA\'S TAPE', true); flag('abara9', true);
    later(20, () => say('M.E.G. OUTPOST 9', 'Nine. That was Abara. I hoped nobody would play that.', { radio: true }));
  }
}

// ----- objectives -----
function cardTask9() {
  if (!G9.labSeen && !P9S.spare) return;
  const h = LV.role9 && LV.role9.hale, alt = safeKnown9() || P9S.pages[0] ? ` — OR OPEN HIS SAFE AT ${addr9(h)}` : '';
  task('card', 'GET AN ADMINISTRATOR KEYCARD', { sub: 'CURE DR. HALE: CROWBAR, FOUR CANISTERS, LURE, CAGE, MIST' + alt });
  if (G9.keycard) { taskDone('card', P9S.spare && !AI9.hale ? 'KEYCARD · HALE\'S SPARE' : 'KEYCARD · FROM DR. HALE', true); task('elev', 'TAKE THE SERVICE ELEVATOR', { quiet: true }); }
}
function tasks9() {
  task('outpost', 'FIND THE M.E.G. OUTPOST · NORTH-EAST', { quiet: true }); if (G9.mapSeen) taskDone('outpost', 'THE OUTPOST MAP', true);
  if (G9.mapSeen) { task('data', `DOWNLOAD M.E.G. DATA FROM THE RED HOUSES · ${G9.data}/3`, { quiet: true }); if (G9.data >= 3) taskDone('data', 'M.E.G. DATA 3/3 · GATE OPEN', true); }
  if (G9.data >= 3) { task('lab', 'GO DOWN TO THE LAB', { quiet: true }); if (G9.labSeen) taskDone('lab', 'THE LAB', true); }
  cardTask9();
}
function spareRoute9() { return G9.keycard && !AI9.hale && ['lab', 'cans', 'prime', 'release', 'trapped', 'gate'].includes(G9.phase); }

// ----- beats -----
function arrive9() {
  const n0 = flag('nine0'), lost = flag('lost0');
  say('M.E.G. OUTPOST 9', n0 ? 'Nine. Is that you? The camera? You came through the wrong door.' : 'Outpost Nine. Somebody just came through our fence. Copy?', { radio: true });
  say('M.E.G. OUTPOST 9', `Three flashlights went up ${shortSt9(LV.st9.v[2])} ten minutes ago. Not ours. Stay off the asphalt.`, { radio: true });
  say('M.E.G. OUTPOST 9', 'Outpost is north-east, inside the chain-link. The map is on the gate.', { radio: true });
  if (lost !== undefined && G.lost !== undefined) later(40, () => { if (LVL === 9 && G.state === 'play') say('M.E.G. OUTPOST 9', lost ? `Marsh's band went quiet for ${lost === 1 ? 'one of them' : lost + ' of them'}. Keep that recorder running.` : 'Marsh\'s people are still on the lobby band. All four. Loud as ever.', { radio: true }); });
}
function places9Events(dt) {
  const R = LV.role9 || {}, c = cIdx(cellOf(PL.x), cellOf(PL.z)), h = houseOf9(c);
  if (h && h.role && !P9S.seen[h.role]) {
    P9S.seen[h.role] = true; SFX.beep(1100, 0.05);
    if (h.role === 'hale') { toast(`${addr9(h)} · HALE`, 2.8); if (!taskOf('halehouse')) task('halehouse', `THE HALE HOUSE · ${addr9(h)}`, { opt: true, quiet: true }); taskDone('halehouse', `THE HALE HOUSE · ${addr9(h)}`, true); }
    if (h.role === 'watch') { toast('THE BLOCK CAPTAIN\'S HOUSE', 2.8); task('watch', 'THE WATCH HOUSE · READ THEIR PATROL ROTA', { opt: true }); }
    if (h.role === 'relief') { toast('THE BLUE HOUSE', 2.8); if (!taskOf('relief')) task('relief', 'WHAT HAPPENED TO THE RELIEF TEAM', { opt: true, sub: 'THE BLUE HOUSE WITH M.E.G. TAPE ON THE DOOR' }); }
  }
  if (G9.mapSeen && !P9S.reliefSaid && R.relief && (P9S.mapT = (P9S.mapT || 0) + dt) > 9 && !SUBS.cur) {
    P9S.reliefSaid = true;
    say('M.E.G. OUTPOST 9', `Nine. Our relief team went quiet in the blue house on ${shortSt9(R.relief.street)}. Tape on the door. Don't stay long.`, { radio: true });
    if (!P9S.seen.relief) task('relief', 'WHAT HAPPENED TO THE RELIEF TEAM', { opt: true, sub: `THE BLUE HOUSE ON ${R.relief.street}, TAPE ON THE DOOR` });
  }
  if (G9.labSeen && !P9S.mapleSaid2 && R.hale && (P9S.labT = (P9S.labT || 0) + dt) > 9 && !SUBS.cur) {
    P9S.mapleSaid2 = true;
    say('M.E.G. OUTPOST 9', `Nine. Hale lived at ${addr9(R.hale).toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase())}. If you go up there, leave his things alone.`, { radio: true });
    if (!P9S.seen.hale) task('halehouse', `THE HALE HOUSE · ${addr9(R.hale)}`, { opt: true });
    cardTask9();
  }
  if (G9.haleStage === 2 && !P9S.haleRead && P9S.pages.some(Boolean) && AI9.hale && !SUBS.cur && !SUBS.q.length) { P9S.haleRead = true; later(3, () => say('DR. HALE', 'You read my notes. Then you know I did this to myself.', { pos: AI9.hale })); }
  const S = W9.p9 && W9.p9.safe; if (S) { S.ang = approach(S.ang, S.want ? 1.9 : 0, 1.4, 2, dt); S.hinge.rotation.y = -S.ang; }
}
function elevator9Leave() {   // true = hold the doors for one line
  if (AI9.hale || P9S.leaveSaid || !P9S.spare) return false;
  P9S.leaveSaid = true; say('M.E.G. OUTPOST 9', 'You\'re leaving him down there. Copy. Go.', { radio: true }); return false;
}
function flags9() { flag('hale9', AI9.hale ? 'saved' : 'left'); flag('journal9', P9S.pages.filter(Boolean).length); flag('rota9', P9S.rota); if (!flag('abara9')) flag('abara9', P9S.recorder); }
function watchTimer9() { return P9S.rota ? `WATCH ${Math.floor(Math.max(0, G9.watchT) / 60)}:${String(Math.floor(Math.max(0, G9.watchT)) % 60).padStart(2, '0')}` : ''; }
function drawStory9(c, X, Y, sc) {   // street names and the story houses on the map
  c.fillStyle = 'rgba(160,255,200,0.75)'; c.font = `${Math.round(sc * 0.8)}px monospace`;
  [1.5, 15.5, 29.5, 43.5].forEach((z, i) => c.fillText(LV.st9.h[i], X(4), Y(z) + sc * 0.3));
  [1.5, 15.5, 29.5, 43.5].forEach((x, i) => { c.save(); c.translate(X(x) + sc * 0.3, Y(40)); c.rotate(-Math.PI / 2); c.fillText(LV.st9.v[i], 0, 0); c.restore(); });
  const R = LV.role9 || {}, mark = (h, ch, col) => { if (!h) return; c.fillStyle = col; c.font = `bold ${Math.round(sc * 1.4)}px monospace`; c.fillText(ch, X(h.hx + HS / 2) - sc * 0.45, Y(h.hz + HS / 2) + sc * 0.5); };
  if (R.hale && (P9S.mapleSaid2 || P9S.seen.hale || P9S.pages[0])) mark(R.hale, 'H', '#9fd7ff');
  if (R.relief && (P9S.reliefSaid || P9S.seen.relief)) mark(R.relief, 'R', '#ffb060');
  if (R.watch && P9S.seen.watch) mark(R.watch, 'W', '#ff8080');
}
// ----- the Watch: a whistle on its rounds; on the third download it may walk a beat round that house -----
SFX9.whistle = function (pos) { shot((d, t) => {   // a pea whistle: two blasts, the ball rattling in it
  for (const [t0, len] of [[0, 0.55], [0.75, 0.95]]) {
    for (let k = 0; k * 0.034 < len; k++) tone(d, t + t0 + k * 0.034, 0.05, 'square', k % 2 ? 3150 : 2860, k % 2 ? 3120 : 2880, 0.05, 0.003);
    nz(d, t + t0, len, 'bandpass', 3000, 3, 0.08, 0.02);
  }
  return 2.2; }, pos, 1); };
function watchWhistle9(w) {
  w.whistled = FX.t; SFX9.whistle({ x: w.x, y: 2.2, z: w.z, pl: { x: PL.x, z: PL.z }, ref: 14, roll: 0.55 });
  if (!G9.whistleTip && physD9(w) < 95) { G9.whistleTip = true; later(1.4, () => toast('A WHISTLE · THE WATCH IS ON ITS ROUNDS', 2.6)); }
}
function watchBeat9(h) {   // the third terminal: odds are the Watch comes to walk round this house while you work
  if (!h || RNG() > [0.55, 0.75, 0.9][G.diff]) return null;
  let w = AI9.watch.filter(q => q.st !== 'chase' && q.st !== 'notice').sort((a, b) => a.d - b.d)[0] || null;
  if (!w && AI9.watch.length < 3) w = spawnWatch();
  if (!w) return null;
  const cx = (h.hx + HS / 2) * CELL, cz = (h.hz + HS / 2) * CELL, cells = [];
  for (const c of streetCells9()) if (Math.hypot(cellCenter(c % N) - cx, cellCenter((c / N) | 0) - cz) < 20) cells.push(c);   // the street in front of (and beside) the house
  w.beat = { x: cx, z: cz, until: FX.t + 80, cells, h }; if (w.st === 'patrol' || w.st === 'leave') { w.st = 'patrol'; w.wp = null; } w.callT = rnd(2, 4);
  later(5, () => { if (LVL === 9 && G.state === 'play') say('M.E.G. OUTPOST 9', `Nine. The Watch just turned onto ${shortSt9(h.street)}. Be quick in there.`, { radio: true }); });
  return w;
}
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { P9S, watchBeat9, watchWhistle9, readHale9, useSafe9, takeSpare9, readRota9, playAbara9, safeKnown9, tasks9, arrive9, flags9, rolePlan9, hudItems9, closeMap9, studyMap9, startTp9, LAB_X }));
