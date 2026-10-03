const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT;
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel37(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W37 && window.__BR.W37.pos, null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  // helper executed in page: act on the first interactable whose label matches
  await page.evaluate(() => {
    const B = window.__BR; window.T = {
      log: [],
      step(s) { for (let i = 0; i < s * 20; i++) B.simStep(0.05); },
      act(re, hold) { const it = B.W.interact.find(i => { try { return re.test(i.label()) && (!i.ok || i.ok()); } catch (e) { return false; } }); if (!it) { T.log.push('NO ' + re); return false; }
        B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); it.act(); if (hold) T.step(hold); else T.step(0.2); T.log.push('ok ' + re + ' | obj: ' + B.obj37()); return true; },
      st() { return { phase: B.G37.phase, errs: B.ERRS.n, last: B.ERRS.last, wings: B.wingsDone37(), keys: JSON.stringify(B.P37.keys), flood: B.G37.flood, state: B.G.state }; }
    };
  });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  await run('voice', async () => { const B = window.__BR; try { B.audioInit(0.6); await B.AU.ctx.resume(); B.loadVoice37(); } catch (e) { return String(e); } await new Promise(r => setTimeout(r, 6000));
    const n = Object.keys(B.AU.buf).filter(k => /^v37_/.test(k)).length; const out = { ctx: B.AU.ctx && B.AU.ctx.state, decoded: n };
    T.step(0.3); B.SUBS.q.length = 0; B.SUBS.cur = null; B.talkAbara37(); T.step(0.2); out.cur = B.SUBS.cur && B.SUBS.cur.text; out.vo = B.SUBS.cur && B.SUBS.cur.o.vo; out.hasBuf = !!(out.vo && B.AU.buf[out.vo]); out.dur = B.SUBS.cur && B.SUBS.t; out.errs = B.ERRS.n; return out; });
};
