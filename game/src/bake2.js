// ---------- r11 · Level 2 light bake: ray-traced direct light (soft shadows), ambient occlusion and one bounce, per vertex ----------
// Lights (LV.l2Lights): { p, c (linear colour), I, r (bulb radius, soft shadows), rng (range), kind: 'pt' | 'spot' | 'line', d (spot axis), co / ci (cone cosines),
// b (line end), flick (on the flicker channel), hz (haze strength), hr (haze core radius) }.
const BK2 = { stats: null };
function bk2Hash(i, k) { const h = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return h - Math.floor(h); }
// light grid: which lamps can reach each 3.6 m cell
function bk2LightGrid(L) {
  const G = Array.from({ length: N * N }, () => []);
  L.forEach((l, li) => {
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
    const l = L[li], ns = l.kind === 'line' ? (hq ? 4 : 3) : l.r > 0.12 ? (hq ? 4 : 2) : 1;
    let ax = 0, ay = 0, az = 0, sr = 0, sg = 0, sb = 0;
    for (let k = 0; k < ns; k++) {
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
function bk2Alb(mat) { if (mat === 'prop' || mat === 'glass') return [0.22, 0.22, 0.21]; const D = MAT2W[mat], m = (ASSET_TEX[D.k] && ASSET_TEX[D.k].m) || [0.2, 0.2, 0.2]; return m.map(v => v * D.g); }
async function bake2(progress) {
  const t0 = performance.now(), L = LV.l2Lights;
  progress(0.66, 'TRACING THE LAMPS…'); await nextFrame();
  rtBuild(new Float32Array(K2.occl), K2.occM ? new Uint8Array(K2.occM) : null);
  const LG = bk2LightGrid(L), buckets = [...K2.B.values()];
  let nv = 0; for (const b of buckets) { nv += b.p.length / 3; b.lS = new Float32Array(b.p.length / 3 * 4); b.lF = new Float32Array(b.p.length / 3 * 4); b.lD = new Float32Array(b.p.length / 3 * 4); }
  // ---- pass 1: direct light ----
  const GR = 0.75, GX = Math.ceil(LEVEL / GR), GY = 15, gS = new Float32Array(GX * GX * GY * 4);   // radiance cache: albedo x direct light, averaged per 0.75 m cell
  const gi = (x, y, z) => { const i = Math.floor(x / GR), j = Math.floor(z / GR), k = Math.floor(y / GR); return i < 0 || j < 0 || k < 0 || i >= GX || j >= GX || k >= GY ? -1 : ((k * GX + j) * GX + i) * 4; };
  let done = 0, vi = 0, rays0 = 0;
  for (const b of buckets) {
    const n = b.p.length / 3, P = b.p, Nn = b.n, C = b.c, A = bk2Alb(b.mat), prop = b.mat === 'prop';
    for (let i = 0; i < n; i++, vi++) {
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], cell = clamp(Math.floor(z / CELL), 0, N - 1) * N + clamp(Math.floor(x / CELL), 0, N - 1);
      const o = bk2Direct(L, LG[cell], x, y, z, Nn[i * 3], Nn[i * 3 + 1], Nn[i * 3 + 2], vi, _bkO, false);
      b.lS[i * 4] = o.s[0]; b.lS[i * 4 + 1] = o.s[1]; b.lS[i * 4 + 2] = o.s[2];
      b.lF[i * 4] = o.f[0]; b.lF[i * 4 + 1] = o.f[1]; b.lF[i * 4 + 2] = o.f[2];
      const dl = Math.hypot(o.d[0], o.d[1], o.d[2]); b.lD[i * 4] = dl > 1e-6 ? o.d[0] / dl : 0; b.lD[i * 4 + 1] = dl > 1e-6 ? o.d[1] / dl : 1; b.lD[i * 4 + 2] = dl > 1e-6 ? o.d[2] / dl : 0; b.lD[i * 4 + 3] = o.w > 1e-6 ? clamp(dl / (o.w * 1.02), 0, 1) : 0;
      // splat into the radiance cache (a little off the surface, so the hit point of a ray lands in the same cell)
      const g = gi(x + Nn[i * 3] * 0.1, y + Nn[i * 3 + 1] * 0.1, z + Nn[i * 3 + 2] * 0.1);
      if (g >= 0) { const tr = prop ? C[i * 4] * C[i * 4] * 1.4 : C[i * 4], tg = prop ? C[i * 4 + 1] * C[i * 4 + 1] * 1.4 : C[i * 4 + 1], tb = prop ? C[i * 4 + 2] * C[i * 4 + 2] * 1.4 : C[i * 4 + 2];
        gS[g] += (o.s[0] + o.f[0] * 0.6) * A[0] * tr; gS[g + 1] += (o.s[1] + o.f[1] * 0.6) * A[1] * tg; gS[g + 2] += (o.s[2] + o.f[2] * 0.6) * A[2] * tb; gS[g + 3] += 1; }
    }
    done += n; if (done - rays0 > 25000) { rays0 = done; progress(0.66 + 0.12 * done / nv, 'TRACING THE LAMPS…'); await nextFrame(); }
  }
  for (let g = 0; g < gS.length; g += 4) if (gS[g + 3] > 0) { const w = 1 / gS[g + 3]; gS[g] *= w; gS[g + 1] *= w; gS[g + 2] *= w; }
  // ---- pass 2: ambient occlusion and one bounce (cosine-weighted rays into the cache) ----
  progress(0.78, 'BOUNCING THE LIGHT…'); await nextFrame();
  const K = 8, dirs = new Float32Array(K * 3); done = 0; rays0 = 0; vi = 0;
  for (const b of buckets) {
    const n = b.p.length / 3, P = b.p, Nn = b.n;
    for (let i = 0; i < n; i++, vi++) {
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2], nx = Nn[i * 3], ny = Nn[i * 3 + 1], nz = Nn[i * 3 + 2], ox = x + nx * 0.03, oy = y + ny * 0.03, oz = z + nz * 0.03;
      rtHemi(nx, ny, nz, K, vi * 0.618, dirs);
      let occ = 0, br = 0, bg = 0, bb = 0;
      for (let k = 0; k < K; k++) {
        const dx = dirs[k * 3], dy = dirs[k * 3 + 1], dz = dirs[k * 3 + 2], t = rtHit(ox, oy, oz, dx, dy, dz, 6);
        if (t < 0) continue;
        occ += 1 - smooth(0.15, 1.6, t);
        const g = gi(ox + dx * t - dx * 0.05, oy + dy * t - dy * 0.05, oz + dz * t - dz * 0.05);
        if (g >= 0 && gS[g + 3] > 0) { br += gS[g]; bg += gS[g + 1]; bb += gS[g + 2]; }
      }
      const ao = 1 - occ / K, kb = 1.15 / K;
      b.lS[i * 4] += br * kb; b.lS[i * 4 + 1] += bg * kb; b.lS[i * 4 + 2] += bb * kb; b.lS[i * 4 + 3] = clamp(0.25 + 0.75 * ao, 0, 1);
    }
    done += n; if (done - rays0 > 25000) { rays0 = done; progress(0.78 + 0.1 * done / nv, 'BOUNCING THE LIGHT…'); await nextFrame(); }
  }
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
  for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) { const k = j * R + i; if (LV.solid[k]) continue; S1[k] = samp(eS, (i + 0.5) / D4, (j + 0.5) / D4) * KC + 0.04; F1[k] = samp(eF, (i + 0.5) / D4, (j + 0.5) / D4) * KC; }
  LV.lmS = S1; LV.lmF = F1;
  const data = new Uint8Array(R * R * 4), dist = LV.wallDist;
  for (let i = 0; i < R * R; i++) { data[i * 4] = clamp(S1[i] / 2 * 255, 0, 255); data[i * 4 + 1] = clamp(dist[i] * LMS * 255, 0, 255); data[i * 4 + 2] = clamp(F1[i] / 2 * 255, 0, 255); data[i * 4 + 3] = 0; }
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
