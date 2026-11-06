// Local review batch: persistent objects and navigation use the completed
// scene, rather than an earlier, still-unbounded construction phase.
const review68={relocations:[],chests:new Set(),help:[],transitions:[]};
function settleRequestTargets68(){
 if(activeScene?.key!=='brookstead'||activeScene?.kind!=='poi'||!player||world.userData.requestTargetsChecked68)return;
 const objects=world.userData.localRequests16?.props??[],used=[];
 for(const o of objects){
  const reachable=p=>staticFree(p.x,p.z,.85)&&!waterGround(p.x,p.z)&&!used.some(q=>dist(q,p)<3)&&!!findRoute(player,p,[]);
  if(reachable(o)){used.push(o);continue;}
  const candidates=[],field=world.userData.boundary46;
  for(const s of field?.shapes??[])for(let t=0;t<=1;t+=.125)for(const side of[-2,0,2]){
   const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],n=Math.hypot(dx,dz)||1;
   const p={x:mix(s.a[0],s.b[0],t)-dz/n*side,z:mix(s.a[1],s.b[1],t)+dx/n*side};
   if(staticFree(p.x,p.z,.85)&&!waterGround(p.x,p.z)&&!used.some(q=>dist(q,p)<3)&&!interactables.some(q=>q!==o&&dist(q,p)<2.5))candidates.push(p);
  }
  // Some interior-style POIs have no forest field. Their road centerlines
  // still provide authored, navigable candidates without widening a boundary.
  if(!field)for(const r of ROADS)for(const p of r.p)if(inSceneBounds(p[0],p[1],-2))candidates.push({x:p[0],z:p[1]});
  candidates.sort((a,b)=>dist(a,o)-dist(b,o));const p=candidates.find(reachable);
  if(!p){console.warn('No reachable request anchor',activeScene.key,o.taskIndex);continue;}
  const from=[o.x,o.z];o.x=p.x;o.z=p.z;
  if(o.requestProp)o.requestProp.position.set(p.x,heightAt(p.x,p.z),p.z);
  if(o.floorMarker){o.floorMarker.removeFromParent();o.floorMarker=groundDecal(p.x,p.z,textures.runeSeal??textures.saveSeal,1.8,0,'#8ed5c7');}
  used.push(o);review68.relocations.push({scene:activeScene.key,index:o.taskIndex,from,to:[p.x,p.z]});
 }
 world.userData.requestTargetsChecked68=true;refreshRequestProps16();minimap51.baseKey='';minimap51.markerKey='';
}
const requestFinalBefore68=buildWorld;
buildWorld=function(...args){review68.chests.clear();const r=requestFinalBefore68(...args);for(const o of interactables)if(o.chest68)review68.chests.add(o);settleRequestTargets68();return r;};
const requestReadyBefore68=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){const r=await requestReadyBefore68(...args);settleRequestTargets68();return r;};

const objectiveBefore68=objectiveTarget;
objectiveTarget=function(...args){const o=objectiveBefore68(...args);return o&&currentBeat()[0]==='tavinIntro'&&activeScene?.key==='fern'&&o.actor&&!o.actor.mesh.visible?{...o,actor:null}:o;};
const restraintAvailableBefore68=interactionAvailable;
interactionAvailable=function(o,...args){if(o?.type==='tavin'&&activeScene?.key==='fern'&&currentBeat()[0]==='tavinIntro')return !battle;return restraintAvailableBefore68(o,...args);};

let abandonPending68=null;
function abandonRequest68(key){
 const q=state.localRequests16?.[key];if(!LOCAL_REQUESTS16[key]||!q?.accepted||q.claimed)return false;
 q.accepted=false;q.done=[];if(state.trackedRequest16===key)state.trackedRequest16=null;
 if(localRequests16.work?.target.requestKey===key){localRequests16.work=null;if(state.mode==='localWork')state.mode='explore';}
 if(route?.action?.requestKey===key)route=null;waypoint=null;abandonPending68=null;
 refreshRequestProps16();localRequests16.signature='';updateTrackedGuidance48();autoSave();toast('Request abandoned · You can accept it again at its notice.');return true;
}
const requestsUiBefore68=renderLocalRequests16;
renderLocalRequests16=function(...args){const r=requestsUiBefore68(...args);for(const b of document.querySelectorAll('[data-request]')){const key=b.dataset.request,q=state.localRequests16?.[key];if(!q?.accepted||q.claimed)continue;b.parentElement.insertAdjacentHTML('beforeend',abandonPending68===key?'<span class="abandon-confirm68">Discard request progress? <button data-abandon-confirm68="'+key+'">Abandon</button><button data-abandon-cancel68>Keep request</button></span>':'<button data-abandon68="'+key+'">Abandon request</button>');}return r;};
document.addEventListener('click',e=>{const b=e.target.closest('[data-abandon68],[data-abandon-confirm68],[data-abandon-cancel68]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.hasAttribute('data-abandon-confirm68'))abandonRequest68(b.dataset.abandonConfirm68);else abandonPending68=b.dataset.abandon68??null;renderLocalRequests16();},true);

function chestLidGeometry69(width,strap=false){
 const shape=new THREE.Shape(),depth=.84,steps=20;
 for(let i=0;i<=steps;i++){const z=depth*i/steps,y=.22*Math.sin(Math.PI*i/steps)+(strap?.018:0);if(i)shape.lineTo(z,y);else shape.moveTo(z,y);}
 if(strap){for(let i=steps;i>=0;i--)shape.lineTo(depth*i/steps,.22*Math.sin(Math.PI*i/steps)-.012);}
 else{shape.lineTo(depth,-.055);shape.lineTo(0,-.055);}shape.closePath();
 const g=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:false,steps:1,curveSegments:20}),p=g.attributes.position;
 // Preserve winding when placing the profile on X/Z: a plain axis swap
 // would turn the curved exterior inside-out and expose the lining shut.
 for(let i=0;i<p.count;i++){const z=p.getX(i),x=width/2-p.getZ(i);p.setXYZ(i,x,p.getY(i),z);}g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
const chestCreateBefore68=createInteraction;
createInteraction=function(type,x,z,...args){
 const before=type==='chest'?new Set(world.children):null,r=chestCreateBefore68(type,x,z,...args);if(type!=='chest')return r;
 for(const child of [...world.children])if(!before.has(child)&&child.isMesh)child.removeFromParent();
 const root=new THREE.Group();root.position.set(x,heightAt(x,z),z);root.name='Hinged treasure chest';root.userData.dynamicFX=true;world.add(root);
 const body=new THREE.Group();body.name='Hollow chest shell and lined cavity';root.add(body);
 block16(body,0,.08,0,1.12,.16,.82,'wood','#9f8153');
 for(const side of[-1,1]){block16(body,0,.34,side*.365,1.12,.44,.09,'wood','#a78a5d');block16(body,side*.515,.34,0,.09,.44,.64,'wood','#a78a5d');block16(body,0,.56,side*.365,1.15,.08,.10,'darkWood','#9e8054');block16(body,side*.525,.56,0,.10,.08,.65,'darkWood','#9e8054');}
 // Four inner walls and a recessed floor leave a real, empty volume.
 block16(body,0,.175,0,.93,.025,.60,'cloth','#573b32');
 for(const side of[-1,1]){block16(body,side*.463,.35,0,.014,.33,.60,'darkWood','#55402c');block16(body,0,.35,side*.312,.92,.33,.014,'darkWood','#55402c');}
 for(const x of[-.40,.40]){for(const z of[-.423,.423])block16(body,x,.31,z,.08,.58,.035,'metal','#b6a574');block16(body,x,.035,0,.08,.04,.82,'metal','#b6a574');}
 for(const x of[-.555,.555])for(const z of[-.40,.40])block16(body,x,.12,z,.07,.22,.085,'metal','#9b865c');
 block16(body,0,.45,.444,.14,.22,.035,'metal','#c3a66c');
 for(const side of[-1,1]){const handle=piece16(body,geo16('chest69-handle',()=>new THREE.TorusGeometry(.105,.018,6,16)),'metal','#ae9663',side*.578,.30,0);handle.rotation.y=Math.PI/2;const pin=piece16(body,geo16('chest69-hinge',()=>new THREE.CylinderGeometry(.035,.035,.16,10)),'metal','#9b8558',side*.36,.64,-.415);pin.rotation.z=Math.PI/2;}
 const hinge=new THREE.Group();hinge.name='Brass hinged arched lid';hinge.position.set(0,.655,-.41);root.add(hinge);
 piece16(hinge,geo16('chest69-rounded-lid',()=>chestLidGeometry69(1.16)),'wood','#b09362',0,0,0);
 for(const side of[-1,1])piece16(hinge,geo16('chest69-lid-strap',()=>chestLidGeometry69(.085,true)),'metal','#c1a66d',side*.40,0,0);
 block16(hinge,0,-.066,.42,.95,.022,.64,'cloth','#624139');block16(hinge,0,-.08,.853,.14,.18,.045,'metal','#c8ad72');
 mergeGroup(body);mergeGroup(hinge);
 const glow=new THREE.Mesh(new THREE.PlaneGeometry(.88,.58),new THREE.MeshBasicMaterial({map:textures.fxEnergy,color:'#d6af69',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,side:THREE.DoubleSide,toneMapped:false}));glow.rotation.x=-Math.PI/2;glow.position.y=.196;glow.name='Brief chest interior glow';root.add(glow);
 const random=seeded(Math.round(x*131+z*373)),seeds=Array.from({length:12},()=>({x:(random()-.5)*.74,z:(random()-.5)*.46,delay:random()*.22,speed:.55+random()*.35,phase:random()*TAU})),g=new THREE.BufferGeometry(),points=new Float32Array(seeds.length*3);seeds.forEach((p,i)=>points.set([p.x,.22,p.z],i*3));g.setAttribute('position',new THREE.BufferAttribute(points,3));
 const sparks=new THREE.Points(g,new THREE.PointsMaterial({map:textures.fxEnergy,color:'#e9c686',size:.035,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthTest:true,depthWrite:false,toneMapped:false,fog:false}));sparks.name='Small opening motes';sparks.frustumCulled=false;root.add(sparks);
 // Local district labels change as the party walks. One physical chest must
 // keep the same saved identity across all of those labels and entrances.
 const o=interactables.at(-1),poi=activeScene?.kind==='poi'?POIS[activeScene.key]:null,key=(poi?.id??state.scene)+':'+o.x+':'+o.z,opened=[state.scene,...(poi?.aliases??[])].some(id=>state.flags[id+':'+o.x+':'+o.z])||!!state.flags[key];if(opened)state.flags[key]=true;
 o.chest68={root,body,hinge,glow,sparks,seeds,key,open:opened,started:null,fxAt:null,fxPrimed:false,cavityDepth:.415};hinge.rotation.x=opened?-1.65:0;review68.chests.add(o);return r;
};
const chestBatchBefore68=batchLandscape;
batchLandscape=function(...args){const roots=[...review68.chests].map(o=>o.chest68.root).filter(o=>o.parent===world);for(const o of roots)o.removeFromParent();try{return chestBatchBefore68(...args);}finally{for(const o of roots)world.add(o);}};
const chestActBefore68=act;
act=function(o,...args){const was=o?.chest68&&!!state.flags[o.chest68.key],r=chestActBefore68(o,...args);if(o?.chest68&&!was&&state.flags[o.chest68.key]){const q=o.chest68;q.open=true;q.started=q.fxAt=clock;q.glow.visible=q.sparks.visible=true;}return r;};
const chestFxBefore68=updateWorldFX;
updateWorldFX=function(...args){const r=chestFxBefore68(...args);for(const o of review68.chests){const q=o.chest68;if(q.started!==null){const t=clamp((clock-q.started)/.7,0,1);q.hinge.rotation.x=-1.65*(t*t*(3-2*t));if(t===1)q.started=null;}if(q.fxAt===null)continue;const age=clock-q.fxAt;if(age>=1.4){q.fxAt=null;q.glow.visible=q.sparks.visible=false;q.glow.material.opacity=q.sparks.material.opacity=0;continue;}q.glow.material.opacity=.14*Math.sin(Math.PI*clamp(age/1.4,0,1));q.sparks.material.opacity=.32*smooth(0,.12,age)*(1-smooth(.3,1.4,age));const p=q.sparks.geometry.attributes.position;q.seeds.forEach((v,i)=>{const t=Math.max(0,age-v.delay);p.setXYZ(i,v.x+Math.sin(v.phase+t*2)*t*.045,.22+t*v.speed,v.z+Math.cos(v.phase+t*1.7)*t*.04);});p.needsUpdate=true;}return r;};
// Invisible zero-opacity draws prepare the two effect shaders under the
// covered destination frame, before the first opening can expose a hitch.
const chestRenderBefore69=render;
render=function(...args){const frame=renderer?.info.render.frame,r=chestRenderBefore69(...args);if(renderer?.info.render.frame!==frame)for(const o of review68.chests){const q=o.chest68;if(q.fxPrimed)continue;q.fxPrimed=true;if(q.fxAt===null)q.glow.visible=q.sparks.visible=false;}return r;};

// Fern's authored north/south lane remains vertical and the party centered.
const fernCameraBefore68=updateCamera;
updateCamera=function(...args){const r=fernCameraBefore68(...args);if(activeScene?.key!=='fern'||battle||!player)return r;const offset=camera.position.clone().sub(cameraTarget),distance=Math.hypot(offset.x,offset.z);cameraTarget.x=player.mesh.position.x;cameraTarget.z=player.mesh.position.z;camera.position.copy(cameraTarget).add(V3(0,offset.y,distance));camera.lookAt(cameraTarget);camera.updateMatrixWorld();focusPoint.copy(cameraTarget);for(const a of actors)a.mesh.quaternion.copy(camera.quaternion);return r;};
