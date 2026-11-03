// Random encounters use an isolated scene, an authored flat combat floor and
// regional PixelLab scenery. Exploration geometry never becomes the arena.
const BATTLE_STAGES53={
 waterfall:{name:'Silverfall clearing',region:'River valleys',key:'#fff0ce',fill:'#a7cfdf',water:[.18,.86,.39,.56]},
 woodland:{name:'The deepwood glade',region:'Woodland',key:'#fff0cb',fill:'#a3c8b6'},
 orchard:{name:'Alderbridge orchards',region:'Orchard country',key:'#ffe3b1',fill:'#b7cfba'},
 ruins:{name:'The forgotten court',region:'Ancient remnants',key:'#e6f0e6',fill:'#9cbfc7'},
 cavern:{name:'Azure grotto',region:'Underground',key:'#b4e2fc',fill:'#718ab4',water:[.17,.84,.38,.56]},
 mountain:{name:'Pine ridge pass',region:'Highland trails',key:'#edf4ff',fill:'#a0bad2'},
 snow:{name:'The northern snowfield',region:'Northern mountains',key:'#f1f5ff',fill:'#9eafce'},
 coast:{name:'The sapphire coast',region:'Coastal roads',key:'#ffeacb',fill:'#a1c8dc',water:[.12,.90,.39,.58]},
 royalRoad:{name:'The Highmere approach',region:'Royal roads',key:'#ffebc8',fill:'#b5cbd2'},
 moonlit:{name:'The elderwood hollow',region:'Old woodland',key:'#f1edd3',fill:'#adc7b9'},
 grassMeadow:{name:'Greenreach meadow',region:'Open grasslands',key:'#fff0cd',fill:'#abc9ba',grassland:true},
 grassRiver:{name:'The willow riverbend',region:'River grasslands',key:'#ffedcc',fill:'#aacbcb',grassland:true},
 grassFlowers:{name:'The flowering prairie',region:'Wildflower grasslands',key:'#fff0ce',fill:'#abc6b9',grassland:true},
 grassDowns:{name:'The chalk downs',region:'Coastal grasslands',key:'#f5edcf',fill:'#a2c8d5',grassland:true},
 grassWindmill:{name:'Windmill pasture',region:'Pastoral grasslands',key:'#ffe5ba',fill:'#b5c9b9',grassland:true},
 grassAutumn:{name:'The amber meadow',region:'Autumn grasslands',key:'#ffdbac',fill:'#c5c1b3',grassland:true},
 grassStones:{name:'The standing-stone field',region:'Upland grasslands',key:'#eeeaca',fill:'#a6c5c9',grassland:true},
 grassHills:{name:'The foothill commons',region:'Highland grasslands',key:'#eef2db',fill:'#a1bfd0',grassland:true},
 grassBirch:{name:'The birch meadow',region:'Meadow fringes',key:'#fff1cf',fill:'#b2cebe',grassland:true},
 grassTwilight:{name:'The violet grasslands',region:'Open grasslands',key:'#f2d0c5',fill:'#abc3bb',grassland:true}
};
const encounter53={phase:'idle',time:0,duration:0,swapped:false,active:false,owner:null,recent:[],history:[],selected:null,scene:null,resources:null,origin:null,visibility:null,lighting:null,returnOutcome:null,stats:{entries:0,returns:0,rendered:0,blockedInputs:0}};
function regionForBattle53(){
 if(activeScene.kind!=='overworld')return activeScene.key;
 if(typeof macroBiome15==='function'&&macroBiome15(player.x,player.z)>1.55)return 'snow';
 const close=Object.entries(POIS).sort((a,b)=>Math.hypot(player.x-a[1].node[0],player.z-a[1].node[1])-Math.hypot(player.x-b[1].node[0],player.z-b[1].node[1]));return close[0]?.[0]??'brookstead';
}
function stagePool53(region=regionForBattle53()){
 const pools={brookstead:['waterfall','woodland','orchard'],fern:['woodland','waterfall','ruins'],alder:['orchard','woodland','waterfall'],highmere:['royalRoad','ruins','orchard'],relief:['mountain','woodland','royalRoad'],harbor:['coast','waterfall','mountain'],snow:['snow','mountain'],patrol:['mountain','woodland','ruins'],depths:['cavern','ruins'],nearbySite:['ruins','cavern','mountain'],alderRemnant:['ruins','cavern'],fernClearing:['woodland','waterfall','ruins'],alderClearing:['orchard','woodland'],reliefClearing:['mountain','woodland'],siteClearing:['ruins','cavern']};
 const grass={brookstead:['grassMeadow','grassRiver','grassFlowers','grassWindmill','grassBirch'],fern:['grassBirch','grassFlowers','grassStones'],alder:['grassWindmill','grassAutumn','grassMeadow','grassFlowers'],highmere:['grassMeadow','grassWindmill','grassStones'],relief:['grassHills','grassStones','grassAutumn'],harbor:['grassDowns','grassRiver','grassFlowers'],patrol:['grassHills','grassStones'],fernClearing:['grassBirch','grassFlowers'],alderClearing:['grassMeadow','grassAutumn'],reliefClearing:['grassHills','grassStones']};
 const pool=[...(pools[region]??['waterfall','woodland','mountain']),...(grass[region]??[])];
 if(['brookstead','fern','patrol','fernClearing'].includes(region))pool.push('moonlit');if(grass[region])pool.push('grassTwilight');
 return pool;
}
function chooseStage53(){
 if(encounter53.owner!==state){encounter53.owner=state;encounter53.recent=[];encounter53.history=[];}
 const region=regionForBattle53(),pool=stagePool53(region),last=encounter53.recent.at(-1),serial=state.encounterSerial??0;
 const index=serial%pool.length,candidate=pool[index]===last&&pool.length>1?pool[(index+1)%pool.length]:pool[index];
 const key=encounter53.nextStage53&&BATTLE_STAGES53[encounter53.nextStage53]?encounter53.nextStage53:candidate;delete encounter53.nextStage53;
 encounter53.recent.push(key);if(encounter53.recent.length>5)encounter53.recent.shift();encounter53.history.push({key,region});if(encounter53.history.length>60)encounter53.history.shift();return key;
}
function ensureStageResources53(){
 if(encounter53.resources)return;
 const stageScene=new THREE.Scene();stageScene.name='Dedicated random encounter stage';
 const material=new THREE.ShaderMaterial({depthWrite:false,depthTest:false,toneMapped:false,uniforms:{map:{value:textures.battle53_waterfall},imageAspect:{value:688/384},screenAspect:{value:innerWidth/innerHeight},time:{value:0},waterArea:{value:new THREE.Vector4(0,0,0,0)}},
  vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,.9999,1.);}',
  fragmentShader:`uniform sampler2D map;uniform float imageAspect,screenAspect,time;uniform vec4 waterArea;varying vec2 v;
  void main(){vec2 uv=v-.5;uv*=vec2(min(1.,screenAspect/imageAspect),min(1.,imageAspect/screenAspect));uv+=.5;
   float wet=smoothstep(waterArea.x,waterArea.x+.06,uv.x)*(1.-smoothstep(waterArea.y-.06,waterArea.y,uv.x))*smoothstep(waterArea.z,waterArea.z+.018,uv.y)*(1.-smoothstep(waterArea.w-.018,waterArea.w,uv.y));
   uv.x+=sin(uv.y*185.+time*.8)*.0008*wet;vec4 color=texture2D(map,uv);float glint=pow(max(0.,sin(uv.x*210.+sin(uv.y*135.)*3.+time*.7)),18.)*pow(max(0.,sin(uv.y*320.-time*.6)),8.);
   color.rgb+=glint*wet*.032;gl_FragColor=vec4(color.rgb,1.);
   #include <colorspace_fragment>
  }`});
 const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);backdrop.name='PixelLab regional scenery';backdrop.frustumCulled=false;backdrop.renderOrder=-100;stageScene.add(backdrop);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(120,90),new THREE.ShadowMaterial({color:'#17202b',opacity:.25,transparent:true,depthWrite:false}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;floor.layers.enable(1);stageScene.add(floor);
 const fill=new THREE.AmbientLight('#dce7ed',.35);stageScene.add(fill);
 encounter53.scene=stageScene;encounter53.resources={backdrop,material,floor,fill};
}
function clearStageEffects53(){
 for(const bank of[...Object.values(combatVfx.banks),...Object.values(combatVfx.shapes)]){bank.entries.forEach(e=>e.active=false);bank.mesh.visible=false;if(bank.mesh.isInstancedMesh)bank.mesh.count=0;else bank.mesh.geometry.instanceCount=0;}
 for(const bank of pixelRelease.pools){bank.active=false;bank.o.visible=false;bank.t.value=0;}
}
function activateStage53(key){
 ensureStageResources53();const q=encounter53,c={x:player.x,z:player.z},floorY=heightAt(c.x,c.z),party=[player,...followers];
 q.selected=key;q.homeXs=null;q.layout=null;q.cameraClip={near:camera.near,far:camera.far};q.world=world;q.parent=world.parent;q.center=c;q.floorY=floorY;q.originalScene=scene;
 q.origin={scene:state.scene,x:player.x,z:player.z,poses:party.map(a=>({a,x:a.x,z:a.z,face:a.face,id:a.characterId??a.id})),hidden:[]};
 q.visibility=new Map(world.children.map(o=>[o,o.visible]));
 q.lighting={sunParent:sun.parent,targetParent:sun.target.parent,hemiParent:hemi.parent,sunPosition:sun.position.clone(),targetPosition:sun.target.position.clone(),sunColor:sun.color.clone(),hemiColor:hemi.color.clone(),groundColor:hemi.groundColor.clone(),sunIntensity:sun.intensity,hemiIntensity:hemi.intensity,exterior:weather.exterior.value,shadow:{left:sun.shadow.camera.left,right:sun.shadow.camera.right,top:sun.shadow.camera.top,bottom:sun.shadow.camera.bottom,near:sun.shadow.camera.near,far:sun.shadow.camera.far},lights:(world.userData.lanterns??[]).map(l=>({l,position:l.position.clone(),color:l.color.clone(),intensity:l.intensity,distance:l.distance,power:l.userData.power}))};
 const spec=BATTLE_STAGES53[key],variant=battleTexture55(key),texture=variant.texture;q.phase55=variant.phase;q.textureKey55=variant.key;if(!texture)throw Error('Battle background missing: '+key);
 texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;texture.needsUpdate=true;
 q.resources.material.uniforms.map.value=texture;q.resources.material.uniforms.imageAspect.value=texture.image.width/texture.image.height;q.resources.material.uniforms.waterArea.value.fromArray(spec.water??[0,0,0,0]);q.resources.floor.position.set(c.x,floorY-.012,c.z);
 q.scene.add(world,sun,sun.target,hemi);sun.color.set(variant.night?'#bfd5ff':spec.key);sun.intensity=variant.night?2.1:2.8;hemi.color.set(variant.night?'#819ac4':spec.fill);hemi.groundColor.set(variant.night?'#343b4e':'#686552');hemi.intensity=variant.night?.95:1.1;q.resources.fill.color.set(variant.night?'#91a5cc':'#dce7ed');q.resources.fill.intensity=variant.night?.26:.35;
 sun.position.set(c.x-12,floorY+22,c.z+14);sun.target.position.set(c.x,floorY,c.z);Object.assign(sun.shadow.camera,{left:-25,right:25,top:19,bottom:-19,near:.1,far:85});sun.shadow.camera.updateProjectionMatrix();sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;
 q.keep=new Set([...party.flatMap(a=>[a.mesh,a.shadow]),...Object.values(combatVfx.banks).map(b=>b.mesh),...Object.values(combatVfx.shapes).map(b=>b.mesh),...(world.userData.lanterns??[]).slice(4,6),...(combatPointer.ring?[combatPointer.ring]:[]),...pixelRelease.pools.map(p=>p.o),...(world.userData.contacts39?.mesh?[world.userData.contacts39.mesh]:[])]);
 for(const l of world.userData.lanterns??[])l.intensity=0;
 q.active=true;weather.exterior.value=0;clearStageEffects53();maskExploration53();cameraPresentation.world=null;
 document.body.dataset.battleStage53=key;let label=$('#battle-stage53');if(!label){label=document.createElement('aside');label.id='battle-stage53';document.body.append(label);}label.textContent=spec.name;label.hidden=false;
}
function maskExploration53(){for(const[o]of encounter53.visibility??[])if(!encounter53.keep.has(o))o.visible=false;}
function deactivateStage53(){
 const q=encounter53;if(!q.active)return;clearStageEffects53();q.active=false;
 q.parent?.add(q.world);const l=q.lighting;l.sunParent?.add(sun);l.targetParent?.add(sun.target);l.hemiParent?.add(hemi);sun.position.copy(l.sunPosition);sun.target.position.copy(l.targetPosition);sun.color.copy(l.sunColor);sun.intensity=l.sunIntensity;hemi.color.copy(l.hemiColor);hemi.groundColor.copy(l.groundColor);hemi.intensity=l.hemiIntensity;
 Object.assign(sun.shadow.camera,l.shadow);sun.shadow.camera.updateProjectionMatrix();sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;weather.exterior.value=l.exterior;
 for(const s of l.lights){s.l.position.copy(s.position);s.l.color.copy(s.color);s.l.intensity=s.intensity;s.l.distance=s.distance;s.l.userData.power=s.power;delete s.l.userData.effectUntil;}
 for(const[o,visible]of q.visibility)if(o.parent)o.visible=visible;
 camera.near=q.cameraClip.near;camera.far=q.cameraClip.far;q.visibility=null;delete document.body.dataset.battleStage53;const label=$('#battle-stage53');if(label)label.hidden=true;cameraPresentation.world=null;shadow36.last=-100;q.world=q.parent=q.originalScene=q.origin=q.lighting=q.keep=q.retryBattle=null;
}
const stageHeightBefore53=heightAt,stageGroundBefore53=groundAt,stageFreeBefore53=staticFree,stageEdgeBefore53=edgeFree;
heightAt=function(...args){return encounter53.active?encounter53.floorY:stageHeightBefore53(...args);};
groundAt=function(...args){return encounter53.active?encounter53.floorY:stageGroundBefore53(...args);};
staticFree=function(x,z,r=.4){if(encounter53.active)return Math.abs(x-encounter53.center.x)<24-r&&Math.abs(z-encounter53.center.z)<16-r;return stageFreeBefore53(x,z,r);};
edgeFree=function(a,b,r=.4,...args){return encounter53.active?staticFree(a.x,a.z,r)&&staticFree(b.x,b.z,r):stageEdgeBefore53(a,b,r,...args);};
const stagePrepareBefore53=prepareBattlefield;
prepareBattlefield=function(kind){if(!encounter53.active)return stagePrepareBefore53(kind);route=null;keys.clear();openWorldDebug.battles++;return{origin:encounter53.origin,center:encounter53.center,lights:[]};};
const stageFormationBefore53=battleFormation;
battleFormation=function(c,i,enemy=false,count=state.members.length){
 if(encounter53.active){
  if(innerWidth<700&&innerHeight>innerWidth)return enemy?{x:c.x-3.5-(i%2)*1.8,z:c.z+(i-1)*1.15}:{x:c.x+2+i*.8,z:c.z+((count-1)/2-i)*.9};
  return enemy?{x:c.x-4.8-(i%2)*3.3-Math.floor(i/2)*.8,z:c.z+(i-1)*1.2}:{x:c.x+3.8-Math.max(0,count-2)*.6+i*1.8,z:c.z+((count-1)/2-i)*.95};
 }
 return stageFormationBefore53(c,i,enemy,count);
};
const stageCameraBefore53=updateCamera;
updateCamera=function(dt=1/60,instant=false){
 if(!encounter53.active||!battle)return stageCameraBefore53(dt,instant);
 const q=encounter53,cast=[player,...followers,...battle.enemies.map(e=>e.actor)],portrait=innerWidth<700&&innerHeight>innerWidth,layout=portrait?'portrait':'wide';
 if(q.layout!==layout&&!battle.animation&&!battle.combo){q.layout=layout;for(const[a,i]of[player,...followers].map((a,i)=>[a,i]))Object.assign(a,battleFormation(q.center,i,false));for(const[e,i]of battle.enemies.map((e,i)=>[e,i]))Object.assign(e.actor,battleFormation(q.center,i,true));q.homeXs=cast.map(a=>a.x);for(const a of cast)updateActor(a,0);}
 const xs=q.homeXs??cast.map(a=>a.x),lo=Math.min(...xs),hi=Math.max(...xs),aspect=innerWidth/innerHeight,distance=Math.max(26,(hi-lo+(portrait?4:7))/(2*Math.tan(THREE.MathUtils.degToRad(19))*aspect));
 cameraTarget.set((lo+hi)*.5,q.floorY+distance*.177,q.center.z);camera.position.copy(cameraTarget).add(V3(0,distance*.205,distance));camera.fov=38;camera.near=.1;camera.far=350;camera.aspect=aspect;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);
 const stretch=1/Math.cos(Math.atan(.205));for(const a of cast){a.mesh.quaternion.identity();a.mesh.scale.set(Math.sign(a.mesh.scale.x)||1,stretch,1);delete a.mesh.userData.compactParty44;a.mesh.castShadow=!a.pixelReleased&&a.mesh.visible;a.mesh.layers.enable(1);}
 sideCameraStats.angle=Math.atan(.205)*180/Math.PI;
};
const stageLightingBefore53=updateLighting;
updateLighting=function(...args){if(encounter53.active)return;return stageLightingBefore53(...args);};
const stageWorldFxBefore53=updateWorldFX;
updateWorldFX=function(dt){
 if(!encounter53.active)return stageWorldFxBefore53(dt);updateCombatVfx();
 for(const l of(world.userData.lanterns??[]).slice(4,6)){const left=(l.userData.effectUntil??0)-clock;l.intensity=left>0?(l.userData.effectPower??0)*Math.min(1,left/(l.userData.effectDuration??1)):0;}
};
const stageBudgetBefore53=updateRenderBudget;
updateRenderBudget=function(...args){if(encounter53.active)return;return stageBudgetBefore53(...args);};
const stageCutBefore53=updateCutaways;
updateCutaways=function(...args){if(encounter53.active)return;return stageCutBefore53(...args);};
const stageRenderBefore53=render;
render=function(...args){
 const q=encounter53;if(!q.active)return stageRenderBefore53(...args);
 maskExploration53();updateContacts39();weather.exterior.value=0;q.resources.material.uniforms.time.value=clock;q.resources.material.uniforms.screenAspect.value=innerWidth/innerHeight;
 shadow36.due=true;sun.shadow.needsUpdate=true;renderer.shadowMap.needsUpdate=true;renderer.setRenderTarget(null);renderer.setScissorTest(false);const size=renderer.getSize(new THREE.Vector2());renderer.setViewport(0,0,size.x,size.y);renderer.clear();renderer.render(q.scene,camera);updateCombatPointer();q.stats.rendered++;
};
function transitionNode53(){
 let node=$('#encounter-transition53');if(node)return node;node=document.createElement('div');node.id='encounter-transition53';node.hidden=true;node.setAttribute('aria-hidden','true');node.innerHTML='<div class="encounter-rays53"></div><div class="encounter-cover53"></div><div class="encounter-seal53"><img src="'+assets.images.ui50_light+'" alt=""><span></span></div>';document.body.append(node);return node;
}
function startEncounterCover53(phase,duration){
 const q=encounter53;q.phase=phase;q.time=0;q.duration=duration;q.swapped=false;keys.clear();route=null;player.speed=0;state.mode='encounter';
 const node=transitionNode53();node.hidden=false;node.dataset.phase=phase;node.classList.toggle('reduced53',state.settings.motion===false||matchMedia('(prefers-reduced-motion:reduce)').matches);node.querySelector('span').textContent=phase==='enter'?BATTLE_STAGES53[q.selected].name:'';node.style.setProperty('--cover53','0');node.style.setProperty('--rays53','0');
 $('#interact').classList.add('hidden');$('#toast').classList.remove('show');
}
const stageBeginBefore53=beginBattle;
beginBattle=function(kind,...args){
 if(encounter53.phase!=='idle')return;
 if(kind!=='random')return stageBeginBefore53(kind,...args);
 if(battle||gameLoading||sceneSwitchPending||poiFade.active||dialogue||eventAction||transition||restoration)return;
 closeMenu();if([player,...followers].map(a=>a.characterId??a.id.replace('Ascended','')).join(',')!==state.members.join(','))setupParty([player.x,player.z]);
 encounter53.selected=chooseStage53();startEncounterCover53('enter',state.settings.motion===false?.46:.84);playSound('combat-select',.32);
};
const stageEndBefore53=endBattle;
endBattle=function(outcome,...args){
 if(!encounter53.active)return stageEndBefore53(outcome,...args);
 if(encounter53.phase!=='idle')return;encounter53.returnOutcome=outcome;startEncounterCover53('exit',state.settings.motion===false?.34:.54);
};
const stageOutcomeBefore53=checkBattleOutcome;
checkBattleOutcome=function(...args){
 const result=stageOutcomeBefore53(...args);
 if(encounter53.active&&battle?.status==='defeat'&&encounter53.retryBattle!==battle){
  encounter53.retryBattle=battle;
  $('#retry-battle').onclick=()=>{encounter53.retryRequested=true;restoreParty();endBattle('retry');};
 }
 return result;
};
function advanceEncounterCover53(dt){
 const q=encounter53,node=transitionNode53();q.time+=dt;const p=clamp(q.time/q.duration,0,1),cover=p<.48?smooth(0,.44,p):1-smooth(.56,1,p);node.style.setProperty('--cover53',cover);node.style.setProperty('--rays53',Math.sin(p*Math.PI));node.style.setProperty('--turn53',p+'turn');
 if(p>=.48&&!q.swapped){q.swapped=true;
  if(q.phase==='enter'){
   activateStage53(q.selected);stageBeginBefore53('random');battle.stage53=q.selected;q.homeXs=[player,...followers,...battle.enemies.map(e=>e.actor)].map(a=>a.x);battle.intro=.38;battle.started=clock;state.mode='encounter';
   for(const a of[player,...followers,...battle.enemies.map(e=>e.actor)]){updateActor(a,0);a.presentationPrevious=a.mesh.position.clone();a.presentationCurrent=a.mesh.position.clone();}
   updateCamera(1,true);renderer.compile(q.scene,camera);q.stats.entries++;
  }else{
   deactivateStage53();stageEndBefore53(q.returnOutcome);q.returnOutcome=null;state.encounterDistance=0;for(const a of actors)updateActor(a,0);updateLighting();updateCamera(1,true);updateRenderBudget(true);state.mode='encounter';q.stats.returns++;
  }
 }
 if(p>=1){const entered=q.phase==='enter';q.phase='idle';node.hidden=true;state.mode=entered?'battle':'explore';keys.clear();cameraPresentation.world=null;updateHUD();if(!entered&&q.retryRequested){q.retryRequested=false;q.retryBattle=null;beginBattle('random');}}
}
const stageTickBefore53=tick;
tick=function(dt){if(encounter53.phase!=='idle'){advanceEncounterCover53(dt);return;}return stageTickBefore53(dt);};
for(const type of['keydown','keyup','pointerdown','click','wheel'])document.addEventListener(type,e=>{
 if(encounter53.phase==='idle')return;
 if((type==='keydown'||type==='keyup')&&!['w','a','s','d','e','m','i','c','j','f','escape','enter',' ','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(e.key.toLowerCase()))return;
 if(e.cancelable)e.preventDefault();e.stopImmediatePropagation();keys.clear();encounter53.stats.blockedInputs++;
},true);
const stageBuildBefore53=buildWorld;
buildWorld=function(...args){encounter53.retryRequested=false;if(encounter53.active)deactivateStage53();if(encounter53.phase!=='idle'){encounter53.phase='idle';const n=$('#encounter-transition53');if(n)n.hidden=true;}return stageBuildBefore53(...args);};
const stageBootBefore53=boot;
boot=async function(...args){const r=await stageBootBefore53(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before());q.encounterStage={phase:encounter53.phase,progress:encounter53.phase==='idle'?null:+Math.min(1,encounter53.time/encounter53.duration).toFixed(2),active:encounter53.active,key:encounter53.active?encounter53.selected:null,timeOfDay:encounter53.active?encounter53.phase55:null,texture:encounter53.active?encounter53.textureKey55:null,separateScene:encounter53.active&&encounter53.scene!==scene,flatFloor:encounter53.active?encounter53.floorY:null,history:encounter53.history.slice(-10),stats:{...encounter53.stats}};return JSON.stringify(q);};return r;};
