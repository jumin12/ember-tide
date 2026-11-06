// Canonical affinity/status definitions are shared by the resolver and every UI.
const ABILITY_TYPES65={
 Physical:{color:'#d9e0e5',x:100,y:234,filter:'grayscale(1)',description:'Weapon attacks and physical strikes.'},
 Fire:{color:'#f27947',x:385,y:234,description:'Fire magic and flame effects.'},
 Ice:{color:'#a7e9ff',x:672,y:234,description:'Ice magic and frost effects.'},
 Water:{color:'#6fa9f1',x:955,y:234,description:'Water magic and wave effects.'},
 Wind:{color:'#98d8f4',x:1236,y:234,filter:'hue-rotate(48deg)',description:'Wind magic and gust effects.'},
 Earth:{color:'#cba866',x:100,y:565,description:'Earth magic and stone effects.'},
 Lightning:{color:'#f4db76',x:385,y:565,description:'Lightning magic and electrical effects.'},
 Poison:{color:'#bd8ce3',x:672,y:565,filter:'hue-rotate(180deg)',description:'Poison magic and toxic effects.'},
 Light:{color:'#fff2bc',x:955,y:565,description:'Radiant magic and restorative abilities.'},
 Dark:{color:'#9d80d1',x:1236,y:565,description:'Dark magic and shadow effects.'}
};
const STATUS_TYPES65={};
[
 ['attackUp','Attack Up','Buffs',135,174,'#ee9b78','Increases physical attack power.'],['magicUp','Magic Up','Buffs',367,174,'#b399ed','Increases magic attack power.'],['defenseUp','Defense Up','Buffs',598,174,'#83bce8','Increases physical defense.'],['magicDefenseUp','Magic Defense Up','Buffs',836,174,'#8edfe4','Increases magic defense.'],['haste','Speed Up / Haste','Buffs',1068,174,'#eed17e','Increases action speed.'],['regen','Regen','Buffs',1300,174,'#9cdeb5','Gradually restores HP.'],
 ['attackDown','Attack Down','Debuffs',157,448,'#bf8b83','Decreases physical attack power.'],['magicDown','Magic Down','Debuffs',432,448,'#a78cbc','Decreases magic attack power.'],['defenseDown','Defense Down','Debuffs',704,448,'#d7a17f','Decreases physical defense.'],['magicDefenseDown','Magic Defense Down','Debuffs',978,448,'#a8a1df','Decreases magic defense.'],['slow','Slow','Debuffs',1250,448,'#a6b8ca','Decreases action speed.'],
 ['poisoned','Poisoned','Status Ailments',94,710,'#bc91db','Poison damage over time.'],['burning','Burning','Status Ailments',302,710,'#ee9877','Fire damage over time.'],['chill','Frozen / Chill','Status Ailments',510,710,'#a1dcef','Actions may be delayed or prevented.'],['shock','Shock','Status Ailments',718,710,'#ead477','May briefly prevent an action.'],['blind','Blind','Status Ailments',926,710,'#b3b5be','Reduces attack accuracy.'],['silence','Silence','Status Ailments',1133,710,'#d2b6e1','Prevents magic or special abilities.'],['stun','Stun','Status Ailments',1341,710,'#e9d382','Briefly prevents actions.']
].forEach(([id,name,group,x,y,color,description])=>STATUS_TYPES65[id]={name,group,x,y,color,description});
function combatType65(kind,id=null){
 if(ABILITY_TYPES65[kind])return kind;
 const map={blade:'Physical',arrow:'Physical',physical:'Physical',fire:'Fire',ice:'Ice',water:'Water',wind:'Wind',earth:'Earth',lightning:'Lightning',poison:'Poison',light:'Light',dark:'Dark',heal:'Light',ward:'Light',wardheal:'Light'};
 return map[String(kind).toLowerCase()]??(kind==='arcane'?(id==='mira'?'Light':'Dark'):null);
}
function skillType65(id,index){return combatType65(CAST[id]?.skill[index]?.[3],id);}
function basicType65(id){return id==='lysa'?'Fire':id==='soren'?'Dark':id==='mira'?'Light':'Physical';}
function isMagicalDamage65(kind){return combatType65(kind,currentFighter())!=='Physical';}
let combatSheetsReady65=false;
function icon65(kind,size=24,status=false){
 const d=(status?STATUS_TYPES65:ABILITY_TYPES65)[kind];if(!d)return'';
 if(!combatSheetsReady65&&assets.combatIcons65){const style=document.createElement('style');style.id='combat-icon-sheets65';style.textContent=Object.entries(assets.combatIcons65).map(([key,url])=>'.combat-icon65[data-'+(key==='ability'?'type':'status')+'65]{background-image:url("'+url+'")}').join('\n');document.head.append(style);combatSheetsReady65=true;}
 const crop=status?106:192,sheet=status?'status':'ability';
 return '<span class="combat-icon65" '+(status?'data-status65':'data-type65')+'="'+kind+'" role="img" aria-label="'+esc(d.name??kind)+'" style="--icon-size65:'+size+'px;--icon-color65:'+d.color+';background-size:'+(1536/crop*size)+'px '+(1024/crop*size)+'px;background-position:'+(-d.x/crop*size)+'px '+(-d.y/crop*size)+'px;filter:'+(d.filter??'none')+'"></span>';
}
const weakness65={serial:0,events:[],bus:new EventTarget(),voices:[],feedback:[],preview:null,stats:{discovered:0,voiceRequests:0}};
function ensureWeaknessState65(){
 if(!battle)return;
 if(!battle.id65)battle.id65='encounter65-'+(++weakness65.serial);
 battle.enemies.forEach((e,i)=>{e.uid65??=battle.id65+'/target/'+i;e.knownWeaknesses65??=new Set();});
}
function configuredWeaknesses65(e){return [...new Set((e.weaknesses65??e.weaknesses??[e.weakness]).map(k=>combatType65(k)).filter(Boolean))];}
function matchingWeakness65(e,kind,id){const type=combatType65(kind,id);return !!type&&configuredWeaknesses65(e).includes(type);}
function confirmWeakness65(e,type,attacker){
 ensureWeaknessState65();if(!battle||!type||!attacker||!configuredWeaknesses65(e).includes(type)||e.knownWeaknesses65.has(type))return false;
 e.knownWeaknesses65.add(type);
 const event={battleId:battle.id65,attackerId:attacker,targetId:e.uid65,targetName:e.name,type};
 weakness65.events.push(event);if(weakness65.events.length>100)weakness65.events.shift();weakness65.stats.discovered++;
 // Presentation observes an already-committed state change; it cannot alter HP.
 weakness65.bus.dispatchEvent(new CustomEvent('WeaknessDiscovered',{detail:event}));return true;
}
const discoveryDamageBefore65=damageEnemy;
damageEnemy=function(e,amount,...args){
 const hp=e?.hp??0,id=currentFighter(),type=combatType65(battle?.damageKind??basicType65(id),id),result=discoveryDamageBefore65(e,amount,...args);
 if(e&&hp>e.hp&&id)confirmWeakness65(e,type,id);return result;
};
weakness65.bus.addEventListener('WeaknessDiscovered',({detail:e})=>{
 weakness65.feedback.push({...e,born:clock});if(weakness65.feedback.length>8)weakness65.feedback.shift();
 const lines=['A perfect opening!','Right on target!'],preferred=lines[(weakness65.stats.discovered-1)%lines.length],text=lines.find(line=>line===preferred&&speech21.active?.key!==voiceLookupKey(e.attackerId,line))??lines.find(line=>speech21.active?.key!==voiceLookupKey(e.attackerId,line))??preferred,key=voiceLookupKey(e.attackerId,text),clip=assets.voices?.[key];
 if(!clip||!voiceEnabled21())return;
 // One reaction can acknowledge simultaneous AoE discoveries by the same
 // attacker; every target still receives its own authoritative discovery event.
 if(speech21.queue.some(q=>q.weaknessDiscovery65&&q.speaker===e.attackerId&&clock-(q.discoveryAt65??-10)<.16))return;
 // Use each character's own existing recording on the serialized speech bus.
 // An attack call already playing finishes normally; discovery never blocks a turn.
 const q={speaker:e.attackerId,text,key,clip,kind:'battle',token:++speech21.serial,combatMove49:true,weaknessDiscovery65:true,discoveryAt65:clock};
 speech21.queue.push(q);weakness65.voices.push({key,attacker:e.attackerId,battle:e.battleId,target:e.targetId,type:e.type});weakness65.stats.voiceRequests++;pumpSpeech21();
});
function activeStatuses65(entity,id=null){
 const values=new Map(),put=(key,turns=null)=>{if(STATUS_TYPES65[key]&&(turns===null||turns>0))values.set(key,{key,turns});};
 const aliases={speedUp:'haste',frozen:'chill',freeze:'chill',poison:'poisoned',burn:'burning',ward:'magicDefenseUp',exposed:'defenseDown'};
 for(const data of[entity?.statusEffects,entity?.statuses65,entity?.statuses,entity?.buffs,entity?.debuffs]){
  if(Array.isArray(data))for(const v of data){const key=typeof v==='string'?v:v.id??v.key;put(aliases[key]??key,typeof v==='string'?null:v.turns??v.duration??null);}
  else if(data&&typeof data==='object')for(const[k,v]of Object.entries(data))if(v!==false&&v!==0)put(aliases[k]??k,typeof v==='number'?v:v.turns??null);
 }
 if(id&&battle?.ward>0)put('magicDefenseUp',battle.ward);if(id&&battle?.guards.has(id))put('defenseUp',1);
 if(entity?.exposed>0)put('defenseDown',entity.exposed);if(entity?.braced)put('defenseUp',1);if(entity?.charged)put('attackUp',1);if(entity?.staggered)put('stun',1);
 return [...values.values()];
}
function statusRow65(entity,id=null){return '<div class="status-row65" aria-label="Active effects">'+activeStatuses65(entity,id).map(({key,turns})=>{const d=STATUS_TYPES65[key],text=d.name+(turns!==null?' · '+turns+' turn'+(turns===1?'':'s'):'')+' · '+d.description;return '<span class="status-slot65" tabindex="0" title="'+esc(text)+'" aria-label="'+esc(text)+'">'+icon65(key,id?22:typeof mobileBattle69==='function'&&mobileBattle69()?26:32,true)+(turns!==null?'<b>'+turns+'</b>':'')+'</span>';}).join('')+'</div>';}
function previewAbility65(button){
 const id=currentFighter();if(!battle||!id)return null;
 if(button?.dataset.skill!==undefined){const index=+button.dataset.skill,sk=CAST[id].skill[index];if(!sk)return null;return{type:skillType65(id,index),area:sk[3]==='ice'||state.characters[id].ascended&&id==='tavin',offensive:!['heal','ward','wardheal'].includes(sk[3]),id,index};}
 if(button?.dataset.action==='attack')return{type:basicType65(id),area:false,offensive:true,id};
 const item=ITEMS[button?.dataset.battleItem];if(item?.gemType65)return{type:item.gemType65,area:false,offensive:true,id};return null;
}
function updateCombatFeedback65(){
 if(!battle){weakness65.preview=null;weakness65.feedback.length=0;$('#discovery65')?.replaceChildren();document.querySelectorAll('.weak-badge65').forEach(n=>n.remove());return;}
 ensureWeaknessState65();
 let host=$('#discovery65');if(!host){host=document.createElement('div');host.id='discovery65';host.setAttribute('aria-live','polite');document.body.append(host);}
 weakness65.feedback=weakness65.feedback.filter(e=>clock-e.born<1.45&&e.battleId===battle.id65);
 const first=weakness65.feedback[0];host.hidden=!first||!!menu||!!dialogue||introLocked58();if(first){const key=first.targetId+'/'+first.type;if(host.dataset.key65!==key){host.dataset.key65=key;host.innerHTML=icon65(first.type,24)+'<span><b>Weakness discovered</b><small>'+esc(first.targetName)+' · '+first.type+'</small></span>';}}
 const selected=weakness65.preview,pending=battle.pending;
 const preview=pending?.type==='skill'?previewAbility65({dataset:{skill:String(pending.index)}}):pending?.type==='gem65'?{type:ITEMS[pending.item].gemType65,offensive:true,area:false}:selected;
 battle.enemies.forEach((e,i)=>{
  let n=document.querySelector('[data-weak-target65="'+i+'"]');if(!n){n=document.createElement('div');n.className='weak-badge65';n.dataset.weakTarget65=i;document.body.append(n);}
  const visible=battle.status==='choose'&&!dialogue&&!menu&&!introLocked58()&&e.hp>0&&e.actor.mesh.visible&&preview?.offensive&&e.knownWeaknesses65.has(preview.type)&&(preview.area||battle.target===i);
  n.hidden=!visible;if(!visible)return;
  if(n.dataset.type!==preview.type){n.dataset.type=preview.type;n.innerHTML=icon65(preview.type,22)+'<b>WEAK</b>';}
  const a=e.actor,p=V3(a.x,a.mesh.position.y+a.size*.95,a.z).project(camera);n.style.left=clamp((p.x*.5+.5)*innerWidth-46,8,innerWidth-100)+'px';n.style.top=clamp((-p.y*.5+.5)*innerHeight-42,68,innerHeight-130)+'px';
 });
}
function refreshEnemyInformation65(){
 if(!battle)return;ensureWeaknessState65();const host=$('#world-enemy-bars27');if(!host)return;
 battle.enemies.forEach((e,i)=>{const node=host.children[i];if(!node)return;node.querySelector('.enemy-weakness')?.remove();let info=node.querySelector('.enemy-information65');if(!info){info=document.createElement('section');info.className='enemy-information65';node.append(info);}
  const html=statusRow65(e)+(e.knownWeaknesses65.size?'<div class="known-types65" aria-label="Discovered weaknesses">'+[...e.knownWeaknesses65].map(type=>icon65(type,18)).join('')+'</div>':'');if(info.innerHTML!==html)info.innerHTML=html;
 });
}
const enemyInformationBefore65=updateEnemyBars27;
updateEnemyBars27=function(...args){const result=enemyInformationBefore65(...args);refreshEnemyInformation65();return result;};
function combatLegend65(){
 if(!battle)return;let root=$('#combat-legend65');if(root){root.remove();return;}
 root=document.createElement('section');root.id='combat-legend65';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','legend-title65');root.innerHTML='<header><div><small>FIELD GUIDE · COMBAT</small><h2 id="legend-title65">Combat icon legend</h2></div><button data-close-legend65 aria-label="Close combat legend">Close · Esc</button></header><div class="legend-scroll65"><h3>Ability types</h3><p>Enemy affinities are learned by landing a matching attack. Each target and each weakness is discovered separately.</p><div class="legend-grid65">'+Object.entries(ABILITY_TYPES65).map(([key,d])=>'<article>'+icon65(key,48)+'<div><h4>'+key+'</h4><p>'+d.description+'</p></div></article>').join('')+'</div>'+['Buffs','Debuffs','Status Ailments'].map(group=>'<h3>'+group+'</h3><div class="legend-grid65">'+Object.entries(STATUS_TYPES65).filter(([k,d])=>d.group===group).map(([k,d])=>'<article>'+icon65(k,42,true)+'<div><h4>'+d.name+'</h4><p>'+d.description+'</p></div></article>').join('')+'</div>').join('')+'</div>';
 document.body.append(root);root.querySelector('button').focus();
}
document.addEventListener('pointerover',e=>{const b=e.target.closest('#commands button');if(b){weakness65.preview=previewAbility65(b);updateCombatFeedback65();updateAbilityHelp65(b);}});
document.addEventListener('focusin',e=>{const b=e.target.closest('#commands button');if(b){weakness65.preview=previewAbility65(b);updateCombatFeedback65();updateAbilityHelp65(b);}});
document.addEventListener('pointerout',e=>{if(e.target.closest('#commands button')&&!e.relatedTarget?.closest?.('#commands button')){weakness65.preview=previewAbility65(document.activeElement?.closest('#commands button'));updateCombatFeedback65();}});
document.addEventListener('click',e=>{if(e.target.closest('[data-combat-legend65]')){e.preventDefault();e.stopImmediatePropagation();combatLegend65();}else if(e.target.closest('[data-close-legend65]')){$('#combat-legend65')?.remove();$('#battle-command button')?.focus();}},{capture:true});
document.addEventListener('keydown',e=>{const legend=$('#combat-legend65');if(!legend)return;e.preventDefault();e.stopImmediatePropagation();if(e.key==='Escape'){legend.remove();$('#battle-command button')?.focus();}else if(e.key==='Tab'){const nodes=[...legend.querySelectorAll('button')],i=nodes.indexOf(document.activeElement);nodes[(i+(e.shiftKey?-1:1)+nodes.length)%nodes.length]?.focus();}},{capture:true});
const informationRenderBefore65=render;
render=function(...args){const r=informationRenderBefore65(...args);updateCombatFeedback65();return r;};
const informationBattleEndBefore65=endBattle;
endBattle=function(...args){const r=informationBattleEndBefore65(...args);if(!battle){$('#combat-legend65')?.remove();updateCombatFeedback65();}return r;};
