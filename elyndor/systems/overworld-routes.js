// Curved road samples can miss a bridge entrance or clip a parapet. Give the
// navigation graph the real, walkable deck lane and connect its dry endpoints
// to the adjacent road. Every link uses the world-map party's full clearance.
const traversalRoadBefore44=roadGraph;
roadGraph=function(...args){
 if(!compactWorld44())return traversalRoadBefore44(...args);
 let graph;compactTraversal44.routing++;try{graph=traversalRoadBefore44(...args);}finally{compactTraversal44.routing--;}
 if(graph.bridgeLanes44)return graph;graph.bridgeLanes44=true;
 const radius=actorRadius(player)+.05;
 for(const b of world.userData.bridges??[]){
  const ends=[-1,1].map(sign=>({x:b.x+Math.cos(b.angle)*sign*(b.length/2+.4),z:b.z+Math.sin(b.angle)*sign*(b.length/2+.4)}));
  if(!ends.every(p=>staticFree(p.x,p.z,radius))||!edgeFree(...ends,radius))continue;
  const base=graph.nodes.length;graph.nodes.push(...ends);graph.edges.push([[base+1,dist(...ends)]],[[base,dist(...ends)]]);
  for(let k=0;k<2;k++)for(let j=0;j<base;j++){
   const d=dist(ends[k],graph.nodes[j]);if(d>22||d<.01||!edgeFree(ends[k],graph.nodes[j],radius))continue;
   graph.edges[base+k].push([j,d]);graph.edges[j].push([base+k,d]);
  }
 }
 return graph;
};
