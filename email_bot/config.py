from __future__ import annotations

from dataclasses import dataclass
import os


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class BotConfig:
    imap_host: str
    imap_port: int
    smtp_host: str
    smtp_port: int
    email_username: str
    email_password: str
    mailbox: str
    poll_interval_seconds: int
    smtp_starttls: bool
    dry_run: bool
    rules_file: str
    processed_state_file: str
    max_emails_per_cycle: int
    subject_prefix: str

    @classmethod
    def from_env(cls) -> "BotConfig":
        imap_host = os.getenv("IMAP_HOST", "").strip()
        smtp_host = os.getenv("SMTP_HOST", "").strip()
        email_username = os.getenv("EMAIL_USERNAME", "").strip()
        email_password = os.getenv("EMAIL_PASSWORD", "").strip()

        missing = [
            name
            for name, value in {
                "IMAP_HOST": imap_host,
                "SMTP_HOST": smtp_host,
                "EMAIL_USERNAME": email_username,
                "EMAIL_PASSWORD": email_password,
            }.items()
            if not value
        ]
        if missing:
            joined = ", ".join(missing)
            raise ValueError(f"Missing required environment variables: {joined}")

        return cls(
            imap_host=imap_host,
            imap_port=int(os.getenv("IMAP_PORT", "993")),
            smtp_host=smtp_host,
            smtp_port=int(os.getenv("SMTP_PORT", "587")),
            email_username=email_username,
            email_password=email_password,
            mailbox=os.getenv("MAILBOX", "INBOX"),
            poll_interval_seconds=int(os.getenv("POLL_INTERVAL_SECONDS", "60")),
            smtp_starttls=_env_bool("SMTP_STARTTLS", default=True),
            dry_run=_env_bool("DRY_RUN", default=True),
            rules_file=os.getenv("RULES_FILE", "rules.example.json"),
            processed_state_file=os.getenv("PROCESSED_STATE_FILE", ".email_bot_state.json"),
            max_emails_per_cycle=int(os.getenv("MAX_EMAILS_PER_CYCLE", "10")),
            subject_prefix=os.getenv("SUBJECT_PREFIX", "Re:"),
        )

