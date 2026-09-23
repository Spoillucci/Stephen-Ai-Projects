# Gmail Inbox Manager → Google Sheets Task List

Skip the inbox. This Google Apps Script watches emails you are **tagged into** (CC, direct To, or a Gmail label), uses Gemini to extract **who**, **context**, and **what is requested**, and appends rows to a running Google Sheet you can work from all day.

## What you get

| Column | Description |
|--------|-------------|
| Received | When the email arrived |
| From | Sender |
| Subject | Email subject |
| Context | 1–2 sentence summary |
| Requested Action | What you need to do (or "None" for FYI) |
| Urgency | Low / Normal / High / Urgent |
| Deadline | Any date mentioned in the email |
| Status | Open, In Progress, Waiting, Done, Not Needed |
| Gmail Link | One-click back to the thread |

Processed threads get the `EA-Processed` label so they are not duplicated.

---

## Setup (about 15 minutes)

### 1. Create the task list spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**.
2. Name it something like `EA Task List`.
3. Copy the **Spreadsheet ID** from the URL:
   `https://docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`

### 2. Create a Gmail label + filter (what counts as “tagged in”)

This is how you control which emails become tasks.

1. In Gmail → **Settings** → **See all settings** → **Filters and Blocked Addresses** → **Create a new filter**.
2. Use criteria that match how you get pulled in. Common patterns:

   | Pattern | Filter criteria |
   |---------|-----------------|
   | CC'd on anything | `cc:me` |
   | Direct + CC | `to:me OR cc:me` |
   | Exec's inbox you monitor | `to:exec@company.com OR cc:you@company.com` |
   | Specific senders | `from:board@company.com OR from:investor@firm.com` |

3. Click **Create filter** → check **Apply the label** → create label **`EA-Inbox`** → **Create filter**.

> Tip: Start narrow (e.g. only `cc:me`) and widen once you trust the output.

### 3. Install the Apps Script

1. Open your spreadsheet → **Extensions** → **Apps Script**.
2. Delete any default code in `Code.gs`.
3. Paste the contents of [`Code.gs`](./Code.gs) from this folder.
4. In the left sidebar, click the **Project Settings** gear → under **Script Properties**, add:

   | Property | Value |
   |----------|-------|
   | `SPREADSHEET_ID` | Your spreadsheet ID from step 1 |
   | `GEMINI_API_KEY` | API key from [Google AI Studio](https://aistudio.google.com/apikey) |

5. Optional: edit `CONFIG.GMAIL_QUERY` at the top of `Code.gs` if you used a different label or search.

   Default:
   ```javascript
   GMAIL_QUERY: 'label:EA-Inbox is:unread',
   ```

### 4. Authorize and run

1. In Apps Script, select **`setup`** from the function dropdown → **Run**.
2. Approve permissions (Gmail read/modify, Sheets, external URL for Gemini).
3. Select **`testOnLatestEmail`** → **Run** to verify one email parses correctly.
4. Select **`processNewEmails`** → **Run** to backfill matching unread mail.

`setup` also creates a **15-minute time trigger** so new mail is picked up automatically.

### 5. Use the sheet as your command center

- Sort/filter by **Status = Open** and **Urgency**.
- Mark **Done** or **Not Needed** when finished.
- Use **Inbox Manager → Process new emails now** from the sheet menu for an immediate refresh.

---

## Customizing what gets captured

Edit `CONFIG` in `Code.gs`:

```javascript
const CONFIG = {
  GMAIL_QUERY: 'label:EA-Inbox is:unread',  // change search here
  SHEET_NAME: 'Task List',
  PROCESSED_LABEL: 'EA-Processed',
  BATCH_SIZE: 20,
  GEMINI_MODEL: 'gemini-2.0-flash',
};
```

**Example queries:**

```text
cc:me is:unread
label:EA-Inbox
to:me OR cc:me newer_than:3d
label:EA-Inbox (from:ceo@company.com OR from:board@company.com)
```

---

## Optional: Cursor Automation on top

If your team uses Cursor, you can add a **scheduled automation** (no repo) that posts a daily digest to Slack:

> Every weekday at 8am, read my EA Task List Google Sheet (via MCP or webhook), list all rows where Status = Open and Urgency is High or Urgent, and post a bullet summary to #exec-office.

That keeps the **sheet as source of truth** while pushing urgent items to Slack.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| No rows appearing | Confirm the Gmail filter applies `EA-Inbox`; run `testOnLatestEmail` |
| Duplicate rows | Ensure `EA-Processed` label is applied; don't remove Message ID column |
| Gemini errors | Check `GEMINI_API_KEY`; free tier has rate limits — lower `BATCH_SIZE` |
| Too much noise | Tighten the Gmail filter; exclude newsletters with `-from:noreply@` |
| Want attachments noted | Extend the prompt in `extractWithGemini_` to mention attachment names |

---

## Privacy

- Script runs entirely in **your** Google account.
- Email bodies are sent to **Google Gemini** for extraction (same as using AI in Workspace).
- No third-party services required beyond Google's APIs.
