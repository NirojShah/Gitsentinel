export interface ModelMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface ModelRequest {
    apiKey: string,
    provider: string,
    model: string,
    messages: ModelMessage[]
}

export interface ModelResponse {
    content: string | null;
    toolCalls?: ModelToolCall[];
}

export interface ModelToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

export interface ModelFunctions {
    sendMessage(
        request: ModelRequest
    ): Promise<ModelResponse>;
}
