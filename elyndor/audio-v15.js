// Every selected source was newly recorded/generated for this revision.
// Short variations, physical distance and restrained layers keep impacts clear.
const soundMix15={counter:new Map(),feet:new WeakMap(),layers:[],muteOldSteps:false,pixel:false,spatial:0};
const playBeforeSoundDesign15=playSound;
playSound=function(id,volume=.65,pitch=1){
 if(soundMix15.muteOldSteps&&id.startsWith('step-'))return;
 if(soundMix15.pixel&&id==='arcane')id='pixel-dissolve';
 const aliases={bow:'arrow-release','arrow-impact':'arrow-hit','fire-charge':'fire-ignite','ice':'ice-shatter'};id=aliases[id]??id;
 if(['blade-swing','blade-impact','step-stone','step-earth','step-wood','step-wet','step-snow'].includes(id)){const n=(soundMix15.counter.get(id)??0)%3+1;soundMix15.counter.set(id,n);if(assets.sounds[id+'-'+n])id+='-'+n;}
 return playBeforeSoundDesign15(id,volume,pitch);
};
function playSpatial15(id,a,volume=.4,pitch=1){if(!soundscape.unlocked||!ambience||state.settings.volume<=0)return;const n=(soundMix15.counter.get(id)??0)%3+1;soundMix15.counter.set(id,n);if(assets.sounds[id+'-'+n])id+='-'+n;const fire=buffer=>{if(!buffer||ambience.state!=='running')return;const source=ambience.createBufferSource(),gain=ambience.createGain(),pan=ambience.createPanner();source.buffer=buffer;source.playbackRate.value=pitch;pan.panningModel='equalpower';pan.distanceModel='inverse';pan.refDistance=3;pan.maxDistance=36;pan.rolloffFactor=1.2;const pos=V3(a.x,heightAt(a.x,a.z)+.25,a.z);pan.positionX.value=pos.x;pan.positionY.value=pos.y;pan.positionZ.value=pos.z;gain.gain.value=volume*state.settings.volume*(state.settings.effects??.85);source.connect(gain).connect(pan).connect(ambience.destination);source.onended=()=>{source.disconnect();gain.disconnect();pan.disconnect();};source.start();soundMix15.spatial++;soundscape.played.set(id,(soundscape.played.get(id)??0)+1);};const ready=soundscape.buffers.get(id);if(ready)fire(ready);else decodeSound(id).then(fire);}
const dissolveSoundBefore15=releaseCreaturePixels;releaseCreaturePixels=function(a){soundMix15.pixel=true;try{return dissolveSoundBefore15(a);}finally{soundMix15.pixel=false;}};
const themeBeforeHarbor15=journeyTheme;journeyTheme=function(){if(!battle&&!resultsPage&&state.mode!=='title'&&activeScene?.key==='harbor')return'theme-town';return themeBeforeHarbor15();};
const soundscapeBeforeDesign15=updateSoundscape;
updateSoundscape=function(dt){soundMix15.muteOldSteps=true;try{soundscapeBeforeDesign15(dt);}finally{soundMix15.muteOldSteps=false;}if(!soundscape.unlocked||!player||!world||gameLoading||!ambience)return;
 const listener=ambience.listener,pos=V3(player.x,heightAt(player.x,player.z)+1.5,player.z),forward=V3(0,0,-1).applyQuaternion(camera.quaternion);if(listener.positionX){listener.positionX.value=pos.x;listener.positionY.value=pos.y;listener.positionZ.value=pos.z;listener.forwardX.value=forward.x;listener.forwardY.value=forward.y;listener.forwardZ.value=forward.z;listener.upX.value=0;listener.upY.value=1;listener.upZ.value=0;}
 const hour=state.worldMinutes/60%24,night=hour<6||hour>=20,inside=activeScene.kind==='interior',wanted=[];
 if(!inside&&night)wanted.push(['ambient-night',.3]);if(activeScene.key==='harbor')wanted.push(['ambient-harbor',.5]);if(inside&&weather.rain.value>.05)wanted.push(['ambient-roof-rain',weather.rain.value*.28]);
 for(const q of soundscape.layers)if(night&&['ambient-town','ambient-forest'].includes(q.id))q.a.volume*=.35;
 for(const q of soundMix15.layers)q.target=0;for(const[id,target]of wanted){let q=soundMix15.layers.find(q=>q.id===id);if(!q){q=newStream(id);if(q)soundMix15.layers.push(q);}if(q)q.target=target;}
 for(let i=soundMix15.layers.length-1;i>=0;i--){const q=soundMix15.layers[i];q.gain=mix(q.gain,q.target,1-Math.exp(-dt));q.a.volume=clamp(q.gain*state.settings.volume*(state.settings.ambient??.7)*(recordedVoice.current?.text?.48:1),0,1);if(!q.target&&q.gain<.001){q.a.pause();q.a.removeAttribute('src');q.a.load();soundMix15.layers.splice(i,1);}}
 // Overlap musical loop boundaries so the score never falls into a fade gap.
 for(const q of[...soundscape.music])if(q.target===1&&q.a.loop&&Number.isFinite(q.a.duration)&&q.a.currentTime>q.a.duration-1.3&&!q.loopNext){q.loopNext=true;q.target=0;const next=newStream(q.id);if(next){next.target=1;soundscape.music.push(next);}}
 if(state.mode==='explore'&&!menu&&!dialogue)for(const a of[player,...followers,...npcs.filter(a=>dist(a,player)<15)]){if(a.speed<.25||!a.frame)continue;const action=a.frame.action;if(!action?.startsWith('run_')&&!WALK_DIRECTIONS.includes(action))continue;const clip=assets.sprites[a.visualId??a.id]?.frames[action];if(!clip?.length)continue;const contact=Math.floor(a.frame.index/Math.max(1,clip.length/2)),last=soundMix15.feet.get(a);soundMix15.feet.set(a,contact);if(last===undefined||last===contact)continue;const wood=inside||world.userData.bridges.some(b=>Math.abs(a.x-b.x)<b.length/2&&Math.abs(a.z-b.z)<b.width/2),stone=!wood&&roadDistance(a.x,a.z)<3.4&&['brookstead','highmere','harbor'].includes(activeScene.key),snow=winterAt(a.x,a.z)>.6;playSpatial15('step-'+(snow?'snow':wood?'wood':weather.rain.value>.3&&stone?'wet':stone?'stone':'earth'),a,a===player?.2:a.party?.09:.045,.97+(a.phase%1)*.06);}
};
window.addEventListener('pagehide',()=>{for(const q of soundMix15.layers)q.a.pause();});
