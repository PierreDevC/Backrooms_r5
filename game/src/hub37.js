// ---------- r8 · Level 37: the hub's furnishings (Shallows, Dive Well, Lap Pool, Cabana, Pump Room, Booth) ----------
function twin37(r) { const t = twin(r); t.position.y = r.position.y; t.computeWorldMatrix(true); return t; }
const cc37 = v => cellCenter(v);
// floating things ride on their basin: they follow its level (and settle on the floor when it is drained)
function floater37(node, basin, dy = 0.03) { W37.bob.push({ n: node, b: LV.basins[basin], dy, ph: rnd(0, TAU), x: node.position.x, z: node.position.z }); return node; }

function buildProps37() {
  const mat = actMat('props37', { spec: 0.35, shin: 28, wrinkle: 0.12, emis: 1, wrap: 0.4, mottle: 0.2 }), B = new PropBatch(mat); B.fast = true;
  W9.propMat = mat; W37.propMat = mat;
  const lensOn = actMat('lensOn37', { emis: 1 }), lensFl = actMat('lensFl37', { emis: 1 }); setEmi(lensOn, 3.2); W37.lensFl = lensFl;
  const BOn = new PropBatch(lensOn), BFl = new PropBatch(lensFl); BOn.fast = BFl.fast = true;
  Object.assign(W37, { B, BOn, BFl });
  W37.pos = {};
  // ceiling lights
  for (const p of LV.panels) { const r = propRoot(p.x, p.z, 0); r.position.y = p.y; r.computeWorldMatrix(true); (p.state === 2 ? BFl : BOn).add(r, 'Box', { width: p.w, height: 0.03, depth: p.l }, p.state ? [1, 0.98, 0.94] : [0.6, 0.6, 0.6], p.state ? 0.9 : 0, [0, -0.04, 0]); B.add(r, 'Box', { width: p.w + 0.08, height: 0.03, depth: p.l + 0.08 }, [0.8, 0.82, 0.82], 0, [0, -0.015, 0]); }
  furnishShallows37(B); furnishWell37(B); furnishLap37(B); furnishCabana37(B); furnishPlant37(B); furnishBooth37(B);
  furnishHotel37(B); furnishHospital37(B); furnishWorld37(B); furnishExtra37(B);
  W37.finishProps = () => {
    const keep = [], out = [...(B.finish('props37', keep) || []), ...(BOn.finish('lensOn37', keep) || []), ...(BFl.finish('lensFl37', keep) || [])];
    out.forEach(m => m._sortD = 300);
    if (W37.cones) (W37.cones.finish('shafts37', keep) || []).forEach(m => { m._sortD = 2000; m.alwaysSelectAsActiveMesh = false; m.isPickable = false; });
    new Set(keep).forEach(r => r && r.dispose && r.dispose());
  };
}
function pillar37(B, x, z, ceilY) {
  const fh = floorY37(x, z), r = propRoot(x, z, 0); r.position.y = fh; r.computeWorldMatrix(true); const h = ceilY - fh;
  B.add(r, 'Box', { width: 0.9, height: h, depth: 0.9 }, [0.93, 0.97, 0.98], 0, [0, h / 2, 0]);
  B.add(r, 'Box', { width: 0.96, height: 0.06, depth: 0.96 }, COL37.teal, 0, [0, 1.15, 0]); B.add(r, 'Box', { width: 0.96, height: 0.06, depth: 0.96 }, COL37.teal, 0, [0, 0.12, 0]);
  addSolid(x - 0.5, z - 0.5, x + 0.5, z + 0.5, 'prop');
}
function furnishShallows37(B) {
  const SH = LV.dry.sh, ceil = SH.h;
  W37.cones = new PropBatch(coneMat('shafts37', [1, 0.9, 0.6, 0.2])); W37.cones.fast = false;
  for (const [x, y, d] of SLITS37) {
    const r = wallAt37(x, y, d, 0); r.position.y = DECK37; r.computeWorldMatrix(true);
    W37.BOn.add(r, 'Box', { width: 1.5, height: 4.6, depth: 0.04 }, [1, 0.99, 0.88], 1, [0, 2.6, 0.02]);   // the opening, blown out white
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.18, height: 5.0, depth: 0.3 }, [0.92, 0.96, 0.88], 0, [s * 0.84, 2.6, 0.15]);
    B.add(r, 'Box', { width: 1.9, height: 0.22, depth: 0.3 }, [0.92, 0.96, 0.88], 0, [0, 5.0, 0.15]); B.add(r, 'Box', { width: 1.9, height: 0.22, depth: 0.3 }, [0.92, 0.96, 0.88], 0, [0, 0.25, 0.15]);
    const q = pr37(r.position.x + Math.sin(r.rotation.y) * 2.4, r.position.z + Math.cos(r.rotation.y) * 2.4, r.rotation.y + Math.PI, 1.9);
    W37.cones.add(q, 'Box', { width: 1.5, height: 4.2, depth: 5.0 }, [1, 0.94, 0.7, 1], 1, [0, 0, 0], [0.62, 0, 0]);
  }
  for (const P of LV.pil37) addSolid(P.x - 0.5, P.z - 0.5, P.x + 0.5, P.z + 0.5, 'prop');   // the columns themselves are built with the tile meshes
  // the deck: benches, lifeguard chairs, ladders, towels, a ring on its hook
  for (const [x, y, d] of [[28, 27, 3], [31, 27, 3], [39, 27, 3], [42, 27, 3]]) { const r = wallAt37(x, y, d, 0); B.add(r, 'Box', { width: 0.04, height: 0.04, depth: 0.04 }, COL37.white, 0, [0, 0, 0]); placeBench37(B, wallAt37(x, y, d, 0, 0.02)); }
  { const r = pr37(cc37(27) + 1.2, cc37(28) - 0.6, Math.PI * 0.65); F37.guardChair(B, r); addSolid(r.position.x - 0.65, r.position.z - 0.55, r.position.x + 0.65, r.position.z + 0.55, 'prop'); W37.pos.chair1 = { x: r.position.x, z: r.position.z + 1.2 }; }
  { const r = pr37(cc37(42) - 1.2, cc37(42) + 0.4, -Math.PI * 0.35); F37.guardChair(B, r); addSolid(r.position.x - 0.65, r.position.z - 0.55, r.position.x + 0.65, r.position.z + 0.55, 'prop'); }
  for (const [x, y] of [[26.5, 31], [26.5, 38], [43.5, 31], [43.5, 39]]) { const r = pr37(cc37(Math.floor(x)) + (x % 1 < 0.9 ? 0.9 : -0.9), cc37(y), x < 30 ? Math.PI / 2 : -Math.PI / 2); F37.ladder(B, r); }
  // depth marks around the edge, painted on the tile
  for (const [x, y, d, t] of [[34, 27, 3, 'THE SHALLOWS\n0.5 M'], [38, 43, 1, 'PIT\n2.4 M · NO RUNNING'], [26, 30, 2, '0.5 M']]) { const r = wallAt37(x, y, d, 0); sign37(t, twin37(r), [0, 2.6, 0.03], 2.2, 0.55, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' }); }
  sign37('KEEP WALKING\nYOUR FEET ARE FINE', twin37(wallAt37(30, 43, 1, 0)), [0, 3.4, 0.03], 3.2, 0.7, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' });
  // things floating in the water: rings, a beach ball, a kickboard
  for (const [x, z, col] of [[cc37(31), cc37(33), COL37.red], [cc37(38), cc37(35), COL37.yellow], [cc37(30), cc37(40), COL37.blue], [cc37(40), cc37(31), COL37.orange]]) { const n = tnode(null, x, 0, z), m = mkMerged(W37.propMat, P => { P('Torus', { diameter: 0.7, thickness: 0.18, tessellation: 18 }, col, 0, [0, 0.07, 0]); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; P('Box', { width: 0.2, height: 0.19, depth: 0.19 }, COL37.white, 0, [Math.sin(a) * 0.35, 0.07, Math.cos(a) * 0.35], [0, a, 0]); } }, 'ring37'); m.parent = n; floater37(n, BAS37.SH, 0.0); }
  { const n = tnode(null, cc37(36), 0, cc37(32)), m = mkMerged(W37.propMat, P => { P('Sphere', { diameter: 0.5, segments: 10 }, COL37.red, 0, [0, 0.22, 0]); P('Box', { width: 0.51, height: 0.12, depth: 0.51 }, COL37.white, 0, [0, 0.22, 0], null, null); P('Box', { width: 0.12, height: 0.51, depth: 0.51 }, COL37.yellow, 0, [0, 0.22, 0]); }, 'ball37'); m.parent = n; floater37(n, BAS37.SH, -0.02); W37.pos.ball = n; }
  // a few small things on the floor of the pit (they were here before you)
  for (let i = 0; i < 5; i++) { const x = cc37(33 + (i % 3)) + rnd(-0.8, 0.8), z = cc37(40 + Math.floor(i / 3)) + rnd(-0.8, 0.8), r = pr37(x, z, rnd(0, TAU)); B.add(r, 'Box', { width: 0.24, height: 0.025, depth: 0.1 }, pick([COL37.blue, COL37.pink, COL37.yellow]), 0, [0.1 * (i % 2 ? 1 : -1), 0.015, 0]); }
  W37.pos.arrive = { x: cc37(35), z: cc37(31) };
}
function placeBench37(B, r) { F37.bench(B, r, { len: 1.7 }); solidLocal(r, -0.85, 0, 0.85, 0.55); }
function furnishWell37(B) {
  const WELL = LV.dry.well, ceil = WELL.h;
  // diving boards on the north deck (one metre, three metres), the ten-metre tower in the west wall
  for (const [x, h] of [[33, 1.0], [36, 3.0], [39, 1.0]]) {
    const r = pr37(cc37(x), cc37(13) - 0.6, 0, DECK37), bw = 1.5;
    B.add(r, 'Box', { width: bw * 0.7, height: h, depth: 1.5 }, COL37.white, 0, [0, h / 2, -0.3]); B.add(r, 'Box', { width: 0.55, height: 0.07, depth: 3.4 }, [0.86, 0.9, 0.92], 0, [0, h + 0.05, 1.5]);
    B.add(r, 'Box', { width: 0.56, height: 0.01, depth: 3.38 }, COL37.teal, 0, [0, h + 0.1, 1.5]); B.add(r, 'Cylinder', { diameter: 0.05, height: h * 0.5, tessellation: 6 }, COL37.chrome, 0, [-0.42, h + 0.4, -0.3]);
    addSolid(r.position.x - 0.9, r.position.z - 1.0, r.position.x + 0.9, r.position.z + 0.4, 'prop');
    sign37(h + ' M', twin37(wallAt37(x, 13, 3, 0)), [0, 4.2, 0.03], 1.2, 0.5, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' }); }
  // the tower: a solid block with a platform and a railing
  { const T = LV.tower, bx = cc37(T.x), bz = cc37(T.y), r = pr37(bx, bz, 0, T.top);
    B.add(r, 'Box', { width: 3.4, height: 0.2, depth: 3.4 }, [0.9, 0.95, 0.96], 0, [0, 0.1, 0]); for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) B.add(r, 'Cylinder', { diameter: 0.07, height: 1.1, tessellation: 6 }, COL37.chrome, 0, [x, 0.7, z]);
    for (const y of [0.7, 1.15]) { B.add(r, 'Box', { width: 3.2, height: 0.05, depth: 0.05 }, COL37.chrome, 0, [0, y, -1.6]); B.add(r, 'Box', { width: 0.05, height: 0.05, depth: 3.2 }, COL37.chrome, 0, [-1.6, y, 0]); B.add(r, 'Box', { width: 3.2, height: 0.05, depth: 0.05 }, COL37.chrome, 0, [0, y, 1.6]); }
    B.add(r, 'Box', { width: 0.05, height: 0.05, depth: 3.2 }, COL37.chrome, 0, [1.6, 1.15, 0]);   // (the east edge is open: that's where you jump)
    B.add(r, 'Box', { width: 1.2, height: 0.05, depth: 3.2 }, COL37.teal, 0, [1.7, 0.1, 0]);
    // the tower's collision: a ring so nobody walks in at ground level (the east gap is switched off while you are on top)
    const x0 = T.x * CELL, z0 = T.y * CELL; W37.tower = { top: T.top, cx: bx, cz: bz, edge: [addSolid(x0, z0, x0 + CELL, z0 + 0.3, 'tower'), addSolid(x0, z0 + CELL - 0.3, x0 + CELL, z0 + CELL, 'tower'), addSolid(x0, z0, x0 + 0.3, z0 + CELL, 'tower')], gap: addSolid(x0 + CELL - 0.3, z0, x0 + CELL, z0 + CELL, 'tower') };
    for (const i of [...W37.tower.edge, W37.tower.gap]) LV.solids[i].off = false;
    W37.pos.towerBase = { x: bx, z: z0 - 0.7 };
    { const q = pr37(bx, z0 - 0.35, 0, DECK37); F37.ladder(B, q); } }
  // the hatch in the ceiling over the middle of the pool, and the rope that hangs from it
  { const hx = cc37(35) + 0.2, hz = cc37(19), r = pr37(hx, hz, 0, ceil - 0.02);
    B.add(r, 'Cylinder', { diameter: 1.5, height: 0.14, tessellation: 24 }, [0.5, 0.52, 0.52], 0, [0, -0.05, 0]); B.add(r, 'Torus', { diameter: 1.7, thickness: 0.1, tessellation: 24 }, COL37.steel, 0, [0, -0.02, 0]);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 4; B.add(r, 'Box', { width: 0.06, height: 0.05, depth: 1.3 }, COL37.steel, 0, [0, -0.13, 0], [0, a, 0]); }
    B.add(r, 'Cylinder', { diameter: 0.4, height: 0.05, tessellation: 12 }, COL37.red, 0, [0, -0.17, 0]);
    const sg = pr37(hx, hz, 0, ceil - 0.9); sign37('SURFACE', twin37(sg), [0, 0, 0], 1.4, 0.4, { bg: '#1a5a6e', fg: '#f2fafb' }); W37.hatch = { x: hx, z: hz, y: ceil - 0.02, n: r }; }
  for (const [x, y, d, t] of [[35, 14, 3, 'DEEP END\n6.0 M'], [31, 24, 2, '1.1 M']]) sign37(t, twin37(wallAt37(x, y, d, 0)), [0, 5.2, 0.03], 2.4, 0.7, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' });
  sign37('NO DIVING\nNO RUNNING\nNO LIFEGUARD ON DUTY', twin37(wallAt37(41, 21, 0, 0)), [0, 3.0, 0.03], 2.0, 1.0, { bg: '#f4e8d0', fg: '#8a1a14', line: '#8a1a14' });
  { const n = tnode(null, cc37(35) - 1.0, 0, cc37(15)); const m = mkMerged(W37.propMat, P => { P('Torus', { diameter: 0.75, thickness: 0.2, tessellation: 18 }, COL37.red, 0, [0, 0.08, 0]); }, 'ring37b'); m.parent = n; floater37(n, BAS37.WELL, 0); }
  // the channel that leads into the tunnel: a grille and a sign
  sign37('MAINTENANCE\nSWIM THROUGH', twin37(wallAt37(31, 18, 2, 0)), [0, -3.4, 0.03], 1.2, 0.5, { bg: '#2a3a40', fg: '#e8d27a', line: '#e8d27a', emis: 0.7 });
}
function furnishLap37(B) {
  const LAP = LV.dry.lap;
  // lane ropes between the lanes, starting blocks at the west end, backstroke flags
  for (let y = 33; y <= 37; y++) { const n = tnode(null, 0, 0, y * CELL), len = (65 - 46 + 1) * CELL, m = mkMerged(W37.propMat, P => { P('Cylinder', { diameter: 0.045, height: len, tessellation: 5 }, COL37.white, 0, [(46 * CELL + 65 * CELL + CELL) / 2, 0.02, 0], [0, 0, Math.PI / 2]);
      for (let i = 0; i < len / 0.55; i++) P('Cylinder', { diameter: 0.1, height: 0.1, tessellation: 8 }, i % 6 < 3 ? COL37.red : COL37.blue, 0, [46 * CELL + 0.2 + i * 0.55, 0.03, 0], [0, 0, Math.PI / 2]); }, 'rope37'); m.parent = n; n.position.x = 0; n.position.z = y * CELL; m.position.z = 0; floater37(n, BAS37.LAP, 0.0); n.__rope = true; W37.bob[W37.bob.length - 1].x = 0; }
  for (let y = 32; y <= 37; y++) { const r = pr37(45.0 * CELL + 1.5, cc37(y), -Math.PI / 2, DECK37); B.add(r, 'Box', { width: 0.7, height: 0.7, depth: 0.7 }, [0.9, 0.95, 0.96], 0, [0, 0.35, 0]); B.add(r, 'Box', { width: 0.7, height: 0.05, depth: 0.7 }, COL37.teal, 0, [0, 0.72, 0], [0.12, 0, 0]); B.add(r, 'Box', { width: 0.7, height: 0.1, depth: 0.03 }, COL37.black, 0, [0, 0.45, 0.35]);
    const q = tnode(null, 45 * CELL + 0.2, 0, cc37(y)); }
  for (let i = 0; i < 7; i++) { const x = 46 * CELL + i * 3 * CELL; for (const z of [31 * CELL + 0.3, 38 * CELL + 3.3]) { const r = pr37(x, z, 0, DECK37); sign37(['0', '5', '10', '15', '20', '25', '30'][i] + ' M', twin37(r), [0, 0.01, 0], 0.7, 0.28, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' }); } }
  for (let x = 47; x <= 64; x += 6) { const r = wallAt37(x, 31, 3, 0); sign37('LAP SWIMMING ONLY', twin37(r), [0, 3.4, 0.03], 3.2, 0.5, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' }); }
  for (const x of [48, 54, 60]) placeBench37(B, wallAt37(x, 38, 1, 0, 0.02));
  for (const [x, y] of [[46, 38], [58, 38]]) F37.ladder(B, pr37(cc37(x) + 1.2, y * CELL + 0.2, Math.PI, DECK37));
  // the far end: the tunnel and its warnings
  { const r = wallAt37(65, 34, 0, 0); r.position.y = -1.5; r.computeWorldMatrix(true); sign37('NO ENTRY\nSTAFF ONLY', twin37(r), [0, 2.35, 0.03], 1.8, 0.7, { bg: '#f4e8d0', fg: '#8a1a14', line: '#8a1a14' }); W37.pos.tunnelW = { x: 65 * CELL + 1.0, z: cc37(34) }; }
  for (let i = 0; i < 3; i++) { const n = tnode(null, cc37(50 + i * 4), 0, cc37(32 + i * 2)), m = mkMerged(W37.propMat, P => { P('Box', { width: 0.3, height: 0.05, depth: 0.7 }, [COL37.yellow, COL37.pink, COL37.blue][i], 0, [0, 0.02, 0]); }, 'board37'); m.parent = n; floater37(n, BAS37.LAP, 0); }
  W37.pos.lapStart = { x: 45 * CELL + 2.4, z: cc37(34) };
}
function furnishCabana37(B) {
  const C = LV.dry.cab, X0 = 20 * CELL, Z0 = 31 * CELL;
  for (let i = 0; i < 2; i++) { const r = wallAt37(20, 32 + i * 3, 2, 0); F37.locker(B, r, { n: 3, col: i ? [0.4, 0.6, 0.62] : [0.46, 0.5, 0.62] }); solidLocal(r, -0.65, 0, 0.65, 0.5); }
  { const r = wallAt37(20, 35, 2, 0.4); F37.locker(B, r, { n: 3, col: [0.5, 0.42, 0.4] }); solidLocal(r, -0.65, 0, 0.65, 0.5); W37.pos.lockers = { x: r.position.x + 0.6, z: r.position.z + 0.2 }; }
  for (let i = 0; i < 3; i++) { const r = wallAt37(21 + i * 2 - (i === 2 ? 0 : 0), 31, 3, 0); F37.shower(B, wallAt37(21 + i, 31, 3, 0, 0.0)); }
  placeBench37(B, wallAt37(22, 38, 1, 0, 0.02)); placeBench37(B, wallAt37(24, 38, 1, 0, 0.02));
  F37.towelRack(B, wallAt37(25, 33, 0, 0)); F37.towelRack(B, wallAt37(25, 37, 0, 0));
  { const r = wallAt37(25, 31, 0, 0.5); F37.vending(B, r); solidLocal(r, -0.5, 0, 0.5, 0.85); W37.pos.vend = { x: r.position.x - 0.7, z: r.position.z + 0.2 }; }
  sign37('CABANA\nCHANGING ROOMS', twin37(wallAt37(26, 35, 2, -2.0)), [0, 2.3, 0.03], 1.8, 0.6, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' });
  sign37('PLEASE SHOWER\nBEFORE ENTERING THE WATER', twin37(wallAt37(22, 31, 3, 0)), [0, 2.55, 0.03], 2.4, 0.6, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' });
  // the bulletin board
  { const r = wallAt37(23, 38, 1, 0.5); B.add(r, 'Box', { width: 1.5, height: 1.0, depth: 0.04 }, COL37.wood, 0, [0, 1.5, 0.02]); B.add(r, 'Box', { width: 1.4, height: 0.9, depth: 0.012 }, [0.55, 0.38, 0.2], 0, [0, 1.5, 0.045]);
    for (let i = 0; i < 6; i++) B.add(r, 'Box', { width: 0.2, height: 0.26, depth: 0.004 }, pick([COL37.white, COL37.cream, COL37.yellow, COL37.pink]), 0, [-0.55 + i * 0.22, 1.5 + rnd(-0.15, 0.15), 0.052]); W37.pos.board = { x: r.position.x, z: r.position.z - 0.8, r }; }
  // the camp: a cot, a lantern, a kettle, a rolled hazmat suit; this is where she lives
  { const r = pr37(cc37(22) + 0.6, cc37(35) + 1.5, 0.5, DECK37);
    B.add(r, 'Box', { width: 0.7, height: 0.05, depth: 1.8 }, [0.35, 0.4, 0.3], 0, [0, 0.36, 0]); for (const x of [-0.3, 0.3]) for (const z of [-0.8, 0.8]) B.add(r, 'Box', { width: 0.04, height: 0.34, depth: 0.04 }, COL37.steel, 0, [x, 0.17, z]);
    B.add(r, 'Box', { width: 0.55, height: 0.1, depth: 0.7 }, [0.84, 0.8, 0.68], 0, [0, 0.45, 0.55]); B.add(r, 'Box', { width: 0.7, height: 0.06, depth: 1.0 }, COL37.orange, 0, [0, 0.42, -0.2]);
    addSolid(r.position.x - 0.5, r.position.z - 1.0, r.position.x + 0.5, r.position.z + 1.0, 'prop'); }
  { const r = pr37(cc37(24) - 0.2, cc37(33) + 0.2, 0, DECK37); B.add(r, 'Cylinder', { diameter: 0.6, height: 0.04, tessellation: 12 }, COL37.wood, 0, [0, 0.45, 0]); B.add(r, 'Cylinder', { diameter: 0.05, height: 0.45, tessellation: 6 }, COL37.steel, 0, [0, 0.22, 0]); B.add(r, 'Cylinder', { diameter: 0.22, height: 0.18, tessellation: 12 }, COL37.steel, 0, [-0.1, 0.56, 0.05]);
    W37.BOn.add(r, 'Cylinder', { diameter: 0.1, height: 0.2, tessellation: 8 }, [1, 0.8, 0.5], 0.7, [0.14, 0.58, -0.05]); addSolid(r.position.x - 0.35, r.position.z - 0.35, r.position.x + 0.35, r.position.z + 0.35, 'prop'); W37.pos.kettle = { x: r.position.x, z: r.position.z, y: 0.6 }; }
  W37.pos.abara = { x: cc37(23) + 0.2, z: cc37(36) - 0.4 }; W37.pos.camp = { x: cc37(22) + 0.2, z: cc37(34) };
}
function furnishPlant37(B) {
  const P = LV.dry.plant, I = COL37.steel, R = COL37.rust, X0 = 8 * CELL, Z0 = 29 * CELL;
  // three big pumps, each with its own gate wheel and gauge on the wall opposite
  W37.gates = [];
  const defs = [{ id: 'sh', name: 'SHALLOWS', x: 10, basin: BAS37.SH, low: -2.7 }, { id: 'well', name: 'DIVE WELL', x: 14, basin: BAS37.WELL, low: -6.3 }, { id: 'lap', name: 'LAP POOL', x: 18, basin: BAS37.LAP, low: -1.65 }];
  defs.forEach((g, i) => {
    const px = cc37(g.x) - 0.2, pz = cc37(31) + 1.0, r = pr37(px, pz, 0, DECK37);
    B.add(r, 'Cylinder', { diameter: 1.5, height: 1.2, tessellation: 18 }, [0.3, 0.42, 0.44], 0, [0, 0.7, 0], [Math.PI / 2, 0, 0], null); B.add(r, 'Box', { width: 1.9, height: 0.4, depth: 1.5 }, I, 0, [0, 0.2, 0]);
    B.add(r, 'Cylinder', { diameter: 0.45, height: 1.0, tessellation: 12 }, I, 0, [0.9, 1.05, 0], [0, 0, 0]); B.pipe([px + 0.9, 1.6, pz], [px + 0.9, 3.9, pz], 0.2, R); B.pipe([px + 0.9, 3.9, pz], [px + 0.9, 3.9, pz - 3.5], 0.2, R);
    addSolid(px - 1.0, pz - 0.8, px + 1.0, pz + 0.8, 'prop');
    const wr = wallAt37(g.x, 38, 1, 0); const k = twin37(wr);
    B.add(wr, 'Box', { width: 0.9, height: 1.0, depth: 0.06 }, [0.22, 0.24, 0.24], 0, [0, 1.5, 0.03]); B.add(wr, 'Cylinder', { diameter: 0.14, height: 0.3, tessellation: 10 }, I, 0, [0, 1.5, 0.2], [Math.PI / 2, 0, 0]);
    sign37(g.name + '\nGATE', k, [0, 2.3, 0.03], 0.9, 0.42, { bg: '#2a3a40', fg: '#e8d27a', line: '#e8d27a', emis: 0.45 });
    const wheel = mkMerged(W37.propMat, P => { P('Torus', { diameter: 0.6, thickness: 0.05, tessellation: 22 }, [0.7, 0.08, 0.05], 0, [0, 0, 0], [Math.PI / 2, 0, 0]); for (let j = 0; j < 3; j++) P('Box', { width: 0.58, height: 0.03, depth: 0.03 }, [0.7, 0.08, 0.05], 0, [0, 0, 0], [0, 0, j * Math.PI / 3]); P('Cylinder', { diameter: 0.1, height: 0.07, tessellation: 10 }, I, 0, [0, 0, 0], [Math.PI / 2, 0, 0]); }, 'wheel37');
    const wp = localPt(wr, 0, 1.5, 0.34); wheel.position.copyFrom(wp); wheel.rotation.y = wr.rotation.y;
    // a gauge needle over the wheel
    const gp = localPt(wr, 0.28, 1.9, 0.07), gm = mkMerged(W37.propMat, P => { P('Cylinder', { diameter: 0.2, height: 0.02, tessellation: 18 }, [0.9, 0.9, 0.84], 0, [0, 0, 0], [Math.PI / 2, 0, 0]); }, 'gauge37'); gm.position.copyFrom(gp); gm.rotation.y = wr.rotation.y;
    const nd = tnode(null, gp.x, gp.y, gp.z); nd.rotation.y = wr.rotation.y; const needle = mkMerged(W37.propMat, P => { P('Box', { width: 0.012, height: 0.09, depth: 0.006 }, [0.7, 0.05, 0.03], 0.2, [0, 0.04, 0.012]); }, 'needle37'); needle.parent = nd;
    const p = localPt(wr, 0, 1.2, 0.9); W37.gates.push(Object.assign(g, { mesh: wheel, needle, x: p.x, z: p.z, y: 1.4, ang: 0, busy: false }));
  });
  // the pump room's other furniture: a desk with the plant log, a locker, a cart, hoses
  { const r = wallAt37(11, 29, 3, 0); B.add(r, 'Box', { width: 1.4, height: 0.05, depth: 0.7 }, COL37.wood2, 0, [0, 0.76, 0.4]); for (const x of [-0.62, 0.62]) B.add(r, 'Box', { width: 0.05, height: 0.74, depth: 0.6 }, COL37.wood, 0, [x, 0.37, 0.4]); solidLocal(r, -0.75, 0, 0.75, 0.8);
    B.add(r, 'Box', { width: 0.3, height: 0.03, depth: 0.22 }, [0.18, 0.28, 0.4], 0, [0, 0.8, 0.4]); W37.pos.plantLog = { x: r.position.x, z: r.position.z + 0.9, y: 0.82 }; }
  for (const [x, y] of [[13, 29], [16, 29]]) F37.locker(B, wallAt37(x, y, 3, 0), { n: 3, col: [0.34, 0.4, 0.4] });
  for (let i = 0; i < 4; i++) B.pipe([8 * CELL + 0.3, 3.6 + i * 0.18, 29 * CELL + 1 + i * 8], [20 * CELL - 0.3, 3.6 + i * 0.18, 29 * CELL + 1 + i * 8], 0.08 + 0.02 * (i % 2), i % 2 ? R : I);
  sign37('PLANT\nAUTHORISED STAFF ONLY', twin37(wallAt37(19, 34, 0, 0)), [0, 2.4, 0.03], 1.6, 0.6, { bg: '#2a3a40', fg: '#e8d27a', line: '#e8d27a', emis: 0.45 });
  for (let i = 0; i < 6; i++) { const r = pr37(8 * CELL + rnd(1, 11 * CELL - 1), 29 * CELL + rnd(5, 9.5 * CELL - 1), rnd(0, TAU), DECK37); B.add(r, 'Box', { width: rnd(0.5, 1.2), height: 0.003, depth: rnd(0.4, 0.9) }, [0.2, 0.3, 0.32], 0, [0, 0.003, 0]); }
}
function furnishBooth37(B) {
  const bx = 42 * CELL, bz = 16 * CELL;
  // the desk with the monitor, the CRT and the VCR; a panel with three slots in the wall
  { const r = wallAt37(44, 16, 3, 0); B.add(r, 'Box', { width: 2.4, height: 0.05, depth: 0.8 }, COL37.wood2, 0, [0, 0.76, 0.45]); for (const x of [-1.1, 1.1]) B.add(r, 'Box', { width: 0.06, height: 0.74, depth: 0.7 }, COL37.wood, 0, [x, 0.37, 0.45]); solidLocal(r, -1.25, 0, 1.25, 0.9);
    B.add(r, 'Box', { width: 0.7, height: 0.56, depth: 0.6 }, [0.62, 0.6, 0.55], 0, [-0.6, 1.07, 0.4]); B.add(r, 'Box', { width: 0.54, height: 0.4, depth: 0.02 }, [0.05, 0.06, 0.08], 0.1, [-0.6, 1.09, 0.71]);
    B.add(r, 'Box', { width: 0.6, height: 0.1, depth: 0.5 }, [0.12, 0.12, 0.13], 0, [0.35, 0.84, 0.5]); B.add(r, 'Box', { width: 0.34, height: 0.03, depth: 0.012 }, [0.03, 0.03, 0.03], 0, [0.35, 0.86, 0.76]); B.add(r, 'Box', { width: 0.02, height: 0.02, depth: 0.015 }, [1, 0.1, 0.05], 0.3, [0.58, 0.87, 0.76]);
    W37.pos.tv = { x: r.position.x - 0.6 + 0, z: r.position.z + 1.3, y: 1.1, r, vx: 0.35 }; W37.pos.deskB = { x: r.position.x, z: r.position.z + 1.2 }; W37.pos.tvRoot = r; }
  { const r = wallAt37(42, 20, 2, 0); B.add(r, 'Box', { width: 1.0, height: 1.2, depth: 0.1 }, [0.26, 0.28, 0.28], 0, [0, 1.4, 0.05]); W37.pos.panelR = r; W37.pos.panel = { x: r.position.x + Math.sin(r.rotation.y) * 0.9, z: r.position.z + Math.cos(r.rotation.y) * 0.9 }; }
  { const r = pr37(bx + 1.2, bz + 3.5, 2.6, DECK37); B.add(r, 'Cylinder', { diameter: 0.4, height: 0.05, tessellation: 12 }, COL37.black, 0, [0, 0.5, 0]); B.add(r, 'Cylinder', { diameter: 0.05, height: 0.5, tessellation: 6 }, COL37.steel, 0, [0, 0.25, 0]); B.add(r, 'Box', { width: 0.4, height: 0.55, depth: 0.06 }, COL37.black, 0, [0, 0.82, -0.2]); addSolid(r.position.x - 0.3, r.position.z - 0.3, r.position.x + 0.3, r.position.z + 0.3, 'prop'); }
  { const r = wallAt37(45, 19, 0, 0); B.add(r, 'Box', { width: 1.1, height: 1.9, depth: 0.5 }, COL37.wood, 0, [0, 0.95, 0.25]); for (const y of [0.55, 1.1, 1.65]) B.add(r, 'Box', { width: 1.0, height: 0.03, depth: 0.46 }, COL37.wood2, 0, [0, y, 0.25]); solidLocal(r, -0.6, 0, 0.6, 0.55); }
  sign37('LIFEGUARD\nCONTROL', twin37(wallAt37(41, 18, 0, -1.9)), [0, 2.3, 0.03], 1.6, 0.6, { bg: '#e9f6f8', fg: '#17607a', line: '#17607a' });
  // the window onto the Dive Well (a pane of glass in a frame)
  { const r = wallAt37(42, 20, 2, -0.3); }
}
// the Pump Room and booth interactions live in story37.js; the wings' furniture lives in wings37.js
