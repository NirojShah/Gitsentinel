import type ResponseDto from "../../constants/ResponseDto.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type AiConfigurationRepository from "./ai-configuration.repository.js";
import { encryptAiKey } from "../../utility/ai-key-encryption.js";

interface StoredAiConfiguration {
    id: string;
    provider: string;
    model: string;
    apiKey: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

interface AiConfigurationServiceI {
    createAiConfiguration(payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto>;
    updateAiConfiguration(
        configurationId: string,
        userId: string,
        payload: Prisma.AiconfigurationUpdateManyMutationInput,
    ): Promise<ResponseDto>;
    getAIConfigurationByUserId(userId: string, page: number, limit: number): Promise<ResponseDto>;
}

class AiConfigurationService implements AiConfigurationServiceI {
    constructor(private readonly aiConfigurationRepository: AiConfigurationRepository) {}

    async createAiConfiguration(payload: Prisma.AiconfigurationCreateInput): Promise<ResponseDto> {
        try {
            const configuration = await this.aiConfigurationRepository.createConfiguration(payload);
            return { statusCode: 201, data: this.toPublicConfiguration(configuration) };
        } catch (error) {
            console.error("Failed to create AI configuration:", error);
            return { statusCode: 500, message: "Failed to create AI configuration." };
        }
    }

    async updateAiConfiguration(
        configurationId: string,
        userId: string,
        payload: Prisma.AiconfigurationUpdateManyMutationInput,
    ): Promise<ResponseDto> {
        try {
            const configuration = await this.aiConfigurationRepository.updateConfiguration(
                configurationId,
                userId,
                payload,
            );
            if (!configuration) {
                return { statusCode: 404, message: "AI configuration not found." };
            }
            return { statusCode: 200, data: this.toPublicConfiguration(configuration) };
        } catch (error) {
            console.error("Failed to update AI configuration:", error);
            return { statusCode: 500, message: "Failed to update AI configuration." };
        }
    }

    async getAIConfigurationByUserId(userId: string, page: number, limit: number): Promise<ResponseDto> {
        try {
            const configurations = await this.aiConfigurationRepository.getConfigurationByUserId(userId, page, limit);
            return {
                statusCode: 200,
                data: configurations.map((configuration) => this.toPublicConfiguration(configuration)),
            };
        } catch (error) {
            console.error("Failed to get AI configurations:", error);
            return { statusCode: 500, message: "Failed to retrieve AI configurations." };
        }
    }

    getLatestConfigurationByUserId(userId: string) {
        return this.aiConfigurationRepository.getLatestConfigurationByUserId(userId);
    }

    encryptApiKey(apiKey: string): string {
        return encryptAiKey(apiKey);
    }

    private toPublicConfiguration(configuration: StoredAiConfiguration) {
        const { apiKey, ...publicConfiguration } = configuration;
        return { ...publicConfiguration, hasApiKey: Boolean(apiKey) };
    }
}

export default AiConfigurationService;
