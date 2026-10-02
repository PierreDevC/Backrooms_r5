# AGENTS.md — rules for coding agents (Codex, Claude Code, others)

Project: The Backrooms: Found Footage (Babylon.js, single-file HTML). Full context: `HANDOFF.md`.

## Ground rules
- Edit `game/src/*`; rebuild with `cd game && python3 build.py`. Never hand-edit `The_Backrooms_Found_Footage.html`.
- Modules share one strict-mode scope, concatenated in the order in `build.py`. New top-level names must be unique (`const`/`let` collisions are syntax errors; duplicate `function` names silently override). Keep `main5.js` last (debug export + `boot()`).
- Level code is suffixed: `…9` for Level 9, `…5` for Level 5. Shared hooks live in `main.js` (frame dispatch, `showEnd`, `restartGame`, `teardownScene`, `titleL9`) and `ui.js` (compass target, foe blips, HUD slots). When adding a level, wire every one of those plus `template.html` buttons and `build.py`.
- Level switches must dispose everything: add cleanup to `teardownX()` and call it from `teardownScene()`.
- Keep keyboard and touch controls, subtitles (`say`), and clip keys (`VO_TXT`/`ABANK`) in sync.

## Validate before you hand back
1. `node --check` on the extracted bundle (see HANDOFF §2).
2. The relevant Playwright smoke test (`qa/`, `qa9/`, `qa5/`) — check for `PAGEERROR`, stuck loading (materials not ready), missing screens. Headless is ~1 FPS; use `__BR.DBG.ts`.
3. Record real results; never call something playable that was not run.

## After every change (project policy)
Update HANDOFF.md, README.md, CHANGELOG.md, MANIFEST.sha256, known issues and next steps; bump the release (`r<N>`), zip `Backrooms_Release_and_Handoff_<date>_r<N>.zip`, and sync the Notion hub (attach zip + HTML + HANDOFF, update status/tests/work queue/change log, reload to verify).
If you have no Notion access, finish with **"Notion sync pending"** and the list of files to upload.
