"""Content-addressed, device-sized scenery. Approved masters are never edited."""
from pathlib import Path
from PIL import Image
import hashlib, io, json


def package_scenery138(root, assets):
    folder = root / 'elyndor/assets/runtime-v138'
    folder.mkdir(parents=True, exist_ok=True)
    cache_file = folder / 'build-cache.json'
    cache = json.loads(cache_file.read_text()) if cache_file.exists() else {}
    urls, total = {}, {'masters': 0, 'desktop': 0, 'mobile': 0}

    def publish(data, suffix):
        path = folder / (hashlib.sha256(data).hexdigest() + suffix)
        if not path.exists():
            path.write_bytes(data)
        return path.relative_to(root).as_posix()

    def image(url, data=False):
        if not url or url.startswith(('data:', 'http')) or url in urls:
            return
        source = root / url
        if not source.is_file():
            raise ValueError('Missing scenery source: ' + url)
        raw = source.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        key = digest + (':data' if data else ':colour') + ':138-1'
        entry = cache.get(key)
        if not entry or not all((root / entry[q]).is_file() for q in ['desktop', 'mobile']):
            with Image.open(io.BytesIO(raw)) as original:
                # Panoramas retain their approved native pixels. Texture sizes
                # match the renderer's existing arrays, before any download.
                panorama = original.width > original.height * 1.8 and original.width > 1700
                entry = {}
                for tier, cap in [('desktop', 512 if data else 1024), ('mobile', 256 if data else 512)]:
                    if panorama:
                        entry[tier] = publish(raw, source.suffix)
                        continue
                    im = original.convert('RGBA') if 'A' in original.getbands() else original.convert('RGB')
                    im.thumbnail((cap, cap), Image.Resampling.LANCZOS)
                    buf = io.BytesIO()
                    im.save(buf, format='WEBP', lossless=data, quality=94, method=5, exact=True)
                    entry[tier] = publish(buf.getvalue(), '.webp')
            cache[key] = entry
        urls[url] = entry
        total['masters'] += len(raw)
        for tier in ['desktop', 'mobile']:
            total[tier] += (root / entry[tier]).stat().st_size

    for row in assets.get('environment103', {}).get('images', {}).values():
        image(row.get('url') or row.get('file'))
        for value in (row.get('pbr') or {}).values():
            if isinstance(value, dict):
                image(value.get('gpu'), data=True)
    # Scene-specific battle assets stay on demand; fingerprint hard-coded URLs
    # too, so the same cache policy safely covers all runtime scenery.
    for path in sorted((root / 'elyndor/assets/source/battle-surfaces-v132').glob('*.webp')):
        image(path.relative_to(root).as_posix())
    for path in sorted((root / 'elyndor/assets/source/battle-hd-v99').glob('*.webp')):
        image(path.relative_to(root).as_posix())
    def fingerprint(value, field=''):
        if isinstance(value, dict):
            return {k: fingerprint(v, k) for k, v in value.items()}
        if isinstance(value, list):
            return [fingerprint(v) for v in value]
        if not isinstance(value, str) or field == 'native' or not value.startswith('elyndor/assets/source/'):
            return value
        path = root / value
        if path.suffix.lower() not in ['.png', '.webp', '.jpg', '.jpeg', '.ogg'] or not path.is_file():
            return value
        if value not in urls:
            native = publish(path.read_bytes(), path.suffix)
            urls[value] = {'desktop': native, 'mobile': native}
        return urls[value]['desktop']
    for key in list(assets):
        assets[key] = fingerprint(assets[key])
    # Direct Image users receive the hashed desktop URL; the shared scenery
    # decoder can choose the phone URL without first fetching the larger one.
    assets['delivery138'] = {**urls, **{row['desktop']: row for row in list(urls.values())}}
    gpu = root / 'elyndor/assets/gpu-v138.json'
    if gpu.exists():
        packed = json.loads(gpu.read_text())
        for name, digest in packed['inputs'].items():
            if hashlib.sha256((root / name).read_bytes()).hexdigest() != digest:
                raise ValueError('Re-encode changed GPU scenery: ' + name)
        # Source receipts are build checks, not executable metadata.
        assets['gpu138'] = {key: value for key, value in packed.items() if key != 'inputs'}
    dependencies = {row[tier] for row in urls.values() for tier in ['desktop', 'mobile']}
    if 'gpu138' in assets:
        config = assets['gpu138']
        dependencies.update(row[tier]['url'] for row in config['arrays'].values() for tier in ['desktop', 'mobile'])
        dependencies.update(path.relative_to(root).as_posix() for path in (root / config['transcoder']).iterdir() if path.is_file())
    records = [{'file': name, 'bytes': (root / name).stat().st_size, 'sha256': hashlib.sha256((root / name).read_bytes()).hexdigest()} for name in sorted(dependencies)]
    (root / 'elyndor/assets/runtime-v138-manifest.json').write_text(json.dumps({'files': records}, indent=2))
    cache_file.write_text(json.dumps(cache, separators=(',', ':')))
    (root / 'output/hosting138/texture-delivery.json').write_text(json.dumps({'files': len(urls), 'bytes': total}, indent=2))
