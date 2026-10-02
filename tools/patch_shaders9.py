s=open('/data/backrooms/src/shaders.js').read()
def rep(a,b):
    global s
    assert a in s, a[:60]
    s=s.replace(a,b,1)
rep("""SH.envF = `precision highp float;
#define CEIL ${CEIL.toFixed(3)}
varying vec3 vPos; varying vec3 vN; varying vec3 vT; varying vec2 vUV;""","""SH.envF = `precision highp float;
#define CEIL ${CEIL.toFixed(3)}
varying vec3 vPos; varying vec3 vN; varying vec3 vT; varying vec2 vUV;
#ifdef VCOL
varying vec4 vC;
#endif""")
rep("""  vec3 V = normalize(camPos - p);
  vec3 alb = texture2D(albedoTex, vUV).rgb; alb *= alb;
  vec3 nm = texture2D(normalTex, vUV).xyz*2.0 - 1.0;""","""  vec3 V = normalize(camPos - p);
#ifdef TWOSIDE
  if(dot(gn, V) < 0.0){ gn = -gn; B = cross(gn, T); }
#endif
  vec2 uv0 = vUV;
#ifdef ROTUV
  uv0 = vUV.yx;
#endif
  vec3 alb = texture2D(albedoTex, uv0).rgb; alb *= alb;
  vec3 nm = texture2D(normalTex, uv0).xyz*2.0 - 1.0;""")
L9MAT = r"""#ifdef MAT_ASPH
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
  float far = step(hash13(vec3(gl_FragCoord.xy, 7.0)), 0.3 * (1.0 - smoothstep(18.0, 36.0, d0)));
  if(mix(exact, far, smoothstep(3.5, 8.0, d0)) < 0.5) discard;
  alb = vec3(0.5, 0.52, 0.5); nm = vec3(0.0, 0.0, 1.0); specK = 0.5; shin = 30.0;
#endif
#ifdef VCOL
  alb *= vC.rgb*vC.rgb;
#endif
  nm.xy *= nStr;"""
rep("  nm.xy *= nStr;", L9MAT)
rep("""#ifdef MAT_FLOOR
  col += fixCol * L * specK * 0.05 * pow(1.0 - max(V.y, 0.0), 4.0);
#endif""","""#if defined(MAT_FLOOR) || defined(MAT_WOOD) || defined(MAT_TILE)
  col += fixCol * L * specK * 0.05 * pow(1.0 - max(V.y, 0.0), 4.0);
#endif
#ifdef MAT_ASPH
  col += fixCol * L * specK * 0.09 * pow(1.0 - max(V.y, 0.0), 3.0);
#endif""")
rep("""SH.fixV = `""","""SH.env9V = `precision highp float;
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

SH.fixV = `""")
rep("""  S.vhsFragmentShader = SH.vhsF;""","""  S.vhsFragmentShader = SH.vhsF;
  S.env9VertexShader = SH.env9V; S.coneVertexShader = SH.coneV; S.coneFragmentShader = SH.coneF;""")
open('/data/backrooms/src/shaders.js','w').write(s)
print('ok', s.count('MAT_CHAIN'))
