// ---------- LEVEL 9 · THE DARKENED SUBURBS: layout, rooms, geometry, light-map inputs ----------
const ZN = { VOID: 0, STREET: 1, LAWN: 2, DRIVE: 3, HOUSE: 4, YARD: 5, BASE: 6, LAB: 7, VERGE: 8 };
const L9_N = 56, L9_LMR = 832, L9_NB = 46, L9_BLK = [3, 17, 31], L9_ST = new Set([1, 2, 15, 16, 29, 30, 43, 44]);
const LAB_X = 47;             // lab (the "basement") is a sealed block east of the neighbourhood
const BX = 18;                // M.E.G. compound origin (9x9 cells inside the centre block)
const HS = 4, FLH = 3.05;     // house footprint (cells) and storey height; upstairs floors are built off-map and reached by the stairs
const indoorZ = z => z === ZN.HOUSE || z === ZN.BASE || z === ZN.LAB;
const zoneXZ = (x, z) => LV.zone[cIdx(cellOf(x), cellOf(z))];
const eKey = (x, y, d) => d === 0 ? 'v' + vI(x + 1, y) : d === 1 ? 'h' + hI(x, y + 1) : d === 2 ? 'v' + vI(x, y) : 'h' + hI(x, y);
// two-storey floor plans, rows listed front (b=0) to back; s = stair cell, dir = climbing direction, side = wall the stair hugs (local a,b)
const PLANS2 = [
  { g: ['LFOO', 'LFKK', 'LDKK', 'DDBK'], u: ['RHPP', 'RHPP', 'RHHQ', 'BBQQ'], s: [1, 1], dir: [0, 1], side: [-1, 0] },
  { g: ['LHDD', 'LHHK', 'LLKK', 'OOBK'], u: ['RRPP', 'RHHH', 'BHQQ', 'BTQQ'], s: [2, 1], dir: [1, 0], side: [0, -1] },
  { g: ['LFDD', 'LFKK', 'OFKK', 'OBGG'], u: ['RHPP', 'RHPP', 'BHQQ', 'BHHT'], s: [1, 2], dir: [0, 1], side: [-1, 0] }];
const RTYPE = { L: 'living', G: 'family', F: 'hall', H: 'hall', K: 'kitchen', D: 'dining', O: 'study', T: 'study', B: 'bath', R: 'bed', P: 'bed', Q: 'bed' };
// physical position of a point (upstairs floors live off-map): returns [x, z, yOffset]
function phys9(x, z) {
  if (LVL !== 9 || !LV.fl) return [x, z, 0];
  const c = cIdx(cellOf(x), cellOf(z)); if (!LV.fl[c]) return [x, z, 0];
  const h = LV.houses[LV.bld[c]]; return [x + h.up.dx, z + h.up.dz, FLH];
}
const SIDING = [[0.78, 0.8, 0.82], [0.83, 0.78, 0.66], [0.7, 0.78, 0.84], [0.74, 0.8, 0.7], [0.86, 0.83, 0.72], [0.66, 0.66, 0.68], [0.84, 0.74, 0.7]];
const PAPER = [[1, 0.93, 0.8], [0.86, 0.95, 0.88], [0.95, 0.86, 0.86], [0.85, 0.88, 1], [1, 0.97, 0.9], [0.9, 0.85, 0.75]];

function newRoom(bld, t) { const r = { id: LV.rooms.length, bld, t, cells: [] }; LV.rooms.push(r); return r; }
function setRoom(x, y, r, zone) { const c = cIdx(x, y); LV.room[c] = r.id; LV.bld[c] = r.bld; LV.zone[c] = zone; r.cells.push(c); }
// explicit edge overrides: kind 'open' | 'way' (door frame) | 'wall' | fence kinds
function setEdgeKind(x, y, d, kind, extra) {
  const k = eKey(x, y, d); LV.ek.set(k, Object.assign({ x, y, d, kind }, extra || {}));
}

function genLayout9() {
  const n = N;
  LV.zone = new Uint8Array(n * n); LV.room = new Int16Array(n * n).fill(-1); LV.bld = new Int16Array(n * n).fill(-1); LV.fl = new Uint8Array(n * n);
  LV.hE = new Uint8Array((n + 1) * n); LV.vE = new Uint8Array(n * (n + 1));
  LV.rooms = []; LV.houses = []; LV.ek = new Map(); LV.navVer = 0; LV.halls = []; LV.pillars = []; LV.darkCenters = [];
  for (let z = 0; z < n; z++) for (let x = 0; x < n; x++) {
    let t = ZN.VOID;
    if (x < L9_NB && z < L9_NB) {
      if (x === 0 || z === 0 || x === L9_NB - 1 || z === L9_NB - 1) t = ZN.VERGE;
      else if (L9_ST.has(x) || L9_ST.has(z)) t = ZN.STREET;
      else t = ZN.LAWN;
    }
    LV.zone[cIdx(x, z)] = t;
  }
  // ---- houses: 8 blocks x 4 lots. Block (12x12): x [drive][house x4][side yards x2][house x4][drive]; z [front lawn][house x4][back yards x2][house x4][front lawn]
  let hid = 0;
  for (let bj = 0; bj < 3; bj++) for (let bi = 0; bi < 3; bi++) {
    if (bi === 1 && bj === 1) continue;
    const ox = L9_BLK[bi], oz = L9_BLK[bj];
    for (let lv = 0; lv < 2; lv++) for (let lu = 0; lu < 2; lu++) {
      const face = lv === 0 ? 3 : 1, hx = lu === 0 ? ox + 1 : ox + 7, hz = lv === 0 ? oz + 1 : oz + 7, dcol = lu === 0 ? ox : ox + 11;
      const dz0 = lv === 0 ? oz : oz + 9;
      for (let k = 0; k < 3; k++) LV.zone[cIdx(dcol, dz0 + k)] = ZN.DRIVE;
      const h = { id: hid++, bi, bj, lu, lv, hx, hz, face, dcol, dz0, yardZ: lv === 0 ? oz : oz + 11, rooms: [], ways: [], tint: pick(SIDING), paper: pick(PAPER), enter: true, red: false, lit: false, cans: false };
      h.cell = face === 3 ? (a, b) => [hx + a, hz + b] : (a, b) => [hx + HS - 1 - a, hz + HS - 1 - b];
      h.dirA = face === 3 ? 0 : 2;          // world direction of local +a
      h.dirB = face === 3 ? 1 : 3;          // world direction of local +b (into the house)
      LV.houses.push(h);
    }
    // back-yard picket fences: along the middle of the back yards, and between neighbouring side yards
    for (let i = 0; i < 12; i++) setEdgeKind(ox + i, oz + 6, 3, 'picket');
    for (let j = 3; j <= 8; j++) setEdgeKind(ox + 6, oz + j, 2, 'picket');
  }
  // pick enterable houses (the rest are boarded up), then the story houses
  const hs = shuffle(LV.houses.slice());
  hs.forEach((h, i) => { h.enter = i < 19; });
  const enter = LV.houses.filter(h => h.enter);
  const farFrom = (list, pool, k, minD) => { const out = []; for (const h of shuffle(pool.slice())) { if (out.length >= k) break; if ([...list, ...out].every(o => Math.hypot(o.hx - h.hx, o.hz - h.hz) >= minD)) out.push(h); } return out; };
  const spawnPt = { hx: 1, hz: 5 };
  const reds = farFrom([spawnPt], enter.filter(h => !(h.bi === 0 && h.bj === 0)), 3, 13);
  reds.forEach(h => h.red = true);
  const cansH = farFrom([...reds, spawnPt], enter.filter(h => !h.red), 2, 10); cansH.forEach(h => h.cans = true);
  enter.filter(h => !h.red && !h.cans).slice(0, 5).forEach(h => h.lit = true);
  // off-map slots for the upstairs floors (4x4 + a one-cell gap), east and south of the neighbourhood
  const slots = [];
  for (const x0 of [LAB_X, LAB_X + 5]) for (let z0 = 13; z0 + HS <= n - 1; z0 += 5) slots.push([x0, z0]);
  for (const z0 of [L9_NB + 1, L9_NB + 6]) for (let x0 = 1; x0 + HS <= L9_NB - 1; x0 += 5) slots.push([x0, z0]);
  let si = 0;
  for (const h of LV.houses) { if (h.enter) { const [ux, uz] = slots[si++]; h.up = { ux, uz, dx: (h.hx - ux) * CELL, dz: (h.hz - uz) * CELL }; } planHouse(h); }
  planBase(); planLab();
  // ---- fences ----
  for (let i = 0; i < L9_NB; i++) {                      // tall wooden privacy fence around the neighbourhood
    setEdgeKind(i, 0, 3, 'wood'); setEdgeKind(0, i, 2, 'wood');
    setEdgeKind(i, L9_NB - 1, 1, 'wood'); setEdgeKind(L9_NB - 1, i, 0, 'wood');
  }
  const b0 = BX, b1 = BX + 8;                             // chain-link ring around the M.E.G. compound
  for (let i = b0; i <= b1; i++) {
    setEdgeKind(i, b0, 3, 'chain'); setEdgeKind(b0, i, 2, 'chain'); setEdgeKind(b1, i, 0, 'chain');
    if (i !== BX + 4) setEdgeKind(i, b1, 1, 'chain'); else setEdgeKind(i, b1, 1, 'gate');
  }
  // cage in the lab entrance
  for (const z of [2, 3]) { setEdgeKind(LAB_X + 2, z, 2, 'bars'); setEdgeKind(LAB_X + 2, z, 0, 'bars'); }
  setEdgeKind(LAB_X + 2, 1, 1, 'cageRear'); setEdgeKind(LAB_X + 2, 3, 1, 'cageFront');
  // ---- resolve every edge ----
  const rule = (a, b) => {
    const za = a < 0 ? ZN.VOID : LV.zone[a], zb = b < 0 ? ZN.VOID : LV.zone[b];
    if (za === ZN.VOID || zb === ZN.VOID) return 1;
    const ra = LV.room[a], rb = LV.room[b];
    if (ra < 0 && rb < 0) return 0;
    return ra === rb ? 0 : 1;
  };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) {
    const a = y > 0 ? cIdx(x, y - 1) : -1, b = y < n ? cIdx(x, y) : -1; LV.hE[hI(x, y)] = rule(a, b);
  }
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) {
    const a = x > 0 ? cIdx(x - 1, y) : -1, b = x < n ? cIdx(x, y) : -1; LV.vE[vI(x, y)] = rule(a, b);
  }
  for (const e of LV.ek.values()) {
    const v = e.kind === 'open' ? 0 : e.kind === 'way' ? 2 : e.kind === 'cageRear' || e.kind === 'cageFront' ? 0 : 1;
    setEdge(e.x, e.y, e.d, v);
  }
}

function planHouse(h) {
  const cells = []; for (let b = 0; b < HS; b++) for (let a = 0; a < HS; a++) cells.push([a, b]);
  if (!h.enter) { // boarded: a single sealed volume
    const r = newRoom(h.id, 'sealed'); h.rooms.push(r);
    for (const [a, b] of cells) { const [x, y] = h.cell(a, b); setRoom(x, y, r, ZN.HOUSE); }
    { const [x, y] = h.cell(1, 0); h.front = { x, y, d: (h.dirB + 2) % 4 }; }   // porch only, the door itself is boarded
    return;
  }
  const mir = RNG() < 0.5, P = pick(PLANS2), M = a => mir ? HS - 1 - a : a;
  const ch = (rows, a, b) => rows[b][mir ? HS - 1 - a : a];
  h.cellU = h.face === 3 ? (a, b) => [h.up.ux + a, h.up.uz + b] : (a, b) => [h.up.ux + HS - 1 - a, h.up.uz + HS - 1 - b];
  const st = { s: [M(P.s[0]), P.s[1]], dir: [mir ? -P.dir[0] : P.dir[0], P.dir[1]], side: [mir ? -P.side[0] : P.side[0], P.side[1]] };
  h.stairL = st;
  const rid = [{}, {}], plan = [];
  for (const fl of [0, 1]) {
    const rows = fl ? P.u : P.g, map = {};
    for (const [a, b] of cells) {
      const k = ch(rows, a, b); if (!map[k]) { const r = newRoom(h.id, RTYPE[k] || 'hall'); r.fl = fl; r.key = k; h.rooms.push(r); map[k] = plan.length; plan.push({ r, fl }); }
      rid[fl][a + ',' + b] = map[k];
      const [x, y] = fl ? h.cellU(a, b) : h.cell(a, b); setRoom(x, y, plan[map[k]].r, ZN.HOUSE); if (fl) LV.fl[cIdx(x, y)] = 1;
    }
  }
  const locDir = (da, db) => da > 0 ? h.dirA : da < 0 ? (h.dirA + 2) % 4 : db > 0 ? h.dirB : (h.dirB + 2) % 4;
  const way = (fl, a, b, d, door, kind) => {
    const [x, y] = fl ? h.cellU(a, b) : h.cell(a, b);
    setEdgeKind(x, y, d, 'way', { door, dk: kind, house: h.id }); h.ways.push({ x, y, d, door, kind, fl });
    return { x, y, d };
  };
  const F = (h.dirB + 2) % 4, BK = h.dirB;
  h.front = way(0, 1, 0, F, true, 'front');
  h.entryRoom = plan[rid[0]['1,0']].r;
  const [sa, sb] = st.s, [da, db] = st.dir, [ea, eb] = st.side;
  if (RNG() < 0.6) { const ba = pick([0, 1, 2, 3]); h.back = way(0, ba, HS - 1, BK, true, 'back'); }
  // edges the stairs need kept solid (no doorways): the side wall on both floors, the head wall downstairs
  const noDoor = new Set([[0, sa, sb, ea, eb], [1, sa, sb, ea, eb], [0, sa, sb, da, db], [1, sa, sb, -da, -db]].map(([f, a, b, x, y]) => f + ':' + [a, b, a + x, b + y].join(',')).concat(
    [[0, sa, sb, ea, eb], [1, sa, sb, ea, eb], [0, sa, sb, da, db], [1, sa, sb, -da, -db]].map(([f, a, b, x, y]) => f + ':' + [a + x, b + y, a, b].join(','))));
  // connect rooms with a random spanning tree per floor (+ maybe one loop); the stairs link the floors
  const links = [], rootOf = [rid[0]['1,0'], rid[1][sa + ',' + sb]];
  for (const fl of [0, 1]) {
    const cand = [];
    for (const [a, b] of cells) for (const [ia, ib] of [[1, 0], [0, 1]]) {
      const a2 = a + ia, b2 = b + ib; if (a2 >= HS || b2 >= HS) continue;
      const i = rid[fl][a + ',' + b], j = rid[fl][a2 + ',' + b2]; if (i === j || noDoor.has(fl + ':' + [a, b, a2, b2].join(','))) continue;
      cand.push({ i, j, a, b, d: locDir(ia, ib), fl });
    }
    shuffle(cand);
    const floorRooms = new Set(plan.map((p, i) => p.fl === fl ? i : -1).filter(i => i >= 0));
    const conn = new Set([rootOf[fl]]), used = new Set();
    while (conn.size < floorRooms.size) {
      const c = cand.find(c => conn.has(c.i) !== conn.has(c.j)); if (!c) break;
      conn.add(c.i); conn.add(c.j); used.add(c); links.push(c);
    }
    const extra = cand.find(c => !used.has(c) && !links.some(l => (l.i === c.i && l.j === c.j) || (l.i === c.j && l.j === c.i)));
    if (extra && RNG() < 0.4) links.push(extra);
  }
  // room-graph distance from the front door (the stairs count as one hop) -> the deepest room holds the terminal
  const graph = links.map(l => [l.i, l.j]).concat([[rid[0][sa + ',' + sb], rootOf[1]]]);
  const depth = { [rootOf[0]]: 0 }; let changed = true;
  while (changed) { changed = false; for (const [i0, j0] of graph) for (const [p, q] of [[i0, j0], [j0, i0]]) if (depth[p] !== undefined && depth[q] === undefined) { depth[q] = depth[p] + 1; changed = true; } }
  let deep = rootOf[0], dd = -1;
  plan.forEach((p, i) => { const sc = (depth[i] ?? 0) + (p.r.t === 'study' ? 0.6 : p.r.t === 'bed' ? 0.3 : 0) + RNG() * 0.4; if (p.r.t !== 'hall' && p.r.t !== 'bath' && sc > dd && i !== rootOf[0]) { dd = sc; deep = i; } });
  h.termRoom = plan[deep].r;
  for (const l of links) { const intoDeep = l.i === deep || l.j === deep; way(l.fl, l.a, l.b, l.d, intoDeep || RNG() < 0.65, 'room'); }
  h.plan = plan; h.depth = depth; h.rid = rid;
  // ---- stair geometry in world space ----
  const wv = (la, lb) => { const d = locDir(la, lb); return [DX[d], DY[d]]; };
  const U = wv(da, db), Sd = wv(ea, eb);
  const mk = (fl) => { const [x, y] = fl ? h.cellU(sa, sb) : h.cell(sa, sb); return { x, y, cx: cellCenter(x), cz: cellCenter(y) }; };
  const g = mk(0), u = mk(1), yawU = Math.atan2(U[0], U[1]);
  const pt = (o, along, lat) => ({ x: o.cx + U[0] * along + Sd[0] * lat, z: o.cz + U[1] * along + Sd[1] * lat });
  const rect = (o, a0, a1, l0, l1) => { const p = [pt(o, a0, l0), pt(o, a1, l1)]; return { x0: Math.min(p[0].x, p[1].x), z0: Math.min(p[0].z, p[1].z), x1: Math.max(p[0].x, p[1].x), z1: Math.max(p[0].z, p[1].z) }; };
  const cA = fl => { const [x, y] = fl ? h.cellU(sa - da, sb - db) : h.cell(sa - da, sb - db); return cIdx(x, y); };
  const cH = fl => { const [x, y] = fl ? h.cellU(sa + da, sb + db) : h.cell(sa + da, sb + db); return cIdx(x, y); };
  h.stair = { U, S: Sd, yawU, g, u, pt, rect,
    gTrig: rect(g, -1.75, -0.9, 0.45, 1.75), gSolid: rect(g, -0.9, 1.8, 0.5, 1.8), gGoal: pt(g, -1.3, 1.12), gArr: Object.assign(pt(g, -2.25, 1.12), { yaw: yawU + Math.PI }),
    uTrig: rect(u, 0.9, 1.95, 0.45, 1.75), uSolid: rect(u, -1.85, 0.9, 0.45, 1.8), uGoal: pt(u, 1.35, 1.12), uArr: Object.assign(pt(u, 2.45, 1.12), { yaw: yawU }),
    cells: [cIdx(g.x, g.y), cIdx(u.x, u.y), cA(0), cH(1)] };
}
// other-floor helpers: the stair a house uses, and which floor a cell is on
function floorOf(c) { return LV.fl ? LV.fl[c] : 0; }
function charRooms(map, x0, z0, zone, bld, types) {  // rows listed north (small z) to south
  const rs = {};
  map.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '.') return;
    if (!rs[ch]) rs[ch] = newRoom(bld, types[ch] || ch);
    setRoom(x0 + i, z0 + j, rs[ch], zone);
  }));
  return rs;
}
function planBase() {
  const B0 = BX, o = BX - 14;              // literals below are relative to the original compound origin (14)
  for (let z = B0; z < B0 + 9; z++) for (let x = B0; x < B0 + 9; x++) LV.zone[cIdx(x, z)] = ZN.YARD;
  const R = charRooms(['SCCCCCT', 'SCGGGET', 'SCGGGEE', 'OCGGGEE', 'OCLLLEE', 'OCLLLEE'], 15 + o, 15 + o, ZN.BASE, 100,
    { S: 'storage', C: 'corridor', T: 'stair', G: 'radio', E: 'bunks', O: 'office', L: 'lobby' });
  LV.base = { R, gate: { x: 18 + o, y: 22 + o, d: 1 }, stair: { x: 21 + o, y: 16 + o }, landing: { x: 21 + o, y: 15 + o } };
  const w = (x, y, d, door, kind) => setEdgeKind(x + o, y + o, d, 'way', { door, dk: kind || 'room', bld: 100 });
  w(18, 20, 1, true, 'base');          // front door
  w(16, 19, 0, false);                 // corridor -> lobby
  w(15, 19, 0, true, 'room');          // office
  w(15, 16, 0, true, 'room');          // storage
  w(18, 16, 3, true, 'room');          // radio room
  w(19, 19, 0, true, 'room');          // bunks
  w(20, 15, 0, true, 'stairs');        // stairwell
}
function planLab() {
  const R = charRooms(['.AAA.', 'DDDDD', 'DDDDD', 'DDDDD', 'DDDDD', 'HHHHH', 'HHHHH', 'HHHHH', 'HHHHH', 'HHHHH', '.XXX.', '.XXX.'], LAB_X, 0, ZN.LAB, 101,
    { A: 'landing', D: 'decon', H: 'hall', X: 'holding' });
  LV.lab = { R, cage: [cIdx(LAB_X + 2, 2), cIdx(LAB_X + 2, 3)], arrive: { x: LAB_X + 2, y: 0 } };
  const w = (x, y, d, door, kind) => setEdgeKind(x, y, d, 'way', { door, dk: kind || 'room', bld: 101 });
  w(LAB_X + 2, 0, 1, false); w(LAB_X, 4, 1, false); w(LAB_X + 2, 4, 1, false); w(LAB_X + 4, 4, 1, false);
  w(LAB_X + 2, 9, 1, true, 'cell');
  w(LAB_X + 4, 7, 0, false, 'elev');   // service elevator: doorway in the outer wall
}

// ---------- pieces (walls, doorway frames, fences) ----------
function collectPieces9() {
  const pieces = [], trims = [], H = WT / 2;
  const zOf = (x, y) => inGrid(x, y) ? LV.zone[cIdx(x, y)] : ZN.VOID;
  const hOf = (x, y) => { if (!inGrid(x, y)) return null; const b = LV.bld[cIdx(x, y)]; return b >= 0 && b < 100 ? LV.houses[b] : null; };
  const side = (x, y, ox, oy) => {           // material + tint of the wall face that looks into cell (x,y)
    const z = zOf(x, y);
    if (z === ZN.VOID) return null;
    if (z === ZN.HOUSE) { const h = hOf(x, y); return { m: 'wallin', c: h.paper }; }
    if (z === ZN.BASE || z === ZN.LAB) return { m: 'labwall', c: z === ZN.LAB ? [0.86, 0.9, 0.92] : [0.9, 0.88, 0.8] };
    const zo = zOf(ox, oy);
    if (zo === ZN.HOUSE) { const h = hOf(ox, oy); return { m: 'siding', c: h.tint }; }
    return { m: 'block', c: [0.72, 0.72, 0.7] };
  };
  const walls = (x, y, d, v) => {   // edge on the + side of cell... normalised to H (d=3 top of (x,y)) or V (d=2 left of (x,y))
    const horiz = d === 3, ax = x, ay = y;
    const A = horiz ? [x, y - 1] : [x - 1, y], Bc = [x, y];
    const sa = side(A[0], A[1], Bc[0], Bc[1]), sb = side(Bc[0], Bc[1], A[0], A[1]);
    if (!sa && !sb) return;
    const out = sa && sb ? ((sa.m === 'siding' || sa.m === 'block') ? sa : (sb.m === 'siding' || sb.m === 'block') ? sb : sb) : (sa || sb);
    const mk = (x0, z0, x1, z1, y0, y1, k) => pieces.push({ x0, z0, x1, z1, y0, y1, k, horiz, sa, sb, cap: out });
    const l0 = horiz ? ax * CELL : ay * CELL, l1 = l0 + CELL, c = horiz ? ay * CELL : ax * CELL;
    const seg = (a, b, y0, y1, k) => horiz ? mk(a, c - H, b, c + H, y0, y1, k) : mk(c - H, a, c + H, b, y0, y1, k);
    if (v === 1) { seg(l0 - H, l1 + H, 0, CEIL, 'w'); return; }
    const m = (l0 + l1) / 2, a = m - DOORW / 2, b = m + DOORW / 2;
    seg(l0 - H, a, 0, CEIL, 'w'); seg(b, l1 + H, 0, CEIL, 'w'); seg(a, b, DOORH, CEIL, 'l');
    const o = 0.016, cw = 0.075;
    const tr = (p0, p1, y0, y1) => trims.push(horiz ? [p0, y0, c - H - o, p1, y1, c + H + o] : [c - H - o, y0, p0, c + H + o, y1, p1]);
    tr(a - cw, a + 0.012, 0, DOORH + cw); tr(b - 0.012, b + cw, 0, DOORH + cw); tr(a - cw, b + cw, DOORH - 0.012, DOORH + cw);
  };
  const fence = (x, y, d, kind) => {
    const horiz = d === 3, c = horiz ? y * CELL : x * CELL, l0 = horiz ? x * CELL : y * CELL, l1 = l0 + CELL;
    const t = kind === 'wood' ? 0.1 : 0.05, y1 = kind === 'wood' ? 2.7 : kind === 'bars' ? CEIL : kind === 'picket' ? 1.05 : 2.35;
    const p = horiz ? { x0: l0 - t, z0: c - t, x1: l1 + t, z1: c + t } : { x0: c - t, z0: l0 - t, x1: c + t, z1: l1 + t };
    pieces.push(Object.assign(p, { y0: 0, y1, k: kind, horiz, noLM: kind !== 'wood', fence: true, l0, l1, c }));
  };
  const norm = (e) => e.d === 0 ? { x: e.x + 1, y: e.y, d: 2 } : e.d === 1 ? { x: e.x, y: e.y + 1, d: 3 } : { x: e.x, y: e.y, d: e.d };
  LV.gates = [];
  for (const e0 of LV.ek.values()) {
    const e = norm(e0);
    if (['wood', 'chain', 'bars', 'picket'].includes(e0.kind)) fence(e.x, e.y, e.d, e0.kind);
    if (e0.kind === 'gate' || e0.kind === 'cageRear' || e0.kind === 'cageFront') LV.gates.push(Object.assign({}, e0, { n: e }));
  }
  const fenced = new Set([...LV.ek.values()].filter(e => e.kind !== 'way' && e.kind !== 'open').map(e => { const q = norm(e); return (q.d === 3 ? 'h' : 'v') + q.x + ',' + q.y; }));
  for (let y = 0; y <= N; y++) for (let x = 0; x < N; x++) { const v = LV.hE[hI(x, y)]; if (v && !fenced.has('h' + x + ',' + y)) walls(x, y, 3, v); }
  for (let y = 0; y < N; y++) for (let x = 0; x <= N; x++) { const v = LV.vE[vI(x, y)]; if (v && !fenced.has('v' + x + ',' + y)) walls(x, y, 2, v); }
  // baseboards on indoor faces
  for (const p of pieces) {
    if (p.k !== 'w') continue;
    const o = 0.013;
    for (const [s, sd] of [[p.sa, -1], [p.sb, 1]]) {
      if (!s || (s.m !== 'wallin' && s.m !== 'labwall')) continue;
      if (p.horiz) trims.push(sd < 0 ? [p.x0, 0, p.z0 - o, p.x1, 0.1, p.z0 + 0.01] : [p.x0, 0, p.z1 - 0.01, p.x1, 0.1, p.z1 + o]);
      else trims.push(sd < 0 ? [p.x0 - o, 0, p.z0, p.x0 + 0.01, 0.1, p.z1] : [p.x1 - 0.01, 0, p.z0, p.x1 + o, 0.1, p.z1]);
    }
  }
  LV.pieces = pieces; LV.trims = trims;
}

// ---------- geometry ----------
Geo.prototype.quad = function (P0, P1, P3, s, col) {  // parallelogram P0,P1,P1+P3-P0,P3 ; normal = (P1-P0)x(P3-P0)
  const U = [P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]], V = [P3[0] - P0[0], P3[1] - P0[1], P3[2] - P0[2]];
  const du = Math.hypot(...U), dv = Math.hypot(...V), u = U.map(v => v / du), v = V.map(q => q / dv);
  const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], nl = Math.hypot(...n) || 1;
  this.face(P0[0], P0[1], P0[2], u, v, du, dv, n.map(q => q / nl), s, false, col);
};
Geo.prototype.tri = function (p0, p1, p2, s, col) {
  const U = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], W2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
  let n = [U[1] * W2[2] - U[2] * W2[1], U[2] * W2[0] - U[0] * W2[2], U[0] * W2[1] - U[1] * W2[0]]; const nl = Math.hypot(...n); n = n.map(q => q / nl);
  const ul = Math.hypot(...U), T = U.map(q => q / ul), Bv = [n[1] * T[2] - n[2] * T[1], n[2] * T[0] - n[0] * T[2], n[0] * T[1] - n[1] * T[0]];
  const b = this.p.length / 3;
  for (const q of [p0, p1, p2]) {
    this.p.push(q[0], q[1], q[2]); this.n.push(n[0], n[1], n[2]); this.t.push(T[0], T[1], T[2], 1);
    this.uv.push((q[0] * T[0] + q[1] * T[1] + q[2] * T[2]) * s, (q[0] * Bv[0] + q[1] * Bv[1] + q[2] * Bv[2]) * s);
    if (this.c) this.c.push(...(col || [1, 1, 1, 1]));
  }
  if (FLIP_WINDING) this.i.push(b, b + 2, b + 1); else this.i.push(b, b + 1, b + 2);
};
function boxFaces(g, p, s, faceSel) {  // emit only faces whose material matches; faceSel(maskBit) -> col or null
  const dx = p.x1 - p.x0, dy = p.y1 - p.y0, dz = p.z1 - p.z0;
  const F = [[1, () => g.face(p.x1, p.y0, p.z1, [0, 0, -1], [0, 1, 0], dz, dy, [1, 0, 0], s, false, faceSel(1))],
    [2, () => g.face(p.x0, p.y0, p.z0, [0, 0, 1], [0, 1, 0], dz, dy, [-1, 0, 0], s, false, faceSel(2))],
    [4, () => g.face(p.x0, p.y0, p.z1, [1, 0, 0], [0, 1, 0], dx, dy, [0, 0, 1], s, false, faceSel(4))],
    [8, () => g.face(p.x1, p.y0, p.z0, [-1, 0, 0], [0, 1, 0], dx, dy, [0, 0, -1], s, false, faceSel(8))],
    [16, () => g.face(p.x0, p.y1, p.z1, [1, 0, 0], [0, 0, -1], dx, dz, [0, 1, 0], s, false, faceSel(16))],
    [32, () => g.face(p.x0, p.y0, p.z0, [1, 0, 0], [0, 0, 1], dx, dz, [0, -1, 0], s, false, faceSel(32))]];
  for (const [bit, f] of F) if (faceSel(bit)) f();
}
const MAT9_S = { siding: 1 / 2.4, wallin: 1 / 0.9, labwall: 1 / 1.6, block: 1 / 1.6, wood: 1 / 2.4, case: 1, asph: 1 / 4.8, grass: 1 / 3.2, conc: 1 / 2.8, floor: 1 / 2.4, tile: 1 / 1.2, plaster: 1 / 2.5, ceil: 1 / 1.2, roof: 1 / 2.2, fence: 1 / 2.4 };
function buildGeometry9(scene, mats) {
  const CH = 8, NC = Math.ceil(N / CH), G = {};
  const geo = (m, ci) => { const k = m + ':' + ci; return G[k] || (G[k] = new Geo(true)); };
  const chunkOf = (x, z) => clamp(Math.floor(z / CELL / CH), 0, NC - 1) * NC + clamp(Math.floor(x / CELL / CH), 0, NC - 1);
  const C4 = c => [c[0], c[1], c[2], 1];
  for (const p of LV.pieces) {
    const ci = chunkOf((p.x0 + p.x1) / 2, (p.z0 + p.z1) / 2);
    if (p.fence) {
      if (p.k === 'wood') { const g = geo('fence', ci); boxFaces(g, p, MAT9_S.fence, b => b === 32 ? null : [0.62, 0.5, 0.38, 1]); }
      if (p.k === 'picket') {
        const g = geo('fence', ci), C = [0.86, 0.85, 0.8, 1], s = MAT9_S.fence;
        const bx = (a0, a1, y0, y1, t) => p.horiz ? g.box(a0, y0, p.c - t, a1, y1, p.c + t, s, 31, C) : g.box(p.c - t, y0, a0, p.c + t, y1, a1, s, 31, C);
        bx(p.l0 - 0.05, p.l0 + 0.05, 0, 1.12, 0.05);
        for (const y of [0.32, 0.82]) bx(p.l0, p.l1, y, y + 0.07, 0.022);
        for (let t = p.l0 + 0.15; t < p.l1 - 0.05; t += 0.3) bx(t - 0.045, t + 0.045, 0.03, 1.02, 0.011);
      }
      continue;
    }
    const neg = p.sa, pos = p.sb, cap = p.cap;
    // faces: along x (horiz): -z face (8) looks into A (neg), +z face (4) into B (pos); along z: -x (2) -> A, +x (1) -> B
    const pick = bit => {
      if (p.horiz) { if (bit === 8) return neg; if (bit === 4) return pos; } else { if (bit === 2) return neg; if (bit === 1) return pos; }
      if (bit === 16) return p.k === 'l' ? null : cap;
      if (bit === 32) return p.k === 'l' ? (neg && (neg.m === 'wallin' || neg.m === 'labwall') ? neg : pos) : null;
      return cap;
    };
    for (const mname of new Set([neg, pos, cap].filter(Boolean).map(s => s.m))) {
      const g = geo(mname, ci);
      boxFaces(g, p, MAT9_S[mname], bit => { const s = pick(bit); return s && s.m === mname ? C4(s.c) : null; });
    }
  }
  for (const t of LV.trims) { const g = geo('case', chunkOf((t[0] + t[3]) / 2, (t[2] + t[5]) / 2)); g.box(t[0], t[1], t[2], t[3], t[4], t[5], 1, 31, [0.82, 0.8, 0.74, 1]); }
  // ---- ground, sidewalks, floors, ceilings ----
  const skipFloor = new Set([cIdx(LV.base.stair.x, LV.base.stair.y)]), skipCeil = new Set([cIdx(LV.lab.arrive.x, LV.lab.arrive.y)]);
  // house stairs: a hole in the ground-floor ceiling above the upper flight, and in the upstairs floor over the whole flight
  const holeF = new Map(), holeC = new Map();
  for (const h of LV.houses) if (h.stair) { const S = h.stair; holeC.set(cIdx(S.g.x, S.g.y), S.rect(S.g, -0.6, 1.8, 0.58, 1.8)); holeF.set(cIdx(S.u.x, S.u.y), S.rect(S.u, -1.8, 1.8, 0.58, 1.8)); }
  const rectMinus = (x0, z0, x1, z1, r) => {
    if (!r) return [[x0, z0, x1, z1]];
    const a0 = clamp(r.x0, x0, x1), a1 = clamp(r.x1, x0, x1), b0 = clamp(r.z0, z0, z1), b1 = clamp(r.z1, z0, z1), out = [];
    if (b0 - z0 > 0.01) out.push([x0, z0, x1, b0]); if (z1 - b1 > 0.01) out.push([x0, b1, x1, z1]);
    if (a0 - x0 > 0.01) out.push([x0, b0, a0, b1]); if (x1 - a1 > 0.01) out.push([a1, b0, x1, b1]);
    return out;
  };
  const zOf = (x, y) => inGrid(x, y) ? LV.zone[cIdx(x, y)] : ZN.VOID;
  const up = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z1, [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, [0, 1, 0], s, false, col);
  const dn = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z0, [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, -1, 0], s, false, col);
  const SW = 1.35, SWH = 0.1;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y), z = LV.zone[c], x0 = x * CELL, z0 = y * CELL, x1 = x0 + CELL, z1 = z0 + CELL, ci = chunkOf(x0 + 1, z0 + 1);
    const hv = hash1(x * 31.7 + y * 17.3), W1 = [1, 1, 1, 1];
    if (z === ZN.VOID) continue;
    if (z === ZN.STREET) {
      up(geo('asph', ci), x0, z0, x1, z1, 0, MAT9_S.asph, W1);
      const g = geo('conc', ci), nb = [0, 1, 2, 3].map(d => { const t = zOf(x + DX[d], y + DY[d]); return t !== ZN.STREET && t !== ZN.VOID; });
      const strip = (a0, b0, a1, b1, d) => {
        up(g, a0, b0, a1, b1, SWH, MAT9_S.conc, W1);
        const cf = 0.9;
        if (d === 0) g.face(a0, 0, b0, [0, 0, 1], [0, 1, 0], b1 - b0, SWH, [-1, 0, 0], 1, false, [cf, cf, cf, 1]);
        if (d === 2) g.face(a1, 0, b1, [0, 0, -1], [0, 1, 0], b1 - b0, SWH, [1, 0, 0], 1, false, [cf, cf, cf, 1]);
        if (d === 1) g.face(a1, 0, b0, [-1, 0, 0], [0, 1, 0], a1 - a0, SWH, [0, 0, -1], 1, false, [cf, cf, cf, 1]);
        if (d === 3) g.face(a0, 0, b1, [1, 0, 0], [0, 1, 0], a1 - a0, SWH, [0, 0, 1], 1, false, [cf, cf, cf, 1]);
      };
      if (nb[0]) strip(x1 - SW, z0, x1, z1, 0); if (nb[2]) strip(x0, z0, x0 + SW, z1, 2);
      if (nb[1]) strip(x0, z1 - SW, x1, z1, 1); if (nb[3]) strip(x0, z0, x1, z0 + SW, 3);
      // outer corners of blocks
      for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const dz = zOf(x + sx, y + sy), ox = zOf(x + sx, y), oy = zOf(x, y + sy);
        if (dz !== ZN.STREET && dz !== ZN.VOID && ox === ZN.STREET && oy === ZN.STREET) {
          const a0 = sx > 0 ? x1 - SW : x0, b0 = sy > 0 ? z1 - SW : z0; up(g, a0, b0, a0 + SW, b0 + SW, SWH, MAT9_S.conc, W1);
        }
      }
      continue;
    }
    if (z === ZN.LAWN || z === ZN.VERGE) { const k = 0.85 + 0.3 * hv; up(geo('grass', ci), x0, z0, x1, z1, 0, MAT9_S.grass, [k, k, 0.9 + 0.2 * hv, 1]); continue; }
    if (z === ZN.DRIVE || z === ZN.YARD) { const k = z === ZN.YARD ? 0.8 : 0.95; up(geo('conc', ci), x0, z0, x1, z1, 0.004, MAT9_S.conc, [k, k, k, 1]); continue; }
    const hf = holeF.get(c), hc = holeC.get(c);
    if (skipFloor.has(c)) { /* stair hole */ } else if (z === ZN.HOUSE) for (const q of rectMinus(x0, z0, x1, z1, hf)) up(geo('floor', ci), q[0], q[1], q[2], q[3], 0, MAT9_S.floor, W1);
    else up(geo('tile', ci), x0, z0, x1, z1, 0, MAT9_S.tile, z === ZN.LAB ? [0.86, 0.92, 0.92, 1] : [0.95, 0.92, 0.84, 1]);
    if (!skipCeil.has(c)) { if (z === ZN.HOUSE) for (const q of rectMinus(x0, z0, x1, z1, hc)) dn(geo('plaster', ci), q[0], q[1], q[2], q[3], CEIL, MAT9_S.plaster, W1); else dn(geo('ceil', ci), x0, z0, x1, z1, CEIL, MAT9_S.ceil, z === ZN.LAB ? [0.8, 0.86, 0.88, 1] : [0.9, 0.9, 0.86, 1]); }
  }
  // void beyond the fence: dark ground so the fog has something to swallow
  const vg = geo('grass', 0); up(vg, -60, -60, LEVEL + 60, 0, -0.02, MAT9_S.grass, [0.5, 0.5, 0.5, 1]); up(vg, -60, 0, 0, LEVEL + 60, -0.02, MAT9_S.grass, [0.5, 0.5, 0.5, 1]);
  up(vg, 0, L9_NB * CELL, LEVEL + 60, LEVEL + 60, -0.02, MAT9_S.grass, [0.5, 0.5, 0.5, 1]); up(vg, L9_NB * CELL, 0, LEVEL + 60, L9_NB * CELL, -0.02, MAT9_S.grass, [0.5, 0.5, 0.5, 1]);
  // ---- upper storey shell, roofs, chimneys ----
  for (const h of LV.houses) {
    const y0 = CEIL + FLH + 0.02, rh = 2.2, W = HS * CELL;
    const x0 = h.hx * CELL - 0.4, x1 = (h.hx + HS) * CELL + 0.4, z0 = h.hz * CELL - 0.4, z1 = (h.hz + HS) * CELL + 0.4;
    const ci = chunkOf(h.hx * CELL + W / 2, h.hz * CELL + W / 2), g = geo('roof', ci), gs = geo('siding', ci), T = [h.tint[0] * 0.9, h.tint[1] * 0.9, h.tint[2] * 0.9, 1], T1 = [...h.tint, 1], R1 = [1, 1, 1, 1];
    const wx0 = h.hx * CELL - WT / 2, wx1 = (h.hx + HS) * CELL + WT / 2, wz0 = h.hz * CELL - WT / 2, wz1 = (h.hz + HS) * CELL + WT / 2, ya = CEIL - 0.02, hh = y0 - ya;
    gs.face(wx1, ya, wz1, [0, 0, -1], [0, 1, 0], wz1 - wz0, hh, [1, 0, 0], MAT9_S.siding, false, T1);
    gs.face(wx0, ya, wz0, [0, 0, 1], [0, 1, 0], wz1 - wz0, hh, [-1, 0, 0], MAT9_S.siding, false, T1);
    gs.face(wx0, ya, wz1, [1, 0, 0], [0, 1, 0], wx1 - wx0, hh, [0, 0, 1], MAT9_S.siding, false, T1);
    gs.face(wx1, ya, wz0, [-1, 0, 0], [0, 1, 0], wx1 - wx0, hh, [0, 0, -1], MAT9_S.siding, false, T1);
    const gd = geo('case', ci), DK = [0.18, 0.17, 0.16, 1], TR = [0.8, 0.79, 0.74, 1];
    gd.box(wx0 - 0.06, CEIL, wz0 - 0.06, wx1 + 0.06, CEIL + 0.18, wz1 + 0.06, 1, 15, TR);      // band between the storeys
    for (const [cx, cz] of [[wx0, wz0], [wx1, wz0], [wx0, wz1], [wx1, wz1]]) gd.box(cx - 0.08, 0, cz - 0.08, cx + 0.08, y0, cz + 0.08, 1, 15, TR);   // corner boards
    const zm = (z0 + z1) / 2, yr = y0 + rh;
    g.quad([x1, y0, z0], [x0, y0, z0], [x1, yr, zm], MAT9_S.roof, R1);
    g.quad([x0, y0, z1], [x1, y0, z1], [x0, yr, zm], MAT9_S.roof, R1);
    gs.tri([wx0, y0, wz0], [wx0, y0, wz1], [wx0, yr - 0.1, zm], MAT9_S.siding, T);
    gs.tri([wx1, y0, wz1], [wx1, y0, wz0], [wx1, yr - 0.1, zm], MAT9_S.siding, T);
    gd.box(x0, y0 - 0.14, z0, x1, y0, z0 + 0.4, 1, 63, DK); gd.box(x0, y0 - 0.14, z1 - 0.4, x1, y0, z1, 1, 63, DK);
    gd.box(x0, y0 - 0.14, z0, x0 + 0.4, y0, z1, 1, 63, DK); gd.box(x1 - 0.4, y0 - 0.14, z0, x1, y0, z1, 1, 63, DK);
    if (hash1(h.id * 7.3) < 0.7) {   // brick chimney
      const cx = hash1(h.id * 3.1) < 0.5 ? wx0 + 1.6 : wx1 - 1.6, cz = zm + (hash1(h.id * 5.7) < 0.5 ? -1.4 : 1.4), gb = geo('block', ci), BR = [0.5, 0.3, 0.24, 1];
      gb.box(cx - 0.4, y0 + 0.3, cz - 0.35, cx + 0.4, yr + 0.9, cz + 0.35, MAT9_S.block, 31, BR); gd.box(cx - 0.46, yr + 0.9, cz - 0.41, cx + 0.46, yr + 1.0, cz + 0.41, 1, 63, DK);
    }
  }
  // ---- house stairs ----
  for (const h of LV.houses) if (h.stair) buildHouseStair9(h, geo, chunkOf);
  // base: flat roof slab with parapet
  { const o = BX - 14, x0 = (15 + o) * CELL - 0.2, x1 = (22 + o) * CELL + 0.2, z0 = (15 + o) * CELL - 0.2, z1 = (21 + o) * CELL + 0.2, g = geo('block', chunkOf((18 + o) * CELL, (18 + o) * CELL)), c = [0.62, 0.62, 0.6, 1];
    g.box(x0, CEIL, z0, x1, CEIL + 0.35, z1, MAT9_S.block, 63, c);
    for (const [a0, b0, a1, b1] of [[x0, z0, x1, z0 + 0.25], [x0, z1 - 0.25, x1, z1], [x0, z0, x0 + 0.25, z1], [x1 - 0.25, z0, x1, z1]]) g.box(a0, CEIL + 0.35, b0, a1, CEIL + 0.8, b1, MAT9_S.block, 63, c); }
  // ---- stairwells ----
  { // base: steps down into the dark
    const s = LV.base.stair, x0 = s.x * CELL + WT / 2, x1 = (s.x + 1) * CELL - WT / 2, z0 = s.y * CELL + WT / 2, z1 = (s.y + 1) * CELL - WT / 2, ci = chunkOf(x0, z0), g = geo('labwall', ci), c = [0.7, 0.7, 0.66, 1];
    for (let i = 0; i < 12; i++) { const zz = z0 + i * (z1 - z0) / 12; g.box(x0, -0.25 * (i + 1), zz, x1, -0.25 * i, z1, MAT9_S.labwall, 16 | 4, c); }
    g.face(x0, -3.2, z0, [0, 0, 1], [0, 1, 0], z1 - z0, 3.2, [1, 0, 0], MAT9_S.labwall, false, c);
    g.face(x1, -3.2, z1, [0, 0, -1], [0, 1, 0], z1 - z0, 3.2, [-1, 0, 0], MAT9_S.labwall, false, c);
    g.face(x1, -3.2, z0, [-1, 0, 0], [0, 1, 0], x1 - x0, 3.2, [0, 0, 1], MAT9_S.labwall, false, c);
    g.face(x0, -3.2, z1, [1, 0, 0], [0, 1, 0], x1 - x0, 3.2, [0, 0, -1], MAT9_S.labwall, false, c);
  }
  { // lab: steps up toward a black shaft
    const s = LV.lab.arrive, x0 = s.x * CELL - 0.55, x1 = s.x * CELL + CELL + 0.55, z0 = s.y * CELL + WT / 2, z1 = s.y * CELL + 1.9, ci = chunkOf(x0, z0), g = geo('labwall', ci), c = [0.66, 0.68, 0.68, 1];
    const X0 = s.x * CELL + WT / 2, X1 = (s.x + 1) * CELL - WT / 2;
    for (let i = 0; i < 12; i++) { const zz = z1 - (i + 1) * (z1 - z0) / 12; g.box(X0, 0, zz, X1, 0.24 * (i + 1), zz + (z1 - z0) / 12, MAT9_S.labwall, 16 | 4, c); }
    const dk = [0.25, 0.25, 0.25, 1];
    g.face(X0, CEIL, z0, [0, 0, 1], [0, 1, 0], CELL - WT, 3, [1, 0, 0], 1, false, dk); g.face(X1, CEIL, CELL - WT / 2, [0, 0, -1], [0, 1, 0], CELL - WT, 3, [-1, 0, 0], 1, false, dk);
    g.face(X1, CEIL, z0, [-1, 0, 0], [0, 1, 0], X1 - X0, 3, [0, 0, 1], 1, false, dk); g.face(X0, CEIL + 3, z0, [1, 0, 0], [0, 0, 1], X1 - X0, CELL - WT, [0, -1, 0], 1, false, [0.05, 0.05, 0.05, 1]);
  }
  LV.chunkMeshes = [];
  for (const [k, g] of Object.entries(G)) {
    if (!g.p.length) continue; const [m] = k.split(':');
    const mesh = g.mesh('l9_' + k, scene); mesh.material = mats[m];
    if (['asph', 'grass', 'conc', 'floor', 'tile'].includes(m)) mesh._sortD = 900; else if (m === 'plaster' || m === 'ceil') mesh._sortD = 950; else LV.chunkMeshes.push(mesh);
  }
  // lab / base ceiling fixtures (reuse the troffer look)
  const xg = new Geo(true);
  for (const f of LV.fixtures) {
    if (!f.troffer) continue;
    const col = [f.state === 0 ? 0 : 1, f.state === 2 ? 1 : 0, f.seed, 1], y = CEIL - 0.018, x0 = f.x - 0.6, z0 = f.z - 0.3;
    xg.face(x0, y, z0, [1, 0, 0], [0, 0, 1], 1.2, 0.6, [0, -1, 0], 1, true, col);
  }
  if (xg.p.length) { const fx = xg.mesh('fixtures', scene); fx.material = mats.fixture; fx._sortD = 920; }
}

// a house staircase: the lower flight downstairs (rising into a dark shaft) and the matching well upstairs (steps falling away)
function buildHouseStair9(h, geo, chunkOf) {
  const S = h.stair, U = S.U, Sd = S.S, n = 12, w = 2.9 / n, r = CEIL / n;
  const P = (o, al, lat, y) => [o.cx + U[0] * al + Sd[0] * lat, y, o.cz + U[1] * al + Sd[1] * lat];
  const aabb = (o, a0, a1, l0, l1) => { const p = P(o, a0, l0, 0), q = P(o, a1, l1, 0); return [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]; };
  const WOOD = [0.62, 0.5, 0.4, 1], RAIL = [0.36, 0.24, 0.16, 1], PAP = [...h.paper.map(v => v * 0.55), 1], DARK = [0.04, 0.04, 0.045, 1];
  const box = (g, o, a0, a1, l0, l1, y0, y1, col, mask = 31) => { const [x0, z0, x1, z1] = aabb(o, a0, a1, l0, l1); g.box(x0, y0, z0, x1, y1, z1, 1 / 2.4, mask, col); };
  // inward-facing wall of a vertical well from pA to pB ([along, lat]); cA = a point inside the well
  const well = (g, o, pA, pB, y0, y1, col, s, cA) => {
    const A = P(o, pA[0], pA[1], y0), B = P(o, pB[0], pB[1], y0), c = P(o, cA[0], cA[1], 0);
    const vx = B[0] - A[0], vz = B[2] - A[2], mx = (A[0] + B[0]) / 2, mz = (A[2] + B[2]) / 2;
    if (vz * (c[0] - mx) - vx * (c[2] - mz) > 0) g.quad(A, [A[0], y1, A[2]], B, s, col); else g.quad(B, [B[0], y1, B[2]], A, s, col);
  };
  { // ---- downstairs ----
    const o = S.g, ci = chunkOf(o.cx, o.cz), gw = geo('floor', ci), gp = geo('wallin', ci), gc = geo('case', ci);
    for (let i = 0; i < n; i++) box(gw, o, -1.45 + i * w, 1.8, 0.58, 1.8, i * r, (i + 1) * r, WOOD);
    box(gc, o, -1.45, 1.8, 0.5, 0.58, 0, 0.14, [0.82, 0.8, 0.74, 1]);                    // stringer skirting
    box(gc, o, -1.52, -1.38, 0.5, 0.64, 0, 1.12, RAIL, 63);                                 // newel post
    for (let i = 0; i < n; i += 2) box(gc, o, -1.45 + i * w + w * 0.4, -1.45 + i * w + w * 0.6, 0.53, 0.58, (i + 1) * r, (i + 1) * r + 0.9, [0.85, 0.83, 0.78, 1], 63);
    for (let k = 0; k <= 24; k++) { const t = k / 24, al = -1.45 + 2.9 * t, y = 0.98 + CEIL * t; box(gc, o, al - 0.08, al + 0.08, 0.52, 0.59, y, y + 0.07, RAIL, 63); }
    // the shaft above the ceiling hole
    const y0 = CEIL, y1 = CEIL + 2.6, corners = [[-0.6, 0.58], [1.8, 0.58], [1.8, 1.8], [-0.6, 1.8]];
    for (let k = 0; k < 4; k++) well(gp, o, corners[k], corners[(k + 1) % 4], y0, y1, PAP, 1 / 0.9, [0.6, 1.19]);
    const [x0, z0, x1, z1] = aabb(o, -0.6, 1.8, 0.58, 1.8); geo('case', ci).face(x0, y1, z0, [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, -1, 0], 1, false, DARK);
  }
  { // ---- upstairs ----
    const o = S.u, ci = chunkOf(o.cx, o.cz), gw = geo('floor', ci), gp = geo('wallin', ci), gc = geo('case', ci), yb = -FLH;
    for (let i = 0; i < n; i++) box(gw, o, -1.45 + i * w, -1.45 + (i + 1) * w, 0.6, 1.78, yb + i * r, yb + (i + 1) * r, WOOD, 31);
    const corners = [[-1.8, 0.58], [1.8, 0.58], [1.8, 1.8], [-1.8, 1.8]];
    for (let k = 0; k < 4; k++) well(gp, o, corners[k], corners[(k + 1) % 4], -3.3, 0, PAP, 1 / 0.9, [0, 1.19]);
    const [x0, z0, x1, z1] = aabb(o, -1.8, 1.8, 0.58, 1.8); gc.face(x0, -3.3, z1, [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, [0, 1, 0], 1, false, DARK);
    box(gc, o, -1.8, 1.8, 0.5, 0.62, -0.02, 0.06, [0.82, 0.8, 0.74, 1], 63);                 // floor lip
    // railings: along the free side and across the low end
    box(gc, o, -1.8, 1.25, 0.5, 0.6, 0.94, 1.0, RAIL, 63); box(gc, o, -1.8, -1.7, 0.58, 1.8, 0.94, 1.0, RAIL, 63);
    for (const al of [-1.75, 1.2]) box(gc, o, al - 0.06, al + 0.06, 0.49, 0.61, 0, 1.08, RAIL, 63);
    for (let al = -1.5; al < 1.15; al += 0.3) box(gc, o, al - 0.02, al + 0.02, 0.53, 0.57, 0.06, 0.94, [0.85, 0.83, 0.78, 1], 63);
    for (let l = 0.9; l < 1.75; l += 0.3) box(gc, o, -1.77, -1.73, l - 0.02, l + 0.02, 0.06, 0.94, [0.85, 0.83, 0.78, 1], 63);
  }
}

// ---------- lights (baked into the light map) ----------
function planLights9() {
  LV.fixtures = []; LV.lamps = [];
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  // street lamps: along every street, alternating sides, on the sidewalk edge
  const S = [...L9_ST].sort((a, b) => a - b), lines = [];
  for (let i = 0; i < S.length; i += 2) lines.push(S[i]);   // first cell of each 2-cell street
  let k = 0;
  for (const s of lines) for (const axis of [0, 1]) {
    for (let t = 2; t < L9_NB - 2; t += 4) {
      if (L9_ST.has(t) && axis === 0 && (t % 14 === 1 || t % 14 === 2)) continue;
      const side = (k++ % 2) ? 1 : 0, along = t * CELL + 1.8;
      const across = side ? (s + 2) * CELL - 0.55 : s * CELL + 0.55, reach = side ? -1.25 : 1.25;
      const x = axis === 0 ? along : across, z = axis === 0 ? across : along;
      const hx = axis === 0 ? x : x + reach, hz = axis === 0 ? z + reach : z;
      if (LV.lamps.some(l => Math.hypot(l.hx - hx, l.hz - hz) < 6)) continue;
      const r = RNG(), state = r < 0.66 ? 1 : r < 0.84 ? 2 : 0;
      const lamp = { x, z, hx, hz, state, axis, reach, side, f: null };
      if (state) lamp.f = F(hx, hz, { state, rad: 13, sc: 4.2, I: 0.55, lamp: true });
      LV.lamps.push(lamp);
    }
  }
  // porch lights for lit houses, dim lamps inside
  for (const h of LV.houses) {
    if (!h.lit) continue;
    for (const r of shuffle(h.rooms.filter(r => r.t !== 'bath')).slice(0, 4)) { const c = pick(r.cells); F(cellCenter(c % N), cellCenter((c / N) | 0), { rad: 6.5, sc: 2.2, I: 0.42, state: RNG() < 0.3 ? 2 : 1 }); }
    const [mx, mz] = edgeMid(h.front.x, h.front.y, h.front.d);
    F(mx + DX[h.front.d] * 0.8, mz + DY[h.front.d] * 0.8, { rad: 5, sc: 1.6, I: 0.35 });
  }
  // base & lab: fluorescent troffers
  for (const r of LV.rooms) {
    if (r.bld < 100) continue;
    for (const c of r.cells) {
      const x = c % N, y = (c / N) | 0; if (r.t === 'stair' && y === LV.base.stair.y) continue;
      const lab = r.bld === 101, rr = RNG();
      if (!lab && (x + y) % 2) continue;
      const state = lab ? (rr < 0.75 ? 1 : rr < 0.92 ? 2 : 0) : (rr < 0.35 ? 1 : rr < 0.6 ? 2 : 0);
      F(cellCenter(x), cellCenter(y) + 0.3, { state, troffer: true, I: lab ? 0.46 : 0.5 });
    }
  }
  // the compound's flood light by the gate (dim, flickering)
  F((BX + 4.5) * CELL, (BX + 8.3) * CELL, { rad: 10, sc: 3.5, I: 0.5, state: 2 });
  // sky openness mask (alpha channel): 0 under roofs, 1 outside
  const R = LMR, sky = new Uint8Array(R * R);
  for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
    const x = (i + 0.5) * LMS, z = (j + 0.5) * LMS, c = cIdx(cellOf(x), cellOf(z)); sky[j * R + i] = indoorZ(LV.zone[c]) ? 0 : 255;
  }
  LV.sky = sky;
}
