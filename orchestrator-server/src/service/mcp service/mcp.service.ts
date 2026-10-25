import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import McpClient from "../mcp client/mcp.client.js";

class McpService {
    private static isConnected = false;
    private static transport: StreamableHTTPClientTransport | null = null;
    private static connectionPromise: Promise<void> | null = null;

    static async connectToMcpServer(): Promise<void> {
        if (this.isConnected) return;
        if (this.connectionPromise) return this.connectionPromise;

        this.connectionPromise = this.connect();
        try {
            await this.connectionPromise;
        } finally {
            this.connectionPromise = null;
        }
    }

    private static async connect(): Promise<void> {
        const mcpServerUrl = process.env.MCP_SERVER_URL || "http://127.0.0.1:5001/mcp";
        const mcpAuthSecret = process.env.MCP_AUTH_SECRET;
        if (!mcpAuthSecret) {
            throw new Error("MCP_AUTH_SECRET environment variable is not set.");
        }

        const transport = new StreamableHTTPClientTransport(new URL(mcpServerUrl), {
            requestInit: {
                headers: { Authorization: `Bearer ${mcpAuthSecret}` },
            },
        });
        try {
            await McpClient.connect(transport);
            this.transport = transport;
            this.isConnected = true;
        } catch (error) {
            console.error("Failed to connect to MCP server:", error);
            try {
                await transport.close();
            } catch (closeError) {
                console.error("Failed to close an incomplete MCP transport:", closeError);
            }
            throw error;
        }
    }

    static async getAvailableTools() {
        if (!this.isConnected) await this.connectToMcpServer();
        return McpClient.getTools();
    }

    static async executeTool(toolName: string, args: Record<string, unknown>) {
        if (!this.isConnected) await this.connectToMcpServer();
        return McpClient.callTool(toolName, args);
    }

    static async disconnect(): Promise<void> {
        if (!this.isConnected) return;
        try {
            await McpClient.disconnect();
        } finally {
            this.isConnected = false;
            this.transport = null;
        }
    }

    static getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

export default McpService;
