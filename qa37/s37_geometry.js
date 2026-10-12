// Level 37 geometry survey: renderer/physics agreement, swimming head clearance,
// actual route movement, and fixed-seed screenshots. Combat isolated explicitly.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
module.exports=async page=>{
 const output=process.env.BR_QA_OUT, baseline=process.env.BR_GEO_BASELINE==='1';
 const check=(ok,label)=>{if(baseline)console.log('BASELINE '+(ok?'PASS ':'MISMATCH ')+label);else{assert.ok(ok,label);console.log('QA PASS '+label);}};
 await page.evaluate(async()=>{const B=window.__BR;B.DBG.ts=0;B.G.diff=1;B.G37.from=null;let seed=3712;const old=Math.random;Math.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};await B.goLevel37(null);Math.random=old;for(let i=0;i<120&&B.G.state!=='play';i++)B.simStep(.05);
 window.GEO={step(s){for(let i=0;i<s*20;i++){B.PL.hp=100;B.G37.breath=1;B.simStep(.05);}},at(x,z,y,yaw=0,pitch=0){Object.assign(B.PL,{x,z,yaw,pitch,vx:0,vz:0,kx:0,kz:0,spd:0,cell:-1,nv:false,flash:false,fk:0,crouch:false});B.K.clear();B.G37.onTower=false;B.G37.vy=0;B.G37.ey=y;this.step(4);B.CAM().getViewMatrix(true);},clear(){B.PL.hp=100;B.PL.shake=0;B.PL.fear=0;B.FX.hurt=B.FX.glitch=0;B.updateHUD(.02);B.worldFX37(0);}}; });
 const geometry=await page.evaluate(()=>{const B=window.__BR,L=B.LV37(),S=B.SCN();const invalid=[],zero=[];let vertices=0,triangles=0;
 for(const m of S.meshes){const p=m.getVerticesData('position'),ix=m.getIndices();if(!p)continue;vertices+=p.length/3;for(const kind of ['position','normal','uv']){const a=m.getVerticesData(kind);if(a&&a.some(v=>!Number.isFinite(v)))invalid.push(m.name+':'+kind);}
 if(ix){triangles+=ix.length/3;if(ix.some(v=>v<0||v>=p.length/3))invalid.push(m.name+':index');}
 m.computeWorldMatrix(true);if(!m.getWorldMatrix().m.every(Number.isFinite))invalid.push(m.name+':transform');if(m.parent?.isDisposed())invalid.push(m.name+':disposed parent');}
 const arch=S.meshes.filter(m=>m.name.startsWith('l37_'));const saved=arch.map(m=>[m,m.isEnabled(),m.isPickable]);for(const m of arch){m.setEnabled(true);m.isPickable=true;}
 const rooms=[];for(const r of L.rooms){const xs=r.cells.map(c=>c%72),zs=r.cells.map(c=>Math.floor(c/72));const cx=(Math.min(...xs)+Math.max(...xs)+1)*1.8,cz=(Math.min(...zs)+Math.max(...zs)+1)*1.8;let cells=r.cells.slice().sort((a,b)=>Math.hypot((a%72+.5)*3.6-cx,(Math.floor(a/72)+.5)*3.6-cz)-Math.hypot((b%72+.5)*3.6-cx,(Math.floor(b/72)+.5)*3.6-cz));const c=cells[0],x=(c%72+.5)*3.6,z=(Math.floor(c/72)+.5)*3.6,fh=L.fh[c],ch=L.ch[c];const hit=(y,dy)=>S.pickWithRay(new BABYLON.Ray(new BABYLON.Vector3(x,y,z),new BABYLON.Vector3(0,dy,0),.2),m=>arch.includes(m));const f=hit(fh+.05,-1),h=hit(ch-.05,1);rooms.push({room:r.t,id:r.id,x,z,floor:fh,ceiling:ch,floorHit:f.hit?f.pickedPoint.y:null,ceilingHit:h.hit?h.pickedPoint.y:null});}
 for(const [m,on,pick]of saved){m.setEnabled(on);m.isPickable=pick;}
 return{invalid,vertices,triangles,rooms,solids:L.solids.length,errors:B.ERRS.n};});
 check(!geometry.invalid.length&&!geometry.errors,'all mesh attributes, indices, parents and transforms are valid');
 for(const r of geometry.rooms){check(r.floorHit!==null&&Math.abs(r.floorHit-r.floor)<.01,r.room+' floor agrees with collision height');check(r.ceilingHit!==null&&Math.abs(r.ceilingHit-r.ceiling)<.01,r.room+' ceiling agrees with height field');}
 fs.writeFileSync(path.join(output,'geometry.json'),JSON.stringify(geometry,null,2));
 const captures=[], views=[];
 const shot=async(name)=>{const frame=await page.evaluate(()=>{GEO.clear();return __BR.SCN().getFrameId();});await page.waitForFunction(f=>__BR.SCN().getFrameId()>f,frame,{timeout:20000});await page.screenshot({path:path.join(output,name+'.png')});captures.push(name);};
 const view=async(name,x,z,y,yaw,pitch=0)=>{const data=await page.evaluate(a=>{GEO.at(...a);const B=__BR,L=B.LV37(),c=B.cell37(B.PL.x,B.PL.z);return{room:L.rooms[L.room[c]]?.t,camera:B.CAM().position.y,ceiling:L.ch[c]};},[x*3.6,z*3.6,y,yaw,pitch]);check(!!data.room&&data.camera<data.ceiling,name+' view is inside rendered room');views.push({name,...data});await shot(name);};
 for(const [name,x,z]of [['hospital_tunnel',25.5,19.5],['park_tunnel',67.5,34.5]]){
  const data=await page.evaluate(([x,z])=>{const B=window.__BR,L=B.LV37();GEO.at(x*3.6,z*3.6,B.floorY37(x*3.6,z*3.6)+.8,Math.PI/2,-.4);GEO.step(25);const c=B.cell37(B.PL.x,B.PL.z);return{floor:L.fh[c],ceiling:L.ch[c],eye:B.G37.ey,camera:B.CAM().position.y,under:B.G37.under};},[x,z]);
  console.log('GEO TUNNEL '+name+' '+JSON.stringify(data));check(data.camera<=data.ceiling-.05&&data.under,name+' buoyancy stays inside submerged roof');await shot(name+'_normal');await page.evaluate(()=>{__BR.PL.nv=true;GEO.step(.8);});await shot(name+'_nv');
 }
 const cases=[['shallow_arch',27.5,36.5,1.07,-Math.PI/2,-.15],['spiral',39.5,33.5,1.07,Math.PI/2,-.25],['pit_drained',35.5,41.5,-.78,0,.3],['hotel_stairs',34.5,45.5,-.78,0,.1],['well_boards',35.5,14.5,.22,Math.PI,-.15],['tower_base',31.5,16.5,.22,-Math.PI/2,-.65],['cabana_props',23.5,36.5,1.76,Math.PI/2,.12],['plant_wheels',16.5,34.5,1.76,-Math.PI/2,.08],['lobby_counter',31.8,49.8,1.62,-Math.PI/2,.15],['cafeteria',45.5,50.5,.22,Math.PI/2,.05],['room204',28.2,50.5,1.62,-2.6,.18],['vault',29.2,53.5,1.62,-2.6,.18],['admissions',24.5,9.5,1.62,0,.1],['ward3',18.5,4.5,1.62,0,.1],['pharmacy',18.5,9.5,1.62,Math.PI,.15],['theatre',39.5,5.5,1.62,0,.1],['dome',63.5,56.5,.22,Math.PI/2,0],['generator',57.5,63.5,1.62,Math.PI,.1],['control',63.5,63.5,1.62,Math.PI,.1],['wave_ghosts',59.5,68.5,.22,-Math.PI/2,0]];
 await page.evaluate(()=>{const B=__BR;B.LV37().basins[B.BAS37.SH].tgt=-2.7;GEO.step(26);});
 for(const args of cases)await view(...args);
 // Collision-driven walk from the pit, up the height-field stairs into the hotel.
 const walk=await page.evaluate(()=>{const B=__BR;GEO.at(34.5*3.6,44.5*3.6,-.78,0);const start=[B.PL.x,B.PL.z];B.K.add('KeyW');GEO.step(8);B.K.delete('KeyW');const c=B.cell37(B.PL.x,B.PL.z);return{start,end:[B.PL.x,B.PL.z],room:B.LV37().rooms[B.LV37().room[c]]?.t,floor:B.floorY37(B.PL.x,B.PL.z),eye:B.G37.ey,state:B.G.state,errors:B.ERRS.n};});
 console.log('GEO WALK '+JSON.stringify(walk));check(walk.room==='lobby'&&walk.state==='play'&&!walk.errors,'player walks pit corridor stairs into hotel without teleport');
 const swim=await page.evaluate(()=>{const B=__BR,L=B.LV37(),run=(name,x,z,yaw,seconds)=>{GEO.at(x*3.6,z*3.6,B.floorY37(x*3.6,z*3.6)+.8,yaw);B.K.add('KeyW');GEO.step(seconds);B.K.delete('KeyW');const c=B.cell37(B.PL.x,B.PL.z);return{name,x:B.PL.x,z:B.PL.z,room:L.rooms[L.room[c]]?.t,eye:B.G37.ey,ceiling:L.ch[c],state:B.G.state};};
 const hospital=run('hospital',25.5,19.5,-Math.PI/2,2.7);
 B.PL.yaw=Math.PI;B.K.add('KeyW');GEO.step(26);B.K.delete('KeyW');hospital.room=L.rooms[L.room[B.cell37(B.PL.x,B.PL.z)]]?.t;hospital.end=[B.PL.x,B.PL.z];
 const park=run('park',67.5,34.5,Math.PI/2,0);B.K.add('KeyW');for(let i=0;i<200&&B.PL.x<69.5*3.6;i++)GEO.step(.05);B.K.delete('KeyW');B.PL.vx=B.PL.vz=0;B.PL.yaw=0;B.K.add('KeyW');GEO.step(26);B.K.delete('KeyW');park.room=L.rooms[L.room[B.cell37(B.PL.x,B.PL.z)]]?.t;park.end=[B.PL.x,B.PL.z];
 const air=[];for(const [x,z]of [[27.5,19.5],[68.5,34.5]]){GEO.at(x*3.6,z*3.6,B.floorY37(x*3.6,z*3.6)+.8,0);GEO.step(16);const c=B.cell37(B.PL.x,B.PL.z);air.push({eye:B.G37.ey,ceiling:L.ch[c],under:B.G37.under});}
 return{hospital,park,air,errors:B.ERRS.n};});
 console.log('GEO SWIM '+JSON.stringify(swim));check(swim.hospital.room==='admissions'&&!swim.errors,'swim hospital tunnel and ascend exit stairs through collision');check(swim.park.room==='plaza','swim park tunnel into plaza through collision');check(swim.air.every(a=>!a.under&&a.eye<a.ceiling),'both air pockets still permit surfacing below their ceilings');
 await page.evaluate(()=>{__BR.climbTower37();GEO.step(6);__BR.CAM().getViewMatrix(true);});await shot('tower_top');
 const tower=await page.evaluate(()=>{const B=__BR,T=B.W37.tower,S=B.SCN();const saved=S.meshes.map(m=>[m,m.isEnabled(),m.isPickable]);for(const [m]of saved){m.setEnabled(true);m.isPickable=true;}const rail=S.pickWithRay(new BABYLON.Ray(new BABYLON.Vector3(T.cx+1.3,T.top+1.15,T.cz),new BABYLON.Vector3(1,0,0),.5));for(const [m,on,pick]of saved){m.setEnabled(on);m.isPickable=pick;}const top={on:B.G37.onTower,eye:B.G37.ey,gap:B.LV37().solids[T.gap].off};B.PL.yaw=Math.PI/2;B.K.add('KeyW');GEO.step(5);B.K.delete('KeyW');return{railHit:rail.hit,top,on:B.G37.onTower,eye:B.G37.ey,under:B.G37.under,gap:B.LV37().solids[T.gap].off,errors:B.ERRS.n};});
 console.log('GEO TOWER '+JSON.stringify(tower));check(!tower.railHit,'open diving edge has no visible rail crossing');check(tower.top.on&&tower.top.gap&&!tower.on&&!tower.gap&&tower.under&&!tower.errors,'tower climb, open edge, fall and collision reset work');
 const fly=await page.evaluate(()=>{const B=__BR;GEO.at(25.5*3.6,19.5*3.6,-5.2);B.S.dev=true;B.S.devOpts.fly=true;B.K.add('Space');GEO.step(4);B.K.clear();const data={camera:B.CAM().position.y,ceiling:B.LV37().ch[B.cell37(B.PL.x,B.PL.z)],errors:B.ERRS.n};B.S.dev=false;B.S.devOpts.fly=false;B.DEV.fy=0;return data;});
 check(fly.camera>fly.ceiling&&!fly.errors,'intentional developer flight can still cross the roof');
 fs.writeFileSync(path.join(output,'captures.json'),JSON.stringify({captures,views,walk,swim,tower,fly},null,2));
};
