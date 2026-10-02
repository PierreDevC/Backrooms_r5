const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let RNG = Math.random;
const rnd = (a = 0, b = 1) => a + RNG() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const pick = arr => arr[Math.floor(RNG() * arr.length) % arr.length];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(RNG() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function hash1(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise1(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash1(i), hash1(i + 1), u) * 2 - 1; }
const V3 = (x = 0, y = 0, z = 0) => new BABYLON.Vector3(x, y, z);
const dist2 = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);
const $ = id => document.getElementById(id);
const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
