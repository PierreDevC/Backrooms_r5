// reachability + ascii map
const F = bfs(2, 6);
let bad = 0;
for (const h of LV.houses) { if (!h.enter) continue; for (const r of h.rooms) for (const c of r.cells) if (F[c] < 0) { bad++; } }
console.log('unreachable house cells', bad, 'base reach', F[cIdx(18, 18)], 'lab reach', F[cIdx(40, 5)]);
const ch = { 0: ' ', 1: '=', 2: '.', 3: ':', 4: 'H', 5: ',', 6: 'B', 7: 'L', 8: '"' };
let out = '';
for (let y = 0; y < N; y++) { let l = ''; for (let x = 0; x < N; x++) { const c = cIdx(x, y), z = LV.zone[c]; let k = ch[z]; const b = LV.bld[c]; if (b >= 0 && b < 100) { const h = LV.houses[b]; k = !h.enter ? 'x' : h.red ? 'R' : h.cans ? 'C' : h.lit ? 'h' : 'H'; } l += k; } out += l + '\n'; }
console.log(out);
console.log('doors', [...LV.ek.values()].filter(e => e.kind === 'way' && e.door).length, 'ways', [...LV.ek.values()].filter(e => e.kind === 'way').length);
