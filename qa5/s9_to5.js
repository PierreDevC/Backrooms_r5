module.exports = async (page, logs) => {
  const st = () => page.evaluate(() => window.__BR.G.state);
  const waitSt = async (s, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await st() === s) return true; await page.waitForTimeout(1000); } logs.push('QA TIMEOUT waiting ' + s); return false; };
  await page.evaluate(() => { window.addEventListener('unhandledrejection', e => console.log('QA UNHANDLED ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason))); window.__BR.DBG.ts = 3; });
  // Level 0 quick check
  await page.evaluate(() => window.__BR.startGame(true));
  await waitSt('play', 120000);
  logs.push('QA L0 ' + JSON.stringify(await page.evaluate(() => ({ st: window.__BR.G.state, tapes: document.getElementById('tapes').textContent, code: document.getElementById('code').textContent, sig: !document.getElementById('signal').classList.contains('hide'), meshes: window.__BR.SCN().meshes.length }))));
  await page.screenshot({ path: '/data/qa5/l0.png' });
  // Level 9
  await page.evaluate(() => window.__BR.goLevel9());
  await waitSt('play', 300000);
  logs.push('QA L9 ' + JSON.stringify(await page.evaluate(() => { const B = window.__BR, L = B.LV9(); return { st: B.G.state, houses: L.houses.length, enter: L.houses.filter(h => h.enter).length, obj: (document.getElementById('objective') || {}).textContent, tapes: document.getElementById('tapes').textContent, body: document.body.className, meshes: B.SCN().meshes.length }; })));
  await page.screenshot({ path: '/data/qa5/l9.png' });
  await page.evaluate(() => { const B = window.__BR; B.PL.hp = 63; B.PL.spare = 3; B.DBG.ts = 10; B.win9(); });
  const t0 = Date.now();
  while (Date.now() - t0 < 300000) { const s = await page.evaluate(() => ({ st: window.__BR.G.state, lvl5: document.body.classList.contains('lvl5') })); if (s.lvl5 && (s.st === 'intro' || s.st === 'play')) break; await page.waitForTimeout(1000); }
  await page.evaluate(() => { window.__BR.DBG.ts = 3; });
  await waitSt('play', 120000);
  logs.push('QA L9->L5 ' + JSON.stringify(await page.evaluate(() => { const B = window.__BR; return { st: B.G.state, body: document.body.className, phase: B.G5.phase, from: B.G5.from, hp: Math.round(B.PL.hp), spare: B.PL.spare, obj: (document.getElementById('objective') || {}).textContent, l5btn: localStorage.getItem('br_l5') }; })));
  await page.screenshot({ path: '/data/qa5/l9to5.png' });
};
