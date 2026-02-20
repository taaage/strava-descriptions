# Strava AI Descriptions

Automatically generate AI-powered descriptions for your Strava activities using webhooks.

## Project Structure

```
app/
├── api/
│   └── webhook/
│       └── route.ts          # Handles HTTP requests, calls services
├── services/
│   ├── strava.service.ts     # Strava API calls (token refresh, activity updates)
│   └── ai.service.ts         # AI description generation
└── config/
    └── constants.ts          # Configuration values
```

## Setup

### 1. Create Strava API Application

1. Go to https://www.strava.com/settings/api
2. Create a new app
3. Set **Authorization Callback Domain** to your deployment domain (e.g., `your-app.vercel.app`)
4. Save your **Client ID** and **Client Secret**

### 2. Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (completely free, no credit card needed)

### 3. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### 4. Set Environment Variables

In Vercel dashboard or via CLI:

```bash
vercel env add STRAVA_CLIENT_ID
vercel env add STRAVA_CLIENT_SECRET
vercel env add STRAVA_VERIFY_TOKEN  # Any random string
vercel env add GEMINI_API_KEY
```

### 5. Get Strava Refresh Token

1. Visit `https://your-app.vercel.app/api/auth/strava`
2. Authorize the app
3. Copy the `refresh_token` from the response
4. Add it to Vercel:

```bash
vercel env add STRAVA_REFRESH_TOKEN
```

### 6. Subscribe to Strava Webhooks

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://your-app.vercel.app/api/webhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

### 7. Test

Upload a new activity to Strava and watch the AI-generated description appear!

## Customize

Edit the prompt in `app/services/ai.service.ts` to change the description style.

Update the app URL in `app/config/constants.ts`.

## Tech Stack

- Next.js API Routes
- Google Gemini AI (free)
- Strava API
- Vercel (free hosting)
