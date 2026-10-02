// ---------- Level 5 procedural textures: mahogany + gold deco wallpaper, carpet, marble, ballroom walls, boiler concrete ----------
const MAHOG = (g, k = 1) => [lerp(0.17, 0.4, g) * k, lerp(0.065, 0.16, g) * k, lerp(0.035, 0.075, g) * k];
const TEX5 = {
  // hotel wall, 2.85 m square tile (u across, v = height / 2.85): baseboard, raised mahogany panels, chair rail, gold deco paper, frieze, crown
  hwall: (sc, S) => genTex9(sc, S, 2.4, (u, v, x, y, o) => {
    const h = v * 2.85, n = tfbm(u * 8, v * 8, 8, 3, 501), f = h2i(x, y, 502);
    if (h < 0.16) { const g = 0.35 + 0.3 * n; const c = MAHOG(g, h > 0.145 ? 1.35 : 0.8); o[0] = c[0]; o[1] = c[1]; o[2] = c[2]; o[3] = h > 0.145 ? 0.9 : 0.55; return; }
    if (h < 0.9) {                                    // stiles/rails + raised panels (4 per tile)
      const pu = (u * 4) % 1, pw = 0.7125, lx = pu * pw, ly = h - 0.16, PH = 0.74, m = 0.075;
      const e = Math.min(lx - m, pw - m - lx, ly - m, PH - m - ly), inP = e > 0;
      const grain = tfbm(inP ? u * 3 : u * 40, inP ? v * 60 : v * 3, inP ? 3 : 40, 3, 503), streak = 0.5 + 0.5 * Math.sin((inP ? v * 300 : u * 160) + grain * 9);
      let g = 0.3 + 0.35 * grain + 0.12 * streak, ht = 0.5;
      if (inP) { const b = clamp(e / 0.05, 0, 1); ht = 0.55 + 0.4 * b; g *= 0.92 + 0.12 * b; if (e < 0.006) g *= 0.6; }
      else if (Math.min(lx, pw - lx, ly, PH - ly) < 0.004) { g *= 0.55; ht = 0.3; }
      const c = MAHOG(g); o[0] = c[0]; o[1] = c[1]; o[2] = c[2]; o[3] = ht; return;
    }
    if (h < 0.98) {                                   // chair rail with a gilt bead
      const t = (h - 0.9) / 0.08, prof = Math.sin(t * Math.PI), bead = Math.abs(h - 0.965) < 0.006;
      if (bead) { o[0] = 0.72; o[1] = 0.54; o[2] = 0.2; o[3] = 1; return; }
      const c = MAHOG(0.45 + 0.35 * prof + 0.1 * n, 1.1); o[0] = c[0]; o[1] = c[1]; o[2] = c[2]; o[3] = 0.4 + 0.6 * prof; return;
    }
    if (h < 2.62) {                                   // gold art-deco paper: almond "sunburst" motifs in a diamond lattice (6 across, rows 0.41 m, brick offset)
      const row = Math.floor((h - 0.98) / 0.41), cu = u * 6 + 0.5 * (row % 2), lx = (cu - Math.floor(cu) - 0.5) * 0.475, ly = h - (0.98 + (row + 0.5) * 0.41);
      const age = 0.9 + 0.1 * n + (f - 0.5) * 0.04;
      let r = 0.6, g = 0.45, b = 0.19, ht = 0.4;
      const dia = Math.abs(lx) / 0.2375 + Math.abs(ly) / 0.205;
      const alm = Math.abs(ly) - 0.072 * Math.max(0, 1 - (lx / 0.16) ** 2), ang = Math.atan2(ly, lx), rad = Math.hypot(lx / 1.1, ly);
      const line = (d, w) => Math.abs(d) < w;
      if (dia > 0.93) { r = 0.3; g = 0.19; b = 0.07; ht = 0.2; if (dia < 0.96) { r = 0.85; g = 0.68; b = 0.32; ht = 0.7; } }
      else if (alm < 0) { r = 0.5; g = 0.36; b = 0.14; ht = 0.3; if (Math.hypot(lx, ly) < 0.034) { r = 0.4; g = 0.27; b = 0.1; } }
      else if (line(alm, 0.006)) { r = 0.88; g = 0.72; b = 0.34; ht = 0.8; }
      else { const ray = Math.abs(Math.sin(ang * 8)) < 0.12 && rad < 0.19; const arc = line(rad - 0.14, 0.004) || line(rad - 0.17, 0.003); if (ray || arc) { r = 0.36; g = 0.24; b = 0.09; ht = 0.25; } }
      if (line(lx, 0.002) && Math.abs(ly) > 0.12 && dia < 0.93) { r = 0.8; g = 0.64; b = 0.3; }
      o[0] = r * age; o[1] = g * age; o[2] = b * age; o[3] = ht; return;
    }
    if (h < 2.74) {                                   // cream frieze with gilt dentils
      const du = (u * 48) % 1, dent = du < 0.55 && h > 2.645 && h < 2.715;
      const b = 0.72 + 0.08 * n; if (dent) { o[0] = 0.78; o[1] = 0.6; o[2] = 0.26; o[3] = 0.9; } else { o[0] = b; o[1] = b * 0.93; o[2] = b * 0.8; o[3] = 0.4; } return;
    }
    const t = (h - 2.74) / 0.11, c = MAHOG(0.4 + 0.3 * Math.sin(t * 9) * 0.5 + 0.2 * n, 1.05); o[0] = c[0]; o[1] = c[1]; o[2] = c[2]; o[3] = 0.5 + 0.4 * Math.sin(t * 9);
  }),
  // deep red carpet with gold octagon medallions, 2.4 m tile (4 x 4 motifs)
  carpet: (sc, S) => genTex9(sc, S, 1.4, (u, v, x, y, o) => {
    const mu = (u * 4) % 1 - 0.5, mv = (v * 4) % 1 - 0.5, oct = Math.max(Math.abs(mu), Math.abs(mv), (Math.abs(mu) + Math.abs(mv)) * 0.72);
    const pile = h2i(x, y, 511), n = tfbm(u * 10, v * 10, 10, 3, 512);
    let r = 0.36, g = 0.035, b = 0.04;
    if (Math.abs(oct - 0.34) < 0.018 || Math.abs(oct - 0.28) < 0.008) { r = 0.62; g = 0.43; b = 0.12; }
    else if (oct < 0.2) { const d = Math.abs(mu) + Math.abs(mv); if (d < 0.1) { r = 0.06; g = 0.03; b = 0.02; } else if (Math.abs(d - 0.15) < 0.015) { r = 0.6; g = 0.42; b = 0.12; } else { r = 0.26; g = 0.02; b = 0.03; } }
    else if (Math.abs(mu) > 0.47 || Math.abs(mv) > 0.47) { r = 0.08; g = 0.03; b = 0.025; }
    const k = 0.82 + 0.25 * pile + 0.15 * n; o[0] = r * k; o[1] = g * k; o[2] = b * k; o[3] = pile * 0.6 + n * 0.4;
  }),
  // polished black / cream marble checkerboard, 0.6 m tiles, 2.4 m tile
  check: (sc, S) => genTex9(sc, S, 1.0, (u, v, x, y, o) => {
    const ti = Math.floor(u * 4), tj = Math.floor(v * 4), tu = (u * 4) % 1, tv = (v * 4) % 1, grout = Math.min(tu, 1 - tu, tv, 1 - tv) < 0.006;
    const dark = (ti + tj) % 2 === 0, sd = h2i(ti, tj, 521) * 50;
    const vn = tfbm(u * 6 + sd, v * 6, 6, 5, 522), vein = 1 - smooth(0, 0.035, Math.abs(vn - 0.5)), vein2 = 1 - smooth(0, 0.012, Math.abs(tfbm(u * 12, v * 12 + sd, 12, 4, 523) - 0.5));
    let r, g, b;
    if (dark) { const k = 0.05 + 0.03 * vn; r = k; g = k; b = k * 1.08; r += vein * 0.45 + vein2 * 0.2; g += vein * 0.43 + vein2 * 0.19; b += vein * 0.4 + vein2 * 0.18; }
    else { const k = 0.8 + 0.08 * vn; r = k; g = k * 0.95; b = k * 0.85; const vv = vein * 0.35 + vein2 * 0.25; r -= vv; g -= vv; b -= vv * 0.9; }
    if (grout) { r = 0.3; g = 0.27; b = 0.22; }
    o[0] = r; o[1] = g; o[2] = b; o[3] = grout ? 0 : 0.6;
  }),
  // ballroom wall, 7 m square tile: marble skirting, lacquer dado, ivory panels between fluted gold pilasters, sunburst frieze
  deco: (sc, S) => genTex9(sc, S, 2.0, (u, v, x, y, o) => {
    const h = v * 7, pu = (u * 4) % 1, lx = pu * 1.75, n = tfbm(u * 12, v * 12, 12, 3, 531);
    const G = (k = 1) => { o[0] = 0.8 * k; o[1] = 0.6 * k; o[2] = 0.24 * k; };
    if (h < 0.25) { const k = 0.06 + 0.04 * n; o[0] = k; o[1] = k; o[2] = k * 1.1; o[3] = 0.5; if (h > 0.23) { G(); o[3] = 0.9; } return; }
    if (h < 1.1) { const k = 0.08 + 0.05 * n; o[0] = k * 1.3; o[1] = k * 0.75; o[2] = k * 0.55; o[3] = 0.5; if (h > 1.06) { G(1.05); o[3] = 1; } else if (Math.abs(h - 0.3) < 0.01) { G(0.9); o[3] = 0.8; } return; }
    const pil = Math.abs(lx - 0.875) < 0.16;
    if (h > 6.2) {                                    // frieze: gold band with fans
      const fu = (u * 16) % 1 - 0.5, fh = h - 6.2, ang = Math.atan2(fh, fu * 0.4375), ray = Math.abs(Math.sin(ang * 9)) < 0.2 && Math.hypot(fu * 0.4375, fh) < 0.62;
      G(ray ? 1.1 : 0.62); if (h > 6.9 || (h > 6.2 && h < 6.24)) G(1.15); o[3] = ray ? 0.8 : 0.4; return;
    }
    if (pil) {                                        // fluted pilaster with a stepped capital
      const fl = Math.abs(Math.sin((lx - 0.715) / 0.32 * Math.PI * 5)), cap = h > 5.75;
      G(cap ? (Math.floor((h - 5.75) / 0.09) % 2 ? 1.1 : 0.75) : 0.72 + 0.35 * fl); o[3] = cap ? 0.8 : 0.4 + 0.5 * fl; return;
    }
    const px = Math.min(Math.abs(lx - 1.035), Math.abs(lx - 0.715 + 1.75), Math.abs(lx - 0.715)), frame = Math.min(Math.abs(lx - (lx < 0.875 ? 0.08 : 1.67)), 99);
    const inset = Math.min(lx < 0.875 ? lx : 1.75 - lx, h - 1.1, 6.2 - h);
    const k = 0.83 + 0.07 * n; o[0] = k; o[1] = k * 0.95; o[2] = k * 0.82; o[3] = 0.5;
    const chev = h > 5.2 && h < 5.6 && Math.abs(((lx < 0.875 ? lx : lx - 1.75) * 3 + Math.abs(h - 5.4) * 2) % 0.3) < 0.03;
    if (Math.abs(inset - 0.18) < 0.012 || chev) { G(0.95); o[3] = 0.8; }
    else if (Math.abs(inset - 0.24) < 0.004) { G(0.8); o[3] = 0.6; }
    void px; void frame;
  }),
  // ballroom ceiling: gilt coffers, 3.5 m tile (2 x 2)
  bceil: (sc, S) => genTex9(sc, S, 2.5, (u, v, x, y, o) => {
    const cu = (u * 2) % 1, cv = (v * 2) % 1, e = Math.min(cu, 1 - cu, cv, 1 - cv), n = tfbm(u * 8, v * 8, 8, 3, 541);
    const k = 0.75 + 0.1 * n;
    if (e < 0.06) { o[0] = k; o[1] = k * 0.94; o[2] = k * 0.82; o[3] = 1; }
    else if (e < 0.075) { o[0] = 0.8; o[1] = 0.6; o[2] = 0.24; o[3] = 0.7; }
    else { const r = Math.hypot(cu - 0.5, cv - 0.5), ros = r < 0.08 ? 1 : 0; o[0] = ros ? 0.8 : k * 0.9; o[1] = ros ? 0.6 : k * 0.85; o[2] = ros ? 0.26 : k * 0.72; o[3] = 0.3 + (ros ? 0.4 : 0) + Math.max(0, 0.2 - e); }
  }),
  // hotel ceiling: cream plaster with a moulded square grid and rosettes, 1.8 m tile
  hceil: (sc, S) => genTex9(sc, S, 1.8, (u, v, x, y, o) => {
    const cu = (u * 2) % 1, cv = (v * 2) % 1, e = Math.min(cu, 1 - cu, cv, 1 - cv), n = tfbm(u * 10, v * 10, 10, 3, 551), r = Math.hypot(cu - 0.5, cv - 0.5);
    const k = 0.74 + 0.08 * n + (h2i(x, y, 552) - 0.5) * 0.03;
    o[0] = k; o[1] = k * 0.95; o[2] = k * 0.84; o[3] = e < 0.03 ? 0.2 : e < 0.05 ? 0.9 : 0.5;
    if (r < 0.09) { const p = 0.5 + 0.5 * Math.cos(Math.atan2(cv - 0.5, cu - 0.5) * 8); o[3] = 0.6 + 0.3 * p * (1 - r / 0.09); }
  }),
  // board-formed concrete with form-tie holes, 2.4 m tile
  bconc: (sc, S) => genTex9(sc, S, 2.2, (u, v, x, y, o) => {
    const bv = (v * 8) % 1, n = tfbm(u * 8, v * 8, 8, 4, 561), g = tfbm(u * 40, v * 5, 40, 2, 562), f = h2i(x, y, 563);
    const seam = bv < 0.02, tu = (u * 4) % 1 - 0.5, tv = (v * 4) % 1 - 0.5, tie = Math.hypot(tu, tv) < 0.03;
    const b = (0.46 + 0.14 * n + 0.06 * g + (f - 0.5) * 0.05) * (seam ? 0.7 : 1) * (tie ? 0.35 : 1);
    o[0] = b; o[1] = b * 0.96; o[2] = b * 0.9; o[3] = seam || tie ? 0.1 : 0.5 + n * 0.4;
  }),
  // boiler-room floor: trowelled concrete, cracks, 2.4 m tile
  bfloor: (sc, S) => genTex9(sc, S, 1.8, (u, v, x, y, o) => {
    const n = tfbm(u * 6, v * 6, 6, 5, 571), c = Math.abs(tfbm(u * 3, v * 3, 3, 4, 572) - 0.5) < 0.008, f = h2i(x, y, 573), jn = (u * 2) % 1 < 0.004 || (v * 2) % 1 < 0.004;
    const b = (0.42 + 0.16 * n + (f - 0.5) * 0.06) * (c ? 0.5 : 1) * (jn ? 0.6 : 1);
    o[0] = b; o[1] = b * 0.95; o[2] = b * 0.88; o[3] = c || jn ? 0 : 0.5 + n * 0.3;
  }),
  // red brick, 1.6 m tile
  brick: (sc, S) => genTex9(sc, S, 2.2, (u, v, x, y, o) => {
    const row = Math.floor(v * 22), bu = (u * 7 + (row % 2) * 0.5) % 1, bv = (v * 22) % 1, mort = bu < 0.06 || bv < 0.14;
    const tone = h2i(Math.floor(u * 7 + (row % 2) * 0.5), row, 581), n = tfbm(u * 16, v * 16, 16, 3, 582);
    if (mort) { const k = 0.52 + 0.1 * n; o[0] = k; o[1] = k * 0.97; o[2] = k * 0.9; o[3] = 0; return; }
    const k = 0.75 + 0.3 * tone + 0.2 * n; o[0] = 0.5 * k; o[1] = 0.22 * k; o[2] = 0.15 * k; o[3] = 0.7 + n * 0.3;
  }),
};
