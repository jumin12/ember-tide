// Streets end at entrances and travel around structures, on the visible ground.
const redesignedStreets={
 0:[[-199,145],[-174,137],[-151,126],[-143,120],[-119.8,120],[-119.8,112],[-121,105],[-124,94],[-124,82],[-123,72],[-119,69.5],[-112.5,67],[-109,66],[-97,69],[-85,78],[-64,88],[-43,91]],
 1:[[-124,92],[-143,89],[-150,83],[-143,81],[-140,75],[-140,71.8],[-132,68.5],[-127,67.8],[-127,60],[-124.5,56],[-119,55],[-116,54]],
 5:[[-124,94],[-143,89],[-145,82],[-140,79],[-140,74],[-140,71.8],[-145,70.5],[-149,70.5],[-152,68.5],[-155,65],[-158.8,68.5],[-158.8,71],[-155.8,60],[-155.8,50],[-155.8,40],[-155.8,33],[-138,7],[-107,-18],[-93,-43],[-84,-57],[-84,-71],[-85,-82]],
 8:[[-99,-97.4],[-99,-95],[-91,-93],[-85,-96],[-78,-103],[-69,-110.5]],
 9:[[-75,-80],[-82,-88],[-81,-100],[-75,-107],[-69,-110.5]],
 10:[[-104,-80],[-113,-85],[-112,-93],[-104,-95],[-99,-97.4]],
 15:[[-85,-96],[-86,-112],[-91,-117],[-109,-119],[-111,-144],[-95,-169],[-81,-190]]
};
for(const [i,points]of Object.entries(redesignedStreets))ROAD_DEFS[Number(i)].p=points;
ROADS.splice(0,ROADS.length,...ROAD_DEFS.map(r=>({...r,p:new THREE.CatmullRomCurve3(r.p.map(p=>V3(p[0],0,p[1])),false,'catmullrom',.18).getPoints(r.p.length*12).map(p=>[p.x,p.z])})));
ROAD_SEGMENTS.splice(0,ROAD_SEGMENTS.length,...ROADS.flatMap(r=>r.p.slice(1).map((b,i)=>({a:r.p[i],b,kind:r.kind,minX:Math.min(r.p[i][0],b[0])-14,maxX:Math.max(r.p[i][0],b[0])+14,minZ:Math.min(r.p[i][1],b[1])-14,maxZ:Math.max(r.p[i][1],b[1])+14}))));
ROAD_GRID.clear();for(const s of ROAD_SEGMENTS)for(let x=Math.floor((s.minX-55)/32);x<=Math.floor((s.maxX+55)/32);x++)for(let z=Math.floor((s.minZ-55)/32);z<=Math.floor((s.maxZ+55)/32);z++){const key=x+','+z;if(!ROAD_GRID.has(key))ROAD_GRID.set(key,[]);ROAD_GRID.get(key).push(s);}
BROOK.houses.find(h=>h[4]==='forge')[1]=62.5;
const millSite=BROOK.houses.find(h=>h[4]==='mill');millSite[0]=-154;millSite[1]=90.5;

function riverBoulderGeometry(){
 const g=new THREE.SphereGeometry(1,12,8),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=1+.09*Math.sin(x*5.3+z*3.1)*Math.cos(y*4.2-z*2.7);p.setXYZ(i,x*r,(y<-.35?-.35+(y+.35)*.5:y)*r,z*r);}
 g.computeVertexNormals();g.computeBoundingSphere();return g;
}
sharedGeo.rock=riverBoulderGeometry();sharedGeo.brookBankRock=riverBoulderGeometry();
const groundPlantBeforeStreets=plant;
plant=function(x,z,size,kind,y){
 const raised=Number.isFinite(y)&&y>heightAt(x,z)+.28;
 if(!raised&&roadDistance(x,z)<3.35)return;
 if(!raised&&[[ -124,79.5,5.2,7],[-101,79.5,5,7],[-140,75.5,4.8,7],[-132,68.5,7,5]].some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2+1&&Math.abs(z-cz)<d/2+1.4))return;
 return groundPlantBeforeStreets(x,z,size,kind,y);
};
