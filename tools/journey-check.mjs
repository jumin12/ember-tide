import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>{errors.push(String(e));console.log('ERROR',String(e))});page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.log('CONSOLE',m.text().slice(0,1500))}});
fs.mkdirSync('output/journey',{recursive:true});
await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>!document.querySelector('#start-btn').disabled,{timeout:120000});
await page.evaluate(()=>{window.qaPause=true;});
await page.screenshot({path:'output/journey/title.png'});
await page.evaluate(()=>{window.__qaManualFrames=true;});await page.click('#start-btn');await page.waitForTimeout(1000);
const audits=await page.evaluate(()=>sceneOrder.map(id=>{buildWorld(id);return auditWorld()}));console.log(JSON.stringify(audits,null,2));
for(const id of ['village','riverwalk','highroad','forest','shrine']){await page.evaluate(id=>{buildWorld(id);if(id==='highroad')moveActor(player,5,-3);if(id==='riverwalk')moveActor(player,2,3);if(id==='forest')moveActor(player,0,1);if(id==='shrine')moveActor(player,0,-4);for(let i=0;i<100;i++)update(1/60);render()},id);await page.screenshot({path:`output/journey/${id}.png`});}
await page.evaluate(()=>{buildWorld('highroad');state.mode='explore';startBattle(objects.find(o=>o.type==='enemy'));for(let i=0;i<120;i++)update(1/60);render()});await page.screenshot({path:'output/journey/battle.png'});
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{resize();for(let i=0;i<120;i++)update(1/60);render()});await page.screenshot({path:'output/journey/mobile-battle.png'});
const formation=await page.evaluate(()=>[...heroMeshes,...enemyMeshes].map(a=>{const p=screenPos(a.mesh.position);return {index:a.index,x:p.x,y:p.y}}));if(formation.some(p=>p.x<25||p.x>365||p.y<160||p.y>550))throw Error('Portrait formation outside the clear play area: '+JSON.stringify(formation));console.log('PASS Portrait combat keeps both travelers and monsters in view',formation);
fs.writeFileSync('output/journey/first-pass.json',JSON.stringify({audits,errors},null,2));console.log('Errors',errors);await browser.close();
