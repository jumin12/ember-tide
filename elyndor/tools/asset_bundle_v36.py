"""Stream the standalone's embedded assets as disposable JSON blocks."""
import json

def package_assets36(assets):
    chunks=[]
    maps={'images','sprites','portraits','portraitFaces','figures','voices','sounds'}
    encode=lambda value:json.dumps(value,separators=(',',':')).replace('</','<\\/')
    for category,value in assets.items():
        if category in maps and isinstance(value,dict):
            if not value:chunks.append(('',encode({category:{}})))
            current={};size=0
            for key,item in value.items():
                entry_size=len(encode({key:item}).encode('utf-8'))
                if current and size+entry_size>450000:
                    chunks.append((category,encode(current)));current={};size=0
                current[key]=item;size+=entry_size
            if current:chunks.append((category,encode(current)))
        else:chunks.append(('',encode({category:value})))
    total=sum(len(payload.encode('utf-8')) for _,payload in chunks)
    boot='''<script>
window.__assetBundle36={};window.__assetReading36={done:0,total:TOTAL36,complete:false,records:[]};
window.__readAsset36=function(id,category,bytes){
 const node=document.getElementById(id),part=JSON.parse(node.textContent),root=window.__assetBundle36;
 if(category)Object.assign(root[category]??={},part);else Object.assign(root,part);node.remove();
 const q=window.__assetReading36;q.done+=bytes;q.records.push({bytes:q.done,at:performance.now()});const percent=q.done/q.total*12;
 document.getElementById('load-fill').style.width=percent.toFixed(2)+'%';
 document.getElementById('load-label').textContent='Reading bundled artwork and audio… '+Math.round(q.done/q.total*100)+'%';
 const track=document.querySelector('.load-track');track.setAttribute('role','progressbar');track.setAttribute('aria-valuemin','0');track.setAttribute('aria-valuemax','100');track.setAttribute('aria-valuenow',String(Math.round(percent)));
};
</script>'''.replace('TOTAL36',str(total))
    pieces=[boot]
    for index,(category,payload) in enumerate(chunks):
        ident='asset36-'+str(index)
        pieces.append('<script type="application/json" id="'+ident+'">'+payload+'</script><script>__readAsset36('+json.dumps(ident)+','+json.dumps(category)+','+str(len(payload.encode('utf-8')))+');</script>')
    pieces.append('<script>window.__assetReading36.complete=true;delete window.__readAsset36;</script>')
    return '\n'.join(pieces)
