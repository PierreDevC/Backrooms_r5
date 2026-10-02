module.exports = async (page, logs) => {
  const err = await page.evaluate(async () => { try { await window.__BR.goLevel9(null); return 'ok'; } catch (e) { return 'ERR ' + e.message + '\n' + e.stack; } });
  logs.push('QA goLevel9 ' + err); if (err !== 'ok') return;
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 240; i++) B.simStep(1 / 60); B.SUBS.q.length = 0; B.SUBS.cur = null; document.getElementById('subs').innerHTML = ''; B.DBG.ts = 0.0001; });
  const shot = async (name, fn, wait = 2600) => { const r = await page.evaluate(fn); if (r) logs.push('QA ' + name + ' ' + JSON.stringify(r)); await page.waitForTimeout(900); await page.evaluate(() => { const B = window.__BR; B.worldFX9(0.2); B.worldFX9(0.2); document.getElementById('toast').classList.remove('show'); }); await page.waitForTimeout(wait); await page.screenshot({ path: '/data/qa9/' + name + '.png' }); };
  const S = 3.6;
  await shot('b1_kiosk', () => { const B = window.__BR, K = B.W9.kiosk; B.PL.x = K.x; B.PL.z = K.z + 1.6; B.PL.yaw = Math.PI; B.PL.pitch = 0.08; B.PL.cell = -1; });
  await shot('b2_term', () => { const B = window.__BR, T = B.W9.terms[0], sp = T.sc.mesh.getAbsolutePosition(); let dx = T.x - sp.x, dz = T.z - sp.z; const l = Math.hypot(dx, dz); dx /= l; dz /= l;
    B.PL.x = sp.x + dx * 1.5; B.PL.z = sp.z + dz * 1.5; B.PL.yaw = Math.atan2(-dx, -dz); B.PL.pitch = 0.25; B.PL.cell = -1; B.PL.flash = true; B.PL.fk = 1; B.startDownload(T); T.prog = 5; return { focus: B.PL.focus && B.PL.focus.label() }; });
  await shot('b3_map', () => { const B = window.__BR; B.studyMap9(); });
  await page.evaluate(() => { const B = window.__BR; B.toggleMap9(); B.W9.terms[0].active = false; });
  // Watch on the street in front of the player
  await shot('b4_watch', () => { const B = window.__BR; B.PL.x = 2 * 3.6; B.PL.z = 8 * 3.6; B.PL.yaw = 0; B.PL.pitch = 0; B.PL.flash = false; B.PL.fk = 0; B.PL.cell = -1;
    const w = B.spawnWatch(); w.place(2 * 3.6 + 0.4, 8 * 3.6 + 7, Math.PI); w.st = 'patrol'; w.wp = { x: w.x, z: w.z - 20 }; for (let i = 0; i < 20; i++) B.simStep(1 / 60); B.DBG.ts = 0.0001; return { st: w.st, shown: w.shown }; });
  // a Wretch in a house
  await shot('b5_wretch', () => { const B = window.__BR, w = B.AI9.wretches[0], h = w.h; const c = w.cell(), N = 43;
    B.PL.x = w.x + 2.2; B.PL.z = w.z; B.PL.yaw = Math.atan2(w.x - B.PL.x, 0) ; B.PL.flash = true; B.PL.fk = 1; B.PL.cell = -1; B.G.state = 'play';
    return { st: w.st, x: w.x, z: w.z }; });
  // lab views
  await shot('b6_decon', () => { const B = window.__BR; B.PL.x = 39.2 * 3.6; B.PL.z = 1.3 * 3.6; B.PL.yaw = 0.5; B.PL.pitch = 0; B.PL.flash = false; B.PL.fk = 0; B.PL.cell = -1; });
  await shot('b7_hallS', () => { const B = window.__BR; B.PL.x = 40.5 * 3.6; B.PL.z = 8.5 * 3.6; B.PL.yaw = Math.PI; B.PL.cell = -1; });
  await shot('b8_subject', () => { const B = window.__BR; B.W9.cell.want = 1; B.W9.cell.open = 1; B.W9.cell.root.position.x = B.W9.cell.x0 + 1.25; B.PL.x = 40.5 * 3.6; B.PL.z = 9.2 * 3.6; B.PL.yaw = 0; B.PL.cell = -1; B.AI9.subject.cull(); });
  await shot('b9_hale', () => { const B = window.__BR; const h = new B.Hale(41.3 * 3.6, 6.5 * 3.6, Math.PI); h.st = 'give'; h.rise = 1; B.AI9.hale = h; B.AI.all.push(h); B.SCN().meshes; h.update(0.016); h.rig.card.isVisible = true;
    const R = h.rig; R.mat && window.__BR; B.PL.x = 41.3 * 3.6; B.PL.z = 8.2 * 3.6; B.PL.yaw = Math.PI; B.PL.cell = -1; h.cull(); return { shown: h.shown }; });
  await shot('b10_elev', () => { const B = window.__BR; B.PL.x = 41.6 * 3.6; B.PL.z = 7.5 * 3.6; B.PL.yaw = Math.PI / 2; B.PL.cell = -1; });
};
