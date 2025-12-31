import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export interface GeminiResponse {
  text: string;
  isImage?: boolean;
  urls?: string[];
}

export async function callGemini(
  prompt: string,
  settings: { customPrompt?: string; temperature?: number; model?: string }
): Promise<GeminiResponse> {
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
      text: response.text || "I couldn't generate a response.",
      isImage: false,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      text: "Error processing request. Please try again.",
      isImage: false,
    };
  }
}
