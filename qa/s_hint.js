module.exports = async (page, logs) => {
  const fr = n => page.waitForTimeout(n * 1100);
  await page.evaluate(() => { window.__BR.DBG.ts = 6; });
  await page.click('#btnPlay');
  await page.waitForFunction(() => window.__BR.G.state === 'play', null, { timeout: 120000 });
  await page.evaluate(() => { const B = window.__BR; B.DBG.ts = 1; B.G.grace = 9999; for (const h of B.AI.howlers) h.place(1, 1); B.G.hintT = 70; });
  await fr(4);
  await page.screenshot({ path: '/data/qa/h1.png' });
  let i = await page.evaluate(() => { const B = window.__BR; return { st: B.HINT.stage, site: B.HINT.site && B.HINT.site.i, dir: B.HINT.dir, pd: B.HINT.pathD, yaw: B.PL.yaw }; });
  logs.push('QA stage1 ' + JSON.stringify(i));
  await page.evaluate(() => { const B = window.__BR; B.G.hintT = 200; B.PL.yaw = B.HINT.dir; });
  await fr(6);
  await page.screenshot({ path: '/data/qa/h3.png' });
  i = await page.evaluate(() => { const B = window.__BR; return { st: B.HINT.stage, subs: document.getElementById('subs').textContent, beacon: !!B.HINT.beacon, glitch: B.FX.glitch }; });
  logs.push('QA stage3 ' + JSON.stringify(i));
  // walk along the hint for 25s
  await page.evaluate(() => { const B = window.__BR; B.QAW = setInterval(() => { B.PL.yaw = B.HINT.dir; }, 50); });
  await page.keyboard.down('KeyW'); await fr(20); await page.keyboard.up('KeyW');
  i = await page.evaluate(() => { const B = window.__BR; clearInterval(B.QAW); return { pd: B.HINT.pathD, tapes: B.G.tapes, d: B.HINT.site ? Math.hypot(B.HINT.site.x - B.PL.x, B.HINT.site.z - B.PL.z) : -1 }; });
  logs.push('QA walk ' + JSON.stringify(i));
  await page.screenshot({ path: '/data/qa/h4.png' });
};
