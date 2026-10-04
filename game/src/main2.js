// ---------- r9 · Level 2 · Pipe Dreams: arrival, heat, surges, the per-frame look, endings ----------
const GP2 = { from: null };
const SURGE2 = { every: [200, 160, 125], warn: 11, steam: [11, 13, 15], dmg: [3, 4.5, 6.5] };
function resetGP2() {
  const from = GP2.from; for (const k of Object.keys(GP2)) delete GP2[k];
  Object.assign(GP2, { from, phase: 'arrive', heat: 0, regs: 0, surge: null, surgeT: 9999, surges: 0, endWon: false, ending: '', ambT: 10, voiceT: 50, warns: {}, hum: null, amb: null, lift: null });
}
resetGP2();
DEATH_TXT.steam = ['SCALDED', 'The lens fogs white from the edges in. The audio is one long hiss, and then it isn\'t.'];
DEATH_TXT.heat = ['HEATSTROKE', 'The picture tilts slowly onto the plate floor and stays there, humming.'];
DEATH_TXT.hound = ['THE HOUND', 'Something low and fast fills the frame. The tape keeps the scraping for a while afterwards.'];
function carryFrom37() { return carryFrom9(); }
function teardown2() {
  for (const k of ['hum', 'amb']) { const v = GP2[k]; if (v) { try { v.src && v.src.stop(); v.g.disconnect(); } catch (e) {} GP2[k] = null; } }
  document.body.classList.remove('lvl2'); const h = $('heat2'); if (h) h.classList.add('hide');
}
async function goLevel2(from) {
  const f = Object.assign({ hp: 100, san: 100, batt: [100, 90, 75][G.diff], spare: [2, 1, 1][G.diff], water: [3, 1, 1][G.diff], time: 0, dist: 0, lost: 0, tapes: 4 }, from || GP2.from || {});
  GP2.from = Object.assign({}, f);
  try { loadVoice2(); } catch (e) {}
  G.state = 'loading'; show('loading'); $('osd').classList.add('hide'); $('touch').classList.add('hide'); $('blue').classList.add('hide');
  $('loadOsd').textContent = '▶ LEVEL 2 · PIPE DREAMS'; $('loadFill').style.width = '0%';
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  teardownScene();
  LVL = 2; setDims(L2_N, L2_LMR); document.body.classList.remove('lvl9', 'lvl5', 'lvl18', 'lvl37'); document.body.classList.add('lvl2'); AU.remap = null;
  resetGP2(); resetPP2(); tasksReset('LEVEL 2 · PIPE DREAMS');
  const prog = (p, m) => { $('loadFill').style.width = (p * 100).toFixed(0) + '%'; $('loadMsg').textContent = m; };
  RNG = mulberry32((Math.random() * 4294967296) >>> 0);
  await buildWorld2(prog);
  setupPost(+S.qual); applySettings();
  Object.assign(PL, { x: WP2.pos.arrive.x, z: WP2.pos.arrive.z, yaw: Math.PI, pitch: 0, vx: 0, vz: 0, kx: 0, kz: 0, crouch: false, ck: 0, sta: 1, exh: false,
    hp: Math.max(f.hp, 75), san: Math.max(f.san, 75), batt: Math.max(f.batt, 60), spare: f.spare, water: f.water, bars: f.bars ?? 0, drinks: f.drinks ?? 0, wiredT: 0, fedT: 0, flash: false, fk: 0, nv: false, zoomT: false, zk: 0,
    noise: 0, dist: f.dist, lastHurt: -99, shake: 0, cell: -1, fear: 0, lookAt: null, lookK: 0, focus: null, interf: 0, spdK: 1, load: false });
  updateField();
  Object.assign(G, { time: f.time, lost: f.lost, tapes: f.tapes, cause: '', blackout: 0, exitOn: false, chase: 0, hintT: 0, grace: 0 });
  HINT.stage = 0; HINT.site = null;
  initAI2();
  Object.assign(FX, { envA: [0.1, 0.08, 0.06, 0], envS: [0.0, 0.0, 0.0, 0.05], fadeW: 0, fadeB: 1 });
  CAM.position.set(PL.x, 0.2, PL.z); CAM.rotation.set(0, PL.yaw, 0); CAM.getViewMatrix(true); worldFX2(0.016); pushUniforms();
  await new Promise(r => SCN.executeWhenReady(() => r()));
  prog(1, 'READY'); await nextFrame();
  try { localStorage.setItem('br_l2', '1'); } catch (e) {}
  hideScreens(); G.state = 'intro'; INTRO.t = 0; SFX.tape();
}
function startLevel2Menu() {
  if (G.state !== 'title') return;
  audioInit(S.vol); if (AU.ctx.state === 'suspended') AU.ctx.resume();
  applySettings(); lockPointer(); GP2.from = null; goLevel2(null);
}
// arrival: up out of a floor drain, into the heat
function introCam2(dt) {
  INTRO.t += dt; const t = INTRO.t, k = smooth(1.2, 4.4, t);
  FX.fadeB = 1 - smooth(0.3, 1.6, t); FX.fadeW = 0;
  const y = lerp(-0.6, 1.6, smooth(1.0, 4.2, t));
  CAM.position.set(PL.x + Math.sin(t * 0.7) * 0.03, y, PL.z); CAM.rotation.set(lerp(-1.1, 0.05, k), PL.yaw, Math.sin(t * 1.1) * 0.06 * (1 - k)); CAM.fov = S.fov * Math.PI / 180;
  if (t > 0.5 && !GP2.introSnd) { GP2.introSnd = true; SFX2.hiss(null, 0.5, 2.5); SFX.thunk && SFX.thunk(); }
  if (t > 4.7) beginPlay2();
}
function beginPlay2() {
  G.state = 'play'; FX.fadeW = FX.fadeB = 0; PL.pitch = 0; $('osd').classList.remove('hide'); if (IS_TOUCH) $('touch').classList.remove('hide'); $('heat2').classList.remove('hide');
  setPhase2('arrive'); cpSave('LEVEL START', { x: PL.x, z: PL.z, yaw: PL.yaw, quiet: true }); arrive2();
}

// ----- heat: the tunnels cook you slowly; cold rooms, the office and shelters let you cool down -----
function heat2(dt) {
  if (G.state !== 'play') return;
  const c = cell2(PL.x, PL.z), r = LV.rooms[LV.room[c]], k = [0.7, 1, 1.3][G.diff], hot = LV.hot2[c] * (1 - GP2.regs * 0.18);
  let d = 0;
  if (r && r.cold) d = -0.07; else if (LV.safe2[c]) d = -0.025; else d = hot * 0.012 * k * (PL.run ? 1.8 : 1) - 0.002;
  if (GP2.surge && GP2.surge.st === 'steam' && !LV.safe2[c]) d += 0.03 * k;
  GP2.heat = clamp(GP2.heat + d * dt, 0, 1);
  if (GP2.heat > 0.75) { FX.glitch = Math.max(FX.glitch, (GP2.heat - 0.75) * 1.2); PL.fear = Math.max(PL.fear, 0.25); if (!GP2.warns.heat) { GP2.warns.heat = true; toast('TOO HOT · FIND A COLD STORE OR A SHELTER', 3); } }
  if (GP2.heat < 0.5) GP2.warns.heat = false;
  if (GP2.heat >= 1) { PL.hp -= dt * 3.5 * k; FX.hurt = Math.max(FX.hurt, 0.4); if (PL.hp <= 0) { PL.hp = 0; die('heat'); } }
  const f = $('heatFill'); if (f) { f.style.width = (GP2.heat * 100).toFixed(0) + '%'; f.parentNode.classList.toggle('low', GP2.heat > 0.75); }
}
// ----- surges: three knocks, a klaxon, then steam fills every tunnel that is not a shelter -----
function surge2(dt) {
  if (G.state !== 'play' || !PP2.surgesOn || GP2.regs >= 3) { if (GP2.surge && GP2.regs >= 3) endSurge2(); return; }
  const Su = GP2.surge;
  if (!Su) {
    GP2.surgeT -= dt;
    if (GP2.surgeT <= 0) { GP2.surge = { st: 'warn', t: 0, k: 0 }; GP2.surges++; SFX2.knock({ x: PL.x + 6, y: 2, z: PL.z, pl: { x: PL.x, z: PL.z } }, 3); later(1.6, () => SFX2.klaxon({ x: PL.x, y: 3, z: PL.z, pl: { x: PL.x, z: PL.z } })); surgeWarn2(); }
    return;
  }
  const S_ = Su; S_.t += dt; const c = cell2(PL.x, PL.z), safe = LV.safe2[c];
  if (S_.st === 'warn') { S_.k = 0.15 * Math.min(1, S_.t / SURGE2.warn); if (S_.t >= SURGE2.warn) { S_.st = 'steam'; S_.t = 0; SFX2.burst(null); for (const v of WP2.vents) if (dist2(v.x, v.z, PL.x, PL.z) < 20) SFX2.hiss({ x: v.x, y: 1, z: v.z, pl: { x: PL.x, z: PL.z } }, 1, 4); } }
  else if (S_.st === 'steam') {
    const dur = SURGE2.steam[G.diff] * (1 - GP2.regs * 0.25);
    S_.k = Math.min(1, S_.t / 1.5) * (1 - smooth(dur - 2, dur, S_.t));
    if (!safe) { PL.hp -= dt * SURGE2.dmg[G.diff] * (1 - GP2.regs * 0.3) * S_.k; FX.hurt = Math.max(FX.hurt, 0.5 * S_.k); PL.shake = Math.max(PL.shake, 0.2 * S_.k); if (!GP2.warns.scald) { GP2.warns.scald = true; toast('GET INTO A SHELTER', 2); } if (PL.hp <= 0) { PL.hp = 0; die('steam'); } }
    if (S_.t >= dur) endSurge2();
  }
}
function surgeWarn2() { toast(GP2.surges === 1 ? 'THREE KNOCKS · GET UNDER A GREEN LAMP' : 'THREE KNOCKS', 2.6); FX.glitch = Math.max(FX.glitch, 0.4); PL.shake = Math.max(PL.shake, 0.4); }
function endSurge2() { GP2.surge = null; GP2.warns.scald = false; GP2.surgeT = SURGE2.every[G.diff] + GP2.regs * 40 + rnd(-15, 15); }
// ----- per-frame story events -----
function gameEvents2(dt) {
  places2Events(dt); heat2(dt); surge2(dt); updateLift2(dt);
  const z = LV.zone[cell2(PL.x, PL.z)];
  GP2.ambT -= dt; if (GP2.ambT <= 0) { GP2.ambT = rnd(12, 26); SFX2.far(P9({ x: PL.x + rnd(-26, 26), y: 2, z: PL.z + rnd(-26, 26) })); }
  GP2.voiceT -= dt;
  if (GP2.voiceT <= 0 && PL.san < 45) { GP2.voiceT = rnd(22, 40); SFX.whisper(); say('', pick(W2_WHISPER), { dur: 4, mode: 'whisper' }); }
}
const W2_WHISPER = ['…you\'re on shift…', '…someone has to watch the gauges…', '…it\'s cooler further in…', '…put your card in…', '…take your helmet off, it\'s hot…'];
// ----- per-frame world effects -----
function worldFX2(dt) {
  const t = FX.t, cp = CAM.position, live = G.state === 'play' || G.state === 'dead' || G.state === 'won', c = cell2(cp.x, cp.z), z = LV.zone[c];
  FX.flicker = 0.88 + 0.12 * hash1(Math.floor(t * 24)); FX.lightScale = 1; FX.hurt = Math.max(0, FX.hurt - dt * 0.9); FX.glitch = Math.max(0, FX.glitch - dt * 1.3);
  const zl = zoneLook2(z), dark = LV.dark[c], Sg = GP2.surge, sk = Sg ? Sg.k * (LV.safe2[c] ? 0.25 : 1) : 0;
  FX.fogDen = lerp(dark ? 0.06 : zl.den, 0.32, sk);
  for (let i = 0; i < 3; i++) { FX.fog[i] = lerp(zl.fog[i], 0.62, sk); FX.envA[i] = lerp(zl.amb[i], 0.32, sk); }
  FX.envS[3] = 0.05;
  if (live) FX.exposure = 0.9 * S.bright * lerp(1, clamp(0.3 / Math.max(PL.light, 0.01), 0.22, 1), FX.nv);
  if (WP2.lensFl) setEmi(WP2.lensFl, 3.0 * FX.flicker * (Math.sin(t * 13) > -0.6 ? 1 : 0.1));
  if (WP2.red) setEmi(WP2.red, 3.2 * (0.85 + 0.15 * Math.sin(t * 2.1)), 0.5, 0.3);
  if (W.itemMat) setEmi(W.itemMat, 0.4 + 0.8 * Math.max(0, Math.sin(t * 2.6)) ** 6);
  GP2.doorT = (GP2.doorT || 0) - dt; if (GP2.doorT <= 0) { GP2.doorT = 0.25; for (const d of W9.doors) { const on = dist2(d.mx, d.mz, cp.x, cp.z) < d.cull; if (d.vis !== on) { d.vis = on; d.mesh.setEnabled(on); } } } updateDoors9(dt);
  if (WP2.water) WP2.water.material.setVector4('wP', new BABYLON.Vector4(0.85, 0.6, 0, 0));
  steam2(dt, sk);
  if (live) wlights2(dt);
  if (AU.ctx) audio2(dt, z);
  r2Frame();
}
function steam2(dt, sk) {
  const t = FX.t, surge = GP2.surge ? GP2.surge.k : 0;
  for (const v of WP2.vents) {
    if (!v.puffs) continue; const d = dist2(v.x, v.z, PL.x, PL.z), on = d < 22;
    for (const p of v.puffs) {
      p.m.setEnabled(on); if (!on) continue;
      const ph = (t * (0.25 + surge * 0.6) + p.ph) % 1, s = (0.3 + ph * 1.3) * (1 + surge * 1.8);
      p.m.position.set(v.x + Math.sin(ph * 5 + p.ph * 9) * 0.2, v.y + ph * (1.6 + surge * 1.2), v.z + Math.cos(ph * 4 + p.ph * 7) * 0.2); p.m.scaling.setAll(s);
      p.m.visibility = (1 - ph) * ph * 4 * (0.3 + surge * 0.6);
    }
  }
}
function zoneLook2(z) {
  switch (z) {
    case ZP2.GALL: case ZP2.WREG: return { fog: [0.12, 0.05, 0.035], den: 0.045, amb: [0.035, 0.018, 0.014] };
    case ZP2.SWITCH: return { fog: [0.06, 0.07, 0.065], den: 0.018, amb: [0.03, 0.035, 0.033] };
    case ZP2.HALL: case ZP2.TANK: return { fog: [0.14, 0.08, 0.04], den: 0.022, amb: [0.04, 0.026, 0.016] };
    case ZP2.LONG: return { fog: [0.045, 0.04, 0.035], den: 0.04, amb: [0.02, 0.018, 0.016] };
    case ZP2.COLD: return { fog: [0.4, 0.46, 0.5], den: 0.025, amb: [0.06, 0.07, 0.08] };
    case ZP2.OFFICE: return { fog: [0.1, 0.085, 0.06], den: 0.02, amb: [0.045, 0.04, 0.032] };
    case ZP2.SHELTER: return { fog: [0.04, 0.09, 0.05], den: 0.025, amb: [0.02, 0.04, 0.025] };
    default: return { fog: [0.08, 0.065, 0.045], den: 0.032, amb: [0.025, 0.021, 0.017] };
  }
}
// ----- endings -----
function win2(kind) {
  if (G.state !== 'play') return;
  G.state = 'won'; GP2.ending = kind; DEATH.t = 0; DEATH.shown = false; clearSlot(0); $('prompt').classList.remove('show'); GP2.wc = { x: CAM.position.x, y: CAM.position.y, z: CAM.position.z, yaw: CAM.rotation.y, pitch: CAM.rotation.x };
}
function wonCam2(dt) {
  DEATH.t += dt; const t = DEATH.t, w = GP2.wc; updateAI2(dt);
  if (GP2.ending === 'lift') { CAM.position.set(w.x, w.y + smooth(0.5, 7, t) * 4, w.z); CAM.rotation.set(lerp(w.pitch, -0.25, smooth(0, 3, t)), w.yaw, Math.sin(t * 9) * 0.004); FX.fadeW = smooth(4.5, 7, t); }
  else { CAM.position.set(w.x, w.y, w.z); CAM.rotation.set(lerp(w.pitch, 0.4, smooth(0, 3, t)), w.yaw, 0); FX.fadeB = smooth(2.5, 6, t); FX.glitch = Math.max(FX.glitch, smooth(1, 4, t) * 0.6); }
  if (t > 7.4 && !DEATH.shown) { DEATH.shown = true; showEnd2(true); }
}
function showEnd2(won) {
  if (document.pointerLockElement) document.exitPointerLock();
  $('osd').classList.add('hide'); $('touch').classList.add('hide'); GP2.endWon = won; if (won) flags2();
  const [title, text] = won ? endCard2() : (DEATH_TXT[G.cause] || DEATH_TXT.steam);
  $('endKicker').textContent = won ? (GP2.ending === 'shift' ? 'ON SHIFT · END OF RECORDING' : 'THE LIFT · END OF RECORDING') : '■ SIGNAL LOST · LEVEL 2';
  $('endTitle').textContent = title; $('endText').textContent = text;
  const st = [['TIME ON TAPE', fmtTC(G.time)], ['DISTANCE', Math.round(PL.dist) + ' M'], ['LEVEL', '2 · PIPE DREAMS'], ['DIFFICULTY', DIFFS[G.diff]], ['REGULATORS', GP2.regs + '/3'], ['SURGES', String(GP2.surges)]];
  $('endStats').innerHTML = st.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join('');
  $('btnAgain').textContent = won ? (GP2.ending === 'lift' ? '▶ CONTINUE · LEVEL 7' : '▶ PLAY AGAIN (LEVEL 0)') : '▶ RETRY LEVEL 2'; show('end');
}
function hudObj2() { return GP2.surge ? (GP2.surge.st === 'warn' ? 'SURGE COMING' : 'SURGE') : `REGULATORS ${GP2.regs}/3`; }
function hudItems2() { const a = []; if (PP2.crowbar) a.push('CROWBAR'); if (PP2.wheel && !PP2.regs.e) a.push('VALVE WHEEL'); if (PP2.idcard && !PP2.idGiven) a.push('ID CARD'); if (PP2.timecard) a.push('TIME CARD'); return a.join(' · ') || 'EMPTY HANDS'; }
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { GP2, WP2, AIP2, PP2, LV2: () => LV, goLevel2, beginPlay2, worldFX2, gameEvents2, cell2, ZP2, win2, setPhase2, target2, tasks2, endSurge2, loadVoice2 }));
