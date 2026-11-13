// Keep frontage geometry, planted window boxes, collision and portal normals
// together when turning a house toward its actual local street.
const houseParts110=new WeakMap();
const frontageBlockers110=new WeakMap(),frontageSolid110=new Set(['garden fence','fountain','terrace wall','boulder','tree','canal parapet']);
function ownHouse110(factory){return function(...args){const start=colliders.length,g=factory(...args);if(g?.userData.worldHouse)houseParts110.set(g,colliders.slice(start));return g;};}
brookHouse=ownHouse110(brookHouse);woodlandHouse=ownHouse110(woodlandHouse);royalHouse=ownHouse110(royalHouse);reliefShelter=ownHouse110(reliefShelter);openHall=ownHouse110(openHall);
function streetLines110(){
 const plan=JRPG_LAYOUTS46[activeScene.key],lines=[...(plan?.routes??[]),...(plan?.loops??[])];
 if(activeScene.key==='brookstead')for(const r of ROADS)lines.push(r.p);
 return lines.length?lines:[currentScene().path];
}
function scanNearestStreet136(x,z,lines){let best={x,z,d:Infinity};for(const line of lines)for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz;if(l<1e-6)continue;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l,0,1),px=a[0]+dx*t,pz=a[1]+dz*t,d=Math.hypot(x-px,z-pz);if(d<best.d)best={x:px,z:pz,d};}return best;}
const streetQueries136=new WeakMap();
function nearestStreet110(x,z,lines){
 if(!world)return scanNearestStreet136(x,z,lines);
 let cache=streetQueries136.get(world);
 // Public lane arrays are replaced when the road layout changes. Compare
 // their identities so no answers survive a different layout or destination.
 if(!cache||cache.lines.length!==lines.length||cache.lines.some((line,i)=>line!==lines[i])){cache={lines:[...lines],points:new Map()};streetQueries136.set(world,cache);}
 const key=x+','+z;let point=cache.points.get(key);
 if(!point){point=scanNearestStreet136(x,z,lines);if(cache.points.size>=1024)cache.points.clear();cache.points.set(key,point);}
 return{...point};
}

function frontagePoint110(g,angle,pad=1.9){const f=g.userData.footprint,dx=g.userData.architecture31?.door?.[0]??0,dz=f.d/2+pad;return{x:g.position.x+dx*Math.cos(angle)+dz*Math.sin(angle),z:g.position.z-dx*Math.sin(angle)+dz*Math.cos(angle)};}
// The smith retains his established south-facing shop. Join the street in
// front of the porch rather than choosing a closer lane behind its doorway.
function frontStreet110(start,angle,lines){
 let best={...start,d:Infinity};const fx=Math.sin(angle),fz=Math.cos(angle);
 for(const line of lines)for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],dx=b[0]-a[0],dz=b[1]-a[1],n=dx*dx+dz*dz;if(n<1e-6)continue;
  const dot=(a[0]-start.x)*fx+(a[1]-start.z)*fz,slope=dx*fx+dz*fz;let lo=0,hi=1;
  if(Math.abs(slope)<1e-6){if(dot<0)continue;}else if(slope>0)lo=Math.max(0,-dot/slope);else hi=Math.min(1,-dot/slope);if(lo>hi)continue;
  const t=clamp(((start.x-a[0])*dx+(start.z-a[1])*dz)/n,lo,hi),x=a[0]+dx*t,z=a[1]+dz*t,d=Math.hypot(x-start.x,z-start.z);if(d<best.d)best={x,z,d};
 }return best;
}
function frontageFree110(x,z,owner,houses){
 if(waterGround(x,z)||!inSceneBounds(x,z,-.2))return false;
 for(const g of houses){const f=g.userData.footprint,a=g===owner?(g.userData.planningAngle110??g.rotation.y):g.rotation.y,margin=g===owner?.1:.65,dx=x-g.position.x,dz=z-g.position.z,lx=dx*Math.cos(a)-dz*Math.sin(a),lz=dx*Math.sin(a)+dz*Math.cos(a);if(Math.abs(lx)<f.w/2+margin&&Math.abs(lz)<f.d/2+margin)return false;}
 let blockers=frontageBlockers110.get(world);if(!blockers){blockers=colliders.filter(c=>frontageSolid110.has(c.type));frontageBlockers110.set(world,blockers);}for(const c of blockers)if(Math.abs(x-c.x)<c.w/2+.6&&Math.abs(z-c.z)<c.d/2+.6)return false;
 return true;
}
function frontageRoute110(start,end,owner,houses){
 const free=(x,z)=>frontageFree110(x,z,owner,houses),line=(a,b)=>{const n=Math.ceil(Math.hypot(a.x-b.x,a.z-b.z)/.7);for(let i=0;i<=n;i++)if(!free(mix(a.x,b.x,i/(n||1)),mix(a.z,b.z,i/(n||1))))return false;return true;};
 if(line(start,end))return[start,end];
 const open=[{...start,g:0,f:Math.hypot(start.x-end.x,start.z-end.z),prev:null}],seen=new Map(),closed=new Set();let finish=null;
 for(let n=0;open.length&&n<2400;n++){let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;const p=open.splice(best,1)[0],key=Math.round(p.x-start.x)+','+Math.round(p.z-start.z);if(closed.has(key))continue;closed.add(key);if(Math.hypot(p.x-end.x,p.z-end.z)<2&&line(p,end)){finish=p;break;}
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const x=p.x+dx,z=p.z+dz,k=Math.round(x-start.x)+','+Math.round(z-start.z),cost=p.g+Math.hypot(dx,dz);if(cost>(seen.get(k)??Infinity)||cost>100||!free(x,z)||!line(p,{x,z}))continue;seen.set(k,cost);open.push({x,z,g:cost,f:cost+Math.hypot(x-end.x,z-end.z),prev:p});}
 }
 if(!finish)return null;const path=[end];for(let p=finish;p;p=p.prev)path.push({x:p.x,z:p.z});path.reverse();const simple=[path[0]];for(let i=0;i<path.length-1;){let j=path.length-1;while(j>i+1&&!line(path[i],path[j]))j--;simple.push(path[j]);i=j;}return simple;
}
function turnHouse110(g,angle){
 const delta=angle-g.rotation.y;if(Math.abs(delta)<.01)return;
 const x=g.position.x,z=g.position.z,rotation=new THREE.Matrix4().makeTranslation(x,0,z).multiply(new THREE.Matrix4().makeRotationY(delta)).multiply(new THREE.Matrix4().makeTranslation(-x,0,-z));
 for(const c of houseParts110.get(g)??[]){const p=V3(c.x,0,c.z).applyMatrix4(rotation);c.x=p.x;c.z=p.z;if(Math.abs(Math.sin(delta))>.5)[c.w,c.d]=[c.d,c.w];}
 for(const [kind,r]of Object.entries(g.userData.plantRanges??{}))for(let i=r.start;i<r.end;i++)world.userData.plantMatrices[kind][i]?.premultiply(rotation);
 g.rotation.y=angle;g.updateMatrix();g.updateMatrixWorld(true);const f=g.userData.footprint,dx=g.userData.architecture31?.door?.[0]??0;
 g.userData.front=V3(Math.sin(angle),0,Math.cos(angle));g.userData.door=g.localToWorld(V3(dx,0,f.d/2+1.1));
 for(const o of interactables)if(o.doorOwner39===g){o.x=g.userData.door.x;o.z=g.userData.door.z;if(o.buildingPortal48)o.buildingPortal48.front=[Math.sin(angle),Math.cos(angle)];if(o.floorMarker){const old=o.floorMarker;old.removeFromParent();old.geometry.dispose();old.material.dispose();travelMarker39(o,[-Math.sin(angle),-Math.cos(angle)],2.3);}}
 for(const c of world.userData.cutaways??[])if(c.group===g){c.box?.setFromObject(g);c.bounds?.setFromObject?.(g);c.core17?.applyMatrix4(rotation);}
}
function frontagePath110(g,route){
 const p=[],uv=[],indices=[],width=1.35;let distance=0;
 for(let k=1;k<route.length;k++){const a=route[k-1],b=route[k],length=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(length/.75)),dx=(b.x-a.x)/(length||1),dz=(b.z-a.z)/(length||1);
  for(let j=0;j<=n;j++){const t=j/n,x=mix(a.x,b.x,t),z=mix(a.z,b.z,t);for(const side of[-1,1]){const xx=x-dz*side*width/2,zz=z+dx*side*width/2;p.push(xx,groundAt(xx,zz)+.035,zz);uv.push(side<0?0:width*.65,(distance+t*length)*.65);}if(j){const v=p.length/3-4;indices.push(v,v+2,v+1,v+1,v+2,v+3);}}
  distance+=length;
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
 const material=new THREE.MeshStandardMaterial({map:environment102.maps.get(['brookstead','highmere','harbor'].includes(activeScene.key)?'cobbleOld':'earthTrail'),color:'#ffffff',roughness:.94,metalness:0,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});material.userData.textureKey=['brookstead','highmere','harbor'].includes(activeScene.key)?'cobbleOld':'earthTrail';addCloudLighting(material);lightPaintedSurface82(material);materialFinish103(material);
 const mesh=new THREE.Mesh(geometry,material);mesh.name='Fitted front-door path';mesh.receiveShadow=true;mesh.userData.frontagePath110=true;world.add(mesh);return{owner:g,route,width,length:distance};
}
function fitVillage110(){
 if(activeScene?.kind!=='poi'||world.userData.villageStreets110)return;
 const houses=(world.userData.buildings??[]).filter(g=>g.userData.worldHouse&&g.userData.footprint&&g.userData.door),lines=streetLines110(),paths=[],summary=[];
 for(const g of houses){
  const current=g.rotation.y,forge=g.userData.kind==='forge',angles=g.userData.kind==='mill'?[Math.PI/2]:forge?[current]:[current,0,Math.PI/2,Math.PI,-Math.PI/2],choices=[];
  for(const angle of [...new Set(angles)]){const start=frontagePoint110(g,angle),road=forge?frontStreet110(start,angle,lines):nearestStreet110(start.x,start.z,lines),toward=(road.x-start.x)*Math.sin(angle)+(road.z-start.z)*Math.cos(angle);if(!Number.isFinite(road.d)||toward<-.2)continue;g.userData.planningAngle110=angle;const route=frontageRoute110(start,road,g,houses);if(!route)continue;choices.push({angle,start,road,route,score:road.d+(Math.abs(angle-current)<.01?-.9:0)});}
  delete g.userData.planningAngle110;
  choices.sort((a,b)=>a.score-b.score);const choice=choices[0];
  if(!choice){summary.push({kind:g.userData.kind,at:[g.position.x,g.position.z],connected:false});continue;}
  turnHouse110(g,choice.angle);const door=frontagePoint110(g,choice.angle,.42),route=[door,...choice.route];paths.push(frontagePath110(g,route));
  summary.push({kind:g.userData.kind,at:[g.position.x,g.position.z],front:g.userData.front.toArray(),connected:true,path:route.map(p=>[p.x,p.z]),road:[choice.road.x,choice.road.z]});
 }
 // Plants only need an exact height test when they touch a front-door path.
 // Index the short path segments once instead of scanning all of them for
 // every blade/flower, then discard the index with this construction pass.
 const pathCells137=new Map(),pathCell137=8,pathProof137={queries:0,tests:0,verified:0};
 for(const q of paths)for(let i=1;i<q.route.length;i++){
  const a=q.route[i-1],b=q.route[i],r=q.width/2+.2,edge={a:[a.x,a.z],b:[b.x,b.z],r};
  for(let z=Math.floor((Math.min(a.z,b.z)-r)/pathCell137);z<=Math.floor((Math.max(a.z,b.z)+r)/pathCell137);z++)for(let x=Math.floor((Math.min(a.x,b.x)-r)/pathCell137);x<=Math.floor((Math.max(a.x,b.x)+r)/pathCell137);x++){const key=x+','+z;if(!pathCells137.has(key))pathCells137.set(key,[]);pathCells137.get(key).push(edge);}
 }
 const nearPath=(x,z)=>{pathProof137.queries++;const result=(pathCells137.get(Math.floor(x/pathCell137)+','+Math.floor(z/pathCell137))??[]).some(e=>{pathProof137.tests++;return segmentDistance(x,z,e.a,e.b)<e.r;});
  if(window.__verifyWater137){const before=paths.some(q=>q.route.slice(1).some((b,i)=>segmentDistance(x,z,[q.route[i].x,q.route[i].z],[b.x,b.z])<q.width/2+.2));pathProof137.verified++;if(before!==result)throw Error('Front-door path query changed');}return result;};
 world.userData.pathQueries137=pathProof137;
 // Keep windowsill planting; clear only low ground cover from the new walks.
 const matrix=new THREE.Matrix4(),zero=new THREE.Matrix4().makeScale(0,0,0);let cleared=0;
 for(const o of [...world.userData.plantMeshes??[],...world.userData.ecology104?.meshes??[]]){if(!o.isInstancedMesh)continue;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);const e=matrix.elements,x=e[12],z=e[14];if(!nearPath(x,z)||e[13]>groundAt(x,z)+1.2)continue;zero.setPosition(x,e[13],z);o.setMatrixAt(i,zero);if(o.userData.plantOriginal?.[i])o.userData.plantOriginal[i].copy(zero);cleared++;}o.instanceMatrix.needsUpdate=true;}
 roadNavGraph=null;
 // Authored signs are fitted after wall batching has finished. This keeps
 // their native UVs, facing, depth and art independent of wall-atlas passes.
 world.userData.fittingSigns110=true;
 for(const g of houses)if(g.userData.pendingServiceSign110){const key=g.userData.pendingServiceSign110;delete g.userData.pendingServiceSign110;brookSign(g,key,0,0,0);}
 for(const o of interactables){const g=o.doorOwner39,spec=INTERIORS[o.interior];if(!g||!spec||g.userData.serviceSign110)continue;const key=spec.type==='inn'?'innSign':spec.category==='equipment'?'forgeSign':spec.type==='shop'?'shopSign':null;if(!key)continue;const f=g.userData.footprint;if(f)brookSign(g,key,f.w*.32,3.65,f.d/2+.55);}
 world.userData.fittingSigns110=false;
 world.userData.villageStreets110={houses:summary,paths:paths.length,clearedPlants:cleared};world.updateMatrixWorld(true);
}
// An emblem is inset into a solid board. Two correctly oriented faces avoid
// floating pictures, backwards symbols and art protruding beyond its backing.
brookSign=function(parent,key,x,y,z){
 if(activeScene?.kind==='poi'&&!world.userData.fittingSigns110&&!world.userData.villageStreets110){parent.userData.pendingServiceSign110=key;return null;}
 const f=parent.userData.footprint,kind=parent.userData.kind,front=f.d/2+.12,door=parent.userData.architecture31?.door?.[0]??0;
 let anchor,placement;
 if(parent.userData.brookHouse){
  const width=kind==='inn'?Math.min(f.w*.70,10.5):kind==='shop'?Math.min(f.w*.66,8):Math.min(f.w*.54,6),depth=kind==='inn'?2.25:1.8,post=(kind==='shop'?0:door)+width/2-.12;
  x=post+.70;y=2.10;z=front+depth+.04;anchor=V3(-.70,.84,-.12);placement='existing porch post';
 }else if(parent.userData.openInterior){
  x=2.30;y=3.17;z=f.d/2+1.94;anchor=V3(-.42,.85,-.06);placement='entrance canopy fascia';
 }else{
  const right=f.w*.28-1.08,left=door+1.25;x=(left+right)/2;y=2.1;z=front+.48;anchor=V3(0,.84,-.43);placement='clear facade beside door';
 }
 const g=new THREE.Group();g.name=key==='innSign'?'Inn hanging sign':key==='forgeSign'?'Blacksmith hanging sign':'Supplies hanging sign';g.position.set(x,y,z);g.userData.serviceSign110=key;parent.add(g);parent.userData.serviceSign110=key;
 const art=textures[key],faceWidth=1.10,faceHeight=faceWidth*art.image.height/art.image.width,boardWidth=faceWidth+.10,boardHeight=faceHeight+.12;
 g.userData.fittedSign110={placement,anchor:anchor.toArray(),board:[boardWidth,boardHeight,.12],nativeAspect:art.image.width/art.image.height};
 box(anchor.x,anchor.y,anchor.z,.14,.23,.10,'metal','#58615e',g);
 beam(anchor,V3(.38,.85,0),.045,'metal','#58615e',g);beam(anchor.clone().add(V3(0,-.22,0)),V3(-.10,.85,0),.03,'metal','#58615e',g);
 for(const xx of[-.31,.31])beam(V3(xx,.85,0),V3(xx,boardHeight/2+.01,0),.018,'metal','#58615e',g);
 box(0,0,0,boardWidth,boardHeight,.12,'darkWood','#68523d',g);
 for(const xx of[-boardWidth/2+.025,boardWidth/2-.025])box(xx,0,.065,.045,boardHeight,.045,'wood','#a88c5f',g);for(const yy of[-boardHeight/2+.025,boardHeight/2-.025])box(0,yy,.065,boardWidth,.045,.045,'wood','#a88c5f',g);
 // Opaque physical faces keep native image UVs. The general wall atlas stores
 // its images top-down, and would invert and stretch these authored emblems.
 for(const side of[-1,1]){const material=new THREE.MeshPhysicalMaterial({map:art,color:'#ffffff',roughness:.86,metalness:0,side:THREE.FrontSide});material.userData.textureKey=key;material.userData.authoredSign110=true;addCloudLighting(material);lightPaintedSurface82(material);materialFinish103(material);const face=new THREE.Mesh(new THREE.PlaneGeometry(faceWidth,faceHeight),material);face.name='Upright native-aspect service emblem';face.receiveShadow=true;face.position.z=side*.064;face.rotation.y=side<0?Math.PI:0;g.add(face);}
 // Retain plain measurements through static batching, which combines these
 // child meshes into their house. No object references enter cloned metadata.
 parent.updateMatrixWorld(true);const inverse=parent.matrixWorld.clone().invert(),bounds=new THREE.Box3().setFromObject(g).applyMatrix4(inverse),windows=[];
 parent.traverse(o=>{if(o.name==='Recessed glazed window'||o.material?.userData.glazing104)windows.push(new THREE.Box3().setFromObject(o).applyMatrix4(inverse));});
 parent.userData.signPlacement110={key,placement,position:[x,y,z],nativeAspect:art.image.width/art.image.height,faceAspect:faceWidth/faceHeight,bounds:[bounds.min.toArray(),bounds.max.toArray()],windowBounds:windows.map(b=>[b.min.toArray(),b.max.toArray()]),windowClashes:windows.filter(b=>bounds.intersectsBox(b)).length};
 return g;
};
const frontageBuildBefore110=buildWorld;
buildWorld=function(...args){const r=frontageBuildBefore110(...args);fitVillage110();return r;};
// Door walks extend the local playable shoulder; physical scenery still owns
// collisions. The obsolete route mask must not block a newly connected door.
const frontageStaticBefore110=staticFree;
staticFree=function(x,z,r=.4,...args){
 if(activeScene?.kind==='poi'&&world?.userData.villageStreets110?.houses.some(h=>h.connected&&h.path.slice(1).some((b,i)=>segmentDistance(x,z,h.path[i],b)<.8)))return boundaryFreeBefore46(x,z,r,...args);
 return frontageStaticBefore110(x,z,r,...args);
};
