// RE-076–084. One home, one collection, and ordinary validated journey saves.
// Ownership is separate from the town the party most recently traveled from.
const HOME_LAYOUTS139={
 hearth:{name:'Hearthside',description:'An inviting open room, with a fireside nook.',w:24,d:18},
 suite:{name:'Garden suite',description:'A quiet sleeping alcove and a generous living room.',w:27,d:20},
 hall:{name:'Gathering hall',description:'A broad room for a long table and treasured finds.',w:30,d:22}
};
const HOME_FINISHES139={
 innerWall:['regional','plaster','timber','stone'],wallTone:['regional','ivory','sage','slate'],
 hearth:['fieldstone','limestone','slate'],outerWall:['regional','plaster','timber','stone'],roof:['regional','slate','clay','shingle'],trim:['regional','honey','weathered']
};
const HOME_FINISH_NAMES139={regional:'Town style',plaster:'Lime plaster',timber:'Timber paneling',stone:'Dressed stone',ivory:'Warm ivory',sage:'Soft sage',slate:'Blue slate',fieldstone:'Aged fieldstone',limestone:'Carved limestone',clay:'Terracotta tiles',shingle:'Woodland shingles',honey:'Honey oak',weathered:'Weathered timber'};
function homeAppearance139(home=housing139().home){const out={};for(const [key,values]of Object.entries(HOME_FINISHES139))out[key]=values.includes(home?.appearance?.[key])?home.appearance[key]:values[0];return out;}
const HOME_STYLES139={
 brookstead:{name:'Brookstead House',theme:'Riverside timber cottage',price:350,kit:'brook',wood:'#b49b72',wall:'#e9ddc2',roof:'#a8b8c9',accent:'#547666',floor:'wood',trees:'oak'},
 fern:{name:'Fern Hollow House',theme:'Woodland sanctuary',price:420,kit:'fern',wood:'#a18c68',wall:'#d6dcc2',roof:'#7b927a',accent:'#78945f',floor:'wood',trees:'oak'},
 highmere:{name:'Highmere House',theme:'Royal stone residence',price:750,kit:'capital',wood:'#b2a07e',wall:'#e5e1cc',roof:'#a3aec8',accent:'#596e9c',floor:'interiorFloor',trees:'oak'},
 alder:{name:'Alderbridge House',theme:'Merchant’s country lodge',price:560,kit:'brook',wood:'#ac8e68',wall:'#e0cfb3',roof:'#879db1',accent:'#98654f',floor:'wood',trees:'oak'},
 relief:{name:'Relief Station House',theme:'Alpine wayfarer’s retreat',price:480,kit:'relief',wood:'#b69e7c',wall:'#dddacb',roof:'#b3bfc5',accent:'#668487',floor:'wood',trees:'pine'},
 harbor:{name:'Harbor House',theme:'Coastal captain’s cottage',price:620,kit:'harbor',wood:'#af9d80',wall:'#e5ded0',roof:'#87a4b7',accent:'#518b93',floor:'wood',trees:'oak'}
};
const HOME_DECOR139={
 homeBed139:{name:'Hearthkeeper’s bed',kind:'bed',category:'Home Decor',surface:'floor',w:3.2,d:4.6,solid:true,desc:'A carved timber bed with a woven coverlet.'},
 homeTable139:{name:'Oak gathering table',kind:'table',category:'Home Decor',surface:'floor',w:3.6,d:2.5,solid:true,top:1.45,desc:'A sturdy table. Small decorations can be placed on its top.'},
 homeChair139:{name:'Carved oak chair',kind:'chair',category:'Home Decor',surface:'floor',w:1.25,d:1.3,solid:true,desc:'A hand-carved chair with a padded seat.'},
 homeRug139:{name:'Riverweave rug',kind:'rug',category:'Home Decor',surface:'floor',w:4.4,d:3.0,desc:'A soft woven rug; furniture can sit on it.'},
 homeBench139:{name:'Garden oak bench',kind:'bench',category:'Home Decor',surface:'floor',areas:['yard'],w:3.2,d:1.6,solid:true,desc:'An oak garden bench for a quiet corner of your yard.'},
 homePlanter139:{name:'Wildflower planter',kind:'planter',category:'Home Decor',surface:'floor',areas:['yard'],w:2.4,d:1.25,solid:true,desc:'A timber trough of ferns and seasonal wildflowers.'},
 homeGardenLamp139:{name:'Garden lantern',kind:'gardenLamp',category:'Home Decor',surface:'floor',areas:['yard'],w:.8,d:.8,solid:true,desc:'A sheltered brass lantern on a carved stone plinth.'},
 homeOrnament139:{name:'Garden Light ornament',kind:'ornament',category:'Home Decor',surface:'floor',areas:['yard'],w:1.35,d:1.35,solid:true,desc:'A weathered stone garden ornament with a bronze Light.'},
 homePlant139:{areas:['room','yard'],name:'Potted fern',kind:'plant',category:'Home Decor',surface:'floor',w:1.4,d:1.4,solid:true,desc:'A glazed pot of living woodland fronds.'},
 homeLamp139:{name:'Brass reading lamp',kind:'lamp',category:'Home Decor',surface:'table',w:.65,d:.65,desc:'A shaded brass lamp, placed on a table.'},
 homeBanner139:{name:'Valenne wall banner',kind:'banner',category:'Home Decor',surface:'wall',w:1.7,d:.25,desc:'A woven banner that hangs naturally on a wall.'},
 homePainting139:{name:'Brookstead river painting',kind:'painting',category:'Home Decor',surface:'wall',w:2.6,d:.25,desc:'A framed landscape of the river and its bridges.'},
 homeForest139:{name:'Fern Hollow woodland painting',kind:'painting',category:'Home Decor',surface:'wall',w:2.6,d:.25,desc:'A keepsake from exploring the woodland settlement.',tint:'#778f6e'},
 homeCoast139:{name:'Coastal tide painting',kind:'painting',category:'Home Decor',surface:'wall',w:2.6,d:.25,desc:'A keepsake of the sea and the harbor.',tint:'#578c9d'},
 homeStone139:{name:'Ancient Light statuette',kind:'statuette',category:'Home Decor',surface:'table',w:.85,d:.85,desc:'A small carved stone Light, found among the old ruins.'},
 homeVase139:{name:'Wildflower vase',kind:'vase',category:'Home Decor',surface:'table',w:.65,d:.65,desc:'Pressed flowers from the roads of Valenne.'},
 trophyOgre139:{name:'Ogre encounter trophy',kind:'trophy',category:'Trophy',surface:'table',w:.95,d:.85,desc:'A bronze memorial to overcoming an ogre. A home display, not equipment.'},
 trophyCommander139:{name:'Commander’s crest',kind:'crest',category:'Trophy',surface:'wall',w:1.5,d:.25,desc:'An engraved crest marking the first Commander encounter.'},
 trophyBrace139:{name:'Recovered network crest',kind:'crest',category:'Trophy',surface:'wall',w:1.5,d:.25,desc:'A commemorative display from the recovered network component.'}
};
for(const[id,q]of Object.entries(HOME_DECOR139))ITEMS[id]={name:q.name,icon:q.category==='Trophy'?'♜':'⌂',type:q.category,category:'Housing',housing:true,desc:q.desc+' · Home decoration.',price:0};
function housing139(s=state){return s.housing139??=( {version:1,home:null,return:null,claimed:{},next:1,revision:0,encounters:0} );}
function homeCatalog139(){return Object.entries(HOME_STYLES139).filter(([key])=>POIS[key]).map(([id,q])=>({...q,id,town:POIS[id].name}));}
function homeStyle139(region=housing139().home?.region??'brookstead'){return {...HOME_STYLES139[region],id:region,town:POIS[region]?.name??region};}
function homeLayout139(id=housing139().home?.layout??'hearth'){return HOME_LAYOUTS139[id]??HOME_LAYOUTS139.hearth;}
function homeAvailable139(item,except=null,s=state){return Math.max(0,(s.items[item]??0)-(housing139(s).home?.placements??[]).filter(p=>p.item===item&&p.uid!==except).length);}
function homeArea139(){return state.scene==='homePlot139'?'yard':'room';}
function homeDecorAllowed139(item,area=homeArea139()){return (HOME_DECOR139[item]?.areas??['room']).includes(area);}
function homeFootprint139(p){const q=HOME_DECOR139[p.item],swap=(p.turn??0)%2;return {w:swap?q.d:q.w,d:swap?q.w:q.d};}
function homeRectsOverlap139(a,b,pad=.12){return Math.abs(a.x-b.x)<(a.w+b.w)/2+pad&&Math.abs(a.z-b.z)<(a.d+b.d)/2+pad;}
function homeFixed139(layout=homeLayout139()){return [{x:-layout.w/2+1.7,z:-layout.d/2+1.5,w:3.1,d:2.7,name:'the hearth'},{x:0,z:layout.d/2-1.6,w:3.6,d:3.2,name:'the entrance aisle'},...(layout===HOME_LAYOUTS139.suite?[{x:-5,z:-2.8,w:.30,d:7.8,name:'the alcove divider'}]:[])];}
function validateHomePlacement139(p,placements=housing139().home?.placements??[],layout=homeLayout139()){
 const q=HOME_DECOR139[p.item];if(!q)return {ok:false,reason:'Unknown decoration.'};
 const area=p.area??'room';if(!homeDecorAllowed139(p.item,area))return {ok:false,reason:'Choose a decoration for this part of your home.'};
 placements=placements.filter(v=>(v.area??'room')===area);
 const f=homeFootprint139(p),hw=layout.w/2,hd=layout.d/2;
 if(area==='yard'){
  const rect={...p,...f};if(p.surface!=='floor'||Math.abs(p.x)+f.w/2>20||p.z-f.d/2< -19||p.z+f.d/2>22)return {ok:false,reason:'Keep decorations inside your garden fence.'};
  const fixed=[{x:-13,z:-5,w:5.1,d:2.4,name:'a raised garden bed'},{x:13,z:-10,w:5.5,d:2.6,name:'a raised garden bed'},{x:-13,z:3,w:5.6,d:4.4,name:'the garden arbor'},...(housing139().home?.region==='highmere'?[-16,16].map(x=>({x,z:-1,w:1.3,d:1.3,name:'a stone garden urn'})):[]),{x:0,z:-4,w:15,d:12,name:'the house'}, {x:7.5,z:16,w:4.6,d:4.6,name:'Azarith’s approach'}, {x:-12,z:12,w:4.3,d:2.8,name:'the garden bench'}, {x:15,z:11,w:2.2,d:2.2,name:'the planters'}, {x:16,z:18,w:2.2,d:2.2,name:'the planters'}, ...[[-15,-10],[-15,3],[-15,18],[17,-8],[20,4],[-10,-18],[10,-18]].map(([x,z])=>({x,z,w:3.5,d:3.5,name:'a tree'})), ...[[-12,13],[-14,11],[-17,-5],[16,-12]].map(([x,z])=>({x,z,w:3.2,d:3.2,name:'the garden rocks'}))];
  const hit=fixed.find(v=>homeRectsOverlap139(rect,v,.4));if(hit)return {ok:false,reason:'Leave space around '+hit.name+'.'};
  if(Math.hypot(p.x-11,p.z-15)<4.5+Math.hypot(f.w,f.d)/2)return {ok:false,reason:'Keep the portal court clear.'};
  for(const dx of[-f.w/2,0,f.w/2])for(const dz of[-f.d/2,0,f.d/2])if(homePathDistance139(p.x+dx,p.z+dz)<2.15)return {ok:false,reason:'Keep the garden paths and front-door route clear.'};
  const overlap=placements.find(v=>v.uid!==p.uid&&homeRectsOverlap139(rect,{...v,...homeFootprint139(v)},.25));if(overlap)return {ok:false,reason:'This overlaps '+HOME_DECOR139[overlap.item].name+'.'};
  return {ok:true,y:.035};
 }
 if(q.surface==='wall'){
  if(!['back','left','right'].includes(p.surface))return {ok:false,reason:'Choose an inside wall.'};
  if(p.surface!=='back'&&p.z+q.w/2>-.5)return {ok:false,reason:'Choose the tall part of the side wall.'};
  const along=p.surface==='back'?p.x:p.z,limit=p.surface==='back'?hw:hd;
  if(Math.abs(along)+q.w/2>limit-1)return {ok:false,reason:'Keep the frame inside the wall.'};
  // The windows and hearth are real openings and are kept clear.
  if(p.surface==='back'&&([-.27*layout.w,.27*layout.w].some(x=>Math.abs(p.x-x)<(q.w+2.4)/2)||Math.abs(p.x-(layout.hearth144?.[0]??(-hw+1.7)))<(q.w+3.2)/2))return {ok:false,reason:'Keep the windows and hearth clear.'};
  if(placements.some(v=>v.uid!==p.uid&&HOME_DECOR139[v.item]?.surface==='wall'&&v.surface===p.surface&&Math.abs((p.surface==='back'?v.x:v.z)-along)<(q.w+HOME_DECOR139[v.item].w)/2+.15))return {ok:false,reason:'There is already a decoration on that part of the wall.'};
  return {ok:true,y:2.85};
 }
 if(q.surface==='table'){
  const table=placements.find(v=>v.uid===p.surface&&HOME_DECOR139[v.item]?.kind==='table');
  if(!table)return {ok:false,reason:'Place this decoration on a table.'};
  const t=homeFootprint139(table);if(Math.abs(p.x-table.x)+f.w/2>t.w/2-.12||Math.abs(p.z-table.z)+f.d/2>t.d/2-.12)return {ok:false,reason:'Keep the whole decoration on the tabletop.'};
  if(placements.some(v=>v.uid!==p.uid&&v.surface===p.surface&&homeRectsOverlap139({...v,...homeFootprint139(v)},{...p,...f},.06)))return {ok:false,reason:'This spot on the table is occupied.'};
  return {ok:true,y:HOME_DECOR139[table.item].top};
 }
 if(Math.abs(p.x)+f.w/2>hw-.65||Math.abs(p.z)+f.d/2>hd-.65)return {ok:false,reason:'Keep the decoration inside the room.'};
 const rect={...p,...f},fixed=homeFixed139(layout).find(v=>homeRectsOverlap139(rect,v));
 if(fixed)return {ok:false,reason:'Leave space around '+fixed.name+'.'};
 if(q.solid){const hit=placements.find(v=>v.uid!==p.uid&&HOME_DECOR139[v.item]?.solid&&homeRectsOverlap139(rect,{...v,...homeFootprint139(v)}));if(hit)return {ok:false,reason:'This overlaps '+HOME_DECOR139[hit.item].name+'.'};}
 return {ok:true,y:q.kind==='rug'?.045:.025};
}
function normalizeHousing139(s){
 const raw=saveObject(s.housing139)?s.housing139:{},h={version:1,home:null,return:null,claimed:{},next:Math.floor(boundedNumber(raw.next,1,1,1000000)),revision:Math.floor(boundedNumber(raw.revision,0,0,1000000)),encounters:Math.floor(boundedNumber(raw.encounters,0,0,1000000))};
 if(saveObject(raw.claimed))for(const[k,v]of Object.entries(raw.claimed).slice(0,2000))if(v===true&&k.length<150)h.claimed[k]=true;
 const r=raw.return;if(saveObject(r)&&SCENES[r.scene]&&POIS[r.poi]&&r.scene!=='homePlot139'&&r.scene!=='homeInterior139'&&Number.isFinite(r.x)&&Number.isFinite(r.z))h.return={scene:r.scene,poi:r.poi,x:clamp(r.x,-10000,10000),z:clamp(r.z,-10000,10000)};
 const home=raw.home;
 if(saveObject(home)&&HOME_STYLES139[home.region]&&POIS[home.region]&&HOME_LAYOUTS139[home.layout]){
  h.home={region:home.region,layout:home.layout,appearance:homeAppearance139(home),placements:[]};const used=new Map(),seen=new Set();
  for(const p of (Array.isArray(home.placements)?home.placements:[]).slice(0,120)){
   if(!saveObject(p)||!HOME_DECOR139[p.item]||typeof p.uid!=='string'||p.uid.length>50||seen.has(p.uid)||!Number.isFinite(p.x)||!Number.isFinite(p.z))continue;
   if((used.get(p.item)??0)>=(s.items[p.item]??0))continue;
   const row={uid:p.uid,item:p.item,area:p.area==='yard'?'yard':'room',x:Math.round(p.x*4)/4,z:Math.round(p.z*4)/4,turn:Number.isFinite(p.turn)?((Math.floor(p.turn)%4)+4)%4:0,surface:typeof p.surface==='string'?p.surface:'floor'};
   if(!validateHomePlacement139(row,h.home.placements,HOME_LAYOUTS139[home.layout]).ok)continue;
   h.home.placements.push(row);seen.add(row.uid);used.set(row.item,(used.get(row.item)??0)+1);
  }
 }
 s.housing139=h;
 if(['homePlot139','homeInterior139'].includes(s.scene)&&!h.home){s.scene='entrance';s.position={x:POIS.brookstead.spawn[0],z:POIS.brookstead.spawn[1]};}
 if(h.home&&isHomeScene139(s.scene)){const l=HOME_LAYOUTS139[h.home.layout],b=s.scene==='homeInterior139'?[-l.w/2+1,l.w/2-1,-l.d/2+1,l.d/2-1]:[-22,22,-21,24];s.position={x:clamp(s.position.x,b[0],b[1]),z:clamp(s.position.z,b[2],b[3])};}
 return s;
}
const normalizeHomeBefore139=normalizeJourneySave;
normalizeJourneySave=function(...args){return normalizeHousing139(normalizeHomeBefore139(...args));};
function homeChange139(){const h=housing139();h.revision++;autoSave();updateHUD();}
function grantHomeDecor139(key,item,quantity=1,quiet=false){
 const h=housing139();if(h.claimed[key]||!HOME_DECOR139[item])return false;h.claimed[key]=true;state.items[item]=(state.items[item]??0)+quantity;homeChange139();if(!quiet){toast('Collected '+ITEMS[item].name+' · '+ITEMS[item].type);sfx('reward');}return true;
}
function starterHome139(){
 const h=housing139();if(h.claimed.starter139)return;h.claimed.starter139=true;
 for(const [item,n]of Object.entries({homeBed139:1,homeTable139:1,homeChair139:2,homeRug139:1,homePlant139:2,homeLamp139:1,homeBanner139:1,homePainting139:1,homeBench139:1,homePlanter139:2,homeGardenLamp139:2,homeOrnament139:1}))state.items[item]=(state.items[item]??0)+n;
}
function purchaseHome139(region,layout){
 const style=HOME_STYLES139[region],h=housing139();if(!style||!POIS[region]||!HOME_LAYOUTS139[layout])return {ok:false,message:'Choose a home and a layout.'};
 if(h.home?.region===region)return {ok:false,message:'You already own this home.'};
 if(state.gold<style.price)return {ok:false,message:'You need '+(style.price-state.gold).toLocaleString()+' more coins.'};
 state.gold-=style.price;starterHome139();h.home={region,layout,appearance:homeAppearance139(null),placements:[]};homeChange139();sfx('reward');toast(style.name+' is yours.');return {ok:true,message:style.name+' is yours. Your empty home is ready; starter furnishings are in your collection.'};
}
function changeHomeLayout139(layout){
 const h=housing139();if(!h.home||!HOME_LAYOUTS139[layout])return false;
 h.home.layout=layout;h.home.placements=h.home.placements.filter(p=>p.area==='yard');homeChange139();return true;
}
const homeEntryBefore139=onSceneEntered;
onSceneEntered=function(id,...args){
 if(isHomeScene139(id))return;
 const r=homeEntryBefore139(id,...args),key=poiFor(id),reward={fern:'homeForest139',harbor:'homeCoast139',depths:'homeStone139',alderRemnant:'homeStone139',highmere:'homeBanner139',alder:'homeVase139',relief:'homeVase139'}[key];
 if(reward&&state.mode!=='title')grantHomeDecor139('visit:'+key,reward);return r;
};
const homeBattleBefore139=endBattle;
endBattle=function(outcome,...args){
 const b=battle&&{kind:battle.kind,ids:battle.enemies.map(e=>e.id)},r=homeBattleBefore139(outcome,...args);if(outcome!=='won'||!b)return r;
 if(b.ids.includes('ogre'))grantHomeDecor139('first-ogre','trophyOgre139');
 if(b.kind==='commander1')grantHomeDecor139('commander1','trophyCommander139');
 if(b.kind==='commander3')grantHomeDecor139('commander3','trophyBrace139');
 if(['random','wildlife'].includes(b.kind)){const h=housing139();h.encounters++;if(h.encounters%4===0)grantHomeDecor139('encounter:'+h.encounters,h.encounters%8?'homeVase139':'homeRug139');}return r;
};
