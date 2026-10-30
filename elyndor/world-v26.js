// Stable structural joints: the canal masonry ends at the sluice abutments.
// No coplanar decorative caps overlap at the gate, in either camera pass.
const world26={shafts:0,backdrops:0};
const distantHazeRange26={value:new THREE.Vector2(105,300)};
const treePlacementBefore26=buildSolidTree;
buildSolidTree=function(x,z,...args){if(activeScene?.key==='brookstead'&&Math.hypot(x+169,z-91)<5)return null;return treePlacementBefore26(x,z,...args);};
const canalBefore26=buildWorkingCanal;
buildWorkingCanal=function(){
 canalBefore26();if(activeScene?.key!=='brookstead')return;
 const s=world.userData.sluice18,g=new THREE.Group();g.userData.sluiceAbutment26=true;world.add(g);
 for(const side of[-1,1]){
  const x=s.cx+side*(brookWidth(70)+1.05),top=baseLand(x,70)+.075;
  box(x,(top+2.8)/2,70,1.72,top-2.8,2.88,'wall','#b7c4b5',g);
  box(x,top+.10,70,1.88,.20,2.98,'wall','#d9dccb',g);
  obstacle(x,70,1.88,2.98,'sluice abutment');
  obstacle(s.cx+side*(s.half+.55),70,1.8,2,'sluice pier');
 }
 mergeGroup(g);g.traverse(o=>{if(o.isMesh){o.frustumCulled=false;o.userData.noCutaway25=true;}});
 world.userData.sluiceAbutment26=g;
};

function stairRails26(){
 if(activeScene.key!=='brookstead')return;
 const rails=new THREE.Group();rails.userData.stairRails26=true;world.add(rails);const profiles=[];
 for(const s of world.userData.steps19){
  const u0=-s.len/2-.25,u1=s.len/2+s.landing-.08,span=u1-u0,n=Math.ceil(span/1.7),row=[];
  for(let i=0;i<=n;i++){
   const u=mix(u0,u1,i/n),p=stairPoint19(s,u,0,0);p.y=heightAt(p.x,p.z);row.push({u,y:p.y});
  }
  for(const side of[-1,1])for(let i=0;i<row.length;i++){
   const a=row[i],p=stairPoint19(s,a.u,side*(s.w/2+.23),a.y);
   box(p.x,p.y+.53,p.z,.17,1.12,.17,'wood','#9d794e',rails);
   box(p.x,p.y+.08,p.z,.32,.17,.32,'wall','#c1c6b4',rails);
   if(i){const b=row[i-1],q=stairPoint19(s,b.u,side*(s.w/2+.23),b.y);for(const h of[.46,1.02])beam(p.clone().add(V3(0,h,0)),q.clone().add(V3(0,h,0)),h>.5?.075:.045,'wood','#c59b69',rails);}
  }
  profiles.push({x:s.x,z:s.z,start:u0,end:u1,rows:row,width:s.w+.46});
 }
 mergeGroup(rails);rails.updateMatrixWorld(true);rails.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});world.userData.railProfiles26=profiles;
}

// Pools use the river's native pixel-art surface, coherent sky lighting and
// several overlapping basins. Geometry follows the actual road, not the camera.
setupPuddles17=function(){
 if(activeScene.kind==='interior'||world.userData.puddles17)return;
 const b=activeScene.bounds,macro=activeScene.kind==='overworld',step=macro?28:7,rng=seeded(261017),points=[],grid=new Map();
 for(const t of scenery.trees){const k=Math.floor(t.x/8)+','+Math.floor(t.z/8);if(!grid.has(k))grid.set(k,[]);grid.get(k).push(t);}
 for(let x=b[0]+3;x<b[1]-3;x+=step)for(let z=b[2]+3;z<b[3]-3;z+=step){
  if(points.length>=(macro?150:240))break;
  const px=x+(rng()-.5)*step*.7,pz=z+(rng()-.5)*step*.7,info=roadInfo(px,pz),r=.30+Math.pow(rng(),1.6)*1.9;
  if(info.d>2.05||info.kind==='bridge'||!staticFree(px,pz,r+.18)||waterGround(px,pz))continue;
  let covered=false;for(let ix=-1;ix<=1;ix++)for(let iz=-1;iz<=1;iz++)for(const t of grid.get((Math.floor(px/8)+ix)+','+(Math.floor(pz/8)+iz))??[])if(Math.hypot(px-t.x,pz-t.z)<3+r)covered=true;
  if(covered)continue;const y=heightAt(px,pz);
  if(Math.max(...[-1,0,1].flatMap(u=>[-1,0,1].map(v=>Math.abs(heightAt(px+u*r*1.4,pz+v*r*1.4)-y))))>.035)continue;
  points.push({x:px,z:pz,r,angle:rng()*TAU,stretch:.55+rng()*.8,seed:rng()*23});
 }
 const positions=[],uv=[],seeds=[];
 for(const q of points){const point=(u,v)=>{const a=(u-.5)*q.r*2*q.stretch,c=(v-.5)*q.r*2,x=q.x+Math.cos(q.angle)*a-Math.sin(q.angle)*c,z=q.z+Math.sin(q.angle)*a+Math.cos(q.angle)*c;return[x,heightAt(x,z)+.018,z,u,v];};
  for(let j=0;j<6;j++)for(let i=0;i<6;i++){const a=point(i/6,j/6),b=point((i+1)/6,j/6),c=point((i+1)/6,(j+1)/6),d=point(i/6,(j+1)/6);for(const p of[a,c,b,a,d,c]){positions.push(...p.slice(0,3));uv.push(...p.slice(3));seeds.push(q.seed);}}
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('seed25',new THREE.Float32BufferAttribute(seeds,1));g.computeBoundingSphere();
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,uniforms:{art:{value:textures.riverSurface18??textures.waterAlbedo},wet:weather.wet,rain:weather.rain,time:weather.time,sun:weather.sun,cloud:weather.cloudMap,amount:weather.cloud,day:cinema22.day},vertexShader:'attribute float seed25;varying vec2 v26;varying vec3 wp26;varying float s26;void main(){v26=uv;wp26=position;s26=seed25;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D art,cloud;uniform float wet,rain,time,day,amount;uniform vec3 sun;varying vec2 v26;varying vec3 wp26;varying float s26;
float basin26(vec2 p){float a=length((p-vec2(.16*sin(s26),.11*cos(s26*2.)))*vec2(1.03,.91));float b=length((p-vec2(-.28,.12))*vec2(1.5,1.8));return min(a,b)+sin(p.x*8.+s26)*.055+sin(p.y*11.+s26*1.7)*.045;}
void main(){vec2 p=(v26-.5)*2.;float basin=basin26(p);float edge=1.-smoothstep(.76,.94,basin),mask=edge*smoothstep(.15,.78,wet);if(mask<.006)discard;
vec2 flow=wp26.xz*.12+vec2(time*.0007,-time*.0011),wave=vec2(0.);vec3 water=texture2D(art,flow).rgb;water=mix(water,texture2D(art,mat2(.8,.6,-.6,.8)*flow*1.31+vec2(.13,.37)).rgb,.46);
for(int i=0;i<4;i++){float seed=s26+float(i)*2.17,age=fract(time*.48+seed);vec2 origin=vec2(sin(seed*2.),cos(seed*3.))*.53,d=p-origin;float len=length(d),ring=sin((len-age*.95)*54.)*exp(-pow((len-age*.95)*18.,2.))*(1.-age);wave+=normalize(d+vec2(.001))*ring*rain*.016;}
wave+=vec2(sin(wp26.x*3.1+time*.7),cos(wp26.z*2.7+time*.6))*.003;
vec3 n=normalize(vec3(wave.x,1.,wave.y)),eye=normalize(cameraPosition-wp26),r=reflect(-eye,n);float cover=texture2D(cloud,(wp26.xz+sun.xz/max(.35,sun.y)*55.)*.0022+vec2(time*.0013,time*.00037)+r.xz*.04).r;
vec3 sky=mix(vec3(.055,.09,.14),vec3(.40,.57,.67),day);sky=mix(sky,mix(vec3(.15,.18,.25),vec3(.76,.79,.79),day),cover*amount*.7);float spec=pow(max(0.,dot(reflect(-normalize(sun),n),eye)),180.);float fresnel=.16+.54*pow(1.-max(0.,dot(eye,n)),4.);
vec3 colour=mix(water*vec3(.32,.55,.62),sky,.16+fresnel*.60)*mix(.35,1.,day);colour+=vec3(2.,1.75,1.25)*spec*day*(1.-cover*amount*.82);float alpha=mask*mix(.22,.86,1.-smoothstep(.28,.78,basin));gl_FragColor=vec4(colour,alpha);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
 const o=new THREE.Mesh(g,m);o.userData.dynamicFX=true;o.userData.worldPuddles17=true;o.userData.groundedPuddles25=true;o.userData.riverPuddles26=true;o.renderOrder=1;world.add(o);world.userData.puddles17={mesh:o,count:points.length,points};
};

// A persistent set of shafts is distributed once over the entire location.
// Only the sun angle and moving cloud density change them during play.
buildShafts24=function(){
 if(activeScene.kind==='interior')return;
 for(const o of world.userData.sunshafts?.beams??[])o.visible=false;
 const g=new THREE.CylinderGeometry(.55,2.0,20,10,1,true);g.translate(0,10,0);
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:weather.time,day:cinema22.day,rain:weather.rain,cloud:weather.cloud,map:weather.cloudMap,sun:weather.sun,height:weather.height},vertexShader:'varying vec3 wp26;varying vec2 tex26;void main(){tex26=uv;wp26=(modelMatrix*instanceMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp26,1.);}',fragmentShader:`uniform sampler2D map;uniform float time,day,rain,cloud,height;uniform vec3 sun;varying vec3 wp26;varying vec2 tex26;void main(){vec2 uv=(wp26.xz+sun.xz/max(.35,sun.y)*max(0.,height-wp26.y))*.0022+vec2(time*.0013,time*.00037);float cover=texture2D(map,uv).r;cover=max(cover,texture2D(map,uv*.67+vec2(.31,.62)).r*.7);float rim=pow(sin(tex26.x*3.14159265),3.);float fade=smoothstep(0.,.18,tex26.y)*(1.-smoothstep(.65,1.,tex26.y));float a=rim*fade*.025*day*(1.-rain*.83)*(1.-smoothstep(.05,.85,cover)*cloud*.98);if(a<.00025)discard;gl_FragColor=vec4(vec3(1.25,1.08,.72),a);}`});
 const bins=Array.from({length:12},()=>[]),b=activeScene.bounds,cell=activeScene.kind==='overworld'?38:13,seen=new Set();
 for(const t of scenery.trees){const key=Math.floor(t.x/cell)+','+Math.floor(t.z/cell);if(seen.has(key))continue;seen.add(key);const x=t.x+2.0,z=t.z+1.2;if(waterGround(x,z))continue;const i=clamp(Math.floor((x-b[0])/(b[1]-b[0])*4),0,3)+clamp(Math.floor((z-b[2])/(b[3]-b[2])*3),0,2)*4;bins[i].push({x,y:heightAt(x,z)+.12,z});}
 const group=new THREE.Group();group.userData.dynamicFX=true;world.add(group);for(const list of bins){const o=new THREE.InstancedMesh(g,m,Math.max(1,list.length));o.count=list.length;o.userData.anchors26=list;o.userData.dynamicFX=true;o.renderOrder=3;group.add(o);}
 world.userData.shafts24={group,key:'fixed-world26',trees:[],last:-1,direction:V3(0,0,0)};world26.shafts=bins.reduce((n,a)=>n+a.length,0);atmosphere24.rays=12;
};
updateAtmosphere=function(){
 const q=world?.userData.shafts24;if(!q)return;for(const o of world.userData.sunshafts?.beams??[])o.visible=false;
 q.group.visible=!battle&&activeScene.kind!=='interior';const direction=weather.sun.value;if(q.direction.distanceToSquared(direction)<.00002)return;q.direction.copy(direction);
 const d=new THREE.Object3D();d.quaternion.setFromUnitVectors(axis24,direction);for(const o of q.group.children){for(let i=0;i<o.count;i++){const p=o.userData.anchors26[i];d.position.set(p.x,p.y,p.z);d.scale.setScalar(1);d.updateMatrix();o.setMatrixAt(i,d.matrix);}o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();}atmosphere24.refreshes++;
};
const largeCloudMaterialBefore26=addCloudLighting;
addCloudLighting=function(m){largeCloudMaterialBefore26(m);if(!m?.userData.weatherV12||m.userData.cloudScale26)return;m.userData.cloudScale26=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=sh.fragmentShader.replace('shadowWorld*.006','shadowWorld*.0022');};m.customProgramCacheKey=()=>key+'-large-cloud26';m.needsUpdate=true;};
const cloudBuildBefore26=cloudShelf21;
cloudShelf21=function(){cloudBuildBefore26();const o=world?.userData.weather?.cloud;if(o?.userData.cloudVolume25)o.material.fragmentShader=o.material.fragmentShader.replace('p.xz*.006','p.xz*.0022');};

// Textured 3D hills continue the playable scene. No painted
// panorama, billboard or image wall sits behind a location.
function distantNoise26(x,z){const h=(a,b)=>{let n=Math.imul(a,374761393)^Math.imul(b,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;},ix=Math.floor(x),iz=Math.floor(z),u=smooth(0,1,x-ix),v=smooth(0,1,z-iz);return mix(mix(h(ix,iz),h(ix+1,iz),u),mix(h(ix,iz+1),h(ix+1,iz+1),u),v);}
function distantMaterial26(key,color,layer){
 const base=material(key,color,{vertexColors:true,fog:false}),m=base.clone(),baseCompile=base.onBeforeCompile,baseKey=base.customProgramCacheKey();m.onBeforeCompile=baseCompile;m.customProgramCacheKey=()=>baseKey;addCloudLighting(m);const before=m.onBeforeCompile,cache=m.customProgramCacheKey();
 m.onBeforeCompile=sh=>{before(sh);sh.uniforms.distantHaze26={value:scene.fog.color};sh.uniforms.distantRange26=distantHazeRange26;sh.fragmentShader='uniform vec3 distantHaze26;uniform vec2 distantRange26;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>','float haze26=smoothstep(distantRange26.x,distantRange26.y*1.1,distance(cameraPosition,vWeatherWorld));haze26=clamp(.18+haze26*.80+wetAmount*.06,0.,.96);outgoingLight=mix(outgoingLight,distantHaze26,haze26);\n#include <opaque_fragment>');sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\ngl_Position.z=min(gl_Position.z,gl_Position.w*'+(layer?'.99985':'.99975')+');');};m.customProgramCacheKey=()=>cache+'-distant-landscape26-'+layer;return m;
}
function buildDistantLandscape26(){
 if(activeScene.kind==='interior')return;const old=world.userData.backdrop;if(!old)return;old.visible=true;
 const deform=(x,y,z)=>{const n=distantNoise26(x*3.2+14,z*3.2+28),r=1+(n-.5)*.23+Math.sin(x*6+z*3)*.055;return V3(x*r,y*r*(1+.16*Math.sin(x*3-z*4)),z*r);};
 if(!sharedGeo.distantMountain26){const g=new THREE.SphereGeometry(1,40,24),p=g.attributes.position,colours=[];for(let i=0;i<p.count;i++){const y=p.getY(i),v=deform(p.getX(i),y,p.getZ(i));v.y=Math.max(-.85,v.y);p.setXYZ(i,v.x,v.y,v.z);const c=new THREE.Color('#6e855b').lerp(new THREE.Color('#a5ada8'),smooth(.2,.9,y)*.76);colours.push(c.r,c.g,c.b);}g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));g.computeVertexNormals();g.computeBoundingSphere();sharedGeo.distantMountain26=g;}
 old.geometry=sharedGeo.distantMountain26;old.material.dispose();old.material=distantMaterial26('rock','#c5d0c8',0);old.frustumCulled=false;old.userData.terrain=true;
 const b=activeScene.bounds,cx=activeScene.kind==='overworld'?0:(b[0]+b[1])/2,cz=activeScene.kind==='overworld'?-50:(b[2]+b[3])/2,matrix=new THREE.Matrix4(),p=V3(),s=V3(),q=new THREE.Quaternion();for(let i=0;i<old.count;i++){old.getMatrixAt(i,matrix);matrix.decompose(p,q,s);const distance=activeScene.kind==='overworld'?3.3:2.7;p.x=cx+(p.x-cx)*distance;p.z=cz+(p.z-cz)*distance;s.multiply(V3(1.7,1.3,1.7));p.y=-s.y*.36;matrix.compose(p,q,s);old.setMatrixAt(i,matrix);}old.instanceMatrix.needsUpdate=true;old.computeBoundingSphere();
 const group=new THREE.Group();group.userData.landscape26=true;world.add(group);group.add(old);const specs=[{vertices:old.geometry.attributes.position.count,triangles:old.geometry.index.count/3*old.count}];
 buildLandscapeApron26(group);group.updateMatrixWorld(true);group.traverse(o=>{o.updateMatrix();o.matrixAutoUpdate=false;o.matrixWorldAutoUpdate=false;});world.userData.landscape26={group,layers:specs,trees:0,threeDimensional:true,continuousDistance:1000};world26.backdrops++;
}
function beyondGround26(x,z){
 const b=activeScene.bounds,ex=clamp(x,b[0],b[1]),ez=clamp(z,b[2],b[3]),d=Math.hypot(x-ex,z-ez),edge=groundAt(ex,ez),noise=distantNoise26(x*.005+3,z*.005+9)*.7+distantNoise26(x*.012-21,z*.012+12)*.3;
 let y=mix(edge,-4+noise*29+Math.pow(distantNoise26(x*.002,z*.002),2)*34,smooth(0,180,d));
 if(activeScene.key==='brookstead'&&z<30){const bank=Math.abs(x-brookChannel(z))-brookWidth(z)-1.05;y=mix(3.2,y,smooth(-.1,5,bank));}
 if(activeScene.key==='harbor'&&x>349)y=mix(y,-7,smooth(349,400,x));
 return y;
}
function buildLandscapeApron26(group){
 const b=activeScene.bounds,depths=[0,8,20,45,90,170,290,470,720,1000],n=128,positions=[],uv=[],colors=[],indices=[];
 const point=(i,d)=>{const side=Math.floor(i/n),t=(i%n)/n,l=b[0]-d,r=b[1]+d,top=b[2]-d,bottom=b[3]+d;return side===0?[mix(l,r,t),top]:side===1?[r,mix(top,bottom,t)]:side===2?[mix(r,l,t),bottom]:[l,mix(bottom,top,t)];};
 for(let j=0;j<depths.length;j++)for(let i=0;i<n*4;i++){const[x,z]=point(i,depths[j]),y=beyondGround26(x,z),c=new THREE.Color('#82916a').lerp(new THREE.Color('#a6aa8a'),distantNoise26(x*.028,z*.028)*.33);positions.push(x,y-.035,z);uv.push(x*.025,z*.025);colors.push(c.r,c.g,c.b);if(j<depths.length-1){const a=j*n*4+i,b=j*n*4+(i+1)%(n*4),c=a+n*4,d=b+n*4;indices.push(a,c,b,b,c,d);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();const m=distantMaterial26('grass','#b1bb94',1);m.side=THREE.DoubleSide;const o=new THREE.Mesh(g,m);o.frustumCulled=false;o.userData.terrain=true;o.userData.continuousApron26=true;group.add(o);
 if(activeScene.key==='brookstead'){
  const pool=world.userData.waterPools.find(p=>p.userData.waterRole==='reservoir'),g=brookRibbon(-650,30,brookChannel,z=>brookWidth(z)+1.05);g.setAttribute('waterDepth18',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(3),1));
  const m=pool.material.clone(),before=pool.material.onBeforeCompile,key=pool.material.customProgramCacheKey();m.color.set('#3d8697');m.roughness=.24;m.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=sh.fragmentShader.replace('art20*1.65,.22','art20*1.55,.43');};m.customProgramCacheKey=()=>key+'-river-continuation26';
  const stream=new THREE.Mesh(g,m);stream.frustumCulled=false;stream.position.y=brookHydraulics.head.value;stream.userData.dynamicFX=true;world.add(stream);world.userData.upstream26=stream;
 }
}
const sceneryBuildBefore26=buildWorld;
buildWorld=function(...args){const r=sceneryBuildBefore26(...args);stairRails26();buildDistantLandscape26();const p=world.userData.puddles17?.mesh.geometry.attributes.position;if(p){for(let i=0;i<p.count;i++)p.setY(i,heightAt(p.getX(i),p.getZ(i))+.018);p.needsUpdate=true;}if(activeScene.key==='brookstead')for(const o of[water,...world.userData.waterPools,...world.userData.brookFallObjects]){o.material.color.set('#3d8697');o.material.roughness=.24;const m=o.material,before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=sh.fragmentShader.replace('art20*1.65,.22','art20*1.55,.43');};m.customProgramCacheKey=()=>key+'-river-colour26';m.needsUpdate=true;}return r;};
const distanceLightBefore26=updateLighting;updateLighting=function(){distanceLightBefore26();distantHazeRange26.value.set(scene.fog.near,scene.fog.far);};
const endlessRenderBefore26=render;render=function(...args){const o=world?.userData.upstream26;if(o){o.position.y=brookHydraulics.head.value;o.updateMatrix();o.updateMatrixWorld(true);}return endlessRenderBefore26(...args);};
const endlessReflectionBefore26=updateReflection;updateReflection=function(...args){const o=world?.userData.upstream26,visible=o?.visible;if(o)o.visible=false;try{return endlessReflectionBefore26(...args);}finally{if(o)o.visible=visible;}};
