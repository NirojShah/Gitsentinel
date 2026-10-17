import OpenAI from "openai";

import type {
    ModelFunctions,
    ModelRequest,
    ModelResponse
} from "../interface/model.interface.js";

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

class OpenAiApi implements ModelFunctions {
    private readonly client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: OPENAI_API_KEY
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
                    role: message.role as "user" | "assistant",
                    content: message.content
                }));

            const response = await this.client.responses.create({
                model,
                instructions: systemMessage?.content,
                input: conversationMessages
            });

            const content = response.output_text;

            if (!content) {
                throw new Error("OpenAI returned an empty response.");
            }

            return { content };
        } catch (error: unknown) {
            console.error("OpenAI API error:", error);

            throw new Error(
                "Failed to generate a response from OpenAI."
            );
        }
    }
}

export default OpenAiApi;
