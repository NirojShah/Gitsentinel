import type ResponseDto from "../../constants/ResponseDto.js";
import CustomError from "../../constants/CustomError.js";
import StatusCode from "../../constants/StatusCode.js";
import type ChatModel from "./chat.model.js";
import ChatRepository from "./chat.repository.js";

interface ChatService {
    createChat(data: ChatModel.CreateChat): Promise<ResponseDto>;
    findChatById(id: string, userId: string): Promise<ResponseDto>;
    findChatByUserId(userId: string): Promise<ResponseDto>;
    updateChat(data: ChatModel.UpdateChat, userId: string): Promise<ResponseDto>;
    deleteChat(chatId: string, userId: string): Promise<ResponseDto>;
}

class ChatServiceImpl implements ChatService {
    private readonly chatRepository = new ChatRepository();
    async createChat(data: ChatModel.CreateChat): Promise<ResponseDto> {
        if (!(await this.chatRepository.repoBelongsToUser(data.repoId, data.userId))) {
            throw new CustomError(StatusCode.NOT_FOUND, "Repository not found.");
        }

        const resp = await this.chatRepository.save(data);

        return {
            statusCode: StatusCode.CREATED,
            message: "successfully chat created.",
            data: resp
        }

    }

    async findChatById(id: string, userId: string): Promise<ResponseDto> {
        const chatExists: boolean = await this.chatRepository.chatExistsById(id, userId)

        if (!chatExists) {
            return {
                statusCode: StatusCode.BAD_REQUEST,
                message: "no chat found by the provied id."
            }
        }

        const chat = await this.chatRepository.findById(id, userId)

        return {
            statusCode: StatusCode.OK,
            data: chat
        }

    }

    async findChatByUserId(userId: string): Promise<ResponseDto> {
        const chats = await this.chatRepository.findChatByUserId(userId);
        return {
            statusCode: StatusCode.OK,
            data: chats,
            message: chats.length == 0 ? "No chat present" : ""
        }
    }

    async updateChat(data: ChatModel.UpdateChat, userId: string): Promise<ResponseDto> {
        const chatExists: boolean = await this.chatRepository.chatExistsById(data.chatId, userId)

        if (!chatExists) {
            return {
                statusCode: StatusCode.BAD_REQUEST,
                message: "Not chat cound by the provied id"
            }
        }

        const chat = await this.chatRepository.update(data, userId)

        return {
            statusCode: StatusCode.OK,
            data: chat
        }
    }

    async deleteChat(chatId: string, userId: string): Promise<ResponseDto> {
        const chatExists: boolean = await this.chatRepository.chatExistsById(chatId, userId);

        if (!chatExists) {
            return {
                statusCode: StatusCode.NOT_FOUND,
                message: "No chat found by the provided id."
            };
        }

        await this.chatRepository.delete(chatId, userId);

        return {
            statusCode: StatusCode.OK,
            message: "Chat deleted successfully"
        };
    }
}

export default ChatServiceImpl;