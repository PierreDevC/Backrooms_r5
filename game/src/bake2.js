// ---------- r11 · Level 2 light bake: ray-traced direct light (soft shadows), ambient occlusion and one bounce, per vertex ----------
// Lights (LV.l2Lights): { p, c (linear colour), I, r (bulb radius, soft shadows), rng (range), kind: 'pt' | 'spot' | 'line', d (spot axis), co / ci (cone cosines),
// b (line end), flick (on the flicker channel), hz (haze strength), hr (haze core radius) }.
// r12: kind 'sun' = a directional light (the moon): d = unit vector towards it, I = irradiance, r = angular radius (soft shadows), noProbe = leave it out of the 2D
// light texture (props take their moonlight from the sky mask). LV.l2Sky = { z: [rgb], h: [rgb] }: sky radiance for pass-2 rays that leave the scene.
const BK2 = { stats: null };
function bk2Hash(i, k) { const h = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return h - Math.floor(h); }
// light grid: which lamps can reach each 3.6 m cell
function bk2LightGrid(L) {
  const G = Array.from({ length: N * N }, () => []);
  L.forEach((l, li) => {
    if (l.kind === 'sun') { for (const c of G) c.push(li); return; }
    const R = l.rng + (l.kind === 'line' ? Math.hypot(l.b[0] - l.p[0], l.b[2] - l.p[2]) / 2 : 0), cx = l.kind === 'line' ? (l.p[0] + l.b[0]) / 2 : l.p[0], cz = l.kind === 'line' ? (l.p[2] + l.b[2]) / 2 : l.p[2];
    for (let y = Math.max(0, Math.floor((cz - R) / CELL)); y <= Math.min(N - 1, Math.floor((cz + R) / CELL)); y++) for (let x = Math.max(0, Math.floor((cx - R) / CELL)); x <= Math.min(N - 1, Math.floor((cx + R) / CELL)); x++) G[y * N + x].push(li);
  });
  return G;
}
// direct light at point p (normal n, or null for a sphere-averaged probe); writes steady / flicker rgb and the luminance-weighted direction
const _bkO = { s: [0, 0, 0], f: [0, 0, 0], d: [0, 0, 0], w: 0 };
function bk2Direct(L, lis, px, py, pz, nx, ny, nz, vi, out, hq) {
  out.s[0] = out.s[1] = out.s[2] = out.f[0] = out.f[1] = out.f[2] = out.d[0] = out.d[1] = out.d[2] = 0; out.w = 0;
  const probe = nx === null, ox = px + (probe ? 0 : nx * 0.03), oy = py + (probe ? 0 : ny * 0.03), oz = pz + (probe ? 0 : nz * 0.03);
  for (const li of lis) {
    const l = L[li], sun = l.kind === 'sun'; if (sun && probe && l.noProbe) continue;
    const ns = sun ? (hq ? 3 : 2) : l.kind === 'line' ? (hq ? 4 : 3) : l.r > 0.12 ? (hq ? 4 : 2) : 1;
    let ax = 0, ay = 0, az = 0, sr = 0, sg = 0, sb = 0;
    for (let k = 0; k < ns; k++) {
      if (sun) {   // the moon: a cone of directions around l.d, no falloff, shadow ray of 400 m
        let lx = l.d[0] + (bk2Hash(vi, li * 7 + k) - 0.5) * 2 * l.r, ly = l.d[1] + (bk2Hash(vi + 0.37, li * 13 + k) - 0.5) * 2 * l.r, lz = l.d[2] + (bk2Hash(vi + 0.71, li * 5 + k) - 0.5) * 2 * l.r;
        const ll = Math.sqrt(lx * lx + ly * ly + lz * lz); lx /= ll; ly /= ll; lz /= ll;
        const ndl = probe ? 0.62 : nx * lx + ny * ly + nz * lz; if (ndl <= 0) continue;
        const att = l.I * ndl / ns; if (rtOccluded(ox, oy, oz, lx * 400, ly * 400, lz * 400, 1)) continue;
        sr += l.c[0] * att; sg += l.c[1] * att; sb += l.c[2] * att; ax += lx * att; ay += ly * att; az += lz * att; continue;
      }
      let qx, qy, qz;
      const h1 = bk2Hash(vi, li * 7 + k), h2 = bk2Hash(vi + 0.37, li * 13 + k);
      if (l.kind === 'line') { const t = (k + h1) / ns; qx = l.p[0] + (l.b[0] - l.p[0]) * t; qy = l.p[1] + (l.b[1] - l.p[1]) * t; qz = l.p[2] + (l.b[2] - l.p[2]) * t; }
      else { const a = h1 * 6.2832, z = h2 * 2 - 1, rr = Math.sqrt(1 - z * z) * l.r; qx = l.p[0] + Math.cos(a) * rr; qy = l.p[1] + z * l.r; qz = l.p[2] + Math.sin(a) * rr; }
      let lx = qx - px, ly = qy - py, lz = qz - pz; const d2 = lx * lx + ly * ly + lz * lz, d = Math.sqrt(d2); if (d > l.rng || d < 1e-4) continue;
      lx /= d; ly /= d; lz /= d;
      const ndl = probe ? 0.62 : nx * lx + ny * ly + nz * lz; if (ndl <= 0) continue;
      let cone = 1;
      if (l.kind === 'spot') { const ca = -(lx * l.d[0] + ly * l.d[1] + lz * l.d[2]); cone = l.up + (1 - l.up) * smooth(l.co, l.ci, ca); }
      else if (l.kind === 'line') { cone = 0.3 + 0.7 * Math.max(0, -ly); }
      const att = l.I * cone * ndl / (d2 + l.r * l.r + 0.04) * (1 - smooth(l.rng * 0.6, l.rng, d)) / ns; if (att < 2e-4) continue;
      if (rtOccluded(ox, oy, oz, qx - ox, qy - oy, qz - oz, 0.985)) continue;
      sr += l.c[0] * att; sg += l.c[1] * att; sb += l.c[2] * att; ax += lx * att; ay += ly * att; az += lz * att;
    }
    const t = l.flick ? out.f : out.s; t[0] += sr; t[1] += sg; t[2] += sb;
    out.d[0] += ax; out.d[1] += ay; out.d[2] += az; out.w += sr * 0.3 + sg * 0.59 + sb * 0.11;
  }
  return out;
}
// mean albedo of a bucket material (for the bounce): the scan's mean x gain x vertex tint
function bk2Alb(mat) { if (mat === 'prop' || mat === 'glass') return [0.22, 0.22, 0.21]; if (mat === 'leaf') return [0.1, 0.14, 0.07]; const D = l2Tab()[mat], tg = D.tint ? D.tint.map(v => v) : [1, 1, 1], m = (ASSET_TEX[D.k] && ASSET_TEX[D.k].m) || [0.2, 0.2, 0.2]; return m.map((v, i) => v * D.g * tg[i]); }
// per-vertex kernels (run in the workers, or here): pass 1 writes direct light, pass 2 writes bounce + ambient occlusion
function bk2K1(L, LG, NN, CC, P, Nn, n, vi0, S, F, D) {
  const o = { s: [0, 0, 0], f: [0, 0, 0], d: [0, 0, 0], w: 0 };
  for (let i = 0; i < n; i++) {
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], cell = Math.min(NN - 1, Math.max(0, Math.floor(z / CC))) * NN + Math.min(NN - 1, Math.max(0, Math.floor(x / CC)));
    bk2Direct(L, LG[cell], x, y, z, Nn[i * 3], Nn[i * 3 + 1], Nn[i * 3 + 2], vi0 + i, o, false);
    S[i * 4] = o.s[0]; S[i * 4 + 1] = o.s[1]; S[i * 4 + 2] = o.s[2]; F[i * 4] = o.f[0]; F[i * 4 + 1] = o.f[1]; F[i * 4 + 2] = o.f[2];
    const dl = Math.hypot(o.d[0], o.d[1], o.d[2]); D[i * 4] = dl > 1e-6 ? o.d[0] / dl : 0; D[i * 4 + 1] = dl > 1e-6 ? o.d[1] / dl : 1; D[i * 4 + 2] = dl > 1e-6 ? o.d[2] / dl : 0; D[i * 4 + 3] = o.w > 1e-6 ? Math.min(1, dl / (o.w * 1.02)) : 0;
  }
}
function bk2K2(P, Nn, n, vi0, gS, GR, GX, GY, I, SK) {
  const K = 8, dirs = new Float32Array(K * 3), gi = (x, y, z) => { const i = Math.floor(x / GR), j = Math.floor(z / GR), k = Math.floor(y / GR); return i < 0 || j < 0 || k < 0 || i >= GX || j >= GX || k >= GY ? -1 : ((k * GX + j) * GX + i) * 4; };
  for (let i = 0; i < n; i++) {
    const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], nx = Nn[i * 3], ny = Nn[i * 3 + 1], nz = Nn[i * 3 + 2], ox = x + nx * 0.03, oy = y + ny * 0.03, oz = z + nz * 0.03;
    rtHemi(nx, ny, nz, K, (vi0 + i) * 0.618, dirs);
    let occ = 0, br = 0, bg = 0, bb = 0;
    for (let k = 0; k < K; k++) {
      const dx = dirs[k * 3], dy = dirs[k * 3 + 1], dz = dirs[k * 3 + 2], t = rtHit(ox, oy, oz, dx, dy, dz, 6);
      if (t < 0) {   // nothing within 6 m: upward rays that leave the scene see the sky
        if (SK && dy > 0.02 && rtHit(ox, oy, oz, dx, dy, dz, 160) < 0) { const q = Math.pow(dy, 0.55); br += SK[3] + (SK[0] - SK[3]) * q; bg += SK[4] + (SK[1] - SK[4]) * q; bb += SK[5] + (SK[2] - SK[5]) * q; }
        continue;
      }
      const u = Math.min(1, Math.max(0, (t - 0.15) / 1.45)); occ += 1 - u * u * (3 - 2 * u);
      const g = gi(ox + dx * t - dx * 0.05, oy + dy * t - dy * 0.05, oz + dz * t - dz * 0.05);
      if (g >= 0 && gS[g + 3] > 0) { br += gS[g]; bg += gS[g + 1]; bb += gS[g + 2]; }
    }
    const kb = 1.15 / K; I[i * 4] = br * kb; I[i * 4 + 1] = bg * kb; I[i * 4 + 2] = bb * kb; I[i * 4 + 3] = Math.min(1, Math.max(0, 0.25 + 0.75 * (1 - occ / K)));
  }
}
function bk2Job(kind, J, L, LG, C) {
  const P = J.b.pf.subarray(J.s0 * 3, (J.s0 + J.c) * 3), Nn = J.b.nf.subarray(J.s0 * 3, (J.s0 + J.c) * 3);
  if (kind === 'p1') { const S = new Float32Array(J.c * 4), F = new Float32Array(J.c * 4), D = new Float32Array(J.c * 4); bk2K1(L, LG, N, CELL, P, Nn, J.c, J.vi0, S, F, D); J.b.lS.set(S, J.s0 * 4); J.b.lF.set(F, J.s0 * 4); J.b.lD.set(D, J.s0 * 4); }
  else { const I = new Float32Array(J.c * 4); bk2K2(P, Nn, J.c, J.vi0, C.gS, C.GR, C.GX, C.GY, I, C.sky); const S = J.b.lS; for (let i = 0; i < J.c; i++) { const o = (J.s0 + i) * 4; S[o] += I[i * 4]; S[o + 1] += I[i * 4 + 1]; S[o + 2] += I[i * 4 + 2]; S[o + 3] = I[i * 4 + 3]; } }
}
// a pool of workers built from these very functions (no extra files: the game is a single HTML page)
async function bk2Pool() {
  if (typeof Worker === 'undefined' || /[?&]nobakeworkers/.test(location.search)) return null;
  const n = Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 4) - 1));
  const src = ['"use strict";', 'const clamp = ' + clamp.toString() + ';', 'const smooth = ' + smooth.toString() + ';', 'const RT = {}; const _rtStack = new Int32Array(128);',
    rtOccluded.toString(), rtHit.toString(), rtHemi.toString(), bk2Hash.toString(), bk2Direct.toString(), bk2K1.toString(), bk2K2.toString(),
    `let L, LG, NN, CC, gS, G, SK;
onmessage = e => { const m = e.data;
  if (m.t === 'init') { RT.tri = m.tri; RT.nodes = m.nodes; RT.meta = m.meta; L = m.L; LG = m.LG; NN = m.NN; CC = m.CC; SK = m.SK; postMessage({ t: 'ok' }); return; }
  if (m.t === 'cache') { gS = m.gS; G = m.G; postMessage({ t: 'ok' }); return; }
  if (m.t === 'p1') { const S = new Float32Array(m.n * 4), F = new Float32Array(m.n * 4), D = new Float32Array(m.n * 4); bk2K1(L, LG, NN, CC, m.P, m.Nn, m.n, m.vi0, S, F, D); postMessage({ t: 'r', id: m.id, S, F, D }, [S.buffer, F.buffer, D.buffer]); return; }
  if (m.t === 'p2') { const I = new Float32Array(m.n * 4); bk2K2(m.P, m.Nn, m.n, m.vi0, gS, G[0], G[1], G[2], I, SK); postMessage({ t: 'r', id: m.id, I }, [I.buffer]); }
};`].join('\n');
  let url, W = [];
  try {
    url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
    for (let i = 0; i < n; i++) W.push(new Worker(url));
    const LG = bk2LG2, init = { t: 'init', tri: RT.tri, nodes: RT.nodes, meta: RT.meta, L: LV.l2Lights, LG, NN: N, CC: CELL, SK: bk2Sky() };
    await Promise.all(W.map(w => new Promise((res, rej) => { w.onmessage = () => res(); w.onerror = er => rej(er); w.postMessage(init); })));
  } catch (e) { W.forEach(w => w.terminate()); if (url) URL.revokeObjectURL(url); return null; }
  const pool = { n,
    cache: (gS, G) => Promise.all(W.map(w => new Promise(res => { w.onmessage = () => res(); w.postMessage({ t: 'cache', gS, G }); }))),
    run: (tasks, onDone) => new Promise((res, rej) => {
      let next = 0, live = 0;
      const feed = w => { if (next >= tasks.length) { if (!live) res(); return; } const id = next++, T = tasks[id]; live++; w.__id = id; w.postMessage({ t: T.t, P: T.P, Nn: T.Nn, n: T.n, vi0: T.vi0, id }); };
      W.forEach(w => { w.onmessage = e => { live--; onDone(tasks[e.data.id].J, e.data); feed(w); }; w.onerror = er => rej(er); feed(w); });
    }),
    close: () => { W.forEach(w => w.terminate()); URL.revokeObjectURL(url); } };
  return pool;
}
let bk2LG2 = null;
// sky radiance for the bounce pass: [zenith rgb, horizon rgb] (Level 9 only)
function bk2Sky() { const k = LV.l2Sky; return k ? [k.z[0], k.z[1], k.z[2], k.h[0], k.h[1], k.h[2]] : null; }
async function bake2(progress) {
  const t0 = performance.now(), L = LV.l2Lights;
  progress(0.66, 'TRACING THE LAMPS…'); await nextFrame();
  rtBuild(new Float32Array(K2.occl), K2.occM ? new Uint8Array(K2.occM) : null);
  const LG = bk2LightGrid(L), buckets = [...K2.B.values()]; bk2LG2 = LG;
  let nv = 0; for (const b of buckets) { nv += b.p.length / 3; b.lS = new Float32Array(b.p.length / 3 * 4); b.lF = new Float32Array(b.p.length / 3 * 4); b.lD = new Float32Array(b.p.length / 3 * 4); }
  // ---- pass 1: direct light (soft shadows) ----
  const GR = 0.9, GX = Math.ceil(LEVEL / GR), GY = 12, gS = new Float32Array(GX * GX * GY * 4);   // radiance cache: albedo x direct light, averaged per 0.9 m cell
  const gi = (x, y, z) => { const i = Math.floor(x / GR), j = Math.floor(z / GR), k = Math.floor(y / GR); return i < 0 || j < 0 || k < 0 || i >= GX || j >= GX || k >= GY ? -1 : ((k * GX + j) * GX + i) * 4; };
  // jobs: slices of buckets, so the work spreads over the worker pool (or runs here when workers are unavailable)
  const jobs = []; let vi0 = 0;
  for (const b of buckets) { b.pf = new Float32Array(b.p); b.nf = new Float32Array(b.n); const n = b.p.length / 3; for (let s0 = 0; s0 < n; s0 += 6000) { const c = Math.min(6000, n - s0); jobs.push({ b, s0, c, vi0: vi0 + s0 }); } vi0 += n; }
  const pool = await bk2Pool(), runJobs = async (kind, label, p0, p1) => {
    let done = 0; const doneAt = () => progress(p0 + (p1 - p0) * done / jobs.length, label);
    if (!pool) { for (const J of jobs) { bk2Job(kind, J, L, LG, { gS, GR, GX, GY, sky: bk2Sky() }); done++; if (done % 6 === 0) { doneAt(); await nextFrame(); } } return; }
    await pool.run(jobs.map(J => ({ t: kind, P: J.b.pf.slice(J.s0 * 3, (J.s0 + J.c) * 3), Nn: J.b.nf.slice(J.s0 * 3, (J.s0 + J.c) * 3), n: J.c, vi0: J.vi0, J })), (J, r) => {
      if (kind === 'p1') { J.b.lS.set(r.S, J.s0 * 4); J.b.lF.set(r.F, J.s0 * 4); J.b.lD.set(r.D, J.s0 * 4); }
      else { const S = J.b.lS; for (let i = 0; i < J.c; i++) { const o = (J.s0 + i) * 4; S[o] += r.I[i * 4]; S[o + 1] += r.I[i * 4 + 1]; S[o + 2] += r.I[i * 4 + 2]; S[o + 3] = r.I[i * 4 + 3]; } }
      done++; doneAt();
    });
  };
  await runJobs('p1', 'TRACING THE LAMPS…', 0.66, 0.78);
  for (const b of buckets) {   // splat into the radiance cache (a little off the surface, so a ray's hit point lands in the same cell)
    const n = b.p.length / 3, P = b.p, Nn = b.n, C = b.c, A = bk2Alb(b.mat), prop = b.mat === 'prop', S = b.lS, F = b.lF;
    for (let i = 0; i < n; i++) {
      const g = gi(P[i * 3] + Nn[i * 3] * 0.1, P[i * 3 + 1] + Nn[i * 3 + 1] * 0.1, P[i * 3 + 2] + Nn[i * 3 + 2] * 0.1); if (g < 0) continue;
      const tr = prop ? C[i * 4] * C[i * 4] * 1.4 : C[i * 4], tg = prop ? C[i * 4 + 1] * C[i * 4 + 1] * 1.4 : C[i * 4 + 1], tb = prop ? C[i * 4 + 2] * C[i * 4 + 2] * 1.4 : C[i * 4 + 2];
      gS[g] += (S[i * 4] + F[i * 4] * 0.6) * A[0] * tr; gS[g + 1] += (S[i * 4 + 1] + F[i * 4 + 1] * 0.6) * A[1] * tg; gS[g + 2] += (S[i * 4 + 2] + F[i * 4 + 2] * 0.6) * A[2] * tb; gS[g + 3] += 1;
    }
  }
  for (let g = 0; g < gS.length; g += 4) if (gS[g + 3] > 0) { const w = 1 / gS[g + 3]; gS[g] *= w; gS[g + 1] *= w; gS[g + 2] *= w; }
  // ---- pass 2: ambient occlusion and one bounce (cosine-weighted rays into the cache) ----
  if (pool) await pool.cache(gS, [GR, GX, GY]);
  await runJobs('p2', 'BOUNCING THE LIGHT…', 0.78, 0.88);
  if (pool) pool.close();
  BK2.workers = pool ? pool.n : 0;
  // ---- the 2D light texture (characters, doors, items, the sanity meter): sphere irradiance at 1.1 m, with shadows ----
  progress(0.88, 'LIGHTING THE PEOPLE…'); await nextFrame();
  const R = LMR, D4 = 4, RG = Math.ceil(R / D4), eS = new Float32Array(RG * RG), eF = new Float32Array(RG * RG);
  for (let j = 0; j < RG; j++) for (let i = 0; i < RG; i++) {
    const x = (i + 0.5) * D4 * LMS, z = (j + 0.5) * D4 * LMS, c = clamp(Math.floor(z / CELL), 0, N - 1) * N + clamp(Math.floor(x / CELL), 0, N - 1); if (!LV.zone[c]) continue;
    const o = bk2Direct(L, LG[c], x, 1.1, z, null, 0, 0, j * RG + i, _bkO, false);
    eS[j * RG + i] = o.s[0] * 0.3 + o.s[1] * 0.59 + o.s[2] * 0.11; eF[j * RG + i] = o.f[0] * 0.3 + o.f[1] * 0.59 + o.f[2] * 0.11;
  }
  const S1 = new Float32Array(R * R), F1 = new Float32Array(R * R), samp = (A, u, v) => { const fx = clamp(u - 0.5, 0, RG - 1.001), fz = clamp(v - 0.5, 0, RG - 1.001), i = fx | 0, j = fz | 0, a = fx - i, c = fz - j; return lerp(lerp(A[j * RG + i], A[j * RG + i + 1], a), lerp(A[(j + 1) * RG + i], A[(j + 1) * RG + i + 1], a), c); };
  const KC = BK2.charK ?? 1.6;
  for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) { const k = j * R + i; if (LV.solid[k]) continue; S1[k] = Math.min(2.5, samp(eS, (i + 0.5) / D4, (j + 0.5) / D4) * KC + 0.04); F1[k] = Math.min(2.5, samp(eF, (i + 0.5) / D4, (j + 0.5) / D4) * KC); }   // (the texture stores up to 2; a probe right beside a lamp must not read as 30)
  LV.lmS = S1; LV.lmF = F1;
  const data = new Uint8Array(R * R * 4), dist = LV.wallDist;
  for (let i = 0; i < R * R; i++) { data[i * 4] = clamp(S1[i] / 2 * 255, 0, 255); data[i * 4 + 1] = clamp(dist[i] * LMS * 255, 0, 255); data[i * 4 + 2] = clamp(F1[i] / 2 * 255, 0, 255); data[i * 4 + 3] = LV.sky ? LV.sky[i] : 0; }
  LV.lightTex.update(data);
  for (let c = 0; c < N * N; c++) LV.cellLight[c] = baseLight(cellCenter(c % N), cellCenter((c / N) | 0), 0.4);
  BK2.stats = { verts: nv, tris: RT.nTri, lights: L.length, ms: Math.round(performance.now() - t0) };
}
// turn the buckets into meshes with the baked attributes
function bk2Meshes(scene) {
  const out = [];
  for (const b of K2.B.values()) {
    if (!b.p.length) continue;
    const m = new BABYLON.Mesh('l2_' + b.key, scene), vd = new BABYLON.VertexData();
    vd.positions = b.p; vd.normals = b.n; vd.tangents = b.t; vd.uvs = b.uv; vd.colors = b.c; vd.indices = b.i.length > 65535 * 3 ? new Uint32Array(b.i) : b.i;
    vd.applyToMesh(m); m.setVerticesData('lS', b.lS, false, 4); m.setVerticesData('lF', b.lF, false, 4); m.setVerticesData('lD', b.lD, false, 4);
    m.material = b.mat === 'prop' ? l2PropMat() : b.mat === 'glass' ? l2GlassMat() : l2Mat(b.mat); m.isPickable = false; m.hasVertexAlpha = false;
    m._sortD = b.mat === 'prop' ? 300 : b.mat === 'glass' ? 2050 : 400; if (b.mat === 'glass') m.alphaIndex = 7; out.push(m);
  }
  LV.chunkMeshes = out;
  return out;
}
