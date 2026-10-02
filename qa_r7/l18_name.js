// r7 QA: Level 18 second chain: the coloured door needs your name; the cubby is locked; the toy box key; the song on your birthday card;
// the floor piano; the name tag; signing the door; the bus lunchbox; the ending mentions the name.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1300); await page.screenshot({ path: path.join(out, 'r7_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 0; B.RUN.f = { fed5: 1, lusk5: 'keys' }; B.G18.from = null; B.goLevel18(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W18 && window.__BR.W18.drawings && window.__BR.W18.drawings.length, null, { timeout: 240000 });
  const a = await page.evaluate(() => {
    const B = window.__BR, LV = B.LV18(), o = {};
    for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    for (let i = 0; i < 100; i++) B.simStep(0.05);
    o.rooms = ['music', 'cubby', 'party', 'bus'].filter(k => !!LV[k]); o.tiles = B.M18.tiles && B.M18.tiles.length;
    o.labels = B.W.interact.map(i => { try { return i.label(); } catch (e) { return ''; } }).filter(l => /TOY BOX|CUBBY|BIRTHDAY|WISH|LUNCHBOX/.test(l));
    o.musicSafe = LV.music.cells.every(c => B.W18.bright[c]);
    return o;
  });
  console.log('QA l18 name start ' + JSON.stringify(a));
  ok(a.rooms.length === 4 && a.tiles === 8, 'music room (8-key floor piano), cubbies, the birthday room and the bus are built');
  ok(['TOY BOX', 'CUBBY', 'BIRTHDAY', 'WISH', 'LUNCHBOX'].every(k => a.labels.some(l => l.includes(k))), 'their interactables: ' + a.labels.join(','));
  ok(a.musicSafe, 'the music room is a bright, safe room');
  const go = (re) => page.evaluate((src) => { const B = window.__BR, { W, PL } = B, re = new RegExp(src), it = W.interact.filter(i => { try { return re.test(i.label()) && i.ok(); } catch (e) { return false; } })[0]; if (!it) return false; PL.x = it.x; PL.z = it.z; PL.cell = -1; for (let i = 0; i < 3; i++) B.simStep(0.05); it.act(); for (let i = 0; i < 3; i++) B.simStep(0.05); return true; }, re.source);
  const b = {};
  // four drawings pinned with crayons: the door is coloured, but it wants a name
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, { W18, G18 } = B; B.setPhase18('memories'); B.readNote18('desk'); B.takeCrayons18(); for (const d of W18.drawings) B.takeDrawing18(d); for (let i = 0; i < 60; i++) B.simStep(0.05);
    B.PL.x = W18.board.x; B.PL.z = W18.board.z; B.pinDrawings18(); for (let i = 0; i < 60; i++) B.simStep(0.05);
    const X = B.W.interact.find(i => /DOOR/.test(i.label()) && Math.hypot(i.x - W18.exitDoor.x, i.z - W18.exitDoor.z) < 0.1);
    return { phase: G18.phase, on: W18.exitDoor.on, exitLabel: X.label(), obj: document.getElementById('objective').textContent, letter: document.getElementById('docB') && document.getElementById('docB').textContent }; }));
  b.cubby0 = await go(/A CUBBY WITH NO NAME/); b.obj1 = await page.evaluate(() => document.getElementById('objective').textContent);
  await page.evaluate(() => { const B = window.__BR, c = B.M18.cubbyAt; B.PL.x = c.x + 0.3; B.PL.z = c.z - 1.6; B.PL.cell = -1; B.PL.yaw = -0.1; B.PL.pitch = 0.05; for (let i = 0; i < 6; i++) B.simStep(0.05); });
  await shot('cubbies18');
  b.chest0 = await go(/THE TOY BOX · IT WON'T OPEN/); b.obj2 = await page.evaluate(() => document.getElementById('objective').textContent);
  await page.evaluate(() => { const B = window.__BR, t = B.M18.tiles; B.PL.x = (t[0].x0 + t[7].x1) / 2; B.PL.z = t[0].z1 + 3.2; B.PL.cell = -1; B.PL.yaw = Math.PI; B.PL.pitch = 0.25; for (let i = 0; i < 6; i++) B.simStep(0.05); });
  await shot('music18');
  // the birthday card has the song
  b.card = await go(/OPEN THE BIRTHDAY CARD/); b.cardTxt = await page.evaluate(() => document.getElementById('docB').textContent);
  await page.evaluate(() => { const B = window.__BR, c = B.M18.cake; B.PL.x = c.x - 1.7; B.PL.z = c.z + 1.2; B.PL.cell = -1; B.PL.yaw = 2.2; B.PL.pitch = 0.2; for (let i = 0; i < 6; i++) B.simStep(0.05); });
  await shot('party18');
  b.wish = await go(/MAKE A WISH/);
  b.obj3 = await page.evaluate(() => document.getElementById('objective').textContent);
  // a wrong tune does nothing; the song opens the toy box
  Object.assign(b, await page.evaluate(() => {
    const B = window.__BR, T = B.M18.tiles, step = (i) => { const t = T[i]; B.PL.x = (t.x0 + t.x1) / 2; B.PL.z = (t.z0 + t.z1) / 2; B.simStep(0.05); B.PL.z = t.z1 + 0.6; B.simStep(0.05); };
    for (const i of [1, 2, 3, 2, 1, 0, 6]) step(i); const wrong = B.M18.played;
    for (const i of [0, 0, 4, 4, 5, 5, 4]) step(i); for (let i = 0; i < 30; i++) B.simStep(0.05);
    return { wrong, played: B.M18.played, lid: B.M18.chestK };
  }));
  b.key = await go(/TAKE THE CUBBY KEY/);
  b.unlock = await go(/UNLOCK YOUR CUBBY/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 40; i++) B.simStep(0.05); return { fog: B.AI18.fog.length }; }));
  b.tag = await go(/TAKE YOUR NAME TAG/);
  b.obj4 = await page.evaluate(() => document.getElementById('objective').textContent);
  b.sign = await go(/WRITE YOUR NAME ON THE DOOR/);
  Object.assign(b, await page.evaluate(() => { const B = window.__BR, X = B.W18.exitDoor; for (let i = 0; i < 70; i++) { B.PL.x = X.x; B.PL.z = X.z; B.simStep(0.05); } for (let i = 0; i < 80; i++) B.simStep(0.05);
    return { phase2: B.G18.phase, on2: X.on, tasks: B.TASKS.list.filter(t => !t.opt).map(t => t.id + (t.done ? '✓' : '')) }; }));
  b.lunch = await go(/OPEN THE LUNCHBOX/); b.lunchTxt = await page.evaluate(() => document.getElementById('docB').textContent);
  await page.evaluate(() => { const B = window.__BR, L = B.M18.lunchAt; B.PL.x = L.x - 1.2; B.PL.z = L.z + 2.4; B.PL.cell = -1; B.PL.yaw = Math.PI - 0.25; B.PL.pitch = 0.1; for (let i = 0; i < 6; i++) B.simStep(0.05); });
  await shot('bus18');
  b.walk = await go(/WALK THROUGH/);
  await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 160 && !B.DEATH.shown; i++) B.simStep(0.05); });
  await page.waitForTimeout(500);
  Object.assign(b, await page.evaluate(() => ({ end: document.getElementById('endTitle').textContent, endText: document.getElementById('endText').textContent })));
  console.log('QA l18 name story ' + JSON.stringify(b));
  ok(b.phase === 'name' && !b.on && /NAME/.test(b.exitLabel) && /CUBBY/.test(b.obj), 'four pinned and coloured: the door waits for your name');
  ok(b.cubby0 && /MUSIC ROOM/.test(b.obj1), 'your cubby is locked; the objective points at the music room');
  ok(b.chest0 && /BIRTHDAY/.test(b.obj2), 'the toy box wants the song; the objective points at your birthday');
  ok(b.card && /RED · RED · BLUE · BLUE · PURPLE · PURPLE · BLUE/.test(b.cardTxt) && /FLOOR PIANO/.test(b.obj3), 'the birthday card carries the song');
  ok(b.wish, 'you can make a wish');
  ok(!b.wrong && b.played && b.lid > 0.5, 'a wrong tune does nothing; the song opens the toy box');
  ok(b.key && b.unlock && b.fog >= 1, 'the cubby key opens your cubby, and something hears the lock');
  ok(b.tag && /WRITE YOUR NAME/.test(b.obj4), 'your name tag: now sign the door');
  ok(b.sign && b.phase2 === 'exit' && b.on2, 'signing the door finishes it');
  ok(b.lunch && /Mom/.test(b.lunchTxt), 'the bus lunchbox has a note');
  ok(b.walk && b.end === 'YOU REMEMBERED' && /handwriting/.test(b.endText) && /bowl/.test(b.endText), 'the ending mentions your name on the door and the fed moth');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
