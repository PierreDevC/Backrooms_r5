# CLAUDE.md

Read `AGENTS.md`, then `HANDOFF.md`, `docs/STORY.md`, `docs/LEVEL18.md` and `docs/QA.md`. r6: any player-facing words go through the `backrooms-dialogue` skill (`.claude/skills/`).

- Build: `cd game && python3 build.py` (r5: if you change anything in `game/assets`, run `python3 tools/build_assets.py` in `game/` first; see docs/ASSETS.md)
- Serve: `cd game && python3 -m http.server 8000 --bind 127.0.0.1`
- Test the preschool: `http://localhost:8000/The_Backrooms_Found_Footage.html?debug&level=18`
- Headless: `CHROMIUM=/path/to/chromium node qa18/run18.js "$PWD/game/The_Backrooms_Found_Footage.html" "$PWD/qa18/s18_final.js" 960 540`. Requires Node and Playwright; output goes to qa18 (or BR_QA_OUT).

Single shared IIFE; level suffixes 9/5/18. main18.js is last and calls boot(). Level 9 win calls goLevel5(carryFrom9()); Level 5 win calls goLevel18(carryFrom5()). L18 draws its own ending. On Easy/Normal death offers RETRY FROM CHECKPOINT (checkpoint.js; progress kept, enemies reset); on Nightmare, or via RESTART, death retries the current level.

No human audio, touch gameplay, performance or difficulty review yet. If Notion sync cannot be completed, explicitly report **Notion sync pending** and the files to upload.
