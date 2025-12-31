import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
export async function callGemini(
  prompt: string,
  settings: { customPrompt?: string; temperature?: number; model?: string }
) {
  try {
    const model = genAI.models.get(
      settings.model || "gemini-2.5-flash-preview-05-20"
    );
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${
                settings.customPrompt || SYSTEM_PROMPT
              }\n\nUser: ${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: settings.temperature || 0.7,
        maxOutputTokens: 4096,
      },
    });
    return {
      text: response.text || "Couldn't generate response.",
      isImage: false,
    };
  } catch (error) {
    return { text: "Error processing request.", isImage: false };
  }
}
