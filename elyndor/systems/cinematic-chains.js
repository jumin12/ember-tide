// One choreography clock owns the pose, input window, release and contact.
// Combat rules still own damage, weaknesses, rewards and initiative.
const cinematic141={events:[],serial:0};
function chainRate141(x){return x?mix(1,.24,x.bullet):1;}
function chainEvent141(c,type,extra={}){cinematic141.events.push({type,id:c.id,step:c.step,time:clock,rate:chainRate141(c.cinema141),bullet:c.cinema141?.bullet??0,...extra});if(cinematic141.events.length>120)cinematic141.events.shift();}
function chainPaused141(){return !!(menu||dialogue||devConsole60.open||phoneCombat69.manualHelp||combatLesson18()?.hold);}
function chainPose141(c,override){
 const m=assets.sprites[c.actor.visualId??c.actor.id],wanted=override??(c.id==='bren'?['comboSlash','comboOverhead','comboUppercut'][c.step]:c.id==='soren'?['pulseOne','pulseTwo','pulseThree'][c.step]:'attack');
 const clip=m.frames[wanted]?wanted:m.frames.attack?'attack':m.frames.cast?'cast':'battleIdle',n=m.frames[clip].length,peak=clamp(m.impactFrame?.[clip]??Math.round((n-1)*.55),Math.min(1,n-1),n-1);
 return {clip,n,peak,pre:clamp(m.anticipationFrame?.[clip]??peak-1,0,peak)};
}
function chainPhase141(c,phase){const x=c.cinema141;x.phase=phase;x.time=x.motionTime=0;chainEvent141(c,phase);}
function chainBeat141(c){
 const x=c.cinema141;x.pose=chainPose141(c);x.frame=0;x.focusTime=0;x.releaseFrom=0;x.feedback='';x.finalMotion=false;
 c.input=null;c.applied=false;c.projectileStarted=false;c.contactAt=0;c.impactUntil=0;c.ending=false;c.t=0;delete c.pendingContact;
 c.actor.action='attack';c.actor.actionTime=0;chainPhase141(c,'windup');
}
function initChain141(c){
 const a=c.actor,v=c.target.actor,s=silhouette87(v.visualId??v.id),d=Math.max(.001,dist(c.start,v)),space=clamp(1.65+Math.max(Math.abs(s.left),s.right)*v.size*.42,2.1,3.8),travel=c.id==='bren'&&(encounter53.active||edgeFree(c.start,v,.5))?Math.max(0,d-space):0;
 c.cinema141={serial:++cinematic141.serial,total:0,phase:'windup',time:0,motionTime:0,frame:0,bullet:0,slow:false,near:{x:c.start.x+(v.x-c.start.x)/d*travel,z:c.start.z+(v.z-c.start.z)/d*travel},victim:{x:v.x,z:v.z},feedback:''};
 chainBeat141(c);ensureChainCue141();updateChainCue141(c);
}
const cinematicActionBefore141=battleAction;
battleAction=function(...args){const r=cinematicActionBefore141(...args);if(battle?.status==='combo'&&battle.combo?.actor&&!battle.combo.cinema141)initChain141(battle.combo);return r;};
function ensureChainCue141(){
 const n=$('#combo');if(n.classList.contains('cinematic-chain141'))return;n.classList.add('cinematic-chain141');
 const hit=$('#timing-hit');hit.innerHTML='<svg class="chain-ring141" viewBox="0 0 110 110" aria-hidden="true"><circle class="chain-rail141" cx="55" cy="55" r="33"/><circle class="chain-gold141" cx="55" cy="55" r="33"/><circle class="chain-incoming141" cx="55" cy="55" r="33"/></svg><span class="chain-key141"><kbd>E</kbd><b>Strike</b></span>';
 hit.setAttribute('aria-label','Strike at the gold focus');hit.type='button';
 n.insertAdjacentHTML('beforeend','<div class="chain-beats141" aria-label="Three strike chain"><i></i><i></i><i></i></div>');
}
function updateChainCue141(c){
 const x=c.cinema141,n=$('#combo'),hit=$('#timing-hit'),p=c.t/c.duration,ready=x.phase==='focus'&&p>=.65&&p<=.85,focus=x.phase==='focus',text=x.phase==='windup'?'Read the opening':focus?(combatLesson18()?.windowPaused?'The opening waits · press E, Space or Strike':'Wait for the rings to meet in gold'):x.phase==='release'?(c.input==='hit'?'Release!':'Off timing'):x.phase==='apex'?'Rising slash':x.phase==='finalRelease'?'Final impact':x.phase==='flight'?'Follow through':x.phase==='hitstop'?(c.input==='hit'?'Clean hit':'Glancing hit'):x.phase==='return'?'Recovering':'Keep the rhythm';
 n.dataset.beat141=x.phase;n.classList.toggle('chain-ready141',ready);n.classList.toggle('chain-missed141',c.input==='miss');
 hit.disabled=!focus||!!c.input;hit.setAttribute('aria-description',ready?'Strike now':text);
 const ring=hit.querySelector('.chain-incoming141');ring.style.transform='scale('+(focus?mix(1.65,.80,clamp(p,0,1)):x.phase==='windup'?1.65:1)+')';
 const label=hit.querySelector('.chain-key141 b');label.textContent=focus?'Strike':x.phase==='release'?'Go':x.phase==='hitstop'?'Hit':'Ready';
 const progress=$('#combo-progress'),message=(c.step+1)+' / '+c.chain+' · '+text;if(progress.textContent!==message)progress.textContent=message;
 n.querySelectorAll('.chain-beats141 i').forEach((node,i)=>{node.dataset.state=i<c.step?'hit':i===c.step?(c.input==='miss'?'miss':c.input==='hit'?'hit':'current'):'waiting';});
}
const cinematicHitBefore141=comboHit;
comboHit=function(){
 const c=battle?.combo;if(!c?.cinema141)return cinematicHitBefore141();
 const x=c.cinema141;if(battle.status!=='combo'||chainPaused141()||x.phase!=='focus'||c.input)return;
 const p=c.t/c.duration,hit=p>=.65&&p<=.85;c.input=hit?'hit':'miss';c.hitWindows.push(p);if(hit)c.success++;
 const q=combatLesson18();if(q&&hit){q.firstHit=true;q.windowPaused=false;}
 x.releaseFrom=x.frame;chainEvent141(c,'input',{hit,window:p});chainPhase141(c,'release');updateChainCue141(c);
};
// A held key cannot score subsequent beats through browser key-repeat.
document.addEventListener('keydown',e=>{if(battle?.combo?.cinema141&&['e',' '].includes(e.key.toLowerCase())&&e.repeat){e.preventDefault();e.stopImmediatePropagation();}},true);
function chainContact141(c){
 const x=c.cinema141;if(c.applied||c.target.hp<=0)return;
 x.frame=x.pose.peak;c.t=c.duration*.76;setActorFrame(c.actor,x.pose.clip,x.pose.peak);
 const before=c.target.hp;applyLiveChainHit(c,c.input==='hit');
 if(c.applied){
  if(c.id!=='bren')chainImpact141(c,actorImpactPoint(c.target.actor),c.input==='hit'&&c.step===2);
  chainEvent141(c,'contact',{hit:c.input==='hit',clip:x.pose.clip,frame:c.actor.frame.index,peak:x.pose.peak,hpBefore:before,hpAfter:c.target.hp});
  // Time resumes on contact, never during the uppercut's lead-in. A failed
  // continuation or defeated target also releases the presentation cleanly.
  if(c.input!=='hit'||c.step+1===c.chain||c.target.hp<=0){x.slow=false;x.bullet=0;x.fxRate=1;chainEvent141(c,'time-restored');}
  else if(c.step===0){x.slow=true;chainEvent141(c,'bullet-time-start');}
  x.feedback=c.input==='hit'?(c.step===2?'Perfect chain':'Good timing'):'Glancing hit';if(c.input==='hit')floatText(c.actor,x.feedback,true);chainPhase141(c,'hitstop');
 }
}
function finishChain141(c){
 const a=c.actor,v=c.target.actor;Object.assign(a,c.start);Object.assign(v,c.cinema141.victim);a.action='battleIdle';a.actionTime=0;
 chainEvent141(c,'finished',{hits:c.success});battle.combo=null;$('#combo').classList.add('hidden');finishTurn();
}
function advanceCinematicChain141(dt){
 const c=battle.combo,x=c.cinema141,a=c.actor,v=c.target.actor,pose=x.pose;
 x.bullet=clamp(x.bullet+(x.slow?1:-1)*dt/.12,0,1);const rate=chainRate141(x);x.fxRate=x.phase==='hitstop'&&x.slow?.08:rate;
 x.total+=dt;x.time+=dt;x.motionTime+=dt*rate;voiceTimer-=dt;if(voiceTimer<=0)$('#battle-callout').textContent='';
 if(x.phase==='windup'){
  const duration=c.step===0?.24:.12,p=clamp(x.motionTime/duration,0,1);x.frame=pose.pre*.45*p;c.t=c.duration*.35*p;
  if(p===1)chainPhase141(c,'focus');
 }else if(x.phase==='focus'){
  // Scoring still uses the original .9-second clock and .65-.85 gold window.
  // Bullet time stretches the physical strike, not the input/balance rules.
  const duration=combatLesson18()?1.0:c.duration*.54,q=combatLesson18();x.focusTime+=dt;
  if(q?.step==='timing'&&!q.firstHit&&x.focusTime>=duration*(.75-.35)/.54){x.focusTime=duration*(.75-.35)/.54;q.windowPaused=true;}
  const t=clamp(x.focusTime/duration,0,1),p=.35+.54*t;c.t=c.duration*p;x.frame=mix(pose.pre*.45,pose.pre,t);
  if(p>.85){c.input='miss';c.hitWindows.push(p);x.releaseFrom=x.frame;chainEvent141(c,'timeout');chainPhase141(c,'release');}
 }else if(x.phase==='release'){
  const p=clamp(x.motionTime/(c.input==='hit'?.13:.16),0,1);x.frame=mix(x.releaseFrom,pose.peak,p);c.t=c.duration*.76;
  if(p===1){
   const m=assets.sprites[a.visualId??a.id];
   // The uppercut and low finishing lunge are two parts of the third strike.
   // Its HP change still happens exactly once, at the final physical contact.
   if(c.id==='bren'&&c.step===2&&c.input==='hit'&&m.frames.comboFinalImpact){chainPhase141(c,'apex');}
   else{chainContact141(c);if(!c.applied){if(c.projectileStarted){chainPhase141(c,'flight');x.flightElapsed=dt*rate;}else chainPhase141(c,'recover');}}
  }
 }else if(x.phase==='apex'){
  x.frame=pose.peak;c.t=c.duration*.76;
  if(x.time>=.12){x.pose=chainPose141(c,'comboFinalImpact');x.frame=x.pose.pre;x.releaseFrom=x.frame;x.finalMotion=true;chainPhase141(c,'finalRelease');}
 }else if(x.phase==='finalRelease'){
  const p=clamp(x.motionTime/.10,0,1);x.frame=mix(x.releaseFrom,pose.peak,p);c.t=c.duration*.76;
  if(p===1)chainContact141(c);
 }else if(x.phase==='flight'){
  x.frame=pose.peak;c.t=c.duration*.79;
  x.flightElapsed+=dt*rate;c.contactAt=clock+Math.max(0,.16-x.flightElapsed);
  if(x.flightElapsed>=.16){chainContact141(c);if(!c.applied)chainPhase141(c,'recover');}
 }else if(x.phase==='hitstop'){
  x.frame=pose.peak;c.t=c.duration*.81;
  if(x.time>=(c.input==='hit'&&c.step===2?.045:.065))chainPhase141(c,'recover');
 }else if(x.phase==='recover'){
  const p=clamp(x.motionTime/(x.slow?.12:x.finalMotion?.36:.22),0,1);x.frame=mix(pose.peak,pose.n-1,p);c.t=c.duration*mix(.86,1,p);
  if(p===1){if(c.input==='hit'&&c.step+1<c.chain&&c.target.hp>0)chainPhase141(c,'link');else{chainPhase141(c,'return');x.returnFrom={x:a.x,z:a.z};}}
 }else if(x.phase==='link'){
  x.frame=pose.n-1;c.t=c.duration;
  if(x.time>=.10){Object.assign(v,x.victim);c.step++;chainBeat141(c);}
 }else if(x.phase==='return'){
  const p=smooth(0,1,clamp(x.time/(c.id==='bren'?.30:.08),0,1));a.x=mix(x.returnFrom.x,c.start.x,p);a.z=mix(x.returnFrom.z,c.start.z,p);x.frame=pose.n-1;c.t=c.duration;
  if(p===1){finishChain141(c);return;}
 }
 if(x.phase!=='return'){
  const travel=smooth(0,1,clamp(x.total/.38,0,1));a.x=mix(c.start.x,x.near.x,travel);a.z=mix(c.start.z,x.near.z,travel);
 }
 const reacting=['hitstop','recover'].includes(x.phase)&&c.applied,amount=reacting?.10*(x.phase==='hitstop'?1:1-clamp(x.time/.22,0,1)):0,d=Math.max(.001,Math.hypot(x.victim.x-a.x,x.victim.z-a.z));
 v.x=x.victim.x+(x.victim.x-a.x)/d*amount;v.z=x.victim.z+(x.victim.z-a.z)/d*amount;
 updateChainCue141(c);
}
const cinematicUpdateBefore141=updateBattle;
updateBattle=function(dt){const c=battle?.combo;if(battle?.status==='combo'&&c?.cinema141){if(!chainPaused141()&&!introLocked58())advanceCinematicChain141(dt);return;}return cinematicUpdateBefore141(dt);};
const cinematicBrenPoseBefore141=brenLiveFrame82,cinematicSorenPoseBefore141=sorenLivePose84;
brenLiveFrame82=function(c){const x=c.cinema141;return x?{clip:x.pose.clip,frame:x.frame,n:x.pose.n}:cinematicBrenPoseBefore141(c);};
sorenLivePose84=function(c){const x=c.cinema141;return x?{clip:x.pose.clip,frame:Math.floor(x.frame)}:cinematicSorenPoseBefore141(c);};
const cinematicActorBefore141=updateActor;
updateActor=function(a,dt){
 const c=battle?.combo,x=c?.cinema141,paused=x&&chainPaused141(),rate=x?(paused?0:x.phase==='hitstop'&&x.slow?.06:chainRate141(x)):1;
 if(x&&a.flinchUntil>clock-dt)a.flinchUntil+=dt*(1-rate);
 if(a===c?.actor&&paused){if(c.contactAt)c.contactAt+=dt;if(c.impactUntil)c.impactUntil+=dt;}
 const r=cinematicActorBefore141(a,dt*rate);
 if(x&&a===c.actor)setActorFrame(a,x.pose.clip,Math.min(x.pose.n-1,Math.floor(x.frame+.0001)));
 return r;
};
const cinematicFXBefore141=updateWorldFX;
updateWorldFX=function(dt){const x=battle?.combo?.cinema141,t=dt*(x?(chainPaused141()?0:x.fxRate??chainRate141(x)):1),r=cinematicFXBefore141(t);cinematic141.effectStep143=t;return r;};
// Actor updates temporarily face the camera before the final battle-camera
// pass restores their upright plane. Anchor blade FX after that pass so their
// grip, tip, local lights and particles use the exact rendered sprite basis.
const cinematicCameraBefore143=updateCamera;
updateCamera=function(...args){const r=cinematicCameraBefore143(...args),dt=cinematic141.effectStep143??0;cinematic141.effectStep143=0;updateChainEffects141(dt);return r;};
// Contact stars are analytic, anti-aliased gold streaks rather than a fuzzy
// billboard. Three pooled planes suffice for a complete chain at any display DPI.
function chainEffects141(){
 const root=brenRoot82();if(cinematic141.effects?.root===root)return cinematic141.effects;
 disposeChainEffects141();const group=new THREE.Group();group.name='Timed combo contact stars';root.add(group);
 const geometry=new THREE.PlaneGeometry(1,1),bursts=Array.from({length:3},()=>{
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,
   uniforms:{age:{value:1},tint:{value:new THREE.Color('#ffb544')},power:{value:1}},vertexShader:'varying vec2 uv141;void main(){uv141=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
   varying vec2 uv141;uniform float age,power;uniform vec3 tint;
   void main(){vec2 p=(uv141-.5)*2.;float r=length(p),rays=0.;
    float spread=mix(.30,1.,smoothstep(0.,.30,age));
    for(int i=0;i<16;i++){float k=float(i),a=k*2.399963+.18;vec2 d=vec2(cos(a),sin(a));float along=dot(p,d),across=abs(dot(p,vec2(-d.y,d.x)));
     float len=(.42+.48*fract(k*.61803))*spread;float w=.0045+fwidth(across)*.9;
     rays+=exp(-pow(across/w,2.))*smoothstep(.008,.035,along)*(1.-smoothstep(len*.64,len,along));}
    float core=exp(-r*45.),halo=exp(-r*13.)*.075,life=pow(max(0.,1.-age),1.35);
    float a=(rays*1.5+core+halo)*life*power;if(a<.002)discard;
    gl_FragColor=vec4(mix(tint,vec3(2.,1.8,1.15),exp(-r*18.)),a);
   }`});const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;mesh.frustumCulled=false;group.add(mesh);return{mesh,age:10,duration:.38};
 });
 const sweeps=Array.from({length:3},()=>{
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.NormalBlending,toneMapped:false,
   uniforms:{head:{value:0},span:{value:0},direction:{value:1},opacity:{value:0},flow:{value:0}},vertexShader:'varying vec2 uv141;void main(){uv141=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
   varying vec2 uv141;uniform float head,span,direction,opacity,flow;
   void main(){vec2 p=(uv141-.5)*2.;float r=length(p),angle=atan(p.y,p.x),behind=mod((head-angle)*direction+6.2831853,6.2831853);
    if(behind>span)discard;float aa=max(.002,fwidth(r)),t=clamp(behind/max(.001,span),0.,1.),tail=pow(1.-t,.46);
    float width=mix(.024,.13,sin(t*3.1415926));
    float body=exp(-pow((r-(.82-width*.50))/max(.018,width),2.))*.70;
    float core=exp(-pow((r-.82)/(.006+aa),2.)),second=exp(-pow((r-.70)/(.005+aa),2.))*.30;
    float filament=exp(-pow((r-(.76+.012*sin(angle*13.-flow*10.)))/(.004+aa),2.))*.38;
    float glow=exp(-pow((r-.80)/.10,2.))*.18;
    float a=(body+core+second+filament+glow)*tail*opacity;if(a<.002)discard;
    vec3 blue=mix(vec3(.018,.22,1.10),vec3(.20,.75,2.1),body*.45);
    gl_FragColor=vec4(mix(blue,vec3(.70,1.5,2.3),core*.72),min(.98,a));
   }`});const mesh=new THREE.Mesh(geometry,material);mesh.visible=false;mesh.frustumCulled=false;group.add(mesh);return{mesh,age:10,serial:-1};
 });
 const dustMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,toneMapped:false,
  uniforms:{age:{value:1}},vertexShader:'varying vec2 uvDust142;void main(){uvDust142=uv;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',fragmentShader:`
  varying vec2 uvDust142;uniform float age;
  void main(){vec2 p=(uvDust142-.5)*2.;float r=length(p),edge=.69+.08*sin(p.x*7.+p.y*4.)+.055*sin(p.y*11.-p.x*3.);
   float curl=.06*sin(p.x*10.+p.y*8.-age*6.);float a=(1.-smoothstep(edge-.28+curl,edge+.12+curl,r))*.38*pow(max(0.,1.-age),1.35);
   if(a<.003)discard;gl_FragColor=vec4(.77,.69,.55,a);}`});
 const dust=new THREE.InstancedMesh(geometry,dustMaterial,12);dust.frustumCulled=false;dust.visible=false;group.add(dust);
 const sparkGeometry=geometry.clone(),sparkInfo=new Float32Array(192*2);sparkGeometry.setAttribute('sparkInfo143',new THREE.InstancedBufferAttribute(sparkInfo,2).setUsage(THREE.DynamicDrawUsage));
 const sparkMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.NormalBlending,toneMapped:false,
  vertexShader:'attribute vec2 sparkInfo143;varying vec2 sparkUv143;varying vec3 sparkColor143;varying vec2 info143;void main(){sparkUv143=uv;sparkColor143=instanceColor;info143=sparkInfo143;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}',fragmentShader:`
  varying vec2 sparkUv143,info143;varying vec3 sparkColor143;
  void main(){vec2 p=(sparkUv143-.5)*2.;float diamond=abs(p.x)+abs(p.y),r=length(p);
   float shape=mix(exp(-p.x*p.x*25.)*(1.-smoothstep(.55,1.,abs(p.y))),1.-smoothstep(.40,1.,diamond),info143.y);
   float a=(shape+exp(-r*r*7.)*.14)*info143.x;if(a<.003)discard;
   gl_FragColor=vec4(mix(sparkColor143,vec3(1.6,1.7,1.8),shape*.20),min(.98,a));}`});
 const sparks=new THREE.InstancedMesh(sparkGeometry,sparkMaterial,192);sparks.frustumCulled=false;sparks.visible=false;
 for(let i=0;i<192;i++)sparks.setColorAt(i,new THREE.Color('#58bfff'));group.add(sparks);
 const groundMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{age:{value:1},opacity:{value:0}},vertexShader:'varying vec2 groundUv143;void main(){groundUv143=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
  varying vec2 groundUv143;uniform float age,opacity;
  void main(){vec2 p=(groundUv143-.5)*2.;float r=length(p),a=atan(p.y,p.x),arc=mod(a+age*2.+6.283185,6.283185);
   float edge=.65+.03*sin(a*7.-age*5.),ring=exp(-pow((r-edge)/.035,2.));float alpha=ring*smoothstep(0.,.25,arc)*(1.-smoothstep(2.,3.7,arc))*opacity;
   if(alpha<.003)discard;gl_FragColor=vec4(.06,.55,1.6,alpha);}`});
 const ground=new THREE.Mesh(geometry,groundMaterial);ground.rotation.x=-Math.PI/2;ground.visible=false;group.add(ground);
 const weapon={grip:V3(),tip:V3(),right:V3(),up:V3()};
 return cinematic141.effects={root,group,geometry,bursts,sweeps,weapon,dust,dustAge:1,dustOrigin:V3(),dustDirection:V3(),dummy:new THREE.Object3D(),cursor:0,sparks,sparkGeometry,sparkInfo,particles:[],particleClock:0,ground,groundAge:1,flow:0};
}
function disposeChainEffects141(){const q=cinematic141.effects;if(!q)return;q.group.removeFromParent();q.dust.dispose();q.sparks.dispose();q.geometry.dispose();q.dust.material.dispose();q.sparkGeometry.dispose();q.sparks.material.dispose();q.ground.material.dispose();for(const b of [...q.bursts,...q.sweeps])b.mesh.material.dispose();cinematic141.effects=null;}
function chainParticles143(q,position,count,gold=false){
 for(let i=0;i<count&&q.particles.length<192;i++){
  const seed=(i+q.cursor*13+q.particles.length)*2.399963,rad=.6+(i%5)*.20,right=V3(1,0,0).applyQuaternion(camera.quaternion),up=V3(0,1,0).applyQuaternion(camera.quaternion);
  const velocity=right.multiplyScalar(Math.cos(seed)*rad*(gold?4.8:.9)).addScaledVector(up,Math.sin(seed)*rad*(gold?3.7:.7));
  q.particles.push({position:position.clone(),velocity,age:0,life:gold?.22+(i%4)*.045:.65+(i%5)*.11,size:gold?.035+(i%3)*.009:.045+(i%3)*.012,gold,seed,color:new THREE.Color(gold?(i%3?'#ffb331':'#ffe2a2'):'#38aaff')});
 }
}
function chainImpactPosition141(c,position){
 const out=position.clone(),v=c.target.actor,a=c.actor,d=Math.max(.001,Math.hypot(a.x-v.x,a.z-v.z)),shoulder=clamp(v.size*.18,.18,.65);
 out.x+=(a.x-v.x)/d*shoulder;out.z+=(a.z-v.z)/d*shoulder;
 // Put the light just in front of the alpha-tested sprite, still depth-tested
 // against the actual set. It cannot disappear behind the enemy's own quad.
 out.addScaledVector(camera.position.clone().sub(out).normalize(),.32);return out;
}
function chainImpact141(c,position,strong){const q=chainEffects141(),b=q.bursts[q.cursor++%3];b.age=0;b.duration=strong?.46:.34;b.mesh.position.copy(chainImpactPosition141(c,position));b.mesh.scale.setScalar(strong?3.5:2.5);b.mesh.quaternion.copy(camera.quaternion);b.mesh.material.uniforms.tint.value.set(['bren','tavin'].includes(c.id)?'#ffb136':c.id==='lysa'?'#ff9345':'#6dbfff');b.mesh.material.uniforms.power.value=strong?1.2:1;b.mesh.visible=true;
 if(c.id==='bren'){chainParticles143(q,b.mesh.position,strong?24:16,true);chainParticles143(q,b.mesh.position,8,false);}
 if(c.id==='bren'&&strong&&c.cinema141.finalMotion){q.dustAge=0;q.dustOrigin.set(c.actor.x,c.actor.mesh.position.y+.09,c.actor.z);q.dustDirection.set(c.actor.x-c.target.actor.x,0,c.actor.z-c.target.actor.z).normalize();}
}
function updateChainEffects141(dt){
 const c=battle?.combo,x=c?.cinema141;
 // The crescent's head follows the actual authored sword tip and grip. Its
 // taper is an afterimage of the cut, never a free-floating spinning ring.
 if(x&&c.id==='bren'&&(['release','finalRelease','apex'].includes(x.phase)||x.phase==='hitstop'&&x.time===0)){
  const q=chainEffects141(),w=q.weapon,m=assets.sprites[c.actor.visualId??c.actor.id],n=m.frames[x.pose.clip].length;
  if(brenWeapon82(c.actor,x.pose.clip,x.frame/n,w)){
   const sweep=q.sweeps[c.step],u=sweep.mesh.material.uniforms,blade=w.tip.clone().sub(w.grip),right=V3(1,0,0).applyQuaternion(camera.quaternion),up=V3(0,1,0).applyQuaternion(camera.quaternion),flat=['comboSlash','comboFinalImpact'].includes(x.pose.clip)?mix(.27,1,smooth(.15,.70,Math.abs(blade.dot(up))/Math.max(.01,blade.length()))):1,head=Math.atan2(blade.dot(up)/flat,blade.dot(right));
   const motionKey=x.serial+':'+x.pose.clip;
   if(sweep.serial!==motionKey){
    sweep.serial=motionKey;const first=head;
    brenWeapon82(c.actor,x.pose.clip,x.pose.peak/n,w);const last=w.tip.clone().sub(w.grip),end=Math.atan2(last.dot(up)/flat,last.dot(right));
    sweep.direction=x.pose.clip==='comboUppercut'?-1:Math.sign(Math.atan2(Math.sin(end-first),Math.cos(end-first)))||1;
    brenWeapon82(c.actor,x.pose.clip,x.frame/n,w);
   }
   sweep.age=0;sweep.mesh.position.copy(w.grip).addScaledVector(camera.position.clone().sub(w.grip).normalize(),.18);sweep.mesh.quaternion.copy(camera.quaternion);
   const radius=Math.hypot(blade.dot(right),blade.dot(up)/flat),scale=radius*2/.82;sweep.mesh.scale.set(scale,scale*flat,scale);u.head.value=head;u.span.value=mix(.12,x.pose.clip==='comboUppercut'?3.4:2.65,['hitstop','apex'].includes(x.phase)?1:clamp(x.motionTime/(x.phase==='finalRelease'?.10:c.input==='hit'?.13:.16),0,1));u.direction.value=sweep.direction;
   // Real, bounded local radiance follows the steel. Shared PBR scenery sees
   // the point light; reconstructed painted surfaces share its same position
   // and falloff through brenSurface82. No global exposure flash is involved.
   const bank=initBrenFX82(),light=bank.lights[0];light.position.lerpVectors(w.grip,w.tip,.55);light.color.set('#238eff');light.intensity=x.finalMotion&&x.phase==='hitstop'?0:24;light.userData.life=.13;
   brenSurface82.positions.value[0].copy(light.position);brenSurface82.powers.value[0].set(light.color.r,light.color.g,light.color.b).multiplyScalar(light.intensity*.03);
   if(dt>0){q.particleClock+=dt;if(q.particleClock>.022){q.particleClock=0;chainParticles143(q,w.tip,2,false);}}
   if(x.pose.clip==='comboUppercut'){q.groundAge=0;q.ground.position.set(c.actor.x,c.actor.mesh.position.y+.055,c.actor.z);q.ground.scale.set(3.6,2.5,1);}
  }
 }
 const q=cinematic141.effects;if(!q)return;if(!battle||q.root!==brenRoot82()){disposeChainEffects141();return;}
 for(const b of q.bursts){b.age+=dt;b.mesh.visible=b.age<b.duration;if(!b.mesh.visible)continue;b.mesh.quaternion.copy(camera.quaternion);b.mesh.material.uniforms.age.value=b.age/b.duration;}
 q.flow+=dt;for(const sweep of q.sweeps){sweep.age+=dt;sweep.mesh.visible=sweep.age<.24;sweep.mesh.material.uniforms.opacity.value=Math.max(0,1-sweep.age/.24);sweep.mesh.material.uniforms.flow.value=q.flow;}
 q.dustAge+=dt;const dustT=q.dustAge/.55;q.dust.visible=dustT<1;
 if(q.dust.visible){q.dust.material.uniforms.age.value=dustT;for(let i=0;i<12;i++){
  const d=q.dummy,t=i/11,s=.27+.32*t+.48*dustT,side=(i%2?1:-1)*(.09+t*.20),back=.16+t*.72+dustT*(.35+t*.65);
  d.position.copy(q.dustOrigin).addScaledVector(q.dustDirection,back);d.position.x+=q.dustDirection.z*side;d.position.z-=q.dustDirection.x*side;d.position.y+=dustT*(.12+t*.20);d.quaternion.copy(camera.quaternion);d.scale.set(s*1.8,s*.75,s);d.updateMatrix();q.dust.setMatrixAt(i,d.matrix);
 }q.dust.instanceMatrix.needsUpdate=true;}
 q.groundAge+=dt;q.ground.visible=q.groundAge<.30;q.ground.material.uniforms.age.value=q.flow;q.ground.material.uniforms.opacity.value=Math.max(0,1-q.groundAge/.30)*.40;
 const info=q.sparks.geometry.attributes.sparkInfo143;
 for(let i=q.particles.length-1;i>=0;i--){const p=q.particles[i];p.age+=dt;if(p.age>=p.life){q.particles.splice(i,1);continue;}p.position.addScaledVector(p.velocity,dt);p.velocity.y-=dt*(p.gold?5:.10);}
 q.sparks.visible=q.particles.length>0;q.sparks.count=q.particles.length;
 const camRight=V3(1,0,0).applyQuaternion(camera.quaternion),camUp=V3(0,1,0).applyQuaternion(camera.quaternion);
 for(let i=0;i<q.particles.length;i++){
  const p=q.particles[i],d=q.dummy,life=1-p.age/p.life;d.position.copy(p.position);d.quaternion.copy(camera.quaternion);d.rotateZ(p.gold?Math.atan2(p.velocity.dot(camUp),p.velocity.dot(camRight))-Math.PI/2:p.seed+q.flow*.35);
  d.scale.set(p.size*(p.gold?1:1.7),p.size*(p.gold?mix(6,2,p.age/p.life):2.1),1);d.updateMatrix();q.sparks.setMatrixAt(i,d.matrix);q.sparks.setColorAt(i,p.color);info.setXY(i,Math.min(1,life*3),p.gold?0:1);
 }q.sparks.instanceMatrix.needsUpdate=true;if(q.sparks.instanceColor)q.sparks.instanceColor.needsUpdate=true;info.needsUpdate=true;
 if(x&&c.id==='bren'&&bren82.pool){for(const trail of bren82.pool.trails)trail.mesh.visible=false;bren82.pool.sparks.visible=false;}
}
const cinematicContactBefore141=brenContact82;
brenContact82=function(position,strong=false,gold=false){
 const c=battle?.combo;if(!c?.cinema141)return cinematicContactBefore141(position,strong,gold);
 const point=chainImpactPosition141(c,position),r=cinematicContactBefore141(point,strong,gold),p=bren82.pool,b=p.bursts[(p.cursor-1)%p.bursts.length];
 b.age=10;b.mesh.visible=b.floor.visible=false;
 const light=p.lights[1];light.color.set('#ffb751');light.intensity=strong?30:20;
 brenSurface82.positions.value[1].copy(light.position);brenSurface82.powers.value[1].set(light.color.r,light.color.g,light.color.b).multiplyScalar(light.intensity*.03);
 if(c.cinema141.finalMotion){p.lights[0].intensity=0;p.lights[0].userData.life=0;brenSurface82.powers.value[0].set(0,0,0);}
 for(const particle of p.particles)if(particle.age===0)particle.life*=1.7;
 chainImpact141(c,position,strong);return r;
};
// RE109 keeps the existing camera and Gaussian lens. This inexpensive grade
// only affects the rendered world, leaving every DOM prompt and HP card crisp.
const cinematicPostBefore141=makeArenaPost89;
makeArenaPost89=function(){const p=cinematicPostBefore141();if(p.uniforms.bullet141)return p;
 p.uniforms.bullet141={value:0};p.material.fragmentShader='uniform float bullet141;\n'+p.material.fragmentShader.replace('#include <colorspace_fragment>',`#include <colorspace_fragment>
 float luma141=dot(gl_FragColor.rgb,vec3(.2126,.7152,.0722));
 vec3 cool141=mix(gl_FragColor.rgb,vec3(luma141),.14)*vec3(.85,.96,1.12);
 float rim141=smoothstep(.31,.74,length((v-.5)*vec2(1.,.92)));
 gl_FragColor.rgb=mix(gl_FragColor.rgb,cool141*(1.-rim141*.12),bullet141);`);
 p.material.needsUpdate=true;return p;
};
const cinematicRenderBefore141=renderArena89;
renderArena89=function(...args){makeArenaPost89().uniforms.bullet141.value=battle?.combo?.cinema141?.bullet??0;return cinematicRenderBefore141(...args);};
// Story fights stay in their POI, rather than using the separate arena target.
// Apply the same temporary treatment through that renderer as well.
const cinematicWorldPostBefore141=setupPost;
setupPost=function(...args){const r=cinematicWorldPostBefore141(...args),m=post.material;m.uniforms.bulletWorld141={value:0};
 m.fragmentShader='uniform float bulletWorld141;\n'+m.fragmentShader.replace('#include <colorspace_fragment>',`#include <colorspace_fragment>
 float luma141=dot(gl_FragColor.rgb,vec3(.2126,.7152,.0722));
 vec3 cool141=mix(gl_FragColor.rgb,vec3(luma141),.14)*vec3(.85,.96,1.12);
 float rim141=smoothstep(.31,.74,length((vUv-.5)*vec2(1.,.92)));
 gl_FragColor.rgb=mix(gl_FragColor.rgb,cool141*(1.-rim141*.12),bulletWorld141);`);
 m.needsUpdate=true;return r;
};
const cinematicWorldRenderBefore141=render;
render=function(...args){if(post?.material.uniforms.bulletWorld141)post.material.uniforms.bulletWorld141.value=!encounter53.active?(battle?.combo?.cinema141?.bullet??0):0;return cinematicWorldRenderBefore141(...args);};
const cinematicEndBefore141=endBattle;
endBattle=function(...args){const c=battle?.combo;if(c?.cinema141){Object.assign(c.actor,c.start);Object.assign(c.target.actor,c.cinema141.victim);c.cinema141.bullet=0;c.cinema141.slow=false;}disposeChainEffects141();return cinematicEndBefore141(...args);};
const cinematicMobileBefore141=layoutMobileCombat69;
layoutMobileCombat69=function(...args){const r=cinematicMobileBefore141(...args);if(mobileBattle69()&&innerWidth>innerHeight&&battle.combo?.cinema141)$('#combo').style.setProperty('bottom',(mobileField69().party+6)+'px','important');return r;};
const cinematicTimingLayoutBefore141=timingLayout68;
timingLayout68=function(...args){const r=cinematicTimingLayoutBefore141(...args);if(battle?.combo?.cinema141&&!mobileBattle69()){const n=$('#combo');n.style.setProperty('width',Math.min(340,innerWidth-24)+'px','important');n.style.setProperty('top',clamp(innerHeight*.16,92,160)+'px','important');}return r;};
// The existing lesson keeps its explicit Continue / first-window wait.
LESSONS18.timing.text='Press E, Space or Strike when the rings meet in gold. Land the first hit to enter bullet time, then link two slower strikes. Time resumes on the final impact. The first practice opening waits for you.';
LESSONS18.timing.goal='Release three strikes on their gold openings';
const cinematicInstallBefore141=installEngine;
installEngine=function(...args){const r=cinematicInstallBefore141(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const data=JSON.parse(before()),c=battle?.combo;if(c?.cinema141)data.battle.choreography={phase:c.cinema141.phase,clip:c.cinema141.pose.clip,frame:+c.cinema141.frame.toFixed(2),contactFrame:c.cinema141.pose.peak,canStrike:c.cinema141.phase==='focus'&&!c.input,window:c.t/c.duration,hits:c.success,timeScale:+chainRate141(c.cinema141).toFixed(2),bulletTime:+c.cinema141.bullet.toFixed(2)};return JSON.stringify(data);};return r;};
