// ---------- Level 18 · Nostalgic Memories: layout (the preschool, the playland, the slide hall, memory rooms hanging in the void), geometry, lights ----------
const Z18 = { VOID: 0, HALL: 1, CLASS: 2, NAP: 3, YEL: 4, PLAY: 5, SLIDE: 6, MEAD: 7, BED: 8, KIT: 9, VWALK: 10 };
const R18Z = { PRE: 0, YEL: 1, PLAY: 2, SLIDE: 3, MEAD: 4, BED: 5, KIT: 6, VE: 7, VW: 8 };
const L18_N = 40, L18_LMR = 640;
const H18 = { [Z18.PLAY]: 4.2, [Z18.SLIDE]: 4.2, [Z18.MEAD]: 3.4, [Z18.BED]: 2.6, [Z18.KIT]: 2.6, [Z18.VWALK]: 5.0 };
const zoneH18 = z => H18[z] ?? CEIL;
const cell18 = (x, z) => cIdx(cellOf(x), cellOf(z));
const zone18 = (x, z) => LV.zone[cell18(x, z)];
const voidZ18 = z => z === Z18.VWALK;
const darkZ18 = z => z === Z18.VWALK || z === Z18.PLAY || z === Z18.SLIDE || z === Z18.BED;
const PIT18 = { x0: 26 * 3.6 + 0.6, z0: 21 * 3.6 + 0.4, x1: 26 * 3.6 + 0.6 + 5.2, z1: 21 * 3.6 + 0.4 + 4.2, gap: 1.3 };   // the ball pit (world metres); opening on its north side
const SLIDES18 = [   // slide hall, against the south wall; each goes somewhere you can't walk to
  { id: 'red', name: 'RED', col: [0.82, 0.16, 0.12], x: 25, to: 'bed', icon: 'bed' },
  { id: 'yellow', name: 'YELLOW', col: [0.95, 0.74, 0.1], x: 27, to: 'pit', icon: 'balls' },
  { id: 'blue', name: 'BLUE', col: [0.16, 0.42, 0.85], x: 29, to: 'mead', icon: 'sun' },
  { id: 'green', name: 'GREEN', col: [0.22, 0.64, 0.28], x: 31, to: 'hall', icon: 'school' },
];
const DOORC18 = [[0.95, 0.74, 0.12], [0.84, 0.2, 0.15], [0.2, 0.46, 0.84], [0.28, 0.66, 0.32]];
const PLATES18 = ['BUTTERFLIES', 'LADYBUGS', 'BUMBLEBEES', 'LITTLE STARS', 'RAINBOWS', 'SUNFLOWERS', 'TEDDY BEARS', 'DUCKLINGS', 'OFFICE', 'STORAGE', 'TOILETS', 'CUBBIES', 'ART ROOM', 'MUSIC'];

function genLayout18() {
  const n = N;
  LV.zone = new Uint8Array(n * n); LV.room = new Int16Array(n * n).fill(-1); LV.reg = new Int8Array(n * n).fill(-1); LV.dark = new Uint8Array(n * n);
  LV.hE = new Uint8Array((n + 1) * n); LV.vE = new Uint8Array(n * (n + 1));
  LV.rooms = []; LV.ek = new Map(); LV.navVer = 0; LV.warps = [];
  const room = (zone, reg, t, o = {}) => { const r = Object.assign({ id: LV.rooms.length, zone, reg, t, cells: [] }, o); LV.rooms.push(r); return r; };
  const put = (r, x, y, zone = r.zone) => { const c = cIdx(x, y); LV.room[c] = r.id; LV.zone[c] = zone; LV.reg[c] = r.reg; r.cells.push(c); };
  const rect = (r, x0, y0, x1, y1, zone) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y, zone); return r; };
  const way = (x, y, d, kind, o = {}) => { const e = Object.assign({ x, y, d, kind }, o); LV.ek.set(eKey(x, y, d), e); return e; };
  // the preschool: one long corridor, the Sunshine Room, the nap room
  LV.hall = rect(room(Z18.HALL, R18Z.PRE, 'hall'), 4, 20, 24, 20);
  LV.cls = rect(room(Z18.CLASS, R18Z.PRE, 'class'), 8, 16, 11, 19); way(9, 20, 3, 'door', { dk: 'class', plate: 'SUNSHINE ROOM', col: 0, from: [9, 20] });
  LV.nap = rect(room(Z18.NAP, R18Z.PRE, 'nap'), 13, 21, 15, 23); way(14, 20, 1, 'door', { dk: 'nap', plate: 'NAP ROOM', col: 2, from: [14, 20] });
  way(4, 20, 2, 'white', { from: [4, 20] });                           // the door you came in by (it is only a painting now)
  // the yellow corridor, down to the slide hall
  LV.yel = rect(room(Z18.YEL, R18Z.YEL, 'yel'), 19, 21, 19, 28); rect(LV.yel, 20, 28, 23, 28);
  way(19, 20, 1, 'arch', { w: 1.9, from: [19, 20] }); way(23, 28, 0, 'arch', { w: 1.9, from: [23, 28] });
  LV.slide = rect(room(Z18.SLIDE, R18Z.SLIDE, 'slide'), 24, 26, 31, 30);
  // the playland
  LV.play = rect(room(Z18.PLAY, R18Z.PLAY, 'play'), 25, 15, 30, 23); way(24, 20, 0, 'arch', { w: 2.6, h: 2.6, from: [24, 20] });
  // memory rooms, and the dark between them
  const VE = room(Z18.VWALK, R18Z.VE, 'void'); rect(VE, 31, 18, 36, 18); rect(VE, 36, 9, 36, 17); rect(VE, 36, 19, 36, 26); rect(VE, 35, 26, 35, 26);
  way(30, 18, 0, 'hole', { from: [30, 18] });
  LV.kit = rect(room(Z18.KIT, R18Z.KIT, 'kit'), 33, 8, 34, 10);
  way(34, 9, 0, 'open'); way(34, 8, 0, 'open'); way(34, 10, 0, 'open');   // the kitchen just... stops, and the dark begins
  rect(VE, 35, 8, 35, 10);
  LV.bed = rect(room(Z18.BED, R18Z.BED, 'bed'), 33, 27, 35, 29); way(35, 27, 3, 'door', { dk: 'bed', col: 1, from: [35, 26] });
  way(33, 29, 2, 'closet', { from: [33, 29] });
  const VW = room(Z18.VWALK, R18Z.VW, 'void'); rect(VW, 5, 21, 5, 27);
  way(5, 20, 1, 'hole', { crack: true, from: [5, 20] });
  LV.mead = rect(room(Z18.MEAD, R18Z.MEAD, 'mead'), 3, 28, 7, 32); way(5, 28, 3, 'door', { dk: 'mead', col: 3, from: [5, 27] });
  LV.voids = [VE, VW];
  for (const r of LV.voids) for (const c of r.cells) LV.dark[c] = 1;
  // fake doors along the preschool corridor and the yellow corridor (nothing behind them but the dark)
  const free = (x, y) => inGrid(x, y) && LV.zone[cIdx(x, y)] === Z18.VOID;
  let pi = 0;
  for (const c of LV.hall.cells) {
    const x = c % n, y = (c / n) | 0;
    for (const d of [3, 1]) {
      if (LV.ek.has(eKey(x, y, d)) || !free(x + DX[d], y + DY[d]) || x < 6 || x === 19 || x === 24) continue;
      if ((x + (d === 1 ? 1 : 0)) % 2) continue;
      way(x, y, d, 'deco', { from: [x, y], col: (x + d) % 4, plate: PLATES18[pi++ % PLATES18.length] });
    }
  }
  for (const c of LV.yel.cells) {
    const x = c % n, y = (c / n) | 0;
    for (const d of [0, 2, 1, 3]) {
      if (LV.ek.has(eKey(x, y, d)) || !free(x + DX[d], y + DY[d]) || RNG() < 0.55) continue;
      way(x, y, d, 'deco', { from: [x, y], col: 0, plate: '', yel: true });
    }
  }
  // resolve every edge
  const rule = (a, b) => {
    const za = a < 0 ? 0 : LV.zone[a], zb = b < 0 ? 0 : LV.zone[b];
    if (!za || !zb) return 1;
    return LV.room[a] >= 0 && LV.room[a] === LV.room[b] ? 0 : 1;
  };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) LV.hE[hI(x, y)] = rule(y > 0 ? cIdx(x, y - 1) : -1, y < n ? cIdx(x, y) : -1);
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) LV.vE[vI(x, y)] = rule(x > 0 ? cIdx(x - 1, y) : -1, x < n ? cIdx(x, y) : -1);
  const EV = { arch: 2, door: 2, hole: 2, open: 0, deco: 1, white: 1, closet: 1 };
  for (const e of LV.ek.values()) setEdge(e.x, e.y, e.d, EV[e.kind]);
  LV.spawn = { x: 4, y: 20 };
}

// ---------- wall pieces ----------
const TRIM18 = { white: [0.9, 0.9, 0.87], yel: [0.72, 0.56, 0.1], play: [0.36, 0.28, 0.5], teal: [0.08, 0.22, 0.23], green: [0.26, 0.46, 0.2], kit: [0.36, 0.22, 0.1], black: [0.02, 0.02, 0.025] };
function side18(x, y) {
  if (!inGrid(x, y)) return null;
  const c = cIdx(x, y), z = LV.zone[c];
  if (z === Z18.VOID) return null;
  const h = zoneH18(z);
  switch (z) {
    case Z18.HALL: return { m: 'skyw', c: [1, 1, 1], h, t: TRIM18.white, tp: 2 };
    case Z18.CLASS: return { m: 'clsw', c: [1.08, 1.04, 0.84], h, t: TRIM18.white, tp: 1 };
    case Z18.NAP: return { m: 'clsw', c: [0.92, 0.86, 1.04], h, t: TRIM18.white, tp: 1 };
    case Z18.YEL: return { m: 'yelw', c: [1, 1, 1], h, t: TRIM18.yel, tp: 3 };
    case Z18.PLAY: return { m: 'mural', c: [0.9, 0.88, 0.9], h, t: TRIM18.play, tp: 2 };
    case Z18.SLIDE: return { m: 'teal', c: [1, 1, 1], h, t: TRIM18.teal, tp: 2 };
    case Z18.MEAD: return { m: 'meadow', c: [1, 1, 1], h, t: TRIM18.green, tp: 2 };
    case Z18.BED: return { m: 'bedw', c: [1, 1, 1], h, t: TRIM18.white, tp: 2 };
    case Z18.KIT: return { m: 'kitw', c: [1, 1, 1], h, t: TRIM18.kit, tp: 2 };
    default: return { m: 'voidw', c: [1, 1, 1], h, t: TRIM18.black, tp: 0 };
  }
}
function opening18(e) {
  if (!e) return null;
  if (e.kind === 'arch') return { w: e.w || 2.0, h: e.h || 2.4, cw: 0.1 };
  if (e.kind === 'door') return { w: DOORW, h: DOORH, cw: 0.09 };
  if (e.kind === 'hole') return { w: e.crack ? 1.15 : 1.5, h: e.crack ? 2.05 : 2.3, cw: 0.0 };
  return null;
}

// ---------- geometry ----------
const MAT18_S = { skyw: [1 / 2.85, 1 / 2.85], clsw: [1 / 2.85, 1 / 2.85], yelw: [1 / 2.4, 1 / 2.85], mural: [1 / 9, 1 / 4.2], teal: [1 / 2.85, 1 / 2.85], meadow: [1 / 7.2, 1 / 3.4],
  bedw: [1 / 2.6, 1 / 2.6], kitw: [1 / 2.6, 1 / 2.6], voidw: [1 / 4, 1 / 5], ktile: 1 / 1.2, kcarpet: 1 / 2.4, turf: 1 / 2, gcarpet: 1 / 2.4, wood: 1 / 2.4, lino: 1 / 1.2, voidf: 1 / 4, dceil: 1 / 1.2, skyc: 1 / 3.6, starc: 1 / 2.6 };
const FLOOR18 = { [Z18.HALL]: 'ktile', [Z18.CLASS]: 'ktile', [Z18.NAP]: 'gcarpet', [Z18.YEL]: 'ktile', [Z18.PLAY]: 'kcarpet', [Z18.SLIDE]: 'gcarpet', [Z18.MEAD]: 'turf', [Z18.BED]: 'wood', [Z18.KIT]: 'lino', [Z18.VWALK]: 'voidf' };
const CEIL18 = { [Z18.HALL]: 'dceil', [Z18.CLASS]: 'dceil', [Z18.NAP]: 'dceil', [Z18.YEL]: 'dceil', [Z18.PLAY]: 'dceil', [Z18.SLIDE]: 'dceil', [Z18.MEAD]: 'skyc', [Z18.BED]: 'starc', [Z18.KIT]: 'dceil' };
function buildGeometry18(scene, mats) {
  const CH = 8, NC = Math.ceil(N / CH), G = {};
  const geo = (m, ci) => { const k = m + ':' + ci; return G[k] || (G[k] = new Geo(true)); };
  const chunkOf = (x, z) => clamp(Math.floor(z / CELL / CH), 0, NC - 1) * NC + clamp(Math.floor(x / CELL / CH), 0, NC - 1);
  const C4 = c => [c[0], c[1], c[2], 1];
  const vq = (g, dir, q, a0, a1, y0, y1, su, sv, col) => {
    if (y1 - y0 < 0.001 || a1 - a0 < 0.001) return;
    if (dir === 0) g.face2(q, y0, a1, [0, 0, -1], [0, 1, 0], a1 - a0, y1 - y0, [1, 0, 0], su, sv, col);
    else if (dir === 2) g.face2(q, y0, a0, [0, 0, 1], [0, 1, 0], a1 - a0, y1 - y0, [-1, 0, 0], su, sv, col);
    else if (dir === 1) g.face2(a0, y0, q, [1, 0, 0], [0, 1, 0], a1 - a0, y1 - y0, [0, 0, 1], su, sv, col);
    else g.face2(a1, y0, q, [-1, 0, 0], [0, 1, 0], a1 - a0, y1 - y0, [0, 0, -1], su, sv, col);
  };
  for (const p of LV.pieces) {
    if (p.k === 'n') continue;
    const ci = chunkOf((p.x0 + p.x1) / 2, (p.z0 + p.z1) / 2), tg = geo('trim', ci), tcol = C4(p.tc);
    for (const [s, sg] of [[p.sa, -1], [p.sb, 1]]) {
      if (!s) continue;
      const top = Math.min(p.y1, s.h), [su, sv] = MAT18_S[s.m], g = geo(s.m, ci);
      if (p.horiz) vq(g, sg < 0 ? 3 : 1, sg < 0 ? p.z0 : p.z1, p.x0, p.x1, p.y0, top, su, sv, C4(s.c));
      else vq(g, sg < 0 ? 2 : 0, sg < 0 ? p.x0 : p.x1, p.z0, p.z1, p.y0, top, su, sv, C4(s.c));
    }
    if (p.k === 'w') {
      const lo = p.horiz ? p.z0 : p.x0, hi = p.horiz ? p.z1 : p.x1;
      if (p.cap0) vq(tg, p.horiz ? 2 : 3, p.a0, lo, hi, 0, p.capH0 ?? p.y1, 1, 1, tcol);
      if (p.cap1) vq(tg, p.horiz ? 0 : 1, p.a1, lo, hi, 0, p.capH1 ?? p.y1, 1, 1, tcol);
    } else tg.face(p.x0, p.y0, p.z0, [1, 0, 0], [0, 0, 1], p.x1 - p.x0, p.z1 - p.z0, [0, -1, 0], 1, false, tcol);
  }
  for (const t of LV.trims) geo('trim', chunkOf((t[0] + t[3]) / 2, (t[2] + t[5]) / 2)).box(t[0], t[1], t[2], t[3], t[4], t[5], 1, 31, C4(t[6]));
  // floors & ceilings (the void has no ceiling: just the dark going up)
  const up = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z1, [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, [0, 1, 0], s, false, col);
  const dn = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z0, [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, -1, 0], s, false, col);
  const FT = { [Z18.CLASS]: [1.02, 1, 0.96], [Z18.YEL]: [1, 0.96, 0.82], [Z18.PLAY]: [0.9, 0.9, 0.95], [Z18.NAP]: [0.8, 0.78, 0.9], [Z18.SLIDE]: [0.62, 0.64, 0.66] };
  const CT = { [Z18.YEL]: [1, 0.95, 0.8], [Z18.PLAY]: [0.62, 0.62, 0.66], [Z18.SLIDE]: [0.5, 0.52, 0.54], [Z18.KIT]: [0.95, 0.9, 0.8], [Z18.NAP]: [0.85, 0.84, 0.9] };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y), z = LV.zone[c]; if (z === Z18.VOID) continue;
    const x0 = x * CELL, z0 = y * CELL, x1 = x0 + CELL, z1 = z0 + CELL, ci = chunkOf(x0 + 1, z0 + 1), fm = FLOOR18[z], cm = CEIL18[z];
    const hv = 0.92 + 0.12 * hash1(x * 31.7 + y * 17.3), ft = FT[z] || [1, 1, 1];
    up(geo(fm, ci), x0, z0, x1, z1, 0, MAT18_S[fm], [ft[0] * (z === Z18.VWALK ? hv : 1), ft[1], ft[2], 1]);
    if (cm) dn(geo(cm, ci), x0, z0, x1, z1, zoneH18(z), MAT18_S[cm], C4(CT[z] || [1, 1, 1]));
  }
  // the ball pit's floor: a sunken tray the balls sit in
  LV.chunkMeshes = [];
  for (const [k, g] of Object.entries(G)) {
    if (!g.p.length) continue; const [m] = k.split(':');
    const mesh = g.mesh('l18_' + k, scene); mesh.material = mats[m];
    if (FLOOR18_SET.has(m)) mesh._sortD = 900; else if (CEIL18_SET.has(m)) mesh._sortD = 950; else LV.chunkMeshes.push(mesh);
  }
}
const FLOOR18_SET = new Set(['ktile', 'kcarpet', 'turf', 'gcarpet', 'wood', 'lino', 'voidf']), CEIL18_SET = new Set(['dceil', 'skyc', 'starc']);

// ---------- lights (baked) ----------
function planLights18() {
  LV.fixtures = []; LV.panels = []; LV.bulbs = [];
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  const panel = (x, z, y, st, o = {}) => { LV.panels.push({ x, z, y, state: st, rot: o.rot || 0, w: o.w || 0.62, l: o.l || 1.22 }); if (st) F(x, z, { state: st, I: o.I ?? 0.5, rad: o.rad ?? 8, sc: o.sc ?? 2.4 }); };
  // preschool corridor: a troffer per cell; the west end is failing
  for (const c of LV.hall.cells) { const x = c % N, y = (c / N) | 0, cx = cellCenter(x), cz = cellCenter(y); const st = x <= 5 ? (x === 4 ? 1 : 0) : RNG() < 0.12 ? 2 : 1; panel(cx, cz, CEIL, st, { rot: 1 }); }
  for (const c of LV.cls.cells) { const x = c % N, y = (c / N) | 0; if ((x + y) % 2 === 0) panel(cellCenter(x), cellCenter(y), CEIL, 1, { I: 0.55, rad: 9, sc: 2.8 }); }
  { const L = LV.cls.cells, c = L[L.length - 1]; F(cellCenter(c % N) - 0.8, cellCenter((c / N) | 0) - 0.8, { I: 0.25, rad: 5, sc: 1.4 }); LV.bulbs.push({ x: cellCenter(c % N) - 0.8, z: cellCenter((c / N) | 0) - 0.8, y: CEIL, kind: 'shade', state: 1 }); }
  { const c = LV.nap.cells[4]; F(cellCenter(c % N), cellCenter((c / N) | 0), { I: 0.14, rad: 6, sc: 1.8 }); LV.nightNap = { x: cellCenter(c % N), z: cellCenter((c / N) | 0) }; }
  // yellow corridor: fluorescent all the way, a few buzzing
  for (const c of LV.yel.cells) { const x = c % N, y = (c / N) | 0; const st = RNG() < 0.22 ? 2 : RNG() < 0.1 ? 0 : 1; panel(cellCenter(x), cellCenter(y), CEIL, st, { rot: x === 19 && y < 28 ? 0 : 1, I: 0.48 }); }
  // playland: most of the lights are out
  for (const c of LV.play.cells) { const x = c % N, y = (c / N) | 0; if ((x + y) % 2) continue; const r = RNG(), st = r < 0.32 ? 1 : r < 0.45 ? 2 : 0; panel(cellCenter(x), cellCenter(y), 4.2, st, { I: 0.62, rad: 11, sc: 3.2 }); }
  // slide hall: two lights, one over the slides
  for (const [x, y, st] of [[25, 27, 1], [28, 27, 2], [30, 27, 0], [26, 29, 1], [30, 29, 1]]) panel(cellCenter(x), cellCenter(y), 4.2, st, { I: 0.55, rad: 10, sc: 3 });
  // meadow: warm "sunlight" from behind the painted sky
  for (const [x, y] of [[4, 29], [6, 31]]) F(cellCenter(x), cellCenter(y), { I: 0.62, rad: 12, sc: 3.6 });
  // bedroom: the night light and the moon through the window
  LV.nightBed = { x: 34 * CELL + 0.3, z: 29 * CELL + 3.2 }; F(LV.nightBed.x, LV.nightBed.z, { I: 0.22, rad: 6, sc: 1.4 });
  F(35 * CELL + 2.6, 28 * CELL + 1.8, { I: 0.16, rad: 6, sc: 2 });
  // kitchen: one pendant
  F(cellCenter(33) + 1.8, cellCenter(9), { I: 0.5, rad: 8, sc: 2.2 }); LV.bulbs.push({ x: cellCenter(33) + 1.8, z: cellCenter(9), y: 2.6, kind: 'pend', state: 1 });
  // the void: a few lonely bulbs hanging from nothing
  for (const [x, y] of [[33, 18], [36, 13], [36, 22], [5, 24]]) { const px = cellCenter(x), pz = cellCenter(y); F(px, pz, { I: 0.18, rad: 5, sc: 1.2, state: 2 }); LV.bulbs.push({ x: px, z: pz, y: 3.2, kind: 'bare', state: 2, cord: 2.0 }); }
  LV.sky = null;
}
