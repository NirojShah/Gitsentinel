import type AuthenticatedRequest from "../../constants/AuthenticatedRequest.type.js";
import CustomError from "../../constants/CustomError.js";
import type MessageService from "./message.service.js";
import type { Response, Request } from "express";

class MessageController {
    constructor(private readonly messageService: MessageService) {
    }

    async sendMessage(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const body: unknown = req.body;
        if (typeof body !== "object" || body === null || !("chatId" in body) || !("content" in body)) {
            throw new CustomError(400, "A chat ID and non-empty message content are required.");
        }

        const { chatId, content } = body;
        if (typeof chatId !== "string" || !chatId.trim() ||
            typeof content !== "string" || !content.trim()) {
            throw new CustomError(400, "A chat ID and non-empty message content are required.");
        }

        const userId = req.user.userId;
        const response = await this.messageService.sendMessage(
            { chatId, content, sender: userId },
            userId,
        );
        if (response.statusCode != 201) {
            throw new CustomError(response.statusCode, response.message || "something went wrong.");
        }
        return res.status(response.statusCode).json({
            body: response.data,
            message: response.message
        })
    }

    async deleteMessage(req: AuthenticatedRequest, res: Response): Promise<Response> {
        const chatId = req.params.chatId;
        const messageId = req.query.messageId;
        if (typeof chatId !== "string" || !chatId || typeof messageId !== "string" || !messageId) {
            throw new CustomError(400, "Chat ID and message ID are required.");
        }
        const userId: string = req.user.userId;

        const response = await this.messageService.deleteMessage(messageId, chatId, userId)

        if (response.statusCode != 204) {
            throw new CustomError(response.statusCode, response.message || "something went wrong.")
        }

        return res.status(response.statusCode).json({
            body: response.data,
            message: response.message
        })
    }

    async fetchMessageByChatId(req: AuthenticatedRequest, res: Response): Promise<Response> {

        const userId: string = req.user.userId;
        const chatId: string = req.params.chatId as string;
        const limit = req.query.limit === undefined ? 50 : Number(req.query.limit);
        const page = req.query.page === undefined ? 1 : Number(req.query.page);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(page) || page < 1) {
            throw new CustomError(400, "Page must be positive and limit must be between 1 and 100.");
        }

        const response = await this.messageService.messagesByChatId(chatId, userId, limit, page)

        if (response.statusCode != 200) {
            throw new CustomError(response.statusCode, response.message || "something went wrong.")
        }

        return res.status(response.statusCode).json({
            body: response.data,
            message: response.message
        })
    }
}

export default MessageController;