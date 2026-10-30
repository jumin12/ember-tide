// Tavin's playable vignette must point to an encounter, not his hidden NPC.
BEATS.find(b=>b[0]==='tavinIntro')[3]='Protect the gathering ground with Tavin.';
const questTargetBefore29=objectiveTarget;
objectiveTarget=function(){
 if(currentBeat()[0]==='tavinIntro'&&activeScene?.key==='fern')return interactables.find(o=>o.type==='tavin');
 return questTargetBefore29();
};
function installRestraint29(){
 if(activeScene?.key!=='fern'||!['travelFern','tavinIntro'].includes(currentBeat()[0])||world.userData.restraint29)return;
 const o=interactables.find(o=>o.type==='tavin');if(!o)return;
 const p=safePoint({x:o.x,z:o.z},.65);o.x=p.x;o.z=p.z;o.label='Protect the gathering ground';o.radius=3;o.visualHeight=.15;
 const marker=groundDecal(p.x,p.z,textures.runeSeal,3.5,0,'#f1c970');marker.material.emissiveIntensity=.5;
 world.userData.restraint29={marker,people:[]};
 for(const[id,dx,dz]of[['tribeMale',3.4,-1.2],['tribeFemale',4.2,1.7]]){
  const q=safePoint({x:p.x+dx,z:p.z+dz},.45),a=createActor(id,q.x,q.z,2.2);if(!a)continue;a.scripted=a.story=true;a.face='west';a.action='idle';a.home={x:q.x,z:q.z};world.userData.restraint29.people.push(a);
 }
}
const buildQuestBefore29=buildWorld;
buildWorld=function(...args){buildQuestBefore29(...args);installRestraint29();};
const enterQuestBefore29=onSceneEntered;
onSceneEntered=function(id){enterQuestBefore29(id);installRestraint29();if(currentBeat()[0]==='tavinIntro')updateHUD();};
const beginQuestBefore29=beginBattle;
beginBattle=function(kind){
 if(kind==='tavinIntro'&&(state.members.length!==1||state.members[0]!=='tavin')){state.members=['tavin'];setupParty([player.x,player.z]);}
 return beginQuestBefore29(kind);
};
const endQuestBefore29=endBattle;
endBattle=function(outcome){const intro=battle?.kind==='tavinIntro';endQuestBefore29(outcome);if(intro&&outcome==='won')state.flags.tavin_intro_complete=true;};
const nextQuestBefore29=nextBeat;
nextBeat=function(){nextQuestBefore29();const q=world?.userData.restraint29;if(q&&currentBeat()[0]!=='tavinIntro'){q.marker.visible=false;const o=interactables.find(o=>o.type==='tavin');if(o)o.label='Speak with Tavin';for(const a of q.people){a.mesh.visible=false;a.shadow.visible=false;}}};
const fxQuestBefore29=updateWorldFX;
updateWorldFX=function(dt){fxQuestBefore29(dt);const q=world?.userData.restraint29;if(!q)return;const show=currentBeat()[0]==='tavinIntro'&&!battle;q.marker.visible=show;if(show)q.marker.material.opacity=.75+Math.sin(clock*1.7)*.08;for(const a of q.people)if(battle||currentBeat()[0]!=='tavinIntro'){a.mesh.visible=false;a.shadow.visible=false;}else a.mesh.visible=true;};
