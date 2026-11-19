const visibility63={world:null,mode:null};
const postBefore63=setupPost;
setupPost=function(...args){
 const result=postBefore63(...args);post.target.stencilBuffer=true;
 // The sun shafts use the stencil to distinguish ground from other surfaces.
 post.target.depthTexture.format=THREE.DepthStencilFormat;post.target.depthTexture.type=THREE.UnsignedInt248Type;
 return result;
};
function markGroundStencil63(o){
 if(o.userData.stencil63)return;o.userData.stencil63=true;
 const before=o.onBeforeRender;
 o.onBeforeRender=function(r,s,c,...args){
  before?.call(this,r,s,c,...args);
  for(const m of Array.isArray(this.material)?this.material:[this.material]){
   // Non-depth effects retain their own stencil filters (notably sun shafts).
   // Opaque and alpha-tested surfaces label only the pixels they actually draw.
   if(!m?.depthWrite)continue;
   m.stencilWrite=c===camera;m.stencilRef=this.userData.groundSurface69?2:0;
   m.stencilFunc=THREE.AlwaysStencilFunc;m.stencilFail=m.stencilZFail=THREE.KeepStencilOp;m.stencilZPass=THREE.ReplaceStencilOp;
  }
 };
}
const createBefore63=createActor;
createActor=function(...args){const a=createBefore63(...args);if(a)markGroundStencil63(a.mesh);return a;};
function clearExplorationCuts63(){
 for(const t of scenery.trees)if(t.hidden){t.until=0;hideTree(t,false);}
 for(const c of world.userData.cutaways??[]){
  c.until=0;c.hidden=false;c.fade.value=c.target=0;
  for(const m of c.meshes)m.userData.viewHidden=false;
  if(c.group.userData.plantsHidden){setBuildingPlantsHidden(c.group,false);c.group.userData.plantsHidden=false;}
 }
}
const cutsBefore63=updateCutaways;
updateCutaways=function(...args){
 const exploration=!battle&&state.mode!=='title';
 if(visibility63.world!==world||visibility63.mode!==exploration){
  if(exploration&&world)clearExplorationCuts63();visibility63.world=world;visibility63.mode=exploration;
 }
 if(!exploration)cutsBefore63(...args);
};
// Click routes and follower routes obey the same nonblocking NPC rule as keys.
const routeBefore63=findRoute;
findRoute=function(from,to,avoid=[],...args){return routeBefore63(from,to,(from===player||from.party)?avoid.filter(a=>!a.npc):avoid,...args);};

// A single door-style component handles every contextual interaction. Existing
// portal confirmation guards retain ownership of travel and interior handoffs.
const contextPrompt63=document.createElement('div');contextPrompt63.id='context-prompt63';contextPrompt63.className='poi-travel-prompt hidden';
contextPrompt63.innerHTML='<button type="button"><kbd>E</kbd><span>Interact</span></button>';document.body.append(contextPrompt63);
let contextTarget63=null;
function contextLabel63(o){
 if(isBuildingPortal48(o))return o.type==='interiorExit'?'Proceed':'Open';
 if(o.type==='poiExit')return 'Proceed';if(o.type==='location')return 'Enter '+POIS[o.poi].name;
 if(o.actor?.npc||['villager','npcConversation'].includes(o.type))return 'Talk';
 if(/chest/i.test(o.type+' '+o.label))return 'Open';
 if(/pickup|pick.?up|item|collect|gather/i.test(o.type+' '+o.label))return 'Pick up';
 return o.label?.replace(/^E\s*[·:]?\s*/,'')??'Interact';
}
function updateContextPrompt63(){
 for(const el of[buildingPrompt48,departurePrompt,entryPrompt,$('#interact')])el.classList.add('hidden');
 let o=departureControlAvailable()?nearestInteraction():null;
 if(o&&(isBuildingPortal48(o)&&buildingEntry48.dismissed===o||o.type==='poiExit'&&poiDeparture.dismissed===o||o.type==='location'&&poiEntry.dismissed===o))o=null;
 contextTarget63=o;contextPrompt63.classList.toggle('hidden',!o);if(!o)return;
 showTravelPrompt(contextPrompt63,contextLabel63(o),o.label??contextLabel63(o));
}
contextPrompt63.querySelector('button').onclick=()=>{
 const o=contextTarget63;if(!o||!departureControlAvailable()||nearestInteraction()!==o)return;
 initAudio();if(isBuildingPortal48(o))confirmBuildingPortal48();else if(o.type==='poiExit')confirmDeparture();else if(o.type==='location')confirmWorldEntrance();else act(o);
};
const contextRenderBefore63=render;
render=function(...args){const result=contextRenderBefore63(...args);updateContextPrompt63();return result;};

// A world line is narration, while named residents and party members keep the
// existing portrait panel. Mixed conversations switch presentation per line.
function syncNarration63(){
 const speaker=dialogue?.lines[dialogue.index]?.[0],narration=!!dialogue&&(!speaker||/^(the world|world|world voice|narrator)$/i.test(speaker.trim()));
 $('#dialogue').classList.toggle('world-narration63',narration);
 if(narration){$('#speaker').textContent='The World';$('#dialogue').setAttribute('aria-label','World narration');}
 else $('#dialogue').removeAttribute('aria-label');
}
const showBefore63=showDialogue;
showDialogue=function(...args){const result=showBefore63(...args);syncNarration63();return result;};
const nextBefore63=nextDialogue;
nextDialogue=function(...args){const result=nextBefore63(...args);syncNarration63();return result;};
const contextBootBefore63=boot;
boot=async function(...args){
 const result=await contextBootBefore63(...args),before=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(before());q.context={label:contextTarget63?contextLabel63(contextTarget63):null,type:contextTarget63?.type??null,narration:$('#dialogue').classList.contains('world-narration63'),occlusion:'dithered-player-cutout',npcBlocking:false,overworldTreeBlocking:false};return JSON.stringify(q);};return result;
};
