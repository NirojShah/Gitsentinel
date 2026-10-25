import { Router } from "express";
import type { Request, Response } from "express";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import McpController from "./mcp.controller.js";

const mcpRouter = Router();
const mcpController = new McpController();

const authenticated = (request: Request): AuthenticatedRequest => request as AuthenticatedRequest;

mcpRouter.get("/status", (req: Request, res: Response) => mcpController.getStatus(authenticated(req), res));
mcpRouter.get("/tools", (req: Request, res: Response) => mcpController.getTools(authenticated(req), res));
mcpRouter.post("/execute", (req: Request, res: Response) => mcpController.executeTool(authenticated(req), res));
mcpRouter.post("/connect", (req: Request, res: Response) => mcpController.connect(authenticated(req), res));
mcpRouter.post("/disconnect", (req: Request, res: Response) => mcpController.disconnect(authenticated(req), res));

export default mcpRouter;
