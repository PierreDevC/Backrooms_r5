// ---------- r10 · Level 7 procedural textures: seabed sand, weathered deck planks ----------
const TEX7 = {
  // rippled seabed sand with shell grit (2.4 m tile)
  sand: (sc, S) => genTex9(sc, S, 1.4, (u, v, x, y, o) => {
    const rip = 0.5 + 0.5 * Math.sin((u * 14 + tfbm(u * 4, v * 4, 4, 3, 281) * 3) * Math.PI * 2), n = tfbm(u * 9, v * 9, 9, 4, 282), g = h2i(x, y, 283), shell = g > 0.992 ? 0.35 : 0;
    const b = 0.5 + rip * 0.06 + n * 0.1 + shell; o[0] = b * 1.0; o[1] = b * 0.92; o[2] = b * 0.76; o[3] = rip * 0.5 + n * 0.4 + g * 0.1;
  }),
  // red and white lighthouse bands: 3 m each, repeating every 6 m (the v coordinate runs up the wall)
  band: (sc, S) => genTex9(sc, S, 1.2, (u, v, x, y, o) => {
    const red = (v % 1) < 0.5, n = tfbm(u * 6, v * 8, 6, 3, 301), st = Math.max(0, tfbm(u * 5, v * 2, 5, 3, 302) - 0.55) * 1.6, b = (0.74 + n * 0.14) * (1 - st * 0.35);
    o[0] = red ? b * 0.62 : b * 0.88; o[1] = red ? b * 0.14 : b * 0.88; o[2] = red ? b * 0.1 : b * 0.84; o[3] = n * 0.5;
  }),
  // weathered grey deck planks (1.2 m tile)
  plank: (sc, S) => genTex9(sc, S, 1.4, (u, v, x, y, o) => {
    const row = Math.floor(v * 8), w = (v * 8) % 1, seam = w < 0.05 || w > 0.97, n = tfbm(u * 12 + row * 3.1, v * 3, 12, 3, 291), tone = (h2i(row, 7, 292) - 0.5) * 0.12;
    const b = (0.36 + n * 0.14 + tone) * (seam ? 0.45 : 1); o[0] = b * 0.98; o[1] = b * 0.94; o[2] = b * 0.88; o[3] = (seam ? 0 : 0.5) + n * 0.4;
  }),
};
