// Continuous, terrain-fitted paving completes the square. It shares the
// town's PBR cobbles instead of a bright, level disc cutting into the terrace.
const fountainBefore122=brookFountain;
const townPaving122=new WeakMap();
function pavingMaterial122(){
 if(townPaving122.has(world))return townPaving122.get(world);
 const m=new THREE.MeshStandardMaterial({map:environment102.maps.get('cobbleOld'),color:'#b7bead',roughness:.93,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});m.userData.textureKey='cobbleOld';addCloudLighting(m);lightPaintedSurface82(m);materialFinish103(m);townPaving122.set(world,m);return m;
}
brookFountain=function(){
 const start=world.children.length;fountainBefore122();
 const g=world.children.slice(start).find(o=>o.isGroup&&o.children[0]?.geometry?.type==='CircleGeometry');if(!g)return;
 const {x,z,r}=BROOK.plaza,rows=14,segments=96,positions=[],uv=[],indices=[];
 for(let j=0;j<=rows;j++)for(let i=0;i<=segments;i++){
  const a=i/segments*TAU,rad=r*j/rows,xx=Math.cos(a)*rad,zz=Math.sin(a)*rad;
  positions.push(xx,heightAt(x+xx,z+zz)+.058-g.position.y,zz);uv.push((x+xx)*.30,(z+zz)*.30);
  if(i&&j){const k=j*(segments+1)+i;indices.push(k-segments-2,k,k-1,k-segments-2,k-segments-1,k);}
 }
 const paving=g.children[0],geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingSphere();
 paving.geometry.dispose();paving.geometry=geo;paving.rotation.set(0,0,0);paving.position.set(0,0,0);paving.material=pavingMaterial122();paving.receiveShadow=true;paving.name='Complete terrain-fitted Brookstead square';
 // Seat the concentric stone inlays on the same surface, around every side.
 for(const o of g.children.slice(1))if(o.geometry?.type==='BoxGeometry'&&o.position.y<.10){const xx=x+o.position.x,zz=z+o.position.z;o.position.y=heightAt(xx,zz)+.075-g.position.y;o.material=material('wall','#879485');}
 g.userData.square122={complete:true,radius:r,terrainFitted:true,radialCourses:rows};
 rebuildBasin123(g,x,z);
 world.userData.square122=g.userData.square122;
};
function basinRing123(parent,outer,inner,y,depth,tint){
 const shape=new THREE.Shape();shape.absarc(0,0,outer,0,TAU,false);const hole=new THREE.Path();hole.absarc(0,0,inner,0,TAU,true);shape.holes.push(hole);
 const geometry=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,curveSegments:64});geometry.rotateX(-Math.PI/2);
 const o=mesh(geometry,material('wall',tint),0,y,0,parent);o.name='Continuous circular fountain masonry';return o;
}
function rebuildBasin123(g,x,z){
 // The old polygon of radial boxes left gaps and could be buried by terrain.
 // Replace the basin itself, independently from the surrounding plaza.
 const removed=new Set();
 for(const o of [...g.children])if(o!==g.children[0]&&Math.hypot(o.position.x,o.position.z)<3.5){removed.add(o);o.removeFromParent();}
 world.userData.supplyJets=(world.userData.supplyJets??[]).filter(o=>!removed.has(o));
 const heights=[];for(let j=0;j<=4;j++)for(let i=0;i<64;i++){const a=i/64*TAU,rad=j/4*3.18;heights.push(heightAt(x+Math.cos(a)*rad,z+Math.sin(a)*rad));}
 const high=Math.max(...heights),low=Math.min(...heights),level=high+.12,basin=new THREE.Group();basin.position.y=level-g.position.y;basin.name='Complete elevated fountain basin';g.add(basin);
 const foundationDepth=Math.max(.28,level-low+.12);mesh(new THREE.CylinderGeometry(3.16,3.20,foundationDepth,96),material('wall','#a9b3a3'),0,-foundationDepth/2+.035,0,basin);
 basinRing123(basin,2.87,2.20,.03,.69,'#b5bfad');basinRing123(basin,3.03,2.12,.72,.18,'#cbd0ba');
 // Radial mortar cuts sit on a continuous cap; they cannot expose terrain.
 for(let i=0;i<32;i++){const a=i/32*TAU,o=box(Math.cos(a)*2.575,.903,Math.sin(a)*2.575,.017,.009,.90,'darkWood','#73847a',basin);o.rotation.y=Math.PI/2-a;}
 const waterMat=new THREE.MeshPhysicalMaterial({color:'#377c7b',roughness:.16,metalness:0,envMap:surface67.outdoor,envMapIntensity:.55,clearcoat:.8,clearcoatRoughness:.12});
 const pool=mesh(new THREE.CircleGeometry(2.195,96),waterMat,0,.64,0,basin);pool.rotation.x=-Math.PI/2;pool.castShadow=false;pool.name='Unbroken circular fountain pool';pool.userData.dynamicWater=true;
 for(const [radius,yy,h]of[[.76,.5,1.2],[1.1,1.5,.23],[.4,2,1],[.62,2.6,.19]])mesh(new THREE.CylinderGeometry(radius,radius*1.05,h,32),material('wall','#c8cebb'),0,yy,0,basin);
 for(let i=0;i<8;i++){
  const a=i/8*TAU,curve=new THREE.QuadraticBezierCurve3(V3(Math.cos(a)*.48,2.71,Math.sin(a)*.48),V3(Math.cos(a)*1.1,2.1,Math.sin(a)*1.1),V3(Math.cos(a)*1.8,.65,Math.sin(a)*1.8));
  const stream=mesh(new THREE.TubeGeometry(curve,24,.026,6,false),material('cloth','#b6d0cd',{transparent:true,opacity:.64,emissive:'#347c7b',emissiveIntensity:.10}),0,0,0,basin);stream.castShadow=false;stream.userData.dynamicWater=true;world.userData.supplyJets.push(stream);
 }
 const point=world.userData.fountains[world.userData.fountains.length-1];point.set(x,level+2.75,z);
 const blocker=colliders.find(c=>c.type==='fountain'&&Math.hypot(c.x-x,c.z-z)<.1);if(blocker)blocker.w=blocker.d=3.05;
 g.userData.square122.basin123={continuous:true,innerRadius:2.20,outerRadius:3.03,groundHigh:high,groundLow:low,base:level,minimumClearance:level-high};
 world.userData.fountain123={basin,pool,base:level,x,z};
}
const plazaApproachMaterials132=new WeakMap();
function plazaApproachMaterial132(){
 if(plazaApproachMaterials132.has(world))return plazaApproachMaterials132.get(world);
 const source=pavingMaterial122(),m=source.clone(),before=source.onBeforeCompile,key=source.customProgramCacheKey();
 m.userData={...source.userData,plazaBoundary132:true};
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.publicCircle132={value:new THREE.Vector3(BROOK.plaza.x,BROOK.plaza.z,BROOK.plaza.r-.025)};
  s.vertexShader='varying vec2 routeWorld132;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nrouteWorld132=(modelMatrix*vec4(transformed,1.)).xz;');
  s.fragmentShader='uniform vec3 publicCircle132;varying vec2 routeWorld132;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(distance(routeWorld132,publicCircle132.xy)<publicCircle132.z)discard;');
 };m.customProgramCacheKey=()=>key+'-unbroken-public-plaza132';plazaApproachMaterials132.set(world,m);return m;
}
function townWalk122(route,width=2.6){
 const p=[],uv=[],indices=[];let distance=0;
 for(let k=1;k<route.length;k++){
  const a=route[k-1],b=route[k],length=Math.hypot(b.x-a.x,b.z-a.z);if(length<.02)continue;
  const n=Math.max(1,Math.ceil(length/.50)),dx=(b.x-a.x)/length,dz=(b.z-a.z)/length;
  for(let j=0;j<=n;j++){
   const t=j/n,x=mix(a.x,b.x,t),z=mix(a.z,b.z,t);
   for(const side of[-1,1]){const xx=x-dz*side*width/2,zz=z+dx*side*width/2;p.push(xx,heightAt(xx,zz)+.052,zz);uv.push(side<0?0:width*.30,(distance+t*length)*.30);}
   if(j){const v=p.length/3-4;indices.push(v,v+1,v+2,v+1,v+3,v+2);}
  }
  distance+=length;
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
 const m=plazaApproachMaterial132();
 const o=new THREE.Mesh(g,m);o.name='Continuous Brookstead cottage walk';o.receiveShadow=true;o.userData.frontagePath110=true;world.add(o);
 return{route,width,length:distance};
}
const frontWalkBefore122=frontagePath110;
frontagePath110=function(g,route){return activeScene.key==='brookstead'?{owner:g,...townWalk122(route,g.userData.kind==='home'?2.3:2.8)}:frontWalkBefore122(g,route);};
// The rear garden cottage has an explicit lane into the north of the square.
// Include it in planning before front-door paths and vegetation are fitted.
const streetsBefore122=streetLines110;
// The west approach must end outside the complete plaza, not cut through its
// left arc. Geometry and the walking-height function share this same plan.
BROOK.crossStairs={start:-131.6,length:7,z:68.5,depth:5,lo:3.8,hi:6.2};
const westStair123=STEPS19.find(s=>s.axis==='x'&&s.z===68.5);
Object.assign(westStair123,{x:BROOK.crossStairs.start-BROOK.crossStairs.length/2,len:BROOK.crossStairs.length,w:BROOK.crossStairs.depth});
const clipStairsBefore123=clipStairGround17;
clipStairGround17=function(g,steps){return clipStairsBefore123(g,activeScene?.key==='brookstead'?steps.map(s=>s.x===-132&&s.z===68.5?{...s,x:westStair123.x,w:westStair123.len,d:westStair123.w}:s):steps);};
// House foundation blending previously raised the west part of the square
// after its paving was built. The public plaza has priority over that blend.
const seatedSquareBefore123=seatedGround45;
seatedGround45=function(x,z,base){
 const old=seatedSquareBefore123(x,z,base);if(activeScene?.key!=='brookstead')return old;
 const radial=Math.hypot(x-BROOK.plaza.x,z-BROOK.plaza.z),weight=1-smooth(BROOK.plaza.r+2.4,BROOK.plaza.r+5.4,radial);return mix(old,3.8,weight);
};
const squareHeightBefore123=heightAt;
heightAt=function(x,z,...args){
 if(activeScene?.key==='brookstead'&&!encounter53.active&&Math.hypot(x-BROOK.plaza.x,z-BROOK.plaza.z)<=BROOK.plaza.r+.15)return 3.8;
 return squareHeightBefore123(x,z,...args);
};
const NORTH_LANES122=[
 [[-129.5,34.3],[-129.5,41],[-127,47],[-124,53],[-121,55]],
 [[-150.35,42.3],[-150.35,46],[-140,46],[-133,44],[-129.5,41]]
];
streetLines110=function(){const lines=streetsBefore122();return activeScene.key==='brookstead'?[...lines,...NORTH_LANES122,[[-143,68.5],[-138.6,68.5],[-131.6,68.5],[-128,68.5]]]:lines;};
const fitTownBefore122=fitVillage110;
fitVillage110=function(){
 if(activeScene.key!=='brookstead'||world.userData.townLayout122)return fitTownBefore122();
 // This lane is continuous all the way from the rear house to the square.
 const lanes=NORTH_LANES122.map(line=>line.map(([x,z])=>({x,z}))),rear=lanes[0];for(const lane of lanes)townWalk122(lane,2.6);
 townWalk122([{x:-142.8,z:68.5},{x:-138.6,z:68.5}],2.6);townWalk122([{x:-131.6,z:68.5},{x:-128,z:68.5}],2.6);
 fitTownBefore122();
 const backHouse=world.userData.villageStreets110.houses.find(h=>Math.abs(h.at[0]+128)<1&&Math.abs(h.at[1]-29)<1);
 if(backHouse?.connected)backHouse.path.push(...rear.slice(1).map(p=>[p.x,p.z]));
 const weaver=world.userData.villageStreets110.houses.find(h=>Math.abs(h.at[0]+149)<1&&Math.abs(h.at[1]-37)<1);
 if(weaver?.connected)weaver.path.push(...lanes[1].slice(1).map(p=>[p.x,p.z]));
 // Remove cover from the entire new lane, including the part beyond the
 // short doorway connector. Window boxes and tall planting are untouched.
 const matrix=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0);
 for(const o of[...world.userData.plantMeshes??[],...world.userData.ecology104?.meshes??[]]){
  if(!o.isInstancedMesh)continue;
  for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);const e=matrix.elements,x=e[12],z=e[14];if(e[13]>heightAt(x,z)+1.2||!lanes.some(line=>line.slice(1).some((b,k)=>segmentDistance(x,z,[line[k].x,line[k].z],[b.x,b.z])<1.6)))continue;zero.setPosition(x,e[13],z);o.setMatrixAt(i,zero);o.userData.plantOriginal?.[i]?.copy(zero);}
  o.instanceMatrix.needsUpdate=true;
 }
 const houses=world.userData.buildings.filter(g=>g.userData.brookHouse),details=[];
 // Small planted frontages sit beside the entry, never on its path. All
 // positions are transformed with the actual street-facing building.
 for(const g of houses){
  const {w,d}=g.userData.footprint,dx=g.userData.architecture31.door[0];g.updateWorldMatrix(true,false);
  for(const side of[-1,1]){
   const lx=side*(w/2-.85),local=V3(lx,0,d/2+2.1),at=g.localToWorld(local);
   if(Math.abs(lx-dx)<2.1||waterGround(at.x,at.z)||!inSceneBounds(at.x,at.z,0))continue;
   const nearRoute=world.userData.villageStreets110.houses.some(h=>h.connected&&h.path.slice(1).some((b,i)=>segmentDistance(at.x,at.z,h.path[i],b)<2.0));if(nearRoute)continue;
   const pot=new THREE.Group();pot.position.set(at.x,heightAt(at.x,at.z),at.z);pot.rotation.y=g.rotation.y;pot.name='Street-side planted cottage frontage';world.add(pot);
   planter121(pot,0,.33,0,1.35);for(const hand of[-1,1])box(hand*.60,.18,0,.18,.35,.70,'wall','#b8bba7',pot);mergeGroup(pot);
   details.push({house:g.name,position:pot.position.toArray()});
  }
 }
 // Two quiet corners frame the square without obstructing its spoke routes.
 for(const [x,z,a]of[[-127.5,58.5,-.55],[-115,69.1,2.6]]){
  if(waterGround(x,z)||!staticFree(x,z,.45))continue;
  bench(x,z,a);details.push({bench:[x,z]});
 }
 // The garden belongs beside the rear cottage, away from the public lane.
 if(staticFree(-119.3,40,.4)&&!waterGround(-119.3,40)){
  const garden=new THREE.Group();garden.position.set(-119.3,heightAt(-119.3,40),40);garden.name='Rear cottage kitchen garden';world.add(garden);
  for(const x of[-1.05,1.05]){
   box(x,.12,0,1.65,.24,3.2,'earth','#625c40',garden);
   for(const side of[-1,1]){box(x+side*.84,.18,0,.10,.34,3.4,'wood','#8a7b56',garden);box(x,.18,side*1.63,1.75,.34,.10,'wood','#8a7b56',garden);}
   for(let j=0;j<5;j++)planter121(garden,x,.05,-1.2+j*.60,.78);
  }
  for(const side of[-1,1])box(side*2,.85,-2.1,.14,1.7,.14,'darkWood','#7e6c4b',garden);
  for(const y of[.65,1.2])beam(V3(-2,y,-2.1),V3(2,y,-2.1),.035,'wood','#a39267',garden);
  mergeGroup(garden);details.push({garden:garden.position.toArray()});
 }
 world.userData.townLayout122={rearLane:rear.map(p=>[p.x,p.z]),northLanes:lanes.map(line=>line.map(p=>[p.x,p.z])),paths:world.userData.villageStreets110.paths,details,square:world.userData.square122};
 world.updateMatrixWorld(true);rebuildColliderGrid();
};

// Cut actual rails and posts out of pedestrian corridors before static
// batching. Removing collision alone would leave a visible fence across them.
function fenceCorridors123(){
 const lines=streetLines110().map(p=>({p,pad:activeScene.key==='brookstead'?2.35:2.1}));
 const primary=lines.map(q=>q.p);
 for(const g of world.userData.buildings??[]){
  const f=g.userData.footprint;if(!f||!g.userData.door)continue;
  for(const a of[0,Math.PI/2,Math.PI,-Math.PI/2]){
   const start=frontagePoint110(g,a,1.0),road=nearestStreet110(start.x,start.z,primary),toward=(road.x-start.x)*Math.sin(a)+(road.z-start.z)*Math.cos(a);
   if(road.d<24&&toward>-.3)lines.push({p:[[start.x,start.z],[road.x,road.z]],pad:1.75});
  }
 }
 return lines;
}
function clearFenceSpan123(a,b,lines){
 const n=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.3));
 for(let i=0;i<=n;i++){const x=mix(a[0],b[0],i/n),z=mix(a[1],b[1],i/n);for(const q of lines)for(let j=1;j<q.p.length;j++)if(segmentDistance(x,z,q.p[j-1],q.p[j])<q.pad+.22)return false;}
 return true;
}
function gardenFence123(a,b,wood=true,solid=false){
 const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<.05)return;
 const n=Math.ceil(length/1.4),lines=fenceCorridors123(),group=new THREE.Group();group.name='Path-cleared garden fence';world.add(group);let gaps=0,kept=0;
 world.userData.fences123??=[];
 for(let i=0;i<n;i++){
  const start=[mix(a[0],b[0],i/n),mix(a[1],b[1],i/n)],end=[mix(a[0],b[0],(i+1)/n),mix(a[1],b[1],(i+1)/n)];
  if(!clearFenceSpan123(start,end,lines)||waterGround(...start)||waterGround(...end)){gaps++;continue;}
  const y0=heightAt(...start),y1=heightAt(...end),key=wood?'wood':'wall',tint=wood?'#a48d60':'#a9b5a4';
  for(const [p,y]of[[start,y0],[end,y1]]){box(p[0],y+.62,p[1],wood?.19:.42,1.24,wood?.19:.42,key,tint,group);if(wood)box(p[0],y+1.27,p[1],.26,.12,.26,'wood','#b9a16d',group);}
  for(const h of[.45,.95])beam(V3(start[0],y0+h,start[1]),V3(end[0],y1+h,end[1]),wood?.07:.15,key,tint,group);
  if(solid)obstacle((start[0]+end[0])/2,(start[1]+end[1])/2,Math.max(.19,Math.abs(end[0]-start[0])),Math.max(.19,Math.abs(end[1]-start[1])),'garden fence');
  world.userData.fences123.push({a:start,b:end,wood,solid,clearance:true});kept++;
 }
 if(kept)mergeGroup(group);else group.removeFromParent();
 world.userData.fenceGaps123=(world.userData.fenceGaps123??0)+gaps;
}
const brookFenceBefore123=brookFence;
brookFence=function(x,z,xx,zz){
 if(activeScene?.kind!=='poi')return brookFenceBefore123(x,z,xx,zz);
 if(z===100&&zz===100&&x===-161&&xx===-155)return;
 return gardenFence123([x,z],[xx,zz],true,true);
};
const fenceBefore123=fence;
fence=function(a,b,wood=true){if(activeScene?.kind==='poi')return gardenFence123(a,b,wood,false);return fenceBefore123(a,b,wood);};
