module.exports = async (page, logs) => {
  const fr = n => page.waitForTimeout(n * 1100);
  await page.evaluate(() => { window.__BR.DBG.ts = 6; });
  await fr(3);
  await page.screenshot({ path: '/data/qa/m_title.png' });
  await page.tap('#btnPlay');
  await page.waitForFunction(() => window.__BR.G.state === 'play', null, { timeout: 120000 });
  await page.evaluate(() => { window.__BR.DBG.ts = 1; window.__BR.G.grace = 9999; });
  await fr(3);
  await page.screenshot({ path: '/data/qa/m_play.png' });
  logs.push('QA touch ' + await page.evaluate(() => { const t = document.querySelector('.tbtns'); return t ? getComputedStyle(t.parentElement).display + ' ' + window.__BR.IS_TOUCH : 'none'; }));
};
