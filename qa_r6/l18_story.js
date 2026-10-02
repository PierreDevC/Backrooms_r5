// r6 QA: Level 18 art room, crayons before the door, the fifth drawing, the lost and found, the letter, an ending built from the run's flags.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1300); await page.screenshot({ path: path.join(out, 'r6_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  const flags = { power0: 'battery', reyes0: 'helped', log0: true, lost0: 1, nine0: true, abara9: true, hale9: 'saved', pruitt5: 'opened', pruittN: 522 };
  await page.evaluate((f) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 0; B.RUN.f = f; B.G18.from = null; B.goLevel18(null); }, flags);
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W18 && window.__BR.W18.drawings && window.__BR.W18.drawings.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, W, W18, LV18, P18 } = B, LV = LV18(), o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    for (let i = 0; i < 240; i++) B.simStep(0.05);
    o.state = G.state; o.art = !!LV.art; o.artSafe = LV.art && LV.art.cells.every(c => W18.bright[c]);
    o.labels = W.interact.map(i => { try { return i.label(); } catch (e) { return ''; } }).filter(l => /CRAYONS|LOST|ART|TAKE THE DRAWING/.test(l));
    o.radio = B.SUBS.cur && B.SUBS.cur.who; o.classDoor = !!W18.classDoor && W18.classDoor.e.dk === 'class';
    return o;
  });
  console.log('QA l18 start ' + JSON.stringify(a));
  ok(a.state === 'play' && a.art && a.artSafe, 'art room built and counted as a bright, safe room'); ok(a.classDoor, 'the Sunshine Room door is still the class door the Dino opens');
  ok(a.labels.some(l => /CRAYONS/.test(l)) && a.labels.some(l => /LOST/.test(l)), 'crayons and lost & found usable');
  const go = (re) => page.evaluate((src) => { const B = window.__BR, { W, PL } = B, re = new RegExp(src), it = W.interact.filter(i => { try { return re.test(i.label()) && i.ok(); } catch (e) { return false; } })[0]; if (!it) return false; PL.x = it.x; PL.z = it.z; PL.cell = -1; for (let i = 0; i < 3; i++) B.simStep(0.05); it.act(); return true; }, re.source);
  const b = {};
  b.lost = await go(/LOST & FOUND/);
  Object.assign(b, await page.evaluate(() => ({ lostDoc: document.getElementById('docB').textContent })));
  await shot('lostfound18');
  // the Sunshine Room: letter
  Object.assign(b, await page.evaluate(() => { const B = window.__BR; B.setPhase18('memories'); B.readNote18('desk'); return { letter: document.getElementById('docT').textContent, artLead: !!B.taskOf('art') }; }));
  // all four drawings, pinned before the crayons
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, { W18, G18 } = B; for (const d of W18.drawings) B.takeDrawing18(d); for (let i = 0; i < 80; i++) B.simStep(0.05); B.PL.x = W18.board.x; B.PL.z = W18.board.z; B.pinDrawings18(); for (let i = 0; i < 40; i++) B.simStep(0.05);
    const X = B.W.interact.find(i => /DOOR/.test(i.label()) && Math.hypot(i.x - W18.exitDoor.x, i.z - W18.exitDoor.z) < 0.1); return { phase: G18.phase, on: W18.exitDoor.on, exitLabel: X.label(), obj: document.getElementById('objective').textContent }; }));
  // the art room: the fifth drawing and the crayons
  await page.evaluate(() => { const B = window.__BR, a = B.W18.p18.art, { PL } = B; PL.x = a.x0 + 1.0; PL.z = a.z1 - 1.0; PL.cell = -1; PL.yaw = Math.atan2((a.x0 + a.x1) / 2 - PL.x, a.z0 + 1 - PL.z); PL.pitch = -0.05; for (let i = 0; i < 8; i++) B.simStep(0.05); });
  await shot('artroom18');
  b.cam = await go(/TAKE THE DRAWING/); b.cray = await go(/TAKE THE CRAYONS/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 20; i++) B.simStep(0.05); return { camera: B.P18.camera, crayons: B.P18.crayons, obj2: document.getElementById('objective').textContent }; }));
  b.color = await go(/COLOR IN THE DOOR/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, X = B.W18.exitDoor; for (let i = 0; i < 70; i++) { B.PL.x = X.x; B.PL.z = X.z; B.simStep(0.05); } for (let i = 0; i < 80; i++) B.simStep(0.05); return { phase2: B.G18.phase, on2: X.on, tasks: B.TASKS.list.filter(t => !t.opt).map(t => t.id + (t.done ? '✓' : '')) }; }));
  b.walk = await go(/WALK THROUGH/);
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 160 && !B.DEATH.shown; i++) B.simStep(0.05); });
  await page.waitForTimeout(500);
  Object.assign(b, await page.evaluate(() => ({ end: document.getElementById('endTitle').textContent, endText: document.getElementById('endText').textContent, f: window.__BR.RUN.f })));
  await page.screenshot({ path: path.join(out, 'r6_end18.png') });
  console.log('QA l18 story ' + JSON.stringify(b));
  ok(b.lost && /T\.B\./.test(b.lostDoc) && /REYES/.test(b.lostDoc) && /HALE, M\./.test(b.lostDoc) && /rye/.test(b.lostDoc), 'lost & found lists objects from earlier choices');
  ok(/LETTER/.test(b.letter) && b.artLead, 'the letter opens on paper and points at crayons');
  ok(b.phase === 'color' && !b.on && /NEEDS COLOR/.test(b.exitLabel) && /CRAYONS/.test(b.obj), 'four pinned without crayons: the door waits for color');
  ok(b.cam && b.camera && b.cray && b.crayons && /COLOR IN THE DOOR/.test(b.obj2), 'fifth drawing and crayons taken in the art room');
  ok(b.color && b.phase2 === 'exit' && b.on2, 'coloring the door finishes it'); ok(b.walk && b.end === 'YOU REMEMBERED', 'the ending plays');
  ok(/Hale's name/.test(b.endText) && /one name/.test(b.endText) && /bad joke/.test(b.endText) && /still running/.test(b.endText) && /522/.test(b.endText), 'the ending remembers Hale, the lost explorer, Reyes, room 522 and the camera');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
