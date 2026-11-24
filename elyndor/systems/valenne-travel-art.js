// Travel-scale artwork is sampled in world coordinates. Routes, water depth,
// trees and landmark entrances still use the authored terrain and transforms.
const valenneArt={maps:new Map(),surfaces:null,loading:null};
const travelArtLoad=loadAssets;
loadAssets=async function(...args){
 const result=await travelArtLoad.apply(this,args);
 if(!valenneArt.loading)valenneArt.loading=loadValenneArt().catch(error=>{
  console.warn('The Valenne travel artwork could not load.',error);
  valenneArt.loading=null;
 });
 await valenneArt.loading;
 return result;
};
async function loadValenneArt(){
 const folder='elyndor/assets/valenne-travel/';
 const names=['oak','fir','landscape'];
 const images=await Promise.all(names.map(async name=>{
  const image=new Image();image.src=folder+name+(name==='landscape'?'.webp':'.png');await image.decode();return image;
 }));
 const source=images[2],canvas=document.createElement('canvas');
 canvas.width=source.width;canvas.height=source.height;
 const ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);
 const t=new THREE.DataArrayTexture(new Uint8Array(pixels.data.buffer),canvas.width,canvas.width,canvas.height/canvas.width);
 t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;
 t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 t.userData.pinnedMap17=true;t.needsUpdate=true;valenneArt.surfaces=t;
 for(let i=0;i<2;i++){
  const map=new THREE.Texture(images[i]);map.colorSpace=THREE.SRGBColorSpace;map.userData.pinnedMap17=true;map.needsUpdate=true;
  valenneArt.maps.set(names[i],map);
 }
}

function valenneTreeStyle(t){
 if(!valenneArt.surfaces||Math.max(...climateAt105(t.x,t.z))>.48)return null;
 const mixTree=Math.sin(t.x*19.13+t.z*73.29)*42751.23;
 return t.species30===4||mixTree-Math.floor(mixTree)<.54?'fir':'oak';
}
function valenneTreePlane(style,variant,height){
 const key='valenne-tree-'+style+'-'+variant+'-'+height;
 if(sharedGeo[key])return sharedGeo[key];
 const h=height*(style==='fir'?1.02:.90),g=new THREE.PlaneGeometry(h*(style==='fir'?.63:.87),h);
 g.translate(0,h/2-.04,0);
 if(variant===1){const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));}
 g.computeBoundingBox();g.boundingBox.min.z=g.boundingBox.min.x;g.boundingBox.max.z=g.boundingBox.max.x;g.computeBoundingSphere();
 return sharedGeo[key]=g;
}
function valenneTreeMaterial(style,depth=false){
 const options={map:valenneArt.maps.get(style),alphaTest:.34,side:THREE.DoubleSide};
 const m=depth?new THREE.MeshDepthMaterial({...options,depthPacking:THREE.RGBADepthPacking}):new THREE.MeshBasicMaterial(options);
 m.userData.treeViewCompiled=true;
 m.onBeforeCompile=s=>{
  s.uniforms.travelMain=forest30.main;s.uniforms.travelDay=celestial31.day;s.uniforms.travelRain=weather.rain;
  s.vertexShader='attribute float treeViewHidden; uniform float travelMain;\n'+s.vertexShader.replace('#include <begin_vertex>',`
   #include <begin_vertex>
   vec3 side=normalize(vec3(viewMatrix[0][0],0.,viewMatrix[2][0])+vec3(1e-7,0.,0.));
   transformed.x=position.x*dot(side,instanceMatrix[0].xyz/max(length(instanceMatrix[0].xyz),.00001));
   transformed.z=position.x*dot(side,instanceMatrix[2].xyz/max(length(instanceMatrix[2].xyz),.00001));
   ${depth?'':'if(treeViewHidden>.5&&travelMain>.5)transformed=vec3(0.);'}`);
  if(!depth)s.fragmentShader='uniform float travelDay,travelRain;\n'+s.fragmentShader.replace('#include <map_fragment>',`
   #include <map_fragment>
   diffuseColor.rgb*=mix(vec3(.69,.73,.53),vec3(2.05,1.93,1.47),travelDay)*(1.-.06*travelRain);`);
 };
 m.customProgramCacheKey=()=>depth?'valenne-tree-shadow':'valenne-tree-color';return m;
}

const valenneGroundBefore=groundMaterial102;
groundMaterial102=function(material){
 const r=valenneGroundBefore.apply(this,arguments);
 if(activeScene?.kind!=='overworld'||!valenneArt.surfaces||!material?.userData.ground102||material.userData.valenneMeadow)return r;
 material.userData.valenneMeadow=true;
 const before=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=function(s,...args){
  before.call(this,s,...args);
  // Both original uniforms sample the same texture array. Share their unit
  // to keep the travel shader within the existing mobile sampler budget.
  s.fragmentShader=s.fragmentShader.replace(/uniform highp sampler2DArray (worldGround102|variationArt104);/g,'').replace(/\bvariationArt104\b/g,'worldGround102');
  s.uniforms.travelSurface={value:valenneArt.surfaces};
  s.fragmentShader='uniform highp sampler2DArray worldGround102,travelSurface;\n'+s.fragmentShader.replace('float lum=dot(result,vec3(.2126,.7152,.0722));',`
   vec2 meadowUV=p.xz*vec2(.061,.069)+vec2(fine,broad)*.18;
   float blooms=smoothstep(.42,.73,noiseWorld102(p.xz*.12+9.));
   vec3 sod=texture(travelSurface,vec3(meadowUV,0.)).rgb;
   vec3 flowers=texture(travelSurface,vec3(mat2(.89,.45,-.45,.89)*meadowUV+3.1,1.)).rgb;
   vec3 fieldArt=mix(sod,flowers,blooms*.84)*vec3(3.65,3.05,1.82);
   fieldArt*=mix(.88,1.13,broad);
   float temperate=1.-smoothstep(.15,.78,max(max(climate.r,climate.g),max(climate.b,climate.a)));
   result=mix(result,fieldArt,temperate*(1.-smoothstep(.17,.45,slope))*(1.-path)*.95);
   vec2 laneUV=mat2(.86,.51,-.51,.86)*p.xz*vec2(.087,.112)+.19*vec2(broad,fine);
   vec3 flagstones=texture(travelSurface,vec3(laneUV,2.)).rgb*vec3(1.94,1.80,1.50);
   result=mix(result,flagstones,path*(1.-climate.r*.8)*.94);
   float lum=dot(result,vec3(.2126,.7152,.0722));`);
 };
 material.customProgramCacheKey=()=>key+'-valenne-painted-earth';material.needsUpdate=true;return r;
};

const valenneRiverBefore=waterMaterial62;
waterMaterial62=function(o,...args){
 const m=valenneRiverBefore.call(this,o,...args);
 if(activeScene?.kind!=='overworld'||!o.userData.freshwater38||!valenneArt.surfaces)return m;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...params){
  before.call(this,s,...params);s.uniforms.travelSurface={value:valenneArt.surfaces};
  s.fragmentShader='uniform highp sampler2DArray travelSurface;\n'+s.fragmentShader.replace('#include <tonemapping_fragment>',`
   vec2 drift=stream62*vec2(.042,.084)+vec2(.056*waveZ62,.04*waveX62);
   vec3 ripple=texture(travelSurface,vec3(drift,3.)).rgb;
   vec3 crossWave=texture(travelSurface,vec3(drift*1.31+vec2(1.43,time62*.015),3.)).rgb;
   vec3 surface=mix(ripple,crossWave,.15);
   surface*=.65+smoothstep(.011,.082,dot(surface,vec3(.21,.72,.07)))*1.12;
   vec3 blue=surface*mix(vec3(1.83,.91,.43),vec3(1.99,1.42,.93),day62);
   float reflected=dot(gl_FragColor.rgb,vec3(.21,.72,.07));
   gl_FragColor.rgb=blue*.93+reflected*vec3(.05,.065,.08)+vec3(.033,.068,.082)*foam62;
   #include <tonemapping_fragment>`);
 };
 m.customProgramCacheKey=()=>key+'-valenne-river';m.needsUpdate=true;return m;
};

// The live world and the atlas share the detailed geometry. Keep the original
// root and its game-owned footprint and entrance records through scene swaps.
const landmarkModels=new Map(),landmarkInstances=new WeakMap();
function installRegionalLandmark(root,template,site,atlas){
 if(!root||landmarkInstances.has(root))return;
 const retired=new THREE.Group();retired.add(...root.children.slice());retired.visible=false;root.add(retired);
 const model=template.clone(true);root.add(model);model.position.y-=root.position.y;
 model.traverse(o=>{
  if(!o.isMesh)return;
  if(atlas){holdAtlas67(o.geometry);holdMaterial67(o.material);}
  else o.material=playerRevealMaterial(o.material);
 });
 model.updateWorldMatrix(true,true);
 const bounds=new THREE.Box3().setFromObject(model);
 root.userData.atlasBounds118=bounds;root.userData.travelNameAnchor=V3(site.x-1,bounds.max.y+.75,site.z);
 if(atlas)exactAtlas67.landmarks.set(site.key,bounds.clone());
 else{
  const lamps=world.userData.landmarkLamps??=[];
  for(const [x,y,z,tint] of template.userData.lampSources)lamps.push({at:model.localToWorld(V3(x,y,z)),tint});
 }
 landmarkInstances.set(root,{wheel:model.getObjectByName('Brookstead waterwheel')});
}
const valenneBuildBefore=buildWorld;
buildWorld=function(...args){
 const result=valenneBuildBefore.apply(this,args);
 if(activeScene?.kind==='overworld'){
  for(const [key,site] of dioramas67.sites){
   const live=world.userData.landmarks45?.[key];if(!live)continue;
   let template=landmarkModels.get(key);
   if(!template){template=buildLandmarkModel(site,key,live.userData.siteFootprints45).model;landmarkModels.set(key,template);}
   installRegionalLandmark(live,template,site,false);
   installRegionalLandmark(exactAtlas67.scene?.getObjectByName(live.name),template,site,true);
  }
  sun.shadow.needsUpdate=renderer.shadowMap.needsUpdate=true;
 }
 return result;
};
// One practical light follows the nearest visible cluster. Windows and crystals
// everywhere else still feed the HDR bloom pass through their own emissive maps.
function updateLandmarkLight(){
 const sources=world?.userData.landmarkLamps;
 if(!sources?.length||activeScene?.kind!=='overworld'||!player)return;
 let light=world.userData.landmarkPractical;
 if(!light){
  light=new THREE.PointLight(0xffbb77,0,13,2);light.name='Nearest landmark light';
  world.add(light);world.userData.landmarkPractical=light;
 }
 const day=celestial31.day.value;
 if(day>.94){light.intensity=0;return;}
 if(light.userData.nextCheck>clock&&light.userData.nextCheck<clock+1)return;
 light.userData.nextCheck=clock+.15;
 let closest=null,best=70*70;
 for(const s of sources){
  const d=(player.x-s.at.x)**2+(player.z-s.at.z)**2;if(d<best){best=d;closest=s;}
 }
 light.intensity=closest?18*(1-day)**1.3*(1-THREE.MathUtils.smoothstep(Math.sqrt(best),45,70)):0;
 if(closest){light.position.copy(closest.at);light.position.y+=.35;light.color.set(closest.tint);}
}
const valenneLabelsBefore=updateWorldLabels44;
updateWorldLabels44=function(){
 valenneLabelsBefore();
 updateLandmarkLight();
 const brook=world?.userData.landmarks45?.brookstead,wheel=brook&&landmarkInstances.get(brook)?.wheel;
 if(wheel)wheel.rotation.z=clock*.38;
 if(worldLabels44.classList.contains('hidden'))return;
 for(const label of worldLabels44.children){
  if(label.classList.contains('hidden'))continue;
  const anchor=world.userData.landmarks45?.[label.dataset.poi]?.userData.travelNameAnchor;
  if(!anchor)continue;
  const pos=anchor.clone().project(camera);
  label.style.left=(pos.x*.5+.5)*innerWidth+'px';label.style.top=(.5-pos.y*.5)*innerHeight+'px';
 }
};

const valenneDeckBefore=joinedBridgeDeck38;
joinedBridgeDeck38=function(b){
 const first=world.children.length,result=valenneDeckBefore.apply(this,arguments);
 if(activeScene?.kind!=='overworld'||!valenneArt.surfaces)return result;
 for(const deck of world.children.slice(first)){
  if(!deck.isMesh||!deck.material.isMeshStandardMaterial)continue;
  const m=deck.material,compile=m.onBeforeCompile,cache=m.customProgramCacheKey();m.color.set('#cfd8dc');m.roughness=.79;
  m.onBeforeCompile=function(s,...args){
   compile.call(this,s,...args);s.uniforms.travelSurface={value:valenneArt.surfaces};
   s.uniforms.deckAxis={value:new THREE.Vector2(Math.cos(b.angle),Math.sin(b.angle))};
   s.vertexShader='varying vec2 deckXZ;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ndeckXZ=(modelMatrix*vec4(position,1.)).xz;');
   s.fragmentShader='uniform highp sampler2DArray travelSurface;uniform vec2 deckAxis;varying vec2 deckXZ;\n'+s.fragmentShader.replace('#include <map_fragment>',`
    vec2 paving=vec2(dot(deckXZ,deckAxis)*.12,dot(deckXZ,vec2(-deckAxis.y,deckAxis.x))*.23);
    diffuseColor.rgb*=texture(travelSurface,vec3(paving,4.)).rgb*3.25;`);
  };m.customProgramCacheKey=()=>cache+'-valenne-bridge-stone';m.needsUpdate=true;
 }
 return result;
};
