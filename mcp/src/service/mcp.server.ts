import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import Mcptools from "./mcp.server.tools.js";

export function createMcpServer(): McpServer {
    const server = new McpServer({
        name: "GIT MCP SERVER",
        title: "GIT - HUB MCP",
        version: "0.0.1",
        description:
            "GIT SERVER MCP to get files, create commits, and raise pull requests.",
    });

    const mcpTools = new Mcptools(server);

    mcpTools.RegisterGitFileFetch();
    mcpTools.registerGitCommitAndPrRaise();
    mcpTools.RegisterFetchFileTESTING();

    return server;
}