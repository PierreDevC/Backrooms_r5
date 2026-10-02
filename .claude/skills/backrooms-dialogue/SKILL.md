---
name: backrooms-dialogue
description: Write, revise or review any words the player reads or hears in the Backrooms Found Footage game — M.E.G. radio calls, explorer voices (Marsh, Okafor, Reyes, Brandt), Level 0 lost tapes, Mimic lures, barks, notes and signage, Level 5 whispers, Level 18 regret whispers, briefing copy, death and ending text, and the story beats behind them. Also use to audit existing lines for writing that sounds AI-generated. Not for code, audio pipeline or release work.
---

<!-- Imported from Notion: "Backrooms Game — Dialogue & Story Writing"
     https://app.notion.com/p/3ec79be4683a8143b231c2886f05ec04 (snapshot 2026-10-01).
     Notion is the source of truth; re-import if the page changes. -->

Use for writing or revising any words the player reads or hears in Pierre's Babylon.js **Backrooms: Found Footage** game: M.E.G. radio calls, explorer voices, lost tapes, Mimic lures, barks, notes and signage, regret whispers, briefing copy, death and ending text, and the story beats behind them. Also use to review existing lines for writing that sounds AI-generated. Not for code, audio pipeline or release work. Those follow the [Project Memory & Update Workflow](https://app.notion.com/p/c775b527afcc44cab7aaee89bd7d0f9d) page and `AGENTS.md` / `HANDOFF.md`.

> 📼 **The standard.** Everything in this game is found footage: something a camcorder or radio caught, something a person said while scared, or something someone wrote for their own reasons. Nobody is talking to the player as an audience. Lines are short, specific, partial and sometimes wrong. The player assembles the meaning. The game never states it.

## 1. Load sources

1. [Game Design & Level Specifications](https://app.notion.com/p/3eb79be4683a81408770fab279696e19) (Notion) for levels, objectives, characters and entities. It is canon for this game, including its deliberate departures from the Backrooms wiki. Locally, `docs/LEVEL18.md` covers Level 18.
2. [references/voice-sheets.md](references/voice-sheets.md) for how each speaker talks, who knows what, and the canonical terms.
3. Read the existing lines before writing. Match how characters already talk and the clip-key pattern already in use:
   - `game/src/audiobank.js` — `VO_TXT` (voiced lines and their keys: `greet`, `tips`, `flee`, `mimic`, `whisper`, `dirs`, `dist`, `l9`, …)
   - `say(...)` calls in `game/src/ai.js`, `main.js`, `main5.js`, `main9.js`, `main18.js`, `story5.js`, `story9.js`, `story18.js` (subtitles and text-only lines)
   - `game/src/brief.js` for briefing slide copy

   If the source is not available, say so and mark every key as proposed.

## 2. Brief the scene

Write these down before drafting a line:

- **Where and when:** level, zone, trigger (pickup, proximity, timer, death, checkpoint).
- **Channel:** radio, live voice, tape, Mimic, whisper, note or sign, briefing UI. The channel sets length and texture. See [references/channels-and-barks.md](references/channels-and-barks.md).
- **Must-know:** the one or two facts the player needs for play. Nothing else is required.
- **Wants:** what each speaker wants right now, what they won't say, and who has the upper hand.
- **Change:** what is different after this moment (a new fear, a new fact, a relationship shifting). If nothing changes, cut the scene or merge it into another.

## 3. Check canon and knowledge

- Every place, item, entity and mechanic mentioned exists in the spec and uses the game's name for it. Characters may use their own slang for things; record slang in the voice sheet.
- A speaker only references what they could know at that point in the run. Check the knowledge ledger.
- Never add lore silently. Anything new (a name, a past event, a rule about an entity) goes under **New canon (needs approval)** in the output.

## 4. Draft

- **Subtext.** Frightened people talk around things. Put the fear in what they avoid, what they repeat and where they stop.
- **No lore for people who already know it.** Explorers don't explain almond water, M.E.G. or the levels to each other.
- **Gameplay info lands once,** in the speaker's own words, attached to something they want. Objective text and the HUD handle repeats.
- **Every line is an action:** warn, stall, lie, accuse, bargain, comfort, deflect, joke badly. If you can't name the action, cut the line.
- **Short.** Radio calls and barks usually stay under 12 words, one idea per line. Tapes and notes can run longer but stay broken up.
- **Specific, not vague.** A wing name, a count, a time on the camcorder clock or a brand on a box beats "this place" and "something".
- **Let people be wrong,** rude, dull, interrupted or cut off by static. Not everyone is articulate.
- **Name feelings plainly sometimes** ("I'm scared, okay?"). Don't route every emotion through chests, breath, skin or weather.
- **Leave things open.** No closing moral, no character summing up the theme, no tidy answers before a level actually ends.
- **Withhold explanations, not details.** Speakers describe what they saw or heard, in pieces. Nobody explains what an entity is or why it exists.
- **Entities stay as designed.** Don't give speech to entities that only make sound; check the spec first. The Mimic speaks only in borrowed voices.

## 5. Audit

1. Open [references/slop-catalog.md](references/slop-catalog.md) and check every line against all four sections. Rewrite each hit.
2. **Swap test:** swap two speakers' names. If nothing reads wrong, rewrite until the voices differ.
3. **Read-aloud test:** say every voiced line out loud. Voiced lines are generated with Piper TTS and checked by speech recognition, so keep ellipses, em dashes, parentheses, ALL CAPS emphasis, symbols, unclear abbreviations and stage directions out of the line itself. Write numbers the way they should be spoken.
4. Compare against [references/worked-examples.md](references/worked-examples.md) if a line still feels off and you can't say why.

## 6. Deliver

Return the work in the conversation unless Pierre names a Notion page or file to write to. Putting lines into the source, voicing them and releasing them follow the Project Memory & Update Workflow (and `AGENTS.md` / `HANDOFF.md` in this repo).

For each scene, give:

1. **Brief:** five lines at most.
2. **Lines** as a table with these columns: Key, Speaker, Channel, Line, Trigger and notes. The spoken text and the subtitle text are identical.
3. **Branches,** if any, as indented arrows.
4. **New canon (needs approval):** a list, or "None".
5. **Open questions:** only those that block the lines or would change them.

## If something is missing

- **No level or trigger given:** ask one question. If Pierre wants a draft anyway, state the assumption at the top.
- **Blank voice sheet for a speaker:** draft one from their existing lines, or from the spec if there are none, and show it with the lines for approval. Don't save it unasked.
- **Request conflicts with the spec:** follow the request and flag the conflict.
- **Source not available:** write the lines anyway, mark keys as proposed and note "not checked against VO_TXT".
- **A line needs a trigger, note or interactable the game doesn't have yet:** list it under Open questions as code work. Don't assume it exists.

## Done when

- Every line passes the Slop Catalog, the swap test and the read-aloud test.
- Each must-know fact appears once and is clear.
- No line references something its speaker couldn't know.
- New canon is listed, not hidden.

## Reference files

Load these when the steps above point to them.

- [references/slop-catalog.md](references/slop-catalog.md) — AI-writing patterns to catch (step 5)
- [references/channels-and-barks.md](references/channels-and-barks.md) — channels, barks, horror pacing (step 2 and drafting)
- [references/voice-sheets.md](references/voice-sheets.md) — voice sheets, knowledge ledger, canonical terms (steps 1 and 3)
- [references/worked-examples.md](references/worked-examples.md) — before/after rewrites (step 5)

## Sources behind this skill

- Jon Ingold, "Sparkling Dialogue" (AdventureX 2018), [notes by Robert Yang](https://www.blog.radiator.debacle.us/2018/11/notes-on-sparking-dialogue-great.html). Repetition, subtext, Accept / Reject / Deflect, loops and trapdoors.
- Russell et al., [StoryScope: Investigating idiosyncrasies in AI fiction](https://arxiv.org/abs/2604.03136) (2026). AI fiction states its themes, ties plots off neatly, leans on bodily emotion and vague allusion.
- Wikipedia, [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), and the [blader/humanizer](https://github.com/blader/humanizer) skill built on it.
- Paech et al., [Antislop](https://arxiv.org/abs/2510.15061) (ICLR 2026). Phrases and names heavily over-represented in LLM fiction.
- Game Developer, [8 Key Principles of Writing Effective Game Dialogue](https://www.gamedeveloper.com/game-platforms/8-key-principles-of-writing-effective-game-dialogue) and [Story Design Tips: 10 Dialogue Don'ts](https://www.gamedeveloper.com/design/story-design-tips-10-dialogue-don-ts).
