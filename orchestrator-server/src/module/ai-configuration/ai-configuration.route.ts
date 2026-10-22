import { Router } from "express";
import type { Request, Response } from "express";
import AiConfigurationController from "./ai-configuration.controller.js";
import AiConfigurationService from "./ai-configuration.service.js";
import AiConfigurationRepository from "./ai-configuration.repository.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";

const aiConfigurationRouter = Router();

const aiConfigurationRepository = new AiConfigurationRepository();
const aiConfigurationService = new AiConfigurationService(aiConfigurationRepository);
const aiConfigurationController = new AiConfigurationController(aiConfigurationService);

aiConfigurationRouter.post("/", async (req: Request, res: Response) =>
    aiConfigurationController.createConfiguration(req as AuthenticatedRequest, res));
aiConfigurationRouter.get("/", async (req: Request, res: Response) =>
    aiConfigurationController.getConfiguration(req as AuthenticatedRequest, res));
aiConfigurationRouter.put("/:configurationId", async (req: Request, res: Response) =>
    aiConfigurationController.updateConfiguration(req as AuthenticatedRequest, res));

export default aiConfigurationRouter;