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
    float ring124=cos(d124*26.-fountainTime124*9.)*exp(-d124*3.1)*smoothstep(.02,.09,d124);
    impactNormal124+=delta124/max(.02,d124)*ring124*.12*fountainFlow124;
    impactFoam124+=exp(-d124*d124*100.)*(.08+.04*sin(fountainTime124*12.+a124))*fountainFlow124;}
   foam62+=impactFoam124;diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.15,.25,.29),vec3(.65,.8,.75),day62),clamp(foam62,0.,.65));`);
  s.fragmentShader=s.fragmentShader.replace('normal=normalize(normal+mat3(viewMatrix)*fineN62*.65);','normal=normalize(normal+mat3(viewMatrix)*(fineN62*.65+vec3(impactNormal124.x,0.,impactNormal124.y)));');
 };m.customProgramCacheKey=()=>key+'-fountain-circulation124';m.needsUpdate=true;
 // Replace the old stationary, cloth-textured tubes with moving water.
 const prior=new Set();f.basin.traverse(o=>{if(o.userData.dynamicWater)prior.add(o);});prior.delete(pool);for(const o of prior){o.removeFromParent();o.geometry?.dispose();}
 world.userData.supplyJets=(world.userData.supplyJets??[]).filter(o=>!prior.has(o));f.curves=[];f.jets=[];
 const jetMaterial=new THREE.MeshPhysicalMaterial({map:textures.riverSurface18,normalMap:envPbr103.maps.get('waveHeight103:normalRough'),normalScale:new THREE.Vector2(.10,.10),color:'#9fc7cd',roughness:.16,metalness:0,transparent:true,opacity:.78,envMap:surface67.outdoor,envMapIntensity:.55,clearcoat:.6});
 jetMaterial.onBeforeCompile=s=>{s.uniforms.fountainTime124=f.time;s.fragmentShader='uniform float fountainTime124;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`vec2 jetUv124=vec2(vMapUv.x*2.-fountainTime124*1.3,vMapUv.y);vec3 jetArt124=texture2D(map,jetUv124).rgb;
 diffuseColor.rgb*=mix(vec3(.66,.82,.88),jetArt124*1.5,.25);diffuseColor.rgb+=vec3(.07,.11,.12)*pow(.5+.5*sin(vMapUv.x*52.-fountainTime124*18.),8.);`);};jetMaterial.customProgramCacheKey=()=> 'fountain-moving-stream124';
 for(let i=0;i<8;i++){const a=i/8*TAU,curve=new THREE.QuadraticBezierCurve3(V3(Math.cos(a)*.48,2.71,Math.sin(a)*.48),V3(Math.cos(a)*1.1,2.1,Math.sin(a)*1.1),V3(Math.cos(a)*1.8,.65,Math.sin(a)*1.8));f.curves.push(curve);
  const jet=new THREE.Mesh(new THREE.TubeGeometry(curve,36,.033,8,false),jetMaterial);jet.name='Flowing fountain stream';jet.castShadow=false;jet.userData.dynamicWater=true;f.basin.add(jet);f.jets.push(jet);world.userData.supplyJets.push(jet);}
 f.drops=new THREE.InstancedMesh(new THREE.SphereGeometry(.033,6,4),jetMaterial,32);f.drops.name='Falling fountain droplets';f.drops.userData.dynamicWater=true;f.drops.castShadow=false;f.drops.frustumCulled=false;f.basin.add(f.drops);
 f.installed=true;f.stats={family:'Valenne',sharedRiverTextures:true,liveReflection:true,streams:8,droplets:32,impactRipples:8,time:0};world.userData.fountainWater124=f.stats;
 updateFountain124(0);
}
const fountainBuildBefore124=buildWorld;
buildWorld=function(...args){const r=fountainBuildBefore124(...args);installFountain124();return r;};
function updateFountain124(dt){
 const f=world?.userData.fountain123;if(!f?.installed||activeScene.key!=='brookstead')return;
 const on=state.flags.pump_repaired===true;f.flow.value=mix(f.flow.value,on?1:0,1-Math.exp(-Math.max(0,dt)*3));f.time.value+=Math.max(0,dt)*(.10+f.flow.value*.90);
 const matrix=new THREE.Matrix4(),scale=V3(1,1.55,1),rot=new THREE.Quaternion();f.jets.forEach(j=>j.visible=on);f.drops.visible=on;
 for(let i=0;i<32;i++){const t=(f.time.value*.68+(i%4)/4+(i>>2)*.13)%1,p=f.curves[i>>2].getPoint(t);matrix.compose(p,rot,scale);f.drops.setMatrixAt(i,matrix);}f.drops.instanceMatrix.needsUpdate=true;f.stats.time=f.time.value;f.stats.flow=f.flow.value;
}
const fountainFxBefore124=updateWorldFX;
updateWorldFX=function(dt){fountainFxBefore124(dt);updateFountain124(dt);};
