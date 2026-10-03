# Level 37 · Sublimity (r8, branch `agent/claude`)

Level 18 win now chains to Level 37 (`goLevel37(carryFrom18())`). Files: `level37.js` (grid, rooms, arches, columns, water basins), `world37.js` (materials, props, doors, shaders), `hub37.js` (hub furniture), `wings37.js` (hotel/hospital/water park layout and furniture), `story37.js` + `storywings37.js` (objectives, NPC talk, items, flood, endings), `ai37.js` (Abara, Teague, Staff, Fish), `main37.js` (loop, swimming/diving physics, tower, drift, HUD), `audio37.js`, `textures37.js`.

Level 18's ending card now has a CONTINUE · LEVEL 37 button (restartGame → goLevel37(carryFrom18())). Level 37 also appears in the level picker.

## Premise (from the wiki)
Level 37, "Sublimity" (Poolrooms family): an endless lukewarm pool complex of cream tile and emerald water; the Scape (serenity that makes you drift and forget), almond-water scarcity and a "Fish" creature. The wiki's branches that we drew on: **Level 233 "The Lukewarm Hotel"** (lobby music that pulls you in, room 233), **Level 130 "Wellborn Hospital"** (the hospital Staff you can only see on night vision), **Level 43 "Water World"** (abandoned park, almond-water tanks, the wave pool), and the Poolrooms look from the user's reference renders (small cream-sage tile, dark grout, round columns, arches, light slits, emerald water).

## Spine
Arrive in the Shallows (the camera has been carried here by a flood) → find dry ground at the Cabana → **Abara** (relief team, the only person) asks for her cassette (tape four, lost in the pit beside Pell's camcorder) → key under the kettle → Plant (pump room, three wheel gates: Shallows, Dive Well, Lap pool) → drain the Shallows (26 s) → pit → bring camcorder + cassette back → she tells you the three wings → **each wing keeps one thing** → the lifeguard booth panel has three slots → play the video: the Dive Well floods, the booth locks, the Fish comes, swim up to the roof hatch (win "SURFACED") → or sit down with Abara (win "STILL WATER").

| Wing | Entry | Quest | Reward |
|---|---|---|---|
| Lukewarm Hotel | pit corridor, south | reception drawer → room 204 key → stopwatch → time Teague (swimmer, 4 lengths, hold) → brass key → 233 | ROOM 233 CARD |
| Wellborn Hospital | down the Dive Well (drain it) and along the tunnel | form from the nurses' station, three chores for the Staff (night shot only: linen→ward 3, IV bag→ward 5 via lanyard→pharmacy, chart→nurses), stamp ×3, hand in at Admissions | DISCHARGE WRISTBAND |
| Water World | east end of the Lap pool, long tunnel | start the generator → control room note → the wave machine's sump (three metres down, the Fish) | NEW_VIDEO.AVI |

Run-flag payoffs: `dead0` (names of Level 0 explorers who died, on the hospital roster and in the ending), `lost0`, `hale9`, `camera18`, `pruitt5`, `lusk5`.

## Systems
Per-cell floor heights, per-basin water levels that animate, wading/swimming/diving (look down to dive, crouch to sink, breath meter, surface to breathe), tower with ladder lift and a ten-metre fall, the Scape (stand still in water → drift meter → carried to the Shallows with the clock moved on), wet footsteps, underwater lowpass, light slits with cone shafts, caustics and grout overlay on the water.

## Dialogue ledger (written with the backrooms-dialogue skill; text only, nothing voiced)
Speakers: ABARA, TEAGUE, STAFF (whispered), PA (park/hospital/hotel), M.E.G. OUTPOST 9 (radio), DR. HALE (only if saved in Level 9), notes/logs (plant log, lifeguard log, cabana board, guest book, housekeeping card, room 233 card, whiteboard, chart, roster, park map, control-room note, staff-room notices, Pell's tape seven). All strings are in `story37.js` and `storywings37.js`.

Voice sheets (proposed, not saved to the skill):
| Speaker | Says | Won't say | Under pressure |
|---|---|---|---|
| Abara | short, practical, a little dry; "Camera" | what she is waiting for | gets domestic (kettle, towels) |
| Teague | counts; sport words; her father's stopwatch | that he is not coming | corrects your timing |
| Staff | "Thank you.", "Chart. Then form." | anything about the hour | politer |
| PA | cheerful public-address cadence | the truth | the same, louder |

## New canon (needs approval)
- Abara is alive in Level 37 and has been "relieving" since before Pell.
- Pell was the Camera before the player; his tape seven is in the pit.
- Teague is a swimmer who needs her father's stopwatch; her father's note signs "— D."
- Wellborn Staff roster lists Level 0 dead as night-shift staff ("not gone, on shift").
- The video NEW_VIDEO.AVI starts the Deep (flood) when played in the booth.
- The hatch in the Dive Well roof is the exit; nothing in the level is truly locked.

## Open questions
- Is the ending "STILL WATER" (sit with Abara) wanted as a canonical bad-ish ending, or should it only exist as an easter egg?
- Voice acting: all Level 37 lines are subtitles/radio-style only.
- Fish balance (13 damage per bite every ~2.2 s on Normal) has not had a human difficulty pass.

## Verified
Headless scripted playthroughs `qa37/*` (see QA.md): full objective chain, flood, hatch win, stay ending, fish attack, Teague timing, death/retry. Regression suites pass (levels, l18_name, l18_story, s18_final, l5_state, l0_story, l5_story, s18_smoke/more, cp9, cpl). Night-shot staff silhouettes, gate wheel spin and ghost panes are in. No human playthrough, performance, audio, touch or difficulty review.
