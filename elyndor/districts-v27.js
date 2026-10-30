// Arrivals lead into a place; departures continue along the actual road tangent.
// Extend the authored approaches rather than placing an exit beside the spawn.
const districts27={};
for(const [key,p] of Object.entries(POIS)){
 const q=districts24[key],before=[...p.bounds],extra=p.kind==='town'?42:32;
 for(let i=0;i<q.roads.length;i++){
  const road=q.roads[i],end=road.p.at(-1),prev=road.p.at(-2),dx=end[0]-prev[0],dz=end[1]-prev[1],len=Math.hypot(dx,dz)||1;
  const next=[end[0]+dx/len*extra,end[1]+dz/len*extra];road.p.push(next);
  if(i===0)p.exit=next;else if(LEVEL_THRESHOLDS[key]?.[i-1])Object.assign(LEVEL_THRESHOLDS[key][i-1],{x:next[0],z:next[1]});
  p.bounds[0]=Math.min(p.bounds[0],next[0]-18);p.bounds[1]=Math.max(p.bounds[1],next[0]+18);p.bounds[2]=Math.min(p.bounds[2],next[1]-18);p.bounds[3]=Math.max(p.bounds[3],next[1]+18);
 }
 q.areaRatio=(p.bounds[1]-p.bounds[0])*(p.bounds[3]-p.bounds[2])/((q.core[1]-q.core[0])*(q.core[3]-q.core[2]));
 districts27[key]={before,bounds:p.bounds,arrival:[...p.spawn],departure:[...p.exit],extra};
}
// Follow the dry bank at Highmere and relief; do not draw roads across the river.
function redirectExit27(key,index,end){const q=districts24[key],road=q.roads[index];road.p[road.p.length-1]=end;if(index===0)POIS[key].exit=end;else Object.assign(LEVEL_THRESHOLDS[key][index-1],{x:end[0],z:end[1]});}
redirectExit27('highmere',2,[-127.44,-208]);
redirectExit27('relief',0,[-28.096,-88.23]);
redirectExit27('relief',2,[-10,-225]);
for(const[key,q]of Object.entries(districts24)){const p=POIS[key];for(const road of q.roads)for(const[x,z]of road.p){p.bounds[0]=Math.min(p.bounds[0],x-18);p.bounds[1]=Math.max(p.bounds[1],x+18);p.bounds[2]=Math.min(p.bounds[2],z-18);p.bounds[3]=Math.max(p.bounds[3],z+18);}districts27[key].departure=[...p.exit];}
const gradeGroundBefore27=groundAt,roadGrades27=new Map();
groundAt=function(x,z,...args){const base=gradeGroundBefore27(x,z,...args);if(activeScene?.kind!=='poi')return base;let result=base;for(const road of districts24[activeScene.key]?.roads??[]){const a=road.p.at(-2),b=road.p.at(-1),dx=b[0]-a[0],dz=b[1]-a[1],len2=dx*dx+dz*dz,t=((x-a[0])*dx+(z-a[1])*dz)/len2;if(t<0||t>1)continue;const d=Math.hypot(x-mix(a[0],b[0],t),z-mix(a[1],b[1],t));if(d>7)continue;const k=activeScene.key+'|'+a+'|'+b;let h=roadGrades27.get(k);if(!h){h=[gradeGroundBefore27(a[0],a[1]),gradeGroundBefore27(b[0],b[1])];roadGrades27.set(k,h);}result=mix(mix(h[0],h[1],t),result,smooth(3.2,7,d));}return result;};
const portalBefore27=scenePortal;
scenePortal=function(...args){const o=portalBefore27(...args);if(activeScene?.kind!=='poi'||o.type!=='poiExit')return o;
 const roads=districts24[activeScene.key]?.roads??[];let best=null,error=Infinity;
 for(const road of roads){const e=road.p.at(-1),d=Math.hypot(o.x-e[0],o.z-e[1]);if(d<error){error=d;best=road;}}
 if(best){const a=best.p.at(-2),b=best.p.at(-1),len=Math.hypot(b[0]-a[0],b[1]-a[1]);o.departDirection=[(b[0]-a[0])/len,(b[1]-a[1])/len];}
 const old=o.floorMarker;if(old){old.removeFromParent();old.geometry.dispose();old.material.dispose();}
 const [dx,dz]=o.departDirection,angle=Math.atan2(-dx,-dz);o.floorMarker=groundDecal(o.x,o.z,textures.exitMarker??textures.runeSeal,4.8,angle,'#ffd477');o.floorMarker.material.emissiveIntensity=1.5;
 o.floorMarker.userData.exitGlow27=true;o.exitAngle27=angle;o.radius=4.6;
 world.userData.exitGlows27??=[];world.userData.exitGlows27.push(o.floorMarker);return o;
};
const districtFXBefore27=updateWorldFX;
updateWorldFX=function(dt){districtFXBefore27(dt);for(const o of world.userData.exitGlows27??[])o.material.emissiveIntensity=1.15+.35*Math.sin(clock*2.2);};
