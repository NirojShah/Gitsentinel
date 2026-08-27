import type ResponseDto from "../../constants/ResponseDto.js";
import StatusCode from "../../constants/StatusCode.js";
import type ChatModel from "./chat.model.js";
import ChatRepository from "./chat.repository.js";

interface ChatService {
    createChat(data: ChatModel.CreateChat): Promise<ResponseDto>;
    findChatById(id: string): Promise<ResponseDto>;
    updateChat(
        id: string,
        data: ChatModel.UpdateChat
    ): Promise<ResponseDto>;
}

class ChatServiceImpl implements ChatService {
    private readonly chatRepository = new ChatRepository();
    async createChat(data: ChatModel.CreateChat): Promise<ResponseDto> {
        const isChatExists: boolean = await this.chatRepository.chatExistsByData(data);
        if (isChatExists) {
            return {
                statusCode: StatusCode.BAD_REQUEST,
                message: "The chat already exists."
            }
        }

        const resp = await this.chatRepository.save(data);

        return {
            statusCode: StatusCode.CREATED,
            message: "successfully chat created.",
            data: resp
        }

    }

    async findChatById(id: string): Promise<ResponseDto> {
        const chatExists: boolean = await this.chatRepository.chatExistsById(id)

        if (!chatExists) {
            return {
                statusCode: StatusCode.BAD_REQUEST,
                message: "no chat found by the provied id."
            }
        }

        const chat = await this.chatRepository.findById(id)

        return {
            statusCode: StatusCode.OK,
            data: chat
        }

    }

    async updateChat(id: string, data: ChatModel.UpdateChat): Promise<ResponseDto> {
        const chatExists: boolean = await this.chatRepository.chatExistsById(id)

        if (!chatExists) {
            return {
                statusCode: StatusCode.BAD_REQUEST,
                message: "Not chat cound by the provied id"
            }
        }

        const chat = await this.chatRepository.update(id, data)

        return {
            statusCode: StatusCode.OK,
            data: chat
        }
    }
}

export default ChatServiceImpl;