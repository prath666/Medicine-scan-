import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

// Simple .env parser
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GROQ_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("Could not find API Key in .env");
    process.exit(1);
}

console.log("Found API Key:", apiKey.substring(0, 10) + "...");

const groq = new Groq({ apiKey });

async function testGroq() {
    console.log("Testing Groq API...");
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Return a JSON object with a 'message' field saying 'Hello from Groq'."
                },
                {
                    role: "user",
                    content: "Test"
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        console.log("API Response:", completion.choices[0].message.content);
        console.log("✅ Groq API Connection Successful!");
    } catch (error) {
        console.error("❌ Groq API Error:", error);
    }
}

testGroq();
