// ---------- r9 · Level 2 · Pipe Dreams: layout, wall pieces, geometry, lights ----------
// Hot, dark maintenance tunnels. A spine runs north from the sump the camera climbs out of; the Boiler Office (Ida) hangs off it;
// three sectors each hold a pressure regulator: the Low Galleries (west, standing hot water), the Switchyard (north, the Facelings' shift)
// and the Long Pipe (east, the Hound). The Gamma Lift (north-east) needs power and all three regulators. See docs/LEVEL2.md.
const ZP2 = { VOID: 0, SUMP: 1, SPINE: 2, OFFICE: 3, HALL: 4, COLD: 5, GALL: 6, CAMP: 7, SWITCH: 8, LONG: 9, VALVE: 10, LIFT: 11, SHELTER: 12, WREG: 13, CORR: 14 };
const R2Z = { HUB: 0, WEST: 1, NORTH: 2, EAST: 3 };
const L2_N = 48, L2_LMR = 768;
const cell2 = (x, z) => cIdx(cellOf(x), cellOf(z));
const TRIM2 = { steel: [0.32, 0.33, 0.33], rust: [0.36, 0.2, 0.12], yellow: [0.72, 0.58, 0.12], dark: [0.09, 0.09, 0.09], green: [0.2, 0.36, 0.28], white: [0.75, 0.77, 0.76] };
function genLayout2() {
  const n = N;
  LV.zone = new Uint8Array(n * n); LV.room = new Int16Array(n * n).fill(-1); LV.reg = new Int8Array(n * n).fill(-1); LV.dark = new Uint8Array(n * n);
  LV.fh = new Float32Array(n * n); LV.ch = new Float32Array(n * n); LV.safe2 = new Uint8Array(n * n); LV.hot2 = new Float32Array(n * n); LV.wet2 = new Uint8Array(n * n);
  LV.hE = new Uint8Array((n + 1) * n); LV.vE = new Uint8Array(n * (n + 1));
  LV.rooms = []; LV.ek = new Map(); LV.navVer = 0; LV.warps = []; LV.halls = []; LV.pillars = []; LV.darkCenters = []; LV.shelters2 = [];
  const room = (zone, reg, t, o = {}) => { const r = Object.assign({ id: LV.rooms.length, zone, reg, t, cells: [], h: 2.9 }, o); LV.rooms.push(r); return r; };
  const put = (r, x, y) => { const c = cIdx(x, y); if (LV.room[c] === r.id) return; LV.room[c] = r.id; LV.zone[c] = r.zone; LV.reg[c] = r.reg; LV.ch[c] = r.h; LV.hot2[c] = r.hot || 0; LV.safe2[c] = r.safe ? 1 : 0; LV.wet2[c] = r.wet ? 1 : 0; r.cells.push(c); };
  const rect = (r, x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) put(r, x, y); return r; };
  const way = (x, y, d, kind, o = {}) => { const e = Object.assign({ x, y, d, kind, from: [x, y] }, o); LV.ek.set(eKey(x, y, d), e); return e; };
  LV.dry = {};
  const S = {
    tun: { m: 'pwall', c: [1, 1, 1], t: TRIM2.dark, tp: 1 }, room: { m: 'bconc', c: [0.92, 0.9, 0.86], t: TRIM2.steel, tp: 2 }, office: { m: 'block', c: [0.82, 0.86, 0.78], t: TRIM2.green, tp: 2 },
    cold: { m: 'tile', c: [0.78, 0.88, 0.9], t: TRIM2.white, tp: 2 }, gall: { m: 'bconc', c: [0.62, 0.5, 0.44], t: TRIM2.rust, tp: 1 }, hall: { m: 'bconc', c: [0.78, 0.72, 0.64], t: TRIM2.rust, tp: 2 },
  };
  const F = { plate: { m: 'plate', col: [1, 1, 1] }, conc: { m: 'bfloor', col: [0.85, 0.82, 0.78] }, wet: { m: 'bfloor', col: [0.5, 0.42, 0.34] }, tile: { m: 'tile', col: [0.8, 0.86, 0.86] } };
  const T = (o) => Object.assign({ side: S.tun, flr: F.plate, cm: 'deck', cc: [1, 1, 1] }, o);
  // ===== the hub =====
  const SUMP = rect(room(ZP2.SUMP, R2Z.HUB, 'sump', T({ h: 3.4, flr: F.wet, side: S.room, safe: true })), 22, 40, 24, 42); LV.dry.sump = SUMP;
  const SP = rect(room(ZP2.SPINE, R2Z.HUB, 'spine', T({ h: 2.9, hot: 0.12 })), 23, 14, 23, 39); LV.dry.spine = SP;
  way(23, 39, 1, 'open');
  const OF = rect(room(ZP2.OFFICE, R2Z.HUB, 'office', T({ h: 2.8, side: S.office, flr: F.conc, cm: 'bconc', cc: [0.8, 0.82, 0.76], safe: true })), 24, 27, 27, 30); LV.dry.office = OF;
  way(23, 28, 0, 'door', { dk: 'office', plaque: 'BOILER OFFICE' });
  const BC = rect(room(ZP2.CORR, R2Z.HUB, 'bcorr', T({ h: 2.9, hot: 0.2 })), 24, 25, 27, 25); way(23, 25, 0, 'open');
  const HALL = rect(room(ZP2.HALL, R2Z.HUB, 'hall', T({ h: 6.5, side: S.hall, flr: F.conc, cm: 'deck', hot: 0.5 })), 28, 22, 34, 32); LV.dry.hall = HALL;
  way(27, 25, 0, 'door', { dk: 'hall', plaque: 'BOILER HALL' });
  const CA = rect(room(ZP2.COLD, R2Z.HUB, 'coldA', T({ h: 2.6, side: S.cold, flr: F.tile, cm: 'tile', cc: [0.8, 0.86, 0.88], safe: true, cold: true })), 21, 35, 22, 36); LV.dry.coldA = CA;
  way(23, 35, 2, 'door', { dk: 'cold', plaque: 'COLD STORE' });
  // ===== west: the Low Galleries (standing hot water, red bulbs) =====
  const GC = rect(room(ZP2.CORR, R2Z.WEST, 'gcorr', T({ h: 2.7, hot: 0.25 })), 15, 22, 22, 22); way(23, 22, 2, 'open'); LV.dry.gcorr = GC;
  const GA = room(ZP2.GALL, R2Z.WEST, 'gall', T({ h: 2.6, side: S.gall, flr: F.wet, cm: 'bconc', cc: [0.4, 0.34, 0.3], hot: 0.55, wet: true }));
  rect(GA, 2, 20, 14, 20); rect(GA, 2, 26, 14, 26); rect(GA, 2, 32, 14, 32); rect(GA, 2, 20, 2, 33); rect(GA, 8, 20, 8, 36); rect(GA, 14, 20, 14, 32);
  way(14, 22, 0, 'open'); LV.dry.gall = GA;
  const CAMP = rect(room(ZP2.CAMP, R2Z.WEST, 'camp', T({ h: 2.6, side: S.room, flr: F.conc, cm: 'bconc', cc: [0.5, 0.48, 0.44], safe: true })), 4, 27, 6, 30); LV.dry.camp = CAMP;
  way(5, 26, 1, 'door', { dk: 'camp', plaque: 'STORE 9' });
  const CB = rect(room(ZP2.COLD, R2Z.WEST, 'coldB', T({ h: 2.6, side: S.cold, flr: F.tile, cm: 'tile', cc: [0.8, 0.86, 0.88], safe: true, cold: true })), 9, 28, 10, 29); LV.dry.coldB = CB;
  way(8, 28, 0, 'door', { dk: 'cold', plaque: 'COLD STORE' });
  const WR = rect(room(ZP2.WREG, R2Z.WEST, 'wreg', T({ h: 3.2, side: S.room, flr: F.wet, hot: 0.7, wet: true })), 1, 34, 3, 36); LV.dry.wreg = WR;
  way(2, 33, 1, 'open');
  // ===== north: the Switchyard =====
  const SW = rect(room(ZP2.SWITCH, R2Z.NORTH, 'switch', T({ h: 6.2, side: S.room, flr: F.conc, cm: 'deck', hot: 0.2 })), 16, 4, 30, 13); LV.dry.sw = SW;
  way(23, 14, 3, 'open');
  const LC = rect(room(ZP2.CORR, R2Z.NORTH, 'lcorr', T({ h: 2.9, hot: 0.1 })), 31, 8, 40, 8); LV.dry.lcorr = LC;
  way(30, 8, 0, 'door', { dk: 'sw', plaque: 'GAMMA LIFT' });
  const LIFT = rect(room(ZP2.LIFT, R2Z.NORTH, 'lift', T({ h: 3.2, side: S.room, flr: F.plate, cm: 'bconc', cc: [0.6, 0.6, 0.58], safe: true })), 41, 6, 43, 9); LV.dry.lift = LIFT;
  way(40, 8, 0, 'open');
  // ===== east: the Long Pipe =====
  const LP = room(ZP2.LONG, R2Z.EAST, 'long', T({ h: 3.0, hot: 0.4 }));
  rect(LP, 24, 18, 44, 18); rect(LP, 44, 18, 44, 41); rect(LP, 36, 41, 44, 41); LV.dry.long = LP;
  way(23, 18, 0, 'open');
  const VR = rect(room(ZP2.VALVE, R2Z.EAST, 'valve', T({ h: 3.2, side: S.room, flr: F.conc, cm: 'bconc', cc: [0.5, 0.46, 0.42], safe: true, hot: 0.3 })), 33, 40, 35, 42); LV.dry.valve = VR;
  way(36, 41, 2, 'door', { dk: 'valve', plaque: 'VALVE ROOM 4', locked: true, jammed: true });
  const CC = rect(room(ZP2.COLD, R2Z.EAST, 'coldC', T({ h: 2.6, side: S.cold, flr: F.tile, cm: 'tile', cc: [0.8, 0.86, 0.88], safe: true, cold: true })), 42, 28, 43, 29); LV.dry.coldC = CC;
  way(44, 28, 2, 'door', { dk: 'cold', plaque: 'COLD STORE' });
  // the long pipe's middle stretch has no working light
  for (let y = 23; y <= 36; y++) LV.dark[cIdx(44, y)] = 1;
  for (let x = 33; x <= 40; x++) LV.dark[cIdx(x, 18)] = 1;
  // ===== steam shelters: one-cell alcoves with a green lamp =====
  const shelter = (x, y, fx, fy, d) => { const r = rect(room(ZP2.SHELTER, LV.reg[cIdx(fx, fy)], 'shelter', T({ h: 2.5, side: S.room, flr: F.conc, cm: 'bconc', cc: [0.5, 0.5, 0.48], safe: true })), x, y, x, y); way(fx, fy, d, 'open', { shelter: true }); LV.shelters2.push({ x, y, fx, fy, d, r }); return r; };
  shelter(22, 31, 23, 31, 2); shelter(24, 20, 23, 20, 0); shelter(22, 16, 23, 16, 2); shelter(22, 38, 23, 38, 2);
  shelter(30, 19, 30, 18, 1); shelter(38, 19, 38, 18, 1); shelter(43, 24, 44, 24, 2); shelter(43, 34, 44, 34, 2); shelter(43, 39, 44, 39, 2);
  shelter(8, 37, 8, 36, 1); shelter(11, 19, 11, 20, 3); shelter(5, 33, 5, 32, 1); shelter(20, 21, 20, 22, 3);
  shelter(15, 8, 16, 8, 2); shelter(36, 7, 36, 8, 3);
  // ---- resolve every edge ----
  const rule = (a, b) => { const za = a < 0 ? 0 : LV.zone[a], zb = b < 0 ? 0 : LV.zone[b]; if (!za || !zb) return 1; return LV.room[a] >= 0 && LV.room[a] === LV.room[b] ? 0 : 1; };
  for (let y = 0; y <= n; y++) for (let x = 0; x < n; x++) LV.hE[hI(x, y)] = rule(y > 0 ? cIdx(x, y - 1) : -1, y < n ? cIdx(x, y) : -1);
  for (let y = 0; y < n; y++) for (let x = 0; x <= n; x++) LV.vE[vI(x, y)] = rule(x > 0 ? cIdx(x - 1, y) : -1, x < n ? cIdx(x, y) : -1);
  for (const e of LV.ek.values()) setEdge(e.x, e.y, e.d, e.kind === 'open' ? 0 : 2);
  LV.spawn = { x: 23, y: 41 };
}

// ---------- wall pieces ----------
function side2(x, y) {
  if (!inGrid(x, y)) return null;
  const c = cIdx(x, y); if (LV.zone[c] === ZP2.VOID) return null;
  const r = LV.rooms[LV.room[c]], s = r.side; return { m: s.m, c: s.c, t: s.t, tp: s.tp, h: LV.ch[c], fh: 0 };
}
function opening2(e) { if (!e) return null; if (e.kind === 'door') return { w: DOORW, h: DOORH, cw: 0.09 }; return null; }

// ---------- geometry: walls, trims, floors, ceilings ----------
const MAT2_S = { pwall: [1 / 2.4, 1 / 2.4], bconc: [1 / 2.4, 1 / 2.4], block: [1 / 1.6, 1 / 1.6], tile: [1 / 1.5, 1 / 1.5], plate: [1 / 1.2, 1 / 1.2], bfloor: [1 / 2.4, 1 / 2.4], deck: [1 / 2.4, 1 / 2.4], conc: [1 / 2.8, 1 / 2.8] };
const FLOORM2 = new Set(['plate', 'bfloor']), CEILM2 = new Set(['deck']);
function buildGeometry2(scene, mats) {
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
    let topY = 0;
    for (const [sd, sg] of [[p.sa, -1], [p.sb, 1]]) {
      if (!sd) continue;
      const [su, sv] = MAT2_S[sd.m] || [1, 1], g = geo(sd.m, ci), from = p.k === 'l' ? p.y0 : 0;
      if (p.horiz) vq(g, sg < 0 ? 3 : 1, sg < 0 ? p.z0 : p.z1, p.x0, p.x1, from, sd.h, su, sv, C4(sd.c));
      else vq(g, sg < 0 ? 2 : 0, sg < 0 ? p.x0 : p.x1, p.z0, p.z1, from, sd.h, su, sv, C4(sd.c));
      topY = Math.max(topY, sd.h);
    }
    if (p.k === 'w') {
      const lo = p.horiz ? p.z0 : p.x0, hi = p.horiz ? p.z1 : p.x1;
      if (p.cap0) vq(tg, p.horiz ? 2 : 3, p.a0, lo, hi, 0, p.capH0 ?? topY, 1, 1, tcol);
      if (p.cap1) vq(tg, p.horiz ? 0 : 1, p.a1, lo, hi, 0, p.capH1 ?? topY, 1, 1, tcol);
    } else tg.face(p.x0, p.y0, p.z0, [1, 0, 0], [0, 0, 1], p.x1 - p.x0, p.z1 - p.z0, [0, -1, 0], 1, false, tcol);
  }
  for (const t of LV.trims) geo('trim', chunkOf((t[0] + t[3]) / 2, (t[2] + t[5]) / 2)).box(t[0], t[1], t[2], t[3], t[4], t[5], 1, 31, C4(t[6]));
  // where two rooms of different heights meet through an open way, close the step in the ceiling
  for (const e of LV.ek.values()) {
    if (e.kind !== 'open') continue;
    const a = cIdx(e.x, e.y), b = cIdx(e.x + DX[e.d], e.y + DY[e.d]), ha = LV.ch[a], hb = LV.ch[b]; if (Math.abs(ha - hb) < 0.01) continue;
    const lo = ha < hb ? a : b, hi = ha < hb ? b : a, low = Math.min(ha, hb), top = Math.max(ha, hb), horiz = e.d === 1 || e.d === 3, [mx, mz] = edgeMid(e.x, e.y, e.d), sd = side2(hi % N, (hi / N) | 0), [su, sv] = MAT2_S[sd.m] || [1, 1], g = geo(sd.m, chunkOf(mx, mz));
    const facesHi = (hi === b) === (e.d === 0 || e.d === 1);   // the face looks into the taller room
    if (horiz) vq(g, facesHi ? 1 : 3, mz, mx - CELL / 2, mx + CELL / 2, low, top, su, sv, C4(sd.c)); else vq(g, facesHi ? 0 : 2, mx, mz - CELL / 2, mz + CELL / 2, low, top, su, sv, C4(sd.c));
  }
  const up = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z1, [1, 0, 0], [0, 0, -1], x1 - x0, z1 - z0, [0, 1, 0], s, false, col);
  const dn = (g, x0, z0, x1, z1, y, s, col) => g.face(x0, y, z0, [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, -1, 0], s, false, col);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y); if (LV.zone[c] === ZP2.VOID) continue;
    const r = LV.rooms[LV.room[c]], x0 = x * CELL, z0 = y * CELL, x1 = x0 + CELL, z1 = z0 + CELL, ci = chunkOf(x0 + 1, z0 + 1), hv = hash1(x * 31.7 + y * 17.3);
    const fm = r.flr.m, fc = r.flr.col, k = 0.9 + 0.12 * hv, fs = MAT2_S[fm];
    up(geo(fm, ci), x0, z0, x1, z1, 0, fs[0], [fc[0] * k, fc[1] * k, fc[2] * k, 1]);
    const cm = r.cm || 'deck', cs = MAT2_S[cm], cc = r.cc || [1, 1, 1];
    dn(geo(cm, ci), x0, z0, x1, z1, LV.ch[c], cs[0], C4(cc));
  }
  LV.chunkMeshes = [];
  for (const [k, g] of Object.entries(G)) {
    if (!g.p.length) continue; const [m] = k.split(':');
    const mesh = g.mesh('l2_' + k, scene); mesh.material = mats[m] || mats.pwall;
    if (FLOORM2.has(m)) mesh._sortD = 900; else if (CEILM2.has(m)) mesh._sortD = 950; else LV.chunkMeshes.push(mesh);
  }
}

// ---------- the standing hot water in the galleries: one thin murky plane ----------
function buildWater2(scene) {
  if (!BABYLON.Effect.ShadersStore.water2FragmentShader) {
    BABYLON.Effect.ShadersStore.water2VertexShader = BABYLON.Effect.ShadersStore.water37VertexShader;
    BABYLON.Effect.ShadersStore.water2FragmentShader = BABYLON.Effect.ShadersStore.water37FragmentShader.replace('vec3(0.03, 0.4, 0.26)', 'vec3(0.05, 0.05, 0.03)').replace('vec3(0.72, 0.9, 0.7)', 'vec3(0.42, 0.33, 0.24)').replace('vec3(0.7, 0.95, 0.7)', 'vec3(1.0, 0.75, 0.45)').replace('vec3(0.8, 1.0, 0.85)', 'vec3(1.0, 0.8, 0.5)');
  }
  const g = new Geo(true);
  for (let c = 0; c < N * N; c++) if (LV.wet2[c]) { const x0 = (c % N) * CELL, z0 = ((c / N) | 0) * CELL; g.face(x0, 0, z0 + CELL, [1, 0, 0], [0, 0, -1], CELL, CELL, [0, 1, 0], 1, true, [1, 1, 1, 1]); }
  if (!g.p.length) return;
  const names = ['world', 'viewProjection', 'wP', ...COMMON_UNIFORMS];
  const m = new BABYLON.ShaderMaterial('water2', SCN, { vertex: 'water2', fragment: 'water2' }, { attributes: ['position', 'uv', 'color'], uniforms: names, samplers: ['lightTex'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex); m.setVector4('wP', new BABYLON.Vector4(0.85, 0.6, 0, 0)); m.backFaceCulling = false; m.alphaMode = BABYLON.Engine.ALPHA_COMBINE; m.disableDepthWrite = true; MATS.list.push(m);
  const mesh = g.mesh('water2', scene); mesh.material = m; mesh.position.y = 0.07; mesh.isPickable = false; mesh.alphaIndex = 5; mesh._sortD = 100; WP2.water = mesh;
}

// ---------- lights: caged bulbs along the tunnels, red ones in the galleries, high lamps in the big rooms, green over the shelters ----------
function planLights2() {
  LV.fixtures = []; LV.panels = []; LV.bulbs = [];
  const F = (x, z, o) => { const f = Object.assign({ x, z, state: 1, seed: RNG() }, o); LV.fixtures.push(f); return f; };
  const bulb = (x, z, o = {}) => { const st = o.state ?? (RNG() < (o.flick ?? 0.15) ? 2 : 1); F(x, z, { I: o.I ?? 0.34, rad: o.rad ?? 7, sc: o.sc ?? 1.8, state: st }); LV.bulbs.push({ x, z, y: o.y ?? 2.55, kind: o.kind || 'cage', state: st, col: o.col }); };
  for (const r of LV.rooms) {
    const cc = r.cells.map(c => [c % N, (c / N) | 0]);
    if (r.t === 'spine' || r.t === 'long' || r.t === 'gcorr' || r.t === 'bcorr' || r.t === 'lcorr') cc.forEach(([x, y], i) => { const c = cIdx(x, y); if (LV.dark[c] || (x + y) % 3) return; bulb(cellCenter(x), cellCenter(y), { y: r.h - 0.35, flick: r.t === 'long' ? 0.3 : 0.12 }); });
    else if (r.t === 'gall') cc.forEach(([x, y]) => { if ((x * 7 + y * 3) % 4) return; bulb(cellCenter(x), cellCenter(y), { y: r.h - 0.3, I: 0.26, rad: 6, kind: 'red', flick: 0.25 }); });
    else if (r.t === 'shelter') { const [x, y] = cc[0]; bulb(cellCenter(x), cellCenter(y), { y: r.h - 0.3, I: 0.3, rad: 4, sc: 1.2, kind: 'green', state: 1 }); }
    else if (r.t === 'switch' || r.t === 'hall') { for (const [x, y] of cc) if (x % 3 === 1 && y % 3 === 1) { F(cellCenter(x), cellCenter(y), { I: r.t === 'switch' ? 0.72 : 0.5, rad: 14, sc: 5, state: RNG() < 0.15 ? 2 : 1 }); LV.bulbs.push({ x: cellCenter(x), z: cellCenter(y), y: r.h - 0.4, kind: 'high', state: 1 }); } }
    else if (r.t === 'coldA' || r.t === 'coldB' || r.t === 'coldC') { const [x, y] = cc[0]; F(cellCenter(x) + CELL / 2, cellCenter(y) + CELL / 2, { I: 0.55, rad: 7, sc: 2.4 }); LV.panels.push({ x: cellCenter(x) + CELL / 2, z: cellCenter(y) + CELL / 2, y: r.h, state: 1, w: 0.4, l: 1.2 }); }
    else if (r.t === 'office') { F(cellCenter(25) + CELL / 2, cellCenter(28) + CELL / 2, { I: 0.5, rad: 8, sc: 2.6 }); LV.bulbs.push({ x: cellCenter(25) + CELL / 2, z: cellCenter(28) + CELL / 2, y: 2.3, kind: 'pend', state: 1 }); }
    else for (const [x, y] of cc) if ((x + y) % 2 === 0) bulb(cellCenter(x), cellCenter(y), { y: r.h - 0.35, I: 0.38, rad: 8, flick: 0.1 });
  }
  LV.sky = null;
}
