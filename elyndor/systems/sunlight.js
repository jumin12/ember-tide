// Stable shared sunlight for clouds, canopy shadows, characters and air.
const sunlight56={world:null,key:'',width:0,height:0,frames:0};
const filterCloud56=`
 float filteredCloud56(sampler2D tex,vec2 p,float t,float cover){return cloudField31(tex,p,t,cover)*.5+(cloudField31(tex,p+vec2(5.,3.),t,cover)+cloudField31(tex,p-vec2(5.,3.),t,cover))*.25;}
`;
function filterSunMaterial56(m){
 if(!m?.userData.weatherV12||m.onBeforeCompile.softSun56)return m;
 m.userData.softSun56=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(sh,...args){before.call(this,sh,...args);if(!sh.fragmentShader.includes('float filteredCloud56('))sh.fragmentShader=sh.fragmentShader.replace('return cloudMask31(raw,cover);}','return cloudMask31(raw,cover);}' + filterCloud56);sh.fragmentShader=sh.fragmentShader.replace('cloudField31(cloudTexture,shadowWorld,weatherTime,cloudAmount)','filteredCloud56(cloudTexture,shadowWorld,weatherTime,cloudAmount)');};m.onBeforeCompile.softSun56=true;m.onBeforeCompile.stableCloud43=!!before.stableCloud43;m.customProgramCacheKey=()=>key+'-soft-cloud56';m.needsUpdate=true;return m;
}
const sunlightMaterialBefore56=addCloudLighting;
addCloudLighting=function(m){return filterSunMaterial56(sunlightMaterialBefore56(m));};
const sunlightBudgetBefore56=applyCapabilityBudget;
applyCapabilityBudget=function(...args){const result=sunlightBudgetBefore56(...args);if(!renderer||!sun)return result;const type=THREE.PCFShadowMap;
 if(renderer.shadowMap.type!==type){renderer.shadowMap.type=type;world?.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])m.needsUpdate=true;});}
 return result;
};
const sunlightFitBefore56=fitVisibleShadows;
fitVisibleShadows=function(...args){
 const result=sunlightFitBefore56(...args);if(!player||!world||!shadow36.due||encounter53.active||activeScene?.kind==='interior')return result;
 const c=sun.shadow.camera,macro=activeScene.kind==='overworld',q=sunlight56,key=world.uuid+'|'+camera.aspect.toFixed(3)+'|'+camera.fov+'|'+(state.settings.zoom??1)+'|'+sun.shadow.mapSize.x;
 const requiredX=c.right-c.left,requiredY=c.top-c.bottom;
 if(q.key!==key){q.key=key;q.world=world;q.width=macro?560:128;q.height=macro?400:128;}
 if(requiredX>q.width)q.width=Math.ceil((requiredX+16)/32)*32;if(requiredY>q.height)q.height=Math.ceil((requiredY+16)/32)*32;
 const right=V3().setFromMatrixColumn(c.matrixWorld,0),up=V3().setFromMatrixColumn(c.matrixWorld,1),sx=q.width/sun.shadow.mapSize.x,sy=q.height/sun.shadow.mapSize.y,ox=right.dot(c.position),oy=up.dot(c.position),x=Math.round(((c.left+c.right)*.5+ox)/sx)*sx-ox,y=Math.round(((c.bottom+c.top)*.5+oy)/sy)*sy-oy;
 c.left=x-q.width*.5;c.right=x+q.width*.5;c.bottom=y-q.height*.5;c.top=y+q.height*.5;c.near=.1;c.far=macro?1200:512;c.updateProjectionMatrix();sun.shadow.updateMatrices(sun);viewCoverage.shadowWidth=q.width;viewCoverage.shadowHeight=q.height;q.frames++;return result;
};
const sunlightLightBefore56=updateLighting;
updateLighting=function(...args){const result=sunlightLightBefore56(...args);if(!world||encounter53.active||!usesLandscapeLight54())return result;sun.shadow.radius=activeScene.kind==='overworld'?2.15:2.55;sun.shadow.bias=-.00008;sun.shadow.normalBias=activeScene.kind==='overworld'?.055:.024;return result;};
const sunlightPresentedBefore56=updatePresentedSun43;
updatePresentedSun43=function(...args){const result=sunlightPresentedBefore56(...args);if(usesLandscapeLight54())cloudShadows43.strength.value*=.80;return result;};
// Local scattering volumes are clipped by both canopy and cloud shadows.
buildShafts24=function(){for(const o of world.userData.sunshafts?.beams??[]){o.removeFromParent();o.geometry?.dispose();o.material?.dispose();}if(world.userData.sunshafts)world.userData.sunshafts.beams=[];const group=world.userData.shafts24?.group;if(group){const geometries=new Set(),materials=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material)});group.removeFromParent();for(const g of geometries)g.dispose();for(const m of materials)m.dispose();}world.userData.shafts24=null;atmosphere24.rays=0;buildGapRays56();};
const sunlightBuildBefore56=buildWorld;
buildWorld=function(...args){sunlight56.key='';const result=sunlightBuildBefore56(...args);const seen=new Set();world?.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(!seen.has(m)){seen.add(m);filterSunMaterial56(m);}});return result;};
const sunlightBootBefore56=boot;
boot=async function(...args){const result=await sunlightBootBefore56(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before());q.environmentLight={active:usesLandscapeLight54(),layer:activeScene.kind,hour:+((state.worldMinutes/60%24+24)%24).toFixed(2),key:+sun.intensity.toFixed(3),sky:+hemi.intensity.toFixed(3),fill:+(skyBounce17?.intensity??0).toFixed(3),shafts:air35.frames,shadowSize:sun.shadow.mapSize.x,softClouds:true,stableShadowExtent:[sunlight56.width,sunlight56.height]};return JSON.stringify(q);};return result;};

function buildGapRays56(){
 if(!['poi','overworld'].includes(activeScene?.kind))return;
 const macro=activeScene.kind==='overworld',cell=macro?40:13,seen=new Set(),anchors=[];
 for(const tree of scenery.trees){const ix=Math.floor(tree.x/cell),iz=Math.floor(tree.z/cell),key=ix+','+iz;if(seen.has(key))continue;seen.add(key);const x=tree.x+(macro?5:2.1),z=tree.z+(macro?3:1.4),rand=seeded(Math.imul(ix,73856093)^Math.imul(iz,19349663));anchors.push({x,z,y:heightAt(x,z)+.2,r:.55+rand()*.55});}
 const geometry=new THREE.CylinderGeometry(.65,.65,1,8,1,true);geometry.translate(0,.5,0);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{time:weather.time,cloudMap:weather.cloudMap,cover:weather.cloud,height:weather.height,sun:weather.sun,colour:lighting34.colour,day:celestial31.day,rain:weather.rain,power:{value:0},shadowMatrix:{value:sun.shadow.matrix},shadowMap:{value:null},texel:{value:new THREE.Vector2()}},vertexShader:'varying vec3 world56,radial56;varying vec2 uv56;void main(){uv56=uv;radial56=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*vec3(normal.x,0.,normal.z));world56=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world56,1.);}',fragmentShader:`uniform sampler2D cloudMap,shadowMap;uniform mat4 shadowMatrix;uniform vec2 texel;uniform vec3 sun,colour;uniform float time,cover,height,day,rain,power;varying vec3 world56,radial56;varying vec2 uv56;
 ${CLOUD31}
 ${filterCloud56}
 float depth56(vec4 v){return dot(v,vec4(.000000059371814132,.000015199184417724609,.0038909912109375,.99609375));}
 void main(){vec4 s=shadowMatrix*vec4(world56,1.);vec3 sc=s.xyz/s.w;float lit=1.;if(all(greaterThan(sc,vec3(0.)))&&all(lessThan(sc,vec3(1.)))){lit=0.;for(int j=0;j<4;j++){vec2 o=vec2(float(j-j/2*2),float(j/2))-.5;lit+=smoothstep(sc.z-.0004,sc.z+.0004,depth56(texture2D(shadowMap,sc.xy+o*texel*2.)))*.25;}}
 vec2 source=world56.xz+sun.xz/max(.25,sun.y)*max(0.,height-world56.y);float cloud=exp(-filteredCloud56(cloudMap,source,time,cover)*5.);float rim=pow(max(0.,sin(uv56.x*3.14159265)),1.6),ends=smoothstep(0.,.12,uv56.y)*(1.-smoothstep(.65,1.,uv56.y));float face=.45+.55*pow(max(0.,dot(normalize(world56-cameraPosition),sun)),2.);float fade=1.-smoothstep(80.,360.,distance(world56,cameraPosition));float wall56=pow(abs(dot(normalize(radial56),normalize(cameraPosition-world56))),2.);float a=rim*ends*lit*cloud*day*(1.-rain*.85)*face*fade*wall56*.035;if(a<.0003)discard;gl_FragColor=vec4(colour*min(7.,power)*.32,a);
 }`});
 const group=new THREE.Group();group.userData.dynamicFX=true;group.name='Cloud and canopy filtered sun shafts';world.add(group);const bounds=activeScene.bounds,bins=Array.from({length:12},()=>[]);
 for(const a of anchors){const ix=clamp(Math.floor((a.x-bounds[0])/(bounds[1]-bounds[0])*4),0,3),iz=clamp(Math.floor((a.z-bounds[2])/(bounds[3]-bounds[2])*3),0,2);bins[ix+iz*4].push(a);}
 for(const entries of bins){if(!entries.length)continue;const mesh=new THREE.InstancedMesh(geometry,material,entries.length);mesh.userData={anchors56:entries,dynamicFX:true,persistent27:true};mesh.renderOrder=3;mesh.onBeforeRender=()=>{material.uniforms.shadowMap.value=sun.shadow.map?.texture;material.uniforms.texel.value.set(1/sun.shadow.mapSize.x,1/sun.shadow.mapSize.y);material.uniforms.power.value=sun.intensity;};group.add(mesh);}
 world.userData.gapRays56={group,material,macro,last:V3(99,99,99),dummy:new THREE.Object3D(),anchors:anchors.length};updateGapRays56();
}
function updateGapRays56(){const q=world?.userData.gapRays56;if(!q)return;q.group.visible=usesLandscapeLight54()&&celestial31.day.value>.025;if(!q.group.visible)return;const direction=weather.sun.value;if(q.last.distanceToSquared(direction)<1e-12)return;q.last.copy(direction);const dummy=q.dummy;dummy.quaternion.setFromUnitVectors(axis24,direction);const length=clamp((q.macro?76:32)/Math.max(.35,direction.y),18,q.macro?180:90);
 for(const mesh of q.group.children){mesh.userData.anchors56.forEach((a,i)=>{dummy.position.set(a.x,a.y,a.z);dummy.scale.set(a.r*(q.macro?1.8:1),length,a.r*(q.macro?1.8:1));dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();}}
const gapRayRenderBefore56=render;
render=function(...args){if(usesLandscapeLight54()){updatePresentedSun43();updateGapRays56();}return gapRayRenderBefore56(...args);};
