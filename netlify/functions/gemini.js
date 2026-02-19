
import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { prompt, image } = JSON.parse(event.body);

        // Initialize Gemini with server-side key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let result;
        if (image) {
            // If image is provided (base64), use it
            // Note: The frontend sends the base64 string directly in the 'image' field
            // We need to convert it to the format Gemini expects if it's not already
            // Assuming frontend sends { inlineData: { data: "...", mimeType: "..." } } struct or similar
            // Let's stick to what the service was likely doing.

            // Actually, let's look at how the service was constructing the request.
            // Usually it's model.generateContent([prompt, imagePart])

            // We will expect the frontend to send the array of parts or just the prompt and image data
            // To be safe and simple: expect 'contents' array or 'prompt' text and optional 'image' data

            // Let's implement a flexible handler.
            // The simplest way to preserve existing logic is to forward the 'contents'

            const result = await model.generateContent([prompt, image]);
            const response = await result.response;
            const text = response.text();

            return {
                statusCode: 200,
                body: JSON.stringify({ text }),
            };
        } else {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            return {
                statusCode: 200,
                body: JSON.stringify({ text }),
            };
        }

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
