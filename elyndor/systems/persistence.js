// One persistence owner: stable quest keys, bounded validation, migrations,
// recovery records and portable files. Runtime state is never read directly
// from unvalidated browser storage.
const SAVE_SCHEMA=5,SAVE_FORMAT='elyndor-journey',SAVE_SLOTS=['auto','1','2','3'];
const saveManager={pending:false,lastWrite:-100,loading:null,recovered:new Set(),errors:[],cache:new Map()};
const LEGACY_QUEST_KEYS=['arrival','gate','pump','wildlife','aftermath','travelFern','tavinIntro','joinTavin','commander1','stabilize','betrayal','evacuate','fernRepair','highmere','standoff','patients','patrol','leader','rescue','lysa','commander2','brace','alderRepair','returnLysa','reportNotes','logs','relay','pause','initialCouncil','dream','archives','trialCouncil','trialReturn','reliefRepair','councilFindings','nearby','commander3','siteRepair','debrief','snow','complete'];
const LEGACY_WORLD_QUEST_KEYS=["arrival","gate","pump","wildlife","aftermath","travelFern","tavinIntro","joinTavin","commander1","stabilize","betrayal","evacuate","fernRepair","fernLight","highmere","standoff","patients","patrol","leader","rescue","lysa","commander2","brace","alderRepair","alderLight","returnLysa","reportNotes","logs","relay","pause","initialCouncil","dream","archives","trialCouncil","trialReturn","reliefRepair","reliefLight","councilFindings","nearby","commander3","siteRepair","siteLight","debrief","snow","complete"];
function saveChecksum(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return(h>>>0).toString(16).padStart(8,'0');}
function saveObject(v){return !!v&&typeof v==='object'&&!Array.isArray(v);}
function boundedNumber(v,fallback,min,max){return Number.isFinite(v)?clamp(v,min,max):fallback;}
function cleanSaveTree(value,depth=0){
  if(depth>12)throw Error('The record contains excessively nested data.');
  if(value===null||typeof value==='boolean'||typeof value==='number'&&Number.isFinite(value))return value;
  if(typeof value==='string'){if(value.length>500000)throw Error('A record field is too large.');return value;}
  if(Array.isArray(value)){if(value.length>20000)throw Error('A record list is too large.');return value.map(v=>cleanSaveTree(v,depth+1));}
  if(saveObject(value)){const out={};if(Object.keys(value).length>25000)throw Error('The record has too many fields.');for(const[k,v]of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(k))continue;if(v!==undefined)out[k]=cleanSaveTree(v,depth+1);}return out;}
  throw Error('The record contains an unsupported value.');
}
function normalizeJourneySave(input){
  if(!saveObject(input))throw Error('This is not a journey record.');
  let raw=input;
  if(input.format!==undefined){if(input.format!==SAVE_FORMAT||input.schema!==SAVE_SCHEMA||!saveObject(input.payload))throw Error('This journey format is not supported.');const text=JSON.stringify(input.payload);if(input.checksum!==saveChecksum(text))throw Error('This record is incomplete or damaged.');raw=input.payload;}
  if(![3,4,5].includes(raw.version))throw Error('This record version is not supported.');
  const q=cleanSaveTree(raw),base=initialState(),old=q.version===3;
  const questKey=q.questId??(old?LEGACY_QUEST_KEYS:LEGACY_WORLD_QUEST_KEYS)[q.beat],beat=BEATS.findIndex(b=>b[0]===questKey);
  if(beat<0)throw Error('The saved quest is unknown.');
  if(typeof q.scene!=='string'||!SCENES[q.scene])throw Error('The saved location is unknown.');
  if(!saveObject(q.position)||!Number.isFinite(q.position.x)||!Number.isFinite(q.position.z))throw Error('The saved position is missing.');
  if(!Array.isArray(q.members)||!q.members.length||q.members.some(id=>!CAST[id]))throw Error('The saved party is invalid.');
  if(!saveObject(q.characters)||!saveObject(q.flags))throw Error('The saved character state is missing.');
  const s={...base,...q,version:5,questId:questKey,beat,mode:'explore',members:[...new Set(q.members)],flags:{...q.flags},settings:{...base.settings,...(saveObject(q.settings)?q.settings:{})},characters:{}};
  normalizeParty96(s);
  for(const[id,def]of Object.entries(base.characters)){
    const c=saveObject(q.characters[id])?q.characters[id]:{},gear={weapon:null,armor:null,accessory:null,offhand:null};
    for(const slot of Object.keys(gear)){const key=c.gear?.[slot];if(typeof key==='string'&&ITEMS[key]?.slot===slot)gear[slot]=key;}
    const level=Math.floor(boundedNumber(c.level,1,1,99)),limits=characterStats(id,{...c,level,gear}),maxHp=limits.hp,maxMp=limits.mp;
    s.characters[id]={...def,...c,level,xp:Math.floor(boundedNumber(c.xp,0,0,1000000)),hp:boundedNumber(c.hp,maxHp,0,maxHp),mp:boundedNumber(c.mp,maxMp,0,maxMp),charge:0,ascended:false,gear};
  }
  s.items={};for(const[k,v]of Object.entries(saveObject(q.items)?q.items:{}))if(ITEMS[k])s.items[k]=Math.floor(boundedNumber(v,0,0,9999));
  s.gold=Math.floor(boundedNumber(q.gold,base.gold,0,99999999));s.elapsed=boundedNumber(q.elapsed,0,0,1e9);s.worldMinutes=boundedNumber(q.worldMinutes,base.worldMinutes,0,1e9);
  s.settings.volume=boundedNumber(s.settings.volume,.35,0,1);s.settings.zoom=boundedNumber(s.settings.zoom,1,.5,2);if(!['both','click','keys'].includes(s.settings.movement))s.settings.movement='both';if(!['balanced','high','low'].includes(s.settings.quality))s.settings.quality='balanced';
  s.visited=Array.isArray(q.visited)?[...new Set(q.visited.filter(v=>typeof v==='string'&&SCENES[v]))]:base.visited;
  s.discovered=Array.isArray(q.discovered)?q.discovered.filter(v=>typeof v==='string'):base.discovered;
  s.restoredLights=Array.isArray(q.restoredLights)?[...new Set(q.restoredLights.filter(id=>LIGHT_SITES.some(l=>l.id===id)))]:[];
  s.worldNPCs=Array.isArray(q.worldNPCs)?q.worldNPCs.filter(n=>saveObject(n)&&typeof n.id==='string'&&Number.isFinite(n.x)&&Number.isFinite(n.z)).slice(0,300):[];
  s.position={x:clamp(q.position.x,-100000,100000),z:clamp(q.position.z,-100000,100000)};
  if(old){const p=PLACES[q.scene]??PLACES.approach;s.position={x:p[0]+clamp(q.position.x,-12,12),z:p[1]+clamp(q.position.z,-8,8)};s.worldFormat=1;s.restoredLights=LIGHT_SITES.filter(l=>s.flags[l.repair]&&beat>BEATS.findIndex(b=>b[0]===l.beat)).map(l=>l.id);}
  s.localRequests16={};for(const [key,value]of Object.entries(saveObject(q.localRequests16)?q.localRequests16:{})){if(!LOCAL_REQUESTS16[key]||!saveObject(value))continue;const done=[...new Set((Array.isArray(value.done)?value.done:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<3))];s.localRequests16[key]={accepted:!!value.accepted,done,claimed:!!value.accepted&&done.length===3&&!!value.claimed};}
  s.trackedRequest16=typeof q.trackedRequest16==='string'&&LOCAL_REQUESTS16[q.trackedRequest16]?q.trackedRequest16:null;
  delete s.regionalRestoration;
  if(q.regionalRestoration!==undefined&&!s.flags.region_restored){
    const r=q.regionalRestoration,order=r?.order,origin=r?.origin,last=Array.isArray(order)?LIGHT_SITES.find(l=>l.id===order.at(-1)):null;
    if(!saveObject(r)||!Array.isArray(order)||order.length!==LIGHT_SITES.length||new Set(order).size!==order.length||order.some(id=>!s.restoredLights.includes(id))||!saveObject(origin)||!SCENES[origin.scene]||origin.scene!==last?.area||!Array.isArray(origin.position)||origin.position.length!==2||!origin.position.every(v=>Number.isFinite(v)&&Math.abs(v)<=100000))throw Error('The saved Light ceremony is damaged.');
    s.regionalRestoration={order:[...order],origin:{scene:origin.scene,position:[...origin.position]}};
  }
  s.overworldScale17??=1;
  if(s.restoredLights.length===LIGHT_SITES.length&&beat>BEATS.findIndex(b=>b[0]==='siteLight'))s.flags.region_restored=true;
  s.savedAt=boundedNumber(q.savedAt,Date.now(),0,Date.now()+86400000);return s;
}
function parseJourneySave(text){if(typeof text!=='string'||text.length>4000000)throw Error('The journey file is too large.');return normalizeJourneySave(JSON.parse(text));}
function encodeJourneySave(payload){return JSON.stringify({format:SAVE_FORMAT,schema:SAVE_SCHEMA,payload,checksum:saveChecksum(JSON.stringify(payload))});}
function readJourneyRecord(slot){
  if(!SAVE_SLOTS.includes(String(slot)))return null;const key='elyndor-save-v5-'+slot;
  for(const name of[key,key+'-backup','elyndor-save-v4-'+slot,'elyndor-save-v3-'+slot]){
    try{const text=localStorage.getItem(name);if(!text)continue;const record=parseJourneySave(text);if(name===key+'-backup')saveManager.recovered.add(String(slot));else saveManager.recovered.delete(String(slot));return record;}catch{}
  }return null;
}
readSave=readJourneyRecord;
function snapshotJourney(){
  const s=JSON.parse(JSON.stringify(state));s.version=SAVE_SCHEMA;s.questId=currentBeat()[0];s.worldFormat=2;s.mode='explore';s.savedAt=Date.now();s.scene=activeScene?.kind==='poi'?POIS[activeScene.key].id:activeScene?.key??state.scene;s.position={x:player.x,z:player.z};s.worldNPCs=npcs.map(a=>({id:a.id,instanceId:a.instanceId??null,x:a.x,z:a.z,tasks:a.tasks??0,workIndex:a.workIndex??0}));
  return normalizeJourneySave(s);
}
function writeJourneyRecord(slot,record){
  const key='elyndor-save-v5-'+slot,text=encodeJourneySave(record),old=localStorage.getItem(key);parseJourneySave(text);
  if(old){try{parseJourneySave(old);localStorage.setItem(key+'-backup',old);}catch{}}
  localStorage.setItem(key,text);parseJourneySave(localStorage.getItem(key));saveManager.recovered.delete(String(slot));return true;
}
function canSnapshotJourney(){return !!player&&!battle&&!restoration&&!eventAction&&!dialogue&&!transition&&!gameLoading&&!sceneSwitchPending&&state.mode==='explore'&&!(typeof campaignEvents!=='undefined'&&campaignEvents.active);}
saveSlot=function(slot,silent=false){
  slot=String(slot);if(!SAVE_SLOTS.includes(slot)||!canSnapshotJourney())return false;
  if(slot!=='auto'&&!canRecordJourney22()){if(!silent)toast('Use a wayfarer seal at a location entrance or an inn.');return false;}
  try{if(slot!=='auto'){markLesson16('inn');mentorDone17('inn');}writeJourneyRecord(slot,snapshotJourney());saveManager.lastWrite=clock;if(!silent){toast('Journey saved · Record '+slot);playSound('ui-save');}if(menu)renderMenu();renderTitlePanel19();return true;}catch(e){saveManager.errors.push(e.message);if(saveManager.errors.length>8)saveManager.errors.shift();if(!silent)toast('The browser could not store this record. Your previous record is preserved.');return false;}
};
autoSave=function(){saveManager.pending=true;};
function flushJourneyCheckpoint(){if(saveManager.pending&&canSnapshotJourney()&&clock-saveManager.lastWrite>1){if(saveSlot('auto',true))saveManager.pending=false;}}
loadSlot=function(slot='auto'){
  if(gameLoading||saveManager.loading)return false;const saved=readSave(String(slot));if(!saved){toast('This record could not be read.');return false;}
  const previousState=state;title19.stopped=true;setJourneyLoading(true);resetSimulation();loading36.pendingSave=String(slot);
  const task=(async()=>{try{
    await yieldLoad36();await yieldLoad36();restoreVillage26();if(typeof cancelCampaignEvents==='function')cancelCampaignEvents();state=saved;menu=null;dialogue=null;battle=null;eventAction=null;transition=null;restoration=null;route=null;saveManager.pending=false;
    for(const selector of['#title','#menu','#dialogue','#battle-hud','#battle-results'])$(selector)?.classList.add('hidden');$('#letterbox').classList.remove('active');$('#hud').classList.remove('hidden');$('#scene-transition').classList.remove('show');
    buildWorld(saved.scene,[saved.position.x,saved.position.z]);
    for(const n of saved.worldNPCs){const a=npcs.find(a=>n.instanceId?a.instanceId===n.instanceId:a.id===n.id&&!a.instanceId);if(a&&staticFree(n.x,n.z,.4)){a.x=n.x;a.z=n.z;a.tasks=n.tasks;a.workIndex=n.workIndex;}}
    syncStoryWorld();await prepareGameplayGraphics();updateHUD();toast(saveManager.recovered.has(String(slot))?'Recovered the previous good record.':'Journey resumed.');if(typeof resumeCampaignEvents==='function')queueMicrotask(resumeCampaignEvents);return true;
  }catch(e){state=previousState;console.error(e);$('#fatal-text').textContent='The journey could not be resumed. Your saved records are unchanged. '+e.message;$('#fatal').classList.remove('hidden');return false;}
  finally{setJourneyLoading(false);loading36.pendingSave=null;saveManager.loading=null;resetSimulation();}})();saveManager.loading=task;window.journeyGraphicsReady=task;return true;
};
removeSave19=function(slot){if(!['1','2','3'].includes(String(slot)))return false;try{for(const v of['v5','v4','v3']){localStorage.removeItem('elyndor-save-'+v+'-'+slot);localStorage.removeItem('elyndor-save-'+v+'-'+slot+'-backup');}saveManager.recovered.delete(String(slot));return true;}catch{toast('The browser could not remove this record.');return false;}};
function exportJourneySave(slot){const record=readSave(slot);if(!record)return;const blob=new Blob([encodeJourneySave(record)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Elyndor-record-'+slot+'-'+record.questId+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function importJourneySave(slot){
  const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.onchange=async()=>{const file=input.files?.[0];if(!file)return;try{if(file.size>4000000)throw Error('The journey file is too large.');const record=parseJourneySave(await file.text());const modal=document.createElement('dialog');modal.className='journey-import';modal.innerHTML='<h2>Import journey into Record '+slot+'?</h2><p>'+esc(CAST[record.members[0]].name)+' · '+esc(SCENES[record.scene].name)+' · '+esc(BEATS[record.beat][2])+'</p><p>The current record in this slot will be kept as its recovery copy.</p><button data-import-confirm class="primary">Import record</button><button data-import-cancel>Cancel</button>';document.body.append(modal);modal.querySelector('[data-import-cancel]').onclick=()=>{modal.close();modal.remove();};modal.querySelector('[data-import-confirm]').onclick=()=>{try{writeJourneyRecord(slot,record);modal.close();modal.remove();renderTitlePanel19();if(menu)renderMenu();toast('Journey imported into Record '+slot+'.');}catch(e){toast(e.message);}};modal.addEventListener('cancel',()=>modal.remove(),{once:true});modal.showModal();}catch(e){toast('Cannot import this journey: '+e.message);}};input.click();
}
document.addEventListener('click',e=>{const button=e.target.closest('[data-export-journey],[data-import-journey]');if(!button)return;e.preventDefault();if(button.dataset.exportJourney)exportJourneySave(button.dataset.exportJourney);else importJourneySave(button.dataset.importJourney);});
function decorateJourneyRecords(){for(const card of $$('.journey-slot19')){if(card.querySelector('.journey-portable'))continue;const slot=card.dataset.slot19,bar=document.createElement('div');bar.className='journey-portable';const valid=!!readSave(slot);bar.innerHTML='<button data-import-journey="'+slot+'">Import file</button>'+(valid?'<button data-export-journey="'+slot+'">Export file</button>':'')+(saveManager.recovered.has(slot)?'<small>Recovery copy available</small>':'');card.append(bar);}}
const persistenceObserver=new MutationObserver(decorateJourneyRecords);persistenceObserver.observe($('#title'),{childList:true,subtree:true});persistenceObserver.observe($('#menu'),{childList:true,subtree:true});
