// RE-011: geology, connected tree growth and one light-responsive water family.
// All variation is seeded in world space. Geometry is built behind the loader;
// animation changes uniforms only, never geometry, materials or shader recipes.
const environment62={version:62,rockNames:['split boulder','tilted slab','weathered pillar','scree block','stratified ledge','angular crag','river stone','broken shelf','leaning spire','low outcrop','granite shoulder','chipped monolith'],rockMaterials:new Map(),materialWorld:null};
function rockGeometry62(kind){
 const key='geology62-'+kind;if(sharedGeo[key])return sharedGeo[key];
 const rng=seeded(62031+kind*379),n=9+(kind%3),rings=6,p=[],uv=[],indices=[],profile=[.74,1,.94,.83,.64,.24];
 const forms=[[1.1,1,1],[1.4,.42,.88],[.62,1.9,.73],[.9,.68,1.15],[1.4,.69,.83],[.94,1.3,.86],[1.05,.5,.82],[1.18,.55,1],[.56,2.1,.67],[1.4,.68,1.1],[1.1,.95,.85],[.76,1.5,.94]],form=forms[kind];
 const radial=Array.from({length:n},()=>.78+rng()*.35),phase=rng()*TAU,lean=(rng()-.5)*.42;
 for(let row=0;row<rings;row++)for(let j=0;j<=n;j++){
  const k=j%n,a=phase+k*TAU/n,t=row/(rings-1),ledge=kind===4||kind===7?1+((row%2)*2-1)*.13:1;
  let r=radial[k]*profile[row]*ledge*(1+.075*Math.sin(k*2.1+row*1.7+kind)),y=t*1.65-.22;
  if(row>0)y+=(.10*Math.sin(k*1.7+kind)+.045*Math.cos(row*2+k))*Math.sin(t*Math.PI*.6);
  if(kind===0&&row>2&&j%3===0)r*=.65;
  p.push((Math.cos(a)*r+lean*t)*form[0],y*form[1],(Math.sin(a)*r+.09*Math.sin(t*4+kind))*form[2]);uv.push(j/n,t);
  if(row&&j){const q=row*(n+1)+j;indices.push(q-n-2,q-1,q-n-1,q-n-1,q-1,q);}
 }
 const top=p.length/3;p.push(lean*form[0],1.47*form[1],.09*Math.sin(4+kind)*form[2]);uv.push(.5,1);
 for(let j=0;j<n;j++)indices.push((rings-1)*(n+1)+j,top,(rings-1)*(n+1)+j+1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData.geology62=kind;sharedGeo[key]=g;return g;
}
function rockMaterial62(biome=0){
 if(environment62.materialWorld!==world){environment62.rockMaterials.clear();environment62.materialWorld=world;}
 const kind=biome>.5?Math.min(3,Math.floor(biome)):0;if(environment62.rockMaterials.has(kind))return environment62.rockMaterials.get(kind);
 const m=new THREE.MeshStandardMaterial({map:textures.env62_stone??textures.stage59_stone??textures.rock,color:['#c7cec0','#d9e0dd','#c1b29a','#807c73'][kind],roughness:.93});m.userData.geology62=true;
 addCloudLighting(m);const before=m.onBeforeCompile;
 m.onBeforeCompile=sh=>{before(sh);sh.vertexShader='varying vec3 stoneWorld62,stoneNormal62;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvec4 stoneP62=vec4(transformed,1.);vec3 stoneN62=objectNormal;\n#ifdef USE_INSTANCING\nstoneP62=instanceMatrix*stoneP62;stoneN62=mat3(instanceMatrix)*stoneN62;\n#endif\nstoneWorld62=(modelMatrix*stoneP62).xyz;stoneNormal62=normalize(mat3(modelMatrix)*stoneN62);');
  sh.fragmentShader='varying vec3 stoneWorld62,stoneNormal62;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`vec3 blend62=pow(abs(normalize(stoneNormal62)),vec3(5.));blend62/=max(.001,blend62.x+blend62.y+blend62.z);
   vec3 grain62=texture2D(map,stoneWorld62.zy*.25).rgb*blend62.x+texture2D(map,stoneWorld62.xz*.25).rgb*blend62.y+texture2D(map,stoneWorld62.xy*.25).rgb*blend62.z;
   float strata62=.97+.03*sin(stoneWorld62.y*9.+sin(stoneWorld62.x*1.1+stoneWorld62.z*.8));
   float moss62=smoothstep(.28,.8,stoneNormal62.y)*smoothstep(.45,.75,sin(stoneWorld62.x*.83+sin(stoneWorld62.z*.71))*.5+.5);
   diffuseColor.rgb*=mix(grain62*strata62,grain62*vec3(.66,.82,.51),moss62*.27);`);};m.customProgramCacheKey=()=> 'elyndor-geology62-'+kind;environment62.rockMaterials.set(kind,m);return m;
}
function rockHabitat62(x,z){
 const macro=activeScene?.kind==='overworld',h=macro?macroGround(x,z):groundAt(x,z),sample=macro?macroGround:groundAt;
 const slope=Math.max(Math.abs(sample(x+2,z)-sample(x-2,z)),Math.abs(sample(x,z+2)-sample(x,z-2)))/4,road=macro?macroRoadInfo15(x,z).d:roadDistance(x,z),shore=macro?traversalShoreDistance(x,z):Math.abs(channelDistance(x,z));
 return{slope,road,shore,reason:shore<5?'water edge':slope>.3?'slope talus':road<12?'road cutting':h>18?'exposed ridge':'woodland outcrop'};
}
const environmentMeshBefore62=mesh;
mesh=function(geometry,mat,x,y,z,parent=world){
 const bank=geometry===sharedGeo.brookBankRock,natural=bank||geometry===sharedGeo.rock;
 if(!natural)return environmentMeshBefore62(geometry,mat,x,y,z,parent);
 const habitat=rockHabitat62(x,z),hash=Math.abs(Math.floor(x*713+z*391)),kind=bank?[6,0,3,5,1,7][hash%6]:hash%12;
 const o=environmentMeshBefore62(rockGeometry62(kind),rockMaterial62(activeScene?.key==='snow'?1:0),x,y,z,parent);o.userData={...o.userData,naturalRock:true,bankRock:bank,geology62:kind,habitat62:habitat.reason};return o;
};
// Concept outcrops and perimeter rocks use the same silhouettes as small stones.
boulder38=function(x,z,scale=1,color='#a6b0a1',parent=world){
 const rng=seeded(Math.floor(x*91+z*37)),kind=Math.floor(rng()*12),o=new THREE.Mesh(rockGeometry62(kind),rockMaterial62(activeScene?.key==='snow'?1:0));o.position.set(x,groundAt(x,z)+scale*.11,z);o.scale.set(scale*(.85+rng()*.35),scale*(.8+rng()*.3),scale*(.8+rng()*.35));o.rotation.set((rng()-.5)*.15,rng()*TAU,(rng()-.5)*.12);o.castShadow=o.receiveShadow=true;o.userData.geology62=kind;parent.add(o);return o;
};
const environmentalBatchBefore62=batchLandscape;
batchLandscape=function(...args){
 if(!world.userData.geologyComposition62&&activeScene?.kind==='poi'){
  const records=[],anchors=[],parts=[];world.updateMatrixWorld(true);world.traverse(o=>{if(o.userData.naturalRock&&o.parent===world)anchors.push(o);});
  const approaches=(world.userData.buildings??[]).filter(g=>g.userData.door).map(g=>{const d=g.userData.door,v=d.clone().sub(g.position);v.y=0;v.normalize();return[[d.x,d.z],[d.x+v.x*5,d.z+v.z*5]];});
  for(const o of anchors){let{x,z}=o.position;let h=rockHabitat62(x,z);const rng=seeded(Math.round(x*137+z*977)),size=Math.max(o.scale.x,o.scale.z),oldX=x,oldZ=z;
   // Open flat lawns get gaps; rock-bearing banks, cuttings and slopes get talus.
   if(!o.userData.bankRock&&h.slope<.14&&h.road>13&&h.shore>7&&rng()<.8){o.removeFromParent();colliders=colliders.filter(c=>!['rock','boulder'].includes(c.type)||Math.hypot(c.x-x,c.z-z)>.2);continue;}
   // Loose slabs belong at the foot of a cutting, never dotted up its face.
   if(h.slope>.65)for(let j=0;j<15;j++){const dx=groundAt(x+.5,z)-groundAt(x-.5,z),dz=groundAt(x,z+.5)-groundAt(x,z-.5),d=Math.hypot(dx,dz);if(d<.1)break;const xx=x-dx/d*.85,zz=z-dz/d*.85;if(!inSceneBounds(xx,zz,0)||roadDistance(xx,zz)<size+3.2)break;x=xx;z=zz;h=rockHabitat62(x,z);if(h.slope<.42)break;}
   const radius=Math.max(.35,size*.85),blocked=h.slope>.8||h.road<radius+2.8||records.some(q=>Math.hypot(q.x-x,q.z-z)<Math.max(.5,size*.65))||approaches.some(p=>segmentDistance(x,z,...p)<radius+1.1);
   if(blocked){o.removeFromParent();colliders=colliders.filter(c=>!['rock','boulder'].includes(c.type)||Math.hypot(c.x-oldX,c.z-oldZ)>.2);continue;}
   o.position.x=x;o.position.z=z;o.rotation.x=clamp(o.rotation.x,-.12,.16);o.rotation.z=clamp(o.rotation.z,-.13,.13);o.position.y=groundAt(x,z)+o.scale.y*.1;
   for(const c of colliders)if(['rock','boulder'].includes(c.type)&&Math.hypot(c.x-oldX,c.z-oldZ)<.2){c.x=x;c.z=z;c.w=radius*.72;c.d=radius*.72;}
   records.push({x,z,kind:o.userData.geology62,reason:h.reason});parts.push(o);
   if(size<.65)continue;
   const a=Math.atan2(groundAt(x,z+1)-groundAt(x,z-1),groundAt(x+1,z)-groundAt(x-1,z))+Math.PI;
   for(let k=0;k<2+Math.floor(rng()*3);k++){const angle=a+(rng()-.5)*3.3,reach=size*(.8+rng()*.9),xx=x+Math.cos(angle)*reach,zz=z+Math.sin(angle)*reach,s=size*(.12+rng()*.21);
    if(!inSceneBounds(xx,zz,0)||rockHabitat62(xx,zz).slope>.65||roadDistance(xx,zz)<s+3.2||!staticFree(xx,zz,s*.7)||interactables.some(q=>Math.hypot(q.x-xx,q.z-zz)<s+2))continue;
    const part=new THREE.Mesh(rockGeometry62([1,3,6,7][k%4]),o.material);part.position.set(xx,groundAt(xx,zz)+s*.12,zz);part.scale.set(s,s*(.7+rng()*.4),s);part.rotation.y=rng()*TAU;part.castShadow=part.receiveShadow=true;part.userData.debris62=true;parts.push(part);
   }
  }
  // Own these small batches so foundations can be seated again after the final
  // terrain grading pass, instead of baking stale heights into masonry chunks.
  const buckets=new Map();for(const part of parts){const kind=part.geometry.userData.geology62;if(!buckets.has(kind))buckets.set(kind,[]);buckets.get(kind).push(part);part.removeFromParent();}
  world.userData.localRocks62=[];for(const[kind,list]of buckets){const mesh=new THREE.InstancedMesh(rockGeometry62(kind),list[0].material,list.length);mesh.userData.localGeology62=true;mesh.castShadow=mesh.receiveShadow=true;list.forEach((o,i)=>{o.updateMatrix();mesh.setMatrixAt(i,o.matrix);world.userData.localRocks62.push({mesh,index:i,x:o.position.x,z:o.position.z,rotation:o.quaternion.clone(),scale:o.scale.clone(),kind});});mesh.computeBoundingSphere();world.add(mesh);}
  world.userData.geologyComposition62={anchors:records,variants:12,source:'bank erosion, slope talus, exposed rock and road cuttings'};rebuildColliderGrid();
 }
 return environmentalBatchBefore62(...args);
};
// Clustered geology replaces the old independent 48,000-sample scatter pass.
geologicalDressing16=function(parent,atlas=false){
 const rng=seeded(621649),buckets=new Map(),record=[],matrix=new THREE.Object3D();
 for(let i=0;i<15000;i++){
  const x=mix(LAND.minX+14,LAND.maxX-14,rng()),z=mix(LAND.minZ+14,LAND.maxZ-14,rng()),h=macroGround(x,z),habitat=rockHabitat62(x,z),biome=macroBiome15(x,z);
  if(h<.25||traversalWet(x,z)||Object.values(POIS).some(p=>Math.hypot(x-p.node[0],z-p.node[1])<(p.kind==='town'?45:31)))continue;
  const bank=habitat.shore<5,cut=habitat.road>7&&habitat.road<12,slope=habitat.slope>.42;
  if(!bank&&!cut&&!slope||habitat.road<7||rng()>(slope?.16:bank?.12:.045))continue;
  const size=(slope?1.6:1)+rng()*(slope?2.3:1.1),radius=size*1.6;
  if(habitat.road<radius+4.6||spans38.some(b=>{const q=bridgeLocal15(b,x,z);return Math.abs(q.u)<b.length/2+(b.approach38??14)+radius&&Math.abs(q.v)<b.width/2+radius+1;}))continue;
  const angle=Math.atan2(macroGround(x,z+2)-macroGround(x,z-2),macroGround(x+2,z)-macroGround(x-2,z))+Math.PI;
  for(let k=0;k<3+Math.floor(rng()*3);k++){
   const s=k?size*(.14+rng()*.34):size,a=angle+(rng()-.5)*2.8,r=k?size*(.7+rng()*1.2):0,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r;
   if(traversalWet(xx,zz)||macroRoadInfo15(xx,zz).d<s+4.5)continue;
   const kind=k?[1,3,6,7][Math.floor(rng()*4)]:(bank?[3,4,6,7][i%4]:i%12),palette=biome<.5?0:biome<1.5?1:biome<3.5?2:3,key=Math.floor(xx/128)+','+Math.floor(zz/128)+','+kind+','+palette;
   if(!buckets.has(key))buckets.set(key,{kind,palette,list:[]});matrix.position.set(xx,(atlas?atlasHeight(xx,zz):macroGround(xx,zz))+s*.10,zz);matrix.rotation.set((rng()-.5)*.12,rng()*TAU,(rng()-.5)*.12);matrix.scale.set(s,s*(.7+rng()*.45),s*(.8+rng()*.3));matrix.updateMatrix();buckets.get(key).list.push(matrix.matrix.clone());
   if(k===0){record.push({x:xx,z:zz,kind,reason:habitat.reason});if(!atlas&&parent===world&&s>2)obstacle(xx,zz,s*1.65,s*1.65,'weathered crag');}
  }
 }
 for(const{kind,palette,list}of buckets.values()){const m=rockMaterial62(palette);const o=new THREE.InstancedMesh(rockGeometry62(kind),m,list.length);list.forEach((q,i)=>o.setMatrixAt(i,q));o.castShadow=!atlas;o.receiveShadow=true;o.computeBoundingSphere();o.userData={geology16:true,geology62:kind};parent.add(o);}
 parent.userData.geologyComposition62={anchors:record,variants:12,batches:buckets.size,source:'slope talus, river erosion and roadside cuttings'};
};
// Connected scaffold -> fork -> twig -> leaf mass. Keep the existing birches,
// conifers, species art, world positions and collision footprints intact.
function growTree62(t){
 if(!t||[1,4].includes(t.species30))return t;const rng=seeded(Math.round(t.x*113.7+t.z*287.3+62077)),s=t.scale,h=t.h,x=t.x,z=t.z,y=t.y,turn=rng()*TAU,lean=(rng()-.5)*.45*s;
 t.trunks=[];t.crowns=[];const compose=(p,scale,q=new THREE.Quaternion())=>new THREE.Matrix4().compose(p,q,scale),joint=(a,b,r)=>{const d=b.clone().sub(a);t.trunks.push(compose(a.clone().add(b).multiplyScalar(.5),V3(r/.22,d.length(),r/.22),new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize())));};
 const root=V3(x,y-.06,z),fork=V3(x+lean*.35,y+h*.38,z+.08*s),leader=V3(x+lean,y+h*.78,z-.09*s);joint(root,fork,.22*s);joint(fork,leader,.135*s);
 // Small root flares disappear into the soil, rather than ending in a pole.
 for(let j=0;j<3;j++){const a=turn+j*TAU/3;joint(V3(x+Math.cos(a)*.33*s,y-.035,z+Math.sin(a)*.33*s),V3(x,y+h*.13,z),.085*s);}
 const willow=t.species30===3,branches=3;
 for(let j=0;j<branches;j++){
  const a=turn+j*2.399963+(rng()-.5)*.5,start=V3(x+lean*.35,y+h*(.37+j*.055),z),reach=(willow?1.35:1.1)*s*(.8+rng()*.4),elbow=V3(x+Math.cos(a)*reach*.62+lean*.7,y+h*(.62+rng()*.07),z+Math.sin(a)*reach*.62),end=V3(x+Math.cos(a)*reach+lean,y+h*(.78+rng()*.08),z+Math.sin(a)*reach);joint(start,elbow,.085*s);joint(elbow,end,.045*s);
  for(let k=0;k<2;k++){const b=a+(k?1:-1)*.48,tip=end.clone().add(V3(Math.cos(b)*.48*s,(k?.08:-.16)*s,Math.sin(b)*.48*s));joint(elbow,tip,.026*s);const width=(.96+rng()*.25)*s;t.crowns.push(compose(tip.clone().add(V3(0,.22*s,0)),V3(width,willow?1.3*s:(.85+rng()*.22)*s,width*(.86+rng()*.2)),new THREE.Quaternion().setFromEuler(new THREE.Euler((rng()-.5)*.3,b,(rng()-.5)*.22))));}
 }
 t.crowns.push(compose(leader.clone().add(V3(0,.25*s,0)),V3(1.15*s,1.1*s,1.05*s),new THREE.Quaternion().setFromAxisAngle(V3(0,1,0),turn)));
 t.cover30=t.crowns.map(m=>new THREE.Box3(V3(-1.3,-1.3,-1.3),V3(1.3,1.3,1.3)).applyMatrix4(m));t.box=new THREE.Box3(V3(x-.4*s,y,z-.4*s),V3(x+.4*s,y+h,z+.4*s));for(const b of t.cover30)t.box.union(b);t.connectedGrowth62=true;return t;
}
const growBefore62=buildSolidTree;buildSolidTree=function(...args){return growTree62(growBefore62(...args));};
const boundaryGrowBefore62=boundaryTree47;boundaryTree47=function(...args){const t=boundaryGrowBefore62(...args);if(![1,4].includes(t.species30))return growTree62(t);for(const m of t.trunks)m.scale(V3(2.95,1,2.95));return t;};
const barkBefore62=forestMaterial30;
forestMaterial30=function(trunk){const m=barkBefore62(trunk);if(!trunk)return m;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.uniforms.bark62={value:textures.env62_bark??textures.bark};sh.fragmentShader='uniform sampler2D bark62;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('texture2D(bark30,leafUV30*vec2(1.,3.))','(abs(species30-1.)<.1?texture2D(bark30,leafUV30*vec2(1.,3.)):texture2D(bark62,leafUV30*vec2(1.15,1.35)))');};m.customProgramCacheKey=()=>key+'-natural-bark62';return m;};

const waterLight62={day:{value:1},sun:{value:V3(-.4,1,.4)},key:{value:new THREE.Color('#fff1d3')},sky:{value:new THREE.Color('#b9dce6')},power:{value:1},cloud:{value:0}},waterUniforms62=new WeakMap();
function waterField62(){
 if(world.userData.waterField62)return world.userData.waterField62;
 const macro=activeScene.kind==='overworld',coast=macro?coastalBathymetry50():null,b=macro?coastalOcean50.bounds:[activeScene.bounds[0]-12,activeScene.bounds[2]-12,activeScene.bounds[1]-activeScene.bounds[0]+24,activeScene.bounds[3]-activeScene.bounds[2]+24],w=macro?coastalOcean50.width:Math.min(384,Math.max(96,Math.ceil(b[2]*1.6))),h=macro?coastalOcean50.height:Math.min(384,Math.max(96,Math.ceil(b[3]*1.6))),data=new Float32Array(w*h*4),near=new Map(),contacts=colliders.filter(c=>/canal|abutment|pier|dock|harbour|harbor|quay|retaining|boulder|weathered crag|terrace wall/.test(c.type));
 // Intersections with the real solid geometry catch hulls, dock posts and
 // retaining walls even when those decorations do not own colliders.
 if(!macro){const a=V3(),bb=V3(),c=V3();world.updateMatrixWorld(true);world.traverse(o=>{
  if(!o.isMesh||o.isInstancedMesh||!o.material?.userData.textureArray||o.userData.terrain)return;const box=new THREE.Box3().setFromObject(o);if(box.max.y< -1.6||box.min.y>7)return;
  const g=o.geometry,p=g.attributes.position,idx=g.index,count=idx?.count??p.count,level=z=>activeScene.key==='brookstead'?channelLevel18(z):water?.position.y??-1.4;
  for(let i=0;i<count;i+=3){a.fromBufferAttribute(p,idx?idx.getX(i):i).applyMatrix4(o.matrixWorld);bb.fromBufferAttribute(p,idx?idx.getX(i+1):i+1).applyMatrix4(o.matrixWorld);c.fromBufferAttribute(p,idx?idx.getX(i+2):i+2).applyMatrix4(o.matrixWorld);const hits=[];
   for(const[u,v]of[[a,bb],[bb,c],[c,a]]){const du=u.y-level(u.z),dv=v.y-level(v.z);if(du*dv>=0)continue;const t=du/(du-dv);hits.push([mix(u.x,v.x,t),mix(u.z,v.z,t)]);}
   if(hits.length!==2||Math.hypot(hits[0][0]-hits[1][0],hits[0][1]-hits[1][1])<.025)continue;const mid=[(hits[0][0]+hits[1][0])/2,(hits[0][1]+hits[1][1])/2];if(groundAt(...mid)>level(mid[1])+.4)continue;contacts.push({line:hits,x:mid[0],z:mid[1],w:Math.abs(hits[1][0]-hits[0][0])/2,d:Math.abs(hits[1][1]-hits[0][1])/2,type:'waterline contact'});
  }
 });}
 for(const c of contacts)for(let iz=Math.floor((c.z-c.d-3)/16);iz<=Math.floor((c.z+c.d+3)/16);iz++)for(let ix=Math.floor((c.x-c.w-3)/16);ix<=Math.floor((c.x+c.w+3)/16);ix++){const key=ix+','+iz;if(!near.has(key))near.set(key,[]);near.get(key).push(c);}
 for(let z=0;z<h;z++)for(let x=0;x<w;x++){
  const xx=b[0]+x/(w-1)*b[2],zz=b[1]+z/(h-1)*b[3],i=(z*w+x)*4;let bed=macro?coast.image.data[z*w+x]/255*192-32:groundAt(xx,zz),contact=50;
  if(macro&&xx>=LAND.minX&&xx<=LAND.maxX&&zz>=LAND.minZ&&zz<=LAND.maxZ)bed=macroGround(xx,zz);
  for(const c of near.get(Math.floor(xx/16)+','+Math.floor(zz/16))??[]){const dx=Math.abs(xx-c.x)-c.w,dz=Math.abs(zz-c.z)-c.d;contact=Math.min(contact,c.line?segmentDistance(xx,zz,...c.line):Math.hypot(Math.max(0,dx),Math.max(0,dz)));}
  data[i]=bed;data[i+1]=contact;data[i+2]=macro?traversalShoreDistance(xx,zz):50;data[i+3]=macro?(traversalWet(xx,zz)?traversalWaterHeight(xx,zz)+.035:-1.4):activeScene.key==='brookstead'?channelLevel18(zz):water?.position.y??-1.4;
 }
 const texture=new THREE.DataTexture(data,w,h,THREE.RGBAFormat,THREE.FloatType);texture.minFilter=texture.magFilter=THREE.LinearFilter;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;
 return world.userData.waterField62={texture,bounds:new THREE.Vector4(...b),size:[w,h],contacts:contacts.length};
}
const waterFunctions62=`
 uniform float time62,day62,keyPower62,cloud62,cascade62,hydraulic62,width62,hasDepth62,reflect62;
 uniform vec3 sun62,key62,sky62;uniform vec4 fieldBounds62;uniform sampler2D field62,waterArt62,mirror62,upperMirror62;
 uniform float cascadeZ62,cascadeSpan62;varying vec3 worldWater62;varying vec2 flow62;varying float depth62,across62;varying vec4 reflected62,upperReflected62;
 float hash62(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise62(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash62(i),hash62(i+vec2(1.,0.)),f.x),mix(hash62(i+vec2(0.,1.)),hash62(i+1.),f.x),f.y);}
 float mirrorCoverage62(vec4 p){vec2 q=p.xy/max(.001,p.w);return step(.001,p.w)*smoothstep(0.,.04,q.x)*smoothstep(0.,.04,q.y)*smoothstep(0.,.04,1.-q.x)*smoothstep(0.,.04,1.-q.y);}
 `;
function waterMaterial62(o,field,atlas=false){
 const old=o.material,r=old?.userData.riverReflection,fall=!!o.userData.waterfall,fresh=!!o.userData.freshwater38,g=o.geometry,n=g.attributes.position.count;
 if(!g.attributes.channelFlow39)g.setAttribute('channelFlow39',new THREE.Float32BufferAttribute(Float32Array.from({length:n*2},(_,i)=>i%2?1:0),2));
 if(!g.attributes.waterDepth18)g.setAttribute('waterDepth18',new THREE.Float32BufferAttribute(new Float32Array(n).fill(-1),1));
 if(!g.attributes.riverAcross)g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(new Float32Array(n),1));
 const hasDepth=activeScene.key==='harbor'&&o===water?0:old?.userData.water20||old?.userData.water18?1:0,m=new THREE.MeshStandardMaterial({color:'#ffffff',map:textures.riverSurface18??textures.waterAlbedo,roughness:.25,metalness:.025,transparent:!fresh,opacity:1,side:THREE.DoubleSide,depthWrite:true});
 // Reflection and sluice metadata are also consumed by the existing systems.
 m.userData={riverReflection:r,water62:true,waterFamily62:'Valenne',water18:!!r,water20:!!r,water28:!!r,flowSurface39:fresh};
 addCloudLighting(m);if(atlas)mapFog17(m);const before=m.onBeforeCompile;
 const uniforms={time62:windUniforms.time,day62:waterLight62.day,sun62:waterLight62.sun,key62:waterLight62.key,sky62:waterLight62.sky,keyPower62:waterLight62.power,cloud62:waterLight62.cloud,field62:{value:field.texture},fieldBounds62:{value:field.bounds},waterArt62:{value:textures.riverSurface18??textures.waterAlbedo},hasDepth62:{value:hasDepth},cascade62:{value:fall?1:0},hydraulic62:activeScene.key==='brookstead'?sluice18.flow:{value:.55},width62:o.userData.flowWidth17??{value:1},reflect62:{value:r&&!atlas?1:0},mirror62:{value:o.userData.poolTarget?.texture??r?.texture??reflectionTarget.texture},upperMirror62:{value:r?.upperTexture??reflectionTarget.texture},reflectionMatrix62:{value:r?.matrix??new THREE.Matrix4()},upperMatrix62:{value:r?.upperMatrix??new THREE.Matrix4()},cascadeZ62:{value:o.userData.join?.z??0},cascadeSpan62:{value:o.userData.join?.halfSpan??.8}};
 waterUniforms62.set(m,uniforms);
 m.onBeforeCompile=sh=>{before(sh);Object.assign(sh.uniforms,uniforms);sh.vertexShader='attribute float waterDepth18,riverAcross;attribute vec2 channelFlow39;uniform mat4 reflectionMatrix62,upperMatrix62;varying vec3 worldWater62;varying vec2 flow62;varying float depth62,across62;varying vec4 reflected62,upperReflected62;\n'+sh.vertexShader;
  sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ndepth62=waterDepth18;across62=riverAcross;flow62=channelFlow39;');sh.vertexShader=sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nworldWater62=(modelMatrix*vec4(transformed,1.)).xyz;reflected62=reflectionMatrix62*vec4(worldWater62,1.);upperReflected62=upperMatrix62*vec4(worldWater62,1.);');
  sh.fragmentShader=waterFunctions62+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`
   vec2 fieldUV62=(worldWater62.xz-fieldBounds62.xy)/fieldBounds62.zw;vec4 bed62=texture2D(field62,clamp(fieldUV62,0.,1.));float fieldInside62=step(0.,fieldUV62.x)*step(0.,fieldUV62.y)*step(fieldUV62.x,1.)*step(fieldUV62.y,1.);bed62.r=mix(-32.,bed62.r,fieldInside62);bed62.g=mix(50.,bed62.g,fieldInside62);
   float waterDepth62=max(.0,worldWater62.y-bed62.r);if(hasDepth62>.5)waterDepth62=max(0.,depth62);
   if((hasDepth62>.5&&depth62<.006)||(hasDepth62<.5&&worldWater62.y<bed62.r-.03))discard;
   vec2 current62=normalize(flow62+vec2(.0001))*(.16+hydraulic62*.28);vec2 stream62=worldWater62.xz-current62*time62;
   vec2 q62=stream62*.23;float broad62=noise62(q62*.41),fine62=noise62(q62*2.2+vec2(.0,time62*.013));
   vec3 art62=mix(texture2D(waterArt62,q62*.36).rgb,texture2D(waterArt62,mat2(.8,-.6,.6,.8)*q62*.27+vec2(3.71,7.19)).rgb,.5);
   float grain62=dot(art62,vec3(.21,.56,.23));float shallow62=exp(-waterDepth62*.62);
   vec3 deep62=mix(vec3(.009,.035,.055),vec3(.009,.068,.115),day62);vec3 shoal62=mix(vec3(.02,.085,.075),vec3(.035,.21,.18),day62);
   vec3 body62=mix(deep62,shoal62,shallow62);body62*=.64+broad62*.65+grain62*.23;
   diffuseColor.rgb*=body62;float edge62=max(1.-smoothstep(.01,.34,waterDepth62),1.-smoothstep(.05,.68,bed62.g));
   float shoreBand62=(1.-smoothstep(.05,1.5,waterDepth62))*smoothstep(.0,.08,waterDepth62);
   float foamGrain62=noise62(stream62*2.8+vec2(0.,time62*.12));float foam62=edge62*smoothstep(.39,.72,foamGrain62)*.36+shoreBand62*smoothstep(.68,.86,foamGrain62)*.13;
   if(cascade62>.5){float face62=1.-abs(normalize(cross(dFdx(worldWater62),dFdy(worldWater62))).y);vec2 fallUV62=vec2(worldWater62.x*.65,worldWater62.y*.8+time62*.42);float streak62=pow(texture2D(waterArt62,fallUV62).g,1.3);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.26,.47,.44)*(.65+streak62),face62*.8);foam62+=face62*streak62*.18*hydraulic62;}
   diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.15,.25,.29),vec3(.65,.8,.75),day62),foam62);
   diffuseColor.a=hasDepth62>.5?smoothstep(.006,.15,waterDepth62):1.;if(cascade62>.5)diffuseColor.a*=1.-smoothstep(max(0.,width62-.035),width62,abs(across62));
  `);
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float waveX62=sin(stream62.x*1.65+stream62.y*.94+sin(stream62.y*.33-time62*.38))*.12+sin(stream62.x*4.1-stream62.y*2.8+time62*.4)*.058;
   float waveZ62=cos(stream62.y*2.3-stream62.x*.72+sin(stream62.x*.61))*.13+sin(stream62.y*4.8+time62*.2)*.036;
   vec3 fineN62=vec3(waveX62,0.,waveZ62);normal=normalize(normal+mat3(viewMatrix)*fineN62*(cascade62>.5?.22:1.));
  `);
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.23,.34,foam62);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>',`
   vec3 worldN62=normalize(inverseTransformDirection(normal,viewMatrix)),view62=normalize(cameraPosition-worldWater62);float fresnel62=.035+.65*pow(1.-max(0.,dot(worldN62,view62)),4.);
   vec3 skyReflection62=sky62*mix(.12,.31,day62);gl_FragColor.rgb=mix(gl_FragColor.rgb,skyReflection62,fresnel62*.62);
   if(reflect62>.5){vec2 ripple62=vec2(waveX62,waveZ62)*.04,uv62=reflected62.xy/max(.001,reflected62.w)+ripple62;vec3 mirrorColour62=texture2D(mirror62,clamp(uv62,.002,.998)).rgb;float coverage62=mirrorCoverage62(reflected62);
    if(cascade62>.5){float side62=smoothstep(cascadeZ62-cascadeSpan62,cascadeZ62+cascadeSpan62,worldWater62.z);vec2 up62=upperReflected62.xy/max(.001,upperReflected62.w)+ripple62;mirrorColour62=mix(texture2D(upperMirror62,clamp(up62,.002,.998)).rgb,mirrorColour62,side62);coverage62=mix(mirrorCoverage62(upperReflected62),coverage62,side62);}
    gl_FragColor.rgb=mix(gl_FragColor.rgb,mirrorColour62,coverage62*(.22+fresnel62*.55)*(cascade62>.5?.1:1.));}
   vec3 half62=normalize(normalize(sun62)+view62);float lobe62=pow(max(0.,dot(worldN62,half62)),180.);float sparkleMask62=smoothstep(.43,.68,noise62(stream62*vec2(4.8,3.6)));
   float crest62=pow(max(0.,sin(stream62.x*6.7+sin(stream62.y*3.1)+time62*.3)*cos(stream62.y*4.3-time62*.21)),8.)/(1.+length(fwidth(stream62))*12.);float skyGlint62=crest62*smoothstep(.48,.72,fine62)*(.016+day62*.09);
   float glint62=lobe62*(.14+sparkleMask62*.65)*keyPower62*(1.-cloud62*.68);gl_FragColor.rgb+=key62*(glint62+skyGlint62)*(cascade62>.5?.15:1.);
   #include <tonemapping_fragment>`);
 };m.customProgramCacheKey=()=> 'elyndor-valenne-water62'+(atlas?'-atlas':'');return m;
}
function installWater62(){
 if(!['poi','overworld'].includes(activeScene?.kind)||world.userData.water62)return;
 const surfaces=[];world.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh&&(o===water||o.userData.terracedWater||o.userData.freshwater38||o.userData.waterfall&&o.material?.userData.riverReflection))surfaces.push(o);});if(!surfaces.length)return;
 const field=waterField62(),old=new Set();for(const o of surfaces){old.add(o.material);o.material=waterMaterial62(o,field);o.userData.water62=true;o.castShadow=false;o.receiveShadow=true;}
 const seen=new Set();world.traverse(o=>{const m=o.material;if(!m?.isMeshStandardMaterial||seen.has(m)||!(o.userData.terrain||m.userData.textureArray||m.userData.geology62))return;seen.add(m);wetShoreMaterial62(m,field);});
 // Old surface materials are scene-owned; no shared terrain materials involved.
 for(const m of old)m.dispose();world.userData.water62={family:'Valenne',surfaces:surfaces.length,field:field.size,contacts:field.contacts,shore:'depth foam, wet contact and shallow transmission',motion:'world-space downstream normals and antialiased sun glints'};
}
const dryField62=new THREE.DataTexture(new Float32Array([0,100,100,-999]),1,1,THREE.RGBAFormat,THREE.FloatType);dryField62.needsUpdate=true;
const shoreState62={texture:{value:dryField62},bounds:{value:new THREE.Vector4()},enabled:{value:0}};
function wetShoreMaterial62(m,field){
 shoreState62.texture.value=field.texture;shoreState62.bounds.value.copy(field.bounds);shoreState62.enabled.value=1;if(m.userData.wetShore62)return;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.userData.wetShore62=true;
 m.onBeforeCompile=sh=>{before(sh);sh.uniforms.wetShore62=shoreState62.texture;sh.uniforms.wetBounds62=shoreState62.bounds;sh.uniforms.wetEnabled62=shoreState62.enabled;sh.vertexShader='varying vec3 shoreWorld62;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvec4 shoreP62=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nshoreP62=instanceMatrix*shoreP62;\n#endif\nshoreWorld62=(modelMatrix*shoreP62).xyz;');sh.fragmentShader='uniform sampler2D wetShore62;uniform vec4 wetBounds62;uniform float wetEnabled62;varying vec3 shoreWorld62;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 wetUV62=(shoreWorld62.xz-wetBounds62.xy)/wetBounds62.zw;vec4 wetData62=texture2D(wetShore62,clamp(wetUV62,0.,1.));
   float wetBand62=(1.-smoothstep(.03,.55,abs(shoreWorld62.y-wetData62.a)))*step(0.,wetUV62.x)*step(0.,wetUV62.y)*step(wetUV62.x,1.)*step(wetUV62.y,1.)*wetEnabled62;diffuseColor.rgb*=1.-wetBand62*.17;`);
 };m.customProgramCacheKey=()=>key+'-wet-contact62';m.needsUpdate=true;
}
const environmentBuildBefore62=buildWorld;
buildWorld=function(...args){const result=environmentBuildBefore62(...args);seatRocks62();trimCliffCover62();installWater62();cacheMaterialKeys36(world);return result;};
const waterSurfaceBefore62=waterSurface20;
waterSurface20=function(o){if(o?.material?.userData.water62)return;return waterSurfaceBefore62(o);};
function seatRocks62(){
 const rows=world.userData.localRocks62;if(!rows?.length)return;const surfaces=world.userData.terrainChunks??[],ray=new THREE.Raycaster(),matrix=new THREE.Matrix4(),changed=new Set();world.updateMatrixWorld(true);
 for(const q of rows){const base=groundAt(q.x,q.z);ray.set(V3(q.x,base+20,q.z),V3(0,-1,0));ray.far=45;const hit=ray.intersectObjects(surfaces,false)[0];const level=hit&&Math.abs(hit.point.y-base)<12?hit.point.y:base;q.ground=level;matrix.compose(V3(q.x,level+q.scale.y*.11,q.z),q.rotation,q.scale);q.mesh.setMatrixAt(q.index,matrix);changed.add(q.mesh);}
 for(const mesh of changed){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
}
function trimCliffCover62(){
 if(activeScene.kind!=='poi'||world.userData.cliffCover62)return;const matrix=new THREE.Matrix4();let removed=0;
 for(const mesh of perf.plants){if(!['grassBlades','fern','flowers','shrub'].includes(mesh.userData.plantKey))continue;let changed=false;const originals=mesh.userData.plantOriginal;
  for(let i=0;i<(mesh.userData.total??mesh.count);i++){const source=originals?.[i];if(source)matrix.copy(source);else mesh.getMatrixAt(i,matrix);const x=matrix.elements[12],z=matrix.elements[14],base=groundAt(x,z);if(Math.abs(base+.44*matrix.elements[5]-matrix.elements[13])>1.5)continue;const slope=Math.max(Math.abs(groundAt(x+.5,z)-groundAt(x-.5,z)),Math.abs(groundAt(x,z+.5)-groundAt(x,z-.5)));if(slope<1.1)continue;matrix.makeScale(0,0,0);mesh.setMatrixAt(i,matrix);source?.copy(matrix);changed=true;removed++;}
  if(changed){mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}
 }world.userData.cliffCover62={removed};
}
const waterLightingBefore62=updateLighting;
updateLighting=function(...args){const result=waterLightingBefore62(...args);if(!sun||!hemi)return result;const h=state.worldMinutes/60%24;waterLight62.day.value=smooth(5.5,7.5,h)*(1-smooth(17.8,19.4,h));waterLight62.sun.value.copy(sun.position).sub(sun.target.position).normalize();waterLight62.key.value.copy(sun.color);waterLight62.sky.value.copy(hemi.color);waterLight62.power.value=clamp(sun.intensity*.28,.05,1.7);waterLight62.cloud.value=weather.cloud.value;return result;};
const waterReflectionBefore62=updateReflection;
updateReflection=function(...args){
 if(activeScene?.key==='brookstead'||!world?.userData.water62||activeScene.kind==='interior')return waterReflectionBefore62(...args);
 const macro=activeScene.kind==='overworld',near=macro?traversalShoreDistance(player.x,player.z)<35||macroGround(player.x,player.z)<2:true;if(!near)return;
 const q=world.userData.reflection62??={matrix:new THREE.Matrix4(),last:-100,camera:V3(1e5,0,0),frames:0},interval=state.settings.quality==='low'?.18:.10;
 if(clock-q.last<interval&&q.camera.distanceToSquared(camera.position)<.16)return;
 const level=macro&&traversalShoreDistance(player.x,player.z)<35?traversalWaterHeight(player.x,player.z)+.035:water?.position.y??-1.4;
 reflectionCamera.copy(camera);reflectionCamera.position.y=2*level-camera.position.y;reflectionCamera.up.set(0,-1,0);reflectionCamera.lookAt(cameraTarget.x,2*level-cameraTarget.y,cameraTarget.z);reflectionCamera.updateMatrixWorld();
 q.matrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(reflectionCamera.projectionMatrix).multiply(reflectionCamera.matrixWorldInverse);
 const hidden=new Map(),hide=o=>{if(o&&!hidden.has(o)){hidden.set(o,o.visible);o.visible=false;}};
 world.traverse(o=>{if(!o.isMesh||o.userData.water62!==true)return;hide(o);const u=waterUniforms62.get(o.material);if(u){u.reflectionMatrix62.value=q.matrix;u.mirror62.value=reflectionTarget.texture;u.reflect62.value=1;}});
 for(const o of[...perf.plants,world.userData.weatherBatch36,world.userData.dust22?.mesh,world.userData.mist28,world.userData.shafts24?.group])hide(o);
 const oldTarget=renderer.getRenderTarget(),oldPlanes=renderer.clippingPlanes,pending=renderer.shadowMap.needsUpdate,sunPending=sun.shadow.needsUpdate;
 renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=false;renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),-level-.015)];forest30.main.value=0;
 try{renderer.setRenderTarget(reflectionTarget);renderer.render(scene,reflectionCamera);q.frames++;q.last=clock;q.camera.copy(camera.position);q.level=level;liveSurfaceStats.reflections++;}
 finally{renderer.setRenderTarget(oldTarget);renderer.clippingPlanes=oldPlanes;renderer.shadowMap.needsUpdate=pending;sun.shadow.needsUpdate=sunPending;for(const[o,v]of hidden)o.visible=v;forest30.main.value=1;}
};
const waterDisposeBefore62=disposeContinuousWorld;
disposeContinuousWorld=function(...args){shoreState62.enabled.value=0;shoreState62.texture.value=dryField62;world?.userData.waterField62?.texture.dispose();world?.traverse(o=>{if(o.isInstancedMesh&&(o.userData.localGeology62||o.userData.geology62!==undefined))o.dispose();});return waterDisposeBefore62(...args);};
const environmentBootBefore62=boot;
boot=async function(...args){const result=await environmentBootBefore62(...args),before=window.render_game_to_text;window.render_game_to_text=function(){const data=JSON.parse(before());data.environment={version:62,geology:world?.userData.geologyComposition62?{variants:12,anchors:world.userData.geologyComposition62.anchors.length,source:world.userData.geologyComposition62.source}:null,connectedTrees:scenery.trees.filter(t=>t.connectedGrowth62).length,water:world?.userData.water62??null};return JSON.stringify(data);};return result;};
