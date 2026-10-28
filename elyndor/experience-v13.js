// Grounded characters, deliberate sprinting, useful thresholds and quiet chatter.
const experience={bubbles:[],saveCircle:false,exits:0};
function movementSpeed(){return keys.has('shift')?5.9:4.8;}
function actorRadius(a){return a.party ? .48 : .41;}
const actorBeforeUpright=createActor;
createActor=function(...args){const a=actorBeforeUpright(...args);if(!a)return a;const m=a.mesh.material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.onBeforeCompile=function(sh,...params){before.call(this,sh,...params);sh.vertexShader=sh.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal=normalize(objectNormal+vec3(0.,.45,0.));');};m.customProgramCacheKey=()=>key()+'-upright-v13';return a;};
const cameraBeforeUpright=updateCamera;
updateCamera=function(...args){cameraBeforeUpright(...args);if(!camera)return;const yaw=Math.atan2(camera.position.x-cameraTarget.x,camera.position.z-cameraTarget.z),pitch=Math.atan2(camera.position.y-cameraTarget.y,Math.hypot(camera.position.x-cameraTarget.x,camera.position.z-cameraTarget.z));for(const a of actors){a.mesh.quaternion.setFromAxisAngle(V3(0,1,0),yaw);a.mesh.scale.y=1/Math.max(.78,Math.cos(pitch));}};

function groundDecal(x,z,map,size=3,rotation=0,color='#e8dfbe'){
 const g=new THREE.PlaneGeometry(size,size,6,6);g.rotateX(-Math.PI/2);g.rotateY(rotation);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,heightAt(x+p.getX(i),z+p.getZ(i))+.035);g.computeVertexNormals();
 const m=new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.035,depthWrite:false,roughness:.9,color,emissive:color,emissiveIntensity:.13,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide});const o=mesh(g,m,x,0,z);o.castShadow=false;o.userData.dynamicFX=true;return o;
}
scenePortal=function(type,x,z,label,data={}){
 const p=safePoint({x,z},.65);createInteraction(type,p.x,p.z,label);const o=interactables.at(-1);Object.assign(o,data,{radius:type==='location'?6:3.6,visualHeight:.2});
 if(type!=='location'){const center=POIS[activeScene.key]?.spawn??[p.x,p.z+10],dx=p.x-center[0],dz=p.z-center[1],len=Math.hypot(dx,dz)||1;o.departDirection=[dx/len,dz/len];o.floorMarker=groundDecal(p.x,p.z,textures.exitMarker??textures.runeSeal,3.6,Math.atan2(-dx,-dz));o.type==='poiExit'&&experience.exits++;}
 return o;
};
function createSaveCircle(x,z){const p=safePoint({x,z},.75);createInteraction('saveCircle',p.x,p.z,'Record your journey');const o=interactables.at(-1);o.radius=2.5;o.visualHeight=.15;groundDecal(p.x,p.z,textures.saveSeal??textures.runeSeal,3.2,0,'#acd8cc');world.userData.saveCircles??=[];world.userData.saveCircles.push(o);}
function extraLevelExits(){
 if(activeScene.kind!=='poi'||world.userData.floorExitsReady)return;world.userData.floorExitsReady=true;const q=POIS[activeScene.key],[a,b,c,d]=q.bounds,spawn={x:player.x,z:player.z},candidates=[];
 for(const p of LEVEL_THRESHOLDS[activeScene.key]??[])if(staticFree(p.x,p.z,.65))scenePortal('poiExit',p.x,p.z,p.label,{poi:activeScene.key});
 // A broad, directly reachable circle beside the arrival path. No expensive
 // speculative routes to distant service NPCs are needed during scene loading.
 // Journey records belong to inns; outdoor roads carry exits only.
}
const buildBeforeFloorExits=buildWorld;
buildWorld=function(...args){buildBeforeFloorExits(...args);if(activeScene.kind==='poi')extraLevelExits();else if(activeScene.kind==='interior'){for(const o of interactables.filter(o=>o.type==='interiorExit'))groundDecal(o.x,o.z,textures.exitMarker??textures.runeSeal,2.8,Math.PI);if(INTERIORS[activeScene.key].type==='inn')createSaveCircle(-9,5);}};
returnToOverworld=function(o=null){const p=POIS[activeScene.key]??POIS[state.interiorReturn?.poi]??POIS.brookstead,d=o?.departDirection??[0,1];changeJourneyScene('overworld',[p.node[0]+d[0]*12,p.node[1]+d[1]*12]);};

function showSpeechBubble(actor,text,speaker=''){if(!actor)actor=player;const layer=$('#chatter-layer')??document.body.appendChild(Object.assign(document.createElement('div'),{id:'chatter-layer'}));for(const q of experience.bubbles.filter(q=>q.actor===actor)){q.node.remove();experience.bubbles.splice(experience.bubbles.indexOf(q),1);}const node=document.createElement('div');node.className='npc-bubble';node.textContent=text;layer.append(node);experience.bubbles.push({actor,node,until:clock+Math.max(4.5,text.length*.055)});if(speaker)playRecordedVoice(speaker,text);while(experience.bubbles.length>4)experience.bubbles.shift().node.remove();}
let ambientSpeaker=null;
const dialogueBeforeChatter=startDialogue;
startDialogue=function(lines,done){if(ambientSpeaker){const line=lines.find(q=>q[1])??['',''];showSpeechBubble(ambientSpeaker.actor??player,line[1],line[0]);if(done)done();return;}return dialogueBeforeChatter(lines,done);};
const interactionBeforeChatter=act;
act=function(o){if(!o)return;if(o.type==='saveCircle'){experience.saveCircle=true;openMenu('save');return;}if(o.type==='poiExit'){returnToOverworld(o);return;}if(o.type==='villager'||['sign','water','records'].includes(o.type)||activeScene.kind==='interior'&&['shop','inn'].includes(o.type)){ambientSpeaker=o;try{return interactionBeforeChatter(o);}finally{ambientSpeaker=null;}}return interactionBeforeChatter(o);};
MENU_TABS.splice(MENU_TABS.findIndex(q=>q[0]==='save'),1);
const openBeforeCircle=openMenu;
openMenu=function(tab){if(tab==='save'&&!experience.saveCircle)return toast('Record your journey at a save circle.');return openBeforeCircle(tab);};
const closeBeforeCircle=closeMenu;
closeMenu=function(){closeBeforeCircle();experience.saveCircle=false;};
const renderBeforeCircle=renderMenu;
renderMenu=function(){renderBeforeCircle();if(menu?.tab==='save'){$('#menu-title').textContent='Chronicle circle';$('#menu-content h3').textContent='Record your journey';}if(menu?.tab==='settings'){for(const row of $$('.controls-table span'))if(row.textContent.includes('Always run'))row.textContent='Move normally · Hold Shift to sprint';}};
const tickBeforeChatter=tick;
tick=function(dt){tickBeforeChatter(dt);if(!player||gameLoading)return;for(let i=experience.bubbles.length-1;i>=0;i--){const q=experience.bubbles[i];if(clock>q.until||q.actor.mesh.parent!==world){q.node.remove();experience.bubbles.splice(i,1);continue;}const p=V3(q.actor.x,heightAt(q.actor.x,q.actor.z)+2.8,q.actor.z).project(camera);q.node.style.left=clamp((p.x*.5+.5)*innerWidth,110,innerWidth-110)+'px';q.node.style.top=clamp((-p.y*.5+.5)*innerHeight,60,innerHeight-70)+'px';q.node.style.opacity=Math.min(1,(q.until-clock)*2);}};
