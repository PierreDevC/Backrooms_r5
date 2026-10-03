const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT, C = 3.6;
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel7(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) || (window.__BR.ERRS && window.__BR.ERRS.n > 0), null, { timeout: 240000 });
  const a = await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); for (let i = 0; i < 30; i++) B.simStep(0.05);
    const LV = B.LV7(); return { st: B.G.state, errs: B.ERRS.n, last: B.ERRS.last, rooms: LV.rooms.length, ladders: B.WS7.ladders.length, buoys: B.WS7.buoys.length, obj: B.obj7 && B.obj7(), ey: B.G37.ey, cam: B.CAM && 1 }; });
  console.log('A ' + JSON.stringify(a));
  const view = async (name, x, z, yaw, pitch = 0, y) => { await page.evaluate(([x, z, yaw, pitch, y]) => { const B = window.__BR, PL = B.PL; PL.x = x; PL.z = z; PL.cell = -1; PL.yaw = yaw; PL.pitch = pitch; for (let i = 0; i < 24; i++) B.simStep(0.05); PL.yaw = yaw; PL.pitch = pitch; B.simStep(0.02); }, [x, z, yaw, pitch, y]); await shot(name); };
  const views = (process.env.V7 || 'raft,rigS,deck,radio,gen,ship,cape,pier,hab,wreck').split(',');
  const V = { raft: [30.5 * C, 39 * C, -Math.PI / 2 + 0.2, 0.05], rigS: [30.5 * C, 38.5 * C, 0, 0.1], deck: [27 * C, 31 * C, 1.2, 0.0], radio: [28 * C, 25.2 * C, -1.4, 0.0], gen: [35.5 * C, 27.6 * C, 0, 0.0], ship: [11 * C, 42.5 * C, 0.3, 0.0], cape: [31 * C, 15.5 * C, 3.14, 0.1], pier: [47 * C, 30.6 * C, 1.57, 0.0], hab: [33 * C, 47 * C, 3.14, 0.0], wreck: [14 * C, 52 * C, 1.57, 0.0], lamp: [2.5 * C, 3 * C, 0.5, 0], bridge: [2.5 * C, 60 * C, 0.5, 0], tower: [31.5 * C, 11.5 * C, 0, 0], cottage: [34.5 * C, 11.5 * C, 1.57, 0], engine: [19.5 * C, 44.5 * C, 3.14, 0.0], sky: [30.5 * C, 39 * C, 0, 0.9] };
  for (const v of views) if (V[v]) await view('l7_' + v, V[v][0], V[v][1], V[v][2], V[v][3]);
  const e = await page.evaluate(() => ({ errs: window.__BR.ERRS.n, last: window.__BR.ERRS.last })); console.log('E ' + JSON.stringify(e));
};
