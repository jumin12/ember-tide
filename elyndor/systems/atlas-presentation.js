// One depth-aware lens for the retained, playable continent. UI markers remain
// DOM elements, so focus, bloom and atmospheric perspective never blur text.
const atlasLens119={target:null,blur:[],scene:null,camera:null,quad:null,passes:0,resizes:0};
// The legacy atlas warmup runs midway through loadAssets, before the native
// environment maps exist. Its retained trees acquired fallback canvas textures
// and its terrain missed the final PBR pass. The normal, final continent warmup
// already builds this world once all assets are ready; retain that version.
const atlasBuildBefore119=buildWorld;
buildWorld=function(...args){if(loading36.mapPreparation&&!envPbr103.ready)return;return atlasBuildBefore119(...args);};
// Retire the older low-detail atlas shader warmup too. The completed retained
// continent prepares its native programs under the same startup loading screen.
atlasWarmed16=true;
const lensVertex119='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
// A separable continuous kernel avoids the repeated leaf outlines and grid
// patterns produced by a widely spaced screen-space sample stencil.
function worldGaussian132(holder,source,depth,w,h,focus,nearFar,scale=1){
 let q=holder.gaussian132;
 if(!q){
  const type=source.type,targets=[0,1].map(()=>new THREE.WebGLRenderTarget(1,1,{type,depthBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}));
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,vertexShader:lensVertex119,uniforms:{source:{value:null},depth:{value:depth},axis:{value:new THREE.Vector2()},nearFar:{value:new THREE.Vector2()},focus:{value:focus}},fragmentShader:`
   uniform sampler2D source,depth;uniform vec2 axis,nearFar;uniform float focus;varying vec2 vUv;
   float depth132(vec2 uv){float z=texture2D(depth,uv).r*2.-1.;return 2.*nearFar.x*nearFar.y/(nearFar.y+nearFar.x-z*(nearFar.y-nearFar.x));}
   vec3 sample132(vec2 uv,float d,vec3 centre){uv=clamp(uv,vec2(.001),vec2(.999));float sd=depth132(uv);float accept=1.-smoothstep(max(6.,focus*.04),max(20.,focus*.14),abs(sd-d));return mix(centre,texture2D(source,uv).rgb,accept);}
   void main(){float d=depth132(vUv);vec3 centre=texture2D(source,vUv).rgb,c=centre*.2270270270;
    c+=(sample132(vUv+axis*1.3846153846,d,centre)+sample132(vUv-axis*1.3846153846,d,centre))*.3162162162;
    c+=(sample132(vUv+axis*3.2307692308,d,centre)+sample132(vUv-axis*3.2307692308,d,centre))*.0702702703;gl_FragColor=vec4(c,1.);
   }`});
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);quad.frustumCulled=false;scene.add(quad);q=holder.gaussian132={targets,material,scene,camera};
 }
 const ww=Math.max(1,w>>1),hh=Math.max(1,h>>1),u=q.material.uniforms;
 for(const t of q.targets)if(t.width!==ww||t.height!==hh)t.setSize(ww,hh);
 u.depth.value=depth;u.nearFar.value.copy(nearFar);u.focus.value=focus;
 u.source.value=source;u.axis.value.set(1.15*scale/w,0);renderer.setRenderTarget(q.targets[0]);renderer.render(q.scene,q.camera);
 u.source.value=q.targets[0].texture;u.axis.value.set(0,1.15*scale/h);renderer.setRenderTarget(q.targets[1]);renderer.render(q.scene,q.camera);
 return q.targets[1].texture;
}
function prepareAtlasLens119(w,h){
 const q=atlasLens119;
 if(!q.target){
  const type=renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType;
  q.target=new THREE.WebGLRenderTarget(w,h,{depthBuffer:true,type});q.target.depthTexture=new THREE.DepthTexture(w,h);
  q.target.texture.name='Atlas linear daylight';
  q.blur=[0,1].map(()=>new THREE.WebGLRenderTarget(Math.max(1,w>>2),Math.max(1,h>>2),{depthBuffer:false,type}));
  q.scene=new THREE.Scene();q.camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);q.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2));q.quad.frustumCulled=false;q.scene.add(q.quad);
  q.blurMaterial=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{source:{value:null},stepSize:{value:new THREE.Vector2()},threshold:{value:1}},vertexShader:lensVertex119,fragmentShader:`uniform sampler2D source;uniform vec2 stepSize;uniform float threshold;varying vec2 vUv;
   vec3 sampleLight(vec2 uv){vec3 c=texture2D(source,clamp(uv,vec2(.001),vec2(.999))).rgb;float l=max(max(c.r,c.g),c.b);return c*mix(1.,smoothstep(.88,1.65,l),threshold);}
   void main(){vec3 c=sampleLight(vUv)*.227027;c+=(sampleLight(vUv+stepSize*1.384615)+sampleLight(vUv-stepSize*1.384615))*.316216;c+=(sampleLight(vUv+stepSize*3.230769)+sampleLight(vUv-stepSize*3.230769))*.070270;gl_FragColor=vec4(c,1.);}`});
  q.composite=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{source:{value:q.target.texture},gaussian132:{value:null},depth:{value:q.target.depthTexture},bloom:{value:q.blur[1].texture},resolution:{value:new THREE.Vector2(w,h)},nearFar:{value:new THREE.Vector2()},focus:{value:160},day:{value:1},rain:{value:0},mistColour:{value:new THREE.Color()},projectionInverse:{value:new THREE.Matrix4()},cameraWorld:{value:new THREE.Matrix4()},time:{value:0}},vertexShader:lensVertex119,fragmentShader:`
   uniform sampler2D source,depth,bloom,gaussian132;uniform vec2 resolution,nearFar;uniform float focus,day,rain,time;uniform vec3 mistColour;uniform mat4 projectionInverse,cameraWorld;varying vec2 vUv;
   float viewDepth(float d){float z=d*2.-1.;return 2.*nearFar.x*nearFar.y/(nearFar.y+nearFar.x-z*(nearFar.y-nearFar.x));}
   float radiusAt(vec2 uv,float d){float farLens=smoothstep(focus*1.08,focus*1.68,d),nearLens=1.-smoothstep(focus*.39,focus*.65,d);float edge=smoothstep(.48,1.04,length((uv-.5)*vec2(1.55,1.7)));return max(farLens*3.4,max(nearLens*1.5,edge*2.0));}
   void main(){
    float raw=texture2D(depth,vUv).r,d=viewDepth(raw),radius=radiusAt(vUv,d);
    vec3 col=mix(texture2D(source,vUv).rgb,texture2D(gaussian132,vUv).rgb,clamp(radius/3.4,0.,.94));
    float behind=smoothstep(focus*1.22,focus*2.65,d);
    vec4 v=projectionInverse*vec4(vUv*2.-1.,raw*2.-1.,1.);v/=v.w;vec3 world=(cameraWorld*v).xyz;
    float cloud=.5+.5*sin(world.x*.029+world.z*.017+time*.024)*sin(world.z*.023-time*.017);
    float veil=behind*(.07+rain*.07)*mix(.72,1.,cloud);
    col=mix(col,mistColour,veil);col+=texture2D(bloom,vUv).rgb*mix(.13,.075,day);
    // Restrained optical falloff rather than a color cast over the terrain.
    col*=1.-smoothstep(.48,.90,length((vUv-.5)*vec2(1.,1.08)))*.045;
    gl_FragColor=vec4(max(vec3(0.),col),1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    float lensEdge132=smoothstep(.24,.72,length((vUv-.5)*vec2(1.04,.96)));gl_FragColor.rgb*=1.-lensEdge132*mix(.36,.29,1.-day);
   }`});
 }
 if(q.target.width!==w||q.target.height!==h){q.target.setSize(w,h);for(const t of q.blur)t.setSize(Math.max(1,w>>2),Math.max(1,h>>2));q.composite.uniforms.resolution.value.set(w,h);q.resizes++;}
 return q;
}
function renderAtlasPresentation119(rect,ratio,c){
 const w=Math.max(1,Math.round(rect.width*ratio)),h=Math.max(1,Math.round(rect.height*ratio)),q=prepareAtlasLens119(w,h),u=q.composite.uniforms;
 const target=renderer.getRenderTarget(),viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),test=renderer.getScissorTest();
 try{
  renderer.setScissorTest(false);renderer.setRenderTarget(q.target);renderer.setViewport(0,0,w,h);renderer.clear();renderer.render(exactAtlas67.scene,c);
  q.quad.material=q.blurMaterial;q.blurMaterial.uniforms.source.value=q.target.texture;q.blurMaterial.uniforms.threshold.value=1;q.blurMaterial.uniforms.stepSize.value.set(2/w,0);
  renderer.setRenderTarget(q.blur[0]);renderer.setViewport(0,0,q.blur[0].width,q.blur[0].height);renderer.render(q.scene,q.camera);
  q.blurMaterial.uniforms.source.value=q.blur[0].texture;q.blurMaterial.uniforms.threshold.value=0;q.blurMaterial.uniforms.stepSize.value.set(0,4/h);
  renderer.setRenderTarget(q.blur[1]);renderer.render(q.scene,q.camera);
  u.nearFar.value.set(c.near,c.far);u.focus.value=Math.max(1,-atlas3d.target.clone().applyMatrix4(c.matrixWorldInverse).z);u.day.value=celestial31.day.value;u.rain.value=weather.rain.value;u.mistColour.value.copy(exactAtlas67.scene.fog.color);u.projectionInverse.value.copy(c.projectionMatrixInverse);u.cameraWorld.value.copy(c.matrixWorld);u.time.value=performance.now()*.001;
  u.gaussian132.value=worldGaussian132(q,q.target.texture,q.target.depthTexture,w,h,u.focus.value,u.nearFar.value,ratio);
  q.quad.material=q.composite;renderer.setRenderTarget(null);renderer.setViewport(rect.x*ratio,(innerHeight-rect.bottom)*ratio,w,h);renderer.setScissor(rect.x*ratio,(innerHeight-rect.bottom)*ratio,w,h);renderer.setScissorTest(true);renderer.clear();renderer.render(q.scene,q.camera);
  const canvas=$('#atlas3d-surface');if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  canvas.getContext('2d').drawImage(renderer.domElement,Math.round(rect.x*ratio),Math.round(rect.y*ratio),w,h,0,0,w,h);q.passes++;
 }finally{renderer.setRenderTarget(target);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(test);}
}

// The travel view uses its existing depth buffer. Blur stays outside the party's
// focal band, uses native pixels and never touches the HTML interface.
const setupLensBefore119=setupPost;
setupPost=function(...args){
 const result=setupLensBefore119(...args),m=post?.material;if(!m||m.uniforms.travelLens119)return result;
 m.uniforms.travelLens119={value:0};m.uniforms.travelGaussian132={value:null};m.fragmentShader='uniform sampler2D travelGaussian132;uniform float travelLens119;\n'+m.fragmentShader;
 m.fragmentShader=m.fragmentShader.replace('// Gameplay remains sharp at every depth;',`if(travelLens119>.5){
  float far119=smoothstep(focus+12.,focus+90.,d),edge119=smoothstep(.48,1.05,length((vUv-.5)*vec2(1.60,1.8)));
  col=mix(col,texture2D(travelGaussian132,vUv).rgb,max(far119*.94,edge119*.70));
 }
 // Gameplay remains sharp at every depth;`);
 m.fragmentShader=m.fragmentShader.replace('#include <colorspace_fragment>','#include <colorspace_fragment>\nif(travelLens119>.5){float edge132=smoothstep(.25,.72,length((vUv-.5)*vec2(1.04,.96)));gl_FragColor.rgb*=1.-edge132*.36;}');m.needsUpdate=true;
 const draw=renderer.render;
 renderer.render=function(s,c){
  if(s===post.scene&&m.uniforms.travelLens119.value>.5){const target=this.getRenderTarget(),viewport=this.getViewport(new THREE.Vector4()),scissor=this.getScissor(new THREE.Vector4()),test=this.getScissorTest();
   try{this.setScissorTest(false);m.uniforms.travelGaussian132.value=worldGaussian132(post,post.target.texture,post.target.depthTexture,post.target.width,post.target.height,m.uniforms.focus.value,m.uniforms.nearFar.value,Math.max(1,m.uniforms.pixelRatio33?.value??1));}
   finally{this.setRenderTarget(target);this.setViewport(viewport);this.setScissor(scissor);this.setScissorTest(test);}
  }return draw.call(this,s,c);
 };return result;
};
const lightLensBefore119=updateLighting;
updateLighting=function(...args){const result=lightLensBefore119(...args);if(post?.material.uniforms.travelLens119)post.material.uniforms.travelLens119.value=activeScene?.kind==='overworld'&&!battle&&!encounter53.active?1:0;return result;};
