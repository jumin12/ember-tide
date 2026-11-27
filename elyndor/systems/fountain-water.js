// The town fountain uses the actual Valenne river shader and paired PBR wave
// textures, with its own recirculating current and the carved pillar's four jet impact points.
function installFountain124(){
 const f=world?.userData.fountain123;if(activeScene?.key!=='brookstead'||!f||f.installed)return;
 const river=world.userData.waterPools.find(o=>waterUniforms62.has(o.material)),riverUniforms=river&&waterUniforms62.get(river.material);if(!riverUniforms)return;
 const d=brookFountainDesign221;
 f.time={value:0};f.flow={value:0};f.center={value:new THREE.Vector3(f.x,f.base+d.waterY,f.z)};
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
 pool.userData.poolPatches=[new THREE.Box3(V3(f.x-d.poolRadius,f.base+.60,f.z-d.poolRadius),V3(f.x+d.poolRadius,f.base+.69,f.z+d.poolRadius))];world.userData.waterPools.push(pool);
 const m=pool.material,u=waterUniforms62.get(m);u.hasDepth62.value=1;u.hydraulic62=f.flow;
 // The river's PBR layers also sample time62 for normals, glints and caustics.
 // Give the basin its own clock so standing water still reflects the live scene.
 u.time62=f.time;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.userData.fountain124=true;
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);Object.assign(s.uniforms,{fountainCenter124:f.center,fountainTime124:f.time,fountainFlow124:f.flow,opening108:{value:0},falls108:{value:[new THREE.Vector4(),new THREE.Vector4(),new THREE.Vector4()]}});
  s.fragmentShader='uniform vec3 fountainCenter124;uniform float fountainTime124,fountainFlow124;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace(/float localAge108=releaseAge108-travel108\(worldWater62.z\);[\s\S]*?stream62.y-=worldWater62.y\*\.78;/,`vec2 basinDelta124=worldWater62.xz-fountainCenter124.xz;
   float localAge108=-999.;
   vec2 current62=vec2(.07,.04);
   vec2 stream62=worldWater62.xz-current62*fountainTime124;`);
  s.fragmentShader=s.fragmentShader.replace('float edge62=max(1.-smoothstep(.01,.34,waterDepth62),1.-smoothstep(.05,.68,bed62.g));',`float edge62=1.-smoothstep(.015,.16,${d.poolRadius.toFixed(3)}-length(basinDelta124));`);
  s.fragmentShader=s.fragmentShader.replace('diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.15,.25,.29),vec3(.65,.8,.75),day62),foam62);',`vec2 impactNormal124=vec2(0.);float impactFoam124=0.;
   for(int j124=0;j124<${d.outlets};j124++){
    float a=${d.angle}+float(j124)*${(TAU/d.outlets).toFixed(9)};
    vec2 delta=basinDelta124-vec2(cos(a),sin(a))*${d.impact};
    float r=length(delta),phase=a*2.3,t=fountainTime124;
    float grain=noise62(delta*32.+vec2(t*1.8+phase,-t*1.1));
    float bend=.42*sin(dot(delta,vec2(3.,5.))+phase);
    float waves=sin(31.*r-8.9*t+phase+bend)+.42*sin(46.*r-13.1*t+2.*phase);
    float envelope=exp(-r*3.4)*smoothstep(.025,.10,r)*(1.-smoothstep(.60,.84,r));
    float resolved=1.-smoothstep(.035,.10,fwidth(r));
    impactNormal124+=delta/max(.025,r)*waves*envelope*resolved*.34*fountainFlow124;
    float bubbles=exp(-dot(delta,delta)*145.)*(.21+.41*grain);
    impactFoam124+=bubbles*fountainFlow124;
   }
   foam62=impactFoam124;
   diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.12,.20,.24),vec3(.54,.73,.72),day62),foam62);`);
  // Reflections, direct light and the lit surface share the same contact waves.
  s.fragmentShader=s.fragmentShader.replace('normal=normalize(normal+mat3(viewMatrix)*fineN62*.65);',`
   float ambient124=.195*fountainFlow124;
   waveX62=waveX62*ambient124+impactNormal124.x;
   waveZ62=waveZ62*ambient124+impactNormal124.y;
   normal=normalize(normal+mat3(viewMatrix)*vec3(waveX62,0.,waveZ62));`);
  s.fragmentShader=s.fragmentShader.replace('#include <tonemapping_fragment>',`
   vec2 lightSide124=normalize(sun62.xz+.36*view62.xz+vec2(.001));
   float face124=dot(impactNormal124,lightSide124);
   gl_FragColor.rgb*=1.+min(0.,face124)*.46;
   gl_FragColor.rgb+=mix(sky62,key62,day62*.50)*(max(0.,face124)*.18+impactFoam124*.14);
   #include <tonemapping_fragment>`);
 };m.customProgramCacheKey=()=>key+'-fountain-contact-waves';m.needsUpdate=true;
 installFountainStreams124(f);
 f.installed=true;f.stats={family:'Valenne',sharedRiverTextures:true,liveReflection:true,streams:d.outlets,droplets:f.drops.count,impactRipples:d.outlets,time:0};world.userData.fountainWater124=f.stats;
 updateFountain124(0);
}

function installFountainStreams124(f){
 const d=brookFountainDesign221;
 // Continue along the brass nozzle's exit tangent before gravity bends the stream.
 const mouth=V3(...d.mouth,0),outward=mouth.clone().sub(V3(...d.lip,0));
 const landing=V3(d.impact,d.waterY-.012,0);
 const middle=mouth.clone().addScaledVector(outward,(landing.x-mouth.x)/(2*outward.x));
 const curve=new THREE.QuadraticBezierCurve3(mouth,middle,landing);
 const segments=44,ring=11,radius=.070,geo=new THREE.TubeGeometry(curve,segments,radius,ring-1,false),centers=[];
 for(let i=0;i<=segments;i++){const p=curve.getPointAt(i/segments);for(let j=0;j<ring;j++)centers.push(p.x,p.y,p.z);}
 geo.setAttribute('jetCenter',new THREE.Float32BufferAttribute(centers,3));
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,clipping:true,uniforms:{
  time:f.time,flow:f.flow,jetPixels:{value:1},day:waterLight62.day,skyTint:waterLight62.sky,keyTint:waterLight62.key,
  sunDirection:waterLight62.sun,sunPower:waterLight62.power,cloud:waterLight62.cloud,waterArt:{value:textures.riverSurface18}
 },vertexShader:`
 #include <clipping_planes_pars_vertex>
 attribute vec3 jetCenter;uniform float time,jetPixels;varying vec3 worldPoint,worldNormal;varying vec2 streamUV;varying float phase,smallJet;
 void main(){
  phase=instanceMatrix[0].z*5.+instanceMatrix[0].x*2.3;
  float run=uv.x;float advect=run*21.-time*13.+phase;
  float pulse=mix(1.,.71,run)*(1.+run*(.058*sin(advect)+.029*sin(advect*1.8+uv.y*6.283)));
  mat4 jetMatrix=modelMatrix*instanceMatrix;
  vec4 viewCenter=viewMatrix*jetMatrix*vec4(jetCenter,1.);
  float projectedDiameter=jetPixels*projectionMatrix[1][1]/max(.01,-viewCenter.z);
  // Keep small and low-resolution views from dropping subpixel streams.
  float coverage=clamp(1.45/max(.01,projectedDiameter),1.,1.65);
  smallJet=1.-smoothstep(1.05,3.,projectedDiameter);
  vec3 p=jetCenter+(position-jetCenter)*pulse*coverage;
  p.z+=.005*sin(advect)*sin(run*3.14159);
  vec4 w=jetMatrix*vec4(p,1.);worldPoint=w.xyz;
  worldNormal=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);streamUV=uv;
  vec4 mvPosition=viewMatrix*w;
  gl_Position=projectionMatrix*mvPosition;
  #include <clipping_planes_vertex>
 }`,fragmentShader:`
 #include <clipping_planes_pars_fragment>
 uniform float time,flow,day,sunPower,cloud;uniform vec3 skyTint,keyTint,sunDirection;uniform sampler2D waterArt;
 varying vec3 worldPoint,worldNormal;varying vec2 streamUV;varying float phase,smallJet;
 void main(){
  #include <clipping_planes_fragment>
  vec3 v=normalize(cameraPosition-worldPoint),n=normalize(worldNormal);
  float run=streamUV.x,around=streamUV.y*6.2831853;
  float twist=.56*sin(run*13.-time*6.+phase)+.23*sin(run*27.-time*10.);
  float thread=cos(around*3.+twist);
  vec3 tangent=cross(vec3(0.,1.,0.),n);
  n=normalize(n+tangent*(.061*sin(around*3.+twist)+.026*sin(around*5.-twist)));
  float facing=clamp(dot(n,v),0.,1.);
  float rim=pow(1.-facing,2.4);
  float speed=streamUV.x*2.7-time*1.8+phase;
  float striae=texture2D(waterArt,vec2(speed,streamUV.y*.21+phase)).g;
  float bands=sin(speed*37.+striae*6.)*.5+.5;
  vec3 h=normalize(v+normalize(sunDirection));
  float glint=pow(max(0.,dot(n,h)),39.)*min(1.2,sunPower)*(1.-cloud*.62);
  float crest=pow(clamp(bands*(.59+striae*.93),0.,1.),2.7);
  vec3 body=mix(vec3(.045,.105,.12)*(.45+.55*day),skyTint*.59,.18+rim*.50);
  vec3 light=skyTint*(rim*(.22+crest*.35)+.19*smoothstep(.58,.99,thread)*(.42+.58*crest))+keyTint*glint*.78*(.41+.59*day);
  // The thin sky reflection helps at gameplay scale without whitening the close-up.
  float filament=smallJet*smoothstep(.52,.96,facing)*(.47+crest*.53);
  light+=skyTint*filament*.25;
  float edge=1.-smoothstep(.984,1.,streamUV.x);
  float opacity=.12+.08*day+rim*.38+crest*.12+.10*smoothstep(.25,1.,thread)+glint*.22+filament*.18;
  gl_FragColor=vec4(body+light,flow*edge*opacity);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
 }`});
 f.streams=new THREE.InstancedMesh(geo,material,d.outlets);f.streams.name='Curved recirculating fountain jets';
 const bufferSize=new THREE.Vector2();
 f.streams.onBeforeRender=r=>{
  material.uniforms.jetPixels.value=radius*(r.getRenderTarget()?.viewport.w??r.getDrawingBufferSize(bufferSize).y);
 };
 const transform=new THREE.Matrix4();for(let i=0;i<d.outlets;i++)f.streams.setMatrixAt(i,transform.makeRotationY(-d.angle-i*TAU/d.outlets));
 f.streams.instanceMatrix.needsUpdate=true;f.streams.computeBoundingSphere();
 f.streams.userData.dynamicWater=true;f.streams.userData.dynamicFX=true;f.basin.add(f.streams);

 const splashMaterial=new THREE.MeshPhysicalMaterial({color:'#a8c6c6',roughness:.17,metalness:0,clearcoat:.65,envMap:surface67.outdoor,envMapIntensity:.48,transparent:true,opacity:.52,depthWrite:false});
 f.drops=new THREE.InstancedMesh(new THREE.SphereGeometry(.020,6,4),splashMaterial,d.outlets*8);
 f.drops.name='Fountain contact spray';f.drops.userData.dynamicWater=true;f.drops.userData.dynamicFX=true;
 f.drops.frustumCulled=false;f.drops.instanceMatrix.setUsage(THREE.DynamicDrawUsage);f.basin.add(f.drops);
 f.spray={transform,position:V3(),scale:V3(),rotation:new THREE.Quaternion()};
}
const fountainBuildBefore124=buildWorld;
buildWorld=function(...args){const r=fountainBuildBefore124(...args);installFountain124();return r;};
function updateFountain124(dt){
 const f=world?.userData.fountain123;if(!f?.installed||activeScene.key!=='brookstead')return;
 const on=brookFountainRunning221();
 f.flow.value=on?(dt>0?mix(f.flow.value,1,1-Math.exp(-dt*3)):1):0;
 f.time.value+=Math.max(0,dt)*f.flow.value;
 f.streams.visible=f.drops.visible=on;
 if(on){
  const {transform,position,scale,rotation}=f.spray;
  const d=brookFountainDesign221,perOutlet=f.drops.count/d.outlets;
  for(let i=0;i<f.drops.count;i++){
   const a=d.angle+Math.floor(i/perOutlet)*TAU/d.outlets,j=i%perOutlet;
   const t=(f.time.value*(1.53+.13*j)+i*.382)%1,spread=i*2.39996;
   const fan=j/(perOutlet-1),size=Math.sin(t*Math.PI)**.55*(.46+.50*fan)*f.flow.value;
   position.set(Math.cos(a)*d.impact+Math.cos(spread)*t*(.09+fan*.12),d.waterY+.003+4*t*(1-t)*(.037+fan*.085),Math.sin(a)*d.impact+Math.sin(spread)*t*(.09+fan*.12));
   scale.set(size,size*(1.+.65*Math.abs(2*t-1)),size);transform.compose(position,rotation,scale);f.drops.setMatrixAt(i,transform);
  }
  f.drops.instanceMatrix.needsUpdate=true;
 }
 f.stats.time=f.time.value;f.stats.flow=f.flow.value;
}
const fountainFxBefore124=updateWorldFX;
updateWorldFX=function(dt){fountainFxBefore124(dt);updateFountain124(dt);};
