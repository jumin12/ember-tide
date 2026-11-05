// Combat rules and rewards have one owner. Presentation modules consume these
// definitions instead of deciding damage, initiative or progression themselves.
const COMBAT_ROLES={bren:{speed:12,magic:20},soren:{speed:14,magic:40},tavin:{speed:18,magic:24},mira:{speed:13,magic:34},lysa:{speed:15,magic:42}};
const ENCOUNTERS={
 wildlife:{gold:40,xp:45,enemies:[['wolf','Duskfang Wolf',150,25,4,'hunt','arrow',15],['boar','Briartusk Boar',170,27,8,'brace','arcane',9]]},
 tavinIntro:{gold:30,xp:35,enemies:[['tribeMale','Affected tribe member',110,20,4,'strike','blade',11],['tribeFemale','Affected tribe member',105,19,3,'strike','arrow',13]]},
 commander1:{gold:100,xp:90,enemies:[['commander','Affected village Commander',340,32,9,'windup','arcane',12],['tribeMale','Affected follower',100,23,3,'strike','blade',10],['tribeFemale','Affected follower',100,23,3,'strike','arrow',13]]},
 betrayal:{gold:140,xp:120,enemies:[['sorenEnemy','Soren',760,38,6,'channel','blade',14]]},
 guard:{gold:35,xp:40,enemies:[['guardEnemy','Affected local guard',180,22,8,'brace','arcane',10]]},
 commander2:{gold:180,xp:130,enemies:[['commander2','Community Commander',680,38,11,'windup','ice',13],['tribeMale','Follower',160,26,5,'strike','arrow',12]]},
 commander3:{gold:260,xp:180,enemies:[['commander3','Network-site Commander',1450,43,12,'channel','blade',14],['tribeMale','Follower',200,29,6,'strike','arcane',12],['tribeFemale','Follower',190,28,5,'strike','arrow',15]]}
};
function characterStats(id,c){
  const base=CAST[id],role=COMBAT_ROLES[id]??{speed:12,magic:24},s={hp:base.hp+(c.level-1)*15,mp:base.mp+(c.level-1)*5,atk:base.atk+(c.level-1)*3,def:base.def+(c.level-1)*2,magic:role.magic+(c.level-1)*3,speed:role.speed};
  for(const key of Object.values(c.gear??{})){const it=ITEMS[key];if(it&&it.stat in s){s[it.stat]+=it.value;if(it.slot==='weapon')s.magic+=Math.floor(it.value*.5);}}
  return s;
}
function stats(id){return characterStats(id,state.characters[id]);}
function encounterRoster(kind){
  if(kind!=='random')return(ENCOUNTERS[kind]??ENCOUNTERS.commander3).enemies.map(q=>[...q]);
  const next=state.encounterSerial=(state.encounterSerial??0)+1,level=Math.max(1,Math.round(state.members.reduce((v,id)=>v+state.characters[id].level,0)/state.members.length)),area=activeScene?.key??'overworld';
  const wolf=['wolf','Duskfang Wolf',145,25,4,'hunt','arrow',15],boar=['boar','Briartusk Boar',175,27,8,'brace','arcane',9];
  const choices=[[wolf,boar],[wolf],[boar,boar],[wolf,wolf]];
  if(assets.sprites.bird)choices.push([['bird','Hooked-beak bird',155,26,3,'hunt','arrow',19],wolf]);
  if(assets.sprites.ogre&&level>=3)choices.push([['ogre','Ogre',400,35,12,'windup','arcane',8]]);
  const index=(next+([...area].reduce((s,c)=>s+c.charCodeAt(0),0)))%choices.length;
  return choices[index].map(q=>{const r=[...q];r[2]=Math.round(r[2]*(1+(level-1)*.13));r[3]+=Math.min(10,(level-1)*2);return r;});
}
function encounterRewards(kind,roster=[]){const q=ENCOUNTERS[kind];return q?{gold:q.gold,xp:q.xp}:{gold:20+roster.length*18,xp:20+roster.length*22};}
function battleReward(){return battle?.rewards??ENCOUNTERS[battle?.kind]??{gold:40,xp:45};}
function growthFor(id,xpAward){const c=state.characters[id],before={level:c.level,xp:c.xp,...stats(id)};let level=c.level,xp=c.xp+xpAward;while(level<99&&xp>=level*80){xp-=level*80;level++;}const added=level-c.level;return{id,before,level,xp,next:level*80,hp:before.hp+15*added,mp:before.mp+5*added,atk:before.atk+3*added,def:before.def+2*added};}
function growthPreview(id){return growthFor(id,battleReward().xp);}
function applyBattleGrowth(id,xp){const c=state.characters[id],g=growthFor(id,xp);c.level=g.level;c.xp=g.xp;if(g.level>g.before.level){c.hp=Math.min(stats(id).hp,c.hp+40*(g.level-g.before.level));c.mp=Math.min(stats(id).mp,c.mp+15*(g.level-g.before.level));toast(CAST[id].name+' reached level '+c.level+'.');}return g;}
function makeQueue(){
  const tutorial=battle.kind==='wildlife'&&!state.flags.combat_tutorial_complete,entries=[...state.members.filter(id=>state.characters[id].hp>0).map((id,i)=>({key:id,speed:stats(id).speed,order:i})),...battle.enemies.flatMap((e,i)=>e.hp>0?[{key:'enemy:'+i,speed:e.speed??10,order:state.members.length+i}]:[])];
  if(!tutorial)entries.sort((a,b)=>b.speed-a.speed||a.order-b.order);
  battle.queue=entries.map(q=>q.key);battle.turn=0;battle.status='choose';planEnemyIntentions();renderBattle();
}
function planEnemyIntentions(){for(const e of battle.enemies){if(e.hp<=0)continue;const ids=state.members.filter(id=>state.characters[id].hp>0),low=ids.slice().sort((a,b)=>state.characters[a].hp/stats(a).hp-state.characters[b].hp/stats(b).hp)[0];let type='strike',power=1,label='Strike';if(e.charged){type='heavy';power=1.65;label='Heavy strike';}else if(['windup','channel'].includes(e.behavior)&&battle.round%3===2){type='charge';power=0;label=e.behavior==='channel'?'Gathering energy':'Winding up';}else if(e.behavior==='brace'&&battle.round%3===2){type='brace';power=.65;label='Braced charge';}else if(e.behavior==='hunt'){type='hunt';power=.95;label='Focused attack';}const target=e.behavior==='hunt'?low:ids[(battle.round+battle.enemies.indexOf(e))%ids.length];e.intent={type,power,label,target};}}
function damageEnemy(e,amount){
  if(!e||e.hp<=0||amount<=0)return;const fighter=currentFighter(),kind=battle.damageKind??(fighter==='bren'?'blade':fighter==='tavin'?'arrow':fighter==='lysa'?'fire':'arcane'),armor=(e.def??0)*(e.braced?1.5:1)*(kind==='arrow'?.2:isMagicalDamage65(kind)?.15:1),weak=matchingWeakness65(e,kind,fighter);let damage=Math.max(1,Math.round((amount-armor*.35)*(weak?1.25:1)*(e.exposed?1.12:1)));
  if(battle.lesson18?.active)damage=Math.min(damage,Math.max(0,e.hp-1));if(damage<=0)return;
  e.hp=Math.max(0,e.hp-damage);e.actor.hitFlash=.5;combatFlinch(e.actor);floatText(e.actor,damage);sfx('hit');post.material.uniforms.flash.value=.12;
  if(battle.combo?.step===2&&battle.combo.input==='hit')e.staggered=true;
  if(e.hp<=0){e.actor.action='recoil';e.actor.subdued=true;}
}
function executeSkill(id,index,targetIndex){
  const c=state.characters[id],sk=CAST[id].skill[index];if(!sk||c.mp<sk[2])return;const a=actorFor(id),kind=sk[3],asc=c.ascended,target=battle.enemies[battle.target]?.hp>0?battle.enemies[battle.target]:battle.enemies.find(e=>e.hp>0);if(!a||!target)return;
  c.mp-=sk[2];battle.pending=null;a.action=['blade','arrow'].includes(kind)?'attack':'cast';a.actionTime=0;speak(id,asc?sk[5]:sk[0]);
  const from=()=>V3(a.x,heightAt(a.x,a.z)+1.1,a.z),to=e=>actorImpactPoint(e.actor),projectile=['fire','arcane','arrow'].includes(kind),area=kind==='ice'||asc&&id==='tavin';
  startActionAnimation({actor:a,duration:id==='bren'?1.1:1.35,lunge:kind==='blade'?target.actor:null,launch:projectile?()=>combatProjectile(kind,from(),to(target),.25,asc):null,impactAt:projectile?.78:.52,apply:()=>{
    if(['heal','wardheal'].includes(kind)){const ids=kind==='wardheal'||id==='bren'?state.members:[state.members[targetIndex]??id];for(const k of ids){const ally=state.characters[k];if(ally.hp<=0)continue;const amount=Math.round(stats(k).hp*sk[4]*(asc?1.5:1));const beforeHP65=ally.hp;ally.hp=Math.min(stats(k).hp,ally.hp+amount);const aa=actorFor(k);castFX('heal',from(),V3(aa.x,heightAt(aa.x,aa.z)+1,aa.z),asc);floatText(aa,'+'+(ally.hp-beforeHP65),false,true);}if(kind==='wardheal')battle.ward=asc?3:2;
    }else if(kind==='ward'){battle.ward=asc?4:3;for(const k of state.members){const aa=actorFor(k);castFX('ward',from(),V3(aa.x,heightAt(aa.x,aa.z)+1,aa.z),asc);}
    }else{battle.damageKind=kind;try{for(const e of area?battle.enemies.filter(e=>e.hp>0):[target]){castFX(kind,from(),to(e),asc,projectile);damageEnemy(e,Math.round((['arcane','fire','ice'].includes(kind)?stats(id).magic:stats(id).atk)*sk[4]*(asc?1.8:1)));if(id==='bren'&&index===0)e.exposed=2;}}finally{battle.damageKind=null;}}
  },done:finishTurn});
}
function performEnemyTurn(e){
  const ids=state.members.filter(id=>state.characters[id].hp>0);if(!ids.length){checkBattleOutcome();return;}const intent=e.intent??{type:'strike',power:1,label:'Strike',target:ids[0]},id=ids.includes(intent.target)?intent.target:ids[0],target=actorFor(id);
  if(intent.type==='charge'){e.charged=true;e.actor.action='guard';e.actor.actionTime=0;startActionAnimation({actor:e.actor,duration:.9,apply:()=>{castFX('ward',V3(e.actor.x,heightAt(e.actor.x,e.actor.z),e.actor.z),actorImpactPoint(e.actor));floatText(e.actor,'Preparing',false);},done:()=>{e.actor.action='enemyIdle';finishTurn();}});return;}
  e.actor.action='attack';e.actor.actionTime=0;const stagger=e.staggered?.7:1;e.staggered=false;e.charged=false;e.braced=intent.type==='brace';
  startActionAnimation({actor:e.actor,duration:intent.type==='heavy'?1.5:1.1,lunge:target,apply:()=>{
    const guarded=battle.guards.has(id),damage=Math.max(3,Math.round((e.atk-stats(id).def*.3)*(intent.power??1)*stagger*(guarded?.45:1)*(battle.ward>0?.65:1)));battle.guards.delete(id);state.characters[id].hp=Math.max(0,state.characters[id].hp-damage);target.hitFlash=.5;combatFlinch(target);castFX('impact',actorImpactPoint(e.actor),actorImpactPoint(target),intent.type==='heavy'||e.id==='ogre');floatText(target,damage);if(e.id==='ogre'){playSound('ogre-club-smash',.65);sparks(actorImpactPoint(target),'#d5bc82',18,1.2);}else sfx('hit');
  },done:()=>{e.actor.action='enemyIdle';e.actor.actionTime=0;finishTurn();}});
}

function beginBattle(kind){if(battle)return;closeMenu();const prepared=prepareBattlefield(kind),origin=prepared.origin,center=prepared.center;state.mode='battle';const partyActors=[player,...followers];partyActors.forEach((a,i)=>{const p=battleFormation(center,i);a.x=p.x;a.z=p.z;a.action='battleIdle';a.actionTime=0;a.characterId=state.members[i];});const roster=encounterRoster(kind);
 const enemies=roster.map(([id,name,hp,atk,def,behavior,weakness,speed],i)=>{const p=battleFormation(center,i,true),a=createActor(id,p.x,p.z,id==='wolf'?2.5:id==='boar'?2.05:2.45);a.enemy=true;a.action='enemyIdle';a.actionTime=i*.15;a.home={x:a.x,z:a.z};return{id,name,hp,maxHp:hp,atk,def,behavior,weakness,speed,actor:a};});battle={kind,rewards:encounterRewards(kind,roster),origin,center,battleLights:prepared.lights,enemies,phase:1,status:'intro',intro:2,round:1,queue:[],turn:0,target:0,pending:null,combo:null,animation:null,ward:0,guards:new Set(),phaseBreak:false};primeBattleIntro58(battle);for(const id of state.members){state.characters[id].ascended=false;state.characters[id].charge=0;}$('#hud').classList.add('hidden');$('#battle-hud').classList.remove('hidden');$('#letterbox').classList.add('active');$('#battle-context').textContent=kind==='wildlife'?'Distressed wildlife · Protect the residents':kind==='betrayal'?'Chapter 1 · An answer at any cost':kind==='commander3'?'Chapter 2 · Stop the unfinished command':'Stand together · Stay in control';$('#battle-callout').textContent='';$('#battle-message').classList.add('hidden');updateCamera(1,true);renderBattle();sfx('cast');}

function endBattle(outcome){if(!battle)return;const b=battle;for(const c of Object.values(state.characters)){c.ascended=false;c.charge=0;}battle=null;$('#battle-hud').classList.add('hidden');$('#battle-message').classList.add('hidden');$('#combo').classList.add('hidden');$('#letterbox').classList.remove('active');state.mode='explore';restoreBattlefield(b);$('#hud').classList.remove('hidden');if(outcome==='won'){const reward=b.rewards??{gold:40,xp:45};state.gold+=reward.gold;for(const id of state.members)applyBattleGrowth(id,reward.xp);
 if(b.kind==='wildlife'){state.flags.wildlife_encounter_complete=true;nextBeat();beginElderApproach();}else if(b.kind==='tavinIntro'){nextBeat();state.members=['bren','soren'];setupParty([player.x,player.z]);startDialogue([['Tavin','They’re alive. I’ll find what’s doing this to them.'],['','Bren and Soren arrive after Tavin’s encounter.']]);}else if(b.kind==='commander1'){state.flags.commander1_restrained=true;nextBeat();}else if(b.kind==='betrayal'){state.flags.soren_departed=true;nextBeat();startDialogue([['Bren','You can still help us stop this.'],['Soren','I can’t let it happen again.'],['','Soren escapes after the exchange. His forced command destabilizes the remnant again. The residents need protection.']],()=>{for(const o of interactables)if(o.actorId==='soren'&&o.actor){o.actor.mesh.visible=false;o.actor.shadow.visible=false;}});}else if(b.kind==='guard'){nextBeat();startDialogue([['Guard','I felt it too. The same pull. I’m sorry.'],['Tavin','Now you know why they came for help.'],['','Temporary shelter is granted. Immediate tension eases, though trust is still incomplete.']]);}else if(b.kind==='commander2'){state.items.notes=1;nextBeat();toast('Recovered the Commander’s notes.');}else if(b.kind==='commander3'){state.items.component=1;state.items.order=1;nextBeat();startDialogue([['Commander','Fall back!'],['Mira','The pull has stopped. They’re coming around.'],['','The Commander withdraws. The component taken from this site’s mechanism is recovered.']]);}autoSave();}updateHUD();}

function updateBattle(dt){if(!battle)return;voiceTimer-=dt;if(voiceTimer<=0)$('#battle-callout').textContent='';if(battle.status==='victory'){for(const e of battle.enemies)updateBattleRetreat(e.actor,dt);if(battle.kind==='wildlife'&&battle.enemies.every(e=>!e.actor.mesh.visible)){$('#victory-continue').disabled=false;$('#battle-message').classList.remove('hidden');}return;}if(battle.intro>0){battle.intro-=dt;if(battle.intro<=0){$('#letterbox').classList.remove('active');makeQueue();if(battle.kind==='wildlife')toast('Attack: press E or click when the marker crosses the gold window.');}return;}if(battle.status==='combo'){const c=battle.combo;c.t+=dt;$('#timing-needle').style.left=clamp(c.t/c.duration*100,0,100)+'%';$('#combo-progress').textContent=(c.step+1)+' / '+c.chain+' · '+c.success+' hits';if(c.t>=c.duration)resolveCombo(true);return;}
 if(battle.animation){const a=battle.animation;a.time+=dt;if(a.lunge){const t=clamp(a.time/a.duration,0,1),pulse=t<.52?smooth(.1,.52,t):1-smooth(.62,1,t);a.actor.x=mix(a.start.x,a.lunge.x,pulse);a.actor.z=mix(a.start.z,a.lunge.z,pulse);}if(a.launch&&!a.launched&&a.time>=a.duration*.52){a.launched=true;a.launch();}if(a.time>=a.duration*a.impactAt&&!a.applied){a.applied=true;a.apply();}if(a.time>=a.duration){a.time=a.duration;if(!a.endPoseRendered){a.endPoseRendered=true;return;}a.actor.x=a.start.x;a.actor.z=a.start.z;battle.animation=null;a.done();}return;}
 if(battle.status==='choose'){const id=currentFighter();if(id&&state.characters[id].hp<=0){finishTurn();return;}if(!id){const q=battle.queue[battle.turn];if(!q){makeQueue();return;}const enemy=battle.enemies[+q.split(':')[1]];if(!enemy||enemy.hp<=0){finishTurn();return;}performEnemyTurn(enemy);}}
 for(const a of actors){if(a.action==='battleIdle'){const f=assets.sprites[a.id].frames.battleIdle;if(f)setActorFrame(a,'battleIdle',Math.floor(clock*2)%f.length);}if(a.enemy&&a.action==='enemyIdle'){const f=assets.sprites[a.id].frames.enemyIdle;if(f)setActorFrame(a,'enemyIdle',Math.floor(clock*3)%f.length);}}
}
