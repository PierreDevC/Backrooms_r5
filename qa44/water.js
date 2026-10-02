// r4.4 QA: almond water placed per level and difficulty (+ starting water)
module.exports = async (page) => {
  const out = {};
  for (const d of [0, 1, 2]) {
    const r = await page.evaluate(async (d) => {
      const B = window.__BR; if (B.G.state !== 'title') await B.restartGame(false);
      B.G.diff = d; B.startGame(true); for (let i = 0; i < 10; i++) B.simStep(0.05);
      const o = { items: B.W.items.filter(i => i.type === 'water').length, bat: B.W.items.filter(i => i.type === 'battery').length, start: B.PL.water };
      await B.restartGame(false); return o;
    }, d);
    out['L0_' + d] = r;
  }
  for (const L of [9, 5, 18]) for (const d of [0, 1, 2]) {
    await page.evaluate(({ L, d }) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = d; const g = L === 9 ? B.G9 : L === 5 ? B.G5 : B.G18; g.from = null; (L === 9 ? B.goLevel9 : L === 5 ? B.goLevel5 : B.goLevel18)(null); }, { L, d });
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
    out['L' + L + '_' + d] = await page.evaluate(() => { const B = window.__BR; return { items: B.W.items.filter(i => i.type === 'water').length, bat: B.W.items.filter(i => i.type === 'battery').length, start: B.PL.water }; });
  }
  console.log('QA water ' + JSON.stringify(out));
};
