// The town fountain uses the actual Valenne river shader and paired PBR wave
// textures, with its own recirculating current and eight jet impact points.
function installFountain124(){
 const f=world?.userData.fountain123;if(activeScene?.key!=='brookstead'||!f||f.installed)return;
 const river=world.userData.waterPools.find(o=>waterUniforms62.has(o.material)),riverUniforms=river&&waterUniforms62.get(river.material);if(!riverUniforms)return;
 f.time={value:0};f.flow={value:state.flags.pump_repaired?1:0};f.center={value:new THREE.Vector3(f.x,f.base+.64,f.z)};
 const pool=f.pool;world.attach(pool);pool.updateMatrixWorld(true);
 const n=pool.geometry.attributes.position.count,flow=new Float32Array(n*2);
 for(let i=0;i<n;i++){const p=pool.geometry.attributes.position,x=p.getX(i),z=-p.getY(i),length=Math.hypot(x,z)||1;flow[i*2]=-z/length;flow[i*2+1]=x/length;}
 pool.geometry.setAttribute('channelFlow39',new THREE.BufferAttribute(flow,2));pool.geometry.setAttribute('waterDepth18',new THREE.Float32BufferAttribute(new Float32Array(n).fill(.85),1));
 const old=pool.material;old.userData.water18=true;pool.userData.freshwater38=true;
 const target=new THREE.WebGLRenderTarget(256,256,{depthBuffer:true,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}),matrix=new THREE.Matrix4();
 old.userData.riverReflection={matrix,texture:target.texture,upperMatrix:matrix,upperTexture:target.texture};pool.userData.poolTarget=target;pool.userData.reflMatrix=matrix;
 pool.material=waterMaterial62(pool,{texture:riverUniforms.field62.value,bounds:riverUniforms.fieldBounds62.value});old.dispose();
 // The pool has its own fixed height, rather than the continental river level.
 pool.userData.freshwater38=false;pool.userData.water62=true;pool.userData.waterRole='fountain';pool.receiveShadow=true;
 pool.userData.poolPatches=[new THREE.Box3(V3(f.x-2.2,f.base+.60,f.z-2.2),V3(f.x+2.2,f.base+.69,f.z+2.2))];world.userData.waterPools.push(pool);
 const m=pool.material,u=waterUniforms62.get(m);u.hasDepth62.value=1;u.hydraulic62={value:.35};
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.userData.fountain124=true;
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);Object.assign(s.uniforms,{fountainCenter124:f.center,fountainTime124:f.time,fountainFlow124:f.flow,opening108:{value:0},falls108:{value:[new THREE.Vector4(),new THREE.Vector4(),new THREE.Vector4()]}});
  s.fragmentShader='uniform vec3 fountainCenter124;uniform float fountainTime124,fountainFlow124;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace(/float localAge108=releaseAge108-travel108\(worldWater62.z\);[\s\S]*?stream62.y-=worldWater62.y\*\.78;/,`vec2 basinDelta124=worldWater62.xz-fountainCenter124.xz;
   float localAge108=-999.;float advection108=fountainTime124*.18;
   float angle124=atan(basinDelta124.y,basinDelta124.x)-advection108;
   vec2 current62=normalize(vec2(-basinDelta124.y,basinDelta124.x)+vec2(.001));
   vec2 stream62=fountainCenter124.xz+length(basinDelta124)*vec2(cos(angle124),sin(angle124));`);
  s.fragmentShader=s.fragmentShader.replace('float edge62=max(1.-smoothstep(.01,.34,waterDepth62),1.-smoothstep(.05,.68,bed62.g));','float edge62=1.-smoothstep(.015,.16,2.195-length(basinDelta124));');
  s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.15,.25,.29),vec3(.65,.8,.75),day62),foam62);',`vec2 impactNormal124=vec2(0.);float impactFoam124=0.;
   for(int j124=0;j124<8;j124++){float a124=float(j124)*.785398163;vec2 delta124=basinDelta124-vec2(cos(a124),sin(a124))*1.8;float d124=length(delta124);
    float detail124=noise62(delta124*37.+vec2(fountainTime124*2.2,-fountainTime124*1.4));
    float ring124=cos(d124*48.-fountainTime124*13.+a124)*exp(-d124*6.2)*smoothstep(.012,.054,d124);
    impactNormal124+=delta124/max(.02,d124)*ring124*.34*fountainFlow124;
    impactFoam124+=(exp(-d124*d124*145.)*(.07+detail124*.31)+max(0.,ring124)*detail124*.12)*fountainFlow124;}
   foam62+=impactFoam124;diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.15,.25,.29),vec3(.65,.8,.75),day62),clamp(foam62,0.,.65));`);
  s.fragmentShader=s.fragmentShader.replace('normal=normalize(normal+mat3(viewMatrix)*fineN62*.65);','normal=normalize(normal+mat3(viewMatrix)*(fineN62*.65+vec3(impactNormal124.x,0.,impactNormal124.y)));');
  // Keep the basin blue when a bright wall or the sky fills its mirror.
  s.fragmentShader=s.fragmentShader.replace('coverage62*(.22+fresnel62*.55)','coverage62*(.15+fresnel62*.40)');
  s.fragmentShader=s.fragmentShader.replace('#include <tonemapping_fragment>','gl_FragColor.rgb+=key62*impactFoam124*(.06+day62*.20);\n#include <tonemapping_fragment>');
 };m.customProgramCacheKey=()=>key+'-fountain-circulation124';m.needsUpdate=true;
 // Replace the old stationary, cloth-textured tubes with moving water.
 const prior=new Set();f.basin.traverse(o=>{if(o.userData.dynamicWater)prior.add(o);});prior.delete(pool);for(const o of prior){o.removeFromParent();o.geometry?.dispose();}
 world.userData.supplyJets=(world.userData.supplyJets??[]).filter(o=>!prior.has(o));
 installFountainStreams124(f);
 f.installed=true;f.stats={family:'Valenne',sharedRiverTextures:true,liveReflection:true,streams:8,droplets:48,impactRipples:8,time:0};world.userData.fountainWater124=f.stats;
 updateFountain124(0);
}

function installFountainStreams124(f){
 const curve=new THREE.CubicBezierCurve3(V3(.54,2.685,0),V3(1.20,2.89,0),V3(1.64,1.68,0),V3(1.8,.623,0));
 const segments=44,ring=11,geo=new THREE.TubeGeometry(curve,segments,.035,ring-1,false),centers=[];
 for(let i=0;i<=segments;i++){const p=curve.getPointAt(i/segments);for(let j=0;j<ring;j++)centers.push(p.x,p.y,p.z);}
 geo.setAttribute('jetCenter',new THREE.Float32BufferAttribute(centers,3));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,clipping:true,uniforms:{
  time:f.time,flow:f.flow,day:waterLight62.day,skyTint:waterLight62.sky,keyTint:waterLight62.key,
  sunDirection:waterLight62.sun,sunPower:waterLight62.power,cloud:waterLight62.cloud,waterArt:{value:textures.riverSurface18}
 },vertexShader:`
 #include <clipping_planes_pars_vertex>
 attribute vec3 jetCenter;uniform float time;varying vec3 worldPoint,worldNormal;varying vec2 streamUV;varying float phase;
 void main(){
  phase=instanceMatrix[0].z*5.+instanceMatrix[0].x*2.3;
  float run=uv.x;float advect=run*30.-time*6.2+phase;
  float pulse=1.+.14*sin(advect)+.072*sin(advect*2.6+uv.y*6.283);
  vec3 p=jetCenter+(position-jetCenter)*pulse;
  p.z+=.011*sin(run*20.-time*4.5+phase)*sin(run*3.14159);
  p.y+=.014*sin(run*24.-time*6.+phase)*sin(run*3.14159);
  vec4 w=modelMatrix*instanceMatrix*vec4(p,1.);worldPoint=w.xyz;
  worldNormal=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);streamUV=uv;
  vec4 mvPosition=viewMatrix*w;
  gl_Position=projectionMatrix*mvPosition;
  #include <clipping_planes_vertex>
 }`,fragmentShader:`
 #include <clipping_planes_pars_fragment>
 uniform float time,flow,day,sunPower,cloud;uniform vec3 skyTint,keyTint,sunDirection;uniform sampler2D waterArt;
 varying vec3 worldPoint,worldNormal;varying vec2 streamUV;varying float phase;
 void main(){
  #include <clipping_planes_fragment>
  vec3 v=normalize(cameraPosition-worldPoint),n=normalize(worldNormal);
  float facing=clamp(dot(n,v),0.,1.);
  float rim=pow(1.-facing,2.4);
  float speed=streamUV.x*2.7-time*1.8+phase;
  float striae=texture2D(waterArt,vec2(speed,streamUV.y*.21+phase)).g;
  float bands=sin(speed*37.+striae*6.)*.5+.5;
  vec3 h=normalize(v+normalize(sunDirection));
  float glint=pow(max(0.,dot(n,h)),39.)*min(1.2,sunPower)*(1.-cloud*.62);
  // The sky still reads on the centre of the stream in the sun's shadow.
  // Fine moving highlights come from the flow, with a separate solar glint.
  float crest=pow(clamp(bands*(.67+striae*.79),0.,1.),2.4);
  float filament=smoothstep(.59,.98,facing)*(.33+crest*.67);
  float ambient=.37+.63*day;
  vec3 tint=mix(skyTint,vec3(.73,.77,.77),.55);
  vec3 body=tint*(.22+.27*facing+.29*rim+.68*filament)*ambient;
  vec3 light=keyTint*(glint*.91+crest*rim*.21)*ambient;
  float edge=smoothstep(0.,.028,streamUV.x)*(1.-smoothstep(.989,1.,streamUV.x));
  float opacity=.25+.14*facing+.13*rim+.25*filament+.17*glint;
  gl_FragColor=vec4(body+light,flow*edge*opacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
 f.streams=new THREE.InstancedMesh(geo,material,8);f.streams.name='Curved recirculating fountain jets';
 const transform=new THREE.Matrix4();for(let i=0;i<8;i++)f.streams.setMatrixAt(i,transform.makeRotationY(-i*TAU/8));
 f.streams.instanceMatrix.needsUpdate=true;f.streams.computeBoundingSphere();
 f.streams.userData.dynamicWater=true;f.streams.userData.dynamicFX=true;f.basin.add(f.streams);

 const crownMaterial=new THREE.MeshPhysicalMaterial({color:'#80a2a4',roughness:.21,clearcoat:1,clearcoatRoughness:.13,envMap:surface67.outdoor,envMapIntensity:.65,transparent:true,opacity:.29,depthWrite:false});
 const crownNormal=envPbr103.maps.get('waveHeight103:normalRough');
 crownMaterial.normalMap=crownNormal;
 crownMaterial.normalScale.set(.28,.28);
 crownMaterial.onBeforeCompile=s=>{
  s.uniforms.crownTime=f.time;s.fragmentShader='uniform float crownTime;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`
   vec2 crownUV=vNormalMapUv*2.+vec2(crownTime*.29,-crownTime*.22);
   vec3 crownWave=texture2D(normalMap,crownUV).xyz*2.-1.;
   crownWave.xy*=normalScale;
   normal=normalize(tbn*crownWave);
   diffuseColor.a*=1.-smoothstep(.43,.50,length(vNormalMapUv-vec2(.5)));`);
 };
 crownMaterial.customProgramCacheKey=()=> 'fountain-wet-crown';
 f.crown=new THREE.Mesh(new THREE.CircleGeometry(.596,48),crownMaterial);f.crown.name='Shallow water over the fountain crown';
 f.crown.position.y=2.701;f.crown.rotation.x=-Math.PI/2;
 f.crown.userData.dynamicWater=true;f.crown.userData.dynamicFX=true;f.basin.add(f.crown);

 const splashMaterial=new THREE.MeshPhysicalMaterial({color:'#b8d4d1',roughness:.22,metalness:.0,clearcoat:.8,envMap:surface67.outdoor,envMapIntensity:.56,transparent:true,opacity:.63,depthWrite:false});
 f.drops=new THREE.InstancedMesh(new THREE.SphereGeometry(.023,6,4),splashMaterial,48);
 f.drops.name='Fountain contact spray';f.drops.userData.dynamicWater=true;f.drops.userData.dynamicFX=true;
 f.drops.frustumCulled=false;f.drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);f.basin.add(f.drops);
 f.spray={transform,position:V3(),scale:V3(),rotation:new THREE.Quaternion()};
}
const fountainBuildBefore124=buildWorld;
buildWorld=function(...args){const r=fountainBuildBefore124(...args);installFountain124();return r;};
function updateFountain124(dt){
 const f=world?.userData.fountain123;if(!f?.installed||activeScene.key!=='brookstead')return;
 const on=state.flags.pump_repaired===true;f.flow.value=mix(f.flow.value,on?1:0,1-Math.exp(-Math.max(0,dt)*3));f.time.value+=Math.max(0,dt)*(.10+f.flow.value*.90);
 f.streams.visible=f.drops.visible=f.crown.visible=on;
 if(on&&dt>0){
  const {transform,position,scale,rotation}=f.spray;
  for(let i=0;i<48;i++){
   const a=Math.floor(i/6)*TAU/8,j=i%6;
   const t=(f.time.value*(1.05+.17*j)+i*.382)%1,spread=a+j*2.39996;
   const size=Math.sin(t*Math.PI)**.55*(.46+.10*j)*f.flow.value;
   position.set(Math.cos(a)*1.80+Math.cos(spread)*t*(.14+j*.036),.643+4*t*(1-t)*(.070+j*.031),Math.sin(a)*1.80+Math.sin(spread)*t*(.14+j*.036));
   scale.set(size,size*1.65,size);transform.compose(position,rotation,scale);f.drops.setMatrixAt(i,transform);
  }
  f.drops.instanceMatrix.needsUpdate=true;
 }
 f.stats.time=f.time.value;f.stats.flow=f.flow.value;
}
const fountainFxBefore124=updateWorldFX;
updateWorldFX=function(dt){fountainFxBefore124(dt);updateFountain124(dt);};
