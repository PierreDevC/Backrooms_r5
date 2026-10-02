// r5: the cp9 latch prompt read "" once because updateHUD's text section runs at 10 Hz (HUD.t throttle); read it with a full HUD tick
module.exports = async (page) => {
  await page.evaluate(() => { window.__BR.openLevels(); window.__BR.G.diff = 1; });
  await page.click('.lvPick[data-level="9"]');
  await page.waitForFunction(() => window.__BR.LV9 && ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
  const o = await page.evaluate(() => {
    const B = window.__BR, { PL, W9, G } = B, o = {};
    for (let i = 0; i < 600 && G.state !== 'play'; i++) B.simStep(0.05);
    Object.defineProperty(document, 'pointerLockElement', { get: () => document.getElementById('c'), configurable: true });
    const dr = W9.doors.find(d => d.dk === 'front' && !d.target && !d.latched);
    const t = B.cpPorch9(B.LV9().houses[dr.house]); PL.x = t.x; PL.z = t.z; PL.yaw = Math.atan2(dr.mx - PL.x, dr.mz - PL.z); PL.pitch = 0.05; PL.cell = -1; B.updateField();
    for (let i = 0; i < 4; i++) B.simStep(0.03);
    o.focusDoor = !!(PL.focus && PL.focus.door === dr);
    B.updateHUD(0.03); o.prompt003 = document.getElementById('prompt').textContent;
    B.updateHUD(0.2); o.promptTick = document.getElementById('prompt').textContent; o.shown = document.getElementById('prompt').classList.contains('show');
    return o;
  });
  console.log('QA prompt9 ' + JSON.stringify(o));
};
