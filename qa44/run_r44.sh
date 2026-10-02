#!/bin/bash
# r4.4 final-build QA: run each r4.4 suite one at a time against the shipped HTML
H=/data/backrooms/The_Backrooms_Found_Footage.html; R=/data/backrooms_handoff/r4.3; Q=/data/qaCP; O=$Q/final
export CHROMIUM=/usr/local/bin/chromium BR_QA_OUT=$O
cd $R
for t in vis3_first cp9 cpl water; do [ $t = vis3_first ] && { VW=l timeout 900 node qa18/run18.js $H $Q/vis3.js 844 390 > $O/vis3_l.log 2>&1; VW=p timeout 900 node qa18/run18.js $H $Q/vis3.js 390 844 > $O/vis3_p.log 2>&1; echo "vis3 first"; continue; }; timeout 1500 node qa18/run18.js $H $Q/$t.js 960 540 > $O/$t.log 2>&1; echo "$t $?"; done
timeout 1500 node qa18/run18.js $H $Q/crash3.js 640 360 > $O/crash3.log 2>&1; echo "crash3 $?"
timeout 900 node qa18/run18.js $H $Q/crashrf.js 320 180 > $O/crashrf.log 2>&1; echo "crashrf $?"
timeout 900 node qa18/run18.js $H $Q/vis.js 960 540 > $O/vis.log 2>&1; echo "vis $?"
VW=d timeout 900 node qa18/run18.js $H $Q/vis3.js 960 540 > $O/vis3_d.log 2>&1; echo "vis3d $?"
VW=p timeout 900 node qa18/run18.js $H $Q/vis3.js 390 844 > $O/vis3_p.log 2>&1; echo "vis3p $?"
VW=l timeout 900 node qa18/run18.js $H $Q/vis3.js 844 390 > $O/vis3_l.log 2>&1; echo "vis3l $?"
echo ALLDONE
