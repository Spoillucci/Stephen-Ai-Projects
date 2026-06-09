from __future__ import annotations

import logging
import time

from .config import BotConfig
from .email_client import EmailClient
from .rules import load_rules, match_rule
from .state import StateStore

logger = logging.getLogger(__name__)


class EmailBot:
    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self.rules = load_rules(config.rules_file)
        self.state = StateStore(config.processed_state_file)
        self.state.load()

    def process_cycle(self) -> int:
        sent_count = 0
        handled_uids: list[str] = []

        with EmailClient(self.config) as client:
            unread_messages = client.fetch_unread(self.config.max_emails_per_cycle)
            logger.info("Fetched %s unread email(s).", len(unread_messages))

            for message in unread_messages:
                if self.state.has_processed(message.uid):
                    continue

                rule = match_rule(message.subject, message.body, self.rules)
                if rule is None:
                    logger.info("No rule matched email UID=%s subject=%r", message.uid, message.subject)
                    continue

                reply_subject = f"{self.config.subject_prefix} {rule.reply_subject}".strip()
                if self.config.dry_run:
                    logger.info(
                        "[DRY RUN] Matched rule '%s' for UID=%s -> would send to %s",
                        rule.name,
                        message.uid,
                        message.from_address,
                    )
                else:
                    client.send_reply(
                        recipient=message.from_address,
                        subject=reply_subject,
                        body=rule.reply_body,
                        in_reply_to=message.message_id,
                    )
                    sent_count += 1
                    logger.info("Sent reply using rule '%s' for UID=%s", rule.name, message.uid)

                self.state.mark_processed(message.uid)
                handled_uids.append(message.uid)

            if handled_uids:
                client.mark_as_seen(handled_uids)

        self.state.save()
        return sent_count

    def run_forever(self) -> None:
        logger.info("Starting email bot. Poll interval: %s second(s)", self.config.poll_interval_seconds)
        while True:
            try:
                self.process_cycle()
            except Exception:  # noqa: BLE001
                logger.exception("Bot cycle failed. Retrying on next interval.")
            time.sleep(self.config.poll_interval_seconds)

