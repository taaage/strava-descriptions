# Strava AI Descriptions

Automatically generate AI-powered descriptions for your Strava activities using webhooks.

Frontend lives in [portfolio-client](https://github.com/taaage/portfolio-client) at `/strava`.

## Project Structure

```
app/
├── api/
│   └── webhook/
│       └── route.ts          # Webhook endpoint (GET for verification, POST for events)
├── services/
│   ├── strava.service.ts     # Strava API (token refresh, get/update activities)
│   └── ai.service.ts         # Gemini AI description generation
└── config/
    └── constants.ts          # API URLs and app config
```

## Setup

### 1. Create Strava API Application

1. Go to https://www.strava.com/settings/api
2. Create a new app
3. Set **Authorization Callback Domain** to your deployment domain
4. Save your **Client ID** and **Client Secret**

### 2. Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"

### 3. Deploy to Vercel

```bash
npx vercel --prod
```

### 4. Set Environment Variables

```bash
vercel env add STRAVA_CLIENT_ID
vercel env add STRAVA_CLIENT_SECRET
vercel env add STRAVA_REFRESH_TOKEN
vercel env add STRAVA_VERIFY_TOKEN
vercel env add GEMINI_API_KEY
```

### 5. Subscribe to Strava Webhooks

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=YOUR_CLIENT_ID \
  -F client_secret=YOUR_CLIENT_SECRET \
  -F callback_url=https://your-app.vercel.app/api/webhook \
  -F verify_token=YOUR_VERIFY_TOKEN
```

## Customize

Edit the prompt in `app/services/ai.service.ts` to change the description style.

## Tech Stack

- Next.js API Routes
- Google Gemini AI
- Strava API
- Vercel
