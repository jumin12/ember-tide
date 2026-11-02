import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const context=vm.createContext({console,THREE:{Vector3:class{},Vector2:class{},Raycaster:class{}}});
vm.runInContext(fs.readFileSync('elyndor/data.js','utf8'),context);vm.runInContext("let activeScene={key:'fern'};function renderBattle(){}function toast(){}",context);
vm.runInContext(fs.readFileSync('elyndor/menus-v27.js','utf8').split('const equipBefore27=')[0],context);vm.runInContext(fs.readFileSync('elyndor/systems/combat.js','utf8'),context);
const run=s=>vm.runInContext(s,context);
run("function currentFighter(){return 'bren'}function combatFlinch(){}function floatText(){}function sfx(){}post={material:{uniforms:{flash:{value:0}}}};clock=10;");
run("state.characters.bren.gear.accessory='charm';");assert.equal(run("stats('bren').mp"),52);
run("globalThis.preview=growthFor('bren',500);applyBattleGrowth('bren',500);");assert.equal(run('state.characters.bren.level'),4);assert.equal(run('state.characters.bren.xp'),20);assert.equal(run("stats('bren').hp"),run('preview.hp'));
run("assets.sprites={};state.members=['bren','tavin'];battle={kind:'random',round:1,enemies:encounterRoster('random').map(([id,name,hp,atk,def,behavior,weakness,speed])=>({id,name,hp,atk,def,behavior,weakness,speed}))};");
assert.ok(run("encounterRewards('commander3').xp>encounterRewards('wildlife').xp"));
run("makeQueue();");assert.equal(run('battle.queue[0]'),'tavin');
run("state.members=['bren','soren'];battle.kind='wildlife';makeQueue();");assert.equal(run('battle.queue[0]'),'bren','The first tutorial must preserve its guided order');
run("globalThis.variants=new Set();assets.sprites={};for(let i=0;i<8;i++)variants.add(encounterRoster('random').map(q=>q[0]).join(','));");assert.ok(run('variants.size')>=3);
run("battle.round=2;battle.enemies[0].behavior='windup';planEnemyIntentions();");assert.equal(run('battle.enemies[0].intent.type'),'charge');
run("battle.round=3;battle.enemies[0].charged=true;planEnemyIntentions();");assert.equal(run('battle.enemies[0].intent.type'),'heavy');
const summary={pass:true,cases:['equipment affects full stats','multi-level growth matches preview','encounter-specific rewards','initiative','protected tutorial order','varied encounters','readable charge and heavy intentions','practice damage remains nonlethal']};

run("battle={damageKind:'arrow',lesson18:{active:true}};globalThis.practice={hp:3,def:0,weakness:'arrow',actor:{}};damageEnemy(practice,20);");assert.equal(run('practice.hp'),1,'Weakness bonuses must not defeat a practice enemy');run('damageEnemy(practice,0);');assert.equal(run('practice.hp'),1);

console.log(JSON.stringify(summary));
