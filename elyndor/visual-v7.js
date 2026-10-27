// PixelLab visual layer. The earlier generation's art is never a v7 fallback.
if(ASSETS.artRevision==='pixellab-v7'){
 const replaceBeforePixelLab=replaceActorArt;
 replaceActorArt=function(a,id){a.visualId=id;replaceBeforePixelLab(a,id);};
 function setResidentAppearance(a,id){
  if(!assets.sprites[id])throw Error('Missing unique resident art: '+id);
  const semantic=a.id;replaceActorArt(a,id);a.id=semantic;a.visualId=id;
 }
 // Each regional person has a separate newly drawn identity. No shader cuts
 // or recolored body bands are used to turn one person's sprite into another.
 residentTint=function(){};
 const residentsBeforePixelLab=addRegionalResidents;
 addRegionalResidents=function(){residentsBeforePixelLab();for(const a of npcs)if(a.instanceId&&assets.sprites[a.instanceId])setResidentAppearance(a,a.instanceId);};

 card=function(id){
  const c=state.characters[id],s=stats(id),a=CAST[id];
  const face=assets.portraitFaces[id];
  return `<div class="party-card" data-character="${id}"><div class="portrait-frame"><img class="portrait" src="${face}" alt="${esc(a.name)}"></div><div class="card-info"><div class="card-title">${esc(a.name)}<small>Lv ${c.level}${c.ascended?' · Ascended':''}</small></div><div class="meter-label"><span>HP</span><span>${c.hp} / ${s.hp}</span></div><div class="meter"><i style="width:${clamp(c.hp/s.hp*100,0,100)}%"></i></div><div class="meter-label" style="margin-top:5px"><span>MP</span><span>${c.mp} / ${s.mp}</span></div><div class="meter mp"><i style="width:${clamp(c.mp/s.mp*100,0,100)}%"></i></div>${battle?`<div class="meter-label" style="margin-top:5px"><span>${c.ascended?'ARMOR ACTIVE':'ASCENSION'}</span><span>${c.ascended?'∞':c.charge+'%'}</span></div><div class="meter charge"><i style="width:${c.ascended?100:c.charge}%"></i></div>`:''}</div></div>`;
 };
 const menuBeforePixelLab=renderMenu;
 renderMenu=function(){
  menuBeforePixelLab();if(!menu)return;
  $('.menu-shell').dataset.page=menu.tab;
  for(const row of $$('#menu-content .item-row')){
   const name=row.querySelector('h4')?.textContent;
   const key=Object.keys(ITEMS).find(k=>ITEMS[k].name===name),icon=row.querySelector('.item-icon');
   const image=key&&assets.images['icon_'+key];if(icon&&image)icon.innerHTML=`<img src="${image}" alt="">`;
  }
 };
 const battleBeforePixelLab=renderBattle;
 renderBattle=function(...args){
  battleBeforePixelLab(...args);if(!battle)return;
  for(const button of $$('#battle-targets button')){
   const enemy=battle.enemies[Number(button.dataset.enemy)];
   const id=enemy?.actor?.id??enemy?.id??enemy?.kind;
   const image=assets.figures[id];if(image){const badge=document.createElement('img');badge.className='enemy-badge';badge.src=image;badge.alt='';button.prepend(badge);}
  }
 };
 let dialogueActorHint=null;
 const actBeforePixelLab=act;
 act=function(o){dialogueActorHint=o?.type==='villager'?o.actor:null;return actBeforePixelLab(o);};
 const dialogueBeforePixelLab=showDialogue;
 showDialogue=function(){
  dialogueBeforePixelLab();if(!dialogue)return;
  const speaker=dialogue.lines[dialogue.index][0],main=Object.values(CAST).some(c=>c.name===speaker);
  const id=dialogueActorHint?.visualId??dialogueActorHint?.id;
  if(!main&&id&&assets.portraits[id]){
   const el=$('#dialogue-portrait');el.style.backgroundImage=`url('${assets.portraits[id]}')`;el.style.display='block';
   const role=dialogueActorHint.interaction?.label?.replace(/^Talk to the /,'');
   if(role)$('#speaker').textContent=role[0].toUpperCase()+role.slice(1);
  }
 };
 const loadBeforePixelLab=loadAssets;
 loadAssets=async function(){
  await loadBeforePixelLab();
  document.documentElement.style.setProperty('--pixel-panel',`url("${assets.images.uiFrame}")`);
  document.documentElement.style.setProperty('--map-paper',`url("${assets.images.regionMap}")`);
 };

 // Let the authored texture ramps supply the color. Earlier mesh tints were
 // designed for a different art set and would double-darken the new palette.
 const materialBeforePixelLab=material;
 material=function(key,color='#ffffff',options={}){
  const m=materialBeforePixelLab(key,color,options);
  if(terrainTileNames.includes(key)&&!m.userData.pixelLabTint){m.color.lerp(new THREE.Color('#ffffff'),.7);m.userData.pixelLabTint=true;}
  return m;
 };
 // Eight leafy lobes break up the ball-like canopy while retaining the same
 // triangle budget and the existing instanced wind, lighting and cutaways.
 const forestBeforePixelLab=forestGeometry;
 forestGeometry=function(kind){
  if(kind==='trunk'||kind==='pine')return forestBeforePixelLab(kind);
  const key='pixellab-crown-'+kind;if(sharedGeo[key])return sharedGeo[key];
  const positions=[],normals=[],uv=[];
  for(let i=0;i<8;i++){
   const a=i*2.399963,top=i===7,r=top?.18:.53,c=V3(Math.cos(a)*r,top?.6:Math.sin(i*1.7)*.35,Math.sin(a)*r);
   const g=new THREE.IcosahedronGeometry(1,1);g.scale(.54+(i%3)*.06,top?.96:.83,.58);g.translate(c.x,c.y,c.z);
   positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);g.dispose();
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeBoundingSphere();sharedGeo[key]=g;return g;
 };
 // Borders, paths and lighting remain actual 3D surfaces; only their art set
 // changes. Geometry and collision checks share the same authored positions.
 const settlementsBeforePixelLab=buildSettlements;
 buildSettlements=function(){
  settlementsBeforePixelLab();
  for(const g of world.userData.buildings){
   const x=g.position.x,z=g.position.z;if(x<-45&&z>30&&z<130){
    const y=groundAt(x,z),w=g.userData.footprint?.w??6;
    // Deliberately keep planting beside walls, never over an entrance or road.
    for(const side of[-1,1]){const px=x+side*(w*.5+.65),pz=z+1.8;if(roadDistance(px,pz)>3.4&&!waterGround(px,pz)){plant(px,pz,.65,'flower');plant(px+.3,pz+.25,.45,'fern');}}
   }
  }
 };
 window.__elyVisualRevision='pixellab-v7';
}
