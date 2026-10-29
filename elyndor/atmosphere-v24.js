// A lower south-east-facing view puts the west bridge landing at screen SW.
// Screen-relative movement, sprite facing, picking and cutaways use this matrix.
const atmosphere24={rays:0,refreshes:0};
const atmosphereCameraBefore24=updateCamera;
const look24=V3(),offset24=V3(),axis24=V3(0,1,0);
updateCamera=function(dt,instant=false){
 if(!player||battle||restoration||activeScene?.kind==='interior'||state.mode==='title')return atmosphereCameraBefore24(dt,instant);
 const macro=activeScene.kind==='overworld',zoom=state.settings.zoom??1;
 look24.set(player.x,heightAt(player.x,player.z)+1.3,player.z-(macro?3:3.8));
 offset24.set(macro?-28:-8,macro?47:17,macro?57:25).multiplyScalar(zoom);
 cameraTarget.lerp(look24,instant?1:1-Math.exp(-dt*7));camera.position.copy(cameraTarget).add(offset24);camera.fov=macro?37:35;
 camera.lookAt(cameraTarget);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);post.material.uniforms.focus.value=offset24.length();
 const yaw=Math.atan2(offset24.x,offset24.z),pitch=Math.atan2(offset24.y,Math.hypot(offset24.x,offset24.z));
 for(const a of actors){a.mesh.quaternion.setFromAxisAngle(axis24,yaw);a.mesh.scale.y=1/Math.max(.72,Math.cos(pitch));a.shadow.visible=a.mesh.visible;}
 sideCameraStats.angle=pitch*180/Math.PI;
};
const atmosphereLightBefore24=updateLighting;
const goldenKey24=new THREE.Color('#ffe3b3'),openSky24=new THREE.Color('#c9def1'),warmEarth24=new THREE.Color('#aaa184');
updateLighting=function(){
 atmosphereLightBefore24();if(!player||!world||activeScene.kind==='interior')return;
 const h=(state.worldMinutes/60%24+24)%24,alt=Math.sin((h-6)/12*Math.PI),day=smooth(-.05,.38,alt),direct=Math.sqrt(Math.max(0,alt)),rain=weather.rain.value;
 sun.intensity=mix(.28,4.85,direct)*(1-rain*.43)+weather.lightning*5;sun.color.lerp(goldenKey24,day*.68);
 hemi.color.lerp(openSky24,day*.8);hemi.groundColor.lerp(warmEarth24,day*.8);hemi.intensity=mix(.48,1.29,day)*(1-rain*.12);
 if(skyBounce17)skyBounce17.intensity=mix(battle?.68:.26,1.08,day)*(1-rain*.24);
 renderer.toneMappingExposure=mix(1.13,1.10,day);
 scene.fog.near=mix(activeScene.kind==='overworld'?135:105,54,rain);scene.fog.far=mix(activeScene.kind==='overworld'?380:300,155,rain);
};
// Soft shafts are actual depth-tested volumes, anchored in woodland clearings.
// Their opacity samples the same cloud field as the world shadows.
function buildShafts24(){
 if(activeScene.kind==='interior')return;
 for(const o of world.userData.sunshafts?.beams??[])o.visible=false;
 const g=new THREE.CylinderGeometry(.45,2.6,19,12,1,true);g.translate(0,9.5,0);
 const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{time:weather.time,day:cinema22.day,rain:weather.rain,cloud:weather.cloud,map:weather.cloudMap,sun:weather.sun},vertexShader:'varying vec3 wp24;varying vec2 tex24;void main(){tex24=uv;wp24=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp24,1.);}',fragmentShader:`uniform sampler2D map;uniform float time,day,rain,cloud;uniform vec3 sun;varying vec3 wp24;varying vec2 tex24;void main(){vec2 uv=(wp24.xz+sun.xz/max(.35,sun.y)*max(0.,55.-wp24.y))*.006+vec2(time*.0013,time*.00037);float cover=texture2D(map,uv).r;float rim=pow(sin(tex24.x*3.14159265),3.);float fade=smoothstep(0.,.25,tex24.y)*(1.-smoothstep(.6,1.,tex24.y));float a=rim*fade*.038*day*(1.-rain)*(1.-cover*cloud*.9);if(a<.0007)discard;gl_FragColor=vec4(vec3(1.24,1.08,.73),a);}`});
 const group=new THREE.Group();group.userData.dynamicFX=true;world.add(group);
 for(let i=0;i<12;i++){const o=new THREE.Mesh(g,m);o.visible=false;o.renderOrder=3;o.userData.dynamicFX=true;group.add(o);}
 world.userData.shafts24={group,key:'',trees:[],last:-1};atmosphere24.rays=12;
}
const atmosphereBefore24=updateAtmosphere;
updateAtmosphere=function(){
 const q=world?.userData.shafts24;if(!q)return atmosphereBefore24();if(!player)return;
 for(const o of world.userData.sunshafts?.beams??[])o.visible=false;
 if(clock-q.last<.25)return;q.last=clock;
 const key=Math.floor(player.x/12)+','+Math.floor(player.z/12),grid=world.userData.clarity23?.treeGrid;
 if(key!==q.key){q.key=key;q.trees=[];if(grid)for(let x=Math.floor((player.x-40)/32);x<=Math.floor((player.x+40)/32);x++)for(let z=Math.floor((player.z-55)/32);z<=Math.floor((player.z+20)/32);z++)for(const t of grid.get(x+','+z)??[])if(Math.hypot(t.x-player.x,t.z-player.z)<52)q.trees.push(t);q.trees.sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z));}
 q.group.visible=!battle&&activeScene.kind!=='interior';const direction=weather.sun.value;
 q.group.children.forEach((o,i)=>{const t=q.trees[i*2];o.visible=!!t;if(!t)return;o.position.set(t.x+2.1,t.y+.2,t.z+.7);o.quaternion.setFromUnitVectors(axis24,direction);});atmosphere24.refreshes++;
};
const atmosphereBuildBefore24=buildWorld;buildWorld=function(...args){const r=atmosphereBuildBefore24(...args);buildShafts24();updateAtmosphere();return r;};
