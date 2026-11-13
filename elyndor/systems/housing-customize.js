// Latest user direction: customize the room shell and fireplace as well as
// the exterior, while retaining the chosen settlement's architectural identity.
let homeAppearanceDraft139=null;
function homeBuildingStyle139(base,inside=false){
 const q={...base},look=q.id===housing139().home?.region?(homeAppearanceDraft139??homeAppearance139()):homeAppearance139(null),wall=inside?look.innerWall:look.outerWall;
 q.wallMaterial139=wall==='regional'?(['fern','relief'].includes(q.id)?'wood':q.id==='highmere'?'wall':'plaster'):{plaster:'plaster',timber:'wood',stone:'wall'}[wall];
 if(inside&&look.wallTone!=='regional')q.wall={ivory:'#e6dec6',sage:'#bfccb2',slate:'#afc1ca'}[look.wallTone];
 if(!inside&&wall==='timber')q.wall='#c0b195';if(!inside&&wall==='stone')q.wall='#cbd0c2';
 if(look.trim!=='regional')q.wood=look.trim==='honey'?'#c6ac7e':'#9da497';
 q.roofMaterial139=look.roof==='regional'?(q.id==='fern'?'wood':'slate'):{slate:'slate',clay:'roofClay86',shingle:'wood'}[look.roof];
 if(look.roof==='clay')q.roof='#bca18c';else if(look.roof==='shingle')q.roof='#9aab8d';
 return q;
}
function rebuildHomeArchitecture139(){
 if(state.scene==='homeInterior139'){
  disposeHomeObject139(world.userData.homeRoomShell139);disposeHomeObject139(world.userData.homeHearthRoot139);
  const shell=new THREE.Group();world.add(shell);world.userData.homeRoomShell139=shell;homeWall139(shell,homeLayout139(),homeStyle139());homeHearth139(homeLayout139());
 }else if(state.scene==='homePlot139'){
  const old=world.userData.buildings.find(g=>g.userData.home139);if(old){world.userData.buildings.splice(world.userData.buildings.indexOf(old),1);disposeHomeObject139(old);}
  const shell=homeShell139(housing139().home.region,world);world.userData.buildings.push(shell.g);
 }
 world.updateMatrixWorld(true);const live=new Set();world.traverse(o=>{if(!o.isMesh||o.userData.dynamicFX)return;live.add(o);o.layers.enable(1);});perf.staticMeshes=perf.staticMeshes.filter(o=>live.has(o));const indexed=new Set(perf.staticMeshes);for(const o of live)if(!indexed.has(o)&&!actors.some(a=>a.mesh===o||a.shadow===o))perf.staticMeshes.push(o);
 prepareCutaways();registerPlayerOccluders114();renderer.shadowMap.needsUpdate=sun.shadow.needsUpdate=true;shadowBudget138.at=-Infinity;updateLighting();
}
function previewHomeAppearance139(key,value){
 if(!HOME_FINISHES139[key]?.includes(value))return;cancelHomeDraft139();homeAppearanceDraft139??={...homeAppearance139()};homeAppearanceDraft139[key]=value;rebuildHomeArchitecture139();renderHomeDecor139();
}
function applyHomeAppearance139(){
 if(!homeAppearanceDraft139)return;housing139().home.appearance={...homeAppearanceDraft139};homeAppearanceDraft139=null;housingMenu139.previewCache.delete(housing139().home.region);homeChange139();renderHomeDecor139();toast('Home finishes saved.');
}
function cancelHomeAppearance139(){if(!homeAppearanceDraft139)return;homeAppearanceDraft139=null;if(isHomeScene139())rebuildHomeArchitecture139();}
function homeFinishForm139(outside=false){
 const look=homeAppearanceDraft139??homeAppearance139(),rows=outside?[['outerWall','Exterior walls'],['roof','Roof finish'],['trim','Exterior timber']]:[['innerWall','Interior walls'],['wallTone','Wall color'],['hearth','Fireplace finish']],h=housing139();
 return `<header><small>${outside?'MAKE AN ENTRANCE':'A HEARTH OF YOUR OWN'}</small><h2>${outside?'House exterior':'Room finishes'}</h2><button data-home-decor="done" aria-label="Finish customizing">✕</button></header><nav aria-label="Home customization"><button data-home-category="All">${outside?'Yard collection':'Collection'}</button>${outside?'<button data-home-category="Exterior" aria-pressed="true">House finishes</button>':`<button data-home-category="Room" aria-pressed="true">Room finishes</button>`}</nav><div class="home-finish-form139"><p>${esc(homeStyle139().town)} architecture · ${esc(homeLayout139().name)}</p>${rows.map(([key,label])=>`<label>${label}<select data-home-finish139="${key}">${HOME_FINISHES139[key].map(value=>`<option value="${value}" ${look[key]===value?'selected':''}>${HOME_FINISH_NAMES139[value]}</option>`).join('')}</select></label>`).join('')}<p>Preview a finish here. Apply to keep it, or cancel to restore your current choices.</p><button class="home-gold139" data-home-finish-action="apply" ${homeAppearanceDraft139?'':'disabled'}>Apply finishes</button><button data-home-finish-action="cancel" ${homeAppearanceDraft139?'':'disabled'}>Cancel preview</button></div><footer>${outside?'The yard and portal stay fully contained.':'Walls and the fireplace remain grounded and joined to the room.'}<br>Finishes are saved with your home.</footer>`;
}
const homeDecorRenderBefore139=renderHomeDecor139;
renderHomeDecor139=function(...args){
 const q=homeDecor139;if(!q.active)return;const outside=state.scene==='homePlot139';
 if(q.category==='Room'||q.category==='Exterior'){
  const root=ensureHomeDecor139();root.innerHTML=`<aside class="home-collection139">${homeFinishForm139(outside)}</aside><div class="home-place-toolbar139"><div><strong>${outside?'Customize your home’s exterior':'Customize the walls and fireplace'}</strong><p>Every finish uses the shared PBR materials and the room’s actual lighting.</p></div><button data-home-decor="done">Done</button></div>`;return;
 }
 const r=homeDecorRenderBefore139(...args);q.root.querySelector('nav').insertAdjacentHTML('beforeend',outside?'<button data-home-category="Exterior">House finishes</button>':'<button data-home-category="Room">Room finishes</button>');return r;
};
const homeDecorStartBefore139=startHomeDecor139;
startHomeDecor139=function(...args){
 if(state.scene!=='homePlot139')return homeDecorStartBefore139(...args);
 if(!housing139().home||battle||gameLoading)return;closeHousing139();closeMenu();ensureHomeDecor139();homeDecor139.active=true;homeDecor139.category='All';menu={tab:'homeDecor139',previous:state.mode};keys.clear();route=null;document.body.classList.add('home-decorating139');homeDecor139.root.hidden=false;renderHomeDecor139();updateCamera(1,true);
};
const homeDecorStopBefore139=stopHomeDecor139;
stopHomeDecor139=function(...args){cancelHomeAppearance139();return homeDecorStopBefore139(...args);};
updateHomeDecor139=function(){if(homeDecor139.active&&!isHomeScene139())stopHomeDecor139();};
document.addEventListener('change',e=>{const key=e.target.dataset.homeFinish139;if(key){previewHomeAppearance139(key,e.target.value);e.stopImmediatePropagation();}},true);
document.addEventListener('click',e=>{const action=e.target.closest('[data-home-finish-action]')?.dataset.homeFinishAction;if(action){e.preventDefault();e.stopImmediatePropagation();action==='apply'?applyHomeAppearance139():(cancelHomeAppearance139(),renderHomeDecor139());}},true);
document.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='d'&&state.scene==='homePlot139'&&!homeDecor139.active&&!menu&&!dialogue&&!gameLoading){e.preventDefault();e.stopImmediatePropagation();startHomeDecor139();}},true);
let homeCustomizeButton139=null;
const homeHudBefore139=updateHUD;
updateHUD=function(...args){const r=homeHudBefore139(...args);if(!homeCustomizeButton139){homeCustomizeButton139=document.createElement('button');homeCustomizeButton139.id='home-customize139';homeCustomizeButton139.textContent='Customize home · D';homeCustomizeButton139.onclick=()=>startHomeDecor139();document.body.append(homeCustomizeButton139);}homeCustomizeButton139.hidden=!isHomeScene139()||state.mode!=='explore'||!!menu||!!battle||gameLoading;return r;};
