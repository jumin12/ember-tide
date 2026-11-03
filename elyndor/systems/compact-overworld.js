// Atlas coordinates remain stable for geography, saves and the map. Traversal
// uses a miniature scale: one atlas unit is .4 metres relative to the party.
// Matching party size, stride, collision, lens and distance readouts produces
// the same compact space without moving an authored coastline or POI.
const compactTraversal44={metres:.4,partyScale:2.5,routing:0,target:V3(),visible:[]};
function compactWorld44(){return activeScene?.kind==='overworld'&&!battle&&!restoration;}
const compactSpeedBefore44=movementSpeed;movementSpeed=function(){const v=compactSpeedBefore44();return compactWorld44()?v/compactTraversal44.metres:v;};
const compactRadiusBefore44=actorRadius;actorRadius=function(a){const r=compactRadiusBefore44(a);return compactWorld44()&&a.party?r*compactTraversal44.partyScale:r;};
const compactFreeBefore44=staticFree;staticFree=function(x,z,r=.4){if(compactWorld44()&&compactTraversal44.routing&&r<1)r=Math.max(r*compactTraversal44.partyScale,1.2);return compactFreeBefore44(x,z,r);};
const compactRouteBefore44=findRoute;findRoute=function(...args){if(!compactWorld44())return compactRouteBefore44(...args);compactTraversal44.routing++;try{return compactRouteBefore44(...args);}finally{compactTraversal44.routing--;}};
const compactTrailBefore44=trailPoint;trailPoint=function(d){return compactTrailBefore44(compactWorld44()?d*compactTraversal44.partyScale:d);};
const compactMentorBefore44=mentorArrow17;
mentorArrow17=function(...args){const result=compactMentorBefore44(...args),n=mentor17.worldArrow,target=mentorTarget17(mentorStep17());if(compactWorld44()&&n&&!n.hidden&&target)n.querySelector('span').textContent=(n.classList.contains('offscreen')?'Follow the marker · ':'E · ')+Math.round(dist(player,target)*compactTraversal44.metres)+' m';return result;};
const compactMoveBefore44=moveActor;
moveActor=function(a,...args){const phase=a.phase,moved=compactMoveBefore44(a,...args);if(compactWorld44()&&a.party&&moved>0)a.phase=(phase+moved*compactTraversal44.metres/2)%1;return moved;};
const compactTickBefore44=tick;
tick=function(dt){const before=state.encounterDistance,result=compactTickBefore44(dt);if(compactWorld44()&&state.encounterDistance>=before)state.encounterDistance=before+(state.encounterDistance-before)*compactTraversal44.metres;return result;};
const compactTreeBefore44=buildSolidTree;
buildSolidTree=function(x,z,...args){if(activeScene?.kind==='overworld'&&Object.values(POIS).some(p=>Math.hypot(x-p.node[0],z-p.node[1])<(p.kind==='town'?38:31)))return null;return compactTreeBefore44(x,z,...args);};
const compactBuildBefore44=buildWorld;
buildWorld=function(...args){const result=compactBuildBefore44(...args);if(activeScene?.kind==='overworld'&&player){const p=safePoint(player,actorRadius(player)+.1);if(dist(p,player)>.01){player.x=p.x;player.z=p.z;spawnPartyTrail([p.x,p.z]);for(const a of[player,...followers])updateActor(a,0);}roadNavGraph=null;world.userData.compactTraversal44={metresPerAtlasUnit:compactTraversal44.metres};}return result;};
const compactCameraBefore44=updateCamera;
updateCamera=function(dt=1/60,instant=false){
 const result=compactCameraBefore44(dt,instant),q=compactTraversal44;
 if(!compactWorld44()||!player){for(const a of actors)if(a.mesh.userData.compactParty44){a.mesh.scale.x=a.mesh.scale.z=1;delete a.mesh.userData.compactParty44;}return result;}
 // Follow the party's centre at simulation time; renderSimulation interpolates
 // this pose together with the sprites. Direction changes never shift the lens.
 const party=[player,...followers].filter(a=>a.mesh.visible);q.target.set(0,0,0);
 for(const a of party)q.target.add(V3(a.x,a.mesh.position.y+a.size*q.partyScale*.5,a.z));
 q.target.multiplyScalar(1/party.length);cameraTarget.copy(q.target);
 const offset=V3(0,78,118).multiplyScalar(state.settings.zoom??1);camera.position.copy(cameraTarget).add(offset);camera.fov=43;camera.far=1000;post.material.uniforms.nearFar.value.y=1000;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 const yaw=Math.atan2(offset.x,offset.z),pitch=Math.atan2(offset.y,Math.hypot(offset.x,offset.z));
 for(const a of actors){a.mesh.quaternion.setFromAxisAngle(axis24,yaw);a.mesh.scale.y=1/Math.max(.78,Math.cos(pitch));if(a.party){a.mesh.scale.x=a.mesh.scale.z=q.partyScale;a.mesh.scale.y*=q.partyScale;a.mesh.userData.compactParty44=true;}}
 focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);sideCameraStats.angle=pitch*180/Math.PI;return result;
};
// Keep only distant atmospheric fog, rather than veiling the playable map when
// the overview lens is farther from the party. Weather still sets its colour.
const compactLightBefore44=updateLighting;
updateLighting=function(...args){const result=compactLightBefore44(...args);if(activeScene?.kind==='overworld'){scene.fog.near=mix(340,225,weather.rain.value);scene.fog.far=mix(880,520,weather.rain.value);}return result;};
const compactCloudBefore44=cloudShelf21;
cloudShelf21=function(...args){
 const result=compactCloudBefore44(...args);if(activeScene?.kind!=='overworld')return result;
 const cloud=world.userData.weather?.cloud;if(!cloud)return result;const height=Math.max(270,weather.height.value),delta=height-weather.height.value;weather.height.value=height;cloud.position.y+=delta;cloud.updateMatrixWorld(true);
 for(const key of['cloudMin32','cloudMax32'])if(cloud.material.uniforms[key])cloud.material.uniforms[key].value.y+=delta;
 if(world.userData.cloud21)world.userData.cloud21.height=height;return result;
};
// Labels identify actual visible landmarks; mountain silhouettes can occlude
// them. They are destination names, not exit arrows or quest-direction decals.
const worldLabels44=document.createElement('div');worldLabels44.id='world-landmarks44';document.body.appendChild(worldLabels44);
for(const[key,p]of Object.entries(POIS)){const n=document.createElement('div');n.dataset.poi=key;n.className='hidden';n.textContent=p.name;worldLabels44.appendChild(n);}
function updateWorldLabels44(){
 const q=compactTraversal44;q.visible=[];const show=compactWorld44()&&state.mode==='explore'&&!gameLoading&&!poiFade.active&&!menu&&!document.querySelector('#hud.hidden');worldLabels44.classList.toggle('hidden',!show);if(!show)return;
 for(const n of worldLabels44.children){
  const key=n.dataset.poi,p=POIS[key],anchor=worldEntrancePoint45(key),distance=dist(player,anchor),height=macroGround(anchor.x,anchor.z)+(p.kind==='town'?14:9),point=V3(anchor.x,height,anchor.z),screen=point.clone().project(camera);
  let visible=distance<(p.kind==='town'?260:120)&&screen.z<1&&Math.abs(screen.x)<.91&&screen.y>-.48&&screen.y<.72;
  if(visible)for(let t=.08;t<.95;t+=.045){const x=mix(camera.position.x,point.x,t),z=mix(camera.position.z,point.z,t);if(macroGround(x,z)>mix(camera.position.y,point.y,t)+.5){visible=false;break;}}
  n.classList.toggle('hidden',!visible);if(!visible)continue;
  n.style.left=(screen.x*.5+.5)*innerWidth+'px';n.style.top=(-screen.y*.5+.5)*innerHeight+'px';n.classList.toggle('near',distance<22);q.visible.push(key);
 }
 const goal=waypoint??objectiveTarget(),distance=$('#overworld-compass b');if(goal&&distance)distance.textContent=Math.round(dist(player,goal)*q.metres)+' m';
}
const compactRenderBefore44=render;render=function(...args){const result=compactRenderBefore44(...args);updateWorldLabels44();return result;};
const compactBootBefore44=boot;boot=async function(...args){const result=await compactBootBefore44(...args),previous=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(previous());q.overworld={...q.overworld,compact:compactWorld44(),metresPerAtlasUnit:compactTraversal44.metres,visibleLandmarks:compactTraversal44.visible};return JSON.stringify(q);};return result;};
