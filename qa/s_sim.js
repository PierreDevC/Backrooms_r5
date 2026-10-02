module.exports = async (page, logs) => {
  const r = await page.evaluate(() => {
    const B = window.__BR, out = [], P = B.PL, G = B.G;
    ENG = B.ENG(); ENG.stopRenderLoop();
    B.startGame(); B.beginPlay(); document.getElementById('blue').classList.add('hide');
    const prev = new Map(); let hp = P.hp, err = null, t0 = performance.now();
    let turnT = 0;
    try {
      for (let i = 0; i < 20 * 60 * 30; i++) {   // 20 minutes at 30 Hz
        const dt = 1 / 30;
        if (G.state === 'dead') { out.push(`t=${G.time.toFixed(0)} DEAD by ${G.cause}`); P.hp = 100; G.state = 'play'; }
        turnT -= dt;
        if (turnT <= 0) { turnT = 1 + Math.random() * 3; P.yaw += (Math.random() - 0.5) * 2.5; B.K.clear(); B.K.add('KeyW'); if (Math.random() < 0.25) B.K.add('ShiftLeft'); if (Math.random() < 0.2) P.flash = !P.flash; }
        if (P.spd < 0.3 && i % 20 === 0) P.yaw += 1.2;
        B.simStep(dt);
        for (const a of B.AI.all) { const k = a.constructor.name + (a.i ?? ''); const s = a.st + (a.present ? '' : '-'); if (prev.get(k) !== s) { if (!['Agent'].includes(a.constructor.name)) out.push(`t=${G.time.toFixed(0)} ${k}:${s} d=${a.d.toFixed(0)}`); prev.set(k, s); } }
        if (P.hp < hp - 5) out.push(`t=${G.time.toFixed(0)} HURT hp=${P.hp.toFixed(0)}`); hp = P.hp;
        if (i === 30 * 120) B.takeTape(B.W.tapes[0]);
        if (i === 30 * 240) B.takeTape(B.W.tapes[1]);
        if (i === 30 * 360) B.takeTape(B.W.tapes[2]);
        if (i === 30 * 480) B.takeTape(B.W.tapes[3]);
        if (i === 30 * 600) { const E = B.W.exit; P.x = E.x; P.z = E.z; B.useExit(); out.push('exit used, code ' + G.code.join('')); }
        if (i > 30 * 600 && i < 30 * 612) { const E = B.W.exit; P.x = E.doorPos.x + (E.x - E.doorPos.x) * 0.3; P.z = E.doorPos.z + (E.z - E.doorPos.z) * 0.3; }
        if (G.state === 'won') { out.push(`t=${G.time.toFixed(0)} WON open=${B.W.exit.open.toFixed(2)}`); break; }
      }
    } catch (e) { err = e.stack; }
    return { out: out.slice(0, 400), n: out.length, err, ms: performance.now() - t0, lost: G.lost, san: P.san, batt: P.batt, state: G.state };
  });
  logs.push('QA sim ' + JSON.stringify({ n: r.n, err: r.err, ms: r.ms, lost: r.lost, san: r.san, batt: r.batt, state: r.state }));
  require('fs').writeFileSync('/data/qa/sim.txt', r.out.join('\n'));
};
