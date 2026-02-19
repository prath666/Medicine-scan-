import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { prompt, image } = JSON.parse(event.body);

        // Fallback to VITE_ prefixed key if the standard one is missing
        const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            console.error("❌ Missing GEMINI_API_KEY (and VITE_GEMINI_API_KEY) in environment variables");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Server Configuration Error: Missing API Key" }),
            };
        }

        // Initialize Gemini with server-side key
        const genAI = new GoogleGenerativeAI(apiKey);

        // Use standard 1.5 Flash model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let result;
        if (image) {
            console.log("Processing image request...");
            const result = await model.generateContent([prompt, image]);
            const response = await result.response;
            const text = response.text();

            return {
                statusCode: 200,
                body: JSON.stringify({ text }),
            };
        } else {
            console.log("Processing text request...");
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                statusCode: 200,
                body: JSON.stringify({ text }),
            };
        }

    } catch (error) {
        console.error("Gemini Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
