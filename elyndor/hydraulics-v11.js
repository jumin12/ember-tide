// The closed sluice holds a reservoir. Opening it discharges the stored head
// through the gate; the repaired pump then sustains the settlement's supply.
brookHydraulics.head={value:6.15};
const waterworksBeforeHead=buildWorkingCanal;
INTERACTION_POS.gate=[-158.6,68.5];
buildWorkingCanal=function(){
 waterworksBeforeHead();const crank=world.userData.crank;if(!crank)return;
 crank.position.set(-158.6,groundAt(-158.6,68.5)+1.3,68.5);
 for(const c of colliders)if(c.type==='winch'&&Math.abs(c.z-70)<.1){c.x=-158.6;c.z=68.5;}
 beam(crank.position.clone(),V3(brookChannel(70)+4.9,6.8,70),.06,'metal','#8b9c9e');
};
const worldBeforeMovingWater=buildWorld;
buildWorld=function(...args){worldBeforeMovingWater(...args);for(const o of [world.userData.gate,world.userData.crank,world.userData.waterwheel,...world.userData.waterPools??[],...world.userData.brookFallObjects??[]])if(o){o.matrixAutoUpdate=true;o.updateMatrix();}};
const advanceBeforeReservoir=updateWorldFX;let lastSluiceMist=-1;
updateWorldFX=function(dt){
 advanceBeforeReservoir(dt);const pool=world.userData.waterPools?.find(p=>p.userData.waterRole==='reservoir'),fall=world.userData.brookFallObjects?.find(p=>p.userData.join.z===70);if(!pool||!fall)return;
 const target=state.flags.gate_open?(state.flags.pump_repaired?4.68:4.85):6.15,head=mix(brookHydraulics.head.value,target,1-Math.exp(-dt*.22)),delta=head-pool.position.y;brookHydraulics.head.value=head;
 if(Math.abs(delta)>.00001){
  pool.position.y=head;pool.userData.poolBounds.min.y+=delta;pool.userData.poolBounds.max.y+=delta;
  for(let i=0;i<pool.userData.levelPatchCount;i++){pool.userData.poolPatches[i].min.y+=delta;pool.userData.poolPatches[i].max.y+=delta;}
  const g=fall.geometry,p=g.attributes.position,n=g.attributes.normal,join=fall.userData.join;fall.position.y=head;join.top=head;
  for(let row=0;row<=32;row++){const t=row/32,y=(join.bottom-head)*t*t*(3-2*t),normal=V3(0,1,-(join.bottom-head)*6*t*(1-t)/(join.halfSpan*2)).normalize();for(let col=0;col<13;col++){const i=row*13+col;p.setY(i,y);n.setXYZ(i,normal.x,normal.y,normal.z);}}
  p.needsUpdate=n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();fall.userData.joinBounds.copy(g.boundingBox).translate(fall.position);
 }
 if(state.flags.gate_open&&brookHydraulics.flow.value>.1&&clock-lastSluiceMist>.12&&Math.hypot(player.x-fall.position.x,player.z-70)<45){lastSluiceMist=clock;emitParticles('smoke',V3(fall.position.x+(Math.random()-.5)*5,4.8,70.7),'#b9d9dc',1,.35,{size:.3,endSize:1.1,speed:.28,gravity:-.12,duration:.85});}
};
