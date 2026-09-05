import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import 'dotenv/config';


// Define a common interface for LLM API implementations
export interface LLM_API {
    providerName: string;
    createConnection(): Promise<void>;
    generateText(prompt: string): Promise<string>;
}

// Gemini API implementation
export class GeminiAPI implements LLM_API {
    public readonly providerName = 'Gemini';
    private ai: GoogleGenAI | null = null;
    private modelName: string;

    constructor(modelName: string = 'gemini-2.5-flash') {
        this.modelName = modelName;
    }

    async createConnection(): Promise<void> {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set in environment variables.');
        }

        this.ai = new GoogleGenAI({ apiKey });
        console.log(`[${this.providerName}] Connection initialized.`);
    }

    async generateText(prompt: string): Promise<string> {
        if (!this.ai) {
            throw new Error('Connection not established. Call createConnection() first.');
        }

        const response = await this.ai.models.generateContent({
            model: this.modelName,
            contents: prompt,
        });

        return response.text || '';
    }
}

// Open AI API implementation
export class OpenAIAPI implements LLM_API {
    public readonly providerName = 'OpenAI';
    private client: OpenAI | null = null;
    private modelName: string;

    constructor(modelName: string = 'gpt-4o-mini') {
        this.modelName = modelName;
    }

    async createConnection(): Promise<void> {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error('OPENAI_API_KEY is not set in environment variables.');
        }

        this.client = new OpenAI({ apiKey });
        console.log(`[${this.providerName}] Connection initialized.`);
    }

    async generateText(prompt: string): Promise<string> {
        if (!this.client) {
            throw new Error('Connection not established. Call createConnection() first.');
        }

        const response = await this.client.chat.completions.create({
            model: this.modelName,
            messages: [{ role: 'user', content: prompt }],
        });

        return response.choices[0]?.message?.content || '';
    }
}


// Function to send a request to the specified LLM API
export async function sendAIRequest(llmService: LLM_API, prompt: string): Promise<string> {
    try {
        await llmService.createConnection();
        console.log(`Sending prompt to ${llmService.providerName}...`);
        const response = await llmService.generateText(prompt);
        return response;
    } catch (error) {
        console.error(`Error sending request to ${llmService.providerName}:`, error);
        throw error;
    }
}