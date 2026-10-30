from pathlib import Path
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parents[2];O=R/'output/elyndor/pixellab-v29'
sets={'rooms':[(O/'interiors'/(name+'.png'),name)for name in ['brookInn','highmereInn','brookShop','brookForge','aidOffice','council','archives','quest-marker','quest-complete']], 'loading':[(O/'loading-native'/(name+'.png'),name)for name in ['river','inn','shop','archives']], 'screens':[(O/'room-soak'/(name+'.png'),name)for name in ['loading-entrance','loading-brookInn','loading-brookShop','loading-archives','inn-1366','inn-1024','inn-390','inn-844']]}
for name,entries in sets.items():
 cols=3 if name=='rooms'else 2;w,h=640,385;board=Image.new('RGB',(cols*w,((len(entries)+cols-1)//cols)*h),'#13212a');draw=ImageDraw.Draw(board)
 for i,(p,label)in enumerate(entries):
  with Image.open(p)as im:
   im.thumbnail((w,h-25));x=i%cols*w+(w-im.width)//2;y=i//cols*h;board.paste(im,(x,y+25));draw.text((i%cols*w+10,y+7),label,fill='#f2d593')
 board.save(O/('review-'+name+'.png'))
print('Prepared current rendered review boards')
