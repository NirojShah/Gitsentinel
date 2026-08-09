import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import MCPUtility from "./mcp.utility.js";
import { createMcpServer } from "./mcp.server.js";


export async function handleConnection(req: ExpressRequest, res: ExpressResponse): Promise<void> {
    try {
        console.log(`MCP ${req.method} ${req.originalUrl}`,);

        const webRequest = MCPUtility.createWebRequest(req);

        // Create a NEW MCP server for this connection
        const mcpServer =
            createMcpServer();

        // Create a NEW transport
        const transport =
            new WebStandardStreamableHTTPServerTransport();

        // Connect this server to this transport
        await mcpServer.connect(transport,);

        // Handle request
        const webResponse = await transport.handleRequest(webRequest,);

        // Copy status
        res.status(webResponse.status,);

        // Copy headers
        webResponse.headers.forEach((value, key) => {
            res.setHeader(key, value,);
        });

        // Copy body
        if (!webResponse.body) {
            res.end();
            return;
        }

        const reader = webResponse.body.getReader();

        try {
            while (true) {
                const { done, value, } = await reader.read();

                if (done) {
                    break;
                }

                if (value) {
                    res.write(Buffer.from(value));
                }
            }
        } finally {
            reader.releaseLock();
        }

        res.end();
    } catch (error) {
        console.error("MCP Error:", error);

        if (!res.headersSent) {
            res.status(500).json({ error: "Internal MCP Server Error", });
        } else {
            res.end();
        }
    }
}