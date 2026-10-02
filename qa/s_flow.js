module.exports = async (page, logs) => {
  const fr = n => page.waitForTimeout(n * 1100);
  const snap = async (name) => { await page.screenshot({ path: `/data/qa/${name}.png` }); const i = await page.evaluate(() => { const B = window.__BR; return { st: B.G.state, x: B.PL.x.toFixed(2), z: B.PL.z.toFixed(2), fade: B.FX.fadeB.toFixed(2), t: B.G.time.toFixed(1) }; }); logs.push('QA ' + name + ' ' + JSON.stringify(i)); };
  await page.evaluate(() => { window.__BR.DBG.ts = 6; });
  await fr(3);
  await snap('f_title');
  await page.click('#btnPlay');
  await fr(1);
  await snap('f_blue');
  await fr(4);
  await snap('f_wake');
  await page.waitForFunction(() => window.__BR.G.state === 'play', null, { timeout: 120000 });
  await page.evaluate(() => { window.__BR.DBG.ts = 1; window.__BR.G.grace = 9999; });
  await page.keyboard.down('KeyW'); await fr(6); await page.keyboard.up('KeyW');
  await snap('f_walk');
  // tape pickup
  await page.evaluate(() => { const B = window.__BR; B.takeTape(B.W.tapes[0]); });
  await fr(3);
  await snap('f_tape');
  // beam test: find clear spot ahead in the dark
  await page.evaluate(() => { const B = window.__BR, P = B.PL; B.G.blackout = 999; for (const h of B.AI.howlers) h.place(1, 1);
    let best = null; for (let a = 0; a < 16; a++) { const yaw = a / 16 * Math.PI * 2; let ok = true; for (let d = 0.5; d <= 7; d += 0.5) if (!B.los(P.x, P.z, P.x + Math.sin(yaw) * d, P.z + Math.cos(yaw) * d)) { ok = false; break; } if (ok) { best = yaw; break; } }
    if (best !== null) { P.yaw = best; P.pitch = 0.05; const e = B.AI.exps[0]; e.place(P.x + Math.sin(best) * 5, P.z + Math.cos(best) * 5, best + Math.PI / 2); e.st = 'idle'; e.dur = 99; }
    B.QA = best; });
  await fr(5);
  await page.evaluate(() => { document.getElementById('subs').innerHTML = ''; });
  await snap('f_beam');
  await page.evaluate(() => { const B = window.__BR; B.G.blackout = 0; });
  await page.keyboard.press('Escape');
  await fr(2);
  await snap('f_pause');
  await page.click('#btnResume');
  await fr(1);
  await page.evaluate(() => { const B = window.__BR; B.hurt(500, 'howler'); B.DBG.ts = 4; });
  await fr(3);
  await snap('f_dying');
  await page.waitForFunction(() => !document.getElementById('end').classList.contains('hide'), null, { timeout: 120000 });
  await fr(1);
  await snap('f_end');
};
