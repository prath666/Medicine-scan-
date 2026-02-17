import Groq from "groq-sdk";
import { getFromCache, saveToCache } from '../utils/cacheManager';
import { fetchMedicineDetailsFromGemini } from './geminiService';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("Missing VITE_GROQ_API_KEY in .env file");
}

const groq = new Groq({
    apiKey: GROQ_API_KEY,
    dangerouslyAllowBrowser: true,
});

export const fetchMedicineDetails = async (medicineName) => {
    if (!medicineName) return null;

    // Check cache first
    const cached = getFromCache(medicineName);
    if (cached) {
        return { ...cached, _cached: true };
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a medical information assistant API.
Your task is to provide accurate, educational information about medicines in strict JSON format.

OUTPUT FORMAT:
{
  "name": "Standardized Medicine Name",
  "category": "Pharmacological Category (e.g. Analgesic / Antipyretic)",
  "manufacturer": "Primary Manufacturer Name",
  "description": "A concise, plain-English summary of what the medicine is and how it works (max 2 sentences).",
  "uses": ["Use 1", "Use 2", "Use 3"],
  "sideEffects": ["Effect 1", "Effect 2", "Effect 3"],
  "warnings": ["Warning 1", "Warning 2", "Warning 3"],
  "dosage": "Standard adult dosage info (e.g. 500mg, 1-2 tablets every 6 hours)",
  "alternatives": {
    "generic": "Generic Composition Name",
    "similar": ["Similar Brand 1", "Similar Brand 2", "Similar Brand 3"]
  },
  "substitutes": ["Substitute 1", "Substitute 2", "Substitute 3"]
}

RULES:
1. Return ONLY the JSON object. No markdown, no "Here is the info", no wrapping.
2. If the medicine is not found or the query is invalid, return: {"error": true}
3. Ensure fields are strictly arrays or strings as defined.
4. Keep descriptions concise and simple.
5. Include critical safety warnings.
6. "substitutes" should list alternative brand names available in India.
7. "dosage" should be a brief string with standard adult dosage.
8. "manufacturer" should be the most well-known manufacturer of this medicine.`
                },
                {
                    role: "user",
                    content: `Provide details for the medicine: "${medicineName}"`
                }
            ],
            // Use 70b for detailed reliable medical info
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;

        if (!content) throw new Error("Empty content from Groq");

        const data = JSON.parse(content);

        // Check for error response
        if (data.error) throw new Error("Medicine not found in Groq");

        // Basic validation
        if (!data.name || !data.uses || !data.warnings) {
            throw new Error("Invalid data structure from Groq");
        }

        // Save to cache for future use
        saveToCache(medicineName, data);

        return data;
    } catch (error) {
        console.error("Groq API Failed:", error.message);

        // --- FALLBACK TO GEMINI ---
        const fallbackData = await fetchMedicineDetailsFromGemini(medicineName);

        if (fallbackData) {
            // Cache the fallback result too
            saveToCache(medicineName, fallbackData);
            return fallbackData; // Return Gemini data
        }

        return null; // Both failed
    }
};

export const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helpful medical autocomplete assistant.
          Return a JSON object with a "suggestions" array containing up to 5 medicine names that complete the user's query.
          Focus on common medicines available in India.
          Example Input: "Parac"
          Example Output: { "suggestions": ["Paracetamol", "Paracip", "Paracetamol 650", "Parawin", "Paracetol"] }
          Rules:
          1. Return ONLY JSON.
          2. No markdown.
          3. Array of strings only.`
                },
                {
                    role: "user",
                    content: `Suggest medicines starting with: "${query}"`
                }
            ],
            // Use 8b-instant for speed in autocomplete
            model: "llama-3.1-8b-instant",
            temperature: 0,
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) return [];
        const data = JSON.parse(content);
        return data.suggestions || [];
    } catch (error) {
        console.error("Groq Suggestion Error:", error);
        return [];
    }
};

// New function to extract specific medicine name from raw OCR text
export const extractMedicineName = async (rawText) => {
    if (!rawText) return null;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an expert OCR text cleaner for a pharmacy app.
          Your task is to extract the EXACT medicine name (brand or generic) from messy text.
          
          Rules:
          1. Ignore dosage (e.g., 500mg), packaging info, prices, or garbage characters.
          2. Return ONLY the medicine name as a plain string.
          3. If no medicine name is found, return "null".
          
          Example Input: "Cae 1 LEE AT 2 Zed Vitamin C 500mg r inc 5 mg"
          Example Output: Vitamin C`
                },
                {
                    role: "user",
                    content: `Extract medicine name from: "${rawText}"`
                }
            ],
            // Use 70b-versatile for higher intelligence in extraction (less hallucination)
            model: "llama-3.3-70b-versatile",
            temperature: 0,
        });

        const extractedName = completion.choices[0]?.message?.content?.trim();
        // Check for null string or empty
        if (extractedName && extractedName.toLowerCase() !== "null") {
            // Remove any surrounding quotes
            return extractedName.replace(/^["']|["']$/g, '');
        }
        return null;
    } catch (error) {
        console.error("Groq OCR Extraction Error:", error);
        return null;
    }
};
