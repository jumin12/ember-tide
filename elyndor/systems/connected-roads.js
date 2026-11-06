// Road topology owns the miniature entrances. A remote shrine is a destination
// at the end of its trail, not an automatic four-way intersection.
const roadNetwork71={crossings:[],locations:new Map(),connections:[],sealed:[],version:71};
function drySegment71(a,b,r=1.7){const dx=b[0]-a[0],dz=b[1]-a[1],d=Math.hypot(dx,dz),n=Math.max(1,Math.ceil(d/1.4)),nx=-dz/(d||1)*r,nz=dx/(d||1)*r;for(let i=0;i<=n;i++){const x=mix(a[0],b[0],i/n),z=mix(a[1],b[1],i/n);if(traversalWet(x,z)||traversalWet(x+nx,z+nz)||traversalWet(x-nx,z-nz))return false;}return true;}
function dryRoad71(start,end,avoid=null){
 if(drySegment71(start,end)&&!avoid?.(mix(start[0],end[0],.5),mix(start[1],end[1],.5)))return[start,end];
 const step=2.5,pad=36,minX=Math.min(start[0],end[0])-pad,maxX=Math.max(start[0],end[0])+pad,minZ=Math.min(start[1],end[1])-pad,maxZ=Math.max(start[1],end[1])+pad,open=[],known=new Map(),closed=new Set(),key=(x,z)=>x+','+z;
 const push=n=>{open.push(n);let i=open.length-1;while(i){const p=(i-1)>>1;if(open[p].f<=n.f)break;open[i]=open[p];i=p;}open[i]=n;},pop=()=>{const first=open[0],last=open.pop();if(open.length){let i=0;while(i*2+1<open.length){let c=i*2+1;if(c+1<open.length&&open[c+1].f<open[c].f)c++;if(last.f<=open[c].f)break;open[i]=open[c];i=c;}open[i]=last;}return first;};
 const initial={ix:0,iz:0,x:start[0],z:start[1],cost:0,f:Math.hypot(end[0]-start[0],end[1]-start[1]),prev:null};push(initial);known.set('0,0',initial);let found=null;
 for(let iter=0;open.length&&iter<6500;iter++){
  const n=pop(),nk=key(n.ix,n.iz);if(closed.has(nk))continue;closed.add(nk);if(Math.hypot(n.x-end[0],n.z-end[1])<4&&drySegment71([n.x,n.z],end)){found=n;break;}
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const ix=n.ix+dx,iz=n.iz+dz,k=key(ix,iz),x=start[0]+ix*step,z=start[1]+iz*step;if(closed.has(k)||x<minX||x>maxX||z<minZ||z>maxZ||avoid?.(x,z)&&Math.hypot(x-start[0],z-start[1])>4||!drySegment71([n.x,n.z],[x,z]))continue;const cost=n.cost+Math.hypot(dx,dz)*step;if(cost>=(known.get(k)?.cost??Infinity))continue;const next={ix,iz,x,z,cost,f:cost+Math.hypot(x-end[0],z-end[1])*1.015,prev:n};known.set(k,next);push(next);}
 }
 if(!found)return null;const path=[end];for(let n=found;n;n=n.prev)path.push([n.x,n.z]);path.reverse();const out=[path[0]];for(let i=0;i<path.length-1;){let j=path.length-1;while(j>i+1&&(!drySegment71(path[i],path[j])||avoid?.(mix(path[i][0],path[j][0],.5),mix(path[i][1],path[j][1],.5))))j--;out.push(path[j]);i=j;}return out;
}
function regionalConnection71(start,end,avoid){
 const direct=dryRoad71(start,end,avoid);if(direct)return direct;
 // A town near a river can have incoming roads on the opposite bank. Use an
 // existing crossing's exact centre lane instead of making a second crossing.
 for(const b of spans38){if(Math.min(Math.hypot(start[0]-b.x,start[1]-b.z),Math.hypot(end[0]-b.x,end[1]-b.z))>75)continue;const c=Math.cos(b.angle),s=Math.sin(b.angle),banks=[-1,1].map(v=>[b.x+c*v*(b.length/2+5),b.z+s*v*(b.length/2+5)]);for(const order of[banks,[...banks].reverse()]){const left=dryRoad71(start,order[0],avoid),right=dryRoad71(order[1],end,avoid);if(left&&right)return[...left,...right];}}
 return null;
}
function bendRoad71(points){const out=[points[0]];for(let i=1;i<points.length-1;i++){const a=points[i-1],b=points[i],c=points[i+1],la=Math.hypot(a[0]-b[0],a[1]-b[1]),lc=Math.hypot(c[0]-b[0],c[1]-b[1]),r=Math.min(4,la*.25,lc*.25),u=[mix(b[0],a[0],r/(la||1)),mix(b[1],a[1],r/(la||1))],v=[mix(b[0],c[0],r/(lc||1)),mix(b[1],c[1],r/(lc||1))],curve=[];for(let j=0;j<=5;j++){const t=j/5;curve.push([mix(mix(u[0],b[0],t),mix(b[0],v[0],t),t),mix(mix(u[1],b[1],t),mix(b[1],v[1],t),t)]);}if(curve.slice(1).every((p,j)=>drySegment71(curve[j],p)))out.push(...curve);else out.push(b);}out.push(points.at(-1));return out;}
function crossingCandidates71(old){
 const found=[];for(let radius=0;radius<=36;radius+=6)for(let k=0;k<(radius?12:1);k++)for(const delta of[0,-.25,.25,-.5,.5,-.8,.8,-1.05,1.05]){
  const x=old.x+Math.cos(k*TAU/12)*radius,z=old.z+Math.sin(k*TAU/12)*radius,angle=old.angle+delta,c=Math.cos(angle),s=Math.sin(angle);if(!traversalWet(x,z))continue;let left=0,right=0;while(left<85&&traversalWet(x-c*left,z-s*left))left+=.6;while(right<85&&traversalWet(x+c*right,z+s*right))right+=.6;if(left>=85||right>=85||left+right<5)continue;
  const shift=(right-left)/2,cx=x+c*shift,cz=z+s*shift,length=left+right+6,width=7.6,ends=[-1,1].map(side=>[cx+c*side*(length/2+6),cz+s*side*(length/2+6)]);if(!ends.every(p=>drySegment71(p,[p[0]+c*3,p[1]+s*3])))continue;
  let clean=true;for(let u=-length/2+5;u<=length/2-5&&clean;u+=1.5)for(const v of[-2.5,0,2.5])if(!traversalWet(cx+c*u-s*v,cz+s*u+c*v)){clean=false;break;}if(!clean)continue;
  found.push({x:cx,z:cz,length,width,angle,ends,score:length+radius*.50+Math.abs(delta)*8});
 }
 return found.sort((a,b)=>a.score-b.score).slice(0,30);
}
// Remove the old straight duplicate branch to the southern shrine. Its newer
// valley route is the one actually connected to the moved adventure site.
{
 const preferred=new Set(MACRO_ROADS15.filter(r=>r.jrpgBranch46).map(r=>(r.atlas18??[]).slice().sort().join('|')));MACRO_ROADS15.splice(0,MACRO_ROADS15.length,...MACRO_ROADS15.filter(r=>r.jrpgBranch46||!preferred.has((r.atlas18??[]).slice().sort().join('|'))));
 for(const old of [...spans38]){
  const uses=[];for(const road of MACRO_ROADS15){const hits=road.p.map((p,i)=>{const q=bridgeLocal15(old,...p);return Math.abs(q.u)<old.length/2+13&&Math.abs(q.v)<old.width/2+10?i:-1;}).filter(i=>i>=0);if(!hits.length||!hits.some(i=>traversalWet(...road.p[i])))continue;let lo=Math.max(0,hits[0]-1),hi=Math.min(road.p.length-1,hits.at(-1)+1);while(lo>0&&!drySegment71(road.p[lo],road.p[lo-1]))lo--;while(hi<road.p.length-1&&!drySegment71(road.p[hi],road.p[hi+1]))hi++;uses.push({road,lo,hi});}
  if(!uses.length)continue;let choice=null,replacements=[];
  for(const candidate of crossingCandidates71(old)){
   const built=[];let valid=true;for(const use of uses){const a=use.road.p[use.lo],b=use.road.p[use.hi],reverse=Math.hypot(a[0]-candidate.ends[0][0],a[1]-candidate.ends[0][1])>Math.hypot(a[0]-candidate.ends[1][0],a[1]-candidate.ends[1][1]),ends=reverse?[...candidate.ends].reverse():candidate.ends,left=dryRoad71(a,ends[0]),right=dryRoad71(ends[1],b);if(!left||!right){valid=false;break;}built.push({...use,path:[...bendRoad71(left),...bendRoad71(right)]});}if(valid){choice=candidate;replacements=built;break;}
  }
  if(!choice){roadNetwork71.crossings.push({before:[old.x,old.z],retained:true});continue;}
  for(const r of replacements)r.road.p.splice(r.lo,r.hi-r.lo+1,...r.path);roadNetwork71.crossings.push({before:[old.x,old.z],after:[choice.x,choice.z],oldLength:old.length,newLength:choice.length,cleanWater:true});
 }
 rebuildRoadIndex67();planWaterCrossings();
 const aliases=new Map(Object.entries(POIS).map(([key,p])=>[p.atlas18??key,key]));
 for(const road of MACRO_ROADS15){road.ends71=[road.p[0],road.p.at(-1)].map(at=>{let best=null;for(const tag of road.atlas18??[]){const key=aliases.get(tag),p=POIS[key];if(p){const d=Math.hypot(at[0]-p.node[0],at[1]-p.node[1]);if(d<48&&(!best||d<best.d))best={key,d};}}return best?.key??null;});}
 for(const[key,p]of Object.entries(POIS)){
  const all=entranceDescriptors64(key),plan=levels39.plans.get(key),links=[];
  for(const road of MACRO_ROADS15)for(let end=0;end<2;end++)if(road.ends71[end]===key){const points=end?[...road.p].reverse():road.p,near=points.find(pt=>Math.hypot(pt[0]-p.node[0],pt[1]-p.node[1])>=30)??points.at(-1),v=[near[0]-p.node[0],near[1]-p.node[1]],gate=resolveEntrance64(key,v);links.push({road,end,side:gate.side,oldIndex:gate.index,vector:v});}
  const selected=all.filter(g=>links.some(l=>l.oldIndex===g.index));if(!selected.length)selected.push(all[0]);
  const cuts=compactDepartures.get(key);plan.gates=selected.map(g=>plan.gates[g.index]);compactDepartures.set(key,selected.map(g=>cuts[g.index]));travel64.registry[key]=selected.map((g,i)=>({...g,id:key+':'+g.side+':'+i,index:i}));
  const first=plan.gates[0];p.exit=[first.x,first.z];p.spawn=[first.x-first.dir[0]*9,first.z-first.dir[1]*9];roadNetwork71.locations.set(key,{links,retained:travel64.registry[key],removed:all.filter(g=>!selected.includes(g)).map(g=>g.side)});
 }
}
const connectedFitBefore71=fitDoorways39;
fitDoorways39=function(...args){
 if(activeScene.kind==='poi'){
  const gates=levels39.plans.get(activeScene.key).gates,exits=interactables.filter(o=>o.type==='poiExit'),keep=new Set();for(const g of gates){const e=exits.filter(e=>!keep.has(e)).sort((a,b)=>Math.hypot(a.x-g.x,a.z-g.z)-Math.hypot(b.x-g.x,b.z-g.z))[0];if(e)keep.add(e);}interactables=interactables.filter(o=>o.type!=='poiExit'||keep.has(o));
 }
 return connectedFitBefore71(...args);
};
