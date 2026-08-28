import type { Request, Response } from "express";
import type ChatServiceImpl from "./chat.service.js";
import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import CustomError from "../../constants/CustomError.js";
import ChatModel from "./chat.model.js";
import StatusCode from "../../constants/StatusCode.js";

class ChatController {
    constructor(private readonly chatService: ChatServiceImpl) {
    }
    async createChat(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const result = ChatModel.CreateChatSchema.safeParse(req.body)

        if (!result.success) {
            throw new CustomError(
                StatusCode.BAD_REQUEST,
                result.error.message
            );
        }

        const response = await this.chatService.createChat(result.data);

        return res.status(response.statusCode).json({
            data: response.data,
            message: response.message
        })
    }

    async updateChat(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const result = ChatModel.UpdateChatSchema.safeParse(req.body)

        if (!result.success) {
            throw new CustomError(
                StatusCode.BAD_REQUEST,
                result.error.message
            )
        }

        const response = await this.chatService.updateChat(result.data)

        return res.status(response.statusCode).json({
            data: response.data,
            message: response.message
        })
    }

    async findChat(req: AuthenticatedRequest, res: Response): Promise<Response> {
        throw new Error("not implemented.")
    }

    async findMyChat(req: AuthenticatedRequest, res: Response): Promise<Response> {
        throw new Error("not implemented.")
    }
}

export default ChatController;