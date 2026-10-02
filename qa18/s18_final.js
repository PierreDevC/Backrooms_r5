module.exports=async(page,logs)=>{
const ev=fn=>page.evaluate(fn),assert=(v,n)=>{if(!v)throw Error(n);logs.push('QA PASS '+n);};
const shot=async n=>{await page.waitForTimeout(1000);await page.screenshot({path:process.env.BR_QA_OUT+'/'+n+'.png'});};
const pos=async(x,z,yaw,pitch=0)=>page.evaluate(([x,z,yaw,pitch])=>{const B=window.__BR;Object.assign(B.PL,{x,z,yaw,pitch,vx:0,vz:0,hp:100,san:100});B.updateField();B.playerCamera(1/30);B.worldFX18(1/30);},[x,z,yaw,pitch]);
if(process.env.BR_ONLY18){await ev(()=>{const B=window.__BR;B.DBG.ts=15;B.DBG.god=true;B.goLevel18(null);});await page.waitForFunction(()=>document.body.classList.contains('lvl18')&&window.__BR.G.state==='play',null,{timeout:300000});} else {
await ev(()=>{const B=window.__BR;B.DBG.ts=15;B.DBG.god=true;B.startGame(true);});await page.waitForFunction(()=>window.__BR.G.state==='play',null,{timeout:180000});
await ev(()=>{const B=window.__BR;for(const t of B.W.tapes)B.takeTape(t);B.win();});await page.waitForFunction(()=>document.body.classList.contains('lvl9')&&window.__BR.G.state==='play',null,{timeout:300000});assert(await ev(()=>window.__BR.G9.from.tapes===4),'L0 -> L9');
await ev(()=>window.__BR.win9());await page.waitForFunction(()=>document.body.classList.contains('lvl5')&&window.__BR.G.state==='play',null,{timeout:300000});assert(await ev(()=>window.__BR.W5.keys.length===3),'L9 -> L5');
await ev(()=>{const B=window.__BR;for(const k of B.W5.keys)B.takeKey5(k);B.unlockStaff5(B.W5.svDoor);for(const v of B.W5.valves)B.finishValve5(v);B.useExit5();});await page.waitForFunction(()=>document.body.classList.contains('lvl18')&&window.__BR.G.state==='play',null,{timeout:300000});assert(await ev(()=>window.__BR.W18.drawings.length===4),'L5 keys/valves -> L18');
}
await ev(()=>{const B=window.__BR;B.DBG.ts=0;B.SUBS.q=[];B.SUBS.cur=null;document.getElementById('subs').innerHTML='';document.getElementById('toast').classList.remove('show');B.G18.flash=0;B.FX.fadeW=B.FX.fadeB=0;B.setPhase18('memories');B.G18.whisperT=999;B.G18.gigT=999;B.S.vhs=0.55;});
await pos(99,98,0);await ev(()=>{document.getElementById('toast').textContent='BRIGHT ROOMS ARE SAFE · KEEP YOUR LIGHT READY';document.getElementById('toast').classList.add('show');});await shot('slides_fixed');
assert(await ev(()=>{const r=document.getElementById('toast').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;}),'desktop hint fits');await ev(()=>document.getElementById('toast').classList.remove('show'));
await pos(39,70,Math.PI,-0.06);await shot('class_clean');await pos(51,84,Math.PI,0.2);await shot('nap_clean');await pos(122.4,103,0,0.04);await shot('bed_clean');
// Hold beam before contact, independently from frame time.
await ev(()=>{const B=window.__BR;B.DBG.god=false;Object.assign(B.PL,{x:131.4,z:77.4,yaw:0,pitch:0,flash:true,fk:1,hp:100});B.updateField();B.playerCamera(1/30);B.PL.bdir.set(0,0,1);const f=B.AI18.fog[0];f.place(131.4,87,Math.PI);Object.assign(f,{st:'hunt',stT:0,burn:0,present:true});for(let i=0;i<39;i++)f.update(1/30);console.log('QA BEAM '+JSON.stringify({burn:f.burn,st:f.st,hp:B.PL.hp}));});assert(await ev(()=>window.__BR.AI18.fog[0].st==='fade'&&window.__BR.PL.hp===100),'beam repels before contact');
await ev(()=>{const B=window.__BR,f=B.AI18.fog[0];B.PL.fk=0;B.PL.hp=100;B.PL.lastHurt=-99;f.place(B.PL.x,B.PL.z+0.4,Math.PI);Object.assign(f,{st:'hunt',stT:0,burn:0,present:true});f.update(0.1);});assert(await ev(()=>window.__BR.PL.hp===66),'Forgotten normal hit 34');
await ev(()=>{const B=window.__BR,f=B.AI18.fog[0];B.DBG.god=true;B.PL.x=39;B.PL.z=68;B.updateField();f.place(131.4,83,0);const x=f.x,z=f.z;f.st='hunt';f.stT=0;f.update(0.1);console.log('QA SAFE '+JSON.stringify({bright:B.W18.bright[B.PL.cell],moved:Math.hypot(x-f.x,z-f.z)}));});
assert(await ev(()=>window.__BR.W18.bright[window.__BR.PL.cell]===1),'class sanctuary');
// Interact with the bedside picture from the side (bed is solid).
await ev(()=>{const B=window.__BR;const d=B.W18.drawings.find(d=>d.id==='monster');Object.assign(B.PL,{x:d.x+0.9,z:d.z-0.8,pitch:0.15,yaw:Math.atan2(-0.9,0.8)});B.updateField();B.playerCamera(1/30);B.updatePlayer(1/30);console.log('QA FOCUS '+(B.PL.focus&&B.PL.focus.label()));});
assert(await ev(()=>window.__BR.PL.focus?.label()==='TAKE THE DRAWING'),'bedside drawing interaction reachable');await ev(()=>window.__BR.interact());
await ev(()=>{const B=window.__BR;for(let i=0;i<100;i++)B.simStep(1/30);});assert(await ev(()=>window.__BR.W18.closet.want===1),'closet opens after memory');
await ev(()=>{const B=window.__BR;B.DBG.ts=0;B.SUBS.q=[];B.SUBS.cur=null;document.getElementById('subs').innerHTML='';for(const d of B.W18.drawings)B.takeDrawing18(d);B.pinDrawings18();});
await ev(()=>{const B=window.__BR;for(let i=0;i<150;i++)B.simStep(1/30);B.SUBS.q=[];B.SUBS.cur=null;document.getElementById('subs').innerHTML='';document.getElementById('toast').classList.remove('show');});
await pos(32,64.8,-Math.PI/2);await shot('door_clean');await pos(36,60.5,Math.PI,0);await shot('board_clean');
await ev(()=>{window.__BR.win18();window.__BR.DBG.ts=16;});await page.waitForFunction(()=>document.getElementById('endTitle').textContent==='YOU REMEMBERED',null,{timeout:60000});await shot('ending_final');
await page.setViewportSize({width:390,height:844});await shot('ending_mobile');
assert(await ev(()=>{const r=document.getElementById('end').getBoundingClientRect();return document.documentElement.scrollWidth<=innerWidth;}),'mobile ending no horizontal overflow');
await ev(()=>window.__BR.restartGame(false));await page.waitForFunction(()=>window.__BR.G.state==='title',null,{timeout:300000});await shot('title_mobile');
};
