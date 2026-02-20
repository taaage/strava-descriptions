import { GoogleGenerativeAI } from "@google/generative-ai";
import { APP_URL } from "../config/constants";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateDescription(): Promise<string> {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Generate a short, sarcastic description for this Strava activity. 
      Please roast me and use cycling wording properly. 
      Keep it under 200 characters and make it motivational.
      Add a empty row at the bottom with a link in the final row: ${APP_URL}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("[AI ERROR]:", error);
    return `something went wrong... \n\n${APP_URL}`;
  }
}
