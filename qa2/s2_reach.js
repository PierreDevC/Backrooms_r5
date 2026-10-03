const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT;
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel2(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.WP2 && window.__BR.WP2.pos, null, { timeout: 240000 });
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  // helper executed in page: act on the first interactable whose label matches
  await page.evaluate(() => {
    const B = window.__BR; window.T = {
      log: [],
      step(s) { for (let i = 0; i < s * 20; i++) B.simStep(0.05); },
      act(re, hold) { const it = B.W.interact.find(i => { try { return re.test(i.label()) && (!i.ok || i.ok()); } catch (e) { return false; } }); if (!it) { T.log.push('NO ' + re); return false; }
        B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); it.act(); if (hold) T.step(hold); else T.step(0.2); T.log.push('ok ' + re + ' | obj: ' + B.obj37()); return true; },
      st() { return { phase: B.G37.phase, errs: B.ERRS.n, last: B.ERRS.last, wings: B.wingsDone37(), keys: JSON.stringify(B.P37.keys), flood: B.G37.flood, state: B.G.state }; }
    };
  });
  const run = async (name, fn) => { const r = await page.evaluate(fn); console.log(name + ' ' + JSON.stringify(r)); };
  await run('reach', () => { const B = window.__BR, LV = B.LV2(), H = 4, R = 0.3, STEP = 0.45, SZ = 72 * 3.6, NH = Math.ceil(SZ / H); const hash = Array.from({ length: NH * NH }, () => []);
    const tags = {}; for (const s of LV.solids) tags[s.tag] = (tags[s.tag] || 0) + 1; window.__tags = tags; for (const s of LV.solids) { if (s.off || s.tag === 'door') continue; for (let bz = Math.max(0, Math.floor((s.z0 - R) / H)); bz <= Math.min(NH - 1, Math.floor((s.z1 + R) / H)); bz++) for (let bx = Math.max(0, Math.floor((s.x0 - R) / H)); bx <= Math.min(NH - 1, Math.floor((s.x1 + R) / H)); bx++) hash[bz * NH + bx].push(s); }
    const blocked = (x, z) => { if (x < 0 || z < 0 || x >= SZ || z >= SZ) return true; for (const s of hash[Math.floor(z / H) * NH + Math.floor(x / H)]) { const cx = Math.max(s.x0, Math.min(x, s.x1)), cz = Math.max(s.z0, Math.min(z, s.z1)); if ((x - cx) ** 2 + (z - cz) ** 2 < R * R) return true; } return false; };
    const P = B.WP2.pos, start = { x: P.arrive.x, z: P.arrive.z }, n = Math.ceil(SZ / STEP), seen = new Uint8Array(n * n), q = [[Math.floor(start.x / STEP), Math.floor(start.z / STEP)]]; seen[q[0][1] * n + q[0][0]] = 1;
    // doors that start closed/locked count as passable (the quest opens them): treat 'door' solids tagged door as off
    for (let qi = 0; qi < q.length; qi++) { const [ix, iz] = q[qi]; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = ix + dx, nz = iz + dz; if (nx < 0 || nz < 0 || nx >= n || nz >= n || seen[nz * n + nx]) continue; if (blocked((nx + 0.5) * STEP, (nz + 0.5) * STEP)) continue; seen[nz * n + nx] = 1; q.push([nx, nz]); } }
    const reach = (p, r = 2.4) => { if (!p) return null; for (let a = -r; a <= r; a += STEP) for (let b = -r; b <= r; b += STEP) { const ix = Math.floor((p.x + a) / STEP), iz = Math.floor((p.z + b) / STEP); if (ix >= 0 && iz >= 0 && ix < n && iz < n && seen[iz * n + ix]) return true; } return false; };
    const un = []; for (const r of LV.rooms) { let ok = 0; for (const c of r.cells) { const x = ((c % 48) + 0.5) * 3.6, z = (Math.floor(c / 48) + 0.5) * 3.6; if (reach({ x, z }, 0.3)) ok++; } if (ok < r.cells.length * 0.5) un.push(r.t + '@' + (r.cells[0] % 48) + ',' + Math.floor(r.cells[0] / 48) + ':' + ok + '/' + r.cells.length); }
    const tg = { ida: B.AIP2.ida && { x: B.AIP2.ida.x - 0.9, z: B.AIP2.ida.z }, crowbar: P.crowbar, log1: P.log1, log2: P.log2, log3: P.log3, idcard: P.idcard, wreg: P.wreg, nreg: P.nreg, ereg: P.ereg, benny: P.benny, bank: P.bank, tap: P.tapPipe, clock: P.clock, valveDoor: P.valveDoor, liftPanel: P.liftPanel, liftCar: P.liftCar };
    const out = { un, cells: q.length }; for (const k in tg) out[k] = reach(tg[k], 1.6); for (const p of B.WP2.phones) out['ph_' + p.key] = reach(p, 1.6); return out; });
};
