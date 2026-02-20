import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${process.env.STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${request.nextUrl.origin}/api/auth/strava/callback&scope=activity:write,activity:read_all`;
  
  return NextResponse.redirect(authUrl);
}
