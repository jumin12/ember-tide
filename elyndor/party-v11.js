// Recruitment reconciles the party in place. Existing people and GPU resources
// survive a new companion joining; a story split still changes the roster.
const partyRosterStats={reconciliations:0,retained:0,created:0,removed:0};
function releasePartyActor(a){
 a.mesh.removeFromParent();a.shadow.removeFromParent();actors=actors.filter(q=>q!==a);
 a.mesh.material.map?.dispose();a.mesh.material.dispose();a.mesh.geometry.dispose();
 a.shadow.material.dispose();if(a.shadow.geometry!==a.mesh.geometry)a.shadow.geometry.dispose();
 partyRosterStats.removed++;
}
setupParty=function(point){
 const ids=[...new Set(state.members)].filter(id=>CAST[id]&&assets.sprites[id]);if(!ids.length)ids.push('bren');state.members=ids;
 const old=[player,...followers].filter(a=>a&&actors.includes(a)&&a.mesh.parent===world),identity=a=>a.characterId??a.id.replace('Ascended','');
 const anchor=safePoint({x:point[0],z:point[1]},.52),keepTrail=old[0]&&identity(old[0])===ids[0]&&dist(old[0],anchor)<.6&&trail?.length>1;
 const next=ids.map((id,i)=>{
  let a=old.find(a=>identity(a)===id);
  if(a){partyRosterStats.retained++;if(!keepTrail){a.x=anchor.x;a.z=anchor.z;}}
  else{const p=keepTrail?trailPoint(i*1.5):anchor;a=createActor(id,p.x,p.z,2.15);partyRosterStats.created++;}
  a.party=true;a.characterId=id;a.enemy=false;a.npc=false;a.mesh.visible=true;a.shadow.visible=true;
  if(a.visualId!==id&&a.id!==id)replaceActorArt(a,id);
  a.action='idle';a.speed=0;a.flinchUntil=0;a.hitFlash=0;a.route=null;a.phase??=0;return a;
 });
 for(const a of old)if(!next.includes(a))releasePartyActor(a);
 player=next[0];followers=next.slice(1);if(!keepTrail)spawnPartyTrail([anchor.x,anchor.z]);
 for(const a of next){updateActor(a,0);a.mesh.updateMatrixWorld(true);a.shadow.updateMatrixWorld(true);}
 partyRosterStats.reconciliations++;route=null;syncStoryWorld();updateHUD();
};
