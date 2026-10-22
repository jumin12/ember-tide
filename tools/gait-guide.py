"""Draw an original skeletal animation guide, not edits to any character image."""
from PIL import Image, ImageDraw
from pathlib import Path
import math
im=Image.new('RGB',(1536,896),'#eeeeea');d=ImageDraw.Draw(im)
for row in range(4):
 for col in range(8):
  ox=col*192;oy=row*224;a=col*math.pi/4;c=math.cos(a);s=math.sin(a)
  def point(x,y):return (ox+x,oy+y)
  def line(points,color,width):d.line([point(*p) for p in points],fill=color,width=width,joint='curve')
  d.ellipse((ox+79,oy+25,ox+113,oy+60),fill='#4a4b56')
  line([(96,59),(96,125)],'#4a4b56',17)
  line([(75,76),(117,76)],'#4a4b56',8)
  for side,color in [(-1,'#2770b7'),(1,'#c34c3f')]:
   p=c*side;lift=max(0,s*side)
   if row in [0,3]:
    hip=(96+side*11,123);ankle=(96+side*(13+3*lift),183+p*9-lift*8);knee=(96+side*(13+5*lift),151-lift*6)
    shoulder=(96+side*20,78);elbow=(96+side*24,101-p*7);hand=(96+side*24,121-p*12)
   else:
    direction=-1 if row==1 else 1;hip=(96+side*4,123);ankle=(96+direction*p*24,183-lift*14);knee=(96+direction*(p*10+lift*12),154-lift*5)
    shoulder=(96+side*5,78);elbow=(96-direction*p*10,100);hand=(96-direction*p*24,121-lift*2)
   line([hip,knee,ankle],color,9);x,y=point(*ankle);d.rectangle((x-7,y-2,x+7,y+6),fill=color)
   line([shoulder,elbow,hand],color,7)
  if row==0:
   d.ellipse((ox+86,oy+38,ox+90,oy+43),fill='white');d.ellipse((ox+102,oy+38,ox+106,oy+43),fill='white')
  elif row in [1,2]:
   x=83 if row==1 else 105;d.ellipse((ox+x,oy+38,ox+x+4,oy+43),fill='white')
art=Path(__file__).resolve().parent.parent/'art'
art.mkdir(exist_ok=True)
im.save(art/'gait-pose-guide.png')
