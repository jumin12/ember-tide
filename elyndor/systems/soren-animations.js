// Soren's native poses and magic share the existing combat clock. Damage,
// timing windows, MP and turn order remain owned by the combat rules.
const soren84={context:null,world:null,pool:null,serial:0,entries:0,projectiles:0,impacts:0,peakLight:0};
// Trim transparent side margins in the portable atlas, then restore the exact
// authored root in geometry. This saves texture space without resizing pixels
// or allowing a wider staff pose to move the actor or its floor shadow.
const nativeFrameBefore84=setActorFrame;
setActorFrame=function(a,...args){const r=nativeFrameBefore84(a,...args),m=assets.sprites[a.visualId??a.id],g=a.mesh.geometry,offset=(m.nativeOffsets?.[a.frame.cell]??0)*a.size/m.unit,previous=g.userData.nativeOffset84??0;if(offset!==previous){g.translate(offset-previous,0,0);g.userData.nativeOffset84=offset;}return r;};
function isSoren84(a){return !!a&&(a.characterId==='soren'||['soren','sorenEnemy'].includes(a.visualId??a.id));}
function sorenMeta84(a){const m=a&&assets.sprites[a.visualId??a.id];return isSoren84(a)&&m?.characterRevision>=84?m:null;}
const sorenSkillBefore84=executeSkill;
executeSkill=function(id,index,...args){if(id!=='soren')return sorenSkillBefore84(id,index,...args);soren84.context={clip:index===0?'arcanePulse':'ward'};try{return sorenSkillBefore84(id,index,...args);}finally{soren84.context=null;}};
const sorenItemBefore84=battleAllyTarget;
battleAllyTarget=function(...args){const own=battle&&battle.pending?.type!=='skill'&&currentFighter()==='soren';if(!own)return sorenItemBefore84(...args);soren84.context={clip:'item'};try{return sorenItemBefore84(...args);}finally{soren84.context=null;}};
const sorenGemBefore84=useCombatGem65;
useCombatGem65=function(...args){if(!battle||currentFighter()!=='soren')return sorenGemBefore84(...args);soren84.context={clip:'item'};try{return sorenGemBefore84(...args);}finally{soren84.context=null;}};
const sorenActionBefore84=startActionAnimation;
startActionAnimation=function(opts){
 const a=opts.actor,m=sorenMeta84(a);if(!m)return sorenActionBefore84(opts);
 const target=opts.lunge,clip=soren84.context?.clip??(a.action==='guard'?(a.enemy?'channel':'guard'):a.action==='attack'?'arcanePulse':a.action==='cast'?'arcanePulse':a.action);
 // The enemy's original damage callback and contact time are retained. A
 // mage stays in formation and projects the attack across the same distance.
 const options={...opts,lunge:null,authoredMagic84:true};
 const result=sorenActionBefore84(options),cue=battle?.animation;
 if(cue?.actor===a){cue.lunge=null;cue.soren84={clip,serial:++soren84.serial,target,release:a.enemy?.35:.52,impact:cue.impactAt,enemyShot:a.enemy&&a.action==='attack'};a.actionTime=0;if(a.sorenEntry84)a.sorenEntry84.time=1.2;}
 return result;
};
function sorenLivePose84(c){
 const clip=['pulseOne','pulseTwo','pulseThree'][c.step],m=sorenMeta84(c.actor),n=m.frames[clip].length,peak=m.impactFrame[clip],p=clamp(c.t/c.duration,0,1);
 // A successful early input releases from the authored hand/staff pose on
 // the same frame as the projectile. Recovery follows the actual flight.
 let f=p<.65?(peak-1)*p/.65:peak-1;
 if(c.projectileStarted)f=peak+(n-1-peak)*clamp((clock-(c.contactAt-.16))/.27,0,1);
 return {clip,frame:Math.min(n-1,Math.floor(f+.0001))};
}
const sorenChainBefore85=advanceLiveChain;
advanceLiveChain=function(dt){
 const owner=battle,c=owner?.combo,own=c?.id==='soren'&&!!sorenMeta84(c.actor),start=own?{x:c.start.x,z:c.start.z}:null;
 const result=sorenChainBefore85(dt);
 // The old generic caster stance adds a .65-unit approach every chain step.
 // Keep the hovering mage in his formation while preserving all hit clocks.
 if(own&&battle===owner){c.actor.x=start.x;c.actor.z=start.z;}
 return result;
};
function sorenResolved84(a,dt){
 const m=sorenMeta84(a);if(!m)return null;
 if(!battle){delete a.sorenEntry84;delete a.sorenResolved84;return a.action==='cast'&&m.frames['work_'+a.face]?{clip:'work_'+a.face,frame:Math.floor(a.actionTime*8)%m.frames['work_'+a.face].length}:null;}
 // Story opponents withdraw on the authored navigation route after defeat.
 // Their explicit walking cue must take precedence over the kneeling pose.
 if(a.enemy&&a.retreatStart&&a.action==='walk')return null;
 if(!a.sorenEntry84||a.sorenEntry84.owner!==battle){a.sorenEntry84={owner:battle,time:0,started:false};}
 const entry=a.sorenEntry84,waiting=battleIntro58.owner===battle&&battleIntro58.phase==='waiting';
 if(!waiting){if(!entry.started){entry.started=true;soren84.entries++;}entry.time=Math.min(1.2,entry.time+dt);}
 const c=battle.combo,cue=battle.animation,enemy=battle.enemies.find(e=>e.actor===a),hp=a.enemy?enemy?.hp:state.characters.soren?.hp,max=a.enemy?enemy?.maxHp:stats('soren').hp;
 let clip='battleIdle',frame;
 if(hp<=0||a.subdued)clip='knockedOut';
 else if(a.action==='recoil'&&a.flinchUntil>clock)clip='recoil';
 else if(c?.actor===a&&battle.status==='combo')return sorenLivePose84(c);
 else if(cue?.actor===a&&cue.soren84){
  clip=cue.soren84.clip;const frames=m.frames[clip],peak=m.impactFrame[clip]??Math.floor(frames.length*.52),p=clamp(cue.time/cue.duration,0,1),release=cue.soren84.release;
  frame=p<=release?peak*p/release:peak+(frames.length-1-peak)*(p-release)/(1-release);
 }else if(entry.time<1.2){clip='battleRise';frame=clamp(Math.floor(entry.time/1.2*m.frames[clip].length),0,m.frames[clip].length-1);}
 else if(battle.status==='victory'&&!a.enemy)clip='victory';
 else if(hp<=max*.25)clip='injured';
 else if(!a.enemy&&battle.guards.has('soren'))clip='guard';
 if(a.sorenResolved84!==clip){a.sorenResolved84=clip;a.sorenClipTime84=0;}else a.sorenClipTime84=(a.sorenClipTime84??0)+dt;
 if(frame===undefined){const n=m.frames[clip].length,t=a.sorenClipTime84??0;frame=clip==='recoil'?Math.min(n-1,Math.floor(a.actionTime/.4*n)):m.loopClips?.includes(clip)?Math.floor(t*(m.frameRate[clip]??8))%n:Math.min(n-1,Math.floor(t*(m.frameRate[clip]??10)));}
 return {clip,frame:Math.floor(frame+.0001)};
}
const sorenActorBefore84=updateActor;
updateActor=function(a,dt){sorenActorBefore84(a,dt);const pose=sorenResolved84(a,dt);if(pose)setActorFrame(a,pose.clip,pose.frame);
 if(!isSoren84(a))return;
 if(!battle&&soren84.pool)disposeSorenFX84();
 if(battle&&sorenMeta84(a)){
  a.sorenShadow84??={opacity:a.shadow.material.opacity,x:a.shadow.scale.x,y:a.shadow.scale.y};
  const m=sorenMeta84(a),gap=m.hoverFrames?.[a.frame.cell]??0,t=clamp(gap/7,0,1),base=a.sorenShadow84;
  a.shadow.material.opacity=base.opacity*mix(1,.72,t);a.shadow.scale.set(base.x*mix(1,1.13,t),base.y*mix(1,1.13,t),1);
 }else if(a.sorenShadow84){const q=a.sorenShadow84;a.shadow.material.opacity=q.opacity;a.shadow.scale.set(q.x,q.y,1);delete a.sorenShadow84;}
};
function sorenOrb84(a,out=V3()){
 const m=sorenMeta84(a),p=m?.staffFrames?.[a.frame.cell];if(!p)return out.copy(actorImpactPoint(a));
 const right=V3(1,0,0).applyQuaternion(a.mesh.quaternion),up=V3(0,1,0).applyQuaternion(a.mesh.quaternion),scale=a.size/m.unit;
 return out.copy(a.mesh.position).addScaledVector(right,p[0]*scale*a.mesh.scale.x).addScaledVector(up,p[1]*scale*a.mesh.scale.y);
}
function sorenPalm85(a,out=V3()){
 const m=sorenMeta84(a),p=m?.palmFrames?.[a.frame.cell];if(!p)return out.copy(sorenOrb84(a));
 const right=V3(1,0,0).applyQuaternion(a.mesh.quaternion),up=V3(0,1,0).applyQuaternion(a.mesh.quaternion),scale=a.size/m.unit;
 return out.copy(a.mesh.position).addScaledVector(right,p[0]*scale*a.mesh.scale.x).addScaledVector(up,p[1]*scale*a.mesh.scale.y);
}
const sorenMagicFragment84=`varying vec2 v;uniform float age,opacity,kind;uniform vec3 tint;
void main(){vec2 p=v*2.-1.;float r=length(p),a=atan(p.y,p.x),aa=max(.002,fwidth(r));
float core=exp(-r*r*28.);float corona=exp(-pow((r-.42)/.045,2.));
float ring=exp(-pow((r-(.17+age*.65))/.022,2.))*(1.-age);
float rune=(exp(-pow((r-.63)/.012,2.))+exp(-pow((r-.83)/.014,2.)))*(.45+.3*cos(a*12.+age*2.));
float spokes=pow(max(0.,cos(a*6.-age*4.)),24.)*smoothstep(.3,.5,r)*(1.-smoothstep(.7,.9,r));
float field=mix(core+corona*.5,ring+core*(1.-age),step(.5,kind));field=mix(field,(rune+spokes)*smoothstep(0.,.12,age)*(1.-smoothstep(.55,1.,age)),step(1.5,kind));
float edge=1.-smoothstep(.96-aa,1.,r);gl_FragColor=vec4(mix(tint,vec3(1.5),core*.8),min(1.,field)*opacity*edge);}`;
function disposeSorenFX84(){
 const p=soren84.pool;if(p){for(const m of [p.orb,p.palm,...p.shots.flatMap(q=>[q.mesh,q.tail]),...p.bursts.flatMap(q=>[q.mesh,q.floor]),p.motes]){m.removeFromParent();m.geometry.dispose();m.material.dispose();}p.light.removeFromParent();}
 soren84.world=null;soren84.pool=null;brenSurface82.powers.value[2].set(0,0,0);
}
function initSorenFX84(){
 const root=brenRoot82();if(soren84.pool&&soren84.world===root)return soren84.pool;disposeSorenFX84();
 const make=kind=>{const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),brenMaterial82(sorenMagicFragment84,{age:{value:0},opacity:{value:0},kind:{value:kind},tint:{value:new THREE.Color('#64c8ff')}}));mesh.visible=false;root.add(mesh);return mesh;};
 const shots=Array.from({length:6},()=>({mesh:make(0),tail:make(0),age:10,duration:.2,from:V3(),to:V3(),size:.5}));
 const bursts=Array.from({length:10},()=>{const floor=make(2);floor.rotation.x=-Math.PI/2;return{mesh:make(1),floor,age:10,duration:.65,size:2}});
 const light=new THREE.PointLight('#75caff',0,10,2);light.castShadow=false;light.userData.soren84=true;root.add(light);
 const motes=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.018,0),new THREE.MeshBasicMaterial({color:'#a7e0ff',transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false}),48);motes.frustumCulled=false;motes.visible=false;root.add(motes);
 const orb=make(0),palm=make(2);soren84.world=root;soren84.pool={shots,bursts,light,motes,orb,palm,particles:[],matrix:new THREE.Matrix4(),cursor:0,shotCursor:0,entry:null};return soren84.pool;
}
function sorenLight84(p,position,intensity){if(intensity>p.light.intensity){p.light.position.copy(position);p.light.intensity=intensity;}}
function sorenBurst84(position,strong=false,ward=false){
 if(!battle)return;
 const p=initSorenFX84(),b=p.bursts[p.cursor++%p.bursts.length];b.age=0;b.duration=ward?1.05:.65;b.size=ward?2.7:strong?2.8:1.8;b.mesh.position.copy(position);b.floor.position.set(position.x,heightAt(position.x,position.z)+.04,position.z);b.mesh.material.uniforms.tint.value.set(ward?'#9fdfff':'#63bfff');b.ward=ward;soren84.impacts++;
 sorenLight84(p,position,ward?20:strong?45:28);
 for(let i=0;i<(strong?16:10)&&p.particles.length<48;i++){const a=i*2.39996;p.particles.push({x:position.x,y:position.y,z:position.z,vx:Math.cos(a)*(.8+i%3*.3),vy:1+i%4*.2,vz:Math.sin(a)*(.8+i%3*.3),age:0,life:.35+i%3*.07});}
}
function sorenShot84(a,to,duration,strong){
 if(!battle)return;
 const p=initSorenFX84(),s=p.shots[p.shotCursor++%p.shots.length];s.age=0;s.duration=Math.max(.08,duration);s.from.copy(sorenOrb84(a));s.to.copy(to);s.size=strong?.8:.55;soren84.projectiles++;playSound('arcane',.55);
}
const sorenProjectileBefore84=combatProjectile;
combatProjectile=function(kind,from,to,duration,strong=false,...args){
 const a=battle?.combo?.id==='soren'?battle.combo.actor:battle?.animation?.actor;
 if(sorenMeta84(a)&&kind==='arcane'){
  const c=battle?.combo;if(c?.actor===a){const clip=['pulseOne','pulseTwo','pulseThree'][c.step],m=sorenMeta84(a);setActorFrame(a,clip,m.impactFrame[clip]);}
  else if(battle.animation?.soren84){const m=sorenMeta84(a),clip=battle.animation.soren84.clip;setActorFrame(a,clip,m.impactFrame[clip]);duration=battle.animation.duration*(battle.animation.impactAt-.52);}
  sorenShot84(a,to,duration,strong);return;
 }
 return sorenProjectileBefore84(kind,from,to,duration,strong,...args);
};
const sorenCastBefore84=castFX;
castFX=function(kind,from,to,strong=false,...args){
 const a=battle?.combo?.id==='soren'?battle.combo.actor:battle?.animation?.actor;
 if(sorenMeta84(a)&&['arcane','ward','heal','impact'].includes(kind)){sorenBurst84(to,strong,kind==='ward'||kind==='heal');playSound(kind==='ward'?'ward':kind==='heal'?'heal':'arcane',strong?.7:.5);return;}
 return sorenCastBefore84(kind,from,to,strong,...args);
};
function updateSorenFX84(dt){
 if(!battle){if(soren84.pool)disposeSorenFX84();return;}
 const cast=[player,...followers,...battle.enemies.map(e=>e.actor)],caster=sorenMeta84(battle.animation?.actor)?battle.animation.actor:sorenMeta84(battle.combo?.actor)?battle.combo.actor:null,a=caster??cast.find(a=>sorenMeta84(a)&&a.mesh.visible),root=brenRoot82();
 if(soren84.world&&soren84.world!==root)disposeSorenFX84();if(!a&&!soren84.pool)return;
 const p=initSorenFX84();p.light.intensity*=Math.exp(-dt*11);const orb=a?sorenOrb84(a):null,entry=a?.sorenEntry84,cue=battle.animation;
 p.orb.visible=!!a&&!['knockedOut','victory'].includes(a.frame.action);
 if(p.orb.visible){p.orb.position.copy(orb);p.orb.quaternion.copy(camera.quaternion);p.orb.scale.setScalar(.24);p.orb.material.uniforms.opacity.value=.28+.04*Math.sin(clock*3);}
 // A single pooled high-resolution rune follows the authored empty palm.
 // Its light shares the existing environment slot and creates no shadow map.
 const hand=a&&sorenMeta84(a)?.palmFrames?.[a.frame.cell],active=!!a&&['battleRise','battleIdle','pulseOne','pulseTwo','pulseThree','arcanePulse','ward','channel'].includes(a.frame.action),quiet=a?.frame.action==='battleIdle';
 p.palm.visible=!!hand&&active&&(a.frame.action!=='battleRise'||entry?.started);
 if(p.palm.visible){const pos=sorenPalm85(a);p.palm.position.copy(pos);p.palm.quaternion.copy(camera.quaternion);p.palm.scale.setScalar(quiet?.22:.32);p.palm.material.uniforms.age.value=.28+.04*Math.sin(clock*2);p.palm.material.uniforms.opacity.value=quiet?.16:.48;sorenLight84(p,pos,quiet?.55:1.6);}
 if(entry?.started&&entry.time<1.2&&p.entry!==entry){p.entry=entry;sorenBurst84(V3(a.x,heightAt(a.x,a.z)+.13,a.z),false,true);}
 if(entry?.started&&entry.time<1.2){sorenLight84(p,orb,10*Math.sin(entry.time/1.2*Math.PI));}
 if(cue?.soren84){const q=cue.soren84,t=cue.time/cue.duration;if(t<q.release)sorenLight84(p,sorenOrb84(cue.actor),Math.pow(t/q.release,2)*12);
  if(q.enemyShot&&!q.sent&&t>=q.release&&q.target){q.sent=true;const m=sorenMeta84(cue.actor);setActorFrame(cue.actor,q.clip,m.impactFrame[q.clip]);sorenShot84(cue.actor,actorImpactPoint(q.target),cue.duration*(q.impact-q.release),true);}
 }
 for(const s of p.shots){s.age+=dt;const t=s.age/s.duration;s.mesh.visible=s.tail.visible=t<1;if(t>=1)continue;
  const pos=s.from.clone().lerp(s.to,t);pos.y+=Math.sin(t*Math.PI)*.15;s.mesh.position.copy(pos);s.mesh.quaternion.copy(camera.quaternion);s.mesh.scale.setScalar(s.size);s.mesh.material.uniforms.opacity.value=.95;
  s.tail.position.copy(s.from).lerp(s.to,Math.max(0,t-.1));s.tail.quaternion.copy(camera.quaternion);s.tail.scale.setScalar(s.size*.7);s.tail.material.uniforms.opacity.value=.35;sorenLight84(p,pos,18);
 }
 for(const b of p.bursts){b.age+=dt;const t=b.age/b.duration;b.mesh.visible=b.floor.visible=t<1;if(t>=1)continue;b.mesh.quaternion.copy(camera.quaternion);b.mesh.scale.setScalar(b.size);b.floor.scale.setScalar(b.size*1.1);b.mesh.material.uniforms.age.value=t;b.floor.material.uniforms.age.value=t;b.mesh.material.uniforms.opacity.value=b.ward?.3:.8;b.floor.material.uniforms.opacity.value=.75;}
 for(let i=p.particles.length-1;i>=0;i--){const s=p.particles[i];s.age+=dt;if(s.age>s.life){p.particles.splice(i,1);continue;}s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;s.vy-=2.5*dt;}
 p.motes.visible=p.particles.length>0;p.motes.count=p.particles.length;for(let i=0;i<p.particles.length;i++){const s=p.particles[i],v=1-s.age/s.life;p.matrix.makeScale(v,v*2,v);p.matrix.setPosition(s.x,s.y,s.z);p.motes.setMatrixAt(i,p.matrix);}p.motes.instanceMatrix.needsUpdate=true;
 brenSurface82.positions.value[2].copy(p.light.position);brenSurface82.powers.value[2].set(p.light.color.r,p.light.color.g,p.light.color.b).multiplyScalar(p.light.intensity*.03);soren84.peakLight=Math.max(soren84.peakLight,p.light.intensity);
}
const sorenWorldBefore84=updateWorldFX;
updateWorldFX=function(dt){sorenWorldBefore84(dt);updateSorenFX84(dt);};
const sorenEndBefore84=endBattle;
endBattle=function(...args){const cast=[player,...followers],cleanup=()=>{if(!battle){disposeSorenFX84();for(const a of cast){delete a.sorenEntry84;delete a.sorenResolved84;if(a.sorenShadow84){const q=a.sorenShadow84;a.shadow.material.opacity=q.opacity;a.shadow.scale.set(q.x,q.y,1);delete a.sorenShadow84;}}}};const r=sorenEndBefore84(...args);cleanup();return r?.finally?r.finally(cleanup):r;};
