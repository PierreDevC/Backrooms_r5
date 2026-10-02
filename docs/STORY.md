# Story — r6 + r7 (story-r6 branch)

Written with the `backrooms-dialogue` skill (`.claude/skills/backrooms-dialogue/`, imported from the Notion page "Backrooms Game — Dialogue & Story Writing"). Every line below is **text only** (subtitle + the existing radio/whisper sound). No new voice clips were recorded; see "Voicing" at the end.

## The spine
You are the camera on a M.E.G. survey team: Marsh (lead), Okafor (radio), Reyes (medic), Brandt (engineer). The floor gave out and the team noclipped into Level 0. Okafor had been chasing a beacon under the hum: Outpost Nine, dark since its relief team went in. The run follows that signal down: the outpost in Level 9, where Dr. Hale tried his cure on himself; the hotel the outpost's elevator opens on; and finally a preschool built out of your own childhood.

Nothing is explained. Each level is found footage: tapes, notes, radio, a voice behind a door. Choices are remembered from level to level (`RUN.f` in `src/story.js`) and the last card in Level 18 is assembled from them.

## Shared systems (src/story.js)
- **Tasks:** each level keeps a list of objectives and optional *leads* (`task`, `taskDone`, `taskFail`). The HUD line stays short; **FIELD NOTES** (J, or pause → FIELD NOTES) lists objectives, leads and every document found, which can be re-read there.
- **Documents:** `readDoc()` shows paper (note / log / board / screen) over the tape without pausing. E closes it; walking away closes it.
- **Hold actions:** `holdStart()` for breakers, the safe, connecting the battery, colouring the door: the prompt shows progress; walking off cancels.
- **Run flags** (`flag(k, v)`): reset when a run starts at Level 0. A level started from SELECT LEVEL sees no flags and falls back to neutral lines.

| Flag | Set in | Values | Read in |
|---|---|---|---|
| nine0 | L0 camp radio | true | L9 arrival, L18 radio |
| log0 | L0 Okafor's logbook complete | true | L18 lost & found |
| reyes0 | L0 Reyes | helped / lost / asked / unmet | L18 lost & found, ending |
| power0 | L0 exit power | breakers / battery | L18 lost & found |
| lost0 | L0 exit | explorers lost | L9 radio, L18 ending, lost & found |
| hale9 | L9 elevator | saved / left | L5 radio and arrival, L18 radio, lost & found, ending |
| journal9, rota9, abara9 | L9 | count / true | L18 lost & found |
| pruitt5, pruittN, staff5, register5 | L5 | key / opened / asked…, room number, master / keys | L18 lost & found, ending |
| camera18, crayons18 | L18 | true | ending |

## Level 0 — The Lobby
**Structure.** Three rooms are carved into the procedural maze (open halls preferred, 3×3 or 4×3 cells, walled with real doorways, connectivity repaired so every cell still reaches the spawn): **M.E.G. BASE CAMP**, **SUBSTATION 4B** (dark), **FLOODED OFFICE** (cubicles, wet footsteps). Orange M.E.G. chevrons lead from the spawn to the camp, yellow ones from the camp to the substation.

- Required, any order: **four tapes** (code digits, as before) and **power for the exit keypad**: throw the **three breakers** in the substation (each a loud 1.3 s hold that sends the Howlers to investigate) **or** carry **Brandt's battery** from camp (slower, no sprinting) and connect it at the door (1.6 s hold). Then enter the code.
- Leads: **Okafor's logbook** (one page in each room; all three = a spare battery and the truth about the beacon), **Reyes** (hurt in the flooded office; give her almond water and she gives you her med kit and a warning about the Mimic, then walks again), **the camp radio** (first call reaches Outpost Nine; every call locks the tape signal; 60 s warm-up), the camp **whiteboard** and **hand-drawn map**, a supply crate.
- Story-aware conversations: Okafor after you read page 3, Brandt when you carry his battery, Marsh's head count, explorers reacting on the radio when another one dies. The Mimic borrows Reyes's "Camera" once you've helped her.
- Checkpoints: BATTERY, POWER ON (plus the existing ones).

| Key | Speaker | Channel | Line | Trigger and notes |
|---|---|---|---|---|
| power | T. BRANDT | radio | Brandt. Door by the red light has a dead keypad. Breakers are {dir} of where we landed. Or carry my battery from camp. | 30–40 s in; {dir} = compass word spawn → substation |
| radio1 | ??? | radio | Outpost Nine, Outpost Nine. Who is on this band? | first camp-radio call |
| radio2 | OUTPOST 9 | radio | Say again, you broke up. Marsh's team? | |
| radio3 | OUTPOST 9 | radio | Okay. Leave your recorder running. We can hear where it points. | locks the tape signal |
| radioN | OUTPOST 9 | radio | Nine. Still here. Pinging your rigs. / Nine. Copy. Hold still a second. / Nine. That hum is louder on your end. | later calls, random |
| radioEnd | OUTPOST 9 | radio | Nine. You have the numbers. Get to the door. We'll talk on the other side. | call after 4 tapes |
| brk1 | K. MARSH | radio | Marsh. Who is on the breakers? Everything down here heard that. | first breaker (Okafor if Marsh is dead: "Okafor. Somebody is on the breakers. Quietly, please.") |
| pow_b | T. BRANDT | radio | Brandt. Panel's humming again. Don't touch anything else in there. | power via breakers |
| pow_c | T. BRANDT | radio | Brandt. Hear that beep? That's my battery earning its keep. | power via battery |
| carry | T. BRANDT | radio / live | Brandt. Is that my battery moving? Keep it level. The acid eats boots. | battery taken (or "That's my battery. Good. Keep it off the wet carpet." when you talk to him) |
| reyes1 | L. REYES | live | Hey. Camera. Watch your step, the carpet is a lake. | first talk |
| reyes2 | L. REYES | live | Ankle's done. My water went in the flood. Do you have any? | |
| reyes3 | L. REYES | live | Still no water? Fine. I'll drink the carpet. / Go do your job. I'm not going anywhere. | talk without water |
| reyes4 | L. REYES | live | Oh. Thank you. Okay. | give water |
| reyes5 | L. REYES | live | Take the kit. I can't carry it on one leg anyway. | +50 HP, +15 sanity |
| reyes6 | L. REYES | live | One more thing. If I call you from somewhere I can't be, it isn't me. | Mimic tell |
| reyesR1–3 | L. REYES | radio | Reyes. I'm in the office with the cubicles, {dir} of where we landed. Ankle's gone. / Reyes. Still here. Still wet. / Reyes. If anyone is passing the office, I would take a water. Or a joke. | every 95–130 s while hurt and unhelped, max 3 |
| marshR | K. MARSH | radio | Marsh. Reyes is walking. Badly, but walking. | 25 s after helping |
| okafor | D. OKAFOR | live | You read my log. Fine. / I did try the door. It didn't open for me either. Don't tell Marsh. | talk after log page 3 |
| marsh | K. MARSH | live | Copy. That's {n} of us I can count. Stay on the door when we find it. | first talk, after the usual greeting |
| dead0–3 | various | radio | Brandt. Marsh? Marsh, copy. / Reyes. Okafor stopped transmitting. Okay. Okay. / Marsh. Reyes is off the band. Keep moving. / Okafor. Brandt is down. His battery's still at camp, if anyone needs it. | 5 s after a death, if that speaker lives; else "Copy. Keep moving." |
| mimicR | ??? | Mimic | Hey. Camera. Over here. / Camera. My ankle is fine now. Come look. | 40% of Mimic calls after Reyes is helped |

Documents: CAMP WHITEBOARD (roll call MARSH OKAFOR REYES BRANDT CAMERA · WATER 9 · 7 · 4 · BATTERY IS FOR THE DOOR. NOT THE KETTLE. T.B. · BREAKERS: FOLLOW THE YELLOW · NOBODY SLEEPS ALONE · WHO MOVED MY COT), MAP ON THE CAMP TABLE, OKAFOR · LOG · PAGES 1–3 (see `LOG0` in `src/places0.js`).

## Level 9 — Darkened Suburbs
**Structure.** Streets have names (OAK DRIVE, MAPLE STREET, ASH COURT, PINE ROAD × BIRCH LANE, CEDAR AVENUE, ELM STREET, LINDEN WAY; signs at every block corner, names on the map) and story houses have numbers. Three enterable houses carry the story:
- **The Hale house** on Maple Street (number plate "· HALE"): Hale's kitchen notes, photographs, a **wall safe** in the deepest room.
- **The blue house** (M.E.G. tape across the door, "M.E.G. 4/4 X"): the relief team, **Abara's tape recorder**, a torn page of Hale's notes, supplies and a **fifth canister locker** (any four of five canisters now do).
- **The block captain's house** (NEIGHBORHOOD WATCH lawn sign, lit): the **patrol rota** (reading it puts the time to the next patrol on the HUD) and the meeting minutes.

Required: the map → three terminals (any order) → the gate → the lab → **an administrator keycard**, two ways:
- **Cure Dr. Hale** (as before: crowbar, four canisters, lure, cage, mist). He rides the elevator with you.
- **Open his safe.** The combination is his house number: written in his lab notes (on the workbench by the crowbar), or worked out from his kitchen note ("the house number, like an idiot") plus the nameplate by his door. The spare card takes you up and leaves him in the cell. Checkpoint SPARE KEYCARD.

| Key | Speaker | Channel | Line | Trigger and notes |
|---|---|---|---|---|
| arrive1 | M.E.G. OUTPOST 9 | radio | Nine. Is that you? The camera? You came through the wrong door. | arrival if you called Nine in Level 0; else "Outpost Nine. Somebody just came through our fence. Copy?" (replaces the voiced `arrive`) |
| arrive2 | M.E.G. OUTPOST 9 | radio | Three flashlights went up {Elm} ten minutes ago. Not ours. Stay off the asphalt. | {Elm} = the third north–south street's short name |
| arrive3 | M.E.G. OUTPOST 9 | radio | Outpost is north-east, inside the chain-link. The map is on the gate. | |
| marshBand | M.E.G. OUTPOST 9 | radio | Marsh's band went quiet for {one of them / n of them}. Keep that recorder running. / Marsh's people are still on the lobby band. All four. Loud as ever. | 40 s, only after a Level 0 run |
| relief | M.E.G. OUTPOST 9 | radio | Nine. Our relief team went quiet in the blue house on {street}. Tape on the door. Don't stay long. | ~9 s after the map, when the channel is clear |
| abara1 | S. ABARA · TAPE | tape | Day four. The blue house. Kowalczyk is gone. Lund won't come down off the stairs. | play the recorder |
| abara2 | S. ABARA · TAPE | tape | Hale isn't Hale anymore. He knows the doors. He knocks first, like he is being polite. | |
| abara3 | S. ABARA · TAPE | tape | If Nine sends anybody else, don't open the cell. Please. I mean it. | |
| abaraR | M.E.G. OUTPOST 9 | radio | Nine. That was Abara. I hoped nobody would play that. | 20 s after first play |
| beat | M.E.G. OUTPOST 9 | radio | Nine. The Watch just turned onto {street}. Be quick in there. | the Watch is sent to walk round the third terminal's house |
| maple | M.E.G. OUTPOST 9 | radio | Nine. Hale lived at {number} Maple Street. If you go up there, leave his things alone. | ~9 s after reaching the lab |
| safe1 | M.E.G. OUTPOST 9 | radio | Nine. You opened his safe. That card works the elevator. | spare card taken |
| safe2 | M.E.G. OUTPOST 9 | radio | He's still down in that cell. Your call. | |
| leave | M.E.G. OUTPOST 9 | radio | You're leaving him down there. Copy. Go. | elevator with the spare card, Hale uncured |
| haleRead | DR. HALE | live | You read my notes. Then you know I did this to myself. | after his voiced lines, if any note was read |

Documents: M. HALE · NOTES (kitchen, lab bench, torn page), PHOTOGRAPHS ON THE SIDEBOARD, NAMEPLATE, PATROL ROTA, WATCH MEETING · MINUTES (see `src/places9.js`).

## Level 5 — The Hotel
**Structure.** New **night manager's office** off the lobby (behind the elevator: SWITCHBOARD, NIGHT AUDIT, desk, wardrobe), the **guest register** on the front desk, **the rye** (gold label) on the Beverly bar, and one guest room off the north or west wing that stays locked: a **guest who never checked out** (the register calls him PRUITT, E.; he never says his name).

Required: the **staff door**, two ways:
- **Three housekeeping keys** (as before).
- **The night manager's master key.** Knock on the guest's door (or ring his room from the switchboard: every line is dead but his). He wants rye. Leave the bottle at his door, step back, and the key comes out under the door. Checkpoint MASTER KEY.

Then the boilers and three valves (any order) and the emergency exit, as before. Optional: open his room after he tells you not to. It is empty; it costs sanity.

Radio: rewritten Outpost Nine lines (text only, as before). If Hale was cured in Level 9 he speaks from the elevator as the doors open ("This is as far as the car takes me…"), rides it away, and takes three of the radio lines himself; if he was left, Outpost Nine says once that nobody is talking about Hale. The hotel has its own whispers (Room service. / Your key, sir. / The band is on its break. / Checkout was at noon. / Are you a guest of the hotel? / Shoes outside the door, please.), mixed with the old voiced ones.

| Key | Speaker | Channel | Line | Trigger and notes |
|---|---|---|---|---|
| arrive | M.E.G. OUTPOST 9 | radio | Nine. That car doesn't go up. You're in the hotel. | arrival |
| arrive2 | M.E.G. OUTPOST 9 | radio | Way out is under the boilers. The staff door is in the ballroom. Three locks. | |
| eyes | OUTPOST 9 / DR. HALE | radio | Nine. Eyes off the wallpaper. Last man who counted the roses lost an hour. / Hale. Eyes off the wallpaper. I stayed here a week once. I only remember the Tuesday. | wallpaper eyes (Hale if saved) |
| moth | OUTPOST 9 / DR. HALE | radio | Moths. Kill your light. Let them have the lamps. / Hale. Moths. Kill your light, let them have the lamps. | |
| loop | M.E.G. OUTPOST 9 | radio | Your room numbers just repeated on my end. Turn around. Last door of the north wing says EAST WING. Try that one. | two loops |
| keys | M.E.G. OUTPOST 9 | radio | That's three. Staff door, south wall of the ballroom, right of the arch. | |
| master | M.E.G. OUTPOST 9 | radio | Where did you get a master key? No. Don't tell me. Ballroom, staff door. | master key |
| stairs / boil / valve / exit | OUTPOST 9 (boil: Hale if saved) | radio | Service stairs. Down. / Boilers. Pressure is holding the exit shut. Three halls, three valves. / One down. Watch the dark. / Exit's released. East end. Go. | |
| haleCar | DR. HALE | live | This is as far as the car takes me. Go on. I will find you on the radio. | arrival, Hale saved |
| haleBack | M.E.G. OUTPOST 9 | radio | Nine. Hale is back on our band. Says the car took him home. Don't ask me how. | 75 s, Hale saved |
| haleLeft | M.E.G. OUTPOST 9 | radio | Nine. Nobody on this end is talking about Hale. Keep moving. | 30 s, Hale left |
| pr0 | ROOM {n} | live (door) | Is that housekeeping? No. Somebody with a light. | walking past his door before knocking |
| pr1–3 | ROOM {n} | live (door) | Housekeeping came already. Twice. / You are not housekeeping. You have a light. Nobody here carries a light. / Do me a kindness. The Beverly bar, top shelf, gold label. Rye. They stopped sending it up. | first knock |
| prNo | ROOM {n} | live (door) | No rye? Then I am not decent. Come back. / Gold label. Not the brown one. The brown one is for guests. / Still out there? The bar is through the ballroom. | knock without the rye |
| pr4–6 | ROOM {n} | live (door) | Leave it by the door. Step back. Further. / There. The night manager's key. He won't miss it. / Staff door is in the ballroom, by the bandstand. Don't come in here. I mean that kindly. | knock with the rye |
| prAfter | ROOM {n} | live (door) | I said don't come in. | knock afterwards |
| prPhone | ROOM {n} | radio (switchboard) | Front desk? About time. Send up the rye. Gold label. I will be right here. | switchboard before meeting him |
| prPhone2 | ROOM {n} | radio | Front desk? Where is my rye? / You again. I have what I need. / I can hear you breathing on the line. / Ring off. The bell is enough. | later switchboard calls |
| inside | (whisper) | whisper | …you came in… | opening his room |

Documents: NOTE ON THE FRONT DESK (rewritten: "Night shift: I moved the spare housekeeping keys to the wing closets…"), GUEST REGISTER, NIGHT AUDIT (see `src/places5.js` and `readNote5` in `src/main5.js`).

## Level 18 — Nostalgic Memories
**Structure.** New **ART ROOM** off the preschool corridor (bright and safe, like the classroom: easels, a paint table, a drying line) and a **LOST & FOUND** box by the Sunshine Room.

Required: follow the Dino → the Children's letter → four drawings (any order, as before) → pin them → **colour in the door**. The door needs the **crayons from the art room**: pick them up whenever you pass, and pinning the fourth drawing finishes the door straight away; otherwise the door waits ("It needs colors.") and you colour it in with a 2.4 s hold. Checkpoint CRAYONS.

Optional: a **fifth drawing** on the art-room easel (DADS CAMRA — you keep it), the **lost & found** (lists objects from your earlier choices: Brandt's battery, Reyes's tape, Okafor's page, Abara's cassette, Hale's photo or his hospital bracelet, the empty rye bottle, a patch with the number of explorers lost).

Ending: the YOU REMEMBERED card is built from the run: Maple Street in the morning; Hale's name on a kitchen radio, or somebody still knocking politely; how many names on the lobby band never answer; Reyes laughing at a bad joke; the room you went into; the camcorder still running (fifth drawing) or the tape running out; the Dino waiting.

| Key | Speaker | Channel | Line | Trigger and notes |
|---|---|---|---|---|
| family | MEMORY | caption | Saturdays at the play place. They sat at the little table with their coats still on. Dad ate your fries. | drawing (rewritten: no stated regret) |
| dog | MEMORY | caption | Biscuit. He ate the garden hose and the mailman's glove. The gate latch stuck if you didn't lift it. | |
| monster | MEMORY | caption | The thing in the closet had Mom's coat on. It was Mom's coat. | |
| house | MEMORY | caption | Maple Street. The yellow kitchen. Your height in pencil on the door frame, stopping at seven. | |
| camera | MEMORY | caption | Christmas. Dad's camera, the heavy one. Keep it rolling, kiddo. | fifth drawing |
| whispers | (whisper) | whisper | you have to lift the latch or it doesn't catch / his bowl is still by the back door / you said you fed him / there's a coat on the hook, that's all it is / they kept a chair for you / the kitchen was yellow… wasn't it | low sanity or the void |
| color | THE CHILDREN | whisper | It needs colors. The good crayons are in the art room. | fourth drawing pinned without crayons |
| bye | THE CHILDREN | whisper | Bye. Close the door behind you. Dino can't reach the handle. | door finished (replaces "You remembered us…") |
| radioHale | DR. HALE | radio | …Hale… I can hear a music box on your carrier… stay where it's bright… | arrival, Hale saved |
| radioNine | OUTPOST 9 | radio | …Nine… we lost your carrier… if you can hear this, keep the tape running… | arrival, otherwise after a run with Outpost contact |

Documents: A LETTER ON THE TEACHER'S DESK (now in the Children's own spelling, and it mentions crayons), NAP TIME RULES, LOST & FOUND (see `src/places18.js`).

## r7 additions (2026-10-02)
Written with the `backrooms-dialogue` skill. All new lines are text only.

### Level 5 — the State Floor, the fire lock, the females
**Brief.** Level 5, after the staff door (or any time: the State Floor is open from the start). Channel: Outpost Nine radio (Hale if cured), documents, toasts. Must-know: the exit also has a fire lock; reset is in security on the State Floor; the officer's keys are at table 9 (or the master key works); the fire key is in the East Room; almond water calms a female, spray doesn't. Change: the hotel has a "best" floor that was kept for somebody, and the moths you've been avoiding have mothers.

Structure: Beverly Room → STATE FLOOR door → vestibule → the inner door opens on the Cross Hall. Required (phase `fire` once the valves are vented, or earlier): get into SECURITY (Officer Lusk's keys from table 9 in the Gold Room, found via the reservation book; or the night manager's master key) → the panel needs the FIRE KEY → the glass case in the East Room (loud; the female on the chandelier) → turn the key in the panel → the exit. Optional: Mothex in the kitchen pantry, the pest-control note, the CCTV wall, the security log, the bowls.

| Key | Speaker | Channel | Line | Trigger and notes |
|---|---|---|---|---|
| state | M.E.G. OUTPOST 9 | radio | Nine. Your signal just jumped about a hundred metres. I won't ask. | first step onto the State Floor |
| fire0 | M.E.G. OUTPOST 9 | radio | One more thing. That exit also locks off the fire panel. Panel's in security, up on the State Floor. East wall of the ballroom. | 14 s after the staff door, if the lock isn't reset |
| fire | OUTPOST 9 / DR. HALE | radio | Pressure's down. Exit's still red on my board. That's the fire lock. Security office, State Floor. / Hale. The fire panel is in security. The officer ate in the Gold Room. His keys never left his table. | valves done, lock not reset |
| big | OUTPOST 9 / DR. HALE | radio | That one's twice the size of the others. Leave it alone. / Hale. That is a female. Don't spray her. She likes almond water, if you have any. | first sight of a female |
| spray | M.E.G. OUTPOST 9 | radio | Bug spray. Sure. Save it for the small ones. | Mothex picked up |
| reset | M.E.G. OUTPOST 9 | radio | There. Green on my board. Get down to that exit. | fire lock reset |
| portal | (toast) | HUD | THAT IS NOT WHAT IS BEHIND THIS WALL | first inner door opened |
| spray toasts | (toast) | HUD | IT DROPS / THE SPRAY DOES NOTHING TO HER / SHE DOES NOT EVEN LOOK UP / THE CAN IS EMPTY | |
| acid death | (end card) | text | SHE SPAT · The lens fogs green and the picture eats in from the edges. | killed by acid |

Documents (`src/state5.js`): THE GOLD ROOM · RESERVATIONS (table 9 is Officer Lusk's, every night at 3:00; "left his keys on the table again. Leave them."), PEST CONTROL · KITCHEN (Mothex does the small ones; nothing to the females, she spits; almond water in her bowl at close; "Boiler room whenever {guest's room} complains."), SECURITY LOG · NIGHTS (the East Room windows lit with no moon; the bowl; dinner at table 9; the 3:10 bell; "Fire key goes back in the case. Not in my pocket."). CCTV: CAM 2 BEVERLY, CAM 4 EAST ROOM (something large on the chandelier), CAM 7 the guest's room (someone standing by the window), CAM 9 BOILERS.

### Level 18 — your name
**Brief.** Level 18, after the door is coloured in (or earlier, from the letter). Channel: the Children (whisper), MEMORY captions, documents. Must-know: the door needs your name; the name tag is in your cubby; the key is in the music room's toy box; the song is on your birthday card. Change: you get your own handwriting back.

| Key | Speaker | Channel | Line | Trigger and notes |
|---|---|---|---|---|
| name | THE CHILDREN | whisper | Now put your name on it. Or it goes to anybody's house. | door coloured, no name |
| song | THE CHILDREN | whisper | You remembered our song. | floor piano played right |
| tag | MEMORY | caption | You can't read it anymore. It's yours, though. You can tell from the R. | name tag taken |
| party | (whisper) | whisper | …happy birthday to you… | entering the birthday room |
| wish | (whisper) | whisper | …you wished you could go home… | MAKE A WISH |
| bus | (whisper) | whisper | …buddy system… hold hands… | entering the bus |
| letter + | THE CHILDREN | letter | put your name on it or it goes to anybodys house. your name is in your cubby. teacher keeps the cubby key in the toy box. play our song and it opens. / we wrote the song in your birthday card. | added to the letter |
| end + | (end card) | text | In a hotel nobody visits, something large drinks from a bowl and doesn't look up. / The name on the door is in your handwriting. You can read it now. | fed a female in Level 5 / signed the door |

Documents (`src/memories18.js`): A BIRTHDAY CARD (the song as colours: RED · RED · BLUE · BLUE · PURPLE · PURPLE · BLUE; "you cried when we sang. then you laughed. then cake."), A NOTE IN YOUR LUNCHBOX ("Have a good trip. Stay with your buddy. Don't trade the cookies. I'll be at the gate at three. — Mom"). Lost & found adds Lusk's cap and a wet silver bowl when you did those things in Level 5.

## New canon (needs approval)
- The player is the team's **camera operator**; the team calls them "Camera". The roll call on the whiteboard lists CAMERA.
- Okafor's beacon: **Outpost Nine** was audible under Level 0's hum; Nine's **relief team** (S. Abara, Kowalczyk, Lund, a fourth) went quiet in Level 9's blue house.
- Hale **tested the cure on himself**; he has (or had) a daughter, **June**; his house is on **Maple Street** in Level 9, with a spare admin card in a wall safe.
- Level 9 street names and house numbers. Maple Street exists in Level 9 *and* in your childhood (Level 18); unexplained on purpose.
- The Neighborhood Watch keeps a **patrol rota** and **meeting minutes** in the block captain's house.
- The hotel's **night manager**, his master key, and the guest **E. Pruitt** (arrived 12 Oct 1951, never departed). The register also lists **OKAFOR, D., Room 541, arrived 30 Sep 1996** (the camcorder reads 29 Sep 1996), a M.E.G. party of four, and a nameless guest who "brought own light".
- A cured Hale **leaves in the elevator car** and reappears on Outpost Nine's band.
- Level 18: an **art room**, the **crayons** needed to finish the door, a **fifth drawing** of Dad's camcorder, a **lost & found** holding objects from the run.
- r7: the hotel's **State Floor** (Cross Hall, East Room, Gold Room, kitchen, security), reached only through a portal door in the ballroom; its windows are lit with nothing outside. Vestibule inner doors open onto the far side of the hotel.
- r7: **Officer Lusk**, hotel security, ate at table 9 at 3:00 every night and left his keys there; the exit is on a **fire lock** reset from his office with a **fire key**.
- r7: **female deathmoths** are spray-proof and spit acid; **Mothex** kills males; a bowl of almond water calms a female for good (the wiki's lore has females produce acid and both sexes tamed by almond water; spray-proofing and the bowls are ours).
- r7: Level 18's **cubbies**, **music room** and **floor piano**, the class song (Twinkle Twinkle) on **your birthday card**, the **birthday-party** and **field-trip bus** memory rooms, Mom's lunchbox note; a drawn door needs its maker's **name** or it goes to anybody's house.

## Open questions
- Should Room 541 (Okafor's room in the register) become a place in a later pass, or stay a line in a book?
- Re-voicing: the old voiced Level 9 `arrive` clip is no longer used; all r6 lines are text only.

## Proposed voice sheets (not saved to the skill's references)
| Speaker | Words and slang | Rhythm | Under pressure | Never says | Status |
|---|---|---|---|---|---|
| Marsh | "copy", counts people and things | Short, procedural | Gets quieter, two-word orders | How he feels | Proposed |
| Okafor | Bands, carriers, "okay okay" | Technical asides | Faster, repeats numbers | That he was wrong, to Marsh | Proposed |
| Reyes | "Camera", blunt, medical shorthand | Dry, flat | Bad jokes | Please | Proposed |
| Brandt | Gear first ("my battery"), "kid" never, "camera" sometimes | Gruff, short | Shouts names | Anything nice about the door | Proposed |
| Outpost Nine | Street names, "Nine." to open | Tired, clipped | Even shorter | Explanations of what things are | Proposed |
| Dr. Hale | Precise, slightly formal ("I will", not "I'll") | Measured | Apologises | June's name, out loud | Proposed |
| The guest (Pruitt) | Hotel courtesy from another decade | Polite, slow | Politer | His own name | Proposed |
| The Children | Lower case, misspellings, rules | Lists | — | Grown-up words | Proposed |

## Skill audit
Every line was checked against the Slop Catalog (stock phrases, line shapes, story shapes, game-writing habits), the swap test and the read-aloud test. Lines that had drifted onto the skill's own worked examples (the Level 9 Watch warning, the Level 5 wallpaper line and front-desk note, the Biscuit caption and whispers) were rewritten with new specifics: worked examples are illustrations, not lines to reuse. Voiced-line rule (no ellipses, dashes or caps inside spoken text) applies when these are recorded; the whisper and radio-fragment captions keep their ellipses because they are subtitles only.

## Voicing
All r6 lines are subtitles with the existing radio/static or whisper sound. To voice them later, run the Piper pipeline in `audio_pipeline/` with the speakers above; the spoken text must equal the subtitle text (skill rule). Keys are proposed, not yet in `VO_TXT`.
