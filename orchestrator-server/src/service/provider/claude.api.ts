import Anthropic from "@anthropic-ai/sdk";

import type {
    ModelFunctions,
    ModelRequest,
    ModelResponse
} from "../interface/model.interface.js";

class ClaudeApi implements ModelFunctions {
    private readonly client: Anthropic;

    constructor(apiKey: string) {
        this.client = new Anthropic({
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

            // Convert the remaining messages into Claude's format
            const conversationMessages = messages
                .filter((message) => message.role !== "system")
                .map((message) => ({
                    role:
                        message.role === "assistant"
                            ? "assistant" as const
                            : "user" as const,
                    content: message.content
                }));

            // Generate the response
            const response = await this.client.messages.create({
                model,
                max_tokens: 4096,
                messages: conversationMessages,
                ...(systemMessage && {
                    system: systemMessage.content
                })
            });

            // Extract text blocks from the response
            const content = response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text)
                .join("\n");

            // Handle an empty response
            if (!content) {
                return { content: null };
            }

            return { content };
        } catch (error: unknown) {
            console.error("Claude API error:", error);

            throw new Error(
                "Failed to generate a response from Claude."
            );
        }
    }
}

export default ClaudeApi;