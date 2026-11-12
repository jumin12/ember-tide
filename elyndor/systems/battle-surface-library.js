// Each arena owns an independently authored native ground surface, decoded
// only behind its encounter cover. All three lighting phases share its pigment.
const SURFACES132={waterfall:.115,woodland:.105,orchard:.110,ruins:.17,cavern:.105,mountain:.115,snow:.10,coast:.105,royalRoad:.18,moonlit:.105,grassMeadow:.11,grassRiver:.11,grassFlowers:.11,grassDowns:.11,grassWindmill:.11,grassAutumn:.11,grassStones:.11,grassHills:.11,grassBirch:.11,grassTwilight:.11};
function groundLight132(b){return b.night||b.spec.cave?.88:b.spec.snow?.82:b.spec.ruins||b.spec.royal?.76:encounter53.phase55==='golden'?.73:.68;}
async function loadStageSurface132(stage){
 const key='stage132_'+stage;if(materials100.cache.has(key))return materials100.cache.get(key);
 if(materials100.pending.has(key))return materials100.pending.get(key);
 const task=(async()=>{const image=await loadImage116('elyndor/assets/source/battle-surfaces-v132/'+stage+'.webp',key),t=new THREE.Texture(image);
  t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.userData={pinnedMap17:true,native100:key};t.needsUpdate=true;materials100.cache.set(key,t);materials100.loads++;return t;
 })();materials100.pending.set(key,task);try{return await task;}catch(e){materials100.pending.delete(key);throw e;}
}
const prepareSurfaceBefore132=preparePainting90;
preparePainting90=async function(stage,phase){
 const result=await prepareSurfaceBefore132(stage,phase),key='stage132_'+stage;
 assets.battleMaterials100.images[key]??={url:'elyndor/assets/source/battle-surfaces-v132/'+stage+'.webp',transparent:false};
 await loadStageSurface132(stage);return result;
};
const legacyGround132=hdGroundMaterial100;
hdGroundMaterial100=function(b){
 const stage=encounter53.selected,key='stage132_'+stage;if(!materials100.cache.has(key))return legacyGround132(b);
 const map=surfaceTexture100(key),m=material59(new THREE.MeshStandardMaterial({map,color:'#ffffff',roughness:b.spec.snow?.94:.91,metalness:0}));
 bindArenaWeather89(m,b);lightPaintedSurface82(m);materialFinish103(m);
 // Keep the new pigment; the generic PBR finisher otherwise substitutes the
 // same meadow mosaic in every arena. Relief derives from this exact surface.
 m.map=map;m.normalMap=null;m.bumpMap=map;m.bumpScale=.065;m.color.setScalar(groundLight132(b));m.envMap=null;
 const before=m.onBeforeCompile,cache=m.customProgramCacheKey();
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);
  const palette=SURFACE_PALETTES132[stage];Object.assign(s.uniforms,{surfaceScale132:{value:SURFACES132[stage]},grassChroma132:{value:new THREE.Vector3(...palette.grassRatio)},soilChroma132:{value:new THREE.Vector3(...palette.soilRatio)}});
  s.vertexShader='varying vec3 surfaceWorld132;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nsurfaceWorld132=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='varying vec3 surfaceWorld132;uniform float surfaceScale132;uniform vec3 grassChroma132,soilChroma132;float relief132;\n'+terrainMath100+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`
   vec2 uv132=surfaceWorld132.xz*surfaceScale132;
   vec3 pigment132=${b.spec.ruins||b.spec.royal?'texture2D(map,uv132).rgb':'terrainSample100(map,uv132)'};
   float turf132=smoothstep(1.01,1.20,pigment132.g/max(.0001,pigment132.r))*smoothstep(1.08,1.38,pigment132.g/max(.0001,pigment132.b));
   pigment132*=mix(vec3(1.),mix(soilChroma132,grassChroma132,turf132),.70);
   relief132=dot(pigment132,vec3(.2126,.7152,.0722));diffuseColor.rgb*=pigment132;
  `);
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>','normal=perturbNormalArb(-vViewPosition,normal,vec2(dFdx(relief132),dFdy(relief132))*.065,faceDirection);');
 };
 m.customProgramCacheKey=()=>cache+'-native-surface132-'+stage;
 m.userData.surface132={stage,key,native:[map.image.width,map.image.height],opaque:true,palette:SURFACE_PALETTES132[stage]};
 return m;
};
const integrateSurfaceBefore132=buildStageScenery59;
buildStageScenery59=function(...args){
 const result=integrateSurfaceBefore132(...args),b=arena88.current;if(!b?.identity125||b.surface132)return result;
 const ground=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),surface=ground?.material.userData.surface132;
 if(surface){ground.material.color.setScalar(groundLight132(b));b.materials100.keys.push(surface.key);b.surface132=surface;}
 const seen=new Set(),palette=SURFACE_PALETTES132[encounter53.selected];
 b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material]){
  if(!m||seen.has(m)||!m.color||m===ground?.material)continue;seen.add(m);
  const foliage=(m.userData.realVegetation103&&m.userData.realVegetation103!=='flowers')||(m.userData.botany104&&!m.userData.trunk104&&!b.spec.autumn),stone=!!m.userData.weathered104;
  if(foliage&&palette.grass)matchProp132(m,palette.grass,.45);else if(stone&&palette.stone)matchProp132(m,palette.stone,.50);
 }});
 if(stageDepth59.summary)stageDepth59.summary.surface132=surface;return result;
};
const textureStudies132=new WeakMap();
function matchProp132(m,target,weight){
 const map=m.map;if(!map?.image||!map.image.width||map.isDataArrayTexture)return;
 let rgb=textureStudies132.get(map);
 if(!rgb){const c=document.createElement('canvas');c.width=c.height=24;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(map.image,0,0,24,24);const pixels=ctx.getImageData(0,0,24,24).data,sum=[0,0,0];let n=0;
  for(let i=0;i<pixels.length;i+=4){if(pixels[i+3]<128)continue;const l=pixels[i]*.2126+pixels[i+1]*.7152+pixels[i+2]*.0722;if(l<30||l>225)continue;for(let j=0;j<3;j++){const v=pixels[i+j]/255;sum[j]+=v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);}n++;}
  if(!n)return;rgb=sum.map(x=>x/n);textureStudies132.set(map,rgb);
 }
 const current=rgb.map((x,i)=>x*m.color[['r','g','b'][i]]),lum=p=>p[0]*.2126+p[1]*.7152+p[2]*.0722,cl=lum(current),tl=lum(target);
 for(let i=0;i<3;i++){const ratio=clamp((target[i]/tl)/Math.max(.001,current[i]/cl),.65,1.55);m.color[['r','g','b'][i]]*=mix(1,ratio,weight);}
 m.userData.backgroundChroma132={target,weight};
}
