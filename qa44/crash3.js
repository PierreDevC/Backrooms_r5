// Repro: crouching at the 3rd terminal while a house Wretch chases you (Level 9). Catches exceptions from simStep + updateHUD.
module.exports = async (page) => {
  await page.evaluate(() => { const B = window.__BR; if (B.HACK9) B.HACK9.skip = true; });   // r6: the old timed transfer (PACKET STACK is tested in qa_r6/l9_hack.js)
  for (const diff of [0, 1, 2]) for (let rep = 0; rep < 2; rep++) {
    await page.evaluate(d => { const B = window.__BR; B.G.state = 'title'; B.G.diff = d; B.goLevel9(null); }, diff);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
    const r = await page.evaluate((rep) => {
      const B = window.__BR, { AI9, W9, PL, G, K } = B, out = { errs: [], runs: [] };
      for (let i = 0; i < 600 && G.state !== 'play'; i++) B.simStep(0.05);
      const step = (dt) => { try { B.simStep(dt); } catch (e) { out.errs.push('sim ' + e.message + ' | ' + (e.stack || '').split('\n').slice(0, 4).join(' / ')); return false; } try { B.updateHUD(dt); } catch (e) { out.errs.push('hud ' + e.message + ' | ' + (e.stack || '').split('\n').slice(0, 4).join(' / ')); return false; } return true; };
      B.studyMap9(); B.toggleMap9 && W9 && (B.G9.mapOpen && B.toggleMap9());
      const terms = W9.terms.slice();
      for (let ti = 0; ti < terms.length; ti++) {
        const T = terms[ti];
        // the other two are done first, so T is the 3rd computer
        for (const o of terms) if (o !== T && !o.done) { try { B.finishDownload(o); } catch (e) { out.errs.push('fin ' + e.message); } }
        for (let i = 0; i < 40; i++) step(0.05);
        const ws = AI9.wretches.filter(w => w.present && w.h === T.h);
        PL.x = T.x; PL.z = T.z; PL.vx = PL.vz = 0; PL.cell = -1; PL.hp = 100; K.clear(); step(0.02);
        try { B.startDownload(T); } catch (e) { out.errs.push('start ' + e.message); }
        for (const w of ws) { w.st = 'chase'; w.stT = 0; w.unheardT = 0; w.lk = { x: PL.x, z: PL.z }; }
        const keys = ['KeyW', 'KeyA', 'KeyS', 'KeyD', null, null];
        let sts = new Set(), ok = true;
        for (let i = 0; i < 500 && ok; i++) {
          PL.crouch = true; if (rep === 0) PL.hp = Math.max(PL.hp, 50);
          if (i % 20 === 0) { K.clear(); const k = keys[(i / 20 + ti) % keys.length]; if (k) K.add(k); }
          ok = step(0.05); for (const w of ws) sts.add(w.st);
          if (G.state !== 'play') break;
        }
        K.clear();
        out.runs.push({ ti, house: T.h.id, nW: ws.length, data: B.G9.data, phase: B.G9.phase, st: G.state, wst: [...sts].join(','), done: T.done, hp: Math.round(PL.hp) });
        if (G.state !== 'play') break;
        // undo: fresh level next loop iteration is too slow; just reset terminals for the next T
        for (const o of terms) { o.done = false; o.active = false; o.prog = 0; } B.G9.data = 0; B.G9.phase = 'data';
      }
      return out;
    }, rep);
    console.log('QA crash3 diff ' + diff + ' rep ' + rep + ' ' + JSON.stringify(r));
    // also let real frames run in the 3rd-terminal chase state for a few seconds
  }
};
