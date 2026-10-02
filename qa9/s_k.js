module.exports = async (page, logs) => {
  const err = await page.evaluate(async () => { try { await window.__BR.goLevel9(null); return 'ok'; } catch (e) { return 'ERR ' + e.message + '\n' + e.stack; } });
  logs.push('QA goLevel9 ' + err); if (err !== 'ok') return;
  const r = await page.evaluate(() => { const B = window.__BR, K = B.W9.kiosk, sc = K.sc; const cv = sc.dt.getContext().canvas; const d = sc.ctx.getImageData(256, 187, 1, 1).data; const d2 = sc.ctx.getImageData(20, 20, 1, 1).data;
    const m = sc.mesh.material; return { px: Array.from(d), px2: Array.from(d2), cw: cv.width, ch: cv.height, mat: m && m.name, cls: m && m.getClassName(), em: m && m.emissiveColor && m.emissiveColor.asArray(), dl: m && m.disableLighting, et: !!(m && m.emissiveTexture), dtx: !!(m && m.diffuseTexture), vis: sc.mesh.isVisible, en: sc.mesh.isEnabled(), lm: !!(m && m.lightmapTexture), meshMatName: sc.mesh.material === sc.mat, rdy: sc.dt.isReady(), ptag: B.W9.kiosk.sc.dt.getSize() }; });
  logs.push('QA kiosk ' + JSON.stringify(r));
};
