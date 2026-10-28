"""Derive geographic silhouette data from the user-selected atlas reference.
The reference pixels are not used as game materials; all diffuse art is PixelLab.
"""
from pathlib import Path
from PIL import Image,ImageFilter,ImageDraw
import numpy as np,base64,json
from scipy.ndimage import binary_fill_holes,binary_closing,binary_opening,label,distance_transform_edt,gaussian_filter
root=Path(__file__).resolve().parents[2];ref=root/'design/pixellab-v15/atlas/world.webp';w,h=512,288
a=np.asarray(Image.open(ref).convert('RGB').resize((w,h),Image.Resampling.BOX)).astype(float)/255
water=(a[:,:,2]>a[:,:,0]*1.13)&(a[:,:,2]>a[:,:,1]*.94)&((a[:,:,2]-a[:,:,0])>.055)
mask=~water
# Pale atmospheric corners in the concept are clouds, not extra continents.
yy,xx=np.mgrid[:h,:w];mask&=~(((xx<55)&((yy<45)|(yy>182)))|((xx>485)&((yy<20)|(yy>258))))
mask=binary_closing(mask,iterations=2);mask=binary_opening(mask,iterations=1)
labels,n=label(mask);sizes=np.bincount(labels.ravel());mask=np.isin(labels,np.argsort(sizes[1:])[-20:]+1)
mask=binary_fill_holes(mask);shore=distance_transform_edt(mask)*2
macro=(4+4*np.sin(xx*.052+np.sin(yy*.047))*np.cos(yy*.061)+2*np.sin(xx*.151+yy*.109))
snow=np.exp(-((xx-148)/67)**2-((yy-49)/36)**2)
westernRidges=np.exp(-((xx-170)/112)**2-((yy-115)/75)**2)*(8+10*(.5+.5*np.sin(xx*.087+yy*.06))**3)
easternPlateau=np.clip((xx-316)/40,0,1)*(8+10*(.5+.5*np.sin(xx*.097+yy*.054))**4)
volcano=np.exp(-((xx-276)/19)**2-((yy-237)/21)**2)*57
height=macro+snow*(24+32*(.5+.5*np.sin(xx*.12-yy*.09))**2)+westernRidges+easternPlateau+volcano
height=np.where(mask,np.minimum(height,2+shore*.9),-5-np.minimum(distance_transform_edt(~mask),12)*.35)
height=gaussian_filter(height,.65)
encoded=np.clip(np.rint((height+16)*3),0,255).astype('uint8')
biome=np.zeros((h,w),dtype='uint8');biome[(xx>318)&(yy<125)]=2;biome[(xx>318)&(yy>=125)]=3;biome[(xx>205)&(xx<356)&(yy>218)]=4;biome[(snow>.23)&mask]=1
raw=np.stack([encoded,biome],axis=-1).tobytes();data={'w':w,'h':h,'width':1024,'depth':576,'heightScale':3,'heightOffset':16,'bytes':base64.b64encode(raw).decode()}
(root/'elyndor/relief-data-v15.js').write_text('// Geographic data traced from the user-selected atlas, without reference artwork.\nconst WORLD_RELIEF_V15='+json.dumps(data,separators=(',',':'))+';\n',encoding='utf-8')
preview=np.zeros((h,w,3),dtype='uint8');colors=np.array([[111,147,76],[204,218,216],[150,130,88],[203,158,95],[94,92,73]])
for j in range(h):
 for i in range(w):preview[j,i]=np.clip(colors[biome[j,i]]*(.8+height[j,i]/95),0,255)if height[j,i]>0 else [20,84,111]
im=Image.fromarray(preview).resize((1536,864),Image.Resampling.NEAREST);d=ImageDraw.Draw(im)
for key,(x,z)in{'Brookstead':(580,585),'Fern Hollow':(400,495),'Highmere':(880,552),'Alderbridge':(740,652),'Relief':(700,416),'Network':(940,450),'Harbor':(974,686),'Citadel':(780,326)}.items():
 px=x/2000*1536;pz=z/1125*864;d.ellipse((px-3,pz-3,px+3,pz+3),fill='#ffe6a0');d.text((px+6,pz),key,fill='white')
im.save(root/'design/pixellab-v15/atlas/relief-preview.png');print(json.dumps({'landCells':int(mask.sum()),'total':w*h,'heightMax':float(height.max()),'dataBytes':len(raw)}))
