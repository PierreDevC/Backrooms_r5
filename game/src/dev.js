// ---------- r12 · developer mode: in-game options (hold TAB) and a debug overlay with selectable engine stats ----------
// Settings ▸ DEVELOPER MODE turns it on and reveals DEVELOPER SETTINGS (which options start enabled, the fast-move factor, debug mode, which stats to track and in which
// corner each one appears). In game a small "DEV MODE · HOLD TAB" badge sits top right; holding TAB expands it into a menu you click with the mouse
// (a virtual cursor, so the pointer stays locked); letting go collapses it. (Level 9's map is on M now, mute is gone.)
// Everything lives in S (saved with the other settings): S.dev, S.devOpts, S.devFast, S.dbg, S.dbgPos (one corner for all stats), S.dbgStats[id] = { on }.
const DEV_OPTS = [
  ['hp', 'INFINITE VITALITY'], ['sta', 'INFINITE STAMINA'], ['san', 'INFINITE SANITY'], ['batt', 'INFINITE BATTERIES'],
  ['god', 'CANNOT DIE'], ['fly', 'FLY · SPACE UP · C DOWN'], ['noclip', 'NOCLIP (WALK THROUGH WALLS)'], ['ignore', 'ENEMIES IGNORE ME'], ['fast', 'FAST MOVE']];
const DBG_POS = [['tl', 'TOP LEFT'], ['tr', 'TOP RIGHT'], ['bl', 'BOTTOM LEFT'], ['br', 'BOTTOM RIGHT']];
// [id, label, group, hint]
const DBG_STATS = [
  ['fps', 'FPS', 'Frame time & bottleneck detection', 'frames per second'],
  ['frame', 'Frame time (CPU)', 'Frame time & bottleneck detection', 'ms the CPU spends on one frame; under 16.6 for 60 FPS'],
  ['gpu', 'GPU frame time', 'Frame time & bottleneck detection', 'ms the GPU takes (needs the timer-query extension)'],
  ['inter', 'Inter-frame time', 'Frame time & bottleneck detection', 'ms between the end of one frame and the start of the next'],
  ['delta', 'Delta time', 'Frame time & bottleneck detection', 'ms between frame starts'],
  ['draws', 'Draw calls', 'Draw calls & geometry', 'render commands per frame'],
  ['activeMeshes', 'Active meshes', 'Draw calls & geometry', 'meshes that passed frustum culling'],
  ['totalMeshes', 'Total meshes', 'Draw calls & geometry', 'every mesh in the scene'],
  ['activeVerts', 'Active vertices', 'Draw calls & geometry', 'vertices of the active meshes'],
  ['activeIdx', 'Active indices', 'Draw calls & geometry', 'indices of the active meshes'],
  ['amEval', 'Active meshes evaluation time', 'Engine & evaluation overhead', 'ms deciding which meshes are visible'],
  ['rtTime', 'Render targets time', 'Engine & evaluation overhead', 'ms on render-target passes (the Level 9 window portals)'],
  ['particles', 'Particles duration', 'Engine & evaluation overhead', 'ms updating and drawing particle systems'],
  ['anim', 'Animations time', 'Engine & evaluation overhead', 'ms on Babylon animations plus the skinned characters'],
  ['textures', 'Total textures', 'Resources & memory', 'textures in the scene'],
  ['materials', 'Total materials', 'Resources & memory', 'material definitions'],
  ['geoms', 'Geometries', 'Resources & memory', 'vertex / index buffer sets']];
const DEV = { open: false, tab: false, tabT: 0, cx: 0, cy: 0, fy: 0, skin: 0, acc: null, si: null, siScene: null, ei: null, txt: {}, tStat: 0, flash: 0 };
function devDefaults() {
  S.dev = !!S.dev; S.devOpts = Object.assign({}, S.devOpts); for (const [k] of DEV_OPTS) S.devOpts[k] = !!S.devOpts[k];
  S.devFast = clamp(+S.devFast || 3, 1.5, 10); S.dbg = !!S.dbg; S.dbgPos = DBG_POS.some(p => p[0] === S.dbgPos) ? S.dbgPos : 'tl'; S.dbgStats = S.dbgStats || {};
  for (const [id] of DBG_STATS) { const o = S.dbgStats[id] || (S.dbgStats[id] = {}); o.on = o.on === undefined ? id === 'fps' : !!o.on; delete o.pos; }
}
devDefaults();
const devOn = k => !!(S.dev && S.devOpts[k]);
const devNoclip = () => devOn('noclip') || (devOn('fly') && DEV.fy > 3.4);   // above the roofs there is nothing left to hit
// ----- hooks called from the game -----
function devPlayerTick(dt) {   // end of updatePlayer: the infinite things, then fly
  if (!S.dev) { DEV.fy = 0; return; }
  const o = S.devOpts;
  if (o.hp) PL.hp = hpMax();
  if (o.god) PL.hp = Math.max(PL.hp, 1);
  if (o.sta) { PL.sta = 1; PL.exh = false; }
  if (o.san) PL.san = sanMax();
  if (o.batt) { PL.batt = 100; if (flashOwn()) PL.fbatt = 100; }
  if (o.ignore) PL.noise = 0;
  if (o.fly) { const up = (K.has('Space') ? 1 : 0) - (K.has('KeyC') ? 1 : 0); DEV.fy = clamp(DEV.fy + up * 5 * dt * (K.has('ShiftLeft') || K.has('ShiftRight') ? 2.2 : 1), 0, 60); }
  else DEV.fy = DEV.fy < 0.02 ? 0 : damp(DEV.fy, 0, 6, dt);
  if (devNoclip()) { PL.x = clamp(PL.x, 0.4, LEVEL - 0.4); PL.z = clamp(PL.z, 0.4, LEVEL - 0.4); }
}
// enemies ignore the player: while they think, the player stands at a decoy point on the far side of the map (nothing can see or hear it from there, so chases drop to
// "lost" and patrols carry on); PL.noise reads silent. Restored straight after. Enemies must stay visible, though, and their visibility pass (Agent.cull) measures
// distance and line of sight to the player, so once the real position is back every agent culls again against the real player; their sounds are placed against it too.
const _agentPos = Agent.prototype.pos;
Agent.prototype.pos = function (y = 1.4) { const p = _agentPos.call(this, y); if (DEV.real) p.pl = DEV.real; return p; };
function devAIWrap(fn) {
  return function (dt) {
    if (!(S.dev && S.devOpts.ignore) || G.state === 'loading') return fn(dt);
    const x = PL.x, z = PL.z, n = PL.noise, kx = PL.kx, kz = PL.kz;
    DEV.real = { x, z }; PL.x = x < LEVEL / 2 ? LEVEL - 2.5 : 2.5; PL.z = z < LEVEL / 2 ? LEVEL - 2.5 : 2.5; PL.noise = 0;
    try { return fn(dt); } finally {
      PL.x = x; PL.z = z; PL.noise = n; PL.kx = kx; PL.kz = kz; DEV.real = null;
      for (const a of AI.all) { try { a.cull(); } catch (e) {} }
    }
  };
}
updateAI = devAIWrap(updateAI); updateAI2 = devAIWrap(updateAI2); updateAI5 = devAIWrap(updateAI5); updateAI7 = devAIWrap(updateAI7);
updateAI9 = devAIWrap(updateAI9); updateAI18 = devAIWrap(updateAI18); updateAI37 = devAIWrap(updateAI37);
{ const inner = sknTick; sknTick = function (dt) { const t = performance.now(); inner(dt); DEV.skin += performance.now() - t; }; }
// ----- TAB: hold for the menu, tap for the old behaviour -----
function devTabDown() { if (DEV.tab) return; DEV.tab = true; DEV.tabT = performance.now(); if (S.dev && G.state === 'play') devOpen(); }
function devTabUp() { if (!DEV.tab) return; DEV.tab = false; devClose(); }
function devOpen() {
  DEV.open = true; devMenuRefresh(); $('devMenu').classList.remove('hide'); $('devBadge').classList.add('open');
  const r = $('devMenu').getBoundingClientRect(); if (!DEV.cx) { DEV.cx = r.left + r.width / 2; DEV.cy = r.top + 60; }
  devCursorMove(0, 0, false);
}
function devClose() { DEV.open = false; DEV.tab = false; const m = $('devMenu'); if (m) m.classList.add('hide'); const b = $('devBadge'); if (b) b.classList.remove('open'); const c = $('devCur'); if (c) c.classList.add('hide'); }
function devCursorMove(dx, dy, abs) {
  if (abs) { DEV.cx = dx; DEV.cy = dy; } else { DEV.cx = clamp(DEV.cx + dx, 0, innerWidth - 2); DEV.cy = clamp(DEV.cy + dy, 0, innerHeight - 2); }
  const c = $('devCur'); c.classList.remove('hide'); c.style.transform = `translate(${DEV.cx}px,${DEV.cy}px)`;
  const el = document.elementFromPoint(DEV.cx, DEV.cy), row = el && el.closest && el.closest('[data-devopt]');
  document.querySelectorAll('#devMenu .dvRow.hov').forEach(r => r !== row && r.classList.remove('hov')); if (row) row.classList.add('hov');
}
function devClick() {
  const el = document.elementFromPoint(DEV.cx, DEV.cy), row = el && el.closest && el.closest('[data-devopt]'); if (!row) return;
  const k = row.dataset.devopt; devToggle(k);
}
function devToggle(k, on) {
  S.devOpts[k] = on === undefined ? !S.devOpts[k] : !!on; saveSettings(); devMenuRefresh(); devSyncSettings();
  toast((DEV_OPTS.find(o => o[0] === k) || [0, k])[1].split(' · ')[0] + (S.devOpts[k] ? ' ON' : ' OFF'), 1.1); SFX.click();
}
function devMenuRefresh() {
  const m = $('devMenuList'); if (!m) return;
  m.innerHTML = DEV_OPTS.map(([k, l]) => `<div class="dvRow${S.devOpts[k] ? ' on' : ''}" data-devopt="${k}"><i>${S.devOpts[k] ? '■' : '□'}</i>${k === 'fast' ? l + ' ×' + S.devFast.toFixed(1) : l}</div>`).join('');
}
// ----- settings screens -----
function devSyncSettings() {
  for (const el of document.querySelectorAll('#devset [data-opt]')) el.checked = !!S.devOpts[el.dataset.opt];
}
function bindDev() {
  const dv = $('sDev'), btn = $('btnDevSet'), show_ = () => { btn.classList.toggle('hide', !S.dev); $('devHud').classList.toggle('hide', !S.dev); if (!S.dev) devClose(); };
  dv.checked = S.dev; show_();
  dv.addEventListener('change', () => { S.dev = dv.checked; if (!S.dev) DEV.fy = 0; saveSettings(); show_(); });
  btn.onclick = () => { devSyncSettings(); show('devset'); };
  $('btnDevBack').onclick = () => show('settings');
  $('devOptList').innerHTML = DEV_OPTS.map(([k, l]) => `<label class="row chk">${l} <input type="checkbox" data-opt="${k}"></label>`).join('');
  $('devOptList').addEventListener('change', e => { const k = e.target.dataset && e.target.dataset.opt; if (k) { S.devOpts[k] = e.target.checked; saveSettings(); } });
  const fs = $('sDevFast'); fs.value = S.devFast; fs.addEventListener('input', () => { S.devFast = +fs.value; $('devFastV').textContent = '×' + S.devFast.toFixed(1); saveSettings(); }); $('devFastV').textContent = '×' + S.devFast.toFixed(1);
  const dbg = $('sDbg'); dbg.checked = S.dbg; dbg.addEventListener('change', () => { S.dbg = dbg.checked; saveSettings(); });
  let html = '', grp = '';
  for (const [id, l, g, h] of DBG_STATS) {
    if (g !== grp) { grp = g; html += `<h3>${g}</h3>`; }
    html += `<div class="row st" title="${h}"><label><input type="checkbox" data-st="${id}"> ${l}</label></div>`;
  }
  $('dbgStatList').innerHTML = html;
  for (const el of document.querySelectorAll('#dbgStatList [data-st]')) el.checked = S.dbgStats[el.dataset.st].on;
  $('dbgStatList').addEventListener('change', e => { const t = e.target; if (t.dataset.st) { S.dbgStats[t.dataset.st].on = t.checked; saveSettings(); } });
  const dp = $('sDbgPos'); dp.innerHTML = DBG_POS.map(([p, n]) => `<option value="${p}">${n}</option>`).join(''); dp.value = S.dbgPos; dp.addEventListener('change', () => { S.dbgPos = dp.value; saveSettings(); });
  devSyncSettings();
  // the virtual cursor: while the menu is open the mouse drives it instead of the camera, and a click toggles the row under it
  addEventListener('mousemove', e => {
    if (!DEV.open) return; e.stopImmediatePropagation();
    if (document.pointerLockElement) devCursorMove(e.movementX, e.movementY, false); else devCursorMove(e.clientX, e.clientY, true);
  }, true);
  addEventListener('mousedown', e => { if (!DEV.open) return; e.preventDefault(); e.stopImmediatePropagation(); if (e.button === 0) devClick(); }, true);
  addEventListener('blur', () => devClose());
}
// ----- debug overlay -----
function devInstr(want) {
  if (!SCN) return null;
  if (DEV.si && DEV.siScene !== SCN) { try { DEV.si.dispose(); } catch (e) {} DEV.si = null; }
  if (!DEV.si) { try { DEV.si = new BABYLON.SceneInstrumentation(SCN); DEV.siScene = SCN; } catch (e) { return null; } }
  const si = DEV.si;
  si.captureActiveMeshesEvaluationTime = !!want.amEval; si.captureRenderTargetsRenderTime = !!want.rtTime; si.captureParticlesRenderTime = !!want.particles; si.captureAnimationsTime = !!want.anim;
  if (want.gpu && ENG.getCaps().timerQuery) { if (!DEV.ei) DEV.ei = new BABYLON.EngineInstrumentation(ENG); DEV.ei.captureGPUFrameTime = true; } else if (DEV.ei) DEV.ei.captureGPUFrameTime = false;
  return si;
}
const _f1 = v => v.toFixed(1), _int = v => Math.round(v).toLocaleString('en-US');
function devStatsText() {
  const want = {}; for (const [id] of DBG_STATS) want[id] = S.dbgStats[id].on;
  const si = devInstr(want), a = DEV.acc || { n: 1, cpu: 0, cpuMax: 0, inter: 0, interMax: 0, delta: 0, skin: 0 }, n = Math.max(1, a.n), out = {};
  const cnt = c => c && c.current !== undefined ? c.current : 0;
  let am = null; const active = () => am || (am = SCN.getActiveMeshes());
  out.fps = ENG.getFps().toFixed(0);
  out.frame = `${_f1(a.cpu / n)} ms (max ${_f1(a.cpuMax)})`;
  out.gpu = ENG.getCaps().timerQuery ? (DEV.ei ? _f1(DEV.ei.gpuFrameTimeCounter.current / 1e6) + ' ms' : '…') : 'n/a (no timer query)';
  out.inter = `${_f1(a.inter / n)} ms (max ${_f1(a.interMax)})`;
  out.delta = `${_f1(a.delta / n)} ms`;
  if (want.draws) out.draws = String(si ? cnt(si.drawCallsCounter) : 0);
  if (want.activeMeshes) out.activeMeshes = String(active().length);
  if (want.totalMeshes) out.totalMeshes = String(SCN.meshes.length);
  if (want.activeVerts || want.activeIdx) { let v = 0, ix = 0; const L = active(); for (let i = 0; i < L.length; i++) { const m = L.data[i]; v += m.getTotalVertices(); ix += m.getTotalIndices(); } out.activeVerts = _int(v); out.activeIdx = _int(ix); }
  if (si) {
    out.amEval = _f1(cnt(si.activeMeshesEvaluationTimeCounter)) + ' ms'; out.rtTime = _f1(cnt(si.renderTargetsRenderTimeCounter)) + ' ms'; out.particles = _f1(cnt(si.particlesRenderTimeCounter)) + ' ms';
    out.anim = _f1(cnt(si.animationsTimeCounter) + a.skin / n) + ' ms';
  }
  if (want.textures) out.textures = String(SCN.textures.length);
  if (want.materials) out.materials = String(SCN.materials.length);
  if (want.geoms) out.geoms = String(SCN.geometries.length);
  return out;
}
function devStatsUpdate() {
  const box = { tl: [], tr: [], bl: [], br: [] }, ok = S.dbg && SCN && G.state !== 'loading' && G.state !== 'title';
  if (ok) {
    let t; try { t = devStatsText(); } catch (e) { t = {}; }
    for (const [id, l] of DBG_STATS) { const o = S.dbgStats[id]; if (!o.on || t[id] === undefined) continue; const bad = id === 'frame' && DEV.acc && DEV.acc.cpu / Math.max(1, DEV.acc.n) > 16.6; box[S.dbgPos].push(`<div${bad ? ' class="bad"' : ''}><span>${l}</span> ${t[id]}</div>`); }
  }
  for (const p of ['tl', 'tr', 'bl', 'br']) { const el = $('dbg_' + p), h = box[p].join(''); el.classList.toggle('hide', !h); if (h && el._h !== h) { el._h = h; el.innerHTML = h; } }
  DEV.acc = null;
}
// ----- per frame (wraps the render-loop callback so the whole frame is timed) -----
function devFrameWrap(inner) {
  let prevEnd = 0, prevStart = 0;
  return function () {
    const t0 = performance.now(), inter = prevEnd ? t0 - prevEnd : 0, delta = prevStart ? t0 - prevStart : 0; prevStart = t0; DEV.skin = 0;
    inner();
    const t1 = performance.now(), cpu = t1 - t0; prevEnd = t1; DEV.frames = (DEV.frames || 0) + 1;
    const a = DEV.acc || (DEV.acc = { n: 0, cpu: 0, cpuMax: 0, inter: 0, interMax: 0, delta: 0, skin: 0 });
    a.n++; a.cpu += cpu; a.cpuMax = Math.max(a.cpuMax, cpu); a.inter += inter; a.interMax = Math.max(a.interMax, inter); a.delta += delta; a.skin += DEV.skin;
    try { devTick(t1); } catch (e) { frameErr('dev', e); }
  };
}
function devTick(now) {
  const hud = $('devHud'); if (!hud) return;
  const play = G.state === 'play';
  hud.classList.toggle('hide', !S.dev || !(play || G.state === 'intro'));
  if (DEV.open && (!S.dev || !play)) devClose();
  if (DEV.open) document.body.classList.add('devopen'); else document.body.classList.remove('devopen');
  if (now - DEV.tStat > 250) { DEV.tStat = now; devStatsUpdate(); }
}
frame = devFrameWrap(frame);
if (window.__BR) Object.assign(window.__BR, { DEV, devOn, devToggle, devTick, devStatsText, devOpen, devClose, devTabDown, devTabUp, DEV_OPTS, DBG_STATS, hpMax, playerCamera, toggleMap9, closeMap9, ERRS, goLevel5, goLevel18, goLevel37, goLevel2, goLevel7, startGame, lootOpenDrawer, lootOpenChest, lootWallSpot, lootRectFree, edgeVal, wallPt, eKey, giveLoot, buildLoot, lootTick, task, taskOf, TASKS });
