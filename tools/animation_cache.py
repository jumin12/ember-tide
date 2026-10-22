from pathlib import Path
import hashlib

def animation_signature(root: Path):
    files = ['walk-00-v3.png','walk-01.png','rowan-smooth.png','aren-combat.png','mira-combat.png','rowan-combat.png','wisp-walk-v2.png','wolf-walk-v2.png','wisp-combat-v2.png','wolf-combat-v2.png','iris-smooth.png','ori-smooth.png']
    files += [f'walk-{i:02}-v3.png' if i in [12,14] else f'walk-{i:02}.png' for i in [4,5,6,7,8,9,10,12,14,15]]
    files += [f'idle-{i:02}.png' for i in range(17)]
    files += ['motion-walk-01-eyes.png' if i==1 else f'motion-walk-{i:02}.png' for i in [0,1,2,4,5,6,7,8,9,10,11,12,13,14,15]]
    files += ['motion-run-00.png','motion-run-01-eyes.png','motion-idle-00.png','motion-idle-01.png']
    files += [f'motion-repair-{i:02}-{dir}.png' for i,dir in [(0,'south'),(2,'south'),(2,'north'),(8,'south'),(10,'south'),(11,'north')]]
    h = hashlib.sha256()
    for name in files:
        h.update(name.encode())
        h.update((root / 'art' / name).read_bytes())
    for name, end in [('polish.js','// Pixel scale remains'),('living-world.js','const oldStaticBlocked')]:
        h.update((root/'tools'/name).read_text(encoding='utf-8').split(end)[0].encode())
    h.update((root/'tools'/'motion-assets.js').read_bytes())
    return h.hexdigest()

if __name__ == '__main__':
    print(animation_signature(Path(__file__).resolve().parent.parent))
