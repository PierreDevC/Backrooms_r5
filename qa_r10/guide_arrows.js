// Floor arrows: standing still away from the objective, they appear after GUIDE_AFTER[diff] seconds (Easy 60, Normal 120, Nightmare 210) and not before;
// they lie along the route and point along it; walking toward the objective holds them off. Screenshot: qa out / guide_arrows.png
const path = require('path'), assert = require('node:assert/strict');
module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  const check = (c, m) => { assert.ok(c, m); console.log('QA PASS ' + m); };
  const run = async (diff) => {
    await page.evaluate((diff) => { const B = window.__BR; B.DBG.ts = 0; B.G.diff = diff; B.G.state = 'title'; B.goLevel2(null); }, diff);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
    return page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); B.G.grace = 1e9; B.PL.hp = 1e6;
      const tg = B.target2(); B.NAV.F = null; B.NAV.wpT = 0; B.navGuide(tg); const F = B.NAV.F, c = []; for (let k = 0; k < F.length; k++) if (F[k] > 40 * 12.5 && F[k] < 60 * 12.5 && B.NAV.blk[k] === 0) c.push(k);
      const k = c[(c.length / 2) | 0]; B.PL.x = B.navX(k); B.PL.z = B.navZ(k); B.PL.cell = -1;
      let first = -1; for (let t = 0; t < 230; t += 0.25) { B.PL.hp = 1e6; B.GP2.heat = 0; B.simStep(0.25); B.updateHUD(0.25); if (first < 0 && B.GUIDE.arrows.some(a => a.on)) { first = t; break; } }
      const on = B.GUIDE.arrows.filter(a => a.on), P = B.NAV.last, near = on.every(a => P.some(q => Math.hypot(B.navX(q) - a.g.position.x, B.navZ(q) - a.g.position.z) < 0.8));
      const along = on.slice(0, -1).every((a, i) => { const b = on[i + 1], d = Math.atan2(b.g.position.x - a.g.position.x, b.g.position.z - a.g.position.z); return Math.abs(B.angDiff ? B.angDiff(a.g.rotation.y, d) : ((a.g.rotation.y - d + 9 * Math.PI) % (2 * Math.PI)) - Math.PI) < 1.0; });
      if (on.length) { const a = on[2] || on[0]; B.PL.yaw = Math.atan2(a.g.position.x - B.PL.x, a.g.position.z - B.PL.z); B.PL.pitch = 0.45; for (let i = 0; i < 12; i++) { B.simStep(0.25); B.updateHUD(0.25); } }
      return { first, n: on.length, near, along, errs: B.ERRS.n }; }); };
  const easy = await run(0);
  check(easy.first >= 58 && easy.first <= 64 && easy.n >= 6, `Easy: arrows appear after about a minute standing still (${easy.first} s, ${easy.n} arrows)`);
  check(easy.near && easy.along, 'arrows lie on the route and point along it');
  await page.waitForTimeout(700); await page.screenshot({ path: path.join(process.env.BR_QA_OUT || __dirname, 'guide_arrows.png') });
  const nm = await run(2);
  check(nm.first >= 205 && nm.first <= 215, `Nightmare: arrows wait about 210 s (${nm.first} s)`);
  // progress holds them off: walking the route on Easy for 100 s keeps them away
  const walk = await page.evaluate(() => { const B = window.__BR; B.G.diff = 0; B.GUIDE.idle = 0; B.GUIDE.best = 1e9; B.GUIDE.shownT = -99; for (const a of B.GUIDE.arrows) { a.on = false; a.g.setEnabled(false); }
    let shown = false; const tr = []; const opener = () => { for (const d of B.W.interact) if (d.door && Math.hypot(d.x - B.PL.x, d.z - B.PL.z) < 1.8) { let l = ''; try { l = d.label(); } catch (e) {} if (/^OPEN DOOR|UNLATCH/.test(l)) d.act(); } }; for (let t = 0; t < 100 && B.NAV.metres > 3; t += 0.1) { B.NAV.wpT = 0; opener(); const w = B.navGuide(B.target2()); const dx = w.x - B.PL.x, dz = w.z - B.PL.z, d = Math.hypot(dx, dz) || 1; const p = { x: B.PL.x + dx / d * 0.1, z: B.PL.z + dz / d * 0.1 }; B.collideNav(p, 0.28); B.PL.x = p.x; B.PL.z = p.z; B.PL.hp = 1e6; B.GP2.heat = 0; B.simStep(0.1); B.updateHUD(0.1); if (B.GUIDE.arrows.some(a => a.on)) shown = true; if (Math.round(t * 10) % 100 === 0) tr.push([t.toFixed(0), B.NAV.metres.toFixed(1), B.GUIDE.idle, B.PL.x.toFixed(1), B.PL.z.toFixed(1), w.x.toFixed(1), w.z.toFixed(1)].join(' ')); }
    return { shown, left: B.NAV.metres, tr }; });
  console.log('WALK ' + JSON.stringify(walk.tr));
  check(!walk.shown, `walking toward the objective at 1 m/s keeps the arrows away (left ${walk.left.toFixed(1)} m)`);
  check(easy.errs === 0 && nm.errs === 0, 'no runtime errors');
};
