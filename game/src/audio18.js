// Level 18 · synthesized toy sounds, a public-domain lullaby and the dark between memories.
const SFX18={
  squeak(pos){shot((d,t)=>{tone(d,t,0.28,'sine',820,1250,0.16,0.025);tone(d,t+0.12,0.16,'sine',1250,720,0.1,0.02);return 0.4;},pos,0.7);},
  squeakStep(pos){shot((d,t)=>{tone(d,t,0.08,'sine',430,600,0.035,0.015);nz(d,t,0.08,'lowpass',550,1,0.03,0.015);return 0.12;},pos,0.5);},
  whoosh(){shot((d,t)=>{const f=nz(d,t,1.1,'bandpass',700,0.8,0.22,0.2);f.frequency.linearRampToValueAtTime(2200,t+0.5);f.frequency.linearRampToValueAtTime(320,t+1.1);return 1.2;},null,1);},
  rustle(pos,dur=0.7){shot((d,t)=>{for(let i=0;i<dur*12;i++)nz(d,t+i/12,0.1,'bandpass',900+Math.random()*1000,1.1,0.1,0.015);return dur+0.15;},pos,0.8);},
  paper(){this.rustle(null,0.3);},
  crayon(){shot((d,t)=>{nz(d,t,0.17,'bandpass',1700,1.5,0.1,0.01);return 0.2;},null,0.6);},
  pin(){shot((d,t)=>{nz(d,t,0.025,'highpass',2200,1,0.15,0.001);tone(d,t,0.06,'sine',1100,600,0.05,0.002);return 0.1;},null,0.8);},
  chime(){shot((d,t)=>{[1046.5,1318.5,1568].forEach((f,i)=>tone(d,t+i*0.13,1.7,'sine',f,f*0.999,0.08,0.004));return 2.1;},null,0.65);},
  wind(pos){shot((d,t)=>{for(let i=0;i<18;i++)nz(d,t+i*0.06,0.03,'bandpass',2200,4,0.1,0.003);return 1.2;},pos,0.8);},
  creak(pos){SFX9.creak(pos,true);}
};
async function prepLullaby18(){
 if(AU.lull18)return;const O=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!O)return;
 const sr=22050,beat=0.72,notes=[72,72,79,79,81,81,79,0,77,77,76,76,74,74,72,0,79,79,77,77,76,76,74,0,79,79,77,77,76,76,74,0,72,72,79,79,81,81,79,0,77,77,76,76,74,74,72,0],len=notes.length*beat,C=new O(1,Math.ceil(sr*len),sr);
 notes.forEach((m,i)=>{if(!m)return;const f=440*2**((m-69)/12),t=i*beat;for(const [mul,v,dec] of [[1,0.22,0.32],[2,0.08,0.16],[3.99,0.03,0.08]]){const o=C.createOscillator(),g=C.createGain();o.frequency.value=f*mul;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+0.004);g.gain.setTargetAtTime(0,t+0.008,dec);o.connect(g).connect(C.destination);o.start(t);o.stop(Math.min(len,t+2));}});
 AU.lull18=await C.startRendering();
}
function mkLullaby18(){if(!AU.ctx||!AU.lull18)return null;const C=AU.ctx,src=C.createBufferSource(),v=mkVoice(3,1),bed=C.createGain(),lp=C.createBiquadFilter();src.buffer=AU.lull18;src.loop=true;bed.gain.value=0;lp.type='lowpass';lp.frequency.value=950;src.connect(v.in);src.connect(lp).connect(bed).connect(AU.duckB);src.start();return {src,v,bed};}
function mkDrone18(){const C=AU.ctx,src=loopSrc(AU.brown),g=C.createGain(),lp=C.createBiquadFilter();g.gain.value=0;lp.type='lowpass';lp.frequency.value=100;src.connect(lp).connect(g).connect(AU.duckB);return {src,g};}
