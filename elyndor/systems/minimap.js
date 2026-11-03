// One north-up icon language for the live radar and the explored local map.
// PixelLab sprites stay a fixed screen size while the terrain zooms beneath them.
const minimap51={zoom:1,base:null,baseKey:'',markerKey:'',elapsed:0};
const MAP_ICONS51={
 player:['Player','Current location and facing direction.'],
 mainQuest:['Main story quest','The primary story objective you are tracking.'],
 sideQuest:['Side quest','An available or accepted optional quest objective.'],
 questNpc:['New quest NPC','A person offering an available local request.'],
 inn:['Inn / lodging','Rest and lodging services.'],
 vendor:['General vendor','Supplies and consumable items.'],
 smith:['Equipment shop / blacksmith','Weapons, armor, and equipment services.'],
 north:['North','Map orientation reference. The minimap is always north-up.'],
 destination:['Settlement / destination','Town landmarks and discovered places on the overworld.'],
 exit:['Area exit','An explored approach leading back to the overworld.'],
 save:['Save point / Elder Light','A discovered place to record your journey.']
};
const mapIconUrl51=kind=>assets.images[kind==='exit'?'ui50_pin':kind==='save'?'ui50_light':kind==='destination'?'ui50_diamond':'ui51_'+kind];
function mapFacing51(){
 const i=Math.max(0,WALK_DIRECTIONS.indexOf(player.face)),a=i*Math.PI/4,b=screenBasis();
 return Math.atan2(b.right.x*Math.cos(a)+b.down.x*Math.sin(a),-(b.right.z*Math.cos(a)+b.down.z*Math.sin(a)))*180/Math.PI;
}
function mapSeen51(x,z){
 if(activeScene.kind!=='poi')return true;
 // Match the soft edge of the existing explored-cell mask, without revealing
 // people or service names in an unexplored part of the settlement.
 const seen=mapKnowledge50.cells.get(activeScene.key);if(!seen)return false;
 for(let iz=Math.floor((z-14)/8);iz<=Math.floor((z+6)/8);iz++)for(let ix=Math.floor((x-14)/8);ix<=Math.floor((x+6)/8);ix++)if(seen.has(ix+','+iz))return true;
 return false;
}
function requestGiver51(){
 if(activeScene.kind!=='poi')return null;
 if(world.userData.questGiver51)return world.userData.questGiver51;
 const board=interactables.find(o=>o.type==='localBoard');if(!board)return null;
 const services=new Set(interactables.map(o=>o.serviceNpc45).filter(Boolean));
 const people=interactables.filter(o=>o.type==='npcConversation'&&o.actor.mesh.visible&&!o.actor.animal&&!o.actor.wildlife&&!services.has(o.actor)&&!['representative','tavin','mira','lysa','soren'].includes(o.actor.id)&&(!npcPrimary45(o.actor)||npcPrimary45(o.actor).type==='villager'));
 people.sort((a,b)=>dist(a,board)-dist(b,board));
 const person=people[0];if(!person)return null;const action=npcPrimary45(person.actor)??person;action.name??=person.name;return world.userData.questGiver51=action;
}
const questNpcActBefore51=act;
act=function(o,...args){
 const giver=requestGiver51();
 if(o&&o===giver&&requestsUnlocked16()&&!requestState16(activeScene.key).claimed&&departureControlAvailable()&&interactionAvailable(o)&&dist(player,o)<(o.radius??2.8)){
  // The resident offers the already-authored local request, using its existing
  // acceptance, checkpoint and reward flow. No quest is granted by the icon.
  o.actor.face=facingForMotion(player.x-o.x,player.z-o.z);o.actor.route=null;o.actor.wait=Math.max(o.actor.wait??0,5);
  openMenu('requests');return;
 }
 return questNpcActBefore51(o,...args);
};
function mapMarkers51(){
 const markers=[],add=(kind,o,label,id,tracked=false)=>{if(o&&Number.isFinite(o.x)&&Number.isFinite(o.z)&&(tracked||mapSeen51(o.x,o.z)))markers.push({kind,x:o.actor?.x??o.x,z:o.actor?.z??o.z,label,id:id??o.id??kind});};
 const tracked=trackedQuest48();
 if(tracked)add(tracked.kind==='story'?'mainQuest':'sideQuest',tracked.target,tracked.label,'tracked-quest',true);
 if(activeScene.kind==='poi'){
  const known=knowledge50().interiors;
  for(const o of interactables.filter(o=>o.interior&&known.includes(o.interior))){
   const spec=INTERIORS[o.interior],kind=spec.type==='inn'?'inn':spec.type==='shop'?(spec.category==='equipment'?'smith':'vendor'):null;
   if(kind)add(kind,o,spec.name,o.interior);
  }
  if(requestsUnlocked16()){
   const key=activeScene.key,q=requestState16(key),giver=requestGiver51();
   if(!q.accepted&&!q.claimed){if(giver?.actor.mesh.visible)add('questNpc',giver,giver.name+' · '+LOCAL_REQUESTS16[key].title,'quest-giver');else if(!giver)add('sideQuest',interactables.find(o=>o.type==='localBoard'),'Local request · '+LOCAL_REQUESTS16[key].title,'request-board');}
   if(q.accepted&&!q.claimed)for(const o of interactables.filter(o=>o.type==='localTask'&&interactionAvailable(o)))if(o!==tracked?.target)add('sideQuest',o,o.label,'task-'+o.taskIndex);
  }
  for(const o of interactables.filter(o=>o.type==='poiExit'))add('exit',o,o.label,'exit-'+o.x+','+o.z);
  for(const o of interactables.filter(o=>o.type==='saveCircle'))add('save',o,o.label,'save-'+o.x+','+o.z);
 }else if(activeScene.kind==='interior'){
  const spec=INTERIORS[activeScene.key],kind=spec?.type==='inn'?'inn':spec?.type==='shop'?(spec.category==='equipment'?'smith':'vendor'):null;
  if(kind)add(kind,interactables.find(o=>['shop','sleep','inn'].includes(o.type)),spec.name,'interior-service');
 }else{
  for(const[key,p]of Object.entries(POIS))if(atlasVisible52(p))add('destination',{x:p.node[0],z:p.node[1]},p.name,key);
 }
 return markers;
}
// Metadata is generated from the native PixelLab sources; transparent padding
// never changes the visible size of a service, quest or party symbol.
const MAP_GLYPHS52={"player":{"w":96,"h":96,"box":[14,9,69,77]},"mainQuest":{"w":96,"h":96,"box":[10,5,76,91]},"sideQuest":{"w":96,"h":96,"box":[17,11,62,74]},"questNpc":{"w":96,"h":96,"box":[15,8,68,73]},"inn":{"w":96,"h":96,"box":[17,7,62,84]},"vendor":{"w":96,"h":96,"box":[16,12,64,73]},"smith":{"w":96,"h":96,"box":[17,10,63,75]},"north":{"w":96,"h":96,"box":[19,18,60,61]},"exit":{"w":32,"h":32,"box":[6,4,19,24]},"save":{"w":96,"h":96,"box":[8,11,80,75]},"destination":{"w":24,"h":24,"box":[3,3,18,18]}};
function iconGeometry52(kind,size){
 const m=MAP_GLYPHS52[kind]??{w:96,h:96,box:[0,0,96,96]},[x,y,w,h]=m.box,k=size/Math.max(w,h);
 return{x:-(x+w/2)*k,y:-(y+h/2)*k,width:m.w*k,height:m.h*k};
}
function mapIcon51(kind,x,z,size,label,id){
 const q=iconGeometry52(kind,size);
 return `<g class="map-icon51" data-map-icon51="${kind}" data-map-id51="${esc(id)}" transform="translate(${x} ${z})"><title>${esc(label)}</title><image href="${mapIconUrl51(kind)}" x="${q.x}" y="${q.y}" width="${q.width}" height="${q.height}" preserveAspectRatio="xMidYMid meet"/></g>`;
}
const mapSize51=kind=>kind==='mainQuest'?36:kind==='player'?26:kind==='north'?20:['exit','save','destination'].includes(kind)?24:30;
function legendGlyph52(kind){
 const m=MAP_GLYPHS52[kind]??{w:96,h:96,box:[0,0,96,96]};
 return `<svg class="legend-glyph52" viewBox="${m.box.join(' ')}" aria-hidden="true"><image href="${mapIconUrl51(kind)}" width="${m.w}" height="${m.h}"/></svg>`;
}
const mapLocalBefore51=localJourneyMap,mapJourneyBefore51=journeyMapSVG;
function mapBase51(clone=true){
 knowledge50();const key=[world.userData.serial,activeScene.kind,activeScene.key,knowledge50().cells[activeScene.key]?.length,state.visited.length,state.flags.gate_open,state.flags.prologue_complete].join('|');
 if(key===minimap51.baseKey&&minimap51.base)return clone?minimap51.base.cloneNode(true):minimap51.base;
 const text=activeScene.kind==='poi'?mapLocalBefore51():mapJourneyBefore51(true),doc=new DOMParser().parseFromString(text.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '),'image/svg+xml'),svg=doc.documentElement;
 // Remove all legacy party/NPC/objective dots and their letter glyphs. Keep
 // the original terrain, roads, building footprints and exploration mask.
 for(const node of svg.querySelectorAll('circle,text'))if(!node.closest('defs'))node.remove();
 svg.setAttribute('data-map51','north-up');svg.setAttribute('aria-label','North-up local map with player direction, quests and discovered services');
 minimap51.baseKey=key;minimap51.base=svg;return clone?svg.cloneNode(true):svg;
}
function mapLayer51(svg,pixels,radar=false){
 const vb=svg.getAttribute('viewBox').split(/\s+/).map(Number),unit=vb[2]/pixels,markers=mapMarkers51();
 let layer=svg.querySelector('[data-map-layer51]');if(!layer){layer=document.createElementNS('http://www.w3.org/2000/svg','g');layer.setAttribute('data-map-layer51','');svg.append(layer);}
 const priority={destination:0,exit:0,save:0,inn:1,vendor:1,smith:1,questNpc:2,sideQuest:3,mainQuest:4};markers.sort((a,b)=>priority[a.kind]-priority[b.kind]);
 markers.push({kind:'player',x:player.x,z:player.z,label:'Party · '+player.face,id:'party'});
 const existing=new Map([...layer.children].map(n=>[n.dataset.mapId51+':'+n.dataset.mapIcon51,n])),set=(n,k,v)=>{v=String(v);if(n.getAttribute(k)!==v)n.setAttribute(k,v);};
 for(const m of markers){
  const key=m.id+':'+m.kind;let node=existing.get(key);
  if(node)existing.delete(key);else{node=document.createElementNS('http://www.w3.org/2000/svg','g');node.classList.add('map-icon51');node.dataset.mapIcon51=m.kind;node.dataset.mapId51=m.id;const title=document.createElementNS('http://www.w3.org/2000/svg','title'),im=document.createElementNS('http://www.w3.org/2000/svg','image');im.setAttribute('href',mapIconUrl51(m.kind));node.append(title,im);layer.insertBefore(node,layer.querySelector('[data-map-icon51=player]'));}
  const title=node.querySelector('title');if(title.textContent!==m.label)title.textContent=m.label;
  set(node,'transform',`translate(${m.x} ${m.z})`+(m.kind==='player'?` rotate(${mapFacing51()})`:''));
  for(const[k,v]of Object.entries(iconGeometry52(m.kind,mapSize51(m.kind)*unit*(radar?Math.min(1,Math.max(.65,pixels/220)):1))))set(node.querySelector('image'),k,v);
 }
 for(const node of existing.values())node.remove();return svg;
}
function localMap51(){
 const svg=mapBase51(),w=Math.max(260,$('#menu-content')?.clientWidth-50||900),vb=svg.getAttribute('viewBox').split(/\s+/).map(Number);
 mapLayer51(svg,w);
 svg.insertAdjacentHTML('beforeend',mapIcon51('north',vb[0]+vb[2]*.96,vb[1]+vb[3]*.07,22*vb[2]/w,'North','north'));
 return new XMLSerializer().serializeToString(svg);
}
localJourneyMap=localMap51;
journeyMapSVG=function(local=false,...args){return local?localMap51():mapJourneyBefore51(local,...args);};
function updateRadar36(node){
 if(!player||!activeScene)return;
 const width=(node.clientWidth||250)*.848,span=(activeScene.kind==='overworld'?180:activeScene.kind==='interior'?34:96)/minimap51.zoom;
 let svg=node.querySelector('svg');
 const base=mapBase51(false);
 if(node.dataset.base51!==minimap51.baseKey||!svg){
  const terrain=document.createElementNS('http://www.w3.org/2000/svg','g');terrain.setAttribute('data-map-terrain52','');for(const child of [...base.children])terrain.append(child.cloneNode(true));
  if(!svg){svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('data-map51','north-up');svg.setAttribute('aria-hidden','true');node.prepend(svg);}
  const old=svg.querySelector('[data-map-terrain52]');if(old)old.replaceWith(terrain);else svg.prepend(terrain);
  node.dataset.base51=minimap51.baseKey;minimap51.markerKey='';
 }
 svg.setAttribute('viewBox',`${player.x-span/2} ${player.z-span/2} ${span} ${span}`);
 const signature=[span,width,Math.floor(clock*8),state.beat,state.storyTracked48,state.trackedRequest16,knowledge50().interiors.join(',')].join('|');
 if(signature!==minimap51.markerKey){mapLayer51(svg,width,true);minimap51.markerKey=signature;}
 const arrow=svg.querySelector('[data-map-icon51=player]');if(arrow)arrow.setAttribute('transform',`translate(${player.x} ${player.z}) rotate(${mapFacing51()})`);
 node.setAttribute('aria-label',`Local minimap, north-up, ${Math.round(minimap51.zoom*100)} percent zoom. Scroll here to zoom; click to open local map.`);
 node.dataset.zoom51=minimap51.zoom.toFixed(2);
 if(!node.dataset.controls51){
  node.dataset.controls51='ready';node.title='Local minimap · Scroll to zoom · Click to open local map';node.onclick=()=>openLocalMap52();
  node.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();minimap51.zoom=clamp(minimap51.zoom*Math.exp(-e.deltaY*.0015),.6,2.5);updateRadar36(node);},{passive:false});
  node.addEventListener('keydown',e=>{if(!['+','=','-','_','0'].includes(e.key))return;e.preventDefault();e.stopPropagation();minimap51.zoom=e.key==='0'?1:clamp(minimap51.zoom*(['+','='].includes(e.key)?1.2:1/1.2),.6,2.5);updateRadar36(node);});
 }
}
function minimapPreview51(){
 const svg=mapBase51(),span=(activeScene.kind==='overworld'?180:activeScene.kind==='interior'?34:96)/minimap51.zoom;
 svg.setAttribute('viewBox',`${player.x-span/2} ${player.z-span/2} ${span} ${span}`);mapLayer51(svg,350,true);
 svg.insertAdjacentHTML('beforeend',mapIcon51('north',player.x,player.z-span*.43,22*span/350,'North','north'));return new XMLSerializer().serializeToString(svg);
}
function showMapLegend51(){
 let dialog=$('#minimap-legend51');if(dialog)return;
 dialog=document.createElement('dialog');dialog.id='minimap-legend51';dialog.setAttribute('aria-labelledby','map-legend-title51');
 dialog.innerHTML='<header><div><p class="eyebrow">THE LAST LIGHT OF ELYNDOR</p><h2 id="map-legend-title51">Minimap icon legend</h2></div><button type="button" aria-label="Close icon legend">Esc <span aria-hidden="true">×</span></button></header><div class="legend-body51"><div class="legend-preview51"><div class="legend-radar51">'+minimapPreview51()+'</div><p>North stays at the top.<br>Scroll over the minimap to zoom.</p><small>Town landmarks stay visible. Explore their streets to discover local services.</small></div><dl>'+Object.entries(MAP_ICONS51).map(([key,[name,description]])=>'<div><dt>'+legendGlyph52(key)+'<span>'+name+'</span></dt><dd>'+description+'</dd></div>').join('')+'</dl></div>';
 document.body.append(dialog);const close=()=>{dialog.close();dialog.remove();$('[data-map-legend51]')?.focus({preventScroll:true});};
 dialog.querySelector('header button').onclick=close;
 dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 dialog.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){e.preventDefault();close();}});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
 dialog.showModal();dialog.querySelector('header button').focus({preventScroll:true});
}
const mapRenderBefore51=renderMap;
let mapResize51=null;
function sizeLocalMap51(svg){
 if(!svg?.isConnected)return;const r=svg.getBoundingClientRect(),v=svg.viewBox.baseVal,unit=Math.max(v.width/r.width,v.height/r.height);
 if(!Number.isFinite(unit))return;
 for(const icon of svg.querySelectorAll('[data-map-icon51]')){const im=icon.querySelector('image'),size=mapSize51(icon.dataset.mapIcon51)*unit;for(const[k,value]of Object.entries(iconGeometry52(icon.dataset.mapIcon51,size)))im.setAttribute(k,value);}
}
renderMap=function(el){
 const result=mapRenderBefore51(el),footer=el.querySelector('.atlas3d-controls')??el.querySelector('.map-legend');
 if(footer){if(footer.matches('.map-legend'))footer.textContent='Explored local paths · North-up map';const button=document.createElement('button');button.type='button';button.dataset.mapLegend51='';button.innerHTML='<img src="'+mapIconUrl51('mainQuest')+'" alt="">Icon legend';button.onclick=showMapLegend51;footer.append(button);}
 mapResize51?.disconnect();const svg=el.querySelector('#continuous-map svg');if(svg){sizeLocalMap51(svg);mapResize51=new ResizeObserver(()=>sizeLocalMap51(svg));mapResize51.observe(svg);requestAnimationFrame(()=>sizeLocalMap51(svg));}
 return result;
};
const minimapRenderBefore51=render;
render=function(...args){const r=minimapRenderBefore51(...args);if(player&&!menu&&!gameLoading){const node=$('#overworld-radar');if(node)updateRadar36(node);}return r;};
const minimapBootBefore51=boot;
boot=async function(...args){
 const r=await minimapBootBefore51(...args);document.body.dataset.minimap51='ready';document.documentElement.style.setProperty('--minimap-north51',`url("${mapIconUrl51('north')}")`);
 const before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before());q.minimap={northUp:true,zoom:+minimap51.zoom.toFixed(2),playerAngle:+mapFacing51().toFixed(1),icons:mapMarkers51().map(({kind,label,x,z})=>({kind,label,x:+x.toFixed(1),z:+z.toFixed(1)})),legend:!!$('#minimap-legend51')};return JSON.stringify(q);};return r;
};
