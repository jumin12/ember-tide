// Standard materials compile a different program for every light count. Keep
// the native lights and pad empty slots with zero-energy lights, so travelling
// between a town, shrine and continent does not relink the entire renderer.
// Twelve is the audited maximum across the current fifteen destinations.
const stableLightBuildBefore64=buildWorld;
const shaderSourceOwners64=new Map();
function retainShaderSources64(){
 const materials=new Set();world.traverse(o=>{for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m?.isShaderMaterial)materials.add(m);});
 for(const m of materials){
  const key=m.vertexShader+'\n/*fragment*/\n'+m.fragmentShader;
  if(shaderSourceOwners64.has(key)||shaderSourceOwners64.size>=128)continue;
  // Three releases a custom shader's source ID with its last material, even
  // when its GL program is pinned. A source-only owner keeps that ID stable.
  // Never retain scene uniforms, textures, actors, meshes or callback closures.
  const owner=new THREE.ShaderMaterial({vertexShader:m.vertexShader,fragmentShader:m.fragmentShader,defines:{...m.defines},uniforms:Object.fromEntries(Object.keys(m.uniforms).map(k=>[k,{value:null}])),lights:m.lights,glslVersion:m.glslVersion});
  owner.extensions={...m.extensions};const mesh=new THREE.Mesh(sharedGeo.box??new THREE.BoxGeometry(1,1,1),owner);
  renderer.compile(mesh,camera,scene);for(const u of Object.values(owner.uniforms))u.value=null;
  if(!sharedGeo.box)mesh.geometry.dispose();shaderSourceOwners64.set(key,owner);
 }
}
buildWorld=function(...args){
 const result=stableLightBuildBefore64(...args);let points=0;
 scene.traverse(o=>{if(o.isPointLight&&o.visible)points++;});
 for(let i=points;i<12;i++){const light=new THREE.PointLight('#000000',0,1,2);light.userData.emptySlot64=true;world.add(light);}
 retainShaderSources64();
 return result;
};
pinPrograms36=function(){for(const program of renderer.info.programs??[]){if(sceneProgramKeepers.has(program))continue;if(sceneProgramKeepers.size>=512)break;if(typeof program.usedTimes==='number'){program.usedTimes++;sceneProgramKeepers.set(program,true);}}};
const destinationWarm64={ready:false,scenes:[],programs:0};
async function warmDestinationPrograms64(){
 if(destinationWarm64.ready)return;
 const saved={scene:state.scene,mode:state.mode,spawn:[player.x,player.z],focus:title19.focus};
 try{
  state.mode='explore';
  // These are the distinct continent, canvas camp, crystal/cave, city and
  // winter material families. Other destinations reuse their shader variants.
  for(const id of['overworld','patrol','depths','highmere','snow']){
   setLoadStage36(.98,'Preparing reusable destination graphics…');await yieldLoad36();
   buildWorld(id);updateCamera(1,true);updateLighting();updateRenderBudget(true);
   const p=camera.position.clone().addScaledVector(camera.getWorldDirection(V3()),2),representatives=makeWarmRepresentatives36(p),target=renderer.getRenderTarget(),clip=renderer.clippingPlanes;
   for(const m of representatives)scene.add(m);
   try{
    renderer.setRenderTarget(post.target);
    if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
    renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),1.4)];
    if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
    renderer.clippingPlanes=clip;renderer.setRenderTarget(target);renderBeforeLoadingGate();pinPrograms36();
   }finally{
    renderer.clippingPlanes=clip;renderer.setRenderTarget(target);
    for(const m of representatives){m.removeFromParent();if(m.isInstancedMesh&&!m.userData.borrowedInstances36)m.dispose();}
   }
   const gl=renderer.getContext();if(gl.fenceSync){const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();try{while(gl.clientWaitSync(fence,0,0)===gl.TIMEOUT_EXPIRED)await yieldLoad36();}finally{gl.deleteSync(fence);}}
   destinationWarm64.scenes.push(id);await yieldLoad36();
  }
  destinationWarm64.ready=true;destinationWarm64.programs=sceneProgramKeepers.size;
 }finally{
  state.mode=saved.mode;title19.focus=saved.focus;buildWorld(saved.scene,saved.spawn);
  updateCamera(1,true);updateLighting();updateRenderBudget(true);renderBeforeLoadingGate();pinPrograms36();loading36.readyWorld=world;
 }
}
const destinationGraphicsBefore64=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){
 const result=await destinationGraphicsBefore64(...args);
 if(loading36.booting&&!destinationWarm64.ready)await warmDestinationPrograms64();
 return result;
};
