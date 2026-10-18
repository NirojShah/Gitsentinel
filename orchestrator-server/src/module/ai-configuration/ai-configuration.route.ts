import { Router } from "express";
import { Router as AiConfigurationRouter } from "express";
import AiConfigurationController from "./ai-configuration.controller.js";
import AiConfigurationService from "./ai-configuration.service.js";
import AiConfigurationRepository from "./ai-configuration.repository.js";
import { AiConfigurationControllerType, type AiConfigurationRepositoryType, type AiConfigurationServiceType } from "./ai-configuration.model.js";

const aiConfigurationRouter: AiConfigurationRouter = Router();

const aiConfigurationReposotory: AiConfigurationRepositoryType = new AiConfigurationRepository()
const aiConfigurationService: AiConfigurationServiceType = new AiConfigurationService(aiConfigurationReposotory);
const aiConfigurationController: AiConfigurationControllerType = new AiConfigurationController(aiConfigurationService);


export default aiConfigurationRouter;