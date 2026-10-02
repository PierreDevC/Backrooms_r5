// Level 9 Wretch hearing: (A) silence never wakes, (B) held noise level × distance → time to stir / wake,
// (C) a bot really walks / crouches / sprints toward a sleeper, (D) a chase is lost after silence, (E) terminal modem only stirs.
module.exports = async (page) => {
  const out = {};
  for (const diff of [0, 1, 2]) {
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
      // A: standing still at ~1.5 m and ~3 m for 12 s (and with the flashlight on) never wakes it
      for (const d of [1.5, 3]) {
        reset(w); const q = near(d); place(q.p.x, q.p.z); PL.flash = true;
        let maxS = 0; for (let i = 0; i < 240; i++) { B.simStep(0.05); maxS = Math.max(maxS, w.sus); }
        res.A.push({ d: +B.physD9(w).toFixed(2), st: w.st, maxSus: +maxS.toFixed(2) }); PL.flash = false;
      }
      // B: held noise levels
      for (const lvl of [0.04, 0.25, 0.42, 1]) for (const d of [1.2, 2.5, 4, 6]) {
        reset(w); const q = near(d); place(q.p.x, q.p.z);
        let tStir = null, tWake = null, t = 0;
        for (let i = 0; i < 200 && tWake === null; i++) { PL.noise = lvl; B.simStep(0.05); t += 0.05; if (tStir === null && w.sus > 0.3) tStir = +t.toFixed(2); if (w.st !== 'dormant') tWake = +t.toFixed(2); }
        res.B.push({ lvl, d: +B.physD9(w).toFixed(2), lim: +(B.hearLimit9().lim ?? -1).toFixed(3), tStir, tWake });
      }
      // C1: steady noise of each gait along an open street (+x)
      {
        let s0 = null;
        for (let z = 1; z < N - 1 && !s0; z++) { let run = 0; for (let x = 1; x < 44; x++) { if (LV.zone[B.cIdx(x, z)] === 1) { if (++run >= 10) { s0 = cc(B.cIdx(x - 9, z)); break; } } else run = 0; } }
        for (const mode of ['crouch', 'walk', 'sprint']) {
          place(s0.x, s0.z, Math.PI / 2); PL.crouch = mode === 'crouch'; PL.sta = 1; PL.exh = false; let ns = [], sp = [];
          for (let i = 0; i < 50; i++) { K.clear(); K.add('KeyW'); if (mode === 'sprint') K.add('ShiftLeft'); B.simStep(0.05); if (i > 30) { ns.push(PL.noise); sp.push(PL.spd); } }
          K.clear(); const avg = a => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(3);
          let t = 0; const n0 = PL.noise; while (PL.noise > 0.01 && t < 3) { B.simStep(0.05); t += 0.05; }
          res.C.push({ mode, noise: avg(ns), spd: avg(sp), fadeS: +t.toFixed(2), from: +n0.toFixed(2) });
        }
      }
      // C2: walk straight at the sleeper along its most open line (crouch / walk / sprint), stopping 0.9 m short
      {
        let best = null;
        for (let k = 0; k < 24; k++) {
          const a = k / 24 * Math.PI * 2; let free = 0;
          for (let r = 0.8; r < 9; r += 0.2) { const p = { x: w.home.x + Math.sin(a) * r, z: w.home.z + Math.cos(a) * r }; const q = { x: p.x, z: p.z }; B.collide(q, 0.3); const c = B.cIdx(B.cellOf(p.x), B.cellOf(p.z)); if (Math.hypot(q.x - p.x, q.z - p.z) > 0.02 || !w.inHouse(c) || B.floorOf(c) !== w.myFl()) break; free = r; }
          if (!best || free > best.free) best = { a, free };
        }
        res.C.push({ openLine: +best.free.toFixed(1) });
        for (const mode of ['crouch', 'walk', 'sprint']) {
          reset(w); const st = { x: w.home.x + Math.sin(best.a) * best.free, z: w.home.z + Math.cos(best.a) * best.free }; place(st.x, st.z); PL.crouch = mode === 'crouch'; PL.sta = 1; PL.exh = false;
          let t = 0, minD = 99, wakeD = null, stirD = null, maxSus = 0; const d0 = B.physD9(w);
          for (let i = 0; i < 400; i++) {
            const d = B.physD9(w); minD = Math.min(minD, d); K.clear();
            if (d > 0.9) { PL.yaw = Math.atan2(w.x - PL.x, w.z - PL.z); K.add('KeyW'); if (mode === 'sprint') K.add('ShiftLeft'); }
            B.simStep(0.05); t += 0.05; maxSus = Math.max(maxSus, w.sus);
            if (stirD === null && w.sus > 0.3) stirD = +d.toFixed(2);
            if (w.st !== 'dormant') { wakeD = +d.toFixed(2); break; }
            if (t > 8) break;
          }
          K.clear(); res.C.push({ room: mode, d0: +d0.toFixed(2), minD: +minD.toFixed(2), maxSus: +maxSus.toFixed(2), stirD, wakeD, st: w.st, t: +t.toFixed(2) });
        }
      }
      // D: wake it, then go silent 4 m away out of reach (latch nothing; just stand still and crouch) → it should lose you
      {
        reset(w); const q = near(4); place(q.p.x, q.p.z); PL.crouch = true;
        w.st = 'chase'; w.stT = 0; w.unheardT = 0; w.lk = { x: w.home.x + 0.5, z: w.home.z };   // it "heard" something by its bed
        const sts = []; let t = 0, lostAt = null, hit = false;
        for (let i = 0; i < 300; i++) { B.simStep(0.05); t += 0.05; if (PL.hp < 100 && !hit) hit = { t: +t.toFixed(2), st: w.st, d: +B.physD9(w).toFixed(2), hp: +PL.hp.toFixed(1), cause: G.cause }; if (!sts.length || sts[sts.length - 1].st !== w.st) sts.push({ t: +t.toFixed(2), st: w.st }); if (lostAt === null && w.st === 'lost') lostAt = +t.toFixed(2); }
        res.D.push({ seq: sts.slice(0, 8), lostAt, hit, d: +B.physD9(w).toFixed(2) });
        // and chased while sprinting around next to it: it keeps hunting
        reset(w); const q2 = near(2.5); place(q2.p.x, q2.p.z); w.st = 'chase'; w.unheardT = 0; w.lk = { x: PL.x, z: PL.z };
        let lost2 = false; for (let i = 0; i < 60; i++) { PL.noise = 1; B.simStep(0.05); if (w.st === 'lost') lost2 = true; }
        res.D.push({ loudChaseLost: lost2, st: w.st });
      }
      // E: a modem pulse 2 m from a sleeper with a silent player 5 m away: stirs but does not wake
      {
        reset(w); const q = near(5); place(q.p.x, q.p.z); PL.crouch = true;
        B.noiseAt9(w.home.x + 1.5, w.home.z + 1, 0.9, 0.55); const s0 = w.sus;
        let wake = false; for (let i = 0; i < 100; i++) { B.simStep(0.05); if (w.st !== 'dormant') wake = true; }
        res.E.push({ sus0: +s0.toFixed(2), wake, sus5s: +w.sus.toFixed(2) });
        // modem pulse then a noisy player close by: wakes faster than without the pulse
        reset(w); const q3 = near(1.5); place(q3.p.x, q3.p.z); B.noiseAt9(w.home.x + 1, w.home.z, 0.9, 0.55);
        let t = 0, tw = null; for (let i = 0; i < 200 && tw === null; i++) { PL.noise = 0.42; B.simStep(0.05); t += 0.05; if (w.st !== 'dormant') tw = +t.toFixed(2); }
        res.E.push({ pulsedThenWalk_tWake: tw, d: +B.physD9(w).toFixed(2) });
      }
      return res;
    });
    out[diff] = r;
    console.log('QA hear diff ' + diff + ' ' + JSON.stringify(r));
  }
};
