import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { iotsecureTools } from "./iotsecure-tools";

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

export async function chat(
  message: string,
  history: Array<{ role: string; content: string }>
) {
  const model = genAI.models.get("gemini-2.0-flash");

  const formattedHistory = history.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const chatSession = model.startChat({
    history: formattedHistory,
    systemInstruction: SYSTEM_PROMPT,
  });

  const result = await chatSession.sendMessage(message);
  return result.response.text();
}

export async function analyzeWithTools(prompt: string) {
  const model = genAI.models.get("gemini-2.0-flash");

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: iotsecureTools }],
  });

  return result.response;
}

export default { chat, analyzeWithTools };
