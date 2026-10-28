// Stable world chunks: walking changes which chunks are retained, never the
// world position of an existing raindrop, snowflake, splash or overhead cloud.
const weatherField={world:null,chunks:new Map(),tile:32,retained:0,created:0,reused:0,material:null,lastX:Infinity,lastZ:Infinity,frustum:new THREE.Frustum(),matrix:new THREE.Matrix4(),updates:0};
function weatherChunk15(ix,iz){
 const size=weatherField.tile,random=seeded((ix*73856093)^(iz*19349663)^15027),count=softwareBudget()?54:112,geo=new THREE.InstancedBufferGeometry().copy(new THREE.PlaneGeometry(1,1)),samples=new Float32Array(count*4);let n=0,minY=Infinity,maxY=-Infinity;
 for(let i=0;i<count*3&&n<count;i++){const x=ix*size+random()*size,z=iz*size+random()*size;if(!staticFree(x,z,.03)&&!waterGround(x,z))continue;const y=groundAt(x,z);samples.set([x,y,z,random()*28],n*4);minY=Math.min(minY,y);maxY=Math.max(maxY,y);n++;}
 if(!n){minY=maxY=0;}geo.setAttribute('weatherSample',new THREE.InstancedBufferAttribute(samples,4));geo.instanceCount=n;geo.boundingSphere=new THREE.Sphere(V3(ix*size+size/2,(minY+maxY)/2+14,iz*size+size/2),Math.hypot(size*.75,Number.isFinite(maxY-minY)?(maxY-minY)/2+17:30));
 if(!weatherField.material){weatherField.material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,side:THREE.DoubleSide,uniforms:{time:weather.time,rain:weather.rain,snow:weather.snow,wind:weather.wind,sunColor:{value:new THREE.Color('#e5f1f1')},flash:{value:0}},vertexShader:`attribute vec4 weatherSample;uniform float time,rain,snow;uniform vec2 wind;varying vec2 weatherUV;varying float weatherAlpha,flake;void main(){float velocity=mix(18.,1.7,snow);float drop=mod(weatherSample.w+time*velocity,28.);vec3 p=weatherSample.xyz;p.y+=28.-drop;p.xz+=wind*(drop/velocity)*1.2;flake=snow;float phase=weatherSample.x*.79+weatherSample.z*.31;p.xz+=vec2(sin(time*.8+phase),cos(time*.65+phase))*.34*snow;vec3 right=vec3(viewMatrix[0][0],viewMatrix[1][0],viewMatrix[2][0]);vec3 up=mix(normalize(vec3(-wind.x*.06,1.,-wind.y*.06)),vec3(viewMatrix[0][1],viewMatrix[1][1],viewMatrix[2][1]),snow);p+=right*position.x*mix(.026,.13,snow)+up*position.y*mix(.7,.13,snow);gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);weatherUV=uv;weatherAlpha=max(rain,snow)*mix(.4,.84,snow)*smoothstep(0.,.7,28.-drop);}`,fragmentShader:`uniform vec3 sunColor;uniform float flash;varying vec2 weatherUV;varying float weatherAlpha,flake;void main(){float roundEdge=1.-smoothstep(.12,.5,length(weatherUV-.5));float streak=(1.-smoothstep(.12,.5,abs(weatherUV.x-.5)))*sin(weatherUV.y*3.14159);float a=mix(streak,roundEdge,flake)*weatherAlpha;if(a<.015)discard;gl_FragColor=vec4(mix(vec3(.66,.81,.86),sunColor,flake)+flash*.5,a);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}`});}
 const mesh=new THREE.Mesh(geo,weatherField.material);mesh.userData.dynamicFX=true;mesh.userData.weatherChunk={ix,iz,worldAnchored:true};mesh.renderOrder=7;world.add(mesh);weatherField.created++;return mesh;
}
function updateWorldWeather15(force=false){
 if(!world||!player||activeScene.kind==='interior')return;const wet=weather.rain.value+weather.snow.value>.015,cx=Math.floor(cameraTarget.x/32),cz=Math.floor(cameraTarget.z/32),moved=cx!==weatherField.lastX||cz!==weatherField.lastZ;
 if(weatherField.world!==world){weatherField.world=world;weatherField.chunks.clear();weatherField.lastX=Infinity;weatherField.lastZ=Infinity;force=true;}
 if(force||moved){weatherField.lastX=cx;weatherField.lastZ=cz;const keep=new Set(),radius=3;
  for(let ix=cx-radius;ix<=cx+radius;ix++)for(let iz=cz-radius;iz<=cz+radius;iz++){const key=ix+','+iz;keep.add(key);if(!weatherField.chunks.has(key))weatherField.chunks.set(key,weatherChunk15(ix,iz));else weatherField.reused++;}
  for(const[key,mesh]of weatherField.chunks)if(!keep.has(key)){mesh.removeFromParent();mesh.geometry.dispose();weatherField.chunks.delete(key);}weatherField.retained=weatherField.chunks.size;weatherField.updates++;
 }
 weatherField.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);weatherField.frustum.setFromProjectionMatrix(weatherField.matrix);for(const mesh of weatherField.chunks.values())mesh.visible=wet&&weatherField.frustum.intersectsSphere(mesh.geometry.boundingSphere);
 if(weatherField.material){weatherField.material.uniforms.sunColor.value.set('#d5e5eb').lerp(sun.color,.22);weatherField.material.uniforms.flash.value=weather.lightning;}
 const layer=world.userData.weather;if(layer)layer.worldChunks=weatherField.chunks;
}
const setupBeforeAnchoredWeather=setupWeather;
setupWeather=function(){setupBeforeAnchoredWeather();const old=world.userData.weather?.precipitation;if(old){old.removeFromParent();old.geometry.dispose();old.material.dispose();world.userData.weather.precipitation=null;}if(activeScene.kind==='interior')return;weatherField.world=null;updateWorldWeather15(true);};
const updateBeforeAnchoredWeather=updateWeather;
updateWeather=function(dt){updateBeforeAnchoredWeather(dt);updateWorldWeather15();};
const warmBeforeAnchoredWeather=prepareGameplayGraphics;
prepareGameplayGraphics=async function(){await warmBeforeAnchoredWeather();if(activeScene.kind==='interior')return;updateWorldWeather15(true);const r=weather.rain.value,s=weather.snow.value;try{weather.rain.value=.002;weather.snow.value=.002;for(const mesh of weatherField.chunks.values())mesh.visible=true;renderBeforeLoadingGate();}finally{weather.rain.value=r;weather.snow.value=s;updateWorldWeather15();}};

// Pollen and fireflies also belong to the landscape, including their height.
const atmosphereSetupBefore15=setupAtmosphere;
setupAtmosphere=function(){atmosphereSetupBefore15();if(activeScene?.kind==='interior')return;const motes=world.userData.motes;if(!motes)return;const bounds=activeScene.bounds,area=(bounds[1]-bounds[0])*(bounds[3]-bounds[2]),count=Math.min(9000,Math.ceil(area/24)),points=new Float32Array(count*3),random=seeded(15424);for(let i=0;i<count;i++){const x=mix(bounds[0],bounds[1],random()),z=mix(bounds[2],bounds[3],random());points.set([x,groundAt(x,z)+.5+random()*8,z],i*3);}motes.geometry.dispose();motes.geometry=new THREE.BufferGeometry();motes.geometry.setAttribute('position',new THREE.BufferAttribute(points,3));motes.userData.worldAnchored=true;motes.material.uniforms.center.value.set(0,0,0);};
const atmosphereUpdateBefore15=updateAtmosphere;
updateAtmosphere=function(){atmosphereUpdateBefore15();if(world?.userData.motes?.userData.worldAnchored)world.userData.motes.material.uniforms.center.value.set(0,0,0);};

// The older weather-detail hook runs after construction. It must not create a
// second camera-centered rain or pollen layer over the anchored field.
setupWeatherDetails=function(){if(activeScene.kind==='interior')return;const rain=world.userData.rainStreaks;if(rain){rain.removeFromParent();rain.geometry.dispose();rain.material.dispose();world.userData.rainStreaks=null;}world.userData.weatherDetails=true;};
const tickBeforeAnchoredMotes15=tick;
tick=function(dt){tickBeforeAnchoredMotes15(dt);if(world?.userData.motes?.userData.worldAnchored)world.userData.motes.material.uniforms.center.value.set(0,0,0);};
const warmBeforeVisibleArrival15=prepareGameplayGraphics;
prepareGameplayGraphics=async function(){await warmBeforeVisibleArrival15();for(const cut of world.userData.cutaways??[]){cut.until=-1;cut.hidden=false;cut.fade.value=0;for(const m of cut.meshes)m.userData.viewHidden=false;}updateCamera(1,true);updateCutaways();updateRenderBudget(true);renderBeforeLoadingGate();};
