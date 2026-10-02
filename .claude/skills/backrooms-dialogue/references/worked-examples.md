# Worked Examples

<!-- Imported from Notion: https://app.notion.com/p/3ec79be4683a815aa0ecf93a69a67050 (snapshot 2026-10-01) -->

> ⚠️ These are technique illustrations, not canon. Don't reuse the lines verbatim, and treat any names or events in the rewrites as unapproved.

## 1. Level 9 radio warning

**Before**

> RADIO: Attention, wanderer. You have entered Level 9, the Darkened Suburbs. Beware the Neighborhood Watch: tall figures who carry flashlights and patrol these streets. If their light finds you, it may be the last thing you ever see. Stay in the shadows, and you just might survive.

**After**

> RADIO: Anyone on nine, copy. Watch is out early tonight.
> RADIO: Lights on the street aren't ours. Don't wave. Get off the road.

**Why:** the operator wouldn't name the level or explain the Watch to someone already standing in it. The must-know (a flashlight on the street means danger, leave the road) survives in plain words. "Don't wave" adds dread and a bit of personality without a dramatic closer. No dashes or ellipses, so the TTS and speech-recognition check stay clean.

## 2. Level 0 lost tape

**Before**

> Day three. The walls stretch on forever, an endless sea of yellow that whispers secrets I can't understand. My supplies are dwindling. Remember: the first digit is [DIGIT]. I fear I may never escape this labyrinth of madness.

**After**

> Is it on? Red light. Okay. Third tape. Reyes says the hum is louder near the wet carpet. I say Reyes needs to sleep. Water's down to two bottles. First number's a [DIGIT]. I'm writing it on my glove.

**Why:** a false start, a small argument, a supply count, and the digit dropped in as an aside with a physical detail that makes it stick. Nothing about secrets, seas or madness. If digits are randomized per run, check how the existing tapes voice them first.

## 3. Mimic lure

**Before**

> MIMIC: Help me! Please, I'm trapped over here! Come quickly!

**After**

> OKAFOR (earlier, real): Over here. Bring the light, mine's dying.
> MIMIC (later, Okafor's voice, from the wrong direction): Over here. Bring the light, mine's dying.
> MIMIC: Over here.

**Why:** the lure works because it's a line the player already trusts. The wrongness is in the exact repeat, the direction and the loop, not in a creepy script. Check `VO_TXT` for a real line to borrow before writing new ones.

## 4. Level 5 front-desk note

**Before**

> Welcome, weary traveler, to the Grand Hotel. Your path forward lies with three keys hidden in the West, North and East wings. Gather them to unlock the staff door and find your way to freedom. But beware: the hotel is always watching.

**After**

> Night shift: spare housekeeping keys are in the wing closets now, West, North and East. Not in the STAFF ONLY door. Not in your pocket. Ask me how I know.

**Why:** every must-know fact survives, but the note exists for the staff's reasons. One human aside replaces the ominous closer. A signature or a past incident would be new canon, so flag it if you add one.

## 5. Level 18 regret whispers

**Before**

> You forgot about Biscuit. You promised you would always remember, but memories fade like footprints in the sand. Can you ever forgive yourself?

**After**

> You left the gate open.
> Biscuit. Biscuit, come.
> Whose turn was it to feed him?
> Maple Street. You never went back.

**Why:** each whisper is one concrete detail from the drawing beats in the spec. No metaphor, no question about meaning, no forgiveness theme stated. The player connects them.

## 6. Explorer barks: Howler nearby (Level 0)

**Before**

> "Did you hear that?" "What was that noise?" "Something's coming!" "We need to get out of here!"

**After**

> **Suspicious:** "Shh." "That wasn't me." "Brandt, stop walking."
> **Alert:** "Lights off. Off." "It's behind us. Don't run yet."
> **Chase:** "Go." "Left!"
> **Lost:** "Count to twenty. Then we move."

**Why:** each tier changes length and rhythm, not just wording. A name appears only to stop someone. Every line is an action. The before set is the generic list every horror game already has.
