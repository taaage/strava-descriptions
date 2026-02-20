import { GoogleGenerativeAI } from "@google/generative-ai";
import { APP_URL } from "../config/constants";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateDescription(activity: any): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Generate a short, roasty description for this Strava activity. Be savage and witty, but not mean.
      Take activity details into account and make fun of the cyclist's performance.
      
      Activity details:
      - Type: ${activity.type}
      - Distance: ${(activity.distance / 1000).toFixed(1)} km
      - Duration: ${Math.round(activity.moving_time / 60)} minutes
      - Average speed: ${(activity.average_speed * 3.6).toFixed(1)} km/h
      - Elevation gain: ${activity.total_elevation_gain} m
      
      Add a empty row at the bottom with a link in the final row: ${APP_URL}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("[AI ERROR]:", error);
    return `something went wrong... \n\n${APP_URL}`;
  }
}
