import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import MCPUtility from "./mcp.utility.js";
import { createMcpServer } from "./mcp.server.js";
import type GitRepository from "../repository/git.repository.js";

export async function handleConnection(
    req: ExpressRequest,
    res: ExpressResponse,
    gitRepository: GitRepository,
): Promise<void> {
    let transport: WebStandardStreamableHTTPServerTransport | undefined;
    try {
        const webRequest = MCPUtility.createWebRequest(req);
        const mcpServer = createMcpServer(gitRepository);
        transport = new WebStandardStreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true,
        });
        await mcpServer.connect(transport);
        const webResponse = await transport.handleRequest(webRequest);

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
    } finally {
        if (transport) {
            try {
                await transport.close();
            } catch (error) {
                console.error("Failed to close MCP HTTP transport:", error);
            }
        }
    }
}