// Physical heights are world units, independent of a sprite's padded canvas.
// Human party members are approximately 2.3 units tall. Scale is shared by
// exploration, combat, shadows, selection markers and animation geometry.
const CREATURE_SPEC={
 wolf:{height:1.95,radius:.65},boar:{height:1.65,radius:.66},
 stag:{height:3.05,radius:.7},bird:{height:1.48,radius:.45},
 ogre:{height:5.7,radius:1.15},mossStone:{height:3.65,radius:.9},
 earthStone:{height:5.15,radius:1.12},wisp:{height:.92,radius:.25},
 waterWisp:{height:1.1,radius:.28}
};
function creatureHeight(id,fallback=2.3){return CREATURE_SPEC[id.replace(/Battle35$/,'')]?.height??fallback;}
function actorImpactPoint(a){return V3(a.x,heightAt(a.x,a.z)+Math.max(.65,a.size*.5),a.z);}
const REGIONAL_WILDLIFE={
 fern:['stag','bird'],depths:['wisp','mossStone'],alder:['stag','bird'],
 patrol:['bird'],alderRemnant:['mossStone','wisp'],nearbySite:['earthStone'],
 fernClearing:['stag','wisp'],alderClearing:['stag'],
 reliefClearing:['bird'],siteClearing:['waterWisp'],harbor:['bird']
};
function populateRegionalWildlife(){
 if(activeScene.kind!=='poi'||world.userData.regionalWildlife)return;
 const list=world.userData.regionalWildlife=[],key=activeScene.key,random=seeded(currentScene().seed+37019),origin={x:POIS[key].spawn[0],z:POIS[key].spawn[1]},used=[];
 for(const id of REGIONAL_WILDLIFE[key]??[]){
  if(!assets.sprites[id])continue;const species=CREATURE_SPEC[id],candidates=[];
  // Reserve story, door and travel approaches before finding a small habitat.
  for(let i=0;i<100;i++){
   const angle=random()*TAU,r=14+random()*28,x=origin.x+Math.cos(angle)*r,z=origin.z+Math.sin(angle)*r;
   if(!inSceneBounds(x,z,-5)||waterGround(x,z)||!staticFree(x,z,species.radius+.3)||roadDistance(x,z)<3.7||interactables.some(o=>Math.hypot(x-o.x,z-o.z)<9)||used.some(o=>Math.hypot(x-o.x,z-o.z)<8))continue;
   const end={x:x+Math.cos(angle+.7)*4,z:z+Math.sin(angle+.7)*4};
   if(!edgeFree({x,z},end,species.radius+.15)||waterGround(end.x,end.z))continue;
   candidates.push({x,z,end});
  }
  const p=candidates[0];if(!p)continue;used.push(p);
  const a=createActor(id,p.x,p.z);a.wildlife=true;a.habitat={from:{x:p.x,z:p.z},to:p.end,forward:true,wait:random()*4};a.face='east';list.push(a);
 }
}
function updateRegionalWildlife(dt){
 if(state.mode!=='explore'||gameLoading||battle||dialogue||menu||eventAction||restoration)return;
 for(const a of world.userData.regionalWildlife??[]){
  const h=a.habitat;if(dist(a,player)>90){a.speed=0;continue;}
  if(h.wait>0){h.wait-=dt;a.speed=0;continue;}
  const target=h.forward?h.to:h.from,d=dist(a,target),speed=['wisp','waterWisp'].includes(a.id)?.55:a.id==='stag'?1.15:.75;
  if(d<.2||a.stuck>.65){h.forward=!h.forward;h.wait=3+(Math.sin(a.x*3+a.z)+1)*2;a.stuck=0;a.speed=0;continue;}
  moveActor(a,(target.x-a.x)/d*Math.min(d,speed*dt),(target.z-a.z)/d*Math.min(d,speed*dt),dt,true);
  if(a.speed>.1&&clock-(a.lastFoley??-10)>2.4){
   if(['mossStone','earthStone'].includes(a.id))playSound('stone-heavy-step',Math.max(0,1-dist(a,player)/24)*.2);
   else if(a.id==='bird')playSound('forest-wing-rustle',Math.max(0,1-dist(a,player)/18)*.12);
   a.lastFoley=clock;
  }
 }
}
