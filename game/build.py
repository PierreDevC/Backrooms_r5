import pathlib,re
root=pathlib.Path(__file__).parent
tpl=(root/'src/template.html').read_text()
css=(root/'src/style.css').read_text()
order=['audiobank.js', 'howlerbank.js', 'voicebank37.js', 'voicebank2.js', 'voicebank7.js', 'assetpack.js', 'util.js', 'shaders.js', 'assets.js', 'models.js', 'textures.js', 'textures9.js', 'textures5.js', 'textures18.js', 'level.js', 'level9.js', 'level5.js', 'level18.js', 'audio.js', 'audio9.js', 'audio5.js', 'audio18.js', 'actors.js', 'skin.js', 'world.js', 'places0.js', 'world9.js', 'story9.js', 'places9.js', 'windows9.js', 'hack9.js', 'world5.js', 'story5.js', 'places5.js', 'state5.js', 'portal5.js', 'world18.js', 'story18.js', 'places18.js', 'memories18.js', 'player.js', 'ai.js', 'ai9.js', 'ai5.js', 'moths5.js', 'ai18.js', 'briefimg.js', 'briefimg9.js', 'brief.js', 'story.js', 'checkpoint.js', 'nav.js', 'ui.js', 'main.js', 'main9.js', 'main5.js', 'textures37.js', 'level37.js', 'audio37.js', 'world37.js', 'hub37.js', 'decor37.js', 'wings37.js', 'story37.js', 'storywings37.js', 'ai37.js', 'main37.js', 'textures2.js', 'level2.js', 'audio2.js', 'world2.js', 'props2.js', 'story2.js', 'ai2.js', 'main2.js', 'textures7.js', 'level7.js', 'audio7.js', 'world7.js', 'props7.js', 'props7b.js', 'story7.js', 'ai7.js', 'main7.js', 'main18.js']
js='\n'.join(f'// ==== {n} ====\n'+(root/'src'/n).read_text() for n in order)
out=tpl.replace('/*__CSS__*/',css).replace('/*__JS__*/',"(()=>{'use strict';\n"+js+"\n})();")
(root/'The_Backrooms_Found_Footage.html').write_text(out)
print('built',len(out))
