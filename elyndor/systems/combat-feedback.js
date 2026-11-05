// HP resolvers keep their existing calls. Each popup carries its actor anchor
// into a crisp screen-space layer and follows camera/pose changes until release.
const floatNumbers65={active:[],serial:0,perActor:new WeakMap(),stats:{spawned:0,released:0}};
floatText=function(a,text,perfect=false,heal=false,options={}){
 if(!a||text==='Weak point')return;
 const numeric=/^[+−-]?\d+(?:\s*MP)?$/.test(String(text)),last=floatNumbers65.perActor.get(a),slot=last&&clock-last.time<.35?(last.slot+1)%4:0;
 floatNumbers65.perActor.set(a,{time:clock,slot});
 const node=document.createElement('div');node.className='float-number float-number65'+(heal?' heal65':'')+(!numeric?' caption65':'')+(options.periodic||battle?.damageMeta65?.periodic?' periodic65':'')+(options.critical?' critical65':'');node.textContent=String(text);node.setAttribute('aria-hidden','true');$('#float-layer').append(node);
 const q={node,actor:a,born:clock,slot,numeric,heal,id:++floatNumbers65.serial,duration:numeric?.82:.9};floatNumbers65.active.push(q);floatNumbers65.stats.spawned++;
 while(floatNumbers65.active.length>64){floatNumbers65.active.shift().node.remove();floatNumbers65.stats.released++;}
 updateFloatingNumbers65();return q;
};
function updateFloatingNumbers65(){
 const obstacles=battle?[...document.querySelectorAll('#combo:not(.hidden),#battle-command,#battle-party,.battle-top,.weak-badge65:not([hidden]),#world-enemy-bars27>.foe-bar27')].filter(n=>getComputedStyle(n).visibility!=='hidden'&&getComputedStyle(n).display!=='none').map(n=>n.getBoundingClientRect()):[];
 floatNumbers65.active=floatNumbers65.active.filter(q=>{
  const age=clock-q.born;if(age>q.duration||!q.node.isConnected||!battle){q.node.remove();floatNumbers65.stats.released++;return false;}
  const a=q.actor,point=V3(a.x,a.mesh.position.y+a.size*.85,a.z).project(camera),feet=V3(a.x,a.mesh.position.y,a.z).project(camera),x0=(point.x*.5+.5)*innerWidth,y0=(-point.y*.5+.5)*innerHeight,feetY=(-feet.y*.5+.5)*innerHeight;
  const width=q.node.offsetWidth,height=q.node.offsetHeight,drift=smooth(.32,q.duration,age)*27,baseX=x0+(a.enemy?-1:1)*(Math.abs(feetY-y0)*.32+10)+(q.slot%2?1:-1)*(width*.6+6),baseY=y0-12-Math.floor(q.slot/2)*(height+7)-drift;
  let x=clamp(baseX,width/2+5,innerWidth-width/2-5),y=clamp(baseY,62,innerHeight-height-7);
  const overlap=(x,y,r)=>x+width/2>r.left&&x-width/2<r.right&&y+height>r.top&&y<r.bottom;
  for(const r of obstacles)if(overlap(x,y,r)){const left=r.left-width/2-8,right=r.right+width/2+8,above=r.top-height-8;if(left>width/2&&Math.abs(left-x0)<130)x=left;else if(right<innerWidth-width/2&&Math.abs(right-x0)<130)x=right;else if(above>60&&Math.abs(above-y0)<130)y=above;}
  const pop=age<.1?mix(.85,1.13,smooth(0,.1,age)):mix(1.13,1,smooth(.1,.22,age));q.node.style.left=x+'px';q.node.style.top=y+'px';q.node.style.opacity=String(1-smooth(.48,q.duration,age));q.node.style.transform='translateX(-50%) scale('+pop+')';return true;
 });
}
const numberRenderBefore65=render;
render=function(...args){const r=numberRenderBefore65(...args);updateFloatingNumbers65();return r;};
const itemHealingBefore65=useItem;
useItem=function(key,id,inBattle=false,...args){const before=state.characters[id]?.hp??0,result=itemHealingBefore65(key,id,inBattle,...args),after=state.characters[id]?.hp??0;if(result&&inBattle&&after>before)floatText(actorFor(id),'+'+(after-before),false,true);return result;};
