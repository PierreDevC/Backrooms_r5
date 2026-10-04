// ---------- r12 · Level 9 on the ray-traced bake: world materials, kit geometry, lamps and moon, trees, night sky ----------
// Level 9 is lit like Level 2 now (rt.js / bake2.js / render2.js): every vertex carries moonlight with soft shadows, the sodium street lamps, porch and room lamps,
// ambient occlusion and one bounce, baked at load. Props that are still built from PropBatch (cars, furniture, story objects) are lit by the 2D light texture.
// MAT9W: scan key, repeats per metre, normal strength, roughness x, metalness, wet response, spec x, albedo gain, ao strength; t255 = target colour (sRGB) of the
// scan's mean (asset tint, as the old materials did); va = vertex wetness; step = vertex spacing in metres; occ = casts shadows in the tracer.
const MAT9W = {
  __sub: true,
  asph: { k: 'asph', s: 1 / 4.8, nS: 1.4, r: 1, m: 0, wet: 0.55, sp: 1.2, g: 1.0, ao: 0.7, t255: [58, 58, 60], va: 1, step: 0.6 },
  grass: { k: 'grass', s: 1 / 3.2, nS: 1.0, r: 1, m: 0, wet: 0, sp: 0.15, g: 1.0, ao: 0.9, t255: [70, 84, 40], step: 0.9 },
  conc: { k: 'conc', s: 1 / 2.8, nS: 1.0, r: 1, m: 0, wet: 0.35, sp: 0.5, g: 0.8, ao: 0.8, va: 0.5, step: 0.6 },
  siding: { k: 'siding', s: 1 / 2.4, nS: 1.0, r: 1, m: 0, wet: 0, sp: 0.3, g: 1.25, ao: 0.8, step: 0.45 },
  wallin: { k: 'paper9', s: 1 / 0.9, nS: 0.8, r: 1, m: 0, wet: 0, sp: 0.2, g: 1.0, ao: 0.6, step: 0.45 },
  labwall: { k: 'labwall', s: 1 / 1.6, nS: 0.8, r: 1, m: 0, wet: 0, sp: 0.4, g: 1.0, ao: 0.6, step: 0.45 },
  block: { k: 'block', s: 1 / 1.6, nS: 1.0, r: 1, m: 0, wet: 0.2, sp: 0.3, g: 1.0, ao: 0.8, step: 0.45 },
  brick: { k: 'l2brick', s: 1 / 2.0, nS: 1.2, r: 1, m: 0, wet: 0.2, sp: 0.4, g: 1.0, ao: 0.9, step: 0.45 },
  fence: { k: 'planks', s: 1 / 2.4, nS: 1.0, r: 1, m: 0, wet: 0, sp: 0.2, g: 1.0, ao: 0.8, t255: [92, 66, 44], step: 0.5 },
  floor: { k: 'wood9', s: 1 / 2.4, nS: 1.0, r: 1, m: 0, wet: 0, sp: 0.6, g: 1.0, ao: 0.7, t255: [112, 80, 52], step: 0.7 },
  tile: { k: 'ktile', s: 1 / 1.2, nS: 1.0, r: 0.9, m: 0, wet: 0, sp: 0.8, g: 1.0, ao: 0.6, step: 0.7 },
  plaster: { k: 'plaster', s: 1 / 2.5, nS: 0.8, r: 1, m: 0, wet: 0, sp: 0.1, g: 1.0, ao: 0.7, t255: [200, 196, 186], step: 0.9 },
  ceil: { k: 'l0ceil', s: 1 / 1.2, nS: 0.8, r: 1, m: 0, wet: 0, sp: 0.1, g: 1.0, ao: 0.7, t255: [206, 200, 180], step: 0.9 },
  roof: { k: 'roof', s: 1 / 2.2, nS: 1.2, r: 1, m: 0, wet: 0.3, sp: 0.5, g: 1.0, ao: 0.8, t255: [58, 56, 60], va: 0.6, step: 0.6 },
  case: { k: 'kwall', s: 1 / 1.5, nS: 0.5, r: 1, m: 0, wet: 0, sp: 0.4, g: 1.0, ao: 0.6, step: 0.6, occ: false },
  chain: { k: 'chain', s: 1, nS: 0.5, r: 1, m: 0.5, wet: 0, sp: 0.5, g: 1.0, ao: 1, cut: 'chain', step: 2, occ: false },
  leaf: { k: 'grass', s: 1, nS: 0, r: 1, m: 0, wet: 0, sp: 0.1, g: 1.0, ao: 0.9, cut: 'leaf', step: 3 },
};
// a Geo look-alike that writes into the kit's buckets, so the layout code (pieces, floors, roofs, stairs) is unchanged
class KGeo {
  constructor(mat) { this.mat = mat; this.D = MAT9W[mat]; }
  face(ox, oy, oz, U, V, du, dv, Nn, s, uvFix, col) {
    const D = this.D, big = du > 40 || dv > 40;
    k2Rect(this.mat, [ox, oy, oz], U, V, du, dv, Nn, [col[0], col[1], col[2], D.va || 0], big ? 3 : D.step, { uo: ox * U[0] + oy * U[1] + oz * U[2], vo: ox * V[0] + oy * V[1] + oz * V[2], occ: D.occ !== false });
  }
  box(x0, y0, z0, x1, y1, z1, s, mask = 63, col) { Geo.prototype.box.call(this, x0, y0, z0, x1, y1, z1, s, mask, col); }
  quad(P0, P1, P3, s, col) {
    const U = [P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]], V = [P3[0] - P0[0], P3[1] - P0[1], P3[2] - P0[2]], du = Math.hypot(...U), dv = Math.hypot(...V), u = U.map(v => v / du), v = V.map(q => q / dv);
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], nl = Math.hypot(...n) || 1;
    this.face(P0[0], P0[1], P0[2], u, v, du, dv, n.map(q => q / nl), s, false, col);
  }
  tri(p0, p1, p2, s, col) {
    const U = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], W2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
    let n = [U[1] * W2[2] - U[2] * W2[1], U[2] * W2[0] - U[0] * W2[2], U[0] * W2[1] - U[1] * W2[0]]; const nl = Math.hypot(...n) || 1; n = n.map(q => q / nl);
    const ul = Math.hypot(...U), T = U.map(q => q / ul);
    k2Poly(this.mat, [p0, p1, p2], n, T, [col[0], col[1], col[2], this.D.va || 0], { occ: this.D.occ !== false });
  }
}
const _kg9 = {};
function KG(m) { return _kg9[m] || (_kg9[m] = new KGeo(m)); }
// scan tints, resolved once the pack is known
function prepMat9() { for (const k of Object.keys(_kg9)) delete _kg9[k]; for (const D of Object.values(MAT9W)) if (D && D.t255) D.tint = tintTo(D.k, D.t255); }
// occluder-only box (cars, lamp posts): casts shadows in the bake, draws nothing
function k2OccBox(cx, y0, cz, w, h, d, ry) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (x, y, z) => [cx + x * c + z * s, y, cz - x * s + z * c], hx = w / 2, hz = d / 2, y1 = y0 + h;
  const v = [P(-hx, y0, -hz), P(hx, y0, -hz), P(hx, y0, hz), P(-hx, y0, hz), P(-hx, y1, -hz), P(hx, y1, -hz), P(hx, y1, hz), P(-hx, y1, hz)];
  for (const [a, b, e, f] of [[0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 6, 7], [0, 3, 2, 1]]) { k2Occ(...v[a], ...v[b], ...v[e], 1); k2Occ(...v[a], ...v[e], ...v[f], 1); }
}

// ----- the architecture (this is level9.js's buildGeometry9, writing to the kit) -----
function buildArch9(fm) {
  const CH = 8, NC = Math.ceil(N / CH);
  const geo = (m, ci) => KG(m);
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
  // lab / base ceiling fixtures (reuse the troffer look); the light itself comes from the bake
  const xg = new Geo(true);
  for (const f of LV.fixtures) {
    if (!f.troffer) continue;
    const col = [f.state === 0 ? 0 : 1, f.state === 2 ? 1 : 0, f.seed, 1], y = CEIL - 0.018, x0 = f.x - 0.6, z0 = f.z - 0.3;
    xg.face(x0, y, z0, [1, 0, 0], [0, 0, 1], 1.2, 0.6, [0, -1, 0], 1, true, col);
  }
  if (xg.p.length) { const fx = xg.mesh('fixtures', SCN); fx.material = fm; fx._sortD = 920; }
}


// ----- lamps, the moon and the sky: what the bake lights the world with -----
const SODIUM9 = [1.0, 0.56, 0.24], WARM9 = [1.0, 0.76, 0.46], FLUO9 = [0.84, 0.93, 1.0], BASEL9 = [1.0, 0.88, 0.66];
const MOON9 = { d: (() => { const v = [-0.36, 0.58, 0.73], l = Math.hypot(...v); return v.map(q => q / l); })(), c: [0.52, 0.64, 1.0], I: 0.22 };
const SKY9 = { z: [0.012, 0.02, 0.05], h: [0.05, 0.04, 0.045] };   // radiance the bounce pass sees overhead and at the horizon
function planBake9() {
  const L = LV.l2Lights = [], LL = o => { const l = Object.assign({ r: 0.06, rng: 9, kind: 'pt', flick: 0, hz: 0.3, hr: 0.25, up: 0.05 }, o); L.push(l); return l; };
  LL({ kind: 'sun', d: MOON9.d, c: MOON9.c, I: MOON9.I, r: 0.03, noProbe: true, hz: 0, rng: 1e4 });
  LV.l2Sky = SKY9;
  for (const l of LV.lamps) if (l.state) LL({ kind: 'spot', p: [l.hx, 4.8, l.hz], d: [0, -1, 0], co: Math.cos(1.35), ci: Math.cos(0.45), up: 0.04, c: SODIUM9, I: 70, r: 0.16, rng: 22, flick: l.state === 2 ? 1 : 0, hz: 1.0, hr: 0.4 });
  for (const f of LV.fixtures) {
    if (f.lamp || !f.state) continue;
    const fl = f.state === 2 ? 1 : 0;
    if (f.troffer) LL({ kind: 'line', p: [f.x - 0.6, CEIL - 0.12, f.z], b: [f.x + 0.6, CEIL - 0.12, f.z], c: f.lab ? FLUO9 : BASEL9, I: f.lab ? 6.5 : 6, rng: 9, flick: fl, hz: 0.18 });
    else if (f.kind === 'flood') LL({ kind: 'spot', p: [f.x, 4.6, f.z], d: [0, -1, 0], co: Math.cos(1.3), ci: Math.cos(0.5), up: 0.04, c: FLUO9, I: 32, r: 0.2, rng: 15, flick: 1, hz: 0.8, hr: 0.4 });
    else if (f.kind === 'porch') LL({ p: [f.x, 2.25, f.z], c: WARM9, I: 4.5, rng: 8, r: 0.07, flick: fl, hz: 0.35 });
    else LL({ p: [f.x, 1.35, f.z], c: WARM9, I: 7, rng: 9, r: 0.1, flick: fl, hz: 0.15 });
  }
  // glowing windows on the sealed lit houses: a faint warm spill across the sill and lawn
  for (const w of LV.winList) if (w.lit && !w.hole) { const [mx, mz] = edgeMid(w.x, w.y, w.d); LL({ p: [mx + DX[w.d] * 0.7, (w.up ? FLH : 0) + 1.5, mz + DY[w.d] * 0.7], c: WARM9, I: 1.6, rng: 5, r: 0.3, hz: 0.08 }); }
  R2.lights = L;
}
// ----- trees and shrubs from the kit: tapered trunk, limbs, alpha-cut leaf cards -----
function k2Leaf9(cx, cy, cz, R, n, col) {
  for (let i = 0; i < n; i++) {
    const a = rnd(0, TAU), zz = rnd(-1, 1), rr = Math.sqrt(1 - zz * zz), u = [Math.cos(a) * rr, zz, Math.sin(a) * rr], d = R * Math.cbrt(RNG()), P = [cx + u[0] * d, cy + u[1] * d * 0.8, cz + u[2] * d];
    const a2 = rnd(0, TAU), b2 = rnd(-0.6, 0.6), U = [Math.cos(a2), 0, Math.sin(a2)], V = [-Math.sin(a2) * Math.sin(b2), Math.cos(b2), Math.cos(a2) * Math.sin(b2)], sz = rnd(1.0, 1.7) * R / 1.1, k = rnd(0.8, 1.25);
    k2Rect('leaf', [P[0] - (U[0] + V[0]) * sz / 2, P[1] - (U[1] + V[1]) * sz / 2, P[2] - (U[2] + V[2]) * sz / 2], U, V, sz, sz, u, [col[0] * k, col[1] * k, col[2] * k, 0], 3, { uo: rnd(0, 40), vo: rnd(0, 40) });
  }
}
function kitTree9(x, z, dead) {
  const T = k2T(x, 0, z, rnd(0, TAU)), h = rnd(2.2, 3.4), TR = pc2([0.46, 0.37, 0.29], PM2.wood);
  k2Lathe(T, [[0.001, -0.02], [0.2, 0], [0.17, 0.3], [0.13, h * 0.55], [0.09, h]], 8, TR, { occ: true });
  if (dead) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + rnd(-0.3, 0.3), l = rnd(1.0, 1.8), b = [x, h - 0.3, z], e = [x + Math.sin(a) * l * 0.8, h - 0.3 + l * 0.7, z + Math.cos(a) * l * 0.8]; k2Pipe(b, e, 0.045, TR, { seg: 5, occ: false }); k2Pipe([(b[0] + e[0]) / 2, (b[1] + e[1]) / 2, (b[2] + e[2]) / 2], [e[0] + Math.sin(a + 1) * 0.5, e[1] + 0.3, e[2] + Math.cos(a + 1) * 0.5], 0.02, TR, { seg: 4, occ: false }); }
  else { for (let i = 0; i < 4; i++) k2Leaf9(x + rnd(-0.6, 0.6), h + rnd(0.5, 1.5), z + rnd(-0.6, 0.6), rnd(0.9, 1.3), 12, [0.26, 0.36, 0.19]); for (let i = 0; i < 2; i++) k2Pipe([x, h * 0.55, z], [x + rnd(-0.6, 0.6), h + 0.5, z + rnd(-0.6, 0.6)], 0.04, TR, { seg: 5, occ: false }); }
  addSolid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 'prop');
}
function kitShrub9(x, z) { k2Leaf9(x, 0.45, z, rnd(0.45, 0.7), 9, [0.24, 0.34, 0.17]); addSolid(x - 0.4, z - 0.4, x + 0.4, z + 0.4, 'prop'); }
// ----- the night sky: a dome that follows the camera, sodium glow at the horizon, clouds, stars and the moon -----
const SKY9_V = `precision highp float; attribute vec3 position; uniform mat4 world; uniform mat4 viewProjection; varying vec3 vD;
void main(){ vD = position; gl_Position = viewProjection*world*vec4(position, 1.0); }`;
const SKY9_F = `precision highp float; varying vec3 vD; uniform vec4 skyP; uniform vec4 moonD;
float h31(vec3 p){ p = fract(p*0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y)*p.z); }
float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(mix(h31(i), h31(i + vec3(1.,0.,0.)), f.x), mix(h31(i + vec3(0.,1.,0.)), h31(i + vec3(1.,1.,0.)), f.x), f.y), mix(mix(h31(i + vec3(0.,0.,1.)), h31(i + vec3(1.,0.,1.)), f.x), mix(h31(i + vec3(0.,1.,1.)), h31(i + vec3(1.,1.,1.)), f.x), f.y), f.z); }
float fb(vec3 p){ float s = 0.0, a = 0.5; for(int i = 0; i < 5; i++){ s += a*n3(p); p = p*2.02 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
void main(){
  vec3 d = normalize(vD); float h = d.y;
  vec3 zen = vec3(0.004, 0.008, 0.024), hor = vec3(0.058, 0.036, 0.027);
  vec3 col = mix(hor, zen, pow(clamp(h, 0.0, 1.0), 0.42));
  col = mix(col, hor*0.3, smoothstep(0.0, -0.1, h));
  float md = max(dot(d, moonD.xyz), 0.0);
  vec2 cu = d.xz/max(h, 0.05)*0.5 + vec2(skyP.x*0.004, skyP.x*0.0015);
  float cm = smoothstep(0.46, 0.8, fb(vec3(cu*1.7, 2.0)))*smoothstep(0.0, 0.25, h);
  vec3 cc = mix(vec3(0.016, 0.022, 0.045), hor*1.15, pow(1.0 - clamp(h, 0.0, 1.0), 3.0)) + vec3(0.3, 0.36, 0.5)*pow(md, 5.0)*0.35;
  col = mix(col, cc, cm*0.85);
  float star = step(0.9985, h31(floor(d*260.0))) * (1.0 - cm) * smoothstep(0.05, 0.35, h); col += vec3(0.8, 0.86, 1.0)*star*0.22;
  col += vec3(1.7, 1.85, 2.2)*smoothstep(0.99965, 0.99985, md)*(1.0 - cm*0.75);
  col += (vec3(0.16, 0.22, 0.4)*pow(md, 300.0) + vec3(0.035, 0.05, 0.1)*pow(md, 28.0))*(1.0 - cm*0.45);
  gl_FragColor = vec4(col, 1.0);
}`;
function buildSky9() {
  BABYLON.Effect.ShadersStore.sky9VertexShader = SKY9_V; BABYLON.Effect.ShadersStore.sky9FragmentShader = SKY9_F;
  const m = new BABYLON.ShaderMaterial('sky9', SCN, { vertex: 'sky9', fragment: 'sky9' }, { attributes: ['position'], uniforms: ['world', 'viewProjection', 'skyP', 'moonD'] });
  m.setVector4('moonD', new BABYLON.Vector4(MOON9.d[0], MOON9.d[1], MOON9.d[2], 0)); m.setVector4('skyP', new BABYLON.Vector4(0, 0, 0, 0)); m.backFaceCulling = false; m.disableDepthWrite = true;
  const s = BABYLON.MeshBuilder.CreateSphere('sky9', { diameter: 110, segments: 24 }, SCN); s.material = m; s.isPickable = false; s.alwaysSelectAsActiveMesh = true; s._sortD = -10; s.infiniteDistance = false;
  W9.sky = s; W9.skyMat = m;
}
function skyFrame9() { if (W9.sky) { W9.sky.position.copyFrom(CAM.position); const v = W9.skyMat._v || (W9.skyMat._v = new BABYLON.Vector4(0, 0, 0, 0)); v.x = FX.t; W9.skyMat.setVector4('skyP', v); } }
