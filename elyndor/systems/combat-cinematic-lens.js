// A photographic lens with separable Gaussian defocus. The fighters' depth
// interval stays in focus and DOM UI never enters an image-processing target.
const combatLens123={override:null,edgeOverride:null};
const cinematicPostBefore123=makeArenaPost89;
makeArenaPost89=function(){
 const p=cinematicPostBefore123();if(p.uniforms.cinematicLens123)return p;
 p.uniforms.cinematicLens123={value:1};p.uniforms.edgeVignette123={value:1};
 p.uniforms.gaussianImage132={value:null};
 let shader='uniform sampler2D gaussianImage132;uniform float cinematicLens123,edgeVignette123;\n'+p.material.fragmentShader;
 shader=shader.replace('farFocus*.8*displayScale97','farFocus*mix(.8,5.0,cinematicLens123)*displayScale97');
 shader=shader.replace('mix(mix(.68,.24,phoneSharp92),.22,farFocus)','mix(mix(.68,.24,phoneSharp92),mix(.22,.94,cinematicLens123),farFocus)');
 shader=shader.replace('coc*mix(.68,.22,farFocus)','coc*mix(.68,mix(.22,.94,cinematicLens123),farFocus)');
 // Keep the original halo/AO taps, but remove their sparse blur stencil. A
 // continuous horizontal+vertical Gaussian prevents repeated image outlines.
 shader=shader.replace(/for\(int i=0;i<8;i\+\+\)\{[\s\S]*?blur\+=mix\(base,texture2D\(image,sampleUV\)\.rgb,accept\)\*\.1;/,`for(int i=0;i<8;i++){
  float a=float(i)*2.399963;vec2 direction=vec2(cos(a),sin(a));
 `);
 shader=shader.replace('col=mix(col,blur,','col=mix(col,texture2D(gaussianImage132,v).rgb,');
 shader=shader.replace('col*=1.-edge*.12;',`float lensEdge123=smoothstep(.26,.73,length((v-.5)*vec2(1.,.92)));
 col*=1.-mix(edge*.12,lensEdge123*mix(.34,.28,night)*(1.-edgeVignette123),cinematicLens123);`);
 // Shade after the display transform so bright daylight cannot wash the edge
 // falloff away. Keep a wide clear center and soften night shading slightly.
 shader=shader.replace('#include <colorspace_fragment>',`#include <colorspace_fragment>
 float vignette123=smoothstep(.18,.68,length((v-.5)*vec2(1.04,.96)));
 gl_FragColor.rgb*=1.-vignette123*mix(.60,.51,night)*cinematicLens123*edgeVignette123;`);
 p.material.fragmentShader=shader;p.material.userData.gaussian132=true;p.material.needsUpdate=true;return p;
};
function gaussianArena132(p,w,h){
 if(!p.gaussian132){
  const type=p.target.texture.type,targets=[0,1].map(()=>new THREE.WebGLRenderTarget(1,1,{type,depthBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter}));
  const material=new THREE.ShaderMaterial({depthTest:false,depthWrite:false,toneMapped:false,uniforms:{source:{value:null},depth132:{value:p.target.depthTexture},axis:{value:new THREE.Vector2()},clip132:p.uniforms.clip,sharp132:p.uniforms.sharp},vertexShader:'varying vec2 uv132;void main(){uv132=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`
   uniform sampler2D source,depth132;uniform vec2 axis,clip132,sharp132;varying vec2 uv132;
   float distance132(vec2 p){float z=texture2D(depth132,p).r*2.-1.;return 2.*clip132.x*clip132.y/(clip132.y+clip132.x-z*(clip132.y-clip132.x));}
   vec3 sample132(vec2 uv,float d,vec3 centre){uv=clamp(uv,vec2(.001),vec2(.999));float sd=distance132(uv);return d>sharp132.y&&sd<sharp132.y?centre:texture2D(source,uv).rgb;}
   void main(){float d=distance132(uv132);vec3 centre=texture2D(source,uv132).rgb;
    vec3 c=centre*.2270270270;
    c+=(sample132(uv132+axis*1.3846153846,d,centre)+sample132(uv132-axis*1.3846153846,d,centre))*.3162162162;
    c+=(sample132(uv132+axis*3.2307692308,d,centre)+sample132(uv132-axis*3.2307692308,d,centre))*.0702702703;
    gl_FragColor=vec4(c,1.);
   }`});
  const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,0,1),quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),material);quad.frustumCulled=false;scene.add(quad);p.gaussian132={targets,material,scene,camera};
 }
 const q=p.gaussian132,ratio=Math.min(2.5,renderer.getPixelRatio()),ww=Math.max(1,w>>1),hh=Math.max(1,h>>1),u=q.material.uniforms;
 for(const t of q.targets)if(t.width!==ww||t.height!==hh)t.setSize(ww,hh);
 u.source.value=p.target.texture;u.axis.value.set(1.6*ratio/w,0);renderer.setRenderTarget(q.targets[0]);renderer.render(q.scene,q.camera);
 u.source.value=q.targets[0].texture;u.axis.value.set(0,1.6*ratio/h);renderer.setRenderTarget(q.targets[1]);renderer.render(q.scene,q.camera);
 p.uniforms.gaussianImage132.value=q.targets[1].texture;
}
const cinematicRenderBefore123=renderArena89;
renderArena89=function(...args){
 const p=makeArenaPost89();p.uniforms.cinematicLens123.value=combatLens123.override??1;
 p.uniforms.edgeVignette123.value=combatLens123.edgeOverride??1;
 return cinematicRenderBefore123(...args);
};
