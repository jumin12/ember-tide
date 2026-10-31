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
 const target=state.flags.gate_open?(state.flags.pump_repaired?4.68:4.85):6.15,head=mix(brookHydraulics.head.value,target,1-Math.exp(-dt*.055)),delta=head-pool.position.y;brookHydraulics.head.value=head;
 if(Math.abs(delta)>.00001){
  pool.position.y=head;pool.userData.poolBounds.min.y+=delta;pool.userData.poolBounds.max.y+=delta;
  for(let i=0;i<pool.userData.levelPatchCount;i++){pool.userData.poolPatches[i].min.y+=delta;pool.userData.poolPatches[i].max.y+=delta;}

 }
 // The sluice uses its own water spray; combat smoke is never emitted here.
};
