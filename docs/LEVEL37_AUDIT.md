# Level 37 progression and rendering audit — r12.1, 2026-10-04

Follow-up: [r12.2 geometry inspection](LEVEL37_GEOMETRY.md) repairs submerged roof clipping and the tower edge rail, with 35 new screenshots.

Scope: current r12 source, Level 37 objectives, branching, cancellation, checkpoint/restart state, collision reachability, renderer/props, and continuation. The release preserves the existing r12 development work; it does not claim to finish its planned Level 9 objective redesign.

## Findings and repairs

| Severity | Reproduction and consequence | Repair |
| --- | --- | --- |
| Critical | Play NEW_VIDEO.AVI inside the booth and wait 4.2 seconds. Its only exit closes and locks, leaving the player unable to reach the Well. | Open/unlock while the player occupies the booth; close and lock behind the player after they leave. Tested with real movement/collision through the door. |
| High | Walk away or die during Teague's stopwatch hold. The hold cancels but her swimming flag remains set, so timing cannot restart and the brass key cannot be earned. | Reset incomplete timing on hold cancellation/death and checkpoint respawn. Start swimming only when holdStart succeeds; retain the stopwatch. |
| High | Die just after playing the video; retry before delayed flood events run. Old callbacks raise water, lock doors and spawn the fish after reset, including during a subsequent replay. | Per-attempt flood generation guards; invalidate callbacks on retry. Capture the prior water target before scheduling any event. |
| High | Build Level 37 again after a flood. W37 retains the old sluice solid index and scene-owned references, causing a recovered exception and incomplete checkpoint reset. | Clear all W37 fields before initializing the new scene. Let checkpoint failures reach the shared error reporter. |
| Medium | Drain the Shallows, immediately refill, then wait. The old 26-second callback marks the filled pool drained and publishes the wrong objective/checkpoint. | Per-gate completion generation and target check; clear drained on refill. |
| Medium | Flood the Well deck. Physics adds dry deck cells to the basin but the surface mesh contains only the original pool cells. | Build the surface over the entire Well; below deck height the floor occludes the additional faces. Guard this change to Level 37 because Level 7 shares the renderer. |
| Medium | The booth has CRT geometry but no W37.tvScreen. drawTv37 silently returns, so playback has no visible screen. | Add the dynamic texture on a persistent twin root, outside the furniture batch disposal hierarchy. Reuse existing screen text and playback drawing. |
| Low | Teague's swimming animation checks only the procedural rig hip. A skinned rig misses the shared animation call. | Include skinned rigs in the swim animation dispatch. |

No new player-facing words, canon, voice clips, assets, or controls were introduced.

## Objective chain and branch results

Abara → kettle key/Plant → Shallows drain → Pell camcorder + cassette → return to Abara → three independent wings:

- Hotel: drawer/204 key → stopwatch → Teague's completed timing → brass key → unlock 233 → card.
- Hospital: discharge form + linen/IV/chart chores → exactly three stamps → admissions → wristband; Staff interaction remains gated by night vision.
- Water World: generator → Control door/note → submerged NEW_VIDEO.AVI.

Seat the three items → play video → leave booth → rising Well/hatch → SURFACED → Continue into Level 2. Optional return to Abara after one wing offers STAY and reaches STILL WATER; Play Again returns to Level 0 or its first-run briefing.

All six panel acquisition orders pass. Early pit recovery, delayed dialogue phase monotonicity, reverse hospital chore order, repeated chores, early/late flood death, repeated video attempts, and level rebuild are checked. Prior run-dependent prose branches were read for state mutations; they only customize dialogue/ending text and do not gate the exit.

## Evidence

Re-run with `python3 qa37/reg37.py` after setting NODE_PATH for Playwright and CHROMIUM for its browser executable; `--query noassets` checks the procedural fallback.

Evidence root: `qa37/logs/audit_r12_1/`.

- `baseline_regressions/run.log`: original strict suite passed 2/14 assertions, exposing the blockers and recovered errors. Some failures cascaded from stale scene state.
- `final_regressions/run.log`: 18/18 targeted assertions pass, including late fish cleanup and overlapping replay timers.
- `branches_final/run.log`: 14/14 branch/geometry/ending assertions pass.
- `chain_strict/run.log`: complete quest chain earns the actual brass key, unlocks 233, focuses the hatch at water height, uses keyboard E, and clicks the actual Continue button into playable Level 2.
- `reach_final/run.log`: all 42 rooms and quest anchors pass collision-aware reachability; quest doors are treated as open for this layout check.
- `fallback/run.log`: 14/14 progression assertions with `?noassets`; this precedes the final TV-only repair.
- `render_final/`: idle/playing TV and fully flooded Well screenshots; enabled mesh/material readiness and finite geometry/transform checks. Actual buoyancy brings the camera to ~12.13 m with water at 11.9 m and the hatch ready. Health/breath replenishment isolates this visual check from combat.
- `views/`: 20 room/prop captures and montage. Inspected Shallows arches, spiral stair, Cabana/Abara, Well, pit corridor, Plant, booth, hotel court/lobby, hospital, park dome/staff areas and wave pool. Walls/floors/props render without obvious missing surfaces or conspicuous z-fighting in these captures. Heavy underwater haze limits distant detail.
- `shared_regressions/`: all 12 `qa_r7/reg71.py` suites pass (135 logged assertions), including Level 0 Howler ownership, shared checkpoints, earlier stories, piano clues, level selection/mobile and transitions. The final TV-only repair was added during this run; Level 37's final suites cover it.
- `downstream/run.log`: three strict checks pass: Level 2 regulator/lift chain, actual Continue into Level 7, and Level 7 fuel/motor/cable/lamp route to SAIL. `level7/run.log` additionally reaches KEEPER and THE DEEP with debug prerequisites.
- Bundle passes `python3 tools/check_bundle.py game/The_Backrooms_Found_Footage.html`; source/generated bundle rebuilt with `game/build.py`.

The older Level 37 story harness accepted a failed stopwatch and bypassed locked 233 via teleports. It also invoked the hatch action without checking camera height/focus. The strict story/chain tests now reject missing interactions and check actual hotel prerequisites and hatch input. A scripted camera matrix refresh prevents an asynchronous render cache from making the focus assertion flaky. A Stay-return harness initially waited only for intro; it now accepts the legitimate first-run Level 0 briefing. These were test corrections, not game faults.

## Known limits

These are debug-assisted headless Chromium/SwiftShader checks, not a human complete playthrough or real-GPU/touch/audio-quality evidence. Most quest transitions teleport between anchors and invoke actions directly; booth escape uses movement/collision, and the hatch uses focus plus actual E. Reachability does not establish enemy fairness, vertical swimming difficulty or battery economy. Dense underwater haze, long objective text crowding the top HUD at 960px, real hardware performance, and human discovery/pacing remain review items. Later levels' existing suites replenish resources and use scripted transitions; successful endings prove quest-state reachability only.

Older visual-review files are historical snapshots and do not describe this build's full current state. The absent booth window remains an architectural detail; the repaired door provides the required escape.
