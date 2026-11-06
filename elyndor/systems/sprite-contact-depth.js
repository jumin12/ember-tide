// A camera-facing quad visually leans into a counter even when its feet are
// outside it. Use the depth of an upright physical actor, leaving clip XY,
// texture sampling, animation, shadows and the authored silhouette unchanged.
const actorDepth68={enabled:{value:0},up:{value:1},materials:new WeakSet()};
function physicalSpriteDepth68(m){
 if(!m||actorDepth68.materials.has(m))return;actorDepth68.materials.add(m);
 const before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);
 m.onBeforeCompile=function(sh,...args){before.call(this,sh,...args);sh.uniforms.actorDepth68=actorDepth68.enabled;sh.uniforms.actorUp68=actorDepth68.up;sh.vertexShader='uniform float actorDepth68,actorUp68;\n'+sh.vertexShader;sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
 if(actorDepth68>.5){
  vec3 actorFoot68=modelMatrix[3].xyz;
  vec3 actorPhysical68=actorFoot68+modelMatrix[0].xyz*transformed.x+vec3(0.,transformed.y*length(modelMatrix[1].xyz)/max(.2,actorUp68),0.);
  vec4 actorClip68=projectionMatrix*viewMatrix*vec4(actorPhysical68,1.);
  gl_Position.z=actorClip68.z/actorClip68.w*gl_Position.w;
 }`);};
 m.customProgramCacheKey=()=>key()+'-upright-contact68';m.needsUpdate=true;
}
function prepareActorDepth68(a){
 if(!a?.mesh||a.mesh.userData.physicalDepth68)return;a.mesh.userData.physicalDepth68=true;
 physicalSpriteDepth68(a.mesh.material);const before=a.mesh.onBeforeRender;
 a.mesh.onBeforeRender=function(r,s,c,...args){before?.call(this,r,s,c,...args);actorDepth68.enabled.value=c===camera&&!battle?1:0;actorDepth68.up.value=Math.abs(c.matrixWorld.elements[5]);};
}
const actorContactBefore68=createActor;
createActor=function(...args){const a=actorContactBefore68(...args);prepareActorDepth68(a);return a;};
const silhouetteBefore68=syncSilhouette63;
syncSilhouette63=function(...args){const r=silhouetteBefore68(...args);if(visibility63.mesh&&!visibility63.mesh.userData.physicalDepth68){const o=visibility63.mesh;o.userData.physicalDepth68=true;physicalSpriteDepth68(o.material);const before=o.onBeforeRender;o.onBeforeRender=function(r,s,c,...args){before?.call(this,r,s,c,...args);actorDepth68.enabled.value=c===camera&&!battle?1:0;actorDepth68.up.value=Math.abs(c.matrixWorld.elements[5]);};}return r;};
