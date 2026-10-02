module.exports = async (page, logs) => {
  const shot = async (n) => { await page.waitForTimeout(1500); await page.screenshot({ path: '/data/qa5/' + n + '.png' }); logs.push('QA shot ' + n); };
  const st = () => page.evaluate(() => window.__BR.G.state);
  const waitSt = async (s, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await st() === s) return true; await page.waitForTimeout(1000); } logs.push('QA TIMEOUT waiting ' + s); return false; };
  await page.evaluate(() => { window.addEventListener('unhandledrejection', e => console.log('QA UNHANDLED ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason))); const B = window.__BR; B.DBG.ts = 3; });
  // start from the title menu path: startLevel5Menu requires state title
  await page.evaluate(() => { window.__BR.goLevel5(null); });
  await waitSt('play', 240000);
  // guest room with flashlight
  const g = await page.evaluate(() => { const B = window.__BR, L = B.LV5(), N = Math.round(L.zone.length ** 0.5), gr = L.guest.find(r => r.cells.length > 1) || L.guest[0], c = gr.cells[gr.cells.length - 1]; return { x: (c % N + 0.5) * B.CELL5(), z: (((c / N) | 0) + 0.5) * B.CELL5(), dx: (gr.door.x + 0.5) * B.CELL5(), dz: (gr.door.y + 0.5) * B.CELL5(), num: gr.num }; });
  await page.evaluate(g => { const B = window.__BR, P = B.PL; P.x = g.x; P.z = g.z; P.yaw = Math.atan2(g.dx - g.x, g.dz - g.z) + Math.PI; P.flash = true; P.fk = 1; }, g);
  await shot('guest'); logs.push('QA guest ' + g.num);
  await page.evaluate(g => { const B = window.__BR, P = B.PL; P.yaw = Math.atan2(g.dx - g.x, g.dz - g.z); }, g);
  await shot('guest_door');
  // boiler hall 2 lit by flashlight, with a moth in view
  const h = await page.evaluate(() => { const B = window.__BR, v = B.W5.valves[1]; return { x: v.x, z: v.z }; });
  await page.evaluate(h => { const B = window.__BR, P = B.PL; P.x = h.x - 3; P.z = h.z; P.yaw = Math.PI / 2; P.flash = true; P.fk = 1; P.hp = 100; }, h);
  await shot('boiler_lit');
  const m = await page.evaluate(() => { const B = window.__BR, P = B.PL, m = B.AI5.moths.find(q => q.boil) || B.AI5.moths[0]; m.x = P.x + Math.sin(P.yaw) * 2.6; m.z = P.z + Math.cos(P.yaw) * 2.6; if (m.root) m.root.position.set(m.x, 1.7, m.z); m.st = 'hunt'; return { st: m.st, boil: m.boil, keys: Object.keys(m).slice(0, 30).join(',') }; });
  logs.push('QA moth ' + JSON.stringify(m));
  await shot('moth');
  const hp = await page.evaluate(() => ({ hp: window.__BR.PL.hp, san: window.__BR.PL.san, st: window.__BR.G.state, foes: window.__BR.foes5().length }));
  logs.push('QA after moth ' + JSON.stringify(hp));
  // death → end screen → retry
  await page.evaluate(() => { const B = window.__BR; if (B.G.state === 'play') B.die('moth'); B.DBG.ts = 10; });
  await page.waitForFunction(() => !document.getElementById('end').classList.contains('hide'), null, { timeout: 180000 }).catch(() => logs.push('QA TIMEOUT death end'));
  logs.push('QA death ' + JSON.stringify(await page.evaluate(() => ({ st: window.__BR.G.state, k: document.getElementById('endKicker').textContent, t: document.getElementById('endTitle').textContent, b: document.getElementById('btnAgain').textContent }))));
  await page.screenshot({ path: '/data/qa5/death.png' });
  await page.evaluate(() => { const B = window.__BR; B.DBG.ts = 3; B.restartGame(true); });
  await waitSt('play', 240000);
  logs.push('QA retry ' + JSON.stringify(await page.evaluate(() => ({ st: window.__BR.G.state, phase: window.__BR.G5.phase, keys: window.__BR.G5.keys, meshes: window.__BR.SCN().meshes.length, hp: window.__BR.PL.hp }))));
  // win → full end screen
  await page.evaluate(() => { const B = window.__BR; B.setPhase5('exit'); B.DBG.ts = 10; B.win5(); });
  await page.waitForFunction(() => !document.getElementById('end').classList.contains('hide'), null, { timeout: 180000 }).catch(() => logs.push('QA TIMEOUT win end'));
  logs.push('QA win ' + JSON.stringify(await page.evaluate(() => ({ st: window.__BR.G.state, k: document.getElementById('endKicker').textContent, t: document.getElementById('endTitle').textContent, b: document.getElementById('btnAgain').textContent, stats: document.getElementById('endStats').textContent }))));
  await page.screenshot({ path: '/data/qa5/win.png' });
  // play again → Level 0 title
  await page.evaluate(() => { const B = window.__BR; B.DBG.ts = 1; B.restartGame(false); });
  await waitSt('title', 180000);
  logs.push('QA back to title ' + JSON.stringify(await page.evaluate(() => ({ st: window.__BR.G.state, l5btn: !document.getElementById('btnL5').classList.contains('hide'), l9btn: !document.getElementById('btnL9').classList.contains('hide'), body: document.body.className }))));
  await page.screenshot({ path: '/data/qa5/title.png' });
};
