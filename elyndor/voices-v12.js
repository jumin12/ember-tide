// Recorded ElevenLabs speech is embedded; no credentials or live TTS calls exist
// in the player. One audio channel prevents overlapping dialogue and battle calls.
const recordedVoice={audio:null,plays:0,errors:[],missing:new Map(),current:null};
function voiceLookupKey(speaker,text){return speaker.trim().toLowerCase()+'|'+text.replace(/\s+/g,' ').trim();}
function stopRecordedVoice(){if(recordedVoice.audio){recordedVoice.audio.pause();recordedVoice.audio.currentTime=0;}recordedVoice.current=null;}
function playRecordedVoice(speaker,text){
 stopRecordedVoice();const key=voiceLookupKey(speaker,text),clip=assets.voices?.[key];if(!clip){recordedVoice.missing.set(key,{speaker,text});return;}if(!state.settings.voices||state.settings.volume<=0)return;
 const a=recordedVoice.audio??=new Audio();a.preload='auto';a.volume=clamp(state.settings.volume*.95,0,1);a.src=clip;recordedVoice.current={speaker,text};recordedVoice.plays++;a.play().catch(e=>{if(e.name!=='AbortError'&&e.name!=='NotAllowedError')recordedVoice.errors.push(e.name);});
}
const dialogueBeforeRecordedVoices=showDialogue;
showDialogue=function(){dialogueBeforeRecordedVoices();if(!dialogue)return;const[speaker,text]=dialogue.lines[dialogue.index];playRecordedVoice(speaker,text);document.body.classList.toggle('interior-dialogue',activeScene?.kind==='interior');};
const nextBeforeRecordedVoices=nextDialogue;
nextDialogue=function(){nextBeforeRecordedVoices();if(!dialogue)stopRecordedVoice();};
speak=function(id,text){$('#battle-callout').textContent=text;voiceTimer=Math.max(2,text.length/12);playRecordedVoice(id,text);};
const textBeforeJourney=()=>window.render_game_to_text;
function installJourneyText(){if(!window.render_game_to_text||window.journeyTextInstalled)return;const previous=window.render_game_to_text;window.render_game_to_text=()=>{const value=JSON.parse(previous());Object.assign(value,{worldSystem:'overworld-and-points-of-interest',location:activeScene?.key,locationKind:activeScene?.kind,weather:{name:weather.name,rain:weather.rain.value,snow:weather.snow.value,clouds:weather.cloud.value},results:resultsPage?{page:resultsPage.page,xp:resultsPage.xp,coins:resultsPage.gold}:null,voice:{provider:'ElevenLabs',recordedClips:Object.keys(assets.voices??{}).length,played:recordedVoice.plays},camera:{pitch:sideCameraStats.angle,cinematic:sideCameraStats.cinematic}});return JSON.stringify(value);};window.journeyTextInstalled=true;}
const tickBeforeVoiceUpdates=tick;
tick=function(dt){tickBeforeVoiceUpdates(dt);installJourneyText();if(recordedVoice.audio){recordedVoice.audio.volume=clamp(state.settings.volume*.95,0,1);if(!state.settings.voices)stopRecordedVoice();}};
// Keep a bounded representative of compiled material programs between levels.
// Disposing the outgoing scene's geometry still releases its vertex buffers.
const sceneProgramKeepers=new Map(),warmBeforeProgramCache=prepareGameplayGraphics;
prepareGameplayGraphics=async function(){const start=performance.now();await warmBeforeProgramCache();warmJourneyViews();world.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){if(sceneProgramKeepers.size>=112)continue;const key=[m.type,m.customProgramCacheKey(),m.vertexShader??'',m.fragmentShader??'',!!m.map,!!m.emissiveMap,!!m.vertexColors,m.side,m.alphaTest,!!m.transparent].join('|');if(sceneProgramKeepers.has(key))continue;sceneProgramKeepers.set(key,m);m.userData.retainedProgram=true;m.dispose=()=>{};}});sceneStats.lastWarmupMs=performance.now()-start;};

// Exercise real wide and side views of the loaded level behind the loader.
// Compiling a tiny representative alone does not upload every LOD's buffers.
function warmJourneyViews(){
 if(!player||activeScene?.kind!=='poi')return;
 const saved={x:player.x,z:player.z,mode:state.mode,zoom:state.settings.zoom},[a,b,c,d]=activeScene.bounds;
 try{
  state.mode='explore';state.settings.zoom=1.25;
  for(const[tx,tz]of[[.25,.25],[.75,.25],[.25,.75],[.75,.75],[.5,.5]]){
   player.x=mix(a,b,tx);player.z=mix(c,d,tz);updateLighting();updateCamera(1,true);updateRenderBudget(true);renderBeforeLoadingGate();
   const look=V3(player.x,heightAt(player.x,player.z)+1.15,player.z);cameraTarget.copy(look);camera.position.copy(look).add(V3(0,7.2,31));camera.fov=36;camera.lookAt(look);camera.updateProjectionMatrix();camera.updateMatrixWorld();renderBeforeLoadingGate();
  }
 }finally{player.x=saved.x;player.z=saved.z;state.mode=saved.mode;state.settings.zoom=saved.zoom;updateLighting();updateCamera(1,true);updateRenderBudget(true);renderBeforeLoadingGate();}
}
