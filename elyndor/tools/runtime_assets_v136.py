"""Keep loading art and bulk world data out of the executable HTML."""
import base64,gzip,hashlib,json

def runtime_file136(root,data,extension):
    path=root/'elyndor/assets/runtime-v136'/(hashlib.sha256(data).hexdigest()+'.'+extension)
    path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():path.write_bytes(data)
    return path.relative_to(root).as_posix()

def package_runtime136(root,parts,bake):
    # The same native matrix data loads concurrently with artwork, before any
    # construction can consume it. Terrain, routes and vegetation remain exact native data.
    rows=bake;raw=json.dumps(rows,separators=(',',':')).encode()
    url=runtime_file136(root,raw,'json');compressed=runtime_file136(root,gzip.compress(raw,compresslevel=9,mtime=0),'json.gz')
    compact={}
    original=(root/'elyndor/world-bake-v36.js').read_text(encoding='utf8')
    replacement='const BAKED_WORLD36='+json.dumps(compact,separators=(',',':'))+';\n'
    core={key:value for key,value in rows.items() if key!='vegetation64'}
    vegetation={'vegetation64':rows['vegetation64']}
    def bundle(value):
        data=json.dumps(value,separators=(',',':')).encode()
        return {'plain':runtime_file136(root,data,'json'),'gzip':runtime_file136(root,gzip.compress(data,compresslevel=9,mtime=0),'json.gz')}
    replacement+='const WORLD_DATA136='+json.dumps({'plain':url,'gzip':compressed,'initial':bundle(core),'vegetation':bundle(vegetation)})+';\n'
    assert original in parts['POLISH']
    parts['POLISH']=parts['POLISH'].replace(original,replacement)
    # Staged NPC sheets are optional dev-preview art, never initial game art.
    def external(match):
        mime=match.group(1);data=base64.b64decode(match.group(2));return runtime_file136(root,data,{'png':'png','webp':'webp','jpeg':'jpg'}[mime])
    import re
    parts['POLISH']=re.sub(r'data:image/(png|webp|jpeg);base64,([A-Za-z0-9+/=]+)',external,parts['POLISH'])
