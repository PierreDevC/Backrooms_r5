// r7 QA: Level 9 cars: every car (kerbside and driveway) stands fully on the road or on its driveway, never on the kerb, sidewalk or grass;
// kerbside cars face with traffic, kerb on their right; a mix of kinds. Screenshots of a parked car and a driveway car.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m), shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1200); await page.screenshot({ path: path.join(out, 'r7_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 0; B.RUN.f = {}; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9 && window.__BR.W9.cars, null, { timeout: 240000 });
  const a = await page.evaluate(() => { const B = window.__BR, W9 = B.W9, LV = B.LV9 ? B.LV9() : null; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    const ZN = { STREET: 1, DRIVE: 3 }, C = 3.6, bad = [], kinds = {};
    for (const c of W9.cars) { kinds[c.kind] = (kinds[c.kind] || 0) + 1;
      const cs = Math.cos(c.ry), sn = Math.sin(c.ry);
      for (const [lx, lz] of [[-c.W / 2, -c.L / 2], [c.W / 2, -c.L / 2], [-c.W / 2, c.L / 2], [c.W / 2, c.L / 2], [0, 0]]) { const x = c.x + lx * cs + lz * sn, z = c.z - lx * sn + lz * cs, cx = Math.floor(x / C), cz = Math.floor(z / C), zone = LV.zone[cz * 56 + cx];
        if (zone === ZN.STREET) { const fx = x / C - cx, fz = z / C - cz, kerb = 1.35 / C; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dz]) => LV.zone[(cz + dz) * 56 + cx + dx]); if ((nb[0] !== ZN.STREET && fx > 1 - kerb) || (nb[1] !== ZN.STREET && fx < kerb) || (nb[2] !== ZN.STREET && fz > 1 - kerb) || (nb[3] !== ZN.STREET && fz < kerb)) { bad.push(['kerb', c.kind, x.toFixed(1), z.toFixed(1)]); break; } }
        else if (zone !== ZN.DRIVE) { bad.push(['zone' + zone, c.kind, x.toFixed(1), z.toFixed(1)]); break; } } }
    const st = W9.cars.filter(c => B.LV9().zone[Math.floor(c.z / C) * 56 + Math.floor(c.x / C)] === ZN.STREET), dr = W9.cars.length - st.length;
    return { n: W9.cars.length, st: st.length, dr, kinds, bad: bad.slice(0, 10), nbad: bad.length, ex: st[0], ex2: W9.cars.find(c => !st.includes(c)) }; });
  console.log('QA cars ' + JSON.stringify(a));
  ok(a.n >= 30 && a.st >= 15 && a.dr >= 8, 'cars on the streets and in driveways: ' + a.st + ' + ' + a.dr);
  ok(a.nbad === 0, 'no car footprint touches the kerb, sidewalk, grass or a house');
  ok(Object.keys(a.kinds).length >= 3, 'several kinds of car: ' + JSON.stringify(a.kinds));
  const view = async (name, x, z, yaw, pitch = 0) => { await page.evaluate(([x, z, yaw, pitch]) => { const B = window.__BR, PL = B.PL; PL.x = x; PL.z = z; PL.cell = -1; PL.yaw = yaw; PL.pitch = pitch; PL.fk = 1; PL.flash = true; for (let i = 0; i < 6; i++) B.simStep(0.05); PL.yaw = yaw; PL.pitch = pitch; B.simStep(0.02); }, [x, z, yaw, pitch]); await shot(name); };
  const e = a.ex, f = a.ex2;
  await view('car_st', e.x - Math.sin(e.ry) * 6 + Math.cos(e.ry) * 2.0, e.z - Math.cos(e.ry) * 6 - Math.sin(e.ry) * 2.0, e.ry + 0.25, 0.12);
  { const px = e.x + Math.sin(e.ry) * 4.2 + Math.cos(e.ry) * 3.6, pz = e.z + Math.cos(e.ry) * 4.2 - Math.sin(e.ry) * 3.6; await view('car_st2', px, pz, Math.atan2(e.x - px, e.z - pz), 0.12); }
  await view('car_dr', f.x + Math.sin(f.ry) * 6.5 + 1.5, f.z + Math.cos(f.ry) * 6.5, f.ry + Math.PI - 0.2, 0.12);
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
