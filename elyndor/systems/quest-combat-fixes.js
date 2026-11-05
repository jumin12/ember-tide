// Quest visibility describes the current objective, independently of the
// optional compass tracking preference. Reuse the legend's actual icon URLs.
const questMarkersBefore64=mapMarkers51;
function currentStoryMarker64(){
 if(!player||!activeScene||currentBeat()[0]==='complete')return null;
 const target=objectiveTarget();if(!target||target.actor&&!target.actor.mesh.visible)return null;
 return{kind:'mainQuest',x:target.actor?.x??target.x,z:target.actor?.z??target.z,label:currentBeat()[2],id:'current-story',target};
}
mapMarkers51=function(...args){
 const rows=questMarkersBefore64(...args),story=currentStoryMarker64();
 if(story&&!rows.some(m=>m.kind==='mainQuest'&&Math.hypot(m.x-story.x,m.z-story.z)<.1))rows.push(story);
 return rows;
};
const questHeads64=new Map(),questHeadLayer64=document.createElement('div');questHeadLayer64.id='quest-heads64';questHeadLayer64.setAttribute('aria-hidden','true');document.body.append(questHeadLayer64);
function updateQuestHeads64(){
 const wanted=new Map(),visible=player&&['explore','dialogue','action'].includes(state.mode)&&!battle&&!gameLoading&&!poiFade.active&&!menu;
 if(visible){
  const story=currentStoryMarker64();if(story?.target.actor)wanted.set(story.target.actor,{...story,key:'story'});
  const giver=requestGiver51();if(giver?.actor&&requestsUnlocked16()){
   const request=requestState16(activeScene.key);if(!request.accepted&&!request.claimed&&!wanted.has(giver.actor)&&mapSeen51(giver.actor.x,giver.actor.z))wanted.set(giver.actor,{kind:'questNpc',label:LOCAL_REQUESTS16[activeScene.key].title,key:'request'});
  }
  const tracked=trackedQuest48();if(tracked?.kind==='request'&&tracked.target.actor&&!wanted.has(tracked.target.actor))wanted.set(tracked.target.actor,{kind:'sideQuest',label:tracked.label,key:'tracked-request'});
 }
 const retained=new Set();
 for(const[a,spec]of wanted){
  if(!a.mesh.visible||a===player||a.party||a.enemy)continue;
  const id=(a.instanceId??a.id)+':'+spec.key;retained.add(id);let icon=questHeads64.get(id);
  if(!icon){icon=document.createElement('img');icon.className='quest-head64';icon.alt='';questHeadLayer64.append(icon);questHeads64.set(id,icon);}
  const url=mapIconUrl51(spec.kind);if(icon.getAttribute('src')!==url)icon.setAttribute('src',url);icon.title=spec.label;
  const geometry=a.mesh.geometry;if(!geometry.boundingBox)geometry.computeBoundingBox();
  const p=V3(0,geometry.boundingBox.max.y+.2,0).applyMatrix4(a.mesh.matrixWorld).project(camera),onScreen=p.z>-1&&p.z<1&&Math.abs(p.x)<1.05&&Math.abs(p.y)<1.05;
  icon.hidden=!onScreen;if(onScreen){icon.style.left=(p.x*.5+.5)*innerWidth+'px';icon.style.top=(-p.y*.5+.5)*innerHeight+'px';}
 }
 for(const[id,icon]of questHeads64)if(!retained.has(id)){icon.remove();questHeads64.delete(id);}
}
const questRenderBefore64=render;
render=function(...args){const result=questRenderBefore64(...args);updateQuestHeads64();return result;};

// HP is authoritative. Visual completion never decides defeat, targeting,
// initiative, victory or rewards. Explicit story withdrawals retain their cues.
const combatDefeats64={events:[],started:0,active:new Set()},enemyDefeated64=new EventTarget();
const STORY_DEFEATS64=new Set(['tavinIntro','commander1','betrayal','guard','commander2','commander3']);
function usesSharedDefeat64(a){return !!a?.enemy&&!a.scriptedDefeat64&&!STORY_DEFEATS64.has(battle?.kind);}
function confirmEnemyDefeat64(e){
 if(!e||e.hp>0||e.defeatEvent64)return;
 e.defeatEvent64=true;e.defeated=true;e.targetable=false;
 if(usesSharedDefeat64(e.actor)){e.actor.route=e.actor.retreatRoute=null;e.actor.speed=0;e.intent=null;e.charged=e.braced=false;}
 enemyDefeated64.dispatchEvent(new CustomEvent('EnemyDefeated',{detail:{enemy:e,battle}}));
}
enemyDefeated64.addEventListener('EnemyDefeated',event=>{
 const {enemy:e,battle:b}=event.detail,a=e.actor;combatDefeats64.events.push({type:'EnemyDefeated',id:e.id,at:clock,shared:usesSharedDefeat64(a)});if(combatDefeats64.events.length>64)combatDefeats64.events.shift();
 if(!usesSharedDefeat64(a))return;
 a.subdued=true;a.flinchUntil=0;a.action='subdued';a.actionTime=0;a.retreatStart={x:a.x,z:a.z};a.retreatTown=false;a.retreatGoal=null;
 if(b.animation?.actor===a){b.animation=null;queueMicrotask(()=>{if(battle===b&&b.status!=='victory')finishTurn();});}
 releaseCreaturePixels(a);combatDefeats64.started++;combatDefeats64.active.add(a);
});
const damageBefore64=damageEnemy;
damageEnemy=function(e,...args){const result=damageBefore64(e,...args);if(e?.hp<=0&&usesSharedDefeat64(e.actor))confirmEnemyDefeat64(e);return result;};
const outcomeBefore64=checkBattleOutcome;
checkBattleOutcome=function(...args){const result=outcomeBefore64(...args);for(const e of battle?.enemies??[])if(e.hp<=0)confirmEnemyDefeat64(e);return result;};
const retreatPlanBefore64=planBattleRetreat;
planBattleRetreat=function(a,...args){
 if(!usesSharedDefeat64(a))return retreatPlanBefore64(a,...args);
 const e=battle?.enemies.find(e=>e.actor===a);if(e)confirmEnemyDefeat64(e);a.route=a.retreatRoute=null;a.speed=0;
};
const retreatBefore64=updateBattleRetreat;
updateBattleRetreat=function(a,dt,...args){
 if(!usesSharedDefeat64(a))return retreatBefore64(a,dt,...args);
 a.route=a.retreatRoute=null;a.speed=0;if(!a.mesh.visible){combatDefeats64.active.delete(a);return;}
 dissolveCreature(a,dt);if(!a.mesh.visible)combatDefeats64.active.delete(a);
};
const endBefore64=endBattle;
endBattle=function(...args){const result=endBefore64(...args);for(const a of combatDefeats64.active)if(!battle?.enemies.some(e=>e.actor===a))combatDefeats64.active.delete(a);return result;};
