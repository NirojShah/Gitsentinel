import { prisma } from "../../../prisma/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

class AiConfigurationRepository {
    async createConfiguration(payload: Prisma.AiconfigurationCreateInput) {
        const configuration = await prisma.aiconfiguration.create({
            data: payload,
        });

        return configuration;
    }
}

export default AiConfigurationRepository;