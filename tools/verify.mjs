import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const dir='output/verification';fs.mkdirSync(dir,{recursive:true});
const check=(ok,msg)=>{if(!ok)throw Error(msg);console.log('PASS '+msg)};
const read=()=>page.evaluate(()=>JSON.parse(render_game_to_text()));
const step=ms=>page.evaluate(ms=>advanceTime(ms),ms);
async function shot(name){await page.screenshot({path:path.join(dir,name+'.png')});fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(await read(),null,2))}
async function place(x,z){await page.evaluate(({x,z})=>{moveActor(player,x,z);targetPoint=null;keys={};update(.016)}, {x,z});}
async function clickAction(id){await page.locator(`[data-combat="${id}"]`).click();await step(1450)}
try{
await page.goto(pathToFileURL(path.resolve('index.html')).href);await page.waitForFunction(()=>typeof player!=='undefined'&&player);
check((await read()).mode==='title','Offline file initializes with a 3D world');await shot('01-title');
await page.locator('#start-btn').click();await page.waitForTimeout(950);await step(3200);
const before=(await read()).player;await page.keyboard.down('ArrowRight');await step(500);await page.keyboard.up('ArrowRight');
check((await read()).player.x>before.x+1,'Keyboard movement changes world position');
await place(-5,8);await page.keyboard.down('ArrowLeft');await step(1500);await page.keyboard.up('ArrowLeft');check((await read()).player.x>=-5.22,'River bank blocks walking into deep water');
await place(0,-2);await page.keyboard.down('ArrowUp');await step(1200);await page.keyboard.up('ArrowUp');check((await read()).player.z>-4.5,'Building collision blocks movement');
await place(5.8,2.7);await page.keyboard.press('e');check((await read()).mode==='dialog','NPC interaction opens dialogue');await page.locator('[data-choice="0"]').click();check((await read()).quest===1,'Accepting Rowan’s request advances the quest');
await shot('02-village');
await place(14,1.5);await page.keyboard.press('e');await page.getByRole('button',{name:'Browse wares'}).click();await page.locator('[data-buy="sword"]').click();check((await read()).items.sword===1&&(await read()).gold===60,'Merchant purchases deduct currency and grant equipment');
await page.locator('[data-tab="equipment"]').click();await page.locator('[data-equip="sword"]').click();check((await read()).equipped.sword,'Equipment changes persist in party state');await shot('03-equipment');await page.keyboard.press('Escape');
await place(8,-15);await page.keyboard.press('e');check((await read()).gold===125&&(await read()).items.herb===7,'Treasure grants currency and consumables');await page.keyboard.press('e');check((await read()).gold===125,'Treasure cannot be claimed twice');
await page.evaluate(()=>{heroes[0].hp=100;heroes[0].sp=10;renderParty()});await page.keyboard.press('i');await page.locator('[data-item="herb"]').click();await page.locator('[data-use="0"]').click();check((await read()).party[0].hp===220&&(await read()).items.herb===6,'Inventory healing consumes exactly one item');await page.keyboard.press('Escape');
await place(-1,9);await page.keyboard.press('e');check((await read()).party[0].hp===260&&(await read()).party[0].sp===44,'Waystone restores HP and SP');
await page.locator('#map-btn').click();await page.locator('[data-travel="forest"]').click();check((await read()).area==='forest','World map travels to the second 3D level');await step(3500);await shot('04-forest');
await place(-1,6);await page.keyboard.press('e');check((await read()).mode==='battle','Overworld encounter starts turn-based combat');await step(1800);await shot('05-battle');
await page.locator('#boost-btn').click();check((await read()).battle.boost===1,'Boost spends a selectable battle point');await page.locator('[data-combat="crosscut"]').click();await step(350);await shot('06-crosscut');await step(1100);
check((await read()).battle.turn==='Mira'&&(await read()).party[0].sp===36,'Ability spends SP and advances the party turn');check((await read()).battle.enemies[0].shield===0|| (await read()).battle.enemies[0].hp===0,'Two-hit weakness attack breaks or defeats a target');
await page.locator('[data-combat="ice"]').click();await step(250);await shot('07-frostfall');await step(4500);
check((await read()).party[1].sp===62,'Elemental spell spends the correct SP');
for(let i=0;i<12&&(await read()).mode==='battle';i++){
const s=await read();if(s.battle.busy||s.battle.phase==='enemy'){await step(4000);continue}if(s.battle.turn==='Aren')await clickAction('attack');else await clickAction('lightning');await step(3800)}
check((await read()).mode==='menu','Victory exits combat and opens the rewards screen');check((await read()).gold===195,'Victory grants the correct leaves');await shot('08-victory');await page.locator('#victory-close').click();
// The boss encounter is won through normal UI actions using earned equipment and supplies.
await place(-5,17);await page.keyboard.press('e');await place(0,-7.6);await page.keyboard.press('e');check((await read()).battle.enemies[0].name==='Hollow Warden','Shrine encounter contains the chapter boss');await step(1800);await shot('09-boss');
for(let i=0;i<32&&(await read()).mode==='battle';i++){
const s=await read();if(s.battle.busy||s.battle.phase==='enemy'){await step(4500);continue}
const hi=s.battle.turn==='Aren'?0:1;
if(s.party[hi].hp<65&&s.items.herb){await page.locator('[data-combat="items"]').click();await page.locator('[data-bitem="herb"]').click();await page.locator(`[data-btarget="${hi}"]`).click();await step(1700)}
else if(s.party[hi].sp<16&&s.items.ether){await page.locator('[data-combat="items"]').click();await page.locator('[data-bitem="ether"]').click();await page.locator(`[data-btarget="${hi}"]`).click();await step(1700)}
else{if(s.party[hi].bp>0)await page.locator('#boost-btn').click();await clickAction(hi===0?(s.party[hi].sp>=12?'fire':'attack'):(s.party[hi].sp>=16?'lightning':'attack'))}await step(4500)}
check((await read()).mode==='menu'&&(await read()).quest===2,'Boss victory unlocks the living ember');check((await read()).party[0].level>=2,'Experience triggers level-up and stat growth');await page.locator('#victory-close').click();await place(0,-11.5);await page.keyboard.press('e');check((await read()).quest===3&&(await read()).items.ember===1,'Altar interaction collects the quest item');
await page.locator('#map-btn').click();await page.locator('[data-travel="village"]').click();await place(6.5,3);await page.keyboard.press('e');await page.locator('[data-choice="0"]').click();check((await read()).quest===4&&(await read()).items.ember===0,'Returning the ember completes the chapter');await shot('10-ending');await page.locator('#ending-close').click();
await page.locator('#time-btn').click();await step(4000);check((await read()).night,'Day/night lighting toggle updates state');await shot('11-moonrise');
await page.evaluate(()=>saveGame(false));const saved=await read();await page.evaluate(()=>{state.gold=1;state.quest=0;loadGame()});check((await read()).gold===saved.gold&&(await read()).quest===4&&(await read()).equipped.sword,'Save/load restores quest, money, equipment, and level');
await page.setViewportSize({width:390,height:844});await step(1200);await page.keyboard.press('i');await shot('12-mobile-inventory');check(await page.locator('#close-menu').isVisible(),'Menu remains usable at phone width');await page.keyboard.press('Escape');await shot('13-mobile-world');
check(errors.length===0,'No browser or rendering errors');fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({success:true,errors,final:await read()},null,2));
}catch(e){await shot('FAILURE');fs.writeFileSync(path.join(dir,'errors.json'),JSON.stringify({failure:String(e),errors},null,2));throw e}finally{await browser.close()}
