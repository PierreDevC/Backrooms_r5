// ---------- HUD, subtitles, menus, settings, touch ----------
const TIMERS = [];
function later(sec, fn) { TIMERS.push({ t: FX.t + sec, fn }); }
function runTimers() { for (let i = TIMERS.length - 1; i >= 0; i--) if (FX.t >= TIMERS[i].t) { const f = TIMERS[i].fn; TIMERS.splice(i, 1); try { f(); } catch (e) { frameErr('timer', e); } } }

let toastT = 0;
function toast(msg, dur = 2.4) { const el = $('toast'); el.textContent = msg; el.classList.add('show'); toastT = dur; }
const SUBS = { q: [], cur: null, t: 0 };
function say(who, text, o = {}) {
  if (o.drop && (SUBS.cur || SUBS.q.length)) return;
  SUBS.q.push({ who, text, o, dur: o.dur || clamp(1.6 + text.length * 0.055, 2.4, 7) });
  if (SUBS.q.length > 4) SUBS.q.shift();
}
function objective(text) { $('objective').textContent = text; }
function updateSubs(dt) {
  if (SUBS.cur) { SUBS.t -= dt; if (SUBS.t <= 0) { SUBS.cur = null; $('subs').innerHTML = ''; } }
  if (!SUBS.cur && SUBS.q.length) {
    const s = SUBS.cur = SUBS.q.shift(); SUBS.t = s.dur;
    const div = document.createElement('div');
    if (s.who) { const w = document.createElement('span'); w.className = 'who'; w.textContent = s.who + ': '; div.appendChild(w); }
    div.appendChild(document.createTextNode(s.text));
    $('subs').innerHTML = ''; $('subs').appendChild(div);
    const vd = s.o.vo ? playVoice(s.o.vo, s.o) : 0;   // real voice clip when the bank is decoded
    if (vd > 0) SUBS.t = Math.max(1.6, vd + 0.45);
    else if (s.o.radio) { SFX.staticBurst(0.2, 0.25); SFX.radioVoice(Math.min(s.dur - 0.6, 4.5), null); }
    else if (s.o.pos) SFX.radioVoice(Math.min(s.dur - 0.6, 4.5), { x: s.o.pos.x, y: 1.55, z: s.o.pos.z, pl: { x: PL.x, z: PL.z } });
  }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('toast').classList.remove('show'); }
}

// ----- compass strip -----
const CPX = 3.2; // px per degree
function buildCompass() {
  const st = $('compassStrip'); st.innerHTML = '';
  const names = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
  for (let d = -360; d <= 720; d += 15) {
    const n = ((d % 360) + 360) % 360, s = document.createElement('span');
    s.style.left = (d + 360) * CPX + 'px';
    if (names[n] !== undefined) { s.textContent = names[n]; if (n % 90 === 0) s.className = 'card'; } else s.textContent = '·';
    st.appendChild(s);
  }
}
const HUD = { t: 0, last: {}, foeOn: false, foes: [] };
// red pulsing blips on the compass for nearby threats (edge arrows when they're behind you)
function foeHUD9(w) {
  const box = $('compassFoes'), list = G.state === 'play' ? (LVL === 18 ? foes18() : LVL === 5 ? foes5() : foes9()) : [];
  HUD.foeOn = true;
  while (HUD.foes.length < 3) { const e = document.createElement('div'); e.className = 'foe hide'; e.innerHTML = '<b></b><i></i>'; box.appendChild(e); HUD.foes.push({ e, k: '' }); }
  HUD.foes.forEach((F, i) => {
    const f = list[i]; if (!f) { if (F.k !== 'x') { F.k = 'x'; F.e.classList.add('hide'); } return; }
    let a = angDiff(PL.yaw, f.ang) * 180 / Math.PI; const edge = Math.abs(a) > 62; if (edge) a = Math.sign(a) * 62;
    F.e.style.left = (w / 2 + a * CPX).toFixed(1) + 'px'; F.e.style.opacity = (0.35 + 0.65 * f.k).toFixed(2);
    const key = [f.kind, f.ch ? 1 : 0, edge ? Math.sign(a) : 0, f.fl].join('|');
    if (key !== F.k) {
      F.k = key; F.e.className = 'foe ' + (f.kind === 'm' ? 'watch' : 'wretch') + (f.kind === 'ws' ? ' stir' : '') + (f.ch ? ' chase' : '') + (edge ? ' edge' : '');
      F.e.firstChild.textContent = edge ? (a < 0 ? '◀' : '▶') : '';
      F.e.lastChild.textContent = f.fl > 0 ? '▲' : f.fl < 0 ? '▼' : '';
    }
  });
}
// Level 9 noise meter: the bar is how much noise you make; the amber mark is how loud you can be before the nearest Wretch in this house hears you
function noiseHUD9() {
  const on = LVL === 9 && G.state === 'play'; if (HUD.nzOn !== on) { HUD.nzOn = on; $('noise9').classList.toggle('hide', !on); }
  if (!on) return;
  const n = clamp(PL.noise, 0, 1), H = hearLimit9(), mk = H.lim !== null && H.lim < 1;
  hset('nzFill', (n * 100).toFixed(1) + '%', '__w'); $('nzFill').style.width = (n * 100).toFixed(1) + '%';
  const m = $('nzMark'); if (mk) m.style.left = (clamp(H.lim, 0.01, 1) * 100).toFixed(1) + '%';
  if (HUD.nzMk !== mk) { HUD.nzMk = mk; m.classList.toggle('hide', !mk); if (mk && !G9.markTip) { G9.markTip = true; later(0.8, () => { if (LVL === 9 && G.state === 'play') toast('A WRETCH IS NEAR · KEEP YOUR NOISE LEFT OF THE MARK', 3.2); }); } }
  const st = H.hunt ? 'hunt' : H.heard ? 'heard' : H.sus > 0.3 ? 'stir' : mk && n > H.lim * 0.7 ? 'near' : '';
  hset('nzTxt', st === 'hunt' ? 'HUNTED' : st === 'heard' ? 'HEARD!' : st === 'stir' ? 'IT STIRS…' : n < 0.02 ? 'SILENT' : n < 0.2 ? 'QUIET' : n < 0.6 ? 'NOISY' : 'LOUD');
  hset('noise9', st, 'className');
}
function hset(id, v, prop = 'textContent') { if (HUD.last[id + prop] === v) return; HUD.last[id + prop] = v; $(id)[prop] = v; }
function fmtTC(s) { s = Math.max(0, Math.floor(s)); return `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function updateHUD(dt) {
  // compass every frame (cheap transform)
  const w = $('compass').clientWidth, hd = ((PL.yaw * 180 / Math.PI) % 360 + 360) % 360;
  $('compassStrip').style.transform = `translateX(${(w / 2 - (hd + 360) * CPX).toFixed(1)}px)`;
  const mk = $('compassMark');
  const tg = LVL === 18 ? target18() : LVL === 5 ? target5() : LVL === 9 ? target9() : G.exitOn ? W.exit : null;
  if (tg) {
    const a = angDiff(PL.yaw, Math.atan2(tg.x - PL.x, tg.z - PL.z)) * 180 / Math.PI;
    mk.classList.toggle('hide', Math.abs(a) > 70); mk.style.left = (w / 2 + a * CPX).toFixed(1) + 'px';
    hset('compassMark', tg.fl > 0 ? '▼<i>UPSTAIRS</i>' : tg.fl < 0 ? '▼<i>DOWNSTAIRS</i>' : '▼', 'innerHTML');
  } else mk.classList.add('hide');
  noiseHUD9();
  if (LVL === 18 || LVL === 9 || LVL === 5) foeHUD9(w); else if (HUD.foeOn) { HUD.foeOn = false; $('compassFoes').innerHTML = ''; }
  const tk = $('compassTape');
  if (LVL === 0 && HINT.stage >= 3 && HINT.site) {
    const a = angDiff(PL.yaw, HINT.dir) * 180 / Math.PI;
    tk.classList.toggle('hide', Math.abs(a) > 70); tk.style.left = (w / 2 + a * CPX).toFixed(1) + 'px';
  } else tk.classList.add('hide');
  const sd = $('sigDir');
  if (LVL === 0 && HINT.stage >= 1 && HINT.site) { sd.classList.remove('hide'); sd.style.transform = `rotate(${(angDiff(PL.yaw, HINT.dir) * 180 / Math.PI).toFixed(0)}deg)`; }
  else sd.classList.add('hide');
  HUD.t -= dt; if (HUD.t > 0) return; HUD.t = 0.1;
  hset('tc', fmtTC(G.time));
  const clk = 23 * 3600 + 47 * 60 + 3 + G.time, hh = Math.floor(clk / 3600) % 24, h12 = ((hh + 11) % 12) + 1;
  hset('clock', `${h12}:${String(Math.floor(clk / 60) % 60).padStart(2, '0')}:${String(Math.floor(clk) % 60).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`);
  hset('date', clk >= 86400 ? 'SEP. 30 1996' : 'SEP. 29 1996');
  const cells = Math.ceil(PL.batt / 20);
  document.querySelectorAll('#batt .cells b').forEach((b, i) => b.classList.toggle('off', i >= cells));
  $('batt').classList.toggle('low', PL.batt < 15);
  hset('battPct', Math.ceil(PL.batt) + '%');
  hset('spare', 'SPARE ×' + PL.spare);
  hset('inv', 'WATER ×' + PL.water);
  hset('tapes', LVL === 18 ? hudObj18() : LVL === 5 ? hudObj5() : LVL === 9 ? hudObj9() : `TAPES ${G.tapes}/4`);
  hset('code', LVL === 18 ? hudItems18() : LVL === 5 ? hudItems5() : LVL === 9 ? hudItems9() : 'CODE ' + [0, 1, 2, 3].map(i => G.code[i] ?? '_').join(' '));
  $('signal').classList.toggle('hide', LVL !== 0);
  $('nvTag').classList.toggle('hide', !PL.nv);
  $('zoomTag').classList.toggle('hide', PL.zk < 0.1); hset('zoomTag', `ZOOM ${lerp(1, 2.4, PL.zk).toFixed(1)}×`);
  const bars = [['hpBar', PL.hp / 100], ['stBar', PL.sta], ['saBar', PL.san / 100]];
  for (const [id, v] of bars) { hset(id, (v * 100).toFixed(0) + '%', '__w'); $(id).style.width = (v * 100).toFixed(0) + '%'; $(id).parentNode.classList.toggle('warn', v < 0.3); }
  // tape signal: nearest untaken tape
  let nd = 1e9; for (const s of W.tapes) if (!s.taken) nd = Math.min(nd, dist2(s.x, s.z, PL.x, PL.z));
  const lvl = G.tapes >= 4 ? 0 : nd < 8 ? 5 : nd < 16 ? 4 : nd < 28 ? 3 : nd < 42 ? 2 : nd < 60 ? 1 : 0;
  document.querySelectorAll('#signal .sig b').forEach((b, i) => b.classList.toggle('on', i < lvl));
  $('signal').classList.toggle('lock', HINT.stage >= 1 && !!HINT.site);
  $('signal').classList.toggle('pulse', HINT.stage >= 2 && Math.floor(FX.t * 4) % 2 === 0);
  const f = PL.focus;
  if (f) { const al = f.altLabel && f.altLabel(); hset('prompt', (IS_TOUCH ? '' : '[E] ') + f.label() + (al ? (IS_TOUCH ? '   ·   ' : '   [RIGHT-CLICK] ') + al : '')); $('prompt').classList.add('show'); } else $('prompt').classList.remove('show');
  $('hurt').style.opacity = clamp(FX.hurt * 0.9 + (PL.hp < 30 ? 0.25 + 0.1 * Math.sin(FX.t * 4) : 0), 0, 1).toFixed(2);
}

// ----- screens -----
const SCREENS = ['loading', 'title', 'levels', 'brief', 'controls', 'settings', 'pause', 'end'];
let backTo = 'title';
function show(id) { for (const s of SCREENS) $(s).classList.toggle('hide', s !== id); }
function openLevels() {
  if (G.state !== 'title') return;
  backTo = 'title'; $('lvDiff').textContent = DIFFS[G.diff]; show('levels'); SFX.click();
  setTimeout(() => { const b = document.querySelector('.lvPick'); if (b) b.focus({ preventScroll: true }); }, 30);
}
function startLevelPick(n) {   // level select: 0 → normal tape start (briefing on first play), 9/5/18 → fresh run (Level 9 shows its field briefing on first visit)
  if (G.state !== 'title') return;
  if (n === 9) startLevel9Menu(); else if (n === 5) startLevel5Menu(); else if (n === 18) startLevel18Menu(); else startGame();
}
function hideScreens() { for (const s of SCREENS) $(s).classList.add('hide'); }
const DIFFS = ['EASY', 'NORMAL', 'NIGHTMARE'];
function saveSettings() { try { localStorage.setItem('br_settings', JSON.stringify(S)); } catch (e) {} }
function applySettings() {
  FX.amt = S.vhs; FX.exposure = 0.85 * S.bright;
  if (AU.master) AU.master.gain.value = AU.muted ? 0 : S.vol;
  if (ENG) applyQuality(+S.qual);
}
function bindUI() {
  buildCompass();
  $('btnPlay').onclick = () => startGame();
  $('btnL9').onclick = () => startLevel9Menu();
  $('btnLevels').onclick = () => openLevels();
  document.querySelectorAll('.lvPick').forEach(b => b.onclick = () => startLevelPick(+b.dataset.level));
  bindBrief();
  const setDiff = () => { $('diffLabel').textContent = DIFFS[G.diff]; };
  try { G.diff = clamp(+(localStorage.getItem('br_diff') ?? 1), 0, 2); } catch (e) {}
  setDiff();
  $('btnDiff').onclick = () => { G.diff = (G.diff + 1) % 3; setDiff(); try { localStorage.setItem('br_diff', G.diff); } catch (e) {} SFX.click(); };
  $('btnSettings').onclick = () => { backTo = 'title'; show('settings'); };
  $('btnControls').onclick = () => { backTo = 'title'; show('controls'); };
  $('btnPSettings').onclick = () => { backTo = 'pause'; show('settings'); };
  $('btnPControls').onclick = () => { backTo = 'pause'; show('controls'); };
  document.querySelectorAll('.back').forEach(b => b.onclick = () => show(backTo));
  $('btnResume').onclick = () => resumeGame();
  $('btnRestart').onclick = () => restartGame(true);
  $('btnQuit').onclick = () => restartGame(false);
  $('btnAgain').onclick = () => restartGame(true);
  $('btnCP').onclick = () => cpRetry();
  $('btnEndMenu').onclick = () => restartGame(false);
  const ids = { sSens: 'sens', sFov: 'fov', sVhs: 'vhs', sBright: 'bright', sVol: 'vol', sQual: 'qual' };
  for (const [id, k] of Object.entries(ids)) {
    const el = $(id); el.value = S[k];
    el.addEventListener('input', () => { S[k] = +el.value; applySettings(); saveSettings(); });
  }
  $('sInv').checked = !!S.inv; $('sInv').addEventListener('change', () => { S.inv = $('sInv').checked; saveSettings(); });
  document.querySelectorAll('button').forEach(b => b.addEventListener('mouseenter', () => { if (AU.ctx) SFX.click(); }));
  try { const b = +localStorage.getItem('br_best'); if (b > 0) $('bestTime').textContent = 'BEST ESCAPE ' + fmtTC(b); } catch (e) {}
  if (IS_TOUCH) { document.body.classList.add("tui"); bindTouch(); }
}
function bindTouch() {
  const stick = $('stickL'), knob = stick.querySelector('i');
  let sid = null, cx = 0, cy = 0;
  stick.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sid = t.identifier; const r = stick.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; e.preventDefault(); }, { passive: false });
  const mv = e => { for (const t of e.changedTouches) if (t.identifier === sid) { let dx = (t.clientX - cx) / 55, dy = (t.clientY - cy) / 55; const l = Math.hypot(dx, dy); if (l > 1) { dx /= l; dy /= l; } TOUCH.mx = dx; TOUCH.mz = -dy; knob.style.transform = `translate(${dx * 45}px,${dy * 45}px)`; if (l > 0.95 && dy < -0.8) K.add('ShiftLeft'); else if (!RUNHOLD) K.delete('ShiftLeft'); } e.preventDefault(); };
  stick.addEventListener('touchmove', mv, { passive: false });
  const end = e => { for (const t of e.changedTouches) if (t.identifier === sid) { sid = null; TOUCH.mx = TOUCH.mz = 0; knob.style.transform = ''; if (!RUNHOLD) K.delete('ShiftLeft'); } };
  stick.addEventListener('touchend', end); stick.addEventListener('touchcancel', end);
  const lz = $('lookZone'); let lid = null, lx = 0, ly = 0;
  lz.addEventListener('touchstart', e => { const t = e.changedTouches[0]; lid = t.identifier; lx = t.clientX; ly = t.clientY; e.preventDefault(); }, { passive: false });
  lz.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === lid) { MDX += (t.clientX - lx) * 1.6; MDY += (t.clientY - ly) * 1.6; lx = t.clientX; ly = t.clientY; } e.preventDefault(); }, { passive: false });
  lz.addEventListener('touchend', e => { for (const t of e.changedTouches) if (t.identifier === lid) lid = null; });
  document.querySelectorAll('.tbtns button').forEach(b => {
    const k = b.dataset.k, hold = b.dataset.hold;
    b.addEventListener('touchstart', e => { e.preventDefault(); if (hold) { RUNHOLD = true; K.add(k); b.classList.add('on'); } else { if (G.state === 'play') JUST.add(k); onKey(k, null); } }, { passive: false });
    b.addEventListener('touchend', e => { e.preventDefault(); if (hold) { RUNHOLD = false; K.delete(k); b.classList.remove('on'); } }, { passive: false });
  });
}
let RUNHOLD = false;
