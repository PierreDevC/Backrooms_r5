// Level 9 house Wretch chase speed per difficulty (headless, simStep-driven). Player stands still; Wretch forced into chase.
module.exports = async (page) => {
  const res = {};
  for (const diff of [0, 1, 2]) {
    await page.evaluate(d => { const B = window.__BR; B.G.state = 'title'; B.G.diff = d; B.goLevel9(null); }, diff);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
    const r = await page.evaluate(() => {
      const B = window.__BR, { AI9, PL, G, LV } = B;
      for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
      if (G.state !== 'play') return { err: 'no play' };
      const N = Math.round(Math.sqrt(LV.bld.length)), C = B.CELL5 ? null : null;
      let best = null;
      for (const w of AI9.wretches) {   // a Wretch and a same-floor cell in its house as far from it as possible
        const fl = w.myFl(), cells = w.h.rooms.filter(r => (r.fl || 0) === fl).flatMap(r => r.cells);
        const F = w.field(w.cell());
        for (const c of cells) if (F[c] > 0 && (!best || F[c] > best.n)) best = { w, c, n: F[c] };
      }
      if (!best) return { err: 'no house path' };
      const { w, c } = best, cs = LV.cs || 0;
      const cx = c % N, cy = (c / N) | 0, CELL = (window.__BR.LV9().cell || null);
      // cell centre via the Wretch's own helper space: reuse cellPt-equivalent through home offset
      const ref = w.home, cw = Math.abs(ref.x - (Math.floor(ref.x / 1) )) ;
      return { N, c, cx, cy, n: best.n };
    });
    res[diff] = r;
  }
  console.log('QA probe ' + JSON.stringify(res));
};
