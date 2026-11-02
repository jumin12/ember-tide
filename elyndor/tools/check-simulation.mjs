import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('elyndor/systems/runtime.js','utf8').split('const simulationClock=')[0];
const context=vm.createContext({});vm.runInContext(source+'\nglobalThis.Clock=SimulationClock;',context);
const report=[];
for(const fps of [10,15,20,30,60,72,120,144]){
  const clock=new context.Clock();let distance=0;
  for(let i=0;i<fps*10;i++)clock.advance(1/fps,dt=>distance+=6*dt);
  assert.ok(Math.abs(distance-60)<1e-7,`${fps} FPS changed movement distance`);
  assert.ok(clock.dropped<1e-7);report.push({fps,distance,total:clock.total});
}
const clock=new context.Clock();let steps=0;clock.advance(5,()=>steps++);assert.equal(steps,12);clock.reset();assert.equal(clock.accumulator,0);
const recovery=new context.Clock();let recoverySteps=0;recovery.advance(.2,()=>recoverySteps++,4);assert.equal(recoverySteps,4);assert.ok(recovery.dropped>.12);assert.ok(recovery.accumulator<recovery.step);recoverySteps=0;for(let i=0;i<60;i++)recovery.advance(1/60,()=>recoverySteps++,4);assert.equal(recoverySteps,60,'Long-stall recovery must return to full simulation speed');
assert.equal(context.presentationDue(120,100,1000/72),true,'A missed refresh must present immediately');
assert.equal(context.presentationDue(107,100,1000/72),false,'Fast refreshes must respect the presentation budget');
for(const hz of [60,120,144]){let last=0,frames=0;const period=1000/hz*Math.max(1,Math.floor(hz/59));for(let i=1;i<=hz*10;i++){const now=100+i*1000/hz;if(context.presentationDue(now,last,period)){last=now;frames++;}}assert.equal(frames,hz/Math.max(1,Math.floor(hz/59))*10);}
console.log(JSON.stringify({pass:true,cases:report,pauseCatchupSteps:steps,presentation:'60/120/144 Hz and missed-refresh recovery'},null,2));
