// r4.4 QA: REAL render-loop frames at the 3rd computer, its Wretch chasing, crouched + moving with real key events; then an injected
// exception inside the frame must not stop the loop.
module.exports = async (page) => {
  await page.evaluate(() => { const B = window.__BR; if (B.HACK9) B.HACK9.skip = true; });   // r6: the old timed transfer (PACKET STACK is tested in qa_r6/l9_hack.js)
  const R = {};
  await page.evaluate(() => { const B = window.__BR; B.S.qual = 0; B.G.diff = 1; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => window.__BR.G.state === 'play', null, { timeout: 240000 });
  const errs0 = await page.evaluate(() => window.__BR.ERRS.n);
  await page.evaluate(() => {
    const B = window.__BR, { PL, W9, AI9 } = B;
    Object.defineProperty(document, 'pointerLockElement', { get: () => document.getElementById('c'), configurable: true });
    B.studyMap9(); if (B.G9.mapOpen) B.toggleMap9(); B.finishDownload(W9.terms[0]); B.finishDownload(W9.terms[1]);
    const T = W9.terms[2]; PL.x = T.x; PL.z = T.z; PL.cell = -1; B.updateField(); B.startDownload(T);
    for (const w of AI9.wretches.filter(w => w.present && w.h === T.h)) { w.st = 'chase'; w.stT = 0; w.lk = { x: PL.x, z: PL.z }; }
    window.__qa = { t0: B.FX.t, minHp: 100, sts: new Set() };
    setInterval(() => { const q = window.__qa; q.minHp = Math.min(q.minHp, PL.hp); for (const w of AI9.wretches) if (w.h === T.h) q.sts.add(w.st); if (PL.hp < 40) PL.hp = 100; }, 100);
  });
  await page.keyboard.press('c');   // crouch toggle via a real key event
  R.crouch = await page.evaluate(() => window.__BR.PL.crouch);
  const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD'];
  const t0 = Date.now();
  for (let i = 0; Date.now() - t0 < 20000; i++) {
    const k = keys[i % 4]; await page.keyboard.down(k); await page.waitForTimeout(700); await page.keyboard.up(k);
    if (i % 5 === 2) { await page.mouse.move(480 + (i % 3) * 30, 270); }
  }
  R.real = await page.evaluate(() => { const B = window.__BR, q = window.__qa; return { simT: +(B.FX.t - q.t0).toFixed(1), crouch: B.PL.crouch, ck: +B.PL.ck.toFixed(2), state: B.G.state, minHp: Math.round(q.minHp), wst: [...q.sts].join(','), errs: B.ERRS.n, data: B.G9.data, fps: Math.round(B.ENG().getFps()) }; });
  R.errs0 = errs0;
  // inject a fault: a terminal screen loses its canvas -> drawTerm throws every redraw
  R.inject = await page.evaluate(async () => {
    const B = window.__BR, T = B.W9.terms[0], sc = T.sc; B.PL.x = T.x; B.PL.z = T.z; B.PL.cell = -1; B.updateField();
    const n0 = B.ERRS.n, t0 = B.FX.t; T.sc = null; T.drawK = 'x';
    await new Promise(r => setTimeout(r, 3000));
    const o = { errs: B.ERRS.n - n0, adv: +(B.FX.t - t0).toFixed(2), last: B.ERRS.last, hudTC: document.getElementById('tc').textContent };
    T.sc = sc; T.drawK = ''; const n1 = B.ERRS.n, t1 = B.FX.t;
    await new Promise(r => setTimeout(r, 1500));
    o.after = B.ERRS.n - n1; o.adv2 = +(B.FX.t - t1).toFixed(2); o.hudTC2 = document.getElementById('tc').textContent;
    return o;
  });
  console.log('QA crashrf ' + JSON.stringify(R));
};
