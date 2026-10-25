import type { PrismaClient } from "../../generated/prisma/client.js";
import type { Prisma } from "../../generated/prisma/client.js";

class MessageRepository {
    constructor(private readonly prisma: PrismaClient) { }

    async save(data: Prisma.MessageUncheckedCreateInput) {
        return await this.prisma.message.create({
            data,
        });
    }

    async findByChatId(id: string, limit: number = 50, page: number = 1) {
        const offset: number = (page - 1) * limit;
        return await this.prisma.message.findMany({
            where: {
                chatId: id,
            },
            orderBy: {
                createdAt: "asc",
            },
            skip: offset,
            take: limit
        });
    }

    async getChatContext(chatId: string, userId: string) {
        return this.prisma.chat.findFirst({
            where: { id: chatId, userId },
            select: {
                id: true,
                chatName: true,
                repoId: true,
                gitRepo: {
                    select: {
                        repoUrl: true,
                        baseBranch: true,
                    },
                },
            },
        });
    }

    async getConversationHistory(chatId: string, limit = 20) {
        const messages = await this.prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
        return messages.reverse();
    }

    async delete(id: string, chatId: string, userId: string) {
        return await this.prisma.message.delete({
            where: {
                id: id,
                chatId: chatId,
                sender: userId
            }
        })
    }

    async chatBelongsToUser(userId: string, chatId: string): Promise<boolean> {
        const exists = await this.prisma.chat.findFirst({
            where: {
                id: chatId,
                userId,
            },
            select: {
                id: true,
            }
        });

        return exists !== null;
    }
}

export default MessageRepository;