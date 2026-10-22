// Continuous time, registered idle sprites, collision clearance and village architecture.
const idleSources=['/* IDLE_00 */','/* IDLE_01 */','/* IDLE_02 */','/* IDLE_03 */','/* IDLE_04 */','/* IDLE_05 */','/* IDLE_06 */','/* IDLE_07 */','/* IDLE_08 */','/* IDLE_09 */','/* IDLE_10 */','/* IDLE_11 */','/* IDLE_12 */','/* IDLE_13 */','/* IDLE_14 */','/* IDLE_15 */','/* IDLE_16 */'];
const flippedPoses=new WeakMap();
function mirroredPose(texture){if(!texture)return texture;let t=flippedPoses.get(texture);if(!t){t=texture.clone();t.repeat.x=-1;t.offset.x=1;t.needsUpdate=true;t.userData.mirrored=true;flippedPoses.set(texture,t)}return t}
function idlePoseIndex(a,length=4){const t=(clock+a.phase*1.71)%4.8;return (t<1.3?0:t<2.2?1:t<2.36?2:t<3.55?3:0)%length}
const loadMovingCharacters=loadNPCs;
loadNPCs=async function(){await loadMovingCharacters();for(let index=0;index<idleSources.length;index++){
 const image=new Image();image.src=idleSources[index];await image.decode();const raw=atlasRows(image,4).map(b=>Array.from({length:4},(_,c)=>completePose(image,c,b,index===3,4))),heights=raw.flat().map(p=>p.height).sort((a,b)=>a-b),scale=72/heights[8],anims=assets.animations[index],old=assets.frames[index][0].image;
 let width=old.width,height=old.height;for(const p of raw.flat()){width=Math.max(width,Math.ceil((Math.max(p.root-p.x0,p.x1-p.root)*scale*2+16)/8)*8);height=Math.max(height,Math.ceil((p.height*scale+16)/8)*8)}
 if(width!==old.width||height!==old.height){for(const name of Object.keys(anims))anims[name]=anims[name].map(t=>{const c=document.createElement('canvas');c.width=width;c.height=height;c.getContext('2d').drawImage(t.image,(width-old.width)/2,height-old.height);return textureFromCanvas(c)})}
 raw.forEach((row,r)=>{anims['idle_'+['south','west','east','north'][r]]=row.map(p=>{const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(p.canvas,Math.round(width/2-p.root*scale),Math.round(height-5-p.y1*scale),Math.round(p.canvas.width*scale),Math.round(p.canvas.height*scale));return textureFromCanvas(c)})});assets.frames[index]=anims.south;
 const audit=atlasAudit.find(a=>a.index===index);audit.canvas=[width,height];audit.poseCount+=16;audit.idleFrames=4;audit.sourceEdgeSamples.push(...raw.map(row=>row.map(p=>p.sourceEdge)));
 if(index<2)document.documentElement.style.setProperty('--portrait'+index,`url("${anims.idle_south[0].image.toDataURL()}")`);
 }};

const oldStaticBlocked=staticBlocked;
staticBlocked=function(x,z,r=.28){if(oldStaticBlocked(x,z,r))return true;for(const p of buildingPlots){const front=p.z+p.d/2,back=p.z-p.d/2;if(x>p.x-p.w/2-.25-r&&x<p.x+p.w/2+.25+r&&z>back-.18-r&&z<front+.8+r)return true}return false};
function canTraverse(x,z,nx,nz,r=.44){const steps=Math.max(1,Math.ceil(Math.hypot(nx-x,nz-z)/.12));let h=heightAt(x,z);for(let i=1;i<=steps;i++){const t=i/steps,xx=x+(nx-x)*t,zz=z+(nz-z)*t,nh=heightAt(xx,zz);if(staticBlocked(xx,zz,r)||Math.abs(nh-h)>.61)return false;h=nh}return true}
const checkedMoveActor=moveActor;
moveActor=function(a,x,z){if(a.villager&&nav&&!canTraverse(a.x,a.z,x,z,.44)){a.walk=0;return false}checkedMoveActor(a,x,z);return true};
const workFacing={2:['northwest','north','southwest'],4:['south','west','south'],5:['west','west','west'],6:['south','east','south'],7:['north','east','northwest'],8:['south','north','north','north','east'],9:['south','west','east'],12:['east','north','west','east'],13:['west','east','west'],14:['north','northwest','north'],15:['south','east','south']};
const villageMovement=updateVillageLife;
updateVillageLife=function(dt){villageMovement(dt);for(const a of villageActors)if(a.life.phase==='working'&&!a.walk){const face=workFacing[a.index]?.[a.life.index];if(face)a.face=face;}};
bench=function(x,z,facing=state.area==='village'?'north':'west'){const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);g.rotation.y={south:0,north:Math.PI,west:-Math.PI/2,east:Math.PI/2}[facing];g.userData={type:'bench',facing};world.add(g);const wood=mat('#8a6845',{map:assets.wood}),iron=mat('#424d4e',{metalness:.55,roughness:.7});for(const xx of [-.76,.76]){box(.13,.62,.57,iron,xx,.31,0,g);box(.12,.5,.12,iron,xx,1,-.25,g);box(.13,.12,.7,wood,xx,.95,0,g)}for(let i=0;i<4;i++)box(1.95,.09,.14,wood,0,.65,-.25+i*.17,g);for(let i=0;i<3;i++)box(1.95,.12,.09,wood,0,.89+i*.16,-.31,g);const across=['north','south'].includes(facing);addObstacle(x,z,across?2.1:.9,across?.9:2.1);return g};

loadArchitecture=async function(){const image=new Image();image.src=FACADES;await image.decode();assets.facades=[];for(let i=0;i<6;i++){const c=document.createElement('canvas');c.width=320;c.height=400;const ctx=c.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.drawImage(image,(i%3)*image.width/3,Math.floor(i/3)*image.height/2,image.width/3,image.height/2,0,0,c.width,c.height);assets.facades.push(textureFromCanvas(c))}};
const houseDesigns=[
 {name:'Heron Apothecary',h:7.4,roof:2.4,wall:'#bcb6a1',trim:'#b9b9a9',roofColor:'#52716a',type:0},
 {name:'The Willow & Wren',h:8.1,roof:2.7,wall:'#c6b993',trim:'#66533e',roofColor:'#667580',type:1},
 {name:'River Guildhall',h:9.1,roof:1.65,wall:'#a1aaab',trim:'#c2c4b5',roofColor:'#525f74',type:2},
 {name:'Miller Cottage',h:6.5,roof:2.2,wall:'#c6bfa5',trim:'#665947',roofColor:'#627c6e',type:3},
 {name:'The Hearth Bakery',h:6.9,roof:2.6,wall:'#a98d75',trim:'#cbb89a',roofColor:'#a76e4c',type:4},
 {name:'Willowmere Library',h:8,roof:1.7,wall:'#abb6b2',trim:'#c6cbbd',roofColor:'#4d657a',type:5}
];
house=function(x,z,w=6.5,d=5,style=0){const index=state.area==='village'?(x===-1&&z===-9?0:x===8?1:x===22?2:z<-20?3:x<-15?4:5):3,design=houseDesigns[index],h=design.h,base=landHeightAt(x,z),g=new THREE.Group();g.position.set(x,base,z);g.userData={x,z,w,d,h:h+design.roof,faded:false,buildingName:design.name,design:index};world.add(g);occluders.push(g);
 const wall=mat(design.wall,{map:index===1||index===3?assets.grit:assets.ruin}),trim=mat(design.trim,{map:index===1||index===3?assets.wood:assets.ruin}),wood=mat('#73614c',{map:assets.wood});box(w,h,d,wall,0,h/2,0,g);
 const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat('#ffffff',{map:assets.facades[index],roughness:.92,emissiveIntensity:0}));face.position.set(0,h/2,d/2+.025);face.receiveShadow=true;g.add(face);
 for(const xx of [-w/2,w/2])box(.19,h,.22,trim,xx,h/2,d/2+.055,g);for(const yy of [.2,h*.5,h-.12])box(w+.25,.17,d+.25,trim,0,yy,0,g);
 const roof=roofMesh(w+.65,d+.65,design.roof,0,h,0,g);roof.material.color.set(design.roofColor);roof.userData.architecture='roof';
 // Thick sills, side windows and structural timber create depth around the artwork.
 for(const side of [-1,1]){const xx=side*(w/2+.02);for(const zz of [-d*.22,d*.23]){box(.06,1.45,.82,mat('#24454e',{emissive:'#d49e53',emissiveIntensity:.08}),xx,h*.67,zz,g);box(.22,.14,1,trim,xx,h*.67-.8,zz,g);box(.15,1.55,.07,wood,xx,h*.67,zz,g);}box(.8,1.4,.7,trim,side*w*.3,h+.5,-d*.18,g);}
 if(index===1||index===3){for(const side of [-1,1])for(const yy of [h*.48,h-.16])box(.2,.16,d+.2,wood,side*(w/2+.04),yy,0,g);for(const xx of [-w*.28,w*.28]){box(.75,1.1,.8,wall,xx,h+.4,d*.18,g);const r=roofMesh(1.1,1.05,.75,xx,h+.95,d*.18,g);r.material.color.set(design.roofColor);box(.5,.6,.06,mat('#3b5860'),xx,h+.5,d*.18+.42,g);}}
 if(index===2||index===5){box(w*.65,.2,.7,trim,0,h*.52,d/2+.3,g);for(let j=0;j<7;j++)box(.09,.55,.1,trim,-w*.29+j*w*.58/6,h*.52+.34,d/2+.58,g);box(w*.68,.1,.12,trim,0,h*.52+.66,d/2+.58,g);}
 if(index===0||index===4){const cloth=[index===0?'#516c55':'#a18c65','#e1d6b9'];for(let i=0;i<8;i++){const m=box(.34,.07,1.1,cloth[i%2],-1.2+i*.34,2.9,d/2+.5,g);m.rotation.x=.15;}box(2.8,.14,.14,wood,0,2.76,d/2+1,g);}
 box(.72,1.7,.72,trim,w*.27,h+1.2,-d*.25,g);box(.94,.16,.94,trim,w*.27,h+2.1,-d*.25,g);for(let i=0;i<4;i++){const m=glow(x+w*.27,base+h+2.4+i*.6,z-d*.25,0xbcc2bd,1.2+i*.25);clouds.push({mesh:m,base:m.position.clone(),phase:i*1.5,smoke:true})}
 const step=box(1.65,.16,.8,trim,0,.08,d/2+.3,g);step.userData.architecture='doorstep';
 for(const xx of [-w*.3,w*.3]){box(1.1,.13,.48,trim,xx,h*.48,d/2+.15,g);const l=light(x+xx,base+2.3,z+d/2+.5,0xffbd72,13,7);l.userData.buildingWindow=true;}
 const bracket=beam(new THREE.Vector3(w*.36,3.9,d/2),new THREE.Vector3(w*.36,3.9,d/2+.9),.045,wood,g);const sign=box(.8,.9,.12,mat('#b9a374',{map:assets.sign}),w*.36,3.4,d/2+.9,g);windParts.push({mesh:sign,base:0,phase:x,amt:.025});addObstacle(x,z,w+.1,d+.1);return g;
};

// One game minute per real second: a complete, persistent 24-minute cycle.
const WORLD_MINUTES_PER_SECOND=1;
const daylightKeys=[
 [0,.23,.15,1,'#90adcf','#506a91','#151e35',1.04],
 [4.5,.2,.14,1,'#8aa9ce','#4c6486','#171e36',1.04],
 [5.3,.45,.2,.86,'#d59da0','#8292af','#626882',1.0],
 [6.3,2.1,.36,.26,'#ffd29a','#9bb8c9','#a4b4b4',.98],
 [8,2.85,.5,0,'#fff0cf','#b7d2df','#a5b6b3',.98],
 [12,3.25,.57,0,'#fff5df','#b8d4e1','#a2b6b6',.94],
 [16.5,3.05,.39,.02,'#ffe0aa','#9cbed0','#9aaea8',.98],
 [18,2.45,.28,.18,'#ffba77','#8a9db9','#a69c9e',.99],
 [18.8,1.1,.24,.52,'#fa9583','#7a86a8','#726b87',1.0],
 [19.6,.35,.2,.84,'#aab4df','#607299','#3c486c',1.02],
 [21,.27,.16,1,'#96b5d7','#536e96','#1c2c49',1.04],
 [24,.23,.15,1,'#90adcf','#506a91','#151e35',1.04]
];
let solar={hour:16.75,night:0,phase:'Late afternoon',sun:3,hemi:.4},lastClockLabel='';
const skyWithTime=addVista;
addVista=function(kind){skyWithTime(kind);vistaMaterial.uniforms.hour={value:solar.hour};vistaMaterial.fragmentShader='uniform float hour;\n'+vistaMaterial.fragmentShader;vistaMaterial.fragmentShader=vistaMaterial.fragmentShader.replace('c*=mix(vec3(1.),vec3(.24,.35,.55),night);',`float skyMask=smoothstep(.52,.9,vUv.y);c*=mix(vec3(1.),vec3(.105,.17,.29),night);float dusk=exp(-pow((hour-18.45)*1.25,2.))+exp(-pow((hour-5.9)*1.4,2.));c=mix(c,c*vec3(1.32,.72,.65)+vec3(.08,.025,.005),dusk*skyMask*.6);vec2 starCell=floor(vUv*vec2(260.,120.));float star=fract(sin(dot(starCell,vec2(127.1,311.7)))*43758.5453);float sparkle=step(.996,star)*pow(night,3.)*skyMask;c+=vec3(.7,.8,1.)*sparkle*.75;float moonHour=hour<6.?hour+24.:hour;vec2 moonAt=vec2(.76-(moonHour-18.)*.026,.85);vec2 md=(vUv-moonAt)*vec2(2.7,1.);float moon=(1.-smoothstep(.018,.021,length(md)))*skyMask*pow(night,2.);c=mix(c,vec3(.85,.9,.93),moon);`);};
function ensureWorldTime(){if(!Number.isFinite(state.worldMinutes))state.worldMinutes=state.night?1320:1005;return state.worldMinutes}
function worldTimeLabel(){const minutes=Math.floor(ensureWorldTime())%1440;return String(Math.floor(minutes/60)).padStart(2,'0')+':'+String(minutes%60).padStart(2,'0')}
function solarAt(hour){hour=((hour%24)+24)%24;let i=0;while(i<daylightKeys.length-2&&daylightKeys[i+1][0]<=hour)i++;const a=daylightKeys[i],b=daylightKeys[i+1],t0=(hour-a[0])/(b[0]-a[0]),t=t0*t0*(3-2*t0),mix=k=>a[k]+(b[k]-a[k])*t,color=k=>new THREE.Color(a[k]).lerp(new THREE.Color(b[k]),t);return {hour,sun:mix(1),hemi:mix(2),night:mix(3),sunColor:color(4),sky:color(5),fog:color(6),exposure:mix(7),phase:hour<4.5?'Deep night':hour<5.5?'First light':hour<7?'Dawn':hour<11?'Morning':hour<15?'Midday':hour<17.8?'Late afternoon':hour<18.8?'Sunset':hour<20.5?'Twilight':'Moonlight'}}
function applyWorldLighting(){solar=solarAt(ensureWorldTime()/60);nightBlend=solar.night;state.night=solar.night>.65;sun.color.copy(solar.sunColor);sun.intensity=solar.sun;hemi.color.copy(solar.sky);hemi.groundColor.set('#52625d');hemi.intensity=solar.hemi;renderer.toneMappingExposure=solar.exposure;scene.fog.near=36;scene.fog.far=108;scene.fog.color.copy(solar.fog);scene.background.copy(solar.fog);for(const l of scene.children)if(l.isAmbientLight)l.intensity=.055;
 const hour=solar.hour,dayAngle=(hour-6)/12*Math.PI,day=Math.max(0,Math.sin(dayAngle)),moonHour=hour<6?hour+24:hour,moonAngle=(moonHour-18)/12*Math.PI;const daylightPosition=new THREE.Vector3(-Math.cos(dayAngle)*30,6+day*35,16);const moonPosition=new THREE.Vector3(-Math.cos(moonAngle)*28,9+Math.max(0,Math.sin(moonAngle))*25,-12);sun.position.copy(daylightPosition).lerp(moonPosition,solar.night);
 for(let i=0;i<lights.length;i++){const l=lights[i];l.intensity=(l.userData.power||10)*(.16+solar.night*1.35)*(1+Math.sin(clock*3.3+i)*.035)}
 if(vistaMaterial){vistaMaterial.uniforms.night.value=solar.night;vistaMaterial.uniforms.haze.value.copy(solar.fog);if(vistaMaterial.uniforms.hour)vistaMaterial.uniforms.hour.value=solar.hour}if(water?.material.uniforms){water.material.uniforms.night.value=solar.night;water.material.uniforms.haze.value.copy(solar.fog)}
 for(const m of atmosphere)if(m.material.uniforms){m.material.uniforms.night.value=solar.night;m.material.uniforms.strength.value=(state.area==='forest'?.11:.055)*(1-solar.night*.95)}
 const label=worldTimeLabel();if(label!==lastClockLabel){lastClockLabel=label;$('#ambience-label').textContent=label+' · '+solar.phase.toUpperCase()+' · DAY '+(Math.floor(state.worldMinutes/1440)+1);$('#time-btn').innerHTML=icon(solar.night>.5?'spark':'clock')+`<span class="world-clock">${label}</span>`;$('#time-btn').title=solar.phase+' · '+label+' · Time passes naturally';$('#time-btn').setAttribute('aria-label','World time '+label+', '+solar.phase);}
 // Billboards receive the same cool shade / warm local light balance as their surroundings.
 const keyDir=sun.position.clone().normalize();for(const a of actors){if(!a.mesh.visible)continue;let shade=0;const ay=heightAt(a.x,a.z)+1.1;if(solar.night<.8){for(const p of buildingPlots){const rise=(p.h||9)-ay;if(rise<=0)continue;for(const t of [2,4,6,8,12])if(ay+keyDir.y*t<rise&&Math.abs(a.x+keyDir.x*t-p.x)<p.w/2&&Math.abs(a.z+keyDir.z*t-p.z)<p.d/2){shade=.38;break}}for(const tree of treeOccluders){const t=(landHeightAt(tree.x,tree.z)+4*tree.s-ay)/Math.max(.12,keyDir.y);if(t>0&&Math.hypot(a.x+keyDir.x*t-tree.x,a.z+keyDir.z*t-tree.z)<1.8*tree.s){shade=Math.max(shade,.24)}}}
  const c=new THREE.Color('#fff2d9').lerp(new THREE.Color('#819cbe'),solar.night).multiplyScalar(1-shade);for(const l of lights){const distance=Math.hypot(l.position.x-a.mesh.position.x,l.position.y-a.mesh.position.y-1.1,l.position.z-a.mesh.position.z),power=Math.min(.26,l.intensity/(distance*distance+1)*.035);c.r+=l.color.r*power;c.g+=l.color.g*power;c.b+=l.color.b*power}if(battle&&heroes.some((h,i)=>h.hp<=0&&heroMeshes[i]===a))c.multiplyScalar(.5);a.mesh.material.color.copy(c);a.spriteShade=shade;}
}
const timeUpdate=update;
update=function(dt){ensureWorldTime();if(['explore','dialog','battle','transition','title'].includes(state.mode)&&!titleModal)state.worldMinutes+=(window.__worldFrameSeconds??dt)*WORLD_MINUTES_PER_SECOND;timeUpdate(dt);applyWorldLighting();};
const timeBuild=buildWorld;
buildWorld=function(area,spawn){lastClockLabel='';timeBuild(area,spawn);applyWorldLighting();$('#time-btn').onclick=()=>openMenu('settings');};
const timeBegin=begin;
begin=function(){timeBegin();state.worldMinutes=1005;lastClockLabel='';applyWorldLighting();};
const timeLoad=loadGame;
loadGame=function(){let legacy=null;try{legacy=JSON.parse(localStorage.getItem('ember-tide-save-v1'))}catch{}timeLoad();if(legacy?.state&&!Number.isFinite(legacy.state.worldMinutes))state.worldMinutes=legacy.state.night?1320:1005;ensureWorldTime();lastClockLabel='';applyWorldLighting();};
const timeInput=setupInput;
setupInput=function(){timeInput();$('#time-btn').onclick=()=>openMenu('settings');};
const timeText=window.render_game_to_text;
window.render_game_to_text=()=>JSON.stringify({...JSON.parse(timeText()),worldTime:{minutes:+ensureWorldTime().toFixed(3),time:worldTimeLabel(),day:Math.floor(state.worldMinutes/1440)+1,phase:solar.phase,nightBlend:+nightBlend.toFixed(3),cycleRealMinutes:24},actors:actors.filter(a=>a.mesh.visible).map(a=>({index:a.index,frame:a.visualFrame,bodyHeight:a.bodyHeight,shade:a.spriteShade}))});
