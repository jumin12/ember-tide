// Brookstead's event choreography uses the same navigable ground as exploration.
function townWorkPoint(o,a){
 if(o.type==='gate')return safePoint({x:world.userData.crank.position.x+.9,z:world.userData.crank.position.z+1.1});
 if(o.type==='pump')return safePoint({x:o.x+1.8,z:o.z+1.8});
 return null;
}
function townWildlifeExit(a,index){
 // The outer yard is west of the woodland. Town and its homes are behind us.
 for(const dx of[24,30,18])for(const dz of[-26-index*2,-33,-20,22]){
  const goal={x:Math.max(a.x+dx,-43+index*2),z:a.retreatStart.z+dz};
  if(goal.x<=a.x+10||!staticFree(goal.x,goal.z,.45))continue;
  const path=findRoute(a,goal,[]);if(path?.length&&path.every(p=>p.x>a.retreatStart.x-1&&p.x>-78))return goal;
 }
 return null;
}
function notifyTownElder(){
 if(state.flags.prologue_complete||world.userData.elderEscort)return;
 const actor=npcs.find(a=>a.id==='elder');if(!actor)return;
 actor.scripted=true;actor.route=null;actor.action='walk';actor.task='Checking on the residents in the outer yard';
 world.userData.elderEscort={actor,phase:'waiting',goal:safePoint({x:-71,z:94}),route:null,replan:0};
}
function beginElderApproach(){
 notifyTownElder();const e=world.userData.elderEscort;if(!e)return;
 e.phase='approach';e.route=null;e.replan=0;state.mode='scene';keys.clear();route=null;
 $('#letterbox').classList.add('active');
}
function releaseTownElder(){
 const e=world.userData.elderEscort;if(!e)return;
 e.actor.scripted=false;e.actor.workRoute=[{x:e.actor.x,z:e.actor.z},{x:e.actor.x-2,z:e.actor.z+1}];e.actor.home={x:e.actor.x,z:e.actor.z};e.actor.route=null;e.actor.wait=3;
 world.userData.elderEscort=null;$('#letterbox').classList.remove('active');
}
function updateTownEvents(dt){
 if(menu||dialogue||transition||state.mode==='title')return;
 const e=world.userData.elderEscort;
 if(!e){if(currentBeat()[0]==='aftermath'&&!state.flags.prologue_complete&&!battle)beginElderApproach();return;}
 const a=e.actor;if(!actors.includes(a))return;
 if(e.phase==='approach'&&battle)return;
 if(e.phase==='approach'){
  const dx=a.x-player.x,dz=a.z-player.z,d=Math.hypot(dx,dz)||1;
  const candidate={x:player.x+dx/d*2.1,z:player.z+dz/d*2.1};
  if(staticFree(candidate.x,candidate.z,.43))e.goal=candidate;
 }
 const goal=e.goal;e.replan-=dt;
 if(dist(a,goal)<.24){
  a.speed=0;a.action='idle';
  if(e.phase==='approach'){
   a.face=facingForMotion(player.x-a.x,player.z-a.z);player.face=facingForMotion(a.x-player.x,a.z-player.z);
   e.phase='talking';world.userData.elderReportReady=true;
   const report=interactables.find(o=>o.type==='aftermath');report.x=a.x;report.z=a.z;report.actor=a;report.actorId='elder';
   $('#letterbox').classList.remove('active');state.mode='explore';act(report);
  }
  return;
 }
 if(!e.route?.length||a.stuck>.35&&e.replan<=0){e.route=findRoute(a,goal,actors.filter(o=>o.npc&&o!==a&&o.mesh.visible));e.replan=.7;a.stuck=0;}
 while(e.route?.length&&dist(a,e.route[0])<.14)e.route.shift();
 if(e.route?.length){const q=e.route[0],d=dist(a,q),step=Math.min(d,(e.phase==='approach'?4.8:4)*dt);moveActor(a,(q.x-a.x)/d*step,(q.z-a.z)/d*step,dt);}
 if(a.interaction){a.interaction.x=a.x;a.interaction.z=a.z;}
}

// Mirrored edge texels join continuously; low-frequency variation in the
// ground shader breaks repetition without smoothing away native art pixels.
const assetsBeforeSurfaceBlend=loadAssets;
loadAssets=async function(){await assetsBeforeSurfaceBlend();for(const key of ['grass','earth','rock','bark','cobble']){textures[key].wrapS=textures[key].wrapT=THREE.MirroredRepeatWrapping;textures[key].needsUpdate=true;}};

const scoutObjective=BEATS.find(b=>b[0]==='patrol');scoutObjective[2]='Help the unsteady scout';scoutObjective[3]='Help Tavin bring the scout to safe ground and check the dimming Light.';
