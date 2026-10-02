// ---------- scene assembly, props, items, lighting slots, post-processing ----------
let ENG = null, CAM = null, PIPE = null, VHS = null;
const W = { interact: [], items: [], tapes: [], tvs: [], dead: [], beams: [] };
const FX = { t: 0, amt: 1, glitch: 0, nv: 0, hurt: 0, fadeB: 1, fadeW: 0, exposure: 1.2, san: 0, lightScale: 1, flicker: 1, fog: [0.1, 0.085, 0.045], fogDen: 0.03, ambBoost: 0, envA: [0.02, 0.018, 0.013, 0], envS: [0, 0, 0, 0] };
const SLOT = { pos: new Array(24).fill(0), dir: new Array(24).fill(0), col: new Array(24).fill(0), ext: new Array(24).fill(0) };
const SHD = new Array(32).fill(0);
function setSlot(i, p, I, d, cosC, c, range, shadow, att = 0.25) {
  SLOT.pos[i * 4] = p.x; SLOT.pos[i * 4 + 1] = p.y; SLOT.pos[i * 4 + 2] = p.z; SLOT.pos[i * 4 + 3] = I;
  SLOT.dir[i * 4] = d ? d.x : 0; SLOT.dir[i * 4 + 1] = d ? d.y : -1; SLOT.dir[i * 4 + 2] = d ? d.z : 0; SLOT.dir[i * 4 + 3] = d ? cosC : -2;
  SLOT.col[i * 4] = c[0]; SLOT.col[i * 4 + 1] = c[1]; SLOT.col[i * 4 + 2] = c[2];
  SLOT.ext[i * 4] = range; SLOT.ext[i * 4 + 1] = shadow ? 1 : 0; SLOT.ext[i * 4 + 2] = att;
}
function clearSlot(i) { SLOT.pos[i * 4 + 3] = 0; }
function setShadowCaster(i, x, z, r, s) { SHD[i * 4] = x; SHD[i * 4 + 1] = z; SHD[i * 4 + 2] = r; SHD[i * 4 + 3] = s; }

const _v4a = new BABYLON.Vector4(), _v4b = new BABYLON.Vector4(), _v4c = new BABYLON.Vector4(), _v4d = new BABYLON.Vector4(), _v4e = new BABYLON.Vector4();
function pushUniforms() {
  _v4a.set(LEVEL, FX.lightScale, FX.flicker, FX.t);
  _v4b.set(FX.fog[0], FX.fog[1], FX.fog[2], FX.fogDen);
  _v4c.set(FX.nv, FX.ambBoost, 0, 0);
  _v4d.set(FX.envA[0], FX.envA[1], FX.envA[2], FX.envA[3]); _v4e.set(FX.envS[0], FX.envS[1], FX.envS[2], FX.envS[3]);
  const cp = CAM.globalPosition;
  for (const m of MATS.list) {
    m.setVector4('envA', _v4d); m.setVector4('envS', _v4e);
    m.setVector4('lvl', _v4a); m.setVector3('camPos', cp); m.setVector4('fogP', _v4b); m.setVector4('misc', _v4c);
    m.setArray4('sPos', SLOT.pos); m.setArray4('sDir', SLOT.dir); m.setArray4('sCol', SLOT.col); m.setArray4('sExt', SLOT.ext); m.setArray4('shd', SHD);
  }
}

// ----- static prop builder (merged per material for few draw calls) -----
function PropBatch(mat) { this.mat = mat; this.parts = []; }
PropBatch.prototype.add = function (root, kind, opts, rgb, emis, pos, rot, scl, fn) {
  if (this.fast && kind === 'Box' && !scl && !fn && !opts.faceColors && !opts.faceUV) { this.box(root, opts, rgb, emis, pos, rot); return null; }
  const m = part(kind, opts, root, this.mat, rgb, emis, pos, rot, scl, fn); this.parts.push(m); return m;
};
// fast path: boxes are written straight into per-area vertex buffers instead of creating a mesh each
const _pbM = new BABYLON.Matrix(), _pbT = new BABYLON.Matrix(), _pbR = new BABYLON.Matrix(), _pbQ = new BABYLON.Matrix(), _pbA = [new BABYLON.Vector3(), new BABYLON.Vector3(), new BABYLON.Vector3(), new BABYLON.Vector3()];
PropBatch.prototype.box = function (root, o, rgb, emis, pos, rot) {
  const w = o.width ?? o.size ?? 1, h = o.height ?? o.size ?? 1, d = o.depth ?? o.size ?? 1;
  BABYLON.Matrix.RotationYawPitchRollToRef(rot ? rot[1] : 0, rot ? rot[0] : 0, rot ? rot[2] : 0, _pbR);
  BABYLON.Matrix.TranslationToRef(pos ? pos[0] : 0, pos ? pos[1] : 0, pos ? pos[2] : 0, _pbT);
  if (root && root !== this._lr) { root.computeWorldMatrix(true); this._lr = root; }
  _pbR.multiplyToRef(_pbT, root ? _pbQ : _pbM); if (root) _pbQ.multiplyToRef(root.getWorldMatrix(), _pbM);
  const C = BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(0, 0, 0, _pbM, _pbA[0]);
  const ex = BABYLON.Vector3.TransformNormalFromFloatsToRef(1, 0, 0, _pbM, _pbA[1]), ey = BABYLON.Vector3.TransformNormalFromFloatsToRef(0, 1, 0, _pbM, _pbA[2]), ez = BABYLON.Vector3.TransformNormalFromFloatsToRef(0, 0, 1, _pbM, _pbA[3]);
  const key = Math.floor(C.z / 28.8) * 64 + Math.floor(C.x / 28.8), g = (this.geos || (this.geos = new Map())).get(key) || (this.geos.set(key, new Geo(true)), this.geos.get(key));
  const X = [ex.x, ex.y, ex.z], Y = [ey.x, ey.y, ey.z], Z = [ez.x, ez.y, ez.z], hw = w / 2, hh = h / 2, hd = d / 2, col = [rgb[0], rgb[1], rgb[2], emis || 0];
  const O = (sx, sy, sz) => [C.x + X[0] * sx * hw + Y[0] * sy * hh + Z[0] * sz * hd, C.y + X[1] * sx * hw + Y[1] * sy * hh + Z[1] * sz * hd, C.z + X[2] * sx * hw + Y[2] * sy * hh + Z[2] * sz * hd];
  const neg = v => [-v[0], -v[1], -v[2]], F = (p, U, V, du, dv, N) => g.face(p[0], p[1], p[2], U, V, du, dv, N, 1, true, col);
  F(O(1, -1, 1), neg(Z), Y, d, h, X); F(O(-1, -1, -1), Z, Y, d, h, neg(X));
  F(O(-1, -1, 1), X, Y, w, h, Z); F(O(1, -1, -1), neg(X), Y, w, h, neg(Z));
  F(O(-1, 1, 1), X, neg(Z), w, d, Y); F(O(-1, -1, -1), X, Z, w, d, neg(Y));
};
// r5: scanned prop models ride along with the batch (merged into their own per-area meshes on finish); null when the model is unavailable
PropBatch.prototype.mdl = function (k, root, pos, rot, scl, tint) { return (this.mb || (this.mb = new MdlBatch())).add(k, root, pos, rot, scl, tint); };
PropBatch.prototype.finish = function (name, keep) {   // keep: collect roots for deferred disposal (roots shared across batches)
  const fast = this.mb && this.mb.n ? this.mb.finish(name + 'M') : [];
  if (this.mb) this.mb.n = 0;
  if (this.geos) { for (const g of this.geos.values()) if (g.p.length) { const m = g.mesh(name, SCN); m.material = this.mat; fast.push(m); } this.geos = null; }
  if (!this.parts.length) return fast.length ? fast : null;
  const roots = new Set(this.parts.map(p => p.parent));
  this.parts.forEach(p => p.computeWorldMatrix(true));
  const out = [];
  for (let i = 0; i < this.parts.length; i += 400) {
    const m = BABYLON.Mesh.MergeMeshes(this.parts.slice(i, i + 400), true, true);
    if (m) { m.material = this.mat; m.isPickable = false; m.hasVertexAlpha = false; m.name = name; out.push(m); }
  }
  if (keep) keep.push(...roots); else roots.forEach(r => r && r.dispose && r.dispose());
  return out.concat(fast);
};
function propRoot(x, z, ry) { const t = tnode(null, x, 0, z); t.rotation.y = ry; t.computeWorldMatrix(true); return t; }

function buildProps() {
  const mat = actMat('props', { spec: 0.18, shin: 14, wrinkle: 0.25, emis: 1, wrap: 0.35, mottle: 0.4 });
  const B = new PropBatch(mat);
  const scrMat = actMat('screen', { frag: 'scr' }); scrMat.setVector4('aTint', new BABYLON.Vector4(1, 1, 1, 1));
  W.scrMat = scrMat;
  const busy = new Set([cIdx(LV.spawn.x, LV.spawn.y), cIdx(LV.exit.x, LV.exit.y), ...LV.tapeCells.map(c => cIdx(c.x, c.y))]);
  const CARD = [0.52, 0.4, 0.24], CARD2 = [0.46, 0.35, 0.2], TAPEC = [0.62, 0.52, 0.34];
  const cornerSpot = (cx, cy) => { const sx = RNG() < 0.5 ? -1 : 1, sz = RNG() < 0.5 ? -1 : 1; return [cellCenter(cx) + sx * rnd(0.95, 1.2), cellCenter(cy) + sz * rnd(0.95, 1.2)]; };
  const CB = mdlOk('cbox') ? mdlDims('cbox') : [0.384, 0.342, 0.516];
  // near-uniform scale for a scanned box rolled at w x h x d (the print smears if stretched), capped so it never outgrows its slot
  const boxScale = (w, h, d) => { const a = [w / CB[0], h / CB[1], d / CB[2]], s = clamp(Math.cbrt(a[0] * a[1] * a[2]), 0.55, 1.6); return a.map(v => Math.min(v, clamp(v, s * 0.85, s * 1.18))); };
  const box = (x, z, ry, w, h, d, y0 = 0) => {   // returns the top of the box (stacks build on it)
    const r = propRoot(x, z, ry), alt = RNG() < 0.5, c = alt ? CARD : CARD2, sc = boxScale(w, h, d);
    if (B.mdl('cbox', r, [0, y0, 0], null, sc, alt ? [1, 1, 1] : [0.86, 0.8, 0.72])) { r.dispose(); return y0 + CB[1] * sc[1]; }
    B.add(r, 'Box', { width: w, height: h, depth: d }, c, 0, [0, y0 + h / 2, 0], null, null, (px, py) => 0.85 + 0.15 * clamp(py / h + 0.5, 0, 1));
    B.add(r, 'Box', { width: w + 0.004, height: 0.004, depth: 0.05 }, TAPEC, 0, [0, y0 + h + 0.001, 0]);
    B.add(r, 'Box', { width: 0.05, height: h * 0.4, depth: d + 0.004 }, TAPEC, 0, [0, y0 + h * 0.8, 0]);
    return y0 + h;
  };
  for (let c = 0; c < N * N; c++) {
    if (busy.has(c) || RNG() > 0.3) continue;
    const cx = c % N, cy = (c / N) | 0, [x, z] = cornerSpot(cx, cy), ry = rnd(0, TAU), kind = RNG();
    if (kind < 0.38) { // box stack
      const w = rnd(0.45, 0.7), h = rnd(0.3, 0.5), d = rnd(0.4, 0.6);
      const top = box(x, z, ry, w, h, d);
      if (RNG() < 0.55) box(x + rnd(-0.05, 0.05), z + rnd(-0.05, 0.05), ry + rnd(-0.3, 0.3), w * 0.85, h * 0.9, d * 0.85, top);
      if (RNG() < 0.35) { const a = ry + 0.9; box(x + Math.sin(a) * 0.7, z + Math.cos(a) * 0.7, rnd(0, TAU), 0.4, 0.3, 0.35); }
      addSolid(x - w * 0.6, z - w * 0.6, x + w * 0.6, z + w * 0.6, 'prop');
    } else if (kind < 0.6) { // office chair (sometimes toppled)
      const r = propRoot(x, z, ry), GR = [0.16, 0.16, 0.17], MET = [0.35, 0.35, 0.36];
      const fallen = RNG() < 0.25;
      if (fallen) { r.rotation.z = Math.PI / 2 - 0.1; r.position.y = 0.3; r.computeWorldMatrix(true); }
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; B.add(r, 'Box', { width: 0.04, height: 0.03, depth: 0.3 }, MET, 0, [Math.sin(a) * 0.15, 0.06, Math.cos(a) * 0.15], [0, a, 0]); B.add(r, 'Sphere', { diameter: 0.05, segments: 6 }, GR, 0, [Math.sin(a) * 0.3, 0.025, Math.cos(a) * 0.3]); }
      B.add(r, 'Cylinder', { diameter: 0.05, height: 0.36, tessellation: 8 }, MET, 0, [0, 0.25, 0]);
      B.add(r, 'Box', { width: 0.46, height: 0.08, depth: 0.44 }, GR, 0, [0, 0.46, 0]);
      B.add(r, 'Box', { width: 0.42, height: 0.5, depth: 0.06 }, GR, 0, [0, 0.78, -0.22], [-0.12, 0, 0]);
      for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.04, height: 0.2, depth: 0.3 }, MET, 0, [s * 0.24, 0.58, 0]);
      addSolid(x - 0.3, z - 0.3, x + 0.3, z + 0.3, 'prop');
    } else if (kind < 0.72) { // CRT TV on a small cart, playing static
      const r = propRoot(x, z, Math.atan2(cellCenter(cx) - x, cellCenter(cy) - z)), BEI = [0.62, 0.58, 0.5], DKG = [0.12, 0.12, 0.12];
      B.add(r, 'Box', { width: 0.62, height: 0.04, depth: 0.5 }, DKG, 0, [0, 0.55, 0]);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.add(r, 'Cylinder', { diameter: 0.03, height: 0.55, tessellation: 6 }, [0.3, 0.3, 0.3], 0, [sx * 0.27, 0.275, sz * 0.21]);
      B.add(r, 'Box', { width: 0.62, height: 0.04, depth: 0.5 }, DKG, 0, [0, 0.12, 0]);
      // r5: scanned CRT set on the cart; the static plane sits just proud of its curved glass (centre x 0.066, y 0.259, bulge z 0.215)
      const tvM = B.mdl('crt', r, [0, 0.57, 0], null, 1), sp = tvM ? [0.066, 0.829, 0.22] : [0, 0.82, 0.217];
      if (!tvM) {
        B.add(r, 'Box', { width: 0.54, height: 0.46, depth: 0.46 }, BEI, 0, [0, 0.8, -0.02]);
        B.add(r, 'Box', { width: 0.42, height: 0.36, depth: 0.2 }, BEI, 0, [0, 0.8, -0.3]);
        B.add(r, 'Box', { width: 0.46, height: 0.36, depth: 0.02 }, DKG, 0, [0, 0.82, 0.205]);
        B.add(r, 'Box', { width: 0.06, height: 0.02, depth: 0.01 }, [1, 0.2, 0.1], 1, [0.2, 0.61, 0.215]);
      }
      const scr = part('Plane', tvM ? { width: 0.37, height: 0.28 } : { width: 0.42, height: 0.32 }, r, scrMat, [1, 1, 1], 0, sp, [0, Math.PI, 0]);
      scr.parent = null; scr.position.copyFrom(BABYLON.Vector3.TransformCoordinates(V3(sp[0], sp[1], sp[2]), r.getWorldMatrix())); scr.rotation.set(0, r.rotation.y + Math.PI, 0);
      W.tvs.push({ x: x + Math.sin(r.rotation.y) * 0.5, z: z + Math.cos(r.rotation.y) * 0.5, seed: RNG() * 10 });
      addSolid(x - 0.33, z - 0.33, x + 0.33, z + 0.33, 'prop');
    } else if (kind < 0.84) { // folding table with papers
      const r = propRoot(x, z, ry), TOP = [0.45, 0.42, 0.36], LEG = [0.3, 0.3, 0.3];
      B.add(r, 'Box', { width: 1.1, height: 0.035, depth: 0.6 }, TOP, 0, [0, 0.72, 0]);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) B.add(r, 'Cylinder', { diameter: 0.03, height: 0.72, tessellation: 6 }, LEG, 0, [sx * 0.5, 0.36, sz * 0.26]);
      for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.21, height: 0.003, depth: 0.29 }, [0.9, 0.88, 0.8], 0, [rnd(-0.35, 0.35), 0.74 + i * 0.002, rnd(-0.1, 0.1)], [0, rnd(-0.6, 0.6), 0]);
      if (RNG() < 0.5) B.add(r, 'Cylinder', { diameter: 0.08, height: 0.1, tessellation: 10 }, [0.8, 0.8, 0.78], 0, [0.35, 0.79, 0.1]);
      addSolid(x - 0.6, z - 0.6, x + 0.6, z + 0.6, 'prop');
    } else { // wet floor sign / bucket
      const r = propRoot(x, z, ry), YEL = [0.9, 0.72, 0.08];
      if (!B.mdl('wetsign', r, null, null, 1)) for (const s of [-1, 1]) B.add(r, 'Box', { width: 0.3, height: 0.62, depth: 0.012 }, YEL, 0, [0, 0.3, s * 0.1], [s * 0.3, 0, 0]);
      B.add(r, 'Cylinder', { diameterTop: 0.3, diameterBottom: 0.26, height: 0.3, tessellation: 14 }, [0.2, 0.28, 0.5], 0, [0.45, 0.15, 0.1]);
      addSolid(x - 0.25, z - 0.25, x + 0.25, z + 0.25, 'prop');
    }
  }
  // wall outlets & vents
  for (const p of LV.pieces) {
    if (p.k !== 'w') continue;
    const alongX = p.x1 - p.x0 > p.z1 - p.z0, len = alongX ? p.x1 - p.x0 : p.z1 - p.z0;
    if (len < 1.2) continue;
    for (const side of [-1, 1]) {
      const rr = RNG();
      if (rr > 0.2) continue;
      const t = rnd(0.35, len - 0.35), vent = rr < 0.05;
      const x = alongX ? p.x0 + t : (side > 0 ? p.x1 : p.x0), z = alongX ? (side > 0 ? p.z1 : p.z0) : p.z0 + t;
      const ry = alongX ? (side > 0 ? 0 : Math.PI) : (side > 0 ? Math.PI / 2 : -Math.PI / 2);
      const r = propRoot(x, z, ry);
      if (vent) { B.add(r, 'Box', { width: 0.36, height: 0.2, depth: 0.012 }, [0.55, 0.53, 0.46], 0, [0, CEIL - 0.3, 0.006]); for (let i = 0; i < 5; i++) B.add(r, 'Box', { width: 0.32, height: 0.012, depth: 0.012 }, [0.12, 0.11, 0.1], 0, [0, CEIL - 0.38 + i * 0.04, 0.013]); }
      else { B.add(r, 'Box', { width: 0.07, height: 0.115, depth: 0.01 }, [0.78, 0.74, 0.62], 0, [0, 0.32, 0.005]); for (const yy of [0.345, 0.295]) B.add(r, 'Box', { width: 0.03, height: 0.02, depth: 0.004 }, [0.2, 0.19, 0.16], 0, [0, yy, 0.011]); }
    }
  }
  const merged = B.finish('props') || [];
  merged.forEach(m => m._sortD = 300);
}

// ----- pickups -----
function buildItems(diff) {
  const mat = actMat('items', { spec: 0.8, shin: 50, emis: 1, wrap: 0.3 }); W.itemMat = mat;
  const used = new Set([cIdx(LV.spawn.x, LV.spawn.y)]);
  const place = (type) => {
    for (let tries = 0; tries < 200; tries++) {
      const c = rndi(0, N * N - 1); if (used.has(c) || LV.spawnD[c] < 2) continue; used.add(c);
      const cx = c % N, cy = (c / N) | 0;
      const x = cellCenter(cx) + rnd(-1.3, 1.3), z = cellCenter(cy) + rnd(-1.3, 1.3);
      const p = { x, z }; collide(p, 0.25);
      const root = tnode(null, p.x, 0, p.z); root.rotation.y = rnd(0, TAU);
      if (type === 'battery') {
        part('Box', { width: 0.12, height: 0.036, depth: 0.07 }, root, mat, [0.14, 0.14, 0.15], 0, [0, 0.018, 0]);
        part('Box', { width: 0.121, height: 0.012, depth: 0.071 }, root, mat, [0.85, 0.62, 0.1], 0, [0, 0.02, 0]);
        part('Box', { width: 0.02, height: 0.01, depth: 0.03 }, root, mat, [0.9, 0.8, 0.4], 0, [0.05, 0.038, 0]);
        part('Sphere', { diameter: 0.012, segments: 4 }, root, mat, [1, 0.95, 0.8], 1, [0.04, 0.04, 0.02]);
      } else {
        for (let i = 0; i < (RNG() < 0.4 ? 2 : 1); i++) {
          const b = tnode(root, i * 0.09, 0, i * 0.04);
          part('Cylinder', { diameter: 0.068, height: 0.2, tessellation: 14 }, b, mat, [0.86, 0.84, 0.74], 0, [0, 0.1, 0]);
          part('Cylinder', { diameter: 0.07, height: 0.07, tessellation: 14 }, b, mat, [0.95, 0.93, 0.86], 0, [0, 0.1, 0]);
          part('Cylinder', { diameter: 0.071, height: 0.018, tessellation: 14 }, b, mat, [0.25, 0.45, 0.2], 0, [0, 0.1, 0]);
          part('Cylinder', { diameterTop: 0.028, diameterBottom: 0.066, height: 0.04, tessellation: 12 }, b, mat, [0.86, 0.84, 0.74], 0, [0, 0.22, 0]);
          part('Cylinder', { diameter: 0.03, height: 0.022, tessellation: 10 }, b, mat, [0.95, 0.95, 0.95], 0, [0, 0.25, 0]);
          part('Sphere', { diameter: 0.012, segments: 4 }, b, mat, [1, 1, 1], 1, [0.02, 0.18, 0.03]);
        }
      }
      const it = { type, x: p.x, z: p.z, root, taken: false };
      W.items.push(it);
      W.interact.push({ x: p.x, z: p.z, y: 0.1, r: 1.9, it, label: () => type === 'battery' ? 'TAKE CAMCORDER BATTERY' : 'TAKE ALMOND WATER', ok: () => !it.taken, act: () => takeItem(it) });
      return;
    }
  };
  const nb = [14, 11, 8][diff], nw = [14, 9, 5][diff];   // almond water: Easy gets the most (r4.4)
  for (let i = 0; i < nb; i++) place('battery');
  for (let i = 0; i < nw; i++) place('water');
}

// ----- tape sites: tripod camcorder, VHS tape, sometimes a dead explorer -----
function buildTapeSites() {
  LV.tapeCells.forEach((c, i) => {
    const x = cellCenter(c.x) + rnd(-0.6, 0.6), z = cellCenter(c.y) + rnd(-0.6, 0.6);
    const mat = actMat('site' + i, { spec: 0.6, shin: 40, emis: 1, wrap: 0.3 });
    const root = tnode(null, x, 0, z); root.rotation.y = rnd(0, TAU);
    const DK = [0.12, 0.12, 0.13];
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU; part('Cylinder', { diameter: 0.022, height: 1.35, tessellation: 6 }, root, mat, [0.25, 0.25, 0.26], 0, [Math.sin(a) * 0.22, 0.64, Math.cos(a) * 0.22 + 0.9], [Math.cos(a) * -0.17, 0, Math.sin(a) * 0.17]); }
    part('Box', { width: 0.11, height: 0.13, depth: 0.24 }, root, mat, DK, 0, [0, 1.36, 0.9]);
    part('Cylinder', { diameter: 0.07, height: 0.09, tessellation: 14 }, root, mat, [0.05, 0.05, 0.05], 0, [0, 1.37, 0.77], [Math.PI / 2, 0, 0]);
    part('Box', { width: 0.07, height: 0.05, depth: 0.08 }, root, mat, DK, 0, [0.07, 1.42, 0.98]);
    part('Sphere', { diameter: 0.018, segments: 6 }, root, mat, [1, 0.08, 0.04], 1, [0.035, 1.44, 0.83]);
    const tape = tnode(root, rnd(-0.3, 0.3), 0, rnd(0.1, 0.4)); tape.rotation.y = rnd(0, TAU);
    part('Box', { width: 0.19, height: 0.026, depth: 0.105 }, tape, mat, [0.04, 0.04, 0.04], 0, [0, 0.013, 0]);
    part('Box', { width: 0.12, height: 0.002, depth: 0.06 }, tape, mat, [0.9, 0.88, 0.8], 0, [0, 0.027, 0.01]);
    part('Box', { width: 0.07, height: 0.002, depth: 0.02 }, tape, mat, [0.2, 0.2, 0.22], 0, [0, 0.0275, -0.025]);
    part('Sphere', { diameter: 0.012, segments: 4 }, tape, mat, [1, 1, 1], 1, [0.06, 0.03, 0.03]);
    const tp = BABYLON.Vector3.TransformCoordinates(V3(0, 0, 0), tape.computeWorldMatrix(true));
    const site = { i, x: tp.x, z: tp.z, root, tape, mat, taken: false, led: BABYLON.Vector3.TransformCoordinates(V3(0.035, 1.44, 0.83), root.computeWorldMatrix(true)) };
    addSolid(x - 0.3 + Math.sin(root.rotation.y) * 0.9, z - 0.3 + Math.cos(root.rotation.y) * 0.9, x + 0.3 + Math.sin(root.rotation.y) * 0.9, z + 0.3 + Math.cos(root.rotation.y) * 0.9, 'prop');
    if (i % 2 === 0) { // fallen expedition member nearby
      const r = buildExplorer({ tint: i ? [0.8, 0.64, 0.18] : [0.84, 0.7, 0.2] });
      const bx = x + rnd(-1, 1), bz = z + rnd(-1, 1); const bp = { x: bx, z: bz }; collide(bp, 0.5);
      r.root.position.set(bp.x, 0, bp.z); r.root.rotation.y = rnd(0, TAU); if (r.sk) poseDeadSk(r, RNG() < 0.5 ? -1 : 1, true); else poseDead(r, RNG() < 0.5 ? -1 : 1);
      W.dead.push({ r, x: bp.x, z: bp.z, searched: false });
      W.interact.push({ x: bp.x, z: bp.z, y: 0.3, r: 2.0, label: () => 'SEARCH BODY', ok: () => !W.dead.find(d => d.r === r).searched, act: () => { const d = W.dead.find(d => d.r === r); d.searched = true; searchBody(); } });
    }
    W.tapes.push(site);
    W.interact.push({ x: site.x, z: site.z, y: 0.05, r: 1.9, label: () => 'TAKE TAPE', ok: () => !site.taken, act: () => takeTape(site) });
  });
}

// ----- exit door -----
function buildExit() {
  const e = LV.exit, [mx, mz] = edgeMid(e.x, e.y, e.d), nx = -DX[e.d], nz = -DY[e.d], off = WT / 2 + 0.02;
  const mat = actMat('exit', { spec: 0.7, shin: 40, emis: 1, wrap: 0.3 });
  const root = tnode(null, mx + nx * off, 0, mz + nz * off); root.rotation.y = Math.atan2(nx, nz);
  const FR = [0.4, 0.41, 0.38], SL = [0.28, 0.34, 0.3], BAR = [0.65, 0.65, 0.62];
  part('Box', { width: 0.07, height: 2.2, depth: 0.06 }, root, mat, FR, 0, [-0.55, 1.1, 0]);
  part('Box', { width: 0.07, height: 2.2, depth: 0.06 }, root, mat, FR, 0, [0.55, 1.1, 0]);
  part('Box', { width: 1.17, height: 0.08, depth: 0.06 }, root, mat, FR, 0, [0, 2.24, 0]);
  const white = actMat('exitVoid', { emis: 1 }); setEmi(white, 0);
  part('Plane', { width: 1.03, height: 2.18 }, root, white, [1, 0.98, 0.9], 1, [0, 1.09, -0.012], [0, Math.PI, 0]);
  const hinge = tnode(root, -0.5, 0, 0.0);
  part('Box', { width: 1.0, height: 2.16, depth: 0.045 }, hinge, mat, SL, 0, [0.5, 1.08, 0], null, null, (x, y) => 0.9 + 0.1 * Math.sin(y * 9));
  part('Box', { width: 0.8, height: 0.05, depth: 0.06 }, hinge, mat, BAR, 0, [0.5, 1.02, 0.05]);
  part('Box', { width: 0.96, height: 0.25, depth: 0.006 }, hinge, mat, [0.5, 0.5, 0.48], 0, [0.5, 0.15, 0.026]);
  part('Box', { width: 0.22, height: 0.46, depth: 0.01 }, hinge, mat, [0.05, 0.06, 0.06], 0, [0.5, 1.6, 0.024]);
  part('Box', { width: 0.11, height: 0.17, depth: 0.03 }, root, mat, [0.1, 0.1, 0.1], 0, [0.78, 1.3, 0.0]);
  for (let i = 0; i < 9; i++) part('Box', { width: 0.022, height: 0.018, depth: 0.006 }, root, mat, [0.6, 0.6, 0.58], 0, [0.75 + (i % 3) * 0.03, 1.27 - Math.floor(i / 3) * 0.028, 0.017]);
  const led = actMat('exitLed', { emis: 1 }); setEmi(led, 3, 0.1, 0.05);
  part('Sphere', { diameter: 0.016, segments: 6 }, root, led, [1, 1, 1], 1, [0.78, 1.36, 0.017]);
  const sign = BABYLON.MeshBuilder.CreatePlane('exitSign', { width: 0.46, height: 0.17 }, SCN);
  const sm = new BABYLON.StandardMaterial('exitSignMat', SCN); sm.emissiveTexture = exitSignTexture(SCN); sm.disableLighting = true; sm.emissiveColor = new BABYLON.Color3(2.6, 2.6, 2.6); sm.backFaceCulling = false;
  sign.material = sm; sign.parent = root; sign.position.set(0, 2.5, 0.03); sign.rotation.y = Math.PI; sign.scaling.x = -1;
  part('Box', { width: 0.5, height: 0.2, depth: 0.05 }, root, mat, [0.85, 0.85, 0.82], 0, [0, 2.5, 0.0]);
  root.computeWorldMatrix(true);
  const front = BABYLON.Vector3.TransformCoordinates(V3(0, 0, 0.9), root.getWorldMatrix());
  W.exit = { root, hinge, led, white, x: front.x, z: front.z, open: 0, opening: false, signPos: BABYLON.Vector3.TransformCoordinates(V3(0, 2.45, 0.4), root.getWorldMatrix()), doorPos: BABYLON.Vector3.TransformCoordinates(V3(0, 1.2, 0.1), root.getWorldMatrix()) };
  W.interact.push({ x: W.exit.doorPos.x, z: W.exit.doorPos.z, y: 1.2, r: 2.2, label: () => G.code.length < 4 ? 'KEYPAD — LOCKED' : 'ENTER CODE', ok: () => !W.exit.opening, act: () => useExit() });
}

// ----- atmosphere: dust motes & flashlight beams -----
function buildDust() {
  const n = 700, pos = [], idx = [];
  for (let i = 0; i < n; i++) { pos.push(Math.random(), Math.random(), Math.random()); idx.push(i); }
  const m = new BABYLON.Mesh('dust', SCN), vd = new BABYLON.VertexData(); vd.positions = pos; vd.indices = idx; vd.applyToMesh(m);
  const mat = new BABYLON.ShaderMaterial('dustMat', SCN, { vertex: 'dust', fragment: 'dust' }, { attributes: ['position'], uniforms: ['viewProjection', 'ptScale', ...COMMON_UNIFORMS], samplers: ['lightTex'], needAlphaBlending: true });
  mat.setTexture('lightTex', LV.lightTex); mat.setFloat('ptScale', 3.2); mat.pointsCloud = true; mat.alphaMode = BABYLON.Engine.ALPHA_ADD; mat.disableDepthWrite = true; mat.backFaceCulling = false;
  m.material = mat; m.alwaysSelectAsActiveMesh = true; m.isPickable = false; MATS.list.push(mat); W.dustMat = mat;
  for (let i = 0; i < 3; i++) {
    const L = 7;
    const cone = BABYLON.MeshBuilder.CreateCylinder('beam', { height: L, diameterTop: 0.05, diameterBottom: 2 * L * Math.tan(0.36), tessellation: 20, cap: BABYLON.Mesh.NO_CAP }, SCN);
    const bm = new BABYLON.ShaderMaterial('beamMat' + i, SCN, { vertex: 'beam', fragment: 'beam' }, { attributes: ['position', 'normal'], uniforms: ['world', 'viewProjection', 'beamLen', 'beamC', ...COMMON_UNIFORMS], samplers: ['lightTex'], needAlphaBlending: true });
    bm.setTexture('lightTex', LV.lightTex); bm.setFloat('beamLen', L); bm.setVector4('beamC', new BABYLON.Vector4(1, 0.93, 0.78, 0.05));
    bm.alphaMode = BABYLON.Engine.ALPHA_ADD; bm.disableDepthWrite = true; bm.backFaceCulling = false;
    cone.material = bm; cone.isPickable = false; cone.isVisible = false; cone.rotationQuaternion = new BABYLON.Quaternion();
    MATS.list.push(bm); W.beams.push({ cone, mat: bm, L });
  }
}
const _q = new BABYLON.Quaternion();
function placeBeam(b, tip, dir, a) {
  b.cone.isVisible = a > 0.001;
  if (!b.cone.isVisible) return;
  const nd = dir.scale(-1);
  BABYLON.Quaternion.FromUnitVectorsToRef(BABYLON.Axis.Y, nd.normalize(), b.cone.rotationQuaternion);
  b.cone.position.copyFrom(tip.add(dir.scale(b.L / 2)));
  b.mat.setVector4('beamC', new BABYLON.Vector4(1, 0.93, 0.78, a));
}

// ----- post-processing: bloom + custom VHS camcorder pass -----
function setupPost(q) {
  PIPE = new BABYLON.DefaultRenderingPipeline('pipe', true, SCN, [CAM]);
  PIPE.imageProcessingEnabled = false; PIPE.fxaaEnabled = false;
  PIPE.samples = q >= 2 ? 4 : 1;
  PIPE.bloomEnabled = true; PIPE.bloomThreshold = 1.1; PIPE.bloomWeight = 0.42; PIPE.bloomKernel = q >= 1 ? 64 : 32; PIPE.bloomScale = 0.5;
  VHS = new BABYLON.PostProcess('vhs', 'vhs', ['res', 'p1', 'p2', 'p3'], null, 1.0, CAM, BABYLON.Texture.BILINEAR_SAMPLINGMODE, ENG);
  VHS.onApply = e => { e.setFloat2('res', VHS.width, VHS.height); e.setFloat4('p1', FX.t, FX.amt, FX.glitch, FX.nv); e.setFloat4('p2', FX.hurt, FX.fadeB, FX.fadeW, FX.exposure); e.setFloat4('p3', FX.san, 0, 0, 0); };
}
function applyQuality(q) {
  const h = window.innerHeight * (window.devicePixelRatio || 1), target = [420, 600, 820][q];
  ENG.setHardwareScalingLevel(Math.max(1 / (window.devicePixelRatio || 1), h / target));
  if (PIPE) { PIPE.samples = q >= 2 ? 4 : 1; PIPE.bloomKernel = q >= 1 ? 64 : 32; }
}

async function buildWorld(progress, diff) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0, 0, 0, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 95; CAM.fov = 1.0;
  progress(0.08, 'MAPPING LEVEL 0…'); await nextFrame();
  genLayout(); planLevel(); collectPieces();
  progress(0.16, 'PRINTING WALLPAPER…'); await nextFrame();
  const wp = genWallpaper(SCN, 1024);
  progress(0.3, 'SOAKING CARPET…'); await nextFrame();
  const cp = genCarpet(SCN, 1024);
  progress(0.44, 'HANGING CEILING TILES…'); await nextFrame();
  const ce = genCeiling(SCN, 1024);
  progress(0.56, 'WIRING FLUORESCENT LIGHTS…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  progress(0.72, 'BUILDING ROOMS…'); await nextFrame();
  const fm = new BABYLON.ShaderMaterial('fixMat', SCN, { vertex: 'fix', fragment: 'fix' }, { attributes: ['position', 'uv', 'color'], uniforms: ['world', 'viewProjection', ...COMMON_UNIFORMS], samplers: ['lightTex'] });
  fm.setTexture('lightTex', LV.lightTex); MATS.list.push(fm);
  const mats = { wall: envMat('wallMat', 'MAT_WALL', wp.albedo, wp.normal), floor: envMat('floorMat', 'MAT_FLOOR', cp.albedo, cp.normal), ceil: envMat('ceilMat', 'MAT_CEIL', ce.albedo, ce.normal), trim: envMat('trimMat', 'MAT_TRIM', wp.albedo, wp.normal), fixture: fm };
  buildGeometry(SCN, mats);
  progress(0.84, 'SCATTERING DEBRIS…'); await nextFrame();
  buildProps(); buildTapeSites(); buildExit(); buildDust();
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.94, 'SPOOLING TAPE…'); await nextFrame();
}
