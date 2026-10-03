import base64
import json
import pathlib
import re
import shutil

root = pathlib.Path(__file__).resolve().parents[2]
capture = root / "qa_r7/logs/r7_1/howler/r7_1_howler.png"
target = root / "brief/r7_1_howler.png"
shutil.copyfile(capture, target)
slides = [root / f"brief/s{number}.webp" for number in range(1, 4)] + [target]
images = [f"data:image/{slide.suffix[1:]};base64," + base64.b64encode(slide.read_bytes()).decode() for slide in slides]
(root / "game/src/briefimg.js").write_text("const BRIEF_IMG = " + json.dumps(images) + ";\n")
bank = (root / "game/src/howlerbank.js").read_text()
clips = json.loads(re.search(r"Object.assign\(ABANK, (\{.*?\})\);", bank).group(1))
players = "\n".join(f'<section><h2>{name}</h2><audio controls preload="none" src="data:audio/wav;base64,{data}"></audio></section>' for name, data in clips.items())
preview = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Howler r7.1 audio preview</title><style>body{font:18px system-ui;max-width:700px;margin:40px auto;padding:16px;background:#181818;color:#eee}audio{width:100%}</style><h1>Howler r7.1</h1><p>Start with low headphone volume. No autoplay. hcall: territorial call; hsee: chase scream. These are dry bank previews, not the in-game distance/wall/master-volume mix.</p>' + players + '</html>\n'
(root / "audio_preview/Howler_r7_1.html").write_text(preview)
print("Generated briefing image bank and six-clip audio preview")
