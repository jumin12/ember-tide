// The original PixelLab paintings supply the distant scenery. A calibrated
// relief mesh, native physical ground and authored mid-ground objects meet
// on one stage; the reference camera is fixed while the real camera moves.
const hybrid90={pending:new Map(),palettes:new Map(),loaded:0,builds:0};
const hybridInstanceBefore90=arenaInstance88;
arenaInstance88=function(b,key,geometry,material,position,scale,...a){
 if(b.hybridKey90&&key.startsWith('poiPlant89-')){scale=scale.clone().multiplyScalar(.56);position=position.clone();position.y=arenaFloor88(b,position.x,position.z)+.44*scale.y;material.color.set(key.endsWith('fern')?'#a4ba8a':'#c5d0b4');}
 if(b.hybridKey90&&key==='fineGrass89')material.color.set(b.spec.autumn?'#9c965a':'#789553');
 return hybridInstanceBefore90(b,key,geometry,material,position,scale,...a);
};
function paintingKey90(stage,phase){return BATTLE_STAGE_PAIRS55[stage]?.[phase];}
function preparePainting90(stage,phase){
 const key=paintingKey90(stage,phase);if(textures[key])return Promise.resolve(textures[key]);if(hybrid90.pending.has(key))return hybrid90.pending.get(key);
 const task=(async()=>{const image=new Image();image.src=assets.images[key];await image.decode();const t=new THREE.Texture(image);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;t.userData.pinnedMap17=true;t.needsUpdate=true;textures[key]=t;hybrid90.loaded++;return t;})();hybrid90.pending.set(key,task);return task;
}
const hybridBeginBefore90=beginBattle;
beginBattle=function(...a){const result=hybridBeginBefore90(...a);if(encounter53.phase==='enter')preparePainting90(encounter53.selected,battlePhase55()).catch(e=>console.error('Battle scenery: '+e.message));return result;};
const hybridCoverBefore90=advanceEncounterCover53;
advanceEncounterCover53=function(dt){const c=encounter53;if(c.phase==='enter'&&!c.swapped&&!textures[paintingKey90(c.selected,battlePhase55())]&&c.time+dt>c.duration*.44){if(c.time<c.duration*.44)hybridCoverBefore90(c.duration*.44-c.time);return;}return hybridCoverBefore90(dt);};
function paintingPalette90(texture){
 if(hybrid90.palettes.has(texture))return hybrid90.palettes.get(texture);const c=document.createElement('canvas');c.width=64;c.height=36;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(texture.image,0,0,64,36);const rgba=ctx.getImageData(0,0,64,36).data;
 const colour=(rect)=>{const v=new THREE.Color(0,0,0),s=new THREE.Color();let n=0;for(let y=Math.floor(rect[1]*36);y<Math.ceil(rect[3]*36);y++)for(let x=Math.floor(rect[0]*64);x<Math.ceil(rect[2]*64);x++){const i=((35-y)*64+x)*4;s.setRGB(rgba[i]/255,rgba[i+1]/255,rgba[i+2]/255,THREE.SRGBColorSpace);v.add(s);n++;}return v.multiplyScalar(1/n);};
 const low=new THREE.CanvasTexture(c);low.colorSpace=THREE.SRGBColorSpace;low.magFilter=low.minFilter=THREE.LinearFilter;low.userData.pinnedMap17=true;const q={low,ground:colour([.3,.04,.7,.22]),sky:colour([.32,.81,.68,.97])};hybrid90.palettes.set(texture,q);return q;
}
const HYBRID_RELIEF90={
 waterfall:[[.08,.7,.19,.4,64],[.93,.7,.19,.4,66],[.6,.70,.2,.25,150]],woodland:[[.10,.6,.25,.5,47],[.88,.64,.27,.5,49]],orchard:[[.12,.56,.2,.43,58],[.9,.56,.18,.45,60],[.5,.6,.15,.2,125]],ruins:[[.12,.70,.19,.4,64],[.82,.72,.24,.42,69]],cavern:[[.06,.6,.25,.5,60],[.92,.65,.26,.5,57]],mountain:[[.06,.62,.18,.45,58],[.92,.65,.2,.4,62]],snow:[[.12,.65,.2,.4,64],[.92,.6,.22,.45,64]],coast:[[.08,.63,.22,.37,60]],royalRoad:[[.12,.63,.22,.4,57],[.9,.65,.20,.4,65]],moonlit:[[.1,.65,.25,.5,50],[.9,.65,.25,.5,50]],grassWindmill:[[.19,.55,.17,.28,85]],grassStones:[[.1,.3,.2,.16,62]],grassBirch:[[.08,.65,.16,.5,58],[.92,.65,.17,.5,62]]
};
function makeHybridLandscape90(b){
 const q=stageDepth59,c=encounter53,texture=textures[paintingKey90(c.selected,c.phase55)],reference=camera.clone();reference.updateMatrixWorld();b.reference90=reference;b.plate90=texture;b.palette90=paintingPalette90(texture);b.projector90=new THREE.Matrix4().multiplyMatrices(reference.projectionMatrix,reference.matrixWorldInverse);
 const aspect=innerWidth/innerHeight,imageAspect=texture.image.width/texture.image.height,span=.50,cropX=Math.min(1,aspect/imageAspect),cropY=1,offset=.5;b.crop90=new THREE.Vector2(cropX,cropY);b.offset90=new THREE.Vector2(.5,offset);
 // The painting begins beyond the physical field, rather than covering the
 // close floor. Its landmarks occupy the distant upper half of the view.
 const rear=V3(c.center.x,c.floorY,c.center.z-80).project(reference),bottom=clamp(rear.y*.5+.5-.11,.42,.68);b.window90=new THREE.Vector2(bottom,span);
 const eye=reference.position.clone(),ray=(u,v)=>V3((u-.5)*2,(v-.5)*2,.5).unproject(reference).sub(eye).normalize(),seam=.20;
 const point=(u,v)=>{const r=ray(u,bottom+v*span),low=ray(u,bottom+seam*span),at=(c.floorY-.026-eye.y)/low.y;let d;
  if(v<seam&&r.y<-.003)d=(c.floorY-.026-eye.y)/r.y;
  else {d=mix(clamp(at,120,230),440,smooth(seam,.96,v));const U=(u-.5)*cropX+.5,V=v;for(const[x,y,sx,sy,depth]of HYBRID_RELIEF90[c.selected]??HYBRID_RELIEF90.waterfall){const a=Math.exp(-(((U-x)/sx)**2+((V-y)/sy)**2));d=mix(d,Math.max(170,depth*2.4),a*.42*smooth(.24,.50,v));}}
  return eye.clone().addScaledVector(r,clamp(d,5,310)).sub(b.group.position);
 };
 const nx=128,ny=82,p=[],uv=[],index=[];for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const u=mix(-.30,1.30,i/nx),v=mix(-.22,1.70,j/ny);p.push(...point(u,v));uv.push((u-.5)*cropX+.5,v);}for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,d=a+nx+1;index.push(a,d,a+1,a+1,d,d+1);}
 const g=geometry59(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();
 const m=material59(new THREE.ShaderMaterial({side:THREE.DoubleSide,depthWrite:true,uniforms:{map:{value:texture},sky:{value:b.palette90.sky},time:q.time,water:{value:b.spec.lake||b.spec.river||b.spec.sea?1:0},foliage:{value:b.spec.snow||b.spec.cave?0:1},fall:{value:b.spec.falls?1:0}},vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D map;uniform vec3 sky;uniform float time,water,foliage,fall;varying vec2 v;
 vec3 film90(vec3 y){y=clamp(y,.0001,.97);vec3 a=2.51-2.43*y,b=.03-.59*y;return(-b+sqrt(b*b+4.*a*.14*y))/(2.*a);}
 void main(){vec2 uv=clamp(v,vec2(.001),vec2(.999));vec3 original=texture2D(map,uv).rgb;float green=smoothstep(.008,.075,original.g-max(original.r*.89,original.b*.96));float canopy=smoothstep(.35,.65,uv.y)*smoothstep(.13,.40,abs(uv.x-.5));uv.x+=sin(time*.65+uv.y*39.+uv.x*27.)*.00065*green*canopy*foliage;
 float blue=smoothstep(.02,.13,original.b-original.r)*(1.-smoothstep(.58,.67,uv.y))*smoothstep(.26,.37,uv.y)*water;uv.x+=sin(uv.y*240.+time*1.1)*.0008*blue;float cloud=smoothstep(.76,.9,uv.y)*smoothstep(.22,.48,min(original.r,min(original.g,original.b)))*(1.-smoothstep(.80,.96,max(original.r,max(original.g,original.b))));uv.x+=sin(time*.025)*.0016*cloud;
 float cascade=fall*smoothstep(.45,.53,uv.x)*(1.-smoothstep(.69,.76,uv.x))*smoothstep(.53,.64,uv.y)*(1.-smoothstep(.92,.97,uv.y));uv.y+=sin(uv.y*210.+time*4.9+uv.x*23.)*.00065*cascade;vec3 rgb=texture2D(map,uv).rgb;rgb+=blue*pow(max(0.,sin(uv.x*350.+sin(uv.y*95.)*3.+time)),20.)*.010;
 rgb=mix(rgb,sky,smoothstep(.94,1.,v.y));gl_FragColor=vec4(film90(rgb),1.);
 }`}));const o=new THREE.Mesh(g,m);o.frustumCulled=false;o.name='Original PixelLab painting on calibrated landscape depth';b.group.add(o);b.landscape90=o;
}
function blendHybridGround90(b){
 const o=b.group.children.find(o=>o.name==='Actual level ground and carved water banks'),g=o.geometry,p=g.attributes.position,index=g.index.array,keep=[];for(let i=0;i<index.length;i+=3)if(Math.max(p.getZ(index[i]),p.getZ(index[i+1]),p.getZ(index[i+2]))> -155)keep.push(index[i],index[i+1],index[i+2]);g.setIndex(keep);g.computeBoundingSphere();
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,p.getX(i)*.22,p.getZ(i)*.22);
 if(b.spec.cave){const colour=g.attributes.color,c=new THREE.Color('#c9c7b7');for(let i=0;i<colour.count;i++)colour.setXYZ(i,c.r,c.g,c.b);}
 const m=o.material,before=m.onBeforeCompile,key=m.customProgramCacheKey.bind(m);m.transparent=true;m.alphaTest=.01;m.depthWrite=true;
 m.onBeforeCompile=function(s,...a){before.call(this,s,...a);Object.assign(s.uniforms,{hybridPlate90:{value:b.plate90},hybridProjector90:{value:b.projector90},hybridCrop90:{value:b.crop90},hybridWindow90:{value:b.window90},hybridOrigin90:{value:b.group.position}});s.fragmentShader='uniform sampler2D hybridPlate90;uniform mat4 hybridProjector90;uniform vec2 hybridCrop90,hybridWindow90;uniform vec3 hybridOrigin90;vec3 inverseFilm90(vec3 y){y=clamp(y,.0001,.97);vec3 a=2.51-2.43*y,b=.03-.59*y;return(-b+sqrt(b*b+4.*a*.14*y))/(2.*a);}\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`vec4 projected90=hybridProjector90*vec4(groundWorld89,1.);vec2 screen90=projected90.xy/projected90.w*.5+.5,uv90=clamp(vec2((screen90.x-.5)*hybridCrop90.x+.5,(screen90.y-hybridWindow90.x)/hybridWindow90.y),vec2(.001),vec2(.999));float z90=groundWorld89.z-hybridOrigin90.z,join90=1.-smoothstep(-88.,-42.,z90);vec3 detail90=texture2D(hybridPlate90,uv90).rgb;outgoingLight=mix(outgoingLight,inverseFilm90(detail90),join90);diffuseColor.a*=smoothstep(-155.,-133.,z90);\n#include <opaque_fragment>`);
 };m.customProgramCacheKey=()=>key()+'-hybrid-ground90';
}
function dressHybrid90(b){
 const s=b.spec,r=b.rng;
 const front=new THREE.DirectionalLight(b.night?'#a4c9ed':'#fff0d0',b.night?.8:1.2);front.position.set(-6,10,16);front.target.position.set(0,0,0);b.group.add(front,front.target);
 if(s.trees&&!s.cave){for(const side of[-1,1]){arenaTree88(b,side*19,-3,1.9,s.trees);for(let i=0;i<(s.dense?12:6);i++){const x=side*(19+r()*13),z=-15-r()*22;arenaTree88(b,x,z,.95+r()*.7,s.trees);}}}
 for(let i=0;i<(s.dense?18:12);i++){const x=(i%2?-1:1)*(16+r()*13),z=-14+r()*23;arenaRock88(b,x,z,.7+r()*1.3,.6+r()*1.2,.6+r()*1.3,[0,1,3,6,7,9][i%6]);}
 for(const side of[-1,1])for(let i=0;i<9;i++){const x=side*(20+r()*9),z=-24-r()*30;arenaRock88(b,x,z,1.1+r()*1.4,.7+r()*1.0,.8+r()*1.5,[0,1,3,6,7,9][i%6]);if(s.trees&&i%2===0)arenaTree88(b,x+side*2,z-2,.75+r()*.5,s.trees);}
 if(s.trees&&!s.snow)arenaLog89(b,-19,-12,.8,.3);
 if(s.ruins){arenaArch88(b,-18,-23,5,3.5);for(let i=0;i<5;i++){const x=-21+i*1.8,z=-13-(i%2);arenaBox88(b,[x,arenaFloor88(b,x,z)+.6,z],[1.5,1.2,1.6],'wallA','#bdc4ac');}}
 if(s.royal){for(const side of[-1,1]){arenaBox88(b,[side*20,1,-21],[2,2,8],'wallA','#c8cab1');for(let i=0;i<3;i++)arenaBox88(b,[side*20,2.2,-24+i*3],[2.4,.5,1.7],'wall','#d2d1bd');}}
 if(s.farm){arenaFence88(b,22,-14,18,Math.PI/2);arenaFence88(b,-22,-20,19,.2);arenaHouse88(b,25,-35,7.5,6);}
 if(s.windmill)arenaWindmill88(b,-24,-46);
 if(s.stones||s.elder)for(const side of[-1,1]){arenaRock88(b,side*19,-21,1.1,2.4,1.0,2);b.counts.standingStones++;}
 if(s.cave){const g=arenaGeometry88(b,'hybridCrystal90',()=>new THREE.CylinderGeometry(0,.58,1,6,1)),m=arenaMaterial88(b,'lightFacets','#a5d4df',{emissive:'#267caa'});for(const side of[-1,1])for(let i=0;i<6;i++){const x=side*(17.5+i*.65),z=-14-(i%3)*1.3,h=1.1+(i%4)*.6;arenaInstance88(b,'hybridCrystal90',g,m,V3(x,arenaFloor88(b,x,z)+h*.5,z),V3(.4,h,.4),new THREE.Quaternion().setFromAxisAngle(V3(0,0,1),side*.18));b.counts.crystals++;}for(const x of[-18,18]){const light=new THREE.PointLight('#5fc8ed',12,15,2);light.position.set(x,2,-15);b.group.add(light);}}
 arenaPlants89(b);arenaParticles89(b);arenaRays89(b);for(const side of[-1,1]){arenaRock88(b,side*13.8,13,1.2,.7,1.1,3);if(!s.snow&&!s.cave)for(let j=0;j<6;j++){const x=side*(12+j*.6),z=12+j%2,g=arenaGeometry88(b,'poiPlant89-fern',()=>plantGeometry('fern').clone()),scale=.6+r()*.3;arenaInstance88(b,'poiPlant89-fern',g,arenaPlantMaterial89(b,'fern'),V3(x,arenaFloor88(b,x,z)+.44*scale,z),V3(scale,scale,scale));}}
}
const buildHybridBefore90=buildStageScenery59;
const hybridHeightBefore90=arenaHeight88;
arenaHeight88=function(b,x,z){return b.hybridKey90?Math.max(0,arenaNoise89(x,z))*.45*smooth(19,35,Math.abs(x)):hybridHeightBefore90(b,x,z);};
buildStageScenery59=function(){
 const c=encounter53,q=stageDepth59;if(!c.active||!battle)return;const texture=textures[paintingKey90(c.selected,c.phase55)];if(!texture)return buildHybridBefore90();
 const key=[c.selected,c.phase55,innerWidth,innerHeight].join('|');if(q.group&&arena88.current?.hybridKey90===key)return;
 clearStageDepth59();q.stage=c.selected;q.aspect=camera.aspect;q.stats.builds++;q.time.value=clock;q.group=new THREE.Group();q.group.position.set(c.center.x,c.floorY,c.center.z);q.group.name='Hybrid painting and physical combat stage';c.scene.add(q.group);
 const b={key,hybridKey90:key,group:q.group,spec:ARENAS88[c.selected],rng:seeded(90031+Object.keys(ARENAS88).indexOf(c.selected)*107),night:c.phase55==='night',mobile:mobileBattle69(),materials:new Map(),geometries:new Map(),batches:new Map(),ownedTextures:[],counts:{trees:0,rocks:0,cliffs:0,crystals:0,buildings:0,arches:0,bridges:0,windmills:0,standingStones:0,flowers:0,grass:0,water:0,waterfalls:0,instances:0,batches:0,groundVertices:0}};
 arena88.current=b;arena88.builds++;hybrid90.builds++;c.resources.backdrop.visible=c.resources.floor.visible=false;q.occluders=[];arenaLight89(b);c.scene.fog=null;c.scene.background=new THREE.Color('#17242c');b.coverage89={value:.20};b.skySun89={value:sun.position.clone().sub(sun.target.position).normalize()};makeHybridLandscape90(b);arenaGround88(b);blendHybridGround90(b);dressHybrid90(b);flushArena88(b);q.group.updateMatrixWorld(true);q.landscape=b.landscape90;
 q.summary={hybrid90:true,originalPainting:paintingKey90(c.selected,c.phase55),physicalGround:true,depthRelief:true,stage:c.selected,phase:c.phase55,...b.counts};
};
