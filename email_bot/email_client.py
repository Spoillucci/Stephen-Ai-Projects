from __future__ import annotations

from dataclasses import dataclass
from email.message import EmailMessage as OutgoingEmailMessage
from email import message_from_bytes
from email.header import decode_header, make_header
from email.utils import parseaddr
from typing import Iterable
import imaplib
import smtplib

from .config import BotConfig


@dataclass(frozen=True)
class IncomingEmail:
    uid: str
    from_address: str
    subject: str
    body: str
    message_id: str


def _decode_mime_header(value: str | None) -> str:
    if not value:
        return ""
    return str(make_header(decode_header(value)))


def _extract_text_body(email_message) -> str:
    if email_message.is_multipart():
        for part in email_message.walk():
            content_type = part.get_content_type()
            disposition = str(part.get("Content-Disposition", ""))
            if content_type == "text/plain" and "attachment" not in disposition.lower():
                payload = part.get_payload(decode=True) or b""
                charset = part.get_content_charset() or "utf-8"
                return payload.decode(charset, errors="replace")
        return ""

    payload = email_message.get_payload(decode=True) or b""
    charset = email_message.get_content_charset() or "utf-8"
    return payload.decode(charset, errors="replace")


class EmailClient:
    def __init__(self, config: BotConfig) -> None:
        self.config = config
        self._imap: imaplib.IMAP4_SSL | None = None
        self._smtp: smtplib.SMTP | None = None

    def connect(self) -> None:
        self._imap = imaplib.IMAP4_SSL(self.config.imap_host, self.config.imap_port)
        self._imap.login(self.config.email_username, self.config.email_password)
        self._imap.select(self.config.mailbox)

        self._smtp = smtplib.SMTP(self.config.smtp_host, self.config.smtp_port, timeout=30)
        self._smtp.ehlo()
        if self.config.smtp_starttls:
            self._smtp.starttls()
            self._smtp.ehlo()
        self._smtp.login(self.config.email_username, self.config.email_password)

    def close(self) -> None:
        if self._imap is not None:
            try:
                self._imap.close()
            except imaplib.IMAP4.error:
                pass
            self._imap.logout()
            self._imap = None

        if self._smtp is not None:
            self._smtp.quit()
            self._smtp = None

    def __enter__(self) -> "EmailClient":
        self.connect()
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def fetch_unread(self, limit: int) -> list[IncomingEmail]:
        if self._imap is None:
            raise RuntimeError("IMAP connection is not initialized.")

        status, data = self._imap.uid("search", None, "UNSEEN")
        if status != "OK":
            return []

        uids = data[0].decode("utf-8").split()
        selected_uids = uids[-limit:]
        messages: list[IncomingEmail] = []

        for uid in selected_uids:
            fetch_status, message_data = self._imap.uid("fetch", uid, "(RFC822)")
            if fetch_status != "OK" or not message_data or message_data[0] is None:
                continue

            raw_bytes = message_data[0][1]
            parsed = message_from_bytes(raw_bytes)
            from_address = parseaddr(parsed.get("From", ""))[1]
            subject = _decode_mime_header(parsed.get("Subject", ""))
            body = _extract_text_body(parsed)
            message_id = parsed.get("Message-ID", "")
            messages.append(
                IncomingEmail(
                    uid=uid,
                    from_address=from_address,
                    subject=subject,
                    body=body,
                    message_id=message_id,
                )
            )

        return messages

    def mark_as_seen(self, uids: Iterable[str]) -> None:
        if self._imap is None:
            raise RuntimeError("IMAP connection is not initialized.")

        for uid in uids:
            self._imap.uid("store", uid, "+FLAGS", "(\\Seen)")

    def send_reply(
        self,
        recipient: str,
        subject: str,
        body: str,
        *,
        in_reply_to: str = "",
    ) -> None:
        if self._smtp is None:
            raise RuntimeError("SMTP connection is not initialized.")

        message = OutgoingEmailMessage()
        message["From"] = self.config.email_username
        message["To"] = recipient
        message["Subject"] = subject
        if in_reply_to:
            message["In-Reply-To"] = in_reply_to
            message["References"] = in_reply_to
        message.set_content(body)

        self._smtp.send_message(message)

