// Authored illumination values interpolate continuously. The visible solar
// orbit, cloud transmission, weather and real shadow maps remain world-space.
const lighting34={warm:{value:0},night:{value:0},horizon:{value:1},colour:{value:new THREE.Color()},foliage:{value:0},frames:0};
const LIGHT_KEYS34=[
 [0,.60,.42,.32,1.20,.115,.90,0,'#85b8ff','#718ebc','#22344b','#82abe1'],
 [4.5,.50,.46,.35,1.22,.10,.90,0,'#91adf3','#8795b0','#303b4a','#a0b0cc'],
 [5.4,.42,.48,.37,1.22,.09,.90,.15,'#a9afe9','#a1a2b5','#454653','#b4a8ba'],
 [6.1,5.2,.51,.36,1.13,.025,.85,.85,'#ff9c38','#b8b9cd','#6d6548','#efb66e'],
 [6.5,8.2,.72,.57,1.17,.015,.90,1,'#ffb349','#d0c4b4','#79734d','#ffcc80'],
 [7.5,6.4,.66,.48,1.19,.010,1,.35,'#ffdc8c','#bed5e6','#65744c','#e6e4c2'],
 [9,6.5,.69,.50,1.21,.008,1,0,'#fff0b9','#b6d2eb','#627346','#dbe6e9'],
 [12,6.8,.73,.53,1.20,.008,1,0,'#fff3ce','#b7d6eb','#667949','#e4ebdf'],
 [15,6.5,.69,.49,1.20,.010,1,.18,'#ffe6a0','#b9d0e5','#6f7648','#e8dfb5'],
 [16,6.4,.62,.43,1.19,.015,1,.48,'#ffd37b','#bac6de','#756f43','#f0cf8c'],
 [17.5,8.0,.75,.60,1.20,.020,1,1,'#ff9d35','#c6b59e','#786545','#ffb35b'],
 [18.3,1.1,.38,.28,1.18,.08,1,.38,'#ee976e','#9386ac','#45374c','#bda0bc'],
 [18.7,.38,.39,.28,1.18,.10,.95,.05,'#9ea7e1','#747caa','#2d354a','#8f9fc9'],
 [20,.56,.41,.31,1.20,.115,.90,0,'#81aff5','#6a87b9','#22344c','#7c9fd3'],
 [24,.60,.42,.32,1.20,.115,.90,0,'#85b8ff','#718ebc','#22344b','#82abe1']
].map(([hour,...v])=>({hour,n:v.slice(0,7),c:v.slice(7).map(s=>new THREE.Color(s))}));
const lightState34={n:new Float32Array(7),c:[new THREE.Color(),new THREE.Color(),new THREE.Color(),new THREE.Color()]};
function lightKey34(hour){let i=1;while(i<LIGHT_KEYS34.length-1&&hour>LIGHT_KEYS34[i].hour)i++;const a=LIGHT_KEYS34[i-1],b=LIGHT_KEYS34[i],t=smooth(a.hour,b.hour,hour);for(let k=0;k<7;k++)lightState34.n[k]=mix(a.n[k],b.n[k],t);for(let k=0;k<4;k++)lightState34.c[k].copy(a.c[k]).lerp(b.c[k],t);return lightState34;}
const lightBefore34=updateLighting;
updateLighting=function(){lightBefore34();if(!world||!player||activeScene.kind==='interior'){lighting34.warm.value=lighting34.night.value=lighting34.foliage.value=0;return;}
 const h=celestial31.hour,q=lightKey34(h),[power,ambient,fill,exposure,spill,lamps,warm]=q.n,rain=weather.rain.value,day=celestial31.day.value;
 lighting34.warm.value=warm;lighting34.night.value=celestial31.night.value;lighting34.colour.value.copy(q.c[0]);lighting34.foliage.value=day*(.24+warm*.20)*(1-rain*.6);
 // A low sun still has a warm, broad sky fill; shadows retain a cool floor.
 lighting34.horizon.value=smooth(0,.12,Math.abs(celestial31.sun.value.y));sun.color.copy(q.c[0]);sun.intensity=power*lighting34.horizon.value*(1-rain*.53)+weather.lightning*4;
 hemi.color.copy(q.c[1]);hemi.groundColor.copy(q.c[2]);hemi.intensity=ambient*(1-rain*.16);
 if(skyBounce17){skyBounce17.color.copy(q.c[3]);skyBounce17.intensity=fill*(1-rain*.18);}
 for(const o of scene.children)if(o.isAmbientLight)o.intensity=mix(.035,.065,day);
 renderer.toneMappingExposure=exposure;lampField33.power.value=spill;
 const prior=mix(1.5,3.2,1-day);for(const l of world.userData.lanterns??[]){if((l.userData.effectUntil??0)>clock)continue;l.intensity*=lamps/prior;l.distance=mix(10,13,day);}
 // Window emission is local to the glass. It no longer requires bright walls.
 atmosphere33.gold.value=warm;atmosphere33.glow.value=mix(2.2,.7,day);
 lighting34.frames++;
};
const forestBefore34=forestMaterial30;
forestMaterial30=function(trunk){const m=forestBefore34(trunk);if(trunk)return m;const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{before(sh);sh.uniforms.leafLight34=lighting34.foliage;sh.uniforms.leafColour34=lighting34.colour;sh.fragmentShader='uniform float leafLight34;uniform vec3 leafColour34;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>','float leafSun34=clamp(dot(reflectedLight.directDiffuse,vec3(.2126,.7152,.0722)),0.,1.);outgoingLight+=diffuseColor.rgb*leafColour34*leafSun34*leafLight34;\n#include <opaque_fragment>');};m.customProgramCacheKey=()=>key+'-leaf-light34';return m;};
const shaftsBefore34=buildShafts24;
buildShafts24=function(...args){const r=shaftsBefore34(...args),m=world.userData.shafts24?.group.children[0]?.material;if(m){m.uniforms.horizon34=lighting34.horizon;m.fragmentShader='uniform float horizon34;\n'+m.fragmentShader.replace('if(a<.0001)discard;','a*=horizon34;if(a<.0001)discard;');m.needsUpdate=true;}return r;};
const postBefore34=setupPost;
setupPost=function(){postBefore34();const m=post.material;m.uniforms.warm34=lighting34.warm;m.uniforms.night34=lighting34.night;
 m.fragmentShader='uniform float warm34,night34;\n'+m.fragmentShader.replace('col+=texture2D(bloom22,vUv).rgb*bloomAmount22*.92;',`float shade34=1.-smoothstep(.10,.72,lum);col*=mix(vec3(1.025,1.01,.97),vec3(.68,.85,1.20),shade34*night34*.66);col=pow(max(col,vec3(0.)),vec3(1.065));col*=vec3(1.+warm34*.16,1.+warm34*.02,1.-warm34*.13);col+=texture2D(bloom22,vUv).rgb*bloomAmount22*mix(1.05,1.75,warm34);`);m.needsUpdate=true;
 const f=cinema22.bloom?.filter;if(f){f.fragmentShader=f.fragmentShader.replace('peak-.65','peak-.48').replace('peak-1.15','peak-.92');f.needsUpdate=true;}
};
// A closer lens gives the player, flower beds and shopfronts the same visual
// weight as the reference. Portrait battle and interior framing are preserved.
const cameraBefore34=updateCamera;
updateCamera=function(dt,instant=false){if(!player||battle||restoration||state.mode!=='explore'||activeScene.kind!=='poi'||camera.aspect<1)return cameraBefore34(dt,instant);const look=V3(player.x,heightAt(player.x,player.z)+1.25,player.z-7.2),offset=V3(2.1,11.2,25.1).multiplyScalar(.84*(state.settings.zoom??1));cameraTarget.lerp(look,instant?1:1-Math.exp(-dt*7));camera.position.copy(cameraTarget).add(offset);camera.fov=35;camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();const yaw=Math.atan2(offset.x,offset.z),pitch=Math.atan2(offset.y,Math.hypot(offset.x,offset.z));for(const a of actors){a.mesh.quaternion.setFromAxisAngle(axis24,yaw);a.mesh.scale.y=1/Math.max(.72,Math.cos(pitch));}sideCameraStats.angle=pitch*180/Math.PI;const p=V3(player.x,heightAt(player.x,player.z)+1.1,player.z).applyMatrix4(camera.matrixWorldInverse);post.material.uniforms.focus.value=-p.z;};
