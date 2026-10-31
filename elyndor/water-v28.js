// Layered, downstream surface normals break up reflected silhouettes. The
// reflection still updates on the first visible frame and follows pool height.
function refineWater28(o){
 const m=o?.material;if(!m?.userData.water20||m.userData.water28)return;
 m.userData.water28=true;m.color.set('#34706f');m.roughness=.26;m.opacity=.91;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=sh=>{
  before(sh);
  if(activeScene.key!=='brookstead')sh.uniforms.flow20={value:.55};
  sh.uniforms.fall28={value:textures.fall28};sh.uniforms.day28=cinema22.day;
  sh.fragmentShader='uniform sampler2D fall28;uniform float day28;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('normal=normalize(normal+mat3(viewMatrix)*vec3(-dx20*.055,0.,-dz20*.055));',`
   vec2 fine28=stream20*vec2(2.4,1.3)+vec2(time20*.047,0.);
   float fx28=noiseWater20(fine28+vec2(.10,0.))-noiseWater20(fine28-vec2(.10,0.));
   float fz28=noiseWater20(fine28+vec2(0.,.10))-noiseWater20(fine28-vec2(0.,.10));
   dx20=dx20*.62+fx28*.38;dz20=dz20*.62+fz28*.38;
   normal=normalize(normal+mat3(viewMatrix)*vec3(-dx20*1.35,0.,-dz20*1.35));`);
  sh.fragmentShader=sh.fragmentShader.replace(/diffuseColor.rgb\*=mix\(vec3\(\.88,1\.,1\.02\),art20\*1\.(?:65|55),\.(?:22|43)\);/,`
   float deep28=smoothstep(.10,2.8,depth20);
   vec3 body28=mix(vec3(.78,1.14,1.02),vec3(.36,.73,.78),deep28);
   float shade28=dot(art20,vec3(.21,.56,.23));
   diffuseColor.rgb*=body28*mix(.92,1.08,shade28);
   float fallFace28=1.-abs(normalize(cross(dFdx(worldWater20),dFdy(worldWater20))).y);
   vec2 fallUV28=vec2(worldWater20.x*.22,worldWater20.y*.30+time20*.24);
   vec3 fallArt28=texture2D(fall28,fallUV28).rgb;
   if(cascade20>0.)diffuseColor.rgb=mix(diffuseColor.rgb,fallArt28,fallFace28*.93);`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nif(cascade20>0.)roughnessFactor=.68;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(cascade20>0.)totalEmissiveRadiance+=fallArt28*fallFace28*day28*.09;');
  sh.fragmentShader=sh.fragmentShader.replace('vec2(dx20,dz20)*.001','vec2(dx20,dz20)*.014');
  sh.fragmentShader=sh.fragmentShader.replace('valid20*(.045+fresnel20*.14)','valid20*(.10+fresnel20*.32)*(cascade20>0.?.04:1.)');
  sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>',`
   float crest28=pow(max(0.,noiseWater20(stream20*vec2(3.8,1.5))-.51)*2.05,4.);
   float shore28=1.-smoothstep(.04,.30,depth20);
   gl_FragColor.rgb+=vec3(.31,.48,.45)*(crest28*.38+shore28*.10)*(.24+flow20*.76);
   #include <tonemapping_fragment>`);
 };
 m.customProgramCacheKey=()=>key+'-depth-ripple-v28';m.needsUpdate=true;
}
function cascadeMist28(){
 if(activeScene.key!=='brookstead')return;
 const n=120,g=new THREE.BufferGeometry(),p=new Float32Array(n*3),s=new Float32Array(n*3);
 for(let i=0;i<n;i++){const z=[70,80,98][i%3],r=seeded(2800+i),x=brookChannel(z)+(r()-.5)*brookWidth(z)*1.65;p.set([x,channelLevel18(z+1)+.2,z+.7],i*3);s.set([r(),r(),r()],i*3);}
 g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('mistSeed28',new THREE.BufferAttribute(s,3));
 const m=new THREE.ShaderMaterial({transparent:true,depthTest:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:weather.time,flow:sluice18.flow,day:cinema22.day},vertexShader:`attribute vec3 mistSeed28;uniform float time,flow;varying float a28;void main(){float age=fract(time*(.14+mistSeed28.y*.1)+mistSeed28.x);vec3 p=position;p.x+=sin(mistSeed28.z*37.)*age*.6;p.y+=sin(age*3.14159)*(.3+mistSeed28.y*.75);p.z+=age*.6;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp((8.+mistSeed28.z*9.)*32./max(5.,-mv.z),2.,19.);a28=sin(age*3.14159)*flow*.075;}`,fragmentShader:`uniform float day;varying float a28;void main(){vec2 p=gl_PointCoord-.5;float a=exp(-dot(p,p)*17.)*a28;if(a<.003)discard;gl_FragColor=vec4(mix(vec3(.15,.25,.36),vec3(.77,.95,1.05),day),a);}`});
 const o=new THREE.Points(g,m);o.userData.dynamicFX=true;o.userData.waterMist28=true;o.frustumCulled=false;world.add(o);world.userData.mist28=o;
}
const waterBuildBefore28=buildWorld;
buildWorld=function(...args){
 const r=waterBuildBefore28(...args);
 for(const o of[water,...world.userData.waterPools??[],...world.userData.brookFallObjects??[]]){
  if(o?.material?.userData.riverReflection&&!o.material.userData.water20){
   const n=o.geometry.attributes.position.count;
   if(!o.geometry.attributes.waterDepth18){const depth=new Float32Array(n);depth.fill(4);o.geometry.setAttribute('waterDepth18',new THREE.BufferAttribute(depth,1));}
   if(!o.geometry.attributes.riverAcross)o.geometry.setAttribute('riverAcross',new THREE.BufferAttribute(new Float32Array(n),1));
   waterSurface20(o);for(const k of['weatherV12','cloud21','wet17','wetPolicy25','cloudScale26'])o.material.userData[k]=false;addCloudLighting(o.material);
  }refineWater28(o);
 }
 const seen=new Set();world.traverse(o=>{
  const m=o.material;if(!o.userData.dynamicWater||!m?.isMeshStandardMaterial||seen.has(m)||m.userData.water20)return;seen.add(m);
  const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.roughness=.23;m.metalness=0;
  m.onBeforeCompile=sh=>{before(sh);if(!sh.fragmentShader.includes('streamWorld'))return;sh.fragmentShader=sh.fragmentShader.replace('diffuseColor.rgb+=ripple*.018;','');sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float gx28=sin(streamWorld.x*2.1+sin(streamWorld.z*.9-riverTime*.7))*.045+sin(streamWorld.x*4.7-streamWorld.z*2.3+riverTime)*.018;
   float gz28=cos(streamWorld.z*3.3+sin(streamWorld.x*1.4)-riverTime*.8)*.042;normal=normalize(normal+mat3(viewMatrix)*vec3(gx28,0.,gz28));`);};m.customProgramCacheKey=()=>key+'-stream-ripples28';m.needsUpdate=true;
 });
 cascadeMist28();return r;
};
