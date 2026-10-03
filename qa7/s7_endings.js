// Level 7: the KEEPER and THE DEEP endings (the SAIL ending is the last step of s7_story.js). Sets the story flags directly, then uses the real interactions.
module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel7(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    window.T = { step(s) { for (let i = 0; i < s * 20; i++) { B.PL.hp = Math.max(B.PL.hp, 60); B.simStep(0.05); } },
      act(re, hold) { const it = B.W.interact.find(i => { try { return re.test(i.label()) && (!i.ok || i.ok()); } catch (e) { return false; } }); if (!it) return false; B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); it.act(); T.step(hold || 0.3); return true; } }; });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  await run('before-lit', () => { const B = window.__BR; B.PS7.met = true; B.PS7.wrenMet = true; return [T.act(/SIT WITH WREN/), T.act(/FOLLOW THE CABLE DOWN/), B.G.state]; });
  await run('keeper', () => { const B = window.__BR; B.PS7.lit = true; B.PS7.wrenLit = true; const w = B.AIS7.wren; B.PL.x = w.x + 1; B.PL.z = w.z; B.PL.cell = -1; T.step(0.3); const ok = T.act(/SIT WITH WREN/, 1); T.step(9); return [ok, B.G.state, B.GS7.ending, B.endCard7()[0]]; });
  await run('retry', () => { const B = window.__BR; B.restartGame(true); return 1; });
  await page.waitForFunction(() => window.__BR.G.state === 'intro' || window.__BR.G.state === 'play', null, { timeout: 240000 });
  await run('deep', () => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); B.PS7.lit = true; T.act(/FOLLOW THE CABLE DOWN/, 1); T.step(9); return [B.G.state, B.GS7.ending, B.endCard7()[0], document.getElementById('btnAgain').textContent]; });
};
