// Fast travel uses actual discovered locations and the existing scene loader.
const journeyTravel15={trips:0,last:null,pending:false};
function fastTravelKey95(id){return Object.keys(POIS).find(key=>key===id||POIS[key].id===id||POIS[key].aliases.includes(id))??null;}
function canFastTravel15(id){const key=fastTravelKey95(id),p=POIS[key];if(!p||!atlasKnown(p))return'Explore this destination first.';if(scenePlan(p.id).key!==key)return'This destination is not available.';if(key==='snow'&&!['snow','complete'].includes(currentBeat()[0]))return'The northern assignment has not opened this pass.';if(battle||dialogue||eventAction||restoration||gameLoading||sceneSwitchPending||poiFade.active)return'Finish the current encounter or event first.';return null;}
async function fastTravel15(id){
 const key=fastTravelKey95(id),reason=canFastTravel15(key);if(reason){toast(reason);return false;}if(journeyTravel15.pending)return false;
 // Capture the chosen destination before closing either map entry point.
 // Closing an Esc-menu submenu normally returns to the title-style pause;
 // travel must resume that live journey instead of leaving the title tour up.
 const p=POIS[key],destination={key,id:p.id,spawn:[...p.spawn],name:p.name,node:[...p.node]},from=atlasJourneyPoint(),minutes=Math.max(6,Math.round(Math.hypot(from.x-p.node[0],from.z-p.node[1])/9));
 journeyTravel15.pending=true;if(mainPause70.open)resumeMainPause70();else closeMenu();keys.clear();route=null;playSound('travel',.5);
 try{
  state.trackedPoi=null;const result=await changeJourneyScene(destination.id,destination.spawn);
  if(!result||activeScene?.kind!=='poi'||activeScene.key!==destination.key){toast('Could not reach '+destination.name+'. Please choose the destination again.');return false;}
  state.worldMinutes+=minutes;if(!state.visited.includes(destination.id))state.visited.push(destination.id);state.overworldPosition=[destination.node[0],destination.node[1]+12];
  journeyTravel15.trips++;journeyTravel15.last={key:destination.key,scene:state.scene,poi:activeScene.key,minutes};updateLighting();autoSave();toast(destination.name+' · '+minutes+' minutes along the road');return true;
 }finally{journeyTravel15.pending=false;}
}
const renderAtlasBeforeTravel15=renderAtlasMenu;
renderAtlasMenu=function(el){renderAtlasBeforeTravel15(el);const track=$('#atlas-track');if(!track)return;const actions=document.createElement('div');actions.className='atlas-actions';track.replaceWith(actions);actions.append(track);const travel=document.createElement('button');travel.id='atlas-travel';travel.textContent='Fast travel ↗';travel.title='Travel to a discovered destination';actions.append(travel);const select=document.createElement('select');select.id='atlas-destination';select.setAttribute('aria-label','Discovered destinations');select.innerHTML='<option value="">Choose a discovered destination</option>'+Object.entries(POIS).filter(([,p])=>atlasKnown(p)).map(([key,p])=>`<option value="${key}">${esc(p.name)}</option>`).join('');$('.atlas3d-buttons').prepend(select);const update=()=>{const key=atlas3d.selected,reason=key?canFastTravel15(key):'Choose a discovered destination.';travel.disabled=!!reason;travel.title=reason??('Travel to '+POIS[key].name);select.value=key??'';if(key){const p=POIS[key],services=p.services?.length?' · '+p.services.join(' · '):'';$('#atlas-description').textContent=p.description+services;}};for(const pin of $$('.atlas-pin'))pin.addEventListener('click',update);select.onchange=()=>{const pin=$('.atlas-pin[data-location="'+select.value+'"]');if(pin)pin.click();};travel.onclick=()=>fastTravel15(atlas3d.selected);update();};
