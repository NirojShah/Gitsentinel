export interface ModelMessage {
    role: "system" | "user" | "assistant";
    content: string;
    toolCalls?: ModelToolCall[];
}

export interface ModelToolResult {
    role: "tool";
    toolCallId: string;
    name: string;
    content: string;
}

export interface ModelRequest {
    apiKey: string;
    provider: string;
    model: string;
    messages: Array<ModelMessage | ModelToolResult>;
    tools?: ModelToolDefinition[];
}

export interface ModelToolDefinition {
    name: string;
    description?: string;
    inputSchema: Record<string, unknown>;
}

export interface ModelToolCall {
    id: string;
    name: string;
    arguments: Record<string, unknown>;
}

export interface ModelResponse {
    content: string | null;
    toolCalls?: ModelToolCall[];
}

export interface ModelFunctions {
    sendMessage(
        request: ModelRequest
    ): Promise<ModelResponse>;
}
