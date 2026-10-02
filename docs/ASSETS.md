# r5 asset pipeline and integration

All third-party assets are CC0 (see CREDITS.md). Everything is optional at runtime: the game falls back to its original procedural look per asset family.

| URL flag | Effect |
|---|---|
| `?noassets` | no scanned textures, characters or models (r4.4 look, same layouts) |
| `?noskin` | procedural characters (scanned textures and props stay) |
| `?nomodels` | procedural props (scanned textures and characters stay) |

## Files
- `game/src/assetpack.js` — GENERATED. `const ASSET_TEX / ASSET_MDL / ASSET_CHR` with base64 WebP / binary payloads + metadata. Never edit by hand.
- `game/tools/build_assets.py` — packs `game/assets/{tex,mdl,chr}` into assetpack.js. Packs only texture sets referenced as `'key'` in `src/*.js` (prints the skipped ones). Identical WebP payloads are stored once (`'@key.s'` references).
- `game/tools/unpack_assets.py` — the reverse: writes `game/assets/` back out from assetpack.js (round trip is byte-identical). The packet ships assetpack.js only, so run this first if you want to change assets. Only the packed sets come back: eight processed-but-unreferenced texture sets from the original sandbox (fabric, hwood, leather, metal, rust, stone, terrazzo, tile9) are not in the pack; rerun process_tex.py on their ambientCG downloads if you need them.
- Offline converters (need the raw CC0 downloads, see CREDITS.md; paths at the top of each script point to the original sandbox and must be adjusted):
  - `tools/process_tex.py` — ambientCG 1K-JPG → `<key>_a.webp` (sRGB albedo, alpha = opacity), `<key>_n.webp` (DX normal, renormalised), `<key>_r.webp` (R = AO, G = roughness, B = height) + `assets/tex/index.json`.
  - `tools/chr/convert_chr.mjs` (Node; gltf-transform + meshoptimizer) — Quaternius base character + animation libraries → `assets/chr/human.bin/json`: mirrored into Babylon's left-handed space, 65 joints, 24 clips retargeted onto the base mesh at 15 fps (per-clip lists of animated / constant channels, stride speeds measured from foot contacts for walk/jog/sprint rate matching). `tools/chr/make_tex.py` bakes the body albedo / normal / eye maps.
  - `tools/mdl/fetch_ph.py` downloads Poly Haven models as 1k glTF (public API; pass the Poly Haven ids listed in spec.json / CREDITS.md as arguments).
  - `tools/mdl/convert_mdl.mjs` + `tools/mdl/spec.json` (Node; gltf-transform + meshoptimizer + sharp) — Poly Haven 1k glTF → `assets/mdl/<key>.bin` (16-bit quantised position / UV, 8-bit normal / tangent, 16/32-bit indices) + `<key>_a.webp` (albedo, alpha = roughness) + `<key>_n.webp` (normal RG, AO B, metalness A). spec.json: source id, node filter, triangle budget, texture size, yaw / scale fixes, double-sided flag. Every model is recentred (XZ centre, floor at y = 0) and faces +Z.

## Runtime modules
- `assets.js` — `AST`, `astOn()`, `pbrTex(key, s)` (lazy per-scene texture cache), `PBR_MAT` (material name → `base` scan or `det` detail overlay, repeats, strengths, optional tint onto the level palette), `pbrOpts()/pbrBind()` used by every level's material builder (`envMat` in actors.js, world9/world5/world18 builders).
- `shaders.js` — `PBR` / `PBRBASE` / `DETAIL` defines in the env shader (GGX specular from per-pixel roughness, AO, detail albedo/normal overlay), `SH.skinV/F` (GPU skinning, 3 texture rows per joint, role outfits painted in bind-pose space), `SH.mdlV/F` (scanned props: albedo × vertex tint, or repaint mode; image-row normal + AO + metalness; metals mirror the ambient + fixture light).
- `skin.js` — `SKN`, `sknOn()`, `buildSkinned(kind)`, per-role builders (`buildExplorerSk`, `buildHowlerSk`, `buildWatchSk`, `buildWretchSk`, `buildHaleSk`, `buildForgottenSk`, `poseDeadSk`), `SKP` role profiles (outfit, bone-length / cross-section scales, locomotion clip names, material look), clip player (`rigPlay`, `rigWant`, `rigStop`, `rigBase`, crossfades, upper-body layers, ping-pong ranges) and `sknTick()` (runs before each render: blends clips, adds the AI's procedural head / arm / lean proxies, skips rigs that are culled, except a nearby flashlight carrier whose beam still moves). Rigs keep the old procedural interface (`root, mat, hipH, head, sh[], el[], hip[], kn[], hands[]`), so AI code is unchanged.
- `models.js` — `MDL`, `mdlOk(k)`, `mdlDims(k)`, `mdlFoot(k, M, pad)` (rotated XZ footprint for `addSolid`), `MDL_K` (per-model look), `MDL_RP` (repaint reference brightness), `MdlBatch` (`add(k, root, pos, rot, scale, tint)` returns the world matrix or null; `finish(name)` merges per 28.8 m cell). `PropBatch.prototype.mdl(...)` in world.js forwards to a per-batch MdlBatch, finished together with the procedural props. `MDL.log` lists every placement (QA).

## Integration rules
- A prop swap must make the **same RNG calls** with and without the model (draw the values first, then decide what to build), so `?nomodels` and missing assets produce the same layout, solids and pick-ups (a model may deliberately bring its own footprint, like the Level 9 gnomes and Level 5 crates). Character builders must keep the same rule (`?noskin`). Check with `qa_r5/modes.sh` (same seed, four modes, diffs the collision boxes).
- `B.mdl(...)` returns null when the model is unavailable: always keep the procedural branch.
- Tints: `[r, g, b]` multiplies the scan's albedo; `[r, g, b, 0]` repaints saturated texels to the sRGB colour (relative to `MDL_RP[k]`), keeping greys and metals (Level 18 kid chairs).
- Collision stays explicit: furniture placers still call `solidLocal` / `addSolid`; rotated models can use `mdlFoot`.

## Size budget (r5)
assets/tex 27 sets ≈ 2.9 MB, assets/mdl 17 models ≈ 2.5 MB, assets/chr ≈ 0.73 MB → assetpack.js 8.1 MB base64 → HTML 12.84 MB (r4.4: 4.67 MB).
