
import Groq from "groq-sdk";

// Fallback to VITE_ prefixed key if the standard one is missing
const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

const groq = new Groq({
    apiKey: apiKey,
});

export const handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { type, data } = JSON.parse(event.body);

        if (type === 'details') {
            const { medicineName } = data;
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a medical information assistant API.
Your task is to provide accurate, educational information about medicines in strict JSON format.

OUTPUT FORMAT:
{
  "name": "Standardized Medicine Name",
  "category": "Pharmacological Category",
  "manufacturer": "Manufacturing Company",
  "description": "Concise summary (max 2 sentences).",
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
1. Return ONLY the JSON object.
2. If medicine not found, return: {"error": true}
3. "substitutes" should be Indian brands.
4. "manufacturer" should be the most well-known manufacturer.`
                    },
                    {
                        role: "user",
                        content: `Provide details for the medicine: "${medicineName}"`
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0,
                response_format: { type: "json_object" },
            });

            return {
                statusCode: 200,
                body: JSON.stringify(JSON.parse(completion.choices[0]?.message?.content || "{}")),
            };
        }

        else if (type === 'suggestions') {
            const { query } = data;
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are a helpful medical autocomplete assistant.
          Return a JSON object with a "suggestions" array containing up to 5 medicine names.
          Focus on common medicines available in India.
          Rules: Return ONLY JSON. Array of strings only.`
                    },
                    {
                        role: "user",
                        content: `Suggest medicines starting with: "${query}"`
                    }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0,
                response_format: { type: "json_object" },
            });

            return {
                statusCode: 200,
                body: JSON.stringify(JSON.parse(completion.choices[0]?.message?.content || "{}")),
            };
        }

        else if (type === 'extract') {
            const { rawText } = data;
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: `You are an expert OCR text cleaner.
          Extract the EXACT medicine name (brand or generic) from messy text.
          Rules:
          1. Ignore dosage, packaging info, prices, or garbage.
          2. Return ONLY the medicine name as a plain string.
          3. If no medicine name is found, return "null".`
                    },
                    {
                        role: "user",
                        content: `Extract medicine name from: "${rawText}"`
                    }
                ],
                model: "llama-3.3-70b-versatile",
                temperature: 0,
            });

            const extractedName = completion.choices[0]?.message?.content?.trim();
            return {
                statusCode: 200,
                body: JSON.stringify({ extractedName }),
            };
        }

        return { statusCode: 400, body: "Invalid request type" };

    } catch (error) {
        console.error("Groq Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
