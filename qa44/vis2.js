const OUT = process.env.BR_QA_OUT + '/';
module.exports = async (page) => {
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); B.studyMap9(); if (B.G9.mapOpen) B.toggleMap9(); B.finishDownload(B.W9.terms[0]); });
  const s = async () => page.evaluate(() => { const n = document.getElementById('cpNote'), t = document.getElementById('toast'), cs = getComputedStyle(n), r = n.getBoundingClientRect(); return { cls: n.className, txt: n.textContent, op: cs.opacity, vis: cs.visibility, disp: cs.display, r: [r.left, r.top, r.width, r.height].map(Math.round), toastCls: t.className, toastOp: getComputedStyle(t).opacity, noteT: window.__BR.CP.noteT, state: window.__BR.G.state }; });
  console.log('QA s1 ' + JSON.stringify(await s()));
  await page.addStyleTag({ content: '*{transition:none!important}' }); await page.waitForTimeout(1500);
  console.log('QA s2 ' + JSON.stringify(await s()));
  await page.screenshot({ path: OUT + 'v_hud_cp2.png' });
};
