// Major settlements retain their regional geography. Adventure destinations
// occupy their own valleys instead of sharing the edge of a town miniature.
const JRPG_SITES46={depths:[-580,-180],fernClearing:[-700,-140],patrol:[-340,20],alderRemnant:[-180,140],alderClearing:[-380,160],reliefClearing:[-400,-220],siteClearing:[20,-200]};
const movedAtlas46=new Set();
for(const[key,node]of Object.entries(JRPG_SITES46)){const p=POIS[key];p.node=[...node];if(p.atlas18){movedAtlas46.add(p.atlas18);const ref=atlasPoint18(p.atlas18);if(ref){ref.x=(node[0]+1024)/2048*100;ref.y=(node[1]+576)/1152*100;}}}
const JRPG_BRANCHES46=[
 ['fern','depths',[[-620,-120],[-600,-155]]],['fern','fernClearing',[[-665,-95],[-685,-115]]],
 ['alder','patrol',[[-310,70],[-330,45]]],['alder','alderRemnant',[[-230,120]]],
 ['alder','alderClearing',[[-315,125],[-350,140]]],['relief','reliefClearing',[[-350,-180],[-380,-195]]],
 ['nearbySite','siteClearing',[[-25,-150],[5,-175]]]
];
MACRO_ROADS15.splice(0,MACRO_ROADS15.length,...MACRO_ROADS15.filter(r=>!(r.atlas18??[]).some(id=>movedAtlas46.has(id))));
for(const[from,to,via]of JRPG_BRANCHES46){const points=[POIS[from].node,...via,POIS[to].node];MACRO_ROADS15.push({kind:'trail',jrpgBranch46:true,atlas18:[POIS[from].atlas18??from,POIS[to].atlas18??to],p:new THREE.CatmullRomCurve3(points.map(([x,z])=>V3(x,0,z)),false,'catmullrom',.12).getPoints(points.length*14).map(p=>[p.x,p.z])});}
MACRO_SEGMENTS15.splice(0,MACRO_SEGMENTS15.length,...MACRO_ROADS15.flatMap(r=>r.p.slice(1).map((b,i)=>({a:r.p[i],b,ya:Math.max(1.4,macroBase15(...r.p[i])),yb:Math.max(1.4,macroBase15(...b))}))));
MACRO_ROAD_GRID15.clear();for(const s of MACRO_SEGMENTS15)for(let x=Math.floor((Math.min(s.a[0],s.b[0])-12)/32);x<=Math.floor((Math.max(s.a[0],s.b[0])+12)/32);x++)for(let z=Math.floor((Math.min(s.a[1],s.b[1])-12)/32);z<=Math.floor((Math.max(s.a[1],s.b[1])+12)/32);z++){const key=x+','+z;if(!MACRO_ROAD_GRID15.has(key))MACRO_ROAD_GRID15.set(key,[]);MACRO_ROAD_GRID15.get(key).push(s);}
macroBridgePlans15.clear();macroGrid15=null;roadNavGraph=null;
