import { prisma } from "../../../prisma/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

class AiConfigurationRepository {
    async createConfiguration(payload: Prisma.AiconfigurationCreateInput) {
        const configuration = await prisma.aiconfiguration.create({
            data: payload,
        });

        return configuration;
    }

    async updateConfiguration(id: string, payload: Prisma.AiconfigurationUpdateArgs) {
        const updateConfiguration = await prisma.aiconfiguration.update({
            where: {
                id: id
            },
            data: payload
        })
        return updateConfiguration;
    }

}

export default AiConfigurationRepository;