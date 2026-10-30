// Foreground and distance share the very same authored materials and meshes.
// The continuation starts at the rendered terrain edge, never the POI box.
let landscapeBounds26=null;
function terrainBounds26(){const b=new THREE.Box3();for(const o of world.userData.terrainChunks??[])b.union(new THREE.Box3().setFromObject(o));return[b.min.x,b.max.x,b.min.z,b.max.z];}
function copyLandscapeMaterial26(source){const m=source.clone();m.onBeforeCompile=source.onBeforeCompile;m.customProgramCacheKey=source.customProgramCacheKey.bind(source);return m;}
const horizonGroundBefore26=beyondGround26;
beyondGround26=function(x,z){
 const b=landscapeBounds26??activeScene.bounds,ex=clamp(x,b[0],b[1]),ez=clamp(z,b[2],b[3]),d=Math.hypot(x-ex,z-ez),edge=groundAt(ex,ez);
 if(d<.001)return edge;
 const n=distantNoise26(x*.006,z*.006)*.7+distantNoise26(x*.014+12,z*.014)*.3;
 let y=mix(edge,2+n*25,smooth(0,240,d));
 if(activeScene.key==='brookstead'&&z<30){const bank=Math.abs(x-brookChannel(z))-brookWidth(z);y=mix(3.15,y,smooth(1.1,13,bank));}
 if(activeScene.key==='harbor'&&x>349)y=mix(y,-7,smooth(349,400,x));return y;
};
function landscapeGround26(x,z){const b=landscapeBounds26;return b&&x>=b[0]&&x<=b[1]&&z>=b[2]&&z<=b[3]?groundAt(x,z):beyondGround26(x,z);}
function landscapeAttributes26(g){roadAttributes17(g);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),r=roadInfo(x,z);g.attributes.pathMix.setX(i,1-smooth(r.kind==='trail'?1.6:2.7,r.kind==='trail'?2.8:4.1,r.d));g.attributes.townMix.setX(i,r.kind==='trail'?0:1);g.attributes.riverMix.setX(i,1-smooth(-1,2.2,channelDistance(x,z)));g.attributes.snowMix.setX(i,winterAt(x,z));}return g;}
backdropGround26=function(apron,x,z,ray){return landscapeGround26(x,z);};
buildLandscapeApron26=function(group){
 landscapeBounds26=terrainBounds26();const b=landscapeBounds26;
 for(const o of world.userData.apron18?.meshes??[]){o.removeFromParent();o.geometry.dispose();}world.userData.apron18=null;
 // Detailed ground continues outside the active district. Its vertex fields
 // and shader are identical, including rock on slopes and wet earth.
 const source=world.userData.terrainChunks[0],material=source.material;
 for(const o of world.userData.terrainChunks){const old=o.geometry;if(old.attributes.position.count>300)continue;const box=new THREE.Box3().setFromBufferAttribute(old.attributes.position),g=new THREE.PlaneGeometry(box.max.x-box.min.x,box.max.z-box.min.z,(activeScene.key==='brookstead'&&box.min.x< -100&&box.max.x> -205&&box.min.z<30)?42:24,(activeScene.key==='brookstead'&&box.min.x< -100&&box.max.x> -205&&box.min.z<30)?42:24);g.rotateX(-Math.PI/2);g.translate((box.min.x+box.max.x)/2,0,(box.min.z+box.max.z)/2);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,groundAt(p.getX(i),p.getZ(i)));landscapeAttributes26(g);g.computeVertexNormals();const obsolete=new Set([old,o.userData.fullGeometry,o.userData.farGeometry,o.userData.simpleGeometry].filter(Boolean));o.geometry=g;for(const key of ['fullGeometry','farGeometry','simpleGeometry'])o.userData[key]=g;world.userData.landscapeOwnedGeometry26??=[];world.userData.landscapeOwnedGeometry26.push(g);for(const prior of obsolete)prior.dispose();}
 const depths=[0,8,18,30,45,65,90,120,155,195,240,290,350,420,510,620,760,930,1140],n=384,pos=[],uv=[],idx=[];
 const point=(i,d)=>{const side=Math.floor(i/n),t=(i%n)/n,l=b[0]-d,r=b[1]+d,a=b[2]-d,c=b[3]+d;return side===0?[mix(l,r,t),a]:side===1?[r,mix(a,c,t)]:side===2?[mix(r,l,t),c]:[l,mix(c,a,t)];};
 for(let j=0;j<depths.length;j++)for(let i=0;i<n*4;i++){const[x,z]=point(i,depths[j]);pos.push(x,beyondGround26(x,z)-.025,z);uv.push(x*.09375,z*.09375);if(j<depths.length-1){const a=j*n*4+i,c=a+n*4,b=j*n*4+(i+1)%(n*4),d=b+n*4;idx.push(a,b,c,b,d,c);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);landscapeAttributes26(g);g.computeVertexNormals();
 // Background roads are authored only where a real road continues past the
 // level. No unrelated settlement's old road grid bleeds into these hills.
 const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),near=Math.min(Math.abs(x-b[0]),Math.abs(x-b[1]),Math.abs(z-b[2]),Math.abs(z-b[3]));g.attributes.pathMix.setX(i,g.attributes.pathMix.getX(i)*(1-smooth(12,45,near)));}
 const o=new THREE.Mesh(g,material);o.receiveShadow=true;o.userData.terrain=true;o.userData.continuousApron26=true;o.frustumCulled=false;group.add(o);
 if(activeScene.key==='brookstead'){
  const pool=world.userData.waterPools.find(p=>p.userData.waterRole==='reservoir'),r=brookRibbon(-1500,30,brookChannel,z=>brookWidth(z)+1.05);r.setAttribute('waterDepth18',new THREE.Float32BufferAttribute(new Float32Array(r.attributes.position.count).fill(3),1));
  const stream=new THREE.Mesh(r,pool.material);stream.position.y=brookHydraulics.head.value;stream.userData.waterRole='upstream26';stream.userData.dynamicFX=true;stream.frustumCulled=false;group.add(stream);world.userData.upstream26=stream;
 }
};
function sameForest26(entries,kind,parent){
 if(!entries.length)return;const source=scenery.forestMeshes.find(o=>o.material.userData.textureArray)??scenery.forestMeshes[0];if(!source)return;
 const g=forestGeometry(kind).clone();g.setAttribute('treeKind',new THREE.InstancedBufferAttribute(new Float32Array(entries.length).fill(kind==='trunk'?1:kind==='pine'?2:0),1));
 const m=copyLandscapeMaterial26(source.material),o=new THREE.InstancedMesh(g,m,entries.length);entries.forEach((p,i)=>{o.setMatrixAt(i,p);o.setColorAt(i,new THREE.Color(kind==='trunk'?'#a59b86':kind==='pine'?'#aec6b5':'#e0edcd'));});o.receiveShadow=true;o.castShadow=false;o.computeBoundingSphere();o.userData.distantScenery26=true;o.userData.foregroundForest26=true;parent.add(o);
}
dressDistantLandscape26=function(){
 if(activeScene.kind==='interior')return;const q=world.userData.landscape26;if(!q)return;const group=q.group,b=activeScene.bounds,rng=seeded(261030+[...activeScene.key].reduce((a,c)=>a+c.charCodeAt(0),0)),macro=activeScene.kind==='overworld';
 const trees={oak:[],pine:[],trunk:[]},sites=[],sources=(world.userData.buildings??[]).filter(g=>g.userData.brookHouse&&g.userData.kind==='home'),plots=[];
 // Reuse complete foreground houses, windows, trusses and tiled roof meshes.
 for(let i=0;i<900&&plots.length<(sources.length?12:0);i++){
  const side=i%4,t=rng(),d=20+rng()*190,x=side===0?mix(b[0],b[1],t):side===1?b[1]+d:side===2?mix(b[1],b[0],t):b[0]-d,z=side===0?b[2]-d:side===1?mix(b[2],b[3],t):side===2?b[3]+d:mix(b[3],b[2],t);
  if(roadDistance(x,z)<10||plots.some(p=>Math.hypot(p.x-x,p.z-z)<28)||activeScene.key==='brookstead'&&Math.abs(x-brookChannel(z))<20)continue;
  const ys=[[-5,-4],[-5,4],[5,-4],[5,4],[0,0]].map(([dx,dz])=>landscapeGround26(x+dx,z+dz));if(Math.min(...ys)<0||Math.max(...ys)-Math.min(...ys)>.85)continue;
  const original=sources[plots.length%sources.length],g=original.clone(true),y=Math.min(...ys)-.08;g.position.set(x,y,z);g.userData={distantScenery26:true,foregroundHouse26:true};
  g.traverse(o=>{o.matrixAutoUpdate=true;o.matrixWorldAutoUpdate=true;o.userData={distantScenery26:true};if(o.isMesh){o.onBeforeRender=()=>{};o.onAfterRender=()=>{};o.geometry.drawRange.count=Infinity;o.castShadow=false;o.receiveShadow=true;}});group.add(g);plots.push({x,y,z,source:original.position.toArray()});
 }
 const count=macro?0:state.settings.quality==='low'?380:900;
 for(let i=0;i<count*4&&sites.length<count;i++){
  const side=i%4,t=rng(),d=5+Math.pow(rng(),1.7)*260,x=side===0?mix(b[0],b[1],t):side===1?b[1]+d:side===2?mix(b[1],b[0],t):b[0]-d,z=side===0?b[2]-d:side===1?mix(b[2],b[3],t):side===2?b[3]+d:mix(b[3],b[2],t);
  if(plots.some(p=>Math.hypot(x-p.x,z-p.z)<13)||roadDistance(x,z)<5||activeScene.key==='brookstead'&&Math.abs(x-brookChannel(z))<13||activeScene.key==='harbor'&&x>349||sites.some(p=>Math.hypot(x-p.x,z-p.z)<4))continue;
  const y=landscapeGround26(x,z);if(y<-.4)continue;const source=scenery.trees[Math.floor(rng()*scenery.trees.length)];if(!source)continue;const offset=new THREE.Matrix4().makeTranslation(x-source.x,y-source.y,z-source.z);
  for(const m of source.trunks)trees.trunk.push(offset.clone().multiply(m));for(const m of source.crowns)trees[source.pine?'pine':'oak'].push(offset.clone().multiply(m));sites.push({x,y,z});
 }
 for(const[k,list]of Object.entries(trees)){const buckets=new Map();for(const m of list){const p=V3().setFromMatrixPosition(m),key=Math.floor(p.x/64)+','+Math.floor(p.z/64);if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(m);}for(const entries of buckets.values())sameForest26(entries,k,group);}
 // Actual foreground flowers and grass continue through the distant ground.
 for(const kind of['grassBlades','flowers','fern']){const source=(world.userData.plantMeshes??[]).find(o=>o.userData.plantKey===kind);if(!source)continue;const matrices=[],dummy=new THREE.Object3D();for(let i=0;i<(kind==='grassBlades'?4400:kind==='flowers'?700:350);i++){const side=i%4,t=rng(),d=3+rng()*145,x=side===0?mix(b[0],b[1],t):side===1?b[1]+d:side===2?mix(b[1],b[0],t):b[0]-d,z=side===0?b[2]-d:side===1?mix(b[2],b[3],t):side===2?b[3]+d:mix(b[3],b[2],t),y=landscapeGround26(x,z);if(y<0||roadDistance(x,z)<3.5||plots.some(p=>Math.hypot(x-p.x,z-p.z)<10)||activeScene.key==='brookstead'&&Math.abs(x-brookChannel(z))<7)continue;const s=.45+rng()*.6;dummy.position.set(x,y+s*.44,z);dummy.rotation.y=rng()*TAU;dummy.scale.setScalar(s);dummy.updateMatrix();matrices.push(dummy.matrix.clone());}const m=copyLandscapeMaterial26(source.material),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);if(sh.uniforms.plantRange)sh.uniforms.plantRange={value:new THREE.Vector2(1500,1700)};};m.customProgramCacheKey=()=>key+'-continuous26';const o=new THREE.InstancedMesh(plantGeometry(kind),m,matrices.length);matrices.forEach((a,i)=>o.setMatrixAt(i,a));o.receiveShadow=true;o.castShadow=false;o.computeBoundingSphere();o.userData.distantScenery26=true;group.add(o);}
 q.plots=plots;q.trees=sites.length;q.decorated=true;q.foregroundMatched=true;q.material=world.userData.terrainChunks[0].material.uuid;q.bounds=landscapeBounds26;q.forestParts=Object.fromEntries(Object.entries(trees).map(([k,v])=>[k,v.length]));
 if(macro)buildOverworldForestLod26();group.updateMatrixWorld(true);group.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});
};

// Instance buffers and replaced LOD meshes are owned by this scene. They must
// be released even if a later visibility pass selects a different LOD.
const landscapeDisposeBefore26=disposeContinuousWorld;
disposeContinuousWorld=function(){if(world){for(const g of world.userData.landscapeOwnedGeometry26??[])g.dispose();world.traverse(o=>{if(o.isInstancedMesh)o.dispose();});}return landscapeDisposeBefore26();};
