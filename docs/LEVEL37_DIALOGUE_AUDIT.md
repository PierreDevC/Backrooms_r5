# Level 37 dialogue audit (backrooms-dialogue skill)

Scope: story37.js, storywings37.js, main37.js (toasts, DEATH_TXT, W37_WHISPER), ai37.js, sign text in hub37.js / wings37.js. Only strings were changed; no logic, identifiers, interact labels or timings.
Verified: `python3 build.py` succeeds; qa37/s37_story.js runs with no errors and `win` = ["won","surface",...]. One line prints `NO /UNLOCK 233/`; it prints identically on the unedited code (pre-existing QA quirk, label untouched).

## Lines changed
| File | Old | New | Why |
|---|---|---|---|
| story37 (Hale radio) | "If this reaches the pool: walk or swim, but don't float. Whatever you do in warm water, do it on purpose." | "Hale. Nine says you're in water. Don't float. Keep walking, keep counting." | Ledger: Hale could not know about a pool; now sourced from Nine. Cut aphorism closer. |
| story37 (Abara, pell topic) | "Don't tell me it's a pump room, I know what it is." | "I'd go, but somebody has to be here when it boils." | Line answered nothing; now an excuse in her domestic voice. Kettle-key hint kept. |
| story37 (Abara, key) | "Hold it. It's a long three seconds." | "Hold it." | Hold-wheel info was said three times (Abara, biro note, idle bark). Biro note keeps the 3 s. |
| story37 (Abara, plant) | "Don't swim, you'll lose the camcorder and I'll lose the tape." | "Don't dive for it. It's one tape." | Player has no camcorder yet; drained pool means nothing to swim. |
| story37 (Abara, told) | "You'll know it because somebody won't let you take it." | "Nobody gives it up for free." | Old line was false for the hotel card and the park tape. |
| story37 (Abara, panel) | "...I count them every morning. I'm not saying anything by it." | "...I count them every morning." | "I'm not saying anything" was used three times; kept only on the cot line. |
| story37 (Abara, idle) | "Hold the wheel longer than you think..." / "I haven't tried. I'm only saying the slots are there." | "The pumps complain. Let them." / "Blue towels are the clean ones. I did say." | Removed repeat quest info and the tic. |
| story37 (Abara, hospital) | "Anybody I know? Kowalczyk and Lund. On a roster... Lund would have gone after him." / dead name "...someone who'd want the shifts changed" / "Nine would want that. I'm not calling Nine." | "Was there a roster? Kowalczyk and Lund would be on it." / "Don't tell me which ward." / (if Level 0 dead) "Anyone of yours on there? Don't answer that either." | Ledger: she cannot know roster contents or the dead explorers' names unless told. Repeat of "Lund went after him" cut. Unclear Nine line cut. |
| story37 (Abara, tanks) | "...It was very good. That was the problem with it." | "I did once. Very good. I don't remember the afternoon." | Aphorism closer replaced with a concrete cost. |
| story37 (guard log) | "...Nothing here is locked. That's the thing about it." / "If the level moves" | "...Nothing here is locked." / "If the water moves" | Cut closer; a lifeguard says water, not level. |
| story37 (surface ending) | "On a shift you will never see, someone called X is changing a bulb he was told to change." | "On a night shift, somewhere, X is changing a bulb." | Camcorder register; no second-person narrator, no assumed gender. |
| storywings37 (guest book, roster) | "PELL, A." | "PELL, P." | Matched camcorder label and tape title (P. PELL). |
| storywings37 (233 whisper) | "...one more night..." | "...ask at reception..." | Echoed the crayon note word for word. Now echoes the card's other line. |
| storywings37 (233 toast) | "IT WEIGHS MORE THAN A CARD" | "THE ROOM 233 CARD" | Figurative filler. |
| storywings37 (Teague idle) | "Go on. Tell someone it was warm." / "I'm not going up. I'm going to do another forty." | "Go on. I've got forty more." / "I'm not going anywhere. Another forty." | Swap test: she was repeating Abara's farewell. She also had no reason to know about "going up". |
| storywings37 (task) | "SHE CAN'T START WITHOUT HER FATHER'S STOPWATCH" | "...WITHOUT THE STOPWATCH" | Ledger: the HUD named her father before Teague or the note did. |
| storywings37 (roster toast) | "THEY ARE NOT GONE · THEY ARE ON SHIFT" | "EVERY NAME IS MARKED ON STAFF" | The old toast explained the roster's meaning. |
| storywings37 (Staff, lanyard) | "Bring it back." | "For the pharmacy." | Hint accuracy: nothing needs returning. |
| storywings37 (Staff, discharge) | "...The water level is a formality." | "Leave the way you came. Mind the wet floor." | Smug aphorism; kept the leave-the-way-you-came hint. |
| storywings37 (video toast) | "DO NOT PLAY IT IN FRONT OF THE POOL" | "FROM THE SUMP" | HUD was giving an in-world warning; the lifeguard log already carries it. |
| main37 (whisper) | "...nobody is timing this..." | "...your tea's gone cold..." | Echoed the whiteboard's "nobody is rushing you"; the new line is domestic, as the skill asks of whispers. |
| main37 (DEATH_TXT.fish) | "a lens full of teeth and then nothing at all." | "water and something fast. Then the lens goes dark." | Teeth is unspecified canon for the Fish; "nothing at all" is filler. |

## Judged fine
Abara's arrival lines, kettle, locker, vending, "That's four. That's definitely four.", "Camera. Swim up. Not across."; Pell's tape (kept the ambiguous "the fourth" on purpose: a tape that ends before the point); board, plant log, housekeeping card, splits card, whiteboard, chart, park map, control note, staff-room notices; Teague's counting lines; Staff one-liners and the hospital/park/hotel PA; all Nine radio lines; death text for drown and drift; end card for STILL WATER; arrival toasts; hub and wing signs (KEEP WALKING / YOUR FEET ARE FINE, NO LIFEGUARD ON DUTY, THE FUN IS ALWAYS OPEN, etc.). Swap test: Abara (dry, domestic), Teague (counts, sport), Staff (polite, procedural), PA (cheerful), Nine ("Nine." prefix, carrier, practical) and Hale (clinical) are distinct.

## New canon (needs approval)
Already in LEVEL37.md: Abara alive and relieving, Pell as previous Camera, Teague and "— D.", roster of the Level 0 dead, the video starting the Deep, the hatch.
Not yet listed:
- Abara's team: Kowalczyk and Lund, who went into the blue house (Level 9) where "the stairs weren't there"; both on the hospital roster as porters.
- The cassette is initialled S.A. (so Abara's first name starts with S).
- Pell's initial is P. (previously mixed A./P.).
- A child's crayon note on the 233 card; Okonkwo party of three in the guest book; the "incident" at the wave pool.
- Nine can hear the cabana (reacts to "don't drip on the cot") and says the hospital is "a camera feed we don't have".

## Open questions
- Pell's tape 7 says he left the camera "for the next person" but also that he "sat down on the fourth". Intended as the STILL WATER hint?
- Abara says the player is "the third I've seen come through that door". Who was the first?
- The STAY ending calls the kettle water "the filter's". Fine as the Scape rule, or too explanatory?
- Wing hints say Staff "only show up in night shot [N]"; the toast, task and sub-line all say it. Probably one too many, but the QA labels depend on the task text, so untouched.
- Pre-existing: `NO /UNLOCK 233/` in s37_story.js (not caused by text).
