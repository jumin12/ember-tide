// Inn chronicles, coherent lit actors and spatial, uncut combat performances.
function atJourneyInn(){return activeScene?.kind==='interior'&&INTERIORS[activeScene.key]?.type==='inn';}
// Texture.clone() in the bundled renderer marks its shared Source dirty.
// Atlas images are immutable: per-actor UV copies must not reupload megabytes.
const textureBeforeImmutableCopies=actorTexture;
actorTexture=function(id){const base=animationTextures.get(id),version=base?.source.version,result=textureBeforeImmutableCopies(id);if(base)base.source.version=version;return result;};
const saveBeforeInnChronicles=saveSlot;
saveSlot=function(slot,silent=false){if(!atJourneyInn()){if(!silent)toast('Record your journey at an inn.');return false;}return saveBeforeInnChronicles(slot,silent);};
const openBeforeInnChronicles=openMenu;
openMenu=function(tab){if(tab==='save'&&!atJourneyInn())return toast('Journey records are kept at inns.');return openBeforeInnChronicles(tab);};
const menuBeforeInnChronicles=renderMenu;
renderMenu=function(){menuBeforeInnChronicles();if(menu){$('#menu-status').textContent=atJourneyInn()?'An inn is a safe place to record your journey.':'Record your journey at an inn.';if(menu.tab==='save')$('#menu-title').textContent='Inn chronicle';}};

const actorBeforeSculptedLight=createActor;
createActor=function(...args){const a=actorBeforeSculptedLight(...args);if(!a)return a;const m=a.mesh.material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);a.pixelDissolve={value:0};m.emissiveIntensity=.018;m.emissive.set('#718a9b');m.onBeforeCompile=function(sh,...rest){before.call(this,sh,...rest);sh.uniforms.actorDissolve=a.pixelDissolve;sh.uniforms.actorCell={value:new THREE.Vector2(assets.sprites[a.visualId??a.id].cols,assets.sprites[a.visualId??a.id].rows)};sh.fragmentShader='uniform float actorDissolve;uniform vec2 actorCell;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',`vec2 piece=floor(fract(vMapUv*actorCell)*vec2(24.,24.));float grain=fract(sin(dot(piece,vec2(12.9898,78.233)))*43758.5453);if(grain<actorDissolve)discard;\n#include <alphatest_fragment>`);};m.customProgramCacheKey=()=>key()+'-pixel-release-v14';return a;};
const updateBeforeGroundedSilhouette=updateActor;
updateActor=function(a,dt){updateBeforeGroundedSilhouette(a,dt);const yaw=Math.atan2(camera.position.x-cameraTarget.x,camera.position.z-cameraTarget.z),side=V3(Math.cos(yaw),0,-Math.sin(yaw)),r=a.enemy?.65:.42;let floor=heightAt(a.x,a.z);for(const n of[-1,1])floor=Math.max(floor,heightAt(a.x+side.x*r*n,a.z+side.z*r*n));a.mesh.position.y=floor+.055;a.mesh.material.emissiveIntensity=.018+Math.max(0,a.hitFlash??0)*1.35;if(a.pixelReleased&&a.shadow.material.uniforms?.opacity)a.shadow.material.uniforms.opacity.value*=1-smooth(0,2.2,a.dissolveTime??0);};
const artBeforeMatchedEmission=replaceActorArt;
replaceActorArt=function(a,id){artBeforeMatchedEmission(a,id);a.mesh.material.emissiveMap=a.mesh.material.map;};
const lightBeforeDiorama=updateLighting;
updateLighting=function(){lightBeforeDiorama();if(!world||!player)return;const h=(state.worldMinutes/60%24+24)%24,day=Math.max(0,Math.sin((h-6)/12*Math.PI)),warm=Math.max(0,1-Math.abs(h-17.2)/2.8);if(activeScene.kind!=='interior'){hemi.groundColor.set('#465139').lerp(new THREE.Color('#26374d'),1-smooth(.02,.4,day));hemi.intensity*=.93;sun.color.lerp(new THREE.Color('#ffd092'),warm*.2);renderer.toneMappingExposure=1.01;sun.shadow.normalBias=.012;sun.shadow.bias=-.00018;sun.shadow.radius=3.5;}camera.near=activeScene.kind==='interior'?.22:.45;camera.updateProjectionMatrix();};
const atmosphereBeforeDiorama=updateAtmosphere;
updateAtmosphere=function(){atmosphereBeforeDiorama();const shafts=world?.userData.sunshafts;if(shafts){shafts.material.uniforms.opacity.value*=1.45*(1-weather.rain.value*.7);shafts.material.uniforms.tint.value.copy(sun.color);}};

// A single bounded batch per defeat carries the creature's actual sprite colors.
const pixelRelease={pools:[],world:null,started:0};
function initPixelRelease(){
 if(pixelRelease.world===world)return;pixelRelease.world=world;pixelRelease.pools=[];
 for(let b=0;b<5;b++){
  const g=new THREE.BoxGeometry(.055,.055,.055),velocity=new Float32Array(256*3),delay=new Float32Array(256),t={value:10};
  g.setAttribute('releaseVelocity',new THREE.InstancedBufferAttribute(velocity,3));g.setAttribute('releaseDelay',new THREE.InstancedBufferAttribute(delay,1));
  const m=new THREE.MeshStandardMaterial({roughness:.9,metalness:0,transparent:true,opacity:1,emissive:'#568da0',emissiveIntensity:.055});
  m.onBeforeCompile=sh=>{sh.uniforms.releaseTime=t;sh.vertexShader='attribute vec3 releaseVelocity;attribute float releaseDelay;uniform float releaseTime;varying float releaseAlpha;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nfloat age=max(0.,releaseTime-releaseDelay);transformed*=max(.001,1.-smoothstep(.9,2.7,age));transformed+=releaseVelocity*age+vec3(sin(age*3.+releaseDelay*9.)*.08,age*age*.1,0.);releaseAlpha=smoothstep(0.,.12,age)*(1.-smoothstep(1.,2.7,age));`);sh.fragmentShader='varying float releaseAlpha;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a*=releaseAlpha;\n#include <alphatest_fragment>');};m.customProgramCacheKey=()=> 'native-pixel-release-v14';
  const o=new THREE.InstancedMesh(g,m,256);o.visible=false;o.frustumCulled=false;o.castShadow=false;o.receiveShadow=true;o.userData.dynamicFX=true;world.add(o);addCloudLighting(m);pixelRelease.pools.push({o,t,active:false});
 }
}
function releaseCreaturePixels(a){
 if(a.pixelReleased)return;a.pixelReleased=true;playSound('arcane',.22);initPixelRelease();const bank=pixelRelease.pools.find(q=>!q.active);if(!bank)return;const meta=assets.sprites[a.visualId??a.id],im=spriteImages[a.visualId??a.id],canvas=document.createElement('canvas');canvas.width=meta.w;canvas.height=meta.h;const ctx=canvas.getContext('2d'),cell=a.frame.cell;ctx.drawImage(im,cell%meta.cols*meta.w,Math.floor(cell/meta.cols)*meta.h,meta.w,meta.h,0,0,meta.w,meta.h);const px=ctx.getImageData(0,0,meta.w,meta.h).data,step=3,candidates=[];for(let y=0;y<meta.h;y+=step)for(let x=0;x<meta.w;x+=step){const i=(y*meta.w+x)*4;if(px[i+3]>150)candidates.push({x,y,i});}const random=seeded(Math.round(a.x*93+a.z*151)),dummy=new THREE.Object3D(),yaw=Math.atan2(camera.position.x-cameraTarget.x,camera.position.z-cameraTarget.z),pitchScale=a.mesh.scale.y,side=V3(Math.cos(yaw),0,-Math.sin(yaw)),vel=bank.o.geometry.attributes.releaseVelocity,delay=bank.o.geometry.attributes.releaseDelay;let n=0;
 for(let i=0;i<Math.min(256,candidates.length);i++){const p=candidates[Math.floor(i*candidates.length/Math.min(256,candidates.length))],x=(p.x-meta.w/2)/(meta.unit??136)*a.size,y=(meta.h-p.y-(meta.gutter??8))/(meta.unit??136)*a.size*pitchScale;dummy.position.set(a.x+side.x*x,a.mesh.position.y+y,a.z+side.z*x);dummy.scale.setScalar(.7+random()*.8);dummy.rotation.set(random()*2,random()*2,random()*2);dummy.updateMatrix();bank.o.setMatrixAt(n,dummy.matrix);bank.o.setColorAt(n,new THREE.Color().setRGB(px[p.i]/255,px[p.i+1]/255,px[p.i+2]/255,THREE.SRGBColorSpace));vel.setXYZ(n,(random()-.5)*.7,.15+random()*.65,(random()-.5)*.6);delay.setX(n,.22+random()*1.35+(1-p.y/meta.h)*.2);n++;}
 bank.o.count=n;bank.o.instanceMatrix.needsUpdate=true;if(bank.o.instanceColor)bank.o.instanceColor.needsUpdate=true;vel.needsUpdate=delay.needsUpdate=true;bank.o.visible=bank.active=true;bank.t.value=0;a.dissolveTime=0;pixelRelease.started++;
}
function dissolveCreature(a,dt){if(!a.pixelReleased)releaseCreaturePixels(a);a.speed=0;a.action='subdued';a.dissolveTime=(a.dissolveTime??0)+dt;a.pixelDissolve.value=smooth(.18,2.35,a.dissolveTime);a.mesh.material.opacity=1;a.mesh.castShadow=false;if(a.dissolveTime>=2.85)a.mesh.visible=a.shadow.visible=false;}
const retreatBeforePixelRelease=updateBattleRetreat;
const planBeforePixelRelease=planBattleRetreat;
planBattleRetreat=function(a,index){if(['wolf','boar'].includes(a.id)){a.subdued=true;a.flinchUntil=0;a.action='subdued';a.speed=0;a.retreatStart={x:a.x,z:a.z};a.retreatRoute=null;}else planBeforePixelRelease(a,index);};
updateBattleRetreat=function(a,dt){if(['wolf','boar'].includes(a.id))dissolveCreature(a,dt);else retreatBeforePixelRelease(a,dt);};
const damageBeforePixelRelease=damageEnemy;
damageEnemy=function(e,damage){damageBeforePixelRelease(e,damage);if(e?.hp<=0&&['wolf','boar'].includes(e.id)&&!e.actor.pixelReleased)releaseCreaturePixels(e.actor);};
const initBeforePixelRelease=initCombatVfx;
initCombatVfx=function(){initBeforePixelRelease();initPixelRelease();};
const graphicsBeforePixelRelease=prepareGameplayGraphics;
prepareGameplayGraphics=async function(){initPixelRelease();const p=camera.position.clone().addScaledVector(camera.getWorldDirection(V3()),2),matrix=new THREE.Matrix4().compose(p,new THREE.Quaternion(),V3(.001,.001,.001));for(const bank of pixelRelease.pools){bank.o.visible=true;bank.o.count=1;bank.o.setMatrixAt(0,matrix);bank.o.setColorAt(0,new THREE.Color('#ffffff'));bank.o.instanceMatrix.needsUpdate=true;bank.o.instanceColor.needsUpdate=true;bank.t.value=.4;}try{return await graphicsBeforePixelRelease();}finally{for(const bank of pixelRelease.pools)bank.o.visible=bank.active=false;}};
const tickBeforePixelRelease=tick;
tick=function(dt){tickBeforePixelRelease(dt);if(gameLoading)return;for(const p of pixelRelease.pools)if(p.active){p.t.value+=dt;if(p.t.value>4.4)p.o.visible=p.active=false;}if(battle&&battle.status!=='victory')for(const e of battle.enemies)if(e.hp<=0&&['wolf','boar'].includes(e.id)&&e.actor.mesh.visible)dissolveCreature(e.actor,dt);};
const cueBeforePhysicalApproach=startActionAnimation;
startActionAnimation=function(opts){const a=opts.actor,id=a?.characterId??a?.id;if(a?.enemy&&a.action==='attack'&&!opts.lunge){const target=state.members.map(actorFor).filter(q=>q&&state.characters[q.characterId??q.id]?.hp>0).sort((p,q)=>dist(a,p)-dist(a,q))[0];if(target&&edgeFree(a,target,.5))opts={...opts,lunge:target};}cueBeforePhysicalApproach(opts);const cue=battle?.animation;if(!cue||cue.actor!==a)return;if(a.action==='cast'&&!cue.lunge&&!a.enemy&&['soren','tavin','mira','lysa'].includes(id)){const target=battle.enemies.find(e=>e.hp>0)?.actor;if(target){const d=dist(a,target),distance=.7,point={x:a.x+(target.x-a.x)/d*distance,z:a.z+(target.z-a.z)/d*distance};if(edgeFree(a,point,.5))cue.lunge=point;}}};
const chainBeforeStance=advanceLiveChain;
advanceLiveChain=function(dt){const c=battle?.combo;if(!c)return;chainBeforeStance(dt);if(!battle?.combo||c.id==='bren')return;const p=c.t/c.duration,d=dist(c.start,c.target.actor),distance=c.id==='tavin'?1.05:.65,pulse=p<.86?smooth(.02,.3,p):1-smooth(.86,1,p),x=c.start.x+(c.target.actor.x-c.start.x)/Math.max(.01,d)*distance*pulse,z=c.start.z+(c.target.actor.z-c.start.z)/Math.max(.01,d)*distance*pulse;if(edgeFree(c.start,{x,z},.5)){c.actor.x=x;c.actor.z=z;}};

const castBeforeMovingOrigins=castFX;
castFX=function(kind,from,to,...rest){const c=battle?.animation;if(c?.actor&&c.start&&Math.hypot(from.x-c.start.x,from.z-c.start.z)<1.2)from=V3(c.actor.x,heightAt(c.actor.x,c.actor.z)+1.1,c.actor.z);return castBeforeMovingOrigins(kind,from,to,...rest);};
let dioramaTextInstalled=false;
function installDioramaText(){if(dioramaTextInstalled||!window.render_game_to_text)return;const previous=window.render_game_to_text;window.render_game_to_text=()=>{const r=JSON.parse(previous());r.saving={allowed:atJourneyInn(),location:'Inns only'};r.atlas={threeDimensional:true,active:atlas3d.active,exploredCells:atlas3d.revealed,tracked:state.trackedPoi??null};r.voice.model=assets.voiceModel;r.presentation={pixelDefeats:pixelRelease.started,materialVariations:6,actorLighting:'PBR, sunlight, cloud and scene shadows'};return JSON.stringify(r);};dioramaTextInstalled=true;}
const tickBeforeDioramaText=tick;tick=function(dt){tickBeforeDioramaText(dt);installDioramaText();};
