// Presentation owns these shots and its own random stream. Combat randomness,
// initiative, formation and action timers never advance the camera sequence.
const BATTLE_INTRO_SHOTS58={
 establishing:{name:'Establishing wide',from:{anchor:'center',offset:[0,.10,.18],look:'center',focus:0,fov:42},to:{anchor:'center',offset:[0,.025,.04],look:'center',focus:0,fov:39},duration:1.65,settle:.4,easing:'smoother',tags:[],exclude:[],weight:1,minClearance:3},
 enemy:{name:'Enemy reveal',from:{anchor:'enemy',offset:[-.12,.05,.11],look:'enemy',focus:.30,fov:41},to:{anchor:'center',offset:[-.04,.01,.025],look:'enemy',focus:.08,fov:39},duration:1.6,settle:.4,easing:'smoother',tags:[],exclude:[],weight:1.2,minClearance:3},
 party:{name:'Party reveal',from:{anchor:'party',offset:[.14,-.025,.08],look:'party',focus:.28,fov:42},to:{anchor:'center',offset:[.045,.01,.03],look:'party',focus:.07,fov:39},duration:1.7,settle:.4,easing:'smoother',tags:[],exclude:[],weight:1,minClearance:3},
 sweep:{name:'Lateral sweep',from:{anchor:'center',offset:[-.17,.035,.12],look:'center',focus:0,fov:41},to:{anchor:'center',offset:[.11,.02,.045],look:'center',focus:0,fov:39},duration:1.85,settle:.45,easing:'smoother',tags:[],exclude:['narrow'],weight:1,minClearance:3.5},
 low:{name:'Low-angle push',from:{anchor:'party',offset:[.045,-.12,-.08],look:'center',focus:0,fov:42},to:{anchor:'center',offset:[0,-.012,.045],look:'center',focus:0,fov:39},duration:1.65,settle:.4,easing:'sine',tags:['open'],exclude:['enclosed','foreground'],weight:.85,minClearance:4},
 elevated:{name:'Elevated reveal',from:{anchor:'center',offset:[-.045,.17,.15],look:'center',focus:0,fov:42},to:{anchor:'center',offset:[0,.035,.035],look:'center',focus:0,fov:39},duration:1.8,settle:.4,easing:'smoother',tags:[],exclude:['ceiling'],weight:.9,minClearance:4},
 shoulder:{name:'Over-shoulder establish',from:{anchor:'party',offset:[.17,-.025,.09],look:'enemy',focus:.20,fov:43},to:{anchor:'center',offset:[.055,0,.03],look:'enemy',focus:.06,fov:39},duration:1.7,settle:.45,easing:'smoother',tags:['open'],exclude:['enclosed','portrait'],weight:.8,minClearance:4},
 environment:{name:'Environment reveal',from:{anchor:'environment',offset:[-.11,.075,.14],look:'environment',focus:.32,fov:43},to:{anchor:'center',offset:[-.035,.02,.035],look:'center',focus:0,fov:39},duration:1.85,settle:.45,easing:'smoother',tags:[],exclude:['narrow'],weight:1,minClearance:3.5}
};
const BATTLE_INTRO_STAGES58={
 cavern:{tags:['enclosed','ceiling','narrow'],exclude:['elevated','low','shoulder'],environment:[-4,3,-6]},
 woodland:{tags:['open','foreground'],exclude:['low'],environment:[-5,3,-6]},
 moonlit:{tags:['open','foreground'],exclude:['low'],environment:[-5,3,-6]},
 ruins:{tags:['open','narrow'],exclude:['shoulder'],environment:[-4,3,-5]},
 waterfall:{tags:['open','water'],environment:[-3,4,-8]},
 coast:{tags:['open','water'],environment:[-5,2,-8]},
 mountain:{tags:['open','cliff'],environment:[-5,4,-7]},
 snow:{tags:['open','cliff'],environment:[-4,4,-7]}
};
const BATTLE_INTRO_OVERRIDES58={wildlife:'establishing',tavinIntro:'party',commander1:'enemy',betrayal:'shoulder',commander2:'enemy',commander3:'elevated'};
const battleIntro58={owner:null,phase:'idle',active:false,age:0,token:0,completed:0,blocked:0,last:null,history:[],random:seeded((Date.now()^0x58bc1721)>>>0),probe:new THREE.PerspectiveCamera(),ray:new THREE.Ray(),aspect:0};
const introEase58=(t,curve='smoother')=>{t=clamp(t,0,1);return curve==='sine'?(1-Math.cos(t*Math.PI))*.5:curve==='smooth'?t*t*(3-2*t):t*t*t*(t*(t*6-15)+10);};
function introMode58(){const mode=state.settings.battleIntro??'full';return mode==='off'?'off':mode==='reduced'||state.settings.motion===false||matchMedia('(prefers-reduced-motion:reduce)').matches?'reduced':'full';}
function introLocked58(){return battleIntro58.active&&battleIntro58.owner===battle;}
function clearBattleIntro58(){const q=battleIntro58;q.active=false;q.phase='idle';q.owner=null;q.context=null;q.from=q.to=q.gameplay=null;delete document.body.dataset.battleIntro58;}
function primeBattleIntro58(b){
 clearBattleIntro58();if(!b||gameLoading||loading36.active||perf.building||state.mode==='title')return;
 const q=battleIntro58;q.owner=b;q.active=true;q.phase='waiting';q.age=0;q.token++;q.sent=false;q.mode=introMode58();q.override=q.pendingOverride??encounter53.introOverride58??ENCOUNTERS[b.kind]?.introShot??BATTLE_INTRO_OVERRIDES58[b.kind];delete encounter53.introOverride58;
 document.body.dataset.battleIntro58='waiting';keys.clear();route=null;document.activeElement?.blur();
}
function introContext58(){
 const q=battleIntro58,b=battle,cast=[player,...followers,...b.enemies.map(e=>e.actor)],center=cameraTarget.clone(),distance=camera.position.distanceTo(cameraTarget),party=[player,...followers],enemies=b.enemies.map(e=>e.actor),mean=list=>{const p=V3();for(const a of list)p.add(V3(a.x,a.mesh.position.y+a.size*.5,a.z));return p.multiplyScalar(1/Math.max(1,list.length));};
 const stage=encounter53.active?encounter53.selected:activeScene.key,custom=encounter53.active?BATTLE_STAGES53[stage]?.introCamera:null,base=BATTLE_INTRO_STAGES58[stage]??{tags:encounter53.active?['open']:['story'],environment:[-4,3,-6]},meta={...base,...custom},tags=new Set(meta.tags??[]);if(camera.aspect<.8)tags.add('portrait');
 const c={stage,cast,meta,tags,distance,center,anchors:{center,party:mean(party),enemy:mean(enemies),environment:V3(b.center.x+(meta.environment?.[0]??-4),heightAt(b.center.x,b.center.z)+(meta.environment?.[1]??3),b.center.z+(meta.environment?.[2]??-6))},occluders:[]};
 // Existing combat cutaways keep scenery clear. Validate against the remaining
 // visible static architecture too, without raycasting every leaf triangle.
 if(!encounter53.active)for(const item of sight18.objects??[])if(item.group.visible&&!item.hidden)c.occluders.push(item.box??new THREE.Box3().setFromObject(item.group));
 return c;
}
function shotTransform58(part,c){
 const q=battleIntro58,d=c.distance,offset=part.offset??[0,0,0],p=q.gameplay.position.clone(),look=q.gameplay.target.clone(),anchor=c.anchors[part.anchor]??c.center;
 p.x+=offset[0]*d*Math.min(1,camera.aspect)+(anchor.x-c.center.x)*.12;p.y+=offset[1]*d;p.z+=offset[2]*d;
 look.lerp(c.anchors[part.look]??c.center,part.focus??0);return{position:p,target:look,fov:q.gameplay.fov+(part.fov-38)};
}
function mixIntroPose58(a,b,t){return{position:a.position.clone().lerp(b.position,t),target:a.target.clone().lerp(b.target,t),fov:mix(a.fov,b.fov,t)};}
function curvedIntroPose58(from,via,end,t,curve='smoother'){
 const s=introEase58(t,curve),a=mixIntroPose58(from,via,.55),b=mixIntroPose58(via,end,.45);
 // A continuous dolly through the reveal into the combat pose. One velocity
 // curve avoids braking to a stop and starting again at the settle boundary.
 const ab=mixIntroPose58(from,a,s),bc=mixIntroPose58(a,b,s),cd=mixIntroPose58(b,end,s);
 return mixIntroPose58(mixIntroPose58(ab,bc,s),mixIntroPose58(bc,cd,s),s);
}
function validIntroPose58(p,c,clearance=3){
 if(!p.position.toArray().concat(p.target.toArray(),p.fov).every(Number.isFinite)||p.fov<24||p.fov>105)return false;
 if(p.position.y<heightAt(p.position.x,p.position.z)+1.4)return false;
 if(encounter53.active&&!stageCameraClear59(p.position,c.cast))return false;
 const q=battleIntro58,probe=q.probe;probe.aspect=camera.aspect;probe.near=camera.near;probe.far=camera.far;probe.fov=p.fov;probe.position.copy(p.position);probe.lookAt(p.target);probe.updateProjectionMatrix();probe.updateMatrixWorld();
 for(const a of c.cast){const target=V3(a.x,a.mesh.position.y+a.size*.5,a.z);if(p.position.distanceTo(target)<clearance)return false;const screen=target.clone().project(probe);if(!screen.toArray().every(Number.isFinite)||screen.z< -1||screen.z>1||Math.abs(screen.x)>1.03||Math.abs(screen.y)>.94)return false;
  if(!encounter53.active){q.ray.set(p.position,target.clone().sub(p.position).normalize());const length=p.position.distanceTo(target);for(const box of c.occluders){const hit=q.ray.intersectBox(box,V3());if(hit&&hit.distanceTo(p.position)<length-.8)return false;}for(const t of[.2,.4,.6]){const at=p.position.clone().lerp(target,t);if(groundAt(at.x,at.z)>at.y-.3)return false;}}
 }
 return true;
}
function introCandidate58(id,c){
 const spec=BATTLE_INTRO_SHOTS58[id];if(!spec)return null;
 if(spec.exclude.some(tag=>c.tags.has(tag))||spec.tags.length&&!spec.tags.some(tag=>c.tags.has(tag))||(c.meta.exclude??[]).includes(id)||c.meta.clearance!==undefined&&spec.minClearance>c.meta.clearance)return null;
 const from=shotTransform58(spec.from,c),to=shotTransform58(spec.to,c),clearance=Math.max(spec.minClearance,c.meta.minClearance??0);
 for(const t of[0,.125,.25,.375,.5,.625,.75,.875,1])if(!validIntroPose58(curvedIntroPose58(from,to,battleIntro58.gameplay,t,spec.easing),c,clearance))return null;
 return{id,spec,from,to};
}
function startBattleIntro58(prepareOnly=false){
 const q=battleIntro58;if(!introLocked58()||q.phase!=='waiting')return;
 if(q.gameplay){if(!prepareOnly){q.phase=q.move?'intro':'settle';document.body.dataset.battleIntro58=q.phase;if(!q.duration)completeBattleIntro58();}return;}
 const value=battle.intro;battle.intro=0;introCameraBefore58(1,true);battle.intro=value;
 q.gameplay={position:camera.position.clone(),target:cameraTarget.clone(),fov:camera.fov};q.aspect=camera.aspect;q.context=introContext58();const c=q.context,forced=q.nextShot??q.override??c.meta.shot;delete q.nextShot;
 let selected=forced?introCandidate58(forced,c):null;q.fallback=null;
 if(forced&&!selected)q.fallback='Incompatible or obstructed authored shot';
 if(!forced){const choices=Object.keys(BATTLE_INTRO_SHOTS58).map(id=>introCandidate58(id,c)).filter(Boolean),pool=choices.filter(s=>s.id!==q.last),valid=pool.length?pool:choices;let pick=q.random()*valid.reduce((n,s)=>n+s.spec.weight,0);for(const shot of valid){pick-=shot.spec.weight;if(pick<=0){selected=shot;break;}}}
 if(!selected){selected=introCandidate58('establishing',c);q.fallback??='No compatible shot';}
 if(!selected)selected={id:'establishing',spec:BATTLE_INTRO_SHOTS58.establishing,from:q.gameplay,to:q.gameplay};
 q.shot=selected.id;q.last=q.shot;q.from=selected.from;q.to=selected.to;q.move=selected.spec.duration;q.settle=selected.spec.settle;q.easing=selected.spec.easing;
 if(q.mode!=='full'){q.from={position:q.gameplay.position.clone().lerp(q.gameplay.target,-.015),target:q.gameplay.target.clone(),fov:q.gameplay.fov+.35};q.to=q.gameplay;q.move=0;q.settle=q.mode==='off'?0:.42;}
 q.duration=q.move+q.settle;q.age=0;q.phase=prepareOnly?'waiting':q.move?'intro':'settle';document.body.dataset.battleIntro58=q.phase;
 q.history.push({shot:q.shot,stage:c.stage,mode:q.mode,duration:q.duration,fallback:q.fallback,kind:battle.kind});if(q.history.length>40)q.history.shift();
 applyBattleIntro58();if(!prepareOnly&&!q.duration)completeBattleIntro58();
}
function applyBattleIntro58(){
 const q=battleIntro58;if(!introLocked58()||!q.gameplay)return;
 let pose;if(q.move)pose=curvedIntroPose58(q.from,q.to,q.gameplay,q.age/q.duration,q.easing);else pose=mixIntroPose58(q.from,q.gameplay,introEase58(q.settle?q.age/q.settle:1));
 camera.position.copy(pose.position);cameraTarget.copy(pose.target);camera.fov=pose.fov;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=camera.position.distanceTo(cameraTarget);
 const direction=camera.position.clone().sub(cameraTarget),yaw=Math.atan2(direction.x,direction.z),pitch=Math.atan2(direction.y,Math.hypot(direction.x,direction.z));
 for(const a of q.context.cast){if(encounter53.active){a.mesh.quaternion.setFromAxisAngle(axis24,yaw);a.mesh.scale.y=1/Math.max(.75,Math.cos(pitch));}else a.mesh.quaternion.copy(camera.quaternion);}
 if(!encounter53.active)combatSight18(true);
}
function completeBattleIntro58(){
 const q=battleIntro58;if(!introLocked58()||q.sent)return;q.age=q.duration;applyBattleIntro58();q.sent=true;
 window.dispatchEvent(new CustomEvent('elyndor:battle-intro-complete',{detail:{token:q.token,shot:q.shot,kind:battle.kind}}));
}
window.addEventListener('elyndor:battle-intro-complete',e=>{
 const q=battleIntro58;if(!introLocked58()||e.detail.token!==q.token||!q.sent)return;
 q.active=false;q.phase='ready';q.completed++;battle.intro=0;keys.clear();document.body.removeAttribute('data-battle-intro58');$('#letterbox').classList.remove('active');
 if(!battle.queue.length&&battle.status==='intro'&&!combatLesson18()?.hold)makeQueue();else renderBattle();updateHUD();cameraPresentation.world=null;
});
const introBeginBefore58=beginBattle;
beginBattle=function(kind,options,...args){if(battle||encounter53.phase!=='idle')return;const before=battle,q=battleIntro58;q.pendingOverride=options?.introShot;if(kind==='random'&&options?.introShot)encounter53.introOverride58=options.introShot;let result;try{result=introBeginBefore58(kind,options,...args);}finally{q.pendingOverride=null;}if(battle&&battle!==before&&introLocked58()&&!encounter53.active)startBattleIntro58();return result;};
const introUpdateBefore58=updateBattle;
updateBattle=function(...args){if(introLocked58())return;return introUpdateBefore58(...args);};
const introCameraBefore58=updateCamera;
updateCamera=function(...args){const q=battleIntro58;if(!introLocked58())return introCameraBefore58(...args);const value=battle.intro;battle.intro=0;let result;try{result=introCameraBefore58(...args);}finally{battle.intro=value;}if(q.gameplay){if(Math.abs(camera.aspect-q.aspect)>.025){q.gameplay={position:camera.position.clone(),target:cameraTarget.clone(),fov:camera.fov};q.age=q.duration;completeBattleIntro58();}else applyBattleIntro58();}return result;};
const introTickBefore58=tick;
tick=function(dt){const q=battleIntro58;if(introLocked58()&&q.phase!=='waiting'){q.age=Math.min(q.duration,q.age+dt);q.phase=q.age<q.move?'intro':'settle';document.body.dataset.battleIntro58=q.phase;}const result=introTickBefore58(dt);if(introLocked58()&&q.phase!=='waiting'&&q.age>=q.duration)completeBattleIntro58();return result;};
const introEndBefore58=endBattle;
endBattle=function(...args){clearBattleIntro58();return introEndBefore58(...args);};
const introBuildBefore58=buildWorld;
buildWorld=function(...args){clearBattleIntro58();return introBuildBefore58(...args);};
// UI events and programmatic combat entry points obey the same presentation lock.
const introActionBefore58=battleAction,introSkillBefore58=executeSkill,introEnemyBefore58=performEnemyTurn,introFinishBefore58=finishTurn,introChainBefore58=comboHit,introAllyBefore58=battleAllyTarget,introAscendBefore58=ascend,introAnimationBefore58=startActionAnimation,introTargetBefore58=combatTargetActor;
battleAction=function(...a){if(introLocked58())return;return introActionBefore58(...a);};executeSkill=function(...a){if(introLocked58())return;return introSkillBefore58(...a);};performEnemyTurn=function(...a){if(introLocked58())return;return introEnemyBefore58(...a);};finishTurn=function(...a){if(introLocked58())return;return introFinishBefore58(...a);};comboHit=function(...a){if(introLocked58())return;return introChainBefore58(...a);};battleAllyTarget=function(...a){if(introLocked58())return;return introAllyBefore58(...a);};ascend=function(...a){if(introLocked58())return;return introAscendBefore58(...a);};startActionAnimation=function(...a){if(introLocked58())return;return introAnimationBefore58(...a);};combatTargetActor=function(...a){if(introLocked58())return;return introTargetBefore58(...a);};
for(const type of['keydown','keyup','pointerdown','pointerup','pointermove','pointerover','click','dblclick','wheel'])window.addEventListener(type,e=>{if(e.target instanceof Element&&e.target.closest('[data-dev-console60]'))return;if(!introLocked58())return;if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();keys.clear();battleIntro58.blocked++;},true);
const introPointerBefore58=updateCombatPointer;
updateCombatPointer=function(...args){if(!introLocked58())return introPointerBefore58(...args);if(combatPointer.ring)combatPointer.ring.visible=false;combatPointer.hover=null;for(const id of['combat-target-arrow','combat-target-label']){const n=$('#'+id);if(n)n.hidden=true;}};
const introMenuBefore58=renderMenu;
renderMenu=function(...args){const result=introMenuBefore58(...args);if(menu?.tab!=='settings'||$('#setting-battle-intro58'))return result;const row=document.createElement('div');row.className='setting-row';row.innerHTML='<label for="setting-battle-intro58">Battle intro camera<small>Short cinematic reveals before combat. Reduced movement also follows your motion preference.</small></label><select id="setting-battle-intro58"><option value="full">Full cinematic</option><option value="reduced">Reduced movement</option><option value="off">Off</option></select>';const motion=$('#setting-motion')?.closest('.setting-row');if(motion)motion.after(row);else $('#menu-content').append(row);const select=row.querySelector('select');select.value=['full','reduced','off'].includes(state.settings.battleIntro)?state.settings.battleIntro:'full';select.onchange=()=>{state.settings.battleIntro=select.value;saveSettings();};return result;};
const introBootBefore58=boot;
boot=async function(...args){const result=await introBootBefore58(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const data=JSON.parse(before()),q=battleIntro58;data.battleIntro={phase:q.phase,locked:introLocked58(),shot:q.shot??null,mode:q.mode??introMode58(),seconds:+q.age.toFixed(3),duration:q.duration??0,completed:q.completed,blockedInputs:q.blocked,fallback:q.fallback??null,history:q.history.slice(-8)};return JSON.stringify(data);};return result;};
