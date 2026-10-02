#!/bin/bash
# usage: chrshots.sh TAG LV 'SHOTS-JSON' [html]   e.g. chrshots.sh roles 0 '[{"spawn":"howl","d":3.2,"pitch":-0.15},{"spawn":"exp","d":2.6,"clip":"death","ct":9}]'
# spawn roles: exp howl watch wretch subject hale forgotten (or "who": exp/howl/watch/wretch/hale/subject + "idx" for agents already in the level) -> out/chr/<TAG>_<i>.jpg
D=$(cd "$(dirname "$0")" && pwd); mkdir -p $D/out/chr; cd $D
BR_QA_OUT=$D/out SEED=${SEED:-12345} TAG=$1 LV=$2 SHOTS="$3" timeout 900 node run5.js ${4:-$D/../game/The_Backrooms_Found_Footage.html} $D/chr.js 800 600 > $D/out/chr_$1.log 2>&1
grep -a "QA chr\|PAGEERROR\|rror" $D/out/chr_$1.log | head -12 | cut -c1-400
