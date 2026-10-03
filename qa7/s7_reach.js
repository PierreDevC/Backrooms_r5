module.exports = async (page) => {
  page.on('pageerror', e => console.log('PAGEERR ' + e.message));
  await page.evaluate(() => { const B = window.__BR; B.G.state = 'title'; B.G.diff = 1; B.goLevel7(null); });
  await page.waitForFunction(() => ['intro', 'play'].includes(window.__BR.G.state), null, { timeout: 240000 });
  const r = await page.evaluate(() => { const B = window.__BR, LV = B.LV7(), H = 4, R = 0.3, STEP = 0.5, SZ = 64 * 3.6, NH = Math.ceil(SZ / H), n = Math.ceil(SZ / STEP);
    for (let i = 0; i < 400 && B.G.state !== 'play'; i++) B.simStep(0.05);
    const hash = Array.from({ length: NH * NH }, () => []);
    for (const s of LV.solids) { if (s.off || s.tag === 'door') continue; for (let bz = Math.max(0, Math.floor((s.z0 - R) / H)); bz <= Math.min(NH - 1, Math.floor((s.z1 + R) / H)); bz++) for (let bx = Math.max(0, Math.floor((s.x0 - R) / H)); bx <= Math.min(NH - 1, Math.floor((s.x1 + R) / H)); bx++) hash[bz * NH + bx].push(s); }
    const blocked = (x, z) => { if (x < 0 || z < 0 || x >= SZ || z >= SZ) return true; for (const s of hash[Math.floor(z / H) * NH + Math.floor(x / H)]) { const cx = Math.max(s.x0, Math.min(x, s.x1)), cz = Math.max(s.z0, Math.min(z, s.z1)); if ((x - cx) ** 2 + (z - cz) ** 2 < R * R) return true; } return false; };
    const fill = (sx, sz) => { const seen = new Uint8Array(n * n), q = [[Math.floor(sx / STEP), Math.floor(sz / STEP)]]; seen[q[0][1] * n + q[0][0]] = 1; for (let qi = 0; qi < q.length; qi++) { const [ix, iz] = q[qi]; for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = ix + dx, nz = iz + dz; if (nx < 0 || nz < 0 || nx >= n || nz >= n || seen[nz * n + nx]) continue; if (blocked((nx + 0.5) * STEP, (nz + 0.5) * STEP)) continue; seen[nz * n + nx] = 1; q.push([nx, nz]); } } return seen; };
    const reach = (seen, p, r = 1.8) => { if (!p) return null; const x = p.x ?? p[0], z = p.z ?? p[2]; for (let a = -r; a <= r; a += STEP) for (let b = -r; b <= r; b += STEP) { const ix = Math.floor((x + a) / STEP), iz = Math.floor((z + b) / STEP); if (ix >= 0 && iz >= 0 && ix < n && iz < n && seen[iz * n + ix]) return true; } return false; };
    const P = B.WS7.pos, out = { seaCells: 0 }, sea = fill(P.raft.x, P.raft.z); let k = 0; for (const v of sea) k += v; out.seaCells = k;
    // from each ladder deck spot
    const lads = {}; for (const L of B.WS7.ladders) { const f = fill(L.dx, L.dz); let m = 0; for (const v of f) m += v; lads[L.id] = [reach(sea, { x: L.wx, z: L.wz }, 1.2), m]; } out.lads = lads;
    // targets from decks: rig deck (rN), ship deck (sP), islet (cS), pier (pS), pocket areas
    const fromL = id => { const L = B.WS7.ladders.find(l => l.id === id); return fill(L.dx, L.dz); };
    const rig = fromL('rN'), ship = fromL('sP'), cape = fromL('cS'), pier = fromL('pS'), eng = fromL('eng'), tw = fromL('tw'), br = fromL('br'), h1 = fromL('h1');
    const A = B.AIS7;
    out.rig = { kell: reach(rig, A.kell, 1.2), gen: reach(rig, P.gen, 1.8), air: reach(rig, P.airValve, 1.8), tide: reach(rig, P.tide, 1.8), kellLog: reach(rig, P.kellLog, 1.8), flare: reach(rig, P.flareRig, 1.8), mess: reach(rig, P.messBoard, 1.8), bunk: reach(rig, P.bunkNote, 1.8) };
    out.ship = { can: reach(ship, P.jerrycan, 1.8), cook: reach(ship, P.cook, 1.8), mate: reach(ship, P.mateLog, 1.8), flare: reach(ship, P.flareShip, 1.8), bridgeLadder: reach(ship, { x: B.WS7.ladders.find(l => l.id === 'br').wx, z: B.WS7.ladders.find(l => l.id === 'br').wz }, 1.0), engLadderTop: reach(ship, { x: B.WS7.ladders.find(l => l.id === 'eng').dx, z: B.WS7.ladders.find(l => l.id === 'eng').dz }, 1.0) };
    out.eng = { fuel: reach(eng, P.fuelValve, 1.8) }; out.bridge = { cap: reach(br, P.capLog, 1.8), bell: reach(br, P.shipBell, 1.8), ladderDown: reach(br, { x: B.WS7.ladders.find(l => l.id === 'br').dx, z: B.WS7.ladders.find(l => l.id === 'br').dz }, 1.0) };
    out.cape = { wren: reach(cape, A.wren, 1.2), clamp: reach(cape, P.clamp, 1.8), tower: reach(cape, { x: B.WS7.ladders.find(l => l.id === 'tw').wx, z: B.WS7.ladders.find(l => l.id === 'tw').wz }, 1.0), flare: reach(cape, P.flareCape, 1.8), wlog: reach(cape, P.wrenLog, 1.8) };
    out.lamp = { panel: reach(tw, P.lampPanel, 1.8), tomas: reach(tw, P.tomasLog, 1.8), down: reach(tw, { x: B.WS7.ladders.find(l => l.id === 'tw').dx, z: B.WS7.ladders.find(l => l.id === 'tw').dz }, 1.0) };
    out.pier = { board: reach(pier, P.boatBoard, 1.8), key: reach(pier, P.keyHook, 1.8), shed: reach(pier, P.shedBench, 1.8), jackets: reach(pier, P.jackets, 1.8), flare: reach(pier, P.flarePier, 1.8), fish: reach(pier, P.fishTable, 1.8) };
    out.sea = { fen: reach(sea, A.fen, 1.4), safe: reach(sea, P.safe, 1.8), dial0: reach(sea, P.dial0, 1.5), junction: reach(sea, P.junction, 1.8), airGauge: reach(sea, P.airGauge, 1.8), fenLog: reach(sea, P.fenLog, 1.8), halcyon: reach(sea, P.halcyonLog, 1.8), deep: reach(sea, P.deepCable, 2.5), hole1: reach(sea, { x: 11.5 * 3.6, z: 40.5 * 3.6 }, 1) };
    return out; });
  console.log('RE ' + JSON.stringify(r));
};
