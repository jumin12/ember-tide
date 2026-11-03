// Directional guidance belongs to a quest the player chose to track. Story
// progression, ordinary movement and map pins do not enable it implicitly.
const trackingBuildBefore48=buildWorld;
buildWorld=function(...args){state.storyTracked48=state.storyTracked48===true;return trackingBuildBefore48(...args);};
state.storyTracked48=state.storyTracked48===true;
const trackingSaveBefore48=normalizeJourneySave;
normalizeJourneySave=function(...args){const s=trackingSaveBefore48(...args);s.storyTracked48=s.storyTracked48===true;return s;};
function trackedQuest48(){
 const key=state.trackedRequest16,spec=LOCAL_REQUESTS16[key],request=key&&state.localRequests16?.[key];
 if(spec&&request?.accepted&&!request.claimed){
  let target;if(activeScene?.key===key)target=request.done.length===3?interactables.find(o=>o.type==='localBoard'&&o.requestKey===key):interactables.find(o=>o.type==='localTask'&&o.requestKey===key&&interactionAvailable(o));
  else target=activeScene?.kind==='overworld'?interactables.find(o=>o.type==='location'&&o.poi===key):interactables.filter(o=>o.type==='poiExit').sort((a,b)=>dist(player,a)-dist(player,b))[0];
  return target?{kind:'request',key,target,label:spec.title}:null;
 }
 if(state.storyTracked48&&currentBeat()[0]!=='complete'){const pinned=state.trackedPoi;let target;try{state.trackedPoi=null;target=objectiveTarget();}finally{state.trackedPoi=pinned;}return target?{kind:'story',key:currentBeat()[0],target,label:currentBeat()[2]}:null;}
 return null;
}
function updateTrackedGuidance48(){
 const tracked=player?trackedQuest48():null,show=!!tracked&&departureControlAvailable(),compass=$('#overworld-compass');
 if(compass){compass.hidden=!show;compass.classList.toggle('hidden',!show);if(show){const goal=tracked.target,b=screenBasis(),dx=goal.x-player.x,dz=goal.z-player.z,angle=Math.atan2(dx*b.right.x+dz*b.right.z,-(dx*b.down.x+dz*b.down.z))*180/Math.PI,distance=Math.round(dist(player,goal)*(compactWorld44()?compactTraversal44.metres:1));compass.innerHTML='<span class="compass-needle" style="transform:rotate('+angle+'deg)">&#8593;</span><span>'+esc(tracked.label)+'</span><b>'+distance+' m</b>';}}
 let arrow=mentor17.worldArrow;if(!arrow&&show){arrow=mentor17.worldArrow=document.createElement('div');arrow.id='mentor-world-arrow17';arrow.innerHTML='<b>&#9660;</b><span></span>';document.body.append(arrow);}if(!arrow)return;
 arrow.hidden=!show;arrow.classList.toggle('hidden',!show);if(!show)return;
 const goal=tracked.target,actor=goal.actor,point=V3(actor?.mesh.position.x??goal.x,(actor?.mesh.position.y??heightAt(goal.x,goal.z))+(actor?actor.size+1:2.1),actor?.mesh.position.z??goal.z).project(camera),outside=Math.abs(point.x)>.92||Math.abs(point.y)>.83||point.z>1;
 arrow.classList.toggle('offscreen',outside);arrow.style.left=clamp((point.x*.5+.5)*innerWidth,50,innerWidth-50)+'px';arrow.style.top=clamp((-point.y*.5+.5)*innerHeight,94,innerHeight-125)+'px';arrow.querySelector('span').textContent=(outside?'Tracked quest':'Quest objective')+' · '+Math.round(dist(player,goal)*(compactWorld44()?compactTraversal44.metres:1))+' m';
}
mentorArrow17=updateTrackedGuidance48;
const trackingHudBefore48=updateHUD;
updateHUD=function(...args){const r=trackingHudBefore48(...args);updateTrackedGuidance48();return r;};
const trackingRenderBefore48=render;
render=function(...args){const r=trackingRenderBefore48(...args);updateTrackedGuidance48();return r;};
const trackingDetailBefore48=journalDetail26;
journalDetail26=function(...args){
 const r=trackingDetailBefore48(...args),panel=$('.journal-detail26');if(panel&&(menu.quest26??state.beat)===state.beat&&currentBeat()[0]!=='complete')panel.querySelector('.journal-banner26').insertAdjacentHTML('beforeend','<button type="button" class="quest-tracking48" data-story-track48 aria-pressed="'+(state.storyTracked48===true)+'">'+(state.storyTracked48?'Stop tracking':'Track quest')+'</button>');return r;
};
const trackingRequestsBefore48=renderLocalRequests16;
renderLocalRequests16=function(...args){const r=trackingRequestsBefore48(...args);for(const button of document.querySelectorAll('[data-request]')){const key=button.dataset.request;if(state.trackedRequest16===key&&state.localRequests16?.[key]?.accepted&&!state.localRequests16[key].claimed)button.insertAdjacentHTML('afterend','<button type="button" data-request-stop48="'+key+'">Stop tracking</button>');}return r;};
const trackingAcceptBefore48=acceptRequest16;
acceptRequest16=function(...args){const r=trackingAcceptBefore48(...args);if(r&&state.trackedRequest16)state.storyTracked48=false;updateTrackedGuidance48();return r;};
document.addEventListener('click',e=>{
 const story=e.target.closest('[data-story-track48]'),side=e.target.closest('[data-request-stop48]');if(!story&&!side)return;
 e.preventDefault();e.stopImmediatePropagation();if(story){state.storyTracked48=!state.storyTracked48;if(state.storyTracked48)state.trackedRequest16=null;}else state.trackedRequest16=null;
 if(menu)renderMenu();updateTrackedGuidance48();
},true);
// Help text remains useful when the player has chosen to explore without an arrow.
if(TUTOR17.move)TUTOR17.move.text='Use WASD, arrow keys, or click the path. Track quests in the Journal (J) when you want directional guidance.';
if(TUTOR17.report)TUTOR17.report.text='Speak to the local representative in the square. Track this quest in the Journal (J) to show its direction.';
if(TUTOR17.journal)TUTOR17.journal.text='The Journal holds story objectives and local requests. Choose Track quest to enable directional guidance.';
for(const key of ['move','report','journal'])if(GUIDE16[key]&&TUTOR17[key])GUIDE16[key][1]=TUTOR17[key].text;
const trackingEngineBefore48=installEngine;
installEngine=function(...args){const r=trackingEngineBefore48(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before()),t=trackedQuest48();q.questTracking={story:state.storyTracked48===true,request:state.trackedRequest16??null,active:t?{kind:t.kind,key:t.key}:null,guidanceVisible:!!t&&departureControlAvailable()};return JSON.stringify(q);};return r;};
