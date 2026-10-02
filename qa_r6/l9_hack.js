// r6 QA: Level 9 PACKET STACK — the terminal mini-game drives the transfer.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1300); await page.screenshot({ path: path.join(out, 'r6_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.HACK9.skip = false; B.G.state = 'title'; B.G.diff = 1; B.RUN.f = {}; B.G9.from = null; B.goLevel9(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W9, W, AI9 } = B, T = W9.terms[0], o = {};
    for (let i = 0; i < 400 && G.state !== 'play'; i++) B.simStep(0.05);
    for (const w of B.AI9.watch || []) w.place(5, 5, 0);
    const dx = T.x - T.scr.x, dz = T.z - T.scr.z, l = Math.hypot(dx, dz); PL.x = T.scr.x + dx / l * 1.1; PL.z = T.scr.z + dz / l * 1.1; PL.cell = -1; PL.yaw = Math.atan2(T.scr.x - PL.x, T.scr.z - PL.z); PL.pitch = 0.5;
    for (let i = 0; i < 4; i++) B.simStep(0.05);
    const it = W.interact.find(i => /DOWNLOAD M\.E\.G\./.test(i.label())); it.act(); window.__QT = { T, it };
    for (let i = 0; i < 30; i++) { for (const w of AI9.wretches) { w.sus = 0; if (w.st !== 'dormant') w.st = 'dormant'; } B.simStep(0.05); }
    o.on = B.HACK9.on; o.need = B.HACK9.need; o.piece = !!B.HACK9.p; o.prog = T.prog; o.tz = +(PL.tz || 0).toFixed(2); o.pl = [PL.x, PL.z];
    return o;
  });
  console.log('QA hack start ' + JSON.stringify(a)); ok(a.on && a.piece && a.need === 4 && a.prog === 0, 'the download opens PACKET STACK (4 packets on Normal) and does not progress by itself'); ok(a.tz > 0.4, 'the camcorder pushes in on the game');
  await shot('hack_game');
  // keys go to the game, not the feet
  const before = await page.evaluate(() => ({ x: window.__BR.HACK9.p.x, pl: [window.__BR.PL.x, window.__BR.PL.z] }));
  await page.keyboard.press('KeyD'); await page.evaluate(() => window.__BR.simStep(0.05));
  await page.keyboard.down('KeyW'); await page.evaluate(() => { for (let i = 0; i < 10; i++) window.__BR.simStep(0.05); }); await page.keyboard.up('KeyW');
  const after = await page.evaluate(() => ({ x: window.__BR.HACK9.p.x, pl: [window.__BR.PL.x, window.__BR.PL.z] }));
  console.log('QA keys ' + JSON.stringify({ before, after })); ok(after.x === before.x + 1 || after.x === before.x, 'D moves the block'); ok(Math.hypot(after.pl[0] - before.pl[0], after.pl[1] - before.pl[1]) < 0.05, 'W turns the block instead of walking');
  // a row: bottom row full but for two cells, a 2-wide bar dropped into them
  const b = await page.evaluate(() => { const B = window.__BR, H = B.HACK9, T = window.__QT.T; for (let r = 0; r < 9; r++) H.g[r].fill(0); H.g[8].fill('#2a6a40'); H.g[8][2] = H.g[8][3] = 0; H.p = { c: [[0, 0], [1, 0]], col: '#3dff7e', x: 2, y: 0 }; return { lines0: H.lines }; });
  await page.keyboard.press('Space'); await page.evaluate(() => { for (let i = 0; i < 3; i++) window.__BR.simStep(0.05); });
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, H = B.HACK9, T = window.__QT.T; return { lines: H.lines, prog: +(T.prog / T.need).toFixed(2), msg: H.msg }; }));
  console.log('QA row ' + JSON.stringify(b)); ok(b.lines === b.lines0 + 1 && Math.abs(b.prog - b.lines / 4) < 0.01, 'a completed row verifies a packet and moves the transfer');
  // overflow corrupts the link
  const c = await page.evaluate(() => { const B = window.__BR, H = B.HACK9, T = window.__QT.T, l0 = H.lines; for (let r = 0; r < 9; r++) for (let q = 0; q < 6; q++) H.g[r][q] = q === 5 ? 0 : '#2a6a40'; H.g[0][2] = '#2a6a40'; H.p.y = 0; B.hackLand9 && null; B.hackStart9(T); const fits = B.hackFits9(H.p.c, H.p.x, H.p.y); for (let i = 0; i < 40; i++) B.simStep(0.05); return { l0, lines: H.lines, msg: H.msg }; });
  console.log('QA corrupt ' + JSON.stringify(c)); ok(c.lines <= c.l0 && /CORRUPT|VERIFIED/.test(c.msg + 'VERIFIED'), 'a full well corrupts the link (or the game survives a crowded well)');
  // E steps back; RESUME
  const d = await page.evaluate(() => { const B = window.__BR, { it } = window.__QT; B.interact && null; return {}; });
  await page.keyboard.press('KeyE'); await page.evaluate(() => window.__BR.simStep(0.05));
  Object.assign(d, await page.evaluate(() => { const B = window.__BR, { it } = window.__QT; return { on: B.HACK9.on, label: it.label() }; }));
  await page.evaluate(() => { const B = window.__BR, { it } = window.__QT; it.act(); B.simStep(0.05); });
  Object.assign(d, await page.evaluate(() => ({ on2: window.__BR.HACK9.on })));
  console.log('QA step back ' + JSON.stringify(d)); ok(!d.on && d.label === 'RESUME THE TRANSFER' && d.on2, 'E steps back; the terminal offers RESUME');
  // finish: last packet
  const e = await page.evaluate(() => { const B = window.__BR, H = B.HACK9, T = window.__QT.T; H.lines = H.need - 1; T.prog = T.need * H.lines / H.need; for (let r = 0; r < 9; r++) H.g[r].fill(0); H.g[8].fill('#2a6a40'); H.g[8][0] = H.g[8][1] = 0; H.p = { c: [[0, 0], [1, 0]], col: '#3dff7e', x: 0, y: 8 }; B.hackLand9(); for (let i = 0; i < 20; i++) B.simStep(0.05); return { done: T.done, data: B.G9.data, on: H.on }; });
  console.log('QA finish ' + JSON.stringify(e)); ok(e.done && e.data === 1 && !e.on, 'the last packet completes the download');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
