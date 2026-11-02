// Runtime owns presentation pacing and simulation time. Rendering may be slower
// than simulation without changing movement speed or the combat timing windows.
class SimulationClock {
  constructor(step=1/60,maxSteps=12){this.step=step;this.maxSteps=maxSteps;this.accumulator=0;this.total=0;this.dropped=0;this.steps=0;}
  reset(){this.accumulator=0;}
  advance(elapsed,update,frameLimit=this.maxSteps){
    if(!Number.isFinite(elapsed)||elapsed<=0)return 0;
    const accepted=Math.min(elapsed,.2);this.dropped+=Math.max(0,elapsed-accepted);this.accumulator+=accepted;let count=0;
    while(this.accumulator+1e-10>=this.step&&count<Math.min(this.maxSteps,frameLimit)){update(this.step);this.accumulator-=this.step;this.total+=this.step;count++;}
    // A suspended tab must never create an unbounded catch-up spiral.
    if(this.accumulator>=this.step){this.dropped+=this.accumulator-this.accumulator%this.step;this.accumulator%=this.step;}
    this.steps=count;return Math.max(0,Math.min(1,this.accumulator/this.step));
  }
}
// A missed refresh already supplies the presentation interval. Counting every
// second callback would skip another refresh after a slow frame on 120/144 Hz.
function presentationDue(now,last,period){return !last||now-last>=Math.max(0,period-.6);}
const simulationClock=new SimulationClock(),runtimeFrames={samples:new Float32Array(512),index:0,count:0,steps:0,paused:true};
const cameraPresentation={world:null,previous:V3(),current:V3(),previousTarget:V3(),currentTarget:V3(),previousRotation:new THREE.Quaternion(),currentRotation:new THREE.Quaternion()};
function resetSimulation(){simulationClock.reset();cameraPresentation.world=null;lastFrame=0;device33.last=0;runtimeFrames.paused=true;}
function captureSimulationPose(){
  const p=cameraPresentation;p.world=world;p.previous.copy(camera.position);p.previousTarget.copy(cameraTarget);p.previousRotation.copy(camera.quaternion);
  for(const a of actors){if(!a.mesh?.parent)continue;a.presentationPrevious??=a.mesh.position.clone();a.presentationPrevious.copy(a.mesh.position);}
}
function renderSimulation(alpha){
  // Camera and party share the same presentation time. At 72/90/144 Hz an
  // uninterpolated camera held the entire landscape on zero-step callbacks.
  const p=cameraPresentation;p.current.copy(camera.position);p.currentTarget.copy(cameraTarget);p.currentRotation.copy(camera.quaternion);
  const interpolate=p.world===world&&p.previous.distanceToSquared(p.current)<64&&p.previousTarget.distanceToSquared(p.currentTarget)<64;
  if(interpolate){camera.position.lerpVectors(p.previous,p.current,alpha);cameraTarget.lerpVectors(p.previousTarget,p.currentTarget,alpha);camera.quaternion.slerpQuaternions(p.previousRotation,p.currentRotation,alpha);camera.updateMatrixWorld();}
  // Pixel animation cells remain discrete; physical movement interpolates.
  for(const a of actors){if(!a.mesh?.parent||!a.presentationPrevious)continue;a.presentationCurrent??=a.mesh.position.clone();a.presentationCurrent.copy(a.mesh.position);if(a.presentationPrevious.distanceToSquared(a.presentationCurrent)<64)a.mesh.position.lerpVectors(a.presentationPrevious,a.presentationCurrent,alpha);}
  try{render();}finally{camera.position.copy(p.current);cameraTarget.copy(p.currentTarget);camera.quaternion.copy(p.currentRotation);camera.updateMatrixWorld();for(const a of actors)if(a.presentationCurrent&&a.mesh?.parent)a.mesh.position.copy(a.presentationCurrent);}
}
function updateDevicePerformance(elapsed,cost,divisor,live){
  device33.cpu=mix(device33.cpu,cost,.06);const gpu=clarity23.gpuSamples?clarity23.gpuMs:0,missed=elapsed*1000>device33.interval*divisor*1.35?elapsed*1000/divisor:0;device33.cost=Math.max(device33.cpu,gpu,missed);
  runtime28.frames++;runtime28.cost=device33.cpu;if(typeof updateMobile33==='function')updateMobile33();
  if(!live||gameLoading||state.mode==='title'||state.settings.quality==='high')return;
  const budget=Math.min(16.1,device33.interval*divisor*.90);device33.slow=device33.cost>budget?device33.slow+elapsed:Math.max(0,device33.slow-elapsed);device33.fast=device33.cost<budget*.60?device33.fast+elapsed:0;
  if(device33.slow>2.2){let changed=false;if(profile33()>0&&state.settings.quality==='balanced'){device33.tier--;device33.profile='';applyCapabilityBudget();updateRenderBudget(true);changed=true;}else if(device33.scale>.6&&(gpu>budget*.85||!clarity23.gpuSamples&&device33.cpu<budget*.70&&missed>budget*1.15)){device33.scale=Math.max(.6,device33.scale-.08);changed=true;}device33.slow=device33.fast=0;if(changed)resizeNow33();}
  else if(device33.fast>24&&device33.scale<1){device33.scale=Math.min(1,device33.scale+.04);device33.fast=0;resizeNow33();}
  else if(state.settings.quality==='balanced'&&device33.fast>36&&device33.tier<(touchDevice33()?1:2)){device33.tier++;device33.profile='';device33.fast=0;resizeNow33();updateRenderBudget(true);}
}
function loop(now){
  requestAnimationFrame(loop);
  if(document.hidden||gameLoading){resetSimulation();keys.clear();return;}
  if(device33.resizeAt&&now>=device33.resizeAt){device33.resizeAt=0;resizeNow33();}
  const gap=device33.last?now-device33.last:16.67;device33.last=now;
  if(gap>3&&gap<24&&device33.samples.length<90){device33.samples.push(gap);if(device33.samples.length===90){const a=device33.samples.slice().sort((a,b)=>a-b);device33.interval=a[Math.floor(a.length*.2)];}}
  const divisor=Math.max(1,Math.floor(1000/device33.interval/59));device33.frame++;if(!presentationDue(now,lastFrame,device33.interval*divisor))return;
  const elapsed=lastFrame?Math.max(0,(now-lastFrame)/1000):0;lastFrame=now;
  const live=performance.now()>manualUntil;
  if(menu||!live){simulationClock.reset();runtimeFrames.paused=true;if(!menu||scenery.pausedTab!==menu.tab){render();scenery.pausedTab=menu?.tab??null;}return;}
  scenery.pausedTab=null;if(runtimeFrames.paused){simulationClock.reset();runtimeFrames.paused=false;render();return;}
  // A long render/driver stall must not schedule twelve expensive ticks and
  // cause the next stall itself. Normal 20+ FPS simulation keeps full speed;
  // exceptional backlog is bounded and reported in dropped time diagnostics.
  const start=performance.now(),alpha=simulationClock.advance(elapsed,dt=>{captureSimulationPose();tick(dt);},4);runtimeFrames.steps=simulationClock.steps;renderSimulation(alpha);
  runtimeFrames.samples[runtimeFrames.index]=elapsed*1000;runtimeFrames.index=(runtimeFrames.index+1)%runtimeFrames.samples.length;runtimeFrames.count=Math.min(runtimeFrames.samples.length,runtimeFrames.count+1);
  updateDevicePerformance(Math.min(elapsed,.2),performance.now()-start,divisor,live);
}
document.addEventListener('visibilitychange',resetSimulation);
window.addEventListener('blur',()=>{keys.clear();resetSimulation();});
