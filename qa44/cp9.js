// r4.4 QA: level select L9, right-click latch, Ctrl no longer crouches, Level 9 checkpoints (Normal) + Nightmare has none, unload guard
module.exports = async (page) => {
  const R = {};
  const canvas = await page.$('#c');
  // --- level select has Level 9
  R.picks = await page.evaluate(() => { window.__BR.openLevels(); return [...document.querySelectorAll('.lvPick')].map(b => b.dataset.level + ':' + b.textContent.trim()); });
  R.unloadTitle = await page.evaluate(() => { const e = new Event('beforeunload', { cancelable: true }); dispatchEvent(e); return e.defaultPrevented; });
  await page.evaluate(() => { window.__BR.G.diff = 1; });
  await page.click('.lvPick[data-level="9"]');
  await page.waitForFunction(() => window.__BR.LV9 && ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
  R.a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, K, W9, G9, AI9, CP } = B, o = {};
    for (let i = 0; i < 800 && G.state !== 'play'; i++) B.simStep(0.05);
    o.state = G.state; o.lvl = B.LV9 ? 9 : -1; o.cp0 = CP.on && CP.on.label; o.water = PL.water;
    o.unloadPlay = (() => { const e = new Event('beforeunload', { cancelable: true }); dispatchEvent(e); return e.defaultPrevented; })();
    // Ctrl does not crouch any more
    K.add('ControlLeft'); for (let i = 0; i < 20; i++) B.simStep(0.05); o.ctrlCk = +PL.ck.toFixed(3); K.clear();
    K.add('KeyC'); /* C is a toggle via JUST in real input */ K.clear();
    // map + 2 terminals
    B.studyMap9(); B.simStep(0.05); if (G9.mapOpen) B.toggleMap9(); o.cpMap = CP.on.label;
    const terms = W9.terms; B.finishDownload(terms[0]); B.finishDownload(terms[1]);
    o.cp2 = CP.on.label; o.cpAt = [+CP.on.x.toFixed(2), +CP.on.z.toFixed(2)];
    const LV = B.LV9(), c = B.cIdx(B.cellOf(CP.on.x), B.cellOf(CP.on.z)); o.cpZone = LV.zone[c]; o.cpBld = LV.bld[c]; o.h1 = terms[1].h.id;
    return o;
  });
  // --- right-click latch on a closed front door
  R.latch = await page.evaluate(() => {
    const B = window.__BR, { PL, W9, G } = B, o = {};
    Object.defineProperty(document, 'pointerLockElement', { get: () => document.getElementById('c'), configurable: true });
    const dr = W9.doors.find(d => d.dk === 'front' && !d.target && !d.latched);
    const f = dr.e, DXv = [0, 1, 0, -1], DYv = [-1, 0, 1, 0];
    // stand on the street side, 1.2 m out, facing the door
    const t = B.cpPorch9(B.LV9().houses[dr.house]); PL.x = t.x; PL.z = t.z; PL.yaw = Math.atan2(dr.mx - PL.x, dr.mz - PL.z); PL.pitch = 0.05; PL.cell = -1; B.updateField();
    for (let i = 0; i < 4; i++) B.simStep(0.03);
    o.focusDoor = !!(PL.focus && PL.focus.door === dr); B.updateHUD(0.03); o.prompt = document.getElementById('prompt').textContent;
    const c = document.getElementById('c');
    c.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); B.simStep(0.03);
    o.latched = dr.latched; o.zoom = +PL.zk.toFixed(2);
    dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
    c.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); B.simStep(0.03);
    o.unlatched = !dr.latched;
    dispatchEvent(new MouseEvent('mouseup', { button: 2 }));
    // X still works
    B.K.add('KeyX'); document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyX', bubbles: true })); dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyX' })); B.simStep(0.03); o.xLatch = dr.latched; dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyX' }));
    if (dr.latched) B.latchDoor(dr);
    // right-click away from any door = hold-zoom
    PL.yaw += Math.PI; for (let i = 0; i < 3; i++) B.simStep(0.03);
    o.focusNone = !PL.focus || !B.hasAlt(PL.focus);
    c.dispatchEvent(new MouseEvent('mousedown', { button: 2, bubbles: true })); for (let i = 0; i < 20; i++) B.simStep(0.05); o.zoomHeld = +PL.zk.toFixed(2);
    dispatchEvent(new MouseEvent('mouseup', { button: 2 })); for (let i = 0; i < 20; i++) B.simStep(0.05); o.zoomRel = +PL.zk.toFixed(2);
    return o;
  });
  // --- die at the 3rd computer with its Wretch chasing, retry from checkpoint
  R.die = await page.evaluate(() => {
    const B = window.__BR, { PL, W9, G9, AI9, G, CP } = B, o = {};
    const T = W9.terms[2]; PL.x = T.x; PL.z = T.z; PL.cell = -1; B.updateField(); B.simStep(0.03); B.startDownload(T);
    const ws = AI9.wretches.filter(w => w.present && w.h === T.h); for (const w of ws) { w.st = 'chase'; w.stT = 0; w.lk = { x: PL.x, z: PL.z }; }
    PL.crouch = true; for (let i = 0; i < 30; i++) B.simStep(0.05);
    B.hurt(500, 'wretch'); for (let i = 0; i < 90 && !B.DEATH.shown; i++) B.simStep(0.05);
    o.state = G.state; o.shown = B.DEATH.shown; o.T3active = T.active; o.nW = ws.length;
    const b = document.getElementById('btnCP'), a = document.getElementById('btnAgain');
    o.btnCP = !b.classList.contains('hide') && b.textContent; o.again = a.textContent; o.againPrimary = a.classList.contains('primary');
    o.endVisible = !document.getElementById('end').classList.contains('hide');
    return o;
  });
  await page.click('#btnCP');
  R.after = await page.evaluate(() => {
    const B = window.__BR, { PL, W9, G9, AI9, G, CP } = B, o = {};
    o.state = G.state; o.atCP = Math.hypot(PL.x - CP.on.x, PL.z - CP.on.z) < 0.05; o.hp = PL.hp; o.data = G9.data;
    o.done = W9.terms.map(t => t.done); o.T3active = W9.terms[2].active;
    const T = W9.terms[2]; o.w3 = AI9.wretches.filter(w => w.present && w.h === T.h).map(w => w.st + ':' + Math.hypot(w.x - w.home.x, w.z - w.home.z).toFixed(2));
    o.endHidden = document.getElementById('end').classList.contains('hide'); o.osd = !document.getElementById('osd').classList.contains('hide');
    for (let i = 0; i < 12; i++) B.simStep(0.05); o.fade06 = +B.FX.fadeB.toFixed(2);
    for (let i = 0; i < 48; i++) B.simStep(0.05);
    o.fadeMid0 = null; o.state2 = G.state; o.fadeB = +B.FX.fadeB.toFixed(2); o.toast = document.getElementById('toast').textContent; o.objective = document.getElementById('objective').textContent;
    o.retries = CP.retries; o.errs = B.ERRS.n;
    return o;
  });
  // --- Nightmare: no checkpoint
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 2; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  R.nm = await page.evaluate(() => {
    const B = window.__BR, { PL, W9, G, CP } = B, o = {};
    for (let i = 0; i < 800 && G.state !== 'play'; i++) B.simStep(0.05);
    o.cpStart = CP.on; B.finishDownload(W9.terms[0]); o.cpAfter = CP.on; o.water = PL.water;
    B.hurt(500, 'watch'); for (let i = 0; i < 90 && !B.DEATH.shown; i++) B.simStep(0.05);
    o.btnCPHidden = document.getElementById('btnCP').classList.contains('hide'); o.again = document.getElementById('btnAgain').textContent; o.againPrimary = document.getElementById('btnAgain').classList.contains('primary');
    return o;
  });
  console.log('QA cp9 ' + JSON.stringify(R));
};
