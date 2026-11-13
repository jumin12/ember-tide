// Bren's authored clips and world-space effects share one action clock.
// Presentation changes do not resolve damage, MP, turns or rewards.
const bren82={context:null,world:null,pool:null,action:null,serial:0,contacts:0,peakLights:0};
const brenSurface82={positions:{value:[V3(),V3(),V3()]},powers:{value:[V3(),V3(),V3()]},materials:new WeakSet()};
function brenRoot82(){return encounter53.active?encounter53.scene:world;}
function lightPaintedSurface82(m){
 if(!m||m.isShaderMaterial||brenSurface82.materials.has(m))return;brenSurface82.materials.add(m);
 const before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.brenPosition82=brenSurface82.positions;s.uniforms.brenPower82=brenSurface82.powers;
  s.vertexShader='varying vec3 brenWorld82;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 brenLocal82=vec4(transformed,1.);
   #ifdef USE_INSTANCING
    brenLocal82=instanceMatrix*brenLocal82;
   #endif
   brenWorld82=(modelMatrix*brenLocal82).xyz;`);
  s.fragmentShader='varying vec3 brenWorld82;uniform vec3 brenPosition82[3],brenPower82[3];\n'+s.fragmentShader;
  // The plate is reconstructed into real depth. Local radiance is evaluated
  // on that surface, leaving its painted ambient light intact at zero power.
  s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`vec3 brenIncoming82=vec3(0.);
   for(int i=0;i<3;i++){if(dot(brenPower82[i],brenPower82[i])<.00001)continue;float d=distance(brenWorld82,brenPosition82[i]);float fall=pow(max(0.,1.-d/11.),2.)/(1.+.3*d*d);brenIncoming82+=brenPower82[i]*fall;}
   outgoingLight+=(vec3(.12)+diffuseColor.rgb*.65)*brenIncoming82;
   #include <opaque_fragment>`);
 };
 m.customProgramCacheKey=()=>key()+'-party-surface-light84';m.needsUpdate=true;
}
const brenSceneryBefore82=buildStageScenery59;
buildStageScenery59=function(...args){const result=brenSceneryBefore82(...args);for(const m of stageDepth59.materials)lightPaintedSurface82(m);return result;};
function isBren82(a){return !!a&&!a.enemy&&(a.characterId==='bren'||['bren','brenAscended'].includes(a.visualId??a.id));}
function brenClip82(a){
 if(!isBren82(a)||!battle)return a.action;
 const meta=assets.sprites[a.visualId??a.id];if(!meta.frames.drivingSlash)return a.action;
 const resolved=clip=>{if(a.brenResolved82!==clip){a.brenResolved82=clip;a.actionTime=0;}return clip;};
 if(battle.animation?.actor===a&&battle.animation.bren82)return resolved(battle.animation.bren82.clip);
 if(a.action==='recoil')return a.action;
 const hp=state.characters.bren.hp;
 if(['battleIdle','guard'].includes(a.action)){
  if(hp<=stats('bren').hp*.25)return resolved('injured');
  if(battle.status==='victory')return resolved('victory');
  if(battle.guards.has('bren'))return resolved('guard');
 }
 return resolved(a.action);
}
const brenComboBefore82=resolveCombo;
resolveCombo=function(...args){
 const c=battle?.combo;if(c?.id!=='bren')return brenComboBefore82(...args);
 const n=clamp(c.success,1,3);bren82.context={clip:n===3?'attackChain':n===2?'attackPair':'comboSlash'};
 try{return brenComboBefore82(...args);}finally{bren82.context=null;}
};
const brenSkillBefore82=executeSkill;
executeSkill=function(id,index,...args){
 if(id!=='bren')return brenSkillBefore82(id,index,...args);
 bren82.context={clip:index===0?'drivingSlash':'cast'};
 try{return brenSkillBefore82(id,index,...args);}finally{bren82.context=null;}
};
const brenActionBefore82=startActionAnimation;
startActionAnimation=function(opts){
 const a=opts.actor,meta=a&&assets.sprites[a.visualId??a.id];
 if(!isBren82(a)||!meta?.frames.drivingSlash)return brenActionBefore82(opts);
 const clip=bren82.context?.clip??(a.action==='attack'?'comboSlash':a.action),frames=meta.frames[clip];
 if(!frames)return brenActionBefore82(opts);
 const authored=meta.actionTimings?.[clip],duration=bren82.context?.ascend?opts.duration:authored?.duration??opts.duration;
 const impactAt=((meta.impactFrame?.[clip]??Math.floor(frames.length*.5))+.5)/frames.length;
 brenActionBefore82({...opts,duration,impactAt});
 const cue=battle?.animation;if(cue?.actor===a){cue.bren82={clip,serial:++bren82.serial,target:opts.lunge,ascend:!!bren82.context?.ascend,contacts:authored?.contacts??[],windows:authored?.windows??[]};a.actionTime=0;}
};
const brenAscendBefore82=ascend;
ascend=function(id,...args){if(id!=='bren')return brenAscendBefore82(id,...args);bren82.context={clip:'cast',ascend:true};try{return brenAscendBefore82(id,...args);}finally{bren82.context=null;}};
function brenLiveFrame82(c){
 const p=clamp(c.t/c.duration,0,1),clip=['comboSlash','comboOverhead','comboUppercut'][c.step],m=assets.sprites[c.actor.visualId??c.actor.id],n=m.frames[clip].length;
 // Each complete cut has its own contact pose and recovery length. A wider
 // sword canvas never changes the authored hand or foot positions.
 const peak=clamp(m.impactFrame?.[clip]??4,1,n-1),pre=peak-1;
 const frame=p<.6?pre*p/.6:p<.72?pre+(p-.6)/.12:p<.85?peak:peak+(n-1-peak)*(p-.85)/.15;
 return {clip,frame:clock<c.impactUntil?peak:Math.min(n-1,frame),n};
}
const brenActorBefore82=updateActor;
updateActor=function(a,dt){brenActorBefore82(a,dt);const c=battle?.combo;if(c?.id!=='bren'||c.actor!==a||battle.status!=='combo')return;const pose=brenLiveFrame82(c);setActorFrame(a,pose.clip,Math.floor(pose.frame+.0001));};
const brenLiveHitBefore82=applyLiveChainHit;
applyLiveChainHit=function(c,hit){
 if(c.id!=='bren')return brenLiveHitBefore82(c,hit);
 // Early successful presses are remembered until the physical contact pose.
 if(hit&&c.t/c.duration<.72){c.pendingContact=hit;return;}
 const wasApplied=c.applied,result=brenLiveHitBefore82(c,hit);
 if(!wasApplied&&c.applied)brenContact82(actorImpactPoint(c.target.actor),hit&&c.step===2||state.characters.bren.ascended);
 return result;
};

const brenVertex82=`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const brenTrailFragment82=`varying vec2 v;uniform float opacity;uniform vec3 tint;
void main(){float aa=max(.004,fwidth(v.x));
float core=exp(-pow((v.x-.91)/(.012+aa),2.));
float filament=exp(-pow((v.x-.76)/(.008+aa),2.))*.50;
float halo=exp(-pow((v.x-.87)/.13,2.))*.19;
float tail=smoothstep(0.,.18,v.y)*pow(clamp(v.y,0.,1.),.40);
gl_FragColor=vec4(mix(tint,vec3(1.55,1.8,2.),core*.82),(core+filament+halo)*tail*opacity);}`;
const brenBurstFragment82=`varying vec2 v;uniform float age,opacity;uniform vec3 tint;uniform float floorRing;
void main(){vec2 p=v*2.-1.;float r=length(p),a=atan(p.y,p.x);float life=1.-age;
float ring=exp(-pow((r-(.15+age*.72))/.025,2.));float spokes=pow(max(0.,cos(a*6.+age*2.)),20.)*exp(-r*4.);
float glow=exp(-r*9.)*life;float alpha=mix(glow+spokes*life+ring*life*.5,ring*life,floorRing)*opacity;
gl_FragColor=vec4(mix(tint,vec3(1.6),exp(-r*14.)),alpha);}`;
function brenMaterial82(fragment,uniforms){return new THREE.ShaderMaterial({vertexShader:brenVertex82,fragmentShader:fragment,uniforms,transparent:true,depthTest:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false});}
function disposeBrenFX82(){
 const p=bren82.pool;if(p){for(const m of [...p.trails.map(q=>q.mesh),...p.bursts.flatMap(q=>[q.mesh,q.floor]),p.sparks]){m.removeFromParent();m.geometry.dispose();m.material.dispose();}for(const l of p.lights)l.removeFromParent();}
 bren82.pool=null;bren82.world=null;bren82.action=null;
 for(const p of brenSurface82.powers.value)p.set(0,0,0);
}
function initBrenFX82(){
 const root=brenRoot82();if(bren82.world===root&&bren82.pool)return bren82.pool;
 disposeBrenFX82();const trails=[];
 for(let n=0;n<3;n++){
  const g=new THREE.BufferGeometry(),positions=new Float32Array(64*3),uv=new Float32Array(64*2),indices=[];
  for(let i=0;i<32;i++){uv[i*4]=0;uv[i*4+1]=i/31;uv[i*4+2]=1;uv[i*4+3]=i/31;if(i<31){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}}
  g.setAttribute('position',new THREE.BufferAttribute(positions,3).setUsage(THREE.DynamicDrawUsage));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(indices);g.setDrawRange(0,0);
  const m=brenMaterial82(brenTrailFragment82,{opacity:{value:0},tint:{value:new THREE.Color('#42aaff')}}),mesh=new THREE.Mesh(g,m);mesh.frustumCulled=false;mesh.visible=false;root.add(mesh);
  trails.push({mesh,samples:[],anchor:V3(),age:1,active:false,window:-1});
 }
 const bursts=[];for(let i=0;i<8;i++){
  const uniforms={age:{value:0},opacity:{value:0},tint:{value:new THREE.Color('#8bcfff')},floorRing:{value:0}},m=brenMaterial82(brenBurstFragment82,uniforms),mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),m),floor=new THREE.Mesh(new THREE.PlaneGeometry(1,1),brenMaterial82(brenBurstFragment82,{...uniforms,floorRing:{value:1}}));
  mesh.visible=floor.visible=false;floor.rotation.x=-Math.PI/2;root.add(mesh,floor);bursts.push({mesh,floor,age:10,duration:.55,size:1});
 }
 const lights=[0,1].map(()=>{const l=new THREE.PointLight('#86caff',0,11,2);l.castShadow=false;l.userData.bren82=true;root.add(l);return l;});
 const sparks=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.04,0),new THREE.MeshBasicMaterial({color:'#89cfff',transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),48);sparks.frustumCulled=false;sparks.visible=false;root.add(sparks);
 bren82.world=root;bren82.pool={trails,bursts,lights,sparks,particles:[],matrix:new THREE.Matrix4(),vector:V3(),right:V3(),up:V3(),tip:V3(),grip:V3(),cursor:0};return bren82.pool;
}
function brenContact82(position,strong=false,gold=false){
 const p=initBrenFX82(),b=p.bursts[p.cursor++%p.bursts.length];b.age=0;b.duration=gold?.85:.5;b.size=gold?3.2:strong?3:1.9;
 b.mesh.position.copy(position);b.floor.position.set(position.x,heightAt(position.x,position.z)+.035,position.z);b.mesh.material.uniforms.tint.value.set(gold?'#ffd477':'#7bcfff');
 b.mesh.visible=b.floor.visible=true;bren82.contacts++;
 const l=p.lights[1];l.position.copy(position);l.position.y=Math.max(l.position.y,heightAt(l.position.x,l.position.z)+.7);l.color.set(gold?'#ffd477':'#65baff');l.intensity=strong?48:30;l.userData.life=.32;
 for(let i=0;i<(strong?18:10);i++){if(p.particles.length===48)break;const angle=i*2.39996;p.particles.push({x:position.x,y:position.y,z:position.z,vx:Math.cos(angle)*(1+i%3*.4),vy:1.2+i%4*.3,vz:Math.sin(angle)*(1+i%3*.4),age:0,life:.25+i%4*.06});}
}
function brenWeapon82(a,clip,progress,out){
 const m=assets.sprites[a.visualId??a.id],frames=m.frames[clip];if(!frames||!m.weaponFrames)return false;
 const f=clamp(progress*frames.length,0,frames.length-1),i=Math.floor(f),t=f-i,q=m.weaponFrames[frames[i]],r=m.weaponFrames[frames[Math.min(i+1,frames.length-1)]]??q;if(!q)return false;
 const s=a.size/m.unit,scaleX=a.mesh.scale.x;out.right.set(1,0,0).applyQuaternion(a.mesh.quaternion);out.up.set(0,1,0).applyQuaternion(a.mesh.quaternion);
 const gx=mix(q[2],r[2],t),gy=mix(q[3],r[3],t),qa=Math.atan2(q[1]-q[3],q[0]-q[2]),ra=Math.atan2(r[1]-r[3],r[0]-r[2]);
 const angle=qa+Math.atan2(Math.sin(ra-qa),Math.cos(ra-qa))*t,length=mix(Math.hypot(q[0]-q[2],q[1]-q[3]),Math.hypot(r[0]-r[2],r[1]-r[3]),t);
 out.grip.copy(a.mesh.position).addScaledVector(out.right,gx*s*scaleX).addScaledVector(out.up,gy*s*a.mesh.scale.y);
 out.tip.copy(out.grip).addScaledVector(out.right,Math.cos(angle)*length*s*scaleX).addScaledVector(out.up,Math.sin(angle)*length*s*a.mesh.scale.y);return true;
}
function updateBrenFX82(dt){
 if(bren82.world&&bren82.world!==brenRoot82())disposeBrenFX82();
 const live=battle?.status==='combo'&&battle.combo?.id==='bren'?battle.combo:null;
 let cue=battle?.animation;
 if(live){
  if(live.brenCue82?.step!==live.step)live.brenCue82={actor:live.actor,time:live.t,duration:live.duration,step:live.step,bren82:{clip:['comboSlash','comboOverhead','comboUppercut'][live.step],serial:++bren82.serial,target:live.target.actor,live:true,contacts:[],windows:[[.58,.97]]}};
  cue=live.brenCue82;cue.time=live.t;
  if(live.cinema141)cue.bren82.clip=live.cinema141.pose.clip;
 }
 const move=cue?.bren82,a=cue?.actor;
 if(move&&isBren82(a)){
  const p=initBrenFX82(),t=clamp(cue.time/cue.duration,0,1);
  if(bren82.action?.cue!==cue)bren82.action={cue,contacts:new Set(),lastT:0};
  const action=bren82.action;
  for(let i=0;i<move.contacts.length;i++)if(t>=move.contacts[i]&&!action.contacts.has(i)){
   action.contacts.add(i);const target=move.target??battle.enemies[battle.target]?.actor??battle.enemies.find(e=>e.hp>0)?.actor;
   if(target){p.vector.copy(actorImpactPoint(target));brenContact82(p.vector,move.clip==='drivingSlash'||i===move.contacts.length-1);}
  }
  const window=move.windows.findIndex(w=>t>=w[0]&&t<=w[1]);
  const weaponProgress=live?brenLiveFrame82(live).frame/assets.sprites[a.visualId??a.id].frames[move.clip].length:t;
  if(window>=0&&brenWeapon82(a,move.clip,weaponProgress,p)){
   const tr=p.trails[window%3];if(!tr.active||tr.window!==window){tr.samples.length=0;tr.window=window;}
   tr.active=true;tr.age=0;tr.mesh.visible=true;
   tr.anchor.copy(a.mesh.position);const o=tr.anchor;
   const sample=[p.grip.x-o.x,p.grip.y-o.y,p.grip.z-o.z,p.tip.x-o.x,p.tip.y-o.y,p.tip.z-o.z],last=tr.samples[tr.samples.length-1];
   // A held bullet-time pose must not push its whole arc out of the ribbon
   // history with repeated zero-length segments. Only moving steel adds one.
   if(!last||sample.some((v,i)=>Math.abs(v-last[i])>.0001)){tr.samples.push(sample);if(tr.samples.length>32)tr.samples.shift();}
   const l=p.lights[0];l.position.lerpVectors(p.grip,p.tip,.6);l.color.set('#63bfff');l.intensity=move.clip==='drivingSlash'?24:15;l.userData.life=.1;
  }
  for(const tr of p.trails)if(tr.window!==window)tr.active=false;
  action.lastT=t;
 }else if(bren82.pool){for(const tr of bren82.pool.trails)tr.active=false;bren82.action=null;}
 const p=bren82.pool;if(!p)return;
 for(const tr of p.trails){if(!tr.active)tr.age+=dt;tr.mesh.visible=tr.samples.length>1&&tr.age<.2;if(!tr.mesh.visible)continue;
  const n=tr.samples.length,attr=tr.mesh.geometry.attributes.position,uv=tr.mesh.geometry.attributes.uv;
  for(let i=0;i<n;i++){const s=tr.samples[i],k=i*2,o=tr.anchor;attr.setXYZ(k,o.x+mix(s[0],s[3],.2),o.y+mix(s[1],s[4],.2),o.z+mix(s[2],s[5],.2));attr.setXYZ(k+1,o.x+s[3],o.y+s[4],o.z+s[5]);uv.setXY(k,0,i/Math.max(1,n-1));uv.setXY(k+1,1,i/Math.max(1,n-1));}
  attr.needsUpdate=uv.needsUpdate=true;tr.mesh.geometry.setDrawRange(0,(n-1)*6);tr.mesh.material.uniforms.opacity.value=(1-tr.age/.2)*.75;
 }
 for(const b of p.bursts){b.age+=dt;const t=b.age/b.duration;b.mesh.visible=b.floor.visible=t<1;if(t>=1)continue;
  b.mesh.quaternion.copy(camera.quaternion);b.mesh.scale.setScalar(b.size);b.floor.scale.setScalar(b.size*1.2);b.mesh.material.uniforms.age.value=t;b.mesh.material.uniforms.opacity.value=.9;
 }
 let liveLights=0;for(let i=0;i<p.lights.length;i++){const l=p.lights[i],life=l.userData.life??0;if(life>0){const next=Math.max(0,life-dt);l.intensity*=next/life;l.userData.life=next;}else l.intensity=0;if(l.intensity>.05)liveLights++;brenSurface82.positions.value[i].copy(l.position);brenSurface82.powers.value[i].set(l.color.r,l.color.g,l.color.b).multiplyScalar(l.intensity*.03);}bren82.peakLights=Math.max(bren82.peakLights,liveLights);
 for(let i=p.particles.length-1;i>=0;i--){const s=p.particles[i];s.age+=dt;if(s.age>s.life){p.particles.splice(i,1);continue;}s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.vy-=5*dt;}
 p.sparks.visible=p.particles.length>0;p.sparks.count=p.particles.length;for(let i=0;i<p.particles.length;i++){const s=p.particles[i],scale=1-s.age/s.life;p.matrix.makeScale(scale,scale*2.2,scale);p.matrix.setPosition(s.x,s.y,s.z);p.sparks.setMatrixAt(i,p.matrix);}p.sparks.instanceMatrix.needsUpdate=true;
}
const brenCastBefore82=castFX;
castFX=function(kind,from,to,strong=false,...args){
 const own=isBren82(battle?.animation?.actor)||battle?.status==='combo'&&battle.combo?.id==='bren'||kind==='ascend'&&bren82.context?.ascend;
 if(own&&['blade','heal','ascend'].includes(kind)){
  if(kind!=='blade')brenContact82(to,strong,kind==='heal');
  playSound(kind==='blade'?'blade-impact':kind==='heal'?'heal':'ascension',strong?.8:.55);return;
 }
 return brenCastBefore82(kind,from,to,strong,...args);
};
const brenWorldFXBefore82=updateWorldFX;
updateWorldFX=function(dt){brenWorldFXBefore82(dt);updateBrenFX82(dt);};
const brenBattleBefore82=beginBattle;
beginBattle=function(...args){const result=brenBattleBefore82(...args);if(battle)initBrenFX82();return result;};
const brenEndBefore82=endBattle;
endBattle=function(...args){const result=brenEndBefore82(...args);if(!battle)disposeBrenFX82();return result;};
