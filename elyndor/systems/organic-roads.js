// Round connected travel roads in dry ground. Endpoints, town entrances and
// straight bridge lanes remain pinned to their authored positions.
const roadRounding110={roads:0,corners:0,rejected:0,maxRadius:12};
function protectedRoad110(p){
 if(Object.values(POIS).some(o=>Math.hypot(p[0]-o.node[0],p[1]-o.node[1])<25))return true;
 return spans38.some(b=>{const q=bridgeLocal15(b,...p);return Math.abs(q.u)<b.length/2+(b.approach38??14)+7&&Math.abs(q.v)<b.width/2+6;});
}
function simplifyRoad110(points,tolerance=.5){
 if(points.length<3)return points.slice();
 const output=[points[0]],keep=(a,b)=>{let far=-1,best=tolerance;for(let i=a+1;i<b;i++){const d=segmentDistance(...points[i],points[a],points[b]);if(d>best||protectedRoad110(points[i])&&d>.07){best=d;far=i;}}if(far<0){output.push(points[b]);return;}keep(a,far);keep(far,b);};keep(0,points.length-1);return output;
}
for(const road of MACRO_ROADS15){
 if(road.p.length<3)continue;const points=simplifyRoad110(road.p),out=[points[0]];
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],b=points[i],c=points[i+1],la=Math.hypot(a[0]-b[0],a[1]-b[1]),lc=Math.hypot(c[0]-b[0],c[1]-b[1]);
  if(protectedRoad110(b)||la<.5||lc<.5){out.push(b);continue;}
  const turn=Math.acos(clamp(((b[0]-a[0])*(c[0]-b[0])+(b[1]-a[1])*(c[1]-b[1]))/(la*lc),-1,1));if(turn<.08){out.push(b);continue;}
  let radius=Math.min(12,la*.43,lc*.43),curve=null;
  for(let attempt=0;attempt<5;attempt++,radius*=.6){
   const u=[mix(b[0],a[0],radius/la),mix(b[1],a[1],radius/la)],v=[mix(b[0],c[0],radius/lc),mix(b[1],c[1],radius/lc)],n=Math.max(5,Math.ceil(radius*turn/.9)),candidate=[];
   for(let k=0;k<=n;k++){const t=k/n;candidate.push([mix(mix(u[0],b[0],t),mix(b[0],v[0],t),t),mix(mix(u[1],b[1],t),mix(b[1],v[1],t),t)]);}
   if(candidate.slice(1).every((p,j)=>drySegment71(candidate[j],p,1.8))){curve=candidate;break;}
  }
  if(curve){out.push(...curve);roadRounding110.corners++;}else{out.push(b);roadRounding110.rejected++;}
 }
 out.push(points.at(-1));road.p=out;roadRounding110.roads++;
}
rebuildRoadIndex67();roadSurface71.texture?.dispose();roadSurface71.texture=null;roadSurface71.segments=0;
