import {chromium}from'playwright';import fs from'node:fs';import path from'node:path';import{pathToFileURL}from'node:url';
const out='output/elyndor/stabilization/tutorial-journey';fs.mkdirSync(out,{recursive:true});const report={steps:[],lessons:[],errors:[]};
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']}),page=await browser.newPage({viewport:{width:1440,height:900}});page.setDefaultTimeout(180000);page.on('pageerror',e=>report.errors.push(e.message));
async function drain(){for(let i=0;i<30&&await page.evaluate(()=>!!dialogue);i++){await page.keyboard.press('Enter');await page.waitForTimeout(120);}}
async function approach(type){
 const started=Date.now();let stuck=0,last=null;
 while(Date.now()-started<120000){
  const q=await page.evaluate(type=>{
   const o=interactables.find(o=>o.type===type&&interactionAvailable(o));if(!o)return{missing:type,beat:currentBeat()[0]};
   if(dist(player,o)<(o.radius??2.5)-.1)return{arrived:true,x:player.x,z:player.z,beat:currentBeat()[0]};
   const goals=[];for(let i=0;i<16;i++){const a=i*TAU/16,p={x:o.x+Math.cos(a)*1.4,z:o.z+Math.sin(a)*1.4};if(staticFree(p.x,p.z,.48))goals.push(p);}goals.sort((a,b)=>dist(player,a)-dist(player,b));
   let path=null;for(const p of goals){path=findRoute(player,p,[]);if(path?.length)break;}if(!path?.length)return{blocked:type,x:player.x,z:player.z};
   const candidates=[];let previous={x:player.x,z:player.z},budget=12;for(const node of path){const d=dist(previous,node);for(let step=2;step<=Math.min(d,budget);step+=2)candidates.push({x:mix(previous.x,node.x,step/d),z:mix(previous.z,node.z,step/d)});if(d>budget)break;if(d>.15)candidates.push(node);budget-=d;previous=node;if(budget<=0)break;}candidates.reverse();
   for(const p of candidates){const screen=V3(p.x,heightAt(p.x,p.z)+.02,p.z).project(camera),x=(screen.x*.5+.5)*innerWidth,y=(-screen.y*.5+.5)*innerHeight,n=document.elementFromPoint(x,y);if(x>30&&x<innerWidth-30&&y>125&&y<innerHeight-25&&(n===renderer.domElement||n?.id==='world-canvas'))return{x,y,px:player.x,pz:player.z};}
   return{noVisiblePoint:true,x:player.x,z:player.z,path:path.slice(0,5),candidates:candidates.slice(0,4).map(p=>{const q=V3(p.x,heightAt(p.x,p.z),p.z).project(camera),x=(q.x*.5+.5)*innerWidth,y=(-q.y*.5+.5)*innerHeight,n=document.elementFromPoint(x,y);return{x,y,tag:n?.tagName,id:n?.id,cls:n?.className};})};
  },type);
  if(q.arrived){report.steps.push({type,elapsed:Date.now()-started,...q});return;}
  if(q.missing&&type==='aftermath'&&q.beat==='travelFern'){report.steps.push({type,automatic:true,beat:q.beat});return;}if(q.missing||q.blocked)throw Error(JSON.stringify(q));
  if(q.noVisiblePoint)throw Error('No unobstructed input point: '+JSON.stringify(q));
  const pos=[q.px,q.pz];stuck=last&&Math.hypot(pos[0]-last[0],pos[1]-last[1])<.03?stuck+1:0;last=pos;if(stuck>18)throw Error('Mouse traversal stalled approaching '+type);
  await page.mouse.click(q.x,q.y);await page.waitForTimeout(260);
  if(await page.evaluate(()=>!!dialogue||!!eventAction||!!battle)){await drain();if(await page.evaluate(()=>!!eventAction||!!battle))return;}
 }
 throw Error('Approach timeout: '+type);
}
async function clickVisible(selector){const n=page.locator(selector).filter({visible:true}).first();if(await n.count()&&await n.isEnabled()){await n.click();return true;}return false;}
try{
 await page.addInitScript(()=>localStorage.setItem('elyndor-settings-v3',JSON.stringify({voices:false,volume:0})));await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>window.__ely&&title19.ready&&!title19.busy);await page.click('#start-btn');await page.waitForFunction(()=>!gameLoading);await drain();
 for(const type of ['representative','gate','pump']){await approach(type);if(!await page.evaluate(()=>!!eventAction))await page.keyboard.press('e');await page.waitForFunction(()=>!eventAction);await drain();console.log(type+' → '+await page.evaluate(()=>currentBeat()[0]));}
 await approach('wildlife');if(!await page.evaluate(()=>!!battle))await page.keyboard.press('e');await drain();await page.waitForFunction(()=>!!battle);
 const combatStart=Date.now();let lastLesson='',lastAction=0;
 while(Date.now()-combatStart<180000){
  const q=await page.evaluate(()=>({battle:!!battle,status:battle?.status,lesson:combatLesson18()?.step,hold:combatLesson18()?.hold,pending:battle?.pending,combo:battle?.combo?{t:battle.combo.t,duration:battle.combo.duration,input:battle.combo.input}:null,dialogue:!!dialogue,results:!!resultsPage,complete:!!state.flags.combat_tutorial_complete}));
  if(q.dialogue){await drain();continue;}
  if(q.lesson&&q.lesson!==lastLesson){report.lessons.push(q.lesson);lastLesson=q.lesson;console.log('Lesson: '+q.lesson);}
  if(q.results){await clickVisible('#results-next');await page.waitForTimeout(150);continue;}
  if(!q.battle)break;
  if(q.status==='victory'){await clickVisible('#victory-continue');await page.waitForTimeout(150);continue;}
  if(q.combo){if(q.hold)await clickVisible('[data-lesson18="continue"]');else if(!q.combo.input&&q.combo.t/q.combo.duration>=.69)await page.keyboard.press('Space');await page.waitForTimeout(25);continue;}
  if(['welcome','incoming','free'].includes(q.lesson)&&q.hold){await clickVisible('[data-lesson18="continue"]');}
  else if(q.lesson==='target')await clickVisible('[data-enemy="0"]');
  else if(q.lesson==='attack')await clickVisible('[data-action="attack"]');
  else if(q.lesson==='skill'){if(!await clickVisible('[data-skill="0"]'))await clickVisible('[data-battle-sub="skills"]');}
  else if(q.lesson==='item'){if(!await clickVisible('[data-ally="0"]')&&!await clickVisible('[data-battle-item="herb"]'))await clickVisible('[data-battle-sub="items"]');}
  else if(q.lesson==='defend')await clickVisible('[data-action="defend"]');
  else if(q.complete&&q.status==='choose'&&Date.now()-lastAction>300){await clickVisible('[data-action="attack"]');lastAction=Date.now();}
  await page.waitForTimeout(75);
 }
 if(await page.evaluate(()=>!!battle))throw Error('The untouched combat tutorial did not finish');
 await drain();if(await page.evaluate(()=>currentBeat()[0]==='aftermath')){await approach('aftermath');if(await page.evaluate(()=>currentBeat()[0]==='aftermath'))await page.keyboard.press('e');await drain();}await page.waitForTimeout(1200);
 report.final=await page.evaluate(()=>({beat:currentBeat()[0],flags:state.flags,members:state.members,lessonSteps:lesson18.steps,checkpoint:readSave('auto')?.questId,engine:Engine.diagnostics()}));
 const required=['welcome','target','attack','timing','skill','incoming','item','defend','free'];report.pass=!report.errors.length&&required.every(k=>report.lessons.includes(k))&&report.final.flags.prologue_complete&&report.final.flags.combat_tutorial_complete&&report.final.members.join(',')==='bren,soren';await page.screenshot({path:out+'/complete.png'});if(!report.pass)throw Error('The complete tutorial acceptance gate failed');
}catch(e){report.failure=e.stack;report.pass=false;await page.screenshot({path:out+'/failure.png'}).catch(()=>{});console.error(e.message);process.exitCode=1;}
finally{fs.writeFileSync(out+'/report.json',JSON.stringify(report,null,2));console.log(JSON.stringify({pass:report.pass,steps:report.steps,lessons:report.lessons,failure:report.failure,errors:report.errors}));await browser.close();}
