// Native HD surfaces are decoded per environment, after the encounter cover.
// Terrain, foliage and rocks retain real lighting and depth; vistas stay distant.
const MATERIAL_PROFILES100={
 waterfall:['grassLush','moss','earthLoam','gravelRiver','rockMoss',.22],
 woodland:['moss','leafLitter','earthForest','gravelRiver','rockMoss',.19],
 orchard:['grassMeadow','grassDry','earthTrail','earthLoam','rockLimestone',.22],
 ruins:['moss','grassMeadow','cobbleOld','stoneLimestone','rockMoss',.18],
 cavern:['stoneLimestone','stoneSlate','gravelDry','stoneGranite','rockSlate',.20],
 mountain:['grassDry','stoneGranite','gravelDry','stoneSlate','rockGranite',.22],
 snow:['snow','stoneGranite','snow','gravelRiver','rockGranite',.22],
 coast:['sandCoast','sandChalk','sandCoast','gravelRiver','rockLimestone',.24],
 royalRoad:['grassMeadow','moss','cobbleRoyal','cobbleOld','rockLimestone',.20],
 moonlit:['moss','leafLitter','earthForest','gravelRiver','rockMoss',.20],
 grassMeadow:['grassLush','grassMeadow','earthTrail','gravelRiver','rockMoss',.23],
 grassRiver:['grassMeadow','moss','earthLoam','gravelRiver','rockGranite',.23],
 grassFlowers:['grassMeadow','grassLush','earthTrail','gravelRiver','rockMoss',.24],
 grassDowns:['grassDry','grassMeadow','sandChalk','stoneLimestone','rockLimestone',.23],
 grassWindmill:['grassMeadow','grassDry','earthTrail','earthLoam','rockLimestone',.22],
 grassAutumn:['grassDry','leafLitter','earthLoam','gravelDry','rockLimestone',.21],
 grassStones:['grassMeadow','moss','earthTrail','stoneGranite','rockMoss',.23],
 grassHills:['grassDry','grassMeadow','earthTrail','stoneGranite','rockGranite',.23],
 grassBirch:['grassMeadow','moss','earthLoam','gravelRiver','rockGranite',.23],
 grassTwilight:['grassMeadow','grassDry','earthTrail','gravelRiver','rockGranite',.23]
};
const materials100={cache:new Map(),pending:new Map(),ready:new Set(),common:null,leaves:null,rects:[],loads:0,evictions:0};
const LEAVES100=['leafOak','leafBirch','leafAutumn','leafWillow','leafPine','leafOrchard'];
function profile100(stage=encounter53.selected){return MATERIAL_PROFILES100[stage]??MATERIAL_PROFILES100.waterfall;}
function surfaceTexture100(key){const t=materials100.cache.get(key);if(!t)throw Error('HD battle material not prepared: '+key);return t;}
function loadSurface100(key){
 if(materials100.cache.has(key))return Promise.resolve(materials100.cache.get(key));
 if(materials100.pending.has(key))return materials100.pending.get(key);
 const task=(async()=>{const row=assets.battleMaterials100.images[key],image=new Image();image.src=row.url;await image.decode();
  const t=new THREE.Texture(image);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.wrapS=t.wrapT=row.transparent?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.userData.pinnedMap17=true;t.userData.native100=key;t.needsUpdate=true;
  materials100.cache.set(key,t);materials100.loads++;return t;
 })();materials100.pending.set(key,task);task.catch(()=>materials100.pending.delete(key));return task;
}
async function commonMaterials100(){
 if(materials100.common)return materials100.common;
 materials100.common=(async()=>{
  const leaves=await Promise.all(LEAVES100.map(loadSurface100));
  const size=Math.max(...leaves.map(t=>Math.max(t.image.width,t.image.height))),data=new Uint8Array(size*size*4*leaves.length),c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d',{willReadFrequently:true});
  leaves.forEach((t,i)=>{ctx.clearRect(0,0,size,size);ctx.drawImage(t.image,0,0);data.set(ctx.getImageData(0,0,size,size).data,i*size*size*4);materials100.rects[i]=new THREE.Vector4(0,0,t.image.width/size,t.image.height/size);});
  const t=new THREE.DataArrayTexture(data,size,size,leaves.length);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;materials100.leaves=t;
  // The native array owns its pixels. Free the temporary source decodes.
  for(const key of LEAVES100){const t=materials100.cache.get(key);if(!t.userData.shared103){t.dispose();t.image.src='';}materials100.cache.delete(key);materials100.pending.delete(key);}
  await Promise.all(['barkOak','barkBirch','barkPine','fern','flowers'].map(loadSurface100));
 })();try{await materials100.common;}catch(e){materials100.common=null;throw e;}
}
async function prepareMaterials100(stage){
 const p=profile100(stage);await Promise.all([commonMaterials100(),...new Set(p.slice(0,5)).values()].map(x=>typeof x==='string'?loadSurface100(x):x));materials100.ready.add(stage);
 const keep=new Set([...p.slice(0,5),...(arena88.current?.materials100?.keys??[]),'barkOak','barkBirch','barkPine','fern','flowers']);
 for(const [key,t]of materials100.cache){if(materials100.cache.size<=15)break;if(keep.has(key))continue;if(!t.userData.shared103){t.dispose();t.image.src='';}materials100.cache.delete(key);materials100.pending.delete(key);materials100.evictions++;}
 for(const s of materials100.ready)if(profile100(s).slice(0,5).some(k=>!materials100.cache.has(k)))materials100.ready.delete(s);
}
const prepareMaterialsBefore100=preparePainting90;
preparePainting90=async function(stage,phase){const [painting]=await Promise.all([prepareMaterialsBefore100(stage,phase),prepareMaterials100(stage)]);return painting;};
const coveredMaterialsBefore100=advanceEncounterCover53;
advanceEncounterCover53=function(dt){const c=encounter53;if(c.phase==='enter'&&!c.swapped&&!materials100.ready.has(c.selected)&&c.time+dt>c.duration*.44){if(c.time<c.duration*.44)coveredMaterialsBefore100(c.duration*.44-c.time);return;}return coveredMaterialsBefore100(dt);};

const terrainMath100=`
float grainNoise100(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec4 h=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1.,0.),vec2(127.1,311.7)),dot(i+vec2(0.,1.),vec2(127.1,311.7)),dot(i+1.,vec2(127.1,311.7))))*43758.5453);return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);}
vec3 terrainSample100(sampler2D t,vec2 p){
 vec2 warp=vec2(grainNoise100(p*.26),grainNoise100(p*.26+19.7))-.5;
 vec3 a=texture2D(t,p+warp*.24).rgb,b=texture2D(t,mat2(.8,.6,-.6,.8)*p+vec2(13.17,7.83)-warp*.24).rgb;
 return mix(a,b,.25+.50*grainNoise100(p*.17+4.9));
}
`;
function hdGroundMaterial100(b){
 const p=profile100(),maps=p.slice(0,4).map(surfaceTexture100),m=material59(new THREE.MeshStandardMaterial({map:maps[0],bumpMap:maps[0],bumpScale:.11,color:'#e7e6da',roughness:.96,metalness:0}));
 bindArenaWeather89(m,b);lightPaintedSurface82(m);const before=m.onBeforeCompile,cache=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);
  Object.assign(s.uniforms,{groundOne100:{value:maps[1]},groundTwo100:{value:maps[2]},groundThree100:{value:maps[3]},groundOrigin100:{value:b.group.position},groundScale100:{value:p[5]},groundSnow100:{value:b.spec.snow?1:0},groundPaved100:{value:b.spec.ruins||b.spec.royal?1:0},groundDetailScales100:{value:new THREE.Vector4(1,.91,b.spec.ruins?.43:b.spec.royal?.62:1.07,.83)},groundDry100:{value:b.spec.coast||b.spec.cave?1:0}});
  s.vertexShader='varying vec3 terrainWorld100,terrainNormal100;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nterrainWorld100=(modelMatrix*vec4(transformed,1.)).xyz;terrainNormal100=inverseTransformDirection(transformedNormal,viewMatrix);');
  s.fragmentShader='uniform sampler2D groundOne100,groundTwo100,groundThree100;uniform vec3 groundOrigin100;uniform vec4 groundDetailScales100;uniform float groundScale100,groundSnow100,groundDry100,groundPaved100;varying vec3 terrainWorld100,terrainNormal100;float groundHeight100,groundGrit100;\n'+terrainMath100+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   vec2 local100=terrainWorld100.xz-groundOrigin100.xz,uv100=terrainWorld100.xz*groundScale100;
   float broad100=grainNoise100(local100*.063),broken100=grainNoise100(local100*.31+27.)*.65+grainNoise100(local100*.93)*.35;
   float path100=1.-smoothstep(5.5,12.5,abs(local100.x+sin(local100.y*.053)*3.1)+(broken100-.5)*7.);
   float clearing100=1.-smoothstep(.66,1.2,length((local100-vec2(0.,2.))/vec2(24.,18.))+(broken100-.5)*.34);
   float worn100=clamp(max(path100*.65,clearing100*.58)+(broad100-.5)*.62+(broken100-.5)*.72,0.,.96);
   worn100=smoothstep(.22,.76,worn100);
   worn100=mix(worn100,max(worn100,clearing100*.94+path100*.12),groundPaved100);
   worn100=mix(worn100,.14,groundSnow100);
   float secondary100=smoothstep(.31,.69,broad100+(broken100-.5)*.40)*(1.-worn100)*.76;
   float slope100=1.-abs(normalize(terrainNormal100).y);
   float wetBank100=1.-smoothstep(-.4,1.0,terrainWorld100.y-groundOrigin100.y);
   float grit100=clamp(smoothstep(.11,.40,slope100)*.80+smoothstep(.62,.86,broken100)*.27+wetBank100*(1.-clearing100)*.22,0.,.87);
   grit100*=mix(1.,.34,groundSnow100);
   vec3 base100=terrainSample100(map,uv100*groundDetailScales100.x),other100=terrainSample100(groundOne100,uv100*groundDetailScales100.y+3.7),trail100=terrainSample100(groundTwo100,uv100*groundDetailScales100.z+7.1),rock100=terrainSample100(groundThree100,uv100*groundDetailScales100.w+11.3);
   trail100=mix(trail100,texture2D(groundTwo100,uv100*groundDetailScales100.z).rgb,groundPaved100);
   // Height-aware, feathered boundaries; no vertex-sized circles or tile cells.
   float height100=dot(other100-base100,vec3(.25,.5,.25));secondary100=smoothstep(.05,.95,secondary100+height100*.18);
   vec3 ground100=mix(mix(base100,other100,secondary100),trail100,worn100);
   ground100=mix(ground100,rock100,grit100)*( .965+.07*broad100);
   float luma100=dot(ground100,vec3(.2126,.7152,.0722));ground100=mix(vec3(luma100),ground100,.90);
   diffuseColor.rgb*=ground100;groundHeight100=luma100;groundGrit100=grit100;
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(groundHeight100),dFdy(groundHeight100))*.11,faceDirection);');
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(.96-groundGrit100*.07, .86,.99);');
  m.userData.stageOnly99={projectedFloor:false,opaque:true};m.userData.blend100={layers:p.slice(0,4),native:1254,worldSpace:true,heightAware:true,antiTile:true,opaque:true};
 };
 m.customProgramCacheKey=()=>cache()+'-native-layered-ground100';return m;
}
// Every rock, cliff, log and tree branch uses native HD art. Only metals and
// water retain reflective materials; soil, foliage, wood and stone stay matte.
const materialTextureBefore100=arenaTexture88;
arenaTexture88=function(key,normal=false){if(typeof key==='string'&&key.startsWith('material100_'))return normal?null:surfaceTexture100(key.slice(12));return materialTextureBefore100(key,normal);};
const materialBefore100=arenaMaterial88;
arenaMaterial88=function(b,key,color='#ffffff',options={}){
 const p=profile100(),replacement=key==='env62_stone'||key==='riverStone18'?p[4]:key==='snow'&&b.spec.snow?'snow':key==='bark'||key==='env62_bark'?'barkOak':key==='barkPine86'?'barkPine':null;
 if(!replacement)return materialBefore100(b,key,color,options);
 const m=materialBefore100(b,'material100_'+replacement,'#e0dfd5',options);if(m.userData.surface100)return m;m.userData.surface100=replacement;m.normalMap=null;m.bumpMap=m.map;m.bumpScale=.07;m.roughness=.92;m.metalness=0;m.envMap=null;
 const before=m.onBeforeCompile,cache=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.fragmentShader='float solidHeight100;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb*=native88;','diffuseColor.rgb*=native88;solidHeight100=dot(native88,vec3(.2126,.7152,.0722));');s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(solidHeight100),dFdy(solidHeight100))*.07,faceDirection);');};m.customProgramCacheKey=()=>cache()+'-native-surface100';return m;
};
arenaPoiRock89=function(b){return arenaMaterial88(b,'env62_stone');};
// Folded native plant geometry retains its existing wind. The artwork is a
// real alpha cutout rather than a translucent square or a glowing blob.
arenaPlantMaterial89=function(b,type){const m=materialBefore100(b,'material100_'+(type==='flowers'?'flowers':'fern'),'#c8d0ba',{wind:true,cutout:true});m.vertexColors=false;m.alphaTest=.42;m.transparent=false;m.depthWrite=true;m.userData.surface100=type;return m;};
const geometryBefore100=arenaGeometry88;
arenaGeometry88=function(b,id,create){return geometryBefore100(b,id,/^(poiPlant89-|detail92-)(fern|flowers)$/.test(id)?()=>sprigGeometry89():create);};
function nativeBotany100(m,b,depth=false){
 const before=m.onBeforeCompile,cache=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.leaves30={value:materials100.leaves};s.uniforms.leafRect30={value:materials100.rects};
  s.fragmentShader=s.fragmentShader.replace('leafRect30[6]','leafRect30['+LEAVES100.length+']').replace('floor(species+.5),0.,5.','floor(species+.5),0.,'+(LEAVES100.length-1)+'.');
  if(!depth){s.uniforms.bark30={value:surfaceTexture100('barkOak')};s.uniforms.barkBirch100={value:surfaceTexture100('barkBirch')};s.uniforms.barkPine100={value:surfaceTexture100('barkPine')};
   s.fragmentShader='uniform sampler2D barkBirch100,barkPine100;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('texture2D(bark30,leafUV30*vec2(1.,3.))','(abs(species30-1.)<.1?texture2D(barkBirch100,leafUV30*vec2(1.5,2.)):abs(species30-4.)<.1?texture2D(barkPine100,leafUV30*vec2(1.5,2.)):texture2D(bark30,leafUV30*vec2(1.5,2.)))');
   s.fragmentShader=s.fragmentShader.replace(/if\(trunk30>\.5&&abs\(species30-1\.\)<\.1\)\{float lines30=[\s\S]*?lines30\*\.45\);\}/,'').replace('botany30.rgb*=1.35','botany30.rgb*=1.02');
  }
 };m.customProgramCacheKey=()=>cache()+'-native-botany100-'+depth;m.userData.nativeBotany100={native:1254,matchingDepth:depth};m.needsUpdate=true;
}
const treesBefore100=flushPoiTrees89;
flushPoiTrees89=function(b){if(b.spec.trees==='orchard'&&b.nativeTrees89)for(const rows of Object.values(b.nativeTrees89))for(const row of rows)if(row.species===0)row.species=5;treesBefore100(b);for(const o of b.group.children)if(o.name==='POI native connected trunks'||o.name==='POI native botanical canopy'){nativeBotany100(o.material,b);nativeBotany100(o.customDepthMaterial,b,true);o.material.roughness=.92;o.material.metalness=0;}};
const buildMaterialsBefore100=buildStageScenery59;
buildStageScenery59=function(...args){const result=buildMaterialsBefore100(...args),b=arena88.current;if(!b?.hdArt99||b.materials100)return result;
 const ground=b.group.children.find(o=>o.name==='Actual level ground and carved water banks');ground.material=hdGroundMaterial100(b);
 b.materials100={keys:profile100().slice(0,5),groundLayers:profile100().slice(0,4),native:1254,trees:LEAVES100.length,barks:3,rock:profile100()[4],matte:true,physical:true};
 if(stageDepth59.summary)stageDepth59.summary.materials100=b.materials100;return result;
};
