// ---------- r8 · Level 37 story (first pass: engine test scaffolding; replaced by the full story below) ----------
const P37 = { keys: {}, gates: {} };
function resetP37() { for (const k of Object.keys(P37)) delete P37[k]; Object.assign(P37, { keys: {}, gates: {} }); }
resetP37();
function setPhase37(p) { if (p) G37.phase = p; objective(obj37()); tasks37(); }
function obj37() { return 'FIND DRY GROUND'; }
function tasks37() {}
function target37() { return null; }
function wingsDone37() { return 0; }
function arrive37() { toast('LEVEL 37', 2); }
function flags37() {}
function endCard37() { return ['SURFACED', 'The picture goes white.']; }
function floodTick37() {}
function stopFlood37() {}
function places37Events() {}
function doorLabel37(dr) { return dr.target ? 'CLOSE DOOR' : dr.locked ? 'LOCKED' : 'OPEN DOOR'; }
function useDoor37(dr) { if (dr.locked) { SFX9.rattle(P9({ x: dr.mx, z: dr.mz })); toast('LOCKED', 1.6); return; } useDoor(dr); }
function buildStory37() {
  if (W37.tower) { const T = W37.tower; W.interact.push({ x: W37.pos.towerBase.x, z: W37.pos.towerBase.z, y: 1.2, r: 1.8, label: () => 'CLIMB THE TOWER', ok: () => !G37.onTower && G.state === 'play', act: () => climbTower37() }); }
  for (const g of W37.gates || []) W.interact.push({ x: g.x, z: g.z, y: 1.4, r: 1.9, label: () => g.low ? `${g.name} GATE · REFILL` : `${g.name} GATE · DRAIN`, ok: () => G.state === 'play' && !g.busy, act: () => { g.busy = true; g.low = !g.low; const B = LV.basins[g.basin]; B.tgt = g.low ? g.low : 0; g.low = !g.low; } });
}
function buildItems37() {}
