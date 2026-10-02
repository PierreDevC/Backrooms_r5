#!/bin/bash
# usage: modes.sh [html]   env LS="0 9 5 18", SEED (page-load seed: Level 0 is built at load for the title screen), SEED2 (seed set just before Levels 9 / 5 / 18 start). For each level and mode (default, ?noskin, ?nomodels, ?noassets) start the level on a fresh page with the
# same seed, log structure / collision hashes (out/modes_L<lv>_<mode>.log) and save the collision boxes, then diff them against the default (modes_diff.py).
D=$(cd "$(dirname "$0")" && pwd); mkdir -p $D/out; cd $D; H=${1:-$D/../game/The_Backrooms_Found_Footage.html}
for L in ${LS:-0 9 5 18}; do for m in default noskin nomodels noassets; do qs=""; [ $m != default ] && qs="&$m"
  BR_QA_OUT=$D/out BR_QS="$qs" SEED=${SEED:-777} TAG=$m LV=$L timeout 900 node run5.js $H $D/modes.js 960 540 > $D/out/modes_L${L}_$m.log 2>&1
  grep -a "QA fb2\|PAGEERROR" $D/out/modes_L${L}_$m.log | sed "s/^/$m /" | cut -c1-260; done; done
python3 $D/modes_diff.py $D/out
