# The Backrooms: Found Footage

A found-footage survival-horror game for the browser, built with Babylon.js and shipped as **one HTML file**.
You record on a 1996 camcorder while crossing three levels of the Backrooms:

1. **Level 0 — Found Footage.** A yellow office maze. Find four VHS tapes, learn the exit code, avoid the Howler, Crawler, Smiler and the Mimic.
2. **Level 9 — Darkened Suburbs.** A night-time neighbourhood with enterable two-storey houses. Download data at three terminals, reach the M.E.G. lab, make the cure and take the elevator.
3. **Level 5 — The Hotel.** An art-deco hotel with an endless corridor, a ballroom where a gramophone still plays, wallpaper that stares back and moths drawn to your flashlight. Find three housekeeping keys, go down to the boilers, vent three valves and escape through the emergency exit.

## Play
Open `game/The_Backrooms_Found_Footage.html` in Chrome, Edge, Firefox or Safari (WebGL2 required; internet needed for the Babylon.js CDN).
Controls: WASD/arrows move · mouse look · Shift sprint · C crouch (toggle) · F flashlight · N night vision · Z zoom · E/Enter interact · X alternate action · Q drink water · R swap battery · Tab map (Level 9) · Esc/P pause · M mute. Touch controls appear on phones.
`?level=9` or `?level=5` skips straight to a level; `?debug` exposes developer helpers.

## Build
```bash
cd game && python3 build.py
```
Edit files in `game/src/`, never the built HTML. See `HANDOFF.md` for architecture, tests and status.

## Status (r3 · 2026-09-30)
Levels 0 and 9 playable. Level 5 is new: complete from arrival to ending in headless checks, awaiting a human playtest. Level 5 radio lines are text-only.
