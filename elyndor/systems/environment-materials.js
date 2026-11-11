// Regenerated environment art and its matched PBR data share ownership across
// the overworld, locations and battles. Character and UI assets are untouched.
const envPbr103={maps:new Map(),pending:new Map(),data:new Map(),surfaceData:null,ready:false};
for(const key of ['panel29','rug29','door','window','crateFace','barrelStave','innSign','shopSign','forgeSign'])if(!terrainTileNames.includes(key))terrainTileNames.push(key);
const normalBasis103=`vec3 dataNormal103(vec3 p,vec3 n,vec2 uv,vec3 detail){vec3 dx=dFdx(p),dy=dFdy(p);vec2 du=dFdx(uv),dv=dFdy(uv);vec3 t=dx*dv.y-dy*du.y,b=-dx*dv.x+dy*du.x;float k=inversesqrt(max(.00000001,max(dot(t,t),dot(b,b))));return normalize(mat3(t*k,b*k,n)*normalize(vec3(detail.xy*.32,detail.z)));}`;
function dataArray103(keys){const size=mobileStartup116()?256:512,data=new Uint8Array(size*size*4*keys.length),c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});keys.forEach((k,i)=>{ctx.clearRect(0,0,size,size);const t=envPbr103.maps.get(k+':normalRough');if(t)ctx.drawImage(t.image,0,0,size,size);else{ctx.fillStyle='rgba(128,128,255,0.95)';ctx.fillRect(0,0,size,size)}data.set(ctx.getImageData(0,0,size,size).data,i*size*size*4)});const t=new THREE.DataArrayTexture(data,size,size,keys.length);Object.assign(t,{colorSpace:THREE.NoColorSpace,wrapS:THREE.RepeatWrapping,wrapT:THREE.RepeatWrapping,magFilter:THREE.LinearFilter,minFilter:THREE.LinearMipmapLinearFilter,generateMipmaps:true,needsUpdate:true});return t;}
const source103=key=>assets.environment103.images[key];
function canonical103(key){return assets.environment103.aliases[key]??key}
async function texture103(key,dataKind=null){
 const id=key+':'+(dataKind??'albedo');if(envPbr103.maps.has(id))return envPbr103.maps.get(id);if(envPbr103.pending.has(id))return envPbr103.pending.get(id);
 const work=(async()=>{const row=source103(key);if(!row)throw Error('Missing environment art '+key);const url=dataKind?row.pbr[dataKind].gpu:row.url;
  if(!dataKind){for(const [alias,t]of Object.entries(textures))if(assets.images[alias]===url&&t?.image?.width){t.userData.shared103=true;t.userData.canonical103=key;envPbr103.maps.set(id,t);return t;}}
  let image=await loadImage116(url,key);const cap=mobileStartup116()?(dataKind?256:512):Infinity;if(Math.max(image.width,image.height)>cap){const scale=cap/Math.max(image.width,image.height),c=document.createElement('canvas');c.width=Math.max(1,Math.round(image.width*scale));c.height=Math.max(1,Math.round(image.height*scale));c.getContext('2d').drawImage(image,0,0,c.width,c.height);image.src='';image=c;}const t=new THREE.Texture(image);t.colorSpace=dataKind?THREE.NoColorSpace:THREE.SRGBColorSpace;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.wrapS=t.wrapT=row.transparent?THREE.ClampToEdgeWrapping:THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;t.userData={pinnedMap17:true,shared103:true,canonical103:key,data103:dataKind};envPbr103.maps.set(id,t);return t;
 })();envPbr103.pending.set(id,work);return work;
}
// Earlier loaders call these by name, so they already reuse the base decoder.
loadSurface100=async function(key){if(materials100.cache.has(key))return materials100.cache.get(key);const t=await texture103(key);materials100.cache.set(key,t);materials100.loads++;return t;};
loadWorldSurface102=async function(key){if(environment102.maps.has(key))return environment102.maps.get(key);const t=await texture103(key);environment102.maps.set(key,t);environment102.loads++;return t;};
// GPU arrays use a bounded sampling budget. Native HD master files are retained
// at full resolution; phone arrays are reduced without enlarging any source.
worldArray102=function(keys){
 const maps=keys.map(k=>environment102.maps.get(k)),cap=mobileStartup116()?384:1024,size=Math.min(cap,Math.max(...maps.map(t=>Math.max(t.image.width,t.image.height)))),data=new Uint8Array(size*size*4*keys.length),c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});
 maps.forEach((t,i)=>{ctx.clearRect(0,0,size,size);ctx.drawImage(t.image,0,0,size,size);data.set(ctx.getImageData(0,0,size,size).data,i*size*size*4);if(keys===GROUNDCOVER102){environment102.coverRects??=[];environment102.coverRects[i]=new THREE.Vector4(0,0,1,1)}});
 const t=new THREE.DataArrayTexture(data,size,size,keys.length);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;t.userData={pinnedMap17:true,world102:true,pbr103:true};return t;
};
const environmentLoadBefore103=loadAssets;
loadAssets=async function(...args){const r=await environmentLoadBefore103(...args);
 for(const [key,target]of Object.entries(assets.environment103.aliases)){if(target.startsWith('@'))continue;const t=await texture103(target);textures[key]=t;surface67.byMap.set(t,key)}
 // Every opaque atlas family receives the actual native replacement, including
 // book bindings, pottery, textiles, signs, metals and glass.
 const unique=[...new Set(terrainTileNames.map(canonical103).filter(k=>source103(k)&&!source103(k).transparent))];SURFACES102.splice(0,SURFACES102.length,...unique);
 for(let i=0;i<unique.length;i+=4)await Promise.all(unique.slice(i,i+4).map(loadWorldSurface102));
 environment102.surfaces.dispose();environment102.surfaces=worldArray102(SURFACES102);
 const size=mobileStartup116()?256:512,pixels=new Uint8Array(size*size*4*unique.length),c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});
 for(let i=0;i<unique.length;i++){const row=source103(unique[i]);ctx.fillStyle='rgba(128,128,255,0.94)';ctx.fillRect(0,0,size,size);if(row.pbr){const t=await texture103(unique[i],'normalRough');ctx.drawImage(t.image,0,0,size,size)}pixels.set(ctx.getImageData(0,0,size,size).data,i*size*size*4);if(i%4===0)await yieldLoad36()}
 envPbr103.surfaceData=new THREE.DataArrayTexture(pixels,size,size,unique.length);Object.assign(envPbr103.surfaceData,{colorSpace:THREE.NoColorSpace,wrapS:THREE.RepeatWrapping,wrapT:THREE.RepeatWrapping,magFilter:THREE.LinearFilter,minFilter:THREE.LinearMipmapLinearFilter,generateMipmaps:true,needsUpdate:true});pinMapResource17(envPbr103.surfaceData);
 for(const k of ['waveHeight103','foam103','caustics103','botanicalLeaf102','pineNeedles103','petal102'])await texture103(k);
 await texture103('waveHeight103','normalRough');await Promise.all(GROUND102.map(k=>texture103(k,'normalRough')));envPbr103.groundData=dataArray103(GROUND102);pinMapResource17(envPbr103.groundData);envPbr103.ready=true;return r;
};
surfaceLayer102=key=>SURFACES102.indexOf(canonical103(key));
const atlasPbrBefore103=staticAtlasMaterial;
staticAtlasMaterial=function(...args){const m=atlasPbrBefore103(...args);if(m.userData.environment103)return m;m.userData.environment103=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.surfaceNR103={value:envPbr103.surfaceData};s.uniforms.surfaceFinish103={value:terrainTileNames.map(k=>{const f=source103(canonical103(k))?.finish??{roughness:.95,metalness:0,relief:.1,reflective:false};return new THREE.Vector4(f.roughness,f.metalness,f.relief,f.reflective?1:0)})};s.fragmentShader='uniform highp sampler2DArray surfaceNR103;uniform vec4 surfaceFinish103['+terrainTileNames.length+'];\n'+s.fragmentShader;
  const marker='if(norm28>.00000001){float inv28=inversesqrt(norm28);normal=normalize(mat3(s28*inv28,t28*inv28,normal)*tangent28);}';
  s.fragmentShader=s.fragmentShader.replace(marker,`${marker}if(hdLayer102>-.5){vec4 nr103=texture(surfaceNR103,vec3(vSurfaceUV*surfaceScale102[int(floor(vTile+.5))],hdLayer102));vec3 nn103=nr103.rgb*2.-1.;float inv103=inversesqrt(max(.00000001,norm28));normal=normalize(mat3(s28*inv103,t28*inv103,normal)*normalize(vec3(nn103.xy*.45,nn103.z)));}`);
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_begin>',`vec4 finish103=surfaceFinish103[int(floor(vTile+.5))];if(hdLayer102>-.5){roughnessFactor=texture(surfaceNR103,vec3(vSurfaceUV*surfaceScale102[int(floor(vTile+.5))],hdLayer102)).a;metalnessFactor=finish103.y;}
  #include <lights_fragment_begin>`);
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectSpecular*=surfaceFinish103[int(floor(vTile+.5))].w;');
 };m.customProgramCacheKey=()=>key+'-complete-native-pbr103';return m;
};
function materialFinish103(m){
 if(!m?.isMeshStandardMaterial||m.userData.pbr103||m.userData.water62||m.userData.ground102||m.userData.blend100||m.userData.environment103||m.userData.naturalCover102||m.userData.botany102)return;
 const key=m.map?.userData.canonical103??canonical103(m.userData.textureKey??m.userData.surface67),row=source103(key);if(!row)return;const f=row.finish;m.userData.pbr103={key,...f};m.roughness=f.roughness;m.metalness=f.metalness;m.envMap=f.reflective?(activeScene.kind==='interior'?surface67.indoor:surface67.outdoor):null;
 if(row.pbr){const nr=envPbr103.maps.get(key+':normalRough');if(nr){m.normalMap=nr;m.normalScale.setScalar(.32)}}
 m.needsUpdate=true;
}
const finishEnvironmentBefore103=finishWorld102;
finishWorld102=function(){finishEnvironmentBefore103();if(!envPbr103.ready)return;const actorMats=new Set(actors.map(a=>a.mesh.material));world.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(!actorMats.has(m))materialFinish103(m)});world.userData.environment103={allEnvironmentRegenerated:true,nativeMaterials:Object.keys(assets.environment103.images).length,matchedPbr:true,actorsPreserved:true,uiPreserved:true};};
// Flow coordinates, shoreline depths and reflection ownership remain shared
// across the level and its horizon water. No second material at the boundary.
const waterPbrBefore103=waterMaterial62;
waterMaterial62=function(...args){const m=waterPbrBefore103(...args),before=m.onBeforeCompile,key=m.customProgramCacheKey();m.metalness=0;m.userData.waterPbr103=true;
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);Object.assign(s.uniforms,{waveNR103:{value:envPbr103.maps.get('waveHeight103:normalRough')},foamArt103:{value:envPbr103.maps.get('foam103:albedo')},causticArt103:{value:envPbr103.maps.get('caustics103:albedo')}});s.fragmentShader='uniform sampler2D waveNR103,foamArt103,causticArt103;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('float foamGrain62=noise62(stream62*2.8+vec2(0.,time62*.12));','float foamArt103Value=texture2D(foamArt103,stream62*.32).r;float foamGrain62=mix(noise62(stream62*2.8+vec2(0.,time62*.12)),foamArt103Value,.72);');
  s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb*=body62;',`float caustic103=texture2D(causticArt103,worldWater62.xz*.25-current62*time62*.06).r;body62+=vec3(.015,.045,.035)*caustic103*shallow62*day62;diffuseColor.rgb*=body62;`);
  s.fragmentShader=s.fragmentShader.replace('vec3 fineN62=vec3(waveX62,0.,waveZ62);',`vec3 waveA103=texture2D(waveNR103,stream62*.16).rgb*2.-1.,waveB103=texture2D(waveNR103,mat2(.8,-.6,.6,.8)*worldWater62.xz*.11+current62*time62*.04).rgb*2.-1.;waveX62=waveA103.x*.65+waveB103.x*.28;waveZ62=waveA103.y*.65+waveB103.y*.28;vec3 fineN62=vec3(waveX62,0.,waveZ62);`);
  s.fragmentShader=s.fragmentShader.replace('vec3(.009,.068,.115)','vec3(.008,.037,.095)').replace('vec3(.035,.21,.18)','vec3(.025,.14,.17)').replace('edge62*smoothstep(.39,.72,foamGrain62)*.36','edge62*smoothstep(.05,.20,foamGrain62)*.42');
 };m.customProgramCacheKey=()=>key+'-physical-flow103';return m;
};
const paintingPbrBefore103=preparePainting90;
preparePainting90=async function(stage,phase){const r=await paintingPbrBefore103(stage,phase);await Promise.all([...new Set([...profile100(stage).slice(0,5),...referenceExtras101(stage)])].filter(k=>source103(k)?.pbr).map(k=>texture103(k,'normalRough')));return r;};
const terrainPbrBefore103=groundMaterial102;
groundMaterial102=function(m){terrainPbrBefore103(m);if(!m?.userData.ground102||m.userData.matchedData103)return;m.userData.matchedData103=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);const macro=/varying\s+vec3\s+terrainWorld\b/.test(s.fragmentShader),local=/varying\s+vec3\s+vGround\b/.test(s.fragmentShader);if(!macro&&!local){s.fragmentShader=s.fragmentShader.replace(/vec2 groundUv67=[\s\S]*?detailN67\);/,'');return;}s.uniforms.groundNR103={value:envPbr103.groundData};s.fragmentShader='uniform highp sampler2DArray groundNR103;\n'+normalBasis103+s.fragmentShader;const p=macro?'terrainWorld':'vGround',road=macro?(s.fragmentShader.includes('float connectedRoadBlend71()')?'connectedRoadBlend71()':'groundRoad'):'vGroundBlend.x';s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_begin>',`vec2 dataUv103=${p}.xz*.26;float trail103=clamp(${road},0.,1.);vec4 fieldNR103=mix(texture(groundNR103,vec3(dataUv103,0.)),texture(groundNR103,vec3(dataUv103*1.14,2.)),trail103);normal=dataNormal103(-vViewPosition,normal,dataUv103,fieldNR103.rgb*2.-1.);roughnessFactor=clamp(fieldNR103.a,.83,.99);
 #include <lights_fragment_begin>`);};m.customProgramCacheKey=()=>key+'-matched-data103';m.needsUpdate=true;};
const battleGroundBefore103=hdGroundMaterial100;
hdGroundMaterial100=function(b){const m=battleGroundBefore103(b),keys=profile100().slice(0,4),data=dataArray103(keys);b.ownedTextures.push(data);const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.groundNR103={value:data};s.fragmentShader='uniform highp sampler2DArray groundNR103;\n'+normalBasis103+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_begin>',`vec4 fieldNR103=mix(mix(texture(groundNR103,vec3(uv100*groundDetailScales100.x,0.)),texture(groundNR103,vec3(uv100*groundDetailScales100.y+3.7,1.)),secondary100),texture(groundNR103,vec3(uv100*groundDetailScales100.z+7.1,2.)),worn100);fieldNR103=mix(fieldNR103,texture(groundNR103,vec3(uv100*groundDetailScales100.w+11.3,3.)),grit100);normal=dataNormal103(-vViewPosition,normal,uv100,fieldNR103.rgb*2.-1.);roughnessFactor=clamp(fieldNR103.a,.82,.99);
 #include <lights_fragment_begin>`);};m.customProgramCacheKey=()=>key+'-matched-data103';return m;};
const battleMaterialPbrBefore103=arenaMaterial88;
arenaMaterial88=function(...args){const m=battleMaterialPbrBefore103(...args);const key=args[1]?.replace(/^material100_/,'');if(source103(key))m.userData.textureKey=key;materialFinish103(m);return m;};
const stagePbrBefore103=buildStageScenery59;
buildStageScenery59=function(...args){const r=stagePbrBefore103(...args),b=arena88.current;if(b){b.group.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])materialFinish103(m)});b.pbr103={native:true,sceneSpecific:true};}return r;};

// Preserve pigment and recesses instead of washing the new materials out at
// noon. Warm direct light is balanced by a cooler, weaker sky hemisphere.
const daylightBefore103=updateLighting;
updateLighting=function(...args){const r=daylightBefore103(...args);if(!world||!sun||!hemi||encounter53.active)return r;
 if(usesLandscapeLight54()){const day=poiLight54.day.value;sun.intensity*=mix(.96,.74,day);hemi.intensity*=mix(.90,.73,day);if(skyBounce17)skyBounce17.intensity*=.76;renderer.toneMappingExposure*=mix(.97,.94,day);hemi.groundColor.multiplyScalar(.84);lighting34.foliage.value*=.60;}
 return r;
};
const roomArtBefore103=roomMaterial29;
roomMaterial29=function(key,color,opts={}){if(!['rug29','panel29'].includes(key))return roomArtBefore103(key,color,opts);const m=new THREE.MeshStandardMaterial({map:textures[key],color:key==='rug29'?'#ffffff':'#e7d7c1',roughness:key==='rug29'?.98:.88,metalness:0,side:THREE.DoubleSide,...opts});m.userData={textureKey:key,surface67:key,nativeRoom103:true};addCloudLighting(m);lightPaintedSurface82(m);materialFinish103(m);return m;};
