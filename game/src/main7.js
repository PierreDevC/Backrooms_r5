// ---------- r10 · Level 7 · Thalassophobia: arrival, weather, the per-frame look, endings ----------
// Swimming, diving, falling and breath are Level 37's (waterPhys37, G37); this file adds the night, the storm and the dawn on top.
const GS7 = { from: null };
function resetGS7() {
  const from = GS7.from; for (const k of Object.keys(GS7)) delete GS7[k];
  Object.assign(GS7, { from, phase: 'arrive', storm: 0, stormTo: 0, dawn: 0, dawnTo: 0, flash: 0, lightT: 25, thunderT: 0, flareT: 0, flareCd: 0, beamA: 0, endWon: false, ending: '', ambT: 10, voiceT: 60, warns: {}, hum: null, amb: null, litEver: false, shadowSeen: 0 });
}
resetGS7();
DEATH_TXT.shadow = ['THE LONG SHADOW', 'The picture goes green, then black. Something very large passes the lens, slowly.'];
function carryFrom2() { return carryFrom9(); }
function teardown7() {
  for (const k of ['hum', 'amb']) { const v = GS7[k]; if (v) { try { v.src && v.src.stop(); v.g.disconnect(); } catch (e) {} GS7[k] = null; } }
  document.body.classList.remove('lvl7'); const r = $('rain7'); if (r) r.classList.add('hide'); const b = $('breath37'); if (b) b.classList.add('hide');
}
async function goLevel7(from) {
  const f = Object.assign({ hp: 100, san: 100, batt: [100, 90, 75][G.diff], spare: [2, 1, 1][G.diff], water: [3, 1, 1][G.diff], time: 0, dist: 0, lost: 0, tapes: 4 }, from || GS7.from || {});
  GS7.from = Object.assign({}, f);
  try { loadVoice7(); } catch (e) {}
  G.state = 'loading'; show('loading'); $('osd').classList.add('hide'); $('touch').classList.add('hide'); $('blue').classList.add('hide');
  $('loadOsd').textContent = '▶ LEVEL 7 · THALASSOPHOBIA'; $('loadFill').style.width = '0%';
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  teardownScene();
  LVL = 7; setDims(L7_N, L7_LMR); document.body.classList.remove('lvl9', 'lvl5', 'lvl18', 'lvl37', 'lvl2'); document.body.classList.add('lvl7'); AU.remap = null;
  resetGS7(); resetG37(); resetPS7(); tasksReset('LEVEL 7 · THALASSOPHOBIA');
  const prog = (p, m) => { $('loadFill').style.width = (p * 100).toFixed(0) + '%'; $('loadMsg').textContent = m; };
  RNG = mulberry32((Math.random() * 4294967296) >>> 0);
  await buildWorld7(prog);
  setupPost(+S.qual); applySettings();
  const sp = WS7.pos.raft || { x: cc7(30), z: cc7(39) };
  Object.assign(PL, { x: sp.x, z: sp.z, yaw: -Math.PI / 2 + 0.2, pitch: 0, vx: 0, vz: 0, kx: 0, kz: 0, crouch: false, ck: 0, sta: 1, exh: false,
    hp: Math.max(f.hp, 75), san: Math.max(f.san, 75), batt: Math.max(f.batt, 60), spare: f.spare, water: f.water, flash: false, fk: 0, nv: false, zoomT: false, zk: 0,
    noise: 0, dist: f.dist, lastHurt: -99, shake: 0, cell: -1, fear: 0, lookAt: null, lookK: 0, focus: null, interf: 0, spdK: 1, load: false });
  updateField();
  Object.assign(G, { time: f.time, lost: f.lost, tapes: f.tapes, cause: '', blackout: 0, exitOn: false, chase: 0, hintT: 0, grace: 0 });
  HINT.stage = 0; HINT.site = null;
  initAI7();
  Object.assign(FX, { envA: [0.07, 0.1, 0.15, 0], envS: [0.0, 0.0, 0.0, 0.2], fadeW: 0, fadeB: 1 });
  G37.ey = LV.basins[0].y + 0.22; CAM.position.set(PL.x, 0.2, PL.z); CAM.rotation.set(0, PL.yaw, 0); CAM.getViewMatrix(true); worldFX7(0.016); pushUniforms();
  await new Promise(r => SCN.executeWhenReady(() => r()));
  prog(1, 'READY'); await nextFrame();
  try { localStorage.setItem('br_l7', '1'); } catch (e) {}
  hideScreens(); G.state = 'intro'; INTRO.t = 0; SFX.tape();
}
function startLevel7Menu() {
  if (G.state !== 'title') return;
  audioInit(S.vol); if (AU.ctx.state === 'suspended') AU.ctx.resume();
  applySettings(); lockPointer(); GS7.from = null; goLevel7(null);
}
// arrival: you come to on a raft in a flat black sea, the rig's lights a long way off
function introCam7(dt) {
  INTRO.t += dt; const t = INTRO.t, k = smooth(1.0, 4.2, t);
  FX.fadeB = 1 - smooth(0.2, 2.0, t); FX.fadeW = 0;
  const y = lerp(0.18, 0.62, smooth(1.0, 4.4, t)) + Math.sin(t * 1.3) * 0.03;
  CAM.position.set(PL.x, y, PL.z); CAM.rotation.set(lerp(-0.7, -0.02, k), PL.yaw + (1 - k) * 0.6, Math.sin(t * 0.9) * 0.05 * (1 - k)); CAM.fov = S.fov * Math.PI / 180;
  G37.ey = y; G37.under = false; FX.under = 0;
  if (t > 0.5 && !GS7.introSnd) { GS7.introSnd = true; SFX37.breathe(); SFX7.foghorn({ x: PL.x + 40, y: 4, z: PL.z - 60, pl: { x: PL.x, z: PL.z } }); }
  if (t > 5.0) beginPlay7();
}
function beginPlay7() {
  G.state = 'play'; FX.fadeW = FX.fadeB = 0; PL.pitch = 0; $('osd').classList.remove('hide'); if (IS_TOUCH) $('touch').classList.remove('hide');
  G37.ey = LV.basins[0].y + 0.22; G37.vy = 0; setPhase7('arrive'); cpSave('LEVEL START', { x: PL.x, z: PL.z, yaw: PL.yaw, quiet: true }); arrive7();
}
// ----- per-frame story events -----
function gameEvents7(dt) {
  places7Events(dt);
  waterPhys37(dt);
  weather7(dt); flare7(dt);
  const c = cell7(PL.x, PL.z), z = LV.zone[c];
  GS7.ambT -= dt; if (GS7.ambT <= 0) { GS7.ambT = rnd(10, 22); SFX7.far(P9({ x: PL.x + rnd(-40, 40), y: 3, z: PL.z + rnd(-40, 40) })); }
  GS7.voiceT -= dt;
  if (GS7.voiceT <= 0 && PL.san < 45) { GS7.voiceT = rnd(22, 40); SFX.whisper(); say('', pick(W7_WHISPER), { dur: 4, mode: 'whisper' }); }
}
const W7_WHISPER = ['It\'s warmer further down.', 'Leave the light. It\'s only light.', 'Count the swells.', 'You could just let go of the ladder.', 'It knows the rig by its legs.'];
// ----- weather: the storm builds after the generator; the dawn comes after the lamp -----
function weather7(dt) {
  GS7.storm = damp(GS7.storm, GS7.stormTo, 0.12, dt); GS7.dawn = damp(GS7.dawn, GS7.dawnTo, 0.04, dt);
  const st = GS7.storm * (1 - GS7.dawn * 0.9);
  GS7.flash = Math.max(0, GS7.flash - dt * 2.4);
  if (st > 0.3 && G.state === 'play') {
    GS7.lightT -= dt;
    if (GS7.lightT <= 0) { GS7.lightT = rnd(9, 24) / st; GS7.flash = 1; GS7.thunderT = rnd(0.4, 2.2); }
    if (GS7.thunderT > 0 && (GS7.thunderT -= dt) <= 0) SFX7.thunder(null);
  }
  const r = $('rain7'); if (r) { const rm = LV.rooms[LV.room[cell7(PL.x, PL.z)]]; r.classList.toggle('hide', !(st > 0.35) || G37.under || !(rm && rm.open)); r.style.opacity = String(clamp(st, 0, 1) * 0.7); }
}
// ----- flares: G; a red light that holds the dark off for a while -----
function flare7(dt) {
  GS7.flareCd -= dt; if (GS7.flareT > 0) GS7.flareT -= dt;
  if (GS7.flareT > 0) {
    const t = FX.t, k = clamp(GS7.flareT / 6, 0, 1) * (0.8 + 0.2 * Math.sin(t * 31)); const p = GS7.flarePos;
    p.y = Math.max(p.y - dt * 0.25, 0.3); setSlot(1, p, 2.2 * k, null, 0, [1, 0.3, 0.2], 30, false, 0.3);
  } else clearSlot(1);
}
function useFlare7() {
  if (G.state !== 'play') return; if (G37.under) { toast('THE FLARE WON\'T LIGHT UNDER WATER', 1.6); return; } if (PS7.flares <= 0) { toast('NO FLARES', 1.4); return; } if (GS7.flareCd > 0) return;
  PS7.flares--; GS7.flareCd = 3; GS7.flareT = 45; GS7.flarePos = { x: PL.x, y: Math.max(CAM.position.y, 1.2), z: PL.z }; SFX7.flare({ x: PL.x, y: 1.5, z: PL.z, pl: { x: PL.x, z: PL.z } }); makeNoise(0.3); toast('FLARE · ' + PS7.flares + ' LEFT', 2);
  const sh = AIS7.shadow; if (sh && sh.d < 55) sh.scare(20);
}
// ----- per-frame world effects -----
function worldFX7(dt) {
  const t = FX.t, cp = CAM.position, live = G.state === 'play' || G.state === 'dead' || G.state === 'won', c = cell7(cp.x, cp.z), z = LV.zone[c], under = FX.under || 0, st = GS7.storm * (1 - GS7.dawn * 0.9), dn = GS7.dawn;
  FX.flicker = 0.92 + 0.08 * hash1(Math.floor(t * 24)); FX.lightScale = 1; FX.hurt = Math.max(0, FX.hurt - dt * 0.9); FX.glitch = Math.max(0, FX.glitch - dt * 1.3);
  const zl = zoneLook7(z, st, dn), W0 = LV.bas[c] >= 0 ? LV.basins[LV.bas[c]].y : 0, dep = clamp(-(cp.y - W0) / 14, 0, 1), fl = GS7.flash;
  FX.fogDen = lerp(zl.den, lerp(0.04, 0.085, dep), under);
  for (let i = 0; i < 3; i++) { FX.fog[i] = lerp(zl.fog[i] + fl * 0.25, [0.02, 0.08, 0.13][i] * (1 - dep * 0.85), under); FX.envA[i] = lerp(zl.amb[i] + fl * 0.3, [0.05, 0.12, 0.19][i] * (1 - dep * 0.7), under); }
  { const mn = [0.5, 0.62, 0.95], sm = [0.22, 0.28, 0.42], dw = [1.0, 0.8, 0.66]; for (let i = 0; i < 3; i++) FX.envS[i] = lerp(lerp(mn[i], sm[i], st), dw[i], dn) * (1 - under) * (1 + fl * 2.5); FX.envA[3] = 0; FX.envS[3] = 0.2; }
  if (live) FX.exposure = 0.9 * S.bright * lerp(1, clamp(0.3 / Math.max(PL.light, 0.01), 0.22, 1), FX.nv) * (1 + fl * 0.3);
  FX.ambBoost *= 0.3; FX.exposure *= lerp(1, 0.3, FX.nv);
  SCN.clearColor.set(lerp(0.02, 0.5, dn) + fl * 0.2, lerp(0.03, 0.42, dn) + fl * 0.2, lerp(0.06, 0.4, dn) + fl * 0.25, 1);
  if (WS7.skyMat) { const k = 1 - st * 0.55; WS7.skyMat.setVector4('sP', new BABYLON.Vector4(lerp(1, 1.9, dn) * k + fl * 1.2, lerp(1, 1.4, dn) * k + fl * 1.2, lerp(1, 1.0, dn) * k + fl * 1.4, 1)); WS7.glowMat.setVector4('sP', new BABYLON.Vector4(1, 1, 1, dn * 0.9)); WS7.sky.position.copyFrom(cp); WS7.glow.position.copyFrom(cp); }
  if (WS7.waterMat) WS7.waterMat.setVector4('wP', new BABYLON.Vector4(1, 1.4 + st * 2.4, 0, 0));
  if (W.itemMat) setEmi(W.itemMat, 0.4 + 0.8 * Math.max(0, Math.sin(t * 2.6)) ** 6);
  if (WS7.lensFl) setEmi(WS7.lensFl, 3.0 * FX.flicker * (Math.sin(t * 11) > -0.5 ? 1 : 0.15));
  GS7.doorT = (GS7.doorT || 0) - dt; if (GS7.doorT <= 0) { GS7.doorT = 0.25; for (const d of W9.doors) { const on = dist2(d.mx, d.mz, cp.x, cp.z) < d.cull; if (d.vis !== on) { d.vis = on; d.mesh.setEnabled(on); } } } updateDoors9(dt);
  // on a platform in a swell the world leans a little
  if (live && !under && LV.fh[c] > 1) CAM.rotation.z += Math.sin(t * 0.55) * 0.004 * (1 + st * 3) + Math.sin(t * 0.9 + 1) * 0.002 * st;
  beam7(dt); if (live) wlights7(dt);
  if (AU.ctx) audio7(dt, z, under);
  for (const m of LV.chunkMeshes) { const cc = m.__c || (m.__c = m.getBoundingInfo().boundingBox.centerWorld.clone()); m._sortD = Math.hypot(cc.x - cp.x, cc.z - cp.z); }
}
// the look of each part of the level: fog colour/density and ambient light, by weather
function zoneLook7(z, st, dn) {
  const inside = z === ZS7.QUART || z === ZS7.GEN || z === ZS7.AIR || z === ZS7.SHIPIN || z === ZS7.TOWER || z === ZS7.COTTAGE || z === ZS7.LAMP || z === ZS7.SHED || z === ZS7.BRIDGE || z === ZS7.ENGINE;
  if (z === ZS7.HAB || z === ZS7.WRECK || z === ZS7.POCKET) return { fog: [0.04, 0.1, 0.13], den: 0.036, amb: [0.1, 0.18, 0.22] };
  if (inside) return { fog: [0.1, 0.08, 0.06], den: 0.03, amb: [0.22, 0.19, 0.15] };
  const night = { fog: [0.045, 0.065, 0.1], den: 0.011, amb: [0.16, 0.2, 0.29] }, storm = { fog: [0.05, 0.06, 0.07], den: 0.022, amb: [0.06, 0.07, 0.09] }, dawn = { fog: [0.6, 0.52, 0.46], den: 0.009, amb: [0.34, 0.32, 0.3] };
  const m = (a, b, k) => ({ fog: a.fog.map((v, i) => lerp(v, b.fog[i], k)), den: lerp(a.den, b.den, k), amb: a.amb.map((v, i) => lerp(v, b.amb[i], k)) });
  return m(m(night, storm, st), dawn, dn);
}
// ----- ending, win/lose screens -----
function win7(kind) {
  if (G.state !== 'play') return;
  G.state = 'won'; GS7.ending = kind; DEATH.t = 0; DEATH.shown = false; clearSlot(0); $('prompt').classList.remove('show'); GS7.wc = { x: CAM.position.x, y: CAM.position.y, z: CAM.position.z, yaw: CAM.rotation.y, pitch: CAM.rotation.x };
}
function wonCam7(dt) {
  DEATH.t += dt; const t = DEATH.t, w = GS7.wc; updateAI7(dt);
  if (GS7.ending === 'sail') { CAM.position.set(w.x, w.y, w.z); CAM.rotation.set(lerp(w.pitch, 0.05, smooth(0, 2, t)), w.yaw + Math.sin(t * 0.4) * 0.15, Math.sin(t * 0.8) * 0.03); FX.fadeW = smooth(3, 7, t); }
  else if (GS7.ending === 'deep') { CAM.position.set(w.x, w.y - smooth(0, 7, t) * 18, w.z); CAM.rotation.set(lerp(w.pitch, 0.5, smooth(0, 4, t)), w.yaw, 0); FX.under = 1; FX.fadeB = smooth(3, 7, t); }
  else { CAM.position.set(w.x, w.y, w.z); CAM.rotation.set(lerp(w.pitch, 0.1, smooth(0, 3, t)), w.yaw + t * 0.02, 0); FX.fadeW = smooth(4, 7.4, t) * 0.8; }
  if (t > 7.4 && !DEATH.shown) { DEATH.shown = true; showEnd7(true); }
}
function showEnd7(won) {
  if (document.pointerLockElement) document.exitPointerLock();
  $('osd').classList.add('hide'); $('touch').classList.add('hide'); GS7.endWon = won; if (won) flags7();
  const [title, text] = won ? endCard7() : (DEATH_TXT[G.cause] || DEATH_TXT.drown);
  $('endKicker').textContent = won ? ({ sail: 'THE CROSSING', keeper: 'KEEPER', deep: 'THE DEEP' }[GS7.ending] || 'THE LIGHT') + ' · END OF RECORDING' : '■ SIGNAL LOST · LEVEL 7';
  $('endTitle').textContent = title; $('endText').textContent = text;
  const st = [['TIME ON TAPE', fmtTC(G.time)], ['DISTANCE', Math.round(PL.dist) + ' M'], ['LEVEL', '7 · THALASSOPHOBIA'], ['DIFFICULTY', DIFFS[G.diff]], ['PARTS', partsDone7() + '/3'], ['LOGS', String(logCount7())]];
  $('endStats').innerHTML = st.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  $('btnAgain').textContent = won ? '▶ PLAY AGAIN (LEVEL 0)' : '▶ RETRY LEVEL 7'; show('end');
}
function hudObj7() { return PS7.lit ? 'THE LAMP IS LIT' : `LAMP PARTS ${partsDone7()}/3`; }
function hudItems7() { const a = []; if (PS7.flares > 0) a.push('FLARES ' + PS7.flares); if (PS7.fuel && !PS7.fuelSeated) a.push('FUEL'); if (PS7.motor && !PS7.motorSeated) a.push('MOTOR'); if (PS7.key) a.push('BOAT KEY'); return a.join(' · ') || 'EMPTY HANDS'; }
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { GS7, WS7, PS7, AIS7, LV7: () => LV, goLevel7, beginPlay7, worldFX7, gameEvents7, cell7, ZS7, BAS7, win7, setPhase7, target7, tasks7, useFlare7, loadVoice7, G37, waterPhys37, depth37, floorY37, SFX37 }));
