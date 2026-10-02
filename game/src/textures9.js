// ---------- Level 9 procedural textures (seamless, 512²) ----------
function genTex9(scene, S, nStr, fn) {   // fn(u, v, x, y, o) writes o = [r, g, b, height] (0..1)
  const col = new Uint8Array(S * S * 4), H = new Float32Array(S * S), o = [0, 0, 0, 0];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x; fn(x / S, y / S, x, y, o);
    col[i * 4] = clamp(o[0] * 255, 0, 255); col[i * 4 + 1] = clamp(o[1] * 255, 0, 255); col[i * 4 + 2] = clamp(o[2] * 255, 0, 255); col[i * 4 + 3] = 255; H[i] = o[3];
  }
  return { albedo: rawTex(col, S, scene), normal: rawTex(heightToNormal(H, S, nStr), S, scene) };
}
const TEX9 = {
  asph: (sc, S) => genTex9(sc, S, 1.6, (u, v, x, y, o) => {        // aggregate asphalt, 4.8 m tile
    const n = tfbm(u * 6, v * 6, 6, 4, 101), g = h2i(x, y, 102), g2 = h2i(x >> 1, y >> 1, 103), st = g2 > 0.93 ? 0.25 : 0;
    const b = 0.2 + n * 0.1 + (g - 0.5) * 0.07 + st * 0.35; o[0] = b; o[1] = b; o[2] = b * 1.04; o[3] = g * 0.5 + g2 * 0.5 + n * 0.6;
  }),
  grass: (sc, S) => genTex9(sc, S, 1.4, (u, v, x, y, o) => {       // unkempt lawn, 3.2 m tile
    const n = tfbm(u * 5, v * 5, 5, 4, 111), bl = h2i(x, y >> 2, 112), bl2 = h2i(x >> 1, y, 113), dry = smooth(0.55, 0.75, tfbm(u * 3, v * 3, 3, 3, 114));
    const b = 0.55 + bl * 0.35 + bl2 * 0.2 + n * 0.3;
    o[0] = lerp(0.17, 0.3, dry) * b; o[1] = lerp(0.24, 0.27, dry) * b; o[2] = lerp(0.1, 0.13, dry) * b; o[3] = bl * 0.6 + bl2 * 0.4;
  }),
  conc: (sc, S) => genTex9(sc, S, 2.0, (u, v, x, y, o) => {        // sidewalk slabs, 2 per 2.8 m tile
    const lu = (u * 2) % 1, lv = (v * 2) % 1, e = Math.min(lu, 1 - lu, lv, 1 - lv) * 1.4, jn = e < 0.006 ? 1 : 0;
    const n = tfbm(u * 8, v * 8, 8, 4, 121), f = h2i(x, y, 122), sl = h2i(Math.floor(u * 2), Math.floor(v * 2), 123);
    const b = (0.6 + n * 0.22 + (f - 0.5) * 0.06 + (sl - 0.5) * 0.08) * (jn ? 0.55 : 1);
    o[0] = b; o[1] = b * 0.98; o[2] = b * 0.93; o[3] = (jn ? 0 : 0.6) + n * 0.3 + f * 0.1;
  }),
  wood: (sc, S) => genTex9(sc, S, 1.2, (u, v, x, y, o) => {        // floor boards, 2.4 m tile, 20 boards
    const row = Math.floor(v * 20), rv = (v * 20) % 1, off = h2i(row, 0, 131), pu = (u + off) % 1, seg = Math.floor(pu * 2), su = (pu * 2) % 1;
    const tone = h2i(row, seg, 132), grain = 0.5 + 0.5 * Math.sin((v * 20 + tfbm(u * 4, v * 40, 4, 3, 133) * 3) * TAU * 3);
    const seam = rv < 0.04 || rv > 0.96 || su < 0.004 || su > 0.996;
    const b = (0.62 + tone * 0.3 + grain * 0.12 + (h2i(x, y, 134) - 0.5) * 0.05) * (seam ? 0.45 : 1);
    o[0] = 0.5 * b; o[1] = 0.34 * b; o[2] = 0.2 * b; o[3] = seam ? 0 : 0.6 + grain * 0.1;
  }),
  siding: (sc, S) => genTex9(sc, S, 3.0, (u, v, x, y, o) => {      // lap siding, 12 boards per 2.4 m
    const bv = (v * 12) % 1, n = tfbm(u * 4, v * 12, 4, 3, 141), f = h2i(x, y, 142);
    const lap = bv < 0.08 ? 0.62 : 0.88 + 0.12 * bv;
    const b = lap * (0.86 + n * 0.14 + (f - 0.5) * 0.04);
    o[0] = b; o[1] = b; o[2] = b * 0.97; o[3] = bv < 0.08 ? 0 : bv;
  }),
  roof: (sc, S) => genTex9(sc, S, 2.2, (u, v, x, y, o) => {        // asphalt shingles, 2.2 m tile
    const row = Math.floor(v * 9), rv = (v * 9) % 1, tu = (u * 7 + (row % 2) * 0.5) % 1, tab = Math.floor(u * 7 + (row % 2) * 0.5);
    const tone = h2i(tab, row, 151), gr = h2i(x, y, 152), gap = tu < 0.03;
    const b = (0.3 + tone * 0.16 + (gr - 0.5) * 0.1) * (rv > 0.85 ? 0.6 : 1) * (gap ? 0.5 : 1);
    o[0] = b * 1.05; o[1] = b * 0.95; o[2] = b * 0.9; o[3] = (1 - rv) * 0.8 + gr * 0.2 - (gap ? 0.5 : 0);
  }),
  block: (sc, S) => genTex9(sc, S, 2.2, (u, v, x, y, o) => {       // cinder block, 4 x 8 per 1.6 m
    const row = Math.floor(v * 8), bu = (u * 4 + (row % 2) * 0.5) % 1, bv = (v * 8) % 1;
    const e = Math.min(bu * 0.4, (1 - bu) * 0.4, bv * 0.2, (1 - bv) * 0.2), mort = e < 0.012;
    const n = tfbm(u * 16, v * 16, 16, 3, 161), pit = h2i(x, y, 162) > 0.96 ? 0.2 : 0, tone = h2i(Math.floor(u * 4 + (row % 2) * 0.5), row, 163);
    const b = mort ? 0.5 + n * 0.1 : 0.66 + n * 0.16 + tone * 0.06 - pit;
    o[0] = b; o[1] = b * 0.99; o[2] = b * 0.95; o[3] = mort ? 0 : 0.7 + n * 0.3 - pit;
  }),
  tile: (sc, S) => genTex9(sc, S, 1.5, (u, v, x, y, o) => {        // vinyl composition tile, 4 x 4 per 1.2 m
    const tu = (u * 4) % 1, tv = (v * 4) % 1, ti = Math.floor(u * 4), tj = Math.floor(v * 4), seam = Math.min(tu, 1 - tu, tv, 1 - tv) < 0.01;
    const alt = (ti + tj) % 2, n = tfbm(u * 12, v * 12, 12, 3, 171), fl = h2i(x >> 1, y >> 1, 172) > 0.9 ? 0.06 : 0;
    const b = (alt ? 0.78 : 0.62) + n * 0.1 + fl + (h2i(ti, tj, 173) - 0.5) * 0.05;
    o[0] = b * (seam ? 0.6 : 1); o[1] = b * 0.97 * (seam ? 0.6 : 1); o[2] = b * 0.9 * (seam ? 0.6 : 1); o[3] = seam ? 0 : 0.5;
  }),
  paper: (sc, S) => genTex9(sc, S, 0.9, (u, v, x, y, o) => {       // striped damask wallpaper, 0.9 m tile
    const su = (u * 8) % 1, stripe = su < 0.18 ? 0.9 : 1, cu = (u * 8 + 0.5) % 1 - 0.5, cv = (v * 6) % 1 - 0.5;
    const dm = Math.hypot(cu * 1.4, cv) < 0.16 + 0.05 * Math.sin(Math.atan2(cv, cu) * 4) ? 0.9 : 1;
    const n = tfbm(u * 6, v * 6, 6, 3, 181), f = h2i(x, y, 182);
    const b = stripe * dm * (0.86 + n * 0.12 + (f - 0.5) * 0.04);
    o[0] = b * 0.94; o[1] = b * 0.9; o[2] = b * 0.8; o[3] = (stripe < 1 ? 0.3 : 0.5) + (dm < 1 ? 0.1 : 0) + f * 0.1;
  }),
};
