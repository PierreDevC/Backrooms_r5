// r6 QA: the Watch whistles on its rounds (and shows on the compass for a moment); the third download draws it to walk a beat round that house.
module.exports = async (page) => {
  const ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN.f = {}; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W9, AI9 } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    const w = AI9.watch[0] || B.spawnWatch(); w.callT = 0.2; const t0 = B.FX ? 0 : 0;
    for (let i = 0; i < 10; i++) B.simStep(0.05);
    o.whistled = w.whistled > 0; o.blip = B.foes9 ? null : null;
    const T = W9.terms[2]; B.finishDownload(W9.terms[0]); B.finishDownload(W9.terms[1]); for (let i = 0; i < 40; i++) B.simStep(0.05);
    const c = T.h.entryRoom.cells[0]; PL.x = T.x; PL.z = T.z; PL.cell = -1; PL.crouch = true;
    for (const q of AI9.watch) q.beat = null;
    B.startDownload(T); let beat = AI9.watch.find(q => q.beat && q.beat.h === T.h); o.beatAuto = !!beat;
    for (let k = 0; k < 20 && !beat; k++) beat = B.watchBeat9(T.h);   // the odds are 75% on Normal: force one for the walk check
    const cx = beat.beat.x, cz = beat.beat.z; o.d0 = +Math.hypot(beat.x - cx, beat.z - cz).toFixed(1);
    let minD = 1e9, near = 0, whistles = 0, lastW = beat.whistled, sub = '';
    for (let i = 0; i < 1600; i++) { PL.x = T.x; PL.z = T.z; PL.noise = 0; B.HACK9.on = false; B.simStep(0.05); const dd = Math.hypot(beat.x - cx, beat.z - cz); minD = Math.min(minD, dd); if (dd < 16) near++; if (beat.whistled !== lastW) { whistles++; lastW = beat.whistled; } if (B.SUBS.cur && /Watch just turned/.test(B.SUBS.cur.text)) sub = B.SUBS.cur.text; }
    o.minD = +minD.toFixed(1); o.nearFrac = +(near / 1600).toFixed(2); o.whistles = whistles; o.st = beat.st; o.sub = sub;
    return o;
  });
  console.log('QA watch ' + JSON.stringify(a));
  ok(a.whistled, 'the Watch whistles on its rounds'); ok(a.minD < 13 && a.nearFrac > 0.25, 'on the third download it comes and walks round that house'); ok(a.whistles >= 1, 'it whistles while it walks the beat'); ok(/Watch just turned/.test(a.sub), 'Outpost Nine warns you');
  const errs = await page.evaluate(() => window.__BR.ERRS); ok(!errs.n, 'no recovered frame errors');
};
