# The Backrooms: Found Footage — Coding-Agent Handoff (r3)

Release: **r3 · 2026-09-30** · Owner: Pierre · Engine: Babylon.js (CDN) · Output: one self-contained HTML file
Canonical Notion hub: "The Backrooms — Game Dashboard & Handoff" (https://app.notion.com/p/be27ee8b9e574b8d8a7c7ccde317e5c5)

This file is self-contained. A coding harness (Claude Code, Codex, etc.) can continue from it with only the archive.
Read `AGENTS.md` (or `CLAUDE.md`) for the working rules, then this file, then `CHANGELOG.md`.

---

## 1. Current status (evidence-based)

| Area | Status in r3 | Evidence |
|---|---|---|
| Level 0 · "Found Footage" (yellow office maze, 4 tapes, exit code) | Playable | Rebuilt from restored source; boot/title/L0 smoke passes (see §8) |
| Level 9 · "Darkened Suburbs" (revised: easier, loud enemies, enterable 2-storey houses) | Playable | Restored after filesystem revert; L9 smoke passes (see §8) |
| Four-slide illustrated briefing | Included | Restored with Level 9 revision |
| Level 5 · "The Hotel" | **New in r3 — playable end-to-end in headless debug checks; not yet human-playtested** | L5 smoke: load → intro → play, objective chain keys→staff door→stairs→3 valves→exit→end screen (see §8) |
| Level 5 voice acting | Missing (radio lines are subtitles only) | No Piper/TTS run for L5 |
| Real-GPU performance / human audio review | Not done | Only SwiftShader headless (≈1 FPS) was available |

Game flow: Title → Level 0 → (exit) Level 9 → (elevator, win) **Level 5** → (emergency exit) end screen.
Title shows "CONTINUE: LEVEL 9" / "CONTINUE: LEVEL 5" once a level has been reached (localStorage `br_l9`, `br_l5`).
URL shortcuts: `?level=9`, `?level=5` jump straight into a level; `?debug` exposes `window.__BR`.

## 2. Quick start

```bash
# prerequisites: Python 3, a WebGL2 browser. Node 18+ only for checks. No npm install needed for the game.
cd game
python3 build.py                     # concatenates src/ into The_Backrooms_Found_Footage.html
python3 -m http.server 8000          # or open the HTML file directly
# open http://localhost:8000/The_Backrooms_Found_Footage.html        (normal)
#      http://localhost:8000/The_Backrooms_Found_Footage.html?debug  (window.__BR helpers)
#      ...?debug&level=5                                             (straight to the hotel)
```

Syntax check of the built bundle:
```bash
python3 - <<'PY'
s=open('The_Backrooms_Found_Footage.html').read(); i=s.find("(()=>{'use strict';"); j=s.find("\n})();",i)
open('/tmp/bundle.js','w').write(s[i:j+6])
PY
node --check /tmp/bundle.js
```

Headless smoke tests (need Playwright + Chromium; `qa/babylon.js` is a local Babylon copy so tests run offline):
```bash
cd qa
node run.js  ../game/The_Backrooms_Found_Footage.html ./s_title.js            # Level 0 boot/title
node ../qa9/... (see qa9/)                                                     # Level 9 scripts
node ../qa5/run5.js ../game/The_Backrooms_Found_Footage.html ../qa5/s5_smoke.js 960 540   # Level 5 (streams logs)
```
The runners hard-code `/vercel/sandbox/node_modules/playwright` and `/usr/local/bin/chromium` — edit the first lines for your machine.
SwiftShader renders at ~1 FPS; set `__BR.DBG.ts = 3` to speed game time in tests (dt is clamped to 0.05 s per frame).

## 3. Repository layout (archive)

```
HANDOFF.md  README.md  CHANGELOG.md  AGENTS.md  CLAUDE.md  MANIFEST.sha256
game/
  The_Backrooms_Found_Footage.html   built release (open this)
  build.py                           build script (module order lives here)
  src/                               28 JS modules + template.html + style.css
  Backrooms_Audio_Preview.mp3        1-minute Level 0 audio preview (historical)
qa/    Level 0 Playwright scripts (run.js runner, s_*.js scenarios, babylon.js offline copy)
qa9/   Level 9 scripts (s9_smoke.js, s_chain.js objective chain, s_l0reg.js, layout_test.js)
qa5/   Level 5 scripts (run5.js streaming runner, s5_smoke.js, s5_diag.js, layout.js) + r3 screenshots
audio_pipeline/  Piper/FFmpeg generation + packing scripts (lines.py, gen_vo.py, dsp.py, gen_sfx.py, pack.py, asr checks)
brief/     briefing illustration sources
tools/     patch helpers
docs/screenshots/  r3 headless screenshots (contact sheets)
```
Not included (too large / third-party): Piper voice models (≈581 MB), Whisper cache (≈141 MB), raw WAV/MP3 outputs (≈31 MB; the encoded clips are already embedded in `src/audiobank.js`).

## 4. Architecture

* **Single-file build.** `build.py` reads `src/template.html` + `src/style.css`, concatenates the JS modules in a fixed order inside one strict IIFE `(()=>{'use strict'; ... })();` and writes `The_Backrooms_Found_Footage.html`. Modules are classic scripts sharing one scope: **order matters**, no imports.
* **Module order (r3):**
  `audiobank, util, shaders, textures, textures9, textures5, level, level9, level5, audio, audio9, audio5, actors, world, world9, story9, world5, story5, player, ai, ai9, ai5, briefimg, brief, ui, main, main9, main5`
  `main5.js` must stay last: it ends with the debug export and the single `boot();` call.
* **Globals (shaders.js):** `CELL 3.6 m`, `CEIL 2.85`, `WT`, `DOORW`, `DOORH`; `LVL` (0, 9 or 5); `setDims(n, lightmapRes)` switches grid size (`N`, `LEVEL`, `LMR`...).
* **Shared state:** `G` (game state machine: title/intro/play/paused/dead/won/loading, time, diff), `PL` (player), `LV` (layout: cells, zones, edges, solids, lights), `W` (world interactables, items), `AI`, `FX` (post/uniforms), `SCN/ENG/CAM`, `AU` (audio), `SUBS`, `S` (settings). Level-specific: `G9/W9/AI9`, `G5/W5/AI5`.
* **Rendering:** custom GLSL in `shaders.js` (one `env` fragment shader with `#ifdef MAT_*` branches; baked lightmap texture `LV.lightTex`, fixture light, dynamic light slots, VHS post pipeline). Level 5 materials: `MAT_HWALL` (damask wallpaper + stare-eyes), `MAT_CARPET`, `MAT_HCEIL`, `MAT_CHECK`, `MAT_DECO`, `MAT_BCEIL`, `MAT_BCONC`, `MAT_BFLOOR`, `MAT_BRICK`, `MAT_PLAQUE`.
* **Geometry:** grid of cells; edges are walls/doors/openings; `collectPieces*` → merged meshes per material chunk; props through `PropBatch` (fast box path) merged per material.
* **Frame dispatch (main.js `frame`/`simStep`):** per state, picks `introCamX / updateAI[X] + playerCamera + gameEventsX / deathCam / wonCamX` and `worldFXX` by `LVL`. `simStep(dt)` is the same without rendering (used by tests).
* **Level switching:** `goLevel9(from)` / `goLevel5(from)` → `teardownScene()` (disposes scene, calls `teardown9()` + `teardown5()`), `setDims`, body class `lvl9`/`lvl5`, build world, carry resources (`carryFromL0()`, `carryFrom9()`), `G.state='intro'`. `restartGame(play)` retries the current level (checkpoint = level start with carried resources) or returns to Level 0 after an ending.
* **UI (ui.js):** compass with objective marker (`target9()/target5()`, ▼UPSTAIRS/▼DOWNSTAIRS labels), red foe blips (`foeHUD9` uses `foes9()` or `foes5()`), HUD slots `tapes`/`code` reused per level (`hudObj*/hudItems*`), subtitles, toasts, touch controls, briefing.
* **Audio:** Web Audio graph (`audio.js`): positional voices `mkVoice`, occlusion, ducking bus, `AU.remap` hook for cross-floor sounds (L9 houses, L5 hotel↔boilers ±9 m). Embedded MP3 bank `audiobank.js` (ABANK, ABANK_G, ABANK_LOOP, VO_TXT). Procedural SFX in `audio*.js`. Level 5 jazz is rendered at load with an `OfflineAudioContext` (16 bars @100 bpm swing, gramophone filter/crackle; ~2 s).

### Debug hooks (`?debug` → `window.__BR`)
General: `G, PL, LV, W, AI, FX, S, K, DBG (DBG.ts time scale), CAM(), SCN(), ENG(), startGame, beginPlay, simStep, restartGame, teardownScene, die, win, showEnd, hurt, say, SFX, AU`.
Level 9: `G9, W9, AI9, LV9(), goLevel9, openGate, startDownload, finishDownload, takeCrowbar, useLocker, installCans, releaseSubject, pullLever, releaseCure, takeKeycard, useElevator, win9, spawnWatch, radio9, target9, ...`
Level 5: `G5, W5, AI5, LV5(), goLevel5, worldFX5, gameEvents5, target5, win5, takeKey5(k), unlockStaff5(W5.svDoor), startValve5(v), finishValve5(v), useExit5, closeElev5, callElev5, readNote5, ringBell5, checkWarp5, stareHit5, radio5, Moth, spawnMoth5, wakeBoiler5, startTp5(down), snapDoor5, foes5, cellCenter, CELL5(), Z5, R5, BEV5, LOOP5, setPhase5`.

## 5. Level specifications

### Level 0 — Found Footage
Yellow office maze (34×34 cells, lightmap 512). Find 4 VHS tapes (each reveals one digit of the exit code), survive Howler/Crawler/Smiler/Mimic, meet the four expedition explorers (voiced), use supplies (batteries, almond water), open the coded exit → Level 9. Hint system: after a while a radio signal indicator, then compass tape marker and directional sound.

### Level 9 — Darkened Suburbs (revised in r2/r3)
56×56 cells (14-cell blocks), M.E.G. compound at BX 18, lab at LAB_X 47. Objective chain: kiosk map → 3 terminal downloads → gate → lab → crowbar → 4 lockers/canisters → install lure → subject into cage → lever → cure → Dr. Hale / keycard → elevator → Level 5.
Revision: easier (Watch timer [90,70,50] s, chase speed [4.5,5.1,5.7], knockback 50; Wretch damage [16,20,26], gives up after [14,11,9] s unseen; more batteries/water), loud footsteps, red pulsing compass blips with ▲▼ floor arrows, wheeze loop at the nearest Wretch, Wretches never spawn in the computer-terminal rooms, 19 enterable two-storey houses (stairs teleport to an off-map upstairs; cross-floor audio remap; objective marker says UPSTAIRS/DOWNSTAIRS), picket fences, furniture.

### Level 5 — The Hotel (new in r3)
Grid 44×44 cells, lightmap 704. Zones `Z5`: VOID, HALL, ROOM, BEV, SERV, BOIL, BHALL, VEST, CLOS, LOBBY, ELEV, STAIR. Regions `R5`: S (lobby/south), W, N, E (loop), E2 (real east wing), BEV, SV (service), BO (boilers).
* **Arrival:** elevator car opens on the lobby (front desk, bell, housekeeping note = hint). Elevator closes behind you; the call button does nothing ("THE CAR IS NOT COMING BACK").
* **Beverly Room:** 7 m ballroom, great chandelier, bandstand with gramophone playing a procedural swing loop (muffled through the whole hotel), 8 round tables, bar, false/bricked doors, STAFF ONLY door (south wall, right of the arch).
* **Wings:** West and North wings with guest rooms (19 rooms, numbered brass plaques, 35 % doors ajar); East wing corridor is an **endless loop** (passing x = 29 cells teleports you back 5 cells; everything repeats every 5 cells; radio hint after 2 loops). A door marked **EAST WING** at the end of the north wing's dark arm is a warp vestibule into the real east wing (E2). A LOBBY/WEST WING vestibule pair is a shortcut.
* **Keys:** 3 housekeeping keys in linen closets (West, North, East/E2) → unlock STAFF ONLY → service stairs (fade teleport) → boiler room.
* **Boiler room:** maze of concrete corridors with pipes, 3 machine halls each with a relief valve (hold E 2.2 s; turning squeals and wakes boiler moths). After 3 valves the EXIT sign turns from red to green → emergency door at the east end → ending.
* **Threats:** Deathmoths (hotel nests + boiler moths [2,3,3]): attracted to your flashlight (on, within 16 m, line of sight); they notice you within 4.2 m (2 m crouched) or by noise; hit = knockback damage [12,16,22] + −12 sanity. Turn the flashlight off to lose them; they circle lit lamps. Wallpaper eyes open when you stare at a wall (sanity −3/s; an ambush below 40 sanity). Slow hotel sanity drain, knocks on false doors, whispers, clock ticks, low-sanity hallucinations.
* **HUD:** objective text per phase, `KEYS n/3` / `VALVES n/3`, compass marker to the next target, red moth blips.
* **Death text:** "THE MOTHS CAME FOR YOUR LIGHT". Retry restarts Level 5 with the resources carried from Level 9.

## 6. Level 5 code map
| File | Contents |
|---|---|
| `textures5.js` | Procedural textures: hotel wallpaper, carpet, ceiling, checker, deco, ballroom ceiling, boiler concrete/floor, brick |
| `level5.js` | `Z5/R5/BEV5/LOOP5`, `genLayout5()` (rooms, wings, loop, vestibules, closets, boiler maze), `collectPieces5()`, `buildGeometry5()`, `planLights5()` |
| `world5.js` | `buildWorld5(progress)` (scene, textures, lightmap, collision, materials, geometry, props, doors, story, items, jazz), `buildProps5` + furnish* (guest rooms, ballroom, lobby, service, vestibules, boilers), plaques atlas |
| `story5.js` | Doors (W9-compatible), keys, valves, emergency exit + EXIT sign, elevator, bell, note, items |
| `ai5.js` | `Moth` agent (roost/wake/hunt/retreat/search/circle/drift/return), spawns, `foes5`, `updateAI5` |
| `audio5.js` | `SFX5` (chitter, burst, screech, squeal, bell, jingle, tick, knock, unlock, click, pipes, eyes), flutter voice, rumble, `prepJazz5`/`mkJazz5` |
| `main5.js` | `G5`, radio text, phases/objectives, story actions, transition `goLevel5`, intro/win cameras, end screen, `gameEvents5` (stairs, loop, warps, eyes, drains, ambience), `worldFX5` (fog per zone, flicker, lights slots, audio), HUD helpers, debug export, `boot()` |

## 7. Asset & audio pipeline
All textures are procedural (canvas/DynamicTexture). Voice lines: `audio_pipeline/lines.py` → `gen_vo.py` (Piper TTS) + `dsp.py` (radio/tape processing) → `gen_sfx.py` → `pack.py` writes `src/audiobank.js` (MP3 base64, mono 16 kHz/24 kbps voice, 32 kHz/48 kbps SFX; ASR intelligibility checks `asr_check.py`). Piper voice models are not in the archive — download the same voices listed in `audio_pipeline/voices.json` to regenerate. Level 5 has no new recorded clips.

## 8. Test record (r3, 2026-09-30, headless Chromium + SwiftShader, 960×540)
See `CHANGELOG.md` and `qa5/smoke_r3.log` for raw output. Summary is filled in by the release script below:

| Check | Result |
|---|---|
| Bundle syntax (`node --check`), duplicate top-level names | Pass (no duplicates) |
| Boot → title (Level 0 scene) | Pass, ~2 s load, only `net::ERR_FAILED` (blocked Google Fonts in the runner) |
| Level 0 start → play; HUD tapes/code/signal | Pass (TAPES 0/4, CODE _ _ _ _, signal visible) |
| Level 9 load → play | Pass: 32 houses, 19 enterable, objective "FIND THE M.E.G. OUTPOST · NORTH-EAST", 954 meshes |
| Level 9 win → Level 5 transition with carry-over | Pass: body `lvl5`, resources carried (hp floor 75, spare 3), `br_l5` stored |
| Level 5 load → elevator intro → play | Pass: ~4.5 s load, 340–349 meshes, 6 moths, 3 keys, 3 valves, 27–29 doors, 19–21 guest rooms |
| Level 5 screenshots: lobby, ballroom ×2, loop corridor, guest room + door, landing, boiler halls, exit, moth | Rendered correctly (see docs/screenshots/r3_*.jpg) |
| Level 5 objective chain (debug calls): 3 keys → staff door → stairs teleport → 3 valves → EXIT sign green → exit → win camera → end screen | Pass: "YOU ESCAPED THE HOTEL", button "PLAY AGAIN (LEVEL 0)" |
| Moth hunt near player | Pass: attack applied (hp 100→84, sanity →81), compass blip listed |
| Death by moth → end screen → Retry | Pass: "THE MOTHS CAME FOR YOUR LIGHT", "RETRY LEVEL 5" rebuilds Level 5 at phase `arrive` |
| Return to title after ending | Pass: LVL 0, body classes cleared, "CONTINUE: LEVEL 5" shown |
| PAGEERROR / unhandled rejections in all runs | None |


Limits: software renderer (~1 FPS), debug-driven objective completion (functions called directly), no human listening, no real-time difficulty check, no mobile device check.

## 9. Known issues / risks
* Level 5 has only been exercised in headless debug runs: moth fairness, sanity pacing, loop/warp readability and boiler maze difficulty need a human playtest on real hardware.
* Level 5 radio lines are subtitles only (no voiced clips).
* Performance: Level 5 has ~340 meshes and a 704² lightmap; real-GPU FPS not measured.
* `net::ERR_FAILED` in headless logs = blocked Google Fonts request (test runner aborts it); harmless.
* Historical: DISTANCE NaN once seen in a debug death screen (not reproduced).

## 10. Next steps (priority order)
1. Human playtest Level 5 on a real GPU (desktop + phone): tune moth speed/notice radius, sanity drains, eye ambush, boiler maze length.
2. Record Level 5 radio VO with the existing Piper pipeline (keys in `L5_TXT`, add to `lines.py`, repack `audiobank.js`, call `playVoice` like `radio9`).
3. Level 5 touch-control pass (valve hold, flashlight toggle prompt).
4. Performance pass if FPS < 50 on mid hardware (merge more props, lower lightmap to 512).
5. Optional: Level 5 → next level hook (currently ends the run with an end screen; "PLAY AGAIN" returns to Level 0).

## 11. Keeping Notion in sync (mandatory after every change)
1. Edit `src/`, run `python3 build.py`, syntax-check, run the relevant smoke test(s); record actual results.
2. Update `HANDOFF.md`, `README.md`, `CHANGELOG.md`, `MANIFEST.sha256`, known issues and next steps. Refresh `AGENTS.md`/`CLAUDE.md` if the workflow or architecture changed.
3. Zip a new versioned archive (`Backrooms_Release_and_Handoff_<date>_r<N>.zip`), keep older ones.
4. Upload the zip, the built HTML and HANDOFF.md to the Notion hub (Files & Release Vault + dashboard "Latest release"), update status, tests, work queue, roadmap and change log; reload the pages to verify the attachments persisted.
5. A local-only harness without Notion access must say **"Notion sync pending"** and list the files to upload — never claim the hub was updated.
