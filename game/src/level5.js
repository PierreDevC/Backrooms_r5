// ---------- Level 5 · The Hotel: layout (hotel wings, Beverly Room, boiler maze), wall pieces, geometry, lights ----------
const Z5 = { VOID: 0, HALL: 1, ROOM: 2, BEV: 3, SERV: 4, BOIL: 5, BHALL: 6, VEST: 7, CLOS: 8, LOBBY: 9, ELEV: 10, STAIR: 11 };
const R5 = { S: 0, W: 1, N: 2, E: 3, E2: 4, BEV: 5, SV: 6, BO: 7 };
const L5_N = 44, L5_LMR = 704, BEV_H = 7.0, BEV5 = { x0: 14, z0: 14, x1: 19, z1: 19 };
const LOOP5 = { z: 16, x0: 20, x1: 40, trig: 29, back: 5 };      // the endless east corridor: pass x = 29 and you are quietly moved back 5 cells (everything there repeats every 5 cells)
const hotelZ5 = z => z === Z5.HALL || z === Z5.ROOM || z === Z5.VEST || z === Z5.LOBBY || z === Z5.ELEV;
const boilZ5 = z => z === Z5.BOIL || z === Z5.BHALL;
const cell5 = (x, z) => cIdx(cellOf(x), cellOf(z));
const zone5 = (x, z) => LV.zone[cell5(x, z)];
const reg5 = (x, z) => LV.reg[cell5(x, z)];
const TINT5 = [[1, 1, 1], [0.86, 1, 0.84], [1, 0.84, 0.8], [0.84, 0.9, 1.06], [1, 0.95, 0.86]];

function genLayout5() {
  const n = N;
  LV.zone = new Uint8Array(n * n); LV.room = new Int16Array(n * n).fill(-1); LV.reg = new Int8Array(n * n).fill(-1); LV.dark = new Uint8Array(n * n);
  LV.hE = new Uint8Array((n + 1) * n); LV.vE = new Uint8Array(n * (n + 1));
  LV.rooms = []; LV.ek = new Map(); LV.navVer = 0; LV.warps = []; LV.maze = new Set(); LV.mazeOpen = new Set(); LV.halls = []; LV.pillars = []; LV.darkCenters = [];
  const room = (zone, reg, t, o = {}) => { const r = Object.assign({ id: LV.rooms.length, zone, reg, t, cells: [] }, o); LV.rooms.push(r); return r; };
  const put = (r, x, y, zone = r.zone) => { const c = cIdx(x, y); LV.room[c] = r.id; LV.zone[c] = zone; LV.reg[c] = r.reg; r.cells.push(c); };
  const rect = (r, x0, y0, x1, y1, zone) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y, zone); return r; };
  const way = (x, y, d, kind, o = {}) => { const e = Object.assign({ x, y, d, kind }, o); LV.ek.set(eKey(x, y, d), e); return e; };
  LV.bev = rect(room(Z5.BEV, R5.BEV, 'bev'), BEV5.x0, BEV5.z0, BEV5.x1, BEV5.z1);
  // south wing: elevator car, lobby, corridor up to the Beverly Room
  const S = room(Z5.HALL, R5.S, 'hall', { wing: 'S' }); rect(S, 16, 20, 16, 26); rect(S, 15, 27, 17, 28, Z5.LOBBY);
  LV.car = rect(room(Z5.ELEV, R5.S, 'elev'), 16, 29, 16, 29);
  way(16, 28, 1, 'elev'); way(16, 19, 1, 'arch', { sign: 'LOBBY', from: [16, 19] });
  // west wing (L-shaped, its far leg is dark)
  const Wg = room(Z5.HALL, R5.W, 'hall', { wing: 'W' }); rect(Wg, 5, 16, 13, 16); rect(Wg, 5, 17, 5, 26);
  way(13, 16, 0, 'arch', { sign: 'WEST WING', from: [14, 16] });
  const cW = rect(room(Z5.CLOS, R5.W, 'closet', { key: 'W' }), 5, 27, 5, 27); way(5, 26, 1, 'door', { dk: 'closet', plaque: 'HOUSEKEEPING', from: [5, 26] });
  // north wing (a T; the west arm is dark)
  const Ng = room(Z5.HALL, R5.N, 'hall', { wing: 'N' }); rect(Ng, 16, 6, 16, 13); rect(Ng, 9, 5, 23, 5);
  way(16, 13, 1, 'arch', { sign: 'NORTH WING', from: [16, 14] });
  const cN = rect(room(Z5.CLOS, R5.N, 'closet', { key: 'N' }), 24, 5, 24, 5); way(23, 5, 0, 'door', { dk: 'closet', plaque: 'HOUSEKEEPING', from: [23, 5] });
  // east wing: the corridor that never ends
  const E = room(Z5.HALL, R5.E, 'hall', { wing: 'E', loop: true }); rect(E, LOOP5.x0, LOOP5.z, LOOP5.x1, LOOP5.z);
  way(19, 16, 0, 'arch', { sign: 'EAST WING', from: [19, 16] });
  // ...and the part of the east wing you can only reach through the wrong door
  const E2 = room(Z5.HALL, R5.E2, 'hall', { wing: 'E2' }); rect(E2, 28, 7, 34, 7);
  const cE = rect(room(Z5.CLOS, R5.E2, 'closet', { key: 'E' }), 35, 7, 35, 7); way(34, 7, 0, 'door', { dk: 'closet', plaque: 'HOUSEKEEPING', from: [34, 7] });
  // warp vestibules: identical one-cell rooms with a real door in and a dummy door opposite; walk past the middle and you are in the twin
  const vest = (x, y, d, reg, sign) => {
    const r = rect(room(Z5.VEST, reg, 'vest'), x, y, x, y);
    way(x, y, d, 'door', { dk: 'warp', sign, from: [x + DX[d], y + DY[d]] }); way(x, y, (d + 2) % 4, 'deco', { from: [x, y], vest: true });
    Object.assign(r, { vx: x, vy: y, vd: d, cx: cellCenter(x), cz: cellCenter(y), fx: -DX[d], fz: -DY[d] }); return r;
  };
  LV.warps.push({ a: vest(8, 5, 0, R5.N, 'EAST WING'), b: vest(27, 7, 0, R5.E2, 'NORTH WING'), key: 'A' });
  LV.warps.push({ a: vest(9, 17, 3, R5.W, 'LOBBY'), b: vest(15, 24, 0, R5.S, 'WEST WING'), key: 'B' });
  // staff corridor + service stairs down (the stair cell descends south)
  LV.sv = rect(room(Z5.SERV, R5.SV, 'serv'), 18, 20, 19, 20); put(LV.sv, 19, 21, Z5.STAIR); LV.svStair = { x: 19, y: 21 };
  way(18, 19, 1, 'door', { dk: 'service', plaque: 'STAFF ONLY', from: [18, 19] });
  // dark stretches (no working sconces, where the moths nest)
  for (let y = 20; y <= 26; y++) LV.dark[cIdx(5, y)] = 1;
  for (let x = 9; x <= 13; x++) LV.dark[cIdx(x, 5)] = 1;
  for (let x = 28; x <= 34; x++) LV.dark[cIdx(x, 7)] = 1;
  LV.dark[cIdx(8, 5)] = 0;
  // guest rooms and dummy doors along every corridor
  const freeH = (x, y) => inGrid(x, y) && x >= 1 && y >= 1 && x <= n - 2 && y <= 30 && LV.zone[cIdx(x, y)] === Z5.VOID;
  const numB = { S: 501, W: 521, N: 541, E2: 581 }, pIn = { S: 0.34, W: 0.36, N: 0.34, E2: 0.4 };
  LV.guest = [];
  for (const C of [S, Wg, Ng, E, E2]) {
    for (const c of C.cells.slice()) {
      if (LV.zone[c] === Z5.LOBBY) continue;
      const x = c % n, y = (c / n) | 0;
      for (const d of [3, 1, 2, 0]) {
        const x1 = x + DX[d], y1 = y + DY[d];
        if (!freeH(x1, y1) || LV.ek.has(eKey(x, y, d))) continue;
        if (C.loop) { if (d === 0 || d === 2) continue; const k = (x - LOOP5.x0) % 5; way(x, y, d, 'deco', { from: [x, y], num: 561 + k + (d === 1 ? 10 : 0), loop: true }); continue; }
        if (RNG() > 0.86) continue;
        const num = numB[C.wing]++;
        const x2 = x1 + DX[d], y2 = y1 + DY[d], deep = freeH(x2, y2);
        if (RNG() < pIn[C.wing] && LV.guest.filter(g => g.reg === C.reg).length < 6) {
          const g = room(Z5.ROOM, C.reg, 'guest', { num, tint: pick(TINT5), dark: LV.dark[c] === 1, door: { x, y, d } });
          put(g, x1, y1); if (deep) put(g, x2, y2); if (g.dark) g.cells.forEach(q => LV.dark[q] = 1);
          LV.guest.push(g); way(x, y, d, 'door', { dk: 'room', num, from: [x, y] });
        } else way(x, y, d, 'deco', { from: [x, y], num });
      }
    }
  }
  // Beverly Room: a ring of doors, almost all of them false (locked, or bricked up behind)
  const perim = [];
  for (let i = BEV5.x0; i <= BEV5.x1; i++) { perim.push([i, BEV5.z0, 3], [i, BEV5.z1, 1]); perim.push([BEV5.x0, i, 2], [BEV5.x1, i, 0]); }
  let nb = 0, nd = 0;
  for (const [x, y, d] of shuffle(perim)) {
    if (LV.ek.has(eKey(x, y, d))) continue;
    if ((d === 3 && y === BEV5.z0 && (x === 17 || x === 18)) || (d === 2 && x === BEV5.x0 && y >= 18)) continue;   // bandstand + bar walls
    const ox = x + DX[d], oy = y + DY[d], behind = inGrid(ox, oy) ? LV.zone[cIdx(ox, oy)] : Z5.VOID;
    if (behind === Z5.VOID && nb < 4) { way(x, y, d, 'brick', { from: [x, y] }); nb++; }
    else if (nd < 8) { way(x, y, d, 'deco', { from: [x, y], bev: true }); nd++; }
  }
  // ---- the boiler room: machine halls in a maze of tight concrete corridors ----
  const BX0 = 3, BZ0 = 32, BX1 = 28, BZ1 = 41;
  LV.land = rect(room(Z5.BHALL, R5.BO, 'landing'), 3, 32, 4, 33);
  LV.bhalls = [rect(room(Z5.BHALL, R5.BO, 'boiler', { valve: 0 }), 10, 38, 12, 40), rect(room(Z5.BHALL, R5.BO, 'boiler', { valve: 1 }), 17, 32, 19, 34), rect(room(Z5.BHALL, R5.BO, 'boiler', { valve: 2 }), 24, 38, 26, 40)];
  LV.xroom = rect(room(Z5.BHALL, R5.BO, 'exit'), 27, 32, 28, 33);
  way(28, 32, 0, 'exit', { from: [28, 32] });
  const mz = [];
  for (let y = BZ0; y <= BZ1; y++) for (let x = BX0; x <= BX1; x++) { const c = cIdx(x, y); if (LV.zone[c] === Z5.VOID) { LV.zone[c] = Z5.BOIL; LV.reg[c] = R5.BO; LV.maze.add(c); mz.push(c); } }
  const pk = (a, b) => a < b ? a + ',' + b : b + ',' + a;
  const seen = new Set([cIdx(5, 32)]), st = [cIdx(5, 32)];
  while (st.length) {
    const c = st[st.length - 1], x = c % n, y = (c / n) | 0, opts = [];
    for (let d = 0; d < 4; d++) { const q = cIdx(x + DX[d], y + DY[d]); if (inGrid(x + DX[d], y + DY[d]) && LV.maze.has(q) && !seen.has(q)) opts.push(q); }
    if (!opts.length) { st.pop(); continue; }
    const q = pick(opts); LV.mazeOpen.add(pk(c, q)); seen.add(q); st.push(q);
  }
  for (const c of mz) {
    if (!seen.has(c)) { LV.maze.delete(c); LV.zone[c] = Z5.VOID; LV.reg[c] = -1; continue; }
    const x = c % n, y = (c / n) | 0;
    for (const d of [0, 1]) { const q = cIdx(x + DX[d], y + DY[d]); if (inGrid(x + DX[d], y + DY[d]) && LV.maze.has(q) && RNG() < 0.2) LV.mazeOpen.add(pk(c, q)); }
  }
  for (const [r, k] of [[LV.land, 2], ...LV.bhalls.map(h => [h, 2]), [LV.xroom, 1]]) {
    const cand = [];
    for (const c of r.cells) { const x = c % n, y = (c / n) | 0; for (let d = 0; d < 4; d++) { const q = cIdx(x + DX[d], y + DY[d]); if (inGrid(x + DX[d], y + DY[d]) && LV.maze.has(q)) cand.push([x, y, d]); } }
    shuffle(cand); const used = [];
    for (const e of cand) { if (used.length >= k) break; if (used.some(u => Math.abs(u[0] - e[0]) + Math.abs(u[1] - e[1]) < 2)) continue; used.push(e); way(e[0], e[1], e[2], 'arch', { boil: true, from: [e[0], e[1]] }); }
  }
  LV.mazeCells = [...LV.maze];
  // ---- resolve every edge ----
  const rule = (a, b) => {
    const za = a < 0 ? 0 : LV.zone[a], zb = b < 0 ? 0 : LV.zone[b];
    if (!za || !zb) return 1;
    if (LV.maze.has(a) && LV.maze.has(b)) return LV.mazeOpen.has(pk(a, b)) ? 0 : 1;
    return LV.room[a] >= 0 && LV.room[a] === LV.room[b] ? 0 : 1;
  };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) LV.hE[hI(x, y)] = rule(y > 0 ? cIdx(x, y - 1) : -1, y < n ? cIdx(x, y) : -1);
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) LV.vE[vI(x, y)] = rule(x > 0 ? cIdx(x - 1, y) : -1, x < n ? cIdx(x, y) : -1);
  const EV = { arch: 2, door: 2, elev: 2, deco: 1, brick: 1, exit: 1 };
  for (const e of LV.ek.values()) setEdge(e.x, e.y, e.d, EV[e.kind]);
  LV.spawn = { x: 16, y: 28 };
}

// ---------- wall pieces ----------
// what the wall face looking into cell (x,y) is made of: material, tint, height (ceiling) and trim colour
const TRIM5 = { mahog: [0.3, 0.13, 0.07], gold: [0.78, 0.6, 0.26], steel: [0.36, 0.37, 0.36], serv: [0.62, 0.62, 0.58], brass: [0.7, 0.54, 0.24] };
function side5(x, y) {
  if (!inGrid(x, y)) return null;
  const c = cIdx(x, y), z = LV.zone[c];
  if (z === Z5.VOID) return null;
  if (z === Z5.BEV) return { m: 'deco', c: [1, 1, 1], h: BEV_H, t: TRIM5.gold };
  if (z === Z5.SERV || z === Z5.STAIR || z === Z5.CLOS) return { m: 'bconc', c: [0.8, 0.84, 0.74], h: CEIL, t: TRIM5.serv };
  if (boilZ5(z)) return { m: 'bconc', c: [0.62, 0.6, 0.56], h: CEIL, t: TRIM5.steel };
  if (z === Z5.ROOM) return { m: 'hwall', c: LV.rooms[LV.room[c]].tint, h: CEIL, t: TRIM5.mahog };
  if (z === Z5.ELEV) return { m: 'hwall', c: [0.92, 0.84, 0.7], h: CEIL, t: TRIM5.brass };
  return { m: 'hwall', c: [1, 1, 1], h: CEIL, t: TRIM5.mahog };
}
// size of the hole an edge needs (null = solid wall)
function opening5(e) {
  if (!e) return null;
  if (e.kind === 'arch') return e.boil ? { w: 1.5, h: 2.35, cw: 0.07 } : { w: 2.0, h: 2.5, cw: 0.12 };
  if (e.kind === 'door' || e.kind === 'elev' || e.kind === 'exit') return { w: DOORW, h: DOORH, cw: 0.09 };
  if (e.kind === 'brick') return { w: 1.7, h: 2.75, cw: 0.13 };
  return null;
}
function collectPieces5(sideF = side5, openF = opening5) {
  const pieces = [], trims = [], recess = [], H = WT / 2, n = N;
  const SD = []; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) SD.push(sideF(x, y));
  const sd = (x, y) => inGrid(x, y) ? SD[cIdx(x, y)] : null;
  const wallH = (x, y) => x >= 0 && x < n && y >= 0 && y <= n && LV.hE[hI(x, y)] > 0 && !!(sd(x, y - 1) || sd(x, y));
  const wallV = (x, y) => x >= 0 && x <= n && y >= 0 && y < n && LV.vE[vI(x, y)] > 0 && !!(sd(x - 1, y) || sd(x, y));
  const prim = (a, b) => { for (const k of ['hwall', 'deco', 'bconc']) { if (a && a.m === k) return a.t; if (b && b.m === k) return b.t; } if (sideF !== side5) { if (a && b) return (a.tp ?? 0) >= (b.tp ?? 0) ? a.t : b.t; return (a || b).t; } return TRIM5.steel; };
  const emit = (horiz, x, y) => {
    const v = horiz ? LV.hE[hI(x, y)] : LV.vE[vI(x, y)]; if (!v) return;
    const sa = horiz ? sd(x, y - 1) : sd(x - 1, y), sb = sd(x, y); if (!sa && !sb) return;
    const e = LV.ek.get(horiz ? 'h' + hI(x, y) : 'v' + vI(x, y));
    const l0 = horiz ? x * CELL : y * CELL, l1 = l0 + CELL, c = horiz ? y * CELL : x * CELL;
    // extend over the corner square only when nothing continues in line; draw end caps only on free ends and jambs
    const col0 = horiz ? wallH(x - 1, y) : wallV(x, y - 1), col1 = horiz ? wallH(x + 1, y) : wallV(x, y + 1);
    const oth0 = horiz ? (wallV(x, y - 1) || wallV(x, y)) : (wallH(x - 1, y) || wallH(x, y));
    const oth1 = horiz ? (wallV(x + 1, y - 1) || wallV(x + 1, y)) : (wallH(x - 1, y + 1) || wallH(x, y + 1));
    const e0 = col0 ? 0 : H, e1 = col1 ? 0 : H, hmax = Math.max(sa ? sa.h : 0, sb ? sb.h : 0), tc = prim(sa, sb);
    const mk = (a0, a1, y0, y1, k, o = {}) => { const p = Object.assign(horiz ? { x0: a0, z0: c - H, x1: a1, z1: c + H } : { x0: c - H, z0: a0, x1: c + H, z1: a1 }, { a0, a1, c, y0, y1, k, horiz, sa, sb, tc }, o); pieces.push(p); return p; };
    const op = openF(e);
    if (!op) { mk(l0 - e0, l1 + e1, 0, hmax, 'w', { cap0: !col0 && !oth0, cap1: !col1 && !oth1 }); return; }
    const m = (l0 + l1) / 2, a = m - op.w / 2, b = m + op.w / 2;
    mk(l0 - e0, a, 0, hmax, 'w', { cap0: !col0 && !oth0, cap1: true, capH1: op.h });
    mk(b, l1 + e1, 0, hmax, 'w', { cap0: true, capH0: op.h, cap1: !col1 && !oth1 });
    mk(a, b, op.h, hmax, 'l');
    for (const [s, sg] of [[sa, -1], [sb, 1]]) {        // casings on every face that looks into a room
      if (!s) continue;
      const cw = op.cw, o = s.m === 'deco' ? 0.04 : 0.024, q0 = sg < 0 ? c - H - o : c + H - 0.004, q1 = sg < 0 ? c - H + 0.004 : c + H + o;
      const tr = (p0, p1, y0, y1) => trims.push(horiz ? [p0, y0, q0, p1, y1, q1, s.t] : [q0, y0, p0, q1, y1, p1, s.t]);
      tr(a - cw, a + 0.012, 0, op.h + cw); tr(b - 0.012, b + cw, 0, op.h + cw); tr(a - cw, b + cw, op.h - 0.012, op.h + cw);
      if (s.m === 'deco') tr(a - cw - 0.1, b + cw + 0.1, op.h + cw, op.h + cw + 0.09);    // stepped deco pediment
    }
    if (e.kind === 'brick' || e.kind === 'exit') {    // bricked-up doorway / emergency exit: a shallow recess into the void behind
      const vd = sa ? 1 : -1, D = e.kind === 'exit' ? 1.3 : 0.34, f0 = c + vd * H, f1 = c + vd * (H + D);
      recess.push({ horiz, a, b, c, f0, f1, vd, h: op.h, kind: e.kind, e });
      const lo = Math.min(c - H, f1 - vd * 0.02), hi = Math.max(c + H, f1 - vd * 0.02);
      pieces.push(Object.assign(horiz ? { x0: a, z0: lo, x1: b, z1: hi } : { x0: lo, z0: a, x1: hi, z1: b }, { y0: 0, y1: op.h, k: 'n', horiz }));
    }
  };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) emit(true, x, y);
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) emit(false, x, y);
  LV.pieces = pieces; LV.trims = trims; LV.recess = recess;
}

// ---------- geometry ----------
// like Geo.face but with separate u / v scales (the hotel wall tiles 3.0 m across so the endless corridor repeats exactly)
Geo.prototype.face2 = function (ox, oy, oz, U, V, du, dv, Nn, su, sv, col) {
  const b = this.p.length / 3;
  const P = [[ox, oy, oz], [ox + U[0] * du, oy + U[1] * du, oz + U[2] * du], [ox + U[0] * du + V[0] * dv, oy + U[1] * du + V[1] * dv, oz + U[2] * du + V[2] * dv], [ox + V[0] * dv, oy + V[1] * dv, oz + V[2] * dv]];
  for (const q of P) {
    this.p.push(q[0], q[1], q[2]); this.n.push(Nn[0], Nn[1], Nn[2]); this.t.push(U[0], U[1], U[2], 1);
    this.uv.push((q[0] * U[0] + q[1] * U[1] + q[2] * U[2]) * su, (q[0] * V[0] + q[1] * V[1] + q[2] * V[2]) * sv);
    if (this.c) this.c.push(col[0], col[1], col[2], col[3]);
  }
  if (FLIP_WINDING) this.i.push(b, b + 2, b + 1, b, b + 3, b + 2); else this.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
};
const MAT5_S = { hwall: [1 / 3.0, 1 / 2.85], deco: [1 / 7, 1 / 7], bconc: [1 / 2.4, 1 / 2.4], brick: [1 / 1.6, 1 / 1.6], carpet: 1 / 2.25, check: 1 / 2.4, tile: 1 / 1.2, bfloor: 1 / 2.4, hceil: 1 / 1.8, bceil: 1 / 3.5, sconc: 1 / 2.4 };
function buildGeometry5(scene, mats) {
  const CH = 8, NC = Math.ceil(N / CH), G = {};
  const geo = (m, ci) => { const k = m + ':' + ci; return G[k] || (G[k] = new Geo(true)); };
  const chunkOf = (x, z) => clamp(Math.floor(z / CELL / CH), 0, NC - 1) * NC + clamp(Math.floor(x / CELL / CH), 0, NC - 1);
  const C4 = c => [c[0], c[1], c[2], 1];
  // vertical quad facing +/-x or +/-z (dir: 0 +x, 1 +z, 2 -x, 3 -z) spanning [a0,a1] along the wall at plane position q
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
      const top = Math.min(p.y1, s.h), [su, sv] = MAT5_S[s.m], g = geo(s.m, ci);
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
  // recesses: bricked-up doorways in the ballroom, the emergency exit's little vestibule
  for (const r of LV.recess) {
    const ci = chunkOf(r.horiz ? (r.a + r.b) / 2 : r.c, r.horiz ? r.c : (r.a + r.b) / 2), m = r.kind === 'brick' ? 'brick' : 'bconc', g = geo(m, ci), [su, sv] = MAT5_S[m];
    const col = r.kind === 'brick' ? [0.8, 0.72, 0.66, 1] : [0.7, 0.7, 0.66, 1], lo = Math.min(r.f0, r.f1), hi = Math.max(r.f0, r.f1);
    if (r.horiz) {
      vq(g, r.vd > 0 ? 3 : 1, r.f1, r.a, r.b, 0, r.h, su, sv, col);
      vq(g, 0, r.a, lo, hi, 0, r.h, su, sv, col); vq(g, 2, r.b, lo, hi, 0, r.h, su, sv, col);
      g.face2(r.a, r.h, lo, [1, 0, 0], [0, 0, 1], r.b - r.a, hi - lo, [0, -1, 0], su, su, col);
      geo('bfloor', ci).face(r.a, 0.002, hi, [1, 0, 0], [0, 0, -1], r.b - r.a, hi - lo, [0, 1, 0], 1 / 2.4, false, [0.7, 0.7, 0.7, 1]);
    } else {
      vq(g, r.vd > 0 ? 2 : 0, r.f1, r.a, r.b, 0, r.h, su, sv, col);
      vq(g, 1, r.a, lo, hi, 0, r.h, su, sv, col); vq(g, 3, r.b, lo, hi, 0, r.h, su, sv, col);
      g.face2(lo, r.h, r.a, [1, 0, 0], [0, 0, 1], hi - lo, r.b - r.a, [0, -1, 0], su, su, col);
      geo('bfloor', ci).face(lo, 0.002, r.b, [1, 0, 0], [0, 0, -1], hi - lo, r.b - r.a, [0, 1, 0], 1 / 2.4, false, [0.7, 0.7, 0.7, 1]);
    }
  }
  // ---- floors & ceilings ----
  const up = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z1, [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, [0, 1, 0], s, false, col);
  const dn = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z0, [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, -1, 0], s, false, col);
  const SVc = cIdx(LV.svStair.x, LV.svStair.y), AR = LV.arrive5 = { x: 3, y: 32 }, ARc = cIdx(AR.x, AR.y), W1 = [1, 1, 1, 1];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y), z = LV.zone[c]; if (z === Z5.VOID) continue;
    const x0 = x * CELL, z0 = y * CELL, x1 = x0 + CELL, z1 = z0 + CELL, ci = chunkOf(x0 + 1, z0 + 1), hv = hash1(x * 31.7 + y * 17.3);
    if (hotelZ5(z) || z === Z5.ROOM) {
      const r = LV.rooms[LV.room[c]], k = z === Z5.ROOM ? r.tint.map(v => v * 0.92) : z === Z5.ELEV ? [0.62, 0.5, 0.46] : [1, 1, 1];
      up(geo('carpet', ci), x0, z0, x1, z1, 0, MAT5_S.carpet, C4(k));
      dn(geo('hceil', ci), x0, z0, x1, z1, CEIL, MAT5_S.hceil, z === Z5.ROOM ? [0.95, 0.92, 0.86, 1] : W1);
    } else if (z === Z5.BEV) {
      up(geo('check', ci), x0, z0, x1, z1, 0, MAT5_S.check, W1);
      dn(geo('bceil', ci), x0, z0, x1, z1, BEV_H, MAT5_S.bceil, W1);
    } else if (z === Z5.SERV || z === Z5.CLOS || z === Z5.STAIR) {
      if (c !== SVc) up(geo('tile', ci), x0, z0, x1, z1, 0, MAT5_S.tile, [0.86, 0.88, 0.8, 1]);
      dn(geo('bconc', ci), x0, z0, x1, z1, CEIL, MAT5_S.sconc, [0.74, 0.74, 0.7, 1]);
    } else {
      const k = 0.85 + 0.25 * hv;
      up(geo('bfloor', ci), x0, z0, x1, z1, 0, MAT5_S.bfloor, [k, k, k, 1]);
      if (c === ARc) dn(geo('bconc', ci), x0, z0 + 1.9, x1, z1, CEIL, MAT5_S.sconc, [0.42, 0.41, 0.4, 1]);
      else dn(geo('bconc', ci), x0, z0, x1, z1, CEIL, MAT5_S.sconc, [0.42, 0.41, 0.4, 1]);
    }
  }
  { // service stairs: a flight falling away to the south, into the dark
    const s = LV.svStair, x0 = s.x * CELL + WT / 2, x1 = (s.x + 1) * CELL - WT / 2, z0 = s.y * CELL, z1 = (s.y + 1) * CELL - WT / 2, ci = chunkOf(x0, z0);
    const g = geo('bconc', ci), gt = geo('tile', ci), c = [0.66, 0.68, 0.62, 1], su = 1 / 2.4, zs = z0 + 0.45, n = 12, dd = (z1 - zs) / n, r = 0.24;
    up(gt, x0 - WT / 2, z0, x1 + WT / 2, zs, 0, MAT5_S.tile, [0.86, 0.88, 0.8, 1]);
    for (let i = 0; i < n; i++) {
      const za = zs + i * dd, y = -(i + 1) * r;
      up(g, x0, za, x1, z1, y, su, c);
      g.face(x1, y, za, [-1, 0, 0], [0, 1, 0], x1 - x0, r, [0, 0, -1], su, false, c);
      geo('trim', ci).box(x0, y - 0.01, za - 0.02, x1, y + 0.012, za + 0.03, 1, 31, [0.3, 0.3, 0.28, 1]);
    }
    const D = -3.4;
    g.face(x0, D, z0, [0, 0, 1], [0, 1, 0], z1 - z0, -D, [1, 0, 0], su, false, c);
    g.face(x1, D, z1, [0, 0, -1], [0, 1, 0], z1 - z0, -D, [-1, 0, 0], su, false, c);
    g.face(x1, D, z1, [-1, 0, 0], [0, 1, 0], x1 - x0, -D, [0, 0, -1], su, false, [0.4, 0.4, 0.38, 1]);
    for (let k = 0; k < 16; k++) geo('trim', ci).box(x0 + 0.05, 0.9 - k * r * 0.75, zs + k * (z1 - zs) / 16, x0 + 0.1, 0.95 - k * r * 0.75, zs + (k + 1) * (z1 - zs) / 16, 1, 63, [0.42, 0.14, 0.08, 1]);  // hand rail
  }
  { // boiler room arrival: the same steps rising north toward a black shaft
    const x0 = AR.x * CELL + WT / 2, x1 = (AR.x + 1) * CELL - WT / 2, z0 = AR.y * CELL + WT / 2, z1 = AR.y * CELL + 1.9, ci = chunkOf(x0, z0), g = geo('bconc', ci), c = [0.55, 0.55, 0.52, 1], su = 1 / 2.4, n = 12;
    for (let i = 0; i < n; i++) { const zz = z1 - (i + 1) * (z1 - z0) / n; g.box(x0, 0, zz, x1, 0.235 * (i + 1), zz + (z1 - z0) / n, su, 16 | 8, c); }
    const dk = [0.22, 0.22, 0.21, 1], Y = CEIL + 3;
    g.face(x0, CEIL, z0, [0, 0, 1], [0, 1, 0], z1 - z0, 3, [1, 0, 0], su, false, dk); g.face(x1, CEIL, z1, [0, 0, -1], [0, 1, 0], z1 - z0, 3, [-1, 0, 0], su, false, dk);
    g.face(x1, CEIL, z0, [-1, 0, 0], [0, 1, 0], x1 - x0, 3, [0, 0, 1], su, false, dk); g.face(x0, CEIL, z1, [1, 0, 0], [0, 1, 0], x1 - x0, 3, [0, 0, -1], su, false, dk);
    g.face(x0, Y, z0, [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, -1, 0], su, false, [0.03, 0.03, 0.03, 1]);
  }
  LV.chunkMeshes = [];
  for (const [k, g] of Object.entries(G)) {
    if (!g.p.length) continue; const [m] = k.split(':');
    const mesh = g.mesh('l5_' + k, scene); mesh.material = mats[m];
    if (['carpet', 'check', 'tile', 'bfloor'].includes(m)) mesh._sortD = 900; else if (m === 'hceil' || m === 'bceil') mesh._sortD = 950; else LV.chunkMeshes.push(mesh);
  }
}

// ---------- lights (baked) + the fixtures the props are built around ----------
function planLights5() {
  LV.fixtures = []; LV.sconces = []; LV.bulbs = []; LV.lamps5 = [];
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  const plain = (x, y, d) => { if (edgeVal(x, y, d) !== 1) return false; const e = LV.ek.get(eKey(x, y, d)); return !e || e.kind === 'deco'; };
  const sconce = (x, y, d, along, state, o = {}) => {
    const [px, pz, ry] = wallPt(x, y, d, 0, along), [lx, lz] = wallPt(x, y, d, 0.3, along);
    LV.sconces.push({ x: px, z: pz, ry, state, y: o.y ?? 1.82, big: !!o.big, cell: cIdx(x, y), d, along });
    if (state) F(lx, lz, { state, I: o.I ?? 0.34, rad: o.rad ?? 7, sc: o.sc ?? 1.8 });
  };
  for (const r of LV.rooms) {
    if (r.t !== 'hall') continue;
    for (const c of r.cells) {
      const x = c % N, y = (c / N) | 0; if (LV.zone[c] === Z5.LOBBY) continue;
      if (r.loop) { const k = (x - LOOP5.x0) % 5; sconce(x, y, k % 2 ? 1 : 3, 1.25, [1, 1, 2, 1, 0][k]); continue; }
      const cand = [0, 1, 2, 3].filter(d => plain(x, y, d)); if (!cand.length) continue;
      const d = cand[(x + y) % cand.length], st = LV.dark[c] ? (RNG() < 0.14 ? 2 : 0) : (RNG() < 0.1 ? 2 : 1);
      sconce(x, y, d, 1.25, st);
    }
  }
  // lobby + elevator car
  F(cellCenter(16), 28 * CELL, { I: 0.62, rad: 11, sc: 3.2 }); LV.bulbs.push({ x: cellCenter(16), z: 28 * CELL, y: CEIL, kind: 'pend', state: 1 });
  sconce(15, 27, 2, 0, 1, { I: 0.26 }); sconce(17, 27, 0, 0, 1, { I: 0.26 });
  F(cellCenter(16), cellCenter(29), { I: 0.5, rad: 4.2, sc: 1.3 });
  // the Beverly Room: one great chandelier, four lesser ones, sconces on the plain walls
  const bc = 17 * CELL; LV.chand = { x: bc, z: bc };
  F(bc, bc, { I: 1.35, rad: 20, sc: 7.5 });
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { F(bc + dx * 5.4, bc + dz * 5.4, { I: 0.42, rad: 10, sc: 3.4 }); LV.bulbs.push({ x: bc + dx * 5.4, z: bc + dz * 5.4, y: BEV_H, kind: 'chand' }); }
  for (const c of LV.bev.cells) { const x = c % N, y = (c / N) | 0; for (let d = 0; d < 4; d++) if (plain(x, y, d) && !LV.ek.has(eKey(x, y, d))) { const o = inGrid(x + DX[d], y + DY[d]) ? LV.zone[cIdx(x + DX[d], y + DY[d])] : 0; if (o !== Z5.BEV) sconce(x, y, d, 0, 1, { y: 2.9, big: true, I: 0.3, rad: 6.5, sc: 2 }); } }
  // guest rooms: one lamp each, mostly working
  for (const g of LV.guest) {
    const c = g.cells[g.cells.length - 1], r = RNG(), st = g.dark ? 0 : r < 0.72 ? 1 : r < 0.86 ? 2 : 0;
    const L = { x: cellCenter(c % N), z: cellCenter((c / N) | 0), state: st, room: g }; LV.lamps5.push(L); g.lamp = L;
    if (st) F(L.x, L.z, { state: st, I: 0.3, rad: 5.5, sc: 1.4 });
  }
  // closets (a bare bulb), vestibules (identical on purpose), staff corridor
  for (const r of LV.rooms) {
    if (r.t === 'closet') { const c = r.cells[0], x = cellCenter(c % N), z = cellCenter((c / N) | 0), st = RNG() < 0.5 ? 2 : 1; F(x, z, { state: st, I: 0.3, rad: 4.5, sc: 1.2 }); LV.bulbs.push({ x, z, y: CEIL, kind: 'bare', state: st }); }
    if (r.t === 'vest') { F(r.cx, r.cz, { I: 0.22, rad: 4, sc: 1.2 }); LV.bulbs.push({ x: r.cx, z: r.cz, y: CEIL, kind: 'pend', state: 1 }); }
  }
  for (const [x, st] of [[18, 1], [19, 2]]) { F(cellCenter(x), cellCenter(20), { state: st, I: 0.32, rad: 6, sc: 1.6 }); LV.bulbs.push({ x: cellCenter(x), z: cellCenter(20), y: CEIL, kind: 'bare', state: st }); }
  // boiler room: caged bulbs, some dead; the machine halls get two each
  for (const c of LV.mazeCells) {
    const r = RNG(), st = r < 0.42 ? 1 : r < 0.6 ? 2 : 0; if (!st && RNG() < 0.6) continue;
    const x = cellCenter(c % N) + rnd(-0.6, 0.6), z = cellCenter((c / N) | 0) + rnd(-0.6, 0.6);
    if (st) F(x, z, { state: st, I: 0.36, rad: 6.5, sc: 1.8 }); LV.bulbs.push({ x, z, y: CEIL, kind: 'cage', state: st });
  }
  for (const h of LV.bhalls) for (const k of [0, 2]) { const c = h.cells[k * 3 + 1], x = cellCenter(c % N), z = cellCenter((c / N) | 0); F(x, z, { I: 0.45, rad: 8, sc: 2.4, state: k ? 2 : 1 }); LV.bulbs.push({ x, z, y: CEIL, kind: 'cage', state: k ? 2 : 1 }); }
  { const x = 4 * CELL, z = 33 * CELL; F(x, z, { I: 0.4, rad: 7, sc: 2 }); LV.bulbs.push({ x, z, y: CEIL, kind: 'cage', state: 1 }); }
  { const x = 28 * CELL, z = 33 * CELL; F(x, z, { I: 0.3, rad: 6, sc: 1.8, state: 2 }); LV.bulbs.push({ x, z, y: CEIL, kind: 'cage', state: 2 }); }
  LV.sky = null;
}
