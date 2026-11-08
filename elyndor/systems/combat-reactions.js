// Health reactions share the recorded combat bus: one line per threshold
// crossing, serialized behind a move call instead of cutting over it.
const HEALTH_LINES87={
 bren:{injured:"That one hurt... I'm still standing!",recovered:"Much better. Let's finish this."},
 soren:{injured:'My focus... I need a moment.',recovered:'Steady again. Thank you.'},
 tavin:{injured:'Not my best... Still here.',recovered:"That's more like it."},
 mira:{injured:"I'm fine... Just give me a breath.",recovered:'There. Back on my feet.'},
 lysa:{injured:"Tch... I'm not done yet.",recovered:'Much better. My turn.'}
};
for(const [id,lines]of Object.entries(HEALTH_LINES87))for(const text of Object.values(lines))combatVoices49.allowed.add(voiceLookupKey(id,text));
const healthReactions87={owner:null,states:new Map(),events:[]};
function healthReaction87(id,kind){
 const text=HEALTH_LINES87[id][kind],key=voiceLookupKey(id,text),clip=assets.voices?.[key];
 healthReactions87.events.push({id,kind,at:clock,recorded:!!clip});if(healthReactions87.events.length>80)healthReactions87.events.shift();
 if(!clip||!voiceEnabled21()||!combatVoiceContext49())return;
 speech21.completed.delete(key);speech21.queue.push({speaker:id,text,key,clip,kind:'battle',token:++speech21.serial,combatMove49:true,healthReaction87:true});combatVoices49.requests++;pumpSpeech21();
}
function updateHealthReactions87(){
 if(!battle){healthReactions87.owner=null;healthReactions87.states.clear();return;}
 if(healthReactions87.owner!==battle){healthReactions87.owner=battle;healthReactions87.states.clear();for(const id of state.members)healthReactions87.states.set(id,false);}
 if(!combatVoiceContext49())return;
 for(const id of state.members){
  const hp=state.characters[id].hp,max=stats(id).hp,was=healthReactions87.states.get(id)??false;
  // A knockout is a separate state. Recovery begins strictly above 25%,
  // matching the injured pose; later healing above it does not repeat the line.
  if(hp<=0){healthReactions87.states.set(id,false);continue;}
  const injured=hp<=max*.25;
  if(injured!==was){healthReactions87.states.set(id,injured);healthReaction87(id,injured?'injured':'recovered');}
 }
}
const healthTickBefore87=tick;
tick=function(...args){const r=healthTickBefore87(...args);updateHealthReactions87();return r;};
const healthMenuBefore87=renderMenu;
renderMenu=function(...args){const r=healthMenuBefore87(...args);if(menu?.tab==='settings'){const input=$('#setting-voices'),label=input?.closest('.setting-row')?.querySelector('label');if(label)label.innerHTML='Combat voices<small>Recorded move calls and injury / recovery reactions.</small>';input?.setAttribute('aria-label','Combat voices');}return r;};
