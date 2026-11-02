import hashlib
import io
import json
import unittest
from unittest.mock import patch
from urllib.error import HTTPError

import discord_changelog as dc


RELEASE = {'game': 'Elyndor', 'version': 'Alpha Version 1.17', 'changes': ['Clearer paths.', 'Soren’s running animation.'], 'artifact': {'sha256': hashlib.sha256(b'game').hexdigest(), 'bytes': 4}}
WEBHOOK = 'https://discord.com/api/webhooks/123/test-private-token'
SHA = 'a' * 40


class AnnouncementTests(unittest.TestCase):
    def test_payload_preserves_notes_disables_mentions_and_has_durable_version_key(self):
        payload, notes, tag = dc.release_payload(RELEASE, 'https://example.com/')
        self.assertEqual(payload['allowed_mentions'], {'parse': []})
        self.assertIn('Soren’s running animation.', notes)
        self.assertEqual(payload['attachments'][0]['filename'], 'changelog.md')
        metadata_fix = {**RELEASE, 'release': 'different-commit-same-version'}
        self.assertEqual(tag, dc.release_payload(metadata_fix, 'https://example.com/')[2])
        self.assertNotEqual(tag, dc.release_payload({**RELEASE, 'version': 'Alpha Version 1.18'}, 'https://example.com/')[2])

    def test_long_changelog_is_attached_in_full(self):
        value = {**RELEASE, 'changes': ['A' * 3000, 'B' * 3000]}
        payload, notes, _ = dc.release_payload(value, 'https://example.com/')
        self.assertLessEqual(len(payload['embeds'][0]['description']), 4096)
        self.assertIn('B' * 3000, notes)

    def test_invalid_release_is_rejected_before_network(self):
        for values in [{'version': ''}, {'version': 1}, {'changes': []}, {'changes': [None]}, {'artifact': None}, {'artifact': {'bytes': 4, 'sha256': 'bad'}}]:
            with self.subTest(values=values), self.assertRaises(dc.NotificationError):
                dc.release_payload({**RELEASE, **values}, 'https://example.com/')

    def test_webhook_must_target_discord_and_wait_for_confirmation(self):
        self.assertEqual(dc.webhook_address(WEBHOOK), WEBHOOK + '?wait=true')
        self.assertIn('thread_id=456', dc.webhook_address(WEBHOOK + '?thread_id=456&wait=false'))
        for url in [WEBHOOK.replace('https:', 'http:'), WEBHOOK.replace('discord.com', 'discord.com.evil.test'), WEBHOOK + '?surprise=1', WEBHOOK.replace('discord.com', 'user@discord.com')]:
            with self.subTest(url=url), self.assertRaises(dc.NotificationError) as caught:
                dc.webhook_address(url)
            self.assertNotIn('test-private-token', str(caught.exception))

    def test_already_announced_never_posts(self):
        with patch.object(dc, 'github_call', return_value={}), patch.object(dc, 'live_matches') as live, patch.object(dc, 'discord_send') as send:
            self.assertIn('Already announced', dc.announce(RELEASE, 'https://example.com/', WEBHOOK, 'owner/repo', 'token', SHA))
            live.assert_not_called();send.assert_not_called()

    def test_superseded_build_never_posts_or_writes_marker(self):
        with patch.object(dc, 'github_call', return_value=None) as api, patch.object(dc, 'live_matches', return_value=False), patch.object(dc.time, 'sleep'), patch.object(dc, 'discord_send') as send:
            self.assertIn('outdated', dc.announce(RELEASE, 'https://example.com/', WEBHOOK, 'owner/repo', 'token', SHA))
            self.assertEqual(api.call_count, 1);send.assert_not_called()

    def test_marker_is_written_only_after_confirmed_delivery(self):
        calls = []
        def github(*args, **kwargs):
            calls.append('marker' if args[2] == '/git/refs' else 'lookup')
            if args[2] == '/git/refs':
                self.assertEqual(args[3]['sha'], SHA)
                self.assertTrue(args[3]['ref'].startswith('refs/tags/discord-announced/'))
            return None
        with patch.object(dc, 'github_call', side_effect=github), patch.object(dc, 'live_matches', side_effect=lambda *_: calls.append('live') or True), patch.object(dc, 'discord_send', side_effect=lambda *_: calls.append('post') or '123'):
            dc.announce(RELEASE, 'https://example.com/', WEBHOOK, 'owner/repo', 'token', SHA)
        self.assertEqual(calls, ['lookup', 'live', 'post', 'marker'])

    def test_failed_discord_delivery_leaves_no_marker(self):
        with patch.object(dc, 'github_call', return_value=None) as api, patch.object(dc, 'live_matches', return_value=True), patch.object(dc, 'discord_send', side_effect=dc.NotificationError('Discord failed')):
            with self.assertRaises(dc.NotificationError):
                dc.announce(RELEASE, 'https://example.com/', WEBHOOK, 'owner/repo', 'token', SHA)
            self.assertEqual(api.call_count, 1)

    def test_cdn_delay_can_recover_before_any_message_is_sent(self):
        with patch.object(dc, 'github_call', return_value=None), patch.object(dc, 'live_matches', side_effect=[False, True]) as live, patch.object(dc.time, 'sleep') as sleep, patch.object(dc, 'discord_send', return_value='123') as send:
            dc.announce(RELEASE, 'https://example.com/', WEBHOOK, 'owner/repo', 'token', SHA)
            self.assertEqual(live.call_count, 2);sleep.assert_called_once_with(5);send.assert_called_once()

    def test_marker_failure_warns_against_duplicate_retry(self):
        with patch.object(dc, 'github_call', side_effect=[None, dc.NotificationError('denied')]), patch.object(dc, 'live_matches', return_value=True), patch.object(dc, 'discord_send', return_value='123') as send:
            with self.assertRaisesRegex(dc.NotificationError, 'Do not rerun'):
                dc.announce(RELEASE, 'https://example.com/', WEBHOOK, 'owner/repo', 'token', SHA)
            self.assertEqual(send.call_count, 1)

    def test_live_check_compares_exact_bytes_and_checksum(self):
        with patch.object(dc.request, 'urlopen', side_effect=lambda *a, **k: io.BytesIO(b'game')):
            self.assertTrue(dc.live_matches(RELEASE, 'https://example.com/'))
        with patch.object(dc.request, 'urlopen', side_effect=lambda *a, **k: io.BytesIO(b'fake')):
            self.assertFalse(dc.live_matches(RELEASE, 'https://example.com/'))

    def test_multipart_has_full_notes_and_confirmed_message_id(self):
        payload, notes, _ = dc.release_payload(RELEASE, 'https://example.com/')
        def respond(req, **kwargs):
            self.assertEqual(req.get_method(), 'POST')
            self.assertIn(b'name="files[0]"', req.data)
            self.assertIn(notes.encode('utf-8'), req.data)
            self.assertIn(b'"allowed_mentions": {"parse": []}', req.data)
            return io.BytesIO(b'{"id":"123"}')
        with patch.object(dc.request, 'urlopen', side_effect=respond):
            self.assertEqual(dc.discord_send(dc.webhook_address(WEBHOOK), payload, notes), '123')

    def test_http_errors_do_not_expose_webhook_token(self):
        payload, notes, _ = dc.release_payload(RELEASE, 'https://example.com/')
        with patch.object(dc.request, 'urlopen', side_effect=HTTPError(WEBHOOK, 429, 'private URL', {}, io.BytesIO())), self.assertRaises(dc.NotificationError) as caught:
            dc.discord_send(dc.webhook_address(WEBHOOK), payload, notes)
        self.assertNotIn('test-private-token', str(caught.exception))
        self.assertIn('429', str(caught.exception))

    def test_forum_rejection_retries_with_one_version_post(self):
        payload, notes, _ = dc.release_payload(RELEASE, 'https://example.com/')
        calls = []
        def respond(req, **kwargs):
            calls.append(req)
            if len(calls) == 1:
                raise HTTPError(WEBHOOK, 400, 'forum needs title', {}, io.BytesIO(b'{"code":220001}'))
            self.assertIn(b'"thread_name": "Elyndor', req.data)
            self.assertIn(notes.encode('utf-8'), req.data)
            return io.BytesIO(b'{"id":"123"}')
        with patch.object(dc.request, 'urlopen', side_effect=respond):
            self.assertEqual(dc.discord_send(dc.webhook_address(WEBHOOK), payload, notes), '123')
        self.assertEqual(len(calls), 2)
        self.assertNotIn('thread_name', payload)

    def test_other_http_errors_never_retry_a_post(self):
        payload, notes, _ = dc.release_payload(RELEASE, 'https://example.com/')
        for status, code in [(400,50035),(500,220001)]:
            with self.subTest(status=status,code=code), patch.object(dc.request, 'urlopen', side_effect=HTTPError(WEBHOOK,status,'rejected',{},io.BytesIO(json.dumps({'code':code}).encode()))) as send, self.assertRaises(dc.NotificationError):
                dc.discord_send(dc.webhook_address(WEBHOOK), payload, notes)
            self.assertEqual(send.call_count, 1)

    def test_forum_retry_cannot_loop_or_override_existing_thread(self):
        payload, notes, _ = dc.release_payload(RELEASE, 'https://example.com/')
        for url, data in [(dc.webhook_address(WEBHOOK),{**payload,'thread_name':'Already named'}),(dc.webhook_address(WEBHOOK+'?thread_id=456'),payload)]:
            with self.subTest(url=url), patch.object(dc.request, 'urlopen', side_effect=HTTPError(WEBHOOK,400,'rejected',{},io.BytesIO(b'{"code":220001}'))) as send, self.assertRaises(dc.NotificationError):
                dc.discord_send(url, data, notes)
            self.assertEqual(send.call_count, 1)

    def test_missing_secret_makes_no_network_requests(self):
        with patch.dict(dc.os.environ, {'DISCORD_WEBHOOK_URL': ''}), patch.object(dc.request, 'urlopen') as network, patch.object(dc.sys, 'argv', ['discord_changelog.py']), patch('builtins.print'):
            self.assertEqual(dc.entry(), 0)
            network.assert_not_called()


if __name__ == '__main__':
    unittest.main()
