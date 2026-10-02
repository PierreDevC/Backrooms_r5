module.exports = async (page, logs) => {
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/data/qa/title.png' });
  const fps = await page.evaluate(() => window.__BR.ENG().getFps());
  logs.push('QA fps ' + fps.toFixed(1));
};
