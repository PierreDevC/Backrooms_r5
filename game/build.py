import pathlib,re
root=pathlib.Path(__file__).parent
tpl=(root/'src/template.html').read_text()
css=(root/'src/style.css').read_text()
order=['audiobank.js', 'assetpack.js', 'util.js', 'shaders.js', 'assets.js', 'models.js', 'textures.js', 'textures9.js', 'textures5.js', 'textures18.js', 'level.js', 'level9.js', 'level5.js', 'level18.js', 'audio.js', 'audio9.js', 'audio5.js', 'audio18.js', 'actors.js', 'skin.js', 'world.js', 'places0.js', 'world9.js', 'story9.js', 'places9.js', 'world5.js', 'story5.js', 'world18.js', 'story18.js', 'player.js', 'ai.js', 'ai9.js', 'ai5.js', 'ai18.js', 'briefimg.js', 'briefimg9.js', 'brief.js', 'story.js', 'checkpoint.js', 'ui.js', 'main.js', 'main9.js', 'main5.js', 'main18.js']
js='\n'.join(f'// ==== {n} ====\n'+(root/'src'/n).read_text() for n in order)
out=tpl.replace('/*__CSS__*/',css).replace('/*__JS__*/',"(()=>{'use strict';\n"+js+"\n})();")
(root/'The_Backrooms_Found_Footage.html').write_text(out)
print('built',len(out))
