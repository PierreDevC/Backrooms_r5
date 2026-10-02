| Check | Result |
|---|---|
| Bundle syntax (`node --check`), duplicate top-level names | Pass (no duplicates) |
| Boot → title (Level 0 scene) | Pass, ~2 s load, only `net::ERR_FAILED` (blocked Google Fonts in the runner) |
| Level 0 start → play; HUD tapes/code/signal | Pass (TAPES 0/4, CODE _ _ _ _, signal visible) |
| Level 9 load → play | Pass: 32 houses, 19 enterable, objective "FIND THE M.E.G. OUTPOST · NORTH-EAST", 954 meshes |
| Level 9 win → Level 5 transition with carry-over | Pass: body `lvl5`, resources carried (hp floor 75, spare 3), `br_l5` stored |
| Level 5 load → elevator intro → play | Pass: ~4.5 s load, 340–349 meshes, 6 moths, 3 keys, 3 valves, 27–29 doors, 19–21 guest rooms |
| Level 5 screenshots: lobby, ballroom ×2, loop corridor, guest room + door, landing, boiler halls, exit, moth | Rendered correctly (see docs/screenshots/contact*.png) |
| Level 5 objective chain (debug calls): 3 keys → staff door → stairs teleport → 3 valves → EXIT sign green → exit → win camera → end screen | Pass: "YOU ESCAPED THE HOTEL", button "PLAY AGAIN (LEVEL 0)" |
| Moth hunt near player | Pass: attack applied (hp 100→84, sanity →81), compass blip listed |
| Death by moth → end screen → Retry | Pass: "THE MOTHS CAME FOR YOUR LIGHT", "RETRY LEVEL 5" rebuilds Level 5 at phase `arrive` |
| Return to title after ending | Pass: LVL 0, body classes cleared, "CONTINUE: LEVEL 5" shown |
| PAGEERROR / unhandled rejections in all runs | None |
