// PixelLab artwork supplies the shared menu skin; labels, values and actions
// remain live DOM controls over the same playable terrain atlas.
const conceptMenus50={installed:false,owner:null};
const menuImage50=(name,cls='')=>`<img class="${cls}" src="${assets.images['ui50_'+name]}" alt="" draggable="false">`;
function installConceptMenus50(){
 if(conceptMenus50.installed||!assets.images.ui50_header)return;
 conceptMenus50.installed=true;document.body.dataset.interface50='ready';
 for(const key of['header','frame','button','foliage','compass','light','village','diamond','pin','coin'])document.documentElement.style.setProperty('--ui50-'+key,`url("${assets.images['ui50_'+key]}")`);
 document.documentElement.style.setProperty('--ui50-clouds',`url("${assets.images.cloudMask}")`);
 const compass=$('.menu-compass26');if(compass)compass.src=assets.images.ui50_compass;
}
function fitAtlasExtent50(bounds,kind){
 const [x0,x1,z0,z1]=bounds,area=$('#atlas3d-view');if(!area)return;
 const rect=area.getBoundingClientRect(),aspect=rect.width/rect.height,tan=Math.tan(THREE.MathUtils.degToRad(atlas3d.camera.fov*.5)),pitch=1.05,sy=Math.sin(pitch),sz=Math.cos(pitch),cx=(x0+x1)/2,cz=(z0+z1)/2,cy=8;
 let distance=100;for(const x of[x0,x1])for(const z of[z0,z1])for(const y of[-2,90]){const xx=x-cx,zz=z-cz,yy=y-cy,depth=zz*sz+yy*sy;distance=Math.max(distance,depth+Math.abs(xx)/(tan*aspect*.91),depth+Math.abs(yy*sz-zz*sy)/(tan*.91));}
 atlas3d.target.set(cx,cy,cz);atlas3d.yaw=0;atlas3d.pitch=pitch;atlas3d.distance=Math.min(5500,distance);atlas3d.extent50=kind;atlas3d.camera.far=14000;atlas3d.scene.fog.near=6000;atlas3d.scene.fog.far=14000;
 const button=$('#atlas-fit');if(button){button.innerHTML=icon26('map')+'<span>'+(kind==='region'?'Whole world':'View region')+'</span>';button.title=kind==='region'?'Show every continent and its complete coastal waters':'Show Valenne and its surrounding coast';}drawAtlas3d();
}
const conceptFocusBefore50=focusAtlasPlayer;
focusAtlasPlayer=function(){const result=conceptFocusBefore50();const p=atlasJourneyPoint();atlas3d.target.y=Math.max(0,macroGround(p.x,p.z))+2;atlas3d.distance=160;atlas3d.pitch=1.02;atlas3d.extent50='party';drawAtlas3d();return result;};
const conceptAtlasBefore50=renderAtlasMenu;
renderAtlasMenu=function(el){
 const result=conceptAtlasBefore50(el);installConceptMenus50();const root=el.querySelector('.atlas3d');if(!root)return result;
 root.classList.add('atlas50');const head=$('.atlas3d-header>div');head.classList.add('atlas50-title');head.insertAdjacentHTML('afterbegin',menuImage50('light','atlas50-emblem'));head.querySelector('.eyebrow').textContent='VALENNE & THE WIDER WORLD · EXPLORER’S ATLAS';
 $('#atlas-player').innerHTML=menuImage50('pin')+'<span>Locate party</span>';
 $('#atlas-fit').innerHTML=icon26('map')+'<span>'+(atlas3d.extent50==='region'?'Whole world':'View region')+'</span>';
 $('#atlas-local').innerHTML=icon26('journal')+'<span>Local map</span>';
 $('#atlas-fit').title='Show Valenne, then the wider world';$('#atlas-fit').onclick=()=>{
  if(atlas3d.extent50==='region')fitAtlasExtent50([LAND.minX-160,LAND.maxX+160,LAND.minZ-160,LAND.maxZ+160],'world');
  else{const p=Object.values(POIS).map(p=>p.node);fitAtlasExtent50([Math.min(...p.map(p=>p[0]))-100,Math.max(...p.map(p=>p[0]))+100,Math.min(...p.map(p=>p[1]))-100,Math.max(...p.map(p=>p[1]))+100],'region');}
 };
 const info=$('.atlas3d-info'),copy=info.firstElementChild;info.classList.add('concept-panel50');copy.classList.add('atlas50-copy');info.insertAdjacentHTML('afterbegin',menuImage50('village','atlas50-vignette'));
 const update=()=>{const p=POIS[atlas3d.selected],eyebrow=copy.querySelector('.eyebrow');if(p){eyebrow.innerHTML=menuImage50('pin')+'LANDMARK · '+esc(p.name.toUpperCase());$('#atlas-selection').textContent=p.name;const img=info.querySelector('.atlas50-vignette');img.src=assets.images[p.kind==='town'?'ui50_village':'ui50_light'];img.classList.toggle('light50',p.kind!=='town');}else eyebrow.textContent='EXPLORE · VALENNE & THE WIDER WORLD';
  $('#atlas-track').innerHTML=menuImage50('diamond')+'<span>'+(state.trackedPoi===atlas3d.selected?'Destination tracked':'Track destination')+'</span>';
  $('#atlas-travel').innerHTML=menuImage50('light')+'<span>Fast travel</span><b aria-hidden="true">»</b>';
 };
 for(const pin of $$('.atlas-pin')){pin.innerHTML=menuImage50('diamond','atlas50-pin-gem')+'<span>'+esc(POIS[pin.dataset.location].name)+'</span>';pin.addEventListener('click',update);}
 // Selection highlights the location; only explicit map controls move the view.
 $('#atlas-destination').addEventListener('change',()=>drawAtlas3d());
 $('#atlas-track').addEventListener('click',update);
 $('.atlas3d-controls').innerHTML='<div class="atlas50-mouse-help">'+['Drag · Pan','Right-drag · Rotate','Scroll · Zoom'].map(t=>'<span>'+menuImage50('mouse')+t+'</span>').join('')+'</div><span>Arrows · Pan &nbsp;&nbsp; Q / E · Rotate &nbsp;&nbsp; + / − · Zoom</span>';
 const compass=$('#atlas-heading-north');compass.innerHTML='<span>N</span>'+menuImage50('diamond');
 const facilities=$('.atlas-facilities18');if(facilities)facilities.classList.add('atlas50-note');
 // The selected card always describes a real discovered place, including when
 // opening the atlas without an earlier pin selection.
 const known=$$('.atlas-pin'),p=atlasJourneyPoint();let selected=known.find(b=>b.dataset.location===atlas3d.selected);
 if(!selected)selected=known.slice().sort((a,b)=>dist({x:POIS[a.dataset.location].node[0],z:POIS[a.dataset.location].node[1]},p)-dist({x:POIS[b.dataset.location].node[0],z:POIS[b.dataset.location].node[1]},p))[0];
 if(selected)selected.click();else update();
 if(conceptMenus50.owner!==state){conceptMenus50.owner=state;focusAtlasPlayer();}
 return result;
};
// Town landmarks stay visible before discovery. The land remains richly coloured,
// with a restrained cool wash instead of a grey rectangular fog patch.
const conceptFogBefore50=mapFog17;
mapFog17=function(m){conceptFogBefore50(m);if(m.isShaderMaterial||m.userData.conceptFog50)return;m.userData.conceptFog50=true;const before=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=sh=>{before(sh);sh.fragmentShader=sh.fragmentShader.replace('mix(mix(vec3(lum17)*vec3(.66,.76,.77),outgoingLight,.24),outgoingLight,smoothstep(.05,.85,seen17))','mix(mix(outgoingLight*.82,vec3(.065,.115,.12),.12),outgoingLight,smoothstep(.05,.85,seen17))');};m.customProgramCacheKey=()=>key+'-coloured-exploration50';m.needsUpdate=true;
};
const conceptMenuBefore50=renderMenu;
renderMenu=function(...args){
 const result=conceptMenuBefore50(...args);if(!menu)return result;installConceptMenus50();$('#menu-gold').innerHTML=menuImage50('coin')+'<span>'+state.gold.toLocaleString()+'</span>';
 const compass=$('.menu-compass26');if(compass)compass.src=assets.images.ui50_compass;
 for(const node of $$('.settings-section26,.party-details26>section,.equipped-panel27,.gear-catalog27,.item-detail27,.objective-entry26,.compare-panel27,.journal-library26,.inventory-list27'))node.classList.add('concept-panel50');
 if(menu.tab==='map'&&menu.mapScale==='local'){$('#continuous-map')?.classList.add('concept-panel50');const back=$('.atlas-return');if(back)back.innerHTML=icon26('map')+'<span>World map</span>';}
 return result;
};
