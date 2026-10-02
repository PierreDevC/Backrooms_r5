// ---------- player: input, movement, handheld camcorder, survival ----------
const S = Object.assign({ sens: 1, fov: 62, vhs: 1, bright: 1, vol: 0.8, qual: 1, inv: false },
  (() => { try { return JSON.parse(localStorage.getItem('br_settings') || '{}'); } catch (e) { return {}; } })());
const G = { state: 'loading', diff: 1, code: [], digits: [], tapes: 0, time: 0, lost: 0, cause: '', blackout: 0, exitOn: false, grace: 45, chase: 0, heartT: 0 };
const PL = {
  x: 0, z: 0, yaw: 0, pitch: 0, vx: 0, vz: 0, crouch: false, ck: 0, sta: 1, exh: false, hp: 100, san: 100,
  batt: 100, spare: 1, water: 1, flash: false, fk: 0, nv: false, zoomT: false, zk: 0, noise: 0, ph: 0, bobA: 0, dist: 0,
  lastHurt: -99, shake: 0, spd: 0, run: false, light: 1, cell: -1, field: null, bdir: V3(0, 0, 1), fear: 0, interf: 0,
  roll: 0, fovK: 0, focus: null, lookAt: null, lookK: 0, kx: 0, kz: 0
};
const K = new Set(), JUST = new Set();
let MDX = 0, MDY = 0, RMB = false, ALTCLICK = false; // ALTCLICK: right-click on a door with a secondary action (latch)
const TOUCH = { mx: 0, mz: 0 };

function lightAt(x, z) { return baseLight(x, z, FX.flicker) * 0.667 * FX.lightScale; } // ~1 in a lit room, <0.1 in the dead zones
function makeNoise(v) { PL.noise = Math.max(PL.noise, v); }
function carpetWet(x, z) { return noise1(x * 0.35 + 3.1) + noise1(z * 0.35 - 8.7) > 0.7; }

function resetPlayer() {
  Object.assign(PL, { x: cellCenter(LV.spawn.x), z: cellCenter(LV.spawn.y), vx: 0, vz: 0, crouch: false, ck: 0, sta: 1, exh: false, hp: 100, san: 100,
    batt: [100, 90, 75][G.diff], spare: [2, 1, 0][G.diff], water: [3, 1, 0][G.diff], flash: false, fk: 0, nv: false, zoomT: false, zk: 0,
    noise: 0, dist: 0, lastHurt: -99, shake: 0, cell: -1, fear: 0, pitch: 0, lookAt: null, lookK: 0 });
  // face the most open direction
  let bd = 0, best = 0;
  for (let d = 0; d < 4; d++) { let n = 0, x = LV.spawn.x, y = LV.spawn.y; while (passable(x, y, d) && n < 8) { x += DX[d]; y += DY[d]; n++; } if (n > best) { best = n; bd = d; } }
  PL.yaw = Math.atan2(DX[bd], DY[bd]);
  updateField();
}
function updateField() {
  const c = cIdx(cellOf(PL.x), cellOf(PL.z));
  if (c !== PL.cell) { PL.cell = c; PL.field = bfs(c % N, (c / N) | 0); }
}

// ----- actions -----
function toggleFlash() {
  if (PL.nv) { toggleNV(); }
  if (PL.batt <= 0) { SFX.click(); toast('BATTERY EMPTY — PRESS R'); return; }
  PL.flash = !PL.flash; SFX.flash(PL.flash);
}
function toggleNV() {
  if (!PL.nv && PL.batt <= 0) { SFX.click(); toast('BATTERY EMPTY — PRESS R'); return; }
  PL.nv = !PL.nv; SFX.beep(PL.nv ? 1400 : 900, 0.06); FX.glitch = Math.max(FX.glitch, 0.8); SFX.staticBurst(0.12, 0.2);
}
function swapBattery() {
  if (PL.spare <= 0) { SFX.click(); toast('NO SPARE BATTERIES'); return; }
  if (PL.batt > 92) { toast('BATTERY STILL FULL'); return; }
  PL.spare--; PL.batt = 100; SFX.battery(); makeNoise(0.2); toast('BATTERY SWAPPED'); FX.glitch = Math.max(FX.glitch, 0.5);
}
function drinkWater() {
  if (PL.water <= 0) { SFX.click(); toast('NO ALMOND WATER'); return; }
  if (PL.san > 97 && PL.hp > 97) { toast('YOU FEEL FINE'); return; }
  PL.water--; PL.san = Math.min(100, PL.san + 45); PL.hp = Math.min(100, PL.hp + 20); SFX.drink(); makeNoise(0.15); toast('ALMOND WATER — SANITY RESTORED');
}
function takeItem(it) {
  it.taken = true; it.root.setEnabled(false); SFX.pickup();
  if (it.type === 'battery') { PL.spare++; toast('CAMCORDER BATTERY +1'); } else { PL.water++; toast('ALMOND WATER +1'); }
}
function findInteract() {
  const f = CAM.getDirection(BABYLON.Axis.Z), cy = CAM.position.y;
  let best = null, bs = 1e9;
  for (const it of W.interact) {
    if (!it.ok()) continue;
    const dx = it.x - PL.x, dz = it.z - PL.z, d = Math.hypot(dx, dz);
    if (d > it.r) continue;
    const dy = (it.y ?? 0.5) - cy, dd = Math.hypot(dx, dy, dz) || 1;
    const dot = (dx * f.x + dy * f.y + dz * f.z) / dd;
    if (dot < (d < 0.7 ? 0.2 : 0.83)) continue;
    const k = Math.max(0, d - 0.45) / (d || 1);
    if (!los(PL.x, PL.z, PL.x + dx * k, PL.z + dz * k)) continue;
    const sc = d * (2.2 - dot);
    if (sc < bs) { bs = sc; best = it; }
  }
  return best;
}
function interact() { const it = PL.focus; if (it && it.ok()) it.act(); }

function hurt(dmg, src) {
  if (G.state !== 'play') return;
  dmg *= [0.7, 1, 1.3][G.diff];
  PL.hp -= dmg; PL.lastHurt = FX.t; FX.hurt = 1; FX.glitch = Math.max(FX.glitch, 1.4); PL.shake = 1.2; PL.san = Math.max(0, PL.san - dmg * 0.35);
  if (PL.hp <= 0) { PL.hp = 0; die(src); }
}

// ----- per-frame -----
function updatePlayer(dt) {
  const t = FX.t;
  // look
  const sens = 0.0021 * S.sens * (1 - PL.zk * 0.6);
  if (!PL.lookAt) { PL.yaw += MDX * sens; PL.pitch = clamp(PL.pitch + MDY * sens * (S.inv ? -1 : 1), -1.3, 1.3); }
  else {
    const dx = PL.lookAt.x - PL.x, dz = PL.lookAt.z - PL.z, dy = PL.lookAt.y - CAM.position.y;
    PL.yaw += angDiff(PL.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 14);
    PL.pitch = damp(PL.pitch, -Math.atan2(dy, Math.hypot(dx, dz)), 14, dt);
  }
  MDX = MDY = 0;
  if (PL.lookAt && (PL.lookK -= dt) <= 0) PL.lookAt = null;
  // actions
  if (JUST.has('KeyF')) toggleFlash();
  if (JUST.has('KeyN')) toggleNV();
  if (JUST.has('KeyR')) swapBattery();
  if (JUST.has('KeyQ')) drinkWater();
  if (JUST.has('KeyE') || JUST.has('Enter')) interact();
  if ((ALTCLICK || JUST.has('KeyX')) && hasAlt(PL.focus)) PL.focus.alt(); // right-click (or X) latches / unlatches
  ALTCLICK = false;
  if (JUST.has('Tab') && LVL === 9) toggleMap9();
  if (JUST.has('KeyC')) PL.crouch = !PL.crouch;
  if (JUST.has('KeyZ')) PL.zoomT = !PL.zoomT;
  JUST.clear();
  // movement
  let ix = (K.has('KeyD') || K.has('ArrowRight') ? 1 : 0) - (K.has('KeyA') || K.has('ArrowLeft') ? 1 : 0) + TOUCH.mx;
  let iz = (K.has('KeyW') || K.has('ArrowUp') ? 1 : 0) - (K.has('KeyS') || K.has('ArrowDown') ? 1 : 0) + TOUCH.mz;
  const il = Math.hypot(ix, iz); if (il > 1) { ix /= il; iz /= il; }
  const crouch = PL.crouch; // C toggles crouch (Ctrl removed in r4.4: Ctrl+W closed the browser tab)
  const runKey = K.has('ShiftLeft') || K.has('ShiftRight');
  const wantRun = runKey && iz > 0.3 && !crouch && !PL.exh;
  if (runKey && PL.crouch && iz > 0.3) PL.crouch = false;
  const sp = (crouch ? 1.25 : wantRun ? 4.4 : 2.35) * (PL.hp < 30 ? 0.86 : 1) * (PL.exh ? 0.85 : 1) * (PL.spdK ?? 1);
  const sy = Math.sin(PL.yaw), cyw = Math.cos(PL.yaw);
  const tx = (sy * iz + cyw * ix) * sp, tz = (cyw * iz - sy * ix) * sp;
  const acc = il > 0.01 ? 8 : 11;
  PL.vx = damp(PL.vx, tx, acc, dt); PL.vz = damp(PL.vz, tz, acc, dt);
  const mvx = (PL.vx + PL.kx) * dt, mvz = (PL.vz + PL.kz) * dt, ns = Math.min(6, Math.ceil(Math.hypot(mvx, mvz) / 0.1) || 1), p = { x: PL.x, z: PL.z };
  for (let i = 0; i < ns; i++) { p.x += mvx / ns; p.z += mvz / ns; collide(p, 0.28); }   // r5: substeps (<= 10 cm) so walls and props are never skipped
  PL.kx = damp(PL.kx, 0, 6, dt); PL.kz = damp(PL.kz, 0, 6, dt);
  const moved = Math.hypot(p.x - PL.x, p.z - PL.z);
  PL.spd = damp(PL.spd, moved / Math.max(dt, 1e-4), 12, dt);
    PL.x = p.x; PL.z = p.z; PL.dist += moved;
  PL.run = wantRun && PL.spd > 3;
  // stamina
  if (PL.run) PL.sta -= dt / [8, 6.5, 5.5][G.diff]; else PL.sta += dt * (PL.spd < 0.3 ? 0.2 : 0.11) * (crouch ? 1.2 : 1);
  if (PL.sta <= 0) { PL.sta = 0; if (!PL.exh) { PL.exh = true; toast('EXHAUSTED'); } }
  if (PL.exh && PL.sta > 0.4) PL.exh = false;
  PL.sta = clamp(PL.sta, 0, 1);
  PL.ck = damp(PL.ck, crouch ? 1 : 0, 9, dt);
  // footsteps
  const stepLen = PL.run ? 0.95 : crouch ? 0.55 : 0.72, prevPh = PL.ph;
  PL.ph += moved / stepLen * Math.PI;
  if (Math.floor(PL.ph / Math.PI) !== Math.floor(prevPh / Math.PI)) SFX.step(PL.run ? 2 : crouch ? 0 : 1, carpetWet(PL.x, PL.z));
  // noise: Level 9 scales it with speed (crouching ≈ silent, a slow walk is quieter than a brisk one, sprinting is loud)
  const l9 = LVL === 9;
  const nl = PL.spd < 0.25 ? 0 : PL.run ? 1 : crouch ? (l9 ? 0.04 * clamp(PL.spd / 1.25, 0, 1) : 0.08) : l9 ? 0.12 + 0.3 * clamp((PL.spd - 0.25) / 2.1, 0, 1) : 0.4;
  PL.noise = Math.max(nl, PL.noise - dt * (l9 ? 0.9 : 0.6));
  updateField();
  // camcorder / flashlight
  const drainK = [0.75, 1, 1.2][G.diff];
  if (PL.nv) PL.batt -= dt * 0.95 * drainK; else if (PL.flash) PL.batt -= dt * 0.42 * drainK;
  if (PL.batt <= 0) { PL.batt = 0; if (PL.flash || PL.nv) { PL.flash = PL.nv = false; SFX.flash(false); toast('BATTERY DEPLETED — [R] SWAP'); } }
  let fl = 1;
  if (PL.batt < 15 && hash1(Math.floor(t * 11)) < (15 - PL.batt) / 45) fl = 0.12;
  if (PL.interf > 0 && hash1(Math.floor(t * 17) + 3.3) < PL.interf * 0.6) fl *= 0.08;
  PL.fk = damp(PL.fk, PL.flash && !PL.nv ? fl : 0, 30, dt);
  FX.nv = damp(FX.nv, PL.nv ? 1 : 0, 9, dt);
  PL.zk = damp(PL.zk, PL.zoomT || RMB ? 1 : 0, 7, dt);
  // survival
  if (FX.t - PL.lastHurt > 10 && PL.hp < 100) PL.hp = Math.min(100, PL.hp + dt * 1.4);
  PL.light = lightAt(PL.x, PL.z);
  let ds = 0;
  if (LVL !== 18 && PL.light < 0.12) ds -= ((PL.fk > 0.5 || PL.nv) ? 0.3 : 1.1) * (LVL !== 0 ? 0.5 : 1);
  else if (LVL !== 18 && PL.light > 0.3 && PL.san < 70) ds += 0.25;
  ds -= PL.fear * 2.6;
  PL.san = clamp(PL.san + ds * dt * (ds < 0 ? [0.6, 1, 1.3][G.diff] : 1), 0, 100);
  if (PL.san <= 0) { PL.hp -= dt * 3.5; if (PL.hp <= 0) { PL.hp = 0; die('sanity'); } }
  FX.san = damp(FX.san, Math.pow(1 - PL.san / 100, 1.5), 2, dt);
  // interaction focus
  PL.focus = findInteract();
}

function playerCamera(dt) {
  const t = FX.t;
  const eye = lerp(1.62, 1.03, PL.ck);
  PL.bobA = damp(PL.bobA, clamp(PL.spd / 2.35, 0, 1.9), 6, dt);
  const bobY = (Math.abs(Math.sin(PL.ph)) - 0.5) * 0.05 * PL.bobA * (PL.run ? 1.3 : 1);
  const bobX = Math.cos(PL.ph) * 0.028 * PL.bobA;
  const hand = 0.004 + 0.004 * PL.bobA + PL.shake * 0.045 + FX.san * 0.012 + (PL.hp < 30 ? 0.004 : 0);
  const ny = noise1(t * 0.9) * hand + noise1(t * 3.7 + 9) * hand * 0.3;
  const np = noise1(t * 0.8 + 40) * hand + noise1(t * 4.1 + 21) * hand * 0.3;
  PL.shake = Math.max(0, PL.shake - dt * 1.4);
  const strafe = (PL.vx * Math.cos(PL.yaw) - PL.vz * Math.sin(PL.yaw));
  PL.roll = damp(PL.roll, -strafe * 0.006 + noise1(t * 0.5 + 70) * 0.014 + bobX * 0.35 + FX.san * Math.sin(t * 0.7) * 0.05, 6, dt);
  CAM.position.set(PL.x + Math.cos(PL.yaw) * bobX, eye + bobY, PL.z - Math.sin(PL.yaw) * bobX);
  CAM.rotation.set(PL.pitch + np + bobY * 0.25, PL.yaw + ny, PL.roll);
  PL.fovK = damp(PL.fovK, PL.run ? 1 : 0, 4, dt);
  const base = S.fov * Math.PI / 180, zf = lerp(1, 2.4, PL.zk);
  CAM.fov = 2 * Math.atan(Math.tan(base / 2) / zf) + PL.fovK * 0.05;
  // flashlight / IR lamp in slot 0
  const f = CAM.getDirection(BABYLON.Axis.Z), r = CAM.getDirection(BABYLON.Axis.X), u = CAM.getDirection(BABYLON.Axis.Y);
  PL.bdir.x = damp(PL.bdir.x, f.x, 13, dt); PL.bdir.y = damp(PL.bdir.y, f.y, 13, dt); PL.bdir.z = damp(PL.bdir.z, f.z, 13, dt); PL.bdir.normalize();
  const lp = CAM.position.add(r.scale(0.14)).add(u.scale(-0.1)).add(f.scale(0.05));
  if (FX.nv > 0.02) setSlot(0, lp, 2.6 * FX.nv, f, Math.cos(0.95), [1, 1, 1], 22, true, 0.08);
  else if (PL.fk > 0.01) setSlot(0, lp, 4.6 * PL.fk, PL.bdir, Math.cos(0.44), [1, 0.9, 0.74], 22, true, 0.12);
  else clearSlot(0);
  FX.ambBoost = FX.nv * 4;
  FX.exposure = 0.85 * S.bright * lerp(1, clamp(0.3 / Math.max(PL.light, 0.01), 0.22, 1), FX.nv);
  setListener(CAM.position.x, CAM.position.y, CAM.position.z, f.x, f.y, f.z); updateAudioLive();
  // breathing & heartbeat
  if (AU.ctx) {
    const now = AU.ctx.currentTime;
    AU.breathG.gain.setTargetAtTime(clamp((1 - PL.sta) * 0.22 + (PL.run ? 0.05 : 0) + PL.fear * 0.06, 0, 0.3), now, 0.4);
    if (AU.breathSrc) AU.breathSrc.playbackRate.setTargetAtTime(0.9 + (1 - PL.sta) * 0.5 + PL.fear * 0.2, now, 0.6);
    const bpm = 60 + PL.fear * 70 + (PL.hp < 35 ? 30 : 0);
    G.heartT -= dt;
    if ((PL.fear > 0.3 || PL.hp < 35) && G.heartT <= 0) { G.heartT = 60 / bpm; SFX.heartbeat(0.25 + PL.fear * 0.4); }
  }
}

// ----- raw input -----
function bindInput(canvas) {
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code) && G.state === 'play') e.preventDefault();
    if (e.repeat) return;
    K.add(e.code); if (G.state === 'play') JUST.add(e.code);
    onKey(e.code, e);
  });
  addEventListener('keyup', e => K.delete(e.code));
  addEventListener('blur', () => { K.clear(); RMB = false; });
  addEventListener('mousemove', e => { if (document.pointerLockElement === canvas || (G.state === 'play' && (e.buttons & 1) && !IS_TOUCH)) { MDX += clamp(e.movementX, -250, 250); MDY += clamp(e.movementY, -250, 250); } });
  canvas.addEventListener('mousedown', e => {
    if (G.state !== 'play') return;
    if (document.pointerLockElement !== canvas) { lockPointer(); return; }
    if (e.button === 2) { if (hasAlt(PL.focus)) ALTCLICK = true; else RMB = true; } // right-click: latch when aimed at a door, else hold-zoom
    if (e.button === 0) interact();
  });
  addEventListener('mouseup', e => { if (e.button === 2) RMB = false; });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}
function hasAlt(f) { return !!(f && f.alt && f.altLabel && f.altLabel()); }
function lockPointer() { const c = $('c'); if (IS_TOUCH || document.pointerLockElement === c) return; try { const p = c.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} }
const IS_TOUCH = (matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window) && !matchMedia('(pointer: fine)').matches;
