// The continent's woodland remains scenery. Only actual water, steep terrain,
// buildings and other solid structures restrict overworld movement.
const openContinentBefore105=staticFree;
staticFree=function(x,z,r=.4){
 if(activeScene?.kind==='overworld'&&!encounter53.active)return boundaryFreeBefore46(x,z,r);
 return openContinentBefore105(x,z,r);
};

const habitatTreeGrid105=new WeakMap();
function nearbyTrees105(x,z){
 let grid=habitatTreeGrid105.get(world);
 if(!grid){grid=new Map();for(const t of scenery.trees){const key=Math.floor(t.x/32)+','+Math.floor(t.z/32);if(!grid.has(key))grid.set(key,[]);grid.get(key).push(t);}habitatTreeGrid105.set(world,grid);}
 let count=0,pines=0,orchard=0,nearest=Infinity;
 const cx=Math.floor(x/32),cz=Math.floor(z/32);
 for(let iz=cz-1;iz<=cz+1;iz++)for(let ix=cx-1;ix<=cx+1;ix++)for(const t of grid.get(ix+','+iz)??[]){const d=Math.hypot(x-t.x,z-t.z);if(d>30)continue;nearest=Math.min(nearest,d);const weight=1-smooth(13,30,d);count+=weight;if(t.species30===4)pines+=weight;if(t.species30===5)orchard+=weight;}
 return{count,pines,orchard,nearest};
}
function climateAt105(x,z){
 const c=ATLAS_RELIEF18.climate,fx=clamp((x+1024)/2048*(c.w-1),0,c.w-1),fz=clamp((z+576)/1152*(c.h-1),0,c.h-1),ix=Math.round(fx),iz=Math.round(fz),at=(iz*c.w+ix)*4;
 return Array.from(climateBytes38.slice(at,at+4),v=>v/255);
}
function encounterHabitat105(x=player.x,z=player.z){
 const macro=activeScene.kind==='overworld',key=macro?regionForBattle53():activeScene.key,trees=nearbyTrees105(x,z),profile=PLACE_ECOLOGY104[key],climate=macro?climateAt105(x,z):[key==='snow'?1:0,0,0,0];
 const sample=macro?habitat66(x,z):null,shore=macro?traversalShoreDistance(x,z):profile?.flora==='coast'?0:999,river=macro?macroRiverInfo15(x,z):null;
 let kind='meadow';
 if(!macro&&key==='depths')kind='cave';
 else if(climate[0]>.48||!macro&&key==='snow')kind='snow';
 else if(!macro&&['nearbySite','siteClearing','alderRemnant'].includes(key))kind='ruins';
 else if(shore<15||!macro&&profile?.flora==='coast')kind='coast';
 else if(trees.orchard>1.5||!macro&&profile?.flora==='orchard')kind='orchard';
 else if(trees.count>=4.5||!macro&&profile?.flora==='woodland')kind='forest';
 else if(macro&&(climate[1]>.45||sample.h>26)||!macro&&profile?.flora==='alpine')kind='highland';
 else if(macro&&river.width>0&&river.d-river.width<19)kind='river';
 else if(!macro&&key==='highmere')kind='royal';
 return{kind,region:key,macro,trees,climate,shore:Number.isFinite(shore)?shore:null,x,z};
}
const matchingStagePoolBefore105=stagePool53;
stagePool53=function(region=regionForBattle53()){
 if(!player||!world||!['poi','overworld'].includes(activeScene.kind))return matchingStagePoolBefore105(region);
 const h=encounterHabitat105();encounter53.habitat105=h;
 const pools={forest:['woodland','moonlit'],cave:['cavern'],snow:['snow'],ruins:['ruins'],coast:['coast','grassDowns'],orchard:['orchard','grassWindmill'],highland:['mountain','grassHills','grassStones'],river:['grassRiver'],royal:['royalRoad'],meadow:['grassMeadow','grassFlowers','grassBirch','grassTwilight']};
 const pool=pools[h.kind].slice(),hour=(state.worldMinutes/60%24+24)%24;
 if(h.kind==='meadow'&&hour>=6&&hour<17)pool.splice(pool.indexOf('grassTwilight'),1);
 return pool;
};
