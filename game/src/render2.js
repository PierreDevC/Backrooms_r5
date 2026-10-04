// ---------- r11 · Level 2 renderer: materials and shaders for the ray-traced bake ----------
// Static geometry carries its light in three vertex attributes written by bake2.js:
//   lS = steady light (rgb, direct + one bounce), a = ambient occlusion;  lF = light from flickering lamps (rgb);  lD = dominant light direction (xyz), w = how directional.
// The fragment shader re-lights the scanned normal maps against lD, adds a GGX highlight from it (wet floors and metal catch the lamps),
// adds the player's torch and the other dynamic lights, then lamp-lit haze along the view ray (in-scattering from the eight nearest lamps).
const R2 = { mats: {}, haze: null, vL: new Float32Array(32), vC: new Float32Array(32), list: [] };
const L2_GLSL_V = `precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec4 tangent; attribute vec2 uv; attribute vec4 color; attribute vec4 lS; attribute vec4 lF; attribute vec4 lD;
uniform mat4 world; uniform mat4 viewProjection;
varying vec3 vPos; varying vec3 vN; varying vec3 vT; varying vec2 vUV; varying vec4 vC; varying vec4 vS; varying vec4 vF; varying vec4 vD;
void main(){ vec4 wp = world*vec4(position, 1.0); vPos = wp.xyz; vN = normalize(mat3(world)*normal); vT = normalize(mat3(world)*tangent.xyz); vUV = uv; vC = color; vS = lS; vF = lF; vD = lD; gl_Position = viewProjection*wp; }`;
const L2_GLSL_F = `precision highp float;
varying vec3 vPos; varying vec3 vN; varying vec3 vT; varying vec2 vUV; varying vec4 vC; varying vec4 vS; varying vec4 vF; varying vec4 vD;
uniform vec4 mP;     // x uv scale, y normal strength, z roughness multiplier, w metalness
uniform vec4 mP2;    // x wet response, y spec multiplier, z albedo gain, w ao strength
uniform vec4 bandC;  // painted dado: rgb colour (alpha 0 = none), band top in w
uniform vec4 l2G;    // x flicker, y haze density, z time, w steam (surge)
uniform vec4 vL[8]; uniform vec4 vC8[8];
#ifdef PROP
uniform sampler2D t0A; uniform sampler2D t0N; uniform sampler2D t0R;
uniform sampler2D t1A; uniform sampler2D t1N; uniform sampler2D t1R;
uniform sampler2D t2A; uniform sampler2D t2N; uniform sampler2D t2R;
#else
uniform sampler2D albT; uniform sampler2D nrmT; uniform sampler2D ormT;
#endif
${GLSL_COMMON}
float D_GGX(float ndh, float r){ float a = r*r, a2 = a*a, d = ndh*ndh*(a2 - 1.0) + 1.0; return a2/(3.14159*d*d); }
vec3 haze(vec3 p){
  vec3 ro = camPos, rd = p - ro; float D = length(rd); rd /= D; vec3 acc = vec3(0.0);
  for(int i = 0; i < 8; i++){
    vec4 L = vL[i]; if(L.w <= 0.0) continue;
    vec3 rel = L.xyz - ro; float tc = dot(rel, rd); float h = max(length(rel - rd*tc), L.w);
    float I = (atan((D - tc)/h) - atan(-tc/h))/h;
    acc += vC8[i].rgb*I;
  }
  return acc*l2G.y;
}
#ifdef PROP
vec3 triW(vec3 n){ vec3 w = pow(abs(n), vec3(4.0)); return w/(w.x + w.y + w.z); }
#endif
void main(){
  vec3 p = vPos, gn = normalize(vN), V = normalize(camPos - p);
  vec3 T = normalize(vT - gn*dot(vT, gn)); vec3 Bt = cross(gn, T);
  vec3 alb, nm, orm; float uvs = mP.x;
#ifdef PROP
  // triplanar on world position, three scanned sets chosen by the material id in vertex alpha
  float id = floor(vC.a*16.0); vec3 w = triW(gn); vec2 ux = p.zy*uvs, uy = p.xz*uvs, uz = p.xy*uvs;
  vec3 a0, n0, r0;
  if(id < 0.5 || id > 10.5 && id < 11.5){        // painted steel (machinery, cabinets) / hazard stripes reuse the paint scan
    a0 = texture2D(t0A, ux).rgb*w.x + texture2D(t0A, uy).rgb*w.y + texture2D(t0A, uz).rgb*w.z;
    n0 = texture2D(t0N, ux).xyz*w.x + texture2D(t0N, uy).xyz*w.y + texture2D(t0N, uz).xyz*w.z;
    r0 = texture2D(t0R, ux).rgb*w.x + texture2D(t0R, uy).rgb*w.y + texture2D(t0R, uz).rgb*w.z;
  } else if(id < 1.5 || id > 5.5 && id < 6.5){   // rusty / weathered metal, concrete plinths
    a0 = texture2D(t1A, ux).rgb*w.x + texture2D(t1A, uy).rgb*w.y + texture2D(t1A, uz).rgb*w.z;
    n0 = texture2D(t1N, ux).xyz*w.x + texture2D(t1N, uy).xyz*w.y + texture2D(t1N, uz).xyz*w.z;
    r0 = texture2D(t1R, ux).rgb*w.x + texture2D(t1R, uy).rgb*w.y + texture2D(t1R, uz).rgb*w.z;
  } else {                                        // bare / galvanised steel, and the flat-coloured materials
    a0 = texture2D(t2A, ux).rgb*w.x + texture2D(t2A, uy).rgb*w.y + texture2D(t2A, uz).rgb*w.z;
    n0 = texture2D(t2N, ux).xyz*w.x + texture2D(t2N, uy).xyz*w.y + texture2D(t2N, uz).xyz*w.z;
    r0 = texture2D(t2R, ux).rgb*w.x + texture2D(t2R, uy).rgb*w.y + texture2D(t2R, uz).rgb*w.z;
  }
  a0 *= a0; float lum0 = dot(a0, vec3(0.3, 0.59, 0.11));
  vec3 tint = vC.rgb*vC.rgb;
  float metal = r0.b, rough = r0.g;
  if(id < 0.5){ alb = mix(tint*clamp(lum0*3.0, 0.55, 1.35), a0*1.4, smoothstep(0.35, 0.6, metal)*0.85); }          // the scan's chips show bare rusty steel under the paint colour
  else if(id < 1.5){ alb = a0*mix(vec3(1.0), tint*2.2, 0.45); }
  else if(id < 2.5){ alb = mix(a0, tint, 0.35)*1.1; metal = 0.85; rough = clamp(rough*0.8, 0.25, 0.8); }
  else if(id < 3.5){ alb = tint*clamp(lum0*2.4, 0.75, 1.15); metal = 0.55; rough = 0.42; }                              // aluminium-jacketed insulation
  else if(id < 4.5){ alb = tint*0.9; metal = 0.0; rough = 0.75; }                                                    // rubber, black plastic
  else if(id < 5.5){ alb = tint*clamp(lum0*2.6, 0.6, 1.3); metal = 0.0; rough = 0.8; }                               // wood
  else if(id < 6.5){ alb = tint*clamp(lum0*2.2, 0.6, 1.3); metal = 0.0; rough = 0.9; }                               // concrete
  else if(id < 7.5){ alb = tint; metal = 1.0; rough = 0.35; }                                                        // brass, copper
  else if(id < 8.5){ alb = tint*0.3; metal = 0.0; rough = 0.08; }                                                    // glass
  else if(id < 9.5){ alb = tint; metal = 0.0; rough = 0.45; }                                                        // painted plastic, enamel
  else if(id < 10.5){ alb = tint*clamp(lum0*2.0, 0.85, 1.1); metal = 0.0; rough = 0.95; }                           // paper, cloth
  else if(id < 11.5){ float st = step(0.5, fract((p.x + p.y + p.z)*2.2)); alb = mix(vec3(0.62, 0.42, 0.02), vec3(0.012), st)*clamp(lum0*3.0, 0.5, 1.2); metal = 0.0; rough = 0.6; }
  else { alb = tint*clamp(lum0*2.2, 0.7, 1.2); metal = 0.0; rough = 0.9; }
  nm = normalize(n0*2.0 - 1.0); orm = vec3(r0.r, rough, metal);
  // triplanar normal: approximate by perturbing the geometric normal in the projected planes
  vec3 nT = vec3(nm.x, -nm.y, 0.0)*mP.y*0.6;
  vec3 n = normalize(gn + (w.x*(vec3(0.0, nT.y, nT.x)) + w.y*(vec3(nT.x, 0.0, nT.y)) + w.z*(vec3(nT.x, nT.y, 0.0))));
  float ao = mix(1.0, r0.r, 0.6);
#else
  vec2 uv = vUV*uvs;
  alb = texture2D(albT, uv).rgb; alb *= alb; alb *= vC.rgb*mP2.z;
  vec3 tn = texture2D(nrmT, uv).xyz*2.0 - 1.0; tn.y = -tn.y; tn.xy *= mP.y;
  orm = texture2D(ormT, uv).rgb;
  float rough = orm.g*mP.z, metal = mP.w*orm.b;
  // painted dado on the lower wall: chipped where the scan's ao/height says the edge is worn
  if(bandC.a > 0.0){
    float edge = bandC.w + (fbm(vec3(p.x*3.0 + p.z*3.0, 0.0, 0.0)) - 0.5)*0.03;
    float paint = (1.0 - step(edge, p.y))*smoothstep(0.32, 0.5, orm.r + fbm(p*2.7)*0.25);
    alb = mix(alb, bandC.rgb*bandC.rgb*(0.75 + 0.5*dot(alb, vec3(0.33))*4.0), paint);
    rough = mix(rough, 0.45, paint);
    if(abs(p.y - bandC.w) < 0.025){ alb = mix(alb, vec3(0.6, 0.45, 0.06)*0.6, 0.85); }
  }
  vec3 n = normalize(T*tn.x + Bt*tn.y + gn*max(tn.z, 0.2));
  float ao = mix(1.0, orm.r, mP2.w);
#endif
  // wetness (world: vertex alpha; props: none): darker, glossier, puddles in the low spots
  float wet = 0.0;
#ifndef PROP
  wet = vC.a*mP2.x;
  if(wet > 0.0){ float pud = smoothstep(0.5, 0.66, fbm(p*0.35) + (1.0 - orm.b)*0.1); wet = clamp(wet*(0.35 + pud*0.65), 0.0, 1.0);
    alb *= mix(1.0, 0.45, wet); rough = mix(rough, 0.06, wet*(0.4 + 0.6*pud)); n = normalize(mix(n, gn, wet*pud)); }
#endif
  rough = clamp(rough, 0.05, 1.0);
  // baked light, re-lit against the normal map along the dominant direction
  vec3 E = vS.rgb + vF.rgb*l2G.x;
  vec3 Ld = vD.xyz; float dk = vD.w; float ll = length(Ld); Ld = ll > 0.001 ? Ld/ll : gn;
  float g0 = max(dot(gn, Ld), 0.18), g1 = max(dot(n, Ld), 0.0);
  vec3 Edir = E*mix(1.0, g1/g0, dk*0.9);
  vec3 F0 = mix(vec3(0.04), alb, metal);
  vec3 H = normalize(Ld + V); float ndh = max(dot(n, H), 0.0), ndv = max(dot(n, V), 0.05), vdh = max(dot(V, H), 0.0);
  vec3 F = F0 + (1.0 - F0)*pow(1.0 - vdh, 5.0);
  float k = (rough + 1.0)*(rough + 1.0)*0.125, vis = 1.0/((ndv*(1.0 - k) + k)*(g1*(1.0 - k) + k));
  vec3 spec = E*dk*F*min(D_GGX(ndh, rough)*vis*0.25*g1, 9.0)*mP2.y*mix(1.0, 1.8, wet);
  vec3 amb = envA.rgb*(1.0 + misc.y);
  float cs = contactSh(p);
  vec3 diff = (Edir*cs + amb)*ao;
  // dynamic lights (the torch, the surge strobe, the lift lamp)
  vec3 dD = vec3(0.0), dS = vec3(0.0); gRough = rough;
  dynLights(p, n, gn, V, 2.0/(rough*rough*rough*rough + 0.001) - 2.0, 1.0 - 0.5*rough, dD, dS);
  vec3 col = alb*(1.0 - metal*0.9)*(diff + dD) + spec*cs + dS*F*mix(1.0, 3.0, wet);
  col = fogIt(col, p);
  col += haze(p);
#ifdef GLASS
  gl_FragColor = vec4(col, clamp(0.16 + 0.7*(F.r + spec.r*0.2), 0.0, 0.85));
#else
  gl_FragColor = vec4(col, 1.0);
#endif
}`;
BABYLON.Effect.ShadersStore.l2wVertexShader = L2_GLSL_V; BABYLON.Effect.ShadersStore.l2wFragmentShader = L2_GLSL_F;
BABYLON.Effect.ShadersStore.l2pVertexShader = L2_GLSL_V; BABYLON.Effect.ShadersStore.l2pFragmentShader = '#define PROP\n' + L2_GLSL_F;
BABYLON.Effect.ShadersStore.l2gVertexShader = L2_GLSL_V; BABYLON.Effect.ShadersStore.l2gFragmentShader = '#define PROP\n#define GLASS\n' + L2_GLSL_F;
const L2U = ['world', 'viewProjection', ...COMMON_UNIFORMS, 'mP', 'mP2', 'bandC', 'l2G', 'vL', 'vC8'];
const L2A = ['position', 'normal', 'tangent', 'uv', 'color', 'lS', 'lF', 'lD'];
// world materials: scan key, uv repeats per metre, normal strength, roughness multiplier, metalness, wet response, spec, albedo gain, ao strength, painted band
const MAT2W = {
  tun: { k: 'l2conc', s: 1 / 2.4, nS: 1.0, r: 1.0, m: 0, wet: 0.9, sp: 0.6, g: 1.25, ao: 0.8, band: [0.3, 0.36, 0.33, 1.15] },
  hall: { k: 'l2conc', s: 1 / 3.0, nS: 1.0, r: 1.0, m: 0, wet: 0.8, sp: 0.5, g: 1.15, ao: 0.8, band: [0.42, 0.24, 0.14, 1.6] },
  room: { k: 'l2conc2', s: 1 / 2.0, nS: 0.8, r: 1.0, m: 0, wet: 0.6, sp: 0.5, g: 1.0, ao: 0.6, band: [0.25, 0.32, 0.36, 1.2] },
  office: { k: 'l2conc2', s: 1 / 2.0, nS: 0.6, r: 1.0, m: 0, wet: 0, sp: 0.5, g: 1.05, ao: 0.6, band: [0.2, 0.34, 0.27, 1.05] },
  crack: { k: 'l2crack', s: 1 / 2.2, nS: 1.0, r: 1.0, m: 0, wet: 0.9, sp: 0.6, g: 1.15, ao: 0.8 },
  brick: { k: 'l2brick', s: 1 / 2.0, nS: 1.2, r: 1.0, m: 0, wet: 1.0, sp: 0.8, g: 1.1, ao: 0.9 },
  flr: { k: 'l2flr', s: 1 / 2.5, nS: 1.0, r: 1.0, m: 0, wet: 1.0, sp: 0.8, g: 1.05, ao: 0.8 },
  plate: { k: 'l2plate', s: 1 / 1.2, nS: 1.0, r: 1.0, m: 1, wet: 0.7, sp: 1.0, g: 1.0, ao: 0.8 },
  walk: { k: 'l2walk', s: 1 / 1.0, nS: 1.0, r: 1.0, m: 1, wet: 0.4, sp: 1.0, g: 1.0, ao: 0.9 },
  tile: { k: 'l2tile', s: 1 / 1.2, nS: 1.0, r: 0.9, m: 0, wet: 0.3, sp: 1.0, g: 1.0, ao: 0.6 },
  ceil: { k: 'l2conc', s: 1 / 2.6, nS: 0.8, r: 1.0, m: 0, wet: 0, sp: 0.3, g: 0.8, ao: 0.8 },
  corr: { k: 'l2corr', s: 1 / 1.6, nS: 1.0, r: 1.0, m: 1, wet: 0, sp: 0.8, g: 0.55, ao: 0.8 },
  haz: { k: 'l2haz', s: 1 / 0.8, nS: 0.6, r: 1.0, m: 0.5, wet: 0.3, sp: 0.6, g: 1.0, ao: 0.6 },
};
function l2Mat(key) {
  if (R2.mats[key]) return R2.mats[key];
  const D = MAT2W[key], m = new BABYLON.ShaderMaterial('l2w_' + key, SCN, { vertex: 'l2w', fragment: 'l2w' }, { attributes: L2A, uniforms: L2U, samplers: ['lightTex', 'albT', 'nrmT', 'ormT'] });
  m.setTexture('lightTex', LV.lightTex); m.setTexture('albT', pbrTex(D.k, 'a')); m.setTexture('nrmT', pbrTex(D.k, 'n')); m.setTexture('ormT', pbrTex(D.k, 'r'));
  m.setVector4('mP', new BABYLON.Vector4(D.s, D.nS, D.r, D.m)); m.setVector4('mP2', new BABYLON.Vector4(D.wet, D.sp, D.g, D.ao));
  const b = D.band; m.setVector4('bandC', b ? new BABYLON.Vector4(b[0], b[1], b[2], b[3]) : new BABYLON.Vector4(0, 0, 0, 0)); if (!b) m.setVector4('bandC', new BABYLON.Vector4(0, 0, 0, -1));
  R2.list.push(m); MATS.list.push(m); R2.mats[key] = m; return m;
}
function l2PropMat() {
  if (R2.mats.prop) return R2.mats.prop;
  const m = new BABYLON.ShaderMaterial('l2p', SCN, { vertex: 'l2p', fragment: 'l2p' }, { attributes: L2A, uniforms: L2U, samplers: ['lightTex', 't0A', 't0N', 't0R', 't1A', 't1N', 't1R', 't2A', 't2N', 't2R'] });
  m.setTexture('lightTex', LV.lightTex);
  for (const [s, k] of [['t0', 'l2paint'], ['t1', 'l2rustm'], ['t2', 'l2steel']]) { m.setTexture(s + 'A', pbrTex(k, 'a')); m.setTexture(s + 'N', pbrTex(k, 'n')); m.setTexture(s + 'R', pbrTex(k, 'r')); }
  m.setVector4('mP', new BABYLON.Vector4(0.9, 1.0, 1.0, 0)); m.setVector4('mP2', new BABYLON.Vector4(0, 0.9, 1.0, 0.6)); m.setVector4('bandC', new BABYLON.Vector4(0, 0, 0, -1));
  R2.list.push(m); MATS.list.push(m); R2.mats.prop = m; return m;
}
function l2GlassMat() {
  if (R2.mats.glass) return R2.mats.glass;
  const m = new BABYLON.ShaderMaterial('l2g', SCN, { vertex: 'l2g', fragment: 'l2g' }, { attributes: L2A, uniforms: L2U, samplers: ['lightTex', 't0A', 't0N', 't0R', 't1A', 't1N', 't1R', 't2A', 't2N', 't2R'], needAlphaBlending: true });
  m.setTexture('lightTex', LV.lightTex);
  for (const [s, k] of [['t0', 'l2paint'], ['t1', 'l2rustm'], ['t2', 'l2steel']]) { m.setTexture(s + 'A', pbrTex(k, 'a')); m.setTexture(s + 'N', pbrTex(k, 'n')); m.setTexture(s + 'R', pbrTex(k, 'r')); }
  m.setVector4('mP', new BABYLON.Vector4(0.9, 1.0, 1.0, 0)); m.setVector4('mP2', new BABYLON.Vector4(0, 1.2, 1.0, 0)); m.setVector4('bandC', new BABYLON.Vector4(0, 0, 0, -1));
  m.alphaMode = BABYLON.Engine.ALPHA_COMBINE; m.backFaceCulling = false; m.disableDepthWrite = true;
  R2.list.push(m); MATS.list.push(m); R2.mats.glass = m; return m;
}
function r2Reset() { R2.mats = {}; R2.list = []; R2.lights = []; }
// per frame: flicker, haze density, and the eight lamps nearest the camera for in-scattering
function r2Frame() {
  if (!R2.list.length) return;
  const cp = CAM.position, Ls = R2.lights || [], sk = GP2.surge ? GP2.surge.k : 0;
  if ((R2.sortT = (R2.sortT || 0) - 1) <= 0) { R2.sortT = 6; R2.near = Ls.map(l => [(l.p[0] - cp.x) ** 2 + (l.p[1] - cp.y) ** 2 + (l.p[2] - cp.z) ** 2, l]).filter(a => a[0] < 900).sort((a, b) => a[0] - b[0]).slice(0, 8).map(a => a[1]); }
  const vL = R2.vL, vC = R2.vC; vL.fill(0); vC.fill(0);
  (R2.near || []).forEach((l, i) => { const f = l.flick ? FX.flicker : 1, k = l.hz * f; vL[i * 4] = l.p[0]; vL[i * 4 + 1] = l.p[1]; vL[i * 4 + 2] = l.p[2]; vL[i * 4 + 3] = l.hr || 0.25; vC[i * 4] = l.c[0] * k; vC[i * 4 + 1] = l.c[1] * k; vC[i * 4 + 2] = l.c[2] * k; });
  const g = R2.g || (R2.g = new BABYLON.Vector4(0, 0, 0, 0)); g.set(FX.flicker, 0.0045 * (1 + sk * 9) * (S.qual >= 1 ? 1 : 0.7), FX.t, sk);
  for (const m of R2.list) { m.setVector4('l2G', g); m.setArray4('vL', vL); m.setArray4('vC8', vC); }
}
