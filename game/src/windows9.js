// ---------- r6 · Level 9 windows you can see through, LOOK OUTSIDE, and deadbolts that turn ----------
// Ground floor: the wall gets a real opening (sill and head stay solid, so collision, light and line of sight are unchanged).
// Upstairs rooms live off-map (see phys9): their window openings hold a portal pane. While you are up there and near one,
// a second camera standing where the room physically is renders the street into it, so the view out is the real one.
const WIN9 = { W: 0.86, SILL: 0.95, HEAD: 2.05 };
const SHUT9 = [[0.16, 0.2, 0.16], [0.3, 0.12, 0.1], [0.12, 0.14, 0.2], [0.2, 0.18, 0.16]];
const PORT9 = { rtt: null, cam: null, mat: null, mesh: null, on: false, w: 0, h: 0, house: null, k: 0 };
const PEEK9 = { rec: null, k: 0, x0: 0, z0: 0 };

// ----- planning (after genLayout9, before collectPieces9) -----
function planWindows9() {
  LV.win9 = new Map(); LV.winList = [];
  for (const h of LV.houses) {
    h.shut = pick(SHUT9);
    for (let b = 0; b < HS; b++) for (let a = 0; a < HS; a++) {
      const [x, y] = h.cell(a, b);
      for (let d = 0; d < 4; d++) {
        const nx = x + DX[d], ny = y + DY[d];
        if (inGrid(nx, ny) && LV.bld[cIdx(nx, ny)] === h.id) continue;
        if (edgeVal(x, y, d) === 1 && !LV.ek.has(eKey(x, y, d)) && RNG() < 0.7) {
          const r = { h, x, y, d, up: false, lit: h.lit && RNG() < 0.6, hole: h.enter, fab: pick(FABRIC) };
          LV.winList.push(r); if (r.hole) LV.win9.set(eKey(x, y, d), r);
        }
        if (RNG() < 0.62) {
          const lit = h.lit && RNG() < 0.45;
          if (h.enter) {
            const [ux, uy] = h.cellU(a, b); if (edgeVal(ux, uy, d) !== 1 || LV.ek.has(eKey(ux, uy, d))) continue;
            const r = { h, x, y, d, up: true, ux, uy, lit, hole: true, portal: true, fab: pick(FABRIC) };
            LV.winList.push(r); LV.win9.set(eKey(ux, uy, d), r);
          } else LV.winList.push({ h, x, y, d, up: true, lit, hole: false });
        }
      }
    }
  }
}
// wall pieces for a window edge (collectPieces9 → walls): two full jambs, a solid sill, a head like a door lintel
function winPieces9(seg, l0, l1, H) {
  const m = (l0 + l1) / 2, a = m - WIN9.W / 2, b = m + WIN9.W / 2;
  seg(l0 - H, a, 0, CEIL, 'w'); seg(b, l1 + H, 0, CEIL, 'w'); seg(a, b, 0, WIN9.SILL, 'w'); seg(a, b, WIN9.HEAD, CEIL, 'l');
}

// ----- props (buildProps9): frames, sills, shutters, curtains; fake glass only where nothing is behind it -----
function buildWindows9(B, TRIM) {
  const BU = new PropBatch(W9.propMat); BU.fast = true;   // the physical upstairs facade: hidden from the portal camera, which stands right behind it
  const panes = [], ports = [];
  const frame = (P, r, yo, deep, cross) => {   // four bars round the opening, the ledge, and (outside only) the cross
    P.add(r, 'Box', { width: 1.02, height: 0.08, depth: 0.05 }, TRIM, 0, [0, yo + WIN9.HEAD + 0.04, 0.02]);
    for (const s of [-1, 1]) P.add(r, 'Box', { width: 0.08, height: 1.26, depth: 0.05 }, TRIM, 0, [s * (WIN9.W / 2 + 0.04), yo + 1.5, 0.02]);
    P.add(r, 'Box', { width: 1.12, height: 0.05, depth: deep }, TRIM, 0, [0, yo + WIN9.SILL - 0.06, deep / 2]);
    if (cross) { P.add(r, 'Box', { width: 0.035, height: 1.1, depth: 0.03 }, TRIM, 0, [0, yo + 1.5, 0.0]); P.add(r, 'Box', { width: WIN9.W, height: 0.035, depth: 0.03 }, TRIM, 0, [0, yo + 1.62, 0.0]); }
  };
  for (const w of LV.winList) {
    const h = w.h, sh = h.shut, yo = w.up ? FLH : 0, [mx, mz] = edgeMid(w.x, w.y, w.d), o = WT / 2 + 0.004;
    const r = propRoot(mx + DX[w.d] * o, mz + DY[w.d] * o, Math.atan2(DX[w.d], DY[w.d])), P = w.up && h.enter ? BU : B;
    if (w.hole && !w.up) {   // a real ground-floor window: frame outside, nothing in the middle but faint glass
      frame(P, r, 0, 0.12, true); for (const s of [-1, 1]) P.add(r, 'Box', { width: 0.3, height: 1.24, depth: 0.03 }, sh, 0, [s * 0.68, 1.5, 0.02]);
      panes.push({ x: mx, z: mz, d: w.d });
    } else {   // the old look: a full frame with dark (or lit) glass; boarded on sealed houses
      P.add(r, 'Box', { width: 1.02, height: 1.26, depth: 0.05 }, TRIM, 0, [0, yo + 1.5, 0.02]);
      P.add(r, 'Box', { width: 0.86, height: 1.1, depth: 0.02 }, w.lit ? [0.95, 0.62, 0.3] : [0.035, 0.04, 0.05], w.lit ? 0.5 : 0, [0, yo + 1.5, 0.05]);
      P.add(r, 'Box', { width: 0.04, height: 1.1, depth: 0.03 }, TRIM, 0, [0, yo + 1.5, 0.06]); P.add(r, 'Box', { width: 0.86, height: 0.04, depth: 0.03 }, TRIM, 0, [0, yo + 1.62, 0.06]);
      P.add(r, 'Box', { width: 1.12, height: 0.05, depth: 0.12 }, TRIM, 0, [0, yo + 0.87, 0.06]);
      for (const s of [-1, 1]) P.add(r, 'Box', { width: 0.3, height: 1.24, depth: 0.03 }, sh, 0, [s * 0.68, yo + 1.5, 0.02]);
      if (!h.enter) for (let i = 0; i < 3; i++) P.add(r, 'Box', { width: 1.18, height: 0.13, depth: 0.03 }, [0.42, 0.33, 0.24].map(v => v * rnd(0.8, 1.1)), 0, [rnd(-0.05, 0.05), yo + 1.1 + i * 0.38, 0.09], [0, 0, rnd(-0.35, 0.35)]);
    }
    if (!w.hole) continue;
    // inside: frame, deep sill, curtains drawn back
    const ix = w.up ? w.ux : w.x, iy = w.up ? w.uy : w.y, [ex, ez] = edgeMid(ix, iy, w.d);
    W9.win.add(eKey(ix, iy, w.d));
    const q = propRoot(ex - DX[w.d] * o, ez - DY[w.d] * o, Math.atan2(-DX[w.d], -DY[w.d]));
    frame(B, q, 0, 0.16, false);
    for (const s of [-1, 1]) B.add(q, 'Box', { width: 0.3, height: 1.55, depth: 0.05 }, w.fab, 0, [s * 0.62, 1.45, 0.09], [0, 0, s * 0.03]);
    B.add(q, 'Box', { width: 1.5, height: 0.04, depth: 0.04 }, [0.5, 0.45, 0.35], 0, [0, 2.28, 0.1]);
    if (w.portal) ports.push({ x: ex, z: ez, d: w.d, w });
    // LOOK OUTSIDE, from a step back inside the room
    const ip = { x: ex - DX[w.d] * 0.55, z: ez - DY[w.d] * 0.55 };
    w.look = { x: ex - DX[w.d] * 0.32, z: ez - DY[w.d] * 0.32, yaw: Math.atan2(DX[w.d], DY[w.d]), ip };
    W.interact.push({ x: ip.x, z: ip.z, y: 1.5, r: 1.7, win: w, label: () => PEEK9.rec === w ? 'STOP LOOKING' : 'LOOK OUTSIDE', ok: () => G.state === 'play', act: () => peekToggle9(w) });
  }
  const um = BU.finish('upWin9') || []; um.forEach(m => { m.__noPortal = true; m._sortD = 300; });
  buildPanes9(panes); buildPortals9(ports);
}
function buildPanes9(panes) {
  if (!panes.length) return;
  const gm = new BABYLON.StandardMaterial('glass9', SCN); gm.disableLighting = true; gm.emissiveColor = new BABYLON.Color3(0.05, 0.07, 0.1); gm.alpha = 0.13; gm.backFaceCulling = false;
  const ps = panes.map(p => { const m = BABYLON.MeshBuilder.CreatePlane('pane9', { width: WIN9.W, height: WIN9.HEAD - WIN9.SILL }, SCN); m.position.set(p.x, (WIN9.SILL + WIN9.HEAD) / 2, p.z); m.rotation.y = Math.atan2(DX[p.d], DY[p.d]); return m; });
  const m = BABYLON.Mesh.MergeMeshes(ps, true, true); if (m) { m.material = gm; m.isPickable = false; m.alphaIndex = 10; m.__noPortal = false; W9.panes = m; }
  MATS.std = (MATS.std || []).concat([gm]);
}

// ----- portals for the off-map upstairs -----
BABYLON.Effect.ShadersStore.portal9VertexShader = `precision highp float; attribute vec3 position; uniform mat4 world; uniform mat4 viewProjection; void main() { gl_Position = viewProjection * world * vec4(position, 1.0); }`;
BABYLON.Effect.ShadersStore.portal9FragmentShader = `precision highp float; uniform sampler2D rtt; uniform vec4 pp;
void main() { vec2 uv = gl_FragCoord.xy / pp.xy; vec3 night = vec3(0.012, 0.016, 0.028); vec3 c = mix(night, texture2D(rtt, uv).rgb, pp.z);
  c += vec3(0.015, 0.02, 0.03) * (1.0 - uv.y * 0.6); gl_FragColor = vec4(c, 1.0); }`;
function buildPortals9(ports) {
  Object.assign(PORT9, { rtt: null, cam: null, mat: null, mesh: null, on: false, w: 0, h: 0, house: null, k: 0, list: ports });
  if (!ports.length) return;
  const mat = new BABYLON.ShaderMaterial('portal9', SCN, { vertex: 'portal9', fragment: 'portal9' }, { attributes: ['position'], uniforms: ['world', 'viewProjection', 'pp'], samplers: ['rtt'] });
  mat.backFaceCulling = false; mat.setVector4('pp', new BABYLON.Vector4(1, 1, 0, 0));
  const ps = ports.map(p => { const m = BABYLON.MeshBuilder.CreatePlane('port9', { width: WIN9.W + 0.02, height: WIN9.HEAD - WIN9.SILL + 0.02 }, SCN); m.position.set(p.x, (WIN9.SILL + WIN9.HEAD) / 2, p.z); m.rotation.y = Math.atan2(DX[p.d], DY[p.d]); return m; });
  const m = BABYLON.Mesh.MergeMeshes(ps, true, true); m.material = mat; m.isPickable = false; m.__noPortal = true;
  const cam = new BABYLON.FreeCamera('portalCam', V3(0, 0, 0), SCN); cam.inputs.clear(); cam.minZ = 0.05;
  Object.assign(PORT9, { mat, mesh: m, cam });
}
function portalRtt9() {   // (re)made at half the render size so the screen-space lookup lines up
  const w = Math.max(64, ENG.getRenderWidth() >> 1), h = Math.max(64, ENG.getRenderHeight() >> 1);
  if (PORT9.rtt && PORT9.w === w && PORT9.h === h) return PORT9.rtt;
  if (PORT9.rtt) { const i = SCN.customRenderTargets.indexOf(PORT9.rtt); if (i >= 0) SCN.customRenderTargets.splice(i, 1); PORT9.rtt.dispose(); }
  const type = ENG.getCaps().textureHalfFloatRender ? BABYLON.Constants.TEXTURETYPE_HALF_FLOAT : BABYLON.Constants.TEXTURETYPE_UNSIGNED_INT;
  const rtt = new BABYLON.RenderTargetTexture('portal9rtt', { width: w, height: h }, SCN, false, true, type);
  rtt.activeCamera = PORT9.cam; rtt.clearColor = SCN.clearColor;
  rtt.renderListPredicate = m => !m.__noPortal && m.isEnabled() && m.isVisible;
  rtt.onBeforeRenderObservable.add(() => { const p = PORT9.cam.globalPosition; for (const m of MATS.list) m.setVector3('camPos', p); });
  rtt.onAfterRenderObservable.add(() => { const p = CAM.globalPosition; for (const m of MATS.list) m.setVector3('camPos', p); });
  PORT9.mat.setTexture('rtt', rtt); Object.assign(PORT9, { rtt, w, h, on: false });
  return rtt;
}
function portalTick9(dt) {
  if (!PORT9.mesh) return;
  const c = cIdx(cellOf(PL.x), cellOf(PL.z)), up = LV.fl && LV.fl[c] === 1, h = up ? houseOf9(c) : null;
  let want = false;
  if (h && G.state !== 'loading') {
    const f = CAM.getDirection(BABYLON.Axis.Z);
    for (const p of PORT9.list) { if (p.w.h !== h) continue; const dx = p.x - CAM.position.x, dz = p.z - CAM.position.z, d = Math.hypot(dx, dz); if (d < 14 && (dx * f.x + dz * f.z) / (d || 1) > -0.35) { want = true; break; } }
  }
  if (want) {
    const rtt = portalRtt9(); PORT9.house = h;
    const C = PORT9.cam; C.position.set(CAM.position.x + h.up.dx, CAM.position.y + FLH, CAM.position.z + h.up.dz);   // the same eye, where the room really is
    C.rotation.copyFrom(CAM.rotation); C.fov = CAM.fov; C.maxZ = CAM.maxZ; C.minZ = 0.05; C.computeWorldMatrix(true);
    if (!PORT9.on) { SCN.customRenderTargets.push(rtt); PORT9.on = true; }
  } else if (PORT9.on) { const i = SCN.customRenderTargets.indexOf(PORT9.rtt); if (i >= 0) SCN.customRenderTargets.splice(i, 1); PORT9.on = false; }
  PORT9.k = PORT9.on ? Math.min(1, PORT9.k + dt * 6) : 0;
  PORT9.mat.setVector4('pp', new BABYLON.Vector4(ENG.getRenderWidth(), ENG.getRenderHeight(), PORT9.k, 0));
}
function teardownWin9() {
  if (PORT9.rtt) { const i = SCN && SCN.customRenderTargets ? SCN.customRenderTargets.indexOf(PORT9.rtt) : -1; if (i >= 0) SCN.customRenderTargets.splice(i, 1); try { PORT9.rtt.dispose(); } catch (e) {} }
  Object.assign(PORT9, { rtt: null, cam: null, mat: null, mesh: null, on: false, list: [] }); PEEK9.rec = null; PEEK9.k = 0;
}

// ----- LOOK OUTSIDE: the camcorder goes up to the glass; any step or E again lets go -----
function peekToggle9(w) {
  if (PEEK9.rec === w) { PEEK9.rec = null; return; }
  Object.assign(PEEK9, { rec: w, x0: PL.x, z0: PL.z }); PL.yaw = PL.yaw + angDiff(PL.yaw, w.look.yaw) * 0.6; SFX.click();
  if (!G9.peekTip) { G9.peekTip = true; toast(IS_TOUCH ? 'MOVE TO STEP BACK' : 'LOOKING OUTSIDE · MOVE OR [E] TO STEP BACK', 2.6); }
}
function peekTick9(dt) {   // after playerCamera, before the frame renders
  const w = PEEK9.rec;
  if (w && (G.state !== 'play' || Math.hypot(PL.x - PEEK9.x0, PL.z - PEEK9.z0) > 0.35 || dist2(PL.x, PL.z, w.look.ip.x, w.look.ip.z) > 2.2)) PEEK9.rec = null;
  PEEK9.k = damp(PEEK9.k, PEEK9.rec ? 1 : 0, PEEK9.rec ? 4 : 9, dt);
  if (PEEK9.k < 0.002) return;
  const L = (w || PEEK9.last).look; PEEK9.last = w || PEEK9.last;
  const lim = 1.2, dy = angDiff(L.yaw, PL.yaw); if (PEEK9.rec && Math.abs(dy) > lim) PL.yaw = L.yaw + Math.sign(dy) * lim;   // you can't turn your back on it while your face is at the glass
  const k = smooth(0, 1, PEEK9.k);
  CAM.position.x = lerp(CAM.position.x, L.x, k); CAM.position.z = lerp(CAM.position.z, L.z, k); CAM.position.y = lerp(CAM.position.y, 1.5, k);
  CAM.fov = CAM.fov / lerp(1, 1.35, k);
}

// ----- deadbolts: a thumb-turn on both faces of the leaf and a bolt that slides into the frame -----
function addLock9(dr) {
  const L = DOORW - 0.06, m = W9.propMat, leaf = dr.mesh;
  const rose = mkMerged(m, P => { for (const s of [-1, 1]) P('Cylinder', { diameter: 0.062, height: 0.012, tessellation: 14 }, [0.72, 0.6, 0.3], 0, [0, 0, s * 0.029], [Math.PI / 2, 0, 0]); }, 'rose9');
  attach(rose, leaf, L - 0.09, 1.24, 0);
  const turn = mkMerged(m, P => { for (const s of [-1, 1]) { P('Box', { width: 0.016, height: 0.052, depth: 0.016 }, [0.78, 0.66, 0.34], 0, [0, 0, s * 0.042]); P('Cylinder', { diameter: 0.02, height: 0.02, tessellation: 8 }, [0.7, 0.58, 0.3], 0, [0, 0, s * 0.036], [Math.PI / 2, 0, 0]); } }, 'turn9');
  attach(turn, leaf, L - 0.09, 1.24, 0);
  const bolt = mkMerged(m, P => { P('Box', { width: 0.07, height: 0.024, depth: 0.022 }, [0.7, 0.68, 0.62], 0, [0, 0, 0]); }, 'bolt9');
  attach(bolt, leaf, L - 0.03, 1.24, 0);
  Object.assign(dr, { turn, bolt, boltX: L - 0.03, lk: 0 });
}
function lockAnim9(dr, dt) {   // true while the lock is still moving
  if (!dr.turn) return false;
  const want = dr.latched ? 1 : 0; dr.lk = approach(dr.lk || 0, want, 5, 5, dt);
  dr.turn.rotation.z = -dr.lk * Math.PI / 2; dr.bolt.position.x = dr.boltX + dr.lk * 0.05;
  return dr.lk !== want;
}
SFX9.deadbolt = function (pos, on) { shot((d, t) => {   // the thumb-turn ratchets, then the bolt throws home (or draws back)
  for (let i = 0; i < 3; i++) nz(d, t + i * 0.045, 0.02, 'bandpass', on ? 3600 - i * 250 : 3000 + i * 250, 7, 0.35, 0.001);
  const tb = t + 0.16;
  nz(d, tb, on ? 0.09 : 0.06, 'lowpass', on ? 900 : 1300, 1, on ? 0.9 : 0.6, 0.001);
  tone(d, tb, on ? 0.12 : 0.08, 'square', on ? 210 : 260, on ? 140 : 200, on ? 0.12 : 0.07, 0.001);
  tone(d, tb + 0.005, 0.22, 'triangle', on ? 2650 : 2350, on ? 2600 : 2300, 0.035, 0.001);
  nz(d, tb + 0.02, 0.03, 'bandpass', 5200, 6, 0.22, 0.001);
  return 0.55; }, pos, 1); };
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { PORT9, PEEK9, WIN9, peekToggle9, portalTick9, planWindows9 }));
