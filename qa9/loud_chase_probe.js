module.exports = async (page) => {
  const out = {};
  for (const diff of [2, 1]) {
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
      
      const lg = []; const q2 = near(2.5);
      for (let rep = 0; rep < 3; rep++) {
        reset(w); place(q2.p.x, q2.p.z); w.st = 'chase'; w.unheardT = 0; w.lk = { x: PL.x, z: PL.z };
        let prev = '';
        for (let i = 0; i < 60; i++) { PL.noise = 1; const hp = PL.hp; B.simStep(0.05);
          const lc = B.cIdx(B.cellOf(PL.x), B.cellOf(PL.z));
          const s = w.st + '|in' + (w.inHouse(lc) ? 1 : 0) + '|fl' + B.floorOf(lc) + '/' + w.myFl();
          if (s !== prev || PL.hp < hp) { lg.push({ rep, t: +(i * 0.05).toFixed(2), s, d: +B.physD9(w).toFixed(2), hp: +PL.hp.toFixed(1), hear: +(w.hear || 0).toFixed(2), unh: +(w.unheardT || 0).toFixed(2) }); prev = s; }
        }
      }
      return lg;
    });
    console.log('QA probe diff ' + diff + ' ' + JSON.stringify(r));
  }
};
