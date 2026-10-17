import type { ModelFunctions, ModelRequest } from "../interface/model.interface.js";
import OpenAiApi from "../provider/chatgpt.api.js";
import ClaudeApi from "../provider/claude.api.js";
import GeminiApi from "../provider/gemini.api.js";


class ModelFactory {
    static create(configuration: ModelRequest): ModelFunctions {
        switch (configuration.provider) {
            case "gemini":
                return new GeminiApi(configuration.apiKey);

            case "openai":
                return new OpenAiApi();

            case "claude":
                return new ClaudeApi();

            default:
                throw new Error(`Unsupported AI Provider: ${configuration.provider}`);
        }
    }
}

export default ModelFactory;