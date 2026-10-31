"""Arrange actual browser captures and measured results; no generated artwork."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/runtime-v36'
def font(size):return ImageFont.truetype('C:/Windows/Fonts/arial.ttf',size)
def label(im,xy,text,size=24,color='#f4d594'):ImageDraw.Draw(im).text(xy,text,font=font(size),fill=color)
bench=json.loads((O/'benchmark/report.json').read_text());assert bench['pass']
board=Image.new('RGB',(1920,760),'#071923')
label(board,(24,18),'Alpha 1.11 · Actual game captures, same village and camera',30)
for i,name in enumerate(['before','after']):
 q=next(q for q in bench['runs'] if q['label']==name and q['width']==960 and q['rate']==1)
 x=i*960;label(board,(x+24,68),('Previous release' if name=='before' else 'Optimized release'),26)
 label(board,(x+24,106),f"{q['fps']:.1f} FPS · retained JS {q['heap']['usedSize']/1e6:.1f} MB · backing {q['heap']['backingStorageSize']/1e6:.1f} MB",22,'#d7e2e4')
 board.paste(Image.open(O/f'benchmark/{name}-960-1.png').convert('RGB'),(x,156))
board.save(O/'runtime-comparison.jpg',quality=94)
mobile=Image.new('RGB',(1366,1040),'#071923');label(mobile,(24,18),'Responsive layouts and real loading feedback',30)
portrait=Image.open(O/'validation/phone-portrait-game.png').convert('RGB');portrait=portrait.resize((390,844),Image.Resampling.LANCZOS)
mobile.paste(portrait,(24,106));label(mobile,(24,70),'Portrait · touch emulation',24)
land=Image.open(O/'validation/phone-landscape-cpu4-game.png').convert('RGB').resize((844,390),Image.Resampling.LANCZOS)
mobile.paste(land,(472,106));label(mobile,(472,70),'Landscape · touch + 4× CPU stress',24)
load=Image.open(O/'lifecycle/stream-loading.png').convert('RGB').resize((844,475),Image.Resampling.LANCZOS)
mobile.paste(load,(472,540));label(mobile,(472,507),'Loading during a paced local download',23)
mobile.save(O/'device-layouts.jpg',quality=94)
print('Saved native runtime comparison and device-layout boards')
