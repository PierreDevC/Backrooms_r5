// ---------- materials & procedural character rigs ----------
let SCN = null;
const MATS = { list: [] };
function envMat(name, define, albedo, normal) {
  const defines = [define], samplers = ['albedoTex', 'normalTex', 'lightTex'], uniforms = ['world', 'viewProjection', ...COMMON_UNIFORMS];
  const P = pbrOpts(name, defines, samplers, uniforms);
  const m = new BABYLON.ShaderMaterial(name, SCN, { vertex: 'env', fragment: 'env' }, {
    attributes: ['position', 'normal', 'uv', 'tangent'], uniforms, samplers, defines });
  m.setTexture('albedoTex', albedo); m.setTexture('normalTex', normal); m.setTexture('lightTex', LV.lightTex); pbrBind(m, P);
  MATS.list.push(m); return m;
}
function actMat(name, o = {}) {
  const m = new BABYLON.ShaderMaterial(name, SCN, { vertex: 'act', fragment: o.frag || 'act' }, {
    attributes: ['position', 'normal', 'color'], uniforms: ['world', 'viewProjection', ...COMMON_UNIFORMS, 'aP', 'aP2', 'aTint', 'aEmi', 'seed'], samplers: ['lightTex'] });
  m.setTexture('lightTex', LV.lightTex);
  m.setVector4('aP', new BABYLON.Vector4(o.spec ?? 0.3, o.shin ?? 20, o.wrinkle ?? 0, o.emis ?? 1));
  m.__p2 = new BABYLON.Vector4(0, o.wet ?? 0, o.wrap ?? 0.3, o.mottle ?? 0); m.setVector4('aP2', m.__p2);
  m.__emi = new BABYLON.Vector3(1, 1, 1);
  m.setVector4('aTint', new BABYLON.Vector4(1, 1, 1, 1)); m.setVector3('aEmi', m.__emi); m.setFloat('seed', Math.random() * 100);
  if (o.twoSided) m.backFaceCulling = false;
  MATS.list.push(m); return m;
}
function setDissolve(mat, v) { if (mat.__twin) setDissolve(mat.__twin, v); if (mat.__p2.x === v) return; mat.__p2.x = v; mat.setVector4('aP2', mat.__p2); }
function setEmi(mat, r, g = r, b = r) { if (mat.__twin) setEmi(mat.__twin, r, g, b); const e = mat.__emi; if (e.x === r && e.y === g && e.z === b) return; e.set(r, g, b); mat.setVector3('aEmi', e); }
function colorize(mesh, rgb, emis = 0, fn) {
  const pos = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind), n = pos.length / 3, c = new Float32Array(n * 4);
  for (let i = 0; i < n; i++) {
    let k = 1; if (fn) k = fn(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
    c[i * 4] = rgb[0] * k; c[i * 4 + 1] = rgb[1] * k; c[i * 4 + 2] = rgb[2] * k; c[i * 4 + 3] = emis;
  }
  mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, c, false, 4); mesh.hasVertexAlpha = false;
}
function part(kind, opts, parent, mat, rgb, emis, pos, rot, scl, fn) {
  const m = BABYLON.MeshBuilder['Create' + kind]('pt', opts, SCN);
  colorize(m, rgb, emis || 0, fn); m.material = mat; m.parent = parent; m.isPickable = false;
  if (pos) m.position.set(pos[0], pos[1], pos[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); if (scl) m.scaling.set(scl[0], scl[1], scl[2]);
  return m;
}
function tnode(parent, x = 0, y = 0, z = 0) { const t = new BABYLON.TransformNode('j', SCN); t.parent = parent; t.position.set(x, y, z); return t; }
function setRigVisible(r, v) { if (r.__vis === v) return; r.__vis = v; r.root.getChildMeshes(false).forEach(m => m.isVisible = v); }

// Hazmat-suited explorer (also used by the Mimic)
function buildExplorer(o = {}) {
  if (sknOn()) return buildExplorerSk(o);   // r5: skinned, animated character
  const mat = actMat('suit', { spec: 0.32, shin: 22, wrinkle: 0.85, emis: 1, wet: 0.06, wrap: 0.45 });
  const tint = (o.tint || [0.86, 0.68, 0.16]).map((v, i) => v * [0.9, 0.88, 0.8][i]);
  const SUIT = tint, DIRT = [tint[0] * 0.72, tint[1] * 0.72, tint[2] * 0.85], BLK = [0.045, 0.045, 0.045], TAPE = [0.5, 0.5, 0.48], GLASS = o.mimic ? [0.9, 0.12, 0.08] : [0.07, 0.09, 0.11], FILT = [0.17, 0.19, 0.14], PACK = [0.2, 0.2, 0.19];
  const root = tnode(null), r = { root, mat, kind: 'human', hipH: 0.97, lens: [] };
  const fold = (x, y, z) => 0.9 + 0.1 * Math.sin(x * 37 + y * 23 + z * 11);
  r.hips = tnode(root, 0, r.hipH, 0); r.torso = tnode(r.hips, 0, 0.02, 0);
  part('Capsule', { height: 0.74, radius: 0.2, tessellation: 14 }, r.torso, mat, SUIT, 0, [0, 0.34, 0], null, [1.18, 1, 0.78], fold);
  part('Cylinder', { diameter: 0.44, height: 0.05, tessellation: 16 }, r.torso, mat, TAPE, 0, [0, 0.05, 0], null, [1.06, 1, 0.8]);
  part('Box', { width: 0.3, height: 0.38, depth: 0.13 }, r.torso, mat, PACK, 0, [0, 0.4, -0.2]);
  part('Cylinder', { diameter: 0.1, height: 0.42, tessellation: 10 }, r.torso, mat, [0.55, 0.55, 0.52], 0, [0.09, 0.44, -0.29]);
  part('Box', { width: 0.08, height: 0.13, depth: 0.045 }, r.torso, mat, BLK, 0, [0.1, 0.5, 0.165]);
  part('Cylinder', { diameter: 0.012, height: 0.16, tessellation: 6 }, r.torso, mat, BLK, 0, [0.125, 0.63, 0.165]);
  part('Box', { width: 0.022, height: 0.012, depth: 0.01 }, r.torso, mat, [0.2, 1, 0.3], 1, [0.08, 0.545, 0.19]);
  r.neck = tnode(r.torso, 0, 0.7, 0); r.head = tnode(r.neck, 0, 0.12, 0);
  part('Cylinder', { diameter: 0.2, height: 0.06, tessellation: 14 }, r.neck, mat, TAPE, 0, [0, 0.0, 0]);
  part('Sphere', { diameter: 0.36, segments: 14 }, r.head, mat, SUIT, 0, [0, 0.02, -0.03], null, [1, 1.1, 1.05], fold);
  part('Sphere', { diameter: 0.25, segments: 14 }, r.head, mat, BLK, 0, [0, -0.02, 0.11], null, [0.95, 1, 0.62]);
  for (const s of [-1, 1]) {
    r.lens.push(part('Cylinder', { diameter: 0.078, height: 0.02, tessellation: 16 }, r.head, mat, GLASS, o.mimic ? 1 : 0, [s * 0.05, 0.02, 0.182], [Math.PI / 2, 0, 0]));
    part('Torus', { diameter: 0.082, thickness: 0.014, tessellation: 16 }, r.head, mat, BLK, 0, [s * 0.05, 0.02, 0.186], [Math.PI / 2, 0, 0]);
    part('Cylinder', { diameter: 0.06, height: 0.05, tessellation: 12 }, r.head, mat, FILT, 0, [s * 0.1, -0.07, 0.12], [Math.PI / 2, s * 0.8, 0]);
  }
  part('Cylinder', { diameter: 0.09, height: 0.075, tessellation: 14 }, r.head, mat, FILT, 0, [0, -0.085, 0.18], [Math.PI / 2 - 0.3, 0, 0]);
  r.sh = []; r.el = [];
  for (const s of [-1, 1]) {
    const sh = tnode(r.torso, s * 0.25, 0.58, 0); r.sh.push(sh);
    part('Sphere', { diameter: 0.17, segments: 10 }, sh, mat, SUIT, 0, [0, 0, 0]);
    part('Capsule', { height: 0.36, radius: 0.075, tessellation: 12 }, sh, mat, SUIT, 0, [0, -0.16, 0], null, null, fold);
    const el = tnode(sh, 0, -0.31, 0); r.el.push(el);
    part('Capsule', { height: 0.32, radius: 0.066, tessellation: 12 }, el, mat, SUIT, 0, [0, -0.14, 0], null, null, fold);
    part('Cylinder', { diameter: 0.145, height: 0.045, tessellation: 12 }, el, mat, TAPE, 0, [0, -0.26, 0]);
    part('Capsule', { height: 0.15, radius: 0.052, tessellation: 10 }, el, mat, BLK, 0, [0, -0.34, 0.01]);
  }
  r.hip = []; r.kn = [];
  for (const s of [-1, 1]) {
    const hp = tnode(r.hips, s * 0.105, -0.02, 0); r.hip.push(hp);
    part('Capsule', { height: 0.5, radius: 0.1, tessellation: 12 }, hp, mat, SUIT, 0, [0, -0.22, 0], null, null, fold);
    const kn = tnode(hp, 0, -0.46, 0); r.kn.push(kn);
    part('Capsule', { height: 0.46, radius: 0.086, tessellation: 12 }, kn, mat, DIRT, 0, [0, -0.2, 0], null, null, (x, y) => 0.75 + 0.35 * clamp(y * 3 + 0.6, 0, 1));
    part('Cylinder', { diameter: 0.185, height: 0.05, tessellation: 12 }, kn, mat, TAPE, 0, [0, -0.35, 0]);
    part('Box', { width: 0.125, height: 0.1, depth: 0.27 }, kn, mat, BLK, 0, [0, -0.43, 0.045]);
  }
  if (o.flashlight) {
    r.torch = part('Cylinder', { diameter: 0.045, height: 0.2, tessellation: 10 }, r.el[1], mat, BLK, 0, [0, -0.38, 0.02]);
    part('Cylinder', { diameter: 0.05, height: 0.012, tessellation: 12 }, r.el[1], mat, [1, 0.95, 0.8], 1, [0, -0.485, 0.02]);
  }
  if (o.mimic) setEmi(mat, 0);
  return r;
}

// The Howler: tall, emaciated, glossy-black humanoid
function buildEntity() {
  if (sknOn()) return buildHowlerSk();
  const mat = actMat('howler', { spec: 0.9, shin: 42, wrinkle: 0.5, emis: 1, wet: 0.7, wrap: 0.1, mottle: 0.7 });
  const SK = [0.085, 0.075, 0.068], DK = [0.04, 0.036, 0.034], MOUTH = [0.16, 0.02, 0.02];
  const root = tnode(null), r = { root, mat, kind: 'howler', hipH: 1.32 };
  const sinew = (x, y, z) => 0.8 + 0.2 * Math.sin(y * 60 + x * 20);
  r.hips = tnode(root, 0, r.hipH, 0); r.torso = tnode(r.hips, 0, 0.02, 0);
  part('Capsule', { height: 0.98, radius: 0.12, tessellation: 12 }, r.torso, mat, SK, 0, [0, 0.46, 0], null, [1.2, 1, 0.72], sinew);
  part('Sphere', { diameter: 0.2, segments: 10 }, r.torso, mat, DK, 0, [0, 0.02, 0], null, [1.3, 0.8, 0.9]);
  for (let i = 0; i < 6; i++) part('Sphere', { diameter: 0.05, segments: 6 }, r.torso, mat, SK, 0, [0, 0.18 + i * 0.13, -0.085]);
  for (let i = 0; i < 4; i++) part('Torus', { diameter: 0.25 - i * 0.012, thickness: 0.018, tessellation: 14 }, r.torso, mat, SK, 0, [0, 0.52 + i * 0.08, 0], null, [1.1, 1, 0.78]);
  r.neck = tnode(r.torso, 0, 0.9, 0.04); r.neck.rotation.x = 0.35;
  part('Capsule', { height: 0.38, radius: 0.036, tessellation: 10 }, r.neck, mat, SK, 0, [0, 0.16, 0]);
  r.head = tnode(r.neck, 0, 0.34, 0.03);
  part('Sphere', { diameter: 0.24, segments: 16 }, r.head, mat, SK, 0, [0, 0.03, 0], null, [0.82, 1.38, 1.0]);
  part('Sphere', { diameter: 0.12, segments: 12 }, r.head, mat, MOUTH, 0, [0, -0.05, 0.1], null, [0.72, 1.5, 0.45]);
  r.eyes = [];
  for (const s of [-1, 1]) r.eyes.push(part('Sphere', { diameter: 0.028, segments: 6 }, r.head, mat, [0.95, 0.92, 0.8], 1, [s * 0.042, 0.09, 0.098]));
  r.sh = []; r.el = []; r.hands = [];
  for (const s of [-1, 1]) {
    const sh = tnode(r.torso, s * 0.21, 0.86, 0); r.sh.push(sh);
    part('Sphere', { diameter: 0.1, segments: 8 }, sh, mat, SK, 0, [0, 0, 0]);
    part('Capsule', { height: 0.68, radius: 0.047, tessellation: 10 }, sh, mat, SK, 0, [0, -0.31, 0], null, null, sinew);
    const el = tnode(sh, 0, -0.62, 0); r.el.push(el);
    part('Sphere', { diameter: 0.075, segments: 8 }, el, mat, SK, 0, [0, 0, 0]);
    part('Capsule', { height: 0.66, radius: 0.034, tessellation: 10 }, el, mat, SK, 0, [0, -0.31, 0], null, null, sinew);
    const hand = tnode(el, 0, -0.62, 0); r.hands.push(hand);
    for (let f = -1; f <= 1; f++) part('Capsule', { height: 0.3, radius: 0.012, tessellation: 6 }, hand, mat, DK, 0, [f * 0.025, -0.13, 0.01 * f], [0.15, 0, f * 0.22]);
  }
  r.hip = []; r.kn = [];
  for (const s of [-1, 1]) {
    const hp = tnode(r.hips, s * 0.1, -0.02, 0); r.hip.push(hp);
    part('Capsule', { height: 0.74, radius: 0.062, tessellation: 10 }, hp, mat, SK, 0, [0, -0.33, 0], null, null, sinew);
    const kn = tnode(hp, 0, -0.66, 0); r.kn.push(kn);
    part('Sphere', { diameter: 0.085, segments: 8 }, kn, mat, SK, 0, [0, 0, 0]);
    part('Capsule', { height: 0.68, radius: 0.04, tessellation: 10 }, kn, mat, SK, 0, [0, -0.31, 0]);
    part('Capsule', { height: 0.26, radius: 0.03, tessellation: 8 }, kn, mat, DK, 0, [0, -0.63, 0.08], [Math.PI / 2, 0, 0]);
  }
  setEmi(mat, 0.15);
  return r;
}

// The Crawler: pale quadruped that moves only when unobserved
function buildCrawler() {
  const mat = actMat('crawler', { spec: 0.55, shin: 30, wrinkle: 0.7, emis: 1, wet: 0.4, wrap: 0.6, mottle: 1.0 });
  const SKIN = [0.7, 0.64, 0.58], DARK = [0.3, 0.12, 0.1], BONE = [0.62, 0.58, 0.52];
  const root = tnode(null), r = { root, mat, kind: 'crawler', legs: [] };
  r.body = tnode(root, 0, 0.66, 0);
  part('Capsule', { height: 1.08, radius: 0.15, tessellation: 12 }, r.body, mat, SKIN, 0, [0, 0, 0], [Math.PI / 2, 0, 0], [1.25, 1, 1]);
  for (let i = 0; i < 8; i++) part('Sphere', { diameter: 0.055, segments: 6 }, r.body, mat, BONE, 0, [0, 0.15, -0.42 + i * 0.12]);
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) part('Capsule', { height: 0.22, radius: 0.012, tessellation: 6 }, r.body, mat, BONE, 0, [s * 0.14, 0.02, -0.1 + i * 0.09], [0, 0, s * 1.2]);
  r.neck = tnode(r.body, 0, 0.05, 0.52); r.neck.rotation.x = -0.35;
  part('Capsule', { height: 0.34, radius: 0.05, tessellation: 10 }, r.neck, mat, SKIN, 0, [0, 0, 0.12], [Math.PI / 2, 0, 0]);
  r.head = tnode(r.neck, 0, 0, 0.3);
  part('Sphere', { diameter: 0.24, segments: 14 }, r.head, mat, SKIN, 0, [0, 0.02, 0.04], null, [0.9, 0.85, 1.25]);
  part('Sphere', { diameter: 0.16, segments: 10 }, r.head, mat, DARK, 0, [0, -0.04, 0.12], null, [0.75, 0.6, 0.6]);
  r.jaw = tnode(r.head, 0, -0.06, 0.02);
  part('Box', { width: 0.15, height: 0.03, depth: 0.2 }, r.jaw, mat, SKIN, 0, [0, -0.02, 0.09]);
  for (let i = 0; i < 6; i++) part('Box', { width: 0.012, height: 0.035, depth: 0.012 }, r.jaw, mat, [0.85, 0.82, 0.7], 0, [-0.05 + i * 0.02, 0.01, 0.17]);
  const mounts = [[1, 0.42], [-1, 0.42], [1, -0.42], [-1, -0.42]];
  mounts.forEach(([s, z], i) => {
    const sh = tnode(r.body, s * 0.16, 0, z); sh.rotation.z = s * 0.62;
    part('Capsule', { height: 0.44, radius: 0.036, tessellation: 8 }, sh, mat, SKIN, 0, [0, -0.19, 0]);
    const el = tnode(sh, 0, -0.38, 0); el.rotation.z = -s * 1.12;
    part('Sphere', { diameter: 0.07, segments: 8 }, el, mat, BONE, 0, [0, 0, 0]);
    part('Capsule', { height: 0.44, radius: 0.03, tessellation: 8 }, el, mat, SKIN, 0, [0, -0.19, 0]);
    for (let f = -1; f <= 1; f++) part('Capsule', { height: 0.14, radius: 0.01, tessellation: 5 }, el, mat, BONE, 0, [f * 0.02, -0.4, 0.04], [1.2, 0, f * 0.3]);
    r.legs.push({ sh, el, s, baseEl: -s * 1.12, off: [0, Math.PI, Math.PI, 0][i] });
  });
  return r;
}

// The Smiler: a grin and two eyes in the dark
function buildSmiler() {
  const mat = actMat('smiler', { spec: 0, shin: 1, emis: 1, wrap: 0 });
  const root = tnode(null), r = { root, mat, kind: 'smiler' };
  r.face = tnode(root, 0, 1.62, 0);
  part('Sphere', { diameter: 0.9, segments: 12 }, r.face, mat, [0.012, 0.011, 0.01], 0, [0, -0.3, -0.12], null, [1, 1.35, 0.7]);
  for (const s of [-1, 1]) part('Sphere', { diameter: 0.1, segments: 10 }, r.face, mat, [1, 1, 0.95], 1, [s * 0.14, 0.13, 0.26], [0, 0, s * -0.25], [1.4, 0.5, 0.4]);
  for (let row = 0; row < 2; row++) for (let i = 0; i < 17; i++) {
    const a = -1.05 + i / 16 * 2.1, x = Math.sin(a) * 0.27, y = -0.13 + 0.14 * a * a + (row ? -0.028 : 0.028);
    part('Box', { width: 0.026, height: 0.045, depth: 0.02 }, r.face, mat, [1, 0.98, 0.9], 1, [x, y, 0.27 - Math.abs(a) * 0.08], [0, a * 0.5, a * 0.55]);
  }
  setEmi(mat, 0);
  return r;
}

// ---------- animation ----------
function animHuman(r, ph, amp, st = {}) {
  if (r.sk) return animHumanSk(r, ph, amp, st);
  const s = Math.sin(ph), c = Math.cos(ph), A = st.legA ?? 0.55;
  r.hip[0].rotation.x = s * A * amp; r.hip[1].rotation.x = -s * A * amp;
  r.kn[0].rotation.x = Math.max(0, -c) * 0.95 * amp + 0.05; r.kn[1].rotation.x = Math.max(0, c) * 0.95 * amp + 0.05;
  r.sh[0].rotation.x = -s * (st.armA ?? 0.45) * amp + (st.armL ?? 0); r.sh[1].rotation.x = s * (st.armA ?? 0.45) * amp + (st.armR ?? 0);
  r.sh[0].rotation.z = st.armZ ? -st.armZ : 0; r.sh[1].rotation.z = st.armZ || 0;
  r.el[0].rotation.x = st.elL ?? (-0.18 - 0.35 * amp); r.el[1].rotation.x = st.elR ?? (-0.18 - 0.35 * amp);
  r.hips.position.y = r.hipH - 0.03 * amp + Math.abs(c) * 0.045 * amp + (st.drop || 0);
  r.torso.rotation.x = (st.lean ?? 0.04) + 0.06 * amp;
  r.torso.rotation.y = s * 0.07 * amp;
  r.head.rotation.y = st.look ?? 0; r.head.rotation.x = st.lookX ?? 0; r.head.rotation.z = st.lookZ ?? 0;
}
function poseDead(r, side) {
  if (r.sk) return poseDeadSk(r, side);
  r.hips.rotation.x = -Math.PI / 2 + 0.08; r.hips.position.y = 0.2; r.hips.rotation.z = side * 0.2;
  r.sh[0].rotation.z = -1.2; r.sh[1].rotation.z = 1.0; r.sh[0].rotation.x = r.sh[1].rotation.x = 0; r.el[0].rotation.x = -0.5; r.el[1].rotation.x = -0.2;
  r.hip[0].rotation.x = -0.1; r.hip[1].rotation.x = 0.15; r.kn[0].rotation.x = 0.4; r.kn[1].rotation.x = 0.1;
  r.head.rotation.y = side * 0.9; r.torso.rotation.set(0, 0, 0);
}
function animCrawler(r, ph, amp, t, twitch) {
  for (const L of r.legs) {
    const sw = Math.sin(ph + L.off);
    L.sh.rotation.x = sw * 0.6 * amp;
    L.el.rotation.z = L.baseEl + Math.max(0, Math.cos(ph + L.off)) * 0.4 * amp * L.s;
  }
  r.body.position.y = 0.66 + Math.abs(Math.sin(ph)) * 0.035 * amp;
  r.body.rotation.z = Math.sin(ph) * 0.05 * amp;
  r.head.rotation.z = Math.sin(t * 1.3) * 0.12 + twitch;
  r.jaw.rotation.x = 0.35 + Math.sin(t * 9) * 0.08 * amp;
}
