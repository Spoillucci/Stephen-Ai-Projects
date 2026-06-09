from __future__ import annotations

import argparse
import logging

from email_bot.bot import EmailBot
from email_bot.config import BotConfig


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Rule-based email auto-reply bot.")
    parser.add_argument("--once", action="store_true", help="Run one polling cycle and exit.")
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        help="Logging level.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )

    config = BotConfig.from_env()
    bot = EmailBot(config)

    if args.once:
        sent = bot.process_cycle()
        logging.getLogger(__name__).info("Cycle complete. Sent %s reply/replies.", sent)
        return

    bot.run_forever()


if __name__ == "__main__":
    main()

