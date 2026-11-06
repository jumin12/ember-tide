// Resolve arrivals against completed scenes. Miniature construction must not
// replace the shared exit rule, or apply a spawn before its local gates exist.
const arrivals70={queued:null,applying:false,approaches:new Map(),audit:[],world:null};
function registerEntrances70(){
 if(activeScene?.kind!=='poi')return;
 const key=activeScene.key,rows=(world.userData.poiDepartures??[]).map((o,i)=>{const side=cardinal64(...o.autoDir39),id=key+':'+side+':'+i;o.entranceId64=id;return{id,index:i,side,dir:[...o.autoDir39],x:o.x,z:o.z};});
 if(!rows.length&&state.mode==='title')return;
 if(rows.length)travel64.registry[key]=rows;else travelWarning64(key,'Completed location has no named exit; designated default will be used.');
 const errors=rows.filter(g=>!Number.isFinite(g.x+g.z)||Math.hypot(...g.dir)<.5);
 arrivals70.audit=arrivals70.audit.filter(a=>a.key!==key);arrivals70.audit.push({key,entrances:rows.map(g=>({id:g.id,side:g.side})),errors:errors.map(g=>g.id)});
}
const actualArrivalBefore70=applyEntranceSpawn64;
applyEntranceSpawn64=function(request){arrivals70.queued=request;};
function completeArrival70(){
 const q=arrivals70.queued;if(!q||arrivals70.applying)return;
 if(q.kind==='poi'&&(activeScene.kind!=='poi'||activeScene.key!==q.poi)||q.kind==='overworld'&&activeScene.kind!=='overworld')return;
 arrivals70.queued=null;arrivals70.applying=true;
 try{registerEntrances70();actualArrivalBefore70(q);world.userData.directionalArrival70={...travel64.last,completedScene:true};}finally{arrivals70.applying=false;}
}
const arrivalBuildBefore70=buildWorld;
buildWorld=function(...args){const pending=travel64.pending,r=arrivalBuildBefore70(...args);registerEntrances70();if(pending&&(pending.kind==='poi'&&activeScene.kind==='poi'&&activeScene.key===pending.poi||pending.kind==='overworld'&&activeScene.kind==='overworld')){arrivals70.queued=pending;travel64.pending=null;}completeArrival70();if(activeScene?.kind==='overworld'){arrivals70.world=world;arrivals70.approaches.clear();}return r;};
const arrivalGraphicsBefore70=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){completeArrival70();return arrivalGraphicsBefore70(...args);};

// Remember the approach outside the interaction zone, before the last few
// steps across the gateway can reverse the sign of a nearly-zero offset.
const approachMoveBefore70=moveActor;
moveActor=function(a,...args){
 if(a===player&&activeScene?.kind==='overworld'&&!battle){
  for(const o of interactables)if(o.type==='location'){
   const c=worldEntrancePoint45(o.poi),dx=a.x-c.x,dz=a.z-c.z,d=Math.hypot(dx,dz),radius=o.diorama67?5.5:12;
   if(d>=radius+.5&&d<radius+14)arrivals70.approaches.set(o.poi,{vector:[dx,dz],world});
  }
 }return approachMoveBefore70(a,...args);
};
const approachEnterBefore70=enterPoi;
enterPoi=function(key,id=null){
 if(activeScene?.kind!=='overworld'||!POIS[key])return approachEnterBefore70(key,id);
 const c=worldEntrancePoint45(key),stored=arrivals70.approaches.get(key),vector=stored?.world===world?stored.vector:[player.x-c.x,player.z-c.z],gate=resolveEntrance64(key,vector,id);
 return approachEnterBefore70(key,gate?.id);
};
const miniatureReturnBefore70=returnToOverworld;
returnToOverworld=function(...args){
 if(activeScene?.kind!=='poi')return miniatureReturnBefore70(...args);
 registerEntrances70();const key=activeScene.key,o=poiDeparture.confirming??nearbyDeparture(),rows=entranceDescriptors64(key),gate=rows.find(g=>g.id===o?.entranceId64)??resolveEntrance64(key,o?.autoDir39);
 travel64.pending={kind:'overworld',poi:key,entrance:gate?.id,side:gate?.side};return miniatureReturnBefore70(...args);
};
worldSpawn64=function(key,gate){
 const site=dioramas67.sites.get(key),centre=site?{x:site.x,z:site.z}:worldEntrancePoint45(key),entry=worldEntrancePoint45(key),dir=gate.dir,len=Math.hypot(...dir)||1,dx=dir[0]/len,dz=dir[1]/len,r=Math.max(.7,actorRadius(player)+.1),candidates=[];
 const half=site?(Math.abs(dx)*(Math.abs(Math.cos(site.a))*site.w+Math.abs(Math.sin(site.a))*site.d)+Math.abs(dz)*(Math.abs(Math.sin(site.a))*site.w+Math.abs(Math.cos(site.a))*site.d))/2:12;
 for(const reach of[half+4,half+7,half+11,half+16,half+22,half+30])for(const across of[0,-3,3,-6,6,-10,10,-16,16]){
  const p={x:centre.x+dx*reach-dz*across,z:centre.z+dz*reach+dx*across};
  if(cardinal64(p.x-centre.x,p.z-centre.z)!==gate.side||!staticFree(p.x,p.z,r)||waterGround(p.x,p.z)||!edgeFree(p,{x:p.x+dx*2,z:p.z+dz*2},r))continue;
  candidates.push({...p,score:Math.abs(reach-half-7)+Math.abs(across)*.8+Math.min(20,roadDistance(p.x,p.z))});
 }
 candidates.sort((a,b)=>a.score-b.score);return candidates.find(p=>edgeFree(p,entry,r)||!!findRoute(p,entry,[]))??null;
};

// Only the miniature traversal party uses the longer train. Local following,
// collision radii, animation scale and walking speed retain their own rules.
function overworldPartyGap70(){return 12.5;}
function partyTrailBudget70(){return compactWorld44()?Math.max(35,(followers.length+1)*overworldPartyGap70()+12):35;}
trailPoint=function(d){return compactTrailBefore44(compactWorld44()?d/1.5*overworldPartyGap70():d);};
