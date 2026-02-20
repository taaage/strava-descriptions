import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  console.log('[WEBHOOK] Verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === process.env.STRAVA_VERIFY_TOKEN) {
    console.log('[WEBHOOK] Verification successful');
    return NextResponse.json({ 'hub.challenge': challenge });
  }
  console.log('[WEBHOOK] Verification failed');
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const event = await request.json();
  console.log('[WEBHOOK] Received event:', JSON.stringify(event, null, 2));

  if (event.object_type === 'activity' && event.aspect_type === 'create') {
    const athleteId = event.owner_id;
    const activityId = event.object_id;

    console.log('[WEBHOOK] New activity created:', { athleteId, activityId });

    const accessToken = await getAthleteToken(athleteId);
    
    if (accessToken) {
      console.log('[WEBHOOK] Access token found, updating activity...');
      await updateActivityDescription(activityId, accessToken);
    } else {
      console.log('[WEBHOOK] No access token found');
    }
  } else {
    console.log('[WEBHOOK] Ignoring event type:', event.object_type, event.aspect_type);
  }

  return NextResponse.json({ success: true });
}

async function getAthleteToken(athleteId: number): Promise<string | null> {
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;
  if (!refreshToken) return null;

  console.log('[TOKEN] Refreshing access token...');
  
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const data = await response.json();
  console.log('[TOKEN] New access token obtained');
  
  return data.access_token;
}

async function updateActivityDescription(activityId: number, accessToken: string) {
  console.log('[UPDATE] Fetching activity:', activityId);
  
  const activity = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  }).then(r => r.json());

  console.log('[UPDATE] Activity data:', { 
    type: activity.type, 
    distance: activity.distance, 
    moving_time: activity.moving_time 
  });

  const description = generateDescription(activity);
  console.log('[UPDATE] Generated description:', description);

  const response = await fetch(`https://www.strava.com/api/v3/activities/${activityId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ description })
  });

  const result = await response.json();
  console.log('[UPDATE] Update response:', response.status, result);
}

function generateDescription(activity: any): string {
  const distance = (activity.distance / 1000).toFixed(2);
  const duration = Math.round(activity.moving_time / 60);
  const pace = activity.average_speed ? (1000 / 60 / activity.average_speed).toFixed(2) : 'N/A';
  
  return `${activity.type} - ${distance}km in ${duration} minutes (${pace} min/km pace)`;
}
