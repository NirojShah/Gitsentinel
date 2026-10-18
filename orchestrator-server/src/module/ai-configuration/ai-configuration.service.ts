import type AiConfigurationRepository from "./ai-configuration.repository.js";

class AiConfigurationService {
    constructor(private readonly prismaRepository: AiConfigurationRepository) {

    }
}

export default AiConfigurationService;