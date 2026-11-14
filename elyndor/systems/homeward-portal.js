// A fitted architectural opening, rather than an oval floating inside an arch.
function homeAperture144(){const s=new THREE.Shape();s.moveTo(-1.065,.285);s.lineTo(1.065,.285);s.lineTo(1.065,3.12);s.absarc(0,3.12,1.065,0,Math.PI,false);s.lineTo(-1.065,.285);return new THREE.ShapeGeometry(s,48);}
homePortal139=function(x,z,label,kind='homeReturn139'){
 const g=new THREE.Group();g.position.set(x,0,z);g.name='The Homeward threshold';world.add(g);
 const stone=homeSurface139('wall','#a9b5ab',{roughness:.84}),dark=homeSurface139('rockA','#829c97',{roughness:.78}),gold=homeSurface139('metal','#c5aa65',{roughness:.3,metalness:.72});
 const foot=mesh(new THREE.CylinderGeometry(1.58,1.65,.30,48),stone,0,.15,0,g);foot.receiveShadow=true;
 for(const side of[-1,1]){
  for(let i=0;i<6;i++){const block=mesh(new THREE.BoxGeometry(.49,.455,.66),i%3?stone:dark,side*1.29,.58+i*.46,0,g);block.rotation.z=side*.008*(i%2);}
  for(const y of[.40,3.05])mesh(new THREE.BoxGeometry(.76,.18,.84),stone,side*1.29,y,0,g);
  mesh(new THREE.BoxGeometry(.075,2.55,.06),gold,side*1.29,1.7,.36,g);
 }
 for(let i=0;i<17;i++){
  const a=i*Math.PI/17,b=(i+1)*Math.PI/17,shape=new THREE.Shape();shape.absarc(0,0,1.56,a+.004,b-.004,false);shape.absarc(0,0,1.045,b-.004,a+.004,true);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.022,bevelThickness:.025,curveSegments:3});mesh(geo,i%4?stone:dark,0,3.12,-.325,g);
 }
 const crest=mesh(new THREE.OctahedronGeometry(.25),gold,0,4.81,.05,g);crest.scale.set(.7,1.25,.6);
 for(const side of[-1,1])beam(V3(0,4.57,.36),V3(side*.48,4.28,.36),.045,'metal','#d7bb77',g);
 const time={value:0},energy={value:0},m=new THREE.ShaderMaterial({side:THREE.DoubleSide,transparent:false,depthWrite:true,toneMapped:false,uniforms:{time,energy},vertexShader:'varying vec2 p144;void main(){p144=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec2 p144;uniform float time,energy;
 float hash144(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise144(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash144(i),hash144(i+vec2(1,0)),f.x),mix(hash144(i+vec2(0,1)),hash144(i+vec2(1)),f.x),f.y);}
 float cloud144(vec2 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*noise144(p);p=mat2(1.6,-1.2,1.2,1.6)*p+4.3;a*=.5;}return v;}
 float line144(vec2 p,vec2 a,vec2 b){vec2 d=b-a;return length(p-a-d*clamp(dot(p-a,d)/dot(d,d),0.,1.));}
 void main(){vec2 p=p144;float t=time*.22;vec2 bend=vec2(cloud144(p*1.4+vec2(t,-t)),cloud144(p.yx*1.6+vec2(-t,t)));float mist=cloud144(p*2.8+bend*2.-vec2(0.,t));
  vec3 col=mix(vec3(.008,.025,.055),vec3(.025,.24,.30),mist);float depth=exp(-length((p-vec2(0,2.1))*vec2(1.8,.9))*.8);col+=vec3(.015,.15,.20)*depth;
  float threads=0.;for(int i=0;i<5;i++){float k=float(i),curve=.78*sin((p.y-.5)*1.12+t*.7+k*1.18)+.10*sin(p.y*4.-t*2.+k);float d=abs(p.x-curve);threads+=exp(-d*d/(.00017+.0001*mist))*(.33+.26*sin(p.y*3.-time*1.4+k));}
  float rim=1.-smoothstep(0.,.11,min(1.065-abs(p.x),p.y<3.12?min(p.y-.285,4.2-p.y):1.065-length(p-vec2(0,3.12))));col+=vec3(.18,.68,.76)*rim*.55;
  col+=threads*vec3(.12,.48,.72)*(1.+energy*.6);float constellation=exp(-pow(line144(p,vec2(-.48,1.6),vec2(.2,2.45))/.007,2.))+exp(-pow(line144(p,vec2(.2,2.45),vec2(-.2,3.3))/.007,2.));
  float stars=exp(-length(p-vec2(-.48,1.6))*90.)+exp(-length(p-vec2(.2,2.45))*100.)+exp(-length(p-vec2(-.2,3.3))*100.);col+=vec3(.9,.69,.29)*(stars*2.+constellation*.24)*(1.+.12*sin(time*1.6));
  col+=energy*vec3(.10,.35,.45)*(mist*.4+threads*.25);gl_FragColor=vec4(col,1.);
 }`});
 const aperture=mesh(homeAperture144(),m,0,0,.09,g);aperture.castShadow=aperture.receiveShadow=false;aperture.userData.dynamicFX=true;
 const seeds=new Float32Array(80*3);for(let i=0;i<80;i++)seeds.set([i*.618033%1,i*.41421%1,i*.73205%1],i*3);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(seeds,3));
 const spark=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,uniforms:{time,energy,dpr:{value:Math.min(devicePixelRatio,2)}},vertexShader:`uniform float time,energy,dpr;varying float life144;void main(){float h=fract(position.x+time*(.055+position.z*.04)*(1.+energy)),a=position.y*6.283+time*.12;vec3 p=vec3(sin(a+h*2.)*(1.12+position.z*.25),.35+h*4.05,.22+cos(a)*.18);life144=sin(h*3.14159);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);gl_PointSize=clamp((2.+position.z*3.)*dpr,1.,9.);}`,fragmentShader:'varying float life144;void main(){vec2 p=gl_PointCoord-.5;float r=length(p);float a=exp(-r*r*40.)*life144;if(a<.01)discard;gl_FragColor=vec4(.5,.85,1.,a);}' });
 const motes=new THREE.Points(geo,spark);motes.frustumCulled=false;motes.userData.dynamicFX=true;g.add(motes);
 const light=new THREE.PointLight('#68ced9',2.5,8,2);light.position.set(0,2.1,1.1);g.add(light);
 const row={group:g,material:m,aperture,light,motes,energy:0};world.userData.homePortals139??=[];world.userData.homePortals139.push(row);g.userData.portal144=row;
 interactables.push({id:kind,type:kind,x,z:z+1.7,radius:3,label,visualHeight:1.7});obstacle(x,z,2.4,.6,'home portal');return g;
};
const HOME_MARKER144='<svg viewBox="0 0 48 54" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="hm144" x2=".8" y2="1"><stop stop-color="#fff2b8"/><stop offset=".35" stop-color="#e3bb59"/><stop offset=".67" stop-color="#8b5c24"/><stop offset="1" stop-color="#f4d783"/></linearGradient><linearGradient id="hg144" x2=".4" y2="1"><stop stop-color="#315a55"/><stop offset="1" stop-color="#061c27"/></linearGradient></defs><path d="M24 1 30 8 43 12 43 39 31 46 24 53 17 46 5 39 5 12 18 8Z" fill="#3b2b1c" stroke="#f1d591" stroke-width="1.2"/><path d="M24 4 29 10 40 14 40 37 29 43 24 49 19 43 8 37 8 14 19 10Z" fill="url(#hg144)" stroke="url(#hm144)" stroke-width="2.3"/><path d="M11 25 24 13 37 25 34 28 32 26v13H16V26l-2 2Z" fill="url(#hm144)" stroke="#714a21" stroke-width=".8"/><path d="M20 39V28h8v11M20 22h8" fill="#102d35" stroke="#f9e6a5" stroke-width=".7"/><path d="M13 25 24 15 35 25M17 38h14M18 26v10M30 26v10" fill="none" stroke="#fff2ba" stroke-width="1"/><path d="m24 7 2 3-2 3-2-3Z" fill="#fff0ad"/></svg>';
ASSETS.images.ui51_housing139='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(HOME_MARKER144);MAP_GLYPHS52.housing139={w:48,h:54,box:[3,0,42,54]};
updateHomeKeeper139=function(){
 const keeper=world?.userData.homeKeeper139;if(!homeKeeperIcon139){homeKeeperIcon139=document.createElement('div');homeKeeperIcon139.className='home-keeper-icon139';homeKeeperIcon139.innerHTML=HOME_MARKER144;homeKeeperIcon139.setAttribute('aria-hidden','true');document.body.append(homeKeeperIcon139);}
 if(keeper){const a=keeper.a,posing=clock<(a.homewardUntil139??-1)?'homewardKey':housingMenu139.open?'greeting':a.face;if(a.frame?.action!==posing&&assets.sprites.azarith.frames[posing])setActorFrame(a,posing,0);}
 if(!keeper||battle||state.mode==='title'||menu||gameLoading||poiFade.active||!keeper.a.mesh.visible||homeTransit144){homeKeeperIcon139.hidden=true;return;}
 const a=keeper.a;const box=a.mesh.geometry.boundingBox??(a.mesh.geometry.computeBoundingBox(),a.mesh.geometry.boundingBox),position=V3(0,box.max.y+.20,0).applyMatrix4(a.mesh.matrixWorld).project(camera);
 const visible=position.z<1&&position.z>-1&&Math.abs(position.x)<1.05&&Math.abs(position.y)<1.05&&!homeDecor139.active;homeKeeperIcon139.hidden=!visible;
 if(visible)homeKeeperIcon139.style.transform=`translate(${(position.x*.5+.5)*innerWidth}px,${(-position.y*.5+.5)*innerHeight}px) translate(-50%,-100%)`;
 const posing=clock<(a.homewardUntil139??-1)?'homewardKey':housingMenu139.open?'greeting':a.face;if(a.frame?.action!==posing&&assets.sprites.azarith.frames[posing])setActorFrame(a,posing,0);
};
let homeTransit144=null;
function portalTransitCancel144(message='Home travel cancelled.'){
 const q=homeTransit144;if(!q)return;homeTransit144=null;route=null;state.mode=q.mode;for(const r of q.party){r.a.x=r.from.x;r.a.z=r.from.z;r.a.mesh.visible=true;if(r.a.shadow)r.a.shadow.visible=true;r.a.action='idle';r.a.speed=0;updateActor(r.a,0);}q.portal.energy=0;q.resolve(false);if(message)toast(message);
}
function walkThroughHomePortal144(){
 if(homeTransit144)return Promise.resolve(false);const portal=world?.userData.homePortals139?.[0];if(!portal)return Promise.resolve(true);
 const g=portal.group;g.updateWorldMatrix(true,false);const point=V3(0,0,3.8).applyMatrix4(g.matrixWorld),target={x:point.x,z:point.z},path=findRoute(player,target,[]);if(!path){toast('Move onto the path in front of the portal.');return Promise.resolve(false);}
 closeHousing139();hideDevConsole60();keys.clear();route=path;world.userData.homeKeeper139&&(world.userData.homeKeeper139.a.homewardUntil139=clock+8);
 return new Promise(resolve=>{homeTransit144={portal,world,target,stage:'approach',elapsed:0,mode:state.mode,party:[player,...followers].map(a=>({a,from:{x:a.x,z:a.z}})),resolve};toast('The Homeward threshold opens…');});
}
const homeTransitVisitBefore144=visitHome139,homeTransitReturnBefore144=returnFromHome139;
visitHome139=async function(){
 if(!housing139().home||isHomeScene139()||battle||gameLoading||sceneSwitchPending||poiFade.active)return homeTransitVisitBefore144();
 const origin={scene:state.scene,poi:activeScene.key,x:player.x,z:player.z};if(!await walkThroughHomePortal144())return false;
 const pending=homeTransitVisitBefore144();housing139().return=origin;homeChange139();return pending;
};
returnFromHome139=async function(){if(homeTransit144)return false;if(!await walkThroughHomePortal144())return false;return homeTransitReturnBefore144();};
const homePortalTickBefore144=tick;
tick=function(dt){const r=homePortalTickBefore144(dt),q=homeTransit144;
 for(const p of world?.userData.homePortals139??[]){p.energy=mix(p.energy,q?.portal===p?1:0,Math.min(1,dt*4));p.material.uniforms.energy.value=p.energy;p.light.intensity=2.5+p.energy*5.5+.12*Math.sin(clock*2.7);}
 if(!q)return r;if(q.world!==world){portalTransitCancel144('');return r;}if(gameLoading||devConsole60.open||menu)return r;q.elapsed+=dt;
 if(q.stage==='approach'){
  if(dist(player,q.target)<.70){route=null;state.mode='action';q.stage='crossing';q.elapsed=0;for(const row of q.party)row.from={x:row.a.x,z:row.a.z};}
  else if(q.elapsed>18||!route){portalTransitCancel144('The approach is blocked. Move closer to the portal.');}
 }else{
  const g=q.portal.group;for(const[i,row]of q.party.entries()){const a=row.a,t=clamp((q.elapsed-i*.42)/1.45,0,1),p=V3((i%2?.13:-.13)*g.scale.x,0,mix(3.5,-.65,t)).applyMatrix4(g.matrixWorld),approach=smooth(0,.35,t),x=mix(row.from.x,p.x,approach),z=mix(row.from.z,p.z,approach),dx=x-a.x,dz=z-a.z;a.face=facingForMotion(dx,dz);a.phase+=Math.hypot(dx,dz)*6;a.x=x;a.z=z;a.speed=t>0&&t<1?2.6:0;a.action='walk';updateActor(a,0);a.mesh.position.y+=.30*g.scale.y*smooth(.15,.5,t);a.mesh.visible=t<.84;if(a.shadow)a.shadow.visible=t<.78;}
  updateCamera(0,true);if(q.elapsed>1.5+(q.party.length-1)*.42){homeTransit144=null;state.mode=q.mode;route=null;q.portal.energy=1;q.resolve(true);}
 }return r;
};
// Travel owns movement until the last companion has passed the opening.
for(const type of['keydown','keyup','pointerdown','touchstart'])window.addEventListener(type,e=>{if(!homeTransit144)return;if(type==='keydown'&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();portalTransitCancel144();return;}e.preventDefault();e.stopImmediatePropagation();},{capture:true,passive:false});
