// One covered, asynchronous handoff owns scene loading in both directions.
// Initial boot/save loading keeps its existing screen; travel fades through
// black and does not expose the loader, world construction or final settling.
const poiFade={active:false,phase:'idle',ready:false,from:null,to:null,completed:0,history:[]};
const poiFadeScreen=document.createElement('div');poiFadeScreen.id='poi-fade';poiFadeScreen.className='hidden';poiFadeScreen.setAttribute('aria-hidden','true');document.body.appendChild(poiFadeScreen);
function setPoiFadePhase(phase){poiFade.phase=phase;poiFade.history.push({phase,at:performance.now(),scene:state.scene,ready:poiFade.ready});if(poiFade.history.length>160)poiFade.history.shift();}
async function animatePoiFade(opacity){
 const duration=matchMedia('(prefers-reduced-motion: reduce)').matches?100:opacity?220:260;
 const start=Number(getComputedStyle(poiFadeScreen).opacity),animation=poiFadeScreen.animate([{opacity:start},{opacity}],{duration,easing:'ease-in-out',fill:'forwards'});
 try{await animation.finished;}finally{poiFadeScreen.style.opacity=String(opacity);animation.cancel();}
}
const fadedSceneBefore43=changeJourneyScene;
changeJourneyScene=function(id,spawn=null){
 if(poiFade.active||sceneSwitchPending||gameLoading||battle)return Promise.resolve(false);
 if(!player||!activeScene||state.mode==='title'||loading36.booting)return fadedSceneBefore43(id,spawn);
 poiFade.active=true;poiFade.ready=false;poiFade.from=activeScene.key;poiFade.to=id;keys.clear();route=null;resetSimulation();
 poiFadeScreen.style.opacity='0';poiFadeScreen.classList.remove('hidden');document.body.classList.add('poi-fading');setPoiFadePhase('fade-out');
 const task=(async()=>{
  try{
   await animatePoiFade(1);setPoiFadePhase('loading');
   if(id==='overworld')await ensureWorldData136(true);
   const changed=await fadedSceneBefore43(id,spawn);if(!changed)return false;
   // The complete legacy handoff includes graphics preparation, story arrival,
   // camera settling, cutaways and the first destination frame under the cover.
   updateCamera(1,true);updateCutaways();updateRenderBudget(true);poiFade.paintReady68=true;try{render();}finally{poiFade.paintReady68=false;}
   await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame);
   poiFade.ready=true;setPoiFadePhase('fade-in');await animatePoiFade(0);poiFade.completed++;return true;
  }finally{
   poiFadeScreen.classList.add('hidden');poiFadeScreen.style.opacity='0';document.body.classList.remove('poi-fading');keys.clear();route=null;poiFade.active=false;setPoiFadePhase('idle');resetSimulation();
  }
 })();window.journeyGraphicsReady=task;return task;
};
const fadeTickBefore43=tick;tick=function(dt){if(!poiFade.active)return fadeTickBefore43(dt);};
const fadeMoveBefore43=moveActor;moveActor=function(a,...args){if(poiFade.active&&a.party)return 0;return fadeMoveBefore43(a,...args);};
const fadeControlsBefore43=departureControlAvailable;departureControlAvailable=function(){return !poiFade.active&&fadeControlsBefore43();};
function blockPoiFadeInput(e){if(!poiFade.active)return;e.preventDefault();e.stopImmediatePropagation();keys.clear();}
for(const name of['keydown','keyup','pointerdown','click','wheel','touchstart'])document.addEventListener(name,blockPoiFadeInput,{capture:true,passive:false});
const fadeEngineBefore43=installEngine;installEngine=function(){
 fadeEngineBefore43();const previous=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(previous());q.poiTransition={active:poiFade.active,phase:poiFade.phase,ready:poiFade.ready,from:poiFade.from,to:poiFade.to,completed:poiFade.completed,controlsLocked:poiFade.active};q.cloudShadows={continuous:true,softEdges:true,frames:cloudShadows43.frames,strength:cloudShadows43.strength.value};return JSON.stringify(q);};
};
