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
    const go = it => { if (Math.hypot(it.x - B.PL.x, it.z - B.PL.z) > 2.2) { B.PL.x = it.x + 0.01; B.PL.z = it.z + 0.01; B.PL.cell = -1; } B.simStep(0.05); };
    const doIt = (it, why) => { go(it); if (!okI(it)) return false; const l = lab(it); try { it.act(); } catch (e) { issues.push('THROW ' + l + ' ' + e.message); } step(/HOLD|SHUT|PRY|CALL|SPLICE|LIGHT|FILL|PRIM|CONNECT|TURN|DIG|CRANK|OPEN THE/.test(l) ? 6 : 1.2); log.push(why + ' ' + l + ' | ' + document.getElementById('objective').textContent); return true; };
    // phase 1: random order
    for (let i = 0; i < FUZZ && B.G.state === 'play'; i++) {
      const av = B.W.interact.filter(it => okI(it) && !END.test(lab(it)) && !it.it);
      if (!av.length) break; doIt(av[Math.floor(rnd() * av.length)], 'F'); step(rnd() * 3);
      if (L === 0 && rnd() < 0.25) { B.PL.x += (rnd() - 0.5) * 30; B.PL.z += (rnd() - 0.5) * 30; B.PL.cell = -1; B.simStep(0.05); if (B.dropBattery0()) log.push('F put the battery down'); }
      if (rnd() < 0.12 && B.G.state === 'play') { B.die('test'); B.simStep(0.05); B.cpRetry(); for (let k = 0; k < 40; k++) B.simStep(0.05); log.push('F died + retry · ' + B.G.state); if (B.G.state !== 'play') { issues.push('retry left state ' + B.G.state); break; } }
      if (B.ERRS.n) { issues.push('ERR after fuzz ' + B.ERRS.last); break; }
    }
    const fuzzState = B.G.state;
    // puzzle knowledge a player gets from the level (the foreman's taps, the safe digits): the solver may use it
    const oracle = near => {
      if (L === 2 && !B.PP2.power && B.PP2.step >= 3 && near.some(it => /THROW BREAKER/.test(lab(it)))) { if (!B.PP2.tapped) return false; for (const k of B.PP2.order) { const it = B.W.interact.find(i => lab(i) === 'THROW BREAKER ' + k); if (it) doIt(it, 'O'); } return true; }
      if (L === 7 && !B.PS7.safeOpen && near.some(it => /TURN DIAL/.test(lab(it)))) { const want = [4, 2, 7]; for (let i = 0; i < 3; i++) { const it = B.W.interact.find(q => new RegExp('TURN DIAL ' + (i + 1)).test(lab(q))); let g = 0; while (it && B.PS7.dial[i] !== want[i] && g++ < 12) { B.PL.x = it.x; B.PL.z = it.z; it.act(); } } log.push('O safe ' + B.PS7.dial.join('')); return true; }
      if (L === 9) { const T = B.W9.terms.find(t => t.active && !t.done && Math.hypot(t.x - B.PL.x, t.z - B.PL.z) < 3.4); if (T) { T.prog = T.need; if (B.HACK9) B.HACK9.on = false; step(1.5); if (!T.done && B.finishDownload) B.finishDownload(T); log.push('O transfer ' + T.done); return true; } }
      if (L === 18 && B.M18 && !B.M18.played && near.some(it => /AGAIN|FLOOR PIANO/.test(lab(it)))) { if (!B.M18.song) return false; for (const i of [0, 0, 4, 4, 5, 5, 4]) B.pianoNote18(i); step(1); log.push('O song ' + B.M18.played); return true; }
      return false;
    };
    // crossing a link the way a player would: the ladder / slide / tower interact, or walking into the stair or through the portal door
    const links = { real: 0, fake: 0 };
    const cross = (e, b) => {
      const bx = B.navX(b), bz = B.navZ(b), arrived = () => Math.hypot(B.PL.x - bx, B.PL.z - bz) < 3.5;
      const it = B.W.interact.find(i => okI(i) && Math.hypot(i.x - B.PL.x, i.z - B.PL.z) < 2.4 && /CLIMB|SLIDE|LADDER/.test(lab(i)));
      if (it) { try { it.act(); } catch (er) {} step(3); if (arrived()) return true; }
      for (const d of B.W.interact) if (d.door && Math.hypot(d.x - B.PL.x, d.z - B.PL.z) < 2.6 && /^OPEN DOOR|UNLATCH|OPEN THE INNER DOOR/.test(lab(d)) && okI(d)) { try { d.act(); } catch (er) {} }
      step(1.2);
      for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
        const x0 = B.PL.x, z0 = B.PL.z; B.PL.yaw = yaw; B.K.add('KeyW'); for (let i = 0; i < 24 && !arrived(); i++) { keep(); B.simStep(0.05); } B.K.delete('KeyW'); step(1.5);
        if (arrived()) return true; B.PL.x = x0; B.PL.z = z0; B.PL.cell = -1; B.simStep(0.05);
      }
      return false;
    };
    // walk the compass route (as nav_walk does): toward the mark, through openable doors, across links
    const walk = (tg, maxT = 90, R = 1.6) => { const NAV = B.NAV, n = () => NAV.n; let t = 0, last = 1e9, still = 0;
      for (; t < maxT && B.G.state === 'play'; t += 0.1) {
        NAV.wpT = 0; const w = B.navGuide(tg); if (!w) return 'noroute';
        if (Math.hypot(tg.x - B.PL.x, tg.z - B.PL.z) < R) return 'there';
        const P = NAV.last; if (P && P.link !== undefined) { const e = P[P.length - 1]; if (Math.hypot(B.navX(e) - B.PL.x, B.navZ(e) - B.PL.z) < 1.0) { const b = NAV.linkA.get(e)[0]; if (!cross(e, b)) { links.fake++; B.PL.x = B.navX(b); B.PL.z = B.navZ(b); B.PL.cell = -1; step(0.3); } else links.real++; NAV.wpT = 0; continue; } }
        for (const q of B.W.interact) if (q.door && Math.hypot(q.x - B.PL.x, q.z - B.PL.z) < 1.8 && /^OPEN DOOR|UNLATCH/.test(lab(q)) && okI(q)) { try { q.act(); } catch (er) {} }   // a player opens the door in front of them
        const dx = w.x - B.PL.x, dz = w.z - B.PL.z, d = Math.hypot(dx, dz) || 1, sp = Math.min(d, 0.4), p = { x: B.PL.x + dx / d * sp, z: B.PL.z + dz / d * sp };
        B.collideNav(p, 0.28); B.PL.x = p.x; B.PL.z = p.z; B.PL.cell = -1; keep(); B.simStep(0.1);
        const m = NAV.metres; if (m >= last - 0.05) { if ((still += 0.1) > 8) return m < 0.6 ? 'there' : 'stalled ' + m.toFixed(1) + ' at ' + [B.PL.x.toFixed(1), B.PL.z.toFixed(1)] + ' tg ' + [tg.x.toFixed(1), tg.z.toFixed(1)] + ' wp ' + (w ? [w.x.toFixed(1), w.z.toFixed(1)] : '-') + ' pass ' + NAV.pass + ' obj ' + document.getElementById('objective').textContent; } else { still = 0; last = m; }
      }
      return 'timeout m ' + B.NAV.metres.toFixed(1) + ' at ' + [B.PL.x.toFixed(1), B.PL.z.toFixed(1)] + ' tg ' + [tg.x.toFixed(1), tg.z.toFixed(1)] + ' obj ' + document.getElementById('objective').textContent; };
    const walks = [];
    // phase 2: follow the marker
    let stuck = 0, lastKey = '', n = 0;
    for (; n < 140 && B.G.state === 'play'; n++) {
      let tg = tgtF(); if (!tg && L === 0) { const s = B.W.tapes.find(t => !t.taken); if (s) tg = { x: s.x, z: s.z }; }
      if (!tg) { step(3); if (++stuck > 12) { issues.push('NO TARGET for 36 s'); break; } continue; }
      const near = B.W.interact.filter(it => Math.hypot(it.x - tg.x, it.z - tg.z) < 2.8 && !it.it).sort((a, b) => Math.hypot(a.x - tg.x, a.z - tg.z) - Math.hypot(b.x - tg.x, b.z - tg.z));
      const DOC = /^READ|^STUDY|^LOOK|STOP LOOKING|FIELD RADIO|PICK UP THE PAGE|^THE TIME CLOCK|^THE CLOCK|NOTICE|^EXAMINE/;
      if (oracle(near)) { step(1); continue; }
      const dd = it => Math.hypot(it.x - tg.x, it.z - tg.z) + (DOC.test(lab(it)) ? 0.4 : 0), act = near.filter(it => okI(it) && !/LOOK OUTSIDE|STOP LOOKING|^OPEN DOOR|^CLOSE DOOR/.test(lab(it))).sort((a, b) => dd(a) - dd(b))[0];
      const key = Math.round(tg.x) + ',' + Math.round(tg.z) + ':' + (act ? lab(act) : '-');
      if (key === lastKey) { stuck++; step(2 + stuck * 2); } else stuck = 0; lastKey = key;
      if (stuck > 10) { issues.push('STUCK at marker ' + key + ' near: ' + near.map(lab).join(' / ') + (L === 9 ? ' · ' + JSON.stringify(tg) + ' phase ' + B.G9.phase + ' PL ' + [B.PL.x.toFixed(1), B.PL.z.toFixed(1)] + ' bld ' + B.LVs().bld[Math.floor(B.PL.z / 3.6) * B.Nn() + Math.floor(B.PL.x / 3.6)] + ' raw ' + JSON.stringify(B.target9raw && B.target9raw()) : '') + (L === 5 ? ' · phase ' + B.G5.phase + ' tg ' + JSON.stringify(tg) + ' keys ' + JSON.stringify(B.W5.keys.map(k => [k.id, k.taken, +k.x.toFixed(1), +k.z.toFixed(1)])) + ' PL ' + [B.PL.x.toFixed(1), B.PL.z.toFixed(1)] : '') + (L === 7 ? ' · ' + JSON.stringify(B.PS7) : '') + (L === 37 ? ' · flood ' + JSON.stringify([B.G37.flood, B.G37.hatchReady, B.G37.onTower, +(B.LVs().basins[2] || {}).y]) : '')); break; }
      if (L === 9 && Math.hypot(tg.x - 25.5 * 3.6, tg.z - 20.3 * 3.6) < 0.5 && Math.hypot(B.PL.x - tg.x, B.PL.z - tg.z) < 2) { B.PL.x = (47 + 2.5) * 3.6; B.PL.z = 2.65; B.PL.cell = -1; step(1.5); log.push('O stairs to the lab'); continue; }
      if (L === 9 && tg.fl) { const hs = B.LVs().houses.find(h => h.stair && Math.hypot((tg.fl > 0 ? h.stair.gGoal : h.stair.uGoal).x - tg.x, (tg.fl > 0 ? h.stair.gGoal : h.stair.uGoal).z - tg.z) < 0.5); if (hs) { const a = tg.fl > 0 ? hs.stair.uArr : hs.stair.gArr; B.PL.x = a.x; B.PL.z = a.z; B.PL.cell = -1; step(1.5); log.push('O stairs ' + (tg.fl > 0 ? 'up' : 'down')); continue; } }
      if (act && Math.hypot(act.x - B.PL.x, act.z - B.PL.z) > 2.2) { const res = walk({ x: act.x, z: act.z }); walks.push(res); }
      if (act) doIt(act, 'S'); else { const res = walk(tg, 90, 0.5); walks.push(res); if (res !== 'there') { B.PL.x = tg.x; B.PL.z = tg.z; B.PL.cell = -1; } step(1); log.push('S (walk to marker) ' + key); }
      if (B.ERRS.n) { issues.push('ERR ' + B.ERRS.last); break; }
    }
    const wk = { links }; for (const w of walks) { const k = w.split(' ')[0]; wk[k] = (wk[k] || 0) + 1; }
    return { L, SEED, FUZZ, fuzzState, walks: wk, badWalks: walks.filter(w => w !== 'there').slice(0, 6), state: B.G.state, steps: n, issues, errs: B.ERRS.n, tail: log.slice(-30) };
  }, { L, SEED, FUZZ });
  console.log('SEQ ' + JSON.stringify(r));
};
