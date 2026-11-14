// The party walks along arc-length paths. The opaque portal itself occludes
// each companion at the threshold; there is no mid-stride visibility cutoff.
function homeEntryTick147(q,dt){
 const g=q.portal.group;g.updateWorldMatrix(true,false);
 if(!q.entry147){
  const inverse=g.matrixWorld.clone().invert();
  q.entry147=q.party.map((row,i)=>{
   const start=V3(row.from.x,heightAt(row.from.x,row.from.z),row.from.z).applyMatrix4(inverse),lane=(i%2?.10:-.10),front=Math.max(3.7,start.z);
   const points=[start,V3(mix(start.x,lane,.58),0,front),V3(lane,0,2.65),V3(lane,0,.75),V3(lane,0,-1.05)].map(v=>v.applyMatrix4(g.matrixWorld));
   const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');curve.arcLengthDivisions=80;curve.updateArcLengths();
   return{...row,curve,duration:Math.max(1.65,curve.getLength()/2.45),delay:i*.56,distance:0,done:false};
  });
 }
 let done=true;
 for(const row of q.entry147){
  const a=row.a,elapsed=q.elapsed-row.delay,raw=clamp(elapsed/row.duration,0,1),t=raw*raw*(3-2*raw),p=row.curve.getPointAt(t),dx=p.x-a.x,dz=p.z-a.z,metres=Math.hypot(dx,dz),moving=elapsed>0&&raw<1&&metres>.00001;
  a.x=p.x;a.z=p.z;a.speed=moving?metres/Math.max(dt,.001):0;a.action=moving?'walk':'idle';if(moving)a.face=facingForMotion(dx,dz);a.phase+=metres/1.55;row.distance+=metres;
  updateActor(a,dt);
  if(moving){const meta=assets.sprites[a.visualId??a.id],key=meta.frames['run_'+a.face]?'run_'+a.face:a.face,clip=meta.frames[key];if(clip)setActorFrame(a,key,Math.floor(row.distance/1.55*clip.length)%clip.length);}
  const local=V3(a.x,0,a.z).applyMatrix4(g.matrixWorld.clone().invert()),rad=Math.hypot(local.x,local.z),ground=heightAt(a.x,a.z),top=V3(0,.30,0).applyMatrix4(g.matrixWorld).y,step=1-smooth(1.43,2.05,rad);
  a.mesh.position.y=mix(ground,Math.max(ground,top),step)+.015;a.shadow.position.y=ground+.018;
  a.mesh.visible=raw<1;if(a.shadow)a.shadow.visible=raw<1&&local.z>.12;
  if(raw<1)done=false;row.done=raw>=1;
 }
 updateCamera(dt,true);
 if(done){homeTransit144=null;state.mode=q.mode;route=null;q.portal.energy=1;q.resolve(true);}
}
