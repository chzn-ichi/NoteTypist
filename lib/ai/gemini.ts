import { GoogleGenAI } from "@google/genai";

// Every AI call in the app goes through this one function.
export async function generateText({
  system,
  prompt,
  json = false,
}: {
  system: string;
  prompt: string;
  json?: boolean;
}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to .env.local and restart the server.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL ?? "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      systemInstruction: system,
      temperature: json ? 0.2 : 0.4,
      ...(json ? { responseMimeType: "application/json" } : {}),
    },
  });

  const text = response.text;
  if (!text) throw new Error("The AI returned an empty answer.");
  return text;
}