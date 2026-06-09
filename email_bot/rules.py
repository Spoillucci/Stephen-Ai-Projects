from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ReplyRule:
    name: str
    subject_contains: list[str]
    body_contains: list[str]
    reply_subject: str
    reply_body: str


def _normalize_keywords(value: Any, field: str, rule_name: str) -> list[str]:
    if value is None:
        return []
    if not isinstance(value, list) or not all(isinstance(item, str) for item in value):
        raise ValueError(f"Rule '{rule_name}' has invalid '{field}'. Expected a list of strings.")
    return [item.strip().lower() for item in value if item.strip()]


def load_rules(file_path: str) -> list[ReplyRule]:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Rules file not found: {path}")

    payload = json.loads(path.read_text(encoding="utf-8"))
    rule_items = payload.get("rules")
    if not isinstance(rule_items, list):
        raise ValueError("Rules file must contain a top-level 'rules' list.")

    rules: list[ReplyRule] = []
    for raw_rule in rule_items:
        if not isinstance(raw_rule, dict):
            raise ValueError("Each rule must be an object.")

        name = str(raw_rule.get("name", "")).strip() or "unnamed-rule"
        reply_subject = str(raw_rule.get("reply_subject", "")).strip()
        reply_body = str(raw_rule.get("reply_body", "")).strip()

        if not reply_subject or not reply_body:
            raise ValueError(f"Rule '{name}' must include reply_subject and reply_body.")

        rules.append(
            ReplyRule(
                name=name,
                subject_contains=_normalize_keywords(raw_rule.get("subject_contains"), "subject_contains", name),
                body_contains=_normalize_keywords(raw_rule.get("body_contains"), "body_contains", name),
                reply_subject=reply_subject,
                reply_body=reply_body,
            )
        )

    return rules


def match_rule(subject: str, body: str, rules: list[ReplyRule]) -> ReplyRule | None:
    subject_text = subject.lower()
    body_text = body.lower()

    for rule in rules:
        subject_matches = not rule.subject_contains or any(
            keyword in subject_text for keyword in rule.subject_contains
        )
        body_matches = not rule.body_contains or any(keyword in body_text for keyword in rule.body_contains)
        if subject_matches and body_matches:
            return rule
    return None

