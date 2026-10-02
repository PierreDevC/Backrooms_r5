// ---------- r5 prop models: Poly Haven (CC0) scans, simplified offline (tools/mdl) and baked here into merged per-area meshes ----------
// Every model is optional: without the pack (or with ?noassets / ?nomodels) the level keeps its procedural prop.
const MDL = { scn: null, lscn: null, log: [], data: new Map(), mats: new Map(), off: /[?&]nomodels/.test(location.search) };
function mdlOk(k) { return !MDL.off && !AST.off && typeof ASSET_MDL !== 'undefined' && !!ASSET_MDL[k]; }
function mdlDims(k) { return ASSET_MDL[k].dims; }
function mdlData(k) {
  let d = MDL.data.get(k); if (d) return d;
  const M = ASSET_MDL[k], u8 = b64u8(M.bin), dv = new DataView(u8.buffer), nv = M.nv, ni = M.ni;
  const pos = new Float32Array(nv * 3), nrm = new Float32Array(nv * 3), tan = new Float32Array(nv * 4), uv = new Float32Array(nv * 2);
  for (let i = 0; i < nv; i++) {
    const o = i * 18;
    for (let c = 0; c < 3; c++) pos[i * 3 + c] = M.bmin[c] + dv.getUint16(o + c * 2, true) / 65535 * M.bsize[c];
    const nx = dv.getInt8(o + 6), ny = dv.getInt8(o + 7), nz = dv.getInt8(o + 8), nl = Math.hypot(nx, ny, nz) || 1;
    nrm[i * 3] = nx / nl; nrm[i * 3 + 1] = ny / nl; nrm[i * 3 + 2] = nz / nl;
    const tx = dv.getInt8(o + 10), ty = dv.getInt8(o + 11), tz = dv.getInt8(o + 12), tl = Math.hypot(tx, ty, tz) || 1;
    tan[i * 4] = tx / tl; tan[i * 4 + 1] = ty / tl; tan[i * 4 + 2] = tz / tl; tan[i * 4 + 3] = dv.getInt8(o + 13) < 0 ? -1 : 1;
    uv[i * 2] = M.umin[0] + dv.getUint16(o + 14, true) / 65535 * M.usize[0]; uv[i * 2 + 1] = M.umin[1] + dv.getUint16(o + 16, true) / 65535 * M.usize[1];
  }
  const io = nv * 18, idx = M.i32 ? new Uint32Array(u8.buffer.slice(io, io + ni * 4)) : new Uint16Array(u8.buffer.slice(io, io + ni * 2));
  d = { pos, nrm, tan, uv, idx, nv, ni }; MDL.data.set(k, d); return d;
}
function mdlTex(k, s) {
  const t = new BABYLON.Texture('data:image/webp;base64,' + ASSET_MDL[k][s], SCN, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  t.name = 'mdl_' + k + '.' + s; t.wrapU = t.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE; t.anisotropicFilteringLevel = 4; return t;
}
// per-model look: x specular weight, y normal-map strength, z AO strength, w grime (darkens crevices / mottles)
const MDL_K = { cbox: [0.25, 1, 1, 0.3], wetsign: [0.6, 1, 1, 0.2], hydrant: [0.5, 1, 1, 0.2], tcan: [0.6, 1, 1, 0.2], sofa: [0.45, 1, 1, 0.1], armchair: [0.35, 1, 1, 0.1],
  gchair: [0.35, 1, 1, 0.1], nstand: [0.35, 1, 1, 0.1], suitcase: [0.3, 1, 1, 0.2], barrel: [0.55, 1, 1, 0.2], crate: [0.25, 1, 1, 0.2], sdesk: [0.4, 1, 1, 0.1],
  schair: [0.5, 1, 1, 0.1], duck: [0.8, 1, 0.6, 0], gnome: [0.4, 1, 1, 0.2], crt: [0.5, 1, 1, 0.1], sshelf: [0.5, 1, 1, 0.2] };
// repaint reference: mean linear brightness (max channel) of each model's saturated paint, measured from its albedo map
const MDL_RP = { schair: 0.065, sdesk: 0.234, suitcase: 0.057, crate: 0.17, barrel: 0.264, armchair: 0.051, gchair: 0.025 };
function mdlMat(k) {
  if (MDL.scn !== SCN) { MDL.scn = SCN; MDL.mats.clear(); }
  let m = MDL.mats.get(k); if (m) return m;
  m = new BABYLON.ShaderMaterial('mdl_' + k, SCN, { vertex: 'mdl', fragment: 'mdl' }, {
    attributes: ['position', 'normal', 'tangent', 'uv', 'color'], uniforms: ['world', 'viewProjection', ...COMMON_UNIFORMS, 'mK', 'aTint'], samplers: ['lightTex', 'albTex', 'nrmTex'] });
  m.setTexture('lightTex', LV.lightTex); m.setTexture('albTex', mdlTex(k, 'a')); m.setTexture('nrmTex', mdlTex(k, 'n'));
  if (ASSET_MDL[k].ds) m.backFaceCulling = false;   // open shells (bin interiors): back faces shade with a flipped normal
  const K = MDL_K[k] || [0.4, 1, 1, 0.1];
  m.setVector4('mK', new BABYLON.Vector4(K[0], K[1], K[2], K[3])); m.setVector4('aTint', new BABYLON.Vector4(1, 1, 1, MDL_RP[k] || 0.25));
  MATS.list.push(m); MDL.mats.set(k, m); return m;
}
// local transform (like PropBatch.add: pos / rot [x, y, z] / scale number|[x, y, z]) under an optional root node
const _mdS = new BABYLON.Vector3(), _mdT = new BABYLON.Vector3(), _mdQ = new BABYLON.Quaternion();
function mdlMatrix(root, pos, rot, scl) {
  const s = typeof scl === 'number' ? [scl, scl, scl] : (scl || [1, 1, 1]);
  _mdS.set(s[0], s[1], s[2]); _mdT.set(pos ? pos[0] : 0, pos ? pos[1] : 0, pos ? pos[2] : 0);
  BABYLON.Quaternion.RotationYawPitchRollToRef(rot ? rot[1] : 0, rot ? rot[0] : 0, rot ? rot[2] : 0, _mdQ);
  const L = BABYLON.Matrix.Compose(_mdS, _mdQ, _mdT);
  if (!root) return L;
  root.computeWorldMatrix(true); return L.multiply(root.getWorldMatrix());
}
// world-space XZ footprint of a placed model (for addSolid), optionally shrunk / padded
function mdlFoot(k, M, pad = 0) {
  const A = ASSET_MDL[k], mn = A.bmin, sz = A.bsize; let x0 = 1e9, z0 = 1e9, x1 = -1e9, z1 = -1e9; const v = new BABYLON.Vector3();
  for (const cx of [0, 1]) for (const cz of [0, 1]) { BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(mn[0] + cx * sz[0], 0, mn[2] + cz * sz[2], M, v); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); z0 = Math.min(z0, v.z); z1 = Math.max(z1, v.z); }
  return [x0 - pad, z0 - pad, x1 + pad, z1 + pad];
}
function MdlBatch() { this.items = new Map(); this.n = 0; }
// returns the world matrix (truthy) when the model exists, otherwise null so the caller can fall back to its procedural prop
// tint: [r, g, b] multiplies the albedo; [r, g, b, 0] repaints only the saturated parts (a blue plastic seat turns red, its grey steel frame stays grey)
MdlBatch.prototype.add = function (k, root, pos, rot, scl, tint) {
  if (!mdlOk(k)) return null;
  const M = mdlMatrix(root, pos, rot, scl);
  let L = this.items.get(k); if (!L) this.items.set(k, L = []);
  L.push({ M, c: tint || [1, 1, 1] }); this.n++;
  if (MDL.lscn !== SCN) { MDL.lscn = SCN; MDL.log = []; }
  const t = M.getTranslation(); MDL.log.push([k, +t.x.toFixed(2), +t.y.toFixed(2), +t.z.toFixed(2)]);   // placement log (QA / debug)
  return M;
};
MdlBatch.prototype.finish = function (name) {
  const out = [], v = new BABYLON.Vector3(), cell = 28.8;
  for (const [k, list] of this.items) {
    const D = mdlData(k), mat = mdlMat(k), groups = new Map();
    for (const it of list) { const t = it.M.getTranslation(), g = Math.floor(t.z / cell) * 64 + Math.floor(t.x / cell); (groups.get(g) || (groups.set(g, []), groups.get(g))).push(it); }
    for (const items of groups.values()) {
      const nv = D.nv * items.length, P = new Float32Array(nv * 3), Nn = new Float32Array(nv * 3), T = new Float32Array(nv * 4), U = new Float32Array(nv * 2), C = new Float32Array(nv * 4);
      const I = nv > 65535 ? new Uint32Array(D.ni * items.length) : new Uint16Array(D.ni * items.length);
      items.forEach((it, j) => {
        const M = it.M, NM = M.clone().invert().transpose(), b = j * D.nv;
        for (let i = 0; i < D.nv; i++) {
          const o = (b + i) * 3;
          BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(D.pos[i * 3], D.pos[i * 3 + 1], D.pos[i * 3 + 2], M, v); P[o] = v.x; P[o + 1] = v.y; P[o + 2] = v.z;
          BABYLON.Vector3.TransformNormalFromFloatsToRef(D.nrm[i * 3], D.nrm[i * 3 + 1], D.nrm[i * 3 + 2], NM, v); v.normalize(); Nn[o] = v.x; Nn[o + 1] = v.y; Nn[o + 2] = v.z;
          BABYLON.Vector3.TransformNormalFromFloatsToRef(D.tan[i * 4], D.tan[i * 4 + 1], D.tan[i * 4 + 2], M, v); v.normalize();
          const t4 = (b + i) * 4; T[t4] = v.x; T[t4 + 1] = v.y; T[t4 + 2] = v.z; T[t4 + 3] = D.tan[i * 4 + 3];
          U[(b + i) * 2] = D.uv[i * 2]; U[(b + i) * 2 + 1] = D.uv[i * 2 + 1];
          C[t4] = it.c[0]; C[t4 + 1] = it.c[1]; C[t4 + 2] = it.c[2]; C[t4 + 3] = it.c.length > 3 ? it.c[3] : 1;
        }
        for (let i = 0; i < D.ni; i++) I[j * D.ni + i] = D.idx[i] + b;
      });
      const vd = new BABYLON.VertexData(); vd.positions = P; vd.normals = Nn; vd.tangents = T; vd.uvs = U; vd.colors = C; vd.indices = I;
      const mesh = new BABYLON.Mesh(name + '_' + k, SCN); vd.applyToMesh(mesh, false);
      mesh.material = mat; mesh.isPickable = false; mesh.hasVertexAlpha = false; mesh._sortD = 310; mesh.freezeWorldMatrix();
      out.push(mesh);
    }
  }
  this.items.clear(); return out;
};

