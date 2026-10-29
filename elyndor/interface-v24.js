// PixelLab ornaments are DOM-only assets. Labels remain accessible HTML and
// existing button handlers, shortcuts and menu navigation are retained.
function installInterface24(){
 if(!assets?.images.ui24_compass||document.body.dataset.interface24)return;
 document.body.dataset.interface24='ready';const css=document.documentElement.style;
 for(const key of['panel','compass','map','inventory','party','journal'])css.setProperty('--ui24-'+key,`url("${assets.images['ui24_'+key]}")`);
 for(const b of document.querySelectorAll('.hud-actions button[data-open]')){
  const tab=b.dataset.open;if(!['map','inventory','party','journal'].includes(tab))continue;
  const label={map:'Map',inventory:'Inventory',party:'Party',journal:'Journal'}[tab];b.classList.add('ornate-action24');b.title=label+' · '+({map:'M',inventory:'I',party:'C',journal:'J'}[tab]);b.setAttribute('aria-label',b.title);b.innerHTML=`<img src="${assets.images['ui24_'+tab]}" alt=""><span>${label}</span>`;
 }
 const loc=document.querySelector('#hud .location');if(loc&&!loc.querySelector('.location-compass24'))loc.insertAdjacentHTML('afterbegin',`<img class="location-compass24" src="${assets.images.ui24_compass}" alt="">`);
 const map=document.querySelector('#overworld-radar');if(map)map.setAttribute('aria-label','Local map · M to open world atlas');
}
const interfaceLoadBefore24=loadAssets;loadAssets=async function(){await interfaceLoadBefore24();installInterface24();};
const interfaceHUDBefore24=updateHUD;updateHUD=function(...args){const r=interfaceHUDBefore24(...args);installInterface24();return r;};
// Guidance can grow with translated text or longer lessons. Measure only when
// its layout changes; keep the real interaction button clear of its bounds.
const interfaceGuideBefore24=ensureGuide16;
ensureGuide16=function(){interfaceGuideBefore24();const n=onboarding16.node;if(!n||n.interfaceObserver24)return;n.interfaceObserver24=new ResizeObserver(entries=>{const e=entries[0],h=e.borderBoxSize?.[0]?.blockSize??n.getBoundingClientRect().height;document.documentElement.style.setProperty('--guide-height24',Math.ceil(h)+'px');});n.interfaceObserver24.observe(n);};
