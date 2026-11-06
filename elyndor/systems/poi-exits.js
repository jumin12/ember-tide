// POI departures are deliberate interactions. Walking, click routes and the
// automatic doorway routine can approach an exit, but cannot confirm it.
const poiDeparture={confirming:null,dismissed:null,arriving:null,confirmed:0};
// End every location at its authored streets, rather than at the far end of an
// exterior approach. The initial Brookstead edge follows the review markup.
const compactDepartures=new Map();
for(const[key,spec]of Object.entries(LEVEL_PLANS42)){
 const plan=levels39.plans.get(key),core=districtCore24[key],cuts=[];
 for(const[route,index]of spec.routes.map((r,i)=>[r,i])){
  const end=route.at(-1),previous=route.at(-2),gate=plan.gates[index];let point,indexOnRoute;
  if(index===0){
   const spawn=spec.spawn,n=Math.hypot(end[0]-spawn[0],end[1]-spawn[1]);
   point=[spawn[0]+(end[0]-spawn[0])/n*6,spawn[1]+(end[1]-spawn[1])/n*6];indexOnRoute=route.length-2;
  }else{
   const bounds=[core[0]+4,core[1]-4,core[2]+4,core[3]-4];
   outer:for(let i=1;i<route.length;i++){
    const a=route[i-1],b=route[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.25));
    for(let j=0;j<=n;j++){const t=j/n,x=mix(a[0],b[0],t),z=mix(a[1],b[1],t);if(x<bounds[0]||x>bounds[1]||z<bounds[2]||z>bounds[3]){point=[x,z];indexOnRoute=i-1;break outer;}}
   }
   if(!point){const n=Math.hypot(end[0]-previous[0],end[1]-previous[1]),cut=Math.min(4,n*.45);point=[end[0]-(end[0]-previous[0])/n*cut,end[1]-(end[1]-previous[1])/n*cut];indexOnRoute=route.length-2;}
  }
  if(key==='brookstead'&&index===0){point=[-150,122];indexOnRoute=0;gate.dir=[-1,0];}
  else{const next=route[indexOnRoute+1],dx=next[0]-point[0],dz=next[1]-point[1],n=Math.hypot(dx,dz);if(n>.01)gate.dir=[dx/n,dz/n];}
  gate.x=point[0];gate.z=point[1];
  cuts.push({point,tail:[point,...route.slice(indexOnRoute+1)]});
  if(index===0)POIS[key].exit=[...point];else Object.assign(LEVEL_THRESHOLDS[key][index-1],{x:point[0],z:point[1]});
 }
 compactDepartures.set(key,cuts);
}
const compactFitBefore=fitDoorways39;
fitDoorways39=function(){
 if(activeScene.kind==='poi'){
  const cuts=compactDepartures.get(activeScene.key),gates=levels39.plans.get(activeScene.key).gates;
  for(const[g,i]of gates.map((g,i)=>[g,i])){
   const cut=cuts[i],d=g.dir,end=cut.tail.at(-1),limit=Math.max(0,(end[0]-cut.point[0])*d[0]+(end[1]-cut.point[1])*d[1]-.8);let advance=0;
   // A shorter approach must retain enough standing room for checkpoints,
   // story work and optional tasks, including ones not yet unlocked.
   for(const o of interactables){
    if(['poiExit','exit','routeDoor','sign','villager','water'].includes(o.type))continue;
    const dx=o.x-cut.point[0],dz=o.z-cut.point[1],along=dx*d[0]+dz*d[1],across=Math.abs(-dx*d[1]+dz*d[0]);
    if(across<6&&along>-2.7&&along<limit+1)advance=Math.max(advance,along+2.7);
   }
   const shift=Math.min(advance,limit);g.x=cut.point[0]+d[0]*shift;g.z=cut.point[1]+d[1]*shift;
  }
 }
 return compactFitBefore();
};

function departureCoordinates(o,x,z){
 const d=o.autoDir39,dx=x-o.x,dz=z-o.z;
 return{along:dx*d[0]+dz*d[1],across:-dx*d[1]+dz*d[0]};
}
function departureBlocked(x,z,r=0){
 return (world?.userData.poiDepartures??[]).some(o=>{
  const q=departureCoordinates(o,x,z);
  if(o.closedApproach&&x<o.x+r&&z>115-r)return true;
  if(q.along>-r&&o.exteriorTail?.some((p,i,a)=>i&&segmentDistance(x,z,a[i-1],p)<o.boundaryHalfWidth+r))return true;
  return q.along>-r&&Math.abs(q.across)<o.boundaryHalfWidth+r;
 });
}
const departureFreeBefore=staticFree;
staticFree=function(x,z,r=.4){
 if(activeScene?.kind==='poi'&&!sceneBuildFilter&&!wildlifeRouting42&&departureBlocked(x,z,r))return false;
 return departureFreeBefore(x,z,r);
};
const departureMoveBefore=moveActor;
moveActor=function(a,dx,dz,dt,...args){
 if(a.party&&activeScene?.kind==='poi'){
  // Clip the motion itself as well as navigation queries. This also prevents
  // a long frame or diagonal sprint from jumping across the exit plane.
  for(const o of world.userData.poiDepartures??[]){
   const q=departureCoordinates(o,a.x,a.z),d=o.autoDir39,out=dx*d[0]+dz*d[1],margin=actorRadius(a)+.02;
   if(out<=0||q.along+out<=-margin)continue;
   const t=clamp((-margin-q.along)/out,0,1),cross=departureCoordinates(o,a.x+dx*t,a.z+dz*t).across;
   if(Math.abs(cross)>o.boundaryHalfWidth+margin)continue;
   dx*=t;dz*=t;
   if(a===player)route=null;
  }
 }
 return departureMoveBefore(a,dx,dz,dt,...args);
};

function nearbyDeparture(){
 if(!player||activeScene?.kind!=='poi')return null;
 return (world.userData.poiDepartures??[]).filter(o=>{
  const q=departureCoordinates(o,player.x,player.z);
  return q.along>=-2.7&&q.along<=.05&&Math.abs(q.across)<o.boundaryHalfWidth-.7&&interactionAvailable(o);
 }).sort((a,b)=>dist(player,a)-dist(player,b))[0]??null;
}
function departureControlAvailable(){
 return state.mode==='explore'&&!gameLoading&&!sceneSwitchPending&&!battle&&!dialogue&&!menu&&!eventAction&&!restoration&&!transition;
}
const departureNearestBefore=nearestInteraction;
nearestInteraction=function(){
 const o=nearbyDeparture();if(o)return o;
 const other=departureNearestBefore();return other?.type==='poiExit'?null:other;
};
const departureActBefore=act;
act=function(o,...args){
 if(o?.type==='poiExit'){
  if(poiDeparture.confirming!==o||!departureControlAvailable()||nearbyDeparture()!==o)return;
  keys.clear();route=null;
 }
 return departureActBefore(o,...args);
};
function confirmDeparture(){
 const o=nearbyDeparture();if(!o||poiDeparture.dismissed===o||!departureControlAvailable())return;
 poiDeparture.confirming=o;
 try{poiDeparture.arriving=activeScene.key;act(o);poiDeparture.confirmed++;}finally{poiDeparture.confirming=null;}
}
const departureDoorwaysBefore=updateDoorways39;
updateDoorways39=function(){
 const w=world,thresholds=w?.userData.thresholds39;if(!thresholds)return departureDoorwaysBefore();
 w.userData.thresholds39=thresholds.filter(o=>o.type!=='poiExit'&&o.type!=='location');
 try{return departureDoorwaysBefore();}finally{w.userData.thresholds39=thresholds;}
};
// Remove the >>> travel decals for departures and arrivals, including decals
// created by the older scene builders before the final thresholds are fitted.
const departureDecalBefore=groundDecal;
groundDecal=function(x,z,map,...args){
 const m=departureDecalBefore(x,z,map,...args);
 if(map===textures.exitMarker){m.removeFromParent();(world.userData.removedTravelArrows??=[]).push(m);}
 return m;
};
const departureDisposeBefore=disposeContinuousWorld;
disposeContinuousWorld=function(...args){
 for(const m of world?.userData.removedTravelArrows??[]){m.geometry.dispose();m.material.dispose();}
 return departureDisposeBefore(...args);
};
const departureBuildBefore=buildWorld;
function settleDepartureOnWorld(){
 const key=poiDeparture.arriving;poiDeparture.arriving=null;
 const entry=interactables.find(o=>o.type==='location'&&o.poi===key);if(!entry)return;
 // Use the destination's real road approach. An arbitrary node offset can
 // put the newly arrived party behind a foreground hill on the world map.
 const approach=entry.approach39??entry,candidates=[approach,{x:player.x,z:player.z}];
 for(const r of[6,10,16,24,32])for(let i=0;i<24;i++){const a=i*TAU/24;candidates.push({x:entry.x+Math.cos(a)*r,z:entry.z+Math.sin(a)*r});}
 updateCamera(1,true);
 const offset=camera.position.clone().sub(V3(player.x,heightAt(player.x,player.z),player.z));
 const clearView=p=>{
  const y=heightAt(p.x,p.z),cx=p.x+offset.x,cy=y+offset.y,cz=p.z+offset.z;
  for(let i=1;i<40;i++){const t=i/40;if(heightAt(mix(cx,p.x,t),mix(cz,p.z,t))+.3>mix(cy,y+1.2,t))return false;}
  return true;
 };
 const choices=candidates.filter(p=>dist(p,entry)>4.8&&roadDistance(p.x,p.z)<5&&staticFree(p.x,p.z,.7)&&clearView(p)).sort((a,b)=>dist(a,approach)-dist(b,approach));
 const point=choices.find(p=>edgeFree(p,approach,.5)||findRoute(p,approach,[]))??approach;
 player.x=point.x;player.z=point.z;spawnPartyTrail([point.x,point.z]);for(const a of[player,...followers])updateActor(a,0);
 world.userData.departureArrival={poi:key,x:point.x,z:point.z,clearView:clearView(point)};
}
buildWorld=function(...args){
 const result=departureBuildBefore(...args);poiDeparture.dismissed=null;
 world.userData.poiDepartures=activeScene.kind==='poi'?(world.userData.thresholds39??[]).filter(o=>o.type==='poiExit'):[];
 for(const[o,i]of world.userData.poiDepartures.map((o,i)=>[o,i])){o.label='Proceed';o.boundaryHalfWidth=Math.max(6,o.autoHalfWidth39+3);o.autoArmed39=false;const tail=compactDepartures.get(activeScene.key)?.[i].tail,d=o.autoDir39;o.exteriorTail=[[o.x,o.z],...tail.slice(1).filter(p=>(p[0]-o.x)*d[0]+(p[1]-o.z)*d[1]>=0)];o.closedApproach=activeScene.key==='brookstead'&&o.autoDir39[0]<-.8;}
 if(activeScene.kind==='overworld'&&poiDeparture.arriving)settleDepartureOnWorld();
 // Old journey records can contain positions on the former exterior road.
 // Bring those arrivals back to the inside of their departure, once on load.
 if(player&&activeScene.kind==='poi'){
  let adjusted=false;
  for(const o of world.userData.poiDepartures){const q=departureCoordinates(o,player.x,player.z);
   const oldRoad=activeScene.key==='brookstead'&&o===world.userData.poiDepartures[0]&&player.x<-150&&player.z>115;
   const onTail=o.exteriorTail.some((p,i,a)=>i&&segmentDistance(player.x,player.z,a[i-1],p)<o.boundaryHalfWidth);
   if(q.along>-.52&&(Math.abs(q.across)<o.boundaryHalfWidth||onTail||oldRoad)){
    const cross=clamp(q.across,-2,2),d=o.autoDir39,p=safePoint({x:o.x-d[0]*6-d[1]*cross,z:o.z-d[1]*6+d[0]*cross},.5);
    player.x=p.x;player.z=p.z;adjusted=true;
   }
  }
  if(adjusted){spawnPartyTrail([player.x,player.z]);for(const a of[player,...followers])updateActor(a,0);}
 }
 updateCamera(1,true);return result;
};
const departureCameraBefore=updateCamera;
updateCamera=function(...args){
 const result=departureCameraBefore(...args);
 if(!player||activeScene?.kind!=='poi'||state.mode!=='explore'||battle||restoration)return result;
 for(const o of world?.userData.poiDepartures??[]){
  const p=departureCoordinates(o,player.x,player.z);if(p.along<-9||p.along>1||Math.abs(p.across)>o.boundaryHalfWidth+3)continue;
  const q=departureCoordinates(o,cameraTarget.x,cameraTarget.z),excess=q.along+3.2;if(excess<=0)continue;
  const d=o.autoDir39;cameraTarget.x-=d[0]*excess;cameraTarget.z-=d[1]*excess;camera.position.x-=d[0]*excess;camera.position.z-=d[1]*excess;
 }
 camera.updateMatrixWorld();return result;
};

const departurePrompt=document.createElement('div');
departurePrompt.id='poi-exit-prompt';departurePrompt.className='poi-travel-prompt hidden';
departurePrompt.innerHTML='<button type="button"><kbd>E</kbd><span>Proceed</span></button>';
document.body.appendChild(departurePrompt);
departurePrompt.querySelector('button').addEventListener('click',confirmDeparture);
document.addEventListener('keydown',e=>{
 if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)||!departureControlAvailable())return;
 const o=nearbyDeparture(),k=e.key.toLowerCase();if(!o)return;
 if(k==='escape'){
  e.preventDefault();e.stopImmediatePropagation();poiDeparture.dismissed=o;route=null;keys.clear();updateDeparturePrompt();
 }else if((k==='e'||k==='enter')&&!e.repeat){
  e.preventDefault();e.stopImmediatePropagation();confirmDeparture();
 }
},{capture:true});
function updateDeparturePrompt(){
 const o=nearbyDeparture(),visible=!!o&&departureControlAvailable()&&poiDeparture.dismissed!==o;
 if(poiDeparture.dismissed&&o!==poiDeparture.dismissed)poiDeparture.dismissed=null;
 departurePrompt.classList.toggle('hidden',!visible);
 if(!o)return;
 $('#interact').classList.add('hidden');if(!visible)return;
 showTravelPrompt(departurePrompt,'Proceed','Proceed to the world map from '+POIS[activeScene.key].name);
}
function showTravelPrompt(prompt,label,description){
 prompt.classList.remove('hidden');$('#interact').classList.add('hidden');
 prompt.querySelector('span').textContent=label;prompt.querySelector('button').setAttribute('aria-label',description);
 const p=V3(player.mesh.position.x,heightAt(player.x,player.z)+.1,player.mesh.position.z).project(camera);
 prompt.style.left=clamp((p.x*.5+.5)*innerWidth+20,12,innerWidth-prompt.offsetWidth-12)+'px';
 prompt.style.top=clamp((-.5*p.y+.5)*innerHeight+8,90,innerHeight-75)+'px';
}
const departureRenderBefore=render;
render=function(...args){const result=departureRenderBefore(...args);updateDeparturePrompt();return result;};
const departureEngineBefore=installEngine;
installEngine=function(){
 departureEngineBefore();const previous=window.render_game_to_text;
 window.render_game_to_text=()=>{const q=JSON.parse(previous()),o=nearbyDeparture();q.poiExit={prompt:!departurePrompt.classList.contains('hidden'),poi:activeScene?.kind==='poi'?activeScene.key:null,nearby:o?{x:o.x,z:o.z,...departureCoordinates(o,player.x,player.z)}:null,confirmed:poiDeparture.confirmed};return JSON.stringify(q);};
};
