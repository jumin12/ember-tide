// Quest receipts are part of the saved journey. Random loot is rolled once,
// committed with EXP and inventory, then reused for duplicate completion calls.
const GEM_TYPES65=['Fire','Ice','Water','Lightning','Wind','Earth','Poison'];
for(const type of GEM_TYPES65){const key='gem'+type;ITEMS[key]={name:type+' combat gem',type:'Supplies',icon:'◈',price:45,gemType65:type,power65:1.5,desc:'Consumable · Deals '+type+' magic damage to one enemy in combat.'};}
const questRewards65={queue:[],shown:null,grants:0};
const rewardDismiss87={timer:null,finish:null,closing:false};
function dismissQuestReward87(){
 if(!questRewards65.shown||rewardDismiss87.closing)return;
 clearTimeout(rewardDismiss87.timer);rewardDismiss87.closing=true;
 const receipt=questRewards65.shown,root=$('#quest-reward65');root?.classList.add('reward-leaving87');
 rewardDismiss87.finish=setTimeout(()=>{
  if(questRewards65.shown!==receipt)return;
  root.hidden=true;root.classList.remove('reward-leaving87');questRewards65.shown=null;rewardDismiss87.closing=false;showQuestReward65();
 },matchMedia('(prefers-reduced-motion:reduce)').matches?0:300);
}
function questRewardSpec65(kind,key,level=null){
 const tier=Math.min(2,Math.floor(Math.max(0,level??state.beat)/14)),main=kind==='main',pool=[{item:'herb',quantity:2+tier},{item:'ether',quantity:1+tier},{item:'revive',quantity:1},{item:'blade',quantity:1},{item:'coat',quantity:1},...GEM_TYPES65.map(type=>({item:'gem'+type,quantity:1+tier}))];
 return{xp:(main?90:45)+tier*(main?50:25),pool,rolls:main?2:1,tier};
}
function grantQuestReward65(id,title,kind,level=null,random=Math.random,guaranteed=null){
 state.questRewards65??={};if(state.questRewards65[id])return state.questRewards65[id];
 const spec=questRewardSpec65(kind,id,level),items={};for(let i=0;i<spec.rolls;i++){const loot=spec.pool[Math.min(spec.pool.length-1,Math.floor(clamp(random(),0,.999999)*spec.pool.length))];items[loot.item]=(items[loot.item]??0)+loot.quantity;}
 const receipt={id,title,kind,xp:spec.xp,items,guaranteed,tier:spec.tier,members:[...state.members],awardedAt:state.elapsed};
 // Inventory is an unbounded item-count dictionary in this game; no reward is
 // silently discarded by a display filter or an arbitrary stack/slot ceiling.
 for(const[key,count]of Object.entries(items))state.items[key]=(state.items[key]??0)+count;
 for(const member of receipt.members)applyBattleGrowth(member,receipt.xp);
 state.questRewards65[id]=receipt;questRewards65.grants++;questRewards65.queue.push(receipt);showQuestReward65();return receipt;
}
function showQuestReward65(){
 if(questRewards65.shown||!questRewards65.queue.length)return;
 const q=questRewards65.shown=questRewards65.queue.shift();let root=$('#quest-reward65');if(!root){root=document.createElement('aside');root.id='quest-reward65';root.setAttribute('role','status');root.setAttribute('aria-live','polite');document.body.append(root);}
 clearTimeout(rewardDismiss87.timer);clearTimeout(rewardDismiss87.finish);rewardDismiss87.closing=false;root.classList.remove('reward-leaving87');rewardDismiss87.timer=setTimeout(dismissQuestReward87,4000);
 const shown={...q.items};for(const [k,n]of Object.entries(q.guaranteed?.items??{}))shown[k]=(shown[k]??0)+n;
 root.hidden=false;root.innerHTML='<header><small>QUEST COMPLETE</small><button data-reward-close65 aria-label="Close quest rewards">×</button></header><h3>'+esc(q.title)+'</h3><p class="quest-exp65">+'+q.xp+' EXP <small>Each active party member</small></p><ul>'+Object.entries(shown).map(([key,n])=>'<li>'+(ITEMS[key].gemType65?icon65(ITEMS[key].gemType65,25):'<span class="reward-item65">'+esc(ITEMS[key].icon)+'</span>')+'<span>'+esc(ITEMS[key].name)+'</span><b>×'+n+'</b></li>').join('')+(q.guaranteed?.gold?'<li><span class="reward-item65">◉</span><span>Coins</span><b>+'+q.guaranteed.gold+'</b></li>':'')+'</ul><p class="quest-reward-note65">'+(q.kind==='main'?'Story rewards':'Local request rewards')+' · Added to your inventory</p>';
}
document.addEventListener('click',e=>{if(e.target.closest('[data-reward-close65]'))dismissQuestReward87();});
const questBeatBefore65=nextBeat;
nextBeat=function(...args){const index=state.beat;if(index<BEATS.length-1){const b=BEATS[index];grantQuestReward65('main:'+b[0],b[2],'main',index);}const result=questBeatBefore65(...args);return result;};
const questRequestBefore65=acceptRequest16;
acceptRequest16=function(key,...args){const was=!!requestState16(key).claimed,result=questRequestBefore65(key,...args);if(!was&&requestState16(key).claimed){const spec=LOCAL_REQUESTS16[key];grantQuestReward65('request:'+key,spec.title,'side',null,Math.random,{gold:spec.gold,items:{[spec.item]:1}});autoSave();}return result;};
function useCombatGem65(key){
 const it=ITEMS[key],id=currentFighter();if(!battle||battle.status!=='choose'||!id||!it?.gemType65||!(state.items[key]>0))return false;
 const a=actorFor(id),target=battle.enemies[battle.target]?.hp>0?battle.enemies[battle.target]:battle.enemies.find(e=>e.hp>0);if(!target)return false;
 battle.pending=null;a.action='cast';a.actionTime=0;
 startActionAnimation({actor:a,duration:.95,impactAt:.55,apply:()=>{
  if(!(state.items[key]>0)||target.hp<=0)return;state.items[key]--;
  const old=battle.damageKind;battle.damageKind=it.gemType65.toLowerCase();
  try{castFX(['Fire','Ice'].includes(it.gemType65)?it.gemType65.toLowerCase():'arcane',actorImpactPoint(a),actorImpactPoint(target.actor));damageEnemy(target,Math.round(stats(id).magic*it.power65));}finally{battle.damageKind=old;}
 },done:finishTurn});return true;
}
const gemActionBefore65=battleAction;
battleAction=function(type,index,...args){if(type==='item'&&ITEMS[index]?.gemType65)return useCombatGem65(index);return gemActionBefore65(type,index,...args);};
const gemUseBefore65=useItem;
useItem=function(key,id,inBattle,...args){if(ITEMS[key]?.gemType65){toast('Use combat gems from Items during battle.');return false;}return gemUseBefore65(key,id,inBattle,...args);};
const rewardLoadBefore65=loadSlot;
loadSlot=function(...args){resetQuestRewardUi65();return rewardLoadBefore65(...args);};
const gemItemIconBefore65=itemIcon26;
itemIcon26=function(key,...args){return ITEMS[key]?.gemType65?'<span class="item-icon">'+icon65(ITEMS[key].gemType65,32)+'</span>':gemItemIconBefore65(key,...args);};
function resetQuestRewardUi65(){clearTimeout(rewardDismiss87.timer);clearTimeout(rewardDismiss87.finish);rewardDismiss87.closing=false;questRewards65.queue.length=0;questRewards65.shown=null;const root=$('#quest-reward65');if(root){root.hidden=true;root.classList.remove('reward-leaving87');}}
const rewardStartBefore65=startJourney;
startJourney=function(...args){resetQuestRewardUi65();return rewardStartBefore65(...args);};
const rewardDevEndBefore65=endDevSession60;
endDevSession60=async function(...args){resetQuestRewardUi65();return rewardDevEndBefore65(...args);};
