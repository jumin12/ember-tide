// Shared geological detail at pebble and boulder scale. Texture coordinates
// follow each instance, so a small stone receives a complete mineral surface.
const stoneGeometryBefore105=rockGeometry62;
rockGeometry62=function(kind=0){
 const key='fracture-stone105-'+kind;if(sharedGeo[key])return sharedGeo[key];
 const original=stoneGeometryBefore105(kind),bounds=original.boundingBox.clone(),size=bounds.getSize(V3()),k=((kind%12)+12)%12,rng=seeded(105771+k*173);
 const g=new THREE.SphereGeometry(1,36,24),p=g.attributes.position,planes=[];
 // A closed fractured solid, rather than a sphere with a few shallow cuts.
 // Six major bedding faces meet irregular corner fractures. The high-order
 // intersection rounds only their edges and preserves broad planar faces.
 for(const axis of [V3(1,0,0),V3(-1,0,0),V3(0,1,0),V3(0,-1,0),V3(0,0,1),V3(0,0,-1)])planes.push({n:axis.add(V3((rng()-.5)*.22,(rng()-.5)*.20,(rng()-.5)*.22)).normalize(),d:.72+rng()*.23});
 for(let i=0;i<7;i++){const y=-.75+i*.25,a=i*2.399963+rng()*.5,r=Math.sqrt(1-y*y);planes.push({n:V3(Math.cos(a)*r,y,Math.sin(a)*r),d:.86+rng()*.20});}
 for(let i=0;i<p.count;i++){
  const n=V3(p.getX(i),p.getY(i),p.getZ(i));let radial=1;
  const bevel=k===6?14:42;let inverse=0;for(const q of planes){const projection=n.dot(q.n);if(projection>0)inverse+=Math.pow(projection/q.d,bevel);}radial=Math.pow(inverse,-1/bevel);
  const erosion=1+.012*Math.sin(n.x*13.1+n.y*6.7+k)*Math.sin(n.z*11.3-n.y*4.9+k*.7);
  const ledge=[1,4,7,9].includes(k),strata=ledge?1+.024*Math.sin((n.y+n.x*.12)*22+k):1;
  p.setXYZ(i,n.x*radial*erosion*strata,n.y*radial*erosion,n.z*radial*erosion*strata);
 }
 g.computeBoundingBox();const box=g.boundingBox.clone(),span=box.getSize(V3());
 // Existing contacts, placement and collision footprints remain unchanged.
 for(let i=0;i<p.count;i++)p.setXYZ(i,bounds.min.x+(p.getX(i)-box.min.x)/span.x*size.x,bounds.min.y+(p.getY(i)-box.min.y)/span.y*size.y,bounds.min.z+(p.getZ(i)-box.min.z)/span.z*size.z);
 g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData={...original.userData,fractured105:true,vertices:p.count};return sharedGeo[key]=g;
};
const stoneMaterials105=new WeakMap();
function detailedStone105(name,b=null){
 const owner=b?.group??world;if(!stoneMaterials105.has(owner))stoneMaterials105.set(owner,new Map());const cache=stoneMaterials105.get(owner);if(cache.has(name))return cache.get(name);
 const m=new THREE.MeshStandardMaterial({map:envPbr103.maps.get(name+':albedo')??environment102.maps.get(name),color:'#ffffff',roughness:.93,metalness:0});m.envMap=null;
 m.userData={geology62:true,mineral102:true,weathered104:true,stone105:name,pbr103:{roughness:.93,metalness:0,matchedNormals:true}};
 addCloudLighting(m);lightPaintedSurface82(m);if(b){bindArenaWeather89(m,b);material59(m);b.materials.set('detailed-stone105-'+name,m);}
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...args){before.call(this,s,...args);
  s.uniforms.stoneNR105={value:envPbr103.maps.get(name+':normalRough')};
  s.vertexShader='varying vec3 stoneCoord105,stoneAxis105;varying float stoneSeed105;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   stoneCoord105=transformed*.48;stoneAxis105=objectNormal;stoneSeed105=0.;
   #ifdef USE_INSTANCING
    float stoneSize105=max(length(instanceMatrix[0].xyz),length(instanceMatrix[2].xyz));
    stoneSeed105=fract(sin(dot(instanceMatrix[3].xz,vec2(12.9898,78.233)))*43758.5453);
    stoneCoord105=transformed*max(1.12,stoneSize105*.48)+vec3(stoneSeed105*17.31,stoneSeed105*9.17,stoneSeed105*23.47);
   #else
    float stoneSize105=max(length(modelMatrix[0].xyz),length(modelMatrix[2].xyz));
    stoneCoord105*=max(1.,stoneSize105);
   #endif`);
  s.fragmentShader='uniform sampler2D stoneNR105;varying vec3 stoneCoord105,stoneAxis105;varying float stoneSeed105;vec3 stoneWeights105;vec4 stoneX105,stoneY105,stoneZ105;\n'+normalBasis103+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   stoneWeights105=pow(abs(normalize(stoneAxis105)),vec3(5.));stoneWeights105/=max(.001,dot(stoneWeights105,vec3(1.)));
   vec3 stoneArt105=texture2D(map,stoneCoord105.zy).rgb*stoneWeights105.x+texture2D(map,stoneCoord105.xz).rgb*stoneWeights105.y+texture2D(map,stoneCoord105.xy).rgb*stoneWeights105.z;
   diffuseColor.rgb*=stoneArt105*mix(.96,1.04,stoneSeed105);
   stoneX105=texture2D(stoneNR105,stoneCoord105.zy);stoneY105=texture2D(stoneNR105,stoneCoord105.xz);stoneZ105=texture2D(stoneNR105,stoneCoord105.xy);`);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`
   vec3 stoneBaseN105=normal;
   normal=normalize(dataNormal103(-vViewPosition,stoneBaseN105,stoneCoord105.zy,stoneX105.rgb*2.-1.)*stoneWeights105.x+dataNormal103(-vViewPosition,stoneBaseN105,stoneCoord105.xz,stoneY105.rgb*2.-1.)*stoneWeights105.y+dataNormal103(-vViewPosition,stoneBaseN105,stoneCoord105.xy,stoneZ105.rgb*2.-1.)*stoneWeights105.z);`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(dot(vec3(stoneX105.a,stoneY105.a,stoneZ105.a),stoneWeights105),.82,.99);');
 };m.customProgramCacheKey=()=>key+'-scale-aware-mineral105-'+name;cache.set(name,m);return m;
}
rockMaterial62=biome=>detailedStone105(['rockMoss','rockGranite','rockLimestone','rockSlate'][Math.min(3,Math.max(0,Math.floor(biome??0)))],environment102.battle?arena88.current:null);
const arenaStoneBefore105=arenaMaterial88;
arenaMaterial88=function(b,key,...args){const name=key?.replace(/^material100_/,'');if(/^rock(Moss|Granite|Limestone|Slate)$/.test(name))return detailedStone105(name,b);if(key==='env62_stone'||key==='riverStone18')return detailedStone105(profile100()[4],b);return arenaStoneBefore105(b,key,...args);};
arenaPoiRock89=b=>detailedStone105(profile100()[4],b);
const stoneAssetsBefore105=loadAssets;
loadAssets=async function(...args){const r=await stoneAssetsBefore105(...args);await Promise.all(['rockMoss','rockGranite','rockLimestone','rockSlate'].flatMap(k=>[texture103(k),texture103(k,'normalRough')]));return r;};

function fighterStances105(b){return[player,...followers,...(battle?.enemies??[]).map(e=>e.actor)].map(a=>{
 const home=battle?.rankHomes87?.get(a)??a,s=silhouette87(a.visualId??a.id),x=home.x-b.group.position.x,z=home.z-b.group.position.z,pad=.65,depth=Math.max(.70,a.size*.27)+.40;
 return{minX:x+s.left*a.size-pad,maxX:x+s.right*a.size+pad,minZ:z-depth,maxZ:z+depth,id:a.id};
});}
function stanceIntersects105(box,stances){return stances.some(p=>box.min.x<p.maxX&&box.max.x>p.minX&&box.min.z<p.maxZ&&box.max.z>p.minZ);}
function fighterSightlines105(b){
 const eye=battlePresentation91.frame?.position??b.reference90?.position??camera.position,lines=[];
 for(const a of[player,...followers,...(battle?.enemies??[]).map(e=>e.actor)]){const home=battle?.rankHomes87?.get(a)??a,s=silhouette87(a.visualId??a.id);
  for(const x of[home.x+s.left*a.size*.72,home.x+(s.left+s.right)*a.size*.5,home.x+s.right*a.size*.72])for(const h of[.16,.50,.84]){const target=V3(x,encounter53.floorY+s.height*a.size*h,home.z),delta=target.sub(eye);lines.push({ray:new THREE.Ray(eye.clone(),delta.clone().normalize()),distance:delta.length()});}
 }return lines;
}
function stoneOccludes105(box,b,lines){const worldBox=box.clone().translate(b.group.position),hit=V3();return lines.some(l=>l.ray.intersectBox(worldBox,hit)&&hit.distanceTo(l.ray.origin)<l.distance-.25);}
function clearFighterStones105(b){
 if(!battle||!b?.hybridKey90)return;const stances=fighterStances105(b),signature=JSON.stringify(stances);if(b.stoneClearance105?.signature===signature)return;
 const matrix=new THREE.Matrix4(),box=new THREE.Box3(),sightlines=fighterSightlines105(b);let removed=0,remaining=0;
 b.group.traverse(o=>{if(!o.geometry?.userData.weathered104)return;o.geometry.computeBoundingBox();
  if(o.isInstancedMesh){let write=0;for(let i=0;i<o.count;i++){o.getMatrixAt(i,matrix);box.copy(o.geometry.boundingBox).applyMatrix4(matrix);if(stanceIntersects105(box,stances)||stoneOccludes105(box,b,sightlines)){removed++;continue;}o.setMatrixAt(write,matrix);if(o.instanceColor){const color=new THREE.Color();o.getColorAt(i,color);o.setColorAt(write,color);}write++;remaining++;}o.count=write;o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;o.computeBoundingSphere();o.computeBoundingBox();}
  else if(o.isMesh){o.updateMatrix();box.copy(o.geometry.boundingBox).applyMatrix4(o.matrix);if(stanceIntersects105(box,stances)||stoneOccludes105(box,b,sightlines)){o.visible=false;removed++;}else remaining++;}
 });b.stoneClearance105={signature,removed,remaining,stances,padding:.65};
}
const rockPieceBefore105=referencePiece101;
referencePiece101=function(b,key,g,m,p,scale,rotation){
 if(g.userData.weathered104&&battle){const matrix=new THREE.Matrix4().compose(p??V3(),rotation??new THREE.Quaternion(),scale??V3(1,1,1));g.computeBoundingBox();const box=g.boundingBox.clone().applyMatrix4(matrix);if(stanceIntersects105(box,fighterStances105(b))||stoneOccludes105(box,b,fighterSightlines105(b))){g.dispose();b.skippedRockPieces105=(b.skippedRockPieces105??0)+1;return;}}
 return rockPieceBefore105(b,key,g,m,p,scale,rotation);
};
const stoneBuildBefore105=buildStageScenery59;
buildStageScenery59=function(...args){const r=stoneBuildBefore105(...args);clearFighterStones105(arena88.current);return r;};
const stoneRenderBefore105=renderArena89;
renderArena89=function(...args){clearFighterStones105(arena88.current);return stoneRenderBefore105(...args);};
