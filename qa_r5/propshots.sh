#!/bin/bash
# usage: propshots.sh TAG LV [KS] [PICK] [html]   (env D = distance, FL = flashlight, AT="x,y,z;..." explicit targets, BR_QS) -> out/props/<TAG>_<i>_<kind>.jpg
D0=$(cd "$(dirname "$0")" && pwd); mkdir -p $D0/out/props; cd $D0
BR_QA_OUT=$D0/out SEED=${SEED:-12345} TAG=$1 LV=$2 KS="$3" PICK="${4:-0}" timeout 1200 node run5.js ${5:-$D0/../game/The_Backrooms_Found_Footage.html} $D0/props.js 960 540 > $D0/out/props_$1.log 2>&1
grep -a "QA props\|PAGEERROR\|rror" $D0/out/props_$1.log | head -40 | cut -c1-300
