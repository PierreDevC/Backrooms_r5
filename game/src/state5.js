// ---------- r7 · Level 5: the State Floor ----------
// A wing kept for the hotel's important guests, reached only through the ballroom's portal door (STATE FLOOR). The Cross Hall
// (marble, columns, a red runner, chandeliers), the East Room (tall lit windows onto nothing, gold drapes, the big chandelier
// a female deathmoth hangs from), the Gold Room restaurant, its kitchen, and the security office with the fire panel.
// The emergency exit in the boiler room is on a fire lock as well as the boiler pressure: the panel in security resets it.
const ST5 = {};
function resetST5() {
  for (const k of Object.keys(ST5)) delete ST5[k];
  Object.assign(ST5, { seen: false, book: false, keys: false, sec: false, spray: 0, hasSpray: false, pest: false, fireKey: false, glass: false, reset: false,
    cctv: false, log: false, panelSeen: false, fedE: false, fedB: false, heard: false, bigSeen: false, lockSeen: false, roomT: {}, busy: 0 });
}
resetST5();
const ST5L = { xh: { x0: 23, y0: 21, x1: 36, y1: 22 }, er: { x0: 29, y0: 18, x1: 35, y1: 20 }, gr: { x0: 24, y0: 23, x1: 28, y1: 26 }, kt: { x0: 29, y0: 23, x1: 31, y1: 25 }, sc: { x0: 33, y0: 23, x1: 35, y1: 24 } };
const ST5H = { xh: 4.4, er: 5.6, gr: 4.0 };

// ----- layout (genLayout5, before the edges are resolved) -----
function planState5(room, rect, way, vest) {
  LV.st5 = null;
  let free = true;
  for (const r of Object.values(ST5L)) for (let y = r.y0; y <= r.y1; y++) for (let x = r.x0; x <= r.x1; x++) if (LV.zone[cIdx(x, y)] !== Z5.VOID) free = false;
  for (const [x, y] of [[20, 19], [21, 19], [22, 21], [21, 21]]) if (LV.zone[cIdx(x, y)] !== Z5.VOID) free = false;
  if (!free) return;
  const S = (m, c, h, t) => ({ m, c, h, t }), F = (m, col, cm, h, ccol) => ({ m, col, cm, h, ccol }), R = (k, zone, t, o) => { const q = ST5L[k]; return rect(room(zone, R5.ST, t, o), q.x0, q.y0, q.x1, q.y1); };
  const xh = R('xh', Z5.EXEC, 'xhall', { side: S('deco', [1.32, 1.26, 1.1], ST5H.xh, TRIM5.gold), flr: F('check', [1.08, 1.02, 0.92], 'bceil', ST5H.xh, [1.15, 1.1, 1.0]) });
  const er = R('er', Z5.EXEC, 'eroom', { side: S('deco', [1.4, 1.34, 1.2], ST5H.er, TRIM5.gold), flr: F('check', [0.86, 0.66, 0.46], 'bceil', ST5H.er, [1.2, 1.15, 1.05]) });
  const gr = R('gr', Z5.REST, 'gold', { side: S('deco', [1.3, 1.0, 0.56], ST5H.gr, TRIM5.gold), flr: F('carpet', [0.8, 0.24, 0.2], 'bceil', ST5H.gr, [1.1, 0.95, 0.7]) });
  const kt = R('kt', Z5.KITCH, 'kitchen', { side: S('tilew', [0.96, 0.98, 0.95], CEIL, TRIM5.steel), flr: F('tile', [0.78, 0.8, 0.78], 'bconc', CEIL, [0.8, 0.8, 0.76]) });
  const sc = R('sc', Z5.EXEC, 'sec', { side: S('bconc', [0.8, 0.84, 0.76], CEIL, TRIM5.serv), flr: F('tile', [0.5, 0.54, 0.52], 'bconc', CEIL, [0.7, 0.7, 0.66]) });
  const a = vest(20, 19, 2, R5.BEV, 'STATE FLOOR'), b = vest(22, 21, 0, R5.ST, 'BALLROOM');
  LV.warps.push({ a, b, key: 'C' });
  way(30, 21, 3, 'arch', { big: true, sign: 'EAST ROOM', from: [30, 21] }); way(34, 21, 3, 'arch', { big: true, from: [34, 21] });
  way(26, 22, 1, 'arch', { big: true, sign: 'THE GOLD ROOM', from: [26, 22] });
  way(30, 22, 1, 'door', { dk: 'kitchen', plaque: 'KITCHEN', from: [30, 22] });
  way(28, 24, 0, 'door', { dk: 'swing', from: [28, 24] });
  way(34, 22, 1, 'door', { dk: 'security', plaque: 'SECURITY', from: [34, 22] });
  LV.st5 = { xh, er, gr, kt, sc, va: a, vb: b };
}
function inSt5(c) { return c >= 0 && LV.reg[c] === R5.ST; }
function stRoom5(c) { const r = c >= 0 && LV.room[c] >= 0 ? LV.rooms[LV.room[c]] : null; return r && r.reg === R5.ST ? r.t : null; }
const box5 = k => { const q = ST5L[k]; return { X0: q.x0 * CELL, Z0: q.y0 * CELL, X1: (q.x1 + 1) * CELL, Z1: (q.y1 + 1) * CELL }; };

// ----- lights (planLights5 → lightPlaces5) -----
function lightState5() {
  if (!LV.st5) return;
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  const S = LV.st5, zc = 22 * CELL;
  S.chXH = [25, 28.5, 32, 35.2].map(k => { const x = k * CELL; F(x, zc, { I: 0.55, rad: 11, sc: 3.4, y: ST5H.xh - 1.0 }); return { x, z: zc }; });
  const E = box5('er'); S.chER = { x: (E.X0 + E.X1) / 2, z: (E.Z0 + E.Z1) / 2 };
  F(S.chER.x, S.chER.z, { I: 1.05, rad: 16, sc: 6, y: 3.6 });
  for (let x = 29; x <= 35; x++) F(cellCenter(x), E.Z0 + 0.9, { I: 0.3, rad: 5.5, sc: 2.0, state: x === 33 ? 2 : 1 });
  for (let y = 18; y <= 20; y++) F(E.X1 - 0.9, cellCenter(y), { I: 0.28, rad: 5.5, sc: 2.0 });
  const Gd = box5('gr'); S.chGR = [0.36, 0.7].map(k => { const x = lerp(Gd.X0, Gd.X1, k), z = (Gd.Z0 + Gd.Z1) / 2 - 0.4; return F(x, z, { I: 0.72, rad: 11, sc: 3.6, y: 3.1 }); });
  for (const [kx, kz] of [[0.08, 0.15], [0.92, 0.15], [0.08, 0.85], [0.92, 0.85]]) F(lerp(Gd.X0, Gd.X1, kx), lerp(Gd.Z0, Gd.Z1, kz), { I: 0.24, rad: 6, sc: 2 });
  for (const [x, y, st] of [[29, 23, 1], [31, 24, 2], [29, 25, 1]]) { F(cellCenter(x), cellCenter(y), { state: st, I: 0.6, rad: 7.5, sc: 2.2 }); LV.bulbs.push({ x: cellCenter(x), z: cellCenter(y), y: CEIL, kind: 'bare', state: st }); }
  { const x = 34.5 * CELL, z = 24 * CELL; F(x, z, { I: 0.55, rad: 8, sc: 2.2 }); F(x, 25 * CELL - 0.9, { I: 0.25, rad: 4, sc: 1.4 }); LV.bulbs.push({ x, z, y: CEIL, kind: 'pend', state: 1 }); }
  F(36.7 * CELL, zc, { I: 0.2, rad: 5, sc: 1.4, state: 2 });   // the landing at the top of the closed stair
}

// ----- the State Floor's furniture -----
const MARB5 = [0.92, 0.9, 0.85];
function column5(B, x, z, h) {
  const r = propRoot(x, z, 0), M = MARB5, G = COL5.gold, sh = h - 0.9;
  B.add(r, 'Box', { width: 0.72, height: 0.22, depth: 0.72 }, M.map(v => v * 0.92), 0, [0, 0.11, 0]);
  B.add(r, 'Cylinder', { diameter: 0.62, height: 0.12, tessellation: 18 }, M, 0, [0, 0.28, 0]);
  B.add(r, 'Cylinder', { diameterTop: 0.44, diameterBottom: 0.5, height: sh, tessellation: 20 }, M, 0, [0, 0.34 + sh / 2, 0]);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; B.add(r, 'Box', { width: 0.035, height: sh - 0.2, depth: 0.025 }, M.map(v => v * 0.82), 0, [Math.sin(a) * 0.238, 0.34 + sh / 2, Math.cos(a) * 0.238], [0, a, 0]); }
  B.add(r, 'Cylinder', { diameterTop: 0.7, diameterBottom: 0.46, height: 0.24, tessellation: 18 }, G, 0, [0, 0.34 + sh + 0.12, 0]);
  B.add(r, 'Box', { width: 0.78, height: 0.14, depth: 0.78 }, M, 0, [0, h - 0.24, 0]);
  addSolid(x - 0.34, z - 0.34, x + 0.34, z + 0.34, 'prop');
}
// a tall window that glows onto nothing (arched top, mullions, sill); drapes optional. Local +z into the room, wall at z = 0
function window5(B, r, w, sill, head, o = {}) {
  const WB = W5.winB, PANE = [0.9, 0.93, 1], FR = o.frame || [0.92, 0.9, 0.84], h = head - sill, top = head + w / 2;
  WB.add(r, 'Box', { width: w, height: h, depth: 0.02 }, PANE, 0.55, [0, sill + h / 2, 0.012]);
  WB.add(r, 'Cylinder', { diameter: w, height: 0.02, tessellation: 22, arc: 0.5 }, PANE, 0.55, [0, head, 0.012], [Math.PI / 2, 0, Math.PI / 2]);
  for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.1, height: h, depth: 0.12 }, FR, 0, [s * (w / 2 + 0.05), sill + h / 2, 0.06]);
  for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI, x = Math.sin(a) * (w / 2 + 0.05), y = head + Math.cos(a) * (w / 2 + 0.05); B.add(r, 'Box', { width: 0.1, height: 0.12, depth: 0.12 }, FR, 0, [x, y, 0.06], [0, 0, -a]); }
  for (const f of [-1 / 3, 0, 1 / 3]) B.add(r, 'Box', { width: 0.035, height: h + w / 2 * Math.cos(Math.asin(Math.abs(f) * 2)) - 0.04, depth: 0.05 }, FR, 0, [f * w, sill + (h + w / 2 * Math.cos(Math.asin(Math.abs(f) * 2))) / 2, 0.04]);
  for (let y = sill + 0.55; y < head; y += 0.55) B.add(r, 'Box', { width: w, height: 0.035, depth: 0.05 }, FR, 0, [0, y, 0.04]);
  B.add(r, 'Box', { width: w + 0.34, height: 0.07, depth: 0.26 }, FR, 0, [0, sill - 0.03, 0.12]);
  if (o.drape) {
    const D = o.drape, dh = top + 0.35;
    for (const s of [-1, 1]) {
      const cx = s * (w / 2 + 0.32);
      B.add(r, 'Box', { width: 0.56, height: dh, depth: 0.08 }, D, 0, [cx, dh / 2, 0.16]);
      for (let k = 0; k < 4; k++) B.add(r, 'Box', { width: 0.09, height: dh - 0.04, depth: 0.05 }, D.map(v => v * (k % 2 ? 0.7 : 1.15)), 0, [cx - 0.21 + k * 0.14, dh / 2, 0.22]);
      B.add(r, 'Box', { width: 0.6, height: 0.08, depth: 0.12 }, COL5.gold, 0, [cx, 1.1, 0.24]);   // tie-back
    }
    B.add(r, 'Box', { width: w + 1.3, height: 0.42, depth: 0.16 }, D.map(v => v * 0.9), 0, [0, dh - 0.12, 0.2]);
    B.add(r, 'Box', { width: w + 1.36, height: 0.05, depth: 0.2 }, COL5.gold, 0, [0, dh - 0.34, 0.22]);
  }
}
function bigPainting5(B, r, w, h, y, seed) {
  B.add(r, 'Box', { width: w + 0.24, height: h + 0.24, depth: 0.07 }, COL5.gold, 0, [0, y, 0.035]);
  B.add(r, 'Box', { width: w + 0.08, height: h + 0.08, depth: 0.075 }, COL5.gold.map(v => v * 0.7), 0, [0, y, 0.04]);
  B.add(r, 'Box', { width: w, height: h, depth: 0.012 }, [0.1, 0.08, 0.06], 0, [0, y, 0.08]);
  B.add(r, 'Box', { width: w * 0.42, height: h * 0.55, depth: 0.014 }, [0.05, 0.045, 0.04], 0, [(seed - 0.5) * w * 0.2, y - h * 0.15, 0.085]);   // a sitter, dark coat
  B.add(r, 'Box', { width: w * 0.18, height: w * 0.2, depth: 0.016 }, [0.5, 0.4, 0.32], 0, [(seed - 0.5) * w * 0.2, y + h * 0.2, 0.086]);
  B.add(r, 'Box', { width: 0.3, height: 0.05, depth: 0.03 }, COL5.brass, 0, [0, y - h / 2 - 0.2, 0.06]);
}
function bust5(B, x, z, ry) {
  const r = propRoot(x, z, ry), M = MARB5;
  B.add(r, 'Box', { width: 0.42, height: 1.1, depth: 0.42 }, M.map(v => v * 0.9), 0, [0, 0.55, 0]); B.add(r, 'Box', { width: 0.5, height: 0.06, depth: 0.5 }, M, 0, [0, 1.13, 0]);
  B.add(r, 'Box', { width: 0.42, height: 0.24, depth: 0.22 }, M, 0, [0, 1.28, 0]); B.add(r, 'Cylinder', { diameter: 0.1, height: 0.12, tessellation: 8 }, M, 0, [0, 1.44, 0]);
  B.add(r, 'Sphere', { diameter: 0.24, segments: 10 }, M, 0, [0, 1.6, 0.01], null, [0.88, 1.1, 0.96]);
  addSolid(x - 0.26, z - 0.26, x + 0.26, z + 0.26, 'prop');
}
function booth5(B, r) {   // a high-backed booth: two benches facing across a small table, against the wall
  const RD = [0.42, 0.06, 0.07];
  for (const s of [-1, 1]) {
    B.add(r, 'Box', { width: 0.55, height: 0.45, depth: 1.3 }, RD, 0, [s * 0.75, 0.23, 0.7]); B.add(r, 'Box', { width: 0.18, height: 1.3, depth: 1.3 }, RD.map(v => v * 0.85), 0, [s * 1.05, 0.65, 0.7]);
    B.add(r, 'Box', { width: 0.2, height: 0.06, depth: 1.34 }, COL5.mahog2, 0, [s * 1.05, 1.32, 0.7]);
  }
  B.add(r, 'Box', { width: 0.8, height: 0.05, depth: 1.1 }, [0.9, 0.88, 0.82], 0, [0, 0.76, 0.7]); B.add(r, 'Box', { width: 0.12, height: 0.74, depth: 0.12 }, COL5.mahog, 0, [0, 0.37, 0.7]);
  W5.BOn.add(r, 'Cylinder', { diameterTop: 0.12, diameterBottom: 0.18, height: 0.14, tessellation: 10 }, [1, 0.8, 0.5], 0.35, [0, 1.6, 0.12]);
  solidLocal(r, -1.2, 0, 1.2, 1.4);
}
function stove5(B, r) {
  const ST = [0.62, 0.63, 0.62];
  B.add(r, 'Box', { width: 1.4, height: 0.9, depth: 0.8 }, ST, 0, [0, 0.45, 0.4]); B.add(r, 'Box', { width: 1.44, height: 0.04, depth: 0.84 }, [0.2, 0.2, 0.2], 0, [0, 0.92, 0.42]);
  for (const [x, z] of [[-0.35, 0.25], [0.35, 0.25], [-0.35, 0.6], [0.35, 0.6]]) B.add(r, 'Cylinder', { diameter: 0.26, height: 0.03, tessellation: 12 }, [0.08, 0.08, 0.08], 0, [x, 0.95, z]);
  B.add(r, 'Box', { width: 1.1, height: 0.5, depth: 0.02 }, [0.3, 0.3, 0.3], 0, [0, 0.42, 0.81]); B.add(r, 'Box', { width: 0.8, height: 0.04, depth: 0.05 }, [0.75, 0.75, 0.74], 0, [0, 0.72, 0.84]);
  B.add(r, 'Box', { width: 1.6, height: 0.5, depth: 0.9 }, ST.map(v => v * 0.9), 0, [0, 2.15, 0.45]); B.add(r, 'Box', { width: 0.4, height: 0.6, depth: 0.4 }, ST.map(v => v * 0.8), 0, [0, 2.6, 0.3]);
  B.add(r, 'Cylinder', { diameter: 0.34, height: 0.24, tessellation: 12 }, [0.4, 0.4, 0.42], 0, [-0.35, 1.08, 0.25]);   // a stock pot
  solidLocal(r, -0.7, 0, 0.7, 0.82);
}
function counter5(B, r, len) {
  const ST = [0.66, 0.67, 0.66];
  B.add(r, 'Box', { width: len, height: 0.88, depth: 0.65 }, ST.map(v => v * 0.85), 0, [0, 0.44, 0.33]); B.add(r, 'Box', { width: len + 0.04, height: 0.04, depth: 0.7 }, ST, 0, [0, 0.9, 0.35]);
  for (let i = 0; i < len * 3; i++) if (RNG() < 0.5) B.add(r, 'Cylinder', { diameter: 0.24, height: rnd(0.05, 0.3), tessellation: 12 }, [0.92, 0.92, 0.9], 0, [-len / 2 + 0.2 + i / 3, 1.0, 0.35]);
  solidLocal(r, -len / 2, 0, len / 2, 0.7);
}
function furnishState5(B) {
  const S = LV.st5; if (!S) return;
  const winM = actMat('win5', { emis: 1 }); setEmi(winM, 2.0, 2.05, 2.2); W5.winB = new PropBatch(winM); W5.winB.fast = true;
  const X = box5('xh'), zc = 22 * CELL, H = ST5H.xh, GOLDD = [0.66, 0.44, 0.12];
  // ---- the Cross Hall ----
  { const L = 36 * CELL - X.X0 - 0.4, r = propRoot((X.X0 + 36 * CELL) / 2, zc, 0);   // the red runner, gold-edged
    B.add(r, 'Box', { width: L, height: 0.012, depth: 1.9 }, [0.52, 0.05, 0.06], 0, [0, 0.006, 0]);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: L, height: 0.015, depth: 0.07 }, COL5.gold, 0, [0, 0.008, s * 0.92]);
    for (let i = 0; i < 12; i++) B.add(r, 'Box', { width: 0.5, height: 0.014, depth: 0.5 }, [0.7, 0.55, 0.2], 0, [-L / 2 + 1.5 + i * (L - 3) / 11, 0.007, 0], [0, Math.PI / 4, 0]); }
  for (let k = 24; k <= 35; k++) for (const z of [X.Z0 + WT / 2 + 0.5, X.Z1 - WT / 2 - 0.5]) column5(B, k * CELL, z, H);
  for (const [z, s] of [[X.Z0 + WT / 2, 1], [X.Z1 - WT / 2, -1]]) {   // entablature along both long walls
    const r = propRoot((X.X0 + 36 * CELL) / 2, z, 0), L = 36 * CELL - X.X0;
    B.add(r, 'Box', { width: L, height: 0.24, depth: 0.88 }, MARB5, 0, [0, H - 0.12, s * 0.44]); B.add(r, 'Box', { width: L, height: 0.05, depth: 0.9 }, COL5.gold, 0, [0, H - 0.27, s * 0.45]);
  }
  for (let x = 23; x <= 28; x++) window5(B, atWall5({ x, y: 21, d: 3 }, 0, 0), 1.5, 0.7, 3.0, { drape: [0.5, 0.08, 0.08] });   // lit windows onto nothing
  for (const x of [23, 25, 27, 29, 31, 33, 35]) { if (x === 26 || x === 30 || x === 34) continue; const s = { x, y: 22, d: 1 }; bigPainting5(B, atWall5(s, 0, 0), 1.1, 1.4, 2.3, hash1(x * 3.7)); }
  for (const [x, z, ry] of [[24.5, X.Z0 + 1.15, 0], [27.5, X.Z0 + 1.15, 0], [32.5, X.Z1 - 1.15, Math.PI], [28.5, X.Z1 - 1.15, Math.PI]]) bust5(B, x * CELL, z, ry);
  for (const x of [25.5, 31.5, 33.5]) placeF5(B, { x: Math.floor(x), y: x === 25.5 ? 22 : 21, d: x === 25.5 ? 1 : 3 }, 0, 'bench', { hw: 0.76 });
  sign5('THE STATE FLOOR', atWall5({ x: 23, y: 21, d: 2 }, -1.3, 0), [0, 3.4, 0.03], 2.6, 0.4, { bold: true, emis: 0.4 });
  for (const xc of S.chXH) chandelier5(propRoot(xc.x, xc.z, 0), 0.95, H, false);
  // the grand stair at the east end: roped off, double doors at the top
  { const x0 = 36 * CELL + 0.1, x1 = X.X1 - WT / 2, n = 8, dd = 0.36, rh = 0.22, zw0 = X.Z0 + 0.7, zw1 = X.Z1 - 0.7, w = zw1 - zw0;
    for (let i = 0; i < n; i++) { const r = propRoot(x0 + (i + 0.5) * dd, zc, 0); B.add(r, 'Box', { width: dd, height: (i + 1) * rh, depth: w }, MARB5, 0, [0, (i + 1) * rh / 2, 0]); B.add(r, 'Box', { width: dd + 0.01, height: 0.012, depth: 1.6 }, [0.52, 0.05, 0.06], 0, [0, (i + 1) * rh + 0.006, 0]); }
    const top = n * rh, lr = propRoot((x0 + n * dd + x1) / 2, zc, 0); B.add(lr, 'Box', { width: x1 - x0 - n * dd, height: top, depth: w }, MARB5, 0, [0, top / 2, 0]);
    for (const s of [-1, 1]) {   // balustrades
      const zz = zc + s * (w / 2 + 0.06), L = n * dd, ang = Math.atan2(top, L), r = propRoot(x0 + L / 2, zz, 0);
      B.add(r, 'Box', { width: Math.hypot(L, top) + 0.1, height: 0.08, depth: 0.12 }, COL5.mahog2, 0, [0, top / 2 + 0.95, 0], [0, 0, ang]);
      for (let i = 0; i < n; i++) B.add(propRoot(x0 + (i + 0.5) * dd, zz, 0), 'Box', { width: 0.05, height: 0.95, depth: 0.05 }, MARB5, 0, [0, (i + 1) * rh + 0.47, 0]);
    }
    const dr = atWall5({ x: 36, y: 21, d: 0 }, -CELL / 2, 0);   // double doors, centred on the hall
    for (const s of [-1, 1]) { B.add(dr, 'Box', { width: 0.95, height: 2.7, depth: 0.06 }, [0.18, 0.1, 0.06], 0, [s * 0.5, top + 1.35, 0.04]); B.add(dr, 'Box', { width: 0.04, height: 0.4, depth: 0.05 }, COL5.gold, 0, [s * 0.1, top + 1.3, 0.09]); }
    B.add(dr, 'Box', { width: 2.4, height: 0.24, depth: 0.1 }, COL5.gold, 0, [0, top + 2.82, 0.05]);
    plaqueOn(dr, 0, top + 3.15, 'RESIDENCE', 0.5, 0.1, 0.1);
    for (const s of [-1, 1]) { const p = propRoot(x0 - 0.45, zc + s * 1.3, 0); B.add(p, 'Cylinder', { diameter: 0.08, height: 0.95, tessellation: 8 }, COL5.brass, 0, [0, 0.47, 0]); B.add(p, 'Cylinder', { diameter: 0.3, height: 0.04, tessellation: 12 }, COL5.brass, 0, [0, 0.02, 0]); B.add(p, 'Sphere', { diameter: 0.12, segments: 6 }, COL5.brass, 0, [0, 0.98, 0]); }
    for (let i = 0; i < 6; i++) { const t = (i + 0.5) / 6, zz = zc - 1.3 + t * 2.6, y = 0.9 - Math.sin(t * Math.PI) * 0.18; B.add(propRoot(x0 - 0.45, zz, 0), 'Box', { width: 0.05, height: 0.05, depth: 2.6 / 6 + 0.02 }, [0.6, 0.06, 0.08], 0, [0, y, 0], [(t - 0.5) * 0.5, 0, 0]); }
    const sg = propRoot(x0 - 0.45, zc, -Math.PI / 2); plaqueOn(sg, 0, 1.18, 'UPPER GALLERY CLOSED', 0.6, 0.1, 0.05);
    addSolid(x0 - 0.55, X.Z0, X.X1, X.Z1, 'prop');
  }
  // ---- the East Room ----
  const E = box5('er');
  for (let x = 29; x <= 35; x++) window5(B, atWall5({ x, y: 18, d: 3 }, 0, 0), 1.7, 0.45, 3.9, { drape: GOLDD });
  for (let y = 18; y <= 20; y++) window5(B, atWall5({ x: 35, y, d: 0 }, 0, 0), 1.7, 0.45, 3.9, { drape: GOLDD });
  chandelier5(propRoot(S.chER.x, S.chER.z, 0), 1.9, ST5H.er, true);
  piano5(B, propRoot(E.X0 + 2.2, E.Z0 + 2.4, Math.PI * 0.75)); addSolid(E.X0 + 1.1, E.Z0 + 1.2, E.X0 + 3.4, E.Z0 + 3.6, 'prop');
  for (const x of [29, 32, 35]) bigPainting5(B, atWall5({ x, y: 20, d: 1 }, 0, 0), 1.3, 1.7, 2.6, hash1(x * 1.9));
  for (let i = 0; i < 9; i++) {   // gold ballroom chairs along the walls, one knocked over
    const q = propRoot(E.X0 + 4.2 + i * 2.3, E.Z1 - 0.7, Math.PI + rnd(-0.1, 0.1)), tip = i === 5, C = COL5.gold.map(v => v * 0.85);
    if (tip) { B.add(q, 'Box', { width: 0.42, height: 0.42, depth: 0.05 }, [0.6, 0.1, 0.1], 0, [0, 0.1, 0.2], [Math.PI / 2 - 0.1, 0, 0]); continue; }
    B.add(q, 'Box', { width: 0.42, height: 0.06, depth: 0.42 }, [0.6, 0.1, 0.1], 0, [0, 0.46, 0]); B.add(q, 'Box', { width: 0.42, height: 0.5, depth: 0.04 }, C, 0, [0, 0.74, -0.2]);
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) B.add(q, 'Box', { width: 0.025, height: 0.44, depth: 0.025 }, C, 0, [lx, 0.22, lz]);
  }
  { const r = propRoot(E.X1 - 2.6, E.Z1 - 2.2, 0.3);   // a sofa under a dust sheet
    B.add(r, 'Box', { width: 2.0, height: 0.5, depth: 0.9 }, [0.88, 0.87, 0.82], 0, [0, 0.3, 0]); B.add(r, 'Box', { width: 2.0, height: 0.6, depth: 0.3 }, [0.86, 0.85, 0.8], 0, [0, 0.7, -0.35], [-0.15, 0, 0]);
    B.add(r, 'Box', { width: 2.2, height: 0.04, depth: 1.1 }, [0.9, 0.89, 0.84], 0, [0, 0.03, 0.05], [0.02, 0, 0]); solidLocal(r, -1.0, -0.5, 1.0, 0.5); }
  // ---- the Gold Room ----
  const Gd = box5('gr');
  for (const [x, z] of [[91.0, 88.0], [95.4, 88.6], [99.8, 88.0], [91.0, 92.8], [95.4, 93.4], [99.8, 92.6]]) roundTable5(B, x, z, RNG() < 0.5);
  S.t9 = { x: 102.3, z: 95.5 }; roundTable5(B, S.t9.x, S.t9.z, false);
  for (const y of [23, 24, 25, 26]) booth5(B, atWall5({ x: 24, y, d: 2 }, 0, 0));
  for (const y of [23, 25, 26]) { const r = atWall5({ x: 28, y, d: 0 }, 0, 0); B.add(r, 'Box', { width: 1.1, height: 2.0, depth: 0.06 }, COL5.gold, 0, [0, 1.75, 0.03]); B.add(r, 'Box', { width: 0.94, height: 1.84, depth: 0.065 }, [0.5, 0.54, 0.56], 0.04, [0, 1.75, 0.035]); }
  for (const c of S.chGR) chandelier5(propRoot(c.x, c.z, 0), 1.0, ST5H.gr, false);
  placeF5(B, { x: 24, y: 23, d: 3 }, 1.2, 'palm', { hw: 0.3 }); placeF5(B, { x: 28, y: 26, d: 1 }, -1.2, 'palm', { hw: 0.3 }); placeF5(B, { x: 28, y: 26, d: 0 }, 0.9, 'cart', { hw: 0.48 });
  { const r = propRoot(98.2, Gd.Z0 + 1.2, Math.PI);   // the maître d's stand, just inside the arch
    B.add(r, 'Box', { width: 0.7, height: 1.05, depth: 0.5 }, COL5.mahog, 0, [0, 0.52, 0]); B.add(r, 'Box', { width: 0.76, height: 0.05, depth: 0.56 }, COL5.gold, 0, [0, 1.07, 0], [-0.25, 0, 0]);
    B.add(r, 'Box', { width: 0.44, height: 0.04, depth: 0.32 }, [0.24, 0.06, 0.05], 0, [0, 1.12, 0.03], [-0.25, 0, 0]); B.add(r, 'Box', { width: 0.42, height: 0.01, depth: 0.3 }, [0.92, 0.9, 0.82], 0, [0, 1.145, 0.03], [-0.25, 0, 0]);
    solidLocal(r, -0.38, -0.3, 0.38, 0.3); S.stand = { x: r.position.x, z: r.position.z }; plaqueOn(r, 0, 0.75, 'PLEASE WAIT TO BE SEATED', 0.5, 0.08, 0.27); }
  // ---- the kitchen ----
  const K = box5('kt');
  { const r = propRoot((K.X0 + K.X1) / 2, (K.Z0 + K.Z1) / 2 + 0.4, 0), ST = [0.66, 0.67, 0.66];
    B.add(r, 'Box', { width: 3.4, height: 0.88, depth: 1.1 }, ST.map(v => v * 0.85), 0, [0, 0.44, 0]); B.add(r, 'Box', { width: 3.44, height: 0.04, depth: 1.14 }, ST, 0, [0, 0.9, 0]);
    for (let i = 0; i < 6; i++) B.add(r, 'Cylinder', { diameter: rnd(0.2, 0.32), height: rnd(0.1, 0.24), tessellation: 12 }, [0.5, 0.5, 0.52], 0, [-1.4 + i * 0.56, 1.0, rnd(-0.3, 0.3)]);
    B.add(r, 'Box', { width: 3.0, height: 0.04, depth: 0.04 }, COL5.iron, 0, [0, 2.15, 0]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.03, height: CEIL - 2.15, depth: 0.03 }, COL5.iron, 0, [s * 1.4, (CEIL + 2.15) / 2, 0]);
    for (let i = 0; i < 7; i++) { const x = -1.3 + i * 0.43; B.add(r, 'Box', { width: 0.01, height: 0.2, depth: 0.01 }, COL5.iron, 0, [x, 2.05, 0]); B.add(r, 'Cylinder', { diameter: rnd(0.18, 0.3), height: 0.14, tessellation: 12 }, pick([[0.6, 0.36, 0.2], [0.42, 0.42, 0.44]]), 0, [x, 1.86, 0]); }
    solidLocal(r, -1.75, -0.6, 1.75, 0.6); }
  stove5(B, atWall5({ x: 29, y: 25, d: 1 }, 0, 0)); stove5(B, atWall5({ x: 30, y: 25, d: 1 }, 0, 0));
  { const r = atWall5({ x: 31, y: 25, d: 1 }, 0, 0); counter5(B, r, 2.4); B.add(r, 'Box', { width: 0.8, height: 0.1, depth: 0.5 }, [0.3, 0.32, 0.33], 0, [0.4, 0.88, 0.35]); B.add(r, 'Cylinder', { diameter: 0.03, height: 0.4, tessellation: 6 }, [0.7, 0.7, 0.72], 0, [0.4, 1.15, 0.1]); }
  counter5(B, atWall5({ x: 29, y: 23, d: 3 }, 0, 0), 2.6); counter5(B, atWall5({ x: 31, y: 23, d: 3 }, 0, 0), 2.6);
  placeF5(B, { x: 31, y: 23, d: 0 }, 0, 'shelf', { hw: 0.7 }); placeF5(B, { x: 31, y: 25, d: 0 }, 0, 'shelf', { hw: 0.7 });
  S.pantry = atWall5({ x: 31, y: 24, d: 0 }, 0, 0); placeF5(B, { x: 31, y: 24, d: 0 }, 0, 'shelf', { hw: 0.7 });
  counter5(B, atWall5({ x: 29, y: 23, d: 2 }, 0, 0), 2.6);
  // ---- the security office ----
  const C = box5('sc');
  { const r = atWall5({ x: 34, y: 24, d: 1 }, 0, 0); S.desk = r;
    B.add(r, 'Box', { width: 3.0, height: 0.06, depth: 0.8 }, [0.3, 0.32, 0.3], 0, [0, 0.76, 0.45]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.06, height: 0.74, depth: 0.76 }, [0.24, 0.26, 0.24], 0, [s * 1.45, 0.37, 0.45]);
    for (let i = 0; i < 4; i++) { const x = -1.08 + i * 0.72, y = i % 2 ? 1.34 : 1.02; B.add(r, 'Box', { width: 0.6, height: 0.48, depth: 0.5 }, [0.2, 0.2, 0.19], 0, [x, y + 0.04, 0.32]); }
    solidLocal(r, -1.5, 0, 1.5, 0.86);
    const ch = propRoot(r.position.x + 0.6, r.position.z - 1.4, 2.6); FURN5.armchair(B, ch, { col: [0.16, 0.2, 0.2] }); solidLocal(ch, -0.4, 0, 0.4, 0.83); }
  placeF5(B, { x: 33, y: 23, d: 2 }, 0.6, 'lockers', { hw: 0.6 });
  { const r = atWall5({ x: 33, y: 24, d: 2 }, 0, 0); B.add(r, 'Cylinder', { diameter: 0.04, height: 1.8, tessellation: 6 }, COL5.brass, 0, [0.6, 0.9, 0.3]); B.add(r, 'Box', { width: 0.5, height: 1.0, depth: 0.25 }, [0.12, 0.14, 0.2], 0, [0.6, 1.25, 0.32]); B.add(r, 'Cylinder', { diameter: 0.3, height: 0.08, tessellation: 12 }, [0.1, 0.12, 0.16], 0, [0.6, 1.86, 0.3]); }
  S.panelR = atWall5({ x: 35, y: 23, d: 0 }, -CELL / 2 + 0.1, 0);
  // ---- moth nests: the Gold Room's males circle its chandeliers; a female hangs from the East Room chandelier ----
  W5.nests.push({ x: S.chGR[0].x, z: S.chGR[0].z, c: cell5(S.chGR[0].x, S.chGR[0].z), boil: false, loyal: S.chGR });
  W5.fnests = W5.fnests || [];
  W5.fnests.push({ x: S.chER.x + 1.4, z: S.chER.z + 0.3, y: 3.55, c: cell5(S.chER.x, S.chER.z), leash: 8.5, where: 'EAST ROOM', bowl: { x: S.chER.x + 0.6, z: S.chER.z + 2.6 } });
}
// the female in the far boiler hall (valve 3): she hangs above the valve; her bowl is by the hall's way in
function furnishFemaleBoil5(B) {
  const h = LV.bhalls[2]; if (!h || !h.boiler) return;
  const cs = h.cells.map(c => ({ c, x: cellCenter(c % N), z: cellCenter((c / N) | 0) }));
  const corner = cs.filter((q, i) => i !== 4).sort((a, b) => dist2(b.x, b.z, h.boiler.x, h.boiler.z) - dist2(a.x, a.z, h.boiler.x, h.boiler.z));
  const roost = corner[0], bowlC = corner[corner.length - 1];
  nest5(B, roost.x, roost.z, 10);
  W5.fnests = W5.fnests || [];
  W5.fnests.push({ x: roost.x, z: roost.z, y: CEIL - 0.6, c: roost.c, leash: 5.5, where: 'BOILER', bowl: { x: bowlC.x + rnd(-0.4, 0.4), z: bowlC.z + rnd(-0.4, 0.4) }, boil: true });
}
function bowl5(B, n) {
  const r = propRoot(n.bowl.x, n.bowl.z, 0);
  if (!n.boil) { B.add(r, 'Cylinder', { diameter: 0.6, height: 0.04, tessellation: 18 }, COL5.mahog2, 0, [0, 0.7, 0]); B.add(r, 'Cylinder', { diameter: 0.08, height: 0.68, tessellation: 8 }, COL5.gold, 0, [0, 0.34, 0]); B.add(r, 'Cylinder', { diameter: 0.4, height: 0.03, tessellation: 14 }, COL5.gold, 0, [0, 0.015, 0]); addSolid(n.bowl.x - 0.32, n.bowl.z - 0.32, n.bowl.x + 0.32, n.bowl.z + 0.32, 'prop'); }
  const y = n.boil ? 0 : 0.72;
  B.add(r, 'Cylinder', { diameterTop: 0.42, diameterBottom: 0.22, height: 0.1, tessellation: 18 }, [0.78, 0.78, 0.8], 0.05, [0, y + 0.05, 0]);
  const wm = mkMerged(W.itemMat, P => { P('Cylinder', { diameter: 0.36, height: 0.012, tessellation: 18 }, [0.9, 0.86, 0.66], 0.3, [0, 0, 0]); }, 'bowlW5');
  wm.position.set(n.bowl.x, y + 0.085, n.bowl.z); wm.setEnabled(false); n.bowl.y = y; n.bowl.water = wm;
}

// ----- story objects (end of buildPlaces5: doors exist) -----
function buildState5() {
  const S = LV.st5, B = W5.B; if (!S) return;
  W5.st = { secDoor: W9.doors.find(d => d.dk === 'security') || null };
  for (const n of W5.fnests || []) bowl5(B, n);
  // the reservation book on the maître d's stand
  W.interact.push({ x: S.stand.x, z: S.stand.z, y: 1.12, r: 1.8, label: () => 'READ THE RESERVATIONS', ok: () => true, act: () => readBook5() });
  // table 9: the night officer's cap, his plate, his keys
  { const t = S.t9, r = propRoot(t.x, t.z, 0.6);
    B.add(r, 'Cylinder', { diameter: 0.26, height: 0.02, tessellation: 16 }, [0.92, 0.92, 0.9], 0, [0.15, 0.78, 0.1]);
    B.add(r, 'Cylinder', { diameter: 0.24, height: 0.1, tessellation: 14 }, [0.1, 0.12, 0.2], 0, [-0.25, 0.83, -0.1]); B.add(r, 'Cylinder', { diameter: 0.3, height: 0.012, tessellation: 14 }, [0.06, 0.06, 0.08], 0.1, [-0.25, 0.785, -0.04], [0.15, 0, 0]);
    B.add(r, 'Box', { width: 0.06, height: 0.04, depth: 0.02 }, COL5.gold, 0, [-0.25, 0.86, 0.02]);
    const cr = propRoot(t.x, t.z + 0.05, -0.4); plaqueOn(cr, 0, 0.86, '9', 0.08, 0.06, 0.0);
    const km = mkMerged(W.itemMat, P => { P('Torus', { diameter: 0.06, thickness: 0.008, tessellation: 12 }, [0.75, 0.75, 0.78], 0.5, [0, 0, 0]); for (const a of [-0.5, 0.2, 0.9]) P('Box', { width: 0.07, height: 0.005, depth: 0.018 }, [0.8, 0.7, 0.4], 0.5, [Math.cos(a) * 0.05, 0.002, Math.sin(a) * 0.05], [0, -a, 0]); }, 'offKeys5');
    const kp = localPt(r, 0.12, 0.79, -0.22); km.position.copyFrom(kp); W5.st.keys = km;
    W.interact.push({ x: kp.x, z: kp.z, y: 0.8, r: 1.7, label: () => 'TAKE THE OFFICER\'S KEYS · TABLE 9', ok: () => !ST5.keys, act: () => takeOffKeys5() }); }
  // the kitchen: Mothex on the pantry shelf, a note by the door, a guaranteed almond water
  { const r = S.pantry, p = localPt(r, -0.3, 0.75, 0.25);
    const can = mkMerged(W.itemMat, P => { P('Cylinder', { diameter: 0.085, height: 0.22, tessellation: 12 }, [0.12, 0.42, 0.22], 0.15, [0, 0.11, 0]); P('Cylinder', { diameter: 0.087, height: 0.09, tessellation: 12 }, [0.92, 0.8, 0.2], 0.3, [0, 0.12, 0]);
      P('Cylinder', { diameter: 0.02, height: 0.16, tessellation: 6 }, [0.6, 0.6, 0.62], 0.2, [0, 0.29, 0]); P('Cylinder', { diameter: 0.06, height: 0.24, tessellation: 10 }, [0.7, 0.7, 0.72], 0.2, [0, 0.36, 0.1], [Math.PI / 2, 0, 0]); P('Box', { width: 0.07, height: 0.03, depth: 0.05 }, [0.15, 0.12, 0.1], 0, [0, 0.36, -0.03]); }, 'spray5');
    can.position.copyFrom(p); can.rotation.y = r.rotation.y + 0.7; W5.st.can = can;
    W.interact.push({ x: p.x, z: p.z, y: 0.85, r: 1.8, label: () => 'TAKE THE MOTHEX', ok: () => !ST5.hasSpray, act: () => takeSpray5() });
    const wp = localPt(r, 0.35, 0.75, 0.25), root = tnode(null, wp.x, 0.75, wp.z); itemModel('water', root, W.itemMat);
    const it = { type: 'water', x: wp.x, z: wp.z, root, taken: false }; W.items.push(it);
    W.interact.push({ x: wp.x, z: wp.z, y: 0.8, r: 1.8, it, label: () => 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
    const nr = atWall5({ x: 30, y: 23, d: 3 }, -1.0, 0); B.add(nr, 'Box', { width: 0.22, height: 0.3, depth: 0.004 }, [0.93, 0.9, 0.8], 0.08, [0, 1.5, 0.01]); const np = localPt(nr, 0, 1.5, 0.3);
    W.interact.push({ x: np.x, z: np.z, y: 1.5, r: 1.7, label: () => 'READ THE NOTE · PEST CONTROL', ok: () => true, act: () => readPest5() }); }
  // security: the monitors, the log, the fire panel
  { const r = S.desk, sp = localPt(r, 0, 1.2, 0.6);
    const scr = dynTexPlane('cctv5', 2.6, 0.84, 512, 166, twin(r), [0, 1.2, 0.58], 1.1); W5.st.cctv = scr; drawCctv5(0);
    W.interact.push({ x: sp.x, z: sp.z, y: 1.2, r: 2.0, label: () => 'WATCH THE MONITORS', ok: () => true, act: () => watchCctv5() });
    const lp = localPt(r, -0.9, 0.8, 0.5); B.add(propRoot(lp.x, lp.z, r.rotation.y + 0.3), 'Box', { width: 0.3, height: 0.03, depth: 0.22 }, [0.12, 0.16, 0.26], 0, [0, 0.8, 0]);
    W.interact.push({ x: lp.x, z: lp.z, y: 0.8, r: 1.7, label: () => 'READ THE SECURITY LOG', ok: () => true, act: () => readLog5() }); }
  { const r = S.panelR, lm = actMat('panel5', { emis: 1 }); setEmi(lm, 2.4, 0.15, 0.08); W5.st.panelM = lm;
    W5.B.add(r, 'Box', { width: 0.62, height: 0.86, depth: 0.16 }, [0.62, 0.08, 0.06], 0, [0, 1.45, 0.08]); W5.B.add(r, 'Box', { width: 0.5, height: 0.2, depth: 0.02 }, [0.9, 0.88, 0.8], 0, [0, 1.74, 0.17]);
    W5.B.add(r, 'Cylinder', { diameter: 0.1, height: 0.04, tessellation: 12 }, COL5.brass, 0, [0, 1.38, 0.17], [Math.PI / 2, 0, 0]);
    const lamp = mkMerged(lm, P => { P('Sphere', { diameter: 0.07, segments: 8 }, [1, 1, 1], 1, [0, 0, 0]); }, 'panelLamp5'); lamp.position.copyFrom(localPt(r, 0.18, 1.58, 0.17));
    const kk = mkMerged(W.itemMat, P => { P('Box', { width: 0.02, height: 0.07, depth: 0.012 }, [0.85, 0.66, 0.2], 0.4, [0, 0, 0]); P('Box', { width: 0.06, height: 0.04, depth: 0.012 }, [0.6, 0.08, 0.06], 0.2, [0, 0.05, 0]); }, 'fkInPanel5');
    kk.position.copyFrom(localPt(r, 0, 1.38, 0.2)); kk.rotation.y = r.rotation.y; kk.setEnabled(false); W5.st.keyIn = kk;
    sign5('FIRE LOCK · RESET', twin(r), [0, 2.05, 0.03], 0.9, 0.18, { bg: '#2a0606', fg: '#ff8a70' });
    const p = localPt(r, 0, 1.4, 0.7);
    W.interact.push({ x: p.x, z: p.z, y: 1.4, r: 1.8, label: () => ST5.reset ? 'FIRE LOCK · RESET' : holdBusy(W5.st.panelIt) ? `TURNING THE KEY… ${holdPct(W5.st.panelIt)}%` : ST5.fireKey ? 'TURN THE FIRE KEY' : 'FIRE LOCK PANEL · NO KEY', ok: () => !ST5.reset, act: () => usePanel5() });
    W5.st.panelIt = W.interact[W.interact.length - 1]; }
  // the East Room: the fire key behind glass on the west wall
  { const r = atWall5({ x: 29, y: 19, d: 2 }, 0, 0);
    W5.B.add(r, 'Box', { width: 0.5, height: 0.62, depth: 0.12 }, [0.66, 0.08, 0.06], 0, [0, 1.45, 0.06]); W5.B.add(r, 'Box', { width: 0.4, height: 0.12, depth: 0.02 }, [0.95, 0.92, 0.85], 0, [0, 1.84, 0.13]);
    const gl = mkMerged(W9.propMat, P => { P('Box', { width: 0.38, height: 0.42, depth: 0.012 }, [0.7, 0.8, 0.85], 0.25, [0, 0, 0]); }, 'fkGlass5'); gl.position.copyFrom(localPt(r, 0, 1.42, 0.125)); gl.rotation.y = r.rotation.y; W5.st.glass = gl;
    const fk = mkMerged(W.itemMat, P => { P('Box', { width: 0.025, height: 0.1, depth: 0.012 }, [0.85, 0.66, 0.2], 0.4, [0, -0.04, 0]); P('Torus', { diameter: 0.05, thickness: 0.01, tessellation: 12 }, [0.85, 0.66, 0.2], 0.4, [0, 0.03, 0], [Math.PI / 2, 0, 0]); P('Box', { width: 0.06, height: 0.04, depth: 0.01 }, [0.6, 0.08, 0.06], 0.2, [0, 0.08, 0]); }, 'fireKey5');
    fk.position.copyFrom(localPt(r, 0, 1.42, 0.09)); fk.rotation.y = r.rotation.y; W5.st.fk = fk;
    plaqueOn(r, 0, 1.84, 'FIRE KEY', 0.3, 0.08, 0.14);
    const p = localPt(r, 0, 1.4, 0.6); W5.st.case = { x: p.x, z: p.z };
    W.interact.push({ x: p.x, z: p.z, y: 1.42, r: 1.8, label: () => ST5.glass ? 'TAKE THE FIRE KEY' : 'BREAK THE GLASS · FIRE KEY', ok: () => !ST5.fireKey, act: () => takeFireKey5() }); }
  for (const n of W5.fnests || []) W.interact.push({ x: n.bowl.x, z: n.bowl.z, y: n.bowl.y + 0.1, r: 1.7, label: () => PL.water > 0 ? 'LEAVE ALMOND WATER IN THE BOWL' : 'AN EMPTY BOWL · YOU HAVE NO ALMOND WATER', ok: () => !n.fed, act: () => fillBowl5(n) });
  // the fire lock on the emergency exit: a red box beside the door
  { const X5 = W5.exit; if (X5) { const r = atWall5({ x: 28, y: 32, d: 0 }, 0.95, 0), lm = actMat('xlock5', { emis: 1 }); setEmi(lm, 2.2, 0.12, 0.06); W5.st.xlockM = lm;
    W5.B.add(r, 'Box', { width: 0.3, height: 0.42, depth: 0.12 }, [0.62, 0.08, 0.06], 0, [0, 1.45, 0.06]); W5.B.add(r, 'Box', { width: 0.24, height: 0.08, depth: 0.02 }, [0.95, 0.92, 0.85], 0, [0, 1.6, 0.125]);
    const lamp = mkMerged(lm, P => { P('Sphere', { diameter: 0.06, segments: 8 }, [1, 1, 1], 1, [0, 0, 0]); }, 'xlockLamp5'); lamp.position.copyFrom(localPt(r, 0, 1.42, 0.13));
    plaqueOn(r, 0, 1.6, 'FIRE LOCK', 0.2, 0.06, 0.14); } }
}

// ----- actions -----
const L5_TXT_ST = {
  state: 'Nine. Your signal just jumped about a hundred metres. I won\'t ask.',
  fire0: 'One more thing. That exit also locks off the fire panel. Panel\'s in security, up on the State Floor. East wall of the ballroom.',
  fire: 'Pressure\'s down. Exit\'s still red on my board. That\'s the fire lock. Security office, State Floor.',
  big: 'That one\'s twice the size of the others. Leave it alone.',
  spray: 'Bug spray. Sure. Save it for the small ones.',
  reset: 'There. Green on my board. Get down to that exit.',
};
const L5_HALE_ST = { fire: 'Hale. The fire panel is in security. The officer ate in the Gold Room. His keys never left his table.', big: 'Hale. That is a female. Don\'t spray her. She likes almond water, if you have any.' };
function radioSt5(key, delay = 0) { const h = flag('hale9') === 'saved' && L5_HALE_ST[key]; say(h ? 'DR. HALE' : 'M.E.G. OUTPOST 9', h || L5_TXT_ST[key], { radio: true, delay }); }
function readBook5() {
  ST5.book = true; SFX.click();
  readDoc('book5', 'THE GOLD ROOM · RESERVATIONS', [
    'Table 2 · party of six · 8:00 · (crossed out, then written in again)',
    'Table 5 · the band · after the last set · on the house',
    'Table 9 · Officer Lusk, security · 3:00 · every night · do not seat anyone else there',
    'Table 9 · Lusk · left his keys on the table again. Leave them. He gets cross if they move.',
    'Table 9 · Lusk · (the rest of the column is the same line, down to the bottom of the page)'], { kind: 'note' });
  if (!ST5.keys) task('offkey5', 'THE OFFICER\'S KEYS · TABLE 9, THE GOLD ROOM', { opt: !ST5.lockSeen && G5.phase !== 'fire' });
  setPhase5();
}
function takeOffKeys5() {
  ST5.keys = true; W5.st.keys.setEnabled(false); SFX5.jingle(P9({ x: PL.x, y: 0.8, z: PL.z })); SFX.pickup(); makeNoise(0.15);
  toast('OFFICER LUSK\'S KEYS · SECURITY', 2.6); taskDone('offkey5', 'THE OFFICER\'S KEYS · TAKEN', true); cpSave('THE OFFICER\'S KEYS'); setPhase5();
}
function takeSpray5() {
  ST5.hasSpray = true; ST5.spray = [8, 6, 5][G.diff]; W5.st.can.setEnabled(false); SFX.pickup(); toast(IS_TOUCH ? 'MOTHEX · THE SPRAY BUTTON PUMPS IT' : 'MOTHEX · [G] TO SPRAY · KILLS THE SMALL ONES', 3.6);
  task('spray5', 'MOTHEX · ' + ST5.spray + ' PUMPS LEFT', { opt: true, quiet: true }); taskDone('spray5', null, true); radioSt5('spray', 1.4);
  if (!ST5.pest) later(4, () => toast('THERE IS A NOTE BY THE KITCHEN DOOR', 2.2));
}
function readPest5() {
  ST5.pest = true; SFX.click();
  readDoc('pest5', 'PEST CONTROL · KITCHEN', [
    'Mothex for the small ones. Two pumps and they drop.',
    'It does NOTHING to the big ones. Those are the females. Spray one and she spits, and it burns through your apron.',
    'Almond water in her bowl at close. She comes down to drink and leaves you be all night.',
    'Gold Room on Fridays. Boiler room whenever ' + (pruittNum5() || 'the old man upstairs') + ' complains.',
    '— Kitchen'], { kind: 'note' });
  if ((W5.fnests || []).some(n => !n.fed)) task('bowl5', 'THE BIG ONES · ALMOND WATER IN THEIR BOWLS CALMS THEM', { opt: true });
}
function readLog5() {
  ST5.log = true; SFX.click();
  readDoc('log5', 'SECURITY LOG · NIGHTS', [
    '02:40 Rounds. East Room windows lit again. No moon out there. No street. Just lit.',
    '02:55 She\'s on the big chandelier. Filled her bowl. She came down for it. Quiet after.',
    '03:00 Dinner. Table 9.',
    '03:10 Bell at the front desk. Nobody at the desk.',
    'Fire key goes back in the case. Not in my pocket. NOT IN MY POCKET.',
    '(the next page is creased flat, as if someone leaned on it a long time)'], { kind: 'log' });
}
function drawCctv5(k) {
  const S = W5.st.cctv; if (!S) return; const c = S.ctx, w = 512, h = 166, cw = w / 4, n = pruittNum5();
  const L = ['CAM 2 · BEVERLY', 'CAM 4 · EAST ROOM', `CAM 7 · ${n || 'ROOM'}`, 'CAM 9 · BOILERS'];
  for (let i = 0; i < 4; i++) {
    const x = i * cw; c.fillStyle = '#0b100c'; c.fillRect(x + 2, 2, cw - 4, h - 4);
    for (let j = 0; j < 260; j++) { const v = 30 + Math.random() * 60; c.fillStyle = `rgb(${v * 0.8},${v},${v * 0.85})`; c.fillRect(x + 2 + Math.random() * (cw - 6), 2 + Math.random() * (h - 6), 2, 1); }
    c.fillStyle = '#3a4a3c';
    if (i === 0) { for (let t = 0; t < 4; t++) { c.beginPath(); c.ellipse(x + 24 + t * 26, 110 - (t % 2) * 18, 11, 4, 0, 0, TAU); c.fill(); } c.fillRect(x + 80, 40, 40, 14); }
    if (i === 1) { for (let t = 0; t < 4; t++) c.fillRect(x + 12 + t * 30, 26, 16, 70); c.fillStyle = '#8fa894'; for (let t = 0; t < 4; t++) c.fillRect(x + 14 + t * 30, 28, 12, 66); c.fillStyle = '#1a201b'; c.beginPath(); c.ellipse(x + 64, 44, k ? 26 : 22, 9, 0, 0, TAU); c.fill(); }
    if (i === 2) { c.fillRect(x + 50, 70, 30, 46); c.fillRect(x + 46, 60, 38, 12); if (k > 1) { c.fillStyle = '#1a201b'; c.fillRect(x + 92, 52, 10, 64); c.beginPath(); c.arc(x + 97, 46, 7, 0, TAU); c.fill(); } }
    if (i === 3) { c.beginPath(); c.arc(x + 64, 92, 32, 0, TAU); c.fill(); c.fillRect(x + 56, 20, 16, 40); }
    c.fillStyle = '#cfe8d0'; c.font = 'bold 12px monospace'; c.fillText(L[i], x + 8, 18); c.fillText('03:1' + ((i + k) % 10), x + 8, h - 10);
    c.strokeStyle = '#000'; c.lineWidth = 4; c.strokeRect(x + 1, 1, cw - 2, h - 2);
  }
  S.dt.update();
}
function watchCctv5() {
  SFX5.click(P9({ x: PL.x, y: 1, z: PL.z })); FX.glitch = Math.max(FX.glitch, 0.4);
  if (!ST5.cctv) {
    ST5.cctv = true; drawCctv5(1);
    later(0.8, () => toast('CAM 4 · SOMETHING LARGE ON THE EAST ROOM CHANDELIER', 3));
    later(4.5, () => { drawCctv5(2); SFX.whisper(); toast(`CAM 7 · ROOM ${pruittNum5()} · SOMEONE STANDING BY THE WINDOW`, 2.6); });
    later(7.5, () => drawCctv5(1));
    if (!ST5.fireKey) later(1.2, () => fireTasks5());
  } else { drawCctv5((FX.t | 0) % 2); toast('STATIC, MOSTLY', 1.6); }
}
function takeFireKey5() {
  if (!ST5.glass) {
    ST5.glass = true; W5.st.glass.setEnabled(false); SFX5.glass(P9(W5.st.case)); makeNoise(0.85); PL.shake = Math.max(PL.shake, 0.3);
    for (const m of AI5.moths) if (m.fem && !m.fed && dist2(m.x, m.z, PL.x, PL.z) < 16) m.provoke('glass');
  }
  ST5.fireKey = true; W5.st.fk.setEnabled(false); SFX.pickup(); toast('THE FIRE KEY', 2.4); cpSave('THE FIRE KEY');
  taskDone('firekey5', 'THE FIRE KEY · TAKEN', true); setPhase5();
}
function usePanel5() {
  ST5.panelSeen = true; fireTasks5();
  if (!ST5.fireKey) { SFX5.click(P9({ x: PL.x, y: 1.4, z: PL.z })); toast('FIRE LOCK PANEL · IT NEEDS THE FIRE KEY', 2.4); setPhase5(); return; }
  const it = W5.st.panelIt;
  if (holdBusy(it)) return;
  W5.st.keyIn.setEnabled(true); SFX5.click(P9({ x: PL.x, y: 1.4, z: PL.z }));
  holdStart(it, 1.6, () => resetFire5(), { cancel: 'YOU LET GO OF THE KEY' });
}
function resetFire5() {
  ST5.reset = true; W5.st.keyIn.rotation.z = -Math.PI / 2; setEmi(W5.st.panelM, 0.15, 2.4, 0.4); if (W5.st.xlockM) setEmi(W5.st.xlockM, 0.15, 2.2, 0.4);
  SFX9.klaxon(P9({ x: PL.x, y: 2, z: PL.z })); makeNoise(0.5); FX.glitch = Math.max(FX.glitch, 0.6);
  toast('FIRE LOCK RESET', 2.6); taskDone('fire5', 'FIRE LOCK RESET', true); cpSave('FIRE LOCK RESET');
  if (G5.valves >= 3) { setPhase5('exit'); drawExit5(true); } else setPhase5();
  radioSt5('reset', 1.4);
}
function fillBowl5(n) {
  if (PL.water <= 0) { SFX.click(); toast('NO ALMOND WATER', 1.8); return; }
  PL.water--; n.fed = true; n.bowl.water.setEnabled(true); SFX.drink(); makeNoise(0.08);
  if (n.boil) ST5.fedB = true; else ST5.fedE = true;
  const m = AI5.moths.find(q => q.fem && q.nest === n); if (m) m.feed();
  toast('YOU POUR THE ALMOND WATER INTO THE BOWL', 2.4);
  if ((W5.fnests || []).every(q => q.fed)) taskDone('bowl5', 'THE BIG ONES ARE FED', true);
}
// ----- objectives -----
function fireTasks5() {
  if (ST5.reset) return;
  task('fire5', 'RESET THE FIRE LOCK · SECURITY OFFICE, STATE FLOOR', { sub: 'THE EMERGENCY EXIT LOCKS OFF THE FIRE PANEL AS WELL AS THE BOILERS' });
  if (ST5.sec || ST5.panelSeen || ST5.cctv) task('firekey5', 'THE FIRE KEY · GLASS CASE IN THE EAST ROOM', {});
}
function tasksState5() {
  if (!LV.st5) return;
  if (G5.phase === 'fire' || ST5.lockSeen || ST5.panelSeen) fireTasks5();
  if (ST5.reset) taskDone('fire5', 'FIRE LOCK RESET', true);
  if (ST5.hasSpray) { const t = taskOf('spray5'); if (t) t.text = ST5.spray ? `MOTHEX · ${ST5.spray} PUMP${ST5.spray === 1 ? '' : 'S'} LEFT` : 'MOTHEX · EMPTY'; }
}
function objState5() {
  if (ST5.reset) return 'REACH THE EMERGENCY EXIT';
  if (!ST5.seen) return 'RESET THE FIRE LOCK · STATE FLOOR, OFF THE BALLROOM';
  if (!ST5.sec) return ST5.keys || P5.master ? 'UNLOCK THE SECURITY OFFICE' : ST5.book ? 'FIND THE OFFICER\'S KEYS · TABLE 9, THE GOLD ROOM' : 'GET INTO THE SECURITY OFFICE';
  if (!ST5.fireKey) return 'TAKE THE FIRE KEY · THE EAST ROOM';
  return 'TURN THE FIRE KEY · SECURITY OFFICE';
}
function targetState5() {
  const S = LV.st5; if (!S) return null;
  const pc = cIdx(cellOf(PL.x), cellOf(PL.z));
  if (boilZ5(LV.zone[pc])) return { x: cellCenter(LV.arrive5.x), z: LV.arrive5.y * CELL + 0.4 };
  if (!inSt5(pc) && LV.zone[pc] !== Z5.VEST) { const a = S.va; return { x: a.cx + DX[a.vd] * CELL * 0.5, z: a.cz + DY[a.vd] * CELL * 0.5 }; }
  if (LV.zone[pc] === Z5.VEST) return null;
  if (!ST5.sec) { const d = W5.st.secDoor; return ST5.keys || P5.master ? (d ? { x: d.mx, z: d.mz } : null) : ST5.book ? { x: S.t9.x, z: S.t9.z } : S.stand; }
  if (!ST5.fireKey) return W5.st.case;
  const r = S.panelR; return { x: r.position.x, z: r.position.z };
}
// ----- door hooks -----
function doorLabelSt5(dr) {
  if (dr.dk === 'portal') return dr.target ? 'CLOSE THE INNER DOOR' : 'OPEN THE INNER DOOR';
  if (dr.dk === 'security' && dr.locked) return ST5.keys ? 'UNLOCK · THE OFFICER\'S KEYS' : P5.master ? 'UNLOCK SECURITY · MASTER KEY' : 'LOCKED · SECURITY';
  return null;
}
function useDoorSt5(dr) {
  if (dr.dk === 'portal') { portalOpen5(dr); return true; }
  if (dr.dk === 'security' && dr.locked) {
    if (ST5.keys || P5.master) { dr.locked = false; ST5.sec = true; SFX5.unlock(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.15); later(1.2, () => setDoor(dr, true)); toast('SECURITY · UNLOCKED', 2); cpSave('SECURITY OFFICE'); fireTasks5(); setPhase5(); }
    else { SFX9.rattle(P9({ x: dr.mx, z: dr.mz })); makeNoise(0.12); toast('LOCKED · SECURITY · STAFF KEY', 2.2); ST5.lockSeen = true; if (!ST5.book) task('offkey5', 'A KEY FOR THE SECURITY OFFICE', { opt: G5.phase !== 'fire' }); fireTasks5(); setPhase5(); }
    return true;
  }
  return false;
}
// ----- per frame -----
function state5Events(dt) {
  if (!LV.st5) return;
  const pc = cIdx(cellOf(PL.x), cellOf(PL.z)), t = stRoom5(pc);
  if (t && !ST5.seen) { ST5.seen = true; toast('THE STATE FLOOR', 3); SFX.beep(1100, 0.05); later(2.5, () => radioSt5('state')); cpSave('THE STATE FLOOR'); setPhase5(); }
  if (t && !ST5.roomT[t]) { ST5.roomT[t] = true; const nm = { eroom: 'THE EAST ROOM', gold: 'THE GOLD ROOM', kitchen: 'KITCHEN', sec: 'SECURITY OFFICE' }[t]; if (nm && t !== 'xhall') toast(nm, 2.2); }
  if (!ST5.bigSeen) for (const m of AI5.moths) if (m.fem && m.shown && m.d < 14 && los(PL.x, PL.z, m.x, m.z)) { ST5.bigSeen = true; later(1.2, () => radioSt5('big')); break; }
  if (W5.st.cctv && ST5.sec && (ST5.cctvT = (ST5.cctvT || 0) - dt) <= 0) { ST5.cctvT = 0.5; if (dist2(PL.x, PL.z, W5.st.cctv.mesh.getAbsolutePosition().x, W5.st.cctv.mesh.getAbsolutePosition().z) < 9) drawCctv5((FX.t * 2 | 0) % 2); }
}
// ----- sounds -----
Object.assign(SFX5, {
  glass(pos) { shot((d, t) => { for (let i = 0; i < 14; i++) { const s = t + Math.random() * 0.35, f = 3000 + Math.random() * 5000; nz(d, s, 0.04 + Math.random() * 0.08, 'bandpass', f, 8, 0.4, 0.001); tone(d, s, 0.15, 'sine', f * 0.7, f * 0.66, 0.05, 0.001); } nz(d, t, 0.12, 'highpass', 2000, 1, 0.9, 0.001); return 0.9; }, pos, 1.3); },
  spray(pos) { shot((d, t) => { nz(d, t, 0.42, 'highpass', 3200, 0.7, 0.5, 0.02); nz(d, t, 0.3, 'bandpass', 6000, 1.5, 0.3, 0.02); tone(d, t, 0.06, 'square', 220, 160, 0.05, 0.001); return 0.5; }, pos, 0.9); },
  spit(pos) { shot((d, t) => { nz(d, t, 0.18, 'bandpass', 900, 2, 0.8, 0.005); tone(d, t, 0.25, 'sawtooth', 380, 120, 0.12, 0.005); nz(d, t + 0.05, 0.2, 'lowpass', 600, 1, 0.5, 0.01); return 0.4; }, pos, 1.1); },
  splat(pos) { shot((d, t) => { nz(d, t, 0.12, 'lowpass', 700, 1, 0.9, 0.002); nz(d, t + 0.08, 0.9, 'highpass', 4000, 0.8, 0.18, 0.1); return 1; }, pos, 1); },
});
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { ST5, readBook5, takeOffKeys5, takeSpray5, readPest5, readLog5, watchCctv5, takeFireKey5, usePanel5, resetFire5, fillBowl5, objState5, targetState5, state5Events }));
