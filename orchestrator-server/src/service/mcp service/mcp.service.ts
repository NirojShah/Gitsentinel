import McpClient from "../mcp client/mcp.client.js";
import { HttpClientTransport, type HttpClientTransportOptions } from "@modelcontextprotocol/sdk/client/http.js";

class McpService {
    private static isConnected: boolean = false;
    private static transport: HttpClientTransport | null = null;

    static async connectToMcpServer(): Promise<void> {
        if (this.isConnected) {
            console.log("MCP service already connected");
            return;
        }

        try {
            const mcpServerUrl = process.env.MCP_SERVER_URL || "http://127.0.0.1:5001/mcp";
            const mcpAuthSecret = process.env.MCP_AUTH_SECRET;

            if (!mcpAuthSecret) {
                throw new Error("MCP_AUTH_SECRET environment variable is not set");
            }

            const options: HttpClientTransportOptions = {
                url: mcpServerUrl,
                headers: {
                    "Authorization": `Bearer ${mcpAuthSecret}`,
                    "Content-Type": "application/json"
                }
            };

            this.transport = new HttpClientTransport(options);
            await McpClient.connect(this.transport);
            this.isConnected = true;
            console.log("Successfully connected to MCP server at:", mcpServerUrl);
        } catch (error) {
            console.error("Failed to connect to MCP server:", error);
            throw error;
        }
    }

    static async getAvailableTools() {
        if (!this.isConnected) {
            await this.connectToMcpServer();
        }

        return await McpClient.getTools();
    }

    static async executeTool(toolName: string, args: Record<string, unknown>) {
        if (!this.isConnected) {
            await this.connectToMcpServer();
        }

        return await McpClient.callTool(toolName, args);
    }

    static async disconnect(): Promise<void> {
        if (!this.isConnected) {
            return;
        }

        await McpClient.disconnect();
        this.isConnected = false;
        this.transport = null;
        console.log("Disconnected from MCP server");
    }

    static getConnectionStatus(): boolean {
        return this.isConnected;
    }
}

export default McpService;
