module.exports = async (page, logs) => {
    const err = await page.evaluate(async () => { try { await window.__BR.goLevel9(null); return 'ok'; } catch (e) { return 'ERR ' + e.message; } });
  logs.push('QA go ' + err);
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 300; i++) B.simStep(1 / 60); B.SUBS.q.length = 0; B.SUBS.cur = null; document.getElementById('subs').innerHTML = ''; B.DBG.ts = 0.0001;
    window.LOOK = (x, z, p = 0) => { const P = B.PL; P.yaw = Math.atan2(x - P.x, z - P.z); P.pitch = p; P.bdir.set(Math.sin(P.yaw), -0.1, Math.cos(P.yaw)); }; });
  const shot = async (name, fn, arg) => { const r = await page.evaluate(fn, arg); if (r) logs.push('QA ' + name + ' ' + JSON.stringify(r)); await page.waitForTimeout(900); await page.evaluate(() => { const B = window.__BR; B.worldFX9(0.2); document.getElementById('toast').classList.remove('show'); }); await page.waitForTimeout(2400); await page.screenshot({ path: '/data/qa9/' + name + '.png' }); };
  for (let k = 0; k < 2; k++) await shot('v_wretch' + k, (k) => { const B = window.__BR, w = B.AI9.wretches[k * 2]; const L = B.LV9(); let best = null;
      // find a free spot ~2.5 m from the wretch with line of sight
      for (let a = 0; a < 16; a++) { const ang = a / 16 * Math.PI * 2, x = w.x + Math.sin(ang) * 2.4, z = w.z + Math.cos(ang) * 2.4; if (B.los(x, z, w.x, w.z)) { best = { x, z }; break; } }
      if (!best) return { k, fail: true, st: w.st };
      B.PL.x = best.x; B.PL.z = best.z; B.PL.cell = -1; B.PL.flash = true; B.PL.fk = 1; LOOK(w.x, w.z, -0.08); B.SUBS.q.length = 0; B.SUBS.cur = null; document.getElementById('subs').innerHTML = ''; w.cull(); return { k, st: w.st, shown: w.shown }; }, k);
  await shot('v_hale', () => { const B = window.__BR; const h = new B.Hale(41.3 * 3.6, 6.3 * 3.6, 0); B.AI9.hale = h; B.AI.all.push(h); h.update(3.0); h.update(3.0); h.update(3.0); h.st = 'give'; h.update(0.02); h.rig.card.isVisible = true;
    B.PL.flash = false; B.PL.fk = 0; B.PL.x = 41.3 * 3.6; B.PL.z = 7.9 * 3.6; B.PL.cell = -1; LOOK(h.x, h.z, 0.15); B.SUBS.q.length = 0; B.SUBS.cur = null; document.getElementById('subs').innerHTML = ''; h.cull(); return { shown: h.shown, st: h.st }; });
};
