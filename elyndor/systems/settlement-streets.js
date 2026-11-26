// Street surfaces, planting boundaries and daylight for the four settlements.
const townPaving={highmere:'cobbleRoyal',fern:'cobbleOld',alder:'cobbleOld',harbor:'ruinSlabs101'};
function layTownPaving(key){
 const map=environment102.maps.get(townPaving[key])??textures.cobble,plan=JRPG_LAYOUTS46[key];
 if(!map||!plan)return;
 const materials=new Set(),courts=plan.courts,tiles=new Set(world.userData.terrainChunks??[]);
 const sharedGround=new Set([...tiles].map(o=>o.material));
 // Bridge approaches and the traversal ribbons over a town road share the
 // terrain material but have separate geometry. Give both sides of their seams
 // the identical world-space paving field.
 world.traverse(o=>{if(o.isMesh&&sharedGround.has(o.material)&&o.userData.terrain)tiles.add(o);});
 for(const tile of tiles){
  const m=tile.material;
  for(const g of new Set([tile.geometry,tile.userData.fullGeometry,tile.userData.simpleGeometry,tile.userData.farGeometry].filter(Boolean))){
   if(g.getAttribute('settledGround'))continue;
   const p=g.attributes.position,weights=new Float32Array(p.count);
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i),road=roadInfo(x,z);
    let w=1-smooth(1.45,4.2,road.d);
    for(const [cx,cz,r] of courts)w=Math.max(w,1-smooth(r*.76,r*1.08,Math.hypot(x-cx,z-cz)));
    weights[i]=w;
   }
   g.setAttribute('settledGround',new THREE.Float32BufferAttribute(weights,1));
  }
  if(materials.has(m)||m.userData.districtPaving)continue;
  materials.add(m);m.userData.districtPaving=true;
  const before=m.onBeforeCompile,program=m.customProgramCacheKey();
  m.onBeforeCompile=function(shader,...rest){
   before.call(this,shader,...rest);
   shader.uniforms.districtSetts={value:map};
   shader.uniforms.districtDay=celestial31.day;
   const path=shader.vertexShader.includes('attribute float pathMix')?'max(settledGround,pathMix)':'settledGround';
   shader.vertexShader='attribute float settledGround;varying float pavingCoverage;varying vec3 pavingPosition;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\npavingCoverage=${path};pavingPosition=(modelMatrix*vec4(position,1.)).xyz;`);
   const quay=key==='harbor'?'strength=max(strength,smoothstep(58.,66.,P.y)*(1.-smoothstep(82.8,85.2,P.y))*smoothstep(250.,263.,P.x)*(1.-smoothstep(376.,391.,P.x)));':'';
   shader.fragmentShader='uniform sampler2D districtSetts;uniform float districtDay;varying float pavingCoverage;varying vec3 pavingPosition;\n'+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    vec2 P=pavingPosition.xz;float strength=pavingCoverage;${quay}
    vec2 st=mat2(.985,.174,-.174,.985)*P*.19;
    vec3 setts=texture2D(districtSetts,st).rgb;
    float luminance=dot(setts,vec3(.2126,.7152,.0722));
    vec3 stoneAlbedo=mix(vec3(luminance),setts,.22)*vec3(.81,.87,.94);
    float softness=.035*sin(2.31*P.x+P.y)*sin(2.73*P.y);
    float laid=smoothstep(.06,.94,strength+softness);
    diffuseColor.rgb=mix(diffuseColor.rgb,stoneAlbedo*(.89+.035*sin(P.x*.51+P.y*.23)),laid);
   `).replace('#include <opaque_fragment>',`outgoingLight=mix(outgoingLight,diffuseColor.rgb*vec3(.78,.86,.96),laid*.70*districtDay);\n#include <opaque_fragment>`);
  };m.customProgramCacheKey=()=>program+'-district-paving-'+key;m.needsUpdate=true;
 }
}
const buildBeforeDistrictPaint=buildWorld;
buildWorld=function(...args){
 const result=buildBeforeDistrictPaint(...args);
 const key=activeScene?.key;
 if(townPaving[key])layTownPaving(key);
 return result;
};
function reservedTownGround(x,z,r=0){
 const key=activeScene?.key;if(activeScene?.kind!=='poi'||!['harbor','fern','highmere','alder','depths'].includes(key))return false;
 if(key==='harbor'&&z>=64-r)return true;
 if(key==='depths')return true;
 if(key==='fern'){
  const [gx,gz]=fernCaveDoor;
  // Reserve the whole approach. A tree halfway up the path can hide the
  // stair mouth even when its trunk clears the door itself.
  const along=clamp(z-gz,0,17);
  if(Math.hypot(x-gx,z-gz-along)<4.9+r)return true;
 }
 const plan=JRPG_LAYOUTS46[key];
 if(plan&&plan.courts.some(([cx,cz,radius])=>Math.hypot(x-cx,z-cz)<radius*1.04+r))return true;
 if(roadDistance(x,z)<4.20+r)return true;
 for(const h of world?.userData.buildings??[]){
  const fp=h.userData.footprint;if(!fp||h.parent!==world)continue;
  const dx=x-h.position.x,dz=z-h.position.z,c=Math.cos(h.rotation.y),s=Math.sin(h.rotation.y);
  if(Math.abs(dx*c-dz*s)<fp.w/2+r+.37&&Math.abs(dx*s+dz*c)<fp.d/2+r+.37)return true;
 }
 return false;
}
const treeBeforeTownClearance=buildSolidTree;
buildSolidTree=function(x,z,scale,...args){
 if(reservedTownGround(x,z,Math.min(3.25,2.45*(scale??1))))return null;
 return treeBeforeTownClearance(x,z,scale,...args);
};
const plantBeforeTownClearance=plant;
plant=function(x,z,scale,type,givenY,...rest){
 // Hand-planted window boxes and raised beds have an explicit soil height.
 if(givenY==null&&reservedTownGround(x,z,.16))return;
 return plantBeforeTownClearance(x,z,scale,type,givenY,...rest);
};
const plantsBeforeCaveSteps=buildPlants;
buildPlants=function(...args){
 if(activeScene?.key==='fern'){
  const [x,z]=fernCaveDoor;
  // Some packed grass bypasses plant(). Keep the instance indices used for
  // house cutaways, but omit blades whose roots fall on the stone threshold.
  for(const m of world.userData.plantMatrices?.grassBlades??[]){
   const e=m.elements;
   if(Math.abs(e[12]-x)<=2.28&&e[14]>=z-2.1&&e[14]<=z+1.05)m.makeScale(0,0,0);
  }
 }
 return plantsBeforeCaveSteps(...args);
};
const lightBeforeDistrictPaint=updateLighting;
const districtSun=new THREE.Color('#f1f2ee'),districtSky=new THREE.Color('#d0e0ee'),districtBounce=new THREE.Color('#76816d'),districtHaze=new THREE.Color('#becfd2');
updateLighting=function(...args){
 const result=lightBeforeDistrictPaint(...args);
 if(battle||!townPaving[activeScene?.key])return result;
 const daylight=celestial31.day.value*(1-celestial31.twilight.value);
 sun.color.lerp(districtSun,.70*daylight);
 hemi.color.lerp(districtSky,.48*daylight);hemi.groundColor.lerp(districtBounce,.37*daylight);
 if(scene.fog&&state.settings.weather==='clear')scene.fog.color.lerp(districtHaze,.50*daylight);
 return result;
};
