// Campaign sequencing owns stable IDs; only the current scene owns live meshes.
const campaignEvents={active:null,serial:0,history:[],errors:[]};
const WORK_SCENES={
  stabilize:{seconds:4.2,helpers:['bren','tavin']},evacuees:{seconds:5,helpers:['tavin']},
  fernRepair:{seconds:4.5,helpers:['tavin']},patients:{seconds:4,helpers:['bren','tavin']},
  rescue:{seconds:4.5,helpers:['mira','tavin']},mira:{seconds:3.6,helpers:['tavin']},
  alderRepair:{seconds:4.5,helpers:['mira','tavin']},reliefRepair:{seconds:4.5,helpers:['mira','tavin']},
  siteRepair:{seconds:4.8,helpers:['mira','tavin']}
};
function performWorldAction(id,o,label,duration,onDone){
  if(eventAction||campaignEvents.active)return;const a=actors.find(a=>(a.characterId??a.id)===id&&!a.npc&&!a.enemy)??player,work=townWorkPoint(o,a),approach=work?findRoute(a,work,[]):null;
  if(work&&!approach&&dist(a,work)>1.2){toast('Move closer to the clear work apron.');return;}
  const spec=WORK_SCENES[o.type],workAction=o.type==='guard'?'idle':id==='bren'?'work_gate':'cast';
  state.mode='action';keys.clear();route=null;a.action=approach?.length?'walk':workAction;a.actionTime=0;
  const helpers=(spec?.helpers??[]).filter(k=>k!==id).map(k=>actorFor(k)).filter(Boolean);
  eventAction={actor:a,target:o,label,duration:Math.max(duration,spec?.seconds??duration),time:0,onDone:()=>{for(const h of helpers){h.action='idle';h.actionTime=0;}onDone();},fx:false,approach,workAction,work,helpers,watch:{x:a.x,z:a.z,stalled:0,replans:0}};toast(label+'…');
}
function updateCampaignEvents(dt){
  const e=eventAction;if(!e?.watch)return;
  if(e.approach?.length){const w=e.watch,moved=Math.hypot(e.actor.x-w.x,e.actor.z-w.z);w.x=e.actor.x;w.z=e.actor.z;w.stalled=moved>.003?0:w.stalled+dt;
    if(w.stalled>.8){w.stalled=0;w.replans++;e.approach=e.work?findRoute(e.actor,e.work,[]):null;if(!e.approach?.length||w.replans>3){e.actor.action='idle';for(const h of e.helpers)h.action='idle';eventAction=null;state.mode='explore';toast('The work area is obstructed. Approach from the open path and try again.');}}
  }else{for(const h of e.helpers){h.speed=0;h.face=facingForMotion(e.target.x-h.x,e.target.z-h.z);if(h.action!=='cast'){h.action='cast';h.actionTime=0;}}}
}
function cancelCampaignEvents(){campaignEvents.serial++;campaignEvents.active=null;restoration=null;$('#letterbox').classList.remove('active');}
function beginRestoration(site){
  if(campaignEvents.active||restoration)return;const s=world.userData.lightSites.find(s=>s.id===site.id);if(!s)return;
  state.mode='restoration';keys.clear();route=null;restoration={site:s,time:0,phase:'individual',order:[],done:false};$('#letterbox').classList.add('active');toast('Listening to the Elder Light…');playSound('light-network-chime',.45);openWorldDebug.restorations++;
}
function saveRegionalCheckpoint(){try{writeJourneyRecord('auto',snapshotJourney());}catch(e){campaignEvents.errors.push(e.message);}}
function startRegionalRestoration(resume=null){
  const origin=resume?.origin??{scene:activeScene.key,position:[player.x,player.z]},order=resume?.order??[...state.restoredLights];
  const run={id:++campaignEvents.serial,order:[...order],index:0,shown:[],origin,busy:false};campaignEvents.active=run;state.regionalRestoration={order:[...order],origin};restoration=null;saveRegionalCheckpoint();showRegionalLight(run);
}
async function showRegionalLight(run){
  if(campaignEvents.active!==run||run.busy)return;run.busy=true;restoration=null;
  try{
    const site=LIGHT_SITES.find(s=>s.id===run.order[run.index]);if(!site)throw Error('A restored Light is missing from the regional sequence.');
    if(activeScene.key!==site.area){const ok=await changeJourneyScene(site.area,POIS[site.area].spawn);if(!ok)throw Error('The next restoration scene is busy.');}
    if(campaignEvents.active!==run)return;const loaded=world.userData.lightSites.find(s=>s.id===site.id);if(!loaded)throw Error('The restoration scene has no Elder Light.');
    state.mode='restoration';keys.clear();route=null;for(const a of[player,...followers]){a.mesh.visible=false;a.shadow.visible=false;}
    restoration={site:loaded,phase:'regional',time:0,order:[loaded],index:0};$('#letterbox').classList.add('active');toast(site.name+' · The fractures heal');
    run.shown.push(site.id);campaignEvents.history.push({type:'regional-light',id:site.id,scene:activeScene.key});if(campaignEvents.history.length>64)campaignEvents.history.shift();
  }catch(e){campaignEvents.errors.push(e.message);if(campaignEvents.errors.length>8)campaignEvents.errors.shift();campaignEvents.active=null;restoration=null;state.mode='explore';for(const a of[player,...followers]){a.mesh.visible=true;a.shadow.visible=true;}$('#letterbox').classList.remove('active');toast('The ceremony can be resumed at the Elder Light.');console.error(e);}
  finally{run.busy=false;}
}
async function completeRegionalRestoration(run){
  if(run.busy||campaignEvents.active!==run)return;run.busy=true;restoration=null;
  try{
    if(activeScene.key!==run.origin.scene){const ok=await changeJourneyScene(run.origin.scene,run.origin.position);if(!ok)throw Error('The return path is busy.');}
    if(campaignEvents.active!==run)return;const site=world.userData.lightSites.find(s=>s.id===run.order.at(-1));if(!site)throw Error('The final restoration Light is missing.');
    setupParty(run.origin.position);state.flags.region_restored=true;syncStoryWorld();state.mode='restoration';restoration={site,phase:'wave',time:0,order:[site],index:0};
    const wave=fxMesh(new THREE.RingGeometry(1,1.15,96),'#c7fbe0',V3(site.x,groundAt(site.x,site.z)+.15,site.z),5,{opacity:.4});wave.mesh.rotation.x=-Math.PI/2;wave.expand=1.3;
    for(const a of[player,...followers]){a.mesh.visible=true;a.shadow.visible=true;}toast('Nature’s Flow returns to the region.');
  }catch(e){campaignEvents.errors.push(e.message);campaignEvents.active=null;restoration=null;state.mode='explore';console.error(e);}finally{run.busy=false;}
}
function resumeCampaignEvents(){if(state.regionalRestoration&&!state.flags.region_restored&&state.restoredLights?.length===LIGHT_SITES.length)startRegionalRestoration(state.regionalRestoration);}
function updateRestoration(dt){
  if(!restoration)return;const r=restoration,s=r.site;r.time+=dt;
  if(r.phase==='individual'){
    const t=smooth(.5,3.8,r.time);s.core.material.color.set('#6f9caa').lerp(new THREE.Color('#c2f4e7'),t);s.core.material.emissiveIntensity=mix(.15,.55,t);s.inner.material.opacity=mix(.2,.78,t);s.glow.intensity=8+t*20;
    if(frameIndex%5===0){const a=clock*3;sparks(V3(s.x+Math.cos(a)*3.2,groundAt(s.x,s.z)+2+Math.sin(a*.7),s.z+Math.sin(a)*3.2),'#b8f9e3',2,.25);}
    if(r.time>4.8){state.restoredLights??=[];if(!state.restoredLights.includes(s.id))state.restoredLights.push(s.id);state.flags[s.id+'_light_recovered']=true;
      if(state.restoredLights.length===LIGHT_SITES.length){toast('The restored Lights answer one another.');startRegionalRestoration();}
      else{restoration=null;state.mode='explore';$('#letterbox').classList.remove('active');nextBeat();toast('Elder Light restored · Steady brightness; fractures remain.');autoSave();}}
  }else if(r.phase==='regional'){
    const t=clamp(r.time/3,0,1);s.fractures.traverse(o=>{if(o.material)o.material.opacity=.9*(1-t);});s.core.material.emissiveIntensity=.65+Math.sin(t*Math.PI)*1.2;s.glow.intensity=25;
    if(frameIndex%8===0)sparks(V3(s.x,groundAt(s.x,s.z)+4,s.z),'#fff1b4',4,.6);
    if(r.time>3.8){const run=campaignEvents.active;if(!run||run.busy)return;run.index++;if(run.index<run.order.length)showRegionalLight(run);else completeRegionalRestoration(run);}
  }else if(r.phase==='wave'&&r.time>4){campaignEvents.history.push({type:'regional-complete',order:[...(campaignEvents.active?.shown??[])]});campaignEvents.active=null;delete state.regionalRestoration;restoration=null;state.mode='explore';$('#letterbox').classList.remove('active');nextBeat();autoSave();}
}
