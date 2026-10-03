// ---------- r9 · Level 2 procedural textures: painted tunnel wall, diamond-plate floor, sooty ceiling ----------
const TEX2 = {
  // two-tone painted concrete: dull green-grey above, a dark grime band below 1.1 m, panel seams every 1.2 m, stains and weeping rust (2.4 m tile)
  pwall: (sc, S) => genTex9(sc, S, 2.0, (u, v, x, y, o) => {
    const n = tfbm(u * 6, v * 6, 6, 4, 251), st = tfbm(u * 3 + 4, v * 9, 3, 3, 252), seam = (u * 2) % 1 < 0.008 || (u * 2) % 1 > 0.992, yy = 1 - v;
    const band = yy < 0.46 ? 1 : 0, edge = Math.abs(yy - 0.46) < 0.006, weep = Math.max(0, tfbm(u * 22, v * 1.4, 22, 2, 253) - 0.62) * 2.2 * (yy < 0.95 ? 1 : 0);
    let r = band ? 0.2 : 0.47, g = band ? 0.22 : 0.52, b = band ? 0.2 : 0.45;
    const k = (0.82 + n * 0.3) * (1 - Math.max(0, st - 0.5) * 0.5) * (seam ? 0.55 : 1) * (edge ? 0.6 : 1);
    r = r * k + weep * 0.18; g = g * k + weep * 0.07; b = b * k;
    o[0] = r; o[1] = g; o[2] = b; o[3] = 0.4 + n * 0.5 - (seam ? 0.4 : 0) + (edge ? -0.2 : 0);
  }),
  // diamond (tread) plate, worn bright on the raised lozenges, rust at the edges (1.2 m tile)
  plate: (sc, S) => genTex9(sc, S, 1.6, (u, v, x, y, o) => {
    const K = 10, cu = (u * K) % 1, cv = (v * K) % 1, odd = (Math.floor(u * K) + Math.floor(v * K)) % 2, a = odd ? (cu - 0.5) * 0.7 + (cv - 0.5) * 0.7 : (cu - 0.5) * 0.7 - (cv - 0.5) * 0.7, bb = odd ? (cu - 0.5) * 0.7 - (cv - 0.5) * 0.7 : (cu - 0.5) * 0.7 + (cv - 0.5) * 0.7;
    const lz = Math.abs(a) < 0.06 && Math.abs(bb) < 0.24, n = tfbm(u * 8, v * 8, 8, 4, 261), rust = Math.max(0, tfbm(u * 4 + 9, v * 4, 4, 3, 262) - 0.55) * 2;
    const base = 0.24 + n * 0.1, hi = lz ? 0.14 : 0;
    o[0] = base + hi + rust * 0.2; o[1] = base + hi * 0.95 + rust * 0.08; o[2] = base * 1.02 + hi * 0.9; o[3] = (lz ? 0.85 : 0.3) + n * 0.15;
  }),
  // sooty corrugated ceiling deck (2.4 m tile)
  deck: (sc, S) => genTex9(sc, S, 1.8, (u, v, x, y, o) => {
    const rib = 0.5 + 0.5 * Math.cos(u * 12 * Math.PI * 2), n = tfbm(u * 5, v * 5, 5, 4, 271), soot = tfbm(u * 2, v * 2, 2, 3, 272);
    const b = (0.17 + rib * 0.08 + n * 0.06) * (1 - Math.max(0, soot - 0.45) * 0.8);
    o[0] = b * 1.02; o[1] = b; o[2] = b * 0.95; o[3] = rib * 0.8 + n * 0.2;
  }),
};
