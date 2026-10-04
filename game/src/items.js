// ---------- r12 · stored items, timed effects, lasting gains, the flashlight's own batteries ----------
// The belt: the mouse wheel picks a stored item, clicking the wheel (on release) or Q uses it. B / T / R stay as shortcuts.
// Energy bars and drinks work for a while (a ring icon beside the meter they affect counts it down) and leave a small permanent gain:
// bars raise max VIT (and a little stamina), drinks raise stamina capacity and max SAN. The gains ride along from level to level.
// Level 9: the flashlight runs on its own batteries (found as blister packs); night shot still runs on the camcorder battery.
const ITEMS = {
  water: { n: 'ALMOND WATER', icon: 'bottle', has: () => PL.water, use: () => drinkWater() },
  bar: { n: 'ENERGY BAR', icon: 'bar', has: () => PL.bars || 0, use: () => eatBar() },
  drink: { n: 'ENERGY DRINK', icon: 'can', has: () => PL.drinks || 0, use: () => drinkEnergy() },
  cells: { n: 'FLASHLIGHT BATTERIES', icon: 'aa', has: () => PL.cells || 0, use: () => loadCells(), only: () => flashOwn() },
  spare: { n: 'CAMCORDER BATTERY', icon: 'batt', has: () => PL.spare, use: () => swapBattery() },
};
const BELT = ['water', 'bar', 'drink', 'cells', 'spare'];
// timed effects: the PL field that counts down, the meter it sits beside, the item icon, the full duration
const EFX = {
  mend: { t: 'mendT', stat: 'hp', icon: 'bar', name: 'MEND', dur: 40 },     // +0.5 VIT a second
  fed: { t: 'fedT', stat: 'st', icon: 'bar', name: 'FED', dur: 60 },        // stamina comes back twice as fast
  wired: { t: 'wiredT', stat: 'st', icon: 'can', name: 'WIRED', dur: 40 },  // sprinting costs 40%
  focus: { t: 'focusT', stat: 'sa', icon: 'can', name: 'FOCUS', dur: 40 },  // sanity loss halved
};
// lasting gains per item, and their caps
const GAIN = { bar: { vit: 2, sta: 0.01 }, drink: { sta: 0.03, san: 2 }, cap: { vit: 40, sta: 0.4, san: 40 } };
const FLASH9 = { drain: [0.42, 0.55, 0.68], start: [100, 80, 60], packs: [1, 1, 0] };
const ICON = {
  bottle: '<path d="M6.2 1.5h3.6v2.6l1.6 2.1v8.3H4.6V6.2l1.6-2.1z"/><path d="M4.6 8.6h6.8"/>',
  bar: '<path d="M2.5 5.2h11v5.6h-11z"/><path d="M4.6 5.2v5.6M11.4 5.2v5.6"/>',
  can: '<path d="M4.8 3h6.4v10.6H4.8z"/><path d="M4.8 5.6h6.4M4.8 11h6.4M7 1.6h2"/>',
  aa: '<path d="M2 3.6h9.4v3H2zM2 9.4h9.4v3H2z"/><path d="M11.4 4.4h1.6v1.4M11.4 10.2h1.6v1.4"/>',
  batt: '<path d="M1.8 4.2h11v7.6h-11z"/><path d="M12.8 6.4h1.6v3.2h-1.6M4.4 6.2v3.6"/>',
};
const svgIcon = k => `<svg viewBox="0 0 16 16" aria-hidden="true">${ICON[k] || ''}</svg>`;
const hpMax = () => 100 + ((PL.up && PL.up.vit) || 0);
const sanMax = () => 100 + ((PL.up && PL.up.san) || 0);
const staCap = () => 1 + ((PL.up && PL.up.sta) || 0);
const flashOwn = () => LVL === 9;
function upZero() { return { vit: 0, sta: 0, san: 0 }; }
// what a level hands the next one (merged into every carryFrom…), and how the next one takes it
function carryOut() { return { bars: PL.bars || 0, drinks: PL.drinks || 0, cells: PL.cells || 0, fbatt: flashOwn() ? PL.fbatt : undefined, up: Object.assign(upZero(), PL.up || {}), sel: PL.sel || 'water' }; }
function carryIn(f) {
  f = f || {};
  Object.assign(PL, { bars: f.bars ?? 0, drinks: f.drinks ?? 0, cells: f.cells ?? 0, fbatt: f.fbatt ?? 100, up: Object.assign(upZero(), f.up || {}), sel: f.sel || 'water',
    wiredT: 0, fedT: 0, mendT: 0, focusT: 0 });
  if (flashOwn() && f.fbatt === undefined) { PL.fbatt = FLASH9.start[G.diff]; PL.cells = Math.max(PL.cells, FLASH9.packs[G.diff]); }
  PL.hp = Math.min(PL.hp, hpMax()); PL.san = Math.min(PL.san, sanMax());
  beltDraw(true);
}
// ----- using things -----
function gainUp(kind) {
  const g = GAIN[kind], C = GAIN.cap, u = PL.up || (PL.up = upZero()), out = [];
  if (g.vit && u.vit < C.vit) { const d = Math.min(g.vit, C.vit - u.vit); u.vit += d; out.push(['hp', '+' + d]); }
  if (g.sta && u.sta < C.sta - 1e-6) { const d = Math.min(g.sta, C.sta - u.sta); u.sta = Math.round((u.sta + d) * 1000) / 1000; out.push(['st', '+' + Math.round(d * 100) + '%']); }
  if (g.san && u.san < C.san) { const d = Math.min(g.san, C.san - u.san); u.san += d; out.push(['sa', '+' + d]); }
  for (const [id, txt] of out) gainPop(id, txt);
  return out.length > 0;
}
function gainPop(id, txt) {   // a small "+2" that floats up off the end of the meter
  const bar = $(id + 'Bar'); if (!bar) return; const row = bar.parentNode.parentNode, s = document.createElement('span');
  s.className = 'gain'; s.textContent = txt; row.appendChild(s); setTimeout(() => s.remove(), 1900);
}
function addFx(k) { const E = EFX[k], left = PL[E.t] || 0; PL[E.t] = Math.min(E.dur * 1.5, Math.max(left, 0) + E.dur); (PL.fxD || (PL.fxD = {}))[k] = PL[E.t]; }
function loadCells() {
  if (!flashOwn()) { toast('THE LIGHT RUNS OFF THE CAMCORDER HERE', 2); return; }
  if (!(PL.cells > 0)) { SFX.click(); toast('NO FLASHLIGHT BATTERIES', 2); return; }
  if (PL.fbatt > 92) { toast('FLASHLIGHT BATTERIES STILL GOOD', 1.8); return; }
  PL.cells--; PL.fbatt = 100; SFX.battery(); makeNoise(0.15); FX.glitch = Math.max(FX.glitch, 0.3); toast('FRESH BATTERIES IN THE FLASHLIGHT', 2);
}
function useSel() {
  if (G.state !== 'play') return;
  const k = ITEMS[PL.sel] && (!ITEMS[PL.sel].only || ITEMS[PL.sel].only()) ? PL.sel : 'water';
  ITEMS[k].use(); beltDraw(true); BELTUI.t = 2.2;
}
// ----- the belt -----
const BELTUI = { t: 0, acc: 0, cd: 0, key: '', open: false };
function beltItems() { return BELT.filter(k => !ITEMS[k].only || ITEMS[k].only()); }
function beltStep(dir) {
  if (G.state !== 'play') return;
  const list = beltItems(), have = list.filter(k => ITEMS[k].has() > 0), pool = have.length ? have : list, li = k => list.indexOf(k), s = li(PL.sel);
  if (pool.includes(PL.sel)) PL.sel = pool[(pool.indexOf(PL.sel) + dir + pool.length) % pool.length];
  else if (dir > 0) PL.sel = pool.find(k => li(k) > s) || pool[0];
  else PL.sel = pool.slice().reverse().find(k => li(k) < s) || pool[pool.length - 1];
  SFX.click(); BELTUI.t = 2.4; beltDraw(true);
  if (!have.length) toast('NOTHING STORED', 1.2);
}
function beltWheel(dy) {   // mouse wheels click in steps of ~100; trackpads send a stream of small deltas
  if (G.state !== 'play' || DOC.open) return;
  BELTUI.acc += dy;
  if (Math.abs(BELTUI.acc) < 45 || BELTUI.cd > 0) return;
  beltStep(BELTUI.acc > 0 ? 1 : -1); BELTUI.acc = 0; BELTUI.cd = 0.11;
}
function beltDraw(force) {
  const el = $('belt'); if (!el) return;
  const list = beltItems(), key = list.map(k => k + ITEMS[k].has()).join() + PL.sel + (BELTUI.t > 0);
  if (!force && key === BELTUI.key) return; BELTUI.key = key;
  el.innerHTML = list.map(k => `<div class="slot${k === PL.sel ? ' sel' : ''}${ITEMS[k].has() > 0 ? '' : ' none'}">${svgIcon(ITEMS[k].icon)}<b>${ITEMS[k].has()}</b></div>`).join('');
  const it = ITEMS[PL.sel]; hset('beltName', it ? `${it.n} ×${it.has()}` : '');
  $('beltWrap').classList.toggle('open', BELTUI.t > 0);
}
// ----- per frame (from updatePlayer) -----
function itemsTick(dt) {
  BELTUI.cd -= dt; if (BELTUI.t > 0) { BELTUI.t -= dt; if (BELTUI.t <= 0) beltDraw(true); }
  PL.mendT = Math.max(0, (PL.mendT || 0) - dt); PL.focusT = Math.max(0, (PL.focusT || 0) - dt);
  if (PL.mendT > 0 && PL.hp > 0 && PL.hp < hpMax()) PL.hp = Math.min(hpMax(), PL.hp + dt * 0.5);
}
// the flashlight's drain, for the levels where it has its own batteries; returns the beam factor (low batteries dim and stutter it)
function flashDrain(dt) {
  if (!flashOwn()) return 1;
  if (PL.flash && !PL.nv) PL.fbatt = Math.max(0, PL.fbatt - dt * FLASH9.drain[G.diff]);
  if (PL.fbatt <= 0 && PL.flash) { PL.flash = false; SFX.flash(false); toast(PL.cells > 0 ? 'FLASHLIGHT DEAD — [F] LOADS NEW BATTERIES' : 'FLASHLIGHT DEAD — FIND BATTERIES', 2.6); }
  let k = 0.55 + 0.45 * clamp(PL.fbatt / 25, 0, 1);
  if (PL.fbatt < 12 && hash1(Math.floor(FX.t * 9) + 7.7) < (12 - PL.fbatt) / 30) k *= 0.15;
  return k;
}
// ----- HUD (from updateHUD, ten times a second) -----
function fxHUD() {
  const rows = { hp: [], st: [], sa: [] };
  for (const [k, E] of Object.entries(EFX)) {
    const left = PL[E.t] || 0; if (left <= 0) continue;
    const full = (PL.fxD && PL.fxD[k]) || E.dur, p = clamp(left / full, 0, 1);
    rows[E.stat].push(`<i class="ef ${E.stat}${left < 5 ? ' end' : ''}" style="--p:${(p * 100).toFixed(0)}%" title="${E.name} ${Math.ceil(left)}s">${svgIcon(E.icon)}</i>`);
  }
  for (const s of ['hp', 'st', 'sa']) { const el = $('fx_' + s); if (!el) continue; const h = rows[s].join(''); if (el.__h !== h) { el.__h = h; el.innerHTML = h; } }
  // the meters lengthen with the lasting gains
  const K = { hp: hpMax() / 100, st: staCap(), sa: sanMax() / 100 };
  for (const s of ['hp', 'st', 'sa']) { const b = $(s + 'Bar'), row = b && b.parentNode.parentNode; if (row) { const v = K[s].toFixed(3); if (row.__k !== v) { row.__k = v; row.style.setProperty('--k', v); } } }
  const fb = $('fbatt');
  if (fb) {
    const on = flashOwn() && G.state !== 'title'; fb.classList.toggle('hide', !on);
    if (on) { const cells = Math.ceil(PL.fbatt / 20); fb.querySelectorAll('.cells b').forEach((b, i) => b.classList.toggle('off', i >= cells)); fb.classList.toggle('low', PL.fbatt < 15); hset('fbattPct', Math.ceil(PL.fbatt) + '%'); }
  }
  beltDraw(false);
}
function upSummary() { const u = PL.up || upZero(); return `VIT ${hpMax()} · STAMINA +${Math.round(u.sta * 100)}% · SAN ${sanMax()}`; }
function bindItems(canvas) {
  addEventListener('wheel', e => { if (G.state === 'play') { e.preventDefault(); beltWheel(e.deltaY); } }, { passive: false });
  canvas.addEventListener('mousedown', e => { if (e.button === 1) { e.preventDefault(); BELTUI.mmb = true; } });
  addEventListener('mouseup', e => { if (e.button === 1 && BELTUI.mmb) { BELTUI.mmb = false; if (G.state === 'play' && document.pointerLockElement === canvas) useSel(); } });
  canvas.addEventListener('auxclick', e => { if (e.button === 1) e.preventDefault(); });
}
if (/[?&]debug/.test(location.search)) addEventListener('load', () => Object.assign(window.__BR || (window.__BR = {}), { ITEMS, BELT, EFX, GAIN, FLASH9, BELTUI, beltStep, beltWheel, useSel, loadCells, gainUp, hpMax, sanMax, staCap, flashOwn, carryOut, carryIn, fxHUD, upSummary, JUST, carryFrom9, goLevel5 }));
