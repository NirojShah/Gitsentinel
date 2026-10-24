import type { Request, Response } from "express";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import McpService from "../../service/mcp service/mcp.service.js";

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
            return res.status(500).json({
                status: "error",
                message: "Failed to get MCP status"
            });
        }
    }

    async getTools(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const tools = await McpService.getAvailableTools();
            
            return res.status(200).json({
                status: "success",
                data: tools,
                message: "MCP tools retrieved successfully"
            });
        } catch (error) {
            return res.status(500).json({
                status: "error",
                message: "Failed to retrieve MCP tools"
            });
        }
    }

    async executeTool(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { toolName, args } = req.body;

            if (!toolName || typeof toolName !== "string") {
                return res.status(400).json({
                    status: "error",
                    message: "Tool name is required"
                });
            }

            if (!args || typeof args !== "object") {
                return res.status(400).json({
                    status: "error",
                    message: "Tool arguments are required"
                });
            }

            const result = await McpService.executeTool(toolName, args);
            
            return res.status(200).json({
                status: "success",
                data: result,
                message: "Tool executed successfully"
            });
        } catch (error) {
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
            return res.status(500).json({
                status: "error",
                message: "Failed to disconnect from MCP server"
            });
        }
    }
}

export default McpController;
