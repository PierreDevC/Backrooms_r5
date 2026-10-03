const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT, C = 3.6;
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel7(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  const view = async (name, x, z, yaw, pitch, setup) => { await page.evaluate(([x, z, yaw, pitch, setup]) => { const B = window.__BR, PL = B.PL; if (setup) eval(setup); PL.x = x; PL.z = z; PL.cell = -1; PL.yaw = yaw; PL.pitch = pitch; for (let i = 0; i < 30; i++) B.simStep(0.05); PL.yaw = yaw; PL.pitch = pitch; B.simStep(0.02); }, [x, z, yaw, pitch, setup]); await shot(name); };
  await view('w_storm', 27 * C, 31 * C, 1.2, 0.0, 'B.GS7.storm = 0.9; B.GS7.stormTo = 0.9; B.GS7.dawn = 0; B.GS7.dawnTo = 0;');
  await view('w_stormsea', 30.5 * C, 38.5 * C, 3.14, 0.1, 'B.GS7.storm = 0.9;');
  await view('w_dawn', 27 * C, 31 * C, 1.2, 0.0, 'B.GS7.storm = 0; B.GS7.stormTo = 0; B.GS7.dawn = 1; B.GS7.dawnTo = 1;');
  await view('w_dawnsea', 30.5 * C, 38.5 * C, 0, 0.1, 'B.GS7.dawn = 1;');
  await view('w_lit', 31 * C, 20 * C, 3.14, 0.15, 'B.GS7.storm = 0; B.GS7.stormTo = 0; B.GS7.dawn = 0; B.GS7.dawnTo = 0; B.PS7.lit = true; B.PS7.gen = true; B.WS7.buoys.forEach(b => { b.on = true; b.lamp.setEnabled(true); }); B.WS7.lensGlow && B.WS7.lensGlow.setEnabled(true);');
  await view('w_under', 12 * C, 43.5 * C, 1.57, 0.2, 'B.PL.flash = true; B.PL.fk = 1; B.G37.ey = -3; B.G37.vy = 0;');
  await view('w_shadow', 40 * C, 36 * C, 0.8, 0.35, 'B.PL.flash = false; B.G37.ey = -2.5; const S = B.AIS7.shadow; S.st = "patrol"; S.place(44 * 3.6, 40 * 3.6, 3.8); S.y = -3;');
  await view('w_fen', 33 * C, 47.3 * C, 3.14, 0.0, 'B.PL.flash = true; B.G37.ey = -2.0; B.PS7.air = true;');
};
