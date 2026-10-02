// r5 layout-identity check (qa_r5/modes.sh): reseed Math.random immediately before starting Level 9 / 5 / 18 (so title-screen time does not matter;
// Level 0 is built at page load for the title screen, so it depends on run5.js's SEED instead),
// then hash the generated structure (LV.zone, LV.pieces) and the collision solids. Compare runs with BR_QS = '', &noassets, &noskin, &nomodels.
const L = +(process.env.LV || 9), SEED2 = +(process.env.SEED2 || 4242);
module.exports = async (page) => {
  await page.evaluate(([L, seed]) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1;
    let s = seed >>> 0; Math.random = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    if (L === 0) B.startGame(true); else if (L === 9) { B.G9.from = null; B.goLevel9(null); } else if (L === 5) { B.G5.from = null; B.goLevel5(null); } else { B.G18.from = null; B.goLevel18(null); } }, [L, SEED2]);
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 300000 });
  const r = await page.evaluate(() => {
    const B = window.__BR, LV = B.LV9(), H = (arr, f) => { let h = 0; for (const o of arr) for (const v of f(o)) h = (Math.imul(h, 31) + Math.round(v * 100)) | 0; return h; };
    return { st: B.G.state, zone: LV.zone ? H([...LV.zone].map(v => [v]), x => x) : 0, pieces: LV.pieces.length, piecesH: H(LV.pieces, p => [p.x0, p.z0, p.x1, p.z1]),
      solids: LV.solids.length, solidsH: H(LV.solids, s => [s.x0, s.z0, s.x1, s.z1]), rigs: B.SKN.rigs.length, models: (B.MDL.lscn === B.SCN() ? B.MDL.log.length : 0),
      sol: LV.solids.map(s => [s.x0, s.z0, s.x1, s.z1].map(v => +v.toFixed(2)).concat([s.k || s.kind || ''])) };
  });
  require('fs').writeFileSync(process.env.BR_QA_OUT + '/fb2_solids_L' + L + '_' + (process.env.TAG || 'x') + '.json', JSON.stringify(r.sol)); delete r.sol;
  console.log('QA fb2 L' + L + ' ' + JSON.stringify(r));
};
