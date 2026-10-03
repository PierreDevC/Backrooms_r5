module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel2(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    window.T = { log: [],
      step(s) { for (let i = 0; i < s * 20; i++) { B.PL.hp = Math.max(B.PL.hp, 60); B.simStep(0.05); } },
      act(re, hold) { const it = B.W.interact.find(i => { try { return re.test(i.label()); } catch (e) { return false; } }); if (!it) { T.log.push('NO ' + re); return false; }
        B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); if (it.ok && !it.ok()) { T.log.push('NOTOK ' + re + ' ' + it.label()); return false; } it.act(); T.step(hold || 0.3); T.log.push('ok ' + re + ' | ' + B.obj2()); return true; },
      st() { return { obj: B.obj2(), errs: B.ERRS.n, last: B.ERRS.last, regs: B.GP2.regs, state: B.G.state, hp: Math.round(B.PL.hp), heat: +B.GP2.heat.toFixed(2), surges: B.GP2.surges }; } }; });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  const path = require('path'), out = process.env.BR_QA_OUT;
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(900); await page.screenshot({ path: path.join(out, name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await run('setup', () => { const B = window.__BR; B.PP2.step = 3; B.PP2.surgesOn = true; B.PP2.met = true; B.PP2.phoneMet = true; B.setPhase2('regs'); return T.st(); });
  await run('surge', () => { const B = window.__BR, C = 3.6; B.PL.x = 23.5 * C; B.PL.z = 33.5 * C; B.PL.cell = -1; B.PL.yaw = Math.PI; B.PL.flash = true; B.GP2.surgeT = 0.5; for (let i = 0; i < 300; i++) { B.PL.hp = 100; B.simStep(0.05); } return [B.GP2.surge && B.GP2.surge.st, B.GP2.surge && B.GP2.surge.k]; });
  await shot('l2_surge');
  await run('shelterview', () => { const B = window.__BR, C = 3.6; B.PL.x = 22.4 * C; B.PL.z = 31.5 * C; B.PL.cell = -1; B.PL.yaw = Math.PI / 2; for (let i = 0; i < 20; i++) { B.PL.hp = 100; B.simStep(0.05); } return B.GP2.surge && B.GP2.surge.st; });
  await shot('l2_shelter');
  await run('die', () => { const B = window.__BR; B.endSurge2(); B.cpSave('TEST'); B.die('steam'); T.step(4); return [B.G.state, B.G.cause]; });
  await run('retry', () => { const B = window.__BR; B.cpRetry(); T.step(6); return [B.G.state, Math.round(B.PL.hp), B.ERRS.n, B.ERRS.last, B.GP2.surge, B.PP2.step]; });
  await run('views', () => { const B = window.__BR, C = 3.6; B.PL.x = 36.5 * C; B.PL.z = 41.5 * C; B.PL.cell = -1; B.PL.yaw = -Math.PI / 2; for (let i = 0; i < 20; i++) B.simStep(0.05); return 1; });
  await shot('l2_valvedoor');
  await run('sump', () => { const B = window.__BR, C = 3.6; B.PL.x = 23.5 * C; B.PL.z = 40.3 * C; B.PL.cell = -1; B.PL.yaw = Math.PI * 0.8; for (let i = 0; i < 20; i++) B.simStep(0.05); return 1; });
  await shot('l2_sump2');
};
