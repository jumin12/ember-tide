// Keep every cinematic lens inside the photographed set. The native scene
// stays in world space; the distant landscape never follows the camera.
const battleCamera94={probe:new THREE.PerspectiveCamera(),ray:new THREE.Ray(),point:V3(),hit:V3(),bounds:V3(),metrics:null,cache:null};
function imageCoverage94(p,b){
 const probe=battleCamera94.probe;probe.copy(camera,false);probe.position.copy(p.position);probe.fov=p.fov;probe.lookAt(p.target);probe.updateProjectionMatrix();probe.updateMatrixWorld();let low=1,high=0,count=0;
 for(const x of[-.998,.998])for(let i=0;i<=24;i++){
  const at=battleCamera94.point.set(x,-1+i/12,.5).unproject(probe),ray=battleCamera94.ray;ray.set(p.position,at.sub(p.position).normalize());if(ray.direction.z>=-.01)return{safe:false,low:-1,high:2,count};
  for(const depth of[105,112]){const hit=ray.at((encounter53.center.z-depth-ray.origin.z)/ray.direction.z,battleCamera94.hit),q=hit.applyMatrix4(b.projector90),u=(q.x*.5)*b.crop90.x+.5,v=(q.y*.5+.5-b.window90.x)/b.window90.y;if(v<.36||v>.93)continue;low=Math.min(low,u);high=Math.max(high,u);count++;}
 }
 return{safe:count>0&&low>=.03&&high<=.97,low,high,count};
}
function poseInsideSet94(p,b){
 if(p.position.z<encounter53.center.z-55||!imageCoverage94(p,b).safe)return false;
 const probe=battleCamera94.probe,field=battlePresentation91.frame?.field;
 if(!field)return true;
 for(const a of[player,...followers,...battle.enemies.map(e=>e.actor)]){const s=silhouette87(a.visualId??a.id),y=heightAt(a.x,a.z);for(const x of[a.x+s.left*a.size,a.x+s.right*a.size])for(const h of[y,y+s.height*a.size]){const q=battleCamera94.bounds.set(x,h,a.z).project(probe),px=(q.x*.5+.5)*innerWidth,py=(.5-q.y*.5)*innerHeight;if(px<5||px>innerWidth-5||py<field.top+3||py>field.top+field.height-3)return false;}}
 return true;
}
function alignGuardedCast94(){const d=camera.position.clone().sub(cameraTarget),yaw=Math.atan2(d.x,d.z),pitch=Math.atan2(d.y,Math.hypot(d.x,d.z));for(const a of[player,...followers,...battle.enemies.map(e=>e.actor)]){a.mesh.quaternion.setFromAxisAngle(axis24,yaw);a.mesh.scale.y=1/Math.max(.75,Math.cos(pitch));}}
function guardBattleCamera94(){
 const b=arena88.current,frame=battlePresentation91.frame;if(!encounter53.active||!b?.landscape90||!frame||!battle)return;
 const key=()=>[...camera.position.toArray(),...cameraTarget.toArray(),camera.fov,innerWidth,innerHeight,...[player,...followers,...battle.enemies.map(e=>e.actor)].flatMap(a=>[a.x,a.z,a.size])].join('|'),rawKey=key(),cached=battleCamera94.cache;
 if(cached?.owner===b&&cached.applied===rawKey)return;
 if(cached?.owner===b&&cached.raw===rawKey){camera.position.copy(cached.pose.position);cameraTarget.copy(cached.pose.target);camera.fov=cached.pose.fov;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);alignGuardedCast94();battleCamera94.metrics=cached.metrics;return;}
 const base={position:frame.position,target:frame.target,fov:frame.fov},raw={position:camera.position.clone(),target:cameraTarget.clone(),fov:camera.fov},baseDistance=base.position.distanceTo(base.target),wanted=mixIntroPose58(base,raw,1);
 wanted.fov=Math.min(wanted.fov,base.fov+.5);const delta=wanted.position.clone().sub(wanted.target);if(delta.length()>baseDistance*1.025)wanted.position.copy(wanted.target).add(delta.setLength(baseDistance*1.025));
 let amount=1,pose=wanted;if(!poseInsideSet94(wanted,b)){let lo=0,hi=1;for(let i=0;i<12;i++){const t=(lo+hi)/2,q=mixIntroPose58(base,wanted,t);if(poseInsideSet94(q,b))lo=t;else hi=t;}amount=lo;pose=mixIntroPose58(base,wanted,amount);}
 camera.position.copy(pose.position);cameraTarget.copy(pose.target);camera.fov=pose.fov;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);
 alignGuardedCast94();
 battleCamera94.metrics={amount,coverage:imageCoverage94(pose,b),fov:pose.fov,intro:introLocked58()};
 battleCamera94.cache={owner:b,raw:rawKey,applied:key(),pose,metrics:battleCamera94.metrics};
}
const cameraLandscapeBefore94=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 cameraLandscapeBefore94(b);const ref=b.reference90,p=b.landscape90.geometry.attributes.position,origin=b.group.position,eye=ref.position,scale=1.08,bottom=b.window90.x+.30*b.window90.y;
 // Modest overscan preserves image proportions and supplies a safe
 // margin for safe dolly moves. The ground projection uses the same mapping.
 for(let i=0;i<p.count;i++){const world=V3(p.getX(i),p.getY(i),p.getZ(i)).add(origin),screen=world.clone().project(ref),x=screen.x*.5+.5,y=screen.y*.5+.5,at=V3((.5+(x-.5)*scale)*2-1,(bottom+(y-bottom)*scale)*2-1,.5).unproject(ref),direction=at.sub(eye).normalize(),hit=eye.clone().addScaledVector(direction,(world.z-eye.z)/direction.z).sub(origin);p.setXYZ(i,hit.x,hit.y,hit.z);}
 b.crop90.x/=scale;b.window90.y*=scale;b.window90.x=bottom-.30*b.window90.y;p.needsUpdate=true;b.landscape90.geometry.computeBoundingSphere();
 // Transparent feathering must not cut a rectangular hole in the clouds.
 b.landscape90.material.depthWrite=false;b.landscape90.renderOrder=0;b.cameraSafe94=true;
 if(b.clouds89){const m=b.clouds89.material;Object.assign(m.uniforms,{plateProjector94:{value:b.projector90},plateCrop94:{value:b.crop90},plateWindow94:{value:b.window90},plateZ94:{value:encounter53.center.z-108}});m.fragmentShader='uniform mat4 plateProjector94;uniform vec2 plateCrop94,plateWindow94;uniform float plateZ94;'+m.fragmentShader;
  m.fragmentShader=m.fragmentShader.replace('float alpha=1.-trans;if(alpha<.005)discard;gl_FragColor=vec4(sum/max(.001,alpha),alpha);',`float baseAlpha94=1.-trans,plate94=0.;if(ray.z<-.01){vec3 at94=cameraPosition+ray*((plateZ94-cameraPosition.z)/ray.z);vec4 q94=plateProjector94*vec4(at94,1.);vec2 screen94=q94.xy/q94.w*.5+.5,v94=vec2((screen94.x-.5)*plateCrop94.x+.5,(screen94.y-plateWindow94.x)/plateWindow94.y);float edge94=.008*sin(v94.x*29.)+.006*sin(v94.x*67.);plate94=(1.-smoothstep(.90+edge94,1.,v94.y))*smoothstep(.30,.39,v94.y)*smoothstep(-.02,.025,v94.x)*(1.-smoothstep(.975,1.02,v94.x));}float alpha=baseAlpha94*(1.-plate94);if(alpha<.005)discard;gl_FragColor=vec4(sum/max(.001,baseAlpha94),alpha);`);m.needsUpdate=true;
 }
};
const introApplyBefore94=applyBattleIntro58;
applyBattleIntro58=function(...a){const r=introApplyBefore94(...a);if(introLocked58())guardBattleCamera94();return r;};
const guardedRenderBefore94=renderArena89;
renderArena89=function(...a){guardBattleCamera94();return guardedRenderBefore94(...a);};
