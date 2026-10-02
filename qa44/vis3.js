const OUT = process.env.BR_QA_OUT + '/', VW = process.env.VW || 'd';
module.exports = async (page) => {
  await page.addStyleTag({ content: '*{transition:none!important}' });
  for (const L of [9, 18]) {
    await page.evaluate((L) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; (L === 9 ? B.G9 : B.G18).from = null; (L === 9 ? B.goLevel9 : B.goLevel18)(null); }, L);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
    await page.evaluate((L) => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
      if (L === 9) { B.studyMap9(); if (B.G9.mapOpen) B.toggleMap9(); B.finishDownload(B.W9.terms[0]); } else { B.takeDrawing18(B.W18.drawings[0]); }
      B.updateHUD(0.1); }, L);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: OUT + `v3_${VW}_L${L}.png` });
  }
  await page.evaluate(() => { const B = window.__BR; B.hurt(500, 'forgotten'); for (let i = 0; i < 100 && !B.DEATH.shown; i++) B.simStep(0.05); });
  await page.waitForTimeout(500); await page.screenshot({ path: OUT + `v3_${VW}_end.png` });
  console.log('QA vis3 ' + VW);
};
