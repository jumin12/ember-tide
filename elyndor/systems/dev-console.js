// In-game, session-gated test tools. Test journeys never write normal records.
const devConsole60={unlocked:false,open:false,active:false,running:false,tab:'battle',status:'Ready',error:'',original:null,root:null,titleStopped:false,minutes:1050,hold:true,weather:'clear',location:'poi:brookstead',region:'brookstead',spawn:'court',stage:'waterfall',shot:'',motion:'full',party:5,phase:'day'};
const DEV_TIMES60=[[300,'05:00 · Before sunrise'],[390,'06:30 · Dawn'],[540,'09:00 · Morning'],[720,'12:00 · Noon'],[960,'16:00 · Afternoon'],[1050,'17:30 · Golden hour'],[1110,'18:30 · Dusk'],[1380,'23:00 · Moonlight']];
function devClock60(n){n=(Math.round(n)%1440+1440)%1440;return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function devOptions60(entries,value){return entries.map(([key,label])=>'<option value="'+esc(String(key))+'"'+(String(key)===String(value)?' selected':'')+'>'+esc(label)+'</option>').join('');}
function devLocations60(value){return '<option value="current"'+(value==='current'?' selected':'')+'>Current scene</option><option value="overworld"'+(value==='overworld'?' selected':'')+'>Valenne · Overworld</option><optgroup label="Towns and points of interest">'+devOptions60(Object.entries(POIS).map(([key,p])=>['poi:'+key,p.name]),value)+'</optgroup><optgroup label="Interiors">'+devOptions60(Object.entries(INTERIORS).filter(([key])=>SCENES[key]).map(([key,p])=>['room:'+key,p.name]),value)+'</optgroup>';}
function devSelect60(id,label,options){return '<label for="dev60-'+id+'">'+label+'<select id="dev60-'+id+'" data-dev-field="'+id+'">'+options+'</select></label>';}
function ensureDevConsole60(){
 const q=devConsole60;if(q.root)return q.root;const root=document.createElement('div');root.id='dev-console60';root.dataset.devConsole60='';root.hidden=true;document.body.append(root);q.root=root;return root;
}
function syncDevToolbar60(){
 syncDevMobile62();
 const q=devConsole60,panel=q.root?.querySelector('.dev-panel60'),visible=q.unlocked&&q.open&&!!panel;
 document.body.toggleAttribute('data-dev-toolbar60',visible);document.documentElement.style.setProperty('--dev-toolbar-height60',visible?Math.ceil(panel.getBoundingClientRect().height)+'px':'0px');
 q.toolbarObserver??=new ResizeObserver(()=>{const n=q.root?.querySelector('.dev-panel60');document.documentElement.style.setProperty('--dev-toolbar-height60',q.unlocked&&q.open&&n?Math.ceil(n.getBoundingClientRect().height)+'px':'0px');});q.toolbarObserver.disconnect();if(visible)q.toolbarObserver.observe(panel);
}
function syncDevMobile62(){
 const viewport=window.visualViewport;document.documentElement.style.setProperty('--dev-visible-height62',(viewport?.height??innerHeight)+'px');document.documentElement.style.setProperty('--dev-visible-top62',(viewport?.offsetTop??0)+'px');
 const panel=devConsole60.root?.querySelector('.dev-panel60');if(!panel)return;
 const compact=matchMedia('(max-width:750px), (max-width:900px) and (max-height:550px), (pointer:coarse) and (max-width:1100px), (pointer:coarse) and (max-height:820px)').matches,body=panel.querySelector('.dev-body60'),actions=panel.querySelector('.dev-actions60');let dock=panel.querySelector('.dev-mobile-actions62');
 devConsole60.root.querySelector('.dev-badge60')?.setAttribute('aria-label','Open dev console');
 panel.classList.toggle('dev-mobile62',compact);
 if(compact&&actions){if(!dock){dock=document.createElement('div');dock.className='dev-mobile-actions62';dock.setAttribute('role','group');dock.setAttribute('aria-label','Tester actions');panel.append(dock);}if(actions.parentElement!==dock)dock.append(actions);}
 else if(dock){if(actions)body.append(actions);dock.remove();}
 for(const button of panel.querySelectorAll('.dev-footer60 button')){const action=button.dataset.devAction,full={hide:'Hide ↑',end:'End test session',lock:'Lock & close'}[action];button.textContent=compact?{hide:'Hide ↑',end:'End test',lock:'Lock'}[action]:full;button.setAttribute('aria-label',full);}
}
window.addEventListener('resize',syncDevToolbar60);
window.visualViewport?.addEventListener('resize',syncDevToolbar60);
window.visualViewport?.addEventListener('scroll',syncDevToolbar60);
function renderDevConsole60(){
 const q=devConsole60,root=ensureDevConsole60();root.hidden=!q.open&&!q.unlocked;
 if(!q.unlocked){syncDevToolbar60();root.dataset.mode='auth';root.innerHTML='<div class="dev-scrim60" data-dev-action="cancel"></div><section class="dev-auth60" role="dialog" aria-modal="true" aria-labelledby="dev60-auth-title"><p class="dev-kicker60">A HIDDEN CORNER OF ELYNDOR</p><h2 id="dev60-auth-title">You found the dev console.</h2><p>Enter the developer password to unlock the battle, lighting and scene testers.</p><form id="dev60-auth"><label for="dev60-password">Password</label><input id="dev60-password" type="password" inputmode="numeric" autocomplete="off" maxlength="32" aria-describedby="dev60-auth-error"><p id="dev60-auth-error" class="dev-error60" role="alert"></p><div class="dev-actions60"><button type="button" data-dev-action="cancel">Cancel</button><button type="submit" class="dev-primary60" data-dev-action="unlock">Unlock console</button></div></form></section>';return;}
 root.dataset.mode='tools';
 const select=(id,label,list,value)=>devSelect60(id,label,devOptions60(list,value));
 let body='';
 if(q.tab==='battle')body='<p class="dev-description60">Play real encounters, compare the paired scenery and replay the opening camera.</p>'+select('stage','Battle environment',Object.entries(BATTLE_STAGES53).map(([id,s])=>[id,s.name]),q.stage)+'<div class="dev-grid60">'+select('phase','Battle lighting',[['day','Daylight'],['night','Moonlight']],q.phase)+select('party','Party size',[[2,'Bren & Soren'],[5,'Full party · 5']],q.party)+'</div>'+select('shot','Camera opener',[['','Varied opener'],...Object.entries(BATTLE_INTRO_SHOTS58).map(([id,s])=>[id,s.name])],q.shot)+select('motion','Camera motion',[['full','Full cinematic'],['reduced','Reduced movement'],['off','Off']],q.motion)+'<div class="dev-actions60"><button data-dev-action="battle" class="dev-primary60">Start / replay battle</button><button data-dev-action="leave"'+(!battle?' disabled':'')+'>Leave battle</button></div><p class="dev-hint60">Use Hide for an unobstructed view; the console tab stays at the top.</p>';
 if(q.tab==='lighting')body='<p class="dev-description60">Compare time-of-day lighting in the overworld, POIs and interiors.</p>'+devSelect60('location','Test location',devLocations60(q.location))+select('region','Overworld region',Object.entries(POIS).map(([id,p])=>[id,p.name]),q.region)+select('preset','Time preset',[['custom','Custom time'],...DEV_TIMES60],DEV_TIMES60.some(([n])=>n===q.minutes)?q.minutes:'custom')+'<div class="dev-grid60"><label for="dev60-clock">Exact time<input id="dev60-clock" type="time" data-dev-field="clock" value="'+devClock60(q.minutes)+'"></label>'+select('weather','Weather',[['clear','Clear skies'],['cloudy','Cloud cover'],['rain','Rain']],q.weather)+'</div><label class="dev-check60"><input id="dev60-hold" type="checkbox" data-dev-field="hold"'+(q.hold?' checked':'')+'>Hold selected time</label><div class="dev-actions60"><button data-dev-action="lighting" class="dev-primary60">Apply lighting</button></div>';
 if(q.tab==='scenes')body='<p class="dev-description60">Visit every POI and interior, or inspect the continent around a destination.</p>'+devSelect60('location','Scene / POI',devLocations60(q.location))+select('region','Overworld focus',Object.entries(POIS).map(([id,p])=>[id,p.name]),q.region)+select('spawn','Arrival point',[['entrance','Entrance'],['court','Main court']],q.spawn)+'<div class="dev-actions60"><button data-dev-action="scene" class="dev-primary60">Load scene</button><button data-dev-action="restore">Restore party</button></div><p class="dev-hint60">Movement, interactions, menus and battles remain playable while the panel is hidden.</p>';
 root.innerHTML='<button class="dev-badge60" data-dev-action="show" data-dev-busy-ok'+(q.open?' hidden':'')+'>◇ Dev console'+(q.active?' · TEST':'')+'</button><section class="dev-panel60" role="dialog" aria-modal="false" aria-labelledby="dev60-title"'+(!q.open?' hidden':'')+'><div class="dev-topline60"><header class="dev-header60"><div><p class="dev-kicker60">DEVELOPER TOOLS</p><h2 id="dev60-title">Dev console</h2></div></header><p class="dev-session60">'+(q.active?'TEST SESSION · Progress is not saved':'Choose a tester to start a temporary journey.')+'</p><nav class="dev-tabs60" role="tablist" aria-label="Test tools">'+[['battle','Battle'],['lighting','Day & night'],['scenes','Scenes / POIs']].map(([id,label])=>'<button role="tab" data-dev-action="tab" data-dev-tab="'+id+'" aria-selected="'+(q.tab===id)+'">'+label+'</button>').join('')+'</nav><p class="dev-status60'+(q.error?' dev-error60':'')+'" role="status" aria-live="polite">'+esc(q.error||q.status)+'</p><footer class="dev-footer60"><button data-dev-action="hide" data-dev-busy-ok aria-label="Hide dev console">Hide ↑</button><button data-dev-action="end"'+(!q.active?' hidden':'')+'>End test session</button><button data-dev-action="lock">Lock & close</button></footer></div><div class="dev-body60" role="tabpanel">'+body+'</div></section>';
 for(const n of root.querySelectorAll('button,select,input'))if(q.running&&!n.hasAttribute('data-dev-busy-ok'))n.disabled=true;
 const region=root.querySelector('#dev60-region');if(region)region.disabled=q.running||q.location!=='overworld';
 const leave=root.querySelector('[data-dev-action="leave"]');if(leave)leave.disabled=q.running||!battle;syncDevToolbar60();
}
function openDevConsole60(){
 const q=devConsole60;if(!q.open&&!q.active){q.titleStopped=title19.stopped;title19.stopped=true;}
 keys.clear();if(typeof releaseTouch33==='function')releaseTouch33();q.open=true;q.error='';renderDevConsole60();queueMicrotask(()=>$(q.unlocked?'#dev-console60 [role=tab]':'#dev60-password')?.focus());
}
function hideDevConsole60(){const q=devConsole60;q.open=false;if(!q.active)title19.stopped=q.titleStopped;renderDevConsole60();keys.clear();if(typeof releaseTouch33==='function')releaseTouch33();document.activeElement?.blur();resetSimulation();}
function unlockDevConsole60(){const q=devConsole60;if(q.unlocked)return;const input=$('#dev60-password');if(input?.value!=='123'){const error=$('#dev60-auth-error');if(error)error.textContent='That password is not correct. Try again.';if(input){input.value='';input.setAttribute('aria-invalid','true');input.focus();}return;}input.value='';q.unlocked=true;q.status='Unlocked · Choose a tester';q.error='';renderDevConsole60();$('#dev-console60 [role=tab]')?.focus();}
async function devWait60(test){const deadline=performance.now()+180000;while(!test()){if(performance.now()>deadline)throw Error('The scene took too long to prepare. End the test session and try again.');await new Promise(resolve=>setTimeout(resolve,30));}}
function clearDevTransient60(){
 if(typeof cancelCampaignEvents==='function')cancelCampaignEvents();closeMenu();dialogue=eventAction=transition=restoration=null;keys.clear();route=null;
 for(const id of['dialogue','battle-results'])$('#'+id)?.classList.add('hidden');$('#toast')?.classList.remove('show');$('#scene-transition')?.classList.remove('show');$('#letterbox')?.classList.remove('active');stopRecordedVoice(true);
}
async function startDevSession60(){
 const q=devConsole60;if(!q.unlocked)throw Error('Unlock the dev console first.');if(q.active)return;
 title19.stopped=true;if(title19.task)await title19.task;await devWait60(()=>!gameLoading&&!sceneSwitchPending&&!poiFade.active);
 if(battle||dialogue||eventAction||restoration||transition||campaignEvents.active)throw Error('Finish the current battle, conversation or event before starting a test session.');
 q.original={state,copy:JSON.parse(JSON.stringify(state)),scene:state.scene,point:player?[player.x,player.z]:null,title:{scene:title19.scene,focus:title19.focus?[...title19.focus]:null,age:title19.age,index:title19.index,bag:[...title19.bag],tab:title19.tab},titleVisible:!$('#title').classList.contains('hidden'),pending:saveManager.pending};
 q.active=true;saveManager.pending=false;await startJourney();await devWait60(()=>!gameLoading&&!sceneSwitchPending&&!poiFade.active);clearDevTransient60();
 state.mode='explore';state.flags.prologue_complete=state.flags.combat_tutorial_complete=true;state.beat=BEATS.findIndex(b=>b[0]==='travelFern');state.encounterDistance=-1e9;state.trackedQuest=null;state.trackedPoi=null;tutorialState16().hidden=mentorState17().hidden=true;updateGuide16();
 state.members=['bren','soren','tavin','mira','lysa'];for(const id of state.members){state.characters[id].level=3;state.flags[id+'_awakened']=true;}setupParty([player.x,player.z]);restoreParty();updateHUD();resetSimulation();
}
async function leaveDevBattle60(){
 await devWait60(()=>encounter53.phase==='idle');if(battle){endBattle('fled');await devWait60(()=>!battle&&encounter53.phase==='idle');}clearDevTransient60();if(devConsole60.active)state.mode='explore';
}
function applyDevLighting60(){
 const q=devConsole60;state.worldMinutes=q.minutes;state.settings.weather=q.weather;weather.rain.value=weather.snow.value=weather.wet.value=0;weather.cloud.value=q.weather==='clear'?.18:.8;if(q.weather==='rain'){weather.rain.value=.8;weather.wet.value=.5;}
 for(let i=0;i<100;i++)updateLighting();for(const a of actors)updateActor(a,0);updateCamera(1,true);updateHUD();updateRenderBudget(true);render();resetSimulation();
}
async function devGoScene60(force=false){
 const q=devConsole60;if(q.location==='current')return;
 const matches=q.location==='overworld'?activeScene?.kind==='overworld'&&q.loadedRegion===q.region:q.location.startsWith('poi:')?activeScene?.kind==='poi'&&activeScene.key===q.location.slice(4):activeScene?.kind==='interior'&&activeScene.key===q.location.slice(5);
 if(!force&&q.loadedLocation===q.location&&matches)return;
 if(q.location==='overworld'){
  const p=POIS[q.region];if(!p)throw Error('Choose a valid overworld region.');if(activeScene?.kind!=='overworld'||force){await changeJourneyScene('overworld',[p.node[0],p.node[1]+16]);await devWait60(()=>!gameLoading&&!sceneSwitchPending&&!poiFade.active);}
  const point=safePoint({x:p.node[0],z:p.node[1]+16},actorRadius(player)+.1);setupParty([point.x,point.z]);q.loadedRegion=q.region;
 }else if(q.location.startsWith('poi:')){
  const key=q.location.slice(4),p=POIS[key];if(!p)throw Error('Choose a valid point of interest.');await changeJourneyScene(p.id,p.spawn);await devWait60(()=>!gameLoading&&!sceneSwitchPending&&!poiFade.active);
  if(q.spawn==='court'){const a=JRPG_LAYOUTS46[key]?.courts?.[0],point=key==='brookstead'?safePoint({x:-121,z:106}):a?safePoint({x:a[0],z:a[1]+9}):null;if(point)setupParty([point.x,point.z]);}
 }else if(q.location.startsWith('room:')){
  const key=q.location.slice(5),room=INTERIORS[key];if(!room||!SCENES[key])throw Error('Choose a valid interior.');const poi=POIS[room.poi];state.interiorReturn={id:poi.id,poi:room.poi,spawn:[...poi.spawn]};await changeJourneyScene(key,[0,5]);await devWait60(()=>!gameLoading&&!sceneSwitchPending&&!poiFade.active);
 }else throw Error('Choose a valid test location.');
 clearDevTransient60();state.mode='explore';state.encounterDistance=-1e9;
 q.loadedLocation=q.location;
}
async function endDevSession60(){
 const q=devConsole60;if(!q.active)return;await leaveDevBattle60();const original=q.original;if(!original)return;
 title19.stopped=true;clearDevTransient60();state=original.state;
 // World construction can initialise journey fields; restore the untouched
 // record after rebuilding the view, before ordinary persistence resumes.
 buildWorld(original.scene,original.point);await prepareGameplayGraphics();for(const key of Object.keys(state))delete state[key];Object.assign(state,JSON.parse(JSON.stringify(original.copy)));Object.assign(title19,original.title);title19.stopped=q.open?true:q.titleStopped;
 $('#title').classList.toggle('hidden',!original.titleVisible);$('#hud').classList.toggle('hidden',original.titleVisible);if(original.titleVisible)hideTitleParty19();renderTitlePanel19();updateLighting();updateCamera(1,true);updateHUD();render();saveManager.pending=original.pending;q.active=false;q.original=null;q.loadedLocation=null;q.loadedRegion=null;q.status='Test session ended · Journey restored';resetSimulation();
}
async function runDevAction60(action){
 const q=devConsole60;if(!q.unlocked||q.running)return;q.running=true;q.error='';q.status=action==='end'||action==='lock'?'Restoring journey…':'Preparing test…';renderDevConsole60();
 try{
  if(action==='end'||action==='lock'){await endDevSession60();if(action==='lock'){q.unlocked=false;q.open=false;title19.stopped=q.titleStopped;}}
  else{
   await startDevSession60();
   if(action==='battle'){
    await leaveDevBattle60();const ids=q.party===2?['bren','soren']:['bren','soren','tavin','mira','lysa'];if(state.members.join(',')!==ids.join(',')){state.members=ids;setupParty([player.x,player.z]);}restoreParty();for(const id of state.members)state.characters[id].charge=100;
    q.minutes=q.phase==='night'?1380:900;applyDevLighting60();state.settings.battleIntro=q.motion;encounter53.nextStage53=q.stage;battleIntro58.nextShot=q.shot||null;beginBattle('random');renderDevConsole60();await devWait60(()=>!!battle&&encounter53.phase==='idle'&&!introLocked58());q.status='Battle ready · '+BATTLE_STAGES53[q.stage].name;
   }else if(action==='leave'){await leaveDevBattle60();applyDevLighting60();q.status='Returned from battle';}
   else if(action==='restore'){restoreParty();updateHUD();q.status='Party restored';}
   else{await leaveDevBattle60();await devGoScene60(action==='scene');applyDevLighting60();q.status=(action==='lighting'?'Lighting ready · '+devClock60(q.minutes):'Scene ready · '+(INTERIORS[activeScene.key]?.name??POIS[activeScene.key]?.name??'Valenne'));}
  }
 }catch(error){q.error=error.message;q.open=true;}finally{q.running=false;renderDevConsole60();}
}
function changeDevField60(input){
 const q=devConsole60,key=input.dataset.devField,value=input.value;
 if(['stage','shot','motion','phase','weather','region','spawn','location'].includes(key))q[key]=value;
 else if(key==='party')q.party=+value===2?2:5;
 else if(key==='hold')q.hold=input.checked;
 else if(key==='preset'&&value!=='custom')q.minutes=clamp(Number(value)||0,0,1439);
 else if(key==='clock'&&/^\d\d:\d\d$/.test(value))q.minutes=clamp(+value.slice(0,2)*60+(+value.slice(3)),0,1439);
 if(key==='preset')$('#dev60-clock').value=devClock60(q.minutes);
 if(key==='clock'){const preset=$('#dev60-preset');if(preset)preset.value=DEV_TIMES60.some(([n])=>n===q.minutes)?String(q.minutes):'custom';}
 const region=$('#dev60-region');if(region)region.disabled=q.running||q.location!=='overworld';
 if(key==='hold'&&q.active&&q.hold)state.worldMinutes=q.minutes;
}
// Capture console controls before the game's document-level shortcuts. Native
// input/editing/selection defaults remain available to the actual controls.
function devInput60(event){
 const q=devConsole60,inside=event.target instanceof Element?event.target.closest('[data-dev-console60]'):null;
 if(!inside&&!(q.open&&!q.unlocked))return;
 event.stopImmediatePropagation();
 if(event.type==='keydown'){
  if(event.key==='Escape'){event.preventDefault();hideDevConsole60();return;}
  if(q.open&&!q.unlocked&&event.key==='Tab'){event.preventDefault();const list=[...q.root.querySelectorAll('input,button')],i=list.indexOf(document.activeElement);list[(i+(event.shiftKey?-1:1)+list.length)%list.length].focus();return;}
  if(event.key==='Enter'&&event.target.id==='dev60-password'){event.preventDefault();unlockDevConsole60();return;}
  if(!inside)event.preventDefault();return;
 }
 if(event.type==='submit'){event.preventDefault();unlockDevConsole60();return;}
 if(event.type==='input'||event.type==='change'){if(q.unlocked&&event.target.dataset.devField)changeDevField60(event.target);return;}
 if(event.type!=='click')return;
 const button=event.target.closest('[data-dev-action]');if(!button||button.disabled)return;event.preventDefault();const action=button.dataset.devAction;
 if(action==='discover'||action==='show')return openDevConsole60();if(action==='cancel'||action==='hide')return hideDevConsole60();if(action==='unlock')return unlockDevConsole60();
 if(action==='tab'){q.tab=button.dataset.devTab;renderDevConsole60();return;}runDevAction60(action);
}
for(const type of['keydown','keyup','pointerdown','pointerup','pointermove','pointerover','click','dblclick','wheel','touchstart','touchmove','touchend','touchcancel','input','change','submit'])window.addEventListener(type,devInput60,{capture:true,passive:false});
const devTitleBefore60=renderTitlePanel19;renderTitlePanel19=function(...args){const r=devTitleBefore60(...args),footer=$('#title-right19>footer');if(title19.tab==='news'&&footer&&!footer.querySelector('.dev-rune60')){const b=document.createElement('button');b.className='dev-rune60';b.dataset.devConsole60='';b.dataset.devAction='discover';b.setAttribute('aria-label','Inspect the small diamond');b.title='An unusual little mark';b.innerHTML='<img src="'+assets.images.ui50_diamond+'" alt="">';footer.append(b);}return r;};
const devTickBefore60=tick;tick=function(dt){const q=devConsole60;if(q.open&&!q.unlocked)return;if(q.active&&q.hold)state.worldMinutes=q.minutes;const r=devTickBefore60(dt);if(q.active&&q.hold)state.worldMinutes=q.minutes;return r;};
const devSceneEnteredBefore60=onSceneEntered;onSceneEntered=function(...args){if(!devConsole60.active)return devSceneEnteredBefore60(...args);};
// Guard every normal record/settings write for the lifetime of a test journey.
const devSaveBefore60=saveSlot,devAutoBefore60=autoSave,devFlushBefore60=flushJourneyCheckpoint,devWriteBefore60=writeJourneyRecord,devSettingsBefore60=saveSettings,devRemoveBefore60=removeSave19,devImportBefore60=importJourneySave,devLoadBefore60=loadSlot;
saveSlot=function(...args){return devConsole60.active?false:devSaveBefore60(...args);};autoSave=function(...args){if(!devConsole60.active)return devAutoBefore60(...args);};flushJourneyCheckpoint=function(...args){if(!devConsole60.active)return devFlushBefore60(...args);};writeJourneyRecord=function(...args){return devConsole60.active?false:devWriteBefore60(...args);};saveSettings=function(...args){if(!devConsole60.active)return devSettingsBefore60(...args);};removeSave19=function(...args){return devConsole60.active?false:devRemoveBefore60(...args);};importJourneySave=function(...args){if(!devConsole60.active)return devImportBefore60(...args);};loadSlot=function(...args){if(devConsole60.active){toast('End the test session before loading a journey.');return false;}return devLoadBefore60(...args);};
const devBootBefore60=boot;boot=async function(...args){const r=await devBootBefore60(...args);ensureDevConsole60();renderTitlePanel19();const previous=window.render_game_to_text;window.render_game_to_text=()=>{const data=JSON.parse(previous()),q=devConsole60;data.devConsole={unlocked:q.unlocked,open:q.open,testSession:q.active,busy:q.running,tab:q.tab,status:q.error||q.status,timeHeld:q.active&&q.hold,time:devClock60(state.worldMinutes)};return JSON.stringify(data);};return r;};
