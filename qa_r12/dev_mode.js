// r12 developer mode: settings screens, every in-game option, the TAB-hold menu with its virtual cursor, and the debug overlay with stats placed in all four corners
const assert = require('node:assert/strict');
const path = require('path');
module.exports = async (page) => {
  const check = (c, m) => { assert.ok(c, m); console.log('QA PASS ' + m); };
  page.on('pageerror', e => console.log('PAGEERROR ' + e.message));
  await page.evaluate(() => { try { localStorage.removeItem('br_settings'); } catch (e) {} });
  // ---- settings: off by default, on reveals the developer screen ----
  const s0 = await page.evaluate(() => { const B = window.__BR; return { dev: B.S.dev, btn: !document.getElementById('btnDevSet').classList.contains('hide'), hud: !document.getElementById('devHud').classList.contains('hide') }; });
  check(!s0.dev && !s0.btn && !s0.hud, 'developer mode is off by default: no button, no badge');
  const s1 = await page.evaluate(() => {
    const B = window.__BR, c = document.getElementById('sDev'); document.getElementById('btnSettings').click(); c.checked = true; c.dispatchEvent(new Event('change'));
    const btn = !document.getElementById('btnDevSet').classList.contains('hide'); document.getElementById('btnDevSet').click();
    const o = { btn, screen: !document.getElementById('devset').classList.contains('hide'), opts: document.querySelectorAll('#devOptList input').length, stats: document.querySelectorAll('#dbgStatList [data-st]').length, pos: document.getElementById('sDbgPos').options.length, perStat: document.querySelectorAll('#dbgStatList select').length, saved: JSON.parse(localStorage.getItem('br_settings')).dev };
    document.getElementById('btnDevBack').click(); o.back = !document.getElementById('settings').classList.contains('hide'); document.querySelector('#settings .back').click(); return o;
  });
  check(s1.btn && s1.screen, 'DEVELOPER MODE shows DEVELOPER SETTINGS and the screen opens');
  check(s1.opts === 9 && s1.stats === 17 && s1.pos === 4, `developer screen lists ${s1.opts} options, ${s1.stats} stats and one position choice with 4 corners`);
  check(s1.perStat === 0, 'there is no per-stat position: one global setting');
  check(s1.saved === true && s1.back, 'the setting is saved and BACK returns to settings');
  // ---- into Level 9 ----
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN && (B.RUN.f = {}); B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play', 'brief9'].includes(window.__BR.G.state), null, { timeout: 400000 });
  const r = await page.evaluate(() => {
    const B = window.__BR, { PL, G, DEV } = B, o = {}; if (G.state === 'brief9') B.startIntro9();
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    G.grace = 1e9; B.AI9.watch.length = 0; const step = (n, dt = 0.05) => { for (let i = 0; i < n; i++) B.simStep(dt); };
    const set = (k, v) => { B.S.devOpts[k] = v; };
    for (const [k] of B.DEV_OPTS) set(k, false);
    o.hud = !document.getElementById('devHud').classList.contains('hide'); B.devTick(performance.now());
    // vitality / stamina / sanity / batteries
    PL.hp = 10; PL.sta = 0.1; PL.san = 5; PL.batt = 3; PL.fbatt = 3; step(3); o.offHp = PL.hp;
    set('hp', true); set('sta', true); set('san', true); set('batt', true); PL.hp = 10; PL.sta = 0.1; PL.san = 5; PL.batt = 3; PL.fbatt = 3; step(3);
    o.inf = { hp: PL.hp, hpMax: B.hpMax ? B.hpMax() : 100, sta: PL.sta, san: PL.san, batt: PL.batt, fbatt: PL.fbatt };
    // a hard hit and a death with vitality infinite
    B.hurt(500, 'test'); o.hitState = G.state; o.hitHp = PL.hp; B.die('test'); o.dieState = G.state;
    set('hp', false); set('god', true); PL.hp = 50; B.hurt(500, 'test'); o.godHit = [G.state, PL.hp]; B.die('test'); o.godDie = G.state;
    set('god', false);
    // fast move: open street, hold W
    const run = () => { PL.x = 20 * 3.6; PL.z = 16 * 3.6; PL.cell = -1; PL.yaw = Math.PI / 2; PL.vx = PL.vz = 0; PL.crouch = false; B.K.add('KeyW'); step(20); B.K.delete('KeyW'); return PL.x - 20 * 3.6; };
    o.walk = run(); set('fast', true); B.S.devFast = 3; o.fast = run(); set('fast', false);
    // fly: Space climbs, the camera follows, C does not crouch, noclip above the roofs
    set('fly', true); PL.x = 20 * 3.6; PL.z = 16 * 3.6; B.K.add('Space'); step(30); B.K.delete('Space'); o.fy = DEV.fy; B.PL.yaw = 0; B.simStep(0.05);
    B.playerCamera && B.playerCamera(0.016); o.camY = B.CAM().position.y; o.noclipHigh = B.devOn('noclip') || DEV.fy > 3.4;
    B.K.add('KeyC'); step(30); B.K.delete('KeyC'); o.down = DEV.fy; o.crouch = PL.crouch; set('fly', false); step(40); o.landed = DEV.fy;
    // noclip: walk straight through a house wall
    const L = B.LVs(), wall = L.pieces.find(p => p.k === 'w' && p.horiz && p.x1 - p.x0 > 3 && p.sa && p.sb && (p.sa.m === 'siding' || p.sb.m === 'siding') && p.z0 > 20);
    const through = () => { PL.x = (wall.x0 + wall.x1) / 2; PL.z = wall.z0 - 1.0; PL.cell = -1; PL.yaw = 0; PL.vx = PL.vz = 0; B.K.add('KeyW'); step(40); B.K.delete('KeyW'); return PL.z; };
    o.wall = [wall.z0, wall.z1]; o.blocked = through(); set('noclip', true); o.through = through(); set('noclip', false);
    // enemies ignore the player: a Watch with a clear view, facing us, 8 m down the street
    // a clear 8 m view down a street (cars and lamps are random, so search for one)
    let sp = null; for (const zr of [15.5, 16.5, 29.5, 30.5]) for (let x = 6 * 3.6; x < 40 * 3.6 && !sp; x += 1.2) { const z = zr * 3.6; if (B.los(x, z, x + 8, z) && B.los(x, z + 0.4, x + 8, z + 0.4) && B.los(x, z - 0.4, x + 8, z - 0.4)) sp = { wx: x, px: x + 8, z }; }
    o.spot = sp;
    const watchTest = ign => { G.grace = 0; set('ignore', ign); B.AI9.watch.length = 0; const w = B.spawnWatch(); PL.x = sp.px; PL.z = sp.z; PL.cell = -1; PL.yaw = -Math.PI / 2; PL.flash = false; w.place(sp.wx, sp.z, Math.PI / 2); w.st = 'patrol'; w.stT = 0; w.leaveT = 0; w.look = 0; for (let i = 0; i < 60; i++) { PL.x = sp.px; PL.z = sp.z; B.simStep(0.05); } const st = w.st; B.AI9.watch.length = 0; return st; };
    o.watchSees = 'patrol'; for (let i = 0; i < 4 && o.watchSees === 'patrol'; i++) o.watchSees = watchTest(false); o.watchIgnores = 'patrol'; for (let i = 0; i < 4 && o.watchIgnores === 'patrol'; i++) o.watchIgnores = watchTest(true); set('ignore', false); G.grace = 1e9;
    o.after = G.state;
    return o;
  });
  console.log('QA data', JSON.stringify(r));
  check(r.hud, 'the DEV MODE badge shows in play');
  check(r.offHp < 20, 'with the options off, low vitality stays low');
  check(r.inf.hp >= r.inf.hpMax - 0.01 && r.inf.sta === 1 && r.inf.san >= 99 && r.inf.batt === 100 && r.inf.fbatt === 100, 'infinite vitality / stamina / sanity / batteries refill every frame');
  check(r.hitState === 'play' && r.hitHp >= 1 && r.dieState === 'play', 'with infinite vitality a 500-point hit and die() do not kill');
  check(r.godHit[0] === 'play' && r.godHit[1] >= 1 && r.godDie === 'play', 'CANNOT DIE survives a hit and die()');
  check(r.fast > r.walk * 2.4, `FAST MOVE covers ${(r.fast / r.walk).toFixed(1)}x the distance (${r.walk.toFixed(1)} m -> ${r.fast.toFixed(1)} m)`);
  check(r.fy > 4 && r.camY > 5, `FLY: Space climbs (${r.fy.toFixed(1)} m), the camera follows (y ${r.camY.toFixed(1)})`);
  check(r.noclipHigh && r.down < r.fy - 3 && !r.crouch, 'FLY: C descends without crouching; above the roofs nothing blocks');
  check(r.landed < 0.5, 'switching FLY off brings you back to the ground');
  check(r.blocked < r.wall[0] + 0.05 && r.through > r.wall[1], `NOCLIP walks through a wall (blocked at z ${r.blocked.toFixed(2)}, through to ${r.through.toFixed(2)})`);
  check(r.watchSees !== 'patrol' && r.watchIgnores === 'patrol', `a Watch with a clear view notices you (${r.watchSees}) unless ENEMIES IGNORE ME (${r.watchIgnores})`);
  // ---- the TAB-hold menu with its virtual cursor ----
  await page.evaluate(() => { const B = window.__BR; B.G9.mapSeen = true; B.G9.mapOpen = false; for (const [k] of B.DEV_OPTS) B.S.devOpts[k] = false; B.PL.x = 20 * 3.6; B.PL.z = 16 * 3.6; B.G.state = 'play'; });
  // M is the Level 9 map now (and no longer mutes); a quick Tab tap opens and closes the menu without touching the map
  await page.keyboard.press('KeyM'); await page.evaluate(() => window.__BR.simStep(0.05));
  const tap = await page.evaluate(() => ({ map: window.__BR.G9.mapOpen, menu: window.__BR.DEV.open, muted: window.__BR.AU.muted })); await page.evaluate(() => window.__BR.toggleMap9());
  check(tap.map && !tap.menu && !tap.muted, 'M opens the Level 9 map and does not mute');
  await page.keyboard.press('Tab'); const tt = await page.evaluate(() => ({ open: window.__BR.DEV.open, map: window.__BR.G9.mapOpen }));
  check(!tt.open && !tt.map, 'a Tab tap leaves the menu closed and the map alone');
  await page.keyboard.down('Tab'); await page.waitForFunction(() => window.__BR.DEV.open, null, { timeout: 5000 });
  const open = await page.evaluate(() => { const m = document.getElementById('devMenu'); return { open: window.__BR.DEV.open, vis: !m.classList.contains('hide'), rows: m.querySelectorAll('[data-devopt]').length, badge: getComputedStyle(document.getElementById('devBadge')).display }; });
  check(open.open && open.vis && open.rows === 9 && open.badge === 'none', 'holding TAB expands the badge into the menu of 9 options');
  const box = await page.evaluate(() => { const r = document.querySelector('[data-devopt="fly"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const yaw0 = await page.evaluate(() => window.__BR.PL.yaw);
  await page.mouse.move(box[0] - 30, box[1] - 5); await page.mouse.move(box[0], box[1]); await page.waitForTimeout(100);
  const hov = await page.evaluate(() => !!document.querySelector('#devMenu .dvRow.hov[data-devopt="fly"]'));
  await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(100);
  const clicked = await page.evaluate(() => ({ fly: window.__BR.S.devOpts.fly, yaw: window.__BR.PL.yaw, rowOn: document.querySelector('[data-devopt="fly"]').classList.contains('on'), saved: JSON.parse(localStorage.getItem('br_settings')).devOpts.fly }));
  check(hov, 'the virtual cursor highlights the row under the mouse');
  check(clicked.fly === true && clicked.rowOn && clicked.saved === true, 'clicking a row toggles the option, updates the menu and saves it');
  await page.keyboard.up('Tab'); await page.waitForTimeout(150);
  const closed = await page.evaluate(() => ({ open: window.__BR.DEV.open, vis: !document.getElementById('devMenu').classList.contains('hide'), badge: getComputedStyle(document.getElementById('devBadge')).display }));
  check(!closed.open && !closed.vis && closed.badge !== 'none', 'releasing TAB collapses the menu back to the badge');
  // ---- the debug overlay: every stat, four corners ----
  const d = await page.evaluate(async () => {
    const B = window.__BR, o = {}; B.G9.mapOpen = false; B.S.dbg = true; B.DBG_STATS.forEach(([id]) => { B.S.dbgStats[id].on = true; });
    const panels = () => ['tl', 'tr', 'bl', 'br'].map(p => { const el = document.getElementById('dbg_' + p); return [p, !el.classList.contains('hide'), el.querySelectorAll('div').length]; });
    o.at = {}; for (const p of ['tl', 'tr', 'bl', 'br']) { const sel = document.getElementById('sDbgPos'); sel.value = p; sel.dispatchEvent(new Event('change')); B.devTick(performance.now() + 1000 + Object.keys(o.at).length * 500); o.at[p] = panels(); }
    o.saved = JSON.parse(localStorage.getItem('br_settings')).dbgPos;
    await new Promise(r => setTimeout(r, 1200)); o.stats = B.devStatsText(); o.expected = B.DBG_STATS.map(s => s[0]); return o;
  });
  console.log('QA stats', JSON.stringify(d.stats));
  for (const p of ['tl', 'tr', 'bl', 'br']) check(d.at[p].every(c => c[1] === (c[0] === p)) && d.at[p].find(c => c[0] === p)[2] === 17, `DEBUG STATS POSITION ${p.toUpperCase()}: all 17 stats show in that corner and no other`);
  check(d.saved === 'br', 'the position is saved');
  check(d.expected.every(id => d.stats[id] !== undefined), 'every one of the 17 stats has a value');
  check(+d.stats.fps > 0 && /ms/.test(d.stats.frame) && +d.stats.draws > 0 && +d.stats.totalMeshes > +d.stats.activeMeshes && +d.stats.textures > 0 && +d.stats.materials > 0 && +d.stats.geoms > 0, 'fps, frame time, draw calls, meshes, textures, materials and geometries read sensibly');
  const w = await page.evaluate(() => { const B = window.__BR; for (const id of Object.keys(B.S.dbgStats)) B.S.dbgStats[id].on = id === 'fps'; B.devTick(performance.now() + 8000); return ['tl', 'tr', 'bl', 'br'].map(p => { const el = document.getElementById('dbg_' + p); return el.classList.contains('hide') ? 0 : el.querySelectorAll('div').length; }); });
  check(JSON.stringify(w) === JSON.stringify([0, 0, 0, 1]), 'with only FPS ticked, one line shows in the chosen corner');
  await page.screenshot({ path: path.join(process.env.BR_QA_OUT || '.', 'dev_mode_overlay.png') });
  await page.evaluate(() => { const B = window.__BR; B.S.dbg = false; B.devTick(performance.now() + 9000); });
  const errs = await page.evaluate(() => window.__BR.ERRS); check(!errs.n, 'no frame errors');
};
