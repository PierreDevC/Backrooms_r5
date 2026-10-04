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
  const views = (process.env.V2 || 'sump,spine,office,hall,gall,camp,switch,long,valve,lift,cold,tank').split(',');
  const V = { sump: [26.5, 49.6, Math.PI * 0.9], spine: [27.5, 40, Math.PI], office: [29.3, 32.5, Math.PI / 2], hall: [37.7, 35.0, 3.3], gall: [3.5, 22.5, Math.PI], camp: [4.4, 30.2, 1.2],
    switch: [27.5, 12.3, Math.PI], long: [30, 19.5, Math.PI / 2], valve: [40.6, 46.5, -Math.PI / 2], lift: [45.5, 8.5, Math.PI / 2], cold: [26.6, 42.6, -1.8], tank: [19.5, 24.5, Math.PI / 2] };
  for (const v of views) if (V[v]) await view('l2_' + v, V[v][0] * C, V[v][1] * C, V[v][2], 0.05);
  const e = await page.evaluate(() => ({ errs: window.__BR.ERRS.n, last: window.__BR.ERRS.last })); console.log('E ' + JSON.stringify(e));
};
