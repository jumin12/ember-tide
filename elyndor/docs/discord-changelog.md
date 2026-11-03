# Automatic Discord changelogs

The `Discord changelog` GitHub Action reads the published commit's `release.json` after a successful GitHub Pages build. It checks that the live HTML has exactly the release's byte count and SHA-256 before sending. The Discord message contains the version, change bullets, a Play link and a link to the release history. It sends no file attachments, including TXT or Markdown documents. Long changelogs show complete bullets that fit in the message and link to the complete history on GitHub.

## One-time setup

1. In Discord, open **Server Settings → Integrations → Webhooks → New Webhook**. Choose the channel for game updates, give the webhook a name/avatar, and copy its URL. You need permission to manage webhooks for that channel.
2. Open [this repository's Actions secrets settings](https://github.com/jumin12/ember-tide/settings/secrets/actions). Choose **New repository secret**, name it `DISCORD_WEBHOOK_URL`, paste the webhook URL as its value, and save.
3. Future successful game deployments announce automatically. To announce the current version once, open [GitHub Actions](https://github.com/jumin12/ember-tide/actions), select **Discord changelog**, then **Run workflow** on `main`.

Keep the URL in the GitHub secret; it is the credential that permits posting to that channel. It does not belong in `index.html`, source files or chat. No bot account or paid service is required.

## Publishing and duplicate protection

- Give each game update a new `release.json.version` and populate `changes`. The existing game release generators already do this.
- Metadata-only commits at the same version do not create another announcement.
- The workflow records confirmed versions with `discord-announced/<version>-<hash>` Git tags. These are delivery receipts, not game release tags; they do not modify the `main` branch or trigger another Pages build.
- Only `main` can announce. Failed builds, superseded live files and missing webhook configuration do not send a message. Missing configuration is reported in the Actions log.
- Automatic mentions are disabled, so text in the changelog will not ping users, roles or everyone.
- Text channels receive a message. Forum channels receive one titled post for each version. The sender recognizes Discord's explicit forum-title rejection and resubmits with the version title; it never retries an ambiguous delivery. A webhook URL with `thread_id` instead targets that existing forum post.
- If the webhook's channel changes, future versions go to the new channel; previously announced versions remain marked.

The workflow requires `contents: write` solely to save its delivery receipt. Its dependency is pinned to the verified official checkout v7.0.1 release commit. Jobs are serialized to prevent simultaneous announcements of the same version.

## Checking or retrying

An Actions failure does not change whether the game itself is live. Inspect the notification job's log. A Discord error leaves the receipt unset, allowing a later retry. If a request times out, check the channel before rerunning: the server may have accepted the message before the connection failed.

If the log says Discord confirmed delivery but the marker failed, do not rerun immediately. A repository maintainer should create the indicated `refs/tags/discord-announced/...` receipt at the job's published commit using GitHub's Git references API, after confirming the message in the channel. Deleting a receipt permits that version to post again and should be intentional.

Local preview, without sending anything:

```powershell
python elyndor/tools/discord_changelog.py --dry-run
python -m unittest discover -s elyndor/tools -p test_discord_changelog.py
```

The local preview files are `output/elyndor/discord-changelog/payload.json` and `changelog.md`; the Markdown file is for local review and is never uploaded to Discord. Tests mock the network; they do not send Discord messages or create Git tags.

References: [Discord webhooks](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks), [GitHub Pages workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#page_build), [GitHub Actions secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets).
