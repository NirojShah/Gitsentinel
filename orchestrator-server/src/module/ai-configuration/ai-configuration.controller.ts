import type { Response } from "express";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type AiConfigurationService from "./ai-configuration.service.js";
import { AI_PROVIDERS } from "./ai-configuration.model.js";

const isAiProvider = (provider: unknown): provider is (typeof AI_PROVIDERS)[number] =>
    typeof provider === "string" && AI_PROVIDERS.includes(provider as (typeof AI_PROVIDERS)[number]);

class AiConfigurationController {
    constructor(
        private readonly aiService: AiConfigurationService
    ) { }

    async createConfiguration(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const body: unknown = req.body;
            if (typeof body !== "object" || body === null) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "A supported provider and model are required.",
                });
            }

            const { model, provider, apiKey } = body as Record<string, unknown>;

            if (!isAiProvider(provider) || typeof model !== "string" || !model.trim() ||
                typeof apiKey !== "string" || !apiKey.trim()) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "A supported provider, model, and API key are required.",
                });
            }

            const userId = req.user.userId;

            const payload: Prisma.AiconfigurationCreateInput = {
                model: model.trim(),
                provider,
                apiKey: this.aiService.encryptApiKey(apiKey.trim()),
                user: {
                    connect: {
                        id: userId,
                    },
                },
            };

            const result = await this.aiService.createAiConfiguration(payload);

            return res.status(result.statusCode).json(result);
        } catch (err) {
            const error = err as Error;

            return res.status(500).json({
                statusCode: 500,
                message: error.message,
            });
        }
    }

    async getConfiguration(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response> {
        try {
            const userId: string = req.user.userId;
            const page = req.query.page === undefined ? 1 : Number(req.query.page);
            const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);

            if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Page must be positive and limit must be between 1 and 100.",
                });
            }

            const data = await this.aiService.getAIConfigurationByUserId(userId, page, limit);
            return res.status(data.statusCode).json(data);
        } catch (error) {
            const err = error as Error;
            return res.status(500).json({
                statusCode: 500,
                message: err.message,
            });
        }
    }

    async updateConfiguration(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const configurationId = req.params.configurationId;

            if (typeof configurationId !== "string") {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Invalid configuration ID",
                });
            }

            const body: unknown = req.body;
            if (typeof body !== "object" || body === null) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Provide a supported provider and/or a non-empty model.",
                });
            }

            const { model, provider, apiKey } = body as Record<string, unknown>;

            if (
                (model === undefined && provider === undefined && apiKey === undefined) ||
                (model !== undefined && (typeof model !== "string" || !model.trim())) ||
                (provider !== undefined && !isAiProvider(provider)) ||
                (apiKey !== undefined && (typeof apiKey !== "string" || !apiKey.trim()))
            ) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Provide a supported provider and/or a non-empty model.",
                });
            }

            const payload: Prisma.AiconfigurationUpdateManyMutationInput = {
                ...(model !== undefined && { model: model.trim() }),
                ...(provider !== undefined && { provider }),
                ...(apiKey !== undefined && { apiKey: this.aiService.encryptApiKey(apiKey.trim()) }),
            };

            const result = await this.aiService.updateAiConfiguration(
                configurationId,
                req.user.userId,
                payload
            );

            return res.status(result.statusCode).json(result);
        } catch (error) {
            const err = error as Error;

            return res.status(500).json({
                statusCode: 500,
                message: err.message,
            });
        }
    }
}

export default AiConfigurationController;