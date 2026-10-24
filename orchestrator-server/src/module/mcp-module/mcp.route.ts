import { Router } from "express";
import McpController from "./mcp.controller.js";

const mcpRouter = Router();
const mcpController = new McpController();

mcpRouter.get("/status", (req, res) => mcpController.getStatus(req, res));
mcpRouter.get("/tools", (req, res) => mcpController.getTools(req, res));
mcpRouter.post("/execute", (req, res) => mcpController.executeTool(req, res));
mcpRouter.post("/connect", (req, res) => mcpController.connect(req, res));
mcpRouter.post("/disconnect", (req, res) => mcpController.disconnect(req, res));

export default mcpRouter;
