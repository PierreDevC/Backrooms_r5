module.exports=async(page,logs)=>{
const ev=fn=>page.evaluate(fn),shot=async n=>{await page.waitForTimeout(1600);await page.screenshot({path:(process.env.BR_QA_OUT+'/')+n+'.png'});};
const tp=async(x,z,yaw,pitch=0)=>page.evaluate(([x,z,yaw,pitch])=>{const B=window.__BR;Object.assign(B.PL,{x,z,yaw,pitch,vx:0,vz:0,hp:100,san:100});},[x,z,yaw,pitch]);
await ev(()=>{const B=window.__BR;B.DBG.ts=8;B.DBG.god=true;B.goLevel18(null);});await page.waitForFunction(()=>window.__BR.G.state==='play',null,{timeout:300000});
// Follow the guide without overriding its state or door state.
await tp(22,73.8,Math.PI/2);await ev(()=>{const B=window.__BR;for(let i=0;i<1300;i++){const d=B.AI18.dino;B.PL.x=d.x-1.8;B.PL.z=d.z+0.6;B.updateAI18(1/30);B.worldFX18(1/30);}console.log('QA natural dino '+JSON.stringify({st:B.AI18.dino.st,pos:[B.AI18.dino.x,B.AI18.dino.z],phase:B.G18.phase,door:B.W18.classDoor.open,fog:B.AI18.fog.length}));});
await tp(39.5,70.5,Math.PI,-0.08);await shot('class_full');
await tp(99,98,0,-0.04);await shot('slides_full');
await tp(70.2,86.5,Math.PI,0);await shot('yellow_full');
await tp(54,82,0,-0.05);await shot('nap');
await tp(122.5,101,Math.PI/2,0);await shot('bedroom_full');
await tp(131.4,75,Math.PI,0);await shot('void');
// Slide camera finishes and the landing survives collision.
for(const id of ['red','yellow','blue','green']){
 await page.evaluate(id=>{const B=window.__BR,S=B.W18.slides.find(s=>s.id===id);B.startSlide18(S);for(let i=0;i<100;i++){B.playerCamera(1/30);B.gameEvents18(1/30);}B.updatePlayer(1/30);console.log('QA slide '+id+' '+JSON.stringify({slide:!!B.G18.slide,pos:[B.PL.x,B.PL.z],target:B.SLIDE_TO18[S.to](),speed:B.PL.spdK}));},id);
}
// Beam rejection, damage, and safe cells.
await ev(()=>{const B=window.__BR;B.DBG.god=false;Object.assign(B.PL,{x:131.4,z:77.4,yaw:0,pitch:0,flash:true,fk:1,hp:100,san:100});B.playerCamera(0.016);B.PL.bdir.set(0,0,1);const f=B.AI18.fog[0];f.place(131.4,83,Math.PI);f.st='hunt';f.present=true;f.stT=0;for(let i=0;i<45;i++)f.update(1/30);console.log('QA beam '+JSON.stringify({st:f.st,burn:f.burn,hp:B.PL.hp}));});
await ev(()=>{const B=window.__BR,f=B.AI18.fog[0];B.PL.flash=false;B.PL.fk=0;B.PL.hp=100;B.PL.lastHurt=-99;f.place(B.PL.x,B.PL.z+0.4,Math.PI);f.st='hunt';f.stT=0;f.burn=0;f.present=true;f.update(0.1);console.log('QA hit '+JSON.stringify({hp:B.PL.hp,cause:B.G.cause,st:f.st}));B.DBG.god=true;});
// All four interactions reachable within configured radius and drawing texture alive.
logs.push('QA anchors '+JSON.stringify(await ev(()=>{const B=window.__BR,L=B.LV18();return B.W18.drawings.map(d=>({id:d.id,pos:[d.x,d.y,d.z],disposed:d.S.mesh.isDisposed(),bright:B.W18.bright[Math.floor(d.z/3.6)*40+Math.floor(d.x/3.6)]}));})));
await ev(()=>window.__BR.die('forgotten'));await page.waitForFunction(()=>document.getElementById('endTitle').textContent==='FORGOTTEN',null,{timeout:60000});await shot('death');
await ev(()=>window.__BR.restartGame(true));await page.waitForFunction(()=>window.__BR.G.state==='play',null,{timeout:300000});logs.push('QA retry '+JSON.stringify(await ev(()=>({drawings:window.__BR.G18.found,phase:window.__BR.G18.phase}))));
// L5 success must transition into L18 (not show an end screen).
await ev(()=>{window.__BR.DBG.ts=12;window.__BR.goLevel5(null);});await page.waitForFunction(()=>window.__BR.G.state==='play'&&window.__BR.W5.elev&&!window.__BR.W5.elev.root?.isDisposed(),null,{timeout:300000}).catch(()=>{});
await ev(()=>{const B=window.__BR;B.G.time=123;B.PL.water=4;B.G5.phase='exit';B.win5();});await page.waitForFunction(()=>document.body.classList.contains('lvl18')&&window.__BR.G.state==='play',null,{timeout:300000});logs.push('QA L5 -> L18 '+JSON.stringify(await ev(()=>({time:window.__BR.G.time,water:window.__BR.PL.water,phase:window.__BR.G18.phase,from:window.__BR.G18.from}))));
await ev(()=>window.__BR.restartGame(false));await page.waitForFunction(()=>window.__BR.G.state==='title',null,{timeout:300000});await shot('title');logs.push('QA continue '+await ev(()=>{window.__BR.openLevels();return !!document.querySelector('.lvPick[data-level="18"]');}));   // r5: the r4 Continue Level 18 button (#btnL18) was replaced by SELECT LEVEL in r4.1
};
