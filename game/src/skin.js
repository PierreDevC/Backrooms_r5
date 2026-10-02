// ---------- r5 skinned characters ----------
// Base mesh: Quaternius "Universal Base Characters" (CC0). Animations: Quaternius "Universal Animation Library" 1 & 2 (CC0).
// tools/chr/convert_chr.mjs mirrors the glTF into Babylon's left-handed space and retargets every clip onto the base mesh;
// here we do the skeleton maths ourselves (clip blending + procedural look/lean/arm layers + bone-proportion profiles)
// and skin on the GPU inside the game's own lighting shader (SH.skinV / SH.skinF), so every level's lights still apply.
// Rigs keep the old procedural interface (root, mat, hipH, head, sh[], el[], hip[], kn[], hands[]) so the AI code is unchanged:
// animHuman() writes the same proxy rotations; sknTick() turns the proxies into additive bone rotations before each render.
const SKN = { data: null, scn: null, geo: null, tex: null, rigs: [], off: /[?&]noskin/.test(location.search) };
function sknOn() { return !SKN.off && astOn() && typeof ASSET_CHR !== 'undefined' && !!(ASSET_CHR.human && ASSET_CHR.human.meta); }
function b64u8(b) { const s = atob(b), n = s.length, u = new Uint8Array(n); for (let i = 0; i < n; i++) u[i] = s.charCodeAt(i); return u; }
// ---- quaternion helpers on flat arrays (x, y, z, w; standard right-handed formulas, as Babylon's Euler angles use) ----
function qMulA(a, ao, b, bo, o, oo) {
  const ax = a[ao], ay = a[ao + 1], az = a[ao + 2], aw = a[ao + 3], bx = b[bo], by = b[bo + 1], bz = b[bo + 2], bw = b[bo + 3];
  o[oo] = aw * bx + ax * bw + ay * bz - az * by; o[oo + 1] = aw * by - ax * bz + ay * bw + az * bx;
  o[oo + 2] = aw * bz + ax * by - ay * bx + az * bw; o[oo + 3] = aw * bw - ax * bx - ay * by - az * bz;
}
function qRotA(q, qo, v, vo, o, oo) {
  const x = q[qo], y = q[qo + 1], z = q[qo + 2], w = q[qo + 3], vx = v[vo], vy = v[vo + 1], vz = v[vo + 2];
  const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
  o[oo] = vx + w * tx + (y * tz - z * ty); o[oo + 1] = vy + w * ty + (z * tx - x * tz); o[oo + 2] = vz + w * tz + (x * ty - y * tx);
}
const _sq = new Float32Array(16);
// model-space delta: q[o] = D(yaw Y, pitch X, roll Z) * q[o]   (same YXZ order as Babylon's rotation Euler angles)
function qPreEuler(q, o, x, y, z) {
  if (!x && !y && !z) return;
  const cx = Math.cos(x / 2), sx = Math.sin(x / 2), cy = Math.cos(y / 2), sy = Math.sin(y / 2), cz = Math.cos(z / 2), sz = Math.sin(z / 2);
  // Ry * Rx * Rz
  _sq[0] = cy * sx * cz + sy * cx * sz; _sq[1] = sy * cx * cz - cy * sx * sz; _sq[2] = cy * cx * sz - sy * sx * cz; _sq[3] = cy * cx * cz + sy * sx * sz;
  qMulA(_sq, 0, q, o, q, o);
}
// ---- one-time decode of the packed character ----
function sknData() {
  if (SKN.data) return SKN.data;
  const C = ASSET_CHR.human, M = C.meta, u8 = b64u8(C.bin), dv = new DataView(u8.buffer);
  const nv = M.mesh.nv, ni = M.mesh.ni, vo = M.mesh.vOff;
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), tan = new Float32Array(nv * 4), uv = new Float32Array(nv * 2), bj = new Float32Array(nv * 4), bw = new Float32Array(nv * 4), rg = new Float32Array(nv * 4);
  for (let i = 0; i < nv; i++) {
    const o = vo + i * 32, nx = dv.getInt8(o + 6), ny = dv.getInt8(o + 7), nz = dv.getInt8(o + 8), nl = Math.hypot(nx, ny, nz) || 1;
    const tx = dv.getInt8(o + 10), ty = dv.getInt8(o + 11), tz = dv.getInt8(o + 12), tl = Math.hypot(tx, ty, tz) || 1;
    for (let k = 0; k < 3; k++) pos[i * 3 + k] = dv.getInt16(o + k * 2, true) / 1e4;
    nrm[i * 3] = nx / nl; nrm[i * 3 + 1] = ny / nl; nrm[i * 3 + 2] = nz / nl;
    tan[i * 4] = tx / tl; tan[i * 4 + 1] = ty / tl; tan[i * 4 + 2] = tz / tl; tan[i * 4 + 3] = dv.getInt8(o + 13) < 0 ? -1 : 1;
    uv[i * 2] = dv.getUint16(o + 14, true) / 32768; uv[i * 2 + 1] = dv.getUint16(o + 16, true) / 32768;
    for (let k = 0; k < 4; k++) { bj[i * 4 + k] = u8[o + 18 + k]; bw[i * 4 + k] = u8[o + 22 + k] / 255; rg[i * 4 + k] = u8[o + 26 + k] / 255; }
  }
  const idx = new Uint16Array(u8.buffer.slice(M.mesh.iOff, M.mesh.iOff + ni * 2));
  const J = M.joints.length, par = M.joints.map(j => j.p), jn = {};
  M.joints.forEach((j, i) => { jn[j.n] = i; });
  const T = new Float32Array(J * 3), R = new Float32Array(J * 4), RG = new Float32Array(J * 4), PG = new Float32Array(J * 3);
  M.joints.forEach((j, i) => { T.set(j.t, i * 3); R.set(j.r, i * 4); });
  for (let i = 0; i < J; i++) {
    const p = par[i];
    if (p < 0) { RG.set(R.subarray(i * 4, i * 4 + 4), i * 4); PG.set(T.subarray(i * 3, i * 3 + 3), i * 3); continue; }
    qMulA(RG, p * 4, R, i * 4, RG, i * 4); qRotA(RG, p * 4, T, i * 3, PG, i * 3);
    PG[i * 3] += PG[p * 3]; PG[i * 3 + 1] += PG[p * 3 + 1]; PG[i * 3 + 2] += PG[p * 3 + 2];
  }
  const child = new Int16Array(J).fill(-1); for (let i = 0; i < J; i++) if (par[i] >= 0 && child[par[i]] < 0) child[par[i]] = i;
  const up = new Uint8Array(J); for (let i = 0; i < J; i++) { let k = i; while (k >= 0 && M.joints[k].n !== 'spine_01') k = par[k]; up[i] = k >= 0 ? 1 : 0; }
  const clips = {};
  for (const c of M.clips) {
    const w16 = new Int16Array(u8.buffer.slice(c.off, c.off + c.len * 2)), np = c.per.length, nc = c.cst.length, n = c.n;
    const cq = new Float32Array(nc * 4), q = new Float32Array(n * np * 4), pt = new Float32Array(n * 3); let k = 0;
    const rd = (out, o) => { const x = w16[k++] / 32767, y = w16[k++] / 32767, z = w16[k++] / 32767; out[o] = x; out[o + 1] = y; out[o + 2] = z; out[o + 3] = Math.sqrt(Math.max(0, 1 - x * x - y * y - z * z)); };
    for (let i = 0; i < nc; i++) rd(cq, i * 4);
    for (let f = 0; f < n; f++) { for (let i = 0; i < np; i++) rd(q, (f * np + i) * 4); pt[f * 3] = w16[k++] / 1e4; pt[f * 3 + 1] = w16[k++] / 1e4; pt[f * 3 + 2] = w16[k++] / 1e4; }
    const slot = new Int16Array(J).fill(-1), cslot = new Int16Array(J).fill(-1);
    c.per.forEach((j, i) => { slot[j] = i; }); c.cst.forEach((j, i) => { cslot[j] = i; });
    clips[c.k] = { k: c.k, n, fps: c.fps, loop: !!c.loop, dur: c.dur, p0: c.p0, v: c.v, np, q, cq, pt, slot, cslot };
  }
  const legLen = Math.hypot(...T.subarray(jn.calf_l * 3, jn.calf_l * 3 + 3)) + Math.hypot(...T.subarray(jn.foot_l * 3, jn.foot_l * 3 + 3));
  return (SKN.data = { nv, ni, pos, nrm, tan, uv, bj, bw, rg, idx, J, par, jn, T, R, RG, PG, child, up, clips, legLen, pelvis: jn.pelvis });
}
function sknScene() {
  if (SKN.scn === SCN && SKN.geo) return;
  const D = sknData(), C = ASSET_CHR.human, g = new BABYLON.Geometry('sknGeo', SCN);
  g.setVerticesData('position', D.pos, false, 3); g.setVerticesData('normal', D.nrm, false, 3); g.setVerticesData('tangent', D.tan, false, 4);
  g.setVerticesData('uv', D.uv, false, 2); g.setVerticesData('bj', D.bj, false, 4); g.setVerticesData('bw', D.bw, false, 4); g.setVerticesData('rg', D.rg, false, 4);
  g.setIndices(D.idx);
  const tx = (s) => { const t = new BABYLON.Texture('data:image/webp;base64,' + C[s], SCN, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE); t.anisotropicFilteringLevel = 4; t.wrapU = t.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE; return t; };
  SKN.geo = g; SKN.scn = SCN; SKN.tex = { a: tx('a'), n: tx('n'), e: tx('e') }; SKN.rigs = [];
}
// ---- character profiles ----
// len: bone length factors (scales the bone and its children's offsets), cross: thickness factors, loco: clip set, k: AI gait-phase constant
const SKP = {
  explorer: { outfit: 'HAZMAT', len: {}, cross: { limb: 1.12, torso: 1.06 }, inf: [0.014, 0.004, 0.022], loco: { idle: 'idle', walk: 'walk', run: 'jog', sprint: 'sprint' }, spec: 0.32, shin: 22, wrinkle: 0.85, wet: 0.06, wrap: 0.45 },
  howler: { outfit: 'CREATURE', len: { leg: 1.36, arm: 1.6, hand: 1.5, spine: 1.14, neck: 2.2, head: 1.18 }, cross: { limb: 0.62, torso: 0.78, neck: 0.6, head: 0.82 }, inf: [0, 0, 0], loco: { idle: 'zidle', walk: 'zwalk', run: 'sprint', sprint: 'sprint' }, spec: 0.9, shin: 42, wrinkle: 0.5, wet: 0.7, wrap: 0.1, mottle: 0.7, eye: [0.95, 0.92, 0.8, 1] },
  watch: { outfit: 'WATCH', len: { leg: 1.42, arm: 1.75, spine: 1.18, neck: 1.6, hand: 1.3 }, cross: { limb: 0.82, torso: 0.9 }, inf: [0.012, 0, 0], loco: { idle: 'idle', walk: 'fwalk', run: 'jog', sprint: 'sprint' }, spec: 0.22, shin: 14, wrinkle: 0.6, wet: 0.1, wrap: 0.25, mottle: 0.6, eye: [1, 0.95, 0.72, 1] },
  wretch: { outfit: 'RAGS', len: { arm: 1.12, neck: 1.2 }, cross: { limb: 0.68, torso: 0.8, neck: 0.75 }, inf: [0, 0, 0], loco: { idle: 'zidle', walk: 'zwalk', run: 'jog', sprint: 'sprint' }, spec: 0.5, shin: 26, wrinkle: 0.85, wet: 0.3, wrap: 0.45, mottle: 0.95, eye: [1, 0.9, 0.6, 0.6] },
  subject: { outfit: 'GOWN', len: { arm: 1.08 }, cross: { limb: 0.74, torso: 0.84 }, inf: [0, 0, 0], loco: { idle: 'cidle', walk: 'zwalk', run: 'jog', sprint: 'sprint' }, spec: 0.4, shin: 22, wrinkle: 0.6, wet: 0.25, wrap: 0.45, mottle: 0.7, eye: [1, 0.9, 0.6, 0.3] },
  hale: { outfit: 'LAB', len: {}, cross: {}, inf: [0.008, 0, 0], loco: { idle: 'idle', walk: 'walk', run: 'jog', sprint: 'sprint' }, spec: 0.28, shin: 20, wrinkle: 0.35, wet: 0, wrap: 0.5, mottle: 0.2 },
  forgotten: { outfit: 'FACELESS', len: { leg: 1.3, arm: 1.5, spine: 1.1, neck: 1.3, hand: 1.4 }, cross: { limb: 0.6, torso: 0.72, head: 0.9 }, inf: [0, 0, 0], loco: { idle: 'zidle', walk: 'zwalk', run: 'jog', sprint: 'sprint' }, spec: 0.01, shin: 2, wrinkle: 0, wet: 0, wrap: 0.2 },
};
const SKG = { leg: ['thigh_l', 'thigh_r', 'calf_l', 'calf_r'], arm: ['upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r'], hand: ['hand_l', 'hand_r'], spine: ['spine_01', 'spine_02', 'spine_03'], neck: ['neck_01'], head: ['Head'],
  limb: ['upperarm_l', 'upperarm_r', 'lowerarm_l', 'lowerarm_r', 'thigh_l', 'thigh_r', 'calf_l', 'calf_r'], torso: ['pelvis', 'spine_01', 'spine_02', 'spine_03'] };
// per-profile static data: scaled offsets + (cross/length scale x inverse bind) matrices
function sknShape(P) {
  if (P.__shape) return P.__shape;
  const D = sknData(), J = D.J, L = new Float32Array(J).fill(1), X = new Float32Array(J).fill(1);
  for (const [g, f] of Object.entries(P.len || {})) for (const n of SKG[g] || [g]) if (D.jn[n] !== undefined) L[D.jn[n]] = f;
  for (const [g, f] of Object.entries(P.cross || {})) for (const n of SKG[g] || [g]) if (D.jn[n] !== undefined) X[D.jn[n]] = f;
  if (P.len && P.len.hand) for (let j = 0; j < J; j++) { const p = D.par[j]; if (p >= 0 && /index|middle|ring|pinky|thumb/.test(sknName(j)) && !/_01_/.test(sknName(j))) L[p] = P.len.hand; }
  const Ts = new Float32Array(J * 3), B = new Float32Array(J * 12);
  for (let j = 0; j < J; j++) { const p = D.par[j], f = p >= 0 ? L[p] : 1; Ts[j * 3] = D.T[j * 3] * f; Ts[j * 3 + 1] = D.T[j * 3 + 1] * f; Ts[j * 3 + 2] = D.T[j * 3 + 2] * f; }
  const m = new Float32Array(9);
  for (let j = 0; j < J; j++) {
    // inverse bind: [R^T | -R^T P] of the rest global
    const x = D.RG[j * 4], y = D.RG[j * 4 + 1], z = D.RG[j * 4 + 2], w = D.RG[j * 4 + 3];
    const r = [1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w), 2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w), 2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)];
    const P0 = [D.PG[j * 3], D.PG[j * 3 + 1], D.PG[j * 3 + 2]];
    const ib = [r[0], r[3], r[6], r[1], r[4], r[7], r[2], r[5], r[8]];   // R^T (row-major)
    const it = [-(ib[0] * P0[0] + ib[1] * P0[1] + ib[2] * P0[2]), -(ib[3] * P0[0] + ib[4] * P0[1] + ib[5] * P0[2]), -(ib[6] * P0[0] + ib[7] * P0[1] + ib[8] * P0[2])];
    // C = sx*I + (sl - sx) a a^T along the bone axis (towards the first child, in joint-local space)
    const c = D.child[j], sl = L[j], sx = X[j];
    let a = [0, 1, 0]; if (c >= 0) { const t = [D.T[c * 3], D.T[c * 3 + 1], D.T[c * 3 + 2]], l = Math.hypot(...t) || 1; a = t.map(v => v / l); }
    for (let i = 0; i < 3; i++) for (let k = 0; k < 3; k++) m[i * 3 + k] = (i === k ? sx : 0) + (sl - sx) * a[i] * a[k];
    for (let i = 0; i < 3; i++) {
      for (let k = 0; k < 3; k++) B[j * 12 + i * 4 + k] = m[i * 3] * ib[k] + m[i * 3 + 1] * ib[3 + k] + m[i * 3 + 2] * ib[6 + k];
      B[j * 12 + i * 4 + 3] = m[i * 3] * it[0] + m[i * 3 + 1] * it[1] + m[i * 3 + 2] * it[2];
    }
  }
  const legK = ((L[D.jn.thigh_l] - 1) * Math.hypot(...D.T.subarray(D.jn.calf_l * 3, D.jn.calf_l * 3 + 3)) + (L[D.jn.calf_l] - 1) * Math.hypot(...D.T.subarray(D.jn.foot_l * 3, D.jn.foot_l * 3 + 3)));
  return (P.__shape = { L, X, Ts, B, lift: legK, legF: 1 + legK / D.legLen });
}
function sknName(j) { return ASSET_CHR.human.meta.joints[j].n; }
// ---- rig construction ----
function sknFollow(r, jName, off) { const n = tnode(r.root); n.rotationQuaternion = new BABYLON.Quaternion(); r.sk.fol.push({ n, j: sknData().jn[jName], off: off || null }); return n; }
function buildSkinned(kind, o = {}) {
  sknScene();
  const D = sknData(), P = SKP[kind], S = sknShape(P);
  const mat = new BABYLON.ShaderMaterial('skn_' + kind, SCN, { vertex: 'skin', fragment: 'skin' }, {
    attributes: ['position', 'normal', 'tangent', 'uv', 'bj', 'bw', 'rg'],
    uniforms: ['world', 'viewProjection', ...COMMON_UNIFORMS, 'bones', 'sInf', 'aP', 'aP2', 'aTint', 'aEmi', 'oC1', 'oC2', 'oC3', 'oEye', 'oK'],
    samplers: ['lightTex', 'albTex', 'nrmTex', 'eyeTex'], defines: ['O_' + P.outfit, 'NBV ' + D.J * 3] });
  mat.setTexture('lightTex', LV.lightTex); mat.setTexture('albTex', SKN.tex.a); mat.setTexture('nrmTex', SKN.tex.n); mat.setTexture('eyeTex', SKN.tex.e);
  mat.setVector4('aP', new BABYLON.Vector4(P.spec ?? 0.3, P.shin ?? 20, P.wrinkle ?? 0, 1));
  mat.__p2 = new BABYLON.Vector4(0, P.wet ?? 0, P.wrap ?? 0.3, P.mottle ?? 0); mat.setVector4('aP2', mat.__p2);
  mat.__emi = new BABYLON.Vector3(1, 1, 1); mat.setVector3('aEmi', mat.__emi); mat.setVector4('aTint', new BABYLON.Vector4(1, 1, 1, 1));
  const inf = P.inf || [0, 0, 0]; mat.setVector4('sInf', new BABYLON.Vector4(inf[0], inf[1], inf[2], 0));
  const c = o.colors || {}, v4 = (a, w = 0) => new BABYLON.Vector4(a[0], a[1], a[2], a[3] ?? w);
  mat.setVector4('oC1', v4(c.skin || [0.78, 0.62, 0.52])); mat.setVector4('oC2', v4(c.a || [0.8, 0.6, 0.15])); mat.setVector4('oC3', v4(c.b || [0.3, 0.3, 0.3]));
  mat.setVector4('oEye', v4(P.eye || [0, 0, 0, 0])); mat.setVector4('oK', new BABYLON.Vector4(o.k0 ?? 0, o.k1 ?? 0, o.k2 ?? 0, Math.random() * 50));
  const bones = new Float32Array(D.J * 12); mat.setArray4('bones', bones);
  MATS.list.push(mat);
  const root = tnode(null), r = { root, mat, kind: o.rigKind || 'human', hipH: 0.95 + S.lift, skinned: true };
  r.acc = actMat('acc_' + kind, { spec: 0.35, shin: 24, wrinkle: 0.2, emis: 1, wrap: 0.4 }); mat.__twin = r.acc;
  const mesh = new BABYLON.Mesh('skn_' + kind, SCN); SKN.geo.applyToMesh(mesh); mesh.parent = root; mesh.material = mat; mesh.isPickable = false;
  mesh.setBoundingInfo(new BABYLON.BoundingInfo(V3(-1.8, -0.6, -1.8), V3(1.8, 3.2, 1.8)));
  r.body = mesh;
  r.sk = { P, S, bones, lq: new Float32Array(D.J * 4), acc: new Float32Array(D.J * 4), aq: new Float32Array(D.J * 4), Q: new Float32Array(D.J * 4), Pg: new Float32Array(D.J * 3),
    pt: new Float32Array(3), at: new Float32Array(3), u: 0, ti: Math.random() * 10, spd: 0, px: null, pz: 0, act: null, base: null, def: null, fol: [], seen: false };
  // proxies for the procedural interface (inputs only, except el[] which also follow the forearms for torch placement)
  r.hips = tnode(root, 0, r.hipH, 0); r.torso = tnode(r.hips); r.neck = tnode(r.torso); r.head = tnode(r.neck);
  r.sh = [tnode(r.torso), tnode(r.torso)]; r.hip = [tnode(r.hips), tnode(r.hips)]; r.kn = [tnode(r.hip[0]), tnode(r.hip[1])];
  r.el = [sknFollow(r, 'lowerarm_l', { arm: -1 }), sknFollow(r, 'lowerarm_r', { arm: 1 })];
  r.hands = [sknFollow(r, 'hand_l', { arm: -1 }), sknFollow(r, 'hand_r', { arm: 1 })];
  r.fHead = sknFollow(r, 'Head'); r.fChest = sknFollow(r, 'spine_03'); r.fPelvis = sknFollow(r, 'pelvis');
  SKN.rigs.push(r);
  sknPose(r, 0, true);
  return r;
}
// ---- animation API used by the AI ----
function rigPlay(r, k, o = {}) {
  if (!r.sk) return; const c = sknData().clips[k]; if (!c) return; const a = r.sk.act;
  if (a && a.c === c && !o.restart) { a.out = false; return; }
  const fade = o.fade ?? 0.25;
  if (a && a.w > 0.02 && fade > 0) { a.out = true; a.fade = fade; r.sk.prev = a; }   // cross-fade out of the running action
  r.sk.act = { c, t: o.t ?? 0, w: o.w ?? 0, fade, rate: o.rate ?? 1, loop: o.loop ?? c.loop, hold: !!o.hold, upper: !!o.upper, range: o.range || null, out: false, want: false };
}
// state-driven looping action: one-shot actions (attacks, flinches) keep priority until they finish
function rigWant(r, k, o) {
  const s = r.sk; if (!s) return; const a = s.act;
  if (!k) { if (a && a.want && !a.out) rigStop(r, o && o.fade); return; }
  if (a && !a.want && !a.out) return;
  if (a && a.want && a.c === sknData().clips[k]) { a.out = false; return; }
  rigPlay(r, k, Object.assign({ loop: true, restart: true }, o)); if (s.act) s.act.want = true;
}
function rigStop(r, fade) { const a = r.sk && r.sk.act; if (a) { a.out = true; if (fade !== undefined) a.fade = fade; } }
function rigBase(r, k) { if (r.sk) r.sk.base = k || null; }
function animHumanSk(r, ph, amp, st) {
  const s = Math.sin(ph), c = Math.cos(ph), A = st.legA ?? 0.55, aA = st.armA ?? 0.45, e0 = -0.18 - 0.35 * amp;
  const d = r.sk.def || (r.sk.def = {});
  d.sh0 = -s * aA * amp; d.sh1 = s * aA * amp; d.el = e0; d.tx = 0.04 + 0.06 * amp; d.hy = r.hipH - 0.03 * amp + Math.abs(c) * 0.045 * amp;
  d.h0 = s * A * amp; d.h1 = -s * A * amp; d.k0 = Math.max(0, -c) * 0.95 * amp + 0.05; d.k1 = Math.max(0, c) * 0.95 * amp + 0.05;
  r.hip[0].rotation.x = d.h0; r.hip[1].rotation.x = d.h1; r.kn[0].rotation.x = d.k0; r.kn[1].rotation.x = d.k1;
  r.sh[0].rotation.set(d.sh0 + (st.armL ?? 0), 0, st.armZ ? -st.armZ : 0); r.sh[1].rotation.set(d.sh1 + (st.armR ?? 0), 0, st.armZ || 0);
  r.el[0].rotation.x = st.elL ?? e0; r.el[1].rotation.x = st.elR ?? e0;
  r.hips.position.y = d.hy + (st.drop || 0); r.hips.rotation.set(0, 0, 0);
  r.torso.rotation.set((st.lean ?? 0.04) + 0.06 * amp, s * 0.07 * amp, 0);
  r.head.rotation.set(st.lookX ?? 0, st.look ?? 0, st.lookZ ?? 0);
  r.sk.drop = st.drop || 0;
}
function poseDeadSk(r, side, instant) { rigPlay(r, 'death', { hold: true, fade: instant ? 0 : 0.15, t: instant ? 99 : 0, w: instant ? 1 : 0, restart: true }); r.sk.deadSide = side; r.sk.spd = 0; }
// ---- per-frame evaluation ----
function sknAct(D, k, a, dt, force, acc, at) {
  a.t += dt * a.rate;
  const end = a.c.dur; let tt = a.t;
  if (a.range) { const r0 = a.range[0], L = a.range[1] - r0; if (tt > r0) { const u = (tt - r0) % (2 * L); tt = r0 + (u < L ? u : 2 * L - u); } }   // ping-pong inside a sub-range
  else if (!a.loop && !a.hold && a.t >= end - a.fade) a.out = true;
  a.w = a.out ? Math.max(0, a.w - (a.fade > 0 ? dt / a.fade : 1)) : Math.min(1, a.w + (a.fade > 0 ? dt / a.fade : 1));
  if (force && !a.out && a.hold) a.w = 1;
  if (a.out && a.w <= 0) return false;
  const aq = k.aq, aT = _skT, J = D.J; aq.fill(0); aT[0] = aT[1] = aT[2] = 0;
  clipAdd(D, a.c, a.loop ? tt : Math.min(tt, end), 1, aq, aT); qNormAll(D, aq);
  const w = smooth(0, 1, a.w);
  for (let j = 0; j < J; j++) {
    const m = a.upper ? D.up[j] * w : w; if (m <= 0) continue;
    const o = j * 4, sg = acc[o] * aq[o] + acc[o + 1] * aq[o + 1] + acc[o + 2] * aq[o + 2] + acc[o + 3] * aq[o + 3] < 0 ? -1 : 1;
    for (let i = 0; i < 4; i++) acc[o + i] += (aq[o + i] * sg - acc[o + i]) * m;
  }
  if (!a.upper) for (let i = 0; i < 3; i++) at[i] += (aT[i] - at[i]) * w;
  qNormAll(D, acc);
  return true;
}
function clipAdd(D, c, time, w, acc, at) {
  if (w <= 1e-4) return;
  const n = c.n; let fp = time * c.fps, f0, f1;
  if (c.loop) { fp = ((fp % n) + n) % n; f0 = Math.floor(fp); f1 = (f0 + 1) % n; } else { fp = Math.min(Math.max(fp, 0), n - 1); f0 = Math.floor(fp); f1 = Math.min(f0 + 1, n - 1); }
  const a = fp - f0, q = c.q, R = D.R;
  for (let j = 0; j < D.J; j++) {
    let x, y, z, ww;
    const sl = c.slot[j];
    if (sl >= 0) {
      const o0 = (f0 * c.np + sl) * 4, o1 = (f1 * c.np + sl) * 4, sg = q[o0] * q[o1] + q[o0 + 1] * q[o1 + 1] + q[o0 + 2] * q[o1 + 2] + q[o0 + 3] * q[o1 + 3] < 0 ? -1 : 1;
      x = q[o0] + (q[o1] * sg - q[o0]) * a; y = q[o0 + 1] + (q[o1 + 1] * sg - q[o0 + 1]) * a; z = q[o0 + 2] + (q[o1 + 2] * sg - q[o0 + 2]) * a; ww = q[o0 + 3] + (q[o1 + 3] * sg - q[o0 + 3]) * a;
    } else if (c.cslot[j] >= 0) { const o = c.cslot[j] * 4; x = c.cq[o]; y = c.cq[o + 1]; z = c.cq[o + 2]; ww = c.cq[o + 3]; }
    else { x = R[j * 4]; y = R[j * 4 + 1]; z = R[j * 4 + 2]; ww = R[j * 4 + 3]; }
    const ws = x * R[j * 4] + y * R[j * 4 + 1] + z * R[j * 4 + 2] + ww * R[j * 4 + 3] < 0 ? -w : w;
    acc[j * 4] += x * ws; acc[j * 4 + 1] += y * ws; acc[j * 4 + 2] += z * ws; acc[j * 4 + 3] += ww * ws;
  }
  const o0 = f0 * 3, o1 = f1 * 3, p = c.pt;
  at[0] += (p[o0] + (p[o1] - p[o0]) * a) * w; at[1] += (p[o0 + 1] + (p[o1 + 1] - p[o0 + 1]) * a) * w; at[2] += (p[o0 + 2] + (p[o1 + 2] - p[o0 + 2]) * a) * w;
}
function qNormAll(D, q) { for (let j = 0; j < D.J; j++) { const o = j * 4, l = Math.hypot(q[o], q[o + 1], q[o + 2], q[o + 3]); if (l < 1e-6) { q[o] = D.R[o]; q[o + 1] = D.R[o + 1]; q[o + 2] = D.R[o + 2]; q[o + 3] = D.R[o + 3]; } else { q[o] /= l; q[o + 1] /= l; q[o + 2] /= l; q[o + 3] /= l; } } }
const SKV = { walk: 1.0, fwalk: 0.95, zwalk: 0.75, cwalk: 0.7, jog: 3.4, sprint: 4.6 };   // tuned natural ground speeds (m/s, unscaled body)
function sknPose(r, dt, force) {
  const D = sknData(), k = r.sk, P = k.P, S = k.S, J = D.J, ro = r.root;
  // locomotion speed from the root's own motion (teleports reset it)
  const rx = ro.position.x, rz = ro.position.z;
  if (k.px === null || dt <= 0) { if (k.px === null) { k.px = rx; k.pz = rz; } }
  else { const dd = Math.hypot(rx - k.px, rz - k.pz); k.px = rx; k.pz = rz; const v = dd > 1.5 ? 0 : dd / dt; k.spd += (v - k.spd) * Math.min(1, dt * 7); }
  const sc = S.legF * (ro.scaling ? ro.scaling.y : 1), vN = k.spd / sc;
  const L = P.loco, C = D.clips, acc = k.acc, at = k.at;
  acc.fill(0); at[0] = at[1] = at[2] = 0;
  const t1 = smooth(0.12, 0.55, vN), t2 = smooth(1.6, 2.6, vN), t3 = smooth(3.7, 4.5, vN);
  const wI = 1 - t1, wW = t1 * (1 - t2), wR = t1 * t2 * (1 - t3), wS = t1 * t2 * t3;
  const idle = C[k.base || L.idle] || C.idle;
  k.ti += dt;
  // shared gait phase: every loop is aligned on its left-foot-forward frame (p0)
  let rate = 0, wsum = 0;
  for (const [w, key] of [[wW, L.walk], [wR, L.run], [wS, L.sprint]]) { if (w <= 0) continue; const c = C[key]; rate += w * clamp(vN / (SKV[key] || c.v || 1), 0.72, 1.45) / c.dur; wsum += w; }
  if (wsum > 0) k.u = (k.u + dt * rate / wsum) % 1;
  clipAdd(D, idle, k.ti, wI, acc, at);
  for (const [w, key] of [[wW, L.walk], [wR, L.run], [wS, L.sprint]]) { const c = C[key]; if (w > 0) clipAdd(D, c, ((k.u + c.p0) % 1) * c.dur, w, acc, at); }
  qNormAll(D, acc);
  // action / state clips on top (full body or upper body); a replaced action fades out underneath the new one
  if (k.prev && !sknAct(D, k, k.prev, dt, false, acc, at)) k.prev = null;
  if (k.act && !sknAct(D, k, k.act, dt, force, acc, at)) k.act = null;
  // forward kinematics with the procedural layers (model-space deltas from the proxy rotations)
  const Q = k.Q, Pg = k.Pg, d = k.def || { sh0: 0, sh1: 0, el: -0.18, tx: 0.04, hy: r.hipH, h0: 0, h1: 0, k0: 0.05, k1: 0.05 }, jn = D.jn;
  const hp = r.hips, to = r.torso, he = r.head;
  const lean = to.rotation.x - d.tx, look = he.rotation.y, lookX = he.rotation.x, lookZ = he.rotation.z;
  for (let j = 0; j < J; j++) {
    const p = D.par[j], o = j * 4, o3 = j * 3;
    if (p < 0) { Q[o] = acc[o]; Q[o + 1] = acc[o + 1]; Q[o + 2] = acc[o + 2]; Q[o + 3] = acc[o + 3]; Pg[o3] = S.Ts[o3]; Pg[o3 + 1] = S.Ts[o3 + 1]; Pg[o3 + 2] = S.Ts[o3 + 2]; continue; }
    qMulA(Q, p * 4, acc, o, Q, o);
    if (j === D.pelvis) { _skV[0] = at[0]; _skV[1] = at[1]; _skV[2] = at[2]; qRotA(Q, p * 4, _skV, 0, Pg, o3); Pg[o3 + 1] += S.lift; }
    else qRotA(Q, p * 4, S.Ts, o3, Pg, o3);
    Pg[o3] += Pg[p * 3]; Pg[o3 + 1] += Pg[p * 3 + 1]; Pg[o3 + 2] += Pg[p * 3 + 2];
    // procedural layers
    if (j === D.pelvis) {
      const bx = hp.rotation.x, dy = hp.position.y - d.hy;
      if (bx) { qPreEuler(Q, o, bx, 0, 0); }
      if (dy) Pg[o3 + 1] += dy * (r.sk.drop && dy < 0 ? 0.35 : 1);
      if (bx) Pg[o3 + 1] = Math.max(Pg[o3 + 1], 0.16);
    } else if (j === jn.spine_01 || j === jn.spine_02 || j === jn.spine_03) qPreEuler(Q, o, lean * (j === jn.spine_01 ? 0.4 : 0.3), 0, 0);
    else if (j === jn.neck_01) qPreEuler(Q, o, lookX * 0.35, look * 0.35, lookZ * 0.3);
    else if (j === jn.Head) qPreEuler(Q, o, lookX * 0.65, look * 0.65, lookZ * 0.7);
    else if (j === jn.upperarm_l || j === jn.upperarm_r) { const i = j === jn.upperarm_l ? 0 : 1, sh = r.sh[i].rotation; qPreEuler(Q, o, sh.x - (i ? d.sh1 : d.sh0), sh.y, sh.z); }
    else if (j === jn.lowerarm_l || j === jn.lowerarm_r) { const i = j === jn.lowerarm_l ? 0 : 1; qPreEuler(Q, o, (r.el[i].rotation.x - d.el) * 0.8, 0, 0); }
    else if (j === jn.thigh_l || j === jn.thigh_r) { const i = j === jn.thigh_l ? 0 : 1, x = r.hip[i].rotation.x - (i ? d.h1 : d.h0); if (x) qPreEuler(Q, o, x, 0, 0); }
    else if (j === jn.calf_l || j === jn.calf_r) { const i = j === jn.calf_l ? 0 : 1, x = r.kn[i].rotation.x - (i ? d.k1 : d.k0); if (x) qPreEuler(Q, o, x, 0, 0); }
  }
  // skin palette: [R(Q) | P] * B
  const B = S.B, out = k.bones;
  for (let j = 0; j < J; j++) {
    const o = j * 4, x = Q[o], y = Q[o + 1], z = Q[o + 2], w = Q[o + 3], px = Pg[j * 3], py = Pg[j * 3 + 1], pz = Pg[j * 3 + 2];
    const r00 = 1 - 2 * (y * y + z * z), r01 = 2 * (x * y - z * w), r02 = 2 * (x * z + y * w), r10 = 2 * (x * y + z * w), r11 = 1 - 2 * (x * x + z * z), r12 = 2 * (y * z - x * w), r20 = 2 * (x * z - y * w), r21 = 2 * (y * z + x * w), r22 = 1 - 2 * (x * x + y * y);
    const b = j * 12;
    for (let c = 0; c < 4; c++) {
      const b0 = B[b + c], b1 = B[b + 4 + c], b2 = B[b + 8 + c], t = c === 3 ? 1 : 0;
      out[b + c] = r00 * b0 + r01 * b1 + r02 * b2 + px * t; out[b + 4 + c] = r10 * b0 + r11 * b1 + r12 * b2 + py * t; out[b + 8 + c] = r20 * b0 + r21 * b1 + r22 * b2 + pz * t;
    }
  }
  // bone followers (accessories, torch arm): rest-aligned axes
  for (const f of k.fol) {
    const j = f.j, o = j * 4, n = f.n, q = n.rotationQuaternion;
    _skQ[0] = -D.RG[o]; _skQ[1] = -D.RG[o + 1]; _skQ[2] = -D.RG[o + 2]; _skQ[3] = D.RG[o + 3];
    qMulA(Q, o, _skQ, 0, _skQ, 4);
    if (f.off && f.off.arm) {   // forearm frame: local -Y along the forearm, origin shifted so the AI's torch-tip offset lands on the torch
      _skQ[8] = 0; _skQ[9] = 0; _skQ[10] = Math.sin(f.off.arm * Math.PI / 4); _skQ[11] = Math.cos(Math.PI / 4);
      qMulA(_skQ, 4, _skQ, 8, _skQ, 4);
    }
    q.set(_skQ[4], _skQ[5], _skQ[6], _skQ[7]);
    n.position.set(Pg[j * 3], Pg[j * 3 + 1], Pg[j * 3 + 2]);
    if (f.off && f.off.shift) { _skV[0] = 0; _skV[1] = -f.off.shift; _skV[2] = 0; qRotA(_skQ, 4, _skV, 0, _skV, 0); n.position.x += _skV[0]; n.position.y += _skV[1]; n.position.z += _skV[2]; }
  }
}
const _skT = new Float32Array(3), _skV = new Float32Array(3), _skQ = new Float32Array(12);
function sknTick(dt) {
  if (!SKN.rigs.length || SKN.scn !== SCN) return;
  if ((SKN.prune = (SKN.prune || 0) + 1) % 120 === 0) SKN.rigs = SKN.rigs.filter(r => !(r.root.isDisposed && r.root.isDisposed()));
  for (const r of SKN.rigs) {
    if (r.root.isDisposed && r.root.isDisposed()) continue;
    const vis = r.__vis !== false, near = dist2(r.root.position.x, r.root.position.z, CAM.position.x, CAM.position.z) < 45;
    if (!vis && !(r.sk.torch && near)) { r.sk.px = null; continue; }
    sknPose(r, dt);
  }
}
// ---- role builders (accessories are ordinary vertex-coloured parts riding on bone followers) ----
// offsets are authored in the character's model space at rest: sknAt(joint, [x, y, z]) -> follower-local
function sknAt(jName, p) { const D = sknData(), j = D.jn[jName]; return [p[0] - D.PG[j * 3], p[1] - D.PG[j * 3 + 1], p[2] - D.PG[j * 3 + 2]]; }
function buildExplorerSk(o = {}) {
  const tint = (o.tint || [0.86, 0.68, 0.16]).map((v, i) => v * [0.9, 0.88, 0.8][i]);
  const r = buildSkinned('explorer', { colors: { a: tint } }), m = r.acc, h = r.fHead, ch = r.fChest;
  const BLK = [0.045, 0.045, 0.045], GLASS = o.mimic ? [0.9, 0.12, 0.08] : [0.07, 0.09, 0.11], FILT = [0.17, 0.19, 0.14], PACK = [0.2, 0.2, 0.19], TAPE = [0.5, 0.5, 0.48];
  // full-face respirator
  part('Sphere', { diameter: 0.25, segments: 16 }, h, m, BLK, 0, sknAt('Head', [0, 1.665, 0.06]), null, [0.8, 0.9, 0.62]);
  r.lens = [];
  for (const s of [-1, 1]) {
    r.lens.push(part('Cylinder', { diameter: 0.048, height: 0.016, tessellation: 16 }, h, m, GLASS, o.mimic ? 1 : 0, sknAt('Head', [s * 0.034, 1.705, 0.128]), [Math.PI / 2 - 0.12, 0, 0]));
    part('Torus', { diameter: 0.052, thickness: 0.011, tessellation: 16 }, h, m, BLK, 0, sknAt('Head', [s * 0.034, 1.705, 0.131]), [Math.PI / 2 - 0.12, 0, 0]);
    part('Cylinder', { diameter: 0.052, height: 0.045, tessellation: 12 }, h, m, FILT, 0, sknAt('Head', [s * 0.066, 1.62, 0.12]), [Math.PI / 2, s * 0.85, 0]);
  }
  part('Cylinder', { diameter: 0.07, height: 0.06, tessellation: 14 }, h, m, FILT, 0, sknAt('Head', [0, 1.618, 0.15]), [Math.PI / 2 - 0.35, 0, 0]);
  part('Torus', { diameter: 0.2, thickness: 0.02, tessellation: 18 }, h, m, BLK, 0, sknAt('Head', [0, 1.68, 0.075]), [Math.PI / 2 - 0.1, 0, 0], [1, 1.12, 1]);
  // back pack, air tank, chest radio
  part('Box', { width: 0.28, height: 0.36, depth: 0.12 }, ch, m, PACK, 0, sknAt('spine_03', [0, 1.3, -0.2]));
  part('Box', { width: 0.3, height: 0.04, depth: 0.14 }, ch, m, BLK, 0, sknAt('spine_03', [0, 1.13, -0.2]));
  part('Cylinder', { diameter: 0.1, height: 0.42, tessellation: 12 }, ch, m, [0.55, 0.55, 0.52], 0, sknAt('spine_03', [0.09, 1.33, -0.29]));
  // harness straps follow the chest profile (lower run + over-the-shoulder run), radio clipped on the right strap
  for (const s of [-1, 1]) {
    part('Box', { width: 0.04, height: 0.27, depth: 0.012 }, ch, m, BLK, 0, sknAt('spine_03', [s * 0.11, 1.25, 0.127]), [0.12, 0, 0]);
    part('Box', { width: 0.04, height: 0.2, depth: 0.012 }, ch, m, BLK, 0, sknAt('spine_03', [s * 0.112, 1.47, 0.088]), [-0.5, 0, 0]);
  }
  part('Box', { width: 0.075, height: 0.12, depth: 0.04 }, ch, m, BLK, 0, sknAt('spine_03', [0.095, 1.34, 0.158]), [0.1, 0, 0]);
  part('Cylinder', { diameter: 0.011, height: 0.15, tessellation: 6 }, ch, m, BLK, 0, sknAt('spine_03', [0.12, 1.46, 0.156]));
  part('Box', { width: 0.02, height: 0.012, depth: 0.01 }, ch, m, [0.2, 1, 0.3], 1, sknAt('spine_03', [0.08, 1.38, 0.18]));
  part('Box', { width: 0.11, height: 0.035, depth: 0.008 }, ch, m, TAPE, 0, sknAt('spine_03', [-0.085, 1.33, 0.135]), [0.1, -0.25, 0]);
  if (o.flashlight) {
    r.torch = part('Cylinder', { diameter: 0.045, height: 0.2, tessellation: 10 }, r.el[1], m, BLK, 0, [0, -0.38, 0.02]);
    part('Cylinder', { diameter: 0.05, height: 0.012, tessellation: 12 }, r.el[1], m, [1, 0.95, 0.8], 1, [0, -0.485, 0.02]);
    r.sk.torch = true;
  }
  if (o.mimic) setEmi(r.mat, 0);
  return r;
}
function buildHowlerSk() {
  const r = buildSkinned('howler', { colors: { skin: [0.095, 0.085, 0.078] }, rigKind: 'howler' }), m = r.acc, h = r.fHead;
  part('Sphere', { diameter: 0.1, segments: 12 }, h, m, [0.16, 0.02, 0.02], 0, sknAt('Head', [0, 1.635, 0.1]), null, [0.62, 1.5, 0.4]);
  setEmi(r.mat, 0.15);
  return r;
}
function buildWatchSk() {
  const r = buildSkinned('watch', { colors: { skin: [0.3, 0.29, 0.27], a: [0.12, 0.11, 0.1], b: [0.8, 0.33, 0.05] }, rigKind: 'watch' }), m = r.acc, h = r.fHead;
  const CAP = [0.08, 0.1, 0.18], COAT = [0.12, 0.11, 0.1];
  part('Cylinder', { diameter: 0.205, height: 0.085, tessellation: 16 }, h, m, CAP, 0, sknAt('Head', [0, 1.775, -0.012]));
  part('Box', { width: 0.17, height: 0.012, depth: 0.12 }, h, m, CAP, 0, sknAt('Head', [0, 1.745, 0.115]), [-0.15, 0, 0]);
  part('Cylinder', { diameterTop: 0.36, diameterBottom: 0.6, height: 0.7, tessellation: 14, cap: BABYLON.Mesh.NO_CAP, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, r.fPelvis, m, COAT, 0, [0, -0.32, -0.01], null, [1, 1, 0.8]);
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; part('Box', { width: 0.07, height: rnd(0.16, 0.34), depth: 0.01 }, r.fPelvis, m, COAT, 0, [Math.sin(a) * 0.28, -0.68, Math.cos(a) * 0.23], [0, a, rnd(-0.1, 0.1)]); }
  r.sk.fol[1].off.shift = 0.3;
  r.torch = part('Cylinder', { diameter: 0.06, height: 0.26, tessellation: 10 }, r.el[1], m, [0.1, 0.1, 0.1], 0, [0, -0.78, 0.05]);
  part('Cylinder', { diameter: 0.07, height: 0.015, tessellation: 12 }, r.el[1], m, [1, 0.95, 0.8], 1, [0, -0.915, 0.05]);
  r.sk.torch = true;
  setEmi(r.mat, 0.7);
  return r;
}
function buildWretchSk(o = {}) {
  const r = o.gown ? buildSkinned('subject', { colors: { skin: [0.5, 0.52, 0.44], a: [0.55, 0.62, 0.66] }, rigKind: 'wretch' })
    : buildSkinned('wretch', { colors: { skin: [0.36, 0.4, 0.3].map(v => v * rnd(0.85, 1.1)), a: pick([[0.3, 0.26, 0.22], [0.2, 0.24, 0.3], [0.4, 0.36, 0.3], [0.32, 0.2, 0.2]]), b: pick([[0.25, 0.23, 0.2], [0.19, 0.21, 0.25], [0.29, 0.26, 0.21], [0.22, 0.2, 0.19]]) }, rigKind: 'wretch' });
  setEmi(r.mat, 0.5);
  return r;
}
function buildHaleSk() {
  const r = buildSkinned('hale', { colors: { skin: [0.82, 0.66, 0.56], b: [0.32, 0.42, 0.55] } }), m = r.acc, h = r.fHead;
  for (const s of [-1, 1]) part('Torus', { diameter: 0.042, thickness: 0.006, tessellation: 12 }, h, m, [0.12, 0.12, 0.12], 0, sknAt('Head', [s * 0.033, 1.703, 0.104]), [Math.PI / 2, 0, 0]);
  part('Box', { width: 0.022, height: 0.005, depth: 0.005 }, h, m, [0.12, 0.12, 0.12], 0, sknAt('Head', [0, 1.706, 0.106]));
  part('Cylinder', { diameterTop: 0.38, diameterBottom: 0.48, height: 0.46, tessellation: 14, cap: BABYLON.Mesh.NO_CAP, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, r.fPelvis, m, [0.84, 0.85, 0.83], 0, [0, -0.17, -0.005], null, [1, 1, 0.78]);
  part('Box', { width: 0.07, height: 0.09, depth: 0.01 }, r.fChest, m, [0.9, 0.9, 0.85], 0, sknAt('spine_03', [-0.1, 1.36, 0.13]));
  r.card = part('Box', { width: 0.055, height: 0.085, depth: 0.004 }, r.hands[1], m, [0.92, 0.9, 0.85], 0.3, [0, -0.08, 0.04], [0.3, 0, 0]);
  return r;
}
function buildForgottenSk() {
  const r = buildSkinned('forgotten', { colors: { skin: [0.02, 0.023, 0.026] } });
  r.limbs = [];
  return r;
}
