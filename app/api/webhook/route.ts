import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
      const accessToken = await getAccessToken();
      
      if (accessToken) {
        await updateActivityDescription(activityId, accessToken);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function getAccessToken(): Promise<string | null> {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (!refreshToken) return null;

  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  return data.access_token;
}

async function updateActivityDescription(
  activityId: number,
  accessToken: string,
) {
  const activity = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  ).then((r) => r.json());

  const description = await generateDescription(activity);

  await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description }),
  });
}

async function generateDescription(activity: any): Promise<string> {
  const distance = (activity.distance / 1000).toFixed(2);
  const duration = Math.round(activity.moving_time / 60);
  const pace = activity.average_speed
    ? (1000 / 60 / activity.average_speed).toFixed(2)
    : "N/A";

  const prompt = `Generate a short, sarcastic description for this Strava activity. Please roast me and use cycling wording properly. Add a empty row at the bottom with a link in the final row: https://strava-descriptions.vercel.app:
- Type: ${activity.type}
- Distance: ${distance}km
- Duration: ${duration} minutes
- Pace: ${pace} min/km
- Elevation gain: ${activity.total_elevation_gain}m

Keep it under 200 characters and make it motivational.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 100,
  });

  return completion.choices[0].message.content || `${activity.type} - ${distance}km`;
}
