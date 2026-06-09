import { NextRequest, NextResponse } from "next/server";

type ProfileLookupBody = {
  sender?: string;
  company?: string;
};

function getWebhookUrl(): string {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("Missing required environment variable: WEBHOOK_URL");
  }

  return webhookUrl;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ProfileLookupBody;
    const sender = body.sender?.trim();
    const company = body.company?.trim();

    if (!sender || !company) {
      return NextResponse.json(
        { error: "Both sender and company are required." },
        { status: 400 },
      );
    }

    const webhookResponse = await fetch(getWebhookUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, company }),
      cache: "no-store",
    });

    const contentType = webhookResponse.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await webhookResponse.json()
      : { raw: await webhookResponse.text() };

    if (!webhookResponse.ok) {
      return NextResponse.json(
        { error: "Webhook call failed.", details: payload },
        { status: 502 },
      );
    }

    return NextResponse.json({ profile: payload });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error while calling webhook.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
