from pathlib import Path
R=Path(__file__).resolve().parents[2];T=R/'elyndor/tools'
(T/'write-v24-release.py').write_text((T/'write-atmosphere-release-v24.py').read_text(encoding='utf-8'),encoding='utf-8',newline='\n')
p=T/'prepare-pixellab-v24.py';s=p.read_text(encoding='utf-8')
s=s.replace("[('clarity','clarity-'),('official','official-')]","[('clarity','clarity-'),('official','official-'),('revision','reference-')]")
s=s.replace("if image.name!='failure.png':shutil.copyfile(image,PRE/(prefix+image.name))","if image.name!='failure.png' and (folder!='revision' or image.name in ['reference-court.png','bridge.png','poi-fern.png','poi-harbor.png']):shutil.copyfile(image,PRE/(prefix+image.name))")
s=s.replace('Alpha Version 1.0: native sharp rendering, warm daylight, oblique exploration and sustained-play optimization','Alpha Version 1.0: concept-matched atmosphere, PixelLab interface, detailed architecture and expanded points of interest')
p.write_text(s,encoding='utf-8',newline='\n')
print('Curated V24 publisher and canonical 36-check metadata writer ready.')
