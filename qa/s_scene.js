module.exports = async (page, logs) => {
  await page.evaluate(() => { document.getElementById('title').classList.add('hide'); });
  await page.waitForTimeout(6000);
  await page.screenshot({ path: '/data/qa/scene.png' });
  const info = await page.evaluate(() => { const B = window.__BR, s = B.SCN(); return { fps: B.ENG().getFps(), meshes: s.getActiveMeshes().length, total: s.meshes.length, cam: B.CAM().position.toString(), light: B.lightAt(B.CAM().position.x, B.CAM().position.z), fade: B.FX.fadeB }; });
  logs.push('QA ' + JSON.stringify(info));
};
