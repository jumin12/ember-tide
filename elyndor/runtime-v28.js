// Display-sized offscreen buffers; a small viewport must not pay for a desktop
// reflection and shadow map. Resizing is idempotent, including browser zoom.
const runtime28={resizes:0,arrivals:0,frames:0,resizeKey:'',budgetKey:'',cost:0};
const capabilityBefore28=applyCapabilityBudget;
applyCapabilityBudget=function(){
 const key=world?.uuid+'|'+state.settings.quality+'|'+innerWidth+'|'+innerHeight+'|'+devicePixelRatio+'|'+softwareBudget();
 if(runtime28.budgetKey===key&&sun.shadow.map)return;
 runtime28.budgetKey=key;capabilityBefore28();
 const high=state.settings.quality==='high',small=Math.min(innerWidth,innerHeight)<650,limited=softwareBudget();
 const shadow=limited?512:high?3072:small?1024:innerWidth<1200?1536:2048;
 if(sun.shadow.mapSize.x!==shadow){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(shadow,shadow);sun.shadow.needsUpdate=renderer.shadowMap.needsUpdate=true;}
 const rw=Math.round(clamp(innerWidth*(high?.85:.6),limited?256:320,high?1280:960));
 if(reflectionTarget.width!==rw)reflectionTarget.setSize(rw,Math.round(rw*9/16));
};
resize=function(){
 scenery.pausedTab=null;
 const low=state.settings.quality==='low',high=state.settings.quality==='high',limited=softwareBudget();
 const ratio=Math.min(devicePixelRatio,high?1.5:innerWidth<1200?1:1.25,Math.sqrt((limited?600000:high?5500000:3700000)/(innerWidth*innerHeight)));
 const scale=limited?Math.min(.8,perf.scale):low?.85:clamp(perf.scale,.8,1),w=Math.max(240,Math.round(innerWidth*scale)),h=Math.max(240,Math.round(innerHeight*scale));
 const key=w+'|'+h+'|'+ratio;
 if(runtime28.resizeKey!==key){runtime28.resizeKey=key;renderer.setPixelRatio(ratio);renderer.setSize(w,h,false);post.target.setSize(Math.round(w*ratio),Math.round(h*ratio));post.material.uniforms.resolution.value.set(post.target.width,post.target.height);runtime28.resizes++;}
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.domElement.style.imageRendering='auto';applyCapabilityBudget();
};

// Present once per browser animation frame. The old estimated-refresh deadline
// could skip a whole refresh after a tiny scheduling delay on otherwise fast
// frames. Simulation uses elapsed seconds, so movement is refresh-independent.
loop=function(now){
 requestAnimationFrame(loop);
 if(document.hidden){lastFrame=0;return;}
 if(!lastFrame)lastFrame=now;
 const elapsed=Math.min((now-lastFrame)/1000,.05);lastFrame=now;
 if(menu){if(scenery.pausedTab!==menu.tab){render();scenery.pausedTab=menu.tab;}return;}
 scenery.pausedTab=null;const live=performance.now()>manualUntil,start=performance.now();
 if(live&&elapsed>0)tick(elapsed);render();runtime28.frames++;runtime28.cost=mix(runtime28.cost,performance.now()-start,.04);
 if(live&&state.settings.quality==='balanced'&&!softwareBudget()&&clarity23.gpuSamples>10){
  pacing21.slow=clarity23.gpuMs>16?pacing21.slow+elapsed:Math.max(0,pacing21.slow-elapsed);
  pacing21.fast=clarity23.gpuMs<8?pacing21.fast+elapsed:0;
  if(pacing21.slow>4&&perf.scale>.8){perf.scale=Math.max(.8,perf.scale-.05);pacing21.slow=pacing21.fast=0;resize();}
  else if(pacing21.fast>15&&perf.scale<1){perf.scale=Math.min(1,perf.scale+.05);pacing21.fast=0;resize();}
 }
};

// A loaded scene owns a fresh party. Never inherit a title-preview hide,
// battle dissolve, clipping range, or a warm-up camera's culling decision.
function settleArrival28(){
 if(!player||battle||state.mode==='title')return;
 for(const a of[player,...followers]){
  if(a.mesh.parent!==world)world.add(a.mesh);if(a.shadow.parent!==world)world.add(a.shadow);
  a.mesh.visible=true;a.mesh.layers.set(0);a.mesh.frustumCulled=false;a.mesh.userData.viewHidden=false;
  a.mesh.geometry.setDrawRange(0,Infinity);a.mesh.material.opacity=1;
  if(a.pixelDissolve)a.pixelDissolve.value=0;a.pixelReleased=false;
  updateActor(a,0);a.mesh.updateMatrixWorld(true);
 }
 // Force the destination view, including occlusion, before removing the loader.
 occlusionCache=null;const q=world.userData.clarity23;if(q)q.nearKey='';
 for(const cut of world.userData.cutaways??[]){cut.until=-1;cut.hidden=false;cut.fade.value=0;for(const m of cut.meshes)m.userData.viewHidden=false;}
 updateCamera(1,true);updateLighting();updateCutaways();updateRenderBudget(true);renderBeforeLoadingGate();runtime28.arrivals++;
}
const warmBefore28=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){const r=await warmBefore28(...args);settleArrival28();return r;};
const transitionBefore28=changeJourneyScene;
changeJourneyScene=async function(...args){const r=await transitionBefore28(...args);if(r){settleArrival28();render();}return r;};
