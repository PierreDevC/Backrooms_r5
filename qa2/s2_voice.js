module.exports = async (page) => {
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel2(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  const r = await page.evaluate(async () => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    B.audioInit(0.6); await B.AU.ctx.resume(); B.loadVoice2(); await new Promise(r => setTimeout(r, 6000));
    const n = Object.keys(B.AU.buf).filter(k => /^v2_/.test(k)).length; B.SUBS.q.length = 0; B.SUBS.cur = null;
    const I = B.AIP2.ida; B.PL.x = I.x - 1.2; B.PL.z = I.z; B.PL.cell = -1; B.talkIda2(); for (let i = 0; i < 4; i++) B.simStep(0.05);
    const c = B.SUBS.cur; return { decoded: n, text: c && c.text, vo: c && c.o.vo, buf: !!(c && c.o.vo && B.AU.buf[c.o.vo]), t: c && B.SUBS.t, errs: B.ERRS.n }; });
  console.log('voice ' + JSON.stringify(r));
};
