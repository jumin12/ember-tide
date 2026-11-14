// Ownership unlocks the whole threshold, including its collision and service.
// The stone remains in a small independent batch so an unowned town cannot
// retain a baked copy of the arch after the visible portal group is hidden.
let homeReveal146=null;
const homeCastMeta146={url:'elyndor/assets/runtime-v146/keeper-cast.png',w:256,h:256,unit:204.8,gutter:12.8,cols:5,rows:1,frames:{south:[0],cast:[0,1,2,3,4]},frameRate:{cast:5}};
ASSETS.sprites.azarithCast146=homeCastMeta146;
// Match the original keeper's opaque height and boot baseline, not the tail's
// changing bounds. All five poses keep their feet on the same patch of ground.
const HOME_CAST_ANCHORS146=[{scale:.9974,y:.0004,x:0},{scale:1.0233,y:.0003,x:0},{scale:1.0287,y:-.0048,x:0},{scale:1.0233,y:.0003,x:0},{scale:1.0128,y:.0003,x:0}];
function warmHomeCast146(){return ensureSprite116('azarithCast146');}
const homeConceptOpenBefore146=openHousing139;
openHousing139=function(...args){if(homeReveal146)return;const r=homeConceptOpenBefore146(...args);if(housingMenu139.open)warmHomeCast146().catch(()=>{});return r;};
function homeStoneShader146(material,uniform,depth=false){
 const before=material.onBeforeCompile,cache=material.customProgramCacheKey.bind(material);material.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.homeReveal146=uniform;s.vertexShader='varying float homeHeight146;varying vec3 homePoint146;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nhomeHeight146=position.y;homePoint146=position;');s.fragmentShader='varying float homeHeight146;varying vec3 homePoint146;uniform float homeReveal146;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
 float homeEdge146=homeReveal146*5.5-homeHeight146;float homeNoise146=fract(sin(dot(homePoint146*10.,vec3(12.9898,78.233,37.719)))*43758.5453)*.035;if(homeEdge146<homeNoise146)discard;`);
 if(!depth)s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','outgoingLight+=vec3(1.4,.74,.18)*(1.-smoothstep(.02,.24,homeEdge146-homeNoise146))*(1.-step(.999,homeReveal146));\n#include <opaque_fragment>');};material.customProgramCacheKey=()=>cache()+':home-stone-reveal146';
}
function makeHomeRevealFX146(portal){
 const group=new THREE.Group();group.name='The keeperâ€™s Homeward spell';group.userData.dynamicFX=true;world.add(group);group.visible=false;
 const u={age:{value:0},from:{value:V3()},to:{value:V3()},power:{value:0}},geo=new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1,1)),seeds=new Float32Array(168*3);for(let i=0;i<168;i++)seeds.set([i*.618033988%1,i*.414213562%1,i*.732050808%1],i*3);geo.setAttribute('seed146',new THREE.InstancedBufferAttribute(seeds,3));geo.instanceCount=168;
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:u,vertexShader:`attribute vec3 seed146;uniform float age,power;uniform vec3 from,to;varying vec2 v146;varying float life146,blue146;
 void main(){v146=uv;float f=fract(seed146.x+age*(.7+seed146.z*.35)),a=seed146.y*6.283185+age*1.4;vec3 p;float life=1.;
 if(seed146.z<.58){p=mix(from,to,f)+vec3(sin(a)*.13,sin(f*3.14159)*(.8+seed146.y*.8),cos(a)*.13);life=sin(f*3.14159)*smoothstep(.35,.85,age)*(1.-smoothstep(2.7,3.6,age));}
 else if(seed146.z<.88){float h=fract(seed146.x+age*.24);p=to+vec3(sin(a+h*3.)*(.7+seed146.y*.6),-1.8+h*4.2,cos(a+h*3.)*.44);life=sin(h*3.14159)*smoothstep(1.2,2.,age)*(1.-smoothstep(4.0,5.2,age));}
 else{p=from+vec3(sin(a)*(.12+f*.4),cos(a*1.3)*.2+f*.4,cos(a)*.15);life=sin(f*3.14159)*smoothstep(0.,.35,age)*(1.-smoothstep(1.6,2.6,age));}
 life146=max(0.,life)*power;blue146=smoothstep(2.2,4.,age);float size=(.055+seed146.y*.12)*(1.+sin(age*3.+seed146.x*12.)*.15);vec4 eye=viewMatrix*vec4(p,1.);eye.xy+=position.xy*size;gl_Position=projectionMatrix*eye;}`,fragmentShader:`varying vec2 v146;varying float life146,blue146;void main(){vec2 p=(v146-.5)*2.;float r=length(p),core=exp(-r*r*16.),cross=exp(-abs(p.x)*23.)*exp(-abs(p.y)*4.)+exp(-abs(p.y)*23.)*exp(-abs(p.x)*4.);float alpha=(core+cross*.6)*life146;if(alpha<.004)discard;gl_FragColor=vec4(mix(vec3(1.3,.78,.19),vec3(.28,.84,1.2),blue146),min(.95,alpha));}`});
 const particles=new THREE.Mesh(geo,material);particles.frustumCulled=false;particles.userData.dynamicFX=true;group.add(particles);
 // A coherent luminous thread links the actual outstretched paw to the
 // threshold. Smaller suspended sparks surround it, rather than replacing it.
 const threadMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:u,vertexShader:`uniform float age;uniform vec3 from,to;varying vec2 uv146;void main(){uv146=uv;float f=uv.x;vec3 p=mix(from,to,f)+vec3(0.,sin(f*3.14159265)*1.15,0.);p.y+=sin(f*18.-age*7.)*.025;vec4 eye=viewMatrix*vec4(p,1.);eye.y+=position.y*.16;gl_Position=projectionMatrix*eye;}`,fragmentShader:`varying vec2 uv146;uniform float age,power;void main(){float f=uv146.x,side=abs(uv146.y-.5)*2.,head=smoothstep(.55,1.25,age);float path=1.-smoothstep(head-.04,head,f);float fade=smoothstep(.45,.85,age)*(1.-smoothstep(2.5,3.15,age));float pulse=.65+.35*pow(.5+.5*sin(f*45.-age*12.),5.);float alpha=(exp(-side*side*7.)*.3+exp(-side*side*70.)*.7)*fade*path*pulse*power;if(alpha<.004)discard;gl_FragColor=vec4(mix(vec3(1.3,.75,.17),vec3(.5,.85,1.3),f*.65),alpha);}`});
 const thread=new THREE.Mesh(new THREE.PlaneGeometry(1,1,80,1),threadMaterial);thread.frustumCulled=false;thread.userData.dynamicFX=true;group.add(thread);
 const ringMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:u,vertexShader:'varying vec2 uv146;void main(){uv146=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec2 uv146;uniform float age,power;void main(){vec2 p=(uv146-.5)*2.;float r=length(p),a=atan(p.y,p.x),turn=mod(a+3.14159,6.28318)/6.28318,head=clamp((age-.8)/1.3,0.,1.);float draw=1.-smoothstep(head-.035,head,turn),ring=exp(-pow((r-.76)/.009,2.))+exp(-pow((r-.87)/.006,2.))*.5;float glyph=pow(max(0.,cos(a*12.)),34.)*exp(-pow((r-.81)/.024,2.));float fade=smoothstep(.6,1.1,age)*(1.-smoothstep(3.9,5.2,age));float alpha=(ring+glyph*.8)*draw*fade*power;if(alpha<.004)discard;gl_FragColor=vec4(1.2,.77,.24,alpha*.75);}`});
 const ring=new THREE.Mesh(new THREE.PlaneGeometry(1,1),ringMaterial);ring.rotation.x=-Math.PI/2;ring.userData.dynamicFX=true;ring.castShadow=false;group.add(ring);
 const light=new THREE.PointLight('#f8c968',0,7,2);world.add(light);return{group,uniforms:u,ring,light};
}
const homePortalBefore146=homePortal139;
homePortal139=function(...args){
 const g=homePortalBefore146(...args),p=g.userData.portal144;p.blocker146=colliders.at(-1);p.service146=interactables.at(-1);p.stoneReveal146={value:1};p.open146={value:1};p.nativePortal146=true;
 const foot=g.children.find(o=>o.geometry?.type==='CylinderGeometry'),shell=new THREE.Group();shell.name='Materializing threshold stone';g.add(shell);for(const o of[...g.children])if(o!==foot&&o.isMesh&&o.material.isMeshStandardMaterial)shell.add(o);mergeGroup(shell);p.shell146=shell;p.foot146=foot;
 // The frontage pass seats this cylinder into the actual sloping ground.
 // Keep it directly accessible until that pass has shaped its lower rim.
 for(const o of [...shell.children,...(foot?[foot]:[])]){o.material=o.material.clone();homeStoneShader146(o.material,p.stoneReveal146);o.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking});homeStoneShader146(o.customDepthMaterial,p.stoneReveal146,true);}
 p.material.uniforms.open146=p.open146;p.material.fragmentShader=p.material.fragmentShader.replace('uniform float time,energy;','uniform float time,energy,open146;').replace('gl_FragColor=vec4(col,1.);',`float rr146=length(vec2(p.x/1.1,(p.y-2.15)/2.05));if(rr146>open146*1.5)discard;col+=vec3(.45,.72,.25)*exp(-pow((rr146-open146*1.5)/.025,2.))*(1.-step(.999,open146));gl_FragColor=vec4(col,1.);`);p.material.needsUpdate=true;
 g.traverse(o=>{if(o.isMesh||o.isPoints)o.userData.dynamicFX=true;});
 // Keep the light in the prepared scene even while the unowned portal is
 // absent; changing intensity never recompiles the worldâ€™s light-count shader.
 g.remove(p.light);world.add(p.light);p.fx146=makeHomeRevealFX146(p);return g;
};
function syncHomePortal146(p,force=false){
 const town=!!p.group.userData.townPortal140,owns=!!housing139().home,revealing=homeReveal146?.portal===p,show=!town||owns,solid=show&&!revealing;
 if(force||p.solid146!==solid){const index=colliders.indexOf(p.blocker146);if(solid&&index<0)colliders.push(p.blocker146);if(!solid&&index>=0)colliders.splice(index,1);p.solid146=solid;rebuildColliderGrid();world.userData.navCache?.clear();roadNavGraph=null;renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;shadowBudget138.at=-Infinity;}
 p.service146.disabled146=!solid;p.group.visible=show&&(!revealing||homeReveal146.age>1.25);p.light.position.copy(V3(0,2.1,1.1).applyMatrix4(p.group.matrixWorld));
 if(!show||revealing){p.light.intensity=0;p.motes.visible=false;}
 else{p.stoneReveal146.value=p.open146.value=1;p.motes.visible=true;}
}
const townHousingBefore146=addTownHousing140;
addTownHousing140=function(...args){const r=townHousingBefore146(...args);for(const p of world?.userData.homePortals139??[])if(p.nativePortal146)syncHomePortal146(p,true);return r;};
const homeAvailableBefore146=interactionAvailable;
interactionAvailable=function(o,...args){if(o?.disabled146||homeReveal146)return false;return homeAvailableBefore146(o,...args);};
const homeMapMarkersBefore146=mapMarkers51;
mapMarkers51=function(...args){return homeMapMarkersBefore146(...args).filter(m=>m.id!=='townHomePortal139'||!!housing139().home);};
function homeRevealNode146(){let node=$('#home-reveal146');if(node)return node;node=document.createElement('div');node.id='home-reveal146';node.hidden=true;node.innerHTML='<div class="home-reveal-caption146"><span>THE HOMEWARD SPELL</span><p>A path to your own hearth</p></div><button id="home-reveal-skip146">Skip <kbd>Esc</kbd></button>';document.body.append(node);node.querySelector('button').onclick=()=>finishHomeReveal146();return node;}
function restoreKeeperCast146(q){if(!q.keeper||q.world!==world)return;const a=q.keeper;a.mesh.scale.set(1,1,1);if(a.visualId==='azarithCast146')replaceActorArt(a,'azarith');a.action='idle';a.speed=0;a.homewardUntil139=clock+.15;updateActor(a,0);}
function finishHomeReveal146(showMenu=true){const q=homeReveal146;if(!q)return;homeReveal146=null;document.body.classList.remove('home-reveal146');homeRevealNode146().hidden=true;if(q.world===world){restoreKeeperCast146(q);q.portal.fx146.group.visible=false;q.portal.fx146.light.intensity=0;q.portal.stoneReveal146.value=q.portal.open146.value=1;q.portal.energy=0;state.mode=q.mode;for(const r of q.party){r.a.mesh.visible=true;r.a.mesh.scale.set(1,1,1);r.a.speed=0;r.a.action='idle';updateActor(r.a,0);}syncHomePortal146(q.portal,true);updateCamera(1,true);if(showMenu&&!gameLoading&&!sceneSwitchPending){openHousing139('browse');housingMenu139.index=Math.max(0,homeCatalog139().findIndex(c=>c.id===housing139().home.region));housingMenu139.message='Your Homeward portal is ready.';renderHousing139();}}keys.clear();route=null;}
function beginHomeReveal146(){
 const keeper=world?.userData.homeKeeper139?.a,portal=world?.userData.homePortals139?.find(p=>p.group.userData.townPortal140);if(!keeper||!portal||!housing139().home)return;
 closeHousing139();hideDevConsole60();keys.clear();route=null;portal.group.updateWorldMatrix(true,true);const q=homeReveal146={world,keeper,portal,age:0,loading:true,castReady:false,mode:state.mode,camera:{position:camera.position.clone(),target:cameraTarget.clone(),fov:camera.fov},party:[player,...followers].map(a=>({a,from:V3(a.x,0,a.z),to:V3(a.x,0,a.z)}))};
 state.mode='action';portal.stoneReveal146.value=portal.open146.value=0;syncHomePortal146(portal,true);document.body.classList.add('home-reveal146');homeRevealNode146().hidden=false;$('#toast')?.classList.remove('show');portal.fx146.group.visible=true;
 const p=portal.blocker146;for(const row of q.party){if(Math.abs(row.a.x-p.x)<p.w+.65&&Math.abs(row.a.z-p.z)<p.d+.65){const spot=world.userData.homeService139.keeperApproach140??{x:keeper.x,z:keeper.z+2};const safe=safePoint(spot,.5);row.to.set(safe.x+(row.a===player?0:.4),0,safe.z);}}
 warmHomeCast146().then(()=>{if(homeReveal146!==q)return;replaceActorArt(keeper,'azarithCast146');q.castReady=true;}).catch(()=>{}).finally(()=>{if(homeReveal146===q)q.loading=false;});
}
const homeActionBefore146=housingAction139;
housingAction139=async function(action){if(homeReveal146)return;const q=housingMenu139,buy=action==='confirm'&&q.confirm==='purchase',before=housing139().home,r=await homeActionBefore146(action);if(buy&&housing139().home&&housing139().home!==before&&!isHomeScene139()&&world?.userData.homeKeeper139)beginHomeReveal146();return r;};
const homeCameraRevealBefore146=updateCamera;
updateCamera=function(...args){const r=homeCameraRevealBefore146(...args),q=homeReveal146;if(!q||q.world!==world)return r;const a=q.keeper,g=q.portal.group,mid=V3((a.x+g.position.x)/2,heightAt(a.x,a.z)+1.65,(a.z+g.position.z)/2),blend=smooth(0,.8,q.age)*(1-smooth(4.65,5.4,q.age)),offset=q.camera.position.clone().sub(q.camera.target).multiplyScalar(.88),position=mid.clone().add(offset),target=q.camera.target.clone().lerp(mid,blend);camera.position.copy(q.camera.position).lerp(position,blend);camera.fov=mix(q.camera.fov,q.camera.fov*.96,blend);camera.updateProjectionMatrix();camera.lookAt(target);camera.updateMatrixWorld(true);cameraTarget.copy(target);focusPoint.copy(target);if(post?.material?.uniforms.focus)post.material.uniforms.focus.value=camera.position.distanceTo(target);return r;};
const homeKeeperBefore146=updateHomeKeeper139;
updateHomeKeeper139=function(...args){const q=homeReveal146;if(!q||!q.castReady)return homeKeeperBefore146(...args);if(homeKeeperIcon139)homeKeeperIcon139.hidden=true;};
const homeRevealTickBefore146=tick;
tick=function(dt){const r=homeRevealTickBefore146(dt);if(!world)return r;for(const p of world.userData.homePortals139??[])if(p.nativePortal146)syncHomePortal146(p);const q=homeReveal146;if(!q)return r;if(q.world!==world){finishHomeReveal146(false);return r;}if(q.loading||gameLoading||devConsole60.open||menu)return r;q.age+=Math.max(0,Math.min(dt,.05));const age=q.age,a=q.keeper,p=q.portal;
 for(const row of q.party){const t=smooth(0,.8,age),x=mix(row.from.x,row.to.x,t),z=mix(row.from.z,row.to.z,t),moving=Math.hypot(x-row.a.x,z-row.a.z)>.001;row.a.face=facingForMotion(a.x-x,a.z-z);row.a.speed=moving?2.0:0;row.a.action=moving?'walk':'idle';row.a.phase+=Math.hypot(x-row.a.x,z-row.a.z)*6;row.a.x=x;row.a.z=z;updateActor(row.a,0);}
 const sequence=age<1.75?clamp(Math.floor(age/1.75*5),0,4):age<4.35?4:clamp(4-Math.floor((age-4.35)/.2),0,4);
 if(q.castReady){setActorFrame(a,'cast',sequence);const an=HOME_CAST_ANCHORS146[sequence];a.mesh.scale.set(an.scale,an.scale,1);a.mesh.position.set(a.x+an.x*a.size,heightAt(a.x,a.z)+.015+an.y*a.size,a.z);const screen=V3(p.group.position.x,0,p.group.position.z).sub(V3(a.x,0,a.z)).dot(V3(1,0,0).applyQuaternion(camera.quaternion));if(screen>0){a.mesh.material.map.repeat.x=-1/5;a.mesh.material.map.offset.x=(sequence+1)/5;}}
 else{a.homewardUntil139=clock+.2;setActorFrame(a,'homewardKey',0);}
 const fx=p.fx146,from=V3(a.x,heightAt(a.x,a.z)+a.size*.57,a.z).addScaledVector(V3(1,0,0).applyQuaternion(camera.quaternion),.56*Math.sign(V3(p.group.position.x-a.x,0,p.group.position.z-a.z).dot(V3(1,0,0).applyQuaternion(camera.quaternion)))),to=V3(0,2.0,.1).applyMatrix4(p.group.matrixWorld);fx.uniforms.age.value=age;fx.uniforms.from.value.copy(from);fx.uniforms.to.value.copy(to);fx.uniforms.power.value=1;fx.ring.position.copy(V3(0,.028,0).applyMatrix4(p.group.matrixWorld));fx.ring.scale.setScalar(5.5*p.group.scale.x);fx.light.position.copy(from).add(V3(0,.6,1));fx.light.intensity=3.1*smooth(.1,.8,age)*(1-smooth(2.,3.2,age));
 p.stoneReveal146.value=smooth(1.3,3.10,age);p.open146.value=smooth(2.55,3.85,age);p.group.visible=age>1.25;p.motes.visible=age>3.2;p.energy=smooth(2.7,3.7,age)*(1-smooth(4.4,5.4,age));p.material.uniforms.energy.value=p.energy;p.light.color.set(age<3?'#e9bd66':'#68ced9');p.light.intensity=6.8*smooth(1.5,3.4,age)*(1-smooth(4.3,5.4,age))+2.5*smooth(4.3,5.4,age);if(age>1.25&&age<3.2)renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;
 updateCamera(0,true);if(age>=5.45)finishHomeReveal146();return r;};
for(const type of['keydown','keyup','pointerdown','touchstart'])window.addEventListener(type,e=>{if(!homeReveal146)return;if(e.target.closest?.('#home-reveal-skip146'))return;if(type==='keydown'&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finishHomeReveal146();return;}e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});
const homeRevealBootBefore146=boot;
boot=async function(...args){const r=await homeRevealBootBefore146(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const d=JSON.parse(before());d.homePortal146={owned:!!housing139().home,revealing:!!homeReveal146,age:homeReveal146?+homeReveal146.age.toFixed(2):null,portals:(world?.userData.homePortals139??[]).map(p=>({visible:p.group.visible,solid:p.solid146,reveal:p.stoneReveal146?.value,opening:p.open146?.value}))};return JSON.stringify(d);};return r;};
const homeRevealDisposeBefore146=disposeContinuousWorld;
disposeContinuousWorld=function(...args){
 if(homeReveal146?.world===world)finishHomeReveal146(false);
 // Scene residency already reference-counts custom depth materials. Release
 // these two owned reveal shaders when the location is actually evicted.
 for(const p of world?.userData.homePortals139??[])if(p.nativePortal146)for(const o of [...p.shell146.children,...(p.foot146?[p.foot146]:[])])o.customDepthMaterial?.dispose();
 return homeRevealDisposeBefore146(...args);
};
