// r5 visual QA: screenshots of each level from a few viewpoints (flashlight on/off), env VIEWS filters levels
const OUT = process.env.BR_QA_OUT + '/', TAG = process.env.TAG || 'a', LVLS = (process.env.LVLS || '0,9,5,18').split(',').map(Number);
module.exports = async (page) => {
  await page.addStyleTag({ content: '*{transition:none!important} #osd,#subs,#toast{opacity:0!important}' });
  for (const L of LVLS) {
    await page.evaluate((L) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1;
      if (L === 0) B.startGame(true); else if (L === 9) { B.G9.from = null; B.goLevel9(null); } else if (L === 5) { B.G5.from = null; B.goLevel5(null); } else { B.G18.from = null; B.goLevel18(null); } }, L);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 300000 });
    await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 600 && B.G.state !== 'play'; i++) B.simStep(0.05); B.DBG.ts = 0; });
    const P0 = await page.evaluate(() => { const P = window.__BR.PL; return { x: P.x, z: P.z, yaw: P.yaw }; });
    const views = [[0, 0, 0, 0, 1], [0, 0, Math.PI / 2, 0.0, 0], [0, 0, Math.PI, -0.35, 1], [0, 0, -Math.PI / 2, 0.45, 1]];
    let i = 0;
    for (const [dx, dz, dy, pitch, fl] of views) {
      await page.evaluate(([x, z, yaw, pitch, fl]) => { const B = window.__BR, P = B.PL; P.x = x; P.z = z; P.yaw = yaw; P.pitch = pitch; P.flash = !!fl; P.fk = fl; B.DBG.ts = 0; },
        [P0.x + dx, P0.z + dz, P0.yaw + dy, pitch, fl]);
      await page.waitForTimeout(2500);
      await page.screenshot({ path: OUT + `L${L}_${TAG}${i++}.jpg`, quality: 80 });
    }
    console.log('QA vis5 L' + L + ' ' + JSON.stringify(P0) + ' fps ' + (await page.evaluate(() => window.__BR.ENG().getFps().toFixed(1))));
    await page.evaluate(() => { window.__BR.DBG.ts = 1; });
  }
};
