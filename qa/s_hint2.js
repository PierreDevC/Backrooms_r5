module.exports = async (page, logs) => {
  await page.evaluate(() => { window.__BR.DBG.ts = 6; });
  await page.click('#btnPlay');
  await page.waitForFunction(() => window.__BR.G.state === 'play', null, { timeout: 120000 });
  const r = await page.evaluate(() => { const B = window.__BR; B.G.grace = 9999; for (const h of B.AI.howlers) h.place(1, 1); if (B.AI.mimic) B.AI.mimic.place(1,1);
    B.G.hintT = 200; const out = []; B.K.add('KeyW');
    for (let i = 0; i < 20 * 60 * 3; i++) { if (B.HINT.site) B.PL.yaw = B.HINT.dir; B.simStep(1 / 60); B.PL.hp = 100; B.PL.san = 100;
      if (i % 600 === 0) out.push([i / 60, B.HINT.stage, B.HINT.pathD, B.G.tapes, B.PL.x.toFixed(1), B.PL.z.toFixed(1)].join(','));
      const s = B.HINT.site; if (s && Math.hypot(s.x - B.PL.x, s.z - B.PL.z) < 1.2) { B.takeTape(s); out.push('took ' + s.i + ' at ' + (i/60).toFixed(0)); B.G.hintT = 200; }
      if (B.G.tapes >= 4) break; }
    B.K.delete('KeyW'); return out; });
  logs.push('QA ' + r.join(' | '));
};
