# Level 7 dialogue audit (backrooms-dialogue skill)

Scope: story7.js, main7.js (say/sayK7/sayW7/sayF7, toasts, docs, tasks, PA, whispers, death and ending cards), sign strings in props7.js / props7b.js. Only text inside string literals changed; no logic, identifiers, regexes, timings or interact labels. Compass checked: lighthouse south, habitat north, Aurelia west, Halcyon north-west, pier east (all strings already agreed).

## Lines changed
| Where | Old | New | Why |
|---|---|---|---|
| Outpost, arrival | "...your carrier has salt on it." | "...your signal is wet." | "carrier" was jargon with no referent. |
| Hale radio (hale9 saved) | "The sea will let you hold your breath longer than you think. Then it won't." | "Hale. Nine says you are in the water. Find something to climb." | Aphorism closer; Hale could not know about the sea. Now sourced from the Outpost, and gives a usable action. |
| Outpost, generator | "You've lit something. It's on a board that doesn't cover your level." | "We saw a light come on near you. We have nothing on that level." | Obscure "board". |
| Kell, generator | "...First time in a month I haven't heard my own pulse." | "...Hear that? First noise on here I didn't make." | "A month" contradicted eleven days; body-emotion cliche. |
| Kell, generator (air house) | "Air house next. Northeast corner. The wheel is red." | "...Northeast corner, red wheel. There's a man on that line." | Player may not have heard of Fen yet (Fen topic is third); gives the reason once. |
| Kell, air open | "...Down the north side and keep going. Nine metres. Don't be clever." | "...by now. Down the north side and keep going. Don't be clever." | "Nine metres" was said in three places; kept in topic and hint. |
| Kell, lamp topic | "It has been dark a year." / "...I only have the radio." | "She says it has been dark a year." / "...what she means by cable." | Ledger: Kell has been there eleven days, so a year is Wren's word. |
| Kell, fen topic | "...Nine days. His air line comes off this rig." / "The compressor wants the generator first. Everything wants the generator first." | "There's a diver in Habitat Two. Fen. Seabed, north of us, nine metres down." / "I can't raise him. I don't know if that's the radio or him." | Same fact said three times; now one fact and one specific worry. |
| Kell, flare topic | "Take a flare off the helipad. G fires it." | "There are flares on the helipad. Take them." | Mechanics (key) in a character's mouth; the toast owns the key. |
| Kell, key | "Or don't go. I wouldn't blame you. I've got the radio." | "Or don't go. I've got the radio." | Stock reassurance. |
| Kell, idle (lit) | "It's very quiet. I'd forgotten it could be." | "The wind's gone. I keep checking the window." | Stated feeling; now concrete. |
| Kell, idle | "...I can only tell by the radio." | "...The window's salt, I can't tell." | Radio cannot tell rain. |
| hint7 (Kell idle and Outpost every 220 s) | "Everything wants the generator first", "West of us", "Wren said", "don't be clever", etc. | Neutral, location-first versions; fuel hint now names deck can and engine-room tank; motor hint names the bridge safe | Swap test: the Outpost was talking in Kell's voice and saying "us". |
| Wren, first | "Kell let you through. He doesn't, as a rule." | "Kell said you were coming. He never says that about anyone." | "Let you through" had no referent. |
| Wren, parts | "It wants three things. Fuel... A motor... And a cable." | "Fuel for the burner is in the Aurelia's engine room. The motor for the lens went down with the Halcyon." | Kell already lists the three; Wren now gives the locations (the fuel location had no in-world source but the hint). |
| Wren, parts (cable) | "Power comes from the rig by a cable..." | "The lamp takes its power from the rig by a cable under the sea..." | Wording only. |
| Wren, splice | "...You hold your breath for the length of it. Four seconds, if the water lets you." | "You splice it by hand, down there. Do not let go halfway." | Mechanic and digit out of the voiced line. |
| Wren, why | "What does it do, the lamp?..." / "Do you think it was ever for ships?" | "Ships went onto that shoal for fifty years with the lamp lit." / "I would like to know who it was lit for." | A question put to the player; now her own open question. |
| Wren, idle | "Mind your breath. The sea lets you borrow it." | "Come up for air before you need it." | Aphorism. |
| Wren, keeper end | "Mind the second column." | "Sit. The pen is on the log. Second column." | Line meant nothing on its own. |
| Fen, no air | "Is that... I can't hear you. ... Please. The line first." | "Is someone there? The air has gone thin. I can't think. The line first, please." | Ellipsis in a voiced line. |
| Fen, first | "Say something wet." / "...came back an hour ago." | "Say something. I've been answering the cable." / "...only just came back." | Nonsense joke; "an hour" can be false. |
| Fen, safe | "You're after the Halcyon's safe..." / "...First number is four." / "The rest is written down on other people's walls. That is how he talked." | "If it's something off the Halcyon, it'll be in her bridge safe..." / "He read me his combination once, as a joke. I kept the first number. Four." / "The rest he gave to anyone who was listening." | Ledger: Fen could not know what the player wants. The old third line was unclear. |
| Whispers (W7_WHISPER) | "...it's warmer further down..." etc. | same five fragments without ellipsis marks | Ellipsis in voiced lines. |
| Death, Long Shadow | "...goes past the lens without hurrying." | "...Something very large passes the lens, slowly." | Camcorder register. |
| Kell log, day 3 / day 9 | "...since the generator died." / "The buoys went out..." | "The compressor stopped while he was down..." / "The last lamp on the north leg gave out..." | The generator died on day 3, so the buoys could not go out on day 9. |
| Halcyon last radio | "Chart safe is for the lens motor. Four, two, seven." | "The Cape Sorrel lens motor is in the chart safe. I am not reading the combination out on the air again." | The log gave the whole combination, which made Fen, the mate's log and the tide board pointless. Also sets up the mate's "by mistake". |
| Captain's log | "It follows the lights it can't reach." | removed | Explained the Shadow; the last line ("I would rather it knew where I was") now works. |
| Toast, motor | "...LOOKS LIKE IT SAID THANK YOU" | "THE LENS MOTOR · HEAVY" | Cute narration. |
| Task sub (generator) | "EVERYTHING ON MERIDIAN WANTS IT FIRST" | "THE BUOYS AND THE AIR LINE RUN OFF IT" | Kell's phrase leaking into the HUD. |
| Task sub (air) | "FEN'S LINE COMES OFF THIS RIG" | "THE HABITAT'S AIR COMES OFF THIS RIG" | The player may not have heard Fen's name yet. |
| End card, keeper | "...flat, and gold, and shallow-looking, all the way down." / "one more name" | "...flat and gold." / "one more line" | Rule of three; name/date mismatch with the first sentence. |
| End card, deep | "...The water is warm, and then it is not water." / "patient... gold and tired" / "turns for no one" / "Nobody turned the lamp off. Nobody has to." | "...The water gets warmer." / "a long dark ridge, lit from below." / "the lamp turns and the sea under it lies flat." / (cut) | Negation pivot, explained Shadow, aphorism closer. |
| End card, sail | "A bubble line rises beside the pier, rests a moment, and sinks." / "That is a kind of keeping." | "A line of bubbles comes up far off the stern, then stops." / "The tape has every log and note they left." | Bubbles do not sink; stated theme. |

## Judged fine (unchanged)
Kell's opening ("That is a count, not a complaint"), "I watched the light on it for an hour", all PA lines, the Outpost lamp-lit line, Wren's door line and "There she goes", Fen's bench line and kettle line, Fen's lantern warning, Wren's second chair and Tomas lines, Kell's kettle lines, the mess board, cook's notice, Dav's note, Kell's radio log (days 1, 6, 11), Fen's log, mate's log, keeper's log, photograph back, boathouse notice, key board, jackets, fish table, the tide board, all signs (MERIDIAN / TIDES / GENERATOR / AIR / CAPE SORREL LIGHT / KEYS), all toasts and task text not listed above, the Level 2 and Level 37 callbacks in the end cards.

## Voiced-line checks
No digits, dashes, ALL CAPS or ellipsis remain in any say()/sayK7/sayW7/sayF7 line or whisper. The only remaining ellipsis characters are in interact labels (PRIMING..., FILLING..., LIGHTING...), which were left alone.

## New canon introduced (needs approval)
- Hale reaches Level 7 by way of the Outpost ("Nine says you are in the water").
- The Halcyon skipper read his safe combination out on the radio as a joke (Fen) or by mistake (mate); he "will not read it out again". Fen kept only the first number.
- The Aurelia's engine-room tank is known to Wren as the fuel source.
- Kell has only Wren's word that the lamp has been dark a year; he cannot raise Fen on the radio.
- Kell's log: the rig's last lamp on the north leg failed on day 9.

## Open questions
- Dav (bunk note, jacket peg) is never resolved. Is he meant to turn up (the habitat, the Halcyon) or stay a loose end? Fen's nine days alone does not mention him.
- The entry toast "DON'T TAKE THE LANTERN" on the Halcyon is the game speaking, and there is no lantern object. Cut it, or give it a speaker (Fen, only if the dark topic was heard)?
- Wren's log postscript ("I have not found out") against her having kept the lamp dark for a year: intended?
- Out of scope but noted: DEATH_TXT.drown and DEATH_TXT.fish live in main37.js and are shared with Level 37; the photograph back ("Don't let him say he didn't") is cryptic but left as a note-writer's shorthand.
- The voice bank (voicebank7.js) is keyed by line text; every changed spoken line needs a fresh clip.
