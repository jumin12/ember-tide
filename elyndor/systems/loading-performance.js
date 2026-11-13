// Build the connected continent only when travel or the atlas requests it.
// Retained-continent still reuses that exact world after its first visit.


async function compileVisible136(){
 if(!renderer.compileAsync)return;
 // Compile against the real HDR target. Compiling against the screen creates
 // a different colour-output program and blocks again on the first draw.
 const target=renderer.getRenderTarget(),clip=renderer.clippingPlanes,visible=new THREE.Group(),empty=new THREE.Scene();
 visible.traverse=fn=>scene.traverseVisible(o=>{if(o.layers.test(camera.layers))fn(o);});visible.traverseVisible=()=>{};
 try{
  if(water?.visible){
   renderer.setRenderTarget(reflectionTarget);renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),-water.position.y-.015)];
   // An empty draw sets Three's clipping state without linking world shaders.
   renderer.render(empty,camera);await renderer.compileAsync(visible,camera,scene);
  }
  renderer.clippingPlanes=clip;renderer.setRenderTarget(post.target);renderer.render(empty,camera);
  await renderer.compileAsync(visible,camera,scene);
 }finally{renderer.clippingPlanes=clip;renderer.setRenderTarget(target);}
}

let worldData136=null;
async function ensureWorldData136(){
 if(BAKED_WORLD36.vegetation64)return;
 if(worldData136)return worldData136;
 worldData136=(async()=>{
  async function read(url,compressed){
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
   try{const response=await fetch(url,{signal:controller.signal});if(!response.ok)throw Error('Could not load the world data. Reload to retry.');
    return compressed?await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).json():await response.json();
   }finally{clearTimeout(timer);}
  }
  let data;
  if(typeof DecompressionStream==='function'){try{data=await read(WORLD_DATA136.gzip,true);}catch{data=await read(WORLD_DATA136.plain,false);}}
  else data=await read(WORLD_DATA136.plain,false);
  if(!data.vegetation64?.trees?.data||!data.vegetation64?.plants||!data.grid?.data)throw Error('Incomplete world data. Reload to retry.');
  Object.assign(BAKED_WORLD36,data);
 })();return worldData136;
}
const assetLoadBefore136=loadAssets;
loadAssets=async function(...args){const [result]=await Promise.all([assetLoadBefore136(...args),ensureWorldData136()]);return result;};

// Link only visible battle materials against their real HDR output. The old
// full-scene compile also linked the hidden town with combat light counts.
function prepareBattlePrograms137(c){
 const old=renderer.getRenderTarget(),visible=new THREE.Group();
 visible.traverse=fn=>c.scene.traverseVisible(o=>{if(o.layers.test(camera.layers))fn(o);});visible.traverseVisible=()=>{};
 try{renderer.setRenderTarget(makeArenaPost89().target);renderer.compile(visible,camera,c.scene);}finally{renderer.setRenderTarget(old);}
}
const coverStartBefore137=startEncounterCover53;
startEncounterCover53=function(phase,duration){
 // Manual tester switches use a brief covered handoff. Selected cinematic
 // camera reveals still run in full; ordinary encounters are unchanged.
 if(devConsole60.active&&devConsole60.running)duration=Math.min(duration,devConsole60.motion==='full'&&phase==='enter'?.35:.14);
 return coverStartBefore137(phase,duration);
};

// Wait for the complete material/crop chain, not only the panorama download.
// Short tester covers must never reveal a partially prepared physical set.
const battleReady137=new Set(),battlePreparing137=new Map(),paintingBefore137=preparePainting90;
preparePainting90=function(stage,phase){
 const key=paintingKey90(stage,phase);if(battlePreparing137.has(key))return battlePreparing137.get(key);
 battleReady137.delete(key);const task=paintingBefore137(stage,phase).then(texture=>{battleReady137.add(key);return texture;}).finally(()=>battlePreparing137.delete(key));battlePreparing137.set(key,task);return task;
};
const battleCoverBefore137=advanceEncounterCover53;
advanceEncounterCover53=function(dt){
 const c=encounter53;if(c.phase==='enter'&&!c.swapped&&!battleReady137.has(paintingKey90(c.selected,battlePhase55()))&&c.time+dt>c.duration*.44){if(c.time<c.duration*.44)battleCoverBefore137(c.duration*.44-c.time);return;}
 return battleCoverBefore137(dt);
};
