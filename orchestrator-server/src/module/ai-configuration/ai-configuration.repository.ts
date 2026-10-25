import { prisma } from "../../../prisma/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

class AiConfigurationRepository {
    async createConfiguration(payload: Prisma.AiconfigurationCreateInput) {
        const configuration = await prisma.aiconfiguration.create({
            data: payload,
        });

        return configuration;
    }

    async updateConfiguration(id: string, userId: string, payload: Prisma.AiconfigurationUpdateManyMutationInput) {
        const updateResult = await prisma.aiconfiguration.updateMany({
            where: {
                id,
                userId,
            },
            data: payload
        });

        if (updateResult.count === 0) {
            return null;
        }

        return prisma.aiconfiguration.findFirst({
            where: {
                id,
                userId,
            },
        });
    }

    async getConfigurationByUserId(userId: string, page: number, limit: number) {
        const configurations = await prisma.aiconfiguration.findMany({
            where: {
                userId: userId
            },
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit
        })

        return configurations;
    }

    async getLatestConfigurationByUserId(userId: string) {
        return prisma.aiconfiguration.findFirst({
            where: { userId, apiKey: { not: null } },
            orderBy: { createdAt: "desc" },
        });
    }

}

export default AiConfigurationRepository;