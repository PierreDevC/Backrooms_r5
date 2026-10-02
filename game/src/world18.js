// ---------- Level 18 · world assembly: materials, name cards & kids' art, the preschool's furnishings, the slides, the ball pit ----------
const W18 = {};
function resetW18() {
  Object.assign(W18, { used: new Map(), B: null, BOn: null, BFl: null, propMat: null, drawings: [], board: null, exitDoor: null, paintDoor: null, slides: [], pit: null,
    musicBox: null, closet: null, notes: [], signs: [], pl: null, art: null, ballG: null, glowMat: null, winMats: [], dinoHome: null, rug: null, nightL: [], swing: null, mobile: null,
    lensFl: null, stump: null, bedWall: null, fridge: null, classDoor: null, deskNote: null, finishProps: null, bright: null });
}
const COL18 = { white: [0.9, 0.9, 0.87], wood: [0.62, 0.44, 0.26], wood2: [0.74, 0.56, 0.34], dkwood: [0.34, 0.22, 0.12], red: [0.82, 0.18, 0.13], yel: [0.95, 0.75, 0.12], blue: [0.18, 0.42, 0.84],
  green: [0.26, 0.64, 0.3], pink: [0.93, 0.5, 0.68], purple: [0.52, 0.34, 0.74], orange: [0.94, 0.52, 0.14], teal: [0.16, 0.6, 0.6], grey: [0.5, 0.5, 0.52], steel: [0.62, 0.63, 0.64], black: [0.04, 0.04, 0.05],
  cream: [0.92, 0.88, 0.76], plush: [0.3, 0.62, 0.3], brown: [0.46, 0.3, 0.16], fabric: [0.72, 0.62, 0.52] };
const KIDC18 = [COL18.red, COL18.yel, COL18.blue, COL18.green, COL18.pink, COL18.purple, COL18.orange, COL18.teal];

// ----- name cards over the doors: one atlas, tiny quads (reuses plaqueQuad from the hotel) -----
function mkPlates18(T) {
  const S = 1024, cw = 256, ch = 64, cols = S / cw, dt = new BABYLON.DynamicTexture('plates18', { width: S, height: S }, SCN, true), ctx = dt.getContext(), idx = new Map();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, S, S);
  const PC = ['#e2483c', '#f08a24', '#e0a800', '#3aa04a', '#2f7fd0', '#8a5cc8', '#e05a9a'];
  const slot = txt => {
    if (idx.has(txt)) return idx.get(txt);
    const i = idx.size, x = (i % cols) * cw, y = ((i / cols) | 0) * ch; idx.set(txt, i);
    ctx.fillStyle = '#fbf8ef'; ctx.fillRect(x, y, cw, ch); ctx.strokeStyle = PC[i % PC.length]; ctx.lineWidth = 6; ctx.strokeRect(x + 4, y + 4, cw - 8, ch - 8);
    ctx.font = `bold ${txt.length > 11 ? 22 : 28}px "Comic Sans MS", "Trebuchet MS", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let px = x + cw / 2 - ctx.measureText(txt).width / 2;
    for (let k = 0; k < txt.length; k++) { ctx.fillStyle = PC[(k + i) % PC.length]; const wch = ctx.measureText(txt[k]).width; ctx.textAlign = 'left'; ctx.fillText(txt[k], px, y + ch / 2 + 2); px += wch; }
    return i;
  };
  const uv = i => { const x = (i % cols) * cw, y = ((i / cols) | 0) * ch; return [x / S + 0.001, 1 - (y + ch) / S + 0.002, (x + cw) / S - 0.001, 1 - y / S - 0.002]; };
  const g = new Geo(true);
  W18.pl = { slot, uv, g, dt, add(x, y, z, ry, w, h, txt) { plaqueQuad(g, x, y, z, ry, w, h, uv(slot(txt))); } };
  W18.plMat = envMat9('plate18', ['MAT_PAPER'], { albedo: dt, normal: T.ktile.normal });
}
// ----- kids' art taped to every wall: 16 crayon drawings in one atlas -----
function mkArt18(T) {
  const S = 1024, cw = 256, dt = new BABYLON.DynamicTexture('art18', { width: S, height: S }, SCN, true), c = dt.getContext();
  const P = ['#e2483c', '#f08a24', '#e0b000', '#3aa04a', '#2f7fd0', '#8a5cc8', '#e05a9a', '#7a4e2a', '#222222'];
  for (let i = 0; i < 16; i++) {
    const x0 = (i % 4) * cw, y0 = ((i / 4) | 0) * cw; c.save(); c.translate(x0, y0); c.beginPath(); c.rect(0, 0, cw, cw); c.clip();
    paper18(c, cw, cw, ['#f6f1e2', '#fff8d8', '#e8f2ff', '#ffe8ee'][i % 4]);
    const k = i % 8, s = cw;
    if (k === 0) { crayonCircle18(c, s * 0.7, s * 0.28, s * 0.13, P[2], 5, P[2]); for (let a = 0; a < 8; a++) crayonLine18(c, [[s * 0.7 + Math.cos(a) * s * 0.17, s * 0.28 + Math.sin(a) * s * 0.17], [s * 0.7 + Math.cos(a) * s * 0.25, s * 0.28 + Math.sin(a) * s * 0.25]], P[2], 4); crayonLine18(c, [[0, s * 0.85], [s, s * 0.82]], P[3], 10); }
    else if (k === 1) { crayonLine18(c, [[s * 0.2, s * 0.85], [s * 0.2, s * 0.5], [s * 0.5, s * 0.25], [s * 0.8, s * 0.5], [s * 0.8, s * 0.85], [s * 0.2, s * 0.85]], P[0], 6); crayonLine18(c, [[s * 0.44, s * 0.85], [s * 0.44, s * 0.65], [s * 0.56, s * 0.65], [s * 0.56, s * 0.85]], P[7], 5); }
    else if (k === 2) { for (let j = 0; j < 6; j++) { c.strokeStyle = P[j]; c.lineWidth = 9; c.globalAlpha = 0.7; c.beginPath(); c.arc(s / 2, s * 0.85, s * 0.42 - j * 11, Math.PI, TAU); c.stroke(); } c.globalAlpha = 1; }
    else if (k === 3) { stick18(c, s * 0.3, s * 0.3, s * 0.35, P[4], { hair: P[7] }); stick18(c, s * 0.68, s * 0.34, s * 0.3, P[6], { dress: P[6], hair: P[2] }); }
    else if (k === 4) { crayonCircle18(c, s * 0.5, s * 0.55, s * 0.22, P[7], 6, P[7]); crayonCircle18(c, s * 0.5, s * 0.3, s * 0.13, P[7], 6, P[7]); crayonLine18(c, [[s * 0.4, s * 0.8], [s * 0.4, s * 0.92]], P[7], 6); crayonLine18(c, [[s * 0.6, s * 0.8], [s * 0.6, s * 0.92]], P[7], 6); }
    else if (k === 5) { crayonLine18(c, [[s * 0.2, s * 0.6], [s * 0.35, s * 0.45], [s * 0.7, s * 0.45], [s * 0.85, s * 0.6], [s * 0.2, s * 0.6]], P[0], 7); crayonCircle18(c, s * 0.33, s * 0.66, s * 0.07, P[8], 5, P[8]); crayonCircle18(c, s * 0.7, s * 0.66, s * 0.07, P[8], 5, P[8]); }
    else if (k === 6) { crayonLine18(c, [[s * 0.5, s * 0.9], [s * 0.5, s * 0.45]], P[3], 7); for (let a = 0; a < 6; a++) crayonCircle18(c, s * 0.5 + Math.cos(a) * s * 0.12, s * 0.35 + Math.sin(a) * s * 0.12, s * 0.08, P[6], 4, P[6]); crayonCircle18(c, s * 0.5, s * 0.35, s * 0.07, P[2], 4, P[2]); }
    else { for (let j = 0; j < 5; j++) { const pts = []; for (let q = 0; q < 12; q++) pts.push([Math.random() * s, Math.random() * s]); crayonLine18(c, pts, P[(i + j) % 8], 5); } }
    if (i >= 8) crayonText18(c, ['MAX', 'LILY', 'SAM', 'EMMA', 'NOAH', 'ZOE', 'BEN', 'AVA'][i - 8], s * 0.5, s * 0.1, 24, P[8], -0.05);
    c.restore();
  }
  dt.update();
  const uv = i => { const x = (i % 4) * cw, y = ((i / 4) | 0) * cw; return [x / S + 0.002, 1 - (y + cw) / S + 0.002, (x + cw) / S - 0.002, 1 - y / S - 0.002]; };
  const g = new Geo(true);
  W18.art = { g, dt, add(x, y, z, ry, w, h, i) { plaqueQuad(g, x, y, z, ry, w, h, uv(i % 16)); } };
  W18.artMat = envMat9('art18', ['MAT_PAPER'], { albedo: dt, normal: T.ktile.normal });
}
function artOn18(r, lx, ly, w = 0.34, i = (RNG() * 16) | 0, lz = 0.012) { const p = rootPt(r, lx, ly, lz); W18.art.add(p[0], p[1], p[2], r.rotation.y + rnd(-0.06, 0.06) * 0, w, w * rnd(0.72, 0.8), i); }
function plateOn18(r, lx, ly, txt, w = 0.5, h = 0.13, lz = 0.03) { const p = rootPt(r, lx, ly, lz); W18.pl.add(p[0], p[1], p[2], r.rotation.y, w, h, txt); }

// ----- low-poly spheres written straight into a Geo (the ball pit, balloons) -----
function sph18(g, x, y, z, r, col, seg = 6, rings = 4, sy = 1) {
  const b = g.p.length / 3;
  for (let j = 0; j <= rings; j++) {
    const v = j / rings, ph = v * Math.PI, sp = Math.sin(ph), cp = Math.cos(ph);
    for (let i = 0; i <= seg; i++) {
      const u = i / seg, th = u * TAU, nx = sp * Math.cos(th), ny = cp, nz = sp * Math.sin(th);
      g.p.push(x + nx * r, y + ny * r * sy, z + nz * r); g.n.push(nx, ny, nz); g.t.push(-Math.sin(th), 0, Math.cos(th), 1); g.uv.push(u, v); g.c.push(col[0], col[1], col[2], col[3] ?? 0);
    }
  }
  for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) { const a = b + j * (seg + 1) + i, c2 = a + seg + 1; g.i.push(a, a + 1, c2, a + 1, c2 + 1, c2); }
}
// crayon-drawn plane with its own texture (drawings, notes, signs, the painted doors)
function paperPlane18(name, w, h, px, py, root, pos, emis, draw) {
  const S = dynTexPlane(name, w, h, px, py, root, pos, emis); draw(S.ctx, px, py); S.dt.update(); S.dt.hasAlpha = false; W18.signs.push(S); return S;
}
function slotUse18(s, along, w) { const k = s.c * 4 + s.d, u = W18.used.get(k) || []; if (u.some(q => Math.abs(q[0] - along) < (q[1] + w) / 2 + 0.05)) return false; u.push([along, w]); W18.used.set(k, u); return true; }

// ----- furniture (local +z into the room, back against the wall at z = 0; returns its depth for collision) -----
const FURN18 = {
  cubby(B, r, o = {}) {   // low wooden cubbies, a few backpacks and lunchboxes left behind
    const W = 1.3, H = 1.0, D = 0.36, c = COL18.wood2;
    B.add(r, 'Box', { width: W, height: 0.03, depth: D }, c, 0, [0, H, D / 2]); B.add(r, 'Box', { width: W, height: 0.03, depth: D }, c, 0, [0, 0.05, D / 2]); B.add(r, 'Box', { width: W, height: 0.03, depth: D }, c, 0, [0, H / 2, D / 2]);
    B.add(r, 'Box', { width: W, height: H, depth: 0.02 }, c.map(v => v * 0.8), 0, [0, H / 2, 0.01]);
    for (let i = 0; i <= 3; i++) B.add(r, 'Box', { width: 0.03, height: H, depth: D }, c, 0, [-W / 2 + i * W / 3, H / 2, D / 2]);
    for (let i = 0; i < 6; i++) { if (RNG() < 0.4) continue; const col = pick(KIDC18), x = -W / 2 + (i % 3 + 0.5) * W / 3, y = i < 3 ? 0.07 : 0.53;
      if (RNG() < 0.6) { B.add(r, 'Box', { width: 0.26, height: 0.3, depth: 0.16 }, col, 0, [x, y + 0.15, 0.14]); B.add(r, 'Box', { width: 0.18, height: 0.12, depth: 0.04 }, col.map(v => v * 0.7), 0, [x, y + 0.1, 0.23]); }
      else B.add(r, 'Box', { width: 0.24, height: 0.16, depth: 0.12 }, col, 0, [x, y + 0.08, 0.16]); }
    return D;
  },
  hooks(B, r) {   // coat rail with tiny jackets
    B.add(r, 'Box', { width: 1.4, height: 0.12, depth: 0.03 }, COL18.wood2, 0, [0, 1.25, 0.015]);
    for (let i = 0; i < 5; i++) { const x = -0.56 + i * 0.28; B.add(r, 'Box', { width: 0.02, height: 0.02, depth: 0.08 }, COL18.steel, 0, [x, 1.24, 0.06]);
      if (RNG() < 0.6) { const c = pick(KIDC18); B.add(r, 'Box', { width: 0.24, height: 0.34, depth: 0.07 }, c, 0, [x, 1.05, 0.07]); B.add(r, 'Box', { width: 0.06, height: 0.26, depth: 0.06 }, c.map(v => v * 0.85), 0, [x - 0.14, 1.07, 0.07], [0, 0, 0.2]); } }
    return 0;
  },
  bench(B, r) { B.add(r, 'Box', { width: 1.2, height: 0.05, depth: 0.32 }, COL18.wood2, 0, [0, 0.3, 0.2]); for (const x of [-0.5, 0.5]) B.add(r, 'Box', { width: 0.05, height: 0.3, depth: 0.28 }, COL18.wood, 0, [x, 0.15, 0.2]); return 0.36; },
  shelf(B, r) {   // low bookshelf full of picture books
    const W = 1.1, H = 0.95, D = 0.3;
    B.add(r, 'Box', { width: W, height: H, depth: 0.02 }, COL18.wood, 0, [0, H / 2, 0.01]);
    for (const y of [0.04, 0.47, 0.93]) B.add(r, 'Box', { width: W, height: 0.03, depth: D }, COL18.wood2, 0, [0, y, D / 2]);
    for (const x of [-W / 2, W / 2]) B.add(r, 'Box', { width: 0.03, height: H, depth: D }, COL18.wood2, 0, [x, H / 2, D / 2]);
    for (const y of [0.06, 0.49]) { let x = -W / 2 + 0.05; while (x < W / 2 - 0.08) { const w = rnd(0.02, 0.05), h = rnd(0.2, 0.34); B.add(r, 'Box', { width: w, height: h, depth: 0.2 }, pick(KIDC18), 0, [x + w / 2, y + h / 2, 0.14], [0, 0, RNG() < 0.1 ? 0.3 : 0]); x += w + 0.004; } }
    return D;
  },
  fountain(B, r) { B.add(r, 'Box', { width: 0.4, height: 0.3, depth: 0.32 }, COL18.steel, 0, [0, 0.78, 0.17]); B.add(r, 'Box', { width: 0.32, height: 0.03, depth: 0.24 }, [0.8, 0.8, 0.82], 0, [0, 0.94, 0.19]); B.add(r, 'Box', { width: 0.08, height: 0.6, depth: 0.08 }, COL18.steel, 0, [0, 0.33, 0.05]); return 0.34; },
  extinguisher(B, r) { B.add(r, 'Cylinder', { diameter: 0.14, height: 0.46, tessellation: 10 }, COL18.red, 0, [0, 0.95, 0.1]); B.add(r, 'Box', { width: 0.05, height: 0.08, depth: 0.05 }, COL18.black, 0, [0, 1.22, 0.1]); return 0; },
  cork(B, r) {   // bulletin board with art pinned on it
    B.add(r, 'Box', { width: 1.2, height: 0.8, depth: 0.03 }, [0.62, 0.44, 0.28], 0, [0, 1.45, 0.015]); B.add(r, 'Box', { width: 1.26, height: 0.86, depth: 0.02 }, COL18.wood2, 0, [0, 1.45, 0.006]);
    for (let i = 0; i < 4; i++) artOn18(r, -0.4 + (i % 2) * 0.8 + rnd(-0.08, 0.08), 1.3 + ((i / 2) | 0) * 0.34 + rnd(-0.04, 0.04), 0.3, undefined, 0.035);
    return 0;
  },
  toybin(B, r) { const c = pick(KIDC18); B.add(r, 'Box', { width: 0.6, height: 0.36, depth: 0.4 }, c, 0, [0, 0.18, 0.24]); for (let i = 0; i < 4; i++) { const tc = pick(KIDC18), px = rnd(-0.2, 0.2), pz = 0.24 + rnd(-0.1, 0.1), rx = rnd(0, 1), ry = rnd(0, 1);
    if (!(i < 2 && B.mdl('duck', r, [px, 0.36, pz], [0, ry * 6.28, 0], 0.55))) B.add(r, 'Box', { width: 0.1, height: 0.1, depth: 0.1 }, tc, 0, [px, 0.37, pz], [rx, ry, 0]); } return 0.46; },
  easel(B, r) {
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.04, height: 1.3, depth: 0.04 }, COL18.wood, 0, [s * 0.3, 0.64, 0.4], [0.12, 0, s * -0.05]);
    B.add(r, 'Box', { width: 0.7, height: 0.6, depth: 0.02 }, [0.95, 0.94, 0.9], 0, [0, 1.0, 0.33], [0.12, 0, 0]); B.add(r, 'Box', { width: 0.7, height: 0.04, depth: 0.06 }, COL18.wood, 0, [0, 0.68, 0.36]);
    for (let i = 0; i < 5; i++) B.add(r, 'Box', { width: 0.1, height: 0.08, depth: 0.012 }, KIDC18[i], 0, [-0.25 + i * 0.12, 0.98 + rnd(-0.1, 0.15), 0.345], [0.12, 0, rnd(-0.5, 0.5)]);
    return 0.5;
  },
  toykitchen(B, r) {
    B.add(r, 'Box', { width: 0.9, height: 0.6, depth: 0.38 }, [0.95, 0.9, 0.92], 0, [0, 0.3, 0.2]); B.add(r, 'Box', { width: 0.9, height: 0.03, depth: 0.4 }, COL18.pink, 0, [0, 0.61, 0.2]);
    for (const x of [-0.22, 0.12]) B.add(r, 'Cylinder', { diameter: 0.14, height: 0.012, tessellation: 12 }, COL18.black, 0, [x, 0.63, 0.2]);
    B.add(r, 'Box', { width: 0.36, height: 0.3, depth: 0.012 }, COL18.pink, 0, [-0.2, 0.3, 0.395]); B.add(r, 'Box', { width: 0.9, height: 0.5, depth: 0.03 }, [0.95, 0.9, 0.92], 0, [0, 0.9, 0.02]);
    return 0.4;
  },
  lockers(B, r) { for (let i = 0; i < 4; i++) { const c = KIDC18[(i * 3) % 8]; B.add(r, 'Box', { width: 0.3, height: 1.4, depth: 0.36 }, c, 0, [-0.46 + i * 0.31, 0.7, 0.18]); B.add(r, 'Box', { width: 0.03, height: 0.1, depth: 0.02 }, COL18.steel, 0, [-0.36 + i * 0.31, 0.8, 0.37]); } return 0.38; },
  dresser(B, r) { B.add(r, 'Box', { width: 0.9, height: 0.8, depth: 0.42 }, [0.9, 0.86, 0.8], 0, [0, 0.4, 0.21]); for (let i = 0; i < 3; i++) { B.add(r, 'Box', { width: 0.8, height: 0.2, depth: 0.012 }, [0.84, 0.78, 0.72], 0, [0, 0.16 + i * 0.25, 0.425]); B.add(r, 'Box', { width: 0.08, height: 0.03, depth: 0.03 }, COL18.blue, 0, [0, 0.2 + i * 0.25, 0.44]); } B.add(r, 'Box', { width: 0.14, height: 0.2, depth: 0.1 }, COL18.yel, 0, [0.25, 0.9, 0.2]); return 0.44; },
  toychest(B, r) { B.add(r, 'Box', { width: 0.9, height: 0.46, depth: 0.46 }, COL18.blue, 0, [0, 0.23, 0.24]); B.add(r, 'Box', { width: 0.92, height: 0.06, depth: 0.48 }, COL18.red, 0, [0, 0.49, 0.24]); for (const x of [-0.3, 0, 0.3]) B.add(r, 'Box', { width: 0.12, height: 0.12, depth: 0.012 }, pick(KIDC18), 0, [x, 0.26, 0.475]); return 0.48; },
  counter(B, r) {   // kitchen units with a sink
    B.add(r, 'Box', { width: 2.2, height: 0.86, depth: 0.58 }, [0.76, 0.62, 0.36], 0, [0, 0.43, 0.29]); B.add(r, 'Box', { width: 2.24, height: 0.04, depth: 0.62 }, [0.88, 0.82, 0.62], 0, [0, 0.88, 0.31]);
    for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.5, height: 0.7, depth: 0.012 }, [0.66, 0.52, 0.3], 0, [-0.8 + i * 0.54, 0.45, 0.585]);
    B.add(r, 'Box', { width: 0.5, height: 0.02, depth: 0.36 }, COL18.steel, 0, [0.4, 0.905, 0.3]); B.add(r, 'Box', { width: 0.03, height: 0.25, depth: 0.03 }, COL18.steel, 0, [0.4, 1.02, 0.08]);
    B.add(r, 'Box', { width: 2.2, height: 0.6, depth: 0.32 }, [0.76, 0.62, 0.36], 0, [0, 1.75, 0.16]);
    return 0.62;
  },
  fridge(B, r) { B.add(r, 'Box', { width: 0.74, height: 1.7, depth: 0.66 }, [0.9, 0.88, 0.78], 0, [0, 0.85, 0.34]); B.add(r, 'Box', { width: 0.72, height: 0.012, depth: 0.012 }, [0.6, 0.6, 0.55], 0, [0, 1.18, 0.675]); for (const y of [0.9, 1.4]) B.add(r, 'Box', { width: 0.03, height: 0.22, depth: 0.04 }, COL18.steel, 0, [0.3, y, 0.69]); return 0.68; },
};
function placeF18(B, s, along, kind, o = {}) { const r = atWall5(s, along), d = FURN18[kind](B, r, o), hw = o.hw ?? 0.6; if (d > 0) solidLocal(r, -hw, 0, hw, d); return r; }
// free-standing pieces at a world position
function kidTable18(B, x, z, ry, n = 4, col) {
  const r = propRoot(x, z, ry), c = col || pick(KIDC18);
  B.add(r, 'Box', { width: 1.2, height: 0.04, depth: 0.7 }, c, 0, [0, 0.52, 0]); for (const sx of [-0.55, 0.55]) for (const sz of [-0.3, 0.3]) B.add(r, 'Box', { width: 0.04, height: 0.5, depth: 0.04 }, COL18.steel, 0, [sx, 0.25, sz]);
  const seats = [[-0.3, -0.58, 0], [0.3, -0.58, 0], [-0.3, 0.58, Math.PI], [0.3, 0.58, Math.PI], [-0.85, 0, Math.PI / 2], [0.85, 0, -Math.PI / 2]].slice(0, n);
  for (const [sx, sz, a] of seats) { const q = propRoot(x + Math.cos(ry) * sx + Math.sin(ry) * sz + rnd(-0.05, 0.05), z - Math.sin(ry) * sx + Math.cos(ry) * sz, ry + a + rnd(-0.25, 0.25)); kidChair18(B, q, pick(KIDC18)); }
  addSolid(x - 0.62, z - 0.62, x + 0.62, z + 0.62, 'prop');
}
function kidChair18(B, r, c) { if (B.mdl('schair', r, null, null, 0.62, [c[0], c[1], c[2], 0])) return;   // r5: scanned school chair at kid size, plastic repainted
  B.add(r, 'Box', { width: 0.3, height: 0.03, depth: 0.3 }, c, 0, [0, 0.3, 0]); B.add(r, 'Box', { width: 0.3, height: 0.28, depth: 0.03 }, c, 0, [0, 0.46, -0.14]); for (const sx of [-0.13, 0.13]) for (const sz of [-0.13, 0.13]) B.add(r, 'Box', { width: 0.025, height: 0.3, depth: 0.025 }, COL18.steel, 0, [sx, 0.15, sz]); }
function rug18(B, x, z, R) { const r = propRoot(x, z, 0); const cs = [COL18.red, COL18.orange, COL18.yel, COL18.green, COL18.blue, COL18.purple]; cs.forEach((c, i) => B.add(r, 'Cylinder', { diameter: 2 * R * (1 - i / 6.5), height: 0.012, tessellation: 28 }, c, 0, [0, 0.006 + i * 0.0015, 0])); }
function beanbag18(B, x, z, c) { const r = propRoot(x, z, rnd(0, TAU)); B.add(r, 'Sphere', { diameter: 0.8, segments: 10 }, c, 0, [0, 0.22, 0], null, [1, 0.55, 1]); B.add(r, 'Sphere', { diameter: 0.5, segments: 8 }, c.map(v => v * 0.9), 0, [0, 0.42, -0.15], null, [1, 0.8, 0.8]); addSolid(x - 0.35, z - 0.35, x + 0.35, z + 0.35, 'prop'); }
function cot18(B, x, z, ry) {
  const r = propRoot(x, z, ry), c = pick([COL18.blue, COL18.green, COL18.red]);
  B.add(r, 'Box', { width: 0.6, height: 0.04, depth: 1.3 }, c, 0, [0, 0.14, 0]); for (const sx of [-0.28, 0.28]) for (const sz of [-0.62, 0.62]) B.add(r, 'Box', { width: 0.04, height: 0.14, depth: 0.04 }, c.map(v => v * 0.6), 0, [sx, 0.07, sz]);
  B.add(r, 'Box', { width: 0.56, height: 0.05, depth: 0.8 }, pick(KIDC18).map(v => v * 0.8 + 0.15), 0, [0, 0.18, 0.18], [0, rnd(-0.1, 0.1), 0]); B.add(r, 'Box', { width: 0.36, height: 0.07, depth: 0.22 }, [0.95, 0.95, 0.92], 0, [0, 0.19, -0.48]);
  addSolid(x - 0.4, z - 0.4, x + 0.4, z + 0.4, 'prop');
}
function trike18(B, x, z, ry, c = COL18.red) {
  const r = propRoot(x, z, ry);
  for (const [px, pz, d] of [[0, 0.35, 0.36], [-0.2, -0.2, 0.22], [0.2, -0.2, 0.22]]) B.add(r, 'Cylinder', { diameter: d, height: 0.04, tessellation: 14 }, COL18.black, 0, [px, d / 2, pz], [0, 0, Math.PI / 2]);
  B.add(r, 'Box', { width: 0.05, height: 0.05, depth: 0.6 }, c, 0, [0, 0.3, 0.05], [-0.25, 0, 0]); B.add(r, 'Box', { width: 0.4, height: 0.04, depth: 0.05 }, c, 0, [0, 0.2, -0.2]);
  B.add(r, 'Box', { width: 0.2, height: 0.05, depth: 0.2 }, COL18.black, 0, [0, 0.42, -0.1]); B.add(r, 'Box', { width: 0.04, height: 0.3, depth: 0.04 }, c, 0, [0, 0.5, 0.33]); B.add(r, 'Box', { width: 0.4, height: 0.03, depth: 0.03 }, COL18.steel, 0, [0, 0.66, 0.33]);
}
function block18(B, x, z, s = 0.2) { const r = propRoot(x, z, rnd(0, TAU)); B.add(r, 'Box', { width: s, height: s, depth: s }, pick(KIDC18), 0, [0, s / 2, 0]); }
function balloon3d18(g, x, z, top, col) {   // a balloon on a string, tied off at (x, 0.9, z)
  const y = top + rnd(-0.2, 0.2); sph18(g, x, y, z, 0.16, [col[0], col[1], col[2], 0.05], 8, 6, 1.25);
  for (let k = 0; k < 6; k++) { const a = y - 0.2 - k * (y - 1.1) / 6, b = a - (y - 1.1) / 6; W18.B.add(null, 'Box', { width: 0.006, height: a - b, depth: 0.006 }, [0.9, 0.9, 0.9], 0, [x + Math.sin(k) * 0.02, (a + b) / 2, z]); }
}

// ----- lights: troffers in the drop ceiling, a lamp shade, a kitchen pendant, bare bulbs hanging in the dark -----
function troffer18(p) {
  const r = propRoot(p.x, p.z, p.rot ? Math.PI / 2 : 0), on = p.state === 1 ? W18.BOn : p.state === 2 ? W18.BFl : W18.B, lit = p.state > 0;
  W18.B.add(r, 'Box', { width: p.w + 0.06, height: 0.03, depth: p.l + 0.06 }, [0.86, 0.86, 0.84], 0, [0, p.y - 0.015, 0]);
  on.add(r, 'Box', { width: p.w, height: 0.02, depth: p.l }, lit ? [1, 0.98, 0.94] : [0.62, 0.62, 0.6], lit ? 0.9 : 0, [0, p.y - 0.035, 0]);
  for (let i = 1; i < 4; i++) W18.B.add(r, 'Box', { width: p.w, height: 0.01, depth: 0.012 }, [0.8, 0.8, 0.78], 0, [0, p.y - 0.047, -p.l / 2 + i * p.l / 4]);
}
function bulb18(b) {
  const r = propRoot(b.x, b.z, 0), lit = b.state > 0, on = b.state === 1 ? W18.BOn : b.state === 2 ? W18.BFl : W18.B, y = b.y;
  if (b.kind === 'shade') { W18.B.add(r, 'Cylinder', { diameter: 0.012, height: 0.6, tessellation: 4 }, COL18.black, 0, [0, y - 0.3, 0]); on.add(r, 'Cylinder', { diameterTop: 0.22, diameterBottom: 0.46, height: 0.3, tessellation: 14 }, [1, 0.8, 0.5], 0.3, [0, y - 0.75, 0]); }
  else if (b.kind === 'pend') { W18.B.add(r, 'Cylinder', { diameter: 0.012, height: 0.5, tessellation: 4 }, COL18.black, 0, [0, y - 0.25, 0]); W18.B.add(r, 'Cylinder', { diameterTop: 0.14, diameterBottom: 0.5, height: 0.22, tessellation: 16 }, [0.86, 0.5, 0.16], 0, [0, y - 0.6, 0]); on.add(r, 'Sphere', { diameter: 0.12, segments: 6 }, [1, 0.9, 0.7], 0.8, [0, y - 0.7, 0]); }
  else { const L = b.cord || 0.4; W18.B.add(r, 'Cylinder', { diameter: 0.01, height: L, tessellation: 4 }, COL18.black, 0, [0, y - L / 2 + 0.5, 0]); on.add(r, 'Sphere', { diameter: 0.1, segments: 6 }, lit ? [1, 0.9, 0.7] : [0.4, 0.4, 0.38], lit ? 0.8 : 0, [0, y - L + 0.45, 0]); }
}
// ----- doors -----
function decoDoor18(B, e) {
  const s = sideOf5(e), r = atWall5(s, 0, 0), c = e.yel ? [0.86, 0.8, 0.6] : DOORC18[e.col % 4], W = DOORW, H = DOORH, cw = 0.09;
  B.add(r, 'Box', { width: W - 0.04, height: H - 0.02, depth: 0.045 }, c, 0, [0, H / 2, 0.02]);
  B.add(r, 'Box', { width: 0.3, height: 0.42, depth: 0.05 }, [0.08, 0.1, 0.12], 0.02, [0.18, 1.5, 0.024]);
  for (const sx of [-1, 1]) B.add(r, 'Box', { width: cw, height: H + cw, depth: 0.03 }, COL18.white, 0, [sx * (W / 2 + cw / 2 - 0.01), (H + cw) / 2, 0.015]);
  B.add(r, 'Box', { width: W + 2 * cw, height: cw, depth: 0.03 }, COL18.white, 0, [0, H + cw / 2, 0.015]);
  B.add(r, 'Box', { width: 0.12, height: 0.03, depth: 0.05 }, COL18.steel, 0, [-W / 2 + 0.16, 1.0, 0.07]); B.add(r, 'Box', { width: 0.05, height: 0.16, depth: 0.012 }, COL18.steel, 0, [-W / 2 + 0.16, 1.0, 0.048]);
  B.add(r, 'Box', { width: 0.26, height: 0.012, depth: 0.012 }, [0.3, 0.3, 0.3], 0, [0, 0.02, 0.05]);
  if (e.plate) plateOn18(r, 0, H + 0.24, e.plate, 0.62, 0.155);
  if (!e.yel && RNG() < 0.6) artOn18(r, rnd(-0.25, 0.25), rnd(0.95, 1.15), 0.3, undefined, 0.05);
  return r;
}
const DK18 = { class: 0, nap: 2, bed: 1, mead: 3 };
function buildDoors18() {
  W9.doorAnim = new Set();
  for (const e of LV.ek.values()) {
    if (e.kind !== 'door') continue;
    const horiz = e.d === 1 || e.d === 3, [mx, mz] = edgeMid(e.x, e.y, e.d), nx = e.x + DX[e.d], ny = e.y + DY[e.d];
    const fr = e.from || [e.x, e.y], to = fr[0] === e.x && fr[1] === e.y ? [nx, ny] : [e.x, e.y];
    const s = horiz ? (to[1] === Math.max(e.y, ny) ? 1 : -1) : (to[0] === Math.max(e.x, nx) ? 1 : -1);
    const hinge = tnode(null, horiz ? mx - DOORW / 2 + 0.03 : mx, 0, horiz ? mz : mz - DOORW / 2 + 0.03);
    const mesh = doorLeaf(DOORC18[e.col ?? DK18[e.dk] ?? 0], false); mesh.parent = hinge;
    const c0 = horiz ? 0 : -Math.PI / 2, c1 = c0 + (horiz ? -s : s) * 1.62;
    const bx = horiz ? [mx - DOORW / 2, mz - WT / 2, mx + DOORW / 2, mz + WT / 2] : [mx - WT / 2, mz - DOORW / 2, mx + WT / 2, mz + DOORW / 2];
    const dr = { e, key: eKey(e.x, e.y, e.d), horiz, s, hinge, mesh, c0, c1, bx, mx, mz, house: -1, dk: e.dk, metal: false, open: 0, target: 0, latched: false, locked: false,
      solid: addSolid(bx[0], bx[1], bx[2], bx[3], 'door'), shake: 0, cull: 30, bangs: 0 };
    markDyn(bx[0], bx[1], bx[2], bx[3], 1); hinge.rotation.y = c0;
    W9.doors.push(dr); W9.doorAt.set(dr.key, dr);
    if (e.dk === 'class') W18.classDoor = dr;
    if (e.plate) plateOn18(atWall5(sideOf5(e), 0, 0), 0, DOORH + 0.24, e.plate, 0.78, 0.19);
    W.interact.push({ x: mx, z: mz, y: 1.1, r: 1.75, door: dr, label: () => dr.target ? 'CLOSE DOOR' : 'OPEN DOOR', ok: () => true, act: () => useDoor(dr) });
  }
}
// a painted door: a crayon drawing of a door on the wall (the one you came in by; later, the one you leave by)
function drawDoor18(c, w, h, o = {}) {
  paper18(c, w, h, o.bg || '#f4efe0'); const lw = w * 0.03;
  if (o.glow) { const g = c.createRadialGradient(w / 2, h * 0.55, 10, w / 2, h * 0.55, w * 0.7); g.addColorStop(0, 'rgba(255,240,170,0.9)'); g.addColorStop(1, 'rgba(255,240,170,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
  const x0 = w * 0.18, x1 = w * 0.82, y0 = h * 0.12, y1 = h * 0.96;
  c.save(); c.beginPath(); c.rect(x0, y0, x1 - x0, y1 - y0); c.clip(); crayonFill18(c, x0, y0, x1, y1, o.fill || '#b07a45', lw * 1.3); c.restore();
  crayonLine18(c, [[x0, y1], [x0, y0], [x1, y0], [x1, y1]], o.line || '#6a4020', lw * 1.3);
  crayonCircle18(c, x1 - w * 0.1, h * 0.58, w * 0.035, '#e0b000', lw, '#e0b000');
  if (o.word) crayonText18(c, o.word, w / 2, h * 0.3, Math.round(w * 0.16), o.wordCol || '#e2483c', -0.04);
  if (o.sun) { crayonCircle18(c, w * 0.12, h * 0.07, w * 0.06, '#e0b000', lw, '#f3c230'); }
}

// ================= rooms =================
function furnishHall18(B) {
  const K = ['cubby', 'cubby', 'hooks', 'hooks', 'bench', 'cork', 'fountain', 'cubby', 'toybin'];
  for (const s of shuffle(wallSlots5(LV.hall.cells))) {
    if (s.door || s.x <= 4) continue;
    const q = RNG();
    if (q < 0.62) {
      const k = pick(K), w = { cubby: 1.3, hooks: 1.4, bench: 1.2, cork: 1.26, fountain: 0.45, toybin: 0.6 }[k], al = rnd(-0.9, 0.9) * (1.8 - w / 2 - 0.2) / 1.8;
      if (!slotUse18(s, al, w)) continue;
      const r = placeF18(B, s, al, k, { hw: w / 2 });
      if (k === 'cubby' || k === 'bench' || k === 'toybin') for (let i = 0; i < 2; i++) if (RNG() < 0.7) artOn18(r, (i - 0.5) * 0.6 + rnd(-0.1, 0.1), rnd(1.45, 1.75), 0.34);
      if (RNG() < 0.15 && slotUse18(s, al > 0 ? -1.2 : 1.2, 0.2)) FURN18.extinguisher(B, atWall5(s, al > 0 ? -1.2 : 1.2));
    } else if (q < 0.85) { for (let i = 0; i < 3; i++) { const al = -1.1 + i * 1.1 + rnd(-0.1, 0.1); if (slotUse18(s, al, 0.4)) artOn18(atWall5(s, al), 0, rnd(1.3, 1.7), 0.36); } }
  }
  // paper bunting zig-zagging under the ceiling the length of the corridor
  const z0 = 20 * CELL + 0.25, z1 = 21 * CELL - 0.25;
  for (let x = 5 * CELL; x < 24 * CELL; x += 0.34) {
    const k = Math.round(x / 0.34), sag = Math.sin((x % 3.6) / 3.6 * Math.PI) * 0.22;
    for (const zz of [z0, z1]) B.add(null, 'Box', { width: 0.2, height: 0.2, depth: 0.004 }, KIDC18[k % 8], 0.05, [x, CEIL - 0.28 - sag, zz], [0, 0, Math.PI / 4]);
  }
  trike18(B, cellCenter(15) + 0.4, cellCenter(20) + 1.1, 2.4, COL18.blue);
  { const r = propRoot(cellCenter(21), cellCenter(20) - 1.2, 0.7); B.add(r, 'Box', { width: 0.1, height: 0.07, depth: 0.2 }, COL18.pink, 0, [0, 0.035, 0]); }   // a lost shoe
}
function furnishClass18(B) {
  const cx = x => cellCenter(x), cz = y => cellCenter(y);
  rug18(B, 39.4, 68.2, 1.6); W18.rug = { x: 39.4, z: 68.2 }; W18.dinoHome = { x: 39.6, z: 68.0 };
  beanbag18(B, 41.3, 66.6, COL18.red); beanbag18(B, 41.4, 69.9, COL18.blue); beanbag18(B, 37.3, 70.2, COL18.yel);
  kidTable18(B, 32.6, 61.8, 0.05, 4, COL18.yel); kidTable18(B, 37.6, 62.6, -0.08, 4, COL18.green); kidTable18(B, 31.4, 68.6, 1.57, 4, COL18.blue);
  // teacher's desk (the note is on it) + chair
  { const r = propRoot(41.0, 59.4, 0); B.add(r, 'Box', { width: 1.3, height: 0.04, depth: 0.65 }, COL18.wood, 0, [0, 0.74, 0]); for (const sx of [-0.6, 0.6]) B.add(r, 'Box', { width: 0.05, height: 0.72, depth: 0.6 }, COL18.wood.map(v => v * 0.8), 0, [sx, 0.36, 0]);
    B.add(r, 'Sphere', { diameter: 0.09, segments: 8 }, COL18.red, 0, [0.45, 0.8, 0.1]); B.add(r, 'Box', { width: 0.24, height: 0.06, depth: 0.18 }, COL18.blue, 0, [-0.4, 0.79, -0.1]);
    if (!B.mdl('schair', r, [0, 0, -0.66], null, 0.95)) { B.add(r, 'Box', { width: 0.45, height: 0.05, depth: 0.42 }, COL18.grey, 0, [0, 0.46, -0.62]); B.add(r, 'Box', { width: 0.45, height: 0.45, depth: 0.05 }, COL18.grey, 0, [0, 0.72, -0.84]); }
    addSolid(40.3, 58.9, 41.7, 59.9, 'prop'); W18.deskNote = { x: 41.0, y: 0.765, z: 59.55 }; }
  // east wall: cubbies, the bookshelf (with the music box), a window full of a sunny afternoon
  placeF18(B, { x: 11, y: 16, d: 0, c: cIdx(11, 16) }, 0.6, 'cubby', { hw: 0.65 });
  const sh = placeF18(B, { x: 11, y: 17, d: 0, c: cIdx(11, 17) }, 0.4, 'shelf', { hw: 0.55 });
  { const p = localPt(sh, 0, 0.96, 0.15); const r = propRoot(p.x, p.z, sh.rotation.y); B.add(r, 'Box', { width: 0.2, height: 0.12, depth: 0.14 }, [0.86, 0.5, 0.62], 0, [0, 1.01, 0]); B.add(r, 'Box', { width: 0.2, height: 0.02, depth: 0.14 }, COL18.yel, 0, [0, 1.08, 0]); B.add(r, 'Cylinder', { diameter: 0.012, height: 0.06, tessellation: 4 }, COL18.steel, 0, [0.12, 1.02, 0], [0, 0, Math.PI / 2]);
    W18.musicBox = { x: p.x, y: 1.05, z: p.z }; }
  placeF18(B, { x: 11, y: 19, d: 0, c: cIdx(11, 19) }, 0.2, 'easel', { hw: 0.4 });
  placeF18(B, { x: 8, y: 19, d: 2, c: cIdx(8, 19) }, 0, 'toykitchen', { hw: 0.45 });
  placeF18(B, { x: 8, y: 16, d: 2, c: cIdx(8, 16) }, 0.2, 'toybin', { hw: 0.3 });
  { const r = atWall5({ x: 11, y: 18, d: 0 }, 0, 0);
    B.add(r, 'Box', { width: 1.5, height: 1.1, depth: 0.06 }, COL18.white, 0, [0, 1.65, 0.03]);
    const S = paperPlane18('win18', 1.36, 0.96, 256, 180, r, [0, 1.65, 0.065], 1.6, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7fbde8'); g.addColorStop(1, '#d9eef7'); c.fillStyle = g; c.fillRect(0, 0, w, h); cloud18(c, w * 0.3, h * 0.3, 14); cloud18(c, w * 0.75, h * 0.2, 10); c.fillStyle = '#6db84a'; c.fillRect(0, h * 0.8, w, h * 0.2); c.fillStyle = '#ffffff'; c.fillRect(w / 2 - 3, 0, 6, h); c.fillRect(0, h / 2 - 3, w, 6); });
    W18.winMats.push(S.mat); }
  // alphabet frieze along the north wall
  const AB = ['ABCDEFG', 'HIJKLMN', 'OPQRSTU', 'VWXYZ'];
  for (let i = 0; i < 4; i++) {
    const r = atWall5({ x: 8 + i, y: 16, d: 3 }, 0, 0), txt = AB[i];
    paperPlane18('abc18_' + i, 3.3, 0.36, 512, 56, r, [0, 2.48, 0.02], 0.25, (c, w, h) => {
      c.fillStyle = '#fbf8ef'; c.fillRect(0, 0, w, h); const n = 7, cw = w / n;
      for (let k = 0; k < txt.length; k++) { c.fillStyle = ['#e2483c', '#f08a24', '#e0b000', '#3aa04a', '#2f7fd0', '#8a5cc8', '#e05a9a'][(k + i * 7) % 7]; c.fillRect(k * cw + 6, 5, cw - 12, h - 10); c.fillStyle = '#fff'; c.font = 'bold 40px "Comic Sans MS", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt[k] + txt[k].toLowerCase(), k * cw + cw / 2, h / 2 + 2); }
    });
  }
  // kids' art on the remaining walls
  for (const s of wallSlots5(LV.cls.cells)) { if (s.d === 3 || (s.d === 2 && (s.y === 17 || s.y === 18))) continue; if (RNG() < 0.7 && slotUse18(s, -1.3, 0.4)) artOn18(atWall5(s, -1.3), 0, rnd(1.5, 1.8), 0.36); }
}
function furnishNap18(B) {
  for (const x of [13, 14, 15]) { cot18(B, cellCenter(x), cellCenter(21) + 0.5, 0); cot18(B, cellCenter(x), cellCenter(23) - 0.3, Math.PI); }
  const n = LV.nightNap, r = propRoot(n.x + 1.3, n.z, 0);
  B.add(r, 'Box', { width: 0.3, height: 0.4, depth: 0.3 }, COL18.wood2, 0, [0, 0.2, 0]); W18.BOn.add(r, 'Sphere', { diameter: 0.22, segments: 8 }, [1, 0.8, 0.5], 0.5, [0, 0.52, 0], null, [1, 0.8, 1]);
  addSolid(n.x + 1.1, n.z - 0.2, n.x + 1.5, n.z + 0.2, 'prop');
  { const t = propRoot(cellCenter(15), cellCenter(21) + 0.4, 2.6); teddy3d18(B, t, 0.5); }
  for (const s of wallSlots5(LV.nap.cells)) if (!s.door && RNG() < 0.4 && slotUse18(s, 0, 0.4)) artOn18(atWall5(s, 0), 0, 1.5, 0.34);
}
function teddy3d18(B, r, k = 1) {
  const c = [0.6, 0.4, 0.22], l = [0.84, 0.66, 0.46];
  B.add(r, 'Sphere', { diameter: 0.3 * k, segments: 10 }, c, 0, [0, 0.16 * k, 0], null, [1, 1.1, 0.9]); B.add(r, 'Sphere', { diameter: 0.22 * k, segments: 10 }, c, 0, [0, 0.39 * k, 0.02 * k]);
  B.add(r, 'Sphere', { diameter: 0.09 * k, segments: 8 }, l, 0, [0, 0.37 * k, 0.11 * k]);
  for (const s of [-1, 1]) { B.add(r, 'Sphere', { diameter: 0.08 * k, segments: 8 }, c, 0, [s * 0.08 * k, 0.5 * k, 0]); B.add(r, 'Sphere', { diameter: 0.1 * k, segments: 8 }, c, 0, [s * 0.15 * k, 0.2 * k, 0.04 * k]); B.add(r, 'Sphere', { diameter: 0.11 * k, segments: 8 }, c, 0, [s * 0.08 * k, 0.05 * k, 0.1 * k]); B.add(r, 'Sphere', { diameter: 0.025 * k, segments: 6 }, COL18.black, 0, [s * 0.045 * k, 0.42 * k, 0.1 * k]); }
}
function furnishYel18(B) {
  { const r = propRoot(cellCenter(19) - 0.9, cellCenter(24), 0.3); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.08, height: 0.06, depth: 0.17 }, COL18.red, 0, [s * 0.06, 0.03, 0]); }   // little red shoes, side by side
  for (const s of wallSlots5(LV.yel.cells)) if (!s.door && RNG() < 0.22 && slotUse18(s, 0, 0.4)) artOn18(atWall5(s, rnd(-0.8, 0.8)), 0, rnd(0.9, 1.2), 0.3);
}
function furnishPlay18(B) {
  const P = PIT18, g = W18.ballG, pc = [[0.86, 0.16, 0.12], [0.96, 0.78, 0.1], [0.14, 0.4, 0.86], [0.24, 0.66, 0.26], [0.94, 0.5, 0.66], [0.56, 0.34, 0.78]];
  // the ball pit: padded vinyl walls, an opening on the north side, a sea of balls
  const pad = (x0, z0, x1, z1, col) => { const r = propRoot((x0 + x1) / 2, (z0 + z1) / 2, 0); B.add(r, 'Box', { width: x1 - x0, height: 0.62, depth: z1 - z0 }, col, 0, [0, 0.31, 0]); B.add(r, 'Box', { width: x1 - x0 + 0.02, height: 0.05, depth: z1 - z0 + 0.02 }, [0.95, 0.95, 0.95], 0, [0, 0.64, 0]); addSolid(x0, z0, x1, z1, 'prop'); };
  const T = 0.25, gm = (P.x0 + P.x1) / 2;
  let k = 0; const seg = (a0, a1, fn) => { for (let a = a0; a < a1 - 0.01; a += 1.3) { fn(a, Math.min(a1, a + 1.3), pc[k++ % 3 === 0 ? 0 : k % 3 === 1 ? 1 : 2]); } };
  seg(P.x0, P.x1, (a, b, c) => pad(a, P.z1 - T, b, P.z1, c));
  seg(P.z0, P.z1 - T, (a, b, c) => { pad(P.x0, a, P.x0 + T, b, c); pad(P.x1 - T, a, P.x1, b, c); });
  seg(P.x0 + T, gm - P.gap / 2, (a, b, c) => pad(a, P.z0, b, P.z0 + T, c)); seg(gm + P.gap / 2, P.x1 - T, (a, b, c) => pad(a, P.z0, b, P.z0 + T, c));
  { const r = propRoot(gm, P.z0 - 0.3, 0); B.add(r, 'Box', { width: P.gap, height: 0.2, depth: 0.5 }, [0.9, 0.9, 0.9], 0, [0, 0.1, 0]); }   // a padded step in
  const tray = propRoot((P.x0 + P.x1) / 2, (P.z0 + P.z1) / 2, 0); B.add(tray, 'Box', { width: P.x1 - P.x0 - 2 * T, height: 0.02, depth: P.z1 - P.z0 - 2 * T }, [0.4, 0.2, 0.3], 0, [0, 0.33, 0]);
  for (let i = 0; i < 760; i++) { const x = rnd(P.x0 + T + 0.08, P.x1 - T - 0.08), z = rnd(P.z0 + T + 0.08, P.z1 - T - 0.08); sph18(g, x, rnd(0.36, 0.47), z, 0.085, pick(pc), 6, 4); }
  // climbing frame with the pink slide
  { const x = 103.2, z = 78.4, r = propRoot(x, z, 0), H = 1.5;
    for (const sx of [-0.7, 0.7]) for (const sz of [-0.7, 0.7]) B.add(r, 'Box', { width: 0.1, height: H + 1.0, depth: 0.1 }, COL18.yel, 0, [sx, (H + 1.0) / 2, sz]);
    B.add(r, 'Box', { width: 1.5, height: 0.08, depth: 1.5 }, COL18.blue, 0, [0, H, 0]); B.add(r, 'Box', { width: 1.6, height: 0.5, depth: 1.6 }, COL18.red, 0, [0, H + 1.05, 0], null);
    for (let i = 0; i < 5; i++) B.add(r, 'Box', { width: 0.6, height: 0.05, depth: 0.05 }, COL18.green, 0, [0, 0.3 * i + 0.3, -0.75]);
    for (let i = 0; i < 10; i++) { const t0 = i / 10, t1 = (i + 1) / 10, y0 = H - t0 * (H - 0.25), y1 = H - t1 * (H - 0.25), x0 = 0.75 + t0 * 2.4, x1 = 0.75 + t1 * 2.4; B.add(r, 'Box', { width: Math.hypot(x1 - x0, y1 - y0) + 0.02, height: 0.04, depth: 0.7 }, COL18.pink, 0.05, [(x0 + x1) / 2, (y0 + y1) / 2, 0], [0, 0, -Math.atan2(y0 - y1, x1 - x0)]); for (const s of [-1, 1]) B.add(r, 'Box', { width: Math.hypot(x1 - x0, y1 - y0) + 0.02, height: 0.16, depth: 0.04 }, COL18.pink.map(v => v * 0.85), 0, [(x0 + x1) / 2, (y0 + y1) / 2 + 0.08, s * 0.35], [0, 0, -Math.atan2(y0 - y1, x1 - x0)]); }
    addSolid(x - 0.8, z - 0.8, x + 0.8, z + 0.8, 'prop'); addSolid(x + 0.8, z - 0.4, x + 3.2, z + 0.4, 'prop'); }
  // soft-play foam shapes
  for (let i = 0; i < 12; i++) { const x = rnd(104.5, 110), z = rnd(55, 60.5), r = propRoot(x, z, rnd(0, TAU)), c = pick(KIDC18), m = i % 3;
    if (m === 0) B.add(r, 'Box', { width: 0.6, height: 0.6, depth: 0.6 }, c, 0, [0, 0.3, 0]); else if (m === 1) B.add(r, 'Cylinder', { diameter: 0.6, height: 0.7, tessellation: 14 }, c, 0, [0, 0.35, 0]); else B.add(r, 'Box', { width: 0.8, height: 0.3, depth: 0.6 }, c, 0, [0, 0.15, 0]);
    if (i < 6) addSolid(x - 0.3, z - 0.3, x + 0.3, z + 0.3, 'prop'); }
  // birthday party tables, balloons still tied to the chairs
  for (const [x, z] of [[96.5, 58.5], [99.8, 62.2]]) {
    kidTable18(B, x, z, 0, 6, COL18.white);
    const r = propRoot(x, z, 0); B.add(r, 'Cylinder', { diameter: 0.3, height: 0.16, tessellation: 16 }, [0.95, 0.85, 0.9], 0, [0, 0.62, 0]); B.add(r, 'Cylinder', { diameter: 0.012, height: 0.08, tessellation: 4 }, COL18.yel, 0.5, [0, 0.74, 0]);
    for (let i = 0; i < 3; i++) balloon3d18(g, x + rnd(-0.7, 0.7), z + rnd(-0.6, 0.6), rnd(2.2, 2.9), pick(pc));
  }
  // a coin-op car by the entrance
  { const r = propRoot(91.6, 69.5, 0.6); B.add(r, 'Box', { width: 0.9, height: 0.25, depth: 1.3 }, COL18.steel, 0, [0, 0.12, 0]); B.add(r, 'Box', { width: 0.7, height: 0.4, depth: 1.1 }, COL18.red, 0, [0, 0.45, 0]); B.add(r, 'Box', { width: 0.6, height: 0.3, depth: 0.5 }, COL18.red, 0, [0, 0.8, -0.1]);
    B.add(r, 'Cylinder', { diameter: 0.28, height: 0.04, tessellation: 12 }, COL18.black, 0, [0, 0.85, 0.28], [1.1, 0, 0]); for (const sx of [-0.36, 0.36]) for (const sz of [-0.4, 0.4]) B.add(r, 'Cylinder', { diameter: 0.28, height: 0.1, tessellation: 12 }, COL18.black, 0, [sx, 0.26, sz], [0, 0, Math.PI / 2]);
    addSolid(91.0, 68.9, 92.2, 70.1, 'prop'); }
  // the crawl tunnel
  { const r = propRoot(107.2, 82.6, Math.PI / 2); for (let i = 0; i < 5; i++) B.add(r, 'Cylinder', { diameter: 0.9, height: 0.5, tessellation: 16, cap: BABYLON.Mesh.NO_CAP, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, KIDC18[i], 0, [0, 0.45, -1 + i * 0.5], [Math.PI / 2, 0, 0]); addSolid(105.9, 82.1, 108.5, 83.1, 'prop'); }
  // a big painted sun on the north wall, smiling a little too wide
  { const r = atWall5({ x: 27, y: 15, d: 3 }, -1.8, 0);
    paperPlane18('sun18', 2.6, 2.6, 256, 256, r, [0, 2.1, 0.02], 0.3, (c, w, h) => {
      c.fillStyle = '#6aa9dc'; c.fillRect(0, 0, w, h); c.fillStyle = '#f3c230'; for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; c.beginPath(); c.moveTo(w / 2 + Math.cos(a - 0.12) * 70, h / 2 + Math.sin(a - 0.12) * 70); c.lineTo(w / 2 + Math.cos(a) * 124, h / 2 + Math.sin(a) * 124); c.lineTo(w / 2 + Math.cos(a + 0.12) * 70, h / 2 + Math.sin(a + 0.12) * 70); c.fill(); }
      c.beginPath(); c.arc(w / 2, h / 2, 76, 0, TAU); c.fill(); c.fillStyle = '#222'; for (const s of [-1, 1]) { c.beginPath(); c.ellipse(w / 2 + s * 26, h / 2 - 16, 8, 13, 0, 0, TAU); c.fill(); }
      c.strokeStyle = '#222'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h / 2 + 2, 46, 0.25, Math.PI - 0.25); c.stroke(); c.fillStyle = '#f08a9a'; for (const s of [-1, 1]) { c.beginPath(); c.arc(w / 2 + s * 48, h / 2 + 18, 11, 0, TAU); c.fill(); }
    }); }
  { const r = atWall5({ x: 25, y: 20, d: 2 }, 0, 0); paperPlane18('playsign18', 2.4, 0.5, 512, 108, r, [0, 3.1, 0.02], 0.9, (c, w, h) => { c.fillStyle = '#2d5d9a'; c.fillRect(0, 0, w, h); const t = 'PLAYLAND'; c.font = 'bold 76px "Comic Sans MS", sans-serif'; c.textBaseline = 'middle'; let x = 40; for (let i = 0; i < t.length; i++) { c.fillStyle = ['#e2483c', '#f3c230', '#57b45a', '#e87fb0'][i % 4]; c.fillText(t[i], x, h / 2 + 4); x += c.measureText(t[i]).width + 4; } }); }
  // toy bins and stray balls
  for (const s of shuffle(wallSlots5(LV.play.cells)).slice(0, 7)) if (!s.door && slotUse18(s, 0, 0.7)) placeF18(B, s, 0, 'toybin', { hw: 0.3 });
  for (let i = 0; i < 40; i++) { const x = rnd(90.6, 111), z = rnd(54.6, 86); if (x > P.x0 - 0.3 && x < P.x1 + 0.3 && z > P.z0 - 0.6 && z < P.z1 + 0.3) continue; sph18(g, x, 0.085, z, 0.085, pick(pc), 6, 4); }
  // the torn place in the mural: paper curling back from a hole full of nothing
  tornEdge18(B, LV.ek.get(eKey(30, 18, 0)), [0.62, 0.72, 0.9]); tornEdge18(B, LV.ek.get(eKey(5, 20, 1)), [0.55, 0.78, 0.93]);
}
function tornEdge18(B, e, col) {
  const s = sideOf5(e), r = atWall5(s, 0, 0.01), op = opening18(e);
  for (let i = 0; i < 26; i++) {
    const t = i / 26, side = i % 3, len = rnd(0.12, 0.34); let lx, ly, rot;
    if (side === 0) { lx = -op.w / 2 - rnd(0, 0.12); ly = t * op.h; rot = rnd(-0.6, 0.6); } else if (side === 1) { lx = op.w / 2 + rnd(0, 0.12); ly = t * op.h; rot = rnd(-0.6, 0.6); } else { lx = (t - 0.5) * op.w; ly = op.h + rnd(0, 0.14); rot = rnd(0.8, 2.3); }
    B.add(r, 'Box', { width: 0.12, height: len, depth: 0.008 }, col.map(v => v * rnd(0.85, 1.05)), 0, [lx, ly, rnd(0.01, 0.06)], [rnd(-0.4, 0.2), 0, rot]);
  }
  for (let i = 0; i < 8; i++) { const p = localPt(r, rnd(-1, 1), 0, rnd(0.2, 1.2)); B.add(null, 'Box', { width: rnd(0.1, 0.25), height: 0.004, depth: rnd(0.08, 0.2) }, col, 0, [p.x, 0.004, p.z], [0, rnd(0, TAU), 0]); }
}
// ----- the slide hall: four slides against the south wall, each one a different colour and a different way down -----
function furnishSlides18(B) {
  const zw = 30 * CELL + CELL - WT / 2, top = 2.3;
  for (const S of SLIDES18) {
    const x = cellCenter(S.x), c = S.col, dk = c.map(v => v * 0.7), r = propRoot(x, zw, Math.PI), pz = 0.75;   // local +z points north, away from the wall
    // platform, posts, ladder on the east side
    B.add(r, 'Box', { width: 1.3, height: 0.1, depth: 1.3 }, COL18.white, 0, [0, top, pz]); for (const sx of [-0.6, 0.6]) for (const sz of [0.15, 1.35]) B.add(r, 'Box', { width: 0.1, height: top + 1.0, depth: 0.1 }, COL18.white, 0, [sx, (top + 1.0) / 2, sz]);
    for (const sx of [-0.6, 0.6]) B.add(r, 'Box', { width: 0.05, height: 0.05, depth: 1.25 }, c, 0, [sx, top + 0.9, pz]); B.add(r, 'Box', { width: 1.25, height: 0.05, depth: 0.05 }, c, 0, [0, top + 0.9, 0.15]);
    for (let i = 0; i < 8; i++) B.add(r, 'Box', { width: 0.05, height: 0.04, depth: 0.5 }, COL18.steel, 0, [-0.72, 0.3 + i * 0.28, pz], null);
    for (const sz of [pz - 0.25, pz + 0.25]) B.add(r, 'Box', { width: 0.04, height: top + 0.5, depth: 0.04 }, COL18.steel, 0, [-0.72, (top + 0.5) / 2, sz]);
    const z0 = pz + 0.65, z1 = pz + 4.3, yEnd = 0.35;
    if (S.id === 'red') {          // open straight chute
      for (let i = 0; i < 10; i++) { const a = i / 10, b = (i + 1) / 10, ya = top - (top - yEnd) * a, yb = top - (top - yEnd) * b, za = z0 + (z1 - z0) * a, zb = z0 + (z1 - z0) * b, L = Math.hypot(zb - za, yb - ya), ang = Math.atan2(ya - yb, zb - za);
        B.add(r, 'Box', { width: 0.7, height: 0.04, depth: L + 0.02 }, c, 0.04, [0, (ya + yb) / 2, (za + zb) / 2], [ang, 0, 0]);
        for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: 0.2, depth: L + 0.02 }, dk, 0, [s * 0.36, (ya + yb) / 2 + 0.1, (za + zb) / 2], [ang, 0, 0]); }
    } else if (S.id === 'blue') {  // wave slide
      for (let i = 0; i < 14; i++) { const f = t => top - (top - yEnd) * t + Math.sin(t * Math.PI * 3) * 0.18 * (1 - t), a = i / 14, b = (i + 1) / 14, ya = f(a), yb = f(b), za = z0 + (z1 - z0) * a, zb = z0 + (z1 - z0) * b, L = Math.hypot(zb - za, yb - ya), ang = Math.atan2(ya - yb, zb - za);
        B.add(r, 'Box', { width: 0.75, height: 0.04, depth: L + 0.02 }, c, 0.04, [0, (ya + yb) / 2, (za + zb) / 2], [ang, 0, 0]);
        for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: 0.22, depth: L + 0.02 }, c.map(v => v * 0.8), 0, [s * 0.38, (ya + yb) / 2 + 0.1, (za + zb) / 2], [ang, 0, 0]); }
    } else if (S.id === 'green') { // straight tube
      const a = rootPt(r, 0, top + 0.35, z0 - 0.1), b = rootPt(r, 0, yEnd + 0.35, z1); B.pipe(a, b, 0.4, c, 0.03, 14);
      const e0 = rootPt(r, 0, yEnd + 0.35, z1 + 0.02), e1 = rootPt(r, 0, yEnd + 0.35, z1 + 0.06); B.pipe(e0, e1, 0.46, COL18.white, 0, 14);
    } else {                       // yellow: a spiral tube round a post (like the one in the loft)
      const ax = 0, az = pz + 2.4, R = 1.05, n = 22; let prev = rootPt(r, 0, top + 0.35, z0 - 0.1);
      B.add(r, 'Cylinder', { diameter: 0.16, height: top + 1.2, tessellation: 10 }, COL18.white, 0, [ax, (top + 1.2) / 2, az]);
      for (let i = 1; i <= n; i++) { const t = i / n, ang = -Math.PI / 2 + t * TAU * 1.0, y = top + 0.35 - (top - yEnd) * t; const p = rootPt(r, ax + Math.sin(ang) * R * (i < 3 ? t * 3 : 1), y, az - Math.cos(ang) * R * (i < 3 ? t * 3 : 1) + (i < 3 ? (1 - t * 3) * (z0 - az) : 0)); B.pipe(prev, p, 0.36, c, 0.03, 12); prev = p; }
      const e = rootPt(r, 0, yEnd + 0.35, az + R + 0.4); B.pipe(prev, e, 0.36, c, 0.03, 12);
    }
    // collision: platform + the run of the slide
    solidLocal(r, -0.8, 0.05, 0.8, 1.45); solidLocal(r, -0.45, 1.45, 0.45, z1 - 0.2); if (S.id === 'yellow') solidLocal(r, -1.45, 1.4, 1.45, pz + 3.5);
    // the sign above: which colour, and a crayon picture of where it goes
    const sr = atWall5({ x: S.x, y: 30, d: 1 }, 0, 0);
    paperPlane18('slide18_' + S.id, 1.2, 0.84, 256, 180, sr, [0, 3.55, 0.02], 0.6, (cx, w, h) => { paper18(cx, w, h); const col = '#' + c.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join(''); cx.strokeStyle = col; cx.lineWidth = 12; cx.strokeRect(8, 8, w - 16, h - 16); slideIcon18(cx, S.icon, w, h, col); crayonText18(cx, S.name, w / 2, h - 30, 30, col); });
    const endL = localPt(r, 0, 0, z1 + 0.55), topL = localPt(r, 0, top + 1.3, pz + 0.3);
    W18.slides.push(Object.assign({}, S, { x: endL.x, z: endL.z, top: { x: topL.x, y: top + 1.3, z: topL.z }, run: z1 - pz, r }));
  }
  for (const [x, y] of [[26, 26], [29, 26]]) placeF18(B, { x, y, d: 3, c: cIdx(x, y) }, 0, 'bench', { hw: 0.6 });
  placeF18(B, { x: 31, y: 27, d: 0, c: cIdx(31, 27) }, 0, 'lockers', { hw: 0.62 });
}
function slideIcon18(c, icon, w, h, col) {
  const cx = w / 2, cy = h * 0.42;
  if (icon === 'bed') { crayonLine18(c, [[cx - 60, cy + 30], [cx - 60, cy - 20], [cx - 60, cy + 5], [cx + 60, cy + 5], [cx + 60, cy + 30]], '#7a4e2a', 7); crayonFill18(c, cx - 50, cy - 12, cx + 55, cy + 4, '#3f8fe0', 7); crayonCircle18(c, cx - 38, cy - 16, 11, '#222', 4, '#fff'); crayonText18(c, 'Z z', cx + 40, cy - 40, 26, '#8a5cc8'); }
  else if (icon === 'balls') { [['#e2483c', -40, 10], ['#f3c230', 0, 18], ['#3f8fe0', 38, 8], ['#57b45a', -18, -18], ['#e87fb0', 22, -16]].forEach(([k, dx, dy]) => crayonCircle18(c, cx + dx, cy + dy, 17, k, 4, k)); }
  else if (icon === 'sun') { crayonCircle18(c, cx + 30, cy - 18, 20, '#e0b000', 5, '#f3c230'); crayonLine18(c, [[cx - 70, cy + 32], [cx + 70, cy + 30]], '#3aa04a', 12); crayonLine18(c, [[cx - 35, cy + 30], [cx - 35, cy - 5]], '#7a4e2a', 8); crayonCircle18(c, cx - 35, cy - 18, 20, '#3aa04a', 5, '#57b45a'); }
  else { crayonLine18(c, [[cx - 50, cy + 32], [cx - 50, cy - 10], [cx, cy - 40], [cx + 50, cy - 10], [cx + 50, cy + 32], [cx - 50, cy + 32]], '#e2483c', 6); crayonLine18(c, [[cx - 12, cy + 32], [cx - 12, cy + 5], [cx + 12, cy + 5], [cx + 12, cy + 32]], '#3f8fe0', 5); crayonCircle18(c, cx, cy - 12, 8, '#e0b000', 4, '#f3c230'); }
}
function furnishMead18(B) {
  const g = W18.ballG;
  { const r = propRoot(15.4, 113.2, 0.4); B.add(r, 'Cylinder', { diameterTop: 0.78, diameterBottom: 0.95, height: 0.5, tessellation: 16 }, [0.44, 0.3, 0.16], 0, [0, 0.25, 0]); B.add(r, 'Cylinder', { diameter: 0.76, height: 0.02, tessellation: 16 }, [0.8, 0.64, 0.42], 0, [0, 0.505, 0]); for (let i = 1; i < 4; i++) B.add(r, 'Torus', { diameter: i * 0.18, thickness: 0.012, tessellation: 18 }, [0.55, 0.4, 0.24], 0, [0, 0.515, 0]); addSolid(14.9, 112.7, 15.9, 113.7, 'prop'); W18.stump = { x: 15.4, z: 113.2 }; }
  { const r = propRoot(17.6, 115.6, 1.2); B.add(r, 'Cylinder', { diameter: 0.5, height: 2.2, tessellation: 14 }, [0.42, 0.29, 0.16], 0, [0, 0.25, 0], [0, 0, Math.PI / 2]); for (const s of [-1, 1]) B.add(r, 'Cylinder', { diameter: 0.46, height: 0.02, tessellation: 14 }, [0.78, 0.62, 0.4], 0, [s * 1.105, 0.25, 0], [0, 0, Math.PI / 2]); solidLocal(r, -1.1, -0.26, 1.1, 0.26); }
  { const x = 23.6, z = 111.6, r = propRoot(x, z, 0); B.add(r, 'Cylinder', { diameter: 2.8, height: 0.03, tessellation: 28 }, [0.2, 0.5, 0.86], 0.08, [0, 0.02, 0]);
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; B.add(r, 'Sphere', { diameter: rnd(0.22, 0.34), segments: 6 }, [0.62, 0.6, 0.56].map(v => v * rnd(0.8, 1.1)), 0, [Math.cos(a) * 1.48, 0.06, Math.sin(a) * 1.48], null, [1, 0.6, 1]); }
    for (let i = 0; i < 4; i++) B.add(r, 'Cylinder', { diameter: 0.34, height: 0.012, tessellation: 10 }, [0.2, 0.55, 0.22], 0, [rnd(-0.9, 0.9), 0.04, rnd(-0.9, 0.9)]);
    const d = propRoot(x + 0.4, z - 0.3, 0.8); B.add(d, 'Sphere', { diameter: 0.18, segments: 8 }, COL18.yel, 0, [0, 0.09, 0], null, [1, 0.7, 1.3]); B.add(d, 'Sphere', { diameter: 0.1, segments: 8 }, COL18.yel, 0, [0, 0.19, 0.08]); B.add(d, 'Box', { width: 0.04, height: 0.02, depth: 0.06 }, COL18.orange, 0, [0, 0.19, 0.14]);
    addSolid(x - 1.3, z - 1.3, x + 1.3, z + 1.3, 'prop'); }
  // the rainbow bunny, sitting up in the corner as if it had been waiting
  { const r = propRoot(12.2, 102.2, 2.4), RB = [COL18.red, COL18.orange, COL18.yel, COL18.green, COL18.blue, COL18.purple];
    for (let i = 0; i < 6; i++) B.add(r, 'Sphere', { diameter: 0.5 - i * 0.02, segments: 10 }, RB[i], 0, [0, 0.12 + i * 0.07, 0], null, [1, 0.4, 0.85]);
    B.add(r, 'Sphere', { diameter: 0.36, segments: 10 }, [0.95, 0.94, 0.92], 0, [0, 0.72, 0.02]); for (const s of [-1, 1]) { B.add(r, 'Sphere', { diameter: 0.14, segments: 8 }, RB[s < 0 ? 4 : 1], 0, [s * 0.08, 1.02, 0], [0, 0, s * 0.15], [0.55, 2.1, 0.5]); B.add(r, 'Sphere', { diameter: 0.04, segments: 6 }, COL18.black, 0, [s * 0.07, 0.76, 0.16]); B.add(r, 'Sphere', { diameter: 0.14, segments: 8 }, RB[i6(s)], 0, [s * 0.2, 0.06, 0.18]); }
    addSolid(11.9, 101.9, 12.5, 102.5, 'prop'); }
  // picnic blanket + basket, plastic flowers, a wagon
  { const r = propRoot(21.2, 104.6, 0.2); for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) B.add(r, 'Box', { width: 0.3, height: 0.006, depth: 0.3 }, (i + j) % 2 ? [0.86, 0.14, 0.12] : [0.95, 0.94, 0.9], 0, [-0.75 + i * 0.3, 0.004, -0.75 + j * 0.3]);
    B.add(r, 'Box', { width: 0.44, height: 0.26, depth: 0.3 }, [0.66, 0.48, 0.24], 0, [0.4, 0.14, 0.2]); B.add(r, 'Torus', { diameter: 0.34, thickness: 0.02, tessellation: 14 }, [0.56, 0.4, 0.2], 0, [0.4, 0.3, 0.2], [0, 0, Math.PI / 2]); B.add(r, 'Sphere', { diameter: 0.09, segments: 8 }, COL18.red, 0, [-0.3, 0.05, -0.2]); }
  for (let i = 0; i < 40; i++) { const x = rnd(11.4, 28.2), z = rnd(101.4, 118.2); if (Math.hypot(x - 23.6, z - 111.6) < 1.7 || Math.hypot(x - 19.8, z - 102) < 1.5) continue; const h = rnd(0.18, 0.4); B.add(null, 'Box', { width: 0.012, height: h, depth: 0.012 }, [0.2, 0.5, 0.18], 0, [x, h / 2, z]); sph18(g, x, h, z, 0.05, pick([COL18.red, COL18.yel, COL18.pink, [0.95, 0.95, 0.95], COL18.purple]), 6, 3); }
  { const r = propRoot(25.8, 116.4, -0.5); B.add(r, 'Box', { width: 0.6, height: 0.2, depth: 0.9 }, COL18.red, 0, [0, 0.3, 0]); for (const sx of [-0.32, 0.32]) for (const sz of [-0.32, 0.32]) B.add(r, 'Cylinder', { diameter: 0.2, height: 0.04, tessellation: 12 }, COL18.black, 0, [sx, 0.1, sz], [0, 0, Math.PI / 2]); B.add(r, 'Box', { width: 0.03, height: 0.03, depth: 0.7 }, COL18.black, 0, [0, 0.35, 0.75], [0.6, 0, 0]); for (let i = 0; i < 3; i++) block18(B, 25.8 + rnd(-0.2, 0.2), 116.4 + rnd(-0.3, 0.3)); addSolid(25.3, 115.9, 26.3, 116.9, 'prop'); }
}
const i6 = s => s < 0 ? 5 : 0;
function furnishBed18(B) {
  // the bed against the south wall, the drawing taped above it
  { const r = atWall5({ x: 34, y: 29, d: 1 }, 0, 0), c = [0.3, 0.5, 0.86];
    B.add(r, 'Box', { width: 1.1, height: 0.9, depth: 0.06 }, COL18.wood2, 0, [0, 0.45, 0.03]); B.add(r, 'Box', { width: 1.1, height: 0.3, depth: 1.9 }, COL18.wood2, 0, [0, 0.2, 1.0]); B.add(r, 'Box', { width: 1.0, height: 0.14, depth: 1.8 }, [0.95, 0.95, 0.92], 0, [0, 0.42, 1.0]);
    B.add(r, 'Box', { width: 1.04, height: 0.06, depth: 1.3 }, c, 0, [0, 0.51, 1.25]); for (let i = 0; i < 6; i++) B.add(r, 'Box', { width: 0.18, height: 0.012, depth: 0.18 }, COL18.yel, 0.05, [-0.3 + (i % 3) * 0.3, 0.545, 0.9 + ((i / 3) | 0) * 0.5]);
    B.add(r, 'Box', { width: 0.6, height: 0.12, depth: 0.34 }, [0.97, 0.97, 0.95], 0, [0, 0.55, 0.28]); B.add(r, 'Box', { width: 1.1, height: 0.5, depth: 0.05 }, COL18.wood2, 0, [0, 0.35, 1.97]);
    teddy3d18(B, propRoot(...(p => [p.x, p.z])(localPt(r, 0.3, 0, 0.35)), Math.PI), 0.55);
    solidLocal(r, -0.58, 0, 0.58, 2.0); W18.bedWall = r; }
  // the closet (west wall) - its door is only held shut by a chair that isn't there any more
  { const r = atWall5({ x: 33, y: 29, d: 2 }, 0, 0.004);
    B.add(r, 'Box', { width: DOORW + 0.1, height: DOORH + 0.05, depth: 0.01 }, [0.01, 0.01, 0.012], 0, [0, (DOORH + 0.05) / 2, 0.005]);
    for (const sx of [-1, 1]) B.add(r, 'Box', { width: 0.08, height: DOORH + 0.08, depth: 0.03 }, COL18.white, 0, [sx * (DOORW / 2 + 0.04), (DOORH + 0.08) / 2, 0.015]); B.add(r, 'Box', { width: DOORW + 0.16, height: 0.08, depth: 0.03 }, COL18.white, 0, [0, DOORH + 0.04, 0.015]);
    const p = localPt(r, -DOORW / 2 + 0.03, 0, 0.03), hinge = tnode(null, p.x, 0, p.z); hinge.rotation.y = r.rotation.y;
    const leaf = doorLeaf([0.95, 0.94, 0.9], false); leaf.parent = hinge; leaf.position.z = 0;
    W18.closet = { hinge, ry: r.rotation.y, open: 0, want: 0, x: localPt(r, 0, 0, 0.6).x, z: localPt(r, 0, 0, 0.6).z, inside: localPt(r, 0, 0, -0.35) }; }
  placeF18(B, { x: 35, y: 29, d: 0, c: cIdx(35, 29) }, 0.3, 'toychest', { hw: 0.46 });
  placeF18(B, { x: 33, y: 27, d: 3, c: cIdx(33, 27) }, 0, 'dresser', { hw: 0.46 });
  { const r = atWall5({ x: 35, y: 28, d: 0 }, 0, 0);    // the window: a moon that has been full for years
    B.add(r, 'Box', { width: 1.3, height: 1.2, depth: 0.06 }, COL18.white, 0, [0, 1.5, 0.03]);
    const S = paperPlane18('bwin18', 1.18, 1.08, 256, 234, r, [0, 1.5, 0.065], 1.3, (c, w, h) => { c.fillStyle = '#16244a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,0.7)'; c.fillRect(Math.random() * w, Math.random() * h * 0.7, 2, 2); } c.fillStyle = '#f2f0d8'; c.beginPath(); c.arc(w * 0.66, h * 0.3, 28, 0, TAU); c.fill(); c.fillStyle = '#0d1630'; c.fillRect(0, h * 0.78, w, h); c.fillStyle = '#ffffff'; c.fillRect(w / 2 - 3, 0, 6, h); c.fillRect(0, h / 2 - 3, w, 6); });
    W18.winMats.push(S.mat);
    for (const sx of [-1, 1]) B.add(r, 'Box', { width: 0.34, height: 1.5, depth: 0.04 }, [0.36, 0.5, 0.82], 0, [sx * 0.72, 1.45, 0.12]); }
  { const n = LV.nightBed, r = propRoot(n.x, n.z - 0.1, Math.PI); W18.BOn.add(r, 'Sphere', { diameter: 0.16, segments: 8 }, [1, 0.72, 0.4], 0.9, [0, 0.3, 0], null, [1, 0.7, 1]); B.add(r, 'Box', { width: 0.1, height: 0.12, depth: 0.04 }, COL18.white, 0, [0, 0.25, 0.04]); W18.nightL.push({ x: n.x, y: 0.3, z: n.z }); }
  rug18(B, 124.2, 101.6, 1.1);
  { const r = propRoot(120.6, 99.6, 0.6); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.05, height: 0.08, depth: 1.0 }, COL18.red, 0, [s * 0.2, 0.08, 0], null); B.add(r, 'Box', { width: 0.34, height: 0.3, depth: 0.7 }, [0.9, 0.9, 0.88], 0, [0, 0.45, 0]); B.add(r, 'Box', { width: 0.24, height: 0.34, depth: 0.28 }, [0.9, 0.9, 0.88], 0, [0, 0.7, 0.4], [-0.5, 0, 0]); B.add(r, 'Box', { width: 0.06, height: 0.3, depth: 0.2 }, COL18.brown, 0, [0, 0.72, 0.3]); addSolid(120.1, 99.1, 121.1, 100.1, 'prop'); }   // rocking horse
  for (let i = 0; i < 7; i++) block18(B, rnd(122, 127), rnd(99.5, 104), 0.14);
  artOn18(atWall5({ x: 34, y: 27, d: 3 }, 0, 0), 0, 1.6, 0.5, 13);
}
function furnishKit18(B) {
  const fr = placeF18(B, { x: 33, y: 9, d: 2, c: cIdx(33, 9) }, 0, 'fridge', { hw: 0.38 }); W18.fridge = fr;
  for (let i = 0; i < 7; i++) B.add(fr, 'Box', { width: 0.05, height: 0.05, depth: 0.02 }, pick(KIDC18), 0.05, [rnd(-0.3, 0.3), rnd(0.8, 1.6), 0.69]);
  artOn18(fr, 0.18, 0.95, 0.24, 1, 0.685);
  placeF18(B, { x: 33, y: 8, d: 3, c: cIdx(33, 8) }, -1.6, 'counter', { hw: 1.1 });
  { const x = 122.2, z = 35.6, r = propRoot(x, z, 0.1); B.add(r, 'Box', { width: 1.2, height: 0.04, depth: 0.8 }, [0.9, 0.86, 0.72], 0, [0, 0.74, 0]); for (const sx of [-0.55, 0.55]) for (const sz of [-0.35, 0.35]) B.add(r, 'Box', { width: 0.04, height: 0.72, depth: 0.04 }, COL18.steel, 0, [sx, 0.36, sz]);
    B.add(r, 'Cylinder', { diameter: 0.2, height: 0.02, tessellation: 12 }, [0.95, 0.95, 0.95], 0, [0.2, 0.77, 0.1]); B.add(r, 'Cylinder', { diameter: 0.08, height: 0.1, tessellation: 10 }, COL18.yel, 0, [-0.2, 0.81, -0.1]);
    for (const [sx, sz, a] of [[-0.35, -0.6, 0], [0.35, -0.6, 0], [0, 0.62, Math.PI]]) { const q = propRoot(x + sx, z + sz, a + 0.1); B.add(q, 'Box', { width: 0.42, height: 0.04, depth: 0.42 }, [0.6, 0.34, 0.16], 0, [0, 0.45, 0]); B.add(q, 'Box', { width: 0.42, height: 0.5, depth: 0.04 }, [0.6, 0.34, 0.16], 0, [0, 0.72, -0.2]); for (const lx of [-0.18, 0.18]) for (const lz of [-0.18, 0.18]) B.add(q, 'Box', { width: 0.03, height: 0.45, depth: 0.03 }, COL18.steel, 0, [lx, 0.22, lz]); }
    addSolid(x - 0.65, z - 0.45, x + 0.65, z + 0.45, 'prop'); }
  { const q = propRoot(119.8, 37.8, 0.9); B.add(q, 'Box', { width: 0.4, height: 0.04, depth: 0.4 }, COL18.white, 0, [0, 0.72, 0]); for (const lx of [-0.18, 0.18]) for (const lz of [-0.18, 0.18]) B.add(q, 'Box', { width: 0.03, height: 0.74, depth: 0.03 }, COL18.white, 0, [lx, 0.36, lz], [lz * 0.5, 0, -lx * 0.5]); B.add(q, 'Box', { width: 0.5, height: 0.03, depth: 0.3 }, COL18.yel, 0, [0, 0.95, 0.25]); addSolid(119.5, 37.5, 120.1, 38.1, 'prop'); }
  { const r = atWall5({ x: 33, y: 10, d: 1 }, 0.4, 0); B.add(r, 'Box', { width: 1.2, height: 1.0, depth: 0.06 }, COL18.white, 0, [0, 1.55, 0.03]);
    const S = paperPlane18('kwin18', 1.08, 0.88, 256, 208, r, [0, 1.55, 0.065], 1.8, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8cc6ee'); g.addColorStop(1, '#e8f4fa'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#5eaa45'; c.fillRect(0, h * 0.7, w, h); c.fillStyle = '#b8482c'; c.fillRect(w * 0.6, h * 0.45, w * 0.3, h * 0.3); c.fillStyle = '#ffffff'; c.fillRect(w / 2 - 3, 0, 6, h); c.fillRect(0, h / 2 - 3, w, 6); });
    W18.winMats.push(S.mat);
    const r2 = atWall5({ x: 34, y: 10, d: 1 }, 0, 0); B.add(r2, 'Box', { width: 0.14, height: 0.24, depth: 0.08 }, [0.9, 0.9, 0.84], 0, [0.8, 1.45, 0.04]); B.add(r2, 'Box', { width: 0.05, height: 0.2, depth: 0.05 }, [0.9, 0.9, 0.84], 0, [0.8, 1.45, 0.1]);
    artOn18(r2, -0.4, 1.6, 0.5, 2); }
}
function furnishVoid18(B) {
  // fragments that came loose from somebody's memory, floating in the dark
  { const r = propRoot(cellCenter(33), cellCenter(18), 0.4); if (!B.mdl('sdesk', r, null, null, 1)) { B.add(r, 'Box', { width: 0.7, height: 0.04, depth: 0.5 }, COL18.wood2, 0, [0, 0.68, 0]); B.add(r, 'Box', { width: 0.66, height: 0.02, depth: 0.46 }, COL18.steel, 0, [0, 0.48, 0]); for (const sx of [-0.3, 0.3]) for (const sz of [-0.2, 0.2]) B.add(r, 'Box', { width: 0.03, height: 0.68, depth: 0.03 }, COL18.steel, 0, [sx, 0.34, sz]); } kidChair18(B, propRoot(cellCenter(33) + 0.2, cellCenter(18) + 0.6, 3.5), COL18.orange); addSolid(cellCenter(33) - 0.4, cellCenter(18) - 0.4, cellCenter(33) + 0.4, cellCenter(18) + 0.4, 'prop'); }
  trike18(B, cellCenter(36) - 0.8, cellCenter(14), 1.0, COL18.red);
  { const x = cellCenter(36), z = cellCenter(21), r = propRoot(x, z, 0); for (const s of [-0.3, 0.3]) B.add(r, 'Box', { width: 0.015, height: 4.4, depth: 0.015 }, [0.6, 0.55, 0.45], 0, [s, 2.8, 0]); B.add(r, 'Box', { width: 0.7, height: 0.04, depth: 0.25 }, COL18.red, 0, [0, 0.58, 0]); W18.swing = { r, x, z }; }
  { const x = cellCenter(36), z = cellCenter(24), r = propRoot(x, z, 0.2); for (const sx of [-1, 1]) B.add(r, 'Box', { width: 0.1, height: DOORH + 0.1, depth: 0.12 }, COL18.white, 0, [sx * (DOORW / 2 + 0.05), (DOORH + 0.1) / 2, 0]); B.add(r, 'Box', { width: DOORW + 0.3, height: 0.1, depth: 0.12 }, COL18.white, 0, [0, DOORH + 0.1, 0]); plateOn18(r, 0, DOORH + 0.35, 'LITTLE STARS', 0.6, 0.15, 0.07); for (const sx of [-1, 1]) solidLocal(r, sx * (DOORW / 2) - 0.08, -0.08, sx * (DOORW / 2) + 0.08, 0.08); }
  for (let i = 0; i < 5; i++) balloon3d18(W18.ballG, cellCenter(36) + rnd(-1, 1), cellCenter(11) + rnd(-1, 1), rnd(2.4, 3.6), pick(KIDC18));
  { const x = cellCenter(5), z = cellCenter(23), r = propRoot(x, z, 0.3); B.add(r, 'Box', { width: 0.5, height: 0.35, depth: 0.8 }, [0.3, 0.36, 0.6], 0, [0, 0.55, 0]); B.add(r, 'Sphere', { diameter: 0.6, segments: 10, slice: 0.5 }, [0.3, 0.36, 0.6], 0, [0, 0.72, -0.3], [-1.2, 0, 0]); for (const sx of [-0.22, 0.22]) for (const sz of [-0.3, 0.3]) B.add(r, 'Cylinder', { diameter: 0.18, height: 0.03, tessellation: 12 }, COL18.black, 0, [sx, 0.09, sz], [0, 0, Math.PI / 2]); B.add(r, 'Box', { width: 0.03, height: 0.5, depth: 0.03 }, COL18.steel, 0, [0, 0.9, 0.5], [0.4, 0, 0]); addSolid(x - 0.35, z - 0.45, x + 0.35, z + 0.45, 'prop'); }
  { const x = cellCenter(5), z = cellCenter(26); B.add(null, 'Box', { width: 0.012, height: 1.6, depth: 0.012 }, [0.7, 0.7, 0.7], 0, [x, 4.2, z]); const r = tnode(null, x, 3.3, z); W18.mobile = r; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; part('Box', { width: 0.005, height: 0.3, depth: 0.005 }, r, W18.propMat, [0.8, 0.8, 0.8], 0, [Math.cos(a) * 0.35, -0.15, Math.sin(a) * 0.35]); part('Sphere', { diameter: 0.12, segments: 6 }, r, W18.propMat, KIDC18[i], 0.1, [Math.cos(a) * 0.35, -0.34, Math.sin(a) * 0.35]); } part('Box', { width: 0.74, height: 0.01, depth: 0.02 }, r, W18.propMat, [0.8, 0.8, 0.8], 0, [0, 0, 0]); }
  for (const r of LV.voids) for (const c of r.cells) if (RNG() < 0.35) { const x = cellCenter(c % N) + rnd(-1, 1), z = cellCenter((c / N) | 0) + rnd(-1, 1); B.add(null, 'Box', { width: 0.3, height: 0.003, depth: 0.22 }, [0.8, 0.78, 0.72], 0, [x, 0.003, z], [0, rnd(0, TAU), 0]); B.add(null, 'Box', { width: rnd(0.05, 0.14), height: 0.004, depth: 0.012 }, pick(KIDC18), 0.05, [x, 0.005, z], [0, rnd(0, TAU), 0]); }
}

// ================= assembly =================
function buildProps18() {
  const mat = actMat('props18', { spec: 0.3, shin: 24, wrinkle: 0.05, emis: 1, wrap: 0.45, mottle: 0.12 }), B = new PropBatch(mat); B.fast = true;
  W9.propMat = mat; W18.propMat = mat;
  const lensOn = actMat('lensOn18', { emis: 1 }), lensFl = actMat('lensFl18', { emis: 1 });
  setEmi(lensOn, 3.6); W18.lensFl = lensFl;
  const BOn = new PropBatch(lensOn), BFl = new PropBatch(lensFl); BOn.fast = BFl.fast = true;
  Object.assign(W18, { B, BOn, BFl, ballG: new Geo(true) });
  for (const p of LV.panels) troffer18(p);
  for (const b of LV.bulbs) bulb18(b);
  for (const e of LV.ek.values()) if (e.kind === 'deco') decoDoor18(B, e);
  furnishHall18(B); furnishClass18(B); furnishNap18(B); furnishYel18(B); furnishPlay18(B); furnishSlides18(B);
  furnishMead18(B); furnishBed18(B); furnishKit18(B); furnishVoid18(B);
  W18.finishProps = () => {
    const keep = [], out = [...(B.finish('props18', keep) || []), ...(BOn.finish('lensOn18', keep) || []), ...(BFl.finish('lensFl18', keep) || [])];
    out.forEach(m => m._sortD = 300);
    new Set(keep).forEach(r => r && r.dispose && r.dispose());
    if (W18.ballG.p.length) { const m = W18.ballG.mesh('balls18', SCN); m.material = mat; m.isPickable = false; m._sortD = 305; }
    for (const [o, n, mt] of [[W18.pl, 'plates18m', W18.plMat], [W18.art, 'art18m', W18.artMat]]) {
      o.dt.update(); o.dt.hasAlpha = false;
      if (o.g.p.length) { const m = o.g.mesh(n, SCN); m.material = mt; m.isPickable = false; m._sortD = 310; }
    }
  };
}
// which cells are bright enough that the Forgotten won't step into them
function brightCells18() {
  const b = new Uint8Array(N * N);
  for (let c = 0; c < N * N; c++) { const z = LV.zone[c]; if (!z) continue; const x = cellCenter(c % N), y = cellCenter((c / N) | 0); b[c] = (z === Z18.CLASS || z === Z18.NAP || baseLight(x, y, 1) * 0.667 > 0.5) ? 1 : 0; }
  W18.bright = b;
}
function buildItems18(diff) {
  const mat = W.itemMat, cells = [];
  for (const r of [LV.cls, LV.nap, LV.play, LV.slide, LV.mead, LV.bed, LV.kit, LV.yel]) cells.push(...shuffle(r.cells.slice()).slice(0, 4));
  for (const r of LV.voids) cells.push(...shuffle(r.cells.slice()).slice(0, 3));
  shuffle(cells); const used = new Set();
  const place = type => {
    for (const c of cells) {
      if (used.has(c)) continue; used.add(c);
      const p = { x: cellCenter(c % N) + rnd(-1.1, 1.1), z: cellCenter((c / N) | 0) + rnd(-1.1, 1.1) }; collide(p, 0.3);
      if (cellOf(p.x) !== c % N || cellOf(p.z) !== ((c / N) | 0)) continue;
      if (p.x > PIT18.x0 - 0.3 && p.x < PIT18.x1 + 0.3 && p.z > PIT18.z0 - 0.3 && p.z < PIT18.z1 + 0.3) continue;
      const root = tnode(null, p.x, 0, p.z); root.rotation.y = rnd(0, TAU); itemModel(type, root, mat);
      const it = { type, x: p.x, z: p.z, root, taken: false }; W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
      return;
    }
  };
  for (let i = 0; i < [6, 5, 3][diff]; i++) place('battery');
  for (let i = 0; i < [10, 7, 3][diff]; i++) place('water');   // r4.4: more almond water the easier it is
}
async function buildWorld18(progress) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0.01, 0.01, 0.015, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 70; CAM.fov = 1.0;
  resetW9(); resetW18();
  progress(0.05, 'REMEMBERING…'); await nextFrame();
  genLayout18(); collectPieces5(side18, opening18); planLights18();
  const T = {};
  progress(0.12, 'PAINTING THE CORRIDOR…'); await nextFrame();
  for (const k of ['skyw', 'yelw', 'teal', 'bedw', 'kitw', 'voidw']) T[k] = TEX18[k](SCN, 512);
  progress(0.24, 'PAINTING THE MURALS…'); await nextFrame();
  for (const k of ['mural', 'meadow']) T[k] = TEX18[k](SCN, 1024);
  progress(0.34, 'LAYING THE CARPET…'); await nextFrame();
  for (const k of ['ktile', 'kcarpet', 'turf', 'gcarpet', 'lino', 'voidf', 'dceil', 'skyc', 'starc']) T[k] = TEX18[k](SCN, 512);
  T.wood = TEX9.wood(SCN, 512);
  progress(0.46, 'TURNING ON THE LIGHTS…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  progress(0.58, 'PUTTING OUT THE TOYS…'); await nextFrame();
  const E = (n, d, t) => envMat9(n, d, t);
  const mats = { skyw: E('skyw18', ['MAT_KWALL'], T.skyw), clsw: E('clsw18', ['MAT_KWALL'], T.bedw), yelw: E('yelw18', ['MAT_KWALL', 'KGLOSS'], T.yelw),
    mural: E('mural18', ['MAT_KWALL'], T.mural), teal: E('teal18', ['MAT_KWALL'], T.teal), meadow: E('meadow18', ['MAT_KWALL'], T.meadow), bedw: E('bedw18', ['MAT_KWALL'], T.bedw),
    kitw: E('kitw18', ['MAT_KWALL'], T.kitw), voidw: E('voidw18', ['MAT_KWALL', 'MAT_KVOID'], T.voidw), trim: E('trim18', ['MAT_CASE'], T.ktile),
    ktile: E('ktile18', ['MAT_KFLOOR', 'KSHEEN'], T.ktile), kcarpet: E('kcarpet18', ['MAT_KFLOOR'], T.kcarpet), turf: E('turf18', ['MAT_KFLOOR'], T.turf), gcarpet: E('gcarpet18', ['MAT_KFLOOR'], T.gcarpet),
    wood: E('wood18', ['MAT_KFLOOR'], T.wood), lino: E('lino18', ['MAT_KFLOOR', 'KSHEEN'], T.lino), voidf: E('voidf18', ['MAT_KFLOOR'], T.voidf),
    dceil: E('dceil18', ['MAT_KCEIL'], T.dceil), skyc: E('skyc18', ['MAT_KCEIL'], T.skyc), starc: E('starc18', ['MAT_KCEIL', 'KSTARS'], T.starc) };
  buildGeometry18(SCN, mats);
  mkPlates18(T); mkArt18(T);
  progress(0.7, 'TAPING UP THE DRAWINGS…'); await nextFrame();
  buildProps18();
  progress(0.82, 'OPENING THE DOORS…'); await nextFrame();
  buildDoors18(); buildStory18(T); buildItems18(G.diff); buildDust(); brightCells18();
  W18.finishProps();
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.92, 'WINDING THE MUSIC BOX…'); await nextFrame();
  await prepLullaby18();
}
