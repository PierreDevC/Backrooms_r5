module.exports = async (page, logs) => {
  const err = await page.evaluate(async () => { try { await window.__BR.goLevel9(null); return 'ok'; } catch (e) { return 'ERR ' + e.message + '\n' + e.stack; } });
  logs.push('QA goLevel9 ' + err); if (err !== 'ok') return;
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 300; i++) B.simStep(1 / 60); B.SUBS.q.length = 0; B.SUBS.cur = null; document.getElementById('subs').innerHTML = ''; B.DBG.ts = 0.0001; const K = B.W9.kiosk; B.PL.x = K.x; B.PL.z = K.z + 1.3; B.PL.yaw = Math.PI; B.PL.pitch = 0.1; B.PL.cell = -1; });
  const shot = async (name, fn, wait = 2600) => { const r = await page.evaluate(fn); if (r) logs.push('QA ' + name + ' ' + JSON.stringify(r)); await page.waitForTimeout(wait); await page.screenshot({ path: '/data/qa9/' + name + '.png' }); };
  await shot('k1', () => { const B = window.__BR; return { vhs: B.VHS ? 1 : 0, exp: B.FX.exposure }; });
  await shot('k2', () => { const B = window.__BR; B.W9.kiosk.sc.mesh.isVisible = false; });
  await shot('k3', () => { const B = window.__BR; const s = B.W9.kiosk.sc; s.mesh.isVisible = true; s.mat.emissiveColor.set(0.3, 0.3, 0.3); });
  await shot('k4', () => { const B = window.__BR; const s = B.W9.kiosk.sc; s.mat.emissiveTexture = null; s.mat.emissiveColor.set(1, 0, 0); });
};
