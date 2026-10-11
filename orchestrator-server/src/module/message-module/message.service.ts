import type ResponseDto from "../../constants/ResponseDto.js";
import type { MessageCreateInput } from "../../generated/prisma/models.js";
import type MessageRepository from "./message.repository.js";

interface MessageServiceI {
    sendMessage(data: MessageCreateInput): Promise<ResponseDto>;
    deleteMessage(messageId: string): Promise<ResponseDto>;
    messagesByChatId(chatId: string): Promise<ResponseDto>;
}

class MessageService implements MessageServiceI {
    private readonly messageRepository: MessageRepository;

    constructor(messageRepository: MessageRepository) {
        this.messageRepository = messageRepository;
    }

    async sendMessage(data: MessageCreateInput): Promise<ResponseDto> {
        try {
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

    async deleteMessage(messageId: string): Promise<ResponseDto> {
        try {
            
        } catch (error) {
            throw error;
        }
    }

    async messagesByChatId(chatId: string): Promise<ResponseDto> {
        try {
        } catch (error) {
            throw error;
        }
    }
}

export default MessageService;