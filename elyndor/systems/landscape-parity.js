// Keep the mill at its original town-side site. Its entrance will face the
// street; a fitted wheel and short axle replace the cross-channel drive shaft.
const millSite109=BROOK.houses.find(h=>h[4]==='mill');millSite109[0]=-154;millSite109[1]=90.5;
const bankBeamBefore109=beam;
beam=function(a,b,...args){
 if(activeScene?.key==='brookstead'&&Math.abs(a.x+169)<.01&&Math.abs(b.x+155)<.01&&a.z===91&&b.z===91&&a.y===4&&b.y===4)return null;
 return bankBeamBefore109(a,b,...args);
};
const bankFenceBefore109=brookFence;
brookFence=function(x,z,xx,zz){if(z===100&&zz===100&&x===-161&&xx===-155)return;return bankFenceBefore109(x,z,xx,zz);};
const narrowerFallBefore109=updateCascadeJoins18;
updateCascadeJoins18=function(q){
 narrowerFallBefore109(q);if(activeScene?.key!=='brookstead')return;
 for(const fall of world.userData.brookFallObjects??[]){const j=fall.userData.join,p=fall.geometry.attributes.position;
  for(let row=0;row<=32;row++){const t=row/32,z=mix(j.z-j.halfSpan,j.z+j.halfSpan,t),pinch=.54+.46*(1-smooth(0,.18,t)+smooth(.84,1,t));for(let col=0;col<13;col++)p.setX(row*13+col,brookChannel(z)+(col/6-1)*(brookWidth(z)+1.05)*pinch-fall.position.x);}
  p.needsUpdate=true;fall.userData.spillWidth109=.54;
 }
};
function riverbank109(){
 if(world.userData.riverbank109)return;
 const g=new THREE.Group();g.name='Brookstead fitted waterworks';world.add(g);
 const mill=world.userData.buildings.find(o=>o.userData.kind==='mill');
 if(mill){
  const f=mill.userData.footprint,x=mill.position.x,z=mill.position.z,y=mill.position.y;
  // A proper masonry plinth closes the small terrain gaps under the cottage.
  const samples=[];for(const dx of[-f.w/2,0,f.w/2])for(const dz of[-f.d/2,0,f.d/2])samples.push(groundAt(x+dx,z+dz));
  const bottom=Math.min(...samples)-.16;
  box(0,(bottom+y+.16)/2-y,0,f.w+.28,y+.16-bottom,f.d+.28,'wall','#b8b9a8',mill);
  const wheel=world.userData.waterwheel;
  // The short horizontal axle terminates at the mill wall, with a bearing.
  if(wheel){const axleY=2.95;wheel.position.set(brookChannel(91)+brookWidth(91)-1.9,axleY,91);wheel.matrixAutoUpdate=true;wheel.updateMatrix();const end=mill.position.x-f.d/2-.12;beam(V3(wheel.position.x,axleY,91),V3(end,axleY,91),.14,'wood','#a08c71',g);box(end,axleY,91,.42,.68,.62,'metal','#7b8584',g);}
 }
 // Follow the dry bank rather than laying a horizontal fence across the brook.
 buildMillRail111(g);
 // Stone shoulders form a real narrower spillway. The sheet fans into the
 // original receiving pool, so neither seam nor river footprint is detached.
 for(const fall of world.userData.brookFallObjects){const j=fall.userData.join,top=j.z===70?6.35:j.z===80?4.75:1.75,bottom=j.z===70?2.65:j.z===80?-.4:-3.7,half=brookWidth(j.z)+1.05,notch=half*.54;
  for(const side of[-1,1]){const width=half-notch+.18,x=brookChannel(j.z)+side*(notch+width/2);box(x,(top+bottom)/2,j.z,width,top-bottom,1.18,'wall','#afb9b0',g);box(x,top+.06,j.z,width+.08,.18,1.31,'wall','#d0d1bd',g);}
 }
 mergeGroup(g);world.userData.riverbank109={millBank:'town',mill:[mill?.position.x,mill?.position.z],fittedFoundation:true,shaftCrossesRiver:false,contourRail:true,spillRatio:.54};
}
// The old boundary ridges were decorative walls over the true terrain. Their
// clipped triangles made the snowy mountains look like green stair steps.
// Natural, traversable relief remains; forest coverage remains as scenery.
const boundaryLandscapeBefore109=buildBoundary46;
buildBoundary46=function(...args){const r=boundaryLandscapeBefore109(...args);if(activeScene?.kind==='overworld'){
 let removed=0;for(const o of [...world.children])if(o.userData.naturalRidge47){o.removeFromParent();o.geometry.dispose();o.material.dispose();removed++;}world.userData.retiredRidges109=removed;
 }return r;};

// Regional outdoor air uses the destination's palette, smoothly weighted
// across travel space. Snow and coast no longer inherit one woodland tint.
const ecologyBefore109=ecology104,airPalette109=new Map(Object.entries(PLACE_ECOLOGY104).map(([k,p])=>[k,new THREE.Color(p.sky)]));
const profile109={name:'Regional travel landscape',flora:'woodland',stone:0,density:.8,mist:1,sky:'#c4dce2'},skyMix109=new THREE.Color();
ecology104=function(){
 if(activeScene?.kind!=='overworld'||!player||perf.building||sceneBuildFilter)return ecologyBefore109();
 const rows=Object.entries(POIS).map(([key,p])=>({key,d:Math.hypot(player.x-p.node[0],player.z-p.node[1])})).sort((a,b)=>a.d-b.d).slice(0,3);
 let total=0,mist=0;skyMix109.setRGB(0,0,0);for(const {key,d}of rows){const p=PLACE_ECOLOGY104[key]??PLACE_ECOLOGY104.fern,w=1/Math.pow(Math.max(12,d),2),c=airPalette109.get(key)??airPalette109.get('fern');total+=w;skyMix109.r+=c.r*w;skyMix109.g+=c.g*w;skyMix109.b+=c.b*w;mist+=p.mist*w;}
 skyMix109.multiplyScalar(1/Math.max(.0001,total));const p=PLACE_ECOLOGY104[rows[0]?.key]??PLACE_ECOLOGY104.fern;
 Object.assign(profile109,{name:'Travel · '+p.name,flora:p.flora,stone:p.stone,mist:mist/Math.max(.0001,total),sky:'#'+skyMix109.getHexString()});return profile109;
};
function climateMaterial109(m,tree=false){
 if(m.userData.climate109)return m;const before=m.onBeforeCompile,key=m.customProgramCacheKey(),climate={value:climateTexture38};m.userData.climate109=true;m.userData.climateTexture109=climate.value;
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.climate109=climate;
  s.vertexShader='varying vec2 climateRoot109;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nclimateRoot109=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xz;');
  s.fragmentShader='uniform sampler2D climate109;varying vec2 climateRoot109;\n'+s.fragmentShader;
  const frost='smoothstep(.25,.8,texture2D(climate109,(climateRoot109+vec2(1024.,576.))/vec2(2048.,1152.)).r)';
  if(tree)s.fragmentShader=s.fragmentShader.replace('snowCover104*snowUp104*.88',frost+'*snowUp104*.88');
  else s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=mix(diffuseColor.rgb,vec3(.73,.80,.83),'+frost+'*.88);');
 };m.customProgramCacheKey=()=>key+'-regional-climate109-'+tree;return m;
}
const regionTreeBefore109=treeMaterial104;
treeMaterial104=function(species,trunk=false,b=null,depth=false){const m=regionTreeBefore109(species,trunk,b,depth);return activeScene?.kind==='overworld'&&!b&&!trunk&&!depth?climateMaterial109(m,true):m;};
const regionPlantsBefore109=vegetationMaterial103;
vegetationMaterial103=function(...args){const m=regionPlantsBefore109(...args);return activeScene?.kind==='overworld'&&!args[1]?climateMaterial109(m):m;};
const parityFinishBefore109=finishWorld102;
finishWorld102=function(...args){const result=parityFinishBefore109(...args);if(!['poi','overworld'].includes(activeScene?.kind))return result;
 // Apply the same material owner to every actual terrain chunk and retained
 // coastal/bridge patch. This audit includes chunks outside the current view.
 const terrain=world.userData.terrainChunks??[];for(const o of terrain)groundMaterial102(o.material);
 world.userData.landscapeParity109={chunks:terrain.length,sharedGround:terrain.every(o=>o.material.userData.ground102&&o.material.userData.matchedData103),nativeFamilies:GROUND102.length,sharedTrees:true,regionalClimate:true,regionalAir:true};return result;
};
const parityWorldBefore109=buildWorld;
buildWorld=function(...args){const r=parityWorldBefore109(...args);if(activeScene?.key==='brookstead')riverbank109();return r;};
// The atlas renders these same physical materials under the same outdoor rig.
// Its wider fog distances are camera-dependent; pigment and exposure are not.
const atlasParityBefore109=outdoorAtlasLight67;
outdoorAtlasLight67=function(){
 const restore=atlasParityBefore109(),day=celestial31.day.value,warm=poiLight54.warm.value;
 // The atlas needs an outdoor rig even when opened from a shop or snowy POI.
 // Apply travel daylight's neutral balance to its own time-sampled lights.
 const neutral=day*(1-warm)*.68,key=exactAtlas67.sun;
 if(key)key.color.lerp(daylight115.sun,neutral);
 if(exactAtlas67.hemi)exactAtlas67.hemi.groundColor.lerp(daylight115.ground,neutral*.52);
 for(const l of exactAtlas67.scene.children)if(l.isDirectionalLight&&l!==key)l.color.lerp(daylight115.bounce,neutral*.66);
 if(key)waterLight62.key.value.copy(key.color);
 if(exactAtlas67.hemi)waterLight62.sky.value.copy(exactAtlas67.hemi.color);
 return restore;
};
