export default function Welcome() {
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.6",
      }}
    >
      <h1>🤖 Strava AI Descriptions</h1>
      <p>
        This app automatically generates AI-powered descriptions for your Strava
        activities using webhooks and Google Gemini.
      </p>

      <h2>How it works</h2>
      <ol>
        <li>You upload a new activity to Strava</li>
        <li>Strava sends a webhook notification</li>
        <li>AI analyzes your activity data</li>
        <li>A personalized description is added automatically</li>
      </ol>

      <h2>Features</h2>
      <ul>
        <li>Free and open source</li>
        <li>Powered by Google Gemini AI</li>
        <li>Customizable description prompts</li>
        <li>Easy deployment on Vercel</li>
      </ul>

      <p>
        <a
          href="https://github.com/taaage/strava-descriptions"
          style={{
            color: "#FC4C02",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          View on GitHub →
        </a>
      </p>
    </div>
  );
}
