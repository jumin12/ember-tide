// Bounded, prewarmed 3D combat effects. Meshes, materials, geometry and particle
// storage are created while loading; a hit only fills existing pool entries.
const combatVfx={world:null,banks:{},shapes:{},stats:{emitted:0,active:0,peak:0,replaced:0,warmed:false},time:{value:0}};
function makeParticleBank(map,additive,capacity=320){
 const source=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry();g.index=source.index;g.attributes.position=source.attributes.position;g.attributes.uv=source.attributes.uv;g.instanceCount=0;
 const fields={p:[3,'start'],v:[3,'velocity'],c:[3,'color'],life:[4,'life'],size:[4,'size']},arrays={};
 for(const[k,[n]]of Object.entries(fields)){arrays[k]=new Float32Array(capacity*n);g.setAttribute(k,new THREE.InstancedBufferAttribute(arrays[k],n).setUsage(THREE.DynamicDrawUsage));}
 g.boundingSphere=new THREE.Sphere(V3(),1);
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:additive?THREE.AdditiveBlending:THREE.NormalBlending,side:THREE.DoubleSide,uniforms:{map:{value:map},time:combatVfx.time,sunDirection:{value:V3()},ambient:{value:.6},glow:{value:additive?1.5:1}},
 vertexShader:`attribute vec3 p,v,c;attribute vec4 life,size;uniform float time;varying vec2 tex;varying vec3 tint;varying float alpha,depth;
 void main(){float age=max(0.,time-life.x),t=clamp(age/max(.01,life.y),0.,1.);vec3 center=p+v*age;center.y-=life.z*age*age*.5;float angle=size.z+age*size.w;vec2 q=mat2(cos(angle),-sin(angle),sin(angle),cos(angle))*position.xy;
 vec4 eye=modelViewMatrix*vec4(center,1.);eye.xy+=q*mix(size.x,size.y,t);gl_Position=projectionMatrix*eye;tex=uv;tint=c;depth=-eye.z;alpha=sin(min(1.,t*5.)*1.5707963)*pow(1.-t,life.w);if(time<life.x||age>=life.y)alpha=0.;}`,
 fragmentShader:`uniform sampler2D map;uniform vec3 sunDirection;uniform float ambient,glow;varying vec2 tex;varying vec3 tint;varying float alpha,depth;
 void main(){vec4 sampleColor=texture2D(map,tex);float a=sampleColor.a*alpha;if(a<.008)discard;vec2 p=(tex-.5)*1.8;vec3 n=normalize(vec3(p,sqrt(max(.02,1.-dot(p,p)))));float light=ambient+(1.-ambient)*max(0.,dot(n,normalize(sunDirection)));gl_FragColor=vec4(sampleColor.rgb*tint*glow*light,a*.65);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});
 const mesh=new THREE.Mesh(g,m);mesh.renderOrder=additive?6:5;mesh.frustumCulled=true;mesh.userData.dynamicFX=true;world.add(mesh);
 return{mesh,arrays,capacity,entries:Array.from({length:capacity},()=>({active:false})),cursor:0};
}
function emitParticles(kind,pos,color,count=12,power=1,options={}){
 const bank=combatVfx.banks[kind];if(!bank)return;const tint=new THREE.Color(color);
 for(let i=0;i<count;i++){
  let slot=-1;for(let k=0;k<bank.capacity;k++){const j=(bank.cursor+k)%bank.capacity;if(!bank.entries[j].active){slot=j;break;}}if(slot<0){slot=bank.cursor;combatVfx.stats.replaced++;}bank.cursor=(slot+1)%bank.capacity;
  const e=bank.entries[slot],a=i*2.399+Math.random(),r=(options.spread??.4)*Math.sqrt(Math.random());e.active=true;e.start=clock+(options.delay??0);e.duration=(options.duration??(kind==='smoke'?1.35:.55))*(.75+Math.random()*.5);e.pos=[pos.x+Math.cos(a)*r,pos.y+Math.random()*.25,pos.z+Math.sin(a)*r];
  const speed=options.speed??(kind==='smoke'?.8:3.8)*power;e.vel=[Math.cos(a)*speed*(.2+Math.random()*.8),(kind==='smoke'?1:1.6)*power+Math.random()*power*2,Math.sin(a)*speed*(.2+Math.random()*.8)];e.color=[tint.r,tint.g,tint.b];
  e.gravity=options.gravity??(kind==='smoke'?-.1:kind==='fire'?-1:6);e.fade=kind==='smoke'?1.5:1;e.size=[(options.size??(kind==='smoke'?1.2:kind==='fire'?.45:.15))*power,(options.endSize??(kind==='smoke'?3.2:kind==='fire'?.08:.01))*power,Math.random()*TAU,(Math.random()-.5)*(kind==='smoke'?.4:2)];combatVfx.stats.emitted++;
 }
}
function slashVolumeGeometry(){
 const p=[],uv=[],indices=[],steps=40;
 for(let side=0;side<2;side++)for(let i=0;i<=steps;i++)for(let j=0;j<2;j++){const t=i/steps,a=-Math.PI*.85+t*Math.PI*1.7,fade=Math.sin(t*Math.PI),r=j?.82+.18*fade:.81-.12*fade;p.push(Math.cos(a)*r,Math.sin(a)*r,(side-.5)*.045);uv.push(t,j);}
 const row=(steps+1)*2;for(let side=0;side<2;side++)for(let i=0;i<steps;i++){const a=side*row+i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}for(let i=0;i<steps;i++){const a=i*2,b=row+a;indices.push(a,b,a+2,a+2,b,b+2,a+1,a+3,b+1,a+3,b+3,b+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
function makeShapeBank(name,geometry,mat,capacity=48){
 const g=geometry.clone();g.setAttribute('fxAlpha',new THREE.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(THREE.DynamicDrawUsage));const compile=mat.onBeforeCompile;
 mat.onBeforeCompile=sh=>{compile?.(sh);sh.vertexShader='attribute float fxAlpha;varying float effectAlpha;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\neffectAlpha=fxAlpha;');sh.fragmentShader='varying float effectAlpha;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\ndiffuseColor.a*=effectAlpha;if(diffuseColor.a<.006)discard;');};mat.customProgramCacheKey=()=> 'pooled-'+name+'-v11';
 const mesh=new THREE.InstancedMesh(g,mat,capacity);mesh.count=0;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.renderOrder=4;mesh.userData.dynamicFX=true;mesh.boundingSphere=new THREE.Sphere(V3(),1);world.add(mesh);
 return{mesh,capacity,entries:Array.from({length:capacity},()=>({active:false})),cursor:0};
}
function shapeEffect(kind,pos,color,duration=1,opts={}){
 const bank=combatVfx.shapes[kind];if(!bank)return null;let j=-1;for(let k=0;k<bank.capacity;k++){const n=(bank.cursor+k)%bank.capacity;if(!bank.entries[n].active){j=n;break;}}if(j<0){j=bank.cursor;combatVfx.stats.replaced++;}bank.cursor=(j+1)%bank.capacity;
 const e=bank.entries[j];Object.assign(e,{active:true,start:clock+(opts.delay??0),duration,pos:pos.clone(),color:new THREE.Color(color),scale:opts.scale?.clone()??V3(1,1,1),rotation:opts.rotation?.clone()??new THREE.Quaternion(),spin:opts.spin??0,expand:opts.expand??0,rise:opts.rise??0,velocity:opts.velocity?.clone()??null,gravity:opts.gravity??0,projectile:opts.projectile??null,opacity:opts.opacity??.85,trail:0});combatVfx.stats.emitted++;return e;
}
function initCombatVfx(){
 combatVfx.world=world;combatVfx.time.value=clock;
 if(Object.keys(combatVfx.banks).length){for(const bank of [...Object.values(combatVfx.banks),...Object.values(combatVfx.shapes)]){bank.entries.forEach(e=>e.active=false);bank.mesh.visible=false;if(bank.mesh.isInstancedMesh)bank.mesh.count=0;else bank.mesh.geometry.instanceCount=0;world.add(bank.mesh);}return;}
 combatVfx.banks={smoke:makeParticleBank(textures.fxSmoke,false,160),fire:makeParticleBank(textures.fxFire,true,256),spark:makeParticleBank(textures.fxEnergy,true,384)};
 const additive=map=>new THREE.MeshBasicMaterial({map,color:'#ffffff',transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
 combatVfx.shapes={arc:makeShapeBank('arc',slashVolumeGeometry(),additive(textures.fxEnergy)),ring:makeShapeBank('ring',new THREE.TorusGeometry(1,.028,5,56),additive(textures.fxEnergy)),beam:makeShapeBank('beam',new THREE.CylinderGeometry(.07,.13,1,8,6,true),additive(textures.fxEnergy)),lance:makeShapeBank('lance',new THREE.ConeGeometry(.3,1,10,4),additive(textures.fxFire)),ice:makeShapeBank('ice',new THREE.OctahedronGeometry(1,0),new THREE.MeshStandardMaterial({map:textures.fxIce,color:'#c5eaff',emissive:'#467d94',emissiveIntensity:.45,roughness:.2,metalness:.14,transparent:true,opacity:.91,depthWrite:false})),arrow:makeShapeBank('arrow',new THREE.ConeGeometry(.075,1.1,5),new THREE.MeshStandardMaterial({map:textures.metal,color:'#e2d5a4',roughness:.5,transparent:true,depthWrite:false}))};
}
function effectLight(pos,color,power=18,duration=.65){
 const slots=world.userData.lanterns??[];for(let k=0;k<2;k++){const l=slots[4+(effectLightIndex++%2)];if(!l)continue;l.position.copy(pos).add(V3(k?1:-1,1,0));l.color.set(color);l.intensity=power;l.distance=15;l.userData.effectPower=power;l.userData.effectUntil=clock+duration;l.userData.effectDuration=duration;}
}
function impactCloud(pos,color,strong=false){emitParticles('spark',pos,color,strong?24:12,strong?1.25:.9);emitParticles('smoke',pos,'#a3adb0',strong?8:4,strong?1:.7,{spread:.55,size:.5,endSize:1.6,speed:1.2,duration:.75});}
combatProjectile=function(kind,from,to,duration,strong=false){
 const color=kind==='fire'?'#ffb050':kind==='arrow'?'#e5eac0':'#82c8ff',dir=to.clone().sub(from).normalize(),q=new THREE.Quaternion().setFromUnitVectors(V3(0,1,0),dir);
 shapeEffect(kind==='arrow'?'arrow':kind==='fire'?'lance':'beam',from,color,duration,{rotation:q,scale:kind==='arrow'?V3(1,1,1):V3(strong?1.6:1,kind==='fire'?2.4:1.5,strong?1.6:1),projectile:{from:from.clone(),to:to.clone(),kind,strong}});
};
castFX=function(kind,from,to,strong=false,impactOnly=false){
 if(combatVfx.world!==world)initCombatVfx();const colors={blade:'#ffe5a1',impact:'#edc590',arrow:'#dae8ac',arcane:'#70bfff',fire:'#ffad56',ice:'#a8eaff',heal:'#83ebbd',ward:'#82bfed',wardheal:'#9aefdb',ascend:'#a9dbff',portal:'#a28bea'},color=colors[kind]??'#bcdfed',power=strong?1.4:1;
 effectLight(to,color,strong?25:16,strong?.9:.55);sfx(kind==='blade'||kind==='impact'?'hit':'cast');
 if(kind==='blade'||kind==='impact'){
  for(let i=0;i<(strong?3:2);i++){const q=camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(i*.55,.4-i*.4,-.8+i*.7)));shapeEffect('arc',to,color,.32+i*.05,{rotation:q,scale:V3(1.8*power,1.8*power,1),spin:(i%2?1:-1)*2,expand:1.2});}
  shapeEffect('ring',to,color,.35,{rotation:camera.quaternion,scale:V3(.3,.3,.3),expand:7});impactCloud(to,color,strong);
 }else if(kind==='arrow'){
  impactCloud(to,color,strong);shapeEffect('ring',to,color,.32,{rotation:camera.quaternion,scale:V3(.25,.25,.25),expand:5});
 }else if(kind==='ice'){
  for(let i=0;i<(strong?14:9);i++){const a=i*2.399,r=.35+Math.sqrt(i/(strong?14:9))*1.65,p=to.clone().add(V3(Math.cos(a)*r,-.8,Math.sin(a)*r)),q=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.cos(a)*.35,a,Math.sin(a)*.3));shapeEffect('ice',p,color,.9+Math.random()*.25,{rotation:q,scale:V3(.2,.8+Math.random()*.8,.3).multiplyScalar(power),rise:1.15,delay:i*.018,expand:.18});}
  emitParticles('smoke',to,'#b5d8e9',10,.8,{size:.7,endSize:2,speed:.7,gravity:-.2});emitParticles('spark',to,color,18,power);shapeEffect('ring',to.clone().add(V3(0,-.75,0)),color,.6,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)),scale:V3(.4,.4,.4),expand:4});
 }else if(['heal','ward','wardheal','ascend','portal'].includes(kind)){
  const ground=to.clone();ground.y=heightAt(to.x,to.z)+.12;
  for(let i=0;i<(strong?4:3);i++){const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(kind==='portal'?0:Math.PI/2,i*.5,kind==='portal'?i*.45:0));shapeEffect('ring',ground.clone().add(V3(0,i*.45,0)),color,1.15,{rotation:q,scale:V3(.65+i*.15,.65+i*.15,.65+i*.15).multiplyScalar(power),spin:i%2?1.1:-1.1,rise:.45,expand:.22});}
  for(let i=0;i<(kind==='ascend'?16:7);i++){const a=i*2.399,p=ground.clone().add(V3(Math.cos(a)*1.2,0,Math.sin(a)*1.2));shapeEffect('beam',p,color,.9,{scale:V3(.16,1.4,.16),rise:1.8,delay:i*.025});}
  emitParticles('spark',ground,color,strong?30:16,.6,{gravity:-.7,speed:.7,size:.12,endSize:.02,duration:1.15});if(kind==='ascend')emitParticles('smoke',ground,'#9db5c0',12,1,{size:.6,endSize:2.5,speed:1.6,gravity:.1});
 }else if(kind==='fire'){
  for(let i=0;i<(strong?16:12);i++){const a=i*2.399,p=to.clone().add(V3(Math.cos(a)*.8,-.65,Math.sin(a)*.8));shapeEffect('lance',p,color,.85+Math.random()*.35,{scale:V3(.65,1.6+Math.random()*1.8,.65).multiplyScalar(power),rise:2,delay:i*.018,spin:.7});}
  const floor=to.clone();floor.y=heightAt(to.x,to.z)+.15;
  shapeEffect('ring',floor,'#ffbc67',.75,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)),scale:V3(.35,.35,.35),expand:6});
  for(let i=0;i<3;i++)shapeEffect('arc',to,color,.7,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(.8+i*.6,.4,i*2)),scale:V3(1.8,1.8,1.8).multiplyScalar(power),spin:3,expand:.8});
  emitParticles('fire',to,color,strong?48:36,power,{speed:1.5,gravity:-.5,duration:1,size:.8,endSize:.08});emitParticles('smoke',to,'#927f79',strong?18:12,power,{size:.85,endSize:3,speed:1});impactCloud(to,'#ffd29b',strong);
 }else{
  if(!impactOnly)combatProjectile('arcane',from,to,.28,strong);for(let i=0;i<(strong?3:2);i++)shapeEffect('ring',to,color,.55,{rotation:new THREE.Quaternion().setFromEuler(new THREE.Euler(i*.9,.5,i)),scale:V3(.35,.35,.35),expand:4,spin:i%2?1:-1});emitParticles('spark',to,color,24,power);emitParticles('smoke',to,'#7895b2',5,.7,{size:.5,endSize:1.8});
 }
};
sparks=function(pos,color,count=24,power=1){emitParticles('spark',pos,color,Math.min(40,count),power);};
function updateCombatVfx(){
 if(combatVfx.world!==world)return;combatVfx.time.value=clock;let active=0;const matrix=new THREE.Matrix4(),q=new THREE.Quaternion(),pos=V3(),scale=V3(),spin=new THREE.Quaternion();
 for(const bank of Object.values(combatVfx.banks)){let n=0,min=V3(Infinity,Infinity,Infinity),max=V3(-Infinity,-Infinity,-Infinity),extent=0;for(const e of bank.entries){if(!e.active)continue;const age=clock-e.start;if(age>=e.duration){e.active=false;continue;}bank.arrays.p.set(e.pos,n*3);bank.arrays.v.set(e.vel,n*3);bank.arrays.c.set(e.color,n*3);bank.arrays.life.set([e.start,e.duration,e.gravity,e.fade],n*4);bank.arrays.size.set(e.size,n*4);const p=V3(e.pos[0]+e.vel[0]*age,e.pos[1]+e.vel[1]*age-e.gravity*age*age*.5,e.pos[2]+e.vel[2]*age);min.min(p);max.max(p);extent=Math.max(extent,e.size[0],e.size[1]);n++;}
  bank.mesh.geometry.instanceCount=n;bank.mesh.visible=n>0;bank.mesh.material.uniforms.ambient.value=.25+Math.min(1,hemi.intensity)*.6;bank.mesh.material.uniforms.sunDirection.value.copy(sceneryLight.direction.value).transformDirection(camera.matrixWorldInverse);if(n){for(const k of Object.keys(bank.arrays))bank.mesh.geometry.attributes[k].needsUpdate=true;const center=min.clone().add(max).multiplyScalar(.5);bank.mesh.geometry.boundingSphere.set(center,center.distanceTo(max)+extent); }active+=n;
 }
 for(const bank of Object.values(combatVfx.shapes)){let n=0,min=V3(Infinity,Infinity,Infinity),max=V3(-Infinity,-Infinity,-Infinity),extent=0;for(const e of bank.entries){if(!e.active)continue;const age=clock-e.start;if(age>=e.duration){e.active=false;continue;}if(age<0)continue;const t=age/e.duration;pos.copy(e.pos);q.copy(e.rotation);scale.copy(e.scale).multiplyScalar(1+e.expand*age);
   if(e.projectile){pos.lerpVectors(e.projectile.from,e.projectile.to,t);pos.y+=Math.sin(t*Math.PI)*.2;if(clock-e.trail>.045){e.trail=clock;emitParticles(e.projectile.kind==='fire'?'fire':'spark',pos,e.color,2,.5,{speed:.2,gravity:-.1,duration:.28,size:.15,endSize:.02});}}
   else{pos.y+=e.rise*age;if(e.velocity){pos.addScaledVector(e.velocity,age);pos.y-=e.gravity*age*age*.5;}}
   if(e.spin)q.multiply(spin.setFromAxisAngle(V3(0,0,1),age*e.spin));const fade=Math.min(1,age*18)*Math.pow(1-t,.65);matrix.compose(pos,q,scale);bank.mesh.setMatrixAt(n,matrix);bank.mesh.setColorAt(n,e.color);bank.mesh.geometry.attributes.fxAlpha.setX(n,e.opacity*fade);min.min(pos);max.max(pos);extent=Math.max(extent,scale.length()*1.2);n++;
  }bank.mesh.count=n;bank.mesh.visible=n>0;if(n){bank.mesh.instanceMatrix.needsUpdate=true;bank.mesh.instanceColor.needsUpdate=true;bank.mesh.geometry.attributes.fxAlpha.needsUpdate=true;const center=min.clone().add(max).multiplyScalar(.5);bank.mesh.boundingSphere.set(center,center.distanceTo(max)+extent);}active+=n;
 }
 combatVfx.stats.active=active;combatVfx.stats.peak=Math.max(combatVfx.stats.peak,active);
}
const advanceBeforePooledVfx=updateWorldFX;
updateWorldFX=function(dt){advanceBeforePooledVfx(dt);updateCombatVfx();};
const worldBeforePooledVfx=buildWorld;
buildWorld=function(...args){const before=world;worldBeforePooledVfx(...args);if(world!==before)initCombatVfx();};
const disposeBeforePersistentEffects=disposeContinuousWorld;
disposeContinuousWorld=function(){for(const bank of [...Object.values(combatVfx.banks),...Object.values(combatVfx.shapes)])bank.mesh.removeFromParent();disposeBeforePersistentEffects();};
async function prepareGameplayGraphics(){
 $('#load-label').textContent='Preparing your journey…';await new Promise(requestAnimationFrame);
 const ids=['bren','soren','tavin','mira','lysa','brenAscended','tavinAscended','wolf','boar','commander','commander2','commander3','tribeMale','tribeFemale','guardEnemy'],warm=[];
 for(let i=0;i<(combatVfx.stats.warmed?0:ids.length);i++){const id=ids[i];if(!assets.sprites[id])continue;const a=createActor(id,player.x,player.z,2.15);a.mesh.frustumCulled=false;updateActor(a,0);warm.push(a);renderer.initTexture(a.mesh.material.map);if(i%4===0)await new Promise(requestAnimationFrame);}
 const warmPosition=camera.position.clone().addScaledVector(camera.getWorldDirection(V3()),2),banks=[...Object.values(combatVfx.banks),...Object.values(combatVfx.shapes)];
 // A battle camera can reveal materials outside the opening view. Draw one
 // tiny representative of each geometry/material permutation under the loader.
 const representatives=[],variants=new Set();world.traverse(o=>{if(!o.isMesh||o.userData.dynamicFX)return;const materials=Array.isArray(o.material)?o.material:[o.material],key=materials.map(m=>m.uuid).join(',')+'|'+o.geometry.uuid+'|'+!!o.isInstancedMesh+'|'+!!o.instanceColor;if(variants.has(key))return;variants.add(key);let m;if(o.isInstancedMesh){m=new THREE.InstancedMesh(o.geometry,o.material,1);m.setMatrixAt(0,new THREE.Matrix4());if(o.instanceColor)m.setColorAt(0,new THREE.Color('#ffffff'));}else m=new THREE.Mesh(o.geometry,o.material);m.position.copy(warmPosition);m.scale.setScalar(.0001);m.frustumCulled=false;m.receiveShadow=o.receiveShadow;m.castShadow=o.castShadow;m.userData.graphicsWarmup=true;representatives.push(m);});for(const m of representatives)scene.add(m);
 for(const bank of banks){bank.mesh.visible=true;if(bank.mesh.isInstancedMesh){bank.mesh.count=1;bank.mesh.setMatrixAt(0,new THREE.Matrix4().compose(warmPosition,new THREE.Quaternion(),V3(.3,.3,.3)));bank.mesh.instanceMatrix.needsUpdate=true;bank.mesh.setColorAt(0,new THREE.Color('#ffffff'));bank.mesh.instanceColor.needsUpdate=true;bank.mesh.geometry.attributes.fxAlpha.setX(0,.8);bank.mesh.geometry.attributes.fxAlpha.needsUpdate=true;}
  else{bank.mesh.geometry.instanceCount=1;bank.arrays.p.set(warmPosition.toArray(),0);bank.arrays.c.set([1,1,1],0);bank.arrays.life.set([clock-.2,1,0,1],0);bank.arrays.size.set([.35,.35,0,0],0);for(const k of Object.keys(bank.arrays))bank.mesh.geometry.attributes[k].needsUpdate=true;}bank.mesh.frustumCulled=false;}
 try{
  const oldTarget=renderer.getRenderTarget(),oldClip=renderer.clippingPlanes;renderer.setRenderTarget(post.target);
  try{if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),1.4)];if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);}finally{renderer.clippingPlanes=oldClip;renderer.setRenderTarget(oldTarget);}
  // Exercise the real HDR, reflection, shadow and output passes while covered
  // by the loading photograph, so their target-specific variants are ready.
  renderBeforeLoadingGate();
  if(!battle&&combatVfx.previewWorld!==world.userData.serial){
   const saved={mode:state.mode,scene:state.scene,battles:openWorldDebug.battles,characters:Object.fromEntries(Object.entries(state.characters).map(([id,c])=>[id,{charge:c.charge,ascended:c.ascended}]))},panels=['hud','battle-hud','battle-message','combo','letterbox'].map(id=>({id,classes:$('#'+id).className}));
   beginBattle('commander3');battle.intro=0;makeQueue();updateLighting();updateCamera(1,true);renderBeforeLoadingGate();endBattle('graphics-warmup');
   state.mode=saved.mode;state.scene=saved.scene;openWorldDebug.battles=saved.battles;for(const[id,values]of Object.entries(saved.characters))Object.assign(state.characters[id],values);for(const p of panels)$('#'+p.id).className=p.classes;updateLighting();updateCamera(1,true);combatVfx.previewWorld=world.userData.serial;
  }
  const gl=renderer.getContext();if(gl.fenceSync){const fence=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();for(let i=0;i<240;i++){const status=gl.clientWaitSync(fence,0,0);if(status!==gl.TIMEOUT_EXPIRED)break;await new Promise(resolve=>setTimeout(resolve,16));}gl.deleteSync(fence);}
 }
 finally{for(const m of representatives){m.removeFromParent();if(m.isInstancedMesh)m.dispose();}combatVfx.warmResources??=[];for(const a of warm){a.mesh.removeFromParent();a.shadow.removeFromParent();actors=actors.filter(q=>q!==a);if(combatVfx.warmResources.length<34)combatVfx.warmResources.push(a.mesh.material,a.shadow.material);else{a.mesh.material.map.dispose();a.mesh.material.dispose();a.shadow.material.dispose();}a.mesh.geometry.dispose();a.shadow.geometry.dispose();}for(const bank of banks){bank.mesh.visible=false;bank.mesh.frustumCulled=true;if(bank.mesh.isInstancedMesh)bank.mesh.count=0;else bank.mesh.geometry.instanceCount=0;}combatVfx.stats.warmed=true;}
}
