import OpenAI from "openai";

import type {
    ModelFunctions,
    ModelRequest,
    ModelResponse
} from "../interface/model.interface.js";

class OpenAiApi implements ModelFunctions {
    private readonly client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey
        });
    }

    async sendMessage(
        request: ModelRequest
    ): Promise<ModelResponse> {
        try {
            const { messages, model } = request;

            // Extract the system message
            const systemMessage = messages.find(
                (message) => message.role === "system"
            );

            // Convert the remaining messages into OpenAI's format
            const conversationMessages = messages
                .filter((message) => message.role !== "system")
                .map((message) => ({
                    role: message.role as "user" | "assistant",
                    content: message.content
                }));

            // Generate the response
            const response = await this.client.responses.create({
                model,
                instructions: systemMessage?.content,
                input: conversationMessages
            });

            const content = response.output_text;

            // Handle an empty response
            if (!content) {
                return { content: null };
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