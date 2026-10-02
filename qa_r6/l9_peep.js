// r6 QA: Level 9 door peephole — fisheye night lens on the other side of the door, enemy on the porch.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1500); await page.screenshot({ path: path.join(out, 'r6_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN.f = {}; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W9, W, AI9 } = B, o = {}, DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    const dr = W9.doors.find(d => d.dk === 'front'), e = dr.e, inside = B.LV.bld[B.cIdx(e.x, e.y)] >= 0, s = inside ? 1 : -1;   // e.x,e.y is the house cell; +d points out
    PL.x = dr.mx - DX[e.d] * 1.0; PL.z = dr.mz - DY[e.d] * 1.0; PL.cell = -1; PL.yaw = Math.atan2(DX[e.d], DY[e.d]); PL.pitch = 0.05; PL.flash = false;
    for (let i = 0; i < 4; i++) B.simStep(0.05);
    B.latchDoor(dr);
    // something on the porch, facing the door
    const w = B.spawnWatch() || AI9.watch[AI9.watch.length - 1]; const wx = dr.mx + DX[e.d] * 2.3, wz = dr.mz + DY[e.d] * 2.3; w.place(wx, wz, Math.atan2(-DX[e.d], -DY[e.d])); window.__QWP = [wx, wz, Math.atan2(-DX[e.d], -DY[e.d])];
    for (let i = 0; i < 6; i++) B.simStep(0.05);
    const it = W.interact.find(i => i.door === dr); o.prompt = it.label() + ' | ' + it.altLabel() + ' | ' + it.alt2Label(); o.focus = B.findInteract() === it;
    window.__QP = { dr, w };
    return o;
  });
  console.log('QA peep setup ' + JSON.stringify(a)); ok(/PEEPHOLE/.test(a.prompt), 'a closed door offers the peephole');
  await page.keyboard.press('KeyV'); await page.evaluate(() => { for (let i = 0; i < 12; i++) { const { w } = window.__QP; const p = window.__QWP; w.place(p[0], p[1], p[2]); window.__BR.simStep(0.05); } });
  const b = await page.evaluate(() => { const B = window.__BR, C = B.CAM(), { dr } = window.__QP; return { on: !!B.PEEPH.dr, k: B.PEEPH.k, near: +(B.PEEPH.near || 0).toFixed(2), prompt: document.getElementById('prompt').className, fov: +C.fov.toFixed(2), camD: +Math.hypot(C.position.x - dr.mx, C.position.z - dr.mz).toFixed(2), pass: !!B.PEEPpp() }; });
  await shot('peephole_porch');
  console.log('QA peep ' + JSON.stringify(b)); ok(b.on && b.k > 0.9 && b.fov > 1.8 && b.camD < 0.3, 'V puts the camcorder to the peephole, wide lens'); ok(b.pass, 'the fisheye pass exists in Level 9'); ok(b.near > 0.3, 'the figure on the porch registers (the lens breathes, the heart goes)');
  // look a little to the side, then V again to step back
  await page.evaluate(() => { const B = window.__BR; B.PL.yaw += 2; for (let i = 0; i < 4; i++) B.simStep(0.05); window.__QP.clamped = +Math.abs(B.PL.yaw - B.PEEPH.yaw).toFixed(2); });
  await page.keyboard.press('KeyV'); await page.evaluate(() => { for (let i = 0; i < 12; i++) window.__BR.simStep(0.05); });
  const c = await page.evaluate(() => ({ on: !!window.__BR.PEEPH.dr, k: window.__BR.PEEPH.k, clamped: window.__QP.clamped }));
  console.log('QA peep off ' + JSON.stringify(c)); ok(c.clamped <= 0.76, 'the lens only turns so far'); ok(!c.on && c.k < 0.05, 'V again steps back');
  // walking ends it too; an open door has no peephole
  const d = await page.evaluate(() => { const B = window.__BR, { dr } = window.__QP; B.peepToggle9(dr); B.simStep(0.05); B.PL.x += 0.5; for (let i = 0; i < 6; i++) B.simStep(0.05); const on1 = !!B.PEEPH.dr; B.latchDoor(dr); B.useDoor(dr); for (let i = 0; i < 20; i++) B.simStep(0.05); const it = B.W.interact.find(i => i.door === dr); return { on1, open: dr.target, a2: it.alt2Label() }; });
  console.log('QA peep move ' + JSON.stringify(d)); ok(!d.on1, 'a step ends it'); ok(d.open === 1 && d.a2 === null, 'an open door has no peephole');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
