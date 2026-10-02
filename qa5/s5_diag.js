module.exports = async (page, logs) => {
  await page.evaluate(() => { window.addEventListener('unhandledrejection', e => console.log('QA UNHANDLED ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason))); const B = window.__BR; B.DBG.ts = 3; B.startGame(true); });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { window.__BR.goLevel5(null).then(() => console.log('QA goLevel5 resolved'), e => console.log('QA goLevel5 rejected ' + (e.stack || e))); });
  for (let i = 0; i < 60; i++) {
    await page.waitForTimeout(5000);
    const s = await page.evaluate(() => { const B = window.__BR, S = B.SCN(); let nr = []; try { for (const m of S.meshes) { if (!m.isEnabled() || !m.material || !m.subMeshes) continue; if (!m.isReady(true)) nr.push(m.name + ':' + (m.material && m.material.name)); } } catch (e) { nr.push('err ' + e.message); } return { st: B.G.state, msg: document.getElementById('loadMsg').textContent, notReady: nr.slice(0, 8), n: nr.length, meshes: S.meshes.length }; });
    logs.push('QA ' + i + ' ' + JSON.stringify(s));
    if (s.st === 'play') break;
  }
};
