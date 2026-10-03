import argparse
import os
import pathlib
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[1]
SUITES = {
    "howler": "qa_r7/l0_howler.js",
    "l0_story": "qa_r6/l0_story.js",
    "checkpoints": "qa44/cpl.js",
    "cp9": "qa44/cp9.js",
    "l9_story": "qa_r6/l9_story.js",
    "l5_state": "qa_r7/l5_state.js",
    "l18_name": "qa_r7/l18_name.js",
    "piano_clues": "qa_r7/l18_piano_clues.js",
    "l18_final": "qa18/s18_final.js",
    "levels": "qa18/s_levels.js",
    "levels_mobile": "qa18/s_levels_mobile.js",
    "transitions": "qa5/s9_to5.js",
}
parser = argparse.ArgumentParser()
parser.add_argument("suites", nargs="*")
parser.add_argument("--query", default="")
parser.add_argument("--out", default=str(ROOT / "qa_r7/logs/r7_2"))
args = parser.parse_args()
if any(name not in SUITES for name in args.suites):
    parser.error("Unknown suite; choose from " + ", ".join(SUITES))
failed = []
for name in args.suites or SUITES:
    output = pathlib.Path(args.out) / name
    output.mkdir(parents=True, exist_ok=True)
    environment = dict(os.environ, BR_QA_OUT=str(output), BR_QA_QUERY=args.query)
    command = ["node", str(ROOT / "qa18/run18.js"), str(ROOT / "game/The_Backrooms_Found_Footage.html"),
               str(ROOT / SUITES[name]), "960", "540"]
    started = time.monotonic()
    with (output / "run.log").open("w") as log:
        try:
            result = subprocess.run(command, env=environment, stdout=log, stderr=subprocess.STDOUT, timeout=600)
            passed = result.returncode == 0
        except subprocess.TimeoutExpired:
            log.write("\nQA FAIL runner timeout\n")
            passed = False
    content = (output / "run.log").read_text()
    passed = passed and not any(marker in content for marker in ("QA FAIL", "PAGEERROR", "[recovered ", "QA PAGE CRASH", "UnhandledPromiseRejection"))
    print(f"{name}: {'PASS' if passed else 'FAIL'} ({time.monotonic() - started:.1f}s) {output / 'run.log'}", flush=True)
    if not passed:
        failed.append(name)
        print(content[-5000:], flush=True)
sys.exit(bool(failed))
