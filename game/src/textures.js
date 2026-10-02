// ---------- procedural, seamlessly tiling PBR-ish textures ----------
function h2i(i, j, s) { let h = (i * 374761393 + j * 668265263 + s * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function tnoise(x, y, P, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = ((xi % P) + P) % P, b = ((yi % P) + P) % P, a1 = (a + 1) % P, b1 = (b + 1) % P;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(h2i(a, b, s), h2i(a1, b, s), u), lerp(h2i(a, b1, s), h2i(a1, b1, s), u), v);
}
function tfbm(x, y, P, oct, s) { let sum = 0, amp = 0.5, f = 1, nrm = 0; for (let o = 0; o < oct; o++) { sum += amp * tnoise(x * f, y * f, P * f, s + o * 17); nrm += amp; amp *= 0.5; f *= 2; } return sum / nrm; }

function heightToNormal(H, S, strength) {
  const out = new Uint8Array(S * S * 4);
  for (let y = 0; y < S; y++) {
    const ym = ((y - 1 + S) % S) * S, yp = ((y + 1) % S) * S, yc = y * S;
    for (let x = 0; x < S; x++) {
      const xm = (x - 1 + S) % S, xp = (x + 1) % S;
      const dx = (H[yc + xp] - H[yc + xm]) * strength, dy = (H[yp + x] - H[ym + x]) * strength;
      const l = Math.hypot(dx, dy, 1), i = (yc + x) * 4;
      out[i] = (-dx / l * 0.5 + 0.5) * 255; out[i + 1] = (-dy / l * 0.5 + 0.5) * 255; out[i + 2] = (1 / l * 0.5 + 0.5) * 255; out[i + 3] = 255;
    }
  }
  return out;
}
function rawTex(data, S, scene) {
  const t = new BABYLON.RawTexture(data, S, S, BABYLON.Engine.TEXTUREFORMAT_RGBA, scene, true, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
  t.wrapU = t.wrapV = BABYLON.Texture.WRAP_ADDRESSMODE; t.anisotropicFilteringLevel = 8; return t;
}
function makeCanvas(S) { const c = document.createElement('canvas'); c.width = c.height = S; return c; }

function genWallpaper(scene, S) {
  const col = new Uint8Array(S * S * 4), H = new Float32Array(S * S);
  const stripes = 16, sw = S / stripes;
  // motif mask via canvas (drawn with wrap so it tiles)
  const cv = makeCanvas(S), g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S); g.strokeStyle = '#fff'; g.fillStyle = '#fff';
  const k = S / 1024, step = 64 * k;
  for (let s = 0; s < stripes; s++) {
    const cx = (s + 0.5) * sw;
    for (let yy = 0; yy < S; yy += step) {
      if (s % 2 === 1) {
        const cy = yy + step / 2;
        g.lineWidth = 2.4 * k; g.globalAlpha = 0.9;
        g.beginPath(); g.moveTo(cx, cy - 13 * k); g.lineTo(cx + 9 * k, cy); g.lineTo(cx, cy + 13 * k); g.lineTo(cx - 9 * k, cy); g.closePath(); g.stroke();
        g.beginPath(); g.moveTo(cx - 9 * k, cy - 20 * k); g.lineTo(cx, cy - 26 * k); g.lineTo(cx + 9 * k, cy - 20 * k); g.stroke();
        g.beginPath(); g.arc(cx, cy, 2.6 * k, 0, TAU); g.fill();
      } else {
        g.globalAlpha = 0.55; g.beginPath(); g.arc(cx, yy + 2 * k, 2 * k, 0, TAU); g.fill();
      }
    }
  }
  const mask = g.getImageData(0, 0, S, S).data;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S;
    const n1 = tfbm(u * 6, v * 6, 6, 3, 11), n2 = h2i(x, y, 5), n3 = tfbm(u * 64, v * 64, 64, 2, 7);
    const st = Math.floor(x / sw) % 2, sx = (x % sw) / sw, e = Math.min(sx, 1 - sx) * sw;
    const m = mask[i * 4] / 255;
    let b = 1 + (st ? 0.03 : -0.02) + (n1 - 0.5) * 0.1 + (n2 - 0.5) * 0.06 + (n3 - 0.5) * 0.05;
    if (e < 1.4 * k) b -= 0.07;
    b -= m * 0.13;
    const seam = x < 2 * k || x > S - 2 * k ? 1 : 0;
    b -= seam * 0.05;
    col[i * 4] = clamp(203 * b, 0, 255); col[i * 4 + 1] = clamp(184 * b * (1 - m * 0.02), 0, 255); col[i * 4 + 2] = clamp(96 * b * (1 - m * 0.1), 0, 255); col[i * 4 + 3] = 255;
    H[i] = (n2 - 0.5) * 0.35 + (n3 - 0.5) * 0.6 + (n1 - 0.5) * 0.4 + m * 0.55 - (e < 1.4 * k ? 0.35 : 0) + seam * 0.4 + (st ? 0.06 : 0);
  }
  return { albedo: rawTex(col, S, scene), normal: rawTex(heightToNormal(H, S, 1.6), S, scene) };
}

function genCarpet(scene, S) {
  const col = new Uint8Array(S * S * 4), H = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S;
    const n1 = tfbm(u * 5, v * 5, 5, 4, 21), n2 = tfbm(u * 90, v * 90, 90, 2, 22), f = h2i(x, y, 23), f2 = h2i(x >> 1, y >> 1, 29);
    const pile = 0.5 + 0.5 * Math.sin((x + y * 0.5) / S * TAU * 170);
    const b = 0.76 + n1 * 0.34 + (n2 - 0.5) * 0.3 + (f - 0.5) * 0.18 + (f2 - 0.5) * 0.12 + (pile - 0.5) * 0.05;
    const hue = (n2 - 0.5) * 16;
    col[i * 4] = clamp(136 * b + hue, 0, 255); col[i * 4 + 1] = clamp(118 * b, 0, 255); col[i * 4 + 2] = clamp(64 * b - hue * 0.5, 0, 255); col[i * 4 + 3] = 255;
    H[i] = n2 * 0.9 + f * 0.35 + f2 * 0.3 + pile * 0.12;
  }
  return { albedo: rawTex(col, S, scene), normal: rawTex(heightToNormal(H, S, 1.1), S, scene) };
}

function genCeiling(scene, S) {
  const col = new Uint8Array(S * S * 4), H = new Float32Array(S * S);
  const T = S / 2, k = S / 1024;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const i = y * S + x, u = x / S, v = y / S;
    const lx = x % T, ly = y % T, eg = Math.min(lx, T - lx, ly, T - ly);
    const fis = tfbm(u * 26, v * 26, 26, 3, 31), fn = h2i(x, y, 33), pin = h2i(x >> 1, y >> 1, 37);
    let r, gg, bb, hh;
    if (eg < 6 * k) { // metal T-bar grid
      const sh = eg < 1.5 * k ? 0.8 : 1;
      r = 214 * sh; gg = 207 * sh; bb = 178 * sh; hh = 1.0;
    } else {
      let b = 0.93 + (fn - 0.5) * 0.08 + (tfbm(u * 4, v * 4, 4, 2, 39) - 0.5) * 0.08;
      const worm = Math.abs(fis - 0.5) < 0.018 ? 1 : 0;
      const hole = pin > 0.982 ? 1 : 0;
      b -= worm * 0.16 + hole * 0.28;
      const bevel = smooth(6 * k, 16 * k, eg);
      b *= 0.82 + 0.18 * bevel;
      r = 206 * b; gg = 196 * b; bb = 152 * b;
      hh = 0.62 - 0.3 * bevel + (fn - 0.5) * 0.06 - worm * 0.12 - hole * 0.2;
    }
    col[i * 4] = clamp(r, 0, 255); col[i * 4 + 1] = clamp(gg, 0, 255); col[i * 4 + 2] = clamp(bb, 0, 255); col[i * 4 + 3] = 255;
    H[i] = hh;
  }
  return { albedo: rawTex(col, S, scene), normal: rawTex(heightToNormal(H, S, 2.2), S, scene) };
}

function exitSignTexture(scene) {
  const t = new BABYLON.DynamicTexture('exitSign', { width: 256, height: 96 }, scene, true);
  const g = t.getContext();
  g.fillStyle = '#1a0000'; g.fillRect(0, 0, 256, 96);
  g.fillStyle = '#ff2a1a'; g.font = 'bold 70px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EXIT', 128, 52);
  g.strokeStyle = '#ff2a1a'; g.lineWidth = 4; g.strokeRect(6, 6, 244, 84);
  t.update(); return t;
}
