// Cloud transmission and physical shadows share the party's presentation time.
// Updating solar projection only on the HUD's 20-tick cadence made broad cloud
// shadows hold still and then jump, especially below a low afternoon sun.
const cloudShadows43={sun:V3(),moon:V3(),previous:V3(),strength:{value:.6},frames:0};
function updatePresentedSun43(){
 if(!player||!world||gameLoading||activeScene?.kind==='interior')return;
 const hour=(state.worldMinutes/60%24+24)%24,a=(hour-6)*Math.PI/12,q=cloudShadows43;
 q.sun.set(Math.cos(a),Math.sin(a),.58).normalize();q.moon.copy(q.sun).negate();const source=q.sun.y>0?q.sun:q.moon;
 q.strength.value=.62*smooth(.10,.30,source.y)*(q.sun.y>0?1:.22);
 celestial31.sun.value.copy(q.sun);celestial31.moon.value.copy(q.moon);weather.sun.value.copy(source);sceneryLight.direction.value.copy(source);
 const p=restoration?cameraTarget:player.mesh.position,y=heightAt(p.x,p.z);
 sun.target.position.set(p.x,y,p.z);sun.position.copy(source).multiplyScalar(activeScene.kind==='overworld'?Math.max(95,camera.position.distanceTo(cameraTarget)+100):95).add(sun.target.position);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);
 if(q.previous.distanceToSquared(source)>1e-12){shadow36.last=-100;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;q.previous.copy(source);}
 q.frames++;
}
const stableCloudMaterialBefore43=addCloudLighting;
function stableCloudMaterial43(m){
 if(!m?.userData.weatherV12||m.onBeforeCompile.stableCloud43)return m;
 m.userData.stableCloudShadow43=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(sh,...args){
  before.call(this,sh,...args);sh.uniforms.cloudStrength43=cloudShadows43.strength;
  sh.fragmentShader=(sh.fragmentShader.includes('uniform float cloudStrength43;')?'':'uniform float cloudStrength43;\n')+(sh.fragmentShader.includes('float cloudField31(')?'':CLOUD31+'\n')+sh.fragmentShader;
  // A broad penumbra filters the moving density boundary without blurring the
  // player's real shadow map or darkening ambient skylight and local lamps.
  sh.fragmentShader=sh.fragmentShader.replace('smoothstep(edge,edge+.22,raw)','smoothstep(edge-.025,edge+.30,raw)').replace(/max\(\.(?:12|35),cloudSun.y\)/g,'max(.25,cloudSun.y)').replace('cloudAmount)*.82*weatherExterior','cloudAmount)*cloudStrength43*weatherExterior');
  // Water's final shader recipe was replacing the earlier cloud decorator.
  // Upgrade that legacy path too, after the water builder has finished.
  sh.fragmentShader=sh.fragmentShader.replace(/float cloudShade=1\.-smoothstep\(\.05,\.85,cloudDensity\)\*cloudAmount\*\.(?:48|70)\*weatherExterior;/,'float cloudShade=1.-cloudField31(cloudTexture,shadowWorld,weatherTime,cloudAmount)*cloudStrength43*weatherExterior;').replace('outgoingLight*=cloudShade;','outgoingLight=max(vec3(0.),outgoingLight-(reflectedLight.directDiffuse+reflectedLight.directSpecular)*(1.-cloudShade));');
 };
 m.onBeforeCompile.stableCloud43=true;m.onBeforeCompile.softSun56=!!before.softSun56;
 m.customProgramCacheKey=()=>key+'-stable-cloud-shadows43';m.needsUpdate=true;return m;
}
addCloudLighting=function(m){stableCloudMaterialBefore43(m);return stableCloudMaterial43(m);};
const stableCloudBuildBefore43=buildWorld;
buildWorld=function(...args){
 const result=stableCloudBuildBefore43(...args),seen=new Set();
 for(const root of[world,macroMap17.scene])root?.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(!seen.has(m)){seen.add(m);stableCloudMaterial43(m);}});
 return result;
};
const stableCloudRenderBefore43=render;
render=function(...args){updatePresentedSun43();return stableCloudRenderBefore43(...args);};
