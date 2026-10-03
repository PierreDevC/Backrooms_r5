// ---------- r9 · Level 2 world assembly: materials, pipes, signage, doors ----------
const WP2 = {};
function resetWP2() {
  Object.assign(WP2, { B: null, BOn: null, BFl: null, BRed: null, BGrn: null, propMat: null, signs: [], pos: {}, vents: [], water: null, steam: [], phones: [], gauges: [], finishProps: null, lensFl: null, red: null, grn: null });
}
resetWP2();
const COL2 = { rust: [0.38, 0.2, 0.11], iron: [0.2, 0.2, 0.21], steel: [0.42, 0.43, 0.44], grey: [0.5, 0.5, 0.48], cream: [0.78, 0.74, 0.62], insul: [0.72, 0.7, 0.62], red: [0.62, 0.1, 0.06], yellow: [0.82, 0.62, 0.08], green: [0.18, 0.4, 0.26],
  black: [0.04, 0.04, 0.045], wood: [0.42, 0.29, 0.18], olive: [0.33, 0.36, 0.26], meg: [0.78, 0.46, 0.12], white: [0.82, 0.82, 0.78], copper: [0.62, 0.36, 0.2], brass: [0.66, 0.52, 0.24], blue: [0.16, 0.28, 0.46] };

// ----- signage: stencilled tunnel signs -----
function sign2(text, root, pos, w, h, o = {}) {
  const px = 512, py = Math.max(64, Math.round(512 * h / w)), S = dynTexPlane('sign2', w, h, px, py, root, pos, o.emis ?? 0.35), c = S.ctx;
  c.fillStyle = o.bg || '#c9a227'; c.fillRect(0, 0, px, py);
  if (o.hazard) { c.fillStyle = '#151515'; for (let i = -py; i < px; i += 40) { c.beginPath(); c.moveTo(i, py); c.lineTo(i + 20, py); c.lineTo(i + 20 + py * 0.25, py - py * 0.12); c.lineTo(i + py * 0.25, py - py * 0.12); c.fill(); } }
  c.strokeStyle = o.line || '#151515'; c.lineWidth = 6; c.strokeRect(8, 8, px - 16, py - 16);
  c.fillStyle = o.fg || '#151515'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = String(text).split('\n'), fs = Math.round(Math.min(py / (lines.length + 0.9), px / Math.max(...lines.map(l => l.length)) * 1.45));
  c.font = `bold ${fs}px "Courier New", monospace`; lines.forEach((l, i) => c.fillText(l, px / 2, py / 2 + (i - (lines.length - 1) / 2) * fs * 1.12));
  // grime
  for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(30,20,10,${Math.random() * 0.18})`; c.fillRect(Math.random() * px, Math.random() * py, Math.random() * 60, Math.random() * 30); }
  S.dt.update(); WP2.signs.push(S); return S;
}
function pr2(x, z, ry = 0, y = 0) { const r = propRoot(x, z, ry); r.position.y = y; r.computeWorldMatrix(true); return r; }
function wallAt2(x, y, d, along = 0, off = 0.005) { const [px, pz, ry] = wallPt(x, y, d, off, along); return propRoot(px, pz, ry); }
function twin2(r) { const t = twin(r); t.position.y = r.position.y; t.computeWorldMatrix(true); return t; }
const cc2 = v => cellCenter(v);

// ----- pipes: every tunnel wall carries a bundle; the ceiling carries a run along the tunnel -----
// a deterministic bundle per wall segment, so neighbouring segments line up into one long run
function pipeBundle2(B, x, y, d, h, kind) {
  const [mx, mz] = edgeMid(x, y, d), horiz = d === 1 || d === 3, inX = -DX[d], inZ = -DY[d], L = CELL / 2 + 0.02;
  const P = (off, yy) => [mx + inX * off, yy, mz + inZ * off];
  const A = (off, yy, ex = 0) => horiz ? [[mx - L - ex, yy, mz + inZ * off], [mx + L + ex, yy, mz + inZ * off]] : [[mx + inX * off, yy, mz - L - ex], [mx + inX * off, yy, mz + L + ex]];
  const run = (off, yy, r, col) => { const [a, b] = A(off, yy); B.pipe(a, b, r, col, 0, 8); };
  const flange = (off, yy, r, col) => { const [a, b] = A(off, yy); const m = [(a[0] + b[0]) / 2, yy, (a[2] + b[2]) / 2], ax = horiz ? [0.035, 0, 0] : [0, 0, 0.035]; B.pipe([m[0] - ax[0], yy, m[2] - ax[2]], [m[0] + ax[0], yy, m[2] + ax[2]], r * 1.35, col, 0, 8); };
  const seed = h2i(x * 3 + d, y * 5 + d, 291);
  if (kind === 'gall') { run(0.22, 0.42, 0.16, COL2.rust); run(0.2, 1.65, 0.07, COL2.iron); if (seed < 0.5) run(0.16, 2.05, 0.05, COL2.copper); flange(0.22, 0.42, 0.16, COL2.rust); return; }
  if (kind === 'big') { run(0.26, 0.5, 0.2, COL2.grey); run(0.24, Math.min(h - 0.5, 4.6), 0.13, COL2.rust); flange(0.26, 0.5, 0.2, COL2.iron); return; }
  // tunnel: a fat insulated steam main low down, two service lines at shoulder height, conduit high up
  run(0.24, 0.36, 0.17, COL2.insul); flange(0.24, 0.36, 0.17, COL2.iron);
  run(0.16, 1.55, 0.07, seed < 0.5 ? COL2.rust : COL2.iron); run(0.13, 1.82, 0.05, seed < 0.3 ? COL2.copper : COL2.steel);
  run(0.1, h - 0.28, 0.035, COL2.black);
  if (seed > 0.86) { const p = P(0.16, 0); B.pipe([p[0], 0.36, p[2]], [p[0], h, p[2]], 0.07, COL2.rust, 0, 8); }   // a riser going up into the deck
  if (seed > 0.6 && seed < 0.68) WP2.gauges.push({ x: mx + inX * 0.24, z: mz + inZ * 0.24, y: 1.25, ry: Math.atan2(inX, inZ) });
}
function buildPipes2(B) {
  const wallSeg = (x, y, d) => { const nx = x + DX[d], ny = y + DY[d], v = edgeVal(x, y, d); return v === 1 || (v === 2 && !LV.ek.get(eKey(x, y, d))) ; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const c = cIdx(x, y), z = LV.zone[c]; if (!z || z === ZP2.SHELTER || z === ZP2.COLD || z === ZP2.OFFICE || z === ZP2.LIFT || z === ZP2.CAMP) continue;
    const r = LV.rooms[LV.room[c]], kind = z === ZP2.GALL ? 'gall' : (z === ZP2.SWITCH || z === ZP2.HALL) ? 'big' : 'tun';
    for (let d = 0; d < 4; d++) {
      if (!wallSeg(x, y, d)) continue; const e = LV.ek.get(eKey(x, y, d)) || LV.ek.get(eKey(x + DX[d], y + DY[d], (d + 2) % 4)); if (e) continue;
      if (kind === 'big' && (x + y + d) % 2) continue;
      pipeBundle2(B, x, y, d, r.h, kind);
    }
    // overhead: a run along the tunnel's axis, offset from the centre
    if (kind === 'tun' || kind === 'gall') {
      const ns = edgeVal(x, y, 1) === 0 || edgeVal(x, y, 3) === 0, ew = edgeVal(x, y, 0) === 0 || edgeVal(x, y, 2) === 0, cx = cc2(x), cz = cc2(y), hh = r.h - 0.22;
      if (ns && !ew) { B.pipe([cx - 0.6, hh, cz - CELL / 2], [cx - 0.6, hh, cz + CELL / 2], 0.09, COL2.iron, 0, 8); B.pipe([cx + 0.5, hh - 0.05, cz - CELL / 2], [cx + 0.5, hh - 0.05, cz + CELL / 2], 0.05, COL2.rust, 0, 6); }
      else if (ew && !ns) { B.pipe([cx - CELL / 2, hh, cz - 0.6], [cx + CELL / 2, hh, cz - 0.6], 0.09, COL2.iron, 0, 8); B.pipe([cx - CELL / 2, hh - 0.05, cz + 0.5], [cx + CELL / 2, hh - 0.05, cz + 0.5], 0.05, COL2.rust, 0, 6); }
    }
  }
}

// ----- the assembly -----
async function buildWorld2(progress) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0.03, 0.025, 0.02, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 70; CAM.fov = 1.0;
  resetW9(); resetWP2();
  progress(0.05, 'FOLLOWING THE PIPES…'); await nextFrame();
  genLayout2(); collectPieces5(side2, opening2); planLights2();
  const T = {};
  progress(0.16, 'PAINTING THE TUNNELS…'); await nextFrame();
  for (const k of ['pwall', 'plate', 'deck']) T[k] = TEX2[k](SCN, 512);
  T.conc = TEX9.conc(SCN, 512); T.block = TEX9.block(SCN, 512); T.tile = TEX9.tile(SCN, 512);
  T.bconc = TEX5.bconc(SCN, 512); T.bfloor = TEX5.bfloor(SCN, 512);
  progress(0.34, 'HANGING THE BULBS…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  progress(0.48, 'BUILDING PRESSURE…'); await nextFrame();
  const E = (n, d, t) => envMat9(n, d, t);
  const mats = { pwall: E('pwall2', ['MAT_BCONC'], T.pwall), bconc: E('bconc2', ['MAT_BCONC'], T.bconc), block: E('block2', ['MAT_BLOCK'], T.block), tile: E('tile2', ['MAT_TILE'], T.tile),
    plate: E('plate2', ['MAT_BFLOOR'], T.plate), bfloor: E('bfloor2', ['MAT_BFLOOR'], T.bfloor), deck: E('deck2', ['MAT_BCEIL'], T.deck), conc: E('conc2', ['MAT_CONC'], T.conc), trim: E('trim2', ['MAT_CASE'], T.bconc) };
  buildGeometry2(SCN, mats); buildWater2(SCN);
  progress(0.62, 'BOLTING THE FLANGES…'); await nextFrame();
  buildProps2();
  progress(0.8, 'HANGING DOORS…'); await nextFrame();
  buildDoors2(); buildStory2(); buildItems2(G.diff); buildDust(); buildSteam2();
  WP2.finishProps();
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.92, 'LISTENING TO THE PIPES…'); await nextFrame();
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
