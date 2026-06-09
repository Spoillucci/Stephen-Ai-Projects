# Email Bot Starter

Simple Python email bot that:

- checks unread emails from an IMAP mailbox,
- matches each email against keyword-based rules,
- sends automatic replies through SMTP,
- tracks processed message UIDs to avoid duplicate replies.

## Features

- Dry-run mode (enabled by default) so you can verify behavior safely.
- Rule-based auto-replies from a JSON file.
- Polling loop for continuous operation.
- One-shot mode for testing a single cycle.
- No third-party Python dependencies required.

## Project structure

- `main.py` - CLI entrypoint (`--once` supported)
- `email_bot/config.py` - environment-based configuration
- `email_bot/email_client.py` - IMAP/SMTP integration
- `email_bot/rules.py` - rule loading + matching logic
- `email_bot/state.py` - processed UID persistence
- `email_bot/bot.py` - orchestration logic
- `rules.example.json` - sample rules to customize
- `.env.example` - sample environment config

## 1) Configure environment variables

Copy `.env.example` into your own local env setup (shell export, `.env`, secret manager, etc.).

Required values:

- `IMAP_HOST`
- `SMTP_HOST`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`

Important defaults:

- `DRY_RUN=true` (recommended for first runs)
- `RULES_FILE=rules.example.json`
- `POLL_INTERVAL_SECONDS=60`

## 2) Edit your reply rules

Customize `rules.example.json` (or point `RULES_FILE` to another file):

```json
{
  "rules": [
    {
      "name": "support-request",
      "subject_contains": ["support", "help"],
      "body_contains": ["issue", "problem", "error"],
      "reply_subject": "We received your support request",
      "reply_body": "Hi,\n\nThanks for reaching out.\n\nBest,\nSupport Bot"
    }
  ]
}
```

Matching behavior:

- `subject_contains`: any listed keyword can match the email subject
- `body_contains`: any listed keyword can match the email body
- if both lists are provided, both subject and body conditions must match

## 3) Run the bot

Run one cycle:

```bash
python main.py --once
```

Run continuously:

```bash
python main.py
```

You can increase logs for debugging:

```bash
python main.py --once --log-level DEBUG
```

## 4) Move to live mode

After validating with dry run logs:

- set `DRY_RUN=false`
- run with `--once` first
- then run continuously

## Run tests

```bash
python -m unittest discover -s tests -v
```

## Safety notes

- Use a dedicated mailbox account for automation.
- Start with strict keywords to avoid accidental auto-replies.
- Keep `POLL_INTERVAL_SECONDS` conservative to reduce server load.