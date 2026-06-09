"use client";

import { useEffect, useMemo, useState } from "react";

type DashboardRow = {
  sender: string;
  company: string;
  subject: string;
  category: string;
  draft_reply: string;
};

type ProfilePayload = {
  sender: string;
  company: string;
  data: unknown;
};

export default function Home() {
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRows() {
      setLoadingRows(true);
      setRowsError(null);

      try {
        const response = await fetch("/api/messages", { cache: "no-store" });
        const payload = (await response.json()) as {
          rows?: DashboardRow[];
          error?: string;
        };

        if (!response.ok || !payload.rows) {
          throw new Error(payload.error ?? "Failed to load sheet rows.");
        }

        setRows(payload.rows);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error loading rows.";
        setRowsError(message);
      } finally {
        setLoadingRows(false);
      }
    }

    loadRows();
  }, []);

  const groupedRows = useMemo(() => {
    return rows.reduce<Record<string, DashboardRow[]>>((groups, row) => {
      const key = row.category || "Uncategorized";
      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(row);
      return groups;
    }, {});
  }, [rows]);

  async function handleSenderClick(row: DashboardRow) {
    setLoadingProfile(true);
    setProfileError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: row.sender,
          company: row.company,
        }),
      });

      const payload = (await response.json()) as {
        profile?: unknown;
        error?: string;
      };

      if (!response.ok || payload.profile === undefined) {
        throw new Error(payload.error ?? "Failed to load sender profile.");
      }

      setProfile({
        sender: row.sender,
        company: row.company,
        data: payload.profile,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error loading profile.";
      setProfileError(message);
    } finally {
      setLoadingProfile(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Inbox Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Messages grouped by category from Google Sheets.
        </p>
      </header>

      {loadingRows ? (
        <p className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          Loading rows...
        </p>
      ) : null}

      {rowsError ? (
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {rowsError}
        </p>
      ) : null}

      {!loadingRows && !rowsError ? (
        <section className="grid gap-6">
          {rows.length === 0 ? (
            <p className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
              No rows were found in the configured sheet range.
            </p>
          ) : null}
          {Object.entries(groupedRows).map(([category, categoryRows]) => (
            <div
              key={category}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <h2 className="text-xl font-semibold">{category}</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {categoryRows.map((row, index) => (
                  <article
                    key={`${row.sender}-${row.company}-${index}`}
                    className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                  >
                    <button
                      type="button"
                      onClick={() => handleSenderClick(row)}
                      className="text-left text-lg font-semibold text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
                    >
                      {row.sender}
                    </button>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {row.company}
                    </p>
                    <p className="mt-3 text-sm font-medium">{row.subject}</p>
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      Draft reply: {row.draft_reply || "N/A"}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-xl font-semibold">Sender Profile</h2>
        {loadingProfile ? <p className="mt-3 text-sm">Loading profile...</p> : null}
        {profileError ? (
          <p className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {profileError}
          </p>
        ) : null}
        {!loadingProfile && !profileError && profile ? (
          <div className="mt-3 rounded-md border border-zinc-200 p-4 dark:border-zinc-700">
            <p className="font-semibold">
              {profile.sender} ({profile.company})
            </p>
            <pre className="mt-3 overflow-x-auto rounded bg-zinc-100 p-3 text-xs dark:bg-zinc-900">
              {JSON.stringify(profile.data, null, 2)}
            </pre>
          </div>
        ) : null}
        {!loadingProfile && !profileError && !profile ? (
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
            Click a sender to fetch and display their profile.
          </p>
        ) : null}
      </section>
    </main>
  );
}
