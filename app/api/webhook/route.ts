import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken, updateActivityDescription } from "@/app/services/strava.service";
import { generateDescription } from "@/app/services/ai.service";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.STRAVA_VERIFY_TOKEN) {
    return NextResponse.json({ "hub.challenge": challenge });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    if (event.object_type === "activity" && event.aspect_type === "create") {
      const activityId = event.object_id;
      const token = await refreshAccessToken();

      if (token) {
        const description = await generateDescription();
        await updateActivityDescription(activityId, token, description);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
