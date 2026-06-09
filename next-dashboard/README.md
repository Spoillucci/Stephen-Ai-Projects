# Google Sheets Inbox Dashboard

This app reads rows from Google Sheets and displays them as cards grouped by
category. Clicking a sender posts `{ sender, company }` to a webhook and
renders the returned JSON as a profile card.

## Required Sheet Columns

The sheet should contain these columns:

- `sender`
- `company`
- `subject`
- `category`
- `draft_reply`

If the first row is a header containing those names, the app uses header-based
mapping. Otherwise it falls back to fixed column order (A-E).

## Environment Variables

Create `.env.local` in this `next-dashboard` directory:

```bash
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SHEETS_RANGE=Sheet1!A:E
WEBHOOK_URL=https://example.com/your-webhook

# Option A (recommended): entire service account JSON in one var
GOOGLE_SERVICE_ACCOUNT_JSON={"client_email":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"}

# Option B: split credentials
# GOOGLE_SERVICE_ACCOUNT_EMAIL=...
# GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

- `GET /api/messages` - reads rows from Google Sheets
- `POST /api/profile` - forwards sender + company to webhook and returns JSON
