// r4.4 QA: checkpoints on Level 0 (Easy), Level 5 (Normal), Level 18 (Easy): save, die, retry keeps progress
module.exports = async (page) => {
  const R = {};
  const dieAndRetry = async (cause) => {
    const d = await page.evaluate((cause) => {
      const B = window.__BR, o = {};
      B.hurt(500, cause); for (let i = 0; i < 100 && !B.DEATH.shown; i++) B.simStep(0.05);
      const b = document.getElementById('btnCP'); o.state = B.G.state; o.btnCP = !b.classList.contains('hide') && b.textContent; o.again = document.getElementById('btnAgain').textContent;
      return o;
    }, cause);
    if (d.btnCP) await page.click('#btnCP');
    return d;
  };
  // ---- Level 0
  await page.evaluate(() => { const B = window.__BR; B.G.diff = 0; B.startGame(true); });
  R.l0 = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, CP, AI } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    o.state = G.state; o.cp0 = CP.on && CP.on.label; o.water = PL.water; o.items = W.items.filter(i => i.type === 'water').length;
    B.takeTape(W.tapes[0]); B.takeTape(W.tapes[1]); o.cp = CP.on.label; o.note = document.getElementById('cpNote').textContent;
    for (let i = 0; i < 160; i++) B.simStep(0.05);   // let the tape-2 Howler spawn etc.
    // a Howler right on top of the checkpoint
    const h = AI.howlers[0]; h.place(CP.on.x + 1, CP.on.z, 0); h.st = 'chase'; h.lk = { x: PL.x, z: PL.z };
    o.nH = AI.howlers.length;
    return o;
  });
  R.l0d = await dieAndRetry('howler');
  R.l0a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, CP, AI } = B, o = {};
    o.state = G.state; o.tapes = G.tapes; o.code = G.code.length; o.taken = W.tapes.filter(t => t.taken).length;
    o.hDist = AI.howlers.map(h => +Math.hypot(h.x - PL.x, h.z - PL.z).toFixed(1)); o.hSt = AI.howlers.map(h => h.st);
    for (let i = 0; i < 100; i++) B.simStep(0.05); o.state2 = G.state; o.errs = B.ERRS.n;
    return o;
  });
  // ---- Level 5 (Normal)
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.G5.from = null; B.goLevel5(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.LV5, null, { timeout: 240000 });
  R.l5 = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, CP, W5, G5, AI5 } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    o.state = G.state; o.cp0 = CP.on && CP.on.label; o.water = PL.water; o.items = W.items.filter(i => i.type === 'water').length;
    for (const k of W5.keys) B.takeKey5(k); o.cpK = CP.on.label;
    B.unlockStaff5(W5.svDoor); o.cpS = CP.on.label;
    B.startTp5(true); for (let i = 0; i < 40 && G5.tp; i++) B.simStep(0.05); o.cpB = CP.on.label;
    B.finishValve5(W5.valves[0]); o.cpV = CP.on.label; o.nMoth = AI5.moths.length;
    for (let i = 0; i < 40; i++) B.simStep(0.05); o.mothSt = AI5.moths.map(m => m.st).join(',');
    return o;
  });
  R.l5d = await dieAndRetry('moth');
  R.l5a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, CP, G5, AI5, W5 } = B, o = {};
    o.state = G.state; o.keys = G5.keys; o.valves = G5.valves; o.phase = G5.phase; o.turned = W5.valves.filter(v => v.turned).length;
    o.mothSt = AI5.moths.map(m => m.st).join(','); o.atCP = Math.hypot(PL.x - CP.on.x, PL.z - CP.on.z) < 0.05;
    for (let i = 0; i < 100; i++) B.simStep(0.05); o.state2 = G.state; o.errs = B.ERRS.n;
    return o;
  });
  // ---- Level 18 (Easy)
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 0; B.G18.from = null; B.goLevel18(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.LV18 && window.__BR.W18.drawings && window.__BR.W18.drawings.length, null, { timeout: 240000 });
  R.l18 = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, CP, W18, G18, AI18 } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    o.state = G.state; o.cp0 = CP.on && CP.on.label; o.water = PL.water; o.items = W.items.filter(i => i.type === 'water').length;
    B.takeDrawing18(W18.drawings[0]); o.cpD = CP.on.label; o.phase = G18.phase;
    (B.takeCrayons18 && !B.P18.crayons && B.takeCrayons18()), (B.M18 && (B.M18.signed = true)), B.pinDrawings18();   // r6: the door needs crayons before it can be finished
 o.cpP = CP.on.label;
    B.takeDrawing18(W18.drawings[1]); o.cpD2 = CP.on.label;
    for (let i = 0; i < 60; i++) B.simStep(0.05); o.fog = AI18.fog.map(f => f.st).join(',');
    return o;
  });
  R.l18d = await dieAndRetry('forgotten');
  R.l18a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, CP, G18, AI18 } = B, o = {};
    o.state = G.state; o.found = G18.found; o.pinned = G18.pinned.length; o.carry = G18.carry.length; o.fog = AI18.fog.map(f => f.st).join(',');
    for (let i = 0; i < 100; i++) B.simStep(0.05); o.state2 = G.state; o.errs = B.ERRS.n;
    return o;
  });
  console.log('QA cpl ' + JSON.stringify(R));
};
