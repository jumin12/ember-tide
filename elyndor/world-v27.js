// Keep the complete working sluice out of the landscape batching/cutaway path.
// Its frame used to be detached and baked into a different static chunk.
function protectSluice27(){
 if(activeScene?.key!=='brookstead')return;
 const roots=[world.userData.gate,world.userData.sluice18?.frame,world.userData.sluiceAbutment26].filter(Boolean);
 for(const root of roots){root.visible=true;root.matrixWorldAutoUpdate=root.matrixAutoUpdate=true;root.traverse(o=>{o.matrixWorldAutoUpdate=true;if(!o.isMesh)return;o.visible=true;o.frustumCulled=false;o.userData.viewHidden=false;o.userData.noCutaway25=true;if(o.userData.cutRange24){o.geometry.setDrawRange(o.userData.cutRange24.start,o.userData.cutRange24.count);delete o.userData.cutRange24;}o.geometry.setDrawRange(0,Infinity);});root.updateMatrixWorld(true);}
 world.userData.sluiceProtected27=roots;
}
const structureBuildBefore27=buildWorld;
buildWorld=function(...args){const r=structureBuildBefore27(...args);protectSluice27();for(const o of world.userData.shafts24?.group.children??[])o.frustumCulled=false;
 if(activeScene.kind!=='interior'){
  const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{day:cinema22.day,rain:weather.rain,sun:weather.sun,horizon:{value:scene.fog.color}},vertexShader:'varying vec3 skyDirection27;void main(){skyDirection27=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=vec4(p.xy,p.w*.999999,p.w);}',fragmentShader:`uniform float day,rain;uniform vec3 sun,horizon;varying vec3 skyDirection27;void main(){vec3 d=normalize(skyDirection27);float up=smoothstep(-.04,.7,d.y);vec3 zenith=mix(vec3(.012,.032,.078),vec3(.19,.43,.64),day);vec3 colour=mix(horizon,zenith,up);float light=max(0.,dot(d,normalize(sun)));colour+=vec3(1.,.64,.28)*pow(light,36.)*.14*day*(1.-rain);colour+=vec3(1.,.88,.64)*pow(light,900.)*day*(1.-rain);colour=mix(colour,mix(horizon,vec3(.19,.28,.36),up),rain*.55);gl_FragColor=vec4(colour,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`});
  const o=new THREE.Mesh(new THREE.SphereGeometry(1450,24,16),m),b=activeScene.bounds;o.position.set((b[0]+b[1])/2,30,(b[2]+b[3])/2);o.userData.dynamicFX=true;o.frustumCulled=false;o.renderOrder=-50;world.add(o);world.userData.sky27=o;
 }
 return r;};
const structureBudgetBefore27=updateRenderBudget;
updateRenderBudget=function(...args){const r=structureBudgetBefore27(...args);protectSluice27();return r;};
const structureCutawayBefore27=updateCutaways;
updateCutaways=function(...args){const r=structureCutawayBefore27(...args);protectSluice27();return r;};

// One world-space cloud field drives visible clouds, surface shade and shafts.
const CLOUD_FIELD27=`float density27(vec2 world){vec2 uv=world*.0022+vec2(time*.0013,time*.00037);float base=texture2D(map,uv).r;float broad=texture2D(map,uv*.67+vec2(.31,.62)).r*.7;return smoothstep(.05,.85,max(base,broad));}`;
const cloudBuildBefore27=cloudShelf21;
cloudShelf21=function(){cloudBuildBefore27();const o=world.userData.weather?.cloud;if(!o?.userData.cloudVolume25)return;let s=o.material.fragmentShader;s=s.replace('float field25(vec3 p){',CLOUD_FIELD27+'\nfloat field25(vec3 p){').replace('return smoothstep(.17,.76,base*.9+detail*.14)*body;','return density27(p.xz)*body;');o.material.fragmentShader=s;o.frustumCulled=false;o.material.needsUpdate=true;};
const shaftBuildBefore27=buildShafts24;
buildShafts24=function(){shaftBuildBefore27();const q=world.userData.shafts24;if(!q)return;const g=new THREE.CylinderGeometry(.8,2.1,48,10,1,true);g.translate(0,24,0);const old=q.group.children[0]?.geometry;for(const o of q.group.children){o.geometry=g;o.frustumCulled=false;o.userData.persistent27=true;}old?.dispose();const m=q.group.children[0]?.material;if(m){m.fragmentShader=m.fragmentShader.replace('if(a<.00025)discard;','a*=1.-smoothstep(220.,600.,distance(wp26,cameraPosition));');m.needsUpdate=true;}};

// Do not jump a pooled lantern from one visible building to another at full power.
const lightBefore27=updateLighting;
updateLighting=function(){
 const slots=world?.userData.lanterns??[];lightBefore27();
 if(!player||battle||activeScene.kind==='interior')return;
 const q=world.userData.lampBlend27??={last:clock,slots:[]},dt=clamp(clock-q.last,0,.1);q.last=clock;
 slots.forEach((l,i)=>{if((l.userData.effectUntil??0)>clock)return;const wanted=l.position.clone(),power=l.intensity,old=q.slots[i]??={p:wanted.clone(),power};if(old.p.distanceToSquared(wanted)>.01){old.power=mix(old.power,0,1-Math.exp(-dt*7));if(old.power<.06)old.p.copy(wanted);}else old.power=mix(old.power,power,1-Math.exp(-dt*6));l.position.copy(old.p);l.intensity=old.power;});
};

// Work cycles use their actual authored facing instead of the last approach step.
const workPointBefore27=townWorkPoint;
townWorkPoint=function(o,a){if(o.type==='gate'){const c=world.userData.crank.position;for(const [dx,dz]of[[1.2,1.2],[1.6,1.5],[2,1.6],[2.4,2]]){const p={x:c.x+dx,z:c.z+dz};if(staticFree(p.x,p.z,.45))return p;}}return workPointBefore27(o,a);};
const workActorBefore27=updateActor;
updateActor=function(a,dt){if(eventAction?.actor===a&&eventAction.target.type==='gate'&&!eventAction.approach?.length)a.face='north-west';return workActorBefore27(a,dt);};
