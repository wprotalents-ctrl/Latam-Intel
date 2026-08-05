// api/_lib/gemini.ts
// AI Studio SDK — replaced @google/genai (unified SDK that requires
// Vertex AI service account) with @google/generative-ai (AI Studio
// direct). Now accepts an API key directly without ADC.
import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

let client: GoogleGenerativeAI | null = null;
let clientKey: string | null = null;
let cachedModel: GenerativeModel | null = null;
let cachedModelName: string | null = null;

export function getGemini(overrideKey?: string): GenerativeModel {
  const key = overrideKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY is missing');

  if (!client || clientKey !== key) {
    clientKey = key;
    client = new GoogleGenerativeAI(key);
    cachedModel = null; // force re-fetch on new key
  }

  // Default model — flast-lite is the cheapest + fastest for short briefs.
  if (!cachedModel || cachedModelName !== GEMINI_FLASH_L) {
    cachedModelName = GEMINI_FLASH_L;
    cachedModel = client.getGenerativeModel({ model: GEMINI_FLASH_L });
  }

  return cachedModel;
}

// Model names that actually work with the AI Studio API as of 2026-08:
// - gemini-2.0-flash-lite is the cheapest/fastest for brief generation
// - gemini-2.0-flash is the workhorse
// - gemini-1.5-flash is the legacy fallback (still works)
export const GEMINI_FLASH = 'gemini-2.0-flash';
export const GEMINI_FLASH_L = 'gemini-2.0-flash-lite';
