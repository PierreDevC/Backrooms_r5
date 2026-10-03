// ---------- r10 · Level 7 world assembly: the sea, the sky, materials ----------
const WS7 = {};
function resetWS7() {
  Object.assign(WS7, { B: null, BOn: null, BFl: null, BRed: null, BGrn: null, BBuoy: null, propMat: null, pos: {}, lights: [], ladders: [], buoys: [], buoyMat: null, finishProps: null, lensFl: null, sky: null, glow: null, moon: null, ghosts: [], pocketsOn: false, regs: {} });
}
resetWS7();
const COL7 = { rust: [0.4, 0.22, 0.12], iron: [0.2, 0.21, 0.22], steel: [0.4, 0.42, 0.44], grey: [0.5, 0.5, 0.48], white: [0.8, 0.8, 0.76], yellow: [0.86, 0.66, 0.08], orange: [0.9, 0.4, 0.08], red: [0.62, 0.1, 0.06], green: [0.18, 0.4, 0.26], blue: [0.14, 0.28, 0.5], black: [0.04, 0.04, 0.045],
  wood: [0.38, 0.27, 0.17], wood2: [0.52, 0.4, 0.26], cream: [0.78, 0.74, 0.62], olive: [0.33, 0.36, 0.26], brass: [0.66, 0.52, 0.24], glass: [0.5, 0.7, 0.8], teal: [0.12, 0.45, 0.5], rock: [0.2, 0.22, 0.24], canvas: [0.72, 0.68, 0.55] };

// ----- the sea: Level 37's water, recoloured -----
function registerWater7() {
  const S = BABYLON.Effect.ShadersStore; if (S.water7FragmentShader) return;
  S.water7VertexShader = S.water37VertexShader;
  S.water7FragmentShader = S.water37FragmentShader
    .replace('vec3(0.03, 0.4, 0.26)', 'vec3(0.012, 0.06, 0.1)').replace('vec3(0.72, 0.9, 0.7)', 'vec3(0.22, 0.32, 0.42)').replace('vec3(0.7, 0.95, 0.7)', 'vec3(0.7, 0.85, 1.0)').replace('vec3(0.8, 1.0, 0.85)', 'vec3(0.8, 0.9, 1.0)')
    .replace('vec3(0.14, 0.6, 0.4)', 'vec3(0.03, 0.18, 0.3)').replace('fixtureAt(p, vec3(0.0)) + 0.18', 'fixtureAt(p, vec3(0.0)) + 0.3').replace('*(sp*0.5 + sp2*0.9)', '*(sp*0.08 + sp2*0.3)');
}
function waterMat7() {
  registerWater7(); const names = ['world', 'viewProjection', 'wP', ...COMMON_UNIFORMS];
  const m = new BABYLON.ShaderMaterial('water7', SCN, { vertex: 'water7', fragment: 'water7' }, { attributes: ['position', 'uv', 'color'], uniforms: names, samplers: ['lightTex'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex); m.setVector4('wP', new BABYLON.Vector4(1, 1.6, 0, 0)); m.backFaceCulling = false; m.alphaMode = BABYLON.Engine.ALPHA_COMBINE; m.disableDepthWrite = true;
  MATS.list.push(m); return m;
}
// ----- the sky: a star dome that follows the camera, a horizon glow that comes up at dawn -----
BABYLON.Effect.ShadersStore.sky7VertexShader = `precision highp float; attribute vec3 position; attribute vec2 uv; uniform mat4 world; uniform mat4 viewProjection; varying vec2 vUV; void main(){ vUV = uv; gl_Position = viewProjection*world*vec4(position,1.0); }`;
BABYLON.Effect.ShadersStore.sky7FragmentShader = `precision highp float; varying vec2 vUV; uniform sampler2D tex; uniform vec4 sP; void main(){ vec4 c = texture2D(tex, vUV); gl_FragColor = vec4(c.rgb*sP.rgb, c.a*sP.w); }`;
function buildSky7() {
  const dt = new BABYLON.DynamicTexture('sky7', { width: 1024, height: 512 }, SCN, false), c = dt.getContext(), W = 1024, H = 512;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02030a'); g.addColorStop(0.45, '#0a1426'); g.addColorStop(0.5, '#0c1a2c'); g.addColorStop(0.58, '#0a1220'); g.addColorStop(1, '#03060c');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  let s = 12345; const rnd_ = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 900; i++) { const x = rnd_() * W, y = rnd_() * H * 0.48, a = 0.25 + rnd_() * 0.75; c.fillStyle = `rgba(255,255,${220 + Math.floor(rnd_() * 35)},${a})`; c.fillRect(x, y, rnd_() < 0.1 ? 2 : 1, rnd_() < 0.1 ? 2 : 1); }
  const mx = W * 0.22, my = H * 0.3, mg = c.createRadialGradient(mx, my, 6, mx, my, 70); mg.addColorStop(0, 'rgba(255,255,245,1)'); mg.addColorStop(0.18, 'rgba(240,244,255,0.9)'); mg.addColorStop(0.19, 'rgba(180,200,235,0.28)'); mg.addColorStop(1, 'rgba(120,150,200,0)');
  c.fillStyle = mg; c.beginPath(); c.arc(mx, my, 70, 0, 6.3); c.fill();
  dt.update();
  const mk = (name, dtex, blend) => { const m = new BABYLON.ShaderMaterial(name, SCN, { vertex: 'sky7', fragment: 'sky7' }, { attributes: ['position', 'uv'], uniforms: ['world', 'viewProjection', 'sP'], samplers: ['tex'], needAlphaBlending: !!blend }); m.setTexture('tex', dtex); m.setVector4('sP', new BABYLON.Vector4(1, 1, 1, 1)); m.backFaceCulling = false; m.disableDepthWrite = true; if (blend) m.alphaMode = BABYLON.Engine.ALPHA_COMBINE; MATS.list.push(m); return m; };
  const m = mk('sky7M', dt, false), sk = BABYLON.MeshBuilder.CreateSphere('sky7', { diameter: 240, segments: 20 }, SCN); sk.material = m; sk.isPickable = false; sk._sortD = -1000; sk.alwaysSelectAsActiveMesh = true;
  const dg = new BABYLON.DynamicTexture('glow7', { width: 512, height: 256 }, SCN, false), gc = dg.getContext();
  const gg = gc.createLinearGradient(0, 0, 0, 256); gg.addColorStop(0, 'rgba(255,170,90,0)'); gg.addColorStop(0.42, 'rgba(255,170,90,0.0)'); gg.addColorStop(0.5, 'rgba(255,190,110,1)'); gg.addColorStop(0.6, 'rgba(255,120,60,0.55)'); gg.addColorStop(1, 'rgba(255,100,50,0)');
  gc.fillStyle = gg; gc.fillRect(0, 0, 512, 256); dg.update(); dg.hasAlpha = true;
  const gm = mk('glow7M', dg, true), gl = BABYLON.MeshBuilder.CreateSphere('glow7', { diameter: 236, segments: 20 }, SCN); gl.material = gm; gl.isPickable = false; gl._sortD = -990; gl.alwaysSelectAsActiveMesh = true;
  WS7.sky = sk; WS7.skyMat = m; WS7.glow = gl; WS7.glowMat = gm;
}

async function buildWorld7(progress) {
  registerShaders();
  SCN = new BABYLON.Scene(ENG);
  SCN.clearColor = new BABYLON.Color4(0.02, 0.03, 0.06, 1); SCN.skipPointerMovePicking = true; SCN.blockMaterialDirtyMechanism = false;
  CAM = new BABYLON.FreeCamera('cam', V3(10, 1.6, 10), SCN); CAM.inputs.clear(); CAM.minZ = 0.05; CAM.maxZ = 260; CAM.fov = 1.0;
  resetW9(); resetW37(); resetWS7();
  progress(0.05, 'FILLING THE SEA…'); await nextFrame();
  Object.assign(MAT37_S, { band: [1 / 2.4, 1 / 6], hull: [1 / 2.4, 1 / 2.4], plate: [1 / 1.2, 1 / 1.2], sand: [1 / 2.4, 1 / 2.4], plank: [1 / 1.2, 1 / 1.2], rock: [1 / 2.4, 1 / 2.4] });
  for (const k of ['plate', 'sand', 'plank', 'rock']) FLOORM37.add(k);
  genLayout7(); collectPieces5(side7, opening37); fixPieces7(); planLights7();
  const T = {};
  progress(0.16, 'PAINTING THE HULLS…'); await nextFrame();
  T.plate = TEX2.plate(SCN, 512); T.hull = TEX2.pwall(SCN, 512); T.sand = TEX7.sand(SCN, 512); T.plank = TEX7.plank(SCN, 512); T.band = TEX7.band(SCN, 512);
  T.conc = TEX9.conc(SCN, 512); T.block = TEX9.block(SCN, 512); T.wood = TEX9.wood(SCN, 512); T.bconc = TEX5.bconc(SCN, 512); T.lino = TEX37.hlino(SCN, 512); T.dceil = TEX18.dceil(SCN, 512);
  progress(0.36, 'LIGHTING THE LAMPS…'); await nextFrame();
  buildLightmap(SCN); buildCollision();
  progress(0.5, 'LAYING THE DECKS…'); await nextFrame();
  const E = (n, d, t) => envMat9(n, d, t);
  const mats = { hull: E('hull7', ['MAT_BCONC'], T.hull), plate: E('plate7', ['MAT_BFLOOR'], T.plate), sand: E('sand7', ['MAT_CONC'], T.sand), plank: E('plank7', ['MAT_WOOD'], T.plank), conc: E('conc7', ['MAT_CONC'], T.conc), block: E('block7', ['MAT_BLOCK'], T.block),
    wood: E('wood7', ['MAT_WOOD'], T.wood), bconc: E('bconc7', ['MAT_BCONC'], T.bconc), rock: E('rock7', ['MAT_BCONC'], T.bconc), lino: E('lino7', ['MAT_KFLOOR', 'KSHEEN'], T.lino), kceil: E('kceil7', ['MAT_KCEIL'], T.dceil),
    band: E('band7', ['MAT_CONC'], T.band), plaster: E('plaster7', ['MAT_PLASTER'], T.conc), trim: E('trim7', ['MAT_CASE'], T.bconc) };
  buildGeometry37(SCN, mats); capRoofs7(SCN, mats.bconc);
  { const sea = LV.basins[BAS7.SEA]; for (const b of [BAS7.HAB, BAS7.WPOCK]) for (const c of LV.basins[b].cells) sea.cells.push(c); }   // the sea's surface runs over the habitat and the wreck's pocket
  WS7.waterMat = waterMat7(); buildWater37(SCN, WS7.waterMat); buildSky7();
  { const g = new Geo(true), R = 900, cx = N * CELL / 2; g.face(cx - R, 0, cx + R, [1, 0, 0], [0, 0, -1], 2 * R, 2 * R, [0, 1, 0], 1, true, [1, 1, 1, 1]); const m = g.mesh('farsea7', SCN); m.material = WS7.waterMat; m.position.y = -0.03; m.isPickable = false; m.alphaIndex = 4; m._sortD = 110; WS7.farSea = m; }
  progress(0.64, 'MOORING THE BUOYS…'); await nextFrame();
  buildProps7();
  progress(0.8, 'HANGING DOORS…'); await nextFrame();
  Object.assign(DOORC37, { rig: [0.42, 0.44, 0.4], mach: [0.62, 0.5, 0.1], ship: [0.34, 0.3, 0.26], tower: [0.3, 0.3, 0.32], cottage: [0.46, 0.3, 0.2], shed: [0.36, 0.28, 0.2] });
  buildDoors37(); buildStory7(); buildItems7(G.diff); buildDust();
  WS7.finishProps();
  SCN.setRenderingOrder(0, (a, b) => (a.getMesh()._sortD ?? 400) - (b.getMesh()._sortD ?? 400));
  progress(0.92, 'LISTENING TO THE SEA…'); await nextFrame();
}
