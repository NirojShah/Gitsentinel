import type { Response } from "express";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type AiConfigurationService from "./ai-configuration.service.js";

class AiConfigurationController {
    constructor(
        private readonly aiService: AiConfigurationService
    ) { }

    async createConfiguration(req: AuthenticatedRequest, res: Response): Promise<Response> {
        try {
            const { model, provider } = req.body;
            const userId = req.user.userId;

            const payload: Prisma.AiconfigurationCreateInput = {
                model,
                provider,
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
            const page: number = Number(req.query.page);
            const limit: number = Number(req.query.limit);
            const data = await this.aiService.getAIConfigurationByUserId(userId, page, limit)
            return res.status(data.statusCode).json(data)
        } catch (error) {
            const err = error as Error;
            return res.status(500).json({
                message: err.message,
                stackTrace: err.stack
            })
        }
    }

    async updateConfiguration(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<Response> {
        throw new Error("not implemented.");
    }
}

export default AiConfigurationController;