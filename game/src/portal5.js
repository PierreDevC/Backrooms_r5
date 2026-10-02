// ---------- r7 · Level 5 portal doors ----------
// Every vestibule pair (N↔E2, W↔S, ballroom↔State Floor) is a throat: the inner door of one vestibule opens onto the corridor outside the
// twin's real door. While an inner door stands open, a second camera renders the twin's side from the matching place (same eye, carried
// through the transform), clipped at the twin's doorway with an oblique near plane, and the doorway shows that picture screen-space.
// Walk through and you are standing in the twin's doorway, facing out into its corridor: nothing pops.
const PORT5 = { list: [], rtt: null, cam: null, w: 0, h: 0, on: false, act: null, P: null };
BABYLON.Effect.ShadersStore.portal5VertexShader = `precision highp float; attribute vec3 position; uniform mat4 world; uniform mat4 viewProjection; void main() { gl_Position = viewProjection * world * vec4(position, 1.0); }`;
BABYLON.Effect.ShadersStore.portal5FragmentShader = `precision highp float; uniform sampler2D rtt; uniform vec4 pp;
void main() { vec2 uv = gl_FragCoord.xy / pp.xy; vec3 dark = vec3(0.018, 0.012, 0.008); gl_FragColor = vec4(mix(dark, texture2D(rtt, uv).rgb, pp.z), 1.0); }`;
// v: a vestibule, t: its twin. Points near v's inner door map to the matching points outside t's real door.
function portalXf5(v, t) {
  const th = Math.atan2(-t.fx, -t.fz) - Math.atan2(v.fx, v.fz), cs = Math.cos(th), sn = Math.sin(th);
  const ax = v.cx + v.fx * CELL / 2, az = v.cz + v.fz * CELL / 2, bx = t.cx - t.fx * CELL / 2, bz = t.cz - t.fz * CELL / 2;
  return { th, cs, sn, ax, az, bx, bz, map(x, z) { const dx = x - ax, dz = z - az; return [bx + dx * cs + dz * sn, bz - dx * sn + dz * cs]; }, rot(x, z) { return [x * cs + z * sn, -x * sn + z * cs]; } };
}
function buildPortals5() {
  Object.assign(PORT5, { list: [], rtt: null, cam: null, w: 0, h: 0, on: false, act: null, P: null });
  for (const w of LV.warps) for (const [v, t] of [[w.a, w.b], [w.b, w.a]]) {
    const dr = W9.doorAt.get(eKey(v.vx, v.vy, (v.vd + 2) % 4)), real = W9.doorAt.get(eKey(t.vx, t.vy, t.vd)); if (!dr || !real) continue;
    const X = portalXf5(v, t), mat = new BABYLON.ShaderMaterial('portal5', SCN, { vertex: 'portal5', fragment: 'portal5' }, { attributes: ['position'], uniforms: ['world', 'viewProjection', 'pp'], samplers: ['rtt'] });
    mat.backFaceCulling = false; mat.setVector4('pp', new BABYLON.Vector4(1, 1, 0, 0));
    // the stencil: a shallow box behind the doorway plane (so it still covers the hole while the lens is crossing it)
    const D = 0.55, m = BABYLON.MeshBuilder.CreateBox('port5', { width: DOORW - 0.012, height: DOORH - 0.012, depth: D }, SCN);
    m.position.set(X.ax + v.fx * D / 2, DOORH / 2, X.az + v.fz * D / 2); m.rotation.y = Math.atan2(v.fx, v.fz); m.material = mat; m.isPickable = false; m.__noPortal = true; m._sortD = 200; m.setEnabled(false);
    // nothing walks into the void behind the frame if a crossing is ever missed
    const bx = X.ax + v.fx * 0.75, bz = X.az + v.fz * 0.75, hw = DOORW / 2 + 0.2, hd = 0.12;
    addSolid(bx - (v.fx ? hd : hw), bz - (v.fz ? hd : hw), bx + (v.fx ? hd : hw), bz + (v.fz ? hd : hw), 'wall');
    const P = { v, t, dr, real, X, mat, mesh: m, k: 0 }; dr.portal = P; PORT5.list.push(P);
  }
  const cam = new BABYLON.FreeCamera('portalCam5', V3(0, 0, 0), SCN); cam.inputs.clear(); cam.minZ = 0.05; PORT5.cam = cam;
}
function portalRtt5() {
  const w = Math.max(64, ENG.getRenderWidth() >> 1), h = Math.max(64, ENG.getRenderHeight() >> 1);
  if (PORT5.rtt && PORT5.w === w && PORT5.h === h) return PORT5.rtt;
  if (PORT5.rtt) { const i = SCN.customRenderTargets.indexOf(PORT5.rtt); if (i >= 0) SCN.customRenderTargets.splice(i, 1); PORT5.rtt.dispose(); PORT5.on = false; }
  const type = ENG.getCaps().textureHalfFloatRender ? BABYLON.Constants.TEXTURETYPE_HALF_FLOAT : BABYLON.Constants.TEXTURETYPE_UNSIGNED_INT;
  const rtt = new BABYLON.RenderTargetTexture('portal5rtt', { width: w, height: h }, SCN, false, true, type);
  rtt.activeCamera = PORT5.cam; rtt.clearColor = SCN.clearColor;
  rtt.renderListPredicate = m => !m.__noPortal && m.isEnabled() && m.isVisible;
  const sv = new Float32Array(8);
  rtt.onBeforeRenderObservable.add(() => {   // the twin side sees the camera, and the flashlight, where the transform puts them
    const p = PORT5.cam.globalPosition; for (const m of MATS.list) m.setVector3('camPos', p);
    const P = PORT5.P; if (!P) return;
    for (let i = 0; i < 4; i++) { sv[i] = SLOT.pos[i]; sv[4 + i] = SLOT.dir[i]; }
    const [x, z] = P.X.map(SLOT.pos[0], SLOT.pos[2]), [dx, dz] = P.X.rot(SLOT.dir[0], SLOT.dir[2]);
    SLOT.pos[0] = x; SLOT.pos[2] = z; SLOT.dir[0] = dx; SLOT.dir[2] = dz;
  });
  rtt.onAfterRenderObservable.add(() => {
    const p = CAM.globalPosition; for (const m of MATS.list) m.setVector3('camPos', p);
    if (PORT5.P) for (let i = 0; i < 4; i++) { SLOT.pos[i] = sv[i]; SLOT.dir[i] = sv[4 + i]; }
  });
  for (const P of PORT5.list) P.mat.setTexture('rtt', rtt);
  Object.assign(PORT5, { rtt, w, h });
  return rtt;
}
// oblique near plane (Lengyel): replace the projection's z row so the near plane is the twin's doorway
const _pV = new BABYLON.Matrix(), _pVi = new BABYLON.Matrix(), _pP = new BABYLON.Matrix(), _pPi = new BABYLON.Matrix();
function obliqueProj5(cam, P) {
  const X = P.X, nx = -P.t.fx, nz = -P.t.fz, Cw = [nx, 0, nz, -(nx * X.bx + nz * X.bz)];
  cam.getViewMatrix(true).invertToRef(_pVi); const vi = _pVi.m, C = [0, 1, 2, 3].map(i => vi[i * 4] * Cw[0] + vi[i * 4 + 1] * Cw[1] + vi[i * 4 + 2] * Cw[2] + vi[i * 4 + 3] * Cw[3]);
  _pP.copyFrom(CAM.getProjectionMatrix(true)); const m = _pP.m;
  if (C[3] > -0.06) return _pP;   // the lens is at (or past) the doorway: plain projection
  _pP.invertToRef(_pPi); const pi = _pPi.m, qc = [Math.sign(C[0]) || 1, Math.sign(C[1]) || 1, 1, 1];
  const q = [0, 1, 2, 3].map(i => qc[0] * pi[i] + qc[1] * pi[4 + i] + qc[2] * pi[8 + i] + qc[3] * pi[12 + i]);
  const R4 = [m[3], m[7], m[11], m[15]], cq = C[0] * q[0] + C[1] * q[1] + C[2] * q[2] + C[3] * q[3], r4q = R4[0] * q[0] + R4[1] * q[1] + R4[2] * q[2] + R4[3] * q[3];
  if (Math.abs(cq) < 1e-6) return _pP;
  const lam = 2 * r4q / cq;
  m[2] = lam * C[0] - R4[0]; m[6] = lam * C[1] - R4[1]; m[10] = lam * C[2] - R4[2]; m[14] = lam * C[3] - R4[3];
  _pP.markAsUpdated(); return _pP;
}
// which portal (if any) the camera is looking through this frame
function portalPick5() {
  const cp = CAM.position, f = CAM.getDirection(BABYLON.Axis.Z); let best = null, bs = 1e9;
  for (const P of PORT5.list) {
    if (P.dr.open < 0.02) continue;
    const dx = P.X.ax - cp.x, dz = P.X.az - cp.z, d = Math.hypot(dx, dz);
    if (d > 18) continue;
    const side = (cp.x - P.X.ax) * P.v.fx + (cp.z - P.X.az) * P.v.fz; if (side > 0.02) continue;   // only from the vestibule side
    if (d > 1.2 && (dx * f.x + dz * f.z) / d < -0.2) continue;
    if (d > 2.5 && !los(cp.x, cp.z, P.X.ax - P.v.fx * 0.3, P.X.az - P.v.fz * 0.3)) continue;
    if (d < bs) { bs = d; best = P; }
  }
  return best;
}
function portalTick5(dt) {
  if (!PORT5.cam || G.state === 'loading') return;
  const P = portalPick5();
  for (const Q of PORT5.list) { const on = Q.dr.open > 0.02; if (Q.mesh.isEnabled() !== on) Q.mesh.setEnabled(on); }
  if (P) {
    const rtt = portalRtt5(), C = PORT5.cam, cp = CAM.globalPosition, [x, z] = P.X.map(cp.x, cp.z);
    C.position.set(x, cp.y, z); C.rotation.set(CAM.rotation.x, CAM.rotation.y + P.X.th, CAM.rotation.z); C.fov = CAM.fov; C.minZ = CAM.minZ; C.maxZ = CAM.maxZ; C.computeWorldMatrix(true);
    C.freezeProjectionMatrix(obliqueProj5(C, P));
    if (PORT5.P !== P) for (const Q of PORT5.list) Q.k = 0;
    PORT5.P = P;
    if (!PORT5.on) { SCN.customRenderTargets.push(rtt); PORT5.on = true; }
  } else if (PORT5.on) { const i = SCN.customRenderTargets.indexOf(PORT5.rtt); if (i >= 0) SCN.customRenderTargets.splice(i, 1); PORT5.on = false; PORT5.P = null; }
  const W = ENG.getRenderWidth(), H = ENG.getRenderHeight();
  for (const Q of PORT5.list) { Q.k = Q === PORT5.P && PORT5.on ? Math.min(1, Q.k + dt * 8) : 0; if (Q.mesh.isEnabled()) Q.mat.setVector4('pp', new BABYLON.Vector4(W, H, Q.k, 0)); }
  // inner doors swing shut behind you once you are well away
  for (const Q of PORT5.list) if (Q.dr.target && dist2(PL.x, PL.z, Q.X.ax, Q.X.az) > 11 && G.state === 'play') setDoor(Q.dr, false);
}
function portalOpen5(dr) {
  const P = dr.portal; if (!P) { useDoor(dr); return; }
  if (!dr.target) { snapDoor5(P.real, true); if (!G5.portalTip) { G5.portalTip = true; later(0.9, () => toast(IS_TOUCH ? 'THAT IS NOT THE ROOM BEHIND THE WALL' : 'THAT IS NOT WHAT IS BEHIND THIS WALL', 2.6)); } }
  useDoor(dr);
}
// crossing: the player's centre passes the inner door's plane, inside the frame → carried to the twin's doorway
function portalCross5() {
  const c = cIdx(cellOf(PL.x), cellOf(PL.z));
  let v = null; if (c >= 0 && LV.zone[c] === Z5.VEST) for (const P of PORT5.list) if (cIdx(P.v.vx, P.v.vy) === c) { v = P; break; }
  if (v) G5.vest = v; else if (G5.vest && c !== cIdx(G5.vest.v.vx + G5.vest.v.fx, G5.vest.v.vy + G5.vest.v.fz)) G5.vest = null;
  const P = G5.vest; if (!P || P.dr.target !== 1) return;
  const s = (PL.x - P.X.ax) * P.v.fx + (PL.z - P.X.az) * P.v.fz, l = (PL.x - P.X.ax) * -P.v.fz + (PL.z - P.X.az) * P.v.fx;
  if (s <= 0 || Math.abs(l) > DOORW / 2) return;
  const X = P.X, [x, z] = X.map(PL.x, PL.z); PL.x = x; PL.z = z; PL.yaw += X.th;
  [PL.vx, PL.vz] = X.rot(PL.vx, PL.vz); [PL.kx, PL.kz] = X.rot(PL.kx || 0, PL.kz || 0);
  const [cx, cz] = X.map(CAM.position.x, CAM.position.z); CAM.position.x = cx; CAM.position.z = cz; CAM.rotation.y += X.th; CAM.computeWorldMatrix(true);
  if (P.real.target !== 1) snapDoor5(P.real, true);
  PL.cell = -1; updateField(); G5.warps++; G5.vest = null;
}
function teardownPortal5() {
  if (PORT5.rtt) { const i = SCN && SCN.customRenderTargets ? SCN.customRenderTargets.indexOf(PORT5.rtt) : -1; if (i >= 0) SCN.customRenderTargets.splice(i, 1); try { PORT5.rtt.dispose(); } catch (e) {} }
  Object.assign(PORT5, { list: [], rtt: null, cam: null, on: false, act: null, P: null });
}
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { PORT5, portalTick5, portalCross5, portalOpen5, portalXf5, obliqueProj5 }));
