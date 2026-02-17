import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ Missing VITE_GEMINI_API_KEY in .env file!");
} else {
    console.log("✅ Gemini API Key loaded successfully");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Using latest stable Gemini 2.5 Flash model
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Translates medicine details JSON into the target language using Gemini Flash.
 * @param {Object} medicineData - The original medicine data object.
 * @param {string} targetLanguage - The language to translate into (e.g. "Hindi", "Tamil").
 * @returns {Promise<Object|null>} - Translated medicine data or null on failure.
 */
export const translateMedicineDetails = async (medicineData, targetLanguage) => {
    if (!medicineData || !targetLanguage || targetLanguage === 'English') {
        return medicineData;
    }

    if (!GEMINI_API_KEY) {
        console.error("❌ Cannot translate: No Gemini API key found");
        return null;
    }

    console.log(`🌐 Translating to ${targetLanguage}...`);

    try {
        const prompt = `You are a medical translation assistant. Translate the following medicine information into ${targetLanguage}.

IMPORTANT RULES:
1. Return ONLY a valid JSON object. No markdown, no code fences, no extra text whatsoever.
2. Keep the medicine brand name "${medicineData.name}" EXACTLY as-is (do NOT translate brand names).
3. Keep manufacturer name as-is.
4. Translate these fields: description, uses, sideEffects, warnings, dosage, category.
5. Keep the same JSON structure and field names in English.
6. Substitutes and alternative brand names should NOT be translated.
7. Make translations natural and easy to understand for a common person.

Here is the medicine data to translate:
${JSON.stringify(medicineData, null, 2)}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log("📝 Raw Gemini response:", responseText.substring(0, 200) + "...");

        // Clean up response — remove markdown code fences if present
        const cleanedText = responseText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .trim();

        const translatedData = JSON.parse(cleanedText);

        // Ensure brand name is preserved
        translatedData.name = medicineData.name;

        console.log("✅ Translation successful!");
        return translatedData;
    } catch (error) {
        console.error("❌ Gemini Translation Error:", error);
        console.error("Error details:", error?.message);
        if (error?.response) {
            console.error("API Response:", error.response);
        }
        return null;
    }
};
// Fallback function to fetch medicine details if Groq fails
export const fetchMedicineDetailsFromGemini = async (medicineName) => {
    if (!medicineName) return null;

    console.log(`⚠️ Switching to Gemini Fallback for: ${medicineName}`);

    try {
        const prompt = `You are a medical information assistant. Provide details for the medicine "${medicineName}" in strict JSON format.

OUTPUT FORMAT:
{
  "name": "Standardized Medicine Name",
  "category": "Pharmacological Category",
  "manufacturer": "Manufacturing Company",
  "description": "Concise summary of what it is (max 2 sentences).",
  "uses": ["Use 1", "Use 2", "Use 3"],
  "sideEffects": ["Effect 1", "Effect 2", "Effect 3"],
  "warnings": ["Warning 1", "Warning 2", "Warning 3"],
  "dosage": "Standard adult dosage",
  "alternatives": {
    "generic": "Generic Composition Name",
    "similar": ["Brand 1", "Brand 2"]
  },
  "substitutes": ["Sub 1", "Sub 2"]
}

RULES:
1. Return ONLY valid JSON.
2. If medicine not found, return {"error": true}.
3. "substitutes" should be Indian brands if available.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean up response
        const cleanedText = responseText
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .trim();

        const data = JSON.parse(cleanedText);

        if (data.error) return null;

        return data;
    } catch (error) {
        console.error("❌ Gemini Fallback Error:", error);
        return null;
    }
};
