import type ResponseDto from "../../constants/ResponseDto.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type AiConfigurationRepository from "./ai-configuration.repository.js";


interface AiConfigurationServiceI {
    createAiConfiguration(payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto>
    updateAiConfiguration(configurationId: string, payload: Prisma.AiconfigurationUpdateInput): Promise<ResponseDto>
    getAIConfigurationByUserId(userId: string, page: number, limit: number): Promise<ResponseDto>
}

class AiConfigurationService implements AiConfigurationServiceI {
    constructor(private readonly aiConfigurationRepository: AiConfigurationRepository) { }

    async createAiConfiguration(payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto> {
        try {

            const response = await this.aiConfigurationRepository.createConfiguration(payload);
            return {
                statusCode: 201,
                data: response
            }
        } catch (err) {
            const error: Error = err as Error
            return {
                statusCode: 500,
                message: error.message
            }
        }
    }
    async updateAiConfiguration(configurationId: string, payload: Prisma.AiconfigurationUpdateInput): Promise<ResponseDto> {
        try {
            const response = await this.aiConfigurationRepository.updateConfiguration(configurationId, payload);
            return {
                statusCode: 200,

                data: response
            }
        } catch (err) {
            const error: Error = err as Error;
            return {
                statusCode: 500,
                message: error.message
            }
        }
    }
    async getAIConfigurationByUserId(userId: string, page: number, limit: number): Promise<ResponseDto> {
        try {
            const response = await this.aiConfigurationRepository.getConfigurationByUserId(userId, page, limit)
            return {
                statusCode: 200,
                data: response
            }
        } catch (err) {
            const error: Error = err as Error;
            return {
                statusCode: 500,
                message: error.message
            }
        }
    }
}

export default AiConfigurationService;