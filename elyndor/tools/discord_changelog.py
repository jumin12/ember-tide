"""Announce release.json only after its exact game artifact is live.

No third-party packages. --dry-run prepares a preview without network requests.
Confirmed versions are recorded as discord-announced/<version> Git tags.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib import error, parse, request
import uuid


class NotificationError(Exception):
    pass


def release_payload(release, game_url):
    version = release.get('version')
    if not isinstance(version, str):
        raise NotificationError('release.json must contain a version string.')
    version = version.strip()
    changes = release.get('changes')
    artifact = release.get('artifact', {})
    if not version or not isinstance(changes, list) or not changes or any(not isinstance(s, str) or not s.strip() for s in changes):
        raise NotificationError('release.json must contain a version and nonempty changelog entries.')
    if not isinstance(artifact, dict) or not isinstance(artifact.get('sha256'), str) or not re.fullmatch(r'[a-f0-9]{64}', artifact['sha256']) or type(artifact.get('bytes')) is not int or not 0 < artifact['bytes'] <= 128 * 1024 * 1024:
        raise NotificationError('The release artifact checksum or byte count is invalid.')
    address = parse.urlsplit(game_url)
    if address.scheme != 'https' or not address.netloc or address.username or address.password or address.fragment:
        raise NotificationError('The game URL must use HTTPS.')
    notes = '\n'.join('- ' + item.strip() for item in changes)
    full = f"# {release.get('game', 'Elyndor')} — {version}\n\n{notes}\n\nPlay: {game_url}\n"
    if len(full.encode('utf-8')) > 512 * 1024:
        raise NotificationError('Changelog exceeds the attachment limit.')
    description = notes if len(notes) <= 3800 else notes[:3700] + '\n\nFull changelog attached.'
    payload = {
        'allowed_mentions': {'parse': []},
        'embeds': [{
            'title': f"{release.get('game', 'Elyndor')} · {version}"[:256],
            'url': game_url,
            'description': description,
            'color': 0xD6B46A,
            'fields': [{'name': 'Play', 'value': '[Open Elyndor](' + game_url + ')'}],
            'footer': {'text': 'Update published · Full changelog attached'},
        }],
        'attachments': [{'id': 0, 'filename': 'changelog.md'}],
    }
    slug = re.sub(r'[^a-z0-9.-]+', '-', version.lower()).strip('-.')[:70]
    if not slug:
        raise NotificationError('The version cannot be used as a notification marker.')
    tag = 'discord-announced/' + slug + '-' + hashlib.sha256(version.encode()).hexdigest()[:10]
    return payload, full, tag


def webhook_address(value):
    parts = parse.urlsplit(value)
    if parts.scheme != 'https' or parts.netloc not in ['discord.com', 'canary.discord.com', 'ptb.discord.com'] or not re.fullmatch(r'/api(?:/v\d+)?/webhooks/\d+/[A-Za-z0-9._-]+', parts.path) or parts.fragment:
        raise NotificationError('Use the HTTPS webhook URL copied from Discord channel integrations.')
    query = parse.parse_qs(parts.query)
    if set(query) - {'thread_id', 'wait'} or 'thread_id' in query and (len(query['thread_id']) != 1 or not query['thread_id'][0].isdigit()):
        raise NotificationError('The webhook URL has unsupported parameters.')
    query['wait'] = ['true']
    return parse.urlunsplit(parts._replace(query=parse.urlencode(query, doseq=True)))


def github_call(repository, token, suffix, body=None, missing_ok=False):
    data = None if body is None else json.dumps(body).encode()
    req = request.Request('https://api.github.com/repos/' + repository + suffix, data=data, headers={
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'elyndor-changelog',
    })
    try:
        with request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except error.HTTPError as exc:
        if missing_ok and exc.code == 404:
            return None
        raise NotificationError(f'GitHub returned HTTP {exc.code}. Check Actions contents-write permission.') from None


def live_matches(release, game_url):
    parts = parse.urlsplit(game_url)
    query = parse.parse_qs(parts.query)
    query['release'] = [release['artifact']['sha256'][:16]]
    url = parse.urlunsplit(parts._replace(query=parse.urlencode(query, doseq=True)))
    digest, size = hashlib.sha256(), 0
    with request.urlopen(request.Request(url, headers={'User-Agent': 'elyndor-changelog'}), timeout=45) as response:
        while chunk := response.read(1024 * 1024):
            size += len(chunk)
            if size > release['artifact']['bytes']:
                return False
            digest.update(chunk)
    return size == release['artifact']['bytes'] and digest.hexdigest() == release['artifact']['sha256']


def discord_send(url, payload, notes):
    boundary = 'elyndor-' + uuid.uuid4().hex
    body = (
        f'--{boundary}\r\nContent-Disposition: form-data; name="payload_json"\r\nContent-Type: application/json\r\n\r\n'.encode()
        + json.dumps(payload, ensure_ascii=False).encode('utf-8')
        + f'\r\n--{boundary}\r\nContent-Disposition: form-data; name="files[0]"; filename="changelog.md"\r\nContent-Type: text/markdown; charset=utf-8\r\n\r\n'.encode()
        + notes.encode('utf-8') + f'\r\n--{boundary}--\r\n'.encode()
    )
    req = request.Request(url, data=body, headers={'Content-Type': 'multipart/form-data; boundary=' + boundary, 'User-Agent': 'elyndor-changelog'})
    try:
        with request.urlopen(req, timeout=30) as response:
            result = json.load(response)
    except error.HTTPError as exc:
        status = exc.code
        try:
            detail = json.loads(exc.read(16384))
            code = detail.get('code') if isinstance(detail, dict) else None
        except (ValueError, OSError):
            code = None
        finally:
            exc.close()
        # Discord explicitly rejects an untitled forum request before creating
        # a message (220001). Only that confirmed rejection permits a retry;
        # timeouts and generic server errors must never duplicate a post.
        if status == 400 and code == 220001 and 'thread_name' not in payload and 'thread_id' not in parse.parse_qs(parse.urlsplit(url).query):
            forum_payload = {**payload, 'thread_name': payload['embeds'][0]['title'][:100]}
            return discord_send(url, forum_payload, notes)
        detail = f' (code {code})' if isinstance(code, int) else ''
        raise NotificationError(f'Discord returned HTTP {status}{detail}. No delivery marker was written.') from None
    if not isinstance(result, dict) or not isinstance(result.get('id'), str) or not result['id'].isdigit():
        raise NotificationError('Discord did not confirm a message ID. Check the channel before retrying.')
    return result['id']


def announce(release, game_url, webhook, repository, token, sha):
    payload, notes, tag = release_payload(release, game_url)
    url = webhook_address(webhook)
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repository) or not re.fullmatch(r'[a-f0-9]{40}', sha) or not token:
        raise NotificationError('Repository, published commit and GitHub token are required.')
    if github_call(repository, token, '/git/ref/tags/' + tag, missing_ok=True) is not None:
        return 'Already announced this version; skipped.'
    ready = False
    for attempt in range(3):
        if live_matches(release, game_url):
            ready = True
            break
        if attempt < 2:
            time.sleep(5)
    if not ready:
        return 'Live file differs from this deployment; skipped an outdated or incomplete build.'
    message_id = discord_send(url, payload, notes)
    try:
        github_call(repository, token, '/git/refs', {'ref': 'refs/tags/' + tag, 'sha': sha})
    except NotificationError:
        raise NotificationError(f'Discord confirmed message {message_id}, but marker refs/tags/{tag} at {sha} failed. Do not rerun until the marker is repaired; see the setup guide.') from None
    return 'Discord confirmed delivery; version marker saved.'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--release', default='release.json')
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--out', default='output/elyndor/discord-changelog')
    args = parser.parse_args()
    release = json.loads(Path(args.release).read_text(encoding='utf-8'))
    game_url = os.environ.get('ELYNDOR_GAME_URL', 'https://jumin12.github.io/ember-tide/')
    if args.dry_run:
        payload, notes, tag = release_payload(release, game_url)
        out = Path(args.out);out.mkdir(parents=True, exist_ok=True)
        (out / 'payload.json').write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        (out / 'changelog.md').write_text(notes, encoding='utf-8')
        print('Preview prepared without network access. Marker: ' + tag)
        return
    webhook = os.environ.get('DISCORD_WEBHOOK_URL', '')
    if not webhook:
        print('DISCORD_WEBHOOK_URL is not configured; no message sent.')
        return
    print(announce(release, game_url, webhook, os.environ.get('GITHUB_REPOSITORY', ''), os.environ.get('GITHUB_TOKEN', ''), os.environ.get('PUBLISHED_SHA', '')))


def entry():
    try:
        main()
        return 0
    except (NotificationError, OSError, ValueError) as exc:
        # Network exception strings may contain a private webhook URL. Never log
        # those strings or traceback chains; only our own sanitized errors.
        print('Notification failed: ' + (str(exc) if isinstance(exc, NotificationError) else 'Network or release-data error; check the channel before retrying.'), file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(entry())
