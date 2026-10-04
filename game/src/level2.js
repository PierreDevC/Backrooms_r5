// ---------- r9 / r11 · Level 2 · Pipe Dreams: layout, architecture, lamps ----------
// r11 rebuild: a working underground plant rather than boxes. A drainage pump room (where the camera climbs out), a 3.6 m service tunnel
// (the Spine) with a haunched ceiling, a painted dado and a drain channel; the boiler house (9.5 m, two fire-tube boilers) watched from
// its control room through a wired-glass window; a feedwater tank room on the way into the Low Galleries, which are old brick culverts
// with barrel vaults and standing hot water; the switchgear hall (north) and the freight lift; the Long Pipe (east) to the valve rooms.
// The story's anchors keep their names (LV.dry.*, WP2.pos.*) so story2 / ai2 / main2 are unchanged. See docs/LEVEL2.md.
const ZP2 = { VOID: 0, SUMP: 1, SPINE: 2, OFFICE: 3, HALL: 4, COLD: 5, GALL: 6, CAMP: 7, SWITCH: 8, LONG: 9, VALVE: 10, LIFT: 11, SHELTER: 12, WREG: 13, CORR: 14, TANK: 15, SHOP: 16 };
const R2Z = { HUB: 0, WEST: 1, NORTH: 2, EAST: 3 };
const L2_N = 56, L2_LMR = 896;
const cell2 = (x, z) => cIdx(cellOf(x), cellOf(z));
const TRIM2 = { steel: [0.32, 0.33, 0.33], rust: [0.36, 0.2, 0.12], yellow: [0.72, 0.58, 0.12], dark: [0.09, 0.09, 0.09], green: [0.2, 0.36, 0.28], white: [0.75, 0.77, 0.76] };
// architecture kinds: tun = service tunnel (haunched ceiling), vault = brick culvert, big = tall hall (steel roof deck), room = plain room
function genLayout2() {
  const n = N;
  LV.zone = new Uint8Array(n * n); LV.room = new Int16Array(n * n).fill(-1); LV.reg = new Int8Array(n * n).fill(-1); LV.dark = new Uint8Array(n * n);
  LV.fh = new Float32Array(n * n); LV.ch = new Float32Array(n * n); LV.safe2 = new Uint8Array(n * n); LV.hot2 = new Float32Array(n * n); LV.wet2 = new Uint8Array(n * n);
  LV.hE = new Uint8Array((n + 1) * n); LV.vE = new Uint8Array(n * (n + 1));
  LV.rooms = []; LV.ek = new Map(); LV.navVer = 0; LV.warps = []; LV.halls = []; LV.pillars = []; LV.darkCenters = []; LV.shelters2 = []; LV.win2 = [];
  const room = (zone, reg, t, o = {}) => { const r = Object.assign({ id: LV.rooms.length, zone, reg, t, cells: [], h: 3.2, arch: 'room', wm: 'room', fm: 'flr', cm: 'ceil' }, o); LV.rooms.push(r); return r; };
  const put = (r, x, y) => { const c = cIdx(x, y); if (LV.room[c] === r.id) return; LV.room[c] = r.id; LV.zone[c] = r.zone; LV.reg[c] = r.reg; LV.ch[c] = r.h; LV.hot2[c] = r.hot || 0; LV.safe2[c] = r.safe ? 1 : 0; LV.wet2[c] = r.wet ? 1 : 0; r.cells.push(c); };
  const rect = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y); return r; };
  const way = (x, y, d, kind, o = {}) => { const e = Object.assign({ x, y, d, kind, from: [x, y] }, o); LV.ek.set(eKey(x, y, d), e); return e; };
  LV.dry = {};
  const TUN = o => Object.assign({ arch: 'tun', wm: 'tun', fm: 'flr', cm: 'ceil', h: 3.4 }, o);
  // ===== the hub =====
  const SUMP = rect(room(ZP2.SUMP, R2Z.HUB, 'sump', { h: 5.0, wm: 'tun', fm: 'plate', safe: true, wet: true, arch: 'big', cm: 'ceil' }), 25, 47, 28, 50); LV.dry.sump = SUMP;
  const SP = rect(room(ZP2.SPINE, R2Z.HUB, 'spine', TUN({ h: 3.6, hot: 0.12, drain: true })), 27, 16, 27, 46); LV.dry.spine = SP;
  way(27, 46, 1, 'open');
  const OC = rect(room(ZP2.CORR, R2Z.HUB, 'ocorr', TUN({ h: 3.2, hot: 0.1 })), 28, 32, 28, 32); way(27, 32, 0, 'open');
  const OF = rect(room(ZP2.OFFICE, R2Z.HUB, 'office', { h: 3.0, wm: 'office', fm: 'flr', safe: true }), 29, 31, 31, 33); LV.dry.office = OF;
  way(28, 32, 0, 'door', { dk: 'office', plaque: 'BOILER CONTROL' });
  const BC = rect(room(ZP2.CORR, R2Z.HUB, 'bcorr', TUN({ h: 3.4, hot: 0.2 })), 28, 27, 31, 27); way(27, 27, 0, 'open');
  const HALL = rect(room(ZP2.HALL, R2Z.HUB, 'hall', { h: 9.5, arch: 'big', wm: 'hall', fm: 'flr', cm: 'corr', hot: 0.5 }), 32, 23, 43, 36); LV.dry.hall = HALL;
  way(31, 27, 0, 'door', { dk: 'hall', plaque: 'BOILER HOUSE' });
  for (let y = 31; y <= 33; y++) LV.win2.push({ x: 31, y, d: 0 });   // the control room looks into the boiler house
  const CA = rect(room(ZP2.COLD, R2Z.HUB, 'coldA', { h: 2.8, wm: 'tile', fm: 'tile', safe: true, cold: true }), 25, 42, 26, 43); LV.dry.coldA = CA;
  way(27, 42, 2, 'door', { dk: 'cold', plaque: 'COLD STORE' });
  const SHOP = rect(room(ZP2.SHOP, R2Z.HUB, 'shop', { h: 3.2, wm: 'tun', fm: 'flr', hot: 0.1 }), 24, 37, 26, 39); LV.dry.shop = SHOP;
  way(27, 38, 2, 'door', { dk: 'room', plaque: 'WORKSHOP' });
  // ===== west: the feedwater tank room, then the Low Galleries (brick culverts, standing hot water, red lamps) =====
  const GC = rect(room(ZP2.CORR, R2Z.WEST, 'gcorr', TUN({ h: 3.4, hot: 0.25 })), 25, 24, 26, 24); way(27, 24, 2, 'open'); LV.dry.gcorr = GC;
  const TK = rect(room(ZP2.TANK, R2Z.WEST, 'tank', { h: 6.5, arch: 'big', wm: 'hall', fm: 'flr', cm: 'corr', hot: 0.3 }), 19, 22, 24, 26); LV.dry.tank = TK;
  way(24, 24, 0, 'open');
  const GA = room(ZP2.GALL, R2Z.WEST, 'gall', { h: 3.0, arch: 'vault', wm: 'brick', fm: 'flr', cm: 'brick', hot: 0.55, wet: true });
  rect(GA, 3, 20, 17, 20); rect(GA, 3, 27, 17, 27); rect(GA, 3, 34, 17, 34); rect(GA, 3, 20, 3, 38); rect(GA, 10, 20, 10, 40); rect(GA, 17, 20, 17, 34); rect(GA, 18, 24, 18, 24);
  way(18, 24, 0, 'open'); LV.dry.gall = GA;
  const CAMP = rect(room(ZP2.CAMP, R2Z.WEST, 'camp', { h: 3.0, wm: 'room', fm: 'flr', safe: true }), 4, 29, 6, 31); LV.dry.camp = CAMP;
  way(3, 30, 0, 'door', { dk: 'camp', plaque: 'STORE 9' });
  const CB = rect(room(ZP2.COLD, R2Z.WEST, 'coldB', { h: 2.8, wm: 'tile', fm: 'tile', safe: true, cold: true }), 11, 30, 12, 31); LV.dry.coldB = CB;
  way(10, 30, 0, 'door', { dk: 'cold', plaque: 'COLD STORE' });
  const WR = rect(room(ZP2.WREG, R2Z.WEST, 'wreg', { h: 3.4, wm: 'crack', fm: 'flr', hot: 0.7, wet: true }), 2, 39, 4, 41); LV.dry.wreg = WR;
  way(3, 38, 1, 'open');
  // ===== north: the switchgear hall and the Gamma Lift =====
  const NC = rect(room(ZP2.CORR, R2Z.NORTH, 'ncorr', TUN({ h: 3.6, hot: 0.1 })), 27, 14, 27, 15); way(27, 15, 1, 'open'); way(27, 14, 3, 'open');
  const SW = rect(room(ZP2.SWITCH, R2Z.NORTH, 'switch', { h: 7.5, arch: 'big', wm: 'room', fm: 'flr', cm: 'corr', hot: 0.2 }), 18, 3, 36, 13); LV.dry.sw = SW;
  const LC = rect(room(ZP2.CORR, R2Z.NORTH, 'lcorr', TUN({ h: 3.4, hot: 0.1 })), 37, 8, 46, 8); LV.dry.lcorr = LC;
  way(36, 8, 0, 'door', { dk: 'sw', plaque: 'GAMMA LIFT' });
  const LIFT = rect(room(ZP2.LIFT, R2Z.NORTH, 'lift', { h: 4.2, arch: 'big', wm: 'room', fm: 'plate', cm: 'ceil', safe: true }), 47, 6, 50, 10); LV.dry.lift = LIFT;
  way(46, 8, 0, 'open');
  // ===== east: the Long Pipe =====
  const LP = room(ZP2.LONG, R2Z.EAST, 'long', TUN({ h: 3.4, hot: 0.4 }));
  rect(LP, 28, 19, 51, 19); rect(LP, 51, 19, 51, 46); rect(LP, 41, 46, 51, 46); LV.dry.long = LP;
  way(27, 19, 0, 'open');
  const VR = rect(room(ZP2.VALVE, R2Z.EAST, 'valve', { h: 3.4, wm: 'tun', fm: 'plate', safe: true, hot: 0.3 }), 38, 45, 40, 47); LV.dry.valve = VR;
  way(41, 46, 2, 'door', { dk: 'valve', plaque: 'VALVE ROOM 4', locked: true, jammed: true });
  const CC = rect(room(ZP2.COLD, R2Z.EAST, 'coldC', { h: 2.8, wm: 'tile', fm: 'tile', safe: true, cold: true }), 49, 32, 50, 33); LV.dry.coldC = CC;
  way(51, 32, 2, 'door', { dk: 'cold', plaque: 'COLD STORE' });
  for (let y = 27; y <= 41; y++) LV.dark[cIdx(51, y)] = 1;
  for (let x = 41; x <= 48; x++) LV.dark[cIdx(x, 19)] = 1;
  // ===== steam shelters: one-cell refuges with a green lamp =====
  const shelter = (x, y, fx, fy, d) => { const r = rect(room(ZP2.SHELTER, LV.reg[cIdx(fx, fy)], 'shelter', { h: 2.6, wm: 'room', fm: 'flr', safe: true }), x, y, x, y); way(fx, fy, d, 'open', { shelter: true }); LV.shelters2.push({ x, y, fx, fy, d, r }); return r; };
  shelter(26, 17, 27, 17, 2); shelter(28, 22, 27, 22, 0); shelter(26, 29, 27, 29, 2); shelter(28, 37, 27, 37, 0); /* (28,32) is the control-room passage */ shelter(26, 45, 27, 45, 2); shelter(28, 41, 27, 41, 0);
  shelter(34, 20, 34, 19, 1); shelter(44, 18, 44, 19, 3); shelter(50, 25, 51, 25, 2); shelter(50, 38, 51, 38, 2); shelter(47, 45, 47, 46, 3);
  shelter(11, 21, 11, 20, 1); shelter(6, 26, 6, 27, 3); shelter(14, 35, 14, 34, 1); shelter(4, 37, 3, 37, 0);
  shelter(17, 8, 18, 8, 0); shelter(37, 12, 36, 12, 0);
  // ---- resolve every edge ----
  const rule = (a, b) => { const za = a < 0 ? 0 : LV.zone[a], zb = b < 0 ? 0 : LV.zone[b]; if (!za || !zb) return 1; return LV.room[a] >= 0 && LV.room[a] === LV.room[b] ? 0 : 1; };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) LV.hE[hI(x, y)] = rule(y > 0 ? cIdx(x, y - 1) : -1, y < n ? cIdx(x, y) : -1);
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) LV.vE[vI(x, y)] = rule(x > 0 ? cIdx(x - 1, y) : -1, x < n ? cIdx(x, y) : -1);
  for (const e of LV.ek.values()) setEdge(e.x, e.y, e.d, e.kind === 'open' ? 0 : 2);
  LV.spawn = { x: 26, y: 49 };
}

// ---------- wall pieces (collision + the faces we draw) ----------
// top: where the flat wall face stops (a tunnel's haunch starts 0.45 m under the ceiling; a culvert's vault springs at 2.0 m)
const HAUNCH2 = 0.45, SPRING2 = 2.0;
function side2(x, y) {
  if (!inGrid(x, y)) return null;
  const c = cIdx(x, y); if (LV.zone[c] === ZP2.VOID) return null;
  const r = LV.rooms[LV.room[c]], top = r.arch === 'tun' ? r.h - HAUNCH2 : r.arch === 'vault' ? SPRING2 : r.h;
  return { m: r.wm, c: [1, 1, 1], t: TRIM2.steel, tp: 1, h: r.h, fh: 0, top, arch: r.arch, r };
}
function opening2(e) { if (!e) return null; if (e.kind === 'door') return { w: DOORW, h: DOORH, cw: 0.09 }; return null; }

// ---------- the architecture, through the modelling kit (tessellated for the bake) ----------
const WALLC2 = { tun: [1, 1, 1], hall: [0.95, 0.92, 0.88], room: [0.92, 0.92, 0.9], office: [0.95, 0.97, 0.94], crack: [0.85, 0.82, 0.78], brick: [0.95, 0.9, 0.86], tile: [0.92, 0.95, 0.96] };
function buildArch2() {
  const ST = 0.42, W0 = [0, 0, 0, 0];
  const col = (m, wet = 0) => { const c = WALLC2[m] || [1, 1, 1]; return [c[0], c[1], c[2], wet]; };
  const winAt = (x, y, d) => LV.win2.some(w => (w.x === x && w.y === y && w.d === d) || (w.x + DX[w.d] === x && w.y + DY[w.d] === y && (w.d + 2) % 4 === d));
  // --- walls: both faces of every piece, from the floor to that side's wall top ---
  for (const p of LV.pieces) {
    if (p.k === 'n') continue;
    for (const [sd, sg] of [[p.sa, -1], [p.sb, 1]]) {
      if (!sd) continue;
      const from = p.k === 'l' ? p.y0 : 0, to = p.k === 'l' ? sd.top : sd.top, wet = sd.r.wet ? 0.6 : 0, cc = col(sd.m, wet);
      if (to - from < 0.01) continue;
      // which cell this face looks into: the window cuts a hole between 1.05 and 2.25 m
      const q = sg < 0 ? (p.horiz ? p.z0 : p.x0) : (p.horiz ? p.z1 : p.x1), a0 = p.horiz ? p.x0 : p.z0, a1 = p.horiz ? p.x1 : p.z1;
      const N = p.horiz ? [0, 0, sg] : [sg, 0, 0], U = p.horiz ? [1, 0, 0] : [0, 0, 1];
      const mid = (a0 + a1) / 2, cx = p.horiz ? Math.floor(mid / CELL) : Math.floor((q + sg * 0.3) / CELL), cy = p.horiz ? Math.floor((q + sg * 0.3) / CELL) : Math.floor(mid / CELL);
      const dWin = p.horiz ? (sg < 0 ? 1 : 3) : (sg < 0 ? 0 : 2);
      const face = (b0, b1, y0, y1) => { const P0 = p.horiz ? [b0, y0, q] : [q, y0, b0]; k2Rect(sd.m, P0, U, [0, 1, 0], b1 - b0, y1 - y0, N, cc, ST, { uo: b0, vo: y0 }); };
      if (p.k === 'w' && winAt(cx, cy, dWin)) {
        const c0 = Math.floor(mid / CELL) * CELL, w0 = Math.max(a0, c0 + 0.35), w1 = Math.min(a1, c0 + CELL - 0.35);
        face(a0, w0, from, to); face(w1, a1, from, to); face(w0, w1, 0, 1.05); face(w0, w1, 2.25, to);
        LV.winRects = LV.winRects || []; LV.winRects.push({ horiz: p.horiz, q, w0, w1, sg });
      } else face(a0, a1, from, to);
    }
    // end caps: the thickness of a wall where it stops (door jambs, corridor mouths)
    const capM = (p.sa || p.sb).m, cc = col(capM);
    if (p.k === 'w') {
      const lo = p.horiz ? p.z0 : p.x0, hi = p.horiz ? p.z1 : p.x1, top = Math.max(p.sa ? p.sa.top : 0, p.sb ? p.sb.top : 0);
      if (p.cap0) { const h = p.capH0 ?? top, P0 = p.horiz ? [p.a0, 0, hi] : [hi, 0, p.a0]; k2Rect(capM, P0, p.horiz ? [0, 0, -1] : [-1, 0, 0], [0, 1, 0], hi - lo, h, p.horiz ? [-1, 0, 0] : [0, 0, -1], cc, ST, { occ: true }); }
      if (p.cap1) { const h = p.capH1 ?? top, P0 = p.horiz ? [p.a1, 0, lo] : [lo, 0, p.a1]; k2Rect(capM, P0, p.horiz ? [0, 0, 1] : [1, 0, 0], [0, 1, 0], hi - lo, h, p.horiz ? [1, 0, 0] : [0, 0, 1], cc, ST, { occ: true }); }
    } else if (p.k === 'l') {   // the underside of a door lintel
      k2Rect(capM, [p.x0, p.y0, p.z0], [1, 0, 0], [0, 0, 1], p.x1 - p.x0, p.z1 - p.z0, [0, -1, 0], cc, ST);
    }
  }
  // door casings: pressed-steel frames round every door opening (the trim boxes collectPieces5 lays out)
  for (const t of LV.trims) { const T = k2T((t[0] + t[3]) / 2, (t[1] + t[4]) / 2, (t[2] + t[5]) / 2, 0); k2Box(T, [t[3] - t[0], t[4] - t[1], t[5] - t[2]], pc2([0.28, 0.3, 0.3], PM2.paint), { bevel: 0.006, occ: false }); }
  // where two rooms of different heights meet through an open way, close the step above the lower one
  for (const e of LV.ek.values()) {
    if (e.kind !== 'open') continue;
    const a = cIdx(e.x, e.y), b = cIdx(e.x + DX[e.d], e.y + DY[e.d]), sa = side2(e.x, e.y), sb = side2(e.x + DX[e.d], e.y + DY[e.d]); if (!sa || !sb) continue;
    const lowTop = Math.min(sa.h, sb.h), hiS = sa.h > sb.h ? sa : sb; if (Math.abs(sa.h - sb.h) < 0.01) continue;
    const [mx, mz] = edgeMid(e.x, e.y, e.d), horiz = e.d === 1 || e.d === 3, hiIsA = hiS === sa, dir = hiIsA ? e.d : (e.d + 2) % 4;   // face looks back into the tall room
    const N = [-DX[dir], 0, -DY[dir]], U = horiz ? [1, 0, 0] : [0, 0, 1], P0 = horiz ? [mx - CELL / 2, lowTop, mz] : [mx, lowTop, mz - CELL / 2];
    k2Rect(hiS.arch === 'tun' ? hiS.r.cm : hiS.m, P0, U, [0, 1, 0], CELL, hiS.h - lowTop, N, col(hiS.m), ST, { uo: horiz ? mx - CELL / 2 : mz - CELL / 2, vo: lowTop });
  }
  // --- floors, ceilings, haunches, vaults ---
  const isWall = (x, y, d) => edgeVal(x, y, d) !== 0;   // wall or door: anything that is not an open way
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y); if (!LV.zone[c]) continue;
    const r = LV.rooms[LV.room[c]], x0 = x * CELL, z0 = y * CELL, x1 = x0 + CELL, z1 = z0 + CELL, wet = r.wet ? 1 : 0, hv = 0.94 + 0.1 * hash1(x * 31.7 + y * 17.3);
    const fc = [hv, hv, hv, wet ? 0.85 : r.zone === ZP2.SUMP ? 0.6 : (r.t === 'spine' || r.t === 'long') ? 0.25 : 0];
    // floor (the spine has a drain channel down the middle under a steel grating)
    if (r.drain && !isWall(x, y, 1) && !isWall(x, y, 3) && isWall(x, y, 0) && isWall(x, y, 2)) {
      const cx = (x0 + x1) / 2, gw = 0.22;
      k2Rect(r.fm, [x0, 0, z1], [1, 0, 0], [0, 0, -1], cx - gw - x0, CELL, [0, 1, 0], fc, ST, { uo: x0, vo: -z1 });
      k2Rect(r.fm, [cx + gw, 0, z1], [1, 0, 0], [0, 0, -1], x1 - cx - gw, CELL, [0, 1, 0], fc, ST, { uo: cx + gw, vo: -z1 });
      k2Rect('walk', [cx - gw, -0.01, z1], [1, 0, 0], [0, 0, -1], gw * 2, CELL, [0, 1, 0], [0.7, 0.7, 0.68, 0.5], 0.5, { uo: cx - gw, vo: -z1 });
      for (const s of [-1, 1]) k2Rect('flr', [cx + s * gw, -0.01, z0], [0, 0, 1], [0, 1, 0], CELL, 0.01, [-s, 0, 0], fc, 1.0, { occ: false });
    } else k2Rect(r.fm, [x0, 0, z1], [1, 0, 0], [0, 0, -1], CELL, CELL, [0, 1, 0], fc, ST, { uo: x0, vo: -z1 });
    const h = r.h, cm = r.cm, cc = [0.92, 0.92, 0.9, 0];
    if (r.arch === 'tun') {
      // haunch strips on walled sides, mitred where two meet; the flat soffit fills the rest
      const hw = [0, 1, 2, 3].map(d => isWall(x, y, d)), H = HAUNCH2;
      const ix0 = x0 + WT / 2 + (hw[2] ? H : 0), ix1 = x1 - WT / 2 - (hw[0] ? H : 0), iz0 = z0 + WT / 2 + (hw[3] ? H : 0), iz1 = z1 - WT / 2 - (hw[1] ? H : 0);
      const X0 = hw[2] ? x0 + WT / 2 : x0, X1 = hw[0] ? x1 - WT / 2 : x1, Z0 = hw[3] ? z0 + WT / 2 : z0, Z1 = hw[1] ? z1 - WT / 2 : z1;
      k2Rect(cm, [hw[2] ? ix0 : x0, h, hw[3] ? iz0 : z0], [1, 0, 0], [0, 0, 1], (hw[0] ? ix1 : x1) - (hw[2] ? ix0 : x0), (hw[1] ? iz1 : z1) - (hw[3] ? iz0 : z0), [0, -1, 0], cc, ST, { uo: hw[2] ? ix0 : x0, vo: hw[3] ? iz0 : z0 });
      const strip = (A0, A1, B0, B1, Nn) => { // A: bottom edge at y = h - H on the wall, B: top edge at y = h, inset
        const b = k2Bucket(cm, (A0[0] + B1[0]) / 2, (A0[2] + B1[2]) / 2), nu = 9, base = b.p.length / 3, U = [A1[0] - A0[0], 0, A1[2] - A0[2]], ul = Math.hypot(U[0], U[2]) || 1;
        for (let j = 0; j <= 1; j++) for (let i = 0; i <= nu; i++) { const t = i / nu, P = j ? [B0[0] + (B1[0] - B0[0]) * t, B0[1], B0[2] + (B1[2] - B0[2]) * t] : [A0[0] + (A1[0] - A0[0]) * t, A0[1], A0[2] + (A1[2] - A0[2]) * t];
          k2V(b, P[0], P[1], P[2], Nn[0], Nn[1], Nn[2], U[0] / ul, 0, U[2] / ul, P[0] * Math.abs(U[0] / ul) + P[2] * Math.abs(U[2] / ul), j * 0.64, cc); }
        for (let i = 0; i < nu; i++) { const q = base + i; k2Tri(b, q, q + 1, q + nu + 2); k2Tri(b, q, q + nu + 2, q + nu + 1); }
        k2Occ(...A0, ...A1, ...B1); k2Occ(...A0, ...B1, ...B0);
      };
      const s2 = Math.SQRT1_2, yb = h - H;
      if (hw[0]) strip([X1, yb, Z0], [X1, yb, Z1], [ix1, h, hw[3] ? iz0 : z0], [ix1, h, hw[1] ? iz1 : z1], [-s2, -s2, 0]);
      if (hw[2]) strip([X0, yb, Z1], [X0, yb, Z0], [ix0, h, hw[1] ? iz1 : z1], [ix0, h, hw[3] ? iz0 : z0], [s2, -s2, 0]);
      if (hw[1]) strip([X1, yb, Z1], [X0, yb, Z1], [hw[0] ? ix1 : x1, h, iz1], [hw[2] ? ix0 : x0, h, iz1], [0, -s2, -s2]);
      if (hw[3]) strip([X0, yb, Z0], [X1, yb, Z0], [hw[2] ? ix0 : x0, h, iz0], [hw[0] ? ix1 : x1, h, iz0], [0, -s2, s2]);
    } else if (r.arch === 'vault') {
      const op = [0, 1, 2, 3].map(d => !isWall(x, y, d)), ns = op[1] && op[3] && !op[0] && !op[2], ew = op[0] && op[2] && !op[1] && !op[3];
      if (ns || ew) vault2(x, y, ns, h, cm);
      else {
        k2Rect(cm, [x0, h, z0], [1, 0, 0], [0, 0, 1], CELL, CELL, [0, -1, 0], cc, ST, { uo: x0, vo: z0 });
        // walls of a junction / end cell rise to the crown: fill above the springing on walled sides
        for (let d = 0; d < 4; d++) if (isWall(x, y, d)) { const [mx, mz] = edgeMid(x, y, d), horiz = d === 1 || d === 3, q = horiz ? mz - DY[d] * WT / 2 : mx - DX[d] * WT / 2, Nn = [-DX[d], 0, -DY[d]];
          k2Rect(r.wm, horiz ? [x0, SPRING2, q] : [q, SPRING2, z0], horiz ? [1, 0, 0] : [0, 0, 1], [0, 1, 0], CELL, h - SPRING2, Nn, col(r.wm, 0.6), ST, { uo: horiz ? x0 : z0, vo: SPRING2 }); }
      }
    } else {
      k2Rect(cm, [x0, h, z0], [1, 0, 0], [0, 0, 1], CELL, CELL, [0, -1, 0], cc, cm === 'corr' ? 0.6 : ST, { uo: x0, vo: z0 });
    }
  }
}
// a brick barrel vault over one culvert cell (springing at SPRING2, crown at h), with lunettes where it meets a flat-ceilinged junction
function vault2(x, y, ns, h, cm) {
  const x0 = x * CELL, z0 = y * CELL, span = CELL - WT, rise = h - SPRING2, R = (span * span / 4 + rise * rise) / (2 * rise), yc = h - R, half = Math.asin(span / 2 / R), segA = 12, segL = 9;
  const cc = [0.95, 0.9, 0.86, 0.6], b = k2Bucket(cm, x0 + CELL / 2, z0 + CELL / 2), base = b.p.length / 3, mid = ns ? x0 + CELL / 2 : z0 + CELL / 2;
  for (let j = 0; j <= segL; j++) for (let i = 0; i <= segA; i++) {
    const a = -half + 2 * half * i / segA, s = Math.sin(a), co = Math.cos(a), along = (ns ? z0 : x0) + CELL * j / segL, across = mid + s * R, yy = yc + co * R;
    const P = ns ? [across, yy, along] : [along, yy, across], Nn = ns ? [-s, -co, 0] : [0, -co, -s], T = ns ? [0, 0, 1] : [1, 0, 0];
    k2V(b, P[0], P[1], P[2], Nn[0], Nn[1], Nn[2], T[0], T[1], T[2], along, a * R, cc);
  }
  for (let j = 0; j < segL; j++) for (let i = 0; i < segA; i++) { const q = base + j * (segA + 1) + i; k2Tri(b, q, q + 1, q + segA + 2); k2Tri(b, q, q + segA + 2, q + segA + 1);
    const P = b.p, g = k => [P[k * 3], P[k * 3 + 1], P[k * 3 + 2]]; if (j % 3 === 0 && i % 2 === 0) { /* coarse occluder below */ } }
  // coarse occluder: the vault as a few strips
  for (let i = 0; i < 6; i++) { const a0 = -half + 2 * half * i / 6, a1 = -half + 2 * half * (i + 1) / 6, p = (a, l) => ns ? [mid + Math.sin(a) * R, yc + Math.cos(a) * R, l] : [l, yc + Math.cos(a) * R, mid + Math.sin(a) * R], l0 = ns ? z0 : x0, l1 = l0 + CELL;
    k2Occ(...p(a0, l0), ...p(a1, l0), ...p(a1, l1)); k2Occ(...p(a0, l0), ...p(a1, l1), ...p(a0, l1)); }
  // spandrels at each end that opens onto anything but more straight vault (a junction, a tall room): the wall above the arch, seen from that side
  for (const sgn of [-1, 1]) {
    const nx = ns ? x : x + sgn, ny = ns ? y + sgn : y, d = ns ? (sgn > 0 ? 1 : 3) : (sgn > 0 ? 0 : 2);
    if (edgeVal(x, y, d) !== 0 || !inGrid(nx, ny)) continue;
    const r2 = LV.rooms[LV.room[cIdx(nx, ny)]]; if (!r2) continue;
    const op = [0, 1, 2, 3].map(dd => edgeVal(nx, ny, dd) === 0), straight = r2.arch === 'vault' && (ns ? (op[1] && op[3] && !op[0] && !op[2]) : (op[0] && op[2] && !op[1] && !op[3])); if (straight) continue;
    const l = ns ? (sgn > 0 ? z0 + CELL : z0) : (sgn > 0 ? x0 + CELL : x0), P = (a) => ns ? [mid + Math.sin(a) * R, yc + Math.cos(a) * R, l] : [l, yc + Math.cos(a) * R, mid + Math.sin(a) * R];
    const Nn = ns ? [0, 0, sgn] : [sgn, 0, 0], U = ns ? [1, 0, 0] : [0, 0, 1], bb = k2Bucket('brick', ns ? mid : l, ns ? l : mid);
    for (const side of [-1, 1]) {   // a fan from the top corner over the arc from the springing to the crown
      const corner = ns ? [mid + side * span / 2, h, l] : [l, h, mid + side * span / 2], uvOf = q => [q[0] * U[0] + q[2] * U[2], q[1]];
      const ci = k2V(bb, ...corner, ...Nn, ...U, ...uvOf(corner), cc), ids = [];
      for (let i = 0; i <= segA / 2; i++) { const a = side * half * (1 - i / (segA / 2)), q = P(a); ids.push(k2V(bb, ...q, ...Nn, ...U, ...uvOf(q), cc)); }
      for (let i = 0; i < ids.length - 1; i++) { k2Tri(bb, ci, ids[i], ids[i + 1]); const g = k => [bb.p[k * 3], bb.p[k * 3 + 1], bb.p[k * 3 + 2]]; k2Occ(...g(ci), ...g(ids[i]), ...g(ids[i + 1])); }
    }
  }
}

// ---------- the standing hot water in the galleries: one thin murky plane ----------
function buildWater2(scene) {
  if (!BABYLON.Effect.ShadersStore.water2FragmentShader) {
    BABYLON.Effect.ShadersStore.water2VertexShader = BABYLON.Effect.ShadersStore.water37VertexShader;
    BABYLON.Effect.ShadersStore.water2FragmentShader = BABYLON.Effect.ShadersStore.water37FragmentShader.replace('vec3(0.03, 0.4, 0.26)', 'vec3(0.05, 0.05, 0.03)').replace('vec3(0.72, 0.9, 0.7)', 'vec3(0.42, 0.33, 0.24)').replace('vec3(0.7, 0.95, 0.7)', 'vec3(1.0, 0.75, 0.45)').replace('vec3(0.8, 1.0, 0.85)', 'vec3(1.0, 0.8, 0.5)');
  }
  const g = new Geo(true);
  for (let c = 0; c < N * N; c++) if (LV.wet2[c] && LV.zone[c] === ZP2.GALL || (LV.wet2[c] && LV.zone[c] === ZP2.WREG)) { const x0 = (c % N) * CELL, z0 = ((c / N) | 0) * CELL; g.face(x0, 0, z0 + CELL, [1, 0, 0], [0, 0, -1], CELL, CELL, [0, 1, 0], 1, true, [1, 1, 1, 1]); }
  if (!g.p.length) return;
  const names = ['world', 'viewProjection', 'wP', ...COMMON_UNIFORMS];
  const m = new BABYLON.ShaderMaterial('water2', SCN, { vertex: 'water2', fragment: 'water2' }, { attributes: ['position', 'uv', 'color'], uniforms: names, samplers: ['lightTex'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex); m.setVector4('wP', new BABYLON.Vector4(0.85, 0.6, 0, 0)); m.backFaceCulling = false; m.alphaMode = BABYLON.Engine.ALPHA_COMBINE; m.disableDepthWrite = true; MATS.list.push(m);
  const mesh = g.mesh('water2', scene); mesh.material = m; mesh.position.y = 0.06; mesh.isPickable = false; mesh.alphaIndex = 5; mesh._sortD = 100; WP2.water = mesh;
}

// ---------- lamps: what lights the bake (LV.l2Lights) and where the fittings go (LV.l2Fix) ----------
const LC2 = { warm: [1.0, 0.72, 0.44], sodium: [1.0, 0.6, 0.27], fluo: [0.86, 0.94, 1.0], cold: [0.78, 0.9, 1.0], red: [1.0, 0.16, 0.07], green: [0.3, 1.0, 0.45], fire: [1.0, 0.42, 0.12], lamp: [1.0, 0.8, 0.52] };
function planLights2() {
  LV.fixtures = []; LV.panels = []; LV.bulbs = []; LV.l2Lights = []; LV.l2Fix = [];
  const LL = (o) => { const l = Object.assign({ r: 0.06, rng: 9, kind: 'pt', flick: 0, hz: 0.5, hr: 0.25, up: 0.08 }, o); l.I *= 2.1; l.rng *= 1.25; LV.l2Lights.push(l); return l; };
  const fix = (o) => { LV.l2Fix.push(o); return o; };
  const flicker = (p) => RNG() < p;
  // tunnels: bulkhead lamps on the walls, every other cell, alternating sides
  const isWall = (x, y, d) => edgeVal(x, y, d) !== 0;
  for (const r of LV.rooms) {
    const cc = r.cells.map(c => [c % N, (c / N) | 0]);
    if (r.arch === 'tun') cc.forEach(([x, y], i) => {
      const c = cIdx(x, y); if (LV.dark[c] || (x + y) % 2) return;
      const sides = [0, 1, 2, 3].filter(d => isWall(x, y, d) && !LV.ek.get(eKey(x, y, d)) && !LV.ek.get(eKey(x + DX[d], y + DY[d], (d + 2) % 4))); if (!sides.length) return;
      const d = sides[(x + y) % sides.length], [px, pz, ry] = wallPt(x, y, d, 0.12, 0), fl = flicker(r.t === 'long' ? 0.3 : 0.12), dead = RNG() < 0.06;
      fix({ kind: 'bulkhead', x: px, z: pz, y: 2.55, ry, on: !dead, flick: fl });
      if (!dead) LL({ p: [px, 2.5, pz], c: LC2.warm, I: 4.2, rng: 10, flick: fl, hz: 0.8 });
    });
    else if (r.t === 'gall') cc.forEach(([x, y]) => { if ((x * 7 + y * 3) % 3) return; const fl = flicker(0.25); fix({ kind: 'red', x: cellCenter(x), z: cellCenter(y), y: r.h - 0.35, on: true, flick: fl }); LL({ p: [cellCenter(x), r.h - 0.45, cellCenter(y)], c: LC2.red, I: 3.0, rng: 9, flick: fl, hz: 1.2 }); });
    else if (r.t === 'shelter') { const [x, y] = cc[0]; fix({ kind: 'green', x: cellCenter(x), z: cellCenter(y), y: r.h - 0.25, on: true }); LL({ p: [cellCenter(x), r.h - 0.35, cellCenter(y)], c: LC2.green, I: 1.6, rng: 5, hz: 0.6 }); }
    else if (r.t === 'hall' || r.t === 'tank') {
      for (const [x, y] of cc) if ((x % 3 === 1 || r.t === 'tank') && y % 3 === 1 && (r.t === 'hall' || x % 2 === 0)) { const fl = flicker(0.12), px = cellCenter(x), pz = cellCenter(y), py = r.h - 1.6;
        fix({ kind: 'highbay', x: px, z: pz, y: py, top: r.h, on: true, flick: fl }); LL({ kind: 'spot', p: [px, py - 0.2, pz], d: [0, -1, 0], co: Math.cos(1.25), ci: Math.cos(0.6), up: 0.1, c: LC2.sodium, I: 30, r: 0.18, rng: 18, flick: fl, hz: 1.0, hr: 0.4 }); }
    }
    else if (r.t === 'switch') {
      for (const [x, y] of cc) if (x % 2 === 0 && y % 3 === 0) { const fl = flicker(0.14), px = cellCenter(x), pz = cellCenter(y), py = 4.4;
        fix({ kind: 'fluo', x: px, z: pz, y: py, top: r.h, len: 1.5, on: true, flick: fl }); LL({ kind: 'line', p: [px - 0.7, py - 0.08, pz], b: [px + 0.7, py - 0.08, pz], c: LC2.fluo, I: 7, rng: 11, flick: fl, hz: 0.35 }); }
    }
    else if (r.t === 'coldA' || r.t === 'coldB' || r.t === 'coldC') { const xs = cc.map(q => q[0]), ys = cc.map(q => q[1]), px = (Math.min(...xs) + Math.max(...xs) + 1) / 2 * CELL, pz = (Math.min(...ys) + Math.max(...ys) + 1) / 2 * CELL;
      fix({ kind: 'fluo', x: px, z: pz, y: r.h - 0.05, top: r.h, len: 1.2, on: true, surface: true }); LL({ kind: 'line', p: [px - 0.55, r.h - 0.12, pz], b: [px + 0.55, r.h - 0.12, pz], c: LC2.cold, I: 4.5, rng: 8, hz: 0.2 }); }
    else if (r.t === 'office') { const px = cellCenter(30), pz = cellCenter(32); LL({ p: [cellCenter(31) + 0.6, 1.25, cellCenter(32) - 1.2], c: LC2.lamp, I: 1.3, rng: 5, hz: 0.2 }); fix({ kind: 'desklamp', x: cellCenter(31) + 0.65, z: cellCenter(32) - 1.25, y: 0.85 });
      fix({ kind: 'fluo', x: px, z: pz, y: r.h - 0.05, top: r.h, len: 1.2, on: true, surface: true }); LL({ kind: 'line', p: [px - 0.55, r.h - 0.12, pz], b: [px + 0.55, r.h - 0.12, pz], c: LC2.fluo, I: 3.6, rng: 9, hz: 0.2 }); }
    else if (r.t === 'sump') { for (const [x, y] of [[25, 48], [28, 48], [26, 50]]) { const px = cellCenter(x), pz = cellCenter(y); fix({ kind: 'cage', x: px, z: pz, y: 4.2, on: true }); LL({ p: [px, 4.1, pz], c: LC2.warm, I: 6, rng: 11, hz: 0.9 }); } fix({ kind: 'beacon', x: cellCenter(28) + 1.2, z: cellCenter(47) - 1.4, y: 3.0 }); LL({ p: [cellCenter(28) + 1.0, 2.95, cellCenter(47) - 1.2], c: LC2.red, I: 1.2, rng: 6, flick: 1, hz: 0.6 }); }
    else if (r.t === 'lift') { const px = cellCenter(48) + CELL / 2, pz = cellCenter(8); fix({ kind: 'cage', x: px, z: pz, y: 3.8, on: true }); LL({ p: [px, 3.7, pz], c: LC2.warm, I: 5, rng: 10, hz: 0.7 }); }
    else if (r.t === 'camp') { fix({ kind: 'cage', x: cellCenter(5) + CELL / 2, z: cellCenter(30) + CELL / 2, y: 2.6, on: true, flick: true }); LL({ p: [cellCenter(5) + CELL / 2, 2.5, cellCenter(30) + CELL / 2], c: LC2.warm, I: 3.2, rng: 9, flick: 1, hz: 0.6 }); }
    else if (r.t === 'shop') { const px = cellCenter(25), pz = cellCenter(38); fix({ kind: 'fluo', x: px, z: pz, y: r.h - 0.05, top: r.h, len: 1.2, on: true, surface: true, flick: true }); LL({ kind: 'line', p: [px - 0.55, r.h - 0.12, pz], b: [px + 0.55, r.h - 0.12, pz], c: LC2.fluo, I: 5, rng: 9, flick: 1, hz: 0.3 }); LL({ p: [cellCenter(24) + 0.4, 1.55, pz], c: LC2.lamp, I: 1.4, rng: 5, hz: 0.3 }); }
    else if (r.t === 'valve' || r.t === 'wreg') { const xs = cc.map(q => q[0]), ys = cc.map(q => q[1]), px = (Math.min(...xs) + Math.max(...xs) + 1) / 2 * CELL, pz = (Math.min(...ys) + Math.max(...ys) + 1) / 2 * CELL; fix({ kind: 'cage', x: px, z: pz, y: r.h - 0.35, on: true }); LL({ p: [px, r.h - 0.45, pz], c: r.t === 'wreg' ? LC2.red : LC2.warm, I: 3.6, rng: 9, hz: 0.8 }); }
  }
  // the old 2D bake only provides collision masks and wall distances now
  LV.sky = null;
}
