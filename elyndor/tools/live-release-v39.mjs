import {chromium} from 'playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';

const release=JSON.parse(fs.readFileSync('release.json','utf8'));
const out='output/elyndor/world-v38/live';fs.mkdirSync(out,{recursive:true});
const report={url:'https://jumin12.github.io/ember-tide/',errors:[]};
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11']});
try{
 const p=await browser.newPage({viewport:{width:1440,height:900}});p.setDefaultTimeout(240000);
 p.on('pageerror',e=>report.errors.push(e.stack));
 p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,1500));});
 await p.addInitScript(()=>localStorage.setItem('elyndor-settings-v3',JSON.stringify({voices:false,volume:0})));
 const url=report.url+'?release='+release.artifact.sha256.slice(0,16);
 const response=await p.request.get(url,{timeout:240000});const body=await response.body();
 report.httpStatus=response.status();report.bytes=body.length;
 report.sha256=crypto.createHash('sha256').update(body).digest('hex');
 report.matchesTestedArtifact=report.sha256===release.artifact.sha256&&report.bytes===release.artifact.bytes;
 if(response.status()!==200||!report.matchesTestedArtifact)throw Error('The live artifact does not match the tested release');
 const navigation=await p.goto(url);report.browserHttpStatus=navigation.status();
 await p.waitForFunction(()=>window.__ely&&title19.ready&&!title19.busy);
 report.title=await p.locator('#title-right19 h2').textContent();
 await p.screenshot({path:out+'/live-title.png'});
 await p.click('#title-load19');report.saveSlots=await p.locator('#title-right19 .journey-slot19').count();
 await p.keyboard.press('Escape');await p.click('#start-btn');await p.waitForFunction(()=>!gameLoading);
 await p.evaluate(()=>{while(dialogue)nextDialogue();state.encounterDistance=-1e6;state.settings.voices=false;state.settings.volume=0;stopRecordedVoice(true);});
 const before=await p.evaluate(()=>[player.x,player.z]);
 await p.keyboard.down('d');await p.evaluate(()=>advanceTime(350,false));await p.keyboard.up('d');
 report.play=await p.evaluate(()=>({mode:state.mode,position:[player.x,player.z],playerVisible:player.mesh.visible,followersVisible:followers.every(a=>a.mesh.visible),followers:followers.length,loading:gameLoading}));
 report.moved=Math.hypot(report.play.position[0]-before[0],report.play.position[1]-before[1])>.5;
 await p.screenshot({path:out+'/live-game.png'});
 await p.evaluate(()=>changeJourneyScene('overworld'));await p.waitForFunction(()=>!gameLoading);
 report.world=await p.evaluate(()=>({entries:world.userData.thresholds39.map(o=>{const d=o.autoDir39,start={x:o.x-d[0]*5,z:o.z-d[1]*5};return{poi:o.poi,free:staticFree(o.x,o.z,.6),approachFree:edgeFree(start,o,.5)};}),miniatures:world.userData.miniatures,bakedTrees:BAKED_WORLD36.trees.count}));
 // Reveal exploration only in this inspection fixture to document the deployed map.
 await p.evaluate(()=>{while(dialogue)nextDialogue();state.worldMinutes=600;state.settings.weather='clear';manualUntil=performance.now()+1e6;atlas3d.mask.fill(255);macroMap17.field.value.needsUpdate=true;openMenu('map');atlas3d.target.set(0,5,0);atlas3d.distance=2050;atlas3d.pitch=1.05;atlas3d.yaw=0;drawAtlas3d();});
 await p.screenshot({path:out+'/live-world.png'});
 report.pass=report.matchesTestedArtifact&&report.browserHttpStatus===200&&report.title===release.version&&report.saveSlots===3&&report.play.mode==='explore'&&report.play.playerVisible&&report.play.followersVisible&&report.play.followers>0&&report.moved&&report.world.entries.length===15&&report.world.entries.every(o=>o.free&&o.approachFree)&&report.world.miniatures.every(o=>o.buildings>0)&&report.world.bakedTrees===release.graphics.bakedTreeCount&&!report.errors.length;
 if(!report.pass)process.exitCode=1;
}catch(e){report.failure=e.stack;report.pass=false;process.exitCode=1;}
finally{fs.writeFileSync(out+'/verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();}
