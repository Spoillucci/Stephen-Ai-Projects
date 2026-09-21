#!/usr/bin/env bash
set -euo pipefail

# Install Node dependencies when the Next.js dashboard is present on the
# checked-out branch. Other products (email bot, static dashboard) have no
# third-party dependencies.
if [[ -f next-dashboard/package.json ]]; then
  (
    cd next-dashboard
    if [[ -f package-lock.json ]]; then
      npm ci
    else
      npm install
    fi
  )
fi
