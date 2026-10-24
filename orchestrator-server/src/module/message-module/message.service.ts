import CustomError from "../../constants/CustomError.js";
import type ResponseDto from "../../constants/ResponseDto.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type MessageRepository from "./message.repository.js";
import StatusCode from "../../constants/StatusCode.js";
import McpService from "../../service/mcp service/mcp.service.js";

interface MessageServiceI {
    sendMessage(data: Prisma.MessageUncheckedCreateInput, userId: string): Promise<ResponseDto>;
    deleteMessage(messageId: string, chatId: string, userId: string): Promise<ResponseDto>;
    messagesByChatId(chatId: string, userId: string): Promise<ResponseDto>;
}

class MessageService implements MessageServiceI {
    private readonly messageRepository: MessageRepository;

    constructor(messageRepository: MessageRepository) {
        this.messageRepository = messageRepository;
    }

    async sendMessage(data: Prisma.MessageUncheckedCreateInput, userId: string): Promise<ResponseDto> {
        try {
            if (!(await this.messageRepository.chatBelongsToUser(userId, data.chatId))) {
                throw new CustomError(StatusCode.NOT_FOUND, "Chat not found.");
            }

            // Save user message
            const message = await this.messageRepository.save(data);

            // Check if MCP tools should be called based on message content
            // This is a simple heuristic - in production, use AI to determine tool calls
            const shouldCallMcp = this.shouldCallMcpTools(data.content);

            if (shouldCallMcp) {
                try {
                    // Get available MCP tools
                    const tools = await McpService.getAvailableTools();
                    console.log("Available MCP tools:", tools);

                    // For now, we'll just log the tools. In a full implementation,
                    // you would use AI to decide which tools to call and with what arguments
                    // Then execute them and include the results in the response

                    // Example of calling a tool (this would be dynamic based on AI decision):
                    // const toolResult = await McpService.executeTool("githubfilefetch", {
                    //     path: "package.json",
                    //     repositoryId: "repo-123"
                    // });

                    return {
                        statusCode: 201,
                        message: "Message sent successfully. MCP tools available.",
                        data: {
                            ...message,
                            mcpToolsAvailable: tools.map(t => ({ name: t.name, description: t.description }))
                        },
                    };
                } catch (mcpError) {
                    console.error("MCP error:", mcpError);
                    // Continue without MCP if it fails
                    return {
                        statusCode: 201,
                        message: "Message sent successfully (MCP unavailable)",
                        data: message,
                    };
                }
            }

            return {
                statusCode: 201,
                message: "Message sent successfully",
                data: message,
            };
        } catch (error) {
            throw error;
        }
    }

    private shouldCallMcpTools(content: string): boolean {
        // Simple heuristic to determine if MCP tools might be needed
        // In production, use AI to analyze the message and decide
        const mcpKeywords = ["file", "repository", "commit", "pull request", "pr", "github", "git", "code", "fix", "bug"];
        const lowerContent = content.toLowerCase();
        return mcpKeywords.some(keyword => lowerContent.includes(keyword));
    }

    async deleteMessage(messageId: string, chatId: string, userId: string): Promise<ResponseDto> {
        try {
            const message = await this.messageRepository.delete(messageId, chatId, userId);

            return {
                statusCode: 204,
                message: "Message deleted successfully",
                data: message,
            };
        } catch (error) {
            throw error;
        }
    }

    async messagesByChatId(chatId: string, userId: string, limit: number = 10, page: number = 1): Promise<ResponseDto> {
        try {
            const isExists = await this.messageRepository.chatBelongsToUser(userId, chatId)
            if (!isExists) {
                throw new CustomError(StatusCode.NOT_FOUND, "Chat not found.")
            }
            const messages = await this.messageRepository.findByChatId(chatId, limit, page);

            return {
                statusCode: 200,
                message: "Messages fetched successfully",
                data: messages,
            };
        } catch (error) {
            throw error;
        }
    }
}

export default MessageService;