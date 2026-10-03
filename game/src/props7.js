// ---------- r10 · Level 7 furnishing: railings, ladders, buoys, the rig, the ship ----------
const SG7 = { bg: '#c9a227', fg: '#151515' }, SW7 = { bg: '#d8d2bc', fg: '#1d1d1d', line: '#555', emis: 0.25 }, SB7 = { bg: '#12304a', fg: '#e8f0f4', line: '#e8f0f4', emis: 0.4 };
function lp7(r, x, y, z) { const q = localPt(r, x, y, z); return [q.x, q.y, q.z]; }
function sol7(x, z, hx, hz, tag = 'prop') { addSolid(x - hx, z - hz, x + hx, z + hz, tag); }
function litPoint7(x, z, r, k = 'static', needs) { WS7.lights.push({ x, z, r, k, needs }); }
// every ladder: water spot, deck spot, the rails drawn at the deck edge (or at a pit's wall)
function addLadder7(id, name, wx, wz, dx, dz, dfh, o = {}) { const L = Object.assign({ id, name, wx, wz, dx, dz, dfh, wfh: 0 }, o); WS7.ladders.push(L); return L; }
function edgeLadder7(id, name, cx, cy, d, o = {}) { const [mx, mz] = edgeMid(cx, cy, d), fh = LV.fh[cIdx(cx, cy)]; const L = addLadder7(id, name, mx + DX[d] * 1.1, mz + DY[d] * 1.1, mx - DX[d] * 0.9, mz - DY[d] * 0.9, fh, Object.assign({ cx, cy, d, mx, mz }, o)); return L; }
function drawLadder7(B, L, rungs = 0) {
  if (L.cx === undefined) return; const d = L.d, fh = L.dfh, bot = L.low ?? -0.9, h = fh + 0.9 - bot, nx = DX[d], nz = DY[d], px = -nz, pz = nx;
  for (const s of [-1, 1]) B.pipe([L.mx + nx * 0.14 + px * 0.28 * s, fh + 0.95, L.mz + nz * 0.14 + pz * 0.28 * s], [L.mx + nx * 0.14 + px * 0.28 * s, bot, L.mz + nz * 0.14 + pz * 0.28 * s], 0.03, COL7.steel, 0, 6);
  for (let y = bot + 0.25; y < fh + 0.7; y += 0.32) B.pipe([L.mx + nx * 0.14 - px * 0.28, y, L.mz + nz * 0.14 - pz * 0.28], [L.mx + nx * 0.14 + px * 0.28, y, L.mz + nz * 0.14 + pz * 0.28], 0.018, COL7.steel, 0, 5);
}
function railings7(B) {
  const ladCells = new Set(WS7.ladders.filter(l => l.cx !== undefined).map(l => l.cx + ',' + l.cy + ',' + l.d));
  for (const r of [LV.dry.rig, LV.dry.ship, LV.dry.pier]) for (const c of r.cells) {
    if (LV.room[c] !== r.id) continue; const x = c % N, y = (c / N) | 0, fh = LV.fh[c];
    for (let d = 0; d < 4; d++) {
      const e = LV.ek.get(eKey(x, y, d)); if (!e || e.kind !== 'open') continue; const m = cIdx(x + DX[d], y + DY[d]), mr = LV.rooms[LV.room[m]]; if (!mr || mr.t === 'shipdeck' || mr.t === 'rigdeck' || mr.t === 'pier') continue;
      if (r.t === 'shipdeck' && (mr.t === 'hold1' || mr.t === 'hold2')) continue;
      if (ladCells.has(x + ',' + y + ',' + d)) continue;
      const [mx, mz] = edgeMid(x, y, d), horiz = d === 1 || d === 3, L = CELL / 2, ox = DX[d] * 0.1, oz = DY[d] * 0.1;
      const a = horiz ? [mx - L, mz + oz] : [mx + ox, mz - L], b = horiz ? [mx + L, mz + oz] : [mx + ox, mz + L];
      B.pipe([a[0], fh + 1.05, a[1]], [b[0], fh + 1.05, b[1]], 0.025, COL7.steel, 0, 5); B.pipe([a[0], fh + 0.55, a[1]], [b[0], fh + 0.55, b[1]], 0.02, COL7.steel, 0, 5);
      for (const t of [0, 0.5, 1]) B.pipe([a[0] + (b[0] - a[0]) * t, fh, a[1] + (b[1] - a[1]) * t], [a[0] + (b[0] - a[0]) * t, fh + 1.05, a[1] + (b[1] - a[1]) * t], 0.028, COL7.steel, 0, 5);
      if (horiz) addSolid(mx - L, mz + oz - 0.07, mx + L, mz + oz + 0.07, 'rail'); else addSolid(mx + ox - 0.07, mz - L, mx + ox + 0.07, mz + L, 'rail');
    }
  }
}
// a buoy: a barrel float, a mast, a lamp that comes on with the generator
function buoy7(B, x, z, id) {
  const r = pr37(x, z, 0, 0); WS7.buoys.push({ x, z, id, root: r, on: false });
  B.add(r, 'Cylinder', { diameter: 0.9, height: 0.7, tessellation: 14 }, COL7.red, 0, [0, 0.0, 0]); B.add(r, 'Cylinder', { diameter: 0.5, height: 0.5, tessellation: 12 }, COL7.white, 0, [0, 0.55, 0]); B.add(r, 'Box', { width: 0.06, height: 1.7, depth: 0.06 }, COL7.iron, 0, [0, 1.3, 0]);
  const mesh = mkMerged(WS7.propMat, Q => { Q('Sphere', { diameter: 0.28, segments: 8 }, [1, 0.8, 0.4], 0.9, [0, 0, 0]); }, 'buoylamp'); mesh.position.set(x, 2.15, z); mesh.setEnabled(false); WS7.buoys[WS7.buoys.length - 1].lamp = mesh; litPoint7(x, z, 15, 'buoy', 'gen');
}
function buildProps7() {
  const mat = actMat('props7', { spec: 0.4, shin: 26, wrinkle: 0.15, emis: 1, wrap: 0.35, mottle: 0.35 }), B = new PropBatch(mat); B.fast = true;
  W9.propMat = mat; WS7.propMat = mat; W37.propMat = mat;
  const on = actMat('lensOn7', { emis: 1 }), fl = actMat('lensFl7', { emis: 1 }), red = actMat('lensRed7', { emis: 1 }), grn = actMat('lensGrn7', { emis: 1 }); setEmi(on, 3.0); setEmi(red, 3.2, 0.5, 0.3); setEmi(grn, 0.6, 3.0, 0.8); WS7.lensFl = fl; WS7.lensRed = red; WS7.lensGrn = grn;
  const BOn = new PropBatch(on), BFl = new PropBatch(fl), BRed = new PropBatch(red), BGrn = new PropBatch(grn); for (const b of [BOn, BFl, BRed, BGrn]) b.fast = true;
  Object.assign(WS7, { B, BOn, BFl, BRed, BGrn }); WS7.pos = {};
  for (const b of LV.bulbs) {
    const r = pr37(b.x, b.z, 0, b.y), lb = b.state === 2 ? BFl : BOn;
    if (b.kind === 'flood') { B.add(r, 'Box', { width: 0.5, height: 0.35, depth: 0.4 }, COL7.iron, 0, [0, 0.2, 0]); lb.add(r, 'Box', { width: 0.4, height: 0.04, depth: 0.3 }, [1, 0.95, 0.8], 0.9, [0, 0.0, 0.0]); B.pipe([b.x, b.y + 0.35, b.z], [b.x, b.y + 3.2, b.z], 0.04, COL7.iron, 0, 5); continue; }
    lb.add(r, 'Sphere', { diameter: 0.13, segments: 6 }, [1, 0.9, 0.7], 0.9, [0, 0, 0]); for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.012, height: 0.2, depth: 0.012 }, COL7.iron, 0, [Math.sin(i * 1.57) * 0.08, -0.01, Math.cos(i * 1.57) * 0.08]); B.add(r, 'Cylinder', { diameter: 0.12, height: 0.07, tessellation: 8 }, COL7.iron, 0, [0, 0.1, 0]);
  }
  furnishRig7(B); furnishShip7(B); furnishCape7(B); furnishPier7(B); furnishHab7(B); furnishWreck7(B); furnishSea7(B);
  railings7(B); for (const L of WS7.ladders) drawLadder7(B, L);
  WS7.finishProps = () => {
    const keep = [], out = [...(B.finish('props7', keep) || []), ...(BOn.finish('lensOn7', keep) || []), ...(BFl.finish('lensFl7', keep) || []), ...(BRed.finish('lensRed7', keep) || []), ...(BGrn.finish('lensGrn7', keep) || [])];
    out.forEach(m => m._sortD = 300); new Set(keep).forEach(r => r && r.dispose && r.dispose());
  };
}
function table7(B, r, w = 1.4, d = 0.7, h = 0.76, col = COL7.wood2) { B.add(r, 'Box', { width: w, height: 0.05, depth: d }, col, 0, [0, h, d / 2]); for (const sx of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: h, depth: d - 0.1 }, COL7.wood, 0, [sx * (w / 2 - 0.05), h / 2, d / 2]); }
function crate7(B, x, z, ry = 0, s = 1, y = 0) { const r = pr37(x, z, ry, y); if (!B.mdl('crate', r, [0, 0, 0], [0, 0, 0], 0.85 * s)) B.add(r, 'Box', { width: 0.7 * s, height: 0.6 * s, depth: 0.6 * s }, COL7.wood, 0, [0, 0.3 * s, 0]); sol7(x, z, 0.4 * s, 0.4 * s); }
function barrel7(B, x, z, col, y = 0) { const r = pr37(x, z, rnd(0, 6), y); if (!B.mdl('barrel', r, [0, 0, 0], [0, 0, 0], 0.95)) B.add(r, 'Cylinder', { diameter: 0.58, height: 0.88, tessellation: 14 }, col || pick([COL7.blue, COL7.rust, COL7.olive]), 0, [0, 0.44, 0]); sol7(x, z, 0.32, 0.32); }
function container7(B, x, z, ry, col, y = 3.0) {
  const r = pr37(x, z, ry, y); B.add(r, 'Box', { width: 2.4, height: 2.5, depth: 6.0 }, col, 0, [0, 1.3, 0]); for (let i = -9; i <= 9; i++) B.add(r, 'Box', { width: 0.04, height: 2.4, depth: 0.06 }, col.map(v => v * 0.8), 0, [1.22, 1.3, i * 0.3]), B.add(r, 'Box', { width: 0.04, height: 2.4, depth: 0.06 }, col.map(v => v * 0.8), 0, [-1.22, 1.3, i * 0.3]);
  B.add(r, 'Box', { width: 2.2, height: 0.04, depth: 0.04 }, COL7.black, 0, [0, 2.2, 3.01]); sol7(x, z, Math.abs(Math.cos(ry)) * 1.25 + Math.abs(Math.sin(ry)) * 3.05, Math.abs(Math.sin(ry)) * 1.25 + Math.abs(Math.cos(ry)) * 3.05);
}
function lifeboat7(B, x, z, ry, y) { const r = pr37(x, z, ry, y); B.add(r, 'Capsule', { height: 4.6, radius: 0.95, tessellation: 12 }, COL7.orange, 0, [0, 1.3, 0], [Math.PI / 2, 0, 0], [1, 1, 0.8]); B.add(r, 'Box', { width: 1.6, height: 0.08, depth: 3.4 }, COL7.white, 0, [0, 1.95, 0]); for (const s of [-1, 1]) B.pipe(lp7(r, s * 0.9, 0.3, 1.5), lp7(r, s * 1.3, 3.5, 1.5), 0.05, COL7.iron, 0, 6); sol7(x, z, 1.2, 2.5); }
// ================= the rig: Meridian =================
function furnishRig7(B) {
  const P = WS7.pos;
  P.raft = { x: cc7(30), z: cc7(39) };
  { const r = pr37(P.raft.x - 2.4, P.raft.z + 0.8, 0.4, 0); B.add(r, 'Torus', { diameter: 1.7, thickness: 0.32, tessellation: 18 }, COL7.orange, 0, [0, 0.1, 0]); B.add(r, 'Box', { width: 1.2, height: 0.05, depth: 1.2 }, [0.25, 0.25, 0.22], 0, [0, 0.05, 0]); }
  edgeLadder7('rN', 'THE RIG', 30, 24, 3); edgeLadder7('rS', 'THE RIG', 30, 36, 1); edgeLadder7('rW', 'THE RIG', 25, 30, 2); edgeLadder7('rE', 'THE RIG', 37, 30, 0);
  for (const L of WS7.ladders) if (L.id[0] === 'r') { L.low = -1.6; }
  // the derrick: four legs, braces, a crown block, a drill pipe down through the deck
  { const cx = cc7(31), cz = cc7(30), r = pr37(cx, cz, 0, 3.0), H = 30, s0 = 2.7, s1 = 0.9;
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B.pipe(lp7(r, sx * s0, 0, sz * s0), lp7(r, sx * s1, H, sz * s1), 0.14, COL7.orange, 0, 8);
    for (let k = 1; k <= 7; k++) { const h = k * 4, s = lerp(s0, s1, h / H); for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) B.pipe(lp7(r, a[0] * s, h, a[1] * s), lp7(r, b[0] * s, h, b[1] * s), 0.06, COL7.orange, 0, 6); const h2 = h - 4, s2 = lerp(s0, s1, Math.max(0, h2) / H); B.pipe(lp7(r, -s2, h2, -s2), lp7(r, s, h, -s), 0.04, COL7.orange, 0, 5); B.pipe(lp7(r, s2, h2, s2), lp7(r, -s, h, s), 0.04, COL7.orange, 0, 5); }
    B.add(r, 'Box', { width: 2.2, height: 1.2, depth: 2.2 }, COL7.iron, 0, [0, H + 0.4, 0]); BRed_(B).add(r, 'Sphere', { diameter: 0.35, segments: 6 }, [1, 0.2, 0.1], 0.9, [0, H + 1.2, 0]);
    B.pipe(lp7(r, 0, 0.1, 0), lp7(r, 0, H - 4, 0), 0.22, COL7.grey, 0, 10); B.add(r, 'Cylinder', { diameter: 1.4, height: 0.2, tessellation: 18 }, COL7.iron, 0, [0, 0.1, 0]); B.add(r, 'Box', { width: 5.6, height: 0.1, depth: 5.6 }, COL7.black, 0, [0, 0.05, 0]);
    sol7(cx, cz, 2.9, 2.9); P.derrick = { x: cx, z: cz }; litPoint7(cx, cz, 34, 'deck'); }
  // the helipad
  { const r = pr37(cc7(35) + 0.9, cc7(31), 0, 3.02); B.add(r, 'Cylinder', { diameter: 8.2, height: 0.03, tessellation: 28 }, [0.16, 0.2, 0.18], 0, [0, 0.01, 0]); B.add(r, 'Torus', { diameter: 7.6, thickness: 0.12, tessellation: 28 }, COL7.white, 0, [0, 0.03, 0], [Math.PI / 2, 0, 0]);
    for (const [w, d, x, z] of [[0.3, 2.2, -0.8, 0], [0.3, 2.2, 0.8, 0], [1.9, 0.3, 0, 0]]) B.add(r, 'Box', { width: w, height: 0.03, depth: d }, COL7.white, 0, [x, 0.04, z]); P.helipad = { x: r.position.x, z: r.position.z }; }
  // containers in the west strip, a crane in the south-west
  container7(B, cc7(26) - 0.2, cc7(29) + 0.5, 0, [0.5, 0.14, 0.1]); container7(B, cc7(26) - 0.2, cc7(32) - 0.2, 0, [0.16, 0.3, 0.4]); container7(B, cc7(26) - 0.2, cc7(32) - 0.2, 0, [0.7, 0.55, 0.1], 5.55);
  { const x = cc7(27) + 0.9, z = cc7(34), r = pr37(x, z, 0, 3.0); B.add(r, 'Cylinder', { diameter: 0.9, height: 0.5, tessellation: 12 }, COL7.iron, 0, [0, 0.25, 0]); B.pipe(lp7(r, 0, 0.4, 0), lp7(r, 0, 9, 0), 0.22, COL7.yellow, 0, 10); B.pipe(lp7(r, 0, 9, 0), lp7(r, -9, 11.5, -4), 0.14, COL7.yellow, 0, 8); B.pipe(lp7(r, 0, 9, 0), lp7(r, 1.6, 8.2, 3), 0.1, COL7.iron, 0, 6); B.pipe(lp7(r, -8, 11.4, -3.6), lp7(r, -8, 4, -3.6), 0.016, COL7.black, 0, 4); B.add(r, 'Box', { width: 0.6, height: 0.5, depth: 0.4 }, COL7.red, 0, [-8, 3.8, -3.6]); sol7(x, z, 0.5, 0.5); }
  lifeboat7(B, cc7(24) + 2.3, cc7(33), Math.PI / 2, 3.8); lifeboat7(B, cc7(38) - 1.1, cc7(26), -Math.PI / 2, 3.0);
  for (const [x, z] of [[cc7(34), cc7(28) + 0.6], [cc7(34) + 1, cc7(33) - 0.8], [cc7(29) + 0.4, cc7(36) - 0.5]]) barrel7(B, x, z, null, 3.0);
  crate7(B, cc7(33) + 0.2, cc7(28) + 1.0, 0.3, 1, 3.0); crate7(B, cc7(33) + 0.9, cc7(28) + 0.6, 0.1, 0.8, 3.0);
  { const r = wallAt37(36, 33, 0, 0); r.position.y = 3.0; F37.ring(B, r, COL37.red); P.ringRig = lp7(r, 0, 1.2, 0.8); }
  sign37('MERIDIAN\nWELL 7 · DEEPWATER', twin37(wallAt37(29, 24, 3, 0)), [0, 2.4, 0.03], 2.2, 0.62, SG7); WS7.signs = 1;
  // quarters: a mess, the radio shack, bunks
  { const r = wallAt37(25, 24, 3, 0.9); r.position.y = 3.0; table7(B, r, 1.6, 0.75); const t2 = wallAt37(26, 25, 1, -0.3); t2.position.y = 3.0; F37.bench(B, t2, { len: 1.6 }); solidLocal(r, -0.9, 0, 0.9, 0.9); P.messBoard = lp7(wallAt37(25, 25, 2, 0), 0, 1.5, 0.9); }
  { const r = wallAt37(25, 25, 2, 0); r.position.y = 3.0; B.add(r, 'Box', { width: 1.1, height: 0.8, depth: 0.04 }, [0.45, 0.34, 0.2], 0, [0, 1.6, 0.02]); for (let i = 0; i < 6; i++) B.add(r, 'Box', { width: 0.16, height: 0.2, depth: 0.004 }, pick([COL7.white, COL7.cream]), 0, [-0.4 + (i % 3) * 0.28, 1.8 - Math.floor(i / 3) * 0.3, 0.04]); P.messBoard = lp7(r, 0, 1.5, 0.9); }
  { const r = wallAt37(28, 24, 3, 0); r.position.y = 3.0; B.add(r, 'Box', { width: 2.3, height: 0.05, depth: 0.8 }, COL7.wood2, 0, [0, 0.76, 0.42]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: 0.74, depth: 0.74 }, COL7.wood, 0, [s * 1.1, 0.37, 0.42]); solidLocal(r, -1.2, 0, 1.2, 0.9);
    B.add(r, 'Box', { width: 0.7, height: 0.42, depth: 0.4 }, COL7.olive, 0, [-0.4, 1.0, 0.3]); for (const x of [-0.6, -0.4, -0.2]) BRed_(B).add(r, 'Cylinder', { diameter: 0.08, height: 0.03, tessellation: 8 }, [1, 0.3, 0.2], 0.8, [x, 1.0, 0.52], [Math.PI / 2, 0, 0]); B.add(r, 'Cylinder', { diameter: 0.03, height: 1.1, tessellation: 5 }, COL7.black, 0, [-0.7, 1.4, 0.2]);
    B.add(r, 'Box', { width: 0.34, height: 0.05, depth: 0.26 }, [0.88, 0.86, 0.76], 0, [0.4, 0.79, 0.4], [0, 0.2, 0]); P.kellLog = lp7(r, 0.4, 0.8, 1.1); P.radioSet = lp7(r, -0.4, 1.0, 1.1); }
  { const r = wallAt37(27, 24, 3, -0.9); r.position.y = 3.0; B.add(r, 'Box', { width: 0.04, height: 0.04, depth: 0.04 }, COL7.white, 0, [0, 0, 0]); }
  { const r = wallAt37(28, 25, 0, 0); r.position.y = 3.0; B.add(r, 'Box', { width: 0.9, height: 1.2, depth: 0.04 }, [0.88, 0.86, 0.78], 0, [0, 1.5, 0.02]); for (let j = 0; j < 8; j++) B.add(r, 'Box', { width: 0.7, height: 0.01, depth: 0.005 }, [0.15, 0.15, 0.2], 0, [0, 2.0 - j * 0.12, 0.04]); sign37('TIDES · MERIDIAN', twin37(r), [0, 2.18, 0.03], 0.8, 0.14, SW7); P.tide = lp7(r, 0, 1.5, 0.9); }
  P.kell = { x: cc7(28) - 0.2, z: cc7(24) + 1.5, yaw: Math.PI };
  { const r = wallAt37(25, 27, 2, 0); r.position.y = 3.0; FURN.bunk.fn(B, r); solidLocal(r, -1.0, 0, 1.0, 0.95); P.bunkNote = lp7(r, 0, 1.0, 1.1); const r2 = wallAt37(28, 27, 0, 0); r2.position.y = 3.0; FURN.bunk.fn(B, r2); solidLocal(r2, -1.0, 0, 1.0, 0.95); const r3 = wallAt37(26, 27, 1, 0); r3.position.y = 3.0; F37.locker(B, r3, { n: 3 }); solidLocal(r3, -0.65, 0, 0.65, 0.5); }
  // the generator house: a diesel set, a control panel with a start handle, drums
  { const r = wallAt37(35, 24, 3, 0); r.position.y = 3.0; B.add(r, 'Box', { width: 2.6, height: 1.3, depth: 1.2 }, COL7.green, 0, [0, 0.65, 0.7]); B.add(r, 'Cylinder', { diameter: 0.9, height: 0.5, tessellation: 18 }, COL7.iron, 0, [-1.6, 0.9, 0.7], [0, 0, Math.PI / 2]); for (let i = 0; i < 4; i++) B.add(r, 'Cylinder', { diameter: 0.2, height: 0.7, tessellation: 8 }, COL7.steel, 0, [-0.9 + i * 0.6, 1.6, 0.7]); B.pipe(lp7(r, 0.6, 1.6, 0.7), lp7(r, 0.6, 4.6, 0.7), 0.16, COL7.iron, 0, 8); solidLocal(r, -2.6, 0, 1.4, 1.5); }
  { const r = wallAt37(37, 25, 0, 0); r.position.y = 3.0; B.add(r, 'Box', { width: 1.5, height: 1.8, depth: 0.3 }, [0.3, 0.33, 0.3], 0, [0, 0.9, 0.15]); for (let i = 0; i < 4; i++) F37.gauge ? 0 : 0; for (let i = 0; i < 3; i++) B.add(r, 'Cylinder', { diameter: 0.18, height: 0.03, tessellation: 12 }, COL7.brass, 0, [-0.4 + i * 0.4, 1.5, 0.32], [Math.PI / 2, 0, 0]); B.add(r, 'Box', { width: 0.12, height: 0.5, depth: 0.1 }, COL7.red, 0, [0.4, 0.9, 0.38], [0.5, 0, 0]); sol7(r.position.x, r.position.z, 0.9, 0.5); P.gen = lp7(r, 0, 1.0, 1.1); sign37('GENERATOR · SET 1\nSTART · PRIME', twin37(r), [0, 2.0, 0.03], 1.2, 0.3, SG7); }
  for (const [x, z] of [[cc7(34) + 0.4, cc7(26) - 1.0], [cc7(36) - 0.3, cc7(26) - 0.6]]) barrel7(B, x, z, COL7.blue, 3.0);
  // the air house: a compressor, a bank of bottles, a big red valve wheel
  { const r = wallAt37(35, 36, 1, 0); r.position.y = 3.0; B.add(r, 'Cylinder', { diameter: 1.0, height: 3.0, tessellation: 18 }, COL7.blue, 0, [0, 0.5, 0.8], [0, 0, Math.PI / 2]); B.add(r, 'Box', { width: 3.2, height: 0.3, depth: 0.9 }, COL7.iron, 0, [0, 0.15, 0.8]); for (let i = 0; i < 5; i++) B.add(r, 'Cylinder', { diameter: 0.26, height: 1.5, tessellation: 10 }, COL7.green, 0, [-1.2 + i * 0.6, 0.75, 0.3]); solidLocal(r, -1.7, 0, 1.7, 1.3); }
  { const r = wallAt37(36, 35, 0, 0); r.position.y = 3.0; B.add(r, 'Box', { width: 1.2, height: 1.2, depth: 0.3 }, COL7.iron, 0, [0, 1.2, 0.15]); B.add(r, 'Torus', { diameter: 0.6, thickness: 0.06, tessellation: 20 }, COL7.red, 0, [0, 1.25, 0.4], [Math.PI / 2, 0, 0]); for (let j = 0; j < 3; j++) B.add(r, 'Box', { width: 0.58, height: 0.04, depth: 0.04 }, COL7.red, 0, [0, 1.25, 0.4], [0, 0, j * Math.PI / 3]); B.pipe(lp7(r, 0.5, 0.6, 0.15), lp7(r, 1.4, -4, 0.15), 0.08, COL7.black, 0, 6); P.airValve = lp7(r, 0, 1.25, 1.2); sign37('AIR · HABITAT 2', twin37(r), [0, 2.0, 0.03], 1.0, 0.25, SG7); }
  // the rig's flare locker on the helipad edge
  { const r = pr37(cc7(36) - 0.4, cc7(32) + 1.0, 0.3, 3.0); B.add(r, 'Box', { width: 0.8, height: 0.6, depth: 0.5 }, COL7.red, 0, [0, 0.3, 0]); B.add(r, 'Box', { width: 0.7, height: 0.02, depth: 0.02 }, COL7.black, 0, [0, 0.45, 0.26]); sol7(r.position.x, r.position.z, 0.45, 0.35); P.flareRig = { x: r.position.x, z: r.position.z + 0.6, y: 3.4 }; }
  litPoint7(cc7(31), cc7(30), 38, 'deck'); litPoint7(cc7(28), cc7(28), 26, 'deck'); litPoint7(cc7(34), cc7(33), 26, 'deck');
}
function BRed_(B) { return WS7.BRed; }
// ================= the Aurelia =================
function furnishShip7(B) {
  const P = WS7.pos, FH = 2.4;
  edgeLadder7('sP', 'THE AURELIA', 13, 38, 3); edgeLadder7('sS', 'THE AURELIA', 13, 42, 1); edgeLadder7('sB', 'THE AURELIA', 9, 40, 2);
  for (const L of WS7.ladders) if (L.id[0] === 's') L.low = -1.2;
  edgeLadder7('h1', 'THE FIRST HOLD', 11, 38, 1, { pit: true, low: -3.5 }); edgeLadder7('h2', 'THE SECOND HOLD', 15, 38, 1, { pit: true, low: -3.5 });
  for (const L of WS7.ladders) if (L.id === 'h1' || L.id === 'h2') { L.wx = L.mx; L.wz = L.mz + 1.6; L.dx = L.mx; L.dz = L.mz - 0.9; L.pitDeck = true; }
  // engine ladder and the bridge ladder
  { const r = wallAt37(19, 44, 0, 0); r.position.y = -5; for (const s of [-1, 1]) B.pipe(lp7(r, s * 0.28, 6.4, 0.2), lp7(r, s * 0.28, 0.3, 0.2), 0.03, COL7.steel, 0, 6); for (let y = 0.6; y < 6.3; y += 0.32) B.pipe(lp7(r, -0.28, y, 0.2), lp7(r, 0.28, y, 0.2), 0.018, COL7.steel, 0, 5); addLadder7('eng', 'THE ENGINE ROOM LADDER', lp7(r, 0, 0, 1.0)[0], lp7(r, 0, 0, 1.0)[2], cc7(17), cc7(41) + 1.0, 2.4, { engine: true }); }
  { const r = wallAt37(18, 38, 3, 0); r.position.y = FH; B.add(r, 'Box', { width: 0.04, height: 0.04, depth: 0.04 }, COL7.white, 0, [0, 0, 0]); addLadder7('br', 'THE BRIDGE', cc7(17), cc7(38) + 0.7, cc7(2), cc7(60), 9.0, { pocket: true, dfhTo: 9.0 }); for (const s of [-1, 1]) B.pipe([cc7(17) + 0.5, FH + 0.9, cc7(38) - 0.2 + s * 0.28], [cc7(17) + 0.5, FH + 8, cc7(38) - 0.2 + s * 0.28], 0.03, COL7.steel, 0, 6); }
  // the funnel and the superstructure's roof detail, masts, a crane over the holds, hatch covers, winches, vents
  { const cx = cc7(19), cz = cc7(40), r = pr37(cx, cz, 0, FH + 3.0); B.add(r, 'Cylinder', { diameterTop: 1.8, diameterBottom: 2.6, height: 5, tessellation: 18 }, COL7.red, 0, [0, 2.5, 0]); B.add(r, 'Cylinder', { diameter: 1.9, height: 0.8, tessellation: 18 }, COL7.black, 0, [0, 5.4, 0]); B.add(r, 'Box', { width: 4.6, height: 0.2, depth: 5.6 }, COL7.iron, 0, [0, -0.05, 0]); }
  { const r = pr37(cc7(10), cc7(40), 0, FH); B.pipe(lp7(r, 0, 0, 0), lp7(r, 0, 9, 0), 0.13, COL7.white, 0, 8); B.pipe(lp7(r, -1.2, 7, 0), lp7(r, 1.2, 7, 0), 0.06, COL7.white, 0, 6); B.pipe(lp7(r, 0, 9, 0), lp7(r, 0, 3, 3.5), 0.012, COL7.black, 0, 4); B.pipe(lp7(r, 0, 9, 0), lp7(r, 0, 3, -3.5), 0.012, COL7.black, 0, 4); sol7(r.position.x, r.position.z, 0.3, 0.3); }
  for (const x of [13]) { const r = pr37(cc7(x), cc7(40), 0, FH); B.pipe(lp7(r, 0, 0, -1.2), lp7(r, 0, 7, -1.2), 0.2, COL7.yellow, 0, 10); B.pipe(lp7(r, 0, 7, -1.2), lp7(r, 0, 9, 3.4), 0.12, COL7.yellow, 0, 8); B.pipe(lp7(r, 0, 9, 3.4), lp7(r, 0, 5.6, 3.4), 0.016, COL7.black, 0, 4); sol7(r.position.x, r.position.z - 1.2, 0.4, 0.4); }
  for (const [x, z] of [[cc7(12) + 1.6, cc7(38) + 0.3], [cc7(16) + 1.7, cc7(42) + 0.6], [cc7(9) + 0.6, cc7(38) + 0.8], [cc7(9) + 0.6, cc7(42) + 0.8]]) { const r = pr37(x, z, 0, FH); B.add(r, 'Cylinder', { diameterTop: 0.2, diameterBottom: 0.5, height: 1.1, tessellation: 12 }, COL7.red, 0, [0, 0.55, 0]); B.add(r, 'Cylinder', { diameter: 0.55, height: 0.1, tessellation: 12 }, COL7.red, 0, [0, 1.1, 0]); sol7(x, z, 0.3, 0.3); }
  for (const [x, z, ry] of [[cc7(13) + 0.3, cc7(39) + 0.9, 0.2], [cc7(12) + 0.2, cc7(42) - 0.4, 1.4]]) crate7(B, x, z, ry, 1, FH);
  for (const [x, z] of [[cc7(17) + 0.3, cc7(42) - 0.4], [cc7(9) + 0.4, cc7(39) + 0.6], [cc7(18), cc7(43) - 0.2]]) barrel7(B, x, z, null, FH);
  // coamings round the open holds
  for (const [x0, z0, x1, z1] of [[cc7(10) - CELL / 2, cc7(39) - CELL / 2, cc7(12) + CELL / 2, cc7(41) + CELL / 2], [cc7(14) - CELL / 2, cc7(39) - CELL / 2, cc7(16) + CELL / 2, cc7(41) + CELL / 2]]) for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) B.pipe([a[0], FH + 0.3, a[1]], [b[0], FH + 0.3, b[1]], 0.07, COL7.yellow, 0, 5);
  // inside the holds: crates on the floor and a few spilled things
  for (const [x, z, s] of [[cc7(10) + 0.5, cc7(40) + 0.4, 1], [cc7(11), cc7(41) - 0.3, 0.8], [cc7(15) - 0.4, cc7(40), 1.1], [cc7(16) - 0.5, cc7(41) - 0.5, 0.9]]) { const r = pr37(x, z, rnd(0, 3), -6); B.add(r, 'Box', { width: 0.8 * s, height: 0.7 * s, depth: 0.7 * s }, COL7.wood, 0, [0, 0.35 * s, 0]); }
  // the galley: a long table, a stove, the cook's notice; the cabins: bunks, the mate's log
  { const r = wallAt37(18, 38, 3, 0.9); r.position.y = FH; table7(B, r, 1.8, 0.8); solidLocal(r, -1.0, 0, 1.0, 0.9); const q = wallAt37(19, 39, 0, 0); q.position.y = FH; B.add(q, 'Box', { width: 1.1, height: 0.9, depth: 0.7 }, COL7.iron, 0, [0, 0.45, 0.4]); for (let i = 0; i < 4; i++) B.add(q, 'Cylinder', { diameter: 0.22, height: 0.03, tessellation: 10 }, COL7.black, 0, [-0.3 + (i % 2) * 0.5, 0.92, 0.25 + Math.floor(i / 2) * 0.35]); solidLocal(q, -0.6, 0, 0.6, 0.8); P.stove = lp7(q, 0, 0.9, 1.0); }
  { const r = wallAt37(18, 40, 2, 0); r.position.y = FH; B.add(r, 'Box', { width: 0.7, height: 0.9, depth: 0.04 }, [0.88, 0.86, 0.76], 0, [0, 1.5, 0.02]); for (let j = 0; j < 6; j++) B.add(r, 'Box', { width: 0.5, height: 0.01, depth: 0.005 }, [0.2, 0.2, 0.25], 0, [0, 1.8 - j * 0.12, 0.04]); P.cook = lp7(r, 0, 1.5, 0.9); }
  { const r = wallAt37(18, 42, 2, 0); r.position.y = FH; FURN.bunk.fn(B, r); solidLocal(r, -1.0, 0, 1.0, 0.95); const q = wallAt37(19, 41, 3, 0.4); q.position.y = FH; table7(B, q, 1.0, 0.6); solidLocal(q, -0.6, 0, 0.6, 0.7); B.add(q, 'Box', { width: 0.34, height: 0.05, depth: 0.26 }, [0.84, 0.82, 0.7], 0, [0.1, 0.79, 0.3], [0, 0.3, 0]); P.mateLog = lp7(q, 0.1, 0.8, 1.0); }
  // the engine room: two cylinder blocks, a fuel tank with a pump handle
  { const r = wallAt37(18, 44, 2, 0); r.position.y = -5; B.add(r, 'Box', { width: 2.4, height: 2.6, depth: 1.4 }, COL7.iron, 0, [0, 1.3, 0.8]); for (let i = 0; i < 6; i++) B.add(r, 'Cylinder', { diameter: 0.3, height: 0.8, tessellation: 10 }, COL7.steel, 0, [-0.9 + i * 0.36, 3.0, 0.8]); solidLocal(r, -1.3, 0, 1.3, 1.6); const q = wallAt37(20, 44, 0, 0); q.position.y = -5; B.add(q, 'Cylinder', { diameter: 1.5, height: 2.0, tessellation: 18 }, COL7.yellow, 0, [0, 0.9, 0.9], [0, 0, Math.PI / 2]); B.add(q, 'Box', { width: 0.1, height: 0.6, depth: 0.1 }, COL7.red, 0, [0.3, 2.1, 1.4], [0.4, 0, 0]); P.fuelValve = lp7(q, 0.3, 0.9, 1.5); sol7(q.position.x, q.position.z, 0.2, 0.2); }
  P.jerrycan = { x: cc7(14) + 1.6, z: cc7(38) + 0.8, y: FH + 0.4 };
  P.flareShip = { x: cc7(12) - 0.3, z: cc7(42) + 0.9, y: FH + 0.4 };
  P.lifebuoy = null; litPoint7(cc7(10), cc7(40), 30, 'deck'); litPoint7(cc7(18), cc7(40), 24, 'deck');
  // the bridge room (up the ladder): a wheel, a chart table, the captain's chair and log
  { const r = wallAt37(2, 58, 3, 0); r.position.y = 9.0; B.add(r, 'Box', { width: 4, height: 1.0, depth: 0.5 }, COL7.iron, 0, [0, 0.5, 0.4]); B.add(r, 'Torus', { diameter: 0.9, thickness: 0.07, tessellation: 20 }, COL7.wood2, 0, [0, 1.3, 0.8], [Math.PI / 2 - 0.3, 0, 0]); solidLocal(r, -2.2, 0, 2.2, 0.8);
    const t = wallAt37(0, 60, 2, 0); t.position.y = 9.0; table7(B, t, 1.8, 1.0); solidLocal(t, -1.0, 0, 1.0, 1.0); B.add(t, 'Box', { width: 0.34, height: 0.05, depth: 0.26 }, [0.84, 0.82, 0.7], 0, [0.2, 0.79, 0.5], [0, 0.2, 0]); P.capLog = lp7(t, 0.2, 0.8, 1.2);
    const b = wallAt37(4, 62, 0, 0); b.position.y = 9.0; B.add(b, 'Cylinder', { diameter: 0.34, height: 0.3, tessellation: 12 }, COL7.brass, 0, [0, 1.3, 0.3], [0, 0, 0]); B.add(b, 'Box', { width: 0.04, height: 0.9, depth: 0.04 }, COL7.iron, 0, [0, 0.9, 0.3]); P.shipBell = lp7(b, 0, 1.3, 1.0); }
  P.bridgeIn = { x: cc7(2), z: cc7(60) }; P.eng = { x: cc7(19), z: cc7(44) };
}
