// A notice is a local issuer, not an alternate entrance to the whole Journal.
// Existing optional work retains its stable save key, checkpoints and rewards.
for(const spec of Object.values(LOCAL_REQUESTS16))spec.source95??='board';
function requestSource95(key){return state.localRequests16?.[key]?.source95??LOCAL_REQUESTS16[key]?.source95??'board';}
const giverBefore95=requestGiver51;
requestGiver51=function(){return LOCAL_REQUESTS16[activeScene?.key]?.source95==='npc'?giverBefore95():null;};
const requestActBefore95=act;
act=function(o,...args){
 if(o?.type==='localBoard'&&state.mode==='explore'&&!dialogue&&!menu&&!battle&&!eventAction&&!gameLoading&&interactionAvailable(o)){
  openMenu('requests');menu.requestBoard95=o.requestKey;menu.requestSource95='board';renderMenu();return;
 }
 return requestActBefore95(o,...args);
};
const acceptBefore95=acceptRequest16;
acceptRequest16=function(key,...args){
 const spec=LOCAL_REQUESTS16[key];if(!spec||menu?.requestBoard95&&menu.requestBoard95!==key)return false;
 if(menu?.requestBoard95&&spec.source95!=='board')return false;
 const was=requestState16(key).accepted,result=acceptBefore95(key,...args);
 if(result&&!was)requestState16(key).source95=spec.source95;
 return result;
};
const requestsBefore95=renderLocalRequests16;
renderLocalRequests16=function(...args){
 const result=requestsBefore95(...args),root=$('#menu-content');if(!menu||!root)return result;
 const board=menu.requestBoard95,source=board?'board':menu.requestSource95??'board';
 root.querySelector('h3').textContent=board?POIS[board].name+' notice board':source==='npc'?'Requests from people':'Board requests';
 const intro=root.querySelector('p.desc');intro.textContent=board?'Optional requests posted on this notice board. Main story objectives and requests given by people are recorded separately in the Journal.':source==='npc'?'Optional requests received directly from people. Each request names its giver.':'Optional requests posted by settlement notice boards. Each request names its board.';
 const tabs=document.createElement('div');tabs.className='tabs request-source95';
 tabs.innerHTML=board?'<button data-tab="journal">Open Journal</button>':['board','npc'].map(s=>'<button data-request-source95="'+s+'" aria-pressed="'+(source===s)+'" class="'+(source===s?'active':'')+'">'+(s==='board'?'Notice boards':'People')+'</button>').join('');intro.after(tabs);
 let count=0;for(const card of root.querySelectorAll('.request-card')){
  const key=card.querySelector('[data-request]')?.dataset.request;
  if(!key||requestSource95(key)!==source||board&&key!==board){card.remove();continue;}
  count++;card.dataset.requestOrigin95=source;card.dataset.requestKey95=key;
  const tag=document.createElement('p');tag.className='eyebrow request-issuer95';tag.textContent=source==='board'?'From: '+POIS[key].name+' notice board':'From: '+LOCAL_REQUESTS16[key].author;card.querySelector('h4').after(tag);
 }
 if(!count){const p=document.createElement('p');p.className='desc request-empty95';p.textContent=source==='npc'?'No requests from people have been recorded. Speak with residents as you explore.':'No optional requests are posted here.';root.append(p);}
 return result;
};
const journalBefore95=renderJournal26;
renderJournal26=function(...args){
 const result=journalBefore95(...args),list=$('.quest-list26');if(!list)return result;
 for(const b of list.querySelectorAll('[data-open="requests"]'))b.remove();
 const heading=[...list.querySelectorAll('p.eyebrow')].find(p=>p.textContent.includes('LOCAL REQUESTS'));if(!heading)return result;
 const keys=Object.keys(LOCAL_REQUESTS16).filter(k=>k===activeScene.key||state.localRequests16?.[k]?.accepted),fragment=document.createDocumentFragment();
 for(const source of ['board','npc']){
  const rows=keys.filter(k=>requestSource95(k)===source),h=document.createElement('p');h.className='eyebrow';h.textContent=(source==='board'?'BOARD REQUESTS':'NPC REQUESTS')+' · '+rows.length;fragment.append(h);
  for(const key of rows){const b=document.createElement('button');b.dataset.sourceRequest95=key;b.innerHTML='<span>◇</span><b>'+esc(LOCAL_REQUESTS16[key].title)+'</b><small>'+esc(source==='board'?POIS[key].name+' notice board':LOCAL_REQUESTS16[key].author)+'</small>';fragment.append(b);}
 }
 heading.replaceWith(fragment);return result;
};
document.addEventListener('click',e=>{
 const source=e.target.closest('[data-request-source95]'),request=e.target.closest('[data-source-request95]');if(!menu||!source&&!request)return;
 e.preventDefault();e.stopImmediatePropagation();
 if(source){menu.requestBoard95=null;menu.requestSource95=source.dataset.requestSource95;renderMenu();}
 else{const key=request.dataset.sourceRequest95;openMenu('requests');menu.requestSource95=requestSource95(key);renderMenu();$('#menu-content [data-request-key95="'+key+'"]')?.scrollIntoView({block:'start'});}
},true);
