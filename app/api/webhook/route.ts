import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    return NextResponse.json({ 'hub.challenge': challenge });
  }
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const event = await request.json();

  if (event.object_type === 'activity' && event.aspect_type === 'create') {
    const athleteId = event.owner_id;
    const activityId = event.object_id;

    // Get athlete's access token from your database
    const accessToken = await getAthleteToken(athleteId);
    
    if (accessToken) {
      await updateActivityDescription(activityId, accessToken);
    }
  }

  return NextResponse.json({ success: true });
}

async function getAthleteToken(athleteId: number): Promise<string | null> {
  return process.env.STRAVA_ACCESS_TOKEN || null;
}

async function updateActivityDescription(activityId: number, accessToken: string) {
  const activity = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  }).then(r => r.json());

  const description = generateDescription(activity);

  await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description })
  });
}

function generateDescription(activity: any): string {
  const distance = (activity.distance / 1000).toFixed(2);
  const duration = Math.round(activity.moving_time / 60);
  const pace = activity.average_speed ? (1000 / 60 / activity.average_speed).toFixed(2) : 'N/A';
  
  return `${activity.type} - ${distance}km in ${duration} minutes (${pace} min/km pace)`;
}
