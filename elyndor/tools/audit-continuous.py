from pathlib import Path
import re,json,hashlib,base64
root=Path(__file__).resolve().parents[2]
p=root/'index.html';s=p.read_text(encoding='utf-8')
a=json.loads((root/'elyndor/assets/packed/audit.json').read_text())
assets=json.loads((root/'elyndor/assets/packed/assets.cache.json').read_text())
read=lambda name:(root/name).read_text(encoding='utf-8')
compiled=read('elyndor/index.source.html')
parts={'STYLE':'\n'.join(read('elyndor/'+n) for n in ['style.css','visual-v7.css','town-v8.css','loading-v11.css','journey-v12.css','experience-v13.css','presentation-v14.css','loading-v14.css']),'THREE':read('three.vendor.js'),'ASSETS':json.dumps(assets,separators=(',',':')),'DATA':read('elyndor/data.js'),'WORLD':'\n'.join(read('elyndor/'+n) for n in ['world.js','detail.js','scene-polish.js','water.js']),'GAME':'\n'.join(read('elyndor/'+n) for n in ['game.js','movement.js','combat.js']),'UI':read('elyndor/ui.js'),'OPEN_WORLD':read('elyndor/open-world.js'),'POLISH':'\n'.join(read('elyndor/'+n) for n in ['polish.js','scenery.js','render-v4.js','review-v5.js','visual-v7.js','town-v8.js','town-events.js','world-design.js','party-v11.js','effects-v11.js','combat-v11.js','placement-v11.js','visibility-v11.js','hydraulics-v11.js','loading-v11.js','journey-v12.js','interiors-v12.js','battle-v12.js','weather-v12.js','voices-v12.js','level-layout-v13.js','experience-v13.js','audio-v13.js','environment-v13.js','battle-v13.js','performance-v13.js','overworld-v13.js','materials-v14.js','presentation-v14.js','atlas-v14.js','loading-v14.js','arena-v14.js'])}
parts['POLISH']+='\n'+'\n'.join(read('elyndor/'+n)for n in ['relief-data-v15.js','geography-v15.js','settlements-v15.js','travel-v15.js','combat-input-v15.js','weather-v15.js','clearance-v15.js','audio-v15.js','casting-v15.js'])
parts['STYLE']+='\n'+read('elyndor/experience-v15.css')
manifest=json.loads(read('elyndor/assets/source/pixellab-v7/manifest.json'))
parts['LOADING_SCENES']=''.join('<figure class="'+('lore-active' if i==0 else '')+'" data-lore="'+key+'" style="--scene:'+str(i)+'"><img src="data:image/webp;base64,'+base64.b64encode((root/q['file']).read_bytes()).decode()+'" alt="'+q['name']+'"><figcaption>'+q['name']+'</figcaption></figure>' for i,(key,q) in enumerate(manifest['loadingScreens'].items()))
for key,value in parts.items():compiled=compiled.replace('/*__'+key+'__*/',value)
report={'file':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
 'unresolvedMarkers':bool(re.search(r'/\*__[A-Z_]+__\*/',s)),
 'externalHtmlAssets':re.findall(r'''(?:src|href)=["'](?:https?:|//)[^"']+''',s),
 'families':a['spriteCount'],'packedPoses':len(a['poses']),'cropWarnings':a['sourceBoundaryWarnings'],
 'continuousWorld':'Continuous Elyndor:' in s,'version4Saves':'elyndor-save-v4-' in s,'sourceMatchesArtifact':compiled==s}
(root/'output/elyndor/continuous-standalone-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
assert not report['unresolvedMarkers'] and not report['externalHtmlAssets'] and not report['cropWarnings'] and report['sourceMatchesArtifact']
