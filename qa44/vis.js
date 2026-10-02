// r4.4 visual checks: level select, controls, Level 9 briefing slide 3, HUD checkpoint note, end screen with the checkpoint button
const OUT = process.env.BR_QA_OUT + '/';
module.exports = async (page) => {
  await page.evaluate(() => window.__BR.openLevels()); await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + 'v_levels.png' });
  await page.evaluate(() => { document.getElementById('levels').classList.add('hide'); document.getElementById('controls').classList.remove('hide'); }); await page.waitForTimeout(200);
  await page.screenshot({ path: OUT + 'v_controls.png' });
  await page.evaluate(() => document.getElementById('controls').classList.add('hide'));
  // Level 9 with briefing (clear the seen flag)
  await page.evaluate(() => { localStorage.removeItem('br_brief9'); const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => window.__BR.G.state === 'brief9', null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; B.briefStep(1); B.briefStep(1); }); await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + 'v_brief9_s3.png' });
  await page.evaluate(() => { const B = window.__BR; B.closeBrief ? B.closeBrief() : 0; if (B.G.state === 'brief9') B.startIntro9(); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 60000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); B.DBG.ts = 0; B.studyMap9(); if (B.G9.mapOpen) B.toggleMap9(); B.finishDownload(B.W9.terms[0]); B.updateHUD(0.1); });
  await page.waitForTimeout(600);
  await page.screenshot({ path: OUT + 'v_hud_cp.png' });
  await page.evaluate(() => { const B = window.__BR; B.DBG.ts = 1; B.hurt(500, 'wretch'); for (let i = 0; i < 100 && !B.DEATH.shown; i++) B.simStep(0.05); });
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT + 'v_end_cp.png' });
  console.log('QA vis done ' + JSON.stringify(await page.evaluate(() => ({ st: window.__BR.G.state, cp: document.getElementById('btnCP').textContent, focus: document.activeElement && document.activeElement.id }))));
};
