// r5 prop converter: Poly Haven (CC0) 1k glTF -> compact binary + 2 packed WebP textures for src/models.js
//  * bakes node transforms, keeps only nodes matching spec.nodes, recentres (XZ centre, floor at y = 0), applies spec.yaw
//  * mirrors X for Babylon's left-handed space (the mirror turns glTF CCW fronts into Babylon CW fronts: indices kept)
//  * meshoptimizer attribute-aware simplification to spec.tris, own tangents (T = dP/du, B = dP/dv with v = image rows)
//  * textures: A = albedo RGB + roughness alpha, N = normal XY (image-row / DX convention) + AO (B) + metalness (A)
// usage (from a folder with @gltf-transform, meshoptimizer, sharp): node convert_mdl.mjs [key ...]
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';
import fs from 'node:fs';
const ROOT = '/data/backrooms', SRC = '/data/assets_src/ph', OUT = ROOT + '/assets/mdl';
const SPEC = JSON.parse(fs.readFileSync(ROOT + '/tools/mdl/spec.json', 'utf8'));
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
await MeshoptSimplifier.ready;
const idxPath = OUT + '/index.json', INDEX = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, 'utf8')) : {};
const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(SPEC).filter(k => k[0] !== '_');
const mul = (m, x, y, z, w) => [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w];
for (const key of keys) {
  const S = SPEC[key], dir = SRC + '/' + S.src, gf = fs.readdirSync(dir).find(n => n.endsWith('.gltf'));
  const doc = await io.read(dir + '/' + gf), re = S.nodes ? new RegExp(S.nodes) : null;
  const P = [], Nn = [], U = [], I = []; let mat = null;
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh(); if (!mesh || (re && !re.test(node.getName()))) continue;
    const m = node.getWorldMatrix(), det = m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]);
    for (const p of mesh.listPrimitives()) {
      if (!mat) mat = p.getMaterial(); else if (p.getMaterial() !== mat && p.getMaterial().getName() !== mat.getName()) throw new Error(key + ': more than one material in the selected nodes');
      const pos = p.getAttribute('POSITION'), nor = p.getAttribute('NORMAL'), uv = p.getAttribute('TEXCOORD_0'), base = P.length / 3;
      const t = [], n3 = [], u2 = [];
      for (let i = 0; i < pos.getCount(); i++) {
        pos.getElement(i, t); P.push(...mul(m, t[0], t[1], t[2], 1));
        nor.getElement(i, n3); const n = mul(m, n3[0], n3[1], n3[2], 0), l = Math.hypot(...n) || 1; Nn.push(n[0] / l, n[1] / l, n[2] / l);
        uv.getElement(i, u2); U.push(u2[0], u2[1]);
      }
      const ix = p.getIndices().getArray();
      for (let k = 0; k < ix.length; k += 3) det < 0 ? I.push(base + ix[k], base + ix[k + 2], base + ix[k + 1]) : I.push(base + ix[k], base + ix[k + 1], base + ix[k + 2]);
    }
  }
  // recentre, yaw fix, mirror X (left-handed)
  let nv = P.length / 3; const mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
  for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], P[i * 3 + k]); mx[k] = Math.max(mx[k], P[i * 3 + k]); }
  const cx = (mn[0] + mx[0]) / 2, cz = (mn[2] + mx[2]) / 2, a = (S.yaw || 0) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), sc = S.scale || 1;
  for (let i = 0; i < nv; i++) {
    const x = (P[i * 3] - cx) * sc, y = (P[i * 3 + 1] - mn[1]) * sc, z = (P[i * 3 + 2] - cz) * sc, nx = Nn[i * 3], nz = Nn[i * 3 + 2];
    P[i * 3] = -(x * ca + z * sa); P[i * 3 + 1] = y; P[i * 3 + 2] = -x * sa + z * ca;
    Nn[i * 3] = -(nx * ca + nz * sa); Nn[i * 3 + 2] = -nx * sa + nz * ca;
  }
  // simplify (positions + normals + uv), then compact
  const pos32 = new Float32Array(P), att = new Float32Array(nv * 5);
  for (let i = 0; i < nv; i++) { att.set(Nn.slice(i * 3, i * 3 + 3), i * 5); att[i * 5 + 3] = U[i * 2]; att[i * 5 + 4] = U[i * 2 + 1]; }
  let idx = new Uint32Array(I); const tris0 = idx.length / 3;
  if (tris0 > S.tris) { const [r, err] = MeshoptSimplifier.simplifyWithAttributes(idx, pos32, 3, att, 5, [0.35, 0.35, 0.35, 1.2, 1.2], null, S.tris * 3, 0.03, []); idx = r; S.__err = err; }
  const remap = new Int32Array(nv).fill(-1), keep = []; const idx2 = new Uint32Array(idx.length);
  for (let i = 0; i < idx.length; i++) { let v = remap[idx[i]]; if (v < 0) { v = remap[idx[i]] = keep.length; keep.push(idx[i]); } idx2[i] = v; }
  nv = keep.length; const ni = idx2.length;
  const p = new Float32Array(nv * 3), n = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
  keep.forEach((o, i) => { p.set(pos32.subarray(o * 3, o * 3 + 3), i * 3); n.set(Nn.slice(o * 3, o * 3 + 3), i * 3); uv[i * 2] = U[o * 2]; uv[i * 2 + 1] = U[o * 2 + 1]; });
  // tangents: T = dP/du, B = dP/dv (v grows down the image), w = handedness
  const T = new Float32Array(nv * 3), Bt = new Float32Array(nv * 3);
  for (let t = 0; t < ni; t += 3) {
    const [i0, i1, i2] = [idx2[t], idx2[t + 1], idx2[t + 2]];
    const e1 = [0, 1, 2].map(k => p[i1 * 3 + k] - p[i0 * 3 + k]), e2 = [0, 1, 2].map(k => p[i2 * 3 + k] - p[i0 * 3 + k]);
    const du1 = uv[i1 * 2] - uv[i0 * 2], dv1 = uv[i1 * 2 + 1] - uv[i0 * 2 + 1], du2 = uv[i2 * 2] - uv[i0 * 2], dv2 = uv[i2 * 2 + 1] - uv[i0 * 2 + 1];
    const d = du1 * dv2 - du2 * dv1; if (Math.abs(d) < 1e-12) continue; const r = 1 / d;
    for (const i of [i0, i1, i2]) for (let k = 0; k < 3; k++) { T[i * 3 + k] += (e1[k] * dv2 - e2[k] * dv1) * r; Bt[i * 3 + k] += (e2[k] * du1 - e1[k] * du2) * r; }
  }
  const tan = new Float32Array(nv * 4);
  for (let i = 0; i < nv; i++) {
    const N = [n[i * 3], n[i * 3 + 1], n[i * 3 + 2]]; let t = [T[i * 3], T[i * 3 + 1], T[i * 3 + 2]];
    const dn = t[0] * N[0] + t[1] * N[1] + t[2] * N[2]; t = t.map((v, k) => v - N[k] * dn); let l = Math.hypot(...t);
    if (l < 1e-8) { t = Math.abs(N[0]) < 0.9 ? [0, -N[2], N[1]] : [N[2], 0, -N[0]]; l = Math.hypot(...t); }
    t = t.map(v => v / l);
    const c = [N[1] * t[2] - N[2] * t[1], N[2] * t[0] - N[0] * t[2], N[0] * t[1] - N[1] * t[0]], w = c[0] * Bt[i * 3] + c[1] * Bt[i * 3 + 1] + c[2] * Bt[i * 3 + 2] < 0 ? -1 : 1;
    tan.set([t[0], t[1], t[2], w], i * 4);
  }
  // quantise: pos int16 in bbox, normal/tangent int8, uv uint16 in uv-bbox; stride 18
  const bmin = [1e9, 1e9, 1e9], bmax = [-1e9, -1e9, -1e9], umin = [1e9, 1e9], umax = [-1e9, -1e9];
  for (let i = 0; i < nv; i++) { for (let k = 0; k < 3; k++) { bmin[k] = Math.min(bmin[k], p[i * 3 + k]); bmax[k] = Math.max(bmax[k], p[i * 3 + k]); } for (let k = 0; k < 2; k++) { umin[k] = Math.min(umin[k], uv[i * 2 + k]); umax[k] = Math.max(umax[k], uv[i * 2 + k]); } }
  const bs = bmax.map((v, k) => Math.max(v - bmin[k], 1e-6)), us = umax.map((v, k) => Math.max(v - umin[k], 1e-6));
  const big = nv > 65535, vb = Buffer.alloc(nv * 18), ib = Buffer.alloc(ni * (big ? 4 : 2));
  for (let i = 0; i < nv; i++) {
    const o = i * 18;
    for (let k = 0; k < 3; k++) vb.writeUInt16LE(Math.round((p[i * 3 + k] - bmin[k]) / bs[k] * 65535), o + k * 2);
    for (let k = 0; k < 3; k++) vb.writeInt8(Math.round(n[i * 3 + k] * 127), o + 6 + k);
    vb.writeInt8(0, o + 9);
    for (let k = 0; k < 3; k++) vb.writeInt8(Math.round(tan[i * 4 + k] * 127), o + 10 + k);
    vb.writeInt8(tan[i * 4 + 3] < 0 ? -127 : 127, o + 13);
    for (let k = 0; k < 2; k++) vb.writeUInt16LE(Math.round((uv[i * 2 + k] - umin[k]) / us[k] * 65535), o + 14 + k * 2);
  }
  for (let i = 0; i < ni; i++) big ? ib.writeUInt32LE(idx2[i], i * 4) : ib.writeUInt16LE(idx2[i], i * 2);
  fs.writeFileSync(OUT + `/${key}.bin`, Buffer.concat([vb, ib]));
  // textures
  const texOf = getter => { const t = mat[getter](); return t ? dir + '/' + t.getURI() : null; };
  const sz = S.tex, diff = texOf('getBaseColorTexture'), arm = texOf('getMetallicRoughnessTexture'), nrm = texOf('getNormalTexture');
  const rgb = async f => (await sharp(f).resize(sz, sz, { fit: 'fill' }).removeAlpha().raw().toBuffer());
  const D = await rgb(diff), R = arm ? await rgb(arm) : null, Nm = await rgb(nrm), A4 = Buffer.alloc(sz * sz * 4), N4 = Buffer.alloc(sz * sz * 4);
  let aoSum = 0; if (R) for (let i = 0; i < sz * sz; i++) aoSum += R[i * 3];
  const aoOk = R && aoSum / (sz * sz) > 64;   // some scans ship an empty AO channel: ignore it then
  for (let i = 0; i < sz * sz; i++) {
    A4[i * 4] = D[i * 3]; A4[i * 4 + 1] = D[i * 3 + 1]; A4[i * 4 + 2] = D[i * 3 + 2]; A4[i * 4 + 3] = R ? R[i * 3 + 1] : 200;   // roughness (arm.G)
    N4[i * 4] = Nm[i * 3]; N4[i * 4 + 1] = 255 - Nm[i * 3 + 1]; N4[i * 4 + 2] = aoOk ? R[i * 3] : 255; N4[i * 4 + 3] = R ? R[i * 3 + 2] : 0;   // GL -> image-row normal, AO, metal
  }
  await sharp(A4, { raw: { width: sz, height: sz, channels: 4 } }).webp({ quality: 82, alphaQuality: 80, effort: 6 }).toFile(OUT + `/${key}_a.webp`);
  await sharp(N4, { raw: { width: sz, height: sz, channels: 4 } }).webp({ quality: 86, alphaQuality: 60, effort: 6 }).toFile(OUT + `/${key}_n.webp`);
  const dims = bs.map(v => +v.toFixed(4));
  INDEX[key] = { src: S.src, nv, ni, i32: big ? 1 : 0, bmin: bmin.map(v => +v.toFixed(5)), bsize: bs.map(v => +v.toFixed(5)), umin: umin.map(v => +v.toFixed(5)), usize: us.map(v => +v.toFixed(5)), dims, tex: sz,
    bin: `${key}.bin`, a: `${key}_a.webp`, n: `${key}_n.webp`, ds: (S.ds ?? mat.getDoubleSided()) ? 1 : 0, license: 'CC0', url: `https://polyhaven.com/a/${S.src}` };
  const kb = f => (fs.statSync(OUT + '/' + f).size / 1024).toFixed(0);
  console.log(`${key.padEnd(9)} ${S.src.padEnd(24)} tris ${tris0} -> ${ni / 3} err ${(S.__err ?? 0).toFixed(4)} nv ${nv} dims ${dims.map(v => v.toFixed(2))} | bin ${kb(key + '.bin')} KB a ${kb(key + '_a.webp')} KB n ${kb(key + '_n.webp')} KB`);
}
fs.writeFileSync(idxPath, JSON.stringify(INDEX, null, 1));
