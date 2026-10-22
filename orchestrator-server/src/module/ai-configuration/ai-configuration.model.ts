import type AiConfigurationController from "./ai-configuration.controller.js";
import type AiConfigurationRepository from "./ai-configuration.repository.js";
import type AiConfigurationService from "./ai-configuration.service.js";

export const AI_PROVIDERS = ["openai", "claude", "gemini"] as const;

export type AiConfigurationControllerType = AiConfigurationController;
export type AiConfigurationServiceType = AiConfigurationService;
export type AiConfigurationRepositoryType = AiConfigurationRepository;