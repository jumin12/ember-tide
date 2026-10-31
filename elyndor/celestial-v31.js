// A continuous east-to-west orbit drives the visible sun, directional light,
// shadow direction, cloud projection and scattering in every outdoor scene.
const celestial31={sun:{value:V3()},moon:{value:V3()},colour:{value:new THREE.Color()},day:{value:1},twilight:{value:0},night:{value:0},hour:0,frames:0};
for(const key of ['zenith','horizon','ambient','ground','fill','cloudLight','cloudShade'])celestial31[key]={value:new THREE.Color()};
const SKY_PHASES31=[
 [0,'#ffb36d','#071630','#203b5c','#718eb5','#27394d','#a8bfe7'],
 [4.5,'#ffad73','#171d40','#654b78','#8279a7','#3a3b52','#b3a3cd'],
 [5.4,'#ffa96c','#39476f','#d493a1','#ac91ac','#514453','#d4a9bd'],
 [6.1,'#ffbc78','#567ba8','#ffc28e','#c6aab7','#706048','#efd0bb'],
 [7.2,'#ffe1ac','#4b89c0','#bddcea','#b8d2e4','#69744f','#d5e7ef'],
 [9,'#fff0d4','#3684c4','#acd5e8','#c0d9e7','#69764d','#d8e9f1'],
 [12,'#fff7e6','#2577bd','#b6dbee','#c4e0eb','#69784f','#d9edf4'],
 [15,'#ffe5bd','#3d86b8','#c9dce0','#bed2df','#6e7451','#e1ded0'],
 [16.5,'#ffd08b','#647fa6','#ecc19d','#c6bac3','#77664e','#e4cbbd'],
 [17.5,'#ffac66','#5d638c','#f6a476','#c6a3b2','#705844','#e9b7a6'],
 [18.3,'#ff9b76','#393b60','#c47c90','#aa9ac0','#51485c','#c6afd4'],
 [19.5,'#ffc090','#182343','#625575','#858db6','#343e55','#a4b1d4'],
 [21,'#ffd6a9','#0b1b38','#2e496a','#7693ba','#293d52','#abc2e8'],
 [24,'#ffb36d','#071630','#203b5c','#718eb5','#27394d','#a8bfe7']
].map(([hour,...colours])=>({hour,colours:colours.map(c=>new THREE.Color(c))}));
function skyPalette31(h){let i=1;while(i<SKY_PHASES31.length-1&&h>SKY_PHASES31[i].hour)i++;const a=SKY_PHASES31[i-1],b=SKY_PHASES31[i],t=smooth(a.hour,b.hour,h);for(const[key,k]of[['colour',0],['zenith',1],['horizon',2],['ambient',3],['ground',4],['fill',5]])celestial31[key].value.copy(a.colours[k]).lerp(b.colours[k],t);const night=celestial31.night.value;celestial31.cloudLight.value.copy(celestial31.colour.value).multiplyScalar(1.08).lerp(SKY_PHASES31[0].colours[5],night).multiplyScalar(1-night*.55);celestial31.cloudShade.value.copy(celestial31.ambient.value).multiplyScalar(.60-night*.28);}
// Periodic lattice noise has identical opposite edges. The previous density
// map wrapped unrelated samples, producing straight seams in distant clouds.
let cloudTexture31=null;
cloudDensityTexture17=function(){if(cloudTexture31)return cloudTexture31;const size=512,data=new Uint8Array(size*size*4),fade=t=>t*t*t*(t*(t*6-15)+10),hash=(x,z,n)=>{x=(x%n+n)%n;z=(z%n+n)%n;let q=Math.imul(x+31,374761393)^Math.imul(z+97,668265263);q=Math.imul(q^(q>>>13),1274126177);return((q^(q>>>16))>>>0)/4294967295;};for(let z=0;z<size;z++)for(let x=0;x<size;x++){let value=0,total=0,weight=1;for(let k=0;k<5;k++){const n=4*2**k,px=x/size*n,pz=z/size*n,ix=Math.floor(px),iz=Math.floor(pz),u=fade(px-ix),v=fade(pz-iz);value+=mix(mix(hash(ix,iz,n),hash(ix+1,iz,n),u),mix(hash(ix,iz+1,n),hash(ix+1,iz+1,n),u),v)*weight;total+=weight;weight*=.48;}const c=Math.round(smooth(.23,.78,value/total)*255);data.set([c,c,c,255],(z*size+x)*4);}const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;climate17.texture=t;return cloudTexture31=t;};
const CLOUD31=`float cloudMask31(float raw,float cover){float edge=mix(.68,.12,cover);return smoothstep(edge,edge+.22,raw)*smoothstep(0.,.12,cover);}float cloudField31(sampler2D tex,vec2 p,float t,float cover){vec2 uv=p*.0045+vec2(t*.00072,t*.00024);vec2 warp=vec2(texture2D(tex,uv*.71+vec2(.13,.41)).r,texture2D(tex,uv*.83+vec2(.57,.19)).r)-.5;uv+=warp*.19;float broad=texture2D(tex,uv).r,medium=texture2D(tex,uv*1.91+vec2(.23,.72)).r,small=texture2D(tex,uv*5.7+vec2(.11,.29)).r;float raw=broad*.65+medium*.25+small*.10;return cloudMask31(raw,cover);}`;
const cloudMaterialBefore31=addCloudLighting;
addCloudLighting=function(m){cloudMaterialBefore31(m);if(!m?.userData.weatherV12||m.userData.cloud31)return;m.userData.cloud31=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=CLOUD31+'\n'+sh.fragmentShader;
 sh.fragmentShader=sh.fragmentShader.replace('max(.35,cloudSun.y)','max(.12,cloudSun.y)').replace('shadowWorld*.006','shadowWorld*.0022').replace(/float cloudShade=1\.-smoothstep\(\.05,\.85,cloudDensity\)\*cloudAmount\*\.(?:48|70)\*weatherExterior;/,'float cloudShade=1.-cloudField31(cloudTexture,shadowWorld,weatherTime,cloudAmount)*.82*weatherExterior;').replace('outgoingLight*=cloudShade;','outgoingLight=max(vec3(0.),outgoingLight-(reflectedLight.directDiffuse+reflectedLight.directSpecular)*(1.-cloudShade));');};m.customProgramCacheKey=()=>key+'-cloud-transmission31';m.needsUpdate=true;};
function solarState31(){const h=(state.worldMinutes/60%24+24)%24,a=(h-6)*Math.PI/12;celestial31.hour=h;celestial31.sun.value.set(Math.cos(a),Math.sin(a),Math.sin(a)*.44).normalize();celestial31.moon.value.copy(celestial31.sun.value).negate();const e=celestial31.sun.value.y;celestial31.day.value=smooth(-.10,.16,e);celestial31.twilight.value=(1-smooth(.03,.40,Math.abs(e)))*smooth(-.19,-.025,e);celestial31.night.value=1-smooth(-.17,.04,e);skyPalette31(h);return celestial31;}
const lightingBefore31=updateLighting;
updateLighting=function(){lightingBefore31();if(!world||!player)return;solarState31();if(activeScene.kind==='interior')return;
 const e=celestial31.sun.value.y,day=celestial31.day.value,night=celestial31.night.value,rain=weather.rain.value,moon=celestial31.moon.value,source=e>-.035?celestial31.sun.value:moon,p=restoration?cameraTarget:player,y=heightAt(p.x,p.z);
 sun.position.copy(source).multiplyScalar(90).add(V3(p.x,y,p.z));sun.target.position.set(p.x,y,p.z);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);sun.color.copy(e>-.035?celestial31.colour.value:new THREE.Color('#a9c8ef'));
 sun.intensity=(e>-.035?5.2*Math.sqrt(Math.max(0,e))*smooth(-.04,.055,e):.30*Math.sqrt(Math.max(0,moon.y))*smooth(.03,.18,moon.y))*(1-rain*.48)+weather.lightning*4;
 hemi.color.copy(celestial31.ambient.value);hemi.groundColor.copy(celestial31.ground.value);hemi.intensity=mix(.36,.96,day)*(1-rain*.15);
 if(skyBounce17){skyBounce17.color.copy(celestial31.fill.value);skyBounce17.intensity=mix(battle?.47:.20,battle?.82:.65,day);}
 scene.fog.color.copy(celestial31.horizon.value).lerp(celestial31.ambient.value,rain*.65);scene.background.copy(scene.fog.color);scene.fog.near=mix(activeScene.kind==='overworld'?185:145,75,rain);scene.fog.far=mix(activeScene.kind==='overworld'?520:400,235,rain);
 weather.sun.value.copy(source);sceneryLight.direction.value.copy(source);cinema22.day.value=day;cinema22.night.value=night;brookHydraulics.light.value=day;renderer.toneMappingExposure=mix(1.13,1.10,day);sun.shadow.normalBias=.018;sun.shadow.bias=-.0001;sun.shadow.radius=2.7;
 celestial31.frames++;
};
const skyFragment31=`uniform sampler2D map;uniform float time,cover,day,night,twilight,cloudHeight;uniform vec3 solar,moon,solarColour,horizon,zenith31;varying vec3 skyRay31;${CLOUD31}
float hash31(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){vec3 d=normalize(skyRay31);float up=smoothstep(-.05,.8,d.y);vec3 c=mix(horizon,zenith31,up);float toward=max(0.,dot(d,solar));float cloud=0.;if(d.y>.015){vec2 at=cameraPosition.xz+d.xz/d.y*max(1.,cloudHeight-cameraPosition.y);cloud=cloudField31(map,at,time,cover);}float transmission=exp(-cloud*5.5);
 c+=solarColour*pow(toward,64.)*.06*(1.-night)*transmission;c+=solarColour*pow(toward,400.)*.15*(1.-night)*transmission;float disc=smoothstep(.99990,.999965,dot(d,solar));c+=solarColour*disc*7.*transmission*(1.-night);
 float md=dot(d,moon);c+=vec3(.45,.62,.91)*pow(max(0.,md),80.)*.11*night*transmission;float moonDisc=smoothstep(.99982,.99993,md);c+=vec3(.72,.82,1.)*moonDisc*1.1*night*transmission;
 vec3 cell=floor(d*720.);float star=step(.9993,hash31(cell))*pow(max(0.,sin(hash31(cell+2.)*6.283+time*.3)),2.);c+=vec3(.65,.74,.96)*star*night*transmission*smoothstep(.06,.30,d.y);gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
const cloudsBefore31=cloudShelf21;
cloudShelf21=function(){cloudsBefore31();const o=world.userData.weather?.cloud;if(!o)return;const q=world.userData.cloud21;o.geometry.computeBoundingBox();const bounds=new THREE.Box3().setFromObject(o);Object.assign(o.material.uniforms,{cloudLight31:celestial31.cloudLight,cloudShade31:celestial31.cloudShade,cloudMin32:{value:bounds.min},cloudMax32:{value:bounds.max}});o.material.side=THREE.BackSide;
o.material.vertexShader='varying vec3 worldP;void main(){worldP=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(worldP,1.);gl_Position.z=min(gl_Position.z,gl_Position.w*.99999);}';
o.material.fragmentShader=`uniform sampler2D map;uniform float time,amount,day,bottom25,thickness25;uniform vec3 sun,cloudLight31,cloudShade31,cloudMin32,cloudMax32;varying vec3 worldP;${CLOUD31}
 float density31(vec3 p){
  float column=cloudField31(map,p.xz,time,amount);if(column<.004)return 0.;
  vec2 drift=vec2(time*.00072,time*.00024);float lobe=texture2D(map,p.xz*.011+drift+vec2(.34,.71)).r;
  float base=bottom25+thickness25*(.06+.20*lobe),height=thickness25*(.25+.67*sqrt(column));float h=(p.y-base)/height;
  float vertical=smoothstep(0.,.20,h)*(1.-smoothstep(.43,1.,h));
  float erosion=texture2D(map,p.xz*.043+vec2(p.y*.026,-p.y*.019)+drift*2.).r;
  float rho=column*(.62+.38*erosion)*vertical;
  vec2 edge=min(p.xz-cloudMin32.xz,cloudMax32.xz-p.xz);return rho*smoothstep(0.,95.,min(edge.x,edge.y));
 }
 void main(){
  vec3 ray=normalize(worldP-cameraPosition),inv=sign(ray)/max(abs(ray),vec3(.00001));vec3 a=(cloudMin32-cameraPosition)*inv,b=(cloudMax32-cameraPosition)*inv;
  vec3 near32=min(a,b),far32=max(a,b);float start=max(0.,max(near32.x,max(near32.y,near32.z))),end=min(far32.x,min(far32.y,far32.z));if(end<=start)discard;
  float stepSize=(end-start)/20.,trans=1.;vec3 p=cameraPosition+ray*(start+stepSize*.5),sum=vec3(0.),lightDir=normalize(sun);
  for(int i=0;i<20;i++){
   float rho=density31(p);if(rho>.001){float shadow=density31(p+lightDir*9.)*1.2+density31(p+lightDir*23.)*.85;float lit=exp(-shadow*2.2);float scatter=.52+.48*pow(max(0.,dot(ray,lightDir)),6.);float absorb=1.-exp(-rho*stepSize*.19);vec3 colour=mix(cloudShade31,cloudLight31,lit*scatter);sum+=colour*absorb*trans;trans*=1.-absorb;}p+=ray*stepSize;
  }
  float alpha=1.-trans;if(alpha<.005)discard;gl_FragColor=vec4(sum/max(.001,alpha),alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`;o.material.needsUpdate=true;o.userData.cloud31=true;o.userData.roundedCloud32=true;};
buildShafts24=function(){if(activeScene.kind==='interior')return;const old=world.userData.sunshafts?.beams??[];for(const g of new Set(old.map(o=>o.geometry)))g.dispose();for(const o of old)o.removeFromParent();if(world.userData.sunshafts)world.userData.sunshafts.beams=[];
 const g=new THREE.CylinderGeometry(.35,1.6,1,10,1,true);g.translate(0,.5,0);const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{map:weather.cloudMap,time:weather.time,cover:weather.cloud,height:weather.height,sun:weather.sun,day:celestial31.day,colour:celestial31.colour,rain:weather.rain},vertexShader:'varying vec3 wp31,radial31;varying vec2 uv31;void main(){uv31=uv;radial31=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*vec3(normal.x,0.,normal.z));wp31=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp31,1.);}',fragmentShader:`uniform sampler2D map;uniform float time,cover,height,day,rain;uniform vec3 sun,colour;varying vec3 wp31,radial31;varying vec2 uv31;${CLOUD31}
 void main(){vec2 source=wp31.xz+sun.xz/max(.12,sun.y)*max(0.,height-wp31.y);float cloud=cloudField31(map,source,time,cover),trans=exp(-cloud*6.);float rim=pow(sin(uv31.x*3.14159265),2.);float ends=smoothstep(0.,.08,uv31.y)*(1.-smoothstep(.72,1.,uv31.y));float phase=.45+.55*pow(max(0.,dot(normalize(wp31-cameraPosition),normalize(sun))),2.);float a=rim*ends*trans*day*(1.-rain*.85)*phase*.025*pow(abs(dot(normalize(radial31),normalize(cameraPosition-wp31))),2.);a*=1.-smoothstep(180.,500.,distance(wp31,cameraPosition));if(a<.0001)discard;gl_FragColor=vec4(colour*1.3,a);}`});
 const bins=Array.from({length:12},()=>[]),b=activeScene.bounds,seen=new Set(),cell=activeScene.kind==='overworld'?65:18;
 for(const t of scenery.trees){const key=Math.floor(t.x/cell)+','+Math.floor(t.z/cell);if(seen.has(key))continue;seen.add(key);const x=t.x+2,z=t.z+1.3,i=clamp(Math.floor((x-b[0])/(b[1]-b[0])*4),0,3)+clamp(Math.floor((z-b[2])/(b[3]-b[2])*3),0,2)*4;bins[i].push({x,y:heightAt(x,z)+.15,z});}
 const group=new THREE.Group();group.userData.dynamicFX=true;world.add(group);for(const anchors of bins){const o=new THREE.InstancedMesh(g,m,Math.max(1,anchors.length));o.count=anchors.length;o.userData={anchors26:anchors,dynamicFX:true,persistent27:true};o.renderOrder=3;o.frustumCulled=false;group.add(o);}world.userData.shafts24={group,key:'fixed-world31',last:-1,direction:V3(),trees:[]};atmosphere24.rays=12;
};
updateAtmosphere=function(){const q=world?.userData.shafts24;if(!q||!player)return;for(const o of world.userData.sunshafts?.beams??[])o.visible=false;q.group.visible=!battle&&celestial31.day.value>.01;if(clock-q.last<.045)return;q.last=clock;const direction=weather.sun.value;if(q.direction.distanceToSquared(direction)<1e-10)return;q.direction.copy(direction);const d=new THREE.Object3D();d.quaternion.setFromUnitVectors(axis24,direction);
 for(const o of q.group.children){for(let i=0;i<o.count;i++){const p=o.userData.anchors26[i];d.position.set(p.x,p.y,p.z);d.scale.set(1,clamp((weather.height.value-p.y)/Math.max(.14,direction.y),20,220),1);d.updateMatrix();o.setMatrixAt(i,d.matrix);}o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();}atmosphere24.refreshes++;};
const buildCelestialBefore31=buildWorld;
buildWorld=function(...args){const r=buildCelestialBefore31(...args);if(activeScene.kind!=='interior'){const o=world.userData.sky27;o.material.dispose();o.material=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{map:weather.cloudMap,time:weather.time,cover:weather.cloud,day:celestial31.day,night:celestial31.night,twilight:celestial31.twilight,solar:celestial31.sun,moon:celestial31.moon,solarColour:celestial31.colour,horizon:{value:scene.fog.color},zenith31:celestial31.zenith,cloudHeight:weather.height},vertexShader:'varying vec3 skyRay31;void main(){skyRay31=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=vec4(p.xy,p.w*.999999,p.w);}',fragmentShader:skyFragment31});world.userData.celestial31={orbit:true,linkedClouds:true,worldShafts:true};}updateLighting();updateAtmosphere();return r;};
const renderCelestialBefore31=render;render=function(...args){const sky=world?.userData.sky27;if(sky){if(journeySky)journeySky.visible=false;sky.position.copy(camera.position);sky.updateMatrixWorld(true);}return renderCelestialBefore31(...args);};
const dustBefore31=makeWorldDust22;
makeWorldDust22=function(){if(activeScene.kind==='interior'){roomDust31();return;}dustBefore31();const q=world.userData.dust22;if(!q)return;const m=q.mesh.material;m.uniforms.sun=weather.sun;m.uniforms.height=weather.height;m.uniforms.day=celestial31.day;m.uniforms.tint31=celestial31.colour;
 m.fragmentShader=`uniform float time,day,rain,cloud,height;uniform sampler2D cloudMap;uniform vec3 sun,tint31;varying vec3 seed22,world22;varying float fog22;${CLOUD31}
 void main(){vec2 p=gl_PointCoord-.5;float core=exp(-dot(p,p)*32.),halo=exp(-dot(p,p)*9.);vec2 source=world22.xz+sun.xz/max(.12,sun.y)*(height-world22.y);float shade=cloudField31(cloudMap,source,time,cloud);float pulse=.65+.35*sin(time*(.4+seed22.y*.5)+seed22.x*37.);float phase=.3+.7*pow(max(0.,dot(normalize(world22-cameraPosition),normalize(sun))),2.);float night=1.-day,firefly=step(.82,seed22.z);vec3 c=mix(tint31*1.3,vec3(.45,.85,.40),night);float a=(core*.46+halo*.08)*pulse*(1.-rain*.95)*(1.-smoothstep(55.,145.,fog22))*mix((1.-shade*.92)*phase,firefly*.6,night);if(a<.003)discard;gl_FragColor=vec4(c,a);}`;m.needsUpdate=true;};
function roomDust31(){
 const rng=seeded(31071),p=[];for(let i=0;i<120;i++)p.push((rng()-.5)*23,.6+rng()*5,(rng()-.5)*16);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,blending:THREE.AdditiveBlending,uniforms:{time:weather.time},vertexShader:'uniform float time;varying float glow31;void main(){vec3 p=position;p+=vec3(sin(time*.17+p.z)*.22,sin(time*.23+p.x)*.19,cos(time*.13+p.y)*.23);glow31=.5+.5*sin(p.x*2.+time*.36);vec4 mv=modelViewMatrix*vec4(p,1.);gl_PointSize=clamp(60./max(8.,-mv.z),1.1,2.6);gl_Position=projectionMatrix*mv;}',fragmentShader:'varying float glow31;void main(){vec2 p=gl_PointCoord-.5;float a=exp(-dot(p,p)*25.)*.22*glow31;gl_FragColor=vec4(1.1,.74,.37,a);}'}),o=new THREE.Points(g,m);o.userData.dynamicFX=true;o.renderOrder=4;world.add(o);world.userData.roomDust31=o;
}
