// A settlement's silhouette can be found from the road. Its doors, services
// and local map are learned by exploring it, rather than reading the atlas.
const mapKnowledge50={owner:null,cells:new Map(),masks:new Map(),serial:0,elapsed:0};
function knowledge50(){
 if(mapKnowledge50.owner!==state){mapKnowledge50.owner=state;mapKnowledge50.cells.clear();mapKnowledge50.masks.clear();state.mapKnowledge50??={cells:{},interiors:[]};for(const[key,cells]of Object.entries(state.mapKnowledge50.cells??{}))mapKnowledge50.cells.set(key,new Set(cells));}
 return state.mapKnowledge50;
}
function recordMapKnowledge50(){
 if(!player||!activeScene||state.mode==='title'||loading36.mapPreparation||gameLoading)return;
 const q=knowledge50();
 if(activeScene.kind==='interior'){if(!q.interiors.includes(activeScene.key))q.interiors.push(activeScene.key);return;}
 if(activeScene.kind!=='poi')return;const key=activeScene.key,seen=mapKnowledge50.cells.get(key)??new Set();mapKnowledge50.cells.set(key,seen);
 let changed=false;for(let z=Math.floor((player.z-16)/8);z<=Math.floor((player.z+16)/8);z++)for(let x=Math.floor((player.x-16)/8);x<=Math.floor((player.x+16)/8);x++)if(Math.hypot(x*8+4-player.x,z*8+4-player.z)<=16){const cell=x+','+z;if(!seen.has(cell)){seen.add(cell);changed=true;}}
 if(changed){q.cells[key]=[...seen];mapKnowledge50.masks.delete(key);}
 for(const o of world.userData.buildingPortals48??[])if(INTERIORS[o.interior]&&dist(player,o)<12&&!q.interiors.includes(o.interior))q.interiors.push(o.interior);
}
const knowledgeSaveBefore50=normalizeJourneySave;
normalizeJourneySave=function(...args){const s=knowledgeSaveBefore50(...args),q=s.mapKnowledge50,cells={};
 for(const[key,list]of Object.entries(q?.cells??{}))if(POIS[key]&&Array.isArray(list))cells[key]=[...new Set(list.filter(v=>typeof v==='string'&&/^-?\d{1,4},-?\d{1,4}$/.test(v)))].slice(0,6000);
 s.mapKnowledge50={cells,interiors:[...new Set([...(Array.isArray(q?.interiors)?q.interiors:[]),...s.visited].filter(id=>!!INTERIORS[id]))]};return s;
};
const knowledgeTickBefore50=tick;
tick=function(dt){const result=knowledgeTickBefore50(dt);mapKnowledge50.elapsed+=dt;if(mapKnowledge50.elapsed>=.25){mapKnowledge50.elapsed=0;if(!menu)recordMapKnowledge50();}return result;};
const knowledgeLocalBefore50=localJourneyMap;
function localDiscoveryMask50(key){
 if(mapKnowledge50.masks.has(key))return mapKnowledge50.masks.get(key);const rows=new Map();for(const cell of knowledge50().cells[key]??[]){const[x,z]=cell.split(',').map(Number);if(!rows.has(z))rows.set(z,[]);rows.get(z).push(x);}
 let mask='';for(const[z,xs]of rows){xs.sort((a,b)=>a-b);let start=xs[0],end=start;const run=()=>{mask+=`<rect x="${start*8-6}" y="${z*8-6}" width="${(end-start)*8+20}" height="20" rx="8" fill="white"/>`;};for(const x of xs.slice(1))if(x===end+1)end=x;else{run();start=end=x;}run();}mapKnowledge50.masks.set(key,mask);return mask;
}
function maskSettlementMap50(svg){
 if(activeScene.kind!=='poi')return svg;
 const mask=localDiscoveryMask50(activeScene.key),id='local-discovery50-'+(++mapKnowledge50.serial),[x0,x1,z0,z1]=activeScene.bounds;
 const start=svg.indexOf('>')+1;return svg.slice(0,start)+`<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="${x0-8}" y="${z0-8}" width="${x1-x0+16}" height="${z1-z0+16}">${mask}</mask></defs><rect x="${x0-8}" y="${z0-8}" width="${x1-x0+16}" height="${z1-z0+16}" fill="#0b2c37"/><g mask="url(#${id})">`+svg.slice(start).replace('</svg>','</g></svg>');
}
localJourneyMap=function(){recordMapKnowledge50();return maskSettlementMap50(knowledgeLocalBefore50());};
const knowledgeRadarBefore50=journeyMapSVG;
journeyMapSVG=function(local=false,...args){const svg=knowledgeRadarBefore50(local,...args);return local&&activeScene.kind==='poi'?maskSettlementMap50(svg):svg;};
const knowledgeTownBefore50=worldTownModel;
worldTownModel=function(key,...args){const before=world.userData.buildings.length,result=knowledgeTownBefore50(key,...args);for(const root of world.userData.buildings.slice(before))if(root.userData.worldHouse)root.userData.atlasDiscovery50=key;return result;};
function discoveredSettlementPlaces50(key){
 const q=knowledge50(),names=q.interiors.filter(id=>INTERIORS[id]?.poi===key).map(id=>INTERIORS[id].name);
 if(key==='brookstead')for(const[id,name]of[['waterworks','Waterworks'],['yard','Workshop yard']])if(state.visited.includes(id))names.push(name);
 const p=POIS[key],ref=p&&atlasPoint18(p.atlas18);for(const id of ref?.children??[]){const child=Object.values(POIS).find(p=>p.atlas18===id);if(child&&atlasKnown(child))names.push(child.name);}
 return [...new Set(names)];
}
function updateSettlementDiscovery50(){
 const key=atlas3d.selected,p=POIS[key];if(!p||p.kind!=='town')return;
 const summaries={brookstead:'A riverside settlement among terraced woodland.',fern:'A quiet woodland settlement sheltered by ancient trees.',highmere:'Valenne’s royal city rises above the surrounding valleys.',alder:'A riverside settlement surrounded by orchards.',relief:'A refuge beside Valenne’s northern roads.',harbor:'A coastal settlement beside the open water.'},places=discoveredSettlementPlaces50(key);
 $('#atlas-description').textContent=(summaries[key]??'A settlement along the roads of Valenne.')+(places.length?' '+places.join(' · '):' Explore its paths to discover local places.');
 const note=$('.atlas-facilities18');if(note)note.textContent=places.length?'Discovered places · '+places.join(' · '):'Explore the settlement to discover its local places and services.';
}
function closeAtlasPicker50(focus=false){const picker=$('.atlas-picker50');if(!picker)return;picker.querySelector('[role=listbox]').hidden=true;const trigger=picker.querySelector('[role=combobox]');trigger.setAttribute('aria-expanded','false');if(focus)trigger.focus({preventScroll:true});}
function installAtlasPicker50(){
 const select=$('#atlas-destination');if(!select||select.closest('.atlas-picker50'))return;
 const picker=document.createElement('div');picker.className='atlas-picker50';select.before(picker);picker.append(select);select.hidden=true;select.tabIndex=-1;
 picker.insertAdjacentHTML('beforeend',`<button id="atlas-destination-trigger50" type="button" role="combobox" aria-label="Choose a discovered destination" aria-controls="atlas-destination-list50" aria-haspopup="listbox" aria-expanded="false">${icon26('map')}<span class="atlas-picker-label50">Choose a discovered destination</span><span class="atlas-picker-chevron50" aria-hidden="true">⌄</span></button><div id="atlas-destination-list50" role="listbox" aria-label="Discovered destinations" hidden><p class="eyebrow">DISCOVERED DESTINATIONS</p></div>`);
 const trigger=picker.querySelector('[role=combobox]'),list=picker.querySelector('[role=listbox]');
 for(const option of [...select.options].filter(o=>o.value)){
  const key=option.value,p=POIS[key],button=document.createElement('button');button.type='button';button.role='option';button.dataset.destination50=key;button.setAttribute('aria-selected',String(atlas3d.selected===key));button.innerHTML=(p.kind==='town'?icon26('map'):menuImage50('light'))+'<span><b>'+esc(p.name)+'</b><small>'+({town:'Settlement',clearing:'Elder Light',ruin:'Landmark',trail:'Waystation'}[p.kind]??'Destination')+'</small></span><i aria-hidden="true">✓</i>';
  button.onclick=()=>{select.value=key;select.dispatchEvent(new Event('change',{bubbles:true}));trigger.querySelector('.atlas-picker-label50').textContent=p.name;closeAtlasPicker50(true);};list.append(button);
 }
 const options=()=>[...list.querySelectorAll('[role=option]')],open=(last=false)=>{list.hidden=false;trigger.setAttribute('aria-expanded','true');const buttons=options();for(const b of buttons)b.setAttribute('aria-selected',String(b.dataset.destination50===atlas3d.selected));(last?buttons.at(-1):buttons.find(b=>b.dataset.destination50===atlas3d.selected)??buttons[0])?.focus({preventScroll:true});};
 trigger.onclick=()=>list.hidden?open():closeAtlasPicker50();
 picker.addEventListener('keydown',e=>{
  if(['ArrowDown','ArrowUp','Home','End','Escape','Enter',' '].includes(e.key)){e.preventDefault();e.stopPropagation();}
  if(e.key==='Escape')return closeAtlasPicker50(true);if(e.key==='Tab')return closeAtlasPicker50();
  if(e.target===trigger){if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key))list.hidden?open(e.key==='ArrowUp'):closeAtlasPicker50();return;}
  const buttons=options(),i=buttons.indexOf(document.activeElement);if(['Enter',' '].includes(e.key))return buttons[i]?.click();const index=e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?(i+1)%buttons.length:e.key==='ArrowUp'?(i+buttons.length-1)%buttons.length:-1;if(index>=0)buttons[index]?.focus({preventScroll:true});
 });
}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.atlas-picker50'))closeAtlasPicker50();},{passive:true});
const knowledgeAtlasBefore50=renderAtlasMenu;
renderAtlasMenu=function(el){const result=knowledgeAtlasBefore50(el);for(const pin of $$('.atlas-pin'))pin.addEventListener('click',updateSettlementDiscovery50);$('#atlas-destination')?.addEventListener('change',updateSettlementDiscovery50);updateSettlementDiscovery50();installAtlasPicker50();return result;};
