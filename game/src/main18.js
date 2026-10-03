// Level 18 · arrival, memory recovery, sanity, guidance and the final drawn door.
const G18 = {from:null};
function resetG18(){const from=G18.from;for(const k of Object.keys(G18))delete G18[k];Object.assign(G18,{from,phase:'arrive',carry:[],pinned:[],found:0,noteRead:false,napRead:false,musicT:0,flash:0,digging:false,slide:null,slides:{},paintTip:false,boxTip:false,slideTip:false,hugged:false,doorT:0,whisperT:20,gigT:25,rustleT:0,endWon:false,lull:null,drone:null});}
resetG18();
DEATH_TXT.forgotten=['FORGOTTEN','It wore the shape of someone you used to know.'];
function obj18(){return G18.phase==='arrive'?'FOLLOW THE PLUSH DINO':G18.phase==='exit'?'WALK THROUGH THE DOOR YOU DREW':G18.phase==='name'?objName18():G18.phase==='color'?(P18.crayons?'COLOR IN THE DOOR YOU DREW':'THE DOOR NEEDS COLOR · CRAYONS IN THE ART ROOM'):`FIND YOUR DRAWINGS · ${G18.found}/4 · PINNED ${G18.pinned.length}/4`;}
function setPhase18(p){const old=G18.phase;if(p)G18.phase=p;objective(obj18());tasks18();if(old==='arrive'&&G18.phase==='memories'){cpSave('SUNSHINE ROOM');spawnForgotten18();if(G.diff===2)spawnForgotten18();later(2,()=>toast('BRIGHT ROOMS ARE SAFE · KEEP YOUR LIGHT READY',4));}}
function carryFrom5(){return carryFrom9();}
function teardown18(){for(const k of ['lull','drone']){const v=G18[k];if(v){try{v.src&&v.src.stop();(v.v?v.v.g:v.g).disconnect();v.bed&&v.bed.disconnect();}catch(e){}G18[k]=null;}}PL.spdK=1;document.body.classList.remove('lvl18');}
async function goLevel18(from) {
  const f = Object.assign({ hp: 100, san: 100, batt: [100, 90, 75][G.diff], spare: [2, 1, 1][G.diff], water: [3, 1, 1][G.diff], time: 0, dist: 0, lost: 0, tapes: 4 }, from || G18.from || {});
  G18.from = Object.assign({}, f);
  G.state = 'loading'; show('loading'); $('osd').classList.add('hide'); $('touch').classList.add('hide'); $('blue').classList.add('hide');
  $('loadOsd').textContent = '▶ LEVEL 18 · NOSTALGIC MEMORIES'; $('loadFill').style.width = '0%';
  if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume();
  teardownScene();
  LVL = 18; setDims(L18_N, L18_LMR); document.body.classList.remove('lvl9', 'lvl5'); document.body.classList.add('lvl18'); AU.remap = null;
  resetG18(); resetP18(); resetM18(); tasksReset('LEVEL 18 · NOSTALGIC MEMORIES');
  const prog = (p, m) => { $('loadFill').style.width = (p * 100).toFixed(0) + '%'; $('loadMsg').textContent = m; };
  RNG = mulberry32((Math.random() * 4294967296) >>> 0);
  await buildWorld18(prog);
  setupPost(+S.qual); applySettings();
  Object.assign(PL, { x: cellCenter(4)+0.4, z: cellCenter(20), yaw: Math.PI/2, pitch: 0, vx: 0, vz: 0, kx: 0, kz: 0, crouch: false, ck: 0, sta: 1, exh: false,
    hp: Math.max(f.hp, 75), san: Math.max(f.san, 75), batt: Math.max(f.batt, 60), spare: f.spare, water: f.water, flash: false, fk: 0, nv: false, zoomT: false, zk: 0,
    noise: 0, dist: f.dist, lastHurt: -99, shake: 0, cell: -1, fear: 0, lookAt: null, lookK: 0, focus: null, interf: 0, spdK: 1 });
  updateField();
  Object.assign(G, { time: f.time, lost: f.lost, tapes: f.tapes, cause: '', blackout: 0, exitOn: false, chase: 0, hintT: 0, grace: 0 });
  HINT.stage = 0; HINT.site = null;
  initAI18();
  Object.assign(FX, { envA: [0.025, 0.03, 0.035, 1], envS: [0.07, 0.09, 0.11, 0.7], fadeW: 1, fadeB: 0 });
  CAM.position.set(PL.x, 1.6, PL.z); CAM.rotation.set(0, PL.yaw, 0); CAM.getViewMatrix(true); worldFX18(0.016); pushUniforms();
  await new Promise(r => SCN.executeWhenReady(() => r()));
  prog(1, 'READY'); await nextFrame();
  try { localStorage.setItem('br_l18', '1'); } catch (e) {}
  hideScreens(); G.state = 'intro'; INTRO.t = 0; SFX.tape();
}
function startLevel18Menu() {
  if (G.state !== 'title') return;
  audioInit(S.vol); if (AU.ctx.state === 'suspended') AU.ctx.resume();
  applySettings(); lockPointer(); G18.from = null; goLevel18(null);
}
function introCam18(dt){INTRO.t+=dt;const t=INTRO.t,k=smooth(0.5,4.5,t);FX.fadeW=1-smooth(0.3,2.3,t);FX.fadeB=0;CAM.position.set(PL.x,lerp(0.24,1.6,k),PL.z);CAM.rotation.set(lerp(-0.65,0,k),PL.yaw,lerp(0.65,0,k));CAM.fov=S.fov*Math.PI/180;if(t>4.8)beginPlay18();}
function beginPlay18(){G.state='play';FX.fadeW=FX.fadeB=0;PL.pitch=0;$('osd').classList.remove('hide');if(IS_TOUCH)$('touch').classList.remove('hide');setPhase18('arrive');cpSave('LEVEL START',{x:PL.x,z:PL.z,yaw:PL.yaw,quiet:true});arrive18();later(8,()=>toast('A SMALL GREEN TOY IS WAITING FOR YOU',3));}
function gameEvents18(dt){
 places18Events(dt);
 const z=zone18(PL.x,PL.z),pit=inPit18(PL.x,PL.z);PL.spdK=pit?0.55:1;
 if(pit){CAM.position.y-=0.45;G18.rustleT-=dt;if(PL.spd>0.2&&G18.rustleT<=0){G18.rustleT=0.7;SFX18.rustle(P9({x:PL.x,y:0.4,z:PL.z}),0.45);}}
 G18.flash=Math.max(0,G18.flash-dt);if(!G18.slide)FX.fadeW=G18.flash;
 G18.musicT=Math.max(0,G18.musicT-dt);
 const d=AI18.dino,near=d&&d.d<3.5&&los(d.x,d.z,PL.x,PL.z);PL.san=clamp(PL.san+(near?2:z===Z18.CLASS?0.16:-(voidZ18(z)?0.25:0.04)*[0.6,1,1.3][G.diff])*dt,0,100);
 G18.whisperT-=dt;if(G18.whisperT<=0&&(PL.san<45||voidZ18(z))){G18.whisperT=rnd(15,30);SFX.whisper();say('',pick(['…you have to lift the latch or it doesn\'t catch…','…his bowl is still by the back door…','…you said you fed him…','…there\'s a coat on the hook, that\'s all it is…','…they kept a chair for you…','…the kitchen was yellow… wasn\'t it…']),{dur:4,mode:'whisper'});}
 G18.gigT-=dt;if(G18.gigT<=0){G18.gigT=rnd(25,45);SFX.giggle({x:PL.x+12,y:1,z:PL.z-8,pl:{x:PL.x,z:PL.z}});}
 const C=W18.closet;if(C){C.open=damp(C.open,C.want,1.2,dt);C.hinge.rotation.y=C.ry-1.35*C.open;}
 slideCam18(dt);
}
function worldFX18(dt){
 const t=FX.t,cp=CAM.position,z=zone18(cp.x,cp.z),v=voidZ18(z),live=G.state==='play',L=clamp(lightAt(cp.x,cp.z),0,1);
 FX.flicker=0.86+0.14*hash1(Math.floor(t*36));FX.lightScale=1;FX.hurt=Math.max(0,FX.hurt-dt*0.9);FX.glitch=Math.max(0,FX.glitch-dt*1.3);
 FX.fogDen=v?0.1:darkZ18(z)?0.04:0.021;FX.fog[0]=v?0.003:lerp(0.017,0.09,L);FX.fog[1]=v?0.004:lerp(0.023,0.11,L);FX.fog[2]=v?0.008:lerp(0.03,0.14,L);
 if(live)FX.exposure=0.98*S.bright*lerp(1,clamp(0.3/Math.max(PL.light,0.01),0.22,1),FX.nv);
 if(W18.lensFl)setEmi(W18.lensFl,4*FX.flicker);if(W.itemMat)setEmi(W.itemMat,0.4+0.7*Math.max(0,Math.sin(t*2.6))**6);
 G18.doorT-=dt;if(G18.doorT<=0){G18.doorT=0.25;for(const d of W9.doors){const on=dist2(d.mx,d.mz,cp.x,cp.z)<d.cull;if(d.vis!==on){d.vis=on;d.mesh.setEnabled(on);}}}updateDoors9(dt);
 const X=W18.exitDoor;if(X&&X.on){X.k=damp(X.k,1,1.2,dt);X.S.mat.setVector4('dP',new BABYLON.Vector4(0.8+X.k*1.1,0,0,0));setSlot(4,{x:X.fx+0.25,y:1.2,z:X.fz},0.9*X.k,null,0,[1,0.94,0.72],7,true,0.6);}else clearSlot(4);
 const ns=W18.nightL.filter(n=>dist2(n.x,n.z,cp.x,cp.z)<12).sort((a,b)=>dist2(a.x,a.z,cp.x,cp.z)-dist2(b.x,b.z,cp.x,cp.z));if(ns[0])setSlot(3,ns[0],0.65,null,0,[1,0.7,0.35],4,true,0.7);else clearSlot(3);clearSlot(5);
 if(W18.swing)W18.swing.r.rotation.x=Math.sin(t*0.65)*0.04;if(W18.mobile)W18.mobile.rotation.y=t*0.1;
 if(AU.ctx){const now=AU.ctx.currentTime,mute=AU.muted;if(!G18.lull&&AU.lull18)G18.lull=mkLullaby18();if(!G18.drone)G18.drone=mkDrone18();const J=G18.lull;if(J){J.v.set(W18.musicBox.x,W18.musicBox.y,W18.musicBox.z,PL.x,PL.z);setGain(J.v,(G18.musicT>0?0.8:0.22)*(v?0.4:1),0.6);J.bed.gain.setTargetAtTime(mute?0:v?0.005:0.022,now,1);J.src.playbackRate.setTargetAtTime(1-0.035*FX.san,now,0.7);}G18.drone.g.gain.setTargetAtTime(mute?0:v?0.17:0.008,now,1);AU.humG.gain.setTargetAtTime(mute||v?0:0.045,now,0.5);AU.tenG.gain.setTargetAtTime(mute?0:clamp(G.chase*0.5+PL.fear*0.1,0,0.6),now,0.5);AU.tenF.frequency.setTargetAtTime(280+G.chase*1500,now,0.5);}
 for(const m of LV.chunkMeshes){const c=m.__c||(m.__c=m.getBoundingInfo().boundingBox.centerWorld.clone());m._sortD=Math.hypot(c.x-cp.x,c.z-cp.z);}
}
function win18(){if(G.state!=='play'||!W18.exitDoor.on)return;G.state='won';DEATH.t=0;DEATH.shown=false;clearSlot(0);$('prompt').classList.remove('show');G18.wc={x:CAM.position.x,z:CAM.position.z,yaw:CAM.rotation.y,pitch:CAM.rotation.x};for(const f of AI18.fog)f.goAway(99);SFX18.chime();}
function wonCam18(dt){DEATH.t+=dt;const t=DEATH.t,X=W18.exitDoor,w=G18.wc,k=smooth(0,2.8,t);updateAI18(dt);CAM.position.set(lerp(w.x,X.fx-0.3,k),1.6,lerp(w.z,X.fz,k));CAM.rotation.set(lerp(w.pitch,0,k),w.yaw+angDiff(w.yaw,-Math.PI/2)*k,0);FX.fadeW=smooth(1.6,4,t);if(t>5&&!DEATH.shown){DEATH.shown=true;G18.endWon=true;flags18();goLevel37(carryFrom18());}}
function showEnd18(won){if(document.pointerLockElement)document.exitPointerLock();$('osd').classList.add('hide');$('touch').classList.add('hide');G18.endWon=won;if(won)flags18();const [title,text]=won?['YOU REMEMBERED',endText18()]:(DEATH_TXT[G.cause]||DEATH_TXT.forgotten);$('endKicker').textContent=won?'WOKEN UP · END OF RECORDING':'■ SIGNAL LOST · LEVEL 18';$('endTitle').textContent=title;$('endText').textContent=text;const st=[['TIME ON TAPE',fmtTC(G.time)],['DISTANCE',Math.round(PL.dist)+' M'],['DRAWINGS',G18.pinned.length+'/4'],['LEVEL','18 · NOSTALGIC MEMORIES'],['DIFFICULTY',DIFFS[G.diff]]];$('endStats').innerHTML=st.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('');$('btnAgain').textContent=won?'▶ PLAY AGAIN (LEVEL 0)':'▶ RETRY LEVEL 18';show('end');}
function target18(){let to=null;const pc=cell18(PL.x,PL.z),z=LV.zone[pc];if(G18.phase==='arrive')to=AI18.dino;else if(G18.phase==='exit')to=W18.exitDoor;else if(G18.phase==='name')to=targetMem18();else if(G18.phase==='color')to=P18.crayons||!W18.p18||!W18.p18.tub?W18.exitDoor:W18.p18.tub;else if(!G18.noteRead)to=W18.deskNote;else if(G18.carry.length&&(z===Z18.CLASS||G18.found===4))to=W18.board;else{const left=W18.drawings.filter(d=>!d.taken);to=left.sort((a,b)=>dist2(a.x,a.z,PL.x,PL.z)-dist2(b.x,b.z,PL.x,PL.z))[0]||W18.board;}if(!to)return null;const gc=cell18(to.x,to.z);if(gc===pc||los(PL.x,PL.z,to.x,to.z))return to;if(G18.targetCell!==gc||G18.targetVer!==LV.navVer){G18.targetCell=gc;G18.targetVer=LV.navVer;G18.targetField=bfs(gc%N,(gc/N)|0,c=>!LV.zone[c]);}const F=G18.targetField;let c=pc;if(F[c]<0)return to;for(let i=0;i<3;i++){let best=c;const x=c%N,y=(c/N)|0;for(let d=0;d<4;d++){const nx=x+DX[d],ny=y+DY[d],n=cIdx(nx,ny);if(inGrid(nx,ny)&&passable(x,y,d)&&F[n]>=0&&F[n]<F[best])best=n;}if(best===c)break;c=best;}return {x:cellCenter(c%N),z:cellCenter((c/N)|0)};}
function hudObj18(){return G18.phase==='name'?'YOUR NAME':`DRAWINGS ${G18.found}/4`;}
function hudItems18(){return `CARRYING ${G18.carry.length} · PINNED ${G18.pinned.length}/4`+(P18.crayons?' · CRAYONS':'');}
if (/[?&]debug/.test(location.search)) Object.assign(window.__BR || (window.__BR={}),{SKN,SKP,sknOn,sknTick,rigPlay,rigWant,rigStop,rigBase,MdlBatch,mdlOk,mdlDims,MDL_K,MDL,buildExplorerSk,buildHowlerSk,buildWatchSk,buildWretchSk,buildHaleSk,buildForgottenSk,poseDeadSk,mergeRig,G18,W18,AI18,findInteract,interact,collide,updateField,updateHUD,LV18:()=>LV,goLevel18,beginPlay18,worldFX18,gameEvents18,target18,win18,takeDrawing18,digPit18,pinDrawings18,setPhase18,spawnForgotten18,startSlide18,slideCam18,readNote18,windBox18,foes18,Z18,PIT18,SLIDE_TO18,carryFrom5,updateAI18,INTRO,DEATH});
boot();
