#!/bin/bash
# r5 regression: reruns the r4.4 suites of this packet (qa18 / qa9 / qa5 / qa44), one at a time, against an HTML (default game/*.html)
# usage: qa_r5/reg_r5.sh [html]   env SUITES="levels cp9 ..." (subset), O=log dir (default qa_r5/logs/reg), TO=timeout per suite (s)
D=$(cd "$(dirname "$0")" && pwd); R=$(cd $D/.. && pwd); H=${1:-$R/game/The_Backrooms_Found_Footage.html}; O=${O:-$D/logs/reg}
mkdir -p $O; export BR_QA_OUT=$O; cd $R
run(){ n=$1; shift; t0=$(date +%s); timeout ${TO:-1500} "$@" > $O/$n.log 2>&1; echo "$n exit $? $(( $(date +%s)-t0 ))s $(grep -ac 'PAGEERROR\|Error:' $O/$n.log) err-lines"; }
for s in ${SUITES:-s18_smoke s18_more s18_final hearing wretch_speed levels s9_to5 brief9 cp9 cpl crash3 crashrf water levels_mobile}; do case $s in
  s18_smoke|s18_more|s18_final) run $s node qa18/run18.js $H $R/qa18/$s.js 960 540;;
  hearing|wretch_speed) run $s node qa18/run18.js $H $R/qa9/$s.js 960 540;;
  levels) run $s node qa18/run18.js $H $R/qa18/s_levels.js 960 540;;
  s9_to5) run $s node qa5/run5.js $H $R/qa5/s9_to5.js 960 540;;
  brief9) run $s env BR_SHOW_BRIEF9=1 node qa18/run18.js $H $R/qa9/brief9.js 960 540;;
  cp9|cpl|water) run $s node qa18/run18.js $H $R/qa44/$s.js 960 540;;
  crash3) run $s node qa18/run18.js $H $R/qa44/crash3.js 640 360;;
  crashrf) run $s node qa18/run18.js $H $R/qa44/crashrf.js 320 180;;
  levels_mobile) run $s node qa18/run18.js $H $R/qa18/s_levels_mobile.js 390 844;;
esac; done
echo ALLDONE
