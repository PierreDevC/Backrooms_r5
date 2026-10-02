// ---------- level layout, geometry, light-map, collision, navigation ----------
const LV = {};
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
const cIdx = (x, y) => y * N + x;
const hI = (x, y) => y * N + x;          // horizontal edge at z = y*CELL (y in 0..N)
const vI = (x, y) => y * (N + 1) + x;    // vertical edge at x = x*CELL (x in 0..N)
function edgeVal(x, y, d) { return d === 0 ? LV.vE[vI(x + 1, y)] : d === 1 ? LV.hE[hI(x, y + 1)] : d === 2 ? LV.vE[vI(x, y)] : LV.hE[hI(x, y)]; }
function setEdge(x, y, d, v) { if (d === 0) LV.vE[vI(x + 1, y)] = v; else if (d === 1) LV.hE[hI(x, y + 1)] = v; else if (d === 2) LV.vE[vI(x, y)] = v; else LV.hE[hI(x, y)] = v; }
function inGrid(x, y) { return x >= 0 && y >= 0 && x < N && y < N; }
function passable(x, y, d) { const nx = x + DX[d], ny = y + DY[d]; return inGrid(nx, ny) && edgeVal(x, y, d) !== 1; }
const cellOf = v => clamp(Math.floor(v / CELL), 0, N - 1);
const cellCenter = c => (c + 0.5) * CELL;

function genLayout() {
  LV.hE = new Uint8Array((N + 1) * N).fill(1);
  LV.vE = new Uint8Array(N * (N + 1)).fill(1);
  const vis = new Uint8Array(N * N), st = [[rndi(0, N - 1), rndi(0, N - 1)]];
  vis[cIdx(st[0][0], st[0][1])] = 1;
  while (st.length) {
    const [x, y] = st[st.length - 1], opts = [];
    for (let d = 0; d < 4; d++) { const nx = x + DX[d], ny = y + DY[d]; if (inGrid(nx, ny) && !vis[cIdx(nx, ny)]) opts.push(d); }
    if (!opts.length) { st.pop(); continue; }
    const d = pick(opts); setEdge(x, y, d, 0); vis[cIdx(x + DX[d], y + DY[d])] = 1; st.push([x + DX[d], y + DY[d]]);
  }
  const mutate = (arr, idx) => { const v = arr[idx]; if (v === 1) { const r = RNG(); arr[idx] = r < 0.42 ? 0 : r < 0.6 ? 2 : 1; } else if (RNG() < 0.2) arr[idx] = 2; };
  for (let y = 0; y < N; y++) for (let x = 1; x < N; x++) mutate(LV.vE, vI(x, y));
  for (let y = 1; y < N; y++) for (let x = 0; x < N; x++) mutate(LV.hE, hI(x, y));
  LV.hall = new Int8Array(N * N).fill(-1); LV.halls = [];
  for (let k = 0; k < 8; k++) {
    const w = rndi(3, 6), h = rndi(3, 5), x0 = rndi(1, N - w - 1), y0 = rndi(1, N - h - 1);
    for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
      LV.hall[cIdx(x, y)] = k;
      if (x < x0 + w - 1) setEdge(x, y, 0, 0);
      if (y < y0 + h - 1) setEdge(x, y, 1, 0);
    }
    LV.halls.push({ x0, y0, w, h });
  }
}

function bfs(sx, sy, blockFn, edgeFn) {
  const D = new Int16Array(N * N).fill(-1), q = new Int32Array(N * N); let qh = 0, qt = 0;
  D[cIdx(sx, sy)] = 0; q[qt++] = cIdx(sx, sy);
  while (qh < qt) {
    const c = q[qh++], x = c % N, y = (c / N) | 0;
    for (let d = 0; d < 4; d++) {
      if (!passable(x, y, d) || (edgeFn && !edgeFn(x, y, d))) continue;
      const n = cIdx(x + DX[d], y + DY[d]);
      if (D[n] >= 0 || (blockFn && blockFn(n))) continue;
      D[n] = D[c] + 1; q[qt++] = n;
    }
  }
  return D;
}

function planLevel() {
  // spawn in a random corner region
  const corner = rndi(0, 3);
  const sx = corner & 1 ? rndi(N - 7, N - 3) : rndi(2, 6), sy = corner & 2 ? rndi(N - 7, N - 3) : rndi(2, 6);
  LV.spawn = { x: sx, y: sy };
  const D = bfs(sx, sy); LV.spawnD = D;
  // exit: far cell with a solid wall to mount the door on
  let best = -1, bestC = null;
  for (let c = 0; c < N * N; c++) {
    const x = c % N, y = (c / N) | 0; if (D[c] < 0) continue;
    const walls = [0, 1, 2, 3].filter(d => edgeVal(x, y, d) === 1);
    const score = D[c] + (walls.length ? 0 : -999) + RNG() * 3;
    if (score > best) { best = score; bestC = { x, y, d: pick(walls) }; }
  }
  LV.exit = bestC;
  // dark sectors (dead lights): away from spawn
  LV.dark = new Uint8Array(N * N); LV.darkCenters = [];
  for (let k = 0, tries = 0; k < 4 && tries < 400; tries++) {
    const x = rndi(2, N - 3), y = rndi(2, N - 3);
    if (D[cIdx(x, y)] < 8) continue;
    if (LV.darkCenters.some(p => Math.hypot(p.x - x, p.y - y) < 8)) continue;
    if (Math.hypot(x - LV.exit.x, y - LV.exit.y) < 4) continue;
    const r = rnd(2.2, 3.4); LV.darkCenters.push({ x, y, r }); k++;
    for (let yy = 0; yy < N; yy++) for (let xx = 0; xx < N; xx++) if (Math.hypot(xx - x, yy - y) < r + rnd(-0.4, 0.4)) LV.dark[cIdx(xx, yy)] = 1;
  }
  // tape sites: spread out with farthest-point sampling
  const pts = [{ x: sx, y: sy }, { x: LV.exit.x, y: LV.exit.y }], tapes = [];
  for (let k = 0; k < 4; k++) {
    let bs = -1, bc = null;
    for (let c = 0; c < N * N; c++) {
      if (D[c] < 7) continue; const x = c % N, y = (c / N) | 0;
      let md = 1e9; for (const p of pts) md = Math.min(md, Math.hypot(p.x - x, p.y - y));
      const s = md + RNG() * 2.5 + (k === 2 && LV.dark[c] ? 4 : 0);
      if (s > bs) { bs = s; bc = { x, y }; }
    }
    pts.push(bc); tapes.push(bc);
  }
  LV.tapeCells = tapes;
  // fixtures
  LV.fixtures = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y); const nearSpawn = Math.abs(x - sx) <= 1 && Math.abs(y - sy) <= 1;
    const isExit = x === LV.exit.x && y === LV.exit.y;
    let state = 1, r = RNG();
    if (LV.dark[c]) state = r < 0.84 ? 0 : r < 0.95 ? 2 : 1; else state = r < 0.84 ? 1 : r < 0.92 ? 2 : 0;
    if (nearSpawn || isExit) state = 1;
    LV.fixtures.push({ x: cellCenter(x), z: cellCenter(y) + 0.3, state, cell: c, seed: RNG() });
  }
}

// ---------- geometry ----------
const FLIP_WINDING = true;
class Geo {
  constructor(withColor) { this.p = []; this.n = []; this.t = []; this.uv = []; this.i = []; this.c = withColor ? [] : null; }
  face(ox, oy, oz, U, V, du, dv, Nn, s, uvFix, col) {
    const b = this.p.length / 3;
    const P = [[ox, oy, oz], [ox + U[0] * du, oy + U[1] * du, oz + U[2] * du], [ox + U[0] * du + V[0] * dv, oy + U[1] * du + V[1] * dv, oz + U[2] * du + V[2] * dv], [ox + V[0] * dv, oy + V[1] * dv, oz + V[2] * dv]];
    const fixed = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (let k = 0; k < 4; k++) {
      const q = P[k]; this.p.push(q[0], q[1], q[2]); this.n.push(Nn[0], Nn[1], Nn[2]); this.t.push(U[0], U[1], U[2], 1);
      if (uvFix) this.uv.push(fixed[k][0], fixed[k][1]); else this.uv.push((q[0] * U[0] + q[1] * U[1] + q[2] * U[2]) * s, (q[0] * V[0] + q[1] * V[1] + q[2] * V[2]) * s);
      if (this.c) this.c.push(col[0], col[1], col[2], col[3]);
    }
    if (FLIP_WINDING) this.i.push(b, b + 2, b + 1, b, b + 3, b + 2); else this.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
  box(x0, y0, z0, x1, y1, z1, s, mask = 63, col) {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0;
    if (mask & 1) this.face(x1, y0, z1, [0, 0, -1], [0, 1, 0], dz, dy, [1, 0, 0], s, false, col);
    if (mask & 2) this.face(x0, y0, z0, [0, 0, 1], [0, 1, 0], dz, dy, [-1, 0, 0], s, false, col);
    if (mask & 4) this.face(x0, y0, z1, [1, 0, 0], [0, 1, 0], dx, dy, [0, 0, 1], s, false, col);
    if (mask & 8) this.face(x1, y0, z0, [-1, 0, 0], [0, 1, 0], dx, dy, [0, 0, -1], s, false, col);
    if (mask & 16) this.face(x0, y1, z1, [1, 0, 0], [0, 0, -1], dx, dz, [0, 1, 0], s, false, col);
    if (mask & 32) this.face(x0, y0, z0, [1, 0, 0], [0, 0, 1], dx, dz, [0, -1, 0], s, false, col);
  }
  mesh(name, scene) {
    const m = new BABYLON.Mesh(name, scene), vd = new BABYLON.VertexData();
    vd.positions = this.p; vd.normals = this.n; vd.tangents = this.t; vd.uvs = this.uv; vd.indices = this.i; if (this.c) vd.colors = this.c;
    vd.applyToMesh(m); m.isPickable = false; m.hasVertexAlpha = false; return m;
  }
}

function collectPieces() {
  const pieces = [], trims = [];
  const H = WT / 2;
  const addH = (xa, xb, z, v) => { // wall along x at z
    if (v === 1) pieces.push({ x0: xa - H, z0: z - H, x1: xb + H, z1: z + H, y0: 0, y1: CEIL, k: 'w' });
    else if (v === 2) {
      const m = (xa + xb) / 2, a = m - DOORW / 2, b = m + DOORW / 2;
      pieces.push({ x0: xa - H, z0: z - H, x1: a, z1: z + H, y0: 0, y1: CEIL, k: 'w' });
      pieces.push({ x0: b, z0: z - H, x1: xb + H, z1: z + H, y0: 0, y1: CEIL, k: 'w' });
      pieces.push({ x0: a, z0: z - H, x1: b, z1: z + H, y0: DOORH, y1: CEIL, k: 'l' });
      const o = 0.016, cw = 0.075;
      trims.push([a - cw, 0, z - H - o, a + 0.012, DOORH + cw, z + H + o]);
      trims.push([b - 0.012, 0, z - H - o, b + cw, DOORH + cw, z + H + o]);
      trims.push([a - cw, DOORH - 0.012, z - H - o, b + cw, DOORH + cw, z + H + o]);
    }
  };
  const addV = (za, zb, x, v) => {
    if (v === 1) pieces.push({ x0: x - H, z0: za - H, x1: x + H, z1: zb + H, y0: 0, y1: CEIL, k: 'w' });
    else if (v === 2) {
      const m = (za + zb) / 2, a = m - DOORW / 2, b = m + DOORW / 2;
      pieces.push({ x0: x - H, z0: za - H, x1: x + H, z1: a, y0: 0, y1: CEIL, k: 'w' });
      pieces.push({ x0: x - H, z0: b, x1: x + H, z1: zb + H, y0: 0, y1: CEIL, k: 'w' });
      pieces.push({ x0: x - H, z0: a, x1: x + H, z1: b, y0: DOORH, y1: CEIL, k: 'l' });
      const o = 0.016, cw = 0.075;
      trims.push([x - H - o, 0, a - cw, x + H + o, DOORH + cw, a + 0.012]);
      trims.push([x - H - o, 0, b - 0.012, x + H + o, DOORH + cw, b + cw]);
      trims.push([x - H - o, DOORH - 0.012, a - cw, x + H + o, DOORH + cw, b + cw]);
    }
  };
  for (let y = 0; y <= N; y++) for (let x = 0; x < N; x++) { const v = LV.hE[hI(x, y)]; if (v) addH(x * CELL, (x + 1) * CELL, y * CELL, v); }
  for (let y = 0; y < N; y++) for (let x = 0; x <= N; x++) { const v = LV.vE[vI(x, y)]; if (v) addV(y * CELL, (y + 1) * CELL, x * CELL, v); }
  // free-standing pillars at open vertices
  LV.pillars = [];
  for (let gy = 1; gy < N; gy++) for (let gx = 1; gx < N; gx++) {
    const e = LV.hE[hI(gx - 1, gy)] | LV.hE[hI(gx, gy)] | LV.vE[vI(gx, gy - 1)] | LV.vE[vI(gx, gy)];
    if (e) continue;
    const hs = [cIdx(gx - 1, gy - 1), cIdx(gx, gy - 1), cIdx(gx - 1, gy), cIdx(gx, gy)].map(c => LV.hall[c]);
    const hall = hs[0] >= 0 && hs.every(h => h === hs[0]);
    if (RNG() < (hall ? 0.8 : 0.1)) {
      const s = hall ? 0.28 : 0.22, x = gx * CELL, z = gy * CELL;
      pieces.push({ x0: x - s, z0: z - s, x1: x + s, z1: z + s, y0: 0, y1: CEIL, k: 'p' });
      LV.pillars.push({ x, z });
    }
  }
  // baseboards
  for (const p of pieces) {
    if (p.k === 'l') continue;
    const o = 0.013, alongX = (p.x1 - p.x0) > (p.z1 - p.z0);
    if (p.k === 'p') trims.push([p.x0 - o, 0, p.z0 - o, p.x1 + o, 0.1, p.z1 + o]);
    else if (alongX) trims.push([p.x0, 0, p.z0 - o, p.x1, 0.1, p.z1 + o]);
    else trims.push([p.x0 - o, 0, p.z0, p.x1 + o, 0.1, p.z1]);
  }
  LV.pieces = pieces; LV.trims = trims;
}

function buildGeometry(scene, mats) {
  const CH = 8, NC = Math.ceil(N / CH), wallGeo = [], trimGeo = [];
  for (let i = 0; i < NC * NC; i++) { wallGeo.push(new Geo()); trimGeo.push(new Geo()); }
  const chunkOf = (x, z) => clamp(Math.floor(z / CELL / CH), 0, NC - 1) * NC + clamp(Math.floor(x / CELL / CH), 0, NC - 1);
  const ws = 1 / 0.9;
  for (const p of LV.pieces) {
    const g = wallGeo[chunkOf((p.x0 + p.x1) / 2, (p.z0 + p.z1) / 2)];
    g.box(p.x0, p.y0, p.z0, p.x1, p.y1, p.z1, ws, p.k === 'l' ? 47 : 15);
  }
  for (const t of LV.trims) trimGeo[chunkOf((t[0] + t[3]) / 2, (t[2] + t[5]) / 2)].box(t[0], t[1], t[2], t[3], t[4], t[5], 1, 31);
  LV.chunkMeshes = [];
  wallGeo.forEach((g, i) => { if (!g.p.length) return; const m = g.mesh('walls' + i, scene); m.material = mats.wall; LV.chunkMeshes.push(m); });
  trimGeo.forEach((g, i) => { if (!g.p.length) return; const m = g.mesh('trim' + i, scene); m.material = mats.trim; LV.chunkMeshes.push(m); });
  const fg = new Geo(); fg.face(0, 0, LEVEL, [1, 0, 0], [0, 0, -1], LEVEL, LEVEL, [0, 1, 0], 1.0);
  const floor = fg.mesh('floor', scene); floor.material = mats.floor;
  const cg = new Geo(); cg.face(0, CEIL, 0, [1, 0, 0], [0, 0, 1], LEVEL, LEVEL, [0, -1, 0], 1 / 1.2);
  const ceil = cg.mesh('ceiling', scene); ceil.material = mats.ceil;
  floor._sortD = 900; ceil._sortD = 950;
  // light fixtures (troffers), aligned to the ceiling-tile grid
  const xg = new Geo(true);
  for (const f of LV.fixtures) {
    const col = [f.state === 0 ? 0 : 1, f.state === 2 ? 1 : 0, f.seed, 1], y = CEIL - 0.018;
    const x0 = f.x - 0.6, z0 = f.z - 0.3;
    xg.face(x0, y, z0, [1, 0, 0], [0, 0, 1], 1.2, 0.6, [0, -1, 0], 1, true, col);
    xg.face(x0, y, z0, [1, 0, 0], [0, 1, 0], 1.2, 0.018, [0, 0, -1], 1, true, [0, 0, 0, 1]);
    xg.face(x0, y, z0 + 0.6, [1, 0, 0], [0, 1, 0], 1.2, 0.018, [0, 0, 1], 1, true, [0, 0, 0, 1]);
  }
  const fx = xg.mesh('fixtures', scene); fx.material = mats.fixture; fx._sortD = 920;
}

// ---------- light map (baked fluorescent lighting with real occlusion) ----------
function buildLightmap(scene) {
  const R = LMR, solid = new Uint8Array(R * R);
  const mark = (x0, z0, x1, z1) => {
    const i0 = Math.max(0, Math.ceil(x0 / LMS - 1)), i1 = Math.min(R - 1, Math.floor(x1 / LMS));
    const j0 = Math.max(0, Math.ceil(z0 / LMS - 1)), j1 = Math.min(R - 1, Math.floor(z1 / LMS));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const cx = (i + 0.5) * LMS, cz = (j + 0.5) * LMS;
      if (cx >= x0 - LMS * 0.5 && cx <= x1 + LMS * 0.5 && cz >= z0 - LMS * 0.5 && cz <= z1 + LMS * 0.5) solid[j * R + i] = 1;
    }
  };
  for (const p of LV.pieces) if (p.k !== 'l' && !p.noLM) mark(p.x0, p.z0, p.x1, p.z1);
  LV.solid = solid; LV.dyn = new Uint8Array(R * R);
  const steady = new Float32Array(R * R), flick = new Float32Array(R * R), stamp = new Int32Array(R * R).fill(-1);
  const RAYS = 900, cosT = [], sinT = [];
  for (let a = 0; a < RAYS; a++) { cosT.push(Math.cos(a / RAYS * TAU)); sinT.push(Math.sin(a / RAYS * TAU)); }
  LV.fixtures.forEach((f, fid) => {
    if (f.state === 0) return;
    const Rm = f.rad || 7.8, Rt = Rm / LMS, sc = f.sc || 2.4, I = f.I ?? 1, st = Math.max(1, Math.round(RAYS / Math.max(420, Rt * TAU * 1.25)));
    const tgt = f.state === 2 ? flick : steady, fx = f.x / LMS, fz = f.z / LMS;
    for (let a = 0; a < RAYS; a += st) {
      const dx = cosT[a], dz = sinT[a];
      for (let t = 0; t < Rt; t += 0.5) {
        const ix = Math.floor(fx + dx * t), iz = Math.floor(fz + dz * t);
        if (ix < 0 || iz < 0 || ix >= R || iz >= R) break;
        const idx = iz * R + ix; if (solid[idx]) break;
        if (stamp[idx] === fid) continue; stamp[idx] = fid;
        const d = Math.hypot((ix + 0.5) * LMS - f.x, (iz + 0.5) * LMS - f.z);
        tgt[idx] += I * Math.pow(1 + (d / sc) ** 2, -1.25) * (1 - smooth(Rm * 0.5, Rm, d));
      }
    }
  });
  // edge-aware separable blur (does not bleed through walls)
  const blur = (src) => {
    const tmp = new Float32Array(R * R), out = new Float32Array(R * R), rad = 2;
    for (let pass = 0; pass < 2; pass++) {
      const a = pass ? tmp : src, b = pass ? out : tmp;
      for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
        const idx = j * R + i; if (solid[idx]) { b[idx] = a[idx]; continue; }
        let s = a[idx], w = 1;
        for (const dir of [-1, 1]) for (let k = 1; k <= rad; k++) {
          const ii = pass ? i : i + dir * k, jj = pass ? j + dir * k : j;
          if (ii < 0 || jj < 0 || ii >= R || jj >= R) break;
          const n = jj * R + ii; if (solid[n]) break; s += a[n]; w++;
        }
        b[idx] = s / w;
      }
    }
    return out;
  };
  let S1 = blur(steady), F1 = blur(flick); S1 = blur(S1); F1 = blur(F1);
  // wall distance (chamfer transform)
  const dist = new Float32Array(R * R);
  for (let i = 0; i < R * R; i++) dist[i] = solid[i] ? 0 : 1e4;
  const D2 = Math.SQRT2;
  for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
    const k = j * R + i; let v = dist[k];
    if (i > 0) v = Math.min(v, dist[k - 1] + 1);
    if (j > 0) { v = Math.min(v, dist[k - R] + 1); if (i > 0) v = Math.min(v, dist[k - R - 1] + D2); if (i < R - 1) v = Math.min(v, dist[k - R + 1] + D2); }
    dist[k] = v;
  }
  for (let j = R - 1; j >= 0; j--) for (let i = R - 1; i >= 0; i--) {
    const k = j * R + i; let v = dist[k];
    if (i < R - 1) v = Math.min(v, dist[k + 1] + 1);
    if (j < R - 1) { v = Math.min(v, dist[k + R] + 1); if (i < R - 1) v = Math.min(v, dist[k + R + 1] + D2); if (i > 0) v = Math.min(v, dist[k + R - 1] + D2); }
    dist[k] = v;
  }
  const data = new Uint8Array(R * R * 4);
  for (let i = 0; i < R * R; i++) {
    data[i * 4] = clamp(S1[i] / 2 * 255, 0, 255);
    data[i * 4 + 1] = clamp(dist[i] * LMS * 255, 0, 255);
    data[i * 4 + 2] = clamp(F1[i] / 2 * 255, 0, 255);
    data[i * 4 + 3] = LV.sky ? LV.sky[i] : 0;
  }
  LV.lmS = S1; LV.lmF = F1; LV.wallDist = dist;
  const tex = new BABYLON.RawTexture(data, R, R, BABYLON.Engine.TEXTUREFORMAT_RGBA, scene, false, false, BABYLON.Texture.BILINEAR_SAMPLINGMODE);
  tex.wrapU = tex.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
  LV.lightTex = tex;
  LV.cellLight = new Float32Array(N * N);
  for (let c = 0; c < N * N; c++) LV.cellLight[c] = baseLight(cellCenter(c % N), cellCenter((c / N) | 0), 0.4);
}
function baseLight(x, z, flickVal) {
  const fx = clamp(x / LMS - 0.5, 0, LMR - 1.001), fz = clamp(z / LMS - 0.5, 0, LMR - 1.001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, R = LMR;
  const s = (A) => lerp(lerp(A[j * R + i], A[j * R + i + 1], u), lerp(A[(j + 1) * R + i], A[(j + 1) * R + i + 1], u), v);
  return s(LV.lmS) + s(LV.lmF) * flickVal;
}

// ---------- collision ----------
let BK = 2, NBK = Math.ceil(LEVEL / BK);
function buildCollision() {
  LV.solids = []; LV.buckets = Array.from({ length: NBK * NBK }, () => []);
  for (const p of LV.pieces) if (p.k !== 'l' && !p.noCol) addSolid(p.x0, p.z0, p.x1, p.z1);
}
function addSolid(x0, z0, x1, z1, tag) {
  const i = LV.solids.length; LV.solids.push({ x0, z0, x1, z1, tag });
  for (let bz = Math.max(0, Math.floor(z0 / BK)); bz <= Math.min(NBK - 1, Math.floor(z1 / BK)); bz++)
    for (let bx = Math.max(0, Math.floor(x0 / BK)); bx <= Math.min(NBK - 1, Math.floor(x1 / BK)); bx++) LV.buckets[bz * NBK + bx].push(i);
  return i;
}
function collide(p, r) {
  for (let it = 0; it < 3; it++) {
    let moved = false;
    const bx0 = Math.max(0, Math.floor((p.x - r) / BK)), bx1 = Math.min(NBK - 1, Math.floor((p.x + r) / BK));
    const bz0 = Math.max(0, Math.floor((p.z - r) / BK)), bz1 = Math.min(NBK - 1, Math.floor((p.z + r) / BK));
    for (let bz = bz0; bz <= bz1; bz++) for (let bx = bx0; bx <= bx1; bx++) for (const si of LV.buckets[bz * NBK + bx]) {
      const b = LV.solids[si]; if (b.off) continue;
      const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1);
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-9) { const d = Math.sqrt(d2), k = (r - d) / d; p.x += dx * k; p.z += dz * k; }
      else {
        const pen = [p.x - b.x0 + r, b.x1 - p.x + r, p.z - b.z0 + r, b.z1 - p.z + r], m = Math.min(...pen), w = pen.indexOf(m);
        if (w === 0) p.x -= m; else if (w === 1) p.x += m; else if (w === 2) p.z -= m; else p.z += m;
      }
      moved = true;
    }
    if (!moved) break;
  }
  p.x = clamp(p.x, r, LEVEL - r); p.z = clamp(p.z, r, LEVEL - r);
}
function solidAt(x, z) { const i = Math.floor(x / LMS), j = Math.floor(z / LMS); if (i < 0 || j < 0 || i >= LMR || j >= LMR) return true; const k = j * LMR + i; return LV.solid[k] === 1 || LV.dyn[k] === 1; }
// mark / clear a dynamic occluder (closed doors) in the line-of-sight mask
function markDyn(x0, z0, x1, z1, v) {
  const i0 = Math.max(0, Math.floor(x0 / LMS)), i1 = Math.min(LMR - 1, Math.floor(x1 / LMS)), j0 = Math.max(0, Math.floor(z0 / LMS)), j1 = Math.min(LMR - 1, Math.floor(z1 / LMS));
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) LV.dyn[j * LMR + i] = v;
}
function los(x0, z0, x1, z1) {
  const d = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(d / (LMS * 0.8));
  for (let i = 1; i < n; i++) { const t = i / n; if (solidAt(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t)) return false; }
  return true;
}
function edgeMid(x, y, d) {
  if (d === 0) return [(x + 1) * CELL, cellCenter(y)]; if (d === 2) return [x * CELL, cellCenter(y)];
  if (d === 1) return [cellCenter(x), (y + 1) * CELL]; return [cellCenter(x), y * CELL];
}
// next waypoint that walks down a BFS distance field
function navNext(x, z, field) {
  const cx = cellOf(x), cy = cellOf(z), cur = field[cIdx(cx, cy)];
  if (cur <= 0) return null;
  let best = -1, bd = cur, ties = 0;
  for (let d = 0; d < 4; d++) {
    if (!passable(cx, cy, d)) continue;
    const nd = field[cIdx(cx + DX[d], cy + DY[d])];
    if (nd < 0) continue;
    if (nd < bd) { bd = nd; best = d; ties = 1; } else if (nd === bd && best >= 0 && RNG() < 1 / (++ties)) best = d;
  }
  if (best < 0) return null;
  const [mx, mz] = edgeMid(cx, cy, best);
  return { x: mx + DX[best] * 1.0, z: mz + DY[best] * 1.0 };
}
