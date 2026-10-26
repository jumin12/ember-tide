// Water is a physical part of the terrain. Roads never create invisible dry bridges.
waterGround=function(x,z,s=currentScene()){
 if(!s.river)return false;const b=world?.userData.bridge;
 if(b&&Math.abs(x-b.x)<b.half+.15&&Math.abs(z-b.z)<2.72)return false;
 return Math.abs(x-riverCenter(z,s))<4.65;
};
buildWater=function(s){
 const g=new THREE.PlaneGeometry(12,90,48,180);g.rotateX(-Math.PI/2);const p=g.attributes.position,across=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);across.push(x/6);p.setX(i,x+riverCenter(z,s));}g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(across,1));g.computeVertexNormals();
 const matrix=new THREE.Matrix4(),m=new THREE.MeshStandardMaterial({color:'#235d75',roughness:.19,metalness:0,transparent:true,opacity:.88});
 m.onBeforeCompile=sh=>{
  sh.uniforms.reflectionTex={value:reflectionTarget.texture};sh.uniforms.reflectionMatrix={value:matrix};sh.uniforms.uTime=windUniforms.time;
  sh.vertexShader='uniform mat4 reflectionMatrix;uniform float uTime;attribute float riverAcross;varying vec4 vReflectionCoord;varying vec3 vWaterWorld;varying float vAcross;\n'+sh.vertexShader;
  sh.vertexShader=sh.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
   float gx=.038*.95*cos(position.x*.95+position.z*.43+uTime*.9)+.019*2.3*cos(position.x*2.3-position.z*1.7-uTime*1.2);
   float gz=.038*.43*cos(position.x*.95+position.z*.43+uTime*.9)-.019*1.7*cos(position.x*2.3-position.z*1.7-uTime*1.2);
   objectNormal=normalize(vec3(-gx,1.,-gz));`);
  sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   transformed.y+=.038*sin(position.x*.95+position.z*.43+uTime*.9)+.019*sin(position.x*2.3-position.z*1.7-uTime*1.2);vAcross=riverAcross;`);
  sh.vertexShader=sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWaterWorld=(modelMatrix*vec4(transformed,1.)).xyz;vReflectionCoord=reflectionMatrix*vec4(vWaterWorld,1.);');
  sh.fragmentShader='uniform sampler2D reflectionTex;uniform float uTime;varying vec4 vReflectionCoord;varying vec3 vWaterWorld;varying float vAcross;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float rippleX=.028*cos(vWaterWorld.x*5.1+vWaterWorld.z*2.9-uTime*1.8)+.016*cos(vWaterWorld.x*11.3-vWaterWorld.z*4.7+uTime*1.1);
   float rippleZ=.025*cos(vWaterWorld.x*2.1-vWaterWorld.z*6.7+uTime*1.4);
   normal=normalize(mat3(viewMatrix)*vec3(-rippleX,1.,-rippleZ));`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>',`
   vec2 ruv=vReflectionCoord.xy/vReflectionCoord.w;
   ruv+=vec2(sin(vWaterWorld.z*2.1+vWaterWorld.x*.7-uTime),cos(vWaterWorld.x*2.6-vWaterWorld.z*.8+uTime*.7))*.0016;
   vec3 reflected=texture2D(reflectionTex,clamp(ruv,.002,.998)).rgb;
   float fresnel=.02+.98*pow(1.-clamp(dot(normalize(normal),normalize(vViewPosition)),0.,1.),5.);
   float shoal=smoothstep(.35,.94,abs(vAcross));
   gl_FragColor.rgb*=mix(vec3(.70,.91,1.12),vec3(.96,1.12,1.10),shoal);
   gl_FragColor.rgb=mix(gl_FragColor.rgb,reflected,.08+fresnel*.76);
   float shore=exp(-pow((abs(vAcross)-.94)*24.,2.))*pow(max(0.,sin(vWaterWorld.z*5.1+uTime*.9)*sin(vWaterWorld.x*3.7-uTime)),3.);
   float riffle=pow(max(0.,sin(vWaterWorld.z*6.7+sin(vWaterWorld.x*1.65+vWaterWorld.z*.53+uTime*.15)*2.-uTime*1.25)),22.);
   riffle*=smoothstep(.25,.85,sin(vWaterWorld.x*4.17+sin(vWaterWorld.z*1.8)*2.3));
   gl_FragColor.rgb+=vec3(.12,.17,.15)*shore+vec3(.035,.045,.041)*riffle;
   #include <tonemapping_fragment>`);
 };
 m.customProgramCacheKey=()=> 'ely-flowing-water-v3';water=mesh(g,m,0,-1.4,0);water.castShadow=false;water.userData.reflMatrix=matrix;
};
updateReflection=function(){
 if(!water?.visible)return;const level=water.position.y;
 reflectionCamera.copy(camera);reflectionCamera.position.y=2*level-camera.position.y;const look=cameraTarget.clone();look.y=2*level-look.y;reflectionCamera.up.set(0,-1,0);reflectionCamera.lookAt(look);reflectionCamera.updateMatrixWorld();
 const bias=new THREE.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);water.userData.reflMatrix.copy(bias).multiply(reflectionCamera.projectionMatrix).multiply(reflectionCamera.matrixWorldInverse);
 const oldClip=renderer.clippingPlanes,oldTarget=renderer.getRenderTarget(),auto=renderer.shadowMap.autoUpdate,needs=sun.shadow.needsUpdate,depths=cutawayUniforms.depths.value.slice(),fades=(world.userData.cutaways??[]).map(o=>o.fade.value);
 renderer.shadowMap.autoUpdate=false;sun.shadow.needsUpdate=false;cutawayUniforms.depths.value.fill(0);for(const o of world.userData.cutaways??[])o.fade.value=0;renderer.clippingPlanes=[new THREE.Plane(V3(0,1,0),-level-.015)];water.visible=false;for(const o of world.userData.cutaways??[])if(o.group.userData.plantsHidden)setBuildingPlantsHidden(o.group,false);
 renderer.setRenderTarget(reflectionTarget);renderer.render(scene,reflectionCamera);
 water.visible=true;for(const o of world.userData.cutaways??[])if(o.group.userData.plantsHidden)setBuildingPlantsHidden(o.group,true);renderer.clippingPlanes=oldClip;renderer.shadowMap.autoUpdate=auto;sun.shadow.needsUpdate=needs;cutawayUniforms.depths.value.set(depths);(world.userData.cutaways??[]).forEach((o,i)=>o.fade.value=fades[i]);renderer.setRenderTarget(oldTarget);
};
