// ---------- r8 · Level 37 procedural textures: pool tile, lane-line tile, caustic-wet concrete ----------
const TEX37 = {
  // glazed pool tile, 8 x 8 per 1.2 m (15 cm tiles): white-blue, hairline grout, faint wear
  ptile: (sc, S) => genTex9(sc, S, 0.9, (u, v, x, y, o) => {
    const tu = (u * 8) % 1, tv = (v * 8) % 1, ti = Math.floor(u * 8), tj = Math.floor(v * 8), seam = Math.min(tu, 1 - tu, tv, 1 - tv) < 0.045;
    const n = tfbm(u * 10, v * 10, 10, 3, 211), tone = (h2i(ti, tj, 212) - 0.5) * 0.035, gl = 0.5 - Math.hypot(tu - 0.35, tv - 0.3) * 0.5;
    const b = 0.9 + n * 0.05 + tone + Math.max(0, gl) * 0.04;
    const g = seam ? 0.62 : 1;
    o[0] = b * 0.93 * g; o[1] = b * 0.99 * g; o[2] = b * g; o[3] = seam ? 0 : 0.55 + n * 0.2;
  }),
  // dark-line tile for lane floors: same tile with a black lane stripe every 4 m (u runs along the lane)
  lane: (sc, S) => genTex9(sc, S, 0.9, (u, v, x, y, o) => {
    const tu = (u * 8) % 1, tv = (v * 8) % 1, seam = Math.min(tu, 1 - tu, tv, 1 - tv) < 0.045, n = tfbm(u * 10, v * 10, 10, 3, 221);
    const stripe = Math.abs(v - 0.5) < 0.05 ? 0.18 : 1, b = (0.88 + n * 0.05) * stripe;
    o[0] = b * 0.9 * (seam ? 0.62 : 1); o[1] = b * 0.97 * (seam ? 0.62 : 1); o[2] = b * (seam ? 0.62 : 1); o[3] = seam ? 0 : 0.5;
  }),
  // wet stained concrete for the pump room and the tunnels
  wetc: (sc, S) => genTex9(sc, S, 1.4, (u, v, x, y, o) => {
    const n = tfbm(u * 6, v * 6, 6, 4, 231), st = tfbm(u * 3 + 2, v * 3, 3, 3, 232), line = Math.min((u * 3) % 1, (v * 3) % 1) < 0.012;
    const b = (0.5 + n * 0.22) * (1 - Math.max(0, st - 0.55) * 0.6) * (line ? 0.7 : 1);
    o[0] = b * 0.92; o[1] = b; o[2] = b * 0.98; o[3] = 0.4 + n * 0.5 - (line ? 0.3 : 0);
  }),
};
