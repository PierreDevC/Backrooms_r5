# Level 9 r12 — rebuild plan (handoff)

Request (user, verbatim): "Ok now for level 9, do a complete refactor of the map, increase details, fidelity, rendering, 3D models. Expand the map and add way more objectives, add energy drinks and energy bars (more common than camcorders), add batteries that we need to find for flashlights. Add some sort of scroll wheel release mechanism to consume items we store, consuming energy bars/drink have temporary effects like we did in level 2 but also has permanent progressive increases that improve player stats (vitality, stamina, higher sanity tolerance). Also when consuming a bar/drink for temp effects, it will show a little circle with icon to the right of the stamina bar/vitality bar/sanity bar to show the effects (depending on what stat the consumable affects)"

Work in the worktree `/Volumes/crucial/Downloads/Backrooms_claude`, branch `agent/claude`. Build: `cd game && python3 build.py`. Headless QA: see `docs/QA.md` (qa18/run18.js + a script).

## Done (step 1): items, effects, gains, flashlight batteries — `game/src/items.js`
- Belt: `ITEMS` / `BELT` (water, bar, drink, cells, spare). The mouse wheel calls `beltWheel` → `beltStep`. Q, or a middle-click released (`useSel`), uses the selected item. B, T and R remain shortcuts. On touch, ITEM = KeyQ and NEXT = `ItemNext`.
- Timed effects (`EFX`):
  - bar → `mendT` (+0.5 VIT/s, 40 s) and `fedT` (stamina regen ×2, 60 s);
  - drink → `wiredT` (sprint cost ×0.4, 40 s) and `focusT` (sanity loss ×0.5, 40 s).
  - Rings with a countdown show in `#fx_hp`, `#fx_st` and `#fx_sa`, next to the meters.
- Lasting gains (`GAIN`, `PL.up`):
  - bar → max VIT +2 and stamina +1%;
  - drink → stamina +3% and max SAN +2.
  - Caps: VIT +40, STA +40%, SAN +40.
  - Use `hpMax()`, `sanMax()` and `staCap()`. All `Math.min(100, PL.hp|san …)` calls were replaced. The meters lengthen through the CSS var `--k` on `.m`.
- Carry between levels: `carryOut()` is merged into `carryFromL0` and `carryFrom9`. Every goLevel calls `carryIn(f)` before `updateField()`.
- Flashlight batteries: `flashOwn()` is true only on LVL 9 (extendable).
  - The flashlight drains `PL.fbatt` at `FLASH9.drain`; night shot still drains `PL.batt`.
  - Pickups are type `'cells'` (`takeItem`). F on a dead flashlight loads a pack.
  - The `#fbatt` meter appears under SPARE.
- Test: `qa_r12/items.js` (14 checks). `qa2/s2_energy.js` still passes.

## Done (step 2): Level 9 renders through the ray-traced bake — `game/src/arch9.js`
- `buildWorld9` now runs: `genLayout9 → planWindows9 → collectPieces9 → planLights9 → planBake9 → buildLightmap (fixtures hidden; masks and wall distances only) → buildCollision → buildArch9 → buildProps9 → car occluders → doors / story / items (story9 ends with W9.finishProps()) → bake2 → bk2Meshes → buildSky9`.
- `KGeo` (arch9.js) is a `Geo` look-alike that writes into the kit buckets, so `buildArch9` is the old `buildGeometry9` unchanged apart from the output: pieces, floors, ceilings, roofs, stairs, trims all come out tessellated per material (`MAT9W.step`) and ray-traced. Edit a material's look in `MAT9W` (scan key, repeats per metre, `t255` target colour, `va` vertex wetness, `step`).
- Generalised: `R2.W` is the world-material table (`l2Tab()`; MAT9W for Level 9, which also sets `__sub` so props use the `#define SUB` shader with painted-metal / planks / steel / concrete scans); `mP3` per-material albedo gain; `l2H.x` scales all baked light (Level 9's `FX.lightScale` stutter); `r2Frame` only reads `GP2.surge` on Level 2; `R2.hazeK` is the haze density (0.003 on Level 9). `R2.lights` is assigned for Level 9 only; Level 2's haze is still unassigned (lamp haze is off there; assign `R2.lights = LV.l2Lights` after `planLights2` to turn it on and recheck the look).
- `bake2.js`: `kind: 'sun'` (the moon, `MOON9`: direction, colour, irradiance, angular radius for soft shadows, 400 m shadow rays, `noProbe` keeps it out of the 2D light texture because props take moonlight from the sky mask), sky radiance for pass-2 rays that leave the scene (`LV.l2Sky`, upward rays only, passed to the workers in `init`), lightTex alpha = `LV.sky` mask.
- Lights (`planBake9`): sodium cobra-head spots on the live street lamps (flickering or dead as in `planLights9`), warm point lamps in the lit houses, porch lights, fluorescent line lights in the outpost and lab, the compound flood, a faint spill from the lit windows of sealed houses.
- New: alpha-cut materials (`chain` link fence, `leaf` cards with a procedural leaf mask) as `CUT_CHAIN` / `CUT_LEAF` variants of the world shader; kit trees and shrubs (`kitTree9`, `kitShrub9`); night sky dome (`buildSky9`, `sky9` shader: sodium horizon glow, fbm clouds, stars, moon; `skyFrame9` follows the camera); cars cast shadows (`k2OccBox`).
- The scans were already in the pack (asph, grass, conc, siding, roof, planks, wood9, paper9, plaster, l0ceil, ktile, kwall, block, l2brick, chain), so nothing new was downloaded; carpet and wallpaper variants for step 3 are in the pack too (gcarpet, hcarpet, kcarpet, hpaper).
- Test: `qa_r12/l9_bake.js`. Screenshots: docs/screenshots/l9_r12_*.png.

## To do

### 2. (done, see above) Renderer: port Level 9 to the r11 ray-traced bake (`rt.js`, `kit2.js`, `bake2.js`, `render2.js`)
- Generalise these Level 2-only pieces:
  - `l2Mat` / `bk2Alb` use `MAT2W` → switch to a per-level table pointer (MAT9W for Level 9);
  - `r2Frame` reads `GP2.surge` → guard it with `LVL === 2`;
  - check that `R2.lights = LV.l2Lights` is assigned (the haze may currently be inactive).
- Add to `bake2.js`:
  - a `'sun'` light kind (the moon: directional, shadowed, jittered within a small angular radius);
  - sky radiance for pass-2 rays that miss (`dy > 0` → sky colour; zero for Level 2).
  - Workers are built from function sources, so new params must also be passed through `bk2Pool` init.
- New scans (ambientCG 1K-JPG → `$S/proc_l2.py` pattern → `game/assets/tex`, then `tools/build_assets.py`): asphalt (exists: `asph`), grass, sidewalk concrete, wood siding, roof shingles, brick, wood floor, carpet, wallpaper/painted plaster, kitchen tile. Credit them in `docs/CREDITS.md`.
- Props: a Level 9 variant of the prop shader (`#define SUB`) binding painted wood / wood grain / fabric instead of paint / rust / steel.
- Alpha-cut foliage material (noise or leaf texture) for trees and shrubs.
- Night sky dome: a gradient with sodium glow at the horizon, fbm clouds and a moon; match the fog to the horizon.
- Lights go to `LV.l2Lights`:
  - sodium cobra-head spots on the streets (some flicker, some dead);
  - porch lights, lamps in lit houses, troffers in the outpost and lab;
  - lit windows: emissive curtains on some sealed houses;
  - gas-station canopy panels.
- Pipeline (as `buildWorld2`):
  ```
  genLayout9 → planWindows9 → collectPieces9 → planLights9 (fill LV.l2Lights) → buildLightmap → buildCollision
  → kit arch / ground / props → doors / story / items → finishProps → await bake2 → bk2Meshes → k2Reset
  ```
  - The story builders' PropBatch props (`W9.B`, actMat) can stay; they are lit by the baked 2D `lightTex`.
- Budget: about 600k–1M baked vertices. Ground `k2Rect` step about 0.6 m, walls 0.4 m.

### 3. Map: 3×3 → 4×4 blocks
- `L9_BLK = [3, 17, 31, 45]`; streets at 1–2, 15–16, 29–30, 43–44, 57–58; `L9_NB = 60`.
- N ≈ 72, so the off-map upstairs slots and the lab (`LAB_X`) move east/south of 60; LMR about 1024 (`setDims`).
- Special blocks:
  - M.E.G. compound (keep `BX`-relative literals; many story coordinates are hard-coded, e.g. `buildKiosk` 21.25×27, `buildGate` 22–23×27, `labSigns`, `target9raw` 25.5×20.3, `startTp9`; recompute them from `BX`);
  - PARK (paths, playground, gazebo, lamp posts, trees, pond optional);
  - STRIP MALL + GAS STATION (QUIK-STOP convenience store interior full of drinks and bars, a pharmacy and hardware store with batteries, a lit canopy).
  - The remaining 12 blocks are houses (48, about 26 enterable).
- Update `streetSigns9`, `drawMap9`, `drawStory9` (street labels at the new rows), `planLights9` street lines, `AI9.streets`, parked cars, and the van position.
- House fidelity in kit:
  - lap siding (extruded boards), corner boards, window casings, sills and shutters, real glass;
  - porch with columns and steps, gable / front-gable / hip roofs with eaves, fascia, gutters and downspouts, brick chimneys;
  - foundation skirt.
  - Interiors: wallpaper, baseboards and crown, wood / carpet / tile floors, a ceiling fixture, kit furniture (sofa, beds, counters with cabinet doors and handles, tables and chairs, bookshelves with books, lamps, curtains, clutter).
  - Keep the scanned models (sofa, CRT, armchairs, shelves, gnome, hydrant, trash can) as actMat props.
- Keep these systems working:
  - windows9.js: ground-floor holes, upstairs portals, LOOK OUTSIDE, peephole, deadbolts;
  - house stairs teleport (`phys9`, `checkHouseStairs9`);
  - Wretch house AI and the Watch street patrol.

### 4. Objectives (all player-facing words through the `backrooms-dialogue` skill; list new canon for approval)
- Proposed required chain:
  1. map at the gate;
  2. RESTORE POWER: jerry can from the gas-station storeroom (carried like Level 0's battery: `PL.load`, no sprint) → outpost generator (hold E; noise draws the Watch). Until then the terminals show NO CARRIER;
  3. download data from the marked houses (3 → 4);
  4. gate → lab → existing cure chain, or Hale's safe.
- Optional tasks (`task(…, { opt: true })`): the relief team's four ID tags across the map (reward: a better flashlight), the pharmacy (almond water cache), the park gazebo (a relief-team tape), the existing notes / rota / recorder.
- Items: Normal ≈ bars 10, drinks 8, flashlight packs 8, camcorder batteries 5 (fewer than the bars and drinks), water 10. Scale by difficulty. Stock the stores. Use `itemModel` in `story9.js`: add a `'cells'` model (blister pack of D cells).
- Keep `G9` phases forward-only (see the r10.2 sequence fixes) and update `obj9` / `target9raw` / `tasks9` / `hudObj9`.

### 5. Tests and docs
- Update the qa_r6 l9_* tests, `qa9/*` and `qa_r10` nav/sequence for the new map. New tests: reach every objective, `seq_fuzz` on Level 9, a NaN scan of the bake, and load time.
- Docs: `docs/STORY.md` (Level 9), `HANDOFF.md`, `docs/QA.md`, `CHANGELOG.md`, `docs/ARCHITECTURE.md`, `docs/CREDITS.md`.
- **Notion sync pending** until the docs are uploaded.
