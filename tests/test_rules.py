import unittest

from email_bot.rules import ReplyRule, match_rule


class RulesTest(unittest.TestCase):
    def test_match_rule_with_subject_keyword(self) -> None:
        rules = [
            ReplyRule(
                name="pricing",
                subject_contains=["pricing"],
                body_contains=[],
                reply_subject="Pricing details",
                reply_body="Thanks for asking about pricing.",
            )
        ]

        matched = match_rule("Need pricing details", "Hello", rules)

        self.assertIsNotNone(matched)
        assert matched is not None
        self.assertEqual(matched.name, "pricing")

    def test_match_rule_requires_subject_and_body_when_both_set(self) -> None:
        rules = [
            ReplyRule(
                name="support",
                subject_contains=["support"],
                body_contains=["error"],
                reply_subject="Support acknowledgement",
                reply_body="We got your support request.",
            )
        ]

        self.assertIsNone(match_rule("support needed", "all good", rules))
        self.assertIsNotNone(match_rule("support needed", "seeing an error message", rules))


if __name__ == "__main__":
    unittest.main()

