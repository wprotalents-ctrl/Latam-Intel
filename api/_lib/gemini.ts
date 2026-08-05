import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;
let clientKey: string | null = null;

export function getGemini(overrideKey?: string) {
  const key = overrideKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is missing");
  // Rebuild client if the key changed (URL-override path)
  if (!client || clientKey !== key) {
    clientKey = key;
    client = new GoogleGenAI({ apiKey: key });
  }
  return client;
}

// Correct model names — gemini-3.x does NOT exist
export const GEMINI_FLASH   = "gemini-2.0-flash";
export const GEMINI_FLASH_L = "gemini-2.0-flash-lite";
