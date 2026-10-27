"""Compare every embedded pose with its preserved QA atlas at native resolution."""
from pathlib import Path
from PIL import Image
import io,base64,json,numpy as np
root=Path(__file__).resolve().parents[2]
assets=json.loads((root/'elyndor/assets/packed/assets.cache.json').read_text())
audit=json.loads((root/'elyndor/assets/packed/audit.json').read_text())
report={'families':[],'errors':[],'poses':0}
for name,m in assets['sprites'].items():
 runtime=Image.open(io.BytesIO(base64.b64decode(m['url'].split(',')[1]))).convert('RGBA')
 source=Image.open(root/f'elyndor/assets/packed/{name}.png').convert('RGBA')
 expected=source.resize(runtime.size,Image.Resampling.NEAREST)
 a,b=np.array(runtime),np.array(expected)
 opaque=(a[:,:,3]>0)|(b[:,:,3]>0)
 same_alpha=np.array_equal(a[:,:,3],b[:,:,3])
 same_color=bool(np.array_equal(a[:,:,:3][opaque],b[:,:,:3][opaque]))
 cells=sorted({p['pose'] for p in audit['poses'] if p['id']==name})
 issues=[];margin=999
 for n in cells:
  cell=runtime.crop((n%m['cols']*m['w'],n//m['cols']*m['h'],(n%m['cols']+1)*m['w'],(n//m['cols']+1)*m['h']))
  bb=cell.getbbox()
  if not bb:issues.append({'cell':n,'problem':'empty'});continue
  mm=min(bb[0],bb[1],m['w']-bb[2],m['h']-bb[3]);margin=min(margin,mm)
  if mm<2:issues.append({'cell':n,'problem':'touches frame edge','bounds':bb})
 row={'id':name,'cells':len(cells),'size':[m['w'],m['h']],'bodyUnit':m['unit'],'gutter':m['gutter'],'alphaIdentical':same_alpha,'visiblePixelsIdentical':same_color,'minimumMargin':margin,'issues':issues}
 report['families'].append(row);report['poses']+=len(cells)
 if issues or not same_alpha or not same_color:report['errors'].append(name)
out=root/'output/elyndor/performance/runtime-sprite-audit.json';out.write_text(json.dumps(report,indent=2))
print(json.dumps({'families':len(report['families']),'poses':report['poses'],'errors':report['errors']}))
assert not report['errors']
