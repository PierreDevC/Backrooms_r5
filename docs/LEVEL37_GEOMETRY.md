# Level 37 geometry follow-up — r12.2, 2026-10-04

A second inspection of Level 37 found and repaired two renderer/physics mismatches. This follows the objective/state audit in [LEVEL37_AUDIT.md](LEVEL37_AUDIT.md). The existing r12 development work and r12.1 release are preserved.

## Repairs

| Severity | Evidence | Change |
| --- | --- | --- |
| High | In both submerged tunnels, idle buoyancy carried the camera through the roof. Hospital floor/roof: -6/-4.800 m; park: -1.5/-0.350 m. The original camera rose to about +0.24 m and reported above water, bypassing the intended submerged passage and breathing constraint. | Level 37 caps eye and camera height 0.12 m below each cell's actual ceiling, including head bob. Higher air-pocket ceilings still allow surfacing. Intentional developer flight bypasses this normal-player cap. Level 7's shared ocean physics retains its prior behavior. |
| Medium | The tower's east collision gap opens on climbing, and walking through it starts the dive. A waist-high visual rail nevertheless crossed that edge, contradicting the existing open-edge prompt. | Remove that single rail. Keep the other three sides, corner posts, platform, ladder and collision lifecycle. No RNG draws, dialogue, assets or canon change. |

After repair, hospital eye/camera = -4.920 m; park = -0.470 m. Both stay underwater. Air pockets at ceilings +1.5/+1.6 m allow eyes around +0.2 m to surface normally.

## Screenshots and analysis

Evidence root: `qa37/logs/geometry_r12_2/`. Open the [25-view geometry contact sheet](../qa37/logs/geometry_r12_2/geometry/contact_sheet.jpg), [10 prop close-ups](../qa37/logs/geometry_r12_2/closeups/contact_sheet.jpg), and [tower before/after](../qa37/logs/geometry_r12_2/geometry/tower_before_after.jpg). Full-size 960×540 PNGs sit beside each contact sheet.

- Shallows arches and decorative spiral, stepped pit, hotel stairs, pool surfaces, diving boards, tower, doors, hotel bed/nightstand and vault table render without obvious missing faces in these views.
- Kettle, Plant table/log, booth CRT, Admissions counter/sign, pharmacy shelving, nurses' desk, generator, Control computer, fountain and ward bed were inspected close up. Their shapes and wall/floor placement render consistently; a bed footboard intentionally hides the mattress from the end-on view. These are simple procedural props, not a realism-quality certification.
- The repaired tower shot shows a visibly open diving edge. The original shot and ray test demonstrate that the removed bar crossed the collision route.
- Tunnel views now remain below the tiled roofs. Their normal view is dark, and night shot has heavy grain. Underwater haze still limits long-distance geometry visibility. Dark generator/Control props have weak contrast under their service-room lighting. These are remaining art/readability items, not additional verified progression blockers.
- Objective text near the compass can collide visually with the battery HUD at 960×540. Subtitles and temporary hints also cover props in some shots. Screenshots retain the game overlays rather than hiding them for a cleaner review.

The baseline survey's early room204/vault viewpoints and park-turn duration were corrected in the harness; those mistakes were not game geometry failures. Final screenshots record room/ceiling metadata, use proper prop anchors, and wait for a new rendered frame. Baseline and intermediate evidence remain available in `geometry_baseline/`, `geometry_probe/` and `geometry_fixed/`.

## Tests

`qa37/s37_geometry.js` passes 114 assertions on the normal build and with `?noassets`: finite mesh position/normal/UV data and transforms, valid indices and parents, 84 floor/ceiling ray samples across all 42 rooms, 20 inside-room camera checks, both submerged ceilings, hotel-stair walking, hospital and park tunnel swimming, both air pockets, an unobstructed tower-edge ray, climb/dive/collision reset, and developer-flight compatibility. `final/geometry/geometry.json` records 292,558 vertices on the normal build. Room ray checks sample one cell per room; they are not an exhaustive wall, seam or every-cell collision audit.

`qa37/s37_geometry_closeups.js` adds ten anchor-directed views with room, ceiling and error assertions. `qa37/reg37.py` now includes both suites, and invoking it without suite arguments correctly selects all suites.

Progression, branches, chain, downstream and reach suites pass on the repaired HTML. This retains all six wing/panel orders, both Level 37 endings, real hatch E input, playable Continue to Level 2, and the downstream Level 2/Level 7 ending checks. JavaScript bundle syntax passes. Logs are checked for PAGEERROR, failed assertions, recovered errors and unhandled rejections.

Shared regression results: 11 of 12 suites passed on the first run; the remaining Level 0 story suite passed unchanged on repeat. See `shared/` and `l0_story_repeat/`. The full first run correctly returns failure. The first Level 0 story run failed three Reyes/helped-flag assertions after Reyes died during the long pre-dialogue simulation. An unchanged repeat passed all assertions. Keep both logs: this is a nondeterministic fixture/game-state exposure, not a clean first-pass result and not evidence of a Level 37 regression. The test's Howlers are moved away but not frozen. No unrelated Level 0 game behavior was changed in this geometry pass.

Re-run after setting NODE_PATH/CHROMIUM for local Playwright:

```sh
python3 qa37/reg37.py geometry closeups --out qa37/logs/new_geometry
python3 qa37/reg37.py geometry --query noassets --out qa37/logs/new_fallback
python3 qa37/reg37.py progression branches chain downstream reach
python3 qa_r7/reg71.py
```

## Limits and release

SwiftShader headless captures and debug-assisted setup/movement are not a human playthrough, actual touch test or hardware-GPU performance test. Health and breath are replenished during geometry route tests to isolate collision/clearance; these tests do not establish swimming difficulty or air-budget balance. The full objective/branch suites also use debug assistance. No additional completion blocker was found in the sampled geometry routes after the repairs.

Release artifacts: `releases/r12.2/`, including the complete versioned archive, upload-sized volumes, playable HTML, handoff and checksums. Prior releases remain available. Canonical Notion hub, vault, guide, QA, handoff and work queue receive the current report and attachment links; upload verification is recorded in `releases/r12.2/NOTION_SYNC.md`.
