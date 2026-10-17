import Anthropic from "@anthropic-ai/sdk";

import type {
    ModelFunctions,
    ModelRequest,
    ModelResponse
} from "../interface/model.interface.js";

const ANTHROPIC_API_KEY = "YOUR_ANTHROPIC_API_KEY";

class ClaudeApi implements ModelFunctions {
    private readonly client: Anthropic;

    constructor() {
        this.client = new Anthropic({
            apiKey: ANTHROPIC_API_KEY
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
                    role: message.role === "assistant"
                        ? "assistant" as const
                        : "user" as const,
                    content: message.content
                }));

            const response = await this.client.messages.create({
                model,
                max_tokens: 4096,
                messages: conversationMessages,
                ...(systemMessage && {
                    system: systemMessage.content
                })
            });

            const content = response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text)
                .join("\n");

            if (!content) {
                throw new Error("Claude returned an empty response.");
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
