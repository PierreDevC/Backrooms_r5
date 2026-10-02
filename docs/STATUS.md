# Status — r5

r5: scanned PBR surfaces (27 ambientCG sets) in every level, skinned + motion-captured characters (Quaternius base mesh, 24 clips) for explorers / bodies, Howler, Watch, Wretches / Subject, Dr. Hale and the Forgotten, 17 scanned Poly Haven props, movement substeps and enemy personal space; ?noassets / ?noskin / ?nomodels fall back to the procedural look with identical layouts. Checked headless (all r4.4 suites rerun on the r5 build with the same results, visual captures of every model kind and character, before/after views, same-seed layout check of the three fallback modes); real-GPU look, frame rate and load time are not yet checked by a human.

r4.4: checkpoints on Easy/Normal in Levels 0, 9, 5 and 18 (death → RETRY FROM CHECKPOINT keeps the level's progress; Nightmare still restarts), Level 9 in SELECT LEVEL, right-click door latch, crash safety (Ctrl no longer crouches, leave-page confirmation, frame loop survives one bad frame) and more almond water on Easy/Normal. Checked headless with qa44 tests on the final build; Pierre's third-computer crash was not reproduced headless, so a human retest on his machine is pending.

r4.3: Level 9 house Wretches are hearing-only (noise × distance → suspicion → wake/chase/lose), Level 9 has a NOISE meter with a hearing-limit mark, and a 4-slide LEVEL 9 BRIEFING shows on first arrival and from pause. Checked headless with qa9/hearing.js and qa9/brief9.js (desktop and phone sizes). Human tuning of the hearing distances is still pending.

Implemented: Level 0 → 9 → 5 → 18 and L18 memory quest/ending. Source and HTML match; versioned source/assets/handoff and QA evidence included.

Checked: automated headless load/progression/transitions, Dino route, slide landing, flashlight/contact/safe class, bedside interaction/closet, retry/continue, visual scenes and phone ending/notes. See QA.md for exact limits and corrected test false negatives.

Still pending: human real-GPU full journey, balance/FPS, headphone listening, actual touch gameplay; recorded L5/L18 dialogue. Current voice models/raw outputs remain external, but build/play does not require them. User reference image originals are not redistributed; credit notes included.

Every change must refresh all artifacts/docs/checksums and sync Notion. No filesystem watcher or automatic external-harness sync is implied.
