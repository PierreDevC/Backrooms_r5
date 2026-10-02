# The Backrooms: Found Footage — r5

A Babylon.js found-footage survival-horror game, delivered as one HTML file.

## Journey
1. Level 0: recover four tapes, learn the exit code and escape the yellow maze.
2. Level 9: download data, make the cure, help Dr. Hale and take the elevator. Wretches inside houses are blind and hunt by sound: watch the NOISE meter and crouch. A short LEVEL 9 BRIEFING with screenshots plays on first arrival (pause → FIELD BRIEFING to see it again).
3. Level 5: find three keys, unlock the staff door, vent three boiler valves and escape the hotel.
4. **Level 18 — Nostalgic Memories:** follow the Plush Dino through a preschool; recover four childhood drawings, pin them on MY MEMORIES, and leave through the door you drew.

## Play and build
Open `game/The_Backrooms_Found_Footage.html` in a modern WebGL browser. Internet is needed for Babylon.js CDN; fonts are optional. Download the HTML to play if your host blocks pointer lock/WebGL in embeds.

```bash
cd game && python3 build.py
python3 -m http.server 8000 --bind 127.0.0.1
```
Visit `http://localhost:8000/The_Backrooms_Found_Footage.html`. Append `?debug&level=18` to test the new level directly. `?level=9` and `?level=5` are also supported. In the title menu, SELECT LEVEL starts Level 0, Level 9, Level 5 or Level 18 directly.

WASD/arrows move · mouse look · Shift sprint · C crouch (toggle) · F flashlight · N night vision · Z or hold right mouse zoom · E/Enter interact · Q almond water · R battery · Esc/P pause · M mute. Level 9: right-click a door (or X) to latch it, Tab map. Touch controls appear on phones.

On Easy and Normal, dying lets you RETRY FROM CHECKPOINT: you keep everything already done in that level and respawn at the last checkpoint (level start, each tape / download / key / valve / drawing and other milestones). Nightmare restarts the level. Checkpoints last for the current run, not across reloads.

## Status
r5 (2026-10-01) is a visual overhaul: CC0 photo-scanned PBR surfaces in all four levels, one skinned, motion-captured human for the explorers, Howler, Watch, Wretches, Dr. Hale and the Forgotten, and 17 scanned props (boxes, CRTs, sofas, armchairs, shelving, hydrants, crates, school chairs…), plus safer movement collision. The HTML is now 12.8 MB. If something looks wrong or runs slowly, append `?noassets` (original look), `?noskin` or `?nomodels`. Credits: `docs/CREDITS.md`.

r4.4 (2026-10-01) adds Easy/Normal checkpoints in all levels, Level 9 in SELECT LEVEL, right-click door latching, crash safety (no Ctrl-crouch, leave-page confirmation, self-recovering frame loop) and more almond water on easier modes. r4.3 made Level 9 house Wretches hearing-only with a noise meter and a Level 9 briefing. r4 added Level 18 after Level 5. See `docs/QA.md` for actual automated results; no human real-GPU playthrough, touch gameplay test or audio listening has been performed. New Level 18 dialogue is subtitles, not recorded voice acting.

Start a coding harness at `AGENTS.md` or `CLAUDE.md`, then `HANDOFF.md`. Source/assets, tests, history and SHA-256 inventory are included. Earlier r3 is preserved separately.
