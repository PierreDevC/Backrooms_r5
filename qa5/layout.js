const fs = require('fs'), vm = require('vm');
const S = '/data/backrooms/src/';
const stub = new Proxy(function () {}, { get: (t, k) => k === 'prototype' ? {} : stub, apply: () => stub, construct: () => stub });
const ctx = { console, Math, BABYLON: stub, window: {}, document: {}, location: { search: '' } };
vm.createContext(ctx);
let code = ['util.js', 'shaders.js', 'level.js', 'level9.js', 'world9.js', 'level5.js'].map(f => fs.readFileSync(S + f, 'utf8')).join('\n');
code += `
setDims(L5_N, L5_LMR); RNG = mulberry32(${process.argv[2] || 12345});
genLayout5(); collectPieces5(); planLights5();
const reach = bfs(LV.spawn.x, LV.spawn.y);
const regs = {}; for (let c = 0; c < N * N; c++) { const r = LV.reg[c]; if (r < 0) continue; regs[r] = regs[r] || [0, 0]; regs[r][0]++; if (reach[c] >= 0) regs[r][1]++; }
console.log('regions [cells, reachable from spawn]', JSON.stringify(regs));
console.log('rooms', LV.rooms.length, 'guest', LV.guest.length, 'pieces', LV.pieces.length, 'fixtures', LV.fixtures.length, 'warps', LV.warps.length, 'maze', LV.mazeCells.length);
const kinds = {}; for (const e of LV.ek.values()) kinds[e.kind + (e.dk ? ':' + e.dk : '')] = (kinds[e.kind + (e.dk ? ':' + e.dk : '')] || 0) + 1; console.log(JSON.stringify(kinds));
const b = bfs(3, 32); let bc = 0, br = 0; for (const c of LV.mazeCells) { bc++; if (b[c] >= 0) br++; } console.log('boiler maze reach from landing', br, '/', bc, 'exit room', b[cIdx(27, 32)], 'halls', LV.bhalls.map(h => b[h.cells[0]]).join(','));
`;
try { vm.runInContext(code, ctx); } catch (e) { console.log('ERR', e.stack.split('\n').slice(0, 4).join('\n')); }
