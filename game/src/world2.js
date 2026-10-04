// ---------- r9 · Level 2 world assembly: materials, pipes, signage, doors ----------
const WP2 = {};
function resetWP2() {
  Object.assign(WP2, { B: null, BOn: null, BFl: null, BRed: null, BGrn: null, propMat: null, signs: [], pos: {}, vents: [], water: null, steam: [], phones: [], gauges: [], finishProps: null, lensFl: null, red: null, grn: null, wregRoot: null, nregRoot: null, eregRoot: null });
}
resetWP2();
// ----- the assembly -----
async function buildWorld2(progress) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0.03, 0.025, 0.02, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 70; CAM.fov = 1.0;
  resetW9(); resetWP2(); r2Reset(); k2Reset();
  progress(0.04, 'FOLLOWING THE PIPES…'); await nextFrame();
  genLayout2(); collectPieces5(side2, opening2); planLights2();
  progress(0.1, 'POURING THE CONCRETE…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  buildArch2();
  progress(0.22, 'BOLTING THE FLANGES…'); await nextFrame();
  buildWater2(SCN); buildProps2();
  progress(0.5, 'HANGING DOORS…'); await nextFrame();
  buildDoors2(); buildStory2(); buildItems2(G.diff); buildDust(); buildSteam2();
  WP2.finishProps();
  await bake2(progress);
  bk2Meshes(SCN); k2Reset(); RT.tri = RT.nodes = RT.meta = null;
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.94, 'LISTENING TO THE PIPES…'); await nextFrame();
}

// ----- doors -----
const DOORC2 = { office: [0.26, 0.34, 0.28], hall: [0.34, 0.33, 0.3], cold: [0.66, 0.7, 0.72], camp: [0.4, 0.36, 0.22], sw: [0.5, 0.42, 0.12], valve: [0.36, 0.22, 0.14], room: [0.4, 0.4, 0.38] };
function buildDoors2() {
  W9.doorAnim = new Set();
  for (const e of LV.ek.values()) {
    if (e.kind !== 'door') continue;
    const horiz = e.d === 1 || e.d === 3, [mx, mz] = edgeMid(e.x, e.y, e.d), nx = e.x + DX[e.d], ny = e.y + DY[e.d];
    const to = [nx, ny], s = horiz ? (to[1] === Math.max(e.y, ny) ? 1 : -1) : (to[0] === Math.max(e.x, nx) ? 1 : -1);
    const hinge = tnode(null, horiz ? mx - DOORW / 2 + 0.03 : mx, 0, horiz ? mz : mz - DOORW / 2 + 0.03);
    const mesh = doorLeaf(DOORC2[e.dk] || DOORC2.room, true); mesh.parent = hinge;
    const c0 = horiz ? 0 : -Math.PI / 2, c1 = c0 + (horiz ? -s : s) * 1.62;
    const bx = horiz ? [mx - DOORW / 2, mz - WT / 2, mx + DOORW / 2, mz + WT / 2] : [mx - WT / 2, mz - DOORW / 2, mx + WT / 2, mz + DOORW / 2];
    const dr = { e, key: eKey(e.x, e.y, e.d), horiz, s, hinge, mesh, c0, c1, bx, mx, mz, house: -1, dk: e.dk, metal: true, open: 0, target: 0, latched: false, locked: !!e.locked, jammed: !!e.jammed, solid: addSolid(bx[0], bx[1], bx[2], bx[3], 'door'), shake: 0, cull: 30, bangs: 0 };
    markDyn(bx[0], bx[1], bx[2], bx[3], 1); hinge.rotation.y = c0;
    W9.doors.push(dr); W9.doorAt.set(dr.key, dr);
    if (e.plaque) { const sd = sideOf5(e), r = atWall5(sd, 0, 0); sign2(e.plaque, twin(r), [DOORW / 2 + 0.42, 1.7, 0.03], 0.62, 0.18, { bg: '#d8d2bc', fg: '#1d1d1d', line: '#555', emis: 0.22 }); }
    W.interact.push({ x: mx, z: mz, y: 1.1, r: 1.75, door: dr, label: () => doorLabel2(dr), ok: () => true, act: () => useDoor2(dr) });
  }
}

// ----- steam: soft billboards at the vents; the surge makes them all pour -----
function buildSteam2() {
  const dt = new BABYLON.DynamicTexture('steam2', { width: 128, height: 128 }, SCN, false), c = dt.getContext();
  c.fillStyle = '#000'; c.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 7; i++) { const x = 64 + (Math.random() - 0.5) * 40, y = 64 + (Math.random() - 0.5) * 40, r = 26 + Math.random() * 26, g = c.createRadialGradient(x, y, 2, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.13)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); }
  dt.update();
  const m = new BABYLON.StandardMaterial('steam2M', SCN); m.opacityTexture = dt; dt.getAlphaFromRGB = true; m.emissiveColor = new BABYLON.Color3(0.62, 0.6, 0.56); m.diffuseColor = BABYLON.Color3.Black(); m.specularColor = BABYLON.Color3.Black(); m.disableLighting = true; m.backFaceCulling = false; m.alpha = 0.5;
  WP2.steamMat = m;
  for (const v of WP2.vents) {
    const puffs = [];
    for (let i = 0; i < 4; i++) { const p = BABYLON.MeshBuilder.CreatePlane('puff2', { size: 1 }, SCN); p.material = m; p.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL; p.isPickable = false; p.alphaIndex = 6; p._sortD = 2100; puffs.push({ m: p, ph: i / 4 }); }
    v.puffs = puffs;
  }
}
