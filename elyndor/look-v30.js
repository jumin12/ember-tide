// The image's clarity comes from readable material scale and shaped light,
// rather than sharpening noise or washing the world in additive shafts.
const look30={reference:'atmo2',cameraPitch:0,shafts:0};
const materialBefore30=material;
material=function(key,color='#ffffff',options={}){
 const source=materialBefore30(key,color,options);if(activeScene?.kind==='interior'||!['wood','darkWood','bark'].includes(key))return source;
 const id='outdoor-timber30-'+key+color+JSON.stringify(options);if(matCache.has(id))return matCache.get(id);
 const m=source.clone();m.onBeforeCompile=source.onBeforeCompile;m.customProgramCacheKey=source.customProgramCacheKey.bind(source);m.userData={...source.userData};m.color.set(color).lerp(new THREE.Color('#ffffff'),key==='darkWood'?.12:.25);matCache.set(id,m);return m;
};
const densityBefore30=atlasLookup;
atlasLookup=function(){return densityBefore30().replace('vSurfaceUV*scale28(vTile)','vSurfaceUV*scale28(vTile)*((vTile<.5||abs(vTile-15.)<.5||abs(vTile-16.)<.5)?.78:(abs(vTile-3.)<.5?.50:1.))');};
const terrainBefore30=addContinuousTerrain;
addContinuousTerrain=function(...args){const r=terrainBefore30(...args);for(const o of world.userData.terrainChunks??[]){const m=o.material;if(m.userData.look30)continue;m.userData.look30=true;const old=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{old(sh);sh.fragmentShader=sh.fragmentShader.replaceAll('vGround.xz*.3','vGround.xz*.234').replace('vGroundBlend.y*biome*.55','vGroundBlend.y*biome*.10*(1.-vGroundBlend.x)');};m.customProgramCacheKey=()=>key+'-stone-scale30';m.needsUpdate=true;}return r;};
const cameraBefore30=updateCamera;
updateCamera=function(dt,instant=false){
 if(!player||battle||restoration||state.mode==='title'||activeScene?.kind!=='poi')return cameraBefore30(dt,instant);
 const zoom=state.settings.zoom??1,look=V3(player.x,heightAt(player.x,player.z)+1.25,player.z-4.4),offset=V3(2.1,11.2,25.1).multiplyScalar(zoom);
 cameraTarget.lerp(look,instant?1:1-Math.exp(-dt*7));camera.position.copy(cameraTarget).add(offset);camera.fov=35;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=offset.length();
 const yaw=Math.atan2(offset.x,offset.z),pitch=Math.atan2(offset.y,Math.hypot(offset.x,offset.z));for(const a of actors){a.mesh.quaternion.setFromAxisAngle(axis24,yaw);a.mesh.scale.y=1/Math.max(.72,Math.cos(pitch));}sideCameraStats.angle=look30.cameraPitch=pitch*180/Math.PI;
};
const lightBefore30=updateLighting;
updateLighting=function(){lightBefore30();if(!world||!player||activeScene?.kind==='interior')return;
 const h=(state.worldMinutes/60%24+24)%24,alt=Math.sin((h-6)/12*Math.PI),day=smooth(-.04,.3,alt),sunset=Math.max(0,1-Math.abs(h-17)/3),rain=weather.rain.value;
 sun.color.set('#fff0c9').lerp(new THREE.Color('#ffc36a'),sunset*.75).lerp(new THREE.Color('#a8bfdc'),1-day);sun.intensity=mix(.31,5.4,Math.sqrt(Math.max(0,alt)))*(1-rain*.5)+weather.lightning*4;
 const p=restoration?cameraTarget:player,y=heightAt(p.x,p.z);sun.position.set(p.x-32,y+44+Math.max(0,alt)*8,p.z+26);sun.target.position.set(p.x,y,p.z);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);weather.sun.value.copy(sun.position).sub(sun.target.position).normalize();sceneryLight.direction.value.copy(weather.sun.value);
 hemi.color.set('#bad3dd');hemi.groundColor.set('#586744');hemi.intensity=mix(.40,.95,day)*(1-rain*.07);
 if(skyBounce17){skyBounce17.color.set('#d3e3ea');skyBounce17.intensity=mix(battle?.58:.22,battle?.87:.75,day)*(1-rain*.12);}
 renderer.toneMappingExposure=mix(1.1,1.11,day);scene.fog.near=mix(activeScene.kind==='overworld'?180:145,70,rain);scene.fog.far=mix(activeScene.kind==='overworld'?500:385,210,rain);
};
const shaftsBefore30=buildShafts24;
buildShafts24=function(){shaftsBefore30();const q=world.userData.shafts24,m=q?.group.children[0]?.material;if(!m)return;
 m.fragmentShader=m.fragmentShader.replace('rim*fade*.045','rim*fade*.008').replace('rim*fade*.025','rim*fade*.008');m.needsUpdate=true;look30.shafts=q.group.children.reduce((n,o)=>n+o.count,0);
};
const postBefore30=setupPost;
setupPost=function(){postBefore30();post.material.fragmentShader=post.material.fragmentShader.replace('float blur=max(max(foreground,distant),rim)*min(.85,strength);','float blur=max(foreground*.45,distant*.22)*min(.6,strength);').replace('col=mix(col,total/weight,blur*.85)','col=mix(col,total/weight,blur*.5)').replace('bloomAmount22*.75','bloomAmount22*.40');post.material.needsUpdate=true;};
