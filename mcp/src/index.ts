import express from "express";
import type { Express } from "express";
import http from "node:http";
import setupEnvironment from "./utility/env.setup.js";
import { handleConnection } from "./service/mcp.connection.js";
import DatabaseConnection from "./utility/db.connection.js";
import GitRepository from "./repository/git.repository.js";


const currentEnv: "dev" | "prod" | "test" = process.env.NODE_ENV === "prod" ||
    process.env.NODE_ENV === "test"
    ? process.env.NODE_ENV : "dev";

setupEnvironment(currentEnv);

const app: Express = express();

app.use(express.json(),);

app.all("/mcp", async (req, res) => {
    await handleConnection(req, res,);
});


app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "GIT MCP SERVER",
    });
});


const server = http.createServer(app);

async function main(): Promise<void> {
    try {
        const database = new DatabaseConnection();

        const connected = await database.connectToDatabase();

        if (!connected) {
            throw new Error("Failed to connect to database");
        }

        const gitRepository = new GitRepository(
            database.getClient()
        );

        // Create/register your MCP tools using gitRepository
        // const mcpTools = new McpTools(server, gitRepository);
        // mcpTools.Testing();

        const port = Number(process.env.MCP_SERVER_PORT) || 5000;
        const host = process.env.HOST || "127.0.0.1";

        server.listen(port, host, () => {
            console.log(`MCP endpoint: http://${host}:${port}/mcp`);
            console.log(`Health check: http://${host}:${port}/health`);
        });
    } catch (error) {
        const err = error as Error;
        console.error(err.message);
        process.exit(1);
    }
}


main().catch((error) => {
    console.error("Failed to start MCP server:", error,);

    process.exit(1);
});