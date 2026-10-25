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
            const conversationMessages: Anthropic.MessageParam[] = messages
                .filter((message) => message.role !== "system")
                .map((message) => {
                    if (message.role === "tool") {
                        return {
                            role: "user",
                            content: [{
                                type: "tool_result",
                                tool_use_id: message.toolCallId,
                                content: message.content,
                            }],
                        };
                    }
                    if (message.toolCalls?.length) {
                        return {
                            role: "assistant",
                            content: [
                                ...(message.content ? [{ type: "text" as const, text: message.content }] : []),
                                ...message.toolCalls.map((call) => ({
                                    type: "tool_use" as const,
                                    id: call.id,
                                    name: call.name,
                                    input: call.arguments,
                                })),
                            ],
                        };
                    }
                    return {
                        role: message.role,
                        content: message.content,
                    };
                });

            // Generate the response
            const response = await this.client.messages.create({
                model,
                max_tokens: 4096,
                messages: conversationMessages,
                ...(request.tools?.length && {
                    tools: request.tools.map((tool) => ({
                        name: tool.name,
                        description: tool.description,
                        input_schema: { type: "object", ...tool.inputSchema },
                    })),
                }),
                ...(systemMessage && {
                    system: systemMessage.content
                })
            });

            const content = response.content
                .filter((block) => block.type === "text")
                .map((block) => block.text)
                .join("\n");
            return {
                content: content || null,
                toolCalls: response.content.flatMap((block) => {
                    if (block.type !== "tool_use") return [];
                    if (typeof block.input !== "object" || block.input === null || Array.isArray(block.input)) {
                        throw new Error("Anthropic returned tool-call arguments that are not an object.");
                    }
                    return [{ id: block.id, name: block.name, arguments: block.input as Record<string, unknown> }];
                }),
            };
        } catch (error: unknown) {
            console.error("Claude API error:", error);

            throw new Error(
                "Failed to generate a response from Claude."
            );
        }
    }
}

export default ClaudeApi;