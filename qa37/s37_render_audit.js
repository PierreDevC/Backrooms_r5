const path=require('node:path');
module.exports=async page=>{
 await page.evaluate(async()=>{const B=window.__BR;B.DBG.ts=0;B.G.diff=1;B.G37.from=null;await B.goLevel37(null);for(let i=0;i<120&&B.G.state!=='play';i++)B.simStep(.05);});
 const shot=async(name,fn)=>{const data=await page.evaluate(fn);await page.waitForTimeout(250);await page.screenshot({path:path.join(process.env.BR_QA_OUT,name+'.png')});console.log('QA PASS render '+name+' '+JSON.stringify(data));};
 const tv=()=>{const B=window.__BR,m=B.W37.tvScreen.mesh,p=m.getAbsolutePosition(),r=m.parent.rotation.y;B.PL.x=p.x+Math.sin(r)*1.6;B.PL.z=p.z+Math.cos(r)*1.6;B.PL.cell=-1;B.G37.ey=B.floorY37(B.PL.x,B.PL.z)+1.62;B.PL.yaw=Math.atan2(p.x-B.PL.x,p.z-B.PL.z);B.PL.pitch=-Math.atan2(p.y-B.G37.ey,1.6);for(let i=0;i<8;i++)B.simStep(.05);B.CAM().getViewMatrix(true);return{enabled:m.isEnabled(),disposed:m.isDisposed(),ready:m.material.isReady(m),errors:B.ERRS.n};};
 await shot('tv_idle',tv);
 await page.evaluate(()=>{const B=window.__BR;B.startFlood37();});await shot('tv_playing',tv);
 // Health/breath replenishment isolates rendering and buoyancy from combat.
 await shot('well_flood',()=>{const B=window.__BR,h=B.W37.hatch,LV=B.LV37();B.PL.x=h.x-3;B.PL.z=h.z;B.PL.cell=-1;for(let i=0;i<2200;i++){B.PL.hp=100;B.G37.breath=1;B.simStep(.05);}B.PL.yaw=Math.PI/2;B.PL.pitch=-.25;for(let i=0;i<10;i++)B.simStep(.05);const bad=B.SCN().meshes.filter(m=>m.isEnabled()&&m.material&&!m.material.isReady(m)).map(m=>m.name);if(B.ERRS.n||bad.length||B.G.state!=='play'||!B.G37.hatchReady)throw Error('QA FAIL flood render '+JSON.stringify({bad,state:B.G.state,ready:B.G37.hatchReady}));return{water:LV.basins[B.BAS37.WELL].y,camera:B.CAM().position.y,ready:B.G37.hatchReady,bad,errors:B.ERRS.n};});
};
