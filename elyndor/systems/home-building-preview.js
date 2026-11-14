// Actual furniture models, shared placement validation and a pointer-following
// hologram. Draft movement never writes to the owned home's placements.
const homeCraft147={cache:new Map(),queue:[],stamp:'',target:null,scene:null,camera:null,live:null,last:0,angle:.42,spin:true,pointer:null,frame:0,placing:[],renders:0};
function findHomeDraft147(item){
 const yard=homeArea139()==='yard',kind=HOME_DECOR139[item].surface,l=homeLayout139(),table=kind==='table'&&housing139().home.placements.find(p=>HOME_DECOR139[p.item]?.kind==='table'),origin=table?{x:table.x,z:table.z}:kind==='wall'?{x:0,z:-l.d/2}:{x:yard?-9:2,z:yard?5:0};
 const candidate=(x,z)=>({...homeSnap139({x,z},item),uid:'draft'}),first=candidate(origin.x,origin.z);if(validateHomePlacement139(first).ok)return first;
 // Search outward and stop at the first usable cell. The old editor scanned
 // every garden cell before showing even an immediately valid first preview.
 const limit=yard?84:Math.ceil(Math.max(l.w,l.d)*2);for(let ring=1;ring<=limit;ring++)for(let side=0;side<4;side++)for(let i=-ring;i<ring;i++){const x=origin.x+(side===0?i:side===1?ring:side===2?-i:-ring)*.5,z=origin.z+(side===0?-ring:side===1?i:side===2?ring:-i)*.5,p=candidate(x,z);if(validateHomePlacement139(p).ok)return p;}
 return first;
}
function homePreviewStudio147(){
 if(homeCraft147.scene)return;const q=homeCraft147;q.scene=new THREE.Scene();q.scene.add(new THREE.HemisphereLight('#eff9ff','#5c604b',2.25));const key=new THREE.DirectionalLight('#fff0d1',4.1);key.position.set(-3,6,5);q.scene.add(key);const fill=new THREE.DirectionalLight('#a4dbe9',1.4);fill.position.set(4,3,-3);q.scene.add(fill);q.scene.environment=scene.environment;q.camera=new THREE.PerspectiveCamera(34,4/3,.02,200);q.target=new THREE.WebGLRenderTarget(256,192,{depthBuffer:true});q.target.texture.colorSpace=THREE.SRGBColorSpace;
}
function homePreviewKey147(item){return item+':'+homeStyle139().id;}
function homeReadyText147(){return navigator.maxTouchPoints>0?'Clear to place · Tap Place to confirm':'Clear to place · Click or Enter';}
function homeRenderFurniture147(item,angle=.42){
 homePreviewStudio147();const q=homeCraft147,key147=homePreviewKey147(item);q.models??=new Map();let row=q.models.get(key147);
 if(!row){const model=homeDecorModel139(item,q.scene),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(V3()),center=bounds.getCenter(V3());model.position.sub(center);row={model,radius:Math.max(.50,size.length()*.5)};q.models.set(key147,row);while(q.models.size>12){const key=q.models.keys().next().value;disposeHomeObject139(q.models.get(key).model);q.models.delete(key);}if(HOME_DECOR139[item].kind==='painting')setTimeout(()=>{q.cache.delete(key147);if(homeDecor139.active&&!q.queue.includes(item))q.queue.push(item);},1800);}
 const{model,radius}=row,camera=q.camera;model.visible=true;camera.position.set(Math.sin(angle)*radius*2.8,radius*1.6,Math.cos(angle)*radius*2.8);camera.lookAt(0,0,0);camera.near=.02;camera.far=Math.max(40,radius*12);camera.updateProjectionMatrix();q.scene.environment=scene.environment;q.scene.updateMatrixWorld(true);
 const saved={target:renderer.getRenderTarget(),viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),test:renderer.getScissorTest(),alpha:renderer.getClearAlpha(),color:renderer.getClearColor(new THREE.Color()),shadow:renderer.shadowMap.enabled,exposure:renderer.toneMappingExposure};
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=192;
 try{renderer.shadowMap.enabled=false;renderer.toneMappingExposure=1;renderer.setRenderTarget(q.target);renderer.setViewport(0,0,256,192);renderer.setScissorTest(false);renderer.setClearColor('#0b2832',0);renderer.clear();renderer.render(q.scene,camera);const pixels=new Uint8Array(256*192*4),data=new Uint8ClampedArray(pixels.length);renderer.readRenderTargetPixels(q.target,0,0,256,192,pixels);for(let y=0;y<192;y++)data.set(pixels.subarray((191-y)*1024,(192-y)*1024),y*1024);canvas.getContext('2d').putImageData(new ImageData(data,256,192),0,0);q.renders++;}
 finally{renderer.setRenderTarget(saved.target);renderer.setViewport(saved.viewport);renderer.setScissor(saved.scissor);renderer.setScissorTest(saved.test);renderer.setClearColor(saved.color,saved.alpha);renderer.shadowMap.enabled=saved.shadow;renderer.toneMappingExposure=saved.exposure;model.visible=false;}
 return canvas;
}
function homePaintThumbs147(){
 const q=homeCraft147,root=homeDecor139.root;if(!homeDecor139.active||!root)return;
 for(const node of root.querySelectorAll('canvas[data-home-thumb147]')){const item=node.dataset.homeThumb147,key=homePreviewKey147(item),cached=q.cache.get(key);if(cached){node.getContext('2d').drawImage(cached,0,0,node.width,node.height);}else if(!q.queue.includes(item))q.queue.push(item);}
}
const homeCraftRenderBefore147=renderHomeDecor139;
renderHomeDecor139=function(...args){const r=homeCraftRenderBefore147(...args),q=homeDecor139;if(!q.active||!q.root)return r;homeCraft147.dirty=true;
 const items=q.root.querySelector('.home-items139');if(!items)return r;
 for(const b of items.querySelectorAll('[data-home-item],[data-home-move]')){const item=b.dataset.homeItem??housing139().home.placements.find(v=>v.uid===b.dataset.homeMove)?.item;if(!item)continue;const icon=b.querySelector('.home-item-symbol139');icon.innerHTML='<canvas width="192" height="144" data-home-thumb147="'+item+'" aria-label="3D preview of '+esc(HOME_DECOR139[item].name)+'"></canvas>';b.classList.toggle('selected147',q.draft?.item===item);}
 const selected=q.draft?.item??items.querySelector('[data-home-item]')?.dataset.homeItem;
 if(selected){items.insertAdjacentHTML('beforebegin','<div class="home-model-preview147"><canvas id="home-model147" width="384" height="288" aria-label="Drag to rotate the 3D furniture preview"></canvas><button data-home-spin147 aria-label="Toggle rotating 3D preview" aria-pressed="'+homeCraft147.spin+'">↻</button><div><strong>'+esc(HOME_DECOR139[selected].name)+'</strong><small>Drag to turn · '+HOME_DECOR139[selected].w+' × '+HOME_DECOR139[selected].d+' m</small></div></div>');homeCraft147.live=selected;}
 q.root.querySelector('.home-instruction139')?.replaceChildren(document.createTextNode(navigator.maxTouchPoints>0?'Choose an object · Tap to position · Place to confirm · Rotate to turn · Cancel to discard':'Choose an object · Move to preview · Click to place · Wheel / R to turn · Esc to cancel'));
 const status=q.root.querySelector('#home-placement-status139');if(status&&q.draft){status.textContent=q.valid?.ok?homeReadyText147():q.valid?.reason??'Choose a position';status.dataset.valid=String(!!q.valid?.ok);}
 homePaintThumbs147();homeFitCraft147();homeCraftLoop147();return r;};
function homeGhostMaterial147(m,tint){const c=m;c.userData.homeGhost147=tint;c.emissiveMap=null;c.emissive.copy(tint.value);c.emissiveIntensity=.65;c.opacity=.43;c.depthWrite=false;c.transparent=true;c.polygonOffset=true;c.polygonOffsetFactor=-1;c.polygonOffsetUnits=-1;
 const before=c.onBeforeCompile,key=c.customProgramCacheKey();c.onBeforeCompile=function(s,...args){before.call(this,s,...args);s.uniforms.homeGhost147=tint;s.fragmentShader='uniform vec3 homeGhost147;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','float edge147=pow(1.-abs(dot(normalize(normal),normalize(vViewPosition))),2.);outgoingLight=mix(outgoingLight,homeGhost147*(.65+edge147*1.25),.72);diffuseColor.a*=.70+edge147*.30;\n#include <opaque_fragment>');};c.customProgramCacheKey=()=>key+':home-hologram147';c.needsUpdate=true;}
const homeSelectBefore147=selectHomeItem139;
selectHomeItem139=function(...args){const r=homeSelectBefore147(...args),q=homeDecor139;if(!q.draft||!q.ghost)return r;q.tint147={value:new THREE.Color('#6ee6cb')};q.ghost.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)homeGhostMaterial147(m,q.tint147);});
 q.supportChildren147=[];if(q.original&&HOME_DECOR139[q.original.item].kind==='table')for(const child of housing139().home.placements.filter(p=>p.surface===q.original.uid)){const root=world.userData.homeDecorRoots139.get(child.uid);if(root){q.supportChildren147.push({root,visible:root.visible});root.visible=false;}}homeCraftShadows147();
 const item=HOME_DECOR139[q.draft.item];q.outline.geometry.dispose();q.outline.geometry=new THREE.EdgesGeometry(new THREE.BoxGeometry(item.w,.045,item.d));q.outline.material.depthTest=true;q.outline.renderOrder=4;
 const plane=new THREE.PlaneGeometry(item.w,item.d);plane.rotateX(-Math.PI/2);const plate=new THREE.Mesh(plane,new THREE.MeshBasicMaterial({color:'#6ee6cb',transparent:true,opacity:.085,depthWrite:false,side:THREE.DoubleSide}));plate.userData.homePlate147=true;plate.material.userData.homeDraft139=true;q.outline.add(plate);
 const arrow=new THREE.Mesh(new THREE.ConeGeometry(.14,.38,3),new THREE.MeshBasicMaterial({color:'#d0fff2',transparent:true,opacity:.85,depthWrite:false}));arrow.rotation.x=-Math.PI/2;arrow.position.set(0,.045,-item.d/2-.27);arrow.material.userData.homeDraft139=true;q.outline.add(arrow);q.target147=q.ghost.position.clone();refreshHomeDraft139();renderHomeDecor139();return r;};
const homeRefreshBefore147=refreshHomeDraft139;
refreshHomeDraft139=function(...args){const q=homeDecor139,previous=q.ghost?.position.clone(),r=homeRefreshBefore147(...args);if(!q.draft||!q.ghost)return r;q.target147=q.ghost.position.clone();if(previous&&q.smooth147)q.ghost.position.copy(previous);q.smooth147=true;
 const color=q.valid.ok?'#6ee6cb':'#ff7664';q.tint147?.value.set(color);q.outline.material.color.set(color);for(const child of q.outline.children)if(child.material?.color)child.material.color.set(color);q.outline.position.set(q.ghost.position.x,q.target147.y+.035,q.ghost.position.z);
 const status=$('#home-placement-status139');if(status){status.textContent=q.valid.ok?homeReadyText147():q.valid.reason;status.dataset.valid=String(q.valid.ok);}return r;};
function homePointerPoint147(event,item){
 const canvas=$('#world'),rect=canvas.getBoundingClientRect(),ndc=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(ndc,camera);const kind=HOME_DECOR139[item]?.surface;
 if(kind==='table'){const tables=[...world.userData.homeDecorRoots139.values()].filter(g=>HOME_DECOR139[g.userData.homeItem139]?.kind==='table'),hit=ray.intersectObjects(tables,true).find(h=>h.face&&h.face.normal.y>.5);if(hit)return hit.point;}
 if(kind==='wall'){const l=homeLayout139(),planes=[new THREE.Plane(V3(0,0,1),l.d/2),new THREE.Plane(V3(1,0,0),l.w/2),new THREE.Plane(V3(-1,0,0),l.w/2)],hits=planes.map(p=>ray.ray.intersectPlane(p,V3())).filter(p=>p&&p.y>.25&&p.y<4.8&&Math.abs(p.x)<=l.w/2+.1&&Math.abs(p.z)<=l.d/2+.1);hits.sort((a,b)=>a.distanceToSquared(ray.ray.origin)-b.distanceToSquared(ray.ray.origin));if(hits.length)return hits[0];}
 return ray.ray.intersectPlane(new THREE.Plane(V3(0,1,0),0),V3());
}
function homePlacePointer147(event){const q=homeDecor139;if(!q.active||!q.draft)return;const hit=homePointerPoint147(event,q.draft.item);if(!hit)return;const old=q.draft,row=homeSnap139(hit,old.item);q.draft={...old,...row,turn:old.turn};refreshHomeDraft139();}
function homeDecorPointer147(event){
 if(!homeDecor139.active||event.target!==$('#world'))return;event.preventDefault();event.stopImmediatePropagation();const q=homeDecor139;
 if(event.type==='pointermove'){if(!q.draft)return;homeCraft147.pointer={clientX:event.clientX,clientY:event.clientY};if(!homeCraft147.frame)homeCraft147.frame=requestAnimationFrame(()=>{homeCraft147.frame=0;const p=homeCraft147.pointer;homeCraft147.pointer=null;if(p)homePlacePointer147(p);});return;}
 if(event.button===2){cancelHomeDraft139();return;}
 if(q.draft){homePlacePointer147(event);if(event.pointerType!=='touch'&&event.button===0&&q.valid?.ok)commitHomeDraft139();return;}
 const rect=$('#world').getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),camera);const hit=ray.intersectObjects([...world.userData.homeDecorRoots139.values()],true)[0];if(hit){let g=hit.object;while(g&&!g.userData.homePlacement139)g=g.parent;const row=housing139().home.placements.find(v=>v.uid===g?.userData.homePlacement139);if(row)selectHomeItem139(row.item,row.uid);}
}
const homeCommitBefore147=commitHomeDraft139;
commitHomeDraft139=function(...args){const q=homeDecor139,item=q.draft?.item,last=q.draft&&{...q.draft},moving=!!q.original,r=homeCommitBefore147(...args);if(r){const placed=housing139().home.placements.at(-1),root=world.userData.homeDecorRoots139.get(placed.uid);if(root){root.scale.setScalar(.94);homeCraft147.placing.push({root,age:0});}if(!moving&&homeAvailable139(item)>0){selectHomeItem139(item);Object.assign(q.draft,{x:last.x,z:last.z,turn:last.turn,surface:last.surface});q.smooth147=false;refreshHomeDraft139();renderHomeDecor139();}}return r;};
const homeCancelBefore147=cancelHomeDraft139;
cancelHomeDraft139=function(...args){homeCraft147.pointer=null;for(const row of homeDecor139.supportChildren147??[])if(row.root.parent)row.root.visible=row.visible;homeDecor139.supportChildren147=[];const r=homeCancelBefore147(...args);homeDecor139.target147=null;homeDecor139.smooth147=false;homeDecor139.tint147=null;homeCraftShadows147();return r;};
function homeCraftShadows147(){renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;shadowBudget138.at=-Infinity;}
const homeCraftUpdateBefore147=updateHomeDecor139;
updateHomeDecor139=function(dt=0){const r=homeCraftUpdateBefore147(dt),q=homeDecor139,c=homeCraft147;for(const row of c.placing){row.age+=dt;row.root.scale.setScalar(mix(.94,1,smooth(0,.18,row.age)));}c.placing=c.placing.filter(p=>p.age<.18&&p.root.parent);
 if(!q.active)return r;if(q.ghost&&q.target147){q.ghost.position.lerp(q.target147,1-Math.exp(-Math.max(dt,.001)*32));q.outline.position.set(q.ghost.position.x,q.target147.y+.035,q.ghost.position.z);}
 const now=performance.now();if(now-c.last<(mobileStartup116()?220:130))return r;c.last=now;
 if(c.queue.length){const item=c.queue.shift(),key=homePreviewKey147(item);if(!c.cache.has(key)){c.cache.set(key,homeRenderFurniture147(item));while(c.cache.size>48)c.cache.delete(c.cache.keys().next().value);}homePaintThumbs147();}
 const canvas=$('#home-model147');if(canvas&&canvas.offsetHeight>0&&c.live){if(c.spin)c.angle+=.045;const image=homeRenderFurniture147(c.live,c.angle);canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);}return r;};
document.addEventListener('wheel',e=>{if(!homeDecor139.active||!homeDecor139.draft||e.target!==$('#world'))return;e.preventDefault();e.stopImmediatePropagation();const q=homeDecor139;if(HOME_DECOR139[q.draft.item].surface==='wall')return;q.draft.turn=(q.draft.turn+(e.deltaY>0?1:3))%4;refreshHomeDraft139();},{capture:true,passive:false});
document.addEventListener('contextmenu',e=>{if(homeDecor139.active&&e.target===$('#world'))e.preventDefault();},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-home-spin147]');if(!b)return;e.preventDefault();homeCraft147.spin=!homeCraft147.spin;b.setAttribute('aria-pressed',String(homeCraft147.spin));},true);
document.addEventListener('pointerdown',e=>{if(e.target.id!=='home-model147')return;e.preventDefault();homeCraft147.spin=false;homeCraft147.drag=e.clientX;e.target.setPointerCapture(e.pointerId);},true);
document.addEventListener('pointermove',e=>{if(e.target.id!=='home-model147'||!e.buttons||homeCraft147.drag==null)return;homeCraft147.angle+=(e.clientX-homeCraft147.drag)*.016;homeCraft147.drag=e.clientX;},true);
document.addEventListener('pointerup',e=>{if(e.target.id==='home-model147')homeCraft147.drag=null;},true);
// World simulation pauses while a menu is open. These presentation updates
// deliberately keep running, without advancing actors, weather or game time.
function homeCraftLoop147(){const q=homeCraft147;if(q.loop147)return;q.previous147=performance.now();const frame=now=>{q.loop147=0;if(!homeDecor139.active)return;const dt=Math.min(.05,Math.max(0,(now-q.previous147)/1000)),animate=!!homeDecor139.ghost||q.placing.length>0;q.previous147=now;updateHomeDecor139(dt);if((q.dirty||animate)&&now-(q.drawAt??0)>=(mobileStartup116()?45:30)){render();q.drawAt=now;q.dirty=false;}if(homeDecor139.active)q.loop147=requestAnimationFrame(frame);};q.loop147=requestAnimationFrame(frame);}
function homeFitCraft147(){const root=homeDecor139.root,bar=root?.querySelector('.home-place-toolbar139');if(!bar)return;root.style.setProperty('--home-bar147',(bar.offsetHeight+(innerWidth<701?18:26))+'px');}
window.addEventListener('resize',()=>{if(homeDecor139.active){homeFitCraft147();updateCamera(1,true);}});
const homeCraftBootBefore147=boot;
boot=async function(...args){const r=await homeCraftBootBefore147(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const d=JSON.parse(before()),a=world?.userData.homeKeeper139?.a;d.housingCraft147={active:homeDecor139.active,thumbnails:homeCraft147.cache.size,previewRenders:homeCraft147.renders,ghost:!!homeDecor139.ghost,valid:homeDecor139.valid?.ok??null,keeper:a?{face:a.face,cell:a.frame?.cell}:null,transit:homeTransit144?{stage:homeTransit144.stage,seconds:+homeTransit144.elapsed.toFixed(2),companions:homeTransit144.entry147?.map(r=>({done:r.done,distance:+r.distance.toFixed(2)}))}:null};return JSON.stringify(d);};return r;};
