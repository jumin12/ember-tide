// Timed attacks are actual consecutive swings. The timing marker runs over
// each native animation instead of leaving everyone idle before one final hit.
const combatPacing={hits:0,chains:0,damageMoments:[],actionStarts:[]};
const battleArenaCache=new Map();
prepareBattlefield=function(kind){
 const started=performance.now();if([player,...followers].map(a=>a.characterId??a.id.replace('Ascended','')).join(',')!==state.members.join(','))setupParty([player.x,player.z]);
 const origin={scene:state.scene,x:player.x,z:player.z,poses:[player,...followers].map(a=>({a,x:a.x,z:a.z,face:a.face,id:a.characterId??a.id})),hidden:[]},key=world.userData.serial+':'+Math.round(player.x/8)+','+Math.round(player.z/8)+':'+state.members.length;
 const usable=c=>{const party=state.members.map((_,i)=>battleFormation(c,i)),enemies=Array.from({length:3},(_,i)=>battleFormation(c,i,true)),all=[...party,...enemies];if(all.some(q=>!staticFree(q.x,q.z,.42)))return false;const heights=all.map(q=>heightAt(q.x,q.z));if(Math.max(...heights)-Math.min(...heights)>1.8)return false;return party.every(p=>enemies.every(e=>edgeFree(p,e,.35)));};
 let center=battleArenaCache.get(key);if(!center||!usable(center)){center=null;for(const r of[0,3,6,9,13,18,24,30]){for(let k=0;k<(r?12:1);k++){const a=k*TAU/12,c={x:player.x-3+Math.cos(a)*r,z:player.z-2+Math.sin(a)*r};if(usable(c)){center=c;break;}}if(center)break;}center??={x:player.x-3,z:player.z-2};battleArenaCache.set(key,center);}
 for(const a of actors)if(a.npc&&a.mesh.visible&&Math.hypot(a.x-center.x,a.z-center.z)<22){origin.hidden.push(a);a.mesh.visible=a.shadow.visible=false;}
 const lights=[world.userData.lanterns[2],world.userData.lanterns[3]];for(let i=0;i<lights.length;i++){const l=lights[i];l.position.set(center.x+(i?-6:6),heightAt(center.x,center.z)+5,center.z+4);l.color.set(i?'#9ecfed':'#ffca83');l.intensity=i?12:18;l.distance=19;l.userData.power=l.intensity;}
 route=null;keys.clear();openWorldDebug.battles++;combatPacing.entryMs=performance.now()-started;return{origin,center,lights};
};
const battleActionBeforeLiveChains=battleAction;
battleAction=function(type,index=0){
 if(type!=='attack')return battleActionBeforeLiveChains(type,index);if(!battle||battle.status!=='choose')return;const id=currentFighter();if(!id)return;
 const a=actorFor(id),target=battle.enemies[battle.target]?.hp>0?battle.enemies[battle.target]:battle.enemies.find(e=>e.hp>0);if(!a||!target)return;
 battle.combo={id,actor:a,target,step:0,t:0,duration:.9,success:0,chain:3,input:null,applied:false,ending:false,start:{x:a.x,z:a.z},hitWindows:[],impactUntil:0};battle.status='combo';a.action='attack';a.actionTime=0;
 $('#combo-name').textContent=CAST[id].name+' · '+(state.characters[id].ascended?'Ascended chain':'Attack chain');$('#combo').classList.remove('hidden');$('#combo-progress').textContent='1 / 3 · Strike in the gold window';combatPacing.chains++;combatPacing.actionStarts.push({id,time:clock});renderBattle();
};
comboHit=function(){
 const c=battle?.combo;if(!c||battle.status!=='combo'||c.input||c.ending)return;const phase=c.t/c.duration,hit=phase>=.65&&phase<=.85;c.input=hit?'hit':'miss';c.hitWindows.push(phase);
 if(hit){c.success++;applyLiveChainHit(c,true);floatText(c.actor,c.step===2?'Perfect chain':'Good timing',true);}else{sfx('miss');$('#combo-progress').textContent='Miss · Recovering';}
};
function applyLiveChainHit(c,hit){
 if(c.applied||c.target.hp<=0)return;const a=c.actor,id=c.id,asc=state.characters[id].ascended,from=V3(a.x,heightAt(a.x,a.z)+1,a.z),to=V3(c.target.actor.x,heightAt(c.target.actor.x,c.target.actor.z)+1,c.target.actor.z),kind=id==='bren'?'blade':id==='tavin'?'arrow':id==='lysa'?'fire':'arcane';
 if(id!=='bren'&&!c.projectileStarted){c.projectileStarted=true;c.hitIntent=hit;c.contactAt=clock+.16;c.impactUntil=clock+.045;combatProjectile(kind,from,to,.16,asc||hit&&c.step===2);return;}
 if(id!=='bren'&&clock<c.contactAt)return;c.applied=true;if(id==='bren')c.impactUntil=clock+.045;
 const power=(hit?.42+c.step*.11:.23)*(asc?1.8:1),damage=Math.max(1,Math.round(stats(id).atk*power)),strong=hit&&c.step===2||asc;
 castFX(kind,from,to,strong,true);damageEnemy(c.target,damage);combatPacing.hits++;combatPacing.damageMoments.push({id,time:clock,step:c.step,hit,damage});if(combatPacing.damageMoments.length>90)combatPacing.damageMoments.shift();
 if(c.step===2&&hit)speak(id,id==='bren'?'Driving slash!':id==='tavin'?'Right on target!':'A perfect opening!');
}
function advanceLiveChain(dt){
 const c=battle.combo,a=c.actor;voiceTimer-=dt;if(voiceTimer<=0)$('#battle-callout').textContent='';
 if(c.contactAt&&!c.applied&&clock>=c.contactAt)applyLiveChainHit(c,c.hitIntent);
 if(c.ending){
  if(c.contactAt&&!c.applied&&c.target.hp>0)return;
  if(c.input==='hit'&&c.step+1<c.chain&&c.target.hp>0){c.step++;c.t=0;c.input=null;c.applied=false;c.ending=false;c.impactUntil=0;c.projectileStarted=false;c.contactAt=0;a.actionTime=0;}
  else{a.x=c.start.x;a.z=c.start.z;a.action='battleIdle';a.actionTime=0;battle.combo=null;$('#combo').classList.add('hidden');finishTurn();return;}
 }
 c.t=Math.min(c.duration,c.t+dt);const p=c.t/c.duration;
 if(c.input==='miss'&&p>=.72&&!c.applied)applyLiveChainHit(c,false);if(!c.input&&p>=.85){c.input='miss';applyLiveChainHit(c,false);}
 if(c.id==='bren'){const d=dist(c.start,c.target.actor),amount=Math.min(.55,Math.max(0,d-2.6)),pulse=p<.76?smooth(.18,.76,p):1-smooth(.79,1,p);a.x=c.start.x+(c.target.actor.x-c.start.x)/Math.max(.001,d)*amount*pulse;a.z=c.start.z+(c.target.actor.z-c.start.z)/Math.max(.001,d)*amount*pulse;}
 $('#timing-needle').style.left=(p*100)+'%';$('#combo-progress').textContent=(c.step+1)+' / '+c.chain+' · '+c.success+' precise hits';if(p>=1){c.ending=true;c.launched=false;}
}
const updateBeforeLiveChain=updateBattle;
updateBattle=function(dt){if(battle?.status==='combo'&&battle.combo)return advanceLiveChain(dt);updateBeforeLiveChain(dt);};
const actorBeforeLiveChain=updateActor;
updateActor=function(a,dt){actorBeforeLiveChain(a,dt);const c=battle?.combo;if(c?.actor!==a||battle.status!=='combo')return;
 const meta=assets.sprites[a.visualId??a.id],clip=meta.frames.attack,peak=meta.impactFrame?.attack??4,p=c.t/c.duration;
 let frame=p<.52?peak*.5*p/.52:p<.7?peak*.5+peak*.5*(p-.52)/.18:p<.83?peak:peak+(clip.length-1-peak)*(p-.83)/.17;
 if(clock<c.impactUntil)frame=peak;setActorFrame(a,'attack',Math.min(clip.length-1,Math.floor(frame+.0001)));
};
// The existing normal abilities keep their powered-up Ascended counterparts.
// No extra ultimate is added; targets and feedback match the ability text.
const actBeforePartySkills=battleAction;
battleAction=function(type,index=0){
 const id=currentFighter();if(type==='skill'&&id==='bren'&&index===1&&battle?.status==='choose'){if(state.characters[id].mp<CAST[id].skill[index][2])return toast('Not enough MP.');executeSkill(id,index,0);return;}
 actBeforePartySkills(type,index);
};
const skillBeforeClearTargets=executeSkill;
executeSkill=function(id,index,targetIndex){
 if(id==='lysa'&&index===1){const c=state.characters[id],sk=CAST[id].skill[index],a=actorFor(id);c.mp-=sk[2];battle.pending=null;a.action='cast';a.actionTime=0;speak(id,sk[0]);startActionAnimation({actor:a,duration:1.05,apply:()=>{for(const e of battle.enemies.filter(e=>e.hp>0)){castFX('ice',V3(a.x,heightAt(a.x,a.z)+1,a.z),V3(e.actor.x,heightAt(e.actor.x,e.actor.z)+1,e.actor.z),c.ascended);damageEnemy(e,Math.round(stats(id).atk*sk[4]*(c.ascended?1.8:1)));}},done:finishTurn});return;}
 skillBeforeClearTargets(id,index,targetIndex);
 if(battle?.animation){const cue=battle.animation,apply=cue.apply;cue.duration=id==='bren'?.95:1.1;
  if(cue.launch){const target=battle.enemies[battle.target]?.hp>0?battle.enemies[battle.target]:battle.enemies.find(e=>e.hp>0),a=actorFor(id),kind=CAST[id].skill[index][3];cue.launch=()=>combatProjectile(kind,V3(a.x,heightAt(a.x,a.z)+1.1,a.z),V3(target.actor.x,heightAt(target.actor.x,target.actor.z)+1,target.actor.z),cue.duration*.26,state.characters[id].ascended);}
  if(id==='mira'&&index===1)cue.apply=()=>{apply();for(const k of state.members){const a=actorFor(k);if(a&&state.characters[k].hp>0)castFX('ward',V3(a.x,heightAt(a.x,a.z),a.z),V3(a.x,heightAt(a.x,a.z)+1,a.z),state.characters[id].ascended);}};}
};
CAST.lysa.skill[1][1]='Ice erupts beneath every opponent.';
const renderBattleBeforeStatuses=renderBattle;
renderBattle=function(...args){renderBattleBeforeStatuses(...args);if(!battle)return;let node=$('#battle-status-effects');if(!node){node=document.createElement('div');node.id='battle-status-effects';$('#battle-hud').append(node);}node.innerHTML=(battle.ward>0?'<span>◇ Party ward · '+battle.ward+' rounds</span>':'')+[...battle.guards].map(id=>'<span>♜ '+esc(CAST[id].name)+' is guarding</span>').join('');};
