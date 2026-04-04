import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

export function getGemini() {
  if (!client) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is missing");
    client = new GoogleGenAI({ apiKey: key });
  }
  return client;
}

// Correct model names — gemini-3.x does NOT exist
export const GEMINI_FLASH   = "gemini-2.0-flash";
export const GEMINI_FLASH_L = "gemini-2.0-flash-lite";
