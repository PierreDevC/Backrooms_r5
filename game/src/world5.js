// ---------- Level 5 · world assembly: materials, plaques & signs, the hotel's furnishings ----------
const W5 = {};
function resetW5() {
  Object.assign(W5, { eyeMat: null, keys: [], valves: [], exit: null, elev: null, svDoor: null, steam: [], nests: [], fires: [], clocks: [], gramo: null,
    used: new Map(), lampOn: null, lampFl: null, B: null, BOn: null, BFl: null, cones: null, pl: null, pg: null, signs: [], bell: null, callBtn: null, press: null });
  if (!W5.eyeP) W5.eyeP = new BABYLON.Vector4(0, 0, 0, 0); else W5.eyeP.set(0, 0, 0, 0);
}
// the hotel wallpaper material also carries the eyes (uniform eyeP: xyz = where you are staring, w = how awake they are)
function envMat5(name, defs, tex) {
  const defines = ['VCOL', 'EYES', ...defs], samplers = ['albedoTex', 'normalTex', 'lightTex'], uniforms = ['world', 'viewProjection', ...COMMON_UNIFORMS, 'eyeP'];
  const P = pbrOpts(name, defines, samplers, uniforms);
  const m = new BABYLON.ShaderMaterial(name, SCN, { vertex: 'env9', fragment: 'env' }, {
    attributes: ['position', 'normal', 'uv', 'tangent', 'color'], uniforms, samplers, defines });
  m.setTexture('albedoTex', tex.albedo); m.setTexture('normalTex', tex.normal); m.setTexture('lightTex', LV.lightTex); m.setVector4('eyeP', W5.eyeP); pbrBind(m, P);
  MATS.list.push(m); return m;
}
const COL5 = { mahog: [0.3, 0.12, 0.06], mahog2: [0.44, 0.2, 0.1], brass: [0.66, 0.5, 0.2], gold: [0.8, 0.62, 0.26], cream: [0.86, 0.8, 0.66], red: [0.5, 0.08, 0.07],
  green: [0.16, 0.26, 0.18], black: [0.05, 0.045, 0.04], linen: [0.88, 0.86, 0.8], steel: [0.36, 0.37, 0.38], rust: [0.42, 0.22, 0.13], iron: [0.2, 0.2, 0.21], valve: [0.66, 0.07, 0.04],
  velvet: [0.36, 0.05, 0.06], marble: [0.82, 0.8, 0.76], leaf: [0.14, 0.24, 0.1], pot: [0.5, 0.3, 0.2] };
const UPH5 = [[0.42, 0.08, 0.08], [0.16, 0.26, 0.2], [0.5, 0.36, 0.16], [0.22, 0.18, 0.3], [0.44, 0.3, 0.24]];

// ----- brass number plaques: one atlas texture, tiny quads -----
function mkPlaques5(T) {
  const S = 1024, cw = 128, ch = 64, cols = S / cw, dt = new BABYLON.DynamicTexture('plaques5', { width: S, height: S }, SCN, true), ctx = dt.getContext(), idx = new Map();
  ctx.fillStyle = '#6a5020'; ctx.fillRect(0, 0, S, S);
  const slot = txt => {
    if (idx.has(txt)) return idx.get(txt);
    const i = idx.size, x = (i % cols) * cw, y = ((i / cols) | 0) * ch; idx.set(txt, i);
    const g = ctx.createLinearGradient(x, y, x, y + ch); g.addColorStop(0, '#d8b35a'); g.addColorStop(0.5, '#a47c2c'); g.addColorStop(1, '#6e4f18');
    ctx.fillStyle = g; ctx.fillRect(x, y, cw, ch);
    ctx.strokeStyle = '#3a2808'; ctx.lineWidth = 3; ctx.strokeRect(x + 5, y + 5, cw - 10, ch - 10);
    ctx.strokeStyle = '#f0d58a'; ctx.lineWidth = 1; ctx.strokeRect(x + 9, y + 9, cw - 18, ch - 18);
    const big = txt.length <= 4; ctx.font = `bold ${big ? 36 : txt.length > 9 ? 13 : 16}px Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#f3dc9a'; ctx.fillText(txt, x + cw / 2 + 1, y + ch / 2 + 2); ctx.fillStyle = '#2a1a06'; ctx.fillText(txt, x + cw / 2, y + ch / 2 + 1);
    return i;
  };
  const uv = i => { const x = (i % cols) * cw, y = ((i / cols) | 0) * ch; return [x / S + 0.002, 1 - (y + ch) / S + 0.002, (x + cw) / S - 0.002, 1 - y / S - 0.002]; };
  const g = new Geo(true);
  W5.pl = { slot, uv, g, dt, add(x, y, z, ry, w, h, txt) { plaqueQuad(g, x, y, z, ry, w, h, uv(slot(txt))); } };
  W5.plMat = envMat9('plaque5', ['MAT_PLAQUE'], { albedo: dt, normal: T.check.normal });
}
function plaqueQuad(g, x, y, z, ry, w, h, uv) {   // faces local +z of a wall root, readable left-to-right
  const nx = Math.sin(ry), nz = Math.cos(ry), Rx = -Math.cos(ry), Rz = Math.sin(ry), hw = w / 2, hh = h / 2, b = g.p.length / 3;
  const P = [[x + Rx * hw, y - hh, z + Rz * hw], [x - Rx * hw, y - hh, z - Rz * hw], [x - Rx * hw, y + hh, z - Rz * hw], [x + Rx * hw, y + hh, z + Rz * hw]];
  const UV = [[uv[2], uv[1]], [uv[0], uv[1]], [uv[0], uv[3]], [uv[2], uv[3]]];
  for (let k = 0; k < 4; k++) { g.p.push(...P[k]); g.n.push(nx, 0, nz); g.t.push(-Rx, 0, -Rz, 1); g.uv.push(...UV[k]); g.c.push(1, 1, 1, 1); }
  g.i.push(b, b + 2, b + 1, b, b + 3, b + 2);
}
// world point on a wall root: local (lx, ly, lz) with +z into the room
function rootPt(r, lx, ly, lz) { const c = Math.cos(r.rotation.y), s = Math.sin(r.rotation.y); return [r.position.x + lx * c + lz * s, ly, r.position.z - lx * s + lz * c]; }
function plaqueOn(r, lx, ly, txt, w = 0.15, h = 0.075, lz = 0.03) { const p = rootPt(r, lx, ly, lz); W5.pl.add(p[0], p[1], p[2], r.rotation.y, w, h, txt); }

// ----- painted signs over the arches and the wrong doors -----
function sign5(text, root, pos, w, h, o = {}) {
  const px = 512, py = Math.round(512 * h / w), S = dynTexPlane('sign5', w, h, px, py, root, pos, o.emis ?? 0.28), c = S.ctx;
  c.fillStyle = o.bg || '#140a05'; c.fillRect(0, 0, px, py);
  c.strokeStyle = '#b8903c'; c.lineWidth = 6; c.strokeRect(8, 8, px - 16, py - 16); c.lineWidth = 2; c.strokeRect(18, 18, px - 36, py - 36);
  c.fillStyle = o.fg || '#e0b95c'; c.font = `${o.bold ? 'bold ' : ''}${Math.round(py * 0.42)}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillText(text.split('').join(String.fromCharCode(8202)), px / 2, py / 2 + 3);
  S.dt.update(); W5.signs.push(S); return S;
}

// ----- pipes straight into the prop batch (cheap octagonal tubes) -----
PropBatch.prototype.pipe = function (a, b, r, rgb, emis = 0, seg = 8) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz); if (L < 1e-4) return;
  const ax = [dx / L, dy / L, dz / L], t = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let u = [ax[1] * t[2] - ax[2] * t[1], ax[2] * t[0] - ax[0] * t[2], ax[0] * t[1] - ax[1] * t[0]]; const ul = Math.hypot(...u); u = u.map(v => v / ul);
  const v = [ax[1] * u[2] - ax[2] * u[1], ax[2] * u[0] - ax[0] * u[2], ax[0] * u[1] - ax[1] * u[0]];
  const mx = (a[0] + b[0]) / 2, mz = (a[2] + b[2]) / 2, key = Math.floor(mz / 28.8) * 64 + Math.floor(mx / 28.8);
  const g = (this.geos || (this.geos = new Map())).get(key) || (this.geos.set(key, new Geo(true)), this.geos.get(key));
  const col = [rgb[0], rgb[1], rgb[2], emis];
  for (let i = 0; i < seg; i++) {
    const a0 = i / seg * TAU, a1 = (i + 1) / seg * TAU, n0 = [0, 1, 2].map(k => u[k] * Math.cos(a0) + v[k] * Math.sin(a0)), n1 = [0, 1, 2].map(k => u[k] * Math.cos(a1) + v[k] * Math.sin(a1));
    const P = [[a, n0], [a, n1], [b, n1], [b, n0]], base = g.p.length / 3;
    for (const [o, n] of P) { g.p.push(o[0] + n[0] * r, o[1] + n[1] * r, o[2] + n[2] * r); g.n.push(n[0], n[1], n[2]); g.t.push(ax[0], ax[1], ax[2], 1); g.uv.push(0, 0); g.c.push(...col); }
    g.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
  }
};

// ----- wall slots -----
function wallSlots5(cells) {   // plain wall sides (door: a dummy door sits in the middle of it)
  const out = [];
  for (const c of cells) {
    const x = c % N, y = (c / N) | 0;
    for (let d = 0; d < 4; d++) { if (edgeVal(x, y, d) !== 1) continue; const e = LV.ek.get(eKey(x, y, d)); if (e && e.kind !== 'deco') continue; if (e && e.bev) continue; out.push({ x, y, d, c, door: !!e }); }
  }
  return out;
}
function slotUse5(s, along, w) { const k = s.c * 4 + s.d, u = W5.used.get(k) || []; if (u.some(q => Math.abs(q[0] - along) < (q[1] + w) / 2 + 0.05)) return false; u.push([along, w]); W5.used.set(k, u); return true; }
function atWall5(s, along, off = 0.005) { const [x, z, ry] = wallPt(s.x, s.y, s.d, off, along); return propRoot(x, z, ry); }

// ----- furniture (local +z into the room, back against the wall at z = 0) -----
const FURN5 = {
  painting(B, r, o = {}) {
    const w = o.w || rnd(0.55, 0.9), h = o.h || w * rnd(0.7, 1.25), y = o.y || 1.72, s = o.seed ?? RNG();
    B.add(r, 'Box', { width: w + 0.1, height: h + 0.1, depth: 0.045 }, COL5.gold.map(v => v * 0.8), 0, [0, y, 0.025]);
    const bands = [[0.12, 0.1, 0.08], [0.2, 0.16, 0.1], [0.08, 0.1, 0.12], [0.26, 0.14, 0.1]];
    B.add(r, 'Box', { width: w, height: h * 0.55, depth: 0.012 }, bands[(s * 4) | 0], 0, [0, y + h * 0.225, 0.05]);
    B.add(r, 'Box', { width: w, height: h * 0.45, depth: 0.012 }, bands[((s * 13) | 0) % 4].map(v => v * 0.7), 0, [0, y - h * 0.275, 0.05]);
    if (s < 0.55) { B.add(r, 'Box', { width: w * 0.22, height: h * 0.5, depth: 0.014 }, [0.05, 0.04, 0.035], 0, [(s - 0.27) * w, y - h * 0.08, 0.052]); B.add(r, 'Box', { width: w * 0.12, height: w * 0.14, depth: 0.016 }, [0.55, 0.44, 0.36], 0, [(s - 0.27) * w, y + h * 0.2, 0.053]); }
    return 0;
  },
  console(B, r, o = {}) {
    const W = 1.0, D = 0.42, H = 0.8, c = COL5.mahog2;
    B.add(r, 'Box', { width: W, height: 0.05, depth: D }, c, 0, [0, H, D / 2]); B.add(r, 'Box', { width: W - 0.08, height: 0.14, depth: D - 0.06 }, COL5.mahog, 0, [0, H - 0.1, D / 2]);
    for (const sx of [-1, 1]) for (const sz of [0.05, D - 0.05]) B.add(r, 'Box', { width: 0.045, height: H - 0.02, depth: 0.045 }, COL5.mahog, 0, [sx * (W / 2 - 0.05), (H - 0.02) / 2, sz]);
    B.add(r, 'Box', { width: 0.06, height: 0.02, depth: 0.02 }, COL5.brass, 0, [0, H - 0.1, D - 0.02]);
    if ((o.seed ?? RNG()) < 0.5) {   // vase of dead flowers
      B.add(r, 'Cylinder', { diameterTop: 0.1, diameterBottom: 0.16, height: 0.3, tessellation: 10 }, [0.18, 0.26, 0.3], 0, [0.2, H + 0.17, D / 2]);
      for (let i = 0; i < 5; i++) B.add(r, 'Box', { width: 0.012, height: 0.3, depth: 0.012 }, [0.3, 0.26, 0.14], 0, [0.2 + (i - 2) * 0.02, H + 0.44, D / 2], [(i - 2) * 0.12, 0, (i - 2) * 0.18]);
    } else {   // table lamp (unlit)
      B.add(r, 'Cylinder', { diameter: 0.12, height: 0.04, tessellation: 10 }, COL5.brass, 0, [-0.25, H + 0.045, D / 2]); B.add(r, 'Box', { width: 0.025, height: 0.34, depth: 0.025 }, COL5.brass, 0, [-0.25, H + 0.2, D / 2]);
      B.add(r, 'Cylinder', { diameterTop: 0.16, diameterBottom: 0.3, height: 0.22, tessellation: 10 }, [0.72, 0.62, 0.46], 0, [-0.25, H + 0.44, D / 2]);
    }
    return D;
  },
  armchair(B, r, o = {}) {
    const c = o.col || pick(UPH5), W = 0.78, D = 0.78, g = c === UPH5[1];   // r5: scanned armchairs - green as scanned, the grey one dyed to the upholstery
    if (B.mdl(g ? 'gchair' : 'armchair', r, [0, 0, 0.4], null, g ? 1.05 : 0.95, g ? null : c.map(v => Math.min(1, v * 1.9)))) return D + 0.05;
    B.add(r, 'Box', { width: W, height: 0.24, depth: D }, c, 0, [0, 0.3, D / 2 + 0.03]); B.add(r, 'Box', { width: W, height: 0.62, depth: 0.16 }, c, 0, [0, 0.68, 0.1], [-0.1, 0, 0]);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.12, height: 0.3, depth: D - 0.08 }, c.map(v => v * 0.85), 0, [s * (W / 2 - 0.06), 0.55, D / 2 + 0.06]);
    for (const sx of [-1, 1]) for (const sz of [0.1, D - 0.02]) B.add(r, 'Box', { width: 0.05, height: 0.18, depth: 0.05 }, COL5.mahog, 0, [sx * (W / 2 - 0.06), 0.09, sz]);
    return D + 0.05;
  },
  palm(B, r) {
    B.add(r, 'Cylinder', { diameterTop: 0.46, diameterBottom: 0.32, height: 0.5, tessellation: 12 }, COL5.pot, 0, [0, 0.25, 0.3]);
    B.add(r, 'Cylinder', { diameterTop: 0.03, diameterBottom: 0.06, height: 1.1, tessellation: 6 }, [0.3, 0.22, 0.12], 0, [0, 1.0, 0.3]);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; B.add(r, 'Box', { width: 0.1, height: 0.012, depth: 0.7 }, COL5.leaf.map(v => v * rnd(0.7, 1.2)), 0, [Math.sin(a) * 0.3, 1.45 + rnd(-0.1, 0.12), 0.3 + Math.cos(a) * 0.3], [0.5 + rnd(-0.2, 0.3), a, 0]); }
    return 0.55;
  },
  clock(B, r) {
    B.add(r, 'Box', { width: 0.52, height: 2.0, depth: 0.34 }, COL5.mahog, 0, [0, 1.0, 0.17]); B.add(r, 'Box', { width: 0.6, height: 0.12, depth: 0.4 }, COL5.mahog2, 0, [0, 2.04, 0.2]);
    B.add(r, 'Cylinder', { diameter: 0.34, height: 0.02, tessellation: 18 }, COL5.cream, 0, [0, 1.62, 0.345], [Math.PI / 2, 0, 0]);
    B.add(r, 'Box', { width: 0.3, height: 0.8, depth: 0.01 }, [0.05, 0.04, 0.03], 0, [0, 0.9, 0.345]);
    B.add(r, 'Cylinder', { diameter: 0.14, height: 0.02, tessellation: 12 }, COL5.brass, 0, [0, 0.7, 0.35], [Math.PI / 2, 0, 0]);
    for (const a of [0.4, 2.2]) B.add(r, 'Box', { width: 0.012, height: 0.12, depth: 0.01 }, COL5.black, 0, [Math.sin(a) * 0.05, 1.62 + Math.cos(a) * 0.05, 0.36], [0, 0, -a]);
    W5.clocks.push(rootPt(r, 0, 1.4, 0.3));
    return 0.36;
  },
  cart(B, r) {
    B.add(r, 'Box', { width: 0.9, height: 0.03, depth: 0.5 }, COL5.linen, 0, [0, 0.84, 0.45]); B.add(r, 'Box', { width: 0.92, height: 0.4, depth: 0.52 }, COL5.linen.map(v => v * 0.9), 0, [0, 0.64, 0.45]);
    for (const sx of [-1, 1]) for (const sz of [0.22, 0.68]) B.add(r, 'Box', { width: 0.03, height: 0.8, depth: 0.03 }, COL5.brass, 0, [sx * 0.42, 0.42, sz]);
    B.add(r, 'Sphere', { diameter: 0.3, segments: 8, slice: 0.5 }, [0.7, 0.7, 0.68], 0, [0.15, 0.86, 0.45]);
    B.add(r, 'Box', { width: 0.18, height: 0.02, depth: 0.14 }, [0.92, 0.9, 0.86], 0, [-0.25, 0.87, 0.4]);
    return 0.72;
  },
  bench(B, r, o = {}) {
    if (o.sofa && B.mdl('sofa', r, [0, 0, 0.36], null, 0.85)) return 0.72;   // r5: the lounge gets the scanned chesterfield
    B.add(r, 'Box', { width: 1.5, height: 0.14, depth: 0.5 }, COL5.velvet, 0, [0, 0.45, 0.3]); B.add(r, 'Box', { width: 1.5, height: 0.5, depth: 0.1 }, COL5.velvet, 0, [0, 0.8, 0.08]);
    for (const sx of [-0.7, 0.7]) B.add(r, 'Box', { width: 0.06, height: 0.4, depth: 0.45 }, COL5.mahog, 0, [sx, 0.2, 0.3]);
    return 0.56;
  },
  radiator(B, r) { for (let i = 0; i < 9; i++) B.add(r, 'Box', { width: 0.05, height: 0.62, depth: 0.12 }, [0.72, 0.7, 0.62], 0, [-0.3 + i * 0.075, 0.42, 0.1]); B.add(r, 'Box', { width: 0.7, height: 0.04, depth: 0.1 }, [0.7, 0.68, 0.6], 0, [0, 0.16, 0.1]); return 0.18; },
  wardrobe(B, r) {
    B.add(r, 'Box', { width: 1.0, height: 2.0, depth: 0.58 }, COL5.mahog, 0, [0, 1.0, 0.29]); B.add(r, 'Box', { width: 1.06, height: 0.08, depth: 0.62 }, COL5.mahog2, 0, [0, 2.04, 0.31]);
    B.add(r, 'Box', { width: 0.01, height: 1.8, depth: 0.01 }, COL5.black, 0, [0, 1.0, 0.585]);
    for (const s of [-1, 1]) { B.add(r, 'Box', { width: 0.4, height: 0.7, depth: 0.012 }, COL5.mahog2, 0, [s * 0.24, 1.45, 0.585]); B.add(r, 'Box', { width: 0.4, height: 0.7, depth: 0.012 }, COL5.mahog2, 0, [s * 0.24, 0.6, 0.585]); B.add(r, 'Box', { width: 0.02, height: 0.1, depth: 0.03 }, COL5.brass, 0, [s * 0.05, 1.05, 0.6]); }
    return 0.6;
  },
  desk(B, r) {
    B.add(r, 'Box', { width: 1.1, height: 0.05, depth: 0.55 }, COL5.mahog2, 0, [0, 0.76, 0.28]); B.add(r, 'Box', { width: 0.4, height: 0.72, depth: 0.5 }, COL5.mahog, 0, [0.33, 0.37, 0.28]);
    for (const sz of [0.05, 0.5]) B.add(r, 'Box', { width: 0.045, height: 0.74, depth: 0.045 }, COL5.mahog, 0, [-0.5, 0.37, sz]);
    B.add(r, 'Box', { width: 0.3, height: 0.012, depth: 0.22 }, [0.84, 0.8, 0.7], 0, [-0.12, 0.79, 0.3], [0, 0.2, 0]);
    B.add(r, 'Box', { width: 0.5, height: 0.004, depth: 0.004 }, [0.1, 0.1, 0.1], 0, [-0.12, 0.8, 0.3]);
    B.add(r, 'Box', { width: 0.7, height: 0.9, depth: 0.03 }, COL5.gold.map(v => v * 0.8), 0, [0, 1.5, 0.02]); B.add(r, 'Box', { width: 0.6, height: 0.8, depth: 0.01 }, [0.24, 0.26, 0.28], 0.06, [0, 1.5, 0.04]);
    const ch = pick(UPH5);   // chair pushed in
    B.add(r, 'Box', { width: 0.44, height: 0.08, depth: 0.42 }, ch, 0, [-0.1, 0.46, 0.78]); B.add(r, 'Box', { width: 0.44, height: 0.5, depth: 0.05 }, COL5.mahog, 0, [-0.1, 0.74, 0.98], [0.08, 0, 0]);
    for (const sx of [-0.28, 0.08]) for (const sz of [0.6, 0.96]) B.add(r, 'Box', { width: 0.035, height: 0.44, depth: 0.035 }, COL5.mahog, 0, [sx, 0.22, sz]);
    return 1.0;
  },
  bed(B, r, o = {}) {
    const W = 1.5, L = 2.05, cov = o.col || pick([[0.46, 0.1, 0.1], [0.18, 0.26, 0.22], [0.5, 0.42, 0.3], [0.26, 0.22, 0.36]]);
    B.add(r, 'Box', { width: W + 0.1, height: 1.2, depth: 0.08 }, COL5.mahog, 0, [0, 0.6, 0.04]); B.add(r, 'Box', { width: W + 0.16, height: 0.08, depth: 0.12 }, COL5.mahog2, 0, [0, 1.22, 0.05]);
    B.add(r, 'Box', { width: W, height: 0.3, depth: L }, COL5.mahog, 0, [0, 0.25, L / 2 + 0.06]);
    B.add(r, 'Box', { width: W - 0.04, height: 0.2, depth: L - 0.06 }, COL5.linen, 0, [0, 0.5, L / 2 + 0.06]);
    B.add(r, 'Box', { width: W + 0.04, height: 0.08, depth: L * 0.66 }, cov, 0, [0, 0.62, L * 0.62 + 0.06], [0.02, 0, 0]);
    for (const s of [-1, 1]) { B.add(r, 'Box', { width: W + 0.06, height: 0.35, depth: 0.02 }, cov.map(v => v * 0.85), 0, [0, 0.48, 0.06 + L * 0.29 + L * 0.33 * (s + 1)], null); }
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.6, height: 0.13, depth: 0.36 }, [0.92, 0.9, 0.84], 0, [s * 0.36, 0.67, 0.3], [-0.25, 0, 0]);
    B.add(r, 'Box', { width: W + 0.1, height: 0.5, depth: 0.06 }, COL5.mahog, 0, [0, 0.35, L + 0.1]);
    return L + 0.14;
  },
  nightstand(B, r, o = {}) {
    if (!B.mdl('nstand', r, [0, 0, 0.2], null, 0.8)) {   // r5: scanned nightstand (top at 0.56 m like the boxes it replaces)
      B.add(r, 'Box', { width: 0.46, height: 0.56, depth: 0.4 }, COL5.mahog2, 0, [0, 0.28, 0.21]); B.add(r, 'Box', { width: 0.36, height: 0.16, depth: 0.01 }, COL5.mahog, 0, [0, 0.4, 0.415]);
      B.add(r, 'Box', { width: 0.05, height: 0.02, depth: 0.02 }, COL5.brass, 0, [0, 0.4, 0.425]);
    }
    B.add(r, 'Cylinder', { diameter: 0.1, height: 0.2, tessellation: 8 }, COL5.brass, 0, [0.05, 0.66, 0.2]);
    (o.lit ? W5.BOn : B).add(r, 'Cylinder', { diameterTop: 0.16, diameterBottom: 0.26, height: 0.18, tessellation: 10 }, o.lit ? [1, 0.78, 0.5] : [0.72, 0.62, 0.46], o.lit ? 0.35 : 0, [0.05, 0.85, 0.2]);
    return 0.42;
  },
  lockers(B, r) {
    for (let i = 0; i < 3; i++) { B.add(r, 'Box', { width: 0.38, height: 1.85, depth: 0.45 }, [0.34, 0.4, 0.38], 0, [(i - 1) * 0.4, 0.93, 0.23]); B.add(r, 'Box', { width: 0.26, height: 0.1, depth: 0.01 }, [0.1, 0.12, 0.12], 0, [(i - 1) * 0.4, 1.6, 0.46]); B.add(r, 'Box', { width: 0.03, height: 0.1, depth: 0.03 }, [0.7, 0.7, 0.68], 0, [(i - 1) * 0.4 + 0.12, 1.05, 0.46]); }
    return 0.47;
  },
  shelf(B, r) {
    for (const y of [0.1, 0.7, 1.3, 1.9]) B.add(r, 'Box', { width: 1.4, height: 0.03, depth: 0.45 }, [0.5, 0.5, 0.48], 0, [0, y, 0.23]);
    for (const sx of [-0.7, 0.7]) B.add(r, 'Box', { width: 0.03, height: 2.0, depth: 0.45 }, [0.45, 0.45, 0.44], 0, [sx, 1.0, 0.23]);
    for (const y of [0.13, 0.73, 1.33]) for (let i = 0; i < 4; i++) if (RNG() < 0.8) B.add(r, 'Box', { width: 0.3, height: rnd(0.12, 0.32), depth: 0.36 }, [0.9, 0.88, 0.84].map(v => v * rnd(0.85, 1)), 0, [-0.5 + i * 0.33, y + 0.1, 0.22]);
    return 0.47;
  },
};
function placeF5(B, s, along, kind, o = {}) {
  const r = atWall5(s, along), d = FURN5[kind](B, r, o), hw = o.hw ?? 0.5; if (d > 0) solidLocal(r, -hw, 0, hw, d); return r;
}

// ----- deco (fake) doors: leaf in a casing, brass plaque beside it; ballroom doors are tall double doors -----
function decoDoor5(B, e) {
  const [fx, fy] = e.from, d = (fx === e.x && fy === e.y) ? e.d : (e.d + 2) % 4, r = atWall5({ x: fx, y: fy, d }, 0, 0);
  if (e.bev) {
    const W = 1.7, H = 2.75, G = COL5.gold, K = [0.07, 0.05, 0.04];
    for (const s of [-1, 1]) {
      B.add(r, 'Box', { width: 0.14, height: H + 0.14, depth: 0.08 }, G, 0, [s * (W / 2 + 0.07), (H + 0.14) / 2, 0.04]);
      B.add(r, 'Box', { width: W / 2 - 0.02, height: H - 0.02, depth: 0.05 }, K, 0, [s * W / 4, H / 2, 0.03]);
      for (let k = 0; k < 3; k++) B.add(r, 'Box', { width: W / 2 - 0.2, height: 0.025, depth: 0.012 }, G, 0, [s * W / 4, 0.7 + k * 0.08, 0.06], [0, 0, s * 0.4]);
      B.add(r, 'Cylinder', { diameter: 0.3, height: 0.02, tessellation: 14 }, [0.08, 0.1, 0.12], 0.08, [s * W / 4, 1.85, 0.06], [Math.PI / 2, 0, 0]);
      B.add(r, 'Box', { width: 0.03, height: 0.4, depth: 0.04 }, G, 0, [s * 0.07, 1.2, 0.07]);
    }
    B.add(r, 'Box', { width: W + 0.28, height: 0.14, depth: 0.08 }, G, 0, [0, H + 0.07, 0.04]);
    for (let i = 0; i < 9; i++) { const a = (i - 4) / 4 * 1.1; B.add(r, 'Box', { width: 0.035, height: 0.55, depth: 0.03 }, G, 0, [Math.sin(a) * 0.28, H + 0.14 + Math.cos(a) * 0.28, 0.04], [0, 0, -a]); }
    plaqueOn(r, 1.2, 1.5, 'PRIVATE', 0.18, 0.08);
    return r;
  }
  const W = DOORW, H = DOORH, c = COL5.mahog2, cw = 0.09;
  B.add(r, 'Box', { width: W - 0.04, height: H - 0.02, depth: 0.045 }, c, 0, [0, H / 2, 0.02]);
  for (const [px, py, ph] of [[-0.25, 0.52, 0.66], [0.25, 0.52, 0.66], [-0.25, 1.48, 0.98], [0.25, 1.48, 0.98]]) B.add(r, 'Box', { width: 0.4, height: ph, depth: 0.012 }, c.map(v => v * 0.78), 0, [px, py, 0.048]);
  for (const s of [-1, 1]) B.add(r, 'Box', { width: cw, height: H + cw, depth: 0.03 }, TRIM5.mahog, 0, [s * (W / 2 + cw / 2 - 0.01), (H + cw) / 2, 0.015]);
  B.add(r, 'Box', { width: W + 2 * cw, height: cw, depth: 0.03 }, TRIM5.mahog, 0, [0, H + cw / 2, 0.015]);
  B.add(r, 'Box', { width: 0.06, height: 0.06, depth: 0.06 }, COL5.brass, 0, [W / 2 - 0.12, 0.98, 0.07]);
  B.add(r, 'Box', { width: 0.05, height: 0.16, depth: 0.012 }, COL5.brass, 0, [W / 2 - 0.12, 0.98, 0.048]);
  B.add(r, 'Box', { width: W - 0.1, height: 0.02, depth: 0.03 }, [0.04, 0.03, 0.02], 0, [0, 0.012, 0.05]);
  if (e.num) plaqueOn(r, W / 2 + 0.3, 1.5, String(e.num));
  if (e.vest) plaqueOn(r, W / 2 + 0.3, 1.5, 'EXIT', 0.15, 0.075);
  return r;
}

// ----- lights: wall sconces, pendants, caged bulbs, chandeliers -----
function sconce5(s) {
  const r = propRoot(s.x, s.z, s.ry), on = s.state === 1 ? W5.BOn : s.state === 2 ? W5.BFl : W5.B, y = s.y, lit = s.state > 0;
  if (s.big) {
    W5.B.add(r, 'Box', { width: 0.34, height: 0.7, depth: 0.04 }, COL5.gold, 0, [0, y, 0.02]);
    on.add(r, 'Box', { width: 0.26, height: 0.5, depth: 0.1 }, lit ? [1, 0.84, 0.6] : [0.4, 0.36, 0.3], lit ? 0.45 : 0, [0, y, 0.08]);
    for (let i = 0; i < 5; i++) W5.B.add(r, 'Box', { width: 0.02, height: 0.52, depth: 0.02 }, COL5.gold, 0, [(i - 2) * 0.06, y, 0.135]);
    W5.B.add(r, 'Box', { width: 0.3, height: 0.05, depth: 0.14 }, COL5.gold, 0, [0, y + 0.28, 0.08]); W5.B.add(r, 'Box', { width: 0.3, height: 0.05, depth: 0.14 }, COL5.gold, 0, [0, y - 0.28, 0.08]);
    return;
  }
  W5.B.add(r, 'Box', { width: 0.12, height: 0.24, depth: 0.025 }, COL5.brass, 0, [0, y - 0.05, 0.012]);
  W5.B.add(r, 'Box', { width: 0.025, height: 0.025, depth: 0.16 }, COL5.brass, 0, [0, y - 0.1, 0.09]);
  W5.B.add(r, 'Box', { width: 0.02, height: 0.1, depth: 0.02 }, COL5.brass, 0, [0, y - 0.05, 0.17]);
  on.add(r, 'Cylinder', { diameterTop: 0.1, diameterBottom: 0.19, height: 0.16, tessellation: 10 }, lit ? [1, 0.8, 0.55] : [0.42, 0.36, 0.28], lit ? 0.4 : 0, [0, y + 0.05, 0.17]);
}
function bulb5(b) {
  const r = propRoot(b.x, b.z, 0), lit = b.state > 0, on = b.state === 1 ? W5.BOn : b.state === 2 ? W5.BFl : W5.B, y = b.y;
  if (b.kind === 'pend') {
    W5.B.add(r, 'Cylinder', { diameter: 0.012, height: 0.5, tessellation: 4 }, COL5.brass, 0, [0, y - 0.25, 0]);
    on.add(r, 'Sphere', { diameter: 0.3, segments: 8 }, lit ? [1, 0.86, 0.66] : [0.5, 0.46, 0.4], lit ? 0.35 : 0, [0, y - 0.62, 0], null, [1, 0.8, 1]);
    W5.B.add(r, 'Cylinder', { diameter: 0.12, height: 0.05, tessellation: 8 }, COL5.brass, 0, [0, y - 0.48, 0]);
  } else if (b.kind === 'bare') {
    W5.B.add(r, 'Cylinder', { diameter: 0.01, height: 0.4, tessellation: 4 }, COL5.black, 0, [0, y - 0.2, 0]);
    on.add(r, 'Sphere', { diameter: 0.09, segments: 6 }, lit ? [1, 0.9, 0.7] : [0.4, 0.4, 0.38], lit ? 0.8 : 0, [0, y - 0.45, 0]);
  } else if (b.kind === 'cage') {
    W5.B.add(r, 'Box', { width: 0.16, height: 0.04, depth: 0.16 }, COL5.iron, 0, [0, y - 0.03, 0]);
    on.add(r, 'Sphere', { diameter: 0.1, segments: 6 }, lit ? [1, 0.84, 0.6] : [0.35, 0.34, 0.32], lit ? 0.8 : 0, [0, y - 0.13, 0]);
    for (let i = 0; i < 4; i++) W5.B.add(r, 'Box', { width: 0.01, height: 0.14, depth: 0.01 }, COL5.iron, 0, [Math.sin(i * 1.57) * 0.07, y - 0.12, Math.cos(i * 1.57) * 0.07]);
  } else if (b.kind === 'chand') chandelier5(r, 0.62, b.y, false);
}
function chandelier5(r, R, top, big) {
  const B = W5.B, on = W5.BOn, G = COL5.gold, drop = big ? 1.4 : 0.7, y0 = top - drop;
  B.add(r, 'Cylinder', { diameter: big ? 0.06 : 0.03, height: drop, tessellation: 6 }, G, 0, [0, top - drop / 2, 0]);
  B.add(r, 'Cylinder', { diameterTop: big ? 0.5 : 0.24, diameterBottom: 0.08, height: big ? 0.5 : 0.25, tessellation: 12 }, G, 0, [0, y0 - (big ? 0.25 : 0.12), 0]);
  const tiers = big ? [[R, 0], [R * 0.72, -0.34], [R * 0.44, -0.62], [R * 0.2, -0.86]] : [[R, 0], [R * 0.55, -0.24]];
  for (const [rr, dy] of tiers) {
    const n = Math.max(8, Math.round(rr * (big ? 16 : 14))), y = y0 + dy;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, x = Math.sin(a) * rr, z = Math.cos(a) * rr;
      B.add(r, 'Box', { width: rr * TAU / n + 0.01, height: 0.035, depth: 0.03 }, G, 0, [x, y, z], [0, a + Math.PI / 2, 0]);
      on.add(r, 'Box', { width: 0.035, height: big ? 0.2 : 0.12, depth: 0.035 }, [0.95, 0.92, 0.84], 0.22, [x * 1.02, y - (big ? 0.14 : 0.09), z * 1.02], [0, a, 0.2]);
      if (i % (big ? 2 : 3) === 0) { on.add(r, 'Box', { width: 0.03, height: 0.1, depth: 0.03 }, [1, 0.86, 0.6], 0.9, [x, y + 0.08, z]); B.add(r, 'Box', { width: 0.022, height: 0.022, depth: rr * 0.9 }, G, 0, [x * 0.5, y + 0.03, z * 0.5], [0, a, 0]); }
    }
    for (let i = 0; i < n; i += 2) { const a = (i + 0.5) / n * TAU; on.add(r, 'Box', { width: 0.025, height: big ? 0.34 : 0.18, depth: 0.025 }, [0.92, 0.9, 0.84], 0.18, [Math.sin(a) * rr * 0.9, y - (big ? 0.3 : 0.16), Math.cos(a) * rr * 0.9]); }
  }
}

// ----- extra furnishings for the hotel's set pieces -----
const sideOf5 = e => { const [fx, fy] = e.from; return { x: fx, y: fy, d: (fx === e.x && fy === e.y) ? e.d : (e.d + 2) % 4 }; };
function roundTable5(B, x, z, big) {
  const r = propRoot(x, z, rnd(0, TAU)), R = big ? 0.8 : 0.6, W2 = COL5.mahog, CL = [0.9, 0.88, 0.82];
  B.add(r, 'Cylinder', { diameter: R * 2, height: 0.03, tessellation: 20 }, CL, 0, [0, 0.76, 0]);
  B.add(r, 'Cylinder', { diameterTop: R * 2 + 0.02, diameterBottom: R * 2 + 0.12, height: 0.5, tessellation: 20, cap: BABYLON.Mesh.NO_CAP }, CL.map(v => v * 0.92), 0, [0, 0.5, 0]);
  B.add(r, 'Cylinder', { diameter: 0.1, height: 0.74, tessellation: 8 }, W2, 0, [0, 0.37, 0]);
  B.add(r, 'Cylinder', { diameter: 0.07, height: 0.12, tessellation: 8 }, COL5.brass, 0, [0, 0.83, 0]);
  W5.BOn.add(r, 'Sphere', { diameter: 0.1, segments: 6 }, [1, 0.8, 0.55], 0.6, [0, 0.93, 0]);
  if (RNG() < 0.6) for (let i = 0; i < 2; i++) B.add(r, 'Cylinder', { diameterTop: 0.07, diameterBottom: 0.03, height: 0.1, tessellation: 8 }, [0.8, 0.8, 0.82], 0, [rnd(-0.4, 0.4), 0.83, rnd(-0.4, 0.4)]);
  const n = big ? 5 : 4;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + rnd(-0.2, 0.2), cx = Math.sin(a) * (R + 0.32), cz = Math.cos(a) * (R + 0.32), q = propRoot(0, 0, 0); q.parent = r; q.position.set(cx, 0, cz); q.rotation.y = a + Math.PI + rnd(-0.3, 0.3); q.computeWorldMatrix(true);
    const tipped = RNG() < 0.08, up = UPH5[0];
    if (tipped) { B.add(q, 'Box', { width: 0.44, height: 0.44, depth: 0.05 }, up, 0, [0, 0.12, 0], [Math.PI / 2 - 0.1, 0, 0]); continue; }
    B.add(q, 'Box', { width: 0.44, height: 0.08, depth: 0.44 }, up, 0, [0, 0.46, 0]); B.add(q, 'Box', { width: 0.44, height: 0.62, depth: 0.05 }, COL5.gold.map(v => v * 0.7), 0, [0, 0.82, -0.2]);
    for (const [lx, lz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) B.add(q, 'Box', { width: 0.03, height: 0.44, depth: 0.03 }, COL5.gold.map(v => v * 0.7), 0, [lx, 0.21, lz]);
  }
  addSolid(x - R - 0.25, z - R - 0.25, x + R + 0.25, z + R + 0.25, 'prop');
}
function gramophone5(B, r) {   // on a plinth, horn toward local +z
  B.add(r, 'Box', { width: 0.7, height: 0.8, depth: 0.6 }, COL5.mahog2, 0, [0, 0.4, 0]); B.add(r, 'Box', { width: 0.74, height: 0.04, depth: 0.64 }, COL5.gold, 0, [0, 0.81, 0]);
  B.add(r, 'Box', { width: 0.5, height: 0.2, depth: 0.45 }, COL5.mahog, 0, [0, 0.93, 0]);
  B.add(r, 'Cylinder', { diameter: 0.36, height: 0.012, tessellation: 24 }, COL5.black, 0, [0, 1.04, 0]);
  B.add(r, 'Cylinder', { diameter: 0.03, height: 0.3, tessellation: 6 }, COL5.brass, 0, [0.18, 1.18, -0.1]);
  for (let i = 0; i < 7; i++) { const t = i / 6, d = 0.06 + t * t * 0.95; B.add(r, 'Cylinder', { diameterTop: d + 0.12 * t, diameterBottom: d, height: 0.14, tessellation: 18, cap: BABYLON.Mesh.NO_CAP }, COL5.brass.map(v => v * (1.1 - 0.2 * t)), 0, [0.18, 1.35 + t * 0.35, t * 0.75], [-1.1 + 0.2 * t, 0, 0]); }
}
function piano5(B, r) {
  const K = COL5.black;
  B.add(r, 'Box', { width: 1.5, height: 0.32, depth: 1.8 }, K, 0, [0, 0.86, 0.2]); B.add(r, 'Box', { width: 1.5, height: 0.25, depth: 0.2 }, K, 0, [0, 0.83, 1.2]);
  B.add(r, 'Box', { width: 1.3, height: 0.03, depth: 0.16 }, [0.92, 0.9, 0.84], 0, [0, 0.97, 1.2]); B.add(r, 'Box', { width: 1.45, height: 0.9, depth: 0.03 }, K, 0, [0, 1.4, -0.1], [-0.9, 0, 0]);
  for (const [x, z] of [[-0.62, 1.1], [0.62, 1.1], [0, -0.55]]) B.add(r, 'Cylinder', { diameter: 0.1, height: 0.7, tessellation: 8 }, K, 0, [x, 0.35, z]);
  B.add(r, 'Box', { width: 0.7, height: 0.06, depth: 0.35 }, K, 0, [0, 0.5, 1.75]);
}
function bar5(B, r, len) {   // bar counter parallel to the wall, bottle shelves behind
  B.add(r, 'Box', { width: len, height: 1.05, depth: 0.6 }, COL5.mahog, 0, [0, 0.52, 1.35]); B.add(r, 'Box', { width: len + 0.1, height: 0.06, depth: 0.72 }, COL5.marble, 0, [0, 1.08, 1.35]);
  B.add(r, 'Box', { width: len, height: 0.05, depth: 0.05 }, COL5.brass, 0, [0, 0.18, 1.7]);
  for (const y of [1.2, 1.65, 2.1]) { B.add(r, 'Box', { width: len, height: 0.04, depth: 0.28 }, COL5.mahog2, 0, [0, y, 0.15]); for (let i = 0; i < len * 7; i++) if (RNG() < 0.75) B.add(r, 'Cylinder', { diameter: 0.07, height: rnd(0.22, 0.32), tessellation: 7 }, pick([[0.15, 0.3, 0.12], [0.4, 0.22, 0.06], [0.7, 0.66, 0.5], [0.3, 0.05, 0.05]]), 0.05, [-len / 2 + 0.1 + i / 7, y + 0.14, 0.12]); }
  B.add(r, 'Box', { width: len, height: 1.6, depth: 0.03 }, COL5.gold.map(v => v * 0.55), 0, [0, 1.85, 0.015]);
  for (let i = 0; i < 4; i++) { const q = localPt(r, -len / 2 + 0.4 + i * (len - 0.8) / 3, 0, 2.05); const s = propRoot(q.x, q.z, 0); B.add(s, 'Cylinder', { diameter: 0.36, height: 0.06, tessellation: 12 }, COL5.velvet, 0, [0, 0.76, 0]); B.add(s, 'Cylinder', { diameter: 0.06, height: 0.74, tessellation: 6 }, COL5.brass, 0, [0, 0.37, 0]); }
  solidLocal(r, -len / 2, 1.0, len / 2, 1.72);
}
function keyBoard5(B, r) {   // housekeeping key board: a cabinet with hooks, one ring glinting
  B.add(r, 'Box', { width: 0.7, height: 0.55, depth: 0.05 }, COL5.mahog2, 0, [0, 1.45, 0.025]);
  for (let i = 0; i < 12; i++) { const x = -0.27 + (i % 6) * 0.108, y = 1.62 - Math.floor(i / 6) * 0.26; B.add(r, 'Box', { width: 0.012, height: 0.012, depth: 0.05 }, COL5.brass, 0, [x, y, 0.07]); if (RNG() < 0.35) B.add(r, 'Box', { width: 0.03, height: 0.07, depth: 0.004 }, [0.8, 0.76, 0.6], 0, [x, y - 0.06, 0.09]); }
}
function nest5(B, x, z, n) {   // papery cocoons clustered under the ceiling, webs, shed wings on the floor
  const r = propRoot(x, z, rnd(0, TAU)), G = [0.52, 0.48, 0.42], D = [0.32, 0.28, 0.24];
  for (let i = 0; i < n; i++) { const a = rnd(0, TAU), rr = rnd(0, 0.9), s = rnd(0.25, 0.5); B.add(r, 'Sphere', { diameter: s, segments: 6 }, (RNG() < 0.5 ? G : D).map(v => v * rnd(0.8, 1.1)), 0, [Math.sin(a) * rr, CEIL - s * 0.9, Math.cos(a) * rr], [rnd(-0.3, 0.3), 0, rnd(-0.3, 0.3)], [1, 1.9, 1]); }
  for (let i = 0; i < 9; i++) { const a = rnd(0, TAU), L = rnd(0.6, 1.5); B.add(r, 'Box', { width: 0.008, height: L, depth: 0.008 }, [0.7, 0.68, 0.64], 0.02, [Math.sin(a) * rnd(0.2, 1.3), CEIL - L / 2, Math.cos(a) * rnd(0.2, 1.3)], [rnd(-0.5, 0.5), 0, rnd(-0.5, 0.5)]); }
  for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: rnd(0.3, 0.6), height: 0.004, depth: rnd(0.2, 0.35) }, [0.42, 0.34, 0.26].map(v => v * rnd(0.7, 1.1)), 0, [rnd(-1.2, 1.2), 0.004, rnd(-1.2, 1.2)], [0, rnd(0, TAU), 0]);
  for (let i = 0; i < 6; i++) B.add(r, 'Sphere', { diameter: rnd(0.04, 0.08), segments: 4 }, [0.8, 0.78, 0.66], 0.05, [rnd(-0.8, 0.8), CEIL - 0.05, rnd(-0.8, 0.8)]);
}
function boiler5(B, h) {   // a riveted fire-tube boiler in the middle of its hall, firebox facing +z
  const c = h.cells[4], x = cellCenter(c % N), z = cellCenter((c / N) | 0), ry = pick([0, Math.PI / 2, Math.PI, -Math.PI / 2]), r = propRoot(x, z, ry), I = COL5.iron, R = COL5.rust;
  B.add(r, 'Cylinder', { diameter: 1.7, height: 3.2, tessellation: 18 }, R.map(v => v * 1.1), 0, [0, 1.25, 0], [Math.PI / 2, 0, 0]);
  for (const zz of [-1.4, -0.7, 0, 0.7, 1.4]) B.add(r, 'Cylinder', { diameter: 1.76, height: 0.06, tessellation: 18 }, I, 0, [0, 1.25, zz], [Math.PI / 2, 0, 0]);
  for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.3, height: 0.5, depth: 2.6 }, I, 0, [s * 0.55, 0.25, 0]);
  B.add(r, 'Box', { width: 1.3, height: 1.0, depth: 0.12 }, I, 0, [0, 0.9, 1.64]);
  const door = W5.fireOn.add(r, 'Box', { width: 0.5, height: 0.36, depth: 0.03 }, [1, 0.45, 0.12], 1, [0, 0.72, 1.71]);
  for (let i = 0; i < 5; i++) B.add(r, 'Box', { width: 0.5, height: 0.025, depth: 0.03 }, I, 0, [0, 0.58 + i * 0.07, 1.73]);
  B.add(r, 'Cylinder', { diameter: 0.36, height: 0.05, tessellation: 16 }, [0.85, 0.82, 0.72], 0, [0.45, 1.9, 1.62], [Math.PI / 2, 0, 0]);
  const fp = localPt(r, 0, 0.72, 2.0); W5.fires.push({ x: fp.x, y: 0.72, z: fp.z, seed: RNG() });
  const gp = localPt(r, 0.45, 1.9, 1.66); h.gauge = { x: gp.x, y: 1.9, z: gp.z, root: r };
  solidLocal(r, -0.9, -1.7, 0.9, 1.75, 'prop');
  // the stack pipe needs world coords
  const a = localPt(r, 0, 2.05, -0.9); W5.stacks = W5.stacks || []; W5.stacks.push([a.x, a.z]);
  B.pipe([a.x, 1.9, a.z], [a.x, CEIL + 0.05, a.z], 0.16, I); B.pipe([a.x, CEIL - 0.25, a.z], [a.x, CEIL - 0.18, a.z], 0.2, I);
  h.boiler = { x, z, ry, root: r };
}

// ================= assemble the hotel =================
async function buildWorld5(progress) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0.018, 0.012, 0.008, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 70; CAM.fov = 1.0;
  resetW9(); resetW5();
  progress(0.05, 'CHECKING IN…'); await nextFrame();
  genLayout5(); collectPieces5(); planLights5(); lightPlaces5();
  const T = {};
  progress(0.12, 'HANGING THE WALLPAPER…'); await nextFrame();
  for (const k of ['hwall', 'carpet', 'hceil']) T[k] = TEX5[k](SCN, 512);
  progress(0.24, 'WAXING THE BALLROOM FLOOR…'); await nextFrame();
  for (const k of ['check', 'deco', 'bceil']) T[k] = TEX5[k](SCN, 512);
  progress(0.34, 'STOKING THE BOILERS…'); await nextFrame();
  for (const k of ['bconc', 'bfloor', 'brick']) T[k] = TEX5[k](SCN, 512);
  T.tile = TEX9.tile(SCN, 512);
  progress(0.46, 'LIGHTING THE CHANDELIERS…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  progress(0.58, 'TURNING DOWN THE BEDS…'); await nextFrame();
  const E = (n, d, t) => envMat9(n, [d], t);
  W5.eyeMat = envMat5('hwall5', ['MAT_HWALL'], T.hwall);
  const mats = { hwall: W5.eyeMat, deco: E('deco5', 'MAT_DECO', T.deco), bconc: E('bconc5', 'MAT_BCONC', T.bconc), brick: E('brick5', 'MAT_BLOCK', T.brick),
    trim: E('trim5', 'MAT_CASE', T.bconc), carpet: E('carpet5', 'MAT_CARPET', T.carpet), check: E('check5', 'MAT_CHECK', T.check), tile: E('tile5', 'MAT_TILE', T.tile),
    bfloor: E('bfloor5', 'MAT_BFLOOR', T.bfloor), hceil: E('hceil5', 'MAT_HCEIL', T.hceil), bceil: E('bceil5', 'MAT_BCEIL', T.bceil) };
  buildGeometry5(SCN, mats);
  mkPlaques5(T);
  progress(0.7, 'SETTING THE TABLES…'); await nextFrame();
  buildProps5();
  progress(0.82, 'HANGING DOORS…'); await nextFrame();
  buildDoors5(); buildStory5(); buildItems5(G.diff); buildDust();
  W5.finishProps();
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.92, 'CUEING THE BAND…'); await nextFrame();
  await prepJazz5();
}

// deterministic props for the endless corridor: build with a seed that only depends on the repeat phase
function seeded5(seed, fn) { const R = RNG; RNG = mulberry32(seed); try { return fn(); } finally { RNG = R; } }
const FW5 = { console: 1.0, bench: 1.5, palm: 0.6, radiator: 0.7, armchair: 0.8, clock: 0.6, cart: 0.95, wardrobe: 1.06, desk: 1.1, lockers: 1.2, shelf: 1.4, nightstand: 0.46 };
function aabbOf5(r, hw, d0, d1) { const P = [[-hw, d0], [hw, d0], [-hw, d1], [hw, d1]].map(([a, b]) => localPt(r, a, 0, b)); return [Math.min(...P.map(p => p.x)), Math.min(...P.map(p => p.z)), Math.max(...P.map(p => p.x)), Math.max(...P.map(p => p.z))]; }
const hit5 = (a, L) => L.some(q => a[0] < q[2] && a[2] > q[0] && a[1] < q[3] && a[3] > q[1]);
function buildProps5() {
  const mat = actMat('props5', { spec: 0.25, shin: 20, wrinkle: 0.18, emis: 1, wrap: 0.35, mottle: 0.3 }), B = new PropBatch(mat); B.fast = true;
  W9.propMat = mat; W5.propMat = mat;
  const lensOn = actMat('lensOn5', { emis: 1 }), lensFl = actMat('lensFl5', { emis: 1 }), fireM = actMat('fire5', { emis: 1 });
  setEmi(lensOn, 4.2); setEmi(fireM, 3.2, 1.5, 0.5); W5.lensFl = lensFl; W5.fireMat = fireM;
  const BOn = new PropBatch(lensOn), BFl = new PropBatch(lensFl), FOn = new PropBatch(fireM); BOn.fast = BFl.fast = FOn.fast = true;
  Object.assign(W5, { B, BOn, BFl, fireOn: FOn });
  // lights (reserve the wall space the sconces use)
  for (const s of LV.sconces) slotUse5({ c: s.cell, d: s.d }, s.along, s.big ? 0.5 : 0.42);
  for (const s of LV.sconces) sconce5(s);
  for (const b of LV.bulbs) bulb5(b);
  chandelier5(propRoot(LV.chand.x, LV.chand.z, 0), 2.2, BEV_H, true);
  // doors that go nowhere, bricked-up doorways, signs and plaques
  for (const e of LV.ek.values()) {
    if (e.kind === 'deco') { if (e.loop) { const k = (e.x - LOOP5.x0) % 5; seeded5(900 + k * 7 + e.d, () => decoDoor5(B, e)); } else decoDoor5(B, e); }
    else if (e.kind === 'brick') brickUp5(B, e);
    else if (e.kind === 'arch' && e.sign) sign5(e.sign, atWall5(sideOf5(e), 0, 0), [0, 2.98, 0.03], 1.7, 0.32);
    else if (e.kind === 'door' && e.dk === 'warp' && e.sign) sign5(e.sign, atWall5(sideOf5(e), 0, 0), [0, DOORH + 0.36, 0.03], 1.3, 0.26);
    else if (e.kind === 'door' && e.plaque) plaqueOn(atWall5(sideOf5(e), 0, 0), DOORW / 2 + 0.34, 1.5, e.plaque, 0.28, 0.08);
    else if (e.kind === 'door' && e.num) plaqueOn(atWall5(sideOf5(e), 0, 0), DOORW / 2 + 0.3, 1.5, String(e.num));
  }
  // corridors
  const HALLK = ['console', 'console', 'bench', 'palm', 'radiator', 'armchair', 'clock', 'cart', 'palm'];
  for (const r of LV.rooms) {
    if (r.t !== 'hall') continue;
    const cells = r.cells.filter(c => LV.zone[c] !== Z5.LOBBY);
    if (r.loop) { loopProps5(B, cells); continue; }
    for (const s of shuffle(wallSlots5(cells))) {
      if (s.door) continue;
      const q = RNG();
      if (q < 0.3) { const w = rnd(0.55, 0.85); if (slotUse5(s, 0, w + 0.15)) FURN5.painting(B, atWall5(s, 0), { w }); }
      else if (q < 0.55) {
        const k = pick(HALLK), w = FW5[k], al = rnd(-0.45, 0.45);
        if (!slotUse5(s, al, w)) continue;
        placeF5(B, s, al, k, { hw: w / 2 });
        if ((k === 'console' || k === 'bench' || k === 'radiator') && RNG() < 0.7) FURN5.painting(B, atWall5(s, al), { w: rnd(0.5, 0.7), y: 1.72 });
      }
    }
  }
  for (const g of LV.guest) furnishGuest5(B, g);
  furnishBev5(B); furnishLobby5(B); furnishService5(B);
  for (const r of LV.rooms) if (r.t === 'vest') furnishVest5(B, r);
  furnishBoiler5(B);
  // moth nests in the dark stretches
  for (const [x, y] of [[5, 23], [11, 5], [31, 7]]) { const px = cellCenter(x), pz = cellCenter(y); nest5(B, px, pz, 8); W5.nests.push({ x: px, z: pz, c: cIdx(x, y), boil: false }); }
  W5.finishProps = () => {
    const keep = [], out = [...(B.finish('props5', keep) || []), ...(BOn.finish('lensOn5', keep) || []), ...(BFl.finish('lensFl5', keep) || []), ...(FOn.finish('fire5', keep) || [])];
    out.forEach(m => m._sortD = 300);
    new Set(keep).forEach(r => r && r.dispose && r.dispose());
    W5.pl.dt.update(); W5.pl.dt.hasAlpha = false;
    if (W5.pl.g.p.length) { const m = W5.pl.g.mesh('plaques5', SCN); m.material = W5.plMat; m.isPickable = false; m._sortD = 310; }
  };
}
function brickUp5(B, e) {   // loose bricks and mortar dust in front of a bricked-up doorway
  const r = atWall5(sideOf5(e), 0, 0);
  for (let i = 0; i < 6; i++) B.add(r, 'Box', { width: 0.21, height: 0.07, depth: 0.1 }, [0.5, 0.26, 0.18].map(v => v * rnd(0.7, 1.1)), 0, [rnd(-0.8, 0.8), 0.035, rnd(0.08, 0.6)], [0, rnd(0, TAU), 0]);
  B.add(r, 'Box', { width: 1.5, height: 0.004, depth: 0.5 }, [0.6, 0.57, 0.52], 0, [0, 0.003, 0.25]);
}
// the east wing repeats every five cells: identical dressing per phase k
function loopProps5(B, cells) {
  for (const c of cells) {
    const x = c % N, y = (c / N) | 0, k = (x - LOOP5.x0) % 5;
    seeded5(700 + k * 13, () => {
      const S = d => ({ x, y, d, c });
      if (k === 0) FURN5.painting(B, atWall5(S(3), -1.35), { w: 0.42, h: 0.56, seed: 0.31 });
      else if (k === 1) placeF5(B, S(1), -1.38, 'palm', { hw: 0.3 });
      else if (k === 2) FURN5.painting(B, atWall5(S(1), -1.35), { w: 0.42, h: 0.5, seed: 0.72 });
      else if (k === 3) {   // a room-service tray left outside a door
        const r = atWall5(S(3), 0.05, 0.2); B.add(r, 'Box', { width: 0.5, height: 0.02, depth: 0.36 }, [0.7, 0.7, 0.68], 0, [0, 0.01, 0.3]);
        B.add(r, 'Sphere', { diameter: 0.26, segments: 8, slice: 0.5 }, [0.78, 0.78, 0.76], 0, [0.08, 0.02, 0.3]); B.add(r, 'Cylinder', { diameter: 0.07, height: 0.12, tessellation: 8 }, [0.8, 0.8, 0.82], 0, [-0.16, 0.08, 0.26]);
      } else { const r = atWall5(S(1), 0, 0); B.add(r, 'Box', { width: 0.1, height: 0.22, depth: 0.004 }, [0.8, 0.72, 0.5], 0, [DOORW / 2 - 0.12, 0.8, 0.06]); }   // DO NOT DISTURB
    });
  }
}
function furnishGuest5(B, g) {
  const D = g.door, d = D.d, far = g.cells[g.cells.length - 1], fx = far % N, fy = (far / N) | 0, boxes = [];
  const [mx, mz] = edgeMid(D.x, D.y, d), cx = mx + DX[d] * 0.8, cz = mz + DY[d] * 0.8; boxes.push([cx - 0.8, cz - 0.8, cx + 0.8, cz + 0.8]);   // door swing
  const plainS = (x, y, dd) => edgeVal(x, y, dd) === 1 && !LV.ek.has(eKey(x, y, dd));
  let bs = { x: fx, y: fy, d, c: far };
  if (!plainS(fx, fy, d)) { const alt = [0, 1, 2, 3].filter(q => q !== (d + 2) % 4 && plainS(fx, fy, q)); if (alt.length) bs.d = alt[0]; else bs = null; }
  if (bs) {
    const r = atWall5(bs, 0), a = aabbOf5(r, 0.86, 0, 2.2);
    if (!hit5(a, boxes)) {
      FURN5.bed(B, r); boxes.push(a); addSolid(a[0], a[1], a[2], a[3], 'prop'); slotUse5(bs, 0, 1.7);
      for (const s of [-1, 1]) { const q = atWall5(bs, s * 1.14), b = aabbOf5(q, 0.24, 0, 0.44); if (hit5(b, boxes)) continue; FURN5.nightstand(B, q, { lit: g.lamp && g.lamp.state > 0 && s > 0 }); boxes.push(b); addSolid(b[0], b[1], b[2], b[3], 'prop'); slotUse5(bs, s * 1.14, 0.5); }
      if (RNG() < 0.7) FURN5.painting(B, atWall5(bs, 0), { w: 1.0, h: 0.5, y: 1.75 });
    }
  }
  const L = g.lamp; if (L) bulb5({ x: L.x, z: L.z, y: CEIL, kind: 'pend', state: L.state });
  const slots = shuffle(wallSlots5(g.cells).filter(s => !s.door));
  for (const k of ['wardrobe', 'desk', 'armchair', 'painting', 'radiator', 'painting', 'console']) {
    for (const s of slots) {
      const al = rnd(-0.9, 0.9);
      if (k === 'painting') { if (slotUse5(s, al, 0.8)) { FURN5.painting(B, atWall5(s, al)); break; } continue; }
      const w = FW5[k], r0 = atWall5(s, al), dep = { wardrobe: 0.62, desk: 1.02, armchair: 0.83, radiator: 0.2, console: 0.44 }[k], a = aabbOf5(r0, w / 2, 0, dep);
      if (hit5(a, boxes) || !slotUse5(s, al, w)) { r0.dispose(); continue; }
      FURN5[k](B, r0); boxes.push(a); if (k !== 'radiator') addSolid(a[0], a[1], a[2], a[3], 'prop');
      break;
    }
  }
  // clutter: an open suitcase, shoes, a room-service trolley
  if (RNG() < 0.5) { const c = pick(g.cells), p = { x: cellCenter(c % N) + rnd(-0.8, 0.8), z: cellCenter((c / N) | 0) + rnd(-0.8, 0.8) }, bb = [p.x - 0.4, p.z - 0.4, p.x + 0.4, p.z + 0.4];
    if (!hit5(bb, boxes)) { const r = propRoot(p.x, p.z, rnd(0, TAU)), cc = pick([[0.36, 0.22, 0.14], [0.2, 0.22, 0.26], [0.42, 0.34, 0.24]]);
      const m = B.mdl('suitcase', r, null, null, 1, cc.map(v => Math.min(1.2, v * 2.6)));   // r5: a scanned suitcase left standing (the clothes rolls are still drawn from RNG so the layout matches)
      if (!m) { B.add(r, 'Box', { width: 0.7, height: 0.12, depth: 0.46 }, cc, 0, [0, 0.06, 0]); B.add(r, 'Box', { width: 0.7, height: 0.46, depth: 0.1 }, cc.map(v => v * 0.85), 0, [0, 0.24, -0.26], [-0.35, 0, 0]); }
      for (let i = 0; i < 3; i++) { const w = rnd(0.2, 0.4), d = rnd(0.15, 0.3), c = pick(UPH5), px = rnd(-0.2, 0.2), pz = rnd(-0.1, 0.1), ry = rnd(-0.6, 0.6); if (!m) B.add(r, 'Box', { width: w, height: 0.04, depth: d }, c, 0, [px, 0.14 + i * 0.03, pz], [0, ry, 0]); } } }
}
function furnishBev5(B) {
  const C = 17 * CELL, x0 = BEV5.x0 * CELL, z0 = BEV5.z0 * CELL;
  for (const [dx, dz] of [[-6.6, -6.4], [3.0, -5.6], [7.4, -4.4], [-7.0, 1.8], [-5.8, 7.0], [0.8, 6.6], [7.8, 5.2], [7.0, 1.6]]) roundTable5(B, C + dx, C + dz, RNG() < 0.4);
  // bandstand against the north wall (cells 17-18)
  const bx0 = 17 * CELL, bx1 = 19 * CELL, bz0 = z0 + WT / 2, bz1 = z0 + 2.7, sr = propRoot((bx0 + bx1) / 2, (bz0 + bz1) / 2, 0), H = 0.38;
  B.add(sr, 'Box', { width: bx1 - bx0, height: H, depth: bz1 - bz0 }, COL5.mahog, 0, [0, H / 2, 0]);
  B.add(sr, 'Box', { width: bx1 - bx0 + 0.04, height: 0.05, depth: 0.06 }, COL5.gold, 0, [0, H - 0.02, (bz1 - bz0) / 2]);
  for (let i = 0; i < 12; i++) B.add(sr, 'Box', { width: 0.03, height: H - 0.06, depth: 0.02 }, COL5.gold.map(v => v * 0.8), 0, [-(bx1 - bx0) / 2 + 0.3 + i * (bx1 - bx0 - 0.6) / 11, H / 2 - 0.02, (bz1 - bz0) / 2 + 0.01]);
  addSolid(bx0, z0, bx1, bz1 + 0.05, 'prop');
  const up = (x, z, ry) => { const r = propRoot(x, z, ry); r.position.y = H; r.computeWorldMatrix(true); return r; };
  piano5(B, up(bx0 + 1.6, bz0 + 1.0, 0.35));
  const gr = up(bx1 - 1.2, bz0 + 0.8, -0.25); gramophone5(B, gr);
  const gp = localPt(gr, 0.18, 1.7, 0.9); W5.gramo = { x: gp.x, y: 1.7 + H, z: gp.z };
  for (let i = 0; i < 3; i++) {   // empty band chairs and music stands
    const q = up(bx0 + 3.3 + i * 0.95, bz0 + 1.2 + (i % 2) * 0.3, rnd(-0.3, 0.3));
    B.add(q, 'Box', { width: 0.42, height: 0.05, depth: 0.42 }, COL5.black, 0, [0, 0.46, 0]); B.add(q, 'Box', { width: 0.42, height: 0.5, depth: 0.04 }, COL5.black, 0, [0, 0.72, -0.2]);
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) B.add(q, 'Box', { width: 0.025, height: 0.44, depth: 0.025 }, COL5.steel, 0, [lx, 0.22, lz]);
    B.add(q, 'Cylinder', { diameter: 0.02, height: 1.05, tessellation: 5 }, COL5.steel, 0, [0, 0.52, 0.55]); B.add(q, 'Box', { width: 0.46, height: 0.3, depth: 0.02 }, COL5.black, 0, [0, 1.1, 0.55], [-0.4, 0, 0]);
  }
  { const q = up(bx0 + 3.9, bz1 - 0.25, 0); B.add(q, 'Cylinder', { diameter: 0.02, height: 1.5, tessellation: 5 }, COL5.steel, 0, [0, 0.75, 0]); B.add(q, 'Cylinder', { diameter: 0.3, height: 0.03, tessellation: 12 }, COL5.steel, 0, [0, 0.015, 0]);
    B.add(q, 'Capsule', { height: 0.14, radius: 0.04, tessellation: 8 }, [0.7, 0.7, 0.72], 0, [0, 1.56, 0.03], [0.4, 0, 0]); }
  sign5('THE BEVERLY ROOM', atWall5({ x: 17, y: BEV5.z0, d: 3 }, -1.8, 0), [0, 4.4, 0.03], 4.4, 0.62, { bold: true, emis: 0.45 });
  // the bar along the west wall (cells 18-19)
  const br = atWall5({ x: BEV5.x0, y: 18, d: 2, c: cIdx(BEV5.x0, 18) }, 1.8, 0); bar5(B, br, 6.0);
  // dropped glasses, a shoe, streamers
  for (let i = 0; i < 16; i++) { const r = propRoot(C + rnd(-8, 8), C + rnd(-8, 8), rnd(0, TAU)); if (RNG() < 0.5) B.add(r, 'Cylinder', { diameterTop: 0.08, diameterBottom: 0.02, height: 0.1, tessellation: 8 }, [0.82, 0.84, 0.86], 0.04, [0, 0.03, 0], [Math.PI / 2, 0, 0]);
    else B.add(r, 'Box', { width: 0.03, height: 0.003, depth: rnd(0.4, 1.2) }, pick([[0.8, 0.2, 0.2], [0.8, 0.7, 0.2], [0.3, 0.5, 0.8]]), 0, [0, 0.002, 0]); }
}
function furnishLobby5(B) {
  // front desk along the west side of the lobby, key cubbies behind it
  const r = atWall5({ x: 15, y: 27, d: 2, c: cIdx(15, 27) }, 1.8, 0);
  B.add(r, 'Box', { width: 4.2, height: 1.06, depth: 0.62 }, COL5.mahog, 0, [0, 0.53, 1.62]); B.add(r, 'Box', { width: 4.3, height: 0.06, depth: 0.74 }, COL5.marble, 0, [0, 1.09, 1.62]);
  for (let i = 0; i < 7; i++) B.add(r, 'Box', { width: 0.5, height: 0.8, depth: 0.02 }, COL5.mahog2, 0, [-1.8 + i * 0.6, 0.5, 1.94]);
  B.add(r, 'Box', { width: 4.2, height: 0.05, depth: 0.03 }, COL5.gold, 0, [0, 0.96, 1.95]);
  for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { const x = -1.6 + i * 0.3 + 0.12, y = 1.25 + j * 0.24;
    B.add(r, 'Box', { width: 0.28, height: 0.22, depth: 0.2 }, COL5.mahog2.map(v => v * 0.7), 0, [x, y, 0.11]); B.add(r, 'Box', { width: 0.22, height: 0.16, depth: 0.01 }, [0.05, 0.03, 0.02], 0, [x, y, 0.215]);
    if (RNG() < 0.35) B.add(r, 'Box', { width: 0.02, height: 0.08, depth: 0.01 }, COL5.brass, 0.05, [x, y - 0.02, 0.225]); }
  plaqueOn(r, -0.35, 2.3, 'RECEPTION', 0.5, 0.1);
  B.add(r, 'Box', { width: 0.36, height: 0.03, depth: 0.26 }, [0.2, 0.05, 0.05], 0, [-0.5, 1.135, 1.55], [0, 0.2, 0]);      // guest register
  B.add(r, 'Box', { width: 0.34, height: 0.005, depth: 0.24 }, [0.9, 0.87, 0.78], 0, [-0.5, 1.152, 1.55], [0, 0.2, 0]);
  B.add(r, 'Cylinder', { diameter: 0.12, height: 0.03, tessellation: 12 }, COL5.brass, 0, [1.4, 1.135, 1.5]); B.add(r, 'Box', { width: 0.02, height: 0.36, depth: 0.02 }, COL5.brass, 0, [1.4, 1.3, 1.5]);
  W5.BOn.add(r, 'Cylinder', { diameterTop: 0.14, diameterBottom: 0.24, height: 0.16, tessellation: 12 }, [0.4, 0.9, 0.5], 0.35, [1.4, 1.5, 1.5]);
  solidLocal(r, -2.15, 1.25, 2.15, 2.0);
  W5.deskR = r;
  // lounge on the east side: sofa, two armchairs, coffee table, palms, a clock by the corridor
  placeF5(B, { x: 17, y: 27, d: 0, c: cIdx(17, 27) }, -1.8, 'bench', { hw: 0.78, sofa: true });
  for (const dz of [-1.1, 1.1]) { const q = propRoot(61.7, 28 * CELL + dz, Math.PI / 2); FURN5.armchair(B, q, { col: UPH5[0] }); solidLocal(q, -0.4, 0, 0.4, 0.83); }
  { const q = propRoot(63.2, 28 * CELL, 0); B.add(q, 'Box', { width: 0.6, height: 0.04, depth: 1.1 }, COL5.mahog2, 0, [0, 0.42, 0]); for (const [a, b] of [[-0.26, -0.5], [0.26, -0.5], [-0.26, 0.5], [0.26, 0.5]]) B.add(q, 'Box', { width: 0.04, height: 0.4, depth: 0.04 }, COL5.mahog, 0, [a, 0.2, b]);
    B.add(q, 'Box', { width: 0.2, height: 0.004, depth: 0.28 }, [0.8, 0.76, 0.66], 0, [0.05, 0.445, 0.1], [0, 0.3, 0]); addSolid(62.9, 28 * CELL - 0.55, 63.5, 28 * CELL + 0.55, 'prop'); }
  placeF5(B, { x: 17, y: 28, d: 0, c: cIdx(17, 28) }, 1.25, 'palm', { hw: 0.3 }); placeF5(B, { x: 17, y: 27, d: 3, c: cIdx(17, 27) }, -1.2, 'palm', { hw: 0.3 });
  placeF5(B, { x: 15, y: 27, d: 3, c: cIdx(15, 27) }, -0.95, 'clock', { hw: 0.3 });
  FURN5.painting(B, atWall5({ x: 17, y: 28, d: 0, c: cIdx(17, 28) }, -0.3), { w: 1.2, h: 0.8, y: 1.75, seed: 0.1 });
  // elevator: brass frame, floor dial, car interior
  const e = atWall5({ x: 16, y: 28, d: 1 }, 0, 0);
  B.add(e, 'Box', { width: DOORW + 0.34, height: 0.1, depth: 0.05 }, COL5.brass, 0, [0, DOORH + 0.14, 0.02]);
  const dial = [0, DOORH + 0.52, 0.03];
  B.add(e, 'Cylinder', { diameter: 0.62, height: 0.03, tessellation: 24, arc: 0.5 }, COL5.brass, 0, dial, [Math.PI / 2, 0, Math.PI / 2]);
  B.add(e, 'Cylinder', { diameter: 0.54, height: 0.03, tessellation: 24, arc: 0.5 }, COL5.cream, 0.05, [dial[0], dial[1], 0.04], [Math.PI / 2, 0, Math.PI / 2]);
  for (let i = 0; i < 9; i++) { const a = -1.3 + i * 0.325; plaqueOn(e, Math.sin(a) * 0.2, dial[1] + Math.cos(a) * 0.2, String(i + 1), 0.05, 0.04, 0.06); }
  B.add(e, 'Box', { width: 0.012, height: 0.22, depth: 0.01 }, COL5.black, 0, [0.06, dial[1] + 0.1, 0.065], [0, 0, -0.55]);
  const cb = atWall5({ x: 16, y: 28, d: 1 }, -1.0, 0);   // call button panel to the right of the doors
  B.add(cb, 'Box', { width: 0.14, height: 0.26, depth: 0.02 }, COL5.brass, 0, [0, 1.15, 0.01]);
  const bm = actMat('callBtn5', { emis: 1 }); setEmi(bm, 0.4, 0.25, 0.1);
  const btn = mkMerged(bm, P => { P('Cylinder', { diameter: 0.05, height: 0.02, tessellation: 12 }, [1, 0.8, 0.5], 1, [0, 0, 0], [Math.PI / 2, 0, 0]); }, 'callBtn');
  const bp = localPt(cb, 0, 1.18, 0.03); btn.position.copyFrom(bp); btn.rotation.y = cb.rotation.y;
  W5.callBtn = { x: bp.x, y: 1.18, z: bp.z, mat: bm, press: 0 };
  // inside the car
  const car = { x0: 16 * CELL + WT / 2, x1: 17 * CELL - WT / 2, z0: 29 * CELL + WT / 2, z1: 30 * CELL - WT / 2 };
  for (const [s, d] of [[{ x: 16, y: 29, d: 0 }, 0], [{ x: 16, y: 29, d: 2 }, 0], [{ x: 16, y: 29, d: 1 }, 0]]) { const q = atWall5(s, d, 0); B.add(q, 'Box', { width: CELL - WT - 0.3, height: 0.05, depth: 0.05 }, COL5.brass, 0, [0, 0.95, 0.1]); }
  FURN5.painting(B, atWall5({ x: 16, y: 29, d: 1 }, 0), { w: 1.4, h: 1.2, y: 1.6, seed: 0.9 });
  const pn = atWall5({ x: 16, y: 29, d: 3 }, 1.05, 0); B.add(pn, 'Box', { width: 0.2, height: 0.5, depth: 0.02 }, COL5.brass, 0, [0, 1.25, 0.01]);
  for (let i = 0; i < 6; i++) { const lit = i === 4; (lit ? W5.BOn : B).add(pn, 'Cylinder', { diameter: 0.045, height: 0.015, tessellation: 10 }, lit ? [1, 0.7, 0.3] : [0.8, 0.7, 0.5], lit ? 0.5 : 0, [(i % 2 ? 0.045 : -0.045), 1.08 + Math.floor(i / 2) * 0.12, 0.025], [Math.PI / 2, 0, 0]); }
  W5.car = car;
}
function furnishService5(B) {
  placeF5(B, { x: 18, y: 20, d: 1, c: cIdx(18, 20) }, 0.2, 'shelf', { hw: 0.7 });
  placeF5(B, { x: 19, y: 20, d: 0, c: cIdx(19, 20) }, 0, 'lockers', { hw: 0.6 });
  placeF5(B, { x: 18, y: 20, d: 2, c: cIdx(18, 20) }, 0.6, 'cart', { hw: 0.48 });
  sign5('BOILER ROOM  ▼', atWall5({ x: 19, y: 21, d: 2 }, 0.9, 0), [0, 2.2, 0.03], 1.2, 0.24, { bg: '#1a1a14', fg: '#e8d27a' });
  plaqueOn(atWall5({ x: 18, y: 20, d: 3 }, 0, 0), DOORW / 2 + 0.34, 1.5, 'STAFF ONLY', 0.28, 0.08);
}
function furnishVest5(B, v) {   // both vestibules of a pair are dressed identically in their own frame
  const c = cIdx(v.vx, v.vy), pl = [-v.fz, v.fx], dl = [0, 1, 2, 3].find(k => DX[k] === pl[0] && DY[k] === pl[1]), dr = (dl + 2) % 4;
  seeded5(4242, () => { placeF5(B, { x: v.vx, y: v.vy, d: dl, c }, 0, 'bench', { hw: 0.76 }); FURN5.painting(B, atWall5({ x: v.vx, y: v.vy, d: dr }, 0), { w: 0.8, h: 0.6, seed: 0.55 }); placeF5(B, { x: v.vx, y: v.vy, d: dr }, 0, 'radiator', { hw: 0.36 }); });
}
function furnishBoiler5(B) {
  const I = COL5.iron, R = COL5.rust, Y = CEIL - 0.24;
  for (const h of LV.bhalls) boiler5(B, h);
  // pipes run along the maze ceilings, crates and drums in the corners
  for (const c of LV.mazeCells) {
    const x = c % N, y = (c / N) | 0, cx = cellCenter(x), cz = cellCenter(y);
    if (RNG() < 0.55) { const along = RNG() < 0.5, o = rnd(-1.2, 1.2), yy = Y - rnd(0, 0.25), r = rnd(0.05, 0.11), col = RNG() < 0.5 ? I : R;
      if (along) B.pipe([x * CELL, yy, cz + o], [(x + 1) * CELL, yy, cz + o], r, col); else B.pipe([cx + o, yy, y * CELL], [cx + o, yy, (y + 1) * CELL], r, col); }
    if (RNG() < 0.22) { const sx = RNG() < 0.5 ? -1 : 1, sz = RNG() < 0.5 ? -1 : 1, px = cx + sx * rnd(1.0, 1.2), pz = cz + sz * rnd(1.0, 1.2), r = propRoot(px, pz, rnd(0, TAU));
      if (RNG() < 0.5) { const s = rnd(0.55, 0.85), cc = [0.42, 0.32, 0.2].map(v => v * rnd(0.8, 1.1)), u = 0.78 + (s - 0.55) * 0.8;
        const m = B.mdl('crate', r, null, null, u, cc.map((v, i) => v / [0.42, 0.32, 0.2][i]));   // r5: scanned wooden crate (+ a scanned box on top), collision from its rotated footprint
        if (!m) B.add(r, 'Box', { width: s, height: s * 0.8, depth: s }, cc, 0, [0, s * 0.4, 0]);
        if (RNG() < 0.5 && !(m && B.mdl('cbox', r, [0.03, 0.464 * u, 0.1], [0, 0.4, 0], 0.8 * u, [0.9, 0.84, 0.76]))) B.add(r, 'Box', { width: s * 0.7, height: s * 0.6, depth: s * 0.7 }, [0.4, 0.3, 0.18], 0, [0.05, s * 0.8 + s * 0.3, 0], [0, 0.4, 0]);
        if (m) { const f = mdlFoot('crate', m, 0.04); addSolid(f[0], f[1], f[2], f[3], 'prop'); } else addSolid(px - s * 0.6, pz - s * 0.6, px + s * 0.6, pz + s * 0.6, 'prop'); }
      else { const DR = [[0.3, 0.12, 0.08], [0.2, 0.24, 0.2], [0.36, 0.3, 0.12]], DT = [[1, 1, 1], [0.62, 0.7, 0.66], [1, 0.86, 0.58]];
        for (let i = 0; i < 2; i++) { const c = pick(DR); if (!B.mdl('barrel', r, [i * 0.62, 0, 0], [0, i * 2.1 + 0.6, 0], 1, DT[DR.indexOf(c)])) B.add(r, 'Cylinder', { diameter: 0.58, height: 0.88, tessellation: 12 }, c, 0, [i * 0.62, 0.44, 0]); }
        addSolid(px - 0.4, pz - 0.4, px + 1.0, pz + 0.4, 'prop'); } }
  }
  // dead ends deep in the maze: nests
  const deg = c => { const x = c % N, y = (c / N) | 0; let n = 0; for (let d = 0; d < 4; d++) if (passable(x, y, d) && LV.zone[cIdx(x + DX[d], y + DY[d])]) n++; return n; };
  const ends = LV.mazeCells.filter(c => deg(c) === 1).map(c => [c, Math.hypot(c % N - 3, ((c / N) | 0) - 32)]).filter(q => q[1] > 7).sort((a, b) => b[1] - a[1]), pickd = [];
  for (const [c] of ends) { if (pickd.length >= 3) break; if (pickd.some(q => Math.abs(q % N - c % N) + Math.abs(((q / N) | 0) - ((c / N) | 0)) < 6)) continue; pickd.push(c); }
  for (const c of pickd) { const px = cellCenter(c % N), pz = cellCenter((c / N) | 0); nest5(B, px, pz, 6); W5.nests.push({ x: px, z: pz, c, boil: true }); }
  // landing: warning sign, fuse box
  sign5('BOILER ROOM · AUTHORISED STAFF ONLY', atWall5({ x: 4, y: 33, d: 0 }, 0, 0), [0, 2.0, 0.03], 1.9, 0.26, { bg: '#1c1a10', fg: '#e0c050' });
  { const r = atWall5({ x: 4, y: 33, d: 1 }, 0.6, 0); B.add(r, 'Box', { width: 0.5, height: 0.7, depth: 0.16 }, [0.34, 0.36, 0.33], 0, [0, 1.5, 0.08]); B.pipe(rootPt(r, 0, 1.85, 0.08), rootPt(r, 0, CEIL, 0.08), 0.03, I); }
}
