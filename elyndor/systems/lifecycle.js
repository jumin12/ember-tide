// Public subsystem ownership and the shared frame boundary. Presentation
// decorators remain ordered by build-manifest.json; gameplay rules have one
// implementation and can be exercised independently of the renderer.
const Engine={
  version:1,installed:false,
  systems:{runtime:{Clock:SimulationClock,loop},persistence:{read:readSave,write:saveSlot,load:loadSlot},campaign:{begin:beginRestoration,update:updateRestoration,work:performWorldAction},combat:{stats,encounters:ENCOUNTERS,rewards:encounterRewards}},
  update(dt){updateCampaignEvents(dt);updateRegionalWildlife(dt);updateLocalRequestWork(dt);flushJourneyCheckpoint();},
  diagnostics(){
    const samples=Array.from(runtimeFrames.samples.slice(0,runtimeFrames.count)).sort((a,b)=>a-b);
    return{fixedSimulation:loop===this.systems.runtime.loop&&loop.toString().includes('simulationClock.advance'),step:simulationClock.step,simulationSeconds:simulationClock.total,catchupSteps:simulationClock.steps,droppedAfterSuspension:simulationClock.dropped,frames:runtimeFrames.count,p95:samples[Math.floor(samples.length*.95)]??0,p99:samples[Math.floor(samples.length*.99)]??0,saveSchema:SAVE_SCHEMA,pendingCheckpoint:saveManager.pending,recoveredRecords:[...saveManager.recovered],campaign:campaignEvents.active?{order:campaignEvents.active.order,index:campaignEvents.active.index,busy:campaignEvents.active.busy}:null};
  }
};
function installEngine(){if(Engine.installed)return;Engine.installed=true;window.__ely.engine=Engine;const previous=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(previous());q.engine=Engine.diagnostics();return JSON.stringify(q);};}
