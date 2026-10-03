const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT, C = 3.6;
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel2(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) || (window.__BR.ERRS && window.__BR.ERRS.n > 0), null, { timeout: 240000 });
  const a = await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); for (let i = 0; i < 30; i++) B.simStep(0.05);
    const LV = B.LV2(); return { st: B.G.state, errs: B.ERRS.n, last: B.ERRS.last, rooms: LV.rooms.length, faces: B.AIP2.faces.length, phones: B.WP2.phones.length, vents: B.WP2.vents.length, obj: B.obj2() }; });
  console.log('A ' + JSON.stringify(a));
  const view = async (name, x, z, yaw, pitch = 0, fl = true) => { await page.evaluate(([x, z, yaw, pitch, fl]) => { const B = window.__BR, PL = B.PL; PL.x = x; PL.z = z; PL.cell = -1; PL.yaw = yaw; PL.pitch = pitch; PL.flash = fl; for (let i = 0; i < 24; i++) B.simStep(0.05); PL.yaw = yaw; PL.pitch = pitch; B.simStep(0.02); }, [x, z, yaw, pitch, fl]); await shot(name); };
  const views = (process.env.V2 || 'sump,spine,office,hall,gall,camp,switch,long,valve,lift,cold').split(',');
  const V = { sump: [23.5 * C, 41.8 * C, Math.PI], spine: [23.5 * C, 33 * C, Math.PI], office: [24.4 * C, 28.5 * C, Math.PI / 2], hall: [28.5 * C, 25.5 * C, Math.PI / 2 + 0.3], gall: [14.5 * C, 24 * C, Math.PI], camp: [5.5 * C, 27.3 * C, 0], switch: [23.5 * C, 13 * C, Math.PI], long: [26 * C, 18.5 * C, Math.PI / 2], valve: [34.5 * C, 41.5 * C, -Math.PI / 2], lift: [40 * C, 8.5 * C, Math.PI / 2], cold: [21.5 * C, 36 * C, Math.PI], camp2: [5 * C, 27.2 * C, 0.4], hall2: [31.5 * C, 32.6 * C, Math.PI], ida: [25.2 * C, 29.6 * C, 2.2], faces: [26 * C, 10 * C, -2.2], hound: [44.5 * C, 26 * C, 0] };
  for (const v of views) if (V[v]) await view('l2_' + v, V[v][0], V[v][1], V[v][2], 0.05);
  const e = await page.evaluate(() => ({ errs: window.__BR.ERRS.n, last: window.__BR.ERRS.last })); console.log('E ' + JSON.stringify(e));
};
