// ---------- r8 · Level 37: the people and things in the water (stub; filled in below) ----------
const AI37 = { npcs: [], staff: [], fish: null };
function initAI37() { Object.assign(AI, { all: [], howlers: [], smilers: [], exps: [], crawler: null, mimic: null, flick: 0 }); AI37.npcs = []; AI37.staff = []; AI37.fish = null; }
function updateAI37(dt) {
  PL.fear = 0; PL.interf = 0; AI.flick = 0; G.chase = 0;
  for (const a of AI.all) a.update(dt);
  AI.visT -= dt; if (AI.visT <= 0) { AI.visT = 0.1; for (const a of AI.all) a.cull(); }
  const cs = []; for (const a of AI.all) if (a.shown && a.shadowR > 0) { const d = a.d; if (d < 20) cs.push([d, a]); } cs.sort((a, b) => a[0] - b[0]);
  for (let i = 0; i < 8; i++) { const a = cs[i] && cs[i][1]; if (a) setShadowCaster(i, a.x, a.z, a.shadowR, 0.45); else setShadowCaster(i, 0, 0, 0, 0); }
}
function foes37() { return []; }
