# CLAUDE.md

Start here, then read `HANDOFF.md` (status, architecture, tests, next steps) and follow `AGENTS.md` (rules + release/Notion sync policy).

Common commands:
- Build: `cd game && python3 build.py`
- Serve: `python3 -m http.server 8000` → `/game/The_Backrooms_Found_Footage.html?debug` (`&level=5` for the hotel)
- Level 5 smoke test: `node qa5/run5.js $PWD/game/The_Backrooms_Found_Footage.html $PWD/qa5/s5_smoke.js 960 540` (fix the Playwright/Chromium paths at the top of the runner first)

Key facts: single strict IIFE bundle, shared globals, level suffixes 9/5, `LVL` switch in `main.js`, `goLevel5(carryFrom9())` from the Level 9 ending, debug helpers on `window.__BR`.
If you cannot update Notion yourself, end your session with "Notion sync pending" and the files to upload.
