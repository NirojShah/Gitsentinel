import type ResponseDto from "../../constants/ResponseDto.js";
import type ChatModel from "./chat.model.js";

interface ChatService {
    createChat(data: ChatModel.createChat): Promise<ResponseDto>;
    findChatById(id: string): Promise<ResponseDto>;
    updateChat(id: string, data: ChatModel.updateChat): Promise<ResponseDto>;
}


export default ChatService;