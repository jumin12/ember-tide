// One coherent water surface replaces the accumulated sine-band, shoreline
// sparkle and smoke layers. All ripples travel in world space downstream.
function waterSurface20(o){
 if(!o?.material?.userData.riverReflection)return;
 const m=o.material,r=m.userData.riverReflection,j=o.userData.join;
 if(j){const upper=world.userData.waterPools.find(p=>p.userData.waterRole===(j.z===70?'reservoir':j.z===80?'headrace':'millrace')),lower=world.userData.waterPools.find(p=>p.userData.waterRole===(j.z===70?'headrace':j.z===80?'millrace':'lowerBrook'));if(upper&&lower){r.matrix=lower.userData.reflMatrix;r.texture=lower.userData.poolTarget.texture;r.upperMatrix=upper.userData.reflMatrix;r.upperTexture=upper.userData.poolTarget.texture;}}
 m.color.set('#558c88');m.roughness=.32;m.metalness=0;m.opacity=.86;m.depthWrite=true;m.userData.water20=true;
 m.onBeforeCompile=sh=>{
  Object.assign(sh.uniforms,{waterArt20:{value:textures.riverSurface18??textures.waterAlbedo},time20:windUniforms.time,flow20:sluice18.flow,reflectionTex20:{value:o.userData.poolTarget?.texture??r.texture},reflectionMatrix20:{value:r.matrix},upperTex20:{value:r.upperTexture},upperMatrix20:{value:r.upperMatrix},cascade20:{value:j?.z??0},halfSpan20:{value:j?.halfSpan??.8},width20:o.userData.flowWidth17??{value:1}});
  sh.vertexShader=`attribute float waterDepth18,riverAcross;uniform mat4 reflectionMatrix20,upperMatrix20;varying vec3 worldWater20;varying vec4 reflected20,upper20;varying float depth20,across20;\n`+sh.vertexShader;
  sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ndepth20=waterDepth18;across20=riverAcross;');
  sh.vertexShader=sh.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nworldWater20=(modelMatrix*vec4(transformed,1.)).xyz;reflected20=reflectionMatrix20*vec4(worldWater20,1.);upper20=upperMatrix20*vec4(worldWater20,1.);');
  sh.fragmentShader=`uniform sampler2D waterArt20,reflectionTex20,upperTex20;uniform float time20,flow20,cascade20,halfSpan20,width20;varying vec3 worldWater20;varying vec4 reflected20,upper20;varying float depth20,across20;
   float hashWater20(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noiseWater20(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hashWater20(i),hashWater20(i+vec2(1.,0.)),f.x),mix(hashWater20(i+vec2(0.,1.)),hashWater20(i+1.),f.x),f.y);}
   float coverage20(vec4 p){vec2 uv=p.xy/max(.0001,p.w);return step(.001,p.w)*smoothstep(0.,.04,uv.x)*smoothstep(0.,.04,uv.y)*smoothstep(0.,.04,1.-uv.x)*smoothstep(0.,.04,1.-uv.y);}
   \n`+sh.fragmentShader;
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>',`vec2 stream20=worldWater20.xz-vec2(0.,time20*(.12+flow20*.56));vec2 artUV20=stream20*.095;vec3 art20=texture2D(waterArt20,artUV20+vec2(.13,.37)).rgb;vec2 crossed20=mat2(.8,.6,-.6,.8)*artUV20*1.31;art20=mix(art20,texture2D(waterArt20,crossed20+vec2(9.17,3.41)).rgb,.46);diffuseColor.rgb*=mix(vec3(.88,1.,1.02),art20*1.65,.22);`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   vec2 ripple20=stream20*.65;float dx20=noiseWater20(ripple20+vec2(.12,0.))-noiseWater20(ripple20-vec2(.12,0.));float dz20=noiseWater20(ripple20+vec2(0.,.12))-noiseWater20(ripple20-vec2(0.,.12));normal=normalize(normal+mat3(viewMatrix)*vec3(-dx20*.055,0.,-dz20*.055));`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',`if(depth20<.006)discard;diffuseColor.a*=smoothstep(.006,.16,depth20);if(cascade20>0.){diffuseColor.a*=1.-smoothstep(max(0.,width20-.035),width20,abs(across20));if(diffuseColor.a<.002)discard;}\n#include <opaque_fragment>`);
  sh.fragmentShader=sh.fragmentShader.replace('#include <tonemapping_fragment>',`vec2 mirrorUV20=reflected20.xy/max(.0001,reflected20.w)+vec2(dx20,dz20)*.001;vec3 mirror20=texture2D(reflectionTex20,clamp(mirrorUV20,.002,.998)).rgb;float valid20=coverage20(reflected20);if(cascade20>0.){float side20=smoothstep(cascade20-halfSpan20,cascade20+halfSpan20,worldWater20.z);vec2 uv20=upper20.xy/max(.0001,upper20.w);mirror20=mix(texture2D(upperTex20,clamp(uv20,.002,.998)).rgb,mirror20,side20);valid20=mix(coverage20(upper20),valid20,side20);}float fresnel20=pow(1.-clamp(dot(normalize(normal),normalize(vViewPosition)),0.,1.),4.);gl_FragColor.rgb=mix(gl_FragColor.rgb,mirror20,valid20*(.045+fresnel20*.14));if(cascade20>0.){float toe20=smoothstep(cascade20,cascade20+halfSpan20,worldWater20.z);float froth20=smoothstep(.57,.84,noiseWater20(stream20*vec2(3.,1.6)));gl_FragColor.rgb+=vec3(.12,.17,.16)*froth20*toe20*flow20;}\n#include <tonemapping_fragment>`);
 };
 m.customProgramCacheKey=()=> 'elyndor-coherent-water-v20';m.needsUpdate=true;
}
const buildWaterBefore20=buildWorld;buildWorld=function(...args){const r=buildWaterBefore20(...args);if(activeScene?.key==='brookstead'){
 for(const o of[water,...world.userData.waterPools,...world.userData.brookFallObjects])waterSurface20(o);
 for(const o of[...world.children])if(o.isPoints&&o.userData.dynamicWater){o.removeFromParent();o.geometry.dispose();o.material.dispose();}
 const spray=world.userData.releaseSpray18;if(spray){spray.material.dispose();spray.material=new THREE.MeshBasicMaterial({color:'#cce9e2',transparent:true,opacity:.3,depthWrite:false,blending:THREE.AdditiveBlending});}
 world.userData.waterVersion20=true;
 }return r;};
// Water and spray cannot reflect back into themselves. Reflection planes use
// the actual surface level during filling, then restore local mesh transforms.
const reflectBefore20=updateReflection;updateReflection=function(...args){if(activeScene?.key!=='brookstead')return reflectBefore20(...args);const hidden=[world.userData.current19,world.userData.releaseSpray18].filter(Boolean).map(o=>[o,o.visible]),levels=[];for(const[o]of hidden)o.visible=false;for(const p of world.userData.waterPools){const f=p.userData.fill17;if(!f)continue;levels.push([p,p.position.y]);p.position.y=sampleCurrent18(f,(f.start+f.end)/2,riverState17());}try{return reflectBefore20(...args);}finally{for(const[o,v]of hidden)o.visible=v;for(const[p,y]of levels)p.position.y=y;}};
