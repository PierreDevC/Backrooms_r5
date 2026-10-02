module.exports = async (page, logs) => {
  await page.evaluate(() => { const B = window.__BR; B.startGame(true); });
  await page.waitForTimeout(3000);
  const t0 = Date.now();
  await page.evaluate(() => window.__BR.goLevel9());
  await page.waitForFunction(() => window.__BR.G.state === 'play' || window.__BR.G.state === 'intro9', null, { timeout: 240000 }).catch(e => logs.push('TIMEOUT l9'));
  logs.push('QA l9 load ms ' + (Date.now() - t0) + ' state ' + await page.evaluate(() => window.__BR.G.state));
  await page.waitForTimeout(4000);
  const info = await page.evaluate(() => { const B = window.__BR, L = B.LV9(); return { houses: L.houses.length, enter: L.houses.filter(h => h.enter).length, stairs: L.houses.filter(h => h.stair).length, rooms: L.rooms.length, fps: B.ENG().getFps().toFixed(1), meshes: B.SCN().meshes.length, st: B.G.state, obj: document.getElementById('objective') && document.getElementById('objective').textContent }; });
  logs.push('QA ' + JSON.stringify(info));
  await page.screenshot({ path: '/data/qa9/l9.png' });
};
