import { GoogleGenAI } from "@google/genai";

import type {
    ModelFunctions,
    ModelRequest,
    ModelResponse
} from "../interface/model.interface.js";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

class GeminiApi implements ModelFunctions {
    private readonly client: GoogleGenAI;

    constructor() {
        this.client = new GoogleGenAI({
            apiKey: GEMINI_API_KEY
        });
    }

    async sendMessage(
        request: ModelRequest
    ): Promise<ModelResponse> {
        try {
            const { messages, model } = request;

            const systemMessage = messages.find(
                (message) => message.role === "system"
            );

            const conversationMessages = messages
                .filter((message) => message.role !== "system")
                .map((message) => ({
                    role: message.role === "assistant" ? "model" as const : "user" as const,
                    parts: [{ text: message.content }]
                }));

            const response = await this.client.models.generateContent({
                model,
                contents: conversationMessages,
                ...(systemMessage && {
                    config: {
                        systemInstruction: systemMessage.content
                    }
                })
            });

            const content = response.text;

            if (!content) {
                throw new Error("Gemini returned an empty response.");
            }

            return { content };
        } catch (error: unknown) {
            console.error("Gemini API error:", error);

            throw new Error(
                "Failed to generate a response from Gemini."
            );
        }
    }
}

export default GeminiApi;
