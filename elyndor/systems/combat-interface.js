// Screen-space placement follows the approved Skills Menu animation. Actor
// feedback is projected separately; moving the camera never moves HUD panels.
const combatHud65={submenu:null,signature:'',lastTransition:null};
const BATTLE_COMMAND_ART={
 skills:'<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity=".57"/><path d="M6.7 7.1a6.5 6.5 0 0 1 10.7 2.4c-3.5-2.4-7.9-.9-7.6 2.4M17.2 16.9a6.5 6.5 0 0 1-10.7-2.4c3.5 2.4 7.9.9 7.6-2.4M8.1 16.4c-1.1-3.5.9-6.9 3.5-7.4m4.3-1.4c1.1 3.5-.9 6.9-3.5 7.4" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/>',
 items:'<path d="M9.6 6 7.7 2.6l2.7.8L12 2l1.7 1.4 2.6-.8L14.4 6Z M9.5 8h5c3 2.5 5.5 6.3 5.5 9.7 0 2.6-2.9 3.9-8 3.9s-8-1.3-8-3.9c0-3.4 2.5-7.2 5.5-9.7Z" fill="currentColor"/><path d="M9 6.9h6m-7.2 9.3c.8-2 1.8-3.1 3.3-4.3" stroke="#815022" stroke-width="1.4" stroke-linecap="round"/>',
 defend:'<path d="M12 2.4c2.8 1.6 5.7 2.2 8.2 2.7v5.5c0 4.7-3.2 8.2-8.2 11-5-2.8-8.2-6.3-8.2-11V5.1c2.5-.5 5.4-1.1 8.2-2.7Z" stroke="currentColor" stroke-width="1.75"/><path d="M12 4.2v7.6H5.6V6.4L12 4.2Zm0 7.6h6.4c-.5 3.2-3 5.7-6.4 7.9v-7.9Z" fill="currentColor"/>',
 ascend:'<path d="m12 2.8 9.2 9.2-9.2 9.2L2.8 12 12 2.8Zm0 6.1 3.1 3.1-3.1 3.1L8.9 12 12 8.9Z" stroke="currentColor" stroke-width="1.75"/>',
 flee:'<circle cx="17.5" cy="4.1" r="2.1" fill="currentColor"/><path d="m5.5 9.4 4.1-1.8 3.1 1.8 3.3 3.1 4.2-1.1M12.7 9.4l-3.5 6 4.7 2.2-1.7 3.6m-3-5.8-3.4 3.3-3.5-1.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>'
};
const partyEffectsBefore65=updatePartyCards36;
updatePartyCards36=function(id,...args){
 const node=$('#'+id);if(battle&&id==='battle-party'){
  const signature=JSON.stringify(state.members.map(k=>activeStatuses65(state.characters[k],k)));
  if(node.dataset.effects65!==signature){node.dataset.effects65=signature;delete node.dataset.cards36;}
 }
 return partyEffectsBefore65(id,...args);
};
const battleCardBefore65=card;
card=function(id,...args){
 if(!battle)return battleCardBefore65(id,...args);
 const c=state.characters[id],s=stats(id),a=CAST[id];
 return '<button class="party-card party-card65" data-ally="'+state.members.indexOf(id)+'" data-character="'+id+'" aria-label="'+a.name+' · HP '+c.hp+' of '+s.hp+' · MP '+c.mp+' of '+s.mp+'"><img src="'+face26(id)+'" alt=""><div><header><b>'+a.name+'</b><small>Lv '+c.level+'</small></header><label>HP <span>'+c.hp+' / '+s.hp+'</span></label><i class="stat-bar65"><em style="width:'+clamp(c.hp/s.hp*100,0,100)+'%"></em></i><label>MP <span>'+c.mp+' / '+s.mp+'</span></label><i class="stat-bar65 mp65"><em style="width:'+clamp(c.mp/s.mp*100,0,100)+'%"></em></i><label class="ascension-label65">Ascension <span>'+(c.ascended?'Active':c.charge+'%')+'</span></label><i class="stat-bar65 ascension65"><em style="width:'+(c.ascended?100:c.charge)+'%"></em></i></div>'+statusRow65(c,id)+'</button>';
};
function updateAbilityHelp65(button){
 const box=$('#ability-help65');if(!box||!battle)return;const p=previewAbility65(button),id=currentFighter();
 let text='Choose a command. Experiment with ability types to discover enemy weaknesses.';
 if(p?.index!==undefined)text=CAST[id].skill[p.index][1];else if(button?.dataset.action==='attack')text='Strike when the rings meet in gold. The first hit starts bullet time; the final impact restores speed.';else if(button?.dataset.battleItem)text=ITEMS[button.dataset.battleItem]?.desc??text;
 box.innerHTML=(p?.type?icon65(p.type,20)+'<b>'+p.type+'</b> ':'')+'<span>'+esc(text)+'</span>';
}
function decorateCommands65(){
 if(!battle)return;const id=currentFighter(),commands=$('#commands');
 const heading=$('#battle-command .command-head');
 let portrait=heading.querySelector('.command-portrait65');
 if(!portrait){portrait=document.createElement('img');portrait.className='command-portrait65';portrait.alt='';heading.append(portrait);}
 const face=id&&face26(id);
 portrait.hidden=!face;
 if(face&&portrait.getAttribute('src')!==face)portrait.setAttribute('src',face);
 for(const button of commands.querySelectorAll('button')){
  const p=previewAbility65(button),art=BATTLE_COMMAND_ART[button.dataset.action??button.dataset.battleSub];
  if(p?.type&&!art&&!button.querySelector('[data-type65]'))button.insertAdjacentHTML('afterbegin',icon65(p.type,25));
  if(p?.type){button.setAttribute('aria-description',p.type+' ability');button.title=(button.dataset.skill!==undefined?CAST[id].skill[+button.dataset.skill][1]+' · ':'')+p.type;}
  const text=[...button.childNodes].find(node=>node.nodeType===Node.TEXT_NODE),mark=text?.textContent.match(/^[⚔✧♧♜◇↗]/)?.[0];
  if(mark){
   text.textContent=text.textContent.slice(mark.length).trimStart();
   if(art||!p?.type){
    const icon=document.createElement('span');icon.className='command-mark65';icon.setAttribute('aria-hidden','true');
    icon.textContent=mark;
    if(art)icon.innerHTML='<svg viewBox="0 0 24 24" fill="none" focusable="false">'+art+'</svg>';
    button.prepend(icon);
   }
  }
  if(text?.textContent.trim()&&!button.querySelector('.command-label65')){
   const label=document.createElement('span');label.className='command-label65';
   text.replaceWith(label);label.append(text);
  }
 }
 let help=$('#ability-help65');if(!help){help=document.createElement('div');help.id='ability-help65';$('#battle-command').append(help);}
 let footer=$('#combat-footer65');if(!footer){footer=document.createElement('footer');footer.id='combat-footer65';footer.innerHTML='<button data-combat-legend65>Icon legend</button><small>Choose · Enter &nbsp; Back · Esc</small>';$('#battle-command').append(footer);}
 updateAbilityHelp65(document.activeElement?.closest('#commands button')??commands.querySelector('[data-skill], [data-action="attack"]'));
 const roster=$('#battle-party');
 roster.style.setProperty('--party-count65',state.members.length);
 roster.style.setProperty('--party-cols163',Math.min(state.members.length,2));
 for(const card of roster.querySelectorAll('.party-card65'))card.classList.toggle('battle-active163',card.dataset.character===id);
}
const combatUiBefore65=renderBattle;
renderBattle=function(submenu=null,...args){
 const previous=combatHud65.submenu;combatHud65.submenu=submenu;document.body.classList.toggle('combat-ui65',!!battle);
 if(battle)ensureWeaknessState65();const r=combatUiBefore65(submenu,...args);if(!battle)return r;
 updatePartyCards36('battle-party');decorateCommands65();document.body.dataset.combatState65=battle.status;
 $('#battle-command').classList.toggle('skills-panel65',submenu==='skills');
 if(previous!==submenu){const name=submenu??'commands';combatHud65.lastTransition={from:previous??'commands',to:name,region:'upper-right'};if(state.settings.motion!==false&&!matchMedia('(prefers-reduced-motion:reduce)').matches)$('#commands').animate([{opacity:0,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:160,easing:'ease-out'});}
 if(submenu===null&&!battle.pending)weakness65.preview=null;
 updateCombatFeedback65();return r;
};
const hudEndBefore65=endBattle;
endBattle=function(...args){const r=hudEndBefore65(...args);if(!battle){document.body.classList.remove('combat-ui65');delete document.body.dataset.combatState65;combatHud65.submenu=null;}return r;};
// Keep turn feedback and actor labels outside each other's rectangles.
const nearEnemyBefore65=updateEnemyBars27;
updateEnemyBars27=function(...args){const r=nearEnemyBefore65(...args);if(!battle)return r;const nodes=[...$('#world-enemy-bars27').children].filter(n=>!n.hidden),placed=[];
 const party=$('#battle-party').getBoundingClientRect();
 // Portrait phones have one free column beside the command panel. Stack
 // enemy readouts upward from the party, keeping every HP field unobscured.
 if(innerWidth<=700&&innerHeight>500){const command=$('#battle-command').getBoundingClientRect();let bottom=party.top-8;for(const n of nodes){n.style.transform='translate(-50%,0)';const a=n.getBoundingClientRect(),x=clamp(parseFloat(n.style.left),a.width/2+8,Math.max(a.width/2+8,command.left-a.width/2-8));n.style.left=x+'px';n.style.top=Math.max(74,bottom-a.height)+'px';bottom-=a.height+5;}return r;}
 for(const n of nodes){n.style.transform='translate(-50%,0)';const a=n.getBoundingClientRect();let x=clamp(parseFloat(n.style.left),a.width/2+6,innerWidth-a.width/2-6);const limit=x+a.width/2>party.left&&x-a.width/2<party.right?Math.min(innerHeight-a.height-12,party.top-a.height-7):innerHeight-a.height-12;let y=clamp(parseFloat(n.style.top),76,Math.max(76,limit));
  for(const q of placed)if(Math.abs(x-q.x)<(a.width+q.w)/2+6&&y<q.y+q.h+6&&y+a.height>q.y-6){const shifted=q.x+(x<q.x?-1:1)*((a.width+q.w)/2+7);if(shifted>a.width/2+6&&shifted<innerWidth-a.width/2-6&&Math.abs(shifted-x)<80)x=shifted;else y=q.y+q.h+6<=limit?q.y+q.h+6:q.y-a.height-6;}
  y=clamp(y,76,Math.max(76,limit));n.style.left=x+'px';n.style.top=y+'px';placed.push({x,y,w:a.width,h:a.height});
 }return r;
};
const hudTickBefore65=tick;
tick=function(...args){if($('#combat-legend65')){updateCombatFeedback65();return;}return hudTickBefore65(...args);};
const previewTargetBefore65=combatTargetActor;
combatTargetActor=function(...args){const submenu=combatHud65.submenu,preview=weakness65.preview,result=previewTargetBefore65(...args);if(battle?.status==='choose'&&['skills','items'].includes(submenu)){renderBattle(submenu);weakness65.preview=preview;updateCombatFeedback65();}return result;};
const affinityMenuBefore65=renderMenu;
renderMenu=function(...args){const r=affinityMenuBefore65(...args);if(!menu)return r;const id=menu.selected;
 if(['party','abilities'].includes(menu.tab)){
  const nodes=menu.tab==='party'?$$('#menu-content .ability-icon26'):$$('#menu-content article.item-row').filter(n=>n.querySelector('.quantity')?.textContent.includes('MP')).map(n=>n.querySelector('.item-icon'));
  nodes.forEach((n,i)=>{if(n&&CAST[id]?.skill[i]){n.innerHTML=icon65(skillType65(id,i),32);n.title=skillType65(id,i);}});
 }
 return r;
};
