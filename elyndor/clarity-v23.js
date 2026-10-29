// Render at the display's resolution. A pixel budget is a safety ceiling for
// very large displays, rather than a hidden 1.4-megapixel limit on 1080p.
const clarity23={gpuMs:0,gpuSamples:0,queries:[],pending:null,extension:null,frame:0,budgetRuns:0,reflectionEarlyOuts:0};
resize=function(){
 scenery.pausedTab=null;
 const low=state.settings.quality==='low',limited=softwareBudget(),high=state.settings.quality==='high';
 const budget=limited?600000:high?5500000:3700000;
 const ratio=Math.min(devicePixelRatio,high?1.5:1.25,Math.sqrt(budget/(innerWidth*innerHeight)));
 const scale=limited?Math.min(.8,perf.scale):low?.85:Math.max(.85,perf.scale);
 const w=Math.max(320,Math.round(innerWidth*scale)),h=Math.max(240,Math.round(innerHeight*scale));
 renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);
 post.target.setSize(Math.round(w*ratio),Math.round(h*ratio));
 post.material.uniforms.resolution.value.set(post.target.width,post.target.height);
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 renderer.domElement.style.imageRendering='auto';
};

// Multisample the actual 3D scene, leaving the authored sprite pixels intact.
// The focus pass only softens the outermost lens edge: the playable world stays
// crisp at every depth, including roofs and the opposite end of a bridge.
const clarityPostBefore23=setupPost;
setupPost=function(){
 clarityPostBefore23();
 const gl=renderer.getContext();clarity23.extension=gl.getExtension('EXT_disjoint_timer_query_webgl2');
 post.target.samples=Math.min(4,renderer.capabilities.maxSamples);
 post.material.fragmentShader=`
 uniform sampler2D colorTex,depthTex,bloom22;
 uniform vec2 resolution,nearFar;
 uniform float focus,strength,flash,time,bloomAmount22,night22;
 varying vec2 vUv;
 void main(){
  vec3 col=texture2D(colorTex,vUv).rgb;
  float edge=max(abs(vUv.x-.5),abs(vUv.y-.5));
  float lens=smoothstep(.455,.51,edge)*strength*.22;
  if(lens>.001){vec2 r=vec2(1.4)/resolution;vec3 soft=(texture2D(colorTex,vUv+vec2(r.x,0.)).rgb+texture2D(colorTex,vUv-vec2(r.x,0.)).rgb+texture2D(colorTex,vUv+vec2(0.,r.y)).rgb+texture2D(colorTex,vUv-vec2(0.,r.y)).rgb)*.25;col=mix(col,soft,lens);}
  // A restrained warm highlight grade preserves the greens and blue slate.
  float luminance=dot(col,vec3(.2126,.7152,.0722));
  col=mix(vec3(luminance),col,.98);
  col*=mix(vec3(1.025,1.012,.98),vec3(.97,.995,1.035),night22*.55);
  col+=texture2D(bloom22,vUv).rgb*bloomAmount22*.55;
  float vignette=smoothstep(.39,.77,length((vUv-.5)*vec2(1.,1.08)));
  col*=1.-vignette*.10;col+=flash*.22;
  gl_FragColor=vec4(max(col,vec3(0.)),1.);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;
 post.material.needsUpdate=true;
};

const clarityAssetsBefore23=loadAssets;
loadAssets=async function(){
 await clarityAssetsBefore23();
 const anisotropy=Math.min(16,renderer.capabilities.getMaxAnisotropy());
 // World surfaces filter at grazing angles; sprite atlases retain nearest
 // filtering and their exact padded frame rectangles.
 for(const key of terrainTileNames){const t=textures[key];if(!t)continue;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=anisotropy;t.needsUpdate=true;}
 scenery.surfaceArray.magFilter=THREE.LinearFilter;scenery.surfaceArray.anisotropy=anisotropy;scenery.surfaceArray.needsUpdate=true;
 perf.scale=softwareBudget()?.7:1;
};

// The exploration camera shows real side faces and a diagonal bridge. Battle,
// interior and story shots retain their authored staging.
const clarityCameraBefore23=updateCamera;
const clarityLook23=new THREE.Vector3(),clarityOffset23=new THREE.Vector3(),clarityAxis23=new THREE.Vector3(0,1,0);
updateCamera=function(dt,instant=false){
 if(!player||battle||restoration||activeScene?.kind==='interior'||state.mode==='title')return clarityCameraBefore23(dt,instant);
 const macro=activeScene?.kind==='overworld',zoom=state.settings.zoom??1;
 clarityLook23.set(player.x-.4,heightAt(player.x,player.z)+1.25,player.z-(macro?2.5:3.2));
 clarityOffset23.set(macro?24:13.5,macro?44:25,macro?43:26).multiplyScalar(zoom);
 cameraTarget.lerp(clarityLook23,instant?1:1-Math.exp(-dt*7));
 camera.position.copy(cameraTarget).add(clarityOffset23);camera.fov=macro?37:34;
 camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();
 focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);
 const yaw=Math.atan2(clarityOffset23.x,clarityOffset23.z),pitch=Math.atan2(clarityOffset23.y,Math.hypot(clarityOffset23.x,clarityOffset23.z));
 for(const a of actors){a.mesh.quaternion.setFromAxisAngle(clarityAxis23,yaw);a.mesh.scale.y=1/Math.max(.72,Math.cos(pitch));a.shadow.visible=a.mesh.visible;}
 sideCameraStats.angle=pitch*180/Math.PI;
};

const clarityLightBefore23=updateLighting;
const clarityGold23=new THREE.Color('#fff0cc'),claritySky23=new THREE.Color('#cbdde9'),clarityGround23=new THREE.Color('#8b8764');
updateLighting=function(){
 clarityLightBefore23();if(!player||!world||activeScene.kind==='interior')return;
 const hour=(state.worldMinutes/60%24+24)%24,elevation=Math.sin((hour-6)/12*Math.PI),day=smooth(-.05,.38,elevation),direct=Math.sqrt(Math.max(0,elevation)),rain=weather.rain.value;
 const p=restoration?cameraTarget:player,y=heightAt(p.x,p.z);
 sun.position.set(p.x-32,y+(day>.1?54:64),p.z+28);sun.target.position.set(p.x,y,p.z);
 sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);
 weather.sun.value.copy(sun.position).sub(sun.target.position).normalize();sceneryLight.direction.value.copy(weather.sun.value);
 sun.intensity=mix(.28,4.8,direct)*(1-rain*.40)+weather.lightning*5;
 sun.color.lerp(clarityGold23,day*.5);
 hemi.color.lerp(claritySky23,day*.9);hemi.groundColor.lerp(clarityGround23,day*.8);
 hemi.intensity=mix(.49,1.23,day)*(1-rain*.12);
 if(skyBounce17){skyBounce17.intensity=mix(battle?.65:.23,1.24,day)*(1-rain*.24);skyBounce17.color.set('#e4eced');}
 renderer.toneMappingExposure=mix(1.13,1.17,day);
 sun.shadow.bias=-.00012;sun.shadow.normalBias=.012;sun.shadow.radius=2.5;
 sceneryLight.shadowStrength.value=mix(.16,.27,day);
};

// Hundreds of spatial forest batches use the same shader and global uniforms.
// Share that material instead of building/checking an identical shader for
// every batch on every view. Geometry and per-instance masks remain separate.
const clarityBuildBefore23=buildWorld;
buildWorld=function(...args){
 const r=clarityBuildBefore23(...args);if(world.userData.clarity23)return r;
 const shared=new Map(),depths=new Map(),treeGrid=new Map();
 for(const mesh of scenery.forestMeshes){
  const m=mesh.material,key=m.customProgramCacheKey();
  if(shared.has(key)){mesh.material=shared.get(key);m.dispose();}
  else{
   const before=m.onBeforeCompile;
   m.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=sh.fragmentShader.replace('leafColor.rgb*=vec3(.96,1.16,.98);','float leafLuma23=dot(leafColor.rgb,vec3(.2126,.7152,.0722));leafColor.rgb=mix(vec3(leafLuma23),leafColor.rgb,.64)*vec3(1.14,1.02,.83);');};
   m.customProgramCacheKey=()=>key+'-olive-leaves-v23';m.needsUpdate=true;shared.set(key,m);
  }
  const depth=mesh.customDepthMaterial;
  if(depth){const key=depth.customProgramCacheKey();if(depths.has(key)){mesh.customDepthMaterial=depths.get(key);depth.dispose();}else depths.set(key,depth);}
 }
 for(const m of new Set((world.userData.plantMeshes??[]).map(o=>o.material)))if(m.map===textures.grass)m.color.set('#b9c59b');
 for(const t of scenery.trees){const key=Math.floor(t.x/32)+','+Math.floor(t.z/32);if(!treeGrid.has(key))treeGrid.set(key,[]);treeGrid.get(key).push(t);}
 world.userData.clarity23={treeGrid,nearTrees:[],nearKey:'',hidden:new Set(),sharedForestMaterials:shared.size};
 for(const root of [...world.userData.terrainChunks??[],...world.userData.staticChunks??[],...world.userData.buildings??[],...scenery.forestMeshes,...perf.plants]){
  root.updateMatrixWorld(true);root.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});
 }
 world.updateMatrix();world.matrixAutoUpdate=false;scene.updateMatrix();scene.matrixAutoUpdate=false;
 return r;
};

// Only nearby individual canopies can cover an exploration actor. The old
// cutaway pass visited all 17,597 overworld trees twice per rendered frame.
const clarityCutawayBefore23=updateCutaways;
updateCutaways=function(...args){
 const q=world?.userData.clarity23;if(!q||!player||battle)return clarityCutawayBefore23(...args);
 const key=Math.floor(player.x/16)+','+Math.floor(player.z/16);
 if(q.nearKey!==key){
  q.nearKey=key;const next=[];
  for(let x=Math.floor((player.x-66)/32);x<=Math.floor((player.x+66)/32);x++)for(let z=Math.floor((player.z-66)/32);z<=Math.floor((player.z+66)/32);z++)for(const t of q.treeGrid.get(x+','+z)??[])next.push(t);
  const retained=new Set(next);for(const t of q.nearTrees)if(t.hidden&&!retained.has(t)){t.until=0;hideTree(t,false);}q.nearTrees=next;
 }
 const all=scenery.trees;scenery.trees=q.nearTrees;
 try{return clarityCutawayBefore23(...args);}finally{scenery.trees=all;}
};

// Expensive visibility walks run at 10 Hz with padded branch bounds. Three.js
// still frustum-culls each mesh for every colour, reflection and shadow view.
const clarityBudgetBefore23=updateRenderBudget;
let clarityBudgetWorld23=null,clarityBudgetTime23=-1,clarityBudgetMode23='',clarityBudgetQuality23='';
updateRenderBudget=function(force=false){
 if(!world)return;
 const mode=state.mode+'|'+!!battle,quality=state.settings.quality;
 if(!force&&world===clarityBudgetWorld23&&mode===clarityBudgetMode23&&quality===clarityBudgetQuality23&&clock-clarityBudgetTime23<.1)return;
 clarityBudgetWorld23=world;clarityBudgetTime23=clock;clarityBudgetMode23=mode;clarityBudgetQuality23=quality;clarity23.budgetRuns++;
 return clarityBudgetBefore23(force);
};

// Skip all reflection bookkeeping when no reflective water intersects the view.
// Visible water still receives its reflection on the first visible frame.
const clarityReflectionBefore23=updateReflection;
updateReflection=function(...args){
 if(!world||!player||activeScene.kind==='interior'){clarity23.reflectionEarlyOuts++;return;}
 camera.updateMatrixWorld();liveWaterMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);liveWaterFrustum.setFromProjectionMatrix(liveWaterMatrix);
 const primary=water?.visible&&(world.userData.waterPatches??[]).some(b=>liveWaterFrustum.intersectsBox(b));
 const pools=(world.userData.waterPools??[]).some(p=>p.visible&&p.userData.poolPatches?.some(b=>liveWaterFrustum.intersectsBox(b)));
 if(!primary&&!pools){clarity23.reflectionEarlyOuts++;return;}
 return clarityReflectionBefore23(...args);
};

// Long sessions must not trade sharpness for CPU work. Use non-blocking GPU
// timer queries to identify actual pixel pressure instead of lowering render
// resolution after a quest script, shader warm-up or browser garbage collection.
const clarityGPUSetupBefore23=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){
 const r=await clarityGPUSetupBefore23(...args);
 if(!renderer.userDataClarity23){
  renderer.userDataClarity23=true;const base=renderer.render;
  renderer.render=function(s,c){
   const gl=renderer.getContext(),ext=clarity23.extension;
   const measure=s===scene&&c===camera&&ext&&!clarity23.pending&&clarity23.queries.length<8&&++clarity23.frame%8===0;
   if(measure){clarity23.pending=gl.createQuery();gl.beginQuery(ext.TIME_ELAPSED_EXT,clarity23.pending);}
   let result;try{result=base.call(this,s,c);}finally{if(measure){gl.endQuery(ext.TIME_ELAPSED_EXT);clarity23.queries.push(clarity23.pending);clarity23.pending=null;}}
   if(s===post.scene&&ext&&clarity23.queries.length){const q=clarity23.queries[0];if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)){if(!gl.getParameter(ext.GPU_DISJOINT_EXT)){const ms=gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6;clarity23.gpuMs=clarity23.gpuSamples?mix(clarity23.gpuMs,ms,.12):ms;clarity23.gpuSamples++;}gl.deleteQuery(q);clarity23.queries.shift();}}
   return result;
  };
 }
 return r;
};

loop=function(now){
 requestAnimationFrame(loop);
 if(document.hidden){pacing21.last=now;pacing21.next=now;lastFrame=0;return;}
 const interval=now-pacing21.last;pacing21.last=now;
 if(!pacing21.locked&&interval>3&&interval<25){pacing21.intervals.push(interval);if(pacing21.intervals.length>=45){const sorted=pacing21.intervals.slice().sort((a,b)=>a-b),refresh=sorted[Math.floor(sorted.length*.15)],divisor=Math.max(1,Math.floor(1000/refresh/60));pacing21.period=refresh*divisor;pacing21.locked=true;}}
 if(now+.15<pacing21.next)return;pacing21.next=Math.max(pacing21.next+pacing21.period,now+.1);
 if(!lastFrame)lastFrame=now;const elapsed=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 if(menu){if(scenery.pausedTab!==menu.tab){render();scenery.pausedTab=menu.tab;}return;}
 scenery.pausedTab=null;const live=performance.now()>manualUntil;if(live&&elapsed>0)tick(elapsed);render();
 if(live&&state.settings.quality==='balanced'&&!softwareBudget()&&clarity23.gpuSamples>10){
  pacing21.slow=clarity23.gpuMs>17?pacing21.slow+1:0;pacing21.fast=clarity23.gpuMs<10?pacing21.fast+1:0;
  if(pacing21.slow>180&&perf.scale>.85){perf.scale=Math.max(.85,perf.scale-.05);pacing21.slow=0;resize();}
  else if(pacing21.fast>300&&perf.scale<1){perf.scale=Math.min(1,perf.scale+.05);pacing21.fast=0;resize();}
 }
};
