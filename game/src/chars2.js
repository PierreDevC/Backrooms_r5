// ---------- r11 · Level 2 characters on the skinned body (Quaternius base mesh, CC0) ----------
// Ida (night engineer, seated at her board, her face going smooth), Benny (maintenance, hi-vis, hard hat), the Faceling crew (boiler suits,
// hard hats, smooth egg heads), the foreman (white hat, a clipboard) and the Hound (a long, thin grey body that goes about on all fours).
// Accessories are ordinary vertex-coloured meshes riding on bone followers, lit by the level's light texture like every character.
Object.assign(SKP, {
  engineer: { outfit: 'ENGINEER', len: {}, cross: { torso: 0.94, limb: 0.92 }, inf: [0.008, 0, 0], loco: { idle: 'idle', walk: 'walk', run: 'jog', sprint: 'sprint' }, spec: 0.25, shin: 18, wrinkle: 0.7, wet: 0.05, wrap: 0.45, mottle: 0.25 },
  worker: { outfit: 'WORKER', len: {}, cross: { torso: 1.1, limb: 1.04 }, inf: [0.012, 0, 0], loco: { idle: 'idle', walk: 'walk', run: 'jog', sprint: 'sprint' }, spec: 0.25, shin: 18, wrinkle: 0.8, wet: 0.08, wrap: 0.45, mottle: 0.3 },
  faceling: { outfit: 'COVERALL', len: { neck: 1.15 }, cross: { torso: 1.02, limb: 1.0 }, inf: [0.012, 0, 0], loco: { idle: 'idle', walk: 'cwalk', run: 'jog', sprint: 'sprint' }, spec: 0.22, shin: 16, wrinkle: 0.85, wet: 0.05, wrap: 0.45, mottle: 0.35 },
  hound2: { outfit: 'CREATURE', len: { leg: 1.18, arm: 1.5, hand: 1.6, spine: 1.22, neck: 1.6, head: 0.95 }, cross: { limb: 0.58, torso: 0.7, neck: 0.62, head: 0.9 }, inf: [0, 0, 0], loco: { idle: 'idle', walk: 'idle', run: 'idle', sprint: 'idle' }, spec: 0.7, shin: 30, wrinkle: 0.4, wet: 0.45, wrap: 0.15, mottle: 0.8, eye: [0.9, 0.85, 0.6, 0.5] },
});
// a lathed accessory mesh (profile [[r, y]...] about local y) in the actor material
function accLathe2(prof, seg, rgb, parent, mat, pos, rot, scl) {
  const P = [], Nn = [], C = [], I = [], n = prof.length;
  const pn = prof.map((p, i) => { const q0 = prof[Math.max(0, i - 1)], q1 = prof[Math.min(n - 1, i + 1)], dr = q1[0] - q0[0], dy = q1[1] - q0[1], l = Math.hypot(dr, dy) || 1; return [dy / l, -dr / l]; });
  for (let s = 0; s <= seg; s++) { const a = s / seg * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    for (let i = 0; i < n; i++) { P.push(prof[i][0] * ca, prof[i][1], prof[i][0] * sa); Nn.push(pn[i][0] * ca, pn[i][1], pn[i][0] * sa); C.push(rgb[0], rgb[1], rgb[2], 0); } }
  for (let s = 0; s < seg; s++) for (let i = 0; i < n - 1; i++) { const q = s * n + i, q2 = (s + 1) * n + i; if (FLIP_WINDING) I.push(q, q2 + 1, q2, q, q + 1, q2 + 1); else I.push(q, q2, q2 + 1, q, q2 + 1, q + 1); }
  const m = new BABYLON.Mesh('acc2', SCN), vd = new BABYLON.VertexData(); vd.positions = P; vd.normals = Nn; vd.colors = C; vd.indices = I; vd.applyToMesh(m);
  m.material = mat; m.parent = parent; m.isPickable = false; m.hasVertexAlpha = false; m.alwaysSelectAsActiveMesh = false;
  if (pos) m.position.set(pos[0], pos[1], pos[2]); if (rot) m.rotation.set(rot[0], rot[1], rot[2]); if (scl) m.scaling.set(scl[0], scl[1], scl[2]);
  return m;
}
const HAT2 = [[0, 0.135], [0.06, 0.13], [0.105, 0.105], [0.125, 0.06], [0.13, 0.02], [0.155, 0.006], [0.16, 0.0], [0.15, -0.006], [0.12, 0.0]];
function hardHat2(r, rgb) { const h = r.fHead; accLathe2(HAT2, 20, rgb, h, r.acc, sknAt('Head', [0, 1.765, -0.005]), [-0.08, 0, 0], [1, 1, 1.12]); part('Box', { width: 0.03, height: 0.012, depth: 0.2 }, h, r.acc, rgb.map(v => v * 0.85), 0, sknAt('Head', [0, 1.9, -0.005])); }
// ----- the people -----
function buildIdaSk() {
  const r = buildSkinned('engineer', { colors: { skin: [0.8, 0.66, 0.58], a: [0.16, 0.22, 0.32], b: [0.14, 0.14, 0.15] }, k0: 0.75 }), m = r.acc, h = r.fHead;
  accLathe2([[0, 0.05], [0.045, 0.045], [0.06, 0.0], [0.045, -0.045], [0, -0.05]], 12, [0.05, 0.035, 0.028], h, m, sknAt('Head', [0, 1.74, -0.105]), [1.2, 0, 0]);   // the bun
  // ear defenders around her neck, a pen in the shirt pocket, a radio clipped to the belt
  part('Torus', { diameter: 0.21, thickness: 0.014, tessellation: 18 }, r.fChest, m, [0.12, 0.12, 0.12], 0, sknAt('spine_03', [0, 1.5, 0.0]), [0.25, 0, 0]);
  for (const s of [-1, 1]) part('Cylinder', { diameter: 0.075, height: 0.045, tessellation: 14 }, r.fChest, m, [0.75, 0.6, 0.08], 0, sknAt('spine_03', [s * 0.105, 1.48, 0.03]), [0, 0, Math.PI / 2]);
  part('Cylinder', { diameter: 0.011, height: 0.13, tessellation: 6 }, r.fChest, m, [0.1, 0.1, 0.25], 0, sknAt('spine_03', [0.09, 1.34, 0.12]));
  part('Box', { width: 0.06, height: 0.1, depth: 0.035 }, r.fPelvis, m, [0.1, 0.1, 0.1], 0, sknAt('pelvis', [0.17, 0.95, 0.03]));
  setEmi(r.mat, 0.25); return r;
}
function buildBennySk() {
  const r = buildSkinned('worker', { colors: { skin: [0.74, 0.56, 0.45], a: [0.55, 0.12, 0.1], b: [0.7, 0.7, 0.66] } }), m = r.acc;
  hardHat2(r, [0.85, 0.66, 0.08]);
  part('Torus', { diameter: 0.36, thickness: 0.04, tessellation: 20 }, r.fPelvis, m, [0.22, 0.14, 0.08], 0, sknAt('pelvis', [0, 0.98, 0.0]), null, [1, 1, 0.8]);
  for (const [x, z] of [[0.17, 0.06], [-0.17, 0.06], [0.12, -0.12]]) part('Box', { width: 0.08, height: 0.12, depth: 0.06 }, r.fPelvis, m, [0.25, 0.16, 0.09], 0, sknAt('pelvis', [x, 0.92, z]));
  part('Box', { width: 0.055, height: 0.12, depth: 0.03 }, r.fChest, m, [0.1, 0.1, 0.1], 0, sknAt('spine_03', [-0.11, 1.36, 0.14]));
  setEmi(r.mat, 0.25); return r;
}
function buildFacelingSk(o = {}) {
  const suit = o.suit || [0.3, 0.33, 0.28], r = buildSkinned('faceling', { colors: { skin: [0.8, 0.68, 0.6], a: suit, b: [0.78, 0.78, 0.7] }, k0: 1, k1: o.gloves ? 1 : 0 }), m = r.acc, h = r.fHead;
  // the smooth head: an egg over the face, the same skin, nothing on the front of it
  part('Sphere', { diameter: 0.25, segments: 20 }, h, m, [0.8, 0.68, 0.6].map(v => v * 0.92), 0, sknAt('Head', [0, 1.69, 0.012]), null, [0.88, 1.12, 1.02]);
  if (o.hat) hardHat2(r, o.hat);
  if (o.vest) { part('Box', { width: 0.38, height: 0.42, depth: 0.25 }, r.fChest, m, [0.62, 0.7, 0.04], 0.15, sknAt('spine_03', [0, 1.24, 0.0])); }
  if (o.clip) { r.clip = part('Box', { width: 0.24, height: 0.32, depth: 0.012 }, r.hands[0], m, [0.4, 0.3, 0.18], 0, [0, -0.08, 0.06], [0.4, 0, 0]); part('Box', { width: 0.2, height: 0.26, depth: 0.004 }, r.hands[0], m, [0.85, 0.85, 0.8], 0, [0, -0.08, 0.068], [0.4, 0, 0]); }
  setEmi(r.mat, 0.3); return r;
}
function buildHoundSk() {
  const r = buildSkinned('hound2', { colors: { skin: [0.42, 0.4, 0.38] }, rigKind: 'hound' }), m = r.acc, h = r.fHead;
  // the jaw hangs open: a dark mouth under the face
  part('Sphere', { diameter: 0.1, segments: 12 }, h, m, [0.12, 0.02, 0.02], 0, sknAt('Head', [0, 1.62, 0.085]), null, [0.8, 1.4, 0.5]);
  setEmi(r.mat, 0.2); return r;
}
// ----- poses on the proxies (deltas the skinned solver adds on top of the clip) -----
// sitting: pelvis down, thighs forward, shins down; arms forward onto the desk
function poseSit2(r, st = {}) {
  animHuman(r, 0, 0, { lean: st.lean ?? 0.18, look: st.look ?? 0, lookX: st.lookX ?? 0, armL: st.armL ?? -0.9, armR: st.armR ?? -0.85, elL: -1.0, elR: -1.1 });
  if (!r.sk) return;
  const d = r.sk.def; r.hips.position.y = d.hy - 0.44; r.sk.drop = 0;
  r.hip[0].rotation.x = d.h0 - 1.45; r.hip[1].rotation.x = d.h1 - 1.45; r.kn[0].rotation.x = d.k0 + 1.45; r.kn[1].rotation.x = d.k1 + 1.45;
}
// crawling on all fours: the body pitched forward, arms reaching down, legs folded, the head held up; ph = gait phase, amp = speed
function poseCrawl2(r, ph, amp, st = {}) {
  animHuman(r, 0, 0, { lean: 0, look: st.look ?? 0, lookX: -1.15 + (st.lookX ?? 0), lookZ: st.lookZ ?? 0 });
  if (!r.sk) return;
  const d = r.sk.def, s = Math.sin(ph), c = Math.cos(ph), A = 0.42 * amp;
  r.hips.rotation.x = 1.32; r.hips.position.y = d.hy - 0.42 - (st.low || 0); r.sk.drop = 0;
  r.hip[0].rotation.x = d.h0 - 1.2 + s * A; r.hip[1].rotation.x = d.h1 - 1.2 - s * A;
  r.kn[0].rotation.x = d.k0 + 1.5 + Math.max(0, -c) * 0.5 * amp; r.kn[1].rotation.x = d.k1 + 1.5 + Math.max(0, c) * 0.5 * amp;
  r.sh[0].rotation.x = d.sh0 - 1.25 - s * A; r.sh[1].rotation.x = d.sh1 - 1.25 + s * A; r.sh[0].rotation.z = -0.1; r.sh[1].rotation.z = 0.1;
  r.el[0].rotation.x = d.el - 0.25 - Math.max(0, c) * 0.4 * amp; r.el[1].rotation.x = d.el - 0.25 - Math.max(0, -c) * 0.4 * amp;
  r.torso.rotation.x = d.tx + 0.05 + Math.sin(ph * 2) * 0.03 * amp;
}
