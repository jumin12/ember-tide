from pathlib import Path
import re,json,hashlib
root=Path(__file__).resolve().parents[2]
p=root/'index.html';s=p.read_text(encoding='utf-8')
a=json.loads((root/'elyndor/assets/packed/audit.json').read_text())
assets=json.loads((root/'elyndor/assets/packed/assets.cache.json').read_text())
read=lambda name:(root/name).read_text(encoding='utf-8')
compiled=read('elyndor/index.source.html')
parts={'STYLE':'\n'.join(read('elyndor/'+n) for n in ['style.css','visual-v7.css','town-v8.css']),'THREE':read('three.vendor.js'),'ASSETS':json.dumps(assets,separators=(',',':')),'DATA':read('elyndor/data.js'),'WORLD':'\n'.join(read('elyndor/'+n) for n in ['world.js','detail.js','scene-polish.js','water.js']),'GAME':'\n'.join(read('elyndor/'+n) for n in ['game.js','movement.js','combat.js']),'UI':read('elyndor/ui.js'),'OPEN_WORLD':read('elyndor/open-world.js'),'POLISH':'\n'.join(read('elyndor/'+n) for n in ['polish.js','scenery.js','render-v4.js','review-v5.js','visual-v7.js','town-v8.js'])}
for key,value in parts.items():compiled=compiled.replace('/*__'+key+'__*/',value)
report={'file':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
 'unresolvedMarkers':bool(re.search(r'/\*__[A-Z_]+__\*/',s)),
 'externalHtmlAssets':re.findall(r'''(?:src|href)=["'](?:https?:|//)[^"']+''',s),
 'families':a['spriteCount'],'packedPoses':len(a['poses']),'cropWarnings':a['sourceBoundaryWarnings'],
 'continuousWorld':'Continuous Elyndor:' in s,'version4Saves':'elyndor-save-v4-' in s,'sourceMatchesArtifact':compiled==s}
(root/'output/elyndor/continuous-standalone-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
assert not report['unresolvedMarkers'] and not report['externalHtmlAssets'] and not report['cropWarnings'] and report['sourceMatchesArtifact']
