// Short ElevenLabs effects are fetched only when housing is used. They share
// the native audio context and respect the player's volume controls.
const portalAudio149={files:new Map(),buffers:new Map(),pending:null,loop:null,cast:null,world:null,played:0,counts:{opening:0,hum:0},errors:[]};
function warmPortalAudio149(){
 if(portalAudio149.pending)return portalAudio149.pending;
 const ids=['opening','hum'];portalAudio149.pending=Promise.all(ids.map(async id=>{
  let data=portalAudio149.files.get(id);if(!data){const r=await fetch('elyndor/assets/runtime-v149/portal-'+id+'.mp3');if(!r.ok)throw Error('Portal sound '+id+' returned '+r.status);data=await r.arrayBuffer();portalAudio149.files.set(id,data);}
  if(ambience&&!portalAudio149.buffers.has(id)){const buffer=await ambience.decodeAudioData(data.slice(0));if(id==='hum'){const n=Math.min(Math.round(buffer.sampleRate*.09),Math.floor(buffer.length/8));for(let ch=0;ch<buffer.numberOfChannels;ch++){const a=buffer.getChannelData(ch);for(let i=0;i<n;i++){const t=i/(n-1),at=a.length-n+i;a[at]=a[at]*(1-t)+a[i]*t;}}}portalAudio149.buffers.set(id,buffer);}
 })).catch(e=>{portalAudio149.errors.push(e.message);portalAudio149.pending=null;}).then(()=>{if(portalAudio149.buffers.size<2)portalAudio149.pending=null;});return portalAudio149.pending;
}
function stopPortalSound149(q,fade=.08){if(!q||q.stopping)return;q.stopping=true;if(ambience){const now=ambience.currentTime;q.gain.gain.cancelScheduledValues(now);q.gain.gain.setTargetAtTime(0,now,Math.max(.01,fade/3));try{q.source.stop(now+fade);}catch{}}}
function portalVolume149(q,value,tau){if(Math.abs((q.target??-1)-value)<.001)return;q.target=value;q.gain.gain.setTargetAtTime(value,ambience.currentTime,tau);}
function startPortalSound149(id,loop,volume){
 if(!ambience||ambience.state!=='running'||!soundscape.unlocked)return null;const buffer=portalAudio149.buffers.get(id);if(!buffer){warmPortalAudio149();return null;}
 const source=ambience.createBufferSource(),gain=ambience.createGain(),pan=ambience.createStereoPanner?.();source.buffer=buffer;source.loop=loop;if(loop){source.loopStart=.09;source.loopEnd=buffer.duration;}gain.gain.value=0;source.connect(gain);if(pan)gain.connect(pan).connect(ambience.destination);else gain.connect(ambience.destination);const q={source,gain,pan,id,stopping:false,world,volume};source.onended=()=>{source.disconnect();gain.disconnect();pan?.disconnect();if(portalAudio149.cast===q)portalAudio149.cast=null;if(portalAudio149.loop===q)portalAudio149.loop=null;};source.start();gain.gain.setTargetAtTime(volume,ambience.currentTime,.07);portalAudio149.played++;portalAudio149.counts[id]++;return q;
}
function updatePortalAudio149(dt){
 if(!world)return;const q=portalAudio149,master=state.settings.volume??1,muted=!soundscape.unlocked||!ambience||ambience.state!=='running'||master<=0||document.hidden||gameLoading||mainPause70?.open;
 if(q.world!==world){stopPortalSound149(q.loop);stopPortalSound149(q.cast);q.loop=q.cast=null;q.world=world;}
 const reveal=homeReveal146;if(reveal?.portal?.summon149&&!reveal.loading&&reveal.age>1.05&&!reveal.sound149){reveal.sound149=true;if(!muted)q.cast=startPortalSound149('opening',false,master*(state.settings.effects??.85)*.46);}
 if(q.cast){const volume=muted||!reveal?0:master*(state.settings.effects??.85)*.46;portalVolume149(q.cast,volume,.04);if(!reveal)stopPortalSound149(q.cast);}
 const portal=(world.userData.homePortals139??[]).find(p=>p.summon149&&p.group.visible&&p.open146.value>.60),distance=portal&&player?Math.hypot(player.x-portal.group.position.x,player.z-portal.group.position.z):Infinity;
 const volume=!muted&&!menu&&state.mode!=='title'&&distance<19?master*(state.settings.ambient??.7)*Math.pow(Math.max(0,1-distance/19),1.4)*(.26+(portal?.energy??0)*.08)*(portal?.open146.value??0):0;
 if(volume>.001&&!q.loop)q.loop=startPortalSound149('hum',true,volume);
 if(q.loop){q.loop.volume=volume;portalVolume149(q.loop,volume,.16);if(q.loop.pan&&portal&&player){const right=screenBasis().right,value=clamp(((portal.group.position.x-player.x)*right.x+(portal.group.position.z-player.z)*right.z)/12,-.65,.65);if(Math.abs((q.loop.lastPan??-2)-value)>.01){q.loop.pan.pan.setTargetAtTime(value,ambience.currentTime,.12);q.loop.lastPan=value;}}if(volume===0&&!portal){stopPortalSound149(q.loop,.35);q.loop=null;}}
}
const portalAudioInitBefore149=initAudio;
initAudio=function(...args){const r=portalAudioInitBefore149(...args);if(housing139().home&&(world?.userData.homePortals139?.length??0))warmPortalAudio149();return r;};
window.addEventListener('pagehide',()=>{stopPortalSound149(portalAudio149.loop,.02);stopPortalSound149(portalAudio149.cast,.02);});
