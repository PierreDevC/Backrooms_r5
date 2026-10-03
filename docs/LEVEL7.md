# Level 7 · Thalassophobia (r10, branch `agent/claude`)

Level 2's THE LIFT ending now offers CONTINUE · LEVEL 7 (also in the level picker, `?debug&level=7`). Suffix `7`; short state objects are `GS7` (game), `WS7` (world), `PS7` (story), `ZS7` (zones), `AIS7` (agents), `BAS7` (basins).
Files: `level7.js` (layout, lights), `world7.js` (sky, sea, materials, doors), `props7.js` (rig, ship, lighthouse, pier, habitat, wreck), `audio7.js`, `ai7.js` (Kell, Wren, Fen, the Gulpers, the Long Shadow), `story7.js`, `main7.js`, `voicebank7.js` (from `audio_pipeline/gen_vo7.py`). Level 7 reuses Level 37's swimming/diving/breath engine, geometry builder, water plane and Fish class on purpose.

## Premise (wiki: Level 7, "Thalassophobia")
A night ocean with abandoned structures and things in the deep. Here, adapted (new canon, needs approval): an oil rig (MERIDIAN) with one radio operator left, a grounded cargo ship (AURELIA), a lighthouse (CAPE SORREL) whose lamp has been dark a year, a seabed habitat (ORCA-2) with a diver still breathing in it, a sunk freighter (HALCYON) and the Long Shadow, a thing in the deep that the lamp keeps down.

## Map (64 x 64 cells, CELL 3.6 m; the sea is x 6-57, y 6-57, the margins hold the ladder-only rooms)
- RIG MERIDIAN (25-37, 24-36), deck +3.0 m. Quarters (mess, radio shack, bunks, corridor), generator house NE, air house SE, derrick and helipad in the middle. Ladders on all four sides.
- SHIP AURELIA (4-15, 39-43), deck +2.4, tilted on a shoal. Two open flooded holds, galley and cabins at the stern, a flooded engine room (fuel) to the south. The ship's bridge is a ladder-only room in the margin.
- CAPE SORREL (28-36, 8-13): a rock islet with a tall tower (ground floor and ladder up to the lamp room, in the margin) and the keeper's cottage. A cable junction box sits on the seabed west of the islet.
- PIER (44-55, 28-33): wooden pier, boathouse, the boat.
- HABITAT ORCA-2 (30-36, 44-48) on the seabed, a dry platform inside an air pocket: Fen.
- WRECK HALCYON (10-20, 50-56), 10 m down; bridge safe and an air pocket.
- THE TRENCH (38-46, 40-58), 28 m deep.
- A line of buoys (lit once the generator runs) from the rig to the cape: the Long Shadow will not hunt inside a light.

## Spine
Arrive on a raft in the water by the rig (night) -> climb a ladder -> Kell in the radio shack ("three things for the lamp: fuel, a motor, and the cable") -> start the GENERATOR (the buoys light, storm begins) -> open the AIR valve so Fen can breathe -> dive to HABITAT ORCA-2: Fen gives the first number of the safe -> the Aurelia: logs, the second number, FUEL from the engine room -> the Halcyon: crack the bridge safe (4-2-7) for the LENS MOTOR (the third number is on the rig's tide board) -> the Cape: Wren in the cottage; splice the CABLE on the seabed -> the lamp room (ladder in the tower): seat fuel, motor and cable, LIGHT THE LAMP: the Shadow rises and goes down, dawn comes -> endings: SAIL (boat, Kell's key), KEEPER (sit with Wren), THE DEEP (the trench).

## Systems
Swimming, diving, breath (Level 37 engine), flares (G), ladders (E), storm phases (night -> storm -> dawn), lit buoys and lit platforms (safe), Gulpers (small fish around the wreck and ship), the Long Shadow (deep water, far from light; flares and the lamp drive it off).

## Endings
SAIL (THE CROSSING), KEEPER (STAYED), THE DEEP. Deaths: DROWNED, SOMETHING IN THE WATER, THE LONG SHADOW.

## Compass note
In this game compass NORTH is +z (yaw 0). The lighthouse (small grid y) is therefore SOUTH of the rig; the habitat and the Halcyon are NORTH / NORTH-WEST of it; the Aurelia is WEST and the pier EAST.

## Systems in code
- Sea: one `sea` room (open-air, `open: true`, 52 x 52 cells) plus a 1800 m far-sea plane so the horizon never ends; the boundary walls are not drawn (collision stays). Seabed depth comes from a BFS distance off every platform (shoals round the ship, islet and pier), a 28 m trench and 10 m round the wreck.
- Platforms are open rooms whose edges to the sea are open edges (you can walk off and fall in); railings and ladders are props with solids. Buildings use the open neighbour's face re-skinned and re-heighted by `fixPieces7`. Submerged rooms (habitat, wreck) have roofs and their own basins for the air pockets (`HAB` -4.0, `WPOCK` -4.6).
- Ladders (`WS7.ladders`) are two interactables each, a short fade between: sea ladders, hold ladders, the engine ladder, the bridge room and the lamp room (rooms in the grid margins you only reach by ladder).
- Weather: night -> storm (after the generator: rain overlay, bigger waves, lightning and thunder) -> dawn (after the lamp). Moonlight is `LV.sky` (open rooms) lit by `FX.envS`. The sky is a camera-following dome shader with a horizon glow for dawn.
- The Long Shadow (`Shadow7`) sleeps until you are on the rig (or 200 s), then patrols deep water; it hunts a swimmer in deep (3.5 m+) unlit water; `lit7()` is true near lamps, buoys (after the generator), the lit lamp, platforms, and under a flare. Flares (G) scare it for 20 s. Bite 34/42/52 by difficulty, then it flees.
- Gulpers: Level 37's Fish class, one in the first hold and three around the wreck, leashed to their region.
- Sanity: the moonlit surface counts as lit; the deep does not.

## Dialogue ledger (backrooms-dialogue skill; strings in story7.js / main7.js; audit in docs/LEVEL7_DIALOGUE_AUDIT.md)
Speakers: KELL (rig radio operator), WREN (lighthouse keeper), FEN (habitat diver), PA (rig PA), M.E.G. OUTPOST 9, DR. HALE (only if saved in Level 9), whispers at low sanity. Documents (not voiced): Kell's radio log, the tide board (third digit), the mess board, Dav's note, the Aurelia's cook, mate's log (second digit) and captain's log, the Halcyon's last radio, Fen's diver's log, Tomas's and Wren's keeper's log, the boathouse notices.

| Speaker | Says | Won't say | Under pressure |
|---|---|---|---|
| Kell | counts things; short, dry; the radio | how long he has really been alone | more precise ("eleven days") |
| Wren | even, practical, naval; Tomas | what the lamp is for | asks a question instead |
| Fen | jokes, apologises, talks to the cable | that he is afraid | funnier |

## New canon (needs approval)
- Level 7's rig MERIDIAN, the Aurelia, Cape Sorrel, the Halcyon and Habitat Orca-2 are original to this game, adapted from the wiki's Level 7 (an ocean with structures and things in the deep).
- Kell (rig radio operator), Wren and the late Tomas Arden (keepers), Fen (diver), Dav (a deckhand who took the dinghy), the Aurelia's cook, mate and captain.
- The lamp keeps something large under the bay down; it is never named or explained (the Long Shadow is this game's name for it).
- The cable down the trench goes further than the gauge reads.

## Verified (headless)
qa7/s7_story.js (the whole chain to THE CROSSING), s7_endings.js (KEEPER, THE DEEP, and that the interactions refuse before the lamp), s7_systems.js (Shadow hunt / flare / bite / flee, Gulper bites, drowning, checkpoint retry), s7_reach.js (solid-aware flood fill from every ladder: every quest target reachable), s7_views.js and s7_weather.js (screenshots). No human playthrough, audio, performance, touch or difficulty review. The Long Shadow's and the sea's balance has not been tuned by hand.
