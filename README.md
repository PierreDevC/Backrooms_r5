# The Backrooms: Found Footage — r7.2

A Babylon.js found-footage survival-horror game, delivered as one HTML file.

## r7.2 · 2026-10-02
Level 18's MUSIC room now teaches its floor piano: read the classroom lesson, find the birthday card off the dark east walk, step off between colours and step off/back on for repeated notes. Looking down also offers **PLAY [COLOUR] AGAIN** with **E** or touch **USE**. The nearby panel shows the discovered melody and your last seven notes, with wrong-tune and open-toy-box feedback. Clues stay in FIELD NOTES; checkpoint retry clears only the unfinished performance.

Twelve regression suites pass, with focused desktop and emulated-touch portrait/landscape checks. Human playtesting remains pending; see `docs/QA.md`. Release packet: `releases/r7.2/`, generated with `python3 tools/package_release.py --version r7.2`. Earlier releases are preserved.

## r7.1 · 2026-10-02
Level 0 no longer spawns the look-away Crawler. Howlers now have three positional territorial calls (120–180 seconds per wandering entity) and three harsher chase screams, with wall muffling and moving sound sources. Random ambient bangs are removed. Tape-site camcorders have detailed VHS bodies, lens assemblies and properly joined tripods. Smilers and Mimics are unchanged.

Eleven regression suites and all three optional-asset modes pass; see `docs/QA.md`. Human headphone, real-GPU and actual touch checks remain pending. Start the six-clip preview at low volume: `audio_preview/Howler_r7_1.html`. Sources/licences: `docs/CREDITS.md`. Historical release packet: `releases/r7.1/` (generated with `python3 tools/package_release.py --version r7.1`).

## Journey
r6 adds places, a second route through each level's key step, documents, optional leads and an ending assembled from your choices. Press **J** (or pause → FIELD NOTES) for objectives, leads and every document you've found. Story design: `docs/STORY.md`.

1. Level 0: recover four tapes, learn the exit code, power the exit keypad (three breakers in the substation, or Brandt's battery from the M.E.G. camp) and escape the yellow maze. Reyes is hurt in the flooded office; Okafor left three logbook pages.
2. Level 9: download data by playing PACKET STACK on each terminal (A/D move, W turn, S drop), get into the lab, then get an administrator keycard: cure Dr. Hale, or open the wall safe in his house on Maple Street. The blue house and the block captain's house have their own stories. Wretches inside houses are blind and hunt by sound: watch the NOISE meter and crouch. A short LEVEL 9 BRIEFING with screenshots plays on first arrival (pause → FIELD BRIEFING to see it again).
3. Level 5: unlock the staff door with three housekeeping keys or the night manager's master key (the guest who never checked out wants a drink), vent three boiler valves, reset the exit's fire lock on the **State Floor** (through the ballroom's portal door: Cross Hall, East Room, Gold Room, kitchen, security) and escape the hotel. Vestibule inner doors open onto the far side of the hotel. **Mothex** ([G]) kills the small moths; the big females only calm down for almond water.
4. **Level 18 — Nostalgic Memories:** follow the Plush Dino through a preschool; recover four childhood drawings, pin them on MY MEMORIES, colour in the door with crayons from the art room, put your name on it (your cubby, the music room's floor piano, your birthday card in the dark), and leave through the door you drew.

## Play and build
Open `game/The_Backrooms_Found_Footage.html` in a modern WebGL browser. Internet is needed for Babylon.js CDN; fonts are optional. Download the HTML to play if your host blocks pointer lock/WebGL in embeds.

```bash
cd game && python3 build.py
python3 -m http.server 8000 --bind 127.0.0.1
```
Visit `http://localhost:8000/The_Backrooms_Found_Footage.html`. Append `?debug&level=18` to test the new level directly. `?level=9` and `?level=5` are also supported. In the title menu, SELECT LEVEL starts Level 0, Level 9, Level 5 or Level 18 directly.

WASD/arrows move · mouse look · Shift sprint · C crouch (toggle) · F flashlight · N night vision · Z or hold right mouse zoom · E/Enter interact · Q almond water · R battery · Esc/P pause · M mute. Level 5: G sprays Mothex. Level 9: right-click a door (or X) to latch it (the deadbolt turns), Tab map, LOOK OUTSIDE at any window, V to look through a door's peephole. Touch controls appear on phones.

On Easy and Normal, dying lets you RETRY FROM CHECKPOINT: you keep everything already done in that level and respawn at the last checkpoint (level start, each tape / download / key / valve / drawing and other milestones). Nightmare restarts the level. Checkpoints last for the current run, not across reloads.

## Status
r7 (2026-10-02, branch `story-r6`) adds Level 5's State Floor, live portal doors, female deathmoths and Mothex, a longer Level 5 objective chain, new Level 9 car models placed on the road, and a second Level 18 chain with four new rooms. Checked headless (`docs/QA.md`); not yet played by a human.

r6 (2026-10-01, branch `story-r6`) is a story pass: new rooms and houses in every level, branching objectives, documents and FIELD NOTES, rewritten dialogue (text only, no new voice clips) and choices that carry to the last level. Checked headless (`docs/QA.md`); not yet played by a human.

r5 (2026-10-01) is a visual overhaul: CC0 photo-scanned PBR surfaces in all four levels, one skinned, motion-captured human for the explorers, Howler, Watch, Wretches, Dr. Hale and the Forgotten, and 17 scanned props (boxes, CRTs, sofas, armchairs, shelving, hydrants, crates, school chairs…), plus safer movement collision. The HTML is now 12.8 MB. If something looks wrong or runs slowly, append `?noassets` (original look), `?noskin` or `?nomodels`. Credits: `docs/CREDITS.md`.

r4.4 (2026-10-01) adds Easy/Normal checkpoints in all levels, Level 9 in SELECT LEVEL, right-click door latching, crash safety (no Ctrl-crouch, leave-page confirmation, self-recovering frame loop) and more almond water on easier modes. r4.3 made Level 9 house Wretches hearing-only with a noise meter and a Level 9 briefing. r4 added Level 18 after Level 5. See `docs/QA.md` for actual automated results; no human real-GPU playthrough, touch gameplay test or audio listening has been performed. New Level 18 dialogue is subtitles, not recorded voice acting.

Start a coding harness at `AGENTS.md` or `CLAUDE.md`, then `HANDOFF.md`. Source/assets, tests, history and SHA-256 inventory are included. Earlier r3 is preserved separately.
