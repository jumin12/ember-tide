// Exploration accessibility: keep scenery intact and reveal only the player's
// current pose where tagged scenery depth actually covers it. One extra draw;
// no scene-depth copy, per-tree raycasts, or object opacity changes.
const visibility63={world:null,mode:null,actor:null,mesh:null,material:null,main:{value:1}};
const postBefore63=setupPost;
setupPost=function(...args){
 const result=postBefore63(...args);post.target.stencilBuffer=true;
 // Keep the existing sampled scene depth for lighting/focus, with a stencil
 // channel in the same attachment to identify the nearest visible surface.
 post.target.depthTexture.format=THREE.DepthStencilFormat;post.target.depthTexture.type=THREE.UnsignedInt248Type;
 return result;
};
function markOccluder63(o,valid){
 if(o.userData.stencil63)return;o.userData.stencil63=true;o.userData.occluder63=valid;
 const before=o.onBeforeRender;
 o.onBeforeRender=function(r,s,c,...args){
  before?.call(this,r,s,c,...args);
  for(const m of Array.isArray(this.material)?this.material:[this.material]){
   m.stencilWrite=c===camera&&m.depthWrite;m.stencilRef=this.userData.occluder63?1:this.userData.groundSurface69?2:0;
   m.stencilFunc=THREE.AlwaysStencilFunc;m.stencilFail=m.stencilZFail=THREE.KeepStencilOp;m.stencilZPass=THREE.ReplaceStencilOp;
  }
 };
}
const createBefore63=createActor;
createActor=function(...args){const a=createBefore63(...args);if(a)markOccluder63(a.mesh,false);return a;};
const worldBefore63=buildWorld;
buildWorld=function(...args){
 const result=worldBefore63(...args),actorMeshes=new Set(actors.map(a=>a.mesh)),terrain=new Set(world.userData.terrainChunks??[]),buildings=new Set(world.userData.buildings??[]),trees=new Set(scenery.forestMeshes);
 world.traverse(o=>{
  if(!o.isMesh||o===visibility63.mesh)return;
  let inBuilding=false;for(let p=o;p&&p!==world;p=p.parent)if(buildings.has(p)){inBuilding=true;break;}
  const ground=terrain.has(o)||o.userData.terrain||o.geometry?.attributes.pathMix||o.geometry?.attributes.terrainRoad||o.userData.plantKey||o===water||o.userData.waterRole||o.userData.water62===true||o.userData.freshwater38;
  o.geometry.computeBoundingBox();const height=o.geometry.boundingBox.max.y-o.geometry.boundingBox.min.y;
  o.userData.groundSurface69=!!ground;markOccluder63(o,!actorMeshes.has(o)&&!ground&&(inBuilding||trees.has(o)||height>1));
 });
 return result;
};
function clearExplorationCuts63(){
 for(const t of scenery.trees)if(t.hidden){t.until=0;hideTree(t,false);}
 for(const c of world.userData.cutaways??[]){
  c.until=0;c.hidden=false;c.fade.value=c.target=0;
  for(const m of c.meshes)m.userData.viewHidden=false;
  if(c.group.userData.plantsHidden){setBuildingPlantsHidden(c.group,false);c.group.userData.plantsHidden=false;}
 }
}
function syncSilhouette63(){
 const q=visibility63;
 if(q.actor!==player){
  q.mesh?.removeFromParent();q.material?.dispose();q.actor=player;q.mesh=q.material=null;
  if(player){
   const m=new THREE.MeshBasicMaterial({map:player.mesh.material.map,color:'#f5dfad',alphaTest:.42,transparent:true,opacity:.64,depthTest:true,depthWrite:false,depthFunc:THREE.GreaterDepth,stencilWrite:true,stencilRef:1,stencilFunc:THREE.EqualStencilFunc,stencilFail:THREE.KeepStencilOp,stencilZFail:THREE.KeepStencilOp,stencilZPass:THREE.KeepStencilOp,side:THREE.DoubleSide,fog:false,toneMapped:false});
   m.onBeforeCompile=sh=>{
    sh.uniforms.mainView63=q.main;
    sh.fragmentShader='uniform float mainView63;\n'+sh.fragmentShader;
    sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`if(mainView63<.5)discard;
      #ifdef USE_MAP
      vec4 texelColor=texture2D(map,vMapUv);
      diffuseColor.a*=texelColor.a;
      #endif`);
   };
   m.customProgramCacheKey=()=> 'player-occluded-pose63';
   const o=new THREE.Mesh(player.mesh.geometry,m);o.name='Occluded player silhouette';o.renderOrder=10000;o.castShadow=o.receiveShadow=false;
   o.onBeforeRender=(r,s,c)=>{q.main.value=c===camera?1:0;};
   player.mesh.add(o);q.mesh=o;q.material=m;
  }
 }
 if(q.mesh){
  // Restoring battle art can replace the retained actor's texture and plane.
  // Follow those resources as well as the normal atlas frame/UV animation.
  q.mesh.geometry=player.mesh.geometry;
  if(q.material.map!==player.mesh.material.map){q.material.map=player.mesh.material.map;q.material.needsUpdate=true;}
  q.mesh.visible=!!player?.mesh.visible&&['explore','dialogue'].includes(state.mode)&&!battle&&!gameLoading&&!transition;
 }
}
const cutsBefore63=updateCutaways;
updateCutaways=function(...args){
 const exploration=!battle&&state.mode!=='title';
 if(visibility63.world!==world||visibility63.mode!==exploration){
  if(exploration&&world)clearExplorationCuts63();visibility63.world=world;visibility63.mode=exploration;
 }
 if(!exploration)cutsBefore63(...args);
 syncSilhouette63();
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
 window.render_game_to_text=()=>{const q=JSON.parse(before());q.context={label:contextTarget63?contextLabel63(contextTarget63):null,type:contextTarget63?.type??null,narration:$('#dialogue').classList.contains('world-narration63'),silhouetteReady:!!visibility63.mesh?.visible,occlusion:'tagged-scenery-depth',npcBlocking:false,overworldTreeBlocking:false};return JSON.stringify(q);};return result;
};
