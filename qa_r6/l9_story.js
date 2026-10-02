// r6 QA: Level 9 story houses, street names, Hale's notes, the spare-card route (Hale left in the cell) and the cure route flag.
const path = require('path');
module.exports = async (page) => {
  const out = process.env.BR_QA_OUT || __dirname, ok = (c, m) => console.log((c ? 'QA PASS ' : 'QA FAIL ') + m);
  const shot = async (name) => { await page.evaluate(() => { window.__BR.DBG.ts = 0; }); await page.waitForTimeout(1200); await page.screenshot({ path: path.join(out, 'r6_' + name + '.png') }); await page.evaluate(() => { window.__BR.DBG.ts = 1; }); };
  const boot9 = async (flags) => {
    await page.evaluate((f) => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.RUN.f = f; B.G9.from = null; B.goLevel9(null); }, flags);
    await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state) && window.__BR.W9.terms && window.__BR.W9.terms.length, null, { timeout: 240000 });
    await page.evaluate(() => { const B = window.__BR; for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05); });
  };
  await boot9({ nine0: true, lost0: 1 });
  const a = await page.evaluate(() => {
    const B = window.__BR, { G, PL, W, LV, P9S, TASKS, W9 } = B, R = LV.role9, o = {};
    o.state = G.state; o.roles = R && ['watch', 'hale', 'relief'].map(k => R[k] ? R[k].num + ' ' + R[k].street : 'none');
    o.haleMaple = R.hale && R.hale.street === 'MAPLE STREET'; o.streets = LV.st9.h.join('|');
    o.subs = B.SUBS.q.concat(B.SUBS.cur ? [B.SUBS.cur] : []).map(s => s.text).join(' / ');
    for (let i = 0; i < 80; i++) B.simStep(0.05); o.subs2 = B.SUBS.cur && B.SUBS.cur.text;
    o.lockers = W9.lockers.length; o.reliefLocker = W9.lockers.some(L => L.where === 'relief');
    o.pages = W.interact.filter(i => /HANDWRITTEN NOTES/.test(i.label())).length;
    o.safe = !!(W9.p9 && W9.p9.safe); o.tasks = TASKS.list.map(t => t.id);
    return o;
  });
  console.log('QA l9 start ' + JSON.stringify(a));
  ok(a.state === 'play' && a.roles.every(r => r !== 'none'), 'three story houses chosen'); ok(a.haleMaple, 'the Hales live on Maple Street');
  ok(/wrong door/.test(a.subs + ' ' + a.subs2), 'arrival radio remembers the Level 0 call'); ok(a.lockers >= 4 && a.reliefLocker, 'an extra canister locker in the blue house');
  ok(a.pages === 3 && a.safe, 'three Hale notes and a wall safe');
  const enter = async (k, name) => {
    await page.evaluate((k) => {
      const B = window.__BR, { PL, LV } = B, h = LV.role9[k], c = h.entryRoom.cells[0];
      for (const w of B.AI9.watch || []) w.place(5, 5, 0);
      PL.x = B.cellCenter(c % 56); PL.z = B.cellCenter((c / 56) | 0); PL.cell = -1; PL.flash = true; PL.batt = 100;
      const f = h.front; PL.yaw = Math.atan2(-(f.x - c % 56) - 0.01, -(f.y - ((c / 56) | 0)) - 0.01) || 0; PL.pitch = -0.1;
      for (let i = 0; i < 8; i++) B.simStep(0.05);
    }, k);
    if (name) await shot(name);
  };
  // map, the relief-team call, the Watch house
  const b = await page.evaluate(() => { const B = window.__BR, { G9, P9S } = B, o = {}; B.studyMap9(); B.closeMap9 && B.closeMap9(); for (let i = 0; i < 1400 && !P9S.reliefSaid; i++) B.simStep(0.05); o.reliefSaid = P9S.reliefSaid; o.lead = !!B.taskOf('relief'); return o; });
  ok(b.reliefSaid && b.lead, 'Outpost Nine points at the blue house after the map');
  await enter('watch', 'watch_house');
  const c = await page.evaluate(() => {
    const B = window.__BR, { W, PL, P9S } = B, o = {}, act = re => { const it = W.interact.find(i => re.test(i.label()) && i.ok()); if (!it) return false; PL.x = it.x; PL.z = it.z; it.act(); return true; };
    o.seen = !!P9S.seen.watch; o.rota = act(/PATROL ROTA/); o.minutes = act(/CLIPBOARD/); B.simStep(0.05);
    o.hud = B.hudItems9(); return o;
  });
  console.log('QA l9 watch ' + JSON.stringify(c)); ok(c.seen && c.rota && c.minutes && /WATCH \d:\d\d/.test(c.hud), 'Watch house: rota and minutes; HUD times the next patrol');
  await enter('relief', 'blue_house');
  const d = await page.evaluate(() => {
    const B = window.__BR, { W, PL, P9S } = B, o = {}, act = re => { const L = W.interact.filter(i => re.test(i.label()) && i.ok()).sort((a, b) => Math.hypot(a.x - PL.x, a.z - PL.z) - Math.hypot(b.x - PL.x, b.z - PL.z)), it = L[0]; if (!it) return false; PL.x = it.x; PL.z = it.z; it.act(); return true; };
    o.seen = !!P9S.seen.relief; o.rec = act(/TAPE RECORDER/); o.page = act(/HANDWRITTEN NOTES/);
    for (let i = 0; i < 500; i++) B.simStep(0.05); o.abara = B.flag('abara9'); o.relief = B.taskOf('relief') && B.taskOf('relief').done; o.pages = P9S.pages.slice();
    return o;
  });
  console.log('QA l9 relief ' + JSON.stringify(d)); ok(d.seen && d.rec && d.relief && d.pages[2], 'blue house: Abara\'s tape and the torn page');
  // terminals, gate, lab, Hale's lab page
  const e = await page.evaluate(() => {
    const B = window.__BR, { W, PL, P9S, G9, W9 } = B, o = {};
    for (const T of W9.terms) B.finishDownload(T); for (let i = 0; i < 60; i++) B.simStep(0.05);
    B.startTp9(true); for (let i = 0; i < 40; i++) B.simStep(0.05); o.lab = G9.labSeen; o.card = B.taskOf('card') && B.taskOf('card').sub;
    for (let i = 0; i < 400 && !P9S.mapleSaid2; i++) B.simStep(0.05); o.maple = P9S.mapleSaid2;
    const it = W9.p9.pages[1]; PL.x = it.x; PL.z = it.z; it.act(); o.known = B.safeKnown9(); o.card = B.taskOf('card') && B.taskOf('card').sub; o.safeTask = B.taskOf('safe') && B.taskOf('safe').text;
    o.obj = document.getElementById('objective').textContent;
    return o;
  });
  console.log('QA l9 lab ' + JSON.stringify(e)); ok(e.lab && e.maple, 'lab reached; Outpost Nine gives Hale\'s address'); ok(e.known && /SAFE/.test(e.safeTask) && /SAFE/.test(e.card || ''), 'the lab notes give the safe combination');
  // back up, into the Hale house, open the safe
  await page.evaluate(() => { const B = window.__BR; B.startTp9(false); for (let i = 0; i < 40; i++) B.simStep(0.05); });
  await enter('hale', 'hale_house');
  const f = await page.evaluate(() => {
    const B = window.__BR, { W, PL, P9S, G9, W9 } = B, o = {};
    o.seen = !!P9S.seen.hale;
    const ph = W.interact.find(i => /PHOTOGRAPHS/.test(i.label())); if (ph) { PL.x = ph.x; PL.z = ph.z; ph.act(); } o.photo = P9S.photo;
    const k = W9.p9.pages[0]; if (k) { PL.x = k.x; PL.z = k.z; k.act(); }
    const it = W9.p9.safe.it; PL.x = it.x; PL.z = it.z; o.label = it.label(); it.act();
    for (let i = 0; i < 70; i++) { PL.x = it.x; PL.z = it.z; B.simStep(0.05); } o.open = P9S.safeOpen; o.label2 = it.label();
    it.act(); o.spare = P9S.spare; o.keycard = G9.keycard; B.simStep(0.05); o.obj = document.getElementById('objective').textContent; o.cp = B.CP.on && B.CP.on.label;
    o.journal = B.taskOf('journal') && B.taskOf('journal').text;
    return o;
  });
  console.log('QA l9 safe ' + JSON.stringify(f));
  ok(f.seen && f.photo, 'Hale house: photographs'); ok(/DIAL \d{4}/.test(f.label) && f.open && f.spare && f.keycard, 'safe dials open and gives the spare keycard');
  ok(/OR CURE DR. HALE/.test(f.obj) && f.cp === 'SPARE KEYCARD', 'objective offers the elevator or the cure; checkpoint saved');
  await shot('hale_safe');
  const g = await page.evaluate(() => {
    const B = window.__BR, { W, PL, G, G9, W9 } = B, o = {};
    B.startTp9(true); for (let i = 0; i < 40; i++) B.simStep(0.05);
    PL.x = W9.elev.rx; PL.z = W9.elev.rz; B.useElevator(); for (let i = 0; i < 80; i++) B.simStep(0.05);
    o.subs = (B.SUBS.cur && B.SUBS.cur.text) + ' / ' + B.SUBS.q.map(s => s.text).join(' / ');
    for (let i = 0; i < 120 && G.state === 'play'; i++) { PL.x = (B.LAB_X || 47) * 3.6 + 5 * 3.6 - 0.5; PL.z = W9.elev.zc; B.simStep(0.05); }
    o.state = G.state; return o;
  });
  console.log('QA l9 leave ' + JSON.stringify(g)); ok(g.state === 'won', 'elevator with the spare card');
  await page.waitForFunction(() => window.__BR.G5 && window.__BR.G5.from && ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 }).catch(() => {});
  const h = await page.evaluate(() => window.__BR.RUN.f); console.log('QA l9 flags ' + JSON.stringify(h));
  ok(h.hale9 === 'left' && h.journal9 === 3 && h.abara9 && h.rota9 && h.nine0, 'Level 9 choices carried (Hale left behind)');
  const errs = await page.evaluate(() => window.__BR.ERRS); console.log('QA errs ' + JSON.stringify(errs)); ok(!errs.n, 'no recovered frame errors');
};
