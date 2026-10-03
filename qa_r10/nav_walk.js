// Route guidance: from random walkable spots, a bot that only ever walks toward the compass mark (navGuide) must reach the objective.
// BR_NAV_LEVEL picks the level (0, 9, 5, 18, 37, 2, 7). Prints NAV {...}.
const path = require('path');
module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  const L = +(process.env.BR_NAV_LEVEL || 2);
  await page.evaluate((L) => { const B = window.__BR; B.DBG.ts = 0; B.G.diff = 1;
    if (L === 0) B.startGame(true); else { B.G.state = 'title'; ({ 9: B.goLevel9, 5: B.goLevel5, 18: B.goLevel18, 37: B.goLevel37, 2: B.goLevel2, 7: B.goLevel7 })[L](null); } }, L);
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  const r = await page.evaluate((L) => { const B = window.__BR; for (let i = 0; i < 600 && B.G.state !== 'play'; i++) B.simStep(0.05);
    B.G.grace = 1e9; B.PL.hp = 1e6;
    const t0 = performance.now(); B.navBuild(); const tBuild = performance.now() - t0;
    const tgt = () => ({ 0: B.target0, 9: B.target9, 5: B.target5, 18: B.target18, 37: B.target37, 2: B.target2, 7: B.target7 })[L]();
    const tg = tgt(); if (!tg) return { L, err: 'no target' };
    const t1 = performance.now(); B.NAV.F = null; B.navTarget(tg); const tField = performance.now() - t1;
    const NAV = B.NAV, n = NAV.n, F = NAV.F, cand = []; for (let k = 0; k < F.length; k++) if (F[k] > 0 && NAV.blk[k] === 0) cand.push(k);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const runs = [], NR = 12;
    for (let r = 0; r < NR && cand.length; r++) {
      const k = cand[Math.floor(rnd() * cand.length)], sx = (k % n + 0.5) * NAV.res, sz = (((k / n) | 0) + 0.5) * NAV.res;
      B.PL.x = sx; B.PL.z = sz; B.PL.cell = -1; NAV.wpT = 0; let ok = false, t = 0, links = 0, stuck = 0, lastD = 1e9, walked = 0; const dt = 0.1;
      const straight = Math.hypot(tg.x - sx, tg.z - sz), start = F[k] / 5 * NAV.res;
      for (; t < 400; t += dt) {
        NAV.wpT = 0; const w = B.navGuide(tg); if (!w) break;
        if (Math.hypot(tg.x - B.PL.x, tg.z - B.PL.z) < 2.4) { ok = true; break; }
        const P = NAV.last; if (P && P.link !== undefined) { const e = P[P.length - 1], ex = (e % n + 0.5) * NAV.res, ez = (((e / n) | 0) + 0.5) * NAV.res; if (Math.hypot(ex - B.PL.x, ez - B.PL.z) < 1.0) { const b = NAV.linkA.get(e)[0]; B.PL.x = (b % n + 0.5) * NAV.res; B.PL.z = (((b / n) | 0) + 0.5) * NAV.res; links++; continue; } }
        const dx = w.x - B.PL.x, dz = w.z - B.PL.z, d = Math.hypot(dx, dz) || 1, s = Math.min(d, 3 * dt), p = { x: B.PL.x + dx / d * s, z: B.PL.z + dz / d * s };
        B.collideNav(p, 0.28); walked += Math.hypot(p.x - B.PL.x, p.z - B.PL.z); B.PL.x = p.x; B.PL.z = p.z;
        const m = NAV.metres; if (m >= lastD - 0.05) stuck += dt; else stuck = 0; lastD = Math.min(lastD, m); if (stuck > 12) break;
      }
      runs.push({ ok, t: +t.toFixed(1), links, straight: +straight.toFixed(1), route: +start.toFixed(1), walked: +walked.toFixed(1), from: [+sx.toFixed(1), +sz.toFixed(1)], at: [+B.PL.x.toFixed(1), +B.PL.z.toFixed(1)] });
    }
    const tg2 = { x: tg.x, z: tg.z };
    return { L, n, tBuild: Math.round(tBuild), tField: Math.round(tField), pass: NAV.pass, links: NAV.links.length, target: [+tg.x.toFixed(1), +tg.z.toFixed(1)], ok: runs.filter(r => r.ok).length + '/' + runs.length, runs: runs.filter(r => !r.ok), errs: B.ERRS.n, last: B.ERRS.last };
  }, L);
  console.log('NAV ' + JSON.stringify(r));
};
