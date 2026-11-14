// A painted traveller needs one coherent patch of canopy lighting. Sampling
// a sharp, moving leaf shadow separately over every animated limb produces
// strobing as the north-facing run changes pose. Keep real scenery shadows,
// average them over the body, and leave combat and circular foot shadows alone.
const travelLighting150={materials:new WeakSet()};
function prepareTravelLighting150(a){
 const o=a?.mesh,m=o?.material;if(!m?.map||travelLighting150.materials.has(m))return;travelLighting150.materials.add(m);
 const enabled={value:0},height={value:1},radius={value:new THREE.Vector2()},before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.travelLighting150=enabled;s.uniforms.travelHeight150=height;s.uniforms.travelRadius150=radius;
  s.vertexShader='uniform float travelLighting150,travelHeight150;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <shadowmap_vertex>',`#include <shadowmap_vertex>
   #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
    if(travelLighting150>.5){vec4 body150=vec4(modelMatrix[3].xyz+vec3(0.,travelHeight150,0.),1.);
     for(int i=0;i<NUM_DIR_LIGHT_SHADOWS;i++){vDirectionalShadowCoord[i]=directionalShadowMatrix[i]*body150;}}
   #endif`);
  const lights=THREE.ShaderChunk.lights_fragment_begin.replace(/getShadow\(\s*directionalShadowMap\[ i \],[^;]*?vDirectionalShadowCoord\[ i \]\s*\)/g,sample=>{
   const tap=(x,y)=>sample.replace('vDirectionalShadowCoord[ i ]',`(vDirectionalShadowCoord[ i ]+vec4(travelRadius150*vec2(${x},${y}),0.,0.))`);
   return `(travelLighting150>.5 ? .20+.80*(${sample}+${tap('1.','0.')}+${tap('-1.','0.')}+${tap('0.','1.')}+${tap('0.','-1.')})*.20 : ${sample})`;
  });
  s.fragmentShader='uniform float travelLighting150;uniform vec2 travelRadius150;\n'+s.fragmentShader.replace('#include <lights_fragment_begin>',lights);
 };m.customProgramCacheKey=()=>key()+'-stable-travel-canopy150';m.needsUpdate=true;
 const prior=o.onBeforeRender;o.onBeforeRender=function(...args){prior?.apply(this,args);enabled.value=a.party&&!battle&&state.mode!=='title'?1:0;height.value=a.size*.60;
  const c=sun.shadow.camera;radius.value.set(.65/Math.max(1,c.right-c.left),.65/Math.max(1,c.top-c.bottom));
 };o.userData.travelLighting150=true;
}
const travelCreateBefore150=createActor;
createActor=function(...args){const a=travelCreateBefore150(...args);prepareTravelLighting150(a);return a;};
const travelReplaceBefore150=replaceActorArt;
replaceActorArt=function(a,...args){const r=travelReplaceBefore150(a,...args);prepareTravelLighting150(a);return r;};
