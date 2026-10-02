// ---------- world constants ----------
let N = 34, LEVEL = N * 3.6, LMR = 512, LMS = LEVEL / LMR; // grid size, world size, light-map resolution / meters per texel (per level)
const CELL = 3.6, CEIL = 2.85, WT = 0.16, DOORW = 1.2, DOORH = 2.15;
let LVL = 0; // current level: 0 = the lobby, 9 = darkened suburbs, 5 = the hotel, 18 = nostalgic memories
function setDims(n, lmr) { N = n; LEVEL = N * CELL; LMR = lmr; LMS = LEVEL / LMR; NBK = Math.ceil(LEVEL / BK); }

const GLSL_COMMON = `
uniform sampler2D lightTex;
uniform vec4 lvl;
uniform vec3 camPos;
uniform vec4 sPos[6];
uniform vec4 sDir[6];
uniform vec4 sCol[6];
uniform vec4 sExt[6];
uniform vec4 fogP;
uniform vec4 misc;
uniform vec4 shd[8];
uniform vec4 envA;
uniform vec4 envS;
float hash13(vec3 p){ p = fract(p*0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p){ vec3 i = floor(p); vec3 f = fract(p); f = f*f*(3.0-2.0*f);
  float a = hash13(i), b = hash13(i+vec3(1.,0.,0.)), c = hash13(i+vec3(0.,1.,0.)), d = hash13(i+vec3(1.,1.,0.));
  float e = hash13(i+vec3(0.,0.,1.)), g = hash13(i+vec3(1.,0.,1.)), h = hash13(i+vec3(0.,1.,1.)), k = hash13(i+vec3(1.,1.,1.));
  return mix(mix(mix(a,b,f.x), mix(c,d,f.x), f.y), mix(mix(e,g,f.x), mix(h,k,f.x), f.y), f.z); }
float fbm(vec3 p){ float s = 0.0, a = 0.5; for(int i=0;i<4;i++){ s += a*vnoise(p); p = p*2.03 + vec3(1.7,9.2,3.1); a *= 0.5; } return s / 0.9375; }
vec4 lm(vec2 xz){ return texture2D(lightTex, xz / lvl.x); }
float fixtureAt(vec3 p, vec3 gn){ vec4 t = lm(p.xz + gn.xz*0.32); return (t.r + t.b*lvl.z) * 2.0 * lvl.y; }
float shadow2D(vec3 p, vec3 lp){ float s = 1.0; for(int i=1;i<9;i++){ vec2 q = mix(p.xz, lp.xz, float(i)/9.0); s *= smoothstep(0.012, 0.05, lm(q).g); } return s; }
float contactSh(vec3 p){ float s = 1.0; for(int i=0;i<8;i++){ vec4 c = shd[i]; if(c.z <= 0.0) continue; float d = length(p.xz - c.xy); s *= 1.0 - c.w*(1.0 - smoothstep(0.0, c.z, d))*(1.0 - smoothstep(0.0, 1.4, p.y)); } return s; }
float gRough = -1.0;   // r5: per-pixel roughness from a photo-scanned ORM map (-1 = legacy Blinn-Phong lobe)
float roughOf(float shin){ return pow(2.0/(shin + 2.0), 0.25); }
float specLobe(vec3 n, vec3 H, vec3 V, vec3 L, float shin){
  float ndh = max(dot(n, H), 0.0);
  if(gRough < 0.0) return pow(ndh, shin);
  float r = clamp(gRough, 0.18, 1.0), a = r*r, a2 = a*a;
  float dd = ndh*ndh*(a2 - 1.0) + 1.0;
  float D = a2/(3.14159*dd*dd);
  float k = (r + 1.0)*(r + 1.0)*0.125;
  float ndv = max(dot(n, V), 0.04), ndl = max(dot(n, L), 0.0);
  float vis = 1.0/((ndv*(1.0 - k) + k)*(ndl*(1.0 - k) + k));
  float F = 1.0 + 5.0*pow(1.0 - max(dot(V, H), 0.0), 5.0);
  return min(D*vis*F*0.25, 24.0);
}
void dynLights(vec3 p, vec3 n, vec3 gn, vec3 V, float shin, float specK, inout vec3 diff, inout vec3 spec){
  for(int i=0;i<6;i++){
    vec4 sp = sPos[i];
    if(sp.w <= 0.0) continue;
    vec3 Lv = sp.xyz - p; float d = length(Lv); vec3 L = Lv / max(d, 0.001);
    float range = sExt[i].x;
    if(d > range) continue;
    if(dot(gn, L) <= -0.05) continue;
    vec4 sd = sDir[i];
    float cone = 1.0;
    if(sd.w > -1.5){
      float ca = dot(-L, sd.xyz);
      if(ca < sd.w) continue;
      float k = (ca - sd.w) / (1.0 - sd.w);
      cone = smoothstep(0.0, 0.55, k)*0.32 + smoothstep(0.3, 0.95, k)*0.85 + 0.14*exp(-pow((k - 0.5)*8.0, 2.0)) + 0.03*sin(k*41.0)*k;
    }
    float att = sp.w / (1.0 + d*d*sExt[i].z);
    att *= 1.0 - smoothstep(range*0.55, range, d);
    float sh = 1.0;
    if(sExt[i].y > 0.5) sh = shadow2D(p + gn*0.22, sp.xyz);
    vec3 c = sCol[i].rgb * att * cone * sh;
    float ndl = max(dot(n, L), 0.0);
    diff += c * ndl;
    vec3 H = normalize(L + V);
    spec += c * specLobe(n, H, V, L, shin) * specK * ndl;
  }
}
float skyAt(vec3 p, vec3 gn){ return lm(p.xz + gn.xz*0.3).a; }
vec3 ambAt(float sky, vec3 n){ return envA.rgb + envS.rgb*sky*(0.35 + 0.9*max(dot(n, vec3(-0.42, 0.78, 0.46)), 0.0)); }
vec3 fixC(float sky){ return mix(mix(vec3(1.0, 0.88, 0.62), vec3(0.84, 0.94, 1.0), envS.a), vec3(1.0, 0.63, 0.32), sky*envA.a); }
vec3 fogIt(vec3 col, vec3 p){ float d = length(p - camPos); float f = 1.0 - exp(-pow(fogP.a*d, 2.0)); return mix(col, fogP.rgb, f); }
`;
const COMMON_UNIFORMS = ['lvl', 'camPos', 'sPos', 'sDir', 'sCol', 'sExt', 'fogP', 'misc', 'shd', 'envA', 'envS'];

const SH = {};
SH.envV = `precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec2 uv; attribute vec4 tangent;
uniform mat4 world; uniform mat4 viewProjection;
varying vec3 vPos; varying vec3 vN; varying vec3 vT; varying vec2 vUV;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vN = normalize(mat3(world)*normal); vT = normalize(mat3(world)*tangent.xyz); vUV = uv; gl_Position = viewProjection*wp; }`;

SH.envF = `precision highp float;
#define CEIL ${CEIL.toFixed(3)}
varying vec3 vPos; varying vec3 vN; varying vec3 vT; varying vec2 vUV;
#ifdef VCOL
varying vec4 vC;
#endif
uniform sampler2D albedoTex; uniform sampler2D normalTex;
#ifdef PBR
uniform sampler2D ormTex; uniform vec4 texK; uniform vec4 texK2; uniform vec4 tintK;
#endif
#ifdef DETAIL
uniform sampler2D detTex; uniform sampler2D detNTex;
#endif
#ifdef EYES
uniform vec4 eyeP;
#endif
${GLSL_COMMON}
void main(){
  vec3 p = vPos;
  vec3 gn = normalize(vN);
  vec3 T = normalize(vT - gn*dot(vT, gn));
  vec3 B = cross(gn, T);
  vec3 V = normalize(camPos - p);
#ifdef TWOSIDE
  if(dot(gn, V) < 0.0){ gn = -gn; B = cross(gn, T); }
#endif
  vec2 uv0 = vUV;
#ifdef ROTUV
  uv0 = vUV.yx;
#endif
#ifdef PBR
  vec2 uvR = uv0*texK2.yw;                      // scan repeats per material UV unit (physical size of the scan)
#ifdef PBRBASE
  vec3 alb = texture2D(albedoTex, uvR).rgb; alb *= alb;
  vec3 nm = texture2D(normalTex, uvR).xyz*2.0 - 1.0;
#else
  vec3 alb = texture2D(albedoTex, uv0).rgb; alb *= alb;
  vec3 nm = texture2D(normalTex, uv0).xyz*2.0 - 1.0;
#endif
  vec3 orm = texture2D(ormTex, uvR).rgb;
  alb = mix(alb, vec3(dot(alb, vec3(0.3, 0.59, 0.11))), tintK.w) * tintK.rgb;
#ifdef DETAIL
  vec3 dA = texture2D(detTex, uvR).rgb; float dl = dot(dA*dA, vec3(0.3, 0.59, 0.11));
  alb *= mix(1.0, clamp(dl/max(texK2.z, 0.02), 0.4, 1.6), texK.y);
  vec3 dN = texture2D(detNTex, uvR).xyz*2.0 - 1.0;
  nm = normalize(vec3(nm.xy + dN.xy*texK2.x, nm.z*dN.z));
#endif
#else
  vec3 alb = texture2D(albedoTex, uv0).rgb; alb *= alb;
  vec3 nm = texture2D(normalTex, uv0).xyz*2.0 - 1.0;
#endif
  float ao = 1.0, lk = 1.0, specK = 0.03, shin = 12.0, nStr = 1.0;
  float big = fbm(p*0.31);
  vec3 emis5 = vec3(0.0);
#ifdef MAT_WALL
  float h = p.y;
  vec3 wq = vec3(p.x + p.z, h, p.z - p.x);
  float lowSt = smoothstep(0.5, 0.75, fbm(vec3(wq.x, h*2.2, wq.z)*0.8)) * (1.0 - smoothstep(0.1, 1.0, h));
  float tide = smoothstep(0.035, 0.0, abs(h - 0.32 - 0.3*fbm(vec3(wq.x, 0.0, wq.z)*0.7))) * smoothstep(0.45, 0.6, big);
  float streak = smoothstep(0.58, 0.86, vnoise(vec3(wq.x*4.2, h*0.28 + 3.0, wq.z*4.2))) * smoothstep(0.8, 2.7, h) * smoothstep(0.42, 0.66, big);
  alb *= mix(vec3(1.0), vec3(0.9, 0.85, 0.7), smoothstep(0.3, 0.8, big));
  alb = mix(alb, alb*vec3(0.5, 0.4, 0.22), lowSt*0.85);
  alb = mix(alb, alb*vec3(0.58, 0.48, 0.3), tide*0.75);
  alb = mix(alb, alb*vec3(0.66, 0.56, 0.36), streak*0.7);
  ao = mix(0.42, 1.0, smoothstep(0.0, 0.5, h)) * mix(0.6, 1.0, smoothstep(0.0, 0.42, CEIL - h));
  lk = mix(1.0, 0.8, smoothstep(1.5, CEIL, h));
  specK = 0.05 + lowSt*0.25; shin = 16.0;
#endif
#ifdef MAT_FLOOR
  float dmp = smoothstep(0.54, 0.72, fbm(vec3(p.x, 0.0, p.z)*0.2 + 5.0));
  float wear = fbm(vec3(p.x, 2.0, p.z)*0.9);
  alb *= mix(1.0, 0.5, dmp);
  alb *= 0.88 + 0.24*wear;
  float wd = lm(p.xz).g;
  ao = mix(0.36, 1.0, smoothstep(0.05, 0.62, wd));
  specK = mix(0.02, 1.5, dmp); shin = mix(5.0, 70.0, dmp); nStr = mix(1.0, 0.35, dmp);
#endif
#ifdef MAT_CEIL
  vec2 tid = floor(p.xz / 0.6);
  float th = hash13(vec3(tid, 3.7));
  float st = smoothstep(0.52, 0.8, fbm(vec3(p.xz*1.1, th*10.0)));
  alb *= mix(vec3(1.0), vec3(0.78, 0.68, 0.48), st*step(0.68, th));
  alb *= 0.92 + 0.1*hash13(vec3(tid, 1.3));
  if(th > 0.988) alb *= 0.05;
  lk = 0.5;
  float wd2 = lm(p.xz).g;
  ao = mix(0.5, 1.0, smoothstep(0.05, 0.5, wd2));
  specK = 0.02;
#endif
#ifdef MAT_TRIM
  alb = vec3(0.56, 0.5, 0.34) * (0.86 + 0.14*vnoise(p*40.0)) * (0.85 + 0.15*big);
  ao = mix(0.5, 1.0, smoothstep(0.0, 0.1, p.y));
  specK = 0.28; shin = 40.0; nm = vec3(0.0, 0.0, 1.0);
#endif
#ifdef MAT_ASPH
  float wet = smoothstep(0.56, 0.7, fbm(vec3(p.x*0.16, 1.0, p.z*0.16)));
  float lx = abs(mod(p.x - 7.2 + 19.8, 39.6) - 19.8), lz = abs(mod(p.z - 7.2 + 19.8, 39.6) - 19.8);
  float ln = (1.0 - smoothstep(0.05, 0.075, lx))*step(7.5, mod(p.z - 3.6, 39.6))*step(0.5, fract(p.z/3.2))
           + (1.0 - smoothstep(0.05, 0.075, lz))*step(7.5, mod(p.x - 3.6, 39.6))*step(0.5, fract(p.x/3.2));
  ln *= smoothstep(0.25, 0.6, vnoise(p*1.7));
  alb = mix(alb, vec3(0.4, 0.32, 0.09), ln*0.8);
  float crk = 1.0 - smoothstep(0.0, 0.025, abs(fbm(vec3(p.x, 0.0, p.z)*0.55) - 0.5));
  alb *= (1.0 - crk*0.45) * mix(1.0, 0.45, wet);
  specK = mix(0.05, 1.8, wet); shin = mix(10.0, 90.0, wet); nStr = mix(1.0, 0.2, wet);
  ao = mix(0.65, 1.0, smoothstep(0.05, 0.9, lm(p.xz).g));
#endif
#ifdef MAT_GRASS
  float patchy = fbm(vec3(p.x*0.23, 3.0, p.z*0.23));
  alb *= mix(vec3(1.0), vec3(1.25, 1.1, 0.6), smoothstep(0.5, 0.8, patchy)) * (0.75 + 0.35*vnoise(p*2.1));
  ao = mix(0.5, 1.0, smoothstep(0.05, 0.8, lm(p.xz).g)); specK = 0.04; shin = 8.0;
#endif
#ifdef MAT_CONC
  float stn = smoothstep(0.55, 0.75, fbm(vec3(p.x*0.5, 7.0, p.z*0.5)));
  alb *= (0.78 + 0.3*big) * (1.0 - stn*0.35);
  ao = mix(0.55, 1.0, smoothstep(0.03, 0.6, lm(p.xz).g)); specK = 0.05 + stn*0.3; shin = 14.0;
#endif
#ifdef MAT_SIDING
  float gr = smoothstep(0.9, 0.0, p.y) * (0.5 + 0.5*fbm(p*1.3));
  float mil = smoothstep(0.6, 0.85, vnoise(vec3((p.x + p.z)*3.0, p.y*0.35, (p.z - p.x)*3.0))) * smoothstep(0.4, 0.66, big);
  alb *= 1.0 - gr*0.45 - mil*0.3;
  ao = mix(0.55, 1.0, smoothstep(0.0, 0.35, p.y)) * mix(0.62, 1.0, smoothstep(0.0, 0.4, abs(CEIL - p.y))); specK = 0.07; shin = 18.0;
#endif
#ifdef MAT_WALLIN
  alb *= mix(vec3(1.0), vec3(0.85, 0.8, 0.68), smoothstep(0.35, 0.8, big));
  float wst = smoothstep(0.6, 0.85, vnoise(vec3((p.x + p.z)*3.5, p.y*0.3, (p.z - p.x)*3.5))) * smoothstep(0.45, 0.7, big);
  alb *= 1.0 - wst*0.3;
  ao = mix(0.45, 1.0, smoothstep(0.0, 0.5, p.y)) * mix(0.6, 1.0, smoothstep(0.0, 0.42, CEIL - p.y)); specK = 0.04; shin = 14.0;
#endif
#if defined(MAT_LABWALL) || defined(MAT_BLOCK)
  float grm = smoothstep(0.6, 0.0, p.y) * (0.4 + 0.6*fbm(p*1.7));
  alb *= (1.0 - grm*0.4) * (0.85 + 0.25*big);
  ao = mix(0.5, 1.0, smoothstep(0.0, 0.45, p.y)) * mix(0.65, 1.0, smoothstep(0.0, 0.4, abs(CEIL - p.y))); specK = 0.06; shin = 16.0;
#endif
#if defined(MAT_WOOD) || defined(MAT_TILE)
  float dmp9 = smoothstep(0.6, 0.78, fbm(vec3(p.x, 0.0, p.z)*0.25 + 9.0));
  alb *= (0.85 + 0.25*fbm(vec3(p.x, 5.0, p.z)*0.8)) * mix(1.0, 0.7, dmp9);
  ao = mix(0.4, 1.0, smoothstep(0.05, 0.6, lm(p.xz).g)); specK = 0.25 + dmp9*0.8; shin = 36.0;
#endif
#ifdef MAT_PLASTER
  float wsp = smoothstep(0.62, 0.8, fbm(vec3(p.x*0.5, 2.0, p.z*0.5)));
  alb *= (0.9 + 0.12*fbm(p*0.9)) * mix(vec3(1.0), vec3(0.75, 0.66, 0.5), wsp);
  lk = 0.55; ao = mix(0.5, 1.0, smoothstep(0.05, 0.5, lm(p.xz).g)); specK = 0.02;
#endif
#ifdef MAT_ROOF
  alb *= 0.8 + 0.3*big; specK = 0.12; shin = 20.0;
#endif
#ifdef MAT_FENCE
  alb *= (0.75 + 0.3*big) * mix(0.6, 1.0, smoothstep(0.0, 0.5, p.y)); specK = 0.04;
#endif
#ifdef MAT_CASE
  alb = vec3(0.86 + 0.14*vnoise(p*25.0)) * (0.9 + 0.1*big); nm = vec3(0.0, 0.0, 1.0); specK = 0.2; shin = 30.0;
#endif
#ifdef MAT_CHAIN
  float d0 = length(camPos - p);
  vec2 dg = vec2(vUV.x + vUV.y, vUV.x - vUV.y) / 0.085;
  vec2 fr = abs(fract(dg) - 0.5);
  float exact = step(0.5 - max(fr.x, fr.y), 0.09 + d0*0.004);
  float farK = step(hash13(vec3(gl_FragCoord.xy, 7.0)), 0.3 * (1.0 - smoothstep(18.0, 36.0, d0)));
  if(mix(exact, farK, smoothstep(3.5, 8.0, d0)) < 0.5) discard;
  alb = vec3(0.5, 0.52, 0.5); nm = vec3(0.0, 0.0, 1.0); specK = 0.5; shin = 30.0;
#endif
#ifdef MAT_HWALL
  float hh = p.y, wood5 = 1.0 - step(0.98, hh) + step(2.74, hh);
  float grime5 = smoothstep(0.55, 0.82, fbm(vec3((p.x + p.z)*0.9, hh*0.6, (p.z - p.x)*0.9)));
  alb *= mix(vec3(1.0), vec3(0.8, 0.72, 0.58), grime5*0.55*(1.0 - wood5));
  ao = mix(0.5, 1.0, smoothstep(0.0, 0.4, hh)) * mix(0.62, 1.0, smoothstep(0.0, 0.35, CEIL - hh));
  specK = mix(0.1, 0.42, wood5); shin = mix(18.0, 46.0, wood5);
#ifdef EYES
  if(eyeP.w > 0.01 && hh > 0.99 && hh < 2.61){
    float row5 = floor((hh - 0.98) / 0.41);
    float cu5 = vUV.x*6.0 + 0.5*mod(row5, 2.0);
    float col5 = floor(cu5);
    vec2 lc = vec2((fract(cu5) - 0.5)*0.5, hh - (0.98 + (row5 + 0.5)*0.41));
    vec3 ec = p - T*lc.x - vec3(0.0, lc.y, 0.0);
    float hsh = hash13(vec3(col5, row5, floor(dot(p, gn)*3.0 + 0.5)));
    float want = eyeP.w * (1.0 - smoothstep(0.5, 1.9, length(ec - eyeP.xyz)));
    float open5 = smoothstep(hsh*0.75, hsh*0.75 + 0.25, want) * (1.0 - step(0.955, fract(lvl.w*0.23 + hsh*7.0)));
    float ax = lc.x / 0.15, lid = 0.066*open5*max(0.0, 1.0 - ax*ax);
    if(open5 > 0.01 && abs(lc.y) < lid){
      vec3 toC = camPos - ec; float lcd = max(length(toC), 0.3);
      vec2 pc = vec2(dot(toC, T), toC.y) / lcd * vec2(0.055, 0.03);
      float r5 = length(lc - pc);
      vec3 eyeC = mix(vec3(0.8, 0.74, 0.58), mix(vec3(0.42, 0.22, 0.06), vec3(0.01), smoothstep(0.021, 0.017, r5)), smoothstep(0.047, 0.042, r5));
      eyeC *= mix(0.5, 1.0, smoothstep(0.0, 0.55, 1.0 - abs(lc.y)/max(lid, 1e-3)));
      alb = eyeC*eyeC; nm = vec3(0.0, 0.0, 1.0); specK = 1.1; shin = 70.0;
      emis5 = alb*0.05*open5*(1.0 - smoothstep(0.02, 0.016, r5));
    } else if(open5 > 0.01) alb *= 1.0 - 0.7*open5*smoothstep(0.014, 0.0, abs(abs(lc.y) - lid))*step(abs(ax), 1.05);
  }
#endif
#endif
#ifdef MAT_CARPET
  float wear5 = smoothstep(0.52, 0.8, fbm(vec3(p.x*0.6, 3.0, p.z*0.6)));
  alb *= mix(1.0, 0.78, wear5) * (0.9 + 0.2*big);
  ao = mix(0.38, 1.0, smoothstep(0.03, 0.55, lm(p.xz).g)); specK = 0.02; shin = 6.0; nStr = 1.2;
#endif
#ifdef MAT_CHECK
  ao = mix(0.55, 1.0, smoothstep(0.03, 0.6, lm(p.xz).g));
  alb *= 0.92 + 0.1*big; specK = 1.3; shin = 110.0; nStr = 0.35;
#endif
#ifdef MAT_DECO
  float gold5 = smoothstep(0.3, 0.5, alb.r - alb.b);
  ao = mix(0.5, 1.0, smoothstep(0.0, 0.5, p.y)) * mix(0.72, 1.0, smoothstep(0.0, 1.0, 7.0 - p.y));
  specK = mix(0.1, 0.95, gold5); shin = mix(18.0, 52.0, gold5); lk = mix(1.0, 0.75, smoothstep(3.0, 7.0, p.y));
#endif
#if defined(MAT_HCEIL) || defined(MAT_BCEIL)
  float wsp5 = smoothstep(0.62, 0.82, fbm(vec3(p.x*0.4, 5.0, p.z*0.4)));
  alb *= mix(vec3(1.0), vec3(0.8, 0.7, 0.52), wsp5*0.7);
  lk = 0.6; ao = mix(0.5, 1.0, smoothstep(0.03, 0.5, lm(p.xz).g)); specK = 0.05;
#endif
#ifdef MAT_BCEIL
  float gold6 = smoothstep(0.3, 0.5, alb.r - alb.b); specK = mix(0.05, 0.8, gold6); shin = 40.0; lk = 0.45;
#endif
#ifdef MAT_BCONC
  float grm5 = smoothstep(0.7, 0.0, p.y) * (0.5 + 0.5*fbm(p*1.5));
  float rust5 = smoothstep(0.6, 0.85, vnoise(vec3((p.x + p.z)*5.0, p.y*0.25, (p.z - p.x)*5.0))) * smoothstep(0.4, 0.7, big) * smoothstep(0.8, 2.6, p.y);
  alb *= (1.0 - grm5*0.45) * (0.8 + 0.3*big);
  alb = mix(alb, alb*vec3(0.75, 0.42, 0.22), rust5*0.8);
  ao = mix(0.45, 1.0, smoothstep(0.0, 0.45, p.y)) * mix(0.6, 1.0, smoothstep(0.0, 0.4, abs(CEIL - p.y))); specK = 0.06 + grm5*0.25; shin = 16.0;
#endif
#ifdef MAT_BFLOOR
  float oil5 = smoothstep(0.58, 0.72, fbm(vec3(p.x*0.3, 2.0, p.z*0.3)));
  alb *= (0.8 + 0.3*big) * mix(1.0, 0.35, oil5);
  ao = mix(0.4, 1.0, smoothstep(0.03, 0.55, lm(p.xz).g));
  specK = mix(0.05, 1.6, oil5); shin = mix(10.0, 80.0, oil5); nStr = mix(1.0, 0.2, oil5);
#endif
#ifdef MAT_PLAQUE
  nm = vec3(0.0, 0.0, 1.0); specK = 0.7; shin = 44.0;
#endif
#ifdef MAT_KWALL
  float kd18 = smoothstep(0.62, 0.88, fbm(vec3((p.x + p.z)*0.8, p.y*0.5, (p.z - p.x)*0.8)));
  alb *= mix(vec3(1.0), vec3(0.84, 0.8, 0.72), kd18*0.4) * (0.94 + 0.1*big);
  ao = mix(0.55, 1.0, smoothstep(0.0, 0.35, p.y)); specK = 0.1; shin = 22.0;
#endif
#ifdef KGLOSS
  specK = 0.8; shin = 70.0; nStr = 0.6;
#endif
#ifdef MAT_KVOID
  alb *= 0.7; specK = 0.03; shin = 8.0; ao = 1.0;
#endif
#ifdef MAT_KFLOOR
  ao = mix(0.42, 1.0, smoothstep(0.03, 0.55, lm(p.xz).g));
  alb *= 0.9 + 0.14*big; specK = 0.06; shin = 10.0;
#endif
#ifdef KSHEEN
  specK = 0.9; shin = 90.0; nStr = 0.4;
#endif
#ifdef MAT_KCEIL
  lk = 0.55; ao = mix(0.5, 1.0, smoothstep(0.03, 0.5, lm(p.xz).g)); specK = 0.03;
#endif
#ifdef KSTARS
  emis5 = alb * step(0.55, alb.g - alb.b*0.5) * 0.5;
#endif
#ifdef MAT_PAPER
  nm = vec3(0.0, 0.0, 1.0); specK = 0.04; shin = 8.0;
#endif
#ifdef VCOL
  alb *= vC.rgb*vC.rgb;
#endif
#ifdef PBR
  ao *= mix(1.0, orm.r, texK.z);
  gRough = mix(roughOf(shin), orm.g, texK.w);
#endif
  nm.xy *= nStr;
  vec3 n = normalize(T*nm.x + B*nm.y + gn*max(nm.z, 0.15));
  float L = fixtureAt(p, gn);
#ifdef MAT_FLOOR
  float over = 0.8 + 0.2*n.y;
#else
  float over = clamp(0.82 + 0.75*(n.y - gn.y) + 0.18*gn.y, 0.3, 1.4);
#endif
#ifdef SKY1
  float sky = 1.0;
#else
  float sky = skyAt(p, gn);
#endif
  vec3 fixCol = fixC(sky);
  vec3 amb = ambAt(sky, n) * (1.0 + misc.y);
  vec3 diff = amb + fixCol * L * lk * over;
  vec3 spec = vec3(0.0);
  dynLights(p, n, gn, V, shin, specK, diff, spec);
  float cs = contactSh(p);
  vec3 col = alb * diff * ao * cs + spec * cs;
#if defined(MAT_FLOOR) || defined(MAT_WOOD) || defined(MAT_TILE)
  col += fixCol * L * specK * 0.05 * pow(1.0 - max(V.y, 0.0), 4.0);
#endif
#if defined(MAT_CHECK) || defined(MAT_BFLOOR) || defined(KSHEEN)
  col += fixCol * L * specK * 0.07 * pow(1.0 - max(V.y, 0.0), 3.0);
#endif
  col += emis5;
#ifdef MAT_ASPH
  col += fixCol * L * specK * 0.09 * pow(1.0 - max(V.y, 0.0), 3.0);
#endif
  col = fogIt(col, p);
  gl_FragColor = vec4(col, 1.0);
}`;

SH.env9V = `precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec2 uv; attribute vec4 tangent; attribute vec4 color;
uniform mat4 world; uniform mat4 viewProjection;
varying vec3 vPos; varying vec3 vN; varying vec3 vT; varying vec2 vUV; varying vec4 vC;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vN = normalize(mat3(world)*normal); vT = normalize(mat3(world)*tangent.xyz); vUV = uv; vC = color; gl_Position = viewProjection*wp; }`;
// additive light shafts under street lamps / cure mist (vC.r flicker flag, vC.g source height, vC.b strength)
SH.coneV = `precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec4 color;
uniform mat4 world; uniform mat4 viewProjection;
varying vec3 vPos; varying vec3 vN; varying vec4 vC;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vN = normalize(mat3(world)*normal); vC = color; gl_Position = viewProjection*wp; }`;
SH.coneF = `precision highp float;
varying vec3 vPos; varying vec3 vN; varying vec4 vC;
uniform vec4 coneCol;
${GLSL_COMMON}
void main(){
  vec3 V = normalize(camPos - vPos);
  float e = abs(dot(normalize(vN), V));
  float t = clamp(1.0 - vPos.y / vC.g, 0.0, 1.0);
  float on = mix(1.0, lvl.z, vC.r) * lvl.y;
  float a = vC.b * coneCol.a * pow(1.0 - t, 1.5) * smoothstep(0.0, 0.08, t) * pow(e, 1.4) * on;
  float dust = 0.7 + 0.3*vnoise(vPos*1.7 + vec3(0.0, lvl.w*0.25, 0.0));
  float d = length(camPos - vPos);
  a *= smoothstep(0.4, 2.2, d) * (1.0 - 0.85*(1.0 - exp(-pow(fogP.a*d, 2.0))));
  gl_FragColor = vec4(coneCol.rgb*a*dust, 1.0);
}`;

SH.fixV = `precision highp float;
attribute vec3 position; attribute vec2 uv; attribute vec4 color;
uniform mat4 world; uniform mat4 viewProjection;
varying vec2 vUV; varying vec4 vC; varying vec3 vPos;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vUV = uv; vC = color; gl_Position = viewProjection*wp; }`;
SH.fixF = `precision highp float;
varying vec2 vUV; varying vec4 vC; varying vec3 vPos;
${GLSL_COMMON}
void main(){
  vec2 uv = vUV;
  float fr = 1.0 - step(0.045, uv.x)*step(uv.x, 0.955)*step(0.08, uv.y)*step(uv.y, 0.92);
  vec2 g = fract(uv*vec2(34.0, 17.0));
  float cellE = min(min(g.x, 1.0-g.x), min(g.y, 1.0-g.y));
  float prism = 0.78 + 0.22*smoothstep(0.0, 0.25, cellE);
  float on = vC.r * mix(1.0, lvl.z, vC.g) * lvl.y;
  float tubes = 0.72 + 0.38*exp(-pow((uv.y - 0.3)*9.0, 2.0)) + 0.38*exp(-pow((uv.y - 0.7)*9.0, 2.0));
  float dirt = smoothstep(0.64, 0.82, vnoise(vec3(uv*vec2(16.0, 8.0), vC.b*50.0)));
  vec3 hot = vec3(1.0, 0.93, 0.76) * 5.5 * on * tubes * prism * (1.0 - dirt*0.55);
  float L = fixtureAt(vPos, vec3(0.0));
  vec3 cold = vec3(0.34, 0.32, 0.27) * (0.03 + L*0.3) * prism * (1.0 - dirt*0.7);
  vec3 metal = vec3(0.62, 0.6, 0.52) * (0.03 + L*0.45 + on*0.5);
  vec3 col = mix(hot + cold, metal, fr);
  vec3 dn = vec3(0.0, -1.0, 0.0); vec3 d = vec3(0.0); vec3 s = vec3(0.0);
  dynLights(vPos, dn, dn, normalize(camPos - vPos), 30.0, 0.4, d, s);
  col += vec3(0.35, 0.33, 0.28)*d + s;
  col = fogIt(col, vPos);
  gl_FragColor = vec4(col, 1.0);
}`;

SH.dtexV = `precision highp float;
attribute vec3 position; attribute vec2 uv;
uniform mat4 world; uniform mat4 viewProjection;
varying vec2 vUV; varying vec3 vPos;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vUV = uv; gl_Position = viewProjection*wp; }`;
SH.dtexF = `precision highp float;
varying vec2 vUV; varying vec3 vPos;
uniform sampler2D tex; uniform vec4 dP;
${GLSL_COMMON}
void main(){
  vec4 t = texture2D(tex, vUV);
  if(dP.y > 0.5 && t.a < 0.35) discard;
  vec3 c = pow(t.rgb, vec3(2.2))*dP.x*(0.94 + 0.06*sin(vUV.y*420.0 + lvl.w*9.0));
  gl_FragColor = vec4(fogIt(c, vPos), 1.0);
}`;

SH.actV = `precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec4 color;
uniform mat4 world; uniform mat4 viewProjection;
varying vec3 vPos; varying vec3 vN; varying vec4 vC; varying vec3 vL;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vN = normalize(mat3(world)*normal); vC = color; vL = position; gl_Position = viewProjection*wp; }`;
SH.actF = `precision highp float;
varying vec3 vPos; varying vec3 vN; varying vec4 vC; varying vec3 vL;
uniform vec4 aP; uniform vec4 aP2; uniform vec4 aTint; uniform vec3 aEmi;
${GLSL_COMMON}
void main(){
  if(aP2.x > 0.001){ float dn = vnoise(vL*11.0 + vec3(0.0, lvl.w*0.7, 0.0)); if(dn < aP2.x) discard; }
  vec3 p = vPos; vec3 gn = normalize(vN); vec3 V = normalize(camPos - p);
  vec3 n = gn;
  if(aP.z > 0.0){
    vec3 q = vL*vec3(16.0, 7.0, 16.0);
    float h0 = vnoise(q);
    vec3 gr = vec3(vnoise(q + vec3(0.3,0.0,0.0)) - h0, vnoise(q + vec3(0.0,0.3,0.0)) - h0, vnoise(q + vec3(0.0,0.0,0.3)) - h0);
    n = normalize(gn - (gr - dot(gr, gn)*gn) * aP.z);
  }
  vec3 alb = vC.rgb*vC.rgb*aTint.rgb;
  if(aP2.w > 0.0){ float m = fbm(vL*9.0); alb *= mix(1.0, 0.7, smoothstep(0.35, 0.75, m)*aP2.w); }
  float L = fixtureAt(p, gn);
  float wrap = aP2.z;
  float over = 0.45 + 0.55*clamp((n.y + wrap)/(1.0 + wrap), 0.0, 1.0);
  float sky = skyAt(p, gn);
  vec3 fixCol = fixC(sky);
  vec3 diff = ambAt(sky, n)*(1.0 + misc.y)*(0.6 + 0.4*over) + fixCol*L*over*0.9;
  vec3 spec = vec3(0.0);
  dynLights(p, n, gn, V, aP.y, aP.x, diff, spec);
  vec3 R = reflect(-V, n);
  spec += fixCol * L * aP2.y * pow(max(R.y, 0.0), 12.0) * 0.5;
  vec3 col = alb*diff + spec;
  col += vC.rgb * vC.a * aP.w * aEmi;
  col = fogIt(col, p);
  gl_FragColor = vec4(col, 1.0);
}`;

// r5: GPU-skinned characters (bone palette = 3 rows per joint) with role outfits painted in bind-pose space
SH.skinV = `precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec4 tangent; attribute vec2 uv; attribute vec4 bj; attribute vec4 bw; attribute vec4 rg;
uniform mat4 world; uniform mat4 viewProjection; uniform vec4 bones[NBV]; uniform vec4 sInf;
varying vec3 vPos; varying vec3 vN; varying vec4 vT; varying vec2 vUV; varying vec3 vB; varying vec4 vRg;
void main(){
  float body = 1.0 - clamp(rg.x + rg.y + rg.z + rg.w, 0.0, 1.0);
  vec4 P = vec4(position + normal*(sInf.x*body + sInf.y*(rg.y + rg.z) + sInf.z*rg.x*(1.0 - rg.w)), 1.0);
  vec3 sp = vec3(0.0), sn = vec3(0.0), st = vec3(0.0);
  for(int i = 0; i < 4; i++){
    float w = bw[i];
    if(w <= 0.0) continue;
    int k = int(bj[i] + 0.5)*3;
    vec4 a = bones[k], b = bones[k + 1], c = bones[k + 2];
    sp += w*vec3(dot(a, P), dot(b, P), dot(c, P));
    sn += w*vec3(dot(a.xyz, normal), dot(b.xyz, normal), dot(c.xyz, normal));
    st += w*vec3(dot(a.xyz, tangent.xyz), dot(b.xyz, tangent.xyz), dot(c.xyz, tangent.xyz));
  }
  vec4 wp = world*vec4(sp, 1.0);
  vPos = wp.xyz; vN = normalize(mat3(world)*sn); vT = vec4(normalize(mat3(world)*st), tangent.w); vUV = uv; vB = position; vRg = rg;
  gl_Position = viewProjection*wp;
}`;
SH.skinF = `precision highp float;
varying vec3 vPos; varying vec3 vN; varying vec4 vT; varying vec2 vUV; varying vec3 vB; varying vec4 vRg;
uniform sampler2D albTex; uniform sampler2D nrmTex; uniform sampler2D eyeTex;
uniform vec4 aP; uniform vec4 aP2; uniform vec4 aTint; uniform vec3 aEmi;
uniform vec4 oC1; uniform vec4 oC2; uniform vec4 oC3; uniform vec4 oEye; uniform vec4 oK;
${GLSL_COMMON}
float band(float v, float a, float b, float s){ return smoothstep(a - s, a, v)*(1.0 - smoothstep(b, b + s, v)); }
void main(){
  vec3 B = vB; float ax = abs(B.x);
  float head = vRg.x, hand = vRg.y, foot = vRg.z, eye = step(0.5, vRg.w);
  if(aP2.x > 0.001){ float dn = vnoise(B*11.0 + vec3(0.0, lvl.w*0.7, 0.0)); if(dn < aP2.x) discard; }
  vec4 tA = texture2D(albTex, vUV);
  vec3 tex = tA.rgb*tA.rgb;
  float texL = dot(tex, vec3(0.3, 0.59, 0.11));
  float skinV = clamp(texL/0.2, 0.55, 1.35);          // shading variation of the skin scan (pores, creases)
  vec3 tn = texture2D(nrmTex, vUV).xyz*2.0 - 1.0;
  float rough = tA.a, nStr = 1.0, wrk = 0.0, emi = 0.0, sMul = 1.0; vec3 emC = vec3(0.0);
  float arm = smoothstep(0.19, 0.25, ax)*step(1.27, B.y)*(1.0 - hand);
  float leg = 1.0 - smoothstep(0.92, 0.99, B.y);
  float face = band(B.y, 1.58, 1.79, 0.012)*smoothstep(0.015, 0.05, B.z)*(1.0 - smoothstep(0.062, 0.085, ax));
  float mot = fbm(B*vec3(7.0, 4.0, 7.0) + oK.w);
  vec3 SK = oC1.rgb*oC1.rgb, A = oC2.rgb*oC2.rgb, C3 = oC3.rgb*oC3.rgb;
  vec3 alb = SK*skinV;
#ifdef O_HAZMAT
  vec3 S = A*mix(0.8, 1.08, mot)*mix(0.7, 1.0, smoothstep(0.08, 0.75, B.y));
  float tape = max(max(band(ax, 0.6, 0.645, 0.006)*arm, band(B.y, 0.15, 0.2, 0.006)*leg), max(band(B.y, 0.99, 1.04, 0.006)*(1.0 - arm), band(B.y, 1.535, 1.565, 0.006)*(1.0 - arm)));
  vec3 c = mix(S, vec3(0.24, 0.24, 0.22), tape);
  float rub = max(hand, max(foot, 1.0 - smoothstep(0.1, 0.125, B.y)));
  c = mix(c, vec3(0.0022), rub);
  alb = mix(c, vec3(0.004), face); rough = mix(mix(0.42, 0.62, tape), 0.48, rub); nStr = 0.22; wrk = aP.z*(1.0 - rub*0.6);
#endif
#ifdef O_WATCH
  float skin = max(hand, step(1.535, B.y));
  float coat = (1.0 - skin)*step(0.36, B.y);
  float vest = band(B.y, 1.0, 1.43, 0.008)*(1.0 - arm)*(1.0 - skin);
  float strip = vest*(band(B.y, 1.1, 1.135, 0.003) + band(B.y, 1.29, 1.325, 0.003));
  vec3 c = mix(vec3(0.0064)*mix(0.7, 1.2, mot), A*mix(0.65, 1.15, mot), coat);
  c = mix(c, C3*mix(0.85, 1.05, mot), vest); c = mix(c, vec3(0.81, 0.81, 0.64), strip);
  c = mix(c, SK*skinV, skin);
  alb = c; rough = mix(0.82, tA.a, skin); nStr = mix(0.35, 1.0, skin); wrk = aP.z*(1.0 - skin); sMul = mix(0.45, 1.0, skin);
  emi = strip*0.45; emC = vec3(0.9, 0.9, 0.8);
#endif
#ifdef O_LAB
  float skin = max(hand, head);
  float hair = head*max(smoothstep(1.738, 1.756, B.y + max(0.0, -B.z - 0.01)*0.9), smoothstep(-0.035, -0.06, B.z)*step(1.63, B.y))*(1.0 - face*0.85);
  float coat = (1.0 - skin)*step(0.56, B.y);
  float open = (1.0 - arm)*band(B.y, 0.98, 1.52, 0.01)*(1.0 - smoothstep(0.03, 0.055, ax))*step(0.02, B.z);
  float pants = (1.0 - skin)*(1.0 - coat);
  vec3 c = mix(vec3(0.0484)*mix(0.8, 1.1, mot), vec3(0.0064), foot);
  c = mix(c, vec3(0.70, 0.72, 0.69)*mix(0.86, 1.04, mot), coat);
  c = mix(c, C3*mix(0.9, 1.05, mot), open*coat);
  c = mix(c, SK*skinV, skin*(1.0 - hair));
  c = mix(c, vec3(0.09, 0.075, 0.06)*mix(0.7, 1.2, mot), hair);
  alb = c; rough = mix(mix(0.78, 0.6, open), tA.a, skin); nStr = mix(0.3, 1.0, skin); wrk = aP.z*(1.0 - skin); sMul = mix(0.55, 1.0, skin);
#endif
#ifdef O_GOWN
  float gown = (1.0 - head)*(1.0 - hand)*step(0.5, B.y)*(1.0 - smoothstep(0.3, 0.34, ax)*step(1.27, B.y));
  vec3 c = SK*skinV*mix(0.75, 1.05, mot);
  vec3 G = A*mix(0.72, 1.06, fbm(B*5.0 + 3.1));
  G *= mix(1.0, 0.55, smoothstep(0.62, 0.8, fbm(B*9.0 + 7.0)));   // stains
  alb = mix(c, G, gown); rough = mix(tA.a, 0.85, gown); nStr = mix(1.0, 0.4, gown); wrk = aP.z*gown; sMul = mix(1.0, 0.35, gown);
#endif
#ifdef O_RAGS
  float holes = smoothstep(0.58, 0.64, fbm(B*vec3(10.0, 6.0, 10.0) + 11.0));
  float shirt = (1.0 - arm*step(0.3, ax))*(1.0 - head)*band(B.y, 0.97, 1.47, 0.02)*(1.0 - holes);
  float pants = (1.0 - foot)*band(B.y, 0.3 + 0.08*fbm(B*13.0), 1.02, 0.01)*(1.0 - holes*0.7);
  vec3 c = SK*skinV*mix(0.6, 1.1, mot);
  c = mix(c, A*mix(0.6, 1.1, mot), shirt); c = mix(c, C3*mix(0.6, 1.1, mot), pants*(1.0 - shirt));
  alb = c; rough = mix(tA.a*0.8, 0.92, max(shirt, pants)); nStr = mix(1.3, 0.4, max(shirt, pants)); wrk = aP.z*0.5; sMul = mix(1.0, 0.25, max(shirt, pants));
#endif
#ifdef O_CREATURE
  alb = SK*mix(0.75, 1.25, mot)*clamp(texL/0.2, 0.7, 1.25);
  rough = 0.22 + 0.35*smoothstep(0.4, 0.8, mot); nStr = 1.4;
#endif
#ifdef O_FACELESS
  if(eye > 0.5) discard;
  alb = SK; rough = 0.9; nStr = 1.0 - head*0.95;
#endif
  vec3 N = normalize(vN), T = normalize(vT.xyz - N*dot(N, vT.xyz)), Bt = cross(N, T)*vT.w;
  vec3 n = normalize(T*tn.x*nStr + Bt*tn.y*nStr + N*max(tn.z, 0.3));
  if(wrk > 0.0){
    vec3 q = B*vec3(16.0, 7.0, 16.0); float h0 = vnoise(q);
    vec3 gr = vec3(vnoise(q + vec3(0.3, 0.0, 0.0)) - h0, vnoise(q + vec3(0.0, 0.3, 0.0)) - h0, vnoise(q + vec3(0.0, 0.0, 0.3)) - h0);
    n = normalize(n - (gr - dot(gr, n)*n)*wrk);
  }
  if(eye > 0.5){ vec3 et = texture2D(eyeTex, vUV).rgb; alb = et*et*0.8; rough = 0.08; n = N; }
  alb *= aTint.rgb;
  if(aP2.w > 0.0) alb *= mix(1.0, 0.7, smoothstep(0.35, 0.75, mot)*aP2.w);
  vec3 p = vPos, gn = N, V = normalize(camPos - p);
  gRough = clamp(rough, 0.08, 1.0);
  float L = fixtureAt(p, gn);
  float wrap = aP2.z;
  float over = 0.45 + 0.55*clamp((n.y + wrap)/(1.0 + wrap), 0.0, 1.0);
  float sky = skyAt(p, gn);
  vec3 fixCol = fixC(sky);
  vec3 diff = ambAt(sky, n)*(1.0 + misc.y)*(0.6 + 0.4*over) + fixCol*L*over*0.9;
  vec3 spec = vec3(0.0);
  dynLights(p, n, gn, V, aP.y, aP.x*sMul, diff, spec);
  vec3 R = reflect(-V, n);
  spec += fixCol*L*(aP2.y + (1.0 - gRough)*0.25)*pow(max(R.y, 0.0), 12.0)*0.5*sMul;
  vec3 col = alb*diff + spec;
  col += emC*emi*aEmi + oEye.rgb*oEye.a*eye*aEmi*1.6;
  col = fogIt(col, p);
  gl_FragColor = vec4(col, 1.0);
}`;

// r5: photo-scanned prop models (Poly Haven): albedo + roughness, image-row normal + AO + metalness, lit like every other surface
SH.mdlV = `precision highp float;
attribute vec3 position; attribute vec3 normal; attribute vec4 tangent; attribute vec2 uv; attribute vec4 color;
uniform mat4 world; uniform mat4 viewProjection;
varying vec3 vPos; varying vec3 vN; varying vec4 vT; varying vec2 vUV; varying vec4 vC;
void main(){ vec4 wp = world*vec4(position, 1.0); vPos = wp.xyz; vN = normalize(mat3(world)*normal); vT = vec4(normalize(mat3(world)*tangent.xyz), tangent.w); vUV = uv; vC = color; gl_Position = viewProjection*wp; }`;
SH.mdlF = `precision highp float;
varying vec3 vPos; varying vec3 vN; varying vec4 vT; varying vec2 vUV; varying vec4 vC;
uniform sampler2D albTex; uniform sampler2D nrmTex; uniform vec4 mK; uniform vec4 aTint;
${GLSL_COMMON}
void main(){
  vec4 tA = texture2D(albTex, vUV), tN = texture2D(nrmTex, vUV);
  vec3 a0 = tA.rgb*tA.rgb, alb = a0*vC.rgb;
  if(vC.a < 0.99){   // repaint: saturated texels take the tint colour (sRGB, like prop vertex colours), keeping their brightness relative to the model's
    // mean paint brightness (aTint.w) - a dark-blue plastic seat becomes a bright red one; greys / metals keep their own colour
    float mx = max(a0.r, max(a0.g, a0.b)), mn = min(a0.r, min(a0.g, a0.b)), k = smoothstep(0.2, 0.45, (mx - mn)/(mx + 0.002))*(1.0 - vC.a);
    alb = mix(a0, vC.rgb*vC.rgb*min(mx/aTint.w, 1.6), k);
  }
  alb *= aTint.rgb;
  float metal = tN.a, ao = mix(1.0, tN.b, mK.z);
  if(mK.w > 0.0) alb *= mix(1.0, 0.72, smoothstep(0.4, 0.8, fbm(vPos*3.1))*mK.w);
  vec2 nxy = (tN.rg*2.0 - 1.0)*mK.y; vec3 tn = vec3(nxy, sqrt(max(1.0 - dot(nxy, nxy), 0.04)));
  vec3 N = normalize(vN); if(!gl_FrontFacing) N = -N;
  vec3 T = normalize(vT.xyz - N*dot(N, vT.xyz)), Bt = cross(N, T)*vT.w;
  vec3 n = normalize(T*tn.x + Bt*tn.y + N*tn.z);
  vec3 p = vPos, gn = N, V = normalize(camPos - p);
  gRough = clamp(tA.a, 0.12, 1.0);
  float L = fixtureAt(p, gn);
  float over = 0.45 + 0.55*clamp((n.y + 0.35)/1.35, 0.0, 1.0);
  float sky = skyAt(p, gn);
  vec3 fixCol = fixC(sky);
  vec3 diff = (ambAt(sky, n)*(1.0 + misc.y)*(0.6 + 0.4*over) + fixCol*L*over*0.9)*ao;
  vec3 spec = vec3(0.0);
  dynLights(p, n, gn, V, 20.0, mK.x*mix(1.0, 1.8, metal), diff, spec);
  vec3 R = reflect(-V, n);
  spec += fixCol*L*(1.0 - gRough)*0.3*pow(max(R.y, 0.0), 10.0)*ao;
  // metals have no diffuse: they mirror the (blurred) surroundings instead - approximated by the ambient + fixture light around them
  vec3 env = (ambAt(sky, R)*(1.0 + misc.y) + fixCol*L*0.55)*mix(1.0, 0.55, gRough)*ao;
  vec3 col = alb*diff*(1.0 - 0.8*metal) + spec*mix(vec3(1.0), alb*2.5 + 0.08, metal) + env*alb*metal*1.1;
  col = fogIt(col, p);
  gl_FragColor = vec4(col, 1.0);
}`;

SH.scrF = `precision highp float;
varying vec3 vPos; varying vec3 vN; varying vec4 vC; varying vec3 vL;
uniform float seed; uniform vec4 aTint;
${GLSL_COMMON}
float h2(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)))*43758.5453); }
void main(){
  vec2 q = floor((vL.xy + 0.5)*vec2(96.0, 72.0));
  float t = floor(lvl.w*24.0);
  float s = h2(q + vec2(t*1.37, t*2.11) + seed);
  float roll = 0.75 + 0.25*sin(vL.y*30.0 - lvl.w*9.0);
  vec2 c = vL.xy/vec2(0.42, 0.32);
  float vig = 1.0 - smoothstep(0.6, 1.1, length(c));
  vec3 col = vec3(0.72, 0.8, 1.0) * (0.25 + 0.75*s) * roll * vig * 1.6 * aTint.a;
  col = fogIt(col, vPos);
  gl_FragColor = vec4(col, 1.0);
}`;

SH.beamV = `precision highp float;
attribute vec3 position; attribute vec3 normal;
uniform mat4 world; uniform mat4 viewProjection; uniform float beamLen;
varying vec3 vPos; varying vec3 vN; varying float vT;
void main(){ vec4 wp = world*vec4(position,1.0); vPos = wp.xyz; vN = normalize(mat3(world)*normal); vT = 0.5 - position.y/beamLen; gl_Position = viewProjection*wp; }`;
SH.beamF = `precision highp float;
varying vec3 vPos; varying vec3 vN; varying float vT;
uniform vec4 beamC;
${GLSL_COMMON}
void main(){
  vec3 V = normalize(camPos - vPos);
  float e = abs(dot(normalize(vN), V));
  float a = beamC.a * pow(max(1.0 - vT, 0.0), 2.2) * smoothstep(0.0, 0.06, vT) * pow(e, 1.6);
  float dust = 0.7 + 0.3*vnoise(vPos*3.0 + vec3(0.0, lvl.w*0.2, 0.0));
  float d = length(camPos - vPos);
  a *= smoothstep(0.3, 1.5, d);
  gl_FragColor = vec4(beamC.rgb*a*dust, 1.0);
}`;

SH.dustV = `precision highp float;
attribute vec3 position;
uniform mat4 viewProjection; uniform vec3 camPos; uniform vec4 lvl; uniform float ptScale;
varying vec3 vPos; varying float vA;
void main(){
  vec3 box = vec3(8.0, 2.8, 8.0);
  vec3 drift = vec3(sin(lvl.w*0.05 + position.x*20.0), 0.25*sin(lvl.w*0.1 + position.y*30.0) - 0.02*lvl.w, cos(lvl.w*0.04 + position.z*20.0))*0.4;
  vec3 wp = position*box + drift;
  wp.xz = camPos.xz - box.xz*0.5 + mod(wp.xz - camPos.xz + box.xz*0.5, box.xz);
  wp.y = mod(wp.y, 2.8);
  vPos = wp;
  gl_Position = viewProjection*vec4(wp, 1.0);
  float d = length(wp - camPos);
  gl_PointSize = clamp(ptScale / max(d, 0.2), 1.0, 5.0);
  vA = (1.0 - smoothstep(2.5, 4.0, d)) * smoothstep(0.15, 0.5, d);
}`;
SH.dustF = `precision highp float;
varying vec3 vPos; varying float vA;
${GLSL_COMMON}
void main(){
  vec3 V = normalize(camPos - vPos);
  vec3 d = vec3(0.0); vec3 s = vec3(0.0);
  dynLights(vPos, V, V, V, 1.0, 0.0, d, s);
  float L = fixtureAt(vPos, vec3(0.0));
  vec3 c = d*0.16 + vec3(1.0, 0.9, 0.6)*L*0.006;
  gl_FragColor = vec4(c*vA, 1.0);
}`;

SH.vhsF = `precision highp float;
varying vec2 vUV;
uniform sampler2D textureSampler;
uniform vec2 res;
uniform vec4 p1; uniform vec4 p2; uniform vec4 p3;
float h12(vec2 p){ vec3 q = fract(vec3(p.xyx)*0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y)*q.z); }
vec3 tm(vec3 x){ x *= p2.w; vec3 a = (x*(2.51*x + 0.03))/(x*(2.43*x + 0.59) + 0.14); return pow(clamp(a, 0.0, 1.0), vec3(1.0/2.2)); }
vec3 S(vec2 uv){ return tm(texture2D(textureSampler, clamp(uv, vec2(0.001), vec2(0.999))).rgb); }
const mat3 toY = mat3(0.299, 0.596, 0.211, 0.587, -0.274, -0.523, 0.114, -0.322, 0.312);
const mat3 frY = mat3(1.0, 1.0, 1.0, 0.956, -0.272, -1.106, 0.621, -0.647, 1.703);
void main(){
  float t = p1.x, amt = p1.y, gl = p1.z;
  vec2 uv = vUV;
  vec2 cc = uv - 0.5;
  uv = 0.5 + cc*(1.0 - 0.035*amt + 0.07*amt*dot(cc, cc));
  float fr = floor(t*29.97);
  float ln = floor(uv.y*res.y*0.5);
  float wob = sin(uv.y*6.0 + t*1.7)*0.0007*amt + (h12(vec2(ln, fr)) - 0.5)*0.0008*amt;
  float bandY = 1.0 - fract(t*0.043 + 0.3);
  float band = exp(-pow((uv.y - bandY)*30.0, 2.0));
  wob += band*(h12(vec2(ln*0.37, fr)) - 0.5)*0.012*amt*(0.4 + gl);
  float blk = floor(uv.y*18.0 + h12(vec2(fr, 3.0))*4.0);
  float gsel = step(1.0 - gl*0.45, h12(vec2(blk, fr)));
  wob += gsel*(h12(vec2(blk, fr + 7.0)) - 0.5)*0.16*gl;
  float hs = smoothstep(0.035, 0.0, uv.y);
  wob += hs*(h12(vec2(ln, fr))*0.03 + 0.01)*amt;
  vec2 su = vec2(uv.x + wob, uv.y);
  vec2 px = vec2(1.0/res.x, 0.0);
  vec3 c0 = S(su);
  vec3 c1 = S(su - px*1.4*amt); vec3 c2 = S(su + px*1.4*amt);
  vec3 base = c0*0.5 + (c1 + c2)*0.25;
  vec3 yiq = toY*base;
  float yL = dot(S(su - px*3.5), vec3(0.299, 0.587, 0.114));
  yiq.x += (yiq.x - yL)*0.22*amt;
  vec2 ch = vec2(0.0); float w = 0.0;
  for(int i=0;i<6;i++){ float o = float(i)*2.3*amt + 1.5*amt; vec3 s = toY*S(su - px*o); float wi = 1.0 - float(i)/7.0; ch += s.yz*wi; w += wi; }
  yiq.yz = ch/w * (0.9 - 0.25*p3.x);
  vec3 col = frY*yiq;
  float ca = dot(cc, cc)*0.014*amt + gl*0.004;
  col.r = mix(col.r, S(su + vec2(ca, 0.0)).r, 0.5);
  col.b = mix(col.b, S(su - vec2(ca, 0.0)).b, 0.5);
  col = max(col, 0.0) * vec3(1.03, 1.0, 0.9);
  col = col*0.94 + 0.028;
  float g1 = h12(uv*res + vec2(fr*1.618, fr*2.414)) - 0.5;
  float g2 = h12(floor(uv*res*0.5) + vec2(fr*3.1, fr*1.7)) - 0.5;
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  float gAmt = amt*(1.0 + p1.w*1.4 + p3.x*0.6);
  col += (g1*0.075 + g2*0.055)*(0.55 + 0.9*(1.0 - lum))*gAmt;
  col += vec3(g2, -g2*0.5, g1*0.6)*0.018*amt;
  col *= 1.0 - 0.075*amt*(0.5 + 0.5*sin(uv.y*res.y*3.14159));
  float dro = step(0.9994 - gl*0.01, h12(vec2(ln, fr*1.3))) * step(0.8, h12(vec2(floor(uv.x*40.0 + fr*7.0), ln)));
  col = mix(col, vec3(0.85), dro*0.6*min(amt, 1.0));
  col += band*0.05*amt*h12(vec2(uv.x*300.0, fr));
  if(p1.w > 0.0){ float l = dot(col, vec3(0.3, 0.59, 0.11)); float nl = max(l, 0.0)*2.2; vec3 nvc = vec3(0.3, 1.0, 0.38)*(nl/(nl + 0.45))*1.25 + g1*0.12; col = mix(col, nvc, p1.w); }
  float r = length(cc);
  col *= 1.0 - 0.55*pow(r*1.3, 2.6)*min(amt, 1.2) - 0.4*p3.x*pow(r*1.5, 2.0);
  col = mix(col, vec3(0.42, 0.0, 0.0), clamp(p2.x*pow(r*1.7, 1.5), 0.0, 1.0));
  col = mix(col, vec3(0.0), p2.y);
  col = mix(col, vec3(1.0), p2.z);
  gl_FragColor = vec4(col, 1.0);
}`;

function registerShaders() {
  const S = BABYLON.Effect.ShadersStore;
  S.envVertexShader = SH.envV; S.envFragmentShader = SH.envF;
  S.fixVertexShader = SH.fixV; S.fixFragmentShader = SH.fixF;
  S.dtexVertexShader = SH.dtexV; S.dtexFragmentShader = SH.dtexF; S.actVertexShader = SH.actV; S.actFragmentShader = SH.actF; S.scrFragmentShader = SH.scrF;
  S.beamVertexShader = SH.beamV; S.beamFragmentShader = SH.beamF;
  S.dustVertexShader = SH.dustV; S.dustFragmentShader = SH.dustF;
  S.vhsFragmentShader = SH.vhsF;
  S.skinVertexShader = SH.skinV; S.skinFragmentShader = SH.skinF; S.mdlVertexShader = SH.mdlV; S.mdlFragmentShader = SH.mdlF;
  S.env9VertexShader = SH.env9V; S.coneVertexShader = SH.coneV; S.coneFragmentShader = SH.coneF;
}
