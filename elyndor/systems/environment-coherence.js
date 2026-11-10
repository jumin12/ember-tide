// One lighting environment for painted distance and physical scenery. Native
// panoramas retain their approved native color and time of day.
const colourStudy105=new WeakMap();
function paintingStudy105(texture){
 if(colourStudy105.has(texture))return colourStudy105.get(texture);
 const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(texture.image,0,0,160,90);
 const data=ctx.getImageData(0,0,160,90).data,green=[],floor=[],stone=[],sky=[];
 for(let y=0;y<90;y++)for(let x=0;x<160;x++){
  const i=(y*160+x)*4,r=data[i]/255,g=data[i+1]/255,b=data[i+2]/255,l=r*.2126+g*.7152+b*.0722;
  if(y>39&&g>r*1.07&&g>b*1.12&&l>.035)green.push([r,g,b,l]);
  if(y>65&&x>32&&x<128)floor.push([r,g,b,l]);
  if(y>35&&y<77&&Math.max(r,g,b)-Math.min(r,g,b)<.14&&l>.08)stone.push([r,g,b,l]);
  if(y<25)sky.push([r,g,b,l]);
 }
 const sample=rows=>{rows.sort((a,b)=>a[3]-b[3]);const cut=rows.slice(Math.floor(rows.length*.25),Math.ceil(rows.length*.80)),sum=cut.reduce((a,p)=>a.map((v,i)=>v+p[i]),[0,0,0,0]);return sum.map(v=>v/Math.max(1,cut.length));};
 const study={grass:sample(green),floor:sample(floor),stone:sample(stone),sky:sample(sky),samples:green.length};colourStudy105.set(texture,study);return study;
}
const naturalLandscapeBefore105=makeHybridLandscape90;
makeHybridLandscape90=function(b){naturalLandscapeBefore105(b);b.colourStudy105=paintingStudy105(b.plate90);};

const matchedLightBefore105=arenaLight89;
arenaLight89=function(b){
 matchedLightBefore105(b);if(!b.hybridKey90)return;
 const study=paintingStudy105(textures[paintingKey90(encounter53.selected,b.night?'night':'day')]),s=b.spec;
 // Bounce opens the shaded field without bleaching the sun-facing pigments.
 // Forest, cave, snow and moonlit sets keep their own ratios and temperature.
 const dark=s.cave,forest=s.dense||s.elder,warm=s.autumn||s.twilight;
 sun.color.set(b.night?'#c0dcff':dark?'#b4def0':warm?'#ffe2bf':'#fff5e6');
 const daylight=clamp((study.floor[3]+.15)/.62,.83,1.10),moonlight=clamp((study.floor[3]+.08)/.32,.78,1.14);
 sun.intensity=b.night?(dark?.68:.90)*moonlight:(dark?1.15:forest?3.1:s.snow?2.65:warm?4.1:4.9)*daylight;
 hemi.color.set(b.night?'#b3cce8':dark?'#aacbd8':'#d9e9f4');
 hemi.groundColor.set(b.night?'#607a85':dark?'#788f91':'#a2b39c');
 hemi.intensity=b.night?(dark?.72:.92)*moonlight:dark?1.04:s.snow?1.40:forest?1.16:1.26;
 encounter53.resources.fill.color.copy(hemi.color);encounter53.resources.fill.intensity=b.night?.13:dark?.14:.18;
 b.exposure89=1;
 b.lightMatch105={phase:b.night?'night':'day',habitat:dark?'cave':forest?'forest':warm?'warm':s.snow?'snow':'daylight',study,sun:sun.intensity,fill:hemi.intensity,nativePlate:true};
};

// These are independently generated native green materials. Retain their
// actual pigment, including fine variations, before dynamic scene lighting.
const greenPigment105=`vec3 livingTurf105(vec3 c){return c*vec3(1.03,.98,1.22);}\n`;
const matchingGroundBefore105=groundMaterial102;
groundMaterial102=function(m){
 matchingGroundBefore105(m);if(!m?.userData.ground102||m.userData.colourMatch105)return;m.userData.colourMatch105=true;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(shader,...args){before.call(this,shader,...args);shader.fragmentShader=greenPigment105+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('vec3 turf=mix(lush,dry,patches*.24);','vec3 turf=mix(livingTurf105(lush),livingTurf105(dry),patches*.24);');
  shader.fragmentShader=shader.fragmentShader.replace('(.24+forestFloor102*.32)','(.10+forestFloor102*.18)');
 };m.customProgramCacheKey=()=>key+'-living-turf105';m.needsUpdate=true;
};
for(const stage of ['woodland','moonlit'])MATERIAL_PROFILES100[stage].splice(0,2,'grassLush','moss');
for(const stage of ['orchard','grassDowns','grassWindmill','grassHills','grassTwilight'])MATERIAL_PROFILES100[stage][0]='grassMeadow';
MATERIAL_PROFILES100.cavern.splice(0,4,'stoneSlate','stoneGranite','gravelRiver','stoneSlate');
const matchedBattleGroundBefore105=hdGroundMaterial100;
hdGroundMaterial100=function(b){
 const m=matchedBattleGroundBefore105(b),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.color.set('#ffffff');
 m.onBeforeCompile=function(shader,...args){before.call(this,shader,...args);shader.fragmentShader=greenPigment105+shader.fragmentShader;
  if(!b.spec.cave&&!b.spec.snow&&!b.spec.coast){
   shader.fragmentShader=shader.fragmentShader.replace('// Height-aware, feathered boundaries;','base100=livingTurf105(base100);other100=livingTurf105(other100);\n// Height-aware, feathered boundaries;');
   if(!b.spec.ruins&&!b.spec.royal)shader.fragmentShader=shader.fragmentShader.replace('path100*.65,clearing100*.58','path100*.58,clearing100*.20');
  }
 };m.customProgramCacheKey=()=>key+'-matched-battle-pigment105';m.userData.colourMatch105=true;return m;
};
const matchingPlantsBefore105=vegetationMaterial103;
vegetationMaterial103=function(kind,b=null){
 const m=matchingPlantsBefore105(kind,b),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.color.set('#ffffff');
 if(kind!=='flowers'){m.map=environment102.maps.get(kind==='grassBlades'?'grassLeaf105':'botanicalLeaf102');m.normalMap=envPbr103.maps.get((kind==='grassBlades'?'grassLeaf105':'botanicalLeaf102')+':normalRough');m.normalScale.setScalar(.14);m.bumpMap=null;m.vertexColors=false;}
 m.onBeforeCompile=function(shader,...args){before.call(this,shader,...args);
  if(kind!=='flowers')shader.fragmentShader=greenPigment105+shader.fragmentShader;
  if(kind==='grassBlades')shader.fragmentShader=shader.fragmentShader.replace(/vec3 epidermis103=[\s\S]*?diffuseColor.rgb\*=bladePigment103;/,'diffuseColor.rgb*=livingTurf105(texture2D(map,vMapUv).rgb);');
  else if(kind!=='flowers')shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','diffuseColor.rgb*=livingTurf105(texture2D(map,vMapUv).rgb);');
 };m.customProgramCacheKey=()=>key+'-matched-leaf105';m.userData.colourMatch105=true;return m;
};
const matchedAssetsBefore105=loadAssets;
loadAssets=async function(...args){const result=await matchedAssetsBefore105(...args);await loadWorldSurface102('grassLeaf105');await Promise.all(['grassLeaf105','botanicalLeaf102'].map(k=>texture103(k,'normalRough')));return result;};
const nativeLeafBefore105=treeMaterial104;
treeMaterial104=function(species,trunk=false,b=null,depth=false){const m=nativeLeafBefore105(species,trunk,b,depth);if(trunk||depth)return m;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey(),autumn=species===2&&!!b&&(b.spec.autumn||b.spec.trees==='autumn');
 m.onBeforeCompile=function(shader,...args){before.call(this,shader,...args);shader.fragmentShader=greenPigment105+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('vec3 leafArt104=leafTint104*veinTone104;',autumn?'vec3 leafArt104=vec3(1.32,.51,.09)*dot(veinArt104,vec3(.21,.72,.07));':'vec3 leafArt104=livingTurf105(veinArt104);').replace('mix(.045,.22,leafDay104)','mix(.065,.38,leafDay104)');};m.customProgramCacheKey=()=>key+'-native-lamina105-'+autumn;return m;
};
const finalStageMatchBefore105=buildStageScenery59;
buildStageScenery59=function(...args){
 const result=finalStageMatchBefore105(...args),b=arena88.current;if(!b?.hybridKey90||b.matched105)return result;b.matched105=true;
 arenaLight89(b);
 // The old front lamp was yellow and stronger than the sky. Keep it soft and
 // neutral so actor faces and the front of rocks belong to the same daylight.
 for(const o of b.group.children)if(o.isDirectionalLight){o.color.copy(hemi.color);o.intensity=b.night?.30:b.spec.cave?.32:1.05;}
 b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){
  if(m?.userData.realVegetation103||m?.userData.weathered104||/^rock/.test(m?.userData.surface100??''))m.color.set('#ffffff');
 }});
 if(b.airUniforms97){b.airUniforms97.airColour97.value.copy(b.palette90.sky);b.airUniforms97.airPower97.value=b.spec.cave?.045:b.night?.06:.075;}
 if(stageDepth59.summary)stageDepth59.summary.lightMatch105=b.lightMatch105;
 return result;
};

const finishedWorldColourBefore105=buildWorld;
buildWorld=function(...args){const result=finishedWorldColourBefore105(...args);if(!['poi','overworld'].includes(activeScene.kind))return result;
 const seen=new Set();world.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m||seen.has(m))continue;seen.add(m);if(m.userData.realVegetation103||m.userData.weathered104)m.color.set('#ffffff');}});
 world.userData.colourMatch105={livingGrass:true,sharedPigments:true,nativeDetail:true};return result;
};
const landscapeLightBefore105=updateLighting;
const landscapeColours105={sun:new THREE.Color('#fff7ec'),ground:new THREE.Color('#8faba0')};
updateLighting=function(...args){const result=landscapeLightBefore105(...args);if(!world||!usesLandscapeLight54())return result;
 const day=celestial31.day.value,warm=poiLight54.warm.value;
 sun.color.lerp(landscapeColours105.sun,day*(1-warm)*.18);hemi.groundColor.lerp(landscapeColours105.ground,day*.32);hemi.intensity*=1+day*.12;
 waterLight62.key.value.copy(sun.color);waterLight62.sky.value.copy(hemi.color);
 return result;
};
const matchedAtlasLightBefore105=outdoorAtlasLight67;
outdoorAtlasLight67=function(){const restore=matchedAtlasLightBefore105(),day=celestial31.day.value,warm=poiLight54.warm.value;
 exactAtlas67.sun?.color.lerp(landscapeColours105.sun,day*(1-warm)*.18);
 if(exactAtlas67.hemi){exactAtlas67.hemi.groundColor.lerp(landscapeColours105.ground,day*.32);exactAtlas67.hemi.intensity*=1+day*.12;}
 return restore;
};
