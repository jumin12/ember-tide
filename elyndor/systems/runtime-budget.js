// Compile the destination under its covered handoff, rather than constructing
// five unused towns/continents and rebuilding the starting village at boot.
warmDestinationPrograms64=async function(){destinationWarm64.ready=true;destinationWarm64.scenes=['compiled on destination entry'];destinationWarm64.programs=sceneProgramKeepers.size;};
const fastGraphicsBefore67=prepareGameplayGraphics;
prepareGameplayGraphics=async function(...args){const start=performance.now(),r=await fastGraphicsBefore67(...args);if(transitionGraphics64.runs&&renderer.compileAsync)await renderer.compileAsync(scene,camera);world.userData.prepare67={milliseconds:performance.now()-start,programs:renderer.info.programs.length};return r;};
