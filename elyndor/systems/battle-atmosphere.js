// Reconstruct only distant painted scenery. Native character frames and the
// interface retain their own sampling and remain in the camera's sharp plane.
const plateSampling97=`
uniform vec2 plateTexel97;uniform float plateFit97;
vec2 plateUV97(vec2 uv){
 float x=clamp(uv.x,0.,1.)-.5;
 // Fit a wider panorama into the viewport. The centre retains the source
 // aspect; the peripheral scenery eases continuously into the tree banks.
 uv.x=.5+x/(plateFit97+(1.-plateFit97)*4.*x*x);
 return clamp(uv,vec2(.001),vec2(.999));
}
vec3 samplePlate97(sampler2D picture,vec2 uv){
 vec2 p=clamp(uv,vec2(.001),vec2(.999))/plateTexel97-.5,f=fract(p),i=floor(p),f2=f*f,f3=f2*f;
 vec2 w0=(1.-3.*f+3.*f2-f3)/6.,w1=(4.-6.*f2+3.*f3)/6.;
 vec2 w2=(1.+3.*f+3.*f2-3.*f3)/6.,w3=f3/6.,g0=w0+w1,g1=w2+w3;
 vec2 a=(i-.5+w1/g0)*plateTexel97,b=(i+1.5+w3/g1)*plateTexel97;
 vec3 lo=mix(texture2D(picture,vec2(a.x,a.y)).rgb,texture2D(picture,vec2(b.x,a.y)).rgb,g1.x);
 vec3 hi=mix(texture2D(picture,vec2(a.x,b.y)).rgb,texture2D(picture,vec2(b.x,b.y)).rgb,g1.x);
 return mix(lo,hi,g1.y);
}
`;
const landscapeAtmosphereBefore97=makeHybridLandscape90;
makeHybridLandscape90=function(b){
 landscapeAtmosphereBefore97(b);const m=b.landscape90.material,im=b.plate90.image;
 b.plateTexel97={value:new THREE.Vector2(1/im.width,1/im.height)};
 b.plateFit97={value:innerHeight>innerWidth&&innerWidth<760?.96:.64};
 m.uniforms.plateTexel97=b.plateTexel97;m.uniforms.plateFit97=b.plateFit97;m.fragmentShader=plateSampling97+m.fragmentShader;
 m.fragmentShader=m.fragmentShader.replace('vec2 uv=clamp(v,vec2(.001),vec2(.999));','vec2 uv=plateUV97(v);');
 m.fragmentShader=m.fragmentShader.replaceAll('texture2D(map,uv).rgb','samplePlate97(map,uv)');
 m.userData.hd97={native:[im.width,im.height],reconstruction:'cubic B-spline',sharedGroundSampling:true,centreAspectPreserved:true,centreFit:b.plateFit97.value};m.needsUpdate=true;
 // The ray-marched sky uses stable samples. Per-pixel random start offsets
 // previously appeared as grain over the paintings, especially on phones.
 if(b.clouds89){const cloud=b.clouds89.material;cloud.fragmentShader=cloud.fragmentShader.replace('start+stepSize*(.15+.7*fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9898,78.233)))*43758.5453))','start+stepSize*.5');cloud.needsUpdate=true;}
};
const blendGroundBefore97=blendHybridGround90;
blendHybridGround90=function(b){
 blendGroundBefore97(b);const m=b.group.children.find(o=>o.name==='Actual level ground and carved water banks').material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.plateTexel97=b.plateTexel97;s.uniforms.plateFit97=b.plateFit97;s.fragmentShader=plateSampling97+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('texture2D(hybridPlate90,uv90).rgb','samplePlate97(hybridPlate90,plateUV97(uv90))');};
 m.customProgramCacheKey=()=>key()+'-smooth-plate97';
};
function bindStageAir97(m,b){
 if(!m?.isMeshStandardMaterial||m.userData.stageAir97)return;m.userData.stageAir97=true;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.fog=false;
 m.onBeforeCompile=function(s,...a){
  before.call(this,s,...a);Object.assign(s.uniforms,b.airUniforms97);
  s.vertexShader='varying vec3 stageWorld97;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <worldpos_vertex>',`#include <worldpos_vertex>
   vec4 world97=vec4(transformed,1.);
   #ifdef USE_INSTANCING
    world97=instanceMatrix*world97;
   #endif
   stageWorld97=(modelMatrix*world97).xyz;`);
  s.fragmentShader='varying vec3 stageWorld97;uniform vec3 airOrigin97,airColour97;uniform vec2 airBand97;uniform float airPower97;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`float behind97=1.-smoothstep(airBand97.x,airBand97.y,stageWorld97.z-airOrigin97.z);
   float lifted97=smoothstep(.35,3.5,stageWorld97.y-airOrigin97.y);
   float air97=behind97*lifted97*airPower97;
   outgoingLight=mix(outgoingLight,airColour97,air97);
   #include <opaque_fragment>`);
 };
 m.customProgramCacheKey=()=>key()+'-height-air97';m.needsUpdate=true;
}
const stageAtmosphereBefore97=buildStageScenery59;
buildStageScenery59=function(...args){
 const result=stageAtmosphereBefore97(...args),b=arena88.current;if(!b?.hybridKey90||b.airUniforms97)return result;
 const back=fightingHollow93(b).back,sky=b.palette90.sky.clone(),key=STAGECRAFT94[encounter53.selected];
 // Match the air to this painting's sky. Raised middle-distance objects
 // recede into it; the fighting floor and its contact shadows stay clear.
 sky.lerp(new THREE.Color(b.night?'#809aaf':key?.sky??'#b6ced2'),.32);
 b.airUniforms97={airOrigin97:{value:b.group.position},airColour97:{value:sky},airBand97:{value:new THREE.Vector2(back-65,back-9)},airPower97:{value:b.spec.cave?.08:b.night?.10:.14}};
 b.group.traverse(o=>{for(const m of Array.isArray(o.material)?o.material:[o.material])bindStageAir97(m,b);});
 if(key){hemi.color.lerp(new THREE.Color(key.sky),.22);const front=b.group.children.find(o=>o.isDirectionalLight&&o!==sun);if(front)front.color.lerp(sun.color,.20);}
 makeRegionalAir97(b);
 if(stageDepth59.summary)stageDepth59.summary.atmosphere97={sourceReconstruction:true,centreAspectPreserved:true,heightAir:true,stableClouds:true,effects:b.effects97.summary};
 return result;
};
const postAtmosphereBefore97=makeArenaPost89;
makeArenaPost89=function(){
 const p=postAtmosphereBefore97();if(p.uniforms.displayScale97)return p;
 p.uniforms.displayScale97={value:1};p.material.fragmentShader='uniform float displayScale97;\n'+p.material.fragmentShader;
 p.material.fragmentShader=p.material.fragmentShader.replace('(farFocus*2.7+nearFocus*5.)*quality','(farFocus*2.0*displayScale97+nearFocus*5.)*quality');
 p.material.fragmentShader=p.material.fragmentShader.replace('col=mix(col,blur,coc*.68);','col=mix(col,blur,coc*mix(.68,.58,farFocus));');
 p.material.fragmentShader=p.material.fragmentShader.replace('col=mix(col,blur,coc*mix(.68,.24,phoneSharp92));','col=mix(col,blur,coc*mix(mix(.68,.24,phoneSharp92),.58,farFocus));');
 p.material.needsUpdate=true;return p;
};
const renderAtmosphereBefore97=renderArena89;
renderArena89=function(...args){const p=makeArenaPost89();p.uniforms.displayScale97.value=Math.min(2.5,renderer.getPixelRatio());const b=arena88.current;if(b?.effects97)for(const q of b.effects97.crystals)q.light.intensity=q.power*(.96+.04*Math.sin(clock*.65+q.phase));return renderAtmosphereBefore97(...args);};

// These emitters live in the scene, behind its action lane. They never tint
// the whole screen or turn the ground/contact shadows into a fog overlay.
function paintedPoint97(b,u,v){
 let lo=0,hi=1;const fit=b.plateFit97.value;for(let i=0;i<16;i++){const t=(lo+hi)/2,x=t-.5,w=.5+x/(fit+(1-fit)*4*x*x);if(w<u)lo=t;else hi=t;}
 const x=((lo+hi)/2-.5)/b.crop90.x+.5,y=b.window90.x+v*b.window90.y,ref=b.reference90,ray=V3(x*2-1,y*2-1,.5).unproject(ref).sub(ref.position).normalize();
 return ref.position.clone().addScaledVector(ray,(b.group.position.z-102-ref.position.z)/ray.z).sub(b.group.position);
}
function makeRegionalAir97(b){
 const s=b.spec,rows=[],summary={mist:0,spray:0,seaHaze:0,coldDrift:0,crystalHaze:0,chimneySmoke:0,lightShafts:0},back=fightingHollow93(b).back;
 const add=(p,w,h,alpha,kind=0)=>rows.push({p,w,h,alpha,kind,seed:rows.length*.173});
 const painted=(u,v,w,h,alpha)=>add(paintedPoint97(b,u,v),w,h,alpha);
 if(s.falls||battleArtStage99()?.spray){for(const[u,v]of(battleArtStage99()?.spray??[[.51,.49],[.65,.48],[.58,.51]]))painted(u,v,13,4,.075);summary.spray=3;}
 if(s.sea){painted(.30,.50,23,3,.038);painted(.72,.46,24,3,.031);summary.seaHaze=2;}
 if(s.snow){for(const x of[-14,15])add(V3(x,arenaFloor88(b,x,back-28)+4.5,back-28),22,3,.037);summary.coldDrift=2;}
 else if(s.cave){for(const x of[-18,18])add(V3(x,arenaFloor88(b,x,back-18)+3,back-18),7,4,.045,2);summary.crystalHaze=2;}
 else if(s.trees||s.river){for(const x of[-17,17])add(V3(x,arenaFloor88(b,x,back-27)+4.5,back-27),20,3.8,s.dense?.036:.024);summary.mist=2;}
 b.group.updateMatrixWorld(true);
 for(const house of b.group.children.filter(o=>o.name==='Native POI exterior architecture'||o.userData.chimney101)){
  if(house.userData.chimney101){const p=house.localToWorld(house.userData.chimney101.clone());b.group.worldToLocal(p);for(let i=0;i<4;i++)add(p.clone(),.65,1.15,.11,1);summary.chimneySmoke++;continue;}
  const f=house.userData.footprint,a=house.userData.architecture31;if(!a||!f||!Number.isFinite(f.w)||!Number.isFinite(f.d))continue;
  // Reuse the authored chimney opening from architecture31. Its masonry is
  // merged with the roof, so individual-mesh bounds cannot locate the stack.
  const h=house.userData.kind==='inn'?6.1:house.userData.kind==='mill'?3.5:5.5,x=-f.w*.31,z=-f.d*.24,base=h+f.w*.31*(1-Math.abs(x)/(f.w/2));
  const p=house.localToWorld(V3(x,base+2.34,z));b.group.worldToLocal(p);
  for(let i=0;i<4;i++)add(p.clone(),.65,1.15,.11,1);summary.chimneySmoke++;
 }
 const direction=sun.position.clone().sub(sun.target.position).normalize();let i=0;
 for(const o of b.group.children.filter(o=>o.name==='Canopy-filtered light shaft')){
  const x=[-18,3,19][i++],z=Math.min(-24,back-14)-(i%2)*5,to=V3(x,arenaFloor88(b,x,z)+3.5,z),from=to.clone().addScaledVector(direction,17);
  o.position.copy(from).add(to).multiplyScalar(.5);o.quaternion.setFromUnitVectors(V3(0,1,0),direction);o.scale.set(.75,17,.75);o.material.uniforms.color.value.copy(sun.color);o.material.uniforms.power.value=b.night?.005:s.dense?.034:.019;summary.lightShafts++;
 }
 const crystals=s.cave?b.group.children.filter(o=>o.isPointLight).map((light,i)=>({light,power:light.intensity,phase:i*1.7})):[];
 b.effects97={summary,crystals,emitters:rows.map(q=>({root:q.p.toArray(),kind:q.kind,width:q.w,height:q.h}))};if(!rows.length)return;
 const base=new THREE.PlaneGeometry(1,1),g=geometry59(new THREE.InstancedBufferGeometry().copy(base));base.dispose();g.instanceCount=rows.length;
 g.setAttribute('airRoot97',new THREE.InstancedBufferAttribute(new Float32Array(rows.flatMap(q=>q.p.toArray())),3));g.setAttribute('airShape97',new THREE.InstancedBufferAttribute(new Float32Array(rows.flatMap(q=>[q.w,q.h,q.alpha,q.kind])),4));g.setAttribute('airSeed97',new THREE.InstancedBufferAttribute(new Float32Array(rows.map(q=>q.seed)),1));
 const tint=b.night?new THREE.Color('#779ab2'):b.palette90.sky.clone().lerp(sun.color,.24),m=material59(new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,uniforms:{time:stageDepth59.time,tint:{value:tint}},vertexShader:`
 attribute vec3 airRoot97;attribute vec4 airShape97;attribute float airSeed97;uniform float time;varying vec2 airUV97;varying float airAlpha97,airKind97,airLife97,airPhase97;
 void main(){airUV97=uv;airKind97=airShape97.w;airPhase97=airSeed97;float smoke=step(.5,airKind97)*(1.-step(1.5,airKind97)),age=fract(time*.085+airSeed97);airLife97=age;
 vec3 p=airRoot97;p.x+=mix(sin(time*.17+airSeed97*27.)*.5,age*1.7,smoke);p.y+=mix(sin(time*.21+airSeed97*13.)*.14,age*5.5,smoke);p.z+=smoke*age*.5;
 vec4 view=modelViewMatrix*vec4(p,1.);view.xy+=position.xy*airShape97.xy*mix(1.,.55+age*1.55,smoke);airAlpha97=airShape97.z*mix(1.,smoothstep(0.,.12,age)*(1.-smoothstep(.55,1.,age)),smoke);gl_Position=projectionMatrix*view;}`,fragmentShader:`
 uniform float time;uniform vec3 tint;varying vec2 airUV97;varying float airAlpha97,airKind97,airLife97,airPhase97;
 float hash97(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise97(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash97(i),hash97(i+vec2(1,0)),f.x),mix(hash97(i+vec2(0,1)),hash97(i+vec2(1)),f.x),f.y);}
 void main(){vec2 uv=airUV97,q=uv*2.-1.,drift=vec2(time*.07,time*-.045)+airPhase97*11.;float n=noise97(uv*vec2(4.,3.)+drift)*.62+noise97(uv*vec2(9.,6.)-drift*.7)*.38;
 float edge=smoothstep(0.,.15,uv.x)*(1.-smoothstep(.82,1.,uv.x))*smoothstep(0.,.17,uv.y)*(1.-smoothstep(.78,1.,uv.y));float a=edge*smoothstep(.20,.78,n)*airAlpha97;
 vec3 colour=airKind97>1.5?vec3(.12,.39,.52):airKind97>.5?mix(tint,vec3(.27,.28,.29),.45):tint;
 if(a<.001)discard;gl_FragColor=vec4(colour,a);}` }));
 const cloud=new THREE.Mesh(g,m);cloud.name='Regional airborne mist, spray and chimney smoke';cloud.frustumCulled=false;cloud.renderOrder=2;b.group.add(cloud);
}
