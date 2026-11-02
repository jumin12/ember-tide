from asset_bundle_v36 import package_assets36
from pathlib import Path
import re,json,hashlib,base64
root=Path(__file__).resolve().parents[2]
p=root/'index.html';s=p.read_text(encoding='utf-8')
a=json.loads((root/'elyndor/assets/packed/audit.json').read_text())
assets=json.loads((root/'elyndor/assets/packed/assets.cache.json').read_text())
read=lambda name:(root/name).read_text(encoding='utf-8')
compiled=read('elyndor/index.source.html')
graph=json.loads(read('elyndor/build-manifest.json'))
parts={key:'\n'.join(read('elyndor/'+n) for n in names) for key,names in graph['sections'].items()}
parts.update({'STYLE':'\n'.join(read('elyndor/'+n) for n in graph['styles']),'THREE':read('three.vendor.js'),'ASSETS':'window.__assetBundle36','BOOT_ASSETS':package_assets36(assets)})
manifest=json.loads(read('elyndor/assets/source/pixellab-v7/manifest.json'))
parts['LOADING_SCENES']=''.join('<figure class="'+('lore-active' if i==0 else '')+'" data-lore="'+key+'" style="--scene:'+str(i)+'"><img src="data:image/webp;base64,'+base64.b64encode((root/q['file']).read_bytes()).decode()+'" alt="'+q['name']+'"><figcaption>'+q['name']+'</figcaption></figure>' for i,(key,q) in enumerate(manifest['loadingScreens'].items()))
parts['BRAND_CRYSTAL']=json.loads(read('elyndor/assets/packed/assets.cache.json'))['images']['ui26_logo']
for key,value in parts.items():compiled=compiled.replace('/*__'+key+'__*/',value)
report={'file':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
 'unresolvedMarkers':bool(re.search(r'/\*__[A-Z_]+__\*/',s)),
 'externalHtmlAssets':re.findall(r'''(?:src|href)=["'](?:https?:|//)[^"']+''',s),
 'families':a['spriteCount'],'packedPoses':len(a['poses']),'cropWarnings':a['sourceBoundaryWarnings'],
 'continuousWorld':'Continuous Elyndor:' in s,'version4Saves':'elyndor-save-v4-' in s,'sourceMatchesArtifact':compiled==s}
(root/'output/elyndor/continuous-standalone-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
assert not report['unresolvedMarkers'] and not report['externalHtmlAssets'] and not report['cropWarnings'] and report['sourceMatchesArtifact']
