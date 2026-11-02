// Optional activities use the documented purpose of each settlement. Their
// checkpoints retain stable indices so existing local-request saves migrate.
const REQUEST_TASKS={
 brookstead:[['Clear the bridge-side path','The bridge approach is clear for travelers.','repair'],['Secure the lane marker','The lane marker is standing securely.','repair'],['Check the upper footpath','The upper footpath is safe to use.','inspect']],
 fern:[['Gather shadeleaf by the trail','A fresh bundle of common medicinal leaves.','gather'],['Gather the second herb bundle','Enough leaves for the gathering pavilion.','gather'],['Deliver herbs to the pavilion','The herbs are ready for the settlement healers.','deliver',[0,1]]],
 highmere:[['Collect the aid parcel','The parcel is ready to carry to the public court.','collect'],['Deliver to the aid courtyard','The courtyard staff have the supplies.','deliver',[0]],['Check the distribution ledger','The delivery has been recorded.','record',[1]]],
 alder:[['Collect the west orchard basket','Fresh fruit from the orchard path.','gather'],['Collect the east orchard basket','The second basket is ready for the kitchen.','gather'],['Deliver fruit to the shelter','The shelter kitchen has both baskets.','deliver',[0,1]]],
 relief:[['Sort the clean cloth','Clean cloth is separated and ready for arrivals.','repair'],['Prepare the supply station','The supplies are arranged within easy reach.','deliver'],['Check the observation notes','The arrival notes are up to date.','record']],
 harbor:[['Retie the west mooring','The west mooring is secure.','repair'],['Retie the east mooring','The east mooring is secure.','repair'],['Record the quay inspection','Both moorings are ready for the next arrival.','record',[0,1]]],
 patrol:[['Check the lower trail sign','The lower trail is clearly marked.','inspect'],['Repair the upper trail marker','The upper marker is secure.','repair'],['Record the watch path','The watch path survey is complete.','record',[0,1]]]
};
for(const[key,spec]of Object.entries(LOCAL_REQUESTS16)){
 spec.tasks=(REQUEST_TASKS[key]??[['Sketch the approach','The approach is recorded.','record'],['Examine the old stonework','The stonework is recorded without disturbing it.','inspect'],['Note the surrounding landscape','The field notes are complete.','record']]).map(([label,result,kind,requires=[]])=>({label,result,kind,requires}));
 if(key==='fern')spec.text='Gather two bundles of common medicinal leaves, then carry them to the gathering pavilion.';
 if(key==='highmere')spec.text='Collect the aid parcel, deliver it to the public courtyard, and record the delivery.';
 if(key==='alder')spec.text='Collect both orchard baskets, then deliver the fruit to the shelter kitchen.';
 if(key==='harbor')spec.text='Secure both moorings, then record the completed quay inspection.';
}
function requestTaskReady(o){const spec=LOCAL_REQUESTS16[o.requestKey],task=spec?.tasks[o.taskIndex],q=requestState16(o.requestKey);return !!task&&task.requires.every(i=>q.done.includes(i));}
function startLocalRequestWork(o){
 if(localRequests16.work||!requestTaskReady(o))return;
 const task=LOCAL_REQUESTS16[o.requestKey].tasks[o.taskIndex];player.face=facingForMotion(o.x-player.x,o.z-player.z);player.speed=0;route=null;waypoint=null;
 localRequests16.work={world,state,target:o,time:0,duration:task.kind==='repair'?1.8:task.kind==='record'?1.25:.9};state.mode='localWork';toast(task.label+'…');
}
function updateLocalRequestWork(dt){
 const work=localRequests16.work;if(!work)return;
 if(work.world!==world||work.state!==state||battle||dialogue){localRequests16.work=null;if(state.mode==='localWork')state.mode='explore';return;}
 work.time+=dt;if(work.time<work.duration)return;
 const o=work.target,q=requestState16(o.requestKey),task=LOCAL_REQUESTS16[o.requestKey].tasks[o.taskIndex];
 localRequests16.work=null;state.mode='explore';if(q.done.includes(o.taskIndex))return;
 q.done.push(o.taskIndex);state.trackedRequest16=o.requestKey;playSound(task.kind==='repair'?'repair':'ui-confirm',.3);showSpeechBubble(player,task.result);
 toast(q.done.length===3?'Local request ready · Return to the notice for your reward.':q.done.length+' / 3 · '+LOCAL_REQUESTS16[o.requestKey].title);
 refreshRequestProps16();localRequests16.signature='';autoSave();
}

function requestTaskAnchor(key,index,fallback,start,used){
 const task=LOCAL_REQUESTS16[key].tasks[index],facility=world.userData.facility18;let preferred=fallback;
 if(task.kind==='deliver'&&facility?.w)preferred={x:facility.x,z:facility.z+facility.d*.5+1.8};
 else if(key==='highmere'&&index===1){const [x,z]=INTERACTION_POS.mira;preferred={x:x+5,z:z+4};}
 else if(key==='highmere'&&index===2){const p=AT('archives');preferred={x:p.x+5,z:p.z+8};}
 if(preferred&&staticFree(preferred.x,preferred.z,.65)&&!waterGround(preferred.x,preferred.z)&&!used.some(p=>dist(p,preferred)<3)&&findRoute(start,preferred,[]))return preferred;
 const candidates=[];
 for(let radius=1.5;radius<=12;radius+=1.5)for(let i=0;i<16;i++){const angle=i*TAU/16,p={x:preferred.x+Math.cos(angle)*radius,z:preferred.z+Math.sin(angle)*radius};if(!staticFree(p.x,p.z,.8)||waterGround(p.x,p.z)||used.some(q=>dist(q,p)<3)||interactables.some(q=>dist(q,p)<2.8))continue;candidates.push({...p,score:radius+Math.abs(roadDistance(p.x,p.z)-2)*.2});}
 candidates.sort((a,b)=>a.score-b.score);for(const p of candidates)if(findRoute(start,p,[]))return p;
 return fallback;
}
