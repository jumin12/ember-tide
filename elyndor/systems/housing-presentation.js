// The plan cards, physical dividers, doorway clearances and placement rules
// use the same authored plan. Room changes are structural, not just floor size.
Object.assign(HOME_LAYOUTS139.hearth,{name:'Hearthside cottage',description:'A great room with an enclosed east bedroom.',rooms144:[[-11.7,-8.7,14.7,17.4,'Great room'],[3.4,-8.7,8.3,10.7,'Bedroom']],walls144:[['z',3.2,-9,2.2,[[-1.5,.8]]],['x',2.2,3.2,12,[[6.3,8.7]]]],hearth144:[-10.3,-7.65]});
Object.assign(HOME_LAYOUTS139.suite,{name:'Garden suite',description:'Two quiet rooms around a central fireside gallery.',rooms144:[[-13.2,-9.7,8.5,8.0,'Bedroom'],[4.7,-9.7,8.5,8.0,'Study'],[-4.1,-9.7,8.2,8.0,'Gallery'],[-13.2,-1.1,26.4,10.8,'Living room']],walls144:[['z',-4.4,-10,-1.4,[[-5.6,-3.2]]],['z',4.4,-10,-1.4,[[-5.6,-3.2]]],['x',-1.4,-13.5,-4.4,[[-10.3,-7.9]]],['x',-1.4,4.4,13.5,[[7.9,10.3]]]],hearth144:[0,-8.65]});
Object.assign(HOME_LAYOUTS139.hall,{name:'Gathering hall',description:'A long hall with two front rooms and a broad entrance.',rooms144:[[-14.7,-10.7,29.4,10.9,'Gathering hall'],[-14.7,.8,9.4,9.9,'Library'],[-4.7,.8,9.4,9.9,'Foyer'],[5.3,.8,9.4,9.9,'Guest room']],walls144:[['z',-5,.5,11,[[5,7.4]]],['z',5,.5,11,[[5,7.4]]],['x',.5,-15,-5,[[-11.2,-8.8]]],['x',.5,5,15,[[8.8,11.2]]]],hearth144:[-13.3,-9.65]});
function homeWalls144(l=homeLayout139()){
 const rows=[];for(const[axis,at,start,end,gaps]of l.walls144){let from=start;for(const[lo,hi]of [...gaps,[end,end]]){if(lo>from)rows.push(axis==='x'?{x:(from+lo)/2,z:at,w:lo-from,d:.32}:{x:at,z:(from+lo)/2,w:.32,d:lo-from});from=hi;}}
 return rows;
}
function homeDoorways144(l=homeLayout139()){return l.walls144.flatMap(([axis,at,start,end,gaps])=>gaps.map(([lo,hi])=>axis==='x'?{x:(lo+hi)/2,z:at,w:hi-lo,d:2.5}:{x:at,z:(lo+hi)/2,w:2.5,d:hi-lo}));}
homeFixed139=function(l=homeLayout139()){const[x,z]=l.hearth144;return[{x,z,w:3.1,d:2.7,name:'the hearth',solid:true},{x:0,z:l.d/2-1.6,w:3.6,d:3.2,name:'the entrance aisle',solid:false},...homeWalls144(l).map(v=>({...v,name:'a room wall',solid:true})),...homeDoorways144(l).map(v=>({...v,name:'a doorway',solid:false}))];};
function homePartitions144(parent,l,q){
 const palette=['#c3b296','#c2b696','#b4ad91','#c9bca1'];
 for(const[i,[x,z,w,d]]of l.rooms144.entries()){
  const floor=homePlane139(w,d,q.floor,palette[i%palette.length],.014,parent);floor.position.set(x+w/2,.014,z+d/2);floor.material=homeSurface139(q.floor,palette[i%palette.length]);floor.rotation.y=i%2?Math.PI:0;
 }
 for(const row of homeWalls144(l)){const h=row.z>1.5?1.40:2.8;homeBox139(row.x,h/2,row.z,row.w,h,row.d,q.wallMaterial139,q.wall,parent);homeBox139(row.x,h+.06,row.z,row.w+.08,.12,row.d+.08,'wood',q.wood,parent);homeBox139(row.x,.14,row.z,row.w+.07,.24,row.d+.10,'wood',q.wood,parent);}
 for(const[axis,at,start,end,gaps]of l.walls144)for(const[lo,hi]of gaps){const mid=(lo+hi)/2,h=axis==='x'?at>1.5?1.5:2.9:mid>1.5?1.5:2.9;
  for(const p of[lo,hi])homeBox139(axis==='x'?p:at,h/2,axis==='x'?at:p,axis==='x'?.17:.44,h,axis==='x'?.44:.17,'wood',q.wood,parent);
  if(h>2)homeBox139(axis==='x'?mid:at,h,axis==='x'?at:mid,axis==='x'?hi-lo+.2:.44,.16,axis==='x'?.44:hi-lo+.2,'wood',q.wood,parent);
 }
 world.userData.homePlan144={id:housing139().home.layout,rooms:l.rooms144.length,walls:homeWalls144(l),doors:homeDoorways144(l)};
}
function homePlanSvg144(l,large=false){
 const pad=1.1,hw=l.w/2,hd=l.d/2,colors=['#9a9974','#748f80','#8f9d8b','#acaa83'];
 const rooms=l.rooms144.map(([x,z,w,d,name],i)=>'<rect x="'+x+'" y="'+z+'" width="'+w+'" height="'+d+'" fill="'+colors[i%4]+'"/>'+(large?'<text x="'+(x+w/2)+'" y="'+(z+d/2)+'" text-anchor="middle" dominant-baseline="central" fill="#fff4d5" font-size=".8">'+name+'</text>':'')).join('');
 const walls=homeWalls144(l).map(v=>'<rect x="'+(v.x-v.w/2)+'" y="'+(v.z-v.d/2)+'" width="'+v.w+'" height="'+v.d+'" fill="#f2d99a"/>').join(''),[hx,hz]=l.hearth144;
 return '<svg class="home-floorplan144" viewBox="'+[-hw-pad,-hd-pad,l.w+pad*2,l.d+pad*2].join(' ')+'" role="img" aria-label="'+esc(l.name)+' room configuration"><rect x="'+(-hw)+'" y="'+(-hd)+'" width="'+l.w+'" height="'+l.d+'" fill="#334b49" stroke="#e4c783" stroke-width=".3"/>'+rooms+walls+'<rect x="'+(hx-1.2)+'" y="'+(hz-.7)+'" width="2.4" height="1.4" fill="#d8a667"/><path d="M-1.6 '+hd+'h3.2" stroke="#08232b" stroke-width=".65"/><path d="M0 '+(hd+1)+'v-2" stroke="#e6cd8b" stroke-width=".2"/>'+ (large?'<text x="0" y="'+(hd-1.7)+'" text-anchor="middle" fill="#e9dfbd" font-size=".65">ENTRANCE</text>':'')+'</svg>';
}
layoutCards139=function(){return Object.entries(HOME_LAYOUTS139).map(([id,l])=>'<button class="home-layout139 '+(housingMenu139.layout===id?'selected':'')+'" data-home-layout="'+id+'" aria-pressed="'+(housingMenu139.layout===id)+'">'+homePlanSvg144(l)+'<span>'+l.name+'<small>'+l.description+'</small><b>'+l.rooms144.length+' spaces · '+l.w+' × '+l.d+'</b></span></button>').join('');};
const housingRenderBefore144=renderHousing139;
renderHousing139=function(...args){const r=housingRenderBefore144(...args),q=housingMenu139;if(!q.open||q.page==='greeting')return r;const panel=q.root.querySelector('.home-panel139');panel.classList.add('home-browser144');const fig=panel.querySelector('.home-showcase139 figure');
 fig.insertAdjacentHTML('beforebegin','<nav class="home-preview-tabs144" aria-label="House preview"><button data-home-view144="exterior" aria-pressed="'+(q.view144!=='plan')+'">House & grounds</button><button data-home-view144="plan" aria-pressed="'+(q.view144==='plan')+'">Room plan</button></nav>');
 fig.insertAdjacentHTML('beforeend','<div class="home-plan-view144"'+(q.view144==='plan'?'':' hidden')+'>'+homePlanSvg144(HOME_LAYOUTS139[q.layout],true)+'</div>');fig.querySelector('canvas').hidden=q.view144==='plan';fig.querySelector('figcaption').hidden=q.view144==='plan';
 panel.querySelector('.home-name139').insertAdjacentHTML('beforeend','<p class="home-property-detail144">'+esc(homeCurrentChoice139().theme)+'<span>Enclosed grounds · Private home · Furnish your own rooms</span></p>');return r;
};
document.addEventListener('click',e=>{const b=e.target.closest('[data-home-view144]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();housingMenu139.view144=b.dataset.homeView144;renderHousing139();},true);
function homeGardenStone144(x,z,s,kind=0){const g=rockGeometry62(kind%12),o=mesh(g,rockMaterial62(kind%3),x,0,z);g.computeBoundingBox();const span=g.boundingBox.getSize(V3());o.scale.set(s/Math.max(.01,span.x),s*(.5+kind%3*.08)/Math.max(.01,span.y),s*.82/Math.max(.01,span.z));o.position.y=groundAt(x,z)-g.boundingBox.min.y*o.scale.y-.05;o.rotation.y=kind*1.73;return o;}
function homeGardenBed144(x,z,w,d,q,seed){
 const rng=seeded(seed),g=new THREE.Group();g.position.set(x,0,z);world.add(g);homeBox139(0,.13,0,w,.26,d,'earth','#655e42',g);
 for(const side of[-1,1]){for(let i=0;i<Math.ceil(w/.72);i++)homeBox139(-w/2+(i+.5)*w/Math.ceil(w/.72),.20,side*d/2,w/Math.ceil(w/.72)-.035,.38,.25,'wall','#aab4a1',g);for(let i=0;i<Math.ceil(d/.72);i++)homeBox139(side*w/2,.20,-d/2+(i+.5)*d/Math.ceil(d/.72),.25,.38,d/Math.ceil(d/.72)-.035,'wall','#aab4a1',g);}
 for(let i=0;i<w*d*9;i++){const px=x+(rng()-.5)*(w-.4),pz=z+(rng()-.5)*(d-.4);plant(px,pz,.38+rng()*.45,i%7===0?'flower':'fern',.26);}
 obstacle(x,z,w+.25,d+.25,'raised home garden');return g;
}
function homeGardenDetails144(q){
 const rng=seeded(14400+Object.keys(HOME_STYLES139).indexOf(q.id)*17),key=q.id;
 homeGardenBed144(-13,-5,4.8,2.1,q,1441);homeGardenBed144(13,-10,5.2,2.3,q,1442);
 for(const[x,z]of[[-9,-13],[8,-13],[-18,4],[17,3]]){for(let i=0;i<26;i++)plant(x+(rng()-.5)*3.4,z+(rng()-.5)*2.5,.45+rng()*.55,i%6===0?'flower':'fern');}
 const bough=key==='relief'?'pine':q.trees;for(const[x,z,s]of[[-18,-13,1.15],[18,-15,1.28],[-25,-25,1.6],[26,-26,1.7],[-3,-28,1.75],[12,-32,1.8]])tree(x,z,s,bough,rng);
 // A layered geological and botanical backdrop beyond the contained plot.
 for(let i=0;i<18;i++){const side=i%2?1:-1,x=side*(25+rng()*20),z=-20-rng()*24;homeGardenStone144(x,z,2+rng()*1.8,(i*5)%12);}
 const pergola=new THREE.Group();pergola.position.set(-13,0,3);world.add(pergola);
 for(const x of[-2.25,2.25])for(const z of[-1.65,1.65]){homeBox139(x,1.7,z,.24,3.4,.24,'wood',q.wood,pergola);homeBox139(x,.16,z,.52,.32,.52,'wall','#aeb9a6',pergola);obstacle(x-13,z+3,.45,.45,'garden arbor post');}
 for(const z of[-1.8,1.8])homeBox139(0,3.45,z,5.4,.25,.22,'wood',q.wood,pergola);
 for(let i=0;i<8;i++)homeBox139(-2.5+i*5/7,3.63,0,.16,.17,4.1,'wood',q.wood,pergola);
 // Keep the arbor's joinery readable; no floating leaf cards above it.
 for(const x of[-15.5,-10.5])for(const z of[1.2,4.8])plant(x,z,.9,'fern');
 if(key==='highmere'){
  for(const x of[-16,16]){const urn=new THREE.Group();urn.position.set(x,0,-1);world.add(urn);homeBox139(0,.18,0,1.2,.36,1.2,'wall','#c7c5ab',urn);mesh(new THREE.CylinderGeometry(.52,.32,1.1,14),homeSurface139('wall','#c5c9b5'),0,.85,0,urn);for(let i=0;i<12;i++)plant(x+(rng()-.5)*.8,-1+(rng()-.5)*.8,.55,'flower',1.35);obstacle(x,-1,1.3,1.3,'stone garden urn');}
 }else if(key==='harbor'){
  for(let i=0;i<5;i++){const o=beam(V3(16+i*.24,.25,-3),V3(16+i*.24,.25,1.1),.12,'wood','#baa889');o.rotation.y=.12;}
  for(const[x,z]of[[17,-4],[18,-5],[-18,16]])homeGardenStone144(x,z,1.2,6);
 }else if(key==='relief'){
  for(const[x,z,s,k]of[[-17,-8,2.2,4],[18,-6,2.4,5],[-18,13,1.9,7]])homeGardenStone144(x,z,s,k);
 }else if(key==='fern'){
  for(let i=0;i<120;i++){const x=(i%2?1:-1)*(16+rng()*3),z=-15+rng()*28;plant(x,z,.7+rng()*.8,i%5?'fern':'flower');}
 }else{
  for(const[x,z]of[[-17,8],[16,-3]])tree(x,z,.7,'oak',rng);
 }
 world.userData.homeGarden144={theme:key,raisedBeds:2,arbor:true,layeredBackdrop:true};
}

const homePlanMapBefore144=mapBase51;
mapBase51=function(clone=true){if(state.scene!=='homeInterior139')return homePlanMapBefore144(clone);const l=homeLayout139(),h=housing139().home,key='home-plan144-'+h.layout+'-'+JSON.stringify(h.placements);if(key===minimap51.baseKey&&minimap51.base)return clone?minimap51.base.cloneNode(true):minimap51.base;minimap51.baseKey=key;const svg=new DOMParser().parseFromString(homePlanSvg144(l,true).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '),'image/svg+xml').documentElement;for(const p of h.placements.filter(p=>(p.area??'room')==='room'&&HOME_DECOR139[p.item].surface==='floor')){const f=homeFootprint139(p),r=document.createElementNS('http://www.w3.org/2000/svg','rect');for(const[k,v]of Object.entries({x:p.x-f.w/2,y:p.z-f.d/2,width:f.w,height:f.d,fill:'#536354',stroke:'#e3c98b','stroke-width':.1}))r.setAttribute(k,v);svg.append(r);}minimap51.base=svg;return clone?svg.cloneNode(true):svg;};

// Customized owned homes use the actual decorated yard, with the same renderer.
function paintLiveHomePreview144(canvas,key){
 const restore={target:renderer.getRenderTarget(),viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),test:renderer.getScissorTest(),actors:actors.map(a=>[a.mesh,a.mesh.visible,a.shadow,a.shadow?.visible])},sky=world.userData.sky27,skyPosition=sky?.position.clone();let target;
 try{for(const[m,,s]of restore.actors){m.visible=false;if(s)s.visible=false;}const c=camera.clone();c.clearViewOffset();c.aspect=16/9;c.fov=38;c.zoom=1;c.position.set(22,22,37);c.lookAt(0,1.7,-3);c.updateProjectionMatrix();c.updateMatrixWorld();if(sky){sky.position.copy(c.position);sky.updateMatrixWorld();}target=new THREE.WebGLRenderTarget(canvas.width,canvas.height,{depthBuffer:true});target.texture.colorSpace=THREE.SRGBColorSpace;renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.setViewport(0,0,canvas.width,canvas.height);renderer.clear();renderer.render(scene,c);const bytes=new Uint8Array(canvas.width*canvas.height*4),ctx=canvas.getContext('2d'),image=ctx.createImageData(canvas.width,canvas.height),stride=canvas.width*4;renderer.readRenderTargetPixels(target,0,0,canvas.width,canvas.height,bytes);for(let y=0;y<canvas.height;y++)image.data.set(bytes.subarray((canvas.height-1-y)*stride,(canvas.height-y)*stride),y*stride);ctx.putImageData(image,0,0);const shot=document.createElement('canvas');shot.width=canvas.width;shot.height=canvas.height;shot.getContext('2d').drawImage(canvas,0,0);housingMenu139.previewCache.set(key,shot);while(housingMenu139.previewCache.size>8)housingMenu139.previewCache.delete(housingMenu139.previewCache.keys().next().value);return true;
 }catch(error){console.error('Live home preview:',error);return false;}
 finally{renderer.setRenderTarget(restore.target);renderer.setViewport(restore.viewport);renderer.setScissor(restore.scissor);renderer.setScissorTest(restore.test);for(const[m,v,s,sv]of restore.actors){m.visible=v;if(s)s.visible=sv;}if(skyPosition){sky.position.copy(skyPosition);sky.updateMatrixWorld();}target?.dispose();}
}
