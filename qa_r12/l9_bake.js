// r12 · Level 9 on the ray-traced bake: load time, vertex budget, NaN scan of every baked attribute, light levels, sky and materials
const assert = require('node:assert/strict');
const path = require('path');
module.exports = async (page) => {
  const check = (c, m) => { assert.ok(c, m); console.log('QA PASS ' + m); };
  page.on('pageerror', e => console.log('PAGEERROR ' + e.message));
  const t0 = Date.now();
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN && (B.RUN.f = {}); B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play', 'brief9'].includes(window.__BR.G.state), null, { timeout: 400000 });
  const loadMs = Date.now() - t0; console.log('QA load ms', loadMs);
  const r = await page.evaluate(() => {
    const B = window.__BR, L = B.LVs(), S = B.SCN(), K = B.BK2s().stats, R = B.R2s(), out = {};
    if (B.G.state === 'brief9') B.startIntro9();
    for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    out.stats = K; out.workers = B.BK2s().workers;
    let bad = 0, big = 0, n = 0, maxS = 0; const kinds = {};
    for (const m of S.meshes) {
      if (!/^l2_/.test(m.name)) continue;
      for (const k of ['lS', 'lF', 'lD', 'position', 'normal', 'tangent', 'uv', 'color']) {
        const a = m.getVerticesData(k); if (!a) { bad++; continue; }
        for (let i = 0; i < a.length; i++) { const v = a[i]; if (!Number.isFinite(v)) bad++; else if (k === 'lS' || k === 'lF') { if (v > 200) big++; if (i % 4 < 3 && v > maxS) maxS = v; } }
      }
      n++; const mt = m.name.split(':')[0].replace('l2_', ''); kinds[mt] = (kinds[mt] || 0) + 1;
    }
    out.bad = bad; out.big = big; out.meshes = n; out.maxS = +maxS.toFixed(2); out.kinds = kinds;
    out.lights = { total: R.lights.length, sun: R.lights.filter(l => l.kind === 'sun').length, haze: (R.near || []).length };
    out.sky = !!B.W9.sky; out.skyMat = B.W9.sky && B.W9.sky.material && B.W9.sky.material.isReady(B.W9.sky);
    out.mats = Object.keys(R.mats);
    out.notReady = S.meshes.filter(m => /^l2_/.test(m.name) && !m.material.isReady(m)).length;
    // light levels
    // the brightest steady lamp (a tree canopy can shade one), against the brightest dead one
    const at = l => B.lightAt(l.hx, l.hz), on = L.lamps.filter(l => l.state === 1), off = L.lamps.filter(l => l.state === 0);
    out.lamps = [on.length, L.lamps.filter(l => l.state === 2).length, off.length];
    out.lampLight = +Math.max(...on.map(at)).toFixed(3); out.deadLight = off.length ? +Math.max(...off.map(at)).toFixed(3) : 0;
    // a lamp-lit room: the brightest room-cell centre in the lit houses (a lamp sits on one cell), against a house with no lamps
    const cellL = c => B.lightAt(((c % N) + 0.5) * 3.6, (((c / N) | 0) + 0.5) * 3.6), N = B.Nn();
    out.litRoom = +Math.max(...L.houses.filter(h => h.lit && h.enter).flatMap(h => h.rooms.flatMap(r => r.cells.map(cellL)))).toFixed(3);
    out.darkRoom = +Math.max(...L.houses.filter(h => !h.lit && h.enter).flatMap(h => h.rooms.flatMap(r => r.cells.map(cellL)))).toFixed(3);
    out.lmFinite = Array.from(L.lmS).every(Number.isFinite);
    out.draws = (B.PL.x = 16 * 3.6, B.PL.z = 9 * 3.6, B.simStep(0.05), S.getActiveMeshes().length);
    return out;
  });
  console.log('QA data', JSON.stringify(r));
  check(loadMs < 60000, 'Level 9 loads in under 60 s (' + loadMs + ' ms)');
  check(r.stats.verts > 150000 && r.stats.verts < 1500000, 'baked vertex count in budget (' + r.stats.verts + ')');
  check(r.stats.ms < 30000, 'bake time under 30 s (' + r.stats.ms + ' ms, ' + r.workers + ' workers)');
  check(r.bad === 0, 'no NaN / missing baked attributes');
  check(r.big === 0, 'no runaway baked light values (> 200) (max ' + r.maxS + ')');
  check(r.lights.sun === 1 && r.lights.total > 60, 'moon and ' + r.lights.total + ' lamps in the bake');
  check(r.sky && r.skyMat, 'night sky dome built and compiled');
  check(r.notReady === 0, 'every baked mesh material compiled');
  check(r.lmFinite, 'light texture values finite');
  check(r.lampLight > r.deadLight + 0.1, `lit street lamp (${r.lampLight}) is brighter than a dead one (${r.deadLight})`);
  check(r.litRoom > r.darkRoom + 0.1, `lamp-lit room (${r.litRoom}) is brighter than a dark one (${r.darkRoom})`);
  check(r.draws < 700, 'draw calls on the street under 700 (' + r.draws + ')');
};
