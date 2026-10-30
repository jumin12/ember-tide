from pathlib import Path
from PIL import Image,ImageChops,ImageStat
import json
folder=Path(__file__).resolve().parents[2]/'output/elyndor/pixellab-v30/reflections';rows=[]
for name in sorted(p.name.removesuffix('-full.png')for p in folder.glob('*-full.png')):
 with Image.open(folder/(name+'-full.png'))as a,Image.open(folder/(name+'-crop.png'))as b:
  d=ImageChops.difference(a.convert('RGB'),b.convert('RGB'));mean=sum(ImageStat.Stat(d).mean)/3;hist=d.convert('L').histogram();large=sum(hist[25:])/(a.width*a.height);rows.append({'view':name,'meanAbsoluteChannelDifference':mean,'fractionAbove24':large,'pass':mean<.6 and large<.003})
print(json.dumps(rows))
