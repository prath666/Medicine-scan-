import Tesseract from 'tesseract.js';

/**
 * Processes an image file to extract text using OCR.
 * @param {File} imageFile - The image file to process.
 * @returns {Promise<string>} - The extracted text.
 */
export const processImageOCR = async (imageFile) => {
    try {
        const result = await Tesseract.recognize(
            imageFile,
            'eng',
            {
                logger: (m) => console.log(m), // Optional: log progress
            }
        );

        const text = result.data.text;

        // cleanup text: remove special chars, extra whitespace
        const cleanedText = text
            .replace(/[^a-zA-Z0-9\s]/g, ' ') // Remove non-alphanumeric noise
            .replace(/\s+/g, ' ')            // Collapse multiple spaces
            .trim();

        return cleanedText;
    } catch (error) {
        console.error("OCR Error:", error);
        throw new Error("Failed to process image.");
    }
};
