import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import CustomError from "../../constants/CustomError.js";
import type { MessageCreateInput } from "../../generated/prisma/models.js";
import type MessageService from "./message.service.js";
import type { Response, Request } from "express";

class MessageController {
    constructor(private readonly messageService: MessageService) {
    }

    async sendMessage(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const body = req.body;
        const userId: string = req.user.userId
        const payload: MessageCreateInput = { ...body, user: userId }
        const response = await this.messageService.sendMessage(payload)
        if (response.statusCode != 201) {
            throw new CustomError(response.statusCode, response.message || "something went wrong.");
        }
        return res.status(response.statusCode).json({
            body: response.data,
            message: response.message
        })
    }

    async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<Response> {
        throw new Error("Not implemented.")
    }

    async fetchMessageByChatId(req: AuthenticatedRequest, res: Response): Promise<Response> {
        throw new Error("Not implemented.")
    }
}

export default MessageController;