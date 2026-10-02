// Level 9 house Wretch chase speed per difficulty (headless, simStep-driven). Player stands still in the Wretch's house; Wretch forced into chase.
module.exports = async (page) => {
  const res = {};
  for (const diff of [0, 1, 2]) {
    await page.evaluate(d => { const B = window.__BR; B.G.state = 'title'; B.G.diff = d; B.goLevel9(null); }, diff);
    await page.waitForFunction(() => window.__BR.LV9 && document.body.classList.contains('lvl9') && ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
    res[diff] = await page.evaluate(() => {
      const B = window.__BR, { AI9, PL, G, LV } = B, N = Math.round(Math.sqrt(LV.bld.length));
      for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
      if (G.state !== 'play') return { err: 'no play' };
      let best = null;
      for (const w of AI9.wretches) {
        const fl = w.myFl(), F = w.field(w.cell());
        for (const r of w.h.rooms) if ((r.fl || 0) === fl) for (const c of r.cells) if (F[c] > 0 && (!best || F[c] > best.n)) best = { w, c, n: F[c] };
      }
      if (!best) return { err: 'no house path' };
      const { w, c } = best;
      PL.x = B.cellCenter(c % N); PL.z = B.cellCenter((c / N) | 0); PL.hp = 100;
      B.simStep(1 / 60);
      w.st = 'chase'; w.stT = 0; w.unseenT = 0; w.lk = { x: PL.x, z: PL.z };
      const dt = 1 / 60, samp = []; let px = w.x, pz = w.z, T = 0, moved = 0, tm = 0;
      for (let i = 0; i < 60 * 8; i++) {
        PL.hp = 100; B.simStep(dt); T += dt;
        const dd = Math.hypot(w.x - px, w.z - pz); px = w.x; pz = w.z;
        if (w.st === 'chase' && Math.hypot(w.x - PL.x, w.z - PL.z) > 1.6) { samp.push(dd / dt); moved += dd; tm += dt; }
        if (w.st !== 'chase' && w.st !== 'climb' || G.state !== 'play') break;
      }
      const win = []; for (let i = 0; i + 30 <= samp.length; i += 5) win.push(samp.slice(i, i + 30).reduce((a, b) => a + b, 0) / 30);
      win.sort((a, b) => a - b);
      return { pathCells: best.n, chaseSec: +tm.toFixed(2), avg: +(moved / Math.max(tm, 1e-6)).toFixed(2), p50: +(win[win.length >> 1] || 0).toFixed(2), peak: +(win[win.length - 1] || 0).toFixed(2), endState: w.st };
    });
    console.log('QA diff ' + diff + ' ' + JSON.stringify(res[diff]));
  }
  const e = res[0], n = res[1];
  if (e.err || n.err) throw new Error('probe failed');
  console.log((e.peak < 2.35 ? 'QA PASS' : 'QA FAIL') + ' easy peak chase below player walk 2.35 m/s: ' + e.peak);
  console.log((n.peak > e.peak * 1.3 ? 'QA PASS' : 'QA FAIL') + ' normal remains faster (unchanged): ' + n.peak);
};
