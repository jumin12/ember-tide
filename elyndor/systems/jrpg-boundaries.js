// The public landscape is a union of valleys, approaches and courtyards.
// Its continuous signed distance defines both the forest edge and collision.
let buildingBoundary46=false;
// Match the surrounding woodland: branching crowns, mixed ages and species,
// with irregular glades behind the edge instead of a pair of planted rows.
function boundaryTree47(x,z,y,random,local=false){
 const habitat=(Math.sin(x*.041+Math.cos(z*.047)*1.8)+Math.cos(z*.029-x*.017)+2)/4,u=random(),species=habitat<.23?4:u<.25?1:u<.43?2:0,sapling=random()<.23;
 const h=(sapling?2.8+random()*2.2:5.1+random()*4.3)*(local?1.16:1),scale=h/(species===1?7.4:7),lean=(random()-.5)*.8*scale,tree={x,z,y,h,scale,species30:species,hidden:false,until:0,bindings:[],barrier46:true,naturalEdge47:true,trunks:[],crowns:[]};
 const matrix=(p,s,q=new THREE.Quaternion())=>new THREE.Matrix4().compose(p,q,s);
 tree.trunks.push(matrix(V3(x+lean*.3,y+h*.37,z),V3((species===1?.35:.46)*scale,h*.74,.4*scale)));
 const count=species===4?5:5+Math.floor(random()*2),start=random()*TAU;
 for(let j=0;j<count;j++){
  const a=start+j*2.399963+random()*.65,k=j/(count-1),pine=species===4,reach=pine?.14*scale:(.65+random()*.8)*scale,cx=x+Math.cos(a)*reach+lean,cz=z+Math.sin(a)*reach,cy=y+h*(pine?.32+k*.57:.65+random()*.21);
  const sx=pine?(2.35-k*1.55)*scale:(1.15+random()*.55)*scale,sy=pine?.9*scale:(species===1?1.55:1.15+random()*.5)*scale,sz=pine?sx:(1.1+random()*.5)*scale;
  tree.crowns.push(matrix(V3(cx,cy,cz),V3(sx,sy,sz),new THREE.Quaternion().setFromEuler(new THREE.Euler((random()-.5)*.3,a,(random()-.5)*.2))));
  if(!pine&&j<2){const from=V3(x,y+h*(.4+j*.08),z),to=V3(cx,cy-sy*.3,cz),d=to.clone().sub(from);tree.trunks.push(matrix(from.clone().add(to).multiplyScalar(.5),V3(.14*scale,d.length(),.14*scale),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize())));}
 }
 tree.cover30=tree.crowns.map(m=>new THREE.Box3(V3(-1.4,-1.4,-1.4),V3(1.4,1.4,1.4)).applyMatrix4(m));tree.box=new THREE.Box3(V3(x-.4*scale,y,z-.4*scale),V3(x+.4*scale,y+h,z+.4*scale));for(const q of tree.cover30)tree.box.union(q);return tree;
}
function boundaryWoodland47(f,ground,theme,trees,random){
 if(['cave','mountain','ruin','shrine'].includes(theme))return{brushes:0};
 const near=new Map(),cell=5,index=t=>{const key=Math.floor(t.x/cell)+','+Math.floor(t.z/cell);if(!near.has(key))near.set(key,[]);near.get(key).push(t);};if(f.overworld){const rows=bakedFloat36(BAKED_WORLD36.trees.data);for(let i=0;i<rows.length;i+=6)index({x:rows[i],z:rows[i+2],scale:rows[i+4]});}else for(const t of scenery.trees)index(t);
 const spacing=f.overworld?3.9:3.2,[x0,x1,z0,z1]=f.overworld?[LAND.minX,LAND.maxX,LAND.minZ,LAND.maxZ]:f.bounds,plantings={fern:[],grassBlades:[],flowers:[]};
 const dry=(x,z)=>f.overworld?ground(x,z)>=0&&!hydroSample38(x,z).wet:!waterGround(x,z);
 const cluster=(x,z)=>(Math.sin(x*.073+Math.cos(z*.053)*1.4)+Math.cos(z*.067-x*.027)+2)/4;
 for(let z=Math.floor((z0-23)/spacing)*spacing;z<z1+23;z+=spacing)for(let x=Math.floor((x0-23)/spacing)*spacing;x<x1+23;x+=spacing){
  const xx=x+(random()-.5)*spacing*.94,zz=z+(random()-.5)*spacing*.94,depth=-f.distance(xx,zz);if(depth<1.5||!f.overworld&&depth>38||!dry(xx,zz))continue;
  const density=(.78+cluster(xx,zz)*.22)*mix(.43,1,smooth(1.5,8,depth))*(f.overworld?1:1-smooth(28,38,depth));if(random()>density)continue;
  const y=ground(xx,zz);if(f.overworld&&(y>21||macroBiome15(xx,zz)>1.45||traversalShoreDistance(xx,zz)<2))continue;
  let crowded=false;for(let iz=Math.floor(zz/cell)-1;iz<=Math.floor(zz/cell)+1;iz++)for(let ix=Math.floor(xx/cell)-1;ix<=Math.floor(xx/cell)+1;ix++)for(const t of near.get(ix+','+iz)??[])if(Math.hypot(xx-t.x,zz-t.z)<2.35+(t.scale??1)*.35){crowded=true;break;}
  if(crowded)continue;const tree=boundaryTree47(xx,zz,y,random,!f.overworld);trees.push(tree);index(tree);
 }
 // Feather the woodland into existing grass with low, scattered plants. The
 // plants do not add collision or cover street shoulders and interaction pads.
 const step=f.overworld?2.8:2.1;
 for(let z=Math.floor((z0-14)/step)*step;z<z1+14;z+=step)for(let x=Math.floor((x0-14)/step)*step;x<x1+14;x+=step){
  const xx=x+(random()-.5)*step,zz=z+(random()-.5)*step,d=f.distance(xx,zz);if(d>2.2||d<-12||random()>.48+cluster(xx,zz)*.3||!dry(xx,zz)||f.overworld&&ground(xx,zz)>27)continue;
  if((f.overworld?macroRoadInfo15(xx,zz).d:roadDistance(xx,zz))<(f.overworld?5:3.5)||interactables.some(o=>Math.hypot(xx-o.x,zz-o.z)<3.5))continue;
  const kind=random()<.67?'fern':random()<.85?'grassBlades':'flowers',s=(kind==='fern'?.85:.65)+random()*(kind==='fern'?1.0:.65),matrix=new THREE.Matrix4().compose(V3(xx,ground(xx,zz)+s*.44,zz),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),random()*TAU),V3(s,s*(.8+random()*.35),s));plantings[kind].push(matrix);
 }
 let total=0;for(const[kind,matrices]of Object.entries(plantings)){if(!matrices.length)continue;const prototype=perf.plants.find(m=>m.userData.plantKey===kind);if(!prototype)continue;const m=new THREE.InstancedMesh(plantGeometry(kind).clone(),prototype.material,matrices.length);matrices.forEach((q,i)=>m.setMatrixAt(i,q));m.userData={barrier46:true,boundaryUnderstory47:true,plantKey:kind};m.receiveShadow=true;m.castShadow=false;m.computeBoundingSphere();world.add(m);total+=matrices.length;}
 return{brushes:total};
}
function boundaryField46(){
 if(world.userData.boundary46)return world.userData.boundary46;
 const overworld=activeScene.kind==='overworld',key=activeScene.key,blueprint=JRPG_LAYOUTS46[key];
 if(!overworld&&!blueprint)return null;
 const field={overworld,shapes:[],grid:new Map(),cell:overworld?32:16,bounds:[Infinity,-Infinity,Infinity,-Infinity],sealed:false,routeVersion51:overworld?51:null};
 const add=(a,b,r,source51='local')=>{const s={a,b,r,source51};field.shapes.push(s);const pad=r+22,c=field.cell;
  field.bounds[0]=Math.min(field.bounds[0],a[0]-r,b[0]-r);field.bounds[1]=Math.max(field.bounds[1],a[0]+r,b[0]+r);field.bounds[2]=Math.min(field.bounds[2],a[1]-r,b[1]-r);field.bounds[3]=Math.max(field.bounds[3],a[1]+r,b[1]+r);
  for(let z=Math.floor((Math.min(a[1],b[1])-pad)/c);z<=Math.floor((Math.max(a[1],b[1])+pad)/c);z++)for(let x=Math.floor((Math.min(a[0],b[0])-pad)/c);x<=Math.floor((Math.max(a[0],b[0])+pad)/c);x++){const k=x+','+z;if(!field.grid.has(k))field.grid.set(k,[]);field.grid.get(k).push(s);}
 };
 const line=(p,r,source51)=>{for(let i=1;i<p.length;i++)add(p[i-1],p[i],r,source51);};
 if(overworld){
  // The current road network, including the newer adventure branches, owns
  // both the forest edge and its invisible wall. Keep only usable shoulders.
  for(const road of MACRO_ROADS15)line(road.p,road.jrpgBranch46?11:14,road.jrpgBranch46?'adventure branch':'main road');
  for(const b of world.userData.bridges??[]){const reach=b.length/2+(b.approach38??14)+4,c=Math.cos(b.angle),s=Math.sin(b.angle);add([b.x-c*reach,b.z-s*reach],[b.x+c*reach,b.z+s*reach],Math.max(8,b.width/2+4),'bridge approach');}
  for(const[key,p]of Object.entries(POIS)){add(p.node,p.node,p.kind==='town'?48:31,'destination court');const entry=interactables.find(o=>o.type==='location'&&o.poi===key);if(entry)add(p.node,[entry.x,entry.z],10,'destination entrance');}
 }
 else{
  for(const p of[...blueprint.routes,...blueprint.loops??[]])line(p,POIS[key].kind==='town'?8:7);
  for(const[x,z,r]of blueprint.courts)add([x,z],[x,z],r);
  const base=field.shapes.slice(),connect=(x,z,r)=>{const p=[x,z];let best=null,d=Infinity;for(const s of base){const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],t=clamp(((x-s.a[0])*dx+(z-s.a[1])*dz)/(dx*dx+dz*dz||1),0,1),q=[s.a[0]+dx*t,s.a[1]+dz*t],dd=Math.hypot(x-q[0],z-q[1]);if(dd<d){d=dd;best=q;}}add(p,p,r);if(best&&d>r)add(p,best,5);};
  for(const[x,z,w,d]of blueprint.houses??[])connect(x,z,Math.hypot(w,d)*.5+4);
  for(const o of interactables){if(o.type==='poiExit'||o.type==='location'||!Number.isFinite(o.x))continue;if(o.x<blueprint.core[0]-12||o.x>blueprint.core[1]+12||o.z<blueprint.core[2]-12||o.z>blueprint.core[3]+12)continue;connect(o.x,o.z,o.actor?6:5);}
  for(const g of world.userData.buildings??[])if(g.userData.authored46&&g.userData.footprint){const f=g.userData.footprint;connect(g.position.x,g.position.z,Math.hypot(f.w,f.d)*.5+3);}
 }
 field.distance=(x,z)=>{let best=-1e4;for(const s of field.grid.get(Math.floor(x/field.cell)+','+Math.floor(z/field.cell))??[]){const circle=s.a===s.b||s.a[0]===s.b[0]&&s.a[1]===s.b[1],d=circle?Math.hypot(x-s.a[0],z-s.a[1]):segmentDistance(x,z,s.a,s.b);best=Math.max(best,s.r-d);}return best;};
 world.userData.boundary46=field;return field;
}
const boundaryFreeBefore46=staticFree;
staticFree=function(x,z,r=.4){
 if(!buildingBoundary46&&!sceneBuildFilter&&!wildlifeRouting42&&world?.userData.boundary46?.sealed){const f=world.userData.boundary46,margin=f.overworld&&compactTraversal44.routing?Math.max(1.2,r):r;if(f.distance(x,z)<margin)return false;}
 return boundaryFreeBefore46(x,z,r);
};
function boundaryContour46(f){
 const step=f.overworld?6:3,[x0,x1,z0,z1]=f.bounds,segments=[],cache=new Map(),value=(x,z)=>{const key=x+','+z;if(!cache.has(key))cache.set(key,f.distance(x,z));return cache.get(key);};
 for(let z=Math.floor((z0-step)/step)*step;z<=z1+step;z+=step)for(let x=Math.floor((x0-step)/step)*step;x<=x1+step;x+=step){
  const corners=[[x,z],[x+step,z],[x+step,z+step],[x,z+step]],v=corners.map(p=>value(...p)),edges=[];
  for(let i=0;i<4;i++){const j=(i+1)%4;if((v[i]>=0)===(v[j]>=0))continue;let a=corners[i].slice(),b=corners[j].slice(),positive=v[i]>=0;for(let k=0;k<8;k++){const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];if((f.distance(...m)>=0)===positive)a=m;else b=m;}edges.push([(a[0]+b[0])/2,(a[1]+b[1])/2]);}
  if(edges.length===2)segments.push(edges);else if(edges.length===4){segments.push([edges[0],edges[1]],[edges[2],edges[3]]);}
 }
 return segments;
}
function buildBoundary46(){
 const f=boundaryField46();if(!f||f.sealed)return;f.sealed=true;buildingBoundary46=true;
 try{
 const segments=boundaryContour46(f),trees=[],positions=[],uv=[],rng=seeded(460817),ground=f.overworld?macroGround:groundAt,theme=JRPG_LAYOUTS46[activeScene.key]?.theme;
 const tri=(a,b,c,depth=0)=>{
  // A ridge beside a concave bend must never cut across the adjoining path.
  const mid=(a,b)=>a.map((v,i)=>(v+b[i])/2),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a),centre=a.map((v,i)=>(v+b[i]+c[i])/3),samples=[a,b,c,ab,bc,ca,centre].map(p=>f.distance(p[0],p[2])),intrudes=samples.some(d=>d>.12);
  if(intrudes){if(samples.every(d=>d>.12))return;if(depth<5){tri(a,ab,ca,depth+1);tri(ab,b,bc,depth+1);tri(ca,bc,c,depth+1);tri(ab,bc,ca,depth+1);}return;}
  positions.push(...a,...b,...c);for(const p of[a,b,c])uv.push((p[0]+p[2])*.18,p[1]*.18);
 };
 // One continuous height field replaces intersecting extruded rock strips.
 // Heights share their grid vertices, so bends cannot create spikes or seams.
 const rocky=['cave','ruin','shrine','mountain'].includes(theme),step=f.overworld?4:2,[x0,x1,z0,z1]=f.bounds,ridgePoints=new Map();
 const ridgePoint=(x,z)=>{const key=x+','+z;if(ridgePoints.has(key))return ridgePoints.get(key);const base=ground(x,z),d=-f.distance(x,z),wet=f.overworld?(base<0||hydroSample38(x,z).wet):waterGround(x,z);let rise=0;
  if(!wet&&d>0&&d<22&&(rocky||f.overworld&&base>20)){
   const dx=f.distance(x+.4,z)-f.distance(x-.4,z),dz=f.distance(x,z+.4)-f.distance(x,z-.4),l=Math.hypot(dx,dz)||1,front=f.overworld?0:smooth(-.2,.7,-dz/l),wave=(Math.sin(x*.083+Math.cos(z*.059)*1.7)+Math.cos(z*.071-x*.024)+2)/4;
   const peak=mix(7+wave*6,2.6+wave*1.6,front),shape=smooth(.2,8.5,d)*(1-smooth(12,21.5,d));rise=peak*shape*(f.overworld?smooth(20,27,base):1);
  }
  const value={p:[x,base+rise-.14,z],rise};ridgePoints.set(key,value);return value;
 };
 for(let z=Math.floor((z0-24)/step)*step;z<z1+24;z+=step)for(let x=Math.floor((x0-24)/step)*step;x<x1+24;x+=step){const a=ridgePoint(x,z),b=ridgePoint(x+step,z),c=ridgePoint(x+step,z+step),d=ridgePoint(x,z+step);if(Math.max(a.rise,b.rise,c.rise,d.rise)<.08)continue;tri(a.p,b.p,d.p);tri(b.p,c.p,d.p);}
 const woodland=boundaryWoodland47(f,ground,theme,trees,rng);
 if(positions.length){
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));const moss=[];for(let i=0;i<positions.length;i+=3)moss.push(theme==='cave'?0:1-smooth(.25,4.5,positions[i+1]-ground(positions[i],positions[i+2])));g.setAttribute('edgeMoss47',new THREE.Float32BufferAttribute(moss,1));g.computeVertexNormals();
  const m=stoneSurface38('#b3bcaa'),before=m.onBeforeCompile,program=m.customProgramCacheKey();m.side=THREE.DoubleSide;
  m.onBeforeCompile=sh=>{before(sh);sh.uniforms.edgeGrass47={value:textures.grass};sh.uniforms.edgeWinter47={value:theme==='mountain'?1:0};sh.vertexShader='attribute float edgeMoss47;varying float moss47;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nmoss47=edgeMoss47;');sh.fragmentShader='varying float moss47;uniform sampler2D edgeGrass47;uniform float edgeWinter47;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('diffuseColor.rgb*=tx38*weights38.x+ty38*weights38.y+tz38*weights38.z;','vec3 stone47=tx38*weights38.x+ty38*weights38.y+tz38*weights38.z;vec3 turf47=texture2D(edgeGrass47,stoneWorld38.xz*.11).rgb;turf47=mix(turf47,vec3(.75,.83,.86)*(.92+.08*turf47.r),edgeWinter47);diffuseColor.rgb*=mix(stone47,turf47,clamp(moss47,0.,1.)*.9);');};m.customProgramCacheKey=()=>program+'-woodland-moss47';
  const mesh=new THREE.Mesh(g,m);mesh.userData.barrier46=true;mesh.userData.naturalRidge47=true;mesh.castShadow=mesh.receiveShadow=true;mesh.layers.enable(1);world.add(mesh);
 }
 // Chunking keeps shadows and camera cutaways local even on a long continent.
 const buckets=new Map();for(const t of trees){const k=Math.floor(t.x/96)+','+Math.floor(t.z/96);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(t);}
 for(const bucket of buckets.values())for(const trunk of[true,false]){const entries=bucket.flatMap(t=>(trunk?t.trunks:t.crowns).map(matrix=>({t,matrix}))),n=entries.length,g=(trunk?forestGeometry('trunk').clone():sprayGeometry30(16).clone()),mask=new THREE.InstancedBufferAttribute(new Float32Array(n),1);
  g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(n).fill(trunk?1:0),1));g.setAttribute('treeSpecies30',new THREE.InstancedBufferAttribute(Float32Array.from(entries,e=>e.t.species30),1));g.setAttribute('treeViewHidden',mask);
  const mesh=new THREE.InstancedMesh(g,forestMaterial30(trunk),n);mesh.customDepthMaterial=forestDepth30();mesh.userData={barrier46:true,boundaryForest50:true,treeViewMask:mask};mesh.castShadow=mesh.receiveShadow=true;mesh.layers.enable(1);entries.forEach((e,i)=>{mesh.setMatrixAt(i,e.matrix);const v=Math.sin(e.t.x*31+e.t.z*17)*.5+.5,c=new THREE.Color(trunk?'#c7b394':'#ffffff');if(!trunk)c.setRGB(.84+v*.16,.88+v*.12,.76+v*.20);mesh.setColorAt(i,c);e.t.bindings.push({mesh,index:i,matrix:e.matrix});});mesh.onBeforeRender=(r,s,c)=>{forest30.main.value=c===camera?1:0;};mesh.computeBoundingSphere();world.add(mesh);
 }
 scenery.trees.push(...trees);const cuts=world.userData.clarity23;if(cuts){for(const t of trees){const key=Math.floor(t.x/32)+','+Math.floor(t.z/32);if(!cuts.treeGrid.has(key))cuts.treeGrid.set(key,[]);cuts.treeGrid.get(key).push(t);}cuts.nearKey33=null;cuts.nearKey='';}treeCutCache30=null;world.userData.navCache?.clear();let hash47=2166136261;for(const t of trees)for(const v of[t.x,t.z,t.h,t.species30])hash47=Math.imul(hash47^Math.round(v*1000),16777619)>>>0;f.woodlandHash47=hash47;f.segments=segments;f.treeCount=trees.length;f.visualSegments=positions.length/36;
 world.userData.boundaryTrees50=trees;world.userData.authoredLayout46={theme:theme??'continent valleys',rooms:JRPG_LAYOUTS46[activeScene.key]?.courts.length??Object.keys(POIS).length,barrierTrees:trees.length,barrierSegments:segments.length,naturalWoodland:true,denseInteriors50:true,understory:woodland.brushes};
 }finally{buildingBoundary46=false;}
}
const boundaryNatureBefore46=buildMacroNature15;
buildMacroNature15=function(...args){const result=boundaryNatureBefore46(...args);buildBoundary46();return result;};
const boundaryBuildBefore46=buildWorld;
buildWorld=function(...args){const result=boundaryBuildBefore46(...args);if(activeScene.kind==='poi'){buildBoundary46();prepareCutaways();}if(world.userData.boundary46?.sealed&&player&&world.userData.boundary46.distance(player.x,player.z)<actorRadius(player)){
 const f=world.userData.boundary46,options=f.shapes.flatMap(s=>{const dx=s.b[0]-s.a[0],dz=s.b[1]-s.a[1],t=clamp(((player.x-s.a[0])*dx+(player.z-s.a[1])*dz)/(dx*dx+dz*dz||1),0,1);return[{x:s.a[0]+dx*t,z:s.a[1]+dz*t}];}).sort((a,b)=>dist(a,player)-dist(b,player));const q=options.find(q=>staticFree(q.x,q.z,actorRadius(player)+.1));if(q){player.x=q.x;player.z=q.z;spawnPartyTrail([q.x,q.z]);for(const a of[player,...followers])updateActor(a,0);}}
 if(world.userData.boundary46){roadNavGraph=null;cacheMaterialKeys36(world);}return result;};
const boundaryCaptureBefore46=captureMacroMap17;
captureMacroMap17=function(...args){
 const existed=!!macroMap17.scene,result=boundaryCaptureBefore46(...args),s=macroMap17.scene;if(!s||existed)return result;
 if(world.userData.boundary46?.overworld)s.userData.woodlandHash47=world.userData.boundary46.woodlandHash47;
 // One crown per real tree keeps thick continental woods inexpensive in the
 // atlas. Roots, species and heights remain identical to the playable world.
 const forestIds=new Set(world.children.filter(m=>m.userData.boundaryForest50).map(m=>m.geometry.uuid)),rockIds=new Set(world.children.filter(m=>m.userData.barrier46&&!m.userData.boundaryForest50&&!m.userData.plantKey).map(m=>m.geometry.uuid));
 for(const m of [...macroMap17.near])if(forestIds.has(m.userData.mapSource17)){s.remove(m);macroMap17.near.splice(macroMap17.near.indexOf(m),1);}else if(rockIds.has(m.userData.mapSource17)){m.userData.atlasAlways36=true;if(!macroMap17.far.includes(m))macroMap17.far.push(m);}
 const trees=world.userData.boundaryTrees50??[],n=trees.length,dummy=new THREE.Object3D();
 for(const trunk of[false,true]){
  const g=trunk?new THREE.CylinderGeometry(.12,.22,1,5):shareGeometry36(sprayGeometry30(24));g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(n).fill(trunk?1:0),1));g.setAttribute('treeSpecies30',new THREE.InstancedBufferAttribute(Float32Array.from(trees,t=>t.species30),1));g.setAttribute('treeViewHidden',new THREE.InstancedBufferAttribute(new Float32Array(n),1));const material=forestMaterial30(trunk);mapFog17(material);const mesh=new THREE.InstancedMesh(g,material,n);
  trees.forEach((t,i)=>{dummy.position.set(t.x,t.y+t.h*(trunk?.36:.76),t.z);dummy.rotation.set(0,t.x*.17+t.z*.13,0);dummy.scale.set(trunk?t.scale*1.5:t.scale*3.7,t.h*(trunk?.72:.37),trunk?t.scale*1.5:t.scale*3.7);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);if(!trunk){const v=Math.sin(t.x*31+t.z*17)*.5+.5;mesh.setColorAt(i,new THREE.Color().setRGB(.84+v*.16,.88+v*.12,.76+v*.20));}});
  mesh.computeBoundingSphere();mesh.userData={sameTreePositions17:true,atlasAlways36:true,boundaryAtlas50:true};mesh.onBeforeRender=()=>{forest30.main.value=0;};s.add(mesh);macroMap17.far.push(mesh);
 }
 s.userData.boundaryTrees50=n;return result;
};
