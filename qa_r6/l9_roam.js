// r6 QA: Level 9 house Wretches roam their house (prowl / rest), open unlatched doors, stay blind, wake when you walk into them.
module.exports = async (page) => {
  const ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN.f = {}; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.AI9 && window.__BR.AI9.wretches.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, AI9, W9 } = B, o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    for (const w of AI9.watch || []) w.place(5, 5, 0);
    o.states0 = [...new Set(AI9.wretches.map(w => w.st))];
    const w = AI9.wretches.find(w => w.present && !w.lab && w.h && w.h.rooms.length > 3) || AI9.wretches[0];
    // stand silent, crouched, in the far corner of its house's entry room
    const er = w.h.entryRoom, c = er.cells[0]; PL.x = B.cellCenter(c % 56) + 1.2; PL.z = B.cellCenter((c / 56) | 0) + 1.2; PL.cell = -1; PL.crouch = true;
    const seen = new Set(), x0 = w.x, z0 = w.z; let path = 0, px = w.x, pz = w.z, opened = 0; const doors0 = W9.doors.filter(d => d.house === w.h.id && d.target).length;
    for (let i = 0; i < 1200; i++) { PL.noise = 0; B.simStep(0.05); seen.add(w.st); path += Math.hypot(w.x - px, w.z - pz); px = w.x; pz = w.z; }
    o.states = [...seen]; o.path = +path.toFixed(1); o.moved = +Math.hypot(w.x - x0, w.z - z0).toFixed(1);
    o.doorsOpened = W9.doors.filter(d => d.house === w.h.id && d.target).length - doors0; o.chased = seen.has('chase') || seen.has('wake');
    window.__QW = w; return o;
  });
  console.log('QA roam ' + JSON.stringify(a));
  ok(a.states0.includes('rest') && !a.states0.includes('dormant'), 'house Wretches start awake (resting or roaming), not asleep');
  ok(a.path > 8 && a.states.includes('prowl') && a.states.includes('rest'), 'it roams its house and stops to listen');
  ok(!a.chased, 'silent and crouched, it never hears you');
  const b = await page.evaluate(() => { const B = window.__BR, { PL } = B, w = window.__QW; w.st = 'rest'; w.stT = 0; w.restT = 30; PL.x = w.x + 0.5; PL.z = w.z; PL.cell = -1; PL.noise = 0; for (let i = 0; i < 6; i++) B.simStep(0.05); return { st: w.st }; });
  console.log('QA touch ' + JSON.stringify(b)); ok(['wake', 'chase'].includes(b.st), 'walking into it wakes it');
  const errs = await page.evaluate(() => window.__BR.ERRS); ok(!errs.n, 'no recovered frame errors');
};
