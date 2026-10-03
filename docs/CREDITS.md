# Credits — third-party assets (r5–r7.1)

## r7.1 Howler source audio — CC0
The downloaded originals are retained in `game/tools/audio/src/`; their exact hashes are in `MANIFEST.sha256`. The six game clips are derived by pitch shifting, layering, filtering, distortion, convolution reverb and peak normalisation in `build_howler_audio.js`. These are not samples from Kane Pixels or his films.

| Author | Source / licence page | Retained files |
|---|---|---|
| rubberduck | [80 CC0 creature SFX — OpenGameArt](https://opengameart.org/content/80-cc0-creature-sfx), CC0 | `alien_01.ogg`, `alien_03.ogg`, `alien_06.ogg`, `howl.ogg`, `monster_01.ogg`, `monster_02.ogg`, `monster_03.ogg`, `monster_04.ogg`, `monster_06.ogg`, `monster_07.ogg`, `roar_02.ogg`, `roar_03.ogg`, `scream_01.ogg`, `scream_02.ogg`, `troll_02.ogg`, `troll_03.ogg` |
| trazzz123 | [CC0 Deep Monster Roar — OpenGameArt](https://opengameart.org/content/cc0-deep-monster-roar), CC0 | `monster_roar.wav` |
| Vinrax | [Horror scream1 — OpenGameArt](https://opengameart.org/content/horror-scream1), CC0 | `scream_horror1.mp3` |
| Darsycho | [troll roars.ogg — Freesound 442114](https://freesound.org/people/Darsycho/sounds/442114/), CC0 | `troll-roars.ogg` |

Source licence pages checked 2026-10-02. The 16 rubberduck files were also byte-compared with the author's [original archive](https://opengameart.org/sites/default/files/80-CC0-creature-SFX_0.zip): all match. Generated audio is 32 kHz, mono PCM16 WAV, embedded in `game/src/howlerbank.js`. The first three clips are territorial calls; the other three are chase screams. Raw previews do not include the in-game positional mix. CC0 legal text: https://creativecommons.org/publicdomain/zero/1.0/.

Every third-party asset added in r5 is **CC0 1.0 (public domain)**: no attribution is legally required, but the authors are credited here. The game's own code, procedural textures, Level 18 art and audio are covered by the earlier notes (docs/CREDITS_LEVEL18.md and the audio pipeline). Babylon.js (Apache-2.0) is unchanged and loaded from its CDN; qa/BABYLON_LICENSE.txt covers the offline test copy.

## Photo-scanned PBR textures — ambientCG (CC0)
Source: https://ambientcg.com (1K-JPG downloads: Color, NormalDX, Roughness, AmbientOcclusion, Displacement and Opacity where present). Processed by `tools/process_tex.py` into WebP albedo / normal / ORM sets.

| ambientCG ID | Game key(s) | Link |
|---|---|---|
| Asphalt015 | asph | https://ambientcg.com/view?id=Asphalt015 |
| Carpet002 | kcarpet | https://ambientcg.com/view?id=Carpet002 |
| Carpet007 | gcarpet | https://ambientcg.com/view?id=Carpet007 |
| Carpet013 | hcarpet | https://ambientcg.com/view?id=Carpet013 |
| Carpet016 | l0carpet | https://ambientcg.com/view?id=Carpet016 |
| Concrete012 | bfloor | https://ambientcg.com/view?id=Concrete012 |
| Concrete033 | bconc, block | https://ambientcg.com/view?id=Concrete033 |
| Concrete034 | conc | https://ambientcg.com/view?id=Concrete034 |
| Fence006 | chain | https://ambientcg.com/view?id=Fence006 |
| Grass003 | turf | https://ambientcg.com/view?id=Grass003 |
| Grass004 | grass | https://ambientcg.com/view?id=Grass004 |
| OfficeCeiling001 | l0ceil | https://ambientcg.com/view?id=OfficeCeiling001 |
| PaintedPlaster004 | kwall | https://ambientcg.com/view?id=PaintedPlaster004 |
| PaintedPlaster017 | labwall | https://ambientcg.com/view?id=PaintedPlaster017 |
| Planks021 | planks | https://ambientcg.com/view?id=Planks021 |
| Plaster001 | plaster | https://ambientcg.com/view?id=Plaster001 |
| Plaster002 | hceil | https://ambientcg.com/view?id=Plaster002 |
| RoofingTiles013A | roof | https://ambientcg.com/view?id=RoofingTiles013A |
| Rubber004 | rubber | https://ambientcg.com/view?id=Rubber004 |
| Tiles074 | check | https://ambientcg.com/view?id=Tiles074 |
| Tiles107 | ktile | https://ambientcg.com/view?id=Tiles107 |
| Wallpaper001A | l0paper | https://ambientcg.com/view?id=Wallpaper001A |
| Wallpaper001B | hpaper | https://ambientcg.com/view?id=Wallpaper001B |
| Wallpaper002A | paper9 | https://ambientcg.com/view?id=Wallpaper002A |
| WoodFloor041 | wood9 | https://ambientcg.com/view?id=WoodFloor041 |
| WoodSiding009 | siding | https://ambientcg.com/view?id=WoodSiding009 |

Processed but not packed into the game (no code references them yet; `tools/build_assets.py` packs only referenced sets): fabric (Fabric028), hwood (WoodFloor064), leather (Leather037), metal (Metal032), rust (Rust007), stone (Bricks075A), terrazzo (Terrazzo013), tile9 (Tiles036).

## Prop models — Poly Haven (CC0)
Source: https://polyhaven.com (1k glTF). Simplified offline by `tools/mdl/convert_mdl.mjs` (meshoptimizer decimation, packed 16-bit vertices, two WebP maps per model) using `tools/mdl/spec.json`.

| Poly Haven asset | Game key | Used in | Link |
|---|---|---|---|
| cardboard_box_01 | cbox | Level 0 box stacks, Level 9 storage shelves, Level 5 crates | https://polyhaven.com/a/cardboard_box_01 |
| WetFloorSign_01 | wetsign | Level 0 wet-floor sign | https://polyhaven.com/a/WetFloorSign_01 |
| fire_hydrant | hydrant | Level 9 street | https://polyhaven.com/a/fire_hydrant |
| metal_trash_can | tcan | Level 9 trash cans | https://polyhaven.com/a/metal_trash_can |
| sofa_02 | sofa | Level 9 living rooms, Level 5 lounge | https://polyhaven.com/a/sofa_02 |
| ArmChair_01 | armchair | Levels 9 and 5 (dyed to the room fabric) | https://polyhaven.com/a/ArmChair_01 |
| GreenChair_01 | gchair | Levels 9 and 5 | https://polyhaven.com/a/GreenChair_01 |
| ClassicNightstand_01 | nstand | Levels 9 and 5 bedrooms | https://polyhaven.com/a/ClassicNightstand_01 |
| vintage_suitcase | suitcase | Level 5 corridor clutter | https://polyhaven.com/a/vintage_suitcase |
| Barrel_01 | barrel | Level 5 boiler room | https://polyhaven.com/a/Barrel_01 |
| wooden_crate_02 | crate | Level 5 boiler room | https://polyhaven.com/a/wooden_crate_02 |
| SchoolDesk_01 | sdesk | Level 18 corridor desk | https://polyhaven.com/a/SchoolDesk_01 |
| SchoolChair_01 | schair | Level 18 kid chairs (repainted) and teacher chair | https://polyhaven.com/a/SchoolChair_01 |
| rubber_duck_toy | duck | Level 18 toy bins | https://polyhaven.com/a/rubber_duck_toy |
| garden_gnome | gnome | Level 9 front yards | https://polyhaven.com/a/garden_gnome |
| Television_01 | crt | Level 0 TV cart, Level 9 living rooms | https://polyhaven.com/a/Television_01 |
| steel_frame_shelves_01 | sshelf | Level 9 storage shelves | https://polyhaven.com/a/steel_frame_shelves_01 |

## Characters and animation — Quaternius (CC0)
- **Universal Base Characters** (base humanoid mesh, 65-joint skeleton): https://quaternius.itch.io/universal-base-characters
- **Universal Animation Library** and **Universal Animation Library 2** — 24 clips used (idle, walk, jog, sprint, crouch walk / idle, death, hit, talk, flashlight, interact, push, kneel, punch, zombie idle / walk, scratch, fold, lantern, get-up, knock, hook, no): https://quaternius.itch.io/universal-animation-library and https://quaternius.itch.io/universal-animation-library-2
- Converted by `tools/chr/convert_chr.mjs` (mirrored into Babylon's left-handed space, every clip retargeted onto the base mesh, resampled at 15 fps) and `tools/chr/make_tex.py` (body albedo / normal / eye maps). Role outfits (M.E.G. explorer, Howler, Watch, Wretch, Dr. Hale, Forgotten) are added procedurally in `src/skin.js`.

## Not redistributed
Raw downloads (ambientCG zips, Poly Haven glTF folders, Quaternius zips) are not in this packet; only the processed, game-ready files are, embedded in `game/src/assetpack.js` (`python3 tools/unpack_assets.py` writes them back out to `game/assets/`). Re-download from the links above to re-run the converters.
