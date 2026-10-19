import type ResponseDto from "../../constants/ResponseDto.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type AiConfigurationRepository from "./ai-configuration.repository.js";


interface AiConfigurationServiceI {
    createAiConfiguration(payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto>
    updateAiConfiguration(configurationId: string, payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto>
    getAIConfigurationByUserId(userId: string, page: number, limit: number): Promise<ResponseDto>
}

class AiConfigurationService implements AiConfigurationServiceI {
    constructor(private readonly prismaRepository: AiConfigurationRepository) { }

    async createAiConfiguration(payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto> {
        const response = await this.prismaRepository.createConfiguration(payload);
        return {
            statusCode: 201,
            data: response
        }
    }
    updateAiConfiguration(configurationId: string, payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto> {
        throw new Error("Method not implemented.");
    }
    getAIConfigurationByUserId(userId: string, page: number, limit: number): Promise<ResponseDto> {
        throw new Error("Method not implemented.");
    }
}

export default AiConfigurationService;