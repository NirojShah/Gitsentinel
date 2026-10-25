import OpenAI from "openai";

import type {
    ModelFunctions,
    ModelRequest,
    ModelResponse
} from "../interface/model.interface.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions.js";

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

            const conversationMessages: ChatCompletionMessageParam[] = messages.map((message) => {
                if (message.role === "tool") {
                    return {
                        role: "tool",
                        tool_call_id: message.toolCallId,
                        content: message.content,
                    };
                }
                if (message.toolCalls?.length) {
                    return {
                        role: "assistant",
                        content: message.content || null,
                        tool_calls: message.toolCalls.map((call) => ({
                            id: call.id,
                            type: "function" as const,
                            function: {
                                name: call.name,
                                arguments: JSON.stringify(call.arguments),
                            },
                        })),
                    };
                }
                return { role: message.role, content: message.content };
            });

            const response = await this.client.chat.completions.create({
                model,
                messages: conversationMessages,
                ...(request.tools?.length && {
                    tools: request.tools.map((tool) => ({
                        type: "function" as const,
                        function: {
                            name: tool.name,
                            description: tool.description,
                            parameters: tool.inputSchema,
                        },
                    })),
                }),
            });

            const choice = response.choices[0]?.message;
            return {
                content: choice?.content ?? null,
                toolCalls: choice?.tool_calls?.flatMap((call) => {
                    if (call.type !== "function") return [];
                    try {
                        const parsed: unknown = JSON.parse(call.function.arguments);
                        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
                            throw new Error("OpenAI returned tool-call arguments that are not an object.");
                        }
                        return [{
                            id: call.id,
                            name: call.function.name,
                            arguments: parsed as Record<string, unknown>,
                        }];
                    } catch (error) {
                        throw new Error("OpenAI returned malformed tool-call arguments.", { cause: error });
                    }
                }),
            };
        } catch (error: unknown) {
            console.error("OpenAI API error:", error);

            throw new Error(
                "Failed to generate a response from OpenAI."
            );
        }
    }
}

export default OpenAiApi;