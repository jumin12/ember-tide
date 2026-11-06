// Depth, contact, lens and airborne detail complete the authored POI light.
// All effects use the scene depth or world coordinates; the HUD stays sharp.
const poiAir55={mist:{value:0},colour:{value:new THREE.Color()},ground:{value:0},power:{value:0},scale:{value:1},lens:{value:1},frames:0};
const poiAirPostBefore55=setupPost;
setupPost=function(...args){
 const result=poiAirPostBefore55(...args),m=post.material;
 Object.assign(m.uniforms,{poiProjection55:{value:camera.projectionMatrixInverse},poiCamera55:{value:camera.matrixWorld},poiMist55:poiAir55.mist,poiMistColour55:poiAir55.colour,poiGround55:poiAir55.ground,landscapeScale56:poiAir55.scale,landscapeLens56:poiAir55.lens});
 m.fragmentShader='uniform mat4 poiProjection55,poiCamera55;uniform float poiMist55,poiGround55,landscapeScale56,landscapeLens56;uniform vec3 poiMistColour55;\n'+m.fragmentShader;
 const depthFunctions=`
 vec3 poiView55(vec2 uv){float raw=texture2D(depthTex,uv).r;vec4 p=poiProjection55*vec4(uv*2.-1.,raw*2.-1.,1.);return p.xyz/p.w;}
 float poiNoise55(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec4 h=fract(sin(vec4(dot(i,vec2(127.1,311.7)),dot(i+vec2(1.,0.),vec2(127.1,311.7)),dot(i+vec2(0.,1.),vec2(127.1,311.7)),dot(i+1.,vec2(127.1,311.7))))*43758.5453);return mix(mix(h.x,h.y,f.x),mix(h.z,h.w,f.x),f.y);}
 `;
 m.fragmentShader=m.fragmentShader.replace('void main(){vec3 col=',depthFunctions+'void main(){vec3 col=');
 const depthLook=`
 vec3 centre55=poiView55(vUv),cross69=cross(dFdx(centre55),dFdy(centre55)),normal55=cross69/max(length(cross69),.000001);if(dot(normal55,-centre55)<0.)normal55=-normal55;
 float airSurface69=1.-smoothstep(.45,.82,abs((mat3(poiCamera55)*normal55).y));
 if(poiGrade54>.5&&d<150.*landscapeScale56){
  float occlusion55=0.;vec2 radius55=vec2(clamp(650.*landscapeScale56/max(d,1.),3.,28.))/resolution;
  for(int j=0;j<8;j++){float angle55=float(j)*2.399963;vec2 uv55=clamp(vUv+vec2(cos(angle55),sin(angle55))*radius55*(.55+.45*mod(float(j),2.)),vec2(.001),vec2(.999));vec3 delta55=poiView55(uv55)-centre55;float distance55=length(delta55),dist55=distance55/landscapeScale56;occlusion55+=max(0.,dot(normal55,delta55/max(distance55,.0001))-.12)*(1.-smoothstep(.25,1.4,dist55));}
  col*=1.-clamp(occlusion55*.38,0.,.34);
  vec3 world55=(poiCamera55*vec4(centre55,1.)).xyz;float low55=1.-smoothstep(.7,4.8,(world55.y-poiGround55)/landscapeScale56);float behind55=smoothstep(focus+5.*landscapeScale56,focus+60.*landscapeScale56,d);float noise55=poiNoise55(world55.xz*.075/landscapeScale56+vec2(time*.006,-time*.003));float veil55=poiMist55*behind55*mix(.35,1.,low55)*(.4+.6*noise55);
  col=mix(col,poiMistColour55,veil55*airSurface69);
 }
 `;
 m.fragmentShader=m.fragmentShader.replace('vec4 haze35=',depthLook+'vec4 haze35=')
  .replace('texture2D(air35,vUv)*airMix35','texture2D(air35,vUv)*airMix35*airSurface69')
  .replace('*.25*airMix35;','*.25*airMix35*airSurface69;')
  .replace('nearBlur=1.-smoothstep(focus-13.,focus-7.5,d)','nearBlur=1.-smoothstep(focus-mix(13.,8.*landscapeScale56,poiGrade54),focus-mix(7.5,3.5*landscapeScale56,poiGrade54),d)')
  .replace('farBlur=smoothstep(focus+18.,focus+75.,d)*.38','farBlur=smoothstep(focus+mix(18.,13.*landscapeScale56,poiGrade54),focus+mix(75.,52.*landscapeScale56,poiGrade54),d)*mix(.38,.62*landscapeLens56,poiGrade54)')
  .replace('vec2(4.6*coc*pixelRatio33)','vec2(mix(4.6,8.4,poiGrade54)*coc*pixelRatio33)');
 m.needsUpdate=true;
 const bloom=cinema22.bloom?.filter;if(bloom){bloom.uniforms.poiGrade54=poiLight54.enabled;bloom.fragmentShader='uniform float poiGrade54;\n'+bloom.fragmentShader.replace('peak-.48','peak-mix(.48,.75,poiGrade54)').replace('peak-.92','peak-mix(.92,1.25,poiGrade54)');bloom.needsUpdate=true;}
 const air=air35.scene?.children[0];if(air){const before=air.onBeforeRender;air.onBeforeRender=function(...a){before.apply(this,a);if(usesPoiLight54()){air35.material.uniforms.density.value*=.90;air35.material.uniforms.power.value*=.88;}};}
 return result;
};
const poiAirLightBefore55=updateLighting;
updateLighting=function(...args){const result=poiAirLightBefore55(...args);if(!usesLandscapeLight54()||!player){poiAir55.scale.value=poiAir55.lens.value=1;return result;}poiAir55.scale.value=activeScene.kind==='overworld'?3:1;poiAir55.lens.value=activeScene.kind==='overworld'?.50:1;const h=(state.worldMinutes/60%24+24)%24,morning=1-smooth(.1,2.2,Math.abs(h-6.6)),rain=weather.rain.value;
 poiAir55.mist.value=(.025+morning*.052+poiLight54.night.value*.025+rain*.05)*(activeScene.key==='snow'?.75:1);poiAir55.colour.value.copy(hemi.color).lerp(sun.color,poiLight54.warm.value*.20).multiplyScalar(.72);poiAir55.ground.value=heightAt(player.x,player.z);poiAir55.power.value=sun.intensity;return result;
};
const poiLeafBefore55=forestMaterial30;
forestMaterial30=function(trunk){const m=poiLeafBefore55(trunk);if(trunk||m.userData.poiLeaf55)return m;m.userData.poiLeaf55=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);Object.assign(sh.uniforms,{poiLeaf55:poiLight54.enabled,poiSun55:weather.sun,poiKey55:lighting34.colour,poiPower55:poiAir55.power});sh.fragmentShader='uniform float poiLeaf55,poiPower55;uniform vec3 poiSun55,poiKey55;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',`float leafView55=pow(max(0.,dot(normalize(vViewPosition),-normalize((viewMatrix*vec4(poiSun55,0.)).xyz))),5.);float leafRim55=pow(1.-abs(dot(normal,normalize(vViewPosition))),2.);outgoingLight+=diffuseColor.rgb*poiKey55*poiPower55*poiLeaf55*(leafView55*.006+leafRim55*.008);\n#include <opaque_fragment>`);};m.customProgramCacheKey=()=>key+'-poi-thin-leaf55';return m;};
const poiAirBuildBefore55=buildWorld;
buildWorld=function(...args){const result=poiAirBuildBefore55(...args);if(!['poi','overworld'].includes(activeScene?.kind))return result;
 const dust=world.userData.dust22?.mesh?.material;if(dust){dust.vertexShader=dust.vertexShader.replace('clamp(size*38./max(8.,-mv.z),1.2,4.8)','clamp(size*54./max(8.,-mv.z),1.4,5.6)');dust.fragmentShader=dust.fragmentShader.replace('core*.42+halo*.08','core*.57+halo*.10');if(activeScene.kind==='overworld')dust.fragmentShader=dust.fragmentShader.replace('smoothstep(42.,68.,fog22)','smoothstep(126.,204.,fog22)');dust.needsUpdate=true;}
 world.userData[activeScene.kind==='overworld'?'overworldAtmosphere56':'poiAtmosphere55']={depthContact:true,layeredMist:true,thinFoliage:true};return result;
};
const poiAirCameraBefore55=updateCamera;
updateCamera=function(...args){const result=poiAirCameraBefore55(...args);if(!usesPoiLight54()||battle||restoration||state.mode!=='explore'||camera.aspect<1)return result;camera.position.sub(cameraTarget).multiplyScalar(1.10).add(cameraTarget);camera.lookAt(cameraTarget);camera.updateMatrixWorld();const p=V3(player.x,heightAt(player.x,player.z)+1.1,player.z).applyMatrix4(camera.matrixWorldInverse);post.material.uniforms.focus.value=-p.z;return result;};
const poiAirRenderBefore55=render;
render=function(...args){if(usesLandscapeLight54()&&player){poiAir55.ground.value=heightAt(player.x,player.z);poiAir55.frames++;}return poiAirRenderBefore55(...args);};
