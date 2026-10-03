// ---------- r8 · Level 37 · Sublimity (the Poolrooms): layout, wall pieces, geometry, lights ----------
// A Scape: the hub is a drowned-looking pool complex (the Shallows, the Lap Pool, the Dive Well, the Cabana, the Pump Room); three
// wings hang off it the way the wiki's exits do: the Lukewarm Hotel (Level 233, by a dim corridor), Wellborn Hospital (Level 130, by
// submersion) and Water World (Level 43, by a dark enclosed tunnel). Floors have their own heights and water is a per-basin plane whose
// level the Pump Room can change, so everything the player touches (depth, breath, wading) is computed from LV.fh and the basin levels.
const Z37 = { VOID: 0, POOL: 1, CABANA: 2, PLANT: 3, TUNNEL: 4, HOTEL: 5, CAFE: 6, HOSP: 7, PARK: 8, DOME: 9, STAFF: 10, BOOTH: 11, VEST: 12, WWF: 13 };
const R37Z = { HUB: 0, HOTEL: 1, HOSP: 2, WW: 3 };
const L37_N = 72, L37_LMR = 1152, DECK37 = 0.14;
const BAS37 = { SH: 0, LAP: 1, WELL: 2, CAFE: 3, HPOOL: 4, WWP: 5, WWF: 6 };
const cell37 = (x, z) => cIdx(cellOf(x), cellOf(z));
const TRIM37 = { white: [0.92, 0.94, 0.94], teal: [0.35, 0.62, 0.66], steel: [0.55, 0.57, 0.58], wood: [0.5, 0.36, 0.22], brass: [0.7, 0.55, 0.26], green: [0.45, 0.62, 0.52], dark: [0.1, 0.1, 0.11] };

// tall slits of blown-out white in the Shallows' side walls, with warm light coming off them (as in the reference renders)
const SLITS37 = [[26, 30, 2], [26, 34, 2], [26, 38, 2], [43, 29, 0], [43, 38, 0], [43, 41, 0]];
function genLayout37() {
  const n = N;
  LV.zone = new Uint8Array(n * n); LV.room = new Int16Array(n * n).fill(-1); LV.reg = new Int8Array(n * n).fill(-1); LV.dark = new Uint8Array(n * n);
  LV.fh = new Float32Array(n * n); LV.bas = new Int8Array(n * n).fill(-1); LV.ch = new Float32Array(n * n);
  LV.hE = new Uint8Array((n + 1) * n); LV.vE = new Uint8Array(n * (n + 1));
  LV.rooms = []; LV.ek = new Map(); LV.navVer = 0; LV.warps = []; LV.halls = []; LV.pillars = []; LV.darkCenters = [];
  LV.basins = Object.keys(BAS37).map(k => ({ id: BAS37[k], name: k, y: 0, tgt: 0, cells: [] }));
  const room = (zone, reg, t, o = {}) => { const r = Object.assign({ id: LV.rooms.length, zone, reg, t, cells: [], h: 3.2, fh: 0 }, o); LV.rooms.push(r); return r; };
  const put = (r, x, y, fh = r.fh) => { const c = cIdx(x, y); LV.room[c] = r.id; LV.zone[c] = r.zone; LV.reg[c] = r.reg; LV.fh[c] = fh; LV.ch[c] = r.rel ? fh + r.h : r.h; r.cells.push(c); };
  const rect = (r, x0, y0, x1, y1, fh) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y, fh); return r; };
  const way = (x, y, d, kind, o = {}) => { const e = Object.assign({ x, y, d, kind }, o); LV.ek.set(eKey(x, y, d), e); return e; };
  const setFh = (x0, y0, x1, y1, fh, bas, ch) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = cIdx(x, y); if (LV.room[c] < 0) continue; const r = LV.rooms[LV.room[c]]; LV.fh[c] = fh; LV.ch[c] = ch !== undefined ? ch : r.rel ? fh + r.h : r.h; if (bas !== undefined) LV.bas[c] = bas; } };
  const water = (r, x0, y0, x1, y1, fh, bas) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = cIdx(x, y); if (LV.room[c] !== r.id) continue; LV.fh[c] = fh; LV.bas[c] = bas; LV.ch[c] = r.rel ? fh + r.h : r.h; } };
  LV.dry = {};   // named rooms the story code looks up
  const SIDE = {
    pool: { m: 'ptw', c: [1, 0.98, 0.92], t: TRIM37.green, tp: 2 }, cab: { m: 'ptw', c: [1, 0.97, 0.86], t: TRIM37.wood, tp: 2 }, plant: { m: 'wetc', c: [0.9, 1, 0.98], t: TRIM37.steel, tp: 1 },
    tun: { m: 'wetc', c: [0.55, 0.65, 0.66], t: TRIM37.dark, tp: 0 }, vest: { m: 'ptw', c: [0.94, 1, 0.9], t: TRIM37.green, tp: 2 },
  };
  // ================= THE HUB =================
  // THE SHALLOWS: a great tiled hall, knee-deep, pillars standing in the water, a pit at the south end that drops to the corridor below
  const SH = room(Z37.POOL, R37Z.HUB, 'shallows', { h: 7.4, side: SIDE.pool, flr: { m: 'ptile', col: [0.94, 1, 0.9] }, cm: 'ptile', cc: [0.94, 1, 0.88] });
  rect(SH, 26, 27, 43, 43, DECK37); water(SH, 27, 28, 42, 42, -0.55, BAS37.SH);
  water(SH, 32, 38, 37, 42, -1.45, BAS37.SH); water(SH, 33, 39, 36, 42, -2.4, BAS37.SH);
  for (let x = 33; x <= 36; x++) { const c = cIdx(x, 43); LV.fh[c] = -2.4; LV.bas[c] = BAS37.SH; }   // the pit runs to the south wall, where the corridor starts
  LV.dry.sh = SH;
  LV.pil37 = [];   // round tiled columns standing in the water
  for (let y = 30; y <= 41; y += 4) for (let x = 29 + ((y - 30) / 4 % 2) * 2; x <= 40; x += 4) { if (x >= 30 && x <= 38 && y >= 37) continue; if (x >= 33 && x <= 37 && y >= 38) continue; LV.pil37.push({ x: cellCenter(x), z: cellCenter(y), r: 0.66, fh: -0.55, top: SH.h }); }
  // the vestibule between the Shallows and the Dive Well
  const GV = rect(room(Z37.VEST, R37Z.HUB, 'gatev', { h: 3.8, side: SIDE.vest, flr: { m: 'ptile', col: [0.9, 0.98, 0.88] }, cm: 'ptile', cc: [0.94, 1, 0.88] }), 34, 26, 36, 26, DECK37);
  way(35, 27, 3, 'arch', { w: 2.6, h: 3.0, from: [35, 27], sign: 'DEEP END' }); way(35, 26, 3, 'arch', { w: 2.6, h: 3.0, from: [35, 26] });
  // THE DIVE WELL: twelve metres to the ceiling, six to the floor
  const WELL = room(Z37.POOL, R37Z.HUB, 'well', { h: 12.8, side: SIDE.pool, flr: { m: 'ptile', col: [0.86, 1, 0.88] }, cm: 'ptile', cc: [0.94, 1, 0.88] });
  rect(WELL, 30, 13, 41, 25, DECK37); water(WELL, 31, 14, 40, 24, -6, BAS37.WELL);
  water(WELL, 31, 24, 40, 24, -1.1, BAS37.WELL); water(WELL, 31, 23, 40, 23, -2.7, BAS37.WELL); water(WELL, 31, 22, 40, 22, -4.3, BAS37.WELL);
  setFh(30, 19, 30, 19, -6, BAS37.WELL);   // the channel that leads into the tunnel
  LV.dry.well = WELL; LV.tower = { x: 30, y: 16, top: 10 };
  setFh(30, 16, 30, 16, 10, -1);          // the ten-metre tower is a solid block with a platform on top
  // THE DIVE-WELL BOOTH: the lifeguards' control booth
  const BOOTH = rect(room(Z37.BOOTH, R37Z.HUB, 'booth', { h: 3.0, side: { m: 'cab', c: [1, 0.95, 0.85], t: TRIM37.wood, tp: 1 }, flr: { m: 'wood', col: [0.9, 0.85, 0.78] }, cm: 'kceil', cc: [1, 0.98, 0.94] }), 42, 16, 45, 21, DECK37);
  way(41, 18, 0, 'door', { dk: 'booth', plaque: 'LIFEGUARD', from: [41, 18] });
  LV.dry.booth = BOOTH;
  // THE CABANA: changing rooms, the dry place
  const CAB = rect(room(Z37.CABANA, R37Z.HUB, 'cabana', { h: 3.2, side: SIDE.cab, flr: { m: 'wood', col: [0.96, 0.9, 0.8] }, cm: 'kceil', cc: [1, 0.98, 0.94] }), 20, 31, 25, 38, DECK37);
  way(26, 35, 2, 'door', { dk: 'cabana', plaque: 'CABANA', from: [26, 35] });
  LV.dry.cab = CAB;
  // THE PUMP ROOM
  const PLANT = rect(room(Z37.PLANT, R37Z.HUB, 'plant', { h: 4.6, side: SIDE.plant, flr: { m: 'wetc', col: [0.85, 0.95, 0.95] }, cm: 'plaster', cc: [0.5, 0.56, 0.56] }), 8, 29, 19, 38, DECK37);
  way(20, 34, 2, 'door', { dk: 'plant', plaque: 'PLANT · STAFF ONLY', from: [20, 34], locked: true });
  LV.dry.plant = PLANT;
  // THE LAP POOL: six lanes to the east, a flooded tunnel at the far end
  const LAP = room(Z37.POOL, R37Z.HUB, 'lap', { h: 6.4, side: SIDE.pool, flr: { m: 'lane', col: [0.9, 1, 0.9] }, cm: 'ptile', cc: [0.94, 1, 0.88] });
  rect(LAP, 45, 31, 65, 38, DECK37); water(LAP, 46, 32, 65, 37, -1.5, BAS37.LAP);
  LV.dry.lap = LAP;
  const LV37 = rect(room(Z37.VEST, R37Z.HUB, 'lapv', { h: 3.6, side: SIDE.vest, flr: { m: 'ptile', col: [0.9, 0.98, 0.88] }, cm: 'ptile', cc: [0.94, 1, 0.88] }), 44, 33, 44, 34, DECK37);
  way(43, 33, 0, 'arch', { w: 2.4, h: 3.0, from: [43, 33], sign: 'LAP POOL' }); way(43, 34, 0, 'arch', { w: 2.4, h: 3.0, from: [43, 34] });
  way(44, 33, 0, 'arch', { w: 2.4, h: 3.0, from: [44, 33] }); way(44, 34, 0, 'arch', { w: 2.4, h: 3.0, from: [44, 34] });
  // the tunnel to Water World: low, dark, entirely under the surface until the lap pool is drained
  const TW = room(Z37.TUNNEL, R37Z.WW, 'tunnelW', { rel: true, h: 1.15, side: SIDE.tun, flr: { m: 'wetc', col: [0.6, 0.7, 0.7] }, cm: 'bconc', cc: [0.5, 0.58, 0.58] });
  rect(TW, 66, 34, 69, 34, -1.5); rect(TW, 69, 35, 69, 40, -1.5);
  for (const [x, y] of [[66, 34], [67, 34], [68, 34], [69, 34], [69, 35], [69, 36], [69, 37], [69, 38], [69, 39], [69, 40]]) { const c = cIdx(x, y); LV.bas[c] = BAS37.LAP; LV.dark[c] = 1; }
  for (const [x, y] of [[68, 34], [69, 37]]) LV.ch[cIdx(x, y)] = 1.6;   // air bells: a head-high pocket under the roof where you can breathe
  way(65, 34, 0, 'arch', { w: 1.8, h: 2.3, from: [65, 34], tunnel: true, sign: '' });
  LV.dry.tw = TW;
  // the corridor under the Shallows' pit, to the hotel
  const HC = room(Z37.TUNNEL, R37Z.HOTEL, 'hcorr', { rel: true, h: 3.0, side: SIDE.tun, flr: { m: 'wetc', col: [0.6, 0.7, 0.7] }, cm: 'bconc', cc: [0.4, 0.46, 0.46] });
  rect(HC, 34, 44, 35, 47, -2.4);
  setFh(34, 46, 35, 46, -1.6); setFh(34, 47, 35, 47, -0.8);   // (the hotel lobby is at y 48 and above)
  way(34, 43, 1, 'arch', { w: 2.0, h: 2.7, from: [34, 43], hcorr: true }); way(35, 43, 1, 'arch', { w: 2.0, h: 2.7, from: [35, 43] });
  LV.dry.hc = HC;
  // the flooded tunnel from the Dive Well to the hospital
  const TH = room(Z37.TUNNEL, R37Z.HOSP, 'tunnelH', { rel: true, h: 1.2, side: SIDE.tun, flr: { m: 'wetc', col: [0.6, 0.7, 0.7] }, cm: 'bconc', cc: [0.5, 0.58, 0.58] });
  rect(TH, 24, 19, 29, 19, -6); rect(TH, 24, 14, 24, 18, -6);
  for (let c = 0; c < TH.cells.length; c++) { const cc = TH.cells[c]; LV.bas[cc] = BAS37.WELL; LV.dark[cc] = 1; }
  for (const [x, y] of [[27, 19], [24, 16]]) LV.ch[cIdx(x, y)] = 1.5;   // air bells (absolute ceiling height): the roof lifts to 1.5 m above the surface
  way(30, 19, 2, 'arch', { w: 1.8, h: 2.3, from: [30, 19], tunnel: true });
  LV.dry.th = TH;
  planHotel37(room, rect, way, setFh, water, SIDE);
  planHospital37(room, rect, way, setFh, water, SIDE);
  planWorld37(room, rect, way, setFh, water, SIDE);
  // ---- resolve every edge: a wall between two different rooms, nothing inside a room ----
  const rule = (a, b) => {
    const za = a < 0 ? 0 : LV.zone[a], zb = b < 0 ? 0 : LV.zone[b];
    if (!za || !zb) return 1;
    return LV.room[a] >= 0 && LV.room[a] === LV.room[b] ? 0 : 1;
  };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) LV.hE[hI(x, y)] = rule(y > 0 ? cIdx(x, y - 1) : -1, y < n ? cIdx(x, y) : -1);
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) LV.vE[vI(x, y)] = rule(x > 0 ? cIdx(x - 1, y) : -1, x < n ? cIdx(x, y) : -1);
  const EV = { arch: 2, door: 2, open: 0 };
  for (const e of LV.ek.values()) setEdge(e.x, e.y, e.d, EV[e.kind] ?? 2);
  // the basins' cells, and a few that are simply open between rooms
  for (let c = 0; c < n * n; c++) if (LV.bas[c] >= 0) LV.basins[LV.bas[c]].cells.push(c);
  LV.spawn = { x: 35, y: 31 };
}

// ---------- wall pieces ----------
function side37(x, y) {
  if (!inGrid(x, y)) return null;
  const c = cIdx(x, y), z = LV.zone[c]; if (z === Z37.VOID) return null;
  const r = LV.rooms[LV.room[c]], s = r.side || { m: 'ptw', c: [1, 1, 1], t: TRIM37.white, tp: 1 };
  return { m: s.m, c: s.c, t: s.t, tp: s.tp, h: LV.ch[c], fh: LV.fh[c] };
}
const ceil37 = c => LV.ch[c];
// arch / door heights are given above the floor of the cell they open from; the wall-piece builder wants absolute heights
function opening37(e) {
  if (!e) return null;
  const f = e.from ? LV.fh[cIdx(e.from[0], e.from[1])] : 0;
  if (e.kind === 'arch') return { w: e.w || 2.0, h: f + (e.h || 2.5), cw: 0 };
  if (e.kind === 'door') return { w: DOORW, h: f + DOORH, cw: 0.09 };
  return null;
}

// ---------- geometry ----------
const MAT37_S = { ptile: [1 / 1.2, 1 / 1.2], ptw: [1 / 1.2, 1 / 1.2], lane: [1 / 1.2, 1 / 1.2], wetc: [1 / 2.4, 1 / 2.4], wood: [1 / 2.4, 1 / 2.4], hwall: [1 / 3.0, 1 / 2.85], carpet: 1 / 2.25, hceil: 1 / 1.8, plaster: [1 / 2.5, 1 / 2.5], bconc: [1 / 2.4, 1 / 2.4],
  block: [1 / 1.6, 1 / 1.6], brick: [1 / 1.6, 1 / 1.6], lino: [1 / 1.2, 1 / 1.2], kceil: [1 / 1.2, 1 / 1.2], conc: [1 / 2.8, 1 / 2.8], paper: [1 / 0.9, 1 / 2.4] };
const FLOORM37 = new Set(['ptile', 'lane', 'wetc', 'wood', 'carpet', 'lino', 'conc']), CEILM37 = new Set(['plaster', 'hceil', 'bconc', 'kceil']);
function buildGeometry37(scene, mats) {
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
    let lowY = 1e9, topY = 0;
    for (const [sd, sg] of [[p.sa, -1], [p.sb, 1]]) {
      if (!sd) continue;
      const [su, sv] = MAT37_S[sd.m] || [1, 1], g = geo(sd.m, ci), from = p.k === 'l' ? Math.max(p.y0, sd.fh) : sd.fh;
      if (p.horiz) vq(g, sg < 0 ? 3 : 1, sg < 0 ? p.z0 : p.z1, p.x0, p.x1, from, sd.h, su, sv, C4(sd.c));
      else vq(g, sg < 0 ? 2 : 0, sg < 0 ? p.x0 : p.x1, p.z0, p.z1, from, sd.h, su, sv, C4(sd.c));
      lowY = Math.min(lowY, sd.fh); topY = Math.max(topY, sd.h);
    }
    if (p.k === 'w') {
      const lo = p.horiz ? p.z0 : p.x0, hi = p.horiz ? p.z1 : p.x1;
      if (p.cap0) vq(tg, p.horiz ? 2 : 3, p.a0, lo, hi, lowY, p.capH0 ?? topY, 1, 1, tcol);
      if (p.cap1) vq(tg, p.horiz ? 0 : 1, p.a1, lo, hi, lowY, p.capH1 ?? topY, 1, 1, tcol);
    } else tg.face(p.x0, p.y0, p.z0, [1, 0, 0], [0, 0, 1], p.x1 - p.x0, p.z1 - p.z0, [0, -1, 0], 1, false, tcol);
  }
  for (const t of LV.trims) geo('trim', chunkOf((t[0] + t[3]) / 2, (t[2] + t[5]) / 2)).box(t[0], t[1], t[2], t[3], t[4], t[5], 1, 31, C4(t[6]));
  // ---- round arches (a half-circle on top of the jambs) and round tiled columns, built straight into the tile meshes ----
  const tri = (g, A, B2, C2, n, su, sv, uvs) => { const b0 = g.p.length / 3; for (const [p, uv] of [[A, uvs[0]], [B2, uvs[1]], [C2, uvs[2]]]) { g.p.push(p[0], p[1], p[2]); g.n.push(n[0], n[1], n[2]); g.t.push(1, 0, 0, 1); g.uv.push(uv[0], uv[1]); g.c.push(...n.slice(3)); } g.i.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 1); };
  for (const e of LV.ek.values()) {
    if (e.kind !== 'arch') continue;
    const op = opening37(e), horiz = e.d === 1 || e.d === 3, [mx, mz] = edgeMid(e.x, e.y, e.d), m = horiz ? mx : mz, c = horiz ? mz : mx, w = op.w, hT = op.h, f0 = LV.fh[cIdx(e.x, e.y)], r = Math.min(w / 2, (hT - f0) * 0.5), ys = hT - r, Hh = WT / 2;
    const sA = (e.d === 0 || e.d === 1) ? -1 : 1, cA = cIdx(e.x, e.y), cB = cIdx(e.x + DX[e.d], e.y + DY[e.d]);
    const W3 = (u, y, q) => horiz ? [u, y, q] : [q, y, u], N3 = s => horiz ? [0, 0, s] : [s, 0, 0];
    const arc = [], NS = 14; for (let k = 0; k <= NS; k++) { const th = Math.PI - k / NS * Math.PI; arc.push([m + Math.cos(th) * w / 2, ys + Math.sin(th) * r, th]); }
    for (const [cell, sg] of [[cA, sA], [cB, -sA]]) {   // the wall face looking into this cell: spandrel fill between the jamb corners and the arc
      const sd = side37(cell % N, (cell / N) | 0); if (!sd) continue; const [su, sv] = MAT37_S[sd.m] || [1, 1], g = geo(sd.m, chunkOf(mx, mz)), q = c + sg * Hh, nn = N3(sg), col = [sd.c[0], sd.c[1], sd.c[2], 1];
      for (const [side, ia, ib] of [[-1, 0, NS / 2], [1, NS / 2, NS]]) {
        const corner = side < 0 ? [m - w / 2, hT] : [m + w / 2, hT];
        for (let k = ia; k < ib; k++) { const A = arc[k], B2 = arc[k + 1]; tri(g, W3(corner[0], corner[1], q), W3(A[0], A[1], q), W3(B2[0], B2[1], q), nn.concat(col), su, sv, [[corner[0] * su, corner[1] * sv], [A[0] * su, A[1] * sv], [B2[0] * su, B2[1] * sv]]); }
        // fill the strip between the arc's top and the flat top of the opening on the mid column
      }
      // the little triangle above the arc's crown, between the two halves
    }
    // the soffit: the inside of the arch, running through the wall
    { const sd = side37(cA % N, (cA / N) | 0) || side37(cB % N, (cB / N) | 0), [su, sv] = MAT37_S[sd.m] || [1, 1], g = geo(sd.m, chunkOf(mx, mz)), col = [sd.c[0] * 0.92, sd.c[1] * 0.92, sd.c[2] * 0.92, 1];
      for (let k = 0; k < NS; k++) { const A = arc[k], B2 = arc[k + 1], nA = [-Math.cos(A[2]), -Math.sin(A[2])], nm = horiz ? [nA[0], nA[1], 0] : [0, nA[1], nA[0]];
        const p00 = W3(A[0], A[1], c - Hh), p01 = W3(A[0], A[1], c + Hh), p10 = W3(B2[0], B2[1], c - Hh), p11 = W3(B2[0], B2[1], c + Hh), uA = k / NS * 3, uB = (k + 1) / NS * 3;
        tri(g, p00, p01, p10, nm.concat(col), su, sv, [[uA, 0], [uA, 1.2], [uB, 0]]); tri(g, p01, p11, p10, nm.concat(col), su, sv, [[uA, 1.2], [uB, 1.2], [uB, 0]]); } }
  }
  for (const P of LV.pil37 || []) {   // round columns
    const g = geo('ptw', chunkOf(P.x, P.z)), NSG = 22, col = [0.96, 1, 0.9, 1];
    for (let k = 0; k < NSG; k++) { const a0 = k / NSG * TAU, a1 = (k + 1) / NSG * TAU, x0 = P.x + Math.sin(a0) * P.r, z0 = P.z + Math.cos(a0) * P.r, x1 = P.x + Math.sin(a1) * P.r, z1 = P.z + Math.cos(a1) * P.r, u0 = a0 * P.r * (1 / 1.2), u1 = a1 * P.r * (1 / 1.2), v0 = P.fh / 1.2, v1 = P.top / 1.2;
      const n0 = [Math.sin(a0), 0, Math.cos(a0)], n1 = [Math.sin(a1), 0, Math.cos(a1)], b0 = g.p.length / 3;
      for (const [x, y, z, n, u, v] of [[x0, P.fh, z0, n0, u0, v0], [x1, P.fh, z1, n1, u1, v0], [x1, P.top, z1, n1, u1, v1], [x0, P.top, z0, n0, u0, v1]]) { g.p.push(x, y, z); g.n.push(n[0], 0, n[2]); g.t.push(Math.cos((a0 + a1) / 2), 0, -Math.sin((a0 + a1) / 2), 1); g.uv.push(u, v); g.c.push(...col); }
      g.i.push(b0, b0 + 1, b0 + 2, b0, b0 + 2, b0 + 3, b0, b0 + 2, b0 + 1, b0, b0 + 3, b0 + 2); }
  }
  // ---- floors, ceilings and the risers between floors of different heights ----
  const up = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z1, [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, [0, 1, 0], s, false, col);
  const dn = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z0, [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, -1, 0], s, false, col);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y), z = LV.zone[c]; if (z === Z37.VOID) continue;
    const r = LV.rooms[LV.room[c]], x0 = x * CELL, z0 = y * CELL, x1 = x0 + CELL, z1 = z0 + CELL, ci = chunkOf(x0 + 1, z0 + 1), fh = LV.fh[c], hv = hash1(x * 31.7 + y * 17.3);
    const fm = r.flr ? r.flr.m : 'ptile', fc = r.flr ? r.flr.col : [1, 1, 1], k = 0.94 + 0.08 * hv, fs = MAT37_S[fm];
    const wet = LV.bas[c] >= 0 && fh < -0.3;   // a submerged floor is a shade bluer and darker
    { const col = wet ? [fc[0] * 0.6 * k, fc[1] * 0.88 * k, fc[2] * 0.7 * k, 1] : [fc[0] * k, fc[1] * k, fc[2], 1]; up(geo(fm, ci), x0, z0, x1, z1, fh, Array.isArray(fs) ? fs[0] : fs, col); }
    const cm = r.cm || 'plaster', cs = MAT37_S[cm], cc = r.cc || [1, 1, 1], ceilY = ceil37(c);
    if (!r.open) dn(geo(cm, ci), x0, z0, x1, z1, ceilY, Array.isArray(cs) ? cs[0] : cs, C4(cc));
    // risers toward the lower neighbour (east and south) where the way is open
    for (const d of [0, 1]) {
      const nx = x + DX[d], ny = y + DY[d]; if (!inGrid(nx, ny)) continue;
      const n = cIdx(nx, ny); if (LV.zone[n] === Z37.VOID || edgeVal(x, y, d) !== 0) continue;
      const fn = LV.fh[n], dh = fh - fn; if (Math.abs(dh) < 0.004) continue;
      const hi = dh > 0 ? c : n, lo = dh > 0 ? n : c, top = Math.max(fh, fn), bot = Math.min(fh, fn), rr = LV.rooms[LV.room[hi]], rm = rr.flr ? rr.flr.m : 'ptile', rs = MAT37_S[rm], rcol = rr.flr ? rr.flr.col : [1, 1, 1];
      const g = geo(rm, ci), su = Array.isArray(rs) ? rs[0] : rs, sv = Array.isArray(rs) ? rs[1] : rs, col = [rcol[0] * 0.86, rcol[1] * 0.9, rcol[2] * 0.92, 1];
      if (d === 0) { const q = x1; vq(g, dh > 0 ? 0 : 2, q, z0, z1, bot, top, su, sv, col); }
      else { const q = z1; vq(g, dh > 0 ? 1 : 3, q, x0, x1, bot, top, su, sv, col); }
    }
  }
  LV.chunkMeshes = [];
  for (const [k, g] of Object.entries(G)) {
    if (!g.p.length) continue; const [m] = k.split(':');
    const mesh = g.mesh('l37_' + k, scene); mesh.material = mats[m] || mats.ptile;
    if (FLOORM37.has(m)) mesh._sortD = 900; else if (CEILM37.has(m)) mesh._sortD = 950; else LV.chunkMeshes.push(mesh);
  }
}

// ---------- water: one merged plane per basin, moved up and down with the basin's level ----------
function buildWater37(scene, mat) {
  LV.waterMeshes = [];
  for (const B of LV.basins) {
    if (!B.cells.length) continue;
    const g = new Geo(true);
    for (const c of B.cells) { const x0 = (c % N) * CELL, z0 = ((c / N) | 0) * CELL; g.face(x0, 0, z0 + CELL, [1, 0, 0], [0, 0, -1], CELL, CELL, [0, 1, 0], 1, true, [1, 1, 1, 1]); }
    const m = g.mesh('water37_' + B.name, scene); m.material = mat; m.position.y = B.y; m.isPickable = false; m.alphaIndex = 5; m._sortD = 100; m.__noPortal = true; B.mesh = m; LV.waterMeshes.push(m);
  }
}
// where is the water, and how deep is it here?
function waterY37(x, z) { const b = LV.bas[cell37(x, z)]; return b >= 0 ? LV.basins[b].y : -99; }
function floorY37(x, z) { return LV.fh[cell37(x, z)]; }
function depth37(x, z) { const c = cell37(x, z), b = LV.bas[c]; return b < 0 ? 0 : Math.max(0, LV.basins[b].y - LV.fh[c]); }

// ---------- lights (baked): soft, even, a little too perfect ----------
function planLights37() {
  LV.fixtures = []; LV.panels = []; LV.bulbs = [];
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  const grid = (r, step, o = {}) => {   // a regular grid of ceiling lights over a room's cells
    const xs = r.cells.map(c => c % N), ys = r.cells.map(c => (c / N) | 0), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    for (let y = y0 + (o.oy ?? 0); y <= y1; y += step) for (let x = x0 + (o.ox ?? 0); x <= x1; x += step) { const c = cIdx(x, y); if (LV.room[c] !== r.id) continue; const st = o.flick && RNG() < o.flick ? 2 : 1;
      F(cellCenter(x), cellCenter(y), { I: o.I ?? 0.5, rad: o.rad ?? 12, sc: o.sc ?? 4, state: st }); LV.panels.push({ x: cellCenter(x), z: cellCenter(y), y: ceil37(c), state: st, w: o.w ?? 1.1, l: o.l ?? 2.2 }); }
  };
  for (const [x, y, d] of SLITS37) { const [mx, mz] = edgeMid(x, y, d); F(mx - DX[d] * 1.4, mz - DY[d] * 1.4, { I: 0.8, rad: 12, sc: 3.4 }); }
  grid(LV.dry.sh, 5, { I: 0.38, rad: 18, sc: 6, ox: 2, oy: 1, w: 1.4, l: 1.4 });
  grid(LV.dry.well, 5, { I: 0.42, rad: 18, sc: 6, ox: 1, oy: 1, w: 1.4, l: 1.4 });
  grid(LV.dry.lap, 4, { I: 0.4, rad: 15, sc: 5, ox: 1, oy: 1, w: 1.2, l: 1.2 });
  for (const r of LV.rooms) if (r.t === 'gatev' || r.t === 'lapv') for (const c of r.cells) F(cellCenter(c % N), cellCenter((c / N) | 0), { I: 0.45, rad: 7, sc: 2.2 });
  grid(LV.dry.cab, 2, { I: 0.5, rad: 8, sc: 3, w: 0.7, l: 1.3, flick: 0.12 });
  grid(LV.dry.plant, 3, { I: 0.7, rad: 10, sc: 3, w: 0.5, l: 1.3, flick: 0.08 });
  grid(LV.dry.booth, 2, { I: 0.45, rad: 7, sc: 2.5, w: 0.7, l: 1.3 });
  for (const r of LV.rooms) if (r.t === 'hcorr') for (const c of r.cells) F(cellCenter(c % N), cellCenter((c / N) | 0), { I: 0.5, rad: 8, sc: 2.4, state: 1 });
  for (const r of LV.rooms) if (r.t === 'tunnelH' || r.t === 'tunnelW') for (const c of r.cells) if (RNG() < 0.35) F(cellCenter(c % N), cellCenter((c / N) | 0), { I: 0.2, rad: 4.5, sc: 1.3, state: RNG() < 0.4 ? 2 : 1 });
  lightHotel37(F, grid); lightHospital37(F, grid); lightWorld37(F, grid);
  LV.sky = null;
}
