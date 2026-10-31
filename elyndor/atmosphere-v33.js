// The reference separates amber direct light from blue open shadows. Preserve
// that separation at dawn and dusk rather than fading both to near-black.
const atmosphere33={glow:{value:1},gold:{value:0},exterior:{value:1},effectLights:0};
const blackLamp33=new THREE.DataTexture(new Uint8Array(4),1,1);blackLamp33.needsUpdate=true;
const lampField33={map:{value:blackLamp33},bounds:{value:new THREE.Vector4(0,0,1,1)},power:{value:0}};
const materialLightBefore33=addCloudLighting;
addCloudLighting=function(m){materialLightBefore33(m);if(!m?.userData.weatherV12||m.userData.lampField33)return;m.userData.lampField33=true;const old=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{old(sh);sh.uniforms.lampField33=lampField33.map;sh.uniforms.lampBounds33=lampField33.bounds;sh.uniforms.lampPower33=lampField33.power;sh.fragmentShader='uniform sampler2D lampField33;uniform vec4 lampBounds33;uniform float lampPower33;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('#include <opaque_fragment>',`vec2 lampUV33=(vWeatherWorld.xz-lampBounds33.xy)/lampBounds33.zw;float inLamp33=step(0.,lampUV33.x)*step(lampUV33.x,1.)*step(0.,lampUV33.y)*step(lampUV33.y,1.);vec4 lamp33=texture2D(lampField33,lampUV33);float floor33=lamp33.a*192.-32.;float height33=exp(-abs(vWeatherWorld.y-floor33)*.30);outgoingLight+=diffuseColor.rgb*vec3(1.6,.59,.12)*lamp33.r*lampPower33*height33*inLamp33;\n#include <opaque_fragment>`);};m.customProgramCacheKey=()=>key+'-lamp-bounce33';return m;};
function buildLampField33(){
 lampField33.map.value=blackLamp33;if(activeScene.kind==='interior')return;const b=activeScene.bounds,pad=24,x0=b[0]-pad,z0=b[2]-pad,sx=b[1]-b[0]+pad*2,sz=b[3]-b[2]+pad*2,w=clamp(Math.ceil(sx/1.5),64,512),h=clamp(Math.ceil(sz/1.5),64,512),energy=new Float32Array(w*h),level=new Float32Array(w*h);
 for(const p of world.userData.lampSources??[]){const radius=14,ix=(p.x-x0)/sx*w,iz=(p.z-z0)/sz*h,rx=radius/sx*w,rz=radius/sz*h;for(let z=Math.max(0,Math.floor(iz-rz));z<=Math.min(h-1,Math.ceil(iz+rz));z++)for(let x=Math.max(0,Math.floor(ix-rx));x<=Math.min(w-1,Math.ceil(ix+rx));x++){const d=Math.hypot(x0+(x+.5)/w*sx-p.x,z0+(z+.5)/h*sz-p.z)/radius;if(d>=1)continue;const k=z*w+x,v=(1-d)**2;energy[k]+=v;level[k]+=(p.y-2)*v;}}
 const data=new Uint8Array(w*h*4);for(let i=0;i<energy.length;i++){data[i*4]=Math.round(clamp(energy[i],0,1)*255);data[i*4+3]=Math.round(clamp(((energy[i]?level[i]/energy[i]:0)+32)/192,0,1)*255);}
 const t=new THREE.DataTexture(data,w,h);t.minFilter=t.magFilter=THREE.LinearFilter;t.needsUpdate=true;world.userData.lampMap33=t;lampField33.map.value=t;lampField33.bounds.value.set(x0,z0,sx,sz);
}
const dayColours33=['#ffd6ad','#ffb77c','#ffaf68','#ffbc68','#ffdf9f','#ffedc3','#fff5da','#ffe3ab','#ffca70','#ffad53','#ffad7c','#ffc293','#ffdbb1','#ffd6ad'];
SKY_PHASES31.forEach((p,i)=>p.colours[0].set(dayColours33[i]));
const solarBefore33=solarState31;
solarState31=function(){const r=solarBefore33(),a=(r.hour-6)*Math.PI/12;r.sun.value.set(Math.cos(a),Math.sin(a),.58).normalize();r.moon.value.copy(r.sun.value).negate();return r;};
const lightsBefore33=updateLighting;
updateLighting=function(){
 lightsBefore33();if(!world||!player)return;const outside=activeScene.kind!=='interior';atmosphere33.exterior.value=outside?1:0;
 if(!outside){atmosphere33.glow.value=2.2;lampField33.power.value=0;return;}
 const h=celestial31.hour,e=celestial31.sun.value.y,day=celestial31.day.value,night=celestial31.night.value,rain=weather.rain.value;
 const golden=Math.max(1-smooth(0,2.1,Math.abs(h-6.8)),1-smooth(0,2.0,Math.abs(h-17.1)));atmosphere33.gold.value=golden;atmosphere33.glow.value=mix(.70,3.8,1-day)+golden*1.6;lampField33.power.value=mix(.70,.055,day)+golden*.25;
 const source=e>0?celestial31.sun.value:celestial31.moon.value,p=restoration?cameraTarget:player,y=heightAt(p.x,p.z);
 sun.position.copy(source).multiplyScalar(95).add(V3(p.x,y,p.z));sun.target.position.set(p.x,y,p.z);sun.target.updateMatrixWorld();sun.updateMatrixWorld(true);
 sun.color.copy(e>0?celestial31.colour.value:new THREE.Color('#a1c8ff'));
 sun.intensity=(e>0?(4.6+1.1*smooth(.1,.8,e))*smooth(0,.16,e):.82*Math.sqrt(Math.max(0,source.y)))*(1-rain*.52)+weather.lightning*4;
 hemi.color.set('#bed6e9').lerp(new THREE.Color('#819fc7'),night).lerp(new THREE.Color('#d6bdb0'),golden*.19);hemi.groundColor.set('#69764c').lerp(new THREE.Color('#34445a'),night);hemi.intensity=mix(.66,.96,day)*(1-rain*.10);
 if(skyBounce17){skyBounce17.color.set('#d8e8ef').lerp(new THREE.Color('#82aee5'),night);skyBounce17.intensity=mix(.69,.98,day)*(1-rain*.18);}
 renderer.toneMappingExposure=mix(1.25,1.19,day);weather.sun.value.copy(source);sceneryLight.direction.value.copy(source);
 scene.fog.near=mix(170,85,rain);scene.fog.far=mix(activeScene.kind==='overworld'?650:480,260,rain);
 for(const l of world.userData.lanterns??[]){l.visible=true;if((l.userData.effectUntil??0)>clock)continue;if(l.intensity<.061)l.intensity=0;else{l.intensity*=mix(1.5,3.2,1-day);l.distance=26;}}
};
const atlasBefore33=staticAtlasMaterial;
staticAtlasMaterial=function(){const m=atlasBefore33();if(m.userData.window33)return m;m.userData.window33=true;const old=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=sh=>{old(sh);sh.uniforms.windowGlow33=atmosphere33.glow;sh.fragmentShader='uniform float windowGlow33;\n'+sh.fragmentShader;sh.fragmentShader=sh.fragmentShader.replace('totalEmissiveRadiance+=tileColor.rgb*vEmission;','totalEmissiveRadiance+=tileColor.rgb*vEmission*windowGlow33;');};m.customProgramCacheKey=()=>key+'-warm-windows33';return m;};
const shaftsBefore33=buildShafts24;
buildShafts24=function(...args){const r=shaftsBefore33(...args);const m=world.userData.shafts24?.group.children[0]?.material;if(m){m.uniforms.gold33=atmosphere33.gold;m.fragmentShader='uniform float gold33;\n'+m.fragmentShader.replace('phase*.025','phase*mix(.028,.075,gold33)');m.needsUpdate=true;}return r;};
const postBefore33=setupPost;
setupPost=function(){postBefore33();const u=post.material.uniforms;u.gold33=atmosphere33.gold;u.exterior33=atmosphere33.exterior;u.pixelRatio33={value:1};
 post.material.fragmentShader=`uniform sampler2D colorTex,depthTex,bloom22;uniform vec2 resolution,nearFar;uniform float focus,strength,flash,time,bloomAmount22,night22,gold33,exterior33,pixelRatio33;varying vec2 vUv;
 float viewDepth33(float d){float z=d*2.-1.;return 2.*nearFar.x*nearFar.y/(nearFar.y+nearFar.x-z*(nearFar.y-nearFar.x));}
 void main(){vec3 col=texture2D(colorTex,vUv).rgb;float d=viewDepth33(texture2D(depthTex,vUv).r);
 float nearBlur=1.-smoothstep(focus-13.,focus-7.5,d),farBlur=smoothstep(focus+18.,focus+75.,d)*.38;
 float lens=smoothstep(.40,.53,max(abs(vUv.x-.5),abs(vUv.y-.5)))*.12;
 float coc=max(max(nearBlur,farBlur),lens)*min(.85,strength);if(coc>.035){vec3 sum=col;float weight=1.;vec2 radius=vec2(4.6*coc*pixelRatio33)/resolution;
 for(int k=0;k<8;k++){float a=float(k)*2.399963;vec2 p=clamp(vUv+vec2(cos(a),sin(a))*radius*sqrt((float(k)+.5)/8.),vec2(0.),vec2(1.));float other=viewDepth33(texture2D(depthTex,p).r);float w=1.-smoothstep(1.0,6.,abs(other-d));sum+=texture2D(colorTex,p).rgb*w;weight+=w;}col=mix(col,sum/weight,coc);}
 float lum=dot(col,vec3(.2126,.7152,.0722));col=mix(vec3(lum),col,1.035);col*=mix(vec3(1.015,1.005,.98),vec3(.92,1.015,1.12),night22*.65*exterior33);float amber33=gold33*smoothstep(.06,.9,lum);col*=vec3(1.+amber33*.14,1.+amber33*.025,1.-amber33*.20);
 col+=texture2D(bloom22,vUv).rgb*bloomAmount22*.92;float v=smoothstep(.37,.78,length((vUv-.5)*vec2(1.,1.08)));col*=1.-v*.14;col+=flash*.17;gl_FragColor=vec4(max(vec3(0.),col),1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`;post.material.needsUpdate=true;
};
const cameraBefore33=updateCamera;
// A wide portrait lens can expose a near hillside that the narrower battle
// view did not show. Keep the eye above real terrain, then rebuild billboards.
function clearBattleCamera33(){if(!battle)return;const floor=groundAt(camera.position.x,camera.position.z)+3;if(camera.position.y>=floor)return;camera.position.y=floor;camera.lookAt(cameraTarget);camera.updateMatrixWorld();for(const a of actors)a.mesh.quaternion.copy(camera.quaternion);}
updateCamera=function(...args){const r=cameraBefore33(...args);if(battle&&camera.aspect<1){const base=camera.fov;camera.fov=Math.min(100,2*Math.atan(Math.tan(base*Math.PI/360)*1.45/camera.aspect)*180/Math.PI);camera.updateProjectionMatrix();camera.updateMatrixWorld();}else if(!battle&&state.mode==='explore'&&camera.aspect<.75&&activeScene.kind!=='interior'){camera.fov=Math.max(camera.fov,43);camera.updateProjectionMatrix();camera.updateMatrixWorld();}clearBattleCamera33();if(player&&post.material){const p=V3(player.x,heightAt(player.x,player.z)+1.1,player.z).applyMatrix4(camera.matrixWorldInverse);post.material.uniforms.focus.value=-p.z;}return r;};
// Use the existing pooled geometry and lights: no scene allocation per strike.
const effectBefore33=effectLight;
effectLight=function(pos,color,power=18,duration=.65){effectBefore33(pos,color,power*1.25,duration*1.18);for(const l of world?.userData.lanterns??[])if((l.userData.effectUntil??0)>clock){l.visible=true;l.distance=24;l.decay=1.4;}atmosphere33.effectLights++;};
const buildBefore33=buildWorld;
buildWorld=function(...args){const r=buildBefore33(...args);world.userData.atmosphere33=true;
 // Warm door spill belongs to the building, and can be seen before reaching it.
 for(const g of world.userData.buildings??[])if(g.parent===world&&g.userData.door){const p=g.userData.door.clone();p.y+=1.9;p.z-=.35;world.userData.lampSources?.push(p);}
 buildLampField33();updateLighting();return r;
};
const disposeLightsBefore33=disposeContinuousWorld;
disposeContinuousWorld=function(...args){world?.userData.lampMap33?.dispose();lampField33.map.value=blackLamp33;return disposeLightsBefore33(...args);};
