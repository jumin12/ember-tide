"""Analyze source-pose anatomy lanes; emit diagnostic contact sheets, never alter art."""
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np,json
root=Path(__file__).resolve().parent.parent;out=root/'output'/'motion-art';out.mkdir(parents=True,exist_ok=True)
def rows(alpha,count):
    ink=(alpha>128).sum(axis=1)>4;runs=[];start=None
    for y,v in enumerate(list(ink)+[False]):
        if v and start is None:start=y
        if not v and start is not None:
            if y-start>10:runs.append((start,y))
            start=None
    if len(runs)==count:return [(0 if i==0 else (runs[i-1][1]+a)//2,alpha.shape[0] if i==count-1 else (b+runs[i+1][0])//2) for i,(a,b) in enumerate(runs)]
    return [(int(i*alpha.shape[0]/count),int((i+1)*alpha.shape[0]/count)) for i in range(count)]
def cells(im,count=8,rowcount=4):
    a=np.array(im)[:,:,3];result=[]
    for y0,y1 in rows(a,rowcount):
        projection=(a[y0:y1]>128).sum(axis=0);cuts=[0]
        for k in range(1,count):
            expected=im.width*k/count;points=range(int(expected-im.width/count*.38)+1,int(expected+im.width/count*.38));cuts.append(min(points,key=lambda x:projection[max(0,x-3):x+4].sum()*20+abs(x-expected)*.02))
        cuts.append(im.width);result.append([im.crop((cuts[k],y0,cuts[k+1],y1)) for k in range(count)])
    return result
report=[]
art=root/'art'
for file in sorted(list(art.glob('motion-walk-*.png'))+list(art.glob('motion-run-*.png'))):
    im=Image.open(file).convert('RGBA');poses=cells(im);contact=Image.new('RGB',(1280,600),'#233c35');draw=ImageDraw.Draw(contact)
    for row,dir in [(0,'south'),(3,'north')]:
        values=[]
        for k,p in enumerate(poses[row]):
            a=np.array(p)[:,:,3]>128;ys,xs=np.where(a);y0,y1=ys.min(),ys.max();h=y1-y0+1;part=a[int(y0+h*.4):int(y0+h*.64),int(p.width*.36):int(p.width*.64)];_,rx=np.where(part);cx=(rx.mean()+int(p.width*.36)) if len(rx) else p.width/2
            def boot(side):
                x0=int(cx+(-16 if side<0 else 2)*h/72);x1=int(cx+(-2 if side<0 else 16)*h/72);y=int(y1-23*h/72);yy,xx=np.where(a[y:y1+1,max(0,x0):min(p.width,x1)]);return int(yy.max()+y) if len(yy) else -1
            left,right=boot(-1),boot(1);delta=left-right;values.append(delta);sprite=p.crop(p.getbbox());sprite.thumbnail((138,225),Image.Resampling.NEAREST);x=10+k*158;y=28+(0 if row==0 else 300);contact.paste(sprite,(x+(138-sprite.width)//2,y),sprite);draw.text((x,y+235),f'{dir} {k+1}: {delta}',fill='#f5dfb0')
        report.append({'file':file.name,'direction':dir,'deltas':values,'alternates':min(values)<0<max(values)})
    contact.save(out/(file.stem+'.png'))
(out/'report.json').write_text(json.dumps(report,indent=2));print(json.dumps([r for r in report if not r['alternates']],indent=2))
