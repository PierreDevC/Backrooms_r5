// ---------- r11 · Level 2 modelling kit: tessellated architecture and procedural props for the baked renderer ----------
// Everything here writes into per-material, per-area buckets (vertex position / normal / tangent / uv / colour). The ray-traced
// bake (bake2.js) then lights every vertex and the buckets become meshes. Colour: rgb = albedo tint, a = prop material id / 16.
const K2 = { B: new Map(), occl: [], CH: 21.6, nV: 0 };
function k2Reset() { K2.B = new Map(); K2.occl = []; K2.nV = 0; }
function k2Bucket(mat, x, z) {
  const k = mat + ':' + Math.floor(z / K2.CH) * 100 + Math.floor(x / K2.CH);
  let b = K2.B.get(k); if (!b) { b = { mat, key: k, p: [], n: [], t: [], uv: [], c: [], i: [] }; K2.B.set(k, b); }
  return b;
}
// one vertex; returns its index in the bucket
function k2V(b, x, y, z, nx, ny, nz, tx, ty, tz, u, v, c) { b.p.push(x, y, z); b.n.push(nx, ny, nz); b.t.push(tx, ty, tz, 1); b.uv.push(u, v); b.c.push(c[0], c[1], c[2], c[3] ?? 0); K2.nV++; return b.p.length / 3 - 1; }
// a triangle, wound so Babylon (left-handed, FLIP_WINDING) shows the side its vertex normals face
function k2Tri(b, i0, i1, i2) {
  const P = b.p, N = b.n, a = i0 * 3, c1 = i1 * 3, c2 = i2 * 3;
  const ux = P[c1] - P[a], uy = P[c1 + 1] - P[a + 1], uz = P[c1 + 2] - P[a + 2], vx = P[c2] - P[a], vy = P[c2 + 1] - P[a + 1], vz = P[c2 + 2] - P[a + 2];
  const gx = uy * vz - uz * vy, gy = uz * vx - ux * vz, gz = ux * vy - uy * vx, nx = N[a] + N[c1] + N[c2], ny = N[a + 1] + N[c1 + 1] + N[c2 + 1], nz = N[a + 2] + N[c1 + 2] + N[c2 + 2];
  if (gx * nx + gy * ny + gz * nz > 0) b.i.push(i0, i2, i1); else b.i.push(i0, i1, i2);
}
// occluder triangles for the tracer (coarse: one pair per flat face, real tessellation for curved props)
function k2Occ(ax, ay, az, bx, by, bz, cx, cy, cz, m = 0) { K2.occl.push(ax, ay, az, bx, by, bz, cx, cy, cz); (K2.occM || (K2.occM = [])).push(m); }

// ----- world geometry: a flat rectangle split into a grid (vertex spacing <= step metres) -----
// P0 corner, U / V unit directions, du / dv lengths, N normal; uv in metres along U and V (+ uo / vo offsets); occ: add to the tracer
function k2Rect(mat, P0, U, V, du, dv, N, col, step = 0.4, o = {}) {
  if (du < 1e-3 || dv < 1e-3) return;
  const cx = P0[0] + U[0] * du / 2 + V[0] * dv / 2, cz = P0[2] + U[2] * du / 2 + V[2] * dv / 2, b = k2Bucket(mat, cx, cz);
  const nu = Math.max(1, Math.ceil(du / step)), nv = Math.max(1, Math.ceil(dv / step)), base = b.p.length / 3, uo = o.uo || 0, vo = o.vo || 0, us = o.us || 1, vs = o.vs || 1;
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const a = du * i / nu, e = dv * j / nv;
    k2V(b, P0[0] + U[0] * a + V[0] * e, P0[1] + U[1] * a + V[1] * e, P0[2] + U[2] * a + V[2] * e, N[0], N[1], N[2], U[0], U[1], U[2], (uo + a) * us, (vo + e) * vs, col);
  }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const q = base + j * (nu + 1) + i; k2Tri(b, q, q + 1, q + nu + 2); k2Tri(b, q, q + nu + 2, q + nu + 1); }
  if (o.occ !== false) { const A = P0, B2 = [P0[0] + U[0] * du, P0[1] + U[1] * du, P0[2] + U[2] * du], C = [B2[0] + V[0] * dv, B2[1] + V[1] * dv, B2[2] + V[2] * dv], D = [P0[0] + V[0] * dv, P0[1] + V[1] * dv, P0[2] + V[2] * dv];
    k2Occ(...A, ...B2, ...C, o.om || 0); k2Occ(...A, ...C, ...D, o.om || 0); }
}
// a general polygon strip / fan for odd shapes (gallery vault ends): pts in order, flat normal N
function k2Poly(mat, pts, N, U, col, o = {}) {
  const c = pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length, a[2] + p[2] / pts.length], [0, 0, 0]), b = k2Bucket(mat, c[0], c[2]);
  const V = [N[1] * U[2] - N[2] * U[1], N[2] * U[0] - N[0] * U[2], N[0] * U[1] - N[1] * U[0]], uv = p => [(p[0] * U[0] + p[1] * U[1] + p[2] * U[2]), (p[0] * V[0] + p[1] * V[1] + p[2] * V[2])];
  const ci = k2V(b, c[0], c[1], c[2], N[0], N[1], N[2], U[0], U[1], U[2], ...uv(c), col), ids = pts.map(p => k2V(b, p[0], p[1], p[2], N[0], N[1], N[2], U[0], U[1], U[2], ...uv(p), col));
  for (let k = 0; k < ids.length; k++) { k2Tri(b, ci, ids[k], ids[(k + 1) % ids.length]); if (o.occ !== false) k2Occ(...c, ...pts[k], ...pts[(k + 1) % pts.length]); }
}

// ----- transforms: { o, x, y, z } = origin and (scaled) basis vectors -----
const k2T = (x, y, z, yaw = 0) => { const c = Math.cos(yaw), s = Math.sin(yaw); return { o: [x, y, z], x: [c, 0, -s], y: [0, 1, 0], z: [s, 0, c] }; };
function k2P(T, x, y, z) { return [T.o[0] + T.x[0] * x + T.y[0] * y + T.z[0] * z, T.o[1] + T.x[1] * x + T.y[1] * y + T.z[1] * z, T.o[2] + T.x[2] * x + T.y[2] * y + T.z[2] * z]; }
function k2D(T, x, y, z) { const v = [T.x[0] * x + T.y[0] * y + T.z[0] * z, T.x[1] * x + T.y[1] * y + T.z[1] * z, T.x[2] * x + T.y[2] * y + T.z[2] * z], l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
// child frame: offset + Euler rotation (yaw Y, pitch X, roll Z, applied Y·X·Z like Babylon)
function k2Sub(T, x, y, z, rx = 0, ry = 0, rz = 0) {
  const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), cz = Math.cos(rz), sz = Math.sin(rz);
  // rotation matrix columns (local axes in parent space)
  const X = [cy * cz + sy * sx * sz, cx * sz, -sy * cz + cy * sx * sz], Y = [-cy * sz + sy * sx * cz, cx * cz, sy * sz + cy * sx * cz], Z = [sy * cx, -sx, cy * cx];
  const m = v => [T.x[0] * v[0] + T.y[0] * v[1] + T.z[0] * v[2], T.x[1] * v[0] + T.y[1] * v[1] + T.z[1] * v[2], T.x[2] * v[0] + T.y[2] * v[1] + T.z[2] * v[2]];
  return { o: k2P(T, x, y, z), x: m(X), y: m(Y), z: m(Z) };
}
// a frame whose local +y runs from a to b (pipes, legs, rails)
function k2Along(a, b) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(d[0], d[1], d[2]) || 1, y = [d[0] / L, d[1] / L, d[2] / L];
  const h = Math.abs(y[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let x = [h[1] * y[2] - h[2] * y[1], h[2] * y[0] - h[0] * y[2], h[0] * y[1] - h[1] * y[0]]; const xl = Math.hypot(...x); x = x.map(v => v / xl);
  const z = [x[1] * y[2] - x[2] * y[1], x[2] * y[0] - x[0] * y[2], x[0] * y[1] - x[1] * y[0]];
  return { T: { o: a.slice(), x, y, z }, L };
}

// ----- props: material ids for the triplanar prop shader -----
const PM2 = { paint: 0, rust: 1, steel: 2, insul: 3, rubber: 4, wood: 5, conc: 6, brass: 7, glass: 8, plastic: 9, paper: 10, haz: 11, cloth: 12 };
const pc2 = (rgb, m) => [rgb[0], rgb[1], rgb[2], (m + 0.5) / 16];
// a surface of revolution about local y: prof = [[r, y], ...] bottom to top; seg around; smooth normals from the profile
function k2Lathe(T, prof, seg, col, o = {}) {
  const mat = o.mat || 'prop', c = k2P(T, 0, (prof[0][1] + prof[prof.length - 1][1]) / 2, 0), b = k2Bucket(mat, c[0], c[2]), base = b.p.length / 3, n = prof.length;
  const a0 = o.a0 ?? 0, a1 = o.a1 ?? Math.PI * 2, full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6, ns = full ? seg : seg + 1;
  // profile normals (2D) from neighbours; sharp corners when o.hard
  const pn = prof.map((p, i) => { const q0 = prof[Math.max(0, i - 1)], q1 = prof[Math.min(n - 1, i + 1)], dr = q1[0] - q0[0], dy = q1[1] - q0[1], l = Math.hypot(dr, dy) || 1; return [dy / l, -dr / l]; });
  let vlen = 0; const vv = prof.map((p, i) => i ? (vlen += Math.hypot(p[0] - prof[i - 1][0], p[1] - prof[i - 1][1])) : 0);
  for (let s = 0; s < ns; s++) {
    const a = a0 + (a1 - a0) * s / seg, ca = Math.cos(a), sa = Math.sin(a);
    for (let i = 0; i < n; i++) {
      const [r, y] = prof[i], [nr, ny] = pn[i], P = k2P(T, r * ca, y, r * sa), N = k2D(T, nr * ca, ny, nr * sa), Tg = k2D(T, -sa, 0, ca);
      k2V(b, P[0], P[1], P[2], N[0], N[1], N[2], Tg[0], Tg[1], Tg[2], a * Math.max(r, 0.05), vv[i], col);
    }
  }
  for (let s = 0; s < seg; s++) for (let i = 0; i < n - 1; i++) {
    const q = base + s * n + i, q2 = base + ((s + 1) % ns) * n + i;
    if (prof[i][0] < 1e-4 && prof[i + 1][0] < 1e-4) continue;
    k2Tri(b, q, q2, q2 + 1); k2Tri(b, q, q2 + 1, q + 1);
    if (o.occ !== false) { const P = b.p, g = k => [P[k * 3], P[k * 3 + 1], P[k * 3 + 2]]; k2Occ(...g(q), ...g(q2), ...g(q2 + 1), o.om || 1); k2Occ(...g(q), ...g(q2 + 1), ...g(q + 1), o.om || 1); }
  }
}
// cylinder along local y from y0 to y1 (+caps), subdivided lengthwise so the bake can put shadows along it
function k2Cyl(T, r, y0, y1, seg, col, o = {}) {
  const L = y1 - y0, sub = Math.max(1, Math.ceil(L / (o.step || 0.6))), prof = [];
  if (o.cap0 !== false) prof.push([0, y0], [r * 0.999, y0]);
  for (let i = 0; i <= sub; i++) prof.push([r, y0 + L * i / sub]);
  if (o.cap1 !== false) prof.push([r * 0.999, y1], [0, y1]);
  // caps need flat normals: build the side and the caps as separate lathes
  k2Lathe(T, Array.from({ length: sub + 1 }, (_, i) => [r, y0 + L * i / sub]), seg, col, o);
  if (o.cap0 !== false) k2Disc(T, r, y0, -1, seg, col, o);
  if (o.cap1 !== false) k2Disc(T, r, y1, 1, seg, col, o);
}
function k2Disc(T, r, y, side, seg, col, o = {}) {
  const mat = o.mat || 'prop', c = k2P(T, 0, y, 0), b = k2Bucket(mat, c[0], c[2]), N = k2D(T, 0, side, 0), Tg = k2D(T, 1, 0, 0);
  const ci = k2V(b, c[0], c[1], c[2], N[0], N[1], N[2], Tg[0], Tg[1], Tg[2], 0, 0, col), ids = [];
  for (let s = 0; s < seg; s++) { const a = s / seg * Math.PI * 2, P = k2P(T, Math.cos(a) * r, y, Math.sin(a) * r); ids.push(k2V(b, P[0], P[1], P[2], N[0], N[1], N[2], Tg[0], Tg[1], Tg[2], Math.cos(a) * r, Math.sin(a) * r, col)); }
  for (let s = 0; s < seg; s++) k2Tri(b, ci, ids[s], ids[(s + 1) % seg]);
}
// box with chamfered edges (bevel b): flat faces + 12 edge strips + 8 corner triangles; s = [w, h, d] centred on the frame origin
function k2Box(T, s, col, o = {}) {
  const mat = o.mat || 'prop', bv = Math.min(o.bevel ?? 0.012, s[0] / 3, s[1] / 3, s[2] / 3), hx = s[0] / 2, hy = s[1] / 2, hz = s[2] / 2, c = T.o, b = k2Bucket(mat, c[0], c[2]);
  const step = o.step || 0.6, faces = o.faces ?? 63;
  // the six faces, inset by the bevel
  const F = [[[1, 0, 0], [0, 0, -1], [0, 1, 0], hx, hz, hy], [[-1, 0, 0], [0, 0, 1], [0, 1, 0], hx, hz, hy], [[0, 0, 1], [1, 0, 0], [0, 1, 0], hz, hx, hy], [[0, 0, -1], [-1, 0, 0], [0, 1, 0], hz, hx, hy], [[0, 1, 0], [1, 0, 0], [0, 0, -1], hy, hx, hz], [[0, -1, 0], [1, 0, 0], [0, 0, 1], hy, hx, hz]];
  F.forEach(([n, u, v, dn, du, dv], fi) => {
    if (!(faces & (1 << fi))) return;
    const N = k2D(T, ...n), U = k2D(T, ...u), V = k2D(T, ...v), P0 = k2P(T, n[0] * dn - u[0] * (du - bv) - v[0] * (dv - bv), n[1] * dn - u[1] * (du - bv) - v[1] * (dv - bv), n[2] * dn - u[2] * (du - bv) - v[2] * (dv - bv));
    const lu = 2 * (du - bv) * k2Len(T, u), lv = 2 * (dv - bv) * k2Len(T, v);
    k2Rect(mat, P0, U, V, lu, lv, N, col, step, { occ: o.occ, om: o.om ?? 2, uo: o.uo, vo: o.vo });
  });
  if (bv <= 1e-4) return;
  // edge chamfers: for each pair of adjacent axes
  const E = [[0, 1], [0, 2], [1, 2]];
  for (const [a1, a2] of E) for (const s1 of [-1, 1]) for (const s2 of [-1, 1]) {
    const a3 = 3 - a1 - a2, e = [0, 0, 0], h = [hx, hy, hz], n1 = [0, 0, 0], n2 = [0, 0, 0]; n1[a1] = s1; n2[a2] = s2;
    const pA = [0, 0, 0], pB = [0, 0, 0]; pA[a1] = s1 * h[a1]; pA[a2] = s2 * (h[a2] - bv); pB[a1] = s1 * (h[a1] - bv); pB[a2] = s2 * h[a2];
    const nn = [(n1[0] + n2[0]) * 0.7071, (n1[1] + n2[1]) * 0.7071, (n1[2] + n2[2]) * 0.7071], N = k2D(T, ...nn);
    e[a3] = 1; const U = k2D(T, ...e), len = 2 * (h[a3] - bv) * k2Len(T, e);
    const A = k2P(T, pA[0] - e[0] * (h[a3] - bv), pA[1] - e[1] * (h[a3] - bv), pA[2] - e[2] * (h[a3] - bv)), Bp = k2P(T, pB[0] - e[0] * (h[a3] - bv), pB[1] - e[1] * (h[a3] - bv), pB[2] - e[2] * (h[a3] - bv));
    const V = [Bp[0] - A[0], Bp[1] - A[1], Bp[2] - A[2]], vl = Math.hypot(...V); if (vl < 1e-5) continue;
    k2Rect(mat, A, U, V.map(q => q / vl), len, vl, N, col, step, { occ: false });
  }
  // corner triangles
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const P = [k2P(T, sx * hx, sy * (hy - bv), sz * (hz - bv)), k2P(T, sx * (hx - bv), sy * hy, sz * (hz - bv)), k2P(T, sx * (hx - bv), sy * (hy - bv), sz * hz)], N = k2D(T, sx, sy, sz);
    const bb = k2Bucket(mat, P[0][0], P[0][2]), ids = P.map(p => k2V(bb, p[0], p[1], p[2], N[0], N[1], N[2], 1, 0, 0, 0, 0, col)); k2Tri(bb, ids[0], ids[1], ids[2]);
  }
}
const k2Len = (T, v) => Math.hypot(T.x[0] * v[0] + T.y[0] * v[1] + T.z[0] * v[2], T.x[1] * v[0] + T.y[1] * v[1] + T.z[1] * v[2], T.x[2] * v[0] + T.y[2] * v[1] + T.z[2] * v[2]);
// a torus in the local xz plane (handwheels, elbows): R major, r minor, arc a0..a1
function k2Torus(T, R, r, segR, segr, col, o = {}) {
  const mat = o.mat || 'prop', b = k2Bucket(mat, T.o[0], T.o[2]), base = b.p.length / 3, a0 = o.a0 ?? 0, a1 = o.a1 ?? Math.PI * 2, full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6, nR = full ? segR : segR + 1;
  for (let i = 0; i < nR; i++) { const a = a0 + (a1 - a0) * i / segR, ca = Math.cos(a), sa = Math.sin(a);
    for (let j = 0; j < segr; j++) { const t = j / segr * Math.PI * 2, ct = Math.cos(t), st = Math.sin(t), P = k2P(T, (R + r * ct) * ca, r * st, (R + r * ct) * sa), N = k2D(T, ct * ca, st, ct * sa), Tg = k2D(T, -sa, 0, ca); k2V(b, P[0], P[1], P[2], N[0], N[1], N[2], Tg[0], Tg[1], Tg[2], a * R, t * r, col); } }
  for (let i = 0; i < segR; i++) for (let j = 0; j < segr; j++) { const q = base + i * segr + j, q1 = base + i * segr + (j + 1) % segr, n0 = base + ((i + 1) % nR) * segr + j, n1 = base + ((i + 1) % nR) * segr + (j + 1) % segr;
    k2Tri(b, q, n0, n1); k2Tri(b, q, n1, q1);
    if (o.occ) { const P = b.p, g = k => [P[k * 3], P[k * 3 + 1], P[k * 3 + 2]]; k2Occ(...g(q), ...g(n0), ...g(n1), 1); k2Occ(...g(q), ...g(n1), ...g(q1), 1); } }
}
function k2Sphere(T, r, seg, col, o = {}) { const p = []; const n = Math.max(4, seg >> 1); for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; p.push([Math.cos(a) * r, Math.sin(a) * r]); } k2Lathe(T, p, seg, col, o); }
// a straight pipe between two points (subdivided), optional flanges at the ends
function k2Pipe(a, b, r, col, o = {}) {
  const { T, L } = k2Along(a, b), seg = o.seg || (r > 0.3 ? 20 : r > 0.1 ? 14 : r > 0.04 ? 10 : 6);
  k2Cyl(T, r, 0, L, seg, col, { cap0: !!o.cap, cap1: !!o.cap, step: o.step || 0.7, occ: o.occ ?? (r > 0.03), mat: o.mat });
  if (o.flange) for (const y of [0.02, L - 0.02]) k2Cyl(k2Sub(T, 0, y, 0), r * 1.32, -0.025, 0.025, seg, o.fcol || col, { occ: false, mat: o.mat });
}
// a run of pipe through points with elbows of bend radius rb at every corner
function k2PipeRun(pts, r, col, o = {}) {
  const rb = o.bend ?? Math.max(r * 2, 0.12), seg = o.seg || (r > 0.3 ? 20 : r > 0.1 ? 14 : 10), cut = [];
  for (let i = 0; i < pts.length; i++) cut.push([pts[i].slice(), pts[i].slice()]);
  for (let i = 1; i < pts.length - 1; i++) {
    const A = pts[i - 1], B = pts[i], C = pts[i + 1], u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - B[0], C[1] - B[1], C[2] - B[2]], lu = Math.hypot(...u), lv = Math.hypot(...v);
    const du = u.map(q => q / lu), dv = v.map(q => q / lv), cosA = du[0] * dv[0] + du[1] * dv[1] + du[2] * dv[2]; if (cosA > 0.999) continue;
    const ang = Math.acos(clamp(cosA, -1, 1)), t = Math.min(rb * Math.tan(ang / 2), lu * 0.45, lv * 0.45);
    cut[i][0] = [B[0] - du[0] * t, B[1] - du[1] * t, B[2] - du[2] * t]; cut[i][1] = [B[0] + dv[0] * t, B[1] + dv[1] * t, B[2] + dv[2] * t];
    // the elbow: a torus arc in the plane of du, dv
    const nrm = [du[1] * dv[2] - du[2] * dv[1], du[2] * dv[0] - du[0] * dv[2], du[0] * dv[1] - du[1] * dv[0]], nl = Math.hypot(...nrm), nn = nrm.map(q => q / nl);
    const rr = t / Math.tan(ang / 2), inward = [nn[1] * du[2] - nn[2] * du[1], nn[2] * du[0] - nn[0] * du[2], nn[0] * du[1] - nn[1] * du[0]];   // points to the bend centre
    const P0 = cut[i][0], Ctr = [P0[0] + inward[0] * rr, P0[1] + inward[1] * rr, P0[2] + inward[2] * rr], X = inward.map(q => -q);
    k2Torus({ o: Ctr, x: X, y: nn, z: du }, rr, r, Math.max(4, Math.round(ang / 0.2)), seg, col, { a0: 0, a1: ang, mat: o.mat, occ: r > 0.05 });
  }
  for (let i = 0; i < pts.length - 1; i++) k2Pipe(cut[i][1], cut[i + 1][0], r, col, { seg, flange: false, mat: o.mat, step: o.step });
  if (o.flange) for (let i = 0; i < pts.length - 1; i += o.flangeEvery || 1) { const a = cut[i][1], b = cut[i + 1][0], d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); if (d < 0.5) continue; const { T } = k2Along(a, b); for (const y of [0.08, d - 0.08]) k2Cyl(k2Sub(T, 0, y, 0), r * 1.3, -0.03, 0.03, seg, o.fcol || col, { occ: false, mat: o.mat }); }
}
// an extruded 2D profile (local x, y) swept along a straight line a->b (beams, rails, angle iron)
function k2Extrude(a, b, prof, col, o = {}) {
  const { T, L } = k2Along(a, b), n = prof.length, mat = o.mat || 'prop';
  // T.y runs along the beam; the profile lives in T.x / T.z
  for (let i = 0; i < n; i++) {
    const p = prof[i], q = prof[(i + 1) % n], ex = q[0] - p[0], ez = q[1] - p[1], l = Math.hypot(ex, ez) || 1, nrm = [ez / l, -ex / l];
    const P0 = k2P(T, p[0], 0, p[1]), U = k2D(T, 0, 1, 0), V = k2D(T, ex / l, 0, ez / l), N = k2D(T, nrm[0], 0, nrm[1]);
    k2Rect(mat, P0, U, V, L, l, N, col, o.step || 0.6, { occ: o.occ ?? true, om: 2 });
  }
  if (o.caps) for (const [y, s] of [[0, -1], [L, 1]]) { const pts = prof.map(p => k2P(T, p[0], y, p[1])); k2Poly(mat, s > 0 ? pts : pts.slice().reverse(), k2D(T, 0, s, 0), k2D(T, 1, 0, 0), col, { occ: false }); }
}
const PROF2 = {
  ibeam: (w, h, t = 0.012, f = 0.016) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, -h / 2 + f], [t / 2, -h / 2 + f], [t / 2, h / 2 - f], [w / 2, h / 2 - f], [w / 2, h / 2], [-w / 2, h / 2], [-w / 2, h / 2 - f], [-t / 2, h / 2 - f], [-t / 2, -h / 2 + f], [-w / 2, -h / 2 + f]],
  angle: (w, t = 0.008) => [[0, 0], [w, 0], [w, t], [t, t], [t, w], [0, w]],
  chan: (w, h, t = 0.01) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [w / 2 - t, h / 2], [w / 2 - t, -h / 2 + t], [-w / 2 + t, -h / 2 + t], [-w / 2 + t, h / 2], [-w / 2, h / 2]],
  rect: (w, h) => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]],
  round: (r, n = 8) => Array.from({ length: n }, (_, i) => [Math.cos(i / n * Math.PI * 2) * r, Math.sin(i / n * Math.PI * 2) * r]),
};
