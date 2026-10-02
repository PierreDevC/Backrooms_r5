// Level 9 Wretch hearing: (A) silence never wakes, (B) held noise level × distance → time to stir / wake,
// (C) a bot really walks / crouches / sprints toward a sleeper, (D) a chase is lost after silence, (E) terminal modem only stirs.
module.exports = async (page) => {
  const out = {};
  for (const diff of [2, 2]) {
    await page.evaluate(d => { try { localStorage.setItem('br_brief9', '1'); } catch (e) {} const B = window.__BR; B.G.state = 'title'; B.G.diff = d; B.goLevel9(null); }, diff);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
    const r = await page.evaluate(() => {
      const B = window.__BR, { AI9, PL, G, LV, K } = B;
      for (let i = 0; i < 600 && G.state !== 'play'; i++) B.simStep(0.05);
      if (G.state !== 'play') return { err: 'no play ' + G.state };
      for (const w of AI9.watch) { w.x = w.z = -500; w.leaveT = 1e9; w.update = () => {}; }   // keep the Watch out of it
      const N = Math.round(Math.sqrt(LV.bld.length)), cc = c => ({ x: B.cellCenter(c % N), z: B.cellCenter((c / N) | 0) });
      for (const dr of B.W9.doorAt.values()) if (!dr.latched) B.setDoor(dr, true);
      const ws = AI9.wretches.filter(w => !w.lab && w.present);
      const reset = w => { w.st = 'dormant'; w.stT = 0; w.sus = 0; w.hear = 0; w.stirred = false; w.lk = null; w.x = w.home.x; w.z = w.home.z; w.yOff = 0; w.cl = null; w.scrCd = 99; };
      const place = (x, z, yaw = 0) => { PL.x = x; PL.z = z; PL.vx = PL.vz = 0; PL.kx = PL.kz = 0; PL.spd = 0; PL.noise = 0; PL.yaw = yaw; PL.crouch = false; PL.hp = 100; K.clear(); B.simStep(0.02); };
      const cellsAt = (w) => { const fl = w.myFl(); return w.h.rooms.filter(r => (r.fl || 0) === fl).flatMap(r => r.cells); };
      const res = { n: ws.length, A: [], B: [], C: [], D: [], E: [] };
      // pick the Wretch with the most same-floor room to play with
      const w = ws.map(w => ({ w, n: cellsAt(w).length })).sort((a, b) => b.n - a.n)[0].w;
      for (const o of ws) if (o !== w) { o.present = false; o.x = o.z = -400; }
      res.house = { cells: cellsAt(w).length, fl: w.myFl() };
      const near = d => { let best = null; for (const c of cellsAt(w)) { const p = cc(c), dd = Math.hypot(p.x - w.home.x, p.z - w.home.z); if (!best || Math.abs(dd - d) < Math.abs(best.dd - d)) best = { c, p, dd }; } return best; };
      for (let rep = 0; rep < 4; rep++) for (const d of [1.5, 3]) {
        reset(w); const q = near(d); place(q.p.x, q.p.z); PL.flash = true; const x0 = PL.x, z0 = PL.z;
        let maxS = 0, maxN = 0, maxSpd = 0, maxHear = 0, src = '';
        for (let i = 0; i < 240; i++) { B.simStep(0.05); if (w.sus > maxS) { maxS = w.sus; } if (PL.noise > maxN) { maxN = PL.noise; src = 't' + i; } maxSpd = Math.max(maxSpd, PL.spd || 0); maxHear = Math.max(maxHear, w.hear || 0); }
        res.A.push({ d: +B.physD9(w).toFixed(2), st: w.st, maxSus: +maxS.toFixed(2), maxN: +maxN.toFixed(3), at: src, maxSpd: +maxSpd.toFixed(2), moved: +Math.hypot(PL.x - x0, PL.z - z0).toFixed(3), maxHear: +maxHear.toFixed(3) }); PL.flash = false;
      }
      return res;
    });
    out[diff] = r; console.log('QA probe diff ' + diff + ' ' + JSON.stringify(r.A || r));
  }
};
