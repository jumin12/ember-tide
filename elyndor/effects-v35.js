// Contact occlusion is separate from the alpha-tested directional shadow.
// One draw serves all feet; a dissolving or hidden actor never leaves a mark.
const effects35={contacts:0,bursts:0,uploads:0,skipped:0},scratch35={matrix:new THREE.Matrix4(),q:new THREE.Quaternion(),spin:new THREE.Quaternion(),p:V3(),s:V3(),min:V3(),max:V3(),axis:V3(0,0,1),center:V3()};
function makeContacts35(){
 const g=new THREE.PlaneGeometry(1,1),a=new THREE.InstancedBufferAttribute(new Float32Array(256),1).setUsage(THREE.DynamicDrawUsage);g.setAttribute('contact35',a);
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,polygonOffset:true,polygonOffsetFactor:-1,uniforms:{},vertexShader:'attribute float contact35;varying vec2 uv35;varying float a35;void main(){uv35=uv;a35=contact35;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 uv35;varying float a35;void main(){vec2 p=(uv35-.5)*2.;float r=dot(p,p);float a=exp(-r*3.8)*(1.-smoothstep(.45,1.,r))*a35;if(a<.003)discard;gl_FragColor=vec4(.025,.032,.043,a);}'});
 const o=new THREE.InstancedMesh(g,m,256);o.name='actor-contact-occlusion35';o.count=0;o.frustumCulled=false;o.renderOrder=1;o.userData.dynamicFX=true;o.instanceMatrix.setUsage(THREE.DynamicDrawUsage);world.add(o);world.userData.contacts35=o;
}
function updateContacts35(){
 const o=world?.userData.contacts35;if(!o)return;let n=0;const q=scratch35.q.setFromAxisAngle(V3(1,0,0),-Math.PI/2),d=scratch35;
 for(const a of actors){if(!a.mesh.visible||a.mesh.parent!==world||a.pixelReleased&&(a.dissolveTime??0)>2.3||n>=256)continue;
  const monster=a.id==='wolf'||a.id==='boar',r=monster?(a.id==='wolf'?1.05:.92):.52,floor=heightAt(a.x,a.z),lift=Math.max(0,a.mesh.position.y-floor-.055);
  d.p.set(a.x,floor+.032,a.z);d.s.set(r*2,r*1.1,1);d.matrix.compose(d.p,q,d.s);o.setMatrixAt(n,d.matrix);o.geometry.attributes.contact35.setX(n,.40*Math.exp(-lift*2)*(a.pixelReleased?1-smooth(0,2.3,a.dissolveTime??0):1));n++;
 }
 o.count=n;o.visible=n>0;o.instanceMatrix.needsUpdate=true;o.geometry.attributes.contact35.needsUpdate=true;effects35.contacts=n;
}
const contactsBuildBefore35=buildWorld;
buildWorld=function(...args){const r=contactsBuildBefore35(...args);makeContacts35();return r;};
const contactsRenderBefore35=render;
render=function(...args){updateContacts35();return contactsRenderBefore35(...args);};
// Particle trajectories already run on the GPU. Only births/deaths upload a
// compact buffer; conservative lifetime bounds include delayed particles.
const emitBefore35=emitParticles;
emitParticles=function(kind,...args){const r=emitBefore35(kind,...args),b=combatVfx.banks[kind];if(b)b.dirty35=true;return r;};
updateCombatVfx=function(){
 if(combatVfx.world!==world)return;combatVfx.time.value=clock;let active=0;const d=scratch35;
 for(const b of Object.values(combatVfx.banks)){
  let dirty=b.dirty35,n=0;for(const e of b.entries)if(e.active){if(clock-e.start>=e.duration){e.active=false;dirty=true;}else n++;}
  b.mesh.visible=n>0;b.mesh.geometry.instanceCount=n;active+=n;if(!n){b.dirty35=false;continue;}
  b.mesh.material.uniforms.ambient.value=.25+Math.min(1,hemi.intensity)*.6;b.mesh.material.uniforms.sunDirection.value.copy(sceneryLight.direction.value).transformDirection(camera.matrixWorldInverse);
  if(!dirty){effects35.skipped++;continue;}d.min.set(Infinity,Infinity,Infinity);d.max.set(-Infinity,-Infinity,-Infinity);let at=0;
  for(const e of b.entries){if(!e.active)continue;b.arrays.p.set(e.pos,at*3);b.arrays.v.set(e.vel,at*3);b.arrays.c.set(e.color,at*3);const k=at*4;b.arrays.life[k]=e.start;b.arrays.life[k+1]=e.duration;b.arrays.life[k+2]=e.gravity;b.arrays.life[k+3]=e.fade;b.arrays.size.set(e.size,k);
   const radius=Math.max(e.size[0],e.size[1]),travel=Math.abs(e.gravity)*e.duration*e.duration*.5;for(let i=0;i<3;i++){const end=e.pos[i]+e.vel[i]*e.duration;d.min.setComponent(i,Math.min(d.min.getComponent(i),e.pos[i],end)-radius-(i===1?travel:0));d.max.setComponent(i,Math.max(d.max.getComponent(i),e.pos[i],end)+radius+(i===1?travel:0));}at++;
  }
  for(const k of Object.keys(b.arrays))b.mesh.geometry.attributes[k].needsUpdate=true;d.center.copy(d.min).add(d.max).multiplyScalar(.5);b.mesh.geometry.boundingSphere.set(d.center,d.center.distanceTo(d.max));b.dirty35=false;effects35.uploads++;
 }
 for(const b of Object.values(combatVfx.shapes)){let n=0,extent=0;d.min.set(Infinity,Infinity,Infinity);d.max.set(-Infinity,-Infinity,-Infinity);
  for(const e of b.entries){if(!e.active)continue;const age=clock-e.start;if(age>=e.duration){e.active=false;continue;}if(age<0)continue;const t=age/e.duration;d.p.copy(e.pos);d.q.copy(e.rotation);d.s.copy(e.scale).multiplyScalar(1+e.expand*age);
   if(e.projectile){d.p.lerpVectors(e.projectile.from,e.projectile.to,t);d.p.y+=Math.sin(t*Math.PI)*.2;if(clock-e.trail>.045){e.trail=clock;emitParticles(e.projectile.kind==='fire'?'fire':'spark',d.p,e.color,2,.5,{speed:.2,gravity:-.1,duration:.28,size:.15,endSize:.02});}}
   else{d.p.y+=e.rise*age;if(e.velocity){d.p.addScaledVector(e.velocity,age);d.p.y-=e.gravity*age*age*.5;}}
   if(e.spin)d.q.multiply(d.spin.setFromAxisAngle(d.axis,age*e.spin));const fade=Math.min(1,age*18)*Math.pow(1-t,.65);d.matrix.compose(d.p,d.q,d.s);b.mesh.setMatrixAt(n,d.matrix);b.mesh.setColorAt(n,e.color);b.mesh.geometry.attributes.fxAlpha.setX(n,e.opacity*fade);d.min.min(d.p);d.max.max(d.p);extent=Math.max(extent,d.s.length()*1.2);n++;
  }b.mesh.count=n;b.mesh.visible=n>0;if(b.opacity35){let alpha=0;for(let i=0;i<n;i++)alpha=Math.max(alpha,b.mesh.geometry.attributes.fxAlpha.getX(i));b.mesh.material.opacity=alpha;}active+=n;if(n){b.mesh.instanceMatrix.needsUpdate=true;b.mesh.instanceColor.needsUpdate=true;b.mesh.geometry.attributes.fxAlpha.needsUpdate=true;d.center.copy(d.min).add(d.max).multiplyScalar(.5);b.mesh.boundingSphere.set(d.center,d.center.distanceTo(d.max)+extent);}
 }
 combatVfx.stats.active=active;combatVfx.stats.peak=Math.max(combatVfx.stats.peak,active);
};
function flameRibbon35(){const p=[],uv=[],idx=[],steps=72;for(let i=0;i<=steps;i++){const t=i/steps,a=t*Math.PI*3.1,r=.55+Math.sin(t*Math.PI)*.95,y=t*4.5,width=Math.sin(t*Math.PI)*.46+.03;for(const s of[-1,1]){p.push(Math.cos(a)*(r+s*width),y+s*width*.35,Math.sin(a)*(r+s*width));uv.push(t,s*.5+.5);}if(i<steps){const n=i*2;idx.push(n,n+2,n+1,n+1,n+2,n+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function flameMaterial35(){return new THREE.MeshBasicMaterial({map:textures.fx35FlameSlash??textures.fxFire,color:'#ffc477',transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending});}

const initFXBefore35=initCombatVfx;
initCombatVfx=function(...args){const r=initFXBefore35(...args);if(!combatVfx.shapes.inferno35)combatVfx.shapes.inferno35=makeShapeBank('inferno35',flameRibbon35(),flameMaterial35(),24);return r;};
const castBefore35=castFX;
castFX=function(kind,from,to,strong=false,impactOnly=false){const r=castBefore35(kind,from,to,strong,impactOnly);if(!battle)return r;effects35.bursts++;const floor=V3(to.x,heightAt(to.x,to.z)+.12,to.z),power=strong?1.25:1;
 if(['fire','ascend'].includes(kind)){
  const flame=kind==='fire',c=flame?'#ffd38e':'#a6d7ff';for(let i=0;i<3;i++)shapeEffect('inferno35',floor,c,1.4+i*.18,{rotation:new THREE.Quaternion().setFromAxisAngle(axis24,i*TAU/3),scale:V3(power,power,power),spin:0,rise:.2,delay:i*.08,opacity:.9});
  emitParticles('fire',floor.clone().add(V3(0,1,0)),flame?'#ffc477':'#aadfff',24,power,{size:.5,endSize:.15,duration:1.5,speed:2.8,gravity:-.3});emitParticles('smoke',floor.clone().add(V3(0,1,0)),'#555963',12,1,{size:.7,endSize:3,duration:2.5,speed:.8,gravity:-.2});emitParticles('spark',floor,'#ffe5b3',30,power,{size:.075,endSize:.008,duration:2.2,speed:4,gravity:1.5});effectLight(floor.clone().add(V3(0,2,0)),flame?'#ff843b':'#8fc9ff',strong?72:52,1.55);
 }else if(kind==='blade'&&strong){const q=camera.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,.2,-.75)));shapeEffect('ribbon',to,'#fff1c8',.64,{rotation:q,scale:V3(6,3.4,1),spin:.7,delay:.025,opacity:.85});emitParticles('spark',to,'#ffd08a',18,1,{duration:1.1,speed:7,size:.07,endSize:.01});effectLight(to,'#ffd094',32,.55);}
 return r;
};

// Use material opacity for a coherent packet. A pool renders one
// coherent impact packet and fades it without adding a custom vertex varying.
const shapeBankBefore35=makeShapeBank;
makeShapeBank=function(name,g,m,capacity){const compile=m.onBeforeCompile,key=m.customProgramCacheKey();const b=shapeBankBefore35(name,g,m,capacity);m.onBeforeCompile=compile;m.customProgramCacheKey=()=>key+'-packet-alpha35';m.needsUpdate=true;b.opacity35=true;return b;};
