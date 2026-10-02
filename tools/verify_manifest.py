import sys,pathlib,hashlib
r=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '.');n=0
for line in (r/'MANIFEST.sha256').read_text().splitlines():
 if not line or line.startswith('#'):continue
 h,size,rel=line.split(None,2);p=r/rel;assert p.stat().st_size==int(size),rel;assert hashlib.sha256(p.read_bytes()).hexdigest()==h,rel;n+=1
print('PASS',n,'manifest files')
