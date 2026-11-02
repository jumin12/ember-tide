"""Offline invariants for the actual embedded geography and joined water mesh."""
from pathlib import Path
import json, base64, numpy as np
from scipy.ndimage import label, distance_transform_edt

root=Path(__file__).resolve().parents[2]
def data(name):return json.loads((root/'elyndor'/name).read_text(encoding='utf-8').split('=',1)[1].rstrip(';\n'))
r=data('relief-data-v18.js');d=data('hydrology-v38.js')
h=np.frombuffer(base64.b64decode(r['bytes']),dtype=np.uint8).reshape(r['h'],r['w'],2)[:,:,0]*r['scale']+r['offset']
labels,n=label(h>0);vol=labels[int(.83*r['h']),int(.55*r['w'])];west=labels[int(.46*r['h']),int(.27*r['w'])]
p=np.frombuffer(base64.b64decode(d['surface']['positions']),dtype='float32').reshape(-1,3);i=np.frombuffer(base64.b64decode(d['surface']['indices']),dtype='uint32').reshape(-1,3)
normal=np.cross(p[i[:,1]]-p[i[:,0]],p[i[:,2]]-p[i[:,0]])[:,1]
routes=[]
for route,points in zip(d['desertDrainage']['routes']+d['lushDrainage']['routes'],d['paths'][:5]):
 a=np.array(points);rise=np.diff(a[:,2]);routes.append({'name':route['name'],'samples':len(a),'uphillSegments':int((rise>.001).sum()),'maximumStep':float(np.max(np.abs(rise))),'length':float(np.linalg.norm(np.diff(a[:,:2],axis=0),axis=1).sum())})
report={'islandSeparate':bool(vol!=west),'oceanGapMetres':float(distance_transform_edt(labels!=west)[labels==vol].min()*2048/r['w']),'reliefRange':[float(h.min()),float(h.max())],'clippedSummits':int((h>=r['scale']*255+r['offset']).sum()),'surface':{k:d['surface'][k] for k in ['vertices','triangles']},'downwardTriangles':int((normal<0).sum()),'degenerateTriangles':int((normal==0).sum()),'routes':routes}
sea,_=label(h<-1.4);outlets=[]
for route in d['desertDrainage']['routes']+d['lushDrainage']['routes']:
 if 'tributary' in route['name'].lower():continue
 x,z=route['points'][-1];x=round(x/100*r['w']);z=round(z/100*r['h']);outlets.append({'name':route['name'],'oceanConnected':bool(sea[z,x]==sea[0,0])})
report['outlets']=outlets
report['pass']=report['islandSeparate'] and report['oceanGapMetres']>80 and not report['clippedSummits'] and not report['downwardTriangles'] and not report['degenerateTriangles'] and all(q['uphillSegments']==0 and q['maximumStep']<.1 for q in routes) and all(q['oceanConnected'] for q in outlets)
out=root/'output/elyndor/world-v38/hydrology-proof.json';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps(report));raise SystemExit(0 if report['pass'] else 1)
