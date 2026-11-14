// Filter fractional sprite scales without adding a screen pattern or changing
// any authored pixels. Keep pixel interiors crisp when the camera is close;
// use ordinary linear minification when a sprite occupies less than a texel.
const characterSampling149={materials:new WeakSet()};
function prepareCharacterSampling149(a){
 const o=a?.mesh,m=o?.material;if(!m?.map||characterSampling149.materials.has(m))return;characterSampling149.materials.add(m);
 const size={value:new THREE.Vector2(1,1)},before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.actorTexels149=size;
  s.fragmentShader=`uniform vec2 actorTexels149;
  vec2 actorUv149(vec2 uv){
   vec2 pixel=uv*actorTexels149-.5,footprint=max(fwidth(pixel),vec2(.0001));
   vec2 interior=clamp((fract(pixel)-.5)/footprint+.5,0.,1.);
   vec2 sharp=(floor(pixel)+interior+.5)/actorTexels149;
   float small=smoothstep(.65,1.,max(footprint.x,footprint.y));return mix(sharp,uv,small);
  }\n`+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',THREE.ShaderChunk.map_fragment.replaceAll('vMapUv','actorUv149(vMapUv)'));
  s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',THREE.ShaderChunk.emissivemap_fragment.replaceAll('vEmissiveMapUv','actorUv149(vEmissiveMapUv)'));
 };m.customProgramCacheKey=()=>key()+'-fractional-sprite-sampling149';m.needsUpdate=true;
 const prior=o.onBeforeRender;o.onBeforeRender=function(...args){prior?.apply(this,args);const t=m.map,im=t?.image;if(im)size.value.set(im.width??1,im.height??1);
  for(const tex of new Set([t,m.emissiveMap].filter(Boolean)))if(tex.magFilter!==THREE.LinearFilter||tex.minFilter!==THREE.LinearFilter){tex.magFilter=tex.minFilter=THREE.LinearFilter;tex.needsUpdate=true;}
 };o.userData.characterSampling149=true;
}
const characterCreateBefore149=createActor;
createActor=function(...args){const a=characterCreateBefore149(...args);prepareCharacterSampling149(a);return a;};
const characterReplaceBefore149=replaceActorArt;
replaceActorArt=function(a,...args){const r=characterReplaceBefore149(a,...args);prepareCharacterSampling149(a);return r;};
