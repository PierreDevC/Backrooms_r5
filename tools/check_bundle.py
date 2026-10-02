import sys,re,pathlib,subprocess,tempfile
p=pathlib.Path(sys.argv[1]);js="\n".join(re.findall(r"<script>(.*?)</script>",p.read_text(),re.S))
with tempfile.NamedTemporaryFile(suffix='.js',mode='w') as f:
 f.write(js);f.flush();subprocess.run(['node','--check',f.name],check=True)
print('PASS JavaScript syntax')
