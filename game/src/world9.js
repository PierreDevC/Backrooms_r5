// ---------- Level 9 · world assembly: materials, props, doors, story objects ----------
const W9 = {};
function resetW9() {
  Object.assign(W9, { doors: [], doorAt: new Map(), terms: [], lockers: [], win: new Set(), busy: new Set(), used: new Map(), beacons: [], lens: [],
    gate: null, cage: null, cell: null, elev: null, rack: null, panel: null, crowbar: null, kiosk: null, portal: null, van: null, spawn: null, lights: [], red: [] });
}
resetW9();
function envMat9(name, defs, tex, o = {}) {
  const defines = ['VCOL', ...defs], samplers = ['albedoTex', 'normalTex', 'lightTex'], uniforms = ['world', 'viewProjection', ...COMMON_UNIFORMS];
  const P = o.noPbr ? null : pbrOpts(name, defines, samplers, uniforms);
  const m = new BABYLON.ShaderMaterial(name, SCN, { vertex: 'env9', fragment: 'env' }, {
    attributes: ['position', 'normal', 'uv', 'tangent', 'color'], uniforms, samplers, defines });
  m.setTexture('albedoTex', tex.albedo); m.setTexture('normalTex', tex.normal); m.setTexture('lightTex', LV.lightTex); pbrBind(m, P);
  if (o.twoSided) m.backFaceCulling = false;
  MATS.list.push(m); return m;
}
function coneMat(name, col) {
  const m = new BABYLON.ShaderMaterial(name, SCN, { vertex: 'cone', fragment: 'cone' }, { attributes: ['position', 'normal', 'color'], uniforms: ['world', 'viewProjection', 'coneCol', ...COMMON_UNIFORMS], samplers: ['lightTex'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex); m.setVector4('coneCol', new BABYLON.Vector4(col[0], col[1], col[2], col[3] ?? 1)); m.alphaMode = BABYLON.Engine.ALPHA_ADD; m.disableDepthWrite = true; m.backFaceCulling = false;
  MATS.list.push(m); return m;
}
// inner face of cell (x,y) side d, pushed `off` into the cell and `along` the wall; ry makes local +z point into the room
function wallPt(x, y, d, off = 0, along = 0) {
  const [mx, mz] = edgeMid(x, y, d), nx = -DX[d], nz = -DY[d], tx = -nz, tz = nx;
  return [mx + nx * (WT / 2 + off) + tx * along, mz + nz * (WT / 2 + off) + tz * along, Math.atan2(nx, nz)];
}
function solidLocal(root, x0, z0, x1, z1, tag = 'prop') {
  const m = root.getWorldMatrix(), P = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].map(([a, b]) => BABYLON.Vector3.TransformCoordinates(V3(a, 0, b), m));
  return addSolid(Math.min(...P.map(p => p.x)), Math.min(...P.map(p => p.z)), Math.max(...P.map(p => p.x)), Math.max(...P.map(p => p.z)), tag);
}
function localPt(root, x, y, z) { return BABYLON.Vector3.TransformCoordinates(V3(x, y, z), root.getWorldMatrix()); }
function dtexMat(name, dt, emis, cut = false) {
  const m = new BABYLON.ShaderMaterial(name, SCN, { vertex: 'dtex', fragment: 'dtex' }, { attributes: ['position', 'uv'], uniforms: ['world', 'viewProjection', 'dP', ...COMMON_UNIFORMS], samplers: ['tex', 'lightTex'] });
  m.setTexture('tex', dt); m.setTexture('lightTex', LV.lightTex); m.setVector4('dP', new BABYLON.Vector4(emis, cut ? 1 : 0, 0, 0)); m.backFaceCulling = true;
  MATS.list.push(m); return m;
}
function dynTexPlane(name, w, h, px, py, root, pos, emis = 1.4) {
  const dt = new BABYLON.DynamicTexture(name, { width: px, height: py }, SCN, false);
  const m = dtexMat(name + 'M', dt, emis * 1.6);
  const pl = BABYLON.MeshBuilder.CreatePlane(name + 'P', { width: w, height: h }, SCN); pl.material = m; pl.parent = root; pl.position.set(pos[0], pos[1], pos[2]); pl.rotation.y = Math.PI; pl.isPickable = false;
  return { dt, ctx: dt.getContext(), mat: m, mesh: pl };
}

// ----- furniture library: local +z faces into the room, back against the wall at z = 0 -----
const COL9 = { wood: [0.42, 0.29, 0.18], wood2: [0.55, 0.4, 0.26], dark: [0.12, 0.11, 0.1], white: [0.82, 0.81, 0.77], metal: [0.46, 0.47, 0.48], steel: [0.36, 0.38, 0.4], olive: [0.33, 0.36, 0.26], meg: [0.78, 0.46, 0.12] };
const FABRIC = [[0.36, 0.22, 0.2], [0.24, 0.3, 0.36], [0.4, 0.36, 0.26], [0.28, 0.32, 0.24], [0.45, 0.4, 0.38]];
function legs4(B, r, w, d, h, col, z0 = 0, t = 0.04) { for (const sx of [-1, 1]) for (const sz of [0, 1]) B.add(r, 'Box', { width: t, height: h, depth: t }, col, 0, [sx * (w / 2 - t), h / 2, z0 + (sz ? d - t : t)]); }
const FURN = {
  sofa: { w: 2.0, d: 0.9, deep: false, fn(B, r, o) { const c = pick(FABRIC), c2 = c.map(v => v * 1.12);
    if (!B.mdl('sofa', r, [0, 0, 0.45], null, 1.08)) {   // r5: scanned chesterfield (Poly Haven sofa_02)
      B.add(r, 'Box', { width: 2.0, height: 0.42, depth: 0.85 }, c, 0, [0, 0.21, 0.45]); B.add(r, 'Box', { width: 2.0, height: 0.5, depth: 0.2 }, c, 0, [0, 0.64, 0.12]);
      for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.2, height: 0.62, depth: 0.85 }, c, 0, [s * 0.9, 0.31, 0.45]);
      for (let i = -1; i <= 1; i++) B.add(r, 'Box', { width: 0.52, height: 0.12, depth: 0.6 }, c2, 0, [i * 0.53, 0.47, 0.5], [0.04, 0, 0]);
    }
    if (o.deepOk && RNG() < 0.6) { B.add(r, 'Box', { width: 1.0, height: 0.05, depth: 0.55 }, COL9.wood, 0, [0, 0.42, 1.45]); legs4(B, r, 1.0, 0.55, 0.4, COL9.wood, 1.18); return 1.75; } return 0.9; } },
  tv: { w: 1.1, d: 0.5, fn(B, r, o) { B.add(r, 'Box', { width: 1.1, height: 0.5, depth: 0.45 }, COL9.wood, 0, [0, 0.25, 0.23]);
    const m = B.mdl('crt', r, [0, 0.5, 0.26], null, 1.1), sp = m ? [0.073, 0.785, 0.503] : [0, 0.79, 0.505];   // r5: scanned CRT set (screen centre / glass bulge scaled 1.1)
    if (!m) B.add(r, 'Box', { width: 0.66, height: 0.54, depth: 0.5 }, [0.16, 0.15, 0.14], 0, [0, 0.78, 0.25]);
    const on = o && o.static && W9.scrMat;
    if (on) { const s = part('Plane', m ? { width: 0.4, height: 0.3 } : { width: 0.5, height: 0.38 }, r, W9.scrMat, [1, 1, 1], 0, sp, [0, Math.PI, 0]); s.parent = null; const wp = localPt(r, sp[0], sp[1], sp[2]); s.position.copyFrom(wp); s.rotation.set(0, r.rotation.y + Math.PI, 0); const f = localPt(r, 0, 0, 1.0); W.tvs.push({ x: f.x, z: f.z, seed: RNG() * 10 }); }
    else if (!m) B.add(r, 'Box', { width: 0.52, height: 0.4, depth: 0.01 }, [0.05, 0.06, 0.07], 0, [0, 0.79, 0.505]); return 0.5; } },
  armchair: { w: 0.9, d: 0.85, fn(B, r) { const c = pick(FABRIC), g = c === FABRIC[3];   // r5: scanned armchairs - the green one as is, the grey one dyed to the fabric
    if (B.mdl(g ? 'gchair' : 'armchair', r, [0, 0, 0.39], null, g ? 1.05 : 1, g ? null : c.map(v => Math.min(1, v * 1.9)))) return 0.85;
    B.add(r, 'Box', { width: 0.85, height: 0.42, depth: 0.8 }, c, 0, [0, 0.21, 0.42]); B.add(r, 'Box', { width: 0.85, height: 0.5, depth: 0.18 }, c, 0, [0, 0.66, 0.1]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.15, height: 0.6, depth: 0.8 }, c, 0, [s * 0.36, 0.3, 0.42]); return 0.85; } },
  lamp: { w: 0.4, d: 0.4, fn(B, r) { B.add(r, 'Cylinder', { diameter: 0.3, height: 0.03, tessellation: 12 }, COL9.dark, 0, [0, 0.015, 0.25]); B.add(r, 'Cylinder', { diameter: 0.03, height: 1.45, tessellation: 6 }, COL9.metal, 0, [0, 0.73, 0.25]); B.add(r, 'Cylinder', { diameterTop: 0.22, diameterBottom: 0.38, height: 0.3, tessellation: 12 }, [0.8, 0.72, 0.56], 0, [0, 1.5, 0.25]); return 0.45; } },
  counter: { w: 2.4, d: 0.62, fn(B, r, o) { const cab = pick([[0.62, 0.52, 0.38], [0.78, 0.76, 0.7], [0.45, 0.5, 0.42]]);
    B.add(r, 'Box', { width: 2.4, height: 0.86, depth: 0.58 }, cab, 0, [0, 0.43, 0.29]); B.add(r, 'Box', { width: 2.44, height: 0.04, depth: 0.63 }, [0.7, 0.68, 0.6], 0, [0, 0.88, 0.315]);
    for (let i = 0; i < 4; i++) { B.add(r, 'Box', { width: 0.012, height: 0.7, depth: 0.01 }, COL9.dark, 0, [-0.9 + i * 0.6, 0.45, 0.585]); B.add(r, 'Box', { width: 0.1, height: 0.02, depth: 0.03 }, COL9.metal, 0, [-1.05 + i * 0.6 + 0.3, 0.72, 0.6]); }
    B.add(r, 'Box', { width: 0.6, height: 0.02, depth: 0.4 }, [0.3, 0.31, 0.32], 0, [0.4, 0.9, 0.3]); B.add(r, 'Cylinder', { diameter: 0.03, height: 0.3, tessellation: 6 }, COL9.metal, 0, [0.4, 1.04, 0.1]);
    if (!o.win) B.add(r, 'Box', { width: 2.4, height: 0.7, depth: 0.34 }, cab, 0, [0, 1.8, 0.17]);
    for (let i = 0; i < 3; i++) if (RNG() < 0.5) B.add(r, 'Cylinder', { diameter: 0.1, height: rnd(0.08, 0.25), tessellation: 8 }, pick([COL9.white, [0.6, 0.3, 0.2], [0.3, 0.4, 0.5]]), 0, [rnd(-1, 1), 0.98, rnd(0.2, 0.45)]); return 0.62; } },
  fridge: { w: 0.8, d: 0.72, tall: true, fn(B, r) { B.add(r, 'Box', { width: 0.78, height: 1.78, depth: 0.7 }, [0.84, 0.83, 0.78], 0, [0, 0.89, 0.35]); B.add(r, 'Box', { width: 0.79, height: 0.01, depth: 0.71 }, COL9.dark, 0, [0, 1.2, 0.35]); B.add(r, 'Box', { width: 0.03, height: 0.5, depth: 0.04 }, COL9.metal, 0, [0.3, 1.45, 0.72]); B.add(r, 'Box', { width: 0.03, height: 0.3, depth: 0.04 }, COL9.metal, 0, [0.3, 0.95, 0.72]); return 0.72; } },
  stove: { w: 0.76, d: 0.64, fn(B, r) { B.add(r, 'Box', { width: 0.76, height: 0.9, depth: 0.62 }, [0.8, 0.79, 0.74], 0, [0, 0.45, 0.31]); B.add(r, 'Box', { width: 0.74, height: 0.01, depth: 0.6 }, COL9.dark, 0, [0, 0.905, 0.31]); for (const a of [-1, 1]) for (const b of [0, 1]) B.add(r, 'Cylinder', { diameter: 0.18, height: 0.012, tessellation: 12 }, [0.2, 0.2, 0.2], 0, [a * 0.18, 0.915, 0.18 + b * 0.26]); B.add(r, 'Box', { width: 0.76, height: 0.18, depth: 0.05 }, [0.8, 0.79, 0.74], 0, [0, 1.0, 0.03]); B.add(r, 'Box', { width: 0.56, height: 0.35, depth: 0.01 }, COL9.dark, 0, [0, 0.45, 0.625]); return 0.64; } },
  bed: { w: 1.55, d: 2.05, deep: true, fn(B, r) { const bl = pick(FABRIC);
    B.add(r, 'Box', { width: 1.5, height: 0.28, depth: 2.0 }, COL9.wood, 0, [0, 0.2, 1.02]); B.add(r, 'Box', { width: 1.44, height: 0.2, depth: 1.92 }, [0.78, 0.76, 0.7], 0, [0, 0.44, 1.02]);
    B.add(r, 'Box', { width: 1.48, height: 0.07, depth: 1.35 }, bl, 0, [0, 0.56, 1.35], [0.02, rnd(-0.05, 0.05), 0]); B.add(r, 'Box', { width: 0.55, height: 0.12, depth: 0.35 }, [0.85, 0.84, 0.8], 0, [-0.36, 0.6, 0.3]); B.add(r, 'Box', { width: 0.55, height: 0.12, depth: 0.35 }, [0.85, 0.84, 0.8], 0, [0.36, 0.6, 0.3]);
    B.add(r, 'Box', { width: 1.56, height: 0.95, depth: 0.07 }, COL9.wood, 0, [0, 0.48, 0.04]); return 2.05; } },
  night: { w: 0.45, d: 0.42, fn(B, r) { const m = B.mdl('nstand', r, [0, 0, 0.18], null, 0.8), y = m ? 0.01 : 0; if (!m) B.add(r, 'Box', { width: 0.45, height: 0.55, depth: 0.4 }, COL9.wood2, 0, [0, 0.275, 0.2]);
    B.add(r, 'Cylinder', { diameterTop: 0.14, diameterBottom: 0.22, height: 0.2, tessellation: 10 }, [0.82, 0.76, 0.6], 0, [0, 0.8 + y, 0.2]); B.add(r, 'Cylinder', { diameter: 0.02, height: 0.18, tessellation: 6 }, COL9.metal, 0, [0, 0.64 + y, 0.2]); return 0.42; } },
  dresser: { w: 1.2, d: 0.5, fn(B, r) { B.add(r, 'Box', { width: 1.2, height: 1.0, depth: 0.48 }, COL9.wood2, 0, [0, 0.5, 0.24]); for (let i = 0; i < 3; i++) { B.add(r, 'Box', { width: 1.1, height: 0.012, depth: 0.01 }, COL9.dark, 0, [0, 0.32 + i * 0.28, 0.485]); B.add(r, 'Box', { width: 0.14, height: 0.025, depth: 0.03 }, COL9.metal, 0, [0, 0.18 + i * 0.28, 0.5]); } return 0.5; } },
  desk: { w: 1.4, d: 0.75, fn(B, r) { B.add(r, 'Box', { width: 1.4, height: 0.04, depth: 0.7 }, COL9.wood, 0, [0, 0.74, 0.35]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.04, height: 0.72, depth: 0.66 }, COL9.wood, 0, [s * 0.66, 0.36, 0.35]);
    B.add(r, 'Box', { width: 0.44, height: 0.08, depth: 0.42 }, COL9.dark, 0, [0.15, 0.46, 1.0]); B.add(r, 'Box', { width: 0.42, height: 0.45, depth: 0.05 }, COL9.dark, 0, [0.15, 0.72, 1.2]); B.add(r, 'Cylinder', { diameter: 0.04, height: 0.42, tessellation: 6 }, COL9.metal, 0, [0.15, 0.21, 1.0]);
    for (let i = 0; i < 3; i++) B.add(r, 'Box', { width: 0.21, height: 0.004, depth: 0.29 }, [0.88, 0.86, 0.78], 0, [rnd(-0.5, 0.4), 0.763 + i * 0.004, rnd(0.2, 0.5)], [0, rnd(-0.5, 0.5), 0]); return 1.25; } },
  bookshelf: { w: 1.0, d: 0.35, tall: true, fn(B, r) { B.add(r, 'Box', { width: 1.0, height: 1.9, depth: 0.03 }, COL9.wood, 0, [0, 0.95, 0.015]); for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.03, height: 1.9, depth: 0.34 }, COL9.wood, 0, [s * 0.485, 0.95, 0.17]);
    for (let i = 0; i < 5; i++) { B.add(r, 'Box', { width: 0.96, height: 0.025, depth: 0.33 }, COL9.wood, 0, [0, 0.05 + i * 0.44, 0.17]); if (i < 4) { let x = -0.45; while (x < 0.42) { const w = rnd(0.025, 0.06), h = rnd(0.22, 0.34); if (RNG() < 0.85) B.add(r, 'Box', { width: w, height: h, depth: 0.22 }, pick([[0.5, 0.15, 0.12], [0.15, 0.25, 0.4], [0.2, 0.35, 0.2], [0.6, 0.55, 0.4], [0.1, 0.1, 0.1]]), 0, [x + w / 2, 0.065 + i * 0.44 + h / 2, 0.15]); x += w + 0.004; } } }
    return 0.35; } },
  tub: { w: 1.7, d: 0.78, fn(B, r) { B.add(r, 'Box', { width: 1.7, height: 0.55, depth: 0.76 }, [0.86, 0.86, 0.84], 0, [0, 0.275, 0.38]); B.add(r, 'Box', { width: 1.5, height: 0.02, depth: 0.56 }, [0.5, 0.52, 0.5], 0, [0, 0.54, 0.38]); B.add(r, 'Cylinder', { diameter: 0.03, height: 0.25, tessellation: 6 }, COL9.metal, 0, [0.7, 0.8, 0.06]); return 0.78; } },
  toilet: { w: 0.5, d: 0.72, fn(B, r) { B.add(r, 'Box', { width: 0.42, height: 0.38, depth: 0.18 }, [0.88, 0.88, 0.86], 0, [0, 0.62, 0.1]); B.add(r, 'Cylinder', { diameterTop: 0.4, diameterBottom: 0.3, height: 0.4, tessellation: 14 }, [0.88, 0.88, 0.86], 0, [0, 0.2, 0.42]); B.add(r, 'Cylinder', { diameter: 0.42, height: 0.03, tessellation: 14 }, [0.9, 0.9, 0.88], 0, [0, 0.415, 0.44]); return 0.7; } },
  sinkc: { w: 0.65, d: 0.5, fn(B, r) { B.add(r, 'Box', { width: 0.62, height: 0.82, depth: 0.46 }, COL9.white, 0, [0, 0.41, 0.23]); B.add(r, 'Box', { width: 0.46, height: 0.02, depth: 0.3 }, [0.5, 0.52, 0.52], 0, [0, 0.83, 0.25]); B.add(r, 'Box', { width: 0.5, height: 0.7, depth: 0.02 }, [0.22, 0.25, 0.27], 0, [0, 1.5, 0.012]); return 0.5; } },
  sidet: { w: 1.0, d: 0.4, fn(B, r) { B.add(r, 'Box', { width: 1.0, height: 0.04, depth: 0.38 }, COL9.wood2, 0, [0, 0.8, 0.19]); legs4(B, r, 1.0, 0.38, 0.78, COL9.wood2); if (RNG() < 0.6) B.add(r, 'Box', { width: 0.22, height: 0.28, depth: 0.03 }, COL9.dark, 0, [rnd(-0.3, 0.3), 0.96, 0.08], [-0.2, 0, 0]); return 0.4; } },
  coat: { w: 0.5, d: 0.5, fn(B, r) { B.add(r, 'Cylinder', { diameter: 0.04, height: 1.75, tessellation: 6 }, COL9.wood, 0, [0, 0.88, 0.25]); B.add(r, 'Cylinder', { diameter: 0.36, height: 0.03, tessellation: 10 }, COL9.wood, 0, [0, 0.02, 0.25]); B.add(r, 'Box', { width: 0.34, height: 0.8, depth: 0.2 }, pick(FABRIC).map(v => v * 0.6), 0, [0.06, 1.28, 0.3], [0, 0, 0.1]); return 0.5; } },
  mshelf: { w: 2.0, d: 0.5, tall: true, fn(B, r) {   // r5: two scanned steel-frame shelving units (boards at 0.12 / 0.60 / 1.08 / 1.55 m) stocked with scanned boxes
    const m = !!B.mdl('sshelf', r, [-0.5, 0, 0.25], null, [0.91, 0.94, 1]); if (m) B.mdl('sshelf', r, [0.5, 0, 0.25], null, [0.91, 0.94, 1]);
    if (!m) for (const sx of [-1, 1]) for (const sz of [0, 1]) B.add(r, 'Box', { width: 0.04, height: 2.0, depth: 0.04 }, COL9.steel, 0, [sx * 0.97, 1.0, 0.03 + sz * 0.44]);
    const BOXC = [[0.52, 0.4, 0.24], [0.33, 0.36, 0.26], [0.6, 0.58, 0.5]], BOXT = [[1, 1, 1], [0.66, 0.86, 0.95], [1.12, 1.3, 1.5]], CB = [0.384, 0.342, 0.516];
    for (let i = 0; i < 4; i++) { const y0 = m ? [0.122, 0.6, 1.08, 1.55][i] : 0.165 + i * 0.58; if (!m) B.add(r, 'Box', { width: 2.0, height: 0.03, depth: 0.5 }, COL9.steel, 0, [0, 0.15 + i * 0.58, 0.25]);
      let x = -0.9; while (x < 0.8) { const w = rnd(0.25, 0.5); if (RNG() < 0.7) { const h = rnd(0.18, 0.4), d = rnd(0.3, 0.42), c = pick(BOXC);
        const a = [(w - 0.03) / CB[0], h / CB[1], d / CB[2]], s = Math.cbrt(a[0] * a[1] * a[2]), sc = a.map(v => Math.min(v, s * 1.18));
        if (!(m && B.mdl('cbox', r, [x + w / 2, y0, 0.25], [0, (i + x * 7) % 2 < 1 ? 0 : Math.PI, 0], sc, BOXT[BOXC.indexOf(c)]))) B.add(r, 'Box', { width: w - 0.03, height: h, depth: d }, c, 0, [x + w / 2, y0 + h / 2, 0.25]); } x += w; } }
    return 0.5; } },
  radiod: { w: 2.0, d: 0.8, fn(B, r) { B.add(r, 'Box', { width: 2.0, height: 0.05, depth: 0.78 }, COL9.olive, 0, [0, 0.76, 0.39]); legs4(B, r, 2.0, 0.78, 0.74, COL9.steel);
    for (let i = 0; i < 3; i++) { const x = -0.65 + i * 0.65; B.add(r, 'Box', { width: 0.5, height: 0.26, depth: 0.36 }, [0.22, 0.24, 0.2], 0, [x, 0.92, 0.25]); B.add(r, 'Box', { width: 0.44, height: 0.16, depth: 0.01 }, [0.1, 0.1, 0.1], 0, [x, 0.93, 0.435]); for (let k = 0; k < 3; k++) B.add(r, 'Sphere', { diameter: 0.018, segments: 4 }, pick([[1, 0.2, 0.1], [0.2, 1, 0.3], [1, 0.7, 0.1]]), RNG() < 0.6 ? 1 : 0, [x - 0.15 + k * 0.06, 1.03, 0.44]); }
    B.add(r, 'Box', { width: 0.04, height: 0.4, depth: 0.04 }, COL9.dark, 0, [0.9, 1.0, 0.1]); return 0.8; } },
  filing: { w: 0.5, d: 0.62, tall: true, fn(B, r) { B.add(r, 'Box', { width: 0.48, height: 1.32, depth: 0.6 }, [0.44, 0.46, 0.42], 0, [0, 0.66, 0.3]); for (let i = 0; i < 4; i++) { B.add(r, 'Box', { width: 0.44, height: 0.01, depth: 0.01 }, COL9.dark, 0, [0, 0.33 * i + 0.33, 0.605]); B.add(r, 'Box', { width: 0.12, height: 0.025, depth: 0.03 }, COL9.metal, 0, [0, 0.33 * i + 0.2, 0.615]); } return 0.62; } },
  bunk: { w: 2.0, d: 0.95, tall: true, fn(B, r) { for (const sx of [-1, 1]) for (const sz of [0, 1]) B.add(r, 'Box', { width: 0.05, height: 1.75, depth: 0.05 }, COL9.olive, 0, [sx * 0.97, 0.875, 0.04 + sz * 0.86]);
    for (const y of [0.35, 1.3]) { B.add(r, 'Box', { width: 1.98, height: 0.06, depth: 0.9 }, COL9.olive, 0, [0, y, 0.47]); B.add(r, 'Box', { width: 1.9, height: 0.12, depth: 0.84 }, [0.5, 0.5, 0.42], 0, [0, y + 0.09, 0.47]); B.add(r, 'Box', { width: 1.2, height: 0.05, depth: 0.86 }, [0.3, 0.33, 0.24], 0, [0.3, y + 0.17, 0.47]); }
    return 0.95; } },
  lockers: { w: 1.2, d: 0.5, tall: true, fn(B, r) { for (let i = 0; i < 3; i++) { B.add(r, 'Box', { width: 0.39, height: 1.85, depth: 0.48 }, [0.34, 0.4, 0.36], 0, [-0.4 + i * 0.4, 0.925, 0.24]); for (let k = 0; k < 4; k++) B.add(r, 'Box', { width: 0.2, height: 0.012, depth: 0.01 }, COL9.dark, 0, [-0.4 + i * 0.4, 1.6 + k * 0.04, 0.485]); } return 0.5; } },
  reception: { w: 2.2, d: 0.8, fn(B, r) { B.add(r, 'Box', { width: 2.2, height: 1.05, depth: 0.2 }, [0.5, 0.46, 0.38], 0, [0, 0.525, 0.7]); B.add(r, 'Box', { width: 2.2, height: 0.05, depth: 0.8 }, COL9.wood, 0, [0, 0.76, 0.4]); B.add(r, 'Box', { width: 0.45, height: 0.35, depth: 0.4 }, [0.62, 0.6, 0.52], 0, [-0.5, 0.96, 0.3]); B.add(r, 'Box', { width: 0.36, height: 0.26, depth: 0.01 }, [0.05, 0.12, 0.06], 0.3, [-0.5, 0.98, 0.505]); return 0.8; } },
  bench: { w: 1.6, d: 0.45, fn(B, r) { B.add(r, 'Box', { width: 1.6, height: 0.05, depth: 0.42 }, COL9.wood, 0, [0, 0.45, 0.22]); legs4(B, r, 1.6, 0.42, 0.44, COL9.steel); return 0.45; } },
};
// centre pieces (built around the local origin, not against a wall)
const CFURN = {
  dtable: { hw: 1.25, hd: 0.95, fn(B, r) { const W2 = pick([COL9.wood, COL9.wood2, [0.3, 0.2, 0.13]]);
    B.add(r, 'Box', { width: 1.8, height: 0.05, depth: 0.95 }, W2, 0, [0, 0.76, 0]); legs4(B, r, 1.8, 0.95, 0.74, W2, -0.475);
    const chair = (x, z, ry) => { const p = localPt(r, x, 0, z), q = propRoot(p.x, p.z, r.rotation.y + ry);
      B.add(q, 'Box', { width: 0.44, height: 0.05, depth: 0.44 }, W2, 0, [0, 0.46, 0]); legs4(B, q, 0.44, 0.44, 0.45, W2, -0.22, 0.035); B.add(q, 'Box', { width: 0.44, height: 0.5, depth: 0.04 }, W2, 0, [0, 0.72, -0.2]); };
    for (const x of [-0.5, 0.5]) { chair(x, -0.72, 0); chair(x, 0.72, Math.PI); } chair(-1.12, 0, Math.PI / 2); chair(1.12, 0, -Math.PI / 2);
    if (RNG() < 0.7) B.add(r, 'Cylinder', { diameter: 0.28, height: 0.1, tessellation: 12 }, [0.8, 0.78, 0.72], 0, [0, 0.83, 0]); } },
  island: { hw: 1.0, hd: 0.8, fn(B, r) { const cab = pick([[0.62, 0.52, 0.38], [0.78, 0.76, 0.7], [0.45, 0.5, 0.42]]);
    B.add(r, 'Box', { width: 1.8, height: 0.86, depth: 0.8 }, cab, 0, [0, 0.43, 0]); B.add(r, 'Box', { width: 1.9, height: 0.04, depth: 0.95 }, [0.7, 0.68, 0.6], 0, [0, 0.88, 0.05]);
    for (const x of [-0.5, 0.2]) { B.add(r, 'Cylinder', { diameter: 0.34, height: 0.05, tessellation: 10 }, COL9.dark, 0, [x, 0.7, 0.72]); B.add(r, 'Cylinder', { diameter: 0.05, height: 0.68, tessellation: 6 }, COL9.metal, 0, [x, 0.35, 0.72]); }
    if (RNG() < 0.6) B.add(r, 'Cylinder', { diameter: 0.3, height: 0.12, tessellation: 12 }, [0.55, 0.2, 0.12], 0, [0.5, 0.96, -0.1]); } },
  ktable: { hw: 0.85, hd: 0.85, fn(B, r) { B.add(r, 'Cylinder', { diameter: 1.05, height: 0.04, tessellation: 18 }, COL9.wood2, 0, [0, 0.75, 0]); B.add(r, 'Cylinder', { diameter: 0.1, height: 0.73, tessellation: 8 }, COL9.wood2, 0, [0, 0.37, 0]);
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.5, p = localPt(r, Math.sin(a) * 0.72, 0, Math.cos(a) * 0.72), q = propRoot(p.x, p.z, r.rotation.y + a + Math.PI);
      B.add(q, 'Box', { width: 0.42, height: 0.05, depth: 0.42 }, COL9.wood2, 0, [0, 0.46, 0]); legs4(B, q, 0.42, 0.42, 0.45, COL9.wood2, -0.21, 0.035); B.add(q, 'Box', { width: 0.42, height: 0.45, depth: 0.04 }, COL9.wood2, 0, [0, 0.7, -0.19]); } } },
  rug: { hw: 0, hd: 0, fn(B, r) { B.add(r, 'Box', { width: 2.2, height: 0.008, depth: 1.6 }, pick(FABRIC).map(v => v * 0.8), 0, [0, 0.004, 0]); } },
};
function placeCentre(B, r, kind) {
  const F = CFURN[kind], cs = shuffle(r.cells.filter(c => !W9.busy.has(c)));
  let best = null, bs = -1;
  for (const c of cs) { const x = c % N, y = (c / N) | 0; let sc = 0; for (let d = 0; d < 4; d++) { const e = edgeVal(x, y, d); if (e === 1) sc += 1; if (e === 2) sc -= 3; } if (sc > bs) { bs = sc; best = c; } }
  if (best === null) return false;
  W9.busy.add(best);
  const x = cellCenter(best % N) + rnd(-0.15, 0.15), z = cellCenter((best / N) | 0) + rnd(-0.15, 0.15), root = propRoot(x, z, RNG() < 0.5 ? 0 : Math.PI / 2);
  F.fn(B, root); if (F.hw) solidLocal(root, -F.hw, -F.hd, F.hw, F.hd);
  return true;
}
const ROOMC = { dining: ['dtable'], kitchen: ['island', 'ktable'], living: ['rug'], family: ['rug'] };
const ROOMF = {
  living: ['sofa', 'tv', 'armchair', 'lamp', 'bookshelf', 'armchair'], family: ['sofa', 'tv', 'bookshelf', 'lamp', 'armchair'], dining: ['sidet', 'dresser', 'lamp', 'bookshelf'],
  kitchen: ['counter', 'fridge', 'stove', 'counter', 'counter', 'sinkc'], bed: ['bed', 'dresser', 'night', 'night', 'bookshelf'],
  study: ['desk', 'bookshelf', 'bookshelf', 'filing'], bath: ['tub', 'toilet', 'sinkc'], hall: ['sidet', 'coat', 'bookshelf'],
  storage: ['mshelf', 'mshelf', 'mshelf', 'mshelf'], radio: ['radiod', 'radiod', 'radiod', 'filing', 'filing'], bunks: ['bunk', 'bunk', 'bunk', 'bunk', 'lockers', 'lockers'],
  office: ['desk', 'filing', 'filing', 'mshelf'], lobby: ['reception', 'bench', 'bench'],
};
// wall slots of a room; `need(slot)` filters. Each cell side holds one object, each cell at most two.
function roomSlots(r) {
  const out = [];
  for (const c of r.cells) {
    if (W9.busy.has(c)) continue; const x = c % N, y = (c / N) | 0;
    for (let d = 0; d < 4; d++) if (edgeVal(x, y, d) === 1 && !LV.ek.has(eKey(x, y, d))) {
      const open = [0, 1, 2, 3].map(k => edgeVal(x, y, k) !== 1), door = [0, 1, 2, 3].some(k => edgeVal(x, y, k) === 2);
      out.push({ c, x, y, d, win: W9.win.has(eKey(x, y, d)), deepOk: !(open[(d + 1) % 4] && open[(d + 3) % 4]) && !door });
    }
  }
  return shuffle(out);
}
function slotFree(s) { const u = W9.used.get(s.c) || []; return u.length < 2 && !u.includes(s.d); }
function useSlot(s) { const u = W9.used.get(s.c) || []; u.push(s.d); W9.used.set(s.c, u); }
function placeFurn(B, r, keys, o = {}) {
  const slots = roomSlots(r);
  for (const k of keys) {
    const F = FURN[k];
    const s = slots.find(s => slotFree(s) && (!F.tall || !s.win) && (!F.deep || s.deepOk));
    if (!s) continue; useSlot(s);
    const [px, pz, ry] = wallPt(s.x, s.y, s.d, 0.01, rnd(-0.25, 0.25) * (F.w < 1.6 ? 1 : 0.3));
    const root = propRoot(px, pz, ry), dd = F.fn(B, root, { win: s.win, deepOk: s.deepOk, static: o.static && k === 'tv' });
    solidLocal(root, -F.w / 2, 0, F.w / 2, dd || F.d);
  }
}

// ----- scene -----
async function buildWorld9(progress) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0.01, 0.012, 0.018, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 85; CAM.fov = 1.0;
  resetW9();
  progress(0.06, 'SURVEYING LEVEL 9…'); await nextFrame();
  genLayout9(); planWindows9(); collectPieces9(); planLights9();   // r6: windows decided before the walls are cut
  const T = {};
  progress(0.14, 'PAVING THE STREETS…'); await nextFrame();
  for (const k of ['asph', 'grass', 'conc']) T[k] = TEX9[k](SCN, 512);
  progress(0.26, 'NAILING UP SIDING…'); await nextFrame();
  for (const k of ['siding', 'roof', 'block']) T[k] = TEX9[k](SCN, 512);
  progress(0.36, 'PAPERING THE WALLS…'); await nextFrame();
  for (const k of ['wood', 'tile', 'paper']) T[k] = TEX9[k](SCN, 512);
  T.ceil = genCeiling(SCN, 512);
  progress(0.48, 'WIRING STREET LAMPS…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  progress(0.62, 'RAISING HOUSES…'); await nextFrame();
  const fm = new BABYLON.ShaderMaterial('fixMat', SCN, { vertex: 'fix', fragment: 'fix' }, { attributes: ['position', 'uv', 'color'], uniforms: ['world', 'viewProjection', ...COMMON_UNIFORMS], samplers: ['lightTex'] });
  fm.setTexture('lightTex', LV.lightTex); MATS.list.push(fm);
  const mats = {
    asph: envMat9('asph', ['MAT_ASPH'], T.asph), grass: envMat9('grass', ['MAT_GRASS'], T.grass), conc: envMat9('conc', ['MAT_CONC'], T.conc),
    siding: envMat9('siding', ['MAT_SIDING'], T.siding), wallin: envMat9('wallin', ['MAT_WALLIN'], T.paper), labwall: envMat9('labwall', ['MAT_LABWALL'], T.block),
    block: envMat9('block', ['MAT_BLOCK'], T.block), fence: envMat9('fence9', ['MAT_FENCE', 'ROTUV'], T.wood), case: envMat9('case', ['MAT_CASE'], T.conc),
    floor: envMat9('floor9', ['MAT_WOOD'], T.wood), tile: envMat9('tile', ['MAT_TILE'], T.tile), plaster: envMat9('plaster', ['MAT_PLASTER'], T.conc),
    ceil: envMat9('ceil9', ['MAT_CEIL'], T.ceil), roof: envMat9('roof', ['MAT_ROOF', 'SKY1'], T.roof), fixture: fm };
  W9.chainMat = envMat9('chain', ['MAT_CHAIN', 'TWOSIDE'], T.conc, { twoSided: true });
  buildGeometry9(SCN, mats);
  progress(0.74, 'PARKING CARS…'); await nextFrame();
  buildProps9();
  progress(0.84, 'HANGING DOORS…'); await nextFrame();
  buildDoors9(); buildStory9(); buildItems9(G.diff); buildDust();
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.94, 'SPOOLING TAPE…'); await nextFrame();
}

// ----- outdoor & household props -----
function buildProps9() {
  const mat = actMat('props9', { spec: 0.2, shin: 16, wrinkle: 0.2, emis: 1, wrap: 0.35, mottle: 0.35 }), B = new PropBatch(mat); B.fast = true;
  W9.propMat = mat;
  const scrMat = actMat('screen', { frag: 'scr' }); scrMat.setVector4('aTint', new BABYLON.Vector4(1, 1, 1, 1)); W.scrMat = W9.scrMat = scrMat;
  const lensOn = actMat('lensOn', { emis: 1 }), lensFl = actMat('lensFl', { emis: 1 }); setEmi(lensOn, 4.2); W9.lensFl = lensFl;
  const BOn = new PropBatch(lensOn), BFl = new PropBatch(lensFl); BOn.fast = BFl.fast = true; const cones = new PropBatch(coneMat('cones', [1, 0.62, 0.3, 0.075]));
  // street lamps
  for (const L of LV.lamps) {
    const r = propRoot(L.x, L.z, Math.atan2(L.hx - L.x, L.hz - L.z)), a = Math.hypot(L.hx - L.x, L.hz - L.z), PC = [0.22, 0.24, 0.23];
    B.add(r, 'Cylinder', { diameterTop: 0.09, diameterBottom: 0.15, height: 5.0, tessellation: 8 }, PC, 0, [0, 2.5, 0]);
    B.add(r, 'Cylinder', { diameter: 0.26, height: 0.55, tessellation: 8 }, PC, 0, [0, 0.27, 0]);
    B.add(r, 'Box', { width: 0.06, height: 0.06, depth: a + 0.05 }, PC, 0, [0, 4.97, a / 2], [-0.06, 0, 0]);
    B.add(r, 'Box', { width: 0.34, height: 0.13, depth: 0.62 }, [0.28, 0.28, 0.27], 0, [0, 4.9, a]);
    const lb = L.state === 1 ? BOn : L.state === 2 ? BFl : B;
    lb.add(r, 'Box', { width: 0.26, height: 0.03, depth: 0.5 }, L.state ? [1, 0.72, 0.42] : [0.1, 0.1, 0.1], L.state ? 1 : 0, [0, 4.83, a]);
    if (L.state) cones.add(r, 'Cylinder', { diameterTop: 0.34, diameterBottom: 5.2, height: 4.75, tessellation: 18, cap: BABYLON.Mesh.NO_CAP }, [L.state === 2 ? 1 : 0, 4.85, 1], 1, [0, 4.8 - 4.75 / 2, a]);
    addSolid(L.x - 0.13, L.z - 0.13, L.x + 0.13, L.z + 0.13, 'prop');
  }
  // houses: windows (both storeys), porches, walks, mailboxes, cars
  const TRIM = [0.86, 0.85, 0.8];
  buildWindows9(B, TRIM);   // r6: real openings on enterable ground floors, portals upstairs (windows9.js)
  for (const h of LV.houses) {
    // porch, step, walk, porch light, mailbox
    const f = h.front, [fx, fz] = edgeMid(f.x, f.y, f.d), ox = DX[f.d], oz = DY[f.d], ry = Math.atan2(ox, oz);
    const pr = propRoot(fx + ox * WT / 2, fz + oz * WT / 2, ry), CON = [0.55, 0.54, 0.5];
    B.add(pr, 'Box', { width: 2.4, height: 0.16, depth: 1.4 }, CON, 0, [0, 0.08, 0.7]); B.add(pr, 'Box', { width: 1.2, height: 0.08, depth: 0.35 }, CON, 0, [0, 0.04, 1.55]);
    B.add(pr, 'Box', { width: 1.0, height: 0.02, depth: CELL - 1.6 }, CON.map(v => v * 0.9), 0, [0, 0.01, 1.6 + (CELL - 1.6) / 2]);
    B.add(pr, 'Box', { width: 0.12, height: 0.2, depth: 0.1 }, [0.15, 0.14, 0.12], 0, [0.85, 1.95, 0.05]);
    B.add(pr, 'Sphere', { diameter: 0.1, segments: 6 }, h.lit ? [1, 0.8, 0.5] : [0.3, 0.3, 0.28], h.lit ? 1 : 0, [0.85, 1.9, 0.12]);
    if (h.red) W9.red.push({ h, pos: localPt(pr, 0, 2.42, 0.18), root: pr });
    if (!h.enter) { B.add(pr, 'Box', { width: 1.1, height: 2.1, depth: 0.03 }, [0.22, 0.17, 0.12], 0, [0, 1.07, 0.015]); for (let i = 0; i < 4; i++) B.add(pr, 'Box', { width: 1.45, height: 0.16, depth: 0.03 }, [0.45, 0.35, 0.24].map(v => v * rnd(0.8, 1.1)), 0, [rnd(-0.05, 0.05), 0.35 + i * 0.5, 0.05], [0, 0, rnd(-0.25, 0.25)]); }
    for (const s of [-1, 1]) B.add(pr, 'Box', { width: 0.1, height: 2.3, depth: 0.1 }, TRIM, 0, [s * 1.1, 1.15, 1.3]);
    B.add(pr, 'Box', { width: 2.5, height: 0.1, depth: 1.46 }, TRIM, 0, [0, 2.35, 0.7]); B.add(pr, 'Box', { width: 2.6, height: 0.06, depth: 1.56 }, [0.3, 0.27, 0.25], 0, [0, 2.43, 0.72], [-0.12, 0, 0]);
    for (const s of [-1, 1]) addSolid(...(() => { const p = localPt(pr, s * 1.1, 0, 1.3); return [p.x - 0.07, p.z - 0.07, p.x + 0.07, p.z + 0.07]; })(), 'prop');
    const mb = localPt(pr, 1.35, 0, CELL - 0.35); const mr = propRoot(mb.x, mb.z, ry + Math.PI);
    B.add(mr, 'Cylinder', { diameter: 0.07, height: 1.05, tessellation: 6 }, COL9.wood, 0, [0, 0.52, 0]);
    B.add(mr, 'Box', { width: 0.2, height: 0.22, depth: 0.48 }, pick([[0.1, 0.1, 0.1], [0.5, 0.5, 0.52], [0.25, 0.2, 0.4]]), 0, [0, 1.12, 0]);
    B.add(mr, 'Box', { width: 0.02, height: 0.16, depth: 0.05 }, [0.7, 0.1, 0.08], 0, [0.11, 1.2, -0.12]);
    addSolid(mb.x - 0.12, mb.z - 0.12, mb.x + 0.12, mb.z + 0.12, 'prop');
    if (h.id % 3 === 1) { const gp = localPt(pr, -1.55, 0, 1.9), gr = propRoot(gp.x, gp.z, ry + 0.4 + (h.id % 5) * 0.25); if (B.mdl('gnome', gr, null, null, 1)) addSolid(gp.x - 0.13, gp.z - 0.13, gp.x + 0.13, gp.z + 0.13, 'prop'); }   // r5: a garden gnome watching the street
    // car on the driveway, a basketball hoop over some drives
    if (RNG() < 0.55) { const cz = (h.face === 3 ? h.hz + 1.0 : h.hz + 3.0) * CELL; buildCar(B, cellCenter(h.dcol), cz, RNG() < 0.5 ? 0 : Math.PI); }
    if (RNG() < 0.25) { const hz0 = h.face === 3 ? (h.hz + 2.9) * CELL : (h.hz + 1.1) * CELL, hx0 = cellCenter(h.dcol) + (h.dcol < h.hx ? -1.45 : 1.45), hr = propRoot(hx0, hz0, h.face === 3 ? Math.PI : 0);
      B.add(hr, 'Cylinder', { diameter: 0.1, height: 3.05, tessellation: 8 }, COL9.metal, 0, [0, 1.52, 0]); B.add(hr, 'Box', { width: 1.1, height: 0.75, depth: 0.04 }, [0.85, 0.85, 0.82], 0, [0, 3.2, 0.15]);
      B.add(hr, 'Torus', { diameter: 0.45, thickness: 0.02, tessellation: 12 }, [0.8, 0.3, 0.1], 0, [0, 2.95, 0.45]); addSolid(hx0 - 0.08, hz0 - 0.08, hx0 + 0.08, hz0 + 0.08, 'prop'); }
    // trash cans at the end of the drive
    if (RNG() < 0.6) { const tz = (h.face === 3 ? h.yardZ + 0.25 : h.yardZ + 0.75) * CELL, tx = cellCenter(h.dcol) + (h.dcol < h.hx ? -1.1 : 1.1); for (let i = 0; i < (RNG() < 0.5 ? 2 : 1); i++) { const tr = propRoot(tx, tz + i * 0.7, rnd(0, TAU)); if (!B.mdl('tcan', tr, null, null, 0.95)) { B.add(tr, 'Cylinder', { diameterTop: 0.62, diameterBottom: 0.52, height: 0.95, tessellation: 12 }, [0.2, 0.24, 0.2], 0, [0, 0.475, 0]); B.add(tr, 'Cylinder', { diameter: 0.66, height: 0.06, tessellation: 12 }, [0.18, 0.22, 0.18], 0, [0, 0.98, 0]); } addSolid(tx - 0.32, tz + i * 0.7 - 0.32, tx + 0.32, tz + i * 0.7 + 0.32, 'prop'); } }
    // back yard: swing set / barbecue / kiddie pool
    const byz = h.face === 3 ? cellCenter(h.hz + HS) : cellCenter(h.hz - 1), byx = cellCenter(h.hx + rndi(0, HS - 1)) + rnd(-0.6, 0.6), kb = RNG();
    if (!(h.back && Math.abs(byx - cellCenter(h.back.x)) < 1.8)) {
      if (kb < 0.3) { const r = propRoot(byx, byz, 0); for (const s of [-1, 1]) { B.add(r, 'Cylinder', { diameter: 0.06, height: 2.2, tessellation: 6 }, COL9.metal, 0, [s * 1.1, 1.05, -0.4], [0.35, 0, 0]); B.add(r, 'Cylinder', { diameter: 0.06, height: 2.2, tessellation: 6 }, COL9.metal, 0, [s * 1.1, 1.05, 0.4], [-0.35, 0, 0]); }
        B.add(r, 'Cylinder', { diameter: 0.07, height: 2.3, tessellation: 6 }, COL9.metal, 0, [0, 2.08, 0], [0, 0, Math.PI / 2]);
        for (const s of [-0.45, 0.45]) { for (const k of [-0.2, 0.2]) B.add(r, 'Box', { width: 0.015, height: 1.5, depth: 0.015 }, [0.3, 0.3, 0.3], 0, [s + k, 1.3, 0]); B.add(r, 'Box', { width: 0.5, height: 0.04, depth: 0.2 }, [0.6, 0.2, 0.15], 0, [s, 0.55, 0]); }
        addSolid(byx - 1.2, byz - 0.9, byx + 1.2, byz + 0.9, 'prop'); }
      else if (kb < 0.5) { const r = propRoot(byx, byz, rnd(0, TAU)); B.add(r, 'Cylinder', { diameter: 0.55, height: 0.35, tessellation: 12 }, COL9.dark, 0, [0, 0.8, 0]); for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; B.add(r, 'Cylinder', { diameter: 0.04, height: 0.75, tessellation: 5 }, COL9.dark, 0, [Math.sin(a) * 0.2, 0.37, Math.cos(a) * 0.2]); } addSolid(byx - 0.3, byz - 0.3, byx + 0.3, byz + 0.3, 'prop'); }
      else if (kb < 0.62) { const r = propRoot(byx, byz, 0); B.add(r, 'Cylinder', { diameter: 1.7, height: 0.28, tessellation: 18 }, [0.25, 0.45, 0.6], 0, [0, 0.14, 0]); B.add(r, 'Cylinder', { diameter: 1.5, height: 0.02, tessellation: 18 }, [0.08, 0.14, 0.13], 0, [0, 0.25, 0]); addSolid(byx - 0.85, byz - 0.85, byx + 0.85, byz + 0.85, 'prop'); }
    }
  }
  // fire hydrants on the sidewalk at block corners
  for (let bj = 0; bj < 3; bj++) for (let bi = 0; bi < 3; bi++) {
    if (bi === 1 && bj === 1) continue;
    const hx = L9_BLK[bi] * CELL - 0.55, hz = (L9_BLK[bj] + 1.5) * CELL + (RNG() < 0.5 ? 0 : 5 * CELL), r = propRoot(hx, hz, rnd(0, TAU)), RD = [0.62, 0.12, 0.08];
    if (!B.mdl('hydrant', r, null, null, 1)) { B.add(r, 'Cylinder', { diameter: 0.24, height: 0.62, tessellation: 10 }, RD, 0, [0, 0.31, 0]); B.add(r, 'Sphere', { diameter: 0.26, segments: 6 }, RD, 0, [0, 0.64, 0]);
      B.add(r, 'Cylinder', { diameter: 0.1, height: 0.42, tessellation: 8 }, RD, 0, [0, 0.42, 0], [0, 0, Math.PI / 2]); }
    addSolid(hx - 0.15, hz - 0.15, hx + 0.15, hz + 0.15, 'prop');
  }
  // trees & shrubs on lawns (never on paths in front of doors)
  const keep = new Set();
  for (const h of LV.houses) { const f = h.front; keep.add(cIdx(f.x + DX[f.d], f.y + DY[f.d])); if (h.back) keep.add(cIdx(h.back.x + DX[h.back.d], h.back.y + DY[h.back.d])); }
  keep.add(cIdx(1, 6)); keep.add(cIdx(2, 6));
  for (let y = 0; y < L9_NB; y++) for (let x = 0; x < L9_NB; x++) if (LV.zone[cIdx(x, y)] === ZN.DRIVE) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (inGrid(x + dx, y + dy)) keep.add(cIdx(x + dx, y + dy));
  for (let y = 0; y < L9_NB; y++) for (let x = 0; x < L9_NB; x++) {
    const c = cIdx(x, y), z = LV.zone[c];
    if ((z !== ZN.LAWN && z !== ZN.VERGE) || keep.has(c)) continue;
    const pr = z === ZN.VERGE ? 0.5 : 0.2;
    if (RNG() < pr) buildTree(B, cellCenter(x) + rnd(-1.1, 1.1), cellCenter(y) + rnd(-1.1, 1.1), RNG() < 0.3);
    else if (RNG() < 0.25) { const bx = cellCenter(x) + rnd(-1.2, 1.2), bz = cellCenter(y) + rnd(-1.2, 1.2), r = propRoot(bx, bz, 0); for (let i = 0; i < 3; i++) B.add(r, 'Sphere', { diameter: rnd(0.6, 1.0), segments: 5 }, [0.09, 0.13, 0.07].map(v => v * rnd(0.8, 1.3)), 0, [rnd(-0.3, 0.3), 0.3, rnd(-0.3, 0.3)]); addSolid(bx - 0.4, bz - 0.4, bx + 0.4, bz + 0.4, 'prop'); }
  }
  // cars parked along the curbs, the crashed M.E.G. van
  const streetCells = [];
  for (let y = 1; y < L9_NB - 1; y++) for (let x = 1; x < L9_NB - 1; x++) { if (LV.zone[cIdx(x, y)] !== ZN.STREET || (L9_ST.has(x) && L9_ST.has(y))) continue; streetCells.push([x, y]); }
  const alongX = (x, y) => L9_ST.has(y) && !L9_ST.has(x);      // street runs along x
  for (const [x, y] of streetCells) {
    if (RNG() > 0.08 || (x <= 2 && y < 10)) continue;
    const ax = alongX(x, y), first = L9_ST.has(ax ? y - 1 : x - 1) ? false : true;   // first cell of the pair -> park on its outer side
    const off = first ? -1.25 : 1.25;
    buildCar(B, ax ? cellCenter(x) : cellCenter(x) + off, ax ? cellCenter(y) + off : cellCenter(y), ax ? Math.PI / 2 + (RNG() < 0.5 ? 0 : Math.PI) : (RNG() < 0.5 ? 0 : Math.PI));
  }
  const vanC = shuffle(streetCells.filter(([x, y]) => Math.hypot(x - 2, y - 6) > 18 && Math.hypot(x - BX - 4.5, y - BX - 4.5) > 12 && !alongX(x, y)))[0] || [36, 30];
  { const [x, y] = vanC, vx = cellCenter(x) + 0.9, vz = cellCenter(y), ry = 0.35 + RNG() * 0.3, r = propRoot(vx, vz, ry), WH = [0.8, 0.8, 0.76];
    B.add(r, 'Box', { width: 2.1, height: 1.9, depth: 5.2 }, WH, 0, [0, 1.3, 0]); B.add(r, 'Box', { width: 2.12, height: 0.25, depth: 5.22 }, COL9.meg, 0, [0, 1.2, 0]);
    B.add(r, 'Box', { width: 2.0, height: 0.7, depth: 0.05 }, [0.04, 0.05, 0.06], 0, [0, 1.85, 2.61], [0.25, 0, 0]);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.add(r, 'Cylinder', { diameter: 0.72, height: 0.26, tessellation: 12 }, COL9.dark, 0, [sx * 0.95, 0.36, sz * 1.8], [0, 0, Math.PI / 2]);
    B.add(r, 'Box', { width: 0.6, height: 0.5, depth: 0.02 }, COL9.meg, 0, [1.06, 1.6, 0], [0, Math.PI / 2, 0]);
    for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.3, height: 0.12, depth: 0.03 }, [1, 0.9, 0.7], 0, [s * 0.75, 0.75, 2.6]);
    solidLocal(r, -1.1, -2.65, 1.1, 2.65);
    W9.van = { x: vx, z: vz, ry, root: r, cell: vanC };
  }
  // chain-link compound fence posts / rails (the mesh itself is a separate alpha-tested material)
  const cg = new Geo(true), post = (x, z) => { const r = propRoot(x, z, 0); B.add(r, 'Cylinder', { diameter: 0.07, height: 2.45, tessellation: 8 }, COL9.metal, 0, [0, 1.22, 0]); };
  for (const e0 of LV.ek.values()) {
    if (e0.kind !== 'chain') continue;
    const e = e0.d === 0 ? { x: e0.x + 1, y: e0.y, d: 2 } : e0.d === 1 ? { x: e0.x, y: e0.y + 1, d: 3 } : e0;
    const horiz = e.d === 3, c = horiz ? e.y * CELL : e.x * CELL, l0 = horiz ? e.x * CELL : e.y * CELL;
    if (horiz) { cg.face(l0, 0.06, c, [1, 0, 0], [0, 1, 0], CELL, 2.28, [0, 0, 1], 1, false, [1, 1, 1, 1]); post(l0, c); post(l0 + CELL, c); }
    else { cg.face(c, 0.06, l0, [0, 0, 1], [0, 1, 0], CELL, 2.28, [-1, 0, 0], 1, false, [1, 1, 1, 1]); post(c, l0); post(c, l0 + CELL); }
    const rr = propRoot(horiz ? l0 + CELL / 2 : c, horiz ? c : l0 + CELL / 2, horiz ? Math.PI / 2 : 0);
    B.add(rr, 'Cylinder', { diameter: 0.045, height: CELL, tessellation: 6 }, COL9.metal, 0, [0, 2.36, 0], [Math.PI / 2, 0, 0]);
    for (const k of [0, 1]) B.add(rr, 'Cylinder', { diameter: 0.012, height: CELL, tessellation: 4 }, [0.35, 0.35, 0.34], 0, [0.12 + k * 0.12, 2.5 + k * 0.12, 0], [Math.PI / 2, 0, 0]);
  }
  const chainMesh = cg.mesh('chain', SCN); chainMesh.material = W9.chainMat; chainMesh._sortD = 350;
  // cage bars in the lab
  for (const e0 of LV.ek.values()) {
    if (e0.kind !== 'bars') continue;
    const e = e0.d === 0 ? { x: e0.x + 1, y: e0.y, d: 2 } : e0.d === 1 ? { x: e0.x, y: e0.y + 1, d: 3 } : e0;
    const horiz = e.d === 3, c = horiz ? e.y * CELL : e.x * CELL, l0 = horiz ? e.x * CELL : e.y * CELL;
    for (let t = 0.1; t < CELL; t += 0.16) { const r = propRoot(horiz ? l0 + t : c, horiz ? c : l0 + t, 0); B.add(r, 'Cylinder', { diameter: 0.035, height: CEIL, tessellation: 6 }, [0.5, 0.52, 0.5], 0, [0, CEIL / 2, 0]); }
    for (const yy of [0.08, 1.1, CEIL - 0.1]) { const r = propRoot(horiz ? l0 + CELL / 2 : c, horiz ? c : l0 + CELL / 2, horiz ? Math.PI / 2 : 0); B.add(r, 'Box', { width: 0.06, height: 0.06, depth: CELL }, [0.45, 0.46, 0.44], 0, [0, yy, 0]); }
  }
  W9.B = B; W9.BOn = BOn; W9.BFl = BFl; W9.cones = cones;   // story builders add to the same batches before they are merged
  W9.finishProps = () => {
    const keep = [], out = [...(B.finish('props9', keep) || []), ...(BOn.finish('lensOn', keep) || []), ...(BFl.finish('lensFl', keep) || []), ...((W9.canBatch && W9.canBatch.finish('tanks', keep)) || [])];
    out.forEach(m => m._sortD = 300);
    (cones.finish('cones', keep) || []).forEach(m => { m._sortD = 2000; m.alwaysSelectAsActiveMesh = false; });
    new Set(keep).forEach(r => r && r.dispose && r.dispose());
  };
}
function buildCar(B, x, z, ry) {
  const r = propRoot(x, z, ry), c = pick([[0.36, 0.1, 0.09], [0.18, 0.24, 0.34], [0.58, 0.58, 0.56], [0.14, 0.14, 0.15], [0.4, 0.36, 0.25], [0.22, 0.3, 0.22]]), GL = [0.04, 0.05, 0.06];
  B.add(r, 'Box', { width: 1.74, height: 0.62, depth: 4.4 }, c, 0, [0, 0.62, 0]);
  B.add(r, 'Box', { width: 1.56, height: 0.56, depth: 2.2 }, c, 0, [0, 1.2, -0.25]);
  B.add(r, 'Box', { width: 1.58, height: 0.42, depth: 2.0 }, GL, 0, [0, 1.2, -0.25]);
  B.add(r, 'Box', { width: 1.5, height: 0.44, depth: 0.05 }, GL, 0, [0, 1.18, 0.88], [-0.45, 0, 0]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.add(r, 'Cylinder', { diameter: 0.64, height: 0.22, tessellation: 12 }, COL9.dark, 0, [sx * 0.8, 0.32, sz * 1.4], [0, 0, Math.PI / 2]);
  for (const s of [-1, 1]) { B.add(r, 'Box', { width: 0.3, height: 0.12, depth: 0.03 }, [0.8, 0.78, 0.7], 0, [s * 0.6, 0.72, 2.2]); B.add(r, 'Box', { width: 0.28, height: 0.1, depth: 0.03 }, [0.45, 0.04, 0.03], 0, [s * 0.62, 0.78, -2.2]); }
  B.add(r, 'Box', { width: 1.78, height: 0.14, depth: 0.12 }, COL9.metal, 0, [0, 0.42, 2.22]); B.add(r, 'Box', { width: 1.78, height: 0.14, depth: 0.12 }, COL9.metal, 0, [0, 0.42, -2.22]);
  solidLocal(r, -0.9, -2.25, 0.9, 2.25);
}
function buildTree(B, x, z, dead) {
  const r = propRoot(x, z, rnd(0, TAU)), TR = [0.2, 0.15, 0.11], h = rnd(2.2, 3.4);
  B.add(r, 'Cylinder', { diameterTop: 0.16, diameterBottom: 0.3, height: h, tessellation: 7 }, TR, 0, [0, h / 2, 0]);
  if (dead) { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + rnd(-0.3, 0.3), l = rnd(1.0, 1.8); B.add(r, 'Cylinder', { diameterTop: 0.03, diameterBottom: 0.1, height: l, tessellation: 5 }, TR, 0, [Math.sin(a) * l * 0.3, h - 0.3 + l * 0.35, Math.cos(a) * l * 0.3], [Math.cos(a) * 0.8, 0, -Math.sin(a) * 0.8]); } }
  else for (let i = 0; i < 4; i++) B.add(r, 'Sphere', { diameter: rnd(1.6, 2.6), segments: 5 }, [0.07, 0.1, 0.06].map(v => v * rnd(0.8, 1.35)), 0, [rnd(-0.6, 0.6), h + rnd(0.2, 1.3), rnd(-0.6, 0.6)]);
  addSolid(x - 0.2, z - 0.2, x + 0.2, z + 0.2, 'prop');
}
