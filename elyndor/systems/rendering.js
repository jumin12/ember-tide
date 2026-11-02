// One owner for the live canal. Older water routines first narrowed every row,
// then widened it again and rebuilt bounds/normals before the same draw.
// Cache immutable row coordinates and riverbed depths behind the scene loader.
const rendering41={riverFrames:0,riverVertices:0,shadowDraws:0,shadowReuses:0};
// Reuse exact terrain answers within a simulation step / presented frame.
// There is no coordinate quantization, so stair edges and bridge heights retain
// their authored shape. Construction and loading always query live geometry.
const heightBefore41=heightAt,heightCache41={world:null,frame:-1,cells:new Map(),hits:0,misses:0};
heightAt=function(x,z,...args){
 if(args.length||gameLoading||loading36.active||perf.building||sceneBuildFilter)return heightBefore41(x,z,...args);
 const q=heightCache41;if(q.world!==world||q.frame!==frameIndex){q.world=world;q.frame=frameIndex;q.cells.clear();}
 const key=x+','+z;if(q.cells.has(key)){q.hits++;return q.cells.get(key);}
 const y=heightBefore41(x,z);q.misses++;if(q.cells.size<4096&&Number.isFinite(y))q.cells.set(key,y);return y;
};
const heightDisposeBefore41=disposeContinuousWorld;
disposeContinuousWorld=function(...args){heightCache41.world=null;heightCache41.cells.clear();return heightDisposeBefore41(...args);};
// The slope-aware pooled foot contacts in levels-v39 supersede the older flat
// contact layer. Drawing both doubled the darkness and left one at tick time.
makeContacts35=function(){};
updateContacts35=function(){};
function prepareCanal41(){
 if(activeScene.key!=='brookstead'||world.userData.canal41)return;
 const pools=[];
 for(const mesh of world.userData.waterPools??[]){const f=mesh.userData.fill17;if(!f?.bed18)continue;
  const p=mesh.geometry.attributes.position,rows=[];let previous=NaN,row;
  for(let i=0;i<p.count;i++){const z=f.sourceX[i*3+2];if(z!==previous){previous=z;row={z,indices:[],level:f.dry};rows.push(row);}row.indices.push(i);p.setX(i,f.sourceX[i*3]);p.setZ(i,z);}
  // During recovery the complete channel is bounded by these two levels.
  // Bounds include the animated falls too and never need per-frame scans.
  mesh.geometry.computeBoundingBox();const b=mesh.geometry.boundingBox;
  b.min.y=f.dry-f.natural-.2;b.max.y=f.natural-f.dry+.2;
  mesh.geometry.boundingSphere=new THREE.Sphere();b.getBoundingSphere(mesh.geometry.boundingSphere);
  for(const box of mesh.userData.poolPatches??[]){box.min.y=Math.min(box.min.y,f.dry-.3);box.max.y=Math.max(box.max.y,f.natural+.3);}
  pools.push({mesh,f,rows});p.needsUpdate=true;
 }
 world.userData.canal41={pools,lastAge:NaN,lastHead:NaN,lastOpen:NaN};
}
const canalBuildBefore41=buildWorld;
buildWorld=function(...args){const r=canalBuildBefore41(...args);prepareCanal41();return r;};
const canalBefore41=updateRiver17;
updateRiver17=function(dt){
 if(activeScene.key!=='brookstead'||!world?.userData.canal41)return canalBefore41(dt);
 const q=riverState17(),data=world.userData.canal41;
 if(state.flags.gate_open){if(!q.released){q.released=true;q.age=0;}if(dt&&state.mode!=='title'&&!menu&&!gameLoading)q.age=Math.min(360,q.age+dt);}else{q.released=false;q.age=0;}
 const spec=world.userData.gate?.userData.gate18,opening=spec?clamp((world.userData.gate.position.y-spec.closed)/(spec.opened-spec.closed),0,1):Number(q.released);
 sluice18.flow.value=q.released?opening:0;sluice18.surge.value=q.released?opening*Math.exp(-Math.max(0,q.age-1.5)/9):0;
 world.userData.riverPending21=false;
 const head=brookHydraulics.head.value;
 if(q.age===data.lastAge&&Math.abs(head-data.lastHead)<.00001&&opening===data.lastOpen)return;
 data.lastAge=q.age;data.lastHead=head;data.lastOpen=opening;
 // Simulation only advances the release clock. Submit vertex changes once at
 // the render boundary, including when several simulation steps catch up.
 data.dirty=true;
};
function drawCanal41(){
 const data=world?.userData.canal41;if(!data?.dirty)return;data.dirty=false;const q=riverState17(),levels={reservoir:brookHydraulics.head.value};
 for(const {mesh,f,rows}of data.pools){
  // A fixed local origin keeps geometry, culling and reflection transforms in
  // agreement; only the physical water vertices rise along the wetting front.
  mesh.position.y=f.natural;const p=mesh.geometry.attributes.position,d=mesh.geometry.attributes.waterDepth18;
  for(const row of rows){const level=sampleCurrent18(f,row.z,q);row.level=level;for(const i of row.indices){p.array[i*3+1]=level-f.natural;d.array[i]=level-f.bed18[i];}}
  p.needsUpdate=d.needsUpdate=true;levels[mesh.userData.waterRole]=sampleCurrent18(f,(f.start+f.end)/2,q);
 }
 updateCascadeJoins18(q);updateReleaseFX18();
 world.userData.riverProgress17={released:q.released,age:q.age,opening:sluice18.flow.value,settled:q.age>=280,front:Math.min(430,70+q.age*1.6),levels,model:'continuous downstream wetting and gradual recovery'};
 rendering41.riverFrames++;
}
const canalRenderBefore41=render;
render=function(...args){drawCanal41();return canalRenderBefore41(...args);};
// Reflect each filling pool at its actual local water level. Temporary height
// changes in the legacy reflection wrapper must not leave a stale world matrix
// in the following colour pass.
const reflectBefore41=updateReflection,reflectFrustum41=new THREE.Frustum(),reflectMatrix41=new THREE.Matrix4();
updateReflection=function(...args){
 if(activeScene.key!=='brookstead')return reflectBefore41(...args);
 const pools=world?.userData.waterPools??[],all=[water,...pools,...world.userData.brookFallObjects??[]];
 camera.updateMatrixWorld();reflectFrustum41.setFromProjectionMatrix(reflectMatrix41.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
 const visible=[water,...pools].filter(o=>o?.visible&&(o.userData.poolPatches??world.userData.waterPatches??[]).some(b=>reflectFrustum41.intersectsBox(b)));
 if(!visible.length)return;
 const stamp=world.userData.serial+'|'+device33.resizes+'|'+device33.allocations;
 const fresh=visible.filter(o=>o.userData.reflectionWorld41!==stamp),budget=profile33()>1?2:1;
 const ordered=visible.slice().sort((a,b)=>(a.userData.reflectionAt41??-100)-(b.userData.reflectionAt41??-100));
 const selected=fresh.length?fresh:ordered.slice(0,budget).filter(o=>clock-(o.userData.reflectionAt41??-100)>=1/30||!o.userData.reflectionCamera41||o.userData.reflectionCamera41.distanceToSquared(camera.position)>.01);
 if(!selected.length)return;
 const oldWater=water,oldTarget=reflectionTarget,pending=renderer.shadowMap.needsUpdate,sunPending=sun.shadow.needsUpdate,hidden=new Map();
 const hide=o=>{if(o&&!hidden.has(o)){hidden.set(o,o.visible);o.visible=false;}};
 for(const o of all)hide(o);for(const o of perf.plants)hide(o);
 for(const o of [world.userData.weatherBatch36,world.userData.dust22?.mesh,world.userData.mist28,world.userData.current19,world.userData.releaseSpray18,world.userData.shafts24?.group])hide(o);
 const trees=scenery.trees.filter(t=>t.hidden);for(const t of trees)hideTree(t,false);
 renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=false;
 try{for(const pool of selected){
  const localY=pool.position.y,f=pool.userData.fill17;
  if(f)pool.position.y=sampleCurrent18(f,(f.start+f.end)/2,riverState17());
  water=pool;reflectionTarget=pool.userData.poolTarget??oldTarget;pool.visible=true;
  try{physicalReflection();pool.userData.reflectionAt41=clock;pool.userData.reflectionWorld41=stamp;(pool.userData.reflectionCamera41??=V3()).copy(camera.position);liveSurfaceStats.reflections++;}
  finally{pool.visible=false;pool.position.y=localY;pool.updateMatrixWorld(true);}
 }}finally{water=oldWater;reflectionTarget=oldTarget;for(const [o,value]of hidden)o.visible=value;for(const t of trees)hideTree(t,true);renderer.shadowMap.needsUpdate=pending;sun.shadow.needsUpdate=sunPending;}
};

// Keep the exact shadow projection that produced the cached depth texture.
// Movement updates shadows every presented frame, including constrained tiers;
// stationary views can reuse the depth pass between wind-animation samples.
const shadowFitBefore41=fitVisibleShadows;
fitVisibleShadows=function(){
 const moving=shadow36.camera.distanceToSquared(camera.position)>1e-6;
 if(moving)shadow36.last=-100;
 return shadowFitBefore41();
};
const postBefore41=setupPost;
setupPost=function(){postBefore41();const shadowRender=renderer.shadowMap.render,saved=new THREE.Matrix4();let valid=false;
 renderer.shadowMap.render=function(lights,s,c){
  const main=c===camera,draw=main&&shadow36.due&&this.needsUpdate&&sun.shadow.needsUpdate;
  const result=shadowRender.call(this,lights,s,c);
  if(draw){saved.copy(sun.shadow.matrix);valid=true;rendering41.shadowDraws++;}
  else if(main&&valid){sun.shadow.matrix.copy(saved);rendering41.shadowReuses++;}
  return result;
 };
};

// Stable world cells retain their seeds when the player crosses a boundary.
// Only the newly exposed outer cells change, beyond the visible dust fade.
const dustBefore41=makeWorldDust22;
makeWorldDust22=function(){dustBefore41();const q=world.userData.dust22;if(!q)return;const count=1200,g=q.mesh.geometry;
 g.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(count*3),3));g.setAttribute('dustSeed22',new THREE.Float32BufferAttribute(new Float32Array(count*3),3));q.cells41=new Map();q.key=null;cinema22.particles=count;
 const m=q.mesh.material;
 m.uniforms.shadowMatrix41={value:sun.shadow.matrix};m.uniforms.shadowMap41={value:null};m.uniforms.hasShadow41={value:0};
 m.fragmentShader='uniform mat4 shadowMatrix41;uniform sampler2D shadowMap41;uniform float hasShadow41;\n'+m.fragmentShader;
 m.fragmentShader=m.fragmentShader.replace('float phase=.3+.7*','vec4 shadow41=shadowMatrix41*vec4(world22,1.);vec3 sc41=shadow41.xyz/shadow41.w;float lit41=1.;if(hasShadow41>.5&&all(greaterThan(sc41,vec3(0.)))&&all(lessThan(sc41,vec3(1.)))){float depth41=dot(texture2D(shadowMap41,sc41.xy),vec4(0.000000059371814132,0.000015199184417724609,0.0038909912109375,0.99609375));lit41=smoothstep(sc41.z-.001,sc41.z+.001,depth41);}float phase=.4+.6*');
 m.fragmentShader=m.fragmentShader.replace('(core*.46+halo*.08)','(core*.72+halo*.10)').replace('mix((1.-shade*.92)*phase,firefly*.6,night)','mix(exp(-shade*4.5)*phase*mix(.10,1.,lit41),firefly*.6,night)').replace('smoothstep(55.,145.,fog22)','smoothstep(42.,68.,fog22)');
 const before=q.mesh.onBeforeRender;q.mesh.onBeforeRender=function(...args){before?.apply(this,args);m.uniforms.shadowMap41.value=sun.shadow.map?.texture;m.uniforms.hasShadow41.value=Number(!!sun.shadow.map);};m.needsUpdate=true;
};
const dustUpdateBefore41=updateWorldDust22;
updateWorldDust22=function(){const q=world?.userData.dust22;if(!q?.cells41)return dustUpdateBefore41();if(!player)return;
 const cx=Math.floor(player.x/32),cz=Math.floor(player.z/32),key=cx+','+cz;if(q.key===key)return;q.key=key;
 const p=q.mesh.geometry.attributes.position,s=q.mesh.geometry.attributes.dustSeed22,mod=n=>(n%5+5)%5;
 for(let x=cx-2;x<=cx+2;x++)for(let z=cz-2;z<=cz+2;z++){
  const slot=mod(x)*5+mod(z),id=x+','+z;if(q.cells41.get(slot)===id)continue;q.cells41.set(slot,id);
  const rng=seeded(Math.imul(x+10031,73856093)^Math.imul(z+9061,19349663));for(let i=0;i<48;i++){const px=x*32+rng()*32,pz=z*32+rng()*32,n=slot*48+i;p.setXYZ(n,px,heightAt(px,pz)+.7+rng()*5.2,pz);s.setXYZ(n,rng(),rng(),rng());}
 }
 p.needsUpdate=s.needsUpdate=true;
};
