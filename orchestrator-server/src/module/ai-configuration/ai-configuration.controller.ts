import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import type AiConfigurationService from "./ai-configuration.service.js";
class AiConfigurationController {
    constructor(private readonly aiService: AiConfigurationService) {

    }

    async createConfiguration(req: AuthenticatedRequest, res: Response): Promise<Response> {
        throw new Error("not implemented.")
    }

    async getConfiguration(req: AuthenticatedRequest, res: Response): Promise<Response> {
        throw new Error("not implemented.")
    }

    async updateConfiguration(req: AuthenticatedRequest, res: Response): Promise<Response> {
        throw new Error("not implemented.")
    }
}

export default AiConfigurationController;