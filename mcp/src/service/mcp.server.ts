import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import Mcptools from "./mcp.server.tools.js";
import GitRepository from "../repository/git.repository.js";
import DatabaseConnection from "../utility/db.connection.js";
import type { Client } from "pg";

export async function createMcpServer(): Promise<McpServer> {
    const dbConnection = new DatabaseConnection();

    const server: McpServer = new McpServer({
        name: "GIT MCP SERVER",
        title: "GIT - HUB MCP",
        version: "0.0.1",
        description:
            "GIT SERVER MCP to get files, create commits, and raise pull requests.",
    });

    const dbClient: Client = await dbConnection.connectToDatabase()

    const gitRepository = new GitRepository(dbClient)


    const mcpTools = new Mcptools(server, gitRepository);

    mcpTools.RegisterGitFileFetch();
    mcpTools.registerGitCommitAndPrRaise();

    return server;
}