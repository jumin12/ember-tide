// Stable entrance IDs connect traversal-side approaches with authored local
// road thresholds. Every location uses the same resolver and safe fallback.
const travel64={pending:null,last:null,registry:{},warnings:[],history:[]};
function cardinal64(dx,dz){return Math.abs(dx)>Math.abs(dz)?dx>0?'east':'west':dz>0?'south':'north';}
function travelWarning64(key,message){const text=key+': '+message;if(!travel64.warnings.includes(text)){travel64.warnings.push(text);if(travel64.warnings.length>40)travel64.warnings.shift();}}
function entranceDescriptors64(key){
 if(travel64.registry[key])return travel64.registry[key];
 const gates=levels39.plans.get(key)?.gates??[];
 const rows=gates.map((g,i)=>({id:key+':'+cardinal64(...g.dir)+':'+i,index:i,side:cardinal64(...g.dir),dir:[...g.dir],x:g.x,z:g.z}));
 if(!rows.length){const p=POIS[key];travelWarning64(key,'No named thresholds; using the designated default spawn.');if(p)rows.push({id:key+':default',index:0,side:cardinal64(p.exit[0]-p.spawn[0],p.exit[1]-p.spawn[1]),dir:[0,1],x:p.exit[0],z:p.exit[1],fallback:true});}
 return travel64.registry[key]=rows;
}
for(const key of Object.keys(POIS))entranceDescriptors64(key);
function resolveEntrance64(key,vector,id=null){
 const rows=entranceDescriptors64(key);if(id){const named=rows.find(g=>g.id===id);if(named)return named;travelWarning64(key,'Unknown entrance '+id+'; using the default entrance.');return rows[0];}
 if(rows.length<2||!vector||Math.hypot(...vector)<.01)return rows[0];
 const length=Math.hypot(...vector),dx=vector[0]/length,dz=vector[1]/length;
 return [...rows].sort((a,b)=>(b.dir[0]*dx+b.dir[1]*dz)-(a.dir[0]*dx+a.dir[1]*dz)||a.index-b.index)[0];
}
const enterBefore64=enterPoi;
enterPoi=function(key,id=null){
 if(activeScene?.kind!=='overworld'||!POIS[key])return enterBefore64(key);
 if(key==='snow'&&!['snow','complete'].includes(currentBeat()[0]))return enterBefore64(key);
 const center=worldEntrancePoint45(key),vector=[player.x-center.x,player.z-center.z],gate=resolveEntrance64(key,vector,id);
 travel64.pending={kind:'poi',poi:key,entrance:gate?.id,side:gate?.side,approach:cardinal64(...vector)};
 enterBefore64(key);return window.journeyGraphicsReady;
};
const returnBefore64=returnToOverworld;
returnToOverworld=function(...args){
 if(activeScene?.kind!=='poi')return returnBefore64(...args);
 const key=activeScene.key,o=poiDeparture.confirming??nearbyDeparture(),rows=entranceDescriptors64(key),gate=rows.find(g=>g.id===o?.entranceId64)??(o?resolveEntrance64(key,o.autoDir39):rows[0]);
 travel64.pending={kind:'overworld',poi:key,entrance:gate?.id,side:gate?.side};
 returnBefore64(...args);return window.journeyGraphicsReady;
};
const settleBefore64=settleDepartureOnWorld;
settleDepartureOnWorld=function(...args){if(travel64.pending?.kind==='overworld'){poiDeparture.arriving=null;return;}return settleBefore64(...args);};
function worldSpawn64(key,gate){
 const center=worldEntrancePoint45(key),dir=gate.dir,len=Math.hypot(...dir)||1,dx=dir[0]/len,dz=dir[1]/len,radius=POIS[key].kind==='town'?32:19,candidates=[],r=Math.max(.7,actorRadius(player)+.1);
 for(const reach of[radius,radius-5,radius+5,radius-10,radius+10,9,14])for(const across of[0,-3,3,-6,6,-10,10]){
  const p={x:center.x+dx*reach-dz*across,z:center.z+dz*reach+dx*across};
  if(cardinal64(p.x-center.x,p.z-center.z)!==gate.side||!staticFree(p.x,p.z,r))continue;
  if(!edgeFree(p,{x:p.x-dx*3,z:p.z-dz*3},r))continue;
  candidates.push({...p,score:Math.abs(reach-radius)+Math.abs(across)*1.5+Math.min(12,roadDistance(p.x,p.z))*.5});
 }
 candidates.sort((a,b)=>a.score-b.score);return candidates[0]??null;
}
function applyEntranceSpawn64(request){
 const key=request.poi,rows=entranceDescriptors64(key),gate=rows.find(g=>g.id===request.entrance)??rows[0];let point=null,fallback=false;
 if(request.kind==='poi'){
  const o=world.userData.poiDepartures?.find(o=>o.entranceId64===gate?.id);
  if(o){const d=o.autoDir39;for(const reach of[7.5,9,11,13,16])for(const across of[0,-1,1,-2,2]){
   const p={x:o.x-d[0]*reach-d[1]*across,z:o.z-d[1]*reach+d[0]*across};
   if(!point&&staticFree(p.x,p.z,actorRadius(player)+.1)&&edgeFree(p,{x:p.x-d[0]*2,z:p.z-d[1]*2},.5))point=p;
  }}
 }else if(gate)point=worldSpawn64(key,gate);
 if(!point){fallback=true;travelWarning64(key,'No safe position for '+request.entrance+'; using the designated default.');const p=request.kind==='poi'?POIS[key].spawn:[POIS[key].node[0],POIS[key].node[1]+16];point=safePoint({x:p[0],z:p[1]},actorRadius(player)+.1);}
 setupParty([point.x,point.z]);player.face=facingForMotion(request.kind==='poi'?-gate.dir[0]:gate.dir[0],request.kind==='poi'?-gate.dir[1]:gate.dir[1]);for(const a of[player,...followers])updateActor(a,0);
 updateCamera(1,true);updateHUD();
 travel64.last={...request,side:gate?.side,x:player.x,z:player.z,fallback};travel64.history.push(travel64.last);if(travel64.history.length>50)travel64.history.shift();world.userData.directionalArrival64=travel64.last;
}
const buildTravelBefore64=buildWorld;
buildWorld=function(...args){
 const result=buildTravelBefore64(...args);
 if(activeScene?.kind==='poi'){
  const key=activeScene.key,rows=(world.userData.poiDepartures??[]).map((o,i)=>{const side=cardinal64(...o.autoDir39),id=key+':'+side+':'+i;o.entranceId64=id;return{id,index:i,side,dir:[...o.autoDir39],x:o.x,z:o.z};});
  if(rows.length)travel64.registry[key]=rows;else travelWarning64(key,'No live POI thresholds were generated.');
 }
 const request=travel64.pending;
 if(request&&(request.kind==='poi'&&activeScene.kind==='poi'&&activeScene.key===request.poi||request.kind==='overworld'&&activeScene.kind==='overworld')){travel64.pending=null;applyEntranceSpawn64(request);}
 return result;
};
const changeTravelBefore64=changeJourneyScene;
changeJourneyScene=function(...args){
 const request=travel64.pending,task=changeTravelBefore64(...args);
 return Promise.resolve(task).finally(()=>{if(travel64.pending===request)travel64.pending=null;});
};
