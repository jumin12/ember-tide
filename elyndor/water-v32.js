// Propagation and filling are separate: a shallow current arrives first,
// then the channel gradually recovers its ordinary depth. No sweeping ribbon.
function arrival32(z){return Math.max(0,z-70)/1.6;}
const riverStateBefore32=riverState17;
riverState17=function(){const q=riverStateBefore32();if(!q.model32){if(q.released&&q.age>=78)q.age=360;q.model32=1;}return q;};
// Repeated weather setup used to leave earlier square cloud planes alive.
const weatherSetupBefore32=setupWeather;
setupWeather=function(...args){const old=world?.userData.weather;if(old){for(const o of[old.cloud,old.precipitation].filter(Boolean)){o.removeFromParent();o.geometry?.dispose();o.material?.dispose();}for(const o of old.worldChunks?.values()??[]){o.removeFromParent();o.geometry.dispose();}old.worldChunks?.clear();}return weatherSetupBefore32(...args);};
sampleCurrent18=function(f,z,q){return mix(f.dry,f.natural,q.released?smooth(arrival32(z),arrival32(z)+52,q.age):0);};
setupSluiceFX18=function(){/* Water sheets and world-space mist supply the release. */};
updateReleaseFX18=function(){for(const o of[world?.userData.releaseBore18,world?.userData.releaseSpray18])if(o)o.visible=false;};
addRiverCurrent19=function(){if(activeScene?.key==='brookstead')world.userData.currentMotion19={active:0,speed:0,front:70,gpu:true};};
updateRiverCurrent19=function(){if(activeScene?.key!=='brookstead')return;const q=riverState17();world.userData.currentMotion19={active:0,speed:q.released?1.6:0,front:Math.min(430,70+q.age*1.6),direction:'downstream',gpu:true};};
updateCascadeJoins18=function(q){
 for(const fall of world.userData.brookFallObjects??[]){
  const j=fall.userData.join,z0=j.z-j.halfSpan,z1=j.z+j.halfSpan,upper=j.z===70?'reservoir':j.z===80?'headrace':'millrace',lower=j.z===70?'headrace':j.z===80?'millrace':'lowerBrook';
  const top=currentLevel18(upper,z0,q),bottom=currentLevel18(lower,z1,q),p=fall.geometry.attributes.position,d=fall.geometry.attributes.waterDepth18;
  const flow=q.released?smooth(arrival32(j.z),arrival32(j.z)+7,q.age)*sluice18.flow.value:0;
  fall.userData.flowWidth17.value=mix(.065,1,flow);fall.position.y=top;j.top=top;j.bottom=bottom;
  for(let row=0;row<=32;row++)for(let col=0;col<13;col++){
   const i=row*13+col,t=row/32,z=z0+(z1-z0)*t,x=p.getX(i)+fall.position.x;
   let y=mix(top,bottom,smooth(0,1,t));
   // The stone sill is 4.025 m high and extends 55 cm past the gate.
   // Carry the sheet over its lip immediately, before the lower pool fills.
   if(j.z===70&&flow>.001){const sill=4.055+flow*.045;if(z>69.45&&z<70.58)y=Math.max(y,sill);else if(z>=70.58)y=Math.max(y,mix(sill,bottom,smooth(70.58,z1,z)));}
   p.setY(i,y-top);if(d)d.setX(i,Math.max(.28,flow*.45));
  }
  p.needsUpdate=true;if(d)d.needsUpdate=true;fall.geometry.computeVertexNormals();fall.geometry.computeBoundingBox();fall.geometry.computeBoundingSphere();fall.userData.joinBounds.copy(fall.geometry.boundingBox).translate(fall.position);
 }
};
const riverUpdateBefore32=updateRiver17;
updateRiver17=function(dt){riverUpdateBefore32(dt);if(activeScene?.key!=='brookstead')return;const q=riverState17(),progress=world.userData.riverProgress17;if(progress){progress.settled=q.age>=280;progress.model='sill overflow, downstream wetting and gradual recovery';progress.front=Math.min(430,70+q.age*1.6);progress.levels={reservoir:brookHydraulics.head.value};for(const p of world.userData.waterPools){const f=p.userData.fill17;if(f)progress.levels[p.userData.waterRole]=sampleCurrent18(f,(f.start+f.end)/2,q);}}};
