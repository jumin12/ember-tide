// One sculpted surface carries earth, grass and paths. No stacked road planes.
const LANDSCAPE_ART='/* LANDSCAPE_ART */';
const naturalTerrainLoad=loadTerrain;
loadTerrain=async function(){await naturalTerrainLoad();const im=new Image();im.src=LANDSCAPE_ART;await im.decode();for(const [i,name] of ['grass','stone','earth','ruin'].entries()){const c=document.createElement('canvas');c.width=c.height=512;c.getContext('2d').drawImage(im,(i%2)*im.width/2,Math.floor(i/2)*im.height/2,im.width/2,im.height/2,0,0,512,512);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());assets[name]=t;}};
let naturalField=null,stairSurfaces=[];
const authoredHeights=Object.fromEntries(Object.entries(sceneDefs).map(([id,def])=>[id,def.height]));
function smoothUnit(t){t=clamp(t,0,1);return t*t*(3-2*t)}
function riverBanks(z){const w=currentDef?.water;if(!w)return null;let bend=state.area==='village'?.22:state.area==='riverwalk'?1.05:.65;for(const b of currentDef.bridges)bend*=smoothUnit(Math.abs(z-b.z)/4.3);const center=w.x+bend*(Math.sin(z*.16+.6)*.7+Math.sin(z*.37)*.22),half=w.width/2+bend*Math.sin(z*.23+1.3)*.42;return {left:center-half,right:center+half,center,half}}
function roadEdgeDistance(x,z){let d=Infinity;for(const r of currentDef.roads)for(let i=1;i<r.points.length;i++)d=Math.min(d,segmentDistance(x,z,r.points[i-1],r.points[i])-r.width/2);if(state.area==='village')d=Math.min(d,Math.max(Math.abs(z-1.5)-6,Math.max(-4.6-x,x-27)));return d}
function authoredDryHeight(x,z){const w=currentDef.water;let xx=x;if(w&&Math.abs(x-w.x)<w.width/2+1.1)xx=w.x+(x<w.x?-1:1)*(w.width/2+1.2);return authoredHeights[state.area](xx,z)}
function sculptHeight(x,z){
 const edge=roadEdgeDistance(x,z),road=1-smoothUnit((edge+.2)/2.5),auth=authoredDryHeight(x,z),r=1.1;
 let soft=(auth*4+authoredDryHeight(x-r,z)+authoredDryHeight(x+r,z)+authoredDryHeight(x,z-r)+authoredDryHeight(x,z+r))/8;
 const hills=(Math.sin(x*.21+Math.sin(z*.12))*Math.cos(z*.2)*.55+Math.sin(x*.47-z*.31)*.12),amplitude=state.area==='village'?.15:state.area==='highroad'?1.25:.75;
 let h=soft*(1-road)+auth*road+hills*amplitude*(1-road);if(state.area==='village'&&z>-11&&x>-5)h=0;
 const bank=riverBanks(z);if(bank){const d=Math.abs(x-bank.center)-bank.half;if(d<.65){const t=smoothUnit((d+1.35)/2);h=-2.4+(h+2.4)*t;}}
 if(state.area==='forest'){const island=Math.hypot((x+10)/1.6,z/1.5);if(island<1.2){const t=smoothUnit((island-.65)/.55);h=.4*(1-t)+h*t;}}
 if(z<-34){const t=smoothUnit((-z-34)/16);h=h*(1-t)+(-17+Math.sin(x*.09)*1.2)*t}return h;
}
function makeNaturalField(){const step=.4,minX=-40,minZ=-38,nx=201,nz=176,data=new Float32Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)data[j*nx+i]=sculptHeight(minX+i*step,minZ+j*step);naturalField={area:state.area,minX,minZ,nx,nz,step,data};}
landHeightAt=function(x,z){if(arenaActive)return 0;if(!naturalField||naturalField.area!==state.area)return sculptHeight(x,z);const f=naturalField,xx=(x-f.minX)/f.step,zz=(z-f.minZ)/f.step;if(xx<0||zz<0||xx>=f.nx-1||zz>=f.nz-1)return sculptHeight(x,z);const i=Math.floor(xx),j=Math.floor(zz),u=xx-i,v=zz-j,k=j*f.nx+i;return (f.data[k]*(1-u)+f.data[k+1]*u)*(1-v)+(f.data[k+f.nx]*(1-u)+f.data[k+f.nx+1]*u)*v;};
function bridgeHeight(b,x){return b.y+Math.sin(clamp((x-b.x)/b.w+.5,0,1)*Math.PI)*.27}
heightAt=function(x,z){if(arenaActive)return 0;for(const b of currentDef?.bridges||[])if(Math.abs(x-b.x)<b.w/2+.15&&Math.abs(z-b.z)<b.d/2)return bridgeHeight(b,x);for(const s of stairSurfaces)if(Math.abs(x-s.x)<s.width/2&&z<s.z+s.depth/2&&z>s.z-(s.n-1)*s.depth-s.depth/2){const i=clamp(Math.floor((s.z+s.depth/2-z)/s.depth),0,s.n-1);return s.base+s.rise*(i+1)}return landHeightAt(x,z)};

function sculptedMaterial(){const material=mat('#f0f1df',{map:assets.grass,roughness:1});material.onBeforeCompile=shader=>{
 shader.uniforms.rockPixels={value:assets.ruin};shader.uniforms.earthPixels={value:assets.earth};shader.uniforms.pavingPixels={value:assets.stone};shader.uniforms.paved={value:state.area==='village'?1:0};
 shader.vertexShader='attribute float pathWeight;varying float vPath;varying vec3 vTerrainP;varying vec3 vTerrainN;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvPath=pathWeight;vTerrainP=(modelMatrix*vec4(position,1.)).xyz;vTerrainN=normalize(mat3(modelMatrix)*normal);');
 shader.fragmentShader=`uniform sampler2D rockPixels;uniform sampler2D earthPixels;uniform sampler2D pavingPixels;uniform float paved;varying float vPath;varying vec3 vTerrainP;varying vec3 vTerrainN;
 vec3 pixelTriplanar(sampler2D tex,vec3 p,vec3 w,float scale){return texture2D(tex,p.zy*scale).rgb*w.x+texture2D(tex,p.xz*scale).rgb*w.y+texture2D(tex,p.xy*scale).rgb*w.z;}
 `+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`vec3 tn=normalize(vTerrainN),weights=pow(abs(tn),vec3(5.));weights/=max(.001,weights.x+weights.y+weights.z);vec3 grassColor=pixelTriplanar(map,vTerrainP,weights,.27),rockColor=pixelTriplanar(rockPixels,vTerrainP,weights,.29);vec3 earthColor=texture2D(earthPixels,vTerrainP.xz*.26).rgb;vec3 roadColor=mix(earthColor,texture2D(pavingPixels,vTerrainP.xz*.24).rgb,paved);float slope=smoothstep(.12,.62,1.-abs(tn.y));float macro=.94+.06*sin(vTerrainP.x*.43+sin(vTerrainP.z*.37));vec3 terrain=mix(grassColor*macro,rockColor,slope*.96);float path=clamp(vPath,0.,1.);diffuseColor.rgb*=mix(terrain,roadColor,path*(1.-slope*.7));`);
 };material.customProgramCacheKey=()=> 'sculpted-triplanar-earth-v1';return material;}
createLand=function(){makeNaturalField();const xs=[],zs=[];for(let x=-40;x<=40.01;x+=.4)xs.push(x);for(let z=-38;z<=32.01;z+=.4)zs.push(z);xs.unshift(-90,-65,-48);xs.push(48,65,90);zs.unshift(-90,-65,-48);zs.push(42,60,90);const v=[],uv=[],mask=[],idx=[];
 for(const z of zs)for(const x of xs){v.push(x,landHeightAt(x,z)-.075,z);uv.push(x*.25,z*.25);const edge=roadEdgeDistance(x,z)+Math.sin(x*4.9+z*2.1)*.11+Math.sin(z*6.3)*.07;mask.push(1-smoothUnit((edge+.2)/.8))}
 for(let j=0;j<zs.length-1;j++)for(let i=0;i<xs.length-1;i++){const a=j*xs.length+i,b=a+1,c=a+xs.length,d=c+1;idx.push(a,c,b,b,c,d)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('pathWeight',new THREE.Float32BufferAttribute(mask,1));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,sculptedMaterial());m.receiveShadow=true;m.userData.walkSurface=m.userData.ground=true;m.userData.sculpted=true;world.add(m);
};
drawRoad=function(){/* Paths are painted into the sole terrain surface, including the plaza. */};
stairs=function(x,z,n,rise,width,depth=.5){const base=Math.floor(landHeightAt(x,z+depth*.7)*4)/4,s={x,z,n,rise,width,depth,base};stairSurfaces.push(s);const material=mat('#c4c7b3',{map:assets.stone,roughness:1});for(let i=0;i<n;i++){const h=rise*(i+1),m=box(width,h,depth,material,x,base+h/2,z-i*depth);m.userData.walkSurface=true;m.userData.stair=true;}return s;};
addBridge=function(b){const g=new THREE.Group();g.position.set(b.x,0,b.z);g.userData.bridge=true;world.add(g);const wood=mat('#b5a180',{map:assets.wood,roughness:.9}),stone=mat('#bfc4ad',{map:assets.ruin,roughness:1}),surface=b.type==='wood'?wood:stone,n=Math.ceil(b.w/(b.type==='wood'?.34:.6)),step=b.w/n;
 for(let i=0;i<n;i++){const x=-b.w/2+(i+.5)*step,h=bridgeHeight(b,b.x+x),m=box(step-.012,b.type==='wood'?.2:.32,b.d,surface,x,h-(b.type==='wood'?.1:.16),0,g);m.userData.walkSurface=true;m.userData.bridgeDeck=true;}
 for(const side of [-1,1]){let last=null;for(let i=0;i<=Math.ceil(b.w/1.2);i++){const x=-b.w/2+b.w*i/Math.ceil(b.w/1.2),h=bridgeHeight(b,b.x+x),p=new THREE.Vector3(x,h+1.0,side*(b.d/2-.09));box(.14,.98,.14,surface,x,h+.49,p.z,g);if(last){beam(last,p,.075,surface,g);const a=last.clone(),q=p.clone();a.y-=.45;q.y-=.45;beam(a,q,.045,surface,g)}last=p;}}
 for(const x of [-b.w*.33,b.w*.33]){const h=bridgeHeight(b,b.x+x);if(b.type==='wood'){for(const side of [-1,1])cyl(.15,.19,h+2.3,wood,x,(h-2.3)/2,side*b.d*.35,g,8);}else{const pier=cyl(.35,.55,h+2.25,stone,x,(h-2.25)/2,0,g,9);pier.scale.z=b.d*.55;}}
 return g;
};
function addLandingDock(){const bank=riverBanks(-7),x=bank.right-.65,z=-7,wood=mat('#b19b73',{map:assets.wood,roughness:.92});for(let i=0;i<10;i++){const xx=x-1.25+(i+.5)*.28;const m=box(.267,.16,2.1,wood,xx,.52,z);m.userData.walkSurface=true;}for(const xx of [x-1,x+1])for(const zz of [z-.85,z+.85])cyl(.1,.14,3,wood,xx,-.8,zz,world,8);}

const rectilinearWater=sceneWater;
sceneWater=function(){const before=new Set(world.children);rectilinearWater();const w=currentDef.water;if(!w||!water)return;
 // Remove the old straight, overlapping retaining boxes; the sculpted banks replace them.
 for(const o of world.children.slice())if(!before.has(o)&&o!==water&&o.geometry?.type==='BoxGeometry'&&Math.abs(Math.abs(o.position.x-w.x)-w.width/2-.25)<.15){world.remove(o);o.geometry.dispose();}
 const v=[],uv=[],idx=[],n=180;for(let j=0;j<=n;j++){const z=-90+j,bank=riverBanks(z);for(let i=0;i<=12;i++){const u=i/12;v.push(bank.left-.35+(bank.right-bank.left+.7)*u,0,z);uv.push(u,j/n)}}for(let j=0;j<n;j++)for(let i=0;i<12;i++){const a=j*13+i;idx.push(a,a+13,a+1,a+1,a+13,a+14)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();water.geometry.dispose();water.geometry=geo;water.position.set(0,WATER_Y,0);water.userData.curvedBanks=true;
 const rock=mat('#a7ae8c',{map:assets.ruin,roughness:1});for(let z=-30;z<31;z+=.8)for(const side of [-1,1]){const bank=riverBanks(z),x=(side<0?bank.left:bank.right)+side*.36;let nearBridge=false;for(const b of currentDef.bridges)if(Math.abs(z-b.z)<b.d/2+.5)nearBridge=true;if(nearBridge)continue;const h=landHeightAt(x,z),s=.22+(Math.sin(z*7.1+side)*.5+.5)*.23,m=ball(s,rock,x,h-.14,z);m.scale.set(1.15,.72,1);m.rotation.set(.2,Math.sin(z)*1.6,.14);m.userData.bankRock=true;}
};
const sculptWorld=buildWorld;
buildWorld=function(area,spawn){naturalField=null;stairSurfaces=[];sculptWorld(area,spawn);
 // Replace artificial wilderness retaining slabs with exposed, mossy rock outcrops.
 if(['riverwalk','forest'].includes(state.area))for(const o of world.children.slice()){const p=o.geometry?.parameters;if(o.geometry?.type!=='BoxGeometry'||!p)continue;if((Math.abs(p.width-2.05)<.01&&Math.abs(o.position.z+12)<.01)||(Math.abs(p.width-5.7)<.01&&Math.abs(o.position.z+6.3)<.01)){const x=o.position.x,z=o.position.z;world.remove(o);o.geometry.dispose();for(let i=0;i<4;i++){const xx=x+(i-1.5)*.48,h=landHeightAt(xx,z),m=ball(.42,mat('#adb493',{map:assets.ruin}),xx,h-.18,z+.1*Math.sin(i*2.4));m.scale.set(1.35,.8,1.1)}}}
 sun.shadow.needsUpdate=true;
};
