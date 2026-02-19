import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
    console.log("🚀 Gemini Function Started");

    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        console.log("📦 Event Body:", event.body?.substring(0, 100)); // Log first 100 chars

        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            console.error("❌ Invalid JSON:", e);
            throw new Error("Invalid JSON in request body");
        }

        const { prompt, image } = body;

        // Check Env Vars
        const stdKey = process.env.GEMINI_API_KEY;
        const viteKey = process.env.VITE_GEMINI_API_KEY;

        console.log(`🔑 Keys check - Standard: ${stdKey ? 'Present (' + stdKey.length + ' chars)' : 'Missing'}, VITE: ${viteKey ? 'Present (' + viteKey.length + ' chars)' : 'Missing'}`);

        // Fallback to VITE_ prefixed key if the standard one is missing
        const apiKey = stdKey || viteKey;

        if (!apiKey) {
            console.error("❌ Missing GEMINI_API_KEY (and VITE_GEMINI_API_KEY) in environment variables");
            return {
                statusCode: 500,
                body: JSON.stringify({
                    error: "Server Configuration Error: Missing API Key",
                    debug: { stdKeyExists: !!stdKey, viteKeyExists: !!viteKey }
                }),
            };
        }

        // Initialize Gemini
        console.log("🤖 Initializing Gemini Client...");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log(`running generation... image present: ${!!image}`);

        let result;
        if (image) {
            result = await model.generateContent([prompt, image]);
        } else {
            result = await model.generateContent(prompt);
        }

        const response = await result.response;
        const text = response.text();
        console.log("✅ Generation successful");

        return {
            statusCode: 200,
            body: JSON.stringify({ text }),
        };

    } catch (error) {
        console.error("🔥 Gemini Function Crash:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
                stack: error.stack,
                details: "Check Function Logs in Netlify Dashboard"
            }),
        };
    }
};
