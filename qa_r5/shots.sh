#!/bin/bash
# usage: shots.sh TAG LVLS [html] [W H]   seeded views of each level (env SEED, BR_QS) -> out/L<lv>_<TAG><i>.jpg, log out/vis5_<TAG>.log
D=$(cd "$(dirname "$0")" && pwd); mkdir -p $D/out; cd $D
BR_QA_OUT=$D/out SEED=${SEED:-12345} TAG=$1 LVLS=$2 timeout 1200 node run5.js ${3:-$D/../game/The_Backrooms_Found_Footage.html} $D/vis5.js ${4:-960} ${5:-540} > $D/out/vis5_$1.log 2>&1
grep -a "QA vis5\|PAGEERROR\|error" $D/out/vis5_$1.log | head -8 | cut -c1-300
