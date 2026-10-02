#!/bin/bash
# r4.4 regression: run r4.3 suites one at a time against the new HTML
H=/data/backrooms/The_Backrooms_Found_Footage.html; R=/data/backrooms_handoff/r4.3; O=/data/qaCP/reg2
export CHROMIUM=/usr/local/bin/chromium BR_QA_OUT=$O
cd $R
timeout 1500 node qa18/run18.js $H $R/qa9/hearing.js 960 540 > $O/hearing.log 2>&1; echo "hearing $?"
timeout 900 node qa18/run18.js $H $R/qa9/wretch_speed.js 960 540 > $O/wretch_speed.log 2>&1; echo "wretch_speed $?"
timeout 1500 node qa18/run18.js $H /data/qaCP/s_levels_r44.js 960 540 > $O/levels_r44.log 2>&1; echo "levels $?"
timeout 1500 node qa5/run5.js $H $R/qa5/s9_to5.js 960 540 > $O/s9_to5.log 2>&1; echo "s9_to5 $?"
BR_SHOW_BRIEF9=1 timeout 900 node qa18/run18.js $H $R/qa9/brief9.js 960 540 > $O/brief9_desk.log 2>&1; echo "brief9 $?"
BR_SHOW_BRIEF9=1 timeout 900 node qa18/run18.js $H $R/qa9/brief9.js 390 844 > $O/brief9_m390.log 2>&1; echo "brief9m $?"
timeout 900 node qa18/run18.js $H $R/qa18/s_levels_mobile.js 390 844 > $O/levels_mobile.log 2>&1; echo "levels_mobile $?"
echo ALLDONE
