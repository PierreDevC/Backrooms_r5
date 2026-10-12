// Reuse the strict quest chain; never bypass the hotel lock or hatch focus.
module.exports = async page => {
  await require('./s37_story')(page);
  await page.locator('#btnAgain').click();
  await page.waitForFunction(() => window.__BR.G.state === 'intro' && window.__BR.WP2?.pos?.arrive, null, { timeout: 240000 });
  const data = await page.evaluate(() => {
    const B = window.__BR;
    for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    return { state: B.G.state, errors: B.ERRS.n, hp: B.PL.hp, speed: B.PL.spdK,
      oldOverlay: document.body.classList.contains('lvl37'), checkpoint: B.CP.on?.lvl };
  });
  if (data.state !== 'play' || data.errors || data.oldOverlay || data.checkpoint !== 2 || !Number.isFinite(data.speed)) throw new Error('QA FAIL Level 37 to 2 handoff ' + JSON.stringify(data));
  console.log('QA PASS surface ending continues to playable Level 2 ' + JSON.stringify(data));
};
