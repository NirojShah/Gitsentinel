import CustomError from "../../constants/CustomError.js";
import type ResponseDto from "../../constants/ResponseDto.js";
import type { Prisma } from "../../generated/prisma/client.js";
import type MessageRepository from "./message.repository.js";
import StatusCode from "../../constants/StatusCode.js";

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

            const message = await this.messageRepository.save(data);

            return {
                statusCode: 201,
                message: "Message sent successfully",
                data: message,
            };
        } catch (error) {
            throw error;
        }
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