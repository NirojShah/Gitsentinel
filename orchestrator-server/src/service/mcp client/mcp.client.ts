import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

class McpClient {
    private static client: Client | null = null;

    static async connect(transport: Transport): Promise<void> {
        if (this.client) {
            return;
        }

        const client = new Client({
            name: "ai-model-client",
            version: "1.0.0"
        });

        try {
            await client.connect(transport);
            this.client = client;
        } catch (error: unknown) {
            console.error("MCP connection error:", error);
            throw new Error("Failed to connect to the MCP server.");
        }
    }

    static async getTools() {
        if (!this.client) {
            throw new Error("MCP client is not connected.");
        }

        try {
            const response = await this.client.listTools();

            return response.tools;
        } catch (error: unknown) {
            console.error("Failed to retrieve MCP tools:", error);
            throw new Error("Failed to retrieve tools from the MCP server.");
        }
    }

    static async callTool(
        name: string,
        args: Record<string, unknown>
    ) {
        if (!this.client) {
            throw new Error("MCP client is not connected.");
        }

        try {
            return await this.client.callTool({
                name,
                arguments: args
            });
        } catch (error: unknown) {
            console.error(`Failed to execute MCP tool "${name}":`, error);

            throw new Error(`Failed to execute MCP tool "${name}".`);
        }
    }

    static async disconnect(): Promise<void> {
        if (!this.client) {
            return;
        }

        const client = this.client;
        this.client = null;

        try {
            await client.close();
        } catch (error: unknown) {
            console.error("Failed to disconnect MCP client:", error);
            throw new Error("Failed to disconnect from the MCP server.");
        }
    }
}

export default McpClient;