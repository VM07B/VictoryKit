import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export interface GeminiResponse {
  text: string;
  isImage?: boolean;
  urls?: string[];
  navigationUrl?: string;
  canvasUpdate?: {
    content: string;
    type: string;
    title: string;
  };
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

    const text =
      response.text || "I apologize, but I couldn't generate a response.";

    return {
      text,
      isImage: false,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      text: "I encountered an error processing your request. Please try again.",
      isImage: false,
    };
  }
}

export async function analyzeAttackPattern(
  pattern: string
): Promise<GeminiResponse> {
  const prompt = `Analyze this potential attack pattern and provide security recommendations:

Pattern: ${pattern}

Please provide:
1. Attack type classification
2. Severity assessment
3. Recommended WAF rule
4. Additional security measures`;

  return callGemini(prompt, { customPrompt: SYSTEM_PROMPT });
}

export async function generateWAFRules(
  description: string
): Promise<GeminiResponse> {
  const prompt = `Generate WAF rules based on this security requirement:

Requirement: ${description}

Please provide:
1. Recommended rule patterns (regex)
2. Target fields (URI, headers, body, etc.)
3. Action type (block, challenge, log)
4. Priority recommendation
5. Example attack patterns this would catch`;

  return callGemini(prompt, { customPrompt: SYSTEM_PROMPT });
}
