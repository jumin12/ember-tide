// Characters use the scene's animated, alpha-tested directional shadow map.
// Legacy ground silhouettes are retained only as inert lifecycle handles.
const presentation25={shadowFrames:0,gateFrames:0,cloudVolumes:0};
function lightActor25(a){
 if(!a)return;a.shadow.layers.set(31);a.shadow.castShadow=false;a.shadow.material.colorWrite=false;
 a.mesh.userData.noSelfShadow=false;a.mesh.userData.realShadow25=true;
 a.mesh.castShadow=!a.pixelReleased;a.mesh.receiveShadow=true;
 a.mesh.material.shadowSide=THREE.DoubleSide;a.mesh.material.userData.wetResponse25=.12;
 return a;
}
const createLitActorBefore25=createActor;
createActor=function(...args){return lightActor25(createLitActorBefore25(...args));};
const animateLitActorBefore25=updateActor;
updateActor=function(a,dt){animateLitActorBefore25(a,dt);a.mesh.castShadow=!a.pixelReleased&&a.mesh.visible;a.shadow.layers.set(31);};

// An articulated sluice is never a static visibility chunk. Its merged plank
// geometry and the supporting frame update together in every camera pass.
function stabiliseSluice25(){
 const s=world?.userData.sluice18;if(!s)return;
 for(const root of[s.gate,s.frame]){root.visible=true;root.matrixAutoUpdate=true;root.matrixWorldAutoUpdate=true;
  root.traverse(o=>{o.matrixWorldAutoUpdate=true;o.matrixAutoUpdate=true;if(o.isMesh){o.visible=true;o.frustumCulled=false;o.userData.viewHidden=false;o.userData.noCutaway25=true;}});
  root.updateMatrixWorld(true);
 }presentation25.gateFrames++;
}

// Remove the separate circular terrain fan. The continuous landscape already
// supplies the pavilion floor and the surrounding road/grass transition.
facilityFloor18=function(){};

setupPuddles17=function(){
 if(activeScene.kind==='interior'||world.userData.puddles17)return;
 const b=activeScene.bounds,macro=activeScene.kind==='overworld',step=macro?28:8,rng=seeded(251017),points=[],grid=new Map();
 for(const t of scenery.trees){const k=Math.floor(t.x/8)+','+Math.floor(t.z/8);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(t);}
 for(let x=b[0]+3;x<b[1]-3;x+=step)for(let z=b[2]+3;z<b[3]-3;z+=step){
  if(points.length>=(macro?150:260))break;
  const px=x+(rng()-.5)*step*.6,pz=z+(rng()-.5)*step*.6,info=roadInfo(px,pz),r=.42+rng()*.8;
  if(info.d>2.1||info.kind==='bridge'||!staticFree(px,pz,r+.15)||waterGround(px,pz))continue;
  let covered=false;for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++)for(const t of grid.get((Math.floor(px/8)+ix)+','+(Math.floor(pz/8)+iz))??[])if(Math.hypot(px-t.x,pz-t.z)<3+r)covered=true;
  if(covered)continue;
  const y=heightAt(px,pz);if(Math.max(...[-1,1].flatMap(s=>[Math.abs(heightAt(px+s*r,pz)-y),Math.abs(heightAt(px,pz+s*r)-y)]))>.07)continue;
  points.push({x:px,z:pz,r,angle:rng()*TAU,stretch:.7+rng()*.7,seed:rng()*23});
 }
 const positions=[],uv=[],seeds=[];
 for(const q of points){const point=(u,v)=>{const a=(u-.5)*q.r*2*q.stretch,c=(v-.5)*q.r*2,x=q.x+Math.cos(q.angle)*a-Math.sin(q.angle)*c,z=q.z+Math.sin(q.angle)*a+Math.cos(q.angle)*c;return[x,heightAt(x,z)+.017,z,u,v];};
  for(let j=0;j<4;j++)for(let i=0;i<4;i++){const a=point(i/4,j/4),b=point((i+1)/4,j/4),c=point((i+1)/4,(j+1)/4),d=point(i/4,(j+1)/4);for(const p of[a,c,b,a,d,c]){positions.push(...p.slice(0,3));uv.push(...p.slice(3));seeds.push(q.seed);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('seed25',new THREE.Float32BufferAttribute(seeds,1));g.computeBoundingSphere();
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,uniforms:{wet:weather.wet,rain:weather.rain,time:weather.time,sun:weather.sun,cloud:weather.cloudMap,day:cinema22.day},vertexShader:'attribute float seed25;varying vec2 v25;varying vec3 wp25;varying float s25;void main(){v25=uv;wp25=position;s25=seed25;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float wet,rain,time,day;uniform vec3 sun;uniform sampler2D cloud;varying vec2 v25;varying vec3 wp25;varying float s25;
void main(){vec2 p=(v25-.5)*2.;float edge=length(p)+sin(p.x*6.+s25)*.11+sin(p.y*9.+s25*2.)*.06;float mask=(1.-smoothstep(.64,1.,edge))*smoothstep(.18,.8,wet);if(mask<.015)discard;
float wave=0.;for(int i=0;i<3;i++){float seed=s25+float(i)*2.17,age=fract(time*.56+seed);vec2 origin=vec2(sin(seed*2.),cos(seed*3.))*.5;float d=length(p-origin);wave+=sin((d-age*.9)*44.)*exp(-pow((d-age*.9)*13.,2.))*(1.-age)*rain*.024;}
vec3 n=normalize(vec3(wave,1.,wave*.7)),eye=normalize(cameraPosition-wp25),r=reflect(-eye,n);float cover=texture2D(cloud,wp25.xz*.006+vec2(time*.0013,time*.00037)+r.xz*.09).r;
vec3 sky=mix(vec3(.075,.14,.20),vec3(.43,.57,.66),day);sky=mix(sky,mix(vec3(.16,.21,.29),vec3(.73,.77,.78),day),cover*.68);float spec=pow(max(0.,dot(reflect(-normalize(sun),n),eye)),110.);float fresnel=.1+.52*pow(1.-max(0.,dot(eye,n)),4.);float alpha=mask*(.13+fresnel*.55);gl_FragColor=vec4(sky+vec3(1.05,.94,.74)*spec*day,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
 const o=new THREE.Mesh(g,m);o.userData.dynamicFX=true;o.userData.worldPuddles17=true;o.userData.groundedPuddles25=true;o.renderOrder=1;world.add(o);world.userData.puddles17={mesh:o,count:points.length,points};
};

const wetMaterialBefore25=addCloudLighting;
addCloudLighting=function(m){
 wetMaterialBefore25(m);if(!m?.userData.weatherV12||m.userData.wetPolicy25)return;m.userData.wetPolicy25=true;
 if([textures.oakCanopy,textures.pineCanopy,textures.grass,textures.grassA,textures.bark].includes(m.map))m.userData.wetResponse25=.14;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=sh=>{before(sh);sh.uniforms.wetResponse25={value:m.userData.wetResponse25??1};
  sh.fragmentShader='uniform float wetResponse25;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('roughnessFactor=mix(roughnessFactor,.18,wetAmount*weatherExterior*.83);','float wetUp25=abs(normalize(cross(dFdx(vWeatherWorld),dFdy(vWeatherWorld))).y);roughnessFactor=mix(roughnessFactor,mix(.36,.19,wetUp25),wetAmount*weatherExterior*wetResponse25*.78);');
  sh.fragmentShader=sh.fragmentShader.replace(/float damp17=wetAmount\*weatherExterior;[\s\S]*?outgoingLight\+=vec3\(.18,.23,.25\)\*shine17\*damp17\*\.3;/,'float damp25=wetAmount*weatherExterior*wetResponse25;float wetVariation25=.88+.12*sin(vWeatherWorld.x*.13+sin(vWeatherWorld.z*.19));outgoingLight*=1.-damp25*.24*wetVariation25;');
  sh.fragmentShader=sh.fragmentShader.replace('wetAmount*.24*weatherExterior','wetAmount*.08*weatherExterior*wetResponse25');
 };m.customProgramCacheKey=()=>key+'-material-wetness-v25';m.needsUpdate=true;
};

// The same moving density field drives the volume, ground shade and shafts.
// Eight samples through a real world-height slab give soft depth and silver
// edges; this is not a camera-space cloud layer.
const CLOUD_VOLUME25=`uniform sampler2D map;uniform float time,amount,day,bottom25,thickness25;uniform vec3 sun;varying vec3 worldP;
float field25(vec3 p){vec2 uv=p.xz*.006+vec2(time*.0013,time*.00037);float base=texture2D(map,uv).r;float detail=texture2D(map,uv*2.07+vec2(.17,.63)).r;float h=(p.y-bottom25)/thickness25;float body=smoothstep(0.,.2,h)*(1.-smoothstep(.55,1.,h));return smoothstep(.17,.76,base*.9+detail*.14)*body;}
void main(){vec3 ray=normalize(worldP-cameraPosition);float dy=max(.035,abs(ray.y));float stepSize=min(12.,thickness25/(dy*8.));vec3 p=worldP+ray*stepSize*.5;float trans=1.;vec3 sum=vec3(0.);vec3 lightDir=normalize(sun);float phase=.55+.45*pow(max(0.,dot(ray,lightDir)),7.);
for(int i=0;i<8;i++){float density=field25(p)*amount;float shade=field25(p+lightDir*8.);float absorb=1.-exp(-density*stepSize*.105);vec3 ambient=mix(vec3(.10,.15,.24),vec3(.64,.72,.81),day);vec3 lit=mix(vec3(.22,.29,.42),vec3(1.15,1.09,.94),day);vec3 colour=mix(ambient,lit,exp(-shade*2.2)*phase);sum+=colour*absorb*trans;trans*=1.-absorb;p+=ray*stepSize;}float alpha=1.-trans;if(alpha<.005)discard;gl_FragColor=vec4(sum/max(.001,alpha),alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const cloudVolumeBefore25=cloudShelf21;
cloudShelf21=function(){
 cloudVolumeBefore25();const o=world.userData.weather?.cloud;if(!o||activeScene.kind==='interior')return;
 const q=world.userData.cloud21,thickness=18;o.geometry.dispose();o.geometry=new THREE.BoxGeometry(q.width,thickness,q.depth);o.position.y=weather.height.value+thickness/2;
 o.material.dispose();o.material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.FrontSide,uniforms:{map:weather.cloudMap,time:weather.time,amount:weather.cloud,sun:weather.sun,day:cinema22.day,bottom25:weather.height,thickness25:{value:thickness}},vertexShader:'varying vec3 worldP;void main(){worldP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(worldP,1.);}',fragmentShader:CLOUD_VOLUME25});
 o.userData.cloudVolume25=true;o.renderOrder=7;presentation25.cloudVolumes++;
};

// Reapply the surface policy once, under the loader, before shader preparation.
const presentationBuildBefore25=buildWorld;
buildWorld=function(...args){
 const r=presentationBuildBefore25(...args);
 for(const o of[...scenery.forestMeshes,...world.userData.plantMeshes??[]]){o.material.userData.wetResponse25=.14;o.material.depthWrite=true;}
 for(const a of actors)lightActor25(a);
 stabiliseSluice25();return r;
};
const presentationRenderBefore25=render;
render=function(...args){
 if(renderer&&world){stabiliseSluice25();renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;presentation25.shadowFrames++;}
 return presentationRenderBefore25(...args);
};

function responsiveInterface25(){
 const w=innerWidth,h=innerHeight,phone=w<650,scale=phone?.7:clamp(Math.min(w/1680,h/960),.60,1);
 document.documentElement.style.setProperty('--hud-scale25',scale.toFixed(3));
 document.body.classList.toggle('phone25',phone);document.body.classList.toggle('short25',h<560);
}
window.addEventListener('resize',responsiveInterface25);responsiveInterface25();
const responsiveHUDBefore25=updateHUD;
updateHUD=function(...args){
 const r=responsiveHUDBefore25(...args);
 if(player&&camera){const s=parseFloat(document.documentElement.style.getPropertyValue('--hud-scale25'))||1,p=player.mesh.position.clone().add(V3(0,player.size*1.3,0)).project(camera);document.documentElement.style.setProperty('--interact-top25',clamp((.5-p.y*.5)*innerHeight/s-42,125,innerHeight/s-100)+'px');}
 return r;
};
const responsiveMenuBefore25=renderMenu;
renderMenu=function(...args){const r=responsiveMenuBefore25(...args);if(innerWidth<650)$('#menu-nav .active')?.scrollIntoView({block:'nearest',inline:'center'});return r;};
