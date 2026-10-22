"""Draw code-native motion reference diagrams, not edits of character artwork."""
from PIL import Image,ImageDraw
import math
from pathlib import Path
out=Path(__file__).resolve().parent.parent/'art'/'motion-guides';out.mkdir(parents=True,exist_ok=True)
def make(run=False,idle=False):
    cols=4 if idle else 8
    im=Image.new('RGBA',(cols*256,1024),(24,40,44,255));d=ImageDraw.Draw(im)
    for row,face in enumerate(['south','west','east','north']):
        for frame in range(cols):
            phase=frame*math.pi/4;stride=math.cos(phase);lift=max(0,math.sin(phase));otherlift=max(0,-math.sin(phase));cx=frame*256+128;floor=row*256+224
            bob=(-3 if run else -2)*abs(math.sin(phase));hip=(cx,floor-60+bob);neck=(cx,floor-119+bob)
            side=face in ['west','east'];sign=-1 if face=='west' else 1
            # Each foot keeps its own frontal lane. Opposite half-cycle exchanges lift/stride.
            if side:
                left=(cx+sign*stride*(36 if run else 23),floor-lift*(35 if run else 16));right=(cx-sign*stride*(36 if run else 23),floor-otherlift*(35 if run else 16))
                knees=[(cx+sign*stride*20,floor-31-lift*22),(cx-sign*stride*20,floor-31-otherlift*22)]
                hips=[(cx-3,hip[1]),(cx+3,hip[1])]
            else:
                left=(cx-15,floor-(stride+1)*8-lift*(18 if run else 4));right=(cx+15,floor-(1-stride)*8-otherlift*(18 if run else 4));knees=[(cx-16,floor-30-lift*10),(cx+16,floor-30-otherlift*10)];hips=[(cx-13,hip[1]),(cx+13,hip[1])]
            if idle:
                left=(cx-15,floor);right=(cx+15,floor);knees=[(cx-14,floor-30),(cx+14,floor-30)];hips=[(cx-13,hip[1]),(cx+13,hip[1])]
            for h,k,f,c in zip(hips,knees,[left,right],['#e88759','#68b5d0']):
                d.line([h,k,f],fill='#101e22',width=24);d.line([h,k,f],fill=c,width=16);d.rounded_rectangle([f[0]-13,f[1]-10,f[0]+13,f[1]+3],4,fill=c,outline='#f4dfba',width=2)
            # Arms swing against the legs, with bent elbows and relaxed shoulders.
            for s,c in [(-1,'#e88759'),(1,'#68b5d0')]:
                shoulder=(cx+s*23,neck[1]+12);hand=(cx+s*33+(stride*s*14 if side else -stride*s*3),hip[1]-6+stride*s*17);elbow=((shoulder[0]+hand[0])/2,neck[1]+41)
                d.line([shoulder,elbow,hand],fill='#17282b',width=20);d.line([shoulder,elbow,hand],fill=c,width=13);d.ellipse([hand[0]-7,hand[1]-7,hand[0]+7,hand[1]+7],fill='#edd1a6')
            d.polygon([(cx-23,neck[1]+6),(cx+23,neck[1]+6),(cx+26,hip[1]+5),(cx-26,hip[1]+5)],fill='#6c8871',outline='#d4c8a6',width=3)
            d.ellipse([cx-29,neck[1]-52,cx+29,neck[1]+7],fill='#d8c19e',outline='#14272b',width=4)
            if side:d.polygon([(cx+sign*27,neck[1]-28),(cx+sign*36,neck[1]-20),(cx+sign*25,neck[1]-14)],fill='#d8c19e')
            elif face=='south':
                for x in [cx-10,cx+10]:d.rectangle([x-3,neck[1]-22,x+3,neck[1]-14],fill='#203238')
    return im
for mode in ['walk','run','idle']:make(mode=='run',mode=='idle').save(out/(mode+'-guide.png'))
