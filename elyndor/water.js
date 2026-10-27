const brookHydraulics={flow:{value:.025},time:{value:0},light:{value:1}};
// Water is a physical part of the terrain. Roads never create invisible dry bridges.
waterGround=function(x,z,s=currentScene()){
 if(!s.river)return false;const b=world?.userData.bridge;
 if(b&&Math.abs(x-b.x)<b.half+.15&&Math.abs(z-b.z)<2.72)return false;
 return Math.abs(x-riverCenter(z,s))<4.65;
};
buildWater=function(s){
 const g=new THREE.PlaneGeometry(12,90,48,180);g.rotateX(-Math.PI/2);const p=g.attributes.position,across=[];
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);across.push(x/6);p.setX(i,x+riverCenter(z,s));}g.setAttribute('riverAcross',new THREE.Float32BufferAttribute(across,1));g.computeVertexNormals();
 const matrix=new THREE.Matrix4(),m=new THREE.MeshStandardMaterial({color:'#235d75',roughness:.19,metalness:0,transparent:true,opacity:.88,side:THREE.DoubleSide});
 m.userData.riverReflection={matrix,texture:reflectionTarget.texture,upperMatrix:matrix,upperTexture:reflectionTarget.texture,cascade:0};
 m.onBeforeCompile=sh=>{
  const reflection=m.userData.riverReflection;sh.uniforms.reflectionTex={value:reflection.texture};sh.uniforms.reflectionMatrix={value:reflection.matrix};sh.uniforms.upperReflectionTex={value:reflection.upperTexture};sh.uniforms.upperReflectionMatrix={value:reflection.upperMatrix};sh.uniforms.cascadeCenter={value:reflection.cascade};sh.uniforms.uTime=windUniforms.time;sh.uniforms.uBrookFlow=brookHydraulics.flow;sh.uniforms.uBrookTime=brookHydraulics.time;
  sh.vertexShader='uniform mat4 reflectionMatrix,upperReflectionMatrix;uniform float uTime,uBrookFlow,uBrookTime;float brookControl(vec2 p){float x=-163.-3.*sin(clamp((p.y-30.)/70.,0.,1.)*3.14159265)+30.*smoothstep(92.,122.,p.y)+7.*smoothstep(140.,180.,p.y);return (1.-smoothstep(5.6,9.,abs(p.x-x)))*smoothstep(69.3,71.,p.y)*(1.-smoothstep(150.,185.,p.y));}\nattribute float riverAcross;varying vec4 vReflectionCoord,vUpperReflectionCoord;varying vec3 vWaterWorld;varying float vAcross;\n'+sh.vertexShader;
  sh.vertexShader=sh.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
   vec3 surfaceWorld=(modelMatrix*vec4(position,1.)).xyz;float flowZ=surfaceWorld.z-surfaceWorld.y*1.15;
   float controlled=brookControl(surfaceWorld.xz),localWaterTime=mix(uTime,uBrookTime,controlled),localWaterGain=mix(1.,.25+uBrookFlow*.75,controlled);
   float gx=.038*.95*cos(surfaceWorld.x*.95+flowZ*.43+localWaterTime*.9)+.019*2.3*cos(surfaceWorld.x*2.3-flowZ*1.7-localWaterTime*1.2);
   float gz=.038*.43*cos(surfaceWorld.x*.95+flowZ*.43+localWaterTime*.9)-.019*1.7*cos(surfaceWorld.x*2.3-flowZ*1.7-localWaterTime*1.2);
   objectNormal=normalize(objectNormal+vec3(-gx*localWaterGain,0.,-gz*localWaterGain));`);
  sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   transformed+=normal*(.038*sin(surfaceWorld.x*.95+flowZ*.43+localWaterTime*.9)+.019*sin(surfaceWorld.x*2.3-flowZ*1.7-localWaterTime*1.2))*localWaterGain;vAcross=riverAcross;`);
  sh.vertexShader=sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWaterWorld=(modelMatrix*vec4(transformed,1.)).xyz;vReflectionCoord=reflectionMatrix*vec4(vWaterWorld,1.);vUpperReflectionCoord=upperReflectionMatrix*vec4(vWaterWorld,1.);');
  sh.fragmentShader='uniform sampler2D reflectionTex,upperReflectionTex;uniform float cascadeCenter;uniform float uTime,uBrookFlow,uBrookTime;float brookControl(vec2 p){float x=-163.-3.*sin(clamp((p.y-30.)/70.,0.,1.)*3.14159265)+30.*smoothstep(92.,122.,p.y)+7.*smoothstep(140.,180.,p.y);return (1.-smoothstep(5.6,9.,abs(p.x-x)))*smoothstep(69.3,71.,p.y)*(1.-smoothstep(150.,185.,p.y));}\nvarying vec4 vReflectionCoord,vUpperReflectionCoord;varying vec3 vWaterWorld;varying float vAcross;\n'+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   float controlled=brookControl(vWaterWorld.xz),localWaterTime=mix(uTime,uBrookTime,controlled),localWaterGain=mix(1.,.20+uBrookFlow*.8,controlled);
   float rippleX=.028*cos(vWaterWorld.x*5.1+vWaterWorld.z*2.9-localWaterTime*1.8)+.016*cos(vWaterWorld.x*11.3-vWaterWorld.z*4.7+localWaterTime*1.1);
   float rippleZ=.025*cos(vWaterWorld.x*2.1-vWaterWorld.z*6.7+localWaterTime*1.4);
   normal=normalize(normal+mat3(viewMatrix)*vec3(-rippleX*localWaterGain,0.,-rippleZ*localWaterGain));`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>',`
   vec2 ruv=vReflectionCoord.xy/vReflectionCoord.w;
   vec2 reflectionRipple=vec2(sin(vWaterWorld.z*2.1+vWaterWorld.x*.7-localWaterTime),cos(vWaterWorld.x*2.6-vWaterWorld.z*.8+localWaterTime*.7))*.0016*localWaterGain;ruv+=reflectionRipple;
   vec3 reflected=texture2D(reflectionTex,clamp(ruv,.002,.998)).rgb;
   if(cascadeCenter>0.){vec2 upperUV=vUpperReflectionCoord.xy/vUpperReflectionCoord.w+reflectionRipple;vec3 upper=texture2D(upperReflectionTex,clamp(upperUV,.002,.998)).rgb;reflected=mix(upper,reflected,smoothstep(cascadeCenter-.8,cascadeCenter+.8,vWaterWorld.z));}
   float fresnel=.02+.98*pow(1.-clamp(dot(normalize(normal),normalize(vViewPosition)),0.,1.),5.);
   float shoal=smoothstep(.35,.94,abs(vAcross));
   gl_FragColor.rgb*=mix(vec3(.70,.91,1.12),vec3(.96,1.12,1.10),shoal);
   gl_FragColor.rgb=mix(gl_FragColor.rgb,reflected,.08+fresnel*.76);
   float shore=exp(-pow((abs(vAcross)-.94)*24.,2.))*pow(max(0.,sin(vWaterWorld.z*5.1+localWaterTime*.9)*sin(vWaterWorld.x*3.7-localWaterTime)),3.);
   float riffle=pow(max(0.,sin(vWaterWorld.z*6.7+sin(vWaterWorld.x*1.65+vWaterWorld.z*.53+localWaterTime*.15)*2.-localWaterTime*1.25)),22.);
   riffle*=smoothstep(.25,.85,sin(vWaterWorld.x*4.17+sin(vWaterWorld.z*1.8)*2.3));
   float cascadeZone=(1.-smoothstep(.45,1.35,abs(vWaterWorld.z-80.)))+(1.-smoothstep(.45,1.35,abs(vWaterWorld.z-98.)));
   float froth=pow(max(0.,sin(vWaterWorld.x*7.3+vWaterWorld.z*9.-localWaterTime*2.2)*sin(vWaterWorld.x*3.7-localWaterTime)),3.);
   gl_FragColor.rgb+=vec3(.12,.17,.15)*shore+vec3(.14,.21,.22)*froth*cascadeZone*controlled*localWaterGain+vec3(.035,.045,.041)*riffle*localWaterGain;
   #include <tonemapping_fragment>`);
 };
 m.customProgramCacheKey=()=> 'ely-continuous-water-v10';water=mesh(g,m,0,-1.4,0);water.castShadow=false;water.userData.reflMatrix=matrix;
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
