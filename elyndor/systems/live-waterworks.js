// A working undershot mill: radial paddles cross the real river surface, and
// water, wheel, planar mirrors and their shadows use this presented frame.
const mill111={world:null,angle:0,previous:0,speed:0,wake:{value:new THREE.Vector4()},contact:{value:new THREE.Vector3()},spray:null};
function wheelPit111(x,z,y){
 const center=brookChannel(91)+brookWidth(91)-1.9,r=Math.max(Math.abs(x-center)/1.65,Math.abs(z-91)/3.15);if(r>=1)return y;return mix(y,Math.min(y,.25),1-smooth(.70,1,r));
}
const millGroundBefore111=groundAt;
groundAt=function(x,z,...args){const y=millGroundBefore111(x,z,...args);return activeScene?.key==='brookstead'?wheelPit111(x,z,y):y;};
// The cottage's terrain grading used to fill the channel around its wheel.
// Cut a small wheelpit in the actual riverbed, leaving the bank and mill alone.
const millSeatingBefore111=seatTerrain45;
seatTerrain45=function(...args){const r=millSeatingBefore111(...args);if(activeScene?.key!=='brookstead'||world.userData.wheelPit111)return r;
 const point=V3(),inverse=new THREE.Matrix4(),seen=new Set();let changed=0;
 for(const m of world.userData.terrainChunks??[]){m.updateMatrixWorld(true);inverse.copy(m.matrixWorld).invert();for(const g of new Set([m.geometry,m.userData.fullGeometry].filter(Boolean))){if(seen.has(g))continue;seen.add(g);const p=g.attributes.position;let dirty=false;
  for(let i=0;i<p.count;i++){point.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);const y=wheelPit111(point.x,point.z,point.y);if(y>=point.y-.00001)continue;point.y=y;point.applyMatrix4(inverse);p.setXYZ(i,point.x,point.y,point.z);dirty=true;changed++;}
  if(dirty){p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();}
 }}delete world.userData.terrainSampler64;heightCache41.cells.clear();world.userData.wheelPit111={vertices:changed,floor:.25};return r;};
function groundTriangle111(x,z){
 const ray=new THREE.Raycaster(V3(x,500,z),V3(0,-1,0),0,1000),hits=ray.intersectObjects(world.userData.terrainChunks??[],false);return hits[0]?.point.y??groundAt(x,z);
}
function buildMillRail111(parent){
 world.updateMatrixWorld(true);const posts=[],records=[];
 for(let i=0;i<=8;i++){
  const z=96.25+i*1.1;let x=brookChannel(z)+brookWidth(z)+mix(1.4,2.5,smooth(96,101,z)),samples;
  const sample=()=>[-.145,0,.145].flatMap(dx=>[-.145,0,.145].map(dz=>groundTriangle111(x+dx,z+dz)));
  for(let move=0;move<5;move++){samples=sample();if(Math.max(...samples)-Math.min(...samples)<.4)break;x+=.25;}samples=sample();
  const ground=groundTriangle111(x,z),bottom=Math.min(...samples)-.12,top=ground+1.17;
  box(x,(bottom+top)/2,z,.17,top-bottom,.17,'wood','#a18a6b',parent);
  const footingTop=Math.max(...samples)+.035;box(x,(bottom+footingTop)/2,z,.29,footingTop-bottom,.29,'wall','#b9bbb0',parent);
  posts.push(V3(x,ground,z));records.push({x,z,ground,bottom,footingTop,samples});
 }
 for(let i=1;i<posts.length;i++)for(const h of[.48,1.01])beam(posts[i-1].clone().add(V3(0,h,0)),posts[i].clone().add(V3(0,h,0)),.065,'wood','#b19b7c',parent);
 world.userData.rail111={posts:records,groundSource:'rendered terrain triangles',maxFloatingGap:Math.max(...records.map(p=>p.bottom-Math.min(...p.samples)))};
}
const workingMillBefore111=buildWorkingCanal;
buildWorkingCanal=function(...args){
 const r=workingMillBefore111(...args);if(activeScene?.key!=='brookstead')return r;
 const old=world.userData.waterwheel,shared=new Set(Object.values(sharedGeo));old.removeFromParent();const unused=new Set();old.traverse(o=>{if(o.geometry&&!shared.has(o.geometry))unused.add(o.geometry);});for(const g of unused)g.dispose();
 const wheel=new THREE.Group();wheel.name='River-driven oak waterwheel';wheel.userData.liveWheel111=true;world.add(wheel);world.userData.waterwheel=wheel;
 wheel.position.set(brookChannel(91)+brookWidth(91)-1.9,2.95,91);wheel.matrixAutoUpdate=true;mill111.wake.value.set(wheel.position.x,91,0,0);
 const rim=new THREE.TorusGeometry(2.02,.105,8,64),band=new THREE.TorusGeometry(2.035,.034,6,64);
 for(const x of[-.48,.48]){
  const ring=mesh(rim,material('wood','#a89373'),x,0,0,wheel);ring.rotation.y=Math.PI/2;
  const iron=mesh(band,material('metal','#69716c',{roughness:.56,metalness:.72}),x,0,0,wheel);iron.rotation.y=Math.PI/2;
  for(let i=0;i<10;i++){const a=i*TAU/10;beam(V3(x,Math.cos(a)*.25,Math.sin(a)*.25),V3(x,Math.cos(a)*1.97,Math.sin(a)*1.97),.075,'wood','#9f8a68',wheel);}
 }
 // The broad paddle faces are radial, so the lower blades catch the current.
 // The previous tangential, oppositely rotated boards could not do this.
 for(let i=0;i<24;i++){const a=i*TAU/24,g=new THREE.Group();g.position.set(0,Math.cos(a)*1.98,Math.sin(a)*1.98);g.rotation.x=a;wheel.add(g);
  box(0,0,0,1.13,.44,.12,'wood','#a49173',g);for(const x of[-.39,.39])box(x,0,.071,.045,.45,.033,'metal','#626b65',g);
 }
 const hub=mesh(new THREE.CylinderGeometry(.245,.245,1.65,16),material('wood','#8b775d'),0,0,0,wheel);hub.rotation.z=Math.PI/2;
 for(const x of[-.60,.60]){const collar=mesh(new THREE.CylinderGeometry(.32,.32,.10,16),material('metal','#69716c',{roughness:.54,metalness:.72}),x,0,0,wheel);collar.rotation.z=Math.PI/2;}
 mergeGroup(wheel);wheel.matrixAutoUpdate=true;mill111.world=world;mill111.angle=mill111.previous=mill111.speed=0;
 world.userData.mill111={radius:2.20,paddles:24,axis:'x',currentDirection:'+z',rotationDirection:'-x',submerged:0,speed:0};return r;
};
const millFxBefore111=updateWorldFX;
updateWorldFX=function(dt){
 millFxBefore111(dt);if(activeScene?.key!=='brookstead'||mill111.world!==world)return;
 const wheel=world.userData.waterwheel;if(!wheel?.userData.liveWheel111)return;
 const q=riverState17(),fill=world.userData.waterPools.find(p=>p.userData.waterRole==='millrace')?.userData.fill17;
 const level=fill?sampleCurrent18(fill,wheel.position.z,q):1.55,depth=Math.max(0,level-(wheel.position.y-2.20)),wet=q.released?smooth(.10,.65,depth)*smooth(0,.7,q.age-arrival108(wheel.position.z)):0;
 const wanted=wet*clamp(brookHydraulics.flow.value/.72,0,1)*1.32;
 mill111.previous=mill111.angle;mill111.speed=mix(mill111.speed,wanted,1-Math.exp(-Math.max(0,dt)*1.8));mill111.angle-=Math.max(0,dt)*mill111.speed;
 wheel.rotation.x=mill111.angle;wheel.updateMatrix();wheel.updateMatrixWorld(true);
 const exit=Math.sqrt(Math.max(0,2.08**2-(level-wheel.position.y)**2));mill111.contact.value.set(wheel.position.x,level+.025,wheel.position.z+exit);
 mill111.wake.value.set(wheel.position.x,wheel.position.z,wet,mill111.speed);Object.assign(world.userData.mill111,{submerged:depth,waterLevel:level,speed:mill111.speed,angle:mill111.angle});
};
const millPresentationBefore111=renderSimulation;
renderSimulation=function(alpha){
 const wheel=mill111.world===world?world.userData.waterwheel:null;if(!wheel?.userData.liveWheel111)return millPresentationBefore111(alpha);
 wheel.rotation.x=mix(mill111.previous,mill111.angle,alpha);wheel.updateMatrix();try{return millPresentationBefore111(alpha);}finally{wheel.rotation.x=mill111.angle;wheel.updateMatrix();}
};

// Real moving water retains its native color. Only the wheel's short wake and
// the corrugated falling sheets aerate, with no bright stationary mist cards.
const movingWaterBefore111=waterMaterial62;
waterMaterial62=function(o,...args){
 const m=movingWaterBefore111(o,...args),before=m.onBeforeCompile,key=m.customProgramCacheKey(),brook=activeScene?.key==='brookstead';
 m.userData.liveWater111=true;m.onBeforeCompile=function(s,...a){before.call(this,s,...a);
  // A small wave displacement keeps a reflected face sharp, while moving it
  // with the surface. The former offset displaced it by tens of screen pixels.
  s.fragmentShader=s.fragmentShader.replace('vec2 ripple62=vec2(waveX62,waveZ62)*.04','vec2 ripple62=vec2(waveX62,waveZ62)*.0035');
  if(brook){s.uniforms.millWake111=mill111.wake;s.fragmentShader='uniform vec4 millWake111;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('foam62=clamp(foam62,0.,.7);',`float wakeAlong111=worldWater62.z-millWake111.y;float wakeWidth111=.55+max(0.,wakeAlong111)*.13;float wake111=exp(-pow((worldWater62.x-millWake111.x)/wakeWidth111,2.))*smoothstep(-.6,1.,wakeAlong111)*(1.-smoothstep(2.,6.,wakeAlong111))*millWake111.z;
    foam62+=wake111*smoothstep(.47,.76,foamGrain62)*.22;
    if(cascade62>.5){float sheet111=1.-abs(normalize(cross(dFdx(worldWater62),dFdy(worldWater62))).y);float bubbles111=texture2D(foamArt103,stream62*vec2(.80,1.6)).r;foam62+=sheet111*smoothstep(.48,.82,bubbles111)*.25*opening108;}
    foam62=clamp(foam62,0.,.78);`);
  }
 };m.customProgramCacheKey=()=>key+'-live-water111-'+brook;return m;
};
const shapedFallsBefore111=updateCascadeJoins18;
updateCascadeJoins18=function(q){
 shapedFallsBefore111(q);if(activeScene?.key!=='brookstead')return;
 world.userData.fallsPhase111=damState108().phase.value;
 for(const fall of world.userData.brookFallObjects??[]){if(!fall.visible)continue;const j=fall.userData.join,p=fall.geometry.attributes.position,n=fall.geometry.attributes.normal,ys=j.rows108,phase=damState108().phase.value;
  for(let row=0;row<=32;row++){const t=row/32,envelope=Math.sin(t*Math.PI)**2,z=mix(j.z-j.halfSpan,j.z+j.halfSpan,t),lo=Math.max(0,row-1),hi=Math.min(32,row+1),slope=(ys[hi]-ys[lo])/((hi-lo)*j.halfSpan/16);
   for(let col=0;col<13;col++){const i=row*13+col,x=p.getX(i)+fall.position.x,a=x*3.1-phase*2.4,wave=Math.sin(a)*.024*envelope,dx=Math.cos(a)*3.1*.024*envelope,dz=Math.sin(a)*.024*Math.sin(t*TAU)*Math.PI/(j.halfSpan*2),inv=1/Math.hypot(dx,1,slope+dz);p.setY(i,ys[row]-j.top+wave);n.setXYZ(i,-dx*inv,inv,-(slope+dz)*inv);}
  }p.needsUpdate=n.needsUpdate=true;
 }
};

// Nearby foliage retains its main-view geometry in shadows and mirrors. Only
// distant batches use a cheaper silhouette; the mill and actors stay exact.
secondaryForest106=function(fn,shadow=false){
 const saved=[],objects=encounter53.active&&arena88.current?arena88.current.secondaryForests106??[]:scenery.forestMeshes;
 for(const o of objects){const low=o.userData.shadowGeometry106??o.userData.nativeLods30?.[2],c=o.userData.center;if(!o.visible||!o.userData.botany104||!low||shadow&&!o.castShadow)continue;
  if(c&&player&&Math.hypot(c.x-player.x,c.z-player.z)<(activeScene.kind==='overworld'?80:38))continue;saved.push([o,o.geometry]);o.geometry=low;
 }try{return fn();}finally{for(const[o,g]of saved)o.geometry=g;}
};
const shadowFitBefore111=fitVisibleShadows;
fitVisibleShadows=function(...args){
 const outdoor=world&&!encounter53.active&&['poi','overworld'].includes(activeScene?.kind);if(outdoor)shadow36.last=-100;
 const r=shadowFitBefore111(...args);if(outdoor){sun.shadow.radius=.35;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;}return r;
};
const liveCapabilityBefore111=applyCapabilityBudget;let liveCapabilityKey111='';
applyCapabilityBudget=function(...args){
 if(!renderer||!sun)return liveCapabilityBefore111(...args);const low=state.settings.quality==='low'||softwareBudget(),desired=low?1024:touchDevice33()?1536:profile33()===3?3072:2048,key=[world?.uuid,state.settings.quality,profile33(),innerWidth,innerHeight,devicePixelRatio].join('|');
 if(liveCapabilityKey111===key&&sun.shadow.mapSize.x===desired)return;const r=liveCapabilityBefore111(...args);liveCapabilityKey111=key;
 if(sun.shadow.mapSize.x!==desired){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(desired,desired);renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;}return r;
};

const mirrors111={world:null,owned:new Map(),frames:0,passes:0,shadowFrames:0,size:new THREE.Vector2(),bias:new THREE.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),frustum:new THREE.Frustum(),matrix:new THREE.Matrix4()};
const presentation111={depth:0,id:0,mirrored:-1},presentationBefore111=render;
render=function(...args){if(!presentation111.depth)presentation111.id++;presentation111.depth++;try{return presentationBefore111(...args);}finally{presentation111.depth--;}};
function mirrorSize111(target){
 renderer.getDrawingBufferSize(mirrors111.size);const {x,y}=mirrors111.size,scale=Math.min(1,Math.sqrt((touchDevice33()?1050000:1600000)/(x*y))),w=Math.max(256,Math.round(x*scale)),h=Math.max(256,Math.round(y*scale));
 if(target.width!==w||target.height!==h){target.setSize(w,h);target.texture.generateMipmaps=false;target.texture.minFilter=target.texture.magFilter=THREE.LinearFilter;}
}
function waterVisible111(o){
 if(!o?.visible)return false;const patches=o===water?world.userData.waterPatches:o.userData.poolPatches;if(patches?.length)return patches.some(b=>mirrors111.frustum.intersectsBox(b));
 if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();return mirrors111.frustum.intersectsObject(o);
}
function presentShadow111(){
 // Enter through the renderer so its light/render state exists. Skip only
 // camera color draws; the real light-camera depth draws still execute once.
 const draw=renderer.renderBufferDirect,target=renderer.getRenderTarget(),clear=renderer.autoClear;
 renderer.renderBufferDirect=function(c,...args){if(c!==camera)return draw.call(this,c,...args);};renderer.autoClear=false;
 try{renderer.setRenderTarget(post.target);renderer.render(scene,camera);}finally{renderer.renderBufferDirect=draw;renderer.autoClear=clear;renderer.setRenderTarget(target);}
}
const previousMirrors111=updateReflection;
updateReflection=function(...args){
 if(!world||encounter53.active||!['poi','overworld'].includes(activeScene?.kind)||!world.userData.water62)return previousMirrors111(...args);
 if(gameLoading||loading36.active)return previousMirrors111(...args);
 if(presentation111.depth){if(presentation111.mirrored===presentation111.id)return;presentation111.mirrored=presentation111.id;}
 camera.updateMatrixWorld(true);mirrors111.frustum.setFromProjectionMatrix(mirrors111.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 const brook=activeScene.key==='brookstead',surfaces=[];world.traverse(o=>{if(o.isMesh&&o.userData.water62)surfaces.push(o);});
 if(brook&&world.userData.fallsPhase111!==damState108().phase.value)updateCascadeJoins18(riverState17());
 const candidates=brook?[water,...world.userData.waterPools??[]].filter(waterVisible111):surfaces.filter(o=>!o.userData.waterfall&&waterVisible111(o));if(!candidates.length)return;
 // The reflection reads this frame's actual sharp shadow depth, rather than
 // combining yesterday's depth texture with the newly fitted light matrix.
 scene.updateMatrixWorld(true);if(shadow36.due&&renderer.shadowMap.needsUpdate&&sun.shadow.needsUpdate){presentShadow111();mirrors111.shadowFrames++;}
 const oldTarget=renderer.getRenderTarget(),oldClip=renderer.clippingPlanes,auto=renderer.shadowMap.autoUpdate,pending=renderer.shadowMap.needsUpdate,sunPending=sun.shadow.needsUpdate,hidden=new Map(),trees=scenery.trees.filter(t=>t.hidden),depths=cutawayUniforms.depths.value.slice(),fades=(world.userData.cutaways??[]).map(o=>o.fade.value);
 const hide=o=>{if(o&&!hidden.has(o)){hidden.set(o,o.visible);o.visible=false;}};for(const o of surfaces)hide(o);
 for(const o of [...perf.plants,world.userData.weatherBatch36,world.userData.dust22?.mesh,world.userData.mist28,world.userData.damSpray108,world.userData.millSpray111,world.userData.current19,world.userData.releaseSpray18,world.userData.shafts24?.group])hide(o);
 for(const t of trees)hideTree(t,false);for(const o of world.userData.cutaways??[])o.fade.value=0;cutawayUniforms.depths.value.fill(0);
 renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=false;forest30.main.value=0;const rendered=new Map(),rows=[];
 try{for(const o of candidates){
  let level=o.position.y;if(brook&&o.userData.fill17){const f=o.userData.fill17;level=sampleCurrent18(f,(f.start+f.end)/2,riverState17());}
  else if(o.userData.freshwater38)level=traversalWaterHeight(player.x,player.z)+.035;
  const key=level.toFixed(3);let mirror=rendered.get(key);
  if(!mirror){let target=o.userData.poolTarget??(o===water?reflectionTarget:mirrors111.owned.get(o));if(!target){target=new THREE.WebGLRenderTarget(256,256,{depthBuffer:true});mirrors111.owned.set(o,target);}mirrorSize111(target);
   reflectionCamera.copy(camera);reflectionCamera.position.y=2*level-camera.position.y;reflectionCamera.up.set(0,-1,0);reflectionCamera.lookAt(cameraTarget.x,2*level-cameraTarget.y,cameraTarget.z);reflectionCamera.updateMatrixWorld(true);
   const matrix=(o.userData.reflMatrix??=new THREE.Matrix4());matrix.copy(mirrors111.bias).multiply(reflectionCamera.projectionMatrix).multiply(reflectionCamera.matrixWorldInverse);renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),-level-.015)];
   renderer.setRenderTarget(target);renderer.render(scene,reflectionCamera);mirror={target,matrix,level};rendered.set(key,mirror);mirrors111.passes++;liveSurfaceStats.reflections++;
  }
  const u=waterUniforms62.get(o.material);if(u){u.mirror62.value=mirror.target.texture;u.reflectionMatrix62.value=mirror.matrix;u.reflect62.value=1;}
  o.userData.mirror111={frame:mirrors111.frames+1,level,width:mirror.target.width,height:mirror.target.height};rows.push({role:o.userData.waterRole??(o.userData.freshwater38?'river':'ocean'),...o.userData.mirror111});
 }
 // Cascades read the current upper and lower pool images; the continuation
 // shares its reservoir material, so no separate stale horizon mirror exists.
 if(brook)for(const o of world.userData.brookFallObjects??[]){const j=o.userData.join,u=waterUniforms62.get(o.material),q=riverState17(),upper=j.z===70?'reservoir':j.z===80?'headrace':'millrace',lower=j.z===70?'headrace':j.z===80?'millrace':'lowerBrook',up=rendered.get(currentLevel18(upper,j.z-j.halfSpan,q).toFixed(3)),down=rendered.get(currentLevel18(lower,j.z+j.halfSpan,q).toFixed(3));if(!u)continue;if(up){u.upperMirror62.value=up.target.texture;u.upperMatrix62.value=up.matrix;}if(down){u.mirror62.value=down.target.texture;u.reflectionMatrix62.value=down.matrix;}}
 mirrors111.frames++;world.userData.liveMirrors111={frame:mirrors111.frames,passes:rendered.size,levels:rows,perPresentedFrame:true,shadowFrame:mirrors111.shadowFrames};
 }finally{renderer.setRenderTarget(oldTarget);renderer.clippingPlanes=oldClip;renderer.shadowMap.autoUpdate=auto;renderer.shadowMap.needsUpdate=pending;sun.shadow.needsUpdate=sunPending;cutawayUniforms.depths.value.set(depths);(world.userData.cutaways??[]).forEach((o,i)=>o.fade.value=fades[i]);for(const[o,v]of hidden)o.visible=v;for(const t of trees)hideTree(t,true);forest30.main.value=1;}
};
const disposeMirrorsBefore111=disposeContinuousWorld;
disposeContinuousWorld=function(...args){for(const t of mirrors111.owned.values())t.dispose();mirrors111.owned.clear();mill111.world=null;mill111.spray=null;return disposeMirrorsBefore111(...args);};
