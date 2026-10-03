// ---------- r8 · Level 37 world assembly: materials, water, caustics, signage, the hub's props ----------
const W37 = {};
function resetW37() {
  Object.assign(W37, { B: null, BOn: null, BFl: null, propMat: null, waterMat: null, caustMat: null, signs: [], used: new Map(), bob: [], finishProps: null, lensFl: null, glass: [], stand: null, caust: [] });
}
const COL37 = { white: [0.92, 0.94, 0.94], tile: [0.86, 0.95, 0.97], steel: [0.62, 0.64, 0.66], chrome: [0.78, 0.8, 0.82], wood: [0.5, 0.34, 0.2], wood2: [0.66, 0.5, 0.32], teal: [0.2, 0.6, 0.66], red: [0.78, 0.16, 0.12], yellow: [0.95, 0.78, 0.15],
  blue: [0.15, 0.4, 0.8], black: [0.05, 0.05, 0.06], rubber: [0.08, 0.08, 0.09], cream: [0.9, 0.86, 0.74], green: [0.22, 0.52, 0.34], orange: [0.92, 0.5, 0.14], pink: [0.92, 0.56, 0.7], brass: [0.7, 0.55, 0.26], rust: [0.42, 0.24, 0.14] };

// ----- the water: a translucent animated surface, seen from above and from below -----
BABYLON.Effect.ShadersStore.water37VertexShader = `precision highp float; attribute vec3 position; attribute vec2 uv; attribute vec4 color; uniform mat4 world; uniform mat4 viewProjection; varying vec3 vPos; varying vec2 vUV; varying vec4 vC;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vUV = uv; vC = color; gl_Position = viewProjection*wp; }`;
BABYLON.Effect.ShadersStore.water37FragmentShader = `precision highp float; varying vec3 vPos; varying vec2 vUV; varying vec4 vC; uniform vec4 wP;
${GLSL_COMMON}
void main(){
  vec3 p = vPos; float t = lvl.w; vec2 q = p.xz;
  vec2 g = vec2(cos(q.x*1.3 + t*0.9)*1.3, cos(q.y*1.7 - t*0.7)*1.7) + vec2(1.0)*cos((q.x+q.y)*2.1 - t*1.3)*2.1 + vec2(4.3, 1.1)*cos(q.x*4.3 + q.y*1.1 + t*1.9)*0.5 + vec2(2.0, -3.1)*cos(q.x*2.0 - q.y*3.1 - t*1.4)*0.4;
  vec3 n = normalize(vec3(-g.x*0.014*wP.y, 1.0, -g.y*0.014*wP.y));
  vec3 V = normalize(camPos - p); bool above = camPos.y > p.y;
  if(!above) n = -n;
  float fres = pow(1.0 - clamp(abs(dot(n, V)), 0.0, 1.0), 3.0);
  float L = clamp(fixtureAt(p, vec3(0.0)) + 0.18, 0.0, 1.6);
  vec3 deep = vec3(0.03, 0.4, 0.26) * (0.5 + L*0.8), sky = vec3(0.72, 0.9, 0.7) * (0.4 + L*0.7);
  vec3 col = mix(deep, sky, fres*0.75 + 0.07);
  float sp = pow(max(0.0, sin(q.x*7.0 + t*2.1)*sin(q.y*6.3 - t*1.7)), 6.0)*L;
  col += vec3(0.7, 0.95, 0.7)*sp*0.45;
  vec3 diff = vec3(0.0), spec = vec3(0.0);
  dynLights(p, n, vec3(0.0, 1.0, 0.0), V, 90.0, 1.0, diff, spec);
  col += spec*1.3 + diff*vec3(0.03, 0.1, 0.12);
  float alpha = above ? mix(0.5, 0.93, fres) : 0.9;
  if(!above) col = mix(col, vec3(0.14, 0.6, 0.4)*(0.45 + L*0.7), 0.55);
  gl_FragColor = vec4(fogIt(col, p), alpha*wP.x);
}`;
BABYLON.Effect.ShadersStore.caust37VertexShader = BABYLON.Effect.ShadersStore.water37VertexShader;
BABYLON.Effect.ShadersStore.caust37FragmentShader = `precision highp float; varying vec3 vPos; varying vec2 vUV; varying vec4 vC; uniform vec4 wP;
${GLSL_COMMON}
float caus(vec2 q, float t){ float a = sin(q.x*2.3 + t*0.8 + sin(q.y*1.7 + t*0.5)*1.4), b = sin(q.y*2.1 - t*0.7 + sin(q.x*1.9 - t*0.6)*1.3); float v = 1.0 - abs(a*b); return pow(clamp(v, 0.0, 1.0), 7.0); }
void main(){
  float d = wP.z - vC.r;                                // water depth over this floor
  if(d < 0.12) discard;
  vec2 q = vPos.xz*1.15; float t = lvl.w;
  float c = caus(q, t)*0.7 + caus(q*1.7 + 3.3, t*1.3)*0.5;
  float L = clamp(fixtureAt(vPos, vec3(0.0)) + 0.1, 0.0, 1.4), fade = smoothstep(0.12, 0.6, d)*(1.0 - smoothstep(3.5, 7.5, d));
  vec3 col = vec3(0.6, 0.95, 0.65)*c*L*fade*0.55;
  gl_FragColor = vec4(fogIt(col, vPos), 1.0);
}`;
BABYLON.Effect.ShadersStore.grout37VertexShader = BABYLON.Effect.ShadersStore.water37VertexShader;
BABYLON.Effect.ShadersStore.grout37FragmentShader = `precision highp float; varying vec3 vPos; varying vec2 vUV; varying vec4 vC; uniform vec4 wP;
${GLSL_COMMON}
void main(){
  float d = wP.z - vC.r; if(d < 0.1) discard;
  float t = lvl.w, k = clamp(d, 0.0, 2.0); vec2 q = vPos.xz*11.7;
  vec2 w = vec2(sin(q.y*0.55 + t*0.8 + sin(q.x*0.37)*1.6), sin(q.x*0.5 - t*0.7 + sin(q.y*0.33)*1.6))*(0.12 + 0.2*k);
  vec2 f = abs(fract(q + w + 0.5) - 0.5); float line = smoothstep(0.1, 0.0, min(f.x, f.y));
  float L = clamp(fixtureAt(vPos, vec3(0.0)) + 0.12, 0.0, 1.2);
  gl_FragColor = vec4(fogIt(vec3(0.02, 0.07, 0.04), vPos), line*0.6*clamp(d*2.0, 0.0, 1.0)*(0.5 + L*0.5));
}`;
function waterMat37() {
  const names = ['world', 'viewProjection', 'wP', ...COMMON_UNIFORMS];
  const m = new BABYLON.ShaderMaterial('water37', SCN, { vertex: 'water37', fragment: 'water37' }, { attributes: ['position', 'uv', 'color'], uniforms: names, samplers: ['lightTex'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex); m.setVector4('wP', new BABYLON.Vector4(1, 1, 0, 0)); m.backFaceCulling = false; m.alphaMode = BABYLON.Engine.ALPHA_COMBINE; m.disableDepthWrite = true;
  MATS.list.push(m); return m;
}
function caustMat37(basin) {
  const names = ['world', 'viewProjection', 'wP', ...COMMON_UNIFORMS];
  const m = new BABYLON.ShaderMaterial('caust37_' + basin, SCN, { vertex: 'caust37', fragment: 'caust37' }, { attributes: ['position', 'uv', 'color'], uniforms: names, samplers: ['lightTex'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex); m.setVector4('wP', new BABYLON.Vector4(1, 1, 0, 0)); m.backFaceCulling = false; m.alphaMode = BABYLON.Engine.ALPHA_ADD; m.disableDepthWrite = true;
  MATS.list.push(m); return m;
}
function groutMat37(basin) {
  const names = ['world', 'viewProjection', 'wP', ...COMMON_UNIFORMS];
  const m = new BABYLON.ShaderMaterial('grout37_' + basin, SCN, { vertex: 'grout37', fragment: 'grout37' }, { attributes: ['position', 'uv', 'color'], uniforms: names, samplers: ['lightTex'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex); m.setVector4('wP', new BABYLON.Vector4(1, 1, 0, 0)); m.backFaceCulling = false; m.alphaMode = BABYLON.Engine.ALPHA_COMBINE; m.disableDepthWrite = true;
  MATS.list.push(m); return m;
}
function buildCaustics37(scene) {
  W37.caust = [];
  for (const B of LV.basins) {
    if (!B.cells.length) continue;
    const g = new Geo(true);
    for (const c of B.cells) { const x0 = (c % N) * CELL, z0 = ((c / N) | 0) * CELL, fh = LV.fh[c]; if (fh > 1) continue; g.face(x0, fh + 0.012, z0 + CELL, [1, 0, 0], [0, 0, -1], CELL, CELL, [0, 1, 0], 1, true, [fh, 0, 0, 1]); }
    if (!g.p.length) continue;
    const m = g.mesh('caust37_' + B.name, scene), mat = caustMat37(B.name); m.material = mat; m.alphaIndex = 3; m._sortD = 90; m.isPickable = false; m.__noPortal = true;
    const m2 = g.mesh('grout37_' + B.name, scene), mat2 = groutMat37(B.name); m2.material = mat2; m2.alphaIndex = 2; m2._sortD = 91; m2.isPickable = false; m2.__noPortal = true; B.caust = { mesh: m, mat, mesh2: m2, mat2 };
  }
}

// ----- signage: painted pool signs, one small texture each -----
function sign37(text, root, pos, w, h, o = {}) {
  const px = 512, py = Math.max(64, Math.round(512 * h / w)), S = dynTexPlane('sign37', w, h, px, py, root, pos, o.emis ?? 0.5), c = S.ctx;
  c.fillStyle = o.bg || '#1a5a6e'; c.fillRect(0, 0, px, py);
  c.strokeStyle = o.line || '#e8f4f6'; c.lineWidth = 6; c.strokeRect(8, 8, px - 16, py - 16);
  c.fillStyle = o.fg || '#f2fafb'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const lines = String(text).split('\n'), fs = Math.round(Math.min(py / (lines.length + 0.9), px / Math.max(...lines.map(l => l.length)) * 1.45));
  c.font = `bold ${fs}px "Arial Narrow", Arial, sans-serif`; lines.forEach((l, i) => c.fillText(l, px / 2, py / 2 + (i - (lines.length - 1) / 2) * fs * 1.12));
  S.dt.update(); W37.signs.push(S); return S;
}
function pr37(x, z, ry = 0, y) { const r = propRoot(x, z, ry); r.position.y = y ?? floorY37(x, z); r.computeWorldMatrix(true); return r; }
function wallAt37(x, y, d, along = 0, off = 0.005) { const [px, pz, ry] = wallPt(x, y, d, off, along), r = propRoot(px, pz, ry); r.position.y = LV.fh[cIdx(x, y)]; r.computeWorldMatrix(true); return r; }

// ----- small furniture used all over the pools -----
const F37 = {
  bench(B, r, o = {}) { const L = o.len || 1.6; B.add(r, 'Box', { width: L, height: 0.06, depth: 0.42 }, COL37.wood2, 0, [0, 0.45, 0.3]); B.add(r, 'Box', { width: L, height: 0.04, depth: 0.05 }, COL37.wood, 0, [0, 0.72, 0.08]);
    for (const s of [-1, 1]) { B.add(r, 'Box', { width: 0.05, height: 0.45, depth: 0.4 }, COL37.steel, 0, [s * (L / 2 - 0.1), 0.22, 0.3]); B.add(r, 'Box', { width: 0.04, height: 0.3, depth: 0.04 }, COL37.steel, 0, [s * (L / 2 - 0.1), 0.58, 0.08]); } return 0.5; },
  locker(B, r, o = {}) { const n = o.n || 3; for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 0.42, col = o.col || [0.42, 0.62, 0.66]; B.add(r, 'Box', { width: 0.4, height: 1.8, depth: 0.45 }, col, 0, [x, 0.9, 0.23]);
      B.add(r, 'Box', { width: 0.3, height: 0.02, depth: 0.012 }, [0.1, 0.12, 0.14], 0, [x, 1.5, 0.46]); B.add(r, 'Box', { width: 0.3, height: 0.02, depth: 0.012 }, [0.1, 0.12, 0.14], 0, [x, 1.44, 0.46]);
      B.add(r, 'Box', { width: 0.03, height: 0.12, depth: 0.02 }, COL37.chrome, 0, [x + 0.12, 1.1, 0.47]); B.add(r, 'Box', { width: 0.06, height: 0.04, depth: 0.005 }, [0.9, 0.9, 0.85], 0, [x - 0.08, 1.65, 0.457]); } return 0.5; },
  ladder(B, r) { for (const s of [-1, 1]) { B.add(r, 'Cylinder', { diameter: 0.045, height: 1.9, tessellation: 8 }, COL37.chrome, 0, [s * 0.24, 0.55, 0.12]); B.add(r, 'Torus', { diameter: 0.22, thickness: 0.04, tessellation: 12 }, COL37.chrome, 0, [s * 0.24, 1.5, 0.02], [0, 0, Math.PI / 2]); B.add(r, 'Cylinder', { diameter: 0.045, height: 0.16, tessellation: 8 }, COL37.chrome, 0, [s * 0.24, 1.5, -0.08], [Math.PI / 2, 0, 0]); }
    for (let i = 0; i < 4; i++) B.add(r, 'Cylinder', { diameter: 0.035, height: 0.48, tessellation: 6 }, COL37.chrome, 0, [0, 0.2 - i * 0.25 + 0.1, 0.12], [0, 0, Math.PI / 2]); return 0.3; },
  guardChair(B, r) { for (const [x, z] of [[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]]) B.add(r, 'Box', { width: 0.07, height: 2.5, depth: 0.07 }, COL37.white, 0, [x, 1.25, z]);
    B.add(r, 'Box', { width: 1.1, height: 0.07, depth: 0.9 }, COL37.white, 0, [0, 1.95, 0]); B.add(r, 'Box', { width: 1.0, height: 0.55, depth: 0.06 }, COL37.white, 0, [0, 2.3, -0.42], [-0.12, 0, 0]);
    B.add(r, 'Box', { width: 1.0, height: 0.05, depth: 0.04 }, COL37.red, 0, [0, 2.2, -0.45]); B.add(r, 'Box', { width: 0.9, height: 0.05, depth: 0.5 }, COL37.white, 0, [0, 1.2, 0.58], [-0.1, 0, 0]);
    for (let i = 0; i < 6; i++) B.add(r, 'Box', { width: 0.88, height: 0.03, depth: 0.1 }, COL37.white, 0, [0, 0.3 + i * 0.3, 0.4 + (i * 0.025)]);
    B.add(r, 'Cylinder', { diameter: 0.035, height: 1.4, tessellation: 6 }, COL37.red, 0, [0.5, 2.9, -0.4]); B.add(r, 'Box', { width: 1.4, height: 0.03, depth: 1.1 }, COL37.red, 0, [0.5, 3.6, -0.3]); return 0; },
  ring(B, r, col) { B.add(r, 'Torus', { diameter: 0.7, thickness: 0.18, tessellation: 18 }, col || COL37.red, 0, [0, 0.09, 0]); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; B.add(r, 'Box', { width: 0.2, height: 0.19, depth: 0.19 }, COL37.white, 0, [Math.sin(a) * 0.35, 0.09, Math.cos(a) * 0.35], [0, a, 0]); } },
  palm(B, r) { B.add(r, 'Cylinder', { diameterTop: 0.5, diameterBottom: 0.36, height: 0.5, tessellation: 12 }, [0.5, 0.3, 0.2], 0, [0, 0.25, 0]); B.add(r, 'Cylinder', { diameterTop: 0.03, diameterBottom: 0.07, height: 1.3, tessellation: 6 }, [0.3, 0.22, 0.12], 0, [0, 1.1, 0]);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; B.add(r, 'Box', { width: 0.1, height: 0.012, depth: 0.8 }, [0.14, 0.3, 0.12].map(v => v * rnd(0.8, 1.2)), 0, [Math.sin(a) * 0.35, 1.6 + rnd(-0.1, 0.12), Math.cos(a) * 0.35], [0.5, a, 0]); } return 0.55; },
  lounger(B, r, col) { const c = col || COL37.cream; B.add(r, 'Box', { width: 0.62, height: 0.08, depth: 1.2 }, c, 0, [0, 0.34, 0.65]); B.add(r, 'Box', { width: 0.62, height: 0.08, depth: 0.8 }, c, 0, [0, 0.62, -0.18], [-0.9, 0, 0]);
    for (const x of [-0.28, 0.28]) for (const z of [0.2, 1.1]) B.add(r, 'Box', { width: 0.04, height: 0.34, depth: 0.04 }, COL37.chrome, 0, [x, 0.17, z]); return 1.3; },
  vending(B, r, col) { const c = col || [0.15, 0.4, 0.62]; B.add(r, 'Box', { width: 0.95, height: 1.85, depth: 0.8 }, c, 0, [0, 0.93, 0.4]); B.add(r, 'Box', { width: 0.7, height: 1.1, depth: 0.02 }, [0.06, 0.1, 0.14], 0.12, [-0.08, 1.2, 0.81]);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) W37.BOn.add(r, 'Cylinder', { diameter: 0.07, height: 0.2, tessellation: 8 }, [0.5, 0.75, 0.9], 0.3, [-0.28 + i * 0.13, 0.85 + j * 0.25, 0.79]); B.add(r, 'Box', { width: 0.16, height: 0.5, depth: 0.03 }, COL37.chrome, 0, [0.35, 1.1, 0.8]);
    B.add(r, 'Box', { width: 0.7, height: 0.2, depth: 0.04 }, [0.05, 0.05, 0.06], 0, [0, 0.2, 0.8]); return 0.9; },
  shower(B, r) { B.add(r, 'Box', { width: 0.95, height: 2.2, depth: 0.04 }, [0.7, 0.85, 0.88], 0, [0, 1.1, 0.02]); B.add(r, 'Cylinder', { diameter: 0.025, height: 0.5, tessellation: 6 }, COL37.chrome, 0, [0, 2.0, 0.2], [Math.PI / 2, 0, 0]);
    B.add(r, 'Cylinder', { diameter: 0.2, height: 0.03, tessellation: 12 }, COL37.chrome, 0, [0, 1.95, 0.45]); B.add(r, 'Box', { width: 0.02, height: 2.2, depth: 0.9 }, [0.78, 0.9, 0.92], 0, [0.46, 1.1, 0.46]); return 0.9; },
  towelRack(B, r) { B.add(r, 'Box', { width: 1.2, height: 0.04, depth: 0.1 }, COL37.chrome, 0, [0, 1.45, 0.08]); for (let i = 0; i < 4; i++) B.add(r, 'Box', { width: 0.22, height: 0.5, depth: 0.04 }, pick([COL37.white, COL37.teal, COL37.cream, COL37.blue]), 0, [-0.45 + i * 0.3, 1.2, 0.11]); return 0.2; },
};

// ----- the assembly -----
async function buildWorld37(progress) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0.55, 0.78, 0.8, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 90; CAM.fov = 1.0;
  resetW9(); resetW37();
  progress(0.05, 'FILLING THE POOL…'); await nextFrame();
  genLayout37(); collectPieces5(side37, opening37); planLights37();
  const T = {};
  progress(0.14, 'LAYING THE TILE…'); await nextFrame();
  for (const k of ['ptile', 'lane', 'wetc']) T[k] = TEX37[k](SCN, 512);
  T.wood = TEX9.wood(SCN, 512); T.conc = TEX9.conc(SCN, 512); T.block = TEX9.block(SCN, 512);
  progress(0.26, 'HANGING THE WALLPAPER…'); await nextFrame();
  for (const k of ['hwall', 'carpet', 'hceil', 'bconc', 'brick']) T[k] = TEX5[k](SCN, 512);
  for (const k of ['lino', 'dceil']) T[k] = TEX18[k](SCN, 512);
  progress(0.4, 'LIGHTING THE ROOMS…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  progress(0.52, 'WARMING THE WATER…'); await nextFrame();
  const E = (n, d, t) => envMat9(n, d, t);
  const mats = { ptile: E('ptile37', ['MAT_TILE'], T.ptile), ptw: E('ptw37', ['MAT_KWALL'], T.ptile), lane: E('lane37', ['MAT_TILE'], T.lane), wetc: E('wetc37', ['MAT_BCONC'], T.wetc), wood: E('wood37', ['MAT_WOOD'], T.wood), hwall: E('hwall37', ['MAT_HWALL'], T.hwall),
    carpet: E('carpet37', ['MAT_CARPET'], T.carpet), hceil: E('hceil37', ['MAT_HCEIL'], T.hceil), plaster: E('plaster37', ['MAT_PLASTER'], T.conc), bconc: E('bconc37', ['MAT_BCONC'], T.bconc), block: E('block37', ['MAT_BLOCK'], T.block),
    brick: E('brick37', ['MAT_BLOCK'], T.brick), lino: E('lino37', ['MAT_KFLOOR', 'KSHEEN'], T.lino), kceil: E('kceil37', ['MAT_KCEIL'], T.dceil), conc: E('conc37', ['MAT_CONC'], T.conc), trim: E('trim37', ['MAT_CASE'], T.wetc) };
  buildGeometry37(SCN, mats);
  W37.waterMat = waterMat37(); buildWater37(SCN, W37.waterMat); buildCaustics37(SCN);
  progress(0.64, 'SETTING OUT THE CHAIRS…'); await nextFrame();
  buildProps37();
  progress(0.78, 'HANGING DOORS…'); await nextFrame();
  buildGhosts37(); buildDoors37(); buildStory37(); buildItems37(G.diff); buildDust();
  W37.finishProps();
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.9, 'LISTENING TO THE FILTERS…'); await nextFrame();
}

function buildDoors37() {
  W9.doorAnim = new Set();
  for (const e of LV.ek.values()) {
    if (e.kind !== 'door') continue;
    const horiz = e.d === 1 || e.d === 3, [mx, mz] = edgeMid(e.x, e.y, e.d), nx = e.x + DX[e.d], ny = e.y + DY[e.d], fh = LV.fh[cIdx(e.x, e.y)];
    const fr = e.from || [e.x, e.y], to = fr[0] === e.x && fr[1] === e.y ? [nx, ny] : [e.x, e.y];
    const s = horiz ? (to[1] === Math.max(e.y, ny) ? 1 : -1) : (to[0] === Math.max(e.x, nx) ? 1 : -1);
    const hinge = tnode(null, horiz ? mx - DOORW / 2 + 0.03 : mx, fh, horiz ? mz : mz - DOORW / 2 + 0.03);
    const mesh = doorLeaf(DOORC37[e.dk] || DOORC37.room, e.dk === 'plant' || e.dk === 'staff'); mesh.parent = hinge;
    const c0 = horiz ? 0 : -Math.PI / 2, c1 = c0 + (horiz ? -s : s) * 1.62;
    const bx = horiz ? [mx - DOORW / 2, mz - WT / 2, mx + DOORW / 2, mz + WT / 2] : [mx - WT / 2, mz - DOORW / 2, mx + WT / 2, mz + DOORW / 2];
    const dr = { e, key: eKey(e.x, e.y, e.d), horiz, s, hinge, mesh, c0, c1, bx, mx, mz, house: -1, dk: e.dk, metal: e.dk === 'plant', open: 0, target: 0, latched: false, locked: !!e.locked, solid: addSolid(bx[0], bx[1], bx[2], bx[3], 'door'), shake: 0, cull: 32, bangs: 0 };
    markDyn(bx[0], bx[1], bx[2], bx[3], 1); hinge.rotation.y = c0;
    W9.doors.push(dr); W9.doorAt.set(dr.key, dr);
    if (e.plaque) plaque37(sideOf5(e), e.plaque);
    W.interact.push({ x: mx, z: mz, y: 1.1, r: 1.75, door: dr, label: () => doorLabel37(dr), ok: () => true, act: () => useDoor37(dr) });
  }
}
const DOORC37 = { room: [0.5, 0.34, 0.2], cabana: [0.3, 0.55, 0.6], plant: [0.4, 0.44, 0.44], booth: [0.55, 0.42, 0.28], hotel: [0.42, 0.19, 0.09], hosp: [0.8, 0.86, 0.84], staff: [0.4, 0.42, 0.4], ww: [0.2, 0.46, 0.66] };
function plaque37(s, text) { const r = atWall5(s, 0, 0); r.position.y = LV.fh[cIdx(s.x, s.y)]; r.computeWorldMatrix(true); sign37(text, twin(r), [DOORW / 2 + 0.34, 1.62, 0.03], 0.46, 0.14, { bg: '#e8e2d0', fg: '#2a2a2a', line: '#6a6a60', emis: 0.25 }); }

// glass-and-tile panels in the wave pool: you can see them and swim straight through them (no collision, no lightmap shadow)
function buildGhosts37() {
  if (!LV.ghosts || !LV.ghosts.length) return;
  const m = new BABYLON.StandardMaterial('ghost37', SCN); m.disableLighting = true; m.emissiveColor = new BABYLON.Color3(0.35, 0.62, 0.6); m.alpha = 0.28; m.backFaceCulling = false; m.specularColor = BABYLON.Color3.Black();
  W37.ghosts = [];
  for (const [x, y] of LV.ghosts) {
    const b = BABYLON.MeshBuilder.CreateBox('ghost37', { width: CELL, height: 5.0, depth: 0.05 }, SCN); b.material = m; b.position.set(cellCenter(x), floorY37(cellCenter(x), cellCenter(y)) + 2.5, y * CELL); b.isPickable = false; b.alphaIndex = 5; W37.ghosts.push(b);
  }
}
