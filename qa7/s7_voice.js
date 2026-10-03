// Level 7: the voice bank decodes and a line's clip attaches to its subtitle.
module.exports = async (page) => {
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel7(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  const r = await page.evaluate(async () => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    B.audioInit(0.6); await B.AU.ctx.resume(); B.loadVoice7(); await new Promise(r => setTimeout(r, 6000));
    const n = Object.keys(B.AU.buf).filter(k => /^v7_/.test(k)).length; B.SUBS.q.length = 0; B.SUBS.cur = null;
    const K = B.AIS7.kell; B.PL.x = K.x - 1.2; B.PL.z = K.z; B.PL.cell = -1; B.talk7('kell'); for (let i = 0; i < 4; i++) B.simStep(0.05);
    const c = B.SUBS.cur; return { decoded: n, text: c && c.text, vo: c && c.o.vo, buf: !!(c && c.o.vo && B.AU.buf[c.o.vo]), errs: B.ERRS.n }; });
  console.log('voice ' + JSON.stringify(r));
};
