// ---------- r10 · Level 7 · Thalassophobia: layout and lights ----------
// A night ocean. The rig, the ship, the lighthouse, the pier, a seabed habitat and a sunk freighter stand in one great basin; the margins of the grid
// hold the rooms you only reach by ladder (the lamp room, the ship's bridge). Geometry, water and swimming are Level 37's engine; see docs/LEVEL7.md.
const ZS7 = { VOID: 0, SEA: 1, RIG: 2, QUART: 3, GEN: 4, AIR: 5, SHIP: 6, HOLD: 7, ENGINE: 8, SHIPIN: 9, CAPE: 10, TOWER: 11, COTTAGE: 12, LAMP: 13, PIER: 14, SHED: 15, HAB: 16, WRECK: 17, POCKET: 18, BRIDGE: 19 };
const RS7 = { RIG: 0, SHIP: 1, CAPE: 2, PIER: 3, DEEP: 4 };
const L7_N = 64, L7_LMR = 1024;
const BAS7 = { SEA: 0, ENG: 1, HOLD1: 3, HOLD2: 4, HAB: 5, WPOCK: 6 };   // (index 2 is skipped: Level 37's Fish hides when its basin is 2)
const SEA7 = { x0: 8, y0: 8, x1: 59, y1: 59 };
const cc7 = v => cellCenter(v);
const cell7 = (x, z) => cIdx(cellOf(x), cellOf(z));
const TRIM7 = { steel: [0.3, 0.32, 0.33], rust: [0.38, 0.22, 0.14], white: [0.78, 0.8, 0.78], yellow: [0.8, 0.62, 0.1], dark: [0.1, 0.1, 0.11], wood: [0.34, 0.26, 0.18], rock: [0.2, 0.22, 0.24] };
function genLayout7() {
  const n = N;
  LV.zone = new Uint8Array(n * n); LV.room = new Int16Array(n * n).fill(-1); LV.reg = new Int8Array(n * n).fill(-1); LV.dark = new Uint8Array(n * n);
  LV.fh = new Float32Array(n * n); LV.bas = new Int8Array(n * n).fill(-1); LV.ch = new Float32Array(n * n);
  LV.hE = new Uint8Array((n + 1) * n); LV.vE = new Uint8Array(n * (n + 1));
  LV.rooms = []; LV.ek = new Map(); LV.navVer = 0; LV.warps = []; LV.halls = []; LV.pillars = []; LV.darkCenters = [];
  LV.basins = [{ name: 'SEA' }, { name: 'ENG' }, { name: 'X' }, { name: 'HOLD1' }, { name: 'HOLD2' }, { name: 'HAB' }, { name: 'WPOCK' }].map((b, i) => ({ id: i, name: b.name, y: 0, tgt: 0, cells: [] }));
  LV.basins[BAS7.HAB].y = LV.basins[BAS7.HAB].tgt = -4.0; LV.basins[BAS7.WPOCK].y = LV.basins[BAS7.WPOCK].tgt = -4.6;
  const room = (zone, reg, t, o = {}) => { const r = Object.assign({ id: LV.rooms.length, zone, reg, t, cells: [], h: 3.0, fh: 0 }, o); LV.rooms.push(r); return r; };
  const put = (r, x, y, fh = r.fh) => { const c = cIdx(x, y); LV.room[c] = r.id; LV.zone[c] = r.zone; LV.reg[c] = r.reg; LV.fh[c] = fh; LV.ch[c] = r.rel ? fh + r.h : r.h; r.cells.push(c); };
  const rect = (r, x0, y0, x1, y1, fh) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y, fh); return r; };
  const way = (x, y, d, kind, o = {}) => { const e = Object.assign({ x, y, d, kind, from: [x, y] }, o); LV.ek.set(eKey(x, y, d), e); return e; };
  const wet = (r, bas) => { for (const c of r.cells) if (LV.room[c] === r.id) LV.bas[c] = bas; };
  LV.dry = {};
  const S = {
    sea: { m: 'rock', c: [0.7, 0.74, 0.78], t: TRIM7.rock, tp: 0 }, steel: { m: 'hull', c: [0.9, 0.86, 0.8], t: TRIM7.steel, tp: 1 }, quart: { m: 'block', c: [0.78, 0.8, 0.74], t: TRIM7.white, tp: 2 }, mach: { m: 'hull', c: [0.7, 0.72, 0.68], t: TRIM7.yellow, tp: 2 },
    wood: { m: 'wood', c: [0.8, 0.74, 0.66], t: TRIM7.wood, tp: 1 }, rock: { m: 'rock', c: [0.8, 0.84, 0.86], t: TRIM7.rock, tp: 1 }, tower: { m: 'conc', c: [0.9, 0.9, 0.86], t: TRIM7.white, tp: 2, ext: { m: 'band', c: [1, 1, 1] } }, wreck: { m: 'hull', c: [0.38, 0.36, 0.3], t: TRIM7.rust, tp: 2 },
    hab: { m: 'conc', c: [0.55, 0.6, 0.6], t: TRIM7.steel, tp: 2 },
  };
  const F = { plate: { m: 'plate', col: [1, 1, 1] }, plank: { m: 'plank', col: [1, 1, 1] }, sand: { m: 'sand', col: [1, 1, 1] }, conc: { m: 'conc', col: [0.8, 0.8, 0.78] }, rock: { m: 'rock', col: [1.5, 1.5, 1.5] }, lino: { m: 'lino', col: [0.8, 0.78, 0.7] } };
  // ===== the sea: one great room, open to the sky =====
  const SEA = room(ZS7.SEA, RS7.DEEP, 'sea', { open: true, h: 40, side: S.sea, flr: F.sand }); LV.dry.sea = SEA;
  rect(SEA, SEA7.x0, SEA7.y0, SEA7.x1, SEA7.y1, -9);
  // ===== RIG MERIDIAN =====
  const RD = room(ZS7.RIG, RS7.RIG, 'rigdeck', { open: true, rel: true, h: 3.0, side: S.steel, flr: F.plate }); rect(RD, 25, 24, 37, 36, 3.0); LV.dry.rig = RD;
  const Q = (id, x0, y0, x1, y1, o = {}) => { const r = rect(room(ZS7.QUART, RS7.RIG, id, Object.assign({ rel: true, h: 3.0, side: S.quart, flr: F.lino, cm: 'kceil', cc: [0.8, 0.82, 0.78] }, o)), x0, y0, x1, y1, 3.0); LV.dry[id] = r; return r; };
  Q('mess', 25, 24, 26, 25); Q('radio', 27, 24, 28, 25); Q('qcorr', 25, 26, 28, 26); Q('bunks', 25, 27, 28, 27);
  way(25, 25, 1, 'door', { dk: 'rig', plaque: 'MESS' }); way(27, 25, 1, 'door', { dk: 'rig', plaque: 'RADIO' }); way(27, 26, 1, 'door', { dk: 'rig', plaque: 'BUNKS' }); way(28, 26, 0, 'door', { dk: 'rig', plaque: 'QUARTERS', from: [28, 26] });
  const GEN = rect(room(ZS7.GEN, RS7.RIG, 'gen', { rel: true, h: 3.4, side: S.mach, flr: F.plate, cm: 'bconc', cc: [0.5, 0.5, 0.46] }), 34, 24, 37, 26, 3.0); LV.dry.gen = GEN; way(35, 27, 3, 'door', { dk: 'mach', plaque: 'GENERATOR', from: [35, 27] });
  const AIR = rect(room(ZS7.AIR, RS7.RIG, 'air', { rel: true, h: 3.4, side: S.mach, flr: F.plate, cm: 'bconc', cc: [0.5, 0.5, 0.46] }), 34, 34, 37, 36, 3.0); LV.dry.air = AIR; way(35, 33, 1, 'door', { dk: 'mach', plaque: 'AIR HOUSE', from: [35, 33] });
  // ===== AURELIA, aground on a shoal =====
  const SD = room(ZS7.SHIP, RS7.SHIP, 'shipdeck', { open: true, rel: true, h: 3.0, side: S.steel, flr: F.plate }); rect(SD, 9, 38, 20, 42, 2.4); LV.dry.ship = SD;
  const H1 = rect(room(ZS7.HOLD, RS7.SHIP, 'hold1', { open: true, h: 40, side: S.steel, flr: F.sand }), 10, 39, 12, 41, -6); wet(H1, BAS7.HOLD1); LV.dry.hold1 = H1;
  const H2 = rect(room(ZS7.HOLD, RS7.SHIP, 'hold2', { open: true, h: 40, side: S.steel, flr: F.sand }), 14, 39, 16, 41, -6); wet(H2, BAS7.HOLD2); LV.dry.hold2 = H2;
  const G = (id, x0, y0, x1, y1) => { const r = rect(room(ZS7.SHIPIN, RS7.SHIP, id, { rel: true, h: 3.0, side: S.quart, flr: F.lino, cm: 'kceil', cc: [0.7, 0.72, 0.66] }), x0, y0, x1, y1, 2.4); LV.dry[id] = r; return r; };
  G('galley', 18, 38, 19, 40); G('cabins', 18, 41, 19, 42); way(17, 39, 0, 'door', { dk: 'ship', plaque: 'GALLEY', from: [17, 39] }); way(18, 40, 1, 'door', { dk: 'ship', plaque: 'CABINS', from: [18, 40] });
  const EN = rect(room(ZS7.ENGINE, RS7.SHIP, 'engine', { h: 2.6, side: S.mach, flr: F.plate, cm: 'bconc', cc: [0.3, 0.3, 0.28] }), 18, 43, 20, 45, -5); wet(EN, BAS7.ENG); LV.dry.engine = EN; way(19, 42, 1, 'door', { dk: 'ship', plaque: 'ENGINE ROOM', from: [19, 42] });
  const BR = rect(room(ZS7.BRIDGE, RS7.SHIP, 'bridge', { rel: true, h: 3.2, side: S.quart, flr: F.lino, cm: 'kceil', cc: [0.7, 0.72, 0.66] }), 0, 58, 4, 62, 9.0); LV.dry.bridge = BR;
  // ===== CAPE SORREL =====
  const IS = room(ZS7.CAPE, RS7.CAPE, 'islet', { open: true, rel: true, h: 3.0, side: S.rock, flr: F.rock }); rect(IS, 28, 9, 36, 14, 1.8); LV.dry.islet = IS;
  const TW = rect(room(ZS7.TOWER, RS7.CAPE, 'tower', { rel: true, h: 22, side: S.tower, flr: F.conc, cm: 'bconc', cc: [0.6, 0.6, 0.58] }), 30, 10, 32, 12, 1.8); LV.dry.tower = TW; way(31, 13, 3, 'door', { dk: 'tower', plaque: 'CAPE SORREL LIGHT', from: [31, 13] });
  const CT = rect(room(ZS7.COTTAGE, RS7.CAPE, 'cottage', { rel: true, h: 2.8, side: S.quart, flr: F.lino, cm: 'plaster', cc: [0.7, 0.66, 0.58] }), 34, 10, 35, 12, 1.8); LV.dry.cottage = CT; way(34, 13, 3, 'door', { dk: 'cottage', plaque: 'KEEPER', from: [34, 13] });
  const LP = rect(room(ZS7.LAMP, RS7.CAPE, 'lamp', { rel: true, h: 4.6, side: S.tower, flr: F.conc, cm: 'bconc', cc: [0.5, 0.5, 0.48] }), 0, 0, 5, 5, 16.0); LV.dry.lamp = LP;
  // ===== the pier =====
  const PR = room(ZS7.PIER, RS7.PIER, 'pier', { open: true, rel: true, h: 3.0, side: S.wood, flr: F.plank }); rect(PR, 44, 30, 53, 31, 1.4); rect(PR, 53, 28, 55, 33, 1.4); LV.dry.pier = PR;
  const SH = rect(room(ZS7.SHED, RS7.PIER, 'shed', { rel: true, h: 3.0, side: S.wood, flr: F.plank, cm: 'plaster', cc: [0.5, 0.46, 0.4] }), 49, 32, 51, 33, 1.4); LV.dry.shed = SH; way(50, 31, 1, 'door', { dk: 'shed', plaque: 'BOATHOUSE', from: [50, 31] });
  // ===== HABITAT ORCA-2: a dry platform in an air pocket on the seabed =====
  const HB = rect(room(ZS7.HAB, RS7.DEEP, 'hab', { h: -2.0, side: S.hab, flr: F.conc, cm: 'bconc', cc: [0.45, 0.5, 0.5] }), 30, 44, 36, 48, -9); wet(HB, BAS7.HAB);
  LV.fh[cIdx(33, 46)] = -3.9; LV.bas[cIdx(33, 46)] = -1; LV.fh[cIdx(32, 46)] = -3.9; LV.bas[cIdx(32, 46)] = -1; LV.fh[cIdx(34, 46)] = -3.9; LV.bas[cIdx(34, 46)] = -1; LV.dry.hab = HB;
  way(33, 48, 1, 'open', { breach: true }); way(36, 46, 0, 'open', { breach: true });
  // ===== HALCYON, ten metres down =====
  const WB = rect(room(ZS7.WRECK, RS7.DEEP, 'wbridge', { h: -3.2, side: S.wreck, flr: F.sand, cm: 'bconc', cc: [0.3, 0.28, 0.24] }), 12, 51, 14, 53, -9.5); LV.dry.wbridge = WB;
  const WH = rect(room(ZS7.WRECK, RS7.DEEP, 'whold', { h: -3.2, side: S.wreck, flr: F.sand, cm: 'bconc', cc: [0.3, 0.28, 0.24] }), 16, 50, 21, 54, -9.5); LV.dry.whold = WH;
  const WC = rect(room(ZS7.WRECK, RS7.DEEP, 'wcorr', { h: -3.2, side: S.wreck, flr: F.sand, cm: 'bconc', cc: [0.3, 0.28, 0.24] }), 15, 52, 15, 52, -9.5);
  const WP = rect(room(ZS7.POCKET, RS7.DEEP, 'wpocket', { h: -3.2, side: S.wreck, flr: F.sand, cm: 'bconc', cc: [0.3, 0.28, 0.24] }), 12, 54, 13, 55, -9.5); wet(WP, BAS7.WPOCK); LV.dry.wpocket = WP;
  for (const r of [WB, WH, WC]) wet(r, BAS7.SEA);
  way(14, 52, 0, 'open'); way(15, 52, 0, 'open'); way(12, 53, 1, 'open'); way(13, 53, 1, 'open');
  way(13, 51, 3, 'open', { breach: true }); way(21, 52, 0, 'open', { breach: true });
  // ===== sea floor: shoals round the ship and the islet, a slope off every platform, the trench =====
  const solid = new Set(); const src = [];
  for (const r of LV.rooms) if (r.fh > -0.5 && r.zone !== ZS7.SEA && r.zone !== ZS7.LAMP && r.zone !== ZS7.BRIDGE) for (const c of r.cells) if (LV.room[c] === r.id) { solid.add(c); src.push(c); }
  const dist = new Int16Array(n * n).fill(-1); const q = src.slice(); for (const c of q) dist[c] = 0;
  for (let qi = 0; qi < q.length; qi++) { const c = q[qi], x = c % n, y = (c / n) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (!inGrid(nx, ny)) continue; const m = cIdx(nx, ny); if (dist[m] >= 0) continue; dist[m] = dist[c] + 1; q.push(m); } }
  for (let y = SEA7.y0; y <= SEA7.y1; y++) for (let x = SEA7.x0; x <= SEA7.x1; x++) {
    const c = cIdx(x, y); if (LV.room[c] !== SEA.id) continue;
    const d = dist[c], nearShip = Math.hypot(x - 14.5, y - 40) < 11.5, nearCape = Math.hypot(x - 32, y - 11.5) < 7.5, nearPier = x >= 43 && x <= 57 && y >= 27 && y <= 34;
    let fh = -(1.4 + d * 0.62); if ((nearShip || nearCape || nearPier) && d < 5) fh = -(0.9 + d * 0.3);
    fh = Math.max(-9, fh);
    if (x >= 38 && x <= 48 && y >= 42 && y <= 58) { const e = Math.min(x - 38, 48 - x, y - 42, 58 - y); fh = e >= 3 ? -26 : e === 2 ? -18 : e === 1 ? -13 : Math.min(fh, -10); }
    LV.fh[c] = fh; LV.bas[c] = BAS7.SEA;
  }
  for (const r of [H1, H2, EN]) for (const c of r.cells) if (LV.room[c] === r.id && LV.bas[c] < 0) LV.bas[c] = LV.bas[r.cells[0]];
  // open edges along every platform that meets the sea or a pit: you can walk off the edge and fall in
  const link = (r, targets) => { for (const c of r.cells) { if (LV.room[c] !== r.id) continue; const x = c % n, y = (c / n) | 0; for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (!inGrid(nx, ny)) continue; const m = cIdx(nx, ny), mr = LV.room[m]; if (mr < 0 || mr === r.id) continue; if (targets.has(LV.rooms[mr].t) && !LV.ek.has(eKey(x, y, d))) way(x, y, d, 'open'); } } };
  const wetRooms = new Set(['sea', 'hold1', 'hold2']);
  for (const r of [RD, SD, IS, PR]) link(r, wetRooms);
  for (const r of [H1, H2]) link(r, new Set(['shipdeck']));
  // ---- resolve every edge: a wall between two different rooms, nothing inside a room ----
  const rule = (a, b) => { const za = a < 0 ? 0 : LV.zone[a], zb = b < 0 ? 0 : LV.zone[b]; if (!za || !zb) return 1; return LV.room[a] >= 0 && LV.room[a] === LV.room[b] ? 0 : 1; };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) LV.hE[hI(x, y)] = rule(y > 0 ? cIdx(x, y - 1) : -1, y < n ? cIdx(x, y) : -1);
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) LV.vE[vI(x, y)] = rule(x > 0 ? cIdx(x - 1, y) : -1, x < n ? cIdx(x, y) : -1);
  const EV = { arch: 2, door: 2, open: 0 };
  for (const e of LV.ek.values()) setEdge(e.x, e.y, e.d, EV[e.kind] ?? 2);
  SEA.cells = SEA.cells.filter(c => LV.room[c] === SEA.id);
  for (let c = 0; c < n * n; c++) if (LV.bas[c] >= 0) LV.basins[LV.bas[c]].cells.push(c);
  LV.spawn = { x: 30, y: 39 };
}

// ---------- wall pieces: an open-air room's face of a wall that closes a building is as tall as the building ----------
function side7(x, y) {
  if (!inGrid(x, y)) return null;
  const c = cIdx(x, y), z = LV.zone[c]; if (z === ZS7.VOID) return null;
  const r = LV.rooms[LV.room[c]], s = r.side;
  return { m: s.m, c: s.c, t: s.t, tp: s.tp, h: LV.ch[c], fh: LV.fh[c], open: !!r.open, ext: s.ext };
}
function fixPieces7() {
  for (const p of LV.pieces) {
    const a = p.sa, b = p.sb; if (!a || !b) { if ((a || b) && (a || b).open && (a || b).h > 20) { p.sa = p.sb = null; } continue; }
    if (a.open && !b.open) p.sa = Object.assign({}, a, { h: b.h, m: (b.ext || b).m, c: (b.ext || b).c.map(v => v * 2.4) });
    else if (b.open && !a.open) p.sb = Object.assign({}, b, { h: a.h, m: (a.ext || a).m, c: (a.ext || a).c.map(v => v * 2.4) });
  }
}
// the roofs of submerged rooms (a habitat, a wreck) face up too, so they read from the surface
function capRoofs7(scene, mat) {
  const g = new Geo(true); let k = 0;
  for (let c = 0; c < N * N; c++) { const r = LV.rooms[LV.room[c]]; if (!r || r.open || !(LV.ch[c] < 0.5)) continue; const x0 = (c % N) * CELL, z0 = ((c / N) | 0) * CELL; g.face(x0, LV.ch[c] + 0.01, z0 + CELL, [1, 0, 0], [0, 0, -1], CELL, CELL, [0, 1, 0], 1 / 2.4, false, [0.34, 0.36, 0.36, 1]); k++; }
  if (!k) return; const m = g.mesh('roofs7', scene); m.material = mat; m._sortD = 800; m.isPickable = false;
}

// ---------- lights ----------
function planLights7() {
  LV.fixtures = []; LV.panels = []; LV.bulbs = [];
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  const lamp = (x, z, o = {}) => { const st = o.state ?? 1; F(x, z, { I: o.I ?? 0.7, rad: o.rad ?? 11, sc: o.sc ?? 3.4, state: st }); LV.bulbs.push({ x, z, y: o.y ?? 5.4, kind: o.kind || 'flood', state: st }); };
  // the rig: floodlights on the deck corners and the derrick, bulbs inside
  for (const [x, y] of [[25.5, 30.5], [36.5, 30.5], [30.5, 25], [30.5, 35.8], [27, 34], [34, 28]]) lamp(cc7(Math.floor(x)) + (x % 1 - 0.5) * 3.6, cc7(Math.floor(y)) + (y % 1 - 0.5) * 3.6, { y: 7.2, I: 0.78, rad: 13, sc: 4.2 });
  for (const k of ['mess', 'radio', 'qcorr', 'bunks', 'gen', 'air']) { const r = LV.dry[k]; r.cells.forEach((c, i) => { if (i % 2 === 0) lamp(cc7(c % N), cc7((c / N) | 0), { y: LV.ch[c] - 0.3, I: 0.42, rad: 7, sc: 2.4, kind: 'bulb', state: RNG() < 0.1 ? 2 : 1 }); }); }
  // the ship: a masthead lamp, galley bulbs
  lamp(cc7(10), cc7(40), { y: 8, I: 0.5, rad: 12, sc: 4 }); lamp(cc7(14), cc7(38), { y: 5, I: 0.35, rad: 9, sc: 3, state: 2 });
  for (const k of ['galley', 'cabins']) LV.dry[k].cells.forEach((c, i) => { if (i % 2 === 0) lamp(cc7(c % N), cc7((c / N) | 0), { y: LV.ch[c] - 0.3, I: 0.38, rad: 6, sc: 2.2, kind: 'bulb', state: RNG() < 0.2 ? 2 : 1 }); });
  lamp(cc7(19), cc7(44), { y: 1.6, I: 0.3, rad: 6, sc: 2, kind: 'bulb', state: 2 });
  for (const c of LV.dry.bridge.cells) if ((c % N + ((c / N) | 0)) % 3 === 0) lamp(cc7(c % N), cc7((c / N) | 0), { y: LV.ch[c] - 0.3, I: 0.4, rad: 7, sc: 2.4, kind: 'bulb' });
  // the cape: the dark lamp, a cottage window, the tower's stair
  lamp(cc7(31), cc7(12) + 2, { y: 4, I: 0.5, rad: 10, sc: 3.4 }); lamp(cc7(34) + 1.8, cc7(11), { y: 2.3, I: 0.55, rad: 6, sc: 2.4, kind: 'bulb' });
  LV.dry.tower.cells.forEach((c, i) => { if (i === 4) lamp(cc7(c % N), cc7((c / N) | 0), { y: 5, I: 0.4, rad: 6, sc: 2.4, kind: 'bulb' }); });
  LV.dry.lamp.cells.forEach((c, i) => { if ((c % N + ((c / N) | 0)) % 2 === 0) lamp(cc7(c % N), cc7((c / N) | 0), { y: LV.ch[c] - 0.3, I: 0.34, rad: 8, sc: 3, kind: 'bulb' }); });
  // the pier: lamps on posts and the boathouse
  for (const x of [45, 48, 52]) lamp(cc7(x), cc7(30), { y: 3.6, I: 0.5, rad: 9, sc: 3 }); lamp(cc7(54), cc7(30), { y: 3.6, I: 0.5, rad: 9, sc: 3 }); lamp(cc7(50), cc7(32), { y: 2.6, I: 0.4, rad: 6, sc: 2.2, kind: 'bulb' });
  // the habitat's pocket and the wreck's: green and cold
  lamp(cc7(33), cc7(46), { y: -2.6, I: 0.6, rad: 7, sc: 2.6, kind: 'bulb' }); lamp(cc7(12) + 1.8, cc7(54) + 1.8, { y: -3.7, I: 0.34, rad: 5, sc: 2, kind: 'bulb', state: 2 });
  // moonlight: open-air rooms see the sky (the lightmap's alpha channel)
  LV.sky = new Float32Array(LMR * LMR);
  for (let j = 0; j < LMR; j++) for (let i = 0; i < LMR; i++) { const x = (i + 0.5) * LMS, z = (j + 0.5) * LMS, c = cIdx(cellOf(x), cellOf(z)), r = LV.rooms[LV.room[c]]; LV.sky[j * LMR + i] = r && r.open ? 1 : 0; }
}
