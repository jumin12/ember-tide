// Native material art with surface-specific PBR response. Matte materials do
// not receive environment reflections; metal, glass and water retain them.
const settlementMaterials66={enabled:{value:1},meshes:0};
const surface67={outdoor:null,indoor:null,wet:{value:0},day:{value:1},mode:{value:-1},prepared:new WeakSet(),byMap:new Map()};
const slot67=key=>terrainTileNames.indexOf(key);
const testSlot67=keys=>keys.filter(k=>slot67(k)>=0).map(k=>'abs(vTile-'+slot67(k).toFixed(1)+')<.4').join('||')||'false';
const surfaceKinds67={get metal(){return testSlot67(['metal','steel86','brass86','copper86'])},get glass(){return testSlot67(['window','ceramic86'])},get cloth(){return testSlot67(['cloth','rug29','canvas86','wool86','rugRoyal86'])},get wood(){return testSlot67(['wood','darkWood','panel29','door','crateFace','barrelStave','bark',...Object.keys(surfaceProps86).filter(k=>surfaceProps86[k].family==='wood')])},get plaster(){return testSlot67(['plaster','plasterA','plasterSage86'])}};
const surfaceLookupBefore67=atlasLookup;
atlasLookup=function(){return surfaceLookupBefore67()+`if(${surfaceKinds67.plaster}){float trowel67=sin(vSurfaceUV.x*2.7+sin(vSurfaceUV.y*3.1))*.014;tileColor.rgb*=1.+trowel67;}`;};
const surfaceAtlasBefore67=staticAtlasMaterial;
staticAtlasMaterial=function(...args){const m=surfaceAtlasBefore67(...args);if(m.userData.pbr67)return m;m.userData.pbr67=true;m.envMap=surface67.outdoor;m.envMapIntensity=.8;
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=s=>{before(s);s.uniforms.surfaceDay67=surface67.day;s.uniforms.surfaceClass86={value:surfaceClasses86()};s.fragmentShader='uniform float surfaceDay67;uniform vec4 surfaceClass86['+terrainTileNames.length+'];\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('tangent28.xy*=.68;',`tangent28.xy*=surfaceClass86[int(floor(vTile+.5))].w;`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
   vec4 class86=surfaceClass86[int(floor(vTile+.5))];float metal67=class86.x,glass67=step(.1,class86.y),cloth67=class86.z;
   float detailR67=texture(detailArray28,vec3(uv28,floor(vTile+.5))).a;
   float rough67=mix(clamp(detailR67,.72,.97),clamp(detailR67,.25,.48),metal67);rough67=mix(rough67,class86.y>.75?.14:.32,glass67);rough67=mix(rough67,.98,cloth67);roughnessFactor=rough67;
  `);
  s.fragmentShader=s.fragmentShader.replace('roughnessFactor=mix(materialRough28,materialRough28*.5,wet28*.65);','roughnessFactor=rough67;');
  s.fragmentShader=s.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=metal67*.88;');
  s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectSpecular*=max(metal67,glass67)*(.40+.60*surfaceDay67);');
 };m.customProgramCacheKey=()=>key+'-surface-pbr67';return m;
};
function surfaceEnvironment67(interior){
 const s=new THREE.Scene(),g=new THREE.SphereGeometry(25,24,12),p=g.attributes.position,colors=[];
 for(let i=0;i<p.count;i++){const y=p.getY(i)/25,c=interior?new THREE.Color().setRGB(.52+y*.15,.45+y*.16,.36+y*.18):new THREE.Color().setRGB(.29+Math.max(0,y)*.74,.36+Math.max(0,y)*.97,.27+Math.max(0,y)*1.35);colors.push(c.r,c.g,c.b);}
 g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));s.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
 const panels=interior?[[-7,5,-3,3.5,4.5,3,3.3,3.5],[6,5,1,2.7,3,1.5,1.7,2],[-3,3,-7,2,1,3.5,1.9,.7],[5,2,-6,2,2,5,2.7,.9]]:[[-10,15,8,5,5,7,5.9,4.6]];
 for(const[x,y,z,w,h,r,green,b]of panels){const m=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});m.color.setRGB(r,green,b);const q=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);q.position.set(x,y,z);q.lookAt(0,2,0);s.add(q);}
 const pm=new THREE.PMREMGenerator(renderer),target=pm.fromScene(s,.03,.1,60);pm.dispose();s.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});target.texture.userData.pinnedMap17=true;return target.texture;
}
function tuneSurface67(m){
 if(!m?.isMeshStandardMaterial||surface67.prepared.has(m))return;surface67.prepared.add(m);if(m.userData.pbr67||m.userData.water62)return;
 const key=m.userData.surface67??m.userData.textureKey??surface67.byMap.get(m.map),metal=['metal','steel86','brass86','copper86'].includes(key)||m.metalness>.5,glass=['window','glass67','lightFacets','ceramic86'].includes(key),matte=!metal&&!glass;
 m.userData.surfaceResponse67=metal?'metal':glass?'glass':'matte';
 if(!matte){m.envMap=activeScene?.kind==='interior'?surface67.indoor:surface67.outdoor;m.envMapIntensity=glass?.55:.85;m.metalness=metal?.88:0;m.roughness=key==='ceramic86'?.32:glass?.15:Math.min(m.roughness,.39);}else{m.envMap=null;m.metalness=0;m.roughness=Math.max(m.roughness,.77);}
 const alias={plasterA:'plaster',wallA:'wall',rockA:'rock',rockB:'rock',cobbleA:'cobbleMoss30',cobbleB:'cobbleMoss30'},normal=textures['normal28_'+key]??textures['normal28_'+(alias[key]??key)];if(normal&&!m.normalMap){m.normalMap=normal;m.normalScale.setScalar(key?.startsWith('plaster')?.20:metal?.18:.40);}
 m.needsUpdate=true;
}
function terrainSurface67(m){if(!m?.isMeshStandardMaterial||m.userData.terrainPBR67)return;m.userData.terrainPBR67=true;m.metalness=0;m.roughness=.9;m.envMap=null;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=s=>{before(s);const macro=s.fragmentShader.includes('terrainWorld'),local=s.fragmentShader.includes('vGroundBlend');if(!macro&&!local)return;s.uniforms.groundDetail67={value:materials28.normalArray};s.fragmentShader='uniform highp sampler2DArray groundDetail67;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
 vec2 groundUv67=${macro?'terrainWorld':'vGround'}.xz*.18;vec3 detailN67=mix(texture(groundDetail67,vec3(groundUv67,${slot67('grass')}.0)).xyz,texture(groundDetail67,vec3(groundUv67,${slot67('earth')}.0)).xyz,${macro?'groundRoad':'vGroundBlend.x'})*2.-1.;${macro?`detailN67=mix(detailN67,texture(groundDetail67,vec3(groundUv67,${slot67('rock')}.0)).xyz*2.-1.,1.-smoothstep(.35,.8,abs(terrainNormal.y)));`:''}detailN67.xy*=.32;
 vec3 dx67=dFdx(-vViewPosition),dy67=dFdy(-vViewPosition);vec2 du67=dFdx(groundUv67),dv67=dFdy(groundUv67);vec3 st67=dx67*dv67.y-dy67*du67.y,tt67=-dx67*dv67.x+dy67*du67.x;float nn67=max(dot(st67,st67),dot(tt67,tt67));if(nn67>.00000001)normal=normalize(mat3(st67*inversesqrt(nn67),tt67*inversesqrt(nn67),normal)*detailN67);
 `)};m.customProgramCacheKey=()=>key+'-ground-pbr67';m.needsUpdate=true;}
const surfaceLoadBefore67=loadAssets;
loadAssets=async function(...args){const r=await surfaceLoadBefore67(...args);for(const key of terrainTileNames){const t=textures[key];if(t){surface67.byMap.set(t,key);t.magFilter=THREE.LinearFilter;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());t.needsUpdate=true;}}if(scenery.surfaceArray){scenery.surfaceArray.magFilter=THREE.LinearFilter;scenery.surfaceArray.anisotropy=8;scenery.surfaceArray.needsUpdate=true;}return r;};
function prepareSurface67(){if(!surface67.outdoor){surface67.outdoor=surfaceEnvironment67(false);surface67.indoor=surfaceEnvironment67(true);}const excluded=new Set(actors.map(a=>a.mesh.material));for(const root of[world,typeof exactAtlas67!=='undefined'?exactAtlas67.scene:null].filter(Boolean))root.traverse(o=>{for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(!excluded.has(m)){if(world.userData.windows66?.includes(o))m.userData.surface67='glass67';tuneSurface67(m)}});for(const m of world.userData.terrainChunks??[])terrainSurface67(m.material);if(typeof exactAtlas67!=='undefined')for(const m of exactAtlas67.terrainMaterials)terrainSurface67(m);if(scenery.staticAtlas&&!scenery.staticAtlas.envMap){scenery.staticAtlas.envMap=surface67.outdoor;scenery.staticAtlas.envMapIntensity=.8;scenery.staticAtlas.needsUpdate=true;}}
const surfaceGraphicsBefore67=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){prepareSurface67();return surfaceGraphicsBefore67(...args);};
const surfaceLightBefore67=updateLighting;
updateLighting=function(...args){const r=surfaceLightBefore67(...args),inside=activeScene?.kind==='interior';surface67.wet.value=inside?0:weather.wet.value;surface67.day.value=inside?.7:Math.max(.18,poiLight54.day.value);const env=inside?surface67.indoor:surface67.outdoor;
 if(env&&surface67.mode.value!==(inside?1:0)){surface67.mode.value=inside?1:0;for(const m of matCache.values())if(m.envMap)m.envMap=env;if(scenery.staticAtlas)scenery.staticAtlas.envMap=env;}return r;
};
