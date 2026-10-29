"""Trace the current user-linked atlas's geography and published place data.
Concept pixels are used for geography analysis, never pasted over gameplay.
"""
from pathlib import Path
from PIL import Image
import numpy as np,json,base64
from scipy.ndimage import binary_closing,binary_opening,binary_fill_holes,label,distance_transform_edt,gaussian_filter
root=Path(__file__).resolve().parents[2];folder=root/'design/pixellab-v18/atlas';w,h=512,288
im=Image.open(folder/'world.webp').convert('RGB');patch=Image.open(folder/'volcanic-rework.webp').convert('RGB');box=(round(im.width*.4),round(im.height*2/3),round(im.width*.75),im.height);im.paste(patch.resize((box[2]-box[0],box[3]-box[1]),Image.Resampling.LANCZOS),box[:2]);im.save(folder/'geography-reference.webp',lossless=True)
a=np.asarray(im.resize((w,h),Image.Resampling.BOX)).astype(float)/255;yy,xx=np.mgrid[:h,:w];r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
wet=(b>r*1.13)&(b>g*.94)&(b-r>.055);mask=~wet;mask&=~(((xx<55)&((yy<45)|(yy>182)))|((xx>485)&((yy<20)|(yy>258))))
mask=binary_closing(mask,iterations=2);mask=binary_opening(mask,iterations=1);labels,n=label(mask);sizes=np.bincount(labels.ravel());mask=np.isin(labels,np.argsort(sizes[1:])[-24:]+1);mask=binary_fill_holes(mask)
# The current volcanic patch explicitly connects both vents with walkable land.
volcanic=(xx>211)&(xx<346)&(yy>218)&(yy<273);connected=binary_closing(mask&volcanic,iterations=4);mask|=connected
shore=distance_transform_edt(mask)*2;lum=.2126*r+.7152*g+.0722*b;grey=np.clip(1-np.abs(g-r)*10,0,1)*np.clip(1-np.abs(g-b)*8,0,1);stone=gaussian_filter(grey*np.clip((lum-.26)*2.8,0,1),.75)
snow=np.exp(-((xx-146)/65)**2-((yy-48)/35)**2);west=np.exp(-((xx-160)/112)**2-((yy-117)/77)**2)
height=4+2.5*np.sin(xx*.047+np.sin(yy*.055))*np.cos(yy*.051)+stone*17+west*(4+13*stone)+snow*(19+29*stone)
east=np.clip((xx-320)/35,0,1);height+=east*(6+12*stone);volcano=np.exp(-((xx-276)/17)**2-((yy-237)/17)**2)*52+np.exp(-((xx-314)/13)**2-((yy-252)/13)**2)*29;height+=volcano
height=np.where(mask,np.minimum(height,2+shore*.95),-5-np.minimum(distance_transform_edt(~mask),18)*.35);height=gaussian_filter(height,.58)
biome=np.zeros((h,w),dtype='uint8');biome[(xx>318)&(yy<125)]=2;biome[(xx>318)&(yy>=125)]=3;biome[(xx>204)&(xx<362)&(yy>216)]=4;biome[(snow>.22)&mask]=1
encoded=np.clip(np.rint((height+16)*3),0,255).astype('uint8');raw=np.stack([encoded,biome],axis=-1).tobytes();payload={'w':w,'h':h,'bytes':base64.b64encode(raw).decode()}
(root/'elyndor/relief-data-v18.js').write_text('// Geographic height and biome data traced from the current approved atlas.\nconst ATLAS_RELIEF18='+json.dumps(payload,separators=(',',':'))+';\n',encoding='utf-8')
data=json.loads((folder/'data.json').read_text(encoding='utf-8'));selected={'source':'https://elyndor-world-atlas.maplecloud21.chatgpt.site/','version':7,'points':[{k:q[k]for k in ['id','name','parent','x','y','kind','type','vendors','facilities','children','future']if k in q}for q in data['points']],'regions':[{k:q[k]for k in ['id','name','x','y','future']}for q in data['regions']],'roads':data['roads'],'sea':data['sea']}
(root/'elyndor/atlas-data-v18.js').write_text('// Canonical named places, services and coordinates from the user-selected atlas.\nconst ATLAS18='+json.dumps(selected,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
preview=np.zeros((h,w,3),dtype='uint8');colors=np.array([[112,141,83],[198,214,209],[155,132,92],[202,158,104],[99,99,80]])
for j in range(h):
 for i in range(w):preview[j,i]=np.clip(colors[biome[j,i]]*(.83+height[j,i]/105),0,255)if height[j,i]>0 else[24,92,117]
Image.fromarray(preview).resize((1536,864),Image.Resampling.NEAREST).save(folder/'height-preview.png');print(json.dumps({'points':len(selected['points']),'land':int(mask.sum()),'heightMax':float(height.max())}))
