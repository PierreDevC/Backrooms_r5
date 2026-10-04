// ---------- r11 · a small CPU ray tracer: triangle BVH, shadow / closest-hit queries ----------
// Used at load time to bake lighting (soft shadows from every lamp, ambient occlusion, one bounce) into vertex attributes.
// WebGL has no hardware ray tracing; tracing once per load and storing the result is how this game gets ray-traced light.
const RT = { tri: null, nTri: 0, nodes: null, nNodes: 0, idx: null, mat: null };
// tris: Float32Array of 9 floats per triangle; mat: optional Uint8Array material id per triangle (for bounce colour)
function rtBuild(tris, mat) {
  const n = tris.length / 9 | 0, cx = new Float32Array(n), cy = new Float32Array(n), cz = new Float32Array(n), bb = new Float32Array(n * 6);
  for (let i = 0; i < n; i++) {
    const o = i * 9; let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    for (let k = 0; k < 9; k += 3) { const x = tris[o + k], y = tris[o + k + 1], z = tris[o + k + 2]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z; }
    bb.set([x0, y0, z0, x1, y1, z1], i * 6); cx[i] = (x0 + x1) / 2; cy[i] = (y0 + y1) / 2; cz[i] = (z0 + z1) / 2;
  }
  const idx = new Uint32Array(n); for (let i = 0; i < n; i++) idx[i] = i;
  // node layout: 8 floats per node: minx miny minz maxx maxy maxz, then (left child | first tri) and (count; 0 = inner)
  const nodes = new Float32Array(Math.max(2, n * 2) * 8), meta = new Int32Array(Math.max(2, n * 2) * 2); let nn = 0;
  const BINS = 12, bc = new Int32Array(BINS), bbx = new Float32Array(BINS * 6);
  const stack = [[0, n, nn++]];
  while (stack.length) {
    const [s, e, ni] = stack.pop();
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity, c0x = Infinity, c0y = Infinity, c0z = Infinity, c1x = -Infinity, c1y = -Infinity, c1z = -Infinity;
    for (let i = s; i < e; i++) { const t = idx[i], o = t * 6;
      if (bb[o] < x0) x0 = bb[o]; if (bb[o + 1] < y0) y0 = bb[o + 1]; if (bb[o + 2] < z0) z0 = bb[o + 2]; if (bb[o + 3] > x1) x1 = bb[o + 3]; if (bb[o + 4] > y1) y1 = bb[o + 4]; if (bb[o + 5] > z1) z1 = bb[o + 5];
      if (cx[t] < c0x) c0x = cx[t]; if (cx[t] > c1x) c1x = cx[t]; if (cy[t] < c0y) c0y = cy[t]; if (cy[t] > c1y) c1y = cy[t]; if (cz[t] < c0z) c0z = cz[t]; if (cz[t] > c1z) c1z = cz[t]; }
    const no = ni * 8; nodes[no] = x0; nodes[no + 1] = y0; nodes[no + 2] = z0; nodes[no + 3] = x1; nodes[no + 4] = y1; nodes[no + 5] = z1;
    const cnt = e - s;
    if (cnt <= 4) { meta[ni * 2] = s; meta[ni * 2 + 1] = cnt; continue; }
    // binned SAH on the widest centroid axis
    const ex = c1x - c0x, ey = c1y - c0y, ez = c1z - c0z, ax = ex >= ey && ex >= ez ? 0 : ey >= ez ? 1 : 2, lo = [c0x, c0y, c0z][ax], ext = [ex, ey, ez][ax];
    const C = ax === 0 ? cx : ax === 1 ? cy : cz;
    let split = -1;
    if (ext > 1e-6) {
      bc.fill(0); for (let b = 0; b < BINS; b++) { bbx[b * 6] = bbx[b * 6 + 1] = bbx[b * 6 + 2] = Infinity; bbx[b * 6 + 3] = bbx[b * 6 + 4] = bbx[b * 6 + 5] = -Infinity; }
      for (let i = s; i < e; i++) { const t = idx[i], b = Math.min(BINS - 1, ((C[t] - lo) / ext * BINS) | 0), o = t * 6, q = b * 6; bc[b]++;
        for (let k = 0; k < 3; k++) { if (bb[o + k] < bbx[q + k]) bbx[q + k] = bb[o + k]; if (bb[o + 3 + k] > bbx[q + 3 + k]) bbx[q + 3 + k] = bb[o + 3 + k]; } }
      const area = (a) => { const dx = a[3] - a[0], dy = a[4] - a[1], dz = a[5] - a[2]; return dx < 0 ? 0 : dx * dy + dy * dz + dz * dx; };
      let best = Infinity;
      const L = [], LA = [], RA = []; let acc = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity], ac = 0;
      for (let b = 0; b < BINS - 1; b++) { const q = b * 6; for (let k = 0; k < 3; k++) { acc[k] = Math.min(acc[k], bbx[q + k]); acc[3 + k] = Math.max(acc[3 + k], bbx[q + 3 + k]); } ac += bc[b]; L[b] = ac; LA[b] = area(acc); }
      acc = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity]; ac = 0;
      for (let b = BINS - 1; b > 0; b--) { const q = b * 6; for (let k = 0; k < 3; k++) { acc[k] = Math.min(acc[k], bbx[q + k]); acc[3 + k] = Math.max(acc[3 + k], bbx[q + 3 + k]); } ac += bc[b]; RA[b - 1] = area(acc) * ac; }
      for (let b = 0; b < BINS - 1; b++) { if (!L[b] || L[b] === cnt) continue; const c = LA[b] * L[b] + RA[b]; if (c < best) { best = c; split = b; } }
      if (split >= 0) { // partition
        let i = s, j = e - 1;
        while (i <= j) { const t = idx[i], b = Math.min(BINS - 1, ((C[t] - lo) / ext * BINS) | 0); if (b <= split) i++; else { idx[i] = idx[j]; idx[j] = t; j--; } }
        split = i;
        if (split === s || split === e) split = -1;
      }
    }
    if (split < 0) { // median fallback
      const arr = Array.from(idx.subarray(s, e)).sort((a, b) => C[a] - C[b]); idx.set(arr, s); split = (s + e) >> 1;
    }
    const l = nn++, r = nn++; meta[ni * 2] = l; meta[ni * 2 + 1] = 0;
    stack.push([s, split, l], [split, e, r]);
  }
  // reorder triangles into leaf order so a leaf is a contiguous run
  const T = new Float32Array(n * 9), Mo = mat ? new Uint8Array(n) : null;
  for (let i = 0; i < n; i++) { T.set(tris.subarray(idx[i] * 9, idx[i] * 9 + 9), i * 9); if (Mo) Mo[i] = mat[idx[i]]; }
  // precompute edges for Möller–Trumbore: v0, e1, e2
  for (let i = 0; i < n; i++) { const o = i * 9; for (let k = 0; k < 3; k++) { const v0 = T[o + k]; T[o + 3 + k] -= v0; T[o + 6 + k] -= v0; } }
  Object.assign(RT, { tri: T, nTri: n, nodes: nodes.subarray(0, nn * 8), meta: meta.subarray(0, nn * 2), nNodes: nn, mat: Mo });
  return RT;
}
const _rtStack = new Int32Array(128);
// any hit in (tmin, tmax)? origin o, direction d (need not be normalised; tmax in units of |d|)
function rtOccluded(ox, oy, oz, dx, dy, dz, tmax) {
  const N = RT.nodes, M = RT.meta, T = RT.tri, ix = 1 / dx, iy = 1 / dy, iz = 1 / dz, st = _rtStack; let sp = 0; st[sp++] = 0;
  while (sp) {
    const ni = st[--sp], no = ni * 8;
    let t0 = (N[no] - ox) * ix, t1 = (N[no + 3] - ox) * ix; if (t0 > t1) { const q = t0; t0 = t1; t1 = q; }
    let u0 = (N[no + 1] - oy) * iy, u1 = (N[no + 4] - oy) * iy; if (u0 > u1) { const q = u0; u0 = u1; u1 = q; }
    if (u0 > t0) t0 = u0; if (u1 < t1) t1 = u1;
    let w0 = (N[no + 2] - oz) * iz, w1 = (N[no + 5] - oz) * iz; if (w0 > w1) { const q = w0; w0 = w1; w1 = q; }
    if (w0 > t0) t0 = w0; if (w1 < t1) t1 = w1;
    if (t1 < t0 || t1 < 0 || t0 > tmax) continue;
    const cnt = M[ni * 2 + 1];
    if (!cnt) { st[sp++] = M[ni * 2]; st[sp++] = M[ni * 2] + 1; continue; }
    for (let k = 0, s = M[ni * 2]; k < cnt; k++) {
      const o = (s + k) * 9, e1x = T[o + 3], e1y = T[o + 4], e1z = T[o + 5], e2x = T[o + 6], e2y = T[o + 7], e2z = T[o + 8];
      const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
      if (det > -1e-9 && det < 1e-9) continue;
      const inv = 1 / det, tx = ox - T[o], ty = oy - T[o + 1], tz = oz - T[o + 2], u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) * inv; if (v < 0 || u + v > 1) continue;
      const t = (e2x * qx + e2y * qy + e2z * qz) * inv; if (t > 1e-4 && t < tmax) return true;
    }
  }
  return false;
}
// closest hit: returns t (or -1); RT.hitTri receives the triangle index
function rtHit(ox, oy, oz, dx, dy, dz, tmax) {
  const N = RT.nodes, M = RT.meta, T = RT.tri, ix = 1 / dx, iy = 1 / dy, iz = 1 / dz, st = _rtStack; let sp = 0, best = tmax, bt = -1; st[sp++] = 0;
  while (sp) {
    const ni = st[--sp], no = ni * 8;
    let t0 = (N[no] - ox) * ix, t1 = (N[no + 3] - ox) * ix; if (t0 > t1) { const q = t0; t0 = t1; t1 = q; }
    let u0 = (N[no + 1] - oy) * iy, u1 = (N[no + 4] - oy) * iy; if (u0 > u1) { const q = u0; u0 = u1; u1 = q; }
    if (u0 > t0) t0 = u0; if (u1 < t1) t1 = u1;
    let w0 = (N[no + 2] - oz) * iz, w1 = (N[no + 5] - oz) * iz; if (w0 > w1) { const q = w0; w0 = w1; w1 = q; }
    if (w0 > t0) t0 = w0; if (w1 < t1) t1 = w1;
    if (t1 < t0 || t1 < 0 || t0 > best) continue;
    const cnt = M[ni * 2 + 1];
    if (!cnt) { st[sp++] = M[ni * 2]; st[sp++] = M[ni * 2] + 1; continue; }
    for (let k = 0, s = M[ni * 2]; k < cnt; k++) {
      const o = (s + k) * 9, e1x = T[o + 3], e1y = T[o + 4], e1z = T[o + 5], e2x = T[o + 6], e2y = T[o + 7], e2z = T[o + 8];
      const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
      if (det > -1e-9 && det < 1e-9) continue;
      const inv = 1 / det, tx = ox - T[o], ty = oy - T[o + 1], tz = oz - T[o + 2], u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) continue;
      const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, v = (dx * qx + dy * qy + dz * qz) * inv; if (v < 0 || u + v > 1) continue;
      const t = (e2x * qx + e2y * qy + e2z * qz) * inv; if (t > 1e-4 && t < best) { best = t; bt = s + k; }
    }
  }
  RT.hitTri = bt; return bt >= 0 ? best : -1;
}
// stratified, cosine-weighted hemisphere directions around n (k of them), for ambient occlusion and the bounce
function rtHemi(nx, ny, nz, k, seed, out) {
  const ax = Math.abs(nx) > 0.7 ? 0 : 1, ay = ax ? 0 : 1;   // a helper axis not parallel to n
  let tx = ay * nz - 0 * ny, ty = 0 * nx - ax * nz, tz = ax * ny - ay * nx; const tl = Math.hypot(tx, ty, tz) || 1; tx /= tl; ty /= tl; tz /= tl;
  const bx = ny * tz - nz * ty, by = nz * tx - nx * tz, bz = nx * ty - ny * tx, sq = Math.ceil(Math.sqrt(k));
  for (let i = 0; i < k; i++) {
    const h = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453, j = h - Math.floor(h), h2 = Math.sin(seed * 4.123 + i * 19.19) * 24634.6345, j2 = h2 - Math.floor(h2);
    const u = ((i % sq) + j) / sq, v = (((i / sq) | 0) + j2) / sq, r = Math.sqrt(u), a = v * Math.PI * 2, x = r * Math.cos(a), y = r * Math.sin(a), z = Math.sqrt(Math.max(0, 1 - u));
    out[i * 3] = tx * x + bx * y + nx * z; out[i * 3 + 1] = ty * x + by * y + ny * z; out[i * 3 + 2] = tz * x + bz * y + nz * z;
  }
  return out;
}
