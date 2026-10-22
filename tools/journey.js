// Connected scene authoring, audited navigation, village life and reference-driven UI.
const journeyLegacy={update,setupInput,interact,renderMenu,openMenu,closeMenu,startBattle,cleanupBattle,battleItems,loadGame,begin,renderText:window.render_game_to_text,installWater};
let arenaActive=false,arenaReturn=null,currentDef=null,nav=null,playerRoute=[],routeArrival=null,transitionLock=0,transitioning=false;
let villageActors=[],lifeProps=[],skyClouds=[],sceneRoads=[],buildingPlots=[],sceneDecor=[],battlePage='commands',commandIndex=0,lastBattleTurn=-1,formationNarrow=null;
const sceneOrder=['village','riverwalk','highroad','forest','shrine'];
const route=(points,width=3)=>({points:points.map(([x,z])=>({x,z})),width});
const sceneDefs={
 village:{name:'Willowmere',subtitle:'Riverhold settlement',seed:936,spawn:{x:7,z:5.4},water:{x:-10,width:9.3},
  roads:[route([[-28,3],[29,3]],4.5),route([[14,3],[14,-18]],4.2),route([[-4,-17],[24,-17]],2.6),route([[-17,3],[-17,-14],[-23,-14]],2.5),route([[14,3],[14,17],[28,17]],2.4)],
  exits:[{id:'east',x:28,z:3,to:'riverwalk',entry:'west',facing:'east',label:'Riverbank Walk'}],
  entries:{east:{x:25,z:3}},
  height(x,z){if(x>-14.7&&x<-5.3)return -2.05;if(z<-13&&x>-5&&x<27)return 1.5;if(z<=-10&&z>=-13&&Math.abs(x-14)<2.25)return Math.floor((-z-10)*2)*.25;return 0},
  bridges:[{x:-10,z:3,w:10.3,d:3.6,y:.4,type:'wood'}]},
 riverwalk:{name:'Riverbank Walk',subtitle:'The old mill steps',seed:1752,spawn:{x:-24,z:3},water:{x:-10,width:9.3},
  roads:[route([[-29,3],[-17,3],[-3,3],[7,3],[7,-12],[0,-19],[0,-25]],3.5),route([[7,3],[18,3],[21,-3]],2.4)],
  exits:[{id:'west',x:-28,z:3,to:'village',entry:'east',facing:'west',label:'Willowmere'},{id:'north',x:0,z:-23,to:'highroad',entry:'west',facing:'north',label:'Crown Highroad'}],
  entries:{west:{x:-24,z:3},north:{x:0,z:-19}},
  height(x,z){if(x>-14.7&&x<-5.3)return -2.05;if(x>-5&&z<-5)return Math.min(2,Math.floor(Math.max(0,-z-5)/.875)*.25);return 0},
  bridges:[{x:-10,z:3,w:10.3,d:3.4,y:.4,type:'stone'}]},
 highroad:{name:'Crown Highroad',subtitle:'Above the silver valley',seed:3159,spawn:{x:-24,z:8},water:{x:18,width:5.8},
  roads:[route([[-29,8],[-13,8],[-4,2],[6,-4],[29,-4]],3.5),route([[-4,2],[-4,-6],[3,-9]],2.6)],
  exits:[{id:'west',x:-28,z:8,to:'riverwalk',entry:'north',facing:'west',label:'Riverbank Walk'},{id:'east',x:28,z:-4,to:'forest',entry:'west',facing:'east',label:'Whispering Wood'}],
  entries:{west:{x:-24,z:8},east:{x:24,z:-4}},
  height(x,z){if(x>14.9&&x<21.1)return -2.05;const ridge=3.1;if(z>13)return Math.max(0,ridge-(z-13)*.75);if(z<-16)return ridge+Math.min(7,(-z-16)*.55);return ridge},
  bridges:[{x:18,z:-4,w:7,d:3.5,y:3.3,type:'stone'}]},
 forest:{name:'Whispering Wood',subtitle:'The lantern trail',seed:671,spawn:{x:-24,z:6},water:{x:-11,width:5.8},
  roads:[route([[-29,6],[-17,6],[-4,6],[0,3],[0,-25]],3.5),route([[0,3],[4,3],[7,-1]],2.5),route([[-4,6],[-4,0],[-10,0]],2)],
  exits:[{id:'west',x:-28,z:6,to:'highroad',entry:'east',facing:'west',label:'Crown Highroad'},{id:'north',x:0,z:-23,to:'shrine',entry:'south',facing:'north',label:'The Ward Shrine'}],
  entries:{west:{x:-24,z:6},north:{x:0,z:-19}},
  height(x,z){if(x>-14&&x<-8){if(Math.hypot(x+10,z)<1.5)return .4;return -2.05}if(z<-6&&x>-8){if(Math.abs(x)<2.7&&z>-12)return Math.min(1.5,Math.floor((-z-6)*2)*.125);return 1.5}return 0},
  bridges:[{x:-11,z:6,w:6.8,d:3.2,y:.3,type:'wood'},{x:-9,z:0,w:3.4,d:1.6,y:.5,type:'wood'}]},
 shrine:{name:'The Ward Shrine',subtitle:'Where the old light waits',seed:8542,spawn:{x:0,z:20},water:{x:-15,width:5.8},
  roads:[route([[0,25],[0,4],[0,-14]],4.1),route([[0,6],[8,6],[11,1]],2.5)],
  exits:[{id:'south',x:0,z:23,to:'forest',entry:'north',facing:'south',label:'Whispering Wood'}],entries:{south:{x:0,z:19}},
  height(x,z){if(x>-18&&x<-12)return -2.05;if(z<1&&Math.abs(x)<12){if(Math.abs(x)<2.8&&z>-6)return Math.min(2.5,Math.floor((1-z)*2)*.25);return 2.5}return 0},bridges:[]}
};
const sceneBounds={minX:-29.5,maxX:29.5,minZ:-24.8,maxZ:24.8};
function segmentDistance(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-a.x-t*dx,z-a.z-t*dz)}
function onRoad(x,z,pad=0){return sceneRoads.some(r=>r.points.slice(1).some((b,i)=>segmentDistance(x,z,r.points[i],b)<r.width/2+pad))}
landHeightAt=function(x,z){return arenaActive?0:(sceneDefs[state.area]||sceneDefs.village).height(x,z)};
heightAt=function(x,z){if(arenaActive)return 0;const def=sceneDefs[state.area]||sceneDefs.village;for(const b of def.bridges)if(Math.abs(x-b.x)<b.w/2+.15&&Math.abs(z-b.z)<b.d/2)return b.y;return def.height(x,z)};
function staticBlocked(x,z,r=.28){const h=heightAt(x,z);if(x<sceneBounds.minX||x>sceneBounds.maxX||z<sceneBounds.minZ||z>sceneBounds.maxZ||h<-.6)return true;for(const [dx,dz] of [[r,0],[-r,0],[0,r],[0,-r]]){const nh=heightAt(x+dx,z+dz);if(nh<-.6||Math.abs(nh-h)>.61)return true}return obstacles.some(o=>Math.abs(x-o.x)<o.w+r&&Math.abs(z-o.z)<o.d+r)}
collide=function(x,z){return staticBlocked(x,z)||player&&Math.abs(heightAt(x,z)-heightAt(player.x,player.z))>.61};
function makeNavigation(){
 const step=.5,minX=-29,minZ=-24,nx=117,nz=97,grid=new Uint8Array(nx*nz),heights=new Float32Array(nx*nz);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=minX+i*step,z=minZ+j*step;grid[k]=staticBlocked(x,z,.44)?0:1;heights[k]=heightAt(x,z)}
 nav={step,minX,minZ,nx,nz,grid,heights};return nav;
}
function navPoint(x,z){const n=nav;let i=clamp(Math.round((x-n.minX)/n.step),0,n.nx-1),j=clamp(Math.round((z-n.minZ)/n.step),0,n.nz-1);if(n.grid[j*n.nx+i])return j*n.nx+i;for(let r=1;r<=8;r++)for(let dz=-r;dz<=r;dz++)for(let dx=-r;dx<=r;dx++){const a=i+dx,b=j+dz;if(a>=0&&b>=0&&a<n.nx&&b<n.nz&&n.grid[b*n.nx+a])return b*n.nx+a}return -1}
function findPath(start,end){
 if(!nav)return [];const n=nav,from=navPoint(start.x,start.z),to=navPoint(end.x,end.z);if(from<0||to<0)return [];if(from===to)return [{x:n.minX+(to%n.nx)*n.step,z:n.minZ+Math.floor(to/n.nx)*n.step}];
 const total=n.nx*n.nz,g=new Float32Array(total);g.fill(Infinity);const came=new Int32Array(total);came.fill(-1);const done=new Uint8Array(total),heap=[];
 const h=k=>Math.hypot(k%n.nx-to%n.nx,Math.floor(k/n.nx)-Math.floor(to/n.nx));
 function push(k,f){let i=heap.length;heap.push({k,f});while(i){const p=(i-1)>>1;if(heap[p].f<=f)break;heap[i]=heap[p];i=p;heap[i]={k,f}}}
 function pop(){const top=heap[0],last=heap.pop();if(heap.length){let i=0;heap[0]=last;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;heap[i]=last}}return top.k}
 g[from]=0;push(from,h(from));let found=false;
 while(heap.length){const k=pop();if(done[k])continue;if(k===to){found=true;break}done[k]=1;const x=k%n.nx,z=Math.floor(k/n.nx);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const a=x+dx,b=z+dz;if(a<0||b<0||a>=n.nx||b>=n.nz)continue;const q=b*n.nx+a;if(!n.grid[q]||done[q]||Math.abs(n.heights[q]-n.heights[k])>.61)continue;if(dx&&dz&&(!n.grid[z*n.nx+a]||!n.grid[b*n.nx+x]))continue;if(!navEdgeClear(k,q))continue;const score=g[k]+(dx&&dz?1.4142:1)+Math.abs(n.heights[q]-n.heights[k])*.2;if(score<g[q]){g[q]=score;came[q]=k;push(q,score+h(q))}}
 }
 if(!found)return [];const result=[];for(let k=to;k!==from&&k>=0;k=came[k])result.push({x:n.minX+(k%n.nx)*n.step,z:n.minZ+Math.floor(k/n.nx)*n.step});result.push({x:n.minX+(from%n.nx)*n.step,z:n.minZ+Math.floor(from/n.nx)*n.step});return result.reverse();
}
function walkTo(x,z,onArrival=null){let end;if(typeof x==='object'){end={x:x.x,z:x.z};if(typeof z==='function')onArrival=z}else end={x,z};const result=findPath(player,end);if(!result.length){notify('That place is beyond the walkable path.');return false}playerRoute=result;routeArrival=onArrival;targetPoint=null;return true}
function safeSpawn(p){const k=navPoint(p.x,p.z);return k<0?{x:7,z:5.5}:{x:nav.minX+(k%nav.nx)*nav.step,z:nav.minZ+Math.floor(k/nav.nx)*nav.step}}
function interactStand(o){if(!staticBlocked(o.x,o.z))return {x:o.x,z:o.z};for(const [dx,dz] of [[0,2],[2,0],[-2,0],[0,-2],[1.5,1.5],[-1.5,1.5]])if(!staticBlocked(o.x+dx,o.z+dz))return {x:o.x+dx,z:o.z+dz};return {x:o.x,z:o.z+2.5}}
function drawRoad(r){
 const vertices=[],uvs=[];let length=0;
 for(let s=1;s<r.points.length;s++){const a=r.points[s-1],b=r.points[s],dist=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(dist/.45)),nx=-(b.z-a.z)/dist*r.width/2,nz=(b.x-a.x)/dist*r.width/2;
  for(let i=0;i<n;i++){const t=i/n,u=(i+1)/n,m=(t+u)/2,mx=a.x+(b.x-a.x)*m,mz=a.z+(b.z-a.z)*m;if(landHeightAt(mx,mz)<-.6)continue;const p=[{x:a.x+(b.x-a.x)*t+nx,z:a.z+(b.z-a.z)*t+nz},{x:a.x+(b.x-a.x)*t-nx,z:a.z+(b.z-a.z)*t-nz},{x:a.x+(b.x-a.x)*u+nx,z:a.z+(b.z-a.z)*u+nz},{x:a.x+(b.x-a.x)*u-nx,z:a.z+(b.z-a.z)*u-nz}];for(const k of [0,2,1,1,2,3]){vertices.push(p[k].x,heightAt(p[k].x,p[k].z)+.06,p[k].z);uvs.push(k%2?r.width/2.4:0,(length+(k<2?t:u)*dist)/2.4)}}length+=dist;
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();const m=new THREE.Mesh(g,mat('#c4c8b4',{map:assets.stone,bumpMap:assets.stone,bumpScale:.07,roughness:.88}));m.userData.walkSurface=true;m.receiveShadow=true;world.add(m);
 for(let i=1;i<r.points.length-1;i++)if(landHeightAt(r.points[i].x,r.points[i].z)>-.6)groundDisc(r.points[i].x,r.points[i].z,r.width*.5,assets.stone,'#c4bd9f');
}
function groundDisc(x,z,r,texture=assets.stone,color='#c9c2a6'){
 const g=new THREE.CircleGeometry(r,40);g.rotateX(-Math.PI/2);const a=g.attributes.position;for(let i=0;i<a.count;i++)a.setY(i,heightAt(x+a.getX(i),z+a.getZ(i))+.05);g.computeVertexNormals();const m=new THREE.Mesh(g,mat(color,{map:texture,bumpMap:texture,bumpScale:.055}));m.position.set(x,0,z);m.receiveShadow=true;world.add(m);return m;
}
function atHeight(fn,x,z,...args){const before=world.children.length;fn(x,z,...args);const h=landHeightAt(x,z);for(const m of world.children.slice(before))m.position.y+=h}
function sceneLamp(x,z){atHeight(lamp,x,z)}
function sceneCrate(x,z){atHeight(crate,x,z);addObstacle(x,z,.85,.85)}
function sceneBarrel(x,z){atHeight(barrel,x,z);addObstacle(x,z,.75,.75)}
function stoneMaterial(color='#9ea18b'){return mat(color,{map:assets.ruin||assets.stone,bumpMap:assets.ruin||assets.stone,bumpScale:.075})}
function addBridge(b){
 const g=new THREE.Group();g.position.set(b.x,b.y,b.z);world.add(g);const stone=stoneMaterial('#b6b198'),wood=mat('#9d865c',{map:assets.wood});
 if(b.type==='wood'){for(let x=-b.w/2;x<b.w/2;x+=.35)box(.33,.2,b.d,wood,x,-.1,0,g);for(let z of [-b.d*.4,b.d*.4])box(b.w,.22,.18,wood,0,-.3,z,g)}else{box(b.w,.3,b.d,stone,0,-.15,0,g);for(let x=-b.w/2+.5;x<b.w/2;x+=2)cyl(.35,.45,Math.max(.5,b.y+1.3),stone,x,-(b.y+1.3)/2,0,g,8)}
 g.children.forEach(m=>m.userData.walkSurface=true);
 for(let side of [-1,1]){for(let x=-b.w/2;x<=b.w/2;x+=1.5)box(.13,1.05,.13,b.type==='wood'?wood:stone,x,.53,side*(b.d/2-.1),g);box(b.w,.12,.12,b.type==='wood'?wood:stone,0,1.02,side*(b.d/2-.1),g)}
}
function stairs(x,z,n,rise,width,depth=.5){const stone=stoneMaterial();for(let i=0;i<n;i++)box(width,rise*(i+1),depth+.03,stone,x,rise*(i+1)/2,z-i*depth)}
function plot(x,z,w,d,style){buildingPlots.push({x,z,w,d});return house(x,z,w,d,style)}
function marketStall(x,z,color='#5d7762'){
 const g=new THREE.Group();g.position.set(x,heightAt(x,z),z);world.add(g);const wood=mat('#95754c',{map:assets.wood});
 for(const a of [-1.5,1.5])for(const b of [-.8,.8])box(.1,2.55,.1,wood,a,1.27,b,g);box(3.1,.85,1.5,wood,0,.5,0,g);
 for(let i=0;i<10;i++){const m=box(.32,.06,2.25,i%2?'#d8cfad':color,-1.44+i*.32,2.65,0,g);m.rotation.x=-.1}
 for(let i=0;i<20;i++)ball(.12,i%3?'#d9b85d':'#95a161',rr(-1.25,1.25),1.04,rr(-.55,.55),g,0);addObstacle(x,z,3.2,1.7);return g;
}
function bench(x,z){const wood=mat('#9c8257',{map:assets.wood});for(let a of [-.7,.7])box(.13,.7,.5,wood,x+a,heightAt(x,z)+.35,z);box(1.9,.12,.65,wood,x,heightAt(x,z)+.65,z);box(1.9,.55,.1,wood,x,heightAt(x,z)+1,z-.28);addObstacle(x,z,1.9,.7)}
function bunting(a,b){const ca=new THREE.Vector3(a[0],a[1],a[2]),cb=new THREE.Vector3(b[0],b[1],b[2]);for(let i=0;i<14;i++){const t=i/13,p=ca.clone().lerp(cb,t);p.y-=Math.sin(t*Math.PI)*.35;if(i)beam(ca.clone().lerp(cb,(i-1)/13).add(new THREE.Vector3(0,-Math.sin((i-1)/13*Math.PI)*.35,0)),p,.017,'#6a624a');if(i%2){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute([-.2,0,0,.2,0,0,0,-.5,0],3));geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat(i%3?'#ac8455':'#536e7c',{side:THREE.DoubleSide}));m.position.copy(p);world.add(m);windParts.push({mesh:m,base:0,phase:i,amt:.12})}}}
function gateMark(exit){const h=heightAt(exit.x,exit.z),axis=exit.facing==='east'||exit.facing==='west';const stone=stoneMaterial();for(const side of [-1,1]){const x=exit.x+(axis?0:side*2.7),z=exit.z+(axis?side*2.7:0);box(.55,3.3,.55,stone,x,h+1.65,z);box(.8,.2,.8,stone,x,h+3.3,z)}objects.push({type:'exit',name:'Continue to '+exit.label,x:exit.x,z:exit.z,exit});}
function sceneWater(){
 const w=currentDef.water;if(!w)return;journeyLegacy.installWater();const oldCenter=state.area==='forest'?-11:-10,oldWidth=state.area==='forest'?5.8:9.3;
 water.position.x=w.x;water.scale.x=w.width/oldWidth;for(const m of world.children)if(m!==water&&m.geometry?.type==='BoxGeometry'&&m.position.y<-2&&Math.abs(m.position.x-oldCenter)<.1){m.position.x=w.x;m.scale.x=w.width/oldWidth;}
 const stone=stoneMaterial('#979d85');for(let z=-27;z<28;z+=2)for(const side of [-1,1]){const x=w.x+side*(w.width/2+.3),h=Math.max(0,landHeightAt(x+side*.3,z));box(.7,h+2,2.08,stone,x,(h-2)/2,z);if(z%4===1){const r=ball(rr(.22,.48),stone,x-side*.08,h-.1,z);r.scale.set(1,.7,.8)}}
}
function addVista(kind){
 const sky=new THREE.Mesh(new THREE.SphereGeometry(120,24,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{night:{value:state.night?1:0}},vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 vP;uniform float night;void main(){float h=clamp(vP.y/80.,0.,1.);vec3 c=mix(vec3(.79,.84,.77),vec3(.27,.48,.65),h);c=mix(c,vec3(.025,.055,.12),night*.87);gl_FragColor=vec4(c,1.);}'}));sky.position.set(0,0,-20);world.add(sky);sceneDecor.push(sky);
 const mountainColors=['#96afa9','#7b9992','#658778'];for(let k=0;k<3;k++){const vertices=[],uv=[];for(let i=0;i<40;i++){const x=-80+i*4,z=-76+k*10,h=6+Math.sin(x*.1+k)*4+Math.sin(x*.27)*2+k*2,nextH=6+Math.sin((x+4)*.1+k)*4+Math.sin((x+4)*.27)*2+k*2;vertices.push(x,-2,z,x+4,-2,z,x+4,nextH,z,x,-2,z,x+4,nextH,z,x,h,z);uv.push(0,0,1,0,1,1,0,0,1,1,0,1)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat(mountainColors[k],{map:assets.grit,side:THREE.DoubleSide}));world.add(m);}
 const castle=new THREE.Group();castle.position.set(kind==='highroad'?2:10,9,-52);castle.scale.setScalar(kind==='shrine'?.8:.62);world.add(castle);const stone=stoneMaterial('#9aa7a0');for(let i=0;i<6;i++){const x=-12+i*4.6,h=8+(i%3)*3;cyl(1.15,1.45,h,stone,x,h/2,0,castle,8);box(2.7,.7,2.7,stone,x,h,0,castle);for(let j=0;j<4;j++)box(.4,.8,.4,stone,x-1+j*.65,h+.6,-1,castle);if(i<5)box(4.5,1.8,.8,stone,x+2.3,5.5,0,castle);box(.42,2.1,.1,mat('#4e8793',{emissive:'#528b9b',emissiveIntensity:.5}),x,h*.7,1.18,castle)}
 const escarpment=new THREE.Mesh(new THREE.ConeGeometry(17,15,14,4),stoneMaterial('#778d7c'));escarpment.position.set(castle.position.x,1.5,-52);world.add(escarpment);
 for(let i=0;i<7;i++){const m=glow(rr(-55,55),rr(14,24),rr(-70,-50),0xfff5dd,rr(10,20));m.scale.y=rr(2,4);m.material.opacity=.1;skyClouds.push({mesh:m,x:m.position.x});}
 if(kind==='highroad'||kind==='riverwalk'){const town=new THREE.Group();town.position.set(-20,Math.max(0,landHeightAt(-20,-35)),-35);town.scale.setScalar(.5);world.add(town);for(let i=0;i<9;i++){const x=i*3.4,z=(i%3)*3;box(2.5,2.4,2,mat('#c2b391',{map:assets.ruin}),x,1.2,z,town);roofMesh(2.9,2.4,1.2,x,2.4,z,town)} }
}
function scatterLandscape(){
 const forest=state.area==='forest',treeBudget=forest?36:state.area==='village'?23:28;
 let count=0;for(let tries=0;tries<600&&count<treeBudget;tries++){const x=rr(-28,29),z=rr(-25,24);if(landHeightAt(x,z)<-.4||onRoad(x,z,2.8)||objects.some(o=>Math.hypot(x-o.x,z-o.z)<3.5)||buildingPlots.some(p=>Math.abs(x-p.x)<p.w/2+3&&Math.abs(z-p.z)<p.d/2+3))continue;if(state.area==='village'&&x>-6&&z>2&&x<27)continue;tree(x,z,rr(.75,1.22),forest?'green':count%3===0?'gold':'green');count++;}
 for(let i=0;i<60;i++){const x=rr(-27,28),z=rr(-24,23);if(landHeightAt(x,z)<-.4||onRoad(x,z,.9)||staticBlocked(x,z))continue;bush(x,z,rr(.3,.7),i%3?'#859b5c':'#b0a968');}
 const rock=stoneMaterial('#a4a58b');for(let i=0;i<32;i++){const x=rr(-27,28),z=rr(-24,23),h=landHeightAt(x,z);if(h<-.4||onRoad(x,z,1.5)||staticBlocked(x,z)||objects.some(o=>Math.hypot(o.x-x,o.z-z)<2.5))continue;const s=rr(.25,.7),m=ball(s,rock,x,h+s*.4,z);m.scale.y=.65;addObstacle(x,z,s*1.1,s*1.1);}
 const blade=new THREE.BufferGeometry();blade.setAttribute('position',new THREE.Float32BufferAttribute([-.075,0,0,.075,0,0,.045,.5,.05,-.075,0,0,.045,.5,.05,-.025,.48,.045,-.025,.48,.045,.045,.5,.05,.01,1,.18],3));blade.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,1,.5,0,0,1,.5,0,.5,0,.5,1,.5,.5,1],2));blade.computeVertexNormals();
 const grass=new THREE.InstancedMesh(blade,mat('#c2c28a',{side:THREE.DoubleSide}),10000);grass.frustumCulled=false;grass.receiveShadow=true;let gc=0;
 for(let z=-24;z<25;z+=.66)for(let x=-28;x<30;x+=.66){if(rng()>.6)continue;const xx=x+rr(-.18,.18),zz=z+rr(-.18,.18),h=landHeightAt(xx,zz);if(h<-.5||onRoad(xx,zz,.15)||staticBlocked(xx,zz,.05))continue;if(state.area==='village'&&Math.hypot(xx-4,zz+.5)<4.5)continue;for(let j=0;j<2;j++){const o=new THREE.Object3D();o.position.set(xx+rr(-.1,.1),h,zz+rr(-.1,.1));o.rotation.y=rr(0,6.28);o.scale.set(rr(.7,1.2),rr(.18,.5),1);o.updateMatrix();grass.setMatrixAt(gc,o.matrix);grass.setColorAt(gc,new THREE.Color().setHSL(rr(.18,.24),rr(.3,.47),rr(.36,.54)));gc++;}}
 grass.count=gc;world.add(grass);applyWind(grass,'grass');
 const flowers=new THREE.InstancedMesh(flowerGeometry(),mat('#ffffff',{vertexColors:true,side:THREE.DoubleSide}),1400);flowers.frustumCulled=false;flowers.receiveShadow=true;let fc=0;
 for(const p of flowerSites)for(let i=0;i<22;i++){const x=p.x+rr(-.8,.8),z=p.z+rr(-.8,.8);if(staticBlocked(x,z,.05)||onRoad(x,z,.05))continue;const o=new THREE.Object3D();o.position.set(x,landHeightAt(x,z),z);o.rotation.y=rr(0,6.28);o.scale.setScalar(rr(.38,.7));o.updateMatrix();flowers.setMatrixAt(fc,o.matrix);flowers.setColorAt(fc,new THREE.Color(p.color));fc++;}flowers.count=fc;world.add(flowers);applyWind(flowers,'grass');
 for(let i=0;i<75;i++){const m=glow(rr(-26,28),rr(.4,4),rr(-24,22),forest?0xb7f0ce:0xffe6b0,rr(.06,.15));particles.push({mesh:m,base:m.position.clone(),phase:rr(0,6),speed:rr(.3,.8)})}
 foliage.count=foliageCount;foliage.instanceMatrix.needsUpdate=true;if(foliage.instanceColor)foliage.instanceColor.needsUpdate=true;applyWind(foliage,'tree');
}
function settlement(){
 // A continuous stone square connects the fountain, shop fronts and main street.
 const square=route([[-4.6,1.5],[27,1.5]],12);sceneRoads.push(square);drawRoad(square);
 for(const p of [[-1,-9,6,5,0],[8,-10,6.4,5,1],[22,-9,6.5,5,2],[-1,-21.5,5.5,3,2],[-23,-8,5.8,5,0],[23,13,6.5,4,1]])plot(...p);
 groundDisc(4,-.5,4.25);fountain(4,-.5);marketStall(18,-2);marketStall(25,-2,'#88735d');bench(9,9);bench(-3,10);
 for(const p of [[-4,5],[11,5],[25,5],[-17,5],[15,-14]])sceneLamp(...p);
 for(const p of [[-3,-5],[1,-5],[23,-5],[26,11],[-25,-4]])sceneBarrel(...p);
 for(const p of [[21,-2],[26,-4],[-2,-5],[24,10]])sceneCrate(...p);
 atHeight(windmill,-22,-18);shrine(-1,7);chest('village',8,-20.5);chest('river',-24,9);
 for(const p of [[10,7],[-3,7],[17,7],[26,7],[6,-5],[-25,6]])flowerPatch(...p,p[0]%2?'#e8c9a4':'#d5dcb1');
 bunting([-4,4.5,-4],[15,4.5,-4]);bunting([16,4.2,7],[27,4.2,7]);
 objects.push({type:'inn',name:'Enter the Lantern Inn',x:8,z:-6.2});
 // A compact forge is on the apothecary apron, entirely clear of the plaza and street.
 const forge=new THREE.Group();forge.position.set(1,-.03,-4.8);world.add(forge);box(1,.85,.7,stoneMaterial('#6d7164'),0,.43,0,forge);const coal=box(.65,.08,.5,mat('#e09242',{emissive:'#ef8537',emissiveIntensity:1.1}),0,.9,0,forge);light(1,1,-4.8,0xffad55,12,5);addObstacle(1,-4.8,1,.7);
 buildVillageLife();
}
function riverScene(){
 for(const p of [[-23,5.5],[-4,5.5],[9,-4],[2,-19]])sceneLamp(...p);
 atHeight(windmill,-24,-18);const mill=plot(-18,-8,5,4,0);mill.scale.y=.7;
 stairs(7,-5.45,8,.25,3.8,.875);const stone=stoneMaterial();for(let x=11;x<28;x+=2)box(2.05,2,1.1,stone,x,1,-12);
 const wheel=new THREE.Group();wheel.position.set(-14.6,.1,-8);world.add(wheel);beam(new THREE.Vector3(-16,.1,-8),new THREE.Vector3(-14.6,.1,-8),.13,'#776448');for(let i=0;i<12;i++){const a=i*6.283/12;beam(new THREE.Vector3(0,0,0),new THREE.Vector3(0,Math.cos(a)*1.6,Math.sin(a)*1.6),.06,'#776448',wheel);const p=box(.8,.25,.55,'#9f895e',0,Math.cos(a)*1.6,Math.sin(a)*1.6,wheel);p.rotation.x=-a}sceneDecor.push(wheel);wheel.userData.motion='wheel';
 chest('grove',22,-4.5);bench(13,5.5);for(const p of [[12,6],[18,6],[-19,7],[12,-14],[2,-17]])flowerPatch(...p,'#e8d9a7');
 // A riverside loading platform and tied skiff make the mill's location functional.
 addLandingDock();const boat=new THREE.Group();boat.position.set(-7,-1.1,-7);world.add(boat);const hull=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),mat('#91754d',{map:assets.wood}));hull.scale.set(1.6,.28,.62);boat.add(hull);box(2.3,.1,.45,'#5d5940',0,.18,0,boat);sceneDecor.push(boat);boat.userData.motion='boat';
}
function highroadScene(){
 const stone=stoneMaterial();for(const p of [[-20,11],[-9,6],[6,-7],[25,-7]])sceneLamp(...p);
 for(let x=-27;x<13;x+=3){const z=x<-12?10.5:4.5-(x+12)*.38;if(onRoad(x,z,.15))continue;box(.15,1,.15,'#9b8d66',x,heightAt(x,z)+.5,z);}
 for(const side of [-1,1])for(let j=0;j<6;j++){const x=-8+side*12+rr(-2,2),z=-11-j*.9,h=landHeightAt(x,z);const m=ball(rr(1.4,2.2),stone,x,h+.7,z);m.scale.y=1.25;}
 const ruin=new THREE.Group();ruin.position.set(4,3.1,-12);world.add(ruin);for(const side of [-1,1]){cyl(.45,.55,3.5,stone,side*2,1.75,0,ruin,7);box(1.2,.3,1.1,stone,side*2,3.55,0,ruin)}box(5,.45,.9,stone,0,3.95,0,ruin);addObstacle(2,-12,1,1);addObstacle(6,-12,1,1);
 chest('forest',5,-9.5);addMob('roots',-2,1);for(const p of [[-19,11],[-8,6],[9,0],[23,2],[-2,-8]])flowerPatch(...p,'#e2d6a9');
}
function woodlandScene(){
 for(const p of [[-17,8],[-4,8],[3,-4],[3,-16]])sceneLamp(...p);shrine(-5,12);
 stairs(0,-6.3,12,.125,4.2,.5);const stone=stoneMaterial();for(const x of [-5.5,6])box(5.7,1.5,1.1,stone,x,.75,-6.3);
 addMob('wisps',0,.5);for(const p of [[-5,2],[5,6],[5,-11],[-5,-17],[-20,11],[9,-2]])flowerPatch(...p,'#c9d6e0');
 const rootArch=new THREE.Group();rootArch.position.set(0,1.5,-18);world.add(rootArch);for(const side of [-1,1])beam(new THREE.Vector3(side*3,0,0),new THREE.Vector3(side*1.4,4.5,0),.24,'#766e4c',rootArch);beam(new THREE.Vector3(-1.4,4.5,0),new THREE.Vector3(1.4,4.5,0),.18,'#766e4c',rootArch);
}
function shrineScene(){
 const stone=stoneMaterial();stairs(0,.75,10,.25,5.2,.7);for(const x of [-7,7])box(8,2.5,1.2,stone,x,1.25,1);
 for(const x of [-6,6])for(const z of [-9,-17]){const h=heightAt(x,z);cyl(.58,.75,4.9,stone,x,h+2.45,z,world,8);box(1.65,.3,1.65,stone,x,h+4.95,z);addObstacle(x,z,1.45,1.45)}
 box(13.8,.65,1.4,stone,0,7.9,-17);for(let i=0;i<4;i++)box(8-i*1.5,.32,1.4,stone,0,8.45+i*.32,-17);
 const base=heightAt(0,-15.8);box(5,.6,2.8,stone,0,base+.3,-15.8);cyl(.65,.95,1.2,stone,0,base+1.2,-15.5);addObstacle(0,-15.8,4.8,2.6);
 const ember=ball(.44,mat('#ffda9b',{emissive:'#ffad5e',emissiveIntensity:1.4}),0,base+2.3,-15.5);windParts.push({mesh:ember,spin:true,amt:.5});glow(0,base+2.3,-15.5,0xffca8d,2.5);light(0,base+2.4,-15,0xffc38c,28,13);
 if(!state.defeated.includes('warden'))addMob('warden',0,-9,true);else if(state.quest<3)objects.push({type:'ember',name:'Take the living ember',x:0,z:-13.4});
 for(const p of [[-4,4],[4,4],[9,-12],[-8,-12],[8,8]])flowerPatch(...p,'#c1d5da');for(const p of [[-4,7],[5,7]])sceneLamp(...p);
 // Reflective ward pools sit beside, rather than across, the approach stairs.
 for(const x of [-8,8]){cyl(1.5,1.6,.25,stone,x,.15,7,world,18);cyl(1.3,1.3,.04,new THREE.MeshPhysicalMaterial({color:'#577e78',metalness:.4,roughness:.16}),x,.3,7,world,24);glow(x,.6,7,0x92d4e5,1.2);}
}
buildWorld=function(area='village',spawn){
 area=sceneDefs[area]?area:'village';currentDef=sceneDefs[area];state.area=area;arenaActive=false;clearWorld();occluders=[];plantMeshes=[];flowerSites=[];waterfallParts=[];villageActors=[];lifeProps=[];skyClouds=[];sceneDecor=[];buildingPlots=[];sceneRoads=currentDef.roads.slice();seed=currentDef.seed;foliageCount=0;playerRoute=[];targetPoint=null;nav=null;
 foliage=new THREE.InstancedMesh(leafGeometry(),mat('#ffffff',{map:assets.grit,side:THREE.DoubleSide}),60000);foliage.count=0;foliage.castShadow=foliage.receiveShadow=true;foliage.frustumCulled=false;world.add(foliage);createLand();
 for(const r of sceneRoads)drawRoad(r);for(const b of currentDef.bridges)addBridge(b);sceneWater();
 if(area==='village')settlement();else if(area==='riverwalk')riverScene();else if(area==='highroad')highroadScene();else if(area==='forest')woodlandScene();else shrineScene();
 for(const exit of currentDef.exits)gateMark(exit);addVista(area);scatterLandscape();makeNavigation();
 const p=safeSpawn(spawn||currentDef.spawn);player=makeActor(0,p.x,p.z);companion=makeActor(1,p.x-1.7,p.z+.6);const cp=safeSpawn({x:companion.x,z:companion.z});moveActor(companion,cp.x,cp.z);cameraFocus.set(p.x,heightAt(p.x,p.z)+.8,p.z-1.5);transitionLock=1.7;
 if(state.mode!=='title')state.sceneVisited=Array.from(new Set([...(state.sceneVisited||['village']),area]));ensureJourneyUI();$('#area-name').textContent=currentDef.name;$('#scene-caption').textContent=currentDef.subtitle;$('#ambience-label').textContent=state.night?'MOONRISE · THE RIVERLANDS':'GOLDEN LIGHT · THE RIVERLANDS';$('#time-btn').textContent=state.night?'☾':'☼';updateMinimap();renderParty();if(state.mode!=='title')locationToast();
};
const villagerPlans=[
 {i:2,name:'Elder Rowan',role:'Village keeper',home:[6.5,1.1],tasks:[[6.5,1.1,'Studying the fountain',6],[7,-5.7,'Consulting the inn ledger',5],[6.5,1.1,'Waiting for the travelers',8]]},
 {i:4,name:'Sera the merchant',role:'Provisioner',home:[18,0],type:'merchant',tasks:[[18,0,'Tending the provision stall',7],[22,-2,'Checking the stock crates',4],[18,0,'Serving the market',7]]},
 {i:5,name:'Marin',role:'Boatman',home:[-3.5,3.5],tasks:[[-4,7,'Checking the mooring lines',5],[-17,3,'Inspecting the bridge',4],[-3.5,3.5,'Watching the current',5]]},
 {i:6,name:'Rook',role:'Village musician',home:[1,-3.5],tasks:[[1,-3.5,'Playing a river ballad',9],[-2,2.5,'Taking requests',4],[1,-3.5,'Tuning the lute',6]]},
 {i:7,name:'Agatha',role:'Weaver',home:[9,7.7],tasks:[[9,7.7,'Resting beside the bench',6],[16,1,'Choosing market thread',5],[10,7,'Talking about the flower beds',5]]},
 {i:8,name:'Pip',role:'Courier',home:[24,3],tasks:[[24,3,'Sorting the morning post',3],[21,-5,'Delivering a parcel',3],[14,-17,'Checking the north delivery',3],[0,-15,'Delivering a letter',3],[18,1,'Collecting the merchant post',4]],speed:1.6},
 {i:9,name:'Fen',role:'Market gardener',home:[-21,3],tasks:[[-21,3,'Preparing the produce cart',5],[-20,8,'Tending the riverside herbs',6],[17,5.8,'Delivering fresh produce',5]]},
 {i:10,name:'Nella',role:'Tag champion',home:[1,-1],tasks:[[1,-1,'Waiting for Ori',2],[0,5.8,'Playing tag',1],[8,5.8,'Playing tag',1],[8,-3.5,'Hiding by the flowers',2]],speed:1.7},
 {i:11,name:'Ori',role:'Aspiring explorer',home:[8,6.5],tasks:[[8,6.5,'Chasing Nella',1],[0,6.5,'Playing tag',1],[-1,-2.5,'Counting the fountain stones',2],[8,-4,'Planning the next chase',2]],speed:1.65},
 {i:12,name:'Captain Vale',role:'Town watch',home:[25,3],tasks:[[25,3,'Watching the eastern road',5],[14,-15,'Patrolling the upper street',3],[-3,3,'Checking the bridge approach',4],[25,3,'Taking the gate watch',6]],speed:1.2},
 {i:13,name:'Lady Iris',role:'Visiting patron',home:[9,-3],tasks:[[9,-3,'Admiring the fountain',5],[16,1.2,'Browsing the provisions',6],[-2,10,'Enjoying the river view',5]]},
 {i:14,name:'Halden',role:'Smith',home:[1,-3.6],tasks:[[1,-3.6,'Inspecting the forge',8],[2,-5,'Checking the cooling rack',4],[1,-3.6,'Warming beside the hearth',8]]},
 {i:15,name:'Liora',role:'Florist',home:[11,6.4],tasks:[[11,6.4,'Watering the flower beds',7],[25,0,'Arranging the flower stall',5],[17,7,'Tending the border flowers',7]]}
];
function workProp(a,kind){
 const g=new THREE.Group();world.add(g);g.visible=false;const metal=mat('#a4b3ad',{metalness:.5,roughness:.4}),wood=mat('#8f714d',{map:assets.wood});
 if(kind==='hammer'){box(.055,.5,.055,wood,0,.23,0,g);box(.3,.13,.15,metal,0,.52,0,g)}
 if(kind==='watering'){cyl(.13,.15,.24,metal,0,.05,0,g,8);beam(new THREE.Vector3(.09,.08,0),new THREE.Vector3(.32,.2,0),.035,metal,g);const spray=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(.32,.17,0),new THREE.Vector3(.52,-.4,.07)]);const stream=new THREE.Line(spray,new THREE.LineBasicMaterial({color:'#b4e4e8',transparent:true,opacity:.7}));g.add(stream);}
 if(kind==='parcel'){box(.27,.25,.25,'#b69764',0,0,0,g);box(.29,.025,.27,'#665e49',0,.03,0,g)}
 lifeProps.push({actor:a,mesh:g,kind});return g;
}
function buildVillageLife(){
 for(const plan of villagerPlans){const a=makeActor(plan.i,plan.home[0],plan.home[1],plan.i===10||plan.i===11?1.85:2.35);a.npc=false;a.villager=true;a.life={plan,index:0,phase:'working',activity:plan.tasks[0][2],remaining:2+rr(0,3),path:[],completed:0,blockedFor:0};villageActors.push(a);objects.push({type:plan.type||'npc',person:plan.name,name:'Speak to '+plan.name,x:a.x,z:a.z,actor:a,role:plan.role});
  if(plan.i===15)workProp(a,'watering');if(plan.i===8)workProp(a,'parcel');
 }
 // The gardener's cart belongs beside the western market, clear of the bridge path.
 const cart=new THREE.Group();cart.position.set(-21,0,5.4);world.add(cart);box(1.6,.55,1.1,'#997e54',0,.65,0,cart);for(const x of [-.9,.9]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.35,.07,6,12),mat('#554e3b'));wheel.rotation.y=Math.PI/2;wheel.position.set(x,.35,0);cart.add(wheel)}for(let i=0;i<10;i++)ball(.13,i%2?'#a0ac5e':'#d6a45e',rr(-.6,.6),1,rr(-.4,.4),cart,0);addObstacle(-21,5.4,1.9,1.2);
}
function updateVillageLife(dt){
 if(!nav||arenaActive||!['explore','dialog','title'].includes(state.mode))return;
 for(const a of villageActors){const l=a.life,p=l.plan;if(state.mode==='dialog'&&Math.hypot(player.x-a.x,player.z-a.z)<3){a.walk=0;continue}
  if(a.wait>1){a.wait-=dt;a.walk=0;continue}
  if(l.phase==='working'){a.walk=0;l.remaining-=dt;if(l.remaining<=0){l.index=(l.index+1)%p.tasks.length;const task=p.tasks[l.index];l.path=findPath(a,{x:task[0],z:task[1]});l.activity='Walking · '+task[2].toLowerCase();l.phase='walking';}continue}
  const goal=l.path[0];if(!goal){const task=p.tasks[l.index];l.phase='working';l.activity=task[2];l.remaining=task[3];l.completed++;a.walk=0;continue}
  let dx=goal.x-a.x,dz=goal.z-a.z,d=Math.hypot(dx,dz);if(d<.02){l.path.shift();continue}dx/=d;dz/=d;
  let avoidX=0,avoidZ=0;for(const b of [...villageActors,player]){if(b===a)continue;const bx=a.x-b.x,bz=a.z-b.z,bd=Math.hypot(bx,bz);if(bd>.02&&bd<.75){avoidX+=bx/bd*(.75-bd)*2;avoidZ+=bz/bd*(.75-bd)*2}}
  l.stagnant=(l.lastDistance!==undefined&&d>l.lastDistance-dt*.08)?(l.stagnant||0)+dt:Math.max(0,(l.stagnant||0)-dt*.2);l.lastDistance=d;const avoid=l.stagnant>1.5?.08:1;
  let vx=dx+avoidX*avoid,vz=dz+avoidZ*avoid,len=Math.hypot(vx,vz)||1;vx/=len;vz/=len;const speed=Math.min(d,(p.speed||.95)*dt);let xx=a.x+vx*speed,zz=a.z+vz*speed;if(!canTraverse(a.x,a.z,xx,zz,.44)){xx=a.x+dx*speed;zz=a.z+dz*speed;}
  if(canTraverse(a.x,a.z,xx,zz,.44)){moveActor(a,xx,zz);setFacing(a,vx,vz);a.walk=1;l.blockedFor=0}else{l.blockedFor+=dt;a.walk=0;if(l.blockedFor>1.5){const t=p.tasks[l.index];l.path=findPath(a,{x:t[0],z:t[1]});l.blockedFor=0}}
 }
}
function updateLifeProps(dt){
 for(const p of lifeProps){const a=p.actor,working=a.life.phase==='working';p.mesh.visible=state.area==='village'&&a.mesh.visible&&(p.kind==='parcel'||working);p.mesh.position.set(a.x+.38,heightAt(a.x,a.z)+1.05,a.z-.15);p.mesh.rotation.set(0,0,0);
  if(p.kind==='hammer'&&working){p.mesh.rotation.z=-.5+Math.sin(clock*7)*.65;if(Math.sin(clock*7)>.96&&Math.random()<dt*12)burst(new THREE.Vector3(1,.95,-4.8),0xffbe68,3,.5)}
  if(p.kind==='watering'&&working){p.mesh.rotation.z=-.25+Math.sin(clock*1.8)*.07;p.mesh.position.y-=.12}
  if(p.kind==='parcel')p.mesh.position.y=.95+heightAt(a.x,a.z);
 }
 for(const a of villageActors)if(a.life.phase==='working'){const p=a.life.plan;if(p.i===6)a.mesh.material.rotation=Math.sin(clock*2.6)*.025;}
}
function auditWorld(){
 if(!nav)return {area:state.area,errors:['Navigation unavailable']};const errors=[];
 for(const p of buildingPlots)for(const r of sceneRoads){let hit=false;for(let j=1;j<r.points.length&&!hit;j++){const a=r.points[j-1],b=r.points[j],n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)*3);for(let k=0;k<=n;k++){const t=k/n,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t;if(Math.abs(x-p.x)<p.w/2+r.width/2+.1&&Math.abs(z-p.z)<p.d/2+r.width/2+.1){hit=true;break}}}if(hit)errors.push('Building overlaps a road at '+p.x+','+p.z)}
 const root=currentDef.spawn;for(const o of objects.filter(o=>['exit','inn','shrine','chest','ember'].includes(o.type))){const p=interactStand(o),path=findPath(root,p);if(!path.length)errors.push('Unreachable '+o.name)}
 for(const a of villageActors){let previous={x:a.x,z:a.z};for(const t of a.life.plan.tasks){const p={x:t[0],z:t[1]};if(!findPath(previous,p).length)errors.push('Unreachable task: '+a.life.plan.name+' / '+t[2]);previous=p}}
 return {area:state.area,buildings:buildingPlots.length,roads:sceneRoads.length,exits:currentDef.exits.length,villagers:villageActors.length,errors};
}
function transitionScene(to,entry){
 if(transitioning||transitionLock>0||state.mode!=='explore')return;transitioning=true;state.mode='transition';keys={};playerRoute=[];targetPoint=null;$('#scene-curtain').classList.add('cover');$('#town-actions').classList.add('hidden');
 schedule(.36,()=>{const spawn=sceneDefs[to].entries[entry]||sceneDefs[to].spawn;buildWorld(to,spawn);state.mode='explore';transitioning=false;transitionLock=2;const e=sceneDefs[to].exits.find(e=>e.id===entry);if(e)setFacing(player,e.facing==='east'?-1:e.facing==='west'?1:0,e.facing==='north'?1:e.facing==='south'?-1:0);$('#scene-curtain').classList.remove('cover');saveGame(false);});
}
travel=function(area){if(state.mode==='battle'||!sceneDefs[area])return;closeMenu();$('#town-actions')?.classList.add('hidden');keys={};state.mode='explore';buildWorld(area);saveGame(false);sfx('travel')};
const originalLocationToast=locationToast;
locationToast=function(){const el=$('#location-toast');el.querySelector('.eyebrow').textContent=currentDef?.subtitle||'THE RIVERLANDS';el.querySelector('.location-name').textContent=currentDef?.name||'Willowmere';el.style.opacity=1;schedule(2.5,()=>el.style.opacity=0)};
updateQuest=function(){const q=state.quest;let title='The sleeping ember',text='Speak to Elder Rowan beside the fountain.';if(q===1){title='The fading ward';text={village:'Take the eastern road to Riverbank Walk.',riverwalk:'Follow the mill steps to Crown Highroad.',highroad:'Cross the ravine toward Whispering Wood.',forest:'Follow the lantern trail to the Ward Shrine.',shrine:'Defeat the Hollow Warden guarding the altar.'}[state.area]}if(q===2){title='A light reclaimed';text='Approach the shrine altar and take the living ember.'}if(q===3){title='Bring the light home';text='Return through the Riverlands to Elder Rowan.'}if(q===4){title='A light remains';text='The ward is restored. Willowmere has found its light.'}$('#quest-title').textContent=title;$('#quest-text').textContent=text;};

let titleModal=false,titleClock=0,titleSceneIndex=0,titleRouteIndex=0,titleChanging=false;
const initialState=JSON.parse(JSON.stringify(state)),initialHeroes=JSON.parse(JSON.stringify(heroes));
function ensureJourneyUI(){
 if($('#scene-curtain'))return;document.body.classList.add('journey');
 $('#area-name').insertAdjacentHTML('afterend','<div id="scene-caption" class="scene-caption"></div>');
 document.body.insertAdjacentHTML('beforeend','<div id="scene-curtain"></div><div id="town-actions" class="hidden"></div>');
 $('#battle-ui').insertAdjacentHTML('beforeend','<div id="enemy-readout" class="enemy-readout"></div>');
 $('#intro').insertAdjacentHTML('beforeend','<div id="title-scene-label" class="title-scene-label"></div>');
 const actions=document.createElement('div');actions.className='main-menu-actions';$('#start-btn').before(actions);actions.append($('#start-btn'),$('#continue-btn'));$('#start-btn').innerHTML='NEW JOURNEY <span>→</span>';
 actions.insertAdjacentHTML('beforeend','<button class="begin" id="title-settings">SETTINGS <span>◇</span></button><button class="begin" id="title-controls">HOW TO PLAY <span>?</span></button>');
 $('#title-settings').onclick=()=>openTitleMenu('settings');$('#title-controls').onclick=()=>openTitleMenu('controls');
 $('#menu-btn').insertAdjacentHTML('beforebegin','<button class="pill" id="town-btn">T &nbsp; TOWN</button>');$('#town-btn').onclick=toggleTownMenu;
 $('#title-scene-label').innerHTML='Willowmere<span>A LIVING WORLD · LIVE VIEW</span>';
}
renderParty=function(){
 $('#coins').textContent='◈ '+state.gold.toLocaleString();$('#party').innerHTML=heroes.map((h,i)=>`<div class="hero-card" style="${battle&&battle.turn===i?'border-bottom-color:#ffe1a1;':''}"><div class="face-shell"><div class="portrait" style="--face-image:var(--face${i},var(--portrait${i}))"></div></div><h4>${h.name}<span class="level">Lv. ${h.level}</span></h4><div class="barline"><span>HP</span><div class="bar"><i style="width:${h.hp/h.maxHp*100}%"></i></div><b>${h.hp}/${h.maxHp}</b></div><div class="barline"><span>MP</span><div class="bar sp"><i style="width:${h.sp/h.maxSp*100}%"></i></div><b>${h.sp}/${h.maxSp}</b></div></div>`).join('');updateQuest();
};
updateMinimap=function(){
 const X=x=>66+x*1.65,Z=z=>68+z*1.65,w=currentDef.water;
 $('#mini-land').innerHTML=`<rect width="132" height="132" fill="${state.area==='village'?'#777858':'#4e6848'}"/><rect x="${X(w.x-w.width/2)}" y="0" width="${w.width*1.65}" height="132" fill="#458385"/>`+sceneRoads.map(r=>`<polyline points="${r.points.map(p=>X(p.x)+','+Z(p.z)).join(' ')}" stroke="#c2b58a" stroke-width="${r.width*1.65}" fill="none" stroke-linejoin="round"/>`).join('')+buildingPlots.map(p=>`<rect x="${X(p.x-p.w/2)}" y="${Z(p.z-p.d/2)}" width="${p.w*1.65}" height="${p.d*1.65}" fill="#c6b58c" stroke="#3e4739" stroke-width="1"/>`).join('')+currentDef.exits.map(e=>`<circle cx="${X(e.x)}" cy="${Z(e.z)}" r="3" fill="#efcd7c"/>`).join('');
};
function controlsBody(){return '<p class="menu-sub">Choose the controls that suit you. Every command can be clicked or selected with the keyboard.</p><div class="controls-grid">'+[['Travel','WASD / arrow keys · move<br>Shift · run<br>Click the ground · find a route<br>Mouse wheel · zoom'],['Explore','E / Enter · talk, open, collect<br>T · village services<br>M · connected world map<br>I / Tab · inventory'],['Menus','↑ ↓ · select a button<br>← → · menu tabs / battle target<br>Enter / Space · confirm<br>Esc · back / pause'],['Battle','Attack, Skills, Items, Defend, Flee<br>B · spend a boost point<br>Click an enemy / ← → · target<br>Break shields with their weaknesses'],['View','F · fullscreen<br>H · hide the HUD<br>Settings · field of view, day / night<br>The camera keeps its fixed angle.'],['Your journey','Speak to Rowan beside the fountain.<br>Follow the roads through five scenes.<br>Rest, shop, equip and save in town.<br>Progress saves in this browser.']].map(([a,b])=>`<div class="item"><div><b>${a}</b><p>${b}</p></div></div>`).join('')+'</div>'}
function openTitleMenu(tab){titleModal=true;modalTab=tab;keys={};renderMenu();$('#modal').classList.remove('hidden');}
openMenu=function(tab='items'){if(state.mode==='title'){openTitleMenu(tab);return}playerRoute=[];routeArrival=null;$('#town-actions')?.classList.add('hidden');journeyLegacy.openMenu(tab)};
closeMenu=function(){if(titleModal){titleModal=false;$('#modal').classList.add('hidden');state.mode='title';return}journeyLegacy.closeMenu()};
renderMenu=function(){
 const special=modalTab==='map'||modalTab==='controls';
 if(special){let title=modalTab==='map'?'The Riverlands':'A traveler’s guide',body=controlsBody();
  if(modalTab==='map')body='<p class="menu-sub">Walk to the gold road markers to continue into the next scene. Discovered places can also be revisited here.</p><div class="journey-map">'+sceneOrder.map((id,i)=>{const d=sceneDefs[id],visited=state.sceneVisited?.includes(id)||id==='village';return `<div class="route-node ${id===state.area?'current':''}"><div class="node-mark">${['⌂','≈','♧','♧','✧'][i]}</div><div><h3>${d.name}</h3><p>${d.subtitle}</p></div><button class="action" data-travel="${id}" ${!visited||id===state.area?'disabled':''}>${id===state.area?'YOU ARE HERE':visited?'REVISIT →':'UNDISCOVERED'}</button></div>`}).join('')+'</div>';
  $('#modal').innerHTML=`<section class="panel" role="dialog" aria-modal="true" aria-label="${title}"><div class="panel-head"><div><div class="eyebrow">EMBER & TIDE / THE RIVERLANDS</div><h2>${title}</h2></div><button class="close" id="close-menu" aria-label="Close menu">×</button></div><div class="tabs">${[['items','Satchel'],['equipment','Travelers'],['abilities','Abilities'],['journal','Journal'],['map','World'],['settings','Settings'],['controls','Controls']].map(([id,n])=>`<button data-tab="${id}" class="${id===modalTab?'active':''}">${n}</button>`).join('')}</div><div class="panel-body">${body}</div></section>`;
  $('#close-menu').onclick=closeMenu;$$('[data-tab]').forEach(b=>b.onclick=()=>{modalTab=b.dataset.tab;renderMenu()});$$('[data-travel]').forEach(b=>b.onclick=()=>travel(b.dataset.travel));
 }else{journeyLegacy.renderMenu();if(!titleModal){$('.tabs').insertAdjacentHTML('beforeend','<button data-tab="controls">CONTROLS</button>');$('[data-tab="controls"]').onclick=()=>{modalTab='controls';renderMenu()}}}
 if(modalTab==='settings'){
  $('.panel-body').insertAdjacentHTML('beforeend','<div class="setting-row">Return to the title screen<button class="action" id="return-title">MAIN MENU</button></div>');$('#return-title').onclick=returnToTitle;
  if(titleModal){$('#save-setting').disabled=true;$('#load-setting').disabled=!localStorage.getItem('ember-tide-save-v1')}
 }
 if(titleModal){$('.tabs').innerHTML='<button id="title-settings-tab">Settings</button><button id="title-controls-tab">Controls</button>';$('#title-settings-tab').onclick=()=>{modalTab='settings';renderMenu()};$('#title-controls-tab').onclick=()=>{modalTab='controls';renderMenu()};}
};
begin=function(){if(state.mode!=='title'||titleModal)return;const sound=state.sound,night=state.night;Object.assign(state,JSON.parse(JSON.stringify(initialState)),{sound,night,sceneVisited:['village']});heroes.forEach((h,i)=>Object.assign(h,initialHeroes[i]));titleClock=0;buildWorld('village');journeyLegacy.begin();$('#town-btn').classList.remove('hidden');};
loadGame=function(){titleModal=false;titleClock=0;journeyLegacy.loadGame();$('#intro').style.opacity=0;playerRoute=[];};
function returnToTitle(){if(state.mode!=='title')saveGame(false);titleModal=false;$('#modal').classList.add('hidden');$('#dialog').classList.add('hidden');$('#town-actions').classList.add('hidden');state.mode='title';keys={};titleClock=0;titleSceneIndex=0;$('#intro').classList.remove('hidden');$('#intro').style.opacity=1;$('#hud').style.opacity=0;$('#continue-btn').classList.remove('hidden');buildWorld('village')}
function goToObject(o,action){if(!o)return;if(o.actor)o.actor.wait=Math.max(o.actor.wait,30);$('#town-actions').classList.add('hidden');walkTo(interactStand(o),()=>{near=o;action? action():interact()})}
function toggleTownMenu(){if(state.mode!=='explore')return;if(state.area!=='village'){openMenu('map');return}const el=$('#town-actions');if(!el.classList.contains('hidden')){el.classList.add('hidden');return}playerRoute=[];targetPoint=null;
 el.innerHTML='<div class="town-heading">Willowmere · Village services</div><div class="command-list">'+[['talk','☏','Talk'],['shop','⚑','Item Shop'],['inn','⌂','Inn'],['save','♧','Save'],['leave','➶','Leave']].map(([id,icon,n])=>`<button class="command-row" data-town="${id}"><span class="command-icon">${icon}</span>${n}<span class="chevron">›</span></button>`).join('')+'</div><div class="command-hint">↑ ↓ Select · Enter Confirm · Esc Close</div>';el.classList.remove('hidden');
 $$('[data-town]').forEach(b=>b.onclick=()=>{const id=b.dataset.town;if(id==='save'){saveGame();return}if(id==='shop'){goToObject(objects.find(o=>o.type==='merchant'),()=>openMenu('shop'));return}if(id==='inn'){goToObject(objects.find(o=>o.type==='inn'));return}if(id==='leave'){walkTo({x:28,z:3});el.classList.add('hidden');return}goToObject(objects.filter(o=>o.type==='npc').sort((a,b)=>Math.hypot(a.x-player.x,a.z-player.z)-Math.hypot(b.x-player.x,b.z-player.z))[0])});
}
interact=function(){if(state.mode==='dialog'){journeyLegacy.interact();return}if(state.mode!=='explore')return;near=closestObject();if(near?.type==='exit'){transitionLock=0;const e=currentDef.exits.find(e=>e.x===near.x&&e.z===near.z);if(e)transitionScene(e.to,e.entry);return}if(near?.type==='inn'){showDialog('THE WILLOW & WREN','A quiet room, a warm supper, and a new morning. Rest both travelers for 20 leaves?',[{text:'Rest · 20 ◈',fn:()=>{if(state.gold<20){notify('You need 20 leaves to stay.');closeDialog();return}state.gold-=20;heroes.forEach(h=>{h.hp=h.maxHp;h.sp=h.maxSp});closeDialog();saveGame(false);sfx('heal');notify('Your party is fully rested.')}},{text:'Another time',fn:closeDialog}]);return}journeyLegacy.interact()};

function buildBattleArena(){
 clearWorld();arenaActive=true;nav=null;villageActors=[];lifeProps=[];sceneDecor=[];skyClouds=[];occluders=[];plantMeshes=[];flowerSites=[];waterfallParts=[];buildingPlots=[];sceneRoads=[];foliageCount=0;seed=8992;
 foliage=new THREE.InstancedMesh(leafGeometry(),mat('#ffffff',{map:assets.grit,side:THREE.DoubleSide}),60000);foliage.count=0;foliage.castShadow=foliage.receiveShadow=true;foliage.frustumCulled=false;world.add(foliage);createLand();
 drawRoad(route([[-19,2],[16,2]],7));const stone=stoneMaterial();
 for(const x of [-12,4]){for(let j=0;j<9;j++){box(1.7,.55,1.7,stone,x,j*.57+.28,-15);if(j%3===0)box(2.1,.15,2.1,stone,x,j*.57+.55,-15)}box(2.4,.6,2.4,stone,x,5.5,-15)}
 const arch=new THREE.Mesh(new THREE.TorusGeometry(8,.65,6,28,Math.PI),stone);arch.position.set(-4,5,-15);world.add(arch);arch.castShadow=true;
 for(let i=0;i<30;i++){const x=rr(-25,24),z=rr(-28,-11);box(rr(.5,2),rr(.4,1.8),rr(.6,1.7),stone,x,.4,z)}
 for(let i=0;i<17;i++)tree(rr(-29,28),i<10?rr(-28,-18):rr(12,22),rr(.65,1.2),'green');
 for(let i=0;i<45;i++){const x=rr(-27,26),z=rr(-20,18);if(z< -5||z>7){bush(x,z,rr(.5,1));if(i%2===0)flowerPatch(x,z)}}foliage.count=foliageCount;applyWind(foliage,'leaves');
 addVista('shrine');player=makeActor(0,2,3,3.4);companion=makeActor(1,6,4,3.4);cameraFocus.set(-1,.8,1);
}
startBattle=function(o){
 if(state.mode!=='explore')return;arenaReturn={area:state.area,position:{x:player.x,z:player.z},source:o};const source={id:o.id,boss:o.boss,type:o.type,name:o.name};playerRoute=[];routeArrival=null;targetPoint=null;$('#town-actions').classList.add('hidden');buildBattleArena();source.actor=makeActor(3,-6,0,3);journeyLegacy.startBattle(source);
 battle.center={x:-1.2,z:.4};moveActor(heroMeshes[0],1.5,2);moveActor(heroMeshes[1],5.4,4.2);heroMeshes.forEach(a=>{a.face='west';a.base=3.4});
 enemyMeshes.forEach((a,i)=>{moveActor(a,-6.2-i*4,-.8+i*2.8);a.face='east';if(!o.boss&&arenaReturn.area==='highroad'&&assets.animations[16]){a.index=16;a.base=i?3.8:4.8;a.renderAspect=160/96;a.mesh.material.color.set('#ffffff');battle.enemies[i].name=i?'Stormfang cub':'Ravenfang Wolf';battle.enemies[i].weak=i?['ice','sword']:['sword','fire'];}});
 $('#battle-title').textContent=o.boss?'The Hollow Warden':arenaReturn.area==='highroad'?'Storm on the highroad':'A stir in the leaves';battlePage='commands';commandIndex=0;lastBattleTurn=-1;formationNarrow=null;fitBattleFormation();renderBattle();
};
function fitBattleFormation(){if(!battle)return;const narrow=innerWidth/innerHeight<.85;if(formationNarrow===narrow)return;formationNarrow=narrow;for(const a of [...heroMeshes,...enemyMeshes])a.landscapeBase??=a.base;const heroPos=narrow?[[1.8,1],[3.1,3.9]]:[[1.5,2],[5.4,4.2]],enemyPos=narrow?[[-3.1,-2.4],[-4.2,1.2]]:[[-6.2,-.8],[-10.2,2]];heroMeshes.forEach((a,i)=>{moveActor(a,...heroPos[i]);a.base=a.landscapeBase});enemyMeshes.forEach((a,i)=>{moveActor(a,...enemyPos[i]);a.base=a.landscapeBase*(narrow?.79:1)});battle.center={x:narrow?-.4:-1.2,z:.4};}
cleanupBattle=function(){const back=arenaReturn;journeyLegacy.cleanupBattle();arenaReturn=null;arenaActive=false;if(back)buildWorld(back.area,back.position);$('#enemy-readout').innerHTML='';playerRoute=[];routeArrival=null;};
flee=function(){if(!battle||battle.busy)return;cleanupBattle();transitionLock=2;notify('You slipped away safely. The road can wait.')};
renderBattle=function(){
 if(!battle)return;const h=heroes[battle.turn],turnKey=battle.round*10+battle.turn;if(lastBattleTurn!==turnKey){battlePage='commands';commandIndex=0;lastBattleTurn=turnKey}
 $('#battle-message').textContent=battle.log;$('#turn-order').innerHTML=heroes.map((h,i)=>`<span class="turn-token ${battle.turn===i?'current':''}">${h.name}${h.hp<=0?' · DOWN':''}</span>`).join('')+battle.enemies.filter(e=>e.hp>0).map(e=>`<span class="turn-token">${e.broken?'BREAK':e.name}</span>`).join('');
 const busy=battle.busy||battle.phase!=='party',rows=battlePage==='skills'?battleActions().filter(a=>!['attack','defend','items'].includes(a.id)):[{id:'attack',label:'Attack',icon:'⚔',sp:0},{id:'skills',label:'Skills',icon:'◷',sp:0},{id:'items',label:'Items',icon:'♙',sp:0},{id:'defend',label:'Defend',icon:'♢',sp:0},{id:'flee',label:'Flee',icon:'⚑',sp:0}];
 $('#battle-controls').innerHTML=`<div class="command-header"><span>${battle.phase==='enemy'?'Enemy turn':h.name+' · '+(battle.turn+1)+'/2'}</span><span class="bp">${'●'.repeat(Math.max(0,h.bp-battle.boost))}${'○'.repeat(Math.max(0,5-h.bp+battle.boost))}</span></div><div class="command-list">${rows.map((a,i)=>`<button class="command-row ${i===commandIndex?'selected':''}" data-combat="${a.id}" ${busy||h.sp<a.sp?'disabled':''}><span class="command-icon">${a.icon||{crosscut:'⚔',fire:'☀',ice:'❄',lightning:'ϟ',heal:'✧'}[a.id]||'◇'}</span>${a.label.replace(/^[⚔☀❄ϟ❋◇♧]\s*/u,'')}${a.sp?`<small>${a.sp} MP</small>`:''}</button>`).join('')}${battlePage==='skills'?'<button class="command-row" id="skills-back">‹ &nbsp; Back</button>':''}</div><button class="boost-btn" id="boost-btn" ${busy||h.bp<=battle.boost||battle.boost>=3?'disabled':''}>B · BOOST ${battle.boost?'+'+battle.boost:'ATTACK'} &nbsp; ◇</button>`;
 $$('[data-combat]').forEach((b,i)=>{b.onpointerenter=()=>{commandIndex=i;$$('[data-combat]').forEach(el=>el.classList.toggle('selected',el===b))};b.onclick=()=>{const id=b.dataset.combat;if(id==='skills'){battlePage='skills';commandIndex=0;renderBattle()}else if(id==='flee')flee();else combatAction(id)}});$('#boost-btn').onclick=boost;if($('#skills-back'))$('#skills-back').onclick=()=>{battlePage='commands';commandIndex=0;renderBattle()};
 if(battle.target<0||!battle.enemies[battle.target]||battle.enemies[battle.target].hp<=0)battle.target=battle.enemies.findIndex(e=>e.hp>0);
 const e=battle.enemies[battle.target];$('#enemy-readout').innerHTML=e?`<button id="next-target" title="Next enemy">›</button><h3>${e.name}</h3><div class="enemy-health"><i style="width:${e.hp/e.maxHp*100}%"></i></div><div class="enemy-detail"><span>${e.broken?'BREAK':'⬡ '+e.shield}</span><span>${e.weak.map(w=>({sword:'⚔',fire:'☀',ice:'❄',lightning:'ϟ'})[w]).join('　')}</span><span>${e.hp} HP</span></div>`:'';if($('#next-target'))$('#next-target').onclick=()=>selectEnemy(1);
 $('#enemy-labels').innerHTML=battle.enemies.map((e,i)=>e.hp>0?`<button class="enemy-target ${battle.target===i?'selected':''}" data-enemy="${i}" aria-label="Target ${e.name}">▼</button>`:'').join('');$$('[data-enemy]').forEach(b=>b.onclick=()=>{battle.target=+b.dataset.enemy;renderBattle()});renderParty();positionBattleLabels();
};
function selectEnemy(delta){if(!battle)return;const live=battle.enemies.map((e,i)=>e.hp>0?i:-1).filter(i=>i>=0);battle.target=live[(live.indexOf(battle.target)+delta+live.length)%live.length];renderBattle()}
positionBattleLabels=function(){if(!battle)return;$$('[data-enemy]').forEach(d=>{const a=enemyMeshes[+d.dataset.enemy],p=screenPos(a.mesh.position.clone().add(new THREE.Vector3(0,a.base+.1,0)));d.style.left=p.x+'px';d.style.top=p.y+'px'})};

function menuButtons(root){return [...root.querySelectorAll('button:not(:disabled),input')].filter(b=>b.getClientRects().length&&!b.closest('.hidden'))}
function navigateButtons(root,e){const bs=menuButtons(root);if(!bs.length)return;const i=bs.indexOf(document.activeElement);if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();bs[(i+(e.key==='ArrowDown'?1:-1)+bs.length)%bs.length].focus();return true}if(['Enter',' '].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();(i<0?bs[0]:bs[i]).click();return true}return false}
setupInput=function(){
 journeyLegacy.setupInput();
 document.addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)&&state.mode==='explore'&&$('#town-actions').classList.contains('hidden')){playerRoute=[];routeArrival=null;}
  if(!$('#modal').classList.contains('hidden')){if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();closeMenu();return}if(e.target?.tagName==='INPUT'){e.stopImmediatePropagation();return}if(['arrowleft','arrowright'].includes(k)){const tabs=$$('[data-tab]');const i=tabs.findIndex(b=>b.classList.contains('active'));if(tabs.length){e.preventDefault();e.stopImmediatePropagation();tabs[(i+(k==='arrowright'?1:-1)+tabs.length)%tabs.length].click();return}}navigateButtons($('#modal'),e);return}
  if(state.mode==='title'){navigateButtons($('#intro'),e);return}
  if(state.mode==='dialog'){if(['enter',' ','arrowup','arrowdown'].includes(k))navigateButtons($('#dialog'),e);return}
  if(!$('#town-actions').classList.contains('hidden')){if(k==='escape'||k==='t'){e.stopImmediatePropagation();$('#town-actions').classList.add('hidden');return}navigateButtons($('#town-actions'),e);return}
  if(state.mode==='battle'){if(['arrowleft','arrowright'].includes(k)){e.preventDefault();e.stopImmediatePropagation();selectEnemy(k==='arrowright'?1:-1);return}if(k==='escape'){e.stopImmediatePropagation();battlePage='commands';renderBattle();return}if(['arrowup','arrowdown','enter',' '].includes(k)){if(battle.busy){e.preventDefault();e.stopImmediatePropagation();return}navigateButtons($('#battle-controls'),e);return}}
  if(state.mode==='explore'&&k==='t'){e.stopImmediatePropagation();toggleTownMenu()}
 },true);
 renderer.domElement.addEventListener('pointerdown',e=>{if(state.mode!=='explore'||e.button!==0)return;e.stopImmediatePropagation();$('#town-actions').classList.add('hidden');pointer.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);raycaster.setFromCamera(pointer,camera);const surfaces=[];world.traverse(o=>{if(o.userData.walkSurface)surfaces.push(o)});const hits=raycaster.intersectObjects(surfaces,false);let hit=hits[0]?.point;if(!hit){const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-heightAt(player.x,player.z));hit=new THREE.Vector3();if(!raycaster.ray.intersectPlane(plane,hit))return}walkTo(hit);ring(new THREE.Vector3(hit.x,heightAt(hit.x,hit.z)+.08,hit.z),0xffdfa4);},true);
};
update=function(dt){
 if(!player)return;transitionLock=Math.max(0,transitionLock-dt);
 fitBattleFormation();
 if(state.mode==='explore'&&playerRoute.length){while(playerRoute.length&&Math.hypot(playerRoute[0].x-player.x,playerRoute[0].z-player.z)<.24)playerRoute.shift();targetPoint=playerRoute[0]||null;if(!playerRoute.length&&routeArrival){const fn=routeArrival;routeArrival=null;fn()}}
 updateVillageLife(dt);journeyLegacy.update(dt);updateLifeProps(dt);
 if(state.mode!=='title'&&state.mode!=='battle'&&innerWidth/innerHeight>1.2){const focus=new THREE.Vector3(clamp(player.x,-17,17),heightAt(player.x,player.z)+.8,clamp(player.z-2.8,-16,14));cameraFocus.lerp(focus,1-Math.exp(-dt*6));camera.position.copy(cameraFocus).add(new THREE.Vector3(0,14,30).multiplyScalar(zoom));camera.lookAt(cameraFocus);}
 if(state.mode==='explore'){
  $('#town-btn').classList.toggle('hidden',state.area!=='village');if(near?.actor?.life&&$('#interaction').style.display!=='none')$('#interaction').insertAdjacentHTML('beforeend',`<span class="activity-line">${near.actor.life.activity}</span>`);
  if(transitionLock<=0&&!transitioning){const e=currentDef.exits.find(e=>Math.hypot(player.x-e.x,player.z-e.z)<1.2);if(e)transitionScene(e.to,e.entry)}
  // The breadcrumb controller waits or routes around obstacles without teleporting.
 }
 if(state.mode==='title'){
  titleClock+=dt;const goals=currentDef.roads[0].points;const g=goals[(titleRouteIndex%Math.max(1,goals.length-1))+1];const dx=g.x-player.x,dz=g.z-player.z,d=Math.hypot(dx,dz);if(d<1)titleRouteIndex++;else{const p=findPath(player,g).find(p=>Math.hypot(p.x-player.x,p.z-player.z)>.03);if(p){const dist=Math.hypot(p.x-player.x,p.z-player.z),v=Math.min(dt*.8,dist);moveActor(player,player.x+(p.x-player.x)/dist*v,player.z+(p.z-player.z)/dist*v);setFacing(player,dx,dz);player.walk=1;}}
  updatePartyTrail(dt);
  const focus=new THREE.Vector3(state.area==='village'?6:player.x,heightAt(player.x,player.z)+1,state.area==='village'?-3:player.z-3);cameraFocus.lerp(focus,Math.min(1,dt*2));camera.position.copy(cameraFocus).add(new THREE.Vector3(0,14,30).multiplyScalar(zoom*(innerWidth/innerHeight<1?1.35:1)));camera.lookAt(cameraFocus);
  $('#title-scene-label').innerHTML=currentDef.name+'<span>A LIVING WORLD · LIVE VIEW</span>';
  if(titleClock>18&&!titleChanging&&!titleModal){titleChanging=true;$('#scene-curtain').classList.add('cover');schedule(.36,()=>{titleSceneIndex=(titleSceneIndex+1)%sceneOrder.length;buildWorld(sceneOrder[titleSceneIndex]);titleClock=0;titleRouteIndex=0;titleChanging=false;$('#scene-curtain').classList.remove('cover')})}
 }
 for(const o of sceneDecor){if(o.userData.motion==='wheel')o.rotation.x+=dt*.26;else if(o.userData.motion==='boat'){o.rotation.z=Math.sin(clock*.9)*.025;o.position.y=-1.1+Math.sin(clock*1.3)*.025}if(o.material?.uniforms?.night)o.material.uniforms.night.value=nightBlend}
 skyClouds.forEach((c,i)=>{c.mesh.position.x=c.x+Math.sin(clock*.04+i)*1.5;});
 sun.intensity=1.95*(1-nightBlend*.73);sun.color.set('#ffe8be').lerp(new THREE.Color('#8aafff'),nightBlend);hemi.intensity=.9-nightBlend*.48;scene.fog.near=48;scene.fog.far=145;scene.fog.color.set('#a5bab7').lerp(new THREE.Color('#172c43'),nightBlend);scene.background.copy(scene.fog.color);renderer.toneMappingExposure=1.03;
 updateTreeVisibility(dt);
};
window.render_game_to_text=()=>JSON.stringify({...JSON.parse(journeyLegacy.renderText()),scene:currentDef?.name,route:playerRoute.slice(0,4),visited:state.sceneVisited||['village'],villageLife:villageActors.map(a=>({name:a.life.plan.name,activity:a.life.activity,x:+a.x.toFixed(2),z:+a.z.toFixed(2),completed:a.life.completed})),audit:auditWorld(),mainMenu:state.mode==='title',treeFade:treeOccluders.filter(t=>t.fade<.9).length});

// Dither only the tree between the camera and either traveler; other leaves remain opaque.
let treeOccluders=[],treeFoliage=null;
const authoredTree=tree,authoredWind=applyWind;
tree=function(x,z,s=1,type='gold'){if(treeFoliage!==foliage){treeOccluders=[];treeFoliage=foliage}const start=foliageCount,g=authoredTree(x,z,s,type);if(g)treeOccluders.push({group:g,x,z,s,start,end:foliageCount,fade:1});return g};
applyWind=function(mesh,kind='grass'){
 authoredWind(mesh,kind);if(mesh!==foliage)return;const data=new Float32Array(60000);data.fill(1);mesh.geometry.setAttribute('instanceFade',new THREE.InstancedBufferAttribute(data,1));
 const windCompile=mesh.material.onBeforeCompile;mesh.material.onBeforeCompile=shader=>{windCompile(shader);shader.vertexShader='attribute float instanceFade;varying float vTreeFade;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTreeFade=instanceFade;');shader.fragmentShader='varying float vTreeFade;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\nfloat dither=fract(dot(floor(gl_FragCoord.xy),vec2(.754877666,.569840296)));if(dither>vTreeFade)discard;');};mesh.material.customProgramCacheKey=()=> 'wind-tree-fade-v2';
};
function updateTreeVisibility(dt){if(!foliage||treeFoliage!==foliage)return;const attr=foliage.geometry.attributes.instanceFade;if(!attr)return;let changed=false;for(const t of treeOccluders){let block=false;if(state.mode!=='title')for(const a of [player,companion]){if(!a)continue;const dz=t.z-a.z,rayY=heightAt(a.x,a.z)+1.1+dz*14/30,base=landHeightAt(t.x,t.z);if(dz>-.7&&dz<28&&Math.abs(t.x-a.x)<2.5*t.s&&rayY>base&&rayY<base+6*t.s)block=true;}const target=block?.16:1,next=t.fade+(target-t.fade)*Math.min(1,dt*7);if(Math.abs(next-t.fade)>.001){t.fade=next;attr.array.fill(next,t.start,t.end);changed=true;t.group.traverse(o=>{if(o.material){o.material.transparent=true;o.material.opacity=next;o.material.depthWrite=next>.8}})}}if(changed)attr.needsUpdate=true;}

// Whole-pose animation loading is defined in polish.js.
const baseMakeActor=makeActor;
makeActor=function(index,x,z,scale=2.5){const a=baseMakeActor(index,x,z,index<2?scale*1.12:scale),image=assets.frames[index]?.[0]?.image;a.renderAspect=image?image.width/image.height:.8;a.caster.geometry.dispose();a.caster.geometry=new THREE.PlaneGeometry(a.base*a.renderAspect,a.base);return a};
const authoredBox=box;
box=function(w,h,d,color,x,y,z,parent=world){const m=authoredBox(w,h,d,color,x,y,z,parent),map=m.material.map;if([assets.stone,assets.ruin,assets.wood,assets.roof].includes(map)){const uv=m.geometry.attributes.uv;for(let face=0;face<6;face++){const a=face<2?d:w,b=face<2?h:face<4?d:h;for(let j=0;j<4;j++){const k=face*4+j;uv.setXY(k,uv.getX(k)*a/2.5,uv.getY(k)*b/2.5)}}uv.needsUpdate=true;}return m};
const authoredLand=createLand;
createLand=function(){const count=world.children.length;authoredLand();const mesh=world.children[count];mesh.material.onBeforeCompile=shader=>{shader.uniforms.cliffMap={value:assets.ruin};shader.vertexShader='varying vec3 vTerrainPosition;varying vec3 vTerrainNormal;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTerrainPosition=(modelMatrix*vec4(position,1.)).xyz;vTerrainNormal=normalize(mat3(modelMatrix)*normal);');shader.fragmentShader='uniform sampler2D cliffMap;varying vec3 vTerrainPosition;varying vec3 vTerrainNormal;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 vec3 tn=normalize(vTerrainNormal);float slope=smoothstep(.18,.63,1.-abs(tn.y));vec2 rockUV=abs(tn.x)>abs(tn.z)?vTerrainPosition.zy*.32:vTerrainPosition.xy*.32;vec3 rock=texture2D(cliffMap,rockUV).rgb;diffuseColor.rgb=mix(diffuseColor.rgb,rock*vec3(.71,.78,.73),slope);`);};mesh.material.customProgramCacheKey=()=> 'terrain-cliff-v1';};
const authoredAddMob=addMob;
addMob=function(id,x,z,boss=false){const result=authoredAddMob(id,x,z,boss),o=objects.find(o=>o.id===id&&o.type==='enemy');if(id==='roots'&&o&&assets.animations[16]){o.actor.index=16;o.actor.base=3.1;o.actor.renderAspect=160/96;o.actor.face='east';o.name='Challenge the Ravenfang wolf';}return result};

setupPost=function(){
 renderTarget=new THREE.WebGLRenderTarget(innerWidth,innerHeight,{type:THREE.HalfFloatType});renderTarget.depthTexture=new THREE.DepthTexture(innerWidth,innerHeight,THREE.UnsignedIntType);postScene=new THREE.Scene();postCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
 postMaterial=new THREE.ShaderMaterial({uniforms:{image:{value:renderTarget.texture},depthImage:{value:renderTarget.depthTexture},texel:{value:new THREE.Vector2(1/innerWidth,1/innerHeight)},time:{value:0},focusDistance:{value:33},cameraRange:{value:new THREE.Vector2(.1,180)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:`varying vec2 vUv;uniform sampler2D image;uniform sampler2D depthImage;uniform vec2 texel;uniform vec2 cameraRange;uniform float focusDistance;uniform float time;
 float viewDepth(float d){float z=d*2.-1.;return 2.*cameraRange.x*cameraRange.y/(cameraRange.y+cameraRange.x-z*(cameraRange.y-cameraRange.x));}
 void main(){vec3 original=texture2D(image,vUv).rgb;float depth=viewDepth(texture2D(depthImage,vUv).x);float coc=smoothstep(5.,32.,abs(depth-focusDistance))*2.2;vec3 soft=original*.28;vec3 bloom=max(original-vec3(.93),vec3(0.))*.28;
 for(int i=0;i<8;i++){float a=float(i)*.785398;vec2 o=vec2(cos(a),sin(a));soft+=texture2D(image,vUv+o*texel*coc).rgb*.09;bloom+=max(texture2D(image,vUv+o*texel*4.).rgb-vec3(.93),vec3(0.))*.09;}
 vec3 c=mix(original,soft,min(.65,coc*.3))+bloom*.18;c=mix(vec3(dot(c,vec3(.2126,.7152,.0722))),c,1.035);c*=vec3(1.01,1.015,1.);gl_FragColor=vec4(c,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),postMaterial));
};

// Planar reflection in the same world coordinate system as the water, with an oblique clip plane.
render=function(){
 reflectionFrame++;sun.shadow.needsUpdate=reflectionFrame%4===0;
 if(water&&reflectionTarget&&reflectionFrame%2===0){
  reflectionCamera.copy(camera);reflectionCamera.position.copy(camera.position);reflectionCamera.position.y=2*WATER_Y-camera.position.y;const dir=new THREE.Vector3();camera.getWorldDirection(dir);const target=camera.position.clone().add(dir);target.y=2*WATER_Y-target.y;reflectionCamera.up.copy(camera.up);reflectionCamera.up.y*=-1;reflectionCamera.lookAt(target);reflectionCamera.updateMatrixWorld();
  const plane=new THREE.Plane(new THREE.Vector3(0,1,0),-WATER_Y).applyMatrix4(reflectionCamera.matrixWorldInverse),cp=new THREE.Vector4(plane.normal.x,plane.normal.y,plane.normal.z,plane.constant),m=reflectionCamera.projectionMatrix.elements,q=new THREE.Vector4((Math.sign(cp.x)+m[8])/m[0],(Math.sign(cp.y)+m[9])/m[5],-1,(1+m[10])/m[14]);cp.multiplyScalar(2/cp.dot(q));m[2]=cp.x;m[6]=cp.y;m[10]=cp.z+1-.003;m[14]=cp.w;
  reflectionMatrix.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1).multiply(reflectionCamera.projectionMatrix).multiply(reflectionCamera.matrixWorldInverse);water.visible=false;renderer.setRenderTarget(reflectionTarget);renderer.render(scene,reflectionCamera);water.visible=true;
 }
 if(water?.material.uniforms.eye)water.material.uniforms.eye.value.copy(camera.position);
 postMaterial.uniforms.focusDistance.value=camera.position.distanceTo(cameraFocus);
 renderer.setRenderTarget(renderTarget);renderer.render(scene,camera);renderer.setRenderTarget(null);postMaterial.uniforms.time.value=clock;renderer.render(postScene,postCamera);
};
