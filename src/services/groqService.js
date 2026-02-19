
// Removed direct Groq SDK import to secure API key
// import Groq from "groq-sdk";
import { getFromCache, saveToCache } from '../utils/cacheManager';
import { fetchMedicineDetailsFromGemini } from './geminiService';

/**
 * Helper to call Netlify Groq Function
 */
const callGroqFunction = async (type, data) => {
    try {
        const response = await fetch('/.netlify/functions/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, data }),
        });

        if (!response.ok) {
            throw new Error(`Groq Function failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Groq Function Error (${type}):`, error);
        throw error;
    }
};

export const fetchMedicineDetails = async (medicineName) => {
    if (!medicineName) return null;

    // Check cache first
    const cached = getFromCache(medicineName);
    if (cached) {
        return { ...cached, _cached: true };
    }

    try {
        const data = await callGroqFunction('details', { medicineName });

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
        const data = await callGroqFunction('suggestions', { query });
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
        const { extractedName } = await callGroqFunction('extract', { rawText });

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

