// Sequence-break test. Phase 1 (fuzz): do random available interactions in any order, teleporting to each, for a while.
// Phase 2 (solve): a solver that only follows the level's objective marker (targetN) acts on whatever is at the marker,
// and must reach an ending. Checks at every step: no runtime errors, an objective line, a marker unless the level is over.
// BR_NAV_LEVEL = level, BR_SEED = seed, BR_FUZZ = number of random actions (0 = solve only).
module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  const L = +(process.env.BR_NAV_LEVEL || 2), SEED = +(process.env.BR_SEED || 1), FUZZ = +(process.env.BR_FUZZ ?? 40);
  await page.evaluate((L) => { const B = window.__BR; B.DBG.ts = 0; B.G.diff = 0;
    if (L === 0) B.startGame(true); else { B.G.state = 'title'; ({ 9: B.goLevel9, 5: B.goLevel5, 18: B.goLevel18, 37: B.goLevel37, 2: B.goLevel2, 7: B.goLevel7 })[L](null); } }, L);
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  const r = await page.evaluate(({ L, SEED, FUZZ }) => {
    const B = window.__BR; for (let i = 0; i < 800 && B.G.state !== 'play'; i++) B.simStep(0.05);
    let seed = SEED * 7919 + 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const tgtF = () => ({ 0: B.target0, 9: B.target9, 5: B.target5, 18: B.target18, 37: B.target37, 2: B.target2, 7: B.target7 })[L]();
    const END = /RIDE UP|PUNCH IN|START THE ENGINE|SIT WITH|FOLLOW THE CABLE|LEAVE|THE EXIT|STEP THROUGH|CLIMB IN|GO UP|EXIT DOOR/;
    const log = [], issues = [];
    const keep = () => { if (L === 37) B.PL.nv = true; B.PL.hp = Math.max(B.PL.hp, 90); B.PL.san = Math.max(B.PL.san, 80); if (B.G37) { B.G37.breath = 1; } if (B.GP2) B.GP2.heat = Math.min(B.GP2.heat || 0, 0.3); B.PL.batt = Math.max(B.PL.batt, 60); };
    const step = s => { for (let i = 0; i < s * 20 && B.G.state === 'play'; i++) { keep(); B.simStep(0.05); } };
    const lab = it => { try { return String(it.label()); } catch (e) { return '?'; } };
    const okI = it => { try { return !it.ok || it.ok(); } catch (e) { return false; } };
    const go = it => { B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; B.simStep(0.05); };
    const doIt = (it, why) => { go(it); if (!okI(it)) return false; const l = lab(it); try { it.act(); } catch (e) { issues.push('THROW ' + l + ' ' + e.message); } step(/HOLD|SHUT|PRY|CALL|SPLICE|LIGHT|FILL|PRIM|CONNECT|TURN|DIG|CRANK|OPEN THE/.test(l) ? 6 : 1.2); log.push(why + ' ' + l + ' | ' + document.getElementById('objective').textContent); return true; };
    // phase 1: random order
    for (let i = 0; i < FUZZ && B.G.state === 'play'; i++) {
      const av = B.W.interact.filter(it => okI(it) && !END.test(lab(it)) && !it.it && !it.door);
      if (!av.length) break; doIt(av[Math.floor(rnd() * av.length)], 'F'); step(rnd() * 3);
      if (rnd() < 0.12 && B.G.state === 'play') { B.die('test'); B.simStep(0.05); B.cpRetry(); for (let k = 0; k < 40; k++) B.simStep(0.05); log.push('F died + retry · ' + B.G.state); if (B.G.state !== 'play') { issues.push('retry left state ' + B.G.state); break; } }
      if (B.ERRS.n) { issues.push('ERR after fuzz ' + B.ERRS.last); break; }
    }
    const fuzzState = B.G.state;
    // puzzle knowledge a player gets from the level (the foreman's taps, the safe digits): the solver may use it
    const oracle = near => {
      if (L === 2 && !B.PP2.power && B.PP2.step >= 3 && near.some(it => /THROW BREAKER/.test(lab(it)))) { if (!B.PP2.tapped) return false; for (const k of B.PP2.order) { const it = B.W.interact.find(i => lab(i) === 'THROW BREAKER ' + k); if (it) doIt(it, 'O'); } return true; }
      if (L === 7 && !B.PS7.safeOpen && near.some(it => /TURN DIAL/.test(lab(it)))) { const want = [4, 2, 7]; for (let i = 0; i < 3; i++) { const it = B.W.interact.find(q => new RegExp('TURN DIAL ' + (i + 1)).test(lab(q))); let g = 0; while (it && B.PS7.dial[i] !== want[i] && g++ < 12) { B.PL.x = it.x; B.PL.z = it.z; it.act(); } } log.push('O safe ' + B.PS7.dial.join('')); return true; }
      return false;
    };
    // phase 2: follow the marker
    let stuck = 0, lastKey = '', n = 0;
    for (; n < 140 && B.G.state === 'play'; n++) {
      const tg = tgtF(); if (!tg) { step(3); if (++stuck > 12) { issues.push('NO TARGET for 36 s'); break; } continue; }
      const near = B.W.interact.filter(it => Math.hypot(it.x - tg.x, it.z - tg.z) < 2.8 && !it.it).sort((a, b) => Math.hypot(a.x - tg.x, a.z - tg.z) - Math.hypot(b.x - tg.x, b.z - tg.z));
      const DOC = /^READ|^STUDY|^LOOK|FIELD RADIO|PICK UP THE PAGE|^THE TIME CLOCK|^THE CLOCK|NOTICE|^EXAMINE/;
      if (oracle(near)) { step(1); continue; }
      const dd = it => Math.hypot(it.x - tg.x, it.z - tg.z) + (DOC.test(lab(it)) ? 0.4 : 0), act = near.filter(it => okI(it)).sort((a, b) => dd(a) - dd(b))[0];
      const key = Math.round(tg.x) + ',' + Math.round(tg.z) + ':' + (act ? lab(act) : '-');
      if (key === lastKey) { stuck++; step(2 + stuck * 2); } else stuck = 0; lastKey = key;
      if (stuck > 10) { issues.push('STUCK at marker ' + key + ' near: ' + near.map(lab).join(' / ') + (L === 7 ? ' · ' + JSON.stringify(B.PS7) : '') + (L === 37 ? ' · flood ' + JSON.stringify([B.G37.flood, B.G37.hatchReady, B.G37.onTower, +(B.LVs().basins[2] || {}).y]) : '')); break; }
      if (act) doIt(act, 'S'); else { B.PL.x = tg.x; B.PL.z = tg.z; B.PL.cell = -1; step(2); log.push('S (walk to marker) ' + key); }
      if (B.ERRS.n) { issues.push('ERR ' + B.ERRS.last); break; }
    }
    return { L, SEED, FUZZ, fuzzState, state: B.G.state, steps: n, issues, errs: B.ERRS.n, tail: log.slice(-30) };
  }, { L, SEED, FUZZ });
  console.log('SEQ ' + JSON.stringify(r));
};
