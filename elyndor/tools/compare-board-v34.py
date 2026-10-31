from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import json
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/pixellab-v34/comparison'
proof=json.loads((O/'provenance.json').read_text());assert proof['pass']
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',28);small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',22)
def tile(sheet,file,x,y,w,label):
 im=Image.open(O/file).convert('RGB');h=round(im.height*w/im.width);im=im.resize((w,h),Image.Resampling.LANCZOS);sheet.paste(im,(x,y+48));ImageDraw.Draw(sheet).text((x+14,y+7),label,font=font,fill='#f3db9a');return h
for name,title in [('street','Brookstead entrance street'),('waterworks','Channel-side waterworks'),('smithy','Brookstead smithy')]:
 w=1200;h=round(941*w/1672)+48;im=Image.new('RGB',(w*2,h),'#09171e');tile(im,name+'-before.png',0,0,w,'BEFORE · Previous lighting · 09:00');tile(im,name+'-after.png',w,0,w,'AFTER · Revised lighting · 09:00');im.save(O/(name+'-comparison.jpg'),quality=96)
labels=[('predawn','05:00 · Before sunrise'),('dawn','06:30 · Dawn'),('morning','09:00 · Morning'),('noon','12:00 · Noon'),('afternoon','16:00 · Afternoon'),('golden','17:30 · Golden hour'),('dusk','18:30 · Dusk'),('night','23:00 · Moonlight')];w=800;h=round(941*w/1672)+48;im=Image.new('RGB',(w*4,h*2),'#09171e')
for i,(name,label)in enumerate(labels):tile(im,'time-'+name+'.png',(i%4)*w,(i//4)*h,w,label)
im.save(O/'day-night-cycle.jpg',quality=96)
print('Saved three matched before/after boards and eight-time-of-day board; full-resolution native PNGs retained')
