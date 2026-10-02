const fs = require('fs'), src = '/data/backrooms/src/';
const BABYLON = { RawTexture: function () { return {}; }, Engine: {}, Texture: {}, Vector3: function(){}, Vector4: function(){} };
const code = ['util.js', 'shaders.js', 'level.js', 'level9.js'].map(f => fs.readFileSync(src + f, 'utf8')).join('\n');
const extra = fs.existsSync('/data/qa9/extra.js') ? fs.readFileSync('/data/qa9/extra.js', 'utf8') : '';
const f = new Function('BABYLON', 'document', 'seed', code + '\n' + `
RNG = mulberry32(seed); setDims(L9_N, L9_LMR);
const t0 = Date.now(); genLayout9(); collectPieces9(); planLights9();
const t1 = Date.now(); buildLightmap({}); buildCollision(); const t2 = Date.now();
console.log('layout ms', t1 - t0, 'lightmap ms', t2 - t1, 'pieces', LV.pieces.length, 'fixtures', LV.fixtures.length, 'lamps', LV.lamps.length);
` + extra);
f(BABYLON, {}, +(process.argv[2] || 1));
