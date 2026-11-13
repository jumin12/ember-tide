// Yard materials use the same native PBR sources as settlements, with opaque
// grass-to-paving transitions and a physically closed garden boundary.
const HOME_GARDEN_PATHS139=[[[10,15],[4,12],[0,7],[0,2]],[[0,10],[-7,9],[-12,13]]];
let homePathSegments139=null;
function homePathDistance139(x,z){
 if(!homePathSegments139)homePathSegments139=HOME_GARDEN_PATHS139.flatMap(points=>{const c=new THREE.CatmullRomCurve3(points.map(([x,z])=>V3(x,0,z))),rows=[];let a=c.getPoint(0);for(let i=1;i<=32;i++){const b=c.getPoint(i/32);rows.push([[a.x,a.z],[b.x,b.z]]);a=b;}return rows;});
 let d=Infinity;for(const [a,b]of homePathSegments139)d=Math.min(d,segmentDistance(x,z,a,b));return d;
}
function homeGardenMaterial139(kind='lawn'){
 const id='home-garden139-'+kind;if(matCache.has(id))return matCache.get(id);
 const m=new THREE.MeshStandardMaterial({map:textures[kind==='lawn'?'grass':'cobble'],roughness:.96,metalness:0});m.userData={textureKey:kind==='lawn'?'grass':'cobble',homeGround139:true};addCloudLighting(m);lightPaintedSurface82(m);materialFinish103(m);
 const before=m.onBeforeCompile,key=m.customProgramCacheKey();m.onBeforeCompile=function(s,...a){before.call(this,s,...a);s.uniforms.homeLawn139={value:textures.grass};s.uniforms.homeMoss139={value:environment102.maps.get('moss')};
  s.vertexShader='varying vec3 homeWorld139;varying vec2 homeUv139;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nhomeWorld139=(modelMatrix*vec4(position,1.)).xyz;homeUv139=uv;');
  s.fragmentShader='uniform sampler2D homeLawn139,homeMoss139;varying vec3 homeWorld139;varying vec2 homeUv139;\nvec3 homeLawnPigment139(vec2 p){float patch139=.5+.25*sin(p.x*.19+sin(p.y*.12))+.25*sin(p.y*.16-p.x*.07);vec3 a=texture2D(homeLawn139,p*.17).rgb,b=texture2D(homeLawn139,mat2(.8,-.6,.6,.8)*p*.19+4.7).rgb;vec3 lawn=mix(a,b,smoothstep(.22,.77,patch139))*vec3(.67,.73,.61);vec3 moss=texture2D(homeMoss139,p*.13+7.3).rgb*vec3(.55,.66,.52);return mix(lawn,moss,smoothstep(.58,.86,patch139)*.16);}\n'+s.fragmentShader;
  const fill=kind==='lawn'?'vec3 housingAlbedo139=homeLawnPigment139(homeWorld139.xz);':`vec3 paving139=texture2D(map,homeWorld139.xz*.16).rgb*vec3(.86,.87,.78);float edge139=${kind==='court'?'1.-smoothstep(.78,1.,length((homeUv139-.5)*2.))':'smoothstep(0.,.13,homeUv139.x)*(1.-smoothstep(.87,1.,homeUv139.x))'};vec3 housingAlbedo139=mix(homeLawnPigment139(homeWorld139.xz),paving139,edge139);`;
  s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',fill+'diffuseColor.rgb*=housingAlbedo139;');
 };m.customProgramCacheKey=()=>key+'-authored-garden139-'+kind;matCache.set(id,m);return m;
}
function homeGardenBoundary139(q){
 const points=[[-21,-20],[21,-20],[21,23],[-21,23],[-21,-20]];
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(length/3),dx=(b[0]-a[0])/n,dz=(b[1]-a[1])/n;
  for(let j=0;j<n;j++){const x=a[0]+dx*j,z=a[1]+dz*j;homeBox139(x,.68,z,.22,1.36,.22,'wood',q.wood);homeBox139(x,.12,z,.46,.24,.46,'wall','#b1b9a4');for(const y of[.57,1.12]){const rail=homeBox139(x+dx/2,y,z+dz/2,.13,.13,length/n+.02,'wood',q.wood);rail.rotation.y=Math.atan2(dx,dz);}obstacle(x+dx/2,z+dz/2,Math.abs(dx)+.20,Math.abs(dz)+.20,'garden boundary');}
 }
 world.userData.gardenBoundary139={closed:true,bounds:[-21,21,-20,23],physical:true};
}
function dressHomePortalCourt139(q){
 const court=mesh(new THREE.CircleGeometry(3.65,64),homeGardenMaterial139('court'),11,.033,15);court.rotation.x=-Math.PI/2;court.castShadow=false;court.userData.frontagePath110=true;
 for(const [x,z]of[[15,11],[16,18]]){const pot=homeDecorModel139('homePlant139',world,q);pot.position.set(x,0,z);}
 const bench=new THREE.Group();bench.position.set(-12,.02,12);bench.rotation.y=.30;world.add(bench);for(const x of[-1.1,1.1])for(const z of[-.35,.35])homeBox139(x,.35,z,.14,.7,.14,'wood',q.wood,bench);for(const z of[-.34,0,.34])homeBox139(0,.76,z,2.8,.14,.27,'wood',q.wood,bench);for(const y of[1.05,1.38])homeBox139(0,y,-.48,2.8,.22,.13,'wood',q.wood,bench);for(const x of[-1.2,1.2])homeBox139(x,1,-.48,.14,1.3,.14,'wood',q.wood,bench);obstacle(-12,12,3.2,1.6,'garden bench');
}
