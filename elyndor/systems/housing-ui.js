// Housing uses the existing navy/gold visual language, with native game-model previews.
const housingMenu139={open:false,page:'greeting',index:0,layout:'hearth',confirm:null,message:'',root:null,previewKey:'',previewCache:new Map(),previewBusy:false,previewDirty:false};
const HOME_ICON139='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 22 24 7l18 15-4 4-3-3v18H13V23l-3 3Z" fill="#d9b463" stroke="#4b3a22" stroke-width="1.5"/><path d="M20 40V27h8v13M19 18h10v7H19Z" fill="#132e3a"/><path d="M29 13V7h5v11" fill="#d9b463"/></svg>';
ASSETS.images.ui51_housing139='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(HOME_ICON139.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" '));
MAP_ICONS51.housing139=['Housing / Hearthkeeper','Azarith and the Homeward portal. Purchase a home or travel to your private plot.'];
MAP_GLYPHS52.housing139={w:48,h:48,box:[4,4,40,40]};
const homeMapMarkersBefore139=mapMarkers51,homeMapBefore139=mapBase51;
mapMarkers51=function(...args){
 if(isHomeScene139())return interactables.filter(o=>['homeReturn139','homeDoor139','homeExit139','homeDecor139'].includes(o.type)).map(o=>({id:o.id,kind:o.type==='homeDecor139'?'housing139':o.type==='homeExit139'||o.type==='homeReturn139'?'exit':'housing139',x:o.x,z:o.z,label:o.label}));
 const markers=homeMapMarkersBefore139(...args),keeper=world?.userData.homeKeeper139;if(keeper&&player&&dist(keeper.a,player)<45)markers.push({kind:'housing139',id:'housing139',x:keeper.a.x,z:keeper.a.z,label:'Azarith · Housing'});return markers;
};
mapBase51=function(clone=true){
 if(!isHomeScene139())return homeMapBefore139(clone);
 const inside=state.scene==='homeInterior139',l=homeLayout139(),b=inside?[-l.w/2-2,-l.d/2-2,l.w+4,l.d+4]:[-32,-31,64,64];
 const shapes=inside?`<rect x="${-l.w/2}" y="${-l.d/2}" width="${l.w}" height="${l.d}" fill="#a89d7b" stroke="#d5c69d" stroke-width=".5"/>`+housing139().home.placements.filter(p=>(p.area??'room')==='room'&&HOME_DECOR139[p.item].surface==='floor').map(p=>{const f=homeFootprint139(p);return `<rect x="${p.x-f.w/2}" y="${p.z-f.d/2}" width="${f.w}" height="${f.d}" fill="#776d50" stroke="#d1be87" stroke-width=".12"/>`;}).join(''):`<rect x="-32" y="-31" width="64" height="64" fill="#60764b"/><rect x="-23" y="-22" width="46" height="47" rx="6" fill="#8a9c6e"/><path d="M0 1 0 7 4 12 11 15" fill="none" stroke="#d9caa6" stroke-width="3.2"/><rect x="-6" y="-8.5" width="12" height="9" fill="#736d58" stroke="#dfd1ad" stroke-width=".7"/>`;
 const text=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${b.join(' ')}" role="img" aria-label="Your private home ${inside?'interior':'grounds'}"><rect x="${b[0]}" y="${b[1]}" width="${b[2]}" height="${b[3]}" fill="#293e33"/>${shapes}</svg>`;
 return new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
};
function homeSymbol139(id){return {bench:'▤',planter:'❦',gardenLamp:'♧',ornament:'◇',bed:'▰',table:'▥',chair:'♧',rug:'▱',plant:'❧',lamp:'♧',banner:'⚑',painting:'▣',statuette:'◇',vase:'❦',trophy:'♜',crest:'♜'}[HOME_DECOR139[id]?.kind]??'⌂';}
const homeSpriteFrames139={south:[0],west:[1],north:[2],southeast:[3],southwest:[6],east:[7],northeast:[2],northwest:[2],greeting:[4],homewardKey:[5]};
for(const [key,cell]of Object.entries({...homeSpriteFrames139}))homeSpriteFrames139['idle_'+key]=cell;
ASSETS.sprites.azarith={url:'elyndor/assets/runtime-v139/azarith-poses.png',w:400,h:400,unit:320,gutter:20,cols:8,rows:1,frames:homeSpriteFrames139,frameRate:{greeting:1,homewardKey:1},native139:true};
if(!DEV_NPCS87.includes('azarith'))DEV_NPCS87.push('azarith');npcNames45.azarith='Azarith · Hearthkeeper';
function ensureHousing139(){
 if(housingMenu139.root)return housingMenu139.root;const root=document.createElement('div');root.id='housing139';root.hidden=true;root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','housing-title139');document.body.append(root);housingMenu139.root=root;return root;
}
function openHousing139(page='greeting'){
 if(battle||gameLoading||dialogue)return;stopHomeDecor139IfActive();closeMenu();const h=housing139(),catalog=homeCatalog139(),q=housingMenu139;
 q.index=Math.max(0,catalog.findIndex(c=>c.id===(h.home?.region??activeScene.key)));q.layout=h.home?.layout??'hearth';q.page=page;q.open=true;q.confirm=null;q.message='';q.previewKey='';ensureHousing139().hidden=false;
 menu={tab:'housing139',previous:state.mode};keys.clear();route=null;document.body.classList.add('housing-open139');renderHousing139();q.root.querySelector('button')?.focus({preventScroll:true});
}
function stopHomeDecor139IfActive(){if(homeDecor139.active)stopHomeDecor139();}
function closeHousing139(){
 const q=housingMenu139;if(!q.open)return;q.open=false;q.confirm=null;if(q.root)q.root.hidden=true;document.body.classList.remove('housing-open139');if(menu?.tab==='housing139')menu=null;keys.clear();if($('#world'))$('#world').focus({preventScroll:true});
}
const homeCloseBefore139=closeMenu;
closeMenu=function(...a){if(housingMenu139.open){closeHousing139();return;}if(homeDecor139.active){stopHomeDecor139();return;}return homeCloseBefore139(...a);};
const homeRenderBefore139=renderMenu;
renderMenu=function(...a){if(menu?.tab==='housing139')return renderHousing139();if(menu?.tab==='homeDecor139')return renderHomeDecor139();return homeRenderBefore139(...a);};
function homeCurrentChoice139(){const c=homeCatalog139();return c[clamp(housingMenu139.index,0,c.length-1)];}
function layoutCards139(){return Object.entries(HOME_LAYOUTS139).map(([id,l])=>`<button class="home-layout139 ${housingMenu139.layout===id?'selected':''}" data-home-layout="${id}" aria-pressed="${housingMenu139.layout===id}"><span class="home-plan139 ${id}"><i></i><i></i><i></i></span><span>${l.name}<small>${l.w} × ${l.d} · ${l.description}</small></span></button>`).join('');}
function renderHousing139(){
 const q=housingMenu139;if(!q.open)return;const h=housing139(),c=homeCurrentChoice139(),owned=h.home?.region===c.id,short=q.page==='greeting',changedLayout=owned&&q.layout!==h.home.layout;
 let body;
 if(short){body=`<div class="home-greeting139"><img src="elyndor/assets/runtime-v139/azarith-greeting.png" alt="Azarith, the red-panda Hearthkeeper"><div><p class="home-kicker139">THE HEARTHKEEPER · HOUSING</p><h2 id="housing-title139">Azarith</h2><p>A quiet place of your own, a hearth for the journey home.</p><button class="home-gold139" data-home-action="browse">${HOME_ICON139} Purchase House</button><button data-home-action="visit" ${h.home?'':'disabled'}>${HOME_ICON139} Teleport to House</button><button data-home-action="leave">Leave</button><small>${h.home?esc(homeStyle139().name)+' · '+esc(homeLayout139().name):'Purchase a house to unlock home travel.'}</small></div></div>`;}
 else body=`<header class="home-titlebar139">${HOME_ICON139}<h2 id="housing-title139">Your Home</h2><span>${state.gold.toLocaleString()} coins</span><button data-home-action="leave" aria-label="Close housing">✕</button></header><div class="home-showcase139"><button data-home-action="prev" aria-label="Previous regional home">‹</button><figure><canvas id="home-preview139" width="1280" height="720" aria-label="${esc(c.name)} actual 3D model preview"></canvas><figcaption>${esc(c.theme)} · ${esc(c.town)}</figcaption></figure><button data-home-action="next" aria-label="Next regional home">›</button></div><div class="home-name139"><h3>${esc(c.name)}</h3><span class="home-owned139 ${owned?'owned':'unowned'}">${owned?'Owned':'Not Owned'}</span><small>${q.index+1} / ${homeCatalog139().length} regional styles</small></div><div class="home-layouts139" role="group" aria-label="Choose interior layout">${layoutCards139()}</div><p class="home-status139" role="status">${esc(q.message||'One home at a time. Its interior and exterior match the town you choose.')}</p><div class="home-menu-actions139">${owned?`<button class="home-gold139" data-home-action="${changedLayout?'layout-confirm':'visit'}">${changedLayout?'Apply layout':'Visit Home'}</button>`:`<button class="home-gold139" data-home-action="purchase" ${state.gold<c.price?'disabled':''}>Purchase Home — ${c.price.toLocaleString()} coins</button>`}<button data-home-action="back">Back</button></div>${!owned&&state.gold<c.price?`<p class="home-shortage139">You need ${(c.price-state.gold).toLocaleString()} more coins.</p>`:''}`;
 if(q.confirm){const move=!!h.home,layout=q.confirm==='layout';body+=`<div class="home-confirm-shade139"><section class="home-purchase-confirm139" role="alertdialog" aria-label="Confirm home ${layout?'layout':'purchase'}"><p class="home-kicker139">${layout?'CHOOSE YOUR SPACE':move?'ONE HOME AT A TIME':'A HEARTH OF YOUR OWN'}</p><h3>${layout?'Change to '+HOME_LAYOUTS139[q.layout].name+'?':move?'Move to '+esc(c.name)+'?':'Purchase '+esc(c.name)+'?'}</h3><p>${layout?'Interior decorations return to your collection, ready for the new layout. Your garden stays as you arranged it.':move?'This replaces your current home’s location and style. All your collected decorations are kept; placed items return to your collection. There is no sale refund.':'A private land plot, a home in the style of '+esc(c.town)+', and starter furnishings in your collection. The house starts empty.'}</p><strong>${layout?'No cost':c.price.toLocaleString()+' coins · Balance after purchase: '+(state.gold-c.price).toLocaleString()}</strong><div><button class="home-gold139" data-home-action="confirm">${layout?'Apply layout':'Confirm purchase'}</button><button data-home-action="cancel">Cancel</button></div></section></div>`;}
 q.root.innerHTML=`<section class="home-panel139 ${short?'home-compact139':''}">${short?'<button class="home-close139" data-home-action="leave" aria-label="Close housing">✕</button>':''}${body}</section>`;
 if(!short)requestAnimationFrame(paintHomePreview139);
}
// Render to a temporary target using the existing renderer. No extra WebGL
// context, permanent animation loop or full-location rebuild is needed.
function paintHomePreview139(){
 const q=housingMenu139,canvas=$('#home-preview139');if(!q.open||!canvas||q.previewBusy)return;
 const c=homeCurrentChoice139(),owned=housing139().home?.region===c.id,look=owned?homeAppearance139():homeAppearance139(null),native=look.outerWall==='regional'&&look.roof==='regional'&&look.trim==='regional',mobile=mobileStartup116(),key=c.id+'-'+(mobile?'mobile':'desktop')+'-'+JSON.stringify(look),ctx=canvas.getContext('2d');canvas.width=mobile?768:1280;canvas.height=canvas.width*9/16;const cached=q.previewCache.get(key);if(cached){ctx.drawImage(cached,0,0,canvas.width,canvas.height);return;}
 if(native&&arguments[0]!==true){q.previewBusy=true;const art=new Image();art.onload=()=>{q.previewCache.set(key,art);while(q.previewCache.size>8)q.previewCache.delete(q.previewCache.keys().next().value);q.previewBusy=false;if(q.open)paintHomePreview139();};art.onerror=()=>{q.previewBusy=false;if(q.open)paintHomePreview139(true);};art.src='elyndor/assets/runtime-v144/home-'+c.id+(mobile?'-mobile':'')+'.webp';return;}
 if(state.scene==='homePlot139'&&owned&&paintLiveHomePreview144(canvas,key))return;
 q.previewBusy=true;const modelScene=new THREE.Scene(),group=new THREE.Group();modelScene.background=new THREE.Color('#738e91');modelScene.add(group);
 const oldWorld=world,oldGround=homeBuilding139,oldCounters={...architecture31},restore={target:renderer.getRenderTarget(),viewport:renderer.getViewport(new THREE.Vector4()),scissor:renderer.getScissor(new THREE.Vector4()),test:renderer.getScissorTest(),shadow:renderer.shadowMap.enabled};let target;
 try{
  homeBuilding139=true;homeShell139(c.id,group);homePlane139(55,50,'grass','#9eaf88',-.03,group);homePath139([[0,2],[0,8],[6,16]],3.2,group);
  const cameraPreview=new THREE.PerspectiveCamera(35,canvas.width/canvas.height,.1,150);cameraPreview.position.set(18,12.7,25);cameraPreview.lookAt(0,2.7,-2);
  const light=new THREE.DirectionalLight('#fff1d3',2.4);light.position.set(-10,20,15);modelScene.add(light,new THREE.HemisphereLight('#c5deeb','#68745b',1.45));
  target=new THREE.WebGLRenderTarget(canvas.width,canvas.height,{depthBuffer:true});target.texture.colorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=false;renderer.setRenderTarget(target);renderer.setScissorTest(false);renderer.setViewport(0,0,canvas.width,canvas.height);renderer.clear();renderer.render(modelScene,cameraPreview);
  const bytes=new Uint8Array(canvas.width*canvas.height*4);renderer.readRenderTargetPixels(target,0,0,canvas.width,canvas.height,bytes);const image=ctx.createImageData(canvas.width,canvas.height),stride=canvas.width*4;for(let y=0;y<canvas.height;y++)image.data.set(bytes.subarray((canvas.height-1-y)*stride,(canvas.height-y)*stride),y*stride);ctx.putImageData(image,0,0);
  const snapshot=document.createElement('canvas');snapshot.width=canvas.width;snapshot.height=canvas.height;snapshot.getContext('2d').drawImage(canvas,0,0);q.previewCache.set(key,snapshot);while(q.previewCache.size>8)q.previewCache.delete(q.previewCache.keys().next().value);
 }catch(error){console.error('Home preview:',error);q.message='The home preview could not be prepared.';}
 finally{renderer.setRenderTarget(restore.target);renderer.setViewport(restore.viewport);renderer.setScissor(restore.scissor);renderer.setScissorTest(restore.test);renderer.shadowMap.enabled=restore.shadow;target?.dispose();homeBuilding139=oldGround;world=oldWorld;Object.assign(architecture31,oldCounters);disposeHomeObject139(group);q.previewBusy=false;}
}
async function housingAction139(action){
 const q=housingMenu139,h=housing139(),c=homeCurrentChoice139();if(!q.open)return;
 if(action==='leave'){closeHousing139();return;}
 if(action==='browse'){q.page='browse';q.message='';}
 else if(action==='back'){q.page='greeting';q.confirm=null;}
 else if(action==='prev'||action==='next'){q.index=(q.index+(action==='next'?1:-1)+homeCatalog139().length)%homeCatalog139().length;q.layout=h.home?.region===homeCurrentChoice139().id?h.home.layout:'hearth';q.confirm=null;q.message='';}
 else if(action==='purchase'){if(state.gold<c.price){q.message='You do not have enough coins.';}else q.confirm='purchase';}
 else if(action==='layout-confirm')q.confirm='layout';
 else if(action==='cancel')q.confirm=null;
 else if(action==='visit'){await visitHome139();return;}
 else if(action==='confirm'){
  if(q.confirm==='layout'){changeHomeLayout139(q.layout);q.message='New layout selected. Interior decorations are in your collection; your garden is preserved.';q.confirm=null;if(isHomeScene139()){const id=state.scene;closeHousing139();await changeJourneyScene(id,id==='homeInterior139'?[0,homeLayout139().d/2-3.6]:[7.5,19]);return;}}
  else if(q.confirm==='purchase'){const result=purchaseHome139(c.id,q.layout);q.message=result.message;q.confirm=null;if(result.ok&&isHomeScene139()){closeHousing139();await changeJourneyScene('homePlot139',[7.5,19]);return;}}
 }
 renderHousing139();
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-home-action],[data-home-layout]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();
 if(b.dataset.homeLayout){housingMenu139.layout=b.dataset.homeLayout;housingMenu139.message='';renderHousing139();}else housingAction139(b.dataset.homeAction).catch(error=>{console.error(error);housingMenu139.message=error.message;renderHousing139();});
},true);
document.addEventListener('keydown',e=>{
 if(!housingMenu139.open)return;e.stopImmediatePropagation();keys.clear();
 if(e.key==='Escape'){e.preventDefault();housingMenu139.confirm?(housingMenu139.confirm=null,renderHousing139()):closeHousing139();}
 if(['ArrowLeft','ArrowRight'].includes(e.key)&&housingMenu139.page==='browse'&&!housingMenu139.confirm){e.preventDefault();housingAction139(e.key==='ArrowLeft'?'prev':'next');}
 if(e.key==='Tab'){
  const focusable=[...(housingMenu139.confirm?housingMenu139.root.querySelector('.home-purchase-confirm139'):housingMenu139.root).querySelectorAll('button:not([disabled])')],first=focusable[0],last=focusable.at(-1);
  if(e.shiftKey&&document.activeElement===first){last?.focus();e.preventDefault();}else if(!e.shiftKey&&document.activeElement===last){first?.focus();e.preventDefault();}
 }
},true);
let homeKeeperIcon139=null;
function updateHomeKeeper139(){
 const keeper=world.userData.homeKeeper139;
 if(!homeKeeperIcon139){homeKeeperIcon139=document.createElement('div');homeKeeperIcon139.className='home-keeper-icon139';homeKeeperIcon139.innerHTML=HOME_ICON139;homeKeeperIcon139.setAttribute('aria-hidden','true');document.body.append(homeKeeperIcon139);}
 if(!keeper||battle||state.mode==='title'||!keeper.a.mesh.visible){homeKeeperIcon139.hidden=true;return;}
 const a=keeper.a,position=V3(a.x,heightAt(a.x,a.z)+a.size+1.2,a.z).project(camera),visible=position.z<1&&position.z> -1&&Math.abs(position.x)<1.1&&Math.abs(position.y)<1.1&&!homeDecor139.active;
 homeKeeperIcon139.hidden=!visible;if(visible)homeKeeperIcon139.style.transform=`translate(${(position.x*.5+.5)*innerWidth}px,${(-position.y*.5+.5)*innerHeight}px) translate(-50%,-50%)`;
 const posing=clock<(a.homewardUntil139??-1)?'homewardKey':housingMenu139.open?'greeting':a.face,meta=assets.sprites.azarith;if(a.frame?.action!==posing&&meta.frames[posing])setActorFrame(a,posing,0);
}
// Tests and the protected developer console share the same real game handlers.
window.housingTools139={open:()=>openHousing139(),decorate:()=>startHomeDecor139(),visit:visitHome139,return:returnFromHome139,get catalog(){return homeCatalog139()},get collection(){return Object.entries(HOME_DECOR139).map(([id,q])=>({id,...q,owned:state.items[id]??0,available:homeAvailable139(id)}))}};
Object.assign(devConsole60,{homeRegion139:'brookstead',homeLayout139:'hearth'});
const homeDevRenderBefore139=renderDevConsole60;
renderDevConsole60=function(...args){const r=homeDevRenderBefore139(...args),q=devConsole60;if(!q.unlocked)return r;
 const panel=q.root.querySelector('.dev-panel60'),nav=panel.querySelector('.dev-tabs60'),body=panel.querySelector('.dev-body60');nav.insertAdjacentHTML('beforeend',`<button role="tab" data-dev-action="tab" data-dev-tab="housing139" aria-selected="${q.tab==='housing139'}">Housing</button>`);
 if(q.tab==='housing139'){
  body.classList.remove('dev-sprite-body87');body.innerHTML='<p>Inspect the real housing NPC, private grounds, room layouts and decoration flow. Test homes and coins stay in this unsaved developer journey.</p>'+devSelect60('homeRegion139','Regional home style',devOptions60(homeCatalog139().map(c=>[c.id,c.name]),q.homeRegion139))+devSelect60('homeLayout139','Interior layout',devOptions60(Object.entries(HOME_LAYOUTS139).map(([id,l])=>[id,l.name]),q.homeLayout139))+'<div class="dev-actions60"><button data-dev-action="home-town139">Town and housing NPC</button><button data-dev-action="home-yard139">Private yard</button><button data-dev-action="home-room139">Empty room / resume decorating</button><button data-dev-action="home-coins139">Add 2,000 test coins</button><button data-dev-action="home-picker139">Open housing menu</button></div><p>The house begins empty. Starter furnishings are available in the decoration collection. D opens decoration inside the house.</p>';
  for(const b of nav.querySelectorAll('[data-dev-tab]'))b.setAttribute('aria-selected',b.dataset.devTab==='housing139');
 }
 return r;
};
const homeDevFieldBefore139=changeDevField60;
changeDevField60=function(input){if(['homeRegion139','homeLayout139'].includes(input.dataset.devField)){devConsole60[input.dataset.devField]=input.value;return;}return homeDevFieldBefore139(input);};
const homeDevActionBefore139=runDevAction60;
runDevAction60=async function(action){
 if(!action.startsWith('home-'))return homeDevActionBefore139(action);
 const q=devConsole60;if(!q.unlocked||q.running)return;q.error='';
 try{
  if(action==='home-town139'){q.location='poi:'+q.homeRegion139;q.spawn='court';await homeDevActionBefore139('scene');if(!q.error){hideDevConsole60();const keeper=world.userData.homeKeeper139;if(keeper)setupParty([keeper.a.x,keeper.a.z+2.3]);}return;}
  q.running=true;renderDevConsole60();await startDevSession60();await leaveDevBattle60();stopHomeDecor139IfActive();closeHousing139();
  if(action==='home-coins139'){state.gold+=2000;q.status='Added 2,000 coins to this test journey.';return;}
  if(action==='home-picker139'){hideDevConsole60();openHousing139('browse');return;}
  const h=housing139();if(h.home?.region!==q.homeRegion139){state.gold=Math.max(2000,state.gold);purchaseHome139(q.homeRegion139,q.homeLayout139);}else if(h.home.layout!==q.homeLayout139)changeHomeLayout139(q.homeLayout139);
  if(!h.return){const p=POIS[q.homeRegion139];h.return={scene:p.id,poi:q.homeRegion139,x:p.spawn[0],z:p.spawn[1]};}
  const id=action==='home-room139'?'homeInterior139':'homePlot139';await changeJourneyScene(id,id==='homeInterior139'?[0,homeLayout139().d/2-3.6]:[7.5,19]);applyDevLighting60();q.status='Housing ready · '+homeStyle139().name;hideDevConsole60();
 }catch(error){q.error=error.message;q.open=true;console.error(error);}finally{q.running=false;renderDevConsole60();}
};
const homeBootBefore139=boot;
boot=async function(...args){const result=await homeBootBefore139(...args),before=window.render_game_to_text;window.render_game_to_text=()=>{const q=JSON.parse(before());q.housing139={home:housing139().home,private:isHomeScene139(),return:housing139().return,decorating:homeDecor139.active,preview:homeDecor139.draft,valid:homeDecor139.valid,keeper:world?.userData.homeKeeper139?{x:world.userData.homeKeeper139.a.x,z:world.userData.homeKeeper139.a.z}:null};return JSON.stringify(q);};return result;};
