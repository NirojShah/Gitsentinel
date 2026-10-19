import type ResponseDto from "../../constants/ResponseDto.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type AiConfigurationRepository from "./ai-configuration.repository.js";


interface AiConfigurationServiceI {
    createAiConfiguration(payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto>
    updateAiConfiguration(configurationId: string, payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto>
    getAIConfigurationByUserId(userId: string, page: number, limit: number): Promise<ResponseDto>
}

class AiConfigurationService {
    constructor(private readonly prismaRepository: AiConfigurationRepository) {

    }
}

export default AiConfigurationService;