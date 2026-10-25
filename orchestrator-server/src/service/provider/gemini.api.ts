import { GoogleGenAI } from "@google/genai";

import type {
    ModelFunctions,
    ModelRequest,
    ModelResponse
} from "../interface/model.interface.js";
import { randomUUID } from "node:crypto";

class GeminiApi implements ModelFunctions {
    private readonly client: GoogleGenAI;

    constructor(apiKey: string) {
        this.client = new GoogleGenAI({
            apiKey
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
                .map((message) => {
                    if (message.role === "tool") {
                        return {
                            role: "user" as const,
                            parts: [{
                                functionResponse: {
                                    name: message.name,
                                    response: { result: message.content },
                                },
                            }],
                        };
                    }
                    if (message.toolCalls?.length) {
                        return {
                            role: "model" as const,
                            parts: message.toolCalls.map((call) => ({
                                functionCall: { name: call.name, args: call.arguments, id: call.id },
                            })),
                        };
                    }
                    return {
                        role: message.role === "assistant" ? "model" as const : "user" as const,
                        parts: [{ text: message.content }],
                    };
                });

            const response = await this.client.models.generateContent({
                model,
                contents: conversationMessages,
                config: {
                    ...(systemMessage && { systemInstruction: systemMessage.content }),
                    ...(request.tools?.length && {
                        tools: [{
                            functionDeclarations: request.tools.map((tool) => ({
                                name: tool.name,
                                description: tool.description,
                                parametersJsonSchema: tool.inputSchema,
                            })),
                        }],
                    }),
                },
            });

            const content = response.text;
            return {
                content: content || null,
                toolCalls: (response.functionCalls ?? []).flatMap((call) => {
                    if (!call.name) return [];
                    if (typeof call.args !== "object" || call.args === null || Array.isArray(call.args)) {
                        throw new Error("Gemini returned tool-call arguments that are not an object.");
                    }
                    return [{
                        id: call.id || randomUUID(),
                        name: call.name,
                        arguments: call.args as Record<string, unknown>,
                    }];
                }),
            };
        } catch (error: unknown) {
            console.error("Gemini API error:", error);

            throw new Error(
                "Failed to generate a response from Gemini."
            );
        }
    }
}

export default GeminiApi;
