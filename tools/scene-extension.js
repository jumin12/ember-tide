// The camera keeps a single HD-2D composition; all elevation is world geometry.
let occluders=[],plantMeshes=[], flowerSites=[], trailPoints=Array.from({length:8},()=>new THREE.Vector4(1000,0,1000,10));
let trailTimer=0,reflectionTarget=null,reflectionCamera=null,reflectionMatrix=new THREE.Matrix4(),reflectionFrame=0,waterfallParts=[];
const WATER_Y=-1.35;
const npcLines={Marin:'A river has a memory, you know. I have sailed this bend for thirty years, and tonight it feels like it is holding its breath.',Rook:'I am trying to write a song about the old shrine. So far, the trees have been rather unhelpful with the chorus.',Agatha:'Rowan worries too much. Still… take something warm for the forest. Even brave people get cold.',Pip:'Express deliveries, rain or shine! Except beyond the old arch. There is no surcharge large enough for that.',Fen:'The earth beside the river is good soil. Walk softly through the flowers; Liora has worked hard on them.',Nella:'I counted seven fireflies yesterday. Today there are twelve! Do you think they came to see you?',Ori:'Captain Vale says the shrine is three whole terraces high. I bet I could climb every stair without stopping.', 'Captain Vale':'The eastern road is open. Keep to the steps on the raised bank, and watch for wisps near the shrine.', 'Lady Iris':'Such a pleasant evening for a stroll. The river is quite lovely from the old wooden bridge.',Halden:'Steel likes patience. If Sera has a dawnsteel saber for sale, it will serve a good swordsman well.',Liora:'The flowers lean toward travelers as they pass. I like to think they are wishing you a safe journey.'};
function positionBattleLabels(){
 if(!battle)return;const labels=$$('[data-enemy]').map(d=>{const a=enemyMeshes[+d.dataset.enemy],p=screenPos(a.mesh.position.clone().add(new THREE.Vector3(0,a.base+.6,0)));return {d,...p}}).sort((a,b)=>a.x-b.x);
 let last=-100;for(const l of labels){l.x=clamp(Math.max(l.x,last+148),80,innerWidth-80);l.d.style.left=l.x+'px';l.d.style.top=Math.max(innerHeight*.28,l.y)+'px';last=l.x;}
}
function landHeightAt(x,z){
 if(state.area==='forest'){
  if(x>-14&&x<-8){if(Math.hypot(x+10,z)<1.6)return .45;return -2.1;}
  if(x<=-14&&z<-14)return 3;
  if(z<-6&&x>-8&&x<20){if(Math.abs(x)<2.6&&z>-12)return Math.floor(clamp((-z-6)/6,0,1)*6)*.5;return 3;}
  return Math.max(0,Math.sin(x*.15)*Math.sin(z*.11)*.25)*(Math.abs(x)>15?1:0);
 }
 if(x>-14.7&&x<-5.3)return -2.1;
 if(z<-13&&x>-5&&x<24)return 1.5;
 if(z<=-10&&z>=-13&&Math.abs(x-15)<2.2)return Math.floor((-z-10)*2)*.25;
 return Math.max(0,Math.sin(x*.12)*Math.sin(z*.1)*.22)*(Math.abs(x)>24?1:0);
}
function heightAt(x,z){
 if(state.area==='village'&&x>-15.2&&x<-4.8&&Math.abs(z-3)<1.5)return .4;
 if(state.area==='forest'&&x>-14.4&&x<-7.7&&Math.abs(z-6)<1.4)return .15;
 if(state.area==='forest'&&x>-10.3&&x<-7.6&&Math.abs(z)<.65)return .5;
 if(state.area==='forest'&&x>-14.6&&x<-7.4&&Math.abs(z+18)<1.3)return 3.25;
 return landHeightAt(x,z);
}
function path(x,z,w,d){const geom=new THREE.PlaneGeometry(w,d,Math.max(2,Math.ceil(w*2)),Math.max(2,Math.ceil(d*4)));geom.rotateX(-Math.PI/2);const a=geom.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,heightAt(x+a.getX(i),z+a.getZ(i))+.045);geom.computeVertexNormals();const texture=assets.stone.clone();texture.repeat.set(w/3,d/3);texture.needsUpdate=true;const m=new THREE.Mesh(geom,mat('#b8b59f',{map:texture,bumpMap:texture,bumpScale:.075}));m.position.set(x,0,z);m.receiveShadow=true;world.add(m);return m;}
function createLand(){
 const geom=new THREE.PlaneGeometry(160,160,160,160);geom.rotateX(-Math.PI/2);const a=geom.attributes.position;
 for(let i=0;i<a.count;i++)a.setY(i,landHeightAt(a.getX(i),a.getZ(i))-.035);a.needsUpdate=true;geom.computeVertexNormals();
 const m=new THREE.Mesh(geom,mat(state.area==='forest'?'#8ba383':'#9cae95',{map:assets.grass,bumpMap:assets.grass,bumpScale:.08,roughness:1}));m.userData.walkSurface=true;m.receiveShadow=true;world.add(m);
}
function leafGeometry(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,-.45,.18,.08,0,.28,.21,0,0,0,0,.28,.21,.45,.18,.08,-.45,.18,.08,0,.75,0,0,.28,.21,0,.28,.21,0,.75,0,.45,.18,.08],3));g.setAttribute('uv',new THREE.Float32BufferAttribute([.5,0,0,.3,.5,.5,.5,0,.5,.5,1,.3,0,.3,.5,1,.5,.5,.5,.5,.5,1,1,.3],2));g.computeVertexNormals();return g;}
function applyWind(mesh,kind='grass'){
 mesh.material.onBeforeCompile=shader=>{
  shader.uniforms.uWind={value:0};shader.uniforms.uPlayer={value:new THREE.Vector3()};shader.uniforms.uTrail={value:trailPoints};
  shader.vertexShader='uniform float uWind;uniform vec3 uPlayer;uniform vec4 uTrail[8];\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
    vec4 mvPosition=vec4(transformed,1.0);
    #ifdef USE_INSTANCING
    mvPosition=instanceMatrix*mvPosition;
    vec3 root=instanceMatrix[3].xyz;
    float bend=${kind==='tree'?'(root.y-uPlayer.y<1.5?.38:.08)':kind==='bush'?'.32':'.8'};
    float tip=${kind==='tree'?'1.0':'clamp(position.y,0.0,1.0)'};
    vec2 delta=root.xz-uPlayer.xz;float press=1.-smoothstep(.15,1.5,length(delta));
    for(int j=0;j<8;j++){float p=(1.-smoothstep(.1,1.25,length(root.xz-uTrail[j].xz)))*max(0.,1.-uTrail[j].w/3.5);press=max(press,p);}
    vec2 dir=normalize(delta+vec2(.001));
    mvPosition.xz+=dir*press*bend*tip;
    mvPosition.y-=press*bend*.48*tip;
    mvPosition.x+=sin(uWind*1.5+root.x*.8+root.z*.45)*tip*${kind==='tree'?'.045':'.075'};
    mvPosition.z+=cos(uWind+root.x*.43+root.z*.7)*tip*.045;
    #endif
    mvPosition=modelViewMatrix*mvPosition;
    gl_Position=projectionMatrix*mvPosition;
  `);mesh.userData.shader=shader;
 };plantMeshes.push(mesh);
}
function putLeaf(x,y,z,s,color){const o=new THREE.Object3D();o.position.set(x,y,z);o.rotation.set(rr(-2,2),rr(0,6.28),rr(-2,2));o.scale.set(s,s, s);o.updateMatrix();foliage.setMatrixAt(foliageCount,o.matrix);foliage.setColorAt(foliageCount,new THREE.Color(color));foliageCount++;}
function tree(x,z,s=1,type='gold'){
 if(state.area==='village'&&z>7&&x>-18&&x<26)return;
 const base=landHeightAt(x,z);if(base<-1)return;const g=new THREE.Group();g.position.set(x,base,z);g.scale.setScalar(s);world.add(g);
 const bark=mat('#79664e',{map:assets.wood,bumpMap:assets.wood,bumpScale:.1});cyl(.15,.36,3.8,bark,0,1.9,0,g,8);
 for(let i=0;i<5;i++){const a=i*1.256;beam(new THREE.Vector3(0,.18,0),new THREE.Vector3(Math.cos(a)*.7,.03,Math.sin(a)*.7),.13,bark,g);beam(new THREE.Vector3(0,2,0),new THREE.Vector3(Math.cos(a)*1.3,3.8,Math.sin(a)*1.3),.11,bark,g);}
 const colors=type==='gold'?['#b9a34c','#d4b65c','#a6a253','#d8bd71','#89924e']:['#6e8b4a','#8aa65d','#a1ae65','#527849','#739150'];
 for(let i=0;i<1100;i++){const a=rr(0,6.28),u=rr(-1,1),r=Math.cbrt(rng())*2.05;const k=Math.sqrt(1-u*u);putLeaf(x+Math.cos(a)*r*k*s,base+(4+u*r*.68)*s,z+Math.sin(a)*r*k*s,rr(.2,.43)*s,colors[i%5]);}
 addObstacle(x,z,.65*s,.65*s);return g;
}
function bush(x,z,s=1,color='#7d9350'){const h=landHeightAt(x,z);if(h<-.5)return;for(let i=0;i<45;i++){let a=rr(0,6.28),r=Math.sqrt(rng())*s;putLeaf(x+Math.cos(a)*r,h+rr(.12,s*.9),z+Math.sin(a)*r,rr(.22,.4),color)}}
function flowerPatch(x,z,color='#e9debb'){flowerSites.push({x,z,color});}
function flowerGeometry(){
 const v=[],colors=[],uv=[];const tri=(a,b,c,color)=>{for(const p of [a,b,c]){v.push(...p);colors.push(...color);uv.push(p[0]+.5,p[1])}};
 tri([-.025,0,0],[.025,0,0],[.02,.78,0],[.42,.67,.3]);tri([-.025,0,0],[.02,.78,0],[-.02,.78,0],[.42,.67,.3]);
 tri([0,.2,0],[.19,.4,.06],[0,.48,0],[.42,.67,.3]);tri([0,.35,0],[-.2,.54,.06],[0,.62,0],[.42,.67,.3]);
 for(let i=0;i<5;i++){const a=i*6.283/5,b=a+.55,c=a-.55;tri([0,.79,0],[Math.cos(b)*.19,.83,Math.sin(b)*.19],[Math.cos(a)*.27,.73,Math.sin(a)*.27],[1,1,1]);tri([0,.79,0],[Math.cos(a)*.27,.73,Math.sin(a)*.27],[Math.cos(c)*.19,.83,Math.sin(c)*.19],[1,1,1]);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
}
function addTerrainAndPlants(){
 // Terraced stone banks expose earth and rock down to the actual lower river bed.
 const forest=state.area==='forest',left=forest?-14.1:-14.8,right=forest?-7.9:-5.2;
 const stone=mat('#a5aa8c',{map:assets.ruin||assets.stone,bumpMap:assets.ruin||assets.stone,bumpScale:.1});
 for(let z=-30;z<30;z+=2){for(let x of [left,right]){const top=Math.max(0,landHeightAt(x+(x===left?-.3:.3),z));box(.7,top+2,2.05,stone,x,(top-2)/2,z);for(let j=0;j<2;j++){const r=ball(rr(.25,.5),stone,x+(x===left?.22:-.22),top-rr(.05,.45),z+rr(-.8,.8));r.scale.set(1,.65,.7)}}}
 if(forest){
  // The upper pool is supported by earth and spills over a stone lip into the lower channel.
  box(6,5.1,18,stone,-11,.4,-23.5);
  for(let side of [-1,1])box(.65,3.5,18,stone,-11+side*3.15,1.35,-23.5);
  const pool=new THREE.Mesh(new THREE.PlaneGeometry(5.9,18,10,24),new THREE.MeshPhysicalMaterial({color:'#314b35',metalness:.35,roughness:.18,transparent:true,opacity:.93}));pool.rotation.x=-Math.PI/2;pool.position.set(-11,3.02,-23.5);world.add(pool);
  for(let i=0;i<19;i++)box(.38,.2,2.6,'#a08b5e',-14.6+i*.38,3.15,-18);
  for(let side of [-1,1]){for(let i=0;i<5;i++)box(.12,1.1,.12,'#76694d',-14.5+i*1.75,3.8,-18+side*1.2);box(7.2,.1,.1,'#a49670',-11,4.25,-18+side*1.2);}
  box(11.5,3,1.2,stone,14,1.45,-6.2);
  for(let x of [-5.5,5.5])box(5.8,3,1.2,stone,x,1.45,-6.2);
  for(let i=0;i<6;i++)box(5.1,.51,1.04,stone,0,.25+i*.5,-6.5-i);
  for(let x of [-5.5,5.5])for(let j=0;j<5;j++)bush(x+rr(-2,2),-7+rr(-.5,.5),.45,'#6d9357');
  for(let i=0;i<17;i++)box(.38,.2,2.7,'#95815b',-14.2+i*.39,.05,6);
  for(let i=0;i<7;i++)box(.38,.18,1.1,'#a38e60',-10.2+i*.38,.4,0);
  for(let x of [-14,-8])for(let z of [4.7,7.3])box(.15,1.2,.15,'#796a4e',x,.65,z);
  // A real cascade drops from the upper woodland terrace into the river.
  const fall=new THREE.Mesh(new THREE.PlaneGeometry(3.8,4.9,12,24),new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;uniform float time;void main(){vUv=uv;vec3 p=position;p.z+=sin(p.x*4.+time*3.+p.y*3.)*.08;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}void main(){float a=noise(vec2(vUv.x*31.,vUv.y*4.+time*1.6));float b=noise(vec2(vUv.x*83.,vUv.y*10.+time*3.5));float foam=pow(clamp(a*.55+b*.6,0.,1.),3.);float fade=pow(sin(vUv.x*3.14159),.45);vec3 c=mix(vec3(.13,.28,.25),vec3(.69,.83,.73),foam);gl_FragColor=vec4(c,(.5+foam*.42)*fade);}'}));fall.position.set(-11,1,-13.5);world.add(fall);waterfallParts.push(fall);
  for(let i=0;i<9;i++){const m=glow(-11+rr(-2,2),WATER_Y+rr(.1,.7),-12.6+rr(-.7,.7),0xc8e1d4,rr(1.5,3.5));m.material.opacity=.14;waterfallParts.push(m)}
 }else{
  for(let x=-4;x<24;x+=2)if(Math.abs(x-15)>2.7)box(2.03,1.55,.8,stone,x,.74,-13);
  for(let i=0;i<6;i++)box(4.3,.27,.52,stone,15,.125+i*.25,-10.25-i*.5);
 }
 const grassGeo=new THREE.BufferGeometry();grassGeo.setAttribute('position',new THREE.Float32BufferAttribute([-.09,0,0,.09,0,0,.055,.5,.05,-.09,0,0,.055,.5,.05,-.025,.48,.045,-.025,.48,.045,.055,.5,.05,.02,1,.23],3));grassGeo.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,.5,0,0,1,.5,0,.5,0,.5,1,.5,.5,1],2));grassGeo.computeVertexNormals();
 const grass=new THREE.InstancedMesh(grassGeo,mat('#b4bc77',{side:THREE.DoubleSide}),16000);grass.frustumCulled=false;grass.receiveShadow=true;let count=0;
 for(let z=-27;z<27;z+=.6)for(let x=-30;x<30;x+=.6){if(rng()>.64)continue;const xx=x+rr(-.2,.2),zz=z+rr(-.2,.2),h=landHeightAt(xx,zz);if(h<-.4)continue;if(forest?(Math.abs(xx)<3&&zz>-18):(xx>-5&&xx<22&&zz>-12&&zz<6||Math.abs(zz-3)<2))continue;if(obstacles.some(o=>Math.abs(xx-o.x)<o.w&&Math.abs(zz-o.z)<o.d))continue;
  for(let j=0;j<2;j++){const o=new THREE.Object3D();o.position.set(xx+rr(-.16,.16),h,zz+rr(-.16,.16));o.rotation.y=rr(0,6.28);o.scale.set(rr(.55,1.1),rr(.22,.62),rr(.55,1.1));o.updateMatrix();grass.setMatrixAt(count,o.matrix);grass.setColorAt(count,new THREE.Color().setHSL(rr(.17,.25),rr(.27,.48),rr(.32,.55)));count++;}}
 grass.count=count;world.add(grass);applyWind(grass,'grass');
 const flowers=new THREE.InstancedMesh(flowerGeometry(),mat('#ffffff',{vertexColors:true,side:THREE.DoubleSide}),1200);flowers.frustumCulled=false;flowers.receiveShadow=true;let fc=0;
 for(const site of flowerSites)for(let j=0;j<25;j++){const x=site.x+rr(-1,1),z=site.z+rr(-1,1),h=landHeightAt(x,z);if(h<-.5)continue;const o=new THREE.Object3D();o.position.set(x,h,z);o.rotation.y=rr(0,6.28);o.scale.setScalar(rr(.35,.7));o.updateMatrix();flowers.setMatrixAt(fc,o.matrix);flowers.setColorAt(fc,new THREE.Color(site.color));fc++;}
 flowers.count=fc;world.add(flowers);applyWind(flowers,'grass');
 // Ground details have volume and contact shadows, rather than painted-on props.
 for(let i=0;i<75;i++){const x=rr(-27,28),z=rr(-25,23),h=landHeightAt(x,z);if(h<-.5||Math.abs(z-3)<2||Math.abs(x)<2.6&&forest)continue;const r=ball(rr(.08,.23),stone,x,h+.03,z,world,0);r.scale.y=.45;}
 installWater();
}
function installWater(){
 if(water){world.remove(water);water.geometry.dispose();water.material.dispose();}
 const forest=state.area==='forest',width=forest?5.8:9.3,cx=forest?-11:-10;
 const bed=box(width,.12,150,mat('#837e58',{map:assets.stone,bumpMap:assets.stone,bumpScale:.15}),cx,-2.08,-2);bed.receiveShadow=true;
 if(!reflectionTarget){reflectionTarget=new THREE.WebGLRenderTarget(768,512,{type:THREE.HalfFloatType});reflectionCamera=new THREE.PerspectiveCamera();}
 const geometry=new THREE.PlaneGeometry(width,160,28,200);geometry.rotateX(-Math.PI/2);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:{value:0},reflection:{value:reflectionTarget.texture},textureMatrix:{value:reflectionMatrix},eye:{value:new THREE.Vector3()},sunDir:{value:new THREE.Vector3(-.55,.75,.35)}},vertexShader:`varying vec2 vUv;varying vec3 vWorld;varying vec4 vReflect;uniform float time;uniform mat4 textureMatrix;void main(){vUv=uv;vec3 p=position;p.y+=sin(p.x*2.2+p.z*1.5+time*.85)*.028+sin(p.z*3.7-time*1.3)*.017;vec4 w=modelMatrix*vec4(p,1.);vWorld=w.xyz;vReflect=textureMatrix*w;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`varying vec2 vUv;varying vec3 vWorld;varying vec4 vReflect;uniform sampler2D reflection;uniform vec3 eye;uniform vec3 sunDir;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 void main(){vec2 p=vWorld.xz;float n=noise(p*2.+vec2(time*.22,-time*.4));vec3 normal=normalize(vec3(cos(p.x*2.2+p.y*1.5+time*.85)*.1,1.,cos(p.y*3.7-time*1.3)*.085));vec3 view=normalize(eye-vWorld);float fres=pow(1.-max(0.,dot(normal,view)),3.);vec2 ruv=vReflect.xy/vReflect.w+normal.xz*.014;vec3 reflected=texture2D(reflection,clamp(ruv,vec2(.002),vec2(.998))).rgb;
 float edge=1.-smoothstep(.0,.16,min(vUv.x,1.-vUv.x));vec3 base=mix(vec3(.012,.028,.018),vec3(.07,.1,.045),n);base=mix(base,vec3(.17,.23,.15),edge*.45);vec3 c=mix(base,reflected,.12+fres*.35);float spec=pow(max(0.,dot(reflect(-sunDir,normal),view)),135.);c+=vec3(1.,.9,.61)*spec*1.5;
 float foam=edge*pow(max(0.,sin(p.y*12.+n*7.-time*1.8)),12.);c+=vec3(.31,.35,.24)*foam;gl_FragColor=vec4(c,.93);}`});
 water=new THREE.Mesh(geometry,material);water.position.set(cx,WATER_Y,-2);world.add(water);
}
function updateAdvancedScene(dt){
 if(!player)return;trailTimer+=dt;for(const p of trailPoints)p.w+=dt;if(trailTimer>.18&&player.walk){trailTimer=0;trailPoints.pop();trailPoints.unshift(new THREE.Vector4(player.x,heightAt(player.x,player.z),player.z,0));}
 for(const g of occluders){const info=g.userData;const fade=Math.abs(player.x-info.x)<info.w/2+.3&&player.z<info.z-info.d/2+.2&&player.z>info.z-24;if(fade!==info.faded){info.faded=fade;g.traverse(o=>{if(!o.material)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.userData.originalTransparent===undefined)m.userData.originalTransparent=m.transparent;m.transparent=fade||m.userData.originalTransparent;m.opacity=fade?.19:1;m.depthWrite=!fade;m.needsUpdate=true;}});}}
 for(const m of plantMeshes){const shader=m.userData.shader;if(shader){shader.uniforms.uWind.value=clock;shader.uniforms.uPlayer.value.set(player.x,heightAt(player.x,player.z),player.z);shader.uniforms.uTrail.value=trailPoints;}}
 for(const m of waterfallParts){if(m.material.uniforms?.time)m.material.uniforms.time.value=clock;else{m.position.x+=Math.sin(clock+m.id)*dt*.1;m.material.opacity=.075+Math.sin(clock*.7+m.id)*.025;}}
 for(const e of effects){if(e.kind!=='volume')continue;const p=1-e.life/e.max;e.mesh.rotation.y+=dt*(e.spin||0);if(e.role==='fire'){const a=e.phase+p*4;e.mesh.position.set(e.origin.x+Math.cos(a)*e.radius*(1-p*.65),e.origin.y+p*.8,e.origin.z+Math.sin(a)*e.radius*(1-p*.65));e.mesh.scale.set(e.size*(1-p*.6),e.size*(2.2+p*1.5),e.size*(1-p*.6));e.mesh.material.uniforms.time.value=clock+e.phase;e.mesh.material.uniforms.life.value=e.life/e.max;}else if(e.role==='ice'){e.mesh.scale.copy(e.originalScale).multiplyScalar(Math.min(1,p*6));e.mesh.position.y=e.origin.y+e.originalScale.y*.5*Math.min(1,p*6);}else if(e.role==='orb'){const a=e.phase+p*5;e.mesh.position.set(e.origin.x+Math.cos(a)*e.radius,e.origin.y+p*2,e.origin.z+Math.sin(a)*e.radius);}else if(e.role==='shock'){e.mesh.scale.setScalar(1+p*4);e.mesh.rotation.z+=dt*.25;}else if(e.role==='bolt'){e.mesh.material.opacity=e.life/e.max*(Math.sin(clock*65)>.0?1:.35);}}
}
function flameMaterial(){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:clock},life:{value:1}},vertexShader:'uniform float time;varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){vec3 p=position;p.y+=1.;float h=p.y/2.;p.xz*=max(.04,1.-h*.8);p.x+=sin(h*7.-time*9.)*.18*h;p.z+=cos(h*8.-time*7.)*.18*h;vP=p;vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(p,1.);vV=-mv.xyz;gl_Position=projectionMatrix*mv;}',fragmentShader:'uniform float time;uniform float life;varying vec3 vP;varying vec3 vN;varying vec3 vV;void main(){float h=clamp(vP.y/2.,0.,1.);float n=sin(floor(vP.x*13.)*.7+floor(vP.y*14.)*.8-time*12.)*.18+.82;vec3 c=mix(vec3(1.3,.52,.045),vec3(.72,.055,.008),h);c+=vec3(.3,.19,.02)*(1.-h);float a=pow(abs(dot(normalize(vN),normalize(vV))),.4)*(.6-h*.3)*n*life;gl_FragColor=vec4(c,a);}'});}
function volumeEffect(mesh,life,extra={}){world.add(mesh);effects.push({kind:'volume',mesh,life,max:life,...extra});return mesh;}
function spell(type,pos){
 const color={sword:0xffe1a0,fire:0xff8b32,ice:0x96ddff,lightning:0xc7a3ff,heal:0x92ffd0,enemy:0xd496da}[type]||0xffffff;
 const origin=pos.clone();origin.y=heightAt(pos.x,pos.z)+.1;
 const luminous=(c,opacity=1)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:2.8,roughness:.28,transparent:true,opacity,depthWrite:false});
 const shock=new THREE.Mesh(new THREE.TorusGeometry(.7,.035,5,64),luminous(color,.8));shock.rotation.x=Math.PI/2;shock.position.copy(origin);shock.position.y+=.08;volumeEffect(shock,.75,{role:'shock'});
 lightFlash(origin,color);burst(origin.clone().add(new THREE.Vector3(0,1,0)),color,40,3);
 if(type==='sword'||type==='enemy'){
  for(let i=0;i<3;i++){const points=[];for(let j=0;j<18;j++){const a=-1+j*.16;points.push(new THREE.Vector3(Math.cos(a)*1.6,Math.sin(a)*1.5,j*.015))}const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),24,.045+i*.018,5,false),luminous(i===0?0xffffff:color));m.position.copy(origin).add(new THREE.Vector3(0,1.3,0));m.rotation.set(.2*i,.25,i%2?-.65:.7);volumeEffect(m,.46,{role:'slash',spin:3});}
 }else if(type==='fire'){
  for(let i=0;i<12;i++){const size=rand(.22,.42),m=new THREE.Mesh(new THREE.SphereGeometry(1,12,10),flameMaterial());const o=origin.clone().add(new THREE.Vector3(0,rand(0,.15),0));m.position.copy(o);m.scale.set(size,size*2,size);volumeEffect(m,.85+rand(0,.35),{role:'fire',origin:o,phase:i*2.399,radius:rand(.25,1.05),size,spin:rand(-2,2)});}
 }else if(type==='ice'){
  for(let i=0;i<11;i++){const a=i*2.399,r=i?rand(.3,1.5):0,h=i?rand(.6,1.8):2.7;const m=new THREE.Mesh(new THREE.OctahedronGeometry(1,0),new THREE.MeshPhysicalMaterial({color:0xb4e8f3,emissive:0x368cb6,emissiveIntensity:.65,metalness:.2,roughness:.13,transparent:true,opacity:.9,map:assets.grit}));m.castShadow=true;m.receiveShadow=true;const o=origin.clone().add(new THREE.Vector3(Math.cos(a)*r,0,Math.sin(a)*r));m.position.copy(o);m.rotation.set(rand(-.25,.25),a,rand(-.25,.25));m.scale.set(.22,h,.28);volumeEffect(m,1.2,{role:'ice',origin:o,originalScale:m.scale.clone()});}
 }else if(type==='lightning'){
  for(let j=0;j<2;j++){const points=[];for(let i=0;i<10;i++)points.push(new THREE.Vector3(origin.x+rand(-.45,.45)+j*.18,origin.y+7-i*.77,origin.z+rand(-.4,.4)));const curve=new THREE.CurvePath();for(let k=1;k<points.length;k++)curve.add(new THREE.LineCurve3(points[k-1],points[k]));const halo=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.07,5,false),luminous(0x9c79ff,.55));volumeEffect(halo,.65,{role:'bolt'});const bolt=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.022,5,false),luminous(0xf6f3ff));volumeEffect(bolt,.65,{role:'bolt'});}
 }else if(type==='heal'){
  for(let i=0;i<12;i++){const o=origin.clone();const m=new THREE.Mesh(new THREE.OctahedronGeometry(.07,0),luminous(i%3?0xa3ffd5:0xffdf9c));m.position.copy(o);volumeEffect(m,1.3,{role:'orb',origin:o,phase:i*.52,radius:.9,spin:4});}
  for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(1,.022,5,56),luminous(color,.6));m.rotation.set(Math.PI/2+i*.3,i*.4,0);m.position.copy(origin).add(new THREE.Vector3(0,.3+i*.6,0));volumeEffect(m,1.3,{role:'shock'});}
 }
 if(!['sword','enemy'].includes(type)){$('#spell-flash').style.background='#'+new THREE.Color(color).getHexString();$('#spell-flash').style.opacity=.11;schedule(.14,()=>$('#spell-flash').style.opacity=0)}
 sfx(type);
}
function render(){
 sun.shadow.needsUpdate=reflectionFrame%4===0;
 if(water&&reflectionTarget&&reflectionFrame++%2===0){
  reflectionCamera.copy(camera);reflectionCamera.position.copy(camera.position);reflectionCamera.position.y=2*WATER_Y-camera.position.y;
  reflectionCamera.up.set(0,-1,0);const target=cameraFocus.clone();target.y=2*WATER_Y-target.y;reflectionCamera.lookAt(target);reflectionCamera.updateMatrixWorld();
  reflectionMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);reflectionMatrix.multiply(reflectionCamera.projectionMatrix).multiply(reflectionCamera.matrixWorldInverse);
  water.visible=false;renderer.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),-WATER_Y)];renderer.setRenderTarget(reflectionTarget);renderer.render(scene,reflectionCamera);renderer.clippingPlanes=[];water.visible=true;
 }
 if(water?.material.uniforms.eye)water.material.uniforms.eye.value.copy(camera.position);
 if(renderTarget){renderer.setRenderTarget(renderTarget);renderer.render(scene,camera);renderer.setRenderTarget(null);postMaterial.uniforms.time.value=clock;renderer.render(postScene,postCamera)}else{renderer.setRenderTarget(null);renderer.render(scene,camera)}
}
