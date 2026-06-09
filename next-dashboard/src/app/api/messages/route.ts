import { NextResponse } from "next/server";

import { getDashboardRows } from "@/lib/sheets";

export async function GET() {
  try {
    const rows = await getDashboardRows();
    return NextResponse.json({ rows });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error while reading Google Sheets.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
