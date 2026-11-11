"""Publish native binary assets once instead of parsing base64 in mobile HTML."""
import base64, hashlib

def externalize_runtime116(root, assets):
    folder=root/'elyndor/assets/runtime-v116'
    folder.mkdir(parents=True,exist_ok=True)
    extensions={'image/png':'png','image/webp':'webp','image/jpeg':'jpg','audio/ogg':'ogg','audio/mpeg':'mp3'}
    def store(value):
        if not isinstance(value,str) or not value.startswith('data:'):return value
        header,body=value.split(',',1)
        mime=header[5:].split(';',1)[0]
        if mime not in extensions:raise ValueError('Unexpected runtime asset type '+mime)
        data=base64.b64decode(body,validate=True)
        path=folder/(hashlib.sha256(data).hexdigest()+'.'+extensions[mime])
        if not path.exists():path.write_bytes(data)
        return path.relative_to(root).as_posix()
    for category in ['images','portraits','portraitFaces','figures','voices','sounds','combatIcons65']:
        for key,value in assets.get(category,{}).items():assets[category][key]=store(value)
    for row in assets['sprites'].values():row['url']=store(row['url'])
