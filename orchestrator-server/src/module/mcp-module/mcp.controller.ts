import type { Response } from "express";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import McpService from "../../service/mcp service/mcp.service.js";
import { prisma } from "../../../prisma/prisma.js";

class McpController {
    async getStatus(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const isConnected = McpService.getConnectionStatus();
            
            return res.status(200).json({
                status: "success",
                connected: isConnected,
                message: isConnected ? "MCP service is connected" : "MCP service is not connected"
            });
        } catch (error) {
            console.error("Failed to get MCP status:", error);
            return res.status(500).json({
                status: "error",
                message: "Failed to get MCP status"
            });
        }
    }

    async getTools(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const tools = (await McpService.getAvailableTools())
                .filter((tool) => tool.name === "githubfilefetch");
            
            return res.status(200).json({
                status: "success",
                data: tools,
                message: "MCP tools retrieved successfully"
            });
        } catch (error) {
            console.error("Failed to retrieve MCP tools:", error);
            return res.status(500).json({
                status: "error",
                message: "Failed to retrieve MCP tools"
            });
        }
    }

    async executeTool(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const body: unknown = req.body;
            if (typeof body !== "object" || body === null || Array.isArray(body)) {
                return res.status(400).json({ status: "error", message: "Tool name and arguments are required." });
            }

            const { toolName, args } = body as Record<string, unknown>;

            if (typeof toolName !== "string" || toolName !== "githubfilefetch") {
                return res.status(400).json({
                    status: "error",
                    message: "Only the read-only githubfilefetch tool is available through this endpoint."
                });
            }

            if (typeof args !== "object" || args === null || Array.isArray(args)) {
                return res.status(400).json({
                    status: "error",
                    message: "Tool arguments are required"
                });
            }

            const toolArgs = args as Record<string, unknown>;
            const repositoryId = toolArgs.repositoryId;
            if (typeof repositoryId !== "string" || !repositoryId) {
                return res.status(400).json({ status: "error", message: "A repository ID is required." });
            }

            const repository = await prisma.gitRepo.findFirst({
                where: { id: repositoryId, userId: req.user.userId },
                select: { id: true },
            });
            if (!repository) {
                return res.status(404).json({ status: "error", message: "Repository not found." });
            }

            const result = await McpService.executeTool(toolName, toolArgs);
            
            return res.status(200).json({
                status: "success",
                data: result,
                message: "Tool executed successfully"
            });
        } catch (error) {
            console.error("Failed to execute MCP tool:", error);
            return res.status(500).json({
                status: "error",
                message: "Failed to execute MCP tool"
            });
        }
    }

    async connect(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            await McpService.connectToMcpServer();
            
            return res.status(200).json({
                status: "success",
                message: "Successfully connected to MCP server"
            });
        } catch (error) {
            console.error("Failed to connect to MCP server:", error);
            return res.status(500).json({
                status: "error",
                message: "Failed to connect to MCP server"
            });
        }
    }

    async disconnect(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            await McpService.disconnect();
            
            return res.status(200).json({
                status: "success",
                message: "Successfully disconnected from MCP server"
            });
        } catch (error) {
            console.error("Failed to disconnect from MCP server:", error);
            return res.status(500).json({
                status: "error",
                message: "Failed to disconnect from MCP server"
            });
        }
    }
}

export default McpController;
