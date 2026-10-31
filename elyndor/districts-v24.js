// Story courts stay at their authored coordinates. Larger explorable outskirts
// are built around them, with separated arrivals, road exits and side gardens.
const districts24={},districtCore24=Object.fromEntries(Object.entries(POIS).map(([key,p])=>[key,[...p.bounds]]));
const insideRect24=(x,z,b,pad=0)=>x>b[0]-pad&&x<b[1]+pad&&z>b[2]-pad&&z<b[3]+pad;
for(const[key,p]of Object.entries(POIS)){
 const b=districtCore24[key],cx=(b[0]+b[1])/2,cz=(b[2]+b[3])/2,f=p.kind==='clearing'?2.35:key==='brookstead'?1.48:1.85;
 p.bounds=[cx-(b[1]-b[0])*f/2,cx+(b[1]-b[0])*f/2,cz-(b[3]-b[2])*f/2,cz+(b[3]-b[2])*f/2];
 const old=[...p.spawn],v=V3(old[0]-cx,0,old[1]-cz);if(v.length()<3)v.set(0,0,1);v.normalize();
 const reach=key==='brookstead'?0:p.kind==='clearing'?29:31;
 const arrival=[old[0]+v.x*reach,old[1]+v.z*reach],exit=[old[0]+v.x*(reach+8),old[1]+v.z*(reach+8)];
 p.spawn=arrival;p.exit=key==='brookstead'?[-220,155]:exit;
 const entryPath=key==='brookstead'?[[-199,145],[-211,151],[-220,155]]:[old,[old[0]+v.x*reach*.5-v.z*3,old[1]+v.z*reach*.5+v.x*3],arrival,exit];
 const oldExits=LEVEL_THRESHOLDS[key]??[],roads=[{kind:p.kind==='town'?'lane':'trail',p:entryPath}],exits=[];
 for(let i=0;i<Math.min(2,oldExits.length);i++){
  const e=oldExits[i],dir=V3(e.x-cx,0,e.z-cz).normalize(),end=[e.x+dir.x*25,e.z+dir.z*25];
  if(Math.hypot(end[0]-p.exit[0],end[1]-p.exit[1])<24)continue;
  roads.push({kind:p.kind==='town'?'lane':'trail',p:[[e.x,e.z],[e.x+dir.x*11-dir.z*3,e.z+dir.z*11+dir.x*3],end]});exits.push({x:end[0],z:end[1],label:(i?'Upper trail':'Far road')+' · Overworld'});
 }
 if(!exits.length){const end=[cx-v.x*((b[1]-b[0])*.5+20),cz-v.z*((b[3]-b[2])*.5+20)];roads.push({kind:'trail',p:[[cx-v.x*8,cz-v.z*8],end]});exits.push({x:end[0],z:end[1],label:'Woodland trail · Overworld'});}
 for(const road of roads)for(const[x,z]of road.p){p.bounds[0]=Math.min(p.bounds[0],x-12);p.bounds[1]=Math.max(p.bounds[1],x+12);p.bounds[2]=Math.min(p.bounds[2],z-12);p.bounds[3]=Math.max(p.bounds[3],z+12);}
 LEVEL_THRESHOLDS[key]=exits;districts24[key]={core:b,bounds:p.bounds,roads,oldSpawn:old,areaRatio:(p.bounds[1]-p.bounds[0])*(p.bounds[3]-p.bounds[2])/((b[1]-b[0])*(b[3]-b[2])),plots:[]};
}
// Hand-authored corrections where the radial approach would meet river banks,
// stair rails or the harbor sea. These routes follow actual streets and decks.
function setDistrictRoad24(key,index,points,exitIndex=null){const q=districts24[key];q.roads[index].p=points;if(exitIndex!==null){const e=points.at(-1);LEVEL_THRESHOLDS[key][exitIndex]={x:e[0],z:e[1],label:exitIndex?'Upper trail · Overworld':'Far road · Overworld'};}}
setDistrictRoad24('brookstead',2,[[-155.33,28],[-149,16],[-142,3]],1);
setDistrictRoad24('fern',1,[[117,48],[117,37],[129.86,26.56]],0);
setDistrictRoad24('depths',2,[[119.375,39],[118.4,45],[118.2,52],[127,55],[135.46,58.13]],1);
setDistrictRoad24('nearbySite',1,[[-48,-179.58],[-45,-180],[-20,-180],[-12,-172]],0);
setDistrictRoad24('nearbySite',2,[[-56.67,-216],[-66,-221],[-66,-243]],1);
setDistrictRoad24('siteClearing',0,[[-49,-211],[-66,-207],[-83,-202],[-94,-199]]);
POIS.siteClearing.spawn=[-83,-202];POIS.siteClearing.exit=[-94,-199];
setDistrictRoad24('siteClearing',1,[[-65,-212.17],[-77,-229],[-93,-245]],0);
setDistrictRoad24('alderClearing',1,[[229,-117],[238,-121],[240,-132],[235,-141],[229,-150],[229,-170]],0);
setDistrictRoad24('harbor',0,[[315,74],[305,70],[289,70],[278,66],[259,66],[250,66]]);
POIS.harbor.spawn=[259,66];POIS.harbor.exit=[250,66];
setDistrictRoad24('harbor',1,[[359,65],[373,66],[386,66]],0);
for(const[key,q]of Object.entries(districts24))for(const road of q.roads)for(const[x,z]of road.p){q.bounds[0]=Math.min(q.bounds[0],x-12);q.bounds[1]=Math.max(q.bounds[1],x+12);q.bounds[2]=Math.min(q.bounds[2],z-12);q.bounds[3]=Math.max(q.bounds[3],z+12);}
const districtRoadBefore24=roadInfo;
roadInfo=function(x,z){let r=districtRoadBefore24(x,z);if(activeScene?.kind!=='poi')return r;for(const q of districts24[activeScene.key]?.roads??[])for(let i=1;i<q.p.length;i++){const d=segmentDistance(x,z,q.p[i-1],q.p[i]);if(d<r.d)r={d,kind:q.kind};}return r;};
// The upper Brookstead trail descends a real sculpted bank. Its old terrace
// boundary had a single hard height jump; both the mesh and walking query now
// sample the same continuous grade with feathered shoulders.
const districtGroundBefore24=groundAt;
groundAt=function(x,z,...args){const base=districtGroundBefore24(x,z,...args);if(activeScene?.key!=='brookstead'||z>35||z<-5||x<-165||x>-134)return base;const points=districts24.brookstead.roads[2].p,heights=[7.198090594858874,.2541818618774414,-1.06];let distance=Infinity,target=base;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz),0,1),d=Math.hypot(x-mix(a[0],b[0],t),z-mix(a[1],b[1],t));if(d<distance){distance=d;target=mix(heights[i-1]??base,heights[i]??base,t);}}return mix(target,base,smooth(2.8,7,distance));};
// Reserve the outer road shoulders before placing any tree or obstruction.
const districtTreeBefore24=buildSolidTree;
buildSolidTree=function(x,z,...args){if(activeScene?.kind==='poi'&&!insideRect24(x,z,districtCore24[activeScene.key],2)&&roadDistance(x,z)<5.4)return null;return districtTreeBefore24(x,z,...args);};
const districtSettlementsBefore24=buildSettlements;
buildSettlements=function(){districtSettlementsBefore24();buildDistrictPlots24();};
function buildDistrictPlots24(){
 if(activeScene?.kind!=='poi'||world.userData.districtPlots24)return;const q=districts24[activeScene.key];world.userData.districtPlots24=[];if(!q||POIS[activeScene.key].kind!=='town'||activeScene.key==='harbor')return;
 const b=q.bounds,core=q.core,plots=[],rng=seeded(240780+core[0]*17),max=activeScene.key==='brookstead'?6:5;
 for(let j=0;j<750&&plots.length<max;j++){
  const x=mix(b[0]+12,b[1]-12,rng()),z=mix(b[2]+12,b[3]-12,rng()),d=roadDistance(x,z),h=groundAt(x,z);
  if(insideRect24(x,z,core,7)||d<9||d>17||h<.6||waterGround(x,z)||plots.some(p=>Math.hypot(p.x-x,p.z-z)<22))continue;
  let free=true;for(const xx of[-5,0,5])for(const zz of[-4,0,4])if(!staticFree(x+xx,z+zz,.6)||Math.abs(groundAt(x+xx,z+zz)-h)>.55)free=false;if(!free)continue;
  const start=colliders.length,plantStart=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,a.length])),g=activeScene.key==='fern'?fernHouse(x,z,8,7,j%3):activeScene.key==='relief'?reliefShelter(x,z,9,7):brookHouse(x,z,9,8,'home');
  g.userData.district24=true;g.userData.plantRanges=Object.fromEntries(Object.entries(world.userData.plantMatrices).map(([k,a])=>[k,{start:plantStart[k],end:a.length}]));
  plots.push({x,z,g,colliders:colliders.slice(start)});
 }
 world.userData.districtPlots24=plots;q.plots=plots.map(({x,z})=>({x,z}));
}
const districtNatureBefore24=buildNature;
buildNature=function(){districtNatureBefore24();if(activeScene?.kind!=='poi')return;const q=districts24[activeScene.key],rng=seeded(240191+q.core[0]*13),b=q.bounds;for(let i=0;i<7800;i++){
 const x=mix(b[0],b[1],rng()),z=mix(b[2],b[3],rng());if(waterGround(x,z)||roadDistance(x,z)<3.7||!staticFree(x,z,.2))continue;
 if(i%17===0&&!insideRect24(x,z,q.core,4)&&roadDistance(x,z)>6.5)buildSolidTree(x,z,.65+rng()*.35,activeScene.key==='snow'?'pine':'oak',rng);
 else plant(x,z,.4+rng()*.48,i%11===0?'flower':i%19===0?'fern':i%23===0?'shrub':'grassBlades');
 }};
// Trim legacy neighbouring settlements against the original court, retaining
// only the deliberately authored new district houses and their real colliders.
const districtTrimBefore24=trimPoiWorld;
trimPoiWorld=function(){
 if(activeScene?.kind!=='poi')return districtTrimBefore24();const q=districts24[activeScene.key],b=activeScene.bounds,plots=world.userData.districtPlots24??[];
 for(const p of plots)p.g.removeFromParent();activeScene.bounds=q.core;districtTrimBefore24();activeScene.bounds=b;
 for(const p of plots){world.add(p.g);world.userData.buildings.push(p.g);colliders.push(...p.colliders);}
 const occupied=new Set(colliders.filter(c=>c.type==='tree').map(c=>c.x+','+c.z));
 for(const t of scenery.trees)if(!insideRect24(t.x,t.z,q.core)&&insideRect24(t.x,t.z,b,10)&&!occupied.has(t.x+','+t.z))obstacle(t.x,t.z,.55*t.scale,.55*t.scale,'tree');
 world.userData.district24={areaRatio:q.areaRatio,bounds:b,core:q.core,roads:q.roads,plots:q.plots};rebuildColliderGrid();roadNavGraph=null;
};
const harborGardenBefore24=harborGardens15;
harborGardens15=function(){
 harborGardenBefore24();if(activeScene.key!=='harbor')return;const rng=seeded(240881),b=activeScene.bounds;
 for(const[x,z]of[[260,49],[381,50]])brookHouse(x,z,9,8,'home');rebuildColliderGrid();
 for(let i=0;i<3600;i++){const x=mix(b[0]+5,b[1]-5,rng()),z=mix(b[2]+5,59,rng());if(roadDistance(x,z)<4||!staticFree(x,z,.5))continue;if(i%57===0&&roadDistance(x,z)>7)buildSolidTree(x,z,.7+rng()*.35,'oak',rng);else plant(x,z,.35+rng()*.4,i%9===0?'flowers':'grassBlades');}
 world.userData.district24={areaRatio:districts24.harbor.areaRatio,bounds:b,roads:districts24.harbor.roads,plots:[{x:260,z:49},{x:381,z:50}]};
};
const harborFloorBefore24=harborFloor15;
harborFloor15=function(){const m=harborFloorBefore24(),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.uniforms.seabed24={value:textures.rock};sh.fragmentShader='uniform sampler2D seabed24;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('diffuseColor.rgb*=mix(stone,turf,garden);','vec3 seabed=texture2D(seabed24,p*.12).rgb*vec3(.51,.66,.61);diffuseColor.rgb*=mix(mix(stone,turf,garden),seabed,smoothstep(83.,89.,p.y));');};m.customProgramCacheKey=()=>key+'-rocky-seabed-v24';return m;};
const districtMapBefore24=localJourneyMap;
localJourneyMap=function(){let s=districtMapBefore24();if(activeScene.kind!=='poi')return s;const roads=districts24[activeScene.key].roads.map(r=>'<polyline data-district-road="true" points="'+r.p.map(q=>q.join(',')).join(' ')+'" fill="none" stroke="#e9d5a3" stroke-width="3"/>').join('');return s.replace('<g>',roads+'<g>');};
// Long click-to-move paths use the same new approaches as the terrain and map.
// Rebuild the small road index under the loader, retaining one active POI only.
const baseRoads24=ROADS.slice(),districtBuildBefore24=buildWorld;
buildWorld=function(id='approach',...args){
 const plan=scenePlan(id),extra=plan.kind==='poi'?districts24[plan.key]?.roads??[]:[];
 ROADS.splice(0,ROADS.length,...localRoads32(plan),...extra.map(r=>{const points=[];for(let i=1;i<r.p.length;i++){const a=r.p[i-1],b=r.p[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/3);for(let j=0;j<n;j++)points.push([mix(a[0],b[0],j/n),mix(a[1],b[1],j/n)]);}points.push([...r.p.at(-1)]);return{kind:r.kind,p:points,district24:true};}));
 ROAD_SEGMENTS.splice(0,ROAD_SEGMENTS.length,...ROADS.flatMap(r=>r.p.slice(1).map((b,i)=>{const a=r.p[i];return{a,b,kind:r.kind,minX:Math.min(a[0],b[0])-14,maxX:Math.max(a[0],b[0])+14,minZ:Math.min(a[1],b[1])-14,maxZ:Math.max(a[1],b[1])+14};})));ROAD_GRID.clear();
 for(const s of ROAD_SEGMENTS)for(let x=Math.floor((s.minX-55)/32);x<=Math.floor((s.maxX+55)/32);x++)for(let z=Math.floor((s.minZ-55)/32);z<=Math.floor((s.maxZ+55)/32);z++){const key=x+','+z;if(!ROAD_GRID.has(key))ROAD_GRID.set(key,[]);ROAD_GRID.get(key).push(s);}
 roadNavGraph=null;constructionCache.roads.clear();return districtBuildBefore24(id,...args);
};
// Previously coarse off-court chunks become fully textured exploration ground.
// Existing exact stair cuts and riverworks meshes remain untouched.
const districtTerrainBefore24=addContinuousTerrain;
addContinuousTerrain=function(){districtTerrainBefore24();if(activeScene?.kind!=='poi')return;const b=activeScene.bounds;
 for(const o of world.userData.terrainChunks){const old=o.geometry;old.computeBoundingBox();const box=old.boundingBox;if(!insideRect24(box.getCenter(V3()).x,box.getCenter(V3()).z,b,40)||old.userData.exactStairs17||old.attributes.position.count>500)continue;const size=box.getSize(V3()),g=new THREE.PlaneGeometry(size.x,size.z,30,30);g.rotateX(-Math.PI/2);g.translate((box.min.x+box.max.x)/2,0,(box.min.z+box.max.z)/2);const p=g.attributes.position;for(const k of['pathMix','townMix','riverMix','snowMix'])g.setAttribute(k,new THREE.Float32BufferAttribute(new Float32Array(p.count),1));for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=roadInfo(x,z);p.setY(i,groundAt(x,z));g.attributes.pathMix.setX(i,1-smooth(r.kind==='trail'?1.6:2.7,r.kind==='trail'?2.8:4.1,r.d));g.attributes.townMix.setX(i,r.kind==='trail'?0:1);g.attributes.riverMix.setX(i,1-smooth(-1,2.2,channelDistance(x,z)));g.attributes.snowMix.setX(i,winterAt(x,z));}g.computeVertexNormals();g.computeBoundingSphere();o.geometry=g;old.dispose();}
};
