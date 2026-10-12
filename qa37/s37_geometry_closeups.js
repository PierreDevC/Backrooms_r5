// Anchor-directed prop screenshots supplement the room/route geometry survey.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
module.exports=async page=>{
 await page.evaluate(async()=>{const B=__BR;B.DBG.ts=0;B.G.diff=1;B.G37.from=null;await B.goLevel37(null);for(let i=0;i<120&&B.G.state!=='play';i++)B.simStep(.05);});
 const views=[];
 for(const [name,key,dx,dz,y] of [['kettle','kettle',0,2.8,.6],['plant_log','plantLog',0,2.8,.82],['booth_tv','tv',0,2.8,1.1],['admissions_desk','admDesk',0,3,1.1],['pharmacy_shelves','drip',0,-2.8,1.4],['nurses_desk','nursesDesk',0,2.8,1],['generator_machine','genSw',0,-3,1.2],['control_console','ctrl',0,-2.8,1],['fountain','fountain',0,3.8,1.1],['ward3_bed','ward3',0,3.2,.8]]){
  const data=await page.evaluate(([key,dx,dz,y])=>{const B=__BR,L=B.LV37(),p=key==='ward3'?L.dry.ward3.bedPos:B.W37.pos[key];if(!p)throw Error('missing prop anchor '+key);const x=p.x+dx,z=p.z+dz,c=B.cell37(x,z),fh=B.floorY37(x,z);Object.assign(B.PL,{x,z,cell:-1,yaw:Math.atan2(-dx,-dz),pitch:Math.atan2(fh+1.62-y,Math.hypot(dx,dz)),vx:0,vz:0,kx:0,kz:0,spd:0,nv:false,flash:false,crouch:false});B.K.clear();B.G37.onTower=false;B.G37.ey=fh+1.62;B.G37.vy=0;for(let i=0;i<90;i++){B.PL.hp=100;B.G37.breath=1;B.simStep(.05);}B.PL.shake=0;B.FX.hurt=B.FX.glitch=0;B.CAM().getViewMatrix(true);B.updateHUD(.02);B.worldFX37(0);return{key,x,z,room:L.rooms[L.room[c]]?.t,camera:B.CAM().position.y,ceiling:L.ch[c],errors:B.ERRS.n,frame:B.SCN().getFrameId()};},[key,dx,dz,y]);
  assert.ok(data.room&&data.camera<data.ceiling&&!data.errors,name+' camera inside room with no errors');
  await page.waitForFunction(f=>__BR.SCN().getFrameId()>f,data.frame,{timeout:20000});
  await page.screenshot({path:path.join(process.env.BR_QA_OUT,name+'.png')});views.push({name,...data});console.log('QA PASS '+name+' prop view '+data.room);
 }
 fs.writeFileSync(path.join(process.env.BR_QA_OUT,'views.json'),JSON.stringify(views,null,2));
};
