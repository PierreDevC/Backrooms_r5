const out = n => require('path').join(process.env.BR_QA_OUT, n);
module.exports = async (page) => {
  await page.waitForTimeout(300);
  await page.screenshot({ path: out('title_m' + page.viewportSize().width + '.png') });
  await page.click('#btnLevels'); await page.waitForTimeout(200);
  const r = await page.evaluate(() => { const p = document.querySelector('#levels .panel').getBoundingClientRect(); const o = [...document.querySelectorAll('.lvPick,#levels .back')].map(b => { const q = b.getBoundingClientRect(); return [q.left >= p.left - 1 && q.right <= p.right + 1, b.scrollWidth <= b.clientWidth + 1, Math.round(q.height)]; }); return { fits: p.bottom <= innerHeight + 1 || document.querySelector('#levels .panel').scrollHeight > 0, o }; });
  console.log('QA mobile ' + JSON.stringify(r));
  await page.screenshot({ path: out('levels_m' + page.viewportSize().width + '.png') });
};
