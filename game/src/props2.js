// ---------- r9 · Level 2 furnishing: bulbs, pipes, boilers, the office, the camp, the switchyard, the long pipe, the lift ----------
const F2 = {
  phone(B, r) {   // a pipe phone: a cast box, a handset on a hook, a bell on top
    B.add(r, 'Box', { width: 0.32, height: 0.46, depth: 0.16 }, COL2.olive, 0, [0, 1.35, 0.08]); B.add(r, 'Box', { width: 0.08, height: 0.32, depth: 0.08 }, COL2.black, 0, [0.2, 1.38, 0.13]);
    B.add(r, 'Cylinder', { diameter: 0.14, height: 0.05, tessellation: 12 }, COL2.brass, 0, [0, 1.65, 0.1], [Math.PI / 2, 0, 0]); B.add(r, 'Box', { width: 0.2, height: 0.05, depth: 0.012 }, COL2.white, 0.1, [0, 1.48, 0.165]);
    B.pipe(localArr(r, 0, 1.12, 0.08), localArr(r, 0, 0.2, 0.08), 0.02, COL2.black, 0, 6); return 0.2;
  },
  gauge(B, r, y = 1.3) { B.add(r, 'Cylinder', { diameter: 0.26, height: 0.06, tessellation: 16 }, COL2.brass, 0, [0, y, 0.05], [Math.PI / 2, 0, 0]); B.add(r, 'Cylinder', { diameter: 0.22, height: 0.01, tessellation: 16 }, [0.88, 0.86, 0.78], 0.05, [0, y, 0.081], [Math.PI / 2, 0, 0]);
    B.add(r, 'Box', { width: 0.012, height: 0.09, depth: 0.008 }, COL2.red, 0, [0.02, y + 0.02, 0.088], [0, 0, rnd(-1.4, 1.4)]); },
  wheel(B, r, y = 1.3, col = COL2.red, z = 0.32) { B.add(r, 'Torus', { diameter: 0.56, thickness: 0.05, tessellation: 20 }, col, 0, [0, y, z], [Math.PI / 2, 0, 0]); for (let j = 0; j < 3; j++) B.add(r, 'Box', { width: 0.54, height: 0.035, depth: 0.035 }, col, 0, [0, y, z], [0, 0, j * Math.PI / 3]); B.add(r, 'Cylinder', { diameter: 0.08, height: 0.34, tessellation: 8 }, COL2.iron, 0, [0, y, z / 2], [Math.PI / 2, 0, 0]); },
  manifold(B, r) {   // a regulator manifold: two fat pipes into a valve body against the wall
    B.add(r, 'Box', { width: 1.6, height: 1.5, depth: 0.5 }, COL2.iron, 0, [0, 1.0, 0.25]); B.add(r, 'Cylinder', { diameter: 0.7, height: 0.8, tessellation: 16 }, COL2.rust, 0, [0, 1.25, 0.55], [Math.PI / 2, 0, 0]);
    for (const s of [-1, 1]) { B.add(r, 'Cylinder', { diameter: 0.36, height: 1.4, tessellation: 12 }, COL2.grey, 0, [s * 0.95, 1.25, 0.35], [0, 0, Math.PI / 2]); B.add(r, 'Cylinder', { diameter: 0.46, height: 0.08, tessellation: 12 }, COL2.iron, 0, [s * 0.7, 1.25, 0.35], [0, 0, Math.PI / 2]); }
    F2.gauge(B, r, 1.95); return 0.9;
  },
  cabinet(B, r, lit) { B.add(r, 'Box', { width: 1.1, height: 2.1, depth: 0.55 }, [0.3, 0.33, 0.3], 0, [0, 1.05, 0.28]); B.add(r, 'Box', { width: 1.0, height: 0.02, depth: 0.01 }, COL2.black, 0, [0, 1.6, 0.56]); B.add(r, 'Box', { width: 0.02, height: 1.9, depth: 0.01 }, COL2.black, 0, [0, 1.05, 0.56]);
    for (let i = 0; i < 3; i++) (lit && i === 0 ? WP2.BRed : lit ? WP2.BGrn : B).add(r, 'Box', { width: 0.05, height: 0.05, depth: 0.02 }, lit ? [1, 0.3, 0.2] : COL2.black, lit ? 0.9 : 0, [-0.3 + i * 0.12, 1.85, 0.56]);
    B.add(r, 'Box', { width: 0.24, height: 0.08, depth: 0.012 }, COL2.white, 0.05, [0.2, 1.85, 0.56]); return 0.6; },
  crate(B, r, x = 0, z = 0.4, s = 1) { if (!B.mdl('crate', r, [x, 0, z], [0, rnd(-0.3, 0.3), 0], 0.85 * s)) { B.add(r, 'Box', { width: 0.7 * s, height: 0.6 * s, depth: 0.6 * s }, COL2.wood, 0, [x, 0.3 * s, z]); } },
  barrel(B, r, x = 0, z = 0.4) { if (!B.mdl('barrel', r, [x, 0, z], [0, rnd(0, 6), 0], 0.95)) B.add(r, 'Cylinder', { diameter: 0.58, height: 0.88, tessellation: 14 }, pick([COL2.blue, COL2.rust, COL2.olive]), 0, [x, 0.44, z]); },
};
function localArr(r, x, y, z) { const q = localPt(r, x, y, z); return [q.x, q.y, q.z]; }
function solidAround2(x, z, hx, hz) { addSolid(x - hx, z - hz, x + hx, z + hz, 'prop'); }

function buildProps2() {
  const mat = actMat('props2', { spec: 0.4, shin: 26, wrinkle: 0.15, emis: 1, wrap: 0.35, mottle: 0.35 }), B = new PropBatch(mat); B.fast = true;
  W9.propMat = mat; WP2.propMat = mat;
  const on = actMat('lensOn2', { emis: 1 }), fl = actMat('lensFl2', { emis: 1 }), red = actMat('lensRed2', { emis: 1 }), grn = actMat('lensGrn2', { emis: 1 }); setEmi(on, 3.0); setEmi(red, 3.2, 0.5, 0.3); setEmi(grn, 0.6, 3.0, 0.8); WP2.lensFl = fl; WP2.red = red; WP2.grn = grn;
  const BOn = new PropBatch(on), BFl = new PropBatch(fl), BRed = new PropBatch(red), BGrn = new PropBatch(grn); for (const b of [BOn, BFl, BRed, BGrn]) b.fast = true;
  Object.assign(WP2, { B, BOn, BFl, BRed, BGrn });
  WP2.pos = {};
  // ----- bulbs -----
  for (const b of LV.bulbs) {
    const r = pr2(b.x, b.z, 0, b.y), lb = b.kind === 'red' ? BRed : b.kind === 'green' ? BGrn : b.state === 2 ? BFl : BOn;
    if (b.kind === 'high') { B.add(r, 'Cylinder', { diameterTop: 0.3, diameterBottom: 0.9, height: 0.35, tessellation: 14 }, COL2.iron, 0, [0, 0.1, 0]); lb.add(r, 'Cylinder', { diameter: 0.5, height: 0.04, tessellation: 14 }, [1, 0.92, 0.75], 0.9, [0, -0.08, 0]); B.pipe([b.x, b.y + 0.25, b.z], [b.x, b.y + 2.4, b.z], 0.02, COL2.black, 0, 5); continue; }
    if (b.kind === 'pend') { B.add(r, 'Cylinder', { diameterTop: 0.08, diameterBottom: 0.42, height: 0.2, tessellation: 12 }, COL2.green, 0, [0, 0.08, 0]); lb.add(r, 'Sphere', { diameter: 0.12, segments: 6 }, [1, 0.9, 0.7], 0.9, [0, -0.02, 0]); B.pipe([b.x, b.y + 0.16, b.z], [b.x, b.y + 0.55, b.z], 0.01, COL2.black, 0, 4); continue; }
    lb.add(r, 'Sphere', { diameter: 0.13, segments: 6 }, b.kind === 'red' ? [1, 0.3, 0.2] : b.kind === 'green' ? [0.4, 1, 0.5] : [1, 0.9, 0.7], 0.9, [0, 0, 0]);
    for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.012, height: 0.2, depth: 0.012 }, COL2.iron, 0, [Math.sin(i * 1.57) * 0.08, -0.01, Math.cos(i * 1.57) * 0.08]);
    B.add(r, 'Cylinder', { diameter: 0.12, height: 0.07, tessellation: 8 }, COL2.iron, 0, [0, 0.1, 0]);
  }
  for (const p of LV.panels) { const r = pr2(p.x, p.z, 0, p.y); BOn.add(r, 'Box', { width: p.w, height: 0.03, depth: p.l }, [0.9, 0.97, 1], 0.9, [0, -0.04, 0]); B.add(r, 'Box', { width: p.w + 0.08, height: 0.03, depth: p.l + 0.08 }, COL2.steel, 0, [0, -0.015, 0]); }
  buildPipes2(B);
  for (const g of WP2.gauges) { const r = propRoot(g.x, g.z, g.ry); F2.gauge(B, r, g.y); }
  furnishHub2(B); furnishWest2(B); furnishNorth2(B); furnishEast2(B);
  WP2.finishProps = () => {
    const keep = [], out = [...(B.finish('props2', keep) || []), ...(BOn.finish('lensOn2', keep) || []), ...(BFl.finish('lensFl2', keep) || []), ...(BRed.finish('lensRed2', keep) || []), ...(BGrn.finish('lensGrn2', keep) || [])];
    out.forEach(m => m._sortD = 300);
    new Set(keep).forEach(r => r && r.dispose && r.dispose());
  };
}
const SG2 = { bg: '#c9a227', fg: '#151515' }, SGW2 = { bg: '#d8d2bc', fg: '#1d1d1d', line: '#555', emis: 0.25 }, SGG2 = { bg: '#1d5a32', fg: '#e8f0e8', line: '#e8f0e8', emis: 0.6 };
function phone2(x, y, d, key, along = 0) { const r = wallAt2(x, y, d, along); F2.phone(WP2.B, r); const p = localPt(r, 0, 1.35, 0.6); WP2.phones.push({ key, x: p.x, z: p.z, r, ring: 0 }); return r; }
function vent2(x, z, y = 0.4) { WP2.vents.push({ x, y, z }); }

// ================= the hub: sump, spine, office, boiler hall, cold room A, shelters =================
function furnishHub2(B) {
  const P = WP2.pos;
  // the sump: the drain you came up through, a ladder, barrels, a wet-floor sign
  { const r = pr2(cc2(23), cc2(41) + 0.4, 0, 0); B.add(r, 'Cylinder', { diameter: 1.3, height: 0.04, tessellation: 20 }, COL2.iron, 0, [0, 0.01, 0]); for (let i = -2; i <= 2; i++) B.add(r, 'Box', { width: 1.1, height: 0.05, depth: 0.06 }, COL2.black, 0, [0, 0.03, i * 0.2]); P.drain = { x: r.position.x, z: r.position.z }; }
  P.arrive = { x: cc2(23), z: cc2(41) - 0.6 };
  for (const [x, z] of [[cc2(22) - 1.2, cc2(42) + 1.1], [cc2(22) - 0.5, cc2(42) + 1.2], [cc2(24) + 1.1, cc2(40) - 1.1]]) { const r = pr2(x, z, rnd(0, 6)); F2.barrel(B, r, 0, 0); solidAround2(x, z, 0.35, 0.35); }
  { const r = pr2(cc2(24) + 0.6, cc2(42) + 0.8, 0.6); B.mdl('wetsign', r, [0, 0, 0], [0, 0, 0], 1) || B.add(r, 'Box', { width: 0.3, height: 0.6, depth: 0.05 }, COL2.yellow, 0, [0, 0.3, 0]); }
  phone2(24, 41, 0, 'sump');
  sign2('SUMP 2-B\nNO ENTRY WHEN PUMPS RUN', twin(wallAt2(22, 41, 2)), [0, 2.1, 0.03], 1.4, 0.45, SGW2);
  // the spine: signs at every turning
  sign2('LOW GALLERIES ◄', twin(wallAt2(23, 21, 0)), [0, 2.15, 0.03], 1.5, 0.32, SG2);
  sign2('LONG PIPE ►\nVALVE ROOMS', twin(wallAt2(23, 19, 2)), [0, 2.1, 0.03], 1.4, 0.45, SG2);
  sign2('SWITCHYARD ▲\nGAMMA LIFT', twin(wallAt2(23, 15, 0)), [0, 2.1, 0.03], 1.4, 0.45, SG2);
  sign2('BOILER HALL ►', twin(wallAt2(23, 26, 2)), [0, 2.15, 0.03], 1.4, 0.32, SG2);
  sign2('SUMP ▼', twin(wallAt2(23, 37, 0)), [0, 2.15, 0.03], 1.0, 0.32, SG2);
  phone2(23, 26, 0, 'spine', 1.0); phone2(23, 16, 0, 'north', 0.6);
  for (let y = 15; y <= 38; y += 4) vent2(cc2(23) + 1.0, cc2(y) + 0.6);
  // steam shelters: a sign over each opening on the corridor side
  for (const s of LV.shelters2) { const r = wallAt2(s.fx, s.fy, s.d, 0); sign2('STEAM SHELTER', twin(r), [0, 2.35, 0.03], 1.0, 0.22, SGG2);
    const back = wallAt2(s.x, s.y, s.d, 0); B.add(back, 'Box', { width: 0.9, height: 0.05, depth: 0.32 }, COL2.steel, 0, [0, 0.48, 0.2]); }
  // the Boiler Office: Ida's desk faces the gauge wall; her back is to the door
  { const r = wallAt2(27, 28, 0, 1.8); B.add(r, 'Box', { width: 2.6, height: 0.05, depth: 0.8 }, COL2.wood, 0, [0, 0.76, 0.42]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: 0.74, depth: 0.74 }, [0.3, 0.22, 0.14], 0, [s * 1.25, 0.37, 0.42]); solidLocal(r, -1.35, 0, 1.35, 0.85);
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) F2.gauge(B, propRoot(...localXZR(r, -1.25 + i * 0.5, 0.02)), 1.35 + j * 0.42);
    B.add(r, 'Box', { width: 0.34, height: 0.22, depth: 0.22 }, COL2.olive, 0, [0.9, 0.9, 0.3]); B.add(r, 'Box', { width: 0.22, height: 0.08, depth: 0.08 }, COL2.black, 0, [0.9, 1.04, 0.36]);   // desk phone
    B.add(r, 'Box', { width: 0.36, height: 0.03, depth: 0.26 }, [0.86, 0.84, 0.76], 0, [-0.4, 0.79, 0.4], [0, 0.2, 0]); B.add(r, 'Cylinder', { diameter: 0.09, height: 0.1, tessellation: 10 }, COL2.white, 0, [0.4, 0.83, 0.5]);
    P.officeDesk = localPt(r, 0, 0.8, 0.9); P.officePhone = localPt(r, 0.9, 0.9, 0.9); P.gaugeWall = localPt(r, 0, 1.8, 0.4); }
  P.ida = { x: cc2(27) - 0.25, z: cc2(28) + 1.8, yaw: Math.PI / 2 };
  { const r = pr2(P.ida.x - 0.15, P.ida.z, P.ida.yaw); B.add(r, 'Box', { width: 0.5, height: 0.06, depth: 0.5 }, COL2.iron, 0, [0, 0.48, 0]); B.add(r, 'Box', { width: 0.5, height: 0.5, depth: 0.05 }, COL2.iron, 0, [0, 0.75, -0.25]); B.add(r, 'Cylinder', { diameter: 0.05, height: 0.45, tessellation: 6 }, COL2.steel, 0, [0, 0.23, 0]); addSolid(P.ida.x - 0.45, P.ida.z - 0.45, P.ida.x + 0.3, P.ida.z + 0.45, 'prop'); }
  { const r = wallAt2(27, 29, 0, 0.6); B.add(r, 'Box', { width: 1.6, height: 0.9, depth: 0.05 }, COL2.iron, 0, [0, 1.75, 0.02]); WP2.BRed.add(r, 'Box', { width: 1.4, height: 0.7, depth: 0.02 }, [1, 0.45, 0.18], 0.6, [0, 1.75, 0.05]); for (let i = -2; i <= 2; i++) B.add(r, 'Box', { width: 0.02, height: 0.7, depth: 0.03 }, COL2.iron, 0, [i * 0.3, 1.75, 0.07]); }
  { const r = wallAt2(25, 27, 3, 0); FURN.bunk.fn(B, r); solidLocal(r, -1.0, 0, 1.0, 0.95); }
  { const r = wallAt2(24, 30, 2, 0); FURN.filing.fn(B, r); solidLocal(r, -0.3, 0, 0.3, 0.6); }
  { const r = wallAt2(24, 29, 1, 0.4); B.add(r, 'Box', { width: 0.6, height: 0.8, depth: 0.03 }, [0.88, 0.86, 0.78], 0, [0, 1.6, 0.02]); for (let i = 0; i < 12; i++) B.add(r, 'Box', { width: 0.06, height: 0.05, depth: 0.004 }, COL2.red, 0, [-0.24 + (i % 6) * 0.09, 1.7 - Math.floor(i / 6) * 0.1, 0.036]); P.calendar = localPt(r, 0, 1.5, 0.9); }
  { const r = wallAt2(26, 30, 1, 0.8); B.add(r, 'Box', { width: 0.9, height: 0.6, depth: 0.03 }, [0.48, 0.36, 0.2], 0, [0, 1.55, 0.02]); for (let i = 0; i < 5; i++) B.add(r, 'Box', { width: 0.14, height: 0.18, depth: 0.004 }, i === 2 ? [0.9, 0.9, 0.86] : COL2.cream, 0, [-0.32 + i * 0.16, 1.55, 0.035]); P.shiftBoard = localPt(r, 0, 1.5, 0.9); P.idHook = localPt(r, 0, 1.4, 0.4); }
  // the Boiler Hall: three boilers on saddles, the fireboxes glowing
  for (const [i, x] of [[0, 29.3], [1, 31.5], [2, 33.7]].map(([i, x]) => [i, x * CELL])) {
    const z0 = 23.4 * CELL, z1 = 30.6 * CELL, zc = (z0 + z1) / 2, r = pr2(x, zc, 0, 0);
    B.add(r, 'Cylinder', { diameter: 2.5, height: z1 - z0, tessellation: 24 }, i === 1 ? COL2.grey : COL2.rust, 0, [0, 1.75, 0], [Math.PI / 2, 0, 0]);
    for (const dz of [-3.6, 0, 3.6]) B.add(r, 'Box', { width: 2.2, height: 0.6, depth: 0.5 }, COL2.iron, 0, [0, 0.3, dz]);
    for (const dz of [-(z1 - z0) / 2, (z1 - z0) / 2]) B.add(r, 'Cylinder', { diameter: 2.6, height: 0.12, tessellation: 24 }, COL2.iron, 0, [0, 1.75, dz], [Math.PI / 2, 0, 0]);
    B.add(r, 'Box', { width: 0.8, height: 0.5, depth: 0.04 }, [1, 0.45, 0.12], 0.7, [0, 1.3, -(z1 - z0) / 2 - 0.08]);
    B.pipe([x, 3.0, zc - 2], [x, 6.5, zc - 2], 0.22, COL2.grey, 0, 10); B.pipe([x - 0.6, 3.0, zc + 2.5], [x - 0.6, 6.5, zc + 2.5], 0.12, COL2.rust, 0, 8);
    addSolid(x - 1.3, z0 - 0.2, x + 1.3, z1 + 0.2, 'prop'); vent2(x + 1.4, zc + 3.8, 0.3);
  }
  for (const y of [23, 31]) { const r = wallAt2(28, y, 2, 0); F2.gauge(B, r, 1.5); F2.gauge(B, r, 1.1); }
  sign2('BOILER HALL\nAUTHORISED STAFF', twin(wallAt2(28, 25, 2, 1.2)), [0, 2.4, 0.03], 1.5, 0.45, { hazard: true, bg: '#c9a227' });
  // cold room A
  coldRoom2(B, 21, 35, 'coldA');
}
function localXZR(r, x, z) { const p = localPt(r, x, 0, z); return [p.x, p.z, r.rotation.y]; }
function coldRoom2(B, x0, y0, key) {
  const P = WP2.pos;
  for (const [x, y, d] of [[x0, y0, 3], [x0 + 1, y0, 3]]) { const r = wallAt2(x, y, d, 0); FURN.mshelf ? FURN.mshelf.fn(B, r) : B.add(r, 'Box', { width: 1.2, height: 1.8, depth: 0.45 }, COL2.steel, 0, [0, 0.9, 0.23]); for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.24, height: 0.28, depth: 0.24 }, [0.82, 0.78, 0.6], 0, [-0.4 + i * 0.27, 0.95, 0.25]); solidLocal(r, -0.6, 0, 0.6, 0.5); }
  { const r = wallAt2(x0, y0 + 1, 2, 0); B.add(r, 'Box', { width: 0.12, height: 0.4, depth: 0.03 }, COL2.white, 0, [0, 1.5, 0.02]); B.add(r, 'Box', { width: 0.02, height: 0.3, depth: 0.01 }, COL2.red, 0.3, [0, 1.45, 0.04]); sign2('COLD STORE\n4 °C', twin(r), [0.5, 2.0, 0.03], 0.7, 0.3, SGW2); }
  P[key] = { x: cc2(x0) + CELL / 2, z: cc2(y0) + CELL / 2 };
}

// ================= west: the Low Galleries, the camp, cold room B, the west regulator =================
function furnishWest2(B) {
  const P = WP2.pos;
  phone2(15, 22, 3, 'west', 0.5);
  sign2('LOW GALLERIES\nKEEP TO THE DUCKBOARDS', twin(wallAt2(16, 22, 1, 0)), [0, 2.0, 0.03], 1.5, 0.42, SG2);
  // duckboards along the galleries (a few planks, the rest underwater)
  for (const c of LV.dry.gall.cells) { if (h2i(c, 7, 301) < 0.6) continue; const x = cc2(c % N), z = cc2((c / N) | 0), r = pr2(x, z, h2i(c, 3, 302) < 0.5 ? 0 : Math.PI / 2, 0.03); for (let i = -2; i <= 2; i++) B.add(r, 'Box', { width: 0.2, height: 0.04, depth: 1.6 }, [0.3, 0.22, 0.14], 0, [i * 0.24, 0.04, 0]); }
  for (const c of LV.dry.gall.cells) if (h2i(c, 11, 303) > 0.82) vent2(cc2(c % N) + 0.8, cc2((c / N) | 0), 0.3);
  // hanging cables and the odd tangle
  for (const c of LV.dry.gall.cells) { if (h2i(c, 13, 304) < 0.75) continue; const x = cc2(c % N), z = cc2((c / N) | 0); B.pipe([x - 1.2, 2.5, z], [x, 1.9 + h2i(c, 1, 305) * 0.3, z + 0.2], 0.02, COL2.black, 0, 4); B.pipe([x, 1.9 + h2i(c, 1, 305) * 0.3, z + 0.2], [x + 1.2, 2.5, z], 0.02, COL2.black, 0, 4); }
  // the camp: Gamma Team's store room
  { const r = wallAt2(4, 28, 2, 0); FURN.bunk.fn(B, r); solidLocal(r, -1.0, 0, 1.0, 0.95); }
  { const r = wallAt2(6, 29, 0, 0); FURN.bunk.fn(B, r); solidLocal(r, -1.0, 0, 1.0, 0.95); }
  { const r = wallAt2(5, 30, 1, 0); B.add(r, 'Box', { width: 1.6, height: 0.05, depth: 0.7 }, [0.5, 0.48, 0.42], 0, [0, 0.74, 0.36]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: 0.72, depth: 0.66 }, COL2.iron, 0, [s * 0.75, 0.37, 0.36]); solidLocal(r, -0.85, 0, 0.85, 0.8);
    B.add(r, 'Box', { width: 0.36, height: 0.22, depth: 0.2 }, COL2.olive, 0, [-0.5, 0.88, 0.3]); B.add(r, 'Cylinder', { diameter: 0.04, height: 0.4, tessellation: 5 }, COL2.black, 0, [-0.62, 1.12, 0.26]);   // the field radio
    WP2.BOn.add(r, 'Cylinder', { diameter: 0.14, height: 0.2, tessellation: 10 }, [1, 0.85, 0.55], 0.8, [0.55, 0.87, 0.35]);   // a lantern
    P.log1 = localPt(r, 0.05, 0.8, 0.9); P.radio = localPt(r, -0.5, 0.9, 0.9); }
  { const r = wallAt2(5, 27, 3, 0); B.add(r, 'Box', { width: 1.6, height: 1.0, depth: 0.04 }, [0.48, 0.36, 0.2], 0, [0, 1.6, 0.02]); sign2('M.E.G. · GAMMA\nTEAM BOARD', twin(r), [0, 2.25, 0.03], 1.0, 0.25, { bg: '#e8e0c8', fg: '#7a3a10', line: '#7a3a10', emis: 0.2 });
    for (let i = 0; i < 6; i++) B.add(r, 'Box', { width: 0.18, height: 0.24, depth: 0.004 }, pick([COL2.white, COL2.cream, [0.9, 0.85, 0.5]]), 0, [-0.6 + i * 0.24, 1.55 + rnd(-0.15, 0.15), 0.045]); P.log2 = localPt(r, -0.3, 1.5, 0.9); P.idcard = localPt(r, 0.45, 1.5, 0.9); }
  { const r = pr2(cc2(6) + 0.6, cc2(27) + 0.4, 0.3); F2.crate(B, r, 0, 0, 1); solidAround2(r.position.x, r.position.z, 0.45, 0.45); P.crowbar = { x: r.position.x, z: r.position.z + 0.7, y: 0.65 };
    B.add(r, 'Box', { width: 0.04, height: 0.04, depth: 0.75 }, [0.62, 0.1, 0.06], 0, [0.05, 0.64, 0], [0, 0.4, 0]); WP2.crowbarRoot = r; }
  { const r = pr2(cc2(4) + 0.2, cc2(30) + 0.5, 1.1); P.log3 = { x: r.position.x, z: r.position.z, y: 0.3 }; B.add(r, 'Box', { width: 0.24, height: 0.03, depth: 0.32 }, [0.86, 0.84, 0.7], 0, [0, 0.02, 0]); }
  P.camp = { x: cc2(5), z: cc2(28) + 1 };
  // the rest of what they left: crates, a drum, sleeping bags, an orange tarp over a stack, a kettle-sized stove
  for (const [x, z, s] of [[cc2(4) - 1.0, cc2(30) + 1.1, 1], [cc2(4) - 0.4, cc2(30) + 1.2, 0.8], [cc2(6) + 1.0, cc2(30) + 1.1, 1]]) { const r = pr2(x, z, rnd(-0.3, 0.3)); F2.crate(B, r, 0, 0, s); solidAround2(x, z, 0.4, 0.4); }
  { const r = pr2(cc2(6) + 1.0, cc2(28) + 0.2, 0); F2.barrel(B, r, 0, 0); solidAround2(r.position.x, r.position.z, 0.35, 0.35); }
  for (const [x, z, ry] of [[cc2(5) - 0.6, cc2(29) - 0.2, 0.2], [cc2(5) + 0.7, cc2(28) + 0.4, -0.3]]) { const r = pr2(x, z, ry); B.add(r, 'Box', { width: 0.75, height: 0.1, depth: 1.9 }, pick([[0.2, 0.32, 0.22], [0.5, 0.18, 0.12]]), 0, [0, 0.05, 0]); B.add(r, 'Box', { width: 0.6, height: 0.14, depth: 0.35 }, [0.7, 0.66, 0.56], 0, [0, 0.1, 0.7]); }
  { const r = pr2(cc2(4) - 1.0, cc2(27) - 0.9, 0.1); B.add(r, 'Box', { width: 1.2, height: 0.9, depth: 0.9 }, [0.86, 0.42, 0.1], 0, [0, 0.45, 0]); B.add(r, 'Box', { width: 1.25, height: 0.05, depth: 0.95 }, [0.8, 0.38, 0.08], 0, [0, 0.92, 0], [0.04, 0, 0.03]); solidAround2(r.position.x, r.position.z, 0.62, 0.5); }
  sign2('M.E.G.\nGAMMA', twin(wallAt2(6, 28, 0, 0)), [0, 1.9, 0.03], 0.8, 0.45, { bg: '#c86a12', fg: '#fff', line: '#fff', emis: 0.3 });
  coldRoom2(B, 9, 28, 'coldB');
  // the west regulator: a manifold on the south wall of its room, the water ankle-deep and hotter here
  { const r = wallAt2(2, 36, 1, 0); F2.manifold(B, r); solidLocal(r, -1.2, 0, 1.2, 0.95); P.wreg = localPt(r, 0, 1.25, 1.5); WP2.wregRoot = r; }
  sign2('REGULATOR W\nTURN FULLY CLOSED', twin(wallAt2(1, 35, 2, 0)), [0, 2.1, 0.03], 1.2, 0.4, SG2);
  vent2(cc2(1) + 0.5, cc2(34), 0.3); vent2(cc2(3) - 0.4, cc2(35), 0.3);
}

// ================= north: the Switchyard, the breakers, the time clock, the lift =================
function furnishNorth2(B) {
  const P = WP2.pos;
  // breaker cabinets along the north and south walls
  for (let x = 16; x <= 30; x++) { if (x >= 21 && x <= 25) continue; const r = wallAt2(x, 4, 3, 0); F2.cabinet(B, r, (x * 7) % 3 !== 0); solidLocal(r, -0.6, 0, 0.6, 0.6); }
  for (const x of [17, 19, 27, 29]) { const r = wallAt2(x, 13, 1, 0); F2.cabinet(B, r, x % 2 === 1); solidLocal(r, -0.6, 0, 0.6, 0.6); }
  // transformers in two rows
  for (const [x, y] of [[18, 7], [18, 10], [27, 7], [27, 10]]) { const cx = cc2(x), cz = cc2(y), r = pr2(cx, cz, 0); B.add(r, 'Box', { width: 2.2, height: 2.4, depth: 1.6 }, [0.3, 0.34, 0.3], 0, [0, 1.2, 0]); for (let i = 0; i < 8; i++) B.add(r, 'Box', { width: 0.05, height: 1.8, depth: 1.7 }, [0.26, 0.28, 0.26], 0, [-1.0 + i * 0.28, 1.1, 0]);
    for (const s of [-0.6, 0, 0.6]) { B.add(r, 'Cylinder', { diameter: 0.18, height: 0.5, tessellation: 10 }, [0.7, 0.6, 0.5], 0, [s, 2.65, 0]); } sign2('DANGER\n11 000 V', twin(r), [0, 1.5, 0.82], 0.7, 0.4, { hazard: true }); solidAround2(cx, cz, 1.2, 0.9); }
  // cable trays overhead
  for (const z of [cc2(6), cc2(11)]) B.add(pr2(cc2(23), z, 0, 4.6), 'Box', { width: 15 * CELL - 1, height: 0.08, depth: 0.6 }, COL2.iron, 0, [0, 0, 0]);
  // the breaker bank: four big levers on a panel, numbered
  { const r = wallAt2(23, 4, 3, 0); B.add(r, 'Box', { width: 3.6, height: 2.2, depth: 0.4 }, [0.22, 0.26, 0.22], 0, [0, 1.2, 0.2]); sign2('MAIN BREAKERS\nGAMMA LIFT FEED', twin(r), [0, 2.55, 0.03], 2.2, 0.45, SGW2);
    P.breakers = [];
    for (let i = 0; i < 4; i++) { const lx = -1.2 + i * 0.8; B.add(r, 'Box', { width: 0.5, height: 0.9, depth: 0.08 }, COL2.iron, 0, [lx, 1.35, 0.44]); sign2(String(i + 1), twin(r), [lx, 1.95, 0.43], 0.25, 0.25, SGW2);
      const pivot = tnode(null, 0, 0, 0); const q = localPt(r, lx, 1.35, 0.5); pivot.position.copyFrom(q); pivot.rotation.y = r.rotation.y;
      const h = mkMerged(WP2.propMat, Q => { Q('Box', { width: 0.07, height: 0.6, depth: 0.07 }, COL2.iron, 0, [0, 0.3, 0]); Q('Cylinder', { diameter: 0.12, height: 0.24, tessellation: 10 }, COL2.red, 0, [0, 0.62, 0], [0, 0, Math.PI / 2]); }, 'lever2');
      h.parent = pivot; pivot.rotation.x = 0.7; P.breakers.push({ i, x: localPt(r, lx, 1.2, 1.0).x, z: localPt(r, lx, 1.2, 1.0).z, pivot, up: false }); }
    P.bank = localPt(r, 0, 1.2, 1.3); }
  // the foreman's pipe: a vertical riser by the bank, with a wrench hung on it
  { const r = wallAt2(20, 4, 3, 0.4); B.pipe(localArr(r, 0, 0, 0.3), localArr(r, 0, 6.2, 0.3), 0.11, COL2.rust, 0, 10); B.add(r, 'Box', { width: 0.05, height: 0.4, depth: 0.05 }, COL2.steel, 0, [0.16, 1.4, 0.32], [0, 0, 0.3]); P.tapPipe = localPt(r, 0, 1.4, 1.0); P.foreman = localPt(r, 0.2, 0, 0.75); }
  // the time clock and the card rack, by the way in
  { const r = wallAt2(21, 13, 1, 0); B.add(r, 'Box', { width: 0.42, height: 0.56, depth: 0.22 }, [0.6, 0.56, 0.42], 0, [0, 1.4, 0.11]); B.add(r, 'Cylinder', { diameter: 0.24, height: 0.02, tessellation: 18 }, COL2.white, 0.1, [0, 1.52, 0.225], [Math.PI / 2, 0, 0]);
    B.add(r, 'Box', { width: 0.7, height: 0.9, depth: 0.08 }, COL2.iron, 0, [0.7, 1.4, 0.04]); for (let j = 0; j < 6; j++) for (let i = 0; i < 3; i++) B.add(r, 'Box', { width: 0.12, height: 0.2, depth: 0.004 }, [0.86, 0.82, 0.7], 0, [0.5 + i * 0.2, 1.75 - j * 0.14, 0.09]);
    sign2('PUNCH IN · PUNCH OUT', twin(r), [0.3, 2.0, 0.03], 1.2, 0.22, SGW2); P.clock = localPt(r, 0, 1.4, 0.9); }
  // the north regulator, in a mesh cage in the north-east corner
  { const r = wallAt2(30, 5, 0, 0); F2.manifold(B, r); solidLocal(r, -1.2, 0, 1.2, 0.95); P.nreg = localPt(r, 0, 1.25, 1.5); WP2.nregRoot = r;
    for (const [w, x, z] of [[2.6, 0, 1.9]]) { B.add(r, 'Box', { width: w, height: 2.4, depth: 0.03 }, [0.32, 0.33, 0.33], 0, [x, 1.2, z]); } sign2('REGULATOR N', twin(r), [0, 2.4, 0.03], 1.0, 0.25, SG2); }
  phone2(16, 12, 2, 'switch', 0);
  for (const [x, y] of [[20, 9], [25, 6], [24, 12]]) vent2(cc2(x), cc2(y), 0.5);
  // the lift corridor and the lift: a freight car behind a folding gate
  sign2('GAMMA LIFT ►\nFREIGHT · STAFF', twin(wallAt2(32, 8, 3, 0)), [0, 2.1, 0.03], 1.4, 0.42, SG2);
  phone2(41, 9, 1, 'lift', 0.6);
  { const x0 = 41 * CELL + 0.3, x1 = 44 * CELL - 0.3, z0 = 6 * CELL + 0.3, z1 = 10 * CELL - 0.3;
    B.add(pr2((x0 + x1) / 2, (z0 + z1) / 2, 0, 0), 'Box', { width: x1 - x0 - 1.2, height: 0.12, depth: z1 - z0 - 1.2 }, COL2.iron, 0, [0.6, 0.06, 0]);
    WP2.gateMesh = mkMerged(WP2.propMat, Q => { for (let i = 0; i < 12; i++) Q('Box', { width: 0.04, height: 2.3, depth: 0.04 }, COL2.yellow, 0, [x0 + 0.9, 1.15, z0 + 0.6 + i * ((z1 - z0 - 1.2) / 11)]); Q('Box', { width: 0.05, height: 0.05, depth: z1 - z0 - 1.0 }, COL2.yellow, 0, [x0 + 0.9, 2.3, (z0 + z1) / 2]); Q('Box', { width: 0.05, height: 0.05, depth: z1 - z0 - 1.0 }, COL2.yellow, 0, [x0 + 0.9, 0.2, (z0 + z1) / 2]); }, 'liftgate2');
    const r = wallAt2(43, 7, 0, 0); B.add(r, 'Box', { width: 0.4, height: 0.7, depth: 0.12 }, COL2.iron, 0, [0, 1.4, 0.06]); WP2.BRed.add(r, 'Sphere', { diameter: 0.09, segments: 6 }, [1, 0.2, 0.1], 0.9, [0, 1.6, 0.13]); B.add(r, 'Box', { width: 0.12, height: 0.12, depth: 0.04 }, COL2.white, 0, [0, 1.3, 0.13]);
    P.liftPanel = localPt(r, 0, 1.3, 0.8); P.liftGateX = x0 + 0.9; WP2.liftGate = addSolid(x0 + 0.85, z0, x0 + 0.95, z1, 'liftgate'); P.liftCar = { x: cc2(42) + 1.6, z: cc2(7) + 1.8 }; }
}

// ================= east: the Long Pipe, cold room C, the valve room =================
function furnishEast2(B) {
  const P = WP2.pos;
  // the long pipe itself: a metre-wide main running the whole way, along the outer wall
  const big = (a, b) => { B.pipe(a, b, 0.55, COL2.grey, 0, 14); };
  big([24 * CELL, 0.9, 18 * CELL + 0.75], [44 * CELL + 0.75, 0.9, 18 * CELL + 0.75]); big([45 * CELL - 0.75, 0.9, 18 * CELL + 0.75], [45 * CELL - 0.75, 0.9, 41 * CELL + CELL - 0.75]); big([36 * CELL, 0.9, 42 * CELL - 0.75], [45 * CELL - 0.75, 0.9, 42 * CELL - 0.75]);
  for (let x = 24; x <= 44; x += 2) { const r = pr2(x * CELL + 1.0, 18 * CELL + 0.75, 0); B.add(r, 'Box', { width: 0.3, height: 0.5, depth: 1.3 }, COL2.iron, 0, [0, 0.25, 0]); }
  for (let y = 19; y <= 41; y += 2) { const r = pr2(45 * CELL - 0.75, y * CELL + 1.0, 0); B.add(r, 'Box', { width: 1.3, height: 0.5, depth: 0.3 }, COL2.iron, 0, [0, 0.25, 0]); }
  addSolid(24 * CELL, 18 * CELL, 44 * CELL, 18 * CELL + 1.35, 'pipe'); addSolid(45 * CELL - 1.35, 19 * CELL, 45 * CELL, 42 * CELL, 'pipe'); addSolid(36 * CELL, 42 * CELL - 1.35, 44 * CELL, 42 * CELL, 'pipe');
  // gaps in the big pipe's run where the shelters and doors are: lift the solid there
  for (const s of LV.shelters2) if (LV.zone[cIdx(s.fx, s.fy)] === ZP2.LONG) { /* shelters on the pipe side are reached over it; none are */ }
  phone2(44, 20, 2, 'long', 0); phone2(37, 41, 3, 'valve', 0.4);
  sign2('LONG PIPE · 210 M\nDO NOT RUN', twin(wallAt2(24, 18, 1, 0)), [0, 2.1, 0.03], 1.4, 0.42, SG2);
  sign2('VALVE ROOMS ▼', twin(wallAt2(44, 22, 2, 0)), [0, 2.15, 0.03], 1.2, 0.3, SG2);
  for (let x = 26; x <= 42; x += 4) vent2(cc2(x), cc2(18) + 0.9, 1.4);
  for (let y = 21; y <= 39; y += 4) vent2(cc2(44) + 0.9, cc2(y), 1.4);
  // debris along the dark stretch: a dropped glove, a hard hat, scrape marks
  for (let i = 0; i < 8; i++) { const y = 23 + i * 2, r = pr2(cc2(44) - 0.4 + rnd(-0.4, 0.4), cc2(y) + rnd(-1, 1), rnd(0, 6)); B.add(r, 'Box', { width: rnd(0.1, 0.3), height: 0.03, depth: rnd(0.1, 0.4) }, pick([COL2.yellow, COL2.black, COL2.cream]), 0, [0, 0.02, 0]); }
  coldRoom2(B, 42, 28, 'coldC');
  // the valve room: Benny's corner, the east manifold with no wheel on it
  { const r = wallAt2(33, 41, 2, 0); F2.manifold(B, r); B.add(r, 'Cylinder', { diameter: 0.08, height: 0.34, tessellation: 8 }, COL2.iron, 0, [0, 1.25, 0.8], [Math.PI / 2, 0, 0]); solidLocal(r, -1.2, 0, 1.2, 0.95); P.ereg = localPt(r, 0, 1.25, 1.5); WP2.eregRoot = r; sign2('REGULATOR E', twin(r), [0, 2.4, 0.03], 1.0, 0.25, SG2); }
  { const r = wallAt2(34, 42, 1, 0); B.add(r, 'Box', { width: 1.9, height: 0.25, depth: 0.85 }, [0.36, 0.34, 0.26], 0, [0, 0.14, 0.45]); B.add(r, 'Box', { width: 0.5, height: 0.12, depth: 0.35 }, [0.7, 0.68, 0.6], 0, [-0.65, 0.32, 0.45]); solidLocal(r, -1.0, 0, 1.0, 0.9); }
  { const r = wallAt2(35, 40, 3, 0); for (let i = 0; i < 6; i++) B.add(r, 'Cylinder', { diameter: 0.08, height: 0.11, tessellation: 8 }, pick([COL2.red, COL2.steel, COL2.yellow]), 0, [-0.4 + i * 0.16, 0.06, 0.4 + rnd(-0.1, 0.1)]); }
  P.benny = { x: cc2(34) + 0.4, z: cc2(41) + 0.5 };
  P.valveDoor = { x: 36 * CELL + 0.1, z: cc2(41) };
}
