// ---------- r9 / r11 · Level 2 furnishing: lamp fittings, pipe racks, the boiler house, the switchgear hall, the rooms ----------
// r11: everything solid is modelled through kit2.js (lit by the ray-traced bake); glowing glass stays on the emissive prop batches.
const PC2 = {   // tints for the prop shader (squared there): paint colours, metals
  green: [0.33, 0.45, 0.36], grey: [0.5, 0.52, 0.5], dgrey: [0.3, 0.31, 0.3], blue: [0.26, 0.36, 0.5], red: [0.62, 0.16, 0.1], yellow: [0.82, 0.62, 0.1], orange: [0.85, 0.4, 0.1], cream: [0.78, 0.74, 0.6],
  alu: [0.78, 0.79, 0.77], black: [0.12, 0.12, 0.12], white: [0.85, 0.85, 0.82], wood: [0.55, 0.4, 0.26], brass: [0.75, 0.58, 0.3], copper: [0.75, 0.45, 0.3], conc: [0.62, 0.6, 0.56], rust: [0.5, 0.36, 0.28], steel: [0.6, 0.62, 0.63], olive: [0.42, 0.45, 0.32] };
const pp2 = (k, m) => { const c = PC2[k] || k; return pc2(Array.isArray(c) ? c : PC2.grey, PM2[m] ?? m); };
// emissive bits (lamp glass, indicators) ride on the old emissive prop batches at a frame's position and yaw
function emi2(B, T, kind, opts, rgb, pos, rot) { const r = propRoot(T.o[0], T.o[2], Math.atan2(T.z[0], T.z[2])); r.position.y = T.o[1]; r.computeWorldMatrix(true); B.add(r, kind, opts, rgb, 0.9, pos, rot); return r; }
function pr2(x, z, ry = 0, y = 0) { const r = propRoot(x, z, ry); r.position.y = y; r.computeWorldMatrix(true); return r; }
function wallAt2(x, y, d, along = 0, off = 0.005) { const [px, pz, ry] = wallPt(x, y, d, off, along); return propRoot(px, pz, ry); }
function wallT2(x, y, d, along = 0, off = 0, yy = 0) { const [px, pz, ry] = wallPt(x, y, d, off, along); return k2T(px, yy, pz, ry); }
const cc2 = v => cellCenter(v);
const COL2 = { rust: [0.38, 0.2, 0.11], iron: [0.2, 0.2, 0.21], steel: [0.42, 0.43, 0.44], grey: [0.5, 0.5, 0.48], cream: [0.78, 0.74, 0.62], insul: [0.72, 0.7, 0.62], red: [0.62, 0.1, 0.06], yellow: [0.82, 0.62, 0.08], green: [0.18, 0.4, 0.26],
  black: [0.04, 0.04, 0.045], wood: [0.42, 0.29, 0.18], olive: [0.33, 0.36, 0.26], meg: [0.78, 0.46, 0.12], white: [0.82, 0.82, 0.78], copper: [0.62, 0.36, 0.2], brass: [0.66, 0.52, 0.24], blue: [0.16, 0.28, 0.46] };
function solidAround2(x, z, hx, hz) { addSolid(x - hx, z - hz, x + hx, z + hz, 'prop'); }
function solidT2(T, x0, z0, x1, z1) { const P = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([a, b]) => k2P(T, a, 0, b)); return addSolid(Math.min(...P.map(p => p[0])), Math.min(...P.map(p => p[2])), Math.max(...P.map(p => p[0])), Math.max(...P.map(p => p[2])), 'prop'); }
function localArr(r, x, y, z) { const q = localPt(r, x, y, z); return [q.x, q.y, q.z]; }
const v3 = a => ({ x: a[0], y: a[1], z: a[2] });

// ================= the parts catalogue =================
const F2 = {
  // a cast bulkhead lamp on the wall: base plate, oval glass, a cast cage (T: wall frame, y = mount height)
  bulkhead(T, f) {
    k2Box(k2Sub(T, 0, 0, 0.04), [0.3, 0.2, 0.08], pp2('dgrey', 'paint'), { bevel: 0.02 });
    const L = f.on ? (f.flick ? WP2.BFl : WP2.BOn) : WP2.B;
    emi2(L, k2Sub(T, 0, 0, 0.1), 'Sphere', { diameter: 0.2, segments: 12 }, f.on ? [1, 0.88, 0.62] : [0.25, 0.24, 0.2], [0, 0, 0], null).scaling.set(1.3, 0.85, 0.7);
    for (const y of [-0.06, 0.06]) k2Box(k2Sub(T, 0, y, 0.16), [0.26, 0.02, 0.02], pp2('dgrey', 'paint'), { bevel: 0.005, occ: false });
    k2Torus(k2Sub(T, 0, 0, 0.09, Math.PI / 2, 0, 0), 0.14, 0.012, 16, 6, pc2(PC2.dgrey, PM2.paint), { occ: false });
    k2Pipe(k2P(T, 0.15, 0, 0.04), k2P(T, 0.4, 0, 0.04), 0.012, pp2('steel', 'steel'), { seg: 6 });
  },
  // a high-bay lamp: spun-aluminium reflector, the gear box, a drop rod to the roof
  highbay(T, f) {
    k2Lathe(T, [[0.02, 0.32], [0.09, 0.3], [0.14, 0.22], [0.26, 0.06], [0.36, -0.06], [0.37, -0.1]], 20, pp2('alu', 'steel'), { occ: false });
    k2Lathe(T, [[0.355, -0.095], [0.3, -0.08], [0.2, 0.0], [0.08, 0.18]], 20, pp2('alu', 'steel'), { occ: false });
    k2Box(k2Sub(T, 0, 0.45, 0), [0.3, 0.22, 0.22], pp2('dgrey', 'paint'), { bevel: 0.015 });
    k2Pipe(k2P(T, 0, 0.56, 0), [T.o[0], f.top - 0.05, T.o[2]], 0.02, pp2('steel', 'steel'), { seg: 6 });
    emi2(f.flick ? WP2.BFl : WP2.BOn, k2Sub(T, 0, -0.08, 0), 'Cylinder', { diameter: 0.62, height: 0.03, tessellation: 20 }, [1, 0.78, 0.5]);
  },
  // a twin-tube fluorescent: steel housing, opal diffuser, chains or a surface mount
  fluo(T, f) {
    const L = f.len || 1.5;
    k2Box(T, [L, 0.08, 0.2], pp2('white', 'plastic'), { bevel: 0.01 });
    emi2(f.flick ? WP2.BFl : WP2.BOn, k2Sub(T, 0, -0.05, 0), 'Box', { width: L - 0.06, height: 0.025, depth: 0.15 }, [0.9, 0.96, 1]);
    if (!f.surface) for (const s of [-1, 1]) k2Pipe(k2P(T, s * L * 0.4, 0.04, 0), [k2P(T, s * L * 0.4, 0, 0)[0], f.top - 0.02, k2P(T, s * L * 0.4, 0, 0)[2]], 0.006, pp2('steel', 'steel'), { seg: 4, occ: false });
  },
  // a caged bulb hanging from a conduit box
  cage(T, f, col) {
    k2Cyl(k2Sub(T, 0, 0.12, 0), 0.06, -0.04, 0.05, 12, pp2('dgrey', 'paint'));
    const L = col === 'red' ? WP2.BRed : col === 'green' ? WP2.BGrn : f.flick ? WP2.BFl : WP2.BOn;
    emi2(L, T, 'Sphere', { diameter: 0.13, segments: 10 }, col === 'red' ? [1, 0.3, 0.2] : col === 'green' ? [0.4, 1, 0.5] : [1, 0.9, 0.7], [0, 0, 0]);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; k2Pipe(k2P(T, Math.cos(a) * 0.075, 0.1, Math.sin(a) * 0.075), k2P(T, Math.cos(a) * 0.08, -0.1, Math.sin(a) * 0.08), 0.005, pp2('dgrey', 'paint'), { seg: 4, occ: false }); }
    k2Torus(T, 0.08, 0.006, 16, 4, pp2('dgrey', 'paint'));
    k2Pipe(k2P(T, 0, 0.17, 0), [T.o[0], (f.top || T.o[1] + 0.5), T.o[2]], 0.012, pp2('steel', 'steel'), { seg: 6, occ: false });
  },
  // a pipe phone in a cast box, a handset on a hook, the bell on top
  phone(T) {
    k2Box(k2Sub(T, 0, 1.35, 0.09), [0.34, 0.5, 0.16], pp2([0.36, 0.4, 0.3], 'paint'), { bevel: 0.025 });
    k2Box(k2Sub(T, 0.21, 1.38, 0.15), [0.07, 0.3, 0.07], pp2('black', 'rubber'), { bevel: 0.02 });
    k2Lathe(k2Sub(T, 0, 1.66, 0.12, Math.PI / 2, 0, 0), [[0, -0.03], [0.07, -0.02], [0.075, 0.02], [0, 0.03]], 16, pp2('brass', 'brass'));
    k2Box(k2Sub(T, 0, 1.47, 0.172), [0.22, 0.06, 0.01], pp2('white', 'paper'), { bevel: 0.002, occ: false });
    k2Pipe(k2P(T, 0, 1.1, 0.06), k2P(T, 0, 0.0, 0.06), 0.022, pp2('black', 'steel'));
  },
  gauge(T, y = 1.3) {
    k2Lathe(k2Sub(T, 0, y, 0.035, Math.PI / 2, 0, 0), [[0, -0.035], [0.13, -0.035], [0.135, 0.0], [0.13, 0.03], [0, 0.03]], 20, pp2('brass', 'brass'), { occ: false });
    k2Disc(k2Sub(T, 0, y, 0.035, Math.PI / 2, 0, 0), 0.115, 0.031, 1, 20, pp2('white', 'paper'));
    k2Box(k2Sub(T, 0.02, y + 0.02, 0.07, 0, 0, rnd(-1.4, 1.4)), [0.01, 0.09, 0.006], pp2('red', 'plastic'), { bevel: 0.002, occ: false });
    k2Pipe(k2P(T, 0, y - 0.14, 0.035), k2P(T, 0, y - 0.32, 0.035), 0.012, pp2('brass', 'brass'), { seg: 6 });
  },
  wheel(T, col = 'red', r = 0.28) {   // a handwheel facing local +z
    const W = k2Sub(T, 0, 0, 0, Math.PI / 2, 0, 0);
    k2Torus(W, r, 0.025, 24, 8, pp2(col, 'paint'));
    for (let j = 0; j < 3; j++) { const a = j * Math.PI / 3; k2Pipe(k2P(W, Math.cos(a) * r, 0, Math.sin(a) * r), k2P(W, -Math.cos(a) * r, 0, -Math.sin(a) * r), 0.012, pp2(col, 'paint'), { seg: 6 }); }
    k2Cyl(W, 0.045, -0.04, 0.04, 12, pp2('steel', 'steel'));
  },
  // a gate valve: body, bonnet, stem, handwheel (axis up)
  gate(T, r = 0.12, col = 'red') {
    k2Lathe(T, [[0, -r * 1.3], [r * 1.1, -r * 1.3], [r * 1.35, -r * 0.6], [r * 1.35, r * 0.6], [r * 1.1, r * 1.3], [r * 0.6, r * 1.6], [r * 0.6, r * 2.6], [0, r * 2.6]], 16, pp2('dgrey', 'paint'));
    k2Pipe(k2P(T, 0, r * 2.6, 0), k2P(T, 0, r * 4.4, 0), 0.02, pp2('steel', 'steel'), { seg: 6 });
    F2.wheel(k2Sub(T, 0, r * 4.2, 0, -Math.PI / 2, 0, 0), col, r * 1.6);
  },
  // a regulator manifold on the wall: two fat mains into a globe body, gauges, a big wheel (T: wall frame)
  manifold(T, wheel = true) {
    k2Box(k2Sub(T, 0, 1.0, 0.3), [1.9, 1.55, 0.5], pp2('dgrey', 'paint'), { bevel: 0.03 });
    k2Lathe(k2Sub(T, 0, 1.25, 0.62, Math.PI / 2, 0, 0), [[0, -0.42], [0.3, -0.42], [0.42, -0.2], [0.44, 0.15], [0.3, 0.38], [0.12, 0.42], [0, 0.42]], 24, pp2('rust', 'rust'));
    for (const s of [-1, 1]) { k2Pipe(k2P(T, s * 0.42, 1.25, 0.55), k2P(T, s * 1.6, 1.25, 0.55), 0.17, pp2('grey', 'paint'), { flange: true, fcol: pp2('dgrey', 'paint') }); k2Pipe(k2P(T, s * 1.6, 1.25, 0.55), k2P(T, s * 1.6, 1.25, 0.0), 0.17, pp2('grey', 'paint')); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; k2Cyl(k2Sub(T, Math.cos(a) * 0.38, 1.25 + Math.sin(a) * 0.38, 0.98, Math.PI / 2, 0, 0), 0.025, -0.02, 0.03, 6, pp2('steel', 'steel'), { occ: false }); }
    F2.gauge(k2Sub(T, -0.6, 0, 0.56), 2.0); F2.gauge(k2Sub(T, 0.6, 0, 0.56), 2.0);
    k2Pipe(k2P(T, 0, 1.25, 1.0), k2P(T, 0, 1.25, 1.12), 0.04, pp2('steel', 'steel'));
    return 0.9;
  },
  // switchgear: one section of a metal-clad lineup (front along local +z)
  switchgear(T, i, lit) {
    k2Box(k2Sub(T, 0, 1.15, 0), [0.8, 2.3, 0.95], pp2([0.42, 0.47, 0.44], 'paint'), { bevel: 0.012, step: 0.5 });
    for (const [y, h] of [[1.75, 0.9], [0.75, 0.95]]) { k2Box(k2Sub(T, 0, y, 0.485), [0.72, h, 0.02], pp2([0.44, 0.49, 0.46], 'paint'), { bevel: 0.008, occ: false }); k2Box(k2Sub(T, 0.27, y, 0.51), [0.03, 0.16, 0.03], pp2('black', 'rubber'), { bevel: 0.008, occ: false }); }
    k2Lathe(k2Sub(T, -0.15, 1.95, 0.5, Math.PI / 2, 0, 0), [[0, 0], [0.07, 0], [0.075, 0.03], [0, 0.03]], 14, pp2('black', 'plastic'), { occ: false });
    k2Disc(k2Sub(T, -0.15, 1.95, 0.53, Math.PI / 2, 0, 0), 0.06, 0, 1, 14, pp2('white', 'paper'));
    k2Box(k2Sub(T, 0, 2.18, 0.5), [0.5, 0.07, 0.01], pp2('white', 'paper'), { bevel: 0.002, occ: false });
    if (lit) { const r = emi2(i % 3 ? WP2.BGrn : WP2.BRed, k2Sub(T, 0.12, 1.95, 0.5), 'Cylinder', { diameter: 0.035, height: 0.02, tessellation: 8 }, i % 3 ? [0.4, 1, 0.5] : [1, 0.3, 0.2], [0, 0, 0], [Math.PI / 2, 0, 0]); }
  },
  transformer(T) {
    k2Box(k2Sub(T, 0, 1.25, 0), [2.0, 2.3, 1.4], pp2([0.4, 0.45, 0.4], 'paint'), { bevel: 0.03 });
    for (let i = 0; i < 9; i++) k2Box(k2Sub(T, -0.88 + i * 0.22, 1.1, 0.78), [0.03, 1.8, 0.16], pp2([0.38, 0.43, 0.38], 'paint'), { bevel: 0.005 });
    for (let i = 0; i < 9; i++) k2Box(k2Sub(T, -0.88 + i * 0.22, 1.1, -0.78), [0.03, 1.8, 0.16], pp2([0.38, 0.43, 0.38], 'paint'), { bevel: 0.005 });
    for (const s of [-0.55, 0, 0.55]) { k2Lathe(k2Sub(T, s, 2.4, 0.3), [[0.07, 0], [0.11, 0.05], [0.07, 0.1], [0.11, 0.15], [0.07, 0.2], [0.1, 0.25], [0.05, 0.38], [0, 0.38]], 14, pp2('brass', 'brass')); }
    k2Box(k2Sub(T, 0, 0.06, 0), [2.2, 0.12, 1.6], pp2('dgrey', 'rust'), { bevel: 0.02 });
  },
  // a steel bench, a first-aid box: the refuges
  bench(T, w = 1.4) { k2Box(k2Sub(T, 0, 0.46, 0.22), [w, 0.05, 0.4], pp2([0.45, 0.47, 0.44], 'paint'), { bevel: 0.01 }); for (const s of [-1, 1]) k2Box(k2Sub(T, s * (w / 2 - 0.08), 0.22, 0.22), [0.05, 0.44, 0.36], pp2('dgrey', 'paint'), { bevel: 0.008 }); },
  crate(T, s = 1) { const r = pr2(T.o[0], T.o[2], Math.atan2(T.z[0], T.z[2]) + rnd(-0.3, 0.3), T.o[1]); if (!WP2.B.mdl('crate', r, [0, 0, 0], [0, 0, 0], 0.85 * s)) k2Box(k2Sub(T, 0, 0.3 * s, 0), [0.7 * s, 0.6 * s, 0.6 * s], pp2('wood', 'wood'), { bevel: 0.02 }); },
  barrel(T, col) { const r = pr2(T.o[0], T.o[2], rnd(0, 6), T.o[1]); if (!WP2.B.mdl('barrel', r, [0, 0, 0], [0, 0, 0], 0.95)) k2Lathe(T, [[0, 0], [0.28, 0], [0.29, 0.03], [0.29, 0.3], [0.3, 0.32], [0.29, 0.34], [0.29, 0.58], [0.3, 0.6], [0.29, 0.62], [0.29, 0.86], [0.27, 0.88], [0, 0.88]], 20, pp2(col || 'blue', 'paint')); },
  shelf(T, w = 1.2, h = 1.9, d = 0.45, n = 4) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) k2Extrude(k2P(T, sx * (w / 2 - 0.02), 0, d / 2 + sz * (d / 2 - 0.02)), k2P(T, sx * (w / 2 - 0.02), h, d / 2 + sz * (d / 2 - 0.02)), PROF2.angle(0.035), pp2('grey', 'paint'), { occ: false });
    for (let i = 0; i < n; i++) k2Box(k2Sub(T, 0, 0.15 + i * (h - 0.25) / (n - 1), d / 2), [w, 0.025, d], pp2('grey', 'paint'), { bevel: 0.005 });
  },
};

// ================= assembly =================
function buildProps2() {
  const mat = actMat('props2', { spec: 0.4, shin: 26, wrinkle: 0.15, emis: 1, wrap: 0.35, mottle: 0.35 }), B = new PropBatch(mat); B.fast = true;
  W9.propMat = mat; WP2.propMat = mat;
  const on = actMat('lensOn2', { emis: 1 }), fl = actMat('lensFl2', { emis: 1 }), red = actMat('lensRed2', { emis: 1 }), grn = actMat('lensGrn2', { emis: 1 }); setEmi(on, 3.0); setEmi(red, 3.2, 0.5, 0.3); setEmi(grn, 0.6, 3.0, 0.8); WP2.lensFl = fl; WP2.red = red; WP2.grn = grn;
  const BOn = new PropBatch(on), BFl = new PropBatch(fl), BRed = new PropBatch(red), BGrn = new PropBatch(grn); for (const b of [BOn, BFl, BRed, BGrn]) b.fast = true;
  Object.assign(WP2, { B, BOn, BFl, BRed, BGrn });
  WP2.pos = {};
  // ----- lamp fittings -----
  for (const f of LV.l2Fix) {
    if (f.kind === 'bulkhead') F2.bulkhead(k2T(f.x, f.y, f.z, f.ry), f);
    else if (f.kind === 'highbay') F2.highbay(k2T(f.x, f.y, f.z, 0), f);
    else if (f.kind === 'fluo') F2.fluo(k2T(f.x, f.y, f.z, 0), f);
    else if (f.kind === 'cage') F2.cage(k2T(f.x, f.y, f.z, 0), { top: f.y + 0.6, flick: f.flick });
    else if (f.kind === 'red') F2.cage(k2T(f.x, f.y, f.z, 0), { top: f.y + 0.4, flick: f.flick }, 'red');
    else if (f.kind === 'green') { F2.cage(k2T(f.x, f.y, f.z, 0), { top: f.y + 0.3 }, 'green'); }
    else if (f.kind === 'desklamp') { const T = k2T(f.x, f.y, f.z, -2.3); k2Cyl(T, 0.08, 0, 0.03, 14, pp2('green', 'paint')); k2PipeRun([k2P(T, 0, 0.03, 0), k2P(T, 0, 0.3, 0.05), k2P(T, 0, 0.36, 0.22)], 0.01, pp2('green', 'paint'), { bend: 0.04, seg: 6 }); k2Lathe(k2Sub(T, 0, 0.34, 0.25, 0.5, 0, 0), [[0.02, 0.06], [0.05, 0.04], [0.09, -0.03], [0.095, -0.05]], 14, pp2('green', 'paint'), { occ: false }); emi2(WP2.BOn, k2Sub(T, 0, 0.3, 0.27), 'Sphere', { diameter: 0.05, segments: 8 }, [1, 0.85, 0.6], [0, 0, 0]); }
    else if (f.kind === 'beacon') { k2Cyl(k2T(f.x, f.y - 0.1, f.z), 0.07, 0, 0.1, 12, pp2('dgrey', 'paint')); emi2(WP2.BRed, k2T(f.x, f.y + 0.05, f.z), 'Sphere', { diameter: 0.14, segments: 10, slice: 0.5 }, [1, 0.2, 0.1], [0, 0, 0]); }
  }
  buildPipes2();
  furnishHub2(); furnishWest2(); furnishNorth2(); furnishEast2();
  WP2.finishProps = () => {
    const keep = [], out = [...(B.finish('props2', keep) || []), ...(BOn.finish('lensOn2', keep) || []), ...(BFl.finish('lensFl2', keep) || []), ...(BRed.finish('lensRed2', keep) || []), ...(BGrn.finish('lensGrn2', keep) || [])];
    out.forEach(m => m._sortD = 300);
    new Set(keep).forEach(r => r && r.dispose && r.dispose());
  };
}
const SG2 = { bg: '#c9a227', fg: '#151515' }, SGW2 = { bg: '#d8d2bc', fg: '#1d1d1d', line: '#555', emis: 0.25 }, SGG2 = { bg: '#1d5a32', fg: '#e8f0e8', line: '#e8f0e8', emis: 0.6 };
// ----- signage: stencilled plant signs -----
function sign2(text, root, pos, w, h, o = {}) {
  const px = 512, py = Math.max(64, Math.round(512 * h / w)), S = dynTexPlane('sign2', w, h, px, py, root, pos, o.emis ?? 0.35), c = S.ctx;
  c.fillStyle = o.bg || '#c9a227'; c.fillRect(0, 0, px, py);
  if (o.hazard) { c.fillStyle = '#151515'; for (let i = -py; i < px; i += 40) { c.beginPath(); c.moveTo(i, py); c.lineTo(i + 20, py); c.lineTo(i + 20 + py * 0.25, py - py * 0.12); c.lineTo(i + py * 0.25, py - py * 0.12); c.fill(); } }
  c.strokeStyle = o.line || '#151515'; c.lineWidth = 6; c.strokeRect(8, 8, px - 16, py - 16);
  c.fillStyle = o.fg || '#151515'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = String(text).split('\n'), fs = Math.round(Math.min(py / (lines.length + 0.9), px / Math.max(...lines.map(l => l.length)) * 1.45));
  c.font = `bold ${fs}px "Courier New", monospace`; lines.forEach((l, i) => c.fillText(l, px / 2, py / 2 + (i - (lines.length - 1) / 2) * fs * 1.12));
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(30,20,10,${Math.random() * 0.18})`; c.fillRect(Math.random() * px, Math.random() * py, Math.random() * 60, Math.random() * 30); }
  S.dt.update(); WP2.signs.push(S); return S;
}
function phone2(x, y, d, key, along = 0) { const T = wallT2(x, y, d, along); F2.phone(T); const r = wallAt2(x, y, d, along); const p = localPt(r, 0, 1.35, 0.6); WP2.phones.push({ key, x: p.x, z: p.z, r, ring: 0 }); return r; }
function vent2(x, z, y = 0.4) { WP2.vents.push({ x, y, z }); }

// ================= pipe racks along every tunnel wall =================
// a wall run is the same in every cell of a room and side, so neighbouring cells join into one long run; L-corners get elbows
function buildPipes2() {
  const isWall = (x, y, d) => edgeVal(x, y, d) !== 0, opening = (x, y, d) => LV.ek.get(eKey(x, y, d)) || LV.ek.get(eKey(x + DX[d], y + DY[d], (d + 2) % 4));
  const runs = {   // offset from the wall, height, radius, colour, flanges
    steam: [[0.3, 0.42, 0.17, pp2('alu', 'insul'), 0], [0.18, 0.95, 0.06, pp2('rust', 'rust'), 1]],
    serv: [[0.16, 1.62, 0.055, pp2('green', 'paint'), 1], [0.13, 1.9, 0.04, pp2('blue', 'paint'), 1], [0.08, 2.35, 0.016, pp2('steel', 'steel'), 0], [0.08, 2.42, 0.016, pp2('steel', 'steel'), 0]],
    gall: [[0.26, 0.38, 0.13, pp2('rust', 'rust'), 1], [0.14, 1.55, 0.03, pp2('black', 'rubber'), 0], [0.14, 1.62, 0.025, pp2('black', 'rubber'), 0]],
  };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y), z = LV.zone[c]; if (!z) continue;
    const r = LV.rooms[LV.room[c]], kind = r.arch === 'tun' ? 'tun' : r.arch === 'vault' ? 'gall' : null; if (!kind) continue;
    for (let d = 0; d < 4; d++) {
      if (!isWall(x, y, d) || opening(x, y, d) || LV.win2.some(w => w.x === x && w.y === y && w.d === d)) continue;
      const set = kind === 'gall' ? runs.gall : (d === 0 || d === 1) ? runs.steam : runs.serv, horiz = d === 1 || d === 3;
      const [mx, mz] = edgeMid(x, y, d), inX = -DX[d], inZ = -DY[d], wq = (horiz ? mz : mx) + (horiz ? inZ : inX) * WT / 2;
      // ends: shortened at an inner corner (an elbow joins it to the next wall's run), flush at a corridor mouth
      const a0 = (horiz ? x : y) * CELL, a1 = a0 + CELL, dl = horiz ? 2 : 3, dh = horiz ? 0 : 1;   // the perpendicular sides at the low / high end
      const matchSet = pd => kind === 'gall' || ((pd === 0 || pd === 1) === (d === 0 || d === 1));
      for (const [off, py, pr, pcol, fl] of set) {
        if (kind === 'tun' && py > r.h - HAUNCH2 - 0.1) continue;
        const q = wq + (horiz ? inZ : inX) * off, rb = Math.max(pr * 2.2, 0.2), lowC = isWall(x, y, dl) && !opening(x, y, dl), highC = isWall(x, y, dh) && !opening(x, y, dh);
        const lowE = lowC && matchSet(dl), highE = highC && matchSet(dh);
        const lw = (horiz ? x : y) * CELL + WT / 2, hw = (horiz ? x + 1 : y + 1) * CELL - WT / 2;
        const sLow = lowC ? lw + (lowE ? off + rb : 0) : a0, sHigh = highC ? hw - (highE ? off + rb : 0) : a1;
        const P = s => horiz ? [s, py, q] : [q, py, s];
        if (sHigh - sLow > 0.05) k2Pipe(P(sLow), P(sHigh), pr, pcol, { step: 0.6, occ: pr > 0.03 });
        // jacket bands on the insulated main, flanges on the service lines
        if (pr > 0.1) for (let s = Math.ceil(sLow / 1.2) * 1.2; s < sHigh; s += 1.2) { const { T } = k2Along(P(s - 0.02), P(s + 0.02)); k2Cyl(T, pr * 1.04, 0, 0.04, 16, pp2('alu', 'steel'), { occ: false, cap0: false, cap1: false }); }
        else if (fl) for (let s = Math.ceil(sLow / 3.6) * 3.6 + 1.8; s < sHigh; s += 3.6) { const { T } = k2Along(P(s - 0.03), P(s + 0.03)); k2Cyl(T, pr * 1.45, 0, 0.06, 12, pcol, { occ: false }); }
        // an elbow into the next wall's run (drawn once, from the wall that runs along x)
        if (horiz) for (const [isE, pd, wPlane] of [[lowE, dl, lw], [highE, dh, hw]]) {
          if (!isE) continue;
          const cx = wPlane + (pd === 2 ? off : -off), C = [cx, py, q], sx = pd === 2 ? 1 : -1, sz = d === 1 ? -1 : 1;
          k2PipeRun([[cx + sx * (rb + 0.002), py, q], C, [cx, py, q + sz * (rb + 0.002)]], pr, pcol, { bend: rb, seg: pr > 0.1 ? 14 : 10 });
        }
      }
      // brackets every 1.8 m: an angle-iron arm with a back plate
      for (let s = a0 + 0.9; s < a1; s += 1.8) {
        const T = k2T(horiz ? s : wq, 0, horiz ? wq : s, Math.atan2(inX, inZ));
        for (const by of (kind === 'gall' ? [0.25] : set === runs.steam ? [0.22, 0.78] : [1.5, 1.82])) { k2Box(k2Sub(T, 0, by, 0.02), [0.12, 0.16, 0.02], pp2('dgrey', 'rust'), { bevel: 0.004, occ: false }); k2Extrude(k2P(T, -0.02, by - 0.02, 0.02), k2P(T, -0.02, by - 0.02, 0.48), PROF2.angle(0.04, 0.005), pp2('dgrey', 'rust'), { occ: false }); }
      }
      // cable tray under the haunch on the service side
      if (kind === 'tun' && set === runs.serv) {
        const ty = r.h - HAUNCH2 - 0.12, q = wq + (horiz ? inZ : inX) * 0.22, A = horiz ? [a0, ty, q] : [q, ty, a0], Bp = horiz ? [a1, ty, q] : [q, ty, a1];
        k2Extrude(A, Bp, [[-0.18, 0], [0.18, 0], [0.18, 0.08], [0.17, 0.08], [0.17, 0.01], [-0.17, 0.01], [-0.17, 0.08], [-0.18, 0.08]], pp2('steel', 'steel'), { occ: false });
        for (let i = 0; i < 4; i++) { const o2 = -0.12 + i * 0.075, A2 = horiz ? [a0, ty + 0.035, q + o2 * (horiz ? 1 : 0)] : [q + o2, ty + 0.035, a0], B2 = horiz ? [a1, ty + 0.035, q + o2] : [q + o2, ty + 0.035, a1]; if (horiz) { A2[2] = q + o2; B2[2] = q + o2; } k2Pipe(A2, B2, 0.02, pp2(i % 2 ? 'black' : [0.2, 0.2, 0.22], 'rubber'), { seg: 6, occ: false }); }
      }
    }
  }
}

// ================= the hub: pump room, spine, control room, boiler house, cold room A, workshop =================
function furnishHub2() {
  const P = WP2.pos, B = WP2.B;
  // ---- the pump room: the drain you came up through, two sump pumps over a railed pit, the control panel ----
  { const x = cc2(26), z = cc2(49) + 0.4; P.drain = { x, z }; P.arrive = { x, z: z - 1.0 };
    k2Lathe(k2T(x, 0, z), [[0, 0.012], [0.62, 0.012], [0.66, 0.0]], 24, pp2('dgrey', 'steel'));
    for (let i = -3; i <= 3; i++) k2Box(k2T(x, 0.02, z + i * 0.16), [1.1, 0.03, 0.05], pp2('black', 'steel'), { bevel: 0.005, occ: false }); }
  { const px = cc2(28) - 0.3, pz = cc2(49) + 0.2;   // the pit with its rail
    k2Rect('plate', [px - 1.4, 0.005, pz + 1.6], [1, 0, 0], [0, 0, -1], 2.8, 3.2, [0, 1, 0], [0.28, 0.27, 0.25, 0.8], 0.4, { occ: false });
    const rail = (a, b) => { k2Pipe(a, b, 0.024, pp2('yellow', 'paint'), { seg: 8 }); };
    const c0 = [px - 1.5, pz - 1.7], c1 = [px + 1.5, pz + 1.7];
    for (const y of [0.55, 1.05]) { rail([c0[0], y, c0[1]], [c1[0], y, c0[1]]); rail([c0[0], y, c0[1]], [c0[0], y, c1[1]]); rail([c0[0], y, c1[1]], [c1[0], y, c1[1]]); }
    for (const [ax, az] of [[c0[0], c0[1]], [c1[0], c0[1]], [c0[0], c1[1]], [c1[0], c1[1]], [px, c0[1]], [c0[0], pz]]) rail([ax, 0, az], [ax, 1.08, az]);
    addSolid(c0[0] - 0.05, c0[1] - 0.05, c1[0] + 0.05, c1[1] + 0.05, 'prop');
    for (const dz of [-0.8, 0.8]) { const T = k2T(px, 0, pz + dz); k2Cyl(k2Sub(T, 0, 0, 0), 0.09, 0, 1.3, 14, pp2('rust', 'rust')); k2Lathe(k2Sub(T, 0, 1.3, 0), [[0, 0], [0.24, 0], [0.26, 0.05], [0.26, 0.55], [0.22, 0.6], [0.1, 0.66], [0, 0.66]], 20, pp2('blue', 'paint'));
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k2Box(k2Sub(T, Math.cos(a) * 0.27, 1.62, Math.sin(a) * 0.27, 0, -a, 0), [0.03, 0.42, 0.02], pp2('blue', 'paint'), { bevel: 0.004, occ: false }); }
      k2PipeRun([k2P(T, 0, 0.9, 0), k2P(T, -0.9, 0.9, 0), k2P(T, -0.9, 3.6, 0), k2P(T, -0.9, 3.6, -2.4)], 0.07, pp2('green', 'paint'), { flange: true }); F2.gate(k2Sub(T, -0.9, 2.1, 0), 0.07); }
  }
  { const T = wallT2(25, 48, 2, 0.2); k2Box(k2Sub(T, 0, 1.4, 0.15), [0.9, 1.2, 0.3], pp2([0.4, 0.45, 0.42], 'paint'), { bevel: 0.015 });
    for (let i = 0; i < 4; i++) emi2(i < 2 ? WP2.BGrn : WP2.BRed, k2Sub(T, -0.3 + i * 0.2, 1.75, 0.31), 'Cylinder', { diameter: 0.04, height: 0.02, tessellation: 8 }, i < 2 ? [0.4, 1, 0.5] : [1, 0.3, 0.2], [0, 0, 0], [Math.PI / 2, 0, 0]);
    F2.gauge(k2Sub(T, -0.2, 0, 0.3), 1.35); F2.gauge(k2Sub(T, 0.2, 0, 0.3), 1.35); solidT2(T, -0.5, 0, 0.5, 0.35);
    sign2('SUMP PUMPS 2-A / 2-B\nDO NOT ENTER PIT WHEN RUNNING', twin(wallAt2(25, 48, 2, 0.2)), [0, 2.35, 0.03], 1.3, 0.4, SGW2); }
  for (const [x, z] of [[cc2(25) - 1.1, cc2(50) + 1.2], [cc2(25) - 0.45, cc2(50) + 1.25], [cc2(25) - 1.15, cc2(50) + 0.55]]) { F2.barrel(k2T(x, 0, z), pick(['blue', 'red', 'green'])); solidAround2(x, z, 0.33, 0.33); }
  { const r = pr2(cc2(26) + 1.2, cc2(50) + 0.8, 0.6); WP2.B.mdl('wetsign', r, [0, 0, 0], [0, 0, 0], 1) || k2Box(k2T(r.position.x, 0.3, r.position.z), [0.3, 0.6, 0.05], pp2('yellow', 'plastic')); }
  phone2(28, 50, 0, 'sump', -0.6);
  sign2('SPINE ▲\nBOILER HOUSE · SWITCHGEAR', twin(wallAt2(26, 47, 3, 0)), [0, 2.4, 0.03], 1.5, 0.45, SG2);
  // ---- the spine: signs at every turning, the odd fire point ----
  sign2('LOW GALLERIES ◄\nTANK ROOM', twin(wallAt2(27, 25, 0)), [0, 2.15, 0.03], 1.4, 0.45, SG2);
  sign2('LONG PIPE ►\nVALVE ROOMS', twin(wallAt2(27, 20, 2)), [0, 2.1, 0.03], 1.4, 0.45, SG2);
  sign2('SWITCHGEAR ▲\nGAMMA LIFT', twin(wallAt2(27, 17, 0)), [0, 2.1, 0.03], 1.4, 0.45, SG2);
  sign2('BOILER HOUSE ►', twin(wallAt2(27, 28, 2)), [0, 2.15, 0.03], 1.4, 0.32, SG2);
  sign2('PUMP ROOM ▼', twin(wallAt2(27, 44, 0)), [0, 2.15, 0.03], 1.2, 0.32, SG2);
  phone2(27, 30, 0, 'spine', 1.0); phone2(27, 18, 0, 'north', 0.6);
  for (const y of [21, 33, 44]) { const T = wallT2(27, y, 2, 0.8); k2Lathe(k2Sub(T, 0, 0.55, 0.18), [[0, 0], [0.09, 0], [0.095, 0.05], [0.095, 0.48], [0.07, 0.56], [0.04, 0.6], [0, 0.6]], 14, pp2('red', 'paint')); k2Box(k2Sub(T, 0, 1.15, 0.02), [0.3, 0.12, 0.02], pp2('red', 'paint'), { occ: false }); }
  for (let y = 17; y <= 45; y += 4) vent2(cc2(27) + 1.2, cc2(y) + 0.6, 0.45);
  // ---- steam refuges: a sign over the way in, a bench, a first-aid box ----
  for (const s of LV.shelters2) { const r = wallAt2(s.fx, s.fy, s.d, 0); sign2('STEAM REFUGE', twin(r), [0, 2.35, 0.03], 1.0, 0.22, SGG2);
    const T = wallT2(s.x, s.y, s.d, 0); F2.bench(T); k2Box(k2Sub(T, 0.55, 1.45, 0.05), [0.3, 0.36, 0.1], pp2('green', 'paint'), { bevel: 0.01 }); k2Box(k2Sub(T, 0.55, 1.45, 0.105), [0.08, 0.08, 0.005], pp2('white', 'paper'), { occ: false }); }
  // ---- the boiler control room: Ida's desk under the window, the instrument board, the cot, the files ----
  { const T = wallT2(31, 32, 0, 0);   // east wall (the window), local +z into the room
    k2Box(k2Sub(T, 0, 0.82, 0.48), [3.2, 0.05, 0.9], pp2([0.4, 0.42, 0.38], 'paint'), { bevel: 0.01 });
    k2Box(k2Sub(T, 0, 0.45, 0.2), [3.2, 0.75, 0.35], pp2([0.4, 0.42, 0.38], 'paint'), { bevel: 0.015 });
    for (let i = 0; i < 7; i++) { F2.gauge(k2Sub(T, -1.35 + i * 0.45, 0, 0.1), 0.72); if (i % 2) emi2(i % 4 === 1 ? WP2.BGrn : WP2.BRed, k2Sub(T, -1.35 + i * 0.45, 0.5, 0.39), 'Cylinder', { diameter: 0.03, height: 0.02, tessellation: 8 }, i % 4 === 1 ? [0.4, 1, 0.5] : [1, 0.3, 0.2], [0, 0, 0], [Math.PI / 2, 0, 0]); }
    k2Box(k2Sub(T, 1.0, 0.95, 0.35), [0.34, 0.22, 0.22], pp2([0.36, 0.4, 0.3], 'paint'), { bevel: 0.03 }); k2Box(k2Sub(T, 1.0, 1.08, 0.42), [0.24, 0.07, 0.08], pp2('black', 'rubber'), { bevel: 0.02 });
    k2Box(k2Sub(T, -0.5, 0.86, 0.5, 0, 0.2, 0), [0.36, 0.02, 0.26], pp2('cream', 'paper'), { bevel: 0.002, occ: false }); k2Cyl(k2Sub(T, 0.4, 0.85, 0.55), 0.045, 0, 0.1, 12, pp2('white', 'plastic'));
    solidT2(T, -1.65, 0, 1.65, 0.95);
    P.officeDesk = v3(k2P(T, 0, 0.85, 0.9)); P.officePhone = v3(k2P(T, 1.0, 0.9, 0.9)); P.gaugeWall = v3(k2P(T, 0, 1.8, 0.4));
    // the instrument board on the north wall: chart recorders and a field of gauges
    const Tn = wallT2(30, 31, 3, -0.6); k2Box(k2Sub(Tn, 0, 1.4, 0.12), [3.4, 2.0, 0.24], pp2([0.36, 0.42, 0.38], 'paint'), { bevel: 0.02 });
    for (let j = 0; j < 3; j++) for (let i = 0; i < 7; i++) F2.gauge(k2Sub(Tn, -1.4 + i * 0.47, 0, 0.23), 1.0 + j * 0.42);
    for (const s of [-1, 1]) { k2Box(k2Sub(Tn, s * 1.25, 2.15, 0.25), [0.5, 0.36, 0.04], pp2('white', 'paper'), { bevel: 0.01 }); emi2(WP2.BOn, k2Sub(Tn, s * 1.25, 2.15, 0.275), 'Box', { width: 0.42, height: 0.28, depth: 0.004 }, [0.9, 0.88, 0.75], [0, 0, 0]); }
    solidT2(Tn, -1.75, 0, 1.75, 0.3); }
  P.ida = { x: cc2(31) + CELL / 2 - 1.55, z: cc2(32), yaw: Math.PI / 2 };
  { const T = k2T(P.ida.x - 0.12, 0, P.ida.z, P.ida.yaw); k2Box(k2Sub(T, 0, 0.48, 0), [0.48, 0.07, 0.48], pp2('black', 'rubber'), { bevel: 0.03 }); k2Box(k2Sub(T, 0, 0.82, -0.24), [0.46, 0.55, 0.06], pp2('black', 'rubber'), { bevel: 0.03 });
    k2Cyl(k2Sub(T, 0, 0.06, 0), 0.035, 0, 0.42, 8, pp2('steel', 'steel')); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; k2Pipe(k2P(T, 0, 0.06, 0), k2P(T, Math.cos(a) * 0.3, 0.03, Math.sin(a) * 0.3), 0.018, pp2('black', 'steel'), { seg: 6 }); }
    addSolid(P.ida.x - 0.45, P.ida.z - 0.4, P.ida.x + 0.3, P.ida.z + 0.4, 'prop'); }
  { const T = wallT2(31, 33, 1, 0); for (let i = 0; i < 3; i++) { const Ti = k2Sub(T, -0.62 + i * 0.62, 0, 0.3); k2Box(k2Sub(Ti, 0, 0.95, 0), [0.58, 1.9, 0.55], pp2([0.42, 0.5, 0.46], 'paint'), { bevel: 0.012 }); for (let j = 0; j < 5; j++) k2Box(k2Sub(Ti, 0, 1.55 + j * 0.05, 0.28), [0.32, 0.012, 0.01], pp2('dgrey', 'paint'), { bevel: 0, occ: false }); k2Box(k2Sub(Ti, 0.2, 1.0, 0.285), [0.03, 0.12, 0.02], pp2('steel', 'steel'), { bevel: 0.006, occ: false }); } solidT2(T, -0.95, 0, 0.95, 0.6); }
  { const T = wallT2(31, 31, 3, 0); k2Box(k2Sub(T, 0, 0.74, 0.4), [1.5, 0.04, 0.75], pp2([0.55, 0.42, 0.3], 'wood'), { bevel: 0.008 }); for (const s of [-1, 1]) k2Box(k2Sub(T, s * 0.7, 0.37, 0.4), [0.05, 0.72, 0.7], pp2('dgrey', 'paint'), { bevel: 0.005 });
    k2Box(k2Sub(T, -0.2, 0.98, 0.35), [0.44, 0.38, 0.4], pp2([0.75, 0.72, 0.62], 'plastic'), { bevel: 0.03 }); emi2(WP2.BGrn, k2Sub(T, -0.2, 1.0, 0.56), 'Box', { width: 0.3, height: 0.22, depth: 0.004 }, [0.3, 0.9, 0.4], [0, 0, 0]);
    k2Box(k2Sub(T, -0.2, 0.775, 0.68), [0.42, 0.025, 0.16], pp2([0.7, 0.68, 0.6], 'plastic'), { bevel: 0.006 }); k2Box(k2Sub(T, 0.45, 0.8, 0.45), [0.22, 0.03, 0.3], pp2('cream', 'paper'), { bevel: 0.002, occ: false }); solidT2(T, -0.8, 0, 0.8, 0.8); }
  { const T = wallT2(30, 33, 1, 1.0); k2Lathe(k2Sub(T, 0, 2.3, 0.03, Math.PI / 2, 0, 0), [[0, -0.03], [0.15, -0.03], [0.16, 0.0], [0.15, 0.03], [0, 0.03]], 20, pp2('white', 'plastic'), { occ: false }); k2Box(k2Sub(T, 0.03, 2.33, 0.065, 0, 0, -0.7), [0.008, 0.1, 0.004], pp2('black', 'plastic'), { bevel: 0, occ: false }); }
  for (const y of [31, 33]) k2Pipe([29 * CELL + 0.2, 2.75, (y + (y === 31 ? 0 : 1)) * CELL + (y === 31 ? 0.3 : -0.3)], [32 * CELL - 0.2, 2.75, (y + (y === 31 ? 0 : 1)) * CELL + (y === 31 ? 0.3 : -0.3)], 0.06, pp2('green', 'paint'), { flange: true });
  // the window into the boiler house: frame, wired glass (the glass is see-through to the tracer)
  for (const w of LV.winRects || []) {
    if (w.sg > 0) continue;   // one frame per opening, drawn from the control-room side
    const T = k2T(w.q, 0, (w.w0 + w.w1) / 2, -Math.PI / 2), L = w.w1 - w.w0;
    for (const [y, h] of [[1.05, 0.06], [2.25, 0.06]]) k2Box(k2Sub(T, 0, y, 0.0), [L, h, 0.22], pp2('dgrey', 'paint'), { bevel: 0.01 });
    for (const s of [-1, 0, 1]) k2Box(k2Sub(T, s * L / 2, 1.65, 0.0), [0.06, 1.2, 0.22], pp2('dgrey', 'paint'), { bevel: 0.01 });
    k2Box(k2Sub(T, 0, 1.65, -0.02), [L, 1.15, 0.012], pp2([0.55, 0.6, 0.58], 'glass'), { bevel: 0, occ: false, mat: 'glass' });
    for (let i = 1; i < 6; i++) k2Box(k2Sub(T, -L / 2 + i * L / 6, 1.65, 0.005), [0.004, 1.15, 0.004], pp2('steel', 'steel'), { bevel: 0, occ: false });
  }
  { const T = wallT2(30, 33, 1, -0.4); k2Box(k2Sub(T, 0, 0.32, 0.45), [1.95, 0.12, 0.85], pp2('olive', 'paint'), { bevel: 0.02 }); k2Box(k2Sub(T, 0, 0.42, 0.45), [1.85, 0.1, 0.78], pp2([0.42, 0.44, 0.36], 'cloth'), { bevel: 0.04 }); for (const s of [-1, 1]) for (const zz of [0.08, 0.82]) k2Box(k2Sub(T, s * 0.9, 0.13, zz), [0.04, 0.26, 0.04], pp2('olive', 'paint'), { bevel: 0.005 }); solidT2(T, -1.0, 0, 1.0, 0.9); }
  { const T = wallT2(29, 33, 2, 0.6); for (let i = 0; i < 2; i++) { k2Box(k2Sub(T, i * 0.5 - 0.25, 0.68, 0.32), [0.46, 1.36, 0.62], pp2('grey', 'paint'), { bevel: 0.012 }); for (let j = 0; j < 4; j++) k2Box(k2Sub(T, i * 0.5 - 0.25, 0.2 + j * 0.33, 0.635), [0.16, 0.025, 0.02], pp2('steel', 'steel'), { bevel: 0.005, occ: false }); } solidT2(T, -0.5, 0, 0.5, 0.65); }
  { const T = wallT2(29, 31, 2, 0.4); k2Box(k2Sub(T, 0, 1.6, 0.015), [0.6, 0.8, 0.03], pp2('white', 'paper'), { bevel: 0.004 }); for (let i = 0; i < 12; i++) k2Box(k2Sub(T, -0.24 + (i % 6) * 0.09, 1.7 - Math.floor(i / 6) * 0.1, 0.034), [0.06, 0.05, 0.004], pp2('red', 'paper'), { occ: false }); P.calendar = v3(k2P(T, 0, 1.5, 0.9)); }
  { const T = wallT2(29, 31, 3, -0.2); k2Box(k2Sub(T, 0, 1.55, 0.02), [0.9, 0.6, 0.03], pp2('wood', 'wood'), { bevel: 0.01 }); for (let i = 0; i < 5; i++) k2Box(k2Sub(T, -0.32 + i * 0.16, 1.55, 0.04), [0.14, 0.18, 0.004], pp2(i === 2 ? 'white' : 'cream', 'paper'), { occ: false }); P.shiftBoard = v3(k2P(T, 0, 1.5, 0.9)); P.idHook = v3(k2P(T, 0, 1.4, 0.4)); }
  // ---- the boiler house: two fire-tube boilers, burners, flues, the catwalk, feed pumps, the header ----
  P.furnace = [];
  for (const [bi, bxc] of [[0, 35.2], [1, 40.2]]) {
    const x = bxc * CELL, z0 = 25.0 * CELL, z1 = 33.2 * CELL, zc = (z0 + z1) / 2, L = z1 - z0, R = 1.5, yc = 2.05, T = k2T(x, yc, zc, 0), TS = k2Sub(T, 0, 0, 0, Math.PI / 2, 0, 0);   // shell axis along z
    k2Cyl(k2Sub(TS, 0, -L / 2, 0), R, 0, L, 32, pp2(bi ? [0.55, 0.56, 0.54] : 'alu', 'insul'), { step: 0.8 });
    for (let i = 1; i < 8; i++) k2Cyl(k2Sub(TS, 0, -L / 2 + i * L / 8 - 0.03, 0), R * 1.012, 0, 0.06, 32, pp2('alu', 'steel'), { cap0: false, cap1: false, occ: false });
    // dished ends, the front with its burner, the rear smoke box
    k2Lathe(k2Sub(TS, 0, -L / 2, 0), [[R, 0], [R * 0.97, -0.18], [R * 0.75, -0.32], [0, -0.38]], 32, pp2('dgrey', 'paint'));
    k2Lathe(k2Sub(TS, 0, L / 2, 0), [[0, 0.55], [R * 1.02, 0.55], [R * 1.02, 0.0]], 32, pp2('dgrey', 'rust'));
    const F = k2Sub(T, 0, -0.2, -L / 2 - 0.35);   // burner on the front, facing -z
    k2Cyl(k2Sub(F, 0, 0, 0, Math.PI / 2, 0, 0), 0.42, -0.2, 0.75, 24, pp2('red', 'paint'));
    k2Box(k2Sub(F, 0, -0.05, -1.05), [1.0, 1.0, 0.7], pp2('red', 'paint'), { bevel: 0.04 });
    k2Lathe(k2Sub(F, 0.62, -0.05, -1.05, 0, 0, Math.PI / 2), [[0, -0.2], [0.34, -0.2], [0.36, -0.1], [0.36, 0.1], [0.34, 0.2], [0, 0.2]], 20, pp2('blue', 'paint'));
    k2Box(k2Sub(F, -0.95, 0.45, -0.6), [0.6, 0.9, 0.35], pp2([0.42, 0.45, 0.42], 'paint'), { bevel: 0.02 });
    emi2(WP2.BRed, k2Sub(F, 0, 0.1, -1.42), 'Cylinder', { diameter: 0.18, height: 0.02, tessellation: 14 }, [1, 0.5, 0.15], [0, 0, 0], [Math.PI / 2, 0, 0]);
    P.furnace.push({ x: x, y: 1.9, z: z0 - 1.9 });
    // saddles
    for (const dz of [-L * 0.35, 0, L * 0.35]) k2Box(k2Sub(T, 0, -yc + 0.32, dz), [2.6, 0.64, 0.45], pp2('dgrey', 'rust'), { bevel: 0.02 });
    // the water column, safety valves, the steam outlet to the header
    k2Pipe(k2P(T, R + 0.25, -0.8, -L / 2 + 0.6), k2P(T, R + 0.25, 1.0, -L / 2 + 0.6), 0.05, pp2('steel', 'steel')); k2Cyl(k2Sub(T, R + 0.25, -0.1, -L / 2 + 0.6), 0.07, -0.35, 0.35, 12, pp2('brass', 'brass'));
    for (const dz of [-1.0, 1.2]) { k2Cyl(k2Sub(T, 0, R, dz), 0.1, 0, 0.35, 14, pp2('red', 'paint')); k2Lathe(k2Sub(T, 0, R + 0.35, dz), [[0, 0], [0.13, 0], [0.13, 0.2], [0.05, 0.4], [0, 0.42]], 14, pp2('brass', 'brass')); }
    k2PipeRun([k2P(T, 0, R, 2.6), k2P(T, 0, 6.4 - yc, 2.6), k2P(T, (bi ? -1 : 1) * 2.5, 6.4 - yc, 2.6)], 0.16, pp2('alu', 'insul'), { flange: true, fcol: pp2('steel', 'steel') });
    // the breeching: a square flue from the smoke box up through the roof
    const fz = z1 + 0.25; k2Box(k2T(x, 3.4, fz), [1.1, 0.9, 1.1], pp2('dgrey', 'rust'), { bevel: 0.03 });
    k2Cyl(k2T(x, 3.8, fz), 0.42, 0, 5.8, 20, pp2('dgrey', 'rust'), { cap0: false, cap1: false, step: 0.8 });
    for (let i = 0; i < 4; i++) k2Cyl(k2T(x, 4.4 + i * 1.3, fz), 0.44, 0, 0.06, 20, pp2('dgrey', 'steel'), { occ: false });
    addSolid(x - R - 0.35, z0 - 1.6, x + R + 0.35, z1 + 0.8, 'prop');
    // the catwalk along the top: grating, two rails, a caged ladder at the rear
    const cw = k2T(x + (bi ? -1 : 1) * (R + 0.55), 3.3, zc); k2Rect('walk', k2P(cw, -0.45, 0.04, L / 2), [1, 0, 0], [0, 0, -1], 0.9, L, [0, 1, 0], [0.75, 0.75, 0.72, 0], 0.5, { uo: 0, vo: 0 });
    k2Box(k2Sub(cw, 0, 0, 0), [0.9, 0.08, L], pp2('yellow', 'paint'), { bevel: 0.006, faces: 47 });
    const so = bi ? -1 : 1;
    for (const y of [0.55, 1.05]) k2Pipe(k2P(cw, so * 0.45, y, -L / 2), k2P(cw, so * 0.45, y, L / 2), 0.022, pp2('yellow', 'paint'), { seg: 8 });
    for (let i = 0; i <= 6; i++) { k2Pipe(k2P(cw, so * 0.45, 0, -L / 2 + i * L / 6), k2P(cw, so * 0.45, 1.08, -L / 2 + i * L / 6), 0.022, pp2('yellow', 'paint'), { seg: 8 }); k2Pipe(k2P(cw, so * 0.45, -3.3, -L / 2 + i * L / 6), k2P(cw, so * 0.45, 0, -L / 2 + i * L / 6), 0.04, pp2('yellow', 'paint'), { seg: 8 }); }
    for (const s of [-0.22, 0.22]) k2Pipe(k2P(cw, s, -3.3, L / 2 + 0.25), k2P(cw, s, 1.0, L / 2 + 0.25), 0.02, pp2('yellow', 'paint'), { seg: 6 });
    for (let i = 0; i < 14; i++) k2Pipe(k2P(cw, -0.22, -3.0 + i * 0.3, L / 2 + 0.25), k2P(cw, 0.22, -3.0 + i * 0.3, L / 2 + 0.25), 0.012, pp2('yellow', 'paint'), { seg: 5, occ: false });
    addSolid(cw.o[0] - 0.5, z0, cw.o[0] + 0.5, z1 + 0.5, 'prop');
    vent2(x + so * (R + 0.9), zc + 3.5, 0.3);
  }
  // the steam header across the house at 6.4 m, on hangers
  { const z = (25.0 * CELL + 33.2 * CELL) / 2 + 2.6; k2Pipe([32 * CELL + 0.2, 6.4, z], [44 * CELL - 0.2, 6.4, z], 0.24, pp2('alu', 'insul'), { flange: true, fcol: pp2('steel', 'steel') });
    for (let x = 33.5; x < 43.5; x += 1.5) k2Pipe([x * CELL, 6.6, z], [x * CELL, 9.4, z], 0.018, pp2('steel', 'steel'), { seg: 6 }); }
  // feedwater pumps on plinths along the west wall
  for (let i = 0; i < 3; i++) { const T = k2T(cc2(32) + 0.4, 0, cc2(30) + i * 2.6, Math.PI / 2);
    k2Box(k2Sub(T, 0, 0.12, 0), [1.6, 0.24, 0.7], pp2('conc', 'conc'), { bevel: 0.02 });
    k2Box(k2Sub(T, 0, 0.27, 0), [1.5, 0.06, 0.55], pp2('dgrey', 'paint'), { bevel: 0.01 });
    const M = k2Sub(T, 0.3, 0.58, 0, 0, 0, Math.PI / 2); k2Cyl(M, 0.24, -0.45, 0.35, 20, pp2('blue', 'paint'));
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; k2Box(k2Sub(M, Math.cos(a) * 0.25, -0.05, Math.sin(a) * 0.25, 0, -a, 0), [0.025, 0.7, 0.03], pp2('blue', 'paint'), { bevel: 0.003, occ: false }); }
    k2Lathe(k2Sub(T, -0.45, 0.58, 0, 0, 0, Math.PI / 2), [[0, -0.18], [0.22, -0.18], [0.3, -0.05], [0.3, 0.08], [0.18, 0.18], [0, 0.18]], 18, pp2('red', 'paint'));
    k2PipeRun([k2P(T, -0.45, 0.58, 0), k2P(T, -0.45, 1.6, 0), k2P(T, -0.45, 1.6, 2.6)], 0.07, pp2('green', 'paint'), { flange: true });
    solidT2(T, -0.85, -0.4, 0.85, 0.4); }
  // the deaerator on its stand along the east wall
  { const x = cc2(43) - 0.4, z = cc2(29) + 1.8, T = k2T(x, 3.8, z, 0); k2Cyl(k2Sub(T, 0, 0, -3.2, Math.PI / 2, 0, 0), 1.0, 0, 6.4, 28, pp2('alu', 'insul'), { step: 0.8 });
    for (const s of [-1, 1]) k2Lathe(k2Sub(T, 0, 0, s * 3.2, s * Math.PI / 2, 0, 0), [[1.0, 0], [0.9, 0.25], [0.5, 0.42], [0, 0.46]], 28, pp2('alu', 'insul'));
    for (const dz of [-2.4, 0, 2.4]) for (const s of [-1, 1]) k2Extrude([x + s * 0.7, 0, z + dz], [x + s * 0.7, 2.85, z + dz], PROF2.ibeam(0.18, 0.18), pp2('dgrey', 'paint'), { caps: true });
    for (const dz of [-2.4, 0, 2.4]) k2Extrude([x - 0.8, 2.85, z + dz], [x + 0.8, 2.85, z + dz], PROF2.ibeam(0.18, 0.2), pp2('dgrey', 'paint'), { caps: true });
    addSolid(x - 0.9, z - 2.6, x + 0.9, z + 2.6, 'prop'); }
  { const L = (x0, z0, x1, z1) => k2Rect('haz', [x0, 0.004, z1], [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, [0, 1, 0], [1, 1, 1, 0], 0.6, { occ: false, uo: x0, vo: -z1 });
    for (const xb of [35.2 * CELL, 40.2 * CELL]) { L(xb - 2.4, 24.0 * CELL, xb - 2.3, 34.4 * CELL); L(xb + 2.3, 24.0 * CELL, xb + 2.4, 34.4 * CELL); L(xb - 2.4, 24.0 * CELL - 0.1, xb + 2.4, 24.0 * CELL); }
    L(32 * CELL + 0.6, 27 * CELL + 0.3, 33 * CELL + 0.2, 27 * CELL + 0.4); L(32 * CELL + 0.6, 28 * CELL - 0.4, 33 * CELL + 0.2, 28 * CELL - 0.3); }
  for (const [x0, x1, z] of [[32 * CELL + 0.6, 44 * CELL - 0.6, 23 * CELL + 0.45], [32 * CELL + 0.6, 44 * CELL - 0.6, 37 * CELL - 0.45]]) { k2Pipe([x0, 4.6, z], [x1, 4.6, z], 0.2, pp2('alu', 'insul'), { flange: true, fcol: pp2('steel', 'steel') }); k2Pipe([x0, 5.2, z], [x1, 5.2, z], 0.1, pp2('green', 'paint'), { flange: true }); for (let x = x0 + 1.8; x < x1; x += 3.6) { k2Box(k2T(x, 4.9, z + (z < 100 ? -0.2 : 0.2)), [0.12, 1.2, 0.3], pp2('dgrey', 'rust'), { bevel: 0.006 }); } }
  for (const [x0, z0, z1] of [[44 * CELL - 0.35, 24 * CELL, 36.5 * CELL]]) { k2Pipe([x0, 3.2, z0], [x0, 3.2, z1], 0.14, pp2('rust', 'rust'), { flange: true }); k2Pipe([x0 - 0.25, 2.5, z0], [x0 - 0.25, 2.5, z1], 0.07, pp2('blue', 'paint'), { flange: true }); }
  for (const xb of [35.2 * CELL, 40.2 * CELL]) { const T = k2T(xb + 2.1, 0, 24.3 * CELL, Math.PI); k2Box(k2Sub(T, 0, 1.1, 0), [0.9, 2.2, 0.6], pp2([0.4, 0.45, 0.42], 'paint'), { bevel: 0.015 });
    for (let i = 0; i < 3; i++) { F2.gauge(k2Sub(T, -0.25 + i * 0.25, 0, 0.3), 1.75); emi2(i ? WP2.BGrn : WP2.BRed, k2Sub(T, -0.25 + i * 0.25, 1.35, 0.31), 'Cylinder', { diameter: 0.04, height: 0.02, tessellation: 8 }, i ? [0.4, 1, 0.5] : [1, 0.3, 0.2], [0, 0, 0], [Math.PI / 2, 0, 0]); }
    k2Box(k2Sub(T, 0, 1.0, 0.31), [0.6, 0.08, 0.01], pp2('white', 'paper'), { bevel: 0, occ: false }); solidT2(T, -0.5, -0.35, 0.5, 0.35); }
  { const T = k2T(cc2(42) + 0.6, 0, cc2(35) + 0.4, 0); k2Cyl(T, 0.75, 0.2, 2.4, 24, pp2('dgrey', 'rust')); k2Lathe(k2Sub(T, 0, 2.4, 0), [[0.75, 0], [0.6, 0.25], [0.25, 0.38], [0, 0.4]], 24, pp2('dgrey', 'rust')); for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2; k2Extrude(k2P(T, Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6), k2P(T, Math.cos(a) * 0.6, 0.4, Math.sin(a) * 0.6), PROF2.rect(0.08, 0.08), pp2('dgrey', 'paint'), { caps: true }); }
    k2PipeRun([k2P(T, 0, 2.75, 0), k2P(T, 0, 7.5, 0)], 0.15, pp2('dgrey', 'rust')); solidAround2(T.o[0], T.o[2], 0.8, 0.8); sign2('BLOWDOWN\nHOT', twin(pr2(T.o[0], T.o[2] - 0.78, Math.PI, 0)), [0, 1.5, 0.0], 0.5, 0.3, { hazard: true }); }
  { const T = k2T(cc2(33) + 0.2, 0, cc2(35) + 0.8, Math.PI / 2); k2Box(k2Sub(T, 0, 0.08, 0), [2.0, 0.16, 1.0], pp2('dgrey', 'paint'), { bevel: 0.01 });
    for (const s of [-0.55, 0.55]) { k2Lathe(k2Sub(T, s, 0.16, 0), [[0, 0], [0.3, 0], [0.31, 0.05], [0.31, 1.1], [0.27, 1.15], [0, 1.16]], 18, pp2('white', 'plastic')); k2Cyl(k2Sub(T, s, 1.16, 0), 0.06, 0, 0.35, 10, pp2('blue', 'paint')); }
    k2Box(k2Sub(T, 0, 0.5, 0.35), [0.4, 0.5, 0.25], pp2('blue', 'paint'), { bevel: 0.02 }); solidT2(T, -1.05, -0.55, 1.05, 0.55); sign2('CHEMICAL DOSING\nGLOVES · GOGGLES', twin(pr2(T.o[0] + 0.6, T.o[2], Math.PI / 2, 0)), [0, 1.6, 0.0], 0.8, 0.3, SGW2); }
  sign2('BOILER HOUSE\nEAR PROTECTION', twin(wallAt2(32, 27, 2, 1.2)), [0, 2.4, 0.03], 1.5, 0.45, { hazard: true, bg: '#c9a227' });
  // ---- cold room A, the workshop ----
  coldRoom2(25, 42, 'coldA');
  { const T = wallT2(24, 38, 2, 0); k2Box(k2Sub(T, 0, 0.88, 0.45), [2.4, 0.06, 0.85], pp2('wood', 'wood'), { bevel: 0.01 }); for (const s of [-1, 1]) for (const zz of [0.1, 0.8]) k2Box(k2Sub(T, s * 1.1, 0.43, zz), [0.06, 0.86, 0.06], pp2('dgrey', 'paint'), { bevel: 0.005 });
    k2Box(k2Sub(T, 0, 0.25, 0.45), [2.3, 0.03, 0.75], pp2('dgrey', 'paint'), { bevel: 0.005 });
    k2Box(k2Sub(T, -0.8, 0.98, 0.3), [0.18, 0.14, 0.12], pp2('blue', 'paint'), { bevel: 0.02 }); k2Box(k2Sub(T, -0.8, 1.06, 0.42), [0.24, 0.05, 0.1], pp2('steel', 'steel'), { bevel: 0.01 });
    k2Box(k2Sub(T, 0, 1.65, 0.02), [2.2, 1.0, 0.03], pp2([0.6, 0.55, 0.4], 'wood'), { bevel: 0.01 });
    for (let i = 0; i < 14; i++) k2Box(k2Sub(T, -1.0 + (i % 7) * 0.32, 1.45 + Math.floor(i / 7) * 0.4, 0.06, 0, 0, rnd(-0.2, 0.2)), [0.04, rnd(0.2, 0.32), 0.03], pp2(pick(['steel', 'red', 'black']), 'steel'), { bevel: 0.005, occ: false });
    solidT2(T, -1.25, 0, 1.25, 0.9); }
  { const T = wallT2(26, 39, 1, 0.2); F2.shelf(T, 1.4, 2.0, 0.5, 5); for (let i = 0; i < 6; i++) F2.barrel(k2Sub(T, -0.4 + (i % 3) * 0.4, 0.17 + Math.floor(i / 3) * 0.5, 0.25), 'red'); solidT2(T, -0.7, 0, 0.7, 0.55); }
  for (const [x, z, col] of [[cc2(24) - 1.3, cc2(37) - 1.3, 'yellow'], [cc2(24) - 0.75, cc2(37) - 1.35, 'blue']]) { k2Lathe(k2T(x, 0, z), [[0, 0], [0.11, 0], [0.12, 0.05], [0.12, 1.25], [0.08, 1.4], [0.03, 1.48], [0, 1.48]], 14, pp2(col, 'paint')); solidAround2(x, z, 0.16, 0.16); }
}
function coldRoom2(x0, y0, key) {
  const P = WP2.pos;
  for (const [x, y, d] of [[x0, y0, 3], [x0 + 1, y0, 3]]) { const T = wallT2(x, y, d, 0); F2.shelf(T, 1.3, 1.9, 0.5, 4); for (let i = 0; i < 8; i++) k2Box(k2Sub(T, -0.45 + (i % 4) * 0.3, 0.32 + Math.floor(i / 4) * 0.55, 0.26), [0.26, 0.3, 0.3], pp2(['cream', 'white', [0.6, 0.5, 0.35]][i % 3], 'paper'), { bevel: 0.01 }); solidT2(T, -0.65, 0, 0.65, 0.5); }
  { const T = wallT2(x0, y0 + 1, 2, 0); k2Box(k2Sub(T, 0, 2.25, 0.25), [1.1, 0.42, 0.45], pp2('white', 'plastic'), { bevel: 0.02 }); for (let i = 0; i < 2; i++) k2Disc(k2Sub(T, -0.25 + i * 0.5, 2.25, 0.48, Math.PI / 2, 0, 0), 0.15, 0, 1, 16, pp2('black', 'rubber'));
    k2Box(k2Sub(T, 0.9, 1.5, 0.02), [0.12, 0.4, 0.03], pp2('white', 'plastic'), { bevel: 0.01 }); sign2('COLD STORE\n4 °C', twin(wallAt2(x0, y0 + 1, 2, 0)), [0.5, 1.8, 0.03], 0.7, 0.3, SGW2); }
  P[key] = { x: cc2(x0) + CELL / 2, z: cc2(y0) + CELL / 2 };
}

// ================= west: the tank room, the galleries, the camp, cold room B, the west regulator =================
function furnishWest2() {
  const P = WP2.pos;
  // ---- the feedwater tank room: two tall tanks on plinths, a pump skid, a ladder ----
  for (const [x, z] of [[cc2(21) + 0.6, cc2(22) + 0.9], [cc2(21) + 0.6, cc2(26) - 0.6]]) {
    const R = 1.55, T = k2T(x, 0, z, 0); k2Box(k2Sub(T, 0, 0.15, 0), [3.6, 0.3, 3.6], pp2('conc', 'conc'), { bevel: 0.03 });
    k2Cyl(k2Sub(T, 0, 0.3, 0), R, 0, 4.6, 32, pp2([0.42, 0.5, 0.45], 'paint'), { cap0: false, step: 0.8 }); k2Lathe(k2Sub(T, 0, 4.9, 0), [[R, 0], [R * 0.9, 0.3], [R * 0.4, 0.55], [0, 0.6]], 32, pp2([0.42, 0.5, 0.45], 'paint'));
    for (let i = 1; i < 5; i++) k2Cyl(k2Sub(T, 0, 0.3 + i * 0.95, 0), R * 1.01, 0, 0.05, 32, pp2('dgrey', 'steel'), { cap0: false, cap1: false, occ: false });
    // a level gauge, the ladder
    k2Pipe(k2P(T, R + 0.1, 0.8, 0.5), k2P(T, R + 0.1, 4.5, 0.5), 0.03, pp2('steel', 'steel'));
    for (const s of [-0.22, 0.22]) k2Pipe(k2P(T, -s, 0.3, -R - 0.18), k2P(T, -s, 5.3, -R - 0.18), 0.02, pp2('yellow', 'paint'), { seg: 6 });
    for (let i = 0; i < 16; i++) k2Pipe(k2P(T, -0.22, 0.6 + i * 0.3, -R - 0.18), k2P(T, 0.22, 0.6 + i * 0.3, -R - 0.18), 0.012, pp2('yellow', 'paint'), { seg: 5, occ: false });
    k2PipeRun([k2P(T, R * 0.7, 0.9, R * 0.7), k2P(T, R + 0.8, 0.9, R + 0.8), k2P(T, R + 0.8, 3.0, R + 0.8), k2P(T, R + 4.4, 3.0, R + 0.8)], 0.09, pp2('green', 'paint'), { flange: true });
    F2.gate(k2Sub(T, R + 0.8, 1.7, R + 0.8), 0.09);
    addSolid(x - 1.85, z - 1.9, x + 1.85, z + 1.85, 'prop');
  }
  sign2('FEEDWATER · TANKS 1 / 2\nTREATED · DO NOT DRINK', twin(wallAt2(24, 22, 3, 0)), [0, 2.3, 0.03], 1.6, 0.45, SGW2);
  phone2(25, 24, 1, 'west', 0.2);
  sign2('LOW GALLERIES ◄\nKEEP TO THE DUCKBOARDS', twin(wallAt2(19, 23, 2, 0)), [0, 2.2, 0.03], 1.5, 0.42, SG2);
  // ---- the galleries: duckboards over the water, old pipes, hanging cable ----
  for (const c of LV.dry.gall.cells) { if (h2i(c, 7, 301) < 0.55) continue; const x = cc2(c % N), z = cc2((c / N) | 0), rot = edgeVal(c % N, (c / N) | 0, 1) === 0 ? 0 : Math.PI / 2, T = k2T(x, 0.05, z, rot);
    for (let i = -2; i <= 2; i++) k2Box(k2Sub(T, i * 0.22, 0.03, 0, 0, 0, rnd(-0.03, 0.03)), [0.18, 0.04, 1.8], pp2([0.45, 0.33, 0.22], 'wood'), { bevel: 0.006, occ: false });
    for (const s of [-0.7, 0.7]) k2Box(k2Sub(T, 0, 0.0, s), [1.1, 0.05, 0.08], pp2([0.35, 0.26, 0.18], 'wood'), { bevel: 0.006, occ: false }); }
  for (const c of LV.dry.gall.cells) if (h2i(c, 11, 303) > 0.82) vent2(cc2(c % N) + 0.8, cc2((c / N) | 0), 0.3);
  for (const c of LV.dry.gall.cells) { if (h2i(c, 13, 304) < 0.78) continue; const x = cc2(c % N), z = cc2((c / N) | 0), sag = 1.7 + h2i(c, 1, 305) * 0.4;
    k2PipeRun([[x - 1.5, 2.6, z], [x - 0.5, sag + 0.25, z + 0.1], [x, sag, z + 0.2], [x + 0.5, sag + 0.25, z + 0.1], [x + 1.5, 2.6, z]], 0.018, pp2('black', 'rubber'), { bend: 0.3, seg: 6 }); }
  // ---- the camp: Gamma Team's store room ----
  { const T = wallT2(4, 31, 2, 0); campBunk2(T); solidT2(T, -1.0, 0, 1.0, 0.95); }
  { const T = wallT2(6, 30, 0, 0); campBunk2(T); solidT2(T, -1.0, 0, 1.0, 0.95); }
  { const T = wallT2(5, 31, 1, 0.3); k2Box(k2Sub(T, 0, 0.74, 0.38), [1.7, 0.05, 0.75], pp2([0.5, 0.48, 0.42], 'wood'), { bevel: 0.01 }); for (const s of [-1, 1]) k2Box(k2Sub(T, s * 0.78, 0.37, 0.38), [0.05, 0.72, 0.7], pp2('dgrey', 'paint'), { bevel: 0.006 }); solidT2(T, -0.88, 0, 0.88, 0.8);
    k2Box(k2Sub(T, -0.5, 0.88, 0.3), [0.38, 0.24, 0.22], pp2([0.36, 0.4, 0.3], 'paint'), { bevel: 0.02 }); k2Pipe(k2P(T, -0.62, 0.98, 0.26), k2P(T, -0.62, 1.38, 0.26), 0.008, pp2('black', 'steel'), { seg: 5 });
    for (let i = 0; i < 6; i++) k2Disc(k2Sub(T, -0.62 + i * 0.05, 0.88, 0.415, Math.PI / 2, 0, 0), 0.012, 0, 1, 8, pp2('black', 'plastic'));
    emi2(WP2.BOn, k2Sub(T, 0.55, 0.87, 0.35), 'Cylinder', { diameter: 0.13, height: 0.18, tessellation: 12 }, [1, 0.85, 0.55], [0, 0, 0]);
    k2Box(k2Sub(T, 0.55, 0.77, 0.35), [0.16, 0.03, 0.16], pp2('red', 'paint'), { bevel: 0.01 }); k2Torus(k2Sub(T, 0.55, 1.0, 0.35, Math.PI / 2, 0, 0), 0.07, 0.005, 12, 4, pp2('black', 'steel'));
    P.log1 = v3(k2P(T, 0.05, 0.8, 0.9)); P.radio = v3(k2P(T, -0.5, 0.9, 0.9)); }
  { const T = wallT2(5, 29, 3, 0.8); k2Box(k2Sub(T, 0, 1.6, 0.02), [1.6, 1.0, 0.04], pp2([0.5, 0.38, 0.22], 'wood'), { bevel: 0.01 }); sign2('M.E.G. · GAMMA\nTEAM BOARD', twin(wallAt2(5, 29, 3, 0.8)), [0, 2.25, 0.03], 1.0, 0.25, { bg: '#e8e0c8', fg: '#7a3a10', line: '#7a3a10', emis: 0.2 });
    for (let i = 0; i < 6; i++) k2Box(k2Sub(T, -0.6 + i * 0.24, 1.55 + rnd(-0.15, 0.15), 0.045, 0, 0, rnd(-0.08, 0.08)), [0.18, 0.24, 0.004], pp2(pick(['white', 'cream', [0.9, 0.85, 0.5]]), 'paper'), { occ: false });
    P.log2 = v3(k2P(T, -0.3, 1.5, 0.9)); P.idcard = v3(k2P(T, 0.45, 1.5, 0.9)); }
  { const x = cc2(6) + 0.6, z = cc2(29) - 0.6; F2.crate(k2T(x, 0, z, 0.3)); solidAround2(x, z, 0.45, 0.45); P.crowbar = { x, z: z + 0.7, y: 0.65 }; }
  { const x = cc2(4) + 0.6, z = cc2(31) + 0.4; P.log3 = { x, z, y: 0.3 }; k2Box(k2T(x, 0.015, z, 1.1), [0.24, 0.02, 0.32], pp2('cream', 'paper'), { bevel: 0.002, occ: false }); }
  P.camp = { x: cc2(5), z: cc2(30) };
  for (const [x, z, s] of [[cc2(4) - 0.9, cc2(29) - 0.9, 1], [cc2(4) - 0.2, cc2(29) - 1.1, 0.8], [cc2(6) + 1.0, cc2(31) + 1.1, 1]]) { F2.crate(k2T(x, 0, z, rnd(-0.3, 0.3)), s); solidAround2(x, z, 0.4, 0.4); }
  { const x = cc2(6) + 1.05, z = cc2(30) + 1.3; F2.barrel(k2T(x, 0, z), 'olive'); solidAround2(x, z, 0.33, 0.33); }
  for (const [x, z, ry] of [[cc2(5) - 0.4, cc2(30) - 0.6, 0.2], [cc2(5) + 0.9, cc2(29) + 0.2, -0.3]]) { const T = k2T(x, 0, z, ry); k2Box(k2Sub(T, 0, 0.05, 0), [0.75, 0.1, 1.9], pp2(pick([[0.2, 0.32, 0.22], [0.5, 0.18, 0.12]]), 'cloth'), { bevel: 0.04, occ: false }); k2Box(k2Sub(T, 0, 0.11, 0.7), [0.6, 0.12, 0.35], pp2([0.7, 0.66, 0.56], 'cloth'), { bevel: 0.05, occ: false }); }
  { const x = cc2(4) - 0.6, z = cc2(29) - 0.4, T = k2T(x, 0, z, 0.1); k2Box(k2Sub(T, 0, 0.46, 0), [1.2, 0.92, 0.9], pp2('orange', 'cloth'), { bevel: 0.08 }); solidAround2(x, z, 0.62, 0.5); }
  sign2('M.E.G.\nGAMMA', twin(wallAt2(6, 31, 0, 0)), [0, 1.9, 0.03], 0.8, 0.45, { bg: '#c86a12', fg: '#fff', line: '#fff', emis: 0.3 });
  coldRoom2(11, 30, 'coldB');
  // ---- the west regulator: a manifold on the south wall, ankle-deep hot water ----
  { const T = wallT2(3, 41, 1, 0); F2.manifold(T); solidT2(T, -1.2, 0, 1.2, 0.95); P.wreg = v3(k2P(T, 0, 1.25, 1.5)); WP2.wregRoot = wallAt2(3, 41, 1, 0); F2.wheel(k2Sub(T, 0, 1.25, 1.05), 'red'); }
  sign2('REGULATOR W\nTURN FULLY CLOSED', twin(wallAt2(2, 40, 2, 0)), [0, 2.1, 0.03], 1.2, 0.4, SG2);
  vent2(cc2(2) + 0.5, cc2(40), 0.3); vent2(cc2(4) - 0.4, cc2(41), 0.3);
}
function campBunk2(T) {
  for (const y of [0.35, 1.25]) { k2Box(k2Sub(T, 0, y, 0.45), [1.95, 0.06, 0.85], pp2('olive', 'paint'), { bevel: 0.01 }); k2Box(k2Sub(T, 0, y + 0.09, 0.45), [1.85, 0.12, 0.78], pp2([0.38, 0.42, 0.34], 'cloth'), { bevel: 0.05, occ: false }); }
  for (const s of [-1, 1]) for (const zz of [0.06, 0.84]) k2Box(k2Sub(T, s * 0.95, 0.85, zz), [0.05, 1.7, 0.05], pp2('olive', 'paint'), { bevel: 0.006 });
}

// ================= north: the switchgear hall, the breakers, the time clock, the lift =================
function furnishNorth2() {
  const P = WP2.pos;
  // two lineups of metal-clad switchgear, back to back with an aisle down the middle
  for (const [zrow, face] of [[cc2(6), 1], [cc2(10) + 0.4, -1]]) for (const [xa, xb] of [[19.3, 25.6], [28.5, 34.8]]) {
    const n = Math.round((xb - xa) * CELL / 0.8), x0 = xa * CELL;
    for (let i = 0; i < n; i++) F2.switchgear(k2T(x0 + 0.4 + i * 0.8, 0, zrow, face > 0 ? 0 : Math.PI), i, (i * 7) % 3 !== 0);
    addSolid(x0, zrow - 0.5, x0 + n * 0.8, zrow + 0.5, 'prop');
    k2Extrude([x0, 2.95, zrow], [x0 + n * 0.8, 2.95, zrow], [[-0.3, 0], [0.3, 0], [0.3, 0.1], [0.28, 0.1], [0.28, 0.015], [-0.28, 0.015], [-0.28, 0.1], [-0.3, 0.1]], pp2('steel', 'steel'), { occ: false });
    for (let i = 0; i < 6; i++) k2Pipe([x0, 3.0, zrow - 0.22 + i * 0.09], [x0 + n * 0.8, 3.0, zrow - 0.22 + i * 0.09], 0.028, pp2(i % 2 ? 'black' : [0.3, 0.12, 0.1], 'rubber'), { seg: 6, occ: false });
    for (let x = x0 + 1.2; x < x0 + n * 0.8; x += 2.4) k2Pipe([x, 3.0, zrow], [x, 7.4, zrow], 0.02, pp2('steel', 'steel'), { seg: 6 });
  }
  // the transformer bay at the west end, behind a mesh partition
  for (const zc of [cc2(5) + 0.4, cc2(9) + 0.2]) { const T = k2T(cc2(18) + 0.5, 0, zc, Math.PI / 2); F2.transformer(T); solidAround2(T.o[0], zc, 0.8, 1.1); sign2('DANGER\n11 000 V', twin(pr2(T.o[0] + 0.72, zc, Math.PI / 2, 0)), [0, 1.6, 0.0], 0.7, 0.4, { hazard: true }); }
  for (let i = 0; i < 6; i++) k2Extrude([cc2(19) + 1.2, 0, cc2(4) - 1.0 + i * 1.8], [cc2(19) + 1.2, 2.6, cc2(4) - 1.0 + i * 1.8], PROF2.rect(0.06, 0.06), pp2('yellow', 'paint'), { caps: true });
  k2Pipe([cc2(19) + 1.2, 2.6, cc2(4) - 1.0], [cc2(19) + 1.2, 2.6, cc2(4) + 8.0], 0.03, pp2('yellow', 'paint'));
  // roof steel: I-beams across the hall
  for (let x = 18.5; x <= 36.5; x += 3) { k2Extrude([x * CELL, 7.25, 3 * CELL + 0.1], [x * CELL, 7.25, 14 * CELL - 0.1], PROF2.ibeam(0.25, 0.4), pp2('dgrey', 'paint'), { occ: true }); }
  // the breaker bank on the north wall: four big levers, numbered
  { const T = wallT2(27, 3, 3, 0); k2Box(k2Sub(T, 0, 1.2, 0.22), [3.6, 2.3, 0.44], pp2([0.34, 0.4, 0.36], 'paint'), { bevel: 0.03 }); sign2('MAIN BREAKERS\nGAMMA LIFT FEED', twin(wallAt2(27, 3, 3, 0)), [0, 2.6, 0.03], 2.2, 0.45, SGW2);
    P.breakers = [];
    for (let i = 0; i < 4; i++) { const lx = -1.2 + i * 0.8; k2Box(k2Sub(T, lx, 1.35, 0.48), [0.5, 0.9, 0.08], pp2('dgrey', 'paint'), { bevel: 0.02 }); sign2(String(i + 1), twin(wallAt2(27, 3, 3, 0)), [lx, 1.95, 0.53], 0.25, 0.25, SGW2);
      const r = wallAt2(27, 3, 3, 0), pivot = tnode(null, 0, 0, 0), q = localPt(r, lx, 1.35, 0.54); pivot.position.copyFrom(q); pivot.rotation.y = r.rotation.y;
      const h = mkMerged(WP2.propMat, Q => { Q('Box', { width: 0.07, height: 0.6, depth: 0.07 }, COL2.iron, 0, [0, 0.3, 0]); Q('Cylinder', { diameter: 0.12, height: 0.24, tessellation: 10 }, COL2.red, 0, [0, 0.62, 0], [0, 0, Math.PI / 2]); }, 'lever2');
      h.parent = pivot; pivot.rotation.x = 0.7; const pp = localPt(r, lx, 1.2, 1.0); P.breakers.push({ i, x: pp.x, z: pp.z, pivot, up: false }); }
    P.bank = localPt(r27_3(), 0, 1.2, 1.3); solidT2(T, -1.85, 0, 1.85, 0.6); }
  // the foreman's pipe: a vertical riser beside the bank, a wrench hung on it
  { const T = wallT2(25, 3, 3, 0.6); k2Pipe(k2P(T, 0, 0, 0.32), k2P(T, 0, 7.4, 0.32), 0.11, pp2('rust', 'rust'), { flange: true }); k2Box(k2Sub(T, 0.16, 1.4, 0.34, 0, 0, 0.3), [0.05, 0.42, 0.04], pp2('steel', 'steel'), { bevel: 0.01 });
    const r = wallAt2(25, 3, 3, 0.6); P.tapPipe = localPt(r, 0, 1.4, 1.0); P.foreman = localPt(r, 0.2, 0, 0.75); }
  // the time clock and the card rack, by the way in
  { const T = wallT2(25, 13, 1, 0); k2Box(k2Sub(T, 0, 1.4, 0.11), [0.42, 0.56, 0.22], pp2([0.6, 0.56, 0.42], 'paint'), { bevel: 0.03 }); k2Disc(k2Sub(T, 0, 1.52, 0.225, Math.PI / 2, 0, 0), 0.12, 0, 1, 20, pp2('white', 'paper'));
    k2Box(k2Sub(T, 0.7, 1.4, 0.04), [0.7, 0.9, 0.08], pp2('dgrey', 'paint'), { bevel: 0.01 }); for (let j = 0; j < 6; j++) for (let i = 0; i < 3; i++) k2Box(k2Sub(T, 0.5 + i * 0.2, 1.75 - j * 0.14, 0.09), [0.12, 0.2, 0.004], pp2('cream', 'paper'), { occ: false });
    sign2('PUNCH IN · PUNCH OUT', twin(wallAt2(25, 13, 1, 0)), [0.3, 2.0, 0.03], 1.2, 0.22, SGW2); P.clock = localPt(wallAt2(25, 13, 1, 0), 0, 1.4, 0.9); }
  // the north regulator in a mesh cage in the north-east corner
  { const T = wallT2(36, 4, 0, 0); F2.manifold(T); solidT2(T, -1.2, 0, 1.2, 0.95); P.nreg = v3(k2P(T, 0, 1.25, 1.5)); WP2.nregRoot = wallAt2(36, 4, 0, 0); F2.wheel(k2Sub(T, 0, 1.25, 1.05), 'red');
    for (let i = 0; i <= 6; i++) k2Extrude(k2P(T, -1.3 + i * 0.43, 0, 2.0), k2P(T, -1.3 + i * 0.43, 2.4, 2.0), PROF2.rect(0.04, 0.04), pp2('yellow', 'paint'), { caps: true, occ: false });
    k2Extrude(k2P(T, -1.3, 2.4, 2.0), k2P(T, 1.3, 2.4, 2.0), PROF2.rect(0.05, 0.05), pp2('yellow', 'paint'), { occ: false });
    sign2('REGULATOR N', twin(wallAt2(36, 4, 0, 0)), [0, 2.45, 0.03], 1.0, 0.25, SG2); }
  phone2(18, 12, 2, 'switch', 0);
  for (const [x, y] of [[22, 8], [31, 8], [26, 12]]) vent2(cc2(x), cc2(y), 0.5);
  // the lift corridor and the lift: a freight car behind a folding gate
  sign2('GAMMA LIFT ►\nFREIGHT · STAFF', twin(wallAt2(38, 8, 3, 0)), [0, 2.1, 0.03], 1.4, 0.42, SG2);
  phone2(46, 8, 1, 'lift', -0.6);
  { const x0 = 47 * CELL + 0.3, x1 = 51 * CELL - 0.3, z0 = 6 * CELL + 0.3, z1 = 11 * CELL - 0.3;
    // the car: a steel frame, mesh sides, a plate floor, the hoist ropes going up
    const W = 4.4, D = 3.8, cx = x0 + 1.05 + W / 2, cz = (z0 + z1) / 2;
    k2Box(k2T(cx, 0.06, cz), [W, 0.12, D], pp2('dgrey', 'steel'), { bevel: 0.01 });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) k2Extrude([cx + sx * W / 2, 0.1, cz + sz * D / 2], [cx + sx * W / 2, 3.2, cz + sz * D / 2], PROF2.rect(0.1, 0.1), pp2('yellow', 'paint'), { caps: true });
    k2Box(k2T(cx, 3.2, cz), [W + 0.1, 0.16, D + 0.1], pp2('yellow', 'paint'), { bevel: 0.01 });
    for (const sz of [-1, 1]) for (let i = 0; i < 9; i++) k2Pipe([cx - W / 2 + i * W / 8, 0.12, cz + sz * D / 2], [cx - W / 2 + i * W / 8, 3.15, cz + sz * D / 2], 0.012, pp2('steel', 'steel'), { seg: 5, occ: false });
    for (let i = 0; i < 4; i++) k2Pipe([cx - 0.3 + i * 0.2, 3.3, cz], [cx - 0.3 + i * 0.2, 4.2, cz], 0.012, pp2('steel', 'steel'), { seg: 5 });
    for (const sz of [-1, 1]) k2Extrude([cx, 0, cz + sz * (D / 2 + 0.25)], [cx, 4.2, cz + sz * (D / 2 + 0.25)], PROF2.ibeam(0.12, 0.12), pp2('dgrey', 'paint'), { caps: true });
    k2Box(k2T(cx + W / 2 + 0.5, 1.6, cz), [0.5, 3.2, 1.2], pp2('dgrey', 'rust'), { bevel: 0.02 }); addSolid(cx + W / 2 + 0.25, cz - 0.6, cx + W / 2 + 0.75, cz + 0.6, 'prop');
    for (const sz of [-1, 1]) addSolid(cx - W / 2, cz + sz * D / 2 - 0.06, cx + W / 2, cz + sz * D / 2 + 0.06, 'prop'); addSolid(cx + W / 2 - 0.06, cz - D / 2, cx + W / 2 + 0.06, cz + D / 2, 'prop');
    WP2.gateMesh = mkMerged(WP2.propMat, Q => { for (let i = 0; i < 14; i++) Q('Box', { width: 0.04, height: 2.3, depth: 0.04 }, COL2.yellow, 0, [x0 + 0.9, 1.15, z0 + 0.6 + i * ((z1 - z0 - 1.2) / 13)]); Q('Box', { width: 0.05, height: 0.05, depth: z1 - z0 - 1.0 }, COL2.yellow, 0, [x0 + 0.9, 2.3, (z0 + z1) / 2]); Q('Box', { width: 0.05, height: 0.05, depth: z1 - z0 - 1.0 }, COL2.yellow, 0, [x0 + 0.9, 0.2, (z0 + z1) / 2]); }, 'liftgate2');
    const T = wallT2(46, 8, 3, 0); k2Box(k2Sub(T, 0, 1.4, 0.06), [0.4, 0.7, 0.12], pp2('dgrey', 'paint'), { bevel: 0.02 }); emi2(WP2.BRed, k2Sub(T, 0, 1.6, 0.13), 'Sphere', { diameter: 0.09, segments: 8 }, [1, 0.2, 0.1], [0, 0, 0]); k2Box(k2Sub(T, 0, 1.3, 0.13), [0.12, 0.12, 0.04], pp2('white', 'plastic'), { bevel: 0.01 });
    const r = wallAt2(46, 8, 3, 0); P.liftPanel = localPt(r, 0, 1.3, 0.8); P.liftGateX = x0 + 0.9; WP2.liftGate = addSolid(x0 + 0.85, z0, x0 + 0.95, z1, 'liftgate'); P.liftCar = { x: cx, z: cz }; }
}
function r27_3() { return wallAt2(27, 3, 3, 0); }

// ================= east: the Long Pipe, cold room C, the valve room =================
function furnishEast2() {
  const P = WP2.pos;
  // the long pipe itself: a metre-wide main along the outer wall on saddles, an expansion bellows every so often
  const big = (a, b) => { k2Pipe(a, b, 0.52, pp2('alu', 'insul'), { step: 0.9, seg: 24 }); };
  const yb = 0.85;
  const xe = 52 * CELL - 0.75, zn = 19 * CELL + 0.75, zs = 47 * CELL - 0.75, RB = 1.0;
  big([28 * CELL, yb, zn], [xe - RB, yb, zn]); big([xe, yb, zn + RB], [xe, yb, zs - RB]); big([43 * CELL, yb, zs], [xe - RB, yb, zs]);
  k2Torus({ o: [xe - RB, yb, zn + RB], x: [0, 0, -1], y: [0, 1, 0], z: [1, 0, 0] }, RB, 0.52, 10, 22, pp2('alu', 'insul'), { a0: 0, a1: Math.PI / 2, occ: true });
  k2Torus({ o: [xe - RB, yb, zs - RB], x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, RB, 0.52, 10, 22, pp2('alu', 'insul'), { a0: 0, a1: Math.PI / 2, occ: true });
  k2Cyl(k2Sub(k2T(43 * CELL, yb, zs, 0), 0, 0, 0, 0, 0, Math.PI / 2), 0.52, 0, 0.01, 24, pp2('dgrey', 'steel'), { cap0: true, cap1: false });
  for (let x = 28.5; x <= 51; x += 2) { const T = k2T(x * CELL, 0, 19 * CELL + 0.75, 0); k2Box(k2Sub(T, 0, 0.17, 0), [0.32, 0.34, 1.3], pp2('dgrey', 'rust'), { bevel: 0.01 }); if (Math.round(x * 2) % 8 === 1) k2Cyl(k2Sub(T, 0, yb, 0, 0, 0, Math.PI / 2), 0.58, -0.3, 0.3, 24, pp2('dgrey', 'steel'), { occ: false }); }
  for (let y = 20.5; y <= 46; y += 2) { const T = k2T(52 * CELL - 0.75, 0, y * CELL, 0); k2Box(k2Sub(T, 0, 0.17, 0), [1.3, 0.34, 0.32], pp2('dgrey', 'rust'), { bevel: 0.01 }); }
  addSolid(28 * CELL, 19 * CELL, 51 * CELL + 1.4, 19 * CELL + 1.35, 'pipe'); addSolid(52 * CELL - 1.35, 20 * CELL - 0.3, 52 * CELL, 47 * CELL, 'pipe'); addSolid(43 * CELL, 47 * CELL - 1.35, 51 * CELL, 47 * CELL, 'pipe');
  phone2(51, 21, 2, 'long', 0); phone2(42, 46, 3, 'valve', 0.4);
  sign2('LONG PIPE · 210 M\nDO NOT RUN', twin(wallAt2(28, 19, 1, 0)), [0, 2.1, 0.03], 1.4, 0.42, SG2);
  sign2('VALVE ROOMS ▼', twin(wallAt2(51, 23, 2, 0)), [0, 2.15, 0.03], 1.2, 0.3, SG2);
  for (let x = 30; x <= 48; x += 4) vent2(cc2(x), cc2(19) + 1.0, 1.4);
  for (let y = 23; y <= 43; y += 4) vent2(cc2(51) + 1.0, cc2(y), 1.4);
  // debris along the dark stretch: a dropped glove, a hard hat, scrape marks
  for (let i = 0; i < 9; i++) { const y = 27 + i * 1.6, T = k2T(cc2(51) - 0.5 + rnd(-0.4, 0.4), 0, cc2(Math.floor(y)) + rnd(-1, 1), rnd(0, 6));
    if (i === 3) k2Lathe(T, [[0, 0.0], [0.17, 0.0], [0.17, 0.02], [0.14, 0.08], [0.1, 0.13], [0, 0.15]], 16, pp2('yellow', 'plastic'));
    else k2Box(k2Sub(T, 0, 0.015, 0), [rnd(0.1, 0.3), 0.025, rnd(0.1, 0.4)], pp2(pick(['black', 'cream', 'dgrey']), 'cloth'), { bevel: 0.005, occ: false }); }
  coldRoom2(49, 32, 'coldC');
  // the valve room: Benny's corner, the east manifold with no wheel on it, the header of valves
  { const T = wallT2(38, 46, 2, 0); F2.manifold(T); k2Cyl(k2Sub(T, 0, 1.25, 0.8, Math.PI / 2, 0, 0), 0.04, 0, 0.34, 8, pp2('steel', 'steel')); solidT2(T, -1.2, 0, 1.2, 0.95); P.ereg = v3(k2P(T, 0, 1.25, 1.5)); WP2.eregRoot = wallAt2(38, 46, 2, 0); sign2('REGULATOR E', twin(wallAt2(38, 46, 2, 0)), [0, 2.4, 0.03], 1.0, 0.25, SG2); }
  { const T = wallT2(39, 45, 3, 0.4); k2Pipe(k2P(T, -1.6, 2.1, 0.35), k2P(T, 1.6, 2.1, 0.35), 0.12, pp2('green', 'paint'), { flange: true }); for (let i = 0; i < 4; i++) { const x = -1.2 + i * 0.8; k2Pipe(k2P(T, x, 2.1, 0.35), k2P(T, x, 0.6, 0.35), 0.06, pp2('green', 'paint')); F2.gate(k2Sub(T, x, 1.1, 0.35), 0.06, i % 2 ? 'red' : 'blue'); } }
  { const T = wallT2(39, 47, 1, 0.3); k2Box(k2Sub(T, 0, 0.14, 0.45), [1.9, 0.25, 0.85], pp2([0.36, 0.34, 0.26], 'cloth'), { bevel: 0.04 }); k2Box(k2Sub(T, -0.65, 0.32, 0.45), [0.5, 0.12, 0.35], pp2([0.7, 0.68, 0.6], 'cloth'), { bevel: 0.04 }); solidT2(T, -1.0, 0, 1.0, 0.9); }
  { const T = wallT2(40, 45, 3, 0); for (let i = 0; i < 6; i++) k2Cyl(k2Sub(T, -0.4 + i * 0.16, 0, 0.4 + rnd(-0.1, 0.1)), 0.04, 0, 0.11, 10, pp2(pick(['red', 'steel', 'yellow']), 'paint')); }
  P.benny = { x: cc2(39) + 0.2, z: cc2(46) + 0.4 };
  P.valveDoor = { x: 41 * CELL + 0.1, z: cc2(46) };
}
