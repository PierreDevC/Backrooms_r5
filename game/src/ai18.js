// Level 18 · the friendly Plush Dino and the faceless Forgotten.
const AI18 = { dino: null, fog: [] };
function buildDino18() {
  const mat = actMat('plush18', {spec:0.04, shin:4, wrinkle:0.8, wrap:0.7}), root = tnode(null), r={root,mat,hipH:0.45};
  r.body=tnode(root); const green=[0.28,0.62,0.3], cream=[0.83,0.86,0.48];
  part('Sphere',{diameter:0.65,segments:14},r.body,mat,green,0,[0,0.42,0],null,[0.9,1.1,0.8]);
  part('Sphere',{diameter:0.42,segments:12},r.body,mat,cream,0,[0,0.41,0.17],null,[1,1.1,0.35]);
  r.head=tnode(r.body,0,0.79,0.04);
  part('Sphere',{diameter:0.47,segments:14},r.head,mat,green,0,[0,0,0],null,[1,0.95,1.15]);
  part('Sphere',{diameter:0.32,segments:12},r.head,mat,green,0,[0,-0.09,0.22],null,[1.15,0.65,1]);
  r.feet=[];
  for(const s of [-1,1]) {
    part('Sphere',{diameter:0.065,segments:8},r.head,mat,[0.025,0.025,0.025],0,[s*0.15,0.035,0.2]);
    part('Sphere',{diameter:0.017,segments:6},r.head,mat,[0.98,0.98,0.98],0,[s*0.145,0.047,0.23]);
    const f=tnode(root,s*0.18,0.11,0.06); part('Sphere',{diameter:0.25,segments:10},f,mat,green,0,[0,0,0],null,[1,0.7,1.4]); r.feet.push(f);
    part('Sphere',{diameter:0.2,segments:10},r.body,mat,green,0,[s*0.32,0.5,0.08],[0,0,s*0.4],[0.7,1.3,0.8]);
  }
  part('Sphere',{diameter:0.3,segments:10},r.body,mat,green,0,[0,0.25,-0.3],[-0.6,0,0],[0.65,0.65,2.2]);
  for(let i=0;i<5;i++) part('Sphere',{diameter:0.13,segments:7},r.body,mat,cream,0,[0,0.64-i*0.075,-0.24-i*0.05],null,[0.5,1,1]);
  setEmi(mat,0.12); return r;
}
class Dino18 extends Agent {
  constructor(){super(buildDino18(),0.22);mergeRig(this.rig);this.st='wait';this.hugT=0;this.stepT=0;this.cellFn=c=>!LV.zone[c];this.edgeFn=(x,y,d)=>!doorClosed(x,y,d);this.place(cellCenter(6),cellCenter(20),-Math.PI/2);}
  hug(){if(this.hugT>0){toast('DINO IS STILL KEEPING YOU COMPANY',2);return;}this.hugT=45;PL.san=Math.min(100,PL.san+30);SFX18.squeak(this.pos(0.8));toast('YOU REMEMBER HOW SAFE THIS FELT',3);if(!G18.hugged){G18.hugged=true;PL.water++;later(1,()=>toast('DINO BROUGHT YOU ALMOND WATER · +1',3));}}
  update(dt){
    this.hugT=Math.max(0,this.hugT-dt);this.stT+=dt;const play=G.state==='play';let to=null;
    if(play&&this.st==='wait'&&this.d<5){this.st='lead';SFX18.squeak(this.pos(0.8));}
    if(this.st==='lead'){
      const D=W18.classDoor;
      if(this.d<10){if(D&&dist2(this.x,this.z,D.mx,D.mz)<4&&!D.target)setDoor(D,true);to=W18.dinoHome;}
      if(to&&dist2(this.x,this.z,to.x,to.z)<0.5){this.st='sit';this.spd=0;if(G18.phase==='arrive')setPhase18('memories');}
    }
    if(G18.phase==='exit'&&this.st!=='enter'){this.st='goto';to={x:W18.exitDoor.x+0.45,z:W18.exitDoor.z};}
    if(G.state==='won'){this.st='enter';to={x:W18.exitDoor.fx,z:W18.exitDoor.fz};}
    if(to){this.navTo(to.x,to.z,1.25,dt);this.stepT-=dt;if(this.spd>0.3&&this.stepT<=0){this.stepT=0.48;SFX18.squeakStep(this.pos(0.1));}}
    else this.spd=damp(this.spd,0,8,dt);
    this.ph+=this.spd*dt*8;const r=this.rig;r.body.rotation.z=Math.sin(this.ph)*Math.min(0.13,this.spd*0.12);r.body.position.y=Math.abs(Math.sin(this.ph))*Math.min(0.04,this.spd*0.04);
    r.feet.forEach((f,i)=>f.rotation.x=Math.sin(this.ph+i*Math.PI)*Math.min(0.45,this.spd*0.4));
    r.head.rotation.y=play&&this.d<4?clamp(angDiff(this.yaw,Math.atan2(PL.x-this.x,PL.z-this.z)),-0.5,0.5):Math.sin(FX.t*0.5)*0.1;
    this.sync();
  }
}
function buildForgotten18(){
  if(sknOn())return buildForgottenSk();
  const mat=actMat('forgotten18',{spec:0.01,shin:2,wrap:0.2}),root=tnode(null),r={root,mat,hipH:1.1},c=[0.018,0.021,0.024];
  r.body=tnode(root);part('Sphere',{diameter:0.54,segments:12},r.body,mat,c,0,[0,1.45,0],null,[0.65,1.8,0.55]);
  part('Capsule',{height:0.22,radius:0.045,tessellation:8},r.body,mat,c,0,[0,1.965,0]);
  for(const side of [-1,1])part('Sphere',{diameter:0.18,segments:10},r.body,mat,c,0,[side*0.16,1.79,0]);
  r.head=tnode(r.body,0,2.19,0);part('Sphere',{diameter:0.36,segments:12},r.head,mat,c,0,[0,0,0],null,[0.8,1.2,0.7]);
  r.limbs=[];for(const s of [-1,1]){const l=tnode(r.body,s*0.14,1.05,0);part('Capsule',{height:1.08,radius:0.047,tessellation:8},l,mat,c,0,[0,-0.5,0]);r.limbs.push(l);const a=tnode(r.body,s*0.26,1.82,0);part('Capsule',{height:1.3,radius:0.036,tessellation:8},a,mat,c,0,[s*0.03,-0.6,0]);r.limbs.push(a);}return r;
}
class Forgotten18 extends Agent {
  constructor(o={}){super(buildForgotten18(),0.25);mergeRig(this.rig);this.cellFn=c=>!LV.zone[c]||!!W18.bright[c];this.edgeFn=(x,y,d)=>!doorClosed(x,y,d);this.burn=0;this.stare=0;this.fadeK=0;this.wait=0;this.shadowR=0.35;
    if(o.closet&&W18.closet){const C=W18.closet;this.place(C.x+1,C.z,Math.PI/2);this.st='emerge';}else this.respawn();
  }
  respawn(){const cells=[];for(let c=0;c<N*N;c++){if(this.cellFn(c))continue;const x=cellCenter(c%N),z=cellCenter((c/N)|0),d=dist2(x,z,PL.x,PL.z);if(d>13&&d<65&&!playerCanSee(x,1.7,z))cells.push(c);}if(!cells.length){this.goAway(5);return;}const c=pick(cells);this.place(cellCenter(c%N),cellCenter((c/N)|0),rnd(0,TAU));this.st='stalk';this.stT=0;this.present=true;this.burn=this.stare=this.fadeK=0;setDissolve(this.rig.mat,0);}
  goAway(wait=25){this.st='away';this.wait=wait;this.present=false;setDissolve(this.rig.mat,0.99);}
  fade(){if(this.st==='fade'||this.st==='away')return;this.st='fade';this.stT=0;SFX.whisper();}
  step(tx,tz,spd,dt,k=7){const dx=tx-this.x,dz=tz-this.z,d=Math.hypot(dx,dz)||1;const c=cell18(this.x+dx/d*spd*dt,this.z+dz/d*spd*dt);if(c<0||c>=N*N||this.cellFn(c)){this.spd=0;return d;}return super.step(tx,tz,spd,dt,k);}
  update(dt){
    this.stT+=dt;if(this.st==='away'){if(G.state==='play'&&G18.phase!=='exit'&&(this.wait-=dt)<=0)this.respawn();return;}
    const visible=playerCanSee(this.x,1.7,this.z),d=this.d,play=G.state==='play';
    if(this.st==='fade'){this.fadeK=Math.min(0.99,this.fadeK+dt*1.2);setDissolve(this.rig.mat,this.fadeK);if(this.fadeK>=0.99)this.goAway(rnd(20,35));return;}
    if(play&&inBeam(this.x,1.65,this.z,12,0.94)&&los(PL.x,PL.z,this.x,this.z))this.burn+=dt;else this.burn=Math.max(0,this.burn-dt*0.4);
    if(this.burn>1.2){this.fade();toast('IT CANNOT HOLD ITS SHAPE IN THE LIGHT',2.5);return;}
    if(this.st==='stalk'&&visible&&d<14){this.st='peek';this.stT=0;this.stare=0;}
    if(this.st==='peek'){this.spd=0;this.face(Math.atan2(PL.x-this.x,PL.z-this.z),3,dt);this.stare=visible?this.stare+dt:Math.max(0,this.stare-dt);if(this.stare>0.6)this.fade();else if(this.stT>6){this.st='hunt';this.stT=0;}}
    if(this.st==='emerge'&&this.stT>2){this.st='hunt';this.stT=0;}
    if(play&&this.st==='stalk'&&!visible&&d>9)this.navTo(PL.x,PL.z,1.6,dt);
    if(play&&(this.st==='hunt'||this.st==='emerge')){if(!this.cellFn(PL.cell)){this.navTo(PL.x,PL.z,this.st==='emerge'?0.8:[4.2,4.5,4.8][G.diff],dt);G.chase=Math.max(G.chase,clamp(1-d/25,0,1));if(d<0.95&&!G18.slide){knock(this,[25,34,40][G.diff],'forgotten',4);PL.san=Math.max(0,PL.san-20);this.fade();}}else if(this.stT>5)this.fade();}
    if(visible){PL.fear=Math.max(PL.fear,clamp(1-d/18,0,0.8));if(this.st==='hunt')FX.glitch=Math.max(FX.glitch,0.2);}
    this.ph+=dt*this.spd*3;if(this.rig.sk)animHuman(this.rig,this.ph,clamp(this.spd/1.6,0,1.2),{lean:0.12,armA:0.25});this.rig.limbs.forEach((l,i)=>l.rotation.x=Math.sin(this.ph+(i%2)*Math.PI)*Math.min(this.spd*0.09,0.42));this.rig.head.rotation.z=0.08*Math.sin(FX.t*0.8);this.sync();
  }
}
function spawnForgotten18(o={}){if(G18.phase==='exit'||G.state!=='play'||AI18.fog.length>=4)return;const f=new Forgotten18(o);AI18.fog.push(f);AI.all.push(f);return f;}
function initAI18(){AI.all=[];AI18.fog=[];AI18.dino=new Dino18();AI.all.push(AI18.dino);const d=AI18.dino;W.interact.push({get x(){return d.x;},get z(){return d.z;},y:0.6,r:1.7,label:()=> 'HUG THE PLUSH DINO',ok:()=>G.state==='play',act:()=>d.hug()});}
function updateAI18(dt){PL.fear=PL.interf=AI.flick=G.chase=0;for(const a of AI.all)a.update(dt);AI.visT-=dt;if(AI.visT<=0){AI.visT=0.1;for(const a of AI.all)a.cull();}const a=AI.all.filter(a=>a.present&&a.shown&&a.d<20).sort((a,b)=>a.d-b.d);for(let i=0;i<8;i++){const f=a[i];setShadowCaster(i,f?f.x:0,f?f.z:0,f?f.shadowR:0,f?0.4:0);}}
function foes18(){return AI18.fog.filter(f=>f.present&&f.st!=='fade'&&f.d<26).map(f=>({kind:'f',ang:Math.atan2(f.x-PL.x,f.z-PL.z),d:f.d,k:clamp(1-f.d/28,0,1),ch:f.st==='hunt',fl:0})).sort((a,b)=>a.d-b.d).slice(0,3);}
