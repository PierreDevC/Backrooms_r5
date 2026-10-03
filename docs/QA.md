# QA — r7.2 · 2026-10-02

## Current r7.2 validation
Headless Chromium/Playwright on macOS arm64/SwiftShader. All twelve reg71.py suites passed after the gameplay changes: howler, l0_story, checkpoints, cp9, l9_story, l5_state, l18_name, piano_clues, l18_final, levels, levels_mobile, transitions. Logs: qa_r7/logs/r7_2/<suite>/run.log. Final layout polish was followed by focused piano/howler/levels_mobile reruns and portrait/landscape piano tests; broad suite results precede CSS-only final polish.

- `qa_r7/l18_piano_clues.js`: 20 assertions at 960×540. Pre-key instructions; card location without tune leak; empty note display; normal poster focus; actual E read/close; saved lesson/task rules; hidden overlay during reading; birthday card mechanics; learned seven-chip melody; automatic notes and explicit/platform-labelled replay prompt; actual E repeats; off/on repeats; checkpoint clears partial notes but retains knowledge; wrong seven-note retry feedback; no panel/subtitle/toast overlap; successful box/key; viewport fit; teardown without recovered errors.
- 390×844 and 844×390 with `BR_QA_TOUCH=1`: same 20 assertions, using actual Playwright taps on the game's USE control. Evidence: qa_r7/logs/r7_2_touch_portrait and r7_2_touch_landscape. Emulated touch is not physical-device testing.
- Inspected readable lesson and all three feedback screenshots (r7_2_piano_lesson.png, r7_2_piano_feedback.png). Labels are words as well as colours. Portrait transient text stacks below the clue panel; short landscape uses separate columns and reduced type. The lesson document is scrollable. Lesson/target/feedback fit the tested viewports without horizontal overflow.
- Syntax, deterministic build and strict log audit: docs/release-validation.log. No new third-party assets, VO or changed note sounds; existing optional-asset fallbacks remain intact. The r7.1 fallback results below are historical, not a new r7.2 fallback retest.

Human discovery/readability, puzzle difficulty, real-GPU FPS and physical touch play remain pending. Debug-assisted state setup does not demonstrate that an unassisted player finds every clue. No accessibility audit or screen-reader support is claimed.

## Historical r7.1 validation
Headless Chromium/Playwright, macOS arm64, SwiftShader, 960×540; mobile-layout suite also exercises phone-sized viewports. Debug-assisted setup/progression, not evidence of human difficulty or performance. The blocked Google Fonts route now supplies empty CSS, so current logs have no intentional failed-resource exception. Historical logs below retain their original interpretation.

- `qa_r7/l0_howler.js`: 15 assertions pass. Normal startup; no Crawler; all six clips decode; 120–180 s call timer and busy deferral; entity coordinates and wall/attenuation settings; safe missing/suspended/undecoded audio; seven-second chase cooldown; moving panner; checkpoint progress/timers/source cleanup; detailed camera beacon/interaction; teardown without recovered errors.
- `python3 qa_r7/reg71.py`: all 11 suites pass: howler, l0_story, checkpoints, cp9, l9_story, l5_state, l18_name, l18_final, levels, levels_mobile, transitions. Logs in `qa_r7/logs/r7_1/<suite>/run.log`. The checkpoint suites' JSON was inspected: progress retained, safe reset states and `errs: 0`.
- `--query noassets`, `--query noskin`, `--query nomodels` with suite `howler`: all 15 assertions pass in each mode; logs in corresponding `qa_r7/logs/r7_1_<mode>/`. One initial nomodels run exposed a test assumption: the entity moved between timer ticks. The assertion now compares to the entity position at emission, not its earlier position.
- Front/rear camcorder screenshots inspected in `qa_r7/logs/r7_1/howler/`; lens, body, battery/viewfinder and tripod visible. Fourth briefing image replaced by a fresh in-game Howler capture, retaining the old image as history.
- `qa18/run18.js` fails on QA FAIL, PAGEERROR, browser console errors and recovered frame errors; title timeout is no longer ignored. Intentional fault-injection tests must explicitly scope `BR_QA_ALLOW_ERROR`; do not suppress ordinary failures.
- Syntax, exact source/bundle assembly, release hashes and manifest: `docs/release-validation.log` and `MANIFEST.sha256`. Dependencies: Node, Playwright and `CHROMIUM` executable; set `NODE_PATH` if Playwright is not installed in this checkout. `BR_QA_OUT` isolates screenshots; `BR_QA_QUERY` adds URL fallback switches.

Human headphone review is still needed for gain, positional clarity and subjective scare quality. The six-clip preview is `audio_preview/Howler_r7_1.html` (start quietly); in-game walls, distance and master gain change the mix. Real-GPU FPS, real-time full journey and actual touch gameplay remain untested. No new voice acting is claimed.

## Historical r7 validation

## Environment and scope
Same as r6: headless Chromium for Testing (Playwright, SwiftShader) on macOS arm64, 960×540, debug state calls and simStep; the single net::ERR_FAILED per log is the blocked font. These checks prove logic and wiring, not feel, pacing or frame rate. No human, real-GPU, audio or touch test of the r7 content.

## New r7 checks (qa_r7/*.js, logs in qa_r7/logs)
| Test | What it checks | Result |
|---|---|---|
| l5_state | State Floor built; 3 vestibule pairs, 6 portal doors, every inner door backs onto void; two females and the Gold Room males; 16 State Floor interactables. **Portals:** for all six inner doors the portal camera is on while the door is open, and walking forward carries you out of the twin's real door, in the right cell, facing its corridor. **Fire lock:** valves vented → phase `fire`, exit stays red, using it says FIRE LOCK. Security locked; the reservation book points at table 9; Gold Room males circle; Mothex kills a male in one pump (it falls to the floor, one pump used); the officer's keys open security; the panel needs the fire key; Mothex on a female angers her instead; she spits acid; breaking the glass gives the fire key; almond water in her bowl calms her for good (spray then does nothing, no more acid); turning the key resets the lock and opens the exit; the exit wins. | 19/19 PASS |
| l18_name | Music room (8-key floor piano), cubbies, the birthday room and the bus are built and usable; the music room is bright and safe. Four pinned with crayons → phase `name`, door label and objective ask for your name; the cubby is padlocked → objective: music room; the toy box wants the song → objective: your birthday; the card gives RED · RED · BLUE · BLUE · PURPLE · PURPLE · BLUE; MAKE A WISH; a wrong tune does nothing, the song opens the toy box; the key opens your cubby and a Forgotten spawns; the name tag; holding at the door signs it and finishes it; the lunchbox note; the ending card mentions your handwriting and the fed moth. | 15/15 PASS |
| l9_cars | 56–64 cars per layout (about 60% kerbside, 40% driveways; sedans, wagons, hatchbacks, pickups); every corner and the centre of every car footprint lies on asphalt outside the 1.35 m sidewalk strips, or on a driveway: 0 cars touching kerb, sidewalk, grass or a house (checked on several random layouts). Screenshots: docs/screenshots/r7_L9_car_*.jpg. | 4/4 PASS |

## Earlier suites rerun on the r7 build (logs `*_reg7`)
| Suite | Result |
|---|---|
| l5_story, l18_story, l0_story, l9_story, l9_windows, l9_hack, l9_termzoom, l9_peep | all PASS (13, 11, 23, 16, 7, 9, 6, 11). l5_story now resets the fire lock before the valves (the new chain is l5_state); l18_story pre-signs the door (the new chain is l18_name) |
| s18_smoke, s18_more, s18_final (10/10), levels (17/17), levels_mobile, brief9 (25/25), cp9, cpl, crash3, hearing, wretch_speed, s9_to5, water | no QA FAIL, no PAGEERROR. cpl: Level 5 checkpoint retry puts the Gold Room males back on their chandeliers (circle), Level 18 retry unchanged. water: Level 5 now has one more bottle on every difficulty (13 / 9 / 6, the kitchen's) |
| crashrf | only the injected fault ("[recovered world] … 'ctx'"), as in r6 |
| l9_roam | failed 2 of 3 runs on random layouts: the roaming Wretch walked into the crouched player during the "silent" minute (a legitimate touch wake), and the touch step then started from a chase. The test now counts only what happens before such a touch and resets the Wretch at home before the touch step: 3/3 PASS (`l9_roam_reg7b`) |
| l9_watch | 1 of 3 runs: "on the third download it comes and walks round that house" (17% of the beat near the house, the threshold is higher); 2 of 3 PASS (`l9_watch_reg7b`). Random-layout sensitivity of an r6 test, unchanged code |
| qa5/s5_smoke, qa5/s5_more | sandbox screenshot paths made portable. The hotel steps pass (keys, staff door, stairs, valves → exit with the fire lock reset, moth attack, death screen, retry); their final steps still expect the pre-r4 Level 5 end screen (Level 5 hands over to Level 18 since r4) and are kept for reference only |

## Visual checks
Screenshots inspected: Cross Hall both ways (columns, runner, chandeliers, lit windows, the East Room through the arch), the East Room (windows, drapes, the female under the chandelier), the Gold Room (after brightening: two chandeliers I 0.72 plus four corner fills; the males circling), kitchen (wall tile scaled down 4×), security (CCTV wall, panel), the ballroom vestibule with the inner door open on the Cross Hall, the view just after walking through, Level 9 cars kerbside and in a driveway (the first car model's side glass read as a grey box under the flashlight; rebuilt as trapezoid panels with tumblehome and tube pillars), Level 18 music room, cubbies, birthday room and bus. docs/screenshots/r7_*.jpg.

## Not tested / next gate
A human pass on a real GPU: portal cost (a second half-resolution scene render while an inner door is open and in view), how readable the fire-lock chain is without the compass, whether the females are fair (acid damage 11 / 16 / 21 by difficulty, puddles 2.5/0.5 s), the floor piano's feel (stepping on/off keys), and the car shapes in motion.

# QA — r6 · 2026-10-01 (branch story-r6, kept for reference)

## Environment and scope
Headless Chromium for Testing (Playwright, SwiftShader) on macOS arm64, 960×540 unless noted; Babylon.js served from qa/babylon.js; optional Google Fonts blocked (the single net::ERR_FAILED line is intentional). Debug state calls and simStep, as before: these checks prove the logic and the wiring, not difficulty, pacing or feel. No human, real-GPU, audio or touch test of the r6 content.

## New r6 checks (qa_r6/*.js, outputs in BR_QA_OUT)
| Check | Result |
|---|---|
| l0_story | Three rooms carved (camp / substation 3×3, office 3×3 or 4×3, doorways 2 / 1 / 2); every cell and all four tapes reachable after carving; Reyes starts hurt in the office; three logbook pages and three breakers; keypad starts unpowered; Brandt's power call; camp radio reaches Outpost Nine and locks the tape signal; whiteboard / map / crate; logbook complete (+1 battery); FIELD NOTES lists objectives, leads and documents; Reyes asks for water, takes it, heals you, gets up; three breakers power the keypad (Howlers investigate); exit opens; run flags carried into Level 9; a new Level 0 run resets flags and the keypad; battery route (no sprint, connected at the door). Repeated on 6 random layouts, all PASS, no recovered frame errors |
| l9_story | Story houses chosen (Hale on Maple Street every time); arrival radio remembers the Level 0 call; extra canister locker in the blue house; three Hale notes and the safe; relief-team call after the map; Watch house rota → HUD patrol timer; Abara's tape and the torn page; lab notes give the safe combination and the keycard task offers the safe; photographs; safe dials open (2.4 s hold) and gives the spare keycard; objective "TAKE THE SERVICE ELEVATOR — OR CURE DR. HALE"; checkpoint SPARE KEYCARD; elevator with the spare card and Outpost Nine's line; flags (hale9 = left, journal9 = 3, abara9, rota9). 5 random layouts, all PASS |
| l5_story | Office and the guest's locked room built; Hale speaks from the car and takes the radio lines when hale9 = saved; register and night audit; switchboard reaches the guest, who asks for rye (HUD mentions it); rye left, key slides out; master key → staff door with no housekeeping keys (checkpoint MASTER KEY, keys task "NOT NEEDED"); his room is empty; boilers and exit; flags. PASS |
| l9_termzoom | Terminal zoom starts with the download, deepens with progress, lets go when you look away, when a Wretch hunts, and when the transfer completes. PASS |
| l9_windows | 649 window positions per layout; ~190 real ground-floor openings and ~190 upstairs portals, each with LOOK OUTSIDE; the upstairs portal renders while you face it; LOOK OUTSIDE puts the camcorder at the glass and a step ends it; the sill still blocks walking out; latching turns the thumb-turn 90° and throws the bolt 5 cm. A portal frame was compared with the same view rendered directly from the room's physical position: they match once the facade's own window dressing (deliberately hidden from the portal) is accounted for. PASS |
| l9_hack | PACKET STACK opens with the download (4 packets on Normal) and the transfer doesn't move by itself; the camcorder pushes in; real key presses move and turn the block without moving the player; a completed row verifies a packet (+25%); a full well corrupts the link (−1 packet, modem screech); E steps back and the terminal offers RESUME; the last packet completes the download. PASS |
| Level 9 rerun after windows / deadbolts / PACKET STACK (logs `*_reg4`) | l9_story 16/16, cp9 (latch / unlatch / X latch unchanged), crash3 (no errors), crashrf (only the injected fault), hearing, wretch_speed, s9_to5, water (same as above), levels 17/17, brief9 25/25, s18_final 10/10. crash3 / crashrf / cp9 / l9_termzoom set the debug-only `HACK9.skip` to keep the old timed transfer they were written for |
| l9_peep | A closed door offers [V] PEEPHOLE; V puts the camcorder 16 cm outside the leaf with a 1.9 rad lens and the fisheye pass; a Watch on the walk registers (lens breathes, heartbeat); the view turns at most 0.75 rad; V again, E or a step lets go; an open door has no peephole; doors inside a house have none, and the front door's works only from inside. Visual check against screenshots of *No, I'm Not a Human* (teal night lens, fisheye porthole, low line count, the visitor lit in the middle): docs/screenshots/r6_L9_peephole.jpg. PASS |
| Level 9 rerun after the peephole (logs `*_reg5`) | l9_story, l9_windows, l9_hack, cp9 (latch unchanged), crashrf (only the injected fault), hearing, s9_to5, levels 17/17, levels_mobile (fits), brief9 25/25 |
| l9_roam | House Wretches start awake (rest); in 60 s with you silent and crouched in its house one rested, prowled, climbed the stairs and opened 4 doors, and never heard you; walking into it wakes it. PASS |
| l9_watch | The Watch whistles on its rounds; on the third download it walks a beat (came from 53 m to within 12 m of that house, 29% of the next 80 s within 16 m), whistles while it does, and Outpost Nine names the street. PASS |
| Level 9 rerun after roaming Wretches and the new Watch (logs `*_reg6`) | l9_roam, l9_peep, l9_hack, l9_story, cp9 (latch unchanged), crash3 (no errors; a woken Wretch now ends in prowl or rest instead of home asleep), crashrf (only the injected fault), hearing (the test puts Wretches to sleep first, same results), wretch_speed (Easy peak 1.83 m/s, unchanged), s9_to5, levels 17/17, s18_final 10/10. Two r6 tests failed once on a random layout and were fixed: l9_watch (a Watch 105 m away could not reach the house in time: it is now brought round a corner 30–45 m away, out of your sight, and 90% of its waypoints stay on the beat; passed twice since), l9_windows (the test stood the player inside furniture under a window and collision pushed them out through the sill; the test now stands a step back; passed twice since) |
| l18_story | Art room built and counted as bright / safe; the Sunshine Room door is still the Dino's class door; lost & found lists objects from the given flags; the letter opens on paper and leads to the crayons; four pinned without crayons → the door waits; fifth drawing and crayons in the art room; colouring the door (2.4 s hold) finishes it; YOU REMEMBERED card assembled from the flags (Hale, one lost explorer, Reyes, room 522, the camera). PASS |

## Earlier suites rerun on the r6 build
Logs in qa_r6/logs (`*_reg` = first pass, `*_reg2` / `*_reg3` = reruns on the final code). No `QA FAIL`, no PAGEERROR, no unhandled rejection in any of them; the single net::ERR_FAILED in each is the blocked font.
| Suite | Result on r6 |
|---|---|
| s18_smoke, s18_more, s18_final | PASS (s18_final 10/10). These scripts now pick up the art-room crayons before pinning, so pinning the fourth drawing still finishes the door as the r4 tests expect |
| levels (17/17), levels_mobile (fits, 5 buttons), brief9 (25/25 with the new FIELD NOTES line on slide 1) | PASS, same as r5 |
| hearing, wretch_speed | Same behaviour as r5 (silence and light never raise suspicion; walk / sprint wake; Easy chase stays below walking speed) |
| s9_to5 | Level 0 → 9 → 5 reaches play in each level (run5.js and s9_to5.js no longer hard-code sandbox paths) |
| cp9, cpl | Checkpoints and retry unchanged in all four levels |
| crash3 | No errors (one Nightmare repetition ended in a death, as in earlier runs) |
| crashrf | Only the intentionally injected, recovered fault |
| water | Level 0 / 5 / 18 counts identical to r5; Level 9 has two more almond waters and one more battery on every difficulty (17 / 12 / 8 placed items): the relief team's supplies in the blue house |

## Visual checks
Screenshots inspected for every new place: Level 0 camp / substation / office, Level 9 street sign / Watch lawn sign / Hale's safe / blue house, Level 5 night audit overlay / the guest's door, Level 18 art room / lost & found / ending card (docs/screenshots/r6_*.jpg). Found and fixed during this pass: `PropBatch.finish()` was disposing story meshes parented to batch roots (logbook pages, breaker handles, camp map and whiteboard, street-sign blades), fixed with `twin()`; a clipped lawn-sign texture; rooms that read as empty at 4×4 cells (now 3×3 with clutter); puddles that read as holes; long toasts running off-screen.

## Not tested / next gate
A human playthrough of both routes in each level (is the power puzzle readable? is the guest's request findable without the switchboard? does the safe feel fair?), the r6 HUD and FIELD NOTES on a phone, and voicing the new lines.

---

# QA — r5 · 2026-10-01 (previous release, kept for reference)

## Environment and scope
Same harness as r4.4: headless Chromium + SwiftShader (software WebGL) at 960×540 (390×844 for the phone layout suite), optional Google Fonts blocked (the single net::ERR_FAILED line is intentional), Babylon.js served from qa/babylon.js, debug time scaling and direct state calls. The machine is a 2-core sandbox, so frame rates here (0.7–9 fps) say nothing about real hardware. No real-GPU, phone, audio or human playtest was done for r5.

Recovery note: midway through r5 the sandbox was reset to its r4.4 state. Every r5 change was replayed from the session record, the new shaders were compared against an earlier printout, and **every check below was run after the replay** on the final code.

## Actual checks
| Check | Result and evidence |
|---|---|
| JavaScript syntax / bundle | Pass: tools/check_bundle.py on the 12,838,015-byte HTML (one strict IIFE, 41 modules incl. assetpack.js, assets.js, models.js, skin.js) |
| r4.4 suites rerun (qa_r5/reg_r5.sh → qa_r5/logs/reg) | Run on a build whose code is byte-identical to the final one (only the texture payload differs: 8 unreferenced texture sets were pruned afterwards; checked by diffing the two HTMLs with ASSET_TEX removed). s18_smoke Pass; s18_final Pass; levels 17/17, same PASS lines as r4.4; brief9 25/25; levels_mobile identical (fits, 5 buttons); water identical counts on every level × difficulty; crash3 no errors; crashrf only the intentionally injected, recovered fault; hearing same behaviour (silence and flashlight never raise suspicion, held crouch noise never stirs, walk/sprint approaches wake, the modem pulse does not wake); wretch_speed Easy peak 1.83 / Normal 2.99 m/s (r4.4: 1.83 / 3.0); s9_to5 Level 0 → 9 → 5 reaches play in each level (Level 9: 32 houses, 19 enterable, as before; mesh counts 400 / 958 vs 392 / 937 in r4.3, the merged scanned-prop batches) |
| cp9 / cpl (checkpoints) | All 54 / 59 logged fields identical to r4.4 except values that depend on the random layout (porch position, house id, the Howler's retry distance 68.9 m vs 114.2 m — both far). In cp9 the door prompt read empty once: updateHUD refreshes its text at 10 Hz and the single 0.03 s call fell between refreshes. qa_r5/prompt9.js on the final build reads "[E] OPEN DOOR   [RIGHT-CLICK] LATCH" (qa_r5/logs/reg/prompt9.log); latch / unlatch / X latch were identical |
| s18_more | Same results as r4.4 (dino path, door, rug, memories, slides, beam). Its last step looked for the #btnL18 continue button that r4.1 replaced with SELECT LEVEL and failed the same way on the r4.4 HTML (qa_r5/logs/reg44/s18_more.log): a stale test, not a regression. The step now checks SELECT LEVEL → Level 18 and the suite passes on the final build (qa_r5/logs/reg/s18_more.log; the first run is kept as s18_more_stale_step.log). Two expected differences: the dino's end position moved ~1 mm (movement substeps) and one drawing's "bright" cell flag differs because Level 18's light panels get random states each run |
| Fallback modes keep the layout (qa_r5/modes.sh) | Each level started on a fresh page in four modes (default, ?noskin, ?nomodels, ?noassets) with the same seed (Level 0 is built at page load; Levels 9 / 5 / 18 are reseeded just before they start), then the level structure and every collision box compared (qa_r5/logs/modes). Level 0: identical in all modes (1,748 wall pieces, 1,732 collision boxes). Level 9: zone map and 2,327 wall pieces identical in all modes; ?noskin identical collision (3,730 boxes); ?nomodels / ?noassets 3,719 identical boxes plus 11 that only exist with models (the scanned garden gnomes' footprints). Level 5: identical structure; ?noskin identical (801 boxes); ?nomodels / ?noassets 779 identical, 22 crates with the procedural 0.75 m square instead of the scanned crate's rotated footprint (same centres). Level 18: everything identical in all modes (353 boxes). Default loads 9 / 39 / 24 / 24 scan texture maps (L0 / L9 / L5 / L18), ?noassets none, ?noskin no rigs, ?nomodels no model placements; no errors in any mode |
| Scanned props in place (qa_r5/propshots.sh, final build) | Every model kind photographed from 2 m with line of sight (qa_r5/logs/visual/props_*.log, docs/screenshots/r5_props_L0/L9/L5/L18.jpg). Placements with SEED 12345: Level 0 343 (cardboard boxes 248, wet-floor signs 48, CRTs 47); Level 9 350 (nightstands 111, boxes 116, trash cans 33, sofas 25, CRTs 18, shelving 16, gnomes 11, hydrants 8, armchairs 7, carved chairs 5); Level 5 142 (drums 44, nightstands 38, crates 28, armchairs 18, boxes 9, carved chairs 3, suitcase 1, lounge sofa 1); Level 18 49 (school chairs 26, rubber ducks 22, school desk 1) |
| Characters (qa_r5/chrshots.sh) | Watch, Wretch, lab Subject, Dr. Hale, Forgotten, M.E.G. explorer, Howler and the explorer death clip staged in a Level 0 corridor (docs/screenshots/r5_characters.jpg); 8 skinned rigs in Level 0, 7 in Level 9, 2 in Level 5, 2 in Level 18 at level start |
| Before / after (qa_r5/shots.sh) | Four views per level, r4.4 and r5 with the same seed (docs/screenshots/r5_before_after_L0/L9/L5/L18.jpg). The thin white dashes in some r5 frames are the camcorder's VHS dropout effect frozen by the test's time stop (the VHS shader is unchanged from r4.4) |
| Load | Title ready 2.0–2.8 s after page load headless from a local file (r4.4: 1.8–2.1 s) with the 12.84 MB HTML; textures decode lazily when a level starts |

## Not tested / next gate
Real-GPU frame rate and load time (desktop and phone), texture shimmer at distance, character animation feel (gait speed vs ground speed, crossfades), prop scale and placement as seen by a player, and a full human playthrough. Compare with ?noassets if something looks wrong.

---

# QA — r4.4 · 2026-10-01 (previous release, kept for reference)

## Environment and scope
Headless Chromium + SwiftShader, 960×540; phone visual captures at 390×844 (r4.3 briefing also 1280×720 and 844×390). The desktop runner blocks optional Google Fonts (the single net::ERR_FAILED is intentional), routes Babylon.js to the bundled offline engine, and uses debug time scaling/manual simulation. No real-GPU or human difficulty/touch/audio test.

## Actual checks
| Check | Result and evidence |
|---|---|
| JavaScript syntax | Pass via Node --check on extracted bundle |
| Preserved r3 baseline | 4,099,556 bytes; SHA-256 2eb90850dc5ca78750608719167078b1bf4d579f4bf5d6b894329a4eae833b1e |
| L18 load → wake/intro → play | Pass; 180 meshes, 4 drawings, 4 slides (smoke.log) |
| L0 → L9 → L5 → L18 transitions | Pass (final.log); tape collection and hotel key/valve completion are debug-assisted |
| L5 → L18 carried resources | Pass; time 123, water 4 retained in from state (more.log) |
| Dino path and door | Pass; natural state update opens class door, reaches rug and sits; memories phase starts, enemy spawns (more.log) |
| Four drawings → board → HOME → YOU REMEMBERED | Pass (smoke.log/recheck.log); final presentation recaptures complete board/door/ending |
| All slides finish and land in valid cells | Pass; RED (124.6,101.4), YELLOW (96.4,78.5), BLUE (19.4,104.6), GREEN (23.4,73.8); pit speed 0.55 (more.log) |
| Flashlight counter | Pass; 1.2 s held beam dissolves Forgotten before contact, HP 100 (recheck.log) |
| Forgotten contact | Pass; normal hit 34 HP, fade (recheck.log) |
| Safe class navigation | Pass; bright cell 1, enemy does not move toward player there (recheck.log) |
| Bedside picture reachable with solid bed | Pass; actual findInteract focus TAKE THE DRAWING and interact() collection (recheck.log) |
| Closet event after drawing | Pass when advancing game simulation by 3.33 s (recheck.log) |
| Death → Retry Level 18 | Pass; found resets to 0, phase arrive (more.log) |
| Return to title / Continue Level 18 | r4 harness passed via goLevel18; the actual r4 Continue Level 5/18 buttons were miswired, fixed in r4.1 |
| r4.4 Level 9 checkpoints + controls | Pass on the final build (qa44/logs/cp9.log; all qa44 suites were rerun after the last code/CSS change): SELECT LEVEL lists 0 / 9 / 5 / 18; leave-page prompt off at title, on in play; Ctrl held does not crouch; aiming at a door, right-click latches and unlatches (prompt "[E] OPEN DOOR   [RIGHT-CLICK] LATCH"), X still latches, right-click away from doors holds zoom. Normal: checkpoints LEVEL START → M.E.G. MAP → M.E.G. DATA 2/3 saved on the porch outside the house; killed by a chasing Wretch while downloading the 3rd terminal → RETRY FROM CHECKPOINT · M.E.G. DATA 2/3 focused, RESTART LEVEL 9 secondary; retry → at porch, HP 80, data 2/3, terminals [done, done, not done], 3rd download cancelled, Wretch dormant at home with 0 suspicion, fade 0.5 → 0, 0 recovered errors. Nightmare: no checkpoint saved, only ▶ RETRY LEVEL 9 |
| r4.4 Level 0 / 5 / 18 checkpoints | Pass (qa44/logs/cpl.log): L0 Easy TAPE 2/4 → death → retry keeps 2 tapes and 2 code digits, howler moved far away (114 m, wander), button "◀◀ START OVER"; L5 Normal KEY 3/3 → STAFF DOOR → BOILER ROOM → VALVE 1/3 → retry keeps 3 keys / 1 valve, phase valves, moths roosting; L18 Easy DRAWING 1/4 → SUNSHINE ROOM/PINNED 1/4 → DRAWING 2/4 → retry keeps 2 found / 1 pinned / 1 carried, Forgotten sent away; 0 recovered errors. Progression was debug-assisted (direct calls), death forced via HP |
| r4.4 almond water | Pass (qa44/logs/water.log): placed water Easy / Normal / Nightmare = L0 14 / 9 / 5, L9 15 / 10 / 6, L5 12 / 8 / 5, L18 10 / 7 / 3; fresh-start water L0/L9 3 / 1 / 0, L5/L18 3 / 1 / 1 |
| r4.4 "crash at 3rd computer" | Not reproduced. qa44/crash3.js (simStep + HUD: Level 9 Easy / Normal / Nightmare × 2 repeats, each data house in turn with its terminal downloading, crouched, house Wretch chasing) and qa44/crashrf.js (real render loop at 320×180: real C key crouch, chasing Wretch, WASD for ~20 s wall-clock ≈ 4–7 s game time at 4–8 fps) raised no exceptions. Fault injection: a forced error inside the terminal screen drawing is caught as "[recovered world]" and the loop keeps running; no errors after restoring it (qa44/logs/crashrf.log). Most likely real-world cause addressed: Ctrl-crouch + W = Ctrl+W (close tab) |
| r4.4 visuals | Inspected at 960×540, 390×844 and 844×390: level list, controls panel, briefing slide 3 latch inset, ◆ CHECKPOINT HUD note in L9 / L18, death screen with RETRY FROM CHECKPOINT (docs/screenshots/r4_4_*.jpg). Found and fixed during this check: the ↻ glyph on the restart button rendered as a box (now ◀◀), the 844×390 death screen pushed MAIN MENU below the fold (compact row layout), and long toasts ran off both edges at 390×844 (now wrap). The pre-existing crowded top HUD at 390 px width (REC / compass / battery overlap, same in r4.3) is unchanged |
| r4.4 regression | Pass, rerun on the final r4.4 HTML (qa44/logs/*_r4.4.log): qa9/hearing.js same behaviour as r4.3 (silence, flashlight and crouch never wake; walk/sprint approaches wake; silent player is lost; modem pulse stirs 0.66–0.71 without waking). In one Nightmare world a still-player sample reached 0.2 suspicion (below the 0.3 stir line, stayed asleep); qa44/stillprobe.js shows the cause is the test teleporting the player 0.25 m from the Wretch, overlapping a collider: the push-out reads as one walking step (spd 3.6 m/s, noise 0.42). It is a placement artifact, not idle noise; ai9.js and the player noise model are unchanged from r4.3 (qa44/logs/stillprobe.log). qa9/wretch_speed.js Easy avg 1.58 / peak 1.83, Normal peak 3.0 m/s (same as r4.3; an earlier pre-final sample's Easy Wretch lost the still player at once, kept as wretch_speed_r4.4_early.log); qa5/s9_to5.js Level 0 → 9 → 5 OK; qa9/brief9.js 25/25 at 960×540 and 390×844; qa18/s_levels.js (now four options + Level 9 fresh start) 17/17; qa18/s_levels_mobile.js fits at 390×844 with five buttons |
| r4.3 hearing-only Wretches | Pass on all difficulties (qa9/logs/hearing_r4.3.log): standing still 0.2–3.5 m away with the flashlight on for 12 s never raises suspicion; held crouch noise (0.04) never stirs; a bot crouch-walking into the room to ~0.8 m never wakes it; walk/sprint approaches wake it (Normal walk at 0.66 m, Nightmare walk at 1.86 m, Nightmare sprint at 3.59 m); held full noise wakes it from 5.3–6.8 m in 1.2–4 s; a silent player is lost after a chase; terminal modem pulse stirs (0.66–0.71) but does not wake. A loud player stays hunted on Easy/Normal; one Nightmare run ended "lost" and was not reproduced in a 3-repeat Nightmare/Normal probe that stayed in chase and hit the player every 2 s (qa9/loud_chase_probe.js, logs/loud_chase_probe.log) |
| r4.3 regression | Pass with the new HTML: qa9/wretch_speed.js Easy peak 1.83 / Normal 3.03 m/s unchanged (logs/wretch_speed_r4.3.log); qa18/s_levels.js 14/14 (logs/levels_r4.3.log); qa5/s9_to5.js Level 0 → 9 → 5 reaches play in each level, with the briefing pre-skipped by the runner (logs/s9_to5_r4.3.log). A first parallel run timed out in the Level 0 intro under CPU contention; the solo rerun passed |
| r4.3 noise meter + Level 9 briefing | 25/25 Pass at 960×540, 1280×720, 390×844 and 844×390 (qa9/logs/brief9_*.log): first arrival waits on the 4-slide briefing with images, Next/Back, ENTER LEVEL 9 → intro → play, br_brief9 saved, second arrival skips it, pause FIELD BRIEFING → back to pause, Esc skips, Level 0 HOW TO PLAY unchanged, meter only in Level 9; screenshots inspected (docs/screenshots/r4_3_*.jpg) |
| r4.2 Easy house Wretch speed | Pass: Wretch forced into chase at a still player; Easy average 1.61, peak 1.83 m/s (r4.1: 2.19 / 2.62), below 2.35 m/s walk; Normal/Nightmare code unchanged (qa9/logs/wretch_speed_*.log) |
| r4.1 level select: Level 0 / 5 / 18 | Pass: correct level, fresh start, pause → quit → select next, Enter/Esc/BACK, 390×844 and 844×390 layout (logs/levels.log, levels_mobile.log) |
| Texture/object visuals | Inspected hall, class, yellow hall, numbered playland/pit, slides, meadow, bedroom, kitchen, nap room, void, notes, board, door, enemy and ending captures |
| Mobile visual layout | Hint/text and ending stats specifically recaptured after fixes; not a touch gameplay test |
| Music-box audio | Actual OfflineAudioContext buffer exported as preview; construction/export checked, not human listening |
| Build reproducibility and manifest | Exact byte rebuild/hash verification before packaging; see release-validation.log |

## Fixes made during QA
- Long hints overflowed the camcorder frame: scoped wrapping/width/font size to L18.
- Children's letter obscured the objective: split into short sequential subtitles.
- Mobile end-stat values extended off-panel despite no document scroll: smaller font, wrapped values and bounded flex sizing.
- HOME glow washed out its crayon drawing: reduced emissive intensity and nearby light.
- Music-box healing could be repeated while already playing: added guard.
- Shared darkness drain duplicated L18's own sanity model: excluded L18 from the generic darkness branch.

## Test limitations and corrected false negatives
The first beam test began close enough for the enemy to reach the player before its 1.2 s rejection timer; a separate range-controlled test confirms the counter. A first closet assertion waited 4 wall-clock seconds in the slow renderer, insufficient to advance the 2.4 s game timer. It failed; a simulation-time recheck passes. These earlier logs are retained rather than hidden. The initial mobile no-document-overflow assertion missed clipped values inside the panel; screenshot inspection caught and corrected them.

No PAGEERROR or shader failure was observed. Do not interpret debug-driven completion as human balance, full collision walkthrough, real-time performance or actual touch input evidence. A human full four-level playthrough and headphone pass remain the release's next validation gate.

Enemy appearance capture enemy_staged.jpg uses forced debug placement in the bright corridor to inspect the rig; normal navigation forbids bright areas. Void screenshots show its intentionally dark environment. presentation_final.log records the last cosmetic/HUD checks.

Final visual correction connected the enemy neck/shoulders without changing its state machine or collision radius. All runtime presentation checks completed after the correction. Mobile HUD moves compass/objective below readouts; notes and all end-stat values fit.
