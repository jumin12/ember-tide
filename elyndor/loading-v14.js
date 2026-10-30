// Character memories and world lore, illustrated from the approved concepts.
const LOADING_LORE=[
 {key:'bren',tag:'THE PEOPLE OF ELYNDOR',name:'Bren',subtitle:'A friend before a hero',body:'A practical fighter with a stubborn sense of responsibility. When Brookstead calls for help, Bren answers by getting his hands dirty.',tip:'Space and Enter advance story conversations. Ordinary village chatter stays beside its speaker.'},
 {key:'soren',tag:'THE PEOPLE OF ELYNDOR',name:'Soren',subtitle:'Questions worth crossing a world for',body:'A scholar, a mage, and Bren’s trusted friend. Soren looks for connections in the failures others see as separate accidents.',tip:'Choose a destination in the 3D atlas to track its landmark. Drag to pan; right-drag to rotate.'},
 {key:'inn',tag:'A MOMENT BETWEEN ROADS',name:'A light in the window',subtitle:'The inns of Valenne',body:'A warm hearth gives travelers room to breathe. Find the jade chronicle circle inside an inn to record your journey before the next road.',tip:'Journey records are kept only at inns. Rest restores the party’s health and magic.'},
 {key:'light',tag:'THE WORLD OF ELYNDOR',name:'The Elder Lights',subtitle:'Listen before you act',body:'Water, wildlife, and the old mechanisms show the same uneasy change. Restoring balance begins with understanding how these things answer one another.',tip:'Unexplored land remains beneath mist in the atlas. Traveling reveals the surrounding terrain.'}
];
let loadingLoreIndex=0;
function setLoadingLore(id=null){
 if(!$('#loading-lore-tag'))return;
 const key=id&&INTERIORS[id]?.type==='inn'?'inn':id&&INTERIORS[id]?'soren':id&&['depths','alderRemnant','nearbySite'].includes(id)?'light':LOADING_LORE[(loadingLoreIndex++)%LOADING_LORE.length].key,q=LOADING_LORE.find(q=>q.key===key),screen=$('#load-screen');screen.dataset.lore=key;$('#loading-lore-tag').textContent=q.tag;$('#loading-lore-title').textContent=q.name;$('#loading-lore-subtitle').textContent=q.subtitle;$('#loading-lore-body').textContent=q.body;$('#loading-lore-tip').textContent=q.tip;for(const f of $$('.loading-scenery figure'))f.classList.toggle('lore-active',f.dataset.lore===key);
}
const loadBeforeLore=setJourneyLoading;
setJourneyLoading=function(value){if(value)setLoadingLore(window.loadingDestination??null);loadBeforeLore(value);};
const changeBeforeLore=changeJourneyScene;
changeJourneyScene=async function(id,spawn=null){window.loadingDestination=id;try{return await changeBeforeLore(id,spawn);}finally{window.loadingDestination=null;}};
setLoadingLore('start');
