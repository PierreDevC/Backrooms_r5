// ---------- r5 asset library: CC0 photo-scanned PBR textures (ambientCG), models (Poly Haven) & characters (Quaternius) ----------
// Every asset is optional: if the pack is missing (or ?noassets is in the URL) the original procedural look is used.
const AST = { scn: null, tex: new Map(), off: /[?&]noassets/.test(location.search) };
function astOn() { return !AST.off && typeof ASSET_TEX !== 'undefined' && Object.keys(ASSET_TEX).length > 0; }
function astB64(key, s) { let v = ASSET_TEX[key] && ASSET_TEX[key][s]; while (v && v[0] === '@') { const [k2, s2] = v.slice(1).split('.'); v = ASSET_TEX[k2][s2]; } return v; }
function astScene() { if (AST.scn !== SCN) { AST.scn = SCN; AST.tex.clear(); } }
// s: 'a' albedo (sRGB), 'n' normal (DX / image-row convention, like heightToNormal), 'r' ORM (R occlusion, G roughness, B height)
function pbrTex(key, s) {
  astScene();
  const id = key + '.' + s; let t = AST.tex.get(id); if (t) return t;
  const b = astB64(key, s); if (!b) return null;
  t = new BABYLON.Texture('data:image/webp;base64,' + b, SCN, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  t.name = 'pbr_' + id; t.wrapU = t.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE; t.anisotropicFilteringLevel = 8;
  AST.tex.set(id, t); return t;
}
// Linear-ish (squared sRGB) mean colour of a scan; used to tint scans onto the hand-tuned palette of each level.
function pbrMean(key) { const d = ASSET_TEX[key]; return d ? d.m : [0.5, 0.5, 0.5]; }
function tintTo(key, rgb255, desat = 0) { const m = pbrMean(key), l = 0.3 * m[0] + 0.59 * m[1] + 0.11 * m[2]; return rgb255.map((c, i) => (c / 255) ** 2 / Math.max(desat ? l : m[i], 0.004)).concat([desat]); }
// Material name → how the scan is applied.
//  base: the scan replaces the procedural albedo/normal (s = [u, v] repeats per material UV unit)
//  det:  the procedural pattern stays; the scan adds fibre/paper/grain detail (albedo luminance + normal) at `s` repeats
//  k = [detail albedo strength, ao strength, roughness weight, detail normal strength]
const PBR_MAT = {
  // Level 0 · the lobby
  wallMat: { det: 'l0paper', s: [1, 1], k: [0.55, 0.8, 0.85, 0.9] },
  floorMat: { det: 'l0carpet', s: [1 / 1.7, 1 / 1.7], k: [0.6, 0.85, 0.9, 1] },   // keeps the procedural damp stains, adds the scanned pile
  ceilMat: { base: 'l0ceil', s: [1 / 3, 1 / 3], k: [0, 0.8, 0.8, 1], tint: () => tintTo('l0ceil', [206, 196, 154]) },
  // Level 9 · darkened suburbs
  asph: { base: 'asph', s: [2.4, 2.4], k: [0, 0.8, 0.8, 1], tint: () => tintTo('asph', [52, 52, 54]) },
  grass: { base: 'grass', s: [2.3, 2.3], k: [0, 0.7, 0.7, 1], tint: () => tintTo('grass', [70, 82, 40]) },
  conc: { det: 'conc', s: [2.5, 5], k: [0.6, 0.7, 0.8, 1] },
  siding: { base: 'siding', s: [1.2, 2.4], k: [0, 0.7, 0.7, 1], tint: () => [1.25, 1.25, 1.25, 1] },
  wallin: { det: 'paper9', s: [1, 1], k: [0.5, 0.6, 0.8, 0.8] },
  labwall: { det: 'labwall', s: [1.5, 3], k: [0.4, 0.5, 0.7, 0.8] },
  block: { det: 'block', s: [1.6, 1.6], k: [0.6, 0.7, 0.8, 0.9] },
  fence9: { base: 'planks', s: [1.7, 1.7], k: [0, 0.7, 0.7, 1], tint: () => tintTo('planks', [92, 66, 44]) },
  floor9: { base: 'wood9', s: [1.26, 1.26], k: [0, 0.8, 0.85, 1], tint: () => tintTo('wood9', [112, 80, 52]) },
  tile: { det: 'rubber', s: [1.6, 1.6], k: [0.25, 0.4, 0.6, 0.5] },
  plaster: { base: 'plaster', s: [1.9, 1.9], k: [0, 0.6, 0.7, 0.8], tint: () => tintTo('plaster', [200, 196, 186]) },
  ceil9: { base: 'l0ceil', s: [1 / 3, 1 / 3], k: [0, 0.8, 0.8, 1], tint: () => tintTo('l0ceil', [206, 200, 180]) },
  roof: { base: 'roof', s: [0.76, 0.76], k: [0, 0.7, 0.7, 1], tint: () => tintTo('roof', [58, 56, 60]) },
  // Level 5 · the hotel
  hwall5: { det: 'hpaper', s: [1, 1], k: [0.45, 0.6, 0.8, 0.8] },
  carpet5: { det: 'hcarpet', s: [1.4, 1.4], k: [0.55, 0.8, 0.85, 1.0] },
  check5: { base: 'check', s: [4 / 6, 4 / 6], k: [0, 0.7, 0.85, 1], tint: () => [1.25, 1.2, 1.15, 0] },
  deco5: { det: 'hceil', s: [2, 2], k: [0.25, 0.4, 0.4, 0.5] },
  bconc5: { base: 'bconc', s: [1.5, 1.5], k: [0, 0.8, 0.8, 1], tint: () => tintTo('bconc', [96, 90, 82]) },
  brick5: { det: 'block', s: [1.6, 1.6], k: [0.5, 0.6, 0.7, 0.8] },
  bfloor5: { base: 'bfloor', s: [1.2, 1.2], k: [0, 0.8, 0.8, 1], tint: () => tintTo('bfloor', [80, 76, 70]) },
  hceil5: { det: 'hceil', s: [1.5, 1.5], k: [0.35, 0.5, 0.6, 0.6] },
  bceil5: { det: 'hceil', s: [1.5, 1.5], k: [0.3, 0.5, 0.5, 0.6] },
  tile5: { det: 'rubber', s: [1.6, 1.6], k: [0.25, 0.4, 0.6, 0.5] },
  // Level 18 · nostalgic memories
  skyw18: { det: 'kwall', s: [1.5, 1.5], k: [0.2, 0.4, 0.6, 0.6] }, clsw18: { det: 'kwall', s: [1.5, 1.5], k: [0.2, 0.4, 0.6, 0.6] },
  yelw18: { det: 'kwall', s: [1.5, 1.5], k: [0.2, 0.4, 0.4, 0.6] }, mural18: { det: 'kwall', s: [3, 3], k: [0.15, 0.3, 0.5, 0.5] },
  teal18: { det: 'kwall', s: [1.5, 1.5], k: [0.2, 0.4, 0.6, 0.6] }, meadow18: { det: 'kwall', s: [3, 3], k: [0.15, 0.3, 0.5, 0.5] },
  bedw18: { det: 'kwall', s: [1.5, 1.5], k: [0.2, 0.4, 0.6, 0.6] }, kitw18: { det: 'kwall', s: [1.5, 1.5], k: [0.2, 0.4, 0.6, 0.6] },
  ktile18: { det: 'ktile', s: [1, 1], k: [0.25, 0.5, 0.5, 0.6] }, kcarpet18: { det: 'kcarpet', s: [1.5, 1.5], k: [0.4, 0.7, 0.85, 1] },
  turf18: { base: 'turf', s: [1.5, 1.5], k: [0, 0.6, 0.8, 1], tint: () => tintTo('turf', [90, 150, 60]) },
  gcarpet18: { det: 'gcarpet', s: [1.5, 1.5], k: [0.4, 0.7, 0.85, 1] },
  wood18: { base: 'wood9', s: [1.26, 1.26], k: [0, 0.8, 0.85, 1], tint: () => tintTo('wood9', [150, 112, 72]) },
  lino18: { det: 'rubber', s: [1.5, 1.5], k: [0.25, 0.4, 0.5, 0.5] },
  dceil18: { det: 'hceil', s: [1.5, 1.5], k: [0.3, 0.5, 0.5, 0.6] },
};
// augment a ShaderMaterial option block (defines / samplers / uniforms) for material `name`
function pbrOpts(name, defines, samplers, uniforms) {
  const P = astOn() && PBR_MAT[name]; if (!P) return null;
  const key = P.base || P.det; if (!ASSET_TEX[key]) return null;
  defines.push('PBR'); samplers.push('ormTex'); uniforms.push('texK', 'texK2', 'tintK');
  if (P.base) defines.push('PBRBASE'); else { defines.push('DETAIL'); samplers.push('detTex', 'detNTex'); }
  return P;
}
function pbrBind(m, P) {
  if (!P) return m;
  const key = P.base || P.det, k = P.k, s = P.s;
  if (P.base) { m.setTexture('albedoTex', pbrTex(key, 'a')); m.setTexture('normalTex', pbrTex(key, 'n')); }
  else { m.setTexture('detTex', pbrTex(key, 'a')); m.setTexture('detNTex', pbrTex(key, 'n')); }
  m.setTexture('ormTex', pbrTex(key, 'r'));
  // texK: x ORM/detail repeats, y detail albedo strength, z AO strength, w roughness weight; texK2: x detail normal, y/w base repeats (u, v), z detail mean luminance
  m.setVector4('texK', new BABYLON.Vector4(1, k[0], k[1], k[2]));
  m.setVector4('texK2', new BABYLON.Vector4(k[3], s[0], ASSET_TEX[key].l, s[1]));
  const t = P.tint ? P.tint() : [1, 1, 1, 0];
  m.setVector4('tintK', new BABYLON.Vector4(t[0], t[1], t[2], t[3]));
  m.__pbr = key; return m;
}
