import tempfile
from pathlib import Path
import unittest

from email_bot.state import StateStore


class StateStoreTest(unittest.TestCase):
    def test_state_store_round_trip(self) -> None:
        with tempfile.TemporaryDirectory() as tmp_dir:
            state_file = Path(tmp_dir) / "state.json"
            state = StateStore(str(state_file))

            state.load()
            self.assertFalse(state.has_processed("100"))

            state.mark_processed("100")
            state.save()

            restored = StateStore(str(state_file))
            restored.load()
            self.assertTrue(restored.has_processed("100"))


if __name__ == "__main__":
    unittest.main()

