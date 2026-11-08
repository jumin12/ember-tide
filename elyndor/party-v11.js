// Recruitment reconciles the party in place. Existing people and GPU resources
// survive a new companion joining; a story split still changes the roster.
const partyRosterStats={reconciliations:0,retained:0,created:0,removed:0};
const MAX_ACTIVE_PARTY96=4;
function normalizeParty96(s=state){
 const ids=[...new Set(s.members??[])].filter(id=>CAST[id]);if(!ids.length)ids.push('bren');
 const reserves=[...new Set([...(Array.isArray(s.reserveMembers)?s.reserveMembers:[]),...ids.slice(MAX_ACTIVE_PARTY96)])].filter(id=>CAST[id]&&!ids.slice(0,MAX_ACTIVE_PARTY96).includes(id)&&!(id==='soren'&&s.flags?.soren_departed&&!ids.includes(id)));
 s.members=ids.slice(0,MAX_ACTIVE_PARTY96);s.reserveMembers=reserves;return s.members;
}
function partyRosterMarkup96(){
 const reserves=state.reserveMembers??[];
 return '<section class="party-roster96"><header><b>Active party · '+state.members.length+' / '+MAX_ACTIVE_PARTY96+'</b><span>Up to four companions travel and fight together.</span></header>'+reserves.map(id=>'<div class="party-reserve96"><img src="'+face26(id)+'" alt=""><b>'+esc(CAST[id].name)+' <small>Reserve</small></b><label>Replace <select data-party-out96="'+id+'">'+state.members.map(key=>'<option value="'+key+'"'+(key==='bren'&&!devConsole60.active?' disabled':'')+(menu.partyOut96===key||!menu.partyOut96&&key===state.members[1]?' selected':'')+'>'+esc(CAST[key].name)+'</option>').join('')+'</select></label><button type="button" data-party-swap96="'+id+'">Join active party</button></div>').join('')+'</section>';
}
function swapReserve96(incoming,outgoing){
 if(battle||eventAction||dialogue||gameLoading||sceneSwitchPending||poiFade.active||!state.reserveMembers?.includes(incoming)||!state.members.includes(outgoing)||outgoing==='bren'&&!devConsole60.active)return false;
 const i=state.members.indexOf(outgoing);state.members[i]=incoming;state.reserveMembers=state.reserveMembers.map(id=>id===incoming?outgoing:id);normalizeParty96();setupParty([player.x,player.z]);if(menu){menu.selected=incoming;delete menu.partyOut96;renderMenu();}return true;
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-party-swap96]');if(!button)return;const id=button.dataset.partySwap96,select=button.parentElement.querySelector('[data-party-out96]');swapReserve96(id,select.value);});
document.addEventListener('change',e=>{if(menu&&e.target.matches('[data-party-out96]'))menu.partyOut96=e.target.value;});
function releasePartyActor(a){
 a.mesh.removeFromParent();a.shadow.removeFromParent();actors=actors.filter(q=>q!==a);
 a.mesh.material.map?.dispose();a.mesh.material.dispose();a.mesh.geometry.dispose();
 a.shadow.material.dispose();if(a.shadow.geometry!==a.mesh.geometry)a.shadow.geometry.dispose();
 partyRosterStats.removed++;
}
setupParty=function(point){
 const ids=normalizeParty96().filter(id=>assets.sprites[id]);if(!ids.length)ids.push('bren');state.members=ids;
 const old=[player,...followers].filter(a=>a&&actors.includes(a)&&a.mesh.parent===world),identity=a=>a.characterId??a.id.replace('Ascended','');
 const anchor=safePoint({x:point[0],z:point[1]},.52),keepTrail=old[0]&&identity(old[0])===ids[0]&&dist(old[0],anchor)<.6&&trail?.length>1;
 const next=ids.map((id,i)=>{
  let a=old.find(a=>identity(a)===id);
  if(a){partyRosterStats.retained++;if(!keepTrail){a.x=anchor.x;a.z=anchor.z;}}
  else{const p=keepTrail?trailPoint(i*1.5):anchor;a=createActor(id,p.x,p.z,2.15);partyRosterStats.created++;}
  a.party=true;a.characterId=id;a.enemy=false;a.npc=false;a.mesh.visible=true;a.shadow.visible=true;
  if(a.visualId!==id&&a.id!==id)replaceActorArt(a,id);
  a.action='idle';a.speed=0;a.flinchUntil=0;a.hitFlash=0;a.route=null;a.phase??=0;return a;
 });
 for(const a of old)if(!next.includes(a))releasePartyActor(a);
 player=next[0];followers=next.slice(1);if(!keepTrail)spawnPartyTrail([anchor.x,anchor.z]);
 for(const a of next){updateActor(a,0);a.mesh.updateMatrixWorld(true);a.shadow.updateMatrixWorld(true);}
 partyRosterStats.reconciliations++;route=null;syncStoryWorld();updateHUD();
};
