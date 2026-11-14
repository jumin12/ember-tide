// Session unlock is shared by the title widget and the in-game shortcut.
const devWorkbench144={taps:[],item:'herb',search:'',quantity:'1',gold:'1000',actor:'bren',guided:true,practice:null};
window.addEventListener('keydown',e=>{
 if(e.repeat||e.ctrlKey||e.altKey||e.metaKey||!(e.code==='Backquote'||e.key==='`'))return;
 if(e.target instanceof Element&&e.target.closest('input,textarea,select,[contenteditable=true]'))return;
 if(typeof homeTransit144!=='undefined'&&homeTransit144)return;
 e.preventDefault();e.stopImmediatePropagation();const now=performance.now(),q=devWorkbench144;q.taps=q.taps.filter(t=>now-t<1800);q.taps.push(now);
 if(q.taps.length===3){q.taps=[];route=null;openDevConsole60();}
},true);
function devCheatReady144(){return !!player&&(devConsole60.active||$('#title').classList.contains('hidden'))&&!gameLoading&&!sceneSwitchPending;}
function devItemRows144(){const term=devWorkbench144.search.trim().toLowerCase();return Object.entries(ITEMS).filter(([id,v])=>!term||(id+' '+v.name+' '+(v.type??v.category??'')).toLowerCase().includes(term)).sort((a,b)=>a[1].name.localeCompare(b[1].name));}
function devItemInfo144(){const q=devWorkbench144,v=ITEMS[q.item];return v?'<strong>'+esc(v.name)+'</strong><span>'+esc(v.type??v.category??'Item')+' · Owned '+(state.items[q.item]??0).toLocaleString()+'</span><p>'+esc(v.desc??'')+'</p>':'<p>No matching items.</p>';}
function devItemOptions144(){const q=devWorkbench144,rows=devItemRows144();if(!rows.some(([id])=>id===q.item))q.item=rows[0]?.[0]??'';return rows.map(([id,v])=>'<option value="'+esc(id)+'"'+(id===q.item?' selected':'')+'>'+esc(v.name)+' · '+(v.type??v.category??'Item')+'</option>').join('');}
function renderDevCheats144(){const q=devWorkbench144,ready=devCheatReady144(),options=devItemOptions144();return '<div class="dev-cheat-heading144"><span>INVENTORY WORKBENCH</span><h3>Items & gold</h3><p>'+(devConsole60.active?'Temporary test journey · Saved journeys stay untouched.':ready?'Current journey · Added items and gold are kept with your progress.':'Start a game or a tester before adding items.')+'</p></div><section class="dev-cheat-card144"><h4>Spawn an item</h4><label>Find an item<input type="search" id="dev144-search" data-dev-field="cheatSearch144" placeholder="Name, category or item ID" value="'+esc(q.search)+'" autocomplete="off"></label><label>Item<select id="dev144-item" data-dev-field="cheatItem144">'+options+'</select></label><div id="dev144-item-info" class="dev-item-info144">'+devItemInfo144()+'</div><div class="dev-cheat-add144"><label>Quantity<input type="number" data-dev-field="cheatQuantity144" min="1" max="9999" step="1" inputmode="numeric" value="'+esc(q.quantity)+'"></label><button data-dev-action="cheat-item144" class="dev-primary60"'+(!ready||!q.item?' disabled':'')+'>Add to inventory</button></div></section><section class="dev-cheat-card144"><h4>Gold <small>'+state.gold.toLocaleString()+' owned</small></h4><label>Amount<input type="number" data-dev-field="cheatGold144" min="1" max="99999999" step="1" inputmode="numeric" value="'+esc(q.gold)+'"></label><div class="dev-gold-presets144">'+[100,1000,10000].map(n=>'<button data-dev-action="cheat-gold-'+n+'144"'+(!ready?' disabled':'')+'>+'+n.toLocaleString()+'</button>').join('')+'</div><button data-dev-action="cheat-gold144" class="dev-primary60"'+(!ready?' disabled':'')+'>Add gold</button></section>';}
function grantDevItem144(id,quantity){
 if(!devCheatReady144())throw Error('Start a journey or a tester first.');
 if(!ITEMS[id]||!Number.isSafeInteger(quantity)||quantity<1||quantity>9999)throw Error('Choose an item and a whole quantity from 1 to 9,999.');
 if((state.items[id]??0)+quantity>9999)throw Error('That would exceed the saved stack limit of 9,999. Choose a smaller quantity.');
 state.items[id]=(state.items[id]??0)+quantity;autoSave();updateHUD();if(menu)renderMenu();return ITEMS[id].name+' × '+quantity+' added to inventory.';
}
function grantDevGold144(amount){
 if(!devCheatReady144())throw Error('Start a journey or a tester first.');
 if(!Number.isSafeInteger(amount)||amount<1||amount>99999999)throw Error('Enter a whole gold amount from 1 to 99,999,999.');
 if(state.gold+amount>99999999)throw Error('That would exceed the saved balance limit of 99,999,999.');
 state.gold+=amount;autoSave();updateHUD();if(menu)renderMenu();return amount.toLocaleString()+' gold added.';
}
const devWorkbenchRenderBefore144=renderDevConsole60;
renderDevConsole60=function(...args){const r=devWorkbenchRenderBefore144(...args),q=devConsole60;if(!q.unlocked)return r;const panel=q.root.querySelector('.dev-panel60'),nav=panel.querySelector('.dev-tabs60'),body=panel.querySelector('.dev-body60');
 body.classList.toggle('dev-cheat-body144',q.tab==='cheats144');
 nav.insertAdjacentHTML('beforeend','<button role="tab" data-dev-action="tab" data-dev-tab="cheats144" aria-selected="'+(q.tab==='cheats144')+'">Items & gold</button>');
 if(q.tab==='cheats144'){body.classList.remove('dev-sprite-body87');body.innerHTML=renderDevCheats144();for(const b of nav.querySelectorAll('[data-dev-tab]'))b.setAttribute('aria-selected',b.dataset.devTab===q.tab);}
 if(q.tab==='battle')body.insertAdjacentHTML('beforeend','<section class="dev-combo-lab144"><small>CINEMATIC COMBO LAB</small><h3>Try the timed attacks</h3><p>Practice closes this panel and starts your chosen character’s turn. Match the rings with E, Space, or the on-screen Strike button.</p>'+devSelect60('comboActor144','Character',devOptions60(Object.entries(CAST).map(([id,v])=>[id,v.name]),devWorkbench144.actor))+'<label class="dev-check60"><input type="checkbox" data-dev-field="comboGuided144"'+(devWorkbench144.guided?' checked':'')+'>Wait on gold until I strike</label><div class="dev-actions60"><button class="dev-primary60" data-dev-action="combo-practice144">Practice timed combo</button><button data-dev-action="combo-replay144">Watch full combo</button>'+(devWorkbench144.practice?'<button data-dev-action="combo-stop144">Stop practice</button>':'')+'</div><p>Practice repeats after each chain. Your normal journey is restored when the test session ends.</p></section>');
 if(q.tab==='sprites'&&devSprites87.category==='party')body.insertAdjacentHTML('beforeend','<p class="dev-hint60">The sprite viewer shows source frames. Use the Battle combo lab for the full animation, timing, particles and scene lighting.</p>');
 if(q.running)for(const n of body.querySelectorAll('button,select,input'))n.disabled=true;return r;
};
const devWorkbenchFieldBefore144=changeDevField60;
changeDevField60=function(input){const q=devWorkbench144,k=input.dataset.devField;
 if(k==='cheatSearch144'){q.search=input.value;$('#dev144-item').innerHTML=devItemOptions144();$('#dev144-item-info').innerHTML=devItemInfo144();const b=$('[data-dev-action="cheat-item144"]');if(b)b.disabled=!q.item||!devCheatReady144();return;}
 if(k==='cheatItem144'){q.item=input.value;$('#dev144-item-info').innerHTML=devItemInfo144();return;}
 if(k==='cheatQuantity144'){q.quantity=input.value;return;}if(k==='cheatGold144'){q.gold=input.value;return;}
 if(k==='comboActor144'){q.actor=input.value;return;}if(k==='comboGuided144'){q.guided=input.checked;return;}
 return devWorkbenchFieldBefore144(input);
};
function resetDevCombo144(){
 const q=devWorkbench144.practice;if(!q||!battle)return;
 for(const[index,e]of battle.enemies.entries()){if(q.enemyState?.[index])Object.assign(e,structuredClone(q.enemyState[index]));e.hp=e.maxHp;e.actor.subdued=false;e.actor.mesh.visible=true;e.actor.action='enemyIdle';e.actor.hitFlash=0;}
 battle.animation=battle.pending=null;battle.queue=[q.actor];battle.turn=0;battle.status='choose';cinematic141.events=[];renderBattle();battleAction('attack');q.finishedAt=null;
}
const devWorkbenchActionBefore144=runDevAction60;
runDevAction60=async function(action){const q=devConsole60,w=devWorkbench144;if(!q.unlocked)return;
 if(action.startsWith('cheat-')){if(q.running)return;try{q.error='';q.status=action==='cheat-item144'?grantDevItem144(w.item,Number(w.quantity)):grantDevGold144(action==='cheat-gold144'?Number(w.gold):Number(action.slice(11,-3)));sfx('menu');}catch(e){q.error=e.message;}renderDevConsole60();return;}
 if(action==='combo-stop144'){w.practice=null;q.status='Combo practice stopped.';renderDevConsole60();return;}
 if(action==='combo-practice144'||action==='combo-replay144'){
  if(q.running)return;try{w.practice=null;const id=CAST[w.actor]?w.actor:'bren';
  await startDevSession60();await leaveDevBattle60();if(!['bren','soren'].includes(id))q.party=4;
  if(!state.members.includes(id)){state.members[state.members.length-1]=id;await ensureSprite116(id);setupParty([player.x,player.z]);}
  await devWorkbenchActionBefore144('battle');if(q.error||!battle)return;
  w.practice={actor:id,auto:action==='combo-replay144',guided:action==='combo-practice144'&&w.guided,finishedAt:null,chains:0,enemyState:battle.enemies.map(e=>structuredClone(Object.fromEntries(Object.entries(e).filter(([k])=>k!=='actor'))))};
  hideDevConsole60();clearBattleIntro58();battle.intro=0;resetDevCombo144();toast(action==='combo-replay144'?'Combo replay · Full effects and scene lighting':'Combo practice · E / Space / Strike on gold');return;}catch(error){q.error=error.message;q.open=true;renderDevConsole60();return;}
 }
 if(['battle','scene','lighting','leave','end','lock'].includes(action)||action.startsWith('home-'))w.practice=null;
 const r=await devWorkbenchActionBefore144(action);if(action==='battle'&&!q.error&&battle){hideDevConsole60();toast('Battle ready · Choose Attack for the timed combo');}return r;
};
const devWorkbenchChainBefore144=advanceCinematicChain141;
advanceCinematicChain141=function(dt){const q=devWorkbench144.practice,c=battle?.combo,x=c?.cinema141;
 if(q&&c?.id===q.actor&&x?.phase==='focus'&&!c.input&&c.t/c.duration>=.75&&!chainPaused141()){
  if(q.auto)comboHit();else if(q.guided){updateChainCue141(c);$('#combo-progress').textContent=(c.step+1)+' / '+c.chain+' · Gold opening · Press E, Space or Strike';return;}
 }
 return devWorkbenchChainBefore144(dt);
};
const devWorkbenchTickBefore144=tick;
tick=function(dt){const r=devWorkbenchTickBefore144(dt),q=devWorkbench144.practice;if(q&&battle&&!devConsole60.open&&!menu&&!gameLoading){if(!battle.combo){if(q.finishedAt===null){q.finishedAt=clock;q.chains++;}if(clock-q.finishedAt>.85)resetDevCombo144();}}else if(q&&!battle)devWorkbench144.practice=null;return r;};
const devWorkbenchBootBefore144=boot;
boot=async function(...args){const r=await devWorkbenchBootBefore144(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const d=JSON.parse(before());d.devWorkbench144={shortcut:'Backquote × 3',practice:devWorkbench144.practice?{actor:devWorkbench144.practice.actor,auto:devWorkbench144.practice.auto,guided:devWorkbench144.practice.guided}:null,item:devWorkbench144.item,gold:state.gold};return JSON.stringify(d);};return r;};
