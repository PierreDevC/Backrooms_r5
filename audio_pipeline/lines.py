# Voice script. key -> (voice id, tts text, length_scale, style)
# voices: 0 Marsh (joe, CC0), 1 Okafor (cori, PD), 2 Reyes (kristin, PD), 3 Brandt (mike, CC0), 'w' whisper (ljspeech, PD)
VOICES = {0: 'en_US-joe-medium', 1: 'en_GB-cori-high', 2: 'en_US-kristin-medium', 3: 'en_US-mike-medium', 'w': 'en_US-ljspeech-high'}
GREET = ["You're alive! Thank God. Keep your voice down.", "Hey. Hey. You made it through too?", "Easy. It's me. Don't point that light in my face."]
DIRS = ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west']
DIST = ["Close. Maybe twenty meters. The tapes carry the exit code.", "Maybe fifty meters out. The tapes carry the exit code.",
        "It's a long way. A hundred meters, at least. The tapes carry the exit code."]
TIPS = ['If you hear it howl, break line of sight. Crouch, and it loses you.',
        'The smiling one hates light. Hold your beam on it, and it backs off.',
        "There's something pale, on all fours. It only moves when you're not looking.",
        "Don't trust anyone in a suit who won't say their name.",
        'Night shot lets you see in the dead zones, but it chews through batteries.',
        'Almond water keeps your head straight. Drink it when the walls start breathing.',
        'Running is loud. Only sprint when it has already seen you.']
FLEE = ['Run! Get out of here, now!', "It's here! Oh God, it's here!", 'Go! Go! Go!']
CHAT = [['Marsh here. I keep hearing footsteps that stop when I stop.', 'Marsh. I passed the same chair three times. The same chair.'],
        ['Okafor. The lights are dead near me. Something is grinning in there.', 'Okafor. The carpet is wet here. Why is it wet?'],
        ['Reyes. I found claw marks, at head height. Stay sharp.', 'Reyes. Is anyone else hearing the hum change pitch?'],
        ["Brandt. If you find the door, don't wait for us.", 'Brandt. My compass keeps spinning. North is, wherever it wants.']]
STORY = {'crawl': 'Something pale is following me. It freezes when I turn around. Keep your eyes on it.',
         'more': "There's more than one of them. Oh God. There's more than one.",
         'circ': 'Keep moving. It is circling the east halls.',
         'red': "You have the code? The door is behind the red light. Go. Don't wait for us.",
         'lights': "The lights! What happened to the lights? Nobody move. Something's smiling at me.",
         'door': 'It heard the door! Run!'}
TAPES = [(1, "Day two, I think. The hum never stops. Brandt says, if you listen long enough, it starts saying your name."),
         (0, "Something walks with us. Heavy steps. When we stop, it stops. Reyes wants to keep the lights off. I don't."),
         (2, "We found a door. Steel, with a keypad. Okafor split the code across the tapes, in case one of us didn't make it."),
         (3, "If anyone finds this, the exit is real. Follow the red light. Whatever you do, don't let it see you.")]
MIMIC = ['Hey. Over here.', 'I found the door. Come look.', 'Is that you? Come closer.', 'Turn off the light. Please. It hurts.', "It's safe here. It's safe."]
WHISPER = ['Turn around.', "It's inside the walls.", 'Why are you still recording?', "We never left. Did we?", 'We can hear you breathing.']

def tip_ids(i): return [(2 * i + k) % 7 for k in range(4)]

LINES = []
def say_text(t): return t.replace('Reyes', 'Ray-ess').replace('Okafor', 'Oh-kah-for').replace('noclipped', 'no-clipped')
def add(key, v, text, ls=1.0, style='clean', ns=0.667, tts=None): LINES.append(dict(key=key, v=v, text=text, tts=say_text(tts or text), ls=ls, style=style, ns=ns))
add('intro1', 0, '…anyone copy? This is Marsh. We got split up when the floor gave out. We noclipped. All of us.', 1.02, tts='Anyone copy? This is Marsh. We got split up, when the floor gave out. We noclipped. All of us.')
add('intro2', 0, 'Find the tapes. Okafor put the exit code on the tape labels. And stay quiet.', 1.0)
for i in range(4):
    for k, t in enumerate(GREET): add(f'e{i}_greet{k}', i, t, 1.0)
    for k, d in enumerate(DIRS): add(f'e{i}_rig{k}', i, f'I saw one of our camera rigs to the {d}.', 1.0, tts=f'I saw one of our camera rigs, to the {d}.')
    for k, t in enumerate(DIST): add(f'e{i}_dist{k}', i, t, 1.0)
    for k in tip_ids(i): add(f'e{i}_tip{k}', i, TIPS[k], 0.98)
    for k, t in enumerate(FLEE): add(f'e{i}_flee{k}', i, t, 0.82, ns=0.8)
    for k, t in enumerate(CHAT[i]): add(f'e{i}_chat{k}', i, t, 1.0)
    for k, t in STORY.items(): add(f'e{i}_{k}', i, t, 0.9 if k in ('lights', 'door', 'more') else 1.0, ns=0.75)
for n, (v, t) in enumerate(TAPES): add(f'tape{n + 1}', v, t, 1.08, 'tape')
for vi in (0, 2):
    for k, t in enumerate(MIMIC): add(f'mim{vi}_{k}', vi, t, 1.12, 'mimic', ns=0.5)
for k, t in enumerate(WHISPER): add(f'wh{k}', 'w', t, 1.2, 'whisper')

# ---- Level 9: M.E.G. Outpost 9 operator (bryce, CC0-style) + Dr. Hale (john) ----
VOICES['b'] = 'en_US-bryce-medium'; VOICES['j'] = 'en_US-john-medium'
L9 = {
 'arrive': "This is M.E.G. Outpost Nine, to anyone on this channel. You've drifted into Level Nine. The Neighborhood Watch walks these streets. If you see a flashlight, get inside a house and shut the door. Our outpost is north-east of you. There's a map at the gate.",
 'map': "See the three red houses? Each one has one of our terminals. Download all three, and the gate unlocks. Stay in range while it transfers.",
 'wretch': "Something's moving in that house. That's a Wretch. Close the door and latch it. They can open doors, but they can't break a latch.",
 'watch': "That's the Watch! Break line of sight. Get into a house and close the door behind you.",
 'lost': "It lost you. Stay quiet until the light moves on.",
 'term1': "Data received. Two more houses.",
 'term2': "Second node is in. One house left.",
 'gate': "That's all three. The gate is open. Get inside, and follow the yellow arrows down to the lab.",
 'lab': "You made it down. The thing in the holding cell is Doctor Hale. We can bring him back. Start with the crowbar on the workbench.",
 'crowbar': "Good. Four fluid canisters are padlocked away. Two houses, the outpost storeroom, and the crashed van. I've marked them on your map.",
 'cans': "That's all four canisters. Bring them to the rack in the decontamination room.",
 'installed': "The lure is primed. Open the cell, then get clear. He'll go for the vapor in the cage.",
 'trap': "He's in the cage, sniffing the lure. Pull the lever, now!",
 'mist': "Cage sealed. Release the cure.",
 'hale1': "Where... where am I? The lab. How long was I in there?",
 'hale2': "You brought me back. Thank you. The Watch never stops looking. The service elevator is the only way up.",
 'hale3': "Here. Take my administrator keycard. The elevator is down the hall. Let's go home.",
}
L9_TTS = {'arrive': "This is Meg, Outpost Nine, to anyone on this channel. You've drifted into Level Nine. The Neighborhood Watch walks these streets. If you see a flashlight, get inside a house, and shut the door. Our outpost is north-east of you. There's a map at the gate."}
for k, t in L9.items(): add('m9_' + k, 'j' if k.startswith('hale') else 'b', t, 1.0, tts=L9_TTS.get(k))
