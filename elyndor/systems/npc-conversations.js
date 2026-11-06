// A quest condition chooses the story action, not whether a visible person can
// be spoken to. Idle conversations never advance a beat or grant quest rewards.
const npcNames45={representative:'Local representative',tavin:'Tavin',mira:'Mira',lysa:'Lysa',soren:'Soren',merchant:'Merchant',worker:'Carpenter',healer:'Healer',guard:'Guard',guardEnemy:'Guard',courier:'Courier',farmer:'Farmer',elder:'Village elder',innkeeper:'Innkeeper','capital-stall':'Highmere outfitter','capital-steward':'Council steward','capital-archivist':'Archivist','capital-post':'Royal courier',commander1:'Commander',commander2:'Commander',commander3:'Commander'};
function npcPrimary45(a){return interactables.filter(o=>o.actor===a&&!o.interior&&o.type!=='npcConversation'&&npcAvailableBefore45(o)).sort((a,b)=>interactionPriority(b)-interactionPriority(a))[0];}
function syncNpcConversations45(){for(const o of interactables)if(o.actor?.npc&&!o.interior&&!o.serviceAnchor68){o.x=o.actor.x;o.z=o.actor.z;}}
function prepareNpcConversations45(){
 if(activeScene.kind==='overworld')return;
 for(const o of interactables.filter(o=>o.interior&&o.actor?.npc)){const a=o.actor;o.serviceNpc45=a;delete o.actor;if(a.interaction===o)a.interaction=null;}
 for(const a of actors.filter(a=>a.npc&&!a.enemy&&!a.party)){
  // Finish construction by seating a resident on an accessible floor. Keep this
  // arrival repair out of live movement, so people never teleport while playing.
  if(!staticFree(a.x,a.z,.55)){const p=safePoint(a,.55);if(staticFree(p.x,p.z,.55)){a.x=p.x;a.z=p.z;a.home={x:p.x,z:p.z};a.route=null;a.workRoute=[{...a.home}];updateActor(a,0);}}
  if(interactables.some(o=>o.type==='npcConversation'&&o.actor===a))continue;
  const source=interactables.find(o=>o.actor===a),name=npcNames45[a.id]??source?.label?.replace(/^Talk to (the )?/,'')??a.id.replaceAll('-',' ');
  const conversation={id:'conversation-'+(a.instanceId??a.id)+'-'+a.x,type:'npcConversation',actor:a,actorId:a.id,x:a.x,z:a.z,radius:2.8,label:'Talk to '+name,name,visualHeight:a.size};interactables.push(conversation);a.interaction??=conversation;
 }
 syncNpcConversations45();
}
const npcAvailableBefore45=interactionAvailable;
interactionAvailable=function(o){
 if(o.actor?.npc&&!o.interior&&(!o.actor.mesh.visible||o.actor.party||o.actor.enemy))return false;
 if(o.type==='npcConversation')return !npcPrimary45(o.actor);
 return npcAvailableBefore45(o);
};
// A resident and a shop door are separate targets. Talk beside the person;
// use the doorway when it is the closer target. Door markers never follow NPCs.
const npcNearestBefore45=nearestInteraction;
nearestInteraction=function(){
 syncNpcConversations45();
 const previous=npcNearestBefore45();if(activeScene.kind==='overworld'||['poiExit','interiorExit'].includes(previous?.type))return previous;
 const person=interactables.filter(o=>o.actor?.npc&&!o.interior&&interactionAvailable(o)&&dist(player,o)<(o.radius??2.5)).sort((a,b)=>dist(player,a)-dist(player,b)||interactionPriority(b)-interactionPriority(a))[0];
 return person&&(!previous||previous.actor===person.actor&&!previous.interior||dist(player,person)+.25<dist(player,previous))?person:previous;
};
const npcActBefore45=act;
act=function(o,...args){
 if(o?.type!=='npcConversation')return npcActBefore45(o,...args);
 if(!departureControlAvailable()||!interactionAvailable(o)||dist(player,o)>o.radius)return;
 const a=o.actor,lines={representative:'We are looking after the town. Speak to the people here if you need help finding your way.',tavin:'I am keeping an eye on everyone here.',mira:'There is still much we can learn by listening to the people here.',lysa:'Take care on the roads between settlements.',soren:'We should keep looking and compare what we find.'};
 a.face=facingForMotion(player.x-a.x,player.z-a.z);a.route=null;a.wait=Math.max(a.wait??0,5);player.face=facingForMotion(a.x-player.x,a.z-player.z);
 showSpeechBubble(a,lines[a.id]??'We are keeping things in order here. Take care on your journey.',o.name);
};
const npcTickBefore45=tick;
tick=function(...args){const result=npcTickBefore45(...args);syncNpcConversations45();return result;};
const npcBuildBefore45=buildWorld;
buildWorld=function(...args){const result=npcBuildBefore45(...args);prepareNpcConversations45();return result;};
const npcBootBefore45=boot;
boot=async function(...args){const result=await npcBootBefore45(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before());q.conversations=experience.bubbles.map(b=>({actor:b.actor.id,text:b.node.textContent}));return JSON.stringify(q);};return result;};
