// r5 character converter: Quaternius Universal Base Character (CC0) + Universal Animation Library 1/2 (CC0)
// -> compact binary for the game's own GPU-skinning runtime (src/skin.js).
// * converts glTF right-handed data to Babylon's left-handed space by mirroring X (the mirror itself turns glTF CCW fronts into Babylon CW fronts, so indices are kept)
// * retargets every clip from the UAL "Mannequin" rest pose onto the character's rest pose (world-space rotation deltas)
// * stores quaternions as 3 x int16 (w >= 0 reconstructed), pelvis translation as int16 (0.1 mm)
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import fs from 'node:fs';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const SRC = '/data/assets_src';
const CHAR = process.env.CHAR || `${SRC}/chars/Superhero_Male_FullBody.gltf`;
const UAL1 = `${SRC}/itch/ual/Universal Animation Library[Standard]/Unreal-Godot/UAL1_Standard.glb`;
const UAL2 = `${SRC}/itch/ual2/Universal Animation Library 2[Standard]/Unreal-Godot/UAL2_Standard.glb`;
const OUT = process.env.OUT || '/data/backrooms/assets/chr';
// clip alias -> [library, clip name]
const CLIPS = {
  idle: [1, 'Idle_Loop'], walk: [1, 'Walk_Loop'], jog: [1, 'Jog_Fwd_Loop'], sprint: [1, 'Sprint_Loop'],
  cwalk: [1, 'Crouch_Fwd_Loop'], cidle: [1, 'Crouch_Idle_Loop'], death: [1, 'Death01'], hit: [1, 'Hit_Chest'],
  talk: [1, 'Idle_Talking_Loop'], torch: [1, 'Idle_Torch_Loop'], interact: [1, 'Interact'], fwalk: [1, 'Walk_Formal_Loop'],
  push: [1, 'Push_Loop'], kneel: [1, 'Fixing_Kneeling'], punch: [1, 'Punch_Cross'],
  zidle: [2, 'Zombie_Idle_Loop'], zwalk: [2, 'Zombie_Walk_Fwd_Loop'], scratch: [2, 'Zombie_Scratch'], fold: [2, 'Idle_FoldArms_Loop'],
  lantern: [2, 'Idle_Lantern_Loop'], getup: [2, 'LayToIdle'], knock: [2, 'Hit_Knockback'], hook: [2, 'Melee_Hook'], no: [2, 'Idle_No_Loop'],
};
const LOCO = ['walk', 'jog', 'sprint', 'cwalk', 'fwalk', 'zwalk'];
// ---------- quaternion helpers (x, y, z, w) ----------
const qmul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const qinv = q => [-q[0], -q[1], -q[2], q[3]];
const qnorm = q => { const l = Math.hypot(...q) || 1; return q.map(v => v / l); };
const qrot = (q, v) => { const p = qmul(qmul(q, [v[0], v[1], v[2], 0]), qinv(q)); return [p[0], p[1], p[2]]; };
const qslerp = (a, b, t) => { let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; const bb = d < 0 ? b.map(v => -v) : b; d = Math.abs(d); if (d > 0.9995) return qnorm(a.map((v, i) => v + (bb[i] - v) * t)); const th = Math.acos(d), s = Math.sin(th); return a.map((v, i) => (v * Math.sin((1 - t) * th) + bb[i] * Math.sin(t * th)) / s); };
const mirQ = q => [q[0], -q[1], -q[2], q[3]], mirT = t => [-t[0], t[1], t[2]];
// ---------- character ----------
const ch = await io.read(CHAR);
const skin = ch.getRoot().listSkins()[0], J = skin.listJoints(), JN = J.map(j => j.getName());
const jIdx = new Map(J.map((j, i) => [j, i]));
const parent = J.map(j => jIdx.has(j.getParentNode()) ? jIdx.get(j.getParentNode()) : -1);
J.forEach((j, i) => { if (parent[i] >= i) throw new Error('joints not topologically ordered'); });
const restT = J.map(j => j.getTranslation().slice()), restR = J.map(j => j.getRotation().slice());
const globR = (locR) => { const G = []; for (let i = 0; i < J.length; i++) G[i] = parent[i] < 0 ? locR[i] : qmul(G[parent[i]], locR[i]); return G; };
const globP = (locT, locR) => { const G = globR(locR), P = []; for (let i = 0; i < J.length; i++) P[i] = parent[i] < 0 ? locT[i] : qrot(G[parent[i]], locT[i]).map((v, k) => v + P[parent[i]][k]); return P; };
const cRestG = globR(restR);
// ---------- mesh ----------
const prims = [];
for (const n of ch.getRoot().listNodes()) { const m = n.getMesh(); if (!m) continue; for (const p of m.listPrimitives()) prims.push({ node: n.getName(), mat: p.getMaterial()?.getName(), p }); }
const keep = prims.filter(q => q.mat === 'MI_Superhero_Male' || q.mat === 'MI_Superhero_Female' || q.mat === 'MI_Eyes');
const grp = name => /^Head$/.test(name) ? 0 : /^neck/.test(name) ? 0.5 : /^hand_|index|middle|ring|pinky|thumb/.test(name) ? 1 : /^foot_|^ball_/.test(name) ? 2 : -1;
let V = [], I = [];
for (const q of keep) {
  const p = q.p, eye = q.mat === 'MI_Eyes', base = V.length;
  const P = p.getAttribute('POSITION'), Nn = p.getAttribute('NORMAL'), UV = p.getAttribute('TEXCOORD_0'), JJ = p.getAttribute('JOINTS_0'), WW = p.getAttribute('WEIGHTS_0');
  const a = [], b = [], c = [], d = [], e = [];
  for (let i = 0; i < P.getCount(); i++) {
    P.getElement(i, a); Nn.getElement(i, b); UV.getElement(i, c); JJ.getElement(i, d); WW.getElement(i, e);
    // skin joint indices of a primitive refer to its node's skin: all three share the one skin
    const rg = [0, 0, 0, eye ? 1 : 0];
    for (let k = 0; k < 4; k++) { const g = grp(JN[d[k]]); if (g === 0.5) rg[0] += e[k] * 0.5; else if (g >= 0) rg[g] += e[k]; }
    V.push({ p: mirT(a), n: mirT(b), uv: [c[0], c[1]], j: d.slice(), w: e.slice(), rg });
  }
  const ix = p.getIndices().getArray();
  for (let t = 0; t < ix.length; t += 3) I.push(base + ix[t], base + ix[t + 1], base + ix[t + 2]);   // mirroring X flips the apparent winding: glTF CCW becomes Babylon CW (front)
}
// tangents (per-triangle accumulation, Gram-Schmidt)
const tan = V.map(() => [0, 0, 0]), bit = V.map(() => [0, 0, 0]);
for (let t = 0; t < I.length; t += 3) {
  const [i0, i1, i2] = [I[t], I[t + 1], I[t + 2]], v0 = V[i0], v1 = V[i1], v2 = V[i2];
  const e1 = v1.p.map((x, k) => x - v0.p[k]), e2 = v2.p.map((x, k) => x - v0.p[k]);
  const du1 = v1.uv[0] - v0.uv[0], dv1 = v1.uv[1] - v0.uv[1], du2 = v2.uv[0] - v0.uv[0], dv2 = v2.uv[1] - v0.uv[1];
  const r = du1 * dv2 - du2 * dv1; if (Math.abs(r) < 1e-12) continue; const f = 1 / r;
  const T = e1.map((x, k) => (x * dv2 - e2[k] * dv1) * f), B = e2.map((x, k) => (x * du1 - e1[k] * du2) * f);
  for (const i of [i0, i1, i2]) for (let k = 0; k < 3; k++) { tan[i][k] += T[k]; bit[i][k] += B[k]; }
}
V.forEach((v, i) => {
  const n = v.n, t = tan[i], dn = t[0] * n[0] + t[1] * n[1] + t[2] * n[2];
  let o = [t[0] - n[0] * dn, t[1] - n[1] * dn, t[2] - n[2] * dn]; const l = Math.hypot(...o);
  if (l < 1e-9) { o = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; const d2 = o[0] * n[0] + o[1] * n[1] + o[2] * n[2]; o = o.map((x, k) => x - n[k] * d2); }
  o = o.map(x => x / (Math.hypot(...o) || 1));
  const cr = [n[1] * o[2] - n[2] * o[1], n[2] * o[0] - n[0] * o[2], n[0] * o[1] - n[1] * o[0]];
  v.t = o.concat([(cr[0] * bit[i][0] + cr[1] * bit[i][1] + cr[2] * bit[i][2]) < 0 ? -1 : 1]);
});
// ---------- animations ----------
const libs = { 1: await io.read(UAL1), 2: await io.read(UAL2) };
function libInfo(doc) {
  const nodes = new Map(doc.getRoot().listNodes().map(n => [n.getName(), n]));
  const aR = JN.map(n => nodes.get(n).getRotation().slice()), aT = JN.map(n => nodes.get(n).getTranslation().slice());
  return { nodes, aR, aT, aRestG: globR(aR) };
}
const L = { 1: libInfo(libs[1]), 2: libInfo(libs[2]) };
const pelvis = JN.indexOf('pelvis'), kT = restT[pelvis][2] / L[1].aT[pelvis][2];
function sampler(ch) { const s = ch.getSampler(); return { t: s.getInput().getArray(), v: s.getOutput().getArray(), n: s.getOutput().getElementSize() }; }
function sampleAt(S, time, isQ) {
  const t = S.t; let i = 0; while (i < t.length - 2 && t[i + 1] <= time) i++;
  const f = t.length > 1 ? Math.min(1, Math.max(0, (time - t[i]) / ((t[i + 1] - t[i]) || 1))) : 0;
  const a = Array.from(S.v.slice(i * S.n, i * S.n + S.n)), j = Math.min(i + 1, t.length - 1), b = Array.from(S.v.slice(j * S.n, j * S.n + S.n));
  return isQ ? qslerp(a, b, f) : a.map((x, k) => x + (b[k] - x) * f);
}
const isLeaf = n => /leaf/.test(n);
const out = { joints: JN.map((n, i) => ({ n, p: parent[i], t: mirT(restT[i]).map(v => +v.toFixed(5)), r: mirQ(restR[i]).map(v => +v.toFixed(6)) })), clips: [] };
const clipBufs = [];
for (const [alias, [lib, name]] of Object.entries(CLIPS)) {
  const doc = libs[lib], li = L[lib], anim = doc.getRoot().listAnimations().find(a => a.getName() === name);
  if (!anim) { console.error('missing clip', name); continue; }
  const chans = new Map();
  let dur = 0;
  for (const c of anim.listChannels()) { const S = sampler(c); dur = Math.max(dur, S.t[S.t.length - 1]); chans.set(c.getTargetNode().getName() + '/' + c.getTargetPath(), S); }
  const loop = /_Loop$/.test(name);
  const fps = dur > 1.6 ? 15 : 30;
  let n = Math.round(dur * fps) + 1; if (loop) n -= 1;   // looped clips: last key == first key
  const frames = [];
  for (let f = 0; f < n; f++) {
    const time = Math.min(dur, f / fps);
    const aR = JN.map((jn, i) => { const S = chans.get(jn + '/rotation'); return S ? sampleAt(S, time, true) : li.aR[i]; });
    const aT = JN.map((jn, i) => { const S = chans.get(jn + '/translation'); return S ? sampleAt(S, time, false) : li.aT[i]; });
    const aG = globR(aR);
    // world-space delta retarget onto the character's rest pose
    const cG = [], cR = [];
    for (let i = 0; i < J.length; i++) {
      const D = qmul(aG[i], qinv(li.aRestG[i]));
      cG[i] = qnorm(qmul(D, cRestG[i]));
      cR[i] = parent[i] < 0 ? cG[i] : qnorm(qmul(qinv(cG[parent[i]]), cG[i]));
    }
    const pT = restT[pelvis].map((v, k) => v + (aT[pelvis][k] - li.aT[pelvis][k]) * kT);
    frames.push({ R: cR, pT });
  }
  // which joints actually move in this clip
  const anim_j = [];
  for (let i = 0; i < J.length; i++) {
    if (isLeaf(JN[i]) || parent[i] < 0) continue;
    const q0 = frames[0].R[i]; let mv = false;
    for (const fr of frames) { const d = Math.abs(fr.R[i][0] * q0[0] + fr.R[i][1] * q0[1] + fr.R[i][2] * q0[2] + fr.R[i][3] * q0[3]); if (d < 0.99998) { mv = true; break; } }
    const dr = Math.abs(q0[0] * restR[i][0] + q0[1] * restR[i][1] + q0[2] * restR[i][2] + q0[3] * restR[i][3]);
    anim_j.push([i, mv ? 1 : (dr < 0.99998 ? 2 : 0)]);   // 1 = per-frame, 2 = constant (differs from rest), 0 = rest
  }
  const per = anim_j.filter(a => a[1] === 1).map(a => a[0]), cst = anim_j.filter(a => a[1] === 2).map(a => a[0]);
  const qs = q => { let x = mirQ(q); if (x[3] < 0) x = x.map(v => -v); return x.slice(0, 3).map(v => Math.round(Math.max(-1, Math.min(1, v)) * 32767)); };
  const words = [];
  for (const i of cst) words.push(...qs(frames[0].R[i]));
  for (const fr of frames) { for (const i of per) words.push(...qs(fr.R[i])); words.push(...mirT(fr.pT).map(v => Math.round(v * 1e4))); }
  // locomotion analysis (character model space, before mirroring: left foot = +X)
  let p0 = 0, v = 0;
  if (LOCO.includes(alias)) {
    const fl = JN.indexOf('foot_l'), fr = JN.indexOf('foot_r');
    const rows = frames.map(fm => { const lt = restT.map((t, i) => i === pelvis ? fm.pT : t); const P = globP(lt, fm.R); return { l: P[fl], r: P[fr], pe: P[pelvis] }; });
    // root is Z-up -> after root rotation global Y... use model-space Y (up) and Z (forward)
    if (process.env.DBG === alias) rows.forEach((r, i) => console.log(i, "L", r.l.map(v => v.toFixed(3)).join(","), "R", r.r.map(v => v.toFixed(3)).join(","), "pe", r.pe.map(v => v.toFixed(3)).join(",")));
    let best = -1e9; rows.forEach((r, i) => { const z = r.l[2] - r.pe[2]; if (z > best) { best = z; p0 = i / n; } });
    const vs = [];
    for (const side of ['l', 'r']) {
      const ys = rows.map(r => r[side][1]), ymin = Math.min(...ys), g = ys.map(y => y < ymin + 0.09);
      // longest cyclic grounded run = stance phase; body speed = backward foot travel / stance time
      let bestLen = 0, bestStart = 0;
      for (let s0 = 0; s0 < n; s0++) { if (!g[s0] || g[(s0 - 1 + n) % n]) continue; let l = 0; while (l < n && g[(s0 + l) % n]) l++; if (l > bestLen) { bestLen = l; bestStart = s0; } }
      if (bestLen >= 3) { const z0 = rows[bestStart][side][2] - rows[bestStart].pe[2], z1 = rows[(bestStart + bestLen - 1) % n][side][2] - rows[(bestStart + bestLen - 1) % n].pe[2]; vs.push((z0 - z1) * fps / (bestLen - 1)); }
    }
    v = vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : 0;
  }
  const buf = Int16Array.from(words);
  out.clips.push({ k: alias, src: name, lib, n, fps, loop: loop ? 1 : 0, per, cst, p0: +p0.toFixed(4), v: +v.toFixed(3), dur: +((loop ? n : n - 1) / fps).toFixed(4), off: 0, len: buf.length });
  clipBufs.push(buf);
}
// ---------- pack ----------
const nv = V.length, ni = I.length;
const vb = new ArrayBuffer(nv * 32); const dv = new DataView(vb);
V.forEach((v, i) => {
  const o = i * 32;
  for (let k = 0; k < 3; k++) dv.setInt16(o + k * 2, Math.round(v.p[k] * 1e4), true);
  for (let k = 0; k < 3; k++) dv.setInt8(o + 6 + k, Math.round(v.n[k] * 127));
  dv.setInt8(o + 9, 0);
  for (let k = 0; k < 4; k++) dv.setInt8(o + 10 + k, Math.round(v.t[k] * 127));
  dv.setUint16(o + 14, Math.round(Math.min(1.9999, Math.max(0, v.uv[0])) * 32768), true); dv.setUint16(o + 16, Math.round(Math.min(1.9999, Math.max(0, v.uv[1])) * 32768), true);   // uv in [0, 2)
  // weights -> uint8 summing to 255
  const w = v.w.map(x => Math.max(0, x)), s = w.reduce((a, b) => a + b, 0) || 1; let q = w.map(x => Math.round(x / s * 255)); const dq = 255 - q.reduce((a, b) => a + b, 0); q[q.indexOf(Math.max(...q))] += dq;
  for (let k = 0; k < 4; k++) { dv.setUint8(o + 18 + k, v.j[k]); dv.setUint8(o + 22 + k, q[k]); dv.setUint8(o + 26 + k, Math.round(Math.min(1, v.rg[k]) * 255)); }
});
const ib = Uint16Array.from(I);
let off = 0; const parts = [];
const push = (u8) => { const o = off; parts.push(Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength)); off += u8.byteLength; if (off % 4) { const pad = 4 - off % 4; parts.push(Buffer.alloc(pad)); off += pad; } return o; };
out.mesh = { nv, ni, vOff: push(new Uint8Array(vb)), iOff: push(ib) };
out.clips.forEach((c, i) => { c.off = push(clipBufs[i]); });
const bin = Buffer.concat(parts);
const uvMax = V.reduce((m, v) => Math.max(m, v.uv[0], v.uv[1]), 0), uvMin = V.reduce((m, v) => Math.min(m, v.uv[0], v.uv[1]), 9);
fs.writeFileSync(`${OUT}/human.bin`, bin);
fs.writeFileSync(`${OUT}/human.json`, JSON.stringify(out));
console.log('verts', nv, 'tris', ni / 3, 'bin', bin.length, 'uv range', uvMin.toFixed(3), uvMax.toFixed(3), 'kT', kT.toFixed(4));
for (const c of out.clips) console.log(c.k.padEnd(9), c.src.padEnd(22), 'n', String(c.n).padStart(3), 'fps', c.fps, 'per', c.per.length, 'cst', c.cst.length, 'p0', c.p0, 'v', c.v, 'bytes', c.len * 2);
