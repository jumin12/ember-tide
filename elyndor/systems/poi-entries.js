// Walking into a world-map village offers entry; only a deliberate interaction
// enters its full-sized scene. The whole village is usable, not one floor dot.
const poiEntry={confirming:null,dismissed:null,confirmed:0};
function worldEntrancePoint45(key){const model=world?.userData.landmarks45?.[key];return model?{x:model.position.x,z:model.position.z}:{x:POIS[key].node[0],z:POIS[key].node[1]};}
function nearbyWorldEntrance(){
 if(!player||activeScene?.kind!=='overworld')return null;
 return interactables.filter(o=>o.type==='location'&&interactionAvailable(o)&&dist(player,worldEntrancePoint45(o.poi))<(POIS[o.poi].kind==='town'?30:12)).sort((a,b)=>dist(player,worldEntrancePoint45(a.poi))-dist(player,worldEntrancePoint45(b.poi)))[0]??null;
}
const entryNearestBefore=nearestInteraction;
nearestInteraction=function(){const o=nearbyWorldEntrance();if(o)return o;const other=entryNearestBefore();return activeScene?.kind==='overworld'&&other?.type==='location'?null:other;};
const entryActBefore=act;
act=function(o,...args){
 if(activeScene?.kind==='overworld'&&o?.type==='location'){
  if(poiEntry.confirming!==o||!departureControlAvailable()||nearbyWorldEntrance()!==o)return;
  keys.clear();route=null;
 }
 return entryActBefore(o,...args);
};
function confirmWorldEntrance(){
 const o=nearbyWorldEntrance();if(!o||poiEntry.dismissed===o||!departureControlAvailable())return;
 poiEntry.confirming=o;try{act(o);poiEntry.confirmed++;}finally{poiEntry.confirming=null;}
}
const entryPrompt=document.createElement('div');entryPrompt.id='poi-entry-prompt';entryPrompt.className='poi-travel-prompt hidden';
entryPrompt.innerHTML='<button type="button"><kbd>E</kbd><span>Enter</span></button>';document.body.appendChild(entryPrompt);
entryPrompt.querySelector('button').addEventListener('click',confirmWorldEntrance);
document.addEventListener('keydown',e=>{
 if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)||!departureControlAvailable())return;
 const o=nearbyWorldEntrance(),key=e.key.toLowerCase();if(!o)return;
 if(key==='escape'){return;} // Escape belongs to the game menu, including at a destination gate.
 else if((key==='e'||key==='enter')&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();confirmWorldEntrance();}
},{capture:true});
function updateEntryPrompt(){
 const o=nearbyWorldEntrance();if(poiEntry.dismissed&&poiEntry.dismissed!==o)poiEntry.dismissed=null;
 const visible=!!o&&departureControlAvailable()&&poiEntry.dismissed!==o;entryPrompt.classList.toggle('hidden',!visible);
 if(o)$('#interact').classList.add('hidden');if(visible)showTravelPrompt(entryPrompt,'Enter '+POIS[o.poi].name,'Enter '+POIS[o.poi].name);
}
const entryRenderBefore=render;render=function(...args){const result=entryRenderBefore(...args);updateEntryPrompt();return result;};
const entryEngineBefore=installEngine;installEngine=function(){
 entryEngineBefore();const previous=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(previous()),o=nearbyWorldEntrance();q.poiEntry={prompt:!entryPrompt.classList.contains('hidden'),poi:o?.poi??null,confirmed:poiEntry.confirmed};return JSON.stringify(q);};
};
