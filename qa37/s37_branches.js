const assert = require('node:assert/strict');
const path = require('node:path');
module.exports = async page => {
  const check = (ok, label) => { assert.ok(ok, label); console.log('QA PASS ' + label); };
  const fresh = () => page.evaluate(async () => { const B = window.__BR; B.DBG.ts=0; B.G.diff=1; B.G37.from=null; await B.goLevel37(null); for(let i=0;i<120&&B.G.state!=='play';i++)B.simStep(.05); });
  await fresh();
  const early = await page.evaluate(() => { const B=window.__BR, step=s=>{for(let i=0;i<s*20;i++)B.simStep(.05);};
    B.takePellCam37(); B.takeCassette37(); for(let i=0;i<7;i++){B.talkAbara37(); step(16);}
    B.setPhase37('finale'); step(30); B.setPhase37('dry');
    return {ret:B.P37.ret,told:B.P37.told,phase:B.G37.phase,errors:B.ERRS.n}; });
  check(early.ret&&early.told&&early.phase==='finale'&&!early.errors, 'early pit recovery and late dialogue cannot regress objectives');
  const orders=[['hotel','hosp','tape'],['hotel','tape','hosp'],['hosp','hotel','tape'],['hosp','tape','hotel'],['tape','hotel','hosp'],['tape','hosp','hotel']];
  for(const order of orders){ await fresh(); const data=await page.evaluate(order=>{ const B=window.__BR; B.P37.ret=B.P37.told=true; B.setPhase37('wings');
    // Each wing's quest is exercised by s37_story. Isolate panel order here.
    B.panel37(); const premature=B.G37.flood;
    for(const k of order){B.P37.keys[k]=true;B.panel37();}
    for(let i=0;i<60;i++)B.simStep(.05);
    return {premature,phase:B.G37.phase,count:B.wingsDone37(),full:Object.values(B.P37.panel).every(Boolean),errors:B.ERRS.n}; },order);
    check(!data.premature&&data.phase==='finale'&&data.count===3&&data.full&&!data.errors,'panel accepts wing order '+order.join(' → ')); }
  await fresh();
  const chores=await page.evaluate(()=>{const B=window.__BR,H=B.P37.hosp;H.form=H.chart=H.iv=H.linen=true;
    const staff=k=>B.AI37.staff.find(s=>s.key===k);
    B.talkStaff37(staff('admit')); const premature=B.P37.keys.hosp;
    for(const k of ['nurse1','ward5','ward3']){B.talkStaff37(staff(k));B.talkStaff37(staff(k));}
    B.talkStaff37(staff('admit'));for(let i=0;i<200;i++)B.simStep(.05);
    return {premature,stamps:H.stamps,key:B.P37.keys.hosp,errors:B.ERRS.n, hidden:B.AI37.staff.every(s=>!s.shown)};});
  check(!chores.premature&&chores.stamps===3&&chores.key&&!chores.errors,'hospital reverse chores stamp once and gate discharge');
  check(chores.hidden,'Staff remain hidden with night vision off');
  await fresh();
  const geometry=await page.evaluate(()=>{const B=window.__BR,S=B.SCN(),LV=B.LV37();const bad=[];
    for(const m of S.meshes){ const p=m.getVerticesData('position');if(p&&Array.from(p).some(v=>!Number.isFinite(v)))bad.push(m.name);
      m.computeWorldMatrix(true);if(!m.getWorldMatrix().m.every(Number.isFinite))bad.push(m.name+':transform'); }
    const well=LV.basins[B.BAS37.WELL]; const cells=well.mesh.getTotalVertices()/4;
    return {bad,meshes:S.meshes.length,deck:LV.dry.well.cells.length,cells,pit:!B.W37.pit.cam.isDisposed()&&!B.W37.pit.cas.isDisposed(),tv:!!B.W37.tvScreen&&B.W37.tvScreen.dt.isReady(),errors:B.ERRS.n}; });
  check(!geometry.bad.length&&geometry.meshes>100&&!geometry.errors,'scene geometry and transforms are finite');
  check(geometry.cells===geometry.deck&&geometry.pit,'flood surface covers the full Well and pit pickups survive batching');
  check(geometry.tv,'booth has a live TV texture after furniture batching');
  await fresh();
  const stay=await page.evaluate(()=>{const B=window.__BR;const step=s=>{for(let i=0;i<s*20;i++)B.simStep(.05);};
    B.P37.cam=B.P37.cass=B.P37.met=B.P37.quest=B.P37.ret=B.P37.told=B.P37.told2=true;B.P37.keys.hotel=true;B.setPhase37('wings');
    B.PL.x=B.AI37.abara.x+1;B.PL.z=B.AI37.abara.z;B.PL.cell=-1;step(.2);
    B.talkAbara37();B.talkAbara37();const it=B.W.interact.find(i=>/SIT DOWN/.test(i.label())); const offered=it.ok();it.act();step(10);
    return {offered,state:B.G.state,ending:B.G37.ending,title:document.getElementById('endTitle').textContent,button:document.getElementById('btnAgain').textContent,errors:B.ERRS.n};});
  check(stay.offered&&stay.state==='won'&&stay.ending==='stay'&&stay.title==='STILL WATER'&&!stay.errors,'optional Stay branch reaches its own ending');
  await page.screenshot({path:path.join(process.env.BR_QA_OUT,'stay.png')});
  await page.locator('#btnAgain').click();
  await page.waitForFunction(()=>window.__BR.G.state==='intro'||(window.__BR.G.state==='title'&&window.__BR.BRIEF.open),null,{timeout:240000});
  check(await page.evaluate(()=>!document.body.classList.contains('lvl37')&&window.__BR.CP.on===null&&!window.__BR.ERRS.n),'Stay play-again resets to Level 0 or its first-run briefing');
};
