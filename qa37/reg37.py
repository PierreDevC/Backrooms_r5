"""Strict Level 37 audit runner. Set NODE_PATH and CHROMIUM for local Playwright."""
import argparse
import os
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SUITES = {'progression': 's37_audit.js', 'branches': 's37_branches.js',
          'chain': 's37_chain2.js', 'reach': 's37_reach.js', 'render': 's37_render_audit.js',
          'downstream': 's37_downstream.js', 'geometry': 's37_geometry.js',
          'closeups': 's37_geometry_closeups.js'}
parser = argparse.ArgumentParser()
parser.add_argument('suites', nargs='*', metavar='SUITE', help=', '.join(SUITES))
parser.add_argument('--query', default='')
parser.add_argument('--out', default=str(ROOT / 'qa37/logs/reg37'))
args = parser.parse_args()
if any(name not in SUITES for name in args.suites):
    parser.error('unknown suite; choose from ' + ', '.join(SUITES))
failed = []
for name in args.suites or SUITES:
    output = Path(args.out).resolve() / name
    output.mkdir(parents=True, exist_ok=True)
    env = dict(os.environ, BR_QA_OUT=str(output), BR_QA_QUERY=args.query)
    with (output / 'run.log').open('w') as log:
        try:
            run = subprocess.run(['node', str(ROOT / 'qa18/run18.js'),
                                  str(ROOT / 'game/The_Backrooms_Found_Footage.html'),
                                  str(ROOT / 'qa37' / SUITES[name]), '960', '540'],
                                 env=env, stdout=log, stderr=subprocess.STDOUT, timeout=600)
            ok = run.returncode == 0
        except subprocess.TimeoutExpired:
            log.write('\nQA FAIL runner timeout\n')
            ok = False
    content = (output / 'run.log').read_text()
    ok = ok and not any(s in content for s in ['QA FAIL', 'PAGEERROR', '[recovered ', 'QA PAGE CRASH', 'UnhandledPromiseRejection'])
    print(f'{name}: {"PASS" if ok else "FAIL"} {output / "run.log"}', flush=True)
    if not ok:
        failed.append(name)
        print(content[-4000:])
sys.exit(bool(failed))
