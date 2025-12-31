/**
 * Gemini AI Service
 * Handles communication with Google's Gemini AI
 */

import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "No Gemini API key found. Set VITE_GEMINI_API_KEY in environment variables."
  );
}

const genAI = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export interface GeminiResponse {
  text: string;
  isImage?: boolean;
  urls?: string[];
  navigationUrl?: string;
  canvasUpdate?: any;
}

export async function callGemini(
  prompt: string,
  settings: any
): Promise<GeminiResponse> {
  if (!genAI) {
    return {
      text: "⚠️ Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your environment variables.",
    };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: settings.model || "gemini-3-flash-preview",
      generationConfig: {
        temperature: settings.temperature || 0.7,
        maxOutputTokens: settings.maxTokens || 2048,
      },
    });

    const systemPrompt =
      settings.customPrompt || "You are a helpful AI assistant.";
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse response for special commands
    let navigationUrl: string | undefined;
    let canvasUpdate: any;

    // Check for navigation commands
    const navMatch = text.match(/NAVIGATE_TO:\s*(https?:\/\/[^\s]+)/i);
    if (navMatch) {
      navigationUrl = navMatch[1];
    }

    // Check for canvas updates
    const canvasMatch = text.match(/CANVAS_UPDATE:\s*({[^}]+})/i);
    if (canvasMatch) {
      try {
        canvasUpdate = JSON.parse(canvasMatch[1]);
      } catch (e) {
        console.warn("Failed to parse canvas update:", e);
      }
    }

    return {
      text: text
        .replace(/NAVIGATE_TO:[^\n]*/gi, "")
        .replace(/CANVAS_UPDATE:[^\n]*/gi, "")
        .trim(),
      navigationUrl,
      canvasUpdate,
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      text: `❌ Error communicating with Gemini AI: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
