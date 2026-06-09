from __future__ import annotations

import json
from pathlib import Path


class StateStore:
    def __init__(self, file_path: str) -> None:
        self.path = Path(file_path)
        self._processed_uids: set[str] = set()

    def load(self) -> None:
        if not self.path.exists():
            self._processed_uids = set()
            return

        payload = json.loads(self.path.read_text(encoding="utf-8"))
        ids = payload.get("processed_uids", [])
        if not isinstance(ids, list):
            self._processed_uids = set()
            return
        self._processed_uids = {str(item) for item in ids}

    def save(self) -> None:
        serialized = {"processed_uids": sorted(self._processed_uids)}
        self.path.write_text(json.dumps(serialized, indent=2), encoding="utf-8")

    def has_processed(self, uid: str) -> bool:
        return uid in self._processed_uids

    def mark_processed(self, uid: str) -> None:
        self._processed_uids.add(uid)

