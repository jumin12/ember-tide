// Village errands must not run a 6,500-node synchronous A* search inside a
// render frame. Each resident owns a resumable job; one shared time budget
// services all jobs fairly. Physical movement still checks the live colliders
// and other actors on every step, independently of the planned route.
const navigation23={world:null,jobs:[],cursor:0,expanded:0,completed:0,failed:0,maxSliceMs:0,slices:0};
const NAV_DIRECTIONS23=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];
function navKey23(x,z){return (x+4096)*8192+z+4096;}
function navPush23(job,n){const heap=job.heap;let i=heap.length;heap.push(n);while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;}
function navPop23(job){const heap=job.heap,top=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return top;}
function requestResidentRoute23(a,to,others){
 const job={actor:a,from:{x:a.x,z:a.z},to:{x:to.x,z:to.z},crowd:others.map(o=>({x:o.x,z:o.z})),phase:0,heap:[],seen:new Map(),closed:new Set(),parent:new Map(),positions:new Map(),free:new Map(),count:0};
 a.navJob23=job;navigation23.jobs.push(job);return job;
}
function finishResidentRoute23(job,path){const a=job.actor;if(a.navJob23===job){a.navJob23=null;if(path?.length){a.route=path;navigation23.completed++;}else{a.wait=2;a.workIndex=(a.workIndex+1)%a.workRoute.length;navigation23.failed++;}}job.done=true;}
function navNodeFree23(job,x,z){const k=navKey23(x,z);if(job.free.has(k))return job.free.get(k);const px=x*.7,pz=z*.7,free=staticFree(px,pz,.5)&&!job.crowd.some(a=>(a.x-px)**2+(a.z-pz)**2<.92*.92);job.free.set(k,free);return free;}
function stepResidentRoute23(job){
 const a=job.actor;if(a.navJob23!==job||!a.mesh.visible||a.scripted||dist(a,job.from)>.25){if(a.navJob23===job)a.navJob23=null;job.done=true;return;}
 if(job.phase===0){
  if(!staticFree(job.to.x,job.to.z,.5)){finishResidentRoute23(job,null);return;}
  if(edgeFree(job.from,job.to,.5)&&!job.crowd.some(a=>segmentDistance(a.x,a.z,[job.from.x,job.from.z],[job.to.x,job.to.z])<.9)){finishResidentRoute23(job,[job.to]);return;}
  job.start=[Math.round(job.from.x/.7),Math.round(job.from.z/.7)];job.goal=[Math.round(job.to.x/.7),Math.round(job.to.z/.7)];job.startKey=navKey23(...job.start);job.seen.set(job.startKey,0);job.positions.set(job.startKey,job.start);navPush23(job,{x:job.start[0],z:job.start[1],g:0,f:0});job.phase=1;return;
 }
 if(!job.heap.length||job.count++>=6500){finishResidentRoute23(job,null);return;}
 const cur=navPop23(job),key=navKey23(cur.x,cur.z);if(job.closed.has(key))return;job.closed.add(key);navigation23.expanded++;
 const cp=key===job.startKey?job.from:{x:cur.x*.7,z:cur.z*.7};
 if(Math.hypot(cur.x-job.goal[0],cur.z-job.goal[1])<1.5&&edgeFree(cp,job.to,.5)){
  const path=[];for(let k=key;k!==job.startKey;k=job.parent.get(k)){const p=job.positions.get(k);if(!p)break;path.push({x:p[0]*.7,z:p[1]*.7});}path.reverse();path.push(job.to);finishResidentRoute23(job,path);return;
 }
 for(const [dx,dz,cost]of NAV_DIRECTIONS23){const x=cur.x+dx,z=cur.z+dz,k=navKey23(x,z);if(job.closed.has(k)||!navNodeFree23(job,x,z))continue;const p={x:x*.7,z:z*.7};if(!edgeFree(cp,p,.5))continue;const g=cur.g+cost;if(g>=(job.seen.get(k)??Infinity))continue;job.seen.set(k,g);job.parent.set(k,key);job.positions.set(k,[x,z]);navPush23(job,{x,z,g,f:g+Math.hypot(x-job.goal[0],z-job.goal[1])});}
}
function processNavigation23(){
 if(!world||gameLoading||menu||dialogue||transition||battle||!['explore','title'].includes(state.mode)||!navigation23.jobs.length)return;
 const start=performance.now(),deadline=start+1.15;
 // Check the deadline after every single expanded node, not a large batch.
 do{if(navigation23.cursor>=navigation23.jobs.length)navigation23.cursor=0;const job=navigation23.jobs[navigation23.cursor];stepResidentRoute23(job);if(job.done)navigation23.jobs.splice(navigation23.cursor,1);else navigation23.cursor++;}while(navigation23.jobs.length&&performance.now()<deadline);
 navigation23.maxSliceMs=Math.max(navigation23.maxSliceMs,performance.now()-start);navigation23.slices++;
}
updateVillagers=function(dt){
 for(const a of npcs){
  a.speed=0;const o=a.interaction??interactables.find(o=>o.actor===a);if(o){o.x=a.x;o.z=a.z;}if(a.storyTarget){a.storyTarget.x=a.x;a.storyTarget.z=a.z;}
  if(a.scripted||!a.mesh.visible||battle||dist(a,player)>100)continue;
  if((assets.sprites[a.id].frames.north?.length??0)<2){a.action='enemyIdle';a.task='Keeping watch over the approach';a.route=null;continue;}
  if(a.wait>0){a.wait-=dt;continue;}
  if(!a.route?.length){
   if(a.navJob23)continue;
   a.workIndex=(a.workIndex+1)%a.workRoute.length;const goal=a.workRoute[a.workIndex],others=actors.filter(o=>o.npc&&o!==a&&o.mesh.visible);
   if(others.some(o=>dist(o,goal)<1.05)){a.wait=1.4;continue;}
   a.goal=goal;requestResidentRoute23(a,goal,others);continue;
  }
  const q=a.route[0],d=dist(a,q);
  if(d<.12){a.route.shift();if(!a.route.length){a.tasks++;a.task=a.workTasks[a.tasks%a.workTasks.length];a.wait=4+(a.routine%5)*1.2;if(Math.hypot(a.home.x-a.x,a.home.z-a.z)>.2)a.face=facingForMotion(a.home.x-a.x,a.home.z-a.z);}continue;}
  const speed=1.05+(a.routine%3)*.12;moveActor(a,(q.x-a.x)/d*Math.min(d,speed*dt),(q.z-a.z)/d*Math.min(d,speed*dt),dt);
  if(a.stuck>.7){a.route=null;a.wait=.6+(a.routine%4)*.19;a.stuck=0;}
 }
};
const navigationTickBefore23=tick;tick=function(...args){const r=navigationTickBefore23(...args);processNavigation23();return r;};
const navigationBuildBefore23=buildWorld;buildWorld=function(...args){const r=navigationBuildBefore23(...args);if(navigation23.world!==world){navigation23.world=world;navigation23.jobs.length=0;navigation23.cursor=0;for(const a of npcs)a.navJob23=null;}return r;};
