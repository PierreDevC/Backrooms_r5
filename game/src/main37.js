// ---------- r8 · Level 37 · Sublimity: arrival, water physics (wading, swimming, diving, falling), breath, drift, flow and endings ----------
const G37 = { from: null };
const BREATH37 = [48, 32, 22];   // seconds underwater before you start to drown, by difficulty
function resetG37() {
  const from = G37.from; for (const k of Object.keys(G37)) delete G37[k];
  Object.assign(G37, { from, phase: 'arrive', breath: 1, ey: 1.6, vy: 0, under: false, wasDepth: 0, falling: false, onTower: false, tilt: 0, drift: 0, driftT: 0, dryT: 0, hatchOpen: false, flood: 0, endWon: false, ending: '',
    splashCd: 0, bubbleT: 0, ambT: 12, voiceT: 40, lastSafe: null, introSwim: true, warns: {}, hum: null, amb: null });
}
resetG37();
DEATH_TXT.drown = ['DROWNED', 'The picture goes blue, then goes quiet. The date keeps counting.'];
DEATH_TXT.fish = ['SOMETHING IN THE WATER', 'The last frames are a lens full of teeth and then nothing at all.'];
DEATH_TXT.drift = ['STILL RECORDING', 'The tape runs for hours more. Nobody is holding the camera.'];
function carryFrom18() { return carryFrom9(); }
function teardown37() {
  for (const k of ['hum', 'amb']) { const v = G37[k]; if (v) { try { v.src && v.src.stop(); (v.v ? v.v.g : v.g).disconnect(); v.bed && v.bed.disconnect(); } catch (e) {} G37[k] = null; } }
  PL.spdK = 1; PL.load = false; document.body.classList.remove('lvl37'); $('breath37').classList.add('hide'); try { stopFlood37 && stopFlood37(); } catch (e) {}
}
async function goLevel37(from) {
  const f = Object.assign({ hp: 100, san: 100, batt: [100, 90, 75][G.diff], spare: [2, 1, 1][G.diff], water: [3, 1, 1][G.diff], time: 0, dist: 0, lost: 0, tapes: 4 }, from || G37.from || {});
  G37.from = Object.assign({}, f);
  G.state = 'loading'; show('loading'); $('osd').classList.add('hide'); $('touch').classList.add('hide'); $('blue').classList.add('hide');
  $('loadOsd').textContent = '▶ LEVEL 37 · SUBLIMITY'; $('loadFill').style.width = '0%';
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  teardownScene();
  LVL = 37; setDims(L37_N, L37_LMR); document.body.classList.remove('lvl9', 'lvl5', 'lvl18'); document.body.classList.add('lvl37'); AU.remap = null;
  resetG37(); resetP37(); tasksReset('LEVEL 37 · SUBLIMITY');
  const prog = (p, m) => { $('loadFill').style.width = (p * 100).toFixed(0) + '%'; $('loadMsg').textContent = m; };
  RNG = mulberry32((Math.random() * 4294967296) >>> 0);
  await buildWorld37(prog);
  setupPost(+S.qual); applySettings();
  Object.assign(PL, { x: W37.pos.arrive.x, z: W37.pos.arrive.z, yaw: 0, pitch: 0, vx: 0, vz: 0, kx: 0, kz: 0, crouch: false, ck: 0, sta: 1, exh: false,
    hp: Math.max(f.hp, 75), san: Math.max(f.san, 75), batt: Math.max(f.batt, 60), spare: f.spare, water: f.water, flash: false, fk: 0, nv: false, zoomT: false, zk: 0,
    noise: 0, dist: f.dist, lastHurt: -99, shake: 0, cell: -1, fear: 0, lookAt: null, lookK: 0, focus: null, interf: 0, spdK: 1, load: false });
  updateField();
  Object.assign(G, { time: f.time, lost: f.lost, tapes: f.tapes, cause: '', blackout: 0, exitOn: false, chase: 0, hintT: 0, grace: 0 });
  HINT.stage = 0; HINT.site = null;
  initAI37();
  Object.assign(FX, { envA: [0.2, 0.26, 0.28, 0], envS: [0.0, 0.0, 0.0, 0], fadeW: 1, fadeB: 0 });
  G37.ey = LV.basins[0].y + 0.22; CAM.position.set(PL.x, 1.6, PL.z); CAM.rotation.set(0, PL.yaw, 0); CAM.getViewMatrix(true); worldFX37(0.016); pushUniforms();
  await new Promise(r => SCN.executeWhenReady(() => r()));
  prog(1, 'READY'); await nextFrame();
  try { localStorage.setItem('br_l37', '1'); } catch (e) {}
  hideScreens(); G.state = 'intro'; INTRO.t = 0; SFX.tape();
}
function startLevel37Menu() {
  if (G.state !== 'title') return;
  audioInit(S.vol); if (AU.ctx.state === 'suspended') AU.ctx.resume();
  applySettings(); lockPointer(); G37.from = null; goLevel37(null);
}
// arrival: you come up from underneath, through the surface, into a room that is much too bright
function introCam37(dt) {
  INTRO.t += dt; const t = INTRO.t, k = smooth(0.4, 4.2, t), W0 = LV.basins[BAS37.SH].y;
  FX.fadeW = 1 - smooth(0.2, 2.6, t); FX.fadeB = 0;
  const y = lerp(W0 - 1.7, 1.6 + W0 * 0, smooth(1.5, 4.6, t)), sw = t < 2.4 ? -0.45 + 0.3 * smooth(0.5, 2.4, t) : 0;
  CAM.position.set(PL.x, y, PL.z); CAM.rotation.set(lerp(-1.2, 0, k), PL.yaw, Math.sin(t * 1.4) * 0.05 * (1 - k)); CAM.fov = S.fov * Math.PI / 180;
  G37.ey = y; G37.under = y < W0 - 0.02; FX.under = G37.under ? 1 : 0;
  if (t > 0.6 && !G37.introSnd) { G37.introSnd = true; SFX37.surface(); }
  if (t > 4.9) beginPlay37();
}
function beginPlay37() {
  G.state = 'play'; FX.fadeW = FX.fadeB = 0; PL.pitch = 0; $('osd').classList.remove('hide'); if (IS_TOUCH) $('touch').classList.remove('hide');
  G37.introSwim = false; setPhase37('arrive'); cpSave('LEVEL START', { x: PL.x, z: PL.z, yaw: PL.yaw, quiet: true }); arrive37();
}

// ----- the water around the player: depth, wading, swimming, diving, falling -----
function waterPhys37(dt) {
  const play = G.state === 'play', t = FX.t, c = cell37(PL.x, PL.z), fh = LV.fh[c], b = LV.bas[c], W0 = b >= 0 ? LV.basins[b].y : -99, depth = b >= 0 ? Math.max(0, W0 - fh) : 0;
  const swim = depth > 1.3, standEye = fh + lerp(1.62, 1.03, PL.ck), bobY = CAM.position.y - lerp(1.62, 1.03, PL.ck);
  // on the tower the player stands on the platform; leaving it by the open edge is a fall
  if (play) towerPhys37();
  let ey = G37.ey, vy = G37.vy;
  const surf = W0 + 0.22 + 0.025 * Math.sin(t * 1.7), floorMin = fh + 0.45;
  const support = swim ? surf : standEye;
  if (!play) { /* hold */ }
  else if (ey > support + 0.35 && !G37.onTower) {   // nothing under you: fall
    vy -= 9.8 * dt; ey += vy * dt; G37.falling = true;
    if (swim && ey <= surf) { G37.falling = false; splash37(Math.min(1.5, Math.abs(vy) / 8)); vy *= 0.55; }
    else if (!swim && ey <= standEye) { G37.falling = false; if (vy < -4) { PL.hp -= Math.max(0, (-vy - 6) * 5); FX.hurt = 0.6; PL.shake = 0.8; SFX.thunk && SFX.thunk(); } vy = 0; ey = standEye; }
  } else if (swim) {
    G37.falling = false;
    const fwd = clamp(PL.spd, 0, 2.6), want = -Math.sin(PL.pitch) * fwd * 0.95 + (PL.crouch ? -0.6 : 0.42) * (G37.under ? 1 : 0.9);
    vy = damp(vy, want, 2.6, dt); ey += vy * dt;
    if (ey > surf) { ey = damp(ey, surf, 12, dt); if (vy > 0) vy = 0; }
    ey = Math.max(ey, floorMin);
  } else { G37.falling = false; ey = damp(ey, standEye, 11, dt); vy = 0; }
  G37.ey = ey; G37.vy = vy;
  CAM.position.y = ey + bobY * (swim ? 0.3 : 1);
  G37.wasDepth = depth;
  // under the surface?
  const wasUnder = G37.under, under = b >= 0 && CAM.position.y < W0 - 0.03;
  G37.under = under; FX.under = damp(FX.under || 0, under ? 1 : 0, 14, dt);
  if (under !== wasUnder && play) { under ? splash37(0.35) : (SFX37.breathe(), G37.bubbleT = 0); }
  // breath
  if (play) {
    const max = BREATH37[G.diff];
    if (under) { G37.breath = Math.max(0, G37.breath - dt / max); G37.bubbleT -= dt; if (G37.bubbleT <= 0) { G37.bubbleT = rnd(1.4, 2.6); SFX37.bubbles(); } PL.fear = Math.max(PL.fear, G37.breath < 0.35 ? 0.5 : 0); }
    else G37.breath = Math.min(1, G37.breath + dt * 0.55);
    if (G37.breath < 0.3 && under) { FX.glitch = Math.max(FX.glitch, 0.25 + (0.3 - G37.breath)); if (!G37.warns.low) { G37.warns.low = true; toast('BREATHE · SWIM UP', 2); } }
    if (G37.breath > 0.6) G37.warns.low = false;
    if (under && G37.breath <= 0) { PL.hp -= dt * 16; FX.hurt = Math.max(FX.hurt, 0.6); PL.shake = Math.max(PL.shake, 0.5); if (PL.hp <= 0) { PL.hp = 0; die('drown'); } }
    $('breath37').classList.toggle('hide', !(under || G37.breath < 0.99));
    const f = $('breathFill'); if (f) { f.style.width = (G37.breath * 100).toFixed(0) + '%'; f.parentNode.classList.toggle('low', G37.breath < 0.3); }
  }
  // movement in the water: slower the deeper it is, no sprinting
  PL.spdK = (depth < 0.15 ? 1 : depth < 0.9 ? 0.84 : swim ? (under ? 0.58 : 0.66) : 0.72) * (G37.drag || 1);
  PL.load = depth > 0.5;
  // wading splashes
  G37.splashCd -= dt;
  if (play && PL.spd > 0.4 && depth > 0.05 && depth <= 1.3 && G37.splashCd <= 0) { G37.splashCd = PL.run ? 0.28 : 0.46; SFX37.wade(depth); }
  if (depth > 0.05 && G37.wasWet !== true) { G37.wasWet = true; if (play) SFX37.splashSoft(); } else if (depth <= 0.05) G37.wasWet = false;
}
function splash37(k) { SFX37.splash(k); PL.shake = Math.max(PL.shake, 0.3 * k); FX.glitch = Math.max(FX.glitch, 0.2 * k); makeNoise(0.2 + 0.2 * k); }
// the ten-metre tower: climb it by the ladder (a lift with a fade), stand on top, step off the open edge
function towerPhys37() {
  const T = W37.tower; if (!T) return;
  if (G37.onTower) {
    const dx = PL.x - T.cx, dz = PL.z - T.cz;
    if (PL.x > T.cx + CELL / 2 - 0.2) {   // you walked off the open edge
      G37.onTower = false; for (const i of [...T.edge, T.gap]) LV.solids[i].off = false; G37.ey = T.top + 1.62; G37.vy = 1.0; G37.falling = true; toast('', 0.01);
    } else { G37.ey = damp(G37.ey, T.top + lerp(1.62, 1.03, PL.ck), 12, 0.016); }
  }
}
function climbTower37() {
  const T = W37.tower; if (!T || G37.onTower || G.state !== 'play') return;
  G37.climb = { t: 0 }; SFX37.ladder(); makeNoise(0.1);
}
function updateClimb37(dt) {
  const C = G37.climb; if (!C) return; C.t += dt; const T = W37.tower;
  FX.fadeB = C.t < 0.9 ? C.t / 0.9 : Math.max(0, 1 - (C.t - 1.5) / 0.7);
  if (!C.moved && C.t >= 0.9) { C.moved = true; PL.x = T.cx - 0.6; PL.z = T.cz; PL.yaw = Math.PI / 2; PL.pitch = 0.1; PL.vx = PL.vz = 0; PL.cell = -1; G37.onTower = true; G37.ey = T.top + 1.62; G37.vy = 0; LV.solids[T.gap].off = true; updateField(); toast('THE EDGE IS OPEN TO THE EAST · TEN METRES', 3); }
  if (C.t > 2.2) { G37.climb = null; FX.fadeB = 0; }
}

// ----- per-frame story events -----
function gameEvents37(dt) {
  places37Events(dt);
  waterPhys37(dt); updateClimb37(dt); basins37(dt);
  const pc = cell37(PL.x, PL.z), z = LV.zone[pc];
  // the Scape: serenity and drift. Floating still in warm water steadies you and pulls at you; moving on and doing things pushes it back.
  drift37(dt, z);
  // ambient: the filters, the odd drip, a far door
  G37.ambT -= dt; if (G37.ambT <= 0) { G37.ambT = rnd(14, 30); SFX37.far(P9({ x: PL.x + rnd(-24, 24), y: 2, z: PL.z + rnd(-24, 24) })); }
  // whispers when sanity is low
  G37.voiceT -= dt;
  if (G37.voiceT <= 0 && PL.san < 45) { G37.voiceT = rnd(20, 38); SFX.whisper(); say('', pick(W37_WHISPER), { dur: 4, mode: 'whisper' }); }
  if (G37.flood) floodTick37(dt);
}
const W37_WHISPER = ['…you can put it down for a minute…', '…the water is the same temperature as you…', '…count the tiles, it helps…', '…nobody is timing this…', '…you were going somewhere…', '…it\'s only water…'];
function drift37(dt, z) {
  const moving = PL.spd > 0.45, inWater = depth37(PL.x, PL.z) > 0.2 && !G37.under, k = [0.7, 1, 1.35][G.diff];
  if (G.state !== 'play') return;
  if (inWater && !moving && !G37.flood) { G37.drift = Math.min(1, G37.drift + dt / 38 * k); PL.san = Math.min(100, PL.san + dt * 1.4); }
  else G37.drift = Math.max(0, G37.drift - dt / 14);
  if (G37.drift > 0.6 && !G37.warns.drift) { G37.warns.drift = true; toast('IT IS VERY PLEASANT HERE · KEEP MOVING', 3); }
  if (G37.drift < 0.3) G37.warns.drift = false;
  FX.drift = G37.drift;
  if (G37.drift >= 1) {   // the Scape carries you: you come to in the shallows with the clock moved on
    G37.drift = 0; G37.warns.drift = false; FX.fadeB = 1; G.time += 600; later(0.2, () => { PL.x = W37.pos.arrive.x + rnd(-2, 2); PL.z = W37.pos.arrive.z + rnd(-2, 2); PL.cell = -1; G37.ey = 1.2; G37.vy = 0; updateField(); FX.fadeB = 0; FX.fadeW = 1; toast('THE CLOCK SAYS TEN MINUTES LATER', 3.4); say('M.E.G. OUTPOST 9', 'Nine. Your carrier dropped for a while. Keep moving.', { radio: true, delay: 1.5 }); });
  }
}
function basins37(dt) {
  for (const B of LV.basins) {
    if (!B.mesh) continue;
    const d = B.tgt - B.y; if (Math.abs(d) > 0.0005) { const sp = B.speed || 0.11; B.y += Math.sign(d) * Math.min(Math.abs(d), sp * dt); B.mesh.position.y = B.y; if (B.caust) B.caust.mat.setVector4('wP', new BABYLON.Vector4(1, 1, B.y, 0)); }
    if (B.caust && !B.caust.init) { B.caust.init = true; B.caust.mat.setVector4('wP', new BABYLON.Vector4(1, 1, B.y, 0)); }
  }
  const t = FX.t;
  for (const f of W37.bob) { const fh = LV.fh[cell37(f.x || f.n.position.x, f.z || f.n.position.z)], by = f.b.y, y = Math.max(by, fh) + f.dy + (by > fh ? 0.025 * Math.sin(t * 1.3 + f.ph) : 0); f.n.position.y = y; if (!f.n.__rope) f.n.rotation.z = by > fh ? 0.05 * Math.sin(t * 0.9 + f.ph) : 0; }
}

// ----- per-frame world effects -----
function worldFX37(dt) {
  const t = FX.t, cp = CAM.position, live = G.state === 'play' || G.state === 'dead' || G.state === 'won', z = LV.zone[cell37(cp.x, cp.z)], under = FX.under || 0;
  FX.flicker = 0.9 + 0.1 * hash1(Math.floor(t * 30)); FX.lightScale = 1; FX.hurt = Math.max(0, FX.hurt - dt * 0.9); FX.glitch = Math.max(0, FX.glitch - dt * 1.3);
  const zl = zoneLook37(z), dark = LV.dark[cell37(cp.x, cp.z)];
  FX.fogDen = lerp(dark ? 0.05 : zl.den, 0.17, under); const fc = zl.fog;
  FX.fog[0] = lerp(fc[0], 0.04, under); FX.fog[1] = lerp(fc[1], 0.33, under); FX.fog[2] = lerp(fc[2], 0.4, under);
  FX.envA[0] = lerp(zl.amb[0], 0.04, under); FX.envA[1] = lerp(zl.amb[1], 0.14, under); FX.envA[2] = lerp(zl.amb[2], 0.18, under);
  if (live) FX.exposure = 0.96 * S.bright * lerp(1, clamp(0.3 / Math.max(PL.light, 0.01), 0.22, 1), FX.nv);
  if (W37.lensFl) setEmi(W37.lensFl, 3.2 * FX.flicker);
  if (W.itemMat) setEmi(W.itemMat, 0.4 + 0.8 * Math.max(0, Math.sin(t * 2.6)) ** 6);
  G37.doorT = (G37.doorT || 0) - dt; if (G37.doorT <= 0) { G37.doorT = 0.25; for (const d of W9.doors) { const on = dist2(d.mx, d.mz, cp.x, cp.z) < d.cull; if (d.vis !== on) { d.vis = on; d.mesh.setEnabled(on); } } } updateDoors9(dt);
  // water sound and moving light
  if (W37.waterMat) W37.waterMat.setVector4('wP', new BABYLON.Vector4(1, 1, 0, 0));
  if (live) wlights37(dt);
  if (AU.ctx) audio37(dt, z, under);
  for (const m of LV.chunkMeshes) { const c = m.__c || (m.__c = m.getBoundingInfo().boundingBox.centerWorld.clone()); m._sortD = Math.hypot(c.x - cp.x, c.z - cp.z); }
}
// the look of each part of the level: fog colour/density and ambient light
function zoneLook37(z) {
  switch (z) {
    case Z37.POOL: return { fog: [0.72, 0.9, 0.92], den: 0.0055, amb: [0.34, 0.4, 0.42] };
    case Z37.CABANA: case Z37.BOOTH: case Z37.VEST: return { fog: [0.78, 0.84, 0.82], den: 0.009, amb: [0.3, 0.31, 0.29] };
    case Z37.PLANT: return { fog: [0.4, 0.48, 0.48], den: 0.014, amb: [0.2, 0.23, 0.23] };
    case Z37.TUNNEL: return { fog: [0.06, 0.13, 0.15], den: 0.045, amb: [0.07, 0.1, 0.11] };
    case Z37.HOTEL: case Z37.CAFE: return { fog: [0.62, 0.55, 0.44], den: 0.014, amb: [0.28, 0.24, 0.18] };
    case Z37.HOSP: return { fog: [0.72, 0.8, 0.78], den: 0.012, amb: [0.28, 0.32, 0.31] };
    case Z37.PARK: return { fog: [0.74, 0.8, 0.84], den: 0.014, amb: [0.32, 0.35, 0.38] };
    case Z37.DOME: return { fog: [0.1, 0.32, 0.42], den: 0.024, amb: [0.1, 0.18, 0.22] };
    case Z37.STAFF: return { fog: [0.24, 0.16, 0.09], den: 0.032, amb: [0.12, 0.08, 0.05] };
    case Z37.WWF: return { fog: [0.07, 0.26, 0.32], den: 0.04, amb: [0.09, 0.15, 0.18] };
    default: return { fog: [0.7, 0.86, 0.88], den: 0.012, amb: [0.3, 0.34, 0.36] };
  }
}

// ----- ending, win/lose screens -----
function win37(kind) {
  if (G.state !== 'play') return;
  G.state = 'won'; G37.ending = kind; DEATH.t = 0; DEATH.shown = false; clearSlot(0); $('prompt').classList.remove('show'); G37.wc = { x: CAM.position.x, y: CAM.position.y, z: CAM.position.z, yaw: CAM.rotation.y, pitch: CAM.rotation.x };
  SFX37.chime ? SFX37.chime() : 0;
}
function wonCam37(dt) {
  DEATH.t += dt; const t = DEATH.t, w = G37.wc; updateAI37(dt);
  if (G37.ending === 'surface') { CAM.position.set(w.x, w.y + smooth(0, 3, t) * 1.2, w.z); CAM.rotation.set(lerp(w.pitch, -0.9, smooth(0, 2.5, t)), w.yaw, 0); FX.fadeW = smooth(1.2, 4.2, t); }
  else { CAM.position.set(w.x, lerp(w.y, 0.12, smooth(0, 3.5, t)), w.z); CAM.rotation.set(lerp(w.pitch, 0.9, smooth(0, 3.5, t)), w.yaw + t * 0.03, Math.sin(t) * 0.04); FX.fadeB = smooth(2.2, 5, t); }
  if (t > 5.4 && !DEATH.shown) { DEATH.shown = true; showEnd37(true); }
}
function showEnd37(won) {
  if (document.pointerLockElement) document.exitPointerLock();
  $('osd').classList.add('hide'); $('touch').classList.add('hide'); G37.endWon = won; if (won) flags37();
  const [title, text] = won ? endCard37() : (DEATH_TXT[G.cause] || DEATH_TXT.drown);
  $('endKicker').textContent = won ? (G37.ending === 'stay' ? 'STILL WATER · END OF RECORDING' : 'SURFACED · END OF RECORDING') : '■ SIGNAL LOST · LEVEL 37';
  $('endTitle').textContent = title; $('endText').textContent = text;
  const st = [['TIME ON TAPE', fmtTC(G.time)], ['DISTANCE', Math.round(PL.dist) + ' M'], ['LEVEL', '37 · SUBLIMITY'], ['DIFFICULTY', DIFFS[G.diff]], ['WINGS', wingsDone37() + '/3']];
  $('endStats').innerHTML = st.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  $('btnAgain').textContent = won ? '▶ PLAY AGAIN (LEVEL 0)' : '▶ RETRY LEVEL 37'; show('end');
}
function hudObj37() { return G37.flood ? 'THE WATER IS RISING' : `WINGS ${wingsDone37()}/3`; }
function hudItems37() { const a = []; if (P37.keys.hotel) a.push('ROOM KEY'); if (P37.keys.hosp) a.push('DISCHARGE'); if (P37.keys.tape) a.push('VIDEO'); return a.join(' · ') || 'EMPTY HANDS'; }

if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { G37, W37, AI37, P37, LV37: () => LV, goLevel37, beginPlay37, worldFX37, gameEvents37, waterPhys37, depth37, floorY37, waterY37, cell37, Z37, BAS37, win37, climbTower37, setPhase37, target37, tasks37 }));
