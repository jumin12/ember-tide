// Fresh native in-game stills match the destination, with no interface baked in.
function loadingScene29(id){
 const type=INTERIORS[id]?.type;
 return type==='inn'?'inn':type==='shop'?'shop':type==='archives'||type==='council'?'archives':'river';
}
setLoadingLore=function(id=window.loadingDestination){
 const key=loadingScene29(id),screen=$('#load-screen');screen.dataset.lore=key;
 for(const n of $$('.loading-scenery figure'))n.classList.toggle('lore-active',n.dataset.lore===key);
 const lore=LOADING_LORE.find(q=>q.key===(key==='inn'?'inn':key==='archives'?'soren':'light'));
 $('#loading-lore-tip').textContent=(lore?.tip??LOADING_LORE[(loadingLoreIndex++)%LOADING_LORE.length].tip).replace('Journey records are kept only at inns.','Record your journey at location entrances and inns.');
};
const loadingBefore29=setJourneyLoading;
setJourneyLoading=function(value){loadingBefore29(value);if(!value)return;const id=window.loadingDestination;setLoadingLore(id);$('#load-label').textContent='Opening '+(INTERIORS[id]?.name??POIS[poiFor(id)]?.name??'the riverlands')+'…';};
