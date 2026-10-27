// Camera-relative movement, complete eight-direction poses and a nonblocking party train.
const WALK_DIRECTIONS=['east','southeast','south','southwest','west','northwest','north','northeast'];
function screenBasis(){const right=V3(1,0,0).applyQuaternion(camera.quaternion);right.y=0;right.normalize();return{right,down:V3().crossVectors(right,V3(0,1,0)).normalize()};}
function facingForMotion(dx,dz){const b=screenBasis(),sx=dx*b.right.x+dz*b.right.z,sy=dx*b.down.x+dz*b.down.z;return WALK_DIRECTIONS[(Math.round(Math.atan2(sy,sx)/(Math.PI/4))+8)%8];}
function stableActorFacing(a,dx,dz){const b=screenBasis(),angle=Math.atan2(dx*b.down.x+dz*b.down.z,dx*b.right.x+dz*b.right.z),current=WALK_DIRECTIONS.indexOf(a.face),delta=current<0?Infinity:Math.atan2(Math.sin(angle-current*Math.PI/4),Math.cos(angle-current*Math.PI/4));return Math.abs(delta)<Math.PI/8+.075?a.face:WALK_DIRECTIONS[(Math.round(angle/(Math.PI/4))+8)%8];}
function actorsCollide(a,b){if(a===b||!b.mesh.visible||b.enemy)return false;if(a.party&&b.party)return false;return true;}
moveActor=function(a,dx,dz,dt,crowd=true){
 const old={x:a.x,z:a.z},free=q=>edgeFree(a,q,.36)&&(!crowd||!actors.some(o=>actorsCollide(a,o)&&dist(o,q)<(a.npc&&o.npc?.84:.75)));
 const full={x:a.x+dx,z:a.z+dz};if(free(full)){a.x=full.x;a.z=full.z;}else{
  const candidates=[{x:a.x+dx,z:a.z},{x:a.x,z:a.z+dz}].sort((p,q)=>dist(q,a)-dist(p,a));for(const q of candidates)if(dist(a,q)>.00001&&free(q)){a.x=q.x;a.z=q.z;break;}
 }
 const moved=dist(old,a);a.speed=moved/Math.max(.001,dt);if(moved>.0005){a.face=stableActorFacing(a,a.x-old.x,a.z-old.z);a.phase=(a.phase+moved/(a.npc?1.25:a.speed>4.5?2.0:1.6))%1;a.stuck=0;}else{a.speed=0;a.stuck+=dt;}
 if(a===player&&route?.length){const q=route[0];if(a.routeTarget!==q){a.routeTarget=q;a.routeStall=0;}else{const progress=dist(old,q)-dist(a,q);a.routeStall=progress>Math.max(.0005,moved*.2)?0:(a.routeStall??0)+dt;if(a.routeStall>.5)a.stuck=.6;}}
 return moved;
};
function spawnPartyTrail(point){
 const near=interactables.filter(o=>o.type==='exit').sort((a,b)=>dist(a,player)-dist(b,player))[0];let dx=1,dz=0;
 if(near&&dist(near,player)<8){dx=player.x-near.x;dz=player.z-near.z;if(Math.hypot(dx,dz)<.2){const p=currentScene().path.slice().sort((a,b)=>Math.hypot(a[0]-player.x,a[1]-player.z)-Math.hypot(b[0]-player.x,b[1]-player.z))[1];if(p){dx=p[0]-player.x;dz=p[1]-player.z;}}}
 const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const tail=[{x:player.x,z:player.z}];
 let heading=Math.atan2(-dz,-dx);
 for(let k=1;k<=70;k++){
  const prev=tail.at(-1);let best=null;
  for(const turn of[0,.22,-.22,.45,-.45,.8,-.8,1.2,-1.2]){const angle=heading+turn,q={x:prev.x+Math.cos(angle)*.12,z:prev.z+Math.sin(angle)*.12};
   if(!edgeFree(prev,q,.36)||tail.slice(0,-12).some(p=>dist(p,q)<.65))continue;
   best={q,angle};break;
  }
  if(!best)break;tail.push(best.q);heading=best.angle;
 }
 let sum=0;trail=tail.reverse().map((p,i,all)=>{if(i)sum+=dist(p,all[i-1]);return{x:p.x,z:p.z,s:sum};});trailLength=sum;
 for(const[a,i]of followers.map((a,i)=>[a,i])){const p=trailPoint((i+1)*1.5),front=trailPoint(Math.max(0,(i+1)*1.5-.3));a.x=p.x;a.z=p.z;a.party=true;a.face=facingForMotion(front.x-p.x,front.z-p.z);a.route=null;}
}
const oldSetupParty=setupParty;
setupParty=function(point){
 let spawn=[point[0],point[1]];
 // A saved position may sit inside a building after a scene-layout revision.
 // Resolve that initial placement before creating the party; live followers never teleport.
 if(!staticFree(spawn[0],spawn[1],.4)){
  let found=null;for(let r=.25;r<=15&&!found;r+=.25)for(let k=0;k<32;k++){const angle=k*TAU/32,q={x:point[0]+Math.cos(angle)*r,z:point[1]+Math.sin(angle)*r};if(staticFree(q.x,q.z,.5)&&!actors.some(a=>a.npc&&a.mesh.visible&&dist(a,q)<.9)){found=q;break;}}
  if(found)spawn=[found.x,found.z];
 }
 const removed=[player,...followers].filter(a=>a&&actors.includes(a));oldSetupParty(spawn);for(const a of removed){a.mesh.material.map.dispose();a.mesh.material.dispose();a.mesh.geometry.dispose();a.shadow.material.dispose();a.shadow.geometry.dispose();}player.party=true;player.phase=0;followers.forEach(a=>{a.party=true;a.phase=0;});spawnPartyTrail(point);};
updateFollowers=function(dt){
 for(let i=0;i<followers.length;i++){
  const a=followers[i],target=trailPoint((i+1)*1.5),gap=dist(a,target);a.speed=0;a.replan=(a.replan??0)-dt;
  if(gap<.055){a.route=null;continue;}
  const crowd=actors.filter(o=>o.npc&&o.mesh.visible),direct=edgeFree(a,target,.36)&&!crowd.some(o=>segmentDistance(o.x,o.z,[a.x,a.z],[target.x,target.z])<.77);
  let q=target;if(!direct){if(a.replan<=0||!a.route?.length){a.route=findRoute(a,target,crowd);a.replan=.35;}while(a.route?.length&&dist(a,a.route[0])<.12)a.route.shift();q=a.route?.[0];if(!q)continue;}else a.route=null;
  const d=dist(a,q);if(d<.001)continue;const speed=clamp((player.speed||3.2)+Math.max(0,gap-.2)*1.6,2.1,7),step=Math.min(d,speed*dt);moveActor(a,(q.x-a.x)/d*step,(q.z-a.z)/d*step,dt);
 }
};
