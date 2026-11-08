// Native silhouettes determine rank spacing; transparent sword/staff margins
// never decide how much personal space a standing fighter needs.
const rank87={roster:[],silhouettes:new Map(),owner:null,key:'',bounds:null};
function enemyPresentationSize87(id,fallback=2.45){return({commander:5.75,commander2:6.1666666667,commander3:6.5833333333})[id]??creatureHeight(id,fallback);}
function silhouette87(id){
 if(rank87.silhouettes.has(id))return rank87.silhouettes.get(id);
 const m=assets.sprites[id],im=spriteImages[id],cell=(m.frames.battleIdle??m.frames.enemyIdle??m.frames.south)[0],c=document.createElement('canvas');c.width=m.w;c.height=m.h;
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,cell%m.cols*m.w,Math.floor(cell/m.cols)*m.h,m.w,m.h,0,0,m.w,m.h);const p=ctx.getImageData(0,0,m.w,m.h).data;let x0=m.w,x1=0,y0=m.h,y1=0;
 for(let y=0;y<m.h;y++)for(let x=0;x<m.w;x++)if(p[(y*m.w+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 const unit=m.unit??136,b={left:(x0-m.w/2)/unit,right:(x1+1-m.w/2)/unit,height:(m.h-y0-(m.gutter??8))/unit,width:(x1-x0+1)/unit};rank87.silhouettes.set(id,b);return b;
}
const rankRosterBefore87=encounterRoster;
encounterRoster=function(...args){return rank87.roster=rankRosterBefore87(...args);};
const rankPrepareBefore87=prepareBattlefield;
prepareBattlefield=function(kind,...args){rank87.roster=ENCOUNTERS[kind]?.enemies??[];return rankPrepareBefore87(kind,...args);};
// The same layout is used while finding an outdoor arena, creating actors,
// switching orientation, and framing an isolated painted battle stage.
battleFormation=function(c,i,enemy=false,count=state.members.length){
 if(!enemy){const ranks=count<=2?[[3.8,2.8],[6.6,-2.2]]:[[2.4,2.4],[3.8,-2.5],[5.1,3.4],[6.6,-1.6],[7.7,4.1]];const p=ranks[i]??[10.5+i,0];return{x:c.x+p[0],z:c.z+p[1]};}
 const rows=battle?.enemies?.map(e=>[e.id,e.actor.size])??rank87.roster.map(r=>[r[0],enemyPresentationSize87(r[0])]);
 if(!rows[i])return{x:c.x-5-(i%2)*4,z:c.z+(i-1)*6};
 const widths=rows.map(([id,size])=>Math.max(1.15,silhouette87(id).width*size)),wide=Math.max(...widths),height=Math.max(...rows.map(r=>r[1])),depth=Math.max(7,height*2.2),left=-Math.max(6.9,wide*1.9),right=-3.4-wide*.35;
 if(rows.length===1)return{x:c.x-6.5,z:c.z+.4};
 if(rows.length===2)return i===0?{x:c.x-Math.max(7,wide*1.8),z:c.z-depth*.4}:{x:c.x+right,z:c.z+depth*.5};
 return i===0?{x:c.x+left,z:c.z-depth*.55}:i===1?{x:c.x+right,z:c.z+depth*.4}:{x:c.x+left-.6,z:c.z+depth*.72};
};
function frameRanks87(cast,floor){
 battle.rankHomes87??=new Map(cast.map(a=>[a,{x:a.x,z:a.z}]));
 const mobile=mobileBattle69(),field=mobile?mobileField69():{top:90,height:Math.max(220,innerHeight-230)},right=mobile?0:Math.min(310,innerWidth*.23),width=innerWidth-right;
 const key=[battle.started,battle.kind,innerWidth,innerHeight,...cast.map(a=>(a.visualId??a.id)+':'+a.size)].join('|');
 if(rank87.owner!==battle||rank87.key!==key){
  rank87.owner=battle;rank87.key=key;const box=new THREE.Box3();
  for(const a of cast){const home=battle.rankHomes87.get(a)??a,b=silhouette87(a.visualId??a.id),y=heightAt(home.x,home.z);box.expandByPoint(V3(home.x+b.left*a.size-.4,y,home.z));box.expandByPoint(V3(home.x+b.right*a.size+.4,y+b.height*a.size+.3,home.z));}
  rank87.bounds=box;
 }
 const box=rank87.bounds,span=box.getSize(V3()),centre=box.getCenter(V3()),tan=Math.tan(THREE.MathUtils.degToRad(17.5)),aspect=width/field.height,pitch=Math.atan(encounter53.active?.16:.30),sin=Math.sin(pitch),cos=Math.cos(pitch);
 const projectedHeight=span.y*cos+span.z*sin,distance=Math.max(18,(span.x+1.8)/(2*tan*aspect*.9),(projectedHeight+1.4)/(2*tan*.7));
 const middleV=centre.y*cos-centre.z*sin;cameraTarget.set(centre.x,(middleV+sin*centre.z+distance*tan*(mobile?(field.landscape?-.02:.10):.32))/cos,centre.z);camera.position.copy(cameraTarget).add(V3(0,distance*sin,distance*cos));camera.fov=35;camera.near=.1;camera.far=900;camera.lookAt(cameraTarget);
 camera.setViewOffset(width,field.height,0,-field.top,innerWidth,innerHeight);camera.updateProjectionMatrix();camera.updateMatrixWorld();focusPoint.copy(cameraTarget);sideCameraStats.angle=pitch*180/Math.PI;
}
