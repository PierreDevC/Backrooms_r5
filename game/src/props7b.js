// ---------- r10 · Level 7 furnishing, part two: the cape, the pier, the habitat, the wreck, the sea ----------
const seabed7 = (x, z) => LV.fh[cell7(x, z)] + 0.05;
// ================= Cape Sorrel =================
function furnishCape7(B) {
  const P = WS7.pos, FH = 1.8;
  edgeLadder7('cS', 'CAPE SORREL', 29, 14, 1); edgeLadder7('cW', 'CAPE SORREL', 28, 11, 2);
  for (const L of WS7.ladders) if (L.id[0] === 'c' && L.id.length === 2) L.low = -1.2;
  // the islet: boulders round the shore, a bollard, a net on a post
  for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, rx = 4.9 * CELL, rz = 3.2 * CELL, x = cc7(32) + Math.cos(a) * rx * rnd(0.88, 1.0), z = cc7(11) + 0.8 + Math.sin(a) * rz * rnd(0.88, 1.0); if (LV.room[cell7(x, z)] !== LV.dry.islet.id) continue;
    if (WS7.ladders.some(L => L.cx !== undefined && dist2(x, z, L.mx, L.mz) < 2.6)) continue; const r = pr37(x, z, rnd(0, 6), FH); const s = rnd(0.7, 1.4); B.add(r, 'Sphere', { diameter: 1.4 * s, segments: 7 }, [0.18, 0.2, 0.22], 0, [0, 0.35 * s, 0], null, [1, 0.7, 1]); sol7(x, z, 0.6 * s, 0.6 * s); }
  { const r = pr37(cc7(29) + 1.0, cc7(13) + 0.6, 0, FH); B.add(r, 'Cylinder', { diameter: 0.3, height: 0.5, tessellation: 10 }, COL7.iron, 0, [0, 0.25, 0]); sol7(r.position.x, r.position.z, 0.2, 0.2); }
  // the tower: red and white bands, a lantern room on top with a lens, a ladder up inside
  { const cx = cc7(31), cz = cc7(11), r = pr37(cx, cz, 0, FH), W = 3 * CELL + 0.3;
    B.add(r, 'Box', { width: W + 0.8, height: 0.3, depth: W + 0.8 }, COL7.iron, 0, [0, 22.2, 0]); for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) B.pipe(lp7(r, a[0] * (W / 2 + 0.4), 23.4, a[1] * (W / 2 + 0.4)), lp7(r, b[0] * (W / 2 + 0.4), 23.4, b[1] * (W / 2 + 0.4)), 0.03, COL7.iron, 0, 5);
    WS7.lampGlass = mkMerged(WS7.propMat, Q => { Q('Cylinder', { diameter: 3.4, height: 2.6, tessellation: 16 }, [0.5, 0.65, 0.7], 0.0, [0, 0, 0]); }, 'lanterntop'); WS7.lampGlass.position.set(cx, FH + 23.8 + 1.3, cz); WS7.lampGlass.visibility = 0.5;
    B.add(r, 'Cylinder', { diameterTop: 0.2, diameterBottom: 3.8, height: 1.4, tessellation: 16 }, COL7.red, 0, [0, 25.9 + 0.7, 0]); B.add(r, 'Cylinder', { diameter: 3.8, height: 0.3, tessellation: 16 }, COL7.iron, 0, [0, 23.8, 0]);
    litPoint7(cx, cz, 24, 'deck'); P.towerPos = { x: cx, z: cz }; }
  { const L = addLadder7('tw', 'THE LAMP ROOM', cc7(31), cc7(11) + 0.3, cc7(2) + 0.5, cc7(3) + 1.8, 16.0, { pocket: true });
    const r = wallAt37(31, 10, 3, 0); for (const s of [-1, 1]) B.pipe(lp7(r, s * 0.3, 0.1, 0.18), lp7(r, s * 0.3, 20, 0.18), 0.035, COL7.steel, 0, 6); for (let y = 0.4; y < 20; y += 0.34) B.pipe(lp7(r, -0.3, y, 0.18), lp7(r, 0.3, y, 0.18), 0.02, COL7.steel, 0, 5); }
  { const r = wallAt37(30, 12, 1, 0); for (let i = 0; i < 4; i++) barrel7(B, lp7(r, -0.6 + (i % 2) * 0.7, 0, 0.7 + Math.floor(i / 2) * 0.6)[0], lp7(r, -0.6 + (i % 2) * 0.7, 0, 0.7 + Math.floor(i / 2) * 0.6)[2], COL7.rust, FH); }
  { const r = wallAt37(32, 12, 1, 0); B.add(r, 'Box', { width: 1.8, height: 0.06, depth: 0.7 }, COL7.wood2, 0, [0, 0.9, 0.4]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.06, height: 0.88, depth: 0.6 }, COL7.wood, 0, [s * 0.8, 0.44, 0.4]); solidLocal(r, -1.0, 0, 1.0, 0.8); }
  // the lamp room: a great lens (rings of glass), the burner, the empty motor housing, a panel with three seats
  { const cx = cc7(2) + 1.8, cz = cc7(2) + 1.8, r = pr37(cx, cz, 0, 16.0);
    B.add(r, 'Cylinder', { diameter: 1.6, height: 1.2, tessellation: 18 }, COL7.iron, 0, [0, 0.6, 0]);
    WS7.lensMesh = mkMerged(WS7.propMat, Q => { for (let i = 0; i < 6; i++) Q('Torus', { diameter: 2.6 - Math.abs(i - 2.5) * 0.4, thickness: 0.08, tessellation: 22 }, [0.8, 0.9, 0.95], 0.1, [0, 1.4 + i * 0.28, 0], [Math.PI / 2, 0, 0]); for (let i = 0; i < 12; i++) Q('Box', { width: 0.05, height: 1.8, depth: 0.05 }, COL7.brass, 0, [Math.sin(i / 12 * TAU) * 1.25, 2.2, Math.cos(i / 12 * TAU) * 1.25]); Q('Sphere', { diameter: 0.5, segments: 8 }, [1, 0.9, 0.6], 0, [0, 2.2, 0]); }, 'lens7'); WS7.lensMesh.position.set(cx, 16.0, cz);
    WS7.lensGlow = mkMerged(WS7.propMat, Q => { Q('Sphere', { diameter: 0.7, segments: 8 }, [1, 0.9, 0.6], 3.0, [0, 0, 0]); }, 'lensglow'); WS7.lensGlow.position.set(cx, 18.2, cz); WS7.lensGlow.setEnabled(false);
    sol7(cx, cz, 1.0, 1.0); P.lens = { x: cx, z: cz + 1.4, y: 17.0 };
    const w = wallAt37(5, 2, 0, 0); w.position.y = 16.0; B.add(w, 'Box', { width: 2.4, height: 1.4, depth: 0.4 }, [0.26, 0.3, 0.26], 0, [0, 0.9, 0.2]); sign37('CAPE SORREL LIGHT\nFUEL · MOTOR · CABLE', twin37(w), [0, 1.9, 0.03], 1.6, 0.42, SG7);
    for (let i = 0; i < 3; i++) B.add(w, 'Box', { width: 0.5, height: 0.5, depth: 0.1 }, COL7.iron, 0, [-0.8 + i * 0.8, 1.1, 0.45]); B.add(w, 'Box', { width: 0.12, height: 0.5, depth: 0.1 }, COL7.red, 0, [0.0, 0.5, 0.45], [0.5, 0, 0]); solidLocal(w, -1.3, 0, 1.3, 0.6); P.lampPanel = lp7(w, 0, 1.1, 1.1);
    const t = wallAt37(2, 0, 3, 0); t.position.y = 16.0; table7(B, t, 1.6, 0.8); solidLocal(t, -0.9, 0, 0.9, 0.9); B.add(t, 'Box', { width: 0.34, height: 0.05, depth: 0.26 }, [0.88, 0.86, 0.76], 0, [0, 0.79, 0.45], [0, 0.4, 0]); P.tomasLog = lp7(t, 0, 0.8, 1.1); P.lampPocket = { x: cc7(2) + 0.5, z: cc7(3) + 1.8 }; }
  // the cottage: a table, two chairs, a cot, a stove, a shelf of lamps and the clamp on the table
  { const r = wallAt37(34, 10, 3, 0.5); table7(B, r, 1.4, 0.8); solidLocal(r, -0.8, 0, 0.8, 0.9); P.clamp = { x: lp7(r, 0.1, 0.8, 0.9)[0], z: lp7(r, 0.1, 0.8, 0.9)[2], y: FH + 0.9 };
    const c1 = wallAt37(35, 11, 0, 0); FURN.bunk.fn(B, c1); solidLocal(c1, -1.0, 0, 1.0, 0.95); const c2 = wallAt37(35, 12, 1, 0); B.add(c2, 'Box', { width: 1.0, height: 0.8, depth: 0.5 }, COL7.iron, 0, [0, 0.4, 0.3]); for (let i = 0; i < 2; i++) B.add(c2, 'Cylinder', { diameter: 0.28, height: 0.03, tessellation: 10 }, COL7.black, 0, [-0.2 + i * 0.4, 0.82, 0.3]); solidLocal(c2, -0.6, 0, 0.6, 0.6);
    const c3 = wallAt37(34, 11, 2, 0); B.add(c3, 'Box', { width: 0.04, height: 0.7, depth: 1.2 }, COL7.wood, 0, [0.02, 1.4, 0]); for (let i = 0; i < 4; i++) B.add(c3, 'Cylinder', { diameter: 0.14, height: 0.25, tessellation: 8 }, COL7.glass, 0, [0.2, 1.1 + (i % 2) * 0.5, -0.4 + Math.floor(i / 2) * 0.5]); P.wrenLog = lp7(wallAt37(35, 10, 0, 0.5), 0, 1.4, 0.9); const ph = wallAt37(35, 10, 0, 0.5); B.add(ph, 'Box', { width: 0.5, height: 0.6, depth: 0.03 }, COL7.wood2, 0, [0, 1.5, 0.02]); B.add(ph, 'Box', { width: 0.34, height: 0.42, depth: 0.004 }, [0.7, 0.66, 0.55], 0, [0, 1.5, 0.04]); }
  P.wren = { x: cc7(34) + 0.9, z: cc7(11) + 0.4, yaw: -Math.PI / 2 };
  P.flareCape = { x: cc7(35), z: cc7(12) - 0.3, y: FH + 0.4 };
  // the junction box on the seabed to the west, with a marker buoy; the cable comes down from the rig and stops short
  { const jx = cc7(22), jz = cc7(12), jy = LV.fh[cell7(jx, jz)]; P.junction = { x: jx, z: jz, y: jy + 0.5 };
    const r = pr37(jx, jz, 0, jy); B.add(r, 'Box', { width: 0.9, height: 0.8, depth: 0.6 }, COL7.iron, 0, [0, 0.4, 0]); BRed_(B).add(r, 'Sphere', { diameter: 0.14, segments: 6 }, [1, 0.2, 0.1], 0.9, [0.3, 0.7, 0.31]); B.add(r, 'Box', { width: 0.3, height: 0.03, depth: 0.03 }, COL7.red, 0, [0, 0.8, 0.31]);
    buoy7(B, jx, jz, 'junction'); B.pipe([jx, 0, jz], [jx, jy + 0.8, jz], 0.012, COL7.black, 0, 4);
    const pts = []; for (let k = 0; k <= 22; k++) { const t = k / 22, x = lerp(cc7(30), jx + 1.6, t) + Math.sin(t * 5) * 1.5, z = lerp(cc7(23), jz + 0.2, t) + Math.cos(t * 4) * 1.2; pts.push([x, seabed7(x, z), z]); }
    for (let k = 0; k < pts.length - 1; k++) B.pipe(pts[k], pts[k + 1], 0.045, COL7.black, 0, 5);
    WS7.cableFix = mkMerged(WS7.propMat, Q => { Q('Cylinder', { diameter: 0.1, height: 1.6, tessellation: 6 }, [0.3, 1, 0.5], 0.8, [0, 0, 0], [0, 0, Math.PI / 2]); }, 'splice7'); WS7.cableFix.position.set(jx + 0.8, jy + 0.16, jz + 0.1); WS7.cableFix.setEnabled(false); }
  litPoint7(cc7(31), cc7(12), 26, 'deck'); litPoint7(cc7(34), cc7(12), 20, 'deck');
}
// ================= the pier =================
function furnishPier7(B) {
  const P = WS7.pos, FH = 1.4;
  edgeLadder7('pS', 'THE PIER', 46, 31, 1); edgeLadder7('pH', 'THE PIER', 55, 30, 0); for (const L of WS7.ladders) if (L.id[0] === 'p') L.low = -1.2;
  for (const x of [45, 48, 52]) { const r = pr37(cc7(x), cc7(30) - 0.1, 0, FH); B.pipe(lp7(r, 0, 0, 0), lp7(r, 0, 3.6, 0), 0.05, COL7.iron, 0, 6); B.add(r, 'Box', { width: 0.4, height: 0.2, depth: 0.3 }, COL7.iron, 0, [0, 3.7, 0]); }
  for (const [x, z, s] of [[cc7(46), cc7(31) - 0.3, 1], [cc7(47) + 0.4, cc7(30) + 0.2, 0.8]]) crate7(B, x, z, rnd(0, 3), s, FH);
  barrel7(B, cc7(44) + 0.8, cc7(30) - 0.2, COL7.blue, FH); barrel7(B, cc7(44) + 0.8, cc7(31) + 0.3, COL7.rust, FH);
  { const r = pr37(cc7(53) + 0.5, cc7(32) + 0.2, 0.2, FH); B.add(r, 'Box', { width: 1.6, height: 0.05, depth: 0.8 }, COL7.wood2, 0, [0, 0.76, 0]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: 0.74, depth: 0.7 }, COL7.wood, 0, [s * 0.7, 0.37, 0]); sol7(r.position.x, r.position.z, 0.9, 0.5); B.add(r, 'Box', { width: 0.4, height: 0.02, depth: 0.2 }, COL7.cream, 0, [0.2, 0.79, 0], [0, 0.4, 0]); P.fishTable = lp7(r, 0.2, 0.8, 0.9); }
  { const r = pr37(cc7(55) - 0.1, cc7(28) + 0.6, 0, FH); B.add(r, 'Cylinder', { diameter: 0.34, height: 0.55, tessellation: 10 }, COL7.iron, 0, [0, 0.27, 0]); sol7(r.position.x, r.position.z, 0.25, 0.25); }
  // the boathouse
  { const r = wallAt37(50, 33, 1, 0); B.add(r, 'Box', { width: 2.6, height: 0.06, depth: 0.7 }, COL7.wood2, 0, [0, 0.9, 0.4]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.06, height: 0.88, depth: 0.6 }, COL7.wood, 0, [s * 1.2, 0.44, 0.4]); solidLocal(r, -1.4, 0, 1.4, 0.8); for (let i = 0; i < 3; i++) B.add(r, 'Box', { width: 0.3, height: 0.12, depth: 0.2 }, COL7.red, 0, [-0.8 + i * 0.5, 0.99, 0.4]); P.shedBench = lp7(r, 0, 0.95, 1.1);
    const k = wallAt37(51, 32, 0, 0); B.add(k, 'Box', { width: 0.5, height: 0.6, depth: 0.04 }, COL7.wood2, 0, [0, 1.5, 0.02]); for (let i = 0; i < 3; i++) B.add(k, 'Cylinder', { diameter: 0.03, height: 0.1, tessellation: 5 }, COL7.brass, 0, [-0.15 + i * 0.15, 1.6, 0.06], [Math.PI / 2, 0, 0]); sign37('KEYS', twin37(k), [0, 1.82, 0.03], 0.5, 0.14, SW7); P.keyHook = lp7(k, 0, 1.5, 0.9);
    const j = wallAt37(49, 33, 2, 0); for (let i = 0; i < 4; i++) B.add(j, 'Box', { width: 0.3, height: 0.7, depth: 0.15 }, COL7.orange, 0, [0.15, 1.3, -0.5 + i * 0.35]); P.jackets = lp7(j, 0.2, 1.3, 0.9); P.flarePier = { x: lp7(r, 1.0, 0, 1.0)[0], z: lp7(r, 1.0, 0, 1.0)[2], y: FH + 0.4 }; }
  // the boat: a cabin cruiser tied up off the head of the pier
  { const bx = cc7(54), bz = cc7(26), r = pr37(bx, bz, 0, 0.1);
    B.add(r, 'Box', { width: 8.0, height: 1.0, depth: 2.7 }, COL7.white, 0, [0, 0.3, 0]); B.add(r, 'Box', { width: 2.2, height: 0.9, depth: 2.2 }, COL7.white, 0, [4.6, 0.3, 0], [0, 0, 0.25]); B.add(r, 'Box', { width: 8.2, height: 0.08, depth: 2.8 }, COL7.blue, 0, [0, 0.82, 0]);
    B.add(r, 'Box', { width: 3.0, height: 1.3, depth: 2.0 }, COL7.cream, 0, [-0.6, 1.5, 0]); B.add(r, 'Box', { width: 2.8, height: 0.5, depth: 2.04 }, COL7.glass, 0, [-0.6, 1.7, 0]); B.add(r, 'Box', { width: 3.2, height: 0.08, depth: 2.2 }, COL7.white, 0, [-0.6, 2.18, 0]);
    B.pipe(lp7(r, -0.6, 2.2, 0), lp7(r, -0.6, 4.2, 0), 0.04, COL7.iron, 0, 5); B.add(r, 'Box', { width: 0.5, height: 0.9, depth: 0.5 }, COL7.black, 0, [-4.2, 0.6, 0]); B.pipe(lp7(r, -4.0, 0.2, 0), lp7(r, -4.2, -0.9, 0), 0.07, COL7.iron, 0, 6);
    B.add(r, 'Box', { width: 0.3, height: 0.02, depth: 1.0 }, COL7.yellow, 0, [3.6, 0.86, 0]); sol7(bx, bz, 4.1, 1.4, 'boat'); P.boat = { x: bx, z: bz }; P.boatBoard = { x: cc7(54), z: cc7(28) + 0.5, y: FH + 0.4 };
    B.pipe([cc7(54) - 1.0, FH + 0.1, cc7(28) - 0.1], [bx + 3.0, 0.9, bz + 1.3], 0.025, COL7.cream, 0, 4); litPoint7(bx, bz, 12, 'deck'); }
  litPoint7(cc7(48), cc7(30), 30, 'deck'); litPoint7(cc7(54), cc7(30), 22, 'deck');
}
// ================= Habitat Orca-2 =================
function furnishHab7(B) {
  const P = WS7.pos, rx = cc7(33), rz = cc7(46);
  P.fen = { x: rx, z: rz + 0.3, yaw: Math.PI };
  { const r = pr37(rx, rz - 1.2, 0, -3.9); table7(B, r, 1.2, 0.6, 0.66); sol7(rx, rz - 1.1, 0.7, 0.4); B.add(r, 'Box', { width: 0.34, height: 0.05, depth: 0.26 }, [0.88, 0.86, 0.76], 0, [0.1, 0.69, 0.3], [0, 0.3, 0]); P.fenLog = lp7(r, 0.1, 0.7, 0.9); }
  { const r = wallAt37(32, 46, 2, 0); r.position.y = -3.9; FURN.bunk.fn(B, r); solidLocal(r, -1.0, 0, 1.0, 0.95); const g = wallAt37(34, 46, 0, 0); g.position.y = -3.9; B.add(g, 'Box', { width: 1.2, height: 1.4, depth: 0.2 }, COL7.iron, 0, [0, 0.9, 0.1]); for (let i = 0; i < 3; i++) B.add(g, 'Cylinder', { diameter: 0.22, height: 0.03, tessellation: 12 }, COL7.brass, 0, [-0.35 + i * 0.35, 1.3, 0.22], [Math.PI / 2, 0, 0]); sol7(g.position.x, g.position.z, 0.15, 0.7); P.airGauge = lp7(g, 0, 1.2, 0.9); }
  { const r = pr37(rx + 1.5, rz - 1.6, 0.4, -3.9); for (let i = 0; i < 3; i++) B.add(r, 'Cylinder', { diameter: 0.2, height: 1.0, tessellation: 8 }, COL7.yellow, 0, [i * 0.28, 0.5, 0]); sol7(r.position.x + 0.3, r.position.z, 0.5, 0.2); P.flareHab = { x: rx - 1.3, z: rz + 0.6, y: -3.5 }; }
  // the dome seen from outside: ribs and a name, a rope up to a marker buoy, the air line from the rig
  buoy7(B, rx, cc7(43), 'hab'); B.pipe([rx, 0, cc7(43)], [rx, -2.1, cc7(43) + 0.4], 0.015, COL7.black, 0, 4);
  { const pts = []; for (let k = 0; k <= 16; k++) { const t = k / 16, x = lerp(cc7(33) - 0.4, rx - 0.6, t), z = lerp(cc7(37), cc7(44) - 1.2, t) + Math.sin(t * 6) * 0.6; pts.push([x, seabed7(x, z), z]); } for (let k = 0; k < pts.length - 1; k++) B.pipe(pts[k], pts[k + 1], 0.05, COL7.black, 0, 5); WS7.airLine = pts; }
  litPoint7(rx, rz, 14, 'deck');
}
// ================= the Halcyon =================
function furnishWreck7(B) {
  const P = WS7.pos, FH = -9.5;
  // ribs and broken plates
  for (let i = 0; i < 9; i++) { const x = cc7(16) + i * 1.5 * 1.7 / 1.7, r = pr37(x, cc7(52), 0, FH); for (const s of [-1, 1]) B.pipe(lp7(r, 0, 0, s * 8.5), lp7(r, 0, 6.2, s * 5.8), 0.1, COL7.rust, 0, 6); B.pipe(lp7(r, 0, 6.2, -5.8), lp7(r, 0, 6.2, 5.8), 0.08, COL7.rust, 0, 6); }
  for (let i = 0; i < 6; i++) { const x = cc7(16 + Math.floor(rnd(0, 6))) + rnd(-1, 1), z = cc7(50 + Math.floor(rnd(0, 5))) + rnd(-1, 1), r = pr37(x, z, rnd(0, 6), FH); B.add(r, 'Box', { width: rnd(0.8, 1.6), height: 0.7, depth: rnd(0.7, 1.2) }, pick([COL7.wood, COL7.rust, COL7.iron]), 0, [0, 0.35, 0], [0, 0, rnd(-0.3, 0.3)]); }
  for (let i = 0; i < 4; i++) barrel7(B, cc7(17 + i) + rnd(-0.6, 0.6), cc7(51 + (i % 3)) + rnd(-0.6, 0.6), null, FH);
  // the bridge: a console, a wheel on its side, a chart table, the safe in the west wall
  { const r = wallAt37(13, 51, 3, 0); B.add(r, 'Box', { width: 3.4, height: 1.0, depth: 0.5 }, COL7.iron, 0, [0, 0.5, 0.4]); B.add(r, 'Torus', { diameter: 0.9, thickness: 0.07, tessellation: 20 }, COL7.wood2, 0, [0, 1.3, 0.7], [Math.PI / 2 - 0.5, 0, 0.3]); solidLocal(r, -1.8, 0, 1.8, 0.8); }
  { const r = wallAt37(14, 53, 0, 0); table7(B, r, 1.6, 0.8); solidLocal(r, -0.9, 0, 0.9, 0.9); B.add(r, 'Box', { width: 0.34, height: 0.05, depth: 0.26 }, [0.8, 0.78, 0.66], 0, [0, 0.79, 0.4], [0, 0.4, 0]); P.halcyonLog = lp7(r, 0, 0.8, 1.1); }
  { const r = wallAt37(12, 52, 2, 0); B.add(r, 'Box', { width: 1.1, height: 1.2, depth: 0.6 }, [0.2, 0.22, 0.2], 0, [0, 0.9, 0.3]); B.add(r, 'Box', { width: 0.96, height: 1.06, depth: 0.04 }, [0.28, 0.3, 0.28], 0, [0, 0.9, 0.62]);
    WS7.dialMeshes = []; for (let i = 0; i < 3; i++) { const d = mkMerged(WS7.propMat, Q => { Q('Cylinder', { diameter: 0.26, height: 0.06, tessellation: 16 }, COL7.brass, 0, [0, 0, 0], [Math.PI / 2, 0, 0]); Q('Box', { width: 0.03, height: 0.1, depth: 0.02 }, COL7.red, 0.4, [0, 0.07, 0.04]); }, 'dial7'); const q = lp7(r, -0.3 + i * 0.3, 1.1, 0.67); d.position.set(q[0], q[1], q[2]); d.rotation.y = r.rotation.y; WS7.dialMeshes.push(d); P['dial' + i] = lp7(r, -0.3 + i * 0.3, 1.1, 1.3); }
    WS7.safeDoor = mkMerged(WS7.propMat, Q => { Q('Box', { width: 0.04, height: 0.9, depth: 0.2 }, [0.34, 0.36, 0.34], 0, [0, 0, 0]); }, 'safedoor'); const sd = lp7(r, -0.5, 0.9, 0.62); WS7.safeDoor.position.set(sd[0], sd[1], sd[2]); WS7.safeDoor.rotation.y = r.rotation.y; WS7.safeDoorRoot = r;
    solidLocal(r, -0.6, 0, 0.6, 0.7); const sp = lp7(r, 0, 1.0, 1.4); P.safe = { x: sp[0], z: sp[2], y: FH + 1.0 }; P.motor = { x: lp7(r, 0, 0, 1.4)[0], z: lp7(r, 0, 0, 1.4)[2], y: FH + 0.9 }; }
  { const w = wallAt37(13, 53, 1, 0); B.add(w, 'Box', { width: 0.9, height: 0.4, depth: 0.04 }, COL7.black, 0, [0, 1.6, 0.02]); P.nameplate = 1; }
  { const lx = cc7(12) + 1.8, lz = cc7(54) + 1.8, r = pr37(lx, lz, 0, -4.6 - 0.0); B.add(r, 'Cylinder', { diameter: 0.2, height: 0.3, tessellation: 8 }, COL7.glass, 0.0, [0, 0.15, 0]); WS7.BGrn.add(r, 'Sphere', { diameter: 0.14, segments: 6 }, [0.4, 1, 0.6], 0.9, [0, 0.35, 0]); P.pocketLamp = { x: lx, z: lz }; }
  litPoint7(cc7(13), cc7(52), 6, 'wreck');
}
// ================= the open sea: the buoy lines, the trench, the weed =================
function furnishSea7(B) {
  const P = WS7.pos;
  for (const [x, y] of [[31, 21], [31, 19], [31, 17], [31, 15], [31, 40], [33, 41], [23, 33], [22, 36], [21, 39], [40, 29], [42, 29], [26, 22], [37, 22]]) buoy7(B, cc7(x), cc7(y), 'line');
  buoy7(B, cc7(43), cc7(47), 'trench');
  // the Deep cable: a heavy line from a buoy on the trench rim going straight down
  { const x = cc7(42), z = cc7(50); B.add(pr37(x, z, 0, 0), 'Cylinder', { diameter: 0.14, height: 0.2, tessellation: 8 }, COL7.black, 0, [0, 0, 0]); B.pipe([x, 0, z], [x, -24, z], 0.07, COL7.black, 0, 7); P.deepCable = { x, z, y: 0.5 }; buoy7(B, x + 1.2, z, 'deep'); litPoint7(x, z, 10, 'buoy', 'lit'); }
  // Dav's dinghy, adrift east of the habitat in the open dark, a long way from any light
  { const x = cc7(51), z = cc7(41), r = pr37(x, z, 0.7, 0.05); B.add(r, 'Box', { width: 3.2, height: 0.5, depth: 1.3 }, COL7.grey, 0, [0, 0.2, 0]); B.add(r, 'Box', { width: 0.9, height: 0.5, depth: 1.1 }, COL7.grey, 0, [1.9, 0.3, 0], [0, 0, 0.5]); B.add(r, 'Box', { width: 0.3, height: 0.4, depth: 0.3 }, COL7.black, 0, [-1.7, 0.45, 0]); B.add(r, 'Box', { width: 0.12, height: 0.06, depth: 0.5 }, COL7.red, 0, [0.2, 0.52, 0.3]); sol7(x, z, 1.9, 1.0, 'boat');
    P.dinghy = { x, z, y: 0.9 }; WS7.dinghy = r; }
  // weed on the seabed: strands near the shoals, the ship and the wreck
  for (let i = 0; i < 260; i++) { const x = rnd(SEA7.x0, SEA7.x1) * CELL, z = rnd(SEA7.y0, SEA7.y1) * CELL, c = cell7(x, z); if (LV.room[c] !== LV.dry.sea.id) continue; const fh = LV.fh[c]; if (fh > -1.0 || fh < -11) continue; const n = 2 + Math.floor(rnd(0, 3));
    for (let k = 0; k < n; k++) { const bx = x + rnd(-0.4, 0.4), bz = z + rnd(-0.4, 0.4), h = rnd(0.8, 2.4); B.pipe([bx, fh, bz], [bx + rnd(-0.3, 0.3), fh + h, bz + rnd(-0.3, 0.3)], 0.025, [0.1, 0.22, 0.12], 0, 4); } }
  for (let i = 0; i < 70; i++) { const x = rnd(SEA7.x0, SEA7.x1) * CELL, z = rnd(SEA7.y0, SEA7.y1) * CELL, c = cell7(x, z); if (LV.room[c] !== LV.dry.sea.id) continue; const fh = LV.fh[c]; if (fh > -2) continue; const r = pr37(x, z, rnd(0, 6), fh); const s = rnd(0.6, 1.8); B.add(r, 'Sphere', { diameter: 1.2 * s, segments: 6 }, [0.2, 0.22, 0.2], 0, [0, 0.3 * s, 0], null, [1, 0.6, 1]); }
}
