// Utility to convert File to Base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Processes an image file to extract medicine name using Gemini Vision.
 * @param {File} imageFile - The image file to process.
 * @returns {Promise<string|null>} - The extracted medicine name.
 */
export const processImageOCR = async (imageFile) => {
    try {
        console.log("📸 Processing image with Gemini Vision...");

        // 1. Convert image to Base64
        const base64String = await fileToBase64(imageFile);

        // Ensure the base64 string doesn't include the data:image/jpeg;base64, prefix for Gemini
        // We'll extract MIME type and the raw base64 data to construct the proper object Gemini expects
        const mimeType = imageFile.type;
        const base64Data = base64String.split(',')[1];

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const prompt = `You are an expert pharmacist and OCR assistant. Look at this medicine box image and extract ONLY the primary medicine brand name.
        
CRITICAL RULES:
1. Return EXACTLY the brand name and nothing else. No extra words, no explanations.
2. If you see the dosage (e.g., 650, 500mg), include it (e.g., "Dolo 650").
3. Do not include random letters or garbage text.
4. If you cannot clearly read any medicine name, return exactly "NULL_MEDICINE".`;

        // 2. Call our unified Gemini Netlify Function
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                image: imagePart
            }),
        });

        if (!response.ok) {
            throw new Error(`Gemini Vision failed: ${response.statusText}`);
        }

        const data = await response.json();
        let extractedName = data.text?.trim();

        console.log("🧠 Gemini Vision extracted:", extractedName);

        if (!extractedName || extractedName === "NULL_MEDICINE" || extractedName.toLowerCase() === "null") {
            return null;
        }

        // Clean up markdown quotes if Gemini accidentally adds them
        extractedName = extractedName.replace(/^["']|["']$/g, '').trim();

        return extractedName;
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Failed to process image.");
    }
};
