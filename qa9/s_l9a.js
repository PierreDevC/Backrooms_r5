module.exports = async (page, logs) => {
  const t0 = Date.now();
  const err = await page.evaluate(async () => { try { await window.__BR.goLevel9(null); return 'ok'; } catch (e) { return 'ERR ' + e.message + '\n' + e.stack; } });
  logs.push('QA goLevel9 ' + err); if (err !== 'ok') return;
  logs.push('QA L9 load ms ' + (Date.now() - t0));
  const info = await page.evaluate(() => {
    const B = window.__BR, W9 = B.W9, LV = B.LV;
    return { terms: W9.terms.length, lockers: W9.lockers.map(l => l.where), red: W9.red.length, doors: W9.doors.length, wretches: B.AI9.wretches.length, subj: !!B.AI9.subject,
      meshes: B.SCN().meshes.length, mats: B.SCN().materials.length, items: B.W.items.length, tvs: B.W.tvs.length, interact: B.W.interact.length };
  });
  logs.push('QA ' + JSON.stringify(info));
  await page.screenshot({ path: '/data/qa9/a0_intro.png' });
  // fast-forward the intro
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 240; i++) B.simStep(1 / 60); });
  logs.push('QA state ' + await page.evaluate(() => window.__BR.G.state + ' obj=' + document.getElementById('objective').textContent));
  await page.waitForTimeout(2500);
  await page.screenshot({ path: '/data/qa9/a1_start.png' });
  const shot = async (name, fn, wait = 2500) => { await page.evaluate(fn); await page.waitForTimeout(wait); await page.screenshot({ path: '/data/qa9/' + name + '.png' }); };
  // flashlight on, look down the street
  await shot('a2_flash', () => { const B = window.__BR; B.PL.flash = true; B.PL.fk = 1; B.PL.yaw = 0.3; });
  // kiosk + gate
  await shot('a3_kiosk', () => { const B = window.__BR, K = B.W9.kiosk; B.PL.x = K.x - 0.5; B.PL.z = K.z + 3.2; B.PL.yaw = Math.PI; B.PL.pitch = -0.05; B.PL.cell = -1; });
  // inside a red house near the terminal
  await shot('a4_term', () => { const B = window.__BR, T = B.W9.terms[0]; const a = Math.atan2(T.x - T.pos.x, T.z - T.pos.z); B.PL.x = T.x; B.PL.z = T.z; B.PL.yaw = Math.atan2(T.pos.x - T.x, T.pos.z - T.z) + Math.PI; B.PL.cell = -1;
    // step back 1.2m away from the desk along the facing direction
    const dx = T.x - T.h.hx * 3.6, dz = T.z - T.h.hz * 3.6; });
  logs.push('QA term focus ' + await page.evaluate(() => { const f = window.__BR.PL.focus; return f ? f.label() : 'none'; }));
  // lab
  await shot('a5_lab', () => { const B = window.__BR; B.PL.x = 40.5 * 3.6; B.PL.z = 2.65; B.PL.yaw = 0; B.PL.cell = -1; });
  await shot('a6_labhall', () => { const B = window.__BR; B.PL.x = 40.5 * 3.6; B.PL.z = 5.5 * 3.6; B.PL.yaw = 0; B.PL.cell = -1; });
  await shot('a7_base', () => { const B = window.__BR; B.PL.x = 18.5 * 3.6; B.PL.z = 22.2 * 3.6; B.PL.yaw = Math.PI; B.PL.cell = -1; });
  const st = await page.evaluate(() => { const B = window.__BR; return { hp: B.PL.hp, state: B.G.state, fps: B.ENG().getFps(), active: B.SCN().getActiveMeshes().length }; });
  logs.push('QA ' + JSON.stringify(st));
};
