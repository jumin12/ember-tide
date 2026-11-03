// A doorway is its own interaction. Walking and click-to-move can approach it;
// only the player's contextual confirmation may hand off to the interior.
const buildingEntry48={confirming:null,dismissed:null,confirmed:0};
function isBuildingPortal48(o){return !!o&&(activeScene?.kind==='poi'&&!!INTERIORS[o.interior]||activeScene?.kind==='interior'&&o.type==='interiorExit');}
function portalCoordinates48(o,x,z){const q=o.buildingPortal48,dx=x-o.x,dz=z-o.z;return{along:dx*q.front[0]+dz*q.front[1],across:-dx*q.front[1]+dz*q.front[0]};}
function insideBuildingPortal48(o,p=player){
 if(!p||!o.buildingPortal48||!interactionAvailable(o))return false;
 const q=portalCoordinates48(o,p.x,p.z),spec=o.buildingPortal48;
 return q.along>=-spec.back&&q.along<=spec.depth&&Math.abs(q.across)<=spec.width&&Math.abs(heightAt(p.x,p.z)-heightAt(o.x,o.z))<2.4;
}
function nearbyBuildingPortal48(){
 if(!player||!['poi','interior'].includes(activeScene?.kind))return null;
 return(world.userData.buildingPortals48??[]).filter(o=>insideBuildingPortal48(o)).sort((a,b)=>dist(player,a)-dist(player,b))[0]??null;
}
const buildingWorldBefore48=buildWorld;
buildWorld=function(...args){
 const result=buildingWorldBefore48(...args);buildingEntry48.dismissed=null;
 const doors=interactables.filter(isBuildingPortal48);world.userData.buildingPortals48=doors;
 for(const o of doors){
  const front=o.doorOwner39?.userData.front??V3(0,0,1),length=Math.hypot(front.x,front.z)||1;
  o.buildingPortal48={front:[front.x/length,front.z/length],width:o.type==='interiorExit'?2.4:2.55,back:o.type==='interiorExit'?2.2:1.55,depth:3.2};
  o.label=o.type==='interiorExit'?'Proceed outside':'Open '+INTERIORS[o.interior].name;o.radius=4.3;o.autoArmed39=false;
 }
 return result;
};
const buildingNearestBefore48=nearestInteraction;
nearestInteraction=function(){
 const previous=buildingNearestBefore48();if(['poiExit','location'].includes(previous?.type))return previous;
 const portal=nearbyBuildingPortal48();if(portal)return portal;
 if(!isBuildingPortal48(previous))return previous;
 // The older circular trigger must not select a doorway through its back wall.
 return interactables.filter(o=>!isBuildingPortal48(o)&&interactionAvailable(o)&&dist(player,o)<(o.radius??2.5)).sort((a,b)=>interactionPriority(b)-interactionPriority(a)||dist(player,a)-dist(player,b))[0]??null;
};
const buildingActBefore48=act;
act=function(o,...args){
 if(!isBuildingPortal48(o))return buildingActBefore48(o,...args);
 if(buildingEntry48.confirming!==o||!departureControlAvailable()||!insideBuildingPortal48(o))return;
 keys.clear();route=null;
 // The interior handler records the real exterior return point and uses the
 // existing covered transition. Exterior service-NPC dialogue is independent.
 return handleInteriorInteraction(o);
};
function confirmBuildingPortal48(){
 const o=nearbyBuildingPortal48();if(!o||!departureControlAvailable())return;
 buildingEntry48.dismissed=null;buildingEntry48.confirming=o;
 try{act(o);buildingEntry48.confirmed++;}finally{buildingEntry48.confirming=null;}
}
const buildingAutomaticBefore48=updateDoorways39;
updateDoorways39=function(...args){
 const owner=world,all=owner?.userData.thresholds39;if(!all)return buildingAutomaticBefore48(...args);
 owner.userData.thresholds39=all.filter(o=>!isBuildingPortal48(o));
 try{return buildingAutomaticBefore48(...args);}finally{owner.userData.thresholds39=all;}
};
const buildingPrompt48=document.createElement('div');buildingPrompt48.id='building-entry-prompt';buildingPrompt48.className='poi-travel-prompt hidden';
buildingPrompt48.innerHTML='<button type="button"><kbd>E</kbd><span>Open</span></button>';document.body.append(buildingPrompt48);
function updateBuildingPrompt48(){
 const o=nearbyBuildingPortal48();if(buildingEntry48.dismissed&&o!==buildingEntry48.dismissed)buildingEntry48.dismissed=null;
 const visible=!!o&&departureControlAvailable()&&buildingEntry48.dismissed!==o;
 buildingPrompt48.classList.toggle('hidden',!visible);if(!visible)return;
 const label=o.type==='interiorExit'?'Proceed':'Open',name=o.interior?INTERIORS[o.interior].name:'outside';
 showTravelPrompt(buildingPrompt48,label,label+' '+name);buildingPrompt48.querySelector('button').title=name;
}
document.addEventListener('keydown',e=>{
 if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)||!departureControlAvailable())return;
 const portal=nearbyBuildingPortal48(),key=e.key.toLowerCase();if(!portal)return;
 if(key==='escape'){e.preventDefault();e.stopImmediatePropagation();buildingEntry48.dismissed=portal;keys.clear();route=null;updateBuildingPrompt48();}
 else if((key==='e'||key==='enter')&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();initAudio();confirmBuildingPortal48();}
},true);
document.addEventListener('click',e=>{
 const button=e.target.closest('#building-entry-prompt button,#interact-btn,#touch-action33');
 if(!button||!nearbyBuildingPortal48()||!departureControlAvailable())return;
 e.preventDefault();e.stopImmediatePropagation();initAudio();confirmBuildingPortal48();
},true);
const buildingRenderBefore48=render;
render=function(...args){const result=buildingRenderBefore48(...args);updateBuildingPrompt48();return result;};
const buildingEngineBefore48=installEngine;
installEngine=function(...args){
 const result=buildingEngineBefore48(...args),before=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(before()),o=nearbyBuildingPortal48();q.buildingEntry={prompt:!buildingPrompt48.classList.contains('hidden'),label:o?.type==='interiorExit'?'Proceed':'Open',interior:o?.interior??null,confirmed:buildingEntry48.confirmed,automatic:false};return JSON.stringify(q);};return result;
};
