// Local JRPG routes retain the approved atlas nodes and story coordinates.
// Every exit belongs to a road, rather than an arbitrary radial map edge.
const LEVEL_PLANS42={
 brookstead:{spawn:[-143,120],pad:12,courts:[[-124,94,9],[-126,66,8],[-63,89,9]],routes:[
  [[-143,120],[-160,124],[-183,134],[-208,150]],
  [[-63,89],[-47,95],[-30,96],[-10,97],[-4,98]],
  [[-155.33,28],[-149,16],[-142,3]]]},
 fern:{spawn:[68,76],pad:10,courts:[[94,73,8],[106,84,6]],routes:[
  [[94,73],[82,74],[68,76],[59,76]],
  [[105,74],[120,78],[140,78]],
  [[116,54],[123,52],[123,38]]]},
 depths:{spawn:[106,47],pad:12,courts:[[111,28,6]],routes:[
  [[107,27],[103,35],[103,42],[106,47],[106,56]],
  [[114,28],[119,35],[128,40],[135,40]]]},
 highmere:{spawn:[-84,-61],pad:10,courts:[[-85,-82,8],[-70,-105,7]],routes:[
  [[-85,-82],[-84,-71],[-84,-61],[-84,-47]],
  [[-85,-82],[-104,-80],[-133,-80]],
  [[-60,-80],[-43,-80],[-20,-83]]]},
 alder:{spawn:[104,-80],pad:10,courts:[[127,-83,7],[130,-108,6]],routes:[
  [[127,-78],[106,-80],[91,-80]],
  [[145,-94],[150,-71],[164,-71]],
  [[130,-108],[132,-122],[132,-135]]]},
 patrol:{spawn:[158,-57],pad:10,courts:[[176,-57,5]],routes:[
  [[176,-57],[169,-60],[162,-60],[158,-57],[150,-57]],
  [[176,-57],[185,-62],[194,-68],[202,-68]]]},
 alderRemnant:{spawn:[188,-94],pad:10,courts:[[208,-100,7]],routes:[
  [[208,-100],[196,-96],[188,-94],[178,-94]],
  [[212,-104],[220,-108],[225,-113],[234,-119]]]},
 relief:{spawn:[8,-145],pad:10,courts:[[24,-153,7]],routes:[
  [[24,-153],[16,-145],[8,-145],[-5,-145]],
  [[24,-163],[35,-171],[45,-180]],
  [[24,-153],[24,-139],[24,-126]]]},
 nearbySite:{spawn:[-100,-185],pad:10,courts:[[-79,-195,7]],routes:[
  [[-79,-195],[-90,-191],[-96,-187],[-100,-185],[-109,-185]],
  [[-71,-191],[-63,-187],[-55,-180],[-43,-179]]]},
 snow:{spawn:[140,-216],pad:12,courts:[[149,-223,6]],routes:[
  [[149,-223],[140,-216],[138,-205]],
  [[149,-223],[157,-231],[172,-241],[173,-256]]]},
 fernClearing:{spawn:[139,48],pad:12,courts:[[139,33,7]],routes:[
  [[139,33],[144,37],[144,44],[139,48],[139,56]],
  [[139,33],[131,29],[123,22],[111,22]]]},
 alderClearing:{spawn:[229,-114],pad:12,courts:[[229,-126,7]],routes:[
  [[229,-126],[235,-120],[229,-114],[229,-101]],
  [[229,-126],[225,-135],[218,-141],[207,-149]]]},
 reliefClearing:{spawn:[57,-140],pad:12,courts:[[57,-154,7]],routes:[
  [[57,-154],[62,-148],[57,-140],[57,-129]],
  [[57,-154],[48,-151],[39,-148],[29,-160]]]},
 siteClearing:{spawn:[-68,-210],pad:12,courts:[[-49,-220,7]],routes:[
  [[-49,-220],[-59,-216],[-65,-208],[-68,-210],[-77,-205]],
  [[-49,-220],[-58,-227],[-65,-235],[-72,-243]]]},
 harbor:{spawn:[264,66],pad:22,courts:[[320,70,7]],routes:[
  [[315,74],[305,70],[289,70],[278,66],[264,66],[254,66]],
  [[333,68],[351,68],[373,66],[386,66]]]}
};
Object.assign(LEVEL_PLANS42,JRPG_LAYOUTS46);
for(const [key,blueprint]of Object.entries(LEVEL_PLANS42)){
 if(blueprint.core)districtCore24[key]=[...blueprint.core];
 const poi=POIS[key],core=districtCore24[key],pad=blueprint.pad;
 const bounds=[core[0]-pad,core[1]+pad,core[2]-pad,core[3]+pad];
 for(const route of blueprint.routes)for(const [x,z]of route){bounds[0]=Math.min(bounds[0],x-7);bounds[1]=Math.max(bounds[1],x+7);bounds[2]=Math.min(bounds[2],z-7);bounds[3]=Math.max(bounds[3],z+7);}
 poi.bounds=bounds;poi.spawn=[...blueprint.spawn];poi.exit=[...blueprint.routes[0].at(-1)];
 districts24[key].bounds=bounds;districts24[key].roads=blueprint.routes.map(p=>({kind:poi.kind==='town'?'lane':'trail',p:p.map(q=>[...q])}));
 LEVEL_THRESHOLDS[key]=blueprint.routes.slice(1).map((r,i)=>({x:r.at(-1)[0],z:r.at(-1)[1],label:(i?'Upper path':'Far path')+' · Overworld'}));
 const plan={bounds:[bounds[0]+2,bounds[1]-2,bounds[2]+2,bounds[3]-2],round:7,gates:blueprint.routes.map((p,index)=>{const a=p.at(-2),b=p.at(-1),d=Math.hypot(b[0]-a[0],b[1]-a[1]);return{x:b[0],z:b[1],dir:[(b[0]-a[0])/d,(b[1]-a[1])/d],index,halfWidth:3};})};
 levels39.plans.set(key,plan);
}
continuationCache32.clear();roadGrades27.clear();
roadContinuations32=function(){return[];};
// Random outer housing was scenery without a street plan or service purpose.
// Retain the authored local buildings; their doors receive actual approach lanes.
buildDistrictPlots24=function(){world.userData.districtPlots24=[];if(districts24[activeScene.key])districts24[activeScene.key].plots=[];};

function indexLane42(plan,a,b,r){
 const segment={a,b,r},x0=Math.floor((Math.min(a[0],b[0])-r-2)/16),x1=Math.floor((Math.max(a[0],b[0])+r+2)/16),z0=Math.floor((Math.min(a[1],b[1])-r-2)/16),z1=Math.floor((Math.max(a[1],b[1])+r+2)/16);
 plan.segments.push(segment);for(let x=x0;x<=x1;x++)for(let z=z0;z<=z1;z++){const key=x+','+z;if(!plan.grid.has(key))plan.grid.set(key,[]);plan.grid.get(key).push(segment);}
}
function laneDistance42(x,z,s){const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],t=clamp(((x-s.a[0])*dx+(z-s.a[1])*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-s.a[0]-dx*t,z-s.a[1]-dz*t)-s.r;}
function laneFree42(x,z,r=0,plan=world?.userData.levelPlan42){if(!plan)return true;for(const s of plan.grid.get(Math.floor(x/16)+','+Math.floor(z/16))??[])if(laneDistance42(x,z,s)<-r*.25)return true;return false;}
const walkBefore42=staticFree;let wildlifeRouting42=false;
// Ambient animals use their original collision-checked forest habitats. Public
// walkway boundaries restrict the party; they must not immobilize wildlife.
const wildlifeBefore42=updateRegionalWildlife;
updateRegionalWildlife=function(...args){wildlifeRouting42=true;try{return wildlifeBefore42(...args);}finally{wildlifeRouting42=false;}};
function habitatOccupied42(x,z,pad){return(world.userData.regionalWildlife??[]).some(a=>segmentDistance(x,z,[a.habitat.from.x,a.habitat.from.z],[a.habitat.to.x,a.habitat.to.z])<actorRadius(a)+pad);}
function addLane42(plan,points,r){for(let i=1;i<points.length;i++)indexLane42(plan,points[i-1],points[i],r);if(points.length===1)indexLane42(plan,points[0],points[0],r);}
function simplifyApproach42(route){const kept=[route[0]];for(let i=0;i<route.length-1;){let next=i+1;for(let j=i+2;j<route.length&&dist(route[i],route[j])<=12;j++)if(edgeFree(route[i],route[j],.5))next=j;kept.push(route[next]);i=next;}return kept.map(p=>[p.x,p.z]);}
function laneSigned42(x,z,plan){let best=20;for(const s of plan.grid.get(Math.floor(x/16)+','+Math.floor(z/16))??[])best=Math.min(best,laneDistance42(x,z,s));return best;}
function paintRoutes42(plan,town){
 const meshes=[...world.userData.terrainChunks??[],...world.userData.routeSupports32?.group.children??[]],point=V3(),seen=new Set();
 for(const mesh of meshes)for(const g of new Set([mesh.geometry,mesh.userData.fullGeometry,mesh.userData.farGeometry,mesh.userData.simpleGeometry].filter(Boolean))){
  if(seen.has(g)||!g.attributes.pathMix)continue;seen.add(g);const p=g.attributes.position,path=g.attributes.pathMix,kind=g.attributes.townMix;
  for(let i=0;i<p.count;i++){point.set(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(mesh.matrixWorld);path.setX(i,1-smooth(-2.,-.1,laneSigned42(point.x,point.z,plan)));if(kind)kind.setX(i,town?1:0);}
  path.needsUpdate=true;if(kind)kind.needsUpdate=true;
 }
 plan.paintedSurfaces=seen.size;
}
function makeLevelPlan42(){
 if(activeScene.kind!=='poi'||world.userData.levelPlan42)return;const spec=LEVEL_PLANS42[activeScene.key],plan={key:activeScene.key,segments:[],grid:new Map(),ready:false,attachments:[],purpose:POIS[activeScene.key].description};world.userData.levelPlan42=plan;
 const town=POIS[activeScene.key].kind==='town',r=town?4.6:3.1,core=districtCore24[activeScene.key];
 for(const road of ROADS){if(!town&&!road.district24)continue;let strip=[];for(const p of road.p){if(insideRect24(...p,activeScene.bounds,-1))strip.push(p);else{if(strip.length>1)addLane42(plan,strip,r);strip=[];}}if(strip.length>1)addLane42(plan,strip,r);}
 for(const route of spec.routes)addLane42(plan,route,r);
 for(const route of spec.loops??[])addLane42(plan,route,town?4.6:3.8);
 for(const [x,z,radius]of spec.courts)addLane42(plan,[[x,z]],radius);
 addLane42(plan,[spec.spawn],3.5);
 const start=safePoint({x:spec.spawn[0],z:spec.spawn[1]},.5),targets=[...interactables.filter(o=>!['sign','routeDoor'].includes(o.type)),...npcs.map(a=>({type:'resident',x:a.home.x,z:a.home.z}))];
 for(const target of targets){
  let goal=safePoint(target,.55),found=findRoute(start,goal,[]);if(!found){for(let i=0;i<16&&!found;i++){const a=i*TAU/16,p={x:target.x+Math.cos(a)*2,z:target.z+Math.sin(a)*2};if(walkBefore42(p.x,p.z,.6)){const route=findRoute(start,p,[]);if(route){goal=p;found=route;}}}}
  if(!found){plan.attachments.push({type:target.type,x:target.x,z:target.z,connected:false});continue;}
  const points=simplifyApproach42([start,...found]);addLane42(plan,points,town?2.4:2.1);addLane42(plan,[[goal.x,goal.z]],target.type==='resident'?3:2.8);
  // Keep every physical approach in the navigation graph. Wilderness base roads
  // are trimmed below, including old roads that an approach may have followed.
  (plan.mapPaths??=[]).push({kind:town?'lane':'trail',p:points,localSpur42:true,navigationDetail:true});
  plan.attachments.push({type:target.type,x:target.x,z:target.z,connected:true,length:points.slice(1).reduce((n,p,i)=>n+Math.hypot(p[0]-points[i][0],p[1]-points[i][1]),0)});
 }
 clearRouteCover42(plan);paintRoutes42(plan,town);if(!town){const kept=ROADS.filter(r=>r.district24);ROADS.splice(0,ROADS.length,...kept);}ROADS.push(...plan.mapPaths??[]);buildRouteBanks42(plan,town);plan.ready=true;rebuildColliderGrid();roadNavGraph=null;
 const choices=(world.userData.npcChoices??[]).filter(p=>staticFree(p.x,p.z,.6));for(const s of plan.segments){if(choices.length>=45)break;const x=(s.a[0]+s.b[0])/2,z=(s.a[1]+s.b[1])/2;if(staticFree(x,z,.7)&&!interactables.some(o=>Math.hypot(o.x-x,o.z-z)<3.2)&&!choices.some(p=>Math.hypot(p.x-x,p.z-z)<4))choices.push({x,z});}world.userData.npcChoices=choices;
 settleRouteParty42();world.userData.levelDesign42={purpose:plan.purpose,mainRoutes:spec.routes.length,attachments:plan.attachments,compactBounds:[...activeScene.bounds]};
}
function settleRouteParty42(){
 const plan=world?.userData.levelPlan42;if(!plan?.ready||!player)return;
 if(!staticFree(player.x,player.z,.45)){
  const points=[LEVEL_PLANS42[activeScene.key].spawn,...plan.segments.map(s=>{const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],t=clamp(((player.x-s.a[0])*dx+(player.z-s.a[1])*dz)/(dx*dx+dz*dz||1),0,1);return[s.a[0]+dx*t,s.a[1]+dz*t];})].sort((a,b)=>Math.hypot(a[0]-player.x,a[1]-player.z)-Math.hypot(b[0]-player.x,b[1]-player.z));
  const p=points.find(p=>staticFree(p[0],p[1],.5));if(p){player.x=p[0];player.z=p[1];world.userData.arrivalAdjusted42=true;}
 }
 spawnPartyTrail([player.x,player.z]);for(const a of [player,...followers])updateActor(a,0);
}
const settleBefore42=settleArrival28;
settleArrival28=function(...args){const result=settleBefore42(...args);settleRouteParty42();return result;};
function clearRouteCover42(plan){
 const matrix=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0),removed=new Set();
 for(const mesh of perf.plants){let changed=false;for(let i=0;i<(mesh.userData.total??mesh.count);i++){mesh.getMatrixAt(i,matrix);const x=matrix.elements[12],z=matrix.elements[14];if(laneSigned42(x,z,plan)>-1.65||matrix.elements[13]-heightAt(x,z)>.7)continue;mesh.setMatrixAt(i,zero);changed=true;}if(changed)mesh.instanceMatrix.needsUpdate=true;}
 for(const tree of scenery.trees){if(laneSigned42(tree.x,tree.z,plan)>-1.8)continue;removed.add(tree);for(const q of tree.bindings){q.mesh.setMatrixAt(q.index,zero);q.mesh.instanceMatrix.needsUpdate=true;}}
 scenery.trees=scenery.trees.filter(t=>!removed.has(t));const removedAt=(x,z)=>[...removed].some(t=>Math.abs(t.x-x)+Math.abs(t.z-z)<.02);colliders=colliders.filter(c=>c.type!=='tree'||!removedAt(c.x,c.z));world.userData.solidTrees=(world.userData.solidTrees??[]).filter(t=>!removed.has(t));world.userData.treePoints=(world.userData.treePoints??[]).filter(t=>!removedAt(t.x,t.z));const q=world.userData.clarity23;if(q){for(const [key,trees]of q.treeGrid)q.treeGrid.set(key,trees.filter(t=>!removed.has(t)));q.nearKey33=null;}treeCutCache30=null;plan.clearedTrees=removed.size;
}
function buildRouteBanks42(plan){plan.boundaryCount=0;}
const levelBuildBefore42=buildWorld;
buildWorld=function(...args){const result=levelBuildBefore42(...args);makeLevelPlan42();return result;};
const levelRenderBefore42=render;
render=function(...args){const p=world?.userData.levelPlan42;if(p?.boundaries)p.boundaries.visible=!battle;return levelRenderBefore42(...args);};
