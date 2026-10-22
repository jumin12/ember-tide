// Whole-pose locomotion is driven by distance actually traveled, never desired velocity.
let partyBreadcrumbs=[],partyTrailOwner=null,partyTrailLength=0,partyHeading={x:1,z:0};
function navEdgeClear(k,q){const lo=Math.min(k,q),hi=Math.max(k,q),key=lo*nav.grid.length+hi,cache=nav.edgeClear||(nav.edgeClear=new Map());if(cache.has(key))return cache.get(key);const position=i=>({x:nav.minX+i%nav.nx*nav.step,z:nav.minZ+Math.floor(i/nav.nx)*nav.step}),a=position(k),b=position(q),clear=canTraverse(a.x,a.z,b.x,b.z,.44);cache.set(key,clear);return clear;}
function resetPartyTrail(){
 partyBreadcrumbs=[];partyTrailOwner=player;partyTrailLength=0;if(!player||!companion)return;
 const start={x:companion.x,z:companion.z};let path=canTraverse(start.x,start.z,player.x,player.z,.4)?[{x:player.x,z:player.z}]:findPath(start,player);
 partyBreadcrumbs.push({...start,s:0});for(const p of path){const last=partyBreadcrumbs.at(-1),d=Math.hypot(p.x-last.x,p.z-last.z);if(d>.001){partyTrailLength+=d;partyBreadcrumbs.push({...p,s:partyTrailLength})}}
 companion.followS=0;companion.followRunning=false;companion.detour=null;companion.followBlocked=0;
}
function followerDetour(targetS){const rejoin=targetS;let end=partyBreadcrumbs.find(p=>p.s>=rejoin)||partyBreadcrumbs.at(-1),best=end;for(const offset of [0,.8,-.8,1.3,-1.3]){const p={x:end.x+offset,z:end.z};if(!staticBlocked(p.x,p.z,.44)&&villageActors.every(a=>Math.hypot(p.x-a.x,p.z-a.z)>1.08)){best=p;break}}
 // Quarter-unit local cells reveal passing space that the broad world grid misses.
 const step=.25,minX=Math.max(sceneBounds.minX,Math.floor((Math.min(companion.x,best.x)-6.5)/step)*step),minZ=Math.max(sceneBounds.minZ,Math.floor((Math.min(companion.z,best.z)-6.5)/step)*step),maxX=Math.min(sceneBounds.maxX,Math.max(companion.x,best.x)+6.5),maxZ=Math.min(sceneBounds.maxZ,Math.max(companion.z,best.z)+6.5),nx=Math.ceil((maxX-minX)/step)+1,nz=Math.ceil((maxZ-minZ)/step)+1,grid=new Uint8Array(nx*nz),heights=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=minX+i*step,z=minZ+j*step,k=j*nx+i;heights[k]=heightAt(x,z);grid[k]=!staticBlocked(x,z,.44)&&villageActors.every(a=>Math.hypot(x-a.x,z-a.z)>1.06)?1:0;}
 const saved=nav;nav={step,minX,minZ,nx,nz,grid,heights};let route;try{route=findPath(companion,best)}finally{nav=saved}return route?.length?{route,s:end.s}:null;
}
function updatePartyTrail(dt){
 if(!player||!companion||arenaActive)return;if(partyTrailOwner!==player||!partyBreadcrumbs.length)resetPartyTrail();
 const last=partyBreadcrumbs.at(-1),distance=Math.hypot(player.x-last.x,player.z-last.z);if(distance>3){resetPartyTrail();return}
 if(distance>.025){partyHeading={x:(player.x-last.x)/distance,z:(player.z-last.z)/distance};partyTrailLength+=distance;partyBreadcrumbs.push({x:player.x,z:player.z,s:partyTrailLength})}
 const targetS=Math.max(0,partyTrailLength-1.85),lag=targetS-companion.followS;companion.walk=0;
 if(lag<.035){companion.followRunning=false;return}
 const leadRunning=!!keys.shift&&player.walk>0;companion.followRunning=leadRunning||lag>3.5;
 let budget=Math.min(lag,dt*(lag>5?8.2:companion.followRunning?6.4:Math.min(4.1,2.8+lag*.6))),moved=0;
 if(companion.detour){const detour=companion.detour;while(detour.route.length&&Math.hypot(detour.route[0].x-companion.x,detour.route[0].z-companion.z)<.035)detour.route.shift();const p=detour.route[0];if(!p){companion.followS=detour.s;companion.detour=null;return}const dx=p.x-companion.x,dz=p.z-companion.z,d=Math.hypot(dx,dz),step=Math.min(d,budget),nx=companion.x+dx/d*step,nz=companion.z+dz/d*step;if(canTraverse(companion.x,companion.z,nx,nz,.4)&&villageActors.every(a=>Math.hypot(nx-a.x,nz-a.z)>1.0)){moveActor(companion,nx,nz);setFacing(companion,dx,dz);companion.walk=1;companion.followBlocked=0}else{companion.followBlocked+=dt;if(companion.followBlocked>.5){companion.detour=followerDetour(targetS);companion.followBlocked=0}}return;}
 while(budget>.0001){const next=partyBreadcrumbs.find(p=>p.s>companion.followS+.001);if(!next)break;const dx=next.x-companion.x,dz=next.z-companion.z,d=Math.hypot(dx,dz);if(d<.015){companion.followS=next.s;continue}const amount=Math.min(budget,d),nx=companion.x+dx/d*amount,nz=companion.z+dz/d*amount;
  if(!canTraverse(companion.x,companion.z,nx,nz,.4)||villageActors.some(a=>Math.hypot(nx-a.x,nz-a.z)<1.0))break;
  moveActor(companion,nx,nz);setFacing(companion,dx,dz);companion.followS+=amount;budget-=amount;moved+=amount;
 }
 companion.walk=moved>.00015?1:0;companion.followBlocked=moved>.00015?0:(companion.followBlocked||0)+dt;if(companion.followBlocked>.45&&nav){companion.detour=followerDetour(targetS);companion.followBlocked=0}while(partyBreadcrumbs.length>2&&partyBreadcrumbs[1].s<companion.followS-3)partyBreadcrumbs.shift();
}

// Solid, alpha-cutout billboard meshes receive real renderer lighting and shadow maps.
const oldMotionActor=makeActor;
makeActor=function(index,x,z,scale=2.5){const a=oldMotionActor(index,x,z,scale),old=a.mesh,tex=old.material.map,centerY=old.center.y,geometry=new THREE.PlaneGeometry(1,1);geometry.translate(0,.5-centerY,0);
 const material=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xb4c8dd,emissiveIntensity:.15,color:0xffffff,roughness:1,metalness:0,alphaTest:.42,transparent:false,side:THREE.DoubleSide});
 material.shadowSide=THREE.FrontSide;const m=new THREE.Mesh(geometry,material);m.center=new THREE.Vector2(.5,centerY);m.position.copy(old.position);m.scale.copy(old.scale);m.quaternion.copy(camera.quaternion);m.receiveShadow=m.castShadow=true;m.frustumCulled=false;m.userData.actorIndex=index;world.remove(old);old.material.dispose();world.add(m);a.mesh=m;a.litSprite=true;a.gait=0;
 // The visible cutout is also the caster. No coplanar helper can stripe the sprite.
 if(a.caster){a.caster.castShadow=false;a.caster.material.visible=false;}a.shadow.material.map=assets.glow;a.shadow.material.needsUpdate=true;return a;
};
const rawMotionTexture=textureFromCanvas;
textureFromCanvas=function(c){const t=rawMotionTexture(c);t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.generateMipmaps=false;t.minFilter=t.magFilter=THREE.NearestFilter;return t};

function villagerRadius(a){return a.index===10||a.index===11?.44:.51}
function crowdClear(a,x,z,margin=0){return [...villageActors,player,companion].every(b=>b===a||!b?.mesh.visible||Math.hypot(x-b.x,z-b.z)>=villagerRadius(a)+villagerRadius(b)+margin)}
function taskDestination(a,task){const candidates=[{x:task[0],z:task[1]}];for(const r of [.8,1.2,1.6])for(let i=0;i<8;i++)candidates.push({x:task[0]+Math.cos(i*Math.PI/4)*r,z:task[1]+Math.sin(i*Math.PI/4)*r});return candidates.find(p=>!staticBlocked(p.x,p.z,.45)&&crowdClear(a,p.x,p.z,.07))||candidates[0]}
function crowdRoute(a,dest){const saved=nav.grid,grid=saved.slice(),others=[...villageActors,player,companion].filter(b=>b!==a&&b?.mesh.visible);for(let k=0;k<grid.length;k++)if(grid[k]){const x=nav.minX+k%nav.nx*nav.step,z=nav.minZ+Math.floor(k/nav.nx)*nav.step;if(others.some(b=>Math.hypot(x-b.x,z-b.z)<villagerRadius(a)+villagerRadius(b)+.08))grid[k]=0;}nav.grid=grid;let path;try{path=findPath(a,dest)}finally{nav.grid=saved}return path?.length?path:findPath(a,dest);}
function beginVillagerRoute(a){const l=a.life,task=l.plan.tasks[l.index],dest=taskDestination(a,task);l.destination=dest;l.path=crowdRoute(a,dest);l.phase='walking';l.activity='Walking · '+task[2].toLowerCase();l.blockedFor=0;l.waypointAge=0;l.previousPathCount=l.path.length;}
updateVillageLife=function(dt){
 if(!nav||arenaActive||!['explore','dialog','title'].includes(state.mode))return;
 const snapshot=new Map(villageActors.map(a=>[a,{x:a.x,z:a.z,vx:a.crowdVX||0,vz:a.crowdVZ||0}])),moves=[];
 for(const a of villageActors){const l=a.life,p=l.plan;a.walk=0;
  if((state.mode==='dialog'&&Math.hypot(player.x-a.x,player.z-a.z)<3)||a.wait>1){a.wait=Math.max(0,a.wait-dt);continue}
  if(l.phase==='working'){a.crowdVX=a.crowdVZ=0;l.remaining-=dt;const face=workFacing[a.index]?.[l.index];if(face)a.face=face;if(l.remaining<=0){l.index=(l.index+1)%p.tasks.length;beginVillagerRoute(a)}continue}
  while(l.path.length&&Math.hypot(l.path[0].x-a.x,l.path[0].z-a.z)<.11)l.path.shift();if(l.path.length>1&&Math.hypot(l.path[0].x-a.x,l.path[0].z-a.z)<1.3&&villageActors.some(b=>b!==a&&Math.hypot(l.path[0].x-b.x,l.path[0].z-b.z)<1.15)&&canTraverse(a.x,a.z,l.path[1].x,l.path[1].z,.44))l.path.shift();
  l.waypointAge=l.previousPathCount!==l.path.length?0:(l.waypointAge||0)+dt;l.previousPathCount=l.path.length;if(l.waypointAge>2.5){beginVillagerRoute(a);continue}const goal=l.path[0];
  if(!goal){const task=p.tasks[l.index];l.phase='working';l.activity=task[2];l.remaining=task[3];l.completed++;continue}
  const dx=goal.x-a.x,dz=goal.z-a.z,d=Math.hypot(dx,dz),ux=dx/d,uz=dz/d,maxSpeed=Math.min(p.speed||1.13,d/Math.max(.001,dt));let best=null,bestScore=-Infinity;
  const neighbors=[...villageActors,player,companion].filter(b=>b!==a&&b?.mesh.visible&&Math.hypot(a.x-b.x,a.z-b.z)<3.2);
  for(const turn of [0,-.34,.34,-.68,.68,-1.05,1.05,-1.5,1.5])for(const rate of [1,.5]){const cs=Math.cos(turn),sn=Math.sin(turn),vx=(ux*cs-uz*sn)*maxSpeed*rate,vz=(ux*sn+uz*cs)*maxSpeed*rate,nx=a.x+vx*dt,nz=a.z+vz*dt;if(!canTraverse(a.x,a.z,nx,nz,.44))continue;
   let safe=true,penalty=0;for(const b of neighbors){const bs=snapshot.get(b)||b,rx=a.x-bs.x,rz=a.z-bs.z,rvx=vx-(bs.vx||0),rvz=vz-(bs.vz||0),r=villagerRadius(a)+villagerRadius(b)+.04,now=Math.hypot(rx,rz),future=Math.hypot(nx-bs.x,nz-bs.z);if(future<r&&future<now+.0001){safe=false;break}
    const t=clamp(-(rx*rvx+rz*rvz)/(rvx*rvx+rvz*rvz+.001),0,.85),close=Math.hypot(rx+rvx*t,rz+rvz*t);penalty+=Math.max(0,r+.3-close)*(1.9-t)*2.5;
   }if(!safe)continue;const score=(vx*ux+vz*uz)-Math.abs(turn)*.19-penalty+(turn<0?.018:0);if(score>bestScore){bestScore=score;best={a,x:nx,z:nz,vx,vz}}}
  if(best&&bestScore>-.65){moves.push(best);l.blockedFor=0}else{a.crowdVX=a.crowdVZ=0;l.blockedFor=(l.blockedFor||0)+dt;if(l.blockedFor>2.4)beginVillagerRoute(a)}
 }
 for(const m of moves){const a=m.a;if(!crowdClear(a,m.x,m.z,-.015))continue;const ox=a.x,oz=a.z;moveActor(a,m.x,m.z);const d=Math.hypot(a.x-ox,a.z-oz);a.crowdVX=m.vx;a.crowdVZ=m.vz;if(d>.00015){a.walk=1;const newFace=faceForVector(m.vx,m.vz);if(a.pendingFace!==newFace){a.pendingFace=newFace;a.turnHold=0}else a.turnHold=(a.turnHold||0)+dt;if(a.turnHold>.09||!a.face)a.face=newFace;}}
};
function faceForVector(dx,dz){return Math.abs(dx)>Math.abs(dz)*1.05?(dx<0?'west':'east'):(dz<0?'north':'south')}

const litLighting=applyWorldLighting;
applyWorldLighting=function(){litLighting();for(const a of actors)if(a.litSprite){a.mesh.material.color.set(heroes.some((h,i)=>h.hp<=0&&heroMeshes[i]===a)?'#67727b':'#ffffff');a.mesh.material.emissiveIntensity=.15+solar.night*.035;}}
const motionBuild=buildWorld;
buildWorld=function(area,spawn){motionBuild(area,spawn);const behind={x:player.x-partyHeading.x*1.85,z:player.z-partyHeading.z*1.85};if(!staticBlocked(behind.x,behind.z,.4)&&canTraverse(player.x,player.z,behind.x,behind.z,.4)){moveActor(companion,behind.x,behind.z);companion.previousStep={x:behind.x,z:behind.z};}player.face=companion.face=faceForVector(partyHeading.x,partyHeading.z);partyTrailOwner=null;resetPartyTrail();
 // Initial placement is settled once; subsequent crowd avoidance never teleports actors.
 for(const a of villageActors)if(!crowdClear(a,a.x,a.z,-.05)){const p=taskDestination(a,[a.x,a.z]);moveActor(a,p.x,p.z);a.previousStep={x:a.x,z:a.z};}
 sun.shadow.normalBias=.065;sun.shadow.bias=-.00045;sun.shadow.needsUpdate=true;
};
const movingUpdate=update;
update=function(dt){movingUpdate(dt);for(const a of actors)if(a.litSprite){a.mesh.quaternion.copy(camera.quaternion);a.mesh.material.emissiveMap=a.mesh.material.map;a.caster.material.visible=false;}};

const motionText=window.render_game_to_text;
window.render_game_to_text=()=>JSON.stringify({...JSON.parse(motionText()),motion:{follower:{x:+companion.x.toFixed(3),z:+companion.z.toFixed(3),trailDistance:+((partyTrailLength-(companion.followS||0))).toFixed(3),running:!!companion.followRunning},litBillboards:actors.every(a=>a.litSprite&&a.mesh.receiveShadow),crowdMinimum:villageActors.length?Math.min(...villageActors.flatMap((a,i)=>villageActors.slice(i+1).map(b=>Math.hypot(a.x-b.x,a.z-b.z)))):null}});
