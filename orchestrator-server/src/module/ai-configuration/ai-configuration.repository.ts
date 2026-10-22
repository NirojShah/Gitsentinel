import { prisma } from "../../../prisma/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

class AiConfigurationRepository {
    async createConfiguration(payload: Prisma.AiconfigurationCreateInput) {
        const configuration = await prisma.aiconfiguration.create({
            data: payload,
        });

        return configuration;
    }

    async updateConfiguration(id: string, payload: Prisma.AiconfigurationUpdateInput) {
        const updateConfiguration = await prisma.aiconfiguration.update({
            where: {
                id: id
            },
            data: payload
        })
        return updateConfiguration;
    }

    async getConfigurationByUserId(userId: string, page: number, limit: number) {
        const configurations = await prisma.aiconfiguration.findMany({
            where: {
                userId: userId
            },
            skip: (page - 1) * limit,
            take: limit
        })

        return configurations;
    }

}

export default AiConfigurationRepository;