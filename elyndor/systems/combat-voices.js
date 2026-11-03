// Only actual combat-move execution may request a voice recording. Dialogue,
// NPC bubbles, narration and victory text retain their existing text behavior.
const combatVoices49={depth:0,blocked:0,requests:0,allowed:new Set()};
{
 const calls=['Driving slash!','Right on target!','A perfect opening!','Keep moving!','Now!','Stay with us.','We stand together!','I\u2019ll hold the line.'];
 for(const[id,character]of Object.entries(CAST))for(const text of[...calls,...character.skill.flatMap(skill=>[skill[0],skill[5]])])if(typeof text==='string'&&text)combatVoices49.allowed.add(voiceLookupKey(id,text));
}
function combatVoiceContext49(){return !!battle&&state.mode==='battle'&&!dialogue&&!resultsPage&&!['victory','defeat'].includes(battle.status);}
function runVoicedMove49(fn,self,args){combatVoices49.depth++;try{return fn.apply(self,args);}finally{combatVoices49.depth--;}}
const voicedActionBefore49=battleAction,voicedSkillBefore49=executeSkill,voicedChainBefore49=applyLiveChainHit,voicedComboBefore49=resolveCombo,voicedAllyBefore49=battleAllyTarget,voicedAscendBefore49=ascend;
battleAction=function(...args){return runVoicedMove49(voicedActionBefore49,this,args);};
executeSkill=function(...args){return runVoicedMove49(voicedSkillBefore49,this,args);};
applyLiveChainHit=function(...args){return runVoicedMove49(voicedChainBefore49,this,args);};
resolveCombo=function(...args){return runVoicedMove49(voicedComboBefore49,this,args);};
battleAllyTarget=function(...args){return runVoicedMove49(voicedAllyBefore49,this,args);};
ascend=function(...args){return runVoicedMove49(voicedAscendBefore49,this,args);};
const moveRecordingBefore49=playRecordedVoice;
playRecordedVoice=function(speaker,text){
 if(!combatVoices49.depth||!combatVoiceContext49()||!combatVoices49.allowed.has(voiceLookupKey(speaker,text))){combatVoices49.blocked++;return;}
 if(speech21.active&&!speech21.active.combatMove49)stopRecordedVoice(true);
 const serial=speech21.serial;combatVoices49.requests++;const result=moveRecordingBefore49(speaker,text);
 if(speech21.active?.token>serial)speech21.active.combatMove49=true;
 for(const q of speech21.queue)if(q.token>serial)q.combatMove49=true;
 return result;
};
const movePumpBefore49=pumpSpeech21;
pumpSpeech21=function(...args){
 if(!combatVoiceContext49()){if(speech21.active||speech21.queue.length)stopRecordedVoice(true);return;}
 // The recording enqueues and pumps synchronously while the move is executing.
 // Later pumps may resume only entries explicitly admitted by that execution.
 speech21.queue=speech21.queue.filter(q=>q.combatMove49||combatVoices49.depth&&q.kind==='battle'&&(q.combatMove49=true));
 if(speech21.active&&!speech21.active.combatMove49)stopRecordedVoice(true);
 return movePumpBefore49(...args);
};
const moveDialogueBefore49=showDialogue;
showDialogue=function(...args){stopRecordedVoice(true);return moveDialogueBefore49(...args);};
const moveBattleEndBefore49=endBattle;
endBattle=function(...args){stopRecordedVoice(true);return moveBattleEndBefore49(...args);};
const moveTickBefore49=tick;
tick=function(...args){const result=moveTickBefore49(...args);if(!combatVoiceContext49()&&(speech21.active||speech21.queue.length))stopRecordedVoice(true);return result;};
const moveAssetsBefore49=loadAssets;
loadAssets=async function(...args){
 const result=await moveAssetsBefore49(...args);
 // Omit unused story recordings from runtime preparation and playback lookup;
 // keep the original source assets on disk for the project's editing history.
 for(const key of Object.keys(assets.voices??{}))if(!combatVoices49.allowed.has(key))delete assets.voices[key];
 stopRecordedVoice(true);return result;
};
const moveSettingsBefore49=renderMenu;
renderMenu=function(...args){
 const result=moveSettingsBefore49(...args);if(menu?.tab!=='settings')return result;
 const control=$('#setting-voices'),label=control?.closest('.setting-row')?.querySelector('label');
 if(label)label.innerHTML='Combat move voices<small>Recorded calls for attacks, skills, and other combat moves.</small>';
 control?.setAttribute('aria-label','Combat move voices');const description=$('[data-settings26="audio"] header p');if(description)description.textContent='Adjust music, ambience, effects, and combat voices.';
 return result;
};
const moveVoiceTextBefore49=installJourneyText;let moveVoiceTextInstalled49=false;
installJourneyText=function(...args){
 const result=moveVoiceTextBefore49(...args);
 if(!moveVoiceTextInstalled49&&window.journeyTextInstalled){
  moveVoiceTextInstalled49=true;const before=window.render_game_to_text;
  window.render_game_to_text=()=>{const q=JSON.parse(before());q.voice={...q.voice,mode:'combat-moves-only',recordedClips:Object.keys(assets.voices??{}).length,blocked:combatVoices49.blocked};return JSON.stringify(q);};
 }
 return result;
};
