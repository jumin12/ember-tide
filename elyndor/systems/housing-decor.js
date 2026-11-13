// Simple fixed-size, grounded decoration. Drafts never modify the saved home.
const homeDecor139={active:false,category:'All',draft:null,original:null,ghost:null,outline:null,valid:null,root:null,previousMenu:null};
function homeDecorModel139(item,parent,style=homeStyle139()){
 const q=HOME_DECOR139[item],g=new THREE.Group();g.name=q.name;parent.add(g);const wood=style.wood,cloth=style.accent;
 const b=(x,y,z,w,h,d,key='wood',color=wood)=>homeBox139(x,y,z,w,h,d,key,color,g);
 const leg=(x,z,h)=>b(x,h/2,z,.16,h,.16);
 if(q.kind==='bench'){
  for(const x of[-1.2,1.2])for(const z of[-.48,.48])b(x,.42,z,.16,.84,.16);
  for(const z of[-.45,0,.45])b(0,.86,z,3.1,.15,.35);
  for(const x of[-1.32,1.32]){b(x,1.17,-.58,.16,1.5,.16);b(x,1.28,0,.16,.14,1.35);}
  for(const y of[1.27,1.65])b(0,y,-.58,3.1,.25,.15);
 }else if(q.kind==='planter'){
  b(0,.36,0,2.4,.72,1.25);b(0,.73,0,2.15,.04,1.04,'earth','#494e31');
  for(const x of[-1.12,1.12])b(x,.43,0,.13,.88,1.37,'wood','#c3af88');
  for(const x of[-.75,0,.75]){const leaf=mesh(plantSculpt103(x===0?'fern':'flowers'),vegetationMaterial103(x===0?'fern':'flowers'),x,1.18,0,g);leaf.scale.setScalar(.96);}
 }else if(q.kind==='gardenLamp'){
  b(0,.18,0,.77,.36,.77,'wall','#b5b9a3');b(0,.64,0,.43,.60,.43,'wall','#c5c7b1');
  b(0,1.02,0,.67,.15,.67,'metal','#a9915d');
  const glass=material('glass','#d4c9a5',{transparent:true,opacity:.72,roughness:.15,emissive:'#ffc37b',emissiveIntensity:.35});mesh(new THREE.BoxGeometry(.43,.65,.43),glass,0,1.41,0,g);
  for(const x of[-.25,.25])for(const z of[-.25,.25])b(x,1.4,z,.045,.73,.045,'metal','#9a8553');
  const roof=mesh(new THREE.ConeGeometry(.48,.32,4),material('metal','#8c7d57',{metalness:.6,roughness:.45}),0,1.92,0,g);roof.rotation.y=Math.PI/4;
  const light=new THREE.PointLight('#ffd69d',.75,5,2);light.position.y=1.45;g.add(light);
 }else if(q.kind==='ornament'){
  for(const [y,w,h]of[[.1,1.35,.2],[.29,1.10,.18],[.69,.72,.65],[1.07,1.02,.16]])b(0,y,0,w,h,w,'wall','#bec5b2');
  const light=mesh(new THREE.OctahedronGeometry(.43),material('metal','#bda875',{metalness:.6,roughness:.38}),0,1.62,0,g);light.scale.set(.8,1.25,.8);
 }else if(q.kind==='table'){
  b(0,1.34,0,3.6,.22,2.5);b(0,1.17,0,3.25,.16,2.15,'darkWood','#9c835c');for(const x of[-1.42,1.42])for(const z of[-.90,.90])leg(x,z,1.25);
  for(let i=0;i<5;i++)b((i-2)*.7,1.458,0,.018,.008,2.34,'darkWood','#816b4d');
 }else if(q.kind==='bed'){
  b(0,.52,0,3.05,.23,4.35);for(const x of[-1.32,1.32])for(const z of[-1.96,1.96])leg(x,z,.65);
  b(0,.83,0,2.85,.45,4.1,'cloth','#e5dbc4');b(0,1.08,.65,2.87,.10,2.55,'cloth',cloth);
  for(const x of[-.72,.72])b(x,1.16,-1.35,1.2,.24,.72,'cloth','#f0e7d3');
  b(0,1.2,-2.15,3.15,1.8,.18);b(0,.70,2.15,3.15,.85,.18);for(const x of[-1.47,1.47])b(x,1.23,-2.15,.18,1.9,.22);
  for(const x of[-1.16,0,1.16])b(x,1.55,-2.03,.08,.65,.08,'wood','#c6b08a');
 }else if(q.kind==='chair'){
  for(const x of[-.48,.48])for(const z of[-.48,.48])leg(x,z,1.0);
  b(0,.96,0,1.25,.16,1.3);b(0,1.08,0,1.12,.16,1.17,'cloth',cloth);
  for(const x of[-.50,.50])b(x,1.65,-.53,.13,1.5,.14);b(0,2.25,-.53,1.15,.20,.17);for(const x of[-.26,0,.26])b(x,1.76,-.53,.08,.85,.09);
 }else if(q.kind==='rug'){
  const geo=new THREE.PlaneGeometry(q.w,q.d);geo.rotateX(-Math.PI/2);const m=roomMaterial29('rug29','#ffffff');const o=mesh(geo,m,0,.012,0,g);o.castShadow=false;
  for(const s of[-1,1])for(let i=0;i<22;i++)b(-q.w/2+.10+i*(q.w-.2)/21,.012,s*(q.d/2+.03),.025,.015,.15,'cloth','#cbb98e');
 }else if(q.kind==='plant'||q.kind==='vase'){
  const small=q.kind==='vase',s=small?.55:1;
  mesh(new THREE.CylinderGeometry(.43*s,.32*s,.74*s,18),material('metal',small?'#b9c9bd':'#567b72',{metalness:.05,roughness:.45}),0,.37*s,0,g);
  const lip=mesh(new THREE.TorusGeometry(.40*s,.045*s,6,20),material('metal','#b8b99a',{metalness:.2,roughness:.5}),0,.75*s,0,g);lip.rotation.x=Math.PI/2;
  mesh(new THREE.CylinderGeometry(.36*s,.36*s,.025,16),material('earth','#4d4a30'),0,.76*s,0,g);
  // Native sculpted fronds and flower heads, joined to their stems.
  const scale=small?.85:1.55,leaf=mesh(plantSculpt103(small?'flowers':'fern'),vegetationMaterial103(small?'flowers':'fern'),0,.76*s+.465*scale,0,g);leaf.scale.setScalar(scale);
 }else if(q.kind==='lamp'){
  mesh(new THREE.CylinderGeometry(.29,.32,.07,18),material('metal','#bd9b52',{metalness:.7,roughness:.25}),0,.035,0,g);
  mesh(new THREE.CylinderGeometry(.055,.075,.58,12),material('metal','#bd9b52',{metalness:.7,roughness:.25}),0,.34,0,g);
  mesh(new THREE.CylinderGeometry(.20,.36,.40,20,1,true),material('cloth','#ede0b8',{side:THREE.DoubleSide,emissive:'#ffc56c',emissiveIntensity:.22}),0,.76,0,g);
  const light=new THREE.PointLight('#ffd39a',.8,4,2);light.position.y=.7;g.add(light);
 }else if(q.kind==='banner'){
  b(0,.8,0,1.7,1.65,.08,'cloth',cloth);b(0,1.68,0,2,.10,.17,'metal','#bda15f');
  const diamond=mesh(new THREE.OctahedronGeometry(.23),material('metal','#d4ba76',{metalness:.5,roughness:.4}),0,.93,.12,g);diamond.scale.set(.65,1.2,.3);
  for(const x of[-.78,.78])b(x,.8,.06,.055,1.55,.035,'cloth','#d7bd7b');
 }else if(q.kind==='painting'){
  b(0,.80,0,2.6,1.6,.16,'darkWood','#6f5f43');
  const art=textures.water??textures.grass,m=new THREE.MeshStandardMaterial({map:art,color:'#ffffff',roughness:.95,metalness:0});
  const stage=item==='homeForest139'?'woodland':item==='homeCoast139'?'coast':'grassRiver';preparePainting90(stage,'day').then(texture=>{if(g.parent){m.map=texture;m.needsUpdate=true;}}).catch(()=>{});
  const face=mesh(new THREE.PlaneGeometry(2.29,1.30),m,0,.80,.095,g);face.userData.homePainting139=true;m.userData.homeOwned139=true;
  for(const y of[.05,1.55])b(0,y,.10,2.64,.10,.16,'wood','#bfa571');for(const x of[-1.25,1.25])b(x,.80,.10,.10,1.5,.16,'wood','#bfa571');
 }else if(q.kind==='statuette'){
  mesh(new THREE.CylinderGeometry(.4,.44,.17,16),material('wall','#bfc9bf'),0,.085,0,g);
  const crystal=mesh(new THREE.OctahedronGeometry(.37),material('metal','#a2c3bb',{metalness:.2,roughness:.4}),0,.63,0,g);crystal.scale.y=1.4;
 }else if(q.kind==='trophy'){
  b(0,.12,0,.94,.24,.80,'darkWood','#8b7049');b(0,.26,.34,.60,.15,.04,'metal','#cfb56c');
  mesh(new THREE.CylinderGeometry(.12,.20,.30,12),material('metal','#b29254',{metalness:.7,roughness:.35}),0,.43,0,g);
  const shield=mesh(new THREE.DodecahedronGeometry(.32,1),material('metal','#bfa064',{metalness:.65,roughness:.35}),0,.83,0,g);shield.scale.set(1.1,1.3,.7);
  for(const s of[-1,1]){const club=mesh(new THREE.CylinderGeometry(.07,.10,.65,8),material('metal','#9a7b43',{metalness:.65,roughness:.4}),s*.21,.75,.08,g);club.rotation.z=s*.60;}
 }else if(q.kind==='crest'){
  const outline=new THREE.Shape();outline.moveTo(-.72,1.5);outline.lineTo(.72,1.5);outline.lineTo(.65,.55);outline.lineTo(0,.03);outline.lineTo(-.65,.55);outline.closePath();
  const shield=mesh(new THREE.ExtrudeGeometry(outline,{depth:.13,bevelEnabled:true,bevelThickness:.03,bevelSize:.035,bevelSegments:1,steps:1}),material('metal','#bc9b5a',{metalness:.6,roughness:.35}),0,0,0,g);
  const jewel=mesh(new THREE.OctahedronGeometry(.26),material('metal','#69919e',{metalness:.35,roughness:.3}),0,.89,.20,g);jewel.scale.set(.8,1.3,.30);
 }
 g.userData.homeItem139=item;return g;
}
function seatHomeDecor139(root,p,placements=housing139().home.placements){
 const q=HOME_DECOR139[p.item],v=validateHomePlacement139(p,placements),l=homeLayout139();
 let y=v.y??(q.surface==='table'?1.45:q.surface==='wall'?2.85:.025),turn=p.turn*Math.PI/2;
 if(q.surface==='wall'){if(p.surface==='left'){root.position.set(-l.w/2+.27,y,p.z);turn=Math.PI/2;}else if(p.surface==='right'){root.position.set(l.w/2-.27,y,p.z);turn=-Math.PI/2;}else{root.position.set(p.x,y,-l.d/2+.27);turn=0;}}
 else root.position.set(p.x,y,p.z);
 root.rotation.y=turn;root.userData.homePlacement139=p.uid;root.updateMatrixWorld(true);return v;
}
function disposeHomeObject139(root){
 if(!root)return;root.removeFromParent();const shared=new Set(Object.values(sharedGeo)),geos=new Set(),mats=new Set();root.traverse(o=>{if(o.geometry&&!shared.has(o.geometry))geos.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(m.userData.homeDraft139||m.userData.homeOwned139)mats.add(m);});for(const g of geos)g.dispose();for(const m of mats)m.dispose();
}
function rebuildHomeDecor139(){
 for(const root of world.userData.homeDecorRoots139?.values()??[])disposeHomeObject139(root);world.userData.homeDecorRoots139=new Map();
 colliders=colliders.filter(c=>!c.homeDecor139);
 for(const p of (housing139().home?.placements??[]).filter(p=>(p.area??'room')===homeArea139())){const q=HOME_DECOR139[p.item],g=homeDecorModel139(p.item,world);seatHomeDecor139(g,p);world.userData.homeDecorRoots139.set(p.uid,g);
  if(q.solid){const f=homeFootprint139(p);obstacle(p.x,p.z,f.w,f.d,q.name);colliders.at(-1).homeDecor139=p.uid;}
 }
 rebuildColliderGrid();world.updateMatrixWorld(true);
}
function ensureHomeDecor139(){
 if(homeDecor139.root)return homeDecor139.root;const r=document.createElement('section');r.id='home-decor139';r.hidden=true;r.setAttribute('aria-label','Home decoration');document.body.append(r);homeDecor139.root=r;return r;
}
function startHomeDecor139(){
 if(state.scene!=='homeInterior139'||!housing139().home||battle||gameLoading)return;
 closeHousing139();closeMenu();ensureHomeDecor139();homeDecor139.active=true;homeDecor139.category='All';menu={tab:'homeDecor139',previous:state.mode};keys.clear();route=null;document.body.classList.add('home-decorating139');homeDecor139.root.hidden=false;renderHomeDecor139();updateCamera(1,true);
}
function cancelHomeDraft139(){
 const q=homeDecor139;if(q.original)world.userData.homeDecorRoots139.get(q.original.uid)?.traverse(o=>o.visible=true);disposeHomeObject139(q.ghost);disposeHomeObject139(q.outline);q.draft=q.original=q.ghost=q.outline=q.valid=null;if(q.active)renderHomeDecor139();
}
function stopHomeDecor139(){
 cancelHomeDraft139();homeDecor139.active=false;if(homeDecor139.root)homeDecor139.root.hidden=true;document.body.classList.remove('home-decorating139');if(menu?.tab==='homeDecor139')menu=null;keys.clear();camera.clearViewOffset();updateCamera(1,true);autoSave();
}
function homeSnap139(p,item){
 const q=HOME_DECOR139[item],l=homeLayout139(),snap=n=>Math.round(n*4)/4;
 const row={item,area:homeArea139(),x:snap(p.x),z:snap(p.z),turn:0,surface:'floor'};
 if(q.surface==='wall'){const candidates=[['back',Math.abs(p.z+l.d/2)],['left',Math.abs(p.x+l.w/2)],['right',Math.abs(p.x-l.w/2)]];candidates.sort((a,b)=>a[1]-b[1]);row.surface=candidates[0][0];if(row.surface==='back')row.z=-l.d/2+.25;else{row.x=(row.surface==='left'?-1:1)*(l.w/2-.25);row.z=Math.min(-1,row.z);}}
 if(q.surface==='table'){const table=housing139().home.placements.filter(p=>(p.area??'room')==='room'&&HOME_DECOR139[p.item].kind==='table').sort((a,b)=>Math.hypot(a.x-row.x,a.z-row.z)-Math.hypot(b.x-row.x,b.z-row.z))[0];row.surface=table?.uid??'';}
 return row;
}
function selectHomeItem139(item,uid=null){
 cancelHomeDraft139();const q=homeDecor139,home=housing139().home,original=home.placements.find(p=>p.uid===uid);
 if(!HOME_DECOR139[item]||!homeDecorAllowed139(item)||original&&(original.area??'room')!==homeArea139()||!original&&!homeAvailable139(item)){toast('Every copy of that decoration is already placed.');return;}
 q.original=original?{...original}:null;q.draft=original?{...original}:null;
 if(!q.draft){const candidates=[],yard=homeArea139()==='yard',l=yard?{w:39,d:42}:homeLayout139();for(let x=-l.w/2+1;x<l.w/2;x+=.5)for(let z=-l.d/2+1;z<l.d/2;z+=.5){const p={...homeSnap139({x,z},item),uid:'draft'};if(validateHomePlacement139(p).ok)candidates.push(p);}candidates.sort((a,b)=>Math.hypot(a.x-(yard?-9:2),a.z-(yard?5:0))-Math.hypot(b.x-(yard?-9:2),b.z-(yard?5:0)));q.draft=candidates[0]??{...homeSnap139({x:0,z:0},item),uid:'draft'};}
 if(original)world.userData.homeDecorRoots139.get(original.uid).visible=false;
 q.ghost=homeDecorModel139(item,world);q.ghost.traverse(o=>{if(o.isLight)o.visible=false;for(const key of ['material'])if(o[key]){const copy=m=>{const c=m.clone();c.transparent=true;c.opacity=.70;c.depthWrite=false;c.userData={...c.userData,homeDraft139:true};return c;};o[key]=Array.isArray(o[key])?o[key].map(copy):copy(o[key]);}o.castShadow=false;});
 const f=homeFootprint139(q.draft),geo=new THREE.EdgesGeometry(new THREE.BoxGeometry(f.w,.12,f.d));q.outline=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color:'#c6d897',depthTest:false}));q.outline.renderOrder=90;world.add(q.outline);refreshHomeDraft139();renderHomeDecor139();
}
function refreshHomeDraft139(){
 const q=homeDecor139;if(!q.draft)return;q.valid=seatHomeDecor139(q.ghost,q.draft);const box=new THREE.Box3().setFromObject(q.ghost),center=box.getCenter(V3());q.outline.position.set(center.x,q.ghost.position.y+.035,center.z);q.outline.rotation.y=q.ghost.rotation.y;q.outline.material.color.set(q.valid.ok?'#badd9d':'#f28c72');
 const status=$('#home-placement-status139');if(status){status.textContent=q.valid.ok?'Ready to place.':q.valid.reason;status.dataset.valid=String(q.valid.ok);}const confirm=$('#home-confirm139');if(confirm)confirm.disabled=!q.valid.ok;
}
function moveHomeDraft139(dx,dz){const q=homeDecor139;if(!q.draft)return;const old=q.draft,p=homeSnap139({x:old.x+dx,z:old.z+dz},old.item);q.draft={...old,...p,turn:old.turn};refreshHomeDraft139();}
function rotateHomeDraft139(){const q=homeDecor139;if(!q.draft||HOME_DECOR139[q.draft.item].surface==='wall')return;q.draft.turn=(q.draft.turn+1)%4;refreshHomeDraft139();}
function commitHomeDraft139(){
 const q=homeDecor139,h=housing139();if(!q.draft||!validateHomePlacement139(q.draft).ok)return false;
 if(!q.original&&h.home.placements.length>=120){toast('This home holds 120 decorations. Remove one before placing another.');return false;}
 if(!q.original&&!homeAvailable139(q.draft.item)){toast('That decoration is no longer available.');return false;}
 const row={...q.draft,uid:q.original?.uid??'home-'+h.next++};
 // Moving a supporting table returns its small decorations to the collection.
 const children=q.original?h.home.placements.filter(p=>p.surface===q.original.uid):[];
 h.home.placements=h.home.placements.filter(p=>p.uid!==row.uid&&!children.some(c=>c.uid===p.uid));h.home.placements.push(row);
 q.original=null;cancelHomeDraft139();rebuildHomeDecor139();homeChange139();renderHomeDecor139();sfx('menu');if(children.length)toast('Table decorations returned to your collection.');return true;
}
function removeHomeDecor139(uid){
 const h=housing139(),p=h.home?.placements.find(p=>p.uid===uid);if(!p)return false;
 cancelHomeDraft139();h.home.placements=h.home.placements.filter(p=>p.uid!==uid&&p.surface!==uid);rebuildHomeDecor139();homeChange139();renderHomeDecor139();toast(ITEMS[p.item].name+' returned to your collection.');return true;
}
function renderHomeDecor139(){
 if(!homeDecor139.active)return;const q=homeDecor139,h=housing139(),items=Object.entries(HOME_DECOR139).filter(([id,v])=>(state.items[id]??0)>0&&homeDecorAllowed139(id)&&(q.category==='All'||v.category===q.category)),placed=h.home.placements.filter(p=>(p.area??'room')===homeArea139()),yard=homeArea139()==='yard';
 q.root.innerHTML=`<aside class="home-collection139"><header><small>MAKE THIS PLACE YOURS</small><h2>${yard?'Decorate garden':'Decorate home'}</h2><button data-home-decor="done" aria-label="Finish decorating">✕</button></header><nav aria-label="Decoration categories">${(yard?['All','Placed']:['All','Home Decor','Trophy','Placed']).map(c=>`<button data-home-category="${c}" aria-pressed="${q.category===c}">${c==='All'&&yard?'Yard collection':c==='Trophy'?'Trophies':c}</button>`).join('')}</nav><div class="home-items139">${q.category==='Placed'?(placed.length?placed.map(p=>`<button class="home-item139" data-home-move="${p.uid}"><span class="home-item-symbol139">${homeSymbol139(p.item)}</span><span>${esc(ITEMS[p.item].name)}<small>Move or remove</small></span></button>`).join(''):'<p>No decorations placed.</p>'):items.map(([id,v])=>`<button class="home-item139" data-home-item="${id}" ${!homeAvailable139(id)?'disabled':''}><span class="home-item-symbol139">${homeSymbol139(id)}</span><span>${esc(v.name)}<small>${homeAvailable139(id)} available · ${v.surface==='table'?'Tabletop':v.surface==='wall'?'Wall':yard?'Garden':'Floor'}</small></span></button>`).join('')}</div><footer>${h.home.placements.length} / 120 decorations placed · ${yard?'Garden':'Room'}<br>Find more through exploration and encounters.</footer></aside><div class="home-place-toolbar139"><div><strong>${q.draft?esc(ITEMS[q.draft.item].name):'Choose a decoration'}</strong><p id="home-placement-status139" aria-live="polite">${q.draft?(q.valid.ok?'Ready to place.':esc(q.valid.reason)):'Select an item, or click an object to move it.'}</p></div>${q.draft?`<div class="home-nudge139" aria-label="Move preview"><button data-home-decor="north" aria-label="Move north">↑</button><button data-home-decor="west" aria-label="Move west">←</button><button data-home-decor="south" aria-label="Move south">↓</button><button data-home-decor="east" aria-label="Move east">→</button></div><div class="home-place-actions139"><button data-home-decor="rotate" ${HOME_DECOR139[q.draft.item].surface==='wall'?'disabled':''}>Rotate · R</button><button id="home-confirm139" class="home-gold139" data-home-decor="confirm" ${q.valid?.ok?'':'disabled'}>Place · Enter</button><button data-home-decor="cancel">Cancel</button>${q.original?'<button data-home-decor="remove">Remove</button>':''}</div>`:'<p class="home-instruction139">Click the floor to position · Arrows to move · R to rotate · Enter to place · Esc to finish</p>'}</div>`;
}
function homeDecorPointer139(event){
 if(!homeDecor139.active||event.target!==$('#world'))return;event.preventDefault();event.stopImmediatePropagation();
 if(event.type==='pointermove'&&!event.buttons)return;
 const rect=$('#world').getBoundingClientRect(),p=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1),ray=new THREE.Raycaster();ray.setFromCamera(p,camera);
 if(!homeDecor139.draft){if(event.type!=='pointerdown')return;const hits=ray.intersectObjects([...world.userData.homeDecorRoots139.values()],true);if(hits.length){let o=hits[0].object;while(o&&!o.userData.homePlacement139)o=o.parent;const row=housing139().home.placements.find(p=>p.uid===o?.userData.homePlacement139);if(row)selectHomeItem139(row.item,row.uid);}return;}
 const hit=ray.ray.intersectPlane(new THREE.Plane(V3(0,1,0),0),V3());if(!hit)return;
 const old=homeDecor139.draft,row=homeSnap139(hit,old.item);homeDecor139.draft={...old,...row,turn:old.turn};refreshHomeDraft139();
}
for(const type of ['pointerdown','pointermove'])document.addEventListener(type,homeDecorPointer139,true);
document.addEventListener('click',e=>{
 if(!homeDecor139.active)return;const b=e.target.closest('button');if(!b)return;
 if(b.dataset.homeCategory){homeDecor139.category=b.dataset.homeCategory;renderHomeDecor139();}
 if(b.dataset.homeItem)selectHomeItem139(b.dataset.homeItem);
 if(b.dataset.homeMove){const p=housing139().home.placements.find(p=>p.uid===b.dataset.homeMove);if(p)selectHomeItem139(p.item,p.uid);}
 const action=b.dataset.homeDecor;if(!action)return;e.preventDefault();e.stopImmediatePropagation();
 if(action==='done')stopHomeDecor139();else if(action==='confirm')commitHomeDraft139();else if(action==='cancel')cancelHomeDraft139();else if(action==='rotate')rotateHomeDraft139();else if(action==='remove')removeHomeDecor139(homeDecor139.original?.uid);else{const d={north:[0,-.25],south:[0,.25],west:[-.25,0],east:[.25,0]}[action];if(d)moveHomeDraft139(...d);}
},true);
document.addEventListener('keydown',e=>{
 if(!homeDecor139.active){if(e.key.toLowerCase()==='d'&&state.scene==='homeInterior139'&&!menu&&!dialogue&&!gameLoading){e.preventDefault();e.stopImmediatePropagation();startHomeDecor139();}return;}
 if(e.key==='Tab')return;if(e.target.matches?.('select,input,textarea')&&e.key!=='Escape'){e.stopImmediatePropagation();return;}
 e.preventDefault();e.stopImmediatePropagation();keys.clear();const k=e.key.toLowerCase();
 if(k==='escape')homeDecor139.draft?cancelHomeDraft139():stopHomeDecor139();else if(k==='r')rotateHomeDraft139();else if(k==='enter')commitHomeDraft139();else if(k==='delete'&&homeDecor139.original)removeHomeDecor139(homeDecor139.original.uid);else{const d={arrowup:[0,-.25],arrowdown:[0,.25],arrowleft:[-.25,0],arrowright:[.25,0]}[k];if(d)moveHomeDraft139(...d);}
},true);
function updateHomeDecor139(){if(homeDecor139.active&&state.scene!=='homeInterior139')stopHomeDecor139();}
