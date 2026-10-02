// r6 QA: Level 9 terminal download pushes the camera in on the screen as it progresses; looking away or a hunting Wretch lets go.
const path = require('path');
const STAND = `const sp = (T) => { const dx = T.x - T.scr.x, dz = T.z - T.scr.z, l = Math.hypot(dx, dz) || 1; return { x: T.scr.x + dx / l * 1.1, z: T.scr.z + dz / l * 1.1 }; };`;
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 0; B.RUN.f = {}; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
  const step = (n) => page.evaluate((n) => { const B = window.__BR, { PL, W9, AI9 } = B, T = W9.terms[0]; for (let i = 0; i < n; i++) { for (const w of AI9.wretches) { w.sus = 0; if (w.st !== 'dormant') w.st = 'dormant'; } { const dx = T.x - T.scr.x, dz = T.z - T.scr.z, l = Math.hypot(dx, dz) || 1; PL.x = T.scr.x + dx / l * 1.1; PL.z = T.scr.z + dz / l * 1.1; } B.simStep(0.05); } const H = B.hearLimit9(); return { sus: +(H.sus || 0).toFixed(2), hunt: H.hunt, chase: +B.G.chase.toFixed(2), pitch: +PL.pitch.toFixed(2), tz: +(PL.tz || 0).toFixed(3), fov: +B.CAM().fov.toFixed(3), prog: +(T.prog / T.need).toFixed(2), active: T.active, done: T.done }; }, n);
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W9 } = B, T = W9.terms[0], o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    { const dx = T.x - T.scr.x, dz = T.z - T.scr.z, l = Math.hypot(dx, dz) || 1; PL.x = T.scr.x + dx / l * 1.1; PL.z = T.scr.z + dz / l * 1.1; } PL.cell = -1; PL.yaw = Math.atan2(T.scr.x - PL.x, T.scr.z - PL.z); PL.pitch = 0.4; PL.flash = false;
    for (let i = 0; i < 6; i++) B.simStep(0.05); o.fov0 = +B.CAM().fov.toFixed(3);
    B.startDownload(T); return o;
  });
  const s1 = await step(30);
  await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1000); await page.screenshot({ path: path.join(out, 'r6_termzoom_early.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; });
  const need = await page.evaluate(() => window.__BR.W9.terms[0].need);
  const s2 = await step(Math.round(need / 0.05 * 0.6) - 30);
  await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1000); await page.screenshot({ path: path.join(out, 'r6_termzoom_late.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; });
  const away = await page.evaluate(() => { const B = window.__BR, { PL, W9 } = B, T = W9.terms[0]; PL.yaw += 1.6; for (let i = 0; i < 12; i++) { { const dx = T.x - T.scr.x, dz = T.z - T.scr.z, l = Math.hypot(dx, dz) || 1; PL.x = T.scr.x + dx / l * 1.1; PL.z = T.scr.z + dz / l * 1.1; } B.simStep(0.05); } return { tz: +(PL.tz || 0).toFixed(3) }; });
  const back = await page.evaluate(() => { const B = window.__BR, { PL, W9 } = B, T = W9.terms[0]; PL.yaw = Math.atan2(T.scr.x - PL.x, T.scr.z - PL.z); for (let i = 0; i < 30; i++) { { const dx = T.x - T.scr.x, dz = T.z - T.scr.z, l = Math.hypot(dx, dz) || 1; PL.x = T.scr.x + dx / l * 1.1; PL.z = T.scr.z + dz / l * 1.1; } B.simStep(0.05); } const o = { tzBefore: +(PL.tz || 0).toFixed(3) }; const w = B.AI9.wretches.find(w => w.present && w.inHouse(PL.cell)); o.wretch = !!w; if (w) for (let i = 0; i < 12; i++) { { const dx = T.x - T.scr.x, dz = T.z - T.scr.z, l = Math.hypot(dx, dz) || 1; PL.x = T.scr.x + dx / l * 1.1; PL.z = T.scr.z + dz / l * 1.1; } w.st = 'chase'; w.place(PL.x + 2.5, PL.z, 0); B.simStep(0.05); w.st = 'chase'; } o.tzChase = +(PL.tz || 0).toFixed(3); return o; });
  const fin = await step(400);
  console.log('QA termzoom ' + JSON.stringify({ a, s1, s2, away, back, fin }));
  ok(s1.tz > 0.15 && s1.fov < a.fov0, 'zoom starts as the download starts');
  ok(s2.tz > s1.tz + 0.3 && s2.fov < s1.fov, 'zoom deepens as the download progresses');
  ok(away.tz < 0.1, 'looking away lets the zoom go'); ok(back.tzBefore > 0.3 && (!back.wretch || back.tzChase < 0.1), back.wretch ? 'a hunting Wretch lets the zoom go' : 'zoom back on the screen (no Wretch in this house to test the chase)');
  ok(fin.done && fin.tz < 0.05, 'zoom releases when the transfer completes');
  const errs = await page.evaluate(() => window.__BR.ERRS); ok(!errs.n, 'no recovered frame errors');
};
