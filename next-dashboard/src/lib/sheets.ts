import "server-only";

import { google } from "googleapis";

export type DashboardRow = {
  sender: string;
  company: string;
  subject: string;
  category: string;
  draft_reply: string;
};

const REQUIRED_COLUMNS = [
  "sender",
  "company",
  "subject",
  "category",
  "draft_reply",
] as const;

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function resolveServiceAccountCredentials(): ServiceAccountCredentials {
  const inlineJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (inlineJson) {
    const parsed = JSON.parse(inlineJson) as Partial<ServiceAccountCredentials>;
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_JSON must include client_email and private_key.",
      );
    }

    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key,
    };
  }

  return {
    client_email: getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL"),
    private_key: getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY"),
  };
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeCell(value: string | null | undefined): string {
  return (value ?? "").toString().trim();
}

export async function getDashboardRows(): Promise<DashboardRow[]> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  const range = process.env.GOOGLE_SHEETS_RANGE ?? "Sheet1!A:E";
  const credentials = resolveServiceAccountCredentials();

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({
    version: "v4",
    auth,
  });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  const values = (response.data.values ?? []) as string[][];

  if (values.length === 0) {
    return [];
  }

  const headerCandidate = values[0].map((cell) => normalizeHeader(cell));
  const hasHeader = REQUIRED_COLUMNS.every((column) =>
    headerCandidate.includes(column),
  );

  const rows = hasHeader ? values.slice(1) : values;
  const columnIndex = hasHeader
    ? Object.fromEntries(
        REQUIRED_COLUMNS.map((column) => [column, headerCandidate.indexOf(column)]),
      )
    : {
        sender: 0,
        company: 1,
        subject: 2,
        category: 3,
        draft_reply: 4,
      };

  return rows
    .map((row) => ({
      sender: normalizeCell(row[columnIndex.sender]),
      company: normalizeCell(row[columnIndex.company]),
      subject: normalizeCell(row[columnIndex.subject]),
      category: normalizeCell(row[columnIndex.category]) || "Uncategorized",
      draft_reply: normalizeCell(row[columnIndex.draft_reply]),
    }))
    .filter((row) => row.sender || row.company || row.subject || row.draft_reply);
}
