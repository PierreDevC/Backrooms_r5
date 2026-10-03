import argparse
import hashlib
import json
import pathlib
import shutil
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument("--version", default="r7.2")
parser.add_argument("--date", default="2026-10-02")
args = parser.parse_args()
VERSION = args.version
DATE = args.date
OUTPUT = ROOT / "releases" / VERSION
PREFIX = "Backrooms_" + VERSION
LIMIT = 19 * 1024 * 1024
EXCLUDED = {".git", "releases", "node_modules", "__pycache__"}

def included(path):
    relative = path.relative_to(ROOT)
    return path.is_file() and not any(part in EXCLUDED for part in relative.parts) and not path.name.startswith("._") and path.name != ".DS_Store" and path.suffix != ".pyc"

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

files = sorted(path for path in ROOT.rglob("*") if included(path) and path.name != "MANIFEST.sha256")
manifest = f"# sha256  bytes  path  ({VERSION}, {DATE})\n"
manifest += "".join(f"{digest(path)}  {path.stat().st_size:9d}  {path.relative_to(ROOT).as_posix()}\n" for path in files)
(ROOT / "MANIFEST.sha256").write_text(manifest)
files.append(ROOT / "MANIFEST.sha256")
OUTPUT.mkdir(parents=True, exist_ok=True)
archive = OUTPUT / f"Backrooms_Release_and_Handoff_{DATE}_{VERSION}.zip"
with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as bundle:
    for path in files:
        bundle.write(path, f"{PREFIX}/{path.relative_to(ROOT).as_posix()}")
with zipfile.ZipFile(archive) as bundle:
    assert bundle.testzip() is None
    groups = [[]]
    size = 0
    for entry in bundle.infolist():
        cost = entry.compress_size + len(entry.filename.encode()) * 2 + 200
        if cost > LIMIT - 65536:
            raise ValueError("A single compressed file exceeds the upload volume limit: " + entry.filename)
        if size + cost > LIMIT - 65536:
            groups.append([])
            size = 0
        groups[-1].append(entry)
        size += cost
    volumes = []
    for number, entries in enumerate(groups, 1):
        volume = OUTPUT / f"Backrooms_{VERSION}_volume_{number:02d}_of_{len(groups):02d}.zip"
        with zipfile.ZipFile(volume, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as target:
            for entry in entries:
                target.writestr(entry.filename, bundle.read(entry.filename))
        assert volume.stat().st_size < LIMIT
        with zipfile.ZipFile(volume) as target:
            assert target.testzip() is None
        volumes.append(volume)
shutil.copyfile(ROOT / "game/The_Backrooms_Found_Footage.html", OUTPUT / f"The_Backrooms_Found_Footage_{VERSION}.html")
shutil.copyfile(ROOT / "HANDOFF.md", OUTPUT / f"HANDOFF_{DATE}_{VERSION}.md")
instructions = f"# Backrooms {VERSION} release\n\nThe full archive contains {len(files)} files. The smaller ZIP volumes contain the exact same complete file set, partitioned for Notion's 20 MiB upload limit. Download every volume and extract each into the same directory; each uses the shared {PREFIX}/ folder. No binary joining is needed. Verify MANIFEST.sha256 with tools/verify_manifest.py. The full archive is an alternative to downloading the volumes. Play game/The_Backrooms_Found_Footage.html. Audio preview: audio_preview/Howler_r7_1.html. Human listening, real-GPU performance and actual touch review remain pending.\n"
(OUTPUT / "RELEASE_README.md").write_text(instructions)
artifacts = [archive, *volumes, OUTPUT / f"The_Backrooms_Found_Footage_{VERSION}.html", OUTPUT / f"HANDOFF_{DATE}_{VERSION}.md", OUTPUT / "RELEASE_README.md"]
checksums = {path.name: {"bytes": path.stat().st_size, "sha256": digest(path)} for path in artifacts}
(OUTPUT / "RELEASE_CHECKSUMS.json").write_text(json.dumps({"version": VERSION, "date": DATE, "files": len(files), "artifacts": checksums}, indent=2) + "\n")
with zipfile.ZipFile(archive) as bundle:
    full_names = set(bundle.namelist())
volume_names = set()
for volume in volumes:
    with zipfile.ZipFile(volume) as bundle:
        assert not volume_names.intersection(bundle.namelist())
        volume_names.update(bundle.namelist())
assert volume_names == full_names
print(json.dumps({"files": len(files), "output": str(OUTPUT), "artifacts": checksums}, indent=2))
